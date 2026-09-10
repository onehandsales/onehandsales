import type { Page, Route } from "@playwright/test";

const E2E_ACCESS_TOKEN = "e2e-user-web-access-token";
const E2E_ACCESS_TOKEN_EXPIRES_AT = "2026-12-31T23:59:59.000Z";
const E2E_AUTHORIZATION = `Bearer ${E2E_ACCESS_TOKEN}`;
const NOW = "2026-07-20T09:00:00.000Z";
const NEXT_WEEK = "2026-07-27T10:00:00.000Z";

export const MOBILE_LONG_FIXTURE = {
  companyName:
    "RQA002 모바일390360 아주긴회사명주식회사-브라우저호환성검증-ABCDEFGHIJK",
  contactName: "RQA002 모바일 담당자 긴이름 홍길동테스트매니저",
  email: "rqa002.mobile.browser.compatibility.long-email-address@example-onehand-sales.test",
  phone: "+82-10-1234-5678-내선-9999-모바일-오버플로우-검증",
  url: "https://onehand-sales.example.test/mobile-browser/overflow/390/360/chrome/edge/release-qa",
};

export type ApiRequestRecord = {
  readonly method: string;
  readonly pathname: string;
  readonly authorization: string | null;
};

type MockApiResponse = {
  readonly body: unknown;
  readonly status?: number;
  readonly contentType?: string;
  readonly headers?: Record<string, string>;
};

type MutableRecord = Record<string, unknown>;

export type UserWebApiMockStore = {
  readonly companyField: MutableRecord;
  readonly companyRegion: MutableRecord;
  readonly contactDepartment: MutableRecord;
  readonly contactJobGrade: MutableRecord;
  readonly productCategory: MutableRecord;
  readonly productStatus: MutableRecord;
  readonly companies: MutableRecord[];
  readonly contacts: MutableRecord[];
  readonly products: MutableRecord[];
  readonly deals: MutableRecord[];
  readonly dealActivities: MutableRecord[];
  readonly followingActionLogs: MutableRecord[];
  readonly trashItems: MutableRecord[];
  readonly counters: Record<string, number>;
};

type ApiDelayResolver = (request: ApiRequestRecord) => number;

type SetupUserWebApiMockOptions = {
  readonly delayMs?: number | ApiDelayResolver;
  readonly store?: UserWebApiMockStore;
};

export function createUserWebApiMockStore() {
  return createStore();
}

