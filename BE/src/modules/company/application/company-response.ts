import type {
  CompanyDetailRecord,
  CompanyLogRecord,
  CompanyRecord,
  DeleteResultRecord,
  MemoRecord,
  PaginatedResult,
} from "./ports/company.repository";

export interface CompanyResponse {
  readonly id: string;
  readonly name: string;
  readonly industry: string | null;
  readonly region: string | null;
  readonly address: string | null;
  readonly website: string | null;
  readonly description: string | null;
  readonly tags: Array<{
    readonly id: string;
    readonly name: string;
    readonly color: string | null;
  }>;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface CompanyLogResponse {
  readonly id: string;
  readonly companyId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
  readonly permanentDeleteAt?: string | null;
}

export interface MemoResponse {
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
}

export interface CompanyDetailResponse {
  readonly company: CompanyResponse;
  readonly logs: CompanyLogResponse[];
  readonly memos: MemoResponse[];
  readonly contactCount: number;
  readonly dealCount: number;
  readonly productCount: number;
}

export interface PaginatedResponse<TItem> {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface DeleteResponse {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export function toCompanyResponse(company: CompanyRecord): CompanyResponse {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    region: company.region,
    address: company.metadata.address,
    website: company.metadata.website,
    description: company.description,
    tags: company.tags,
    hasMemo: company.memoSummary.hasMemo,
    memoCount: company.memoSummary.memoCount,
    latestMemoAt: toIsoOrNull(company.memoSummary.latestMemoAt),
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(company.deletedAt),
    permanentDeleteAt: toIsoOrNull(company.permanentDeleteAt),
  };
}

export function toCompanyLogResponse(
  log: CompanyLogRecord
): CompanyLogResponse {
  return {
    id: log.id,
    companyId: log.companyId,
    loggedAt: log.loggedAt.toISOString(),
    title: log.title,
    content: log.content,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(log.deletedAt),
    permanentDeleteAt: toIsoOrNull(log.permanentDeleteAt),
  };
}

export function toMemoResponse(memo: MemoRecord): MemoResponse {
  return {
    id: memo.id,
    targetType: memo.targetType,
    targetId: memo.targetId,
    memoDate: memo.memoDate.toISOString(),
    title: memo.title,
    content: memo.content,
    createdAt: memo.createdAt.toISOString(),
    updatedAt: memo.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(memo.deletedAt),
    permanentDeleteAt: toIsoOrNull(memo.permanentDeleteAt),
  };
}

export function toCompanyDetailResponse(
  detail: CompanyDetailRecord
): CompanyDetailResponse {
  return {
    company: toCompanyResponse(detail.company),
    logs: detail.logs.map(toCompanyLogResponse),
    memos: detail.memos.map(toMemoResponse),
    contactCount: detail.contactCount,
    dealCount: detail.dealCount,
    productCount: detail.productCount,
  };
}

export function toPaginatedResponse<TInput, TOutput>(
  result: PaginatedResult<TInput>,
  mapItem: (item: TInput) => TOutput
): PaginatedResponse<TOutput> {
  return {
    items: result.items.map(mapItem),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    hasNext: result.hasNext,
  };
}

export function toDeleteResponse(result: DeleteResultRecord): DeleteResponse {
  return {
    id: result.id,
    deletedAt: result.deletedAt.toISOString(),
    permanentDeleteAt: result.permanentDeleteAt.toISOString(),
  };
}

function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

