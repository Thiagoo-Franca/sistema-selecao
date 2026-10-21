import { Hono } from "hono";
import type { AppVariables } from "../../types.js";
import * as service from "./candidato.service.js";
import { zValidator } from "@hono/zod-validator";
import {
  updateCandidatoMestradoSchema,
  updateNotaMestradoSchema,
  uploadCandidatosMestradoSchema,
} from "./candidato.schema.js";
import { AppError } from "../../error.js";
import { checkRole } from "../auth/auth.middleware.js";

export const candidatoRoutes = new Hono<{ Variables: AppVariables }>()
  .get("/", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const result = await service.getAllCandidatos(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos");
    }
    return c.json(result.data);
  })

  .get("/mestrado", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const result = await service.getAllCandidatosMestrado(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de mestrado");
    }
    return c.json(result.data);
  })

  .get("/doutorado", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const result = await service.getAllCandidatosDoutorado(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de doutorado");
    }
    return c.json(result.data);
  })

  .get("/mestrado/:id", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const id = c.req.param("id");
    const result = await service.getCandidatoMestradoById(c, id);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de mestrado por ID");
    }
    return c.json(result.data);
  })

  .get("/doutorado/:id", checkRole(["ADMIN", "TEACHER"]), async (c) => {
    const id = c.req.param("id");
    const result = await service.getCandidatoDoutoradoById(c, id);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de doutorado por ID");
    }
    return c.json(result.data);
  })

  .post(
    "/mestrado",
    checkRole(["ADMIN"]),
    zValidator("json", uploadCandidatosMestradoSchema),
    async (c) => {
      const candidatos = c.req.valid("json");
      const result = await service.uploadCandidatosMestrado(c, candidatos);

      if (!result.ok) {
        console.error("Error uploading mestrado candidatos:", result.error);
        throw new AppError(500, "Erro ao fazer upload de candidatos");
      }
      return c.json({
        message: "Candidatos de mestrado adicionados com sucesso",
      });
    },
  )
  .delete("/mestrado/:id", checkRole(["ADMIN"]), async (c) => {
    const id = c.req.param("id");
    const result = await service.deleteCandidatoMestrado(c, id);

    if (!result.ok) {
      console.error(
        `Error deleting mestrado candidato with ID ${id}:`,
        result.error,
      );
      throw new AppError(500, "Erro ao deletar candidato");
    }
    if (!result.data) {
      throw new AppError(404, "Candidato não encontrado");
    }
    return c.json({ message: "Candidato de mestrado deletado com sucesso" });
  })
  .patch(
    "/mestrado/:id",
    checkRole(["ADMIN", "TEACHER"]),
    zValidator("json", updateCandidatoMestradoSchema),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const result = await service.updateCandidatoMestrado(c, id, body);

      if (!result.ok) {
        console.error(
          `Error updating mestrado candidato with ID ${id}:`,
          result.error,
        );
        throw new AppError(500, "Erro ao atualizar candidato");
      }

      if (!result.data) {
        throw new AppError(404, "Candidato não encontrado");
      }

      return c.json(result.data);
    },
  )

  .patch(
    "/mestrado/:id/nota",
    zValidator("json", updateNotaMestradoSchema),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const result = await service.updateNotaMestrado(c, id, body);

      if (!result.ok) {
        console.error(
          `Error updating mestrado candidato nota with ID ${id}:`,
          result.error,
        );
        throw new AppError(500, "Erro ao atualizar nota do candidato");
      }

      if (!result.data) {
        throw new AppError(404, "Nota do candidato não encontrada");
      }

      return c.json(result.data);
    },
  );
/*
  .patch(
    "/doutorado/:id",
    zValidator("json", updateCandidatoDoutoradoSchema),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const result = await service.updateCandidatoDoutorado(c, id, body);

      if (!result.ok) {
        console.error(
          `Error updating doutorado candidato with ID ${id}:`,
          result.error,
        );
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao atualizar candidato"),
          )
          .exhaustive();
      }

      if (!result.data) {
        throw new AppError(404, "Candidato não encontrado");
      }

      return c.json(result.data);
    },
  )

  .patch(
    "/doutorado/:id/nota",
    zValidator("json", updateNotaDoutoradoSchema),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const result = await service.updateNotaDoutorado(c, id, body);

      if (!result.ok) {
        console.error(
          `Error updating doutorado candidato nota with ID ${id}:`,
          result.error,
        );
        throw match(result.error)
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao atualizar nota do candidato"),
          )
          .exhaustive();
      }

      if (!result.data) {
        throw new AppError(404, "Nota do candidato não encontrada");
      }

      return c.json(result.data);
    },
  )

  
  .delete("/doutorado/:id", checkRole(["ADMIN"]), async (c) => {
    const id = c.req.param("id");
    const result = await service.deleteCandidatoDoutorado(c, id);

    if (!result.ok) {
      console.error(
        `Error deleting doutorado candidato with ID ${id}:`,
        result.error,
      );
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao deletar candidato"),
        )
        .exhaustive();
    }
    if (!result.data) {
      throw new AppError(404, "Candidato não encontrado");
    }

    return c.json({ message: "Candidato de doutorado deletado com sucesso" });
  })
*/
