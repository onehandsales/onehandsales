import type { DealStatusCode } from "@/modules/deal/domain/deal-status";

export const DEAL_REPOSITORY = Symbol("DEAL_REPOSITORY");

export enum DealListSort {
  CREATED_AT_DESC = "createdAtDesc",
  DEAL_COST_DESC = "dealCostDesc",
  DEAL_COST_ASC = "dealCostAsc",
  EXPECTED_END_DATE_ASC = "expectedEndDateAsc",
}

// 역할 : DealCompanyRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealCompanyRecord {
  readonly id: string;
  readonly companyName: string;
}

// 역할 : DealContactDepartmentRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealContactDepartmentRecord {
  readonly id: string;
  readonly departmentName: string;
}

// 역할 : DealContactRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealContactRecord {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly contactDepartment: DealContactDepartmentRecord;
}

// 역할 : DealProductRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealProductRecord {
  readonly id: string;
  readonly productName: string;
}

// 역할 : DealFollowingActionLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealFollowingActionLogRecord {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : DealMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealMemoLogRecord {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : DealLogCursor 데이터가 계층 사이에서 전달되는 cursor 조회 기준을 정의합니다.
export interface DealLogCursor {
  readonly createdAt: Date;
  readonly id: string;
}

// 역할 : DealListRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealListRecord {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: DealStatusCode;
  readonly expectedEndDate: Date;
  readonly companies: DealCompanyRecord[];
  readonly contacts: DealContactRecord[];
  readonly latestFollowingAction: DealFollowingActionLogRecord | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : DealDetailRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealDetailRecord extends DealListRecord {
  readonly products: DealProductRecord[];
}

// 역할 : DealPageRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DealPageRecord {
  readonly items: DealListRecord[];
  readonly totalCount: number;
}

// 역할 : ListDealsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ListDealsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly dealStatus?: DealStatusCode;
  readonly sort: DealListSort;
}

// 역할 : CountDealsByStatusInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CountDealsByStatusInput {
  readonly userId: string;
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
}

// 역할 : ExportDealsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ExportDealsInput {
  readonly userId: string;
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly dealStatus?: DealStatusCode;
  readonly sort: DealListSort;
}

// 역할 : CreateDealInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealInput {
  readonly userId: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: DealStatusCode;
  readonly expectedEndDate: Date;
}

// 역할 : UpdateDealInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateDealInput {
  readonly dealName?: string;
  readonly dealCost?: number;
  readonly expectedEndDate?: Date;
  readonly dealStatus?: DealStatusCode;
}

// 역할 : CreateDealFollowingActionLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealFollowingActionLogInput {
  readonly userId: string;
  readonly dealId: string;
  readonly followingAction: string;
}

// 역할 : CreateDealProductsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealProductsInput {
  readonly userId: string;
  readonly dealId: string;
  readonly productIds: string[];
}

// 역할 : CreateDealCompaniesInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealCompaniesInput {
  readonly userId: string;
  readonly dealId: string;
  readonly companyIds: string[];
}

// 역할 : CreateDealContactsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealContactsInput {
  readonly userId: string;
  readonly dealId: string;
  readonly contactIds: string[];
}

// 역할 : UpdateDealFollowingActionLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateDealFollowingActionLogInput {
  readonly userId: string;
  readonly dealId: string;
  readonly followingActionLogId: string;
  readonly followingAction?: string;
  readonly checkComplete?: boolean;
}

// 역할 : CreateDealMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateDealMemoLogInput {
  readonly userId: string;
  readonly dealId: string;
  readonly memoType: string;
  readonly memo: string;
}

// 역할 : UpdateDealMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateDealMemoLogInput {
  readonly userId: string;
  readonly dealId: string;
  readonly memoLogId: string;
  readonly memoType?: string;
  readonly memo?: string;
}

