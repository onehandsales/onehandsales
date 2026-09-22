import type { Page, Route } from "@playwright/test";

const E2E_ACCESS_TOKEN = "e2e-user-web-access-token";
const E2E_ACCESS_TOKEN_EXPIRES_AT = "2026-12-31T23:59:59.000Z";
const E2E_AUTHORIZATION = `Bearer ${E2E_ACCESS_TOKEN}`;
const NOW = "2026-07-20T09:00:00.000Z";

export const MOBILE_LONG_FIXTURE = {
  email: "rqa002.mobile.browser.compatibility.long-email-address@example-onehand-crm.test",
  name: "\uBAA8\uBC14\uC77CQA\uC0AC\uC6A9\uC790",
  phone: "+82-10-1234-5678-9999",
  url: "https://onehand-crm.example.test/mobile-browser/overflow/390/360/chrome/edge/release-qa",
} as const;

export type ApiRequestRecord = {
  readonly method: string;
  readonly pathname: string;
  readonly authorization: string | null;
};

type MockApiResponse = {
  readonly body?: unknown;
  readonly status?: number;
  readonly contentType?: string;
  readonly headers?: Record<string, string>;
};

type MutableRecord = Record<string, unknown>;

type MockWorkspaceKind = "ORGANIZATION" | "PERSONAL";

type MockSidebarWorkspaceSummary = {
  readonly id: string;
  readonly name: string;
  readonly kind: MockWorkspaceKind;
};

type MockSidebarCrmObjectListItem = {
  readonly id: string;
  readonly icon: string | null;
  readonly pluralName: string;
  readonly singularName: string;
};

export type UserWebApiMockStore = {
  createdWorkspace?: MockSidebarWorkspaceSummary;
};

type ApiDelayResolver = (request: ApiRequestRecord) => number;

type SetupUserWebApiMockOptions = {
  readonly delayMs?: number | ApiDelayResolver;
  readonly store?: UserWebApiMockStore;
};

// 기능 : create User Web Api Mock Store 요청 또는 객체를 생성합니다.
export function createUserWebApiMockStore(): UserWebApiMockStore {
  return {};
}

// 기능 : setup User Web Api Mocks 테스트 환경을 준비합니다.
export async function setupUserWebApiMocks(
  page: Page,
  options: SetupUserWebApiMockOptions = {},
) {
  // 1. 이후 단계에서 사용할 store 값을 준비한다.
  const store = options.store ?? createUserWebApiMockStore();
  // 2. 이후 단계에서 사용할 protectedRequests 값을 준비한다.
  const protectedRequests: ApiRequestRecord[] = [];

  // 3. 필요한 비동기 작업을 실행한다.
  await page.route("**/*", async (route) => {
    // 1. 이후 단계에서 사용할 url 값을 준비한다.
    const url = new URL(route.request().url());

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!url.pathname.startsWith("/api/")) {
      await route.continue();
      return;
    }

    // 3. 이후 단계에서 사용할 method 값을 준비한다.
    const method = route.request().method().toUpperCase();
    // 4. 이후 단계에서 사용할 authorization 값을 준비한다.
    const authorization = route.request().headers().authorization ?? null;

    // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (method === "OPTIONS") {
      await route.fulfill({ headers: corsHeaders(), status: 204 });
      return;
    }

    // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isPublicApiRequest(url.pathname) && authorization !== E2E_AUTHORIZATION) {
      protectedRequests.push({ authorization, method, pathname: url.pathname });
      await fulfillJson(
        route,
        {
          code: "Unauthorized",
          message: "Authentication required",
          statusCode: 401,
        },
        401,
      );
      return;
    }

    // 7. 필요한 비동기 작업을 실행한다.
    await delayApiResponse(options.delayMs, { authorization, method, pathname: url.pathname });
    // 8. 필요한 비동기 작업을 실행한다.
    await fulfill(route, await handleApiRequest(store, route, method, url));
  });

  // 4. 계산된 결과를 호출자에게 반환한다.
  return {
    // 기능 : protected Requests Without Authorization 기능을 수행합니다.
    protectedRequestsWithoutAuthorization() {
      return protectedRequests.filter((request) => request.authorization === null);
    },
    store,
  };
}

