import { expect, test, type Page, type Route } from "@playwright/test";

const ADMIN_ACCESS_TOKEN = "admin-e2e-access-token";
const USER_ACCESS_TOKEN = "non-admin-e2e-access-token";
const ADMIN_AUTHORIZATION_HEADER = `Bearer ${ADMIN_ACCESS_TOKEN}`;
const USER_AUTHORIZATION_HEADER = `Bearer ${USER_ACCESS_TOKEN}`;
const ADMIN_NAME = "운영 관리자";
const ADMIN_EMAIL = "admin@example.com";
const USER_ID = "user-1";
const USER_NAME_MASKED = "홍**";
const USER_EMAIL_MASKED = "ho***@example.com";
const USER_EMAIL_RAW = "hong@example.com";
const MEETING_NOTE_ID = "meeting-note-1";
const MEETING_NOTE_TITLE = "긴 텍스트 QA 회의록 제목";
const RAW_VIEW_REASON = "복구 문의 검증을 위해 회의록 본문 확인이 필요해요";
const RAW_MEETING_NOTE_BODY = "민감 회의록 본문 원문";
const NOW = "2026-08-01T04:00:00.000Z";

type ApiRequestRecord = {
  readonly method: string;
  readonly path: string;
  readonly authorization: string | null;
};

type AuditLogItem = {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminEmailMasked: string | null;
  readonly targetUserId: string | null;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly action: string;
  readonly result: string;
  readonly reasonPreview: string | null;
  readonly requestId: string | null;
  readonly createdAt: string;
};

type RawAccessBody = {
  readonly targetUserId?: string;
  readonly targetType?: string;
  readonly targetId?: string;
  readonly fieldSet?: string;
  readonly reason?: string;
};

type OperationCheckRun = {
  readonly id: string;
  readonly environment: string;
  readonly status: string;
  readonly checkedAt: string;
  readonly checkedByAdminUserId: string;
  readonly items: Record<string, string>;
  readonly notes: string | null;
};

type AdminMockStore = {
  auditLogs: AuditLogItem[];
  operationCheckRun: OperationCheckRun;
  readonly requests: ApiRequestRecord[];
  sequence: number;
};

