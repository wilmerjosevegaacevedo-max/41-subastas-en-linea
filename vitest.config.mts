import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/tests\//, replacement: `${resolve(import.meta.dirname, "tests")}/` },
      { find: /^@\//, replacement: `${resolve(import.meta.dirname, "app")}/` },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts", "app/features/*/tests/**/*.test.ts", "app/shared/tests/**/*.test.ts"],
    environment: "node",
  },
});
