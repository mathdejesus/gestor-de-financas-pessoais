# Gestor de Finanças Pessoais 💰

**Um gerenciador de finanças pessoais de nível empresarial com foco em segurança, precisão e integridade de dados.**

---

## 📋 Visão Geral

O **Gestor de Finanças Pessoais** é uma aplicação fullstack desenvolvida para oferecer controle granular sobre receitas, despesas e patrimônio pessoal, com a mesma rigorosidade de segurança e precisão exigida por sistemas financeiros corporativos.

### Características Principais
- 💳 Gerenciamento de transações com precisão decimal (sem ponto flutuante)
- 🏷️ Categorização inteligente de despesas e receitas
- 📊 Relatórios e análises financeiras em tempo real
- 🔐 Criptografia de dados sensíveis (PII)
- 🧪 Testes automatizados (Unit + Integration)
- 🚀 CI/CD robusto com GitHub Actions
- 📈 Auditoria completa de operações financeiras

---

## 🛠️ Stack Tecnológico

### Frontend
- **Runtime:** Node.js 24.x
- **Framework:** (React/Vue/Angular - especificar)
- **Build:** Vite/Webpack
- **Styling:** Tailwind CSS / SCSS
- **Testes:** Vitest/Jest

### Backend
- **Runtime:** Java 21+ / Python 3.11+
- **Framework:** Spring Boot / FastAPI
- **Database:** PostgreSQL 15+
- **Cache:** Redis (opcional, para sessões)
- **ORM:** Hibernate/JPA / SQLAlchemy

### DevOps & CI/CD
- **Containerização:** Docker
- **Orquestração:** Docker Compose
- **CI/CD:** GitHub Actions
- **Versionamento:** Semantic Versioning (SemVer)

---

## 📦 Instalação & Setup

### Pré-requisitos
```bash
- Node.js 24.x ou superior
- Java 21+ ou Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (opcional, recomendado)
- Git
```

### Instalação Local

#### 1. Clone o repositório
```bash
git clone https://github.com/mathofjesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais
```

#### 2. Setup com Docker Compose (Recomendado)
```bash
docker-compose up -d
```

Isso inicia:
- Backend na porta `8080` (ou configurada)
- Frontend na porta `3000`
- PostgreSQL na porta `5432`
- Redis na porta `6379` (se aplicável)

#### 3. Setup Manual

**Backend:**
```bash
cd backend/
# Para Java/Spring Boot
./mvnw clean install
./mvnw spring-boot:run

# Ou para Python/FastAPI
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend/
npm install
npm run dev
```

#### 4. Configuração de Variáveis de Ambiente
Crie arquivos `.env` baseado em `.env.example`:

```bash
# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_financas
DB_USER=postgres
DB_PASSWORD=your_secure_password

JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key_32_chars

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🏗️ Arquitetura

### Diagrama de Componentes
```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│         (Componentes, State, Roteamento)            │
└────────────────────┬────────────────────────────────┘
                     │ (REST API / GraphQL)
┌────────────────────▼────────────────────────────────┐
│                 API Gateway / Express                │
│            (Validação, Autenticação, CORS)          │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌─────────┐ ┌─────────┐
│  Controllers │ │ Services│ │Middleware│
│ (Endpoints)  │ │(Lógica) │ │  (Auth)  │
└──────────────┘ └─────────┘ └─────────┘
        │            │
        └────────────┼────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            Repository / Data Access Layer            │
│        (ORM: Hibernate/JPA, SQLAlchemy)             │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              PostgreSQL Database                    │
│        (Transações ACID, Integridade Referencial)   │
└────────────────────────────────────────────────────┘
```

### Padrões de Projeto
- **Clean Architecture:** Separação clara entre camadas (Presentation, Business, Data)
- **Dependency Injection:** IoC container para gerenciamento de dependências
- **Repository Pattern:** Abstração de acesso a dados
- **Service Layer:** Lógica de negócios isolada
- **DTOs:** Transfer Objects para API contracts

---

## 🔐 Requisitos de Segurança (CRÍTICO)

### ✅ Obrigatórios
- [ ] **Autenticação:** JWT com refresh tokens + rate limiting
- [ ] **Validação de Input:** Whitelist validation, proteção contra injeção (SQL, NoSQL, XSS)
- [ ] **Criptografia:** Senhas com bcrypt (min 12 rounds), dados sensíveis com AES-256
- [ ] **CORS:** Configurado strictamente, sem `*`
- [ ] **HTTPS:** Obrigatório em produção
- [ ] **CSRF Protection:** Token CSRF em formulários
- [ ] **Precisão Monetária:** `BigDecimal`/`Decimal`, nunca `float`/`double`
- [ ] **Auditoria:** Log de todas as operações financeiras (quem, quando, o quê)
- [ ] **Testes de Segurança:** SAST/DAST integrados no CI/CD

### Exemplo: Tratamento de Transações Financeiras
```java
// ✅ CORRETO
BigDecimal amount = new BigDecimal("100.50");
transaction.setAmount(amount);

