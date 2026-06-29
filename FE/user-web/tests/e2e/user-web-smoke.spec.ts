import {
  expect,
  test,
  type Locator,
  type Page,
  type Route,
} from "@playwright/test";

const COMPANY_NAME = "스모크상사";
const CONTACT_NAME = "김스모크";
const PRODUCT_NAME = "MVP 패키지";
const DEAL_TITLE = "스모크 MVP 딜";
const SCHEDULE_TITLE = "스모크 미팅 일정";
const MEETING_TITLE = "스모크 미팅 회의록";
const MEETING_DETAILS = "MVP 도입 일정과 검토 범위를 합의했다.";
const MOCK_ACCESS_TOKEN = "Bearer mock-user-web-access-token";

type DealStatus =
  | "INITIAL_CONTACT"
  | "NEEDS_CHECK"
  | "PROPOSAL_QUOTE"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  INITIAL_CONTACT: "초기 접촉",
  NEEDS_CHECK: "니즈 확인",
  PROPOSAL_QUOTE: "제안/견적",
  NEGOTIATION: "협상",
  WON: "성사",
  LOST: "실패",
};

const DEAL_STATUS_LIST: DealStatus[] = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
];

type CompanyField = {
  readonly id: string;
  readonly field: string;
};

type CompanyRegion = {
  readonly id: string;
  readonly region: string;
};

type Company = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
  readonly contactCount: number;
  readonly dealCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ContactDepartment = {
  readonly id: string;
  readonly departmentName: string;
};

type ContactJobGrade = {
  readonly id: string;
  readonly jobGradeName: string;
};

type Contact = {
  readonly id: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: ContactDepartment;
  readonly contactJobGrade: ContactJobGrade;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProductCategory = {
  readonly id: string;
  readonly categoryName: string;
};

type ProductStatus = {
  readonly id: string;
  readonly statusName: string;
};

type Product = {
  readonly id: string;
  readonly productName: string;
  readonly productCategory: ProductCategory;
  readonly productStatus: ProductStatus;
  readonly productPrice: number;
  readonly dealCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type DealCompany = {
  readonly id: string;
  readonly companyName: string;
  readonly isDeleted: boolean;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
};

type DealContact = {
  readonly id: string;
  readonly username: string;
  readonly isDeleted: boolean;
  readonly companyId: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
    readonly isDeleted: boolean;
  };
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: ContactDepartment;
  readonly contactJobGrade: ContactJobGrade;
  readonly label: string;
};

type DealProduct = {
  readonly id: string;
  readonly productName: string;
  readonly isDeleted: boolean;
  readonly productPrice: number;
  readonly productCategory: ProductCategory;
  readonly productStatus: ProductStatus;
};

type DealFollowingAction = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
};

