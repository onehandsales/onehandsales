import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  DealListSort,
  DEAL_REPOSITORY,
  type DealCompanyRecord,
  type DealContactRecord,
  type DealDetailRecord,
  type DealFollowingActionLogRecord,
  type DealListRecord,
  type DealLogCursor,
  type DealMemoLogRecord,
  type DealNextFollowingActionRecord,
  type DealProductRecord,
  type DealRepository,
  type UpdateDealFollowingActionLogInput,
  type UpdateDealInput,
  type UpdateDealMemoLogInput,
} from "@/modules/deal/application/ports/deal.repository";
import {
  DealExportFailedError,
  DealFollowingActionLogNotFoundError,
  DealMemoLogNotFoundError,
  DealNotFoundError,
  RelatedResourceNotFoundError,
} from "@/modules/deal/domain/deal.errors";
import {
  DEAL_STATUS_CODES,
  DealStatusCode,
  getDealStatusLabel,
} from "@/modules/deal/domain/deal-status";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
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
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEAL_PAGE_SIZE = 10;
const DEAL_LOG_PAGE_SIZE = 10;
const XLSX_DATE_NUM_FORMAT = "yyyy-mm-dd hh:mm:ss";
const INITIAL_DEAL_MEMO_TYPE = "초기 메모";

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
  readonly dealStatus: DealStatusCode;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: DealCompanyRecord[];
  readonly contacts: DealContactResponse[];
  readonly latestFollowingAction: DealLatestFollowingActionResponse | null;
  readonly nextFollowingAction: DealNextFollowingActionResponse | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : DealDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealDetailResponse extends DealListItemResponse {
  readonly products: DealProductRecord[];
}

// 역할 : DealContactResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealContactResponse {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
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

// 역할 : DealApplicationService 딜 도메인 application 유스케이스를 제공합니다.
@Injectable()
export class DealApplicationService {
  // 기능 : 딜 저장소, xlsx writer, 로그 서비스를 주입받습니다.
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
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

  // 기능 : 현재 사용자의 딜 목록을 10개 단위 페이지로 조회합니다.
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

    await this.dealRepository.runInTransaction(async (repository) => {
      await this.assertRelatedResourcesExist(
        currentUser.id,
        companyIds,
        contactIds,
        productIds,
        repository
      );

      const deal = await repository.createDeal({
        userId: currentUser.id,
        dealName,
        dealCost,
        dealStatus: input.dealStatus,
        expectedEndDate,
      });
      createdDealId = deal.id;

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

      await repository.createFollowingActionLog({
        userId: currentUser.id,
        dealId: deal.id,
        followingAction,
      });

      if (dealMemo) {
        await repository.createMemoLog({
          userId: currentUser.id,
          dealId: deal.id,
          memoType: INITIAL_DEAL_MEMO_TYPE,
          memo: dealMemo,
        });
      }
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

    let dealUpdated = false;

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

    return this.toDealDetail(deal);
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
    await this.assertDealExists(currentUser.id, dealId);

    const log = await this.dealRepository.createFollowingActionLog({
      userId: currentUser.id,
      dealId,
      followingAction: this.normalizeRequiredText(
        input.followingAction,
        "followingAction is required"
      ),
    });

    this.logEvent("deal.following_action.created", {
      userId: currentUser.id,
      dealId,
      followingActionLogId: log.id,
    });

    return this.toFollowingActionLog(log);
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그를 수정합니다.
  async updateFollowingActionLog(
    currentUser: CurrentUserContext,
    dealId: string,
    followingActionLogId: string,
    input: { readonly followingAction?: string; readonly checkComplete?: boolean }
  ): Promise<DealFollowingActionLogResponse> {
    await this.assertDealExists(currentUser.id, dealId);

    const updateInput = this.normalizeFollowingActionUpdateInput(
      currentUser.id,
      dealId,
      followingActionLogId,
      input
    );

    const updated = await this.dealRepository.updateFollowingActionLog(updateInput);

    if (!updated) {
      throw new DealFollowingActionLogNotFoundError();
    }

    this.logEvent("deal.following_action.updated", {
      userId: currentUser.id,
      dealId,
      followingActionLogId,
    });

    return this.toFollowingActionLog(updated);
  }

  // 기능 : 현재 사용자의 딜 다음 행동 로그를 휴지통 상태로 전환합니다.
  async deleteFollowingActionLog(
    currentUser: CurrentUserContext,
    dealId: string,
    followingActionLogId: string
  ): Promise<void> {
    await this.assertDealExists(currentUser.id, dealId);

    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.dealRepository.deleteFollowingActionLog({
      userId: currentUser.id,
      dealId,
      followingActionLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    if (!deleted) {
      throw new DealFollowingActionLogNotFoundError();
    }

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
    await this.assertDealExists(currentUser.id, dealId);

    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.dealRepository.deleteMemoLog({
      userId: currentUser.id,
      dealId,
      memoLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    if (!deleted) {
      throw new DealMemoLogNotFoundError();
    }

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
  ): Promise<void> {
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
      throw new ValidationDomainError("dealCost must be an integer >= 0");
    }

    return value;
  }

  // 기능 : 딜에 연결할 제품 ID 배열이 비어 있지 않고 중복이 없는지 검증합니다.
  private normalizeProductIds(value: readonly string[]): string[] {
    return this.normalizeRequiredIdArray(
      value,
      "productIds must contain at least one product",
      "productIds must not contain duplicates"
    );
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
      dealStatus: deal.dealStatus,
      dealStatusLabel: getDealStatusLabel(deal.dealStatus),
      expectedEndDate: this.toDateOnlyString(deal.expectedEndDate),
      companies: deal.companies,
      contacts: deal.contacts.map((contact) => this.toDealContactResponse(contact)),
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

  // 기능 : 딜 레코드를 상세 응답으로 변환합니다.
  private toDealDetail(deal: DealDetailRecord): DealDetailResponse {
    return {
      ...this.toDealListItem(deal),
      products: deal.products,
    };
  }

  // 기능 : 담당자 레코드를 API 응답 객체로 변환합니다.
  private toDealContactResponse(contact: DealContactRecord): DealContactResponse {
    return {
      id: contact.id,
      username: contact.username,
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
