import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalyticsRecorderModule } from "@/modules/analytics/infrastructure/analytics-recorder.module";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { XlsxInfrastructureModule } from "@/shared/infrastructure/xlsx/xlsx-infrastructure.module";
import { PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT } from "../application/ports/product-private-memo-encryption.port";
import { PRODUCT_REPOSITORY } from "../application/ports/product.repository";
import { ProductApplicationService } from "../application/services/product-application.service";
import { PrismaProductRepository } from "./persistence/prisma-product.repository";
import { NodeProductPrivateMemoEncryptionService } from "./security/node-product-private-memo-encryption.service";
import {
  ProductCategoryController,
  ProductController,
  ProductStatusController,
} from "../presentation/http/product.controller";

// 역할 : ProductModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    AnalyticsRecorderModule,
    ConfigModule,
    PrismaInfrastructureModule,
    XlsxInfrastructureModule,
  ],
  controllers: [
    ProductController,
    ProductCategoryController,
    ProductStatusController,
  ],
  providers: [
    ProductApplicationService,
    NodeProductPrivateMemoEncryptionService,
    AppLogger,
    {
      provide: PRODUCT_REPOSITORY,
      // 기능 : Prisma 서비스로 제품 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaProductRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT,
      useExisting: NodeProductPrivateMemoEncryptionService,
    },
  ],
})
export class ProductModule {}
