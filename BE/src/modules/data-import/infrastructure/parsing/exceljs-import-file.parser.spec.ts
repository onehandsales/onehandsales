import * as ExcelJS from "exceljs";
import { ExceljsImportFileParser } from "./exceljs-import-file.parser";
import {
  ImportFileParseFailedError,
  UnsupportedImportFileTypeError,
} from "@/modules/data-import/domain/import-template.errors";

describe("ExceljsImportFileParser", () => {
  it("preserves CSV source column positions and original row numbers", async () => {
    const parser = new ExceljsImportFileParser();
    const content = [
      "companyName,,contactEmail",
      "Acme,,sales@example.com",
      "",
      "Beta,,owner@example.com",
    ].join("\n");

    const parsed = await parser.parse({
      buffer: Buffer.from(content),
      originalname: "source.csv",
      mimetype: "text/csv",
      size: Buffer.byteLength(content),
    });

    expect(parsed.sourceColumns).toEqual(["companyName", "contactEmail"]);
    expect(parsed.rows).toEqual([
      {
        rowNumber: 2,
        rawData: {
          companyName: "Acme",
          contactEmail: "sales@example.com",
        },
      },
      {
        rowNumber: 4,
        rawData: {
          companyName: "Beta",
          contactEmail: "owner@example.com",
        },
      },
    ]);
  });

  it("preserves XLSX source column positions and original row numbers", async () => {
    const parser = new ExceljsImportFileParser();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Companies");
    worksheet.getCell("A1").value = "companyName";
    worksheet.getCell("C1").value = "contactEmail";
    worksheet.getCell("A2").value = "Acme";
    worksheet.getCell("C2").value = "sales@example.com";
    worksheet.getCell("A4").value = "Beta";
    worksheet.getCell("C4").value = "owner@example.com";
    const workbookBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.isBuffer(workbookBuffer)
      ? workbookBuffer
      : Buffer.from(workbookBuffer as ArrayBuffer);

    const parsed = await parser.parse({
      buffer,
      originalname: "source.xlsx",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: buffer.length,
    });

    expect(parsed.sourceColumns).toEqual(["companyName", "contactEmail"]);
    expect(parsed.rows).toEqual([
      {
        rowNumber: 2,
        rawData: {
          companyName: "Acme",
          contactEmail: "sales@example.com",
        },
      },
      {
        rowNumber: 4,
        rawData: {
          companyName: "Beta",
          contactEmail: "owner@example.com",
        },
      },
    ]);
  });

  it("rejects unsupported import file types with the API contract error", async () => {
    const parser = new ExceljsImportFileParser();

    await expect(
      parser.parse({
        buffer: Buffer.from("companyName\nAcme"),
        originalname: "source.txt",
        mimetype: "text/plain",
        size: 16,
      })
    ).rejects.toBeInstanceOf(UnsupportedImportFileTypeError);
  });

  it("rejects unparseable files with the API contract error", async () => {
    const parser = new ExceljsImportFileParser();

    await expect(
      parser.parse({
        buffer: Buffer.from("companyName\n"),
        originalname: "source.csv",
        mimetype: "text/csv",
        size: 12,
      })
    ).rejects.toBeInstanceOf(ImportFileParseFailedError);
  });
});
