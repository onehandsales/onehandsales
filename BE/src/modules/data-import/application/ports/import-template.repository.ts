export const IMPORT_TEMPLATE_REPOSITORY = Symbol("IMPORT_TEMPLATE_REPOSITORY");

export type ImportTemplateType = "COMPANY" | "CONTACT" | "PRODUCT" | "DEAL";
export type ImportSubmittedDataValue = string | number | boolean | null;
export type ImportSubmittedData = Readonly<Record<string, ImportSubmittedDataValue>>;

// 역할 : ImportTemplateRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ImportTemplateRecord {
  readonly id: string;
  readonly templateType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateName: string;
  readonly columnsJson: unknown;
  readonly sampleRowsJson: unknown;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ImportTemplateRepository 불러오기 양식 조회 영속성 계약을 정의합니다.
export interface ImportTemplateRepository {
  // 기능 : 활성화된 불러오기 양식 목록을 조회합니다.
  listActiveTemplates(): Promise<ImportTemplateRecord[]>;
  // 기능 : 활성화된 불러오기 양식 단건을 조회합니다.
  findActiveTemplateById(
    templateId: string
  ): Promise<ImportTemplateRecord | null>;
  // 기능 : 대상 유형 기준 활성 불러오기 양식 단건을 조회합니다.
  findActiveTemplateByType(
    templateType: ImportTemplateType
  ): Promise<ImportTemplateRecord | null>;
  // 기능 : 현재 사용자의 성공한 불러오기 로그 목록과 전체 개수를 조회합니다.
  listUserLogs(input: ListImportUserLogsInput): Promise<ImportUserLogPageRecord>;
  // 기능 : 현재 사용자의 성공한 불러오기 로그 상세를 조회합니다.
  findUserLog(input: FindImportUserLogInput): Promise<ImportUserLogRecord | null>;
  // 기능 : 회사 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  confirmCompanyImport(input: ConfirmImportInput): Promise<void>;
  // 기능 : 담당자 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  confirmContactImport(input: ConfirmImportInput): Promise<void>;
  // 기능 : 제품 불러오기 확정 생성과 성공 로그 저장을 같은 트랜잭션으로 처리합니다.
  confirmProductImport(input: ConfirmImportInput): Promise<void>;
}

// 역할 : ImportUserLogListRecord 불러오기 로그 목록 항목을 정의합니다.
export interface ImportUserLogListRecord {
  readonly id: string;
  readonly userId: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly contextLabel: string | null;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly importedRowCount: number;
  readonly createdAt: Date;
}

// 역할 : ImportUserLogRowRecord 불러오기 로그 row snapshot을 정의합니다.
export interface ImportUserLogRowRecord {
  readonly id: string;
  readonly rowNumber: number;
  readonly submittedDataJson: unknown;
  readonly targetLabel: string;
  readonly createdAt: Date;
}

// 역할 : ConfirmImportRowInput 확정 저장할 불러오기 row snapshot을 정의합니다.
export interface ConfirmImportRowInput {
  readonly rowNumber: number;
  readonly submittedData: ImportSubmittedData;
  readonly targetLabel: string;
}

// 역할 : 담당자 불러오기 중 새로 생성할 회사의 보정 정보를 정의합니다.
export interface ConfirmContactCompanyResolutionInput {
  readonly companyName: string;
  readonly companyFieldName: string;
  readonly companyRegionName: string;
}

// 역할 : ConfirmImportInput 확정 생성과 성공 로그 저장 입력을 정의합니다.
export interface ConfirmImportInput {
  readonly userId: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateColumnsJson: unknown;
  readonly contextLabel: string | null;
  readonly contextJson: ImportSubmittedData | null;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly rows: readonly ConfirmImportRowInput[];
  readonly contactCompanyResolutions?: readonly ConfirmContactCompanyResolutionInput[];
}

// 역할 : ImportUserLogRecord 불러오기 로그 상세 레코드를 정의합니다.
export interface ImportUserLogRecord extends ImportUserLogListRecord {
  readonly templateColumnsJson: unknown;
  readonly contextJson: unknown;
  readonly rows: ImportUserLogRowRecord[];
}

// 역할 : ImportUserLogPageRecord 불러오기 로그 페이지 조회 결과를 정의합니다.
export interface ImportUserLogPageRecord {
  readonly items: ImportUserLogListRecord[];
  readonly totalCount: number;
}

// 역할 : ListImportUserLogsInput 불러오기 로그 목록 조회 조건을 정의합니다.
export interface ListImportUserLogsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly targetTypes?: readonly ImportTemplateType[];
}

// 역할 : FindImportUserLogInput 불러오기 로그 상세 조회 조건을 정의합니다.
export interface FindImportUserLogInput {
  readonly userId: string;
  readonly importUserLogId: string;
}
