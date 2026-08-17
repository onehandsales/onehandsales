import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaSearchRepository } from "./prisma-search.repository";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const BASE_DATE = new Date("2026-08-17T01:00:00.000Z");

// 역할 : Prisma findMany 호출을 테스트 행 타입별로 대체하는 mock 타입입니다.
type FindManyMock<Row> = jest.Mock<Promise<Row[]>, [unknown]>;

// 역할 : 회사 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type CompanyRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: { readonly field: string };
  readonly companyRegion: { readonly region: string };
};

// 역할 : 담당자 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type ContactRow = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly mobile: string;
  readonly phoneCountryCode: string | null;
  readonly phoneNationalNumber: string | null;
  readonly phoneE164: string | null;
  readonly company: { readonly companyName: string };
  readonly contactDepartment: { readonly departmentName: string };
  readonly contactJobGrade: { readonly jobGradeName: string };
};

// 역할 : 제품 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type ProductRow = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: { readonly categoryName: string };
  readonly productStatus: { readonly statusName: string };
};

// 역할 : 딜 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type DealRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly dealCompanies: ReadonlyArray<{
    readonly company: { readonly companyName: string };
  }>;
  readonly dealContacts: ReadonlyArray<{
    readonly contact: { readonly username: string };
  }>;
};

// 역할 : 일정 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type ScheduleRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly scheduleDeals: ReadonlyArray<{
    readonly deal: { readonly dealName: string };
  }>;
};

// 역할 : 회의록 검색 Prisma 조회 결과 fixture 행을 정의합니다.
type MeetingNoteRow = {
  readonly id: string;
  readonly title: string;
  readonly meetingAt: Date;
  readonly timeZone: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: ReadonlyArray<{
    readonly companyNameSnapshot: string;
  }>;
  readonly contacts: ReadonlyArray<{
    readonly contactUsernameSnapshot: string;
  }>;
  readonly deals: ReadonlyArray<{
    readonly dealNameSnapshot: string;
  }>;
};

// 역할 : PrismaSearchRepository 테스트가 사용하는 Prisma delegate mock 묶음을 정의합니다.
type SearchPrismaMock = {
  readonly company: { readonly findMany: FindManyMock<CompanyRow> };
  readonly contact: { readonly findMany: FindManyMock<ContactRow> };
  readonly product: { readonly findMany: FindManyMock<ProductRow> };
  readonly deal: { readonly findMany: FindManyMock<DealRow> };
  readonly schedule: { readonly findMany: FindManyMock<ScheduleRow> };
  readonly meetingNote: { readonly findMany: FindManyMock<MeetingNoteRow> };
};

// 기능 : 통합검색 6개 대상의 Prisma findMany 결과를 가진 mock을 생성합니다.
function createPrismaMock(): SearchPrismaMock {
  return {
    company: {
      findMany: jest.fn<Promise<CompanyRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "company-1",
          companyName: "세손상사",
          companyField: { field: "제조" },
          companyRegion: { region: "서울" },
        },
      ]),
    },
    contact: {
      findMany: jest.fn<Promise<ContactRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "contact-1",
          username: "김영업",
          email: "sales@example.com",
          mobile: "010-0000-0000",
          phoneCountryCode: "82",
          phoneNationalNumber: "01000000000",
          phoneE164: "+821000000000",
          company: { companyName: "세손상사" },
          contactDepartment: { departmentName: "영업" },
          contactJobGrade: { jobGradeName: "팀장" },
        },
      ]),
    },
    product: {
      findMany: jest.fn<Promise<ProductRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "product-1",
          productName: "영업관리 솔루션",
          productPrice: 1000000,
          productCategory: { categoryName: "SaaS" },
          productStatus: { statusName: "판매중" },
        },
      ]),
    },
    deal: {
      findMany: jest.fn<Promise<DealRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "deal-1",
          dealName: "8월 견적 딜",
          dealCost: 5000000,
          dealStatus: "NEGOTIATION",
          dealCompanies: [{ company: { companyName: "세손상사" } }],
          dealContacts: [{ contact: { username: "김영업" } }],
        },
      ]),
    },
    schedule: {
      findMany: jest.fn<Promise<ScheduleRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "schedule-1",
          scheduleTitle: "QA 일정 테스트",
          startAt: BASE_DATE,
          timeZone: "Asia/Seoul",
          location: "서울",
          scheduleDeals: [{ deal: { dealName: "8월 견적 딜" } }],
        },
      ]),
    },
    meetingNote: {
      findMany: jest.fn<Promise<MeetingNoteRow[]>, [unknown]>().mockResolvedValue([
        {
          id: "meeting-note-1",
          title: "8월 견적 협의 회의",
          meetingAt: BASE_DATE,
          timeZone: "Asia/Seoul",
          nextPlan: "다음주 견적 발송",
          requiredAction: "가격표 검토",
          companies: [{ companyNameSnapshot: "세손상사" }],
          contacts: [{ contactUsernameSnapshot: "김영업" }],
          deals: [{ dealNameSnapshot: "8월 견적 딜" }],
        },
      ]),
    },
  };
}

