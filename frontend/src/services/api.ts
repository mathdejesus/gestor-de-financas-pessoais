import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DashboardSummary,
  MonthlySummary,
  CategorySummary,
  FinancialGoal,
  CreateGoalRequest,
  UpdateGoalRequest,
  ReportResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, '');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  refreshToken: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  getProfile: () => api.get<UserProfile>('/auth/profile'),
  updateProfile: (data: UpdateProfileRequest) => api.put<UserProfile>('/auth/profile', data),
  changePassword: (data: ChangePasswordRequest) => api.post('/auth/change-password', data),
};

export const transactionApi = {
  getAll: (params?: { startDate?: string; endDate?: string; categoryId?: number }) =>
    api.get<Transaction[]>('/transactions', { params }),
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  create: (data: CreateTransactionRequest) => api.post<Transaction>('/transactions', data),
  update: (id: number, data: UpdateTransactionRequest) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (data: CreateCategoryRequest) => api.post<Category>('/categories', data),
  update: (id: number, data: UpdateCategoryRequest) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const dashboardApi = {
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<DashboardSummary>('/dashboard/summary', { params }),
  getMonthlySummary: (months: number = 6) =>
    api.get<MonthlySummary[]>('/dashboard/monthly', { params: { months } }),
  getCategorySummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<CategorySummary[]>('/dashboard/categories', { params }),
  exportCsv: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/dashboard/export/csv', { params, responseType: 'blob' }),
};

export const goalApi = {
  getAll: (status?: string) =>
    api.get<FinancialGoal[]>('/goals', { params: status ? { status } : undefined }),
  getById: (id: number) => api.get<FinancialGoal>(`/goals/${id}`),
  create: (data: CreateGoalRequest) => api.post<FinancialGoal>('/goals', data),
  update: (id: number, data: UpdateGoalRequest) => api.put<FinancialGoal>(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
};

export const reportApi = {
  generatePdf: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/pdf', { params, responseType: 'blob' }),
  generateFinancialReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ReportResponse>('/reports/financial', { params }),
};

export default api;
