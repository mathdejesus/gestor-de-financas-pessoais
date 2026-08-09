package com.financeapp.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.financeapp.api.config.SecurityConfig;
import com.financeapp.api.service.ReportService;
import com.financeapp.core.dto.AuthResponse;
import com.financeapp.core.dto.UserDTO;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import com.financeapp.core.service.AuthService;
import com.financeapp.core.service.CategoryService;
import com.financeapp.core.service.DashboardService;
import com.financeapp.core.service.GoalService;
import com.financeapp.core.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Smoke tests for the server-rendered web layer: pages render, anonymous users are redirected to
 * /login, and classic form POSTs set the auth cookies (PRG).
 */
@WebMvcTest(properties = {"app.jpa.enabled=false"})
@Import(SecurityConfig.class)
class WebPageTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private JwtUtil jwtUtil;
  @MockBean private UserRepository userRepository;
  @MockBean private AuthService authService;
  @MockBean private CategoryService categoryService;
  @MockBean private TransactionService transactionService;
  @MockBean private DashboardService dashboardService;
  @MockBean private GoalService goalService;
  @MockBean private ReportService reportService;

  @Test
  void loginPage_shouldRender() throws Exception {
    mockMvc
        .perform(get("/login"))
        .andExpect(status().isOk())
        .andExpect(view().name("auth/login"))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("Entrar")));
  }

  @Test
  void registerPage_shouldRender() throws Exception {
    mockMvc
        .perform(get("/register"))
        .andExpect(status().isOk())
        .andExpect(view().name("auth/register"))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("Criar conta")));
  }

  @Test
  void protectedPages_shouldRedirectAnonymousToLogin() throws Exception {
    mockMvc
        .perform(get("/dashboard"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/login"));
    mockMvc
        .perform(get("/transactions"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/login"));
    mockMvc
        .perform(get("/categories"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/login"));
  }

  @Test
  void login_post_shouldSetCookiesAndRedirect() throws Exception {
    when(authService.login(any()))
        .thenReturn(
            AuthResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .tokenType("Bearer")
                .user(UserDTO.builder().id(1L).name("Test").email("test@example.com").build())
                .build());

    mockMvc
        .perform(
            post("/login")
                .with(csrf())
                .param("email", "test@example.com")
                .param("password", "password123"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/dashboard"))
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("access_token")));
  }

  @Test
  void register_post_shouldCreateAndRedirect() throws Exception {
    when(authService.register(any()))
        .thenReturn(
            AuthResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .tokenType("Bearer")
                .user(UserDTO.builder().id(2L).name("New").email("new@example.com").build())
                .build());

    mockMvc
        .perform(
            post("/register")
                .with(csrf())
                .param("name", "New User")
                .param("email", "new@example.com")
                .param("password", "Str0ng!Pass"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/dashboard"))
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("access_token")));
  }

  @Test
  void logout_post_shouldClearCookiesAndRedirect() throws Exception {
    com.financeapp.core.entity.User user =
        com.financeapp.core.entity.User.builder()
            .id(1L)
            .name("Test User")
            .email("test@example.com")
            .passwordHash("x")
            .build();

    mockMvc
        .perform(
            post("/logout")
                .with(csrf())
                .with(
                    org.springframework.security.test.web.servlet.request
                        .SecurityMockMvcRequestPostProcessors.authentication(
                        new org.springframework.security.authentication
                            .UsernamePasswordAuthenticationToken(user, null, java.util.List.of()))))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/login"))
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("access_token=")));

    verify(authService).logout(any(Long.class));
  }

  @Test
  void dashboard_shouldRenderWithData() throws Exception {
    var summary =
        com.financeapp.core.dto.DashboardSummary.builder()
            .totalIncome(java.math.BigDecimal.valueOf(1000))
            .totalExpenses(java.math.BigDecimal.valueOf(400))
            .totalBalance(java.math.BigDecimal.valueOf(600))
            .savingsRate(java.math.BigDecimal.valueOf(60))
            .transactionCount(2)
            .categoryCount(1)
            .build();
    when(dashboardService.getSummary(any(Long.class), any(), any())).thenReturn(summary);
    when(dashboardService.getCategorySummary(any(Long.class), any(), any()))
        .thenReturn(java.util.List.of());
    when(transactionService.findByUserId(any(Long.class))).thenReturn(java.util.List.of());

    com.financeapp.core.entity.User user =
        com.financeapp.core.entity.User.builder()
            .id(1L)
            .name("Test User")
            .email("test@example.com")
            .passwordHash("x")
            .build();

    mockMvc
        .perform(
            get("/dashboard")
                .with(
                    org.springframework.security.test.web.servlet.request
                        .SecurityMockMvcRequestPostProcessors.authentication(
                        new org.springframework.security.authentication
                            .UsernamePasswordAuthenticationToken(user, null, java.util.List.of()))))
        .andExpect(status().isOk())
        .andExpect(view().name("dashboard/index"))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("Test User")));
  }

  @Test
  void transactionCreate_post_shouldPersistAndRedirect() throws Exception {
    com.financeapp.core.entity.User user =
        com.financeapp.core.entity.User.builder()
            .id(1L)
            .name("Test User")
            .email("test@example.com")
            .passwordHash("x")
            .build();

    mockMvc
        .perform(
            post("/transactions")
                .with(csrf())
                .with(
                    org.springframework.security.test.web.servlet.request
                        .SecurityMockMvcRequestPostProcessors.authentication(
                        new org.springframework.security.authentication
                            .UsernamePasswordAuthenticationToken(user, null, java.util.List.of())))
                .param("description", "Almoço")
                .param("amount", "50.00")
                .param("transactionType", "EXPENSE")
                .param("transactionDate", "2026-08-06"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/transactions"));

    verify(transactionService)
        .create(any(Long.class), any(com.financeapp.core.dto.CreateTransactionRequest.class));
  }
}
