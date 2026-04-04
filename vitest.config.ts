import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.spec.ts"],
    exclude: ["tests/**", "node_modules/**", "dist/**"],
  },
  coverage: {
    provider: "v8",
    include: ["src/**/*.ts"],
    exclude: ["src/**/*.spec.ts"],
    reporter: ["text", "html"],
  },
});
