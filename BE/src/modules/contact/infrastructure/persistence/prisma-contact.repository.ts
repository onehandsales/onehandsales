import {
  PersonalMemoTargetType,
  Prisma,
  ProductConnectionTargetType,
  TagTargetType,
} from "@prisma/client";
import type {
  CompanyMetadata,
  CompanyRecord,
  CompanyTagRecord,
  MemoSummaryRecord,
  PaginatedResult,
} from "@/modules/company/application/ports/company.repository";
import { CompanyNotFoundError } from "@/modules/company/domain/company.errors";
import {
  type ContactDetailRecord,
  type ContactLogRecord,
  ContactRepository,
  type ContactRecord,
  type CreateContactInput,
  type CreateContactLogInput,
  type DeleteResultRecord,
  type ListContactLogsInput,
  type ListContactsInput,
  type MemoRecord,
  type UpdateContactInput,
  type UpdateContactLogInput,
} from "@/modules/contact/application/ports/contact.repository";
import {
  ContactLogNotFoundError,
  ContactNotFoundError,
} from "@/modules/contact/domain/contact.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type CompanyRow = {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly location: string | null;
  readonly industry: string | null;
  readonly description: string | null;
  readonly metadata: Prisma.JsonValue | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

type ContactRow = {
  readonly id: string;
  readonly userId: string;
  readonly companyId: string | null;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly location: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
  readonly company?: {
    readonly id: string;
    readonly name: string;
  } | null;
};

