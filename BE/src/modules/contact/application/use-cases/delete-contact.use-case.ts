import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteResponse } from "../contact-response";

@Injectable()
export class DeleteContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(currentUser: CurrentUserContext, contactId: string) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.contactRepository.deleteContact(
      currentUser.id,
      contactId,
      now,
      permanentDeleteAt
    );

    return toDeleteResponse(result);
  }
}
