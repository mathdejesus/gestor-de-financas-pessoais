package com.financeapp.api.controller;

import com.financeapp.core.dto.CreateTransactionRequest;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.dto.UpdateTransactionRequest;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management (income/expenses)")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "List transactions", description = "Get all transactions with optional filters")
    public ResponseEntity<List<TransactionDTO>> findAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {

        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(transactionService.findByFilters(user.getId(), startDate, endDate, categoryId));
        }
        if (startDate != null || endDate != null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Both startDate and endDate must be provided for date filtering");
        }
        return ResponseEntity.ok(transactionService.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID", description = "Get a specific transaction by its ID")
    public ResponseEntity<TransactionDTO> findById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.findByIdAndUserId(id, user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create transaction", description = "Create a new transaction (income or expense)")
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody CreateTransactionRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(user.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction", description = "Update an existing transaction")
    public ResponseEntity<TransactionDTO> update(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateTransactionRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.update(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction", description = "Delete a transaction by its ID")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        transactionService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
