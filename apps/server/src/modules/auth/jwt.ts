import { env } from "../../config/env.js";

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_ISSUER = env.JWT_ISSUER;
export const JWT_AUDIENCE = env.JWT_AUDIENCE;
export const JWT_EXPIRY_SECONDS = env.JWT_EXPIRY_SECONDS;
