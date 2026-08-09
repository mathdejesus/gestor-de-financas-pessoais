package com.financeapp.api.web;

import com.financeapp.core.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Theme toggle without JavaScript: a plain GET link sets a {@code theme} cookie server-side and
 * redirects back to the referring page. Templates apply the cookie value as {@code data-theme} on
 * the root element (pure CSS switch).
 */
@Controller
public class ThemeController {

  @Value("${SPRING_PROFILES_ACTIVE:prod}")
  private String activeProfile;

  @GetMapping("/theme")
  public String setTheme(
      @RequestParam String mode, HttpServletRequest request, HttpServletResponse response) {
    String theme = "light".equals(mode) ? "light" : "dark";

    Cookie cookie = new Cookie("theme", theme);
    cookie.setPath("/");
    cookie.setMaxAge(365 * 24 * 60 * 60);
    cookie.setHttpOnly(false);
    cookie.setSecure(!"dev".equals(activeProfile));
    cookie.setAttribute("SameSite", "Lax");
    response.addCookie(cookie);

    String referer = request.getHeader("Referer");
    if (referer != null && referer.startsWith("/") && !referer.startsWith("//")) {
      return "redirect:" + referer;
    }
    return "redirect:/dashboard";
  }

  @GetMapping("/")
  public String root(@AuthenticationPrincipal User user) {
    return user != null ? "redirect:/dashboard" : "redirect:/login";
  }
}
