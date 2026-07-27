package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.enums.GoalStatus;
import com.financeapp.core.service.GoalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GoalController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class GoalControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void findAll_shouldReturnGoalList() throws Exception {
        List<GoalDTO> goals = List.of(
                GoalDTO.builder().id(1L).description("Emergency Fund").targetValue(BigDecimal.valueOf(10000))
                        .currentValue(BigDecimal.valueOf(5000)).status(GoalStatus.ACTIVE).build(),
                GoalDTO.builder().id(2L).description("New Laptop").targetValue(BigDecimal.valueOf(3000))
                        .currentValue(BigDecimal.valueOf(3000)).status(GoalStatus.COMPLETED).build()
        );

        when(goalService.findByUserId(1L)).thenReturn(goals);

        mockMvc.perform(get("/api/v1/goals")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Emergency Fund"));
    }

    @Test
    void findAll_withStatusFilter_shouldFilterByStatus() throws Exception {
        when(goalService.findByUserIdAndStatus(anyLong(), any(GoalStatus.class))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/goals")
                        .with(withAuthenticatedUser())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());
    }

    @Test
    void findById_shouldReturnGoal() throws Exception {
        GoalDTO goal = GoalDTO.builder().id(1L).description("Vacation").targetValue(BigDecimal.valueOf(5000))
                .currentValue(BigDecimal.valueOf(2500)).status(GoalStatus.ACTIVE).build();

        when(goalService.findByIdAndUserId(1L, 1L)).thenReturn(goal);

        mockMvc.perform(get("/api/v1/goals/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Vacation"));
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateGoalRequest request = CreateGoalRequest.builder()
                .description("New Goal")
                .targetValue(BigDecimal.valueOf(5000))
                .deadline(LocalDate.now().plusMonths(6))
                .build();

        GoalDTO created = GoalDTO.builder().id(10L).description("New Goal")
                .targetValue(BigDecimal.valueOf(5000)).currentValue(BigDecimal.ZERO)
                .status(GoalStatus.ACTIVE).build();

        when(goalService.create(anyLong(), any(CreateGoalRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/goals")
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("New Goal"));
    }

    @Test
    void update_shouldReturnUpdatedGoal() throws Exception {
        UpdateGoalRequest request = UpdateGoalRequest.builder()
                .description("Updated Goal")
                .targetValue(BigDecimal.valueOf(8000))
                .currentValue(BigDecimal.valueOf(4000))
                .build();

        GoalDTO updated = GoalDTO.builder().id(1L).description("Updated Goal")
                .targetValue(BigDecimal.valueOf(8000)).currentValue(BigDecimal.valueOf(4000))
                .status(GoalStatus.ACTIVE).build();

        when(goalService.update(anyLong(), anyLong(), any(UpdateGoalRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/goals/{id}", 1L)
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated Goal"));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(goalService).delete(1L, 1L);

        mockMvc.perform(delete("/api/v1/goals/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isNoContent());
    }
}
