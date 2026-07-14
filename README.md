# 🏦 Gestor de Finanças Pessoais (GFP)

> **Plataforma educacional full-stack** demonstrando padrões reais de engenharia de software utilizados por **bancos e fintechs brasileiras** (Itaú, Inter, Nubank). Backend **Java 21 + Spring Boot 3.2**, frontend **Preact 10 + TypeScript**, PostgreSQL, segurança com JWT + token versioning, 80%+ testes automatizados e CI/CD com GitHub Actions.

---

## 📌 Por Quê Este Projeto?

Este não é um hobby project. É um **case profissional** que replica padrões corporativos reais:

### ✅ Você Aprenderá
- **Arquitetura corporativa** → Maven multi-module separando API, Core e Infraestrutura
- **Segurança em produção** → JWT HS256 + BCrypt 12 rounds + token versioning (revogação stateless)
- **Persistência profissional** → PostgreSQL real com migrations versionadas no Flyway
- **Testes que pegam bugs** → JUnit 5 + Mockito + TestContainers (banco real) + Playwright E2E
- **Automação real** → GitHub Actions validando testes, lint e build Docker automático
- **Documentação que funciona** → OpenAPI/Swagger automático + README defensável em entrevista

### 🎯 Caso de Uso em Entrevista Técnica

**Entrevistador:** *"Como você gerencia expiração e revogação de tokens JWT sem banco de sessões?"*

**Sua resposta (com este projeto):**
```
"Implementei token versioning. Cada token JWT contém um claim 'tokenVersion'. 
Na tabela User, há um inteiro 'tokenVersion'. A cada logout ou mudança de senha, 
incremento esse inteiro. Se alguém usa token antigo, a versão não bate e rejeitamos.
Segurança + stateless + O(1) no banco (indexed lookup por user ID)."
```

**Impacto no recruiter:** ⭐⭐⭐⭐⭐ Você não copiou Stack Overflow. Entendeu trade-offs.

---

## 👥 Público-Alvo

### 🎓 Estudantes de Backend / Desenvolvedores Junior
Quer entender uma aplicação production-ready **sem atalhos**? Veja: