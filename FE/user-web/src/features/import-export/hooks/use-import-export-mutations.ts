import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelImportJob,
  confirmImportJob,
  createExportJob,
  createImportJob,
  downloadExportFile,
  generateImportMapping,
  updateImportJobRows,
  updateImportMapping,
  validateImportJob,
} from "@/features/import-export/api/import-export-api";
import { importExportQueryKeys } from "@/features/import-export/api/import-export-query-keys";
import { importUserLogQueryKeys } from "@/features/import-export/api/import-template-query-keys";
import type {
  CancelImportJobInput,
  ConfirmImportJobInput,
  CreateExportJobInput,
  CreateImportJobInput,
  DownloadExportFileInput,
  GenerateImportMappingInput,
  UpdateImportJobRowsInput,
  UpdateImportMappingInput,
} from "@/features/import-export/types/import-export";

export function useCreateImportJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateImportJobInput) => createImportJob(input),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        importExportQueryKeys.importDetail(detail.job.id),
        detail
      );
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.importJobs(),
      });
    },
  });
}

export function useGenerateImportMappingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateImportMappingInput) => generateImportMapping(input),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        importExportQueryKeys.importDetail(detail.job.id),
        detail
      );
    },
  });
}

export function useUpdateImportMappingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateImportMappingInput) => updateImportMapping(input),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        importExportQueryKeys.importDetail(detail.job.id),
        detail
      );
    },
  });
}

export function useUpdateImportJobRowsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateImportJobRowsInput) => updateImportJobRows(input),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        importExportQueryKeys.importDetail(detail.job.id),
        detail
      );
    },
  });
}

export function useValidateImportJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importJobId: string) => validateImportJob(importJobId),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        importExportQueryKeys.importDetail(detail.job.id),
        detail
      );
    },
  });
}

export function useConfirmImportJobMutation(importJobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmImportJobInput) => confirmImportJob(input),
    onSettled: () => {
      if (importJobId.length > 0) {
        void queryClient.invalidateQueries({
          queryKey: importExportQueryKeys.importDetail(importJobId),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.importJobs(),
      });
      void queryClient.invalidateQueries({ queryKey: ["company"] });
      void queryClient.invalidateQueries({ queryKey: ["contact"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
      void queryClient.invalidateQueries({ queryKey: ["deal"] });
      void queryClient.invalidateQueries({
        queryKey: importUserLogQueryKeys.lists(),
      });
    },
  });
}

export function useCancelImportJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CancelImportJobInput) => cancelImportJob(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.importJobs(),
      });
    },
  });
}

export function useCreateExportJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExportJobInput) => createExportJob(input),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.exportDetail(job.id),
      });
    },
  });
}

export function useDownloadExportFileMutation() {
  return useMutation({
    mutationFn: (input: DownloadExportFileInput) => downloadExportFile(input),
  });
}
