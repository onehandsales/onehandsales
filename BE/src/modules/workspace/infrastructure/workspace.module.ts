import { Module } from "@nestjs/common";
import { WORKSPACE_ONBOARDING } from "@/modules/workspace/application/ports/workspace-onboarding.port";
import { WORKSPACE_SIDEBAR_QUERY } from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { GetMyDefaultSidebarWorkspaceUseCase } from "@/modules/workspace/application/use-cases/get-my-default-sidebar-workspace.use-case";
import { GetMySidebarWorkspaceUseCase } from "@/modules/workspace/application/use-cases/get-my-sidebar-workspace.use-case";
import { ListMySidebarWorkspacesUseCase } from "@/modules/workspace/application/use-cases/list-my-sidebar-workspaces.use-case";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaWorkspaceOnboardingRepository } from "./persistence/prisma-workspace-onboarding.repository";
import { PrismaWorkspaceSidebarQueryRepository } from "./persistence/prisma-workspace-sidebar-query.repository";
import { UserSidebarWorkspacesController } from "../presentation/http/user-sidebar-workspaces.controller";

// 역할 : WorkspaceModule이 Workspace API와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [UserSidebarWorkspacesController],
  providers: [
    ListMySidebarWorkspacesUseCase,
    GetMyDefaultSidebarWorkspaceUseCase,
    GetMySidebarWorkspaceUseCase,
    {
      provide: WORKSPACE_ONBOARDING,
      // 기능 : Prisma 서비스로 Workspace onboarding 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaWorkspaceOnboardingRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: WORKSPACE_SIDEBAR_QUERY,
      // 기능 : Prisma 서비스로 사이드바 Workspace 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaWorkspaceSidebarQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [WORKSPACE_ONBOARDING],
})
export class WorkspaceModule {}
