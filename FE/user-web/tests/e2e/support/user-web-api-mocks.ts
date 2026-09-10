import type { Page, Route } from "@playwright/test";

const E2E_ACCESS_TOKEN = "e2e-user-web-access-token";
const E2E_ACCESS_TOKEN_EXPIRES_AT = "2026-12-31T23:59:59.000Z";
const E2E_AUTHORIZATION = `Bearer ${E2E_ACCESS_TOKEN}`;
const NOW = "2026-07-20T09:00:00.000Z";
const NEXT_WEEK = "2026-07-27T10:00:00.000Z";
const AI_WEEKLY_REPORT_SUMMARY_PREVIEW_MAX_LENGTH = 160;
const AI_WEEKLY_REPORT_SUMMARY_PREVIEW_SUFFIX = "...";

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
  readonly schedules: MutableRecord[];
  readonly googleCalendarConnection: MutableRecord;
  readonly googleCalendars: MutableRecord[];
  readonly meetingNotes: MutableRecord[];
  readonly aiWeeklyReports: MutableRecord[];
  readonly followUpDeliverySettings: MutableRecord;
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

    // 기능 : 제품 분석 collector request를 저장하고 성공 응답을 반환합니다.
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
    return json(createUserSettings());
  }

  if (pathname === "/api/follow-up-delivery/settings" && method === "GET") {
    return json(store.followUpDeliverySettings);
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

  if (pathname === "/api/schedules/google/connect" && method === "POST") {
    const body = await readJsonBody(route);

    return json({
      connectUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?mock=onehand-calendar",
      expiresAt: NEXT_WEEK,
      returnTo: stringField(body, "returnTo") ?? "/app/schedules",
    });
  }

  if (pathname === "/api/schedules/google/status" && method === "GET") {
    return json(createGoogleCalendarStatus(store));
  }

  if (pathname === "/api/schedules/google/calendars" && method === "GET") {
    return json(createGoogleCalendarList(store));
  }

  if (pathname === "/api/schedules/google/calendars" && method === "PATCH") {
    const body = await readJsonBody(route);
    const selectedIds = stringArrayField(body, "selectedCalendarIds");
    const selectedSet = new Set(selectedIds);

    for (const calendar of store.googleCalendars) {
      calendar.status = selectedSet.has(String(calendar.calendarId))
        ? "SELECTED"
        : "UNSELECTED";
    }

    return json(createGoogleCalendarList(store));
  }

  if (pathname === "/api/schedules/google/sync" && method === "POST") {
    const body = await readJsonBody(route);
    store.googleCalendarConnection.lastSyncedAt = now();
    store.googleCalendarConnection.lastSyncStartedAt = now();

    return json({
      connectionStatus: store.googleCalendarConnection.status,
      finishedAt: now(),
      nextAutoSyncAvailableAt: NEXT_WEEK,
      rangeEndAt: "2026-10-21T15:00:00.000Z",
      rangeStartAt: "2026-06-21T15:00:00.000Z",
      result: {
        errorCount: 0,
        googleDeletedCount: 0,
        hiddenByCalendarSelectionCount: 0,
        importedCount: 0,
        localModifiedSkippedCount: 0,
        trashedCount: 0,
        updatedCount: 1,
      },
      selectedCalendarCount: countSelectedGoogleCalendars(store),
      startedAt: now(),
      trigger: stringField(body, "trigger") ?? "MANUAL",
    });
  }

  if (pathname === "/api/schedules/google/disconnect" && method === "POST") {
    const body = await readJsonBody(route);
    const scheduleAction = stringField(body, "scheduleAction") ?? "KEEP";
    store.googleCalendarConnection.status = "DISCONNECTED";
    store.googleCalendarConnection.disconnectedAt = now();

    return json({
      affectedScheduleCount: store.schedules.length,
      connectionStatus: "DISCONNECTED",
      disconnectedAt: now(),
      hiddenScheduleCount: scheduleAction === "HIDE" ? store.schedules.length : 0,
      keptScheduleCount: scheduleAction === "KEEP" ? store.schedules.length : 0,
      scheduleAction,
      trashedScheduleCount: scheduleAction === "TRASH" ? store.schedules.length : 0,
    });
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
    return json(paginated(store.deals.map((deal) => toDealListItem(store, deal)), url));
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

  const dealActivitiesMatch = pathname.match(/^\/api\/deals\/([^/]+)\/activities$/);
  if (dealActivitiesMatch && method === "GET") {
    return jsonConnection(
      listDealActivities(
        store,
        decodeURIComponent(dealActivitiesMatch[1] ?? ""),
        url,
      ),
    );
  }

  if (dealActivitiesMatch && method === "POST") {
    const activity = createManualDealActivity(
      store,
      decodeURIComponent(dealActivitiesMatch[1] ?? ""),
      await readJsonBody(route),
    );

    return json(activity, 201);
  }

  const dealActivityDetailMatch = pathname.match(
    /^\/api\/deals\/([^/]+)\/activities\/([^/]+)$/,
  );
  if (dealActivityDetailMatch && method === "PATCH") {
    const activity = updateManualDealActivity(
      store,
      decodeURIComponent(dealActivityDetailMatch[1] ?? ""),
      decodeURIComponent(dealActivityDetailMatch[2] ?? ""),
      await readJsonBody(route),
    );

    return json(activity);
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

  if (pathname === "/api/sales-reports/weekly" && method === "GET") {
    return json(createAiWeeklyReportWeek(store, url));
  }

  if (pathname === "/api/sales-reports/weekly" && method === "POST") {
    return createAiWeeklyReportGeneration(store, await readJsonBody(route));
  }

  const aiWeeklyReportSnapshotMatch = pathname.match(
    /^\/api\/sales-reports\/weekly\/([^/]+)\/snapshot-summary$/,
  );

  if (aiWeeklyReportSnapshotMatch && method === "GET") {
    const report = requireAiWeeklyReport(store, aiWeeklyReportSnapshotMatch[1]);

    if (isApiErrorShape(report)) {
      return json(report, numberField(report, "statusCode") ?? 404);
    }

    return json(createAiWeeklyReportSnapshotSummary(report));
  }

  const aiWeeklyReportDetailMatch = pathname.match(
    /^\/api\/sales-reports\/weekly\/([^/]+)$/,
  );

  if (aiWeeklyReportDetailMatch && method === "GET") {
    const report = requireAiWeeklyReport(store, aiWeeklyReportDetailMatch[1]);

    if (isApiErrorShape(report)) {
      return json(report, numberField(report, "statusCode") ?? 404);
    }

    return json(toAiWeeklyReportDetail(report));
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

  if (pathname === "/api/schedules/week" && method === "GET") {
    return json(createWeeklyScheduleReport(store, url));
  }

  if (pathname === "/api/schedules/week/export/xlsx" && method === "GET") {
    return text("weekly schedules xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", {
      "content-disposition": 'attachment; filename="weekly_schedules_20260720_090000.xlsx"',
    });
  }

  const scheduleDetailMatch = pathname.match(/^\/api\/schedules\/([^/]+)$/);
  if (scheduleDetailMatch && method === "GET") {
    return json(requireItem(store.schedules, scheduleDetailMatch[1]));
  }

  if (scheduleDetailMatch && method === "PATCH") {
    const schedule = requireItem(store.schedules, scheduleDetailMatch[1]);
    const body = await readJsonBody(route);

    if (isRecord(schedule) && !isApiErrorShape(schedule)) {
      updateScheduleRecord(schedule, body);
    }

    return json(schedule);
  }

  if (scheduleDetailMatch && method === "DELETE") {
    const scheduleIndex = store.schedules.findIndex(
      (schedule) => String(schedule.id) === scheduleDetailMatch[1],
    );

    if (scheduleIndex >= 0) {
      const [schedule] = store.schedules.splice(scheduleIndex, 1);
      store.trashItems.unshift(createScheduleTrashItem(schedule));
    }

    return json(null);
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

  if (pathname === "/api/meeting-notes/stt-draft" && method === "POST") {
    return json(
      {
        details: "모바일 현장 미팅에서 도입 범위와 다음 확인 항목을 정리했어요.",
        nextPlan: "견적 조건을 확인한 뒤 다음 주에 재논의해요.",
        requiredAction: "보안 자료와 모바일 견적서를 보내요.",
        sourceType: "STT_AI",
        transcript: "모바일 현장 미팅 녹취 텍스트",
      },
      201,
    );
  }

  const meetingNoteDealsMatch = pathname.match(/^\/api\/meeting-notes\/([^/]+)\/deals$/);
  if (meetingNoteDealsMatch && method === "POST") {
    return json(requireItem(store.meetingNotes, meetingNoteDealsMatch[1]));
  }

  const meetingNoteDetailMatch = pathname.match(/^\/api\/meeting-notes\/([^/]+)$/);
  if (meetingNoteDetailMatch && method === "GET") {
    return json(requireItem(store.meetingNotes, meetingNoteDetailMatch[1]));
  }

  if (pathname === "/api/error-reports" && method === "POST") {
    return json(
      {
        id: nextId(store, "error-report"),
        message: "신고가 접수되었어요. 문제를 빠르게 해결할게요.",
      },
      201,
    );
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
    dealCount: 1,
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
    deletedAt: null,
    deals: [{ dealName: deal.dealName, id: deal.id }],
    endAt: "2026-07-20T11:00:00.000Z",
    googleCalendar: {
      badgeLabel: "Google",
      calendarId: "primary",
      calendarName: "mobile-qa@example.test",
      canEditLocalFields: true,
      externalDeletedAt: null,
      externalHtmlLink: "https://calendar.google.com/calendar/event?eid=mock",
      isHidden: false,
      lastExternalSyncedAt: NOW,
      sourceId: "google-calendar-source-primary",
      syncStatus: "SYNCED",
    },
    id: "schedule-mobile-001",
    isAllDay: false,
    location: "서울 강남구 테헤란로 모바일 QA 회의실",
    meetingUrl: "https://meet.google.com/mock-calendar-e2e",
    memo: `${MOBILE_LONG_FIXTURE.url} 일정 메모`,
    scheduleTitle: "RQA002 모바일 일정 긴 제목 Chrome Edge 390 360",
    sourceType: "GOOGLE",
    startAt: "2026-07-20T10:00:00.000Z",
    timeZone: "Asia/Seoul",
    trashExpiresAt: null,
    updatedAt: NOW,
  };
  const googleCalendarConnection = createGoogleCalendarConnection();
  const googleCalendars = createGoogleCalendars();
  const meetingNote = createMeetingNoteFromFixtures(company, contact, product, deal);
  const aiWeeklyReports = createAiWeeklyReportFixtures(schedule, deal, meetingNote);
  const dealActivities = createDealActivityFixtures(deal, schedule, meetingNote);

  return {
    aiWeeklyReports,
    companyField,
    companyRegion,
    companies: [company],
    contactDepartment,
    contactJobGrade,
    contacts: [contact],
    counters: {
      company: 1,
      contact: 1,
      deal: 1,
      "ai-weekly-report": 2,
      "meeting-note": 1,
      product: 1,
      schedule: 1,
      "deal-activity": 3,
    },
    dealActivities,
    deals: [deal],
    googleCalendarConnection,
    googleCalendars,
    meetingNotes: [meetingNote],
    followUpDeliverySettings: createFollowUpDeliverySettings(),
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
    settings: createUserSettings(),
    signupCountryCode: "KR",
    signupLocale: "ko-KR",
    signupTimeZone: "Asia/Seoul",
    status: "ACTIVE",
    supabaseUserId: "supabase-mobile-qa-001",
    timeZone: "Asia/Seoul",
  };
}

// 기능 : 인증된 사용자 profile API의 기본 응답과 수정 응답을 생성합니다.
function createUserProfile(body: unknown) {
  return {
    createdAt: NOW,
    countryCode: stringField(body, "countryCode") ?? "KR",
    defaultCurrencyCode: stringField(body, "defaultCurrencyCode") ?? "KRW",
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

function createUserSettings() {
  return {
    defaultReminderMinutes: 30,
    sensitiveWarningEnabled: true,
  };
}

// 기능 : 사용자 데이터 export 요청 mock 응답을 생성하고 store에 저장합니다.
function createGoogleCalendarConnection() {
  return {
    connectedAt: NOW,
    disconnectedAt: null,
    lastSyncErrorCode: null,
    lastSyncFailedAt: null,
    lastSyncStartedAt: NOW,
    lastSyncedAt: NOW,
    provider: "GOOGLE",
    providerAccountEmail: "mobile-qa@example.test",
    reconnectRequiredAt: null,
    status: "CONNECTED",
    syncLockExpiresAt: null,
  };
}

function createGoogleCalendars() {
  return [
    {
      calendarId: "primary",
      calendarName: "mobile-qa@example.test",
      calendarTimeZone: "Asia/Seoul",
      id: "google-calendar-source-primary",
      isPrimary: true,
      isSystemCalendar: false,
      lastSyncErrorCode: null,
      lastSyncFailedAt: null,
      lastSyncedAt: NOW,
      status: "SELECTED",
    },
    {
      calendarId: "ko.south_korea#holiday@group.v.calendar.google.com",
      calendarName: "대한민국 공휴일",
      calendarTimeZone: "Asia/Seoul",
      id: "google-calendar-source-holiday",
      isPrimary: false,
      isSystemCalendar: true,
      lastSyncErrorCode: null,
      lastSyncFailedAt: null,
      lastSyncedAt: null,
      status: "UNSELECTED",
    },
  ];
}

function createGoogleCalendarStatus(store: UserWebApiMockStore) {
  const connectionStatus =
    stringField(store.googleCalendarConnection, "status") ?? "CONNECTED";
  const connected = connectionStatus !== "DISCONNECTED";

  return {
    autoSync: {
      enabled: connectionStatus === "CONNECTED",
      freshnessMinutes: 10,
      nextAutoSyncAvailableAt: NEXT_WEEK,
      shouldSyncOnScheduleEntry: false,
    },
    availableCalendarCount: store.googleCalendars.length,
    connected,
    connection: connected ? store.googleCalendarConnection : null,
    selectedCalendarCount: countSelectedGoogleCalendars(store),
  };
}

function createGoogleCalendarList(store: UserWebApiMockStore) {
  return {
    calendars: store.googleCalendars,
    connection: store.googleCalendarConnection,
  };
}

function countSelectedGoogleCalendars(store: UserWebApiMockStore) {
  return store.googleCalendars.filter(
    (calendar) => stringField(calendar, "status") === "SELECTED",
  ).length;
}

function createFollowUpDeliverySettings() {
  return {
    consentNotices: [
      {
        acknowledgedAt: NOW,
        channel: "EMAIL",
      },
      {
        acknowledgedAt: NOW,
        channel: "SMS",
      },
    ],
    emailConnections: [
      {
        connectedAt: NOW,
        disconnectedAt: null,
        id: "follow-up-email-google-001",
        provider: "GOOGLE",
        providerAccountEmail: "mobile-qa@example.test",
        reconnectRequiredAt: null,
        status: "CONNECTED",
      },
      {
        connectedAt: null,
        disconnectedAt: NOW,
        id: "follow-up-email-microsoft-001",
        provider: "MICROSOFT",
        providerAccountEmail: "sales@example.test",
        reconnectRequiredAt: null,
        status: "DISCONNECTED",
      },
    ],
    smsSenderNumbers: [
      {
        id: "follow-up-sms-001",
        phoneE164Masked: "+82******5678",
        revokedAt: null,
        status: "VERIFIED",
        verificationExpiresAt: NEXT_WEEK,
        verifiedAt: NOW,
      },
    ],
  };
}

function createDealActivityFixtures(
  deal: MutableRecord,
  schedule: MutableRecord,
  meetingNote: MutableRecord,
) {
  const dealId = stringField(deal, "id") ?? "deal-mobile-001";
  const dealName = stringField(deal, "dealName") ?? "RQA002 deal";
  const scheduleId = stringField(schedule, "id") ?? "schedule-mobile-001";
  const scheduleTitle = stringField(schedule, "scheduleTitle") ?? "RQA002 schedule";
  const meetingNoteId =
    stringField(meetingNote, "id") ?? "meeting-note-mobile-001";
  const meetingNoteTitle =
    stringField(meetingNote, "title") ?? "RQA002 meeting note";

  return [
    {
      activityType: "MEETING_NOTE_LINKED",
      body: null,
      createdAt: NOW,
      dealId,
      id: "deal-activity-mobile-003",
      isEditable: false,
      linkedRecords: [
        {
          targetId: meetingNoteId,
          targetLabel: meetingNoteTitle,
          targetPath: `/app/meeting-notes/${meetingNoteId}`,
          targetType: "MEETING_NOTE",
        },
      ],
      occurredAt: "2026-07-20T09:20:00.000Z",
      sourceId: meetingNoteId,
      sourceType: "MEETING_NOTE",
      summary: "회의록을 연결했어요.",
      title: "회의록을 연결했어요",
      updatedAt: NOW,
    },
    {
      activityType: "SCHEDULE_LINKED",
      body: null,
      createdAt: NOW,
      dealId,
      id: "deal-activity-mobile-002",
      isEditable: false,
      linkedRecords: [
        {
          targetId: scheduleId,
          targetLabel: scheduleTitle,
          targetPath: `/app/schedules/${scheduleId}`,
          targetType: "SCHEDULE",
        },
      ],
      occurredAt: "2026-07-20T09:10:00.000Z",
      sourceId: scheduleId,
      sourceType: "SCHEDULE",
      summary: "일정을 연결했어요.",
      title: "일정을 연결했어요",
      updatedAt: NOW,
    },
    {
      activityType: "DEAL_CREATED",
      body: null,
      createdAt: NOW,
      dealId,
      id: "deal-activity-mobile-001",
      isEditable: false,
      linkedRecords: [
        {
          targetId: dealId,
          targetLabel: dealName,
          targetPath: `/app/deals/${dealId}`,
          targetType: "DEAL",
        },
      ],
      occurredAt: "2026-07-20T09:00:00.000Z",
      sourceId: dealId,
      sourceType: "SYSTEM",
      summary: "딜을 생성했어요.",
      title: "딜을 생성했어요",
      updatedAt: NOW,
    },
  ];
}

function listDealActivities(
  store: UserWebApiMockStore,
  dealId: string,
  url: URL,
) {
  const type = url.searchParams.get("type");

  return store.dealActivities
    .filter(
      (activity) =>
        stringField(activity, "dealId") === dealId &&
        (type === null || stringField(activity, "activityType") === type),
    )
    .sort(compareDealActivityDesc);
}

function createManualDealActivity(
  store: UserWebApiMockStore,
  dealId: string,
  body: unknown,
) {
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
        targetLabel: stringField(requireItem(store.deals, dealId), "dealName"),
        targetPath: `/app/deals/${dealId}`,
        targetType: "DEAL",
      },
    ],
    occurredAt: stringField(body, "occurredAt") ?? now(),
    sourceId: null,
    sourceType: "USER",
    summary: stringField(body, "title") ?? "수동 활동",
    title: stringField(body, "title") ?? "수동 활동",
    updatedAt: now(),
  };

  store.dealActivities.unshift(activity);
  return activity;
}

function updateManualDealActivity(
  store: UserWebApiMockStore,
  dealId: string,
  activityId: string,
  body: unknown,
) {
  const activity = store.dealActivities.find(
    (item) =>
      stringField(item, "dealId") === dealId &&
      stringField(item, "id") === activityId,
  );

  if (!activity) {
    return {
      code: "NotFound",
      message: "Not found",
      statusCode: 404,
    };
  }

  if (stringField(body, "activityType")) {
    activity.activityType = stringField(body, "activityType");
  }
  if (stringField(body, "title")) {
    activity.title = stringField(body, "title");
    activity.summary = stringField(body, "title");
  }
  if (isRecord(body) && "body" in body) {
    activity.body = stringField(body, "body");
  }
  if (stringField(body, "occurredAt")) {
    activity.occurredAt = stringField(body, "occurredAt");
  }
  activity.updatedAt = now();

  return activity;
}

function compareDealActivityDesc(left: MutableRecord, right: MutableRecord) {
  const leftTime = Date.parse(stringField(left, "occurredAt") ?? "");
  const rightTime = Date.parse(stringField(right, "occurredAt") ?? "");
  const timeDiff = rightTime - leftTime;

  if (timeDiff !== 0) {
    return timeDiff;
  }

  return String(right.id).localeCompare(String(left.id));
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
    dealCount: 0,
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
    deletedAt: null,
    deals: [{ dealName: stringField(deal, "dealName") ?? "RQA002 딜", id: stringField(deal, "id") ?? "deal-mobile-001" }],
    endAt: stringField(body, "endAt") ?? "2026-07-20T11:00:00.000Z",
    googleCalendar: null,
    id: nextId(store, "schedule"),
    isAllDay: false,
    location: stringField(body, "location"),
    meetingUrl: stringField(body, "meetingUrl"),
    memo: stringField(body, "memo"),
    scheduleTitle: stringField(body, "scheduleTitle") ?? "RQA002 모바일 생성 일정",
    sourceType: "INTERNAL",
    startAt: stringField(body, "startAt") ?? "2026-07-20T10:00:00.000Z",
    timeZone: stringField(body, "timeZone") ?? "Asia/Seoul",
    trashExpiresAt: null,
    updatedAt: now(),
  };
}

function updateScheduleRecord(schedule: MutableRecord, body: unknown) {
  if (!isRecord(body)) {
    return;
  }

  const editableFields = [
    "scheduleTitle",
    "startAt",
    "endAt",
    "timeZone",
    "location",
    "meetingUrl",
    "memo",
  ] as const;
  let changed = false;

  for (const field of editableFields) {
    if (field in body) {
      schedule[field] = body[field] ?? null;
      changed = true;
    }
  }

  if (Array.isArray(body.dealIds)) {
    schedule.deals = body.dealIds.map((dealId) => ({
      dealName: String(dealId),
      id: String(dealId),
    }));
    changed = true;
  }

  if ("startAt" in body || "endAt" in body) {
    schedule.isAllDay = false;
  }

  if (changed && stringField(schedule, "sourceType") === "GOOGLE") {
    const googleCalendar = isRecord(schedule.googleCalendar)
      ? schedule.googleCalendar
      : null;

    if (googleCalendar) {
      googleCalendar.badgeLabel = "Google · 로컬 수정";
      googleCalendar.syncStatus = "LOCAL_MODIFIED";
    }
  }

  if (changed) {
    schedule.updatedAt = now();
  }
}

function createScheduleTrashItem(schedule: MutableRecord | undefined) {
  return {
    deletedAt: now(),
    parentId: null,
    parentTitle: null,
    parentType: "SCHEDULE",
    permanentDeleteAt: NEXT_WEEK,
    targetId: stringField(schedule, "id") ?? "schedule-trash-mobile-001",
    targetType: "SCHEDULE",
    title: stringField(schedule, "scheduleTitle") ?? "삭제된 일정",
    trashExpiresAt: NEXT_WEEK,
  };
}

const WEEKLY_REPORT_WEEKDAYS = [
  { weekday: "MONDAY", weekdayLabel: "월" },
  { weekday: "TUESDAY", weekdayLabel: "화" },
  { weekday: "WEDNESDAY", weekdayLabel: "수" },
  { weekday: "THURSDAY", weekdayLabel: "목" },
  { weekday: "FRIDAY", weekdayLabel: "금" },
  { weekday: "SATURDAY", weekdayLabel: "토" },
  { weekday: "SUNDAY", weekdayLabel: "일" },
] as const;

function createWeeklyScheduleReport(store: UserWebApiMockStore, url: URL) {
  const weekStart = url.searchParams.get("weekStart") ?? "2026-07-20";
  const timeZone = url.searchParams.get("timeZone") ?? "Asia/Seoul";
  const weekEnd = addDateOnlyDays(weekStart, 6);
  const reportSchedule =
    weekStart === "2026-07-20" && store.schedules[0]
      ? createWeeklyReportSchedule(store.schedules[0], store.deals[0])
      : null;
  const days = WEEKLY_REPORT_WEEKDAYS.map((weekday, index) => {
    const date = addDateOnlyDays(weekStart, index);
    const schedules = index === 0 && reportSchedule ? [reportSchedule] : [];
    const linkedDealIds = new Set(
      schedules.flatMap((schedule) => schedule.deals.map((deal) => deal.id)),
    );

    return {
      date,
      linkedDealCount: linkedDealIds.size,
      scheduleCount: schedules.length,
      schedules,
      weekday: weekday.weekday,
      weekdayLabel: weekday.weekdayLabel,
    };
  });
  const distinctDeals = reportSchedule?.deals ?? [];
  const totalDealCost = distinctDeals.reduce(
    (total, deal) => total + deal.dealCost,
    0,
  );

  return {
    days,
    generatedAt: NOW,
    rangeEndAt: `${addDateOnlyDays(weekStart, 7)}T00:00:00.000Z`,
    rangeStartAt: `${weekStart}T00:00:00.000Z`,
    summary: {
      dealStatusCounts: distinctDeals.map((deal) => ({
        count: 1,
        dealStatus: deal.dealStatus,
        dealStatusLabel: deal.dealStatusLabel,
      })),
      distinctLinkedDealCount: distinctDeals.length,
      scheduledDayCount: reportSchedule ? 1 : 0,
      scheduleDealLinkCount: distinctDeals.length,
      totalDealCost,
      totalDealCostByCurrency: [
        {
          currencyCode: "KRW",
          totalDealCost,
        },
      ],
      totalScheduleCount: reportSchedule ? 1 : 0,
      totalScheduleEntryCount: reportSchedule ? 1 : 0,
      unlinkedScheduleCount: reportSchedule && distinctDeals.length === 0 ? 1 : 0,
    },
    timeZone,
    weekEnd,
    weekStart,
  };
}

function createWeeklyReportSchedule(
  schedule: MutableRecord,
  deal: MutableRecord | undefined,
) {
  const reportDeal = deal ? createWeeklyReportDeal(deal) : null;

  return {
    deals: reportDeal ? [reportDeal] : [],
    endAt: stringField(schedule, "endAt") ?? "2026-07-20T11:00:00.000Z",
    googleCalendar: isRecord(schedule.googleCalendar)
      ? schedule.googleCalendar
      : null,
    hasMemo: Boolean(stringField(schedule, "memo")?.trim()),
    id: stringField(schedule, "id") ?? "schedule-mobile-001",
    isAllDay: Boolean(schedule.isAllDay),
    location: stringField(schedule, "location"),
    meetingUrl: stringField(schedule, "meetingUrl"),
    scheduleTitle:
      stringField(schedule, "scheduleTitle") ??
      "RQA002 주간 보고서 일정 제목 Chrome Edge 390 360",
    sourceType: stringField(schedule, "sourceType") ?? "INTERNAL",
    startAt: stringField(schedule, "startAt") ?? "2026-07-20T10:00:00.000Z",
    timeZone: stringField(schedule, "timeZone") ?? "Asia/Seoul",
  };
}

function createWeeklyReportDeal(deal: MutableRecord) {
  const dealStatus = stringField(deal, "dealStatus") ?? "INITIAL_CONTACT";

  return {
    companies: toMutableRecords(deal.companies).map((company) => ({
      companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
      id: stringField(company, "id") ?? "company-mobile-001",
    })),
    contacts: toMutableRecords(deal.contacts).map((contact) => {
      const company = nestedRecord(contact.company);

      return {
        companyId: stringField(contact, "companyId") ?? stringField(company, "id") ?? "company-mobile-001",
        companyName: stringField(company, "companyName") ?? MOBILE_LONG_FIXTURE.companyName,
        id: stringField(contact, "id") ?? "contact-mobile-001",
        username: stringField(contact, "username") ?? MOBILE_LONG_FIXTURE.contactName,
      };
    }),
    dealCost: numberField(deal, "dealCost") ?? 0,
    dealName: stringField(deal, "dealName") ?? "RQA002 주간 보고서 딜",
    dealStatus,
    dealStatusLabel:
      stringField(deal, "dealStatusLabel") ??
      DEAL_STATUS_LABEL[dealStatus as keyof typeof DEAL_STATUS_LABEL] ??
      dealStatus,
    expectedEndDate: stringField(deal, "expectedEndDate") ?? "2026-08-31",
    id: stringField(deal, "id") ?? "deal-mobile-001",
    nextFollowingAction: createWeeklyReportNextFollowingAction(
      nestedRecord(deal.nextFollowingAction),
    ),
  };
}

function createWeeklyReportNextFollowingAction(action: MutableRecord) {
  const followingAction = stringField(action, "followingAction");

  if (!followingAction) {
    return null;
  }

  return {
    checkComplete: Boolean(action.checkComplete),
    createdAt: stringField(action, "createdAt") ?? NOW,
    followingAction,
    id: stringField(action, "id") ?? "following-action-mobile-001",
    remainingCount: numberField(action, "remainingCount") ?? 0,
  };
}

function createAiWeeklyReportFixtures(
  schedule: MutableRecord,
  deal: MutableRecord,
  meetingNote: MutableRecord,
) {
  const weekStart = "2026-07-20";
  const weekEnd = "2026-07-26";
  const timeZone = "Asia/Seoul";
  const locale = "ko-KR";
  const inputSnapshotJson = createAiWeeklyInputSnapshot({
    deal,
    locale,
    meetingNote,
    schedule,
    timeZone,
    weekEnd,
    weekStart,
  });
  const dataCoverageJson = {
    dealCount: 1,
    linkedDealCount: 1,
    meetingNoteCount: 1,
    missingSignals: [],
    scheduleCount: 1,
  };

  return [
    {
      dataCoverageJson,
      failedAt: NOW,
      generatedAt: null,
      id: "00000000-0000-4000-8000-000000000001",
      inputSnapshotJson,
      locale,
      outputJson: null,
      requestedAt: NOW,
      safeErrorCode: "AI_WEEKLY_REPORT_PROVIDER_UNAVAILABLE",
      safeErrorMessage: "AI 리포트를 만들지 못했어요. 다시 시도해 주세요.",
      status: "FAILED",
      timeZone,
      version: 1,
      weekEnd,
      weekStart,
    },
    {
      dataCoverageJson,
      failedAt: null,
      generatedAt: NOW,
      id: "00000000-0000-4000-8000-000000000002",
      inputSnapshotJson,
      locale,
      outputJson: createAiWeeklyReportSections(deal, meetingNote),
      requestedAt: NOW,
      safeErrorCode: null,
      safeErrorMessage: null,
      status: "READY",
      timeZone,
      version: 2,
      weekEnd,
      weekStart,
    },
  ];
}

function createAiWeeklyReportWeek(store: UserWebApiMockStore, url: URL) {
  const weekStart = url.searchParams.get("weekStart") ?? "2026-07-20";
  const timeZone = url.searchParams.get("timeZone") ?? "Asia/Seoul";
  const includeFailed = url.searchParams.get("includeFailed") !== "false";
  const weekEnd = addDateOnlyDays(weekStart, 6);
  const matchingReports = store.aiWeeklyReports
    .filter(
      (report) =>
        stringField(report, "weekStart") === weekStart &&
        stringField(report, "timeZone") === timeZone,
    )
    .sort(compareAiWeeklyReportVersionDesc);
  const failedVersions = matchingReports.filter(
    (report) => stringField(report, "status") === "FAILED",
  );
  const versions = includeFailed
    ? matchingReports
    : matchingReports.filter((report) => stringField(report, "status") !== "FAILED");

  return {
    failedVersionCount: failedVersions.length,
    failedVersions: failedVersions.map(toAiWeeklyReportSummary),
    generatingReport:
      matchingReports
        .filter((report) => stringField(report, "status") === "GENERATING")
        .map(toAiWeeklyReportSummary)[0] ?? null,
    latestSuccessfulReport:
      matchingReports
        .filter((report) => stringField(report, "status") === "READY")
        .map(toAiWeeklyReportSummary)[0] ?? null,
    timeZone,
    versions: versions.map(toAiWeeklyReportSummary),
    weekEnd,
    weekStart,
  };
}

function createAiWeeklyReportGeneration(
  store: UserWebApiMockStore,
  body: unknown,
): MockApiResponse {
  const weekStart = stringField(body, "weekStart") ?? "2026-07-20";
  const timeZone = stringField(body, "timeZone") ?? "Asia/Seoul";
  const locale = stringField(body, "locale") ?? "ko-KR";
  const existingGeneratingReport = store.aiWeeklyReports.find(
    (report) =>
      stringField(report, "weekStart") === weekStart &&
      stringField(report, "timeZone") === timeZone &&
      stringField(report, "status") === "GENERATING",
  );

  if (existingGeneratingReport) {
    return json(
      {
        code: "AiWeeklySalesReportAlreadyGenerating",
        message: "AI weekly report generation is already running.",
        statusCode: 409,
      },
      409,
    );
  }

  const weekEnd = addDateOnlyDays(weekStart, 6);
  const version =
    store.aiWeeklyReports
      .filter(
        (report) =>
          stringField(report, "weekStart") === weekStart &&
          stringField(report, "timeZone") === timeZone,
      )
      .reduce(
        (maxVersion, report) =>
          Math.max(maxVersion, numberField(report, "version") ?? 0),
        0,
      ) + 1;
  const schedule = store.schedules[0];
  const deal = store.deals[0];
  const meetingNote = store.meetingNotes[0];
  const report = {
    dataCoverageJson: {
      dealCount: deal ? 1 : 0,
      linkedDealCount: deal ? 1 : 0,
      meetingNoteCount: meetingNote ? 1 : 0,
      missingSignals: [],
      scheduleCount: schedule ? 1 : 0,
    },
    failedAt: null,
    generatedAt: null,
    id: nextAiWeeklyReportUuid(store),
    inputSnapshotJson: createAiWeeklyInputSnapshot({
      deal,
      locale,
      meetingNote,
      schedule,
      timeZone,
      weekEnd,
      weekStart,
    }),
    locale,
    outputJson: null,
    requestedAt: now(),
    safeErrorCode: null,
    safeErrorMessage: null,
    status: "GENERATING",
    timeZone,
    version,
    weekEnd,
    weekStart,
  };

  store.aiWeeklyReports.unshift(report);

  return json(
    {
      job: {
        id: `ai-weekly-report-job-${report.id}`,
        status: "PENDING",
      },
      report: toAiWeeklyReportSummary(report),
    },
    202,
  );
}

function toAiWeeklyReportDetail(report: MutableRecord) {
  return {
    ...toAiWeeklyReportSummary(report),
    dataCoverage: nestedRecord(report.dataCoverageJson),
    safeErrorCode: stringField(report, "safeErrorCode"),
    safeErrorMessage: stringField(report, "safeErrorMessage"),
    sections:
      stringField(report, "status") === "READY"
        ? nestedRecord(report.outputJson)
        : null,
  };
}

function createAiWeeklyReportSnapshotSummary(report: MutableRecord) {
  const snapshot = nestedRecord(report.inputSnapshotJson);
  const schedules = toMutableRecords(snapshot.schedules);
  const deals = toMutableRecords(snapshot.deals);
  const meetingNotes = toMutableRecords(snapshot.meetingNotes);
  const counts = nestedRecord(snapshot.counts);

  return {
    capturedAt: stringField(snapshot, "capturedAt"),
    counts: {
      deals: numberField(counts, "deals") ?? deals.length,
      linkedDeals: numberField(counts, "linkedDeals") ?? 0,
      meetingNotes: numberField(counts, "meetingNotes") ?? meetingNotes.length,
      schedules: numberField(counts, "schedules") ?? schedules.length,
    },
    excluded: stringArrayField(snapshot, "excluded"),
    records: {
      deals: deals.map((deal) => ({
        companyCount: toMutableRecords(deal.companies).length,
        contactCount: toMutableRecords(deal.contacts).length,
        dealCost: numberField(deal, "dealCost") ?? 0,
        dealName: stringField(deal, "dealName"),
        dealStatus: stringField(deal, "dealStatus"),
        expectedEndDate: stringField(deal, "expectedEndDate"),
        id: stringField(deal, "id"),
        nextActionCount: toMutableRecords(deal.nextFollowingActions).length,
      })),
      meetingNotes: meetingNotes.map((meetingNote) => ({
        hasDetails: Boolean(stringField(meetingNote, "details")),
        hasNextPlan: Boolean(stringField(meetingNote, "nextPlan")),
        hasRequiredAction: Boolean(stringField(meetingNote, "requiredAction")),
        id: stringField(meetingNote, "id"),
        linkedDealCount: toMutableRecords(meetingNote.deals).length,
        meetingAt: stringField(meetingNote, "meetingAt"),
        sourceType: stringField(meetingNote, "sourceType"),
        title: stringField(meetingNote, "title"),
      })),
      schedules: schedules.map((schedule) => ({
        dealCount: toMutableRecords(schedule.deals).length,
        endAt: stringField(schedule, "endAt"),
        hasMemo: schedule.hasMemo === true,
        id: stringField(schedule, "id"),
        scheduleTitle: stringField(schedule, "scheduleTitle"),
        sourceType: stringField(schedule, "sourceType"),
        startAt: stringField(schedule, "startAt"),
      })),
    },
    reportId: stringField(report, "id") ?? "00000000-0000-4000-8000-000000000002",
    snapshotSchemaVersion:
      stringField(snapshot, "schemaVersion") ?? "ai-weekly-sales-report-input-v1",
  };
}

function toAiWeeklyReportSummary(report: MutableRecord) {
  return {
    failedAt: stringField(report, "failedAt"),
    generatedAt: stringField(report, "generatedAt"),
    id: stringField(report, "id") ?? "00000000-0000-4000-8000-000000000002",
    locale: stringField(report, "locale") ?? "ko-KR",
    requestedAt: stringField(report, "requestedAt") ?? NOW,
    safeErrorCode: stringField(report, "safeErrorCode"),
    safeErrorMessage: stringField(report, "safeErrorMessage"),
    status: stringField(report, "status") ?? "READY",
    summaryPreview: getAiWeeklyReportSummaryPreview(report),
    timeZone: stringField(report, "timeZone") ?? "Asia/Seoul",
    version: numberField(report, "version") ?? 1,
    weekEnd: stringField(report, "weekEnd") ?? "2026-07-26",
    weekStart: stringField(report, "weekStart") ?? "2026-07-20",
  };
}

// 기능 : E2E mock AI output에서 목록/상세 응답용 요약 미리보기를 추출합니다.
function getAiWeeklyReportSummaryPreview(report: MutableRecord) {
  if ((stringField(report, "status") ?? "READY") !== "READY") {
    return null;
  }

  const output = nestedRecord(report.outputJson);
  const executiveSummary = nestedRecord(output.executiveSummary);
  const summaryPreview =
    stringField(executiveSummary, "narrative") ??
    stringField(executiveSummary, "headline");

  if (!summaryPreview) {
    return null;
  }

  if (summaryPreview.length <= AI_WEEKLY_REPORT_SUMMARY_PREVIEW_MAX_LENGTH) {
    return summaryPreview;
  }

  return `${summaryPreview.slice(
    0,
    AI_WEEKLY_REPORT_SUMMARY_PREVIEW_MAX_LENGTH -
      AI_WEEKLY_REPORT_SUMMARY_PREVIEW_SUFFIX.length,
  )}${AI_WEEKLY_REPORT_SUMMARY_PREVIEW_SUFFIX}`;
}

function createAiWeeklyReportSections(
  deal: MutableRecord,
  meetingNote: MutableRecord,
) {
  const dealId = stringField(deal, "id") ?? "deal-mobile-001";
  const dealName = stringField(deal, "dealName") ?? "Mock deal";
  const meetingNoteId = stringField(meetingNote, "id") ?? "meeting-note-mobile-001";
  const meetingNoteTitle = stringField(meetingNote, "title") ?? "Mock meeting note";

  return {
    dataCleanupSuggestions: [
      {
        body: "일정, 딜, 회의록이 모두 연결되어 있는지 확인하면 다음 리포트 품질이 좋아집니다.",
        key: "cleanup-review-links",
        priority: "LOW",
        reason: "주간 리포트의 입력 데이터 품질 확인용 제안입니다.",
        targetId: null,
        targetLabel: null,
        targetPath: null,
        targetType: null,
        title: "연결 데이터 점검",
      },
    ],
    dataCoverage: {
      dealCount: 1,
      linkedDealCount: 1,
      meetingNoteCount: 1,
      missingSignals: [],
      scheduleCount: 1,
    },
    executiveSummary: {
      concerns: [],
      headline: "이번 주 영업 활동과 후속 액션이 연결되어 있습니다.",
      narrative:
        "일정, 딜, 회의록을 함께 검토했고 다음 주 확인할 액션을 하나로 정리했습니다.",
      wins: ["고객 일정과 딜이 연결되어 있습니다.", "회의록이 후속 연락 맥락을 제공합니다."],
    },
    followUpDrafts: [
      {
        body: "미팅에서 논의한 다음 단계를 정리해 공유하고, 필요한 자료를 이어서 전달하겠습니다.",
        key: `follow-up-${meetingNoteId}`,
        payload: {
          emailDraft:
            "미팅에서 논의한 다음 단계를 정리해 공유하고, 필요한 자료를 이어서 전달하겠습니다.",
          smsDraft: "미팅 후속 내용을 정리해 전달드리겠습니다.",
        },
        priority: "MEDIUM",
        reason: "회의록에 후속 진행 맥락이 포함되어 있습니다.",
        targetId: meetingNoteId,
        targetLabel: meetingNoteTitle,
        targetPath: `/meeting-notes/${meetingNoteId}`,
        targetType: "MEETING_NOTE",
        title: "후속 연락 초안",
      },
    ],
    nextWeekActions: [
      {
        body: `${dealName}의 다음 확인 일정을 잡고 진행 상태를 업데이트하세요.`,
        key: `next-week-${dealId}`,
        priority: "MEDIUM",
        reason: "활성 딜이 주간 스냅샷에 포함되어 있습니다.",
        targetId: dealId,
        targetLabel: dealName,
        targetPath: `/deals/${dealId}`,
        targetType: "DEAL",
        title: "다음 단계 확인",
      },
    ],
    pipelineSummary: {
      narrative: "검토 대상 딜의 금액과 상태를 기준으로 다음 주 액션을 정리했습니다.",
      statusCounts: [{ count: 1, status: stringField(deal, "dealStatus") ?? "INITIAL_CONTACT" }],
      totalDealCost: numberField(deal, "dealCost") ?? 0,
    },
    riskSignals: [
      {
        body: `${dealName}의 일정 이후 응답 지연 여부를 확인하세요.`,
        key: `risk-${dealId}`,
        priority: "HIGH",
        reason: "고객 접점 이후 후속 확인 시점이 중요합니다.",
        targetId: dealId,
        targetLabel: dealName,
        targetPath: `/deals/${dealId}`,
        targetType: "DEAL",
        title: "후속 타이밍 확인",
      },
    ],
  };
}

function createAiWeeklyInputSnapshot({
  deal,
  locale,
  meetingNote,
  schedule,
  timeZone,
  weekEnd,
  weekStart,
}: {
  readonly deal: MutableRecord | undefined;
  readonly locale: string;
  readonly meetingNote: MutableRecord | undefined;
  readonly schedule: MutableRecord | undefined;
  readonly timeZone: string;
  readonly weekEnd: string;
  readonly weekStart: string;
}) {
  const schedules = schedule
    ? [
        {
          deals: toMutableRecords(schedule.deals).map((item) => ({
            id: stringField(item, "id"),
          })),
          endAt: stringField(schedule, "endAt"),
          hasMemo: Boolean(stringField(schedule, "memo")),
          id: stringField(schedule, "id"),
          scheduleTitle: stringField(schedule, "scheduleTitle"),
          sourceType: stringField(schedule, "sourceType"),
          startAt: stringField(schedule, "startAt"),
        },
      ]
    : [];
  const deals = deal
    ? [
        {
          companies: toMutableRecords(deal.companies),
          contacts: toMutableRecords(deal.contacts),
          dealCost: numberField(deal, "dealCost") ?? 0,
          dealName: stringField(deal, "dealName"),
          dealStatus: stringField(deal, "dealStatus"),
          expectedEndDate: stringField(deal, "expectedEndDate"),
          id: stringField(deal, "id"),
          nextFollowingActions: nestedRecord(deal.nextFollowingAction).id
            ? [nestedRecord(deal.nextFollowingAction)]
            : [],
        },
      ]
    : [];
  const meetingNotes = meetingNote
    ? [
        {
          deals: toMutableRecords(meetingNote.deals),
          details: stringField(meetingNote, "details"),
          id: stringField(meetingNote, "id"),
          meetingAt: stringField(meetingNote, "meetingAt"),
          nextPlan: stringField(meetingNote, "nextPlan"),
          requiredAction: stringField(meetingNote, "requiredAction"),
          sourceType: stringField(meetingNote, "sourceType"),
          title: stringField(meetingNote, "title"),
        },
      ]
    : [];

  return {
    capturedAt: NOW,
    counts: {
      deals: deals.length,
      linkedDeals: deals.length,
      meetingNotes: meetingNotes.length,
      schedules: schedules.length,
    },
    deals,
    excluded: [],
    locale,
    meetingNotes,
    rangeEndAt: `${addDateOnlyDays(weekEnd, 1)}T00:00:00.000Z`,
    rangeStartAt: `${weekStart}T00:00:00.000Z`,
    schedules,
    schemaVersion: "ai-weekly-sales-report-input-v1",
    timeZone,
    weekEnd,
    weekStart,
  };
}

function requireAiWeeklyReport(
  store: UserWebApiMockStore,
  reportId: string | undefined,
) {
  const report = store.aiWeeklyReports.find(
    (candidate) => stringField(candidate, "id") === reportId,
  );

  if (!report) {
    return {
      code: "AiWeeklySalesReportNotFound",
      message: "AI weekly report not found",
      statusCode: 404,
    };
  }

  return report;
}

function compareAiWeeklyReportVersionDesc(
  first: MutableRecord,
  second: MutableRecord,
) {
  const firstVersion = numberField(first, "version") ?? 0;
  const secondVersion = numberField(second, "version") ?? 0;

  if (firstVersion !== secondVersion) {
    return secondVersion - firstVersion;
  }

  return (
    getAiWeeklyReportTime(second) -
    getAiWeeklyReportTime(first)
  );
}

function getAiWeeklyReportTime(report: MutableRecord) {
  const value =
    stringField(report, "generatedAt") ??
    stringField(report, "failedAt") ??
    stringField(report, "requestedAt") ??
    NOW;
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : 0;
}

function nextAiWeeklyReportUuid(store: UserWebApiMockStore) {
  store.counters["ai-weekly-report"] =
    (store.counters["ai-weekly-report"] ?? 0) + 1;

  return `00000000-0000-4000-8000-${String(
    store.counters["ai-weekly-report"],
  ).padStart(12, "0")}`;
}

function toMutableRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function addDateOnlyDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + days);

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
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

function toDealListItem(store: UserWebApiMockStore, deal: MutableRecord) {
  const dealId = stringField(deal, "id") ?? "deal-mobile-001";

  return {
    companies: Array.isArray(deal.companies) ? deal.companies : [],
    contacts: Array.isArray(deal.contacts) ? deal.contacts : [],
    createdAt: stringField(deal, "createdAt") ?? NOW,
    dealCost: numberField(deal, "dealCost") ?? 0,
    dealName: stringField(deal, "dealName") ?? "",
    dealStatus: stringField(deal, "dealStatus") ?? "INITIAL_CONTACT",
    dealStatusLabel: stringField(deal, "dealStatusLabel") ?? DEAL_STATUS_LABEL.INITIAL_CONTACT,
    expectedEndDate: stringField(deal, "expectedEndDate") ?? "2026-08-31",
    id: dealId,
    latestActivity: toDealLatestActivitySummary(store, dealId),
    latestFollowingAction: deal.latestFollowingAction ?? null,
    nextFollowingAction: deal.nextFollowingAction ?? null,
    products: Array.isArray(deal.products)
      ? deal.products.filter(isRecord).map(toDealProductSummary)
      : [],
    updatedAt: stringField(deal, "updatedAt") ?? NOW,
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

function nullableNestedRecord(value: unknown): MutableRecord | null {
  return isRecord(value) ? value : null;
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
  return `${prefix}-mobile-${String(store.counters[prefix]).padStart(3, "0")}`;
}

function now() {
  return new Date(NOW).toISOString();
}
