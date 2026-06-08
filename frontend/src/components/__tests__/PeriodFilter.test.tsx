import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PeriodFilter, getPeriodDates } from '../../components/PeriodFilter';

describe('PeriodFilter', () => {
  it('renders all period buttons', () => {
    const onSelect = vi.fn();
    render(<PeriodFilter selected="month" onSelect={onSelect} />);

    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('calls onSelect when a period is clicked', async () => {
    const onSelect = vi.fn();
    render(<PeriodFilter selected="month" onSelect={onSelect} />);

    screen.getByText('This Quarter').click();
    expect(onSelect).toHaveBeenCalledWith('quarter');
  });
});

describe('getPeriodDates', () => {
  it('returns null dates for all time', () => {
    const result = getPeriodDates('all');
    expect(result.startDate).toBeNull();
    expect(result.endDate).toBeNull();
  });

  it('returns valid dates for month', () => {
    const result = getPeriodDates('month');
    expect(result.startDate).toBeTruthy();
    expect(result.endDate).toBeTruthy();
  });
});
