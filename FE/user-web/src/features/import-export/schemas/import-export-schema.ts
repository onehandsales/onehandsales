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
    { field: "companyName", label: "회사명", required: true, kind: "text" },
    {
      field: "companyFieldName",
      label: "회사분야",
      required: true,
      kind: "text",
    },
    {
      field: "companyRegionName",
      label: "회사지역",
      required: true,
      kind: "text",
    },
  ],
  CONTACT: [
    { field: "companyName", label: "회사명", required: true, kind: "text" },
    { field: "contactName", label: "담당자명", required: true, kind: "text" },
    {
      field: "contactEmail",
      label: "담당자 이메일",
      required: true,
      kind: "text",
    },
    {
      field: "contactPhone",
      label: "담당자 핸드폰 번호",
      required: true,
      kind: "text",
    },
    {
      field: "contactDepartmentName",
      label: "담당자 부서",
      required: true,
      kind: "text",
    },
    {
      field: "contactJobGradeName",
      label: "담당자 직급",
      required: true,
      kind: "text",
    },
  ],
  PRODUCT: [
    { field: "productName", label: "제품명", required: true, kind: "text" },
    { field: "productPrice", label: "제품단가", required: true, kind: "number" },
    {
      field: "productCategoryName",
      label: "제품 카테고리",
      required: true,
      kind: "text",
    },
    {
      field: "productStatusName",
      label: "제품 상태",
      required: true,
      kind: "text",
    },
  ],
  DEAL: [
    { field: "dealName", label: "딜 이름", required: true, kind: "text" },
    { field: "dealCost", label: "딜 금액", required: true, kind: "number" },
    {
      field: "dealStatus",
      label: "딜 단계",
      required: false,
      kind: "enum",
      enumValues: ["초기 접촉", "니즈 확인", "제안/견적", "협상", "성사", "실패"],
    },
    { field: "companyName", label: "회사명", required: true, kind: "text" },
    { field: "contactName", label: "담당자명", required: true, kind: "text" },
    { field: "productName", label: "제품명", required: true, kind: "text" },
    {
      field: "expectedEndDate",
      label: "예상 마감일",
      required: true,
      kind: "date",
    },
  ],
};

const allowedExtensions = new Set(["csv", "xlsx"]);
const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);

export function validateImportFile(file: File | null): string | null {
  if (!file) {
    return "가져올 Excel 또는 CSV 파일을 선택해 주세요.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.has(extension)) {
    return "CSV, XLSX 파일만 올릴 수 있어요.";
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    return "지원하지 않는 파일 형식이에요.";
  }

  if (file.size > IMPORT_MAX_FILE_SIZE_BYTES) {
    return "10MB 이하 파일만 올릴 수 있어요.";
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
