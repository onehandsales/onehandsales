import type {
  CompanyRecord,
  DeleteResultRecord,
  MemoSummaryRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export type {
  DeleteResultRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export const CONTACT_REPOSITORY = Symbol("CONTACT_REPOSITORY");

export interface ContactRecord {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly memoSummary: MemoSummaryRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface MemoRecord {
  readonly id: string;
  readonly targetType: "CONTACT";
  readonly targetId: string;
  readonly memoDate: Date;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ContactLogRecord {
  readonly id: string;
  readonly contactId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ContactDetailRecord {
  readonly contact: ContactRecord;
  readonly company: CompanyRecord | null;
  readonly memos: MemoRecord[];
  readonly relatedDealCount: number;
  readonly relatedProductCount: number;
}

export interface ListContactsInput extends PaginationInput {
  readonly userId: string;
  readonly search: string | null;
  readonly companyId: string | null;
  readonly includeDeleted: boolean;
}

export interface CreateContactInput {
  readonly userId: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly initialMemo: string | null;
}

export interface UpdateContactInput {
  readonly userId: string;
  readonly contactId: string;
  readonly name?: string;
  readonly companyId?: string | null;
  readonly department?: string | null;
  readonly position?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
}

export interface ListContactLogsInput extends PaginationInput {
  readonly userId: string;
  readonly contactId: string;
}

export interface CreateContactLogInput {
  readonly userId: string;
  readonly contactId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
}

export interface UpdateContactLogInput {
  readonly userId: string;
  readonly contactId: string;
  readonly logId: string;
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

export interface ContactRepository {
  listContacts(
    input: ListContactsInput
  ): Promise<PaginatedResult<ContactRecord>>;
  createContact(input: CreateContactInput): Promise<ContactRecord>;
  getContactDetail(
    userId: string,
    contactId: string
  ): Promise<ContactDetailRecord | null>;
  updateContact(input: UpdateContactInput): Promise<ContactRecord>;
  deleteContact(
    userId: string,
    contactId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  restoreContact(userId: string, contactId: string): Promise<ContactRecord>;
  listContactLogs(
    input: ListContactLogsInput
  ): Promise<PaginatedResult<ContactLogRecord>>;
  createContactLog(input: CreateContactLogInput): Promise<ContactLogRecord>;
  updateContactLog(input: UpdateContactLogInput): Promise<ContactLogRecord>;
  deleteContactLog(
    userId: string,
    contactId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
}
