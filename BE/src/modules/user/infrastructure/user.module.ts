import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { USER_REPOSITORY } from "../application/ports/user.repository";
import { CompleteJobSelectionOnboardingUseCase } from "../application/use-cases/complete-job-selection-onboarding.use-case";
import { GetMyProfileUseCase } from "../application/use-cases/get-my-profile.use-case";
import { ListMyDevicesUseCase } from "../application/use-cases/list-my-devices.use-case";
import { UpdateMyProfileUseCase } from "../application/use-cases/update-my-profile.use-case";
import { UserMeController } from "../presentation/http/user-me.controller";
import { PrismaUserRepository } from "./persistence/prisma-user.repository";

// 역할 : UserModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [UserMeController],
  providers: [
    CompleteJobSelectionOnboardingUseCase,
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    ListMyDevicesUseCase,
    {
      provide: USER_REPOSITORY,
      // 기능 : Prisma 서비스로 사용자 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaUserRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class UserModule {}

