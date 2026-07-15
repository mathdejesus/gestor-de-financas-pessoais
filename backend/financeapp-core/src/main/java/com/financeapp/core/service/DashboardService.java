package com.financeapp.core.service;

import com.financeapp.core.dto.CategorySummary;
import com.financeapp.core.dto.DashboardSummary;
import com.financeapp.core.dto.MonthlySummary;
import com.financeapp.core.entity.Transaction;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregation service for dashboard KPIs and charts.
 * Computes totals, monthly trends, and category breakdowns from
 * the user's transactions within an optional date range.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public DashboardSummary getSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions;

        if (startDate != null && endDate != null) {
            transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                    userId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        }

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalBalance = totalIncome.subtract(totalExpenses);

        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalBalance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return DashboardSummary.builder()
                .totalBalance(totalBalance)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .savingsRate(savingsRate)
                .transactionCount(transactions.size())
                .categoryCount(categoryRepository.countByUserId(userId))
                .build();
    }

    @Transactional(readOnly = true)
    public List<MonthlySummary> getMonthlySummary(Long userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months - 1).withDayOfMonth(1);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate);

        Map<String, BigDecimal[]> monthlyData = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            String key = ym.format(formatter);
            monthlyData.put(key, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }

        for (Transaction t : transactions) {
            String key = YearMonth.from(t.getTransactionDate()).format(formatter);
            BigDecimal[] values = monthlyData.get(key);
            if (values != null) {
                if (t.getTransactionType() == TransactionType.INCOME) {
                    values[0] = values[0].add(t.getAmount());
                } else {
                    values[1] = values[1].add(t.getAmount());
                }
            }
        }

        List<MonthlySummary> result = new ArrayList<>();
        monthlyData.forEach((month, values) ->
                result.add(MonthlySummary.builder()
                        .month(month)
                        .income(values[0])
                        .expenses(values[1])
                        .build())
        );

        return result;
    }

    @Transactional(readOnly = true)
    public List<CategorySummary> getCategorySummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions;

        if (startDate != null && endDate != null) {
            transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                    userId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        }

        Map<Long, CategorySummary> categoryMap = new LinkedHashMap<>();

        for (Transaction t : transactions) {
            if (t.getCategory() != null && t.getTransactionType() == TransactionType.EXPENSE) {
                Long catId = t.getCategory().getId();
                categoryMap.computeIfAbsent(catId, id -> CategorySummary.builder()
                        .categoryId(catId)
                        .categoryName(t.getCategory().getName())
                        .color(t.getCategory().getColor())
                        .total(BigDecimal.ZERO)
                        .transactionCount(0)
                        .build());

                CategorySummary summary = categoryMap.get(catId);
                summary.setTotal(summary.getTotal().add(t.getAmount()));
                summary.setTransactionCount(summary.getTransactionCount() + 1);
            }
        }

        return new ArrayList<>(categoryMap.values());
    }
}
