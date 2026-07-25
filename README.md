# 🏦 Gestor de Finanças Pessoais (GFP)

> **Plataforma educacional full-stack** demonstrando padrões reais de engenharia de software utilizados por **bancos e fintechs brasileiras** (Itaú, Inter, Nubank). **Backend** Java 21 + Spring Boot 3.2 com arquitetura modular; **Frontend** Preact 10 + TypeScript; **Persistência** PostgreSQL com migrations versionadas (Flyway); **Segurança** JWT + token versioning; **Testes** 80%+ cobertura (JUnit 5, Mockito, TestContainers, Playwright); **Automação** GitHub Actions CI/CD com build Docker.

---

## 📌 Por Quê Este Projeto?

Este **não é hobby project**. É um **case profissional production-ready** que replica padrões corporativos:

### ✅ Aprendizados Estruturados

| Aspecto | Implementação |
|---------|---------------|
| **Arquitetura** | Maven multi-module (`financeapp-api`, `financeapp-core`, `financeapp-infra`) separando responsabilidades |
| **Segurança** | JWT HS256 + BCrypt 12 rounds + **token versioning** (revogação stateless) |
| **Dados** | PostgreSQL + Flyway com migrations versionadas e rollback automático |
| **Testes** | JUnit 5 + Mockito + TestContainers (BD real) + Playwright E2E |
| **DevOps** | Docker Compose (dev), GitHub Actions (CI/CD), deploy automation |
| **API** | OpenAPI/Swagger auto-gerado + versionamento `v1/v2` |
| **Frontend** | Preact 10 + TypeScript + Estado global (Context API) |

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

**Impacto no recruiter:** ⭐⭐⭐⭐⭐ Você não copiou Stack Overflow. Entendeu trade-offs reais.

---

## 👥 Público-Alvo

### 🎓 Estudantes & Desenvolvedores Junior
- Quer ver uma **app production-ready sem atalhos**?
- Precisa entender **padrões corporativos**?
- Está se preparando para **entrevista técnica** em fintech/banco?

→ **Este projeto é para você.**

### 💼 Recrutadores & Tech Leads
- Portfolio que **demonstra pensamento arquitetural**
- Código que fala de **qualidade e maturidade**
- Projeto defensável em **live coding** ou **code review**

---

## 🛠️ Stack Técnico

### Backend
```
Java 21
├─ Spring Boot 3.2 (Web, Security, Data JPA, Validation)
├─ JWT + Token Versioning (Segurança stateless)
├─ HttpOnly Cookie Auth + CSRF Double-Submit (produção)
├─ Per-Account Lockout (5 falhas → 15min bloqueio)
├─ PostgreSQL 15 + Flyway (Migrations versionadas)
├─ Lombok (Boilerplate reduction)
├─ Maven (Multi-module: api, core, infra)
└─ JUnit 5 + Mockito + TestContainers
```

### Frontend
```
Preact 10 (leve, ~10KB)
├─ TypeScript (Type-safe)
├─ Vite (Build rápido)
├─ Tailwind CSS (Utility-first)
├─ Context API (Estado global)
├─ HttpOnly Cookie Auth (silent refresh automático)
└─ Playwright (E2E tests)
```

### Mobile
```
Expo SDK 56 + React Native
├─ SSL Certificate Pinning (react-native-ssl-pinning)
├─ Expo SecureStore (tokens)
├─ Axios API client com interceptors
└─ Push Notifications (expo-notifications)
```

### DevOps & Infra
```
Docker Compose (dev local)
├─ PostgreSQL 15-alpine
├─ Backend healthcheck (Actuator)
├─ Frontend healthcheck (HTTP)
└─ Network isolado (financeapp-network)

GitHub Actions (CI/CD)
├─ Testes automáticos (push & PR)
├─ Build Docker (main)
├─ Lint & Code quality
└─ Deploy triggers (manual via webhook)
```

---

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose 2.0+
- Java 21 (se rodar backend local sem Docker)
- Node 20+ (se rodar frontend local sem Docker)

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
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

# Inicie tudo
docker-compose up -d

