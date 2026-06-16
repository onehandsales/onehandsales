import type {
  ExportFormat,
  ExportTargetType,
  ImportMapping,
  ImportTargetType,
} from "@/features/import-export/types/import-export";

export const IMPORT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const importTargetOptions: readonly {
  readonly value: ImportTargetType;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "COMPANY", label: "회사", description: "회사명과 기본 속성" },
  { value: "CONTACT", label: "담당자", description: "담당자와 연락처" },
  { value: "PRODUCT", label: "제품", description: "제품명과 가격" },
  { value: "DEAL", label: "딜", description: "영업 건과 금액" },
];

export const exportTargetOptions: readonly {
  readonly value: ExportTargetType;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "COMPANY", label: "회사", description: "회사 목록" },
  { value: "CONTACT", label: "담당자", description: "담당자 목록" },
  { value: "PRODUCT", label: "제품", description: "제품 목록" },
  { value: "DEAL", label: "딜", description: "영업 건 목록" },
  { value: "SCHEDULE", label: "일정", description: "일정 목록" },
  { value: "MEETING_NOTE", label: "회의록", description: "회의 기록" },
];

export const exportFormatOptions: readonly {
  readonly value: ExportFormat;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: "EXCEL", label: "Excel", description: "표 계산용 XLSX" },
  { value: "PDF", label: "PDF", description: "공유용 문서" },
];

export type ImportTargetFieldKind = "text" | "number" | "date" | "enum";

export type ImportTargetField = {
  readonly field: string;
  readonly label: string;
  readonly required: boolean;
  readonly kind: ImportTargetFieldKind;
  readonly enumValues?: readonly string[];
};

export const importTargetFields: Record<
  ImportTargetType,
  readonly ImportTargetField[]
> = {
  COMPANY: [
    { field: "name", label: "회사명", required: true, kind: "text" },
    { field: "industry", label: "업종", required: false, kind: "text" },
    { field: "region", label: "지역", required: false, kind: "text" },
    { field: "address", label: "주소", required: false, kind: "text" },
    { field: "website", label: "웹사이트", required: false, kind: "text" },
    { field: "description", label: "설명", required: false, kind: "text" },
  ],
  CONTACT: [
    { field: "name", label: "담당자명", required: true, kind: "text" },
    { field: "companyName", label: "회사명", required: false, kind: "text" },
    { field: "department", label: "부서", required: false, kind: "text" },
    { field: "position", label: "직책", required: false, kind: "text" },
    { field: "phone", label: "전화번호", required: false, kind: "text" },
    { field: "email", label: "이메일", required: false, kind: "text" },
    { field: "address", label: "주소", required: false, kind: "text" },
  ],
  PRODUCT: [
    { field: "name", label: "제품명", required: true, kind: "text" },
    { field: "category", label: "카테고리", required: false, kind: "text" },
    { field: "unitPrice", label: "단가", required: false, kind: "number" },
    { field: "currency", label: "통화", required: false, kind: "text" },
    { field: "description", label: "설명", required: false, kind: "text" },
  ],
  DEAL: [
    { field: "title", label: "딜명", required: true, kind: "text" },
    { field: "companyName", label: "회사명", required: false, kind: "text" },
    { field: "contactName", label: "담당자명", required: false, kind: "text" },
    { field: "amount", label: "금액", required: false, kind: "number" },
    { field: "currency", label: "통화", required: false, kind: "text" },
    {
      field: "stage",
      label: "단계",
      required: false,
      kind: "enum",
      enumValues: ["INITIAL_CONTACT", "NEEDS_ANALYSIS", "PROPOSAL", "NEGOTIATION", "WON", "LOST"],
    },
    {
      field: "likelihoodStatus",
      label: "가능성",
      required: false,
      kind: "enum",
      enumValues: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
    },
    { field: "likelihoodPercent", label: "가능성 %", required: false, kind: "number" },
    { field: "expectedCloseDate", label: "예상 종료일", required: false, kind: "date" },
    { field: "nextActionText", label: "다음 행동", required: false, kind: "text" },
    { field: "nextActionDueAt", label: "다음 행동 기한", required: false, kind: "date" },
  ],
};

const allowedExtensions = new Set(["csv", "xls", "xlsx"]);
const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);

export function validateImportFile(file: File | null): string | null {
  if (!file) {
    return "가져올 Excel 또는 CSV 파일을 선택해주세요.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.has(extension)) {
    return "CSV, XLS, XLSX 파일만 업로드할 수 있습니다.";
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    return "지원하지 않는 파일 형식입니다.";
  }

  if (file.size > IMPORT_MAX_FILE_SIZE_BYTES) {
    return "파일 용량은 10MB 이하여야 합니다.";
  }

  return null;
}

export function createEmptyMapping(targetType: ImportTargetType): ImportMapping {
  return Object.fromEntries(
    importTargetFields[targetType].map((field) => [field.field, null])
  );
}

export function hasRequiredMapping(
  targetType: ImportTargetType,
  mapping: ImportMapping
) {
  return importTargetFields[targetType]
    .filter((field) => field.required)
    .every((field) => Boolean(mapping[field.field]));
}
