# Session Handoff — Gestor de Financas Pessoais

> Auto-generated session summary. Read this first when resuming work on this project.

## Project Overview

Full-stack personal finance platform: **Preact 10 + TypeScript + Vite 8** frontend, **Java 21 + Spring Boot 3.2** backend, **PostgreSQL 15** database, **Expo/React Native** mobile app. Docker Compose for local dev.

## Current State (2026-07-25)

### Git History (recent)
```
b991af6 chore: add .dockerignore + update .gitignore for graphify-out
8924923 fix(security): conditional secure cookies for dev + integrate mobile SSL pinning
16c0dfc feat(security): switch frontend to HttpOnly cookie auth with silent refresh
8baedeb feat(security): add HttpOnly cookie auth with CSRF double-submit protection
a9a7c5d feat(security): add SSL certificate pinning for mobile API
d9fd627 fix(security): default mobile API URL to HTTPS
315f48a fix(security): remove email from duplicate account error message
3de6abe feat(security): implement per-account lockout after 5 failed logins
6d82202 feat(security): add per-account lockout fields and migration
```

### Test Results
- **Frontend:** 44/44 pass (Vitest)
- **Backend:** 32/32 pass (JUnit 5 + Mockito)
- **Lint:** 0 errors

### Security Hardening (C1-C6) — Complete

| Finding | Status | Details |
|---|---|---|
| C1: JWT in localStorage | ✅ | HttpOnly cookies, frontend removed localStorage tokens |
| C2: Mobile HTTP default | ✅ | Default URL changed to HTTPS |
| C3: Refresh token unused | ✅ | Silent refresh: 401 → POST /auth/refresh → retry |
| C4: No cert pinning | ✅ | `react-native-ssl-pinning` integrated, sslPinningAdapter on mobile |
| C5: Email enumeration | ✅ | Generic error message in DuplicateEmailException |
| C6: No brute force | ✅ | Lock after 5 failures for 15min, V6 migration |

### Post-Audit Fixes (Session 2)
- `secure(true)` → `secure(!isDev())` — cookies work in dev HTTP mode
- SameSite unified to `Lax` for all cookies
- Refresh cookie path expanded from `/api/v1/auth/refresh` to `/api`
- Mobile SSL pinning actually integrated via `sslPinningAdapter`
- `.dockerignore` created (root + backend + frontend)

## Architecture Quick Reference

```
backend/
  financeapp-api/     # Controllers, SecurityConfig, AuthController (cookie auth)
  financeapp-core/    # Entities, Services, JWT util, User lockout fields
  financeapp-infra/   # Empty scaffold
frontend/
  src/services/api.ts  # ky with credentials:'include', CSRF, silent refresh
  src/context/AuthContext.tsx  # useState-based, no localStorage tokens
mobile/
  src/services/api.ts  # axios with sslPinningAdapter for prod
  src/config/sslPinning.ts  # certs-based pinning (needs real .cer file)
```

## Key Files for Security Work

| File | Purpose |
|---|---|
| `AuthController.java` | Cookie setting (secure conditional, SameSite Lax) |
| `SecurityConfig.java` | CSRF, CORS, session policy |
| `JwtAuthenticationFilter.java` | Cookie-first token resolution |
| `AuthService.java` | Login lockout logic |
| `User.java` | failedLoginAttempts, lockedUntil fields |
| `V6__add_login_lockout.sql` | DB migration |
| `frontend/src/services/api.ts` | Silent refresh, CSRF header, credentials:include |
| `mobile/src/services/api.ts` | SSL pinning adapter |

## Pending Items

1. **Mobile SSL cert:** Place `.cer` file in `mobile/ios/` and `mobile/android/app/src/main/res/raw/`
2. **graphify-out/:** In .gitignore, not committed (intentional)
3. **Abordagem A (Docker improvements):** Healthcheck tuning, .dockerignore (done), permission fixes — not critical

## Commands Reference

```bash
# Backend tests (Docker sandbox)
docker run --rm --cpus=2 --memory=4g -v "$PWD/backend":/src:ro \
  -v sandbox-m2:/root/.m2 -v /var/run/docker.sock:/var/run/docker.sock \
  maven:3.9-eclipse-temurin-21-alpine sh -c \
  'cp -r /src /app && cd /app && mvn -q clean test'

# Frontend tests (Docker sandbox)
docker run --rm --cpus=2 --memory=4g -v "$PWD/frontend":/src:ro node:20-alpine sh -c \
  'cp -r /src /test && cd /test && rm -rf node_modules package-lock.json && npm install --no-audit --no-fund && npm test'

# Graphify update
graphify . --update

# Dev mode (no PostgreSQL needed)
cd backend && mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev
```

## Gotchas

- Backend multi-module: always run Maven from `backend/` parent, but `spring-boot:run` needs `-pl financeapp-api`
- Dev profile: needs `-Pdev` (Maven) AND `-Dspring-boot.run.profiles=dev` (Spring)
- H2 in dev, PostgreSQL in prod — `ddl-auto: create-drop`, Flyway disabled in dev
- Cookie auth: `secure(false)` in dev, `secure(true)` in prod — auto-detected via `SPRING_PROFILES_ACTIVE`
- Mobile SSL pinning: disabled in dev via `Constants.expoConfig?.extra?.environment === 'development'`
- lint-staged: standalone `lint-staged.config.mjs` is used, not package.json config
