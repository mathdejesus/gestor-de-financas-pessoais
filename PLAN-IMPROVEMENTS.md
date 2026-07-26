# Plano de Ações — Melhorias do Projeto Gestor de Finanças Pessoais

> Priorizado por impacto x esforço. Execução sequencial, um passo de cada vez.
> Atualizado: 2026-07-26

---

## Fase 1 — Correções Rápidas (quick wins, dia 1)

| # | Ação | Arquivo(s) | Esforço | Status |
|---|------|-----------|---------|--------|
| 1.1 | Corrigir stack do frontend no README (ky ≠ axios) | `README.md` | 5 min | ✅ Feito |
| 1.2 | Atualizar licença de MIT → Apache 2.0 no README + arquivo LICENSE | `README.md`, `LICENSE` | 10 min | ✅ Feito |
| 1.3 | Corrigir formatação do padrão "API Client" no README (lista com `-` e não `|`) | `README.md` | 2 min | ✅ Feito |
| 1.4 | Fixar react-refresh warnings frontend (mover constants de AuthContext para arquivo separado) | `frontend/src/context/AuthContext.tsx` | 20 min | ⬜ Pendente |
| 1.5 | Resolver módulo `financeapp-infra` vazio — ou remover do multi-module ou implementar primeiro adapter | `backend/pom.xml`, `backend/financeapp-infra/` | 15 min | ⬜ Pendente |

---

## Fase 2 — Segurança & DevOps (dia 2)

| # | Ação | Arquivo(s) | Esforço | Status |
|---|------|-----------|---------|--------|
| 2.1 | Versionar `nginx.conf` no repo (hoje é copiado do Dockerfile mas não rastreado em git) | `nginx.conf`, `frontend/Dockerfile`, `backend/Dockerfile` | 15 min | ⬜ Pendente |
| 2.2 | Adicionar security headers ao Nginx (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | `nginx.conf` | 20 min | ⬜ Pendente |
| 2.3 | Expor endpoint `/actuator/prometheus` para métricas Prometheus | `backend/.../application.yml` + `pom.xml` (micrometer-prometheus) | 30 min | ⬜ Pendente |
| 2.4 | Adicionar Grafana + Prometheus ao `docker-compose.yml` para observabilidade local | `docker-compose.yml` | 20 min | ⬜ Pendente |
| 2.5 | Rate limiting por IP no Nginx (30 req/s burst=20 para produção) | `nginx.conf` | 10 min | ⬜ Pendente |

---

## Fase 3 — Qualidade & Testes (dia 3)

| # | Ação | Arquivo(s) | Esforço | Status |
|---|------|-----------|---------|--------|
| 3.1 | Adicionar TestContainers PostgreSQL para testes de integração reais (não só H2 em memória) | `backend/.../pom.xml`, testes | 2-3h | ⬜ Pendente |
| 3.2 | Adicionar PITest (mutation testing) ao backend para medir qualidade real dos testes | `backend/.../pom.xml` | 1h | ⬜ Pendente |
| 3.3 | Verificar se Playwright E2E está rodando no CI e corrigir se necessário | `.github/workflows/ci.yml` | 30 min | ⬜ Pendente |
| 3.4 | Adicionar cobertura mínima threshold (ex: 80%) ao Jacoco para falhar o build se cair | `backend/.../pom.xml` | 15 min | ⬜ Pendente |

---

## Fase 4 — Features (dias 4+)

| # | Ação | Arquivo(s) | Esforço | Status |
|---|------|-----------|---------|--------|
| 4.1 | Exportar relatórios em Excel (Apache POI) além de PDF | `backend/.../ReportService.java` | 2-3h | ⬜ Pendente |
| 4.2 | Gráficos interativos no frontend (Recharts) no Dashboard | `frontend/.../DashboardPage.tsx` | 3-4h | ⬜ Pendente |
| 4.3 | Implementar Audit Log com `@CreatedBy`, `@LastModifiedBy` (Spring Data JPA + AuditorAware) | `backend/.../entities/`, config | 4h | ⬜ Pendente |
| 4.4 | Cache distribuído com Redis (Spring Boot + Lettuce) | `backend/financeapp-infra/`, `docker-compose.yml` | 4h | ⬜ Pendente |
| 4.5 | Notificações por email (Spring Mail) para alertas de transações | `backend/.../`, `application.yml` | 3h | ⬜ Pendente |
| 4.6 | 2FA (TOTP) para login | AuthController, frontend, mobile | 1 dia | ⬜ Pendente |
| 4.7 | Multi-tenant support | Modelos, controllers, filtros | 2 dias | ⬜ Pendente |

---

## Convenções de Commits (siga o padrão do projeto)

```
tipo(escopo): descrição curta sem ponto final

Tipos permitidos: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert
Header max 100 chars. Subject não vazio, sem ponto final.

Exemplos:
  feat(readme): fix API client reference and license
  fix(frontend): resolve react-refresh warnings in context files
  chore(infra): remove empty financeapp-infra module
  test(backend): add TestContainers for PostgreSQL integration tests
  feat(observability): add Prometheus metrics endpoint
```

---

## Como Executar Cada Passo

Para cada item deste plano:
1. Crie branch: `git checkout -b <tipo>/<numero>-<descricao-curta>`
2. Implemente a mudança
3. Rode testes: `npm run test` (frontend) ou `mvn test` (backend)
4. Rode lint: `npm run lint` (frontend) ou `mvn compile` (backend)
5. Commit seguindo o padrão conventional commits
6. Push + PR

Próximo passo: **escolha o item 1.4** (fixar react-refresh warnings) para começar a Fase 1.
