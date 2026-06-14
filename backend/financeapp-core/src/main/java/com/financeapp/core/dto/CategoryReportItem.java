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
public class CategoryReportItem {
    private String categoryName;
    private BigDecimal amount;
    private Integer transactionCount;
    private String type; // INCOME or EXPENSE
}