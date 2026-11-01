import { Module } from "@nestjs/common";
import { TRANSACTION_MANAGER } from "@/shared/application/ports/transaction-manager.port";
import { PrismaTransactionManager, PrismaReadSnapshotRunner } from "./prisma-transaction-manager";
import { READ_SNAPSHOT_RUNNER } from "@/shared/application/ports/read-snapshot-runner.port";
import { PrismaService } from "./prisma.service";

// 역할 : PrismaInfrastructureModule Prisma 서비스 provider를 공유 인프라 모듈로 제공합니다.
@Module({
  providers: [
    PrismaService,
    PrismaTransactionManager,
    PrismaReadSnapshotRunner,
    { provide: READ_SNAPSHOT_RUNNER, useExisting: PrismaReadSnapshotRunner },
    {
      provide: TRANSACTION_MANAGER,
      useExisting: PrismaTransactionManager,
    },
  ],
  exports: [PrismaService, TRANSACTION_MANAGER, READ_SNAPSHOT_RUNNER],
})
export class PrismaInfrastructureModule {}
