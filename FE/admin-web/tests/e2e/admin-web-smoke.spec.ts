import { expect, test, type Page, type Route } from "@playwright/test";

const ADMIN_TOKEN = "Bearer mock-admin-web-access-token";
const ADMIN_NAME = "운영 관리자";
const USER_NAME = "홍길동";
const USER_EMAIL_MASKED = "ho***@example.com";
const DEAL_TITLE = "엔터프라이즈 도입";
const DEAL_AMOUNT_MASKED = "₩***";
const DEAL_AMOUNT_RAW = "1200000";
const RAW_VIEW_REASON = "고객 문의 검증을 위한 원문 조회";

type AdminUser = {
  readonly id: string;
  readonly name: string | null;
  readonly emailMasked: string | null;
  readonly role: string;
  readonly status: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

type AdminDeal = {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly title: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactId: string | null;
  readonly contactName: string | null;
  readonly amountMasked: string | null;
  readonly currency: string;
  readonly stage: string;
  readonly likelihoodStatus: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

type AdminCompany = {
  readonly id: string;
  readonly userId: string;
  readonly userName: string | null;
  readonly name: string;
  readonly industry: string | null;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

type AuditLog = {
  readonly id: string;
  readonly actorUserId: string | null;
  readonly actorUserName: string | null;
  readonly targetUserId: string | null;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly reasonSummary: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
};

type RawRequestBody = {
  readonly fields?: readonly string[];
  readonly reason?: string;
};

type AdminMockStore = {
  readonly adminUser: AdminUser;
  readonly user: AdminUser;
  readonly company: AdminCompany;
  readonly deal: AdminDeal;
  auditLogs: AuditLog[];
  sequence: number;
};

type ApiRequestRecord = {
  readonly method: string;
  readonly path: string;
  readonly authorization: string | null;
};

test.describe("Admin Web smoke E2E", () => {
  test("admin 안전 흐름과 민감 원문 감사 로그가 이어진다", async ({
    page,
  }) => {
    const consoleMessages: string[] = [];
    const api = await setupAdminApiMocks(page);

    page.on("console", (message) => {
      consoleMessages.push(message.text());
    });

    await test.step("non-admin 접근 차단", async () => {
      await page.goto("/users");
      await expect(page).toHaveURL(/\/login$/);
      await page.getByRole("button", { name: "일반 사용자로 계속" }).click();
      await expect(
        page.getByRole("heading", { name: "관리자 권한이 필요합니다" })
      ).toBeVisible();
      await page.getByRole("button", { name: "로그인으로 돌아가기" }).click();
      await expect(page).toHaveURL(/\/login$/);
    });

    await test.step("Admin 로그인과 대시보드 조회", async () => {
      await page.getByRole("button", { name: "관리자로 계속" }).click();
      await expect(page).toHaveURL(/\/users$/);
      await page.getByRole("link", { name: "대시보드" }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(
        page.getByRole("heading", { name: "관리자 대시보드" })
      ).toBeVisible();
      await expect(page.getByText("전체 사용자", { exact: true })).toBeVisible();
      await expect(page.getByText("최근 감사 로그", { exact: true })).toBeVisible();
    });

    await test.step("사용자 목록과 사용자 상세 조회", async () => {
      await page.getByRole("link", { name: "사용자" }).click();
      await expect(
        page.getByRole("heading", { name: "사용자 운영" })
      ).toBeVisible();
      await expect(page.getByText(USER_NAME)).toBeVisible();
      await expect(page.getByText(USER_EMAIL_MASKED)).toBeVisible();
      await page.getByRole("button", { name: new RegExp(USER_NAME) }).click();
      await expect(page.getByText("사용자별 회사")).toBeVisible();
    });

    await test.step("전체 딜 목록과 masking 확인", async () => {
      await page.getByRole("link", { name: "데이터" }).click();
      await expect(
        page.getByRole("heading", { name: "도메인 데이터" })
      ).toBeVisible();
      await page.getByRole("button", { name: "딜" }).click();
      await expect(page.getByText(DEAL_TITLE)).toBeVisible();
      await expect(page.getByText(DEAL_AMOUNT_MASKED)).toBeVisible();
      await expect(page.getByText(DEAL_AMOUNT_RAW)).toHaveCount(0);
      await page.getByRole("button", { name: new RegExp(DEAL_TITLE) }).click();
      await expect(page.getByText("딜 상세")).toBeVisible();
      await expect(page.getByText("민감 원문")).toBeVisible();
    });

    await test.step("원문 조회 사유 입력과 AuditLog 생성", async () => {
      await page.getByRole("button", { name: "원문 보기" }).first().click();
      const dialog = getRawDialog(page);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: "원문 보기" })).toBeDisabled();
      await dialog.getByPlaceholder("최소 10자 이상 입력").fill("짧음");
      await expect(dialog.getByRole("button", { name: "원문 보기" })).toBeDisabled();
      await dialog.getByPlaceholder("최소 10자 이상 입력").fill(RAW_VIEW_REASON);
      await dialog.getByRole("button", { name: "원문 보기" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText(DEAL_AMOUNT_RAW)).toBeVisible();
    });

    await test.step("감사 로그 생성 확인", async () => {
      await page.getByRole("link", { name: "감사 로그" }).click();
      await expect(
        page.getByRole("heading", { name: "감사 로그" })
      ).toBeVisible();
      const auditLogRow = page.getByRole("button", {
        name: /ADMIN_SENSITIVE_RAW_VIEW/,
      });
      await expect(auditLogRow).toBeVisible();
      await expect(page.getByText(RAW_VIEW_REASON)).toBeVisible();
      await auditLogRow.click();
      const detailPanel = page.locator("aside").filter({ hasText: "감사 로그 상세" });
      await expect(detailPanel.getByText("감사 로그 상세")).toBeVisible();
      await expect(detailPanel.getByText(ADMIN_NAME)).toBeVisible();
    });

    expect(api.unauthorizedRequests()).toEqual([]);
    expect(consoleMessages.join("\n")).not.toContain(DEAL_AMOUNT_RAW);
  });
});

async function setupAdminApiMocks(page: Page) {
  const store = createStore();
  const requests: ApiRequestRecord[] = [];

  await page.route(isAdminApiRequest, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());

    if (method === "OPTIONS") {
      await fulfillJson(route, null, 204);
      return;
    }

    requests.push({
      method,
      path: `${url.pathname}${url.search}`,
      authorization: request.headers().authorization ?? null,
    });

    try {
      const body = await handleAdminApiRequest(store, route, method, url);
      await fulfillJson(route, body);
    } catch (error) {
      await fulfillJson(
        route,
        {
          error: "AdminMockApiError",
          message: error instanceof Error ? error.message : "Mock API failed",
        },
        500
      );
    }
  });

  return {
    unauthorizedRequests: () =>
      requests.filter((request) => request.authorization !== ADMIN_TOKEN),
  };
}

