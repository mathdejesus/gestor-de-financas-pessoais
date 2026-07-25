import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
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
} from "../types";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "https://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await SecureStore.setItemAsync("accessToken", data.accessToken);
          await SecureStore.setItemAsync("refreshToken", data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await AsyncStorage.removeItem("user");
        }
      } else {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await AsyncStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),
};

export const transactionApi = {
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }) => api.get<Transaction[]>("/transactions", { params }),
  create: (data: CreateTransactionRequest) =>
    api.post<Transaction>("/transactions", data),
  update: (id: number, data: UpdateTransactionRequest) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>("/categories"),
  create: (data: CreateCategoryRequest) =>
    api.post<Category>("/categories", data),
  update: (id: number, data: UpdateCategoryRequest) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const dashboardApi = {
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<DashboardSummary>("/dashboard/summary", { params }),
  getMonthlySummary: (months: number = 6) =>
    api.get<MonthlySummary[]>("/dashboard/monthly", { params: { months } }),
  getCategorySummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<CategorySummary[]>("/dashboard/categories", { params }),
};

export const goalApi = {
  getAll: (status?: string) =>
    api.get<FinancialGoal[]>("/goals", {
      params: status ? { status } : undefined,
    }),
  create: (data: CreateGoalRequest) => api.post<FinancialGoal>("/goals", data),
  update: (id: number, data: UpdateGoalRequest) =>
    api.put<FinancialGoal>(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
};

export const reportApi = {
  generatePdf: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/reports/pdf", { params, responseType: "blob" }),
};

export default api;
