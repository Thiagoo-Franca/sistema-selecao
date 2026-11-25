-- Alinha as migrações ao schema.ts atual. Várias mudanças de schema foram aplicadas
-- por db:push sem migração; cada bloco é idempotente para rodar tanto num banco
-- montado pelas migrações (PGlite dos testes, banco novo) quanto num banco que já
-- recebeu db:push.
DO $$ BEGIN
	CREATE TYPE "public"."area_pgcomp" AS ENUM('COMPUTAÇÃO APLICADA', 'SISTEMAS COMPUTACIONAIS', 'ENGENHARIA DE SOFTWARE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TYPE "public"."gru_status" ADD VALUE IF NOT EXISTS 'nao-avaliado';--> statement-breakpoint
DO $$
DECLARE
	t text;
	c text;
BEGIN
	FOREACH t IN ARRAY ARRAY['candidato_mestrado', 'candidato_doutorado'] LOOP
		-- solicitou_isencao_taxa_inscricao: text -> boolean NOT NULL DEFAULT false
		IF (SELECT data_type FROM information_schema.columns
			WHERE table_schema = 'public' AND table_name = t AND column_name = 'solicitou_isencao_taxa_inscricao') = 'text' THEN
			EXECUTE format('ALTER TABLE %I ALTER COLUMN "solicitou_isencao_taxa_inscricao" SET DATA TYPE boolean USING (lower(trim("solicitou_isencao_taxa_inscricao")) IN (''sim'', ''s'', ''true'', ''t'', ''1''))', t);
		END IF;
		EXECUTE format('UPDATE %I SET "solicitou_isencao_taxa_inscricao" = false WHERE "solicitou_isencao_taxa_inscricao" IS NULL', t);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "solicitou_isencao_taxa_inscricao" SET DEFAULT false', t);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "solicitou_isencao_taxa_inscricao" SET NOT NULL', t);

		-- especiais, cotas, supra: text -> boolean (nullable)
		FOREACH c IN ARRAY ARRAY['especiais', 'cotas', 'supra'] LOOP
			IF (SELECT data_type FROM information_schema.columns
				WHERE table_schema = 'public' AND table_name = t AND column_name = c) = 'text' THEN
				EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DATA TYPE boolean USING (CASE WHEN %I IS NULL OR trim(%I) = '''' THEN NULL ELSE lower(trim(%I)) IN (''sim'', ''s'', ''true'', ''t'', ''1'') END)', t, c, c, c, c);
			END IF;
		END LOOP;

		-- isencao_aprovada: novo default
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "isencao_aprovada" SET DEFAULT ''nao-avaliado''', t);

		-- gru: gru_status -> text NOT NULL DEFAULT 'nao-avaliado'
		IF (SELECT data_type FROM information_schema.columns
			WHERE table_schema = 'public' AND table_name = t AND column_name = 'gru') = 'USER-DEFINED' THEN
			EXECUTE format('ALTER TABLE %I ALTER COLUMN "gru" SET DATA TYPE text USING "gru"::text', t);
		END IF;
		EXECUTE format('UPDATE %I SET "gru" = ''nao-avaliado'' WHERE "gru" IS NULL', t);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "gru" SET DEFAULT ''nao-avaliado''', t);
		EXECUTE format('ALTER TABLE %I ALTER COLUMN "gru" SET NOT NULL', t);

		EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "isencao_comprovante_link" text', t);
		EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "isencao_aprovada_link" text', t);
	END LOOP;

	-- area_pgcomp: text -> enum area_pgcomp (falha se houver valor fora do enum)
	IF (SELECT data_type FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'candidato_doutorado' AND column_name = 'area_pgcomp') = 'text' THEN
		ALTER TABLE "candidato_doutorado" ALTER COLUMN "area_pgcomp" SET DATA TYPE "public"."area_pgcomp" USING "area_pgcomp"::"public"."area_pgcomp";
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "candidato_mestrado" ADD COLUMN IF NOT EXISTS "cidade_residencia" text;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ADD COLUMN IF NOT EXISTS "cidade_mestrado" text;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ALTER COLUMN "primeira_opcao_orientador" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ALTER COLUMN "segunda_opcao_orientador" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" ALTER COLUMN "terceira_opcao_orientador" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN IF EXISTS "historico_graduacao";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN IF EXISTS "copia_diploma_mestrado";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN IF EXISTS "anteprojeto_tese";--> statement-breakpoint
ALTER TABLE "candidato_doutorado" DROP COLUMN IF EXISTS "conceito_capes_mestrado";--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN IF NOT EXISTS "conceito_capes_mestrado_link" text;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN IF NOT EXISTS "a1a2a3a4_link" text;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN IF NOT EXISTS "b1b2b3b4_link" text;
