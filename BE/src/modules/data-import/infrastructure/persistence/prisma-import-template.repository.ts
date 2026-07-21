import { Prisma } from "@prisma/client";
import type {
  ConfirmContactCompanyResolutionInput,
  ConfirmDealContactResolutionInput,
  ConfirmDealProductResolutionInput,
  ConfirmImportInput,
  ConfirmImportResult,
  FindImportUserLogInput,
  ImportTemplateRecord,
  ImportTemplateRepository,
  ImportTemplateType,
  ImportUserLogPageRecord,
  ImportUserLogRecord,
  ListImportUserLogsInput,
} from "@/modules/data-import/application/ports/import-template.repository";
import {
  DEAL_STATUS_CODES,
  DealStatusCode,
  getDealStatusLabel,
} from "@/modules/deal/domain/deal-status";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const DEFAULT_IMPORT_DEAL_STATUS = DealStatusCode.INITIAL_CONTACT;
const DEAL_STATUS_LABEL_TO_CODE = new Map(
  DEAL_STATUS_CODES.map((status) => [getDealStatusLabel(status), status])
);

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
  async confirmCompanyImport(input: ConfirmImportInput): Promise<ConfirmImportResult> {
    return this.prismaService.$transaction(async (client) => {
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

      await this.completePersistentImportJob(client, input, log.id);

      return {
        importUserLogId: log.id,
        importedRowCount: input.rows.length,
      };
    });
  }

  // 기능 : 담당자 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  async confirmContactImport(input: ConfirmImportInput): Promise<ConfirmImportResult> {
    return this.prismaService.$transaction(async (client) => {
      const log = await this.createImportUserLog(client, input);
      const companyResolutionMap = this.createContactCompanyResolutionMap(
        input.contactCompanyResolutions ?? []
      );

      for (const row of input.rows) {
        const companyName = this.readRequiredString(
          row.submittedData,
          "companyName"
        );
        const company = await this.findOrCreateCompanyByName(
          client,
          input.userId,
          companyName,
          companyResolutionMap.get(companyName)
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

      await this.completePersistentImportJob(client, input, log.id);

      return {
        importUserLogId: log.id,
        importedRowCount: input.rows.length,
      };
    });
  }

  // 기능 : 제품 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  async confirmProductImport(input: ConfirmImportInput): Promise<ConfirmImportResult> {
    return this.prismaService.$transaction(async (client) => {
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

      await this.completePersistentImportJob(client, input, log.id);

      return {
        importUserLogId: log.id,
        importedRowCount: input.rows.length,
      };
    });
  }

  async confirmDealImport(input: ConfirmImportInput): Promise<ConfirmImportResult> {
    return this.prismaService.$transaction(async (client) => {
      const log = await this.createImportUserLog(client, input);
      const companyResolutionMap = this.createContactCompanyResolutionMap(
        input.dealCompanyResolutions ?? []
      );
      const contactResolutionMap = this.createDealContactResolutionMap(
        input.dealContactResolutions ?? []
      );
      const productResolutionMap = this.createDealProductResolutionMap(
        input.dealProductResolutions ?? []
      );

      for (const row of input.rows) {
        const dealName = this.readRequiredString(row.submittedData, "dealName");
        const dealCost = this.readRequiredNumber(row.submittedData, "dealCost");
        const dealStatus = this.readDealStatus(row.submittedData, row.rowNumber);
        const companyName = this.readRequiredString(
          row.submittedData,
          "companyName"
        );
        const contactName = this.readRequiredString(
          row.submittedData,
          "contactName"
        );
        const productName = this.readRequiredString(
          row.submittedData,
          "productName"
        );
        const expectedEndDate = this.readRequiredDateOnly(
          row.submittedData,
          "expectedEndDate",
          row.rowNumber
        );
        const company = await this.findOrCreateCompanyByName(
          client,
          input.userId,
          companyName,
          companyResolutionMap.get(companyName)
        );
        const contact = await this.findOrCreateDealContact(
          client,
          input.userId,
          contactName,
          company.id,
          company.companyName,
          contactResolutionMap.get(
            this.createDealContactResolutionKey(companyName, contactName)
          ),
          row.rowNumber
        );
        const product = await this.findOrCreateDealProduct(
          client,
          input.userId,
          productName,
          productResolutionMap.get(productName),
          row.rowNumber
        );
        const deal = await client.deal.create({
          data: {
            userId: input.userId,
            dealName,
            dealCost,
            dealStatus,
            expectedEndDate,
          },
          select: {
            id: true,
          },
        });

        await client.dealCompany.create({
          data: {
            userId: input.userId,
            dealId: deal.id,
            companyId: company.id,
          },
        });
        await client.dealContact.create({
          data: {
            userId: input.userId,
            dealId: deal.id,
            contactId: contact.id,
          },
        });
        await client.dealProduct.create({
          data: {
            userId: input.userId,
            dealId: deal.id,
            productId: product.id,
          },
        });

        await this.createImportUserLogRow(client, log.id, row);
      }

      await this.completePersistentImportJob(client, input, log.id);

      return {
        importUserLogId: log.id,
        importedRowCount: input.rows.length,
      };
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

  private async completePersistentImportJob(
    client: Prisma.TransactionClient,
    input: ConfirmImportInput,
    importUserLogId: string
  ): Promise<void> {
    if (!input.importJobId) {
      return;
    }

    await client.importJobRow.updateMany({
      where: {
        importJobId: input.importJobId,
        userId: input.userId,
        status: "VALID",
      },
      data: {
        status: "IMPORTED",
      },
    });

    await client.importJob.updateMany({
      where: {
        id: input.importJobId,
        userId: input.userId,
      },
      data: {
        status: "CONFIRMED",
        importedRowCount: input.rows.length,
        failedRowCount: 0,
        importUserLogId,
        confirmedAt: new Date(),
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

  private createContactCompanyResolutionMap(
    resolutions: readonly ConfirmContactCompanyResolutionInput[]
  ): ReadonlyMap<string, ConfirmContactCompanyResolutionInput> {
    const resolutionMap = new Map<string, ConfirmContactCompanyResolutionInput>();

    for (const resolution of resolutions) {
      const companyName = this.normalizeRequiredResolutionText(
        resolution.companyName,
        "새 회사명이 올바르지 않습니다."
      );
      const companyFieldName = this.normalizeRequiredResolutionText(
        resolution.companyFieldName,
        `${companyName}의 회사 분야를 입력해 주세요.`
      );
      const companyRegionName = this.normalizeRequiredResolutionText(
        resolution.companyRegionName,
        `${companyName}의 회사 지역을 입력해 주세요.`
      );

      if (resolutionMap.has(companyName)) {
        throw new ValidationDomainError(
          "새 회사 정보에 중복된 회사명이 있습니다."
        );
      }

      resolutionMap.set(companyName, {
        companyName,
        companyFieldName,
        companyRegionName,
      });
    }

    return resolutionMap;
  }

  private createDealContactResolutionMap(
    resolutions: readonly ConfirmDealContactResolutionInput[]
  ): ReadonlyMap<string, ConfirmDealContactResolutionInput> {
    const resolutionMap = new Map<string, ConfirmDealContactResolutionInput>();

    for (const resolution of resolutions) {
      const companyName = this.normalizeRequiredResolutionText(
        resolution.companyName,
        "새 담당자의 회사명이 올바르지 않습니다."
      );
      const contactName = this.normalizeRequiredResolutionText(
        resolution.contactName,
        `${companyName}의 새 담당자명이 올바르지 않습니다.`
      );
      const contactEmail = this.normalizeRequiredResolutionText(
        resolution.contactEmail,
        `${companyName} ${contactName} 담당자 이메일을 입력해 주세요.`
      );
      const contactPhone = this.normalizeRequiredResolutionText(
        resolution.contactPhone,
        `${companyName} ${contactName} 담당자 핸드폰 번호를 입력해 주세요.`
      );
      const contactDepartmentName = this.normalizeRequiredResolutionText(
        resolution.contactDepartmentName,
        `${companyName} ${contactName} 담당자 부서를 입력해 주세요.`
      );
      const contactJobGradeName = this.normalizeRequiredResolutionText(
        resolution.contactJobGradeName,
        `${companyName} ${contactName} 담당자 직급을 입력해 주세요.`
      );
      const resolutionKey = this.createDealContactResolutionKey(
        companyName,
        contactName
      );

      if (resolutionMap.has(resolutionKey)) {
        throw new ValidationDomainError(
          "새 담당자 정보에 중복된 회사명과 담당자명이 있습니다."
        );
      }

      resolutionMap.set(resolutionKey, {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        contactDepartmentName,
        contactJobGradeName,
      });
    }

    return resolutionMap;
  }

  private createDealProductResolutionMap(
    resolutions: readonly ConfirmDealProductResolutionInput[]
  ): ReadonlyMap<string, ConfirmDealProductResolutionInput> {
    const resolutionMap = new Map<string, ConfirmDealProductResolutionInput>();

    for (const resolution of resolutions) {
      const productName = this.normalizeRequiredResolutionText(
        resolution.productName,
        "새 제품명이 올바르지 않습니다."
      );
      const productCategoryName = this.normalizeRequiredResolutionText(
        resolution.productCategoryName,
        `${productName} 제품 카테고리를 입력해 주세요.`
      );
      const productStatusName = this.normalizeRequiredResolutionText(
        resolution.productStatusName,
        `${productName} 제품 상태를 입력해 주세요.`
      );

      if (!Number.isInteger(resolution.productPrice) || resolution.productPrice < 0) {
        throw new ValidationDomainError(
          `${productName} 제품 가격은 0 이상의 정수여야 합니다.`
        );
      }

      if (resolutionMap.has(productName)) {
        throw new ValidationDomainError("새 제품 정보에 중복된 제품명이 있습니다.");
      }

      resolutionMap.set(productName, {
        productName,
        productPrice: resolution.productPrice,
        productCategoryName,
        productStatusName,
      });
    }

    return resolutionMap;
  }

  private async findOrCreateCompanyByName(
    client: Prisma.TransactionClient,
    userId: string,
    companyName: string,
    resolution: ConfirmContactCompanyResolutionInput | undefined
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

    if (!resolution) {
      throw new ValidationDomainError(
        `${companyName}의 회사 분야와 회사 지역을 입력해 주세요.`
      );
    }

    const field = await this.upsertCompanyField(
      client,
      userId,
      resolution.companyFieldName
    );
    const region = await this.upsertCompanyRegion(
      client,
      userId,
      resolution.companyRegionName
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

  private normalizeRequiredResolutionText(value: string, message: string): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(message);
    }

    return normalized;
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

  private async findRequiredDealCompany(
    client: Prisma.TransactionClient,
    userId: string,
    companyName: string,
    rowNumber: number
  ): Promise<{ readonly id: string; readonly companyName: string }> {
    const company = await client.company.findFirst({
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

    if (!company) {
      throw new ValidationDomainError(
        `${rowNumber}행의 회사명 '${companyName}'을 찾을 수 없습니다.`
      );
    }

    return company;
  }

  private async findOrCreateDealContact(
    client: Prisma.TransactionClient,
    userId: string,
    contactName: string,
    companyId: string,
    companyName: string,
    resolution: ConfirmDealContactResolutionInput | undefined,
    rowNumber: number
  ): Promise<{ readonly id: string }> {
    const contact = await client.contact.findFirst({
      where: {
        userId,
        username: contactName,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (contact) {
      return contact;
    }

    if (!resolution) {
      throw new ValidationDomainError(
        `${rowNumber}행의 담당자명 '${contactName}'을 ${companyName} 회사에서 찾을 수 없습니다.`
      );
    }

    const department = await this.upsertContactDepartment(
      client,
      userId,
      resolution.contactDepartmentName
    );
    const jobGrade = await this.upsertContactJobGrade(
      client,
      userId,
      resolution.contactJobGradeName
    );

    return client.contact.create({
      data: {
        userId,
        companyId,
        username: contactName,
        email: resolution.contactEmail,
        mobile: resolution.contactPhone,
        contactDepartmentId: department.id,
        contactJobGradeId: jobGrade.id,
      },
      select: {
        id: true,
      },
    });
  }

  private async findRequiredDealContact(
    client: Prisma.TransactionClient,
    userId: string,
    contactName: string,
    companyId: string,
    companyName: string,
    rowNumber: number
  ): Promise<{ readonly id: string }> {
    const contact = await client.contact.findFirst({
      where: {
        userId,
        username: contactName,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (!contact) {
      throw new ValidationDomainError(
        `${rowNumber}행의 담당자명 '${contactName}'을 ${companyName} 회사에서 찾을 수 없습니다.`
      );
    }

    return contact;
  }

  private async findOrCreateDealProduct(
    client: Prisma.TransactionClient,
    userId: string,
    productName: string,
    resolution: ConfirmDealProductResolutionInput | undefined,
    rowNumber: number
  ): Promise<{ readonly id: string }> {
    const product = await client.product.findFirst({
      where: {
        userId,
        productName,
        deletedAt: null,
      },
      select: {
        id: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (product) {
      return product;
    }

    if (!resolution) {
      throw new ValidationDomainError(
        `${rowNumber}행의 제품명 '${productName}'을 찾을 수 없습니다.`
      );
    }

    const category = await this.upsertProductCategory(
      client,
      userId,
      resolution.productCategoryName
    );
    const status = await this.upsertProductStatus(
      client,
      userId,
      resolution.productStatusName
    );

    return client.product.create({
      data: {
        userId,
        productName,
        productPrice: resolution.productPrice,
        productCategoryId: category.id,
        productStatusId: status.id,
      },
      select: {
        id: true,
      },
    });
  }

  private async findRequiredDealProduct(
    client: Prisma.TransactionClient,
    userId: string,
    productName: string,
    rowNumber: number
  ): Promise<{ readonly id: string }> {
    const product = await client.product.findFirst({
      where: {
        userId,
        productName,
        deletedAt: null,
      },
      select: {
        id: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (!product) {
      throw new ValidationDomainError(
        `${rowNumber}행의 제품명 '${productName}'을 찾을 수 없습니다.`
      );
    }

    return product;
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

  private readRequiredDateOnly(
    data: Readonly<Record<string, string | number | boolean | null>>,
    key: string,
    rowNumber: number
  ): Date {
    const textValue = this.readRequiredString(data, key);
    const normalized =
      /^\d{4}-\d{2}-\d{2}T/.test(textValue) ? textValue.slice(0, 10) : textValue;
    const parts = normalized.split("-");

    if (parts.length !== 3) {
      throw new ValidationDomainError(
        `${rowNumber}행의 예상 마감일은 YYYY-MM-DD 형식이어야 합니다.`
      );
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      throw new ValidationDomainError(
        `${rowNumber}행의 예상 마감일은 YYYY-MM-DD 형식이어야 합니다.`
      );
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new ValidationDomainError(
        `${rowNumber}행의 예상 마감일이 올바르지 않습니다.`
      );
    }

    return date;
  }

  private readDealStatus(
    data: Readonly<Record<string, string | number | boolean | null>>,
    rowNumber: number
  ): DealStatusCode {
    const statusText = this.readOptionalString(data, "dealStatus");

    if (!statusText) {
      return DEFAULT_IMPORT_DEAL_STATUS;
    }

    if (this.isDealStatusCode(statusText)) {
      return statusText;
    }

    const statusCode = DEAL_STATUS_LABEL_TO_CODE.get(statusText);

    if (!statusCode) {
      throw new ValidationDomainError(
        `${rowNumber}행의 딜 단계는 ${[...DEAL_STATUS_LABEL_TO_CODE.keys()].join(", ")} 중 하나여야 합니다.`
      );
    }

    return statusCode;
  }

  private readOptionalString(
    data: Readonly<Record<string, string | number | boolean | null>>,
    key: string
  ): string | null {
    const value = data[key];
    const normalized = typeof value === "number" ? String(value) : value;

    if (typeof normalized !== "string") {
      return null;
    }

    const trimmed = normalized.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private isDealStatusCode(value: string): value is DealStatusCode {
    return DEAL_STATUS_CODES.some((status) => status === value);
  }

  private createDealContactResolutionKey(
    companyName: string,
    contactName: string
  ): string {
    return `${companyName}\u0000${contactName}`;
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
