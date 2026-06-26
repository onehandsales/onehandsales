import {
  type SearchGroupRecord,
  type SearchItemRecord,
  type SearchRepository,
  type SearchRepositoryInput,
} from "@/modules/search/application/ports/search.repository";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type CompanySearchRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: { readonly field: string };
  readonly companyRegion: { readonly region: string };
};

type ContactSearchRow = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly mobile: string;
  readonly company: { readonly companyName: string };
  readonly contactDepartment: { readonly departmentName: string };
  readonly contactJobGrade: { readonly jobGradeName: string };
};

type ProductSearchRow = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: { readonly categoryName: string };
  readonly productStatus: { readonly statusName: string };
};

type DealSearchRow = {
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

type ScheduleSearchRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly scheduleDeals: ReadonlyArray<{
    readonly deal: { readonly dealName: string };
  }>;
};

type MeetingNoteSearchRow = {
  readonly id: string;
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

// 역할 : PrismaSearchRepository 통합검색 저장소 계약을 Prisma 조회로 구현합니다.
export class PrismaSearchRepository implements SearchRepository {
  // 기능 : Prisma 서비스를 주입받습니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 현재 사용자 소유 데이터에서 요청된 도메인별 통합검색 결과를 조회합니다.
  async search(input: SearchRepositoryInput): Promise<SearchGroupRecord[]> {
    const groups = await Promise.all(
      input.types.map(async (type) => ({
        type,
        items: await this.searchByType(type, input),
      }))
    );

    return groups;
  }

  // 기능 : 검색 대상 타입에 맞는 Prisma 조회를 실행합니다.
  private searchByType(
    type: SearchTargetType,
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    switch (type) {
      case SearchTargetType.COMPANY:
        return this.searchCompanies(input);
      case SearchTargetType.CONTACT:
        return this.searchContacts(input);
      case SearchTargetType.PRODUCT:
        return this.searchProducts(input);
      case SearchTargetType.DEAL:
        return this.searchDeals(input);
      case SearchTargetType.SCHEDULE:
        return this.searchSchedules(input);
      case SearchTargetType.MEETING_NOTE:
        return this.searchMeetingNotes(input);
    }
  }

  // 기능 : 회사명, 분야명, 지역명으로 회사를 검색합니다.
  private async searchCompanies(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const companies = await this.prismaService.company.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { companyName: { contains: input.query } },
          { companyField: { field: { contains: input.query } } },
          { companyRegion: { region: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        companyField: { select: { field: true } },
        companyRegion: { select: { region: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return companies.map((company) => this.toCompanyItem(company));
  }

  // 기능 : 담당자와 연결 회사, 부서, 직급 정보로 담당자를 검색합니다.
  private async searchContacts(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const contacts = await this.prismaService.contact.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { username: { contains: input.query } },
          { email: { contains: input.query } },
          { mobile: { contains: input.query } },
          {
            company: {
              deletedAt: null,
              companyName: { contains: input.query },
            },
          },
          {
            contactDepartment: {
              departmentName: { contains: input.query },
            },
          },
          { contactJobGrade: { jobGradeName: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        mobile: true,
        company: { select: { companyName: true } },
        contactDepartment: { select: { departmentName: true } },
        contactJobGrade: { select: { jobGradeName: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return contacts.map((contact) => this.toContactItem(contact));
  }

  // 기능 : 제품명, 카테고리명, 상태명으로 제품을 검색합니다.
  private async searchProducts(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { productName: { contains: input.query } },
          { productCategory: { categoryName: { contains: input.query } } },
          { productStatus: { statusName: { contains: input.query } } },
        ],
      },
      select: {
        id: true,
        productName: true,
        productPrice: true,
        productCategory: { select: { categoryName: true } },
        productStatus: { select: { statusName: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return products.map((product) => this.toProductItem(product));
  }

  // 기능 : 딜명, 상태, 연결 회사명, 담당자명으로 딜을 검색합니다.
  private async searchDeals(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const deals = await this.prismaService.deal.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          { dealName: { contains: input.query } },
          { dealStatus: { contains: input.query } },
          {
            dealCompanies: {
              some: {
                company: {
                  deletedAt: null,
                  companyName: { contains: input.query },
                },
              },
            },
          },
          {
            dealContacts: {
              some: {
                contact: {
                  deletedAt: null,
                  username: { contains: input.query },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        dealStatus: true,
        dealCompanies: {
          select: {
            company: { select: { companyName: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        dealContacts: {
          select: {
            contact: { select: { username: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return deals.map((deal) => this.toDealItem(deal));
  }

  // 기능 : 일정 제목, 장소, 메모, 연결 딜명으로 일정을 검색합니다.
  private async searchSchedules(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const schedules = await this.prismaService.schedule.findMany({
      where: {
        userId: input.userId,
        OR: [
          { scheduleTitle: { contains: input.query } },
          { location: { contains: input.query } },
          { memo: { contains: input.query } },
          {
            scheduleDeals: {
              some: {
                userId: input.userId,
                deal: {
                  deletedAt: null,
                  dealName: { contains: input.query },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        scheduleTitle: true,
        startAt: true,
        timeZone: true,
        location: true,
        scheduleDeals: {
          select: {
            deal: { select: { dealName: true } },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ startAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return schedules.map((schedule) => this.toScheduleItem(schedule));
  }

  // 기능 : 회의록 본문 요약 필드와 연결 스냅샷으로 회의록을 검색합니다.
  private async searchMeetingNotes(
    input: SearchRepositoryInput
  ): Promise<SearchItemRecord[]> {
    const meetingNotes = await this.prismaService.meetingNote.findMany({
      where: {
        deletedAt: null,
        userId: input.userId,
        OR: [
          { title: { contains: input.query } },
          { details: { contains: input.query } },
          { nextPlan: { contains: input.query } },
          { requiredAction: { contains: input.query } },
          {
            companies: {
              some: {
                userId: input.userId,
                companyNameSnapshot: { contains: input.query },
              },
            },
          },
          {
            contacts: {
              some: {
                userId: input.userId,
                contactUsernameSnapshot: { contains: input.query },
              },
            },
          },
          {
            products: {
              some: {
                userId: input.userId,
                productNameSnapshot: { contains: input.query },
              },
            },
          },
          {
            deals: {
              some: {
                userId: input.userId,
                dealNameSnapshot: { contains: input.query },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        meetingAt: true,
        timeZone: true,
        nextPlan: true,
        requiredAction: true,
        companies: {
          select: { companyNameSnapshot: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        contacts: {
          select: { contactUsernameSnapshot: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        deals: {
          select: { dealNameSnapshot: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ meetingAt: "desc" }, { id: "desc" }],
      take: input.limit,
    });

    return meetingNotes.map((meetingNote) =>
      this.toMeetingNoteItem(meetingNote)
    );
  }

  // 기능 : Prisma 회사 행을 통합검색 결과 항목으로 변환합니다.
  private toCompanyItem(company: CompanySearchRow): SearchItemRecord {
    return {
      title: company.companyName,
      subtitle: this.joinParts([
        company.companyField.field,
        company.companyRegion.region,
      ]),
      targetId: company.id,
      targetPath: `/companies/${company.id}`,
    };
  }

  // 기능 : Prisma 담당자 행을 통합검색 결과 항목으로 변환합니다.
  private toContactItem(contact: ContactSearchRow): SearchItemRecord {
    return {
      title: contact.username,
      subtitle: this.joinParts([
        contact.company.companyName,
        contact.contactDepartment.departmentName,
        contact.contactJobGrade.jobGradeName,
      ]),
      targetId: contact.id,
      targetPath: `/contacts/${contact.id}`,
    };
  }

  // 기능 : Prisma 제품 행을 통합검색 결과 항목으로 변환합니다.
  private toProductItem(product: ProductSearchRow): SearchItemRecord {
    return {
      title: product.productName,
      subtitle: this.joinParts([
        product.productCategory.categoryName,
        product.productStatus.statusName,
        this.formatMoney(product.productPrice),
      ]),
      targetId: product.id,
      targetPath: `/products/${product.id}`,
    };
  }

  // 기능 : Prisma 딜 행을 통합검색 결과 항목으로 변환합니다.
  private toDealItem(deal: DealSearchRow): SearchItemRecord {
    return {
      title: deal.dealName,
      subtitle: this.joinParts([
        this.joinParts(
          deal.dealCompanies.map(
            (dealCompany) => dealCompany.company.companyName
          )
        ),
        this.joinParts(
          deal.dealContacts.map((dealContact) => dealContact.contact.username)
        ),
        deal.dealStatus,
        this.formatMoney(deal.dealCost),
      ]),
      targetId: deal.id,
      targetPath: `/deals/${deal.id}`,
    };
  }

  // 기능 : Prisma 일정 행을 통합검색 결과 항목으로 변환합니다.
  private toScheduleItem(schedule: ScheduleSearchRow): SearchItemRecord {
    const dealNames = schedule.scheduleDeals.map(
      (scheduleDeal) => scheduleDeal.deal.dealName
    );

    return {
      title: schedule.scheduleTitle,
      subtitle: this.joinParts([
        this.formatDateTime(schedule.startAt, schedule.timeZone),
        schedule.location,
        this.joinParts(dealNames),
      ]),
      targetId: schedule.id,
      targetPath: `/schedules/${schedule.id}`,
    };
  }

  // 기능 : Prisma 회의록 행을 통합검색 결과 항목으로 변환합니다.
  private toMeetingNoteItem(meetingNote: MeetingNoteSearchRow): SearchItemRecord {
    const firstCompany = meetingNote.companies[0]?.companyNameSnapshot;
    const firstContact = meetingNote.contacts[0]?.contactUsernameSnapshot;
    const firstDeal = meetingNote.deals[0]?.dealNameSnapshot;
    const title = this.joinParts([firstCompany, firstContact]) ?? "회의록";

    return {
      title,
      subtitle: this.joinParts([
        this.formatDateTime(meetingNote.meetingAt, meetingNote.timeZone),
        firstDeal,
        this.truncateText(meetingNote.nextPlan),
        this.truncateText(meetingNote.requiredAction),
      ]),
      targetId: meetingNote.id,
      targetPath: `/meeting-notes/${meetingNote.id}`,
    };
  }

  // 기능 : 빈 값을 제외한 문자열 조각을 화면 표시용 구분자로 결합합니다.
  private joinParts(parts: ReadonlyArray<string | null | undefined>): string | null {
    const normalizedParts = parts
      .map((part) => part?.trim())
      .filter((part): part is string => part !== undefined && part.length > 0);

    return normalizedParts.length > 0 ? normalizedParts.join(" · ") : null;
  }

  // 기능 : 금액 숫자를 원화 표시 문자열로 변환합니다.
  private formatMoney(value: number): string {
    return `${value.toLocaleString("ko-KR")}원`;
  }

  // 기능 : UTC instant를 대상 timezone의 짧은 날짜 시간 문자열로 변환합니다.
  private formatDateTime(value: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(value);
  }

  // 기능 : 검색 결과 보조 설명에 들어갈 긴 문자열을 제한합니다.
  private truncateText(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();

    if (trimmed.length <= 40) {
      return trimmed;
    }

    return `${trimmed.slice(0, 40)}...`;
  }
}
