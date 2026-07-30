import { defineConfig, devices } from "@playwright/test";

// 기능 : 제품 분석 route smoke를 analytics env 활성 상태로 실행합니다.
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["product-analytics-route.spec.ts"],
  timeout: 60_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5176",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec vite --host 0.0.0.0 --port 5176",
    env: {
      VITE_PRODUCT_ANALYTICS_ENABLED: "true",
    },
    reuseExistingServer: true,
    timeout: 120_000,
    url: "http://127.0.0.1:5176",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
