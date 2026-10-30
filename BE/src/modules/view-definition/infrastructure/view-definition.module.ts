import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RecordDefinitionModule } from "@/modules/record-definition/infrastructure/record-definition.module";
import { VIEW_DATA_CONFIGURATION_QUERY } from "../application/ports/view-data-configuration-query.port";
import { VIEW_DATA_TOKEN_CODEC } from "../application/ports/view-data-token-codec.port";
import { ViewDataLoader } from "../application/view-data/view-data-loader";
import { GetWorkspaceViewMainContentUseCase } from "../application/use-cases/get-workspace-view-main-content.use-case";
import { PrismaViewDataConfigurationQueryRepository } from "./persistence/prisma-view-data-configuration-query.repository";
import { EncryptedViewDataTokenCodec } from "./view-data-token-codec";
import { UserWorkspaceViewMainContentController } from "../presentation/http/user-workspace-view-main-content.controller";
import { AttributeDefinitionModule } from "@/modules/attribute-definition/infrastructure/attribute-definition.module";
import { VIEW_HEADER_CONFIGURATION_QUERY, VIEW_HEADER_CLOCK } from "../application/ports/view-header-configuration-query.port";
import { ViewHeaderMenuReader } from "../application/view-header-menu-reader";
import { GetWorkspaceViewFiltersUseCase } from "../application/use-cases/get-workspace-view-filters.use-case";
import { GetWorkspaceViewSortsUseCase } from "../application/use-cases/get-workspace-view-sorts.use-case";
import { GetWorkspaceViewSettingsUseCase } from "../application/use-cases/get-workspace-view-settings.use-case";
import { PrismaViewHeaderConfigurationQueryRepository } from "./persistence/prisma-view-header-configuration-query.repository";
import { UserWorkspaceViewHeaderMenusController } from "../presentation/http/user-workspace-view-header-menus.controller";
import { VIEW_FAVORITE_COMMAND_REPOSITORY } from "@/modules/view-definition/application/ports/view-favorite-command.repository";
import { CreateWorkspaceViewFavoriteUseCase } from "@/modules/view-definition/application/use-cases/create-workspace-view-favorite.use-case";
import { DeleteWorkspaceViewFavoriteUseCase } from "@/modules/view-definition/application/use-cases/delete-workspace-view-favorite.use-case";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
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
import { PrismaViewFavoriteCommandRepository } from "./persistence/prisma-view-favorite-command.repository";
import { PrismaViewFavoriteSidebarQueryRepository } from "./persistence/prisma-view-favorite-sidebar-query.repository";
import { PrismaViewDefinitionHeaderQueryRepository } from "./persistence/prisma-view-definition-header-query.repository";
import { PrismaObjectDefinitionViewsQueryRepository } from "./persistence/prisma-object-definition-views-query.repository";
import { PrismaListDefinitionViewsQueryRepository } from "./persistence/prisma-list-definition-views-query.repository";
import { UserWorkspaceObjectViewsController } from "../presentation/http/user-workspace-object-views.controller";
import { UserWorkspaceListViewsController } from "../presentation/http/user-workspace-list-views.controller";
import { UserWorkspaceViewHeaderController } from "../presentation/http/user-workspace-view-header.controller";
import { UserSidebarWorkspaceViewFavoritesController } from "../presentation/http/user-sidebar-workspace-view-favorites.controller";
import { UserWorkspaceViewFavoriteController } from "../presentation/http/user-workspace-view-favorite.controller";

// 역할 : View 헤더·보기 목록·개인 즐겨찾기 조회·변경과 공개 Port 의존성을 조립합니다.
@Module({
  imports: [
    ConfigModule,
    RecordDefinitionModule,
    AttributeDefinitionModule,
    AuthModule,
    WorkspaceModule,
    ObjectDefinitionModule,
    ListDefinitionModule,
    PrismaInfrastructureModule,
  ],
  controllers: [
    UserWorkspaceViewMainContentController,
    UserWorkspaceViewHeaderMenusController,
    UserWorkspaceObjectViewsController,
    UserWorkspaceListViewsController,
    UserSidebarWorkspaceViewFavoritesController,
    UserWorkspaceViewHeaderController,
    UserWorkspaceViewFavoriteController,
  ],
  providers: [
    ViewDataLoader,
    GetWorkspaceViewMainContentUseCase,
    { provide: VIEW_DATA_CONFIGURATION_QUERY, useClass: PrismaViewDataConfigurationQueryRepository },
    {
      provide: VIEW_DATA_TOKEN_CODEC,
      // 기능 : 서버 설정에서 cursor 전용 암호화 adapter를 조립합니다.
      useFactory: (config: ConfigService) => new EncryptedViewDataTokenCodec(() => config.getOrThrow<string>("APP_JWT_SECRET")),
      inject: [ConfigService],
    },
    ViewHeaderMenuReader,
    GetWorkspaceViewFiltersUseCase,
    GetWorkspaceViewSortsUseCase,
    GetWorkspaceViewSettingsUseCase,
    {
      provide: VIEW_HEADER_CONFIGURATION_QUERY,
      // 기능 : View 소유 설정의 Prisma 읽기 구현체를 조립합니다.
      useFactory: (prisma: PrismaService) => new PrismaViewHeaderConfigurationQueryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: VIEW_HEADER_CLOCK,
      // 기능 : application에 현재 경과 시간 측정 수단을 제공합니다.
      useValue: () => Date.now(),
    },
    AppLogger,
    { provide: APPLICATION_LOGGER, useExisting: AppLogger },
    CreateWorkspaceViewFavoriteUseCase,
    DeleteWorkspaceViewFavoriteUseCase,
    {
      provide: VIEW_FAVORITE_COMMAND_REPOSITORY,
      // 기능 : View 소유 데이터의 transaction 기반 즐겨찾기 쓰기 구현체를 조립합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaViewFavoriteCommandRepository(prismaService),
      inject: [PrismaService],
    },
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