async function handleAdminApiRequest(
  store: AdminMockStore,
  route: Route,
  method: string,
  url: URL
) {
  const path = url.pathname;

  if (path === "/admin/api/dashboard" && method === "GET") {
    return {
      userCount: 2,
      activeUserCount: 2,
      companyCount: 1,
      contactCount: 1,
      productCount: 1,
      dealCount: 1,
      recentAuditLogs: store.auditLogs,
    };
  }

  if (path === "/admin/api/users" && method === "GET") {
    return paginated([store.user, store.adminUser], url);
  }

  if (path === `/admin/api/users/${store.user.id}` && method === "GET") {
    return {
      user: store.user,
      settings: {
        defaultScheduleReminderMinutes: 30,
        defaultNextActionReminderMinutes: 60,
        emailNotificationEnabled: true,
        browserPushEnabled: true,
        sensitiveSaveWarningEnabled: true,
      },
      usageSummary: {
        companyCount: 1,
        contactCount: 1,
        productCount: 1,
        dealCount: 1,
      },
      recentAuditLogs: store.auditLogs,
    };
  }

  if (path === `/admin/api/users/${store.user.id}/companies` && method === "GET") {
    return paginated([store.company], url);
  }

  if (path === "/admin/api/companies" && method === "GET") {
    return paginated([store.company], url);
  }

  if (path === "/admin/api/deals" && method === "GET") {
    return paginated([store.deal], url);
  }

  if (path === `/admin/api/deals/${store.deal.id}` && method === "GET") {
    return {
      owner: {
        id: store.user.id,
        name: store.user.name,
        emailMasked: store.user.emailMasked,
        status: store.user.status,
      },
      memoSummary: { hasMemo: true, memoCount: 1, latestMemoAt: now() },
      activitySummary: { totalCount: 0, recentActivities: [] },
      schedulesSummary: { totalCount: 0 },
      meetingNotesSummary: { totalCount: 0 },
      deal: store.deal,
    };
  }

  if (path === `/admin/api/deals/${store.deal.id}/sensitive/raw` && method === "POST") {
    const input = await readBody<RawRequestBody>(route);
    const reason = input.reason?.trim() ?? "";

    if (reason.length < 10) {
      throw new Error("Audit reason is required");
    }

    const auditLog = createAuditLog(store, reason);
    store.auditLogs = [auditLog, ...store.auditLogs];

    return {
      targetType: "DEAL",
      targetId: store.deal.id,
      fields: (input.fields ?? ["amount"]).map((name) => ({
        name,
        value: name === "amount" ? DEAL_AMOUNT_RAW : null,
      })),
      auditLogId: auditLog.id,
      viewedAt: now(),
    };
  }

  if (path === "/admin/api/audit-logs" && method === "GET") {
    return paginated(store.auditLogs, url);
  }

  const auditLogMatch = path.match(/^\/admin\/api\/audit-logs\/([^/]+)$/);

  if (auditLogMatch && method === "GET") {
    const auditLogId = decodeURIComponent(auditLogMatch[1] ?? "");
    const auditLog = store.auditLogs.find((item) => item.id === auditLogId);

    if (!auditLog) {
      throw new Error(`AuditLog not found: ${auditLogId}`);
    }

    return auditLog;
  }

  throw new Error(`${method} ${path} mock이 없습니다.`);
}

