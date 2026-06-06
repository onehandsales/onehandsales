import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";
import {
  normalizeOptionalText,
  normalizeRequiredDealStage,
} from "./deal-input";

export interface ChangeDealStageCommand {
  readonly stage: string;
  readonly activityTitle?: string;
  readonly activityContent?: string;
}

@Injectable()
export class ChangeDealStageUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: ChangeDealStageCommand
  ) {
    const deal = await this.dealRepository.changeDealStage({
      userId: currentUser.id,
      dealId,
      stage: normalizeRequiredDealStage(command.stage),
      activityTitle: normalizeOptionalText(command.activityTitle),
      activityContent: normalizeOptionalText(command.activityContent),
      occurredAt: new Date(),
    });

    return toDealResponse(deal);
  }
}