export async function setupUserWebApiMocks(
  page: Page,
  options: SetupUserWebApiMockOptions = {},
) {
  const store = options.store ?? createStore();
  const protectedRequests: ApiRequestRecord[] = [];
  const analyticsEvents: unknown[] = [];

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (!url.pathname.startsWith("/api/")) {
      await route.continue();
      return;
    }

    const method = route.request().method().toUpperCase();
    const authorization = route.request().headers().authorization ?? null;

    if (method === "OPTIONS") {
      await route.fulfill({
        headers: corsHeaders(),
        status: 204,
      });
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

    if (url.pathname === "/api/analytics/events" && method === "POST") {
      analyticsEvents.push(await readJsonBody(route));
      await fulfill(route, json({ accepted: true }));
      return;
    }

    const response = await handleApiRequest(store, route, method, url);
    await fulfill(route, response);
  });

  return {
    analyticsEvents() {
      return [...analyticsEvents];
    },
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

  if (pathname === "/api/auth/refresh" && method === "POST") {
    return json(createAuthTokenResponse());
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    return json({ ok: true });
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
          id: "device-mobile-001",
          isCurrentDevice: true,
          label: "Mobile browser",
          lastSeenAt: NOW,
          slot: "mobile",
          status: "ACTIVE",
          updatedAt: NOW,
        },
      ],
    });
  }

  if (pathname === "/api/search" && method === "GET") {
    return json(createSearchResponse(store, url));
  }

  const managedResponse = await handleManagedOptions(store, route, method, pathname);
  if (managedResponse) {
    return managedResponse;
  }

  if (pathname === "/api/contacts/company-options" && method === "GET") {
    return jsonList(
      store.companies.map((company) => ({
        companyName: stringField(company, "companyName"),
        id: stringField(company, "id"),
      })),
    );
  }

  if (pathname === "/api/deals/company-options" && method === "GET") {
    return jsonList(store.companies.map(toDealCompany));
  }

  if (pathname === "/api/deals/contact-options" && method === "GET") {
    return jsonList(store.contacts.map(toDealContactOption));
  }

  if (pathname === "/api/deals/product-options" && method === "GET") {
    return jsonList(store.products.map(toDealProduct));
  }

  if (pathname === "/api/deals/stage-counts" && method === "GET") {
    return json({
      items: DEAL_STATUS_LIST.map((status) => ({
        count: store.deals.filter((deal) => deal.dealStatus === status).length,
        dealStatus: status,
        dealStatusLabel: DEAL_STATUS_LABEL[status],
      })),
    });
  }

  if (pathname === "/api/error-reports" && method === "POST") {
    return json(
      {
        id: "error-report-e2e",
        message: "신고가 접수되었어요. 문제를 빠르게 해결할게요.",
      },
      201,
    );
  }

  if (pathname === "/api/support-requests" && method === "POST") {
    return json(
      {
        id: "support-request-e2e",
        message: "지원 요청을 접수했어요. 빠르게 확인할게요.",
      },
      201,
    );
  }

  if (pathname === "/api/companies" && method === "GET") {
    return json(paginated(store.companies, url));
  }

  if (pathname === "/api/companies" && method === "POST") {
    const company = createCompany(store, await readJsonBody(route));
    store.companies.unshift(company);
    return json(company, 201);
  }

  const companyDetailMatch = pathname.match(/^\/api\/companies\/([^/]+)$/);
  if (companyDetailMatch && method === "GET") {
    return json(requireItem(store.companies, companyDetailMatch[1]));
  }

  if (companyDetailMatch && method === "PATCH") {
    const company = requireItem(store.companies, companyDetailMatch[1]);
    updateCompany(store, company, await readJsonBody(route));
    return json(company);
  }

  if (companyDetailMatch && method === "DELETE") {
    moveToTrash(store, "COMPANY", companyDetailMatch[1]);
    return json(null);
  }

  const companyContactsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/contacts$/);
  if (companyContactsMatch && method === "GET") {
    return jsonList(
      store.contacts.filter((contact) => nestedId(contact.company) === companyContactsMatch[1]),
    );
  }

  const companyDealsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/deals$/);
  if (companyDealsMatch && method === "GET") {
    return jsonList(
      store.deals.filter((deal) => hasNestedIdArray(deal.companies, companyDealsMatch[1])),
    );
  }

  if (/^\/api\/companies\/[^/]+\/(memo-logs|private-memo-logs)(\/[^/]+)?$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/contacts" && method === "GET") {
    return json(paginated(store.contacts, url));
  }

  if (pathname === "/api/contacts" && method === "POST") {
    const contact = createContact(store, await readJsonBody(route));
    store.contacts.unshift(contact);
    incrementCount(store.companies, nestedId(contact.company), "contactCount");
    return json(contact, 201);
  }

  const contactDetailMatch = pathname.match(/^\/api\/contacts\/([^/]+)$/);
  if (contactDetailMatch && method === "GET") {
    return json(requireItem(store.contacts, contactDetailMatch[1]));
  }

  if (contactDetailMatch && method === "PATCH") {
    const contact = requireItem(store.contacts, contactDetailMatch[1]);
    updateContact(store, contact, await readJsonBody(route));
    return json(contact);
  }

  if (contactDetailMatch && method === "DELETE") {
    moveToTrash(store, "CONTACT", contactDetailMatch[1]);
    return json(null);
  }

  const contactDealsMatch = pathname.match(/^\/api\/contacts\/([^/]+)\/deals$/);
  if (contactDealsMatch && method === "GET") {
    return jsonList(
      store.deals.filter((deal) => hasNestedIdArray(deal.contacts, contactDealsMatch[1])),
    );
  }

  if (/^\/api\/contacts\/[^/]+\/(memo-logs|private-memo-logs)(\/[^/]+)?$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/products" && method === "GET") {
    return json(paginated(store.products, url));
  }

  if (pathname === "/api/products" && method === "POST") {
    const product = createProduct(store, await readJsonBody(route));
    store.products.unshift(product);
    return json(product, 201);
  }

  const productDetailMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productDetailMatch && method === "GET") {
    return json(requireItem(store.products, productDetailMatch[1]));
  }

  if (productDetailMatch && method === "PATCH") {
    const product = requireItem(store.products, productDetailMatch[1]);
    updateProduct(store, product, await readJsonBody(route));
    return json(product);
  }

  if (productDetailMatch && method === "DELETE") {
    moveToTrash(store, "PRODUCT", productDetailMatch[1]);
    return json(null);
  }

  const productDealsMatch = pathname.match(/^\/api\/products\/([^/]+)\/deals$/);
  if (productDealsMatch && method === "GET") {
    return jsonList(
      store.deals.filter((deal) => hasNestedIdArray(deal.products, productDealsMatch[1])),
    );
  }

  if (/^\/api\/products\/[^/]+\/(memo-logs|private-memo-logs)(\/[^/]+)?$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/deals" && method === "GET") {
    return json(paginated(store.deals.map((deal) => toDealListItem(store, deal)), url));
  }

  if (pathname === "/api/deals" && method === "POST") {
    const deal = createDeal(store, await readJsonBody(route));
    store.deals.unshift(deal);
    incrementRelatedDealCounts(store, deal);
    return json(deal, 201);
  }

  const dealDetailMatch = pathname.match(/^\/api\/deals\/([^/]+)$/);
  if (dealDetailMatch && method === "GET") {
    return json(requireItem(store.deals, dealDetailMatch[1]));
  }

  if (dealDetailMatch && method === "PATCH") {
    const deal = requireItem(store.deals, dealDetailMatch[1]);
    updateDeal(store, deal, await readJsonBody(route));
    return json(deal);
  }

  if (dealDetailMatch && method === "DELETE") {
    moveToTrash(store, "DEAL", dealDetailMatch[1]);
    return json(null);
  }

  const dealActivitiesMatch = pathname.match(/^\/api\/deals\/([^/]+)\/activities$/);
  if (dealActivitiesMatch && method === "GET") {
    return jsonConnection(listDealActivities(store, dealActivitiesMatch[1], url));
  }

  if (dealActivitiesMatch && method === "POST") {
    const activity = createManualDealActivity(
      store,
      dealActivitiesMatch[1],
      await readJsonBody(route),
    );
    return json(activity, 201);
  }

  const dealActivityDetailMatch = pathname.match(
    /^\/api\/deals\/([^/]+)\/activities\/([^/]+)$/,
  );
  if (dealActivityDetailMatch && method === "PATCH") {
    return json(
      updateManualDealActivity(
        store,
        dealActivityDetailMatch[1],
        dealActivityDetailMatch[2],
        await readJsonBody(route),
      ),
    );
  }

  const followingActionLogsMatch = pathname.match(
    /^\/api\/deals\/([^/]+)\/following-action-logs$/,
  );
  if (followingActionLogsMatch && method === "GET") {
    return jsonConnection(
      store.followingActionLogs.filter(
        (log) => stringField(log, "dealId") === followingActionLogsMatch[1],
      ),
    );
  }

  if (followingActionLogsMatch && method === "POST") {
    const body = await readJsonBody(route);
    const log = {
      checkComplete: false,
      createdAt: now(),
      dealId: followingActionLogsMatch[1],
      followingAction: stringField(body, "followingAction") ?? "다음 연락",
      id: nextId(store, "following-action"),
      updatedAt: now(),
    };
    store.followingActionLogs.unshift(log);
    updateDealFollowingAction(store, followingActionLogsMatch[1], log);
    return json(log, 201);
  }

  const followingActionLogDetailMatch = pathname.match(
    /^\/api\/deals\/([^/]+)\/following-action-logs\/([^/]+)$/,
  );
  if (followingActionLogDetailMatch && method === "PATCH") {
    const log = requireItem(store.followingActionLogs, followingActionLogDetailMatch[2]);
    const body = await readJsonBody(route);
    patchString(log, body, "followingAction");

    if (isRecord(body) && typeof body.checkComplete === "boolean") {
      log.checkComplete = body.checkComplete;
    }

    log.updatedAt = now();
    updateDealFollowingAction(store, followingActionLogDetailMatch[1], log);
    return json(log);
  }

  if (followingActionLogDetailMatch && method === "DELETE") {
    removeItem(store.followingActionLogs, followingActionLogDetailMatch[2]);
    return json(null);
  }

  if (/^\/api\/deals\/[^/]+\/memo-logs(\/[^/]+)?$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/trash" && method === "GET") {
    return json(paginated(store.trashItems, url));
  }

  const trashDetailMatch = pathname.match(/^\/api\/trash\/([^/]+)\/([^/]+)$/);
  if (trashDetailMatch && method === "GET") {
    return json(requireTrashItem(store.trashItems, trashDetailMatch[1], trashDetailMatch[2]));
  }

  const trashRestoreMatch = pathname.match(/^\/api\/trash\/([^/]+)\/([^/]+)\/restore$/);
  if (trashRestoreMatch && method === "POST") {
    return json({
      restoredAt: now(),
      targetId: trashRestoreMatch[2],
      targetType: trashRestoreMatch[1],
    });
  }

  return json(
    {
      code: "NotFound",
      message: `Unhandled mock API route: ${method} ${pathname}`,
      statusCode: 404,
    },
    404,
  );
}

