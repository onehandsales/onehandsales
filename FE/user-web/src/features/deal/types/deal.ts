export type DealStage = "INITIAL_CONTACT" | "IN_DISCUSSION" | "WON" | "LOST";

export type DealLikelihoodStatus = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type NextActionStatus =
  | "NONE"
  | "SCHEDULED"
  | "DUE_SOON"
  | "OVERDUE"
  | "DONE";

export type Deal = {
  readonly id: string;
  readonly title: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly contactId: string | null;
  readonly contactName: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly stage: DealStage;
  readonly likelihoodStatus: DealLikelihoodStatus;
  readonly likelihoodPercent: number | null;
  readonly expectedCloseDate: string | null;
  readonly nextActionText: string | null;
  readonly nextActionDueAt: string | null;
  readonly nextActionStatus: NextActionStatus;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type DealStageSummary = Record<DealStage, number>;

export type PaginatedResponse<TItem> = {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
};

export type DealListResponse = PaginatedResponse<Deal> & {
  readonly stageSummary: DealStageSummary;
};

export type DealListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly stage?: DealStage;
  readonly likelihoodStatus?: DealLikelihoodStatus;
  readonly nextActionStatus?: NextActionStatus;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly includeDeleted?: boolean;
};

export type CreateDealInput = {
  readonly title: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly amount: number;
  readonly currency?: string;
  readonly stage?: DealStage;
  readonly likelihoodStatus?: DealLikelihoodStatus;
  readonly likelihoodPercent?: number;
  readonly expectedCloseDate?: string;
  readonly nextActionText?: string;
  readonly nextActionDueAt?: string;
  readonly productIds?: string[];
  readonly initialMemo?: string;
};
