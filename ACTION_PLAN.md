# INSTRUÇÕES PARA NEMOTRON 3 ULTRA
## Implementação de Funcionalidades Faltantes - Financial Management Platform

**Repositório:** `github.com/mathdejesus/gestor-de-financas-pessoais`  
**Data:** Junho 2026  
**Prioridade:** 3 funcionalidades críticas do MVP  

---

## 📋 ESCOPO

Este documento contém instruções para implementar **3 funcionalidades críticas**:

1. **Página de Relatórios Financeiros** (Backend + Frontend)
2. **Página de Metas Financeiras** (Backend + Frontend)
3. **Página de Settings/Perfil** (Frontend)

Cada funcionalidade inclui:
- Estrutura de arquivos a criar/modificar
- Código exemplo (copiar/adaptar)
- Endpoints REST esperados
- Componentes Preact esperados
- Testes básicos a escrever

---

## 🎯 ANTES DE COMEÇAR

**Stack atual:**
- Frontend: Preact 10.29.1 (NÃO React), TypeScript, Tailwind CSS 4, ky (HTTP client)
- Backend: Java 21, Spring Boot 3.2.x, PostgreSQL 15+
- Roteamento Frontend: Hash-based (window.location.hash)
- Testes Frontend: Vitest + @testing-library/preact
- Testes Backend: JUnit 5 + Gradle

**Padrões do Projeto:**
- Services usam `ky` para HTTP requests (não Axios)
- Components são Preact function components (não classe)
- Backend segue padrão Controller → Service → Repository
- Todas as requisições são autenticadas com JWT no header `Authorization: Bearer <token>`
- Banco de dados usa Flyway para migrations (arquivos em `backend/src/main/resources/db/migration/`)

---

# FUNCIONALIDADE 1: RELATÓRIOS FINANCEIROS

## Backend - Relatórios Financeiros

### 1.1 Criar Entidade & DTO

**Arquivo:** `backend/src/main/java/com/financeapp/model/dto/ReportResponse.java`

```java
package com.financeapp.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CategoryReportItem> byCategory;
    private List<MonthlyReportItem> byMonth;

    // Getters e Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public List<CategoryReportItem> getByCategory() { return byCategory; }
    public void setByCategory(List<CategoryReportItem> byCategory) { this.byCategory = byCategory; }

    public List<MonthlyReportItem> getByMonth() { return byMonth; }
    public void setByMonth(List<MonthlyReportItem> byMonth) { this.byMonth = byMonth; }
}
```

**Arquivo:** `backend/src/main/java/com/financeapp/model/dto/CategoryReportItem.java`

```java
package com.financeapp.model.dto;

import java.math.BigDecimal;

public class CategoryReportItem {
    private String categoryName;
    private BigDecimal amount;
    private Integer transactionCount;
    private String type; // INCOME ou EXPENSE

    public CategoryReportItem(String categoryName, BigDecimal amount, Integer transactionCount, String type) {
        this.categoryName = categoryName;
        this.amount = amount;
        this.transactionCount = transactionCount;
        this.type = type;
    }

    // Getters
    public String getCategoryName() { return categoryName; }
    public BigDecimal getAmount() { return amount; }
    public Integer getTransactionCount() { return transactionCount; }
    public String getType() { return type; }
}
```

**Arquivo:** `backend/src/main/java/com/financeapp/model/dto/MonthlyReportItem.java`

```java
package com.financeapp.model.dto;

import java.math.BigDecimal;

public class MonthlyReportItem {
    private String month; // "2026-06"
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal balance;

    public MonthlyReportItem(String month, BigDecimal income, BigDecimal expense) {
        this.month = month;
        this.income = income;
        this.expense = expense;
        this.balance = income.subtract(expense);
    }

    public String getMonth() { return month; }
    public BigDecimal getIncome() { return income; }
    public BigDecimal getExpense() { return expense; }
    public BigDecimal getBalance() { return balance; }
}
```

### 1.2 Criar Service

**Arquivo:** `backend/src/main/java/com/financeapp/service/ReportService.java`