async function handleManagedOptions(
  store: UserWebApiMockStore,
  route: Route,
  method: string,
  pathname: string,
) {
  const managedOptions: Record<
    string,
    {
      readonly bodyField: string;
      readonly collection: MutableRecord[];
      readonly idPrefix: string;
      readonly labelField: string;
      readonly single: MutableRecord;
    }
  > = {
    "/api/company-fields": {
      bodyField: "field",
      collection: [store.companyField],
      idPrefix: "field",
      labelField: "field",
      single: store.companyField,
    },
    "/api/company-regions": {
      bodyField: "region",
      collection: [store.companyRegion],
      idPrefix: "region",
      labelField: "region",
      single: store.companyRegion,
    },
    "/api/contact-departments": {
      bodyField: "departmentName",
      collection: [store.contactDepartment],
      idPrefix: "department",
      labelField: "departmentName",
      single: store.contactDepartment,
    },
    "/api/contact-job-grades": {
      bodyField: "jobGradeName",
      collection: [store.contactJobGrade],
      idPrefix: "job-grade",
      labelField: "jobGradeName",
      single: store.contactJobGrade,
    },
    "/api/product-categories": {
      bodyField: "categoryName",
      collection: [store.productCategory],
      idPrefix: "category",
      labelField: "categoryName",
      single: store.productCategory,
    },
    "/api/product-statuses": {
      bodyField: "statusName",
      collection: [store.productStatus],
      idPrefix: "status",
      labelField: "statusName",
      single: store.productStatus,
    },
  };
  const option = managedOptions[pathname];

  if (!option) {
    return null;
  }

  if (method === "GET") {
    return jsonList(option.collection);
  }

  if (method === "POST") {
    const body = await readJsonBody(route);
    const label = stringField(body, option.bodyField) ?? stringField(body, option.labelField);
    const record = {
      id: nextId(store, option.idPrefix),
      [option.labelField]: label ?? String(option.single[option.labelField] ?? ""),
    };
    option.collection.unshift(record);
    return json(record, 201);
  }

  return null;
}

