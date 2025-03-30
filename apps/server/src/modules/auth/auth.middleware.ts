import { createMiddleware } from "hono/factory"
import { match } from "ts-pattern"
import { UserRole } from "../../database"
import { AppError } from "../../error"
import { getUserById } from "../usuario/usuario.service"

export const checkRole = (roles: UserRole[]) =>
  createMiddleware(async (c, next) => {
    const id = c.req.param("id")
    if (!id) {
      throw new AppError(400, "ID do usuário não fornecido")
    }
    const [error, user] = await getUserById(c, Number(id))
    if (error) {
      throw match(error)
        .with({ type: "user_not_found" }, () => new AppError(404, "Usuário não encontrado"))
        .with({ type: "database_error" }, () => new AppError(500, "Erro ao buscar usuário"))
        .exhaustive()
    }
    if (!roles.includes(user.role as UserRole)) {
      throw new AppError(403, "Usuário não tem permissão para acessar esta rota")
    }
    return next()
  })
