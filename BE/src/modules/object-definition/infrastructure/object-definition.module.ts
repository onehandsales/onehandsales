import { Module } from "@nestjs/common";
import { OBJECT_DEFINITION_SIDEBAR_QUERY } from "@/modules/object-definition/application/ports/object-definition-sidebar-query.port";
import { ListSidebarObjectDefinitionsUseCase } from "@/modules/object-definition/application/use-cases/list-sidebar-object-definitions.use-case";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaObjectDefinitionSidebarQueryRepository } from "./persistence/prisma-object-definition-sidebar-query.repository";
import { UserSidebarWorkspaceObjectsController } from "../presentation/http/user-sidebar-workspace-objects.controller";
import { UserWorkspaceObjectDefinitionsController } from "../presentation/http/user-workspace-object-definitions.controller";

// 역할 : ObjectDefinitionModule이 ObjectDefinition API와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, WorkspaceModule, PrismaInfrastructureModule],
  controllers: [
    UserSidebarWorkspaceObjectsController,
    UserWorkspaceObjectDefinitionsController,
  ],
  providers: [
    ListSidebarObjectDefinitionsUseCase,
    {
      provide: OBJECT_DEFINITION_SIDEBAR_QUERY,
      // 기능 : Prisma 서비스로 사이드바 ObjectDefinition 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaObjectDefinitionSidebarQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class ObjectDefinitionModule {}
