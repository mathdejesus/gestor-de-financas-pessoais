# Financial Management Platform

## 1. Visão Geral do Projeto

**Objetivo Geral:**
Desenvolver uma aplicação web Full Stack de código aberto para gerenciamento de finanças pessoais, com foco em educação financeira e demonstração de arquitetura moderna.

**Tipo de Projeto:** Educacional | Full Stack | SaaS

**Público-Alvo:**
- Estudantes de programação
- Profissionais iniciando educação financeira
- Usuários que desejam controlar despesas pessoais

---

## 2. Stack Tecnológico

### 2.1 Frontend

| Aspecto | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Linguagem** | TypeScript | ^5.0 | Type-safety, melhor experiência dev |
| **Framework** | React | ^18.0 | Componentes reutilizáveis, comunidade grande |
| **Estilização** | Tailwind CSS | ^3.0 | Utility-first, prototipagem rápida |
| **HTTP Client** | Axios | ^1.6 | Requisições HTTP, interceptadores |
| **Roteamento** | React Router | ^6.0 | SPA com múltiplas páginas |
| **Estado Global** | Context API + useReducer | Nativa | Gerenciamento simples sem libs externas |
| **Gráficos** | Chart.js / Recharts | Última | Visualização de dados financeiros |
| **Validação** | Zod | ^3.0 | Type-safe validation |
| **Empacotamento** | Vite | ^5.0 | Build rápido, dev server otimizado |

**Ferramentas de Desenvolvimento:**
- **Linting:** ESLint ^8.0
- **Formatação:** Prettier ^3.0
- **Testes Unitários:** Vitest + React Testing Library
- **E2E:** Cypress

---

### 2.2 Backend

| Aspecto | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| **Linguagem** | Java | 21 LTS | Estabilidade, performance, mercado |
| **Framework** | Spring Boot | 3.2.x | Produção, segurança, escalabilidade |
| **Web MVC** | Spring Web | 3.2.x | REST APIs, controllers |
| **Segurança** | Spring Security | 6.x + JWT | Autenticação e autorização |
| **ORM** | Spring Data JPA + Hibernate | 6.x | Mapeamento objeto-relacional |
| **Validação** | Jakarta Validation (Bean Validation) | 3.0 | Validação de dados |
| **Documentação** | SpringDoc OpenAPI / Swagger | ^2.0 | Auto-documentação de APIs |
| **Logging** | Logback + SLF4J | Nativa | Rastreamento de execução |
| **Build** | Maven | 3.9+ | Gerenciamento de dependências |

**Ferramentas de Desenvolvimento:**
- **Testes Unitários:** JUnit 5 + Mockito
- **Testes de Integração:** TestContainers + PostgreSQL
- **Code Coverage:** JaCoCo
- **IDE:** IntelliJ IDEA / VS Code + Extension Pack for Java

---

### 2.3 Banco de Dados

| Aspecto | Tecnologia | Versão |
|--------|-----------|--------|
| **SGBD** | PostgreSQL | 15+ |
| **Ferramentas** | pgAdmin 4 / DBeaver | Última |
| **Migrations** | Flyway | ^9.0 |

**Configuração:**
- JDBC Driver: `org.postgresql.postgresql` 42.7.x
- Connection Pooling: HikariCP (padrão Spring Boot)

---

### 2.4 APIs & Documentação

| Aspecto | Tecnologia | Detalhes |
|--------|-----------|----------|
| **Padrão de API** | REST API | Versionamento v1/v2 |
| **Documentação** | OpenAPI 3.0 | Swagger UI integrado |
| **Serialização** | JSON | Jackson (padrão Spring Boot) |
| **CORS** | Configurável | Whitelist de domínios |

---

### 2.5 DevOps & Infraestrutura

| Aspecto | Tecnologia | Uso |
|--------|-----------|-----|
| **Containerização** | Docker | Isolamento de serviços |
| **Orquestração Local** | Docker Compose | Desenvolvimento local |
| **CI/CD** | GitHub Actions | Automação de testes e deploy |
| **Cloud** | AWS | Hospedagem produção |
| **Compute** | AWS EC2 | Servidores de aplicação |
| **Database** | AWS RDS (PostgreSQL) | Banco de dados gerenciado |
| **Storage** | AWS S3 | Armazenamento de relatórios/exports |
| **SSL/TLS** | AWS Certificate Manager | HTTPS |

---

## 3. Requisitos Funcionais (RFs)

