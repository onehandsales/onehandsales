import { Inject, Injectable } from "@nestjs/common";
import {
  DEAL_REPOSITORY,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDealDetailResponse } from "../deal-response";
import { assertDealExists, assertNotDeleted } from "./deal-input";

@Injectable()
export class GetDealUseCase {
  constructor(
    @Inject(DEAL_REPOSITORY)
    private readonly dealRepository: DealRepository
  ) {}

  async execute(currentUser: CurrentUserContext, dealId: string) {
    const detail = assertDealExists(
      await this.dealRepository.getDealDetail(currentUser.id, dealId)
    );
    assertNotDeleted(detail.deal.deletedAt, "read");

    return toDealDetailResponse(detail);
  }
}