function createStore(): UserWebApiMockStore {
  const companyField = { field: "모바일 QA 분야", id: "field-mobile-001" };
  const companyRegion = {
    countryCode: "KR",
    id: "region-mobile-001",
    region: "서울/수도권",
    regionCode: "KR-11",
  };
  const contactDepartment = {
    departmentName: "영업기획본부",
    id: "department-mobile-001",
  };
  const contactJobGrade = { id: "job-grade-mobile-001", jobGradeName: "팀장" };
  const productCategory = { categoryName: "SaaS", id: "category-mobile-001" };
  const productStatus = { id: "status-mobile-001", statusName: "판매중" };
  const company = {
    address: "서울특별시 강남구",
    companyField,
    companyName: MOBILE_LONG_FIXTURE.companyName,
    companyRegion,
    contactCount: 1,
    createdAt: NOW,
    dealCount: 1,
    id: "company-mobile-001",
    updatedAt: NOW,
  };
  const contact = {
    company: { companyName: company.companyName, id: company.id },
    contactDepartment,
    contactJobGrade,
    createdAt: NOW,
    dealCount: 1,
    email: MOBILE_LONG_FIXTURE.email,
    id: "contact-mobile-001",
    mobile: MOBILE_LONG_FIXTURE.phone,
    phoneCountryCode: "KR",
    phoneDisplay: MOBILE_LONG_FIXTURE.phone,
    phoneE164: "+821012345678",
    phoneNationalNumber: "01012345678",
    updatedAt: NOW,
    username: MOBILE_LONG_FIXTURE.contactName,
  };
  const product = {
    createdAt: NOW,
    currencyCode: "KRW",
    dealCount: 1,
    id: "product-mobile-001",
    productCategory,
    productName: `RQA002 모바일 상품 ${MOBILE_LONG_FIXTURE.url}`,
    productPrice: 9_900_000,
    productStatus,
    updatedAt: NOW,
  };
  const deal = createDealRecord({
    companies: [toDealCompany(company)],
    contacts: [toDealContactOption(contact)],
    dealName: "RQA002 모바일 브라우저 긴 딜명",
    id: "deal-mobile-001",
    products: [toDealProduct(product)],
  });
  const secondaryDeal = createDealRecord({
    companies: [toDealCompany(company)],
    contacts: [toDealContactOption(contact)],
    dealName: "RQA002 두 번째 딜",
    id: "deal-mobile-002",
    products: [toDealProduct(product)],
  });
  const followingActionLog = {
    checkComplete: false,
    createdAt: NOW,
    dealId: deal.id,
    followingAction: "다음 연락",
    id: "following-action-mobile-001",
    updatedAt: NOW,
  };
  deal.latestFollowingAction = toLatestFollowingAction(followingActionLog);
  deal.nextFollowingAction = {
    ...toLatestFollowingAction(followingActionLog),
    remainingCount: 1,
  };

  return {
    companyField,
    companyRegion,
    contactDepartment,
    contactJobGrade,
    productCategory,
    productStatus,
    companies: [company],
    contacts: [contact],
    products: [product],
    deals: [deal, secondaryDeal],
    dealActivities: [
      {
        activityType: "CALL",
        body: null,
        createdAt: NOW,
        dealId: deal.id,
        id: "deal-activity-mobile-001",
        isEditable: false,
        linkedRecords: [
          {
            targetId: deal.id,
            targetLabel: deal.dealName,
            targetPath: `/app/deals/${deal.id}`,
            targetType: "DEAL",
          },
        ],
        occurredAt: NOW,
        sourceId: null,
        sourceType: "SYSTEM",
        summary: "고객 니즈 확인 통화를 완료했습니다.",
        title: "초기 상담을 기록했어요.",
        updatedAt: NOW,
      },
    ],
    followingActionLogs: [followingActionLog],
    trashItems: [createTrashItem()],
    counters: {},
  };
}

function createAuthTokenResponse() {
  return {
    accessToken: E2E_ACCESS_TOKEN,
    accessTokenExpiresAt: E2E_ACCESS_TOKEN_EXPIRES_AT,
    refreshToken: null,
    user: createAuthUser(),
  };
}

function createAuthUser() {
  return {
    countryCode: "KR",
    defaultCurrencyCode: "KRW",
    email: "mobile.qa@example.test",
    id: "user-mobile-001",
    lastLoginCountryCode: "KR",
    lastLoginLocale: "ko-KR",
    lastLoginTimeZone: "Asia/Seoul",
    name: "모바일QA사용자",
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
    supabaseUserId: "supabase-mobile-001",
    timeZone: "Asia/Seoul",
  };
}

function createUserProfile(overrides: unknown = {}) {
  const profile = {
    ...createAuthUser(),
    createdAt: NOW,
    lastLoginAt: NOW,
    oauthAccounts: [
      {
        createdAt: NOW,
        id: "oauth-mobile-001",
        provider: "google",
        providerEmail: "mobile.qa@example.test",
      },
    ],
    updatedAt: NOW,
  };

  if (!isRecord(overrides)) {
    return profile;
  }

  return {
    ...profile,
    countryCode: stringField(overrides, "countryCode") ?? profile.countryCode,
    defaultCurrencyCode:
      stringField(overrides, "defaultCurrencyCode") ?? profile.defaultCurrencyCode,
    name: Object.hasOwn(overrides, "name") ? overrides.name : profile.name,
    preferredLocale:
      stringField(overrides, "preferredLocale") ?? profile.preferredLocale,
    timeZone: stringField(overrides, "timeZone") ?? profile.timeZone,
    updatedAt: now(),
  };
}

