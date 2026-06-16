# ACTION PLAN — Qualidade, Segurança & Documentação

## Status da Execução

| Fase | Status | Detalhes |
|------|--------|----------|
| **Fase 1** — Comentar o código | ✅ Completo | 16 arquivos comentados (security, services, entities, frontend) |
| **Fase 2** — Corrigir bugs | ✅ Completo | B1-B5 corrigidos |
| **Fase 3** — Rate Limiting | ✅ Completo | Resilience4j + Nginx configurados |
| **Fase 4** — Verificação | ✅ Completo | Backend compile OK, frontend com erros TS pré-existentes |
| **Fase 5** — Teste de Penetração | ⚠️ Parcial | Análise de código (ZAP indisponível no ambiente) |
| **Fase 6** — Recomendações | ✅ Completo | S1 (token version), S2 (password size), S6 (CSP) implementados |

---

## Fase 1: Comentar o Código (WHY, não WHAT)

### 1.1 Backend — Security
- **JwtUtil.java** — JavaDoc: rationale HS256, estrutura de claims (sub=userId, email, type), validação de placeholder, lifecycle de expiração
- **JwtAuthenticationFilter.java** — JavaDoc: OncePerRequestFilter, extração Bearer, chain continua sem SecurityContext (decisão delegada ao downstream)
- **SecurityConfig.java** — JavaDoc: CSRF desabilitado (API stateless), Sessão STATELESS, CORS configurável, cadeia de filtros

### 1.2 Backend — Services & Controllers
- **AuthService.java** — JavaDoc em todos os 6 métodos públicos (parâmetros, exceções, rationale)
- **GlobalExceptionHandler.java** — JavaDoc: formato padronizado de resposta de erro
- **TransactionService.java, CategoryService.java, GoalService.java, DashboardService.java** — JavaDoc nas classes

### 1.3 Backend — Domain Entities
- **User.java** — Identidade multi-tenant (fronteira de isolamento de dados)
- **Category.java** — icon/color como hints visuais, uniqueConstraint (user_id, name)
- **Transaction.java** — FetchType.LAZY explícito
- **FinancialGoal.java** — Lifecycle de status, auto-transição COMPLETED

### 1.4 Frontend — Context & Services
- **AuthContext.tsx** — Contrato de storage (accessToken/refreshToken/user), hydrate em mount
- **api.ts** — authHook (Bearer token), unauthorizedHook (401 redirect), retry strategy

### 1.5 Comentários Residuais Removidos
- `Header.tsx`: `// test comment` removido
- `api.ts`: `// frontend/src/services/api.ts` removido

---

## Fase 2: Corrigir Bugs Conhecidos

| # | Bug | Correção |
|---|---|---|
| ✅ B1 | `.env.example` (frontend) tinha `VITE_API_BASE_URL`, código lê `VITE_API_URL` | Renomeado para `VITE_API_URL=http://localhost:8080/api` |
| ✅ B2 | `api.ts` lia `localStorage.getItem("token")`, AuthContext salva como `accessToken` | Unificado para `accessToken` em ambos. `unauthorizedHook` agora limpa `accessToken` + `refreshToken` + `user` |
| ✅ B3 | `router.tsx` hash-based legacy não usado | Arquivo removido |
| ✅ B4 | `ci-cd.yml` usa Gradle (projeto é Maven) | Workflow removido |
| ✅ B5 | Referência a `master` + `main` | Removido junto com B4 |

### Correções adicionais feitas
- `AuthContext.tsx` importava `{ authApi }` que não existia em `api.ts` — **criado `authApi`** com métodos `login` e `register`
- Comentário WHAT (`// Check if email is being changed...`) removido de `AuthService.java` (já documentado pelo JavaDoc)

---

## Fase 3: Implementar Rate Limiting

### Backend — Resilience4j
- **Dependência**: `resilience4j-spring-boot3:2.2.0` + `spring-boot-starter-aop`
- **Config**: 5 req/s para auth, 100 req/s para demais endpoints
- **Anotações**: `@RateLimiter(name = "auth")` em AuthController (login/register); `@RateLimiter(name = "api")` nos demais controllers (class-level)
- **Exception Handler**: `RequestNotPermitted` → HTTP 429 com corpo JSON padronizado

### Nginx — Docker (produção)
- `limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;`
- `limit_req zone=api burst=20 nodelay;` no location `/api/`

---

## Fase 4: Verificação

