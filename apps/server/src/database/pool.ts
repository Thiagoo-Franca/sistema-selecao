import pg from "pg";

// Sem estes limites, uma conexão travada com o banco (pooler ou rede sem resposta)
// deixa a requisição pendurada para sempre, sem erro para o usuário.
export const POOL_TIMEOUTS = {
  connectionTimeoutMillis: 10_000,
  query_timeout: 30_000,
  idleTimeoutMillis: 30_000,
} as const;

export const createPool = (connectionString: string | undefined) => {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
    ...POOL_TIMEOUTS,
  });

  // Uma conexão ociosa que cai emite "error" no pool; sem listener, o processo cai.
  pool.on("error", (error) => {
    console.error("Erro em conexão ociosa do banco:", {
      code: (error as { code?: string }).code ?? "unknown",
    });
  });

  return pool;
};
