import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  toCompanyResponse,
  toPaginatedResponse,
} from "../company-response";
import { normalizeOptionalText, normalizePagination } from "./company-input";

export interface ListCompaniesQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly includeDeleted?: boolean;
}

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListCompaniesQuery) {
    const pagination = normalizePagination(query);
    const result = await this.companyRepository.listCompanies({
      userId: currentUser.id,
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: normalizeOptionalText(query.search),
      includeDeleted: query.includeDeleted ?? false,
    });

    return toPaginatedResponse(result, toCompanyResponse);
  }
}