test.describe("Admin Web smoke E2E", () => {
  test("현재 Admin route, 권한 차단, 원문 사유 검증, 운영 gate를 확인한다", async ({
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
      await expect(
        page.getByRole("button", { name: "관리자로 계속" })
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "일반 사용자로 계속" })
      ).toHaveCount(0);
      await submitAccessToken(page, USER_ACCESS_TOKEN);
      await expect(page).toHaveURL(/\/login$/);
      await expect(
        page.getByText("Admin API request failed: 403")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "관리자 권한이 필요합니다" })
      ).toHaveCount(0);
    });

    await test.step("Admin 로그인과 사용자 overview route", async () => {
      await submitAccessToken(page, ADMIN_ACCESS_TOKEN);
      await expect(page).toHaveURL(/\/users$/);
      await expect(
        page.getByRole("heading", { name: "사용자 운영" })
      ).toBeVisible();
      await expect(page.getByText(USER_NAME_MASKED)).toBeVisible();
      await expect(page.getByText(USER_EMAIL_MASKED)).toBeVisible();
      await expect(page.getByText(USER_EMAIL_RAW)).toHaveCount(0);

      await page.getByRole("button").filter({ hasText: USER_NAME_MASKED }).click();
      await expect(page).toHaveURL(new RegExp(`/users/${USER_ID}$`));
      await expect(page.getByText("Domain counts")).toBeVisible();
      await expect(page.getByText("Notification")).toBeVisible();
    });

    await test.step("도메인 탭 긴 텍스트와 reason modal validation", async () => {
      await page.getByRole("link", { name: "도메인" }).click();
      await expect(
        page.getByRole("heading", { name: "도메인 탭" })
      ).toBeVisible();
      await expect(page.getByText("QA 확인용 회사")).toBeVisible();

      await page.getByRole("button", { name: "회의록" }).click();
      await page
        .getByRole("button", { name: new RegExp(MEETING_NOTE_TITLE) })
        .click();
      await expect(page.getByText("Safe summary")).toBeVisible();
      await page.getByRole("button", { name: "본문 원문 조회" }).click();

      const dialog = page.locator("form").filter({ hasText: "회의록 본문 원문 조회" });
      await expect(dialog).toBeVisible();
      await dialog.getByLabel("조회 사유").fill("짧음");
      await dialog.getByRole("button", { name: "확인" }).click();
      await expect(
        dialog.getByText("사유는 10자 이상 입력해 주세요")
      ).toBeVisible();

      await dialog.getByLabel("조회 사유").fill(RAW_VIEW_REASON);
      await dialog.getByRole("button", { name: "확인" }).click();
      await expect(page.getByText("승인된 원문")).toBeVisible();
      await expect(page.getByText(RAW_MEETING_NOTE_BODY)).toBeVisible();
      await page.getByRole("button", { name: "닫기" }).last().click();
    });

    await test.step("감사 로그와 운영 route smoke", async () => {
      await page.getByRole("link", { name: "감사 로그" }).click();
      await expect(
        page.getByRole("heading", { name: "감사 로그" })
      ).toBeVisible();
      await expect(
        page.getByRole("button").filter({ hasText: "ADMIN_SENSITIVE_RAW_ACCESS" })
      ).toBeVisible();
      await expect(page.getByText(RAW_VIEW_REASON)).toBeVisible();

      await page.getByRole("link", { name: "Provider 실패" }).click();
      await expect(
        page.getByRole("heading", { name: "Provider 실패 운영" })
      ).toBeVisible();
      await expect(page.getByText("OCR_SAFE_ERROR")).toBeVisible();

      await page.getByRole("link", { name: "사용량 분석" }).click();
      await expect(
        page.getByRole("heading", { name: "사용량 분석" })
      ).toBeVisible();
      await expect(page.getByText("Mobile field-use")).toBeVisible();

      await page.getByRole("link", { name: "계정 요청" }).click();
      await expect(
        page.getByRole("heading", { name: "계정 데이터 요청 queue" })
      ).toBeVisible();

      await page.getByRole("link", { name: "Trash 요청" }).click();
      await expect(
        page.getByRole("heading", { name: "복구 요청 queue" })
      ).toBeVisible();

      await page.getByRole("link", { name: "운영 gate" }).click();
      await expect(
        page.getByRole("heading", { name: "운영 gate", exact: true })
      ).toBeVisible();
      await expect(page.getByText("최신 운영 gate")).toBeVisible();
      await expect(page.getByText("production").first()).toBeVisible();
    });

    expect(api.unauthorizedAdminDataRequests()).toEqual([]);
    expect(consoleMessages.join("\n")).not.toContain(RAW_MEETING_NOTE_BODY);
  });
});

// 기능 : Admin 로그인 화면에서 access token을 제출합니다.
async function submitAccessToken(page: Page, accessToken: string) {
  await page.getByLabel("App access token").fill(accessToken);
  await page.getByRole("button", { name: "토큰으로 관리자 확인" }).click();
}

// 기능 : Admin Web이 호출하는 현재 Admin API 계약을 Playwright route mock으로 제공합니다.
async function setupAdminApiMocks(page: Page) {
  const store = createStore();

  await page.route(isAdminApiRequest, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const authorization = request.headers().authorization ?? null;

    if (method === "OPTIONS") {
      await fulfillJson(route, null, 204);
      return;
    }

    store.requests.push({
      method,
      path: `${url.pathname}${url.search}`,
      authorization,
    });

    if (url.pathname === "/admin/api/me") {
      await handleAdminMe(route, authorization);
      return;
    }

    if (authorization !== ADMIN_AUTHORIZATION_HEADER) {
      await fulfillJson(route, { code: "ADMIN_FORBIDDEN" }, 403);
      return;
    }

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
    unauthorizedAdminDataRequests: () =>
      store.requests.filter(
        (request) =>
          request.path !== "/admin/api/me" &&
          request.authorization !== ADMIN_AUTHORIZATION_HEADER
      ),
  };
}

// 기능 : `/admin/api/me` mock 응답에서 non-admin token을 거부합니다.
async function handleAdminMe(route: Route, authorization: string | null) {
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
    email: ADMIN_EMAIL,
    displayName: ADMIN_NAME,
    role: "ADMIN",
  });
}