// 기능 : seed Authenticated Session 기능을 수행합니다.
export async function seedAuthenticatedSession(page: Page) {
  await page.addInitScript(
    ({ accessToken, expiresAt }) => {
      window.localStorage.setItem("onehand.userWeb.accessToken", accessToken);
      window.localStorage.setItem("onehand.userWeb.accessTokenExpiresAt", expiresAt);
    },
    {
      accessToken: E2E_ACCESS_TOKEN,
      expiresAt: E2E_ACCESS_TOKEN_EXPIRES_AT,
    },
  );
}

// 기능 : handle Api Request 이벤트를 처리합니다.
async function handleApiRequest(
  store: UserWebApiMockStore,
  route: Route,
  method: string,
  url: URL,
): Promise<MockApiResponse> {
  // 1. 이후 단계에서 사용할 pathname 값을 준비한다.
  const pathname = url.pathname;

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/auth/providers" && method === "GET") {
    return json({
      providers: [
        { enabled: true, label: "Google", provider: "google" },
        { enabled: true, label: "LINE", provider: "line" },
        { enabled: true, label: "Apple", provider: "apple" },
      ],
    });
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/auth/exchange" && method === "POST") {
    return json(createAuthTokenResponse());
  }

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/auth/refresh" && method === "POST") {
    return json(createAuthTokenResponse());
  }

  // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/auth/logout" && method === "POST") {
    return json({ ok: true });
  }

  // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/public/contact-requests" && method === "POST") {
    return json({ id: "public-contact-1", message: "received" }, 201);
  }

  // 7. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/support-requests" && method === "POST") {
    return json({
      id: "support-request-1",
      message: "\uC9C0\uC6D0 \uC694\uCCAD\uC744 \uBCF4\uB0C8\uC5B4\uC694.",
    }, 201);
  }

  // 8. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/error-reports" && method === "POST") {
    return json({
      id: "error-report-1",
      message:
        "\uC2E0\uACE0\uAC00 \uC811\uC218\uB418\uC5C8\uC5B4\uC694. \uBB38\uC81C\uB97C \uBE60\uB974\uAC8C \uD574\uACB0\uD560\uAC8C\uC694.",
    }, 201);
  }

  // 9. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/me" && method === "GET") {
    return json(createAuthUser());
  }

  // 10. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/users/me/profile" && method === "GET") {
    return json(createUserProfile());
  }

  // 11. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (pathname === "/api/users/me/profile" && method === "PATCH") {
    const overrides = recordField(await readJsonBody(route));
    return json(createUserProfile(overrides));
  }

  // 12. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (
    pathname === "/api/users/me/onboarding/job-selection" &&
    method === "POST"
  ) {
    return json(createJobSelectionOnboardingResponse());
  }

  // 13. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (
    pathname === "/api/users/me/sidebar/workspaces/default" &&
    method === "GET"
  ) {
    return json(createDefaultSidebarWorkspace(store.createdWorkspace));
  }

  if (pathname === "/api/users/me/sidebar/workspaces" && method === "GET") {
    return json(createSidebarWorkspaces(store.createdWorkspace));
  }

  if (
    pathname.startsWith("/api/users/me/sidebar/workspaces/") &&
    pathname.endsWith("/objects") &&
    method === "GET"
  ) {
    const workspaceId = decodeURIComponent(
      pathname
        .slice("/api/users/me/sidebar/workspaces/".length)
        .slice(0, -"/objects".length),
    );
    const workspace = findSidebarWorkspace(store.createdWorkspace, workspaceId);

    if (workspace) {
      return json(createSidebarCrmObjects());
    }

    return json(
      {
        code: "ObjectDefinitionSidebarWorkspaceNotFound",
        message: "Workspace not found",
        statusCode: 404,
      },
      404,
    );
  }

  if (
    pathname.startsWith("/api/users/me/sidebar/workspaces/") &&
    method === "GET"
  ) {
    const workspaceId = decodeURIComponent(
      pathname.slice("/api/users/me/sidebar/workspaces/".length),
    );
    const workspace = findSidebarWorkspace(store.createdWorkspace, workspaceId);

    if (workspace) {
      return json(workspace);
    }

    return json(
      {
        code: "WorkspaceSidebarWorkspaceNotFound",
        message: "Workspace not found",
        statusCode: 404,
      },
      404,
    );
  }

  if (pathname === "/api/users/me/workspaces" && method === "POST") {
    const body = recordField(await readJsonBody(route));
    const workspaceName =
      typeof body["workspaceName"] === "string" && body["workspaceName"].trim()
        ? body["workspaceName"].trim()
        : "E2E New Workspace";
    store.createdWorkspace = createWorkspaceResponse(workspaceName);
    return json({ workspaceId: store.createdWorkspace.id }, 201);
  }

  if (pathname === "/api/users/me/devices" && method === "GET") {
    return json({
      devices: [
        {
          activeSessionCount: 1,
          createdAt: NOW,
          id: "device-1",
          isCurrentDevice: true,
          label: "E2E browser",
          lastSeenAt: NOW,
          slot: "personal_laptop",
          status: "ACTIVE",
          updatedAt: NOW,
        },
      ],
    });
  }

  // 14. 계산된 결과를 호출자에게 반환한다.
  return json(
    {
      code: "NotFound",
      message: `No E2E mock for ${method} ${pathname}`,
      statusCode: 404,
    },
    404,
  );
}

