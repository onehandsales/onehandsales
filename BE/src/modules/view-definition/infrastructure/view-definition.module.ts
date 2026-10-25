import { Module } from "@nestjs/common";
import { OBJECT_DEFINITION_VIEWS_QUERY } from "@/modules/view-definition/application/ports/object-definition-views-query.port";
import { LIST_DEFINITION_VIEWS_QUERY } from "@/modules/view-definition/application/ports/list-definition-views-query.port";
import { ListWorkspaceObjectViewsUseCase } from "@/modules/view-definition/application/use-cases/list-workspace-object-views.use-case";
import { ListWorkspaceListViewsUseCase } from "@/modules/view-definition/application/use-cases/list-workspace-list-views.use-case";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { ListDefinitionModule } from "@/modules/list-definition/infrastructure/list-definition.module";
import { VIEW_DEFINITION_HEADER_QUERY } from "@/modules/view-definition/application/ports/view-definition-header-query.port";
import { GetWorkspaceViewHeaderUseCase } from "@/modules/view-definition/application/use-cases/get-workspace-view-header.use-case";
import { VIEW_FAVORITE_SIDEBAR_QUERY } from "@/modules/view-definition/application/ports/view-favorite-sidebar-query.port";
import { ListSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaViewFavoriteSidebarQueryRepository } from "./persistence/prisma-view-favorite-sidebar-query.repository";
import { PrismaViewDefinitionHeaderQueryRepository } from "./persistence/prisma-view-definition-header-query.repository";
import { PrismaObjectDefinitionViewsQueryRepository } from "./persistence/prisma-object-definition-views-query.repository";
import { PrismaListDefinitionViewsQueryRepository } from "./persistence/prisma-list-definition-views-query.repository";
import { UserWorkspaceObjectViewsController } from "../presentation/http/user-workspace-object-views.controller";
import { UserWorkspaceListViewsController } from "../presentation/http/user-workspace-list-views.controller";
import { UserWorkspaceViewHeaderController } from "../presentation/http/user-workspace-view-header.controller";
import { UserSidebarWorkspaceViewFavoritesController } from "../presentation/http/user-sidebar-workspace-view-favorites.controller";

// 역할 : View 헤더·대상별 보기 목록·즐겨찾기 조회와 공개 Port 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    WorkspaceModule,
    ObjectDefinitionModule,
    ListDefinitionModule,
    PrismaInfrastructureModule,
  ],
  controllers: [
    UserWorkspaceObjectViewsController,
    UserWorkspaceListViewsController,
    UserSidebarWorkspaceViewFavoritesController,
    UserWorkspaceViewHeaderController,
  ],
  providers: [
    ListWorkspaceObjectViewsUseCase,
    ListWorkspaceListViewsUseCase,
    {
      provide: OBJECT_DEFINITION_VIEWS_QUERY,
      // 기능 : Object 소속 View 전체 목록 조회 구현체를 조립합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaObjectDefinitionViewsQueryRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: LIST_DEFINITION_VIEWS_QUERY,
      // 기능 : List 소속 View 전체 목록 조회 구현체를 조립합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaListDefinitionViewsQueryRepository(prismaService),
      inject: [PrismaService],
    },
    GetWorkspaceViewHeaderUseCase,
    {
      provide: VIEW_DEFINITION_HEADER_QUERY,
      // 기능 : View 소유 모듈의 초기 헤더 조회 구현체를 조립합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaViewDefinitionHeaderQueryRepository(prismaService),
      inject: [PrismaService],
    },
    ListSidebarViewFavoritesUseCase,
    {
      provide: VIEW_FAVORITE_SIDEBAR_QUERY,
      // 기능 : Prisma 서비스로 즐겨찾기 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaViewFavoriteSidebarQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class ViewDefinitionModule {}
