import { Hono } from "hono";
import type { AppVariables } from "../../types";
import * as service from "./candidato.service";
import { zValidator } from "@hono/zod-validator";
import {
  updateCandidatoDoutoradoSchema,
  updateCandidatoMestradoSchema,
  updateNotaDoutoradoSchema,
  updateNotaMestradoSchema,
} from "./candidato.schema";
import { match } from "ts-pattern";
import { AppError } from "../../error";

export const candidatoRoutes = new Hono<{ Variables: AppVariables }>()
  .get("/", async (c) => {
    const result = await service.getAllCandidatos(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos");
    }
    return c.json(result.data);
  })

  .get("/mestrado", async (c) => {
    const result = await service.getAllCandidatosMestrado(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de mestrado");
    }
    return c.json(result.data);
  })

  .get("/doutorado", async (c) => {
    const result = await service.getAllCandidatosDoutorado(c);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de doutorado");
    }
    return c.json(result.data);
  })

  .get("/mestrado/:id", async (c) => {
    const id = c.req.param("id");
    const result = await service.getCandidatoMestradoById(c, id);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de mestrado por ID");
    }
    return c.json(result.data);
  })

  .get("/doutorado/:id", async (c) => {
    const id = c.req.param("id");
    const result = await service.getCandidatoDoutoradoById(c, id);
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de doutorado por ID");
    }
    return c.json(result.data);
  })

  .patch(
    "/mestrado/:id",
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
  );
