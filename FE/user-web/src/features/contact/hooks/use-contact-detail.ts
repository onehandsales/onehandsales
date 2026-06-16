import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getContact,
  listContactDeals,
  listContactMemoLogs,
  listContactPrivateMemoLogs,
} from "@/features/contact/api/contact-api";
import { contactQueryKeys } from "@/features/contact/api/contact-query-keys";

// 기능 : 담당자 상세 기본 정보를 조회합니다.
export function useContactDetail(contactId: string) {
  return useQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.detail(contactId),
    queryFn: () => getContact(contactId),
  });
}

// 기능 : 담당자에 연결된 딜 목록을 조회합니다.
export function useContactDeals(contactId: string) {
  return useQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.deals(contactId),
    queryFn: () => listContactDeals(contactId),
  });
}

// 기능 : 담당자 일반 메모 로그를 커서 기반으로 조회합니다.
export function useContactMemoLogs(contactId: string) {
  return useInfiniteQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.memoLogs(contactId),
    queryFn: ({ pageParam }) =>
      listContactMemoLogs(contactId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
}

// 기능 : 담당자 개인 비밀 메모 로그를 커서 기반으로 조회합니다.
export function useContactPrivateMemoLogs(contactId: string) {
  return useInfiniteQuery({
    enabled: contactId.length > 0,
    queryKey: contactQueryKeys.privateMemoLogs(contactId),
    queryFn: ({ pageParam }) =>
      listContactPrivateMemoLogs(contactId, pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
}
