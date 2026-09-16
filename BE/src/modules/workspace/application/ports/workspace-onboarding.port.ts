import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const WORKSPACE_ONBOARDING = Symbol("WORKSPACE_ONBOARDING");

export type WorkspaceOnboardingKind = "PERSONAL" | "ORGANIZATION";
export type WorkspaceOnboardingMemberRole = "OWNER" | "ADMIN" | "MEMBER";

// 역할 : OnboardingWorkspaceRecord가 onboarding 결과 Workspace snapshot을 정의합니다.
export interface OnboardingWorkspaceRecord {
  readonly id: string;
  readonly name: string;
  readonly kind: WorkspaceOnboardingKind;
  readonly organizationName: string | null;
  readonly organizationDomain: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : OnboardingWorkspaceMemberRecord가 onboarding 결과 WorkspaceMember snapshot을 정의합니다.
export interface OnboardingWorkspaceMemberRecord {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: WorkspaceOnboardingMemberRole;
  readonly joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : WorkspaceOnboardingResult가 사용자 기본 Workspace 보장 결과를 정의합니다.
export interface WorkspaceOnboardingResult {
  readonly workspace: OnboardingWorkspaceRecord;
  readonly workspaceMember: OnboardingWorkspaceMemberRecord;
}

// 역할 : EnsureOwnerWorkspaceForOnboardingInput이 온보딩용 OWNER Workspace 보장 입력을 정의합니다.
export interface EnsureOwnerWorkspaceForOnboardingInput {
  readonly userId: string;
  readonly displayName: string | null;
  readonly now: Date;
  readonly transactionContext?: TransactionContext | null;
}

// 역할 : WorkspaceOnboardingPort가 Workspace 초기 생성/보장 계약을 정의합니다.
export interface WorkspaceOnboardingPort {
  // 기능 : 사용자의 온보딩용 OWNER WorkspaceMember를 조회하거나 없으면 생성합니다.
  ensureOwnerWorkspaceForOnboarding(
    input: EnsureOwnerWorkspaceForOnboardingInput
  ): Promise<WorkspaceOnboardingResult>;
}