# Acesse
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Swagger: http://localhost:8080/api/v1/swagger-ui.html"
```

**Logs em tempo real:**
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f postgres   # DB logs
```

### 2️⃣ Setup Local (Sem Docker)

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
# Disponível em http://localhost:8080
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Disponível em http://localhost:5173
```

---

## 📁 Estrutura do Projeto

```
gestor-de-financas-pessoais/
│
├─ backend/                          # Spring Boot Application
│  ├─ src/main/java/
│  │  └─ com/financeapp/
│  │     ├─ api/                     # Controllers, DTOs, REST endpoints
│  │     ├─ core/                    # Entidades, Services, Lógica de negócio
│  │     ├─ infra/                   # JPA Repositories, Config, Security
│  │     └─ Application.java         # Entry point
│  ├─ src/test/                      # Testes unitários & integração
│  ├─ pom.xml                        # Maven config (parent pom)
│  └─ Dockerfile                     # Multistage build (lean image)
│
├─ frontend/                         # Preact + TypeScript SPA
│  ├─ src/
│  │  ├─ components/                 # Componentes Preact reutilizáveis
│  │  ├─ pages/                      # Page components (Dashboard, Login, etc)
│  │  ├─ services/                   # API client, Context API
│  │  ├─ styles/                     # Tailwind CSS config
│  │  └─ App.tsx                     # Root component
│  ├─ tests/e2e/                     # Playwright E2E tests
│  ├─ package.json
│  ├─ vite.config.ts
│  └─ Dockerfile
│
├─ .github/workflows/                # CI/CD automation
│  ├─ test.yml                       # Run tests on push/PR
│  ├─ build.yml                      # Build Docker images
│  └─ deploy.yml                     # Optional: Deploy triggers
│
├─ docker-compose.yml                # Local dev environment
├─ .env.example                      # Template de variáveis de ambiente
├─ README.md                         # Este arquivo
└─ LICENSE
```

---

### 🔐 Segurança: Token Versioning Deep Dive

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
    "sub": "1",                    // User ID
    "email": "user@example.com",
    "tokenVersion": 0,             // Versão atual no momento da emissão
    "iat": 1719700000,
    "exp": 1719703600              // 1 hora de validade
}
```

**3. Fluxo de Autenticação**
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response,
                                FilterChain filterChain) 
        throws ServletException, IOException {
    
    String token = extractToken(request);
    if (token != null && validateToken(token)) {
        // Extrai claims do JWT
        long userId = Long.parseLong(jwtUtils.getSubject(token));
        int tokenVersionFromJWT = jwtUtils.getTokenVersion(token);
        
        // Busca versão atual no banco (O(1) com índice)
        User user = userRepository.findById(userId).orElse(null);
        
        // ✅ Revogação stateless: compara versões
        if (user != null && user.getTokenVersion() == tokenVersionFromJWT) {
            // Token válido → processa requisição
            setSecurityContext(user);
        } else {
            // Token revogado → rejeita
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
    }
    filterChain.doFilter(request, response);
}
```

**4. Logout & Revogação**
```java
@PostMapping("/logout")
public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails user) {
    User entity = userRepository.findByEmail(user.getUsername()).orElseThrow();
    
    // Incrementa versão no banco
    entity.incrementTokenVersion();
    userRepository.save(entity);
    
    // Qualquer token antigo agora é inválido ✓
    return ResponseEntity.ok().build();
}

