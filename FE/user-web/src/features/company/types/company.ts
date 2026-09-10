export type CompanyField = {
  readonly id: string;
  readonly field: string;
};

export type CompanyRegion = {
  readonly id: string;
  readonly region: string;
  readonly countryCode: string | null;
  readonly regionCode: string | null;
};

export type CompanyListItem = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
  readonly address: string | null;
  readonly createdAt: string;
};

export type CompanyDetail = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyField;
  readonly companyRegion: CompanyRegion;
  readonly address: string | null;
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

export type CompanySort = "createdAtDesc";

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
  readonly address?: string;
};

export type UpdateCompanyInput = {
  readonly companyId: string;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
  readonly address?: string;
};

export type CreateCompanyFieldInput = {
  readonly field: string;
};

export type CreateCompanyRegionInput = {
  readonly region: string;
  readonly countryCode?: string | null;
  readonly regionCode?: string | null;
};
