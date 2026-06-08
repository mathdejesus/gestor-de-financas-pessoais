package com.financeapp.core.dto;

import com.financeapp.core.enums.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDTO {
    private Long id;
    private String description;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private LocalDate deadline;
    private GoalStatus status;
    private BigDecimal progressPercentage;
    private Long daysRemaining;
    private String estimatedCompletion;

    public static GoalDTO fromEntity(com.financeapp.core.entity.FinancialGoal goal) {
        BigDecimal percentage = goal.getTargetValue().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentValue()
                    .divide(goal.getTargetValue(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Long daysRemaining = null;
        String estimatedCompletion = null;
        if (goal.getDeadline() != null) {
            daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());
            if (daysRemaining < 0) daysRemaining = 0L;
        }

        if (percentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            estimatedCompletion = "Completed";
        } else if (daysRemaining != null && daysRemaining > 0) {
            BigDecimal remaining = goal.getTargetValue().subtract(goal.getCurrentValue());
            if (goal.getCurrentValue().compareTo(BigDecimal.ZERO) > 0) {
                long daysElapsed = ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), LocalDate.now());
                if (daysElapsed > 0) {
                    BigDecimal dailyRate = goal.getCurrentValue().divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
                    long daysToComplete = remaining.divide(dailyRate, 0, RoundingMode.CEILING).longValue();
                    LocalDate estimatedDate = LocalDate.now().plusDays(daysToComplete);
                    estimatedCompletion = "Est. " + estimatedDate;
                }
            }
        }

        return GoalDTO.builder()
                .id(goal.getId())
                .description(goal.getDescription())
                .targetValue(goal.getTargetValue())
                .currentValue(goal.getCurrentValue())
                .deadline(goal.getDeadline())
                .status(goal.getStatus())
                .progressPercentage(percentage)
                .daysRemaining(daysRemaining)
                .estimatedCompletion(estimatedCompletion)
                .build();
    }
}
