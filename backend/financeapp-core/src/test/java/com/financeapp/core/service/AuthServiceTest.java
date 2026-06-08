package com.financeapp.core.service;

import com.financeapp.core.dto.*;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.DuplicateEmailException;
import com.financeapp.core.exception.UnauthorizedException;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_withValidData_shouldReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest("John", "john@email.com", "password123");
        when(userRepository.existsByEmail("john@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(jwtUtil.generateAccessToken(1L, "john@email.com")).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(1L, "john@email.com")).thenReturn("refresh_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("john@email.com", response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDuplicateEmail_shouldThrowDuplicateEmailException() {
        RegisterRequest request = new RegisterRequest("John", "john@email.com", "password123");
        when(userRepository.existsByEmail("john@email.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_withValidCredentials_shouldReturnAuthResponse() {
        LoginRequest request = new LoginRequest("john@email.com", "password123");
        User user = User.builder()
                .id(1L)
                .name("John")
                .email("john@email.com")
                .passwordHash("hashed_password")
                .build();

        when(userRepository.findByEmail("john@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtUtil.generateAccessToken(1L, "john@email.com")).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(1L, "john@email.com")).thenReturn("refresh_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
    }

    @Test
    void login_withInvalidPassword_shouldThrowUnauthorizedException() {
        LoginRequest request = new LoginRequest("john@email.com", "wrong_password");
        User user = User.builder()
                .id(1L)
                .email("john@email.com")
                .passwordHash("hashed_password")
                .build();

        when(userRepository.findByEmail("john@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "hashed_password")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void login_withNonExistentEmail_shouldThrowUnauthorizedException() {
        LoginRequest request = new LoginRequest("nonexistent@email.com", "password123");
        when(userRepository.findByEmail("nonexistent@email.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
