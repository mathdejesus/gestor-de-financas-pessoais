# Diagnóstico e Solução de Erros CI/CD \- Financial Management Platform

**Data:** Junho 2026  
**Projeto:** Financial Management Platform  
**Repositório:** [https://github.com/mathdejesus/gestor-de-financas-pessoais](https://github.com/mathdejesus/gestor-de-financas-pessoais)  
**Status:** Erros identificados em pipeline GitHub Actions (frontend e mobile)

---

## RESUMO EXECUTIVO

O projeto tem **3 problemas críticos** no CI/CD:

| Problema | Causa | Impacto | Severidade |
| :---- | :---- | :---- | :---- |
| Frontend falha em npm ci | `package-lock.json` não existe no diretório `frontend/` | Build quebrado | 🔴 CRÍTICA |
| Conflito de versões de tooling | `@commitlint/cli`, `lint-staged`, `prettier` duplicados | Instabilidade de deps | 🟠 ALTA |
| Mobile quebra pipeline | Workspace Expo incompatível \+ projeto é web-only | Falsa complexidade | 🟠 ALTA |

---

## PARTE 1: DIAGNÓSTICO DETALHADO

### 1.1 Problema: Frontend não encontra `package-lock.json`

**O que está acontecendo:**

O arquivo `package.json` da raiz declara:

{

  "workspaces": \[

    "frontend",

    "mobile"

  \]

}

Com npm workspaces, **existe apenas UM arquivo `package-lock.json`** na raiz do projeto.

No `.github/workflows/ci.yml`, o step "Install dependencies" está configurado assim:

test-frontend:

  defaults:

    run:

      working-directory: frontend

  steps:

    \- name: Install dependencies

      run: npm ci

    \# npm ci procura por package-lock.json

    \# Procura em: frontend/package-lock.json (NÃO EXISTE)

**Resultado:** Erro imediato

npm error The \`npm ci\` command can only install with an 

existing package-lock.json or npm-shrinkwrap.json

npm ERR\! code EWORKSPACEMISSING

**Raiz do problema:**

- Workspace requer UM lockfile na raiz  
- CI tenta usar `npm ci` em subdiretório  
- Subdiretório não tem seu próprio lockfile  
- ❌ Incompatibilidade entre modelo de workspace e script de CI

---

### 1.2 Problema: Conflito de versões de dependências compartilhadas

**O que está acontecendo:**

Arquivo `package.json` (raiz):

"devDependencies": {

  "@commitlint/cli": "^19.3.0",

  "@commitlint/config-conventional": "^19.2.2",

  "husky": "^9.1.7",

  "lint-staged": "^15.2.7",

  "prettier": "^3.8.3"

}

Arquivo `frontend/package.json`:

"devDependencies": {

  "@commitlint/cli": "^21.0.2",      // ← CONFLITA

  "@commitlint/config-conventional": "^21.0.2",  // ← CONFLITA

  "husky": "^9.1.7",

  "lint-staged": "^17.0.7",          // ← CONFLITA

  "prettier": "^3.8.3",

  // ... mais deps do frontend

}

**Resultado:**

- npm resolve ambas, mas com versões diferentes em contextos diferentes  
- Husky pode procurar versão errada de commitlint  
- Prettier pode ter comportamento inconsistente  
- lint-staged não encontra ESLint na versão esperada

**Raiz do problema:**

- Mesma ferramenta de tooling declarada em 2 lugares  
- Versões incompatíveis (^19 vs ^21, ^15 vs ^17)  
- npm workspace tenta resolver tudo em um único grafo de dependências  
- ❌ Duplicação desnecessária causa conflito

---

### 1.3 Problema: Mobile (Expo) quebra o pipeline

**O que está acontecendo:**

Arquivo `mobile/package.json` existe e contém:

{

  "dependencies": {

    "expo": "\~56.0.9",

    "react-native": "0.85.3",

    "expo-secure-store": "\~56.0.4"

  },

  "scripts": {

    "start": "expo start",

    "android": "expo start \--android",

    "ios": "expo start \--ios",

    "web": "expo start \--web"

  }

}

Arquivo `.github/workflows/ci.yml` tenta:

test-mobile:

  steps:

    \- name: Check TypeScript

      run: npx tsc \--noEmit

      working-directory: mobile

    

    \- name: Check formatting

      run: npx prettier \--check "src/\*\*/\*.{ts,tsx}"

      working-directory: mobile

**Problema 1:** `npx tsc` tenta resolver `expo/tsconfig.base` (do `tsconfig.json`):

{

  "extends": "expo/tsconfig.base"

}

Mas Expo não foi instalado corretamente no workspace.

**Problema 2:** **O requisito do projeto é "exclusivamente web"**

Foco primário é o mobile first

Ele será disponibilizado exclusivamente em navegador web

Expo (React Native) é para apps nativos iOS/Android. **Completamente incompatível** com "navegador web".

**Resultado:**

- CI falha tentando compilar Expo no Ubuntu (sem emulador)  
- Pasta `mobile/` deveria não existir em projeto web  
- Pipeline perde tempo processando algo que será deletado  
- ❌ Decisão arquitetural (web-only) entra em conflito com workspace

---

## PARTE 2: SOLUÇÃO COMPLETA

### 2.1 Passo 1: Remover workspace `mobile/`

A pasta `mobile/` deve ser **deletada permanentemente** do repositório, pois:

- Projeto é web-only (requisito confirmado)  
- Mobile será implementado em V4, com tecnologia diferente  
- Atualmente causa problemas de CI sem benefício

**Como fazer:**

Opção A: Deletar diretamente (se não há histórico valioso):

git rm \-r mobile/

git commit \-m "chore: remove mobile workspace (web-only project, v4 later)"

git push origin main

Opção B: Arquivar em branch separada (mais seguro):

\# Criar branch de arquivo antes de deletar

git checkout \-b archive/mobile-rn-v0

git push origin archive/mobile-rn-v0

\# Voltar para main e deletar

git checkout main

git rm \-r mobile/

git commit \-m "chore: remove mobile workspace (archived in branch archive/mobile-rn-v0)"

git push origin main

**Depois de deletar, o package.json raiz muda para:**

{

  "name": "financial-management-platform",

  "private": true,

  "scripts": {

    "prepare": "husky",

    "lint": "npm run lint \--prefix frontend",

    "test": "npm run test \--prefix frontend",

    "build": "npm run build \--prefix frontend"

  },

  "devDependencies": {

    "@commitlint/cli": "^19.3.0",

    "@commitlint/config-conventional": "^19.2.2",

    "husky": "^9.1.7",

    "lint-staged": "^15.2.7",

    "prettier": "^3.8.3"

  }

}

**Mudanças importantes:**

- ❌ Remove: `"workspaces": ["frontend", "mobile"]`  
- ✅ Adiciona: `scripts` com `--prefix frontend` para chamar frontend  
- ✅ Mantém: tooling compartilhado (Husky, commitlint, prettier)

---

### 2.2 Passo 2: Limpar `frontend/package.json`

O frontend deve **gerenciar suas próprias dependências**, não compartilhar tooling com a raiz.

Remove estas linhas de `frontend/devDependencies`:

  "devDependencies": {

\-   "@commitlint/cli": "^21.0.2",

\-   "@commitlint/config-conventional": "^21.0.2",

    "@eslint/js": "^9.0.0",

    "@tailwindcss/vite": "^4.3.0",

    "@testing-library/dom": "^10.4.1",

    "@testing-library/jest-dom": "^6.9.1",

    "@testing-library/react": "^16.3.2",

    "@testing-library/user-event": "^14.6.1",

    "@types/node": "^24.12.3",

    "@types/react": "^19.2.14",

    "@types/react-dom": "^19.2.3",

    "@vitejs/plugin-react": "^6.0.1",

    "@vitest/coverage-v8": "^4.1.8",

    "autoprefixer": "^10.5.0",

    "eslint": "^9.7.0",

    "eslint-config-prettier": "^10.1.8",

    "eslint-plugin-react": "^7.35.0",

    "eslint-plugin-react-hooks": "^5.2.0",

    "eslint-plugin-react-refresh": "^0.5.2",

    "globals": "^17.6.0",

\-   "husky": "^9.1.7",

    "jsdom": "^29.1.1",

\-   "lint-staged": "^17.0.7",

    "postcss": "^8.5.15",

\-   "prettier": "^3.8.3",

    "tailwindcss": "^4.3.0",

    "typescript": "\~6.0.2",

    "typescript-eslint": "^8.59.2",

    "vite": "^8.0.12",

    "vitest": "^4.1.8"

  }

**Por que remover?**

- Raiz já gerencia Husky, commitlint, prettier (centralizados)  
- Frontend não precisa de suas próprias versões  
- Evita conflito de versões  
- Reduz tamanho de `node_modules` do frontend

---

### 2.3 Passo 3: Regenerar lockfiles

Depois de alterar `package.json` (raiz) e `frontend/package.json`, **regenere os lockfiles**:

**Na raiz do projeto:**

rm package-lock.json

npm install

**No diretório frontend:**

cd frontend

rm package-lock.json

npm install

cd ..

**Resultado esperado:**

- `package-lock.json` (raiz) — 50-100 linhas, só tooling  
- `frontend/package-lock.json` — 3000+ linhas, todas as deps do frontend

---

### 2.4 Passo 4: Atualizar `.github/workflows/ci.yml`

**Arquivo completo atualizado:**

name: CI/CD Pipeline

on:

  push:

    branches: \[main, develop\]

  pull\_request:

    branches: \[main, develop\]

jobs:

  \# \============================================

  \# JOB 1: Testes Frontend

  \# \============================================

  test-frontend:

    name: Test Frontend

    runs-on: ubuntu-latest

    steps:

      \- name: Checkout code

        uses: actions/checkout@v4

      \- name: Setup Node.js

        uses: actions/setup-node@v4

        with:

          node-version: '22'

          cache: 'npm'

          cache-dependency-path: frontend/package-lock.json

      \- name: Install root dependencies (tooling only)

        run: npm ci

      \- name: Install frontend dependencies

        working-directory: frontend

        run: npm ci

      \- name: Run linter

        working-directory: frontend

        run: npm run lint

      \- name: Check formatting

        working-directory: frontend

        run: npm run format:check

      \- name: Run tests

        working-directory: frontend

        run: npm run test \-- \--run

      \- name: Build frontend

        working-directory: frontend

        run: npm run build

      \- name: Upload build artifacts

        if: always()

        uses: actions/upload-artifact@v4

        with:

          name: frontend-build

          path: frontend/dist/

  \# \============================================

  \# JOB 2: Testes Backend

  \# \============================================

  test-backend:

    name: Test Backend

    runs-on: ubuntu-latest

    services:

      postgres:

        image: postgres:15-alpine

        env:

          POSTGRES\_DB: financial\_platform\_test

          POSTGRES\_USER: postgres

          POSTGRES\_PASSWORD: postgres

        ports:

          \- 5432:5432

        options: \>-

          \--health-cmd pg\_isready

          \--health-interval 10s

          \--health-timeout 5s

          \--health-retries 5

    steps:

      \- name: Checkout code

        uses: actions/checkout@v4

      \- name: Setup Java

        uses: actions/setup-java@v4

        with:

          java-version: '21'

          distribution: 'temurin'

          cache: 'maven'

      \- name: Run backend tests

        working-directory: backend

        run: mvn clean verify \-Ptest

        env:

          SPRING\_DATASOURCE\_URL: jdbc:postgresql://localhost:5432/financial\_platform\_test

          SPRING\_DATASOURCE\_USERNAME: postgres

          SPRING\_DATASOURCE\_PASSWORD: postgres

          JWT\_SECRET: dGVzdC1zZWNyZXQta2V5LWZvci1jaS1vbmx5LW5vdC1wcm9kdWN0aW9u

      \- name: Upload coverage reports

        if: always()

        uses: actions/upload-artifact@v4

        with:

          name: backend-coverage

          path: backend/\*\*/target/site/jacoco/

  \# \============================================

  \# JOB 3: Build Docker

  \# \============================================

  build-docker:

    name: Build Docker Images

    runs-on: ubuntu-latest

    needs: \[test-frontend, test-backend\]

    steps:

      \- name: Checkout code

        uses: actions/checkout@v4

      \- name: Build backend Docker image

        run: docker build \-t financeapp-backend:ci ./backend

      \- name: Build frontend Docker image

        run: docker build \-t financeapp-frontend:ci ./frontend

  \# \============================================

  \# JOB 4: Verificação Final

  \# \============================================

  verify:

    name: All Checks Passed

    runs-on: ubuntu-latest

    needs: \[test-frontend, test-backend, build-docker\]

    steps:

      \- name: Final verification

        run: echo "✅ All CI/CD checks passed \- ready to merge"

**Mudanças principais:**

| Antes | Depois | Motivo |
| :---- | :---- | :---- |
| `test-mobile` job | ❌ Removido | Mobile app deletado |
| `defaults.run.working-directory` | ❌ Removido | Usar `working-directory` por step é mais claro |
| `needs: [test-frontend, test-backend]` | ✅ Adicionado em `build-docker` e `verify` | Garante ordem de execução |
| Sem install da raiz | ✅ `npm ci` da raiz adicionado | Instala tooling (Husky, commitlint, prettier) |
| `cache-dependency-path: mobile/package-lock.json` | ❌ Removido | Mobile não existe mais |

---

### 2.5 Passo 5: Adicionar hook Git (Husky) para local

O Husky executa commitlint **localmente** antes de fazer push, ajudando a prevenir commits inválidos.

**Verificar se Husky está ativo:**

git log \--oneline \-5

\# Se vir mensagens bem formatadas (feat:, fix:, docs:, etc)

\# Husky está funcionando

**Se não estiver, reinicializar:**

npm run prepare

\# Saída esperada:

\# husky \- Git hooks installed

---

## PARTE 3: VALIDAÇÃO DA SOLUÇÃO

### 3.1 Checklist de implementação

- [ ] Deletou `mobile/` via `git rm -r mobile/`  
- [ ] Atualizou `package.json` (raiz) — removeu `workspaces`, adicionou `scripts`  
- [ ] Limpou `frontend/package.json` — removeu @commitlint, husky, lint-staged, prettier  
- [ ] Rodou `npm install` na raiz  
- [ ] Rodou `cd frontend && npm install`  
- [ ] Verificou que existem 2 lockfiles: `package-lock.json` e `frontend/package-lock.json`  
- [ ] Atualizou `.github/workflows/ci.yml` com novo arquivo  
- [ ] Deletou step `test-mobile`  
- [ ] Fez push com commit: `chore: fix ci/cd pipeline (remove mobile, fix lockfiles)`

### 3.2 Como testar localmente

**Simular o que GitHub Actions faz:**

\# Simular test-frontend

cd frontend

npm ci  \# Instala exatamente como no CI (não como npm install)

npm run lint

npm run format:check

npm run build

npm run test \-- \--run

\# Simular test-backend

cd ../backend

mvn clean verify \-Ptest

\# Simular build-docker

cd ..

docker build \-t financeapp-frontend:ci ./frontend

docker build \-t financeapp-backend:ci ./backend

**Se todos passarem:** ✅ Pronto para fazer push

---

## PARTE 4: PRÓXIMOS PASSOS PÓS-CORREÇÃO

### 4.1 Implementar Tema Solarized

Adicione ao `frontend/src/index.css`:

:root {

  /\* Solarized \- Cor Base \*/

  \--base03: \#002b36;

  \--base02: \#073642;

  \--base01: \#586e75;

  \--base00: \#657b83;

  \--base0: \#839496;

  \--base1: \#93a1a1;

  \--base2: \#eee8d5;

  \--base3: \#fdf6e3;

  /\* Cores Acentuadas \*/

  \--yellow: \#b58900;

  \--orange: \#cb4b16;

  \--red: \#dc322f;

  \--magenta: \#d33682;

  \--violet: \#6c71c4;

  \--blue: \#268bd2;

  \--cyan: \#2aa198;

  \--green: \#859900;

  /\* Modo Claro (padrão) \*/

  \--bg-primary: var(--base3);

  \--bg-secondary: var(--base2);

  \--fg-primary: var(--base00);

  \--fg-secondary: var(--base01);

  \--accent: var(--blue);

  \--border: var(--base2);

}

/\* Modo Escuro \*/

\[data-theme="dark"\] {

  \--bg-primary: var(--base03);

  \--bg-secondary: var(--base02);

  \--fg-primary: var(--base0);

  \--fg-secondary: var(--base1);

  \--accent: var(--cyan);

  \--border: var(--base02);

}

/\* Aplicar variáveis \*/

body {

  background-color: var(--bg-primary);

  color: var(--fg-primary);

  transition: background-color 0.3s, color 0.3s;

}

.card, .panel {

  background-color: var(--bg-secondary);

  border: 1px solid var(--border);

}

button.primary {

  background-color: var(--accent);

  color: var(--bg-primary);

}

/\* Escuro: adicionar ao html \*/

html\[data-theme="dark"\] {

  color-scheme: dark;

}

Componente para trocar tema:

// frontend/src/components/ThemeToggle.tsx

import { useEffect, useState } from 'react';

export function ThemeToggle() {

  const \[theme, setTheme\] \= useState\<'light' | 'dark'\>('light');

  useEffect(() \=\> {

    const saved \= localStorage.getItem('theme') as 'light' | 'dark' | null;

    const preferred \= window.matchMedia('(prefers-color-scheme: dark)').matches

      ? 'dark'

      : 'light';

    const initial \= saved || preferred;

    setTheme(initial);

    document.documentElement.setAttribute('data-theme', initial);

  }, \[\]);

  const toggle \= () \=\> {

    const newTheme \= theme \=== 'light' ? 'dark' : 'light';

    setTheme(newTheme);

    localStorage.setItem('theme', newTheme);

    document.documentElement.setAttribute('data-theme', newTheme);

  };

  return (

    \<button

      onClick={toggle}

      aria-label="Toggle theme"

      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"

    \>

      {theme \=== 'light' ? '🌙' : '☀️'}

    \</button\>

  );

}

### 4.2 Implementar Chatbot de Entrada de Dados

Componente que aceita linguagem natural e extrai campos:

// frontend/src/components/ChatbotInput.tsx

import { useState } from 'react';

import axios from 'axios';

import { transactionApi } from '../services/api';

import type { CreateTransactionRequest } from '../types';

interface ExtractedData {

  description?: string;

  amount?: number;

  type?: 'INCOME' | 'EXPENSE';

  date?: string;

  category?: string;

  confidence: number;

  missingFields: string\[\];

}

export function ChatbotInput() {

  const \[message, setMessage\] \= useState('');

  const \[loading, setLoading\] \= useState(false);

  const \[extracted, setExtracted\] \= useState\<ExtractedData | null\>(null);

  const handleSubmit \= async (e: React.FormEvent) \=\> {

    e.preventDefault();

    setLoading(true);

    try {

      // Chamar API Claude via backend para extrair dados

      const response \= await axios.post('/api/v1/transactions/extract', {

        text: message,

      });

      const data: ExtractedData \= response.data;

      setExtracted(data);

      // Se campos obrigatórios estão presentes, salvar

      if (data.amount && data.type && data.date) {

        await transactionApi.create({

          description: data.description || '',

          amount: data.amount,

          transactionType: data.type,

          transactionDate: data.date,

          categoryId: undefined,

        });

        setMessage('');

        setExtracted(null);

        // Mostrar sucesso

      }

    } catch (error) {

      console.error('Erro ao processar mensagem:', error);

    } finally {

      setLoading(false);

    }

  };

  return (

    \<div className="chatbot-container"\>

      \<form onSubmit={handleSubmit} className="chatbot-form"\>

        \<input

          type="text"

          value={message}

          onChange={e \=\> setMessage(e.target.value)}

          placeholder="Ex: Gastei 50 reais com comida hoje"

          disabled={loading}

        /\>

        \<button type="submit" disabled={loading}\>

          {loading ? 'Processando...' : 'Enviar'}

        \</button\>

      \</form\>

      {extracted && (

        \<div className="extracted-data"\>

          \<h4\>Informações extraídas:\</h4\>

          \<p\>

            \<strong\>Descrição:\</strong\> {extracted.description || 'Não informado'}

          \</p\>

          \<p\>

            \<strong\>Valor:\</strong\> R$ {extracted.amount}

          \</p\>

          \<p\>

            \<strong\>Tipo:\</strong\>{' '}

            {extracted.type \=== 'INCOME' ? 'Receita' : 'Despesa'}

          \</p\>

          \<p\>

            \<strong\>Data:\</strong\> {extracted.date}

          \</p\>

          {extracted.missingFields.length \> 0 && (

            \<div className="warning"\>

              ⚠️ Campos incompletos: {extracted.missingFields.join(', ')}

            \</div\>

          )}

          \<p className="confidence"\>

            Confiança: {Math.round(extracted.confidence \* 100)}%

          \</p\>

        \</div\>

      )}

    \</div\>

  );

}

---

## REFERÊNCIAS

| Arquivo | Ação |
| :---- | :---- |
| `package.json` (raiz) | Editar: remover `workspaces`, atualizar scripts |
| `frontend/package.json` | Editar: remover tooling duplicado |
| `.github/workflows/ci.yml` | Substituir integralmente |
| `mobile/` | Deletar via `git rm -r` |
| `frontend/package-lock.json` | Regenerar via `npm install` |
| `package-lock.json` (raiz) | Regenerar via `npm install` |

---

## CONCLUSÃO

Problema → Workspace \+ CI incompatíveis  
Solução → Remover workspace, 2 lockfiles independentes, atualizar CI  
Resultado → ✅ Build estável, pronto para mobile em V4

**Tempo estimado:** 30 minutos (implementação) \+ 5 minutos (testes)  
