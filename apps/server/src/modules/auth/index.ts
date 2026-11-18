import { authRoutes as baseAuthRoutes } from "./auth.route.js";
import { refreshTokenRoutes } from "./refresh-token.route.js";

export const authRoutes = baseAuthRoutes.route("/", refreshTokenRoutes);
export {
  appJwt,
  checkRole,
  getUsuarioAutenticado,
} from "./auth.middleware.js";
export { JWT_SECRET } from "./jwt.js";
export { revokeAllRefreshTokensForUser } from "./refresh-token.service.js";
export { emailSchema, senhaSchema } from "./auth.schema.js";
export { emailIgual } from "./email.js";
export {
  EXPIRACAO_PRIMEIRA_SENHA_MS,
  EXPIRACAO_RESET_SENHA_MS,
  enviarEmailTokenSenha,
  gerarTokenSenha,
  hashTokenSenha,
} from "./password-token.js";
