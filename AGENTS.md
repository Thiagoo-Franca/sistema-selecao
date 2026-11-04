# AGENTS.md

This file provides guidance to AI coding agents (Codex, Claude Code) working in this repository.

## Project Overview

**SISSEL** is a candidate selection system for the **master's (mestrado) and doctoral (doutorado)** programs of PGCOMP/UFBA. Candidates are imported from spreadsheets, automatically assigned an **avaliador** (evaluator) and an **auditor** (both TEACHER users) by area and workload, and graded in stages by them.

This is **not** a thesis committee ("banca"), defense, or course management system. Do not introduce or reintroduce `banca`, `curso`, teacher invitations, or the `STUDENT` role. Do not invent entities that do not exist (selection process/edital, application, ranking, appeals, deadlines) without the user asking; if a task seems to need one, ask first.

## Source of Truth and Migration Status

The repository is being migrated from the old banca system. **The code is the source of truth**: if this file contradicts the code, report the divergence instead of following either blindly.

Migration phases (check the code to see what is already done):

- **Phase 1** — database: UUID ids for users, enums fed by `@tcc/shared`, audit fields on notes, indexes, `onDelete` policies, RLS, removal of invitations and banca leftovers, seed split into dev and prod.
- **Phase 2** — authentication and authorization: strict JWT (401 for any provided invalid token), identity in `c.var`, ownership checks in services, no `passwordHash` in responses.
- **Later** — extract `nota` and `alocacao` out of `candidato`, DRY of queries, removal of legacy code.

Documents `ARCHITECTURE.md`, `FLUXOS.md`, `PATTERNS.md`, `SETUP.md` and `SETUP_COMPLETO.md` still describe the old banca system in places. Use them only for generic patterns, never for domain rules.

## Project Structure

Monorepo (Turborepo + npm workspaces):

- **Root**: shared scripts and deployment tools
- **apps/web**: React Router v7 frontend with TypeScript, TailwindCSS and Radix UI
- **apps/server**: Hono API server with TypeScript, Drizzle ORM and PostgreSQL (Supabase)
- **packages/shared** (`@tcc/shared`): pure code shared by web and server (score formulas, `AREAS`, `ISENCAO_STATUS`, etc.)
- **packages/tests**: shared test utilities and fixtures
- **packages/pdf-components**: legacy PDF templates from the banca system; do not extend (see Legacy)
- **apps/frontend-old**, **apps/yii2-organizacao-de-defesas**: legacy, deprecated

### Shared package rules

- Always import from the package root: `import { calcularMestradoNota } from "@tcc/shared"`. Never import subpaths such as `@tcc/shared/src/...` (the `exports` field blocks them).
- Everything in `@tcc/shared` must be pure: no React, DOM, Hono, Drizzle or `@/` imports.
- Domain constants (areas, isenção status, GRU status) live here once and feed the Drizzle `pgEnum`, the Zod schemas and the frontend selects.

## Development Commands

### Root Level Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run tscheck` - Run TypeScript type checking across all workspaces
- `npm run test` - Run all tests with TUI interface
- `npm run test:e2e` - Run end-to-end tests for web app
- `npm run deploy` - Run deployment script

### Database Management

- `npm run docker:up` / `docker:down` / `docker:clean` / `docker:connect` - Local PostgreSQL container (the remote database is on Supabase and contains only test data for now)
- `npm run db:push` - Push schema changes to the database
- `npm run migration:gen` / `migration:run` - Generate and run Drizzle migrations
- `npm run db:studio` - Drizzle Studio

### Frontend (apps/web)

- `npm run dev`, `build`, `start`
- `npm run test`, `test:ui`, `test:headed`, `test:debug`, `test:report` - Playwright
- `npm run tscheck` - Type checking with React Router typegen

### Backend (apps/server)

- `npm run dev` - Development server with hot reload (`tsx watch`)
- `npm run dev:test` - Test server for E2E tests
- `npm run test` - Vitest unit tests
- `npm run seed` - Seed database with test data
- `npm run tscheck` - TypeScript type checking

## Technology Stack

Import patterns: this codebase uses `@/` imports, not `~/`.

### Frontend

- **Framework**: React Router v7 with SSR
- **Styling**: TailwindCSS v4 with Radix UI primitives
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Testing**: Playwright for E2E tests
- **HTTP Client**: Hono RPC client for type-safe API calls
- **Notifications**: Sonner for toast notifications

### Backend

