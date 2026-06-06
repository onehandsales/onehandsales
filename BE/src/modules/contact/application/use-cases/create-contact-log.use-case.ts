import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactLogResponse } from "../contact-response";
import { normalizeOptionalText, normalizeRequiredText } from "./contact-input";

export interface CreateContactLogCommand {
  readonly loggedAt: Date;
  readonly title: string;
  readonly content?: string;
}

@Injectable()
export class CreateContactLogUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    contactId: string,
    command: CreateContactLogCommand
  ) {
    return toContactLogResponse(
      await this.contactRepository.createContactLog({
        userId: currentUser.id,
        contactId,
        loggedAt: command.loggedAt,
        title: normalizeRequiredText(command.title),
        content: normalizeOptionalText(command.content) ?? "",
      })
    );
  }
}
