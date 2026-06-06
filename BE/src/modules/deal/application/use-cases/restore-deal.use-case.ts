import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealResponse } from "../deal-response";

@Injectable()
export class RestoreDealUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(currentUser: CurrentUserContext, dealId: string) {
    return toDealResponse(
      await this.dealRepository.restoreDeal(currentUser.id, dealId)
    );
  }
}
