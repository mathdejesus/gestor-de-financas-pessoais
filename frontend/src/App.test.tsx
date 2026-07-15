import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders login page when not authenticated', async () => {
    render(<App />);
    // AuthProvider starts in loading state, then PublicRoute shows LoginPage
    expect(await screen.findByText(/FinanceApp/)).toBeInTheDocument();
  });
});