// 역할 : DealRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface DealRepository {
  // 기능 : 딜 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(work: (repository: DealRepository) => Promise<T>): Promise<T>;
  // 기능 : 현재 사용자의 딜 단계별 개수를 조회합니다.
  countDealsByStatus(
    input: CountDealsByStatusInput
  ): Promise<ReadonlyMap<DealStatusCode, number>>;
  // 기능 : 현재 사용자의 딜 목록과 전체 개수를 조회합니다.
  listDeals(input: ListDealsInput): Promise<DealPageRecord>;
  // 기능 : 현재 사용자의 딜 export 대상 전체 목록을 조회합니다.
  listDealsForExport(input: ExportDealsInput): Promise<DealListRecord[]>;
  // 기능 : 현재 사용자의 딜 단건 상세를 조회합니다.
  findDeal(userId: string, dealId: string): Promise<DealDetailRecord | null>;
  // 기능 : 현재 사용자의 딜 존재 여부만 조회합니다.
  existsDeal(userId: string, dealId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 딜을 생성합니다.
  createDeal(input: CreateDealInput): Promise<{ readonly id: string }>;
  // 기능 : 현재 사용자의 딜 기본 정보를 수정합니다.
  updateDeal(
    userId: string,
    dealId: string,
    input: UpdateDealInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 목록을 조회합니다.
  findCompanies(
    userId: string,
    companyIds: readonly string[]
  ): Promise<DealCompanyRecord[]>;
  // 기능 : 현재 사용자의 담당자 목록을 조회합니다.
  findContacts(
    userId: string,
    contactIds: readonly string[]
  ): Promise<DealContactRecord[]>;
  // 기능 : 현재 사용자의 제품 단건을 조회합니다.
  findProducts(
    userId: string,
    productIds: readonly string[]
  ): Promise<DealProductRecord[]>;
  // 기능 : 딜에 회사 목록을 연결합니다.
  createDealCompanies(input: CreateDealCompaniesInput): Promise<void>;
  // 기능 : 딜에 연결된 회사 목록을 교체합니다.
  replaceDealCompanies(input: CreateDealCompaniesInput): Promise<void>;
  // 기능 : 딜에 담당자 목록을 연결합니다.
  createDealContacts(input: CreateDealContactsInput): Promise<void>;
  // 기능 : 딜에 연결된 담당자 목록을 교체합니다.
  replaceDealContacts(input: CreateDealContactsInput): Promise<void>;
  // 기능 : 딜에 제품 목록을 연결합니다.
  createDealProducts(input: CreateDealProductsInput): Promise<void>;
  // 기능 : 딜에 연결된 제품 목록을 교체합니다.
  replaceDealProducts(input: CreateDealProductsInput): Promise<void>;
  // 기능 : 현재 사용자의 회사 옵션 전체 목록을 조회합니다.
  listCompanyOptions(userId: string): Promise<DealCompanyRecord[]>;
  // 기능 : 현재 사용자의 담당자 옵션 전체 목록을 조회합니다.
  listContactOptions(userId: string): Promise<DealContactRecord[]>;
  // 기능 : 현재 사용자의 제품 옵션 전체 목록을 조회합니다.
  listProductOptions(userId: string): Promise<DealProductRecord[]>;
  // 기능 : 딜 다음 행동 로그를 생성합니다.
  createFollowingActionLog(
    input: CreateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord>;
  // 기능 : 딜 다음 행동 로그 목록을 cursor 기준으로 조회합니다.
  listFollowingActionLogs(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealFollowingActionLogRecord[]>;
  // 기능 : 딜 다음 행동 로그를 수정합니다.
  updateFollowingActionLog(
    input: UpdateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord | null>;
  // 기능 : 딜 메모 로그를 생성합니다.
  createMemoLog(input: CreateDealMemoLogInput): Promise<DealMemoLogRecord>;
  // 기능 : 딜 메모 로그 목록을 cursor 기준으로 조회합니다.
  listMemoLogs(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealMemoLogRecord[]>;
  // 기능 : 딜 메모 로그를 수정합니다.
  updateMemoLog(input: UpdateDealMemoLogInput): Promise<DealMemoLogRecord | null>;
}
