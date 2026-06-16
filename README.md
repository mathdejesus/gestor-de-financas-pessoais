# 🏦 Gestor de Finanças Pessoais (GFP)

> Plataforma educacional corporativa de alta fidelidade para gestão financeira pessoal. Desenvolvida sob padrões de engenharia rigorosos adotados por grandes fintechs e bancos digitais brasileiros (como Itaú, Inter e Nubank), aplicando divisão multi-módulo em **Java 21 + Spring Boot 3.2**, frontend reativo em **Preact 10 + TypeScript + Vite + Tailwind CSS v4**, banco de dados relacional **PostgreSQL 15** e segurança estrita com stateless JWT, token versioning e rate limiting.

---

## 👥 Público-Alvo

Esta plataforma foi desenhada especificamente para atender a três perfis:

### 1. 🎓 Estudantes e Desenvolvedores Junior
* **Foco:** Entender como funciona uma aplicação real de ponta a ponta, sem atalhos comuns em tutoriais rápidos.
* **Benefício:** Acesso a padrões como migrações com Flyway, estruturação multi-module do Maven, e escrita de testes unitários e de integração com containers docker em JUnit 5.

### 2. 💻 Engenheiros de Software (Preparação para Entrevistas)
* **Foco:** Demonstrar decisões arquiteturais sólidas e defensáveis em sabatinas técnicas.
* **Exemplos de Perguntas de Entrevista Respondidas por Este Case:**
  * *"Como você gerencia a expiração e revogação de tokens JWT em uma arquitetura stateless sem sobrecarregar o banco de dados?"* -> **Resposta:** Implementado com Token Versioning direto nas claims do JWT e no cadastro do usuário, incrementado apenas em logout/password-change.
  * *"Como você garante o isolamento e reprodutibilidade dos testes de integração sem poluir um banco compartilhado?"* -> **Resposta:** Uso do Testcontainers para instanciar dinamicamente um PostgreSQL isolado durante o ciclo de vida dos testes do Maven.
  * *"Por que utilizar Maven Multi-Module em vez de um monolito monolítico clássico?"* -> **Resposta:** Para garantir a separação estrita de conceitos (Separation of Concerns) e impedir que a camada de entrega (API/Security) acesse diretamente dependências internas ou vice-versa, organizando o projeto em `financeapp-api` (borda), `financeapp-core` (regras de negócio) e `financeapp-infra`.

### 3. 👥 Recrutadores e Tech Leads
* **Foco:** Avaliação rápida de competências técnicas reais.
* **Benefício:** O código deste repositório demonstra o domínio de arquitetura limpa, segurança rigorosa contra ameaças OWASP comuns, cobertura robusta de testes automatizados e esteira de CI estruturada.

---

## ⭐ Por Que Este Projeto é um Bom Portfólio? (5 Razões)

1. **Arquitetura Multi-Module Real:** Não é um projeto de pasta única; segue a estrutura de grandes sistemas corporativos.
2. **Defesa e Segurança:** Possui controle de taxa (rate limiting), hashing robusto com BCrypt (12 rounds) e invalidação inteligente de sessões via Token Versioning.
3. **Qualidade de Testes Industrial:** Utiliza JUnit 5 + Mockito com Testcontainers PostgreSQL para testes de integração de banco de dados reais e Playwright para E2E do frontend.
4. **Histórico de Alterações Confiável:** Migrações reais versionadas usando Flyway garantem integridade estrutural em cada alteração de esquema.
5. **Automação Completa:** Possui pipelines GitHub Actions que validam linting, rodam testes com cobertura (Jacoco Quality Gates) e geram imagens Docker.

### 📊 Matriz Comparativa: Desenvolvedor GFP vs Candidato Tradicional

| Critério | Candidato Tradicional (Estágio/Junior Comum) | Engenheiro deste Projeto (Nível Corporativo) |
| :--- | :--- | :--- |
| **Banco de Dados** | H2 em memória ou script SQL manual | PostgreSQL real com migrations versionadas no Flyway |
| **Testes** | Sem testes ou apenas testes de repositório "mockado" | Pirâmide completa: Unitários, Testcontainers reais e E2E Playwright |
| **Segurança** | JWT simples exposto no código, sem tratamento de logout | Token Versioning (stateless blacklist) e Rate Limiting Resilience4j |
| **Arquitetura** | Projeto monolítico sem limites claros de pacotes | Estrutura Maven Multi-Module isolando API, Core e Infra |
| **CI/CD** | Deploy manual ou apenas build local | Pipeline do GitHub Actions validando testes, linting e gerando Docker image |

