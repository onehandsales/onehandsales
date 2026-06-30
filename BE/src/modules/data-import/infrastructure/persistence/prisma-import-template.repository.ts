import { Prisma } from "@prisma/client";
import type {
  ConfirmImportInput,
  FindImportUserLogInput,
  ImportTemplateRecord,
  ImportTemplateRepository,
  ImportTemplateType,
  ImportUserLogPageRecord,
  ImportUserLogRecord,
  ListImportUserLogsInput,
} from "@/modules/data-import/application/ports/import-template.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const DEFAULT_COMPANY_FIELD_NAME = "미분류";
const DEFAULT_COMPANY_REGION_NAME = "미지정";

// 역할 : PrismaImportTemplateRepository 불러오기 양식 조회를 Prisma로 구현합니다.
export class PrismaImportTemplateRepository implements ImportTemplateRepository {
  // 기능 : Prisma 서비스를 주입받습니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 활성화된 불러오기 양식 목록을 조회합니다.
  async listActiveTemplates(): Promise<ImportTemplateRecord[]> {
    const templates = await this.prismaService.importTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ templateType: "asc" }, { templateVersion: "asc" }],
    });

    return templates.map((template) => ({
      id: template.id,
      templateType: template.templateType,
      templateVersion: template.templateVersion,
      templateName: template.templateName,
      columnsJson: template.columnsJson,
      sampleRowsJson: template.sampleRowsJson,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }

  // 기능 : 활성화된 불러오기 양식 단건을 조회합니다.
  async findActiveTemplateById(
    templateId: string
  ): Promise<ImportTemplateRecord | null> {
    const template = await this.prismaService.importTemplate.findFirst({
      where: {
        id: templateId,
        isActive: true,
      },
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      templateType: template.templateType,
      templateVersion: template.templateVersion,
      templateName: template.templateName,
      columnsJson: template.columnsJson,
      sampleRowsJson: template.sampleRowsJson,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // 기능 : 현재 사용자의 성공한 불러오기 로그 목록과 전체 개수를 조회합니다.
  // 기능 : 대상 유형 기준 활성 불러오기 양식 단건을 조회합니다.
  async findActiveTemplateByType(
    templateType: ImportTemplateType
  ): Promise<ImportTemplateRecord | null> {
    const template = await this.prismaService.importTemplate.findFirst({
      where: {
        templateType,
        isActive: true,
      },
      orderBy: [{ templateVersion: "desc" }, { createdAt: "desc" }],
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      templateType: template.templateType,
      templateVersion: template.templateVersion,
      templateName: template.templateName,
      columnsJson: template.columnsJson,
      sampleRowsJson: template.sampleRowsJson,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async listUserLogs(
    input: ListImportUserLogsInput
  ): Promise<ImportUserLogPageRecord> {
    const where = this.createImportUserLogWhere(input);

    const [items, totalCount] = await Promise.all([
      this.prismaService.importUserLog.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.importUserLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        targetType: item.targetType,
        templateVersion: item.templateVersion,
        contextLabel: item.contextLabel,
        originalFileName: item.originalFileName,
        fileSizeBytes: item.fileSizeBytes,
        totalRowCount: item.totalRowCount,
        importedRowCount: item.importedRowCount,
        createdAt: item.createdAt,
      })),
      totalCount,
    };
  }

  // 기능 : 현재 사용자의 성공한 불러오기 로그 상세를 조회합니다.
  async findUserLog(
    input: FindImportUserLogInput
  ): Promise<ImportUserLogRecord | null> {
    const item = await this.prismaService.importUserLog.findFirst({
      where: {
        id: input.importUserLogId,
        userId: input.userId,
      },
      include: {
        rows: {
          orderBy: [{ rowNumber: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      userId: item.userId,
      targetType: item.targetType,
      templateVersion: item.templateVersion,
      templateColumnsJson: item.templateColumnsJson,
      contextLabel: item.contextLabel,
      contextJson: item.contextJson,
      originalFileName: item.originalFileName,
      fileSizeBytes: item.fileSizeBytes,
      totalRowCount: item.totalRowCount,
      importedRowCount: item.importedRowCount,
      createdAt: item.createdAt,
      rows: item.rows.map((row) => ({
        id: row.id,
        rowNumber: row.rowNumber,
        submittedDataJson: row.submittedDataJson,
        targetLabel: row.targetLabel,
        createdAt: row.createdAt,
      })),
    };
  }

  // 기능 : 불러오기 로그 목록 조회에 사용할 Prisma where 조건을 생성합니다.
  // 기능 : 회사 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  async confirmCompanyImport(input: ConfirmImportInput): Promise<void> {
    await this.prismaService.$transaction(async (client) => {
      const log = await this.createImportUserLog(client, input);

      for (const row of input.rows) {
        const field = await this.upsertCompanyField(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "companyFieldName")
        );
        const region = await this.upsertCompanyRegion(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "companyRegionName")
        );
        const companyName = this.readRequiredString(
          row.submittedData,
          "companyName"
        );

        await client.company.create({
          data: {
            userId: input.userId,
            companyName,
            companyFieldId: field.id,
            companyRegionId: region.id,
          },
        });

        await this.createImportUserLogRow(client, log.id, row);
      }
    });
  }

  // 기능 : 담당자 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  async confirmContactImport(input: ConfirmImportInput): Promise<void> {
    await this.prismaService.$transaction(async (client) => {
      const log = await this.createImportUserLog(client, input);

      for (const row of input.rows) {
        const company = await this.findOrCreateCompanyByName(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "companyName")
        );
        const department = await this.upsertContactDepartment(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "contactDepartmentName")
        );
        const jobGrade = await this.upsertContactJobGrade(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "contactJobGradeName")
        );

        await client.contact.create({
          data: {
            userId: input.userId,
            companyId: company.id,
            username: this.readRequiredString(row.submittedData, "contactName"),
            mobile: this.readRequiredString(row.submittedData, "contactPhone"),
            email: this.readRequiredString(row.submittedData, "contactEmail"),
            contactDepartmentId: department.id,
            contactJobGradeId: jobGrade.id,
          },
        });

        await this.createImportUserLogRow(client, log.id, row);
      }
    });
  }

  // 기능 : 제품 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  async confirmProductImport(input: ConfirmImportInput): Promise<void> {
    await this.prismaService.$transaction(async (client) => {
      const log = await this.createImportUserLog(client, input);

      for (const row of input.rows) {
        const category = await this.upsertProductCategory(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "productCategoryName")
        );
        const status = await this.upsertProductStatus(
          client,
          input.userId,
          this.readRequiredString(row.submittedData, "productStatusName")
        );

        await client.product.create({
          data: {
            userId: input.userId,
            productName: this.readRequiredString(row.submittedData, "productName"),
            productPrice: this.readRequiredNumber(
              row.submittedData,
              "productPrice"
            ),
            productCategoryId: category.id,
            productStatusId: status.id,
          },
        });

        await this.createImportUserLogRow(client, log.id, row);
      }
    });
  }

  private async createImportUserLog(
    client: Prisma.TransactionClient,
    input: ConfirmImportInput
  ) {
    return client.importUserLog.create({
      data: {
        userId: input.userId,
        targetType: input.targetType,
        templateVersion: input.templateVersion,
        templateColumnsJson: this.toJsonValue(input.templateColumnsJson),
        contextLabel: input.contextLabel,
        contextJson:
          input.contextJson === null
            ? Prisma.JsonNull
            : this.toJsonValue(input.contextJson),
        originalFileName: input.originalFileName,
        fileSizeBytes: input.fileSizeBytes,
        totalRowCount: input.rows.length,
        importedRowCount: input.rows.length,
      },
      select: {
        id: true,
      },
    });
  }

  private async createImportUserLogRow(
    client: Prisma.TransactionClient,
    importUserLogId: string,
    row: ConfirmImportInput["rows"][number]
  ): Promise<void> {
    await client.importUserLogRow.create({
      data: {
        importUserLogId,
        rowNumber: row.rowNumber,
        submittedDataJson: this.toJsonValue(row.submittedData),
        targetLabel: row.targetLabel,
      },
    });
  }

  private async findOrCreateCompanyByName(
    client: Prisma.TransactionClient,
    userId: string,
    companyName: string
  ): Promise<{ readonly id: string; readonly companyName: string }> {
    const existing = await client.company.findFirst({
      where: {
        userId,
        companyName,
        deletedAt: null,
      },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (existing) {
      return existing;
    }

    const field = await this.upsertCompanyField(
      client,
      userId,
      DEFAULT_COMPANY_FIELD_NAME
    );
    const region = await this.upsertCompanyRegion(
      client,
      userId,
      DEFAULT_COMPANY_REGION_NAME
    );

    return client.company.create({
      data: {
        userId,
        companyName,
        companyFieldId: field.id,
        companyRegionId: region.id,
      },
      select: {
        id: true,
        companyName: true,
      },
    });
  }

  private async upsertCompanyField(
    client: Prisma.TransactionClient,
    userId: string,
    field: string
  ) {
    return client.companyField.upsert({
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

  private async upsertCompanyRegion(
    client: Prisma.TransactionClient,
    userId: string,
    region: string
  ) {
    return client.companyRegion.upsert({
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
    client: Prisma.TransactionClient,
    userId: string,
    departmentName: string
  ) {
    return client.contactDepartment.upsert({
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

  private async upsertContactJobGrade(
    client: Prisma.TransactionClient,
    userId: string,
    jobGradeName: string
  ) {
    return client.contactJobGrade.upsert({
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

  private async upsertProductCategory(
    client: Prisma.TransactionClient,
    userId: string,
    categoryName: string
  ) {
    return client.productCategory.upsert({
      where: {
        userId_categoryName: {
          userId,
          categoryName,
        },
      },
      create: {
        userId,
        categoryName,
      },
      update: {},
      select: {
        id: true,
        categoryName: true,
      },
    });
  }

  private async upsertProductStatus(
    client: Prisma.TransactionClient,
    userId: string,
    statusName: string
  ) {
    return client.productStatus.upsert({
      where: {
        userId_statusName: {
          userId,
          statusName,
        },
      },
      create: {
        userId,
        statusName,
      },
      update: {},
      select: {
        id: true,
        statusName: true,
      },
    });
  }

  private readRequiredString(
    data: Readonly<Record<string, string | number | boolean | null>>,
    key: string
  ): string {
    const value = data[key];
    const normalized = typeof value === "number" ? String(value) : value;

    if (typeof normalized !== "string" || normalized.trim().length === 0) {
      throw new Error(`${key} is required`);
    }

    return normalized.trim();
  }

  private readRequiredNumber(
    data: Readonly<Record<string, string | number | boolean | null>>,
    key: string
  ): number {
    const value = data[key];
    const numberValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.replaceAll(",", "").trim())
          : Number.NaN;

    if (!Number.isInteger(numberValue) || numberValue < 0) {
      throw new Error(`${key} must be an integer >= 0`);
    }

    return numberValue;
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private createImportUserLogWhere(
    input: ListImportUserLogsInput
  ): Prisma.ImportUserLogWhereInput {
    const targetTypes = input.targetTypes ?? [];

    return {
      userId: input.userId,
      ...(targetTypes.length > 0
        ? { targetType: { in: [...targetTypes] } }
        : {}),
    };
  }
}
