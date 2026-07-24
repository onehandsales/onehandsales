import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { env } from "node:process";
import { defineConfig, devices } from "@playwright/test";

const mobileChrome = devices["Pixel 5"];
const desktopChrome = devices["Desktop Chrome"];
const includeEdgeProjects = hasLocalMicrosoftEdge();

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
    ...(includeEdgeProjects
      ? [
          {
            name: "mobile-edge-390",
            testMatch: /mobile-browser-qa\.spec\.ts/,
            use: {
              ...mobileChrome,
              browserName: "chromium" as const,
              channel: "msedge" as const,
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
              browserName: "chromium" as const,
              channel: "msedge" as const,
              hasTouch: true,
              isMobile: true,
              viewport: { width: 360, height: 740 },
            },
          },
        ]
      : []),
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
    ...(includeEdgeProjects
      ? [
          {
            name: "desktop-edge",
            testMatch: /browser-compat-qa\.spec\.ts/,
            use: {
              ...desktopChrome,
              browserName: "chromium" as const,
              channel: "msedge" as const,
              viewport: { width: 1440, height: 1000 },
            },
          },
        ]
      : []),
  ],
});

function hasLocalMicrosoftEdge() {
  if (env.PLAYWRIGHT_INCLUDE_EDGE === "1") {
    return true;
  }

  if (env.PLAYWRIGHT_SKIP_EDGE === "1") {
    return false;
  }

  return (
    [
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/opt/microsoft/msedge/msedge",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ].some((path) => existsSync(path)) ||
    executableExists("msedge") ||
    executableExists("microsoft-edge") ||
    executableExists("microsoft-edge-stable")
  );
}

function executableExists(command: string) {
  const pathEntries = (env.PATH ?? "").split(delimiter).filter(Boolean);
  const executableExtensions =
    env.PATHEXT?.split(";").filter(Boolean) ?? [];
  const extensions = executableExtensions.length > 0 ? executableExtensions : [""];

  return pathEntries.some((directory) =>
    extensions.some((extension) => existsSync(join(directory, `${command}${extension}`)))
  );
}
