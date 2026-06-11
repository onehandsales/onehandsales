import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT } from "../application/ports/contact-private-memo-encryption.port";
import { CONTACT_REPOSITORY } from "../application/ports/contact.repository";
import { ContactApplicationService } from "../application/services/contact-application.service";
import { PrismaContactRepository } from "./persistence/prisma-contact.repository";
import { NodeContactPrivateMemoEncryptionService } from "./security/node-contact-private-memo-encryption.service";
import {
  ContactController,
  ContactDepartmentController,
  ContactJobGradeController,
} from "../presentation/http/contact.controller";

// 역할 : ContactModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, ConfigModule, PrismaInfrastructureModule],
  controllers: [
    ContactController,
    ContactDepartmentController,
    ContactJobGradeController,
  ],
  providers: [
    ContactApplicationService,
    NodeContactPrivateMemoEncryptionService,
    AppLogger,
    {
      provide: CONTACT_REPOSITORY,
      // 기능 : Prisma 서비스로 거래처 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaContactRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT,
      useExisting: NodeContactPrivateMemoEncryptionService,
    },
  ],
})
export class ContactModule {}
