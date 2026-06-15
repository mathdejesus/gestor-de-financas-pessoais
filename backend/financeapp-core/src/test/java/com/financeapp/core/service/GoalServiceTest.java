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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private FinancialGoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GoalService goalService;

    private User createUser() {
        return User.builder().id(1L).name("John").email("john@email.com").build();
    }

    private FinancialGoal createGoal() {
        return FinancialGoal.builder()
                .id(1L)
                .user(createUser())
                .description("Emergency Fund")
                .targetValue(BigDecimal.valueOf(10000))
                .currentValue(BigDecimal.valueOf(3000))
                .deadline(LocalDate.now().plusMonths(6))
                .status(GoalStatus.ACTIVE)
                .createdAt(LocalDate.now().minusMonths(1).atStartOfDay())
                .build();
    }

    @Test
    void findByUserId_shouldReturnListOfGoals() {
        when(goalRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(createGoal()));

        List<GoalDTO> result = goalService.findByUserId(1L);

        assertEquals(1, result.size());
        assertEquals("Emergency Fund", result.get(0).getDescription());
        assertEquals(0, result.get(0).getTargetValue().compareTo(BigDecimal.valueOf(10000)));
    }

    @Test
    void create_withValidData_shouldReturnGoalDTO() {
        CreateGoalRequest request = new CreateGoalRequest("Vacation Fund", BigDecimal.valueOf(5000), LocalDate.now().plusMonths(3));
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(goalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> {
            FinancialGoal goal = invocation.getArgument(0);
            goal.setId(1L);
            goal.setCreatedAt(LocalDate.now().atStartOfDay());
            return goal;
        });

        GoalDTO result = goalService.create(1L, request);

        assertNotNull(result);
        assertEquals("Vacation Fund", result.getDescription());
        assertEquals(0, result.getTargetValue().compareTo(BigDecimal.valueOf(5000)));
        assertEquals(GoalStatus.ACTIVE, result.getStatus());
    }

    @Test
    void create_withInvalidUser_shouldThrowResourceNotFoundException() {
        CreateGoalRequest request = new CreateGoalRequest("Fund", BigDecimal.valueOf(5000), null);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.create(99L, request));
    }

    @Test
    void update_progressExceedsTarget_shouldMarkAsCompleted() {
        UpdateGoalRequest request = UpdateGoalRequest.builder()
                .currentValue(BigDecimal.valueOf(10000))
                .build();

        when(goalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createGoal()));
        when(goalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GoalDTO result = goalService.update(1L, 1L, request);

        assertEquals(GoalStatus.COMPLETED, result.getStatus());
    }

    @Test
    void update_changeStatus_shouldUpdateStatus() {
        UpdateGoalRequest request = UpdateGoalRequest.builder()
                .status(GoalStatus.ABANDONED)
                .build();

        when(goalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createGoal()));
        when(goalRepository.save(any(FinancialGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GoalDTO result = goalService.update(1L, 1L, request);

        assertEquals(GoalStatus.ABANDONED, result.getStatus());
    }

    @Test
    void delete_withValidId_shouldDelete() {
        when(goalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createGoal()));

        assertDoesNotThrow(() -> goalService.delete(1L, 1L));
        verify(goalRepository).delete(any(FinancialGoal.class));
    }

    @Test
    void delete_withInvalidId_shouldThrowResourceNotFoundException() {
        when(goalRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.delete(99L, 1L));
    }

    @Test
    void progressPercentage_shouldBeCalculatedCorrectly() {
        when(goalRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(createGoal()));

        List<GoalDTO> result = goalService.findByUserId(1L);

        assertEquals(0, result.get(0).getProgressPercentage().compareTo(BigDecimal.valueOf(30.0)));
    }
}
