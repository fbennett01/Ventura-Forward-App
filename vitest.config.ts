import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // Match the Next.js `@/*` -> `src/*` path alias.
      "@": path.resolve(__dirname, "src"),
      // `server-only` is a build-time marker that has no meaning under Vitest;
      // stub it so server modules can be imported in unit tests.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
});
