import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICards } from '../../components/KPICards';
import type { DashboardSummary } from '../../types';

const mockSummary: DashboardSummary = {
  totalBalance: 2500.5,
  totalIncome: 5000.0,
  totalExpenses: 2499.5,
  savingsRate: 50.0,
  transactionCount: 15,
  categoryCount: 5,
};

describe('KPICards', () => {
  it('renders all KPI values', () => {
    render(<KPICards summary={mockSummary} />);

    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Savings Rate')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('displays formatted currency values', () => {
    render(<KPICards summary={mockSummary} />);

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('$2,499.50')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
