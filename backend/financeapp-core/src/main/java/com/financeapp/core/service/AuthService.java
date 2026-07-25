package com.financeapp.core.service;

import com.financeapp.core.dto.*;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.DuplicateEmailException;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.exception.UnauthorizedException;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user account.
     *
     * @param request name, email, and password
     * @return AuthResponse with access token (24h), refresh token (7d), and serialized user
     * @throws DuplicateEmailException if email already exists
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException();
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getTokenVersion());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getTokenVersion());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toDTO(user))
                .build();
    }

    /**
     * Authenticates a user by email and password.
     *
     * @param request email and password
     * @return AuthResponse with new token pair and user info
     * @throws UnauthorizedException if email not found or password doesn't match
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.isLocked()) {
            throw new UnauthorizedException("Account temporarily locked. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.incrementFailedAttempts();
            userRepository.save(user);
            throw new UnauthorizedException("Invalid email or password");
        }

        user.resetFailedAttempts();
        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getTokenVersion());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getTokenVersion());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toDTO(user))
                .build();
    }

    /**
     * Issues a new token pair from a valid refresh token.
     * Validates that the provided token has {@code type: "refresh"} and belongs
     * to an existing user. Both tokens are rotated (old becomes invalid).
     * Increments the user's token version to invalidate any old refresh tokens.
     *
     * @param request refresh token string
     * @return new AuthResponse with rotated token pair
     * @throws UnauthorizedException if token is invalid or wrong type
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenType = jwtUtil.parseToken(refreshToken).get("type", String.class);
        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Invalid token type");
        }

        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int tokenVersion = jwtUtil.getTokenVersion(refreshToken);
        if (tokenVersion < user.getTokenVersion()) {
            throw new UnauthorizedException("Token has been revoked");
        }

        user.setTokenVersion(user.getTokenVersion() + 1);
        user = userRepository.save(user);

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getTokenVersion());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getTokenVersion());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(toDTO(user))
                .build();
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * @param userId authenticated user's ID (from JWT subject)
     * @return user profile DTO (name, email, createdAt)
     */
    @Transactional(readOnly = true)
    public UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toDTO(user);
    }

    /**
     * Updates user's name and/or email. If the email is changing, validates
     * uniqueness first to prevent duplicate accounts.
     *
     * @param userId authenticated user's ID
     * @param request fields to update (name, email)
     * @return updated user profile DTO
     */
    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException();
            }
            user.setEmail(request.getEmail());
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    /**
     * Changes user's password after verifying current password.
     *
     * @param userId authenticated user's ID
     * @param request current password (verified) and new password (BCrypt hashed)
     * @throws UnauthorizedException if current password is incorrect
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }
}
