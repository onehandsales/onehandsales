import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { DEAL_REPOSITORY } from "@/modules/deal/application/ports/deal.repository";
import { ChangeDealStageUseCase } from "@/modules/deal/application/use-cases/change-deal-stage.use-case";
import { CompleteDealNextActionUseCase } from "@/modules/deal/application/use-cases/complete-deal-next-action.use-case";
import { CreateDealUseCase } from "@/modules/deal/application/use-cases/create-deal.use-case";
import { CreateDealActivityUseCase } from "@/modules/deal/application/use-cases/create-deal-activity.use-case";
import { DeleteDealUseCase } from "@/modules/deal/application/use-cases/delete-deal.use-case";
import { DeleteDealActivityUseCase } from "@/modules/deal/application/use-cases/delete-deal-activity.use-case";
import { GetDealUseCase } from "@/modules/deal/application/use-cases/get-deal.use-case";
import { ListDealsUseCase } from "@/modules/deal/application/use-cases/list-deals.use-case";
import { ListDealActivitiesUseCase } from "@/modules/deal/application/use-cases/list-deal-activities.use-case";
import { RestoreDealUseCase } from "@/modules/deal/application/use-cases/restore-deal.use-case";
import { SnoozeDealNextActionUseCase } from "@/modules/deal/application/use-cases/snooze-deal-next-action.use-case";
import { UpdateDealUseCase } from "@/modules/deal/application/use-cases/update-deal.use-case";
import { UpdateDealActivityUseCase } from "@/modules/deal/application/use-cases/update-deal-activity.use-case";
import { UpdateDealNextActionUseCase } from "@/modules/deal/application/use-cases/update-deal-next-action.use-case";
import { PrismaDealRepository } from "@/modules/deal/infrastructure/persistence/prisma-deal.repository";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { ENCRYPTION_PORT } from "@/shared/application/ports/encryption.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SecurityInfrastructureModule } from "@/shared/infrastructure/security/security-infrastructure.module";
import { DealController } from "./presentation/http/deal.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule, SecurityInfrastructureModule],
  controllers: [DealController],
  providers: [
    ListDealsUseCase,
    CreateDealUseCase,
    GetDealUseCase,
    UpdateDealUseCase,
    ChangeDealStageUseCase,
    UpdateDealNextActionUseCase,
    CompleteDealNextActionUseCase,
    SnoozeDealNextActionUseCase,
    DeleteDealUseCase,
    RestoreDealUseCase,
    ListDealActivitiesUseCase,
    CreateDealActivityUseCase,
    UpdateDealActivityUseCase,
    DeleteDealActivityUseCase,
    {
      provide: DEAL_REPOSITORY,
      useFactory: (
        prismaService: PrismaService,
        encryptionPort: EncryptionPort
      ) => new PrismaDealRepository(prismaService, encryptionPort),
      inject: [PrismaService, ENCRYPTION_PORT],
    },
  ],
})
export class DealModule {}
