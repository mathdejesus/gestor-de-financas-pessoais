# 🏦 Gestor de Finanças Pessoais

> Plataforma full-stack open-source para gestão financeira pessoal — backend em **Java 21 + Spring Boot 3.2**, frontend em **Preact 10 + TypeScript + Vite + Tailwind CSS v4**, banco **PostgreSQL 15**.

---

## 📋 Visão Geral

Sistema completo para controle de finanças pessoais com foco em **educação financeira** e **demonstração de arquitetura moderna**:

- 💰 **Transações** (receitas/despesas) com categorização personalizada
- 🎯 **Metas financeiras** com acompanhamento de progresso
- 📊 **Dashboard** com KPIs, gráficos e relatórios mensais
- 👤 **Autenticação JWT** segura (HS256, BCrypt 12 rounds)
- 🐳 **Docker Compose** para desenvolvimento local
- 📚 **Documentação OpenAPI/Swagger** automática

---

## 🏗️ Arquitetura

```
gestor-de-financas-pessoais/
├── backend/                     # Spring Boot 3.2 (Java 21, Maven)
│   ├── financeapp-api/          # Controllers, config, security
│   ├── financeapp-core/         # Entities, services, repositories, DTOs
│   ├── financeapp-infra/        # Infraestrutura
│   ├── pom.xml                  # Parent POM
│   ├── Dockerfile               # Multi-stage build
│   └── .env.example
├── frontend/                    # Preact 10 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas/Roteamento
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API calls (ky)
│   │   ├── types/               # Interfaces TypeScript
│   │   ├── context/             # Context API + useReducer
│   │   └── utils/               # Funções utilitárias
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── mobile/                      # React Native (planejado - V4)
├── docker-compose.yml           # Orquestração local (3 serviços)
├── .github/workflows/           # CI/CD GitHub Actions
├── AGENTS.md                    # Guia para agentes IA/automação
├── Financial_Management_Platform_REVISADO.md  # Especificação completa
├── LICENSE                      # MIT
└── README.md                    # Este arquivo
```

### Tech Stack

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Backend** | Java, Spring Boot, Maven | 21 LTS, 3.2.x, 3.9+ |
| **Database** | PostgreSQL, Flyway, HikariCP | 15+, 9.0+, nativo |
| **Auth** | JWT HS256, BCrypt, Spring Security | 6.x, 12 rounds |
| **API Docs** | SpringDoc OpenAPI / Swagger UI | 2.0+ |
| **Frontend** | Preact, TypeScript, Vite, Tailwind CSS | 10, 5.0, 8.0, 4.0 |
| **State** | Context API + useReducer | Nativo Preact |
| **Charts** | Recharts / Chart.js | Última |
| **Validation** | Zod | 3.0 |
| **HTTP Client** | ky | 2.0 |
| **Testes Unitários** | Vitest + @testing-library/preact | 2.1+ |
| **Testes E2E** | Playwright | 1.50+ |
| **Mobile** | React Native | Planejado (V4) |
| **DevOps** | Docker, Docker Compose, GitHub Actions | — |
| **Cloud** | AWS (EC2, RDS, S3, ACM) | Produção |

---

## 🚀 Início Rápido

### Pré-requisitos
- **Docker & Docker Compose** (recomendado)
- **Java 21** (para backend standalone)
- **Node.js 20+** (para frontend standalone)
- **PostgreSQL 15+** (se não usar Docker)

### 🐳 Com Docker (Recomendado)

```bash
# Subir todos os serviços
docker compose up -d

# Serviços disponíveis:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# PostgreSQL: localhost:5432

# Ver logs em tempo real
docker compose logs -f

# Parar e remover containers
docker compose down

# Parar mantendo volumes (dados)
docker compose stop
```

### 🛠️ Desenvolvimento Local (Sem Docker)

#### Backend
```bash
cd backend

# Compilar
mvn clean compile

# Rodar testes unitários
mvn test

# Testes + Cobertura JaCoCo
mvn clean verify -Ptest

# Rodar aplicação (porta 8080)
mvn spring-boot:run

# Gerar relatório de cobertura
# Abrir: backend/financeapp-api/target/site/jacoco/index.html
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Dev server com hot-reload (porta 5173)
npm run dev

# Build de produção
npm run build

# Verificar formatação
npm run format:check

# Testes unitários
npm run test

# Cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e
```

---

## 🔐 Autenticação & API

### Configuração de Ambiente

**Backend** (`backend/.env` ou `application-dev.yml`):
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/financial_platform
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=base64-encoded-secret-key
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:8080/api/v1
```

### Endpoints Principais

```
Base URL: http://localhost:8080/api/v1

POST   /auth/login           # Login → { accessToken, refreshToken }
POST   /auth/register        # Registro de usuário
POST   /auth/refresh         # Renovar access token

GET    /categories           # Listar categorias do usuário
POST   /categories           # Criar categoria
PUT    /categories/{id}      # Atualizar categoria
DELETE /categories/{id}      # Deletar categoria

GET    /transactions         # Listar transações (filtros: data, categoria, tipo)
POST   /transactions         # Criar transação
PUT    /transactions/{id}    # Atualizar transação
DELETE /transactions/{id}    # Deletar transação

GET    /goals                # Listar metas financeiras
POST   /goals                # Criar meta
PUT    /goals/{id}           # Atualizar meta
DELETE /goals/{id}           # Deletar meta
PUT    /goals/{id}/progress  # Atualizar progresso da meta

