import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toCompanyLogResponse } from "../company-response";
import { normalizeOptionalText, normalizeRequiredText } from "./company-input";

export interface UpdateCompanyLogCommand {
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

@Injectable()
export class UpdateCompanyLogUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    companyId: string,
    logId: string,
    command: UpdateCompanyLogCommand
  ) {
    return toCompanyLogResponse(
      await this.companyRepository.updateCompanyLog({
        userId: currentUser.id,
        companyId,
        logId,
        ...(command.loggedAt !== undefined ? { loggedAt: command.loggedAt } : {}),
        ...(command.title !== undefined
          ? { title: normalizeRequiredText(command.title) }
          : {}),
        ...(command.content !== undefined
          ? { content: normalizeOptionalText(command.content) ?? "" }
          : {}),
      })
    );
  }
}

