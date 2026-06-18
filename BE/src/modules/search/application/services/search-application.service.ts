import { Inject, Injectable } from "@nestjs/common";
import {
  SEARCH_REPOSITORY,
  type SearchGroupRecord,
  type SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import {
  SEARCH_TARGET_TYPES,
  type SearchTargetType,
  isSearchTargetType,
} from "@/modules/search/domain/search-target-type";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_SEARCH_LIMIT = 5;
const MAX_SEARCH_LIMIT = 20;
const MIN_SEARCH_QUERY_LENGTH = 2;

// 역할 : SearchAllQueryInput 통합검색 HTTP query 입력 값을 정의합니다.
export interface SearchAllQueryInput {
  readonly q: string;
  readonly types?: string;
  readonly limit?: number;
}

// 역할 : SearchAllResponse 통합검색 API 응답을 정의합니다.
export interface SearchAllResponse {
  readonly groups: readonly SearchGroupRecord[];
}

// 역할 : SearchApplicationService 통합검색 application 유스케이스를 제공합니다.
@Injectable()
export class SearchApplicationService {
  // 기능 : 통합검색 저장소와 로그 서비스를 주입받습니다.
  constructor(
    @Inject(SEARCH_REPOSITORY)
    private readonly searchRepository: SearchRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자 소유 데이터에서 통합검색 결과를 조회합니다.
  async searchAll(
    currentUser: CurrentUserContext,
    query: SearchAllQueryInput
  ): Promise<SearchAllResponse> {
    // 1. 검색어, 대상 타입, limit을 API 계약 기준으로 정규화한다.
    const normalizedQuery = query.q.trim();
    const types = this.normalizeTypes(query.types);
    const limit = this.normalizeLimit(query.limit);

    // 2. 두 글자 미만 검색어는 DB를 조회하지 않고 빈 결과를 반환한다.
    if (normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
      return { groups: [] };
    }

    // 3. 현재 사용자 소유 데이터만 repository에 위임해 조회한다.
    const groups = await this.searchRepository.search({
      userId: currentUser.id,
      query: normalizedQuery,
      types,
      limit,
    });

    // 4. 검색어 원문을 제외한 구조화 로그를 남긴다.
    this.logEvent("search.executed", {
      userId: currentUser.id,
      queryLength: normalizedQuery.length,
      types,
      limit,
      resultCount: groups.reduce((total, group) => total + group.items.length, 0),
    });

    // 5. API 응답 형식으로 반환한다.
    return { groups };
  }

  // 기능 : comma-separated 검색 대상 타입 query를 enum 배열로 정규화합니다.
  private normalizeTypes(types: string | undefined): SearchTargetType[] {
    if (types === undefined || types.trim().length === 0) {
      return [...SEARCH_TARGET_TYPES];
    }

    const normalizedTypes: SearchTargetType[] = [];
    const invalidTypes: string[] = [];

    for (const rawType of types.split(",")) {
      const type = rawType.trim();

      if (type.length === 0) {
        continue;
      }

      if (!isSearchTargetType(type)) {
        invalidTypes.push(type);
        continue;
      }

      if (!normalizedTypes.includes(type)) {
        normalizedTypes.push(type);
      }
    }

    if (invalidTypes.length > 0) {
      throw new ValidationDomainError(
        `types must be one of ${SEARCH_TARGET_TYPES.join(", ")}`
      );
    }

    return normalizedTypes.length > 0 ? normalizedTypes : [...SEARCH_TARGET_TYPES];
  }

  // 기능 : 도메인별 검색 결과 제한 개수를 API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined) {
      return DEFAULT_SEARCH_LIMIT;
    }

    return Math.min(limit, MAX_SEARCH_LIMIT);
  }

  // 기능 : 민감정보를 제외한 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "SearchApplicationService"
    );
  }
}
