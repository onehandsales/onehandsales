import { WorkspaceKind as PrismaWorkspaceKind } from "@prisma/client";
import type {
  WorkspaceSidebarQuery,
  WorkspaceSidebarWorkspaceKind,
  WorkspaceSidebarWorkspaceSummary,
} from "@/modules/workspace/application/ports/workspace-sidebar-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type WorkspaceSidebarWorkspaceRow = {
  readonly id: string;
  readonly name: string;
  readonly kind: PrismaWorkspaceKind;
};

// 역할 : PrismaWorkspaceSidebarQueryRepository가 사이드바 Workspace 조회를 Prisma로 구현합니다.
export class PrismaWorkspaceSidebarQueryRepository
  implements WorkspaceSidebarQuery
{
  // 기능 : PrismaService를 주입받아 Workspace membership 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 현재 사용자가 멤버로 속한 Workspace 요약 목록을 조회합니다.
  async listMySidebarWorkspaces(
    userId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary[]> {
    // 1. 사용자 멤버십 기준으로 접근 가능한 Workspace만 조회한다.
    const workspaceMembers = await this.prismaService.workspaceMember.findMany({
      where: {
        userId,
      },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
            kind: true,
          },
        },
      },
      orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
    });

    // 2. Prisma row를 API에 노출 가능한 Workspace 요약으로 변환한다.
    return workspaceMembers.map((workspaceMember) =>
      this.mapWorkspaceSummary(workspaceMember.workspace)
    );
  }

  // 기능 : 현재 사용자가 멤버로 속한 특정 Workspace 요약을 조회합니다.
  async getMySidebarWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceSidebarWorkspaceSummary | null> {
    // 1. Workspace 단독이 아니라 사용자 멤버십 기준으로 단건 접근 가능 여부를 확인한다.
    const workspaceMember = await this.prismaService.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
            kind: true,
          },
        },
      },
    });

    // 2. 멤버십이 없으면 호출자가 not found로 변환할 수 있게 null을 반환한다.
    if (!workspaceMember) {
      return null;
    }

    // 3. Prisma row를 API에 노출 가능한 Workspace 요약으로 변환한다.
    return this.mapWorkspaceSummary(workspaceMember.workspace);
  }

  // 기능 : Prisma Workspace kind를 application 계층 Workspace kind로 변환합니다.
  private fromPrismaWorkspaceKind(
    kind: PrismaWorkspaceKind
  ): WorkspaceSidebarWorkspaceKind {
    switch (kind) {
      case PrismaWorkspaceKind.PERSONAL:
        return "PERSONAL";
      case PrismaWorkspaceKind.ORGANIZATION:
        return "ORGANIZATION";
    }
  }

  // 기능 : Prisma Workspace row를 사이드바 Workspace 요약으로 변환합니다.
  private mapWorkspaceSummary(
    workspace: WorkspaceSidebarWorkspaceRow
  ): WorkspaceSidebarWorkspaceSummary {
    return {
      id: workspace.id,
      name: workspace.name,
      kind: this.fromPrismaWorkspaceKind(workspace.kind),
    };
  }
}
