import type {
  ConfirmImportJobInput,
  CreateImportJobInput,
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
        confirm: true,
      },
    }
  );
}

export function getImportJob(importJobId: string) {
  return apiClient<ImportJobDetailResponse>(`/api/imports/${importJobId}`);
}
