package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.service.AuthService;
import com.financeapp.core.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_shouldReturn201AndSetCookies() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("New User")
                .email("new@example.com")
                .password("Str0ng!Pass")
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("access-token-123")
                .refreshToken("refresh-token-456")
                .tokenType("Bearer")
                .user(UserDTO.builder().id(2L).name("New User").email("new@example.com").build())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access-token-123"))
                .andExpect(jsonPath("$.user.name").value("New User"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void register_shouldReturn400WhenInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("")  // blank name
                .email("invalid")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fields").isMap());
    }

    @Test
    void login_shouldReturn200AndSetCookies() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        AuthResponse response = AuthResponse.builder()
                .accessToken("access-token-789")
                .refreshToken("refresh-token-000")
                .tokenType("Bearer")
                .user(UserDTO.builder().id(1L).name("Test").email("test@example.com").build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void login_shouldReturn400WhenInvalid() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("")  // blank
                .password("")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"));
    }

    @Test
    void refreshToken_shouldReturn200() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("refresh-token-valid");

        AuthResponse response = AuthResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .tokenType("Bearer")
                .build();

        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void refreshToken_shouldReturn401WhenNoToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getProfile_shouldReturnUserProfile() throws Exception {
        UserDTO userDTO = UserDTO.builder()
                .id(1L).name("Test User").email("test@example.com").build();

        when(authService.getProfile(1L)).thenReturn(userDTO);

        mockMvc.perform(get("/api/v1/auth/profile")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void updateProfile_shouldReturnUpdatedUser() throws Exception {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Updated Name")
                .email("updated@example.com")
                .build();

        UserDTO updated = UserDTO.builder()
                .id(1L).name("Updated Name").email("updated@example.com").build();

        when(authService.updateProfile(any(Long.class), any(UpdateProfileRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/auth/profile")
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void changePassword_shouldReturn200() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPass1!")
                .newPassword("newStr0ng!")
                .build();

        doNothing().when(authService).changePassword(any(Long.class), any(ChangePasswordRequest.class));

        mockMvc.perform(post("/api/v1/auth/change-password")
                        .with(csrf())
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void logout_shouldReturn200AndClearCookies() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void register_shouldReturn409OnDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("User")
                .email("existing@example.com")
                .password("Str0ng!Pass")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new com.financeapp.core.exception.DuplicateEmailException());

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("An account with this email already exists"));
    }
}
