# Gestor de Finanças Pessoais 💰

**Um gerenciador de finanças pessoais de nível empresarial com foco em segurança, precisão e integridade de dados.**

---

## 📋 Título e Descrição

O **Gestor de Finanças Pessoais** é uma aplicação full-stack desenvolvida para oferecer controle granular sobre receitas, despesas e patrimônio pessoal. Ele foi criado com a mesma rigorosidade de segurança e precisão exigida por sistemas financeiros corporativos, resolvendo o problema da falta de exatidão e confiabilidade nas aplicações financeiras comuns. 

O sistema lida com dinheiro utilizando cálculos de precisão estrita (sem uso de ponto flutuante, evitando erros de arredondamento) e protege o acesso com um robusto sistema de autenticação e proteção CSRF. A interface é renderizada diretamente no servidor (Server-Side Rendering), proporcionando um carregamento extremamente rápido e mantendo a lógica de negócios segura no backend.

### Características Principais
- 💳 Gerenciamento de transações com precisão monetária (`BigDecimal`).
- 🔐 Autenticação JWT estrita (cookies HttpOnly, rotação de tokens).
- 🛡️ Proteção robusta contra CSRF.
- 🎨 Interface fluida com renderização HTML no lado do servidor (Thymeleaf), tema adaptável (claro/escuro - Solarized) via CSS.
- 🧪 Ampla cobertura de testes (Testcontainers para banco de dados).
- 🚀 Suporte a PWA offline para assets estáticos.

---

## 🛠️ Tecnologias Utilizadas

O projeto adota uma arquitetura clássica sem frameworks complexos no frontend, centralizando a lógica no ecossistema Spring:

- **Linguagem Principal:** Java 21
- **Backend Framework:** Spring Boot 3.2 (Web, Security, Data JPA, Validation)
- **Banco de Dados:** PostgreSQL 15
- **Renderização de Páginas (SSR):** Thymeleaf (com HTML e CSS puros)
- **Gerenciador de Dependências:** Maven
- **Migrações de Banco de Dados:** Flyway
- **Testes:** JUnit 5, MockMvc e Testcontainers (banco de dados real para testes de integração).
- **Segurança & Resiliência:** Spring Security, JWT (io.jsonwebtoken), Resilience4j (Rate Limiting).
- **Containerização:** Docker e Docker Compose

---

## 📦 Pré-requisitos

Para executar e testar o projeto localmente, você precisará ter instalado em sua máquina:

- **Java 21**
- **Maven** (A ferramenta principal para build e testes)
- **Docker e Docker Compose** (Necessários para subir o banco de dados via Testcontainers e rodar o ambiente completo)
- **Git** para versionamento
- Uma ferramenta de linha de comando que suporte **OpenSSL** (para gerar os segredos do JWT)

---

## 🚀 Como Executar

### 1. Clonando o Repositório

```bash
git clone https://github.com/mathofjesus/gestor-de-financas-pessoais.git
cd gestor-de-financas-pessoais
```

### 2. Configurando o Ambiente

Copie o arquivo de exemplo para gerar suas próprias variáveis de ambiente:

```bash
cp .env.example .env
```
Edite o arquivo `.env` para inserir uma senha para o banco de dados (`POSTGRES_PASSWORD`) e gerar um segredo JWT. 
Para gerar um segredo forte e válido (sem quebras de linha), execute:
```bash
openssl rand -base64 64 | tr -d '\n'
```
Copie o resultado e insira na variável `JWT_SECRET` no arquivo `.env`.

### 3. Rodando com Docker Compose (Modo Produção/Padrão)

Esta é a maneira mais simples de rodar a aplicação completa (Banco de Dados + Aplicação Web).

```bash
docker compose up -d
```
A aplicação estará acessível em: `http://localhost:8080`.

### 4. Rodando Localmente (Modo Desenvolvimento)

