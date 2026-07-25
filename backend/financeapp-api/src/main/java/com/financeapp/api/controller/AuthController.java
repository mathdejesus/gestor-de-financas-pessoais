package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.service.AuthService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.financeapp.core.entity.User;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login and token refresh")
public class AuthController {

    private final AuthService authService;

    @Value("${SPRING_PROFILES_ACTIVE:prod}")
    private String activeProfile;

    private boolean isDev() {
        return "dev".equals(activeProfile);
    }

    private ResponseCookie buildAccessCookie(String token) {
        return ResponseCookie.from("access_token", token)
            .httpOnly(true).secure(!isDev()).sameSite("Lax")
            .path("/api").maxAge(Duration.ofHours(24)).build();
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
            .httpOnly(true).secure(!isDev()).sameSite("Lax")
            .path("/api").maxAge(Duration.ofDays(7)).build();
    }

    @PostMapping("/register")
    @RateLimiter(name = "auth")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);

        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(authResponse.getAccessToken()).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(authResponse.getRefreshToken()).toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    @RateLimiter(name = "auth")
    @Operation(summary = "Login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(authResponse.getAccessToken()).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(authResponse.getRefreshToken()).toString());

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @RateLimiter(name = "auth")
    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody(required = false) RefreshTokenRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String refreshToken = null;
        if (request != null && request.getRefreshToken() != null) {
            refreshToken = request.getRefreshToken();
        } else {
            Cookie[] cookies = httpRequest.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("refresh_token".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);
        AuthResponse authResponse = authService.refreshToken(refreshRequest);

        ResponseCookie accessCookie = ResponseCookie.from("access_token", authResponse.getAccessToken())
            .httpOnly(true).secure(!isDev()).sameSite("Lax")
            .path("/api").maxAge(Duration.ofHours(24)).build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get authenticated user's profile information")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getProfile(user.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update authenticated user's name and email")
    public ResponseEntity<UserDTO> updateProfile(@AuthenticationPrincipal User user,
                                                  @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(user.getId(), request));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change authenticated user's password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clear authentication cookies")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie clearAccess = ResponseCookie.from("access_token", "")
            .httpOnly(true).secure(!isDev()).sameSite("Lax")
            .path("/api").maxAge(0).build();
        ResponseCookie clearRefresh = ResponseCookie.from("refresh_token", "")
            .httpOnly(true).secure(!isDev()).sameSite("Lax")
            .path("/api").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefresh.toString());
        return ResponseEntity.ok().build();
    }
}
