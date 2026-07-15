import { render, screen } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CategoriesPage } from '../CategoriesPage';

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

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders categories title', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CategoriesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Categorias')).toBeInTheDocument();
  });

  it('renders add category button', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CategoriesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Adicionar Categoria')).toBeInTheDocument();
  });

  it('shows empty state when no categories', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CategoriesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/Nenhuma categoria/)).toBeInTheDocument();
  });
});
