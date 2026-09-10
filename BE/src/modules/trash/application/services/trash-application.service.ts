import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { TrashTargetType } from "../ports/trash.types";
import {
  TRASH_REPOSITORY,
  type GetTrashDetailInput,
  type ListTrashInput,
  type RestoreTrashItemInput,
  type TrashRepository,
} from "../ports/trash.repository";

type ListTrashRequest = Omit<ListTrashInput, "userId" | "now">;

@Injectable()
export class TrashApplicationService {
  constructor(
    @Inject(TRASH_REPOSITORY)
    private readonly trashRepository: TrashRepository
  ) {}

  listTrash(currentUser: CurrentUserContext, input: ListTrashRequest) {
    return this.trashRepository.listTrash({
      ...input,
      now: new Date(),
      userId: currentUser.id,
    });
  }

  async getTrashDetail(
    currentUser: CurrentUserContext,
    targetType: TrashTargetType,
    targetId: string
  ) {
    const input: GetTrashDetailInput = {
      now: new Date(),
      targetId,
      targetType,
      userId: currentUser.id,
    };

    const detail = await this.trashRepository.getTrashDetail(input);

    if (!detail) {
      throw new NotFoundException("Trash item not found");
    }

    return detail;
  }

  async restoreTrashItem(
    currentUser: CurrentUserContext,
    targetType: TrashTargetType,
    targetId: string
  ) {
    const input: RestoreTrashItemInput = {
      now: new Date(),
      targetId,
      targetType,
      userId: currentUser.id,
    };

    const restored = await this.trashRepository.restoreTrashItem(input);

    if (!restored) {
      throw new NotFoundException("Trash item not found");
    }

    if ("blockedReason" in restored) {
      throw new ConflictException(
        "Restore the parent record before restoring this log."
      );
    }

    return restored;
  }
}
