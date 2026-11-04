ALTER TABLE "nota_doutorado" DROP CONSTRAINT "nota_doutorado_id_candidato_candidato_doutorado_id_fk";
--> statement-breakpoint
ALTER TABLE "nota_mestrado" DROP CONSTRAINT "nota_mestrado_id_candidato_candidato_mestrado_id_fk";
--> statement-breakpoint
ALTER TABLE "nota_mestrado" ALTER COLUMN "nota_final" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "nota_final" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "formula_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "avaliado_em" timestamp;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "avaliado_por_id" uuid;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD COLUMN "avaliado_em" timestamp;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD COLUMN "avaliado_por_id" uuid;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD CONSTRAINT "nota_doutorado_avaliado_por_id_usuario_id_fk" FOREIGN KEY ("avaliado_por_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_doutorado" ADD CONSTRAINT "nota_doutorado_id_candidato_candidato_doutorado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_doutorado"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD CONSTRAINT "nota_mestrado_avaliado_por_id_usuario_id_fk" FOREIGN KEY ("avaliado_por_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota_mestrado" ADD CONSTRAINT "nota_mestrado_id_candidato_candidato_mestrado_id_fk" FOREIGN KEY ("id_candidato") REFERENCES "public"."candidato_mestrado"("id") ON DELETE cascade ON UPDATE no action;