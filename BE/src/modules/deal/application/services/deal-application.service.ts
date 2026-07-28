import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  DealListSort,
  DEAL_REPOSITORY,
  type DealCompanyRecord,
  type DealContactRecord,
  type DealDetailRecord,
  type DealFollowingActionLogRecord,
  type DealLatestActivitySummaryRecord,
  type DealListRecord,
  type DealLogCursor,
  type DealMemoLogRecord,
  type DealNextFollowingActionRecord,
  type DealProductRecord,
  type DealProductSummaryRecord,
  type DealRepository,
  type UpdateDealFollowingActionLogInput,
  type UpdateDealInput,
  type UpdateDealMemoLogInput,
} from "@/modules/deal/application/ports/deal.repository";
import {
  DEAL_ACTIVITY_TYPES,
  MANUAL_DEAL_ACTIVITY_TYPES,
  type CreateDealActivityInput,
  type DealActivityCursor,
  type DealActivityRecord,
  type DealActivitySourceTypeCode,
  type DealActivityTypeCode,
  type ManualDealActivityTypeCode,
} from "@/modules/deal/application/ports/deal-activity.repository";
import {
  createDealActivityIfAbsent,
  createDealActivityLinkedRecord,
  createDealLinkedRecord,
  createSafeActivitySummary,
  DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES,
  normalizeDealActivityTargetPath,
  type DealActivityLinkedRecordTargetType,
  type DealActivityLinkedRecordValue,
} from "@/modules/deal/application/services/deal-activity-helper";
import {
  DealActivityNotEditableError,
  DealActivityNotFoundError,
  DealExportFailedError,
  DealFollowingActionLogNotFoundError,
  DealMemoLogNotFoundError,
  DealNotFoundError,
  RelatedResourceNotFoundError,
} from "@/modules/deal/domain/deal.errors";
import {
  CancelDealDueReminderUseCase,
  ScheduleDealDueReminderUseCase,
} from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import {
  DEAL_STATUS_CODES,
  DealStatusCode,
  getDealStatusLabel,
} from "@/modules/deal/domain/deal-status";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  normalizeCurrencyCode,
  resolveCurrencyCodeWithDefault,
} from "@/shared/application/currency/currency-code";
import {
  createTimestampedXlsxFileName,
  type ExportedXlsxFileResponse,
  XLSX_CONTENT_TYPE,
} from "@/shared/application/export/xlsx-export-file";
import {
  XLSX_WORKBOOK_WRITER,
  type XlsxRow,
  type XlsxWorkbookWriter,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { createTrashRetentionTimestamps } from "@/shared/application/trash/trash-retention";
import {
  FieldValidationDomainError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEAL_PAGE_SIZE = 15;
const DEAL_LOG_PAGE_SIZE = 10;
const DEAL_ACTIVITY_PAGE_SIZE = 10;
const DEAL_ACTIVITY_TITLE_MAX_LENGTH = 120;
const DEAL_ACTIVITY_BODY_MAX_LENGTH = 2000;
const DEAL_ACTIVITY_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
const XLSX_DATE_NUM_FORMAT = "yyyy-mm-dd hh:mm:ss";
const INITIAL_DEAL_MEMO_TYPE = "초기 메모";
const DEAL_ACTIVITY_TYPE_SET = new Set<DealActivityTypeCode>(DEAL_ACTIVITY_TYPES);
const MANUAL_DEAL_ACTIVITY_TYPE_SET = new Set<DealActivityTypeCode>(
  MANUAL_DEAL_ACTIVITY_TYPES
);
const DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPE_SET = new Set<string>(
  DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPES
);

// 역할 : DealListQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealListQueryInput {
  readonly page?: number;
  readonly search?: string;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly dealStatus?: DealStatusCode;
  readonly sort?: DealListSort;
}

// 역할 : DealStageCountQueryInput 단계별 개수 query 조건을 정의합니다.
export interface DealStageCountQueryInput {
  readonly search?: string;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
}

// 역할 : DealExportQueryInput 딜 export query 조건을 정의합니다.
export interface DealExportQueryInput {
  readonly search?: string;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly dealStatus?: DealStatusCode;
  readonly sort?: DealListSort;
}

// 역할 : CursorQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CursorQueryInput {
  readonly cursor?: string;
}

// 역할 : CreateDealCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealCommand {
  readonly dealName: string;
  readonly dealCost: number;
  readonly currencyCode?: string;
  readonly companyIds: string[];
  readonly contactIds: string[];
  readonly productIds: string[];
  readonly dealStatus: DealStatusCode;
  readonly followingAction: string;
  readonly expectedEndDate: string;
  readonly dealMemo?: string | null;
}

// 역할 : UpdateDealCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateDealCommand {
  readonly dealName?: string;
  readonly dealCost?: number;
  readonly currencyCode?: string;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly productIds?: string[];
  readonly expectedEndDate?: string;
  readonly dealStatus?: DealStatusCode;
}

type NormalizedDealUpdateInput = UpdateDealInput & {
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly productIds?: string[];
};

// 역할 : DealStageCountResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealStageCountResponse {
  readonly items: Array<{
    readonly dealStatus: DealStatusCode;
    readonly dealStatusLabel: string;
    readonly count: number;
  }>;
}

// 역할 : DealListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealListResponse {
  readonly items: DealListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : DealListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealListItemResponse {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly currencyCode: string;
  readonly dealStatus: DealStatusCode;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: DealCompanyRecord[];
  readonly contacts: DealContactResponse[];
  readonly products: DealProductSummaryResponse[];
  readonly latestActivity: DealLatestActivitySummaryResponse | null;
  readonly latestFollowingAction: DealLatestFollowingActionResponse | null;
  readonly nextFollowingAction: DealNextFollowingActionResponse | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : DealDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealDetailResponse
  extends Omit<DealListItemResponse, "products" | "latestActivity"> {
  readonly products: DealProductRecord[];
}

// 역할 : DealProductSummaryResponse 딜 목록 제품 요약 응답 구조를 정의합니다.
export interface DealProductSummaryResponse {
  readonly id: string;
  readonly productName: string;
  readonly isDeleted: boolean;
  readonly productCategory: {
    readonly id: string;
    readonly categoryName: string;
  } | null;
  readonly productStatus: {
    readonly id: string;
    readonly statusName: string;
  } | null;
}

// 역할 : DealLatestActivitySummaryResponse 딜 목록 최신 활동 요약 응답 구조를 정의합니다.
export interface DealLatestActivitySummaryResponse {
  readonly id: string;
  readonly activityType: DealActivityTypeCode;
  readonly title: string;
  readonly summary: string | null;
  readonly occurredAt: string;
}

// 역할 : DealContactResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealContactResponse {
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
  readonly contactJobGrade: {
    readonly id: string;
    readonly jobGradeName: string;
  };
  readonly contactDepartment: {
    readonly id: string;
    readonly departmentName: string;
  };
}

// 역할 : DealLatestFollowingActionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealLatestFollowingActionResponse {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
}

export interface DealNextFollowingActionResponse
  extends DealLatestFollowingActionResponse {
  readonly remainingCount: number;
}

// 역할 : DealCompanyOptionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealCompanyOptionResponse {
  readonly items: DealCompanyRecord[];
}

// 역할 : DealContactOptionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealContactOptionResponse {
  readonly items: Array<DealContactResponse & { readonly label: string }>;
}

// 역할 : DealProductOptionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealProductOptionResponse {
  readonly items: DealProductRecord[];
}

