import type {
  SidebarViewFavoriteListItem,
  SidebarViewFavoriteQueryInput,
  ViewFavoriteSidebarQuery,
} from "@/modules/view-definition/application/ports/view-favorite-sidebar-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 멤버별 즐겨찾기와 같은 Workspace의 View 요약을 Prisma로 조회합니다.
export class PrismaViewFavoriteSidebarQueryRepository
  implements ViewFavoriteSidebarQuery
{
  // 기능 : 즐겨찾기 조회에 필요한 Prisma delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "viewFavoriteDefinition">
  ) {}

  // 기능 : 개인·Workspace·View 소속을 제한하고 최소 4개 응답 필드만 반환합니다.
  async listSidebarViewFavorites({
    workspaceId,
    workspaceMemberId,
  }: SidebarViewFavoriteQueryInput): Promise<SidebarViewFavoriteListItem[]> {
    // 1. 기본 ID FK가 강제하지 않는 View의 Workspace 범위도 조회 조건에 포함한다.
    const favorites = await this.prismaService.viewFavoriteDefinition.findMany({
      where: {
        workspaceId,
        workspaceMemberId,
        viewDefinition: { workspaceId },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        viewDefinitionId: true,
        viewDefinition: { select: { name: true, icon: true } },
      },
    });

    // 2. 즐겨찾기와 View의 식별자를 구분하고 표시 필드를 평탄화한다.
    return favorites.map((favorite) => ({
      id: favorite.id,
      viewDefinitionId: favorite.viewDefinitionId,
      name: favorite.viewDefinition.name,
      icon: favorite.viewDefinition.icon,
    }));
  }
}