Se você desejar rodar a aplicação para desenvolvimento diretamente com Maven (usa banco H2 em memória, tabelas são dropadas a cada execução, migrações do Flyway desativadas):

Primeiro, exporte o seu secret JWT (Necessário para qualquer execução do backend):
```bash
export JWT_SECRET="sua-chave-gerada-aqui"
```

Em seguida, dentro do diretório `backend`, execute os comandos abaixo:
```bash
cd backend
mvn spring-boot:run -pl financeapp-api -Pdev -Dspring-boot.run.profiles=dev
```
Acesse: `http://localhost:8080`. O console do banco H2 fica disponível em `http://localhost:8080/h2-console`.

### 5. Executando os Testes

Para rodar todos os testes de unidade e de integração, você **precisa ter o daemon do Docker rodando** na sua máquina, já que os repositórios usam a imagem PostgreSQL via Testcontainers.

Lembre-se de definir a variável de ambiente JWT_SECRET caso não tenha exportado no passo anterior.
```bash
cd backend
export JWT_SECRET="sua-chave-gerada-aqui"
mvn test
```
Para realizar a verificação de código (incluindo testes), formatação (Spotless) e geração de relatórios de cobertura (JaCoCo):
```bash
cd backend
mvn clean verify
```

---

## 🏗️ Estrutura do Projeto

O projeto é modularizado pelo Maven, separando claramente a lógica de negócios da camada web:

```
gestor-de-financas-pessoais/
├── backend/
│   ├── financeapp-api/        # Camada de Apresentação (Web) e Configuração
│   │   └── src/main/
│   │       ├── java/.../api/web/ # Controladores MVC (Web controllers) e Segurança
│   │       └── resources/
│   │           ├── db/migration/ # Scripts SQL do Flyway
│   │           ├── static/       # CSS (Solarized), SVGs, ícones e sw.js (PWA)
│   │           └── templates/    # HTMLs renderizados pelo Thymeleaf
│   │
│   └── financeapp-core/       # Camada de Domínio e Lógica de Negócios
│       └── src/main/java/.../
│           ├── model/         # Entidades JPA (User, Account, Transaction, etc)
│           ├── repository/    # Interfaces do Spring Data JPA
│           └── service/       # Lógica de negócios isolada e utilitários (ex: JwtUtil)
│
├── docker-compose.yml         # Arquivo de orquestração local de infraestrutura
└── .env.example               # Exemplo de configuração de ambiente e segredos
```
*Nota: Não existem dependências de bibliotecas de frontend (Node.js/npm). Toda a interface gráfica foi desenvolvida com HTML/CSS puro, entregue via Server-Side Rendering (SSR) pelo `financeapp-api`.*

---

## 🤝 Como Contribuir

Toda ajuda é bem-vinda! Siga estes passos para contribuir:

1. **Faça um Fork** do projeto.
2. **Crie uma branch** para sua feature ou correção:
   ```bash
   git checkout -b feature/minha-nova-funcionalidade
   ```
3. **Padrões de Código:** O projeto usa a ferramenta **Spotless** para garantir a formatação (Google Java Format).
   Para aplicar a formatação correta ao seu código alterado, rode dentro do diretório `backend/`:
   ```bash
   mvn spotless:apply
   ```
4. **Comite suas mudanças** usando mensagens claras (O Padrão *Conventional Commits* é recomendado):
   ```bash
   git commit -m "feat: adicionar exportação de relatórios em CSV"
   ```
5. **Faça um Push** para a sua branch:
   ```bash
   git push origin feature/minha-nova-funcionalidade
   ```
6. **Abra um Pull Request** no repositório original descrevendo as mudanças feitas.

**Dica CRÍTICA**: Antes de abrir o Pull Request, garanta que todos os testes estejam passando executando `mvn clean verify` no diretório `backend/`.

---

**Mantido por Matheus**

`v1.0.0` | Última atualização: 2026