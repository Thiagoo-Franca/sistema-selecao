import { Hono } from "hono"
import { TODO } from "../../todo"

export const usuarioRoutes = new Hono()
  .get("/", (c) => TODO({ c, path: "/usuario", method: "GET" }))
  .post("/", (c) => TODO({ c, path: "/usuario", method: "POST" }))
  .post("/pre-cadastro", (c) => TODO({ c, path: "/usuario/pre-cadastro", method: "POST" }))
  .get("/:id", (c) => {
    const id = c.req.param("id")
    return TODO({ c, path: "/usuario/:id", method: "GET", params: { id } })
  })
  .put("/:id", (c) => {
    const id = c.req.param("id")
    return TODO({ c, path: "/usuario/:id", method: "PUT", params: { id } })
  })
  .delete("/:id", (c) => {
    const id = c.req.param("id")
    return TODO({ c, path: "/usuario/:id", method: "DELETE", params: { id } })
  })
  .put("/:id/role", (c) => {
    const id = c.req.param("id")
    return TODO({ c, path: "/usuario/:id/role", method: "PUT", params: { id } })
  })
  .get("/:id/bancas", (c) => {
    const id = c.req.param("id")
    return TODO({ c, path: "/usuario/:id/bancas", method: "GET", params: { id } })
  })
