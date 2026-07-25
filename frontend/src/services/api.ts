import ky from 'ky';
import type { AfterResponseHook } from 'ky';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ReportResponse,
  LoginResponse,
  RegisterResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const unauthorizedHook: AfterResponseHook = async ({ request, response }) => {
  if (response.status === 401) {
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register') || request.url.includes('/auth/refresh')) {
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return response;
    }

    try {
      const refreshResponse = await ky.post(`${API_BASE_URL}/auth/refresh`, {
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        return ky.retry({ request, code: 'TOKEN_REFRESHED' });
      }
    } catch {
      // Refresh failed — fall through to logout
    }

    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  return response;
};

export const api = ky.create({
  prefix: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
          const csrfToken = getCookie('XSRF-TOKEN');
          if (csrfToken) {
            request.headers.set('X-XSRF-TOKEN', csrfToken);
          }
        }
      },
    ],
    afterResponse: [unauthorizedHook],
  },
  credentials: 'include',
  retry: {
    limit: 2,
    methods: ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  timeout: 30000,
});

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api
      .post('auth/login', { json: body })
      .json<LoginResponse>()
      .then(data => ({ data })),
  register: (body: { name: string; email: string; password: string }) =>
    api
      .post('auth/register', { json: body })
      .json<RegisterResponse>()
      .then(data => ({ data })),
  logout: () =>
    api.post('auth/logout').then(() => {}),
  getProfile: () =>
    api
      .get('auth/profile')
      .json<UserProfile>()
      .then(data => ({ data })),
  updateProfile: (body: UpdateProfileRequest) =>
    api
      .put('auth/profile', { json: body })
      .json<UserProfile>()
      .then(data => ({ data })),
  changePassword: (body: ChangePasswordRequest) =>
    api.post('auth/change-password', { json: body }).json<void>(),
};

export const reportApi = {
  generateFinancialReport: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return api
      .get(`reports/financial${query ? `?${query}` : ''}`)
      .json<ReportResponse>()
      .then(data => ({ data }));
  },
};

export type { KyInstance } from 'ky';
