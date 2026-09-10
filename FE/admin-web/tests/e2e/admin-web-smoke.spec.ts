import { expect, test, type Page, type Route } from "@playwright/test";

const ADMIN_ACCESS_TOKEN = "admin-e2e-access-token";
const USER_ACCESS_TOKEN = "non-admin-e2e-access-token";
const ADMIN_AUTHORIZATION_HEADER = `Bearer ${ADMIN_ACCESS_TOKEN}`;
const USER_AUTHORIZATION_HEADER = `Bearer ${USER_ACCESS_TOKEN}`;

test.describe("Admin Web smoke E2E", () => {
  test("verifies admin access only through /admin/api/me", async ({ page }) => {
    const requests = await setupAdminApiMocks(page);

    await page.goto("/login");
    await submitAccessToken(page, ADMIN_ACCESS_TOKEN);

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Admin verified" })
    ).toBeVisible();
    await expect(page.getByText("admin@example.com")).toBeVisible();
    expect(requests()).toEqual([
      {
        authorization: ADMIN_AUTHORIZATION_HEADER,
        method: "GET",
        path: "/admin/api/me",
      },
    ]);
  });

  test("rejects a non-admin token without calling removed admin APIs", async ({
    page,
  }) => {
    const requests = await setupAdminApiMocks(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);

    await submitAccessToken(page, USER_ACCESS_TOKEN);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Admin API request failed: 403")).toBeVisible();
    expect(requests()).toEqual([
      {
        authorization: USER_AUTHORIZATION_HEADER,
        method: "GET",
        path: "/admin/api/me",
      },
    ]);
  });
});

// 기능 : Admin 로그인 화면에서 access token을 제출합니다.
async function submitAccessToken(page: Page, accessToken: string) {
  await page.getByLabel("App access token").fill(accessToken);
  await page.getByRole("button", { name: "Verify admin" }).click();
}

// 기능 : /admin/api/me 이외의 Admin API 호출을 실패시킵니다.
async function setupAdminApiMocks(page: Page) {
  const requests: Array<{
    readonly authorization: string | null;
    readonly method: string;
    readonly path: string;
  }> = [];

  await page.route(isAdminApiRequest, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const authorization = request.headers().authorization ?? null;

    if (method === "OPTIONS") {
      await fulfillJson(route, null, 204);
      return;
    }

    requests.push({
      authorization,
      method,
      path: `${url.pathname}${url.search}`,
    });

    if (url.pathname !== "/admin/api/me") {
      await fulfillJson(route, { code: "ADMIN_API_REMOVED" }, 410);
      return;
    }

    if (authorization === USER_AUTHORIZATION_HEADER) {
      await fulfillJson(route, { code: "ADMIN_FORBIDDEN" }, 403);
      return;
    }

    if (authorization !== ADMIN_AUTHORIZATION_HEADER) {
      await fulfillJson(route, { code: "AUTH_UNAUTHORIZED" }, 401);
      return;
    }

    await fulfillJson(route, {
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
      supabaseUserId: null,
    });
  });

  return () => requests;
}

// 기능 : JSON mock 응답을 반환합니다.
async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    body: status === 204 ? undefined : JSON.stringify(body),
    contentType: "application/json",
    headers: {
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-origin": "*",
    },
    status,
  });
}

// 기능 : Admin API 요청만 Playwright route mock 대상으로 판별합니다.
function isAdminApiRequest(url: URL) {
  return url.pathname.startsWith("/admin/api/");
}
