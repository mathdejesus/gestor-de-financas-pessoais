import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoalsPage } from '../../pages/GoalsPage';

vi.mock('../../services/api', () => ({
  goalApi: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          description: 'Emergency Fund',
          targetValue: 10000,
          currentValue: 3000,
          deadline: '2026-12-31',
          status: 'ACTIVE',
          progressPercentage: 30.0,
          daysRemaining: 207,
          estimatedCompletion: 'Est. 2027-03-15',
        },
        {
          id: 2,
          description: 'Vacation',
          targetValue: 5000,
          currentValue: 5000,
          deadline: '2026-08-01',
          status: 'COMPLETED',
          progressPercentage: 100.0,
          daysRemaining: 55,
          estimatedCompletion: 'Completed',
        },
      ],
    }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('GoalsPage', () => {
  it('renders goals title', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Financial Goals')).toBeInTheDocument();
  });

  it('renders goal cards after loading', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });

    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows Add Goal button', async () => {
    render(
      <BrowserRouter>
        <GoalsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Add Goal')).toBeInTheDocument();
  });
});
