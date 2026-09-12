import { expect, test, type Page, type Route } from "@playwright/test";

const ADMIN_ACCESS_TOKEN = "admin-e2e-access-token";
const USER_ACCESS_TOKEN = "non-admin-e2e-access-token";
const ADMIN_AUTHORIZATION_HEADER = `Bearer ${ADMIN_ACCESS_TOKEN}`;
const USER_AUTHORIZATION_HEADER = `Bearer ${USER_ACCESS_TOKEN}`;

test.describe("Admin Web smoke E2E", () => {
  test("verifies admin access only through /admin/api/me", async ({ page }) => {
    // 1. 비동기 결과를 받아 requests에 저장한다.
    const requests = await setupAdminApiMocks(page);

    // 2. 필요한 비동기 작업을 실행한다.
    await page.goto("/login");
    // 3. 필요한 비동기 작업을 실행한다.
    await submitAccessToken(page, ADMIN_ACCESS_TOKEN);

    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("heading", { name: "Admin verified" })
    ).toBeVisible();
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByText("admin@example.com")).toBeVisible();
    // 7. 테스트 기대 조건을 검증한다.
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
    // 1. 비동기 결과를 받아 requests에 저장한다.
    const requests = await setupAdminApiMocks(page);

    // 2. 필요한 비동기 작업을 실행한다.
    await page.goto("/");
    // 3. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);

    // 4. 필요한 비동기 작업을 실행한다.
    await submitAccessToken(page, USER_ACCESS_TOKEN);

    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByText("Admin API request failed: 403")).toBeVisible();
    // 7. 테스트 기대 조건을 검증한다.
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
    // 1. 이후 처리에 사용할 request을 계산한다.
    const request = route.request();
    // 2. 이후 처리에 사용할 method을 계산한다.
    const method = request.method();
    // 3. 이후 처리에 사용할 url을 계산한다.
    const url = new URL(request.url());
    // 4. 이후 처리에 사용할 authorization을 계산한다.
    const authorization = request.headers().authorization ?? null;

    // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (method === "OPTIONS") {
      await fulfillJson(route, null, 204);
      return;
    }

    // 6. 현재 단계에서 필요한 side effect를 실행한다.
    requests.push({
      authorization,
      method,
      path: `${url.pathname}${url.search}`,
    });

    // 7. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (url.pathname !== "/admin/api/me") {
      await fulfillJson(route, { code: "ADMIN_API_REMOVED" }, 410);
      return;
    }

    // 8. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (authorization === USER_AUTHORIZATION_HEADER) {
      await fulfillJson(route, { code: "ADMIN_FORBIDDEN" }, 403);
      return;
    }

    // 9. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (authorization !== ADMIN_AUTHORIZATION_HEADER) {
      await fulfillJson(route, { code: "AUTH_UNAUTHORIZED" }, 401);
      return;
    }

    // 10. 필요한 비동기 작업을 실행한다.
    await fulfillJson(route, {
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
      externalAuthUserId: null,
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
