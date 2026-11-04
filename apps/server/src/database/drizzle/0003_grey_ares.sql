ALTER TABLE "candidato_doutorado" ALTER COLUMN "isencao_aprovada" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ALTER COLUMN "isencao_aprovada" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ALTER COLUMN "isencao_aprovada" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ALTER COLUMN "isencao_aprovada" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ALTER COLUMN "isencao_aprovada" SET DEFAULT 'nao-solicitou';--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ALTER COLUMN "isencao_aprovada" SET DEFAULT 'nao-solicitou';--> statement-breakpoint
DROP TYPE "public"."isencao_status";