import { Prisma } from "@prisma/client";
import {
  BusinessCardResolutionValue,
  type BusinessCardConfirmRepositoryResult,
  type BusinessCardConfirmResult,
  type BusinessCardScanLogPageRecord,
  type BusinessCardScanLogRecord,
  type BusinessCardScanLogRepository,
  BusinessCardScanStatusValue,
  type ConfirmBusinessCardScanInput,
  type CreateBusinessCardScanLogInput,
  type ListBusinessCardScanLogsInput,
} from "@/modules/business-card/application/ports/business-card-scan-log.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const DEFAULT_COMPANY_FIELD_NAME = "미분류";
const DEFAULT_COMPANY_REGION_NAME = "미지정";
const DEFAULT_CONTACT_DEPARTMENT_NAME = "미지정";
const DEFAULT_CONTACT_JOB_GRADE_NAME = "미지정";

type BusinessCardPrismaClient = PrismaService | Prisma.TransactionClient;

type BusinessCardScanLogRow = {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly companyResolution: string | null;
  readonly contactResolution: string | null;
  readonly aiProvider: string;
  readonly aiModel: string;
  readonly promptSnapshot: string;
  readonly requestToken: number | null;
  readonly responseToken: number | null;
  readonly totalToken: number | null;
  readonly requestCost: number | null;
  readonly responseCost: number | null;
  readonly totalCost: number | null;
  readonly costCurrency: string;
  readonly pendingTimeMs: number | null;
  readonly confirmedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

// 역할 : PrismaBusinessCardScanLogRepository 명함 스캔 로그 저장소를 Prisma로 구현합니다.
export class PrismaBusinessCardScanLogRepository
  implements BusinessCardScanLogRepository
{
  constructor(
    private readonly client: BusinessCardPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async createScanLog(
    input: CreateBusinessCardScanLogInput
  ): Promise<BusinessCardScanLogRecord> {
    const scanLog = await this.client.businessCardScanLog.create({
      data: {
        userId: input.userId,
        status: input.status,
        companyName: input.companyName,
        companyFieldName: input.companyFieldName,
        companyRegionName: input.companyRegionName,
        contactName: input.contactName,
        contactMobile: input.contactMobile,
        contactEmail: input.contactEmail,
        contactDepartmentName: input.contactDepartmentName,
        contactJobGradeName: input.contactJobGradeName,
        aiProvider: input.aiProvider,
        aiModel: input.aiModel,
        promptSnapshot: input.promptSnapshot,
        requestToken: input.requestToken,
        responseToken: input.responseToken,
        totalToken: input.totalToken,
        requestCost: input.requestCost,
        responseCost: input.responseCost,
        totalCost: input.totalCost,
        costCurrency: input.costCurrency,
        pendingTimeMs: input.pendingTimeMs,
      },
    });

    return this.mapScanLog(scanLog);
  }

  async listScanLogs(
    input: ListBusinessCardScanLogsInput
  ): Promise<BusinessCardScanLogPageRecord> {
    const where: Prisma.BusinessCardScanLogWhereInput = {
      userId: input.userId,
      ...(input.statuses && input.statuses.length > 0
        ? { status: { in: [...input.statuses] } }
        : {}),
    };

    const [items, totalCount] = await Promise.all([
      this.client.businessCardScanLog.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.businessCardScanLog.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapScanLog(item)),
      totalCount,
    };
  }

  async findScanLog(
    userId: string,
    scanLogId: string
  ): Promise<BusinessCardScanLogRecord | null> {
    const scanLog = await this.client.businessCardScanLog.findFirst({
      where: {
        id: scanLogId,
        userId,
      },
    });

    return scanLog ? this.mapScanLog(scanLog) : null;
  }

  async confirmScanLog(
    input: ConfirmBusinessCardScanInput
  ): Promise<BusinessCardConfirmRepositoryResult> {
    if (this.transactionRunner) {
      return this.transactionRunner.$transaction(async (transaction) => {
        return new PrismaBusinessCardScanLogRepository(
          transaction,
          null
        ).confirmScanLog(input);
      });
    }

    return this.confirmScanLogInClient(input);
  }

  private async confirmScanLogInClient(
    input: ConfirmBusinessCardScanInput
  ): Promise<BusinessCardConfirmRepositoryResult> {
    const scanLog = await this.client.businessCardScanLog.findFirst({
      where: {
        id: input.scanLogId,
        userId: input.userId,
      },
    });

    if (!scanLog) {
      return { type: "notFound" };
    }

    if (scanLog.status !== BusinessCardScanStatusValue.OCR_SUCCESS) {
      return {
        type: "notConfirmable",
        scanLog: this.mapScanLog(scanLog),
      };
    }

    const field = await this.upsertCompanyField(
      input.userId,
      input.companyFieldName ?? DEFAULT_COMPANY_FIELD_NAME
    );
    const region = await this.upsertCompanyRegion(
      input.userId,
      input.companyRegionName ?? DEFAULT_COMPANY_REGION_NAME
    );

    const companyResult = await this.findOrCreateCompany({
      userId: input.userId,
      companyName: input.companyName ?? "",
      companyFieldId: field.id,
      companyRegionId: region.id,
    });

    const department = await this.upsertContactDepartment(
      input.userId,
      input.contactDepartmentName ?? DEFAULT_CONTACT_DEPARTMENT_NAME
    );
    const jobGrade = await this.upsertContactJobGrade(
      input.userId,
      input.contactJobGradeName ?? DEFAULT_CONTACT_JOB_GRADE_NAME
    );

    const contactResult = await this.findOrCreateContact({
      userId: input.userId,
      companyId: companyResult.company.id,
      username: input.contactName ?? "",
      mobile: input.contactMobile ?? "",
      email: input.contactEmail ?? "",
      contactDepartmentId: department.id,
      contactJobGradeId: jobGrade.id,
    });

    const updatedScanLog = await this.client.businessCardScanLog.update({
      where: {
        id: scanLog.id,
      },
      data: {
        status: BusinessCardScanStatusValue.CONFIRMED,
        companyName: input.companyName,
        companyFieldName: field.field,
        companyRegionName: region.region,
        contactName: input.contactName,
        contactMobile: input.contactMobile,
        contactEmail: input.contactEmail,
        contactDepartmentName: department.departmentName,
        contactJobGradeName: jobGrade.jobGradeName,
        companyId: companyResult.company.id,
        contactId: contactResult.contact.id,
        companyResolution: companyResult.resolution,
        contactResolution: contactResult.resolution,
        confirmedAt: input.confirmedAt,
      },
    });

    const result: BusinessCardConfirmResult = {
      scanLog: this.mapScanLog(updatedScanLog),
      company: {
        id: companyResult.company.id,
        companyName: companyResult.company.companyName,
        resolution: companyResult.resolution,
      },
      contact: {
        id: contactResult.contact.id,
        username: contactResult.contact.username,
        resolution: contactResult.resolution,
      },
    };

    return { type: "confirmed", result };
  }

  private async upsertCompanyField(userId: string, field: string) {
    return this.client.companyField.upsert({
      where: {
        userId_field: {
          userId,
          field,
        },
      },
      create: {
        userId,
        field,
      },
      update: {},
      select: {
        id: true,
        field: true,
      },
    });
  }

  private async upsertCompanyRegion(userId: string, region: string) {
    return this.client.companyRegion.upsert({
      where: {
        userId_region: {
          userId,
          region,
        },
      },
      create: {
        userId,
        region,
      },
      update: {},
      select: {
        id: true,
        region: true,
      },
    });
  }

  private async upsertContactDepartment(
    userId: string,
    departmentName: string
  ) {
    return this.client.contactDepartment.upsert({
      where: {
        userId_departmentName: {
          userId,
          departmentName,
        },
      },
      create: {
        userId,
        departmentName,
      },
      update: {},
      select: {
        id: true,
        departmentName: true,
      },
    });
  }

  private async upsertContactJobGrade(userId: string, jobGradeName: string) {
    return this.client.contactJobGrade.upsert({
      where: {
        userId_jobGradeName: {
          userId,
          jobGradeName,
        },
      },
      create: {
        userId,
        jobGradeName,
      },
      update: {},
      select: {
        id: true,
        jobGradeName: true,
      },
    });
  }

  private async findOrCreateCompany(input: {
    readonly userId: string;
    readonly companyName: string;
    readonly companyFieldId: string;
    readonly companyRegionId: string;
  }): Promise<{
    readonly company: { readonly id: string; readonly companyName: string };
    readonly resolution: BusinessCardResolutionValue;
  }> {
    const existing = await this.client.company.findFirst({
      where: {
        userId: input.userId,
        companyName: input.companyName,
        deletedAt: null,
      },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (existing) {
      return {
        company: existing,
        resolution: BusinessCardResolutionValue.EXISTING,
      };
    }

    const created = await this.client.company.create({
      data: {
        userId: input.userId,
        companyName: input.companyName,
        companyFieldId: input.companyFieldId,
        companyRegionId: input.companyRegionId,
      },
      select: {
        id: true,
        companyName: true,
      },
    });

    return {
      company: created,
      resolution: BusinessCardResolutionValue.CREATED,
    };
  }

  private async findOrCreateContact(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly username: string;
    readonly mobile: string;
    readonly email: string;
    readonly contactDepartmentId: string;
    readonly contactJobGradeId: string;
  }): Promise<{
    readonly contact: { readonly id: string; readonly username: string };
    readonly resolution: BusinessCardResolutionValue;
  }> {
    const existing = await this.client.contact.findFirst({
      where: {
        userId: input.userId,
        companyId: input.companyId,
        deletedAt: null,
        OR: [{ mobile: input.mobile }, { email: input.email }],
      },
      select: {
        id: true,
        username: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (existing) {
      return {
        contact: existing,
        resolution: BusinessCardResolutionValue.EXISTING,
      };
    }

    const created = await this.client.contact.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        username: input.username,
        mobile: input.mobile,
        email: input.email,
        contactDepartmentId: input.contactDepartmentId,
        contactJobGradeId: input.contactJobGradeId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return {
      contact: created,
      resolution: BusinessCardResolutionValue.CREATED,
    };
  }

  private mapScanLog(row: BusinessCardScanLogRow): BusinessCardScanLogRecord {
    return {
      id: row.id,
      userId: row.userId,
      status: row.status as BusinessCardScanStatusValue,
      companyName: row.companyName,
      companyFieldName: row.companyFieldName,
      companyRegionName: row.companyRegionName,
      contactName: row.contactName,
      contactMobile: row.contactMobile,
      contactEmail: row.contactEmail,
      contactDepartmentName: row.contactDepartmentName,
      contactJobGradeName: row.contactJobGradeName,
      companyId: row.companyId,
      contactId: row.contactId,
      companyResolution: row.companyResolution as BusinessCardResolutionValue | null,
      contactResolution: row.contactResolution as BusinessCardResolutionValue | null,
      aiProvider: row.aiProvider,
      aiModel: row.aiModel,
      promptSnapshot: row.promptSnapshot,
      requestToken: row.requestToken,
      responseToken: row.responseToken,
      totalToken: row.totalToken,
      requestCost: row.requestCost,
      responseCost: row.responseCost,
      totalCost: row.totalCost,
      costCurrency: row.costCurrency,
      pendingTimeMs: row.pendingTimeMs,
      confirmedAt: row.confirmedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
