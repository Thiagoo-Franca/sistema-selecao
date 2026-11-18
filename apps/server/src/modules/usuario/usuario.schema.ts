import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { AREAS } from "@tcc/shared";
import { Users } from "../../database/index.js";
import { createSortBySchema } from "../../lib/pagination.js";

export const createUserSchema = createInsertSchema(Users)
  .omit({
    passwordHash: true,
    ativo: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    password: z.string().min(8),
  });
export const preRegisterUserSchema = createUserSchema.pick({
  email: true,
  role: true,
});

export const idParamSchema = z.object({
  param: z.object({ id: z.string().uuid() }),
});

export const deleteUserQuerySchema = z.object({
  cascade: z.enum(["true", "false"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
});

export const updateUserSchema = z.object({
  param: idParamSchema.shape.param,
  body: createUserSchema
    .pick({
      nome: true,
      school: true,
      academicTitle: true,
      role: true,
    })
    .extend({
      areas: z.array(z.enum(AREAS)).transform((areas) => [...new Set(areas)]),
    })
    .partial(),
});

const usuarioSortByValues = ["nome", "email", "matricula", "createdAt"] as const;

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
