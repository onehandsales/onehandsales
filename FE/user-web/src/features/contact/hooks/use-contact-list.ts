import { useQuery } from "@tanstack/react-query";
import {
  listContactDepartments,
  listContactJobGrades,
  listContacts,
} from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";
import type { ContactListParams } from "@/features/contact/types/contact";

// 기능 : 담당자 목록을 조회합니다.
export function useContactList(params: ContactListParams) {
  return useQuery({
    queryKey: contactQueryKeys.list(params),
    queryFn: () => listContacts(params),
  });
}

// 기능 : 담당자 직급 목록을 조회합니다.
export function useContactJobGrades(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: contactQueryKeys.jobGrades(),
    queryFn: () => listContactJobGrades(),
    enabled: options?.enabled ?? true,
  });
}

// 기능 : 담당자 부서 목록을 조회합니다.
export function useContactDepartments(options?: { readonly enabled?: boolean }) {
  return useQuery({
    queryKey: contactQueryKeys.departments(),
    queryFn: () => listContactDepartments(),
    enabled: options?.enabled ?? true,
  });
}
