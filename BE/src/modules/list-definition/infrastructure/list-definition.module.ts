import { Module } from "@nestjs/common";
import { ReorderSidebarListDefinitionsUseCase } from "../application/use-cases/reorder-sidebar-list-definitions.use-case";
import { SIDEBAR_LIST_ORDER_REPOSITORY } from "../application/ports/sidebar-list-order.repository";
import { PrismaSidebarListOrderRepository } from "./persistence/prisma-sidebar-list-order.repository";
import { AttributeDefinitionModule } from "@/modules/attribute-definition/infrastructure/attribute-definition.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { ListInitialViewModule } from "@/modules/view-definition/infrastructure/list-initial-view.module";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { LIST_DEFINITION_COMMAND_REPOSITORY } from "../application/ports/list-definition-command.repository";
import { CreateWorkspaceListDefinitionUseCase } from "../application/use-cases/create-workspace-list-definition.use-case";
import { UserWorkspaceListDefinitionsController } from "../presentation/http/user-workspace-list-definitions.controller";
import { PrismaListDefinitionCommandRepository } from "./persistence/prisma-list-definition-command.repository";
import { LIST_ENTRY_DATA_QUERY } from "../application/ports/list-entry-data-query.port";
import { PrismaListEntryDataQueryRepository } from "./persistence/prisma-list-entry-data-query.repository";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { LIST_DEFINITION_SIDEBAR_QUERY } from "@/modules/list-definition/application/ports/list-definition-sidebar-query.port";
import { LIST_DEFINITION_SUMMARY_QUERY } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import { ListSidebarListDefinitionsUseCase } from "@/modules/list-definition/application/use-cases/list-sidebar-list-definitions.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaListDefinitionSidebarQueryRepository } from "./persistence/prisma-list-definition-sidebar-query.repository";
import { PrismaListDefinitionSummaryQueryRepository } from "./persistence/prisma-list-definition-summary-query.repository";
import { UserSidebarWorkspaceListsController } from "../presentation/http/user-sidebar-workspace-lists.controller";

// 역할 : 업무 목록 조회·생성과 공개 단건 요약 Port의 의존성을 조립합니다.
@Module({
  imports: [AuthModule, WorkspaceModule, PrismaInfrastructureModule, ObjectDefinitionModule, AttributeDefinitionModule, ListInitialViewModule],
  controllers: [UserSidebarWorkspaceListsController, UserWorkspaceListDefinitionsController],
  providers: [
    ReorderSidebarListDefinitionsUseCase,
    {
      provide: SIDEBAR_LIST_ORDER_REPOSITORY,
      // 기능 : 소유 모듈의 순서 저장소를 기존 Prisma/잠금 구현으로 조립한다.
      useFactory: (prisma: PrismaService) => new PrismaSidebarListOrderRepository(prisma),
      inject: [PrismaService],
    },
    CreateWorkspaceListDefinitionUseCase,
    AppLogger,
    { provide: APPLICATION_LOGGER, useExisting: AppLogger },
    { provide: LIST_DEFINITION_COMMAND_REPOSITORY, useClass: PrismaListDefinitionCommandRepository },
    {
      provide: LIST_ENTRY_DATA_QUERY,
      // 기능 : List·Entry 소유 조회 구현체를 공개 batch Port에 연결합니다.
      useFactory: (prisma: PrismaService) => new PrismaListEntryDataQueryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: LIST_DEFINITION_SUMMARY_QUERY,
      // 기능 : 소유 모듈의 Workspace 단건 요약 조회 구현체를 조립합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaListDefinitionSummaryQueryRepository(prismaService),
      inject: [PrismaService],
    },
    ListSidebarListDefinitionsUseCase,
    {
      provide: LIST_DEFINITION_SIDEBAR_QUERY,
      // 기능 : Prisma 서비스로 사이드바 업무 목록 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaListDefinitionSidebarQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
  exports: [LIST_DEFINITION_SUMMARY_QUERY, LIST_ENTRY_DATA_QUERY],
})
export class ListDefinitionModule {}
