package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.service.TransactionService;
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

@WebMvcTest(controllers = TransactionController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void findAll_shouldReturnTransactionList() throws Exception {
        List<TransactionDTO> transactions = List.of(
                TransactionDTO.builder()
                        .id(1L).description("Salary").amount(BigDecimal.valueOf(5000))
                        .transactionType(TransactionType.INCOME)
                        .transactionDate(LocalDate.now())
                        .categoryName("Work")
                        .build(),
                TransactionDTO.builder()
                        .id(2L).description("Groceries").amount(BigDecimal.valueOf(200))
                        .transactionType(TransactionType.EXPENSE)
                        .transactionDate(LocalDate.now())
                        .categoryName("Food")
                        .build()
        );

        when(transactionService.findByUserId(1L)).thenReturn(transactions);

        mockMvc.perform(get("/api/v1/transactions")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Salary"))
                .andExpect(jsonPath("$[1].description").value("Groceries"));
    }

    @Test
    void findAll_withDateFilter_shouldFilterTransactions() throws Exception {
        LocalDate start = LocalDate.of(2026, 1, 1);
        LocalDate end = LocalDate.of(2026, 12, 31);

        when(transactionService.findByFilters(anyLong(), any(LocalDate.class), any(LocalDate.class), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/transactions")
                        .with(withAuthenticatedUser())
                        .param("startDate", start.toString())
                        .param("endDate", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void findAll_withPartialDateFilter_shouldReturn400() throws Exception {
        mockMvc.perform(get("/api/v1/transactions")
                        .with(withAuthenticatedUser())
                        .param("startDate", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findById_shouldReturnTransaction() throws Exception {
        TransactionDTO dto = TransactionDTO.builder()
                .id(1L).description("Freelance").amount(BigDecimal.valueOf(1500))
                .transactionType(TransactionType.INCOME)
                .transactionDate(LocalDate.now())
                .build();

        when(transactionService.findByIdAndUserId(1L, 1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/transactions/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Freelance"))
                .andExpect(jsonPath("$.amount").value(1500));
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .description("New expense")
                .amount(BigDecimal.valueOf(99.99))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .categoryId(1L)
                .build();

        TransactionDTO created = TransactionDTO.builder()
                .id(10L).description("New expense").amount(BigDecimal.valueOf(99.99))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .categoryId(1L).categoryName("Food")
                .build();

        when(transactionService.create(anyLong(), any(CreateTransactionRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/transactions")
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.description").value("New expense"));
    }

    @Test
    void create_shouldReturn400WhenInvalid() throws Exception {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .description("")   // valid, but no amount
                .build();

        mockMvc.perform(post("/api/v1/transactions")
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"));
    }

    @Test
    void update_shouldReturnUpdatedTransaction() throws Exception {
        UpdateTransactionRequest request = UpdateTransactionRequest.builder()
                .description("Updated")
                .amount(BigDecimal.valueOf(200))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .build();

        TransactionDTO updated = TransactionDTO.builder()
                .id(1L).description("Updated").amount(BigDecimal.valueOf(200))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .build();

        when(transactionService.update(anyLong(), anyLong(), any(UpdateTransactionRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/transactions/{id}", 1L)
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated"));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(transactionService).delete(1L, 1L);

        mockMvc.perform(delete("/api/v1/transactions/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isNoContent());
    }
}
