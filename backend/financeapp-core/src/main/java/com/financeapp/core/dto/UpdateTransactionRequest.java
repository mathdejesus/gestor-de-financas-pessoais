package com.financeapp.core.dto;

import com.financeapp.core.enums.TransactionType;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTransactionRequest {

    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;

    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private TransactionType transactionType;

    private LocalDate transactionDate;

    private Long categoryId;
}
