import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealActivityResponse, toPaginatedResponse } from "../deal-response";
import { normalizePagination } from "./deal-input";

export interface ListDealActivitiesQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable()
export class ListDealActivitiesUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    dealId: string,
    query: ListDealActivitiesQuery
  ) {
    const pagination = normalizePagination(query);
    const result = await this.dealRepository.listDealActivities({
      userId: currentUser.id,
      dealId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return toPaginatedResponse(result, toDealActivityResponse);
  }
}
