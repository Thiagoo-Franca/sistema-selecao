import { AREAS, GRU_STATUS, ISENCAO_STATUS } from "@tcc/shared";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const tipoCursoEnum = pgEnum("tipo_curso", ["doutorado", "mestrado"]);

export type TipoCurso = (typeof tipoCursoEnum.enumValues)[number];

export const areaEnum = pgEnum("area", AREAS);
export type Area = (typeof areaEnum.enumValues)[number];
export const isencaoStatusEnum = pgEnum("isencao_status", ISENCAO_STATUS);
export const gruStatusEnum = pgEnum("gru_status", GRU_STATUS);

export const NotaMestrado = pgTable("nota_mestrado", {
  id: serial("id").primaryKey(),
  idCandidato: uuid("id_candidato")
    .notNull()
    .references(() => CandidatoMestrado.id, { onDelete: "cascade" })
    .unique(), // garante 1:1 com o candidato
  avaliado: boolean("avaliado").notNull().default(false),
  notaFinal: numeric("nota_final", { precision: 5, scale: 2, mode: "number" }),
  formulaVersion: integer("formula_version").notNull().default(1),
  avaliadoEm: timestamp("avaliado_em"),
  avaliadoPorId: uuid("avaliado_por_id").references(() => Users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  gradLink: text("grad_link"),
  grad: numeric("grad", { mode: "number" }),

  area: numeric("area", { mode: "number" }),

  enadeLink: text("enade_link"),
  enade: numeric("enade", { mode: "number" }),

  a1a2a3a4Link: text("a1a2a3a4_link"),
  a1a2a3a4: numeric("a1a2a3a4", { mode: "number" }),

  b1b2b3b4Link: text("b1b2b3b4_link"),
  b1b2b3b4: numeric("b1b2b3b4", { mode: "number" }),

  icItLink: text("ic_it_link"),
  icIt: numeric("ic_it", { mode: "number" }),

  poscompLink: text("poscomp_link"),
  poscomp: numeric("poscomp", { mode: "number" }),

  disciplinaPosCapes6MaisLink: text("disciplina_pos_capes_6_mais_link"),
  disciplinaPosCapes6Mais: numeric("disciplina_pos_capes_6_mais", {
    mode: "number",
  }),
  disciplinaPosCapes3a5Link: text("disciplina_pos_capes_3_a_5_link"),
  disciplinaPosCapes3a5: numeric("disciplina_pos_capes_3_a_5", {
    mode: "number",
  }),
  notaEtapaII: numeric("nota_etapa_ii", { mode: "number" }),
});

export type InsertNotaMestrado = typeof NotaMestrado.$inferInsert;
export type SelectNotaMestrado = typeof NotaMestrado.$inferSelect;

// Notas específicas da avaliação de candidatos ao doutorado.
export const NotaDoutorado = pgTable("nota_doutorado", {
  id: serial("id").primaryKey(),
  idCandidato: uuid("id_candidato")
    .notNull()
    .references(() => CandidatoDoutorado.id, { onDelete: "cascade" })
    .unique(), // garante 1:1 com o candidato
  avaliado: boolean("avaliado").notNull().default(false),
  notaFinal: numeric("nota_final", { precision: 5, scale: 2, mode: "number" }),
  formulaVersion: integer("formula_version").notNull().default(1),
  avaliadoEm: timestamp("avaliado_em"),
  avaliadoPorId: uuid("avaliado_por_id").references(() => Users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  msc: numeric("msc", { mode: "number" }), // nota do mestrado
  areaFormacaoGraduacao: numeric("area_formacao_graduacao", { mode: "number" }),
  conceitoCapesMestrado: numeric("conceito_capes_mestrado", { mode: "number" }),
  a1a2a3a4: numeric("a1a2a3a4", { mode: "number" }),
  b1b2b3b4: numeric("b1b2b3b4", { mode: "number" }),
  notaAnteprojeto: numeric("nota_anteprojeto", { mode: "number" }),
});

export type InsertNotaDoutorado = typeof NotaDoutorado.$inferInsert;
export type SelectNotaDoutorado = typeof NotaDoutorado.$inferSelect;

const candidatoBaseColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  numeroInscricao: text("numero_inscricao"),
  cpf: text("cpf"),
  nome: text("nome").notNull(),
  email: text("email"),

  solicitouIsencaoTaxaInscricao: text("solicitou_isencao_taxa_inscricao"),
  isencaoAprovada: isencaoStatusEnum("isencao_aprovada")
    .notNull()
    .default("nao-solicitou"),
  gru: gruStatusEnum("gru"),
  gruLink: text("gru_link"), // Link para PDF do GRU pago
  homologa: boolean("homologa"),

  especiais: text("especiais"), // Texto pois pode conter links para documentos comprobatórios
  cotas: text("cotas"), // Texto pois pode conter links para documentos comprobatórios
  supra: text("supra"), // Texto pois pode conter links para documentos comprobatórios

  avaliadorId: uuid("avaliador_id").references(() => Users.id, {
    onDelete: "set null",
  }),
  auditorId: uuid("auditor_id").references(() => Users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const CandidatoDoutorado = pgTable(
  "candidato_doutorado",
  {
    ...candidatoBaseColumns,
    tipoCurso: tipoCursoEnum("tipo_curso").default("doutorado").notNull(),
    historicoGraduacao: text("historico_graduacao").notNull(), // link para PDF do histórico da graduação
    copiaDiplomaMestrado: text("copia_diploma_mestrado").notNull(), // link para PDF da cópia do diploma do mestrado ou declaracao de conclusão
    historicoMestrado: text("historico_mestrado").notNull(), // link para PDF do histórico do mestrado ou declaração de conclusão
    nomeUniversidadeMestrado: text("nome_universidade_mestrado").notNull(), // Ex: 'Universidade Federal da Bahia', 'Universidade de São Paulo', etc.
    nomeCursoMestrado: text("nome_curso_mestrado").notNull(), // Ex: 'Ciência da Computação', 'Engenharia de Software', etc.
    anteprojetoTese: text("anteprojeto_tese").notNull(), // Link para PDF do anteprojeto de tese
    conceitoCapesMestrado: text("conceito_capes_mestrado"), // Ex: '3', '4', '5', etc.
    primeiraOpcaoOrientador: text("primeira_opcao_orientador").notNull(),
    segundaOpcaoOrientador: text("segunda_opcao_orientador").notNull(),
    terceiraOpcaoOrientador: text("terceira_opcao_orientador").notNull(),
    areaPgcomp: text("area_pgcomp"),
    orientadorMestrado: text("orientador_mestrado"),
  },
  (table) => ({
    numeroInscricaoUnique: unique(
      "candidato_doutorado_numero_inscricao_unique",
    ).on(table.numeroInscricao),
    cpfUnique: unique("candidato_doutorado_cpf_unique").on(table.cpf),
    emailUnique: unique("candidato_doutorado_email_unique").on(table.email),
    avaliadorIdIdx: index("candidato_doutorado_avaliador_id_idx").on(
      table.avaliadorId,
    ),
    auditorIdIdx: index("candidato_doutorado_auditor_id_idx").on(
      table.auditorId,
    ),
  }),
);

export type InsertCandidatoDoutorado = typeof CandidatoDoutorado.$inferInsert;
export type SelectCandidatoDoutorado = typeof CandidatoDoutorado.$inferSelect;

export const CandidatoMestrado = pgTable(
  "candidato_mestrado",
  {
    ...candidatoBaseColumns,
    // dados da inscricao
    tipoCurso: tipoCursoEnum("tipo_curso").default("mestrado").notNull(),
    primeiraAreaPreferencia: areaEnum("primeira_area_preferencia"),
    segundaAreaPreferencia: areaEnum("segunda_area_preferencia"),

    universidade: text("universidade"),
    curso: text("curso"),
    cidadeGraduacao: text("cidade_graduacao"),
  },
  (table) => ({
    numeroInscricaoUnique: unique(
      "candidato_mestrado_numero_inscricao_unique",
    ).on(table.numeroInscricao),
    cpfUnique: unique("candidato_mestrado_cpf_unique").on(table.cpf),
    emailUnique: unique("candidato_mestrado_email_unique").on(table.email),
    avaliadorIdIdx: index("candidato_mestrado_avaliador_id_idx").on(
      table.avaliadorId,
    ),
    auditorIdIdx: index("candidato_mestrado_auditor_id_idx").on(
      table.auditorId,
    ),
  }),
);

export type InsertCandidatoMestrado = typeof CandidatoMestrado.$inferInsert;
export type SelectCandidatoMestrado = typeof CandidatoMestrado.$inferSelect;

export const userRole = pgEnum("user_role", ["TEACHER", "ADMIN"]);
export type UserRole = (typeof userRole.enumValues)[number];
export const Users = pgTable("usuario", {
  id: uuid("id").primaryKey().defaultRandom(),
  passwordHash: text("password_hash").notNull(),
  email: text("email").notNull().unique(),
  nome: text("nome").notNull(),
  school: text("school").notNull(), // Ex: Instituto de Computação
  matricula: text("matricula").notNull(),
  areas: areaEnum("areas").array(), // Ex: ["CVIS", "CD"]
  academicTitle: text("academic_title").notNull(), // Ex: Doutorado
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: userRole("role").notNull(),
});
export type InsertUser = typeof Users.$inferInsert;
export type SelectUser = typeof Users.$inferSelect;

export const resetPasswords = pgTable("reset_password", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => Users.id),
  resetPasswordHash: text("reset_password_hash").unique(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at").notNull(), // Adicionado para controle
});

// === FEEDBACK SYSTEM ===

export const feedbackSubmissions = pgTable("feedback_submission", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => Users.id)
    .unique(), // Only one feedback per user
  taskComplexityRating: integer("task_complexity_rating").notNull(), // 1-5 scale
  interfaceConsistencyRating: integer("interface_consistency_rating").notNull(), // 1-5 scale
  responseTimeRating: integer("response_time_rating").notNull(), // 1-5 scale
  satisfactionRating: integer("satisfaction_rating").notNull(), // 1-5 scale
  usagePurposes: text("usage_purposes").notNull(), // JSON array of strings
  usagePurposeOther: text("usage_purpose_other"), // Custom text when "Other" is selected
  completedAllTasks: boolean("completed_all_tasks").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type InsertFeedbackSubmission = typeof feedbackSubmissions.$inferInsert;
export type SelectFeedbackSubmission = typeof feedbackSubmissions.$inferSelect;

export const featureRequests = pgTable("feature_request", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => Users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  voteCount: integer("vote_count").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type InsertFeatureRequest = typeof featureRequests.$inferInsert;
export type SelectFeatureRequest = typeof featureRequests.$inferSelect;

export const featureRequestVotes = pgTable(
  "feature_request_vote",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => Users.id),
    featureRequestId: integer("feature_request_id")
      .notNull()
      .references(() => featureRequests.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      userFeatureRequestUnique: unique("user_feature_request_unique").on(
        table.userId,
        table.featureRequestId,
      ),
    };
  },
);
export type InsertFeatureRequestVote = typeof featureRequestVotes.$inferInsert;
export type SelectFeatureRequestVote = typeof featureRequestVotes.$inferSelect;

// === DEFINIÇÃO DAS RELAÇÕES ===

export const resetPasswordsRelations = relations(resetPasswords, ({ one }) => ({
  usuario: one(Users, {
    fields: [resetPasswords.userId],
    references: [Users.id],
  }),
}));

// Relações para feedback submissions
export const feedbackSubmissionsRelations = relations(
  feedbackSubmissions,
  ({ one }) => ({
    user: one(Users, {
      fields: [feedbackSubmissions.userId],
      references: [Users.id],
    }),
  }),
);

// Relações para feature requests
export const featureRequestsRelations = relations(
  featureRequests,
  ({ one, many }) => ({
    user: one(Users, {
      fields: [featureRequests.userId],
      references: [Users.id],
    }),
    votes: many(featureRequestVotes),
  }),
);

// Relações para feature request votes
export const featureRequestVotesRelations = relations(
  featureRequestVotes,
  ({ one }) => ({
    user: one(Users, {
      fields: [featureRequestVotes.userId],
      references: [Users.id],
    }),
    featureRequest: one(featureRequests, {
      fields: [featureRequestVotes.featureRequestId],
      references: [featureRequests.id],
    }),
  }),
);
