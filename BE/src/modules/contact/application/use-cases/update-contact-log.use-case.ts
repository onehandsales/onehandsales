import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactLogResponse } from "../contact-response";
import { normalizeOptionalText, normalizeRequiredText } from "./contact-input";

export interface UpdateContactLogCommand {
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

@Injectable()
export class UpdateContactLogUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    contactId: string,
    logId: string,
    command: UpdateContactLogCommand
  ) {
    return toContactLogResponse(
      await this.contactRepository.updateContactLog({
        userId: currentUser.id,
        contactId,
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
