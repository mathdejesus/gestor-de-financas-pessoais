import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency } from "../utils/currency";
import ChatbotPanel from "../components/ChatbotPanel";
import type { DashboardResponse, AiExtractResponse } from "../types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { fetchSummary, fetchByCategory } = useTransactions();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summary = await fetchSummary();

      // Fetch by category
      const [expenseByCategory, incomeByCategory] = await Promise.all([
        fetchByCategory("EXPENSE"),
        fetchByCategory("INCOME"),
      ]);

      setDashboard({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        recentTransactions: [],
        categoriesBreakdown: {},
        incomeByCategory: Object.fromEntries(
          incomeByCategory.map((item: any) => [item.category, item.amount]),
        ),
        expenseByCategory: Object.fromEntries(
          expenseByCategory.map((item: any) => [item.category, item.amount]),
        ),
        incomeCurrentMonth: summary.income,
        expenseCurrentMonth: summary.expense,
        balanceCurrentMonth: summary.balance,
      });
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionExtracted = (data: AiExtractResponse) => {
    console.log("Transaction extracted:", data);
    setShowChatbot(false);
    loadDashboard();
  };

  if (loading) {
    return <div class="loading">Carregando dashboard...</div>;
  }

  const balanceColor =
    dashboard && dashboard.balanceCurrentMonth >= 0
      ? "var(--color-success)"
      : "var(--color-danger)";

  return (
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Olá, {user?.name}! Veja seu resumo financeiro.</p>
        </div>
        <button class="btn btn-primary" onClick={() => setShowChatbot(true)}>
          ➕ Nova Transação
        </button>
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

      <div class="dashboard-grid">
        <div class="card">
          <h2>💸 Despesas por Categoria</h2>
          {dashboard?.expenseByCategory &&
          Object.keys(dashboard.expenseByCategory).length > 0 ? (
            <ul class="category-list">
              {Object.entries(dashboard.expenseByCategory).map(
                ([category, amount]) => (
                  <li key={category} class="category-item">
                    <span>{category}</span>
                    <span class="amount expense">{formatCurrency(amount)}</span>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p class="empty">Nenhuma despesa este mês</p>
          )}
        </div>

        <div class="card">
          <h2>💰 Receitas por Categoria</h2>
          {dashboard?.incomeByCategory &&
          Object.keys(dashboard.incomeByCategory).length > 0 ? (
            <ul class="category-list">
              {Object.entries(dashboard.incomeByCategory).map(
                ([category, amount]) => (
                  <li key={category} class="category-item">
                    <span>{category}</span>
                    <span class="amount income">{formatCurrency(amount)}</span>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p class="empty">Nenhuma receita este mês</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
export { DashboardPage };
