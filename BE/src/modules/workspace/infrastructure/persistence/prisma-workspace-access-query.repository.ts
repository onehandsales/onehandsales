import { ActorType as PrismaActorType } from "@prisma/client";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaWorkspaceAccessQueryRepository가 Workspace 접근 확인 계약을 Prisma로 구현합니다.
export class PrismaWorkspaceAccessQueryRepository
  implements WorkspaceAccessQuery
{
  // 기능 : PrismaService를 주입받아 Workspace membership 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 현재 사용자가 특정 Workspace의 멤버인지 확인합니다.
  async hasWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    // 1. Workspace 단독 조회가 아니라 사용자 멤버십 기준으로 접근 가능 여부를 확인한다.
    const workspaceMember = await this.prismaService.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        id: true,
      },
    });

    // 2. 멤버십 row 존재 여부를 접근 가능 여부로 반환한다.
    return workspaceMember !== null;
  }

  // 기능 : 현재 사용자가 특정 Workspace의 멤버인지 확인하고 생성 감사 Actor를 조회합니다.
  async getWorkspaceMemberAccess(userId: string, workspaceId: string) {
    // 1. Workspace 단독이 아니라 사용자 멤버십 기준으로 접근 가능한 멤버 row를 조회한다.
    const workspaceMember = await this.prismaService.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
      select: {
        id: true,
        actors: {
          where: {
            type: PrismaActorType.WORKSPACE_MEMBER,
          },
          select: {
            id: true,
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: 1,
        },
      },
    });

    // 2. 멤버십이 없으면 호출자가 not found로 변환할 수 있게 null을 반환한다.
    if (!workspaceMember) {
      return null;
    }

    // 3. 멤버십 ID와 감사 Actor ID를 공개 port 결과로 반환한다.
    return {
      workspaceMemberId: workspaceMember.id,
      actorId: workspaceMember.actors[0]?.id ?? null,
    };
  }
}