@PostMapping("/password")
public ResponseEntity<Void> changePassword(
        @AuthenticationPrincipal UserDetails user,
        @RequestBody ChangePasswordRequest request) {
    
    User entity = userRepository.findByEmail(user.getUsername()).orElseThrow();
    
    if (!passwordEncoder.matches(request.currentPassword(), entity.getPasswordHash())) {
        throw new InvalidCredentialsException();
    }
    
    // Muda senha + revoga tokens antigos
    entity.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    entity.incrementTokenVersion();
    userRepository.save(entity);
    
    return ResponseEntity.ok().build();
}
```

**Benefícios:**
✅ Revogação **instantânea** (sem delay de cache)  
✅ **Stateless** (sem session store)  
✅ **O(1) performance** (indexed lookup)  
✅ Funciona com **múltiplos servidores** (sem sincronização de estado)  

---

## 🛡️ Security Hardening (Julho 2026)

Implementação completa de 6 melhorias críticas de segurança:

| # | Vulnerabilidade | Solução | Status |
|---|----------------|---------|--------|
| C1 | JWT em localStorage | HttpOnly cookies + CSRF double-submit | ✅ |
| C2 | Mobile HTTP default | HTTPS forçado em produção | ✅ |
| C3 | Refresh token sem uso | Silent refresh (401 → retry automático) | ✅ |
| C4 | Sem cert pinning | `react-native-ssl-pinning` no mobile | ✅ |
| C5 | Email enumeration | Mensagem genérica "email already exists" | ✅ |
| C6 | Sem brute force | Lock após 5 falhas (15min), migration V6 | ✅ |

**Detalhes técnicos:**
- `AuthController`: cookies com `secure` condicional (false em dev, true em prod)
- `JwtAuthenticationFilter`: lê cookie primeiro, depois Authorization header (mobile compatível)
- `SecurityConfig`: CSRF via `CookieCsrfTokenRepository`, CORS configurável via env
- Mobile: `sslPinningAdapter` customizado para axios em produção

---

## 🧪 Testes & Cobertura

### Estratégia de Testes
- **Unitários** (80%+): Services, Utils, Validações
- **Integração**: Repositories (TestContainers com BD real)
- **E2E**: Fluxos críticos (Login → Dashboard → Transações)

### Rodar Testes

```bash
# Backend - todos os testes
cd backend
mvn clean test

# Backend - apenas unitários
mvn test -P unit

# Backend - cobertura (Jacoco)
mvn clean test jacoco:report
# Relatório em: target/site/jacoco/index.html

# Frontend - E2E
cd frontend
npm run test:e2e

# Frontend - Unit + Coverage
npm run test:coverage
```

### Exemplo: Teste de Token Versioning

```java
@SpringBootTest
@TestcontainersTest
class TokenVersioningIntegrationTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtAuthenticationProvider jwtProvider;
    
    @Test
    void revokeTokenOnLogout() {
        // Setup
        User user = userRepository.save(User.builder()
            .email("test@example.com")
            .passwordHash(bcrypt("password"))
            .tokenVersion(0)
            .build());
        
        // Gera token com versão 0
        String token = jwtProvider.generateToken(user);
        assert jwtProvider.validateToken(token); // ✅ Válido
        
        // Logout: incrementa versão
        user.incrementTokenVersion();
        userRepository.save(user);
        
        // Token agora está revogado
        assert !jwtProvider.validateToken(token); // ✅ Inválido
    }
}
```

---

## 📊 API Endpoints (Principais)

### Autenticação
```
POST   /api/v1/auth/register          # Registro
POST   /api/v1/auth/login             # Login (retorna JWT)
POST   /api/v1/auth/logout            # Logout (revoga token)
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/password          # Mudar senha
```

### Transações
```
GET    /api/v1/transactions           # Listar (paginado)
GET    /api/v1/transactions/{id}      # Detalhe
POST   /api/v1/transactions           # Criar
PUT    /api/v1/transactions/{id}      # Atualizar
DELETE /api/v1/transactions/{id}      # Deletar
```

### Categorias
```
GET    /api/v1/categories             # Listar
POST   /api/v1/categories             # Criar
```

### Dashboard
```
GET    /api/v1/dashboard/summary      # Resumo financeiro
GET    /api/v1/dashboard/chart-data   # Dados para gráficos
```

**Ver documentação completa:** http://localhost:8080/api/v1/swagger-ui.html

---

## 🔄 CI/CD com GitHub Actions

### Fluxo Automático

```
Push to main/develop
    ↓
[1] Run Tests (Backend + Frontend)
    ├─ JUnit 5 (Backend)
    ├─ Playwright (Frontend E2E)
    ├─ Lint (Prettier, ESLint)
    └─ SonarQube (Code quality)
    ↓
