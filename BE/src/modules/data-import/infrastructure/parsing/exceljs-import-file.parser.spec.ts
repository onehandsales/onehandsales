import { ExceljsImportFileParser } from "./exceljs-import-file.parser";
import {
  ImportFileParseFailedError,
  UnsupportedImportFileTypeError,
} from "@/modules/data-import/domain/import-template.errors";

describe("ExceljsImportFileParser", () => {
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