function createCompany(store: UserWebApiMockStore, body: unknown) {
  return {
    address: stringField(body, "address"),
    companyField:
      findItem([store.companyField], stringField(body, "companyFieldId")) ??
      store.companyField,
    companyName: stringField(body, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
    companyRegion:
      findItem([store.companyRegion], stringField(body, "companyRegionId")) ??
      store.companyRegion,
    contactCount: 0,
    createdAt: now(),
    dealCount: 0,
    id: nextId(store, "company"),
    updatedAt: now(),
  };
}

function updateCompany(store: UserWebApiMockStore, company: MutableRecord, body: unknown) {
  if (isApiErrorShape(company)) {
    return;
  }

  const nextName = stringField(body, "companyName");
  patchString(company, body, "address");
  patchString(company, body, "companyName");
  company.companyField =
    findItem([store.companyField], stringField(body, "companyFieldId")) ??
    company.companyField;
  company.companyRegion =
    findItem([store.companyRegion], stringField(body, "companyRegionId")) ??
    company.companyRegion;
  company.updatedAt = now();
  updateCompanyReferences(store, String(company.id), nextName);
}

function createContact(store: UserWebApiMockStore, body: unknown) {
  const company =
    findItem(store.companies, stringField(body, "companyId")) ?? store.companies[0];

  return {
    company: {
      companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
      id: stringField(company, "id") ?? "company-mobile-001",
    },
    contactDepartment:
      findItem([store.contactDepartment], stringField(body, "contactDepartmentId")) ??
      store.contactDepartment,
    contactJobGrade:
      findItem([store.contactJobGrade], stringField(body, "contactJobGradeId")) ??
      store.contactJobGrade,
    createdAt: now(),
    dealCount: 0,
    email: stringField(body, "email") ?? MOBILE_LONG_FIXTURE.email,
    id: nextId(store, "contact"),
    mobile: stringField(body, "mobile") ?? MOBILE_LONG_FIXTURE.phone,
    phoneCountryCode: stringField(body, "phoneCountryCode") ?? "KR",
    phoneDisplay: stringField(body, "mobile") ?? MOBILE_LONG_FIXTURE.phone,
    phoneE164: stringField(body, "phoneE164"),
    phoneNationalNumber: stringField(body, "phoneNationalNumber"),
    updatedAt: now(),
    username: stringField(body, "username") ?? MOBILE_LONG_FIXTURE.contactName,
  };
}

function updateContact(store: UserWebApiMockStore, contact: MutableRecord, body: unknown) {
  if (isApiErrorShape(contact)) {
    return;
  }

  const company =
    findItem(store.companies, stringField(body, "companyId")) ??
    nestedRecord(contact.company);

  contact.company = {
    companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
    id: stringField(company, "id") ?? "company-mobile-001",
  };
  contact.contactDepartment =
    findItem([store.contactDepartment], stringField(body, "contactDepartmentId")) ??
    contact.contactDepartment;
  contact.contactJobGrade =
    findItem([store.contactJobGrade], stringField(body, "contactJobGradeId")) ??
    contact.contactJobGrade;
  patchString(contact, body, "email");
  patchString(contact, body, "mobile");
  patchString(contact, body, "phoneCountryCode");
  patchString(contact, body, "phoneE164");
  patchString(contact, body, "phoneNationalNumber");
  patchString(contact, body, "username");
  contact.phoneDisplay = stringField(contact, "mobile") ?? "";
  contact.updatedAt = now();
}

function createProduct(store: UserWebApiMockStore, body: unknown) {
  return {
    createdAt: now(),
    currencyCode: stringField(body, "currencyCode") ?? "KRW",
    dealCount: 0,
    id: nextId(store, "product"),
    productCategory:
      findItem([store.productCategory], stringField(body, "productCategoryId")) ??
      store.productCategory,
    productName: stringField(body, "productName") ?? `RQA002 상품 ${MOBILE_LONG_FIXTURE.url}`,
    productPrice: numberField(body, "productPrice") ?? 0,
    productStatus:
      findItem([store.productStatus], stringField(body, "productStatusId")) ??
      store.productStatus,
    updatedAt: now(),
  };
}

function updateProduct(store: UserWebApiMockStore, product: MutableRecord, body: unknown) {
  if (isApiErrorShape(product)) {
    return;
  }

  patchString(product, body, "currencyCode");
  patchString(product, body, "productName");

  const price = numberField(body, "productPrice");
  if (price !== null) {
    product.productPrice = price;
  }

  product.productCategory =
    findItem([store.productCategory], stringField(body, "productCategoryId")) ??
    product.productCategory;
  product.productStatus =
    findItem([store.productStatus], stringField(body, "productStatusId")) ??
    product.productStatus;
  product.updatedAt = now();
}

function createDeal(store: UserWebApiMockStore, body: unknown) {
  const companies = findSelectedItems(
    store.companies,
    stringArrayField(body, "companyIds"),
  ).map(toDealCompany);
  const contacts = findSelectedItems(
    store.contacts,
    stringArrayField(body, "contactIds"),
  ).map(toDealContactOption);
  const products = findSelectedItems(
    store.products,
    stringArrayField(body, "productIds"),
  ).map(toDealProduct);
  const followingAction = stringField(body, "followingAction") ?? "다음 연락";
  const deal = createDealRecord({
    companies,
    contacts,
    dealCost: numberField(body, "dealCost") ?? 0,
    dealName: stringField(body, "dealName") ?? "새 딜",
    dealStatus: stringField(body, "dealStatus") ?? "INITIAL_CONTACT",
    expectedEndDate: stringField(body, "expectedEndDate") ?? "2026-08-31",
    id: nextId(store, "deal"),
    products,
  });
  const log = {
    checkComplete: false,
    createdAt: now(),
    dealId: deal.id,
    followingAction,
    id: nextId(store, "following-action"),
    updatedAt: now(),
  };

  store.followingActionLogs.unshift(log);
  updateDealFollowingAction(store, String(deal.id), log, deal);
  return deal;
}

function updateDeal(store: UserWebApiMockStore, deal: MutableRecord, body: unknown) {
  if (isApiErrorShape(deal)) {
    return;
  }

  patchString(deal, body, "currencyCode");
  patchString(deal, body, "dealName");
  patchString(deal, body, "dealStatus");
  patchString(deal, body, "expectedEndDate");

  const cost = numberField(body, "dealCost");
  if (cost !== null) {
    deal.dealCost = cost;
  }

  if (isRecord(body) && Array.isArray(body.companyIds)) {
    deal.companies = findSelectedItems(store.companies, stringArrayField(body, "companyIds")).map(
      toDealCompany,
    );
  }

  if (isRecord(body) && Array.isArray(body.contactIds)) {
    deal.contacts = findSelectedItems(store.contacts, stringArrayField(body, "contactIds")).map(
      toDealContactOption,
    );
  }

  if (isRecord(body) && Array.isArray(body.productIds)) {
    deal.products = findSelectedItems(store.products, stringArrayField(body, "productIds")).map(
      toDealProduct,
    );
  }

  deal.dealStatusLabel =
    DEAL_STATUS_LABEL[(stringField(deal, "dealStatus") as DealStatus) ?? "INITIAL_CONTACT"];
  deal.updatedAt = now();
}

function createDealRecord(input: {
  readonly companies: MutableRecord[];
  readonly contacts: MutableRecord[];
  readonly dealCost?: number;
  readonly dealName: string;
  readonly dealStatus?: string;
  readonly expectedEndDate?: string;
  readonly id: string;
  readonly products: MutableRecord[];
}) {
  const dealStatus = input.dealStatus ?? "INITIAL_CONTACT";

  return {
    companies: input.companies,
    contacts: input.contacts,
    createdAt: NOW,
    currencyCode: "KRW",
    dealCost: input.dealCost ?? 12_500_000,
    dealName: input.dealName,
    dealStatus,
    dealStatusLabel: DEAL_STATUS_LABEL[(dealStatus as DealStatus) ?? "INITIAL_CONTACT"],
    expectedEndDate: input.expectedEndDate ?? "2026-08-31",
    id: input.id,
    latestActivity: null,
    latestFollowingAction: null,
    nextFollowingAction: null,
    products: input.products,
    updatedAt: NOW,
  };
}

function createManualDealActivity(
  store: UserWebApiMockStore,
  dealId: string | undefined,
  body: unknown,
) {
  const deal = requireItem(store.deals, dealId);
  const activity = {
    activityType: stringField(body, "activityType") ?? "NOTE",
    body: stringField(body, "body"),
    createdAt: now(),
    dealId,
    id: nextId(store, "deal-activity"),
    isEditable: true,
    linkedRecords: [
      {
        targetId: dealId,
        targetLabel: stringField(deal, "dealName"),
        targetPath: `/app/deals/${dealId}`,
        targetType: "DEAL",
      },
    ],
    occurredAt: stringField(body, "occurredAt") ?? now(),
    sourceId: null,
    sourceType: "USER",
    summary: stringField(body, "body"),
    title: stringField(body, "title") ?? "딜 활동",
    updatedAt: now(),
  };

  store.dealActivities.unshift(activity);
  return activity;
}

function updateManualDealActivity(
  store: UserWebApiMockStore,
  dealId: string | undefined,
  activityId: string | undefined,
  body: unknown,
) {
  const activity = requireItem(
    store.dealActivities.filter((candidate) => stringField(candidate, "dealId") === dealId),
    activityId,
  );

  if (isApiErrorShape(activity)) {
    return activity;
  }

  patchString(activity, body, "activityType");
  patchString(activity, body, "body");
  patchString(activity, body, "occurredAt");
  patchString(activity, body, "title");
  activity.summary = stringField(activity, "body");
  activity.updatedAt = now();
  return activity;
}

function listDealActivities(store: UserWebApiMockStore, dealId: string | undefined, url: URL) {
  return store.dealActivities
    .filter((activity) => stringField(activity, "dealId") === dealId)
    .filter((activity) => {
      const type = url.searchParams.get("type");
      return !type || activity.activityType === type;
    })
    .sort(compareDealActivityDesc);
}

function createTrashItem() {
  return {
    canRestore: true,
    deletedAt: NOW,
    hasPrivateMemo: false,
    parentId: null,
    parentTitle: null,
    parentType: "COMPANY",
    permanentDeleteAt: NEXT_WEEK,
    privateMemoIncluded: false,
    restoreWindow: "ACTIVE",
    targetId: "trash-company-mobile-001",
    targetType: "COMPANY",
    title: `삭제된 ${MOBILE_LONG_FIXTURE.companyName}`,
    trashExpiresAt: NEXT_WEEK,
  };
}

function createSearchResponse(store: UserWebApiMockStore, url: URL) {
  const query = (url.searchParams.get("q") ?? "").toLowerCase();
  const groups = [
    {
      items: store.companies.map((company) => ({
        subtitle: "회사",
        targetId: stringField(company, "id"),
        targetPath: `/app/companies/${stringField(company, "id")}`,
        title: stringField(company, "companyName"),
      })),
      type: "COMPANY",
    },
    {
      items: store.contacts.map((contact) => ({
        subtitle: stringField(nestedRecord(contact.company), "companyName"),
        targetId: stringField(contact, "id"),
        targetPath: `/app/contacts/${stringField(contact, "id")}`,
        title: stringField(contact, "username"),
      })),
      type: "CONTACT",
    },
    {
      items: store.products.map((product) => ({
        subtitle: "제품",
        targetId: stringField(product, "id"),
        targetPath: `/app/products/${stringField(product, "id")}`,
        title: stringField(product, "productName"),
      })),
      type: "PRODUCT",
    },
    {
      items: store.deals.map((deal) => ({
        subtitle: "딜",
        targetId: stringField(deal, "id"),
        targetPath: `/app/deals/${stringField(deal, "id")}`,
        title: stringField(deal, "dealName"),
      })),
      type: "DEAL",
    },
  ].map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      String(item.title ?? "").toLowerCase().includes(query),
    ),
  }));

  return { groups: groups.filter((group) => group.items.length > 0) };
}

