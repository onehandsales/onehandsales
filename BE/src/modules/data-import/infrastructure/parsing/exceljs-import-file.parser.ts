import * as ExcelJS from "exceljs";
import type {
  ImportFileParser,
  ImportUploadedFile,
  ParsedImportFile,
  ParsedImportRow,
} from "@/modules/data-import/application/ports/import-file-parser.port";
import {
  ImportFileParseFailedError,
  UnsupportedImportFileTypeError,
} from "@/modules/data-import/domain/import-template.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { DomainError } from "@/shared/domain/errors/domain-error";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["csv", "xlsx"]);

// 역할 : ExceljsWorkbookBuffer ExcelJS workbook load가 받는 buffer 입력 타입을 정의합니다.
type ExceljsWorkbookBuffer = Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];

// 역할 : ExceljsImportFileParser CSV/XLSX 파일을 미리보기 데이터로 파싱합니다.
export class ExceljsImportFileParser implements ImportFileParser {
  // 기능 : 업로드 파일 확장자에 맞춰 첫 번째 시트를 원본 row로 변환합니다.
  async parse(file: ImportUploadedFile): Promise<ParsedImportFile> {
    this.assertFile(file);

    try {
      if (this.getExtension(file.originalname) === "csv") {
        return this.parseCsv(file.buffer.toString("utf8"));
      }

      return this.parseWorkbook(file.buffer);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw new ImportFileParseFailedError();
    }
  }

  // 기능 : 업로드 파일 존재 여부, 크기, 확장자를 검증합니다.
  private assertFile(file: ImportUploadedFile): void {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new ValidationDomainError("불러오기 파일이 비어 있습니다.");
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      throw new ValidationDomainError("10MB 이하 파일만 업로드할 수 있습니다.");
    }

    const extension = this.getExtension(file.originalname);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new UnsupportedImportFileTypeError();
    }
  }

  // 기능 : XLSX workbook의 첫 번째 worksheet를 import row matrix로 변환합니다.
  private async parseWorkbook(buffer: Buffer): Promise<ParsedImportFile> {
    const workbook = new ExcelJS.Workbook();
    const workbookBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ExceljsWorkbookBuffer;
    await workbook.xlsx.load(workbookBuffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new ImportFileParseFailedError();
    }

    const matrix: string[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      matrix.push(values.map((value) => this.cellToString(value)));
    });

    return this.toParsedFile(matrix);
  }

  // 기능 : CSV 문자열을 import row matrix로 변환합니다.
  private parseCsv(content: string): ParsedImportFile {
    const rows = content
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => this.parseCsvLine(line));

    return this.toParsedFile(rows);
  }

  // 기능 : header matrix를 source column과 raw row 구조로 변환합니다.
  private toParsedFile(matrix: readonly string[][]): ParsedImportFile {
    const headerRow = matrix[0]?.map((cell) => cell.trim()) ?? [];
    const sourceColumns = headerRow.filter((column) => column.length > 0);

    if (sourceColumns.length === 0) {
      throw new ImportFileParseFailedError();
    }

    const seenColumns = new Set<string>();
    for (const column of sourceColumns) {
      if (seenColumns.has(column)) {
        throw new ImportFileParseFailedError();
      }
      seenColumns.add(column);
    }

    const rows: ParsedImportRow[] = [];

    matrix.slice(1).forEach((line, index) => {
      const rawData = Object.fromEntries(
        sourceColumns.map((column, columnIndex) => [
          column,
          line[columnIndex]?.trim() ?? "",
        ])
      );

      if (Object.values(rawData).every((value) => value.length === 0)) {
        return;
      }

      rows.push({
        rowNumber: index + 2,
        rawData,
      });
    });

    if (rows.length === 0) {
      throw new ImportFileParseFailedError();
    }

    return { sourceColumns, rows };
  }

  // 기능 : quote escape를 고려해 CSV 한 줄을 cell 문자열 배열로 파싱합니다.
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index] ?? "";
      const nextChar = line[index + 1] ?? "";

      if (char === "\"" && inQuotes && nextChar === "\"") {
        current += "\"";
        index += 1;
        continue;
      }

      if (char === "\"") {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current);
    return values;
  }

  // 기능 : ExcelJS cell 값을 import 미리보기용 문자열로 변환합니다.
  private cellToString(value: ExcelJS.CellValue): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (this.isFormulaValue(value)) {
      return this.cellToString(value.result ?? null);
    }

    if (this.isRichTextValue(value)) {
      return value.richText.map((part) => part.text).join("");
    }

    if (this.isHyperlinkValue(value)) {
      return value.text;
    }

    return String(value);
  }

  // 기능 : ExcelJS cell 값이 수식 cell인지 확인합니다.
  private isFormulaValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellFormulaValue {
    return typeof value === "object" && value !== null && "formula" in value;
  }

  // 기능 : ExcelJS cell 값이 rich text cell인지 확인합니다.
  private isRichTextValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellRichTextValue {
    return typeof value === "object" && value !== null && "richText" in value;
  }

  // 기능 : ExcelJS cell 값이 hyperlink cell인지 확인합니다.
  private isHyperlinkValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellHyperlinkValue {
    return typeof value === "object" && value !== null && "hyperlink" in value;
  }

  // 기능 : 파일명에서 소문자 확장자를 추출합니다.
  private getExtension(fileName: string): string {
    return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
  }
}
