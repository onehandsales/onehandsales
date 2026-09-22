import type {
  ObjectDefinitionSidebarQuery,
  SidebarObjectDefinitionListItem,
} from "@/modules/object-definition/application/ports/object-definition-sidebar-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaObjectDefinitionSidebarQueryRepository가 사이드바 ObjectDefinition 조회를 Prisma로 구현합니다.
export class PrismaObjectDefinitionSidebarQueryRepository
  implements ObjectDefinitionSidebarQuery
{
  // 기능 : PrismaService를 주입받아 ObjectDefinition 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 특정 Workspace에 속한 ObjectDefinition 요약 목록을 생성순으로 조회합니다.
  async listSidebarObjectDefinitions(
    workspaceId: string
  ): Promise<SidebarObjectDefinitionListItem[]> {
    // 1. Workspace 경계 안의 ObjectDefinition을 생성 시각과 ID 오름차순으로 조회한다.
    const objectDefinitions =
      await this.prismaService.objectDefinition.findMany({
        where: {
          workspaceId,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          icon: true,
          singularName: true,
          pluralName: true,
        },
      });

    // 2. Prisma row를 사이드바 Items 섹션 응답 형태로 반환한다.
    return objectDefinitions;
  }
}
