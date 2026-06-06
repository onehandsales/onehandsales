import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateContactUseCase } from "@/modules/contact/application/use-cases/create-contact.use-case";
import { CreateContactLogUseCase } from "@/modules/contact/application/use-cases/create-contact-log.use-case";
import { DeleteContactUseCase } from "@/modules/contact/application/use-cases/delete-contact.use-case";
import { DeleteContactLogUseCase } from "@/modules/contact/application/use-cases/delete-contact-log.use-case";
import { GetContactUseCase } from "@/modules/contact/application/use-cases/get-contact.use-case";
import { ListContactsUseCase } from "@/modules/contact/application/use-cases/list-contacts.use-case";
import { ListContactLogsUseCase } from "@/modules/contact/application/use-cases/list-contact-logs.use-case";
import { RestoreContactUseCase } from "@/modules/contact/application/use-cases/restore-contact.use-case";
import { UpdateContactUseCase } from "@/modules/contact/application/use-cases/update-contact.use-case";
import { UpdateContactLogUseCase } from "@/modules/contact/application/use-cases/update-contact-log.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateContactDto, UpdateContactDto } from "./dto/contact.dto";
import { CreateContactLogDto, UpdateContactLogDto } from "./dto/contact-log.dto";
import { ListContactLogsDto, ListContactsDto } from "./dto/contact-query.dto";

@UseGuards(AuthGuard)
@Controller("api/contacts")
export class ContactController {
  constructor(
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly getContactUseCase: GetContactUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly deleteContactUseCase: DeleteContactUseCase,
    private readonly restoreContactUseCase: RestoreContactUseCase,
    private readonly listContactLogsUseCase: ListContactLogsUseCase,
    private readonly createContactLogUseCase: CreateContactLogUseCase,
    private readonly updateContactLogUseCase: UpdateContactLogUseCase,
    private readonly deleteContactLogUseCase: DeleteContactLogUseCase
  ) {}

  @Get()
  listContacts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListContactsDto
  ) {
    return this.listContactsUseCase.execute(currentUser, query);
  }

  @Post()
  createContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateContactDto
  ) {
    return this.createContactUseCase.execute(currentUser, body);
  }

  @Get(":contactId")
  getContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string
  ) {
    return this.getContactUseCase.execute(currentUser, contactId);
  }

  @Patch(":contactId")
  updateContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string,
    @Body() body: UpdateContactDto
  ) {
    return this.updateContactUseCase.execute(currentUser, contactId, body);
  }

  @Delete(":contactId")
  deleteContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string
  ) {
    return this.deleteContactUseCase.execute(currentUser, contactId);
  }

  @Post(":contactId/restore")
  restoreContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string
  ) {
    return this.restoreContactUseCase.execute(currentUser, contactId);
  }

  @Get(":contactId/logs")
  listContactLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string,
    @Query() query: ListContactLogsDto
  ) {
    return this.listContactLogsUseCase.execute(currentUser, contactId, query);
  }

  @Post(":contactId/logs")
  createContactLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string,
    @Body() body: CreateContactLogDto
  ) {
    return this.createContactLogUseCase.execute(currentUser, contactId, {
      loggedAt: new Date(body.loggedAt),
      title: body.title,
      content: body.content,
    });
  }

  @Patch(":contactId/logs/:logId")
  updateContactLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string,
    @Param("logId") logId: string,
    @Body() body: UpdateContactLogDto
  ) {
    return this.updateContactLogUseCase.execute(currentUser, contactId, logId, {
      ...(body.loggedAt !== undefined
        ? { loggedAt: new Date(body.loggedAt) }
        : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
    });
  }

  @Delete(":contactId/logs/:logId")
  deleteContactLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId") contactId: string,
    @Param("logId") logId: string
  ) {
    return this.deleteContactLogUseCase.execute(currentUser, contactId, logId);
  }
}