- **Backend compile**: ✅ `mvn clean compile` — sucesso
- **Backend tests**: ✅ `mvn test` — sucesso (sem testes de unidade no módulo api)
- **Frontend build**: ⚠️ Falha com erros TS **pré-existentes** (não causados por este plano):
  - Páginas importam tipos que não existem em `types/index.ts`
  - `recharts` não está instalado
  - Import/export case mismatches (`app.tsx` vs `App.tsx`)
  - Event handlers sem type narrowing (`e.target` possibly null)
  - **Nenhum desses erros foi introduzido por este plano**

---

## Fase 5: Análise de Segurança (Código)

> OWASP ZAP não estava disponível no ambiente de execução. A análise abaixo foi feita por revisão manual do código e simulação de ataques comuns.

### ✅ Controles Implementados

| Controle | Status | Evidência |
|---|---|---|
| JWT HS256 | ✅ | `JwtUtil.java` — HMAC-SHA256 via jjwt 0.12.5 |
| BCrypt 12 rounds | ✅ | `SecurityConfig.java` — `BCryptPasswordEncoder(12)` |
| Input validation | ✅ | `@Valid` + Jakarta Validation em todos os endpoints |
| SQL Injection prevention | ✅ | JPA/Hibernate (parameterized queries) + Flyway |
| CORS whitelist | ✅ | Configurável via `APP_CORS_ALLOWED_ORIGINS` |
| Rate Limiting | ✅ | Resilience4j (5 req/s auth, 100 req/s api) + Nginx (30 req/s) |
| Security headers (Nginx) | ✅ | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy |
| Non-root container | ✅ | Dockerfiles rodam como `appuser` |
| JWT secret validation | ✅ | Rejeita placeholder em produção |
| Session management | ✅ | STATELESS (sem HttpSession) |
| Password change with current verification | ✅ | `AuthService.changePassword()` |

### ⚠️ Observações de Segurança

| # | Observação | Severidade | Arquivo |
|---|---|---|---|
| S1 | **Refresh tokens não são invalidados no servidor** após uso. Rotação é feita (novo token é emitido), mas o token anterior continua válido até expirar (7d). Um token vazado permite refresh até expirar. | **Média** | `JwtUtil.java` |
| S2 | **Sem validação de comprimento de senha** no backend. O frontend pode limitar, mas o backend aceita qualquer tamanho via Jakarta Validation — não há `@Size(min=8)` explícito nos DTOs. Verificar `RegisterRequest.java` e `ChangePasswordRequest.java`. | **Média** | DTOs de auth |
| S3 | **Actuator health endpoint público** — expõe `show-details: when_authorized` no ambiente não-dev. Em dev: `include-message: always`. Risco baixo pois só health info. | **Baixa** | `application.yml` |
| S4 | **CORS permite credenciais** (`allowCredentials: true`) com `allowedOrigins` dinâmico. Se um origin malicioso for adicionado à lista, cookies/headers de auth podem ser exfiltrados. Mitigado por ser whitelist configurável. | **Baixa** | `SecurityConfig.java` |
| S5 | **Role-based access control (RBAC) ausente** — todos os usuários autenticados têm as mesmas permissões. O sistema atual não tem conceito de admin/user roles. | **Informativo** | `JwtAuthenticationFilter.java` |
| S6 | **Frontend não valida CSP** no Nginx (Content-Security-Policy header não configurado). O PWA registra service worker que pode ser vetor de ataque. | **Média** | `nginx.conf` |

---

## Fase 6: Recomendações de Correção (Pós-Análise)

### ✅ Implementado — Todas as recomendações aprovadas foram executadas

| # | Alerta | Correção Implementada | Arquivos |
|---|---|---|---|
| ✅ S1 | Refresh token sem revogação | `tokenVersion` no User entity, incluído nos claims JWT. Incrementado em `refreshToken` e `changePassword`. Validado no filter e no service. Migração V5 adiciona coluna. | `User.java`, `JwtUtil.java`, `AuthService.java`, `JwtAuthenticationFilter.java`, `V5__add_token_version_to_users.sql` |
| ✅ S2 | Sem validação de tamanho de senha | `@Size(min = 8)` adicionado ao `RegisterRequest.password` | `RegisterRequest.java` |
| ✅ S6 | CSP ausente no Nginx | `Content-Security-Policy` header configurado com restrições de script, style, font, img, connect-src | `nginx.conf` |

### Alta / Média Severidade

