# 📋 Plano de Ação — Gestor de Finanças Pessoais

> Plano estruturado baseado em `AGENTS.md` e `Financial_Management_Platform_REVISADO.md` para conclusão do projeto por fases.

---

## 🎯 Visão Geral do Plano

| Fase | Versão | Foco Principal | Duração | Status |
|------|--------|----------------|---------|--------|
| **Fase 1** | v1.0.0 (MVP) | Auth + CRUD Transações/Categorias + Testes base | 6-8 sem | 🚧 **EM ANDAMENTO** |
| **Fase 2** | v2.0.0 | Dashboard, Gráficos, KPIs, Export CSV, E2E | 4-6 sem | ⏳ Planejado |
| **Fase 3** | v3.0.0 | Metas Financeiras, Relatórios PDF, Email | 4-6 sem | ⏳ Planejado |
| **Fase 4** | v4.0.0 | React Native Mobile, Push, Offline | 8-10 sem | ⏳ Planejado |

---

## 📦 FASE 1 — MVP (v1.0.0) — 6-8 SEMANAS

**Objetivo**: Sistema funcional básico com autenticação, CRUD completo de transações e categorias, testes e documentação.

### Sprint 1-2: Setup & Fundação (2 semanas)

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F1.1 | Configurar repositório Git (branch protection, PR template) | Time | ⬜ | — |
| F1.2 | Validar docker-compose.yml (3 serviços: frontend, backend, postgres) | Time | ⬜ | — |
| F1.3 | Configurar `.env.example` backend e frontend | Time | ⬜ | F1.2 |
| F1.4 | Validar Flyway migrations (V1-V4) rodam corretamente | Time + Nemotron | ⬜ | F1.2 |
| F1.5 | Configurar GitHub Actions CI (test-frontend, test-backend) | Time | ⬜ | F1.1 |
| F1.6 | Configurar Husky + lint-staged + commitlint | Time | ⬜ | F1.1 |

### Sprint 3-4: Autenticação JWT (2 semanas)

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F1.7 | Implementar `JwtUtil` (geração/validação RS256) | Nemotron | ⬜ | F1.4 |
| F1.8 | Implementar `AuthService` (register, login, refresh, password hash BCrypt 12) | Nemotron | ⬜ | F1.7 |
| F1.9 | Implementar `SecurityConfig` + `JwtAuthenticationFilter` | Nemotron | ⬜ | F1.8 |
| F1.10 | Criar `AuthController` (/login, /register, /refresh) | Nemotron | ⬜ | F1.9 |
| F1.11 | Criar DTOs: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `RefreshTokenRequest` | Nemotron | ⬜ | F1.8 |
| F1.12 | Testes unitários AuthService (JUnit 5 + Mockito) | Nemotron + Time | ⬜ | F1.10 |
| F1.13 | Frontend: Páginas Login/Register + Context API Auth + Axios interceptors | Time + Nemotron | ⬜ | F1.10 |
| F1.14 | Testes integração Auth (TestContainers) | Time | ⬜ | F1.12 |

### Sprint 5-6: CRUD Categorias (2 semanas)

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F1.15 | Implementar `CategoryRepository` + `CategoryService` (CRUD + user scoping) | Nemotron | ⬜ | F1.11 |
| F1.16 | Criar `CategoryController` (/api/v1/categories) | Nemotron | ⬜ | F1.15 |
| F1.17 | DTOs: `CategoryDTO`, `CreateCategoryRequest`, `UpdateCategoryRequest` | Nemotron | ⬜ | F1.15 |
| F1.18 | Validações Jakarta (`@NotBlank`, `@Size`, unique constraint) | Nemotron | ⬜ | F1.17 |
| F1.19 | Testes unitários CategoryService (meta 80%+) | Nemotron + Time | ⬜ | F1.18 |
| F1.20 | Frontend: Página Categorias (listar, criar, editar, deletar) + formulários Zod | Time + Nemotron | ⬜ | F1.16 |

### Sprint 7-8: CRUD Transações (2 semanas)

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F1.21 | Implementar `TransactionRepository` (queries: por user, data range, categoria, tipo) | Nemotron | ⬜ | F1.15 |
| F1.22 | Implementar `TransactionService` (CRUD + validações negócio) | Nemotron | ⬜ | F1.21 |
| F1.23 | Criar `TransactionController` (/api/v1/transactions) | Nemotron | ⬜ | F1.22 |
| F1.24 | DTOs: `TransactionDTO`, `CreateTransactionRequest`, `UpdateTransactionRequest` | Nemotron | ⬜ | F1.22 |
| F1.25 | Enum `TransactionType` (INCOME, EXPENSE) + validações | Nemotron | ⬜ | F1.24 |
| F1.26 | Testes unitários TransactionService (meta 80%+) | Nemotron + Time | ⬜ | F1.25 |
| F1.27 | Frontend: Página Transações (tabela, filtros data/categoria/tipo, paginação, modal form) | Time + Nemotron | ⬜ | F1.23 |

