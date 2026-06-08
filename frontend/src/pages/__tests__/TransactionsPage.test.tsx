import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { TransactionsPage } from '../TransactionsPage';

vi.mock('../../services/api', () => ({
  transactionApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transactions title', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TransactionsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Transactions')).toBeInTheDocument();
  });

  it('renders add transaction button', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TransactionsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Add Transaction')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TransactionsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/No transactions yet/)).toBeInTheDocument();
  });
});
