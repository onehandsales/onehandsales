import { Inject, Injectable } from "@nestjs/common";
import {
  TRASH_REPOSITORY,
  type TrashRepository,
} from "@/modules/trash/application/ports/trash.repository";
import { toTrashListResponse } from "@/modules/trash/application/trash-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  normalizePage,
  normalizePageSize,
  normalizeTrashTargetType,
} from "./trash-input";

export interface ListTrashQuery {
  readonly targetType?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable()
export class ListTrashUseCase {
  constructor(
    @Inject(TRASH_REPOSITORY)
    private readonly trashRepository: TrashRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListTrashQuery) {
    const result = await this.trashRepository.listTrash({
      userId: currentUser.id,
      targetType: normalizeTrashTargetType(query.targetType),
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize),
    });

    return toTrashListResponse(result);
  }
}
