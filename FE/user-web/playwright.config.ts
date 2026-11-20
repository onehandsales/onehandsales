import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: true, forbidOnly: Boolean(process.env.CI), retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/g01-results.json" }]],
  use: { baseURL: "http://127.0.0.1:5175", viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: { command: "pnpm.cmd exec vite --host 127.0.0.1 --port 5175 --strictPort",
    url: "http://127.0.0.1:5175", reuseExistingServer: false },
});
