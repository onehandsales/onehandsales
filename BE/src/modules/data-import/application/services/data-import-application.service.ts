import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  IMPORT_FILE_PARSER,
  type ImportFileParser,
  type ImportUploadedFile,
} from "@/modules/data-import/application/ports/import-file-parser.port";
import {
  type ImportFieldValue,
  type ImportJobError,
  type ImportMappedRowData,
  type ImportMapping,
  type ImportMappingSuggestion,
} from "@/modules/data-import/application/ports/import-job.types";
import {
  IMPORT_JOB_REPOSITORY,
  type ImportJobDetailRecord,
  type ImportJobErrorRecord,
  type ImportJobRecord,
  type ImportJobRepositoryContext,
  type ImportJobRowRecord,
  type PersistentImportJobMappingSource,
  type PersistentImportJobRowStatus,
  type PersistentImportJobStatus,
} from "@/modules/data-import/application/ports/import-job.repository";
import {
  IMPORT_MAPPING_PROVIDER,
  type ImportMappingProvider,
  type ImportMappingTargetField,
} from "@/modules/data-import/application/ports/import-mapping.provider";
import {
  IMPORT_TEMPLATE_REPOSITORY,
  type ConfirmDealCompanyResolutionInput,
  type ConfirmDealContactResolutionInput,
  type ConfirmDealProductResolutionInput,
  type ImportTemplateRecord,
  type ImportTemplateRepository,
  type ImportTemplateType,
  type ImportUserLogListRecord,
  type ConfirmImportInput as ConfirmImportRepositoryInput,
  type ConfirmImportResult,
} from "@/modules/data-import/application/ports/import-template.repository";
import {
  IMPORT_UPLOADED_FILE_STORAGE,
  type ImportUploadedFileStorage,
} from "@/modules/data-import/application/ports/import-uploaded-file-storage.port";
import {
  DEAL_STATUS_CODES,
  getDealStatusLabel,
} from "@/modules/deal/domain/deal-status";
import {
  ImportConfirmFailedError,
  ImportConfirmValidationFailedError,
  ImportFileStorageFailedError,
  ImportJobAlreadyClosedError,
  ImportJobAlreadyConfirmedError,
  ImportJobExpiredError,
  ImportJobNotFoundError,
  ImportJobNotReadyError,
  ImportJobRowNotFoundError,
  ImportMappingRequiredError,
  ImportTemplateNotFoundError,
  ImportTemplateSchemaInvalidError,
  ImportUserLogNotFoundError,
  InvalidImportMappingError,
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
import { DomainError } from "@/shared/domain/errors/domain-error";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const TEMPLATE_TYPE_ORDER: readonly ImportTemplateType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
];
const IMPORT_USER_LOG_PAGE_SIZE = 15;
const MOBILE_PATTERN = /^010-\d{4}-\d{4}$/;
const MOBILE_DIGIT_PATTERN = /^010\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEAL_STATUS_TEMPLATE_OPTIONS = DEAL_STATUS_CODES.map((status) =>
  getDealStatusLabel(status)
);

const FIELD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  companyName: ["회사명", "회사이름", "company", "companyName"],
  companyFieldName: ["회사분야", "분야", "업종", "industry", "field"],
  companyRegionName: ["회사지역", "지역", "region", "location"],
  productName: ["제품명", "제품이름", "product", "productName"],
  productPrice: ["제품단가", "단가", "가격", "price", "unitPrice"],
  productCategoryName: ["제품카테고리", "카테고리", "category"],
  productStatusName: ["제품상태", "상태", "status"],
  dealName: ["딜이름", "딜이름", "딜 이름", "deal", "dealName"],
  dealCost: ["딜금액", "딜 금액", "금액", "amount", "dealCost"],
  expectedEndDate: ["예상마감일", "예상 마감일", "마감일", "expectedEndDate"],
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
  readonly options?: readonly string[];
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
export interface UpdateImportJobRowInput {
  readonly rowId: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly excluded?: boolean;
}

export interface UpdateImportJobRowsInput {
  readonly rows: readonly UpdateImportJobRowInput[];
}

export interface ConfirmImportJobRowInput {
  readonly rowNumber: number;
  readonly data: Readonly<Record<string, unknown>>;
}

// 역할 : 담당자 불러오기 확정 시 새 회사 보정 값을 정의합니다.
export interface ConfirmContactCompanyResolutionJobInput {
  readonly companyName: string;
  readonly companyFieldName: string;
  readonly companyRegionName: string;
}

// 역할 : 딜 불러오기 확정 시 새 회사 보정 값을 정의합니다.
export interface ConfirmDealCompanyResolutionJobInput {
  readonly companyName: string;
  readonly companyFieldName: string;
  readonly companyRegionName: string;
}

// 역할 : 딜 불러오기 확정 시 새 담당자 보정 값을 정의합니다.
export interface ConfirmDealContactResolutionJobInput {
  readonly companyName: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactDepartmentName: string;
  readonly contactJobGradeName: string;
}

// 역할 : 딜 불러오기 확정 시 새 제품 보정 값을 정의합니다.
export interface ConfirmDealProductResolutionJobInput {
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategoryName: string;
  readonly productStatusName: string;
}

// 역할 : ConfirmImportJobInput 불러오기 확정 요청 값을 정의합니다.
export interface ConfirmImportJobInput {
  readonly idempotencyKey?: string;
  readonly contactCompanyResolutions?: readonly ConfirmContactCompanyResolutionJobInput[];
  readonly dealCompanyResolutions?: readonly ConfirmDealCompanyResolutionJobInput[];
  readonly dealContactResolutions?: readonly ConfirmDealContactResolutionJobInput[];
  readonly dealProductResolutions?: readonly ConfirmDealProductResolutionJobInput[];
  readonly rows?: readonly ConfirmImportJobRowInput[];
}

export interface ListActiveImportJobsRequest {
  readonly targetType?: ImportTemplateType;
  readonly limit?: number;
}

export interface GetImportJobRequest {
  readonly includeErrors?: boolean;
}

export interface MapImportJobRequest {
  readonly preferredSource?: "AI" | "RULE_BASED";
}

export type ValidateImportJobRequest = object;

export type CancelImportJobRequest = object;

export interface ListImportJobErrorsRequest {
  readonly limit?: number;
}

// 역할 : ImportCellValidationError cell 단위 import 검증 오류 응답을 정의합니다.
export interface ImportCellValidationError {
  readonly fieldKey: string;
  readonly message: string;
  readonly code: string;
}

// 역할 : ImportJobRowResponse 확정 전 import row 응답을 정의합니다.
export interface ImportJobRowResponse {
  readonly rowId: string;
  readonly rowNumber: number;
  readonly status: PersistentImportJobRowStatus;
  readonly data: ImportMappedRowData;
  readonly targetLabel: string | null;
  readonly errors: readonly ImportCellValidationError[];
}