---

## 🏗️ Arquitetura do Sistema

```
gestor-de-financas-pessoais/
├── backend/                     # Spring Boot 3.2 (Java 21, Maven)
│   ├── financeapp-api/          # Camada de Entrada: Controllers, Swagger, Security, Spring Boot entrypoint
│   ├── financeapp-core/         # Camada Core: Entidades, DTOs, Services, Repositories e Regras de Negócio
│   ├── financeapp-infra/        # Camada de Infraestrutura: Adapters e integrações externas (módulo desacoplado)
│   ├── pom.xml                  # Parent POM (gerencia versões globais)
│   ├── Dockerfile               # Build multi-stage para imagem leve de produção
│   └── .env.example
├── frontend/                    # Preact 10 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/          # Componentes reativos reutilizáveis
│   │   ├── pages/               # Páginas e roteamento estruturado
│   │   ├── hooks/               # Custom hooks para encapsular lógica de estado
│   │   ├── services/            # Clientes HTTP usando Ky
│   │   ├── types/               # Interfaces e definições estritas de tipos TypeScript
│   │   ├── context/             # Controle de estado global via Context API + useReducer
│   │   └── utils/               # Funções de formatação e utilitários gerais
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── mobile/                      # Expo SDK 56 + React Native (Axios)
│   └── src/                     # App mobile com context e screens isoladas
├── docker-compose.yml           # Orquestração local de desenvolvimento (Postgres + Backend + Frontend)
├── .github/workflows/           # Automações de CI/CD (GitHub Actions)
├── AGENTS.md                    # Convenções e comandos para Agentes IA
├── SKILLS.md                    # Padrões e diretrizes de desenvolvimento do repositório
└── README.md                    # Documentação principal
```

---

## 🔑 Core Technologies & Defesas Técnicas

| Camada | Tecnologia | Versão | Nível de Defesa Técnica / Motivação |
| :--- | :--- | :--- | :--- |
| **Backend** | Java | 21 LTS | Uso de Records, Pattern Matching, sequenciamento de tipos e melhorias de performance JVM. |
| **Framework** | Spring Boot | 3.2.x | Ecossistema maduro, injeção de dependências robusta e integração nativa com Spring Security. |
| **Banco de Dados** | PostgreSQL | 15+ | Banco relacional robusto com suporte a transações ACID e consultas indexadas de alta complexidade. |
| **Migrations** | Flyway | 9.0+ | Controle estrito de versão de esquema, garantindo deploys reproduzíveis. |
| **Security** | Spring Security + JWT | 6.x | Autenticação stateless baseada em tokens assinados com algoritmo HS256 e BCrypt (12 rounds) para hashes. |
| **Resiliência** | Resilience4j | 2.2.0 | Proteção contra DDoS e força bruta por meio de Rate Limiting nos endpoints. |
| **Testes (Back)** | JUnit 5 + Testcontainers | 5.10 / 1.19 | Garantia de testes de integração realistas em ambiente isolado via Docker. |
| **Frontend** | Preact + Vite | 10 / 5.0 | Alternativa ultra-leve ao React com Virtual DOM rápido e inicialização instantânea por Vite. |
| **HTTP Client** | Ky | 2.0 | Cliente leve construído sobre a Fetch API com tratamento elegante de retry e hooks. |
| **Testes (Front)** | Vitest + Playwright | 2.1 / 1.50 | Testes unitários de alta velocidade e testes de ponta a ponta que simulam interações reais do usuário. |

---

## 🚀 Instalação & Setup do Ambiente Local

### Tempo Estimado de Setup: 5 a 10 minutos.

### Pré-requisitos Obrigatórios
* **Docker & Docker Compose** (instalado e rodando)
* **Git**
* *(Opcional para modo Standalone)*: Java 21 LTS, Node.js 20+, Maven 3.9+

---

### 🐳 Opção 1: Inicialização Rápida via Docker (Recomendado)

Ideal para testar a aplicação de ponta a ponta sem precisar configurar compiladores locais.