type Deal = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: DealStatus;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: DealCompany[];
  readonly contacts: DealContact[];
  readonly products: DealProduct[];
  readonly latestFollowingAction: DealFollowingAction | null;
  readonly nextFollowingAction: (DealFollowingAction & {
    readonly remainingCount: number;
  }) | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Schedule = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
  readonly deals: readonly { readonly id: string; readonly dealName: string }[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

type MeetingNoteSummary = {
  readonly label: string;
  readonly count: number;
};

type MeetingNoteCompany = {
  readonly id: string;
  readonly companyId: string | null;
  readonly isDeleted: boolean;
  readonly companyNameSnapshot: string;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
  readonly createdAt: string;
};

type MeetingNoteContact = {
  readonly id: string;
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly isDeleted: boolean;
  readonly contactUsernameSnapshot: string;
  readonly contactEmailSnapshot: string | null;
  readonly contactMobileSnapshot: string | null;
  readonly companyNameSnapshot: string | null;
  readonly departmentSnapshot: string | null;
  readonly jobGradeSnapshot: string | null;
  readonly createdAt: string;
};

type MeetingNoteProduct = {
  readonly id: string;
  readonly productId: string | null;
  readonly isDeleted: boolean;
  readonly productNameSnapshot: string;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
  readonly createdAt: string;
};

type MeetingNoteDeal = {
  readonly id: string;
  readonly dealId: string;
  readonly isDeleted: boolean;
  readonly dealNameSnapshot: string;
  readonly dealStatusSnapshot: string;
  readonly dealCostSnapshot: number;
  readonly dealExpectedEndDateSnapshot: string;
  readonly createdAt: string;
};

type MeetingNote = {
  readonly id: string;
  readonly sourceType: "MANUAL" | "TEXT_AI" | "STT_AI";
  readonly title: string;
  readonly meetingAt: string | null;
  readonly meetingLocalDateTime: string | null;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: MeetingNoteCompany[];
  readonly contacts: MeetingNoteContact[];
  readonly products: MeetingNoteProduct[];
  readonly deals: MeetingNoteDeal[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

type CreateCompanyBody = {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
  readonly companyMemo?: string;
};

type CreateContactBody = {
  readonly username?: string;
  readonly mobile?: string;
  readonly email?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
  readonly contactMemo?: string;
};

type CreateProductBody = {
  readonly productName?: string;
  readonly productPrice?: number;
  readonly productCategoryId?: string;
  readonly productStatusId?: string;
  readonly productMemo?: string;
};

type CreateDealBody = {
  readonly dealName?: string;
  readonly dealCost?: number;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly productIds?: readonly string[];
  readonly dealStatus?: DealStatus;
  readonly followingAction?: string;
  readonly expectedEndDate?: string;
  readonly dealMemo?: string;
};

type CreateScheduleBody = {
  readonly scheduleTitle?: string;
  readonly startAt?: string;
  readonly endAt?: string;
  readonly timeZone?: string;
  readonly location?: string | null;
  readonly memo?: string | null;
  readonly dealIds?: readonly string[];
};

type CreateMeetingNoteBody = {
  readonly sourceType?: "MANUAL" | "TEXT_AI" | "STT_AI";
  readonly title?: string;
  readonly meetingLocalDateTime?: string;
  readonly details?: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly companies?: readonly string[];
  readonly contacts?: readonly string[];
  readonly products?: readonly string[];
  readonly deals?: readonly string[];
};

type LinkMeetingNoteDealsBody = {
  readonly deals?: readonly string[];
};

type SmokeStore = {
  companies: Company[];
  companyFields: CompanyField[];
  companyRegions: CompanyRegion[];
  contacts: Contact[];
  contactDepartments: ContactDepartment[];
  contactJobGrades: ContactJobGrade[];
  products: Product[];
  productCategories: ProductCategory[];
  productStatuses: ProductStatus[];
  deals: Deal[];
  schedules: Schedule[];
  meetingNotes: MeetingNote[];
  sequence: number;
};

type ApiRequestRecord = {
  readonly method: string;
  readonly path: string;
  readonly authorization: string | null;
};

type MockApiResponse = {
  readonly body: unknown;
  readonly status?: number;
};

test.describe("User Web smoke E2E", () => {
  test("mock login부터 회의록 저장까지 핵심 업무 흐름이 이어진다", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);

    await test.step("로그인 보호 라우트와 mock login", async () => {
      await page.goto("/companies");
      await expect(page).toHaveURL(/\/login$/);
      await page
        .getByRole("button", { name: "개발용 mock 세션으로 입장" })
        .click();
      await expect(page).toHaveURL(/\/companies$/);
      await expect(
        page.getByRole("button", { name: "회사 추가" }).first()
      ).toBeVisible();
    });

    await test.step("회사 생성", async () => {
      await page.getByRole("button", { name: "회사 추가" }).first().click();
      const dialog = getDialog(page, "회사 추가");

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("회사명").fill(COMPANY_NAME);
      await selectManagedOption(dialog, "분야명", "B2C SaaS");
      await selectManagedOption(dialog, "지역명", "서울");
      await dialog.getByLabel("메모").fill("G34 smoke 회사 fixture");
      await dialog.getByRole("button", { name: "저장" }).click();

      await expect(dialog).toBeHidden();
      await expectAndCloseNotice(page, "회사가 추가되었습니다.");
      await expect(page.getByText(COMPANY_NAME).first()).toBeVisible();
    });

    await test.step("담당자 생성", async () => {
      await goToNav(page, "담당자");
      await expect(
        page.getByRole("button", { name: "담당자 추가" }).first()
      ).toBeVisible();
      await page.getByRole("button", { name: "담당자 추가" }).first().click();
      const dialog = getDialog(page, "담당자 추가");

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("이름").fill(CONTACT_NAME);
      await dialog.getByLabel("휴대폰번호").fill("010-1234-5678");
      await dialog.getByLabel("이메일").fill("smoke@example.com");
      await selectSearchOption(dialog, "회사", COMPANY_NAME);
      await selectManagedOption(dialog, "부서명", "구매팀");
      await selectManagedOption(dialog, "직급명", "팀장");
      await dialog.getByLabel("메모").fill("G34 smoke 담당자 fixture");
      await dialog.getByRole("button", { name: "저장" }).click();

      await expect(dialog).toBeHidden();
      await expectAndCloseNotice(page, "담당자가 추가되었습니다.");
      await expect(page.getByText(CONTACT_NAME).first()).toBeVisible();
    });

    await test.step("제품 생성", async () => {
      await goToNav(page, "제품");
      await expect(
        page.getByRole("button", { name: "제품 추가" }).first()
      ).toBeVisible();
      await page.getByRole("button", { name: "제품 추가" }).first().click();
      const dialog = getDialog(page, "제품 추가");

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("제품명").fill(PRODUCT_NAME);
      await dialog.getByLabel("단가").fill("390000");
      await selectManagedOption(dialog, "카테고리명", "Starter");
      await selectManagedOption(dialog, "상태명", "판매중");
      await dialog.getByLabel("메모").fill("G34 smoke 제품 fixture");
      await dialog.getByRole("button", { name: "제품 추가" }).click();

      await expect(dialog).toBeHidden();
      await expectAndCloseNotice(page, "제품이 추가되었습니다.");
      await expect(page.getByText(PRODUCT_NAME).first()).toBeVisible();
    });

    await test.step("딜 생성", async () => {
      await goToNav(page, "딜");
      await expect(
        page.getByRole("button", { name: "딜 추가" }).first()
      ).toBeVisible();
      await page.getByRole("button", { name: "딜 추가" }).first().click();
      const dialog = getDialog(page, "딜 추가");

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("딜명").fill(DEAL_TITLE);
      await dialog.getByLabel("금액").fill("1200000");
      await selectSearchOption(dialog, "회사", COMPANY_NAME);
      await selectSearchOption(dialog, "담당자", CONTACT_NAME);
      await dialog.getByPlaceholder("제품명 검색").fill(PRODUCT_NAME);
      await dialog
        .getByRole("button", { name: new RegExp(PRODUCT_NAME) })
        .first()
        .click();
      await dialog.getByLabel("예상 마감일").fill("2026-07-31");
      await dialog.getByLabel("다음 행동", { exact: true }).fill("도입 제안서 발송");
      await dialog.getByLabel("메모").fill("G34 smoke 딜 fixture");
      await dialog.getByRole("button", { name: "저장" }).click();

      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(/\/deals\/deal-/);
    });

    await test.step("일정 생성", async () => {
      await goToNav(page, "일정");
      await expect(
        page.getByRole("button", { name: "일정 생성" }).last()
      ).toBeVisible();
      await page.getByRole("button", { name: "일정 생성" }).last().click();
      const dialog = page
        .getByRole("dialog")
        .filter({ hasText: "일정 생성" })
        .first();

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("제목").fill(SCHEDULE_TITLE);
      await dialog.getByLabel("시작일시").fill("2026-07-01T10:00");
      await dialog.getByLabel("종료일시").fill("2026-07-01T11:00");
      await dialog.getByLabel("장소").fill("온라인");
      await dialog.getByLabel("연결 딜").fill(DEAL_TITLE);
      await dialog.getByRole("button", { name: new RegExp(DEAL_TITLE) }).click();
      await dialog.getByLabel("메모").fill("G34 smoke 일정 fixture");
      await dialog.getByRole("button", { name: "저장" }).click();

      await expect(dialog).toBeHidden();
      await expectAndCloseNotice(
        page,
        `${SCHEDULE_TITLE} 일정이 생성되었습니다.`
      );
      await expect(page.getByText(SCHEDULE_TITLE).first()).toBeVisible();
    });

    await test.step("회의록 저장과 딜 연결", async () => {
      await goToNav(page, "회의록");
      await expect(
        page.getByRole("button", { name: "회의록 추가" }).first()
      ).toBeVisible();
      await page.getByRole("button", { name: "회의록 추가" }).first().click();
      const dialog = getDialog(page, "회의록 추가");

      await expect(dialog).toBeVisible();
      await dialog.getByLabel("회의록 제목").fill(MEETING_TITLE);
      await selectEntityOption(dialog, "회사", COMPANY_NAME);
      await selectEntityOption(dialog, "담당자", CONTACT_NAME);
      await selectEntityOption(dialog, "제품(옵션)", PRODUCT_NAME);
      await selectEntityOption(dialog, "딜(옵션)", DEAL_TITLE);
      await dialog.getByLabel("원문 메모").fill("고객은 다음 주 제안서를 요청했다.");
      await dialog.getByLabel("상세 내용").fill(MEETING_DETAILS);
      await dialog.getByLabel("다음 계획").fill("제안서 발송 후 예산 확인");
      await dialog.getByLabel("필요 액션").fill("제안서와 견적서 준비");
      await dialog.getByRole("button", { name: "회의록 추가" }).click();

      await expect(dialog).toBeHidden();
      await expectAndCloseNotice(page, "회의록이 추가되었습니다.");
      await expect(page.getByText(MEETING_TITLE).first()).toBeVisible();
    });

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

async function setupUserWebApiMocks(page: Page) {
  const store = createStore();
  const requests: ApiRequestRecord[] = [];

  await page.route(isBackendApiRequest, async (route) => {
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

    const response = await handleApiRequest(store, route, method, url);
    await fulfillJson(route, response.body, response.status ?? 200);
  });

  return {
    protectedRequestsWithoutAuthorization: () =>
      requests.filter(
        (request) =>
          !isPublicApiRequest(request) &&
          request.authorization !== MOCK_ACCESS_TOKEN
      ),
  };
}

function isBackendApiRequest(url: URL) {
  return url.pathname.startsWith("/api/");
}

function isPublicApiRequest(request: ApiRequestRecord) {
  return request.method === "GET" && request.path === "/api/auth/providers";
}

async function handleApiRequest(
  store: SmokeStore,
  route: Route,
  method: string,
  url: URL
): Promise<MockApiResponse> {
  const path = url.pathname;

  if (path === "/api/search" && method === "GET") {
    return json({ groups: [] });
  }

  if (path === "/api/auth/providers" && method === "GET") {
    return json({
      providers: [
        { provider: "kakao", label: "Kakao", enabled: true },
        { provider: "naver", label: "Naver", enabled: true },
        { provider: "google", label: "Google", enabled: true },
      ],
    });
  }

  if (path === "/api/company-fields" && method === "GET") {
    return json({ items: store.companyFields });
  }

  if (path === "/api/company-fields" && method === "POST") {
    const input = await readBody<{ readonly field?: string }>(route);
    store.companyFields.push({
      id: nextId(store, "company-field"),
      field: input.field ?? "신규 분야",
    });
    return json(null, 204);
  }

  if (path === "/api/company-regions" && method === "GET") {
    return json({ items: store.companyRegions });
  }

  if (path === "/api/company-regions" && method === "POST") {
    const input = await readBody<{ readonly region?: string }>(route);
    store.companyRegions.push({
      id: nextId(store, "company-region"),
      region: input.region ?? "신규 지역",
    });
    return json(null, 204);
  }

  if (path === "/api/companies" && method === "GET") {
    return json(paginated(filterCompanies(store.companies, url), url));
  }

  if (path === "/api/companies" && method === "POST") {
    const input = await readBody<CreateCompanyBody>(route);
    store.companies.push(createCompany(store, input));
    return json(null, 204);
  }

  if (path === "/api/contacts/company-options" && method === "GET") {
    return json({
      items: store.companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
      })),
    });
  }

  if (path === "/api/contact-departments" && method === "GET") {
    return json({ items: store.contactDepartments });
  }

  if (path === "/api/contact-departments" && method === "POST") {
    const input = await readBody<{ readonly departmentName?: string }>(route);
    store.contactDepartments.push({
      id: nextId(store, "contact-department"),
      departmentName: input.departmentName ?? "신규 부서",
    });
    return json(null, 204);
  }

  if (path === "/api/contact-job-grades" && method === "GET") {
    return json({ items: store.contactJobGrades });
  }

  if (path === "/api/contact-job-grades" && method === "POST") {
    const input = await readBody<{ readonly jobGradeName?: string }>(route);
    store.contactJobGrades.push({
      id: nextId(store, "contact-job-grade"),
      jobGradeName: input.jobGradeName ?? "신규 직급",
    });
    return json(null, 204);
  }

  if (path === "/api/contacts" && method === "GET") {
    return json(paginated(filterContacts(store.contacts, url), url));
  }

  if (path === "/api/contacts" && method === "POST") {
    const input = await readBody<CreateContactBody>(route);
    store.contacts.push(createContact(store, input));
    store.companies = store.companies.map((company) =>
      company.id === input.companyId
        ? { ...company, contactCount: company.contactCount + 1 }
        : company
    );
    return json(null, 204);
  }

  if (path === "/api/product-categories" && method === "GET") {
    return json({ items: store.productCategories });
  }

  if (path === "/api/product-categories" && method === "POST") {
    const input = await readBody<{ readonly categoryName?: string }>(route);
    store.productCategories.push({
      id: nextId(store, "product-category"),
      categoryName: input.categoryName ?? "신규 카테고리",
    });
    return json(null, 204);
  }

  if (path === "/api/product-statuses" && method === "GET") {
    return json({ items: store.productStatuses });
  }

  if (path === "/api/product-statuses" && method === "POST") {
    const input = await readBody<{ readonly statusName?: string }>(route);
    store.productStatuses.push({
      id: nextId(store, "product-status"),
      statusName: input.statusName ?? "신규 상태",
    });
    return json(null, 204);
  }

  if (path === "/api/products" && method === "GET") {
    return json(paginated(filterProducts(store.products, url), url));
  }

  if (path === "/api/products" && method === "POST") {
    const input = await readBody<CreateProductBody>(route);
    store.products.push(createProduct(store, input));
    return json(null, 204);
  }

  if (path === "/api/deals/company-options" && method === "GET") {
    return json({ items: store.companies.map(toDealCompany) });
  }

  if (path === "/api/deals/contact-options" && method === "GET") {
    return json({ items: store.contacts.map(toDealContact) });
  }

  if (path === "/api/deals/product-options" && method === "GET") {
    return json({ items: store.products.map(toDealProduct) });
  }

  if (path === "/api/deals/stage-counts" && method === "GET") {
    return json({ items: toStageCounts(store.deals) });
  }

  if (path === "/api/deals" && method === "GET") {
    return json(paginated(filterDeals(store.deals, url), url));
  }

  if (path === "/api/deals" && method === "POST") {
    const input = await readBody<CreateDealBody>(route);
    const deal = createDeal(store, input);
    store.deals.push(deal);
    incrementDealCounts(store, deal);
    return json(deal);
  }

  const dealDetailMatch = path.match(/^\/api\/deals\/([^/]+)$/);

  if (dealDetailMatch && method === "GET") {
    return json(requireDeal(store, decodeURIComponent(dealDetailMatch[1] ?? "")));
  }

  if (path === "/api/schedules/deal-options" && method === "GET") {
    return json({
      items: store.deals.map((deal) => ({
        id: deal.id,
        dealName: deal.dealName,
        createdAt: deal.createdAt,
      })),
    });
  }

  if (path === "/api/schedules" && method === "GET") {
    return json({ items: store.schedules });
  }

  if (path === "/api/schedules" && method === "POST") {
    const input = await readBody<CreateScheduleBody>(route);
    const schedule = createSchedule(store, input);
    store.schedules.push(schedule);
    return json(schedule);
  }

  const scheduleDetailMatch = path.match(/^\/api\/schedules\/([^/]+)$/);

  if (scheduleDetailMatch && method === "GET") {
    return json(
      requireSchedule(store, decodeURIComponent(scheduleDetailMatch[1] ?? ""))
    );
  }

  if (path === "/api/meeting-notes/filter-companies" && method === "GET") {
    return json({
      items: store.companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
        createdAt: company.createdAt,
      })),
    });
  }

  if (path === "/api/meeting-notes/filter-contacts" && method === "GET") {
    return json({
      items: store.contacts.map((contact) => ({
        id: contact.id,
        companyId: contact.company.id,
        contactUsername: contact.username,
        createdAt: contact.createdAt,
      })),
    });
  }

  if (path === "/api/meeting-notes" && method === "GET") {
    return json(paginated(filterMeetingNotes(store.meetingNotes, url), url));
  }

  if (path === "/api/meeting-notes" && method === "POST") {
    const input = await readBody<CreateMeetingNoteBody>(route);
    const meetingNote = createMeetingNote(store, input);
    store.meetingNotes.push(meetingNote);
    return json(meetingNote);
  }

  const meetingNoteDealsMatch = path.match(/^\/api\/meeting-notes\/([^/]+)\/deals$/);

  if (meetingNoteDealsMatch && method === "POST") {
    const meetingNoteId = decodeURIComponent(meetingNoteDealsMatch[1] ?? "");
    const input = await readBody<LinkMeetingNoteDealsBody>(route);
    const meetingNote = requireMeetingNote(store, meetingNoteId);
    const linked = {
      ...meetingNote,
      deals: (input.deals ?? []).map((dealId) =>
        toMeetingNoteDeal(requireDeal(store, dealId), meetingNote.id)
      ),
      updatedAt: now(),
    };
    replaceMeetingNote(store, linked);
    return json(linked);
  }

  const meetingNoteDetailMatch = path.match(/^\/api\/meeting-notes\/([^/]+)$/);

  if (meetingNoteDetailMatch && method === "GET") {
    return json(
      requireMeetingNote(
        store,
        decodeURIComponent(meetingNoteDetailMatch[1] ?? "")
      )
    );
  }

  return json(
    {
      error: "MockRouteNotFound",
      message: `${method} ${path} mock이 없습니다.`,
    },
    404
  );
}

