import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';
import type { Transaction } from '../types';
import type { TransactionRequest } from '../types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  fetchTransactions: (page?: number, size?: number) => Promise<Transaction[]>;
  createTransaction: (data: TransactionRequest) => Promise<Transaction>;
  updateTransaction: (id: string, data: TransactionRequest) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchSummary: (
    startDate?: string,
    endDate?: string
  ) => Promise<{ income: number; expense: number; balance: number }>;
  fetchByCategory: (
    type: 'INCOME' | 'EXPENSE'
  ) => Promise<Array<{ category: string; amount: number }>>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTransactions = useCallback(async (pageNum = 0, size = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get(`transactions?page=${pageNum}&size=${size}&sort=transactionDate,desc`)
        .json<{
          content: Transaction[];
          totalPages: number;
          totalElements: number;
          number: number;
        }>();
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(response.number);
      return response.content;
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: TransactionRequest) => {
    const response = await api.post('transactions', { json: data }).json<Transaction>();
    setTransactions(prev => [response, ...prev]);
    return response;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: TransactionRequest) => {
    const response = await api.put(`transactions/${id}`, { json: data }).json<Transaction>();
    setTransactions(prev => prev.map(t => (t.id === id ? response : t)));
    return response;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(`transactions/${id}`);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchSummary = useCallback(async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api
      .get(`dashboard/summary${query ? `?${query}` : ''}`)
      .json<{
        totalBalance: number;
        totalIncome: number;
        totalExpenses: number;
        savingsRate: number;
        transactionCount: number;
        categoryCount: number;
      }>()
      .then(summary => ({
        income: summary.totalIncome,
        expense: summary.totalExpenses,
        balance: summary.totalBalance,
      }));
  }, []);

  const fetchByCategory = useCallback(async (type: 'INCOME' | 'EXPENSE') => {
    const params = new URLSearchParams({ type });
    return api
      .get(`dashboard/categories?${params.toString()}`)
      .json<
        Array<{
          categoryId: string;
          categoryName: string;
          color: string;
          total: number;
          transactionCount: number;
        }>
      >()
      .then(items => items.map(item => ({ category: item.categoryName, amount: item.total })));
  }, []);

  return {
    transactions,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchSummary,
    fetchByCategory,
  };
}
