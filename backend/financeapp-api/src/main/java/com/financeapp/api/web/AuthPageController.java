package com.financeapp.api.web;

import com.financeapp.core.dto.AuthResponse;
import com.financeapp.core.dto.LoginRequest;
import com.financeapp.core.dto.RegisterRequest;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.DuplicateEmailException;
import com.financeapp.core.exception.UnauthorizedException;
import com.financeapp.core.service.AuthService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

/**
 * Server-rendered authentication pages (login/register) and logout.
 *
 * <p>Classic HTML forms POST credentials; the backend authenticates, sets HttpOnly JWT cookies and
 * redirects (PRG). No JavaScript involved.
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "auth")
public class AuthPageController {

  private final AuthService authService;

  @Value("${SPRING_PROFILES_ACTIVE:prod}")
  private String activeProfile;

  private boolean isDev() {
    return "dev".equals(activeProfile);
  }

  @GetMapping("/login")
  public String loginPage(@AuthenticationPrincipal User user, Model model) {
    if (user != null) {
      return "redirect:/dashboard";
    }
    model.addAttribute("loginRequest", new LoginRequest());
    model.addAttribute("pageTitle", "Entrar");
    return "auth/login";
  }

  @PostMapping("/login")
  public String login(
      @Valid @ModelAttribute("loginRequest") LoginRequest request,
      BindingResult bindingResult,
      HttpServletResponse response,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute("pageTitle", "Entrar");
      return "auth/login";
    }
    try {
      AuthResponse auth = authService.login(request);
      setAuthCookies(response, auth);
      return "redirect:/dashboard";
    } catch (UnauthorizedException e) {
      model.addAttribute("loginError", "E-mail ou senha inválidos");
      model.addAttribute("loginRequest", request);
      model.addAttribute("pageTitle", "Entrar");
      return "auth/login";
    }
  }

  @GetMapping("/register")
  public String registerPage(@AuthenticationPrincipal User user, Model model) {
    if (user != null) {
      return "redirect:/dashboard";
    }
    model.addAttribute("registerRequest", new RegisterRequest());
    model.addAttribute("pageTitle", "Criar conta");
    return "auth/register";
  }

  @PostMapping("/register")
  public String register(
      @Valid @ModelAttribute("registerRequest") RegisterRequest request,
      BindingResult bindingResult,
      HttpServletResponse response,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute("pageTitle", "Criar conta");
      return "auth/register";
    }
    try {
      AuthResponse auth = authService.register(request);
      setAuthCookies(response, auth);
      return "redirect:/dashboard";
    } catch (DuplicateEmailException e) {
      model.addAttribute("registerError", "Já existe uma conta com este e-mail");
      model.addAttribute("registerRequest", request);
      model.addAttribute("pageTitle", "Criar conta");
      return "auth/register";
    }
  }

  @PostMapping("/logout")
  public String logout(@AuthenticationPrincipal User user, HttpServletResponse response) {
    if (user != null) {
      authService.logout(user.getId());
    }
    clearAuthCookies(response);
    return "redirect:/login";
  }

  private void setAuthCookies(HttpServletResponse response, AuthResponse auth) {
    response.addHeader(HttpHeaders.SET_COOKIE, buildAccessCookie(auth.getAccessToken()).toString());
    response.addHeader(
        HttpHeaders.SET_COOKIE, buildRefreshCookie(auth.getRefreshToken()).toString());
  }

  private ResponseCookie buildAccessCookie(String token) {
    return ResponseCookie.from("access_token", token)
        .httpOnly(true)
        .secure(!isDev())
        .sameSite("Lax")
        .path("/")
        .maxAge(Duration.ofHours(24))
        .build();
  }

  private ResponseCookie buildRefreshCookie(String token) {
    return ResponseCookie.from("refresh_token", token)
        .httpOnly(true)
        .secure(!isDev())
        .sameSite("Lax")
        .path("/")
        .maxAge(Duration.ofDays(7))
        .build();
  }

  private void clearAuthCookies(HttpServletResponse response) {
    response.addHeader(
        HttpHeaders.SET_COOKIE,
        ResponseCookie.from("access_token", "")
            .httpOnly(true)
            .secure(!isDev())
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build()
            .toString());
    response.addHeader(
        HttpHeaders.SET_COOKIE,
        ResponseCookie.from("refresh_token", "")
            .httpOnly(true)
            .secure(!isDev())
            .sameSite("Lax")
            .path("/")
            .maxAge(0)
            .build()
            .toString());
  }
}
