# 🔄 FLUXOGRAMAS VISUAIS E MENTAIS

> Representações visuais dos fluxos principais da aplicação

## 📋 Índice

1. [Login Completo](#login-completo)
2. [Criar Defesa](#criar-defesa)
3. [Convite de Professor](#convite-de-professor)
4. [Convite de Aluno](#convite-de-aluno)
5. [Reset de Senha](#reset-de-senha)
6. [Requisição Autenticada](#requisição-autenticada)
7. [Fluxo de Cache (React Query)](#fluxo-de-cache-react-query)

---

## Login Completo

### Visão Macro

```
┌─────────────────────────────────────────────────────────────┐
│ PÁGINA: / (Home)                                            │
└─────────────────────────────────────────────────────────────┘

useUser() hook chamado
  ↓
localStorage.getItem("authToken")  ← Sem token
  ↓
Authorization header não injetado
  ↓
GET /usuario/me sem header
  ↓
Backend: sem jwtPayload
  ↓
Retorna 401 ou null
  ↓
Frontend renderiza LoginForm
```

### Detalhado: Passo-a-Passo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERAGE                                            │
└─────────────────────────────────────────────────────────────┘

LoginForm.tsx renderizado
  │
  User digita:
  ├─ Email: "professor@ufba.br"
  ├─ Password: "MinhaSenha123"
  │
  Clica "Entrar"
  │
  form.handleSubmit(onSubmit) executado
  │

┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDAÇÃO CLIENT-SIDE                                    │
└─────────────────────────────────────────────────────────────┘

  React Hook Form + Zod Schema:
  ├─ email: z.string().email()
  │  ✓ "professor@ufba.br" → válido
  │
  ├─ password: z.string().min(1)
  │  ✓ "MinhaSenha123" → válido
  │
  ✅ Formulário válido → continua
  ✗ Se inválido → mostrar erros inline, PARA aqui
  │

┌─────────────────────────────────────────────────────────────┐
│ 3. API CALL                                                 │
└─────────────────────────────────────────────────────────────┘

  loginMutation.mutate({
    json: { 
      email: "professor@ufba.br",
      password: "MinhaSenha123"
    }
  })
  │
  apiClient.auth.login.$post() chamado
  │
  Hono RPC Client intercepta:
  ├─ Authorization header → undefined (sem token)
  ├─ Content-Type → application/json
  └─ Envia POST request
  │

┌─────────────────────────────────────────────────────────────┐
│ 4. REDE (HTTP)                                              │
└─────────────────────────────────────────────────────────────┘

  POST http://localhost:9000/auth/login HTTP/1.1
  Host: localhost:9000
  Content-Type: application/json
  
  {
    "email": "professor@ufba.br",
    "password": "MinhaSenha123"
  }
  │

┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND: RECEBE REQUEST                                  │
└─────────────────────────────────────────────────────────────┘

  index.ts: Middlewares globais executados
  ├─ poweredBy()  → Adiciona header
  ├─ logger()     → Log request
  ├─ cors()       → Permite origem
  ├─ prettyJSON() → Formata response
  │
  └─ appJwt()     → Decodifica token
     ├─ Authorization header vazio
     ├─ ctx.set("jwtPayload", undefined)
     └─ continua sem auth
  │
  auth.route.ts: POST /auth/login handler
  ├─ zValidator("json", loginSchema)
  │  ├─ Valida email → "professor@ufba.br" ✅
  │  └─ Valida password → string ✅
  │
  └─ loginUserService(c, email, password)
  │

┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND: LÓGICA DE NEGÓCIO (auth.service.ts)            │
└─────────────────────────────────────────────────────────────┘

  export const loginUserService = async (
    c: Context,
    email: string,
    password: string
  ): Promise<AppResult<LoginResponse, LoginError>> => {
    try {
      // 6.1: Busca usuário no banco
      const db = c.get("db")
      const user = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1)
      
      if (!user.length) {
        // Usuário não existe
        return err({ type: "invalid_credentials" })
      }
      
      // 6.2: Verifica senha
      const passwordMatch = await bcryptjs.compare(
        password,
        user[0].passwordHash
      )
      
      if (!passwordMatch) {
        // Senha incorreta
        return err({ type: "invalid_credentials" })
      }
      
      // 6.3: Gera JWT
      const token = await sign(
        {
          sub: user[0].id.toString(),
          role: user[0].role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400,  // +24h
        },
        JWT_SECRET
      )
      
      // 6.4: Retorna resultado
      return ok({
        token,
        user: {
          id: user[0].id,
          email: user[0].email,
          nome: user[0].nome,
          role: user[0].role,
        }
      })
    } catch (error) {
      console.error("Login error:", error)
      return err({ type: "database_error", error })
    }
  }
  │

┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND: ROUTE MAPEIA RESULTADO                         │
└─────────────────────────────────────────────────────────────┘

  const result = await loginUserService(c, email, password)
  │
  if (!result.ok) {
    throw match(result.error)
      .with({ type: "invalid_credentials" },
        () => new AppError(403, "Email ou senha inválidos"))
      .with({ type: "database_error" },
        () => new AppError(500, "Erro ao fazer login"))
      .exhaustive()
  }
  │
  return c.json(result.data, 200)
  │

┌─────────────────────────────────────────────────────────────┐
│ 8. REDE (HTTP RESPONSE)                                     │
└─────────────────────────────────────────────────────────────┘

  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "email": "professor@ufba.br",
      "nome": "Prof. João Silva",
      "role": "TEACHER"
    }
  }
  │

┌─────────────────────────────────────────────────────────────┐
│ 9. FRONTEND: PROCESSA RESPOSTA                              │
└─────────────────────────────────────────────────────────────┘

  rpcReturn(response)
  ├─ response.ok === true ✅
  ├─ data = await response.json()
  └─ return data
  │
  loginMutation.onSuccess(data) executado
  │

┌─────────────────────────────────────────────────────────────┐
│ 10. FRONTEND: ARMAZENA TOKEN                                │
└─────────────────────────────────────────────────────────────┘

  storeAuthToken(data.token)
  └─ localStorage.setItem("authToken", "eyJhbGc...")
  │
  ✅ Token salvo no browser!
  │

┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND: ATUALIZA CACHE                                │
└─────────────────────────────────────────────────────────────┘

  queryClient.setQueryData(["user", "me"], data.user)
  │
  ✅ React Query cache atualizado!
  ├─ Próximas chamadas useUser() retornam cache (sem fetch)
  └─ Invalida queries obsoletas
  │

┌─────────────────────────────────────────────────────────────┐
│ 12. FRONTEND: NAVEGA                                        │
└─────────────────────────────────────────────────────────────┘

  navigate("/dashboard")
  │
  ✅ Redireciona para dashboard
  │
  useUser() chamado
  ├─ localStorage.getItem("authToken") ✅ Token existe!
  ├─ Authorization: Bearer eyJhbGc... injetado
  ├─ GET /usuario/me com token
  ├─ Backend decodifica token ✅
  └─ Retorna dados do usuário
  │
  Dashboard renderizado com dados frescos
```

---

## Criar Defesa

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PROFESSOR CLICA "CRIAR DEFESA"                           │
└─────────────────────────────────────────────────────────────┘

  Navega para /add-banca
  │
  BancaForm component renderizado
  │

┌─────────────────────────────────────────────────────────────┐
│ 2. FETCH DE DADOS NECESSÁRIOS                               │
└─────────────────────────────────────────────────────────────┘

  useTeachers()
  ├─ useQuery em background
  ├─ GET /usuario/teachers
  └─ Carrega lista de professores
  │
  useCursos()
  ├─ useQuery em background
  ├─ GET /cursos
  └─ Carrega lista de cursos
  │
  useStudents()
  ├─ useQuery em background
  ├─ GET /usuario/students
  └─ Carrega lista de alunos
  │

┌─────────────────────────────────────────────────────────────┐
│ 3. FORM RENDERIZADO                                         │
└─────────────────────────────────────────────────────────────┘

  <BancaForm>
  ├─ Preselects professor (usuário logado)
  ├─ Dropdown: Selectcurso
  ├─ Dropdown: Selecobrar aluno
  ├─ Input: título do trabalho
  ├─ Input: data de realização
  ├─ Input: resumo
  ├─ Input: abstract
  ├─ Input: palavras-chave
  ├─ Multiselect: avaliadores
  └─ Button: "Criar Defesa"
  │
  Professor preenche formulário
  │

┌─────────────────────────────────────────────────────────────┐
│ 4. CLICA "CRIAR DEFESA"                                     │
└─────────────────────────────────────────────────────────────┘

  form.handleSubmit(onSubmit) executado
  │

┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDAÇÃO CLIENT-SIDE (Zod)                              │
└─────────────────────────────────────────────────────────────┘

  insertBancaSchema.parse(formData)
  ├─ tituloTrabalho: min(1) ✅
  ├─ dataRealizacao: date() ✅
  ├─ resumo: min(1) ✅
  ├─ abstract: min(1) ✅
  ├─ palavrasChave: min(1) ✅
  ├─ avaliadores: min(1) ✅
  │
  ✅ Válido → continua
  ✗ Se inválido → mostrar erros, para aqui
  │

┌─────────────────────────────────────────────────────────────┐
│ 6. API CALL                                                 │
└─────────────────────────────────────────────────────────────┘

  useCreateBanca().mutate({
    json: {
      cursoId: 1,
      alunoId: 50,
      tituloTrabalho: "Meu TCC Incrível",
      dataRealizacao: "2024-12-15T14:00:00Z",
      resumo: "...",
      abstract: "...",
      palavrasChave: "...",
      membros: [
        { userId: 60, role: "avaliador" },
        { userId: 70, role: "avaliador" }
      ]
    }
  })
  │
  POST /banca
  Authorization: Bearer <token>
  │

┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND: VALIDAÇÃO                                       │
└─────────────────────────────────────────────────────────────┘

  zValidator("json", insertBancaSchema)
  ├─ Valida schema novamente (double-check)
  └─ Continua se válido
  │
  checkRole(["TEACHER", "ADMIN"])
  ├─ Extrai userId do JWT
  ├─ Verifica role = TEACHER ou ADMIN
  └─ Continua se autorizado
  │

┌─────────────────────────────────────────────────────────────┐
│ 8. BACKEND: LÓGICA (banca.service.ts)                       │
└─────────────────────────────────────────────────────────────┘

  createBancaService(c, data)
  │
  ├─ Verifica se curso existe
  │  SELECT FROM curso WHERE id = $
  │  ✗ Se não → err({ type: "curso_not_found" })
  │  ✅ Se sim → continua
  │
  ├─ Verifica aluno não tem outra banca este curso
  │  SELECT FROM banca WHERE aluno_id = $ AND curso_id = $
  │  ✗ Se existe → err({ type: "aluno_already_has_banca" })
  │  ✅ Se não → continua
  │
  ├─ INSERT INTO banca (...)
  │  ├─ Retorna { id: 123, ... }
  │  └─ [newBanca] = resultado
  │
  ├─ INSERT INTO usuarios_banca (...)
  │  ├─ Professor como orientador
  │  ├─ Aluno como aluno
  │  ├─ Cada avaliador com role avaliador
  │  └─ Vários inserts
  │
  └─ return ok(newBanca)
  │

┌─────────────────────────────────────────────────────────────┐
│ 9. BACKEND: ROUTE MAPEIA                                    │
└─────────────────────────────────────────────────────────────┘

  if (!result.ok) {
    throw new AppError(...)  // apropriado HTTP status
  }
  │
  return c.json(result.data, 201)  // 201 Created
  │

┌─────────────────────────────────────────────────────────────┐
│ 10. FRONTEND: RECEBE RESPOSTA                               │
└─────────────────────────────────────────────────────────────┘

  onSuccess(newBanca)
  │
  ├─ queryClient.invalidateQueries(["banca"])
  │  └─ Força refetch de todas queries bancas
  │
  ├─ toast("✅ Defesa criada com sucesso!")
  │  └─ Sonner notification
  │
  └─ navigate(`/banca/123`)
     └─ Redireciona para detalhes da defesa
  │

┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND: RENDERIZA DETALHES                            │
└─────────────────────────────────────────────────────────────┘

  /banca/123 page
  │
  useBancaById(123)
  ├─ GET /banca/123 com Authorization
  ├─ Backend retorna banca + relacionados
  └─ React Query cacheia com key ["banca", { id: 123 }]
  │
  BancaDetail component renderizado com dados frescos
```

---

## Convite de Professor

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN NO DASHBOARD → "CONVIDAR PROFESSOR"                │
└─────────────────────────────────────────────────────────────┘

  Dialog abre
  ├─ Email input
  ├─ Nome input
  └─ Button: "Enviar Convite"
  │
  Admin preenche:
  ├─ Email: "novoprofessor@ufba.br"
  └─ Nome: "Prof. Maria"
  │
  Clica "Enviar Convite"
  │

┌─────────────────────────────────────────────────────────────┐
│ 2. API CALL                                                 │
└─────────────────────────────────────────────────────────────┘

  useCreateTeacherInvitation().mutate({
    json: {
      email: "novoprofessor@ufba.br",
      nome: "Prof. Maria"
    }
  })
  │
  POST /teacher-invitation
  Authorization: Bearer <admin-token>
  │

┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND: VALIDAÇÃO                                       │
└─────────────────────────────────────────────────────────────┘

  checkRole(["ADMIN"])
  ├─ userId = c.get("jwtPayload").sub
  ├─ Verifica role = ADMIN
  └─ ✅ Autorizado → continua
  │
  zValidator("json", createInvitationSchema)
  ├─ Email válido ✅
  ├─ Nome não vazio ✅
  └─ Continua
  │

┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND: LÓGICA                                          │
└─────────────────────────────────────────────────────────────┘

  createTeacherInvitationService(c, data)
  │
  ├─ Gera hash seguro
  │  const hash = crypto
  │    .randomBytes(32)
  │    .toString('hex')
  │  hash = "a7f3b21e8c4d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"
  │
  ├─ INSERT INTO teacher_invitation
  │  ├─ email: "novoprofessor@ufba.br"
  │  ├─ nome: "Prof. Maria"
  │  ├─ invitation_hash: hash
  │  ├─ status: 'pending'
  │  ├─ expires_at: NOW() + 7 days
  │  ├─ invited_by: adminUserId
  │  └─ user_id: NULL (será preenchido ao aceitar)
  │
  ├─ Envia email
  │  const emailResult = await sendEmail({
  │    to: "novoprofessor@ufba.br",
  │    subject: "Convite para ser Professor",
  │    html: `Clique aqui para completar cadastro:
  │           http://localhost:5173/teacher-invitation/${hash}`
  │  })
  │
  │  ✅ Email enviado (ou em desenvolvimento: Ethereal preview)
  │
  └─ return ok({ message: "Convite enviado" })
  │

┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: RESPOSTA AO ADMIN                              │
└─────────────────────────────────────────────────────────────┘

  onSuccess()
  ├─ toast("✅ Convite enviado!")
  ├─ Dialog fecha
  └─ queryClient.invalidateQueries(["invitations"])
  │

┌─────────────────────────────────────────────────────────────┐
│ 6. PROFESSOR RECEBE EMAIL                                   │
└─────────────────────────────────────────────────────────────┘

  Email:
  From: noreply@ufba.br
  To: novoprofessor@ufba.br
  Subject: Convite para ser Professor
  
  Body: Clique aqui para aceitar:
  http://localhost:5173/teacher-invitation/a7f3b21e8c4d9e1f
  │
  Professor clica link
  │

┌─────────────────────────────────────────────────────────────┐
│ 7. FRONTEND: PÁGINA DE ACEITAÇÃO                            │
└─────────────────────────────────────────────────────────────┘

  Navega para /teacher-invitation/:hash
  hash = "a7f3b21e8c4d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"
  │
  useVerifyTeacherInvitation(hash)
  ├─ GET /teacher-invitation/verify/hash
  │
  ├─ Backend:
  │  SELECT FROM teacher_invitation WHERE invitation_hash = $
  │  ├─ Se não existe → 404
  │  ├─ Se expirado → 410
  │  ├─ Se status ≠ pending → 410
  │  └─ ✅ Se válido → return { email, nome, expiresAt }
  │
  └─ Frontend renderiza TeacherInvitationAcceptForm
  │
  Form pré-preenchido:
  ├─ Email: "novoprofessor@ufba.br" (readonly)
  ├─ Nome: "Prof. Maria" (readonly)
  └─ Inputs:
     ├─ Password
     ├─ School
     └─ AcademicTitle
  │
  Professor edita password e detalhes
  │

┌─────────────────────────────────────────────────────────────┐
│ 8. PROFESSOR CLICA "ACEITAR CONVITE"                        │
└─────────────────────────────────────────────────────────────┘

  useAcceptTeacherInvitation().mutate({
    json: {
      hash: "a7f3b21e8c4d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      password: "NovasSenha123",
      school: "Instituto de Computação",
      academicTitle: "Doutor"
    }
  })
  │
  POST /teacher-invitation/accept
  │

┌─────────────────────────────────────────────────────────────┐
│ 9. BACKEND: ACEITAR CONVITE                                 │
└─────────────────────────────────────────────────────────────┘

  acceptTeacherInvitationService(c, data)
  │
  ├─ Valida hash
  │  SELECT FROM teacher_invitation
  │  WHERE invitation_hash = $ AND status = 'pending'
  │  AND expires_at > NOW()
  │
  │  ✗ Se invalida → err({ type: "invalid_hash" })
  │  ✅ Se válida → continua, teaherInv = resultado
  │
  ├─ Cria novo User
  │  const passwordHash = bcryptjs.hash(password, 10)
  │  const [newUser] = await db.insert(Users).values({
  │    email: teacherInv.email,
  │    nome: teacherInv.nome,
  │    password_hash: passwordHash,
  │    school: data.school,
  │    academic_title: data.academicTitle,
  │    role: "TEACHER",
  │    matricula: generateMatricula()
  │  }).returning()
  │
  ├─ Marca convite como usado
  │  UPDATE teacher_invitation
  │  SET status = 'used', user_id = newUser.id
  │  WHERE id = teacherInv.id
  │
  ├─ Gera JWT para novo user
  │  const token = await sign({
  │    sub: newUser.id.toString(),
  │    role: "TEACHER"
  │  }, JWT_SECRET)
  │
  └─ return ok({
       token,
       user: newUser
     })
  │

┌─────────────────────────────────────────────────────────────┐
│ 10. FRONTEND: ARMAZENA TOKEN E NAVEGA                       │
└─────────────────────────────────────────────────────────────┘

  onSuccess(data)
  ├─ storeAuthToken(data.token)
  │  localStorage.setItem("authToken", token)
  │
  ├─ queryClient.setQueryData(["user", "me"], data.user)
  │  Cache atualizado!
  │
  ├─ toast("✅ Bem-vindo! Seu account foi criado.")
  │
  └─ navigate("/dashboard")
     Professor já autenticado!
```

---

## Reset de Senha

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICA "ESQUECI SENHA"                               │
└─────────────────────────────────────────────────────────────┘

  Navega para /reset-password
  │
  RequestPasswordResetForm renderizado
  ├─ Email input
  └─ Button: "Enviar Link"
  │
  User entra email
  │

┌─────────────────────────────────────────────────────────────┐
│ 2. API CALL                                                 │
└─────────────────────────────────────────────────────────────┘

  useRequestPasswordResetMutation().mutate({
    json: { email: "user@ufba.br" }
  })
  │
  POST /usuario/request-password-reset
  │

┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND: LÓGICA (SEGURA!)                                │
└─────────────────────────────────────────────────────────────┘

  requestPasswordResetService(c, email)
  │
  ├─ SELECT FROM users WHERE email = $
  │
  ├─ ✗ Se não existe:
  │  return ok({ message: "Se email existir, link foi enviado" })
  │  ← SEGURO: não revela se email existe
  │
  ├─ ✅ Se existe:
  │  ├─ Gera hash: crypto.randomBytes(32)
  │  ├─ INSERT INTO reset_password
  │  │  ├─ user_id: userId
  │  │  ├─ reset_password_hash: hash
  │  │  ├─ created_at: NOW()
  │  │  └─ expires_at: NOW() + 1 hour
  │  │
  │  └─ Envia email
  │     to: user.email
  │     subject: "Link para resetar senha"
  │     html: `Clique aqui:
  │            http://localhost:5173/reset-password/${hash}`
  │
  └─ return ok({ ... })
  │

┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND: RESPOSTA AO USER                               │
└─────────────────────────────────────────────────────────────┘

  onSuccess()
  ├─ toast("✅ Se email existir, link foi enviado.")
  └─ navigate("/login")
  │

┌─────────────────────────────────────────────────────────────┐
│ 5. USER RECEBE EMAIL                                        │
└─────────────────────────────────────────────────────────────┘

  Email com link:
  http://localhost:5173/reset-password/a7f3b21e8c4d9e1f
  │
  User clica link
  │

┌─────────────────────────────────────────────────────────────┐
│ 6. FRONTEND: VALIDA HASH                                    │
└─────────────────────────────────────────────────────────────┘

  /reset-password/:token page
  token = "a7f3b21e8c4d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"
  │
  useVerifyResetPasswordHash(token)
  ├─ GET /auth/reset-password/{token}
  │
  ├─ Backend:
  │  SELECT FROM reset_password
  │  WHERE reset_password_hash = $ AND expires_at > NOW()
  │
  │  ✗ Se inválido/expirado → 400 erro
  │  ✅ Se válido → return { success: true }
  │
  └─ Frontend renderiza ResetPasswordForm
  │
  Form:
  ├─ Nueva Password input
  ├─ Confirm Password input
  └─ Button: "Resetar Senha"
  │

┌─────────────────────────────────────────────────────────────┐
│ 7. USER ENTRA NOVA SENHA E SUBMETE                          │
└─────────────────────────────────────────────────────────────┘

  useResetPasswordMutation().mutate({
    json: {
      hash: "a7f3b21e8c4d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      newPassword: "NovaSenha456"
    }
  })
  │
  POST /auth/reset-password/reset
  │

┌─────────────────────────────────────────────────────────────┐
│ 8. BACKEND: ATUALIZA SENHA                                  │
└─────────────────────────────────────────────────────────────┘

  resetPasswordService(c, hash, newPassword)
  │
  ├─ SELECT FROM reset_password
  │  WHERE reset_password_hash = $ AND expires_at > NOW()
  │
  │  ✗ Se inválido → err({ type: "token_invalid" })
  │  ✓ Se válido → resetPass = resultado
  │
  ├─ Hash nova senha
  │  const passwordHash = bcryptjs.hash(newPassword, 10)
  │
  ├─ UPDATE users SET password_hash = $ WHERE id = resetPass.user_id
  │
  ├─ DELETE FROM reset_password WHERE id = resetPass.id
  │  ← Marca token como consumido (single-use)
  │
  └─ return ok({ message: "Senha resetada" })
  │

┌─────────────────────────────────────────────────────────────┐
│ 9. FRONTEND: SUCESSO                                        │
└─────────────────────────────────────────────────────────────┘

  onSuccess()
  ├─ toast("✅ Senha resetada com sucesso!")
  └─ navigate("/login")
     User pode fazer login com nova senha
```

---

## Requisição Autenticada (Simples)

```
User clica "Minhas Defesas"
  ↓
Navega para /meu-banca (página protegida)
  ↓
useBancasDoOrientador() hook
  ↓
localStorage.getItem("authToken") ← Token existe!
  ↓
Authorization: Bearer <token> injetado automaticamente
  ↓
GET /banca/meu-orientador = GET /banca/my-defenses
  ↓
  POST http://localhost:9000/banca/my-defenses
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ↓
Backend:
  ├─ appJwt() decodifica token
  │  payload = { sub: 42, role: "TEACHER", iat, exp }
  │  ctx.set("jwtPayload", payload)
  │
  ├─ Route handler: GET /banca/my-defenses
  │  const userId = c.get("jwtPayload").sub  // 42
  │  getBancasService(c, userId)
  │
  ├─ SELECT FROM banca
  │  WHERE orientador_id = 42
  │  AND visible = true
  │
  └─ RETURN 200 [{...},{...}]
  ↓
Frontend recebe array de bancas
  ↓
React Query cacheia com key ["banca", "my-defenses"]
  ↓
Component renderiza lista de defesas do professor
```

---

## Fluxo de Cache (React Query)

### Ciclo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PRIMEIRA CHAMADA                                         │
└─────────────────────────────────────────────────────────────┘

  const { data, isLoading } = useBancas()
  │
  QueryClient: Há cache para ["banca"]?
  ├─ ✗ Não existe
  └─ Dispara queryFn()
  │
  queryFn() = apiClient.banca.$get()
  │
  Requisição HTTP sendo feita...
  isLoading = true
  Component renderiza: <Skeleton />
  │

┌─────────────────────────────────────────────────────────────┐
│ 2. RESPOSTA RECEBIDA                                        │
└─────────────────────────────────────────────────────────────┘

  Response 200: [{id: 1, ...}, {id: 2, ...}]
  │
  QueryClient armazena em cache:
  ├─ queryKey: ["banca"]
  ├─ data: [...]
  ├─ status: "success"
  ├─ dataUpdatedAt: <timestamp>
  ├─ staleAt: dataUpdatedAt + staleTime (1min)
  └─ gcAt: dataUpdatedAt + gcTime (5min)
  │

┌─────────────────────────────────────────────────────────────┐
│ 3. PRIMEIRA RENDERIZAÇÃO COM DADOS                          │
└─────────────────────────────────────────────────────────────┘

  Component re-renderiza
  │
  data = [{id: 1, ...}, ...]
  isLoading = false
  │
  Renderiza lista de bancas
  │

┌─────────────────────────────────────────────────────────────┐
│ 4. SEGUNDA CHAMADA (mesmo hook, 30 segundos depois)         │
└─────────────────────────────────────────────────────────────┘

  const { data, isLoading } = useBancas()
  │
  QueryClient: Há cache para ["banca"]?
  ├─ ✅ EXISTE!
  │
  ├─ Agora < staleAt (1min)?
  │ ├─ ✅ SIM → Cache ainda fresco
  │ └─ isLoading = false
  │    data = [...]  ← Retorna imediatamente!
  │
  └─ Component renderiza instantaneamente (sem fetch!)
  │

┌─────────────────────────────────────────────────────────────┐
│ 5. TERCEIRA CHAMADA (2 minutos depois)                      │
└─────────────────────────────────────────────────────────────┘

  const { data, isLoading } = useBancas()
  │
  QueryClient: Há cache para ["banca"]?
  ├─ ✅ EXISTE
  │
  ├─ Agora < staleAt (1min)?
  │ ├─ ✗ NÃO → Cache ficou "stale"
  │ ├─ Retorna dados imediatamente (UI não "pisca")
  │ ├─ MAS dispara queryFn() em background
  │ └─ isLoading = false (dados antigos, está buscando)
  │
  └─ Component renderiza com dados antigos
     User vê lista, mas há um refetch silencioso
  │

┌─────────────────────────────────────────────────────────────┐
│ 6. DADOS NOVOS CHEGAM (background)                          │
└─────────────────────────────────────────────────────────────┘

  Response 200: [{id: 1, ...}, {id: 2, ...}, {id: 3, ...}]
  │
  QueryClient atualiza cache
  │
  isBackground = true (não deixa isLoading = true)
  isFetching = true
  │
  Component re-renderiza com novo data!
  │

┌─────────────────────────────────────────────────────────────┐
│ 7. INVALIDAÇÃO (Quando cria novo banca)                     │
└─────────────────────────────────────────────────────────────┘

  useCreateBanca().mutate({...})
  │
  Backend: Cria banca successfully
  │
  onSuccess() executado:
  ├─ queryClient.invalidateQueries({ queryKey: ["banca"] })
  │  ├─ Marca cache ["banca"] como "invalid"
  │  └─ Proxima renderização dispara queryFn() again
  │
  ├─ toast("✅ Criado!")
  │
  ├─ navigate("/")
  │  └─ Home page renderiza
  │
  ├─ useHomeBancas() chamado
  │  ├─ QueryClient: ["banca"] é invalid?
  │  ├─ ✅ SIM → Dispara queryFn()
  │  ├─ Fetch dados mais recentes
  │  └─ Component renderiza com nova banca na lista!
  │

┌─────────────────────────────────────────────────────────────┐
│ 8. GARBAGE COLLECTION (5 minutos sem usar)                  │
└─────────────────────────────────────────────────────────────┘

  queryCache não é acessado por 5 minutos
  │
  QueryClient:
  ├─ gcTime = 5 minutos expirou?
  ├─ ✅ SIM
  └─ DELETE cache["banca"]
     Libera memória (garbage collected!)
  │

┌─────────────────────────────────────────────────────────────┐
│ 9. PRÓXIMA CHAMADA (6 minutos depois)                       │
└─────────────────────────────────────────────────────────────┘

  const { data, isLoading } = useBancas()
  │
  QueryClient: Há cache para ["banca"]?
  ├─ ✗ NÃO! (foi limpo)
  └─ Dispara queryFn() → back to step 1
```

---

## Conclusão

Estes fluxogramas representam os padrões principais. Todos follows este esquema:

```
USER ACTION
  ↓
Validação Client-side (Zod)
  ↓
API Call com Authorization header
  ↓
Backend middleware (appJwt, checkRole)
  ↓
Validação Server-side (Zod)
  ↓
Service (lógica de negócio)
  ↓
AppResult mapeado para HTTP
  ↓
Frontend trata resposta
  ↓
UI atualizada (React Query cache)
```
