import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT } from "@/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port";
import { FollowUpDeliverySafeErrorMapper } from "@/modules/follow-up/application/services/follow-up-delivery-safe-error.mapper";
import { NodeFollowUpDeliverySecretEncryptionService } from "@/modules/follow-up/infrastructure/security/node-follow-up-delivery-secret-encryption.service";

@Module({
  imports: [ConfigModule],
  providers: [
    FollowUpDeliverySafeErrorMapper,
    NodeFollowUpDeliverySecretEncryptionService,
    {
      provide: FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
      useExisting: NodeFollowUpDeliverySecretEncryptionService,
    },
  ],
  exports: [
    FollowUpDeliverySafeErrorMapper,
    FOLLOW_UP_DELIVERY_SECRET_ENCRYPTION_PORT,
  ],
})
export class FollowUpModule {}
