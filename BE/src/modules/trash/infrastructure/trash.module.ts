import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { NotificationModule } from "@/modules/notification/infrastructure/notification.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { TRASH_REPOSITORY } from "../application/ports/trash.repository";
import { TrashApplicationService } from "../application/services/trash-application.service";
import { TrashController } from "../presentation/http/trash.controller";
import { PrismaTrashRepository } from "./persistence/prisma-trash.repository";

// 역할 : TrashModule 휴지통 API와 Prisma 저장소 의존성을 구성합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule, NotificationModule],
  controllers: [TrashController],
  providers: [
    TrashApplicationService,
    AppLogger,
    {
      provide: TRASH_REPOSITORY,
      // 기능 : Prisma 서비스로 transaction 가능한 Trash 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaTrashRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class TrashModule {}
