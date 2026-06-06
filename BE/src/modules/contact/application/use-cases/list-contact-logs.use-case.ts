import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  toContactLogResponse,
  toPaginatedResponse,
} from "../contact-response";
import { normalizePagination } from "./contact-input";

export interface ListContactLogsQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

@Injectable()
export class ListContactLogsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    contactId: string,
    query: ListContactLogsQuery
  ) {
    const pagination = normalizePagination(query);
    const result = await this.contactRepository.listContactLogs({
      userId: currentUser.id,
      contactId,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    return toPaginatedResponse(result, toContactLogResponse);
  }
}
