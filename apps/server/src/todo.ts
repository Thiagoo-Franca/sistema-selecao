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
