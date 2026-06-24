// 기능 : Deal 도메인 타입 정의 — Backend Deal API 계약 기준

export type DealStatus =
  | "INITIAL_CONTACT"
  | "NEEDS_CHECK"
  | "PROPOSAL_QUOTE"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

// 기능 : DealStatus → 한국어 label 매핑
export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  INITIAL_CONTACT: "초기 접촉",
  NEEDS_CHECK: "니즈 확인",
  PROPOSAL_QUOTE: "제안/견적",
  NEGOTIATION: "협상",
  WON: "성사",
  LOST: "실패",
};

export const DEAL_STATUS_LIST: DealStatus[] = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
];

// 기능 : 목록 item의 중첩 객체 타입
export type DealCompany = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
  };
};

export type DealContactDepartment = {
  readonly id: string;
  readonly departmentName: string;
};

export type DealContactJobGrade = {
  readonly id: string;
  readonly jobGradeName: string;
};

export type DealContact = {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly mobile: string;
  readonly email: string;
  readonly contactJobGrade: DealContactJobGrade;
  readonly contactDepartment: DealContactDepartment;
};

export type DealProduct = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: {
    readonly id: string;
    readonly categoryName: string;
  };
  readonly productStatus: {
    readonly id: string;
    readonly statusName: string;
  };
};

export type LatestFollowingAction = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
};

export type NextFollowingAction = LatestFollowingAction & {
  readonly remainingCount: number;
};

// 기능 : 단계별 개수 응답 item
export type DealStageCount = {
  readonly dealStatus: DealStatus;
  readonly dealStatusLabel: string;
  readonly count: number;
};

export type DealStageCountsResponse = {
  readonly items: DealStageCount[];
};

// 기능 : 딜 목록 item — products 없음
export type DealListItem = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: DealStatus;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: DealCompany[];
  readonly contacts: DealContact[];
  readonly latestFollowingAction: LatestFollowingAction | null;
  readonly nextFollowingAction: NextFollowingAction | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

// 기능 : 딜 상세 — products 포함
export type DealDetail = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: DealStatus;
  readonly dealStatusLabel: string;
  readonly expectedEndDate: string;
  readonly companies: DealCompany[];
  readonly contacts: DealContact[];
  readonly products: DealProduct[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

// 기능 : 딜 목록 페이지네이션 응답
export type DealListResponse = {
  readonly items: DealListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

// 기능 : 딜 목록 query 파라미터
export type DealListParams = {
  readonly page?: number;
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly dealStatus?: DealStatus;
  readonly sort?: DealSort;
};

export type DealStageCountParams = {
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
};

export type DealSort =
  | "createdAtDesc"
  | "dealCostDesc"
  | "dealCostAsc"
  | "expectedEndDateAsc";

// 기능 : 딜 생성 request body
export type CreateDealInput = {
  readonly dealName: string;
  readonly dealCost: number;
  readonly companyIds: string[];
  readonly contactIds: string[];
  readonly productIds: string[];
  readonly dealStatus: DealStatus;
  readonly followingAction: string;
  readonly expectedEndDate: string;
  readonly dealMemo?: string;
};

// 기능 : 딜 수정 request body
export type UpdateDealInput = {
  readonly dealId: string;
  readonly dealName?: string;
  readonly dealCost?: number;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly productIds?: string[];
  readonly expectedEndDate?: string;
  readonly dealStatus?: DealStatus;
};

// 기능 : 옵션 조회 응답 타입
export type DealCompanyOption = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
  };
};

export type DealContactOption = {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly mobile: string;
  readonly email: string;
  readonly contactJobGrade: DealContactJobGrade;
  readonly contactDepartment: DealContactDepartment;
  readonly label: string;
};

export type DealProductOption = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: {
    readonly id: string;
    readonly categoryName: string;
  };
  readonly productStatus: {
    readonly id: string;
    readonly statusName: string;
  };
};

export type DealCompanyOptionsResponse = {
  readonly items: DealCompanyOption[];
};

export type DealContactOptionsResponse = {
  readonly items: DealContactOption[];
};

export type DealProductOptionsResponse = {
  readonly items: DealProductOption[];
};

// 기능 : 다음 행동 로그 타입
export type DealFollowingActionLog = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: string;
  readonly updatedAt?: string;
};

export type DealFollowingActionLogsResponse = {
  readonly items: DealFollowingActionLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type CreateFollowingActionLogInput = {
  readonly dealId: string;
  readonly followingAction: string;
};

export type UpdateFollowingActionLogInput = {
  readonly dealId: string;
  readonly followingActionLogId: string;
  readonly followingAction?: string;
  readonly checkComplete?: boolean;
};

// 기능 : 메모 로그 타입
export type DealMemoLog = {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
};

export type DealMemoLogsResponse = {
  readonly items: DealMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type CreateMemoLogInput = {
  readonly dealId: string;
  readonly memoType: string;
  readonly memo: string;
};

export type UpdateMemoLogInput = {
  readonly dealId: string;
  readonly memoLogId: string;
  readonly memoType?: string;
  readonly memo?: string;
};

// 기능 : export query 파라미터
export type DealExportParams = {
  readonly search?: string;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly dealStatus?: DealStatus;
  readonly sort?: DealSort;
};
