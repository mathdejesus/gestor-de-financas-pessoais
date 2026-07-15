import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/preact';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  api: {},
}));

const wrapper = ({ children }: { children: unknown }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns user as null and isAuthenticated false initially', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Wait for the hydration effect to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('hydrates user from localStorage', async () => {
    const userData = { id: '1', name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('user', JSON.stringify(userData));

    const { result } = renderHook(() => useAuth(), { wrapper });
    // Wait for hydration effect
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(userData);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears user and token on logout', async () => {
    localStorage.setItem('accessToken', 'mock-token');
    localStorage.setItem('refreshToken', 'mock-refresh');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test', email: 'test@test.com' }));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('calls login API and updates state on success', async () => {
    const mockResponse = {
      data: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: { id: '1', name: 'Test', email: 'test@test.com' },
      },
    };
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('test-token');
  });

  it('calls register API and updates state on success', async () => {
    const mockResponse = {
      data: {
        accessToken: 'reg-token',
        refreshToken: 'reg-refresh',
        user: { id: '2', name: 'New User', email: 'new@test.com' },
      },
    };
    (authApi.register as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register('New User', 'new@test.com', 'password');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('throws error if used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});
