package com.financeapp.core.service;

import com.financeapp.core.dto.CategorySummary;
import com.financeapp.core.dto.DashboardSummary;
import com.financeapp.core.dto.MonthlySummary;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.Transaction;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private User createUser() {
        return User.builder().id(1L).name("John").email("john@email.com").build();
    }

    private Category createCategory() {
        return Category.builder().id(1L).user(createUser()).name("Food").color("#FF0000").build();
    }

    private Transaction createTransaction(BigDecimal amount, TransactionType type) {
        return Transaction.builder()
                .id(1L)
                .user(createUser())
                .category(createCategory())
                .amount(amount)
                .transactionType(type)
                .transactionDate(LocalDate.now())
                .build();
    }

    @Test
    void getSummary_withTransactions_shouldReturnCorrectValues() {
        List<Transaction> transactions = List.of(
                createTransaction(BigDecimal.valueOf(5000), TransactionType.INCOME),
                createTransaction(BigDecimal.valueOf(2000), TransactionType.EXPENSE),
                createTransaction(BigDecimal.valueOf(1000), TransactionType.EXPENSE)
        );

        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(1L)).thenReturn(transactions);
        when(categoryRepository.findByUserIdOrderByUserId(1L)).thenReturn(List.of(createCategory()));

        DashboardSummary summary = dashboardService.getSummary(1L, null, null);

        assertEquals(0, summary.getTotalIncome().compareTo(BigDecimal.valueOf(5000)));
        assertEquals(0, summary.getTotalExpenses().compareTo(BigDecimal.valueOf(3000)));
        assertEquals(0, summary.getTotalBalance().compareTo(BigDecimal.valueOf(2000)));
        assertEquals(3, summary.getTransactionCount());
        assertEquals(1, summary.getCategoryCount());
    }

    @Test
    void getSummary_withNoTransactions_shouldReturnZeros() {
        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(1L)).thenReturn(List.of());
        when(categoryRepository.findByUserIdOrderByUserId(1L)).thenReturn(List.of());

        DashboardSummary summary = dashboardService.getSummary(1L, null, null);

        assertEquals(0, summary.getTotalBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, summary.getTransactionCount());
    }

    @Test
    void getMonthlySummary_shouldReturnMonthlyData() {
        when(transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.any(LocalDate.class)))
                .thenReturn(List.of());

        List<MonthlySummary> result = dashboardService.getMonthlySummary(1L, 6);

        assertEquals(6, result.size());
    }

    @Test
    void getCategorySummary_withExpenses_shouldGroupByCategory() {
        Transaction t1 = createTransaction(BigDecimal.valueOf(100), TransactionType.EXPENSE);
        Transaction t2 = createTransaction(BigDecimal.valueOf(200), TransactionType.EXPENSE);
        Transaction t3 = createTransaction(BigDecimal.valueOf(500), TransactionType.INCOME);

        when(transactionRepository.findByUserIdOrderByTransactionDateDesc(1L))
                .thenReturn(List.of(t1, t2, t3));

        List<CategorySummary> result = dashboardService.getCategorySummary(1L, null, null);

        assertFalse(result.isEmpty());
        assertEquals("Food", result.get(0).getCategoryName());
        assertEquals(0, result.get(0).getTotal().compareTo(BigDecimal.valueOf(300)));
        assertEquals(2, result.get(0).getTransactionCount());
    }
}
