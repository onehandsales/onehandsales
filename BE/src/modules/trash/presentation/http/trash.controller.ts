import {
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
import { isTrashTargetType, ListTrashQueryDto } from "./dto/trash-request.dto";

@UseGuards(AuthGuard)
@Controller("api/trash")
export class TrashController {
  constructor(
    private readonly trashApplicationService: TrashApplicationService
  ) {}

  @Get()
  listTrash(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListTrashQueryDto
  ) {
    return this.trashApplicationService.listTrash(currentUser, query);
  }

  @Get(":targetType/:targetId")
  getTrashDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("targetType") targetType: string,
    @Param("targetId", ParseUUIDPipe) targetId: string
  ) {
    if (!isTrashTargetType(targetType)) {
      throw new TrashTargetTypeUnsupportedError();
    }

    return this.trashApplicationService.getTrashDetail(
      currentUser,
      targetType,
      targetId
    );
  }

  @Post(":targetType/:targetId/restore")
  @HttpCode(HttpStatus.CREATED)
  restoreTrashItem(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("targetType") targetType: string,
    @Param("targetId", ParseUUIDPipe) targetId: string
  ) {
    if (!isTrashTargetType(targetType)) {
      throw new TrashTargetTypeUnsupportedError();
    }

    return this.trashApplicationService.restoreTrashItem(
      currentUser,
      targetType,
      targetId
    );
  }
}