- **Framework**: Hono
- **Database**: PostgreSQL (Supabase) with Drizzle ORM
- **Authentication**: JWT (HS256) with bcryptjs
- **Email**: Nodemailer
- **Testing**: Vitest for unit tests, PGlite for the test database
- **Error Handling**: ts-pattern for exhaustive error matching
- **Validation**: Zod schemas with Hono `zValidator`

## Domain Model

See `apps/server/src/database/schema.ts` for the complete schema. Key entities:

- **Users** (`usuario`): `ADMIN` and `TEACHER`, with `areas` (array of the `area` enum) and an `ativo` flag. Candidates are never users.
- **CandidatoMestrado** / **CandidatoDoutorado**: share `candidatoBaseColumns` (identification, GRU, isenção, cotas, `avaliadorId`, `auditorId`) and add program-specific fields.
- **NotaMestrado** / **NotaDoutorado**: 1:1 with the candidate (`idCandidato` unique, FK with cascade). They hold the grade parts, `avaliado`, `notaFinal`, `formulaVersion`, and audit fields (`avaliadoEm`, `avaliadoPorId`).
- **ResetPasswords**: single-use password tokens, also used for new teachers to set their first password.
- **Feedback system**: `feedback_submission`, `feature_request`, `feature_request_vote` (kept from the previous system).

### Grading rules

- Master's and doctorate have different fields, stages and formulas (`calcularMestradoNota`, `calcularNotaDoutoradoEtapa1` in `@tcc/shared`). **Do not unify them into a generic model** where the rules diverge.
- `notaFinal` is **persisted** together with its parts and `formulaVersion`; it is never recomputed retroactively when the formula changes. A formula change means a new `formulaVersion`, not a silent recalculation.
- `avaliado`, `notaFinal`, `formulaVersion`, `avaliadoEm` and `avaliadoPorId` are written **only by the nota service**, in the same transaction that reads and locks the row (`for("update")`). They never come from the client: update schemas use allowlists and `.strict()`.
- Partial updates merge with the stored values before calculating. Never zero missing fields with `?? 0` on a `Partial` body.
- `avaliado` becomes true only when the grade was actually modified, not when only a field like `avaliadorId` changed.
- Numeric columns use `numeric(..., { mode: "number" })`. Round once, in the calculation function.

### Allocation rules

- On import, avaliador = TEACHER (active) from the candidate's first area preference with the lowest workload; if none, the second area; otherwise empty.
- Auditor = same order of areas, different from the avaliador; if nobody in the areas, any other active TEACHER with the lowest workload.
- Allocation runs inside the import transaction under an advisory lock. Changing a professor's areas does not reallocate existing candidates; reallocation is an explicit admin action.

## Roles, Identity and Authorization

- Only two roles: `ADMIN` and `TEACHER`.
- **ADMIN** accesses and edits everything, manages users, imports candidates and reassigns evaluators.
- **TEACHER** accesses and edits only candidates where they are the avaliador **or** the auditor (either link is enough). Both have the same grading permissions.
- Identity comes from the authenticated user in `c.var`, loaded from the database by `checkRole` (inactive users are rejected; the role is never trusted from the JWT payload). **Never** take identity from the URL or the body.
- Authorization is a business rule and lives in the **service**, through the pure function `podeAcessarCandidato(usuario, candidato)` and its SQL counterpart used in listings. Never rely on the frontend.
- Denied access to a candidate returns **404**, not 403, so existence is not confirmed. Administrative operations return 403.
- Every route of candidates and notes uses `checkRole(["ADMIN", "TEACHER"])` or stricter. Delete, import and reassignment are ADMIN only.

## Architecture Notes

### Module Structure

Modules live in `apps/server/src/modules/`:

- `auth/` - login, password reset, JWT and identity middleware
- `usuario/` - user management (admin screen), profile, public user mapper
- `candidato/` - candidate queries, updates, deletion, import
- `nota/` - grade updates (target: extracted from `candidato`)
- `alocacao/` - pure allocation policy and its persistence (target: extracted from `candidato`)
- `feedback/` - feedback and feature requests

### Layers (atomic design)

