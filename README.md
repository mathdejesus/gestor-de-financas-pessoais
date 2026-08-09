# 🏦 Gestor de Finanças Pessoais (GFP)

> **Plataforma educacional full-stack** demonstrando padrões reais de engenharia de software utilizados por **bancos e fintechs brasileiras** (Itaú, Inter, Nubank). **Backend** Java 21 + Spring Boot 3.2 com **server-side rendering (Thymeleaf)** — o frontend é **HTML + CSS puro**, sem JavaScript de lógica de negócio. **Persistência** PostgreSQL com migrations versionadas (Flyway); **Segurança** JWT + token versioning + CSRF double-submit; **Testes** JUnit 5 + Mockito + TestContainers; **Automação** GitHub Actions CI/CD com build Docker.

---

## 🧠 Filosofia do Projeto

**O frontend é apenas visual. Todo o processamento acontece no backend.**

- O backend Java **puxa as informações do frontend** (forms HTML clássicos) e **processa todos os dados** (validação, regras de negócio, agregações, relatórios)
- As páginas são **server-rendered com Thymeleaf**: o Java monta o HTML com os dados
- **Zero JavaScript de aplicação** — formulários usam POST clássico com **PRG** (Post/Redirect/Get)
- A única exceção é `sw.js` (service worker PWA), que apenas faz cache offline de assets estáticos — sem lógica de negócio
- Mobile: o mesmo HTML server-rendered é consumido como **PWA** (instalável via `manifest.webmanifest`)

---

## 📌 Por Quê Este Projeto?

Este **não é hobby project**. É um **case profissional production-ready** que replica padrões corporativos:

### ✅ Aprendizados Estruturados

| Aspecto | Implementação |
|---------|---------------|
| **Arquitetura** | Maven multi-module (`financeapp-api`, `financeapp-core`) separando responsabilidades |
| **Segurança** | JWT HS256 + BCrypt 12 rounds + **token versioning** (revogação stateless) + CSRF double-submit |
| **Web** | Server-side rendering com Thymeleaf — HTML/CSS puro, acessível, sem framework JS |
| **Dados** | PostgreSQL + Flyway com migrations versionadas |
| **Testes** | JUnit 5 + Mockito + TestContainers (BD real) + MockMvc (web layer) |
| **DevOps** | Docker Compose (dev), GitHub Actions (CI/CD) |

### 🎯 Argumento em Entrevista Técnica

**Cenário:** *"Como você gerencia expiração e revogação de tokens JWT sem banco de sessões?"*

**Sua resposta (fundamentada no código):**
```
"Implementei token versioning. Cada JWT contém um claim 'tokenVersion'. 
Na tabela User há um inteiro 'tokenVersion' indexado. 

Na autenticação, geramos token com versão atual.
A cada logout/mudança de senha, incremento essa versão no banco.

Durante requisições autenticadas:
1. Extraio 'tokenVersion' do JWT
2. Comparo com 'User.tokenVersion' no banco (O(1) - indexed lookup)
3. Se não baterem → token revogado, rejeitamos

Benefício: Segurança + stateless + performance (sem session store)."
```

---

## 🛠️ Stack Técnico

### Backend
```
Java 21
├─ Spring Boot 3.2 (Web, Thymeleaf, Security, Data JPA, Validation)
├─ JWT + Token Versioning (Segurança stateless)
├─ HttpOnly Cookie Auth + CSRF Double-Submit
├─ Server-Side Rendering (Thymeleaf) — frontend HTML/CSS puro
├─ Per-Account Lockout (5 falhas → 15min bloqueio)
├─ PostgreSQL 15 + Flyway (Migrations versionadas)
├─ Lombok (Boilerplate reduction)
├─ Maven (Multi-module: api, core)
└─ JUnit 5 + Mockito + TestContainers + MockMvc
```

### Frontend
```
HTML5 + CSS3 (server-rendered pelo backend)
├─ Thymeleaf templates (fragments: layout, navbar)
├─ Paleta Solarized (dark/light via cookie theme)
├─ PWA (manifest + service worker para cache offline)
└─ Sem JavaScript de aplicação
```