| ID | Requisito | Escopo | Prioridade |
|----|-----------|--------|-----------|
| **RF001** | Cadastro de usuário (sign-up) | MVP | ALTA |
| **RF002** | Autenticação (login/logout) | MVP | ALTA |
| **RF003** | Registrar receita | MVP | ALTA |
| **RF004** | Registrar despesa | MVP | ALTA |
| **RF005** | Editar movimentação financeira | MVP | MÉDIA |
| **RF006** | Excluir movimentação financeira | MVP | MÉDIA |
| **RF007** | Cadastrar/listar categorias | MVP | ALTA |
| **RF008** | Visualizar dashboard (gráficos, KPIs) | V2 | ALTA |
| **RF009** | Criar e acompanhar metas financeiras | V3 | MÉDIA |
| **RF010** | Gerar relatórios em PDF/Excel | V3 | MÉDIA |

---

## 4. Requisitos Não Funcionais (RNFs)

| ID | Requisito | Especificação | Métrica |
|----|-----------|---------------|---------|
| **RNF001** | Performance | Tempo de resposta < 2 segundos | P95 latency |
| **RNF002** | Autenticação | JWT (RS256 com RSA-2048) | Token expiry: 24h |
| **RNF003** | Comunicação | HTTPS/TLS 1.3 | 100% das requisições |
| **RNF004** | Responsividade | Mobile-first (breakpoints Tailwind) | Testes em 320px-1920px |
| **RNF005** | Documentação | OpenAPI 3.0 + Swagger UI | 100% endpoints documentados |
| **RNF006** | Disponibilidade | 99.5% uptime | SLA monitorado |
| **RNF007** | Segurança | OWASP Top 10 compliance | Testes de segurança |
| **RNF008** | Escalabilidade | Suporte para 10k+ usuários | Load testing |

---

## 5. Arquitetura

### 5.1 Diagrama em Camadas

```
┌─────────────────────────────────────────┐
│          FRONTEND (TypeScript)          │
│      React + Tailwind + Vite           │
│  (Browser - localhost:5173)            │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│   API REST (JSON)                       │
│   Base URL: /api/v1                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      BACKEND (Java 21 + Spring Boot)    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Controller Layer           │   │
│  │  (REST endpoints, validação)    │   │
│  └──────────────┬──────────────────┘   │
│                 │                      │
│  ┌──────────────▼──────────────────┐   │
│  │      Service Layer              │   │
│  │  (Lógica de negócio)            │   │
│  └──────────────┬──────────────────┘   │
│                 │                      │
│  ┌──────────────▼──────────────────┐   │
│  │      Repository Layer           │   │
│  │  (Acesso a dados com JPA)       │   │
│  └──────────────┬──────────────────┘   │
│                 │                      │
│  ┌──────────────▼──────────────────┐   │
│  │      Security Layer             │   │
│  │  (JWT, BCrypt, CORS)            │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   PostgreSQL 15+ (JDBC/HikariCP)       │
│   Database: financial_platform         │
└─────────────────────────────────────────┘
```

### 5.2 Padrões de Arquitetura

- **MVC** (Model-View-Controller)
- **DTO** (Data Transfer Objects) - para transferência entre camadas
- **Repository Pattern** - abstração de dados
- **Dependency Injection** - Spring IoC Container

---

## 6. Modelo de Dados

```sql
-- Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Transações
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('INCOME', 'EXPENSE'),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, transaction_date)
);

-- Metas Financeiras
CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) DEFAULT 0,
    deadline DATE,
    status ENUM('ACTIVE', 'COMPLETED', 'ABANDONED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 7. Segurança

### 7.1 Autenticação & Autorização

- **Autenticação:** JWT (JSON Web Token) com RS256
- **Hashing de Senha:** BCrypt (12 rounds)
- **Token Expiry:** 24 horas (acessível apenas ao usuário)
- **Refresh Token:** 7 dias (para renovação)

### 7.2 Proteções Implementadas

| Proteção | Implementação |
|----------|---------------|
| **HTTPS/TLS** | Obrigatório em produção |
| **CORS** | Whitelist de domínios |
| **CSRF** | Tokens sincronizados (Spring Security) |
| **SQL Injection** | Prepared Statements + ORM (Hibernate) |
| **XSS** | Sanitização em Frontend + Content-Security-Policy |
| **Validação de Input** | Jakarta Validation + Bean Validation |
| **Rate Limiting** | A implementar (Spring Cloud Resilience4j) |

---

## 8. Containerização (Docker)

### 8.1 Estrutura de Containers

```yaml
version: '3.9'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://backend:8080
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/financial_platform
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=financial_platform
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 8.2 Dockerfiles

