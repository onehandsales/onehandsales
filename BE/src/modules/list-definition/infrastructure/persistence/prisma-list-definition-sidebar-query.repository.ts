import type {
  ListDefinitionSidebarQuery,
  SidebarListDefinitionListItem,
} from "@/modules/list-definition/application/ports/list-definition-sidebar-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : Workspace의 사이드바 업무 목록 조회를 Prisma로 구현합니다.
export class PrismaListDefinitionSidebarQueryRepository
  implements ListDefinitionSidebarQuery
{
  // 기능 : ListDefinition 조회에 사용할 Prisma 서비스를 주입받습니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 요청 Workspace의 List 이름과 아이콘을 생성순으로 조회합니다.
  async listSidebarListDefinitions(
    workspaceId: string
  ): Promise<SidebarListDefinitionListItem[]> {
    // 1. Workspace 경계를 적용하고 생성 시각과 ID 오름차순으로 요약 필드만 조회한다.
    return this.prismaService.listDefinition.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        icon: true,
        name: true,
      },
    });
  }
}
