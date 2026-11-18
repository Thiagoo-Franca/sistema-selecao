import type { Context } from "hono"

// Updated TODO function to return a valid Hono response
export const TODO = (details: { c: Context; path: string; method: string; params?: object; body?: unknown }) => {
  console.log(`TODO: Implement ${details.method} ${details.path}`, { params: details.params, body: details.body })
  // Return a basic JSON response to satisfy Hono
  return details.c.json(
    {
      status: "TODO",
      message: `Endpoint ${details.method} ${details.path} is not yet implemented.`,
      receivedParams: details.params,
      receivedBody: details.body,
    },
    501
  ) // 501 Not Implemented
}

// Pendências conhecidas que ainda não viraram código (em vez de comentários TODO).
export const PENDENCIAS = [
  {
    id: "rate-limit-auth",
    origem: "SDS-5",
    descricao:
      "Rate limiting por IP e por e-mail em POST /auth/login, POST /auth/reset-password, " +
      "GET /auth/reset-password/:hash e POST /auth/reset-password/reset (força bruta e spam de e-mails).",
  },
  {
    id: "revogar-sessoes-apos-reset",
    origem: "SDS-5",
    descricao:
      "Ao redefinir a senha (reset ou primeira senha), revogar os refresh tokens do usuário " +
      "quando a SDS-4 introduzir refresh token.",
  },
  {
    id: "web-criar-professor",
    origem: "SDS-5",
    descricao:
      "Tela de criação de professor no admin (POST /usuario sem senha) com toast de conviteEnviado; " +
      "hoje só existe o botão de reenviar convite.",
  },
] as const
