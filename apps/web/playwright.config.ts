import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3001" },
  webServer: {
    // Production build, so tests see what ships.
    command: "bun run build && bun run start --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
