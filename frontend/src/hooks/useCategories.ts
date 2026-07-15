import { useState, useCallback } from 'preact/hooks';
import { api } from '../services/api';
import type { CategoryResponse, CategoryRequest } from '../types';

interface UseCategoriesReturn {
  categories: CategoryResponse[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryRequest) => Promise<CategoryResponse>;
  updateCategory: (id: string, data: CategoryRequest) => Promise<CategoryResponse>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('categories?size=100').json<{ content: CategoryResponse[] }>();
      setCategories(response.content);
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryRequest) => {
    const response = await api.post('categories', { json: data }).json<CategoryResponse>();
    setCategories(prev => [...prev, response]);
    return response;
  }, []);

  const updateCategory = useCallback(async (id: string, data: CategoryRequest) => {
    const response = await api.put(`categories/${id}`, { json: data }).json<CategoryResponse>();
    setCategories(prev => prev.map(c => (c.id === id ? response : c)));
    return response;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.delete(`categories/${id}`);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
