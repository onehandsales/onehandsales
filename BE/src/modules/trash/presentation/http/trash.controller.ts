import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ListTrashUseCase } from "@/modules/trash/application/use-cases/list-trash.use-case";
import { PermanentlyDeleteTrashItemUseCase } from "@/modules/trash/application/use-cases/permanently-delete-trash-item.use-case";
import { RestoreTrashItemUseCase } from "@/modules/trash/application/use-cases/restore-trash-item.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { ListTrashDto } from "./dto/trash-query.dto";

@UseGuards(AuthGuard)
@Controller("api/trash")
export class TrashController {
  constructor(
    private readonly listTrashUseCase: ListTrashUseCase,
    private readonly restoreTrashItemUseCase: RestoreTrashItemUseCase,
    private readonly permanentlyDeleteTrashItemUseCase: PermanentlyDeleteTrashItemUseCase
  ) {}

  @Get()
  listTrash(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListTrashDto
  ) {
    return this.listTrashUseCase.execute(currentUser, query);
  }

  @Post(":targetType/:targetId/restore")
  restoreTrashItem(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("targetType") targetType: string,
    @Param("targetId") targetId: string
  ) {
    return this.restoreTrashItemUseCase.execute(
      currentUser,
      targetType,
      targetId
    );
  }

  @Delete(":targetType/:targetId/permanent")
  permanentlyDeleteTrashItem() {
    return this.permanentlyDeleteTrashItemUseCase.execute();
  }
}
