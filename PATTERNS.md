# 🎯 PADRÕES ARQUITETURAIS E BEST PRACTICES

> Padrões e conventions do projeto + como implementar novos features

## 📋 Índice

1. [Padrões Backend](#padrões-backend)
2. [Padrões Frontend](#padrões-frontend)
3. [Padrões Validação](#padrões-validação)
4. [Error Handling](#error-handling)
5. [Criando Nova Feature](#criando-nova-feature)
6. [Anti-patterns](#anti-patterns)

---

## Padrões Backend

### 1. Estrutura Modular (Route → Service → DAO)

**Objetivo:** Separar responsabilidades, facilitar testes e reutilização

```
modulo/
├── modulo.route.ts          # HTTP endpoints
├── modulo.service.ts        # Lógica de negócio
├── modulo.schema.ts         # Validação Zod
├── modulo.dao.ts            # [OPT] Query builder
└── modulo.test.ts           # Testes
```

### 2. AppResult Pattern

**Objetivo:** Error handling type-safe sem exceções (Rust-inspired)

```typescript
// ✅ PADRÃO
type AppResult<TData, TError> = 
  | { ok: true; data: TData }
  | { ok: false; error: TError }

// ✅ Service retorna AppResult
export const createUser = async (
  c: Context,
  data: CreateUserInput
): Promise<AppResult<User, CreateUserError>> => {
  try {
    if (userExists) return err({ type: "duplicate" })
    const newUser = await db.insert(...)
    return ok(newUser)
  } catch (error) {
    return err({ type: "database_error", error })
  }
}

// ✅ Route mapeia para HTTP
const result = await createUser(c, data)
if (!result.ok) {
  throw match(result.error)
    .with({ type: "duplicate" }, () => new AppError(409, "..."))
    .exhaustive()  // ← Força todas cases
}
return c.json(result.data, 201)
```

**Benefícios:**
- ✅ Service testável (retorna valor, não HTTP)
- ✅ Errors type-safe (exhaustive matching)
- ✅ Sem try/catch espalhados

### 3. Middleware de Autenticação

```typescript
// ✅ PADRÃO
.post("/", checkRole(["TEACHER", "ADMIN"]), zValidator(...), async (c) => {
  // Apenas TEACHER ou ADMIN podem chegar aqui
  const userId = c.get("jwtPayload").sub  // Extraído do token
  // ...
})

// ✅ Implementar checkRole
export const checkRole = (allowedRoles: UserRole[]) =>
  createMiddleware(async (c, next) => {
    const userId = c.get("jwtPayload")?.sub
    if (!userId) throw new AppError(401, "Não autenticado")
    
    const user = await getUserById(c, userId)
    if (!user.ok) throw new AppError(404, "User not found")
    
    if (!allowedRoles.includes(user.data.role as UserRole)) {
      throw new AppError(403, "Sem permissão")
    }
    
    return next()
  })
```

### 4. Validação com Zod (Server-Side)

```typescript
// ✅ PADRÃO: Gerar a partir de Drizzle table
import { createInsertSchema } from "drizzle-zod"

export const insertBancaSchema = createInsertSchema(Bancas)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => new Date(data.dataRealizacao) > new Date(),
    { message: "Data deve ser futura" }
  )

// ✅ Usar em route
.post("/", zValidator("json", insertBancaSchema), async (c) => {
  const validData = c.req.valid("json")  // ← Tipado
  // validData é 100% válido conforme schema
})
```

### 5. DAO Pattern (Query Building)

```typescript
// ✅ PADRÃO: Encapsular lógica de query
export class BancaDAO {
  constructor(private db: Database) {}

  async getBancasComFiltros(options: {
    page?: number
    sort?: "date" | "title"
    search?: string
  }) {
    let query = this.db
      .select()
      .from(Bancas)
      .where(eq(Bancas.visible, true))

    // Filtro dinâmico
    if (options.search) {
      query = query.where(
        ilike(Bancas.tituloTrabalho, `%${options.search}%`)
      )
    }

    // Paginação
    const page = options.page ?? 1
    const limit = 10
    query = query.limit(limit).offset((page - 1) * limit)

    // Ordenação
    if (options.sort === "date") {
      query = query.orderBy(desc(Bancas.dataRealizacao))
    }

    return await query
  }
}

// ✅ Usar no service
export const getBancas = async (
  c: Context,
  options: BancaFilterOptions
) => {
  const dao = new BancaDAO(db)
  const bancas = await dao.getBancasComFiltros(options)
  return ok(bancas)
}
```

**Benefício:** Queries reutilizáveis, testáveis, evita duplicação

### 6. Service Functions

```typescript
// ✅ PADRÃO
export const meuService = async (
  c: Context<{ Variables: AppVariables }>,  // ← Context sempre first
  param1: string,
  param2: number
): Promise<AppResult<ReturnType, ErrorType>> => {
  const db = c.get("db")
  const userId = c.get("jwtPayload")?.sub
  
  try {
    // Lógica pura (sem HTTP concerns)
    const resultado = await db.select()...
    
    return ok(resultado)
  } catch (error) {
    console.error("Service error:", error)
    return err({ type: "database_error", error })
  }
}
```

---

## Padrões Frontend

### 1. Custom Hooks para Data Fetching

```typescript
// ✅ PADRÃO
export const useMeusDados = () => {
  return useQuery({
    queryKey: ["meus", "dados"],  // Cache key única
    queryFn: async () => {
      const res = await apiClient.endpoint.$get()
      return rpcReturn(res)  // Processa erros
    },
  })
}

// ✅ Uso
function MeuComponent() {
  const { data, isLoading, error } = useMeusDados()
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorDisplay error={error} />
  
  return <Content data={data} />
}

// ✅ Evitar:
function MeuComponent() {
  const [data, setData] = useState(null)
  // ❌ Não faça queries aqui! Use hooks customizados!
}
```

### 2. Forms com React Hook Form + Zod

```typescript
// ✅ PADRÃO
const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type FormData = z.infer<typeof formSchema>

export function MeuForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  const meuMutation = useMeuMutation()

  const onSubmit = async (data: FormData) => {
    meuMutation.mutate({ json: data })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      
      <button type="submit" disabled={meuMutation.isPending}>
        {meuMutation.isPending ? "Carregando..." : "Enviar"}
      </button>

      {meuMutation.isError && (
        <p>{meuMutation.error.message}</p>
      )}
    </form>
  )
}
```

### 3. Component Size (< 150 linhas ideal)

```typescript
// ❌ GRANDE (400+ linhas - ruim!)
export function BancaForm() {
  const [formData, setFormData] = useState({...})
  const [selectedTeachers, setSelectedTeachers] = useState([])
  // ... 300 linhas de JSX misturado
}

// ✅ QUEBRADO EM COMPONENTES
export function BancaForm() {
  const [formData, setFormData] = useState({...})
  
  return (
    <>
      <BancaBasicInfo formData={formData} onChange={...} />
      <BancaTeacherSelection selectedTeachers={...} />
      <BancaReviewSection formData={formData} />
      <BancaActions onSubmit={...} />
    </>
  )
}

// Cada subcomponente: 50-100 linhas
export function BancaBasicInfo({ formData, onChange }: Props) {
  return (
    <>
      <Input value={formData.title} onChange={...} />
      <Input value={formData.date} onChange={...} />
    </>
  )
}
```

### 4. State Colocation

```typescript
// ❌ WRONG: Prop drilling
function Parent() {
  const [isModal, setIsModal] = useState(false)
  return <Child isModal={isModal} setIsModal={setIsModal} />
}

function Child({ isModal, setIsModal }: Props) {
  return <GrandChild isModal={isModal} setIsModal={setIsModal} />
}

function GrandChild({ isModal, setIsModal }: Props) {
  return <Dialog open={isModal} onClose={() => setIsModal(false)} />
}

// ✅ RIGHT: State colocated
function Dialog() {
  const [isOpen, setIsOpen] = useState(false)  // ← Aqui!
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir</button>
      <DialogContent isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
```

### 5. Evitar Prop Drilling com Hooks

```typescript
// ❌ WRONG: Passando navigate como prop
function FormButton({ navigate }: { navigate: NavigateFunction }) {
  return <button onClick={() => navigate("/")}>Voltar</button>
}

// ✅ RIGHT: Cada componente usa seu hook
function FormButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate("/")}>Voltar</button>
}

function AnotherComponent() {
  const navigate = useNavigate()
  return <button onClick={() => navigate("/")}></button>
}
```

### 6. Mutations com Callbacks

```typescript
// ✅ PADRÃO
export const useCreateBanca = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await apiClient.banca.$post({ json: data })
      return rpcReturn(res)
    },
    
    onSuccess: (data) => {
      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["banca"] })
      
      // ✅ Notificar usuário
      toast({ title: "✅ Criado com sucesso!" })
      
      // ✅ Navegar ou scroll
      // navigate(`/banca/${data.id}`)
    },
    
    onError: (error) => {
      // ✅ Notificar erro
      toast({
        title: "❌ Erro ao criar",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}
```

---

## Padrões Validação

### 1. Validação em 2 Camadas

```
┌──────────────────────────────────┐
│ FRONTEND (React Hook Form + Zod)  │
│ ✓ Feedback imediato em tempo real │
│ ✗ Usuário pode burlar (não confie)│
└──────────────────────────────────┘
  ↓
┌──────────────────────────────────┐
│ BACKEND (Hono + Zod)              │
│ ✓ Segurança crítica               │
│ ✓ Defesa contra tampering         │
│ ✓ Last-line validation            │
└──────────────────────────────────┘
```

```typescript
// ✅ FRONTEND: Validação UX
const schema = z.object({
  email: z.string()
    .email("Email inválido")
    .min(1, "Obrigatório"),
})

// ✅ BACKEND: Mesma validação
const schema = z.object({
  email: z.string()
    .email("Email inválido")
    .min(1, "Obrigatório"),
})

// User vê erro inline ANTES de enviar
// Backend revalida e rejeita se tampering
```

### 2. Custom Validators

```typescript
// ✅ Frontend
const bancaSchema = z.object({
  dataRealizacao: z.coerce.date(),
  // ...
}).refine(
  (data) => data.dataRealizacao > new Date(),
  {
    message: "Data deve ser futura",
    path: ["dataRealizacao"],  // ← Para mostrar erro no campo
  }
)

// ✅ Backend (identicamente)
export const insertBancaSchema = createInsertSchema(Bancas)
  .refine(
    (data) => new Date(data.dataRealizacao) > new Date(),
    { message: "Data deve ser futura" }
  )
```

---

## Error Handling

### 1. Camadas de Erro

```typescript
// Layer 1: Validação (Zod)
const schema = z.string().email()
// throw { name: "ZodError", issues: [...] }

// Layer 2: Negócio (AppError)
return err({ type: "user_not_found" })
// Mapeia para: new AppError(404, "Usuário não encontrado")

// Layer 3: HTTP (Status Code)
throw new AppError(404, "Não encontrado")
// HTTP 404 retornado ao cliente

// Layer 4: Frontend (Toast)
catch (error) {
  toast({ title: "❌", description: error.message })
}
```

### 2. Exhaustive Error Matching

```typescript
// ✅ PADRÃO: Usar ts-pattern para exhaustive
import { match } from "ts-pattern"

const result = await createUser(c, data)

if (!result.ok) {
  throw match(result.error)
    .with({ type: "duplicate_email" }, 
      () => new AppError(409, "Email já existe"))
    
    .with({ type: "invalid_password" }, 
      () => new AppError(400, "Senha fraca"))
    
    .with({ type: "database_error" }, 
      () => new AppError(500, "Erro ao salvar"))
    
    .exhaustive()  // ← ❗ TypeScript força todas cases!
      // Se faltou uma case → erro de compilação
}
```

### 3. Error Messages (User-Friendly)

```typescript
// ❌ BAD: Técnico
"Constraint violation: UNIQUE (email)"
"connection refused ECONNREFUSED"

// ✅ GOOD: User-friendly
"Este email já está cadastrado"
"Erro ao conectar ao servidor, tente novamente"
```

---

## Criando Nova Feature

### Checklist: Novo Endpoint

```bash
☐ Backend Service
  ☐ apps/server/src/modules/novo/novo.service.ts
    ☐ Função com AppResult<T, E>
    ☐ Try/catch com logging
    ☐ Validações de negócio
  
  ☐ apps/server/src/modules/novo/novo.route.ts
    ☐ Rota HTTP (POST/GET/etc)
    ☐ zValidator para schema
    ☐ checkRole se necesário
    ☐ Match result.error com AppError
  
  ☐ apps/server/src/modules/novo/novo.schema.ts
    ☐ Zod schema com createInsertSchema
    ☐ Validações customizadas
  
  ☐ apps/server/src/modules/novo/novo.test.ts
    ☐ Testes sucesso + erro
    ☐ Mock database

☐ Frontend Hook & Component
  ☐ apps/web/app/hooks/novo.hooks.ts
    ☐ useNovo() query
    ☐ useCreateNovo() mutation
  
  ☐ apps/web/app/components/novo/
    ☐ NovoForm.tsx
    ☐ NovoDetail.tsx
    ☐ NovoList.tsx
  
  ☐ apps/web/app/routes/novo.tsx
    ☐ Rota para feature

☐ Database
  ☐ apps/server/src/database/schema.ts
    ☐ Tabela novo
    ☐ Relacionamentos
  ☐ npm run migration:gen
  ☐ npm run db:push

☐ Testes
  ☐ Backend: npm run test
  ☐ Frontend: npm run test:e2e
  ☐ Type checking: npm run tscheck

☐ Documentação
  ☐ Comentários no código
  ☐ Atualizar ARCHITECTURE.md se mudar padrões
```

### Exemplo: Novo Endpoint "POST /novo"

**1. Schema (apps/server/src/modules/novo/novo.schema.ts)**

```typescript
import { createInsertSchema } from "drizzle-zod"
import { Novo } from "../../database"

export const insertNovoSchema = createInsertSchema(Novo)
  .omit({ id: true, createdAt: true, updatedAt: true })
```

**2. Service (apps/server/src/modules/novo/novo.service.ts)**

```typescript
import { eq } from "drizzle-orm"
import { AppResult, err, ok } from "../../result"
import { AppError } from "../../error"
import { Novo } from "../../database"
import { insertNovoSchema } from "./novo.schema"

type CreateNovoError = 
  | { type: "duplicate" }
  | { type: "database_error"; error: unknown }

export const createNovo = async (
  c: Context<{ Variables: AppVariables }>,
  data: z.infer<typeof insertNovoSchema>
): Promise<AppResult<typeof Novo.$inferSelect, CreateNovoError>> => {
  const db = c.get("db")
  
  try {
    // Check duplicate
    const existing = await db
      .select({ id: Novo.id })
      .from(Novo)
      .where(eq(Novo.nome, data.nome))
      .limit(1)
    
    if (existing.length > 0) {
      return err({ type: "duplicate" })
    }
    
    // Insert
    const [novo] = await db
      .insert(Novo)
      .values(data)
      .returning()
    
    return ok(novo)
  } catch (error) {
    console.error("Create novo error:", error)
    return err({ type: "database_error", error })
  }
}
```

**3. Route (apps/server/src/modules/novo/novo.route.ts)**

```typescript
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { match } from "ts-pattern"
import { AppError } from "../../error"
import { insertNovoSchema } from "./novo.schema"
import { createNovo } from "./novo.service"
import { checkRole } from "../auth/auth.middleware"

export const novoRoutes = new Hono()
  .post(
    "/",
    checkRole(["TEACHER", "ADMIN"]),
    zValidator("json", insertNovoSchema),
    async (c) => {
      const data = c.req.valid("json")
      const result = await createNovo(c, data)

      if (!result.ok) {
        throw match(result.error)
          .with({ type: "duplicate" },
            () => new AppError(409, "Já existe"))
          .with({ type: "database_error" },
            () => new AppError(500, "Erro ao salvar"))
          .exhaustive()
      }

      return c.json(result.data, 201)
    }
  )
```

**4. Frontend Hook (apps/web/app/hooks/novo.hooks.ts)**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { rpcReturn } from "@/lib/utils"
import apiClient from "@/services/apiClient"

export const useCreateNovo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateNovoInput) => {
      const res = await apiClient.novo.$post({ json: data })
      return rpcReturn(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["novos"] })
    },
  })
}
```

---

## Anti-patterns

### ❌ Não Faça

```typescript
// ❌ Queries diretamente no component
function Component() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch("/api/data")
      .then(r => r.json())
      .then(setData)
  }, [])
}
// ✅ Use hook customizado com React Query

