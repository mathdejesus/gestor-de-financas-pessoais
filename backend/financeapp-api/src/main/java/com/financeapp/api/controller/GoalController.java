package com.financeapp.api.controller;

import com.financeapp.core.dto.CreateGoalRequest;
import com.financeapp.core.dto.GoalDTO;
import com.financeapp.core.dto.UpdateGoalRequest;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.GoalStatus;
import com.financeapp.core.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@Tag(name = "Financial Goals", description = "Goal creation and progress tracking")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @Operation(summary = "List goals", description = "Get all goals for the authenticated user")
    public ResponseEntity<List<GoalDTO>> findAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) GoalStatus status) {
        if (status != null) {
            return ResponseEntity.ok(goalService.findByUserIdAndStatus(user.getId(), status));
        }
        return ResponseEntity.ok(goalService.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goal by ID", description = "Get a specific goal with progress info")
    public ResponseEntity<GoalDTO> findById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.findByIdAndUserId(id, user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create goal", description = "Create a new financial goal")
    public ResponseEntity<GoalDTO> create(@Valid @RequestBody CreateGoalRequest request,
                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.create(user.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update goal", description = "Update goal progress, target, or status")
    public ResponseEntity<GoalDTO> update(@PathVariable Long id,
                                          @Valid @RequestBody UpdateGoalRequest request,
                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.update(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete goal", description = "Delete a financial goal")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        goalService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
