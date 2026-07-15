import { render, screen, waitFor } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoalsPage } from '../GoalsPage';

vi.mock('../../services/api', () => {
  const mockGoals = [
    {
      id: '1',
      name: 'Viagem',
      targetAmount: 5000,
      currentAmount: 1000,
      targetDate: '2025-12-31',
      description: 'Viagem dos sonhos',
      progressPercentage: 20,
      status: 'IN_PROGRESS',
      completed: false,
    },
    {
      id: '2',
      name: 'Carro',
      targetAmount: 30000,
      currentAmount: 5000,
      targetDate: '2026-06-30',
      description: 'Carro novo',
      progressPercentage: 16.67,
      status: 'IN_PROGRESS',
      completed: false,
    },
  ];

  return {
    api: {
      get: vi.fn().mockReturnValue({ json: vi.fn().mockResolvedValue({ content: mockGoals }) }),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('GoalsPage', () => {
  it('renders goals title', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('Metas Financeiras')).toBeInTheDocument();
  });

  it('renders goal cards after loading', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('Viagem')).toBeInTheDocument();
    expect(screen.getByText('Carro')).toBeInTheDocument();
  });

  it('shows Add Goal button', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>,
    );

    expect(await screen.findByText('Adicionar Meta')).toBeInTheDocument();
  });
});
