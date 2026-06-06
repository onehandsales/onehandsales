import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";
import {
  normalizeNextActionStatus,
  normalizeOptionalDate,
  normalizeOptionalText,
} from "./deal-input";

export interface UpdateDealNextActionCommand {
  readonly nextActionText?: string | null;
  readonly nextActionDueAt?: string | null;
  readonly nextActionStatus?: string;
}

@Injectable()
export class UpdateDealNextActionUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: UpdateDealNextActionCommand
  ) {
    const deal = await this.dealRepository.updateDealNextAction({
      userId: currentUser.id,
      dealId,
      ...(command.nextActionText !== undefined
        ? { nextActionText: normalizeOptionalText(command.nextActionText) }
        : {}),
      ...(command.nextActionDueAt !== undefined
        ? { nextActionDueAt: normalizeOptionalDate(command.nextActionDueAt) }
        : {}),
      ...(command.nextActionStatus !== undefined
        ? {
            nextActionStatus: normalizeNextActionStatus(
              command.nextActionStatus,
              "NONE"
            ),
          }
        : {}),
    });

    return toDealResponse(deal);
  }
}
