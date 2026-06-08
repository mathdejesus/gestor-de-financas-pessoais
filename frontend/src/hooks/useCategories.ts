import { useState, useEffect, useCallback } from 'react';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { categoryApi } from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = async (request: CreateCategoryRequest) => {
    const { data } = await categoryApi.create(request);
    setCategories(prev => [...prev, data]);
    return data;
  };

  const updateCategory = async (id: number, request: UpdateCategoryRequest) => {
    const { data } = await categoryApi.update(id, request);
    setCategories(prev => prev.map(c => (c.id === id ? data : c)));
    return data;
  };

  const deleteCategory = async (id: number) => {
    await categoryApi.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
