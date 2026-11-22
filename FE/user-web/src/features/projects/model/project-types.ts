import type { PreviewScope, Scenario } from "@/features/preview";
import type { ProjectEdit } from "./project-edits";
import type { TeamProject } from "@/features/team";
export const projectStages = ["New Lead", "Proposal Sent", "Contract Signed", "In Progress", "In Review"] as const;
export type ProjectStage = typeof projectStages[number];
export type Project = { id: string; workspaceId: string; name: string; clientId: string; memberIds: string[]; stage: ProjectStage; revision: number; startDate: string | null; money: { currency: "USD"; dueMinor: number; paidMinor: number }; tagIds: string[]; origin: "client" | "global" | "column" | "seed"; created: { name: string; actor: string; at: string } };
export type ProjectDraft = { name: string; clientId: string; origin: "client" | "global" | "column"; stage: ProjectStage };
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
