import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { TRASH_REPOSITORY } from "@/modules/trash/application/ports/trash.repository";
import { ListTrashUseCase } from "@/modules/trash/application/use-cases/list-trash.use-case";
import { PermanentlyDeleteTrashItemUseCase } from "@/modules/trash/application/use-cases/permanently-delete-trash-item.use-case";
import { PurgeExpiredTrashUseCase } from "@/modules/trash/application/use-cases/purge-expired-trash.use-case";
import { RestoreTrashItemUseCase } from "@/modules/trash/application/use-cases/restore-trash-item.use-case";
import { PrismaTrashRepository } from "@/modules/trash/infrastructure/persistence/prisma-trash.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { TrashController } from "./presentation/http/trash.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [TrashController],
  providers: [
    ListTrashUseCase,
    RestoreTrashItemUseCase,
    PermanentlyDeleteTrashItemUseCase,
    PurgeExpiredTrashUseCase,
    {
      provide: TRASH_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaTrashRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [PurgeExpiredTrashUseCase],
})
export class TrashModule {}
