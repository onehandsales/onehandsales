import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { USER_REPOSITORY } from "./application/ports/user.repository";
import { DeleteMyAccountUseCase } from "./application/use-cases/delete-my-account.use-case";
import { GetMySettingsUseCase } from "./application/use-cases/get-my-settings.use-case";
import { UpdateMySettingsUseCase } from "./application/use-cases/update-my-settings.use-case";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository";
import { UserMeController } from "./presentation/http/user-me.controller";

@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [UserMeController],
  providers: [
    GetMySettingsUseCase,
    UpdateMySettingsUseCase,
    DeleteMyAccountUseCase,
    {
      provide: USER_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaUserRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class UserModule {}

