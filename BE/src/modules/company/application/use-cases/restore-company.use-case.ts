import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toCompanyResponse } from "../company-response";

@Injectable()
export class RestoreCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(currentUser: CurrentUserContext, companyId: string) {
    return toCompanyResponse(
      await this.companyRepository.restoreCompany(currentUser.id, companyId)
    );
  }
}

