import { useState, useEffect, useCallback } from 'preact/hooks';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/currency';
import type { DashboardResponse, Transaction } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { fetchSummary, fetchByCategory, fetchTransactions } = useTransactions();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch summary + by category + recent transactions in parallel
      const [summary, expenseByCategory, incomeByCategory] = await Promise.all([
        fetchSummary(),
        fetchByCategory('EXPENSE'),
        fetchByCategory('INCOME'),
      ]);

      const recentResult = await fetchTransactions(0, 5);

      setRecentTransactions(recentResult);

      setDashboard({
        totalIncome: summary.income,
        totalExpense: summary.expense,
        balance: summary.balance,
        recentTransactions: recentResult,
        categoriesBreakdown: Object.fromEntries(
          [...expenseByCategory, ...incomeByCategory].map(
            (item: { category: string; amount: number }) => [item.category, item.amount]
          )
        ),
        incomeByCategory: Object.fromEntries(
          incomeByCategory.map((item: { category: string; amount: number }) => [
            item.category,
            item.amount,
          ])
        ),
        expenseByCategory: Object.fromEntries(
          expenseByCategory.map((item: { category: string; amount: number }) => [
            item.category,
            item.amount,
          ])
        ),
        incomeCurrentMonth: summary.income,
        expenseCurrentMonth: summary.expense,
        balanceCurrentMonth: summary.balance,
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchByCategory, fetchSummary, fetchTransactions]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div class="loading">Carregando dashboard...</div>;
  }

  const balanceColor =
    dashboard && dashboard.balanceCurrentMonth >= 0
      ? 'var(--color-success)'
      : 'var(--color-danger)';

  return (
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Olá, {user?.name}! Veja seu resumo financeiro.</p>
        </div>
      </div>

      <div class="dashboard-cards">
        <div class="card stat-card">
          <div class="stat-icon income">💰</div>
          <div class="stat-info">
            <span class="stat-label">Receitas do Mês</span>
            <span class="stat-value income">
              {formatCurrency(dashboard?.incomeCurrentMonth || 0)}
            </span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon expense">💸</div>
          <div class="stat-info">
            <span class="stat-label">Despesas do Mês</span>
            <span class="stat-value expense">
              {formatCurrency(dashboard?.expenseCurrentMonth || 0)}
            </span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon" style={{ color: balanceColor }}>
            📊
          </div>
          <div class="stat-info">
            <span class="stat-label">Saldo do Mês</span>
            <span class="stat-value" style={{ color: balanceColor }}>
              {formatCurrency(dashboard?.balanceCurrentMonth || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>💸 Despesas por Categoria</h2>
          {dashboard?.expenseByCategory && Object.keys(dashboard.expenseByCategory).length > 0 ? (
            <ul className="category-list">
              {Object.entries(dashboard.expenseByCategory).map(([category, amount]) => (
                <li key={category} className="category-item">
                  <span>{category}</span>
                  <span className="amount expense">{formatCurrency(amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Nenhuma despesa este mês</p>
          )}
        </div>

        <div className="card">
          <h2>💰 Receitas por Categoria</h2>
          {dashboard?.incomeByCategory && Object.keys(dashboard.incomeByCategory).length > 0 ? (
            <ul className="category-list">
              {Object.entries(dashboard.incomeByCategory).map(([category, amount]) => (
                <li key={category} className="category-item">
                  <span>{category}</span>
                  <span className="amount income">{formatCurrency(amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Nenhuma receita este mês</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>📋 Transações Recentes</h2>
        {recentTransactions.length > 0 ? (
          <ul className="category-list">
            {recentTransactions.map(t => (
              <li key={t.id} className="category-item">
                <span>
                  {t.description}
                  <span className="empty" style={{ marginLeft: '0.5rem' }}>
                    {t.transactionDate}
                  </span>
                </span>
                <span className={`amount ${t.transactionType === 'INCOME' ? 'income' : 'expense'}`}>
                  {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Nenhuma transação recente</p>
        )}
      </div>
    </div>
  );
}

export { DashboardPage };
