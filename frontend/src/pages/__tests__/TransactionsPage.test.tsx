import { render, screen } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { TransactionsPage } from '../TransactionsPage';

vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn().mockReturnValue({ json: vi.fn().mockResolvedValue([]) }),
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

    expect(await screen.findByText('Transações')).toBeInTheDocument();
  });

  it('renders add transaction button', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TransactionsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Adicionar Transação')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TransactionsPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/Nenhuma transação/)).toBeInTheDocument();
  });
});
