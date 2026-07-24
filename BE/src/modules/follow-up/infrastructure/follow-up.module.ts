import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  FOLLOW_UP_EMAIL_DELIVERY_PROVIDER,
  FOLLOW_UP_SMS_DELIVERY_PROVIDER,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import { FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT } from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
import { FOLLOW_UP_SETTINGS_REPOSITORY } from "@/modules/follow-up/application/ports/follow-up-settings.repository";
import { FollowUpDeliverySafeErrorMapper } from "@/modules/follow-up/application/services/follow-up-delivery-safe-error.mapper";
import { FollowUpSettingsApplicationService } from "@/modules/follow-up/application/services/follow-up-settings-application.service";
import { ConfigurableFollowUpEmailDeliveryProvider } from "@/modules/follow-up/infrastructure/delivery/configurable-follow-up-email-delivery.provider";
import { ConfigurableFollowUpSmsDeliveryProvider } from "@/modules/follow-up/infrastructure/delivery/configurable-follow-up-sms-delivery.provider";
import { PrismaFollowUpSettingsRepository } from "@/modules/follow-up/infrastructure/persistence/prisma-follow-up-settings.repository";
import { NodeFollowUpDeliverySecretEncryptionService } from "@/modules/follow-up/infrastructure/security/node-follow-up-delivery-secret-encryption.service";
import {
  FollowUpDeliverySettingsController,
  FollowUpEmailConnectionCallbackController,
} from "@/modules/follow-up/presentation/http/follow-up-delivery-settings.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

@Module({
  imports: [ConfigModule, PrismaInfrastructureModule],
  controllers: [
    FollowUpDeliverySettingsController,
    FollowUpEmailConnectionCallbackController,
  ],
  providers: [
    FollowUpSettingsApplicationService,
    FollowUpDeliverySafeErrorMapper,
    ConfigurableFollowUpEmailDeliveryProvider,
    ConfigurableFollowUpSmsDeliveryProvider,
    NodeFollowUpDeliverySecretEncryptionService,
    AppLogger,
    {
      provide: FOLLOW_UP_SETTINGS_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaFollowUpSettingsRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
      useExisting: NodeFollowUpDeliverySecretEncryptionService,
    },
    {
      provide: FOLLOW_UP_EMAIL_DELIVERY_PROVIDER,
      useExisting: ConfigurableFollowUpEmailDeliveryProvider,
    },
    {
      provide: FOLLOW_UP_SMS_DELIVERY_PROVIDER,
      useExisting: ConfigurableFollowUpSmsDeliveryProvider,
    },
  ],
  exports: [
    FollowUpSettingsApplicationService,
    FollowUpDeliverySafeErrorMapper,
    FOLLOW_UP_SETTINGS_REPOSITORY,
    FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
  ],
})
export class FollowUpModule {}
