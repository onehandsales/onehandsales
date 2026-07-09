import type {
  ConfirmImportJobInput,
  CreateExportJobInput,
  CreateImportJobInput,
  DownloadExportFileInput,
  ExportDownloadResponse,
  ExportJobResponse,
  ImportJobDetailResponse,
  ImportJobResponse,
  ImportJobResultResponse,
  ImportMappingResponse,
  UpdateImportMappingInput,
} from "@/features/import-export/types/import-export";
import { apiClient } from "@/lib/api-client";

export function createImportJob(input: CreateImportJobInput) {
  const formData = new FormData();
  formData.append("targetType", input.targetType);
  formData.append("file", input.file);

  return apiClient<ImportJobResponse>("/api/imports", {
    method: "POST",
    body: formData,
  });
}

export function generateImportMapping(importJobId: string) {
  return apiClient<ImportMappingResponse>(`/api/imports/${importJobId}/map`, {
    method: "POST",
  });
}

export function updateImportMapping(input: UpdateImportMappingInput) {
  return apiClient<ImportJobResponse>(
    `/api/imports/${input.importJobId}/mapping`,
    {
      method: "PATCH",
      body: {
        mapping: input.mapping,
      },
    }
  );
}

export function confirmImportJob(input: ConfirmImportJobInput) {
  return apiClient<ImportJobResultResponse>(
    `/api/imports/${input.importJobId}/confirm`,
    {
      method: "POST",
      body: {
        contactCompanyResolutions: input.contactCompanyResolutions,
        dealCompanyResolutions: input.dealCompanyResolutions,
        dealContactResolutions: input.dealContactResolutions,
        dealProductResolutions: input.dealProductResolutions,
        rows: input.rows,
      },
    }
  );
}

export function getImportJob(importJobId: string) {
  return apiClient<ImportJobDetailResponse>(`/api/imports/${importJobId}`);
}

export function createExportJob(input: CreateExportJobInput) {
  return apiClient<ExportJobResponse>("/api/exports", {
    method: "POST",
    body: {
      targetType: input.targetType,
      format: input.format,
      includeSensitiveData: input.includeSensitiveData,
      sensitiveConfirm: input.sensitiveConfirm,
      filters: input.filters,
    },
  });
}

export function getExportJob(exportJobId: string) {
  return apiClient<ExportJobResponse>(`/api/exports/${exportJobId}`);
}

export function downloadExportFile(input: DownloadExportFileInput) {
  return apiClient<ExportDownloadResponse>(
    `/api/exports/${input.exportJobId}/download`
  );
}
