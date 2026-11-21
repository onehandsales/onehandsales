export type Scenario = "normal" | "slow" | "read-error" | "write-error" | "empty" | "denied";
export type ActorId = "preview-a" | "preview-b" | `preview-user-${number}`;
export type PreviewSession = {
  readonly id: ActorId;
  readonly name: string;
  readonly role: "owner" | "member";
  readonly workspaces: readonly { readonly id: string; readonly name: string }[];
};
export type PreviewState = {
  readonly session: PreviewSession | null;
  readonly workspaceId: string | null;
  readonly revision: number;
  readonly resetGeneration: number;
  readonly scenario: Scenario;
};
export type PreviewScope = {
  actorId: ActorId;
  workspaceId: string;
  revision: number;
};
// 의미 : 기반의 상태 일관성을 검증하는 임시 항목이며 고객·프로젝트·서버 모델이 아니다.
export type PreviewItem = { id: string; name: string; updatedAt: string };
export type PreviewFailure = "denied" | "missing" | "read" | "write" | "invalid";

// 기능 : 목 실패의 종류와 사용자 표시 문구를 함께 전달한다.
export class PreviewError extends Error {
  // 기능 : 실제 서버 오류와 구분되는 로컬 검증 오류를 만든다.
  constructor(public readonly kind: PreviewFailure, message: string) {
    super(message);
    this.name = "PreviewError";
  }
}
