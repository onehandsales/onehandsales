export const COMPANY_REPOSITORY = Symbol("COMPANY_REPOSITORY");

export interface PaginationInput {
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginatedResult<TItem> {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface CompanyMetadata {
  readonly address: string | null;
  readonly website: string | null;
}

export interface CompanyTagRecord {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
}

export interface MemoSummaryRecord {
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: Date | null;
}

export interface CompanyRecord {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly description: string | null;
  readonly metadata: CompanyMetadata;
  readonly tags: CompanyTagRecord[];
  readonly memoSummary: MemoSummaryRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface MemoRecord {
  readonly id: string;
  readonly targetType: "COMPANY";
  readonly targetId: string;
  readonly memoDate: Date;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface CompanyLogRecord {
  readonly id: string;
  readonly companyId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface CompanyDetailRecord {
  readonly company: CompanyRecord;
  readonly logs: CompanyLogRecord[];
  readonly memos: MemoRecord[];
  readonly contactCount: number;
  readonly dealCount: number;
  readonly productCount: number;
}

export interface ListCompaniesInput extends PaginationInput {
  readonly userId: string;
  readonly search: string | null;
  readonly includeDeleted: boolean;
}

export interface CreateCompanyInput {
  readonly userId: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly address: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly tags: string[];
  readonly initialMemo: string | null;
}

export interface UpdateCompanyInput {
  readonly userId: string;
  readonly companyId: string;
  readonly name?: string;
  readonly industry?: string | null;
  readonly region?: string | null;
  readonly address?: string | null;
  readonly website?: string | null;
  readonly description?: string | null;
  readonly tags?: string[];
}

export interface DeleteResultRecord {
  readonly id: string;
  readonly deletedAt: Date;
  readonly permanentDeleteAt: Date;
}

export interface ListCompanyLogsInput extends PaginationInput {
  readonly userId: string;
  readonly companyId: string;
}

export interface CreateCompanyLogInput {
  readonly userId: string;
  readonly companyId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
}

export interface UpdateCompanyLogInput {
  readonly userId: string;
  readonly companyId: string;
  readonly logId: string;
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

export interface CompanyRepository {
  listCompanies(
    input: ListCompaniesInput
  ): Promise<PaginatedResult<CompanyRecord>>;
  createCompany(input: CreateCompanyInput): Promise<CompanyRecord>;
  getCompanyDetail(
    userId: string,
    companyId: string
  ): Promise<CompanyDetailRecord | null>;
  updateCompany(input: UpdateCompanyInput): Promise<CompanyRecord>;
  deleteCompany(
    userId: string,
    companyId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  restoreCompany(userId: string, companyId: string): Promise<CompanyRecord>;
  listCompanyLogs(
    input: ListCompanyLogsInput
  ): Promise<PaginatedResult<CompanyLogRecord>>;
  createCompanyLog(input: CreateCompanyLogInput): Promise<CompanyLogRecord>;
  updateCompanyLog(input: UpdateCompanyLogInput): Promise<CompanyLogRecord>;
  deleteCompanyLog(
    userId: string,
    companyId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
}

