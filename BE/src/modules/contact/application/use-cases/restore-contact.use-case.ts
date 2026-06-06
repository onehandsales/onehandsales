import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactResponse } from "../contact-response";

@Injectable()
export class RestoreContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(currentUser: CurrentUserContext, contactId: string) {
    return toContactResponse(
      await this.contactRepository.restoreContact(currentUser.id, contactId)
    );
  }
}
