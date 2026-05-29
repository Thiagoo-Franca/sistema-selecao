# 🏗️ ARQUITETURA COMPLETA DO PROJETO

> **Documento Mestre**: Análise profunda de toda a arquitetura do Sistema de Gerenciamento de Banca de Defesa

## 📋 Índice

1. [Estrutura Geral](#estrutura-geral)
2. [Frontend Detalhado](#frontend-detalhado)
3. [Backend Detalhado](#backend-detalhado)
4. [Comunicação Frontend-Backend](#comunicação-frontend-backend)
5. [Banco de Dados](#banco-de-dados)
6. [Autenticação e Segurança](#autenticação-e-segurança)

---

## Estrutura Geral

### Monorepo Turborepo

```
sistema-selecao/
├── apps/
│   ├── web/                    # Frontend React Router v7 (SSR-ready)
│   ├── server/                 # Backend Hono API
│   └── yii2-organizacao-de-defesas/  # Legacy (deprecated)
├── packages/
│   ├── pdf-components/         # Componentes React para PDF
│   └── tests/                  # Utilidades de teste compartilhadas
├── scripts/
│   └── deploy.ts               # Script de deployment
├── package.json                # Workspace raiz (npm workspaces)
├── turbo.json                  # Config do Turbo task runner
└── docker-compose.yml          # PostgreSQL + serviços
```

### Stack Tecnológico Completo

**Frontend:**
- React Router v7 + SSR
- TailwindCSS v4 + Radix UI
- TanStack Query (React Query)
- React Hook Form + Zod
- Hono RPC Client (type-safe)
- Playwright (E2E tests)

**Backend:**
- Hono (lightweight HTTP framework)
- PostgreSQL + Drizzle ORM
- JWT + bcryptjs
- Zod validation
- Nodemailer
- Vitest (unit tests)

**DevOps:**
- Docker + Docker Compose
- Turborepo
- npm workspaces
- Dokku (deployment)

---

## Frontend Detalhado

### 2.1 Ciclo de Vida da Aplicação

#### Inicialização (root.tsx)

```typescript
// Layout raiz com providers
export function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
  )
  
  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
        <Toaster />  {/* Sonner notifications */}
      </QueryClientProvider>
    </html>
  )
}
```

**O que acontece:**
1. `QueryClient` criado uma única vez (singleton por renderização)
2. `QueryClientProvider` fornece client para todos os hooks
3. `Outlet` renderiza rotas
4. `Toaster` container para notificações

#### Sistema de Rotas (File-Based)

Arquivos em `app/routes/` são automaticamente rotas:

```
_index.tsx                    → /
banca.$id.tsx                → /banca/:id
banca.$id_.edit.tsx          → /banca/:id/edit
teacher-invitation.$hash.tsx → /teacher-invitation/:hash
```

**Type-safe pela convention:**
```typescript
export default function BancaDetail({ params }: Route.ComponentProps) {
  const { id } = params  // ← TypeScript sabe que 'id' é string
  // ...
}
```

### 2.2 API Client (Hono RPC)

**Arquivo: apps/web/app/services/apiClient.ts**

```typescript
import { hc } from "hono/client"
import type { AppType } from "@tcc/server"  // ← Type-safe!

const client = hc<AppType>(env.VITE_API_URL, {
  headers() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    return { Authorization: `Bearer ${token}` }
  },
})

export default client
```

**Type-Safety Automática:**
- `apiClient.auth.login.$post()` ← TypeScript valida endpoint existe
- `apiClient.banca[":id"].$get()` ← TypeScript valida param existe
- `{ json: {...} }` ← TypeScript valida schema do corpo

### 2.3 Gerenciamento de Estado

**Padrão Único:**

| Tipo | Lib | Localização | Exemplo |
|------|-----|------------|---------|
| Server State | React Query | Centralizado | `useUser()`, `useBancas()` |
| Local UI State | useState | Componente | `const [isOpen, setIsOpen] = useState(false)` |
| Auth State | localStorage | Browser | JWT token |
| URL State | useQueryParamState | URL query | `?page=2&sort=date` |

**Exemplo: Query com Cache**

```typescript
export const useBancas = (options?: { page?: number }) => {
  return useQuery({
    queryKey: ["bancas", options],  // ← Chave única
    queryFn: async () => {
      const response = await apiClient.banca.$get()
      return rpcReturn(response)
    },
    staleTime: 60 * 1000,      // Cache válido 1 min
    gcTime: 5 * 60 * 1000,     // Limpar após 5 min inativo
  })
}
```

### 2.4 Formulários e Validação

**Stack: React Hook Form + Zod**

```typescript
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type LoginData = z.infer<typeof loginSchema>

export function LoginForm() {
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  const onSubmit = (data: LoginData) => {
    // Dados garantidos como LoginData (type-safe)
    loginMutation.mutate({ json: data })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      {/* ... */}
    </form>
  )
}
```

**Validação em 2 Camadas:**
1. Client-side (Zod): Feedback imediato (UX melhor)
2. Server-side (Zod): Segurança (não confie no cliente)

### 2.5 Componentes e Organização

**Convenção de Naming:**
- **Componentes React**: PascalCase → `LoginForm.tsx`, `BancaDetail.tsx`
- **Hooks**: camelCase com prefixo `use` → `useUser()`, `useBancas()`
- **Serviços**: camelCase com sufixo `Service` → `authService.ts`

**Estrutura:**
```
components/
├── auth/                   # Autenticação
├── banca/                  # Defesas
├── calendar/               # Calendário
├── feedback/               # Feedback
├── pdf/                    # PDFs
├── ui/                     # Primitivos Radix customizados
└── users/                  # Usuários

hooks/
├── user.hooks.ts           # Queries de usuário
├── banca.hooks.ts          # Queries de banca
├── teacher-invitation.hooks.ts
└── use-query-param-state.ts  # Sincronização URL

services/
├── apiClient.ts            # Cliente Hono RPC
└── authService.ts          # Mutations de autenticação

lib/
└── utils.ts                # Helpers (cn, rpcReturn, RpcType)
```

### 2.6 Tratamento de Erros (Frontend)

**Padrão: rpcReturn helper**

```typescript
export const rpcReturn = async <T>(clientResponse: ClientResponse<T>) => {
  const data = await clientResponse.json()
  
  if (clientResponse.ok) {
    return data  // Tipado como T
  }

  // Erro Zod (validação)
  if ((data as any)?.error?.name === "ZodError") {
    const issues = (data as any).error.issues
    throw new Error(issues.map((i) => i.message).join(", "))
  }

  // Erro AppError (aplicação)
  throw new Error((data as { message: string })?.message || "Erro desconhecido")
}
```

**Uso em Hook:**

```typescript
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (request) => {
      const response = await apiClient.auth.login.$post(request)
      return rpcReturn(response)  // ← Processa erros
    },
    onSuccess: (data) => {
      storeAuthToken(data.token)
    },
    onError: (error) => {
      console.error(error.message)
    },
  })
}
```

---

## Backend Detalhado

### 3.1 Arquitetura Modular

**Padrão Consistente (cada módulo):**

```
modulo/
├── modulo.route.ts         # Rotas HTTP + validação
├── modulo.service.ts       # Lógica de negócio + BD
├── modulo.schema.ts        # Schemas Zod
├── modulo.dao.ts           # [OPT] Query builder
└── modulo.test.ts          # Testes Vitest
```

**Fluxo de Requisição:**

```
HTTP Request
  ↓
1. index.ts: Middlewares globais
   ├─ poweredBy()       → X-Powered-By header
   ├─ logger()          → Log request
   ├─ cors()            → CORS validation
   ├─ prettyJSON()      → Format response
   └─ appJwt()          → ⭐ JWT decode
  ↓
2. modulo.route.ts: Handler
   ├─ zValidator()      → Input validation
   ├─ checkRole()       → Auth check
   └─ Chama service
  ↓
3. modulo.service.ts: Lógica
   ├─ DB queries
   ├─ Validações
   └─ AppResult<T, E>
  ↓
4. Route: Mapeia resultado
   ├─ match(result.error)
   ├─ throw AppError
   └─ return c.json()
  ↓
Global ErrorHandler
  ├─ Se AppError → return status + message
  ├─ Senão → 500 Internal Error
  └─
HTTP Response
```

### 3.2 Padrão AppResult + AppError

**Error Handling Type-Safe:**

```typescript
// result.ts
type AppResult<TData, TError> = 
  | { ok: true; data: TData }
  | { ok: false; error: TError }

const ok = (data) => ({ ok: true, data })
const err = (error) => ({ ok: false, error })

// error.ts
class AppError extends Error {
  status: number  // HTTP status code
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
```

**Uso no Service:**

```typescript
export const createUser = async (
  c: Context,
  userData: CreateUserInput
): Promise<AppResult<User, CreateUserError>> => {
  try {
    // Lógica de negócio pura (sem HTTP concerns)
    const existing = await db.select().from(Users)
      .where(eq(Users.email, userData.email))
      .limit(1)

    if (existing.length > 0) {
      return err({ type: "duplicate_email" })
    }

    const passwordHash = await bcryptjs.hash(userData.password, 10)
    const [newUser] = await db.insert(Users)
      .values({ ...userData, passwordHash })
      .returning()

    return ok(newUser)
  } catch (error) {
    return err({ type: "database_error", error })
  }
}
```

**Uso na Route:**

```typescript
.post("/", zValidator("json", createUserSchema), async (c) => {
  const userData = c.req.valid("json")
  const result = await createUser(c, userData)

  if (!result.ok) {
    throw match(result.error)
      .with({ type: "duplicate_email" },
        () => new AppError(409, "Email já cadastrado"))
      .with({ type: "database_error" },
        () => new AppError(500, "Erro ao criar usuário"))
      .exhaustive()  // ← Força todas cases
  }

  return c.json(result.data, 201)
})
```

**Benefícios:**
- Service é testável sem HTTP
- Erros mapeados com type safety (exhaustive matching)
- Separação clara de responsabilidades

### 3.3 Validação com Zod

**Estratégia Dupla:**

```typescript
// Server-side: Gera schema a partir de Drizzle table
export const insertBancaSchema = createInsertSchema(Bancas)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => new Date(data.dataRealizacao) > new Date(),
    { message: "Data deve ser no futuro" }
  )

// Uso em Route
.post("/", zValidator("json", insertBancaSchema), async (c) => {
  const bancaData = c.req.valid("json")  // ← Tipo inferido
  // ...
})
```

### 3.4 Middlewares

**appJwt: Decodifica JWT**

```typescript
export const appJwt = (options: { secret: string }) => {
  return createMiddleware(async (ctx, next) => {
    const credentials = ctx.req.raw.headers.get("Authorization")
    
    if (!credentials) {
      return await next()  // Sem token, continua público
    }

    const [, token] = credentials.split(/\s+/)  // "Bearer <token>"

    try {
      const payload = await verify(token, options.secret)
      ctx.set("jwtPayload", payload)  // { sub: userId, role, iat, exp }
    } catch (e) {
      // Token inválido, continua sem autenticação
    }

    await next()
  })
}
```

**checkRole: Valida Permissões**

```typescript
export const checkRole = (allowedRoles: UserRole[]) =>
  createMiddleware(async (c, next) => {
    const userId = c.get("jwtPayload")?.sub

    if (!userId) {
      throw new AppError(401, "Não autenticado")
    }

    const result = await getUserById(c, Number(userId))

    if (!result.ok) {
      throw new AppError(404, "Usuário não encontrado")
    }

    if (!allowedRoles.includes(result.data.role as UserRole)) {
      throw new AppError(403, "Sem permissão")
    }

    return next()
  })
```

**Uso:**

```typescript
.post("/", checkRole(["TEACHER", "ADMIN"]), async (c) => {
  // Só TEACHER ou ADMIN pode executar
})
```

### 3.5 Serviços Compartilhados

#### Email Service

```typescript
// Desenvolvimento: Ethereal (test email)
// Produção: Gmail SMTP

export const sendEmail = async (
  input: SendEmailInput
): Promise<AppResult<void, SendEmailError>> => {
  try {
    const info = await transporter.sendMail(input)
    
    if (NODE_ENV !== "production") {
      console.log("Preview:", nodemailer.getTestMessageUrl(info))
    }
    
    return ok(undefined)
  } catch (error) {
    return err({ type: "send_failed", error })
  }
}
```

#### PDF Document Service

```typescript
import { renderToFile } from "@react-pdf/renderer"
import AtaDefesa from "@tcc/pdf-components/ata-defesa"

export const generateBancaAtaPDF = async (bancaData: any) => {
  const buffer = await renderToFile(
    <AtaDefesa banca={bancaData} />,
    { filename: `ata-${bancaData.id}.pdf` }
  )
  return buffer
}
```

---

## Comunicação Frontend-Backend

### 4.1 Fluxo de API Call

```
Frontend Component
  ↓
useQuery/useMutation hook
  ↓
apiClient.endpoint.$method()
  ↓
Hono RPC Client
  ├─ Intercepta headers
  ├─ Injeta Authorization
  └─ HTTP Request enviado
  ↓
HTTP POST /endpoint
  Authorization: Bearer <token>
  ├─ appJwt() middleware decodifica
  ├─ Route handler executado
  ├─ Service processa
  └─ Response retorna
  ↓
Frontend recebe
  ↓
rpcReturn() processa
  ├─ Se ok → retorna data (tipado)
  ├─ Se erro → throw Error
  └─ React Query cache atualizado
  ↓
Component re-renderiza com dados
```

### 4.2 Token Management

**Storage:**

```typescript
// localStorage (Browser)
localStorage.setItem("authToken", token)     // Persiste
localStorage.getItem("authToken")
localStorage.removeItem("authToken")
```

**Injectionem Requests:**

```typescript
// apiClient.ts automaticamente adiciona:
headers() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  return { Authorization: `Bearer ${token}` }
}
```

**Verificação Servidor:**

```typescript
// appJwt() decodifica
const payload = await verify(token, JWT_SECRET)
// payload = { sub: userId, role, iat, exp }
```

### 4.3 Autenticação Completa

**Login:**

```
1. User preenche email/password
2. Frontend valida com Zod (client-side)
3. POST /auth/login enviado
4. Backend valida com Zod (server-side)
5. SELECT user WHERE email = $
6. bcryptjs.compare(password, hash)
7. JWT gerado com payload { sub, role, iat, exp }
8. Retorna { token, user }
9. Frontend storeAuthToken(token)
10. React Query cache atualizado
11. Redirect to /dashboard
```

**Próximas Requisições:**

```
GET /banca
Authorization: Bearer <token>
  ↓
appJwt() decodifica
  ↓
ctx.set("jwtPayload", { sub: userId, role, iat, exp })
  ↓
Route handler acessa userId
  ↓
SELECT banca WHERE orientador_id = $userId
  ↓
Retorna apenas bancas do professor
```

**Logout:**

```
1. User clica "Sair"
2. removeAuthToken() → localStorage.removeItem(AUTH_TOKEN_KEY)
3. Próxima requisição sem Authorization header
4. Backend retorna 401 ou dados públicos
5. Frontend redirect to /login
```

---

## Banco de Dados

### 5.1 Tabelas Principais

**Users**

```sql
id: SERIAL PRIMARY KEY
email: TEXT UNIQUE NOT NULL
nome: TEXT NOT NULL
password_hash: TEXT NOT NULL          -- bcrypt hash
school: TEXT                          -- "Instituto de Computação"
matricula: TEXT NOT NULL              -- "20230001"
academic_title: TEXT                  -- "Doutor", "Mestre", "Graduado"
role: ENUM('STUDENT', 'TEACHER', 'ADMIN')
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

**Banca (Defesa)**

```sql
id: SERIAL PRIMARY KEY
orientador_id: INT FK(Users)          -- Professor orientador
aluno_id: INT FK(Users)               -- Aluno defendendo
curso_id: INT FK(Curso)
autor: TEXT NOT NULL                  -- Nome do aluno
titulo_trabalho: TEXT NOT NULL
resumo: TEXT NOT NULL
abstract: TEXT NOT NULL
palavras_chave: TEXT NOT NULL         -- "keyword1, keyword2"
data_realizacao: TIMESTAMP NOT NULL
nota_final: TEXT
local: TEXT                           -- "Sala 501" ou "Google Meet:"
modalidade: ENUM('remoto', 'local')
visible: BOOLEAN DEFAULT true
UNIQUE(aluno_id, curso_id)            -- Um aluno por curso
```

**UsuariosBancas (Many-to-Many)**

```sql
id: SERIAL PRIMARY KEY
usuario_id: INT FK(Users)
banca_id: INT FK(Bancas)
role: ENUM('orientador', 'coorientador', 'aluno', 'avaliador')
nota: TEXT                            -- Nota atribuída (se avaliador)
UNIQUE(usuario_id, banca_id)
```

**TeacherInvitations**

```sql
id: SERIAL PRIMARY KEY
email: TEXT UNIQUE NOT NULL
nome: TEXT NOT NULL
invitation_hash: TEXT UNIQUE NOT NULL
status: ENUM('pending', 'used', 'expired')
created_at: TIMESTAMP DEFAULT NOW()
expires_at: TIMESTAMP                 -- +7 dias
invited_by: INT FK(Users)             -- Admin que criou
user_id: INT FK(Users) NULL           -- Quando aceito
```

**ResetPasswords**

```sql
id: SERIAL PRIMARY KEY
user_id: INT FK(Users)
reset_password_hash: TEXT UNIQUE NOT NULL
created_at: TIMESTAMP DEFAULT NOW()
expires_at: TIMESTAMP                 -- +1 hora
```

### 5.2 Relationships

```
Users 1──→ ∞ Bancas (orientador_id)
Users 1──→ ∞ Bancas (aluno_id)
Users ∞──→ ∞ Bancas (via UsuariosBancas)
Cursos 1──→ ∞ Bancas
```

### 5.3 Migrations (Drizzle)

```bash
# Adiciona coluna em schema.ts

# Gera migration
npm run migration:gen
# → Cria apps/server/src/database/drizzle/0011_add_column.sql

# Executa
npm run migration:run
# → Aplica SQL ao database

# Ou push direto (recomendado)
npm run db:push
# → Sincroniza schema.ts com database
```

---

## Autenticação e Segurança

### 6.1 Fluxo de Senha Reset

```
1. User solicita reset
   POST /usuario/request-password-reset
   { email: "user@example.com" }

2. Backend:
   SELECT * FROM users WHERE email = $
   ├─ Se não existe, silenciosamente retorna ok (segurança)
   ├─ Se existe:
   │   ├─ Gera crypto.randomBytes(32).toString('hex')
   │   ├─ INSERT reset_password com TTL 1 hora
   │   └─ Envia email com link /reset-password/{hash}

3. User clica email link
   GET /reset-password/{hash}
   ├─ Frontend verifica hash existe
   └─ Renderiza form de nova senha

4. User entra nova senha
   POST /auth/reset-password/reset
   { hash, newPassword }

5. Backend:
   SELECT FROM reset_password WHERE hash = $ AND expires_at > NOW()
   ├─ Se inválido/expirado → erro
   ├─ Se válido:
   │   ├─ Faz hash da nova senha
   │   ├─ UPDATE users SET password_hash = $
   │   └─ DELETE reset_password (consume token)

6. Sucesso → User pode fazer login com nova senha
```

### 6.2 Fluxo de Convite Professor

```
1. Admin cria convite
   POST /teacher-invitation
   { email, nome }

2. Backend:
   ├─ Gera crypto.randomBytes(32).toString('hex')
   ├─ INSERT teacher_invitation com TTL 7 dias, status=pending
   └─ Envia email com link /teacher-invitation/{hash}

3. Professor clica email
   GET /teacher-invitation/verify/{hash}
   ├─ Valida hash, status=pending, não expirou
   └─ Retorna { email, nome, expiresAt }

4. Professor preenche dados
   POST /teacher-invitation/accept
   { hash, password, school, academicTitle }

5. Backend:
   ├─ Valida hash, não expirou
   ├─ Cria novo User com role=TEACHER
   ├─ UPDATE teacher_invitation SET status=used, user_id=newUserId
   ├─ Gera JWT para novo user
   └─ Retorna { token, user }

6. Frontend:
   ├─ Armazena token
   ├─ Redireciona para dashboard
   └─ Professor já autenticado!
```

### 6.3 Segurança: Camadas

```
Layer 1: HTTPS/TLS (produção)
  └─ Criptografa tráfego

Layer 2: CORS
  └─ Controla origem das requisições

Layer 3: JWT + Autenticação
  └─ Valida usuário

Layer 4: Autorização (Roles)
  └─ checkRole middleware

Layer 5: Validação Zod
  └─ Validação de entrada (client + server)

Layer 6: Prepared Statements (Drizzle)
  └─ Previne SQL injection

Layer 7: bcryptjs
  └─ Hash de senhas (não reversível)
```

---

## Convenções e Padrões

### File Naming

- **Componentes React**: PascalCase → `LoginForm.tsx`
- **Hooks**: camelCase com `use` → `useUser.ts`
- **Services**: camelCase com `Service` → `authService.ts`
- **Schemas**: camelCase com `schema` → `banca.schema.ts`
- **DAOs**: camelCase com `dao` → `banca.dao.ts`

### Code Style

- **Backend services**: Retornam `AppResult<T, E>`, nunca HTTP direto
- **Routes**: Chamam services, mapeiam resultado → HTTP
- **Frontend components**: Chamam hooks customizados para data
- **Validation**: Zod em ambos frontend e backend

### Organização

```
✅ CORRETO:

// user.hooks.ts
export const useUser = () => useQuery({ ... })

// LoginForm.tsx
export function LoginForm() {
  const user = useUser()
  // ...
}

❌ INCORRETO:

// LoginForm.tsx
export function LoginForm() {
  const user = useQuery({...})  // Aqui não!
  // ...
}
```

---

## Performance

### Frontend

- React Query caching (staleTime + gcTime)
- Component code splitting (file-based routing)
- TailwindCSS tree-shaking (produção build)
- Lazy loading routes (React Router)

### Backend

- Drizzle prepared statements
- DAO pattern para evitar N+1 queries
- Middleware caching (HTTP headers)
- Connection pooling (Drizzle)

### Database

- Indexes em foreign keys (automático)
- Constraints para referential integrity
- Migrations versionadas (reproducible)

---

## Próximos Passos para Dominar

1. ✅ Ler `SETUP.md` para entender como rodaar
2. ✅ Ler `FLUXOS.md` para visual dos fluxogramas
3. ✅ Ler `DATABASE.md` para detalhes do schema
4. ✅ Ler `PATTERNS.md` para padrões específicos
5. ✅ Explorar código seguindo padrões neste arquivo
