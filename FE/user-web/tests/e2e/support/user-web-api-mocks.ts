import type { Page, Route } from "@playwright/test";

const E2E_ACCESS_TOKEN = "e2e-user-web-access-token";
const E2E_ACCESS_TOKEN_EXPIRES_AT = "2026-12-31T23:59:59.000Z";
const E2E_AUTHORIZATION = `Bearer ${E2E_ACCESS_TOKEN}`;
const NOW = "2026-07-20T09:00:00.000Z";

export const MOBILE_LONG_FIXTURE = {
  companyName:
    "RQA002 Mobile 90360 Jeonju Sales Opportunity Company Browser Compatibility ABCDEFGHIJK",
  email: "rqa002.mobile.browser.compatibility.long-email-address@example-onehand-sales.test",
  phone: "+82-10-1234-5678-9999",
  url: "https://onehand-sales.example.test/mobile-browser/overflow/390/360/chrome/edge/release-qa",
};

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

export type UserWebApiMockStore = {
  readonly companyFields: MutableRecord[];
  readonly companyRegions: MutableRecord[];
  readonly companies: MutableRecord[];
  readonly memoLogs: MutableRecord[];
  readonly privateMemoLogs: MutableRecord[];
  readonly trashItems: MutableRecord[];
  readonly counters: Record<string, number>;
};

type ApiDelayResolver = (request: ApiRequestRecord) => number;

type SetupUserWebApiMockOptions = {
  readonly delayMs?: number | ApiDelayResolver;
  readonly store?: UserWebApiMockStore;
};

export function createUserWebApiMockStore(): UserWebApiMockStore {
  return createStore();
}