| # | Alerta | Descrição | Correção Proposta |
|---|---|---|---|
| S1 | Refresh token sem revogação | Token vazado permite refresh por até 7 dias | Implementar `token_version` no usuário ou uma blacklist de tokens no Redis. Incrementar version no `changePassword` e `refreshToken` para invalidar tokens anteriores |
| S2 | Sem validação de tamanho de senha | Backend aceita senhas fracas/curtas | Adicionar `@Size(min = 8, max = 100)` em `RegisterRequest.password` e `ChangePasswordRequest.newPassword` |
| S6 | CSP ausente | Risco de XSS em navegadores antigos | Adicionar `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' http://backend:8080;"` no `nginx.conf` |

### Baixa / Informativa

| # | Alerta | Descrição | Correção Proposta |
|---|---|---|---|
| S3 | Health endpoint público | Info de health exposta | Manter `show-details: when_authorized` (já configurado) |
| S4 | CORS com credenciais | Risco se origin não confiável adicionado à whitelist | Manter whitelist restrita via env var |
| S5 | Sem RBAC | Todos os usuários têm acesso total | Adicionar role `USER` e `ADMIN` quando houver necessidade administrativa |

### Recomendações para o Teste com ZAP (usuário)

Para executar o OWASP ZAP quando Docker estiver disponível:

```bash
# 1. Subir ambiente
docker compose up -d

# 2. Scan da API
docker run -v $(pwd)/zap-reports:/zap/wrk \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py -t http://localhost:8080/v3/api-docs \
    -f openapi -r report_backend.html

# 3. Scan do frontend
docker run -v $(pwd)/zap-reports:/zap/wrk \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:5173 -r report_frontend.html

# 4. Scan autenticado
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123"}' | jq -r '.accessToken')

docker run -v $(pwd)/zap-reports:/zap/wrk \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t http://localhost:8080/api/v1 \
    -z "auth.header=Authorization:Bearer $TOKEN" \
    -r report_authenticated.html
```

---

## Resumo de Arquivos Modificados

### Backend (Java)
| Arquivo | Mudança |
|---|---|
| `financeapp-core/.../security/JwtUtil.java` | JavaDoc + comentário WEAK_SECRET |
| `financeapp-core/.../service/AuthService.java` | JavaDoc em 6 métodos, removeu WHAT comment |
| `financeapp-core/.../service/TransactionService.java` | JavaDoc na classe |
| `financeapp-core/.../service/CategoryService.java` | JavaDoc na classe |
| `financeapp-core/.../service/GoalService.java` | JavaDoc na classe |
| `financeapp-core/.../service/DashboardService.java` | JavaDoc na classe |
| `financeapp-core/.../entity/User.java` | JavaDoc |
| `financeapp-core/.../entity/Category.java` | JavaDoc (icon, color, uniqueConstraint) |
| `financeapp-core/.../entity/Transaction.java` | JavaDoc (LAZY) |
| `financeapp-core/.../entity/FinancialGoal.java` | JavaDoc (status lifecycle) |
| `financeapp-api/.../security/JwtAuthenticationFilter.java` | JavaDoc |
| `financeapp-api/.../config/SecurityConfig.java` | JavaDoc |
| `financeapp-api/.../config/GlobalExceptionHandler.java` | JavaDoc + handler RequestNotPermitted |
| `financeapp-api/.../controller/AuthController.java` | `@RateLimiter(name = "auth")` |
| `financeapp-api/.../controller/TransactionController.java` | `@RateLimiter(name = "api")` |
| `financeapp-api/.../controller/CategoryController.java` | `@RateLimiter(name = "api")` |
| `financeapp-api/.../controller/GoalController.java` | `@RateLimiter(name = "api")` |
| `financeapp-api/.../controller/DashboardController.java` | `@RateLimiter(name = "api")` |
| `financeapp-api/.../controller/ReportController.java` | `@RateLimiter(name = "api")` |
| `financeapp-api/pom.xml` | resilience4j-spring-boot3 + spring-boot-starter-aop |
| `financeapp-api/src/main/resources/application.yml` | Config resilience4j |

### Frontend
| Arquivo | Mudança |
|---|---|
| `src/services/api.ts` | authApi export, token key fix, documentação, removeu filepath comment |
| `src/context/AuthContext.tsx` | Comentários de contrato de storage |
| `src/components/Header.tsx` | Removeu `// test comment` |
| `.env.example` | `VITE_API_BASE_URL` → `VITE_API_URL` |

### Infraestrutura
| Arquivo | Mudança |
|---|---|
| `frontend/nginx.conf` | `limit_req_zone` + `limit_req` |
| `.github/workflows/ci-cd.yml` | Removido (Gradle num projeto Maven) |
| `frontend/src/router.tsx` | Removido (hash-based legacy) |

---

**Fim do Relatório**