// ❌ ERRADO
double amount = 100.50; // Risco de perda de precisão
transaction.setAmount(amount);
```

---

## 🧪 Testes

### Executar Testes

```bash
# Backend - Unit Tests
./mvnw test

# Backend - Integration Tests
./mvnw verify -Pintegration-tests

# Frontend - Unit Tests
npm run test

# Frontend - E2E Tests (Cypress/Playwright)
npm run test:e2e

# Cobertura de Código
npm run coverage
```

### Padrão de Teste
- **Unit Tests:** Lógica de negócios (Services, Repositories) - Min. 80% cobertura
- **Integration Tests:** Endpoints, banco de dados, transações
- **E2E Tests:** Fluxos críticos (login, transações, relatórios)

---

## 📊 Modelo de Dados (DDL)

Exemplos de tabelas críticas:

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contas
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  balance NUMERIC(19, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount NUMERIC(19, 2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Auditoria
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  operation VARCHAR(20) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

---

## 🚀 Deploy

### Checklist de Deploy

- [ ] Testes passando (Unit + Integration + E2E)
- [ ] Code review aprovado
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados realizado
- [ ] Migração de schema executada em staging
- [ ] Métricas e logs configurados
- [ ] Rollback plan documentado
- [ ] Documentação de mudanças atualizada

### Produção
```bash
# Build da imagem Docker
docker build -t gestor-financas:latest .

# Push para registry
docker push your-registry/gestor-financas:latest

# Deploy (Kubernetes/ECS/Heroku)
# Siga o guia específico de sua plataforma
```

---

## 🤝 Contribuindo

### Padrões de Código Obrigatórios
1. **Lint & Formatting:** ESLint (Frontend), Checkstyle/Prettier (Backend)
2. **Commits:** Semantic Commit Messages (`feat:`, `fix:`, `docs:`, `test:`)
3. **Branches:** `feature/`, `bugfix/`, `hotfix/` com ticket ID
4. **Pull Requests:**
   - Descrição clara do problema e solução
   - Testes inclusos
   - Checklist de verificação
   - Mínimo 1 aprovação de code review

### Workflow Git
```bash
# 1. Crie branch
git checkout -b feature/JIRA-123-descriptive-name

# 2. Commit com mensagem semântica
git commit -m "feat(auth): add JWT refresh token rotation"

# 3. Push e abra PR
git push origin feature/JIRA-123-descriptive-name

# 4. Aguarde CI/CD e code review
# 5. Merge via PR (com squash recomendado)
```

---

## 📝 Documentação Adicional

| Documento | Localização |
|-----------|------------|
| Guia de Contribuição | `CONTRIBUTING.md` |
| Política de Segurança | `SECURITY.md` |
| Changelog | `CHANGELOG.md` |
| API Documentation | `/docs/api-swagger.yaml` |
| Architecture Decision Records | `/docs/adr/` |

---

## 🐛 Reportar Issues

Encontrou um bug ou quer sugerir uma feature?

1. Verifique se já existe uma issue aberta
2. Abra uma issue com template apropriado:
   - **Bug Report:** Passos para reproduzir + logs esperados
   - **Feature Request:** Contexto + caso de uso + critérios de aceita

ção

---

## 📞 Suporte & Contato

- **Issues:** GitHub Issues
- **Discussões:** GitHub Discussions
- **Security:** SECURITY.md (não publique vulnerabilidades em issues)

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 🎯 Roadmap

- [x] Autenticação e autorização
- [ ] Integração com bancos (Open Banking)
- [ ] Relatórios avançados (PDF export)
- [ ] Notificações em tempo real
- [ ] Aplicativo mobile (React Native)
- [ ] Sincronização multi-device
- [ ] Suporte a múltiplas moedas
- [ ] IA para categorização automática

---

**Mantido com ❤️ e rigor profissional por Matheus**

`v1.0.0` | Última atualização: 2026