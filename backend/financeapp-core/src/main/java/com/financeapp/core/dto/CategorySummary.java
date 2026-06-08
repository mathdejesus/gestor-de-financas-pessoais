package com.financeapp.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummary {
    private Long categoryId;
    private String categoryName;
    private String color;
    private BigDecimal total;
    private int transactionCount;
}