- **Atoms**: pure functions with no I/O, no Hono, no Drizzle (score calculation, normalization, allocation policy, access rules). Testable without a database.
- **Molecules**: services/use cases that compose atoms and access the database, using a transaction when more than one table or a read-merge-write is involved. Return `AppResult`.
- **Organisms**: routes that only validate input, apply `checkRole`, call a service and map errors to HTTP.
- Extract only **real** duplication (same rule, would change together). Keep accidental duplication separate (master's vs doctorate formulas and fields). Do not add repositories, DI containers or generic base use cases.

### Database Configuration

- Drizzle ORM with PostgreSQL (Supabase); connection via `DATABASE_URL` as the `postgres` user.
- Migrations are version-controlled in `apps/server/src/database/drizzle/`.
- Test database uses PGlite.
- Every table uses `.enableRLS()` with **no permissive policies**: the backend connects as `postgres` (bypasses RLS) and RLS only closes the Supabase REST API.
- Renaming an enum value requires `ALTER TYPE ... RENAME VALUE` in the database; changing only the schema makes `db:push` fail.

### Testing Strategy

- Unit tests for business logic with Vitest; pure atoms are tested without a database.
- PGlite for services and routes.
- E2E tests with Playwright start both frontend and backend; test server runs with `npm run dev:test`.
- Fixtures in `packages/tests/src/fixtures/`, utilities in `packages/tests/src/utils/`.
- Fixtures: admin, teacher A, teacher B, inactive teacher, master's and doctorate candidates with assigned avaliador/auditor.
- Always cover: 401 (no, malformed or expired token; inactive user), 404 for unassigned candidates, rejection of system fields in update bodies, and score edge cases (stage I failed, stage II missing, thresholds).

## Environment Setup

Required environment variables (validated by the server `envSchema`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - **required, at least 32 characters, no fallback value** (the server must fail to start in production without it)
- `FRONTEND_URL` - frontend URL used in email links (default: http://localhost:5173)
- `VITE_API_URL` - API URL used by the frontend
- `SMTP_USER`, `SMTP_PASSWORD` - Gmail username and app password
- `NODE_ENV` - `production` for real emails; otherwise Ethereal test emails
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - used only by the production seed that creates the first admin (idempotent, never hardcoded)

Keep secrets out of the repository, logs and chat. Rotate `DATABASE_URL` credentials if they leak.

## Deployment

- `npm run deploy` runs `scripts/deploy.ts`; separate production branches for web and server; `npm run sync`, `push:web` and `push:server` deploy to Dokku.
- The server runs TypeScript directly with `tsx`, so `@tcc/shared` is consumed as source.
- Caution: the `vercel-build` script bundles with `--packages=external`, which would leave `@tcc/shared` out of the bundle. Confirm whether Vercel is actually used before relying on it.

## API Client Pattern

The frontend uses Hono's RPC client for type-safe communication:

- **Client**: `apps/web/app/services/apiClient.ts` (types come from `AppType` exported by `@tcc/server`; only types cross, never runtime server code)
- **Mutations**: `apps/web/app/services/authService.ts` and TanStack Query hooks in `apps/web/app/hooks/`
- **Pattern**: always use mutations/queries, never `fetch` directly
- **401 handling** happens in one place (`apiClient`/`rpcReturn`): clear the token and redirect to login

```typescript
// ✅ Correct - Use mutations
const loginMutation = useLoginMutation()
loginMutation.mutate({ json: { email, password } })

// ❌ Incorrect - Don't use fetch directly
fetch('/api/auth/login', { method: 'POST', ... })
```

Changing a route or a Zod schema changes the `AppType` and breaks the web at type level; use `npm run tscheck` as the checklist of screens to adjust.

## Email System

- **Service**: `apps/server/src/services/email.service.ts`
- **Templates**: `createXxxEmail()` functions with responsive HTML, security warnings for sensitive emails
- **Development**: Ethereal (preview URL in the console); **Production**: Gmail SMTP with app passwords
- **Emails**: password reset (1 hour) and "set your password" for new teachers (7 days). There are no invitation emails.

## Security Features

### Password Reset Flow

1. User requests reset via email (the response never reveals whether the email exists)
2. System generates a secure token with `crypto.randomBytes` and stores its expiration
3. Email is sent with the reset link
4. User sets a new password; the token is validated and consumed (single use)
5. Password is hashed with bcryptjs; expired and used tokens are cleaned up

### Teacher Creation Flow

1. An ADMIN creates the teacher (name, email normalized to lowercase, registration, title, areas, role) in the admin screen
2. The user is created with an **unusable random password hash**; nobody knows a password
3. A reset token with a 7-day expiration is generated and emailed ("set your password")
4. The teacher sets the password through the normal reset flow
5. The first admin is created by the production seed from environment variables

Rules: an admin cannot deactivate or demote themselves nor the last active admin; editing uses an allowlist (name, registration, title, areas, `ativo`, `role`); duplicate email returns `duplicate_email` (409); teachers are deactivated (`ativo = false`), not deleted.

### Authentication

- `appJwt`: no `Authorization` header continues without a payload; any provided token that is malformed, invalid or expired returns **401** with a generic message
- Algorithm explicitly HS256; `sub` must be a UUID string
- `checkRole` reads the user from the database (existence, `ativo`, role) and exposes it in `c.var`
- Never return `passwordHash` or internal fields; use `toUsuarioPublico` in every user response
- Never log tokens, passwords, CPF or email; for database errors log only `code` and `constraint`
- Restrict CORS `origin` to `FRONTEND_URL` in production
- Public endpoints are only: login, reset request, reset token verification and consumption

## Code Conventions

### File Structure & Naming

- **kebab-case** for file names: `user-service.ts`, `password-reset.tsx`
- **PascalCase** for React components: `LoginForm.tsx`
- **camelCase** for functions and variables: `requestPasswordReset`, `isLoading`
- **SCREAMING_SNAKE_CASE** for constants: `JWT_SECRET`, `AUTH_TOKEN_KEY`
- User-facing messages (errors, toasts, labels) are in Portuguese

### Backend Conventions

#### Module Files

```
module-name/
├── module.route.ts     # Route definitions: validation, checkRole, error mapping
├── module.service.ts   # Use cases: business logic and database operations
├── module.schema.ts    # Zod validation schemas
├── module.test.ts      # Unit tests
```

#### Service Functions

- Always return `AppResult<T, E>`
- Use discriminated error types: `{ type: "candidato_not_found" | "duplicate_email" | "database_error" }`
- Never use `ok(null)` to mean "not found"; return a typed error
- Include `c: Context<{ Variables: AppVariables }>` as first parameter; the authenticated user comes from `c.var`, not from extra identity parameters
- Use `try/catch` with contextual error logging (without sensitive data)

#### Route Handlers

- `zValidator` for body, query and params; validate every `:id` with `z.string().uuid()` so malformed ids are 400, not a database cast error (500)
- Update schemas use `.pick` allowlists or explicit `.omit` of `id`, `tipoCurso`, `avaliadorId`, `auditorId`, `avaliado`, `notaFinal`, `formulaVersion`, `avaliadoEm`, `avaliadoPorId`, `createdAt`, `updatedAt`, plus `.strict()`
- Never pass a request body directly to `.set()` or `.values()`
- `match` from `ts-pattern` with `.exhaustive()` for error mapping, throwing `AppError`
- Follow RESTful conventions

```typescript
.post("/", checkRole(["ADMIN"]), zValidator("json", createUserSchema), async (c) => {
  const validatedData = c.req.valid("json")
  const result = await service.createUser(c, validatedData)
  if (!result.ok) {
    throw match(result.error)
      .with({ type: "duplicate_email" }, () => new AppError(409, "Email já cadastrado"))
      .with({ type: "database_error" }, () => new AppError(500, "Erro interno"))
      .exhaustive()
  }
  return c.json(toUsuarioPublico(result.data), 201)
})
```

#### Database Operations

- Drizzle ORM with typed queries; `.limit(1)` for single-record queries
- Descriptive variable names: `existingUser`, `newCandidato`
- Transactions for multi-table operations and for read-merge-write
- Responses are mapped to public DTOs; do not leak `$inferSelect` rows that contain internal fields

### Database Schema Conventions

- **snake_case** for columns (`created_at`, `password_hash`), **camelCase** for TypeScript fields
- Primary keys of users and candidates are **UUID** (`uuid("id").primaryKey().defaultRandom()`); all FKs to them are `uuid`
- Audit fields: `createdAt` and `updatedAt` (`updatedAt` with `.$onUpdate(() => new Date())`)
- Explicit `onDelete` on every FK (`cascade` for notes, `set null` for avaliador, auditor and `avaliadoPorId`)
- Enums via `pgEnum` fed by constants from `@tcc/shared`
- Indexes on FK columns used in filters (`avaliador_id`, `auditor_id`); `UNIQUE` columns are already indexed, so do not add redundant indexes
- `.enableRLS()` on every table
- Do not declare types for entities already exported as `Insert[Entity]` / `Select[Entity]` from `apps/server/src/database/schema.ts`

### Frontend Conventions

#### Component Structure

- Function declarations for components: `export function LoginForm() {}`
- Explicit return statements instead of arrow auto-returns: `function Component() { return (...) }`
- Group hooks at the top of the component
- TypeScript interfaces for props: `interface LoginFormProps {}`
- React Hook Form and Zod for forms; reuse Zod schemas and `@tcc/shared` constants (areas, isenção labels) instead of redeclaring them

#### State Management

- TanStack Query for server state; `useState` for local state; custom hooks for complex logic
- Prefix booleans with `is`, `has`, `should`
- **State colocation**: move `useState` and `useEffect` as close as possible to the leaf components that use them
- **Avoid prop drilling**: call `useNavigate()` and similar hooks directly in the component that needs them
- Do not recompute `notaFinal` on the client with the current formula; show the value stored by the server (a client-side calculation is only a live preview in forms)

```typescript
// ✅ Good - state managed in the component that uses it
function ObservacoesGerais() {
  const [observacoes, setObservacoes] = useState("")
  return <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
}

// ✅ Good - each component uses its own navigate hook
function AccessDeniedMessage() {
  const navigate = useNavigate()
  return <Button onClick={() => navigate(-1)}>Voltar</Button>
}
```

#### API Integration

- Use Hono RPC client mutations/queries; never `fetch` directly
- Handle loading with `isPending`; use `onSuccess` and `onError` callbacks and Sonner toasts
- A 404 on a candidate shows a neutral message ("Candidato não encontrado")

#### UI Components

- Radix UI primitives with custom styling; `cn()` for conditional classes
- Semantic HTML, ARIA labels, consistent loading and disabled states

### Component Size and Reusability

- Break down components over 100-150 lines or with repetitive JSX; 3+ similar blocks should be extracted
- Extract reusable UI patterns (`ReviewSection`, `ReviewField`, `ReviewGrid`, `SectionHeader`)
- Prefer composition of small single-purpose components

```tsx
// ❌ Avoid - repetitive JSX
<div>
  <p className="text-sm text-muted-foreground">Field Label</p>
  <p className="font-medium">{value}</p>
</div>

// ✅ Good - reusable component
<ReviewField label="Field Label" value={value} />

// ✅ Good - focused sections
function CandidatoReview() {
  return (
    <>
      <CandidatoIdentificacaoSection candidato={candidato} />
      <CandidatoNotasSection notas={candidato.notas} />
      <CandidatoAvaliadoresSection avaliador={candidato.avaliador} auditor={candidato.auditor} />
    </>
  )
}
```

## Development Guidelines

### Adding New API Endpoints

1. Add the route in the appropriate module (e.g. `apps/server/src/modules/candidato/candidato.route.ts`) with `checkRole` and UUID param validation
2. Add the service function returning `AppResult` with discriminated errors and the ownership check
3. Add the Zod schema (allowlist, `.strict()`)
4. Add a mutation/query hook in the frontend (`authService.ts` or `apps/web/app/hooks/`)
5. Use it in components and run `npm run tscheck`
6. Add tests: success, 401, 404 for unassigned candidates, allowlist rejection

### Changing the schema

1. Edit `schema.ts`, then `npm run db:push` (development) and `npm run tscheck`
2. Search the codebase for the old names (`Select-String` on PowerShell or `grep`): strings, raw queries, `queryKey`s and filters escape the compiler
3. One commit per step, with `tscheck` and tests green before moving on

## Reminders

- Always run `npm run tscheck` (and `npm run test` in `apps/server`) before finishing
- Make targeted, minimal edits; do not rewrite or reformat whole files for scoped changes
- Prefer the simplest structure that solves the problem; no new layers without a concrete problem

## Code Style Notes

- Avoid unnecessary type declarations when types are already inferred
- Stop declaring types for entities already defined as `Insert[Entity]` / `Select[Entity]` in `apps/server/src/database/schema.ts`

## Developer Tips

- Ao invés de usar comentários com TODO, use `apps/server/src/todo.ts` ou `apps/web/app/lib/utils.ts#TODO`
- The development machine is Windows with PowerShell: use PowerShell equivalents (`Get-ChildItem`, `Select-String`) instead of `ls -la` or `grep` in instructions

## Legacy (do not extend)

- `packages/pdf-components` and `apps/web/app/components/pdf/` (`ata-defesa`, `declaracao-participacao`, `declaracao-orientacao`) belong to the banca system. The institution is UFBA (not UFRN). Do not add new defense documents; confirm with the user before removing them.
- `apps/frontend-old`, `apps/yii2-organizacao-de-defesas`, calendar and document services, banca/curso/invitation tables and emails: remove only after confirming there are no references in the web app or the seed.
