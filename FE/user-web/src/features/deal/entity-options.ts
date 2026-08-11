// 기능 : 다른 feature가 딜 목록과 딜 연결 선택지를 조회할 때 쓰는 public entry를 제공합니다.
export { listDeals } from "./api/deal-api";
export {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "./hooks/use-deal-entity-options";
export { useDealList } from "./hooks/use-deal-list";
export type {
  DealCompanyOption,
  DealContactOption,
  DealListItem,
  DealProductOption,
} from "./types/deal";
