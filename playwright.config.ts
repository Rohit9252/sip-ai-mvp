import { defineConfig, devices } from "@playwright/test";

/** End-to-end tests against the built app. Start it with `npm run build && npx next start -p 3100`, or let Playwright do it. */
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  use: { baseURL: "http://localhost:3100" },
  webServer: { command: "npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "desktop", use: { viewport: { width: 1280, height: 860 }, browserName: "chromium" } },
  ],
});
