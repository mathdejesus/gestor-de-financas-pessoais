package com.financeapp.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportItem {
    private String month; // "2026-06"
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal balance;
}