package com.financeapp.core.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility for JWT token generation, parsing, and validation.
 *
 * Uses HMAC-SHA256 (HS256) via jjwt with a BASE64-encoded secret key.
 * HS256 was chosen over RS256/ES256 because:
 * - Single-service deployment (no need for key distribution)
 * - Faster token creation/verification (symmetric is ~10x faster)
 * - Simpler configuration (single env var instead of keypair files)
 *
 * Token claims:
 * - {@code sub}: userId (Lon  g) — primary identifier
 * - {@code email}: user email — for display/lookup without DB query
 * - {@code type}: "access" | "refresh" — enforces separation between auth token types
 * - {@code iss}: "financeapp" — identifies token origin
 * - {@code iat}/{@code exp}: issued/expiry timestamps
 *
 * Access tokens (24h) and refresh tokens (7d) share the same algorithm
 * but differ in expiry and the {@code type} claim. The
 * {@link com.financeapp.api.security.JwtAuthenticationFilter} rejects
 * refresh tokens at the API gateway to prevent misuse.
 *
 * The default/placeholder secret {@link #WEAK_SECRET_PLACEHOLDER} is
 * explicitly rejected at construction to prevent production deployments
 * with a guessable key. Generate a secure secret with:
 * {@code openssl rand -base64 64}
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);
    /** Default/base64 placeholder embedded during development; rejected in production. */
    private static final String WEAK_SECRET_PLACEHOLDER = "ZmluYW5jZWFwcC1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbi11c2Utb25seQ==";

    private final SecretKey key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final String issuer;

    public JwtUtil(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration,
            @Value("${app.jwt.issuer}") String issuer) {
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.issuer = issuer;

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required. Generate one with: openssl rand -base64 64");
        }
        if (jwtSecret.equals(WEAK_SECRET_PLACEHOLDER)) {
            log.error("CRITICAL: Using default JWT secret! Set JWT_SECRET env var to a secure random value.");
            throw new IllegalStateException(
                    "Default JWT secret is not allowed in production. Set JWT_SECRET env var.");
        }
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(Long userId, String email, int tokenVersion) {
        return buildToken(userId, email, accessTokenExpiration, "access", tokenVersion);
    }

    public String generateRefreshToken(Long userId, String email, int tokenVersion) {
        return buildToken(userId, email, refreshTokenExpiration, "refresh", tokenVersion);
    }

    /**
     * Builds a signed JWT with standard claims.
     * The {@code type} claim distinguishes access tokens from refresh tokens
     * at the filter level, preventing refresh tokens from being used for API auth.
     *
     * {@code tokenVersion} is embedded in the token to support token revocation:
     * when a user changes their password or refreshes tokens, the version is
     * incremented and older tokens become invalid regardless of their expiry.
     */
    private String buildToken(Long userId, String email, long expiration, String tokenType, int tokenVersion) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("type", tokenType)
                .claim("tokenVersion", tokenVersion)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("email", String.class);
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts the token version claim from a JWT for comparison against
     * the user's current version. Used to detect revoked tokens.
     */
    public int getTokenVersion(String token) {
        Claims claims = parseToken(token);
        return claims.get("tokenVersion", Integer.class);
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }
}
