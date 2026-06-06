import { extname } from "node:path";
import {
  getImportTargetFields,
  isImportTargetType,
  type ImportTargetField,
  type ImportTargetType,
} from "@/modules/import-export/application/import-target-fields";
import type {
  ImportFieldValue,
  ImportMappedRowData,
  ImportRawRowData,
  UpdateImportMappingRowInput,
} from "@/modules/import-export/application/ports/import-export.repository";
import type { ImportMapping } from "@/modules/import-export/application/ports/import-mapping.port";
import {
  ImportRowLimitExceededError,
  InvalidImportFileError,
  ValidationError,
} from "@/modules/import-export/domain/import-export.errors";

export const IMPORT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const IMPORT_MAX_ROW_COUNT = 1000;

const allowedExtensions = new Set([".csv", ".xlsx", ".xls"]);
const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export interface UploadedImportFile {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
  readonly size: number;
}

export function normalizeImportTargetType(value: unknown): ImportTargetType {
  if (!isImportTargetType(value)) {
    throw new ValidationError("targetType must be COMPANY, CONTACT, PRODUCT, or DEAL");
  }

  return value;
}

export function validateImportFile(
  file: UploadedImportFile | undefined
): UploadedImportFile {
  if (!file) {
    throw new InvalidImportFileError("Import file is required");
  }

  const extension = extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    throw new InvalidImportFileError("Only CSV, XLS, and XLSX files are supported");
  }

  if (file.mimetype && !allowedMimeTypes.has(file.mimetype)) {
    throw new InvalidImportFileError("Invalid import file content type");
  }

  if (file.size > IMPORT_MAX_FILE_SIZE_BYTES) {
    throw new InvalidImportFileError("Import file must be 10MB or smaller");
  }

  return file;
}

export function assertImportRowCount(rowCount: number): void {
  if (rowCount > IMPORT_MAX_ROW_COUNT) {
    throw new ImportRowLimitExceededError(
      `Import supports up to ${IMPORT_MAX_ROW_COUNT} rows`
    );
  }
}

export function normalizeImportMapping(
  targetType: ImportTargetType,
  sourceColumns: readonly string[],
  mapping: unknown
): ImportMapping {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    throw new ValidationError("mapping must be an object");
  }

  const mappingRecord = mapping as Record<string, unknown>;
  const targetFields = getImportTargetFields(targetType);
  const targetFieldNames = new Set(targetFields.map((field) => field.field));
  const sourceColumnNames = new Set(sourceColumns);
  const normalized: ImportMapping = {};

  for (const [field, sourceColumn] of Object.entries(mappingRecord)) {
    if (!targetFieldNames.has(field)) {
      throw new ValidationError(`Unknown import target field: ${field}`);
    }

    if (sourceColumn === null || sourceColumn === undefined || sourceColumn === "") {
      normalized[field] = null;
      continue;
    }

    if (typeof sourceColumn !== "string") {
      throw new ValidationError(`mapping.${field} must be a string or null`);
    }

    const trimmedSourceColumn = sourceColumn.trim();

    if (!sourceColumnNames.has(trimmedSourceColumn)) {
      throw new ValidationError(
        `mapping.${field} must reference an uploaded source column`
      );
    }

    normalized[field] = trimmedSourceColumn;
  }

  for (const field of targetFields) {
    if (!(field.field in normalized)) {
      normalized[field.field] = null;
    }

    if (field.required && !normalized[field.field]) {
      throw new ValidationError(`${field.field} mapping is required`);
    }
  }

  return normalized;
}

export function mapAndValidateImportRows(
  targetType: ImportTargetType,
  mapping: ImportMapping,
  rows: readonly {
    readonly id: string;
    readonly rowNumber: number;
    readonly rawData: ImportRawRowData;
  }[]
): UpdateImportMappingRowInput[] {
  const targetFields = getImportTargetFields(targetType);

  return rows.map((row) => {
    const validation = mapAndValidateRow(targetFields, mapping, row.rawData);

    return {
      rowId: row.id,
      mappedData: validation.mappedData,
      status: validation.errors.length > 0 ? "VALIDATION_FAILED" : "VALID",
      errorMessage:
        validation.errors.length > 0 ? validation.errors.join("; ") : null,
    };
  });
}

function mapAndValidateRow(
  targetFields: readonly ImportTargetField[],
  mapping: ImportMapping,
  rawData: ImportRawRowData
): { readonly mappedData: ImportMappedRowData; readonly errors: string[] } {
  const mappedData: ImportMappedRowData = {};
  const errors: string[] = [];

  for (const targetField of targetFields) {
    const sourceColumn = mapping[targetField.field] ?? null;
    const rawValue = sourceColumn ? rawData[sourceColumn] ?? "" : "";
    const parsed = parseImportFieldValue(targetField, rawValue);

    mappedData[targetField.field] = parsed.value;

    if (parsed.error) {
      errors.push(parsed.error);
    }

    if (targetField.required && isEmptyImportValue(parsed.value)) {
      errors.push(`${targetField.field} is required`);
    }
  }

  return { mappedData, errors };
}

function parseImportFieldValue(
  field: ImportTargetField,
  rawValue: string
): { readonly value: ImportFieldValue; readonly error: string | null } {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return { value: null, error: null };
  }

  if (field.kind === "number") {
    const numeric = Number(trimmed.replaceAll(",", ""));

    if (Number.isNaN(numeric)) {
      return { value: null, error: `${field.field} must be a number` };
    }

    return { value: numeric, error: null };
  }

  if (field.kind === "date") {
    const date = new Date(trimmed);

    if (Number.isNaN(date.getTime())) {
      return { value: null, error: `${field.field} must be a valid date` };
    }

    return { value: date.toISOString(), error: null };
  }

  if (field.kind === "enum") {
    const enumValue = normalizeImportEnumValue(field, trimmed);

    if (!enumValue) {
      return { value: null, error: `${field.field} has an unsupported value` };
    }

    return { value: enumValue, error: null };
  }

  return { value: trimmed, error: null };
}

function normalizeImportEnumValue(
  field: ImportTargetField,
  value: string
): string | null {
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_");
  const aliases: Record<string, string> = {
    "초기_접촉": "INITIAL_CONTACT",
    초기접촉: "INITIAL_CONTACT",
    협의중: "IN_DISCUSSION",
    성사: "WON",
    성공: "WON",
    실패: "LOST",
    긍정: "POSITIVE",
    보통: "NEUTRAL",
    중립: "NEUTRAL",
    부정: "NEGATIVE",
  };
  const enumValue = aliases[value.trim()] ?? aliases[normalized] ?? normalized;

  return field.enumValues?.includes(enumValue) ? enumValue : null;
}

function isEmptyImportValue(value: ImportFieldValue): boolean {
  return value === null || value === "";
}