function toDealCompany(company: MutableRecord | undefined) {
  return {
    companyField: nestedRecord(company?.companyField),
    companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
    companyRegion: nestedRecord(company?.companyRegion),
    id: stringField(company, "id") ?? "company-mobile-001",
    isDeleted: false,
  };
}

function toDealContactOption(contact: MutableRecord | undefined) {
  const company = nestedRecord(contact?.company);

  return {
    company: {
      companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
      id: stringField(company, "id") ?? "company-mobile-001",
      isDeleted: false,
    },
    companyId: stringField(company, "id") ?? "company-mobile-001",
    contactDepartment: nestedRecord(contact?.contactDepartment),
    contactJobGrade: nestedRecord(contact?.contactJobGrade),
    email: stringField(contact, "email") ?? MOBILE_LONG_FIXTURE.email,
    id: stringField(contact, "id") ?? "contact-mobile-001",
    isDeleted: false,
    label: stringField(contact, "username") ?? MOBILE_LONG_FIXTURE.contactName,
    mobile: stringField(contact, "mobile") ?? MOBILE_LONG_FIXTURE.phone,
    username: stringField(contact, "username") ?? MOBILE_LONG_FIXTURE.contactName,
  };
}

function toDealProduct(product: MutableRecord | undefined) {
  return {
    currencyCode: stringField(product, "currencyCode") ?? "KRW",
    id: stringField(product, "id") ?? "product-mobile-001",
    isDeleted: false,
    productCategory: nestedRecord(product?.productCategory),
    productName: stringField(product, "productName") ?? "RQA002 모바일 상품",
    productPrice: numberField(product, "productPrice") ?? 9_900_000,
    productStatus: nestedRecord(product?.productStatus),
  };
}

