import type { TaskTemplate, TemplateTaskDraft } from "./template-types";

// 기능 : 템플릿 이름의 명시한 목 길이와 공백 규칙을 검증한다.
export function templateName(value: string) {
  const name = value.trim();
  if (!name || name.length > 120) throw new Error("Enter a template name of 1–120 characters.");
  return name;
}
// 기능 : 구성 작업 편집을 실제 프로젝트 작업과 독립된 빈 초안으로 시작한다.
export function emptyTemplateTask(): TemplateTaskDraft { return { title: "", description: "", files: [], subtasks: [] }; }
// 기능 : 가변 배열은 복사하고 불변 로컬 Blob만 공유해 저장 원본을 보호한다.
export function copyTemplateTask<T extends TemplateTaskDraft>(task: T): T {
  return { ...task, files: task.files.map(file => ({ ...file })), subtasks: task.subtasks.map(child => ({ ...child })) };
}
// 기능 : 조회·편집 경계에서 템플릿과 구성 작업의 가변 원본을 분리한다.
export function copyTemplate(template: TaskTemplate): TaskTemplate { return { ...template, tasks: template.tasks.map(copyTemplateTask) }; }
// 기능 : 템플릿 첨부의 로컬 이미지 형식·크기 제한을 검사한다.
export function templateFileError(file: Blob) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "Choose a PNG, JPEG or WebP image.";
  if (!file.size || file.size > 2 * 1024 * 1024) return "Choose an image up to 2 MB.";
  return "";
}
// 기능 : 상위 저장 직전 제목·설명·하위 항목·파일 참조의 유효성을 한 번에 검증한다.
export function validateTemplateTask(input: TemplateTaskDraft): TemplateTaskDraft {
  const draft = copyTemplateTask(input); draft.title = draft.title.trim();
  if (!draft.title || draft.title.length > 200) throw new Error("Enter a task title of 1–200 characters.");
  if (draft.description.length > 4000) throw new Error("Keep the description within 4,000 characters.");
  const ids = new Set<string>();
  for (const child of draft.subtasks) {
    child.title = child.title.trim();
    if (!child.title || child.title.length > 200) throw new Error("Enter subtask titles of 1–200 characters.");
    if (!child.id || ids.has(child.id)) throw new Error("Each template subtask needs its own ID.");
    ids.add(child.id);
  }
  ids.clear();
  for (const entry of draft.files) {
    const error = templateFileError(entry.file); if (error) throw new Error(error);
    if (!entry.id || ids.has(entry.id)) throw new Error("Each template file needs its own ID.");
    ids.add(entry.id);
  }
  return draft;
}
