package com.financeapp.api.web;

import com.financeapp.core.dto.CreateTransactionRequest;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.dto.UpdateTransactionRequest;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.CategoryService;
import com.financeapp.core.service.TransactionService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Server-rendered transaction management (list with filters, create, edit, delete). Forms POST
 * classic HTML payloads; the backend validates and persists.
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class TransactionPageController {

  private final TransactionService transactionService;
  private final CategoryService categoryService;

  @GetMapping("/transactions")
  public String list(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate endDate,
      @RequestParam(required = false) Long categoryId,
      Model model) {
    List<TransactionDTO> transactions;
    if (startDate != null && endDate != null) {
      transactions = transactionService.findByFilters(user.getId(), startDate, endDate, categoryId);
    } else {
      transactions = transactionService.findByUserId(user.getId());
    }

    model.addAttribute("transactions", transactions);
    model.addAttribute("categories", categoryService.findByUserId(user.getId()));
    model.addAttribute("startDate", startDate != null ? startDate.toString() : "");
    model.addAttribute("endDate", endDate != null ? endDate.toString() : "");
    model.addAttribute("selectedCategoryId", categoryId);
    model.addAttribute("activeNav", "transactions");
    model.addAttribute("pageTitle", "Transações");
    return "transactions/index";
  }

  @GetMapping("/transactions/new")
  public String newForm(@AuthenticationPrincipal User user, Model model) {
    model.addAttribute("transactionForm", new CreateTransactionRequest());
    model.addAttribute("transactionId", null);
    model.addAttribute("categories", categoryService.findByUserId(user.getId()));
    model.addAttribute("isEdit", false);
    model.addAttribute("activeNav", "transactions");
    model.addAttribute("pageTitle", "Nova transação");
    return "transactions/form";
  }

  @PostMapping("/transactions")
  public String create(
      @AuthenticationPrincipal User user,
      @Valid @ModelAttribute("transactionForm") CreateTransactionRequest request,
      BindingResult bindingResult,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute("transactionId", null);
      model.addAttribute("categories", categoryService.findByUserId(user.getId()));
      model.addAttribute("isEdit", false);
      model.addAttribute("activeNav", "transactions");
      model.addAttribute("pageTitle", "Nova transação");
      return "transactions/form";
    }
    transactionService.create(user.getId(), request);
    return "redirect:/transactions";
  }

  @GetMapping("/transactions/{id}/edit")
  public String editForm(@AuthenticationPrincipal User user, @PathVariable Long id, Model model) {
    TransactionDTO dto = transactionService.findByIdAndUserId(id, user.getId());
    UpdateTransactionRequest form =
        UpdateTransactionRequest.builder()
            .description(dto.getDescription())
            .amount(dto.getAmount())
            .transactionType(dto.getTransactionType())
            .transactionDate(dto.getTransactionDate())
            .categoryId(dto.getCategoryId())
            .build();

    model.addAttribute("transactionForm", form);
    model.addAttribute("transactionId", id);
    model.addAttribute("categories", categoryService.findByUserId(user.getId()));
    model.addAttribute("isEdit", true);
    model.addAttribute("activeNav", "transactions");
    model.addAttribute("pageTitle", "Editar transação");
    return "transactions/form";
  }

  @PostMapping("/transactions/{id}/update")
  public String update(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @Valid @ModelAttribute("transactionForm") UpdateTransactionRequest request,
      BindingResult bindingResult,
      Model model) {
    if (bindingResult.hasErrors()) {
      model.addAttribute("transactionId", id);
      model.addAttribute("categories", categoryService.findByUserId(user.getId()));
      model.addAttribute("isEdit", true);
      model.addAttribute("activeNav", "transactions");
      model.addAttribute("pageTitle", "Editar transação");
      return "transactions/form";
    }
    transactionService.update(id, user.getId(), request);
    return "redirect:/transactions";
  }

  @PostMapping("/transactions/{id}/delete")
  public String delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
    transactionService.delete(id, user.getId());
    return "redirect:/transactions";
  }
}
