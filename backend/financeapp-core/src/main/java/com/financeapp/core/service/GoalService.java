package com.financeapp.core.service;

import com.financeapp.core.dto.CreateGoalRequest;
import com.financeapp.core.dto.GoalDTO;
import com.financeapp.core.dto.UpdateGoalRequest;
import com.financeapp.core.entity.FinancialGoal;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.GoalStatus;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.repository.FinancialGoalRepository;
import com.financeapp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for financial goals.
 * Automatically transitions goals to COMPLETED status when currentValue
 * reaches or exceeds targetValue on update.
 */
@Service
@RequiredArgsConstructor
public class GoalService {

    private final FinancialGoalRepository goalRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GoalDTO> findByUserId(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(GoalDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GoalDTO> findByUserIdAndStatus(Long userId, GoalStatus status) {
        return goalRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status).stream()
                .map(GoalDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalDTO findByIdAndUserId(Long id, Long userId) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", "id", id));
        return GoalDTO.fromEntity(goal);
    }

    @Transactional
    public GoalDTO create(Long userId, CreateGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        FinancialGoal goal = FinancialGoal.builder()
                .user(user)
                .description(request.getDescription())
                .targetValue(request.getTargetValue())
                .deadline(request.getDeadline())
                .status(GoalStatus.ACTIVE)
                .build();

        goal = goalRepository.save(goal);
        return GoalDTO.fromEntity(goal);
    }

    @Transactional
    public GoalDTO update(Long id, Long userId, UpdateGoalRequest request) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", "id", id));

        if (request.getDescription() != null) {
            goal.setDescription(request.getDescription());
        }
        if (request.getTargetValue() != null) {
            goal.setTargetValue(request.getTargetValue());
        }
        if (request.getCurrentValue() != null) {
            goal.setCurrentValue(request.getCurrentValue());
        }
        if (request.getDeadline() != null) {
            goal.setDeadline(request.getDeadline());
        }
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        if (goal.getCurrentValue().compareTo(goal.getTargetValue()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        goal = goalRepository.save(goal);
        return GoalDTO.fromEntity(goal);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialGoal", "id", id));
        goalRepository.delete(goal);
    }
}
