import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toCompanyLogResponse } from "../company-response";
import { normalizeOptionalText, normalizeRequiredText } from "./company-input";

export interface CreateCompanyLogCommand {
  readonly loggedAt: Date;
  readonly title: string;
  readonly content?: string;
}

@Injectable()
export class CreateCompanyLogUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    companyId: string,
    command: CreateCompanyLogCommand
  ) {
    return toCompanyLogResponse(
      await this.companyRepository.createCompanyLog({
        userId: currentUser.id,
        companyId,
        loggedAt: command.loggedAt,
        title: normalizeRequiredText(command.title),
        content: normalizeOptionalText(command.content) ?? "",
      })
    );
  }
}

