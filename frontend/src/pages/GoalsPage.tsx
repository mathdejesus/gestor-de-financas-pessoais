import { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import type { FinancialGoal, CreateGoalRequest } from '../types';

export function GoalsPage() {
  const { goals, isLoading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState<CreateGoalRequest>({
    description: '',
    targetValue: 0,
    deadline: null,
  });
  const [updateValue, setUpdateValue] = useState<number>(0);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('');

  const resetForm = () => {
    setFormData({ description: '', targetValue: 0, deadline: null });
    setEditingGoal(null);
    setFormError('');
    setUpdateValue(0);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormData({
      description: goal.description,
      targetValue: goal.targetValue,
      deadline: goal.deadline,
    });
    setUpdateValue(goal.currentValue);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          description: formData.description,
          targetValue: formData.targetValue,
          currentValue: updateValue,
          deadline: formData.deadline,
        });
      } else {
        await createGoal(formData);
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED') => {
    await updateGoal(id, { status });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredGoals = filter ? goals.filter(g => g.status === filter) : goals;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">All Goals</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABANDONED">Abandoned</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add Goal
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
          <h2 className="text-lg font-semibold mb-4">{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Emergency fund, Vacation, New car"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.targetValue || ''}
                  onChange={e =>
                    setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {editingGoal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={updateValue || ''}
                    onChange={e => setUpdateValue(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value || null })}
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
                {isSubmitting ? 'Saving...' : editingGoal ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter
            ? `No ${filter.toLowerCase()} goals found.`
            : 'No goals yet. Click "Add Goal" to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{goal.description}</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                    goal.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : goal.status === 'ABANDONED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{goal.progressPercentage}%</span>
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
                  <span>Saved:</span>
                  <span className="font-medium">{formatCurrency(goal.currentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-medium">{formatCurrency(goal.targetValue)}</span>
                </div>
                {goal.deadline && (
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="font-medium">{goal.deadline}</span>
                  </div>
                )}
                {goal.daysRemaining !== null && goal.daysRemaining > 0 && (
                  <div className="flex justify-between">
                    <span>Days left:</span>
                    <span className="font-medium">{goal.daysRemaining}</span>
                  </div>
                )}
                {goal.estimatedCompletion && (
                  <div className="flex justify-between">
                    <span>Estimate:</span>
                    <span className="font-medium text-blue-600">{goal.estimatedCompletion}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(goal)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                {goal.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(goal.id, 'COMPLETED')}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(goal.id, 'ABANDONED')}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Abandon
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
