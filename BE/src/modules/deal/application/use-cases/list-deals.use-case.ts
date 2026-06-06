import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealListResponse } from "../deal-response";
import {
  normalizeDealLikelihoodStatus,
  normalizeDealStage,
  normalizeNextActionStatus,
  normalizeOptionalId,
  normalizeOptionalText,
  normalizePagination,
} from "./deal-input";

export interface ListDealsQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly stage?: string;
  readonly likelihood?: string;
  readonly likelihoodStatus?: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly search?: string;
  readonly nextActionStatus?: string;
  readonly includeDeleted?: boolean;
}

@Injectable()
export class ListDealsUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListDealsQuery) {
    const pagination = normalizePagination(query);
    const likelihood = query.likelihoodStatus ?? query.likelihood;
    const result = await this.dealRepository.listDeals({
      userId: currentUser.id,
      page: pagination.page,
      pageSize: pagination.pageSize,
      stage: query.stage ? normalizeDealStage(query.stage, "INITIAL_CONTACT") : null,
      likelihoodStatus: likelihood
        ? normalizeDealLikelihoodStatus(likelihood, "NEUTRAL")
        : null,
      companyId: normalizeOptionalId(query.companyId),
      contactId: normalizeOptionalId(query.contactId),
      search: normalizeOptionalText(query.search),
      nextActionStatus: query.nextActionStatus
        ? normalizeNextActionStatus(query.nextActionStatus, "NONE")
        : null,
      includeDeleted: query.includeDeleted ?? false,
    });

    return toDealListResponse(result);
  }
}
