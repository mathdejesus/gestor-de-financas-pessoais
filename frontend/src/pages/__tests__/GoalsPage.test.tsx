import { render, screen } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoalsPage } from '../GoalsPage';

vi.mock('../../services/api', () => {
  const mockGoals = [
    {
      id: 1,
      description: 'Viagem',
      targetValue: 5000,
      currentValue: 1000,
      deadline: '2025-12-31',
      status: 'ACTIVE',
      progressPercentage: 20,
      daysRemaining: 100,
      estimatedCompletion: null,
    },
    {
      id: 2,
      description: 'Carro',
      targetValue: 30000,
      currentValue: 5000,
      deadline: '2026-06-30',
      status: 'ACTIVE',
      progressPercentage: 16.67,
      daysRemaining: 200,
      estimatedCompletion: null,
    },
  ];

  return {
    api: {
      get: vi.fn().mockReturnValue({ json: vi.fn().mockResolvedValue(mockGoals) }),
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
      </BrowserRouter>
    );

    expect(await screen.findByText('Metas Financeiras')).toBeInTheDocument();
  });

  it('renders goal cards after loading', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Viagem')).toBeInTheDocument();
    expect(screen.getByText('Carro')).toBeInTheDocument();
  });

  it('shows Add Goal button', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Adicionar Meta')).toBeInTheDocument();
  });
});
