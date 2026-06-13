import type { ContactListParams } from "@/features/contact/types/contact";

export const contactQueryKeys = {
  all: ["contact"] as const,
  lists: () => [...contactQueryKeys.all, "list"] as const,
  list: (params: ContactListParams) =>
    [...contactQueryKeys.lists(), { ...params }] as const,
  details: () => [...contactQueryKeys.all, "detail"] as const,
  detail: (contactId: string) =>
    [...contactQueryKeys.details(), contactId] as const,
  memoLogs: (contactId: string) =>
    [...contactQueryKeys.detail(contactId), "memo-logs"] as const,
  privateMemoLogs: (contactId: string) =>
    [...contactQueryKeys.detail(contactId), "private-memo-logs"] as const,
  companyOptions: () => [...contactQueryKeys.all, "company-options"] as const,
  jobGrades: () => [...contactQueryKeys.all, "job-grades"] as const,
  departments: () => [...contactQueryKeys.all, "departments"] as const,
};
