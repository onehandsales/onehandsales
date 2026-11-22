import type { PreviewScope } from "@/features/preview";
import type { ProjectStore } from "@/features/projects";
import type { TaskStore } from "@/features/tasks";
import type { TemplateStore } from "../model/template-types";
// 기능 : 선택한 템플릿·프로젝트 snapshot을 작업 일괄 저장 직전까지 검증한다.
export async function applyTaskTemplate(templates: TemplateStore, projects: ProjectStore, tasks: TaskStore, scope: PreviewScope, templateId: string, projectId: string, submissionId: string, signal: AbortSignal) {
  const source = templates.current(scope, templateId); const project = projects.current(scope, projectId);
  if (!source) throw new Error("Select an available task template.");
  if (!source.tasks.length) throw new Error("This template has no tasks. Add a task before applying it.");
  if (!project) throw new Error("Select an available project in this workspace.");
  const templateVersion = templates.getSnapshot().version; const projectVersion = projects.getSnapshot().version;
  // 기능 : 저장 도중 원본·프로젝트·권한·시나리오가 바뀌면 부분 생성 없이 다시 선택하게 한다.
  function validateSource() {
    const current = templates.current(scope, templateId); const target = projects.current(scope, projectId);
    if (!current || current.revision !== source!.revision || templates.getSnapshot().version !== templateVersion) throw new Error("The template changed. Review your selection and try again.");
    if (!target || target.revision !== project!.revision || projects.getSnapshot().version !== projectVersion) throw new Error("The project or access changed. Review your selection and try again.");
  }
  return tasks.createBatch(scope, { projectId, sourceId: source.id, sourceRevision: source.revision, submissionId, items: source.tasks }, validateSource, signal);
}
