import { InvalidImportFileError } from "@/modules/import-export/domain/import-export.errors";
import { XlsxImportFileParserAdapter } from "./xlsx-import-file-parser.adapter";

describe("XlsxImportFileParserAdapter", () => {
  it("parses UTF-8 Korean CSV without corrupting headers", async () => {
    const parser = new XlsxImportFileParserAdapter();

    const parsed = await parser.parse({
      targetType: "COMPANY",
      fileName: "companies.csv",
      contentType: "text/csv",
      buffer: Buffer.from("회사명,업종\n한빛리빙,생활가전", "utf8"),
    });

    expect(parsed.sourceColumns).toEqual(["회사명", "업종"]);
    expect(parsed.rows[0]).toMatchObject({
      rowNumber: 2,
      rawData: { 회사명: "한빛리빙", 업종: "생활가전" },
    });
  });

  it("keeps quoted CSV commas inside the same cell", async () => {
    const parser = new XlsxImportFileParserAdapter();

    const parsed = await parser.parse({
      targetType: "COMPANY",
      fileName: "companies.csv",
      contentType: "text/csv",
      buffer: Buffer.from('회사명,설명\n한빛리빙,"서울, 경기 담당"', "utf8"),
    });

    expect(parsed.rows[0]?.rawData.설명).toBe("서울, 경기 담당");
  });

  it("rejects duplicate headers", async () => {
    const parser = new XlsxImportFileParserAdapter();

    await expect(
      parser.parse({
        targetType: "COMPANY",
        fileName: "companies.csv",
        contentType: "text/csv",
        buffer: Buffer.from("회사명,회사명\n한빛리빙,중복", "utf8"),
      })
    ).rejects.toBeInstanceOf(InvalidImportFileError);
  });
});
