import { useState, useEffect, useCallback } from 'react';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types';
import { transactionApi } from '../services/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (params?: { startDate?: string; endDate?: string; categoryId?: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await transactionApi.getAll(params);
        setTransactions(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createTransaction = async (request: CreateTransactionRequest) => {
    const { data } = await transactionApi.create(request);
    setTransactions(prev => [data, ...prev]);
    return data;
  };

  const updateTransaction = async (id: number, request: UpdateTransactionRequest) => {
    const { data } = await transactionApi.update(id, request);
    setTransactions(prev => prev.map(t => (t.id === id ? data : t)));
    return data;
  };

  const deleteTransaction = async (id: number) => {
    await transactionApi.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