// 역할 : ImportJobSummaryResponse 확정 전 import job 요약 응답을 정의합니다.
export interface ImportJobSummaryResponse {
  readonly id: string;
  readonly targetType: ImportTemplateType;
  readonly status: PersistentImportJobStatus;
  readonly mappingSource: PersistentImportJobMappingSource;
  readonly originalFileName: string;
  readonly totalRowCount: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly importedRowCount: number;
  readonly failedRowCount: number;
  readonly importUserLogId: string | null;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ActiveImportJobsResponse {
  readonly items: ImportJobSummaryResponse[];
}

// 역할 : ImportJobErrorResponse redacted import 오류 이력 응답을 정의합니다.
export interface ImportJobErrorResponse {
  readonly id: string;
  readonly rowId: string | null;
  readonly rowNumber: number | null;
  readonly fieldKey: string | null;
  readonly errorType: string;
  readonly errorCode: string;
  readonly severity: string;
  readonly safeMessage: string;
  readonly retryable: boolean;
  readonly createdAt: string;
}

// 역할 : ImportJobDetailResponse 확정 전 import job 상세 응답을 정의합니다.
export interface ImportJobDetailResponse {
  readonly job: ImportJobSummaryResponse;
  readonly templateColumns: ImportTemplateColumn[];
  readonly sourceColumns: readonly string[];
  readonly mapping: ImportMapping;
  readonly rows: ImportJobRowResponse[];
  readonly errors: readonly ImportJobErrorResponse[];
}

export type CreateImportJobResponse = ImportJobDetailResponse;
export type ImportJobResponse = ImportJobSummaryResponse;

// 역할 : ConfirmImportJobResponse 불러오기 확정 결과 응답을 정의합니다.
export interface ConfirmImportJobResponse {
  readonly importJobId: string;
  readonly importUserLogId: string;
  readonly status: "CONFIRMED";
  readonly importedRowCount: number;
}

export type ImportJobResultResponse = ConfirmImportJobResponse;

export interface ImportJobErrorsResponse {
  readonly items: ImportJobErrorResponse[];
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
  readonly rows: readonly ValidatedImportJobRow[];
  readonly validRowCount: number;
  readonly invalidRowCount: number;
  readonly errors: readonly ImportJobError[];
}

interface ValidatedImportJobRow {
  readonly rowId: string;
  readonly rowNumber: number;
  readonly rawData: Readonly<Record<string, string>>;
  readonly mappedData: ImportMappedRowData;
  readonly normalizedData: ImportSubmittedData | null;
  readonly status: PersistentImportJobRowStatus;
  readonly validationErrors: readonly ImportCellValidationError[];
  readonly targetLabel: string | null;
}

type LegacyImportJobRowStatus = "PENDING" | "VALID" | "VALIDATION_FAILED";

interface LegacyStoredImportJobRow {
  readonly id: string;
  readonly rowNumber: number;
  readonly rawData: Readonly<Record<string, string>>;
  readonly mappedData: ImportMappedRowData | null;
  readonly status: LegacyImportJobRowStatus;
  readonly errorMessage: string | null;
}

interface LegacyStoredImportJob {
  readonly targetType: ImportTemplateType;
  readonly rows: readonly LegacyStoredImportJobRow[];
}

interface LegacyNormalizedRowValidation {
  readonly rows: readonly LegacyStoredImportJobRow[];
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
    @Inject(IMPORT_JOB_REPOSITORY)
    private readonly importJobRepository: ImportJobRepositoryContext,
    @Inject(IMPORT_FILE_PARSER)
    private readonly importFileParser: ImportFileParser,
    @Inject(IMPORT_UPLOADED_FILE_STORAGE)
    private readonly importUploadedFileStorage: ImportUploadedFileStorage,
    @Inject(IMPORT_MAPPING_PROVIDER)
    private readonly importMappingProvider: ImportMappingProvider,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
    private readonly logger: AppLogger
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
  async listActiveImportJobs(
    currentUser: CurrentUserContext,
    input: ListActiveImportJobsRequest = {}
  ): Promise<ActiveImportJobsResponse> {
    const now = new Date();
    const limit = this.normalizeLimit(input.limit, 5, 10);

    await this.expireImportJobsForUser(currentUser.id, now);

    const jobs = await this.importJobRepository.listActiveJobsForUser({
      userId: currentUser.id,
      now,
      limit,
      ...(input.targetType ? { targetType: input.targetType } : {}),
    });

    this.logEvent("importJob.activeListed", {
      userId: currentUser.id,
      count: jobs.length,
    });

    return {
      items: jobs.map((job) => this.toImportJobSummaryResponse(job)),
    };
  }

  async createImportJob(
    currentUser: CurrentUserContext,
    input: CreateImportJobInput
  ): Promise<CreateImportJobResponse> {
    const template =
      await this.importTemplateRepository.findActiveTemplateByType(input.targetType);

    if (!template) {
      throw new ImportTemplateNotFoundError();
    }

    const importJobId = randomUUID();
    const originalFileName = this.normalizeUploadedFileName(input.file.originalname);
    const parsedFile = await this.importFileParser.parse({
      ...input.file,
      originalname: originalFileName,
    });
    const now = new Date();
    const expiresAt = this.createImportJobExpiresAt(now);
    const storedFile = await this.storeUploadedImportFile(currentUser, {
      importJobId,
      originalFileName,
      file: input.file,
    });

    try {
      const job = await this.importJobRepository.runInTransaction((repositories) =>
        repositories.createJob({
          id: importJobId,
          userId: currentUser.id,
          templateId: template.id,
          targetType: template.templateType,
          templateVersion: template.templateVersion,
          templateColumnsJson: template.columnsJson,
          sourceColumnsJson: parsedFile.sourceColumns,
          status: "UPLOADED",
          mappingJson: {},
          mappingSource: "NONE",
          originalFileName,
          fileSizeBytes: input.file.size,
          totalRowCount: parsedFile.rows.length,
          validRowCount: 0,
          invalidRowCount: 0,
          importedRowCount: 0,
          failedRowCount: 0,
          expiresAt,
          rows: parsedFile.rows.map((row) => ({
            rowNumber: row.rowNumber,
            rawDataJson: row.rawData,
            mappedDataJson: {},
            normalizedDataJson: null,
            status: "PENDING",
            validationErrorsJson: [],
          })),
          uploadedFile: {
            originalFileName,
            mimeType: input.file.mimetype,
            fileSizeBytes: input.file.size,
            checksum: storedFile.checksum,
            storageProvider: storedFile.storageProvider,
            storageBucket: storedFile.storageBucket,
            storageKey: storedFile.storageKey,
            status: "PARSED",
            uploadedAt: now,
            expiresAt,
          },
        })
      );

      this.logEvent("importJob.created", {
        userId: currentUser.id,
        importJobId: job.id,
        targetType: job.targetType,
        totalRowCount: job.totalRowCount,
      });

      return this.toImportJobDetailResponse(job, { includeErrors: true });
    } catch (error) {
      await this.safeDeleteStoredImportFile(storedFile.storageKey);
      throw error;
    }
  }

