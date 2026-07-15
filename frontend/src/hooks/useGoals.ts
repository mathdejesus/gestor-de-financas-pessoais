import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';
import type { FinancialGoalResponse, FinancialGoalRequest } from '../types';

interface UseGoalsReturn {
  goals: FinancialGoalResponse[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchActiveGoals: () => Promise<void>;
  fetchExpiredGoals: () => Promise<void>;
  createGoal: (data: FinancialGoalRequest) => Promise<FinancialGoalResponse>;
  updateGoal: (id: string, data: FinancialGoalRequest) => Promise<FinancialGoalResponse>;
  deleteGoal: (id: string) => Promise<void>;
  addProgress: (id: string, amount: number) => Promise<FinancialGoalResponse>;
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<FinancialGoalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('goals?size=100').json<{ content: FinancialGoalResponse[] }>();
      setGoals(response.content);
    } catch (err) {
      setError('Erro ao carregar metas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('goals/active').json<FinancialGoalResponse[]>();
      setGoals(response);
    } catch (err) {
      setError('Erro ao carregar metas ativas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpiredGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('goals/expired').json<FinancialGoalResponse[]>();
      setGoals(response);
    } catch (err) {
      setError('Erro ao carregar metas expiradas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (data: FinancialGoalRequest) => {
    const response = await api.post('goals', { json: data }).json<FinancialGoalResponse>();
    setGoals(prev => [...prev, response]);
    return response;
  }, []);

  const updateGoal = useCallback(async (id: string, data: FinancialGoalRequest) => {
    const response = await api.put(`goals/${id}`, { json: data }).json<FinancialGoalResponse>();
    setGoals(prev => prev.map(g => (g.id === id ? response : g)));
    return response;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api.delete(`goals/${id}`);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const addProgress = useCallback(async (id: string, amount: number) => {
    const response = await api
      .post(`goals/${id}/progress?amount=${amount}`)
      .json<FinancialGoalResponse>();
    setGoals(prev => prev.map(g => (g.id === id ? response : g)));
    return response;
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    fetchActiveGoals,
    fetchExpiredGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgress,
  };
}
