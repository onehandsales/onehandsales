import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteResponse } from "../company-response";

@Injectable()
export class DeleteCompanyLogUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    companyId: string,
    logId: string
  ) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.companyRepository.deleteCompanyLog(
      currentUser.id,
      companyId,
      logId,
      now,
      permanentDeleteAt
    );

    return toDeleteResponse(result);
  }
}

