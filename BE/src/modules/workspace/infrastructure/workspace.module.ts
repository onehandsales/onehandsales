import { Module } from "@nestjs/common";
import { WORKSPACE_ONBOARDING } from "@/modules/workspace/application/ports/workspace-onboarding.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaWorkspaceOnboardingRepository } from "./persistence/prisma-workspace-onboarding.repository";

// 역할 : WorkspaceModule이 Workspace onboarding provider 의존성을 조립합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [
    {
      provide: WORKSPACE_ONBOARDING,
      // 기능 : Prisma 서비스로 Workspace onboarding 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaWorkspaceOnboardingRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [WORKSPACE_ONBOARDING],
})
export class WorkspaceModule {}
