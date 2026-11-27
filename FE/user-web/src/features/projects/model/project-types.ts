import type { PreviewScope, Scenario } from "@/features/preview";
import type { ProjectEdit } from "./project-edits";
import type { TeamProject } from "@/features/team";
export const projectStages = ["New Lead", "Proposal Sent", "Contract Signed", "In Progress", "In Review"] as const;
export type ProjectStage = typeof projectStages[number];
export type ProjectSettings = { paymentType: "hourly"; currency: "USD"; rateMinor: number; description: string; endDate: string | null; reminders: boolean };
export type ProjectTimeEntry = { id: string; taskId: string; taskName: string; memberId: string; day: string; seconds: number; rateMinor: number; amountMinor: number };
// 의미 : 개별 시간·청구 행이 미수록인 원본의 과거 합계와 활동을 저장하며 실제 수락이나 청구로 생성하지 않는다.
export type ProjectRecordedOverview = { unbilledSeconds: number; billedSeconds: number; activities: { id: string; actor: string; action: "completed" | "archived"; title: string; at: string }[] };
export type Project = { id: string; workspaceId: string; name: string; clientId: string; memberIds: string[]; stage: ProjectStage; revision: number; settings: ProjectSettings; timeEntries: ProjectTimeEntry[]; recordedOverview?: ProjectRecordedOverview; startDate: string | null; money: { currency: "USD"; dueMinor: number; paidMinor: number }; tagIds: string[]; origin: "client" | "global" | "column" | "seed"; created: { name: string; actor: string; at: string } };
export type ProjectDraft = { name: string; clientId: string; origin: "client" | "global" | "column"; stage: ProjectStage };
// 기능 : 생성 폼과 제출 hook이 같은 필수 입력 오류와 수정 대상을 사용한다.
export function projectDraftIssue(draft: ProjectDraft): { field: "name" | "clientId"; message: string } | null {
  if (!draft.name.trim() || draft.name.trim().length > 200) return { field: "name", message: "Enter a project title of 1–200 characters." };
  if (!draft.clientId) return { field: "clientId", message: "Select an existing client from this workspace." };
  return null;
}
export type ProjectState = { version: number; scenario: Scenario };
export type ProjectTag = { id: string; name: string; color: string; revision: number };
export type ProjectView = Project & { clientName: string; tags: ProjectTag[] };
export type ProjectStore = {
  getSnapshot(): ProjectState; subscribe(listener: () => void): () => void; connect(): () => void;
  setScenario(value: Scenario): void; projects(workspaceId: string): TeamProject[];
  tags(workspaceId: string): ProjectTag[];
  current(scope: PreviewScope, projectId: string): Project | null;
  edit(scope: PreviewScope, command: ProjectEdit, signal: AbortSignal): Promise<Project>;
  read(scope: PreviewScope, signal: AbortSignal): Promise<ProjectView[]>;
  create(scope: PreviewScope, draft: ProjectDraft, submissionId: string, signal: AbortSignal): Promise<Project>;
};
// 기능 : 원본에 없는 초기 단계 규칙을 명시한 목 정책으로 한 곳에서 결정한다.
export function initialProjectStage(origin: ProjectDraft["origin"], stage: ProjectStage) { return origin === "column" ? stage : "New Lead"; }