  // 기능 : 원본 컬럼을 대상 양식 컬럼으로 AI 매핑하고 실패 시 규칙 기반 매핑으로 대체합니다.
  async generateImportMapping(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: MapImportJobRequest = {}
  ): Promise<ImportJobDetailResponse> {
    const job = await this.getMutableImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const sourceColumns = this.normalizeSourceColumns(job.sourceColumnsJson);
    const fallback = this.createHeuristicMapping(
      columns,
      sourceColumns,
      job.targetType
    );

    let suggestion = fallback;
    let mappingSource: PersistentImportJobMappingSource = "RULE_BASED";
    let providerFailed = false;

    if (input.preferredSource !== "RULE_BASED") {
      try {
        suggestion = this.normalizeMappingSuggestion(
          await this.importMappingProvider.generate({
            targetType: job.targetType,
            targetFields: columns.map((column) => this.toMappingTargetField(column)),
            sourceColumns,
            sampleRows: job.rows
              .slice(0, 5)
              .map((row) => this.normalizeRawData(row.rawDataJson)),
          }),
          fallback,
          columns,
          sourceColumns
        );
        mappingSource = "AI";
      } catch {
        providerFailed = true;
        suggestion = fallback;
      }
    }

    const validation = this.validateRowsWithMapping(
      job.rows,
      columns,
      suggestion.suggestedMapping,
      job.targetType
    );
    const nextStatus = this.resolveReviewStatus(validation);

    await this.importJobRepository.runInTransaction(async (repositories) => {
      await repositories.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: nextStatus,
        mappingJson: suggestion.suggestedMapping,
        mappingSource,
        validRowCount: validation.validRowCount,
        invalidRowCount: validation.invalidRowCount,
      });
      await repositories.updateRowsForJob({
        userId: currentUser.id,
        importJobId,
        rows: validation.rows.map((row) => this.toRepositoryRowUpdate(row)),
      });

      if (providerFailed) {
        await repositories.createError({
          userId: currentUser.id,
          importJobId,
          errorType: "AI_MAPPING",
          errorCode: "IMPORT_MAPPING_PROVIDER_FAILED",
          severity: "WARNING",
          safeMessage: "AI 컬럼 매칭에 실패해 규칙 기반 매칭을 적용했습니다.",
          retryable: true,
        });
      }
    });

    this.logEvent("importJob.mapped", {
      userId: currentUser.id,
      importJobId,
      mappingSource,
      validRowCount: validation.validRowCount,
      invalidRowCount: validation.invalidRowCount,
    });