// 기능 : create Auth User 요청 또는 객체를 생성합니다.
function createAuthUser(overrides: Partial<MutableRecord> = {}) {
  return {
    countryCode: "KR",
    defaultCurrencyCode: "KRW",
    email: MOBILE_LONG_FIXTURE.email,
    id: "user-e2e-001",
    jobSelectOnboardingCompletedAt: NOW,
    lastLoginCountryCode: "KR",
    lastLoginLocale: "ko-KR",
    lastLoginTimeZone: "Asia/Seoul",
    name: MOBILE_LONG_FIXTURE.name,
    preferredLocale: "ko-KR",
    platformRole: "USER",
    settings: {
      defaultReminderMinutes: 30,
      sensitiveWarningEnabled: true,
    },
    signupCountryCode: "KR",
    signupLocale: "ko-KR",
    signupTimeZone: "Asia/Seoul",
    status: "ACTIVE",
    externalAuthUserId: "external-auth-e2e-001",
    timeZone: "Asia/Seoul",
    ...overrides,
  };
}

// 기능 : create Auth Token Response 요청 또는 객체를 생성합니다.
function createAuthTokenResponse() {
  return {
    accessToken: E2E_ACCESS_TOKEN,
    accessTokenExpiresAt: E2E_ACCESS_TOKEN_EXPIRES_AT,
    device: {
      id: "device-1",
      label: "E2E browser",
      slot: "personal_laptop",
    },
    refreshToken: null,
    user: createAuthUser(),
  };
}

// 기능 : create User Profile 요청 또는 객체를 생성합니다.
function createUserProfile(overrides: Partial<MutableRecord> = {}) {
  return {
    ...createAuthUser(overrides),
    createdAt: NOW,
    lastLoginAt: NOW,
    oauthAccounts: [
      {
        createdAt: NOW,
        id: "oauth-1",
        provider: "google",
        providerEmail: MOBILE_LONG_FIXTURE.email,
      },
    ],
    updatedAt: NOW,
  };
}

// 기능 : 직업 선택 온보딩 완료 응답 fixture를 생성합니다.
function createJobSelectionOnboardingResponse() {
  return {
    jobSelectOnboardingCompletedAt: NOW,
  };
}

// 기능 : 기본 sidebar Workspace 응답 fixture를 생성합니다.
function createDefaultSidebarWorkspace(
  createdWorkspace?: MockSidebarWorkspaceSummary,
): MockSidebarWorkspaceSummary {
  if (createdWorkspace) {
    return createdWorkspace;
  }

  return {
    id: "workspace-e2e-001",
    name: "E2E Workspace",
    kind: "PERSONAL",
  };
}

