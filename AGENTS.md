# AGENTS.md — Financial Management Platform

## Project Overview
Full-stack personal finance app: **React 18 + TypeScript + Vite + Tailwind** frontend, **Java 21 + Spring Boot 3.2** backend, **PostgreSQL 15** database. Docker Compose for local dev.

## Commands (planned — not yet verified)

### Frontend (`/frontend`)
```bash
npm install           # install deps
npm run dev           # dev server (port 5173)
npm run build         # production build
npm run lint          # ESLint
npm run test          # Vitest
npm run test:coverage # coverage report
```

### Backend (`/backend`)
```bash
mvn clean compile     # compile
mvn test              # unit tests (JUnit 5 + Mockito)
mvn clean verify      # tests + JaCoCo coverage
mvn spring-boot:run   # run app (port 8080)
```

### Docker (from repo root)
```bash
docker compose up -d  # starts frontend:5173, backend:8080, postgres:5432
docker compose down   # stop
```

## Architecture (from spec)

```
frontend/ (React + Vite)
  src/
    components/  # reusable UI
    pages/       # route pages
    hooks/       # custom hooks
    services/    # API calls (Axios)
    types/       # TS interfaces
    context/     # Context API + useReducer

backend/ (Spring Boot)
  src/main/java/com/financeapp/
    controller/  # REST endpoints (/api/v1)
    service/     # business logic
    repository/  # JPA data access
    entity/      # JPA models
    dto/         # request/response DTOs
    config/      # Spring config
    security/    # JWT, BCrypt
    exception/   # custom exceptions
  src/main/resources/
    application.yml
    db/migration/   # Flyway migrations
```

## Key Conventions
- **API base**: `/api/v1`
- **Auth**: JWT RS256, 24h access / 7d refresh tokens
- **Password hash**: BCrypt 12 rounds
- **DB migrations**: Flyway (versioned SQL in `db/migration/`)
- **Ports**: Frontend 5173, Backend 8080, Postgres 5432
- **Env**: `VITE_API_BASE_URL` for frontend → backend URL

## Testing Targets
| Layer | Tool | Coverage Goal |
|-------|------|---------------|
| Frontend | Vitest + React Testing Library | 60%+ |
| Backend | JUnit 5 + Mockito | 80%+ |
| E2E | Cypress | 50%+ critical flows |

## Git Workflow
- Branches: `main` (prod), `develop` (dev), `feature/*`
- Versioning: SemVer, tags `vX.Y.Z`
- CI: GitHub Actions on push to `main`/`develop` and PRs

## Notes for Agents
- **No code exists yet** — this is a spec-only repo. Verify commands once implementation starts.
- Frontend uses Context API (not Redux/Zustand) for global state.
- Backend uses Maven, not Gradle.
- Dockerfiles use multi-stage builds (builder → runtime).
- See `Financial_Management_Platform_REVISADO.md` for full spec, data model, and roadmap.