function createStore(): SmokeStore {
  return {
    companies: [],
    companyFields: [{ id: "company-field-1", field: "B2C SaaS" }],
    companyRegions: [{ id: "company-region-1", region: "서울" }],
    contacts: [],
    contactDepartments: [{ id: "contact-department-1", departmentName: "구매팀" }],
    contactJobGrades: [{ id: "contact-job-grade-1", jobGradeName: "팀장" }],
    products: [],
    productCategories: [{ id: "product-category-1", categoryName: "Starter" }],
    productStatuses: [{ id: "product-status-1", statusName: "판매중" }],
    deals: [],
    schedules: [],
    meetingNotes: [],
    sequence: 1,
  };
}

function createCompany(store: SmokeStore, input: CreateCompanyBody): Company {
  const timestamp = now();
  const companyField = requireCompanyField(store, input.companyFieldId);
  const companyRegion = requireCompanyRegion(store, input.companyRegionId);

  return {
    id: nextId(store, "company"),
    companyName: input.companyName ?? COMPANY_NAME,
    companyField,
    companyRegion,
    contactCount: 0,
    dealCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createContact(store: SmokeStore, input: CreateContactBody): Contact {
  const timestamp = now();
  const company = requireCompany(store, input.companyId);
  const contactDepartment = requireContactDepartment(
    store,
    input.contactDepartmentId
  );
  const contactJobGrade = requireContactJobGrade(store, input.contactJobGradeId);

  return {
    id: nextId(store, "contact"),
    company: {
      id: company.id,
      companyName: company.companyName,
    },
    username: input.username ?? CONTACT_NAME,
    mobile: input.mobile ?? "010-1234-5678",
    email: input.email ?? "smoke@example.com",
    contactDepartment,
    contactJobGrade,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createProduct(store: SmokeStore, input: CreateProductBody): Product {
  const timestamp = now();
  const productCategory = requireProductCategory(store, input.productCategoryId);
  const productStatus = requireProductStatus(store, input.productStatusId);

  return {
    id: nextId(store, "product"),
    productName: input.productName ?? PRODUCT_NAME,
    productCategory,
    productStatus,
    productPrice: Number(input.productPrice ?? 0),
    dealCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createDeal(store: SmokeStore, input: CreateDealBody): Deal {
  const timestamp = now();
  const dealStatus = input.dealStatus ?? "INITIAL_CONTACT";
  const followingAction = input.followingAction?.trim();

  return {
    id: nextId(store, "deal"),
    dealName: input.dealName ?? DEAL_TITLE,
    dealCost: Number(input.dealCost ?? 0),
    dealStatus,
    dealStatusLabel: DEAL_STATUS_LABEL[dealStatus],
    expectedEndDate: input.expectedEndDate ?? "2026-07-31",
    companies: (input.companyIds ?? []).map((companyId) =>
      toDealCompany(requireCompany(store, companyId))
    ),
    contacts: (input.contactIds ?? []).map((contactId) =>
      toDealContact(requireContact(store, contactId))
    ),
    products: (input.productIds ?? []).map((productId) =>
      toDealProduct(requireProduct(store, productId))
    ),
    latestFollowingAction: followingAction
      ? {
          id: nextId(store, "following-action"),
          followingAction,
          checkComplete: false,
          createdAt: timestamp,
        }
      : null,
    nextFollowingAction: followingAction
      ? {
          id: nextId(store, "next-following-action"),
          followingAction,
          checkComplete: false,
          createdAt: timestamp,
          remainingCount: 0,
        }
      : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createSchedule(store: SmokeStore, input: CreateScheduleBody): Schedule {
  const timestamp = now();
  const deals = (input.dealIds ?? []).map((dealId) => {
    const deal = requireDeal(store, dealId);

    return {
      id: deal.id,
      dealName: deal.dealName,
    };
  });

  return {
    id: nextId(store, "schedule"),
    scheduleTitle: input.scheduleTitle ?? SCHEDULE_TITLE,
    startAt: input.startAt ?? "2026-07-01T10:00",
    endAt: input.endAt ?? "2026-07-01T11:00",
    timeZone: input.timeZone ?? "Asia/Seoul",
    location: input.location ?? null,
    memo: input.memo ?? null,
    deals,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createMeetingNote(
  store: SmokeStore,
  input: CreateMeetingNoteBody
): MeetingNote {
  const timestamp = now();
  const id = nextId(store, "meeting-note");
  const companies = (input.companies ?? []).map((companyId) =>
    toMeetingNoteCompany(requireCompany(store, companyId), id)
  );
  const contacts = (input.contacts ?? []).map((contactId) =>
    toMeetingNoteContact(requireContact(store, contactId), id)
  );
  const products = (input.products ?? []).map((productId) =>
    toMeetingNoteProduct(requireProduct(store, productId), id)
  );
  const deals = (input.deals ?? []).map((dealId) =>
    toMeetingNoteDeal(requireDeal(store, dealId), id)
  );

  return {
    id,
    sourceType: input.sourceType ?? "MANUAL",
    title: input.title ?? MEETING_TITLE,
    meetingAt: input.meetingLocalDateTime ?? timestamp,
    meetingLocalDateTime: input.meetingLocalDateTime ?? timestamp.slice(0, 16),
    timeZone: "Asia/Seoul",
    details: input.details ?? MEETING_DETAILS,
    nextPlan: input.nextPlan ?? null,
    requiredAction: input.requiredAction ?? null,
    companies,
    contacts,
    products,
    deals,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function filterCompanies(companies: readonly Company[], url: URL) {
  const companyName = url.searchParams.get("companyName");
  const fieldIds = getSearchParamValues(url, "companyFieldIds");
  const regionIds = getSearchParamValues(url, "companyRegionIds");

  return companies.filter(
    (company) =>
      matchesSearch([company.companyName], companyName) &&
      matchesAny(company.companyField.id, [
        url.searchParams.get("companyFieldId"),
        ...fieldIds,
      ]) &&
      matchesAny(company.companyRegion.id, [
        url.searchParams.get("companyRegionId"),
        ...regionIds,
      ])
  );
}

function filterContacts(contacts: readonly Contact[], url: URL) {
  const username = url.searchParams.get("username");
  const companyIds = [
    url.searchParams.get("companyId"),
    ...getSearchParamValues(url, "companyIds"),
  ];

  return contacts.filter(
    (contact) =>
      matchesSearch([contact.username], username) &&
      matchesAny(contact.company.id, companyIds) &&
      matchesAny(contact.contactDepartment.id, [
        url.searchParams.get("contactDepartmentId"),
      ]) &&
      matchesAny(contact.contactJobGrade.id, [
        url.searchParams.get("contactJobGradeId"),
      ])
  );
}

function filterProducts(products: readonly Product[], url: URL) {
  const productName = url.searchParams.get("productName");

  return products.filter(
    (product) =>
      matchesSearch([product.productName], productName) &&
      matchesAny(product.productCategory.id, [
        url.searchParams.get("productCategoryId"),
        ...getSearchParamValues(url, "productCategoryIds"),
      ]) &&
      matchesAny(product.productStatus.id, [
        url.searchParams.get("productStatusId"),
        ...getSearchParamValues(url, "productStatusIds"),
      ])
  );
}

function filterDeals(deals: readonly Deal[], url: URL) {
  const search = url.searchParams.get("search");
  const dealStatus = url.searchParams.get("dealStatus") as DealStatus | null;
  const companyIds = getSearchParamValues(url, "companyIds");
  const contactIds = getSearchParamValues(url, "contactIds");

  return deals.filter(
    (deal) =>
      matchesSearch(
        [
          deal.dealName,
          ...deal.companies.map((company) => company.companyName),
          ...deal.contacts.map((contact) => contact.username),
        ],
        search
      ) &&
      (!dealStatus || deal.dealStatus === dealStatus) &&
      matchesOneOf(
        deal.companies.map((company) => company.id),
        companyIds
      ) &&
      matchesOneOf(
        deal.contacts.map((contact) => contact.id),
        contactIds
      )
  );
}

function filterMeetingNotes(meetingNotes: readonly MeetingNote[], url: URL) {
  const search = url.searchParams.get("search");
  const companyIds = getSearchParamValues(url, "companyIds");
  const contactIds = getSearchParamValues(url, "contactIds");

  return meetingNotes.filter(
    (meetingNote) =>
      matchesSearch(
        [
          meetingNote.title,
          meetingNote.details,
          ...meetingNote.companies.map((company) => company.companyNameSnapshot),
          ...meetingNote.contacts.map((contact) => contact.contactUsernameSnapshot),
          ...meetingNote.products.map((product) => product.productNameSnapshot),
          ...meetingNote.deals.map((deal) => deal.dealNameSnapshot),
        ],
        search
      ) &&
      matchesOneOf(
        meetingNote.companies
          .map((company) => company.companyId)
          .filter(isNonNullable),
        companyIds
      ) &&
      matchesOneOf(
        meetingNote.contacts
          .map((contact) => contact.contactId)
          .filter(isNonNullable),
        contactIds
      )
  );
}

function toDealCompany(company: Company): DealCompany {
  return {
    id: company.id,
    companyName: company.companyName,
    isDeleted: false,
    companyField: company.companyField,
    companyRegion: company.companyRegion,
  };
}

function toDealContact(contact: Contact): DealContact {
  return {
    id: contact.id,
    username: contact.username,
    isDeleted: false,
    companyId: contact.company.id,
    company: {
      id: contact.company.id,
      companyName: contact.company.companyName,
      isDeleted: false,
    },
    mobile: contact.mobile,
    email: contact.email,
    contactDepartment: contact.contactDepartment,
    contactJobGrade: contact.contactJobGrade,
    label: `${contact.username} · ${contact.company.companyName}`,
  };
}

function toDealProduct(product: Product): DealProduct {
  return {
    id: product.id,
    productName: product.productName,
    isDeleted: false,
    productPrice: product.productPrice,
    productCategory: product.productCategory,
    productStatus: product.productStatus,
  };
}

function toMeetingNoteCompany(
  company: Company,
  meetingNoteId: string
): MeetingNoteCompany {
  return {
    id: `${meetingNoteId}-company-${company.id}`,
    companyId: company.id,
    isDeleted: false,
    companyNameSnapshot: company.companyName,
    companyFieldSnapshot: company.companyField.field,
    companyRegionSnapshot: company.companyRegion.region,
    createdAt: now(),
  };
}

function toMeetingNoteContact(
  contact: Contact,
  meetingNoteId: string
): MeetingNoteContact {
  return {
    id: `${meetingNoteId}-contact-${contact.id}`,
    contactId: contact.id,
    companyId: contact.company.id,
    isDeleted: false,
    contactUsernameSnapshot: contact.username,
    contactEmailSnapshot: contact.email,
    contactMobileSnapshot: contact.mobile,
    companyNameSnapshot: contact.company.companyName,
    departmentSnapshot: contact.contactDepartment.departmentName,
    jobGradeSnapshot: contact.contactJobGrade.jobGradeName,
    createdAt: now(),
  };
}

function toMeetingNoteProduct(
  product: Product,
  meetingNoteId: string
): MeetingNoteProduct {
  return {
    id: `${meetingNoteId}-product-${product.id}`,
    productId: product.id,
    isDeleted: false,
    productNameSnapshot: product.productName,
    productPriceSnapshot: product.productPrice,
    productCategorySnapshot: product.productCategory.categoryName,
    productStatusSnapshot: product.productStatus.statusName,
    createdAt: now(),
  };
}

function toMeetingNoteDeal(deal: Deal, meetingNoteId: string): MeetingNoteDeal {
  return {
    id: `${meetingNoteId}-deal-${deal.id}`,
    dealId: deal.id,
    isDeleted: false,
    dealNameSnapshot: deal.dealName,
    dealStatusSnapshot: deal.dealStatusLabel,
    dealCostSnapshot: deal.dealCost,
    dealExpectedEndDateSnapshot: deal.expectedEndDate,
    createdAt: now(),
  };
}

function toStageCounts(deals: readonly Deal[]) {
  return DEAL_STATUS_LIST.map((dealStatus) => ({
    dealStatus,
    dealStatusLabel: DEAL_STATUS_LABEL[dealStatus],
    count: deals.filter((deal) => deal.dealStatus === dealStatus).length,
  }));
}

function toMeetingNoteSummary(labels: readonly string[]): MeetingNoteSummary {
  return {
    label: labels[0] ?? "-",
    count: labels.length,
  };
}

function paginated<TItem>(items: readonly TItem[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "10"));
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize).map((item) =>
    isMeetingNote(item) ? toMeetingNoteListItem(item) : item
  );

  return {
    items: pagedItems,
    page,
    pageSize,
    totalCount: items.length,
    totalPages,
  };
}

function toMeetingNoteListItem(meetingNote: MeetingNote) {
  return {
    id: meetingNote.id,
    title: meetingNote.title,
    meetingAt: meetingNote.meetingAt,
    sourceType: meetingNote.sourceType,
    companies: toMeetingNoteSummary(
      meetingNote.companies.map((company) => company.companyNameSnapshot)
    ),
    contacts: toMeetingNoteSummary(
      meetingNote.contacts.map((contact) => contact.contactUsernameSnapshot)
    ),
    products: toMeetingNoteSummary(
      meetingNote.products.map((product) => product.productNameSnapshot)
    ),
    deals: toMeetingNoteSummary(
      meetingNote.deals.map((deal) => deal.dealNameSnapshot)
    ),
    createdAt: meetingNote.createdAt,
  };
}

function isMeetingNote(item: unknown): item is MeetingNote {
  return (
    typeof item === "object" &&
    item !== null &&
    "sourceType" in item &&
    "meetingLocalDateTime" in item
  );
}

function incrementDealCounts(store: SmokeStore, deal: Deal) {
  const companyIds = new Set(deal.companies.map((company) => company.id));
  const productIds = new Set(deal.products.map((product) => product.id));

  store.companies = store.companies.map((company) =>
    companyIds.has(company.id)
      ? { ...company, dealCount: company.dealCount + 1 }
      : company
  );
  store.products = store.products.map((product) =>
    productIds.has(product.id)
      ? { ...product, dealCount: product.dealCount + 1 }
      : product
  );
}

function matchesSearch(
  fields: readonly (string | null | undefined)[],
  search: string | null
) {
  const normalized = search?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return true;
  }

  return fields.some((field) => field?.toLowerCase().includes(normalized));
}

function matchesAny(value: string, candidates: readonly (string | null)[]) {
  const filtered = candidates.filter(isNonNullable);

  return filtered.length === 0 || filtered.includes(value);
}

function matchesOneOf(values: readonly string[], candidates: readonly string[]) {
  return candidates.length === 0 || values.some((value) => candidates.includes(value));
}

function getSearchParamValues(url: URL, key: string) {
  return url.searchParams.getAll(key).filter(Boolean);
}

function requireCompany(store: SmokeStore, companyId: string | undefined) {
  const company = store.companies.find((item) => item.id === companyId);

  if (!company) {
    throw new Error(`Company not found: ${companyId ?? "(empty)"}`);
  }

  return company;
}

function requireCompanyField(store: SmokeStore, fieldId: string | undefined) {
  const field = store.companyFields.find((item) => item.id === fieldId);

  if (!field) {
    throw new Error(`Company field not found: ${fieldId ?? "(empty)"}`);
  }

  return field;
}

function requireCompanyRegion(store: SmokeStore, regionId: string | undefined) {
  const region = store.companyRegions.find((item) => item.id === regionId);

  if (!region) {
    throw new Error(`Company region not found: ${regionId ?? "(empty)"}`);
  }

  return region;
}

function requireContact(store: SmokeStore, contactId: string | undefined) {
  const contact = store.contacts.find((item) => item.id === contactId);

  if (!contact) {
    throw new Error(`Contact not found: ${contactId ?? "(empty)"}`);
  }

  return contact;
}

function requireContactDepartment(
  store: SmokeStore,
  departmentId: string | undefined
) {
  const department = store.contactDepartments.find(
    (item) => item.id === departmentId
  );

  if (!department) {
    throw new Error(`Contact department not found: ${departmentId ?? "(empty)"}`);
  }

  return department;
}

function requireContactJobGrade(
  store: SmokeStore,
  jobGradeId: string | undefined
) {
  const jobGrade = store.contactJobGrades.find((item) => item.id === jobGradeId);

  if (!jobGrade) {
    throw new Error(`Contact job grade not found: ${jobGradeId ?? "(empty)"}`);
  }

  return jobGrade;
}

function requireProduct(store: SmokeStore, productId: string | undefined) {
  const product = store.products.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Product not found: ${productId ?? "(empty)"}`);
  }

  return product;
}

function requireProductCategory(
  store: SmokeStore,
  categoryId: string | undefined
) {
  const category = store.productCategories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Product category not found: ${categoryId ?? "(empty)"}`);
  }

  return category;
}

function requireProductStatus(store: SmokeStore, statusId: string | undefined) {
  const status = store.productStatuses.find((item) => item.id === statusId);

  if (!status) {
    throw new Error(`Product status not found: ${statusId ?? "(empty)"}`);
  }

  return status;
}

function requireDeal(store: SmokeStore, dealId: string) {
  const deal = store.deals.find((item) => item.id === dealId);

  if (!deal) {
    throw new Error(`Deal not found: ${dealId}`);
  }

  return deal;
}

function requireSchedule(store: SmokeStore, scheduleId: string) {
  const schedule = store.schedules.find((item) => item.id === scheduleId);

  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  return schedule;
}

function requireMeetingNote(store: SmokeStore, meetingNoteId: string) {
  const meetingNote = store.meetingNotes.find((item) => item.id === meetingNoteId);

  if (!meetingNote) {
    throw new Error(`Meeting note not found: ${meetingNoteId}`);
  }

  return meetingNote;
}

function replaceMeetingNote(store: SmokeStore, meetingNote: MeetingNote) {
  store.meetingNotes = store.meetingNotes.map((item) =>
    item.id === meetingNote.id ? meetingNote : item
  );
}

function json(body: unknown, status?: number): MockApiResponse {
  return { body, status };
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

function nextId(store: SmokeStore, prefix: string) {
  const id = `${prefix}-${store.sequence}`;
  store.sequence += 1;

  return id;
}

function now() {
  return "2026-06-07T09:00:00.000Z";
}

function isNonNullable<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

function getDialog(page: Page, title: string) {
  return page.getByRole("dialog", { name: title }).first();
}

async function goToNav(page: Page, name: string) {
  await page.getByRole("link", { name }).first().click();
}

async function expectAndCloseNotice(page: Page, message: string) {
  const noticeText = page.getByText(message).first();
  const closeButton = page.getByRole("button", { name: "닫기" }).first();

  await expect(noticeText).toBeVisible();

  if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeButton.click({ force: true, timeout: 2_000 }).catch(() => undefined);
    await expect(noticeText).toBeHidden({ timeout: 3_000 }).catch(() => undefined);
  }
}

async function selectManagedOption(
  scope: Locator,
  inputName: string,
  optionName: string
) {
  await scope.getByLabel(inputName, { exact: true }).fill(optionName);
  await scope
    .getByRole("button", { name: optionName, exact: true })
    .first()
    .click();
}

async function selectSearchOption(
  scope: Locator,
  label: string,
  optionName: string
) {
  await scope.getByLabel(label, { exact: true }).fill(optionName);
  await scope
    .getByRole("button", { name: new RegExp(escapeRegExp(optionName)) })
    .first()
    .click();
}

async function selectEntityOption(
  dialog: Locator,
  triggerName: string,
  optionName: string
) {
  await dialog.getByRole("button", { name: triggerName }).click();
  await dialog.getByLabel(new RegExp(escapeRegExp(optionName))).check();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