### DevOps & Infra
```
Docker Compose (dev local)
├─ PostgreSQL 15-alpine
└─ Backend (serve HTML + API + assets)

GitHub Actions (CI/CD)
├─ Testes automáticos (push & PR)
└─ Build Docker (main)
```

---

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose 2.0+

### 1️⃣ Setup Local (Docker Compose)

```bash
# Clone o projeto
git clone https://github.com/mathdejesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais

# Crie arquivo .env (não versione!)
cat > .env << EOF
POSTGRES_DB=financial_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=seu_password_seguro_aqui
JWT_SECRET=seu_jwt_secret_aleatorio_64_chars
SPRING_PROFILES_ACTIVE=dev
EOF

# Inicie tudo
docker compose up -d

# Acesse
echo "App: http://localhost:8080"
```

### 2️⃣ Setup Local (Sem Docker)

```bash
cd backend
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n') mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev
# Disponível em http://localhost:8080
```

---

## 📁 Estrutura do Projeto

```
gestor-de-financas-pessoais/
│
├─ backend/
│  ├─ financeapp-api/                # Web layer
│  │  ├─ src/main/java/com/financeapp/api/
│  │  │  ├─ web/                     # Controllers MVC (páginas + forms)
│  │  │  ├─ config/                  # SecurityConfig
│  │  │  └─ security/                # JwtAuthenticationFilter
│  │  └─ src/main/resources/
│  │     ├─ templates/               # Thymeleaf (auth, dashboard, transactions,
│  │     │                           #  categories, goals, reports, settings)
│  │     ├─ static/                  # CSS, favicon, manifest PWA, sw.js
│  │     ├─ db/migration/            # Flyway migrations
│  │     └─ application*.yml
│  ├─ financeapp-core/               # Entidades, Services, DTOs, JwtUtil, Repos
│  └─ Dockerfile
│
├─ .github/workflows/ci.yml          # CI/CD (testes + build Docker)
├─ docker-compose.yml                # postgres + backend
├─ .env.example                      # Template de variáveis de ambiente
└─ README.md
```

---

## 🔐 Segurança: Token Versioning Deep Dive

### O Problema
- JWT padrão: Uma vez emitido, é válido até expirar
- Logout? Sem efeito imediato (token segue válido)
- Mudança de senha? Token não revogado automaticamente

### A Solução: Token Versioning

**1. Schema do Banco**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    token_version INTEGER DEFAULT 0,  -- Chave para revogação!
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para O(1) lookup
CREATE INDEX idx_users_token_version ON users(id, token_version);
```

**2. JWT Payload**
```json
{
    "sub": "1",
    "email": "user@example.com",
    "tokenVersion": 0,
    "iat": 1719700000,
    "exp": 1719703600
}
```

**3. Fluxo de Autenticação**
```java
// JwtAuthenticationFilter — a cada request
String token = getTokenFromRequest(request);
if (token != null && jwtUtil.validateToken(token)) {
    Claims claims = jwtUtil.parseToken(token);
    if ("access".equals(claims.get("type", String.class))) {
        User user = userRepository.findById(parseUserId(claims)).orElse(null);
        // ✅ Revogação stateless: compara versões
        if (user != null && hasValidVersion(claims, user)) {
            setAuthentication(user, request);
        }
    }
}
// Sem access token válido? Refresh server-side a partir do cookie refresh_token
```

**Benefícios:**
✅ Revogação **instantânea** (sem delay de cache)  
✅ **Stateless** (sem session store)  
✅ **O(1) performance** (indexed lookup)  
✅ Funciona com **múltiplos servidores** (sem sincronização de estado)  
✅ **Sem JS no cliente** — o refresh é feito server-side no filtro

---

## 🛡️ Security Hardening

| # | Vulnerabilidade | Solução | Status |
|---|----------------|---------|--------|
| C1 | JWT em localStorage | HttpOnly cookies + CSRF double-submit | ✅ |
| C2 | Refresh token sem uso | **Refresh server-side** no `JwtAuthenticationFilter` | ✅ |
| C3 | Email enumeration | Mensagem genérica "email already exists" | ✅ |
| C4 | Sem brute force | Lock após 5 falhas (15min), migration V6 | ✅ |
| C5 | CSRF em forms SSR | `CookieCsrfTokenRepository` + campo `_csrf` em todo form | ✅ |
| C6 | XSS surface | Sem JS de aplicação — templates Thymeleaf escapam por padrão | ✅ |

---

## 🧪 Testes & Cobertura

### Estratégia de Testes
- **Unitários**: Services, Utils, Validações
- **Integração**: Repositories (TestContainers com BD real)
- **Web layer**: MockMvc (render de páginas, redirects, cookies, PRG) — `WebPageTest`

### Rodar Testes

```bash
# Backend - todos os testes (unit + integração + web)
cd backend
mvn test