### Sprint 9-10: Qualidade, Docs & Release v1.0.0 (2 semanas)

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F1.28 | OpenAPI/Swagger annotations em todos controllers | Nemotron | ⬜ | F1.27 |
| F1.29 | GlobalExceptionHandler + problem details (RFC 7807) | Nemotron | ⬜ | F1.23 |
| F1.30 | Aumentar cobertura testes backend (meta 80%+) | Time | ⬜ | F1.26 |
| F1.31 | Aumentar cobertura testes frontend (meta 60%+) | Time | ⬜ | F1.27 |
| F1.32 | Testes E2E Cypress (fluxo: login → criar categoria → criar transação) | Time + Nemotron | ⬜ | F1.31 |
| F1.33 | Validar docker-compose produção (multi-stage, healthchecks) | Time | ⬜ | F1.5 |
| F1.34 | Release v1.0.0 (tag, changelog, Docker images) | Time | ⬜ | F1.33 |

---

## 📊 FASE 2 — Dashboard & Análise (v2.0.0) — 4-6 SEMANAS

**Objetivo**: Visualização de dados financeiros com gráficos interativos e KPIs.

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F2.1 | Backend: `DashboardService` (saldo, receitas, despesas, economia, médias) | Nemotron | ⏳ | F1.34 |
| F2.2 | Backend: `DashboardController` (/api/v1/dashboard/summary, /charts) | Nemotron | ⏳ | F2.1 |
| F2.3 | Frontend: Página Dashboard (cards KPIs: saldo, receitas, despesas, % economia) | Time + Nemotron | ⏳ | F2.2 |
| F2.4 | Frontend: Gráficos Recharts (barras mensais, pizza categorias, linha evolução) | Time + Nemotron | ⏳ | F2.3 |
| F2.5 | Frontend: Filtros de período (mês atual, últimos 3m, 6m, 12m, custom) | Time | ⏳ | F2.4 |
| F2.6 | Backend: Endpoint exportação CSV transações filtradas | Nemotron | ⏳ | F2.1 |
| F2.7 | Frontend: Botão exportar CSV | Time | ⏳ | F2.6 |
| F2.8 | Testes E2E Cypress (dashboard, filtros, export) | Time | ⏳ | F2.5 |
| F2.9 | Release v2.0.0 | Time | ⏳ | F2.8 |

---

## 🎯 FASE 3 — Metas & Relatórios (v3.0.0) — 4-6 SEMANAS

**Objetivo**: Metas financeiras com progresso e relatórios avançados em PDF.

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F3.1 | Backend: `GoalService` + `GoalRepository` (CRUD + progress tracking) | Nemotron | ⏳ | F2.9 |
| F3.2 | Backend: `GoalController` (/api/v1/goals, /goals/{id}/progress) | Nemotron | ⏳ | F3.1 |
| F3.3 | DTOs: `GoalDTO`, `CreateGoalRequest`, `UpdateGoalRequest` + Enum `GoalStatus` | Nemotron | ⏳ | F3.1 |
| F3.4 | Frontend: Página Metas (cards progresso, criar/editar/deletar, atualizar valor) | Time + Nemotron | ⏳ | F3.2 |
| F3.5 | Backend: `ReportService` (PDF com iText/Apache FOP) | Nemotron | ⏳ | F2.9 |
| F3.6 | Backend: `ReportController` (/api/v1/reports/monthly, /category, /goals) | Nemotron | ⏳ | F3.5 |
| F3.7 | Agendamento relatórios (Spring @Scheduled + config) | Time + Nemotron | ⏳ | F3.6 |
| F3.8 | Email notifications (SendGrid/SMTP) para relatórios agendados | Time | ⏳ | F3.7 |
| F3.9 | Release v3.0.0 | Time | ⏳ | F3.8 |

---

## 📱 FASE 4 — Mobile React Native (v4.0.0) — 8-10 SEMANAS

**Objetivo**: App nativo iOS/Android com sincronização e modo offline.

| Task ID | Tarefa | Responsável | Status | Dependências |
|---------|--------|-------------|--------|--------------|
| F4.1 | Setup React Native (Expo ou CLI) + TypeScript + Tailwind (NativeWind) | Time | ⏳ | F3.9 |
| F4.2 | Shared types package (DTOs compartilhados backend↔frontend↔mobile) | Nemotron + Time | ⏳ | F4.1 |
| F4.3 | Auth no mobile (AsyncStorage para tokens, biometria opcional) | Time + Nemotron | ⏳ | F4.2 |
| F4.4 | Sincronização offline-first (React Query + persistência local) | Time | ⏳ | F4.3 |
| F4.5 | Telas: Login, Dashboard, Transações, Categorias, Metas | Time + Nemotron | ⏳ | F4.4 |
| F4.6 | Push Notifications (Expo Notifications / FCM + APNs) | Time | ⏳ | F4.5 |
| F4.7 | Build & Deploy: EAS Build / Fastlane → App Store / Play Store | Time | ⏳ | F4.6 |
| F4.8 | Release v4.0.0 | Time | ⏳ | F4.7 |

