import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactResponse } from "../contact-response";
import { normalizeOptionalText, normalizeRequiredText } from "./contact-input";

export interface UpdateContactCommand {
  readonly name?: string;
  readonly companyId?: string | null;
  readonly department?: string | null;
  readonly position?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
}

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    contactId: string,
    command: UpdateContactCommand
  ) {
    const contact = await this.contactRepository.updateContact({
      userId: currentUser.id,
      contactId,
      ...(command.name !== undefined
        ? { name: normalizeRequiredText(command.name) }
        : {}),
      ...(command.companyId !== undefined
        ? { companyId: normalizeOptionalText(command.companyId) }
        : {}),
      ...(command.department !== undefined
        ? { department: normalizeOptionalText(command.department) }
        : {}),
      ...(command.position !== undefined
        ? { position: normalizeOptionalText(command.position) }
        : {}),
      ...(command.phone !== undefined
        ? { phone: normalizeOptionalText(command.phone) }
        : {}),
      ...(command.email !== undefined
        ? { email: normalizeOptionalText(command.email) }
        : {}),
      ...(command.address !== undefined
        ? { address: normalizeOptionalText(command.address) }
        : {}),
    });

    return toContactResponse(contact);
  }
}