GET    /dashboard/summary    # Resumo: saldo, receitas, despesas, economia
GET    /dashboard/charts     # Dados para gráficos
GET    /reports/monthly      # Relatório mensal
GET    /reports/category     # Relatório por categoria
```

### Autenticação
- **Access Token**: JWT HS256, expiração **24h**
- **Refresh Token**: expiração **7 dias**, rotação automática
- Header: `Authorization: Bearer <access_token>`
- Payload: `sub` (userId), `email`, `roles`, `type`, `iat`, `exp`

---

## 🗄️ Modelo de Dados

### Entidades Principais

| Entidade | Descrição |
|----------|-----------|
| **User** | Usuário do sistema (nome, email, senha hash) |
| **Category** | Categorias de transação (nome, ícone, cor, tipo) |
| **Transaction** | Movimentações (valor, data, descrição, categoria, tipo) |
| **FinancialGoal** | Metas (descrição, valor alvo, valor atual, prazo, status) |

### Migrações Flyway (em `backend/financeapp-api/src/main/resources/db/migration/`)
```sql
V1__create_users_table.sql
V2__create_categories_table.sql
V3__create_transactions_table.sql
V4__create_financial_goals_table.sql
```

---

## 🧪 Testes & Qualidade

| Camada | Ferramenta | Meta Cobertura | Comando |
|--------|------------|----------------|---------|
| Backend Unit | JUnit 5 + Mockito | **80%+** | `mvn test` / `mvn clean verify -Ptest` |
| Frontend Unit | Vitest + @testing-library/preact | **60%+** | `npm run test:coverage` |
| E2E | Playwright | **50%+** (fluxos críticos) | `npm run test:e2e` |
| Integração | TestContainers + PostgreSQL | — | `mvn verify -Ptest` |

### Relatórios
- **Backend JaCoCo**: `backend/financeapp-api/target/site/jacoco/index.html`
- **Backend JaCoCo (core)**: `backend/financeapp-core/target/site/jacoco/index.html`
- **Frontend**: `frontend/coverage/index.html`

---

## 📦 CI/CD

### Pipeline GitHub Actions (`.github/workflows/ci.yml`)

```yaml
# Triggers: push to main/develop, pull_request
jobs:
  test-frontend:    # Node 22 → npm ci → format:check → test:coverage → build
  test-backend:     # Java 21 → mvn clean verify -Ptest (PostgreSQL via TestContainers)
  build-docker:     # On main branch → build Docker images
  verify:           # Final verification
```

### Branches & Versionamento
- **main** → Produção (tags `vX.Y.Z`)
- **develop** → Desenvolvimento contínuo
- **feature/*** → Features isoladas
- **SemVer**: MAJOR.MINOR.PATCH (ex: `v1.0.0`, `v2.1.0`)

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **AGENTS.md** | Guia para agentes IA, comandos, convenções |
| **Financial_Management_Platform_REVISADO.md** | Especificação técnica completa (810+ linhas) |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` (backend rodando) |
| **LICENSE** | Licença MIT |

---

## 🤝 Contribuindo

1. **Fork** o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um **Pull Request** para `develop`

### Convenções de Commit (Conventional Commits)
| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `refactor:` | Refatoração |
| `test:` | Testes |
| `chore:` | Manutenção/Configuração |
| `style:` | Formatação (sem mudança lógica) |

---

## 🗓️ Roadmap

| Versão | Foco | Prazo Estimado | Status |
|--------|------|----------------|--------|
| **v1.0.0 (MVP)** | Auth, CRUD Transações, Categorias, Testes base | 6-8 sem | 🚧 Em desenvolvimento |
| **v2.0.0** | Dashboard, Gráficos (Recharts), KPIs, Export CSV, Playwright E2E | 4-6 sem | ⏳ Planejado |
| **v3.0.0** | Metas Financeiras, Relatórios PDF, Agendamento, Email (SendGrid) | 4-6 sem | ⏳ Planejado |
| **v4.0.0** | React Native (iOS/Android), Push Notifications, Offline Mode | 8-10 sem | ⏳ Planejado |

---

## 🔒 Segurança

- ✅ **JWT HS256** (HMAC-SHA256) para tokens
- ✅ **BCrypt 12 rounds** para hash de senha
- ✅ **Prepared Statements + ORM** (prevenção SQL Injection)
- ✅ **Content-Security-Policy** headers
- ✅ **CORS** whitelist configurável
- ✅ **Jakarta Validation** em todos endpoints
- 🔄 **Rate Limiting** (Resilience4j - a implementar)
- 🔄 **Penetration Testing** (OWASP ZAP - a agendar)

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

## 📞 Suporte & Comunidade

- 🐛 **Bugs**: [Abra uma issue](../../issues)
- 💡 **Feature Requests**: [Abra uma issue](../../issues)
- 📖 **Documentação**: Consulte `AGENTS.md` e `Financial_Management_Platform_REVISADO.md`
- 💬 **Dúvidas**: Inicie uma [Discussion](../../discussions)

---

## 👥 Créditos

Desenvolvido com ❤️ por:
- **Time de Desenvolvimento** — Arquitetura, decisões, review, deploy
- **Nemotron 3 Ultra (NVIDIA)** — Geração de código, documentação, testes, automação

> **Fluxo de trabalho**: Time define arquitetura → Nemotron gera código base → Time revisa, testa, integra → Deploy

---

**⭐ Se este projeto te ajudou, deixe uma estrela no repositório!**
