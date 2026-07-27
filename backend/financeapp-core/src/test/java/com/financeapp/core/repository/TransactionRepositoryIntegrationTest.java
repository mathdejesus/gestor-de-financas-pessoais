package com.financeapp.core.repository;

import com.financeapp.core.AbstractPostgresIntegrationTest;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.Transaction;
import com.financeapp.core.entity.User;
import com.financeapp.core.enums.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TransactionRepositoryIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Transaction Test User")
                .email("txn-test@test.com")
                .passwordHash("$2a$12$hash")
                .tokenVersion(0)
                .build());

        testCategory = categoryRepository.save(Category.builder()
                .name("Test Category")
                .icon("📁")
                .color("#333")
                .user(testUser)
                .build());
    }

    @Test
    void shouldSaveAndFindTransaction() {
        Transaction txn = Transaction.builder()
                .description("Test Transaction")
                .amount(BigDecimal.valueOf(100))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .user(testUser)
                .category(testCategory)
                .build();

        Transaction saved = transactionRepository.save(txn);

        assertNotNull(saved.getId());
        assertEquals("Test Transaction", saved.getDescription());
        assertEquals(0, BigDecimal.valueOf(100).compareTo(saved.getAmount()));
        assertEquals(TransactionType.EXPENSE, saved.getTransactionType());
    }

    @Test
    void shouldFindByUserId() {
        Transaction txn1 = Transaction.builder()
                .description("First").amount(BigDecimal.valueOf(50))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .user(testUser).category(testCategory)
                .build();

        Transaction txn2 = Transaction.builder()
                .description("Second").amount(BigDecimal.valueOf(200))
                .transactionType(TransactionType.INCOME)
                .transactionDate(LocalDate.now())
                .user(testUser).category(testCategory)
                .build();

        transactionRepository.save(txn1);
        transactionRepository.save(txn2);

        List<Transaction> found = transactionRepository.findByUserIdOrderByTransactionDateDesc(testUser.getId());

        assertEquals(2, found.size());
    }

    @Test
    void shouldFindByUserIdAndDateRange() {
        Transaction txn = Transaction.builder()
                .description("January Expense").amount(BigDecimal.valueOf(75))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.of(2026, 1, 15))
                .user(testUser).category(testCategory)
                .build();
        transactionRepository.save(txn);

        List<Transaction> found = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                testUser.getId(), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));

        assertEquals(1, found.size());
        assertEquals("January Expense", found.get(0).getDescription());

        List<Transaction> outOfRange = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                testUser.getId(), LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28));

        assertTrue(outOfRange.isEmpty());
    }

    @Test
    void shouldHandleUncategorizedTransaction() {
        Transaction txn = Transaction.builder()
                .description("No Category").amount(BigDecimal.valueOf(50))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .user(testUser)
                .category(null)  // explicitly no category
                .build();

        Transaction saved = transactionRepository.save(txn);

        assertNotNull(saved.getId());
        assertNull(saved.getCategory());
    }

    @Test
    void shouldDeleteTransaction() {
        Transaction txn = Transaction.builder()
                .description("To Delete").amount(BigDecimal.valueOf(10))
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDate.now())
                .user(testUser)
                .build();
        txn = transactionRepository.save(txn);

        transactionRepository.deleteById(txn.getId());

        assertTrue(transactionRepository.findById(txn.getId()).isEmpty());
    }
}