**Frontend:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
```

**Backend:**
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:resolve
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 9. CI/CD com GitHub Actions

### 9.1 Workflows

**Trigger:** Push em `main` e Pull Requests

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci && npm run lint && npm run test:coverage

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      - run: mvn clean verify

  build-deploy:
    needs: [test-frontend, test-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          # Scripts de deploy
```

---

## 10. Roadmap

### 10.1 MVP (Fase 1) - 6-8 semanas

**Objetivo:** Sistema funcional básico de CRUD

- [ ] Configuração inicial (Frontend, Backend, DB, Docker)
- [ ] Autenticação e autorização (JWT)
- [ ] CRUD de movimentações (receita/despesa)
- [ ] Gerenciamento de categorias
- [ ] Testes unitários (Backend 80%+, Frontend 60%+)
- [ ] Documentação básica Swagger

**Entregáveis:** Release v1.0.0, Docker Compose local

---

### 10.2 V2 (Fase 2) - 4-6 semanas

**Objetivo:** Visualização e análise de dados

- [ ] Dashboard com gráficos (Recharts)
- [ ] KPIs (saldo, economia, gastos médios)
- [ ] Filtros de período (mês, trimestre, ano)
- [ ] Exportação de dados (CSV)
- [ ] Testes de integração (E2E com Cypress)

**Entregáveis:** Release v2.0.0, Dashboard funcional

---

### 10.3 V3 (Fase 3) - 4-6 semanas

**Objetivo:** Metas e relatórios avançados

- [ ] Criar/editar/deletar metas financeiras
- [ ] Acompanhamento de progresso de metas
- [ ] Relatórios em PDF (iText/Apache FOP)
- [ ] Agendamento de relatórios
- [ ] Notificações (Email com SendGrid)

**Entregáveis:** Release v3.0.0, Relatórios funcionais

---

### 10.4 V4 (Fase 4) - 8-10 semanas

**Objetivo:** Aplicativo mobile (React Native)

- [ ] App iOS e Android
- [ ] Sincronização com backend
- [ ] Push notifications
- [ ] Modo offline

**Entregáveis:** Release v4.0.0, Apps nas lojas

---

## 11. Convenções de Código

### 11.1 Frontend (TypeScript/React)

```typescript
// Estrutura de pastas
src/
├── components/      (Componentes reutilizáveis)
├── pages/          (Páginas/Rotas)
├── hooks/          (Custom hooks)
├── services/       (Chamadas de API)
├── types/          (TypeScript interfaces)
├── utils/          (Funções utilitárias)
├── context/        (Context API)
└── styles/         (CSS/Tailwind)

// Exemplo de componente
interface TransactionFormProps {
  onSubmit: (data: TransactionDTO) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit }) => {
  // Implementação
};
```

### 11.2 Backend (Java/Spring Boot)

```
src/
├── main/
│   ├── java/com/financeapp/
│   │   ├── controller/      (REST endpoints)
│   │   ├── service/         (Lógica de negócio)
│   │   ├── repository/      (Acesso a dados)
│   │   ├── entity/          (Modelos JPA)
│   │   ├── dto/             (Data Transfer Objects)
│   │   ├── config/          (Configurações Spring)
│   │   ├── security/        (JWT, autenticação)
│   │   └── exception/       (Exceções customizadas)
│   └── resources/
│       ├── application.yml
│       └── db/migration/    (Flyway migrations)
└── test/

// Exemplo de Controller
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService service;
    
    @PostMapping
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody CreateTransactionRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }
}
```

---

## 12. Versionamento

- **Git Flow:** `main` (produção), `develop` (desenvolvimento), `feature/*`
- **Versão:** Semantic Versioning (MAJOR.MINOR.PATCH)
- **Tags:** `v1.0.0`, `v2.1.0`, etc.

---

## 13. Testes

### 13.1 Cobertura de Testes

| Camada | Ferramenta | Meta |
|--------|-----------|------|
| **Frontend** | Vitest + React Testing Library | 60%+ |
| **Backend** | JUnit 5 + Mockito | 80%+ |
| **E2E** | Cypress | 50%+ (user flows críticos) |

### 13.2 Comando de Testes

```bash
# Frontend
npm run test
npm run test:coverage

# Backend
mvn test
mvn clean verify jacoco:report
```

---

## 14. Monitoramento & Logs

- **Logging:** Logback (SLF4J)
- **Monitoramento:** AWS CloudWatch + Spring Boot Actuator
- **Alertas:** CloudWatch Alarms

