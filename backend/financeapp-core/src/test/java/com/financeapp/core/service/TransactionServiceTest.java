package com.financeapp.core.service;

import com.financeapp.core.dto.CreateTransactionRequest;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.dto.UpdateTransactionRequest;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.Transaction;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.TransactionRepository;
import com.financeapp.core.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User createUser() {
        return User.builder().id(1L).name("John").email("john@email.com").build();
    }

    private Category createCategory() {
        return Category.builder().id(1L).user(createUser()).name("Food").build();
    }

    private Transaction createTransaction() {
        return Transaction.builder()
                .id(1L)
                .user(createUser())
                .category(createCategory())
                .description("Lunch")
                .amount(BigDecimal.valueOf(25.50))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .build();
    }

    @Test
    void findByUserId_shouldReturnListOfTransactions() {
        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(1L)).thenReturn(List.of(createTransaction()));

        List<TransactionDTO> result = transactionService.findByUserId(1L);

        assertEquals(1, result.size());
        assertEquals("Lunch", result.get(0).getDescription());
        assertEquals(TransactionType.EXPENSE, result.get(0).getTransactionType());
    }

    @Test
    void create_withValidData_shouldReturnTransactionDTO() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .description("Lunch")
                .amount(BigDecimal.valueOf(25.50))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .categoryId(1L)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createCategory()));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });

        TransactionDTO result = transactionService.create(1L, request);

        assertNotNull(result);
        assertEquals("Lunch", result.getDescription());
        assertEquals(BigDecimal.valueOf(25.50), result.getAmount());
    }

    @Test
    void create_withInvalidCategory_shouldThrowResourceNotFoundException() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .amount(BigDecimal.valueOf(25.50))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .categoryId(99L)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.create(1L, request));
    }

    @Test
    void update_withValidData_shouldReturnUpdatedTransaction() {
        UpdateTransactionRequest request = UpdateTransactionRequest.builder()
                .description("Dinner")
                .amount(BigDecimal.valueOf(35.00))
                .build();

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(createTransaction()));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionDTO result = transactionService.update(1L, 1L, request);

        assertEquals("Dinner", result.getDescription());
        assertEquals(BigDecimal.valueOf(35.00), result.getAmount());
    }

    @Test
    void update_withWrongUser_shouldThrowResourceNotFoundException() {
        Transaction transaction = createTransaction();
        User otherUser = User.builder().id(2L).build();
        transaction.setUser(otherUser);

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.update(1L, 1L, new UpdateTransactionRequest()));
    }

    @Test
    void delete_withValidId_shouldDeleteTransaction() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(createTransaction()));

        assertDoesNotThrow(() -> transactionService.delete(1L, 1L));
        verify(transactionRepository).delete(any(Transaction.class));
    }

    @Test
    void delete_withInvalidId_shouldThrowResourceNotFoundException() {
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.delete(99L, 1L));
    }
}
