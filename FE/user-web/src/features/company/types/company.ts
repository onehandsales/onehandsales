export type CompanyField = {
  readonly id: string;
  readonly field: string;
};

export type CompanyRegion = {
  readonly id: string;
  readonly region: string;
};

export type CompanyListItem = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
  readonly contactCount: number;
  readonly dealCount: number;
  readonly createdAt: string;
};

export type CompanyDetail = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type Company = CompanyDetail;

export type CompanyPageResponse = {
  readonly items: CompanyListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type CompanyListResponse = CompanyPageResponse;

export type CompanySort =
  | "createdAtDesc"
  | "contactCountDesc"
  | "contactCountAsc"
  | "dealCountDesc"
  | "dealCountAsc";

export type CompanyListParams = {
  readonly page?: number;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyFieldIds?: readonly string[];
  readonly companyRegionId?: string;
  readonly companyRegionIds?: readonly string[];
  readonly sort?: CompanySort;
};

export type CompanyExportFilters = Omit<CompanyListParams, "page">;

export type CompanyFieldListResponse = {
  readonly items: CompanyField[];
};

export type CompanyRegionListResponse = {
  readonly items: CompanyRegion[];
};

export type CreateCompanyInput = {
  readonly companyName: string;
  readonly companyFieldId: string;
  readonly companyRegionId: string;
  readonly companyMemo?: string;
};

export type UpdateCompanyInput = {
  readonly companyId: string;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
};

export type CreateCompanyFieldInput = {
  readonly field: string;
};

export type CreateCompanyRegionInput = {
  readonly region: string;
};

export type CompanyContact = {
  readonly id: string;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: {
    readonly id: string;
    readonly departmentName: string;
  };
  readonly contactJobGrade?: {
    readonly id: string;
    readonly jobGradeName: string;
  };
};

export type CompanyContactListResponse = {
  readonly items: CompanyContact[];
};

export type CompanyDeal = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly createdAt: string;
};

export type CompanyDealListResponse = {
  readonly items: CompanyDeal[];
};

export type CompanyMemoType = string;

export type CompanyMemoLog = {
  readonly id: string;
  readonly memoType: CompanyMemoType;
  readonly memo: string;
  readonly createdAt: string;
};

export type CompanyMemoLogConnectionResponse = {
  readonly items: CompanyMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type CreateCompanyMemoLogInput = {
  readonly companyId: string;
  readonly memoType: CompanyMemoType;
  readonly memo: string;
};

export type UpdateCompanyMemoLogInput = CreateCompanyMemoLogInput & {
  readonly memoLogId: string;
};

export type CompanyPrivateMemoLog = {
  readonly id: string;
  readonly memo: string;
  readonly createdAt: string;
};

export type CompanyPrivateMemoLogConnectionResponse = {
  readonly items: CompanyPrivateMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type CreateCompanyPrivateMemoLogInput = {
  readonly companyId: string;
  readonly memo: string;
};

export type UpdateCompanyPrivateMemoLogInput =
  CreateCompanyPrivateMemoLogInput & {
    readonly privateMemoLogId: string;
  };
