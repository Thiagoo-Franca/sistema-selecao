import { zValidator } from "@hono/zod-validator"

import { Hono } from "hono"
import { AppVariables } from "../../types"
import { checkRole } from "../auth/auth.middleware"
import * as schema from "./usuario.schema"
import * as service from "./usuario.service"

export const usuarioRoutes = new Hono<{ Variables: AppVariables }>()
  .get("/", checkRole(["ADMIN"]), async (c) => {
    const users = await service.getAllUsers(c)
    return c.json(users)
  })
  .post("/", checkRole(["ADMIN", "TEACHER"]), zValidator("json", schema.createUserSchema), async (c) => {
    const validatedUserData = c.req.valid("json")
    const newUser = await service.createUser(c, validatedUserData)
    return c.json(newUser, 201)
  })
  .get("/:id", zValidator("param", schema.idParamSchema.shape.param), async (c) => {
    const { id } = c.req.valid("param")
    const user = await service.getUserById(c, id)
    return c.json(user)
  })
  .put(
    "/:id",
    checkRole(["ADMIN"]),
    zValidator("param", schema.updateUserSchema.shape.param),
    zValidator("json", schema.updateUserSchema.shape.body),
    async (c) => {
      const { id } = c.req.valid("param")
      const validatedUpdateData = c.req.valid("json")
      const updatedUser = await service.updateUser(c, id, validatedUpdateData)
      return c.json(updatedUser)
    }
  )
  .delete("/:id", checkRole(["ADMIN"]), zValidator("param", schema.idParamSchema.shape.param), async (c) => {
    const { id } = c.req.valid("param")
    await service.deleteUser(c, id)
    return c.body(null, 204)
  })
  .get("/:id/bancas", zValidator("param", schema.idParamSchema.shape.param), async (c) => {
    const { id } = c.req.valid("param")
    const bancas = await service.getUserBancas(c, id)
    return c.json(bancas)
  })
