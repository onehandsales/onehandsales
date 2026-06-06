import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";
import {
  normalizeAmount,
  normalizeCurrency,
  normalizeDealLikelihoodStatus,
  normalizeDealStage,
  normalizeLikelihoodPercent,
  normalizeNextActionStatus,
  normalizeOptionalDate,
  normalizeOptionalId,
  normalizeOptionalText,
  normalizeProductIds,
  normalizeRequiredText,
} from "./deal-input";

export interface UpdateDealCommand {
  readonly title?: string;
  readonly companyId?: string | null;
  readonly contactId?: string | null;
  readonly amount?: number;
  readonly currency?: string;
  readonly stage?: string;
  readonly likelihoodStatus?: string;
  readonly likelihoodPercent?: number | null;
  readonly expectedCloseDate?: string | null;
  readonly nextActionText?: string | null;
  readonly nextActionDueAt?: string | null;
  readonly nextActionStatus?: string;
  readonly productIds?: string[];
}

@Injectable()
export class UpdateDealUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    command: UpdateDealCommand
  ) {
    const deal = await this.dealRepository.updateDeal({
      userId: currentUser.id,
      dealId,
      ...(command.title !== undefined
        ? { title: normalizeRequiredText(command.title) }
        : {}),
      ...(command.companyId !== undefined
        ? { companyId: normalizeOptionalId(command.companyId) }
        : {}),
      ...(command.contactId !== undefined
        ? { contactId: normalizeOptionalId(command.contactId) }
        : {}),
      ...(command.amount !== undefined
        ? { amount: normalizeAmount(command.amount) }
        : {}),
      ...(command.currency !== undefined
        ? { currency: normalizeCurrency(command.currency) }
        : {}),
      ...(command.stage !== undefined
        ? { stage: normalizeDealStage(command.stage, "INITIAL_CONTACT") }
        : {}),
      ...(command.likelihoodStatus !== undefined
        ? {
            likelihoodStatus: normalizeDealLikelihoodStatus(
              command.likelihoodStatus,
              "NEUTRAL"
            ),
          }
        : {}),
      ...(command.likelihoodPercent !== undefined
        ? {
            likelihoodPercent: normalizeLikelihoodPercent(
              command.likelihoodPercent
            ),
          }
        : {}),
      ...(command.expectedCloseDate !== undefined
        ? { expectedCloseDate: normalizeOptionalDate(command.expectedCloseDate) }
        : {}),
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
      ...(command.productIds !== undefined
        ? { productIds: normalizeProductIds(command.productIds) }
        : {}),
    });

    return toDealResponse(deal);
  }
}