---

## 15. Responsabilidades: Nemotron 3 Ultra vs Time de Desenvolvimento

### 15.1 O que Nemotron 3 Ultra (NVIDIA) Pode Fazer

#### 🤖 Geração de Código
- ✓ Scaffolding de estrutura (Controllers, Services, Repositories)
- ✓ Implementação de endpoints CRUD padrão
- ✓ Componentes React boilerplate
- ✓ Migrações SQL (Flyway)
- ✓ Configurações Spring Boot (application.yml)
- ✓ Testes unitários (JUnit + Mockito)
- ✓ Dockerfile e docker-compose

**Exemplo de prompt:**
```
Gere um Spring Boot Controller REST para CRUD de Transactions
com validação usando Jakarta Validation e retorno DTO.
Inclua anotações de Swagger/OpenAPI.
```

#### 📋 Análise e Documentação
- ✓ Escrever documentação técnica (como este arquivo)
- ✓ Gerar README.md e guias de contribuição
- ✓ Swagger/OpenAPI descriptions
- ✓ Comentários de código e docstrings
- ✓ Análise de requisitos em linguagem natural

#### 🧪 Testes Automáticos
- ✓ Casos de teste unitários
- ✓ Mocks e fixtures
- ✓ Cenários de erro/exceção
- ✓ Testes de validação de input

#### 🔍 Code Review Assistido
- ✓ Sugestões de refatoração
- ✓ Detecção de problemas óbvios
- ✓ Conformidade com padrões (SOLID, DRY)
- ✓ Segurança: SQL injection, XSS, etc.

#### 🛠️ Troubleshooting
- ✓ Debugar erros de compilação
- ✓ Explicar stack traces
- ✓ Sugerir correções para bugs comuns
- ✓ Otimizações de performance

#### 📝 Scripts & Automação
- ✓ Scripts SQL para seeding de dados
- ✓ GitHub Actions workflows
- ✓ Shell scripts para deployment
- ✓ Makefile

---

### 15.2 O que o Time de Desenvolvimento Deve Fazer

#### 🏗️ Arquitetura & Design
- ✓ **Decisões arquiteturais:** Escolher entre opções (ex: Context API vs Redux)
- ✓ **Design patterns:** Decidir quando usar Factory, Observer, etc.
- ✓ **Estrutura de BD:** Definir schema final, índices, constraints
- ✓ **Fluxos críticos:** Desenhar fluxo de autenticação, transações
- ✓ **Validação com stakeholders:** Confirmar requisitos com PO

#### 💾 Setup & Configuração
- ✓ **Repositório Git:** Criar repo, configurar branch protection
- ✓ **Ambientes:** Configurar dev, staging, produção
- ✓ **Variáveis de ambiente:** Definir secrets no GitHub Actions
- ✓ **AWS setup:** Criar EC2, RDS, S3, IAM roles
- ✓ **CI/CD:** Configurar GitHub Actions, webhooks

#### 👨‍💻 Implementação & Integração
- ✓ **Review gerado:** Validar código gerado pelo Nemotron (não é 100% correto)
- ✓ **Ajustes:** Adaptar código gerado para seu contexto específico
- ✓ **Integração:** Conectar componentes gerados
- ✓ **Testes locais:** Rodar e validar na máquina local
- ✓ **Refatoração:** Melhorar código além do gerado

#### 🧪 Testes de Qualidade
- ✓ **Testes de integração:** Validar fluxos end-to-end
- ✓ **Testes de segurança:** Penetration testing, OWASP
- ✓ **Performance testing:** Load testing, stress testing
- ✓ **Testes manuais:** Casos que IA não consegue cobrir completamente
- ✓ **Validação em staging:** Antes de produção

#### 🚀 Deployment & Produção
- ✓ **Deploy inicial:** Primeira vez em produção
- ✓ **Monitoramento:** Configurar alertas, dashboards
- ✓ **Rollback:** Em caso de problema
- ✓ **Hotfixes:** Correções urgentes em produção
- ✓ **Escalabilidade:** Ajustes de performance real

#### 🤝 Processos & Comunicação
- ✓ **Reuniões com PO:** Validar requisitos, priorização
- ✓ **Code review:** Aprovação final de PRs
- ✓ **Documentação final:** Ajustes específicos do projeto
- ✓ **Mentoring:** Revisar aprendizado com juniors
- ✓ **Decisões de negócio:** Trade-offs arquiteturais

---

### 15.3 Fluxo de Trabalho Recomendado

