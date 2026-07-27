package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.service.DashboardService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DashboardController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getSummary_shouldReturnDashboardSummary() throws Exception {
        DashboardSummary summary = DashboardSummary.builder()
                .totalBalance(BigDecimal.valueOf(10000))
                .totalIncome(BigDecimal.valueOf(15000))
                .totalExpenses(BigDecimal.valueOf(5000))
                .savingsRate(BigDecimal.valueOf(66.7))
                .transactionCount(42)
                .categoryCount(5)
                .build();

        when(dashboardService.getSummary(anyLong(), any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBalance").value(10000))
                .andExpect(jsonPath("$.transactionCount").value(42));
    }

    @Test
    void getMonthlySummary_shouldReturnList() throws Exception {
        List<MonthlySummary> summaries = List.of(
                MonthlySummary.builder().month("2026-01").income(BigDecimal.valueOf(5000)).expenses(BigDecimal.valueOf(2000)).build(),
                MonthlySummary.builder().month("2026-02").income(BigDecimal.valueOf(5500)).expenses(BigDecimal.valueOf(2500)).build()
        );

        when(dashboardService.getMonthlySummary(anyLong(), anyInt())).thenReturn(summaries);

        mockMvc.perform(get("/api/v1/dashboard/monthly")
                        .with(withAuthenticatedUser())
                        .param("months", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].month").value("2026-01"));
    }

    @Test
    void getCategorySummary_shouldReturnList() throws Exception {
        List<CategorySummary> categories = List.of(
                CategorySummary.builder().categoryName("Food").categoryId(1L).total(BigDecimal.valueOf(1500)).transactionCount(5).build(),
                CategorySummary.builder().categoryName("Transport").categoryId(2L).total(BigDecimal.valueOf(500)).transactionCount(2).build()
        );

        when(dashboardService.getCategorySummary(anyLong(), any(), any())).thenReturn(categories);

        mockMvc.perform(get("/api/v1/dashboard/categories")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].categoryName").value("Food"));
    }

    @Test
    void exportCsv_shouldReturnCsvFile() throws Exception {
        List<TransactionDTO> transactions = List.of(
                TransactionDTO.builder()
                        .id(1L).description("Salary").amount(BigDecimal.valueOf(5000))
                        .transactionType(TransactionType.INCOME)
                        .transactionDate(LocalDate.of(2026, 1, 15))
                        .categoryName("Work")
                        .build(),
                TransactionDTO.builder()
                        .id(2L).description("Groceries").amount(BigDecimal.valueOf(200))
                        .transactionType(TransactionType.EXPENSE)
                        .transactionDate(LocalDate.of(2026, 1, 20))
                        .categoryName("Food")
                        .build()
        );

        when(transactionService.findByUserId(anyLong())).thenReturn(transactions);

        mockMvc.perform(get("/api/v1/dashboard/export/csv")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=transactions.csv"))
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Date,Description,Category,Type,Amount")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Salary")));
    }

    @Test
    void exportCsv_shouldSanitizeFields() throws Exception {
        List<TransactionDTO> transactions = List.of(
                TransactionDTO.builder()
                        .id(1L).description("=DANGEROUS_FORMULA").amount(BigDecimal.TEN)
                        .transactionType(TransactionType.EXPENSE)
                        .transactionDate(LocalDate.now())
                        .categoryName("=EVIL")
                        .build()
        );

        when(transactionService.findByUserId(anyLong())).thenReturn(transactions);

        mockMvc.perform(get("/api/v1/dashboard/export/csv")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("'=DANGEROUS_FORMULA")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("'=EVIL")));
    }
}