    return this.getImportJob(currentUser, importJobId, { includeErrors: true });
  }

  // 기능 : 사용자가 수정한 매핑을 적용해 모든 row의 생성 가능 여부를 검증합니다.
  async updateImportMapping(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: UpdateImportMappingInput
  ): Promise<ImportJobDetailResponse> {
    const job = await this.getMutableImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const sourceColumns = this.normalizeSourceColumns(job.sourceColumnsJson);
    const mapping = this.normalizeUserMapping(input.mapping, columns, sourceColumns);
    const validation = this.validateRowsWithMapping(
      job.rows,
      columns,
      mapping,
      job.targetType
    );
    const nextStatus = this.resolveReviewStatus(validation);

    await this.importJobRepository.runInTransaction(async (repositories) => {
      await repositories.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: nextStatus,
        mappingJson: mapping,
        mappingSource: "USER",
        validRowCount: validation.validRowCount,
        invalidRowCount: validation.invalidRowCount,
      });
      await repositories.updateRowsForJob({
        userId: currentUser.id,
        importJobId,
        rows: validation.rows.map((row) => this.toRepositoryRowUpdate(row)),
      });
    });

    this.logEvent("importJob.mappingUpdated", {
      userId: currentUser.id,
      importJobId,
      validRowCount: validation.validRowCount,
      invalidRowCount: validation.invalidRowCount,
    });

    return this.getImportJob(currentUser, importJobId, { includeErrors: true });
  }

  // 기능 : 확정 전 임시 불러오기 job 상세를 조회합니다.
  async getImportJob(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: GetImportJobRequest = {}
  ): Promise<ImportJobDetailResponse> {
    const job = await this.getImportJobDetail(currentUser, importJobId);

    this.logEvent("importJob.viewed", {
      userId: currentUser.id,
      importJobId,
      status: job.status,
    });

    return this.toImportJobDetailResponse(job, {
      includeErrors: input.includeErrors === true,
    });
  }

  // 기능 : 사용자가 최종 보정한 row를 실제 도메인 데이터로 생성하고 성공 로그를 저장합니다.
  async updateImportJobRows(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: UpdateImportJobRowsInput
  ): Promise<ImportJobDetailResponse> {
    const job = await this.getMutableImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const rowMap = new Map(job.rows.map((row) => [row.id, row]));
    const updatedRows = new Map<string, ValidatedImportJobRow>();

    for (const rowInput of input.rows) {
      const row = rowMap.get(rowInput.rowId);

      if (!row) {
        throw new ImportJobRowNotFoundError();
      }

      updatedRows.set(
        row.id,
        this.validateUserEditedRow(row, columns, job.targetType, rowInput)
      );
    }

    const mergedRows = job.rows.map((row) =>
      updatedRows.get(row.id) ?? this.toValidatedRowFromRecord(row)
    );
    const summary = this.calculateRowSummary(mergedRows);
    const nextStatus = this.resolveReviewStatus(summary);

    await this.importJobRepository.runInTransaction(async (repositories) => {
      await repositories.updateRowsForJob({
        userId: currentUser.id,
        importJobId,
        rows: [...updatedRows.values()].map((row) =>
          this.toRepositoryRowUpdate(row)
        ),
      });
      await repositories.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: nextStatus,
        validRowCount: summary.validRowCount,
        invalidRowCount: summary.invalidRowCount,
      });
    });

    this.logEvent("importJob.rowsUpdated", {
      userId: currentUser.id,
      importJobId,
      updatedRowCount: input.rows.length,
      validRowCount: summary.validRowCount,
      invalidRowCount: summary.invalidRowCount,
    });

    return this.getImportJob(currentUser, importJobId, { includeErrors: true });
  }

  async validateImportJob(
    currentUser: CurrentUserContext,
    importJobId: string,
    _input: ValidateImportJobRequest = {}
  ): Promise<ImportJobDetailResponse> {
    void _input;
    const job = await this.getMutableImportJob(currentUser, importJobId);
    const columns = this.normalizeColumns(job.templateColumnsJson);
    const mapping = this.normalizeExistingMapping(job.mappingJson, columns);

    if (!this.hasRequiredMapping(mapping, columns)) {
      throw new ImportMappingRequiredError();
    }

    const validation = this.validateRowsWithCurrentData(
      job.rows,
      columns,
      mapping,
      job.targetType
    );
    const nextStatus = this.resolveReviewStatus(validation);

    await this.importJobRepository.runInTransaction(async (repositories) => {
      await repositories.updateRowsForJob({
        userId: currentUser.id,
        importJobId,
        rows: validation.rows.map((row) => this.toRepositoryRowUpdate(row)),
      });
      await repositories.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: nextStatus,
        validRowCount: validation.validRowCount,
        invalidRowCount: validation.invalidRowCount,
      });
    });

    this.logEvent("importJob.validated", {
      userId: currentUser.id,
      importJobId,
      validRowCount: validation.validRowCount,
      invalidRowCount: validation.invalidRowCount,
    });

    return this.getImportJob(currentUser, importJobId, { includeErrors: true });
  }

  async cancelImportJob(
    currentUser: CurrentUserContext,
    importJobId: string,
    _input: CancelImportJobRequest = {}
  ): Promise<void> {
    void _input;
    const job = await this.getImportJobDetail(currentUser, importJobId);

    if (job.status === "CONFIRMED") {
      throw new ImportJobAlreadyConfirmedError();
    }

    if (this.isTerminalImportJobStatus(job.status)) {
      return;
    }

    const now = new Date();
    let fileDeleted = false;

    if (job.uploadedFile && !job.uploadedFile.deletedAt) {
      try {
        await this.importUploadedFileStorage.delete({
          storageKey: job.uploadedFile.storageKey,
        });
        fileDeleted = true;
      } catch {
        fileDeleted = false;
      }
    }

    await this.importJobRepository.runInTransaction(async (repositories) => {
      await repositories.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: "CANCELED",
        canceledAt: now,
      });

      if (fileDeleted) {
        await repositories.updateUploadedFileStatusForUser({
          userId: currentUser.id,
          importJobId,
          status: "DELETED",
          deletedAt: now,
        });
      } else if (job.uploadedFile && !job.uploadedFile.deletedAt) {
        await repositories.createError({
          userId: currentUser.id,
          importJobId,
          errorType: "STORAGE",
          errorCode: "STORAGE_DELETE_FAILED",
          severity: "WARNING",
          safeMessage: "원본 파일 삭제에 실패했습니다.",
          retryable: true,
        });
      }
    });

    this.logEvent("importJob.canceled", {
      userId: currentUser.id,
      importJobId,
      fileDeleted,
    });
  }

  async listImportJobErrors(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: ListImportJobErrorsRequest = {}
  ): Promise<ImportJobErrorsResponse> {
    await this.getImportJobDetail(currentUser, importJobId);

    const errors = await this.importJobRepository.listErrorsForJob({
      userId: currentUser.id,
      importJobId,
      limit: this.normalizeLimit(input.limit, 50, 100),
    });

    this.logEvent("importJob.errorsListed", {
      userId: currentUser.id,
      importJobId,
      count: errors.length,
    });

    return {
      items: errors.map((error) => this.toImportJobErrorResponse(error)),
    };
  }

  async confirmImportJob(
    currentUser: CurrentUserContext,
    importJobId: string,
    input: ConfirmImportJobInput
  ): Promise<ConfirmImportJobResponse> {
    const job = await this.getImportJobDetail(currentUser, importJobId);

    if (job.status === "CONFIRMED") {
      throw new ImportJobAlreadyConfirmedError();
    }

    this.ensureJobMutable(job);

    if (job.status !== "READY_TO_CONFIRM") {
      throw new ImportJobNotReadyError();
    }

    const columns = this.normalizeColumns(job.templateColumnsJson);
    const rows = this.normalizePersistentConfirmRows(job, columns, input.rows);
    const contactCompanyResolutions =
      job.targetType === "CONTACT"
        ? this.normalizeContactCompanyResolutions(
            input.contactCompanyResolutions
          )
        : undefined;
    const dealCompanyResolutions =
      job.targetType === "DEAL"
        ? this.normalizeDealCompanyResolutions(input.dealCompanyResolutions)
        : undefined;
    const dealContactResolutions =
      job.targetType === "DEAL"
        ? this.normalizeDealContactResolutions(input.dealContactResolutions)
        : undefined;
    const dealProductResolutions =
      job.targetType === "DEAL"
        ? this.normalizeDealProductResolutions(input.dealProductResolutions)
        : undefined;

    const confirmInput = {
      userId: currentUser.id,
      importJobId,
      targetType: job.targetType,
      templateVersion: job.templateVersion,
      templateColumnsJson: job.templateColumnsJson,
      contextLabel: null,
      contextJson: null,
      originalFileName: this.normalizeUploadedFileName(job.originalFileName),
      fileSizeBytes: job.fileSizeBytes,
      rows,
      ...(contactCompanyResolutions === undefined
        ? {}
        : { contactCompanyResolutions }),
      ...(dealCompanyResolutions === undefined
        ? {}
        : { dealCompanyResolutions }),
      ...(dealContactResolutions === undefined
        ? {}
        : { dealContactResolutions }),
      ...(dealProductResolutions === undefined
        ? {}
        : { dealProductResolutions }),
    };

    const movedToConfirming =
      await this.importJobRepository.updateJobStatusForUser({
        userId: currentUser.id,
        importJobId,
        expectedStatus: "READY_TO_CONFIRM",
        status: "CONFIRMING",
      });

    if (!movedToConfirming) {
      throw new ImportJobNotReadyError();
    }

    try {
      const result = await this.confirmDomainImport(job.targetType, confirmInput);

      await this.deleteUploadedFileAfterClose(currentUser, importJobId, job);

      this.logEvent("importJob.confirmed", {
        userId: currentUser.id,
        importJobId,
        importUserLogId: result.importUserLogId,
        importedRowCount: result.importedRowCount,
      });

      return {
        importJobId,
        importUserLogId: result.importUserLogId,
        status: "CONFIRMED",
        importedRowCount: result.importedRowCount,
      };
    } catch (error) {
      const confirmError =
        error instanceof ValidationDomainError
          ? new ImportConfirmValidationFailedError()
          : error instanceof DomainError
            ? error
            : new ImportConfirmFailedError();

      await this.importJobRepository.runInTransaction(async (repositories) => {
        await repositories.updateJobStatusForUser({
          userId: currentUser.id,
          importJobId,
          status: "FAILED",
          failedAt: new Date(),
          lastErrorCode: confirmError.code,
          lastErrorMessage: confirmError.message,
        });
        await repositories.createError({
          userId: currentUser.id,
          importJobId,
          errorType: "CONFIRM",
          errorCode: confirmError.code,
          severity: "ERROR",
          safeMessage: confirmError.message,
          retryable: !(confirmError instanceof ImportConfirmValidationFailedError),
        });
      });

      throw confirmError;
    }
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
      originalFileName: this.normalizeUploadedFileName(item.originalFileName),
      fileSizeBytes: item.fileSizeBytes,
      totalRowCount: item.totalRowCount,
      importedRowCount: item.importedRowCount,
      createdAt: item.createdAt.toISOString(),
    };
  }

  // 기능 : 임시 job row를 API 응답 row로 변환합니다.
  private toImportJobDetailResponse(
    job: ImportJobDetailRecord,
    options: { readonly includeErrors: boolean }
  ): ImportJobDetailResponse {
    const columns = this.normalizeColumns(job.templateColumnsJson);

    return {
      job: this.toImportJobSummaryResponse(job),
      templateColumns: columns,
      sourceColumns: this.normalizeSourceColumns(job.sourceColumnsJson),
      mapping: this.normalizeExistingMapping(job.mappingJson, columns),
      rows: job.rows.map((row) => this.toImportJobRowResponse(row)),
      errors: options.includeErrors
        ? job.errors.map((error) => this.toImportJobErrorResponse(error))
        : [],
    };
  }

  private toImportJobSummaryResponse(
    job: ImportJobRecord
  ): ImportJobSummaryResponse {
    return {
      id: job.id,
      targetType: job.targetType,
      status: job.status,
      mappingSource: job.mappingSource,
      originalFileName: this.normalizeUploadedFileName(job.originalFileName),
      totalRowCount: job.totalRowCount,
      validRowCount: job.validRowCount,
      invalidRowCount: job.invalidRowCount,
      importedRowCount: job.importedRowCount,
      failedRowCount: job.failedRowCount,
      importUserLogId: job.importUserLogId,
      expiresAt: job.expiresAt.toISOString(),
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  private toImportJobRowResponse(row: ImportJobRowRecord): ImportJobRowResponse {
    return {
      rowId: row.id,
      rowNumber: row.rowNumber,
      status: row.status,
      data: this.normalizeMappedData(row.mappedDataJson),
      targetLabel: row.targetLabel,
      errors: this.normalizeCellValidationErrors(row.validationErrorsJson),
    };
  }

  private toImportJobErrorResponse(
    error: ImportJobErrorRecord
  ): ImportJobErrorResponse {
    return {
      id: error.id,
      rowId: error.importJobRowId,
      rowNumber: error.rowNumber,
      fieldKey: error.fieldKey,
      errorType: error.errorType,
      errorCode: error.errorCode,
      severity: error.severity,
      safeMessage: error.safeMessage,
      retryable: error.retryable,
      createdAt: error.createdAt.toISOString(),
    };
  }

  // 기능 : 임시 job을 API 응답으로 변환합니다.
  private normalizeUploadedFileName(fileName: string): string {
    const normalized = fileName.trim();

    if (normalized.length === 0) {
      return "upload";
    }

    return this.repairUtf8MojibakeFileName(normalized);
  }

  private repairUtf8MojibakeFileName(fileName: string): string {
    if (!/[\u0080-\u00FF]/.test(fileName)) {
      return fileName;
    }

    const repaired = Buffer.from(fileName, "latin1").toString("utf8");

    if (repaired.includes("\uFFFD")) {
      return fileName;
    }

    const hasHangul = /[가-힣]/.test(fileName);
    const repairedHasHangul = /[가-힣]/.test(repaired);

    return repairedHasHangul && !hasHangul ? repaired : fileName;
  }

  // 기능 : 현재 사용자 소유 임시 job을 조회합니다.
  private async getImportJobDetail(
    currentUser: CurrentUserContext,
    importJobId: string
  ): Promise<ImportJobDetailRecord> {
    const now = new Date();

    await this.expireImportJobsForUser(currentUser.id, now, importJobId);

    const job = await this.importJobRepository.findJobByIdForUser({
      userId: currentUser.id,
      importJobId,
    });

    if (!job) {
      throw new ImportJobNotFoundError();
    }

    return job;
  }

  private async getMutableImportJob(
    currentUser: CurrentUserContext,
    importJobId: string
  ): Promise<ImportJobDetailRecord> {
    const job = await this.getImportJobDetail(currentUser, importJobId);

    this.ensureJobMutable(job);

    return job;
  }

  // 기능 : 양식 타입과 버전 기준으로 정렬 순서를 계산합니다.
  private createImportJobExpiresAt(now: Date): Date {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  private async storeUploadedImportFile(
    currentUser: CurrentUserContext,
    input: {
      readonly importJobId: string;
      readonly originalFileName: string;
      readonly file: ImportUploadedFile;
    }
  ) {
    try {
      return await this.importUploadedFileStorage.store({
        userId: currentUser.id,
        importJobId: input.importJobId,
        originalFileName: input.originalFileName,
        buffer: input.file.buffer,
      });
    } catch {
      throw new ImportFileStorageFailedError();
    }
  }

  private async safeDeleteStoredImportFile(storageKey: string): Promise<void> {
    try {
      await this.importUploadedFileStorage.delete({ storageKey });
    } catch {
      this.logEvent("importJob.fileDeleteFailed", {
        storageProvider: "LOCAL",
      });
    }
  }

  private async expireImportJobsForUser(
    userId: string,
    now: Date,
    importJobId?: string
  ): Promise<void> {
    const expiringJobs =
      await this.importJobRepository.listExpiredActiveJobsForUser({
        userId,
        now,
        ...(importJobId ? { importJobId } : {}),
      });

    if (expiringJobs.length === 0) {
      return;
    }

    const fileDeleteResults = new Map<string, boolean>();

    for (const job of expiringJobs) {
      if (!job.uploadedFile || job.uploadedFile.deletedAt) {
        continue;
      }

      try {
        await this.importUploadedFileStorage.delete({
          storageKey: job.uploadedFile.storageKey,
        });
        fileDeleteResults.set(job.id, true);
      } catch {
        fileDeleteResults.set(job.id, false);
      }
    }

    await this.importJobRepository.runInTransaction(async (repositories) => {
      for (const job of expiringJobs) {
        await repositories.updateJobStatusForUser({
          userId,
          importJobId: job.id,
          status: "EXPIRED",
        });

        const fileDeleted = fileDeleteResults.get(job.id);

        if (fileDeleted === true) {
          await repositories.updateUploadedFileStatusForUser({
            userId,
            importJobId: job.id,
            status: "EXPIRED",
            deletedAt: now,
          });
        } else if (fileDeleted === false) {
          await repositories.createError({
            userId,
            importJobId: job.id,
            errorType: "STORAGE",
            errorCode: "STORAGE_DELETE_FAILED",
            severity: "WARNING",
            safeMessage: "원본 파일 삭제에 실패했습니다.",
            retryable: true,
          });
        }
      }
    });

      this.logEvent("importJob.expired", {
        userId,
        expiredCount: expiringJobs.length,
      });
  }

  private ensureJobMutable(job: ImportJobRecord): void {
    if (job.status === "EXPIRED") {
      throw new ImportJobExpiredError();
    }

    if (job.status === "CONFIRMING") {
      throw new ImportJobAlreadyClosedError();
    }

    if (this.isTerminalImportJobStatus(job.status)) {
      throw new ImportJobAlreadyClosedError();
    }
  }

  private isTerminalImportJobStatus(status: PersistentImportJobStatus): boolean {
    return ["CONFIRMED", "FAILED", "CANCELED", "EXPIRED"].includes(status);
  }

  private normalizeLimit(
    value: number | undefined,
    defaultValue: number,
    maxValue: number
  ): number {
    if (!Number.isInteger(value)) {
      return defaultValue;
    }

    return Math.min(Math.max(value as number, 1), maxValue);
  }

  private normalizeSourceColumns(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === "string");
  }

  private normalizeRawData(value: unknown): Readonly<Record<string, string>> {
    if (!isRecord(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, this.toTextValue(item)])
    );
  }

  private normalizeMappedData(value: unknown): ImportMappedRowData {
    if (!isRecord(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        this.toImportFieldValue(item),
      ])
    );
  }

  private normalizeCellValidationErrors(
    value: unknown
  ): readonly ImportCellValidationError[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const fieldKey = getStringField(item, "fieldKey");
        const message = getStringField(item, "message");
        const code = getStringField(item, "code");

        if (!fieldKey || !message || !code) {
          return null;
        }

        return { fieldKey, message, code };
      })
      .filter((item): item is ImportCellValidationError => item !== null);
  }

  private normalizeExistingMapping(
    value: unknown,
    columns: readonly ImportTemplateColumn[]
  ): ImportMapping {
    const input = isRecord(value) ? value : {};
    const mapping: Record<string, string | null> = {};

    for (const column of columns) {
      const item = input[column.key];
      mapping[column.key] = typeof item === "string" ? item : null;
    }

    return mapping;
  }

  private normalizeUserMapping(
    mapping: ImportMapping,
    columns: readonly ImportTemplateColumn[],
    sourceColumns: readonly string[]
  ): ImportMapping {
    const columnKeySet = new Set(columns.map((column) => column.key));
    const sourceColumnSet = new Set(sourceColumns);

    for (const key of Object.keys(mapping)) {
      if (!columnKeySet.has(key)) {
        throw new InvalidImportMappingError();
      }
    }

    for (const value of Object.values(mapping)) {
      if (value !== null && !sourceColumnSet.has(value)) {
        throw new InvalidImportMappingError();
      }
    }

    return this.normalizeMapping(mapping, columns, sourceColumns);
  }

  private hasRequiredMapping(
    mapping: ImportMapping,
    columns: readonly ImportTemplateColumn[]
  ): boolean {
    return columns.every((column) => !column.required || Boolean(mapping[column.key]));
  }

  private resolveReviewStatus(input: {
    readonly validRowCount: number;
    readonly invalidRowCount: number;
  }): PersistentImportJobStatus {
    return input.invalidRowCount > 0 || input.validRowCount === 0
      ? "NEEDS_REVIEW"
      : "READY_TO_CONFIRM";
  }

  private toRepositoryRowUpdate(row: ValidatedImportJobRow) {
    return {
      rowId: row.rowId,
      mappedDataJson: row.mappedData,
      normalizedDataJson: row.normalizedData,
      status: row.status,
      validationErrorsJson: row.validationErrors,
      targetLabel: row.targetLabel,
    };
  }

  private validateUserEditedRow(
    row: ImportJobRowRecord,
    columns: readonly ImportTemplateColumn[],
    targetType: ImportTemplateType,
    input: UpdateImportJobRowInput
  ): ValidatedImportJobRow {
    const rawData = this.normalizeRawData(row.rawDataJson);

    if (input.excluded === true) {
      return {
        rowId: row.id,
        rowNumber: row.rowNumber,
        rawData,
        mappedData: this.normalizeMappedData(row.mappedDataJson),
        normalizedData: null,
        status: "EXCLUDED",
        validationErrors: [],
        targetLabel: null,
      };
    }

    return this.validateMappedDataForRow({
      rowId: row.id,
      rowNumber: row.rowNumber,
      rawData,
      mappedData: this.normalizeMappedData(input.data),
      columns,
      targetType,
    });
  }

  private toValidatedRowFromRecord(row: ImportJobRowRecord): ValidatedImportJobRow {
    return {
      rowId: row.id,
      rowNumber: row.rowNumber,
      rawData: this.normalizeRawData(row.rawDataJson),
      mappedData: this.normalizeMappedData(row.mappedDataJson),
      normalizedData: this.normalizeOptionalSubmittedData(row.normalizedDataJson),
      status: row.status,
      validationErrors: this.normalizeCellValidationErrors(row.validationErrorsJson),
      targetLabel: row.targetLabel,
    };
  }

  private calculateRowSummary(rows: readonly ValidatedImportJobRow[]): {
    readonly validRowCount: number;
    readonly invalidRowCount: number;
  } {
    return {
      validRowCount: rows.filter((row) => row.status === "VALID").length,
      invalidRowCount: rows.filter((row) => row.status === "INVALID").length,
    };
  }

  private validateMappedDataForRow(input: {
    readonly rowId: string;
    readonly rowNumber: number;
    readonly rawData: Readonly<Record<string, string>>;
    readonly mappedData: ImportMappedRowData;
    readonly columns: readonly ImportTemplateColumn[];
    readonly targetType: ImportTemplateType;
  }): ValidatedImportJobRow {
    const normalizedData: Record<string, ImportSubmittedDataValue> = {};
    const validationErrors: ImportCellValidationError[] = [];

    for (const column of input.columns) {
      const result = this.normalizeFieldValue(input.mappedData[column.key], column);
      normalizedData[column.key] = result.value;

      if (result.errorMessage) {
        validationErrors.push({
          fieldKey: column.key,
          message: result.errorMessage,
          code: "InvalidImportField",
        });
      }
    }

    const status: PersistentImportJobRowStatus =
      validationErrors.length > 0 ? "INVALID" : "VALID";
    const normalized =
      validationErrors.length > 0
        ? null
        : (normalizedData as ImportSubmittedData);

    return {
      rowId: input.rowId,
      rowNumber: input.rowNumber,
      rawData: input.rawData,
      mappedData: input.mappedData,
      normalizedData: normalized,
      status,
      validationErrors,
      targetLabel: normalized
        ? this.getTargetLabel(input.targetType, normalized)
        : null,
    };
  }

  private toNormalizedRowValidation(
    rows: readonly ValidatedImportJobRow[]
  ): NormalizedRowValidation {
    const errors = rows.flatMap((row) =>
      row.validationErrors.map((error) => ({
        rowNumber: row.rowNumber,
        message: error.message,
      }))
    );

    return {
      rows,
      ...this.calculateRowSummary(rows),
      errors,
    };
  }

  private mapRawRowData(
    row: ImportJobRowRecord,
    mapping: ImportMapping
  ): ImportMappedRowData {
    const rawData = this.normalizeRawData(row.rawDataJson);

    return Object.fromEntries(
      Object.entries(mapping).map(([fieldKey, sourceColumn]) => [
        fieldKey,
        sourceColumn ? rawData[sourceColumn] ?? "" : "",
      ])
    );
  }

  private async confirmDomainImport(
    targetType: ImportTemplateType,
    input: ConfirmImportRepositoryInput
  ): Promise<ConfirmImportResult> {
    switch (targetType) {
      case "COMPANY":
        return this.importTemplateRepository.confirmCompanyImport(input);
      case "CONTACT":
        return this.importTemplateRepository.confirmContactImport(input);
      case "PRODUCT":
        return this.importTemplateRepository.confirmProductImport(input);
      case "DEAL":
        return this.importTemplateRepository.confirmDealImport(input);
    }
  }

  private async deleteUploadedFileAfterClose(
    currentUser: CurrentUserContext,
    importJobId: string,
    job: ImportJobDetailRecord
  ): Promise<void> {
    if (!job.uploadedFile || job.uploadedFile.deletedAt) {
      return;
    }

    try {
      await this.importUploadedFileStorage.delete({
        storageKey: job.uploadedFile.storageKey,
      });
      await this.importJobRepository.updateUploadedFileStatusForUser({
        userId: currentUser.id,
        importJobId,
        status: "DELETED",
        deletedAt: new Date(),
      });
    } catch {
      await this.importJobRepository.createError({
        userId: currentUser.id,
        importJobId,
        errorType: "STORAGE",
        errorCode: "STORAGE_DELETE_FAILED",
        severity: "WARNING",
        safeMessage: "원본 파일 삭제에 실패했습니다.",
        retryable: true,
      });
      this.logEvent("importJob.fileDeleteFailed", {
        userId: currentUser.id,
        importJobId,
      });
    }
  }

  private toImportFieldValue(value: unknown): ImportFieldValue {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value;
    }

    return value === null ? null : this.toTextValue(value);
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "DataImportApplicationService"
    );
  }

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
    const options = getStringArrayField(value, "options");

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
      ...(options ? { options } : {}),
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

    const companyName = this.toTextValue(input.companyName).trim();

    if (companyName.length === 0) {
      return rows;
    }

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
    const options = this.getColumnOptions(column);

    return {
      header: column.label,
      key: column.key,
      width: this.getColumnWidth(column),
      ...(column.type === "number" ? { numFmt: "#,##0" } : {}),
      ...(options.length > 0
        ? {
            listValidation: {
              values: options,
              allowBlank: !column.required,
              promptTitle: `${column.label} 선택`,
              prompt: `${options.join(", ")} 중 하나를 선택해 주세요.`,
              errorTitle: `${column.label} 값 확인`,
              error: `${options.join(", ")} 중 하나만 입력할 수 있습니다.`,
            },
          }
        : {}),
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
      .replace(/[()[\]{}_\s./\\:：,，-]/g, "")
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
  private validateRowsWithMapping(
    rows: readonly ImportJobRowRecord[],
    columns: readonly ImportTemplateColumn[],
    mapping: ImportMapping,
    targetType: ImportTemplateType
  ): NormalizedRowValidation {
    const missingRequiredColumns = columns.filter(
      (column) => column.required && !mapping[column.key]
    );
    const validatedRows = rows.map((row) => {
      if (row.status === "EXCLUDED") {
        return this.toValidatedRowFromRecord(row);
      }

      const rawData = this.normalizeRawData(row.rawDataJson);
      const mappedData: Record<string, ImportFieldValue> = {};

      for (const column of columns) {
        const sourceColumn = mapping[column.key];
        mappedData[column.key] = sourceColumn ? rawData[sourceColumn] ?? "" : "";
      }

      if (missingRequiredColumns.length > 0) {
        const validationErrors = missingRequiredColumns.map((column) => ({
          fieldKey: column.key,
          message: `${column.label} 컬럼 매칭이 필요합니다.`,
          code: "RequiredImportMappingMissing",
        }));

        return {
          rowId: row.id,
          rowNumber: row.rowNumber,
          rawData,
          mappedData,
          normalizedData: null,
          status: "INVALID" as const,
          validationErrors,
          targetLabel: null,
        };
      }

      return this.validateMappedDataForRow({
        rowId: row.id,
        rowNumber: row.rowNumber,
        rawData,
        mappedData,
        columns,
        targetType,
      });
    });

    return this.toNormalizedRowValidation(validatedRows);
  }

  private validateRowsWithCurrentData(
    rows: readonly ImportJobRowRecord[],
    columns: readonly ImportTemplateColumn[],
    mapping: ImportMapping,
    targetType: ImportTemplateType
  ): NormalizedRowValidation {
    const validatedRows = rows.map((row) => {
      if (row.status === "EXCLUDED") {
        return this.toValidatedRowFromRecord(row);
      }

      const currentData = this.normalizeMappedData(row.mappedDataJson);
      const mappedData =
        Object.keys(currentData).length > 0
          ? currentData
          : this.mapRawRowData(row, mapping);

      return this.validateMappedDataForRow({
        rowId: row.id,
        rowNumber: row.rowNumber,
        rawData: this.normalizeRawData(row.rawDataJson),
        mappedData,
        columns,
        targetType,
      });
    });

    return this.toNormalizedRowValidation(validatedRows);
  }

  private normalizePersistentConfirmRows(
    job: ImportJobDetailRecord,
    columns: readonly ImportTemplateColumn[],
    rows: readonly ConfirmImportJobRowInput[] | undefined
  ): readonly ConfirmReadyRow[] {
    const validRows = job.rows.filter((row) => row.status === "VALID");

    if (validRows.length === 0 || job.rows.some((row) => row.status === "INVALID")) {
      throw new ImportJobNotReadyError();
    }

    const rowsByNumber = new Map(validRows.map((row) => [row.rowNumber, row]));
    const candidateRows =
      rows && rows.length > 0
        ? rows.map((row) => {
            const existing = rowsByNumber.get(row.rowNumber);

            if (!existing) {
              throw new ImportJobRowNotFoundError();
            }

            return {
              rowNumber: row.rowNumber,
              data: row.data,
            };
          })
        : validRows.map((row) => ({
            rowNumber: row.rowNumber,
            data:
              row.normalizedDataJson ??
              row.mappedDataJson ??
              ({} as Readonly<Record<string, unknown>>),
          }));

    return candidateRows.map((row) => {
      if (!Number.isInteger(row.rowNumber) || row.rowNumber < 2) {
        throw new ValidationDomainError("rowNumber가 올바르지 않습니다.");
      }

      const submittedData = this.normalizeSubmittedRowData(
        row.data as Readonly<Record<string, unknown>>,
        columns
      );

      return {
        rowNumber: row.rowNumber,
        submittedData,
        targetLabel: this.getTargetLabel(job.targetType, submittedData),
      };
    });
  }

  private validateJobRows(
    rows: readonly LegacyStoredImportJobRow[],
    columns: readonly ImportTemplateColumn[],
    mapping: ImportMapping
  ): LegacyNormalizedRowValidation {
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

      const status: LegacyImportJobRowStatus =
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
    job: LegacyStoredImportJob,
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

  // 기능 : 담당자 불러오기에서 새 회사 생성에 필요한 보정 값을 정규화합니다.
  private normalizeContactCompanyResolutions(
    resolutions: readonly ConfirmContactCompanyResolutionJobInput[] | undefined
  ) {
    const resolutionMap = new Map<
      string,
      {
        readonly companyName: string;
        readonly companyFieldName: string;
        readonly companyRegionName: string;
      }
    >();

    for (const resolution of resolutions ?? []) {
      const companyName = this.normalizeRequiredText(
        resolution.companyName,
        "새 회사명이 올바르지 않습니다."
      );
      const companyFieldName = this.normalizeRequiredText(
        resolution.companyFieldName,
        `${companyName}의 회사 분야를 입력해 주세요.`
      );
      const companyRegionName = this.normalizeRequiredText(
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

    return [...resolutionMap.values()];
  }

  // 기능 : 딜 불러오기에서 새 회사 생성에 필요한 보정 값을 정규화합니다.
  private normalizeDealCompanyResolutions(
    resolutions: readonly ConfirmDealCompanyResolutionJobInput[] | undefined
  ): readonly ConfirmDealCompanyResolutionInput[] {
    const resolutionMap = new Map<string, ConfirmDealCompanyResolutionInput>();

    for (const resolution of resolutions ?? []) {
      const companyName = this.normalizeRequiredText(
        resolution.companyName,
        "새 회사명이 올바르지 않습니다."
      );
      const companyFieldName = this.normalizeRequiredText(
        resolution.companyFieldName,
        `${companyName}의 회사 분야를 입력해 주세요.`
      );
      const companyRegionName = this.normalizeRequiredText(
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

    return [...resolutionMap.values()];
  }

  // 기능 : 딜 불러오기에서 새 담당자 생성에 필요한 보정 값을 정규화합니다.
  private normalizeDealContactResolutions(
    resolutions: readonly ConfirmDealContactResolutionJobInput[] | undefined
  ): readonly ConfirmDealContactResolutionInput[] {
    const resolutionMap = new Map<string, ConfirmDealContactResolutionInput>();

    for (const resolution of resolutions ?? []) {
      const companyName = this.normalizeRequiredText(
        resolution.companyName,
        "새 담당자의 회사명이 올바르지 않습니다."
      );
      const contactName = this.normalizeRequiredText(
        resolution.contactName,
        `${companyName}의 새 담당자명이 올바르지 않습니다.`
      );
      const contactEmail = this.normalizeDealContactEmail(
        resolution.contactEmail,
        `${companyName} ${contactName} 담당자 이메일 형식이 올바르지 않습니다.`
      );
      const contactPhone = this.normalizeDealContactPhone(
        resolution.contactPhone,
        `${companyName} ${contactName} 담당자 핸드폰 번호 형식이 올바르지 않습니다.`
      );
      const contactDepartmentName = this.normalizeRequiredText(
        resolution.contactDepartmentName,
        `${companyName} ${contactName} 담당자 부서를 입력해 주세요.`
      );
      const contactJobGradeName = this.normalizeRequiredText(
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

    return [...resolutionMap.values()];
  }

  // 기능 : 딜 불러오기에서 새 제품 생성에 필요한 보정 값을 정규화합니다.
  private normalizeDealProductResolutions(
    resolutions: readonly ConfirmDealProductResolutionJobInput[] | undefined
  ): readonly ConfirmDealProductResolutionInput[] {
    const resolutionMap = new Map<string, ConfirmDealProductResolutionInput>();

    for (const resolution of resolutions ?? []) {
      const productName = this.normalizeRequiredText(
        resolution.productName,
        "새 제품명이 올바르지 않습니다."
      );
      const productPrice = this.normalizeDealProductPrice(
        resolution.productPrice,
        `${productName} 제품 가격은 0 이상의 정수여야 합니다.`
      );
      const productCategoryName = this.normalizeRequiredText(
        resolution.productCategoryName,
        `${productName} 제품 카테고리를 입력해 주세요.`
      );
      const productStatusName = this.normalizeRequiredText(
        resolution.productStatusName,
        `${productName} 제품 상태를 입력해 주세요.`
      );

      if (resolutionMap.has(productName)) {
        throw new ValidationDomainError("새 제품 정보에 중복된 제품명이 있습니다.");
      }

      resolutionMap.set(productName, {
        productName,
        productPrice,
        productCategoryName,
        productStatusName,
      });
    }

    return [...resolutionMap.values()];
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
    const options = this.getColumnOptions(column);

    if (column.required && normalized.length === 0) {
      return {
        value: null,
        errorMessage: `${column.label}은(는) 필수입니다.`,
      };
    }

    if (normalized.length > 0 && options.length > 0 && !options.includes(normalized)) {
      return {
        value: null,
        errorMessage: `${column.label}은(는) ${options.join(", ")} 중 하나여야 합니다.`,
      };
    }

    return {
      value: normalized.length > 0 ? normalized : null,
      errorMessage: null,
    };
  }

  // 기능 : 컬럼에 적용할 선택 가능한 문자열 목록을 반환합니다.
  private getColumnOptions(column: ImportTemplateColumn): readonly string[] {
    if (column.options && column.options.length > 0) {
      return column.options;
    }

    if (column.key === "dealStatus") {
      return DEAL_STATUS_TEMPLATE_OPTIONS;
    }

    return [];
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

  // 기능 : 딜 담당자 보정의 이메일 값을 정규화합니다.
  private normalizeDealContactEmail(value: string | undefined, message: string): string {
    const normalized = value?.trim().toLowerCase() ?? "";

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new ValidationDomainError(message);
    }

    return normalized;
  }

  // 기능 : 딜 담당자 보정의 휴대폰 값을 010-0000-0000 형식으로 정규화합니다.
  private normalizeDealContactPhone(value: string | undefined, message: string): string {
    const normalized = value?.trim() ?? "";

    if (MOBILE_PATTERN.test(normalized)) {
      return normalized;
    }

    const digits = normalized.replace(/\D/g, "");

    if (!MOBILE_DIGIT_PATTERN.test(digits)) {
      throw new ValidationDomainError(message);
    }

    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 기능 : 딜 제품 보정의 가격 값을 정규화합니다.
  private normalizeDealProductPrice(value: number, message: string): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationDomainError(message);
    }

    return value;
  }

  // 기능 : 딜 담당자 보정 map key를 생성합니다.
  private createDealContactResolutionKey(
    companyName: string,
    contactName: string
  ): string {
    return `${companyName}\u0000${contactName}`;
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

// 기능 : 객체 필드를 문자열 배열로 읽습니다.
function getStringArrayField(
  value: Record<string, unknown>,
  field: string
): readonly string[] | null {
  const fieldValue = value[field];

  if (!Array.isArray(fieldValue)) {
    return null;
  }

  if (!fieldValue.every((item): item is string => typeof item === "string")) {
    return null;
  }

  return fieldValue;
}
