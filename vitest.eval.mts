import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Eval config: separate from vitest.config.mts on purpose.
 *
 * `npm test` must stay hermetic and fast — it is the gate that runs on every
 * commit and must never spend money or depend on a third-party model. These
 * evals call the real Groq API, so they only run when asked:
 *
 *   npm run eval:milo            # every case, both models, once
 *   npm run eval:milo -- --repeat 5        # hunt for flaky failures
 *   npm run eval:milo -- --filter recurrencia
 *   npm run eval:milo -- --update-snapshots
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "server-only": resolve(__dirname, "evals/server-only-stub.ts")
    }
  },
  test: {
    environment: "node",
    include: ["evals/**/*.eval.ts"],
    setupFiles: [resolve(__dirname, "evals/load-env.ts")],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // Groq rate-limits per minute; going wide turns real failures into 429 noise.
    fileParallelism: false,
    sequence: { concurrent: false },
    reporters: process.env.CI ? ["default"] : ["default"]
  }
});
