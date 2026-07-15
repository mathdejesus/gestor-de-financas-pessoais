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
  fetchTransactions: (page?: number, size?: number) => Promise<void>;
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
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error(err);
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
    return api
      .get(`transactions/summary?${params.toString()}`)
      .json<{ income: number; expense: number; balance: number }>();
  }, []);

  const fetchByCategory = useCallback(async (type: 'INCOME' | 'EXPENSE') => {
    return api
      .get(`transactions/by-category?type=${type}`)
      .json<Array<{ category: string; amount: number }>>();
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
