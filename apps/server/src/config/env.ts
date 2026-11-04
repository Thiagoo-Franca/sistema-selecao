import { z } from "zod";

const mode = process.env.NODE_ENV;
const TEST_MODE = mode === "test";

export const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional().default("9000"),
  DATABASE_URL: TEST_MODE ? z.string().url().optional() : z.string().url(),
  FRONTEND_URL: TEST_MODE ? z.string().url().optional() : z.string().url(),
  SMTP_PASSWORD: TEST_MODE ? z.string().optional() : z.string(),
  SMTP_USER: TEST_MODE ? z.string().optional() : z.string(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_FROM: z.string().email().optional(),
  JWT_ISSUER: z.string().min(1).default("sissel"),
  JWT_AUDIENCE: z.string().min(1).default("sissel-web"),
  JWT_EXPIRY_SECONDS: z.coerce.number().int().positive().default(3600),
  JWT_SECRET: z
    .string({ required_error: "JWT_SECRET é obrigatório" })
    .min(32, "JWT_SECRET precisa ter pelo menos 32 caracteres"),
});

export const env = envSchema.parse(process.env);
