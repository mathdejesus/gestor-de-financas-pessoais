# AGENTS.md — Financial Management Platform

Full-stack personal finance app: **Preact 10 + TypeScript + Vite 8 + Tailwind CSS v4** frontend, **Java 21 + Spring Boot 3.2 + Maven** backend, **PostgreSQL 15** database. Docker Compose for local dev. Also has an **Expo/React Native mobile app** in `mobile/`.

## Commands

### Frontend (`frontend/`)
```bash
npm install           # install deps
npm run dev           # dev server (port 5173)
npm run build         # tsc -b && vite build
npm run test          # Vitest unit tests
npm run test:coverage # coverage report
npm run test:e2e      # Playwright E2E tests
npm run test:e2e:ui   # Playwright UI mode (headed)
npm run lint          # lint via eslint
npm run check:age     # dependency age audit (tsx scripts/package-age-check.ts)
```

### Backend (`backend/`)
```bash
mvn clean compile           # compile all modules
mvn test                    # unit tests (JUnit 5 + Mockito)
mvn clean verify -Ptest     # tests + JaCoCo coverage (TestContainers)
mvn spring-boot:run -pl financeapp-api  # run app (port 8080, module required)
```
Multi-module: `financeapp-api`, `financeapp-core`, `financeapp-infra` (empty scaffold). Run targets from the `backend/` parent, but `spring-boot:run` needs `-pl financeapp-api`.

### Docker (from repo root)
```bash
docker compose up -d  # starts postgres:5432, backend:8080, frontend:5173
docker compose down
```

### Formatting
- Frontend: `lint-staged` runs eslint + prettier on staged `.ts/.tsx`, prettier only on `.css/.json` (config in `lint-staged.config.mjs`)
- Backend: Spotless with Google Java Format (`mvn spotless:apply` to auto-format)

### Git hooks active
- `pre-commit`: `lint-staged` (eslint --fix + prettier --write on staged frontend files)
- `commit-msg`: `commitlint --edit` (conventional commits, types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert). Header max 100 chars, no empty subject, no trailing period.

## Architecture

```
frontend/              # Preact + Vite
  src/
    components/        # reusable UI
    pages/             # route pages
    hooks/             # custom hooks
    services/          # API calls via ky
    context/           # AuthContext + AppContext (useReducer)
    types/             # TS interfaces
    utils/             # utility functions

backend/
  financeapp-api/      # @SpringBootApplication entrypoint, controllers, security, config
    src/main/resources/
      application.yml
      application-dev.yml
      db/migration/    # Flyway SQL (V1-V5)
  financeapp-core/     # entities, repositories, services, DTOs, validation, JWT utils
  financeapp-infra/    # empty scaffold (no src/)

mobile/                # Expo SDK 56 + React Native (axios, not ky)
  src/
    screens/           # screen components
    context/           # separate auth context
    services/          # axios API client
```

## Key Conventions

- **API base**: `/api/v1`
- **Auth**: JWT HS256 (jjwt 0.12.5), 24h access / 7d refresh tokens
- **Password hash**: BCrypt 12 rounds
- **DB migrations**: Flyway (versioned SQL, `baseline-on-migrate: true`)
- **State**: Context API (not Redux/Zustand) with useReducer
- **API client**: ky (frontend), axios (mobile)
- **JWT secret**: generated via `openssl rand -base64 64` (set in `JWT_SECRET` env)
- **CORS**: controlled by `APP_CORS_ALLOWED_ORIGINS` env var

## Gotchas (agent will likely miss these)

- **Multi-module Maven**: Backend has 3 modules. `FinanceAppApplication.java` is in `financeapp-api`. It uses `@ComponentScan`/`@EnableJpaRepositories`/`@EntityScan` to reach `com.financeapp.core`. Always run Maven from `backend/` parent.
- **Dev profile uses H2 + Maven profile**: `mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev` — requires `-Pdev` (Maven profile for H2 driver) AND `-Dspring-boot.run.profiles=dev` (Spring profile). No PostgreSQL needed for dev. `ddl-auto: create-drop`, Flyway disabled.
- **Rate Limiting**: Resilience4j `@RateLimiter(name = "auth")` — 5 req/s em login/register. Demais endpoints: 100 req/s via `@RateLimiter(name = "api")`. Nginx em produção: 30 req/s burst=20.
- **Token revocation**: `tokenVersion` field on User + embedded in JWT claims. Incremented on refresh and password change. Old tokens rejected by filter even if not expired. Migration V5 adds the column.
- **CSP in Nginx**: `Content-Security-Policy` header configurado no `nginx.conf` — restringe script-src, style-src, font-src, connect-src.
- **Swagger/SpringDoc**: Available at `/swagger-ui.html` in `dev` profile only.
- **PWA enabled**: `vite-plugin-pwa` with Workbox — service worker auto-registers, API calls cached NetworkFirst (1h), Google Fonts CacheFirst (1y).
- **Nginx in Docker**: Production Dockerfile serves via Nginx which proxies `/api/` to `backend:8080` internally.
- **OpenPDF**: Backend includes openpdf for PDF report generation.
- **Solarized theme**: Light/dark via CSS custom properties + `data-theme` attribute.
