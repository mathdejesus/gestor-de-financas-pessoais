import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { DashboardPage } from '../DashboardPage';

vi.mock('../../services/api', () => ({
  dashboardApi: {
    getSummary: vi
      .fn()
      .mockResolvedValue({
        data: { totalBalance: 1000, totalIncome: 2000, totalExpenses: 1000, savingsRate: 50 },
      }),
    getMonthlySummary: vi.fn().mockResolvedValue({ data: [] }),
    getCategorySummary: vi.fn().mockResolvedValue({ data: [] }),
    exportCsv: vi.fn().mockResolvedValue({ data: '' }),
  },
  reportApi: {
    generatePdf: vi.fn().mockResolvedValue({ data: '' }),
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

  it('renders period filter buttons', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('renders export buttons', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });
});
