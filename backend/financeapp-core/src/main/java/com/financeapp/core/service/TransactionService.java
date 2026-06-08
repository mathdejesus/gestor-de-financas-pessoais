package com.financeapp.core.service;

import com.financeapp.core.dto.CreateTransactionRequest;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.dto.UpdateTransactionRequest;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.Transaction;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.TransactionRepository;
import com.financeapp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<TransactionDTO> findByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> findByFilters(Long userId, LocalDate startDate, LocalDate endDate, Long categoryId) {
        return transactionRepository.findByFilters(userId, startDate, endDate, categoryId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionDTO findByIdAndUserId(Long id, Long userId) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        return toDTO(transaction);
    }

    @Transactional
    public TransactionDTO create(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .description(request.getDescription())
                .amount(request.getAmount())
                .transactionType(request.getTransactionType())
                .transactionDate(request.getTransactionDate())
                .build();

        transaction = transactionRepository.save(transaction);
        return toDTO(transaction);
    }

    @Transactional
    public TransactionDTO update(Long id, Long userId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getTransactionType() != null) {
            transaction.setTransactionType(request.getTransactionType());
        }
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);
        return toDTO(transaction);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Transaction transaction = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        transactionRepository.delete(transaction);
    }

    private TransactionDTO toDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .transactionDate(transaction.getTransactionDate())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