type ContactLogRow = {
  readonly id: string;
  readonly contactId: string;
  readonly logDate: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

export class PrismaContactRepository implements ContactRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async listContacts(
    input: ListContactsInput
  ): Promise<PaginatedResult<ContactRecord>> {
    if (input.companyId) {
      await this.assertCompanyExists(input.userId, input.companyId, "read");
    }

    const where = this.createContactWhere(input);
    const [contacts, totalCount] = await Promise.all([
      this.prismaService.contact.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.contact.count({ where }),
    ]);

    return {
      items: await Promise.all(
        contacts.map((contact) => this.mapContactRecord(contact))
      ),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createContact(input: CreateContactInput): Promise<ContactRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      if (input.companyId) {
        await this.assertCompanyExists(
          input.userId,
          input.companyId,
          "write",
          transaction
        );
      }

      const contact = await transaction.contact.create({
        data: {
          userId: input.userId,
          companyId: input.companyId,
          name: input.name,
          department: input.department,
          position: input.position,
          location: input.address,
          phone: input.phone,
          email: input.email,
        },
        include: { company: { select: { id: true, name: true } } },
      });

      if (input.initialMemo) {
        const encrypted = await this.encryptionPort.encryptText(input.initialMemo);
        await transaction.personalMemo.create({
          data: {
            userId: input.userId,
            targetType: PersonalMemoTargetType.CONTACT,
            targetId: contact.id,
            title: "초기 Memo",
            contentCiphertext: encrypted.ciphertext,
            contentKeyVersion: encrypted.keyVersion,
          },
        });
      }

      return this.mapContactRecord(contact, transaction);
    });
  }

  async getContactDetail(
    userId: string,
    contactId: string
  ): Promise<ContactDetailRecord | null> {
    const contact = await this.prismaService.contact.findFirst({
      where: { id: contactId, userId },
      include: { company: { select: { id: true, name: true } } },
    });

    if (!contact) {
      return null;
    }

    const [company, memos, relatedDealCount, relatedProductCount] =
      await Promise.all([
        contact.companyId
          ? this.getCompanyRecord(userId, contact.companyId)
          : Promise.resolve(null),
        this.listMemos(userId, contactId),
        this.prismaService.deal.count({
          where: { userId, contactId, deletedAt: null },
        }),
        this.prismaService.productConnection.count({
          where: {
            userId,
            targetType: ProductConnectionTargetType.CONTACT,
            targetId: contactId,
            deletedAt: null,
          },
        }),
      ]);

    return {
      contact: await this.mapContactRecord(contact),
      company,
      memos,
      relatedDealCount,
      relatedProductCount,
    };
  }

  async updateContact(input: UpdateContactInput): Promise<ContactRecord> {
    const existing = await this.prismaService.contact.findFirst({
      where: { id: input.contactId, userId: input.userId },
    });

    if (!existing) {
      throw new ContactNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    if (input.companyId) {
      await this.assertCompanyExists(input.userId, input.companyId, "write");
    }

    const contact = await this.prismaService.contact.update({
      where: { id: input.contactId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.companyId !== undefined ? { companyId: input.companyId } : {}),
        ...(input.department !== undefined
          ? { department: input.department }
          : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.address !== undefined ? { location: input.address } : {}),
      },
      include: { company: { select: { id: true, name: true } } },
    });

    return this.mapContactRecord(contact);
  }

  async deleteContact(
    userId: string,
    contactId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const contact = await this.prismaService.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    if (contact.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.contact.update({
      where: { id: contactId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: contactId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreContact(userId: string, contactId: string): Promise<ContactRecord> {
    const contact = await this.prismaService.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    const restored = await this.prismaService.contact.update({
      where: { id: contactId },
      data: {
        deletedAt: null,
        permanentDeleteAt: null,
      },
      include: { company: { select: { id: true, name: true } } },
    });

    return this.mapContactRecord(restored);
  }

  async listContactLogs(
    input: ListContactLogsInput
  ): Promise<PaginatedResult<ContactLogRecord>> {
    await this.assertContactExists(input.userId, input.contactId, "read");
    const where = {
      userId: input.userId,
      contactId: input.contactId,
      deletedAt: null,
    };
    const [logs, totalCount] = await Promise.all([
      this.prismaService.contactLog.findMany({
        where,
        orderBy: { logDate: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.contactLog.count({ where }),
    ]);

    return {
      items: logs.map((log) => this.mapContactLogRecord(log)),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createContactLog(
    input: CreateContactLogInput
  ): Promise<ContactLogRecord> {
    await this.assertContactExists(input.userId, input.contactId, "write");
    const log = await this.prismaService.contactLog.create({
      data: {
        userId: input.userId,
        contactId: input.contactId,
        logDate: input.loggedAt,
        title: input.title,
        content: input.content,
      },
    });

    return this.mapContactLogRecord(log);
  }

  async updateContactLog(
    input: UpdateContactLogInput
  ): Promise<ContactLogRecord> {
    const existing = await this.prismaService.contactLog.findFirst({
      where: {
        id: input.logId,
        contactId: input.contactId,
        userId: input.userId,
      },
    });

    if (!existing) {
      throw new ContactLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    const log = await this.prismaService.contactLog.update({
      where: { id: input.logId },
      data: {
        ...(input.loggedAt !== undefined ? { logDate: input.loggedAt } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });

    return this.mapContactLogRecord(log);
  }

  async deleteContactLog(
    userId: string,
    contactId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const existing = await this.prismaService.contactLog.findFirst({
      where: { id: logId, contactId, userId },
    });

    if (!existing) {
      throw new ContactLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.contactLog.update({
      where: { id: logId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: logId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  private createContactWhere(input: ListContactsInput): Prisma.ContactWhereInput {
    return {
      userId: input.userId,
      ...(input.companyId ? { companyId: input.companyId } : {}),
      ...(input.includeDeleted ? {} : { deletedAt: null }),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { department: { contains: input.search, mode: "insensitive" } },
              { position: { contains: input.search, mode: "insensitive" } },
              { phone: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
              {
                company: {
                  name: { contains: input.search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };
  }

  private async assertCompanyExists(
    userId: string,
    companyId: string,
    operation: "read" | "write",
    client: PrismaService | Prisma.TransactionClient = this.prismaService
  ): Promise<CompanyRow> {
    const company = await client.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    if (company.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return company;
  }

  private async assertContactExists(
    userId: string,
    contactId: string,
    operation: "read" | "write"
  ): Promise<ContactRow> {
    const contact = await this.prismaService.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    if (contact.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return contact;
  }

  private async mapContactRecord(
    contact: ContactRow,
    client: PrismaService | Prisma.TransactionClient = this.prismaService
  ): Promise<ContactRecord> {
    return {
      id: contact.id,
      userId: contact.userId,
      companyId: contact.companyId,
      companyName: contact.company?.name ?? null,
      name: contact.name,
      department: contact.department,
      position: contact.position,
      phone: contact.phone,
      email: contact.email,
      address: contact.location,
      memoSummary: await this.getMemoSummary(client, contact.userId, contact.id),
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      deletedAt: contact.deletedAt,
      permanentDeleteAt: contact.permanentDeleteAt,
    };
  }

  private mapContactLogRecord(log: ContactLogRow): ContactLogRecord {
    return {
      id: log.id,
      contactId: log.contactId,
      loggedAt: log.logDate,
      title: log.title,
      content: log.content,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      deletedAt: log.deletedAt,
      permanentDeleteAt: log.permanentDeleteAt,
    };
  }

  private async getCompanyRecord(
    userId: string,
    companyId: string
  ): Promise<CompanyRecord | null> {
    const company = await this.prismaService.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      return null;
    }

    return this.mapCompanyRecord(company);
  }

  private async mapCompanyRecord(company: CompanyRow): Promise<CompanyRecord> {
    const [tags, memoSummary] = await Promise.all([
      this.listCompanyTags(company.userId, company.id),
      this.getCompanyMemoSummary(company.userId, company.id),
    ]);

    return {
      id: company.id,
      userId: company.userId,
      name: company.name,
      industry: company.industry,
      region: company.location,
      description: company.description,
      metadata: this.fromCompanyMetadata(company.metadata),
      tags,
      memoSummary,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
      permanentDeleteAt: company.permanentDeleteAt,
    };
  }

  private async listCompanyTags(
    userId: string,
    companyId: string
  ): Promise<CompanyTagRecord[]> {
    const assignments = await this.prismaService.tagAssignment.findMany({
      where: {
        userId,
        targetType: TagTargetType.COMPANY,
        targetId: companyId,
      },
      include: { tag: true },
      orderBy: { createdAt: "asc" },
    });

    return assignments.map((assignment) => ({
      id: assignment.tag.id,
      name: assignment.tag.name,
      color: assignment.tag.color,
    }));
  }

  private async getMemoSummary(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    contactId: string
  ): Promise<MemoSummaryRecord> {
    const [memoCount, latestMemo] = await Promise.all([
      client.personalMemo.count({
        where: {
          userId,
          targetType: PersonalMemoTargetType.CONTACT,
          targetId: contactId,
          deletedAt: null,
        },
      }),
      client.personalMemo.findFirst({
        where: {
          userId,
          targetType: PersonalMemoTargetType.CONTACT,
          targetId: contactId,
          deletedAt: null,
        },
        orderBy: { memoDate: "desc" },
      }),
    ]);

    return {
      hasMemo: memoCount > 0,
      memoCount,
      latestMemoAt: latestMemo?.memoDate ?? null,
    };
  }

  private async getCompanyMemoSummary(
    userId: string,
    companyId: string
  ): Promise<MemoSummaryRecord> {
    const [memoCount, latestMemo] = await Promise.all([
      this.prismaService.personalMemo.count({
        where: {
          userId,
          targetType: PersonalMemoTargetType.COMPANY,
          targetId: companyId,
          deletedAt: null,
        },
      }),
      this.prismaService.personalMemo.findFirst({
        where: {
          userId,
          targetType: PersonalMemoTargetType.COMPANY,
          targetId: companyId,
          deletedAt: null,
        },
        orderBy: { memoDate: "desc" },
      }),
    ]);

    return {
      hasMemo: memoCount > 0,
      memoCount,
      latestMemoAt: latestMemo?.memoDate ?? null,
    };
  }

  private async listMemos(userId: string, contactId: string): Promise<MemoRecord[]> {
    const memos = await this.prismaService.personalMemo.findMany({
      where: {
        userId,
        targetType: PersonalMemoTargetType.CONTACT,
        targetId: contactId,
        deletedAt: null,
      },
      orderBy: { memoDate: "desc" },
      take: 20,
    });

    return Promise.all(
      memos.map(async (memo) => ({
        id: memo.id,
        targetType: "CONTACT" as const,
        targetId: memo.targetId,
        memoDate: memo.memoDate,
        title: memo.title,
        content: await this.encryptionPort.decryptText({
          ciphertext: memo.contentCiphertext,
          keyVersion: memo.contentKeyVersion,
        }),
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
        deletedAt: memo.deletedAt,
        permanentDeleteAt: memo.permanentDeleteAt,
      }))
    );
  }

  private fromCompanyMetadata(metadata: Prisma.JsonValue | null): CompanyMetadata {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return { address: null, website: null };
    }

    return {
      address: this.getStringValue(metadata, "address"),
      website: this.getStringValue(metadata, "website"),
    };
  }

  private getStringValue(
    metadata: Record<string, unknown>,
    key: string
  ): string | null {
    const value = metadata[key];

    return typeof value === "string" && value.trim().length > 0 ? value : null;
  }
}
