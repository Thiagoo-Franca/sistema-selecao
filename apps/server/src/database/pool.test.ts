import net from "node:net";
import { createPool, POOL_TIMEOUTS } from "./pool.js";

describe("createPool", () => {
  it("falha com erro, em vez de travar, quando o banco aceita a conexão e não responde", async () => {
    const sockets: net.Socket[] = [];
    const banco = net.createServer((socket) => {
      sockets.push(socket);
      socket.on("error", () => {});
    });
    await new Promise<void>((resolve) => banco.listen(0, "127.0.0.1", resolve));
    const { port } = banco.address() as net.AddressInfo;

    const pool = createPool(`postgres://fake:fake@127.0.0.1:${port}/fake`);
    const inicio = Date.now();
    try {
      await expect(pool.query("select 1")).rejects.toThrow(/timeout/i);
      expect(Date.now() - inicio).toBeLessThan(
        POOL_TIMEOUTS.connectionTimeoutMillis + 2_000,
      );
    } finally {
      await pool.end().catch(() => {});
      sockets.forEach((socket) => socket.destroy());
      await new Promise((resolve) => banco.close(resolve));
    }
  }, 20_000);
});
