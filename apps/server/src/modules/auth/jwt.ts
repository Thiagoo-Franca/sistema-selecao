import { env } from "../../config/env.js";

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_ISSUER = process.env.JWT_ISSUER || "your-app-name"
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "your-app-audience"
export const JWT_EXPIRY_SECONDS = process.env.JWT_EXPIRY_SECONDS ? parseInt(process.env.JWT_EXPIRY_SECONDS, 10) : 3600 // 1 hour default
