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

export interface CreateDealActivityCommand {
  readonly typeId: string;
  readonly occurredAt: string;
  readonly title: string;
  readonly content?: string;
}

@Injectable()
export class CreateDealActivityUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: CreateDealActivityCommand
  ) {
    const activity = await this.dealRepository.createDealActivity({
      userId: currentUser.id,
      dealId,
      typeId: normalizeRequiredId(command.typeId),
      occurredAt: normalizeRequiredDate(command.occurredAt),
      title: normalizeRequiredText(command.title),
      content: normalizeOptionalText(command.content),
    });

    return toDealActivityResponse(activity);
  }
}
