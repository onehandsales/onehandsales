import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toCompanyDetailResponse } from "../company-response";
import { assertCompanyExists, assertNotDeleted } from "./company-input";

@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(currentUser: CurrentUserContext, companyId: string) {
    const detail = assertCompanyExists(
      await this.companyRepository.getCompanyDetail(currentUser.id, companyId)
    );
    assertNotDeleted(detail.company.deletedAt, "read");

    return toCompanyDetailResponse(detail);
  }
}

