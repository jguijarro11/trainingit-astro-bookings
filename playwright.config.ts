import { defineConfig } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: BASE_URL,
  },
  webServer: {
    command: "npm run dev",
    url: `${BASE_URL}/health`,
    reuseExistingServer: !process.env.CI,
  },
});
