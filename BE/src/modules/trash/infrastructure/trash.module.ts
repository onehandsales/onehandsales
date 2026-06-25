import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { TRASH_REPOSITORY } from "../application/ports/trash.repository";
import { TrashApplicationService } from "../application/services/trash-application.service";
import { TrashController } from "../presentation/http/trash.controller";
import { PrismaTrashRepository } from "./persistence/prisma-trash.repository";

// 역할 : TrashModule 휴지통 API와 Prisma 저장소 의존성을 구성합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [TrashController],
  providers: [
    TrashApplicationService,
    {
      provide: TRASH_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaTrashRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class TrashModule {}
