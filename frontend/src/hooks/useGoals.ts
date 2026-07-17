import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';
import type { FinancialGoalResponse, FinancialGoalRequest } from '../types';

/**
 * Backend GoalDTO -> frontend FinancialGoalResponse mapper.
 * The backend returns fields like `description`, `targetValue`, `currentValue`,
 * `deadline`, `status`. The page consumes `name`, `targetAmount`,
 * `currentAmount`, `targetDate`, `completed`. We map both so the page keeps
 * working without changes while the wire format matches the API.
 */
function toResponse(dto: {
  id: number | string;
  description?: string;
  targetValue?: number | string;
  currentValue?: number | string;
  deadline?: string | null;
  status?: string;
  progressPercentage?: number;
  daysRemaining?: number | null;
  estimatedCompletion?: string | null;
}): FinancialGoalResponse {
  const status = (dto.status ?? 'ACTIVE') as FinancialGoalResponse['status'];
  return {
    id: String(dto.id),
    name: dto.description ?? '',
    description: dto.description,
    targetAmount: Number(dto.targetValue ?? 0),
    currentAmount: Number(dto.currentValue ?? 0),
    targetDate: dto.deadline ?? '',
    completed: status === 'COMPLETED',
    progressPercentage: Number(dto.progressPercentage ?? 0),
    status,
    targetValue: Number(dto.targetValue ?? 0),
    currentValue: Number(dto.currentValue ?? 0),
    deadline: dto.deadline ?? null,
    daysRemaining: dto.daysRemaining ?? null,
    estimatedCompletion: dto.estimatedCompletion ?? null,
    createdAt: '',
    updatedAt: '',
  };
}

interface UseGoalsReturn {
  goals: FinancialGoalResponse[];
  loading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  createGoal: (data: FinancialGoalRequest) => Promise<FinancialGoalResponse>;
  updateGoal: (id: string, data: FinancialGoalRequest) => Promise<FinancialGoalResponse>;
  deleteGoal: (id: string) => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<FinancialGoalResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('goals').json<Parameters<typeof toResponse>[0][]>();
      // Backend returns a plain array (List<GoalDTO>); tolerate a paginated
      // envelope just in case.
      const list = Array.isArray(response) ? response : (response as unknown as { content: Parameters<typeof toResponse>[0][] }).content;
      setGoals(list.map(toResponse));
    } catch (err) {
      setError('Erro ao carregar metas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (data: FinancialGoalRequest) => {
    const response = await api
      .post('goals', {
        json: {
          description: data.name,
          targetValue: data.targetAmount,
          deadline: data.targetDate || null,
        },
      })
      .json<Parameters<typeof toResponse>[0]>();
    const created = toResponse(response);
    setGoals(prev => [...prev, created]);
    return created;
  }, []);

  const updateGoal = useCallback(async (id: string, data: FinancialGoalRequest) => {
    const response = await api
      .put(`goals/${id}`, {
        json: {
          description: data.name,
          targetValue: data.targetAmount,
          deadline: data.targetDate || null,
        },
      })
      .json<Parameters<typeof toResponse>[0]>();
    const updated = toResponse(response);
    setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api.delete(`goals/${id}`);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
