import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CategoriesPage } from '../CategoriesPage';

vi.mock('../../services/api', () => ({
  categoryApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

    expect(await screen.findByText('Categories')).toBeInTheDocument();
  });

  it('renders add category button', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CategoriesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Add Category')).toBeInTheDocument();
  });

  it('shows empty state when no categories', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CategoriesPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/No categories yet/)).toBeInTheDocument();
  });
});
