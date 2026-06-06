import { Inject, Injectable } from "@nestjs/common";
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toCompanyResponse } from "../company-response";
import {
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeTags,
} from "./company-input";

export interface UpdateCompanyCommand {
  readonly name?: string;
  readonly industry?: string | null;
  readonly region?: string | null;
  readonly address?: string | null;
  readonly website?: string | null;
  readonly description?: string | null;
  readonly tags?: string[];
}

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    companyId: string,
    command: UpdateCompanyCommand
  ) {
    const company = await this.companyRepository.updateCompany({
      userId: currentUser.id,
      companyId,
      ...(command.name !== undefined
        ? { name: normalizeRequiredText(command.name) }
        : {}),
      ...(command.industry !== undefined
        ? { industry: normalizeOptionalText(command.industry) }
        : {}),
      ...(command.region !== undefined
        ? { region: normalizeOptionalText(command.region) }
        : {}),
      ...(command.address !== undefined
        ? { address: normalizeOptionalText(command.address) }
        : {}),
      ...(command.website !== undefined
        ? { website: normalizeOptionalText(command.website) }
        : {}),
      ...(command.description !== undefined
        ? { description: normalizeOptionalText(command.description) }
        : {}),
      ...(command.tags !== undefined ? { tags: normalizeTags(command.tags) } : {}),
    });

    return toCompanyResponse(company);
  }
}