# Backend - apenas um teste
mvn test -pl financeapp-core -Dtest=AuthServiceTest

# Backend - cobertura (Jacoco)
mvn clean verify
# Relatório em: backend/**/target/site/jacoco/index.html
```

---

## 🖥️ Rotas Web

### Autenticação
```
GET  /login          # Página de login
POST /login          # Login (seta access_token + refresh_token cookies)
GET  /register       # Página de registro
POST /register       # Registro (seta cookies)
POST /logout         # Logout (revoga tokens + limpa cookies)
```

### Aplicação
```
GET  /dashboard            # KPIs + categorias + transações recentes
GET  /transactions         # Lista (filtros via query params)
GET  /transactions/new     # Form de nova transação
POST /transactions         # Criar
GET  /transactions/{id}/edit
POST /transactions/{id}/update
POST /transactions/{id}/delete
GET  /categories           # Lista + form de criação
POST /categories           # Criar
POST /categories/{id}/delete
GET  /goals                # Metas + form de criação
POST /goals                # Criar
POST /goals/{id}/update    # Atualizar progresso/status
POST /goals/{id}/delete
GET  /reports              # Relatórios (filtros startDate/endDate)
GET  /reports/export/csv   # Exportar CSV
GET  /reports/export/pdf   # Exportar PDF
GET  /settings             # Perfil + senha
POST /settings/profile
POST /settings/password
GET  /theme?theme=dark|light  # Troca tema (grava cookie)
```

---

## 🔄 CI/CD com GitHub Actions

### Fluxo Automático

```
Push to main/develop
    ↓
[1] Run Tests (Backend: JUnit 5 + TestContainers + MockMvc)
    ↓
[2] Build Docker Image (backend)
    ↓
[3] Verificação final
```

### Workflow Ativo

| Workflow | Trigger | Ação |
|----------|---------|------|
| `ci.yml` | push + PR | Testes + build Docker |

---

## 🗂️ Padrões & Convenções

### Código Backend
- **Arquitetura**: Clean Architecture (Entities → Services → Web Controllers)
- **Web**: Controllers MVC em `...api.web`, templates Thymeleaf em `templates/`, forms com PRG
- **Exceptions**: Custom exceptions com tratamento global (`@ControllerAdvice`)
- **Validação**: Bean Validation + custom validators
- **Logging**: SLF4J com níveis apropriados (DEBUG, INFO, WARN, ERROR)
- **Naming**: Camel case (métodos), UPPER_SNAKE_CASE (constantes)

### Frontend (templates)
- **Fragments**: `fragments/layout.html` com `head()` e `navbar()` para reuso
- **Tema**: cookie `theme` + atributo `data-theme` no `<html>`
- **CSS**: `static/css/app.css`, paleta Solarized, sem framework
- **Segurança**: todo form inclui `_csrf` hidden field

### Banco de Dados
- **Migrations**: Flyway com versionamento semântico (V1.0__, V1.1__)
- **Índices**: Criados para colunas frequentemente filtradas
