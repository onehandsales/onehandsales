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
}
