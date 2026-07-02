import { Buffer } from "node:buffer";

export const XLSX_WORKBOOK_WRITER = Symbol("XLSX_WORKBOOK_WRITER");

export type XlsxCellValue = string | number | Date | null;
export type XlsxRow = Readonly<Record<string, XlsxCellValue>>;

// 역할 : XlsxColumnDefinition xlsx 컬럼 설정을 정의합니다.
export interface XlsxColumnDefinition {
  readonly header: string;
  readonly key: string;
  readonly width?: number;
  readonly numFmt?: string;
  readonly listValidation?: XlsxListValidationDefinition;
}

// 역할 : xlsx 셀에서 허용할 목록 값을 정의합니다.
export interface XlsxListValidationDefinition {
  readonly values: readonly string[];
  readonly allowBlank?: boolean;
  readonly promptTitle?: string;
  readonly prompt?: string;
  readonly errorTitle?: string;
  readonly error?: string;
  readonly rowStart?: number;
  readonly rowEnd?: number;
}

// 역할 : XlsxWorksheetInput 단일 워크시트 생성 입력을 정의합니다.
export interface XlsxWorksheetInput {
  readonly sheetName: string;
  readonly columns: readonly XlsxColumnDefinition[];
  readonly rows: readonly XlsxRow[];
}

// 역할 : XlsxWorkbookWriter xlsx 파일 생성을 위한 application port를 정의합니다.
export interface XlsxWorkbookWriter {
  // 기능 : 워크시트 입력을 xlsx 파일 Buffer로 변환합니다.
  writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer>;
}
