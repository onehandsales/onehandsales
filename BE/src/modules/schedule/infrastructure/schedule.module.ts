import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { NotificationModule } from "@/modules/notification/infrastructure/notification.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { XlsxInfrastructureModule } from "@/shared/infrastructure/xlsx/xlsx-infrastructure.module";
import { GOOGLE_CALENDAR_CONNECTION_REPOSITORY } from "../application/ports/google-calendar-connection.repository";
import { GOOGLE_CALENDAR_OAUTH_PROVIDER } from "../application/ports/google-calendar-oauth.provider";
import { GOOGLE_CALENDAR_READ_PROVIDER } from "../application/ports/google-calendar-read.provider";
import { GOOGLE_CALENDAR_SYNC_REPOSITORY } from "../application/ports/google-calendar-sync.repository";
import { GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT } from "../application/ports/google-calendar-token-encryption.port";
import { SCHEDULE_REPOSITORY } from "../application/ports/schedule.repository";
import { GoogleCalendarConnectionService } from "../application/services/google-calendar-connection.service";
import { GoogleCalendarSyncService } from "../application/services/google-calendar-sync.service";
import { ScheduleApplicationService } from "../application/services/schedule-application.service";
import {
  GoogleCalendarCallbackController,
  GoogleCalendarController,
} from "../presentation/http/google-calendar.controller";
import { ScheduleController } from "../presentation/http/schedule.controller";
import { GoogleCalendarReadProviderAdapter } from "./providers/google-calendar-read.provider";
import { GoogleCalendarOAuthProviderAdapter } from "./providers/google-calendar-oauth.provider";
import { PrismaGoogleCalendarConnectionRepository } from "./persistence/prisma-google-calendar-connection.repository";
import { PrismaGoogleCalendarSyncRepository } from "./persistence/prisma-google-calendar-sync.repository";
import { PrismaScheduleRepository } from "./persistence/prisma-schedule.repository";
import { NodeGoogleCalendarTokenEncryptionAdapter } from "./security/node-google-calendar-token-encryption.adapter";

// 역할 : ScheduleModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    PrismaInfrastructureModule,
    NotificationModule,
    XlsxInfrastructureModule,
  ],
  controllers: [
    ScheduleController,
    GoogleCalendarController,
    GoogleCalendarCallbackController,
  ],
  providers: [
    ScheduleApplicationService,
    GoogleCalendarConnectionService,
    GoogleCalendarSyncService,
    GoogleCalendarOAuthProviderAdapter,
    GoogleCalendarReadProviderAdapter,
    NodeGoogleCalendarTokenEncryptionAdapter,
    AppLogger,
    {
      provide: SCHEDULE_REPOSITORY,
      // 기능 : Prisma 서비스로 일정 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaScheduleRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: GOOGLE_CALENDAR_CONNECTION_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaGoogleCalendarConnectionRepository(
          prismaService,
          prismaService
        ),
      inject: [PrismaService],
    },
    {
      provide: GOOGLE_CALENDAR_SYNC_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaGoogleCalendarSyncRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: GOOGLE_CALENDAR_OAUTH_PROVIDER,
      useExisting: GoogleCalendarOAuthProviderAdapter,
    },
    {
      provide: GOOGLE_CALENDAR_READ_PROVIDER,
      useExisting: GoogleCalendarReadProviderAdapter,
    },
    {
      provide: GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT,
      useExisting: NodeGoogleCalendarTokenEncryptionAdapter,
    },
  ],
})
export class ScheduleModule {}
