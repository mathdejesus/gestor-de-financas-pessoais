package com.financeapp.api.controller;

import com.financeapp.core.entity.User;
import com.financeapp.core.repository.UserRepository;
import com.financeapp.core.security.JwtUtil;
import com.financeapp.core.service.AuthService;
import com.financeapp.core.service.CategoryService;
import com.financeapp.core.service.DashboardService;
import com.financeapp.core.service.GoalService;
import com.financeapp.core.service.TransactionService;
import com.financeapp.api.service.ReportService;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

/**
 * Base class for controller tests.
 * Provides mocked infrastructure beans (UserRepository, JwtUtil) needed by SecurityConfig.
 */
public abstract class ControllerTestBase {

    /**
     * Mock JwtUtil so SecurityConfig can create JwtAuthenticationFilter
     * without resolving JWT secret from environment.
     */
    @MockBean
    protected JwtUtil jwtUtil;

    /**
     * Mock UserRepository so JwtAuthenticationFilter can be created
     * without loading JPA infrastructure.
     */
    @MockBean
    protected UserRepository userRepository;

    @MockBean
    protected AuthService authService;

    @MockBean
    protected CategoryService categoryService;

    @MockBean
    protected TransactionService transactionService;

    @MockBean
    protected DashboardService dashboardService;

    @MockBean
    protected GoalService goalService;

    @MockBean
    protected ReportService reportService;

    protected User createTestUser() {
        return User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .passwordHash("$2a$10$hashed")
                .build();
    }

    /**
     * Returns a RequestPostProcessor that sets up an authenticated user
     * in the SecurityContext for the request.
     */
    protected RequestPostProcessor withAuthenticatedUser() {
        User user = createTestUser();
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user, null, List.of());
        return request -> {
            SecurityContextHolder.getContext().setAuthentication(auth);
            return request;
        };
    }
}
