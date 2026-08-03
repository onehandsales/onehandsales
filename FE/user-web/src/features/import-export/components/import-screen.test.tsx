import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api-client";
import { ImportScreen } from "./import-screen";

const mocks = vi.hoisted(() => ({
  useActiveImportJobs: vi.fn(),
  useActiveImportTemplates: vi.fn(),
  useAppI18n: vi.fn(),
  useCreateImportJobMutation: vi.fn(),
  useDownloadImportTemplateMutation: vi.fn(),
  useImportUserLogList: vi.fn(),
}));

vi.mock("@/features/app-i18n", () => ({
  useAppI18n: mocks.useAppI18n,
}));

vi.mock("@/features/import-export/hooks/use-import-export-mutations", () => ({
  useCreateImportJobMutation: mocks.useCreateImportJobMutation,
}));

vi.mock("@/features/import-export/hooks/use-import-export-queries", () => ({
  useActiveImportJobs: mocks.useActiveImportJobs,
}));

vi.mock("@/features/import-export/hooks/use-import-template-queries", () => ({
  useActiveImportTemplates: mocks.useActiveImportTemplates,
  useDownloadImportTemplateMutation: mocks.useDownloadImportTemplateMutation,
  useImportUserLogList: mocks.useImportUserLogList,
}));

describe("ImportScreen", () => {
  beforeEach(() => {
    mocks.useAppI18n.mockReturnValue({
      locale: "ko-KR",
      t: (key: string) =>
        ({
          "importExport.downloadTemplate": "양식 다운로드",
          "importExport.englishTemplate": "영문 양식",
          "importExport.koreanTemplate": "한국어 양식",
          "importExport.templateLanguage": "양식 언어",
          "importExport.templateLanguageHelp": "양식 언어를 선택해요.",
        })[key] ?? key,
    });
    mocks.useActiveImportJobs.mockReturnValue({
      data: { items: [] },
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mocks.useActiveImportTemplates.mockReturnValue({
      data: {
        items: [
          {
            id: "template-1",
            templateName: "company-template.xlsx",
            templateType: "COMPANY",
          },
        ],
      },
      error: null,
      isLoading: false,
    });
    mocks.useImportUserLogList.mockReturnValue({
      data: {
        items: [],
        page: 1,
        pageSize: 15,
        totalCount: 0,
        totalPages: 1,
      },
      error: null,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mocks.useDownloadImportTemplateMutation.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it("shows row limit safe error message on the upload screen", () => {
    mocks.useCreateImportJobMutation.mockReturnValue({
      error: new ApiClientError({
        statusCode: 400,
        code: "ImportRowLimitExceeded",
        message:
          "한 번에 가져올 수 있는 행 수를 초과했어요. 5,000행 이하로 나눠서 다시 올려주세요.",
        raw: null,
      }),
      isPending: false,
      mutateAsync: vi.fn(),
    });

    const html = renderToString(
      <MemoryRouter>
        <ImportScreen />
      </MemoryRouter>
    );

    expect(html).toContain("10MB 이하, 5,000행 이하 파일을 사용할 수 있어요.");
    expect(html).toContain(
      "한 번에 가져올 수 있는 행 수를 초과했어요. 5,000행 이하로 나눠서 다시 올려주세요."
    );
  });
});
