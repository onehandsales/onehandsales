import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_FILE_PARSER,
  type ImportFileParser,
  type ImportUploadedFile,
} from "@/modules/data-import/application/ports/import-file-parser.port";
import {
  IMPORT_JOB_STORE,
  type ImportFieldValue,
  type ImportJobError,
  type ImportJobStore,
  type ImportMappedRowData,
  type ImportMapping,
  type ImportMappingSuggestion,
  type StoredImportJob,
  type StoredImportJobRow,
} from "@/modules/data-import/application/ports/import-job.store";
import {
  IMPORT_MAPPING_PROVIDER,
  type ImportMappingProvider,
  type ImportMappingTargetField,
} from "@/modules/data-import/application/ports/import-mapping.provider";
import {
  IMPORT_TEMPLATE_REPOSITORY,
  type ImportTemplateRecord,
  type ImportTemplateRepository,
  type ImportTemplateType,
  type ImportUserLogListRecord,
} from "@/modules/data-import/application/ports/import-template.repository";
import {
  ImportJobNotFoundError,
  ImportTemplateNotFoundError,
  ImportTemplateSchemaInvalidError,
  ImportUserLogNotFoundError,
} from "@/modules/data-import/domain/import-template.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  type ExportedXlsxFileResponse,
  XLSX_CONTENT_TYPE,
} from "@/shared/application/export/xlsx-export-file";
import {
  XLSX_WORKBOOK_WRITER,
  type XlsxCellValue,
  type XlsxColumnDefinition,
  type XlsxRow,
  type XlsxWorkbookWriter,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const TEMPLATE_TYPE_ORDER: readonly ImportTemplateType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
];
const IMPORT_USER_LOG_PAGE_SIZE = 10;
const MOBILE_PATTERN = /^010-\d{4}-\d{4}$/;
const MOBILE_DIGIT_PATTERN = /^010\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  companyName: ["회사명", "회사이름", "company", "companyName"],
  companyFieldName: ["회사분야", "분야", "업종", "industry", "field"],
  companyRegionName: ["회사지역", "지역", "region", "location"],
  productName: ["제품명", "제품이름", "product", "productName"],
  productPrice: ["제품단가", "단가", "가격", "price", "unitPrice"],
  productCategoryName: ["제품카테고리", "카테고리", "category"],
  productStatusName: ["제품상태", "상태", "status"],
  companyNameForContact: ["회사명", "회사이름", "company", "companyName"],
  contactName: ["담당자명", "담당자이름", "이름", "name"],
  contactEmail: ["담당자이메일", "이메일", "email"],
  contactPhone: [
    "담당자핸드폰번호",
    "담당자휴대폰",
    "핸드폰번호",
    "휴대폰",
    "전화번호",
    "phone",
    "mobile",
  ],
  contactDepartmentName: ["담당자부서", "부서", "department"],
  contactJobGradeName: ["담당자직급", "직급", "직책", "position", "title", "rank"],
};

// 역할 : ImportTemplateColumnType 불러오기 양식 컬럼 값 타입을 정의합니다.
export type ImportTemplateColumnType = "text" | "number" | "email" | "phone";

// 역할 : ImportTemplateColumn 불러오기 양식 컬럼 정의를 표현합니다.
export interface ImportTemplateColumn {
  readonly key: string;
  readonly label: string;
  readonly required: boolean;
  readonly type: ImportTemplateColumnType;
  readonly description?: string;
}

// 역할 : ImportTemplateSampleRow 불러오기 양식 예시 행을 표현합니다.
export type ImportTemplateSampleRow = Readonly<
  Record<string, string | number | null>
>;

export type ImportSubmittedDataValue = string | number | boolean | null;
export type ImportSubmittedData = Readonly<Record<string, ImportSubmittedDataValue>>;

// 역할 : ImportTemplateListResponse 활성 불러오기 양식 목록 응답을 정의합니다.
export interface ImportTemplateListResponse {
  readonly items: ImportTemplateItemResponse[];
}

