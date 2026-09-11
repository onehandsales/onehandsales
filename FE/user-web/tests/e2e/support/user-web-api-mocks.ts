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

export type UserWebApiMockStore = Record<string, never>;

type ApiDelayResolver = (request: ApiRequestRecord) => number;

type SetupUserWebApiMockOptions = {
  readonly delayMs?: number | ApiDelayResolver;
  readonly store?: UserWebApiMockStore;
};

export function createUserWebApiMockStore(): UserWebApiMockStore {
  return {};
}

export async function setupUserWebApiMocks(
  page: Page,
  options: SetupUserWebApiMockOptions = {},
) {
  const store = options.store ?? createUserWebApiMockStore();
  const protectedRequests: ApiRequestRecord[] = [];

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (!url.pathname.startsWith("/api/")) {
      await route.continue();
      return;
    }

    const method = route.request().method().toUpperCase();
    const authorization = route.request().headers().authorization ?? null;

    if (method === "OPTIONS") {
      await route.fulfill({ headers: corsHeaders(), status: 204 });
      return;
    }

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

    await delayApiResponse(options.delayMs, { authorization, method, pathname: url.pathname });
    await fulfill(route, await handleApiRequest(store, route, method, url));
  });

  return {
    protectedRequestsWithoutAuthorization() {
      return protectedRequests.filter((request) => request.authorization === null);
    },
    store,
  };
}

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

async function handleApiRequest(
  _store: UserWebApiMockStore,
  route: Route,
  method: string,
  url: URL,
): Promise<MockApiResponse> {
  const pathname = url.pathname;

  if (pathname === "/api/auth/providers" && method === "GET") {
    return json({
      providers: [
        { enabled: true, label: "Google", provider: "google" },
        { enabled: true, label: "LINE", provider: "line" },
        { enabled: true, label: "Apple", provider: "apple" },
      ],
    });
  }

  if (pathname === "/api/auth/exchange" && method === "POST") {
    return json(createAuthTokenResponse());
  }

  if (pathname === "/api/auth/refresh" && method === "POST") {
    return json(createAuthTokenResponse());
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    return json({ ok: true });
  }

  if (pathname === "/api/public/contact-requests" && method === "POST") {
    return json({ id: "public-contact-1", message: "received" }, 201);
  }

  if (pathname === "/api/support-requests" && method === "POST") {
    return json({
      id: "support-request-1",
      message: "\uC9C0\uC6D0 \uC694\uCCAD\uC744 \uBCF4\uB0C8\uC5B4\uC694.",
    }, 201);
  }

  if (pathname === "/api/error-reports" && method === "POST") {
    return json({
      id: "error-report-1",
      message:
        "\uC2E0\uACE0\uAC00 \uC811\uC218\uB418\uC5C8\uC5B4\uC694. \uBB38\uC81C\uB97C \uBE60\uB974\uAC8C \uD574\uACB0\uD560\uAC8C\uC694.",
    }, 201);
  }

  if (pathname === "/api/me" && method === "GET") {
    return json(createAuthUser());
  }

  if (pathname === "/api/users/me/profile" && method === "GET") {
    return json(createUserProfile());
  }

  if (pathname === "/api/users/me/profile" && method === "PATCH") {
    const overrides = recordField(await readJsonBody(route));
    return json(createUserProfile(overrides));
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

  return json(
    {
      code: "NotFound",
      message: `No E2E mock for ${method} ${pathname}`,
      statusCode: 404,
    },
    404,
  );
}

function createAuthUser(overrides: Partial<MutableRecord> = {}) {
  return {
    countryCode: "KR",
    defaultCurrencyCode: "KRW",
    email: MOBILE_LONG_FIXTURE.email,
    id: "user-e2e-001",
    lastLoginCountryCode: "KR",
    lastLoginLocale: "ko-KR",
    lastLoginTimeZone: "Asia/Seoul",
    name: MOBILE_LONG_FIXTURE.name,
    preferredLocale: "ko-KR",
    role: "USER",
    settings: {
      defaultReminderMinutes: 30,
      sensitiveWarningEnabled: true,
    },
    signupCountryCode: "KR",
    signupLocale: "ko-KR",
    signupTimeZone: "Asia/Seoul",
    status: "ACTIVE",
    supabaseUserId: "supabase-e2e-001",
    timeZone: "Asia/Seoul",
    ...overrides,
  };
}

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

async function readJsonBody(route: Route): Promise<unknown> {
  const body = route.request().postData();
  if (!body) return {};
  return JSON.parse(body) as unknown;
}

function recordField(value: unknown): MutableRecord {
  return value && typeof value === "object" ? (value as MutableRecord) : {};
}

function json(body: unknown, status = 200): MockApiResponse {
  return { body, contentType: "application/json", status };
}

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

function corsHeaders() {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "access-control-allow-origin": "*",
  };
}

function isPublicApiRequest(pathname: string) {
  return [
    "/api/auth/providers",
    "/api/auth/exchange",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/public/contact-requests",
  ].includes(pathname);
}

async function delayApiResponse(
  delayMs: number | ApiDelayResolver | undefined,
  request: ApiRequestRecord,
) {
  const ms = typeof delayMs === "function" ? delayMs(request) : delayMs ?? 0;
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
