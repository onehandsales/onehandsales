export const importTargetTypes = ["COMPANY", "CONTACT", "PRODUCT", "DEAL"] as const;

export type ImportTargetType = (typeof importTargetTypes)[number];

export type ImportFieldKind = "text" | "number" | "date" | "enum";

export interface ImportTargetField {
  readonly field: string;
  readonly label: string;
  readonly required: boolean;
  readonly kind: ImportFieldKind;
  readonly enumValues?: readonly string[];
}

export const IMPORT_TARGET_FIELD_CONFIG: Record<
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
      enumValues: ["INITIAL_CONTACT", "IN_DISCUSSION", "WON", "LOST"],
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

export function isImportTargetType(value: unknown): value is ImportTargetType {
  return (
    typeof value === "string" &&
    importTargetTypes.includes(value as ImportTargetType)
  );
}

export function getImportTargetFields(
  targetType: ImportTargetType
): readonly ImportTargetField[] {
  return IMPORT_TARGET_FIELD_CONFIG[targetType];
}
