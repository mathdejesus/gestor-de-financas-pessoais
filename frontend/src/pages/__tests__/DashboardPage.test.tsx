import { render, screen } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { DashboardPage } from '../DashboardPage';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('dashboard/categories')) {
        return { json: vi.fn().mockResolvedValue([]) };
      }
      if (url.includes('transactions')) {
        return { json: vi.fn().mockResolvedValue({ content: [] }) };
      }
      return { json: vi.fn().mockResolvedValue({ totalBalance: 0, totalIncome: 0, totalExpenses: 0, savingsRate: 0, transactionCount: 0, categoryCount: 0 }) };
    }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
  reportApi: {
    generateFinancialReport: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('renders income and expense cards', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Receitas do Mês')).toBeInTheDocument();
    expect(screen.getByText('Despesas do Mês')).toBeInTheDocument();
    expect(screen.getByText('Saldo do Mês')).toBeInTheDocument();
  });
});
