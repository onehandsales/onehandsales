import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";
import {
  normalizeOptionalText,
  normalizeRequiredDate,
} from "./deal-input";

export interface SnoozeDealNextActionCommand {
  readonly nextActionDueAt: string;
  readonly reason?: string;
}

@Injectable()
export class SnoozeDealNextActionUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: SnoozeDealNextActionCommand
  ) {
    const deal = await this.dealRepository.snoozeDealNextAction({
      userId: currentUser.id,
      dealId,
      nextActionDueAt: normalizeRequiredDate(command.nextActionDueAt),
      reason: normalizeOptionalText(command.reason),
    });

    return toDealResponse(deal);
  }
}