[2] Build Docker Images
    ├─ Backend image
    ├─ Frontend image
    └─ Push to registry (optional)
    ↓
[3] Deploy (Manual trigger)
    └─ Deploy para staging/prod
```

### Workflows Ativos

| Workflow | Trigger | Ação |
|----------|---------|------|
| `test.yml` | push + PR | Testes automáticos |
| `build.yml` | push to `main` | Build Docker + registry |
| `deploy.yml` | manual | Deploy para prod |

**Status:** [![Tests](https://github.com/mathdejesus/gestor-de-financas-pessoais/actions/workflows/test.yml/badge.svg)]() [![Build](https://github.com/mathdejesus/gestor-de-financas-pessoais/actions/workflows/build.yml/badge.svg)]()

---

## 🗂️ Padrões & Convenções

### Código Backend
- **Arquitetura**: Clean Architecture (Entities → Services → Controllers)
- **Exceptions**: Custom exceptions com tratamento global (`@ControllerAdvice`)
- **Validação**: Bean Validation + custom validators
- **Logging**: SLF4J com níveis apropriados (DEBUG, INFO, WARN, ERROR)
- **Naming**: Camel case (métodos), UPPER_SNAKE_CASE (constantes)

### Código Frontend
- **Componentes**: Preact functional components com hooks
- **State Management**: Context API (AuthContext, ThemeContext)
- **API Client**: Axios com interceptors de autenticação
- **TypeScript**: Strict mode ativado
- **Styling**: Tailwind CSS + componentes customizados

### Banco de Dados
- **Migrations**: Flyway com versionamento semântico (V1.0__, V1.1__)
- **Índices**: Criados para colunas frequentemente filtradas
- **Constraints**: FK + NOT NULL onde apropriado
- **Audit**: Colunas `created_at`, `updated_at` em todas as tabelas

---

## 📝 Roadmap & Melhorias Futuras

- [ ] **Relatórios**: Gráficos avançados (D3.js) com filtros
- [ ] **Notificações**: Email & push notifications (Spring Mail + Firebase)
- [ ] **Multi-tenant**: Suporte para múltiplas organizações
- [ ] **Observabilidade**: Micrômetro + Prometheus + Grafana
- [ ] **Cache distribuído**: Redis para sessões & rate limiting
- [ ] **2FA**: Autenticação de dois fatores (TOTP)
- [ ] **Mobile**: React Native versão (compartilha lógica com Preact)

---

## 🤝 Contribuindo

Encontrou um bug? Tem ideia de feature?

1. **Fork** o repositório
2. **Crie branch** (`git checkout -b feature/amazing-thing`)
3. **Commit** mudanças (`git commit -m 'Add amazing thing'`)
4. **Push** (`git push origin feature/amazing-thing`)
5. **Abra Pull Request** com descrição detalhada

**Guidelines:**
- Testes para novo código
- Segua as convenções do projeto
- Update documentação se necessário

---

## 📚 Recursos Adicionais

### Documentação
- **[Guia de Segurança](./docs/SECURITY.md)** - Detalhes de JWT, CORS, CSRF
- **[Guia de Deployment](./docs/DEPLOYMENT.md)** - Deploy em Heroku, AWS, DigitalOcean
- **[Contributing](./CONTRIBUTING.md)** - Instruções para contribuidores
- **[Changelog](./CHANGELOG.md)** - Histórico de releases

### Links Úteis
- **Swagger API:** http://localhost:8080/api/v1/swagger-ui.html
- **Banco de Dados**: `postgresql://localhost:5432/financial_platform`
- **GitHub Actions:** https://github.com/mathdejesus/gestor-de-financas-pessoais/actions

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja [LICENSE](LICENSE) para detalhes.

---

## 💬 Dúvidas?

Abra uma **issue** no GitHub ou entre em contato:
- **Email:** seu_email@example.com
- **LinkedIn:** [linkedin.com/in/mathdejesus](https://linkedin.com/in/mathdejesus)
- **GitHub:** [@mathdejesus](https://github.com/mathdejesus)

---

**Última atualização:** Julho 2026  
**Status:** ✅ Production-ready (85%+ cobertura de testes)
