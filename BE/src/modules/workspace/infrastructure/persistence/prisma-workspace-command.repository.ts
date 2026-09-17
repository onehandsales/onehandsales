import {
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import type {
  CreateWorkspaceWithOwnerInput,
  CreateWorkspaceWithOwnerResult,
  WorkspaceCommandMemberRole,
  WorkspaceCommandRepository,
  WorkspaceCommandWorkspaceKind,
} from "@/modules/workspace/application/ports/workspace-command.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type WorkspaceWithOwnerMemberRow = {
  readonly id: string;
  readonly name: string;
  readonly kind: PrismaWorkspaceKind;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly members: readonly WorkspaceOwnerMemberRow[];
};

type WorkspaceOwnerMemberRow = {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: PrismaWorkspaceMemberRole;
  readonly joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

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
      include: {
        members: {
          where: {
            userId: input.ownerUserId,
          },
          orderBy: {
            joinedAt: "desc",
          },
          take: 1,
        },
      },
    });

    // 2. Prisma row를 application 생성 결과로 변환해 반환한다.
    return this.mapWorkspaceWithOwnerMember(workspace);
  }

  // 기능 : Prisma Workspace와 OWNER 멤버십 row를 생성 결과 레코드로 변환합니다.
  private mapWorkspaceWithOwnerMember(
    workspace: WorkspaceWithOwnerMemberRow
  ): CreateWorkspaceWithOwnerResult {
    const workspaceMember = workspace.members[0];

    if (!workspaceMember) {
      throw new Error("Workspace owner member was not created.");
    }

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        kind: this.fromPrismaWorkspaceKind(workspace.kind),
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
      workspaceMember: {
        id: workspaceMember.id,
        workspaceId: workspaceMember.workspaceId,
        userId: workspaceMember.userId,
        role: this.fromPrismaWorkspaceMemberRole(workspaceMember.role),
        joinedAt: workspaceMember.joinedAt,
        createdAt: workspaceMember.createdAt,
        updatedAt: workspaceMember.updatedAt,
      },
    };
  }

  // 기능 : Prisma WorkspaceKind enum을 Workspace 생성 종류 값으로 변환합니다.
  private fromPrismaWorkspaceKind(
    kind: PrismaWorkspaceKind
  ): WorkspaceCommandWorkspaceKind {
    switch (kind) {
      case PrismaWorkspaceKind.PERSONAL:
        return "PERSONAL";
      case PrismaWorkspaceKind.ORGANIZATION:
        return "ORGANIZATION";
    }
  }

  // 기능 : Prisma WorkspaceMemberRole enum을 Workspace 생성 멤버 역할 값으로 변환합니다.
  private fromPrismaWorkspaceMemberRole(
    role: PrismaWorkspaceMemberRole
  ): WorkspaceCommandMemberRole {
    switch (role) {
      case PrismaWorkspaceMemberRole.OWNER:
        return "OWNER";
      case PrismaWorkspaceMemberRole.ADMIN:
        return "ADMIN";
      case PrismaWorkspaceMemberRole.MEMBER:
        return "MEMBER";
    }
  }
}
