import { zValidator } from "@hono/zod-validator";

import { Hono } from "hono";
import { match } from "ts-pattern";
import { AppError } from "../../error.js";
import { type AppVariables } from "../../types.js";
import {
  checkRole,
  getUsuarioAutenticado,
} from "../auth/index.js";
import * as schema from "./usuario.schema.js";
import * as service from "./usuario.service.js";

export const usuarioRoutes = new Hono<{ Variables: AppVariables }>()
  .get("/me", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const result = await service.getUserById(c, getUsuarioAutenticado(c).id);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao buscar usuário"),
        )
        .with(
          { type: "user_not_found" },
          () => new AppError(404, "Usuário não encontrado"),
        )
        .exhaustive();
    }
    return c.json(result.data);
  })
  .get("/all", checkRole(["ADMIN"]), async (c) => {
    const result = await service.getAllUsers(c);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao buscar usuários"),
        )
        .exhaustive();
    }
    return c.json(result.data);
  })
  .get("/teachers", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const result = await service.getTeachers(c);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao buscar professores"),
        )
        .exhaustive();
    }
    return c.json(result.data);
  })
  .get("/teachers/simplified", checkRole(["ADMIN"]), async (c) => {
    const result = await service.getTeachersSimplified(c);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao buscar professores"),
        )
        .exhaustive();
    }
    return c.json(result.data);
  })

  .post(
    "/",
    checkRole(["ADMIN"]),
    zValidator("json", schema.createUserSchema),
    async (c) => {
      const validatedUserData = c.req.valid("json");
      const result = await service.createUser(c, validatedUserData);
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao criar usuário"),
          )
          .with(
            { type: "duplicate_email" },
            () => new AppError(400, "Email já cadastrado"),
          )
          .with(
            { type: "duplicate_username" },
            () => new AppError(400, "Nome de usuário já cadastrado"),
          )
          .with(
            { type: "hashing_error" },
            () => new AppError(500, "Erro ao criar usuário"),
          )
          .exhaustive();
      }
      return c.json(result.data, 201);
    },
  )
  .get(
    "/:id",
    checkRole(["ADMIN", "TEACHER"]),
    zValidator("param", schema.idParamSchema.shape.param),
    async (c) => {
      const { id } = c.req.valid("param");
      const result = await service.getUserById(c, id);
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao buscar usuário"),
          )
          .with(
            { type: "user_not_found" },
            () => new AppError(404, "Usuário não encontrado"),
          )
          .exhaustive();
      }
      return c.json(result.data);
    },
  )
  .put(
    "/me",
    checkRole(["ADMIN", "TEACHER"]),
    // Função e áreas só o ADMIN altera (áreas definem a alocação de candidatos).
    zValidator(
      "json",
      schema.updateUserSchema.shape.body.omit({ role: true, areas: true }),
    ),
    async (c) => {
      const validatedUpdateData = c.req.valid("json");
      const result = await service.updateUser(
        c,
        getUsuarioAutenticado(c).id,
        validatedUpdateData,
      );
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao atualizar usuário"),
          )
          .with(
            { type: "user_not_found" },
            () => new AppError(404, "Usuário não encontrado"),
          )
          .with(
            { type: "duplicate_username" },
            () => new AppError(400, "Nome de usuário já cadastrado"),
          )
          .exhaustive();
      }
      return c.json(result.data);
    },
  )
  .post(
    "/me/change-password",
    checkRole(["ADMIN", "TEACHER"]),
    zValidator("json", schema.changePasswordSchema),
    async (c) => {
      const { currentPassword, newPassword } = c.req.valid("json");
      const result = await service.changeUserPassword(
        c,
        currentPassword,
        newPassword,
      );
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "user_not_found" },
            () => new AppError(404, "Usuário não encontrado"),
          )
          .with(
            { type: "invalid_current_password" },
            () => new AppError(400, "Senha atual incorreta"),
          )
          .with(
            { type: "hashing_error" },
            () => new AppError(500, "Erro ao processar senha"),
          )
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao atualizar senha"),
          )
          .exhaustive();
      }

      return c.json({ message: "Senha alterada com sucesso" });
    },
  )
  .put(
    "/:id",
    checkRole(["ADMIN"]),
    zValidator("param", schema.updateUserSchema.shape.param),
    zValidator("json", schema.updateUserSchema.shape.body),
    async (c) => {
      const { id } = c.req.valid("param");
      const validatedUpdateData = c.req.valid("json");
      const result = await service.updateUser(c, id, validatedUpdateData);
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao atualizar usuário"),
          )
          .with(
            { type: "user_not_found" },
            () => new AppError(404, "Usuário não encontrado"),
          )
          .with(
            { type: "duplicate_username" },
            () => new AppError(400, "Nome de usuário já cadastrado"),
          )
          .exhaustive();
      }
      return c.json(result.data);
    },
  )
  .delete(
    "/:id",
    checkRole(["ADMIN"]),
    zValidator("param", schema.idParamSchema.shape.param),
    zValidator("query", schema.deleteUserQuerySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { cascade } = c.req.valid("query");
      const result = await service.deleteUser(c, id, cascade === "true");
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao deletar usuário"),
          )
          .with(
            { type: "user_not_found" },
            () => new AppError(404, "Usuário não encontrado"),
          )
          .with(
            { type: "user_referenced_elsewhere" },
            () => new AppError(400, "Usuário referenciado em outro lugar"),
          )
          .exhaustive();
      }
      return c.body(null, 204);
    },
  );
