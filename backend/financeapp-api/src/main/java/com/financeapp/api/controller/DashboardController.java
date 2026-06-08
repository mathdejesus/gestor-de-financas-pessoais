package com.financeapp.api.controller;

import com.financeapp.core.dto.CategorySummary;
import com.financeapp.core.dto.DashboardSummary;
import com.financeapp.core.dto.MonthlySummary;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.DashboardService;
import com.financeapp.core.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard summary, charts and export")
public class DashboardController {

    private final DashboardService dashboardService;
    private final TransactionService transactionService;

    @GetMapping("/summary")
    @Operation(summary = "Dashboard summary", description = "Get KPI summary (balance, income, expenses, savings)")
    public ResponseEntity<DashboardSummary> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(dashboardService.getSummary(user.getId(), startDate, endDate));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Monthly summary", description = "Get monthly income vs expenses for charts")
    public ResponseEntity<List<MonthlySummary>> getMonthlySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(dashboardService.getMonthlySummary(user.getId(), months));
    }

    @GetMapping("/categories")
    @Operation(summary = "Category summary", description = "Get expenses grouped by category")
    public ResponseEntity<List<CategorySummary>> getCategorySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(dashboardService.getCategorySummary(user.getId(), startDate, endDate));
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export CSV", description = "Export transactions as CSV file")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<TransactionDTO> transactions;
        if (startDate != null && endDate != null) {
            transactions = transactionService.findByFilters(user.getId(), startDate, endDate, null);
        } else {
            transactions = transactionService.findByUserId(user.getId());
        }

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Description,Category,Type,Amount\n");

        for (TransactionDTO t : transactions) {
            csv.append(t.getTransactionDate()).append(",");
            csv.append("\"").append(t.getDescription() != null ? t.getDescription().replace("\"", "\"\"") : "").append("\",");
            csv.append("\"").append(t.getCategoryName() != null ? t.getCategoryName() : "").append("\",");
            csv.append(t.getTransactionType()).append(",");
            csv.append(t.getAmount()).append("\n");
        }

        byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .contentLength(content.length)
                .body(content);
    }
}
