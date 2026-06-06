import { extname } from "node:path";
import * as XLSX from "xlsx";
import type {
  ImportFileParserInput,
  ImportFileParserPort,
  ParsedImportFile,
} from "@/modules/import-export/application/ports/import-file-parser.port";
import { InvalidImportFileError } from "@/modules/import-export/domain/import-export.errors";

export class XlsxImportFileParserAdapter implements ImportFileParserPort {
  async parse(input: ImportFileParserInput): Promise<ParsedImportFile> {
    if (isCsvFile(input)) {
      return parseMatrix(parseCsv(input.buffer.toString("utf8")));
    }

    const workbook = XLSX.read(input.buffer, {
      type: "buffer",
      raw: false,
      cellDates: false,
    });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new InvalidImportFileError("Import file does not contain a sheet");
    }

    const sheet = workbook.Sheets[firstSheetName];

    if (!sheet) {
      throw new InvalidImportFileError("Import file does not contain a sheet");
    }

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    return parseMatrix(matrix);
  }
}

function isCsvFile(input: ImportFileParserInput): boolean {
  return (
    extname(input.fileName).toLowerCase() === ".csv" ||
    input.contentType === "text/csv" ||
    input.contentType === "application/csv"
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] ?? "";
    const next = text[index + 1] ?? "";

    if (character === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && next === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (inQuotes) {
    throw new InvalidImportFileError("CSV quotes are not closed");
  }

  return rows;
}

function parseMatrix(matrix: readonly unknown[][]): ParsedImportFile {
  if (matrix.length === 0) {
    throw new InvalidImportFileError("Import file is empty");
  }

  const headerRow = matrix[0] ?? [];
  const sourceColumns = headerRow.map(cellToText).filter(Boolean);

  if (sourceColumns.length === 0) {
    throw new InvalidImportFileError("Import file header is empty");
  }

  assertUniqueColumns(sourceColumns);

  const rows = matrix
    .slice(1)
    .map((cells, index) => createParsedRow(sourceColumns, cells, index + 2))
    .filter((row) =>
      Object.values(row.rawData).some((value) => value.trim().length > 0)
    );

  if (rows.length === 0) {
    throw new InvalidImportFileError("Import file has no data rows");
  }

  return {
    sourceColumns,
    rows,
  };
}

function createParsedRow(
  sourceColumns: readonly string[],
  cells: readonly unknown[],
  rowNumber: number
) {
  const rawData = Object.fromEntries(
    sourceColumns.map((column, index) => [column, cellToText(cells[index])])
  );

  return { rowNumber, rawData };
}

function assertUniqueColumns(sourceColumns: readonly string[]): void {
  const seen = new Set<string>();

  for (const column of sourceColumns) {
    if (seen.has(column)) {
      throw new InvalidImportFileError(`Duplicate import column: ${column}`);
    }

    seen.add(column);
  }
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value).trim();
}
