# Gestor de Finanças Pessoais (GFP)

**Backend Java 21 + Spring Boot 3.2 — Production-Ready**

Plataforma de gestão financeira que implementa **padrões corporativos de arquitetura e segurança** usados por bancos e fintechs brasileiras. Código limpo, testável, escalável.

---

## Valor & Audiência

**Por quê este projeto importa:**
- Implementa **JWT token versioning** — revogação stateless e instantânea (diferenciar em entrevista de junior)
- **Segurança em camadas** — HttpOnly cookies, CSRF double-submit, BCrypt, brute-force lockout
- **Arquitetura escalável** — Maven multi-module, testes com containers (BD real), CI/CD automatizado

**Para quem:**
- Recrutadores de **bancos e fintechs** (Itaú, Bradesco, Inter, Nubank) buscando junior/internship backend
- Tech leads validando **padrões de código corporativo** (clean architecture, testing strategy)
- Candidatos Java estudando como **estruturar projeto profissional** de verdade

---

## Stack & Implementação

| Aspecto | Implementação |
|---------|---------------|
| **Linguagem** | Java 21 (LTS, padrão corporativo) |
| **Framework Web** | Spring Boot 3.2 (Spring Security, Data JPA, Validation) |
| **Banco de Dados** | PostgreSQL 15 + Flyway (migrations versionadas) |
| **Autenticação** | JWT HS256 + Token Versioning (stateless, revogação O(1)) |
| **Autorização** | RBAC (Role-Based Access Control) |
| **Segurança** | HttpOnly cookies, CSRF double-submit, BCrypt 12 rounds, account lockout |
| **Testes** | JUnit 5, Mockito, TestContainers (unit + integration + web layer) |
| **Build** | Maven 3.9+ (multi-module: api, core) |
| **DevOps** | Docker Compose (dev), GitHub Actions (CI/CD) |
| **Estrutura** | Clean Architecture (layers separadas, responsabilidades claras) |
| **Cobertura** | Services > 85%, auth/transactions > 90% |

**Stack Excluído Intencionalmente:** React, Angular, Node.js, frontend frameworks. Foco 100% backend Java.

---

## Arquitetura Técnica

### Multi-Module: Separação de Responsabilidades

```
backend/
├─ financeapp-api/        # HTTP layer (Controllers, Filters, Config)
├─ financeapp-core/       # Business logic (Services, Entities, Repos, DTOs)
└─ pom.xml
```

**Por quê:** Cada módulo testável independentemente; facilita manutenção e escalação em microserviços.

---

## Diferencial 1: JWT Token Versioning

**Problema:** JWT padrão é válido até expirar — logout não tem efeito imediato.

**Solução Implementada:**

1. **Banco**
   ```sql
   CREATE TABLE users (id BIGSERIAL, token_version INTEGER DEFAULT 0, ...);
   CREATE INDEX idx_users_token_version ON users(id, token_version);
   ```

2. **JWT**
   ```json
   { "sub": "1", "tokenVersion": 0, "exp": 1719703600 }
   ```

3. **Filtro (a cada request)**
   ```java
   Integer tokenVersionJwt = claims.get("tokenVersion");
   User user = userRepository.findById(userId);
   if (user.getTokenVersion().equals(tokenVersionJwt)) {
       // Token válido
   } else {
       // Token revogado (logout/senha mudou)
   }
   ```

**Benefícios:** Revogação instantânea, stateless (sem session store), O(1) performance, escalável.

---

## Diferencial 2: Segurança em Camadas

| Camada | Implementação |
|--------|---------------|
| **Armazenamento** | JWT em HttpOnly cookie (não acessível por JS) |
| **Transmissão** | HTTPS obrigatório em produção |
| **Validação** | CSRF double-submit (cookie + header) |
| **Senha** | BCrypt 12 rounds + salt aleatório |
| **Ataques** | Account lockout (5 falhas → 15min bloqueio) |
| **Enumeração** | Mensagens genéricas (login/registro) |
| **Filtro** | JwtAuthenticationFilter em toda requisição autenticada |

---

## Diferencial 3: Testes Profissionais

### Estratégia
- **Unit**: Services, DTOs, Utilities (Mockito)
- **Integração**: Repositories com PostgreSQL real (TestContainers)
- **Web**: Controllers, filters, cookies (MockMvc + JUnit 5)

### Rodar
```bash
cd backend
mvn test                                    # Todos
mvn test -pl financeapp-core -Dtest=AuthServiceTest  # Específico
mvn clean verify                            # Com cobertura Jacoco
```

---

## Rotas da Aplicação

### Auth
```
POST /login      → auth (seta httpOnly cookies)
POST /register   → criar conta
POST /logout     → revoga token_version
```

### Recursos (RBAC Protected)
```
GET/POST   /transactions          → CRUD
PATCH/DEL  /transactions/{id}     → Editar/deletar
GET        /transactions/export/csv

GET/POST   /categories            → CRUD
GET/POST   /goals                 → Metas
GET        /reports               → Relatórios + export PDF
GET/POST   /settings              → Perfil + senha
```

---

## CI/CD Pipeline

**GitHub Actions (automático a cada push/PR):**
1. Rodar testes (JUnit 5 + TestContainers)
2. Build Docker image
3. Publish (se main branch)

**Setup Local:**
```bash
git clone https://github.com/mathofjesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais

cat > .env << 'ENV'
POSTGRES_DB=financial_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=seu_password_seguro
JWT_SECRET=seu_jwt_secret_64_chars
SPRING_PROFILES_ACTIVE=dev
ENV

docker compose up -d
# Acessível em http://localhost:8080
```

---

## Decisões Arquiteturais

### Por Quê Flyway (não Liquibase, não auto-ddl)?
- **Flyway**: simples, determinístico, SQL puro
- **Auto-DDL**: perigoso em produção; migrations explícitas = auditoria

### Por Quê JWT + Token Versioning (não OAuth2, não session store)?
- **OAuth2**: overhead para app monolítica (é para SSO)
- **Session store**: estado no servidor (Redis/DB) = scaling complexity
- **Token versioning**: stateless + revogação instantânea = trade-off ótimo para fintech

### Por Quê Maven Multi-Module (não Gradle)?
- Clean separation (API vs Core)
- Testes independentes
- Padrão corporativo 

---

## Roadmap

- [ ] Notificações real-time (WebSockets)
- [ ] Integração Open Banking
- [ ] Relatórios analytics (SQL avançado)
- [ ] Mensageria assíncrona (RabbitMQ)
- [ ] Rate limiting (Spring Cloud Gateway)

---

## Links

- **GitHub**: https://github.com/mathofjesus/gestor-de-financas-pessoais
- **Issues**: Bugs, features, discussões

---

**License**: MIT