#### **Fase 1: Requisitos & Planejamento** (Time)
```
1. PO define requisitos → 
2. Time estima esforço → 
3. Cria user stories → 
4. Prioriza no backlog
```

#### **Fase 2: Design** (Time + Nemotron)
```
1. Time define arquitetura geral
2. Nemotron documenta em Markdown
3. Time revisa e ajusta
4. Cria diagrams (ER, componentes)
```

#### **Fase 3: Implementação** (Nemotron + Time)
```
1. Nemotron: Gera código base
   ↓
2. Time: Revisa, testa localmente
   ↓
3. Nemotron: Gera testes
   ↓
4. Time: Ajusta, executa, valida
   ↓
5. Time: Code review, merge PR
```

#### **Fase 4: QA & Testes** (Time)
```
1. Testes de integração (manual + automático)
2. Testes de segurança
3. Performance testing
4. Validação com stakeholders
```

#### **Fase 5: Deploy** (Time)
```
1. Staging deployment
2. Smoke tests
3. Produção deployment
4. Monitoramento
5. Rollback se necessário
```

---

### 15.4 Prompts Recomendados para Nemotron 3 Ultra

#### **Backend - Geração de Service**
```
Crie um Spring Service para Transaction com métodos:
- create(CreateTransactionRequest): TransactionDTO
- update(id, UpdateTransactionRequest): TransactionDTO
- delete(id): void
- findByUserId(userId): List<TransactionDTO>
- findByUserIdAndDateRange(userId, startDate, endDate): List<TransactionDTO>

Use JPA, DTOs, e lance TransactionNotFoundException quando necessário.
Adicione @Transactional apropriadamente.
```

#### **Frontend - Componente React**
```
Crie um componente React em TypeScript para listar transações com:
- Table com colunas: Data, Descrição, Categoria, Valor, Tipo
- Filtro por data (DatePicker)
- Filtro por categoria (Select)
- Paginação
- Loading e erro states
- Use Tailwind CSS para estilo

Props devem ser: transactions[], isLoading, error, onEdit, onDelete
```

#### **Testes**
```
Crie testes JUnit 5 + Mockito para o TransactionService:
- testCreate_withValidData_shouldReturnDTO
- testCreate_withInvalidAmount_shouldThrowException
- testFindByUserIdAndDateRange_shouldReturnFilteredList
- testUpdate_shouldUpdateFields

Use @ExtendWith(MockitoExtension.class) e @Mock/@InjectMocks
```

#### **Documentação**
```
Escreva documentação em Markdown para:
- Como configurar o ambiente de desenvolvimento
- Como rodar testes localmente
- Como fazer build do projeto
- Troubleshooting comum

Use tom técnico mas acessível para juniors.
```

---

### 15.5 Checklist de Validação (Time)

#### Antes de Usar Código Gerado
- [ ] Código compila sem erros
- [ ] Não há warnings (ou justificados)
- [ ] Segue convenções do projeto
- [ ] Testes passam
- [ ] SonarQube score OK (se configurado)

#### Antes de Merge de PR
- [ ] Code review aprovado (2+ reviewers)
- [ ] Testes passam em CI/CD
- [ ] Documentação atualizada
- [ ] Sem duplicação de código
- [ ] Performance aceitável

#### Antes de Deploy
- [ ] Staging tests passam
- [ ] Smoke tests OK
- [ ] Rollback plan documentado
- [ ] Monitoramento configurado
- [ ] On-call designado

---

## 16. Próximos Passos

### Imediato (Este Sprint)
1. **Setup inicial (Time):** Clone repo, configure Docker
2. **Documentação (Nemotron):** Use este documento como base
3. **Estrutura base (Nemotron):** Gere Controllers, Services, Repositories
4. **Validação (Team):** Revise, teste localmente

### Curto Prazo (2-3 sprints)
1. **Autenticação (Team + Nemotron):** Implementar JWT
2. **CRUD (Nemotron):** Gerar endpoints para Transaction
3. **Testes (Nemotron + Team):** Aumentar cobertura
4. **Documentação (Nemotron):** Swagger/OpenAPI

### Médio Prazo (V2)
1. **Frontend Dashboard (Team + Nemotron)**
2. **Gráficos e KPIs (Nemotron)**
3. **Testes E2E (Team + Nemotron)**

---

**Última atualização:** Junho 2026
**Status:** Em desenvolvimento ativo
**Mantedor:** Time de desenvolvimento
**AI Assistant:** Nemotron 3 Ultra (NVIDIA) para suporte técnico
