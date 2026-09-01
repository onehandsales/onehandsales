import { Module } from "@nestjs/common";
import { PUBLIC_CONTACT_REQUEST_REPOSITORY } from "@/modules/public-contact-request/application/ports/public-contact-request.repository";
import { PublicContactRequestApplicationService } from "@/modules/public-contact-request/application/services/public-contact-request-application.service";
import { PublicContactRequestController } from "@/modules/public-contact-request/presentation/http/public-contact-request.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaPublicContactRequestRepository } from "./persistence/prisma-public-contact-request.repository";

// 역할 : PublicContactRequestModule 공개 문의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  controllers: [PublicContactRequestController],
  providers: [
    PublicContactRequestApplicationService,
    AppLogger,
    {
      provide: PUBLIC_CONTACT_REQUEST_REPOSITORY,
      // 기능 : Prisma 서비스로 공개 문의 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaPublicContactRequestRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class PublicContactRequestModule {}
