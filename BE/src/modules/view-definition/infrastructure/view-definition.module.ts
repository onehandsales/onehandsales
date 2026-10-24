import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { VIEW_FAVORITE_SIDEBAR_QUERY } from "@/modules/view-definition/application/ports/view-favorite-sidebar-query.port";
import { ListSidebarViewFavoritesUseCase } from "@/modules/view-definition/application/use-cases/list-sidebar-view-favorites.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaViewFavoriteSidebarQueryRepository } from "./persistence/prisma-view-favorite-sidebar-query.repository";
import { UserSidebarWorkspaceViewFavoritesController } from "../presentation/http/user-sidebar-workspace-view-favorites.controller";

// 역할 : View와 즐겨찾기의 사이드바 조회 책임과 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, WorkspaceModule, PrismaInfrastructureModule],
  controllers: [UserSidebarWorkspaceViewFavoritesController],
  providers: [
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
