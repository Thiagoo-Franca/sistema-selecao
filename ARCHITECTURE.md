# 🏗️ ARQUITETURA DO SISSEL

> **Documento mestre** da arquitetura do SISSEL, sistema de seleção de candidatos a **mestrado e doutorado** do PGCOMP/UFBA.
>
> Este documento substitui a versão anterior, que descrevia o sistema de bancas de defesa. Em caso de divergência, **o código é a fonte da verdade**. Itens marcados com 🎯 são o estado-alvo das Fases 1 e 2 da revisão e podem ainda não estar totalmente no código.

## 📋 Índice

1. [Visão Geral e Domínio](#visão-geral-e-domínio)
2. [Estrutura Geral](#estrutura-geral)
3. [Frontend Detalhado](#frontend-detalhado)
4. [Backend Detalhado](#backend-detalhado)
5. [Comunicação Frontend-Backend](#comunicação-frontend-backend)
6. [Banco de Dados](#banco-de-dados)
7. [Autenticação e Segurança](#autenticação-e-segurança)
8. [Convenções e Padrões](#convenções-e-padrões)
9. [Performance](#performance)
10. [Legado](#legado)

---

## Visão Geral e Domínio

### O que o sistema faz

1. Candidatos de **mestrado** e **doutorado** são importados de planilhas.
2. Cada candidato recebe automaticamente um **avaliador** e um **auditor** (professores), por área e carga de trabalho.
3. Avaliador e auditor lançam as **notas** em etapas; o servidor calcula e persiste a **nota final**.
4. O ADMIN gerencia professores, importações e atribuições.

### O que o sistema **não** é

Não é sistema de bancas, defesas ou cursos. Não existem (e não devem ser criados sem pedido explícito) as entidades: edital/processo seletivo, inscrição, ranking, recurso ou prazos. **Candidatos não são usuários** e nunca acessam o sistema.

### Papéis

| Papel     | Pode                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `ADMIN`   | Tudo: usuários, importação, atribuição, exclusão, leitura e edição de qualquer candidato                         |
| `TEACHER` | Ler e editar **somente** candidatos em que é avaliador **ou** auditor (os dois têm as mesmas permissões de nota) |

### Regras de nota

- Mestrado e doutorado têm campos, etapas e fórmulas diferentes (`calcularMestradoNota`, `calcularNotaDoutoradoEtapa1`). **Não se unificam** em um modelo genérico.
- A `notaFinal` é **persistida** junto das partes e de `formulaVersion`. Mudar a fórmula significa nova versão, nunca recálculo silencioso de quem já foi avaliado.
- `avaliado`, `notaFinal`, `formulaVersion`, `avaliadoEm` e `avaliadoPorId` são escritos **apenas pelo service de nota**, na mesma transação que lê e trava a linha. Nunca vêm do cliente.
- `avaliado` só vira `true` quando algum campo de **nota** foi de fato alterado, e não quando apenas o avaliador foi trocado.

### Regras de alocação

- **Avaliador**: professor ativo da 1ª área de preferência com menor carga; se não houver, da 2ª; senão fica vazio.
- **Auditor**: mesma ordem de áreas, diferente do avaliador; se não houver ninguém nas áreas, qualquer outro professor ativo de menor carga.
- A alocação roda dentro da transação de importação, sob advisory lock, para serializar uploads concorrentes.
- Mudar as áreas de um professor **não realoca** candidatos existentes; a realocação é uma ação explícita do ADMIN.

---

## Estrutura Geral

### Monorepo Turborepo

```
sistema-selecao/
├── apps/
│   ├── web/                    # Frontend React Router v7 (SSR)
│   ├── server/                 # Backend Hono API
│   ├── frontend-old/           # Legado (deprecated)
│   └── yii2-organizacao-de-defesas/  # Legado (deprecated)
├── packages/
│   ├── shared/                 # @tcc/shared: código puro (fórmulas, AREAS, ISENCAO_STATUS)
│   ├── tests/                  # Utilidades e fixtures de teste
│   └── pdf-components/         # Legado das bancas; não estender
├── scripts/
│   └── deploy.ts               # Script de deployment
├── package.json                # Workspace raiz (npm workspaces)
├── turbo.json                  # Turbo task runner
└── docker-compose.yml          # PostgreSQL local
```

### Pacote `@tcc/shared`

Código **puro** usado por web e server: sem React, DOM, Hono ou Drizzle.

```
packages/shared/src/
├── index.ts            # reexporta tudo (única porta de entrada)
├── calculo-notas.ts    # calcularMestradoNota, calcularNotaDoutoradoEtapa1, paraNumeroSeguro
├── areas.ts            # AREAS, AREA_LABEL
└── isencao.ts          # ISENCAO_STATUS, ISENCAO_LABEL
```

- Importar sempre `from "@tcc/shared"`, **nunca** de subpath (`@tcc/shared/src/...`): o campo `exports` do pacote bloqueia (`ERR_PACKAGE_PATH_NOT_EXPORTED`).
- As constantes alimentam o `pgEnum` do Drizzle, o Zod e os selects do front: **uma fonte única**.
- O server roda TypeScript com `tsx`, então consome o pacote como código-fonte, sem build.

### Stack Tecnológico

**Frontend:** React Router v7 + SSR · TailwindCSS v4 + Radix UI · TanStack Query · React Hook Form + Zod · Hono RPC Client · Sonner · Playwright

**Backend:** Hono · PostgreSQL (Supabase) + Drizzle ORM · JWT (HS256) + bcryptjs · Zod + `zValidator` · ts-pattern · Nodemailer · Vitest + PGlite

**DevOps:** Docker Compose (banco local) · Turborepo · npm workspaces · Dokku

---

## Frontend Detalhado

> A estrutura de pastas e rotas abaixo segue as convenções do projeto; confira os nomes reais em `apps/web/app/`, que ainda pode conter pastas e telas legadas das bancas.

### 3.1 Ciclo de Vida da Aplicação

#### Inicialização (`root.tsx`)

```typescript
export function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  )

  return (
    <html lang="pt-BR">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
        <Toaster />  {/* Sonner */}
      </QueryClientProvider>
    </html>
  )
}
```

1. `QueryClient` é criado uma vez por renderização do layout.
2. `QueryClientProvider` fornece o client a todos os hooks.
3. `Outlet` renderiza as rotas.
4. `Toaster` é o container de notificações.

#### Sistema de Rotas (file-based)

Arquivos em `app/routes/` viram rotas. Exemplo (confira os nomes reais):

```
_index.tsx                       → /
login.tsx                        → /login
candidatos.$id.tsx               → /candidatos/:id
admin.usuarios.tsx               → /admin/usuarios
reset-password.$token.tsx        → /reset-password/:token
```

O `:id` do candidato é um **UUID**. Expor o UUID na URL não é problema de segurança por si só (não é adivinhável); o que protege os dados é a **checagem de dono no service**. Nunca use matrícula, número de inscrição ou CPF em URL.

### 3.2 API Client (Hono RPC)

**Arquivo: `apps/web/app/services/apiClient.ts`**

```typescript
import { hc } from "hono/client";
import type { AppType } from "@tcc/server"; // somente tipos

const client = hc<AppType>(env.VITE_API_URL, {
  headers() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export default client;
```

- Só **tipos** cruzam de `@tcc/server` para o web; nunca código de runtime do server.
- Mudar rota ou schema Zod muda o `AppType`: o `npm run tscheck` do web vira a lista de telas a ajustar.
- Envie o header só quando houver token (evita `Bearer null`, que o servidor passou a rejeitar com 401).

### 3.3 Gerenciamento de Estado

| Tipo               | Lib                  | Localização           | Exemplo                                       |
| ------------------ | -------------------- | --------------------- | --------------------------------------------- |
| Server State       | TanStack Query       | Hooks em `app/hooks/` | `useMeusCandidatos()`                         |
| Estado local de UI | `useState`           | No componente         | `const [isOpen, setIsOpen] = useState(false)` |
| Auth               | `localStorage`       | Browser               | JWT                                           |
| Estado na URL      | `useQueryParamState` | Query string          | `?page=2`                                     |

**Query com chave única:**

```typescript
export const useMeusCandidatos = () =>
  useQuery({
    queryKey: ["candidatos", "meus"],
    queryFn: async () => rpcReturn(await apiClient.candidato.meus.$get()),
    staleTime: 60 * 1000,
  });
```

Regras:

- A lista "meus candidatos" **não recebe id no path**: o servidor deduz o usuário pelo token.
- O front **não recalcula `notaFinal`** com a fórmula vigente (isso reintroduziria o bug de nota retroativa). Mostra o valor salvo pelo servidor; calcular no cliente só serve como **preview** num formulário.

### 3.4 Formulários e Validação

React Hook Form + Zod, validando em duas camadas:

1. **Cliente**: feedback imediato.
2. **Servidor**: segurança (nunca confie no cliente).

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {/* ... */},
});

const mutation = useUpdateNotaMestrado();
const onSubmit = (data: FormData) =>
  mutation.mutate({ param: { id }, json: data });
```

Os selects de área e de isenção usam as constantes e labels de `@tcc/shared`, não listas redeclaradas.

### 3.5 Componentes e Organização

- Componentes React em PascalCase, hooks em camelCase com `use`, serviços em camelCase com sufixo `Service`.
- Componentes acima de ~150 linhas ou com JSX repetido são divididos.

```
components/
├── ui/              # Primitivos Radix customizados
├── auth/            # Login e reset de senha
├── candidato/       # Listagem, detalhe, formulário de notas
├── usuarios/        # Tela de admin (professores)
└── feedback/        # Sistema de feedback

hooks/               # useMeusCandidatos, useCandidato, use-query-param-state...
services/            # apiClient.ts, authService.ts
lib/                 # utils (cn, rpcReturn, RpcType)
```

### 3.6 Tratamento de Erros

```typescript
export const rpcReturn = async <T>(res: ClientResponse<T>) => {
  const data = await res.json();
  if (res.ok) return data;

  if (res.status === 401) {
    removeAuthToken();
    window.location.assign("/login"); // único ponto que trata 401
  }

  if ((data as any)?.error?.name === "ZodError") {
    throw new Error(
      (data as any).error.issues.map((i: any) => i.message).join(", "),
    );
  }
  throw new Error(
    (data as { message?: string })?.message || "Erro desconhecido",
  );
};
```

- **401** é tratado em um único lugar: limpa o token e redireciona ao login.
- **404** em candidato mostra mensagem neutra ("Candidato não encontrado"); o servidor responde 404 também quando o usuário não tem acesso.
- Mensagens ao usuário são em português, via toast.

---

## Backend Detalhado

### 4.1 Arquitetura Modular

Módulos em `apps/server/src/modules/`:

| Módulo        | Responsabilidade                                                          |
| ------------- | ------------------------------------------------------------------------- |
| `auth`        | Login, reset de senha, JWT e middleware de identidade                     |
| `usuario`     | Gestão de professores (tela de admin), perfil, mapper público             |
| `candidato`   | Consultas, atualização, exclusão e importação de candidatos               |
| `nota` 🎯     | Atualização de notas (hoje dentro de `candidato`)                         |
| `alocacao` 🎯 | Política pura de alocação e sua persistência (hoje dentro de `candidato`) |
| `feedback`    | Feedback e pedidos de funcionalidade                                      |

Padrão de arquivos por módulo:

```
modulo/
├── modulo.route.ts     # Validação, checkRole e mapeamento de erros
├── modulo.service.ts   # Casos de uso: lógica de negócio + banco
├── modulo.schema.ts    # Schemas Zod
└── modulo.test.ts      # Testes Vitest
```

### Camadas (atômica)

| Camada        | O que é                                                                            | Regra                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Átomo**     | Função pura (cálculo de nota, normalização, regra de acesso, política de alocação) | Sem I/O, sem Hono, sem Drizzle; testável sem banco                                                                |
| **Molécula**  | Service / caso de uso                                                              | Compõe átomos e acessa o banco; transação quando há várias tabelas ou leitura-mescla-escrita; retorna `AppResult` |
| **Organismo** | Rota                                                                               | Só valida, aplica `checkRole`, chama o service e mapeia o erro para HTTP                                          |

Princípios: extrair só duplicação **real** (mesma regra, mudaria junta); manter separado o que diverge de fato (fórmulas e campos de mestrado × doutorado); **sem** repositories, containers de DI ou use cases genéricos.

### Fluxo de Requisição

```
HTTP Request
  ↓
1. index.ts: middlewares globais
   ├─ poweredBy() / logger()
   ├─ cors()          → origem restrita ao FRONTEND_URL em produção
   ├─ prettyJSON()
   └─ appJwt()        → ⭐ decodifica o JWT; token fornecido e inválido = 401
  ↓
2. modulo.route.ts
   ├─ checkRole()     → carrega o usuário do banco, rejeita inativo, expõe em c.var
   ├─ zValidator()    → param (UUID), query e json (allowlist + .strict())
   └─ chama o service
  ↓
3. modulo.service.ts
   ├─ regra de acesso (podeAcessarCandidato)
   ├─ queries/transação
   └─ AppResult<T, E>
  ↓
4. Rota mapeia o resultado
   ├─ match(result.error).exhaustive()
   ├─ throw AppError
   └─ return c.json(dto)
  ↓
ErrorHandler global
  ├─ AppError → status + mensagem
  └─ demais → 500 genérico
```

### 4.2 AppResult + AppError

```typescript
// result.ts
type AppResult<TData, TError> =
  { ok: true; data: TData } | { ok: false; error: TError };

// error.ts
class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
```

Regras:

- Erros de domínio são **tipos discriminados** por módulo (`candidato_not_found`, `duplicate_email`, `database_error`).
- **Nunca** use `ok(null)` para "não encontrado": retorne `err({ type: "candidato_not_found" })`.
- A rota mapeia com `match(...).exhaustive()`; se faltar um caso, não compila.

**Service (esboço):**

```typescript
export const createUsuario = async (
  c: Context<{ Variables: AppVariables }>,
  data: CreateUsuarioInput,
): Promise<AppResult<SelectUser, CreateUsuarioError>> => {
  const db = c.get("db");
  try {
    const [existente] = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.email, data.email))
      .limit(1);
    if (existente) return err({ type: "duplicate_email" });

    const [novo] = await db.insert(Users).values(data).returning();
    return ok(novo);
  } catch (error) {
    logDbError("createUsuario", error); // só code e constraint, nunca o valor
    return err({ type: "database_error", error });
  }
};
```

**Rota:**

```typescript
.post("/", checkRole(["ADMIN"]), zValidator("json", createUsuarioSchema), async (c) => {
  const result = await createUsuario(c, c.req.valid("json"))
  if (!result.ok) {
    throw match(result.error)
      .with({ type: "duplicate_email" }, () => new AppError(409, "Email já cadastrado"))
      .with({ type: "database_error" }, () => new AppError(500, "Erro ao criar usuário"))
      .exhaustive()
  }
  return c.json(toUsuarioPublico(result.data), 201)   // nunca devolve passwordHash
})
```

### 4.3 Validação com Zod

Schemas de **atualização** usam allowlist e rejeitam campos desconhecidos:

```typescript
export const updateNotaMestradoSchema = createUpdateSchema(NotaMestrado)
  .pick({
    grad: true,
    area: true,
    enade: true,
    a1a2a3a4: true,
    b1b2b3b4: true,
    icIt: true,
    poscomp: true,
    disciplinaPosCapes6Mais: true,
    disciplinaPosCapes3a5: true,
    notaEtapaII: true,
    // + os campos *Link correspondentes
  })
  .strict(); // avaliado, notaFinal, formulaVersion etc. => 400
```

- **Nunca** passe o corpo da requisição direto para `.set()` ou `.values()` (mass assignment).
- Todo `:id` de candidato é validado com `z.string().uuid()`, para UUID malformado dar 400 e não um erro de cast do Postgres (500).
- Valores de planilha (isenção, GRU, área) são normalizados para os enums do `@tcc/shared`, com erro por linha para valores desconhecidos.

### 4.4 Middlewares

**`appJwt`: decodifica o JWT** 🎯

```typescript
export const appJwt = (options: { secret: string }) =>
  createMiddleware(async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header) return next(); // sem token: segue sem identidade

    const [scheme, token] = header.split(/\s+/);
    if (scheme !== "Bearer" || !token)
      throw new AppError(401, "Não autenticado");

    try {
      const payload = await verify(token, options.secret, "HS256");
      if (typeof payload.sub !== "string" || !isUuid(payload.sub))
        throw new Error();
      c.set("jwtPayload", payload);
    } catch {
      throw new AppError(401, "Não autenticado"); // mensagem genérica, sem distinguir a causa
    }
    await next();
  });
```

Token **fornecido e inválido, malformado ou expirado nunca segue como anônimo**: é 401. Só a ausência de token segue adiante, e quem decide é o `checkRole`.

**`checkRole`: identidade e papel** 🎯

```typescript
export const checkRole = (allowedRoles: UserRole[]) =>
  createMiddleware(async (c, next) => {
    const userId = c.get("jwtPayload")?.sub;
    if (!userId) throw new AppError(401, "Não autenticado");

    const result = await getUsuarioById(c, userId); // lê do banco, não do JWT
    if (!result.ok) throw new AppError(500, "Erro interno");
    if (!result.data || !result.data.ativo)
      throw new AppError(401, "Não autenticado");
    if (!allowedRoles.includes(result.data.role))
      throw new AppError(403, "Sem permissão");

    c.set("usuario", { id: result.data.id, role: result.data.role });
    return next();
  });
```

- O papel vem do **banco**, nunca do payload: desativar ou rebaixar um professor vale na hora, sem esperar o token de 24h expirar.
- Rotas e services leem o usuário de `c.var` (`getUsuarioAutenticado(c)`); **identidade nunca vem da URL nem do corpo**.

### 4.5 Autorização por dono

Regra pura (átomo), reutilizada em detalhe, listagem, atualização e nota:

```typescript
export type UsuarioAutenticado = { id: string; role: UserRole };
export type VinculoCandidato = {
  avaliadorId: string | null;
  auditorId: string | null;
};

export function podeAcessarCandidato(
  u: UsuarioAutenticado,
  c: VinculoCandidato,
): boolean {
  if (u.role === "ADMIN") return true;
  return c.avaliadorId === u.id || c.auditorId === u.id;
}
```

Equivalente em SQL para listagens: `undefined` para ADMIN e `or(eq(avaliadorId, id), eq(auditorId, id))` para TEACHER.

- Acesso negado a candidato responde **404** (não 403), para não confirmar que o UUID existe.
- Rotas administrativas (reatribuir avaliador, criar professor, excluir, importar) respondem 403 a TEACHER.
- A checagem é no **service**, antes de qualquer escrita; o frontend nunca é a barreira.

### 4.6 Atualização de nota (caso de uso central)

```typescript
export const updateNotaMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  idCandidato: string,
  body: UpdateNotaMestradoInput,
) => {
  const db = c.get("db");
  const usuario = getUsuarioAutenticado(c);
  try {
    return await db.transaction(async (tx) => {
      // 1. dono: candidato existe e o usuário tem vínculo (senão 404)
      // 2. lê a nota atual com lock: .for("update")
      // 3. mescla: { ...atual, ...body }  (nunca zerar campos ausentes com ?? 0)
      // 4. calcula com calcularMestradoNota (átomo de @tcc/shared)
      // 5. grava partes + notaFinal + formulaVersion
      //    + avaliado/avaliadoEm/avaliadoPorId (usuário autenticado) se houve mudança de nota
      // 6. retorna a nota salva
    });
  } catch (error) {
    logDbError("updateNotaMestrado", error);
    return err({ type: "database_error", error });
  }
};
```

Cuidados de domínio: sem `notaEtapaII` a nota é só da etapa I (não calcular com `0`); a etapa I abaixo de 6 reprova; `aprovado` só vale com as etapas exigidas.

### 4.7 Serviços compartilhados

**E-mail (`services/email.service.ts`)**

```typescript
// Desenvolvimento: Ethereal (prévia no console) · Produção: Gmail SMTP
export const sendEmail = async (
  input: SendEmailInput,
): Promise<AppResult<void, SendEmailError>> => {
  try {
    const info = await transporter.sendMail(input);
    if (NODE_ENV !== "production")
      console.log("Preview:", nodemailer.getTestMessageUrl(info));
    return ok(undefined);
  } catch (error) {
    return err({ type: "send_failed", error });
  }
};
```

Templates (`createXxxEmail()`): redefinição de senha (1 hora) e "defina sua senha" para professor novo (7 dias). Não há e-mails de convite.

**Configuração**

Todas as variáveis são lidas por um `envSchema` único com Zod. `JWT_SECRET` é obrigatório, com no mínimo 32 caracteres e **sem fallback**; em produção a aplicação falha ao iniciar se faltar.

---

## Comunicação Frontend-Backend

### 5.1 Fluxo de API Call

```
Componente
  ↓
hook (useQuery / useMutation)
  ↓
apiClient.rota.$metodo()
  ↓
Hono RPC Client: injeta Authorization (se houver token)
  ↓
HTTP  →  appJwt → checkRole → zValidator → service
  ↓
Resposta
  ↓
rpcReturn()
  ├─ ok → dados tipados
  ├─ 401 → limpa token e vai para /login
  └─ erro → throw Error (toast)
  ↓
Cache do React Query atualizado, componente re-renderiza
```

### 5.2 Token

- Salvo em `localStorage` (`AUTH_TOKEN_KEY`) e injetado pelo `apiClient`.
- JWT HS256, `sub` = UUID do usuário, expiração de 24h.
- Logout remove o token; a próxima requisição sem header cai em 401 nas rotas protegidas.

### 5.3 Login

```
1. Usuário preenche e-mail e senha
2. Validação Zod no cliente
3. POST /auth/login
4. Validação Zod no servidor
5. Busca usuário por e-mail (normalizado em minúsculas); inativo ou inexistente = credenciais inválidas
6. bcryptjs.compare(senha, hash)
7. JWT { sub: uuid, iat, exp } assinado com JWT_SECRET
8. Retorna { token, user } (user via toUsuarioPublico, sem passwordHash)
9. Front guarda o token e atualiza o cache
10. Redireciona
```

A mensagem de erro de login é a mesma para e-mail inexistente, senha errada e usuário inativo.

---

## Banco de Dados

Fonte: `apps/server/src/database/schema.ts`. Convenções: colunas em `snake_case`, campos TS em `camelCase`, UUID nas chaves de usuários e candidatos, `createdAt`/`updatedAt` (com `$onUpdate`), `onDelete` explícito em toda FK, enums via `pgEnum` alimentados por `@tcc/shared`, `.enableRLS()` em todas as tabelas.

### 6.1 Tabelas principais 🎯

**usuario**

```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
email: TEXT UNIQUE NOT NULL          -- normalizado em minúsculas
nome: TEXT NOT NULL
password_hash: TEXT NOT NULL         -- bcrypt; nunca sai em resposta
school, matricula, academic_title    -- obrigatórios conforme o fluxo do admin
areas: area[] NOT NULL DEFAULT '{}'  -- usadas na alocação
role: ENUM('TEACHER', 'ADMIN')
ativo: BOOLEAN NOT NULL DEFAULT true
criado_por_id: UUID FK(usuario) ON DELETE SET NULL
created_at, updated_at
```

**candidato_mestrado** e **candidato_doutorado** (colunas base compartilhadas)

```sql
id: UUID PRIMARY KEY
numero_inscricao, cpf, email: TEXT UNIQUE (cada um)
nome: TEXT NOT NULL
solicitou_isencao_taxa_inscricao: TEXT
isencao_aprovada: ENUM('sim', 'nao', 'nao-solicitou') DEFAULT 'nao-solicitou'
gru: TEXT (ou enum), gru_link: TEXT, homologa: BOOLEAN
especiais, cotas, supra: TEXT
avaliador_id, auditor_id: UUID FK(usuario) ON DELETE SET NULL   -- com índice
tipo_curso: ENUM('mestrado', 'doutorado')
created_at, updated_at
```

Mestrado acrescenta `primeira_area_preferencia`, `segunda_area_preferencia` (enum `area`), `universidade`, `curso`, `cidade_graduacao`. Doutorado acrescenta documentos e dados do mestrado anterior, anteprojeto e opções de orientador.

**nota_mestrado** e **nota_doutorado**

```sql
id: SERIAL PRIMARY KEY
id_candidato: UUID UNIQUE NOT NULL FK ON DELETE CASCADE   -- 1:1 com o candidato
-- partes da nota (campos específicos de cada programa; *_link no mestrado)
avaliado: BOOLEAN NOT NULL DEFAULT false
nota_final: NUMERIC(5,2)
formula_version: INTEGER NOT NULL DEFAULT 1
avaliado_em: TIMESTAMP
avaliado_por_id: UUID FK(usuario) ON DELETE SET NULL
created_at, updated_at
```

**reset_password**

```sql
id: SERIAL PRIMARY KEY
user_id: UUID FK(usuario)
reset_password_hash: TEXT UNIQUE
created_at, expires_at              -- 1 hora (reset) ou 7 dias (primeira senha)
```

**Feedback:** `feedback_submission` (um por usuário, notas de 1 a 5, `usage_purposes` em `jsonb`), `feature_request` e `feature_request_vote`.

### 6.2 Relacionamentos

```
usuario 1──→ ∞ candidato_mestrado   (avaliador_id)
usuario 1──→ ∞ candidato_mestrado   (auditor_id)
usuario 1──→ ∞ candidato_doutorado  (avaliador_id / auditor_id)
candidato_mestrado 1──1 nota_mestrado
candidato_doutorado 1──1 nota_doutorado
usuario 1──→ ∞ nota_*               (avaliado_por_id)
usuario 1──→ ∞ reset_password
```

### 6.3 Índices

- `UNIQUE` já cria índice (CPF, e-mail, inscrição, `id_candidato` das notas): não duplique.
- FKs **não** ganham índice automático: crie em `avaliador_id` e `auditor_id` das duas tabelas de candidatos (usados em "meus candidatos" e na carga de alocação).

### 6.4 RLS (Supabase)

Todas as tabelas têm `.enableRLS()` e **nenhuma policy permissiva**. O backend conecta como `postgres` via `DATABASE_URL` (ignora RLS); o RLS só fecha a API REST pública do Supabase, que de outra forma exporia dados pessoais com a chave `anon`.

### 6.5 Migrations (Drizzle)

```bash
# Desenvolvimento: sincroniza o schema direto
npm run db:push

# Baseline versionado (quando o schema fechar): apague drizzle/ inteira, incluindo meta/
npm run migration:gen
npm run migration:run    # testar em banco limpo
```

⚠️ Renomear **valor de enum** exige `ALTER TYPE ... RENAME VALUE` no banco; só mudar o schema faz o `db:push` falhar.

### 6.6 Seed

- **Desenvolvimento**: dados de teste.
- **Produção** 🎯: cria **apenas o primeiro admin**, a partir de `ADMIN_EMAIL` e `ADMIN_PASSWORD`, de forma idempotente e sem credenciais no repositório.

---

## Autenticação e Segurança

### 7.1 Fluxo de Redefinição de Senha

```
1. POST /auth/request-password-reset  { email }
2. Backend:
   ├─ Resposta é sempre a mesma (não revela se o e-mail existe)
   └─ Se existe e está ativo: gera crypto.randomBytes(32), grava em reset_password
      (1 hora) e envia o link /reset-password/{token}
3. Usuário abre o link; o front verifica o token
4. POST /auth/reset-password  { token, newPassword }
5. Backend valida token e expiração, faz hash da nova senha, atualiza o usuário
   e apaga o token (uso único)
```

### 7.2 Fluxo de Criação de Professor 🎯

Substitui o antigo fluxo de convite.

```
1. ADMIN cria o professor na tela de usuários
   (nome, e-mail em minúsculas, matrícula, título, áreas, papel)
2. Backend cria o usuário com um password hash aleatório e inutilizável
   (ninguém conhece a senha) e registra criado_por_id
3. Gera token de reset com validade de 7 dias e envia o e-mail "defina sua senha"
4. O professor define a senha pelo fluxo de redefinição
5. O ADMIN pode editar (allowlist: nome, matrícula, título, áreas, ativo, papel) e
   desativar (ativo = false). Professor não é apagado, por causa das FKs
```

Salvaguardas: o admin não pode desativar nem rebaixar a si mesmo nem o último admin ativo; e-mail duplicado responde 409; a resposta nunca devolve token ou senha.

### 7.3 Camadas de segurança

```
1. HTTPS/TLS (produção)
2. CORS restrito ao FRONTEND_URL em produção
3. JWT estrito: HS256, sub UUID, qualquer token inválido = 401
4. checkRole: usuário lido do banco, inativo rejeitado, papel nunca vem do token
5. Autorização por dono no service (podeAcessarCandidato), 404 se negado
6. Validação Zod: UUID nos params, allowlist + .strict() nos corpos
7. Drizzle: statements parametrizados (contra SQL injection)
8. bcryptjs para senhas; passwordHash nunca sai em resposta (toUsuarioPublico)
9. RLS ligada em todas as tabelas, sem policies permissivas
10. Logs sem token, senha, CPF ou e-mail (em erros do banco, só code e constraint)
```

Endpoints públicos permitidos: login, solicitação de reset, verificação e consumo do token de reset. Todo o resto exige autenticação.

---

## Convenções e Padrões

### Nomes de arquivo

- **Componentes React**: PascalCase (`LoginForm.tsx`)
- **Hooks**: camelCase com `use`
- **Services**: kebab-case no server (`candidato.service.ts`), camelCase com sufixo `Service` no web (`authService.ts`)
- **Schemas**: `candidato.schema.ts`

### Estilo de código

- **Services**: retornam `AppResult<T, E>`, recebem `c: Context<{ Variables: AppVariables }>` primeiro e nunca conhecem HTTP.
- **Rotas**: validam, aplicam `checkRole`, chamam o service e mapeiam o erro.
- **Componentes**: chamam hooks customizados para dados; sem `fetch` direto.
- **Validação**: Zod em front e back; no back, allowlist e `.strict()`.
- **Mensagens ao usuário** em português.

### Organização

```
✅ CORRETO
// candidato.hooks.ts
export const useMeusCandidatos = () => useQuery({ ... })

// CandidatoLista.tsx
export function CandidatoLista() {
  const { data } = useMeusCandidatos()
  // ...
}

❌ INCORRETO
export function CandidatoLista() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch("/candidatos").then(...) }, [])   // sem fetch direto
}
```

---

## Performance

**Frontend:** cache do React Query (`staleTime`/`gcTime`), divisão de código por rota, tree-shaking do Tailwind.

**Backend:** índices em `avaliador_id`/`auditor_id`, sem N+1 nas listagens (um `select` com `leftJoin`), projeção só das colunas necessárias, importação em lote dentro de uma transação (e em _chunks_ se o lote crescer), `Promise.all` entre as consultas de mestrado e doutorado.

**Banco:** com poucos milhares de linhas o planner pode preferir varredura sequencial; o ganho principal dos índices em FK é na exclusão e nas checagens de integridade.

---

## Legado

Presentes no repositório mas **fora do escopo do SISSEL**; não estender. Remover só depois de confirmar que não há referências no web ou no seed:

- `apps/frontend-old`, `apps/yii2-organizacao-de-defesas`
- `packages/pdf-components` e `apps/web/app/components/pdf/` (atas e declarações de defesa)
- calendário e documentos, tabelas e telas de banca, curso e convite, e o papel `STUDENT`
- `ARCHITECTURE`-style docs antigos que citam bancas (`FLUXOS.md`, `PATTERNS.md`, `SETUP_COMPLETO.md`): usar só pelos padrões genéricos