// 기능 : 현재 노출된 Admin route별 API mock 응답을 반환합니다.
async function handleAdminApiRequest(
  store: AdminMockStore,
  route: Route,
  method: string,
  url: URL
): Promise<unknown> {
  const path = url.pathname;

  if (path === "/admin/api/users" && method === "GET") {
    return {
      items: [createUserListItem()],
      nextCursor: null,
    };
  }

  if (path === `/admin/api/users/${USER_ID}` && method === "GET") {
    return createUserOverview();
  }

  if (
    path === `/admin/api/users/${USER_ID}/activity-timeline` &&
    method === "GET"
  ) {
    return {
      items: [
        {
          id: "activity-1",
          eventType: "deal_created",
          source: "DOMAIN_RECORD",
          targetType: "DEAL",
          targetId: "deal-1",
          title: "딜 생성",
          summary: "딜 1건을 만들었어요",
          occurredAt: NOW,
        },
      ],
      nextCursor: null,
    };
  }

  if (path === `/admin/api/users/${USER_ID}/domain-records` && method === "GET") {
    return createDomainRecordsResponse(url.searchParams.get("domain"));
  }

  if (path === "/admin/api/sensitive/raw-access" && method === "POST") {
    return createSensitiveRawAccessResponse(store, route);
  }

  if (path === "/admin/api/audit-logs" && method === "GET") {
    return {
      items: store.auditLogs,
      nextCursor: null,
    };
  }

  if (path === "/admin/api/provider-failures" && method === "GET") {
    return {
      items: [createProviderFailure()],
      nextCursor: null,
    };
  }

  if (path === "/admin/api/analytics/overview" && method === "GET") {
    return createAnalyticsOverview();
  }

  if (path === "/admin/api/account-deletion-requests" && method === "GET") {
    return {
      items: [createAccountDeletionRequest()],
      nextCursor: null,
    };
  }

  if (path === "/admin/api/data-export-requests" && method === "GET") {
    return {
      items: [createDataExportRequest()],
      nextCursor: null,
    };
  }

  if (path === "/admin/api/trash/recovery-requests" && method === "GET") {
    return {
      items: [createTrashRecoveryRequest()],
      nextCursor: null,
    };
  }

  if (
    path === "/admin/api/system/operation-checks/latest" &&
    method === "GET"
  ) {
    return store.operationCheckRun;
  }

  if (path === "/admin/api/system/operation-checks" && method === "POST") {
    store.operationCheckRun = await readBody<OperationCheckRun>(route);
    return store.operationCheckRun;
  }

  throw new Error(`${method} ${path} mock이 없습니다.`);
}

// 기능 : Admin smoke test에서 공유하는 mock store를 생성합니다.
function createStore(): AdminMockStore {
  return {
    auditLogs: [],
    operationCheckRun: {
      id: "operation-check-1",
      environment: "production",
      status: "PASS",
      checkedAt: NOW,
      checkedByAdminUserId: "admin-1",
      items: {
        prismaValidate: "PASS",
        prismaGenerate: "PASS",
        migrationStatus: "PASS",
        seedNotRunOnSharedDb: "PASS",
        backupVerified: "PASS",
        restoreDryRun: "PASS",
        providerSmoke: "WARN",
      },
      notes: "운영 gate QA 기록",
    },
    requests: [],
    sequence: 1,
  };
}

// 기능 : Admin 사용자 목록 응답 item을 생성합니다.
function createUserListItem() {
  return {
    id: USER_ID,
    emailMasked: USER_EMAIL_MASKED,
    displayNameMasked: USER_NAME_MASKED,
    role: "USER",
    status: "ACTIVE",
    preferredLocale: "ko-KR",
    timeZone: "Asia/Seoul",
    countryCode: "KR",
    defaultCurrencyCode: "KRW",
    createdAt: NOW,
    lastLoginAt: NOW,
    domainCounts: {
      companies: 1,
      contacts: 1,
      products: 1,
      deals: 1,
      schedules: 1,
      meetingNotes: 1,
      trashActive: 0,
      trashExpired: 1,
    },
  };
}

