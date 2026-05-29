# 🚀 SETUP, EXECUÇÃO E DEPLOYMENT

> Guia completo para iniciar, executar e fazer deploy da aplicação

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Inicial](#setup-inicial)
3. [Executar Localmente](#executar-localmente)
4. [Testes](#testes)
5. [Troubleshooting](#troubleshooting)
6. [Deployment](#deployment)

---

## Pré-requisitos

### Software Necessário

```bash
✓ Node.js ≥ 18.x
✓ npm ≥ 10.8.2
✓ Docker + Docker Compose
✓ Git
✓ PostgreSQL 15+ (in Docker)
```

### Verificar Instalação

```bash
# Node.js e npm
node --version  # v18.x.x ou superior
npm --version   # 10.8.x ou superior

# Docker
docker --version
docker-compose --version

# Git
git --version
```

---

## Setup Inicial

### 1️⃣ Clone e Dependências

```bash
# Clone repositório
git clone <REPO_URL>
cd sistema-selecao

# Instala dependências (workspace raiz + apps + packages)
npm install
# ✅ Instala tudo em: root, apps/web, apps/server, packages/*
```

### 2️⃣ Configurar Variáveis de Ambiente

**Arquivo: `.env` (raiz do projeto)**

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema-de-banca

# Frontend API URL
VITE_API_URL=http://localhost:9000

# Email (SMTP)
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=app-password-from-gmail
NODE_ENV=development

# JWT Secret
JWT_SECRET=sua-chave-secreta-muito-segura-com-min-32-chars-aqui

# Frontend URL (para links em emails)
FRONTEND_URL=http://localhost:5173
```

**Para Gmail (Recomendado em Produção):**

1. Habilite 2FA na conta Google
2. Gere "App Password" em https://myaccount.google.com/apppasswords
3. Use app password em `SMTP_PASSWORD`

**Em Desenvolvimento:** Deixar `NODE_ENV=development` usa Ethereal (test email service)

### 3️⃣ Iniciar Banco PostgreSQL

```bash
# Suba container PostgreSQL
npm run docker:up
# ✅ Inicia "sistema-de-banca-postgres" em localhost:5432

# Aguarde 10 segundos para banco estar pronto
sleep 10

# Verifique se está rodando
docker ps | grep sistema-de-banca-postgres
```

### 4️⃣ Configurar Schema do Banco

```bash
# Opção A: DB Push (Recomendado - mais simples)
npm run db:push
# ✅ Sincroniza schema.ts com database automaticamente

# Opção B: Migrations Manuais
npm run migration:run
# ✅ Executa todas as migrations SQL
```

### 5️⃣ Seed de Dados de Teste (Opcional)

```bash
cd apps/server

# Seed dados de teste
npm run seed
# ✅ Insere usuários de teste, cursos, bancas

# Usuários de teste criados:
# - professor@example.com / password123 (TEACHER)
# - aluno@example.com / password123 (STUDENT)
# - admin@example.com / password123 (ADMIN)
```

### 6️⃣ Verifique Banco

```bash
# Conectar ao psql
npm run docker:connect

# Dentro do psql:
\dt                          # Lista tabelas
SELECT * FROM users;         # Verifica users
\q                           # Sair
```

### ✅ Setup Completo!

```bash
# Volte para raiz
cd ../..

# Verifique se tudo está pronto
npm run tscheck
# ✅ Sem erros TypeScript
```

---

## Executar Localmente

### Modo Desenvolvimento (Recomendado)

```bash
# Terminal 1: Raiz do projeto
npm run dev

# ✅ Inicia AMBOS frontend e backend em paralelo
# Frontend: http://localhost:5173
# Backend: http://localhost:9000

# ⏳ Aguarde ambos iniciarem (30-60 segundos)

# ✅ Frontend pronto quando ver:
#   > [vite] server started

# ✅ Backend pronto quando ver:
#   > Listening on http://localhost:9000
```

### Verificação Rápida

```bash
# Abra novo terminal

# ✅ 1. Frontend acessível
curl http://localhost:5173
# Retorna HTML

# ✅ 2. Backend acessível (sem auth)
curl http://localhost:9000/cursos
# Retorna JSON array

# ✅ 3. Teste com auth (depois de fazer login)
TOKEN="seu-jwt-token-aqui"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/usuario/me
```

### Browser

Abra http://localhost:5173 no navegador

```
Você verá:
├─ Homepage com botão "Entrar"
├─ Se logado: Dashboard com defesas
└─ Se não logado: Formulário de login
```

---

## Testes

### Backend: Unit Tests (Vitest)

```bash
cd apps/server

# Rodar testes
npm run test
# ✅ Executa testes com TUI interativo

# Rodando testes específicos
npm run test -- auth.test
# Apenas testes auth

# Coverage
npm run test -- --coverage
# Mostra % de code coverage

# Watch mode
npm run test -- --watch
# Re-roda ao salvar arquivos
```

### Frontend: E2E Tests (Playwright)

```bash
cd apps/web

# Modo headless (sem UI)
npm run test
# ✅ Roda testes em headless Chrome

# Modo UI visual
npm run test:ui
# Abre Playwright Test Reporter com UI

# Modo headed (navegador visível)
npm run test:headed
# Executa com navegador visível para debug

# Debug mode
npm run test:debug
# Abre Playwright inspector

# Ver último relatório
npm run test:report
```

### Testes Completos (Workspace)

```bash
# Raiz do projeto
npm run test
# ✅ Executa testes backend + frontend via Turbo

npm run test:e2e
# Apenas frontend E2E tests
```

### Escrever Novo Teste

**Backend (Vitest):**

```typescript
// apps/server/src/modules/usuario/usuario.test.ts
import { describe, it, expect } from "vitest"
import { createUser } from "./usuario.service"

describe("User Service", () => {
  it("deve criar novo usuário", async () => {
    const userData = {
      email: "novo@test.com",
      password: "senha123",
      nome: "Teste",
      matricula: "202300001",
    }

    const result = await createUser(mockContext, userData)

    expect(result.ok).toBe(true)
    expect(result.data?.email).toBe("novo@test.com")
  })

  it("deve rejeitar email duplicado", async () => {
    // ...
  })
})
```

**Frontend (Playwright):**

```typescript
// apps/web/tests/login.spec.ts
import { test, expect } from "@playwright/test"

test("deve fazer login com credenciais válidas", async ({ page }) => {
  await page.goto("http://localhost:5173/login")

  await page.fill("input[type=email]", "professor@example.com")
  await page.fill("input[type=password]", "password123")
  await page.click("button:has-text('Entrar')")

  await expect(page).toHaveURL("http://localhost:5173/dashboard")
})
```

---

## Troubleshooting

### Erro: `DATABASE_URL not set`

**Causa:** Variável de ambiente não configurada

**Fix:**

```bash
# Verifique .env existe
cat .env

# Se não existir, crie
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema-de-banca" >> .env

# Recarregue variáveis (terminal new)
npm run db:push
```

### Erro: `connection refused localhost:5432`

**Causa:** PostgreSQL não está rodando

**Fix:**

```bash
# Verifique se container está up
docker ps

# Se não está, inicie
npm run docker:up

# Aguarde 10 segundos
sleep 10

# Teste conexão
npm run docker:connect
# Se conectar → OK
```

### Erro: `listen EADDRINUSE 5173` ou `9000`

**Causa:** Porta já em uso

**Fix:**

```bash
# Encontre o processo na porta
lsof -i :5173    # Frontend
lsof -i :9000    # Backend

# Mate o processo
kill -9 <PID>

# OU use outra porta
VITE_PORT=5174 npm run dev
PORT=9001 npm run dev:server
```

### Erro: `Cannot find module '@tcc/server'` no frontend

**Causa:** TypeScript não conhece types do servidor

**Fix:**

```bash
# Reconstrua workspace
npm install

# Type checking clean
npm run tscheck

# Limpe node_modules
rm -rf node_modules
npm install
```

### Erro: `CORS bloqueia requisição`

**Symptoms:** Console browser mostra "Access to XMLHttpRequest blocked by CORS"

**Cause:** Backend.cors() não permitindo frontend URL

**Fix:** Backend já tem `cors()` aberto para todos (*)

```bash
# Se ainda falhar:
# 1. Verifique VITE_API_URL em .env
echo $VITE_API_URL  # Deve ser http://localhost:9000

# 2. Verifique frontend consegue acessar backend
curl http://localhost:9000

# 3. Se backend não está rodando, inicie
npm run dev
```

### Erro: `Testes falhando com "Cannot find module"`

**Cause:** Dependências não instaladas

**Fix:**

```bash
# Clean install
npm ci

# Compile TypeScript
npm run tscheck

# Rode testes novamente
npm run test
```

### Erro: `Email não está sendo enviado`

**Cause:** SMTP não configurado

**Fix:**

```bash
# Em desenvolvimento (NODE_ENV=development):
# Ethereal é usado automaticamente
# Verifique console para preview URL:
# "Preview URL: https://ethereal.email/message/..."

# Em produção (NODE_ENV=production):
# 1. Verifique SMTP_USER e SMTP_PASSWORD em .env
# 2. Se Gmail: confirme app password está correto
# 3. Verifique 2FA está habilitado

# Teste:
cd apps/server
npm run dev  # Veja logs
# Acione envio de email no navegador
# Verifique console backend
```

### Erro: `Migrations falhando`

**Cause:** Schema fora de sync com banco

**Fix:**

```bash
# Opção 1: Reset completo (⚠️ delete tudo)
npm run docker:clean
npm run docker:up
npm run db:push

# Opção 2: Push schema atual
npm run db:push

# Opção 3: Migrations manual
npm run migration:drop    # Drop tudo
npm run migration:run     # Reexecuta

# Opção 4: Studio visual
npm run db:studio
# Abre GUI em http://localhost:3000
```

---

## Deployment

### Build para Produção

```bash
# Compile tudo
npm run build

# Cria: 
# ├─ apps/web/dist/    (frontend SSR-ready)
# ├─ apps/server/dist/ (backend bundled)
# └─ ...

# Verifica size
du -sh apps/web/dist apps/server/dist
```

### Deploy em Dokku (PaaS - Recomendado)

Este projeto está configurado para deploy em Dokku (Heroku-like).

**Pré-setup (uma única vez):**

```bash
# Crie dois apps no servidor Dokku:
# 1. sistema-de-banca-web   (frontend)
# 2. sistema-de-banca-server (backend)

# Configure remotes
git remote add dokku-web dokku@seu-servidor:sistema-de-banca-web
git remote add dokku-server dokku@seu-servidor:sistema-de-banca-server

# Configure env vars no Dokku:
dokku config:set sistema-de-banca-server DATABASE_URL=...
dokku config:set sistema-de-banca-server JWT_SECRET=...
# etc.
```

**Deploy automático:**

```bash
# Raiz do projeto
npm run deploy

# Script (`scripts/deploy.ts`):
# 1. Sincroniza branches production-web/server com main
# 2. Faz push para Dokku
# 3. Dokku auto-compila e inicia

# ✅ After:
# Frontend: https://seu-dominio.com/
# Backend: https://api.seu-dominio.com/
```

**Manual deploy:**

```bash
# Deploy frontend
npm run push:web
# Faz git push para production-web
# Dokku detecta, compila (create-react-app), inicia

# Deploy backend
npm run push:server
# Faz git push para production-server
# Dokku detecta, compila Node.js, inicia
```

### Deploy com Docker Compose (Self-Hosted)

**Arquivo: `docker-compose.prod.yml`\**

```yaml
version: "3.8"

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: sistema-de-banca
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./apps/server
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:secure_password@database:5432/sistema-de-banca
      JWT_SECRET: super-secret-key
      NODE_ENV: production
    ports:
      - "9000:9000"
    depends_on:
      - database

  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:9000
    ports:
      - "80:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Deploy:**

```bash
# Build e start
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Verificação Pós-Deploy

```bash
# Acesse frontend
curl https://seu-dominio.com/

# Teste API
curl https://api.seu-dominio.com/cursos

# Teste login
curl -X POST https://api.seu-dominio.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password"}'
```

### Monitoramento Produção

```bash
# Logs real-time
dokku logs sistema-de-banca-server -t

# Restart se necessário
dokku ps:restart sistema-de-banca-server

# Check status
dokku ps:report sistema-de-banca-server

# Database backup
dokku postgres:export sistema-de-banca > backup.sql
```

### Troubleshooting Deployment

**Erro: Build falha**

```bash
# Verifique logs
dokku logs sistema-de-banca-server

# Trigger rebuild
git push dokku-server production-server:master --force
```

**Erro: Server não inicia**

```bash
# Verifique env vars
dokku config:show sistema-de-banca-server

# Adicione var faltante
dokku config:set sistema-de-banca-server VAR_NAME=value

# Restart
dokku ps:restart sistema-de-banca-server
```

**Erro: Database não conecta**

```bash
# Verifique migrations rodaram
dokku run sistema-de-banca-server npm run migration:run

# Se tiver erro, debug:
dokku run sistema-de-banca-server npm run db:push

# Check status
dokku postgres:info sistema-de-banca
```

---

## Resumo Rápido

### Primeira Vez

```bash
git clone ...
cd sistema-selecao
npm install
echo "DATABASE_URL=..." >> .env
npm run docker:up
npm run db:push
npm run dev
# Abre http://localhost:5173
```

### Desenvolvimento Diário

```bash
npm run dev                  # Inicia frontend + backend
npm run test                 # Roda testes
npm run tscheck              # Type checking
npm run db:studio            # View/edit database GUI
```

### Antes de Commit

```bash
npm run tscheck              # Sem erros TypeScript?
npm run test                 # Testes passando?
npm run build                # Build sem erros?
git add .
git commit -m "..."
```

### Deploy

```bash
npm run deploy               # Dockerfile push a Dokku
# Ou manualmente:
npm run push:web
npm run push:server
```

---

## Dúvidas Frequentes

**Q: Como resetar banco completamente?**

A: `npm run docker:clean && npm run docker:up && npm run db:push`

**Q: Como ver o banco em GUI?**

A: `npm run db:studio` → http://localhost:3000

**Q: Como conectar ao psql?**

A: `npm run docker:connect`

**Q: Como rodar testes sem servidor rodando?**

A: `npm run test` → playwright inicia servidores automaticamente

**Q: Como mudar porta do frontend/backend?**

A: `VITE_PORT=5174 npm run dev` ou `PORT=9001 npm run dev:server`

**Q: Produto e desenvolvimento usam mesmo banco?**

A: NÃO! Produção tem DATABASE_URL diferente (config Dokku)