function createStore(): AdminMockStore {
  const user: AdminUser = {
    id: "user-1",
    name: USER_NAME,
    emailMasked: USER_EMAIL_MASKED,
    role: "USER",
    status: "ACTIVE",
    createdAt: now(),
    lastLoginAt: now(),
    deletedAt: null,
    permanentDeleteAt: null,
  };

  return {
    adminUser: {
      id: "admin-1",
      name: ADMIN_NAME,
      emailMasked: "ad***@example.com",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: now(),
      lastLoginAt: now(),
      deletedAt: null,
      permanentDeleteAt: null,
    },
    user,
    company: {
      id: "company-1",
      userId: user.id,
      userName: user.name,
      name: "스모크상사",
      industry: "B2C SaaS",
      deletedAt: null,
      permanentDeleteAt: null,
    },
    deal: {
      id: "deal-1",
      userId: user.id,
      userName: user.name,
      title: DEAL_TITLE,
      companyId: "company-1",
      companyName: "스모크상사",
      contactId: "contact-1",
      contactName: "김스모크",
      amountMasked: DEAL_AMOUNT_MASKED,
      currency: "KRW",
      stage: "IN_DISCUSSION",
      likelihoodStatus: "POSITIVE",
      deletedAt: null,
      permanentDeleteAt: null,
    },
    auditLogs: [],
    sequence: 1,
  };
}

function createAuditLog(store: AdminMockStore, reason: string): AuditLog {
  const auditLog: AuditLog = {
    id: `audit-log-${store.sequence}`,
    actorUserId: store.adminUser.id,
    actorUserName: store.adminUser.name,
    targetUserId: store.user.id,
    action: "ADMIN_SENSITIVE_RAW_VIEW",
    targetType: "DEAL",
    targetId: store.deal.id,
    reasonSummary: reason,
    ipAddress: "127.0.0.1",
    userAgent: "Playwright",
    createdAt: now(),
  };

  store.sequence += 1;

  return auditLog;
}

function paginated<TItem>(items: readonly TItem[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "20"));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount: items.length,
    hasNext: start + pageSize < items.length,
  };
}

async function readBody<TBody>(route: Route): Promise<TBody> {
  const postData = route.request().postData();

  if (!postData) {
    return {} as TBody;
  }

  return JSON.parse(postData) as TBody;
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    body: status === 204 ? undefined : JSON.stringify(body),
    contentType: "application/json",
    headers: {
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "access-control-allow-origin": "*",
    },
    status,
  });
}

function isAdminApiRequest(url: URL) {
  return url.pathname.startsWith("/admin/api/");
}

function getRawDialog(page: Page) {
  return page.locator("form").filter({ hasText: "민감 원문 조회" });
}

function now() {
  return "2026-06-07T09:00:00.000Z";
}