```java
package com.financeapp.service;

import com.financeapp.model.dto.*;
import com.financeapp.model.entity.Transaction;
import com.financeapp.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public ReportResponse generateReport(String userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(
            userId, startDate, endDate
        );

        ReportResponse report = new ReportResponse();
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        // Calcular totais por tipo
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if ("INCOME".equals(t.getTransactionType())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        report.setTotalIncome(totalIncome);
        report.setTotalExpense(totalExpense);
        report.setBalance(totalIncome.subtract(totalExpense));

        // Agrupar por categoria
        report.setByCategory(groupByCategory(transactions));

        // Agrupar por mês
        report.setByMonth(groupByMonth(transactions));

        return report;
    }

    private List<CategoryReportItem> groupByCategory(List<Transaction> transactions) {
        Map<String, List<Transaction>> grouped = transactions.stream()
            .collect(Collectors.groupingBy(t -> t.getCategory().getName()));

        return grouped.entrySet().stream()
            .map(entry -> {
                String categoryName = entry.getKey();
                List<Transaction> items = entry.getValue();
                BigDecimal amount = items.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                String type = items.get(0).getTransactionType();
                return new CategoryReportItem(categoryName, amount, items.size(), type);
            })
            .collect(Collectors.toList());
    }

    private List<MonthlyReportItem> groupByMonth(List<Transaction> transactions) {
        Map<String, List<Transaction>> grouped = transactions.stream()
            .collect(Collectors.groupingBy(t -> YearMonth.from(t.getTransactionDate()).toString()));

        return grouped.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                String month = entry.getKey();
                List<Transaction> items = entry.getValue();
                BigDecimal income = items.stream()
                    .filter(t -> "INCOME".equals(t.getTransactionType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal expense = items.stream()
                    .filter(t -> "EXPENSE".equals(t.getTransactionType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return new MonthlyReportItem(month, income, expense);
            })
            .collect(Collectors.toList());
    }
}
```

**IMPORTANTE:** Adicionar método no `TransactionRepository`:

```java
List<Transaction> findByUserIdAndTransactionDateBetween(String userId, LocalDate startDate, LocalDate endDate);
```

### 1.3 Criar Controller

**Arquivo:** `backend/src/main/java/com/financeapp/controller/ReportController.java`

```java
package com.financeapp.controller;

import com.financeapp.model.dto.ReportResponse;
import com.financeapp.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/financial")
    public ResponseEntity<ReportResponse> generateFinancialReport(
        @RequestParam("startDate") String startDate,
        @RequestParam("endDate") String endDate,
        Authentication authentication
    ) {
        String userId = authentication.getName();
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        ReportResponse report = reportService.generateReport(userId, start, end);
        return ResponseEntity.ok(report);
    }
}
```

---

## Frontend - Página de Relatórios

### 1.4 Criar Hook para Relatórios

**Arquivo:** `frontend/src/hooks/useReports.ts`

```typescript
import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';

export interface ReportResponse {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Array<{
    categoryName: string;
    amount: number;
    transactionCount: number;
    type: string;
  }>;
  byMonth: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}

export function useReports() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`reports/financial?startDate=${startDate}&endDate=${endDate}`)
        .json<ReportResponse>();
      setReport(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, generateReport };
}
```

### 1.5 Criar Página de Relatórios

**Arquivo:** `frontend/src/pages/ReportsPage.tsx`

