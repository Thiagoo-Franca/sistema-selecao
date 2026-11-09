# SISSEL

Sistema de seleção de candidatos a mestrado e doutorado do PGCOMP/UFBA.

O SISSEL importa candidatos de planilhas, distribui automaticamente avaliadores e auditores por área de preferência e carga de trabalho e centraliza a avaliação por etapas. O servidor calcula e persiste a nota final.

## Sumário

- [O que o sistema faz](#o-que-o-sistema-faz)
- [Papéis e permissões](#papéis-e-permissões)
- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Execução](#execução)
- [Scripts](#scripts)
- [Testes](#testes)
- [Importação de candidatos](#importação-de-candidatos)
- [Regras de domínio](#regras-de-domínio)
- [Convenções de código](#convenções-de-código)
- [Segurança](#segurança)
- [Deploy](#deploy)
- [Documentação relacionada e legado](#documentação-relacionada-e-legado)

## O que o sistema faz

1. Importa candidatos de texto tabulado, colado do Excel ou do Google Sheets.
2. Atribui um avaliador e um auditor a cada candidato, considerando as áreas de preferência e a carga de trabalho.
3. Permite o lançamento de notas em etapas distintas para mestrado e doutorado.
4. Calcula e persiste a nota final no servidor.
5. Permite que o `ADMIN` gerencie professores, importações e atribuições.

Candidatos não são usuários e não acessam o sistema. O escopo do SISSEL é a seleção de candidatos dos dois programas; não crie entidades ou fluxos fora desse escopo sem uma decisão explícita de produto.

## Papéis e permissões

| Papel | Permissões |
| --- | --- |
| `ADMIN` | Acesso completo; gerencia professores, importa candidatos, reatribui avaliadores e auditores e lê ou edita qualquer candidato. |
| `TEACHER` | Lê e edita somente candidatos em que é o avaliador ou o auditor. Os dois vínculos têm as mesmas permissões de avaliação. |

Quando um `TEACHER` tenta acessar um candidato sem vínculo, a API responde `404`, sem confirmar a existência do registro. Operações administrativas respondem `403` para `TEACHER`.

## Stack

- **Frontend:** React Router v7 com SSR, TailwindCSS v4, Radix UI/shadcn, TanStack Query, React Hook Form, Zod, Hono RPC Client, Sonner e Playwright.
- **Backend:** Hono, PostgreSQL (Supabase), Drizzle ORM, JWT HS256, bcryptjs, Zod, `zValidator`, ts-pattern, Nodemailer, Vitest e PGlite.
- **Infraestrutura:** Turborepo, npm workspaces, Docker Compose para PostgreSQL local e Dokku.
- **Portas locais:** frontend em `5173`; API em `9000`; PostgreSQL do Docker em `5433`.

O pacote `@tcc/shared` contém código puro compartilhado, incluindo fórmulas, `AREAS` e `ISENCAO_STATUS`.

## Estrutura do repositório

```text
sistema-selecao/
├── apps/
│   ├── web/                 # Frontend React Router v7
│   └── server/              # API Hono, serviços e schema Drizzle
├── packages/
│   ├── shared/              # @tcc/shared: fórmulas e constantes de domínio
│   ├── tests/               # Fixtures e utilidades de teste
│   └── pdf-components/      # Código legado; não estender
├── scripts/
│   └── deploy.ts            # Verificação e deploy
├── docker-compose.yml       # PostgreSQL local
├── turbo.json               # Configuração do Turborepo
└── package.json             # Workspaces e scripts da raiz
```

## Pré-requisitos

- Node.js 18 ou superior;
- npm 10.8 ou superior;
- Docker e Docker Compose;
- Git.

## Instalação

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd sistema-selecao
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env` na raiz. Um exemplo mínimo para desenvolvimento local é:

   ```dotenv
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/sistema-selecao
   VITE_API_URL=http://localhost:9000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=troque-esta-chave-por-uma-com-pelo-menos-32-caracteres
   NODE_ENV=development
   SMTP_USER=
   SMTP_PASSWORD=
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=troque-esta-senha
   ```

4. Suba o PostgreSQL local:

   ```bash
   npm run docker:up
   ```

5. Sincronize o schema:

   ```bash
   npm run db:push
   ```

6. Opcionalmente, execute o seed de desenvolvimento:

   ```bash
   cd apps/server
   npm run seed
   cd ../..
   ```

Não versionar `.env` nem credenciais. O arquivo `docker-compose.yml` cria o banco `sistema-selecao` com usuário e senha locais `postgres` e publica o PostgreSQL na porta `5433`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim, fora de testes | URL de conexão PostgreSQL. |
| `VITE_API_URL` | Sim para o frontend | URL base da API, normalmente `http://localhost:9000`. |
| `FRONTEND_URL` | Sim, fora de testes | URL usada pelo CORS e pelos links enviados por e-mail. |
| `JWT_SECRET` | Sim | Chave do JWT; deve ter no mínimo 32 caracteres. Não há valor de fallback. |
| `NODE_ENV` | Não | Define o ambiente; em produção habilita o envio de e-mails reais. |
| `SMTP_USER` | Sim em produção | Usuário SMTP. |
| `SMTP_PASSWORD` | Sim em produção | Senha ou app password SMTP. |
| `ADMIN_EMAIL` | Para o seed de produção | E-mail do primeiro administrador. |
| `ADMIN_PASSWORD` | Para o seed de produção | Senha do primeiro administrador. |

O servidor também possui valores padrão internos para host e porta SMTP, emissor e parâmetros do JWT. Eles não substituem as variáveis obrigatórias acima.

## Execução

Com as variáveis configuradas e o banco disponível:

```bash
npm run dev
```

O Turborepo inicia o frontend em `http://localhost:5173` e a API em `http://localhost:9000`.

## Scripts

| Comando | Escopo | Finalidade |
| --- | --- | --- |
| `npm run dev` | Raiz | Inicia frontend e backend em desenvolvimento. |
| `npm run build` | `apps/web` | Gera o build de produção do frontend (`npm --workspace @tcc/web run build`). |
| `npm run tscheck` | Raiz | Executa a verificação de tipos dos workspaces. |
| `npm run test` | Raiz | Executa os testes configurados no Turborepo. |
| `npm run test:e2e` | Raiz | Executa os testes Playwright do frontend. |
| `npm run docker:up` | Raiz | Inicia o PostgreSQL local. |
| `npm run docker:connect` | Raiz | Abre o `psql` no container configurado pelo script. |
| `npm run docker:clean` | Raiz | Para os containers e remove os volumes do Compose. |
| `npm run db:push` | Raiz/server | Sincroniza o schema Drizzle com o banco. |
| `npm run db:studio` | Raiz | Abre o Drizzle Studio. |
| `npm run migration:gen` | Raiz/server | Gera uma migration Drizzle. |
| `npm run migration:run` | Raiz/server | Executa as migrations Drizzle. |
| `npm run deploy` | Raiz | Executa testes, type check e os deploys configurados. |

Para scripts definidos apenas no frontend, use `npm --workspace @tcc/web run <script>`. Para scripts definidos apenas no backend, use `npm --workspace @tcc/server run <script>`.

## Testes

- **Backend:** Vitest com PGlite. Execute `npm --workspace @tcc/server run test`.
- **Frontend:** Playwright. Execute `npm --workspace @tcc/web run test`.
- **E2E pela raiz:** `npm run test:e2e`.
- **Tipos:** `npm run tscheck`.

## Importação de candidatos

Atualmente, a tela de importação implementa o parser de candidatos de mestrado. O arquivo deve ser um `.txt` com um candidato por linha e células separadas por tabulação (`TAB`), como ao colar dados diretamente de uma planilha. Uma linha de cabeçalho é ignorada quando a coluna de inscrição não é numérica.

As colunas devem estar nesta ordem:

| Ordem | Coluna | Observação |
| ---: | --- | --- |
| 1 | `primeiraAreaPreferencia` | Área da primeira preferência. |
| 2 | `segundaAreaPreferencia` | Área da segunda preferência. |
| 3 | `numeroInscricao` | Número numérico da inscrição. |
| 4 | `cpf` | CPF. |
| 5 | `nome` | Nome do candidato. |
| 6 | `email` | E-mail. |
| 7 | `cidadeResidencia` | Cidade de residência. |
| 8 | `isencaoComprovanteLink` | Link ou célula de hiperlink. |
| 9 | `isencaoAprovadaLink` | Link ou célula de hiperlink. |
| 10 | `gruLink` | Link ou célula de hiperlink. |
| 11 | `homologa` | `SIM`/`NÃO` ou `TRUE`/`FALSE`. |
| 12 | `universidade` | Universidade da graduação. |
| 13 | `curso` | Curso da graduação. |
| 14 | `cidadeGraduacao` | Cidade da graduação. |
| 15 | `especiais` | `SIM`/`NÃO` ou `TRUE`/`FALSE`. |
| 16 | `cotas` | `SIM`/`NÃO` ou `TRUE`/`FALSE`. |
| 17 | `supra` | `SIM`/`NÃO` ou `TRUE`/`FALSE`. |
| 18 | `gradLink` | Link do comprovante. |
| 19 | `area` | Nota numérica de área. |
| 20 | `enade` | Nota numérica; pode conter link de e-MEC. |
| 21 | `a1a2a3a4Link` | Link do comprovante. |
| 22 | `b1b2b3b4Link` | Link do comprovante. |
| 23 | `icItLink` | Link do comprovante. |
| 24 | `poscompLink` | Link do comprovante. |
| 25 | `disciplinaPosCapes6MaisLink` | Link do comprovante. |
| 26 | `disciplinaPosCapes3a5Link` | Link do comprovante. |

O parser reconhece células `=HYPERLINK("URL"; "texto")` ou `=HYPERLINK("URL", "texto")`, aceita vírgula ou ponto em números e ignora linhas vazias. Linhas com mais de 26 colunas são rejeitadas.

## Regras de domínio

### Notas

- Mestrado e doutorado possuem campos, etapas e fórmulas diferentes; não são unificados em um modelo genérico.
- `notaFinal` é persistida junto com suas partes e `formulaVersion`.
- Uma alteração de fórmula cria uma nova `formulaVersion`; candidatos já avaliados nunca são recalculados retroativamente.
- `avaliado`, `notaFinal`, `formulaVersion`, `avaliadoEm` e `avaliadoPorId` são escritos exclusivamente pelo service de nota, dentro da transação de avaliação. Esses campos nunca vêm do cliente.
- Atualizações parciais são mescladas aos valores armazenados antes do cálculo. `avaliado` só se torna verdadeiro quando uma nota é efetivamente alterada.

### Alocação

- **Avaliador:** professor `TEACHER` ativo da primeira área de preferência com menor carga; se não houver, busca na segunda área; caso contrário, fica sem atribuição.
- **Auditor:** segue a mesma ordem de áreas, mas deve ser diferente do avaliador. Se não houver professor nas áreas, escolhe outro `TEACHER` ativo de menor carga.
- A alocação ocorre durante a importação, dentro da transação e sob lock de advisory para serializar importações concorrentes.
- Alterar as áreas de um professor não realoca candidatos existentes. A realocação é uma ação explícita do `ADMIN`.

### Criação de professores

O `ADMIN` cria o professor com nome, e-mail, matrícula, título, áreas, papel e status. O servidor grava um hash de senha aleatório e inutilizável e envia o e-mail “defina sua senha”, com token válido por 7 dias. O professor define a senha pelo fluxo de redefinição. Professores são desativados (`ativo = false`), nunca apagados.

## Convenções de código

### Backend

- Organizar módulos em route, service e schema.
- Rotas validam entrada, aplicam `checkRole` e mapeiam erros; regras de negócio ficam nos services.
- Services retornam `AppResult` e usam o usuário autenticado em `c.var`.
- Usar Zod com allowlists e `.strict()` para corpos de atualização.
- Usar transações para operações entre tabelas e para operações de leitura, mesclagem e escrita.

### Frontend

- Usar hooks TanStack Query para comunicação com a API; não usar `fetch` diretamente.
- Usar o Hono RPC Client para manter os tipos sincronizados com a API.
- Colocar estado local próximo do componente que o utiliza e usar componentes pequenos e compostos.
- Importar constantes e schemas compartilhados de `@tcc/shared`.

### Banco e pacote compartilhado

- Colunas SQL usam `snake_case`; propriedades TypeScript usam `camelCase`.
- Usuários e candidatos usam UUID; chaves estrangeiras têm política `onDelete` explícita.
- Tabelas usam RLS e índices nas chaves estrangeiras de avaliador e auditor.
- Importar `@tcc/shared` somente pela raiz do pacote: `import { ... } from "@tcc/shared"`.
- `@tcc/shared` permanece puro, sem dependências de React, Hono ou Drizzle.

## Segurança

- JWT HS256 exige `JWT_SECRET` com pelo menos 32 caracteres e rejeita tokens fornecidos que sejam inválidos, malformados ou expirados.
- A identidade é carregada do banco a partir do token; o papel não é confiado no payload do JWT.
- Usuários inativos são rejeitados e `passwordHash` nunca é retornado.
- A autorização de candidatos ocorre no service; acesso sem vínculo retorna `404`.
- UUIDs de parâmetros são validados e corpos de atualização aceitam apenas campos permitidos.
- Senhas usam bcryptjs; tokens de redefinição são aleatórios, expiram e têm uso único.
- Em produção, o CORS é restrito a `FRONTEND_URL` e os e-mails usam SMTP configurado.
- Todas as tabelas têm RLS sem policies permissivas; o backend usa o PostgreSQL diretamente.
- Logs não devem conter tokens, senhas, CPF ou e-mail.

## Deploy

O deploy de produção usa Dokku, com branches e remotes separados para frontend e backend. O comando:

```bash
npm run deploy
```

executa testes e type check antes de iniciar, em paralelo, os comandos de publicação configurados para o web e o server. Antes do deploy, configure as variáveis de ambiente de produção, especialmente `DATABASE_URL`, `FRONTEND_URL`, `VITE_API_URL`, `JWT_SECRET`, SMTP e as credenciais do administrador inicial.

## Documentação relacionada e legado

- [ARCHITECTURE.md](./ARCHITECTURE.md): arquitetura, domínio, segurança e decisões técnicas.
- [AGENTS.md](./AGENTS.md): convenções para agentes e desenvolvimento.
- [apps/server/src/database/schema.ts](./apps/server/src/database/schema.ts): fonte do schema Drizzle.
- [apps/web/app/features/candidates/mestrado/lib/parse-upload.ts](./apps/web/app/features/candidates/mestrado/lib/parse-upload.ts): parser e ordem das colunas de importação.
- [apps/web/PLAYWRIGHT_SETUP.md](./apps/web/PLAYWRIGHT_SETUP.md): configuração adicional dos testes de navegador.

O repositório ainda contém módulos e documentos legados, como `apps/frontend-old`, `apps/yii2-organizacao-de-defesas`, `packages/pdf-components` e arquivos antigos de arquitetura. Eles não fazem parte do escopo atual do SISSEL e não devem ser estendidos; remova-os somente após confirmar que não existem referências no frontend ou no seed.