---

## 🔧 TAREFAS TRANSVERSAIS (Contínuas)

| Task ID | Tarefa | Frequência | Responsável |
|---------|--------|------------|-------------|
| TX.1 | Code review obrigatório (2+ approvals) | Todo PR | Time |
| TX.2 | Atualizar dependências (Dependabot/Renovate) | Semanal | Time |
| TX.3 | Security scanning (OWASP ZAP, Snyk) | A cada release | Time |
| TX.4 | Performance testing (k6/JMeter) | Pré-release | Time |
| TX.5 | Atualizar documentação (README, AGENTS, Swagger) | Contínuo | Nemotron + Time |
| TX.6 | Monitoramento logs/alertas (CloudWatch) | Produção | Time |
| TX.7 | Backup & Disaster Recovery test | Mensal | Time |

---

## ✅ CRITÉRIOS DE ACEITAÇÃO POR FASE

### MVP (v1.0.0) — Definition of Done
- [ ] Usuário consegue se registrar, logar, renovar token
- [ ] CRUD Categorias funcionando (user-scoped)
- [ ] CRUD Transações funcionando (filtros, paginação)
- [ ] Testes backend ≥ 80%, frontend ≥ 60%
- [ ] Swagger UI documentando 100% endpoints
- [ ] `docker compose up -d` sobe tudo localmente
- [ ] CI/CD passando no GitHub Actions
- [ ] Deploy staging funcional

### v2.0.0 — Definition of Done
- [ ] Dashboard com 4+ KPIs e 3+ gráficos interativos
- [ ] Filtros de período funcionando
- [ ] Export CSV funciona
- [ ] Testes E2E cobrindo fluxos críticos (≥ 50%)
- [ ] Responsivo (320px - 1920px)

### v3.0.0 — Definition of Done
- [ ] Metas: criar, editar, deletar, atualizar progresso
- [ ] Visualização progresso (barra, %)
- [ ] Relatório PDF gerado e baixável
- [ ] Agendamento diário/semanal/mensal
- [ ] Email de notificação enviado

### v4.0.0 — Definition of Done
- [ ] App iOS e Android nas stores
- [ ] Sync offline→online sem perda de dados
- [ ] Push notifications funcionando
- [ ] Biometria opcional para login

---

## 📅 CRONOGRAMA RESUMIDO

```
2026
├── Jun-Jul    ████████  FASE 1: MVP (8 sem)
├── Ago-Set    ██████    FASE 2: Dashboard (6 sem)
├── Out-Nov    ██████    FASE 3: Metas/Relatórios (6 sem)
└── Dez-2027Fev ██████████ FASE 4: Mobile (10 sem)
```

---

## 🛠️ COMANDOS ÚTEIS PARA EXECUÇÃO

```bash
# Verificar status geral
git status
docker compose ps

# Rodar todos os testes
cd backend && mvn clean verify
cd frontend && npm run test:coverage

# Ver cobertura
# Backend: open backend/financeapp-api/target/site/jacoco/index.html
# Frontend: open frontend/coverage/index.html

# Build produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Logs produção
docker compose logs -f --tail=100

# Rollback rápido
docker compose down && docker compose up -d --force-recreate
```

---

## 📝 NOTAS PARA O TIME

1. **Nemotron 3 Ultra** gera código base (controllers, services, testes, docs) — **sempre revisar antes de merge**
2. **Decisões arquiteturais** (ex: Context API vs Redux, padrão de validação) são do **Time**
3. **Setup de nuvem** (AWS, secrets, IAM) é responsabilidade exclusiva do **Time**
4. **Testes de integração/E2E/manual** são do **Time** — Nemotron ajuda com unitários
5. **Deploy inicial em produção** deve ser feito pelo **Time** com rollback plan

---

## 🔗 LINKS ÚTEIS

- **Especificação Completa**: [`Financial_Management_Platform_REVISADO.md`](./Financial_Management_Platform_REVISADO.md)
- **Guia Agentes/IA**: [`AGENTS.md`](./AGENTS.md)
- **Swagger UI (local)**: `http://localhost:8080/swagger-ui.html`
- **GitHub Actions**: `.github/workflows/ci.yml`
- **Docker Compose**: `docker-compose.yml`

---

**Última atualização**: Junho 2026  
**Versão do plano**: 1.0  
**Próxima revisão**: Início de cada sprint
