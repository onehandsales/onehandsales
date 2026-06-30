import type {
  DownloadImportTemplateInput,
  DownloadImportTemplateResponse,
  ImportTemplateListResponse,
} from "@/features/import-export/types/import-template";
import { apiBlobClient, apiClient } from "@/lib/api-client";

// 기능 : 활성화된 데이터 불러오기 양식 목록을 조회합니다.
export function listActiveImportTemplates() {
  return apiClient<ImportTemplateListResponse>("/api/import-templates/active");
}

// 기능 : 선택한 데이터 불러오기 양식 xlsx 파일을 다운로드합니다.
export function downloadImportTemplate(
  input: DownloadImportTemplateInput
): Promise<DownloadImportTemplateResponse> {
  const query = new URLSearchParams();
  const companyName = input.companyName?.trim() ?? "";

  if (companyName) {
    query.set("companyName", companyName);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiBlobClient(
    `/api/import-templates/${input.templateId}/download${suffix}`,
    {
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      method: "GET",
    }
  );
}