// 기능 : Prisma mock을 주입한 통합검색 repository 테스트 대상을 생성합니다.
function createRepository(prisma: SearchPrismaMock): PrismaSearchRepository {
  return new PrismaSearchRepository(prisma as unknown as PrismaService);
}

// 기능 : PrismaSearchRepository의 검색 결과 변환과 조회 조건을 검증합니다.
describe("PrismaSearchRepository", () => {
  // 기능 : 검색 결과 이동 경로가 보호 앱 route 계약을 따르는지 검증합니다.
  it("returns app route target paths for all searchable domains", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    const groups = await repository.search({
      userId: USER_ID,
      query: "세손",
      types: [
        SearchTargetType.COMPANY,
        SearchTargetType.CONTACT,
        SearchTargetType.PRODUCT,
        SearchTargetType.DEAL,
        SearchTargetType.SCHEDULE,
        SearchTargetType.MEETING_NOTE,
      ],
      limit: 5,
    });

    expect(
      groups.map((group) => [group.type, group.items[0]?.targetPath])
    ).toEqual([
      [SearchTargetType.COMPANY, "/app/companies/company-1"],
      [SearchTargetType.CONTACT, "/app/contacts/contact-1"],
      [SearchTargetType.PRODUCT, "/app/products/product-1"],
      [SearchTargetType.DEAL, "/app/deals/deal-1"],
      [SearchTargetType.SCHEDULE, "/app/schedules/schedule-1"],
      [SearchTargetType.MEETING_NOTE, "/app/meeting-notes/meeting-note-1"],
    ]);
  });

  // 기능 : 휴지통으로 이동한 일정이 통합검색에서 제외되는지 검증합니다.
  it("filters soft-deleted schedules out of search", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    await repository.search({
      userId: USER_ID,
      query: "QA 일정",
      types: [SearchTargetType.SCHEDULE],
      limit: 5,
    });

    expect(prisma.schedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: USER_ID,
          deletedAt: null,
        }),
      })
    );
  });

  // 기능 : 회의록 검색 결과 제목이 연결 record 조합보다 회의록 제목을 우선하는지 검증합니다.
  it("uses meeting note title as the search result title", async () => {
    const prisma = createPrismaMock();
    const repository = createRepository(prisma);

    const groups = await repository.search({
      userId: USER_ID,
      query: "견적",
      types: [SearchTargetType.MEETING_NOTE],
      limit: 5,
    });

    const item = groups[0]?.items[0];

    expect(item?.title).toBe("8월 견적 협의 회의");
    expect(item?.subtitle).toContain("세손상사");
    expect(item?.subtitle).toContain("김영업");
  });
});
