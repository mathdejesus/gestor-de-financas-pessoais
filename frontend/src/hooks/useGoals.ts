import { useState, useEffect, useCallback } from 'react';
import type { FinancialGoal, CreateGoalRequest, UpdateGoalRequest } from '../types';
import { goalApi } from '../services/api';

export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await goalApi.getAll(status);
      setGoals(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGoal = async (request: CreateGoalRequest) => {
    const { data } = await goalApi.create(request);
    setGoals(prev => [data, ...prev]);
    return data;
  };

  const updateGoal = async (id: number, request: UpdateGoalRequest) => {
    const { data } = await goalApi.update(id, request);
    setGoals(prev => prev.map(g => (g.id === id ? data : g)));
    return data;
  };

  const addProgress = async (id: number, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) throw new Error('Goal not found');
    const newCurrentValue = goal.currentValue + amount;
    return updateGoal(id, { currentValue: newCurrentValue });
  };

  const deleteGoal = async (id: number) => {
    await goalApi.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    addProgress,
    deleteGoal,
  };
}