function toDealListItem(store: UserWebApiMockStore, deal: MutableRecord) {
  const dealId = stringField(deal, "id") ?? "deal-mobile-001";

  return {
    ...deal,
    latestActivity: toDealLatestActivitySummary(store, dealId),
    products: Array.isArray(deal.products)
      ? deal.products.filter(isRecord).map(toDealProductSummary)
      : [],
  };
}

function toDealProductSummary(product: MutableRecord) {
  return {
    id: stringField(product, "id") ?? "product-mobile-001",
    isDeleted: product.isDeleted === true,
    productCategory: nullableNestedRecord(product.productCategory),
    productName: stringField(product, "productName") ?? "RQA002 모바일 상품",
    productStatus: nullableNestedRecord(product.productStatus),
  };
}

function toDealLatestActivitySummary(store: UserWebApiMockStore, dealId: string) {
  const latestActivity = store.dealActivities
    .filter((activity) => stringField(activity, "dealId") === dealId)
    .sort(compareDealActivityDesc)[0];

  if (!latestActivity) {
    return null;
  }

  return {
    activityType: stringField(latestActivity, "activityType") ?? "NOTE",
    id: stringField(latestActivity, "id") ?? "deal-activity-mobile-001",
    occurredAt: stringField(latestActivity, "occurredAt") ?? NOW,
    summary: stringField(latestActivity, "summary"),
    title: stringField(latestActivity, "title") ?? "딜 활동",
  };
}

function toLatestFollowingAction(log: MutableRecord) {
  return {
    checkComplete: Boolean(log.checkComplete),
    createdAt: stringField(log, "createdAt") ?? NOW,
    followingAction: stringField(log, "followingAction") ?? "다음 연락",
    id: stringField(log, "id") ?? "following-action-mobile-001",
  };
}

function updateDealFollowingAction(
  store: UserWebApiMockStore,
  dealId: string | undefined,
  log: MutableRecord,
  directDeal?: MutableRecord,
) {
  const deal = directDeal ?? store.deals.find((item) => item.id === dealId);

  if (!deal) {
    return;
  }

  const latest = toLatestFollowingAction(log);
  deal.latestFollowingAction = latest;
  deal.nextFollowingAction = {
    ...latest,
    remainingCount: store.followingActionLogs.filter(
      (item) => item.dealId === dealId && item.checkComplete !== true,
    ).length,
  };
}

function compareDealActivityDesc(first: MutableRecord, second: MutableRecord) {
  return (
    Date.parse(stringField(second, "occurredAt") ?? NOW) -
    Date.parse(stringField(first, "occurredAt") ?? NOW)
  );
}

function updateCompanyReferences(
  store: UserWebApiMockStore,
  companyId: string,
  companyName: string | null,
) {
  if (!companyName) {
    return;
  }

  for (const contact of store.contacts) {
    if (isRecord(contact.company) && contact.company.id === companyId) {
      contact.company.companyName = companyName;
    }
  }

  for (const deal of store.deals) {
    updateNestedArrayLabel(deal.companies, companyId, "companyName", companyName);
    updateNestedContactCompanyLabel(deal.contacts, companyId, companyName);
  }
}

function updateNestedArrayLabel(value: unknown, id: string, field: string, label: string) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const item of value) {
    if (isRecord(item) && item.id === id) {
      item[field] = label;
    }
  }
}

function updateNestedContactCompanyLabel(value: unknown, companyId: string, companyName: string) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const item of value) {
    if (isRecord(item) && isRecord(item.company) && item.company.id === companyId) {
      item.company.companyName = companyName;
    }
  }
}

function incrementRelatedDealCounts(store: UserWebApiMockStore, deal: MutableRecord) {
  for (const company of toMutableRecords(deal.companies)) {
    incrementCount(store.companies, stringField(company, "id"), "dealCount");
  }

  for (const contact of toMutableRecords(deal.contacts)) {
    incrementCount(store.contacts, stringField(contact, "id"), "dealCount");
  }

  for (const product of toMutableRecords(deal.products)) {
    incrementCount(store.products, stringField(product, "id"), "dealCount");
  }
}

function incrementCount(items: MutableRecord[], id: string | null, field: string) {
  const item = findItem(items, id);

  if (!item) {
    return;
  }

  item[field] = (numberField(item, field) ?? 0) + 1;
}

