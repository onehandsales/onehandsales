import {
  toCompanyResponse,
  type CompanyResponse,
  type DeleteResponse,
  type PaginatedResponse,
} from "@/modules/company/application/company-response";
import type {
  ContactDetailRecord,
  ContactLogRecord,
  ContactRecord,
  DeleteResultRecord,
  MemoRecord,
  PaginatedResult,
} from "@/modules/contact/application/ports/contact.repository";

export interface ContactResponse {
  readonly id: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ContactLogResponse {
  readonly id: string;
  readonly contactId: string;
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
  readonly targetType: "CONTACT";
  readonly targetId: string;
  readonly memoDate: string;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ContactDetailResponse {
  readonly contact: ContactResponse;
  readonly company: CompanyResponse | null;
  readonly memos: MemoResponse[];
  readonly relatedDealCount: number;
  readonly relatedProductCount: number;
}

export function toContactResponse(contact: ContactRecord): ContactResponse {
  return {
    id: contact.id,
    name: contact.name,
    companyId: contact.companyId,
    companyName: contact.companyName,
    department: contact.department,
    position: contact.position,
    phone: contact.phone,
    email: contact.email,
    address: contact.address,
    hasMemo: contact.memoSummary.hasMemo,
    memoCount: contact.memoSummary.memoCount,
    latestMemoAt: toIsoOrNull(contact.memoSummary.latestMemoAt),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(contact.deletedAt),
    permanentDeleteAt: toIsoOrNull(contact.permanentDeleteAt),
  };
}

export function toContactLogResponse(
  log: ContactLogRecord
): ContactLogResponse {
  return {
    id: log.id,
    contactId: log.contactId,
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

export function toContactDetailResponse(
  detail: ContactDetailRecord
): ContactDetailResponse {
  return {
    contact: toContactResponse(detail.contact),
    company: detail.company ? toCompanyResponse(detail.company) : null,
    memos: detail.memos.map(toMemoResponse),
    relatedDealCount: detail.relatedDealCount,
    relatedProductCount: detail.relatedProductCount,
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
