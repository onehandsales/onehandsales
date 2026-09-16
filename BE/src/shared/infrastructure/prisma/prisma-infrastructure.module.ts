import { Module } from "@nestjs/common";
import { TRANSACTION_MANAGER } from "@/shared/application/ports/transaction-manager.port";
import { PrismaTransactionManager } from "./prisma-transaction-manager";
import { PrismaService } from "./prisma.service";

// 역할 : PrismaInfrastructureModule Prisma 서비스 provider를 공유 인프라 모듈로 제공합니다.
@Module({
  providers: [
    PrismaService,
    PrismaTransactionManager,
    {
      provide: TRANSACTION_MANAGER,
      useExisting: PrismaTransactionManager,
    },
  ],
  exports: [PrismaService, TRANSACTION_MANAGER],
})
export class PrismaInfrastructureModule {}
