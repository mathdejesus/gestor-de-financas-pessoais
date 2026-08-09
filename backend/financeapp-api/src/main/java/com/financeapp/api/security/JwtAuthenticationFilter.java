package com.financeapp.api.security;

import com.financeapp.core.entity.User;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Extracts and validates JWT access tokens from HttpOnly cookies or the Authorization
 * header on every request, then sets the SecurityContext if valid.
 *
 * Token resolution order:
 * 1. {@code access_token} HttpOnly cookie (web clients)
 * 2. {@code Authorization: Bearer *** header (API clients)
 *
 * Extends {@link OncePerRequestFilter} instead of plain {@link jakarta.servlet.Filter}
 * to guarantee a single execution per request dispatch chain (Spring may dispatch
 * the same request multiple times via {@code forward()} or error handling).
 *
 * Only tokens with {@code type: "access"} are accepted here. Refresh tokens
 * with {@code type: "refresh"} are silently skipped, forcing them through the
 * dedicated refresh endpoint instead.
 *
 * Also validates the embedded {@code tokenVersion} claim against the user's
 * current {@code tokenVersion} in the database. Tokens with a stale version
 * (e.g. after password change or token rotation) are rejected even if the
 * JWT signature and expiry are still valid.
 *
 * <p>Server-side silent refresh: because the web app is server-rendered with no
 * JavaScript, there is no client code to call a refresh endpoint when the
 * access token expires. When no valid access token is found, a valid
 * {@code refresh_token} cookie is used to reissue an access token in-place
 * (same response), so sessions survive the 24h access-token lifetime up to the
 * 7d refresh-token lifetime without any client cooperation.</p>
 *
 * If the token is missing, expired, or invalid the filter chain continues
 * without setting an authenticated SecurityContext. Downstream security
 * rules (configured in {@link com.financeapp.api.config.SecurityConfig})
 * reject unauthenticated requests via 401/403 as appropriate.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  @Value("${SPRING_PROFILES_ACTIVE:prod}")
  private String activeProfile;

  private boolean isDev() {
    return "dev".equals(activeProfile);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String token = getTokenFromRequest(request);

    if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
      Claims claims = jwtUtil.parseToken(token);
      if ("access".equals(claims.get("type", String.class))) {
        authenticateWithClaims(claims, request);
      }
    } else {
      // Silent server-side refresh: reissue access token from refresh cookie
      String refreshToken = getRefreshTokenFromRequest(request);
      if (StringUtils.hasText(refreshToken) && jwtUtil.validateToken(refreshToken)) {
        Claims claims = jwtUtil.parseToken(refreshToken);
        if ("refresh".equals(claims.get("type", String.class))) {
          refreshAccessToken(claims, request, response);
        }
      }
    }

    filterChain.doFilter(request, response);
  }

  private void authenticateWithClaims(Claims claims, HttpServletRequest request) {
    Long userId = parseUserId(claims);
    Optional<User> userOpt = userRepository.findById(userId);
    if (userOpt.isPresent()) {
      User user = userOpt.get();
      if (hasValidVersion(claims, user)) {
        setAuthentication(user, request);
      }
    }
  }

  private void refreshAccessToken(
      Claims claims, HttpServletRequest request, HttpServletResponse response) {
    Long userId = parseUserId(claims);
    Optional<User> userOpt = userRepository.findById(userId);
    if (userOpt.isPresent()) {
      User user = userOpt.get();
      if (hasValidVersion(claims, user)) {
        String newAccessToken =
            jwtUtil.generateAccessToken(userId, user.getEmail(), user.getTokenVersion());

        Cookie cookie = new Cookie("access_token", newAccessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(!isDev());
        cookie.setAttribute("SameSite", "Lax");
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60);
        response.addCookie(cookie);

        setAuthentication(user, request);
      }
    }
  }

  private Long parseUserId(Claims claims) {
    return Long.parseLong(claims.getSubject());
  }

  private boolean hasValidVersion(Claims claims, User user) {
    Integer version = claims.get("tokenVersion", Integer.class);
    int tokenVersion = version != null ? version : 0;
    return tokenVersion >= user.getTokenVersion();
  }

  private void setAuthentication(User user, HttpServletRequest request) {
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>());
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }

  private String getTokenFromRequest(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("access_token".equals(cookie.getName())) {
          return cookie.getValue();
        }
      }
    }
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }

  private String getRefreshTokenFromRequest(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("refresh_token".equals(cookie.getName())) {
          return cookie.getValue();
        }
      }
    }
    return null;
  }
}
