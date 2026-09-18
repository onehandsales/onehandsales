import {
  ActorType as PrismaActorType,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import type {
  EnsureOwnerWorkspaceForOnboardingInput,
  WorkspaceOnboardingKind,
  WorkspaceOnboardingMemberRole,
  WorkspaceOnboardingPort,
  WorkspaceOnboardingResult,
} from "@/modules/workspace/application/ports/workspace-onboarding.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

type WorkspaceOnboardingClient = ReturnType<typeof resolvePrismaTransactionalClient>;

type WorkspaceMemberWithWorkspaceRow = {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: PrismaWorkspaceMemberRole;
  readonly joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly workspace: {
    readonly id: string;
    readonly name: string;
    readonly kind: PrismaWorkspaceKind;
    readonly organizationName: string | null;
    readonly organizationDomain: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
};

// 역할 : PrismaWorkspaceOnboardingRepository가 Workspace onboarding 포트를 Prisma로 구현합니다.
export class PrismaWorkspaceOnboardingRepository
  implements WorkspaceOnboardingPort
{
  // 기능 : PrismaService를 주입받아 Workspace onboarding DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 사용자의 온보딩용 OWNER WorkspaceMember를 조회하거나 없으면 생성합니다.
  async ensureOwnerWorkspaceForOnboarding(
    input: EnsureOwnerWorkspaceForOnboardingInput
  ): Promise<WorkspaceOnboardingResult> {
    // 1. 전달된 transaction context가 있으면 같은 transaction client를 사용한다.
    const client = this.getClient(input.transactionContext);

    // 2. 현재 사용자가 OWNER로 가진 WorkspaceMember를 먼저 조회한다.
    const ownerWorkspaceMember = await this.findOwnerWorkspaceMember(
      client,
      input.userId
    );

    // 3. OWNER 멤버십이 없으면 기본 Workspace와 OWNER WorkspaceMember를 생성한다.
    const workspaceMember =
      ownerWorkspaceMember ??
      (await this.createOwnerWorkspaceMember(client, input));

    // 4. Prisma row를 application onboarding 결과로 변환해 반환한다.
    return this.mapWorkspaceOnboardingResult(workspaceMember);
  }

  // 기능 : 현재 transaction context에 맞는 Prisma client를 반환합니다.
  private getClient(
    context: EnsureOwnerWorkspaceForOnboardingInput["transactionContext"]
  ): WorkspaceOnboardingClient {
    return resolvePrismaTransactionalClient(this.prismaService, context);
  }

  // 기능 : 사용자가 OWNER로 참여한 첫 WorkspaceMember를 조회합니다.
  private async findOwnerWorkspaceMember(
    client: WorkspaceOnboardingClient,
    userId: string
  ): Promise<WorkspaceMemberWithWorkspaceRow | null> {
    return client.workspaceMember.findFirst({
      where: {
        userId,
        role: PrismaWorkspaceMemberRole.OWNER,
      },
      include: {
        workspace: true,
      },
      orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 신규 기본 Workspace, OWNER 멤버십, WORKSPACE_MEMBER Actor를 생성합니다.
  private async createOwnerWorkspaceMember(
    client: WorkspaceOnboardingClient,
    input: EnsureOwnerWorkspaceForOnboardingInput
  ): Promise<WorkspaceMemberWithWorkspaceRow> {
    // 1. 사용자 표시 이름을 기반으로 기본 Workspace를 생성한다.
    const workspace = await client.workspace.create({
      data: {
        name: this.buildDefaultWorkspaceName(input.displayName),
        kind: PrismaWorkspaceKind.PERSONAL,
      },
    });

    // 2. 생성된 Workspace에 현재 사용자를 OWNER로 연결한다.
    const workspaceMember = await client.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: input.userId,
        role: PrismaWorkspaceMemberRole.OWNER,
        joinedAt: input.now,
      },
      include: {
        workspace: true,
      },
    });

    // 3. OWNER WorkspaceMember에 대응하는 WORKSPACE_MEMBER Actor를 생성한다.
    await this.createWorkspaceMemberActor(client, {
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
      displayName: input.displayName,
      email: input.email,
    });

    // 4. 생성된 WorkspaceMember row를 반환한다.
    return workspaceMember;
  }

  // 기능 : WorkspaceMember가 데이터 생성/수정 주체로 기록될 Actor row를 생성합니다.
  private async createWorkspaceMemberActor(
    client: WorkspaceOnboardingClient,
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

  // 기능 : 사용자 이름 기반 기본 Workspace 표시 이름을 만듭니다.
  private buildDefaultWorkspaceName(displayName: string | null): string {
    const normalizedDisplayName = displayName?.trim();

    if (normalizedDisplayName) {
      return `${normalizedDisplayName}'s Workspace`;
    }

    return "Untitled Workspace";
  }

  // 기능 : Prisma WorkspaceMember row를 onboarding 결과 레코드로 변환합니다.
  private mapWorkspaceOnboardingResult(
    workspaceMember: WorkspaceMemberWithWorkspaceRow
  ): WorkspaceOnboardingResult {
    return {
      workspace: {
        id: workspaceMember.workspace.id,
        name: workspaceMember.workspace.name,
        kind: this.fromPrismaWorkspaceKind(workspaceMember.workspace.kind),
        organizationName: workspaceMember.workspace.organizationName,
        organizationDomain: workspaceMember.workspace.organizationDomain,
        createdAt: workspaceMember.workspace.createdAt,
        updatedAt: workspaceMember.workspace.updatedAt,
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

  // 기능 : Prisma WorkspaceKind enum을 Workspace onboarding 종류 값으로 변환합니다.
  private fromPrismaWorkspaceKind(
    kind: PrismaWorkspaceKind
  ): WorkspaceOnboardingKind {
    switch (kind) {
      case PrismaWorkspaceKind.PERSONAL:
        return "PERSONAL";
      case PrismaWorkspaceKind.ORGANIZATION:
        return "ORGANIZATION";
    }
  }

  // 기능 : Prisma WorkspaceMemberRole enum을 Workspace onboarding 멤버 역할 값으로 변환합니다.
  private fromPrismaWorkspaceMemberRole(
    role: PrismaWorkspaceMemberRole
  ): WorkspaceOnboardingMemberRole {
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
