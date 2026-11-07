import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * The eval gate (ADR-0006) runs on its own, never with `npm test`: it calls the real AI and the live price service.
 * `npm run eval` uses this config. Unit tests for the eval's own logic live in src/lib/eval and run with `npm test`.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["evals/**/*.eval.ts"],
    testTimeout: 900_000,
    hookTimeout: 900_000,
    fileParallelism: false,
  },
});