// 역할 : DealFollowingActionLogListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealFollowingActionLogListResponse {
  readonly items: DealFollowingActionLogListItemResponse[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : DealFollowingActionLogListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealFollowingActionLogListItemResponse {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
}

// 역할 : DealFollowingActionLogResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealFollowingActionLogResponse
  extends DealFollowingActionLogListItemResponse {
  readonly updatedAt: string;
}

// 역할 : DealMemoLogListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealMemoLogListResponse {
  readonly items: DealMemoLogListItemResponse[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : DealMemoLogListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealMemoLogListItemResponse {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: string;
}

// 역할 : DealMemoLogResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealMemoLogResponse extends DealMemoLogListItemResponse {
  readonly updatedAt: string;
}

// 역할 : DealActivityListQueryInput 딜 활동 목록 query 조건을 정의합니다.
export interface DealActivityListQueryInput extends CursorQueryInput {
  readonly type?: DealActivityTypeCode;
}

// 역할 : CreateManualDealActivityCommand 수동 딜 활동 생성 입력을 정의합니다.
export interface CreateManualDealActivityCommand {
  readonly activityType: ManualDealActivityTypeCode;
  readonly title: string;
  readonly body?: string | null;
  readonly occurredAt?: string;
}

// 역할 : UpdateManualDealActivityCommand 수동 딜 활동 수정 입력을 정의합니다.
export interface UpdateManualDealActivityCommand {
  readonly activityType?: ManualDealActivityTypeCode;
  readonly title?: string;
  readonly body?: string | null;
  readonly occurredAt?: string;
}

// 역할 : DealActivityLinkedRecordResponse 딜 활동 연결 record 응답 구조를 정의합니다.
export interface DealActivityLinkedRecordResponse {
  readonly targetType: DealActivityLinkedRecordTargetType;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

// 역할 : DealActivityResponse 딜 활동 단건 응답 구조를 정의합니다.
export interface DealActivityResponse {
  readonly id: string;
  readonly dealId: string;
  readonly activityType: DealActivityTypeCode;
  readonly sourceType: DealActivitySourceTypeCode;
  readonly sourceId: string | null;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly occurredAt: string;
  readonly isEditable: boolean;
  readonly linkedRecords: DealActivityLinkedRecordResponse[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : DealActivityListResponse 딜 활동 cursor 목록 응답 구조를 정의합니다.
export interface DealActivityListResponse {
  readonly items: DealActivityResponse[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

type NormalizedManualDealActivityCreateInput = {
  readonly activityType: ManualDealActivityTypeCode;
  readonly title: string;
  readonly body: string | null;
  readonly occurredAt: Date;
};

type NormalizedManualDealActivityUpdateInput = {
  readonly activityType?: ManualDealActivityTypeCode;
  readonly title?: string;
  readonly body?: string | null;
  readonly occurredAt?: Date;
};

// 역할 : DealApplicationService 딜 도메인 application 유스케이스를 제공합니다.
@Injectable()
export class DealApplicationService {
  // 기능 : 딜 저장소, xlsx writer, 로그 서비스를 주입받습니다.
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
    private readonly scheduleDealDueReminder: ScheduleDealDueReminderUseCase,
    private readonly cancelDealDueReminder: CancelDealDueReminderUseCase,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 딜 상태별 개수를 조회합니다.
  async countDealsByStatus(
    currentUser: CurrentUserContext,
    query: DealStageCountQueryInput = {}
  ): Promise<DealStageCountResponse> {
    const search = this.normalizeOptionalText(query.search);
    const companyIds = this.normalizeOptionalIdArray(query.companyIds ?? []);
    const contactIds = this.normalizeOptionalIdArray(query.contactIds ?? []);
    const counts = await this.dealRepository.countDealsByStatus({
      userId: currentUser.id,
      ...(search ? { search } : {}),
      ...(companyIds.length > 0 ? { companyIds } : {}),
      ...(contactIds.length > 0 ? { contactIds } : {}),
    });

    this.logEvent("deal.stage_counts_viewed", {
      userId: currentUser.id,
      hasSearch: Boolean(search),
      companyFilterCount: companyIds.length,
      contactFilterCount: contactIds.length,
    });

    return {
      items: DEAL_STATUS_CODES.map((dealStatus) => ({
        dealStatus,
        dealStatusLabel: getDealStatusLabel(dealStatus),
        count: counts.get(dealStatus) ?? 0,
      })),
    };
  }

  // 기능 : 현재 사용자의 딜 목록을 15개 단위 페이지로 조회합니다.
  async listDeals(
    currentUser: CurrentUserContext,
    query: DealListQueryInput
  ): Promise<DealListResponse> {
    const page = query.page ?? 1;
    const search = this.normalizeOptionalText(query.search);
    const sort = query.sort ?? DealListSort.CREATED_AT_DESC;
    const companyIds = this.normalizeOptionalIdArray(query.companyIds ?? []);
    const contactIds = this.normalizeOptionalIdArray(query.contactIds ?? []);

    const result = await this.dealRepository.listDeals({
      userId: currentUser.id,
      page,
      pageSize: DEAL_PAGE_SIZE,
      sort,
      ...(search ? { search } : {}),
      ...(companyIds.length > 0 ? { companyIds } : {}),
      ...(contactIds.length > 0 ? { contactIds } : {}),
      ...(query.dealStatus ? { dealStatus: query.dealStatus } : {}),
    });

    this.logEvent("deal.listed", {
      userId: currentUser.id,
      sort,
      hasSearch: Boolean(search),
      companyFilterCount: companyIds.length,
      contactFilterCount: contactIds.length,
      hasDealStatus: Boolean(query.dealStatus),
      productSummaryCount: result.items.reduce(
        (total, deal) => total + deal.products.length,
        0
      ),
      latestActivityCount: result.items.filter(
        (deal) => deal.latestActivity !== null
      ).length,
    });

    return {
      items: result.items.map((deal) => this.toDealListItem(deal)),
      page,
      pageSize: DEAL_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / DEAL_PAGE_SIZE),
    };
  }

  // 기능 : 검색, 필터, 정렬이 반영된 딜 목록을 xlsx 파일로 생성합니다.
  async exportDealsXlsx(
    currentUser: CurrentUserContext,
    query: DealExportQueryInput
  ): Promise<ExportedXlsxFileResponse> {
    const search = this.normalizeOptionalText(query.search);
    const sort = query.sort ?? DealListSort.CREATED_AT_DESC;
    const companyIds = this.normalizeOptionalIdArray(query.companyIds ?? []);
    const contactIds = this.normalizeOptionalIdArray(query.contactIds ?? []);

    const deals = await this.dealRepository.listDealsForExport({
      userId: currentUser.id,
      sort,
      ...(search ? { search } : {}),
      ...(companyIds.length > 0 ? { companyIds } : {}),
      ...(contactIds.length > 0 ? { contactIds } : {}),
      ...(query.dealStatus ? { dealStatus: query.dealStatus } : {}),
    });

    const content = await this.writeDealExportXlsx(deals);

    this.logEvent("deal.exported", {
      userId: currentUser.id,
      rowCount: deals.length,
      sort,
      hasSearch: Boolean(search),
      companyFilterCount: companyIds.length,
      contactFilterCount: contactIds.length,
      hasDealStatus: Boolean(query.dealStatus),
    });

    return {
      fileName: createTimestampedXlsxFileName("deals"),
      contentType: XLSX_CONTENT_TYPE,
      content,
    };
  }

  // 기능 : 현재 사용자의 딜 단건 상세를 조회합니다.
  async getDeal(
    currentUser: CurrentUserContext,
    dealId: string
  ): Promise<DealDetailResponse> {
    const deal = await this.dealRepository.findDeal(currentUser.id, dealId);

    if (!deal) {
      throw new DealNotFoundError();
    }

    this.logEvent("deal.viewed", { userId: currentUser.id, dealId });

    return this.toDealDetail(deal);
  }

  // 기능 : 현재 사용자의 딜 활동 timeline을 cursor 기준으로 조회합니다.
  async listDealActivities(
    currentUser: CurrentUserContext,
    dealId: string,
    query: DealActivityListQueryInput
  ): Promise<DealActivityListResponse> {
    await this.assertDealExists(currentUser.id, dealId);

    const type = this.normalizeOptionalDealActivityType(query.type);
    const activities = await this.dealRepository.listActivitiesForDeal({
      userId: currentUser.id,
      dealId,
      cursor: this.parseActivityCursor(query.cursor),
      take: DEAL_ACTIVITY_PAGE_SIZE + 1,
      ...(type ? { type } : {}),
    });

    this.logEvent("deal.activity.listed", {
      userId: currentUser.id,
      dealId,
      hasCursor: Boolean(query.cursor),
      type: type ?? null,
      count: Math.min(activities.length, DEAL_ACTIVITY_PAGE_SIZE),
    });

    return this.toDealActivityConnection(activities);
  }

  // 기능 : 현재 사용자의 딜에 수동 활동을 생성합니다.
  async createManualDealActivity(
    currentUser: CurrentUserContext,
    dealId: string,
    input: CreateManualDealActivityCommand
  ): Promise<DealActivityResponse> {
    const normalized = this.normalizeCreateManualDealActivityInput(input);

    const activity = await this.dealRepository.runInTransaction(
      async (repository) => {
        const deal = await repository.findDeal(currentUser.id, dealId);

        if (!deal) {
          throw new DealNotFoundError();
        }

        return repository.createActivity({
          userId: currentUser.id,
          dealId,
          activityType: normalized.activityType,
          sourceType: "USER",
          sourceId: null,
          title: normalized.title,
          summary: null,
          body: normalized.body,
          occurredAt: normalized.occurredAt,
          linkedRecordsJson: [createDealLinkedRecord(deal.id, deal.dealName)],
          metadataJson: null,
        });
      }
    );

    this.logEvent("deal.activity.manual_created", {
      userId: currentUser.id,
      dealId,
      activityId: activity.id,
      activityType: activity.activityType,
    });

    return this.toDealActivityResponse(activity);
  }

  // 기능 : 현재 사용자의 수동 딜 활동만 수정합니다.
  async updateManualDealActivity(
    currentUser: CurrentUserContext,
    dealId: string,
    activityId: string,
    input: UpdateManualDealActivityCommand
  ): Promise<DealActivityResponse> {
    const normalized = this.normalizeUpdateManualDealActivityInput(input);

    const activity = await this.dealRepository.runInTransaction(
      async (repository) => {
        const deal = await repository.findDeal(currentUser.id, dealId);

        if (!deal) {
          throw new DealActivityNotFoundError();
        }

        const existing = await repository.findActivityByIdForDeal({
          userId: currentUser.id,
          dealId,
          activityId,
        });

        if (!existing) {
          throw new DealActivityNotFoundError();
        }

        if (existing.sourceType !== "USER") {
          throw new DealActivityNotEditableError();
        }

        const updated = await repository.updateUserActivity({
          userId: currentUser.id,
          dealId,
          activityId,
          ...normalized,
          linkedRecordsJson: [createDealLinkedRecord(deal.id, deal.dealName)],
        });

        if (!updated) {
          throw new DealActivityNotFoundError();
        }

        return updated;
      }
    );

    this.logEvent("deal.activity.manual_updated", {
      userId: currentUser.id,
      dealId,
      activityId: activity.id,
      activityType: activity.activityType,
    });

    return this.toDealActivityResponse(activity);
  }

  // 기능 : 딜을 생성하고 첫 다음 행동 로그를 같은 transaction에서 생성합니다.
  async createDeal(
    currentUser: CurrentUserContext,
    input: CreateDealCommand
  ): Promise<DealDetailResponse> {
    const dealName = this.normalizeRequiredText(
      input.dealName,
      "dealName is required"
    );
    const dealCost = this.normalizeDealCost(input.dealCost);
    const followingAction = this.normalizeRequiredText(
      input.followingAction,
      "followingAction is required"
    );
    const dealMemo = this.normalizeOptionalText(input.dealMemo);
    const companyIds = this.normalizeRequiredIdArray(
      input.companyIds,
      "companyIds must contain at least one company",
      "companyIds must not contain duplicates"
    );
    const contactIds = this.normalizeRequiredIdArray(
      input.contactIds,
      "contactIds must contain at least one contact",
      "contactIds must not contain duplicates"
    );
    const productIds = this.normalizeProductIds(input.productIds);
    const expectedEndDate = this.parseDateOnly(input.expectedEndDate);

    let createdDealId: string | null = null;
    let autoActivityCount = 0;

    await this.dealRepository.runInTransaction(async (repository) => {
      const relatedResources = await this.assertRelatedResourcesExist(
        currentUser.id,
        companyIds,
        contactIds,
        productIds,
        repository
      );
      const currencyCode = this.resolveDealCreateCurrencyCode(
        input.currencyCode,
        productIds,
        relatedResources.products,
        currentUser.defaultCurrencyCode
      );

      const deal = await repository.createDeal({
        userId: currentUser.id,
        dealName,
        dealCost,
        currencyCode,
        dealStatus: input.dealStatus,
        expectedEndDate,
      });
      createdDealId = deal.id;

      autoActivityCount += await this.createAutomaticDealActivity(repository, {
        userId: currentUser.id,
        dealId: deal.id,
        activityType: "DEAL_CREATED",
        sourceType: "SYSTEM",
        sourceId: deal.id,
        title: "딜을 만들었어요.",
        summary: createSafeActivitySummary(dealName),
        body: null,
        occurredAt: new Date(),
        linkedRecordsJson: [createDealLinkedRecord(deal.id, dealName)],
        metadataJson: {
          dealId: deal.id,
        },
      });

      await repository.createDealCompanies({
        userId: currentUser.id,
        dealId: deal.id,
        companyIds,
      });

      await repository.createDealContacts({
        userId: currentUser.id,
        dealId: deal.id,
        contactIds,
      });

      await repository.createDealProducts({
        userId: currentUser.id,
        dealId: deal.id,
        productIds,
      });

      const followingActionLog = await repository.createFollowingActionLog({
        userId: currentUser.id,
        dealId: deal.id,
        followingAction,
      });

      autoActivityCount += await this.createAutomaticDealActivity(repository, {
        userId: currentUser.id,
        dealId: deal.id,
        activityType: "NEXT_ACTION_CREATED",
        sourceType: "NEXT_ACTION",
        sourceId: followingActionLog.id,
        title: "다음 행동을 추가했어요.",
        summary: createSafeActivitySummary(followingAction),
        body: null,
        occurredAt: followingActionLog.createdAt,
        linkedRecordsJson: [createDealLinkedRecord(deal.id, dealName)],
        metadataJson: {
          followingActionLogId: followingActionLog.id,
        },
      });

      if (dealMemo) {
        await repository.createMemoLog({
          userId: currentUser.id,
          dealId: deal.id,
          memoType: INITIAL_DEAL_MEMO_TYPE,
          memo: dealMemo,
        });
      }

      await this.scheduleDealDueReminder.executeWithRepository(
        {
          userId: currentUser.id,
          dealId: deal.id,
          dealName,
          expectedEndDate,
          userTimeZone: currentUser.timeZone,
        },
        repository
      );
    });

    if (!createdDealId) {
      throw new DealNotFoundError();
    }

    const createdDeal = await this.dealRepository.findDeal(
      currentUser.id,
      createdDealId
    );

    if (!createdDeal) {
      throw new DealNotFoundError();
    }

    this.logEvent("deal.created", {
      userId: currentUser.id,
      dealId: createdDealId,
      companyIds,
      contactIds,
      productIds,
      dealStatus: input.dealStatus,
    });
    this.logAutomaticActivityCreated(
      currentUser.id,
      createdDealId,
      autoActivityCount
    );

    return this.toDealDetail(createdDeal);
  }

  // 기능 : 딜 기본 정보를 수정합니다.
  async updateDeal(
    currentUser: CurrentUserContext,
    dealId: string,
    input: UpdateDealCommand
  ): Promise<DealDetailResponse> {
    const updateInput = this.normalizeDealUpdateInput(input);

    if (Object.keys(updateInput).length === 0) {
      throw new ValidationDomainError("At least one deal field is required");
    }

    const existingDeal = await this.dealRepository.findDeal(currentUser.id, dealId);

    if (!existingDeal) {
      throw new DealNotFoundError();
    }

    const finalCompanyIds =
      updateInput.companyIds ?? existingDeal.companies.map((company) => company.id);
    const finalContactIds =
      updateInput.contactIds ?? existingDeal.contacts.map((contact) => contact.id);
    const finalProductIds =
      updateInput.productIds ?? existingDeal.products.map((product) => product.id);
    const finalDealName = updateInput.dealName ?? existingDeal.dealName;
    const finalExpectedEndDate =
      updateInput.expectedEndDate ?? existingDeal.expectedEndDate;
    const stageChanged =
      updateInput.dealStatus !== undefined &&
      updateInput.dealStatus !== existingDeal.dealStatus;

    let dealUpdated = false;
    let autoActivityCount = 0;

    await this.dealRepository.runInTransaction(async (repository) => {
      await this.assertRelatedResourcesExist(
        currentUser.id,
        finalCompanyIds,
        finalContactIds,
        finalProductIds,
        repository
      );

      const { companyIds, contactIds, productIds, ...dealFields } = updateInput;

      if (Object.keys(dealFields).length > 0) {
        dealUpdated = await repository.updateDeal(
          currentUser.id,
          dealId,
          dealFields
        );
      } else {
        dealUpdated = true;
      }

      if (productIds !== undefined) {
        await repository.replaceDealProducts({
          userId: currentUser.id,
          dealId,
          productIds,
        });
      }

      if (companyIds !== undefined) {
        await repository.replaceDealCompanies({
          userId: currentUser.id,
          dealId,
          companyIds,
        });
      }

      if (contactIds !== undefined) {
        await repository.replaceDealContacts({
          userId: currentUser.id,
          dealId,
          contactIds,
        });
      }

      await this.scheduleDealDueReminder.executeWithRepository(
        {
          userId: currentUser.id,
          dealId,
          dealName: finalDealName,
          expectedEndDate: finalExpectedEndDate,
          userTimeZone: currentUser.timeZone,
        },
        repository
      );

      if (dealUpdated && stageChanged && updateInput.dealStatus) {
        const fromStatusLabel = getDealStatusLabel(existingDeal.dealStatus);
        const toStatusLabel = getDealStatusLabel(updateInput.dealStatus);

        await repository.createActivity({
          userId: currentUser.id,
          dealId,
          activityType: "STAGE_CHANGED",
          sourceType: "SYSTEM",
          sourceId: dealId,
          title: "단계가 바뀌었어요.",
          summary: `${fromStatusLabel} -> ${toStatusLabel}`,
          body: null,
          occurredAt: new Date(),
          linkedRecordsJson: [createDealLinkedRecord(dealId, finalDealName)],
          metadataJson: {
            fromStatus: existingDeal.dealStatus,
            fromStatusLabel,
            toStatus: updateInput.dealStatus,
            toStatusLabel,
          },
        });
        autoActivityCount += 1;
      }
    });

    if (!dealUpdated) {
      throw new DealNotFoundError();
    }

    const deal = await this.dealRepository.findDeal(currentUser.id, dealId);

    if (!deal) {
      throw new DealNotFoundError();
    }

    this.logEvent("deal.updated", {
      userId: currentUser.id,
      dealId,
      dealStatus: updateInput.dealStatus ?? null,
      companyIds: updateInput.companyIds ?? null,
      contactIds: updateInput.contactIds ?? null,
      productIds: updateInput.productIds ?? null,
    });
    this.logAutomaticActivityCreated(currentUser.id, dealId, autoActivityCount);

    return this.toDealDetail(deal);
  }

  // 기능 : 현재 사용자의 딜을 휴지통 상태로 전환합니다.
  async deleteDeal(
    currentUser: CurrentUserContext,
    dealId: string
  ): Promise<void> {
    // 1. 삭제 대상 딜이 현재 사용자 소유의 활성 딜인지 검증한다.
    await this.assertDealExists(currentUser.id, dealId);

    // 2. 휴지통 보관 정책에 맞는 삭제 시각과 만료 시각을 계산한다.
    const timestamps = createTrashRetentionTimestamps();

    // 3. 딜 자체만 휴지통 상태로 전환하고 reminder 취소를 같은 transaction에서 처리한다.
    await this.dealRepository.runInTransaction(async (repository) => {
      const deleted = await repository.deleteDeal({
        userId: currentUser.id,
        dealId,
        deletedAt: timestamps.deletedAt,
        deletedByUserId: currentUser.id,
        trashExpiresAt: timestamps.trashExpiresAt,
      });

      // 4. 삭제 결과가 없으면 딜 없음 오류로 중단한다.
      if (!deleted) {
        throw new DealNotFoundError();
      }

      await this.cancelDealDueReminder.executeWithRepository(
        {
          userId: currentUser.id,
          dealId,
          cancelReason: "SOURCE_DELETED",
        },
        repository
      );
    });

    // 5. 민감한 입력값 없이 딜 삭제 이벤트를 기록한다.
    this.logEvent("deal.deleted", { userId: currentUser.id, dealId });
  }

  // 기능 : 현재 사용자의 회사 선택 옵션 목록을 조회합니다.
  async listCompanyOptions(
    currentUser: CurrentUserContext
  ): Promise<DealCompanyOptionResponse> {
    const items = await this.dealRepository.listCompanyOptions(currentUser.id);

    this.logEvent("deal.company_options_listed", { userId: currentUser.id });

    return { items };
  }

  // 기능 : 현재 사용자의 담당자 선택 옵션 목록을 조회합니다.
  async listContactOptions(
    currentUser: CurrentUserContext
  ): Promise<DealContactOptionResponse> {
    const contacts = await this.dealRepository.listContactOptions(currentUser.id);

    this.logEvent("deal.contact_options_listed", { userId: currentUser.id });

    return {
      items: contacts.map((contact) => ({
        ...this.toDealContactResponse(contact),
        label: this.createContactLabel(contact),
      })),
    };
  }

  // 기능 : 현재 사용자의 제품 선택 옵션 목록을 조회합니다.
  async listProductOptions(
    currentUser: CurrentUserContext
  ): Promise<DealProductOptionResponse> {
    const items = await this.dealRepository.listProductOptions(currentUser.id);

    this.logEvent("deal.product_options_listed", { userId: currentUser.id });

    return { items };
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그 전체 목록을 조회합니다.
  async listFollowingActionLogs(
    currentUser: CurrentUserContext,
    dealId: string,
    query: CursorQueryInput
  ): Promise<DealFollowingActionLogListResponse> {
    // 1. 조회 대상 딜이 현재 사용자 소유인지 검증한다.
    await this.assertDealExists(currentUser.id, dealId);

    // 2. cursor 조건으로 다음 행동 로그를 페이지 크기보다 1개 더 조회한다.
    const logs = await this.dealRepository.listFollowingActionLogs({
      userId: currentUser.id,
      dealId,
      cursor: this.parseCursor(query.cursor),
      take: DEAL_LOG_PAGE_SIZE + 1,
    });

    // 3. 조회 이벤트를 구조화 로그로 남긴다.
    this.logEvent("deal.following_action.listed", {
      userId: currentUser.id,
      dealId,
      hasCursor: Boolean(query.cursor),
    });

    // 4. 조회 결과를 cursor connection 응답으로 변환한다.
    return this.toFollowingActionLogConnection(logs);
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그를 생성합니다.
  async createFollowingActionLog(
    currentUser: CurrentUserContext,
    dealId: string,
    input: { readonly followingAction: string }
  ): Promise<DealFollowingActionLogResponse> {
    const followingAction = this.normalizeRequiredText(
      input.followingAction,
      "followingAction is required"
    );
    let autoActivityCount = 0;

    const log = await this.dealRepository.runInTransaction(async (repository) => {
      const deal = await repository.findDeal(currentUser.id, dealId);

      if (!deal) {
        throw new DealNotFoundError();
      }

      const created = await repository.createFollowingActionLog({
        userId: currentUser.id,
        dealId,
        followingAction,
      });

      autoActivityCount += await this.createAutomaticDealActivity(repository, {
        userId: currentUser.id,
        dealId,
        activityType: "NEXT_ACTION_CREATED",
        sourceType: "NEXT_ACTION",
        sourceId: created.id,
        title: "다음 행동을 추가했어요.",
        summary: createSafeActivitySummary(followingAction),
        body: null,
        occurredAt: created.createdAt,
        linkedRecordsJson: [createDealLinkedRecord(deal.id, deal.dealName)],
        metadataJson: {
          followingActionLogId: created.id,
        },
      });

      return created;
    });

    this.logEvent("deal.following_action.created", {
      userId: currentUser.id,
      dealId,
      followingActionLogId: log.id,
    });
    this.logAutomaticActivityCreated(currentUser.id, dealId, autoActivityCount);

    return this.toFollowingActionLog(log);
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그를 수정합니다.
  async updateFollowingActionLog(
    currentUser: CurrentUserContext,
    dealId: string,
    followingActionLogId: string,
    input: { readonly followingAction?: string; readonly checkComplete?: boolean }
  ): Promise<DealFollowingActionLogResponse> {
    const updateInput = this.normalizeFollowingActionUpdateInput(
      currentUser.id,
      dealId,
      followingActionLogId,
      input
    );
    let autoActivityCount = 0;

    const updated = await this.dealRepository.runInTransaction(
      async (repository) => {
        const deal = await repository.findDeal(currentUser.id, dealId);

        if (!deal) {
          throw new DealNotFoundError();
        }

        const existing = await repository.findFollowingActionLog({
          userId: currentUser.id,
          dealId,
          followingActionLogId,
        });

        if (!existing) {
          throw new DealFollowingActionLogNotFoundError();
        }

        const updatedLog = await repository.updateFollowingActionLog(updateInput);

        if (!updatedLog) {
          throw new DealFollowingActionLogNotFoundError();
        }

        if (
          input.checkComplete !== undefined &&
          existing.checkComplete !== updatedLog.checkComplete
        ) {
          autoActivityCount += await this.createAutomaticDealActivity(repository, {
            userId: currentUser.id,
            dealId,
            activityType: "NEXT_ACTION_COMPLETION_CHANGED",
            sourceType: "NEXT_ACTION",
            sourceId: updatedLog.id,
            title: "다음 행동 상태가 바뀌었어요.",
            summary: updatedLog.checkComplete ? "완료됨" : "미완료",
            body: null,
            occurredAt: updatedLog.updatedAt,
            linkedRecordsJson: [createDealLinkedRecord(deal.id, deal.dealName)],
            metadataJson: {
              followingActionLogId: updatedLog.id,
              completed: updatedLog.checkComplete,
            },
          });
        }

        return updatedLog;
      }
    );

    this.logEvent("deal.following_action.updated", {
      userId: currentUser.id,
      dealId,
      followingActionLogId,
    });
    this.logAutomaticActivityCreated(currentUser.id, dealId, autoActivityCount);

    return this.toFollowingActionLog(updated);
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그를 휴지통 상태로 전환합니다.
  async deleteFollowingActionLog(
    currentUser: CurrentUserContext,
    dealId: string,
    followingActionLogId: string
  ): Promise<void> {
    // 1. 다음 행동 로그 대상 딜이 현재 사용자 소유인지 검증한다.
    await this.assertDealExists(currentUser.id, dealId);

    // 2. 다음 행동 로그를 휴지통 보관 정책에 맞춰 삭제 상태로 전환한다.
    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.dealRepository.deleteFollowingActionLog({
      userId: currentUser.id,
      dealId,
      followingActionLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    // 3. 삭제 대상 다음 행동 로그가 없으면 오류로 중단한다.
    if (!deleted) {
      throw new DealFollowingActionLogNotFoundError();
    }

    // 4. 다음 행동 본문 없이 삭제 이벤트를 기록한다.
    this.logEvent("deal.following_action.deleted", {
      userId: currentUser.id,
      dealId,
      followingActionLogId,
    });
  }

  // 기능 : 현재 사용자의 딜 메모 로그 전체 목록을 조회합니다.
  async listMemoLogs(
    currentUser: CurrentUserContext,
    dealId: string,
    query: CursorQueryInput
  ): Promise<DealMemoLogListResponse> {
    // 1. 조회 대상 딜이 현재 사용자 소유인지 검증한다.
    await this.assertDealExists(currentUser.id, dealId);

    // 2. cursor 조건으로 메모 로그를 페이지 크기보다 1개 더 조회한다.
    const logs = await this.dealRepository.listMemoLogs({
      userId: currentUser.id,
      dealId,
      cursor: this.parseCursor(query.cursor),
      take: DEAL_LOG_PAGE_SIZE + 1,
    });

    // 3. 조회 이벤트를 구조화 로그로 남긴다.
    this.logEvent("deal.memo.listed", {
      userId: currentUser.id,
      dealId,
      hasCursor: Boolean(query.cursor),
    });

    // 4. 조회 결과를 cursor connection 응답으로 변환한다.
    return this.toMemoLogConnection(logs);
  }

  // 기능 : 현재 사용자의 딜 메모 로그를 생성합니다.
  async createMemoLog(
    currentUser: CurrentUserContext,
    dealId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<DealMemoLogResponse> {
    await this.assertDealExists(currentUser.id, dealId);

    const log = await this.dealRepository.createMemoLog({
      userId: currentUser.id,
      dealId,
      memoType: this.normalizeRequiredText(input.memoType, "memoType is required"),
      memo: this.normalizeRequiredText(input.memo, "memo is required"),
    });

    this.logEvent("deal.memo.created", {
      userId: currentUser.id,
      dealId,
      memoLogId: log.id,
    });

    return this.toMemoLog(log);
  }

  // 기능 : 현재 사용자의 딜 메모 로그를 수정합니다.
  async updateMemoLog(
    currentUser: CurrentUserContext,
    dealId: string,
    memoLogId: string,
    input: { readonly memoType?: string; readonly memo?: string }
  ): Promise<DealMemoLogResponse> {
    await this.assertDealExists(currentUser.id, dealId);

    const updateInput = this.normalizeMemoLogUpdateInput(
      currentUser.id,
      dealId,
      memoLogId,
      input
    );

    const updated = await this.dealRepository.updateMemoLog(updateInput);

    if (!updated) {
      throw new DealMemoLogNotFoundError();
    }

    this.logEvent("deal.memo.updated", {
      userId: currentUser.id,
      dealId,
      memoLogId,
    });

    return this.toMemoLog(updated);
  }

  // 기능 : 현재 사용자의 딜 메모 로그를 휴지통 상태로 전환합니다.
  async deleteMemoLog(
    currentUser: CurrentUserContext,
    dealId: string,
    memoLogId: string
  ): Promise<void> {
    // 1. 메모 대상 딜이 현재 사용자 소유인지 검증한다.
    await this.assertDealExists(currentUser.id, dealId);

    // 2. 메모 로그를 휴지통 보관 정책에 맞춰 삭제 상태로 전환한다.
    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.dealRepository.deleteMemoLog({
      userId: currentUser.id,
      dealId,
      memoLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    // 3. 삭제 대상 메모 로그가 없으면 오류로 중단한다.
    if (!deleted) {
      throw new DealMemoLogNotFoundError();
    }

    // 4. 메모 원문 없이 삭제 이벤트를 기록한다.
    this.logEvent("deal.memo.deleted", {
      userId: currentUser.id,
      dealId,
      memoLogId,
    });
  }

  // 기능 : 딜이 현재 사용자의 소유인지 확인합니다.
  private async assertDealExists(userId: string, dealId: string): Promise<void> {
    if (!(await this.dealRepository.existsDeal(userId, dealId))) {
      throw new DealNotFoundError();
    }
  }

  // 기능 : 회사, 담당자, 제품이 현재 사용자의 소유이고 담당자들이 선택 회사에 속하는지 확인합니다.
  private async assertRelatedResourcesExist(
    userId: string,
    companyIds: readonly string[],
    contactIds: readonly string[],
    productIds: string[],
    repository: DealRepository = this.dealRepository
  ): Promise<{
    readonly products: DealProductRecord[];
  }> {
    const [companies, contacts, products] = await Promise.all([
      repository.findCompanies(userId, companyIds),
      repository.findContacts(userId, contactIds),
      repository.findProducts(userId, productIds),
    ]);
    const companyIdSet = new Set(companyIds);
    const hasContactOutsideCompanies = contacts.some(
      (contact) => !companyIdSet.has(contact.companyId)
    );

    if (
      companies.length !== companyIds.length ||
      contacts.length !== contactIds.length ||
      hasContactOutsideCompanies ||
      products.length !== productIds.length
    ) {
      throw new RelatedResourceNotFoundError();
    }

    return { products };
  }

  // 기능 : 딜 생성 통화를 명시 입력, 첫 선택 제품, 사용자 기본 통화 순서로 결정합니다.
  private resolveDealCreateCurrencyCode(
    explicitCurrencyCode: string | undefined,
    productIds: readonly string[],
    products: readonly DealProductRecord[],
    defaultCurrencyCode: string | undefined
  ): string {
    if (explicitCurrencyCode !== undefined) {
      return normalizeCurrencyCode(explicitCurrencyCode);
    }

    const productMap = new Map(
      products.map((product) => [product.id, product.currencyCode])
    );
    const firstProductCurrencyCode = productIds
      .map((productId) => productMap.get(productId))
      .find((currencyCode): currencyCode is string => Boolean(currencyCode));

    return resolveCurrencyCodeWithDefault(
      firstProductCurrencyCode,
      defaultCurrencyCode
    );
  }

  // 기능 : 자동 activity를 source 기준으로 중복 확인 후 생성합니다.
  private async createAutomaticDealActivity(
    repository: Pick<DealRepository, "findActivityBySource" | "createActivity">,
    input: CreateDealActivityInput & { readonly sourceId: string }
  ): Promise<number> {
    const activity = await createDealActivityIfAbsent(repository, input);
    return activity ? 1 : 0;
  }

  // 기능 : 자동 activity 생성 결과를 민감정보 없이 로그로 남깁니다.
  private logAutomaticActivityCreated(
    userId: string,
    dealId: string,
    count: number
  ): void {
    if (count === 0) {
      return;
    }

    this.logEvent("deal.activity.auto_created", {
      userId,
      dealId,
      count,
    });
  }

  // 기능 : 수동 activity 생성 입력을 저장 가능한 값으로 정규화합니다.
  private normalizeCreateManualDealActivityInput(
    input: CreateManualDealActivityCommand
  ): NormalizedManualDealActivityCreateInput {
    return {
      activityType: this.normalizeManualDealActivityType(input.activityType),
      title: this.normalizeActivityTitle(input.title),
      body: this.normalizeActivityBody(input.body),
      occurredAt: this.normalizeActivityOccurredAt(input.occurredAt),
    };
  }

  // 기능 : 수동 activity 수정 입력을 저장 가능한 값으로 정규화합니다.
  private normalizeUpdateManualDealActivityInput(
    input: UpdateManualDealActivityCommand
  ): NormalizedManualDealActivityUpdateInput {
    const normalized: NormalizedManualDealActivityUpdateInput = {
      ...(input.activityType !== undefined
        ? {
            activityType: this.normalizeManualDealActivityType(
              input.activityType
            ),
          }
        : {}),
      ...(input.title !== undefined
        ? { title: this.normalizeActivityTitle(input.title) }
        : {}),
      ...(input.body !== undefined
        ? { body: this.normalizeActivityBody(input.body) }
        : {}),
      ...(input.occurredAt !== undefined
        ? { occurredAt: this.normalizeActivityOccurredAt(input.occurredAt) }
        : {}),
    };

    if (
      normalized.activityType === undefined &&
      normalized.title === undefined &&
      normalized.body === undefined &&
      normalized.occurredAt === undefined
    ) {
      throw new ValidationDomainError("At least one activity field is required");
    }

    return normalized;
  }

  // 기능 : 목록 type filter가 지원 activity type인지 검증합니다.
  private normalizeOptionalDealActivityType(
    value: DealActivityTypeCode | undefined
  ): DealActivityTypeCode | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!DEAL_ACTIVITY_TYPE_SET.has(value)) {
      throw new ValidationDomainError("activity type is invalid");
    }

    return value;
  }

  // 기능 : 수동 activity type만 허용합니다.
  private normalizeManualDealActivityType(
    value: DealActivityTypeCode
  ): ManualDealActivityTypeCode {
    if (!MANUAL_DEAL_ACTIVITY_TYPE_SET.has(value)) {
      throw new ValidationDomainError("activityType must be a manual type");
    }

    return value as ManualDealActivityTypeCode;
  }

  // 기능 : activity title을 trim하고 길이를 검증합니다.
  private normalizeActivityTitle(value: string): string {
    const normalized = this.normalizeRequiredText(value, "title is required");

    if (normalized.length > DEAL_ACTIVITY_TITLE_MAX_LENGTH) {
      throw new ValidationDomainError("title is too long");
    }

    return normalized;
  }

  // 기능 : activity body를 trim하고 빈 문자열은 null로 저장합니다.
  private normalizeActivityBody(value: string | null | undefined): string | null {
    const normalized = this.normalizeOptionalText(value) ?? null;

    if (normalized && normalized.length > DEAL_ACTIVITY_BODY_MAX_LENGTH) {
      throw new ValidationDomainError("body is too long");
    }

    return normalized;
  }

  // 기능 : activity 발생 시각을 검증하고 없으면 서버 현재 시각을 사용합니다.
  private normalizeActivityOccurredAt(value: string | undefined): Date {
    const occurredAt = value ? new Date(value) : new Date();

    if (Number.isNaN(occurredAt.getTime())) {
      throw new ValidationDomainError("occurredAt must be a valid date-time");
    }

    if (
      occurredAt.getTime() >
      Date.now() + DEAL_ACTIVITY_FUTURE_TOLERANCE_MS
    ) {
      throw new ValidationDomainError("occurredAt is too far in the future");
    }

    return occurredAt;
  }

  // 기능 : 서버가 발급한 activity cursor 문자열을 조회 조건으로 복원합니다.
  private parseActivityCursor(
    cursor: string | undefined
  ): DealActivityCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

      if (!this.isActivityCursorPayload(raw)) {
        throw new Error("Invalid activity cursor payload");
      }

      const occurredAt = new Date(raw.occurredAt);

      if (Number.isNaN(occurredAt.getTime())) {
        throw new Error("Invalid activity cursor date");
      }

      return {
        occurredAt,
        id: raw.id,
      };
    } catch {
      throw new ValidationDomainError("Cursor is invalid");
    }
  }

  // 기능 : activity cursor payload가 필요한 필드를 가진 객체인지 확인합니다.
  private isActivityCursorPayload(
    value: unknown
  ): value is { readonly occurredAt: string; readonly id: string } {
    return (
      typeof value === "object" &&
      value !== null &&
      "occurredAt" in value &&
      "id" in value &&
      typeof value.occurredAt === "string" &&
      typeof value.id === "string"
    );
  }

  // 기능 : 응답용 activity 다음 페이지 cursor 문자열을 생성합니다.
  private createActivityCursor(record: DealActivityRecord): string {
    return Buffer.from(
      JSON.stringify({
        occurredAt: record.occurredAt.toISOString(),
        id: record.id,
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : 필수 텍스트 입력을 trim하고 비어 있으면 validation 오류를 던집니다.
  private normalizeRequiredText(value: string, message: string): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(message);
    }

    return normalized;
  }

  // 기능 : 선택 텍스트 입력을 trim하고 비어 있으면 undefined로 변환합니다.
  private normalizeOptionalText(value: string | null | undefined): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  // 기능 : 서버가 발급한 cursor 문자열을 조회 조건으로 복원합니다.
  private parseCursor(cursor: string | undefined): DealLogCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

      if (!this.isCursorPayload(raw)) {
        throw new Error("Invalid cursor payload");
      }

      const createdAt = new Date(raw.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error("Invalid cursor date");
      }

      return {
        createdAt,
        id: raw.id,
      };
    } catch {
      throw new ValidationDomainError("Cursor is invalid");
    }
  }

  // 기능 : cursor payload가 필요한 필드를 가진 객체인지 확인합니다.
  private isCursorPayload(
    value: unknown
  ): value is { readonly createdAt: string; readonly id: string } {
    return (
      typeof value === "object" &&
      value !== null &&
      "createdAt" in value &&
      "id" in value &&
      typeof value.createdAt === "string" &&
      typeof value.id === "string"
    );
  }

  // 기능 : 응답용 다음 페이지 cursor 문자열을 생성합니다.
  private createCursor(record: { readonly createdAt: Date; readonly id: string }): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: record.createdAt.toISOString(),
        id: record.id,
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : 딜 금액 입력이 0 이상 정수인지 검증합니다.
  private normalizeDealCost(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new FieldValidationDomainError(
        "AMOUNT_INTEGER_REQUIRED",
        "dealCost",
        "dealCost must be an integer >= 0"
      );
    }

    return value;
  }

  // 기능 : 딜에 연결할 제품 ID 배열에서 중복을 막고 빈 배열은 허용합니다.
  private normalizeProductIds(value: readonly string[]): string[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("productIds must be an array");
    }

    const uniqueIds = new Set(value);

    if (uniqueIds.size !== value.length) {
      throw new ValidationDomainError("productIds must not contain duplicates");
    }

    return [...value];
  }

  // 기능 : 필수 ID 배열이 비어 있지 않고 중복이 없는지 검증합니다.
  private normalizeRequiredIdArray(
    value: readonly string[],
    emptyMessage: string,
    duplicateMessage: string
  ): string[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new ValidationDomainError(emptyMessage);
    }

    const uniqueIds = new Set(value);

    if (uniqueIds.size !== value.length) {
      throw new ValidationDomainError(duplicateMessage);
    }

    return [...value];
  }

  // 기능 : 선택 ID 배열의 빈 값과 중복을 제거합니다.
  private normalizeOptionalIdArray(value: readonly string[]): string[] {
    if (!Array.isArray(value) || value.length === 0) {
      return [];
    }

    return [...new Set(value.filter((id) => id.trim().length > 0))];
  }

  // 기능 : YYYY-MM-DD 문자열을 날짜 전용 Date 값으로 변환합니다.
  private parseDateOnly(value: string): Date {
    const parts = value.split("-");

    if (parts.length !== 3) {
      throw new ValidationDomainError("expectedEndDate must be YYYY-MM-DD");
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      throw new ValidationDomainError("expectedEndDate must be YYYY-MM-DD");
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new ValidationDomainError("expectedEndDate must be a valid date");
    }

    return date;
  }

  // 기능 : Date 값을 API 계약의 YYYY-MM-DD 문자열로 변환합니다.
  private toDateOnlyString(value: Date): string {
    const year = value.getUTCFullYear().toString().padStart(4, "0");
    const month = (value.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = value.getUTCDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // 기능 : 딜 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeDealUpdateInput(
    input: UpdateDealCommand
  ): NormalizedDealUpdateInput {
    return {
      ...(input.dealName !== undefined
        ? {
            dealName: this.normalizeRequiredText(
              input.dealName,
              "dealName is required"
            ),
          }
        : {}),
      ...(input.dealCost !== undefined
        ? { dealCost: this.normalizeDealCost(input.dealCost) }
        : {}),
      ...(input.currencyCode !== undefined
        ? { currencyCode: normalizeCurrencyCode(input.currencyCode) }
        : {}),
      ...(input.companyIds !== undefined
        ? {
            companyIds: this.normalizeRequiredIdArray(
              input.companyIds,
              "companyIds must contain at least one company",
              "companyIds must not contain duplicates"
            ),
          }
        : {}),
      ...(input.contactIds !== undefined
        ? {
            contactIds: this.normalizeRequiredIdArray(
              input.contactIds,
              "contactIds must contain at least one contact",
              "contactIds must not contain duplicates"
            ),
          }
        : {}),
      ...(input.productIds !== undefined
        ? { productIds: this.normalizeProductIds(input.productIds) }
        : {}),
      ...(input.expectedEndDate !== undefined
        ? { expectedEndDate: this.parseDateOnly(input.expectedEndDate) }
        : {}),
      ...(input.dealStatus !== undefined ? { dealStatus: input.dealStatus } : {}),
    };
  }

  // 기능 : 다음 행동 로그 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeFollowingActionUpdateInput(
    userId: string,
    dealId: string,
    followingActionLogId: string,
    input: { readonly followingAction?: string; readonly checkComplete?: boolean }
  ): UpdateDealFollowingActionLogInput {
    const normalized = {
      userId,
      dealId,
      followingActionLogId,
      ...(input.followingAction !== undefined
        ? {
            followingAction: this.normalizeRequiredText(
              input.followingAction,
              "followingAction is required"
            ),
          }
        : {}),
      ...(input.checkComplete !== undefined
        ? { checkComplete: input.checkComplete }
        : {}),
    };

    if (
      normalized.followingAction === undefined &&
      normalized.checkComplete === undefined
    ) {
      throw new ValidationDomainError(
        "At least one following action field is required"
      );
    }

    return normalized;
  }

  // 기능 : 메모 로그 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeMemoLogUpdateInput(
    userId: string,
    dealId: string,
    memoLogId: string,
    input: { readonly memoType?: string; readonly memo?: string }
  ): UpdateDealMemoLogInput {
    const normalized = {
      userId,
      dealId,
      memoLogId,
      ...(input.memoType !== undefined
        ? {
            memoType: this.normalizeRequiredText(
              input.memoType,
              "memoType is required"
            ),
          }
        : {}),
      ...(input.memo !== undefined
        ? { memo: this.normalizeRequiredText(input.memo, "memo is required") }
        : {}),
    };

    if (normalized.memoType === undefined && normalized.memo === undefined) {
      throw new ValidationDomainError("At least one memo field is required");
    }

    return normalized;
  }

  // 기능 : 딜 레코드를 목록 응답 항목으로 변환합니다.
  private toDealListItem(deal: DealListRecord): DealListItemResponse {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      currencyCode: deal.currencyCode,
      dealStatus: deal.dealStatus,
      dealStatusLabel: getDealStatusLabel(deal.dealStatus),
      expectedEndDate: this.toDateOnlyString(deal.expectedEndDate),
      companies: deal.companies,
      contacts: deal.contacts.map((contact) => this.toDealContactResponse(contact)),
      products: deal.products.map((product) =>
        this.toDealProductSummary(product)
      ),
      latestActivity: deal.latestActivity
        ? this.toLatestActivitySummary(deal.latestActivity)
        : null,
      latestFollowingAction: deal.latestFollowingAction
        ? this.toLatestFollowingAction(deal.latestFollowingAction)
        : null,
      nextFollowingAction: deal.nextFollowingAction
        ? this.toNextFollowingAction(deal.nextFollowingAction)
        : null,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    };
  }

  // 기능 : 딜 목록 제품 summary 레코드를 API 응답 객체로 변환합니다.
  private toDealProductSummary(
    product: DealProductSummaryRecord
  ): DealProductSummaryResponse {
    return {
      id: product.id,
      productName: product.productName,
      isDeleted: product.isDeleted,
      productCategory: product.productCategory,
      productStatus: product.productStatus,
    };
  }

  // 기능 : 딜 목록 최신 activity 레코드를 body 없이 안전한 summary 응답으로 변환합니다.
  private toLatestActivitySummary(
    activity: DealLatestActivitySummaryRecord
  ): DealLatestActivitySummaryResponse {
    return {
      id: activity.id,
      activityType: activity.activityType,
      title: activity.title,
      summary: activity.summary,
      occurredAt: activity.occurredAt.toISOString(),
    };
  }

  // 기능 : 딜 레코드를 상세 응답으로 변환합니다.
  private toDealDetail(deal: DealDetailRecord): DealDetailResponse {
    const {
      products: _summaryProducts,
      latestActivity: _latestActivity,
      ...listItem
    } = this.toDealListItem(deal);

    void _summaryProducts;
    void _latestActivity;

    return {
      ...listItem,
      products: deal.products,
    };
  }

  // 기능 : 담당자 레코드를 API 응답 객체로 변환합니다.
  private toDealContactResponse(contact: DealContactRecord): DealContactResponse {
    return {
      id: contact.id,
      username: contact.username,
      isDeleted: contact.isDeleted,
      companyId: contact.companyId,
      company: contact.company,
      mobile: contact.mobile,
      email: contact.email,
      contactJobGrade: contact.contactJobGrade,
      contactDepartment: contact.contactDepartment,
    };
  }

  // 기능 : 담당자 옵션 label을 생성합니다.
  private createContactLabel(contact: DealContactRecord): string {
    return `${contact.username} ${contact.contactDepartment.departmentName}`.trim();
  }

  // 기능 : 최신 다음 행동 로그를 목록 응답 객체로 변환합니다.
  private toLatestFollowingAction(
    log: DealFollowingActionLogRecord
  ): DealLatestFollowingActionResponse {
    return {
      id: log.id,
      followingAction: log.followingAction,
      checkComplete: log.checkComplete,
      createdAt: log.createdAt.toISOString(),
    };
  }

  private toNextFollowingAction(
    nextAction: DealNextFollowingActionRecord
  ): DealNextFollowingActionResponse {
    return {
      ...this.toLatestFollowingAction(nextAction.log),
      remainingCount: nextAction.remainingCount,
    };
  }

  // 기능 : 딜 활동 레코드를 API 응답 객체로 변환합니다.
  private toDealActivityResponse(
    activity: DealActivityRecord
  ): DealActivityResponse {
    return {
      id: activity.id,
      dealId: activity.dealId,
      activityType: activity.activityType,
      sourceType: activity.sourceType,
      sourceId: activity.sourceId,
      title: activity.title,
      summary: activity.summary,
      body: activity.body,
      occurredAt: activity.occurredAt.toISOString(),
      isEditable: activity.sourceType === "USER",
      linkedRecords: this.toDealActivityLinkedRecords(
        activity.linkedRecordsJson
      ),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    };
  }

  // 기능 : 딜 활동 목록을 cursor connection 응답으로 변환합니다.
  private toDealActivityConnection(
    records: DealActivityRecord[]
  ): DealActivityListResponse {
    const items = records.slice(0, DEAL_ACTIVITY_PAGE_SIZE);
    const hasNext = records.length > DEAL_ACTIVITY_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => this.toDealActivityResponse(record)),
      nextCursor: hasNext && lastItem ? this.createActivityCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 저장된 linkedRecordsJson을 안전한 API 응답 구조로 정규화합니다.
  private toDealActivityLinkedRecords(
    value: unknown | null
  ): DealActivityLinkedRecordResponse[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const records: DealActivityLinkedRecordResponse[] = [];

    for (const item of value) {
      const record = this.toDealActivityLinkedRecord(item);

      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  // 기능 : 단일 linked record JSON 값을 검증하고 User Web route로 정규화합니다.
  private toDealActivityLinkedRecord(
    value: unknown
  ): DealActivityLinkedRecordResponse | null {
    if (typeof value !== "object" || value === null) {
      return null;
    }

    const record = value as Partial<DealActivityLinkedRecordValue>;

    if (
      typeof record.targetType !== "string" ||
      !DEAL_ACTIVITY_LINKED_RECORD_TARGET_TYPE_SET.has(record.targetType) ||
      typeof record.targetId !== "string" ||
      record.targetId.trim().length === 0 ||
      typeof record.targetPath !== "string" ||
      record.targetPath.trim().length === 0
    ) {
      return null;
    }

    const targetPath = normalizeDealActivityTargetPath(record.targetPath);

    if (!targetPath.startsWith("/app/")) {
      return null;
    }

    return createDealActivityLinkedRecord({
      targetType: record.targetType as DealActivityLinkedRecordTargetType,
      targetId: record.targetId,
      targetPath,
      targetLabel:
        typeof record.targetLabel === "string" ? record.targetLabel : null,
    });
  }

  // 기능 : 다음 행동 로그를 목록 응답 객체로 변환합니다.
  private toFollowingActionLogListItem(
    log: DealFollowingActionLogRecord
  ): DealFollowingActionLogListItemResponse {
    return {
      id: log.id,
      followingAction: log.followingAction,
      checkComplete: log.checkComplete,
      createdAt: log.createdAt.toISOString(),
    };
  }

  // 기능 : 다음 행동 로그를 단건 응답 객체로 변환합니다.
  private toFollowingActionLog(
    log: DealFollowingActionLogRecord
  ): DealFollowingActionLogResponse {
    return {
      ...this.toFollowingActionLogListItem(log),
      updatedAt: log.updatedAt.toISOString(),
    };
  }

  // 기능 : 다음 행동 로그 목록을 cursor connection 응답으로 변환합니다.
  private toFollowingActionLogConnection(
    records: DealFollowingActionLogRecord[]
  ): DealFollowingActionLogListResponse {
    const items = records.slice(0, DEAL_LOG_PAGE_SIZE);
    const hasNext = records.length > DEAL_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => this.toFollowingActionLogListItem(record)),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 메모 로그를 목록 응답 객체로 변환합니다.
  private toMemoLogListItem(log: DealMemoLogRecord): DealMemoLogListItemResponse {
    return {
      id: log.id,
      memoType: log.memoType,
      memo: log.memo,
      createdAt: log.createdAt.toISOString(),
    };
  }

  // 기능 : 메모 로그를 단건 응답 객체로 변환합니다.
  private toMemoLog(log: DealMemoLogRecord): DealMemoLogResponse {
    return {
      ...this.toMemoLogListItem(log),
      updatedAt: log.updatedAt.toISOString(),
    };
  }

  // 기능 : 메모 로그 목록을 cursor connection 응답으로 변환합니다.
  private toMemoLogConnection(
    records: DealMemoLogRecord[]
  ): DealMemoLogListResponse {
    const items = records.slice(0, DEAL_LOG_PAGE_SIZE);
    const hasNext = records.length > DEAL_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => this.toMemoLogListItem(record)),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 딜 export 레코드를 xlsx Buffer로 변환합니다.
  private async writeDealExportXlsx(deals: DealListRecord[]): Promise<Buffer> {
    try {
      return await this.xlsxWriter.writeWorksheet({
        sheetName: "Deals",
        columns: [
          { header: "딜이름", key: "dealName", width: 28 },
          { header: "회사이름", key: "companyName", width: 24 },
          { header: "담당자", key: "contactLabel", width: 20 },
          { header: "딜단계", key: "dealStatusLabel", width: 18 },
          { header: "딜금액", key: "dealCost", width: 16 },
          { header: "통화", key: "currencyCode", width: 10 },
          { header: "마감일", key: "expectedEndDate", width: 16 },
          { header: "다음행동", key: "followingAction", width: 32 },
          {
            header: "등록일",
            key: "createdAt",
            width: 22,
            numFmt: XLSX_DATE_NUM_FORMAT,
          },
        ],
        rows: this.toDealExportRows(deals),
      });
    } catch {
      throw new DealExportFailedError();
    }
  }

  // 기능 : 딜 export 레코드를 ID, 제품, 최근수정일 없는 xlsx 행 데이터로 변환합니다.
  private toDealExportRows(deals: DealListRecord[]): XlsxRow[] {
    return deals.map((deal) => ({
      dealName: deal.dealName,
      companyName: deal.companies
        .map((company) => company.companyName)
        .join(", "),
      contactLabel: deal.contacts
        .map((contact) => this.createContactLabel(contact))
        .join(", "),
      dealStatusLabel: getDealStatusLabel(deal.dealStatus),
      dealCost: deal.dealCost,
      currencyCode: deal.currencyCode,
      expectedEndDate: this.toDateOnlyString(deal.expectedEndDate),
      followingAction: deal.nextFollowingAction?.log.followingAction ?? null,
      createdAt: deal.createdAt,
    }));
  }

  // 기능 : 민감정보를 제외한 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "DealApplicationService"
    );
  }
}
