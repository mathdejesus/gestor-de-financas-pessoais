# AGENTS.md — Financial Management Platform

## Project Overview
Full-stack personal finance app: **Preact 10 + TypeScript + Vite 8 + Tailwind CSS v4** frontend, **Java 21 + Spring Boot 3.2** backend, **PostgreSQL 15** database. Docker Compose for local dev.

## Commands (verified)

### Frontend (`/frontend`)
```bash
npm install            # install deps
npm run dev            # dev server (port 5173)
npm run build          # production build
npm run format:check   # format check (Prettier)
npm run test           # Vitest unit tests
npm run test:coverage  # coverage report
npm run test:e2e       # E2E tests (Playwright)
```

### Backend (`/backend`)
```bash
mvn clean compile      # compile
mvn test               # unit tests (JUnit 5 + Mockito)
mvn clean verify -Ptest # tests + JaCoCo coverage (with TestContainers)
mvn spring-boot:run    # run app (port 8080)
```

### Docker (from repo root)
```bash
docker compose up -d   # starts frontend:5173, backend:8080, postgres:5432
docker compose down    # stop
```

## Architecture (from implementation)

```
frontend/ (Preact + Vite)
  src/
    components/  # reusable UI
    pages/       # route pages
    hooks/       # custom hooks
    services/    # API calls (ky)
    types/       # TS interfaces
    context/     # Context API + useReducer
    utils/       # utility functions

backend/ (Spring Boot)
  src/main/java/com/financeapp/
    controller/  # REST endpoints (/api/v1)
    service/     # business logic
    repository/  # JPA data access
    entity/      # JPA models
    dto/         # request/response DTOs
    config/      # Spring config
    security/    # JWT (HS256), BCrypt
    exception/   # custom exceptions
  src/main/resources/
    application.yml
    db/migration/   # Flyway migrations
```

## Key Conventions
- **API base**: `/api/v1`
- **Auth**: JWT HS256, 24h access / 7d refresh tokens
- **Password hash**: BCrypt 12 rounds
- **DB migrations**: Flyway (versioned SQL in `db/migration/`)
- **Ports**: Frontend 5173, Backend 8080, Postgres 5432
- **Env**: `VITE_API_URL` for frontend → backend URL

## Testing Targets
| Layer | Tool | Coverage Goal | Command |
|-------|------|---------------|---------|
| Frontend | Vitest + @testing-library/preact | 60%+ | `npm run test:coverage` |
| Backend | JUnit 5 + Mockito + TestContainers | 80%+ | `mvn clean verify -Ptest` |
| E2E | Playwright | 50%+ critical flows | `npm run test:e2e` |

## Git Workflow
- Branches: `main` (prod), `develop` (dev), `feature/*`
- Versioning: SemVer, tags `vX.Y.Z`
- CI: GitHub Actions on push to `main`/`develop` and PRs

## Notes for Agents
- **Code is implemented** — verify commands against actual implementation.
- Frontend uses Context API (not Redux/Zustand) for global state.
- Frontend uses Preact 10 (not React), ky (not Axios), Vite 8, Tailwind CSS v4.
- Backend uses Maven, not Gradle.
- JWT uses HS256 (HMAC-SHA256) with secret key, not RS256.
- Dockerfiles use multi-stage builds (builder → runtime).
- See `Financial_Management_Platform_REVISADO.md` for full spec, data model, and roadmap.