package com.financeapp.api.web;

import com.financeapp.core.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/**
 * Common model attributes for every rendered page: active theme (from cookie) and the authenticated
 * user's name (for the navbar).
 */
@ControllerAdvice
public class WebModelAdvice {

  @ModelAttribute
  public void addCommonAttributes(
      @AuthenticationPrincipal User user, HttpServletRequest request, Model model) {
    String theme = "dark";
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("theme".equals(cookie.getName())) {
          theme = cookie.getValue();
          break;
        }
      }
    }
    model.addAttribute("theme", "light".equals(theme) ? "light" : "dark");
    model.addAttribute("userName", user != null ? user.getName() : "");
  }
}
