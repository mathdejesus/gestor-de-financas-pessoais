# AGENTS.md — Financial Management Platform

Full-stack personal finance app with **Preact 10 + TypeScript + Vite 8 + Tailwind CSS v4** frontend, **Java 21 + Spring Boot 3.2 + Maven** backend, **PostgreSQL 15** database. Docker Compose for local dev and an **Expo/React Native mobile app**.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev # dev server (port 5173)
npm run build # tsc -b && vite build
npm run test:coverage # coverage report
npm run test:e2e # Playwright E2E tests
npm run format:check # prettier check
npm run check:age # dependency age audit (tsx scripts/package-age-check.ts)
```

### Backend (`backend/`)
```bash
cd backend
mvn test # unit tests (JUnit 5 + Mockito)
mvn clean verify -Ptest # tests + JaCoCo coverage (TestContainers)
mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev # run app (port 8080)
```

### Root (repo)
```bash
npm run lint # runs frontend lint (via root npm script)
npm run test # runs frontend unit tests
npm run build # runs frontend build
```

## Architecture

**Backend structure:**
- `backend/` - Maven parent with 3 modules
- `financeapp-api/` - @SpringBootApplication entrypoint, controllers, configuration
- `financeapp-core/` - entities, repositories, services, DTOs, JWT utils
- `financeapp-infra/` - empty scaffold (Redis, Kafka, S3 adapters)

**Key paths (actual implementation):**
- `backend/financeapp-api/src/main/java/com/financeapp/api/` - Controllers
- `backend/financeapp-core/` - Core business logic
- `mobile/` - Expo SDK 56 + React Native app

## Critical Dev Constraints

**Maven multi-module:**
- Always run Maven from `backend/` directory
- Spring Boot module is `financeapp-api` - use `-pl financeapp-api` for `spring-boot:run`
- Avoid Maven from root or switching modules mid-session

**Dev profile quirks:**
- Requires BOTH: `mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev`
- Uses H2 database with `create-drop` (Flyway disabled)
- Swagger/SpringDoc ONLY available in dev profile (`/swagger-ui.html`)

**Configuration quirks:**
- `application.yml` has inline dev profile (`---` separator) alongside `application-dev.yml`
- Backend Docker uses security hardening: user/group creation and `java.security.egd` setting

**Authentication system (**high-risk):**
- Token versioning (User.tokenVersion field, O(1) indexed lookup)
- Silent refresh on 401, no localStorage tokens
- Back-end: 24h access tokens, 7d refresh tokens

**Rate limiting:**
- Resilience4j: auth (5 req/s), API (100 req/s) via config in `application.yml`
- Production Nginx: 30 req/s with burst=20

## Testing peculiarities

**Backend:**
- Uses TestContainers for integration tests (real PostgreSQL)
- Profile `test` for integration tests

**Frontend:**
- Docker tests with `docker run --rm --cpus=2 --memory=4g -v "$PWD:/src:ro"`
- Not gitignore'd cache cleanup (explicit container execution)

## Build & Deployment

**Docker Compose network:**
- Single network: `financeapp-network`
- Inter-container healthchecks (postgres → backend → frontend)

**Docker testing:**
- Container execution pattern on CI/backend
- Build images from `backend/Dockerfile` and `frontend/Dockerfile`

**CI workflow:**
- Node 22 for frontend, Java 21 + PostgreSQL 15 for backend
- Manual deployment triggers (webhook-based)

## Style & Conventions

- **Backend:** @Slf4j, BCrypt 12 rounds, Spring Validation groups
- **Frontend:** Preact functional components with hooks, strict TypeScript
- **Database:** Flyway migrations with semantic versioning (V1.0__)
- **Git:** Pre-commit `lint-staged` + `commitlint` (conventional commits)

## Dependencies

**Critical external tools:**
- Kafka, S3 infrastructure empty (financeapp-infra)
- OpenPDF (PDF generation, not Apache PDFBox)
- actuary tools: Save data risk management

## Resources

- **Swagger:** http://localhost:8080/api/v1/swagger-ui.html (dev only)
- **Actuator:** Default: health,info,metrics | Prod: health only
- **Dev DB:** H2 (profile: dev, file: `application-dev.yml`)
- **Mobile auth:** Local storage → Expo SecureStore context
