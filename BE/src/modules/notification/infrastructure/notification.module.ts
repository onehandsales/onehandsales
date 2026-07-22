import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { NotificationApplicationService } from "@/modules/notification/application/services/notification-application.service";
import { NotificationController } from "@/modules/notification/presentation/http/notification.controller";
import { BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT } from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import { NOTIFICATION_REPOSITORY } from "@/modules/notification/application/ports/notification.repository";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaNotificationRepository } from "./persistence/prisma-notification.repository";
import { NodeBrowserPushSubscriptionEncryptionService } from "./security/node-browser-push-subscription-encryption.service";

// 역할 : NotificationModule 알림 기반 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, ConfigModule, PrismaInfrastructureModule],
  controllers: [NotificationController],
  providers: [
    NotificationApplicationService,
    AppLogger,
    NodeBrowserPushSubscriptionEncryptionService,
    {
      provide: NOTIFICATION_REPOSITORY,
      // 기능 : Prisma 서비스로 알림 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaNotificationRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT,
      useExisting: NodeBrowserPushSubscriptionEncryptionService,
    },
  ],
  exports: [
    NotificationApplicationService,
    NOTIFICATION_REPOSITORY,
    BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT,
  ],
})
export class NotificationModule {}
