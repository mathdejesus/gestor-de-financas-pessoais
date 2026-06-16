import ky from 'ky';
import type { BeforeRequestHook, AfterResponseHook } from 'ky';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Attaches the JWT access token to every outgoing request.
 * Reads from the same localStorage key that AuthContext writes.
 */
const authHook: BeforeRequestHook = ({ request }) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
};

/**
 * On 401 responses, clears auth state and redirects to login.
 * Handles both expired access tokens and invalid sessions.
 */
const unauthorizedHook: AfterResponseHook = async ({ response }) => {
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return response;
};

/**
 * Auth-specific API wrapper that calls auth endpoints.
 * Returns responses wrapped in { data } to match the expected format
 * in AuthContext.tsx while keeping the generic api instance pure.
 */
export const authApi = {
  login: (body: { email: string; password: string }) =>
    api
      .post('auth/login', { json: body })
      .json<any>()
      .then(data => ({ data })),
  register: (body: { name: string; email: string; password: string }) =>
    api
      .post('auth/register', { json: body })
      .json<any>()
      .then(data => ({ data })),
};

export const api = ky.create({
  prefix: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [authHook],
    afterResponse: [unauthorizedHook],
  },
  retry: {
    limit: 2,
    methods: ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  timeout: 30000,
});

export type { KyInstance } from 'ky';
