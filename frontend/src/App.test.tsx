import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('FinanceApp')).toBeInTheDocument();
  });
});
