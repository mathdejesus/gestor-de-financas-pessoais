import { useState } from 'preact/hooks';
import { useGoals } from '../hooks/useGoals';
import type { FinancialGoalResponse, FinancialGoalRequest } from '../types';

export function GoalsPage() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoalResponse | null>(null);
  const [formData, setFormData] = useState<FinancialGoalRequest>({
    name: '',
    targetAmount: 0,
    targetDate: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('');

  const resetForm = () => {
    setFormData({ name: '', targetAmount: 0, targetDate: '' });
    setEditingGoal(null);
    setFormError('');
  };

  const handleEdit = (goal: FinancialGoalResponse) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, formData);
      } else {
        await createGoal(formData);
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredGoals = filter
    ? goals.filter(g => g.status === filter || (filter === 'COMPLETED' && g.completed))
    : goals;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Metas Financeiras</h1>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter((e.target as HTMLSelectElement).value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todas</option>
            <option value="ACTIVE">Ativas</option>
            <option value="COMPLETED">Concluídas</option>
            <option value="ABANDONED">Abandonadas</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Adicionar Meta
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">{editingGoal ? 'Editar Meta' : 'Nova Meta'}</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Reserva de emergência, Férias, Carro novo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onInput={(e) => setFormData({ ...formData, description: (e.target as HTMLInputElement).value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Alvo</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.targetAmount || ''}
                  onInput={(e) =>
                    setFormData({ ...formData, targetAmount: parseFloat((e.target as HTMLInputElement).value) || 0 })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data Limite</label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onInput={(e) => setFormData({ ...formData, targetDate: (e.target as HTMLInputElement).value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter
            ? `Nenhuma meta ${filter.toLowerCase()} encontrada.`
            : 'Nenhuma meta ainda. Clique em "Adicionar Meta" para começar.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{goal.name}</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                    goal.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {goal.completed ? 'Concluída' : 'Ativa'}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progresso</span>
                  <span className="font-medium text-gray-900">{goal.progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getProgressColor(goal.progressPercentage)}`}
                    style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Acumulado:</span>
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meta:</span>
                  <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prazo:</span>
                  <span className="font-medium">{goal.targetDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(goal)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-auto"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