function moveToTrash(store: UserWebApiMockStore, targetType: string, targetId: string | undefined) {
  const sourceMap: Record<string, MutableRecord[]> = {
    COMPANY: store.companies,
    CONTACT: store.contacts,
    DEAL: store.deals,
    PRODUCT: store.products,
  };
  const source = sourceMap[targetType];
  const item = source ? removeItem(source, targetId) : null;

  if (!item) {
    return;
  }

  store.trashItems.unshift({
    canRestore: true,
    deletedAt: now(),
    hasPrivateMemo: false,
    parentId: null,
    parentTitle: null,
    parentType: targetType,
    permanentDeleteAt: NEXT_WEEK,
    privateMemoIncluded: false,
    restoreWindow: "ACTIVE",
    targetId,
    targetType,
    title:
      stringField(item, "companyName") ??
      stringField(item, "username") ??
      stringField(item, "productName") ??
      stringField(item, "dealName") ??
      targetType,
    trashExpiresAt: NEXT_WEEK,
  });
}

function paginated<TItem>(items: readonly TItem[], url: URL) {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "15");
  const offset = Math.max(page - 1, 0) * pageSize;

  return {
    items: items.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

function jsonList(items: readonly unknown[]) {
  return json({ items: [...items] });
}

function jsonConnection(items: readonly unknown[]) {
  return json({ hasNext: false, items: [...items], nextCursor: null });
}

function findSelectedItems(items: readonly MutableRecord[], ids: readonly string[]) {
  if (ids.length === 0) {
    return [];
  }

  return ids.map((id) => findItem(items, id)).filter(isRecord);
}

function findItem(items: readonly MutableRecord[], id: string | null | undefined) {
  return items.find((candidate) => candidate.id === id) ?? null;
}

function requireItem(items: readonly MutableRecord[], id: string | undefined) {
  const item = findItem(items, id);

  if (!item) {
    return {
      code: "NotFound",
      message: "Not found",
      statusCode: 404,
    };
  }

  return item;
}

function removeItem(items: MutableRecord[], id: string | undefined) {
  const index = items.findIndex((candidate) => candidate.id === id);

  if (index < 0) {
    return null;
  }

  return items.splice(index, 1)[0] ?? null;
}

function requireTrashItem(
  items: readonly MutableRecord[],
  targetType: string | undefined,
  targetId: string | undefined,
) {
  const item = items.find(
    (candidate) => candidate.targetType === targetType && candidate.targetId === targetId,
  );

  if (!item) {
    return {
      code: "NotFound",
      message: "Not found",
      statusCode: 404,
    };
  }

  return item;
}

function isApiErrorShape(value: unknown) {
  return isRecord(value) && typeof value.statusCode === "number";
}

function hasNestedIdArray(value: unknown, id: string | undefined) {
  return Array.isArray(value) && value.some((item) => nestedId(item) === id);
}

function nestedId(value: unknown) {
  return stringField(value, "id");
}

function nestedRecord(value: unknown): MutableRecord {
  return isRecord(value) ? value : {};
}

function nullableNestedRecord(value: unknown): MutableRecord | null {
  return isRecord(value) ? value : null;
}

function toMutableRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function patchString(target: MutableRecord, body: unknown, field: string) {
  const value = stringField(body, field);

  if (value !== null) {
    target[field] = value;
  }
}

function isPublicApiRequest(pathname: string) {
  return pathname === "/api/auth/providers";
}

function json(body: unknown, status = 200): MockApiResponse {
  return { body, status };
}

async function fulfill(route: Route, response: MockApiResponse) {
  if (typeof response.body === "string" && response.contentType) {
    await route.fulfill({
      body: response.body,
      contentType: response.contentType,
      headers: {
        ...corsHeaders(),
        ...response.headers,
      },
      status: response.status ?? 200,
    });
    return;
  }

  await fulfillJson(route, response.body, response.status ?? 200, response.headers);
}

async function fulfillJson(
  route: Route,
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  await route.fulfill({
    body: JSON.stringify(body),
    contentType: "application/json",
    headers: {
      ...corsHeaders(),
      ...headers,
    },
    status,
  });
}

function corsHeaders() {
  return {
    "access-control-allow-headers": "authorization,content-type,idempotency-key",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "content-disposition",
  };
}

async function readJsonBody(route: Route) {
  try {
    return route.request().postDataJSON() as unknown;
  } catch {
    return {};
  }
}

async function delayApiResponse(
  delayMs: number | ApiDelayResolver | undefined,
  request: ApiRequestRecord,
) {
  const resolvedDelayMs =
    typeof delayMs === "function" ? delayMs(request) : delayMs ?? 0;

  if (resolvedDelayMs <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, resolvedDelayMs);
  });
}

function stringField(value: unknown, field: string) {
  if (!isRecord(value)) {
    return null;
  }

  const fieldValue = value[field];
  return typeof fieldValue === "string" ? fieldValue : null;
}

function stringArrayField(value: unknown, field: string) {
  if (!isRecord(value) || !Array.isArray(value[field])) {
    return [];
  }

  return value[field].filter((item): item is string => typeof item === "string");
}

function numberField(value: unknown, field: string) {
  if (!isRecord(value)) {
    return null;
  }

  const fieldValue = value[field];
  return typeof fieldValue === "number" ? fieldValue : null;
}

function isRecord(value: unknown): value is MutableRecord {
  return typeof value === "object" && value !== null;
}

function nextId(store: UserWebApiMockStore, prefix: string) {
  store.counters[prefix] = (store.counters[prefix] ?? 0) + 1;
  return `${prefix}-e2e-${String(store.counters[prefix]).padStart(3, "0")}`;
}

function now() {
  return new Date(NOW).toISOString();
}

type DealStatus = (typeof DEAL_STATUS_LIST)[number];

const DEAL_STATUS_LABEL = {
  INITIAL_CONTACT: "초기 접촉",
  LOST: "실패",
  NEEDS_CHECK: "니즈 확인",
  NEGOTIATION: "협상",
  PROPOSAL_QUOTE: "제안/견적",
  WON: "성사",
} as const;

const DEAL_STATUS_LIST = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
