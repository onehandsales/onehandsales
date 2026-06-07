import { Inject, Injectable } from "@nestjs/common";
import {
  TRASH_REPOSITORY,
  type TrashRepository,
} from "@/modules/trash/application/ports/trash.repository";
import { toPurgeExpiredTrashResponse } from "@/modules/trash/application/trash-response";

@Injectable()
export class PurgeExpiredTrashUseCase {
  constructor(
    @Inject(TRASH_REPOSITORY)
    private readonly trashRepository: TrashRepository
  ) {}

  async execute(input: { readonly now?: Date; readonly limit?: number } = {}) {
    const result = await this.trashRepository.purgeExpiredTrash({
      now: input.now ?? new Date(),
      limit: input.limit ?? 500,
    });

    return toPurgeExpiredTrashResponse(result);
  }
}
