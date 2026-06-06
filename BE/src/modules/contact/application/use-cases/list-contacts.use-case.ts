import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactResponse, toPaginatedResponse } from "../contact-response";
import { normalizeOptionalText, normalizePagination } from "./contact-input";

export interface ListContactsQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly companyId?: string;
  readonly includeDeleted?: boolean;
}

@Injectable()
export class ListContactsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListContactsQuery) {
    const pagination = normalizePagination(query);
    const result = await this.contactRepository.listContacts({
      userId: currentUser.id,
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: normalizeOptionalText(query.search),
      companyId: normalizeOptionalText(query.companyId),
      includeDeleted: query.includeDeleted ?? false,
    });

    return toPaginatedResponse(result, toContactResponse);
  }
}
