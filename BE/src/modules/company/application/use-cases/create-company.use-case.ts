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

export interface CreateCompanyCommand {
  readonly name: string;
  readonly industry?: string;
  readonly region?: string;
  readonly address?: string;
  readonly website?: string;
  readonly description?: string;
  readonly initialMemo?: string;
  readonly tags?: string[];
}

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateCompanyCommand) {
    const company = await this.companyRepository.createCompany({
      userId: currentUser.id,
      name: normalizeRequiredText(command.name),
      industry: normalizeOptionalText(command.industry),
      region: normalizeOptionalText(command.region),
      address: normalizeOptionalText(command.address),
      website: normalizeOptionalText(command.website),
      description: normalizeOptionalText(command.description),
      initialMemo: normalizeOptionalText(command.initialMemo),
      tags: normalizeTags(command.tags),
    });

    return toCompanyResponse(company);
  }
}

