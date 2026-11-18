import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { AREAS } from "@tcc/shared";
import { Users } from "../../database/index.js";
import { createSortBySchema } from "../../lib/pagination.js";
import { emailSchema, senhaSchema } from "../auth/index.js";

// Base não estrita: cada schema de entrada escolhe seus campos com `.pick`.
const usuarioCamposSchema = createInsertSchema(Users);

const areasSchema = z
  .array(z.enum(AREAS))
  .transform((areas) => [...new Set(areas)]);

// Professor é criado sem senha: o hash é aleatório e a senha é definida pelo
// link enviado por e-mail. `.strict()` rejeita `password` e campos de sistema.
export const createUserSchema = usuarioCamposSchema
  .pick({
    nome: true,
    school: true,
    matricula: true,
    academicTitle: true,
    role: true,
  })
  .extend({
    email: emailSchema,
    areas: areasSchema.optional(),
  })
  .strict();

export const idParamSchema = z.object({
  param: z.object({ id: z.string().uuid() }),
});

export const deleteUserQuerySchema = z.object({
  cascade: z.enum(["true", "false"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: senhaSchema,
});

export const updateUserSchema = z.object({
  param: idParamSchema.shape.param,
  body: usuarioCamposSchema
    .pick({
      nome: true,
      school: true,
      academicTitle: true,
      role: true,
    })
    .extend({
      areas: areasSchema,
    })
    .partial(),
});

const usuarioSortByValues = ["nome", "email", "matricula", "createdAt", "areas"] as const;

export const usuarioPaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().transform((v) => (v === "" ? undefined : v)),
    sortBy: createSortBySchema([...usuarioSortByValues] as [string, ...string[]]).default("nome"),
    order: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export type UsuarioPaginationQuery = z.infer<typeof usuarioPaginationQuerySchema>;
