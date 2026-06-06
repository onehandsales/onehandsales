import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { CONTACT_REPOSITORY } from "@/modules/contact/application/ports/contact.repository";
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
import { PrismaContactRepository } from "@/modules/contact/infrastructure/persistence/prisma-contact.repository";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { ENCRYPTION_PORT } from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { ContactController } from "./presentation/http/contact.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [ContactController],
  providers: [
    ListContactsUseCase,
    CreateContactUseCase,
    GetContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    RestoreContactUseCase,
    ListContactLogsUseCase,
    CreateContactLogUseCase,
    UpdateContactLogUseCase,
    DeleteContactLogUseCase,
    {
      provide: CONTACT_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaContactRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
  ],
})
export class ContactModule {}
