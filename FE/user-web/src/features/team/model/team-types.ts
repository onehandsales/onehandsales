import type { PreviewScope } from "@/features/preview/model/preview-types";
export type InviteRole = "Collaborator" | "Partner";
export type TeamRow = { id: string; workspaceId: string; revision: number; name: string; email: string; role: InviteRole | "Owner"; projectIds: string[]; allProjects: boolean } & ({ status: "joined"; joinedOn: string } | { status: "pending" | "expired"; joinedOn: null });
export type TeamProject = { id: string; name: string };
export type InviteDraft = { email: string; role: InviteRole | ""; projectIds: string[] };
export type TeamScenario = "normal" | "slow" | "read-error" | "invite-error" | "remove-error" | "empty" | "denied" | "expired";
export type TeamFixture = "inviting" | "removing";
export type TeamState = { version: number; scenario: TeamScenario };
export type TeamStore = {
  subscribe: (listener: () => void) => () => void; getSnapshot: () => TeamState; connect: () => () => void;
  setScenario: (value: TeamScenario) => void; setFixture: (scope: PreviewScope, value: TeamFixture) => void; fixture: (workspaceId: string) => TeamFixture;
  projects: (workspaceId: string) => TeamProject[]; read: (scope: PreviewScope, signal: AbortSignal) => Promise<TeamRow[]>;
  invite: (scope: PreviewScope, draft: InviteDraft, signal: AbortSignal) => Promise<TeamRow>;
  remove: (scope: PreviewScope, target: TeamRow, signal: AbortSignal) => Promise<void>;
  invitation: (workspaceId: string, id: string) => TeamRow | null;
  accept: (target: TeamRow, name: string) => TeamRow;
};
// 기능 : 목 초대의 이메일과 역할을 검증하되 실제 서비스 필수조건으로 확정하지 않는다.
export function inviteError(value: InviteDraft): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) || value.email.trim().length > 254) return "Enter a valid email address (up to 254 characters).";
  if (value.role !== "Collaborator" && value.role !== "Partner") return "Select a role.";
  return null;
}
// 기능 : 조회 실패와 로컬 권한 제한을 구분한다.
export class TeamReadError extends Error {
  // 기능 : 화면에서 복구 가능한 목 오류 종류를 전달한다.
  constructor(public kind: "read" | "denied", message: string) { super(message); }
}
