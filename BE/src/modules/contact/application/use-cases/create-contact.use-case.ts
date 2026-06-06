import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_REPOSITORY,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toContactResponse } from "../contact-response";
import { normalizeOptionalText, normalizeRequiredText } from "./contact-input";

export interface CreateContactCommand {
  readonly name: string;
  readonly companyId?: string;
  readonly department?: string;
  readonly position?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
  readonly initialMemo?: string;
}

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(currentUser: CurrentUserContext, command: CreateContactCommand) {
    const contact = await this.contactRepository.createContact({
      userId: currentUser.id,
      name: normalizeRequiredText(command.name),
      companyId: normalizeOptionalText(command.companyId),
      department: normalizeOptionalText(command.department),
      position: normalizeOptionalText(command.position),
      phone: normalizeOptionalText(command.phone),
      email: normalizeOptionalText(command.email),
      address: normalizeOptionalText(command.address),
      initialMemo: normalizeOptionalText(command.initialMemo),
    });

    return toContactResponse(contact);
  }
}
