import { useState } from "preact/hooks";
import { useTransactions } from "../hooks/useTransactions";
import TransactionForm from "./TransactionForm";
import type { Transaction } from "../types";
import { formatCurrency } from "../utils/currency";

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR");
}

export default function TransactionList() {
  const {
    transactions,
    loading,
    error,
    page,
    totalPages,
    fetchTransactions,
    deleteTransaction,
  } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingTransaction) {
      // Update logic would go here
    } else {
      // Create logic would go here
    }
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const getTypeIcon = (type: string) => (type === "INCOME" ? "💰" : "💸");
  const getTypeClass = (type: string) =>
    type === "INCOME" ? "income" : "expense";

  if (loading && transactions.length === 0) {
    return <div class="loading">Carregando transações...</div>;
  }

  return (
    <div class="transaction-list">
      <div class="list-header">
        <h2>Transações</h2>
        <button class="btn btn-primary" onClick={handleCreate}>
          ➕ Nova
        </button>
      </div>

      {error && <div class="error-message">{error}</div>}

      {transactions.length === 0 ? (
        <div class="empty-state">
          <p>📭 Nenhuma transação encontrada</p>
          <button class="btn btn-primary" onClick={handleCreate}>
            Criar a primeira transação
          </button>
        </div>
      ) : (
        <>
          <div class="table-container">
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th class="amount-col">Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>{transaction.description}</td>
                    <td>
                      {transaction.category ? (
                        <span
                          class="category-badge"
                          style={{
                            borderLeftColor:
                              transaction.category.color ||
                              "var(--color-accent)",
                          }}
                        >
                          {transaction.category.name}
                        </span>
                      ) : (
                        <span class="category-badge empty">—</span>
                      )}
                    </td>
                    <td
                      class={`amount-col ${getTypeClass(transaction.transactionType)}`}
                    >
                      {getTypeIcon(transaction.transactionType)}{" "}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td class="actions">
                      <button
                        class="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(transaction)}
                        disabled={deletingId === transaction.id}
                      >
                        ✏️
                      </button>
                      <button
                        class="btn btn-sm btn-danger"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id}
                      >
                        {deletingId === transaction.id ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div class="pagination">
              <button
                class="btn btn-secondary btn-sm"
                onClick={() => fetchTransactions(page - 1)}
                disabled={page === 0}
              >
                Anterior
              </button>
              <span class="page-info">
                Página {page + 1} de {totalPages}
              </span>
              <button
                class="btn btn-secondary btn-sm"
                onClick={() => fetchTransactions(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TransactionForm
          initialData={editingTransaction || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
