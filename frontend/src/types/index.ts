export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  transactionDate: string;
  categoryId?: string;
  category?: CategoryResponse;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
  categoriesBreakdown: { [key: string]: number };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AiExtractResponse {
  description?: string;
  amount?: number;
  transactionType?: "INCOME" | "EXPENSE";
  transactionDate?: string;
  categoryId?: string;
  confidence: number;
  missingFields: string[];
}

export interface TransactionRequest {
  id?: string;
  description: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  transactionDate: string;
  categoryId?: string;
}

export interface TransactionResponse {
  id: string;
  description: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  transactionDate: string;
  category?: CategoryResponse;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color?: string;
  transactionCount?: number;
  totalAmount?: number;
}

export interface CategoryRequest {
  name: string;
  color?: string;
}

export interface DashboardResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: TransactionResponse[];
  categoriesBreakdown: { [key: string]: number };
  incomeByCategory: { [key: string]: number };
  expenseByCategory: { [key: string]: number };
  incomeCurrentMonth: number;
  expenseCurrentMonth: number;
  balanceCurrentMonth: number;
}

export interface FinancialGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: string;
}

export interface FinancialGoalResponse {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  progressPercentage: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
