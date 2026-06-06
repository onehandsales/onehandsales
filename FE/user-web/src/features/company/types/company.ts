export type CompanyTag = {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
};

export type Company = {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly address: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly tags: CompanyTag[];
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly contactCount?: number;
  readonly dealCount?: number;
  readonly productCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type CompanyLog = {
  readonly id: string;
  readonly companyId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
  readonly permanentDeleteAt?: string | null;
};

export type CompanyMemo = {
  readonly id: string;
  readonly targetType: "COMPANY";
  readonly targetId: string;
  readonly memoDate: string;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type CompanyDetail = {
  readonly company: Company;
  readonly logs: CompanyLog[];
  readonly memos: CompanyMemo[];
  readonly contactCount: number;
  readonly dealCount: number;
  readonly productCount: number;
};

export type PaginatedResponse<TItem> = {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
};

export type CompanyListResponse = PaginatedResponse<Company>;

export type DeleteCompanyResponse = {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
};

export type CompanyListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly includeDeleted?: boolean;
};

export type CreateCompanyInput = {
  readonly name: string;
  readonly industry?: string;
  readonly region?: string;
  readonly address?: string;
  readonly website?: string;
  readonly description?: string;
  readonly initialMemo?: string;
  readonly tags?: string[];
};

export type UpdateCompanyInput = {
  readonly companyId: string;
  readonly name?: string;
  readonly industry?: string;
  readonly region?: string;
  readonly address?: string;
  readonly website?: string;
  readonly description?: string;
  readonly tags?: string[];
};

export type CreateCompanyLogInput = {
  readonly companyId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content?: string;
};

export type UpdateCompanyLogInput = {
  readonly companyId: string;
  readonly logId: string;
  readonly loggedAt?: string;
  readonly title?: string;
  readonly content?: string;
};
