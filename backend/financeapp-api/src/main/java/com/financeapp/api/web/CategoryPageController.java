package com.financeapp.api.web;

import com.financeapp.core.dto.CategoryDTO;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.CategoryService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Server-rendered category management (list, create, inline update, delete). Rows carry their own
 * forms; the backend validates and persists.
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class CategoryPageController {

  private final CategoryService categoryService;

  @GetMapping("/categories")
  public String list(@AuthenticationPrincipal User user, Model model) {
    List<CategoryDTO> categories = categoryService.findByUserId(user.getId());
    model.addAttribute("categories", categories);
    model.addAttribute("activeNav", "categories");
    model.addAttribute("pageTitle", "Categorias");
    return "categories/index";
  }

  @PostMapping("/categories")
  public String create(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String icon,
      @RequestParam(required = false) String color,
      Model model) {
    if (!StringUtils.hasText(name)) {
      model.addAttribute("createError", "O nome da categoria é obrigatório");
      model.addAttribute("categories", categoryService.findByUserId(user.getId()));
      model.addAttribute("activeNav", "categories");
      model.addAttribute("pageTitle", "Categorias");
      return "categories/index";
    }
    categoryService.create(
        user.getId(),
        new com.financeapp.core.dto.CreateCategoryRequest(
            name.trim(), normalize(icon), normalize(color)));
    return "redirect:/categories";
  }

  @PostMapping("/categories/{id}/update")
  public String update(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String icon,
      @RequestParam(required = false) String color,
      Model model) {
    if (!StringUtils.hasText(name)) {
      model.addAttribute("updateError", "O nome da categoria é obrigatório");
      model.addAttribute("categories", categoryService.findByUserId(user.getId()));
      model.addAttribute("activeNav", "categories");
      model.addAttribute("pageTitle", "Categorias");
      return "categories/index";
    }
    categoryService.update(
        id,
        user.getId(),
        new com.financeapp.core.dto.UpdateCategoryRequest(
            name.trim(), normalize(icon), normalize(color)));
    return "redirect:/categories";
  }

  @PostMapping("/categories/{id}/delete")
  public String delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
    categoryService.delete(id, user.getId());
    return "redirect:/categories";
  }

  private String normalize(String value) {
    return StringUtils.hasText(value) ? value.trim() : null;
  }
}
