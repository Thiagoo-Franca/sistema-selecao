CREATE TYPE "public"."area" AS ENUM('CVIS', 'CD', 'ICOT', 'SIBW', 'IEDU', 'ES', 'RCSD', 'SCTR', 'SSEG');--> statement-breakpoint
CREATE TYPE "public"."gru_status" AS ENUM('isento', 'pago', 'aberto', 'nao-isento', 'nao-pagou');--> statement-breakpoint
CREATE TYPE "public"."isencao_status" AS ENUM('sim', 'nao', 'nao-solicitou');--> statement-breakpoint
CREATE TYPE "public"."tipo_curso" AS ENUM('doutorado', 'mestrado');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('TEACHER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "candidato_doutorado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_inscricao" text,
	"cpf" text,
	"nome" text NOT NULL,
	"email" text,
	"solicitou_isencao_taxa_inscricao" text,
	"isencao_aprovada" "isencao_status" DEFAULT 'nao-solicitou' NOT NULL,
	"gru" "gru_status",
	"gru_link" text,
	"homologa" boolean,
	"especiais" text,
	"cotas" text,
	"supra" text,
	"avaliador_id" uuid,
	"auditor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tipo_curso" "tipo_curso" DEFAULT 'doutorado' NOT NULL,
	"historico_graduacao" text NOT NULL,
	"copia_diploma_mestrado" text NOT NULL,
	"historico_mestrado" text NOT NULL,
	"nome_universidade_mestrado" text NOT NULL,
	"nome_curso_mestrado" text NOT NULL,
	"anteprojeto_tese" text NOT NULL,
	"conceito_capes_mestrado" text,
	"primeira_opcao_orientador" text NOT NULL,
	"segunda_opcao_orientador" text NOT NULL,
	"terceira_opcao_orientador" text NOT NULL,
	"area_pgcomp" text,
	"orientador_mestrado" text,
	CONSTRAINT "candidato_doutorado_numero_inscricao_unique" UNIQUE("numero_inscricao"),
	CONSTRAINT "candidato_doutorado_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "candidato_doutorado_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "candidato_mestrado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_inscricao" text,
	"cpf" text,
	"nome" text NOT NULL,
	"email" text,
	"solicitou_isencao_taxa_inscricao" text,
	"isencao_aprovada" "isencao_status" DEFAULT 'nao-solicitou' NOT NULL,
	"gru" "gru_status",
	"gru_link" text,
	"homologa" boolean,
	"especiais" text,
	"cotas" text,
	"supra" text,
	"avaliador_id" uuid,
	"auditor_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tipo_curso" "tipo_curso" DEFAULT 'mestrado' NOT NULL,
	"primeira_area_preferencia" "area",
	"segunda_area_preferencia" "area",
	"universidade" text,
	"curso" text,
	"cidade_graduacao" text,
	CONSTRAINT "candidato_mestrado_numero_inscricao_unique" UNIQUE("numero_inscricao"),
	CONSTRAINT "candidato_mestrado_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "candidato_mestrado_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "nota_doutorado" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_candidato" uuid NOT NULL,
	"avaliado" boolean DEFAULT false NOT NULL,
	"msc" numeric,
	"area_formacao_graduacao" numeric,
	"conceito_capes_mestrado" numeric,
	"a1a2a3a4" numeric,
	"b1b2b3b4" numeric,
	"nota_anteprojeto" numeric,
	CONSTRAINT "nota_doutorado_id_candidato_unique" UNIQUE("id_candidato")
);
--> statement-breakpoint
CREATE TABLE "nota_mestrado" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_candidato" uuid NOT NULL,
	"avaliado" boolean DEFAULT false NOT NULL,
	"grad_link" text,
	"grad" numeric,
	"area" numeric,
	"enade_link" text,
	"enade" numeric,
	"a1a2a3a4_link" text,
	"a1a2a3a4" numeric,
	"b1b2b3b4_link" text,
	"b1b2b3b4" numeric,
	"ic_it_link" text,
	"ic_it" numeric,
	"poscomp_link" text,
	"poscomp" numeric,
	"disciplina_pos_capes_6_mais_link" text,
	"disciplina_pos_capes_6_mais" numeric,
	"disciplina_pos_capes_3_a_5_link" text,
	"disciplina_pos_capes_3_a_5" numeric,
	"nota_etapa_ii" numeric,
	"nota_final" numeric,
	"formula_version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "nota_mestrado_id_candidato_unique" UNIQUE("id_candidato")
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"password_hash" text NOT NULL,
	"email" text NOT NULL,
	"nome" text NOT NULL,
	"school" text NOT NULL,
	"matricula" text NOT NULL,
	"areas" "area"[],
	"academic_title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "usuario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "feature_request_vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"feature_request_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_feature_request_unique" UNIQUE("user_id","feature_request_id")
);
--> statement-breakpoint
CREATE TABLE "feature_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"task_complexity_rating" integer NOT NULL,
	"interface_consistency_rating" integer NOT NULL,
	"response_time_rating" integer NOT NULL,
	"satisfaction_rating" integer NOT NULL,
	"usage_purposes" text NOT NULL,
	"usage_purpose_other" text,
	"completed_all_tasks" boolean NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "feedback_submission_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reset_password" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"reset_password_hash" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "reset_password_reset_password_hash_unique" UNIQUE("reset_password_hash")
);
--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ADD CONSTRAINT "candidato_doutorado_avaliador_id_usuario_id_fk" FOREIGN KEY ("avaliador_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ADD CONSTRAINT "candidato_doutorado_auditor_id_usuario_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ADD CONSTRAINT "candidato_mestrado_avaliador_id_usuario_id_fk" FOREIGN KEY ("avaliador_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ADD CONSTRAINT "candidato_mestrado_auditor_id_usuario_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD CONSTRAINT "nota_doutorado_id_candidato_candidato_doutorado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_doutorado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD CONSTRAINT "nota_mestrado_id_candidato_candidato_mestrado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_mestrado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request_vote" ADD CONSTRAINT "feature_request_vote_user_id_usuario_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request_vote" ADD CONSTRAINT "feature_request_vote_feature_request_id_feature_request_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request" ADD CONSTRAINT "feature_request_user_id_usuario_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_submission" ADD CONSTRAINT "feedback_submission_user_id_usuario_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_user_id_usuario_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidato_doutorado_avaliador_id_idx" ON "candidato_doutorado" USING btree ("avaliador_id");--> statement-breakpoint
CREATE INDEX "candidato_doutorado_auditor_id_idx" ON "candidato_doutorado" USING btree ("auditor_id");--> statement-breakpoint
CREATE INDEX "candidato_mestrado_avaliador_id_idx" ON "candidato_mestrado" USING btree ("avaliador_id");--> statement-breakpoint
CREATE INDEX "candidato_mestrado_auditor_id_idx" ON "candidato_mestrado" USING btree ("auditor_id");