export async function setupUserWebApiMocks(
  page: Page,
  options: SetupUserWebApiMockOptions = {},
) {
  const store = options.store ?? createStore();
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
  store: UserWebApiMockStore,
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
      message: "\uC2E0\uACE0\uAC00 \uC811\uC218\uB418\uC5C8\uC5B4\uC694. \uBB38\uC81C\uB97C \uBE60\uB974\uAC8C \uD574\uACB0\uD560\uAC8C\uC694.",
    }, 201);
  }

  if (pathname === "/api/me" && method === "GET") {
    return json(createAuthUser());
  }

  if (pathname === "/api/users/me/profile" && method === "GET") {
    return json(createUserProfile());
  }

  if (pathname === "/api/users/me/profile" && method === "PATCH") {
    return json(createUserProfile(await readJsonBody(route)));
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

  if (pathname === "/api/company-fields" && method === "GET") {
    return jsonList(store.companyFields);
  }

  if (pathname === "/api/company-fields" && method === "POST") {
    const body = await readJsonBody(route);
    const created = {
      field: stringField(body, "field") || "New field",
      id: nextId(store, "field"),
    };
    store.companyFields.unshift(created);
    return json(created, 201);
  }

  const fieldMatch = pathname.match(/^\/api\/company-fields\/([^/]+)$/);
  if (fieldMatch && method === "DELETE") {
    removeById(store.companyFields, fieldMatch[1]);
    return json({ ok: true });
  }

  if (pathname === "/api/company-regions" && method === "GET") {
    return jsonList(store.companyRegions);
  }

  if (pathname === "/api/company-regions" && method === "POST") {
    const body = await readJsonBody(route);
    const created = {
      countryCode: stringField(body, "countryCode") || "KR",
      id: nextId(store, "region"),
      region: stringField(body, "region") || "New region",
      regionCode: stringField(body, "regionCode") || null,
    };
    store.companyRegions.unshift(created);
    return json(created, 201);
  }

  const regionMatch = pathname.match(/^\/api\/company-regions\/([^/]+)$/);
  if (regionMatch && method === "DELETE") {
    removeById(store.companyRegions, regionMatch[1]);
    return json({ ok: true });
  }

  if (pathname === "/api/companies/export/xlsx" && method === "GET") {
    return {
      body: "company export",
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      headers: { "content-disposition": "attachment; filename=companies.xlsx" },
    };
  }

  if (pathname === "/api/companies" && method === "GET") {
    return json(paginated(filterCompanies(store.companies, url), url));
  }

  if (pathname === "/api/companies" && method === "POST") {
    const company = createCompany(store, await readJsonBody(route));
    store.companies.unshift(company);
    const memo = stringField(await safeReadJsonBody(route), "companyMemo");
    if (memo) {
      store.memoLogs.unshift(createCompanyMemoLog(store, String(company.id), { memo, memoType: "General memo" }));
    }
    return json(company, 201);
  }

  const companyMatch = pathname.match(/^\/api\/companies\/([^/]+)$/);
  if (companyMatch && method === "GET") {
    return json(requireItem(store.companies, companyMatch[1]));
  }

  if (companyMatch && method === "PATCH") {
    const company = requireItem(store.companies, companyMatch[1]);
    updateCompany(store, company, await readJsonBody(route));
    return json(company);
  }

  if (companyMatch && method === "DELETE") {
    const company = requireItem(store.companies, companyMatch[1]);
    company.deletedAt = NOW;
    store.trashItems.unshift(toTrashItem("COMPANY", company));
    return json({ ok: true });
  }

  const memoLogsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/memo-logs(?:\/([^/]+))?$/);
  if (memoLogsMatch) {
    return handleMemoLogRequest(store, route, method, memoLogsMatch, false);
  }

  const privateMemoLogsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/private-memo-logs(?:\/([^/]+))?$/);
  if (privateMemoLogsMatch) {
    return handleMemoLogRequest(store, route, method, privateMemoLogsMatch, true);
  }

  if (pathname === "/api/search" && method === "GET") {
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const items = store.companies
      .filter((company) => stringField(company, "companyName").toLowerCase().includes(q))
      .map((company) => ({
        subtitle: stringField(recordField(company, "companyRegion"), "region"),
        targetId: String(company.id),
        targetPath: `/app/companies/${company.id}`,
        title: stringField(company, "companyName"),
      }));

    return json({ groups: [{ items, type: "COMPANY" }] });
  }

  if (pathname === "/api/trash" && method === "GET") {
    return json(paginated(store.trashItems, url));
  }

  const trashDetailMatch = pathname.match(/^\/api\/trash\/([^/]+)\/([^/]+)(?:\/restore)?$/);
  if (trashDetailMatch && method === "GET") {
    const item = requireTrashItem(store, trashDetailMatch[1], trashDetailMatch[2]);
    return json(toTrashDetail(item));
  }

  if (trashDetailMatch && method === "POST" && pathname.endsWith("/restore")) {
    const item = requireTrashItem(store, trashDetailMatch[1], trashDetailMatch[2]);
    item.canRestore = false;
    return json({ restoredAt: NOW, targetId: item.targetId, targetType: item.targetType });
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

function createStore(): UserWebApiMockStore {
  const companyField = { field: "Mobile QA Field", id: "field-mobile-001" };
  const companyRegion = {
    countryCode: "KR",
    id: "region-seoul-001",
    region: "Seoul",
    regionCode: "11",
  };
  const company = createCompanyRecord({
    address: MOBILE_LONG_FIXTURE.url,
    companyField,
    companyName: MOBILE_LONG_FIXTURE.companyName,
    companyRegion,
    id: "company-mobile-001",
  });
  const memoLog = {
    companyId: company.id,
    createdAt: NOW,
    id: "company-memo-001",
    memo: "Initial company memo",
    memoType: "General memo",
  };
  const privateMemoLog = {
    companyId: company.id,
    createdAt: NOW,
    id: "company-private-memo-001",
    memo: "Private company memo",
  };

  return {
    companyFields: [companyField],
    companyRegions: [companyRegion],
    companies: [company],
    counters: { company: 1, field: 1, memo: 1, privateMemo: 1, region: 1 },
    memoLogs: [memoLog],
    privateMemoLogs: [privateMemoLog],
    trashItems: [
      {
        canRestore: true,
        deletedAt: NOW,
        hasPrivateMemo: false,
        parentId: null,
        parentTitle: null,
        parentType: null,
        permanentDeleteAt: "2026-08-19T09:00:00.000Z",
        privateMemoIncluded: false,
        restoreWindow: "ACTIVE",
        targetId: "trash-company-001",
        targetType: "COMPANY",
        title: "Deleted company",
        trashExpiresAt: "2026-08-19T09:00:00.000Z",
      },
    ],
  };
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
    name: "\uBAA8\uBC14\uC77CQA\uC0AC\uC6A9\uC790",
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

function createCompany(store: UserWebApiMockStore, body: unknown) {
  const field = findById(store.companyFields, stringField(body, "companyFieldId")) ?? store.companyFields[0];
  const region = findById(store.companyRegions, stringField(body, "companyRegionId")) ?? store.companyRegions[0];

  return createCompanyRecord({
    address: stringField(body, "address") || null,
    companyField: field,
    companyName: stringField(body, "companyName") || `Company ${store.counters.company + 1}`,
    companyRegion: region,
    id: nextId(store, "company"),
  });
}

function createCompanyRecord(input: {
  readonly address?: string | null;
  readonly companyField: MutableRecord;
  readonly companyName: string;
  readonly companyRegion: MutableRecord;
  readonly id: string;
}) {
  return {
    address: input.address ?? null,
    companyField: input.companyField,
    companyName: input.companyName,
    companyRegion: input.companyRegion,
    createdAt: NOW,
    id: input.id,
    updatedAt: NOW,
  };
}

function updateCompany(store: UserWebApiMockStore, company: MutableRecord, body: unknown) {
  const companyName = stringField(body, "companyName");
  const companyFieldId = stringField(body, "companyFieldId");
  const companyRegionId = stringField(body, "companyRegionId");

  if (companyName) company.companyName = companyName;
  if (Object.prototype.hasOwnProperty.call(recordField(body), "address")) {
    company.address = stringField(body, "address") || null;
  }
  if (companyFieldId) company.companyField = findById(store.companyFields, companyFieldId) ?? company.companyField;
  if (companyRegionId) company.companyRegion = findById(store.companyRegions, companyRegionId) ?? company.companyRegion;
  company.updatedAt = NOW;
}

async function handleMemoLogRequest(
  store: UserWebApiMockStore,
  route: Route,
  method: string,
  match: RegExpMatchArray,
  isPrivate: boolean,
): Promise<MockApiResponse> {
  const companyId = match[1];
  const logId = match[2];
  const collection = isPrivate ? store.privateMemoLogs : store.memoLogs;

  if (method === "GET" && !logId) {
    return jsonConnection(collection.filter((log) => log.companyId === companyId));
  }

  if (method === "POST" && !logId) {
    const created = isPrivate
      ? createCompanyPrivateMemoLog(store, companyId, await readJsonBody(route))
      : createCompanyMemoLog(store, companyId, await readJsonBody(route));
    collection.unshift(created);
    return json(created, 201);
  }

  if (method === "PATCH" && logId) {
    const log = requireItem(collection, logId);
    const body = await readJsonBody(route);
    if (isPrivate) {
      log.memo = stringField(body, "memo") || log.memo;
    } else {
      log.memo = stringField(body, "memo") || log.memo;
      log.memoType = stringField(body, "memoType") || log.memoType;
    }
    return json(log);
  }

  if (method === "DELETE" && logId) {
    removeById(collection, logId);
    return json({ ok: true });
  }

  return json({ code: "NotFound", message: "No memo mock", statusCode: 404 }, 404);
}

function createCompanyMemoLog(store: UserWebApiMockStore, companyId: string | undefined, body: unknown) {
  return {
    companyId,
    createdAt: NOW,
    id: nextId(store, "memo"),
    memo: stringField(body, "memo") || "Memo",
    memoType: stringField(body, "memoType") || "General memo",
  };
}

function createCompanyPrivateMemoLog(store: UserWebApiMockStore, companyId: string | undefined, body: unknown) {
  return {
    companyId,
    createdAt: NOW,
    id: nextId(store, "privateMemo"),
    memo: stringField(body, "memo") || "Private memo",
  };
}

function filterCompanies(companies: readonly MutableRecord[], url: URL) {
  const query = (url.searchParams.get("companyName") ?? "").trim().toLowerCase();
  if (!query) return companies;

  return companies.filter((company) =>
    stringField(company, "companyName").toLowerCase().includes(query),
  );
}

function paginated(items: readonly MutableRecord[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? 20));
  const offset = (page - 1) * pageSize;
  const pageItems = items.slice(offset, offset + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

function jsonConnection(items: readonly MutableRecord[]) {
  return json({ hasNext: false, items, nextCursor: null });
}

function toTrashItem(targetType: string, record: MutableRecord) {
  return {
    canRestore: true,
    deletedAt: NOW,
    hasPrivateMemo: false,
    parentId: null,
    parentTitle: null,
    parentType: null,
    permanentDeleteAt: "2026-08-19T09:00:00.000Z",
    privateMemoIncluded: false,
    restoreWindow: "ACTIVE",
    targetId: String(record.id),
    targetType,
    title: stringField(record, "companyName") || "Deleted record",
    trashExpiresAt: "2026-08-19T09:00:00.000Z",
  };
}

function toTrashDetail(item: MutableRecord) {
  return {
    ...item,
    content: null,
    fields: [
      { label: "Type", value: stringField(item, "targetType") },
      { label: "Deleted at", value: stringField(item, "deletedAt") },
    ],
    summary: stringField(item, "title"),
  };
}

function requireTrashItem(store: UserWebApiMockStore, targetType: string, targetId: string) {
  const item = store.trashItems.find(
    (candidate) => candidate.targetType === targetType && candidate.targetId === targetId,
  );
  if (!item) {
    throw new Error(`Missing trash item ${targetType}/${targetId}`);
  }
  return item;
}

function findById(collection: readonly MutableRecord[], id: string | undefined) {
  if (!id) return undefined;
  return collection.find((item) => item.id === id);
}

function requireItem(collection: readonly MutableRecord[], id: string | undefined) {
  const item = findById(collection, id);
  if (!item) {
    throw new Error(`Missing mock record ${id ?? "unknown"}`);
  }
  return item;
}

function removeById(collection: MutableRecord[], id: string | undefined) {
  const index = collection.findIndex((item) => item.id === id);
  if (index >= 0) {
    collection.splice(index, 1);
  }
}

function nextId(store: UserWebApiMockStore, key: string) {
  const nextValue = (store.counters[key] ?? 0) + 1;
  store.counters[key] = nextValue;
  return `${key}-${String(nextValue).padStart(3, "0")}`;
}

async function readJsonBody(route: Route): Promise<unknown> {
  const body = route.request().postData();
  if (!body) return {};
  return JSON.parse(body) as unknown;
}

async function safeReadJsonBody(route: Route): Promise<unknown> {
  try {
    return await readJsonBody(route);
  } catch {
    return {};
  }
}

function stringField(value: unknown, key: string): string {
  const field = recordField(value)[key];
  return typeof field === "string" ? field : "";
}

function recordField(value: unknown): MutableRecord {
  return value && typeof value === "object" ? (value as MutableRecord) : {};
}

function json(body: unknown, status = 200): MockApiResponse {
  return { body, contentType: "application/json", status };
}

function jsonList(items: readonly unknown[]) {
  return json({ items });
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
