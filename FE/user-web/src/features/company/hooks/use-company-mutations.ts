import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  createCompanyField,
  createCompanyRegion,
  deleteCompanyField,
  deleteCompanyRegion,
  exportCompaniesXlsx,
  updateCompany,
} from "@/features/company/api/company-api";
import { companyQueryKeys } from "@/features/company/api/company-query-keys";
import type {
  CompanyExportFilters,
  CreateCompanyFieldInput,
  CreateCompanyInput,
  CreateCompanyRegionInput,
  UpdateCompanyInput,
} from "@/features/company/types/company";

// 기능 : 회사를 생성한 뒤 회사 목록 캐시를 갱신합니다.
export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyInput) => createCompany(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

// 기능 : 회사 기본 정보를 수정한 뒤 목록과 상세 캐시를 갱신합니다.
export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCompanyInput) => updateCompany(input),
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: companyQueryKeys.detail(input.companyId),
      });
    },
  });
}

// 기능 : 회사 분야를 생성한 뒤 분야 목록 캐시를 갱신합니다.
export function useCreateCompanyFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyFieldInput) => createCompanyField(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.fields() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

// 기능 : 회사 분야를 삭제한 뒤 분야 목록 캐시를 갱신합니다.
export function useDeleteCompanyFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => deleteCompanyField(fieldId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.fields() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

// 기능 : 회사 지역을 생성한 뒤 지역 목록 캐시를 갱신합니다.
export function useCreateCompanyRegionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyRegionInput) => createCompanyRegion(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.regions() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

// 기능 : 회사 지역을 삭제한 뒤 지역 목록 캐시를 갱신합니다.
export function useDeleteCompanyRegionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regionId: string) => deleteCompanyRegion(regionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.regions() });
      void queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

// 기능 : 현재 회사 목록 필터의 엑셀 파일을 내려받습니다.
export function useExportCompaniesMutation() {
  return useMutation({
    mutationFn: (filters: CompanyExportFilters) => exportCompaniesXlsx(filters),
  });
}