#### No Linux / macOS / Windows WSL:
```bash
# Clone o repositório
git clone https://github.com/mathdejesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais

# Copie os arquivos de variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Inicialize o ambiente Docker completo
docker compose up -d --build
```

#### No Windows (PowerShell nativo):
```powershell
# Clone o repositório
git clone https://github.com/mathdejesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais

# Copie os arquivos de variáveis de ambiente
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env

# Inicialize o ambiente Docker completo
docker compose up -d --build
```

#### 🌐 Endpoints Disponíveis após o Start:
* **Frontend Web:** `http://localhost:5173`
* **Backend API REST:** `http://localhost:8080/api/v1`
* **Swagger/OpenAPI UI:** `http://localhost:8080/swagger-ui.html` (apenas em profile `dev`)
* **Banco PostgreSQL:** `localhost:5432`

#### 🔍 Script de Verificação Rápida da API (Health Check):
```bash
curl -i http://localhost:8080/api/v1/auth/login
# Deve retornar um status HTTP 405 (Method Not Allowed) ou 400 em vez de 502/404, provando que a API está respondendo.
```

---

### 🛠️ Opção 2: Setup Standalone para Desenvolvimento (Sem Docker DB local)

Se você preferir rodar a aplicação localmente para debug contínuo de código utilizando banco de dados em memória H2 (sem requerer Postgres local):

#### 1. Backend:
```bash
cd backend
# Compilar projeto multi-module
mvn clean compile
# Rodar testes unitários e de integração
mvn test
# Iniciar a API com o Perfil Dev (usa H2 e desabilita Flyway)
mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev
```

#### 2. Frontend:
```bash
cd frontend
# Instalar dependências
npm install
# Iniciar servidor de desenvolvimento (Vite)
npm run dev
```

---

## 🛠️ Guia de Troubleshooting

### Erro 1: `Port 5432 or 8080 already in use`
* **Causa:** Você tem outro PostgreSQL ou aplicação Java/Tomcat rodando localmente.
* **Solução:** Pare os serviços locais antes de rodar o Docker Compose:
  ```bash
  sudo systemctl stop postgresql   # Linux
  # No Windows, pare o serviço Postgres via Services.msc
  ```

### Erro 2: `Flyway Migration Failed`
* **Causa:** Mudanças locais inconsistentes nos arquivos de migração sql.
* **Solução:** Resete o banco de dados do container:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

## 🤝 Governança de Código & Contribuição

Para garantir a qualidade em nível de produção, este repositório impõe barreiras rígidas de código (Quality Gates).

### Fluxo de Trabalho Git (Git Flow simplificado)
1. Crie uma branch a partir de `develop`: `git checkout -b feature/minha-feature`
2. Escreva o código garantindo a cobertura mínima de testes exigida.
3. Submeta o Pull Request apontando para a branch `develop`.

### Padrão de Commits Semânticos
Nossos commits seguem a especificação **Conventional Commits**:
* `feat: ...` para novas funcionalidades.
* `fix: ...` para correções de bugs.
* `docs: ...` para ajustes na documentação.
* `refactor: ...` para refatorações que não alteram lógica de comportamento.
* `test: ...` para acréscimo ou correção de testes.
* `style: ...` para formatação/ajustes visuais sem alteração lógica.
* `chore: ...` para atualizações de dependências ou build.

### 🚫 Padrão de Código: Aceito vs Rejeitado

#### ☕ Java (Backend)
* **Rejeitado (Código acoplado / Validação manual ineficiente):**
  ```java
  public ResponseEntity<?> createTransaction(TransactionDto dto) {
      if (dto.getAmount() <= 0) {
          return ResponseEntity.badRequest().body("Amount must be positive");
      }
      Transaction entity = new Transaction();
      entity.setAmount(dto.getAmount());
      // Acesso direto ao repositório no controller
      return ResponseEntity.ok(transactionRepository.save(entity));
  }
  ```
* **Aceito (Estateless, Validação declarativa na borda, Inversão de controle):**
  ```java
  @PostMapping
  public ResponseEntity<TransactionResponse> create(
          @Valid @RequestBody TransactionRequest request,
          @AuthenticationPrincipal UserPrincipal user) {
      TransactionDto result = transactionService.createTransaction(request.toDto(), user.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponse.from(result));
  }
  ```