// 기능 : sidebar Workspace 목록 응답 fixture를 생성합니다.
function createSidebarWorkspaces(createdWorkspace?: MockSidebarWorkspaceSummary) {
  const defaultWorkspace = createDefaultSidebarWorkspace();

  if (!createdWorkspace) {
    return [defaultWorkspace];
  }

  return [
    {
      id: createdWorkspace.id,
      name: createdWorkspace.name,
    },
    defaultWorkspace,
  ];
}

// 기능 : sidebar Workspace 단건 응답 fixture를 찾습니다.
function findSidebarWorkspace(
  createdWorkspace: MockSidebarWorkspaceSummary | undefined,
  workspaceId: string,
): MockSidebarWorkspaceSummary | null {
  const defaultWorkspace = createDefaultSidebarWorkspace();

  if (createdWorkspace?.id === workspaceId) {
    return createdWorkspace;
  }

  if (defaultWorkspace.id === workspaceId) {
    return defaultWorkspace;
  }

  return null;
}

// 기능 : sidebar 관리 항목 목록 응답 fixture를 생성합니다.
function createSidebarCrmObjects(): readonly MockSidebarCrmObjectListItem[] {
  return [
    {
      id: "object-definition-company",
      icon: "building-2",
      pluralName: "Companies",
      singularName: "Company",
    },
    {
      id: "object-definition-person",
      icon: "user-round",
      pluralName: "People",
      singularName: "Person",
    },
  ];
}

// 기능 : Workspace 생성 API 응답 fixture를 생성합니다.
function createWorkspaceResponse(
  workspaceName: string,
): MockSidebarWorkspaceSummary {
  return {
    id: "workspace-e2e-002",
    name: `${workspaceName}'s Workspace`,
    kind: "PERSONAL",
  };
}

// 기능 : read Json Body 값을 읽습니다.
async function readJsonBody(route: Route): Promise<unknown> {
  const body = route.request().postData();
  if (!body) return {};
  return JSON.parse(body) as unknown;
}

// 기능 : record Field 기능을 수행합니다.
function recordField(value: unknown): MutableRecord {
  return value && typeof value === "object" ? (value as MutableRecord) : {};
}

// 기능 : json 기능을 수행합니다.
function json(body: unknown, status = 200): MockApiResponse {
  return { body, contentType: "application/json", status };
}

// 기능 : fulfill 기능을 수행합니다.
async function fulfill(route: Route, response: MockApiResponse) {
  if (response.contentType === "application/json") {
    await fulfillJson(route, response.body ?? null, response.status ?? 200, response.headers);
    return;
  }

  await route.fulfill({
    body: String(response.body ?? ""),
    headers: {
      ...corsHeaders(),
      ...(response.contentType ? { "content-type": response.contentType } : {}),
      ...(response.headers ?? {}),
    },
    status: response.status ?? 200,
  });
}

// 기능 : Playwright route에 JSON mock 응답을 반환합니다.
async function fulfillJson(
  route: Route,
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  await route.fulfill({
    body: JSON.stringify(body),
    headers: {
      ...corsHeaders(),
      "content-type": "application/json",
      ...headers,
    },
    status,
  });
}

// 기능 : cors Headers 기능을 수행합니다.
function corsHeaders() {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "access-control-allow-origin": "*",
  };
}

// 기능 : is Public Api Request 여부를 판별합니다.
function isPublicApiRequest(pathname: string) {
  return [
    "/api/auth/providers",
    "/api/auth/exchange",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/public/contact-requests",
  ].includes(pathname);
}

// 기능 : delay Api Response 기능을 수행합니다.
async function delayApiResponse(
  delayMs: number | ApiDelayResolver | undefined,
  request: ApiRequestRecord,
) {
  const ms = typeof delayMs === "function" ? delayMs(request) : delayMs ?? 0;
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
