import { Buffer } from "node:buffer";
import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import type {
  XlsxColumnDefinition,
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";

type WorksheetWithDataValidations = ExcelJS.Worksheet & {
  readonly dataValidations: {
    add(address: string, validation: ExcelJS.DataValidation): void;
  };
};

// 역할 : ExceljsXlsxWorkbookWriter ExcelJS 기반 xlsx 파일 생성을 담당합니다.
@Injectable()
export class ExceljsXlsxWorkbookWriter implements XlsxWorkbookWriter {
  // 기능 : 단일 워크시트를 가진 xlsx 파일 Buffer를 생성합니다.
  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "onehand-sales-backend";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(input.sheetName);
    worksheet.columns = input.columns.map((column) =>
      this.toExcelColumn(column)
    );
    worksheet.addRows(input.rows.map((row) => ({ ...row })));
    worksheet.getRow(1).font = { bold: true };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    this.applyListValidations(worksheet, input);

    const data = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(data) ? data : Buffer.from(data);
  }

  // 기능 : application 컬럼 정의를 ExcelJS 컬럼 정의로 변환합니다.
  private toExcelColumn(column: XlsxColumnDefinition): Partial<ExcelJS.Column> {
    return {
      header: column.header,
      key: column.key,
      ...(column.width !== undefined ? { width: column.width } : {}),
      ...(column.numFmt !== undefined
        ? {
            style: {
              numFmt: column.numFmt,
            },
          }
        : {}),
    };
  }

  // 기능 : 목록 제한이 있는 컬럼에 엑셀 드롭다운 검증을 적용합니다.
  private applyListValidations(
    worksheet: ExcelJS.Worksheet,
    input: XlsxWorksheetInput
  ): void {
    input.columns.forEach((column, columnIndex) => {
      const validation = column.listValidation;

      if (!validation || validation.values.length === 0) {
        return;
      }

      const worksheetWithValidations = worksheet as WorksheetWithDataValidations;
      const excelColumnLetter = worksheet.getColumn(columnIndex + 1).letter;
      const rowStart = validation.rowStart ?? 2;
      const rowEnd = validation.rowEnd ?? Math.max(input.rows.length + 1, 1000);
      const formula = `"${validation.values
        .map((value) => value.replaceAll("\"", "\"\""))
        .join(",")}"`;
      const hasPrompt = Boolean(validation.promptTitle || validation.prompt);
      const address = `${excelColumnLetter}${rowStart}:${excelColumnLetter}${rowEnd}`;

      worksheetWithValidations.dataValidations.add(address, {
        type: "list",
        allowBlank: validation.allowBlank ?? false,
        formulae: [formula],
        showInputMessage: hasPrompt,
        ...(validation.promptTitle ? { promptTitle: validation.promptTitle } : {}),
        ...(validation.prompt ? { prompt: validation.prompt } : {}),
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: validation.errorTitle ?? "허용되지 않는 값",
        error: validation.error ?? "목록에 있는 값만 선택해 주세요.",
      });
    });
  }
}
