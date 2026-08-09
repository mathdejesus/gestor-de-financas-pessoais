package com.financeapp.api.web;

import com.financeapp.core.dto.CategorySummary;
import com.financeapp.core.dto.DashboardSummary;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.DashboardService;
import com.financeapp.core.service.TransactionService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Server-rendered dashboard: KPIs, category breakdown (with percentages computed here in the
 * backend) and recent transactions. The template is pure HTML/CSS.
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class DashboardPageController {

  /** Category row with percentage pre-computed for the CSS bar. */
  public record CategoryBar(String name, BigDecimal total, double percent) {}

  private final DashboardService dashboardService;
  private final TransactionService transactionService;

  @GetMapping("/dashboard")
  public String dashboard(@AuthenticationPrincipal User user, Model model) {
    DashboardSummary summary = dashboardService.getSummary(user.getId(), null, null);
    List<CategorySummary> categories =
        dashboardService.getCategorySummary(user.getId(), null, null);

    double totalExpenses = summary.getTotalExpenses().doubleValue();
    List<CategoryBar> bars =
        categories.stream()
            .map(
                c ->
                    new CategoryBar(
                        c.getCategoryName(),
                        c.getTotal(),
                        totalExpenses > 0
                            ? Math.round(c.getTotal().doubleValue() * 1000.0 / totalExpenses) / 10.0
                            : 0.0))
            .toList();

    List<TransactionDTO> transactions = transactionService.findByUserId(user.getId());
    List<TransactionDTO> recent =
        transactions.size() > 5 ? transactions.subList(0, 5) : transactions;

    model.addAttribute("summary", summary);
    model.addAttribute("categoryBars", bars);
    model.addAttribute("recentTransactions", recent);
    model.addAttribute("activeNav", "dashboard");
    model.addAttribute("pageTitle", "Dashboard");
    return "dashboard/index";
  }
}
