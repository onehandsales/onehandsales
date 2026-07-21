import type {
  ActiveImportJobsResponse,
  CancelImportJobInput,
  ConfirmImportJobInput,
  ConfirmImportJobResponse,
  CreateExportJobInput,
  CreateImportJobInput,
  DownloadExportFileInput,
  ExportDownloadResponse,
  ExportJobResponse,
  GenerateImportMappingInput,
  GetImportJobInput,
  ImportJobDetailResponse,
  ImportJobErrorsResponse,
  ListActiveImportJobsParams,
  ListImportJobErrorsInput,
  UpdateImportJobRowsInput,
  UpdateImportMappingInput,
} from "@/features/import-export/types/import-export";
import { apiClient } from "@/lib/api-client";

export function listActiveImportJobs(params: ListActiveImportJobsParams = {}) {
  const query = new URLSearchParams();

  if (params.targetType) {
    query.set("targetType", params.targetType);
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiClient<ActiveImportJobsResponse>(`/api/imports/active${suffix}`);
}

export function createImportJob(input: CreateImportJobInput) {
  const formData = new FormData();
  formData.append("targetType", input.targetType);
  formData.append("file", input.file);

  return apiClient<ImportJobDetailResponse>("/api/imports", {
    method: "POST",
    body: formData,
  });
}

export function getImportJob(input: GetImportJobInput) {
  const query = new URLSearchParams();

  if (input.includeErrors === true) {
    query.set("includeErrors", "true");
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiClient<ImportJobDetailResponse>(
    `/api/imports/${input.importJobId}${suffix}`
  );
}

export function generateImportMapping(input: GenerateImportMappingInput) {
  return apiClient<ImportJobDetailResponse>(
    `/api/imports/${input.importJobId}/map`,
    {
      method: "POST",
      body:
        input.preferredSource === undefined
          ? {}
          : { preferredSource: input.preferredSource },
    }
  );
}

export function updateImportMapping(input: UpdateImportMappingInput) {
  return apiClient<ImportJobDetailResponse>(
    `/api/imports/${input.importJobId}/mapping`,
    {
      method: "PATCH",
      body: {
        mapping: input.mapping,
      },
    }
  );
}

export function updateImportJobRows(input: UpdateImportJobRowsInput) {
  return apiClient<ImportJobDetailResponse>(
    `/api/imports/${input.importJobId}/rows`,
    {
      method: "PATCH",
      body: {
        rows: input.rows,
      },
    }
  );
}

export function validateImportJob(importJobId: string) {
  return apiClient<ImportJobDetailResponse>(
    `/api/imports/${importJobId}/validate`,
    {
      method: "POST",
      body: {},
    }
  );
}

export function confirmImportJob(input: ConfirmImportJobInput) {
  return apiClient<ConfirmImportJobResponse>(
    `/api/imports/${input.importJobId}/confirm`,
    {
      method: "POST",
      body:
        input.idempotencyKey === undefined
          ? {}
          : { idempotencyKey: input.idempotencyKey },
    }
  );
}

export function cancelImportJob(input: CancelImportJobInput) {
  return apiClient<void>(`/api/imports/${input.importJobId}/cancel`, {
    method: "POST",
    body: {},
  });
}

export function listImportJobErrors(input: ListImportJobErrorsInput) {
  const query = new URLSearchParams();

  if (input.limit !== undefined) {
    query.set("limit", String(input.limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiClient<ImportJobErrorsResponse>(
    `/api/imports/${input.importJobId}/errors${suffix}`
  );
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
