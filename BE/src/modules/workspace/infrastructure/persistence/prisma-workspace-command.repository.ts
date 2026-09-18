import {
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import type {
  CreateWorkspaceWithOwnerInput,
  CreateWorkspaceWithOwnerResult,
  WorkspaceCommandRepository,
} from "@/modules/workspace/application/ports/workspace-command.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaWorkspaceCommandRepository가 Workspace 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaWorkspaceCommandRepository
  implements WorkspaceCommandRepository
{
  // 기능 : PrismaService를 주입받아 Workspace 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : Workspace와 현재 사용자의 OWNER 멤버십을 생성합니다.
  async createWorkspaceWithOwner(
    input: CreateWorkspaceWithOwnerInput
  ): Promise<CreateWorkspaceWithOwnerResult> {
    // 1. Workspace와 OWNER WorkspaceMember를 nested create로 함께 생성한다.
    const workspace = await this.prismaService.workspace.create({
      data: {
        name: input.name,
        kind: PrismaWorkspaceKind.PERSONAL,
        members: {
          create: {
            userId: input.ownerUserId,
            role: PrismaWorkspaceMemberRole.OWNER,
            joinedAt: input.now,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // 2. 생성된 Workspace ID만 application 생성 결과로 반환한다.
    return {
      workspaceId: workspace.id,
    };
  }
}