```typescript
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useReports } from '../hooks/useReports';
import { format, subMonths } from 'date-fns';

export function ReportsPage() {
  const { report, loading, error, generateReport } = useReports();
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 3), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleGenerateReport = () => {
    generateReport(startDate, endDate);
  };

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Relatórios Financeiros</h1>

        {/* Filtros */}
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-lg font-semibold mb-4">Filtros</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {report && (
          <div class="space-y-8">
            {/* Resumo */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-white rounded-lg shadow p-6">
                <div class="text-sm text-gray-600 mb-2">Receitas</div>
                <div class="text-2xl font-bold text-green-600">
                  R$ {report.totalIncome.toFixed(2)}
                </div>
              </div>
              <div class="bg-white rounded-lg shadow p-6">
                <div class="text-sm text-gray-600 mb-2">Despesas</div>
                <div class="text-2xl font-bold text-red-600">
                  R$ {report.totalExpense.toFixed(2)}
                </div>
              </div>
              <div class="bg-white rounded-lg shadow p-6">
                <div class="text-sm text-gray-600 mb-2">Saldo</div>
                <div class={`text-2xl font-bold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {report.balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Por Categoria */}
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold mb-4">Resumo por Categoria</h2>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-2">Categoria</th>
                      <th class="text-left py-2">Tipo</th>
                      <th class="text-right py-2">Valor</th>
                      <th class="text-right py-2">Qtd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byCategory.map((item) => (
                      <tr key={item.categoryName} class="border-b hover:bg-gray-50">
                        <td class="py-3">{item.categoryName}</td>
                        <td class="py-3">
                          <span class={`px-2 py-1 rounded text-sm ${
                            item.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td class="py-3 text-right">R$ {item.amount.toFixed(2)}</td>
                        <td class="py-3 text-right">{item.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Por Mês */}
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-semibold mb-4">Evolução Mensal</h2>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-2">Mês</th>
                      <th class="text-right py-2">Receitas</th>
                      <th class="text-right py-2">Despesas</th>
                      <th class="text-right py-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byMonth.map((item) => (
                      <tr key={item.month} class="border-b hover:bg-gray-50">
                        <td class="py-3">{item.month}</td>
                        <td class="py-3 text-right text-green-600">R$ {item.income.toFixed(2)}</td>
                        <td class="py-3 text-right text-red-600">R$ {item.expense.toFixed(2)}</td>
                        <td class={`py-3 text-right font-semibold ${item.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {item.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 1.6 Registrar Rota

**Arquivo:** `frontend/src/router.tsx` - Modificar para adicionar 'reports'

```typescript
type Route = 'login' | 'dashboard' | 'transactions' | 'settings' | 'reports' | 'not-found';

const routeMap: Record<string, Route> = {
  '/': 'dashboard',
  '/login': 'login',
  '/transactions': 'transactions',
  '/settings': 'settings',
  '/reports': 'reports',  // ADICIONAR ESTA LINHA
};

const pathMap: Record<Route, string> = {
  login: '/login',
  dashboard: '/',
  transactions: '/transactions',
  settings: '/settings',
  reports: '/reports',  // ADICIONAR ESTA LINHA
  'not-found': '/404',
};
```

### 1.7 Adicionar Navegação

**Arquivo:** `frontend/src/components/Header.tsx` - Adicionar link para Relatórios

```typescript
// Dentro do header, adicionar um link:
<a href="#/reports" class="px-4 py-2 hover:bg-gray-100 rounded">
  📊 Relatórios
</a>
```

---

# FUNCIONALIDADE 2: METAS FINANCEIRAS (FINANCIAL GOALS)

## Backend - Goals (já existem as bases, completar)

### 2.1 Garantir FinancialGoal Entity Completa

**Arquivo:** `backend/src/main/java/com/financeapp/model/entity/FinancialGoal.java`

```java
package com.financeapp.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financial_goals")
public class FinancialGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String description;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private LocalDate targetDate;
    private String status; // ACTIVE, COMPLETED, ABANDONED

    public FinancialGoal() {}

    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getTargetValue() { return targetValue; }
    public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }

    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
```

### 2.2 Adicionar Métodos ao Repository

**Arquivo:** `backend/src/main/java/com/financeapp/repository/FinancialGoalRepository.java`

```java
package com.financeapp.repository;

import com.financeapp.model.entity.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, String> {
    List<FinancialGoal> findByUserId(String userId);
    List<FinancialGoal> findByUserIdAndStatus(String userId, String status);
    Optional<FinancialGoal> findByIdAndUserId(String id, String userId);
}
```

### 2.3 Melhorar Service de Goals

**Arquivo:** `backend/src/main/java/com/financeapp/service/FinancialGoalService.java`

```java
package com.financeapp.service;

import com.financeapp.model.dto.FinancialGoalRequest;
import com.financeapp.model.dto.FinancialGoalResponse;
import com.financeapp.model.entity.FinancialGoal;
import com.financeapp.model.entity.User;
import com.financeapp.repository.FinancialGoalRepository;
import com.financeapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialGoalService {
    private final FinancialGoalRepository goalRepository;
    private final UserRepository userRepository;

    public FinancialGoalService(FinancialGoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public FinancialGoalResponse createGoal(String userId, FinancialGoalRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        FinancialGoal goal = new FinancialGoal();
        goal.setUser(user);
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setCurrentValue(BigDecimal.ZERO);
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus("ACTIVE");
        
        FinancialGoal saved = goalRepository.save(goal);
        return convertToResponse(saved);
    }

    public List<FinancialGoalResponse> getUserGoals(String userId) {
        return goalRepository.findByUserId(userId).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public List<FinancialGoalResponse> getActiveGoals(String userId) {
        return goalRepository.findByUserIdAndStatus(userId, "ACTIVE").stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public FinancialGoalResponse updateGoal(String userId, String goalId, FinancialGoalRequest request) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(goalId, userId).orElseThrow();
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setTargetDate(request.getTargetDate());
        
        FinancialGoal updated = goalRepository.save(goal);
        return convertToResponse(updated);
    }

    public FinancialGoalResponse addProgress(String userId, String goalId, BigDecimal amount) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(goalId, userId).orElseThrow();
        BigDecimal newValue = goal.getCurrentValue().add(amount);
        goal.setCurrentValue(newValue);
        
        if (newValue.compareTo(goal.getTargetValue()) >= 0) {
            goal.setStatus("COMPLETED");
        }
        
        FinancialGoal updated = goalRepository.save(goal);
        return convertToResponse(updated);
    }

    public void deleteGoal(String userId, String goalId) {
        FinancialGoal goal = goalRepository.findByIdAndUserId(goalId, userId).orElseThrow();
        goalRepository.delete(goal);
    }

    private FinancialGoalResponse convertToResponse(FinancialGoal goal) {
        FinancialGoalResponse response = new FinancialGoalResponse();
        response.setId(goal.getId());
        response.setDescription(goal.getDescription());
        response.setTargetValue(goal.getTargetValue());
        response.setCurrentValue(goal.getCurrentValue());
        response.setTargetDate(goal.getTargetDate());
        response.setStatus(goal.getStatus());
        
        // Calcular progresso
        if (goal.getTargetValue().compareTo(java.math.BigDecimal.ZERO) > 0) {
            double progress = goal.getCurrentValue()
                .divide(goal.getTargetValue(), 2, java.math.RoundingMode.HALF_UP)
                .doubleValue() * 100;
            response.setProgress(Math.min(progress, 100.0));
        }
        
        return response;
    }
}
```

### 2.4 Controller (garantir todos os endpoints)

**Arquivo:** `backend/src/main/java/com/financeapp/controller/FinancialGoalController.java`

```java
package com.financeapp.controller;

import com.financeapp.model.dto.FinancialGoalRequest;
import com.financeapp.model.dto.FinancialGoalResponse;
import com.financeapp.service.FinancialGoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class FinancialGoalController {
    private final FinancialGoalService goalService;

    public FinancialGoalController(FinancialGoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<FinancialGoalResponse> createGoal(
        @RequestBody FinancialGoalRequest request,
        Authentication authentication
    ) {
        String userId = authentication.getName();
        FinancialGoalResponse response = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FinancialGoalResponse>> getUserGoals(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(goalService.getUserGoals(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<FinancialGoalResponse>> getActiveGoals(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(goalService.getActiveGoals(userId));
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<FinancialGoalResponse> getGoal(
        @PathVariable String goalId,
        Authentication authentication
    ) {
        // Implementar busca individual se necessário
        return ResponseEntity.ok(new FinancialGoalResponse());
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<FinancialGoalResponse> updateGoal(
        @PathVariable String goalId,
        @RequestBody FinancialGoalRequest request,
        Authentication authentication
    ) {
        String userId = authentication.getName();
        FinancialGoalResponse response = goalService.updateGoal(userId, goalId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{goalId}/progress")
    public ResponseEntity<FinancialGoalResponse> addProgress(
        @PathVariable String goalId,
        @RequestParam BigDecimal amount,
        Authentication authentication
    ) {
        String userId = authentication.getName();
        FinancialGoalResponse response = goalService.addProgress(userId, goalId, amount);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
        @PathVariable String goalId,
        Authentication authentication
    ) {
        String userId = authentication.getName();
        goalService.deleteGoal(userId, goalId);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Frontend - Página de Metas

### 2.5 Melhorar Hook useGoals

**Arquivo:** `frontend/src/hooks/useGoals.ts`

```typescript
import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';

export interface FinancialGoalResponse {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  targetDate: string;
  status: string;
  progress: number;
}

export interface FinancialGoalRequest {
  description: string;
  targetValue: number;
  targetDate: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('goals').json<{ content: FinancialGoalResponse[] }>();
      setGoals(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (data: FinancialGoalRequest) => {
    try {
      const newGoal = await api.post('goals', { json: data }).json<FinancialGoalResponse>();
      setGoals([...goals, newGoal]);
      return newGoal;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar meta');
    }
  }, [goals]);

  const updateGoal = useCallback(async (id: string, data: FinancialGoalRequest) => {
    try {
      const updated = await api.put(`goals/${id}`, { json: data }).json<FinancialGoalResponse>();
      setGoals(goals.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar meta');
    }
  }, [goals]);

  const addProgress = useCallback(async (id: string, amount: number) => {
    try {
      const updated = await api
        .post(`goals/${id}/progress?amount=${amount}`, {})
        .json<FinancialGoalResponse>();
      setGoals(goals.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar progresso');
    }
  }, [goals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await api.delete(`goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar meta');
    }
  }, [goals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    addProgress,
    deleteGoal
  };
}
```

### 2.6 Criar Página de Metas

**Arquivo:** `frontend/src/pages/GoalsPage.tsx`

```typescript
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useGoals, FinancialGoalRequest } from '../hooks/useGoals';

export function GoalsPage() {
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, addProgress, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FinancialGoalRequest>({
    description: '',
    targetValue: 0,
    targetDate: '',
  });
  const [progressAmount, setProgressAmount] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateGoal(editingId, formData);
        setEditingId(null);
      } else {
        await createGoal(formData);
      }
      setFormData({ description: '', targetValue: 0, targetDate: '' });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar meta');
    }
  };

  const handleAddProgress = async (goalId: string) => {
    const amount = progressAmount[goalId];
    if (!amount || amount <= 0) {
      alert('Informe um valor válido');
      return;
    }
    try {
      await addProgress(goalId, amount);
      setProgressAmount({ ...progressAmount, [goalId]: 0 });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar progresso');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (confirm('Tem certeza que deseja deletar esta meta?')) {
      try {
        await deleteGoal(goalId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao deletar meta');
      }
    }
  };

  const handleEdit = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setFormData({
        description: goal.description,
        targetValue: goal.targetValue,
        targetDate: goal.targetDate,
      });
      setEditingId(goalId);
      setShowForm(true);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold">Metas Financeiras</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ description: '', targetValue: 0, targetDate: '' });
            }}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Nova Meta'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-lg font-semibold mb-4">{editingId ? 'Editar Meta' : 'Criar Nova Meta'}</h2>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: (e.target as HTMLInputElement).value })}
                  placeholder="Ex: Fundo de emergência"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseFloat((e.target as HTMLInputElement).value) })}
                    placeholder="0.00"
                    step="0.01"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Data Alvo</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: (e.target as HTMLInputElement).value })}
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                class="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Atualizar Meta' : 'Criar Meta'}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* Lista de Metas */}
        {loading ? (
          <div class="text-center py-8">Carregando metas...</div>
        ) : goals.length === 0 ? (
          <div class="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            Nenhuma meta criada. Clique em "+ Nova Meta" para começar!
          </div>
        ) : (
          <div class="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} class="bg-white rounded-lg shadow p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-lg font-semibold">{goal.description}</h3>
                    <p class="text-sm text-gray-600">Prazo: {goal.targetDate}</p>
                  </div>
                  <span class={`px-3 py-1 rounded-full text-sm font-semibold ${
                    goal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    goal.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status === 'COMPLETED' ? '✓ Completa' : 
                     goal.status === 'ACTIVE' ? 'Em andamento' : 
                     'Cancelada'}
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div class="mb-4">
                  <div class="flex justify-between mb-2">
                    <span class="text-sm font-medium">Progresso</span>
                    <span class="text-sm font-medium">{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div class="flex justify-between mt-2 text-sm text-gray-600">
                    <span>R$ {goal.currentValue.toFixed(2)}</span>
                    <span>R$ {goal.targetValue.toFixed(2)}</span>
                  </div>
                </div>

                {/* Adicionar Progresso */}
                {goal.status === 'ACTIVE' && (
                  <div class="flex gap-2 mb-4">
                    <input
                      type="number"
                      value={progressAmount[goal.id] || 0}
                      onChange={(e) => setProgressAmount({ ...progressAmount, [goal.id]: parseFloat((e.target as HTMLInputElement).value) })}
                      placeholder="Valor a adicionar"
                      step="0.01"
                      class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddProgress(goal.id)}
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}

                {/* Ações */}
                <div class="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal.id)}
                    disabled={goal.status !== 'ACTIVE'}
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2.7 Registrar Rota para Goals

**Arquivo:** `frontend/src/router.tsx`

```typescript
type Route = 'login' | 'dashboard' | 'transactions' | 'settings' | 'reports' | 'goals' | 'not-found';

const routeMap: Record<string, Route> = {
  '/': 'dashboard',
  '/login': 'login',
  '/transactions': 'transactions',
  '/settings': 'settings',
  '/reports': 'reports',
  '/goals': 'goals',  // ADICIONAR ESTA LINHA
};

const pathMap: Record<Route, string> = {
  login: '/login',
  dashboard: '/',
  transactions: '/transactions',
  settings: '/settings',
  reports: '/reports',
  goals: '/goals',  // ADICIONAR ESTA LINHA
  'not-found': '/404',
};
```

---

# FUNCIONALIDADE 3: PÁGINA DE SETTINGS/PERFIL

## Frontend - Settings Page (sem backend novo necessário, usar endpoints existentes)

### 3.1 Criar Página de Settings

**Arquivo:** `frontend/src/pages/SettingsPage.tsx`

```typescript
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useNavigation } from '../router';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export function SettingsPage() {
  const { navigate } = useNavigation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Endpoint para obter perfil do usuário (implementar no backend se não existir)
      const profile = await api.get('auth/profile').json<UserProfile>();
      setUser(profile);
      setFormData({ name: profile.name, email: profile.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    try {
      // Endpoint para atualizar perfil (implementar no backend se necessário)
      const updated = await api
        .put('auth/profile', { json: formData })
        .json<UserProfile>();
      setUser(updated);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('login');
  };

  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.querySelector('[name="currentPassword"]') as HTMLInputElement).value;
    const newPassword = (form.querySelector('[name="newPassword"]') as HTMLInputElement).value;
    const confirmPassword = (form.querySelector('[name="confirmPassword"]') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    try {
      // Endpoint para mudar senha (implementar no backend)
      await api.post('auth/change-password', {
        json: { currentPassword, newPassword }
      });
      alert('Senha alterada com sucesso!');
      form.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar senha');
    }
  };

  if (loading) {
    return <div class="min-h-screen bg-gray-50 p-6 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Configurações</h1>

        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* Seção de Perfil */}
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold">Perfil</h2>
            <button
              onClick={() => setEditing(!editing)}
              class="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {!editing && user ? (
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-600">Nome</label>
                <p class="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">Email</label>
                <p class="text-lg font-medium">{user.email}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: (e.target as HTMLInputElement).value })}
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </form>
          )}
        </div>

        {/* Seção de Segurança */}
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-semibold mb-6">Segurança</h2>
          <form onSubmit={handleChangePassword} class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Senha Atual</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Digite sua senha atual"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Nova Senha</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Digite sua nova senha"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirme a nova senha"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Alterar Senha
            </button>
          </form>
        </div>

        {/* Seção de Preferências */}
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-semibold mb-6">Preferências</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p class="font-medium">Notificações</p>
                <p class="text-sm text-gray-600">Receber alertas sobre metas e despesas</p>
              </div>
              <input type="checkbox" class="w-4 h-4" defaultChecked />
            </div>
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p class="font-medium">Relatórios Mensais</p>
                <p class="text-sm text-gray-600">Receber resumo mensal por email</p>
              </div>
              <input type="checkbox" class="w-4 h-4" defaultChecked />
            </div>
          </div>
        </div>

        {/* Seção de Logout */}
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Sessão</h2>
          <button
            onClick={handleLogout}
            class="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Registrar Settings na App

**Arquivo:** `frontend/src/app.tsx` - Adicionar import e rota

```typescript
import { SettingsPage } from './pages/SettingsPage';
// ... em renderPage():
case 'settings':
  return <SettingsPage />;
```

---

# TESTES

## Backend - Testes para Relatórios

**Arquivo:** `backend/src/test/java/com/financeapp/service/ReportServiceTests.java`

```java
package com.financeapp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

public class ReportServiceTests {
    
    private ReportService reportService;
    
    @BeforeEach
    public void setUp() {
        // Inicializar mocks e service
    }
    
    @Test
    public void shouldGenerateReportForDateRange() {
        // Teste básico de geração de relatório
    }
    
    @Test
    public void shouldCalculateTotalIncomeCorrectly() {
        // Teste de cálculo de receitas
    }
    
    @Test
    public void shouldCalculateTotalExpenseCorrectly() {
        // Teste de cálculo de despesas
    }
}
```

## Frontend - Testes para ReportsPage

**Arquivo:** `frontend/src/pages/ReportsPage.test.tsx`

```typescript
import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { ReportsPage } from './ReportsPage';

describe('ReportsPage', () => {
  it('should render the reports page', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Relatórios Financeiros')).toBeInTheDocument();
  });
  
  it('should have date filters', () => {
    render(<ReportsPage />);
    expect(screen.getByLabelText('Data Inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('Data Final')).toBeInTheDocument();
  });
});
```

---

# MIGRATIONS DE BANCO DE DADOS

## Verificar se migration existe para Goals

**Arquivo:** `backend/src/main/resources/db/migration/V4__create_financial_goals.sql`

Verificar se contém a coluna `target_date` e `status`. Se não, criar migration V5:

```sql
-- V5__add_missing_columns_to_goals.sql
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
```

---

# CHECKLIST DE IMPLEMENTAÇÃO

## ✅ Backend

- [ ] Criar DTOs de Relatórios (ReportResponse, CategoryReportItem, MonthlyReportItem)
- [ ] Criar ReportService com métodos de geração
- [ ] Criar ReportController com endpoint GET /api/reports/financial
- [ ] Adicionar método findByUserIdAndTransactionDateBetween no TransactionRepository
- [ ] Validar FinancialGoal entity está completa
- [ ] Validar FinancialGoalService tem todos os métodos
- [ ] Validar FinancialGoalController tem todos os endpoints
- [ ] Garantir migrations de banco OK

## ✅ Frontend

- [ ] Criar hook useReports
- [ ] Criar ReportsPage
- [ ] Registrar rota '/reports' no router
- [ ] Adicionar link Relatórios no Header
- [ ] Melhorar hook useGoals com todos os métodos
- [ ] Criar GoalsPage
- [ ] Registrar rota '/goals' no router
- [ ] Criar SettingsPage
- [ ] Registrar rota '/settings' no router
- [ ] Adicionar import de SettingsPage em app.tsx
- [ ] Testar navegação entre todas as páginas

## ✅ Testes

- [ ] Criar testes para ReportService
- [ ] Criar testes para ReportController
- [ ] Criar testes para ReportsPage
- [ ] Criar testes para GoalsPage
- [ ] Executar npm run test:coverage (frontend)
- [ ] Executar ./gradlew test (backend)

## ✅ CI/CD

- [ ] Fazer commit com mensagem clara (feat: implement reports, goals, and settings)
- [ ] Push para branch feature
- [ ] Abrir Pull Request
- [ ] Verificar se CI/CD passa
- [ ] Fazer merge para main

---

# NOTAS IMPORTANTES

1. **Preact vs React:** O projeto usa Preact, não React. Os exemplos usam sintaxe Preact.
2. **HTTP Client:** Use `ky` ao invés de Axios. Exemplo: `api.get('url').json<Type>()`
3. **Roteamento:** É hash-based (`#/pagina`), não tradicional.
4. **Autenticação:** JWT token é enviado automaticamente pelo interceptor do serviço `api`.
5. **Tailwind CSS:** Disponível globalmente, use classes direto.
6. **Date handling:** Use `date-fns` para manipulação de datas.

---

**Fim das Instruções**

Este documento contém todo o código necessário para o Nemotron implementar as 3 funcionalidades críticas.
