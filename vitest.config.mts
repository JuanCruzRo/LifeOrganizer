import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // `server-only` throws when it is imported outside a React Server
      // Component, which is the point of it in the app. Under vitest it would
      // fail at import time and make the provider adapters untestable, so it is
      // swapped for a stub. The same alias exists in vitest.eval.mts.
      "server-only": resolve(__dirname, "evals/server-only-stub.ts")
    }
  },
  test: { environment: "node", include: ["tests/**/*.test.ts"] }
});
