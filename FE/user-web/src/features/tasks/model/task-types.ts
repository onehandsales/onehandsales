import type { PreviewScope, Scenario } from "@/features/preview";
import type { TeamRow } from "@/features/team";
export const taskStatuses = ["To Do", "In Progress", "Done"] as const;
export type TaskStatus = typeof taskStatuses[number];
export type TaskDraft = { title: string; projectId: string; status: TaskStatus; assigneeId: string | null; dueDate: string; description: string };
export type TaskActivity = { id: string; kind: "status"; actorId: string; actorName: string; status: TaskStatus; at: string; taskTitle: string };
export type Task = TaskDraft & { id: string; workspaceId: string; revision: number; activities: TaskActivity[] };
export type TaskView = Task & { projectName: string; assigneeName: string | null };
export type TaskState = { version: number; scenario: Scenario };
export type TaskStore = {
  getSnapshot: () => TaskState; subscribe: (listener: () => void) => () => void; connect: () => () => void; setScenario: (scenario: Scenario) => void;
  read: (scope: PreviewScope, signal: AbortSignal) => Promise<TaskView[]>;
  current: (scope: PreviewScope, id: string) => Task | null;
  members: (scope: PreviewScope, projectId: string) => TeamRow[];
  create: (scope: PreviewScope, draft: TaskDraft, submissionId: string, signal: AbortSignal) => Promise<Task>;
  edit: (scope: PreviewScope, id: string, revision: number, draft: TaskDraft, signal: AbortSignal) => Promise<Task>;
};
