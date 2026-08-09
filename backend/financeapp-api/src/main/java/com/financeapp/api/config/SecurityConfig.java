package com.financeapp.api.config;

import com.financeapp.api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

/**
 * Spring Security configuration for the financeapp web application.
 *
 * <p>Server-rendered (Thymeleaf) application. Design decisions: - CSRF enabled via double-submit
 * cookie pattern (CookieCsrfTokenRepository). Forms embed the token as a hidden {@code _csrf}
 * field; the same token is also exposed as a readable {@code XSRF-TOKEN} cookie for compatibility.
 * - Session creation is STATELESS: no HttpSession. Authentication is JWT-based, carried in HttpOnly
 * cookies (access_token / refresh_token) validated by {@link JwtAuthenticationFilter} on every
 * request. - Public surfaces: auth pages (login/register), static assets (css, icons, PWA
 * manifest/sw) and the actuator health probe. Everything else requires a valid access token.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(
            csrf ->
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                    .ignoringRequestMatchers("/actuator/health"))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // Logout is handled by AuthPageController#logout (revokes tokens via
        // AuthService and clears the JWT cookies). The framework's session-based
        // LogoutFilter is disabled so it does not swallow POST /logout.
        .logout(AbstractHttpConfigurer::disable)
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(
                        (request, response, authException) -> response.sendRedirect("/login"))
                    .accessDeniedHandler(
                        (request, response, accessDeniedException) ->
                            response.sendRedirect("/login")))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/", "/login", "/register", "/error")
                    .permitAll()
                    .requestMatchers(
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/icons/**",
                        "/favicon.svg",
                        "/favicon.ico",
                        "/manifest.webmanifest",
                        "/sw.js")
                    .permitAll()
                    .requestMatchers("/actuator/health")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  public org.springframework.security.authentication.AuthenticationManager authenticationManager(
      org.springframework.security.config.annotation.authentication.configuration
              .AuthenticationConfiguration
          config)
      throws Exception {
    return config.getAuthenticationManager();
  }
}
