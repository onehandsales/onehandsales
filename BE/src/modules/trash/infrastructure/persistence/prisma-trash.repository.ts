import {
  type GetTrashDetailInput,
  type ListTrashInput,
  type RestoreTrashItemInput,
  type TrashDetail,
  type TrashDetailField,
  type TrashDomainFilter,
  type TrashItem,
  type TrashItemKindFilter,
  type TrashListResult,
  type TrashLogTypeFilter,
  type TrashRepository,
  type TrashRestoreBlockedReason,
  type TrashRestoreRepositoryResult,
  type TrashSort,
  type TrashTargetType,
} from "@/modules/trash/application/ports/trash.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type TrashDomain = Exclude<TrashDomainFilter, "ALL">;
type TrashItemKind = Exclude<TrashItemKindFilter, "ALL">;
type TrashLogType = Exclude<TrashLogTypeFilter, "ALL">;

type TargetMetadata = {
  readonly targetType: TrashTargetType;
  readonly domain: TrashDomain;
  readonly kind: TrashItemKind;
  readonly logType?: TrashLogType;
};

type DeletedItemInput = {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly title: string;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
  readonly parentType?: TrashDomain;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;
const MEMO_TITLE_MAX_LENGTH = 40;

const TARGET_METADATA: readonly TargetMetadata[] = [
  {
    targetType: "COMPANY",
    domain: "COMPANY",
    kind: "ENTITY",
  },
  {
    targetType: "CONTACT",
    domain: "CONTACT",
    kind: "ENTITY",
  },
  {
    targetType: "PRODUCT",
    domain: "PRODUCT",
    kind: "ENTITY",
  },
  {
    targetType: "DEAL",
    domain: "DEAL",
    kind: "ENTITY",
  },
  {
    targetType: "SCHEDULE",
    domain: "SCHEDULE",
    kind: "ENTITY",
  },
  {
    targetType: "MEETING_NOTE",
    domain: "MEETING_NOTE",
    kind: "ENTITY",
  },
  {
    targetType: "COMPANY_MEMO_LOG",
    domain: "COMPANY",
    kind: "LOG",
    logType: "MEMO",
  },
  {
    targetType: "COMPANY_PRIVATE_MEMO_LOG",
    domain: "COMPANY",
    kind: "LOG",
    logType: "PRIVATE_MEMO",
  },
  {
    targetType: "CONTACT_MEMO_LOG",
    domain: "CONTACT",
    kind: "LOG",
    logType: "MEMO",
  },
  {
    targetType: "CONTACT_PRIVATE_MEMO_LOG",
    domain: "CONTACT",
    kind: "LOG",
    logType: "PRIVATE_MEMO",
  },
  {
    targetType: "PRODUCT_MEMO_LOG",
    domain: "PRODUCT",
    kind: "LOG",
    logType: "MEMO",
  },
  {
    targetType: "PRODUCT_PRIVATE_MEMO_LOG",
    domain: "PRODUCT",
    kind: "LOG",
    logType: "PRIVATE_MEMO",
  },
  {
    targetType: "DEAL_MEMO_LOG",
    domain: "DEAL",
    kind: "LOG",
    logType: "MEMO",
  },
  {
    targetType: "DEAL_FOLLOWING_ACTION_LOG",
    domain: "DEAL",
    kind: "LOG",
    logType: "FOLLOWING_ACTION",
  },
];

const TARGET_METADATA_BY_TYPE = new Map<TrashTargetType, TargetMetadata>(
  TARGET_METADATA.map((metadata) => [metadata.targetType, metadata])
);

// 기능 : null이 제거된 휴지통 목록 항목인지 검증합니다.
function isTrashItem(item: TrashItem | null): item is TrashItem {
  return item !== null;
}

// 역할 : PrismaTrashRepository 휴지통 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaTrashRepository implements TrashRepository {
  // 기능 : 휴지통 조회와 복구에 사용할 Prisma 클라이언트를 주입받습니다.
  constructor(private readonly client: PrismaService) {}

  // 기능 : 현재 사용자의 복구 가능 삭제 항목을 조건에 맞춰 조회합니다.
  async listTrash(input: ListTrashInput): Promise<TrashListResult> {
    const page = this.normalizePage(input.page);
    const pageSize = this.normalizePageSize(input.pageSize);
    const collectedItems = await this.collectTrashItems(input);
    const filteredItems = this.filterByQuery(collectedItems, input.query);
    const sortedItems = this.sortTrashItems(filteredItems, input.sort);

    return {
      items: sortedItems.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalCount: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / pageSize),
    };
  }

  // 기능 : 휴지통 대상 유형에 맞는 row의 삭제 상태를 초기화합니다.
  async restoreTrashItem(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreRepositoryResult | null> {
    const blockedReason = await this.getRestoreBlockedReason(input);

    if (blockedReason) {
      return { blockedReason };
    }

    const restored = await this.restoreByTargetType(input);

    if (!restored) {
      const retryBlockedReason = await this.getRestoreBlockedReason(input);

      if (retryBlockedReason) {
        return { blockedReason: retryBlockedReason };
      }

      return null;
    }

    const scheduleReminder =
      input.targetType === "SCHEDULE"
        ? await this.findRestoredScheduleReminder(input)
        : null;

    return {
      targetType: input.targetType,
      targetId: input.targetId,
      restoredAt: input.now,
      ...(scheduleReminder ? { scheduleReminder } : {}),
    };
  }

  // 기능 : 휴지통 대상 유형에 맞는 상세 정보를 조회합니다.
  async getTrashDetail(input: GetTrashDetailInput): Promise<TrashDetail | null> {
    switch (input.targetType) {
      case "COMPANY":
        return this.getCompanyDetail(input);
      case "CONTACT":
        return this.getContactDetail(input);
      case "PRODUCT":
        return this.getProductDetail(input);
      case "DEAL":
        return this.getDealDetail(input);
      case "SCHEDULE":
        return this.getScheduleDetail(input);
      case "MEETING_NOTE":
        return this.getMeetingNoteDetail(input);
      case "COMPANY_MEMO_LOG":
        return this.getCompanyMemoLogDetail(input);
      case "COMPANY_PRIVATE_MEMO_LOG":
        return this.getCompanyPrivateMemoLogDetail(input);
      case "CONTACT_MEMO_LOG":
        return this.getContactMemoLogDetail(input);
      case "CONTACT_PRIVATE_MEMO_LOG":
        return this.getContactPrivateMemoLogDetail(input);
      case "PRODUCT_MEMO_LOG":
        return this.getProductMemoLogDetail(input);
      case "PRODUCT_PRIVATE_MEMO_LOG":
        return this.getProductPrivateMemoLogDetail(input);
      case "DEAL_MEMO_LOG":
        return this.getDealMemoLogDetail(input);
      case "DEAL_FOLLOWING_ACTION_LOG":
        return this.getDealFollowingActionLogDetail(input);
    }
  }

  // 기능 : 삭제된 회사의 상세 모달 데이터를 조회합니다.
  private async getCompanyDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const company = await this.client.company.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        companyName: true,
        deletedAt: true,
        trashExpiresAt: true,
        companyField: {
          select: {
            field: true,
          },
        },
        companyRegion: {
          select: {
            region: true,
          },
        },
      },
    });

    if (!company?.deletedAt || !company.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "COMPANY",
      targetId: company.id,
      title: company.companyName,
      deletedAt: company.deletedAt,
      trashExpiresAt: company.trashExpiresAt,
      summary: `${company.companyName} 회사 데이터`,
      fields: [
        this.createField("회사명", company.companyName),
        this.createField("분야", company.companyField.field),
        this.createField("지역", company.companyRegion.region),
      ],
    });
  }

  // 기능 : 삭제된 담당자의 상세 모달 데이터를 조회합니다.
  private async getContactDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const contact = await this.client.contact.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        username: true,
        mobile: true,
        email: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            companyName: true,
          },
        },
        contactDepartment: {
          select: {
            departmentName: true,
          },
        },
        contactJobGrade: {
          select: {
            jobGradeName: true,
          },
        },
      },
    });

    if (!contact?.deletedAt || !contact.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "CONTACT",
      targetId: contact.id,
      title: contact.username,
      deletedAt: contact.deletedAt,
      trashExpiresAt: contact.trashExpiresAt,
      summary: `${contact.username} 담당자 데이터`,
      fields: [
        this.createField("담당자명", contact.username),
        this.createField("회사", contact.company.companyName),
        this.createField("부서", contact.contactDepartment.departmentName),
        this.createField("직급", contact.contactJobGrade.jobGradeName),
        this.createField("연락처", contact.mobile),
        this.createField("이메일", contact.email),
      ],
    });
  }

  // 기능 : 삭제된 제품의 상세 모달 데이터를 조회합니다.
  private async getProductDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const product = await this.client.product.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        productName: true,
        productPrice: true,
        deletedAt: true,
        trashExpiresAt: true,
        productCategory: {
          select: {
            categoryName: true,
          },
        },
        productStatus: {
          select: {
            statusName: true,
          },
        },
      },
    });

    if (!product?.deletedAt || !product.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "PRODUCT",
      targetId: product.id,
      title: product.productName,
      deletedAt: product.deletedAt,
      trashExpiresAt: product.trashExpiresAt,
      summary: `${product.productName} 제품 데이터`,
      fields: [
        this.createField("제품명", product.productName),
        this.createField("가격", this.formatNumber(product.productPrice)),
        this.createField("카테고리", product.productCategory.categoryName),
        this.createField("상태", product.productStatus.statusName),
      ],
    });
  }

  // 기능 : 삭제된 딜의 상세 모달 데이터를 조회합니다.
  private async getDealDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const deal = await this.client.deal.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        dealStatus: true,
        expectedEndDate: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    if (!deal?.deletedAt || !deal.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "DEAL",
      targetId: deal.id,
      title: deal.dealName,
      deletedAt: deal.deletedAt,
      trashExpiresAt: deal.trashExpiresAt,
      summary: `${deal.dealName} 딜 데이터`,
      fields: [
        this.createField("딜이름", deal.dealName),
        this.createField("금액", this.formatNumber(deal.dealCost)),
        this.createField("상태", deal.dealStatus),
        this.createField("예상 종료일", this.formatDateOnly(deal.expectedEndDate)),
      ],
    });
  }

  // 기능 : 삭제된 회의록의 상세 모달 데이터를 조회합니다.
  private async getScheduleDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const schedule = await this.client.schedule.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        scheduleTitle: true,
        startAt: true,
        endAt: true,
        timeZone: true,
        location: true,
        meetingUrl: true,
        memo: true,
        sourceType: true,
        externalSyncStatus: true,
        deletedAt: true,
        trashExpiresAt: true,
        externalCalendarSource: {
          select: {
            status: true,
            calendarName: true,
            connection: {
              select: {
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            scheduleDeals: true,
          },
        },
      },
    });

    if (!schedule?.deletedAt || !schedule.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "SCHEDULE",
      targetId: schedule.id,
      title: schedule.scheduleTitle,
      deletedAt: schedule.deletedAt,
      trashExpiresAt: schedule.trashExpiresAt,
      summary: `${schedule.scheduleTitle} schedule`,
      fields: [
        this.createField(
          "Schedule time",
          this.formatScheduleDateTimeRange(
            schedule.startAt,
            schedule.endAt,
            schedule.timeZone
          )
        ),
        this.createField("Location", schedule.location),
        this.createField("출처", this.createScheduleSourceLabel(schedule)),
        this.createField(
          "미팅 링크",
          this.formatMeetingUrl(schedule.meetingUrl)
        ),
        this.createField("Linked deals", schedule._count.scheduleDeals),
      ],
      content: schedule.memo,
    });
  }

  private async getMeetingNoteDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const meetingNote = await this.client.meetingNote.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        title: true,
        meetingAt: true,
        details: true,
        nextPlan: true,
        requiredAction: true,
        deletedAt: true,
        trashExpiresAt: true,
        companies: {
          select: { companyNameSnapshot: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
        contacts: {
          select: { contactUsernameSnapshot: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!meetingNote?.deletedAt || !meetingNote.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "MEETING_NOTE",
      targetId: meetingNote.id,
      title: meetingNote.title,
      deletedAt: meetingNote.deletedAt,
      trashExpiresAt: meetingNote.trashExpiresAt,
      summary: `${meetingNote.title} 회의록 데이터`,
      fields: [
        this.createField("제목", meetingNote.title),
        this.createField("미팅일", this.formatDateTime(meetingNote.meetingAt)),
        this.createField(
          "회사",
          this.joinLabels(
            meetingNote.companies.map((company) => company.companyNameSnapshot)
          )
        ),
        this.createField(
          "담당자",
          this.joinLabels(
            meetingNote.contacts.map((contact) => contact.contactUsernameSnapshot)
          )
        ),
        this.createField("다음 계획", meetingNote.nextPlan),
        this.createField("필요 액션", meetingNote.requiredAction),
      ],
      content: meetingNote.details,
    });
  }

  // 기능 : 삭제된 회사 일반 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getCompanyMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.companyMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "COMPANY_MEMO_LOG",
      targetId: memoLog.id,
      title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "COMPANY",
      parentId: memoLog.company.id,
      parentTitle: memoLog.company.companyName,
      summary: `${memoLog.company.companyName} 회사 일반 메모`,
      fields: [
        this.createField("회사", memoLog.company.companyName),
        this.createField("메모 유형", memoLog.memoType),
      ],
      content: memoLog.memo,
    });
  }

  // 기능 : 삭제된 회사 비밀 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getCompanyPrivateMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.companyUserPrivateMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "COMPANY_PRIVATE_MEMO_LOG",
      targetId: memoLog.id,
      title: "비밀 메모",
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "COMPANY",
      parentId: memoLog.company.id,
      parentTitle: memoLog.company.companyName,
      summary: `${memoLog.company.companyName} 회사 비밀 메모`,
      fields: [this.createField("회사", memoLog.company.companyName)],
      content: "비밀 메모는 복구 후 상세 화면에서 확인할 수 있습니다.",
    });
  }

  // 기능 : 삭제된 담당자 일반 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getContactMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.contactMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        contact: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "CONTACT_MEMO_LOG",
      targetId: memoLog.id,
      title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "CONTACT",
      parentId: memoLog.contact.id,
      parentTitle: memoLog.contact.username,
      summary: `${memoLog.contact.username} 담당자 일반 메모`,
      fields: [
        this.createField("담당자", memoLog.contact.username),
        this.createField("메모 유형", memoLog.memoType),
      ],
      content: memoLog.memo,
    });
  }

  // 기능 : 삭제된 담당자 비밀 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getContactPrivateMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.contactUserPrivateMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        contact: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "CONTACT_PRIVATE_MEMO_LOG",
      targetId: memoLog.id,
      title: "비밀 메모",
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "CONTACT",
      parentId: memoLog.contact.id,
      parentTitle: memoLog.contact.username,
      summary: `${memoLog.contact.username} 담당자 비밀 메모`,
      fields: [this.createField("담당자", memoLog.contact.username)],
      content: "비밀 메모는 복구 후 상세 화면에서 확인할 수 있습니다.",
    });
  }

  // 기능 : 삭제된 제품 일반 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getProductMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.productMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        product: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "PRODUCT_MEMO_LOG",
      targetId: memoLog.id,
      title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "PRODUCT",
      parentId: memoLog.product.id,
      parentTitle: memoLog.product.productName,
      summary: `${memoLog.product.productName} 제품 일반 메모`,
      fields: [
        this.createField("제품", memoLog.product.productName),
        this.createField("메모 유형", memoLog.memoType),
      ],
      content: memoLog.memo,
    });
  }

  // 기능 : 삭제된 제품 비밀 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getProductPrivateMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.productUserPrivateMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        product: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "PRODUCT_PRIVATE_MEMO_LOG",
      targetId: memoLog.id,
      title: "비밀 메모",
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "PRODUCT",
      parentId: memoLog.product.id,
      parentTitle: memoLog.product.productName,
      summary: `${memoLog.product.productName} 제품 비밀 메모`,
      fields: [this.createField("제품", memoLog.product.productName)],
      content: "비밀 메모는 복구 후 상세 화면에서 확인할 수 있습니다.",
    });
  }

  // 기능 : 삭제된 딜 일반 메모 로그의 상세 모달 데이터를 조회합니다.
  private async getDealMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const memoLog = await this.client.dealMemoLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        deal: {
          select: {
            id: true,
            dealName: true,
          },
        },
      },
    });

    if (!memoLog?.deletedAt || !memoLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "DEAL_MEMO_LOG",
      targetId: memoLog.id,
      title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      parentType: "DEAL",
      parentId: memoLog.deal.id,
      parentTitle: memoLog.deal.dealName,
      summary: `${memoLog.deal.dealName} 딜 일반 메모`,
      fields: [
        this.createField("딜", memoLog.deal.dealName),
        this.createField("메모 유형", memoLog.memoType),
      ],
      content: memoLog.memo,
    });
  }

  // 기능 : 삭제된 딜 다음 행동 로그의 상세 모달 데이터를 조회합니다.
  private async getDealFollowingActionLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const actionLog = await this.client.dealFollowingActionLog.findFirst({
      where: this.createDetailWhere(input),
      select: {
        id: true,
        followingAction: true,
        checkComplete: true,
        deletedAt: true,
        trashExpiresAt: true,
        deal: {
          select: {
            id: true,
            dealName: true,
          },
        },
      },
    });

    if (!actionLog?.deletedAt || !actionLog.trashExpiresAt) {
      return null;
    }

    return this.createTrashDetail({
      targetType: "DEAL_FOLLOWING_ACTION_LOG",
      targetId: actionLog.id,
      title: actionLog.followingAction,
      deletedAt: actionLog.deletedAt,
      trashExpiresAt: actionLog.trashExpiresAt,
      parentType: "DEAL",
      parentId: actionLog.deal.id,
      parentTitle: actionLog.deal.dealName,
      summary: `${actionLog.deal.dealName} 다음 행동`,
      fields: [
        this.createField("딜", actionLog.deal.dealName),
        this.createField("완료 여부", actionLog.checkComplete ? "완료" : "미완료"),
      ],
      content: actionLog.followingAction,
    });
  }

  // 기능 : 공통 상세 응답에 선택적 위치 정보를 결합합니다.
  private createTrashDetail(input: {
    readonly targetType: TrashTargetType;
    readonly targetId: string;
    readonly title: string;
    readonly deletedAt: Date;
    readonly trashExpiresAt: Date;
    readonly summary: string;
    readonly fields: TrashDetailField[];
    readonly content?: string | null;
    readonly parentType?: TrashDomain;
    readonly parentId?: string | null;
    readonly parentTitle?: string | null;
  }): TrashDetail {
    const detail: TrashDetail = {
      targetType: input.targetType,
      targetId: input.targetId,
      title: input.title,
      deletedAt: input.deletedAt,
      trashExpiresAt: input.trashExpiresAt,
      summary: input.summary,
      fields: input.fields,
      ...(input.content !== undefined ? { content: input.content } : {}),
    };

    if (!input.parentType) {
      return detail;
    }

    return {
      ...detail,
      parentType: input.parentType,
      parentId: input.parentId ?? null,
      parentTitle: input.parentTitle ?? null,
    };
  }

  // 기능 : 상세 모달 필드 값을 문자열 표시 값으로 변환합니다.
  private createField(label: string, value: string | number | null) {
    return {
      label,
      value: value === null ? null : String(value),
    } satisfies TrashDetailField;
  }

  // 기능 : 현재 사용자의 복구 가능 단건 조회 where 조건을 만듭니다.
  private createDetailWhere(input: GetTrashDetailInput) {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gt: input.now,
      },
    };
  }

  // 기능 : 숫자 값을 한국어 로케일 표시 문자열로 변환합니다.
  private formatNumber(value: number) {
    return value.toLocaleString("ko-KR");
  }

  // 기능 : UTC instant에서 날짜 표시용 YYYY-MM-DD 문자열을 만듭니다.
  private formatDateOnly(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  // 기능 : UTC instant를 휴지통 상세용 날짜·시간 문자열로 변환합니다.
  private formatDateTime(value: Date) {
    return value.toISOString().slice(0, 16).replace("T", " ");
  }

  // 기능 : 여러 스냅샷 이름을 휴지통 상세 한 줄 표시 값으로 합칩니다.
  private formatScheduleDateTimeRange(
    startAt: Date,
    endAt: Date,
    timeZone: string
  ) {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    });

    return `${formatter.format(startAt)} - ${formatter.format(endAt)}`;
  }

  private formatMeetingUrl(value: string | null) {
    if (!value) {
      return null;
    }

    try {
      return new URL(value).hostname;
    } catch {
      return value;
    }
  }

  private createScheduleSourceLabel(schedule: {
    readonly sourceType: string;
    readonly externalSyncStatus: string | null;
    readonly externalCalendarSource: {
      readonly status: string;
      readonly calendarName: string;
      readonly connection: {
        readonly status: string;
      };
    } | null;
  }) {
    if (schedule.sourceType !== "GOOGLE") {
      return "Internal";
    }

    if (schedule.externalSyncStatus === "LOCAL_DELETED") {
      return "Google · 로컬 삭제";
    }

    if (schedule.externalSyncStatus === "LOCAL_MODIFIED") {
      return "Google · 로컬 수정";
    }

    if (schedule.externalCalendarSource?.connection.status !== "CONNECTED") {
      return "Google · 연결 끊김";
    }

    return schedule.externalCalendarSource?.calendarName ?? "Google";
  }

  private joinLabels(labels: readonly string[]) {
    const normalizedLabels = labels
      .map((label) => label.trim())
      .filter((label) => label.length > 0);

    return normalizedLabels.length > 0 ? normalizedLabels.join(", ") : null;
  }

  // 기능 : 필터 조건에 포함되는 모든 휴지통 대상 목록을 병렬 조회합니다.
  private async collectTrashItems(input: ListTrashInput): Promise<TrashItem[]> {
    const tasks: Promise<TrashItem[]>[] = [];

    if (this.shouldIncludeTarget(input, "COMPANY")) {
      tasks.push(this.listDeletedCompanies(input));
    }

    if (this.shouldIncludeTarget(input, "CONTACT")) {
      tasks.push(this.listDeletedContacts(input));
    }

    if (this.shouldIncludeTarget(input, "PRODUCT")) {
      tasks.push(this.listDeletedProducts(input));
    }

    if (this.shouldIncludeTarget(input, "DEAL")) {
      tasks.push(this.listDeletedDeals(input));
    }

    if (this.shouldIncludeTarget(input, "SCHEDULE")) {
      tasks.push(this.listDeletedSchedules(input));
    }

    if (this.shouldIncludeTarget(input, "MEETING_NOTE")) {
      tasks.push(this.listDeletedMeetingNotes(input));
    }

    if (this.shouldIncludeTarget(input, "COMPANY_MEMO_LOG")) {
      tasks.push(this.listDeletedCompanyMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "COMPANY_PRIVATE_MEMO_LOG")) {
      tasks.push(this.listDeletedCompanyPrivateMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "CONTACT_MEMO_LOG")) {
      tasks.push(this.listDeletedContactMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "CONTACT_PRIVATE_MEMO_LOG")) {
      tasks.push(this.listDeletedContactPrivateMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "PRODUCT_MEMO_LOG")) {
      tasks.push(this.listDeletedProductMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "PRODUCT_PRIVATE_MEMO_LOG")) {
      tasks.push(this.listDeletedProductPrivateMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "DEAL_MEMO_LOG")) {
      tasks.push(this.listDeletedDealMemoLogs(input));
    }

    if (this.shouldIncludeTarget(input, "DEAL_FOLLOWING_ACTION_LOG")) {
      tasks.push(this.listDeletedDealFollowingActionLogs(input));
    }

    const itemGroups = await Promise.all(tasks);

    return itemGroups.flat();
  }

  // 기능 : 삭제된 회사 row를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedCompanies(input: ListTrashInput) {
    const companies = await this.client.company.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        companyName: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return companies
      .map((company) =>
        this.createTrashItem({
          targetType: "COMPANY",
          targetId: company.id,
          title: company.companyName,
          deletedAt: company.deletedAt,
          trashExpiresAt: company.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 담당자 row를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedContacts(input: ListTrashInput) {
    const contacts = await this.client.contact.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        username: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return contacts
      .map((contact) =>
        this.createTrashItem({
          targetType: "CONTACT",
          targetId: contact.id,
          title: contact.username,
          deletedAt: contact.deletedAt,
          trashExpiresAt: contact.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 제품 row를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedProducts(input: ListTrashInput) {
    const products = await this.client.product.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        productName: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return products
      .map((product) =>
        this.createTrashItem({
          targetType: "PRODUCT",
          targetId: product.id,
          title: product.productName,
          deletedAt: product.deletedAt,
          trashExpiresAt: product.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 딜 row를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedDeals(input: ListTrashInput) {
    const deals = await this.client.deal.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        dealName: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return deals
      .map((deal) =>
        this.createTrashItem({
          targetType: "DEAL",
          targetId: deal.id,
          title: deal.dealName,
          deletedAt: deal.deletedAt,
          trashExpiresAt: deal.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 회의록 row를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedSchedules(input: ListTrashInput) {
    const schedules = await this.client.schedule.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        scheduleTitle: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return schedules
      .map((schedule) =>
        this.createTrashItem({
          targetType: "SCHEDULE",
          targetId: schedule.id,
          title: schedule.scheduleTitle,
          deletedAt: schedule.deletedAt,
          trashExpiresAt: schedule.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  private async listDeletedMeetingNotes(input: ListTrashInput) {
    const meetingNotes = await this.client.meetingNote.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        title: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return meetingNotes
      .map((meetingNote) =>
        this.createTrashItem({
          targetType: "MEETING_NOTE",
          targetId: meetingNote.id,
          title: meetingNote.title,
          deletedAt: meetingNote.deletedAt,
          trashExpiresAt: meetingNote.trashExpiresAt,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 회사 일반 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedCompanyMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.companyMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "COMPANY_MEMO_LOG",
          targetId: memoLog.id,
          title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "COMPANY",
          parentId: memoLog.company.id,
          parentTitle: memoLog.company.companyName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 회사 비밀 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedCompanyPrivateMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.companyUserPrivateMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "COMPANY_PRIVATE_MEMO_LOG",
          targetId: memoLog.id,
          title: "비밀 메모",
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "COMPANY",
          parentId: memoLog.company.id,
          parentTitle: memoLog.company.companyName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 담당자 일반 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedContactMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.contactMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        contact: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "CONTACT_MEMO_LOG",
          targetId: memoLog.id,
          title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "CONTACT",
          parentId: memoLog.contact.id,
          parentTitle: memoLog.contact.username,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 담당자 비밀 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedContactPrivateMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.contactUserPrivateMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        contact: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "CONTACT_PRIVATE_MEMO_LOG",
          targetId: memoLog.id,
          title: "비밀 메모",
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "CONTACT",
          parentId: memoLog.contact.id,
          parentTitle: memoLog.contact.username,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 제품 일반 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedProductMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.productMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        product: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "PRODUCT_MEMO_LOG",
          targetId: memoLog.id,
          title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "PRODUCT",
          parentId: memoLog.product.id,
          parentTitle: memoLog.product.productName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 제품 비밀 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedProductPrivateMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.productUserPrivateMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        deletedAt: true,
        trashExpiresAt: true,
        product: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "PRODUCT_PRIVATE_MEMO_LOG",
          targetId: memoLog.id,
          title: "비밀 메모",
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "PRODUCT",
          parentId: memoLog.product.id,
          parentTitle: memoLog.product.productName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 딜 일반 메모 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedDealMemoLogs(input: ListTrashInput) {
    const memoLogs = await this.client.dealMemoLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        deal: {
          select: {
            id: true,
            dealName: true,
          },
        },
      },
    });

    return memoLogs
      .map((memoLog) =>
        this.createTrashItem({
          targetType: "DEAL_MEMO_LOG",
          targetId: memoLog.id,
          title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
          deletedAt: memoLog.deletedAt,
          trashExpiresAt: memoLog.trashExpiresAt,
          parentType: "DEAL",
          parentId: memoLog.deal.id,
          parentTitle: memoLog.deal.dealName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 삭제된 딜 다음 행동 로그를 휴지통 목록 항목으로 변환해 조회합니다.
  private async listDeletedDealFollowingActionLogs(input: ListTrashInput) {
    const actionLogs = await this.client.dealFollowingActionLog.findMany({
      where: this.createDeletedWhere(input),
      select: {
        id: true,
        followingAction: true,
        deletedAt: true,
        trashExpiresAt: true,
        deal: {
          select: {
            id: true,
            dealName: true,
          },
        },
      },
    });

    return actionLogs
      .map((actionLog) =>
        this.createTrashItem({
          targetType: "DEAL_FOLLOWING_ACTION_LOG",
          targetId: actionLog.id,
          title: actionLog.followingAction,
          deletedAt: actionLog.deletedAt,
          trashExpiresAt: actionLog.trashExpiresAt,
          parentType: "DEAL",
          parentId: actionLog.deal.id,
          parentTitle: actionLog.deal.dealName,
        })
      )
      .filter(isTrashItem);
  }

  // 기능 : 현재 사용자의 복구 가능 삭제 목록 where 조건을 만듭니다.
  private createDeletedWhere(input: ListTrashInput) {
    return {
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gt: input.now,
      },
    };
  }

  // 기능 : 삭제 row의 공통 필드를 휴지통 목록 항목으로 정규화합니다.
  private createTrashItem(input: DeletedItemInput): TrashItem | null {
    if (!input.deletedAt || !input.trashExpiresAt) {
      return null;
    }

    const item: TrashItem = {
      targetType: input.targetType,
      targetId: input.targetId,
      title: input.title,
      deletedAt: input.deletedAt,
      trashExpiresAt: input.trashExpiresAt,
    };

    if (!input.parentType) {
      return item;
    }

    return {
      ...item,
      parentType: input.parentType,
      parentId: input.parentId ?? null,
      parentTitle: input.parentTitle ?? null,
    };
  }

  // 기능 : 메모 유형과 내용을 이용해 목록 표시용 제목을 만듭니다.
  private createMemoTitle(memoType: string, memo: string): string {
    const type = memoType.trim();

    if (type.length > 0) {
      return type;
    }

    const content = memo.trim();

    if (content.length === 0) {
      return "일반 메모";
    }

    if (content.length <= MEMO_TITLE_MAX_LENGTH) {
      return content;
    }

    return `${content.slice(0, MEMO_TITLE_MAX_LENGTH)}...`;
  }

  // 기능 : 대상 유형이 현재 휴지통 필터 조건에 포함되는지 판단합니다.
  private shouldIncludeTarget(
    input: ListTrashInput,
    targetType: TrashTargetType
  ): boolean {
    const metadata = TARGET_METADATA_BY_TYPE.get(targetType);

    if (!metadata) {
      return false;
    }

    if (
      input.targetType &&
      input.targetType !== "ALL" &&
      input.targetType !== targetType
    ) {
      return false;
    }

    if (
      input.itemKind &&
      input.itemKind !== "ALL" &&
      input.itemKind !== metadata.kind
    ) {
      return false;
    }

    if (input.domain && input.domain !== "ALL" && input.domain !== metadata.domain) {
      return false;
    }

    if (!input.logType || input.logType === "ALL") {
      return true;
    }

    return metadata.kind === "LOG" && metadata.logType === input.logType;
  }

  // 기능 : 휴지통 목록 항목을 제목, 위치, 식별자 기준으로 검색합니다.
  private filterByQuery(
    items: readonly TrashItem[],
    query: string | undefined
  ): TrashItem[] {
    const normalizedQuery = query?.trim().toLowerCase();

    if (!normalizedQuery) {
      return [...items];
    }

    return items.filter((item) =>
      [
        item.title,
        item.targetType,
        item.targetId,
        item.parentTitle ?? "",
        item.parentId ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }

  // 기능 : 휴지통 목록 항목을 최신순 또는 만료 임박순으로 정렬합니다.
  private sortTrashItems(
    items: readonly TrashItem[],
    sort: TrashSort | undefined
  ): TrashItem[] {
    return [...items].sort((left, right) => {
      if (sort === "EXPIRES_SOON") {
        return (
          left.trashExpiresAt.getTime() - right.trashExpiresAt.getTime() ||
          right.deletedAt.getTime() - left.deletedAt.getTime()
        );
      }

      return (
        right.deletedAt.getTime() - left.deletedAt.getTime() ||
        left.trashExpiresAt.getTime() - right.trashExpiresAt.getTime()
      );
    });
  }

  // 기능 : 휴지통 대상 유형에 맞는 Prisma 모델의 삭제 상태를 초기화합니다.
  private async restoreByTargetType(
    input: RestoreTrashItemInput
  ): Promise<boolean> {
    switch (input.targetType) {
      case "COMPANY": {
        const result = await this.client.company.updateMany({
          where: this.createRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "CONTACT": {
        const result = await this.client.contact.updateMany({
          where: this.createRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "PRODUCT": {
        const result = await this.client.product.updateMany({
          where: this.createRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "DEAL": {
        const result = await this.client.deal.updateMany({
          where: this.createRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "SCHEDULE":
        return this.restoreSchedule(input);
      case "MEETING_NOTE": {
        const result = await this.client.meetingNote.updateMany({
          where: this.createRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "COMPANY_MEMO_LOG": {
        const result = await this.client.companyMemoLog.updateMany({
          where: this.createCompanyLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "COMPANY_PRIVATE_MEMO_LOG": {
        const result = await this.client.companyUserPrivateMemoLog.updateMany({
          where: this.createCompanyLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "CONTACT_MEMO_LOG": {
        const result = await this.client.contactMemoLog.updateMany({
          where: this.createContactLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "CONTACT_PRIVATE_MEMO_LOG": {
        const result = await this.client.contactUserPrivateMemoLog.updateMany({
          where: this.createContactLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "PRODUCT_MEMO_LOG": {
        const result = await this.client.productMemoLog.updateMany({
          where: this.createProductLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "PRODUCT_PRIVATE_MEMO_LOG": {
        const result = await this.client.productUserPrivateMemoLog.updateMany({
          where: this.createProductLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "DEAL_MEMO_LOG": {
        const result = await this.client.dealMemoLog.updateMany({
          where: this.createDealLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
      case "DEAL_FOLLOWING_ACTION_LOG": {
        const result = await this.client.dealFollowingActionLog.updateMany({
          where: this.createDealLogRestoreWhere(input),
          data: this.createRestoreData(),
        });

        return result.count > 0;
      }
    }
  }

  // 기능 : 로그의 직접 상위 도메인 row가 삭제 상태이면 복구 차단 사유를 반환합니다.
  private async getRestoreBlockedReason(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreBlockedReason | null> {
    return (await this.hasDeletedParent(input)) ? "PARENT_DELETED" : null;
  }

  // 기능 : 복구 대상 로그의 직접 상위 도메인 row 삭제 여부를 확인합니다.
  private async restoreSchedule(input: RestoreTrashItemInput): Promise<boolean> {
    const schedule = await this.client.schedule.findFirst({
      where: this.createRestoreWhere(input),
      select: {
        sourceType: true,
      },
    });

    if (!schedule) {
      return false;
    }

    const result = await this.client.schedule.updateMany({
      where: this.createRestoreWhere(input),
      data: {
        ...this.createRestoreData(),
        ...(schedule.sourceType === "GOOGLE"
          ? { externalSyncStatus: "LOCAL_MODIFIED" as const }
          : {}),
      },
    });

    return result.count > 0;
  }

  private async findRestoredScheduleReminder(input: RestoreTrashItemInput) {
    const schedule = await this.client.schedule.findFirst({
      where: {
        id: input.targetId,
        userId: input.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        scheduleTitle: true,
        startAt: true,
      },
    });

    if (!schedule) {
      return null;
    }

    return {
      scheduleId: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt,
    };
  }

  private async hasDeletedParent(input: RestoreTrashItemInput) {
    switch (input.targetType) {
      case "COMPANY":
      case "CONTACT":
      case "PRODUCT":
      case "DEAL":
      case "SCHEDULE":
      case "MEETING_NOTE":
        return false;
      case "COMPANY_MEMO_LOG": {
        const memoLog = await this.client.companyMemoLog.findFirst({
          where: this.createCompanyDeletedParentWhere(input),
          select: { id: true },
        });

        return memoLog !== null;
      }
      case "COMPANY_PRIVATE_MEMO_LOG": {
        const memoLog =
          await this.client.companyUserPrivateMemoLog.findFirst({
            where: this.createCompanyDeletedParentWhere(input),
            select: { id: true },
          });

        return memoLog !== null;
      }
      case "CONTACT_MEMO_LOG": {
        const memoLog = await this.client.contactMemoLog.findFirst({
          where: this.createContactDeletedParentWhere(input),
          select: { id: true },
        });

        return memoLog !== null;
      }
      case "CONTACT_PRIVATE_MEMO_LOG": {
        const memoLog =
          await this.client.contactUserPrivateMemoLog.findFirst({
            where: this.createContactDeletedParentWhere(input),
            select: { id: true },
          });

        return memoLog !== null;
      }
      case "PRODUCT_MEMO_LOG": {
        const memoLog = await this.client.productMemoLog.findFirst({
          where: this.createProductDeletedParentWhere(input),
          select: { id: true },
        });

        return memoLog !== null;
      }
      case "PRODUCT_PRIVATE_MEMO_LOG": {
        const memoLog =
          await this.client.productUserPrivateMemoLog.findFirst({
            where: this.createProductDeletedParentWhere(input),
            select: { id: true },
          });

        return memoLog !== null;
      }
      case "DEAL_MEMO_LOG": {
        const memoLog = await this.client.dealMemoLog.findFirst({
          where: this.createDealDeletedParentWhere(input),
          select: { id: true },
        });

        return memoLog !== null;
      }
      case "DEAL_FOLLOWING_ACTION_LOG": {
        const actionLog =
          await this.client.dealFollowingActionLog.findFirst({
            where: this.createDealDeletedParentWhere(input),
            select: { id: true },
          });

        return actionLog !== null;
      }
    }
  }

  // 기능 : 현재 사용자의 복구 가능 삭제 row where 조건을 만듭니다.
  private createRestoreWhere(input: RestoreTrashItemInput) {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gt: input.now,
      },
    };
  }

  // 기능 : 직접 상위 도메인 row가 활성 상태인 로그 복구 where 조건을 만듭니다.
  private createCompanyLogRestoreWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      company: this.createActiveParentWhere(input),
    };
  }

  private createContactLogRestoreWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      contact: this.createActiveParentWhere(input),
    };
  }

  private createProductLogRestoreWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      product: this.createActiveParentWhere(input),
    };
  }

  private createDealLogRestoreWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      deal: this.createActiveParentWhere(input),
    };
  }

  private createCompanyDeletedParentWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      company: this.createDeletedParentWhere(input),
    };
  }

  private createContactDeletedParentWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      contact: this.createDeletedParentWhere(input),
    };
  }

  private createProductDeletedParentWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      product: this.createDeletedParentWhere(input),
    };
  }

  private createDealDeletedParentWhere(input: RestoreTrashItemInput) {
    return {
      ...this.createRestoreWhere(input),
      deal: this.createDeletedParentWhere(input),
    };
  }

  private createActiveParentWhere(input: RestoreTrashItemInput) {
    return {
      userId: input.userId,
      deletedAt: null,
    };
  }

  private createDeletedParentWhere(input: RestoreTrashItemInput) {
    return {
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  // 기능 : 복구 시 초기화할 soft delete 컬럼 값을 만듭니다.
  private createRestoreData() {
    return {
      deletedAt: null,
      deletedByUserId: null,
      trashExpiresAt: null,
    };
  }

  // 기능 : 휴지통 목록 page 값을 최소 1로 정규화합니다.
  private normalizePage(page: number | undefined): number {
    return Math.max(page ?? DEFAULT_PAGE, 1);
  }

  // 기능 : 휴지통 목록 pageSize 값을 허용 범위 안으로 정규화합니다.
  private normalizePageSize(pageSize: number | undefined): number {
    return Math.min(
      Math.max(pageSize ?? DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    );
  }
}
