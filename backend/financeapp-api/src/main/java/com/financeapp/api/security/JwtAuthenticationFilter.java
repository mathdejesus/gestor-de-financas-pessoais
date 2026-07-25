package com.financeapp.api.security;

import com.financeapp.core.entity.User;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

/**
 * Extracts and validates JWT access tokens from HttpOnly cookies or the Authorization
 * header on every request, then sets the SecurityContext if valid.
 *
 * Token resolution order:
 * 1. {@code access_token} HttpOnly cookie (web clients)
 * 2. {@code Authorization: Bearer <token>} header (mobile clients)
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

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = getTokenFromRequest(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            io.jsonwebtoken.Claims claims = jwtUtil.parseToken(token);
            String tokenType = claims.get("type", String.class);

            if ("access".equals(tokenType)) {
                Long userId = Long.parseLong(claims.getSubject());
                Optional<User> userOpt = userRepository.findById(userId);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    Integer version = claims.get("tokenVersion", Integer.class);
                    int tokenVersion = version != null ? version : 0;
                    // Reject tokens with stale version (revoked via password change or token rotation)
                    if (tokenVersion >= user.getTokenVersion()) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
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
}
