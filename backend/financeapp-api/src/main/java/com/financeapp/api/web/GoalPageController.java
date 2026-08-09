package com.financeapp.api.web;

import com.financeapp.core.dto.CreateGoalRequest;
import com.financeapp.core.dto.GoalDTO;
import com.financeapp.core.dto.UpdateGoalRequest;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.GoalStatus;
import com.financeapp.core.service.GoalService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Server-rendered financial goals (list, create, progress update, delete). All progress math
 * (percentages, estimates) is computed by GoalService in the backend.
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class GoalPageController {

  private final GoalService goalService;

  @GetMapping("/goals")
  public String list(@AuthenticationPrincipal User user, Model model) {
    List<GoalDTO> goals = goalService.findByUserId(user.getId());
    model.addAttribute("goals", goals);
    model.addAttribute("activeNav", "goals");
    model.addAttribute("pageTitle", "Metas");
    return "goals/index";
  }

  @PostMapping("/goals")
  public String create(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) String description,
      @RequestParam(required = false) BigDecimal targetValue,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate deadline,
      Model model) {
    if (!StringUtils.hasText(description) || targetValue == null || targetValue.signum() <= 0) {
      model.addAttribute("createError", "Descrição e valor alvo positivo são obrigatórios");
      model.addAttribute("goals", goalService.findByUserId(user.getId()));
      model.addAttribute("activeNav", "goals");
      model.addAttribute("pageTitle", "Metas");
      return "goals/index";
    }
    goalService.create(
        user.getId(),
        CreateGoalRequest.builder()
            .description(description.trim())
            .targetValue(targetValue)
            .deadline(deadline)
            .build());
    return "redirect:/goals";
  }

  @PostMapping("/goals/{id}/update")
  public String update(
      @AuthenticationPrincipal User user,
      @PathVariable Long id,
      @RequestParam(required = false) BigDecimal currentValue,
      @RequestParam(required = false) GoalStatus status,
      Model model) {
    GoalDTO goal = goalService.findByIdAndUserId(id, user.getId());
    UpdateGoalRequest request =
        UpdateGoalRequest.builder()
            .description(goal.getDescription())
            .targetValue(goal.getTargetValue())
            .currentValue(currentValue != null ? currentValue : goal.getCurrentValue())
            .deadline(goal.getDeadline())
            .status(status != null ? status : goal.getStatus())
            .build();
    goalService.update(id, user.getId(), request);
    return "redirect:/goals";
  }

  @PostMapping("/goals/{id}/delete")
  public String delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
    goalService.delete(id, user.getId());
    return "redirect:/goals";
  }
}
