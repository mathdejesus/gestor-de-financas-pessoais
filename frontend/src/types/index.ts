export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Transaction {
  id: number;
  description: string | null;
  amount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  categoryId: number | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateTransactionRequest {
  description?: string;
  amount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  categoryId?: number | null;
}

export interface UpdateTransactionRequest {
  description?: string;
  amount?: number;
  transactionType?: 'INCOME' | 'EXPENSE';
  transactionDate?: string;
  categoryId?: number | null;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  fields?: Record<string, string>;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  transactionCount: number;
  categoryCount: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  color: string | null;
  total: number;
  transactionCount: number;
}

export type PeriodType = 'month' | 'quarter' | 'year' | 'all';

export interface PeriodFilter {
  type: PeriodType;
  startDate: string | null;
  endDate: string | null;
  months?: number;
}

export interface FinancialGoal {
  id: number;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  progressPercentage: number;
  daysRemaining: number | null;
  estimatedCompletion: string | null;
}

export interface CreateGoalRequest {
  description: string;
  targetValue: number;
  deadline?: string | null;
}

export interface UpdateGoalRequest {
  description?: string;
  targetValue?: number;
  currentValue?: number;
  deadline?: string | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
}
