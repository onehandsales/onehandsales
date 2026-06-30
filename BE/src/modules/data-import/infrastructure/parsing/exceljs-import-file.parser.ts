import * as ExcelJS from "exceljs";
import type {
  ImportFileParser,
  ImportUploadedFile,
  ParsedImportFile,
  ParsedImportRow,
} from "@/modules/data-import/application/ports/import-file-parser.port";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["csv", "xlsx"]);
type ExceljsWorkbookBuffer = Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];

// 역할 : ExceljsImportFileParser CSV/XLS/XLSX 파일을 미리보기 데이터로 파싱합니다.
export class ExceljsImportFileParser implements ImportFileParser {
  // 기능 : 업로드 파일 확장자에 맞춰 첫 번째 시트를 원본 row로 변환합니다.
  async parse(file: ImportUploadedFile): Promise<ParsedImportFile> {
    this.assertFile(file);

    if (this.getExtension(file.originalname) === "csv") {
      return this.parseCsv(file.buffer.toString("utf8"));
    }

    return this.parseWorkbook(file.buffer);
  }

  private assertFile(file: ImportUploadedFile): void {
    if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
      throw new ValidationDomainError("불러오기 파일이 비어 있습니다.");
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      throw new ValidationDomainError("10MB 이하 파일만 업로드할 수 있습니다.");
    }

    const extension = this.getExtension(file.originalname);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new ValidationDomainError("CSV, XLSX 파일만 업로드할 수 있습니다.");
    }
  }

  private async parseWorkbook(buffer: Buffer): Promise<ParsedImportFile> {
    const workbook = new ExcelJS.Workbook();
    const workbookBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ExceljsWorkbookBuffer;
    await workbook.xlsx.load(workbookBuffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new ValidationDomainError("첫 번째 시트를 찾을 수 없습니다.");
    }

    const matrix: string[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      matrix.push(values.map((value) => this.cellToString(value)));
    });

    return this.toParsedFile(matrix);
  }

  private parseCsv(content: string): ParsedImportFile {
    const rows = content
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => this.parseCsvLine(line));

    return this.toParsedFile(rows);
  }

  private toParsedFile(matrix: readonly string[][]): ParsedImportFile {
    const headerRow = matrix[0]?.map((cell) => cell.trim()) ?? [];
    const sourceColumns = headerRow.filter((column) => column.length > 0);

    if (sourceColumns.length === 0) {
      throw new ValidationDomainError("헤더 row가 필요합니다.");
    }

    const seenColumns = new Set<string>();
    for (const column of sourceColumns) {
      if (seenColumns.has(column)) {
        throw new ValidationDomainError(`중복된 헤더가 있습니다: ${column}`);
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
      throw new ValidationDomainError("불러올 데이터 row가 없습니다.");
    }

    return { sourceColumns, rows };
  }

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

  private isFormulaValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellFormulaValue {
    return typeof value === "object" && value !== null && "formula" in value;
  }

  private isRichTextValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellRichTextValue {
    return typeof value === "object" && value !== null && "richText" in value;
  }

  private isHyperlinkValue(
    value: ExcelJS.CellValue
  ): value is ExcelJS.CellHyperlinkValue {
    return typeof value === "object" && value !== null && "hyperlink" in value;
  }

  private getExtension(fileName: string): string {
    return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
  }
}
