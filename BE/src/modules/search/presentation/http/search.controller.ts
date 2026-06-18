import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  SearchApplicationService,
  type SearchAllResponse,
} from "@/modules/search/application/services/search-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { SearchAllQueryDto } from "./dto/search-request.dto";

// 역할 : SearchController는 통합검색 HTTP 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/search")
export class SearchController {
  // 기능 : 통합검색 application service를 주입받습니다.
  constructor(private readonly searchApplicationService: SearchApplicationService) {}

  // API : 통합검색 전체 도메인 검색
  @Get()
  searchAll(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: SearchAllQueryDto
  ): Promise<SearchAllResponse> {
    // 1. 현재 사용자와 검색 query를 application 계층으로 전달합니다.
    return this.searchApplicationService.searchAll(currentUser, query);
  }
}
