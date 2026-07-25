# Security + Infrastructure Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 security and infrastructure issues of low risk but high impact in the gestor-de-financas-pessoais project.

**Architecture:** Targeted fixes across backend (CSV injection, PDF format), frontend (password validation, error boundary), and infrastructure (Docker restart policy). Each task is independent and can be committed separately.

**Tech Stack:** Java 21 + Spring Boot 3.2 (backend), Preact 10 + TypeScript (frontend), Docker Compose (infra)

## Global Constraints

- Java 21, Spring Boot 3.2, Maven multi-module (`financeapp-api`, `financeapp-core`)
- Preact 10 + TypeScript + Vite, Tailwind CSS v4
- Docker Compose with PostgreSQL 15
- Conventional commits enforced (commitlint)
- Backend: `mvn clean compile` must pass after each backend task
- Frontend: `npm run lint` must pass after each frontend task

---

### Task 1: Fix CSV Injection in DashboardController

**Files:**
- Modify: `backend/financeapp-api/src/main/java/com/financeapp/api/controller/DashboardController.java`

**Interfaces:**
- Consumes: `TransactionDTO` from `com.financeapp.core.dto`
- Produces: Sanitized CSV output, correct Content-Type header

- [ ] **Step 1: Add `sanitizeCsvField` private method**

Add after the `exportCsv` method (around line 93):

```java
private String sanitizeCsvField(String value) {
    if (value == null) return "";
    String sanitized = value.replace("\"", "\"\"");
    if (!sanitized.isEmpty() && "=+-@\t\n".indexOf(sanitized.charAt(0)) >= 0) {
        sanitized = "'" + sanitized;
    }
    return sanitized;
}
```

- [ ] **Step 2: Update CSV field writing to use sanitization**

Replace lines 80-81 in the `exportCsv` method:

```java
// Before:
csv.append("\"").append(t.getDescription() != null ? t.getDescription().replace("\"", "\"\"") : "").append("\",");
csv.append("\"").append(t.getCategoryName() != null ? t.getCategoryName() : "").append("\",");

// After:
csv.append("\"").append(sanitizeCsvField(t.getDescription())).append("\",");
csv.append("\"").append(sanitizeCsvField(t.getCategoryName())).append("\",");
```

- [ ] **Step 3: Fix Content-Type from TEXT_PLAIN to text/csv**

Replace line 90:

```java
// Before:
.contentType(MediaType.TEXT_PLAIN)

// After:
.contentType(MediaType.parseMediaType("text/csv"))
```

- [ ] **Step 4: Verify backend compiles**

Run: `mvn clean compile -f backend/financeapp-api/pom.xml`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/financeapp-api/src/main/java/com/financeapp/api/controller/DashboardController.java
git commit -m "fix(security): sanitize CSV fields to prevent formula injection"
```

---

### Task 2: Align Frontend Password Validation with Backend

**Files:**
- Modify: `frontend/src/utils/validation.ts:6-14`
- Modify: `frontend/src/pages/RegisterPage.tsx:84`

**Interfaces:**
- Consumes: Backend `@Size(min=8)` + `@StrongPassword` rules (uppercase, lowercase, digit)
- Produces: `validatePassword()` function matching backend rules exactly

- [ ] **Step 1: Update `validatePassword` in `validation.ts`**

Replace the function body (lines 6-14):

```typescript
export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }
  return { valid: true, message: '' };
}
```

- [ ] **Step 2: Update `minLength` in RegisterPage.tsx**

Replace line 84:

```tsx
// Before:
minLength={6}

// After:
minLength={8}
```

- [ ] **Step 3: Run lint**

Run: `npm run lint` (from `frontend/`)
Expected: No errors

- [ ] **Step 4: Run existing validation tests**

Run: `npm run test -- --run src/utils/validation.test.ts` (from `frontend/`)
Expected: Tests pass (may need to update expected messages if tests check specific strings)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/validation.ts frontend/src/pages/RegisterPage.tsx
git commit -m "fix(security): align frontend password validation with backend rules"
```

---

### Task 3: Fix PDF Currency Format from USD to BRL

**Files:**
- Modify: `backend/financeapp-api/src/main/java/com/financeapp/api/service/ReportService.java:292-294`

**Interfaces:**
- Consumes: `BigDecimal` value from report data
- Produces: BRL-formatted string (`R$ 1.234,56`)

- [ ] **Step 1: Replace USD format with BRL format**

Replace the `formatCurrency` method (lines 292-294):

```java
// Before:
private String formatCurrency(BigDecimal value) {
    return new java.text.DecimalFormat("$#,##0.00").format(value);
}

// After:
private String formatCurrency(BigDecimal value) {
    return java.text.NumberFormat.getCurrencyInstance(java.util.Locale.of("pt", "BR")).format(value);
}
```

- [ ] **Step 2: Verify backend compiles**

Run: `mvn clean compile -f backend/financeapp-api/pom.xml`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/financeapp-api/src/main/java/com/financeapp/api/service/ReportService.java
git commit -m "fix: change PDF report currency format from USD to BRL"
```

---

### Task 4: Sanitize ErrorBoundary Messages

**Files:**
- Modify: `frontend/src/components/ErrorBoundary.tsx:35-38`

**Interfaces:**
- Consumes: React error boundary state
- Produces: Generic user-facing error message (no internal details)

- [ ] **Step 1: Replace error message display**

Replace lines 35-38:

```tsx
// Before:
<h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
<p className="text-gray-600 mb-6">
  {this.state.error?.message || 'An unexpected error occurred'}
</p>

// After:
<h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h1>
<p className="text-gray-600 mb-6">
  Ocorreu um erro inesperado. Por favor, tente novamente.
</p>
```

- [ ] **Step 2: Run lint**

Run: `npm run lint` (from `frontend/`)
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ErrorBoundary.tsx
git commit -m "fix(security): hide internal error details from ErrorBoundary UI"
```

---

### Task 5: Add Docker Restart Policy

**Files:**
- Modify: `docker-compose.yml`

**Interfaces:**
- Consumes: Docker Compose service definitions
- Produces: Auto-restart behavior on container crash

- [ ] **Step 1: Add `restart: unless-stopped` to postgres service**

Add after `container_name: financeapp-postgres` (around line 5):

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: financeapp-postgres
    restart: unless-stopped
```

- [ ] **Step 2: Add `restart: unless-stopped` to backend service**

Add after `container_name: financeapp-backend` (around line 24):

```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: financeapp-backend
    restart: unless-stopped
```

- [ ] **Step 3: Add `restart: unless-stopped` to frontend service**

Add after `container_name: financeapp-frontend` (around line 50):

```yaml
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: financeapp-frontend
    restart: unless-stopped
```

- [ ] **Step 4: Validate docker-compose syntax**

Run: `docker compose config` (from repo root)
Expected: Valid YAML output with no errors

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "fix(infra): add restart policy to all Docker Compose services"
```

---

## Summary

| Task | Category | Files Changed | Risk |
|------|----------|---------------|------|
| 1. CSV Injection | Security | `DashboardController.java` | Low |
| 2. Password Validation | Security + UX | `validation.ts`, `RegisterPage.tsx` | Low |
| 3. PDF BRL Format | Consistency | `ReportService.java` | Low |
| 4. ErrorBoundary | Security | `ErrorBoundary.tsx` | Low |
| 5. Docker Restart | Infrastructure | `docker-compose.yml` | Low |

**Total:** 6 files modified, 5 independent commits, all low-risk changes.
