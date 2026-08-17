import type {
  SearchItem,
  SearchTargetType,
} from "@/features/search/types/search";

// 기능 : Backend targetPath가 없을 때 검색 대상 타입에 맞는 보호 앱 route를 계산합니다.
export function getSearchFallbackTargetPath(
  type: SearchTargetType,
  item: SearchItem
) {
  switch (type) {
    case "COMPANY":
      return `/app/companies/${item.targetId}`;
    case "CONTACT":
      return `/app/contacts/${item.targetId}`;
    case "PRODUCT":
      return `/app/products/${item.targetId}`;
    case "DEAL":
      return `/app/deals/${item.targetId}`;
    case "SCHEDULE":
      return `/app/schedules/${item.targetId}`;
    case "MEETING_NOTE":
      return `/app/meeting-notes/${item.targetId}`;
  }
}
