import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TrashApplicationService } from "@/modules/trash/application/services/trash-application.service";
import { TrashTargetTypeUnsupportedError } from "@/modules/trash/domain/trash.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateTrashRecoveryRequestDto,
  isTrashTargetType,
  ListTrashQueryDto,
} from "./dto/trash-request.dto";

// 역할 : TrashController 휴지통 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/trash")
export class TrashController {
  // 기능 : 휴지통 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly trashApplicationService: TrashApplicationService
  ) {}

  // API : 휴지통, 삭제 항목 목록 조회
  @Get()
  listTrash(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListTrashQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.trashApplicationService.listTrash(currentUser, query);
  }

  // API : 휴지통, 만료 항목 복구 문의 생성
  @Post("recovery-requests")
  @HttpCode(HttpStatus.CREATED)
  createRecoveryRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateTrashRecoveryRequestDto
  ) {
    // 1. body의 대상 식별자와 문의 메시지를 application 계층으로 전달한다.
    return this.trashApplicationService.createRecoveryRequest(
      currentUser,
      body
    );
  }

  // API : 휴지통, 삭제 항목 단건 상세 조회
  @Get(":targetType/:targetId")
  getTrashDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("targetType") targetType: string,
    @Param("targetId", ParseUUIDPipe) targetId: string
  ) {
    // 1. path param의 대상 유형이 휴지통 복구 대상인지 검증한다.
    if (!isTrashTargetType(targetType)) {
      throw new TrashTargetTypeUnsupportedError();
    }

    // 2. 대상 식별자와 현재 사용자를 application 계층으로 전달한다.
    return this.trashApplicationService.getTrashDetail(
      currentUser,
      targetType,
      targetId
    );
  }

  // API : 휴지통, 삭제 항목 단건 복구
  @Post(":targetType/:targetId/restore")
  @HttpCode(HttpStatus.CREATED)
  restoreTrashItem(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("targetType") targetType: string,
    @Param("targetId", ParseUUIDPipe) targetId: string
  ) {
    // 1. path param의 대상 유형이 휴지통 복구 대상인지 검증한다.
    if (!isTrashTargetType(targetType)) {
      throw new TrashTargetTypeUnsupportedError();
    }

    // 2. 대상 식별자와 현재 사용자를 application 계층으로 전달한다.
    return this.trashApplicationService.restoreTrashItem(
      currentUser,
      targetType,
      targetId
    );
  }
}
