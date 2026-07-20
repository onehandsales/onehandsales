import { defineConfig, devices } from "@playwright/test";

const mobileChrome = devices["Pixel 5"];
const desktopChrome = devices["Desktop Chrome"];

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
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
    reuseExistingServer: true,
    timeout: 120_000,
    url: "http://127.0.0.1:5176",
  },
  projects: [
    {
      name: "mobile-chrome-390",
      testMatch: /mobile-browser-qa\.spec\.ts/,
      use: {
        ...mobileChrome,
        browserName: "chromium",
        channel: "chrome",
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "mobile-chrome-360",
      testMatch: /mobile-browser-qa\.spec\.ts/,
      use: {
        ...mobileChrome,
        browserName: "chromium",
        channel: "chrome",
        hasTouch: true,
        isMobile: true,
        viewport: { width: 360, height: 740 },
      },
    },
    {
      name: "mobile-edge-390",
      testMatch: /mobile-browser-qa\.spec\.ts/,
      use: {
        ...mobileChrome,
        browserName: "chromium",
        channel: "msedge",
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "mobile-edge-360",
      testMatch: /mobile-browser-qa\.spec\.ts/,
      use: {
        ...mobileChrome,
        browserName: "chromium",
        channel: "msedge",
        hasTouch: true,
        isMobile: true,
        viewport: { width: 360, height: 740 },
      },
    },
    {
      name: "desktop-chrome",
      testMatch: /browser-compat-qa\.spec\.ts/,
      use: {
        ...desktopChrome,
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "desktop-edge",
      testMatch: /browser-compat-qa\.spec\.ts/,
      use: {
        ...desktopChrome,
        browserName: "chromium",
        channel: "msedge",
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});
