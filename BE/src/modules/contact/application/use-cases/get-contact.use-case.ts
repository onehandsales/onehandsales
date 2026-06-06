import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactDetailResponse } from "../contact-response";
import { assertContactExists, assertNotDeleted } from "./contact-input";

@Injectable()
export class GetContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(currentUser: CurrentUserContext, contactId: string) {
    const detail = assertContactExists(
      await this.contactRepository.getContactDetail(currentUser.id, contactId)
    );
    assertNotDeleted(detail.contact.deletedAt, "read");

    return toContactDetailResponse(detail);
  }
}
