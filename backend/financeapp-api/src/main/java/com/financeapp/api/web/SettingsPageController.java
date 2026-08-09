package com.financeapp.api.web;

import com.financeapp.core.dto.ChangePasswordRequest;
import com.financeapp.core.dto.UpdateProfileRequest;
import com.financeapp.core.dto.UserDTO;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.UnauthorizedException;
import com.financeapp.core.service.AuthService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

/** Server-rendered settings: profile update and password change via classic forms. */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class SettingsPageController {

  private final AuthService authService;

  @GetMapping("/settings")
  public String settings(@AuthenticationPrincipal User user, Model model) {
    UserDTO profile = authService.getProfile(user.getId());
    model.addAttribute(
        "profileForm",
        UpdateProfileRequest.builder().name(profile.getName()).email(profile.getEmail()).build());
    model.addAttribute("passwordForm", new ChangePasswordRequest());
    model.addAttribute("activeNav", "settings");
    model.addAttribute("pageTitle", "Configurações");
    return "settings/index";
  }

  @PostMapping("/settings/profile")
  public String updateProfile(
      @AuthenticationPrincipal User user,
      @Valid @ModelAttribute("profileForm") UpdateProfileRequest request,
      BindingResult bindingResult,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute("passwordForm", new ChangePasswordRequest());
      model.addAttribute("activeNav", "settings");
      model.addAttribute("pageTitle", "Configurações");
      return "settings/index";
    }
    authService.updateProfile(user.getId(), request);
    return "redirect:/settings?profileUpdated=1";
  }

  @PostMapping("/settings/password")
  public String changePassword(
      @AuthenticationPrincipal User user,
      @Valid @ModelAttribute("passwordForm") ChangePasswordRequest request,
      BindingResult bindingResult,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute(
          "profileForm",
          UpdateProfileRequest.builder().name(user.getName()).email(user.getEmail()).build());
      model.addAttribute("activeNav", "settings");
      model.addAttribute("pageTitle", "Configurações");
      return "settings/index";
    }
    try {
      authService.changePassword(user.getId(), request);
      return "redirect:/settings?passwordUpdated=1";
    } catch (UnauthorizedException e) {
      model.addAttribute("passwordError", "A senha atual está incorreta");
      model.addAttribute(
          "profileForm",
          UpdateProfileRequest.builder().name(user.getName()).email(user.getEmail()).build());
      model.addAttribute("activeNav", "settings");
      model.addAttribute("pageTitle", "Configurações");
      return "settings/index";
    }
  }
}
