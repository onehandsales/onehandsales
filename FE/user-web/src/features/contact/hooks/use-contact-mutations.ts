import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  createContactDepartment,
  createContactJobGrade,
  createContactMemoLog,
  createContactPrivateMemoLog,
  deleteContactDepartment,
  deleteContactJobGrade,
  exportContactsXlsx,
  updateContact,
  updateContactMemoLog,
  updateContactPrivateMemoLog,
} from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import type {
  ContactExportParams,
  CreateContactDepartmentInput,
  CreateContactInput,
  CreateContactJobGradeInput,
  CreateContactMemoLogInput,
  CreateContactPrivateMemoLogInput,
  UpdateContactInput,
  UpdateContactMemoLogInput,
  UpdateContactPrivateMemoLogInput,
} from "@/features/contact/types/contact";

// 기능 : 담당자를 생성한 뒤 담당자 목록 캐시를 갱신합니다.
export function useCreateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}

// 기능 : 담당자 기본 정보를 수정한 뒤 목록과 상세 캐시를 갱신합니다.
export function useUpdateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) => updateContact(input),
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.detail(input.contactId),
      });
    },
  });
}

// 기능 : 담당자 직급을 생성한 뒤 직급 목록 캐시를 갱신합니다.
export function useCreateJobGradeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactJobGradeInput) =>
      createContactJobGrade(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.jobGrades(),
      });
    },
  });
}

// 기능 : 담당자 직급을 삭제한 뒤 직급 목록과 담당자 목록 캐시를 갱신합니다.
export function useDeleteJobGradeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobGradeId: string) => deleteContactJobGrade(jobGradeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.jobGrades(),
      });
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}

// 기능 : 담당자 부서를 생성한 뒤 부서 목록 캐시를 갱신합니다.
export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactDepartmentInput) =>
      createContactDepartment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.departments(),
      });
    },
  });
}

// 기능 : 담당자 부서를 삭제한 뒤 부서 목록과 담당자 목록 캐시를 갱신합니다.
export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) => deleteContactDepartment(departmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.departments(),
      });
      void queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}

// 기능 : 담당자 일반 메모 로그를 생성한 뒤 메모 로그 캐시를 갱신합니다.
export function useCreateContactMemoLogMutation(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactMemoLogInput) =>
      createContactMemoLog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.memoLogs(contactId),
      });
    },
  });
}

// 기능 : 담당자 일반 메모 로그를 수정한 뒤 메모 로그 캐시를 갱신합니다.
export function useUpdateContactMemoLogMutation(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactMemoLogInput) =>
      updateContactMemoLog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.memoLogs(contactId),
      });
    },
  });
}

// 기능 : 담당자 개인 비밀 메모 로그를 생성한 뒤 개인 메모 로그 캐시를 갱신합니다.
export function useCreateContactPrivateMemoLogMutation(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactPrivateMemoLogInput) =>
      createContactPrivateMemoLog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.privateMemoLogs(contactId),
      });
    },
  });
}

// 기능 : 담당자 개인 비밀 메모 로그를 수정한 뒤 개인 메모 로그 캐시를 갱신합니다.
export function useUpdateContactPrivateMemoLogMutation(contactId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactPrivateMemoLogInput) =>
      updateContactPrivateMemoLog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: contactQueryKeys.privateMemoLogs(contactId),
      });
    },
  });
}

// 기능 : 현재 담당자 목록 필터의 엑셀 파일을 내려받습니다.
export function useExportContactsMutation() {
  return useMutation({
    mutationFn: (filters: ContactExportParams) => exportContactsXlsx(filters),
  });
}
