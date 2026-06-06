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
  normalizeOptionalDate,
  normalizeOptionalId,
  normalizeOptionalText,
  normalizeProductIds,
  normalizeRequiredText,
} from "./deal-input";

export interface CreateDealCommand {
  readonly title: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly stage?: string;
  readonly likelihoodStatus?: string;
  readonly likelihoodPercent?: number;
  readonly expectedCloseDate?: string;
  readonly nextActionText?: string;
  readonly nextActionDueAt?: string;
  readonly productIds?: string[];
  readonly initialMemo?: string;
}

@Injectable()
export class CreateDealUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateDealCommand) {
    const deal = await this.dealRepository.createDeal({
      userId: currentUser.id,
      title: normalizeRequiredText(command.title),
      companyId: normalizeOptionalId(command.companyId),
      contactId: normalizeOptionalId(command.contactId),
      amount: normalizeAmount(command.amount),
      currency: normalizeCurrency(command.currency),
      stage: normalizeDealStage(command.stage, "INITIAL_CONTACT"),
      likelihoodStatus: normalizeDealLikelihoodStatus(
        command.likelihoodStatus,
        "NEUTRAL"
      ),
      likelihoodPercent: normalizeLikelihoodPercent(command.likelihoodPercent),
      expectedCloseDate: normalizeOptionalDate(command.expectedCloseDate),
      nextActionText: normalizeOptionalText(command.nextActionText),
      nextActionDueAt: normalizeOptionalDate(command.nextActionDueAt),
      productIds: normalizeProductIds(command.productIds),
      initialMemo: normalizeOptionalText(command.initialMemo),
    });

    return toDealResponse(deal);
  }
}
