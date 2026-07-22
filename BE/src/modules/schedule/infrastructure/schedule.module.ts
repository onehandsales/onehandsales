import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { NotificationModule } from "@/modules/notification/infrastructure/notification.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { XlsxInfrastructureModule } from "@/shared/infrastructure/xlsx/xlsx-infrastructure.module";
import { SCHEDULE_REPOSITORY } from "../application/ports/schedule.repository";
import { ScheduleApplicationService } from "../application/services/schedule-application.service";
import { ScheduleController } from "../presentation/http/schedule.controller";
import { PrismaScheduleRepository } from "./persistence/prisma-schedule.repository";

// 역할 : ScheduleModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    PrismaInfrastructureModule,
    NotificationModule,
    XlsxInfrastructureModule,
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleApplicationService,
    AppLogger,
    {
      provide: SCHEDULE_REPOSITORY,
      // 기능 : Prisma 서비스로 일정 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaScheduleRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class ScheduleModule {}
