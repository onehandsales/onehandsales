import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmImportJob,
  createExportJob,
  createImportJob,
  downloadExportFile,
  generateImportMapping,
  updateImportMapping,
} from "@/features/import-export/api/import-export-api";
import { importExportQueryKeys } from "@/features/import-export/api/import-export-query-keys";
import { importUserLogQueryKeys } from "@/features/import-export/api/import-template-query-keys";
import type {
  ConfirmImportJobInput,
  CreateExportJobInput,
  CreateImportJobInput,
  DownloadExportFileInput,
  UpdateImportMappingInput,
} from "@/features/import-export/types/import-export";

export function useCreateImportJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateImportJobInput) => createImportJob(input),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.importDetail(job.id),
      });
    },
  });
}

export function useGenerateImportMappingMutation() {
  return useMutation({
    mutationFn: (importJobId: string) => generateImportMapping(importJobId),
  });
}

export function useUpdateImportMappingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateImportMappingInput) => updateImportMapping(input),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({
        queryKey: importExportQueryKeys.importDetail(job.id),
      });
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
