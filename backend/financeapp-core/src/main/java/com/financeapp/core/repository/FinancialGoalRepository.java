package com.financeapp.core.repository;

import com.financeapp.core.entity.FinancialGoal;
import com.financeapp.core.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {
    List<FinancialGoal> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FinancialGoal> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, GoalStatus status);
    Optional<FinancialGoal> findByIdAndUserId(Long id, Long userId);
}
