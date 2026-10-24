import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { LIST_DEFINITION_SIDEBAR_QUERY } from "@/modules/list-definition/application/ports/list-definition-sidebar-query.port";
import { ListSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/list-sidebar-list-definitions.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaListDefinitionSidebarQueryRepository } from "./persistence/prisma-list-definition-sidebar-query.repository";
import { UserSidebarWorkspaceListsController } from "../presentation/http/user-sidebar-workspace-lists.controller";

// 역할 : 업무 목록 조회 API의 Controller와 Port 구현체 의존성을 조립합니다.
@Module({
  imports: [AuthModule, WorkspaceModule, PrismaInfrastructureModule],
  controllers: [UserSidebarWorkspaceListsController],
  providers: [
    ListSidebarListDefinitionsUseCase,
    {
      provide: LIST_DEFINITION_SIDEBAR_QUERY,
      // 기능 : Prisma 서비스로 사이드바 업무 목록 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaListDefinitionSidebarQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class ListDefinitionModule {}
