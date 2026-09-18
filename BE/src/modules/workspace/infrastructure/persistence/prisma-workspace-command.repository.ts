import {
  ActorType as PrismaActorType,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import type {
  CreateWorkspaceWithOwnerInput,
  CreateWorkspaceWithOwnerResult,
  WorkspaceCommandRepository,
} from "@/modules/workspace/application/ports/workspace-command.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

type WorkspaceCommandClient = ReturnType<typeof resolvePrismaTransactionalClient>;

// 역할 : PrismaWorkspaceCommandRepository가 Workspace 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaWorkspaceCommandRepository
  implements WorkspaceCommandRepository
{
  // 기능 : PrismaService를 주입받아 Workspace 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : Workspace, OWNER 멤버십, WORKSPACE_MEMBER Actor를 생성합니다.
  async createWorkspaceWithOwner(
    input: CreateWorkspaceWithOwnerInput
  ): Promise<CreateWorkspaceWithOwnerResult> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. Workspace row를 생성한다.
    const workspace = await client.workspace.create({
      data: {
        name: input.name,
        kind: PrismaWorkspaceKind.PERSONAL,
      },
      select: {
        id: true,
      },
    });

    // 3. 생성된 Workspace에 현재 사용자를 OWNER 멤버로 연결한다.
    const workspaceMember = await client.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: input.ownerUserId,
        role: PrismaWorkspaceMemberRole.OWNER,
        joinedAt: input.now,
      },
      select: {
        id: true,
      },
    });

    // 4. OWNER WorkspaceMember에 대응하는 WORKSPACE_MEMBER Actor를 생성한다.
    await this.createWorkspaceMemberActor(client, {
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
      displayName: input.ownerDisplayName,
      email: input.ownerEmail,
    });

    // 5. 생성된 Workspace ID만 application 생성 결과로 반환한다.
    return {
      workspaceId: workspace.id,
    };
  }

  // 기능 : WorkspaceMember가 데이터 생성/수정 주체로 기록될 Actor row를 생성합니다.
  private async createWorkspaceMemberActor(
    client: WorkspaceCommandClient,
    input: {
      readonly workspaceId: string;
      readonly workspaceMemberId: string;
      readonly displayName: string | null;
      readonly email: string | null;
    }
  ): Promise<void> {
    // 1. WorkspaceMember 주체를 감사용 Actor로 저장한다.
    await client.actor.create({
      data: {
        workspaceId: input.workspaceId,
        type: PrismaActorType.WORKSPACE_MEMBER,
        workspaceMemberId: input.workspaceMemberId,
        displayNameSnapshot: input.displayName,
        emailSnapshot: input.email,
      },
    });
  }
}
