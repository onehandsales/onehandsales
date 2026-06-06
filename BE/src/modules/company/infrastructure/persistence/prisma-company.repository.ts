import {
  PersonalMemoTargetType,
  Prisma,
  TagLogAction,
  TagTargetType,
} from "@prisma/client";
import {
  type CompanyDetailRecord,
  type CompanyLogRecord,
  CompanyRepository,
  type CompanyRecord,
  type CompanyTagRecord,
  type CreateCompanyInput,
  type CreateCompanyLogInput,
  type DeleteResultRecord,
  type ListCompaniesInput,
  type ListCompanyLogsInput,
  type MemoRecord,
  type MemoSummaryRecord,
  type PaginatedResult,
  type UpdateCompanyInput,
  type UpdateCompanyLogInput,
} from "@/modules/company/application/ports/company.repository";
import {
  CompanyLogNotFoundError,
  CompanyNotFoundError,
} from "@/modules/company/domain/company.errors";
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

type CompanyLogRow = {
  readonly id: string;
  readonly companyId: string;
  readonly logDate: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

export class PrismaCompanyRepository implements CompanyRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async listCompanies(
    input: ListCompaniesInput
  ): Promise<PaginatedResult<CompanyRecord>> {
    const where = this.createCompanyWhere(input);
    const [companies, totalCount] = await Promise.all([
      this.prismaService.company.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.company.count({ where }),
    ]);

    return {
      items: await Promise.all(
        companies.map((company) => this.mapCompanyRecord(company))
      ),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createCompany(input: CreateCompanyInput): Promise<CompanyRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const company = await transaction.company.create({
        data: {
          userId: input.userId,
          name: input.name,
          industry: input.industry,
          location: input.region,
          description: input.description,
          metadata: this.toCompanyMetadataJson(input.address, input.website),
        },
      });

      if (input.tags.length > 0) {
        await this.replaceTags(transaction, {
          userId: input.userId,
          companyId: company.id,
          companyName: company.name,
          tags: input.tags,
        });
      }

      if (input.initialMemo) {
        const encrypted = await this.encryptionPort.encryptText(input.initialMemo);
        await transaction.personalMemo.create({
          data: {
            userId: input.userId,
            targetType: PersonalMemoTargetType.COMPANY,
            targetId: company.id,
            title: "초기 Memo",
            contentCiphertext: encrypted.ciphertext,
            contentKeyVersion: encrypted.keyVersion,
          },
        });
      }

      return this.mapCompanyRecord(company, transaction);
    });
  }

  async getCompanyDetail(
    userId: string,
    companyId: string
  ): Promise<CompanyDetailRecord | null> {
    const company = await this.prismaService.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      return null;
    }

    const [logs, memos, contactCount, dealCount, productCount] =
      await Promise.all([
        this.prismaService.companyLog.findMany({
          where: { userId, companyId, deletedAt: null },
          orderBy: { logDate: "desc" },
          take: 20,
        }),
        this.listMemos(userId, companyId),
        this.prismaService.contact.count({
          where: { userId, companyId, deletedAt: null },
        }),
        this.prismaService.deal.count({
          where: { userId, companyId, deletedAt: null },
        }),
        this.prismaService.productConnection.count({
          where: {
            userId,
            targetType: "COMPANY",
            targetId: companyId,
            deletedAt: null,
          },
        }),
      ]);

    return {
      company: await this.mapCompanyRecord(company),
      logs: logs.map((log) => this.mapCompanyLogRecord(log)),
      memos,
      contactCount,
      dealCount,
      productCount,
    };
  }

  async updateCompany(input: UpdateCompanyInput): Promise<CompanyRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const existing = await transaction.company.findFirst({
        where: { id: input.companyId, userId: input.userId },
      });

      if (!existing) {
        throw new CompanyNotFoundError();
      }

      if (existing.deletedAt) {
        throw new DeletedResourceError("write");
      }

      const data: Prisma.CompanyUpdateInput = {};

      if (input.name !== undefined) {
        data.name = input.name;
      }

      if (input.industry !== undefined) {
        data.industry = input.industry;
      }

      if (input.region !== undefined) {
        data.location = input.region;
      }

      if (input.description !== undefined) {
        data.description = input.description;
      }

      if (input.address !== undefined || input.website !== undefined) {
        const metadata = this.fromCompanyMetadata(existing.metadata);
        data.metadata = this.toCompanyMetadataJson(
          input.address !== undefined ? input.address : metadata.address,
          input.website !== undefined ? input.website : metadata.website
        );
      }

      const company = await transaction.company.update({
        where: { id: input.companyId },
        data,
      });

      if (input.tags !== undefined) {
        await this.replaceTags(transaction, {
          userId: input.userId,
          companyId: company.id,
          companyName: company.name,
          tags: input.tags,
        });
      }

      return this.mapCompanyRecord(company, transaction);
    });
  }

  async deleteCompany(
    userId: string,
    companyId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const company = await this.prismaService.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    if (company.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.company.update({
      where: { id: companyId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: companyId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreCompany(userId: string, companyId: string): Promise<CompanyRecord> {
    const company = await this.prismaService.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    const restored = await this.prismaService.company.update({
      where: { id: companyId },
      data: {
        deletedAt: null,
        permanentDeleteAt: null,
      },
    });

    return this.mapCompanyRecord(restored);
  }

  async listCompanyLogs(
    input: ListCompanyLogsInput
  ): Promise<PaginatedResult<CompanyLogRecord>> {
    await this.assertCompanyExists(input.userId, input.companyId);
    const where = {
      userId: input.userId,
      companyId: input.companyId,
      deletedAt: null,
    };
    const [logs, totalCount] = await Promise.all([
      this.prismaService.companyLog.findMany({
        where,
        orderBy: { logDate: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.companyLog.count({ where }),
    ]);

    return {
      items: logs.map((log) => this.mapCompanyLogRecord(log)),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createCompanyLog(
    input: CreateCompanyLogInput
  ): Promise<CompanyLogRecord> {
    await this.assertCompanyExists(input.userId, input.companyId);
    const log = await this.prismaService.companyLog.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        logDate: input.loggedAt,
        title: input.title,
        content: input.content,
      },
    });

    return this.mapCompanyLogRecord(log);
  }

  async updateCompanyLog(
    input: UpdateCompanyLogInput
  ): Promise<CompanyLogRecord> {
    const existing = await this.prismaService.companyLog.findFirst({
      where: {
        id: input.logId,
        companyId: input.companyId,
        userId: input.userId,
      },
    });

    if (!existing) {
      throw new CompanyLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    const log = await this.prismaService.companyLog.update({
      where: { id: input.logId },
      data: {
        ...(input.loggedAt !== undefined ? { logDate: input.loggedAt } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });

    return this.mapCompanyLogRecord(log);
  }

  async deleteCompanyLog(
    userId: string,
    companyId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const existing = await this.prismaService.companyLog.findFirst({
      where: { id: logId, companyId, userId },
    });

    if (!existing) {
      throw new CompanyLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.companyLog.update({
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

  private createCompanyWhere(input: ListCompaniesInput): Prisma.CompanyWhereInput {
    return {
      userId: input.userId,
      ...(input.includeDeleted ? {} : { deletedAt: null }),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { industry: { contains: input.search, mode: "insensitive" } },
              { location: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async assertCompanyExists(
    userId: string,
    companyId: string
  ): Promise<CompanyRow> {
    const company = await this.prismaService.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    if (company.deletedAt) {
      throw new DeletedResourceError("write");
    }

    return company;
  }

  private async mapCompanyRecord(
    company: CompanyRow,
    client: PrismaService | Prisma.TransactionClient = this.prismaService
  ): Promise<CompanyRecord> {
    const [tags, memoSummary] = await Promise.all([
      this.listTags(client, company.userId, company.id),
      this.getMemoSummary(client, company.userId, company.id),
    ]);
    const metadata = this.fromCompanyMetadata(company.metadata);

    return {
      id: company.id,
      userId: company.userId,
      name: company.name,
      industry: company.industry,
      region: company.location,
      description: company.description,
      metadata,
      tags,
      memoSummary,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
      permanentDeleteAt: company.permanentDeleteAt,
    };
  }

  private mapCompanyLogRecord(log: CompanyLogRow): CompanyLogRecord {
    return {
      id: log.id,
      companyId: log.companyId,
      loggedAt: log.logDate,
      title: log.title,
      content: log.content,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      deletedAt: log.deletedAt,
      permanentDeleteAt: log.permanentDeleteAt,
    };
  }

  private async listTags(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    companyId: string
  ): Promise<CompanyTagRecord[]> {
    const assignments = await client.tagAssignment.findMany({
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
    companyId: string
  ): Promise<MemoSummaryRecord> {
    const [memoCount, latestMemo] = await Promise.all([
      client.personalMemo.count({
        where: {
          userId,
          targetType: PersonalMemoTargetType.COMPANY,
          targetId: companyId,
          deletedAt: null,
        },
      }),
      client.personalMemo.findFirst({
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

  private async listMemos(userId: string, companyId: string): Promise<MemoRecord[]> {
    const memos = await this.prismaService.personalMemo.findMany({
      where: {
        userId,
        targetType: PersonalMemoTargetType.COMPANY,
        targetId: companyId,
        deletedAt: null,
      },
      orderBy: { memoDate: "desc" },
      take: 20,
    });

    return Promise.all(
      memos.map(async (memo) => ({
        id: memo.id,
        targetType: "COMPANY" as const,
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

  private async replaceTags(
    client: Prisma.TransactionClient,
    input: {
      readonly userId: string;
      readonly companyId: string;
      readonly companyName: string;
      readonly tags: string[];
    }
  ): Promise<void> {
    const existingAssignments = await client.tagAssignment.findMany({
      where: {
        userId: input.userId,
        targetType: TagTargetType.COMPANY,
        targetId: input.companyId,
      },
      include: { tag: true },
    });
    const existingNames = new Set(
      existingAssignments.map((assignment) => assignment.tag.name)
    );
    const nextNames = new Set(input.tags);

    for (const assignment of existingAssignments) {
      if (!nextNames.has(assignment.tag.name)) {
        await client.tagLog.create({
          data: {
            userId: input.userId,
            tagId: assignment.tagId,
            assignmentId: assignment.id,
            action: TagLogAction.TAG_UNASSIGNED,
            tagNameSnapshot: assignment.tag.name,
            tagColorSnapshot: assignment.tag.color,
            targetType: TagTargetType.COMPANY,
            targetId: input.companyId,
            targetTitleSnapshot: input.companyName,
          },
        });
        await client.tagAssignment.delete({ where: { id: assignment.id } });
      }
    }

    for (const tagName of input.tags) {
      if (existingNames.has(tagName)) {
        continue;
      }

      const tag = await client.tag.upsert({
        where: {
          userId_name: {
            userId: input.userId,
            name: tagName,
          },
        },
        create: {
          userId: input.userId,
          name: tagName,
        },
        update: {},
      });
      const assignment = await client.tagAssignment.create({
        data: {
          userId: input.userId,
          tagId: tag.id,
          targetType: TagTargetType.COMPANY,
          targetId: input.companyId,
        },
      });
      await client.tagLog.create({
        data: {
          userId: input.userId,
          tagId: tag.id,
          assignmentId: assignment.id,
          action: TagLogAction.TAG_ASSIGNED,
          tagNameSnapshot: tag.name,
          tagColorSnapshot: tag.color,
          targetType: TagTargetType.COMPANY,
          targetId: input.companyId,
          targetTitleSnapshot: input.companyName,
        },
      });
    }
  }

  private fromCompanyMetadata(metadata: Prisma.JsonValue | null): {
    address: string | null;
    website: string | null;
  } {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return { address: null, website: null };
    }

    return {
      address: this.getStringValue(metadata, "address"),
      website: this.getStringValue(metadata, "website"),
    };
  }

  private toCompanyMetadataJson(
    address: string | null,
    website: string | null
  ): Prisma.InputJsonObject {
    return {
      address,
      website,
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