// ❌ Prop drilling
<ParentA prop={value}>
  <ParentB prop={value}>
    <ChildC prop={value} />
  </ParentB>
</ParentA>
// ✅ Cada component usa seu hook

// ❌ Sem type-safety
const response = await fetch("/api/users")
const user = await response.json()  // any!
// ✅ Use Hono RPC Client

// ❌ Lógica misturada em componentes
export function LargeComponent() {
  // 500 linhas de lógica + JSX misturado
}
// ✅ Quebra em componentes pequenos

// ❌ Errors silenciosos
try {
  await fetch(...)
} catch (e) {
  console.log(e)  // Ignorado!
}
// ✅ Sempre mostre erro ao user

// ❌ Sem validação server-side
.post("/", async (c) => {
  const data = c.req.json()  // any!
  // Confia no cliente
})
// ✅ Sempre valide com zValidator

// ❌ No AppResult pattern
export const createUser = async (data) => {
  const user = await db.insert(...)
  throw new Error("Falhou")  // ❌
}
// ✅ Retorne AppResult

// ❌ Queries sem Key única
useQuery({
  queryKey: ["data"],  // Genérico!
  queryFn: () => fetch("/api/users?page=2")
})
// ✅ Key única incluindo filtros
useQuery({
  queryKey: ["users", { page: 2 }],
  queryFn: () => fetch("/api/users?page=2")
})
```

---

## Sumário

| Padrão | Backend | Frontend |
|--------|---------|----------|
| **Error Handling** | AppResult + AppError | rpcReturn + try/catch |
| **Validation** | Zod + zValidator | React Hook Form + Zod |
| **State** | BD + Cache | React Query + useState |
| **Auth** | JWT + checkRole | localStorage + useUser |
| **Testing** | Vitest | Playwright |
| **Type Safety** | Typescript strict | RPC Client |
