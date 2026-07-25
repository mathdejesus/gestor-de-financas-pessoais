# Frontend — Gestor de Finanças Pessoais

Preact 10 + TypeScript + Vite 8 + Tailwind CSS v4

## Tech Stack

- **Framework:** Preact 10 (lightweight React alternative, ~10KB)
- **Language:** TypeScript (strict mode)
- **Build:** Vite 8
- **Styling:** Tailwind CSS v4 (utility-first)
- **State:** Context API with useState (not useReducer/Redux/Zustand)
- **API Client:** ky (with HttpOnly cookie auth, CSRF double-submit, silent refresh)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Linting:** ESLint + Prettier (via lint-staged pre-commit hooks)

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI (Layout, ErrorBoundary, ChatbotPanel)
│   ├── pages/             # Route pages (Dashboard, Transactions, Categories, Goals, Reports, Settings, Login, Register)
│   ├── hooks/             # Custom hooks (useAuth, useTransactions, useCategories, useGoals, useReports, useTheme)
│   ├── context/           # AuthContext (useState-based, no localStorage tokens)
│   ├── services/          # API calls via ky (authApi, reportApi, transactionsApi)
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions (validation, currency, date)
│   ├── App.tsx            # Root component with routing
│   └── main.tsx           # Entry point
├── tests/e2e/             # Playwright E2E tests
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest configuration
├── Dockerfile             # Multi-stage build (Node build + Nginx serve)
└── nginx.conf             # Nginx config with CSP headers
```

## Authentication

The frontend uses **HttpOnly cookie-based auth** (not localStorage):

- **Login/Register:** Backend sets `access_token` and `refresh_token` as HttpOnly cookies
- **API requests:** `credentials: 'include'` sends cookies automatically
- **CSRF:** Double-submit pattern — reads `XSRF-TOKEN` cookie, sends as `X-XSRF-TOKEN` header
- **Silent refresh:** On 401, attempts `POST /auth/refresh` before redirecting to login
- **Logout:** Calls `POST /auth/logout` to clear cookies, then clears local user state

## Commands

```bash
npm install           # install deps
npm run dev           # dev server (port 5173)
npm run build         # tsc -b && vite build
npm run preview       # vite preview (production-like)
npm run test          # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npm run test:coverage # coverage report
npm run test:e2e      # Playwright E2E tests
npm run lint          # lint via eslint
npm run format        # prettier write
```

## Docker Testing

```bash
# Run tests in clean Docker container
docker run --rm --cpus=2 --memory=4g -v "$PWD":/src:ro node:20-alpine sh -c \
  'cp -r /src /test && cd /test && rm -rf node_modules package-lock.json && npm install --no-audit --no-fund && npm test'
```
