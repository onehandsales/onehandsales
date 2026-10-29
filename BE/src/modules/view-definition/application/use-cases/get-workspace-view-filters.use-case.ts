import { Injectable } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ViewHeaderMenuReader } from "../view-header-menu-reader";

// 역할 : Filters 메뉴의 공개 응답을 정의합니다.
export type WorkspaceViewFiltersResponse = Awaited<ReturnType<ViewHeaderMenuReader["filters"]>>;

// 역할 : 선택 View의 Filters 메뉴 읽기 요청을 전담합니다.
@Injectable()
export class GetWorkspaceViewFiltersUseCase {
  // 기능 : 메뉴 공통 접근·참조 검증을 주입받습니다.
  constructor(private readonly reader: ViewHeaderMenuReader) {}

  // 기능 : 현재 사용자의 저장된 Filters 메뉴를 조회합니다.
  execute(user: CurrentUserContext, workspaceId: string, viewDefinitionId: string, requestId: string | null = null): Promise<WorkspaceViewFiltersResponse> {
    // 1. 해당 메뉴의 읽기 흐름에 검증된 요청을 전달한다.
    return this.reader.filters(user, workspaceId, viewDefinitionId, requestId);
  }
}
