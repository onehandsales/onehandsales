import type { PreviewScope, Scenario } from "@/features/preview";

export type TemplateFile = { id: string; name: string; file: Blob };
export type TemplateSubtask = { id: string; title: string; completed: boolean };
export type TemplateTaskDraft = { title: string; description: string; files: TemplateFile[]; subtasks: TemplateSubtask[] };
export type TemplateTask = TemplateTaskDraft & { id: string; revision: number };
export type TaskTemplate = { id: string; workspaceId: string; name: string; revision: number; tasks: TemplateTask[] };
export type TemplateState = { version: number; scenario: Scenario };
export type TemplateStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => TemplateState;
  connect: () => () => void;
  setScenario: (scenario: Scenario) => void;
  read: (scope: PreviewScope, signal: AbortSignal) => Promise<TaskTemplate[]>;
  current: (scope: PreviewScope, id: string) => TaskTemplate | null;
  create: (scope: PreviewScope, name: string, submission: string, signal: AbortSignal) => Promise<TaskTemplate>;
  rename: (scope: PreviewScope, id: string, revision: number, name: string, signal: AbortSignal) => Promise<TaskTemplate>;
  saveTask: (scope: PreviewScope, templateId: string, taskId: string | null, revision: number, draft: TemplateTaskDraft, submission: string, signal: AbortSignal) => Promise<TemplateTask>;
  deleteTask: (scope: PreviewScope, templateId: string, taskId: string, revision: number, signal: AbortSignal) => Promise<void>;
};
