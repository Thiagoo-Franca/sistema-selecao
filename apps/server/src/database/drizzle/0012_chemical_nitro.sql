CREATE TABLE "endereco" (
	"id" serial PRIMARY KEY NOT NULL,
	"cep" text NOT NULL,
	"logradouro" text NOT NULL,
	"numero" text,
	"bairro" text NOT NULL,
	"complemento" text,
	"estado" text NOT NULL,
	"municipio" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nota_doutorado" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_candidato" integer NOT NULL,
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
	"id_candidato" integer NOT NULL,
	"grad" numeric,
	"area" numeric,
	"enade" numeric,
	"a1a2a3a4" numeric,
	"b1b2b3b4" numeric,
	"ic_it" numeric,
	"poscomp" numeric,
	"disciplina_pos_capes_6_mais" numeric,
	"disciplina_pos_capes_3_a_5" numeric,
	CONSTRAINT "nota_mestrado_id_candidato_unique" UNIQUE("id_candidato")
);
--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ADD COLUMN "id_endereco" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ADD COLUMN "id_endereco" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD CONSTRAINT "nota_doutorado_id_candidato_candidato_doutorado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_doutorado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD CONSTRAINT "nota_mestrado_id_candidato_candidato_mestrado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_mestrado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ADD CONSTRAINT "candidato_doutorado_id_endereco_endereco_id_fk" FOREIGN KEY ("id_endereco") REFERENCES "public"."endereco"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ADD CONSTRAINT "candidato_mestrado_id_endereco_endereco_id_fk" FOREIGN KEY ("id_endereco") REFERENCES "public"."endereco"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "cep";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "logradouro";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "bairro";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "complemento";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "estado_endereco";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "municipio_endereco";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN "numero";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "cep";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "logradouro";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "bairro";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "complemento";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "estado_endereco";--> statement-breakpoint
ALTER TABLE "candidato_mestrado" DROP COLUMN "municipio_endereco";