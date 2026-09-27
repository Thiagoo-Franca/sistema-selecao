import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { match } from "ts-pattern";
import { AppError } from "../../error.js";
import { type AppVariables } from "../../types.js";
import { createFeedbackSchema } from "./feedback.schema.js";
import { createFeedback, getFeedbackStatistics } from "./feedback.service.js";

export const feedbackRoutes = new Hono<{ Variables: AppVariables }>()
  .post("/", zValidator("json", createFeedbackSchema), async (c) => {
    const validatedData = c.req.valid("json");
    const result = await createFeedback(c, validatedData);

    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "duplicate_feedback" },
          () => new AppError(400, "Você já enviou seu feedback."),
        )
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao salvar feedback. Tente novamente."),
        )
        .exhaustive();
    }

    return c.json(result.data, 201);
  })
  .get("/statistics", async (c) => {
    const result = await getFeedbackStatistics(c);

    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () =>
            new AppError(
              500,
              "Erro ao buscar estatísticas de feedback. Tente novamente.",
            ),
        )
        .exhaustive();
    }

    return c.json(result.data);
  });
