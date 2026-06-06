import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  toCompanyLogResponse,
  toPaginatedResponse,
} from "../company-response";
import { normalizePagination } from "./company-input";

export interface ListCompanyLogsQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable()
export class ListCompanyLogsUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    companyId: string,
    query: ListCompanyLogsQuery
  ) {
    const pagination = normalizePagination(query);
    const result = await this.companyRepository.listCompanyLogs({
      userId: currentUser.id,
      companyId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return toPaginatedResponse(result, toCompanyLogResponse);
  }
}

