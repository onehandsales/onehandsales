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
    // 1. 이후 단계에서 사용할 workbook 값을 준비한다.
    const workbook = new ExcelJS.Workbook();
    // 2. 현재 단계에서 필요한 동작을 실행한다.
    workbook.creator = "onehand-sales-backend";
    // 3. 현재 단계에서 필요한 동작을 실행한다.
    workbook.created = new Date();

    // 4. 이후 단계에서 사용할 worksheet 값을 준비한다.
    const worksheet = workbook.addWorksheet(input.sheetName);
    // 5. 현재 단계에서 필요한 동작을 실행한다.
    worksheet.columns = input.columns.map((column) =>
      this.toExcelColumn(column)
    );
    // 6. 현재 단계에서 필요한 동작을 실행한다.
    worksheet.addRows(input.rows.map((row) => ({ ...row })));
    // 7. 현재 단계에서 필요한 동작을 실행한다.
    worksheet.getRow(1).font = { bold: true };
    // 8. 현재 단계에서 필요한 동작을 실행한다.
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    // 9. 현재 단계에서 필요한 동작을 실행한다.
    this.applyListValidations(worksheet, input);

    // 10. 비동기 결과를 받아 data에 저장한다.
    const data = await workbook.xlsx.writeBuffer();
    // 11. 계산된 결과를 호출자에게 반환한다.
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
      // 1. 이후 단계에서 사용할 validation 값을 준비한다.
      const validation = column.listValidation;

      // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (!validation || validation.values.length === 0) {
        return;
      }

      // 3. 이후 단계에서 사용할 worksheetWithValidations 값을 준비한다.
      const worksheetWithValidations = worksheet as WorksheetWithDataValidations;
      // 4. 이후 단계에서 사용할 excelColumnLetter 값을 준비한다.
      const excelColumnLetter = worksheet.getColumn(columnIndex + 1).letter;
      // 5. 이후 단계에서 사용할 rowStart 값을 준비한다.
      const rowStart = validation.rowStart ?? 2;
      // 6. 이후 단계에서 사용할 rowEnd 값을 준비한다.
      const rowEnd = validation.rowEnd ?? Math.max(input.rows.length + 1, 1000);
      // 7. 이후 단계에서 사용할 formula 값을 준비한다.
      const formula = `"${validation.values
        .map((value) => value.replaceAll("\"", "\"\""))
        .join(",")}"`;
      // 8. 이후 단계에서 사용할 hasPrompt 값을 준비한다.
      const hasPrompt = Boolean(validation.promptTitle || validation.prompt);
      // 9. 이후 단계에서 사용할 address 값을 준비한다.
      const address = `${excelColumnLetter}${rowStart}:${excelColumnLetter}${rowEnd}`;

      // 10. 현재 단계에서 필요한 동작을 실행한다.
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
