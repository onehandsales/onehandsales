import { Inject, Injectable } from "@nestjs/common";
import {
  TRASH_REPOSITORY,
  type TrashRepository,
} from "@/modules/trash/application/ports/trash.repository";
import { toTrashRestoreResponse } from "@/modules/trash/application/trash-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { normalizeRequiredTrashTargetType } from "./trash-input";

@Injectable()
export class RestoreTrashItemUseCase {
  constructor(
    @Inject(TRASH_REPOSITORY)
    private readonly trashRepository: TrashRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    targetType: string,
    targetId: string
  ) {
    const result = await this.trashRepository.restoreTrashItem({
      userId: currentUser.id,
      targetType: normalizeRequiredTrashTargetType(targetType),
      targetId,
      now: new Date(),
    });

    return toTrashRestoreResponse(result);
  }
}
