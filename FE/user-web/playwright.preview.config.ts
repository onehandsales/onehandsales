import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  reporter: [["list"], ["json", { outputFile: "test-results/g01-preview-results.json" }]],
  use: { ...base.use, baseURL: "http://127.0.0.1:4175" },
  webServer: { command: "pnpm.cmd exec vite preview --host 127.0.0.1 --port 4175 --strictPort",
    url: "http://127.0.0.1:4175", reuseExistingServer: false },
});
