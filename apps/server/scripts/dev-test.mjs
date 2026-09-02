import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"))
const child = spawn(process.execPath, [tsxCli, "watch", "src/test-server.ts"], {
  env: { ...process.env, NODE_ENV: "test" },
  stdio: "inherit",
})

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on("error", (error) => {
  console.error("Failed to start the test server:", error)
  process.exit(1)
})