// 기능 : Admin 사용자 상세 overview 응답을 생성합니다.
function createUserOverview() {
  return {
    id: USER_ID,
    profile: {
      emailMasked: USER_EMAIL_MASKED,
      displayNameMasked: USER_NAME_MASKED,
      role: "USER",
      status: "ACTIVE",
      preferredLocale: "ko-KR",
      timeZone: "Asia/Seoul",
      countryCode: "KR",
      defaultCurrencyCode: "KRW",
      createdAt: NOW,
      lastLoginAt: NOW,
    },
    domainCounts: {
      companies: 1,
      contacts: 1,
      products: 1,
      deals: 1,
      schedules: 1,
      meetingNotes: 1,
      businessCardScans: 1,
      imports: 1,
      exports: 1,
    },
    trashSummary: {
      active: 0,
      expired: 1,
      recoveryRequests: 1,
    },
    analyticsSummary: {
      activationStatus: "ACTIVATED",
      activatedAt: NOW,
      lastActiveEventAt: NOW,
      aiRequestCount30d: 3,
      aiEstimatedCost30d: "0.11",
    },
    notificationSummary: {
      browserPushEnabled: true,
      activeBrowserPushSubscriptions: 1,
      revokedBrowserPushSubscriptions: 0,
      lastBrowserPushDeliveryStatus: "SENT",
      lastDeliveryFailureSafeErrorCode: null,
    },
  };
}

// 기능 : 선택된 도메인별 read-only row 목록 응답을 생성합니다.
function createDomainRecordsResponse(domain: string | null) {
  if (domain === "MEETING_NOTE") {
    return {
      domain: "MEETING_NOTE",
      items: [
        {
          id: MEETING_NOTE_ID,
          displayTitle: MEETING_NOTE_TITLE,
          status: "ACTIVE",
          summary: {
            meetingDate: "2026-08-01",
            dealCount: 1,
            bodyPreview: "본문 숨김",
          },
          sensitiveFlags: {
            hasBody: true,
            providerRawIncluded: false,
          },
          createdAt: NOW,
          updatedAt: NOW,
          deletedAt: null,
          trashExpiresAt: null,
        },
      ],
      nextCursor: null,
    };
  }

  return {
    domain: "COMPANY",
    items: [
      {
        id: "company-1",
        displayTitle: "QA 확인용 회사",
        status: "ACTIVE",
        summary: {
          field: "SaaS",
          contactCount: 1,
          dealCount: 1,
        },
        sensitiveFlags: {
          hasMemo: false,
          privateMemoIncluded: false,
        },
        createdAt: NOW,
        updatedAt: NOW,
        deletedAt: null,
        trashExpiresAt: null,
      },
    ],
    nextCursor: null,
  };
}

// 기능 : 민감 원문 조회 요청을 검증하고 감사 로그와 raw access 응답을 생성합니다.
async function createSensitiveRawAccessResponse(
  store: AdminMockStore,
  route: Route
) {
  const input = await readBody<RawAccessBody>(route);
  const reason = input.reason?.trim().replace(/\s+/g, " ") ?? "";

  if (reason.length < 10) {
    throw new Error("Audit reason is required");
  }

  const auditLog = createAuditLog(store, reason);
  store.auditLogs = [auditLog, ...store.auditLogs];

  return {
    accessId: `sensitive-access-${store.sequence}`,
    targetUserId: USER_ID,
    targetType: "MEETING_NOTE",
    targetId: MEETING_NOTE_ID,
    fieldSet: "MEETING_NOTE_BODY",
    data: {
      title: MEETING_NOTE_TITLE,
      details: RAW_MEETING_NOTE_BODY,
      nextPlan: "후속 일정 확인",
      requiredAction: "고객에게 회신",
    },
    createdAt: NOW,
  };
}

// 기능 : 감사 로그 목록에 표시할 민감 원문 조회 기록을 생성합니다.
function createAuditLog(store: AdminMockStore, reason: string): AuditLogItem {
  const auditLog: AuditLogItem = {
    id: `audit-log-${store.sequence}`,
    adminUserId: "admin-1",
    adminEmailMasked: "ad***@example.com",
    targetUserId: USER_ID,
    targetType: "MEETING_NOTE",
    targetId: MEETING_NOTE_ID,
    action: "ADMIN_SENSITIVE_RAW_ACCESS",
    result: "SUCCESS",
    reasonPreview: reason,
    requestId: "req-admin-smoke",
    createdAt: NOW,
  };

  store.sequence += 1;

  return auditLog;
}

