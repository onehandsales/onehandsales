import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  createCompanyLog,
  deleteCompany,
  deleteCompanyLog,
  restoreCompany,
  updateCompany,
  updateCompanyLog,
} from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";
import type {
  CreateCompanyInput,
  CreateCompanyLogInput,
  UpdateCompanyInput,
  UpdateCompanyLogInput,
} from "@/features/company/types/company";

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyInput) => createCompany(input),
    onSuccess: (company) => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(company.id),
      });
    },
  });
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCompanyInput) => updateCompany(input),
    onSuccess: (company) => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(company.id),
      });
    },
  });
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(result.id),
      });
    },
  });
}

export function useRestoreCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => restoreCompany(companyId),
    onSuccess: (company) => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(company.id),
      });
    },
  });
}

export function useCreateCompanyLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyLogInput) => createCompanyLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(log.companyId),
      });
    },
  });
}

export function useUpdateCompanyLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCompanyLogInput) => updateCompanyLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(log.companyId),
      });
    },
  });
}

export function useDeleteCompanyLogMutation(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteCompanyLog(companyId, logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(companyId),
      });
    },
  });
}