// 역할 : ImportTemplateItemResponse 불러오기 양식 목록 항목을 정의합니다.
export interface ImportTemplateItemResponse {
  readonly id: string;
  readonly templateType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateName: string;
  readonly columns: ImportTemplateColumn[];
  readonly sampleRows: ImportTemplateSampleRow[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : DownloadImportTemplateInput 양식 다운로드 요청 값을 정의합니다.
export interface DownloadImportTemplateInput {
  readonly templateId: string;
  readonly companyName?: string;
}

// 역할 : CreateImportJobInput 불러오기 임시 job 생성 요청 값을 정의합니다.
export interface CreateImportJobInput {
  readonly targetType: ImportTemplateType;
  readonly file: ImportUploadedFile;
}

// 역할 : UpdateImportMappingInput 불러오기 컬럼 매핑 수정 요청 값을 정의합니다.
export interface UpdateImportMappingInput {
  readonly mapping: ImportMapping;
}

// 역할 : ConfirmImportJobRowInput 확정 요청 row 값을 정의합니다.
export interface ConfirmImportJobRowInput {
  readonly rowNumber: number;
  readonly data: Readonly<Record<string, unknown>>;
}

// 역할 : ConfirmImportJobInput 불러오기 확정 요청 값을 정의합니다.
export interface ConfirmImportJobInput {
  readonly rows?: readonly ConfirmImportJobRowInput[];
}

// 역할 : ImportJobRowResponse 임시 불러오기 job row 응답을 정의합니다.
export interface ImportJobRowResponse {
  readonly id: string;
  readonly rowNumber: number;
  readonly rawData: Readonly<Record<string, string>>;
  readonly mappedData: ImportMappedRowData | null;
  readonly status: "PENDING" | "VALID" | "VALIDATION_FAILED";
  readonly errorMessage: string | null;
  readonly targetId: string | null;
}

// 역할 : ImportJobResponse 임시 불러오기 job 응답을 정의합니다.
export interface ImportJobResponse {
  readonly id: string;
  readonly targetType: ImportTemplateType;
  readonly status: StoredImportJob["status"];
  readonly rowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly mapping: ImportMapping | null;
  readonly aiMapping: ImportMappingSuggestion | null;
  readonly previewRows: ImportJobRowResponse[];
  readonly errors: readonly ImportJobError[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : ImportJobDetailResponse 임시 불러오기 job 상세 응답을 정의합니다.
export interface ImportJobDetailResponse {
  readonly job: ImportJobResponse;
  readonly rows: ImportJobRowResponse[];
  readonly errors: readonly ImportJobError[];
}

// 역할 : ImportJobResultResponse 불러오기 확정 결과 응답을 정의합니다.
export interface ImportJobResultResponse {
  readonly id: string;
  readonly status: "COMPLETED";
  readonly successCount: number;
  readonly failedCount: number;
  readonly errors: readonly ImportJobError[];
}

// 역할 : ImportUserLogListQueryInput 불러오기 내역 목록 query 조건을 정의합니다.
export interface ImportUserLogListQueryInput {
  readonly page?: number;
  readonly targetType?: ImportTemplateType;
  readonly targetTypes?: readonly ImportTemplateType[];
}

// 역할 : ImportUserLogPageResponse 불러오기 내역 목록 응답을 정의합니다.
export interface ImportUserLogPageResponse {
  readonly items: ImportUserLogListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : ImportUserLogListItemResponse 불러오기 내역 목록 항목 응답을 정의합니다.
export interface ImportUserLogListItemResponse {
  readonly id: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly contextLabel: string | null;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly importedRowCount: number;
  readonly createdAt: string;
}

// 역할 : ImportUserLogDetailResponse 불러오기 내역 상세 응답을 정의합니다.
export interface ImportUserLogDetailResponse extends ImportUserLogListItemResponse {
  readonly templateColumns: ImportTemplateColumn[];
  readonly context: ImportSubmittedData | null;
  readonly rows: ImportUserLogRowResponse[];
}

// 역할 : ImportUserLogRowResponse 불러오기 내역 row 응답을 정의합니다.
export interface ImportUserLogRowResponse {
  readonly id: string;
  readonly rowNumber: number;
  readonly submittedData: ImportSubmittedData;
  readonly targetLabel: string;
  readonly createdAt: string;
}

interface ConfirmReadyRow {
  readonly rowNumber: number;
  readonly submittedData: ImportSubmittedData;
  readonly targetLabel: string;
}

interface NormalizedRowValidation {
  readonly rows: readonly StoredImportJobRow[];
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly errors: readonly ImportJobError[];
}

interface NormalizedFieldValue {
  readonly value: ImportFieldValue;
  readonly errorMessage: string | null;
}

// 역할 : DataImportApplicationService 데이터 불러오기 application 기능을 제공합니다.
@Injectable()
export class DataImportApplicationService {
  // 기능 : 불러오기 양식 저장소와 job 저장소, 파일 파서, 매핑 provider, xlsx writer를 주입받습니다.
  constructor(
    @Inject(IMPORT_TEMPLATE_REPOSITORY)
    private readonly importTemplateRepository: ImportTemplateRepository,
    @Inject(IMPORT_JOB_STORE)
    private readonly importJobStore: ImportJobStore,
    @Inject(IMPORT_FILE_PARSER)
    private readonly importFileParser: ImportFileParser,
    @Inject(IMPORT_MAPPING_PROVIDER)
    private readonly importMappingProvider: ImportMappingProvider,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter
  ) {}

  // 기능 : 활성화된 데이터 불러오기 양식 목록을 조회합니다.
  async listActiveTemplates(): Promise<ImportTemplateListResponse> {
    const templates = await this.importTemplateRepository.listActiveTemplates();

    return {
      items: [...templates]
        .sort((left, right) => this.compareTemplates(left, right))
        .map((template) => this.toTemplateItem(template)),
    };
  }

  // 기능 : 선택한 데이터 불러오기 양식을 xlsx 파일로 생성합니다.
  async downloadImportTemplate(
    input: DownloadImportTemplateInput
  ): Promise<ExportedXlsxFileResponse> {
    const template =
      await this.importTemplateRepository.findActiveTemplateById(input.templateId);

    if (!template) {
      throw new ImportTemplateNotFoundError();
    }

    const columns = this.normalizeColumns(template.columnsJson);
    const rows = this.applyTemplateContext(
      template.templateType,
      this.normalizeXlsxRows(template.sampleRowsJson),
      input
    );

    const content = await this.xlsxWriter.writeWorksheet({
      sheetName: this.getSheetName(template.templateType),
      columns: columns.map((column) => this.toXlsxColumn(column)),
      rows,
    });

    return {
      fileName: template.templateName,
      contentType: XLSX_CONTENT_TYPE,
      content,
    };
  }

  // 기능 : 업로드 파일을 파싱해 확정 전 임시 불러오기 job을 생성합니다.
  async createImportJob(
    currentUser: CurrentUserContext,
    input: CreateImportJobInput
  ): Promise<ImportJobResponse> {
    this.assertSupportedTargetType(input.targetType);

    const template =
      await this.importTemplateRepository.findActiveTemplateByType(input.targetType);

    if (!template) {
      throw new ImportTemplateNotFoundError();
    }

    const parsedFile = await this.importFileParser.parse(input.file);
    const now = new Date();
    const job: StoredImportJob = {
      id: randomUUID(),
      userId: currentUser.id,
      targetType: template.templateType,
      templateVersion: template.templateVersion,
      templateColumnsJson: template.columnsJson,
      originalFileName: input.file.originalname,
      fileSizeBytes: input.file.size,
      sourceColumns: parsedFile.sourceColumns,
      status: "PREVIEW_READY",
      rowCount: parsedFile.rows.length,
      validRowCount: 0,
      invalidRowCount: 0,
      mapping: null,
      aiMapping: null,
      rows: parsedFile.rows.map((row) => ({
        id: randomUUID(),
        rowNumber: row.rowNumber,
        rawData: row.rawData,
        mappedData: null,
        status: "PENDING",
        errorMessage: null,
      })),
      errors: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.importJobStore.save({ job });

    return this.toImportJobResponse(job);
  }

  // 기능 : 원본 컬럼을 대상 양식 컬럼으로 AI 매핑하고 실패 시 규칙 기반 매핑으로 대체합니다.
  async generateImportMapping(
    currentUser: CurrentUserContext,
    importJobId: string
  ): Promise<ImportMappingSuggestion> {
    const job = await this.getStoredImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const fallback = this.createHeuristicMapping(
      columns,
      job.sourceColumns,
      job.targetType
    );

    let suggestion = fallback;

    try {
      suggestion = this.normalizeMappingSuggestion(
        await this.importMappingProvider.generate({
          targetType: job.targetType,
          targetFields: columns.map((column) => this.toMappingTargetField(column)),
          sourceColumns: job.sourceColumns,
          sampleRows: job.rows.slice(0, 5).map((row) => row.rawData),
        }),
        fallback,
        columns,
        job.sourceColumns
      );
    } catch {
      suggestion = fallback;
    }

    const updatedJob: StoredImportJob = {
      ...job,
      mapping: suggestion.suggestedMapping,
      aiMapping: suggestion,
      status: "MAPPING_READY",
      updatedAt: new Date(),
    };

    await this.importJobStore.update({ job: updatedJob });

    return suggestion;
  }

  // 기능 : 사용자가 수정한 매핑을 적용해 모든 row의 생성 가능 여부를 검증합니다.
  async updateImportMapping(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: UpdateImportMappingInput
  ): Promise<ImportJobResponse> {
    const job = await this.getStoredImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const mapping = this.normalizeMapping(input.mapping, columns, job.sourceColumns);
    const validation = this.validateJobRows(job.rows, columns, mapping);
    const updatedJob: StoredImportJob = {
      ...job,
      mapping,
      rows: validation.rows,
      validRowCount: validation.validRowCount,
      invalidRowCount: validation.invalidRowCount,
      errors: validation.errors,
      status:
        validation.invalidRowCount > 0 ? "VALIDATION_FAILED" : "MAPPING_READY",
      updatedAt: new Date(),
    };

    await this.importJobStore.update({ job: updatedJob });

    return this.toImportJobResponse(updatedJob);
  }

  // 기능 : 확정 전 임시 불러오기 job 상세를 조회합니다.
  async getImportJob(
    currentUser: CurrentUserContext,
    importJobId: string
  ): Promise<ImportJobDetailResponse> {
    const job = await this.getStoredImportJob(currentUser, importJobId);

    return {
      job: this.toImportJobResponse(job),
      rows: job.rows.map((row) => this.toImportJobRowResponse(row)),
      errors: job.errors,
    };
  }

  // 기능 : 사용자가 최종 보정한 row를 실제 도메인 데이터로 생성하고 성공 로그를 저장합니다.
  async confirmImportJob(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: ConfirmImportJobInput
  ): Promise<ImportJobResultResponse> {
    const job = await this.getStoredImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const rows = this.normalizeConfirmRows(job, columns, input.rows);

    this.assertSupportedTargetType(job.targetType);

    const context = this.createImportContext(job.targetType, rows);
    const confirmInput = {
      userId: currentUser.id,
      targetType: job.targetType,
      templateVersion: job.templateVersion,
      templateColumnsJson: job.templateColumnsJson,
      contextLabel: context.label,
      contextJson: context.data,
      originalFileName: job.originalFileName,
      fileSizeBytes: job.fileSizeBytes,
      rows,
    };

    switch (job.targetType) {
      case "COMPANY":
        await this.importTemplateRepository.confirmCompanyImport(confirmInput);
        break;
      case "CONTACT":
        await this.importTemplateRepository.confirmContactImport(confirmInput);
        break;
      case "PRODUCT":
        await this.importTemplateRepository.confirmProductImport(confirmInput);
        break;
      case "DEAL":
        throw new ValidationDomainError("딜 불러오기는 아직 지원하지 않습니다.");
    }

    await this.importJobStore.delete({
      userId: currentUser.id,
      importJobId,
    });

    return {
      id: importJobId,
      status: "COMPLETED",
      successCount: rows.length,
      failedCount: 0,
      errors: [],
    };
  }

  // 기능 : 현재 사용자의 성공한 데이터 불러오기 내역 목록을 조회합니다.
  async listImportUserLogs(
    currentUser: CurrentUserContext,
    query: ImportUserLogListQueryInput
  ): Promise<ImportUserLogPageResponse> {
    const page = query.page ?? 1;
    const targetTypes = this.normalizeImportUserLogTargetTypes(query);
    const result = await this.importTemplateRepository.listUserLogs({
      userId: currentUser.id,
      page,
      pageSize: IMPORT_USER_LOG_PAGE_SIZE,
      ...(targetTypes.length > 0 ? { targetTypes } : {}),
    });

    return {
      items: result.items.map((item) => this.toImportUserLogListItem(item)),
      page,
      pageSize: IMPORT_USER_LOG_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / IMPORT_USER_LOG_PAGE_SIZE),
    };
  }

  // 기능 : 현재 사용자의 성공한 데이터 불러오기 내역 상세를 조회합니다.
  async getImportUserLog(
    currentUser: CurrentUserContext,
    importUserLogId: string
  ): Promise<ImportUserLogDetailResponse> {
    const log = await this.importTemplateRepository.findUserLog({
      userId: currentUser.id,
      importUserLogId,
    });

    if (!log) {
      throw new ImportUserLogNotFoundError();
    }

    return {
      ...this.toImportUserLogListItem(log),
      templateColumns: this.normalizeColumns(log.templateColumnsJson),
      context: this.normalizeOptionalSubmittedData(log.contextJson),
      rows: log.rows.map((row) => ({
        id: row.id,
        rowNumber: row.rowNumber,
        submittedData: this.normalizeSubmittedData(row.submittedDataJson),
        targetLabel: row.targetLabel,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  // 기능 : 양식 레코드를 API 응답 항목으로 변환합니다.
  private toTemplateItem(
    template: ImportTemplateRecord
  ): ImportTemplateItemResponse {
    return {
      id: template.id,
      templateType: template.templateType,
      templateVersion: template.templateVersion,
      templateName: template.templateName,
      columns: this.normalizeColumns(template.columnsJson),
      sampleRows: this.normalizeSampleRows(template.sampleRowsJson),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  // 기능 : 불러오기 로그 레코드를 목록 응답 항목으로 변환합니다.
  private toImportUserLogListItem(
    item: ImportUserLogListRecord
  ): ImportUserLogListItemResponse {
    return {
      id: item.id,
      targetType: item.targetType,
      templateVersion: item.templateVersion,
      contextLabel: item.contextLabel,
      originalFileName: item.originalFileName,
      fileSizeBytes: item.fileSizeBytes,
      totalRowCount: item.totalRowCount,
      importedRowCount: item.importedRowCount,
      createdAt: item.createdAt.toISOString(),
    };
  }

  // 기능 : 임시 job row를 API 응답 row로 변환합니다.
  private toImportJobRowResponse(row: StoredImportJobRow): ImportJobRowResponse {
    return {
      id: row.id,
      rowNumber: row.rowNumber,
      rawData: row.rawData,
      mappedData: row.mappedData,
      status: row.status,
      errorMessage: row.errorMessage,
      targetId: null,
    };
  }

  // 기능 : 임시 job을 API 응답으로 변환합니다.
  private toImportJobResponse(job: StoredImportJob): ImportJobResponse {
    return {
      id: job.id,
      targetType: job.targetType,
      status: job.status,
      rowCount: job.rowCount,
      validRowCount: job.validRowCount,
      invalidRowCount: job.invalidRowCount,
      mapping: job.mapping,
      aiMapping: job.aiMapping,
      previewRows: job.rows.map((row) => this.toImportJobRowResponse(row)),
      errors: job.errors,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  // 기능 : 현재 사용자 소유 임시 job을 조회합니다.
  private async getStoredImportJob(
    currentUser: CurrentUserContext,
    importJobId: string
  ): Promise<StoredImportJob> {
    const job = await this.importJobStore.findById({
      userId: currentUser.id,
      importJobId,
    });

    if (!job) {
      throw new ImportJobNotFoundError();
    }

    return job;
  }

  // 기능 : 양식 타입과 버전 기준으로 정렬 순서를 계산합니다.
  private compareTemplates(
    left: ImportTemplateRecord,
    right: ImportTemplateRecord
  ): number {
    const typeOrder =
      TEMPLATE_TYPE_ORDER.indexOf(left.templateType) -
      TEMPLATE_TYPE_ORDER.indexOf(right.templateType);

    if (typeOrder !== 0) {
      return typeOrder;
    }

    return left.templateVersion.localeCompare(right.templateVersion);
  }

  // 기능 : 저장된 컬럼 JSON을 검증된 컬럼 배열로 변환합니다.
  private normalizeColumns(value: unknown): ImportTemplateColumn[] {
    if (!Array.isArray(value)) {
      throw new ImportTemplateSchemaInvalidError();
    }

    const columns = value.map((item) => this.toTemplateColumn(item));

    if (columns.some((column) => column === null)) {
      throw new ImportTemplateSchemaInvalidError();
    }

    return columns.filter((column): column is ImportTemplateColumn => column !== null);
  }

  // 기능 : 단일 컬럼 JSON 값을 검증된 컬럼 정의로 변환합니다.
  private toTemplateColumn(value: unknown): ImportTemplateColumn | null {
    if (!isRecord(value)) {
      return null;
    }

    const key = getStringField(value, "key");
    const label = getStringField(value, "label");
    const required = value.required;
    const type = getStringField(value, "type");
    const description = getStringField(value, "description");

    if (
      !key ||
      !label ||
      typeof required !== "boolean" ||
      !this.isColumnType(type)
    ) {
      return null;
    }

    return {
      key,
      label,
      required,
      type,
      ...(description ? { description } : {}),
    };
  }

  // 기능 : 저장된 샘플 row JSON을 API 응답용 값으로 변환합니다.
  private normalizeSampleRows(value: unknown): ImportTemplateSampleRow[] {
    return this.normalizeXlsxRows(value).map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, rowValue]) => [
          key,
          this.toSampleRowValue(rowValue),
        ])
      )
    );
  }

  // 기능 : nullable JSON 값을 제출 데이터 snapshot으로 변환합니다.
  private normalizeOptionalSubmittedData(value: unknown): ImportSubmittedData | null {
    if (value === null || value === undefined) {
      return null;
    }

    return this.normalizeSubmittedData(value);
  }

  // 기능 : JSON 값을 제출 데이터 snapshot으로 변환합니다.
  private normalizeSubmittedData(value: unknown): ImportSubmittedData {
    if (!isRecord(value)) {
      throw new ImportTemplateSchemaInvalidError(
        "불러오기 내역 snapshot이 올바르지 않습니다."
      );
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, rowValue]) => [
        key,
        this.toSubmittedDataValue(rowValue),
      ])
    );
  }

  // 기능 : 저장된 샘플 row JSON을 xlsx writer 입력 row로 변환합니다.
  private normalizeXlsxRows(value: unknown): XlsxRow[] {
    if (!Array.isArray(value)) {
      throw new ImportTemplateSchemaInvalidError();
    }

    return value.map((row) => {
      if (!isRecord(row)) {
        throw new ImportTemplateSchemaInvalidError();
      }

      return Object.fromEntries(
        Object.entries(row).map(([key, rowValue]) => [
          key,
          this.toXlsxCellValue(rowValue),
        ])
      );
    });
  }

  // 기능 : 담당자 양식에 선택한 회사명을 주입합니다.
  private applyTemplateContext(
    templateType: ImportTemplateType,
    rows: XlsxRow[],
    input: DownloadImportTemplateInput
  ): XlsxRow[] {
    if (templateType !== "CONTACT") {
      return rows;
    }

    const companyName = this.normalizeRequiredText(
      input.companyName,
      "담당자 양식 다운로드에는 회사명이 필요합니다."
    );

    if (rows.length === 0) {
      return [{ companyName }];
    }

    return rows.map((row) => ({
      ...row,
      companyName,
    }));
  }

  // 기능 : 컬럼 정의를 xlsx writer 컬럼 정의로 변환합니다.
  private toXlsxColumn(column: ImportTemplateColumn): XlsxColumnDefinition {
    return {
      header: column.label,
      key: column.key,
      width: this.getColumnWidth(column),
      ...(column.type === "number" ? { numFmt: "#,##0" } : {}),
    };
  }

  // 기능 : 양식 타입에 맞는 워크시트 이름을 반환합니다.
  private getSheetName(templateType: ImportTemplateType): string {
    switch (templateType) {
      case "COMPANY":
        return "회사";
      case "CONTACT":
        return "담당자";
      case "PRODUCT":
        return "제품";
      case "DEAL":
        return "딜";
    }
  }

  // 기능 : 컬럼 타입과 라벨 길이에 맞는 엑셀 컬럼 폭을 계산합니다.
  private getColumnWidth(column: ImportTemplateColumn): number {
    if (column.type === "email") {
      return 28;
    }

    if (column.type === "phone") {
      return 20;
    }

    if (column.type === "number") {
      return 16;
    }

    return Math.max(14, column.label.length + 8);
  }

  private normalizeImportUserLogTargetTypes(
    query: ImportUserLogListQueryInput
  ): ImportTemplateType[] {
    return [
      ...new Set([
        ...(query.targetTypes ?? []),
        ...(query.targetType ? [query.targetType] : []),
      ]),
    ];
  }

  // 기능 : 대상 필드가 현재 지원되는 불러오기 타입인지 검증합니다.
  private assertSupportedTargetType(targetType: ImportTemplateType): void {
    if (targetType === "DEAL") {
      throw new ValidationDomainError("딜 불러오기는 아직 지원하지 않습니다.");
    }
  }

  // 기능 : 컬럼 정의를 AI 매핑 provider 입력 필드로 변환합니다.
  private toMappingTargetField(
    column: ImportTemplateColumn
  ): ImportMappingTargetField {
    return {
      key: column.key,
      label: column.label,
      required: column.required,
      type: column.type,
    };
  }

  // 기능 : AI 매핑 결과를 현재 job 컬럼과 원본 컬럼 기준으로 보정합니다.
  private normalizeMappingSuggestion(
    suggestion: ImportMappingSuggestion,
    fallback: ImportMappingSuggestion,
    columns: readonly ImportTemplateColumn[],
    sourceColumns: readonly string[]
  ): ImportMappingSuggestion {
    const sourceColumnSet = new Set(sourceColumns);
    const suggestedMapping: Record<string, string | null> = {};

    for (const column of columns) {
      const aiSource = suggestion.suggestedMapping[column.key] ?? null;
      const fallbackSource = fallback.suggestedMapping[column.key] ?? null;
      suggestedMapping[column.key] =
        aiSource && sourceColumnSet.has(aiSource)
          ? aiSource
          : fallbackSource && sourceColumnSet.has(fallbackSource)
            ? fallbackSource
            : null;
    }

    const mappedSources = new Set(
      Object.values(suggestedMapping).filter(
        (sourceColumn): sourceColumn is string => sourceColumn !== null
      )
    );

    return {
      suggestedMapping,
      confidence: Math.max(0, Math.min(1, suggestion.confidence)),
      unmappedColumns: sourceColumns.filter((column) => !mappedSources.has(column)),
    };
  }

  // 기능 : 원본/대상 컬럼 이름을 기반으로 규칙 기반 매핑 제안을 생성합니다.
  private createHeuristicMapping(
    columns: readonly ImportTemplateColumn[],
    sourceColumns: readonly string[],
    targetType: ImportTemplateType
  ): ImportMappingSuggestion {
    const sourceEntries = sourceColumns.map((column) => ({
      column,
      normalized: this.normalizeForMatching(column),
    }));
    const usedSourceColumns = new Set<string>();
    const suggestedMapping: Record<string, string | null> = {};

    for (const column of columns) {
      const aliases = this.getColumnAliases(column, targetType);
      const matchedSource = sourceEntries.find((sourceEntry) => {
        if (usedSourceColumns.has(sourceEntry.column)) {
          return false;
        }

        return aliases.some((alias) => alias === sourceEntry.normalized);
      }) ?? sourceEntries.find((sourceEntry) => {
        if (usedSourceColumns.has(sourceEntry.column)) {
          return false;
        }

        return aliases.some(
          (alias) =>
            sourceEntry.normalized.includes(alias) || alias.includes(sourceEntry.normalized)
        );
      });

      suggestedMapping[column.key] = matchedSource?.column ?? null;

      if (matchedSource) {
        usedSourceColumns.add(matchedSource.column);
      }
    }

    const mappedCount = Object.values(suggestedMapping).filter(Boolean).length;

    return {
      suggestedMapping,
      confidence: columns.length > 0 ? mappedCount / columns.length : 0,
      unmappedColumns: sourceColumns.filter((column) => !usedSourceColumns.has(column)),
    };
  }

  // 기능 : 컬럼별 매칭 후보 이름을 정규화된 문자열 목록으로 반환합니다.
  private getColumnAliases(
    column: ImportTemplateColumn,
    targetType: ImportTemplateType
  ): readonly string[] {
    const aliasKey =
      targetType === "CONTACT" && column.key === "companyName"
        ? "companyNameForContact"
        : column.key;
    const aliases = [
      column.key,
      column.label,
      ...(FIELD_ALIASES[aliasKey] ?? []),
    ];

    return [...new Set(aliases.map((alias) => this.normalizeForMatching(alias)))];
  }

  // 기능 : 비교 가능한 컬럼 이름으로 문자열을 정규화합니다.
  private normalizeForMatching(value: string): string {
    return value
      .toLowerCase()
      .replace(/[()\[\]{}_\-\s./\\:：,，]/g, "")
      .trim();
  }

  // 기능 : 요청 매핑을 대상/원본 컬럼 범위 안으로 정규화합니다.
  private normalizeMapping(
    mapping: ImportMapping,
    columns: readonly ImportTemplateColumn[],
    sourceColumns: readonly string[]
  ): ImportMapping {
    const sourceColumnSet = new Set(sourceColumns);
    const normalizedMapping: Record<string, string | null> = {};

    for (const column of columns) {
      const mappedSourceColumn = mapping[column.key] ?? null;
      normalizedMapping[column.key] =
        mappedSourceColumn && sourceColumnSet.has(mappedSourceColumn)
          ? mappedSourceColumn
          : null;
    }

    return normalizedMapping;
  }

  // 기능 : 매핑 기준으로 모든 job row를 생성 가능한 데이터로 변환하고 오류를 수집합니다.
  private validateJobRows(
    rows: readonly StoredImportJobRow[],
    columns: readonly ImportTemplateColumn[],
    mapping: ImportMapping
  ): NormalizedRowValidation {
    const mappingErrors = columns
      .filter((column) => column.required && !mapping[column.key])
      .map((column) => ({
        rowNumber: null,
        message: `${column.label} 필수 컬럼 매핑이 필요합니다.`,
      }));

    if (mappingErrors.length > 0) {
      return {
        rows: rows.map((row) => ({
          ...row,
          mappedData: null,
          status: "VALIDATION_FAILED",
          errorMessage: "필수 컬럼 매핑이 필요합니다.",
        })),
        validRowCount: 0,
        invalidRowCount: rows.length,
        errors: mappingErrors,
      };
    }

    const errors: ImportJobError[] = [];
    const normalizedRows = rows.map((row) => {
      const mappedData: Record<string, ImportFieldValue> = {};
      const rowErrors: string[] = [];

      for (const column of columns) {
        const sourceColumn = mapping[column.key];
        const rawValue = sourceColumn ? row.rawData[sourceColumn] ?? "" : "";
        const result = this.normalizeFieldValue(rawValue, column);
        mappedData[column.key] = result.value;

        if (result.errorMessage) {
          rowErrors.push(result.errorMessage);
        }
      }

      for (const errorMessage of rowErrors) {
        errors.push({ rowNumber: row.rowNumber, message: errorMessage });
      }

      const status: StoredImportJobRow["status"] =
        rowErrors.length > 0 ? "VALIDATION_FAILED" : "VALID";

      return {
        ...row,
        mappedData,
        status,
        errorMessage: rowErrors.length > 0 ? rowErrors.join(" / ") : null,
      };
    });

    const invalidRowCount = normalizedRows.filter(
      (row) => row.status === "VALIDATION_FAILED"
    ).length;

    return {
      rows: normalizedRows,
      validRowCount: normalizedRows.length - invalidRowCount,
      invalidRowCount,
      errors,
    };
  }

  // 기능 : 확정 요청 row를 도메인 생성과 로그 저장에 사용할 row로 정규화합니다.
  private normalizeConfirmRows(
    job: StoredImportJob,
    columns: readonly ImportTemplateColumn[],
    rows: readonly ConfirmImportJobRowInput[] | undefined
  ): readonly ConfirmReadyRow[] {
    const candidateRows =
      rows && rows.length > 0
        ? rows.map((row) => ({
            rowNumber: row.rowNumber,
            data: row.data,
          }))
        : job.rows.map((row) => ({
            rowNumber: row.rowNumber,
            data: row.mappedData ?? {},
          }));

    if (candidateRows.length === 0) {
      throw new ValidationDomainError("확정할 데이터 row가 없습니다.");
    }

    return candidateRows.map((row) => {
      if (!Number.isInteger(row.rowNumber) || row.rowNumber < 2) {
        throw new ValidationDomainError("rowNumber가 올바르지 않습니다.");
      }

      const submittedData = this.normalizeSubmittedRowData(row.data, columns);

      return {
        rowNumber: row.rowNumber,
        submittedData,
        targetLabel: this.getTargetLabel(job.targetType, submittedData),
      };
    });
  }

  // 기능 : 확정 요청 row 데이터를 대상 컬럼 정의에 맞춰 정규화합니다.
  private normalizeSubmittedRowData(
    data: Readonly<Record<string, unknown>>,
    columns: readonly ImportTemplateColumn[]
  ): ImportSubmittedData {
    const submittedData: Record<string, ImportSubmittedDataValue> = {};

    for (const column of columns) {
      const result = this.normalizeFieldValue(data[column.key], column);

      if (result.errorMessage) {
        throw new ValidationDomainError(result.errorMessage);
      }

      submittedData[column.key] = result.value;
    }

    return submittedData;
  }

  // 기능 : 컬럼 타입별 값 정규화와 검증을 수행합니다.
  private normalizeFieldValue(
    value: unknown,
    column: ImportTemplateColumn
  ): NormalizedFieldValue {
    if (column.type === "number") {
      return this.normalizeNumberField(value, column);
    }

    if (column.type === "email") {
      return this.normalizeEmailField(value, column);
    }

    if (column.type === "phone") {
      return this.normalizePhoneField(value, column);
    }

    return this.normalizeTextField(value, column);
  }

  // 기능 : 텍스트 필드 값을 정규화합니다.
  private normalizeTextField(
    value: unknown,
    column: ImportTemplateColumn
  ): NormalizedFieldValue {
    const normalized = this.toTextValue(value).trim();

    if (column.required && normalized.length === 0) {
      return {
        value: null,
        errorMessage: `${column.label}은(는) 필수입니다.`,
      };
    }

    return {
      value: normalized.length > 0 ? normalized : null,
      errorMessage: null,
    };
  }

  // 기능 : 숫자 필드 값을 정수로 정규화합니다.
  private normalizeNumberField(
    value: unknown,
    column: ImportTemplateColumn
  ): NormalizedFieldValue {
    const textValue = this.toTextValue(value).replaceAll(",", "").trim();

    if (textValue.length === 0) {
      return column.required
        ? { value: null, errorMessage: `${column.label}은(는) 필수입니다.` }
        : { value: null, errorMessage: null };
    }

    const numberValue = Number(textValue);

    if (!Number.isInteger(numberValue) || numberValue < 0) {
      return {
        value: null,
        errorMessage: `${column.label}은(는) 0 이상의 정수여야 합니다.`,
      };
    }

    return {
      value: numberValue,
      errorMessage: null,
    };
  }

  // 기능 : 이메일 필드 값을 소문자 이메일로 정규화합니다.
  private normalizeEmailField(
    value: unknown,
    column: ImportTemplateColumn
  ): NormalizedFieldValue {
    const normalized = this.toTextValue(value).trim().toLowerCase();

    if (normalized.length === 0) {
      return column.required
        ? { value: null, errorMessage: `${column.label}은(는) 필수입니다.` }
        : { value: null, errorMessage: null };
    }

    if (!EMAIL_PATTERN.test(normalized)) {
      return {
        value: null,
        errorMessage: `${column.label} 형식이 올바르지 않습니다.`,
      };
    }

    return {
      value: normalized,
      errorMessage: null,
    };
  }

  // 기능 : 휴대폰 필드 값을 010-0000-0000 형식으로 정규화합니다.
  private normalizePhoneField(
    value: unknown,
    column: ImportTemplateColumn
  ): NormalizedFieldValue {
    const normalized = this.toTextValue(value).trim();

    if (normalized.length === 0) {
      return column.required
        ? { value: null, errorMessage: `${column.label}은(는) 필수입니다.` }
        : { value: null, errorMessage: null };
    }

    if (MOBILE_PATTERN.test(normalized)) {
      return {
        value: normalized,
        errorMessage: null,
      };
    }

    const digits = normalized.replace(/\D/g, "");

    if (!MOBILE_DIGIT_PATTERN.test(digits)) {
      return {
        value: null,
        errorMessage: `${column.label}은(는) 010-0000-0000 형식이어야 합니다.`,
      };
    }

    return {
      value: `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`,
      errorMessage: null,
    };
  }

  // 기능 : unknown 값을 입력 텍스트로 변환합니다.
  private toTextValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }

    return String(value);
  }

  // 기능 : 대상 타입별 로그 표시명을 계산합니다.
  private getTargetLabel(
    targetType: ImportTemplateType,
    data: ImportSubmittedData
  ): string {
    switch (targetType) {
      case "COMPANY":
        return this.readSubmittedText(data, "companyName");
      case "CONTACT":
        return this.readSubmittedText(data, "contactName");
      case "PRODUCT":
        return this.readSubmittedText(data, "productName");
      case "DEAL":
        return this.readSubmittedText(data, "dealName");
    }
  }

  // 기능 : 불러오기 내역 목록에 보여줄 context snapshot을 생성합니다.
  private createImportContext(
    targetType: ImportTemplateType,
    rows: readonly ConfirmReadyRow[]
  ): { readonly label: string | null; readonly data: ImportSubmittedData | null } {
    if (targetType !== "CONTACT") {
      return { label: null, data: null };
    }

    const companyNames = [
      ...new Set(
        rows
          .map((row) => this.readSubmittedText(row.submittedData, "companyName"))
          .filter((companyName) => companyName.length > 0)
      ),
    ];

    if (companyNames.length === 0) {
      return { label: null, data: null };
    }

    const firstCompanyName = companyNames[0] ?? "";

    return {
      label:
        companyNames.length === 1
          ? firstCompanyName
          : `${firstCompanyName} 외 ${companyNames.length - 1}개 회사`,
      data: {
        companyName: firstCompanyName,
        companyCount: companyNames.length,
      },
    };
  }

  // 기능 : 제출 데이터에서 문자열 표시값을 읽습니다.
  private readSubmittedText(data: ImportSubmittedData, key: string): string {
    const value = data[key];

    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  }

  // 기능 : 필수 텍스트 값을 앞뒤 공백 제거 후 반환합니다.
  private normalizeRequiredText(value: string | undefined, message: string): string {
    const normalized = value?.trim() ?? "";

    if (!normalized) {
      throw new ValidationDomainError(message);
    }

    return normalized;
  }

  // 기능 : JSON 값을 xlsx 셀 값으로 변환합니다.
  private toXlsxCellValue(value: unknown): XlsxCellValue {
    if (value === null || typeof value === "string" || typeof value === "number") {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }

    return String(value);
  }

  // 기능 : xlsx row 값을 API sample row 값으로 변환합니다.
  private toSampleRowValue(value: XlsxCellValue): string | number | null {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }

  // 기능 : 저장된 JSON 값을 화면 표시 가능한 제출 데이터 값으로 변환합니다.
  private toSubmittedDataValue(value: unknown): ImportSubmittedDataValue {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }

    return JSON.stringify(value);
  }

  // 기능 : 지원하는 양식 컬럼 타입인지 확인합니다.
  private isColumnType(value: string | null): value is ImportTemplateColumnType {
    return (
      value === "text" ||
      value === "number" ||
      value === "email" ||
      value === "phone"
    );
  }
}

// 기능 : unknown 값이 객체 레코드인지 확인합니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 기능 : 객체 필드를 문자열로 읽습니다.
function getStringField(value: Record<string, unknown>, field: string): string | null {
  const fieldValue = value[field];

  return typeof fieldValue === "string" ? fieldValue : null;
}
