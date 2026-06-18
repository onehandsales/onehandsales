import type { SearchTargetType } from "@/modules/search/domain/search-target-type";

export const SEARCH_REPOSITORY = Symbol("SEARCH_REPOSITORY");

// 역할 : SearchRepositoryInput 통합검색 저장소 조회 조건을 정의합니다.
export interface SearchRepositoryInput {
  readonly userId: string;
  readonly query: string;
  readonly types: readonly SearchTargetType[];
  readonly limit: number;
}

// 역할 : SearchItemRecord 통합검색 결과 항목의 application record를 정의합니다.
export interface SearchItemRecord {
  readonly title: string;
  readonly subtitle: string | null;
  readonly targetId: string;
  readonly targetPath: string | null;
}

// 역할 : SearchGroupRecord 통합검색 도메인별 결과 record를 정의합니다.
export interface SearchGroupRecord {
  readonly type: SearchTargetType;
  readonly items: readonly SearchItemRecord[];
}

// 역할 : SearchRepository 통합검색 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface SearchRepository {
  // 기능 : 현재 사용자 소유 데이터에서 통합검색 결과를 조회합니다.
  search(input: SearchRepositoryInput): Promise<SearchGroupRecord[]>;
}
