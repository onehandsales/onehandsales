import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { BUSINESS_CARD_OCR_PROVIDER } from "@/modules/business-card/application/ports/business-card-ocr.provider";
import { BUSINESS_CARD_SCAN_LOG_REPOSITORY } from "@/modules/business-card/application/ports/business-card-scan-log.repository";
import { BusinessCardApplicationService } from "@/modules/business-card/application/services/business-card-application.service";
import { BusinessCardController } from "@/modules/business-card/presentation/http/business-card.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaBusinessCardScanLogRepository } from "./persistence/prisma-business-card-scan-log.repository";
import { OpenAiBusinessCardOcrProvider } from "./providers/openai-business-card-ocr.provider";

// 역할 : BusinessCardModule 명함 OCR controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [BusinessCardController],
  providers: [
    BusinessCardApplicationService,
    AppLogger,
    {
      provide: BUSINESS_CARD_SCAN_LOG_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaBusinessCardScanLogRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: BUSINESS_CARD_OCR_PROVIDER,
      useFactory: (configService: ConfigService, logger: AppLogger) =>
        new OpenAiBusinessCardOcrProvider(configService, logger),
      inject: [ConfigService, AppLogger],
    },
  ],
})
export class BusinessCardModule {}
