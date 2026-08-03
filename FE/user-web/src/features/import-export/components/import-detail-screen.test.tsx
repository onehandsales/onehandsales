import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { ImportUserLogDetail } from "@/features/import-export/types/import-user-log";
import { ImportDetailScreen } from "./import-detail-screen";

const mocks = vi.hoisted(() => ({
  useImportUserLogDetail: vi.fn(),
}));

vi.mock("@/features/import-export/hooks/use-import-template-queries", () => ({
  useImportUserLogDetail: mocks.useImportUserLogDetail,
}));

describe("ImportDetailScreen", () => {
  it("shows retained summary and row retention message when rows are empty", () => {
    mocks.useImportUserLogDetail.mockReturnValue({
      data: createImportUserLogDetail({ rows: [] }),
      isError: false,
      isLoading: false,
    });

    const html = renderToString(
      <MemoryRouter>
        <ImportDetailScreen importUserLogId="import-log-1" />
      </MemoryRouter>
    );

    expect(html).toContain("3건");
    expect(html).toContain("행별 상세 내역은 보관 기간이 지나 정리됐어요.");
    expect(html).toContain("가져오기 요약은 계속 확인할 수 있어요.");
  });
});

function createImportUserLogDetail(
  overrides: Partial<ImportUserLogDetail> = {}
): ImportUserLogDetail {
  return {
    id: "import-log-1",
    targetType: "COMPANY",
    templateVersion: "v1",
    contextLabel: null,
    originalFileName: "source.xlsx",
    fileSizeBytes: 100,
    totalRowCount: 3,
    importedRowCount: 3,
    createdAt: "2026-07-21T00:00:00.000Z",
    templateColumns: [
      {
        key: "companyName",
        label: "회사명",
        required: true,
        type: "text",
      },
    ],
    context: null,
    rows: [],
    ...overrides,
  };
}