// 기능 : Provider failure route에 필요한 safe 실패 row를 생성합니다.
function createProviderFailure() {
  return {
    id: "provider-failure-1",
    providerType: "OPENAI",
    sourceModel: "BusinessCardScanLog",
    userId: USER_ID,
    userEmailMasked: USER_EMAIL_MASKED,
    featureArea: "BUSINESS_CARD_OCR",
    operation: "businessCardOcr",
    targetType: "BUSINESS_CARD_SCAN",
    targetId: "scan-1",
    status: "FAILED",
    safeErrorCode: "OCR_SAFE_ERROR",
    safeErrorMessage: "OCR 처리에 실패했어요",
    retryable: true,
    latencyMs: 1200,
    requestId: "req-provider-1",
    occurredAt: NOW,
  };
}

// 기능 : Analytics overview route에 필요한 aggregate 응답을 생성합니다.
function createAnalyticsOverview() {
  return {
    range: {
      from: "2026-07-25T00:00:00.000Z",
      to: NOW,
      timeZone: "Asia/Seoul",
    },
    activation: {
      activatedUsers: 1,
      notActivatedUsers: 0,
      activationRate: 1,
    },
    retention: [
      {
        cohortDate: "2026-07-25",
        dayOffset: 7,
        cohortUserCount: 1,
        retainedUserCount: 1,
        retentionRate: 1,
      },
    ],
    events: [{ eventName: "app_opened", count: 5 }],
    routes: [{ routeKey: "/app/trash", viewCount: 2 }],
    aiUsage: {
      requestCount: 3,
      successCount: 2,
      failureCount: 1,
      estimatedCost: "0.11",
    },
    mobileFieldUse: {
      businessCardCaptureStarted: 1,
      businessCardCaptureRetried: 0,
      businessCardOcrFailed: 1,
      meetingNoteRecordingStarted: 1,
      meetingNoteRecordingCompleted: 1,
      meetingNoteRecordingFailed: 0,
      localDraftSaved: 1,
      localDraftRestored: 1,
      localDraftDiscarded: 0,
      mobilePushPermissionPromptOpened: 1,
      mobilePushPermissionResult: {
        granted: 1,
        denied: 0,
        default: 0,
        unsupported: 0,
        browserPushEnabledTrue: 1,
        browserPushEnabledFalse: 0,
      },
    },
  };
}

// 기능 : 계정 삭제 요청 queue mock row를 생성합니다.
function createAccountDeletionRequest() {
  return {
    id: "account-delete-1",
    userId: USER_ID,
    userEmailMasked: USER_EMAIL_MASKED,
    status: "REQUESTED",
    requestedAt: NOW,
    scheduledDeletionAt: "2026-08-31T04:00:00.000Z",
    reasonCode: "USER_REQUEST",
  };
}

// 기능 : 데이터 export 요청 queue mock row를 생성합니다.
function createDataExportRequest() {
  return {
    id: "data-export-1",
    userId: USER_ID,
    userEmailMasked: USER_EMAIL_MASKED,
    status: "REQUESTED",
    includeSensitive: false,
    format: "JSON",
    requestedAt: NOW,
    expiresAt: null,
  };
}

// 기능 : Trash 복구 요청 queue mock row를 생성합니다.
function createTrashRecoveryRequest() {
  return {
    id: "trash-recovery-1",
    userId: USER_ID,
    userEmailMasked: USER_EMAIL_MASKED,
    targetType: "MEETING_NOTE",
    targetId: MEETING_NOTE_ID,
    titleSnapshot: MEETING_NOTE_TITLE,
    status: "REQUESTED",
    deletedAt: "2026-07-20T00:00:00.000Z",
    trashExpiresAt: "2026-07-27T00:00:00.000Z",
    createdAt: NOW,
  };
}

// 기능 : request body JSON을 안전하게 파싱합니다.
async function readBody<TBody>(route: Route): Promise<TBody> {
  const postData = route.request().postData();

  if (!postData) {
    return {} as TBody;
  }

  return JSON.parse(postData) as TBody;
}

// 기능 : JSON mock 응답을 CORS header와 함께 반환합니다.
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

// 기능 : Admin API 요청만 route mock 대상으로 판별합니다.
function isAdminApiRequest(url: URL) {
  return url.pathname.startsWith("/admin/api/");
}