#### ⚛️ Preact/TypeScript (Frontend)
* **Rejeitado (Mutação direta de estado, sem tipos fortes):**
  ```typescript
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/v1/transactions').then(res => res.json()).then(res => {
      data.push(res); // Mutação direta
      setData(data);
    });
  }, []);
  ```
* **Aceito (Tipagem estrita, imutabilidade, cliente Ky encapsulado):**
  ```typescript
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    transactionService.getAll()
      .then(data => setTransactions(data))
      .catch(err => toast.error("Falha ao carregar transações"));
  }, []);
  ```

### 🏆 Quality Gates do CI/CD
Toda Pull Request executa automaticamente as seguintes verificações:
* **Linter (Eslint):** Sem erros ou warnings não justificados.
* **Java Checkstyle:** Validação estática de formatação.
* **Cobertura Mínima JaCoCo:** **80%** de cobertura de código no backend.
* **Cobertura Mínima Frontend:** **60%** de cobertura no frontend.

---

## 🗓️ Roadmap do Projeto

| Versão | Foco | Status | Prazo Estimado |
| :--- | :--- | :--- | :--- |
| **v1.0.0 (MVP)** | Auth, CRUD Transações, Categorias, Testes base, Token Versioning. | 🚧 85% Concluído | Março 2026 |
| **v2.0.0** | Dashboard Interativo, KPIs, Exportação CSV, Testes E2E (Playwright). | ⏳ Planejado | — |
| **v3.0.0** | Metas Financeiras, Relatórios PDF, Agendamento e Notificação. | ⏳ Planejado | — |
| **v4.0.0** | Aplicativo Mobile React Native integrado, Notificações Push, Modo Offline. | ⏳ Planejado | — |

### ⚠️ O Que NÃO Vai Fazer (Decisões de Escopo Justificadas)
* **Kubernetes (K8s):** Desnecessário para a escala atual de MVP. A orquestração via Docker Compose é suficiente para desenvolvimento local e o custo-benefício de K8s na nuvem não se justifica nesta fase.
* **Microserviços:** Manteremos um monólito modular estruturado (Maven Multi-Module). A complexidade operacional de microserviços (latência de rede, consistência eventual, orquestração de transações distribuídas como Sagas) introduziria overhead sem valor real de negócio para o estágio atual.

---

## 📚 Lessons Learned — O Que Aprendi & Por Quê Importa

Durante o desenvolvimento desta plataforma educacional, foram enfrentados desafios reais de engenharia de software que consolidaram os seguintes aprendizados:

### 1. Versionamento de Tokens (Token Versioning)
* **Desafio:** Como invalidar tokens JWT de forma eficiente sem manter uma tabela de sessões ativas no banco de dados (o que anularia a natureza stateless do JWT).
* **Solução:** Adição de uma propriedade `tokenVersion` (inteiro) na tabela de `User` e como claim do JWT. A cada logout ou mudança de senha, essa versão é incrementada no banco. O filtro de segurança lê o token e rejeita requisições se a versão contida no JWT for menor que a versão atual do banco do usuário. Isso permite expiração imediata com custo de busca mínimo indexado por ID do usuário.

### 2. Separação de Conceitos com Maven Multi-Module
* **Desafio:** Prevenir vazamento de escopo técnico, como classes de infraestrutura (acesso a arquivos, drivers externos) sendo instanciadas diretamente por controladores de API.
* **Solução:** Divisão física do projeto em três sub-módulos: `api`, `core` e `infra`. A dependência é unidirecional: `api` depende apenas de `core`. Dessa forma, o compilador do Java previne erros arquiteturais em tempo de compilação, forçando o uso de injeção de dependência via interfaces.

### 3. Integridade Estrutural com Flyway
* **Desafio:** Erros frequentes em ambientes de desenvolvimento e CI causados por divergência de esquemas de banco de dados entre branches de feature distintas.
* **Solução:** Adoção de migrações gerenciadas com o Flyway. Toda alteração de tabela é versionada em arquivos `.sql` e aplicada de forma transacional no start do Spring. Isso garante que o banco de dados de teste (Testcontainers) tenha exatamente a mesma estrutura do banco de produção.

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

**⭐ Se este projeto te ajudou a entender padrões corporativos de mercado, deixe uma estrela no repositório!**
