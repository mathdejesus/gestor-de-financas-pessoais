# AGENTS.md — Financial Management Platform

Full-stack personal finance app: **Java 21 + Spring Boot 3.2 + Maven** backend with **server-side rendering (Thymeleaf)**, **PostgreSQL 15**. The frontend is **HTML + CSS only** — no JavaScript framework, no REST API. The backend pulls form data from the frontend and processes everything; pages are pure visual. Docker Compose for local dev. PWA service worker (`sw.js`) only caches static assets for offline use.

## Commands

### Backend (always run Maven from `backend/`)
```bash
mvn test                  # ALL backend tests (unit + integration)
mvn clean verify          # CI-equivalent + JaCoCo (backend/**/target/site/jacoco/)
mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev
```
- **Testcontainers deps are plain `test`-scoped dependencies in the parent `pom.xml`** — no profile gate. `mvn test` works out of the box; `AbstractPostgresIntegrationTest` imports them directly.
- Integration tests (only `financeapp-core/.../repository/*IntegrationTest`) boot their own **Testcontainers `postgres:15-alpine` container** → a **running Docker daemon is required**. They ignore `SPRING_DATASOURCE_URL` (set via `@DynamicPropertySource`). Web layer tests (`financeapp-api/.../web/*Test`) are MockMvc with `@MockBean` — no DB, no Docker.
- Single test: `mvn test -pl financeapp-core -Dtest=AuthServiceTest` (or the repository test class name).
- **`JWT_SECRET` must be set for ANY backend run** (dev, test, compose): `application.yml` uses `secret: ${JWT_SECRET}` with no default and `application-dev.yml` doesn't override it. Generate with `openssl rand -base64 64 | tr -d '\n'` — note `openssl rand -base64` wraps at 64 chars, so plain `$(openssl rand -base64 64)` embeds a `\n` that breaks jjwt's base64 decode. Controller tests mock `JwtUtil` so they don't need it; `financeapp-core` tests hardcode one in `src/test/resources/application.yml`.

### Root
```bash
# No npm/node tooling anymore (frontend was removed; husky + commitlint removed in 2026-08-09).
```

## Architecture & Key Paths

- `backend/financeapp-api/` — entrypoint, **web controllers (MVC, package `...api.web`)**, `SecurityConfig`, `JwtAuthenticationFilter`, resources (`application*.yml`, Flyway migrations, **Thymeleaf templates**, **static assets**)
- `backend/financeapp-core/` — entities, services, `JwtUtil`, repositories, DTOs (business logic, framework-free)
- **Templates**: `backend/financeapp-api/src/main/resources/templates/` — `fragments/layout.html` (head + navbar fragments), `auth/`, `dashboard/`, `transactions/`, `categories/`, `goals/`, `reports/`, `settings/`, `error.html`
- **Static**: `backend/financeapp-api/src/main/resources/static/` — `css/app.css` (paleta Solarized, dark/light via `data-theme`), `favicon.svg`, `icons/icon.svg`, `manifest.webmanifest`, `sw.js`
- **Web controllers** (`com.financeapp.api.web`): `AuthPageController`, `DashboardPageController`, `TransactionPageController`, `CategoryPageController`, `GoalPageController`, `ReportPageController`, `SettingsPageController`, `ThemeController`, `WebModelAdvice`
- **No REST API** — no `@RestController`, no `/api/v1/*`, no Swagger/OpenAPI. All forms are classic HTML POSTs (PRG pattern).
- **Swagger**: removed. There is no OpenAPI surface anymore.

## Critical Quirks

**Maven multi-module:**
- Run Maven only from `backend/`; `spring-boot:run` needs `-pl financeapp-api`. Avoid `-pl` module switching mid-session (stale reactor builds).

**Dev profile needs BOTH flags:** `-Pdev` (Maven — adds H2 to classpath) AND `-Dspring-boot.run.profiles=dev` (Spring — loads `application-dev.yml`). Dev = H2 in-memory, `ddl-auto: create-drop`, **Flyway disabled**, `h2-console` at `/h2-console`, Thymeleaf cache off.

**Prod:** Flyway enabled + `ddl-auto: validate`, Actuator exposes `health` only, error messages suppressed.

**Authentication (high-risk, do not regress):**
- HttpOnly cookie + CSRF double-submit (cookie `secure` only in prod); **no JS silent refresh — the refresh happens server-side in `JwtAuthenticationFilter`** (a valid `refresh_token` cookie reissues the `access_token` cookie in-place when the access token is missing/expired)
- CSRF: `CookieCsrfTokenRepository.withHttpOnlyFalse()` + `CsrfTokenRequestAttributeHandler`. **Every form needs `<input type="hidden" name="_csrf" th:value="${_csrf.token}">`** — there is no JS to read the `XSRF-TOKEN` cookie anymore.
- Cookie paths: `access_token` / `refresh_token` / `theme` are all `path=/` (whole site, not just `/api`). `theme` cookie is **not** HttpOnly (read by no JS — actually server-rendered only; kept simple for PWA cache).
- Token versioning: `User.tokenVersion` bumped on logout/password change, indexed lookup
- Per-account lockout: 5 failed logins → 15 min (`V6__add_login_lockout.sql`)
- JWT: 24h access, 7d refresh, BCrypt 12 rounds
- Anonymous access to protected pages → `302 /login` (configured in `SecurityConfig` exception handling)

**Rate limiting:** Resilience4j — auth 5 req/s, API 100 req/s (`application.yml`). No nginx in front anymore (no frontend container).

## Testing Peculiarities

- Backend: `@DataJpaTest` integration tests extend `AbstractPostgresIntegrationTest` (schema from JPA `create-drop`, not Flyway). Flyway migrations live only in `financeapp-api` resources
- Web layer: `financeapp-api/src/test/java/com/financeapp/api/web/WebPageTest.java` — MockMvc smoke tests (render, redirects, cookie set, PRG), `@MockBean` services, `@Import(SecurityConfig.class)`
- Docker image builds skip tests (`backend/Dockerfile`: `-Dmaven.test.skip=true` — `-DskipTests` only skips execution, not testCompile).
- Backend formatting: Spotless google-java-format (`mvn spotless:apply`) — configured but NOT bound to the build

## Docker Compose

- Services: `postgres` + `backend` only (no frontend container — the backend serves the HTML)
- Single network `financeapp-network`; healthcheck chain postgres → backend
- Requires `.env` with `POSTGRES_PASSWORD` and `JWT_SECRET` (compose file uses `:?` required syntax → `docker compose up` fails without them); template in `.env.example`
- App served at `http://localhost:8080` — `/` redirects to `/login` (or `/dashboard` when authenticated)

## Git & Conventions

- Conventional commits (`feat`, `fix`, `docs`, `refactor`, `chore`, etc., header ≤ 100 chars) — convention only, no hook enforcement (husky/commitlint removed)
- Flyway migrations: semantic versions `V1.0__`, `V1.1__` style
