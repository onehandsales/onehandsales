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
  readonly schedules: MutableRecord[];
  readonly meetingNotes: MutableRecord[];
  readonly businessCardScans: MutableRecord[];
  readonly importJobs: MutableRecord[];
  readonly importTemplates: MutableRecord[];
  readonly importUserLogs: MutableRecord[];
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
      protectedRequests.push({
        authorization,
        method,
        pathname: url.pathname,
      });
      await fulfillJson(route, {
        code: "Unauthorized",
        message: "Authentication required",
        statusCode: 401,
      }, 401);
      return;
    }

    await delayApiResponse(options.delayMs, { authorization, method, pathname: url.pathname });
    const response = await handleApiRequest(store, route, method, url);
    await fulfill(route, response);
  });

  return {
    protectedRequestsWithoutAuthorization() {
      return protectedRequests.filter((request) => request.authorization === null);
    },
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
      providers: [{ enabled: true, label: "Google", provider: "google" }],
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

  if (pathname === "/api/users/me/profile") {
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

  if (pathname === "/api/users/me/settings" && method === "GET") {
    return json(createNotificationSettings());
  }

  if (pathname === "/api/notifications/settings") {
    return json(createNotificationSettings());
  }

  if (pathname === "/api/notifications/browser-push/public-key" && method === "GET") {
    return json({ publicKey: "mock-browser-push-public-key" });
  }

  if (pathname === "/api/notifications" && method === "GET") {
    return json({ items: [], page: 1, pageSize: 20, totalCount: 0, unreadCount: 0 });
  }

  if (pathname === "/api/search" && method === "GET") {
    return json(createSearchResponse(store));
  }

  if (pathname === "/api/company-fields") {
    return jsonList([store.companyField]);
  }

  if (pathname === "/api/company-regions") {
    return jsonList([store.companyRegion]);
  }

  if (pathname === "/api/contact-departments") {
    return jsonList([store.contactDepartment]);
  }

  if (pathname === "/api/contact-job-grades") {
    return jsonList([store.contactJobGrade]);
  }

  if (pathname === "/api/product-categories") {
    return jsonList([store.productCategory]);
  }

  if (pathname === "/api/product-statuses") {
    return jsonList([store.productStatus]);
  }

  if (pathname === "/api/contacts/company-options" && method === "GET") {
    return jsonList(
      store.companies.map((company) => ({
        companyName: company.companyName,
        id: company.id,
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

  if (pathname === "/api/schedules/deal-options" && method === "GET") {
    return jsonList(
      store.deals.map((deal) => ({
        createdAt: deal.createdAt,
        dealName: deal.dealName,
        id: deal.id,
      })),
    );
  }

  if (pathname === "/api/meeting-notes/filter-companies" && method === "GET") {
    return jsonList(
      store.companies.map((company) => ({
        companyName: company.companyName,
        createdAt: company.createdAt,
        id: company.id,
      })),
    );
  }

  if (pathname === "/api/meeting-notes/filter-contacts" && method === "GET") {
    return jsonList(
      store.contacts.map((contact) => ({
        companyId: nestedId(contact.company),
        contactUsername: contact.username,
        createdAt: contact.createdAt,
        id: contact.id,
      })),
    );
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

  if (pathname === "/api/companies" && method === "GET") {
    return json(paginated(store.companies, url));
  }

  if (pathname === "/api/companies" && method === "POST") {
    const body = await readJsonBody(route);
    const companyName = stringField(body, "companyName") ?? MOBILE_LONG_FIXTURE.companyName;
    const company = {
      companyField: store.companyField,
      companyName,
      companyRegion: store.companyRegion,
      contactCount: 0,
      createdAt: now(),
      dealCount: 0,
      id: nextId(store, "company"),
      updatedAt: now(),
    };
    store.companies.unshift(company);
    return json(company, 201);
  }

  const companyDetailMatch = pathname.match(/^\/api\/companies\/([^/]+)$/);
  if (companyDetailMatch && method === "PATCH") {
    const company = requireItem(store.companies, companyDetailMatch[1]);
    const body = await readJsonBody(route);

    if (isRecord(company) && !isApiErrorShape(company)) {
      const nextName = stringField(body, "companyName");

      if (nextName) {
        company.companyName = nextName;
      }

      company.updatedAt = now();
      updateCompanyReferences(store, String(company.id), nextName);
    }

    return json(company);
  }

  if (companyDetailMatch && method === "GET") {
    return json(requireItem(store.companies, companyDetailMatch[1]));
  }

  const companyContactsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/contacts$/);
  if (companyContactsMatch && method === "GET") {
    return jsonList(store.contacts.filter((contact) => nestedId(contact.company) === companyContactsMatch[1]));
  }

  const companyDealsMatch = pathname.match(/^\/api\/companies\/([^/]+)\/deals$/);
  if (companyDealsMatch && method === "GET") {
    return jsonList(store.deals.filter((deal) => hasNestedIdArray(deal.companies, companyDealsMatch[1])));
  }

  if (/^\/api\/companies\/[^/]+\/(memo-logs|private-memo-logs)$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/contacts" && method === "GET") {
    return json(paginated(store.contacts, url));
  }

  if (pathname === "/api/contacts" && method === "POST") {
    const body = await readJsonBody(route);
    const contact = createContact(store, body);
    store.contacts.unshift(contact);
    return json(contact, 201);
  }

  const contactDetailMatch = pathname.match(/^\/api\/contacts\/([^/]+)$/);
  if (contactDetailMatch && method === "GET") {
    return json(requireItem(store.contacts, contactDetailMatch[1]));
  }

  const contactDealsMatch = pathname.match(/^\/api\/contacts\/([^/]+)\/deals$/);
  if (contactDealsMatch && method === "GET") {
    return jsonList(store.deals.filter((deal) => hasNestedIdArray(deal.contacts, contactDealsMatch[1])));
  }

  if (/^\/api\/contacts\/[^/]+\/(memo-logs|private-memo-logs)$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/products" && method === "GET") {
    return json(paginated(store.products, url));
  }

  if (pathname === "/api/products" && method === "POST") {
    const body = await readJsonBody(route);
    const product = createProduct(store, body);
    store.products.unshift(product);
    return json(product, 201);
  }

  const productDetailMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productDetailMatch && method === "GET") {
    return json(requireItem(store.products, productDetailMatch[1]));
  }

  const productDealsMatch = pathname.match(/^\/api\/products\/([^/]+)\/deals$/);
  if (productDealsMatch && method === "GET") {
    return jsonList(store.deals.filter((deal) => hasNestedIdArray(deal.products, productDealsMatch[1])));
  }

  if (/^\/api\/products\/[^/]+\/(memo-logs|private-memo-logs)$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/deals" && method === "GET") {
    return json(paginated(store.deals.map(toDealListItem), url));
  }

  if (pathname === "/api/deals" && method === "POST") {
    const body = await readJsonBody(route);
    const deal = createDeal(store, body);
    store.deals.unshift(deal);
    return json(deal, 201);
  }

  const dealDetailMatch = pathname.match(/^\/api\/deals\/([^/]+)$/);
  if (dealDetailMatch && method === "GET") {
    return json(requireItem(store.deals, dealDetailMatch[1]));
  }

  if (/^\/api\/deals\/[^/]+\/following-action-logs$/.test(pathname)) {
    return jsonConnection([
      {
        checkComplete: false,
        createdAt: NOW,
        followingAction: `${MOBILE_LONG_FIXTURE.url} 다음 연락`,
        id: "following-action-mobile-001",
        updatedAt: NOW,
      },
    ]);
  }

  if (/^\/api\/deals\/[^/]+\/memo-logs$/.test(pathname)) {
    return jsonConnection([]);
  }

  if (pathname === "/api/schedules" && method === "GET") {
    return jsonList(store.schedules);
  }

  if (pathname === "/api/schedules" && method === "POST") {
    const body = await readJsonBody(route);
    const schedule = createSchedule(store, body);
    store.schedules.unshift(schedule);
    return json(schedule, 201);
  }

  const scheduleDetailMatch = pathname.match(/^\/api\/schedules\/([^/]+)$/);
  if (scheduleDetailMatch && method === "GET") {
    return json(requireItem(store.schedules, scheduleDetailMatch[1]));
  }

  if (pathname === "/api/meeting-notes" && method === "GET") {
    return json(paginated(store.meetingNotes.map(toMeetingNoteListItem), url));
  }

  if (pathname === "/api/meeting-notes" && method === "POST") {
    const body = await readJsonBody(route);
    const meetingNote = createMeetingNote(store, body);
    store.meetingNotes.unshift(meetingNote);
    return json(meetingNote, 201);
  }

  const meetingNoteDealsMatch = pathname.match(/^\/api\/meeting-notes\/([^/]+)\/deals$/);
  if (meetingNoteDealsMatch && method === "POST") {
    return json(requireItem(store.meetingNotes, meetingNoteDealsMatch[1]));
  }

  const meetingNoteDetailMatch = pathname.match(/^\/api\/meeting-notes\/([^/]+)$/);
  if (meetingNoteDetailMatch && method === "GET") {
    return json(requireItem(store.meetingNotes, meetingNoteDetailMatch[1]));
  }

  if (pathname === "/api/business-card-scans" && method === "GET") {
    return json(paginated(store.businessCardScans, url));
  }

  if (pathname === "/api/business-card-scans" && method === "POST") {
    const scan = {
      ...store.businessCardScans[0],
      id: nextId(store, "business-card"),
      status: "OCR_SUCCESS",
    };
    store.businessCardScans.unshift(scan);
    return json(scan, 201);
  }

  const businessCardConfirmMatch = pathname.match(/^\/api\/business-card-scans\/([^/]+)\/confirm$/);
  if (businessCardConfirmMatch && method === "POST") {
    const scan = requireItem(store.businessCardScans, businessCardConfirmMatch[1]);
    return json({
      company: {
        companyName: MOBILE_LONG_FIXTURE.companyName,
        id: "company-mobile-001",
        resolution: "EXISTING",
      },
      contact: {
        id: "contact-mobile-001",
        resolution: "EXISTING",
        username: MOBILE_LONG_FIXTURE.contactName,
      },
      scanLog: {
        ...scan,
        status: "CONFIRMED",
      },
    });
  }

  const businessCardDetailMatch = pathname.match(/^\/api\/business-card-scans\/([^/]+)$/);
  if (businessCardDetailMatch && method === "GET") {
    return json(requireItem(store.businessCardScans, businessCardDetailMatch[1]));
  }

  if (pathname === "/api/import-templates/active" && method === "GET") {
    return jsonList(store.importTemplates);
  }

  if (pathname.startsWith("/api/import-templates/") && pathname.endsWith("/download")) {
    return text("mock template", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", {
      "content-disposition": "attachment; filename=mock-template.xlsx",
    });
  }

  if (pathname === "/api/import-user-logs" && method === "GET") {
    return json(paginated(store.importUserLogs, url));
  }

  const importUserLogDetailMatch = pathname.match(/^\/api\/import-user-logs\/([^/]+)$/);
  if (importUserLogDetailMatch && method === "GET") {
    return json(requireItem(store.importUserLogs, importUserLogDetailMatch[1]));
  }

  if (pathname === "/api/imports" && method === "POST") {
    const detail = createImportJobDetail(nextId(store, "import-job"), "UPLOADED");
    store.importJobs.unshift(detail);
    return json(detail, 201);
  }

  if (pathname === "/api/imports/active" && method === "GET") {
    return json({
      items: store.importJobs
        .map((detail) => nestedRecord(detail.job))
        .filter((job) =>
          [
            "UPLOADED",
            "MAPPED",
            "NEEDS_REVIEW",
            "READY_TO_CONFIRM",
            "CONFIRMING",
          ].includes(stringField(job, "status") ?? "")
        ),
    });
  }

  const importJobMatch = pathname.match(/^\/api\/imports\/([^/]+)$/);
  if (importJobMatch && method === "GET") {
    const detail = requireImportJobDetail(store, importJobMatch[1]);
    return importJobResponse(detail);
  }

  const importJobMapMatch = pathname.match(/^\/api\/imports\/([^/]+)\/map$/);
  if (importJobMapMatch && method === "POST") {
    const detail = requireImportJobDetail(store, importJobMapMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    detail.mapping = { companyName: "companyName", email: "email" };
    updateImportJobDetail(detail, { mappingSource: "AI" });
    recalculateImportJobSummary(detail);
    return json(detail);
  }

  const importJobMappingMatch = pathname.match(/^\/api\/imports\/([^/]+)\/mapping$/);
  if (importJobMappingMatch && method === "PATCH") {
    const detail = requireImportJobDetail(store, importJobMappingMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    const body = await readJsonBody(route);
    const mapping = nestedRecord(body.mapping);
    detail.mapping = {
      companyName: stringField(mapping, "companyName") ?? "companyName",
      email: stringField(mapping, "email") ?? "email",
    };
    updateImportJobDetail(detail, { status: "READY_TO_CONFIRM" });
    return json(detail);
  }

  const importJobRowsMatch = pathname.match(/^\/api\/imports\/([^/]+)\/rows$/);
  if (importJobRowsMatch && method === "PATCH") {
    const detail = requireImportJobDetail(store, importJobRowsMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    const body = await readJsonBody(route);
    const rows = Array.isArray(body.rows) ? body.rows.filter(isRecord) : [];

    detail.rows = (Array.isArray(detail.rows) ? detail.rows : []).map((row) => {
      if (!isRecord(row)) {
        return row;
      }

      const rowId = stringField(row, "rowId") ?? stringField(row, "id");
      const update =
        rowId === null
          ? undefined
          : rows.find((item) => {
              const updateRowId =
                stringField(item, "rowId") ?? stringField(item, "id");
              return updateRowId === rowId;
            });

      if (!update) {
        return row;
      }

      const data = nestedRecord(update.data);
      const companyName = stringField(data, "companyName") ?? "";
      const errors =
        companyName.trim().length === 0
          ? [
              {
                code: "InvalidImportField",
                fieldKey: "companyName",
                message: "회사명을 입력해 주세요.",
              },
            ]
          : [];

      return {
        ...row,
        data: {
          companyName,
          email: stringField(data, "email") ?? MOBILE_LONG_FIXTURE.email,
        },
        errors,
        status:
          update.excluded === true
            ? "EXCLUDED"
            : errors.length > 0
              ? "INVALID"
              : "VALID",
      };
    });
    recalculateImportJobSummary(detail);
    return json(detail);
  }

  const importJobValidateMatch = pathname.match(/^\/api\/imports\/([^/]+)\/validate$/);
  if (importJobValidateMatch && method === "POST") {
    const detail = requireImportJobDetail(store, importJobValidateMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    recalculateImportJobSummary(detail);
    return json(detail);
  }

  const importJobConfirmMatch = pathname.match(/^\/api\/imports\/([^/]+)\/confirm$/);
  if (importJobConfirmMatch && method === "POST") {
    const detail = requireImportJobDetail(store, importJobConfirmMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    const importUserLogId = "import-user-log-mobile-001";
    updateImportJobDetail(detail, {
      importedRowCount: numberField(nestedRecord(detail.job), "validRowCount") ?? 1,
      importUserLogId,
      status: "CONFIRMED",
    });
    return json({
      importJobId: importJobConfirmMatch[1],
      importUserLogId,
      importedRowCount:
        numberField(nestedRecord(detail.job), "importedRowCount") ?? 1,
      status: "CONFIRMED",
    });
  }

  const importJobCancelMatch = pathname.match(/^\/api\/imports\/([^/]+)\/cancel$/);
  if (importJobCancelMatch && method === "POST") {
    const detail = requireImportJobDetail(store, importJobCancelMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    updateImportJobDetail(detail, { status: "CANCELED" });
    return json(null, 204);
  }

  const importJobErrorsMatch = pathname.match(/^\/api\/imports\/([^/]+)\/errors$/);
  if (importJobErrorsMatch && method === "GET") {
    const detail = requireImportJobDetail(store, importJobErrorsMatch[1]);
    const errorResponse = importJobErrorResponse(detail);
    if (errorResponse) {
      return errorResponse;
    }
    return json({ items: Array.isArray(detail.errors) ? detail.errors : [] });
  }

  if (pathname === "/api/exports" && method === "POST") {
    return json({
      createdAt: NOW,
      downloadReady: true,
      format: "EXCEL",
      id: "export-mobile-001",
      includeSensitiveData: false,
      status: "COMPLETED",
      targetType: "COMPANY",
    });
  }

  if (/^\/api\/exports\/[^/]+$/.test(pathname)) {
    return json({
      createdAt: NOW,
      downloadReady: true,
      format: "EXCEL",
      id: "export-mobile-001",
      includeSensitiveData: false,
      status: "COMPLETED",
      targetType: "COMPANY",
    });
  }

  if (/^\/api\/exports\/[^/]+\/download$/.test(pathname)) {
    return json({ downloadUrl: "/mock-export.xlsx", expiresAt: NEXT_WEEK });
  }

  if (pathname === "/api/trash" && method === "GET") {
    return json(paginated(store.trashItems, url));
  }

  const trashRestoreMatch = pathname.match(/^\/api\/trash\/([^/]+)\/([^/]+)\/restore$/);
  if (trashRestoreMatch && method === "POST") {
    return json({
      restoredAt: NOW,
      targetId: trashRestoreMatch[2],
      targetType: trashRestoreMatch[1],
    });
  }

  const trashDetailMatch = pathname.match(/^\/api\/trash\/([^/]+)\/([^/]+)$/);
  if (trashDetailMatch && method === "GET") {
    return json({
      ...requireTrashItem(store.trashItems, trashDetailMatch[1], trashDetailMatch[2]),
      content: `${MOBILE_LONG_FIXTURE.url} 삭제 상세 메모`,
      fields: [
        { label: "회사", value: MOBILE_LONG_FIXTURE.companyName },
        { label: "담당자", value: MOBILE_LONG_FIXTURE.contactName },
      ],
      summary: "모바일 QA 휴지통 상세 데이터입니다.",
      trashExpiresAt: NEXT_WEEK,
    });
  }

  if (method === "GET") {
    return json(paginated([], url));
  }

  return json({ ok: true });
}

function createStore(): UserWebApiMockStore {
  const companyField = { field: "모바일 QA 분야", id: "field-mobile-001" };
  const companyRegion = { id: "region-mobile-001", region: "서울/수도권" };
  const contactDepartment = { departmentName: "영업기획본부", id: "department-mobile-001" };
  const contactJobGrade = { id: "job-grade-mobile-001", jobGradeName: "팀장" };
  const productCategory = { categoryName: "SaaS", id: "category-mobile-001" };
  const productStatus = { id: "status-mobile-001", statusName: "판매중" };
  const company = {
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
    company: {
      companyName: company.companyName,
      id: company.id,
    },
    contactDepartment,
    contactJobGrade,
    createdAt: NOW,
    email: MOBILE_LONG_FIXTURE.email,
    id: "contact-mobile-001",
    mobile: MOBILE_LONG_FIXTURE.phone,
    updatedAt: NOW,
    username: MOBILE_LONG_FIXTURE.contactName,
  };
  const product = {
    createdAt: NOW,
    dealCount: 1,
    id: "product-mobile-001",
    productCategory,
    productName: `RQA002 모바일 상품 ${MOBILE_LONG_FIXTURE.url}`,
    productPrice: 9_900_000,
    productStatus,
    updatedAt: NOW,
  };
  const deal = {
    companies: [toDealCompany(company)],
    contacts: [toDealContactOption(contact)],
    createdAt: NOW,
    dealCost: 12_500_000,
    dealName: "RQA002 모바일 브라우저 긴 딜명 Chrome Edge 390 360 호환성 검증",
    dealStatus: "INITIAL_CONTACT",
    dealStatusLabel: DEAL_STATUS_LABEL.INITIAL_CONTACT,
    expectedEndDate: "2026-08-31",
    id: "deal-mobile-001",
    latestFollowingAction: {
      checkComplete: false,
      createdAt: NOW,
      followingAction: MOBILE_LONG_FIXTURE.url,
      id: "following-action-mobile-001",
    },
    nextFollowingAction: {
      checkComplete: false,
      createdAt: NOW,
      followingAction: "긴 텍스트 후속 조치 확인",
      id: "following-action-mobile-002",
      remainingCount: 2,
    },
    products: [toDealProduct(product)],
    updatedAt: NOW,
  };
  const schedule = {
    createdAt: NOW,
    deals: [{ dealName: deal.dealName, id: deal.id }],
    endAt: "2026-07-20T11:00:00.000Z",
    id: "schedule-mobile-001",
    location: "서울 강남구 테헤란로 모바일 QA 회의실",
    memo: `${MOBILE_LONG_FIXTURE.url} 일정 메모`,
    scheduleTitle: "RQA002 모바일 일정 긴 제목 Chrome Edge 390 360",
    startAt: "2026-07-20T10:00:00.000Z",
    timeZone: "Asia/Seoul",
    updatedAt: NOW,
  };
  const meetingNote = createMeetingNoteFromFixtures(company, contact, product, deal);

  return {
    businessCardScans: [createBusinessCardScan()],
    companyField,
    companyRegion,
    companies: [company],
    contactDepartment,
    contactJobGrade,
    contacts: [contact],
    counters: {
      "business-card": 1,
      company: 1,
      contact: 1,
      deal: 1,
      "import-job": 1,
      "meeting-note": 1,
      product: 1,
      schedule: 1,
    },
    deals: [deal],
    importJobs: [createImportJobDetail()],
    importTemplates: [createImportTemplate()],
    importUserLogs: [createImportUserLog()],
    meetingNotes: [meetingNote],
    productCategory,
    productStatus,
    products: [product],
    schedules: [schedule],
    trashItems: [createTrashItem()],
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
    email: "mobile-qa@example.test",
    id: "user-mobile-qa-001",
    lastLoginCountryCode: "KR",
    lastLoginLocale: "ko-KR",
    lastLoginTimeZone: "Asia/Seoul",
    name: "모바일QA사용자",
    preferredLocale: "ko-KR",
    role: "USER",
    settings: createNotificationSettings(),
    signupCountryCode: "KR",
    signupLocale: "ko-KR",
    signupTimeZone: "Asia/Seoul",
    status: "ACTIVE",
    supabaseUserId: "supabase-mobile-qa-001",
    timeZone: "Asia/Seoul",
  };
}

function createUserProfile(body: unknown) {
  return {
    createdAt: NOW,
    email: "mobile-qa@example.test",
    id: "user-mobile-qa-001",
    lastLoginAt: NOW,
    lastLoginCountryCode: "KR",
    lastLoginLocale: "ko-KR",
    lastLoginTimeZone: "Asia/Seoul",
    name: stringField(body, "name") ?? "모바일QA사용자",
    oauthAccounts: [
      {
        createdAt: NOW,
        id: "oauth-mobile-qa-001",
        provider: "google",
        providerEmail: "mobile-qa@example.test",
      },
    ],
    preferredLocale: stringField(body, "preferredLocale") ?? "ko-KR",
    role: "USER",
    signupCountryCode: "KR",
    signupLocale: "ko-KR",
    signupTimeZone: "Asia/Seoul",
    status: "ACTIVE",
    timeZone: stringField(body, "timeZone") ?? "Asia/Seoul",
    updatedAt: now(),
  };
}

function createNotificationSettings() {
  return {
    browserPushEnabled: true,
    defaultReminderMinutes: 30,
    emailNotificationEnabled: true,
    sensitiveWarningEnabled: true,
  };
}

function createContact(store: UserWebApiMockStore, body: unknown) {
  return {
    company: {
      companyName: MOBILE_LONG_FIXTURE.companyName,
      id: stringField(body, "companyId") ?? "company-mobile-001",
    },
    contactDepartment: store.contactDepartment,
    contactJobGrade: store.contactJobGrade,
    createdAt: now(),
    email: stringField(body, "email") ?? MOBILE_LONG_FIXTURE.email,
    id: nextId(store, "contact"),
    mobile: stringField(body, "mobile") ?? MOBILE_LONG_FIXTURE.phone,
    updatedAt: now(),
    username: stringField(body, "username") ?? MOBILE_LONG_FIXTURE.contactName,
  };
}

function createProduct(store: UserWebApiMockStore, body: unknown) {
  return {
    createdAt: now(),
    dealCount: 0,
    id: nextId(store, "product"),
    productCategory: store.productCategory,
    productName: stringField(body, "productName") ?? `RQA002 상품 ${MOBILE_LONG_FIXTURE.url}`,
    productPrice: numberField(body, "productPrice") ?? 1_000_000,
    productStatus: store.productStatus,
    updatedAt: now(),
  };
}

function createDeal(store: UserWebApiMockStore, body: unknown) {
  const company = toDealCompany(store.companies[0]);
  const contact = toDealContactOption(store.contacts[0]);
  const product = toDealProduct(store.products[0]);

  return {
    companies: [company],
    contacts: [contact],
    createdAt: now(),
    dealCost: numberField(body, "dealCost") ?? 1_000_000,
    dealName: stringField(body, "dealName") ?? "RQA002 모바일 생성 딜",
    dealStatus: "INITIAL_CONTACT",
    dealStatusLabel: DEAL_STATUS_LABEL.INITIAL_CONTACT,
    expectedEndDate: "2026-08-31",
    id: nextId(store, "deal"),
    latestFollowingAction: null,
    nextFollowingAction: null,
    products: [product],
    updatedAt: now(),
  };
}

function createSchedule(store: UserWebApiMockStore, body: unknown) {
  const deal = store.deals[0];

  return {
    createdAt: now(),
    deals: [{ dealName: stringField(deal, "dealName") ?? "RQA002 딜", id: stringField(deal, "id") ?? "deal-mobile-001" }],
    endAt: stringField(body, "endAt") ?? "2026-07-20T11:00:00.000Z",
    id: nextId(store, "schedule"),
    location: stringField(body, "location"),
    memo: stringField(body, "memo"),
    scheduleTitle: stringField(body, "scheduleTitle") ?? "RQA002 모바일 생성 일정",
    startAt: stringField(body, "startAt") ?? "2026-07-20T10:00:00.000Z",
    timeZone: stringField(body, "timeZone") ?? "Asia/Seoul",
    updatedAt: now(),
  };
}

function createMeetingNote(store: UserWebApiMockStore, body: unknown) {
  const meetingNote = createMeetingNoteFromFixtures(
    store.companies[0],
    store.contacts[0],
    store.products[0],
    store.deals[0],
    stringField(body, "title") ?? "RQA002 모바일 생성 회의록",
  );
  meetingNote.id = nextId(store, "meeting-note");
  return meetingNote;
}

function createMeetingNoteFromFixtures(
  company: MutableRecord,
  contact: MutableRecord,
  product: MutableRecord,
  deal: MutableRecord,
  title = "RQA002 모바일 회의록 긴 제목 Chrome Edge 390 360 QA",
) {
  return {
    companies: [
      {
        companyFieldSnapshot: "모바일 QA 분야",
        companyId: company.id,
        companyNameSnapshot: company.companyName,
        companyRegionSnapshot: "서울/수도권",
        createdAt: NOW,
        id: "meeting-note-company-mobile-001",
        isDeleted: false,
      },
    ],
    contacts: [
      {
        companyId: company.id,
        companyNameSnapshot: company.companyName,
        contactEmailSnapshot: MOBILE_LONG_FIXTURE.email,
        contactId: contact.id,
        contactMobileSnapshot: MOBILE_LONG_FIXTURE.phone,
        contactUsernameSnapshot: contact.username,
        createdAt: NOW,
        departmentSnapshot: "영업기획본부",
        id: "meeting-note-contact-mobile-001",
        isDeleted: false,
        jobGradeSnapshot: "팀장",
      },
    ],
    createdAt: NOW,
    deals: [
      {
        createdAt: NOW,
        dealCostSnapshot: 12_500_000,
        dealExpectedEndDateSnapshot: "2026-08-31",
        dealId: deal.id,
        dealNameSnapshot: deal.dealName,
        dealStatusSnapshot: DEAL_STATUS_LABEL.INITIAL_CONTACT,
        id: "meeting-note-deal-mobile-001",
        isDeleted: false,
      },
    ],
    details: `${MOBILE_LONG_FIXTURE.url} 회의 상세 내용입니다. 모바일 키보드와 긴 URL overflow를 확인합니다.`,
    id: "meeting-note-mobile-001",
    meetingAt: NOW,
    meetingLocalDateTime: "2026-07-20T18:00",
    nextPlan: "다음 주 모바일 브라우저 재확인",
    products: [
      {
        createdAt: NOW,
        id: "meeting-note-product-mobile-001",
        isDeleted: false,
        productCategorySnapshot: "SaaS",
        productId: product.id,
        productNameSnapshot: product.productName,
        productPriceSnapshot: 9_900_000,
        productStatusSnapshot: "판매중",
      },
    ],
    requiredAction: "360px에서 저장 버튼 가림 없음 확인",
    sourceType: "MANUAL",
    timeZone: "Asia/Seoul",
    title,
    updatedAt: NOW,
  };
}

function createBusinessCardScan() {
  return {
    ai: {
      model: "gpt-4.1-mini",
      provider: "openai",
    },
    createdAt: NOW,
    extracted: {
      companyFieldName: "모바일 QA 분야",
      companyName: MOBILE_LONG_FIXTURE.companyName,
      companyRegionName: "서울/수도권",
      contactDepartmentName: "영업기획본부",
      contactEmail: MOBILE_LONG_FIXTURE.email,
      contactJobGradeName: "팀장",
      contactMobile: MOBILE_LONG_FIXTURE.phone,
      contactName: MOBILE_LONG_FIXTURE.contactName,
    },
    id: "business-card-mobile-001",
    linked: {
      companyId: "company-mobile-001",
      companyResolution: "EXISTING",
      confirmedAt: null,
      contactId: "contact-mobile-001",
      contactResolution: "EXISTING",
    },
    status: "OCR_SUCCESS",
    updatedAt: NOW,
    usage: {
      costCurrency: "USD",
      pendingTimeMs: 128,
      requestCost: 0.001,
      requestToken: 120,
      responseCost: 0.001,
      responseToken: 80,
      totalCost: 0.002,
      totalToken: 200,
    },
  };
}

function createImportTemplate() {
  return {
    columns: [
      {
        description: "회사 이름",
        key: "companyName",
        label: "회사명",
        required: true,
        type: "text",
      },
      {
        description: "담당자 이메일",
        key: "email",
        label: "이메일",
        required: false,
        type: "email",
      },
    ],
    createdAt: NOW,
    id: "import-template-mobile-001",
    sampleRows: [{ companyName: MOBILE_LONG_FIXTURE.companyName, email: MOBILE_LONG_FIXTURE.email }],
    templateName: "회사 데이터 업로드 양식",
    templateType: "COMPANY",
    templateVersion: "2026.07",
    updatedAt: NOW,
  };
}

function createImportUserLog() {
  return {
    context: { memo: MOBILE_LONG_FIXTURE.url },
    contextLabel: "모바일 QA 업로드",
    createdAt: NOW,
    fileSizeBytes: 2048,
    id: "import-user-log-mobile-001",
    importedRowCount: 1,
    originalFileName: "rqa002-mobile-browser-long-file-name-390-360.xlsx",
    rows: [
      {
        createdAt: NOW,
        id: "import-user-log-row-mobile-001",
        rowNumber: 1,
        submittedData: {
          companyName: MOBILE_LONG_FIXTURE.companyName,
          email: MOBILE_LONG_FIXTURE.email,
        },
        targetLabel: MOBILE_LONG_FIXTURE.companyName,
      },
    ],
    targetType: "COMPANY",
    templateColumns: createImportTemplate().columns,
    templateVersion: "2026.07",
    totalRowCount: 1,
  };
}

function createImportJobDetail(
  id = "import-job-mobile-001",
  status = "NEEDS_REVIEW",
) {
  const rowStatus = status === "UPLOADED" ? "PENDING" : "INVALID";
  const rowErrors =
    rowStatus === "INVALID"
      ? [
          {
            code: "InvalidImportField",
            fieldKey: "companyName",
            message: "회사명을 입력해 주세요.",
          },
        ]
      : [];
  const rows = [
    {
      data: {
        companyName: rowStatus === "INVALID" ? "" : MOBILE_LONG_FIXTURE.companyName,
        email: MOBILE_LONG_FIXTURE.email,
      },
      errors: rowErrors,
      rowId: "import-job-row-mobile-001",
      rowNumber: 2,
      status: rowStatus,
      targetLabel: rowStatus === "INVALID" ? null : MOBILE_LONG_FIXTURE.companyName,
    },
  ];

  return {
    errors: [],
    job: {
      createdAt: NOW,
      expiresAt: NEXT_WEEK,
      failedRowCount: 0,
      id,
      importedRowCount: 0,
      importUserLogId: null,
      invalidRowCount: rowErrors.length > 0 ? 1 : 0,
      mappingSource: status === "UPLOADED" ? "NONE" : "USER",
      originalFileName: "rqa002-mobile-browser-long-file-name-390-360.xlsx",
      status,
      targetType: "COMPANY",
      totalRowCount: 1,
      updatedAt: NOW,
      validRowCount: rowErrors.length > 0 ? 0 : 1,
    },
    mapping: status === "UPLOADED" ? {} : { companyName: "companyName", email: "email" },
    rows,
    sourceColumns: ["companyName", "email"],
    templateColumns: createImportTemplate().columns,
  };
}

function requireImportJobDetail(
  store: UserWebApiMockStore,
  id: string | undefined,
): MutableRecord {
  const detail = store.importJobs.find((item) => nestedId(nestedRecord(item.job)) === id);

  if (!detail) {
    return {
      code: "ImportJobNotFound",
      message: "가져오기를 찾지 못했어요.",
      statusCode: 404,
    };
  }

  return detail;
}

function importJobResponse(detail: MutableRecord): MockApiResponse {
  return importJobErrorResponse(detail) ?? json(detail);
}

function importJobErrorResponse(detail: MutableRecord): MockApiResponse | null {
  const statusCode = numberField(detail, "statusCode");
  const code = stringField(detail, "code");

  if (statusCode === null || code === null) {
    return null;
  }

  return json(detail, statusCode);
}

function updateImportJobDetail(detail: MutableRecord, patch: MutableRecord) {
  const job = nestedRecord(detail.job);
  detail.job = {
    ...job,
    ...patch,
    updatedAt: now(),
  };
}

function recalculateImportJobSummary(detail: MutableRecord) {
  const rows = (Array.isArray(detail.rows) ? detail.rows.filter(isRecord) : []).map(
    (row) => {
      if (row.status === "EXCLUDED") {
        return {
          ...row,
          errors: [],
        };
      }

      const data = nestedRecord(row.data);
      const companyName = stringField(data, "companyName") ?? "";
      const errors =
        companyName.trim().length === 0
          ? [
              {
                code: "InvalidImportField",
                fieldKey: "companyName",
                message: "회사명을 입력해 주세요.",
              },
            ]
          : [];

      return {
        ...row,
        errors,
        status: errors.length > 0 ? "INVALID" : "VALID",
      };
    },
  );
  detail.rows = rows;
  const validRowCount = rows.filter((row) => row.status === "VALID").length;
  const invalidRowCount = rows.filter((row) => row.status === "INVALID").length;

  updateImportJobDetail(detail, {
    invalidRowCount,
    status: invalidRowCount === 0 && validRowCount > 0 ? "READY_TO_CONFIRM" : "NEEDS_REVIEW",
    validRowCount,
  });
}

function createTrashItem() {
  return {
    deletedAt: NOW,
    parentId: null,
    parentTitle: null,
    parentType: "COMPANY",
    permanentDeleteAt: NEXT_WEEK,
    targetId: "trash-company-mobile-001",
    targetType: "COMPANY",
    title: `삭제된 ${MOBILE_LONG_FIXTURE.companyName}`,
    trashExpiresAt: NEXT_WEEK,
  };
}

function createSearchResponse(store: UserWebApiMockStore) {
  return {
    groups: [
      {
        items: store.companies.map((company) => ({
          subtitle: "회사",
          targetId: company.id,
          targetPath: `/app/companies/${company.id}`,
          title: company.companyName,
        })),
        type: "COMPANY",
      },
      {
        items: store.deals.map((deal) => ({
          subtitle: "딜",
          targetId: deal.id,
          targetPath: `/app/deals/${deal.id}`,
          title: deal.dealName,
        })),
        type: "DEAL",
      },
    ],
  };
}

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
    id: stringField(product, "id") ?? "product-mobile-001",
    isDeleted: false,
    productCategory: nestedRecord(product?.productCategory),
    productName: stringField(product, "productName") ?? "RQA002 모바일 상품",
    productPrice: numberField(product, "productPrice") ?? 9_900_000,
    productStatus: nestedRecord(product?.productStatus),
  };
}

function toDealListItem(deal: MutableRecord) {
  return {
    companies: Array.isArray(deal.companies) ? deal.companies : [],
    contacts: Array.isArray(deal.contacts) ? deal.contacts : [],
    createdAt: stringField(deal, "createdAt") ?? NOW,
    dealCost: numberField(deal, "dealCost") ?? 0,
    dealName: stringField(deal, "dealName") ?? "",
    dealStatus: stringField(deal, "dealStatus") ?? "INITIAL_CONTACT",
    dealStatusLabel: stringField(deal, "dealStatusLabel") ?? DEAL_STATUS_LABEL.INITIAL_CONTACT,
    expectedEndDate: stringField(deal, "expectedEndDate") ?? "2026-08-31",
    id: stringField(deal, "id") ?? "deal-mobile-001",
    latestFollowingAction: deal.latestFollowingAction ?? null,
    nextFollowingAction: deal.nextFollowingAction ?? null,
    updatedAt: stringField(deal, "updatedAt") ?? NOW,
  };
}

function toMeetingNoteListItem(meetingNote: MutableRecord) {
  return {
    companies: summarizeMeetingItems(meetingNote.companies, "companyNameSnapshot"),
    contacts: summarizeMeetingItems(meetingNote.contacts, "contactUsernameSnapshot"),
    createdAt: stringField(meetingNote, "createdAt") ?? NOW,
    deals: summarizeMeetingItems(meetingNote.deals, "dealNameSnapshot"),
    id: stringField(meetingNote, "id") ?? "meeting-note-mobile-001",
    meetingAt: stringField(meetingNote, "meetingAt"),
    products: summarizeMeetingItems(meetingNote.products, "productNameSnapshot"),
    sourceType: stringField(meetingNote, "sourceType") ?? "MANUAL",
    title: stringField(meetingNote, "title") ?? "RQA002 회의록",
  };
}

function summarizeMeetingItems(value: unknown, labelKey: string) {
  const items = Array.isArray(value) ? value : [];
  const first = items.find(isRecord);
  return {
    count: items.length,
    label: stringField(first, labelKey) ?? "",
  };
}

function paginated<TItem>(items: readonly TItem[], url: URL) {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");

  return {
    items: [...items],
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

function requireItem(items: readonly MutableRecord[], id: string | undefined) {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    return {
      code: "NotFound",
      message: "Not found",
      statusCode: 404,
    };
  }

  return item;
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
    updateNestedArrayLabel(deal.contacts, companyId, "company.companyName", companyName);
  }

  for (const meetingNote of store.meetingNotes) {
    updateNestedArrayLabel(
      meetingNote.companies,
      companyId,
      "companyNameSnapshot",
      companyName,
    );
  }
}

function updateNestedArrayLabel(
  value: unknown,
  id: string,
  field: string,
  label: string,
) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    if (field.includes(".")) {
      const [parentField, childField] = field.split(".");
      const nested = parentField ? item[parentField] : null;

      if (isRecord(nested) && nested.id === id && childField) {
        nested[childField] = label;
      }

      continue;
    }

    if (item.id === id || item.companyId === id) {
      item[field] = label;
    }
  }
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

function isPublicApiRequest(pathname: string) {
  return pathname === "/api/auth/providers";
}

function json(body: unknown, status = 200): MockApiResponse {
  return { body, status };
}

function text(
  body: string,
  contentType: string,
  headers: Record<string, string> = {},
): MockApiResponse {
  return { body, contentType, headers };
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
    "access-control-allow-headers": "authorization,content-type",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "access-control-allow-origin": "*",
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
  return `${prefix}-mobile-${String(store.counters[prefix]).padStart(3, "0")}`;
}

function now() {
  return new Date(NOW).toISOString();
}
