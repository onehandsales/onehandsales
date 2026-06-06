import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealActivityResponse } from "../deal-response";
import {
  normalizeOptionalText,
  normalizeRequiredDate,
  normalizeRequiredId,
  normalizeRequiredText,
} from "./deal-input";

export interface UpdateDealActivityCommand {
  readonly typeId?: string;
  readonly occurredAt?: string;
  readonly title?: string;
  readonly content?: string | null;
}

@Injectable()
export class UpdateDealActivityUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    activityId: string,
    command: UpdateDealActivityCommand
  ) {
    const activity = await this.dealRepository.updateDealActivity({
      userId: currentUser.id,
      dealId,
      activityId,
      ...(command.typeId !== undefined
        ? { typeId: normalizeRequiredId(command.typeId) }
        : {}),
      ...(command.occurredAt !== undefined
        ? { occurredAt: normalizeRequiredDate(command.occurredAt) }
        : {}),
      ...(command.title !== undefined
        ? { title: normalizeRequiredText(command.title) }
        : {}),
      ...(command.content !== undefined
        ? { content: normalizeOptionalText(command.content) }
        : {}),
    });

    return toDealActivityResponse(activity);
  }
}
