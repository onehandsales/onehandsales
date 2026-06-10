import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { USER_REPOSITORY } from "./application/ports/user.repository";
import { GetMyProfileUseCase } from "./application/use-cases/get-my-profile.use-case";
import { ListMyDevicesUseCase } from "./application/use-cases/list-my-devices.use-case";
import { UpdateMyProfileUseCase } from "./application/use-cases/update-my-profile.use-case";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { UserMeController } from "./presentation/http/user-me.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [UserMeController],
  providers: [
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    ListMyDevicesUseCase,
    {
      provide: USER_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaUserRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class UserModule {}

