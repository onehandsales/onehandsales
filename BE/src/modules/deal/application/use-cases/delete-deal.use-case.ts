import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteResponse } from "../deal-response";

@Injectable()
export class DeleteDealUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(currentUser: CurrentUserContext, dealId: string) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.dealRepository.deleteDeal(
      currentUser.id,
      dealId,
      now,
      permanentDeleteAt
    );

    return toDeleteResponse(result);
  }
}
