import { projectTitle, validateProjectSettings } from "./project-settings";
import type { ProjectSettingsDraft } from "./project-settings";
import { projectStages } from "./project-types";
import type { Project, ProjectStage, ProjectTag } from "./project-types";
export type ProjectEdit = { projectId: string; revision: number } & (
  { type: "rename"; name: string } |
  { type: "settings"; draft: ProjectSettingsDraft } |
  { type: "move"; stage: ProjectStage; beforeId: string | null } |
  { type: "attach-tag"; tagId?: string; name?: string } |
  { type: "unlink-tag"; tagId: string } |
  { type: "rename-tag"; tagId: string; tagRevision: number; name: string }
);
// 기능 : 태그 이름의 명시한 목 한도를 검증하고 같은 이름 비교에 공백을 정리한다.
export function projectTagName(value: string) { const name = value.trim().replace(/\s+/g, " "); if (!name || name.length > 60) throw new Error("Enter a tag name of 1–60 characters."); return name; }
// 기능 : 프로젝트 위치와 태그 정의/연결을 복사본에 원자 적용하고 오래된 초안의 덮어쓰기를 거부한다.
export function applyProjectEdit(source: Project[], definitions: ProjectTag[], command: ProjectEdit, newTagId: string) {
  const projects = structuredClone(source); const tags = structuredClone(definitions); const project = projects.find(item => item.id === command.projectId); if (!project) throw new Error("This project is no longer available."); if (project.revision !== command.revision) throw new Error("The project changed. Review the current values and try again.");
  if (command.type === "rename") { project.name = projectTitle(command.name); project.revision++; }
  if (command.type === "settings") { Object.assign(project, validateProjectSettings(command.draft)); project.revision++; }
  if (command.type === "move") { if (!projectStages.includes(command.stage)) throw new Error("Choose an available project stage."); const target = projects.find(item => item.id === command.beforeId); if (command.beforeId && (!target || target.stage !== command.stage || target.id === project.id)) throw new Error("The drop position changed. Choose another position."); const remaining = projects.filter(item => item.id !== project.id); project.stage = command.stage; project.revision++; const beforeIndex = target ? remaining.findIndex(item => item.id === target.id) : -1; let lastIndex = -1; remaining.forEach((item, index) => { if (item.stage === command.stage) lastIndex = index; }); remaining.splice(beforeIndex >= 0 ? beforeIndex : lastIndex >= 0 ? lastIndex + 1 : remaining.length, 0, project); return { projects: remaining, tags, project }; }
  if (command.type === "attach-tag") { let tag = command.tagId ? tags.find(item => item.id === command.tagId) : undefined; if (command.tagId && !tag) throw new Error("This tag is no longer available."); if (!tag) { const name = projectTagName(command.name ?? ""); tag = tags.find(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase()); if (!tag) { tag = { id: newTagId, name, color: "purple", revision: 0 }; tags.push(tag); } } if (!project.tagIds.includes(tag.id)) { project.tagIds.push(tag.id); project.revision++; } }
  if (command.type === "unlink-tag") { if (!project.tagIds.includes(command.tagId)) throw new Error("This tag has already been removed from the project."); project.tagIds = project.tagIds.filter(id => id !== command.tagId); project.revision++; }
  if (command.type === "rename-tag") { const tag = tags.find(item => item.id === command.tagId); if (!tag || !project.tagIds.includes(tag.id)) throw new Error("This tag is no longer linked to the project."); if (tag.revision !== command.tagRevision) throw new Error("This tag changed. Close the editor and review its latest name."); const name = projectTagName(command.name); if (tags.some(item => item.id !== tag.id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error("A tag with this name already exists."); tag.name = name; tag.revision++; }
  return { projects, tags, project };
}
