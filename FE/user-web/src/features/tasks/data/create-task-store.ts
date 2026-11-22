import { PreviewError } from "@/features/preview";
import type { PreviewRuntime, PreviewScope, Scenario } from "@/features/preview";
import type { ProjectStore } from "@/features/projects";
import type { TeamStore } from "@/features/team";
import { abortableDelay } from "@/lib/abortable-delay";
import { newTaskDraft, validateTaskDraft } from "../model/task-values";
import type { Task, TaskDraft, TaskState, TaskStore } from "../model/task-types";
// 기능 : 전체·프로젝트·초대 작업을 단일 메모리 원본에 저장하고 배정 범위와 저장 revision을 검증한다.
export function createTaskStore(preview: PreviewRuntime, projects: ProjectStore, team: TeamStore): TaskStore {
  const workspaces = new Map<string, Task[]>(); const submissions = new Map<string, string>(); const listeners = new Set<() => void>(); let state: TaskState = { version: 0, scenario: "normal" }; let generation = 0; let sequence = 0; let failed = false; let previous = preview.getSnapshot();
  // 기능 : 같은 제목의 서로 다른 원본 작업과 시간 참조 ID를 분리한 seed를 제공한다.
  function rows(workspaceId: string) { let data = workspaces.get(workspaceId); if (!data) { const projectId = `${workspaceId}:team-project-2`; data = [{ ...newTaskDraft(projectId), title: "Untitled", id: `${workspaceId}:task-untitled`, workspaceId, revision: 0, activities: [] }, ...[1, 2].map(index => ({ ...newTaskDraft(projectId, "In Progress"), title: "Initial Chat", assigneeId: `${workspaceId}:member-owner`, dueDate: "2024-02-06", id: `${workspaceId}:task-initial-chat-${index}`, workspaceId, revision: 0, activities: [] }))]; workspaces.set(workspaceId, data); } return data; }
  // 기능 : 불변 버전을 갱신해 모든 작업 소비 화면을 다시 조회한다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 현재 가상 계정·workspace·revision과 접근 제한 시나리오를 검사한다.
  function assertScope(scope: PreviewScope) { const current = preview.getSnapshot(); if (current.revision !== scope.revision || current.session?.id !== scope.actorId || current.workspaceId !== scope.workspaceId) throw new DOMException("Task scope changed", "AbortError"); if (state.scenario === "denied") throw new PreviewError("denied", "Tasks are unavailable in this local access scenario."); }
  // 기능 : 지연 이후에도 취소·문맥·시나리오 차수를 확인해 늦은 저장을 차단한다.
  async function wait(scope: PreviewScope, signal: AbortSignal) { assertScope(scope); const expected = generation; await abortableDelay(state.scenario === "slow" ? 1500 : 150, signal); signal.throwIfAborted(); assertScope(scope); if (expected !== generation) throw new DOMException("Task request replaced", "AbortError"); }
  // 기능 : 담당자는 같은 workspace의 수락 완료된 프로젝트 참여자만 제공한다.
  function members(scope: PreviewScope, projectId: string) { assertScope(scope); const project = projects.current(scope, projectId); if (!project) return []; return team.joinedMembers(scope.workspaceId).filter(member => project.memberIds.includes(member.id) || member.allProjects || member.projectIds.includes(projectId)); }
  // 기능 : 작업 ID 직접 접근도 프로젝트 원본의 배정 범위를 통과해야 한다.
  function current(scope: PreviewScope, id: string) { assertScope(scope); const task = rows(scope.workspaceId).find(item => item.id === id); if (!task || state.scenario === "empty" || !projects.current(scope, task.projectId)) return null; return structuredClone(task); }
  // 기능 : 목록은 접근 가능한 같은 작업에 현재 프로젝트·담당자 표시명을 결합한다.
  async function read(scope: PreviewScope, signal: AbortSignal) { await wait(scope, signal); if (state.scenario === "read-error" && !failed) { failed = true; throw new PreviewError("read", "Unable to load tasks. Please try again."); } if (state.scenario === "empty") return []; return rows(scope.workspaceId).flatMap(task => { const project = projects.current(scope, task.projectId); return project ? [{ ...structuredClone(task), projectName: project.name, assigneeName: members(scope, task.projectId).find(member => member.id === task.assigneeId)?.name ?? null }] : []; }); }
  // 기능 : 필드가 참조하는 프로젝트와 담당자의 저장 직전 유효성을 확인한다.
  function validateRelations(scope: PreviewScope, draft: TaskDraft) { if (state.scenario === "empty") throw new Error("Choose normal before saving outside the empty preview."); if (!projects.current(scope, draft.projectId)) throw new Error("This project is unavailable or outside your assigned scope."); if (draft.assigneeId && !members(scope, draft.projectId).some(member => member.id === draft.assigneeId)) throw new Error("Choose a joined member of this project."); }
  // 기능 : 실패 시나리오는 원본을 바꾸기 전에 한 번 실패해 같은 입력으로 재시도할 수 있게 한다.
  function failWrite() { if (state.scenario === "write-error" && !failed) { failed = true; throw new Error("Unable to save task. Your inputs are preserved. Please try again."); } }
  // 기능 : 첫 유효 필드 확정만 ID를 생성하고 동일 제출의 중복 저장을 방지한다.
  async function create(scope: PreviewScope, input: TaskDraft, submissionId: string, signal: AbortSignal) { const draft = validateTaskDraft(structuredClone(input)); await wait(scope, signal); validateRelations(scope, draft); const key = `${scope.workspaceId}:${scope.actorId}:${submissionId}`; const priorId = submissions.get(key); const prior = rows(scope.workspaceId).find(task => task.id === priorId); if (prior) return structuredClone(prior); failWrite(); const task: Task = { ...draft, id: `${scope.workspaceId}:task-new-${++sequence}`, workspaceId: scope.workspaceId, revision: 0, activities: [] }; rows(scope.workspaceId).push(task); submissions.set(key, task.id); publish(); return structuredClone(task); }
  // 기능 : 필드 확정 snapshot을 원자 저장하고 오래된 초안은 현재 작업을 덮지 않는다.
  async function edit(scope: PreviewScope, id: string, revision: number, input: TaskDraft, signal: AbortSignal) { const draft = validateTaskDraft(structuredClone(input)); await wait(scope, signal); const task = current(scope, id); if (!task) throw new Error("This task is unavailable or outside your assigned scope."); if (task.revision !== revision) throw new Error("The task changed. Reload its saved values before retrying."); if (draft.projectId !== task.projectId) throw new Error("Moving an existing task to another project is not available."); validateRelations(scope, draft); failWrite(); const next: Task = { ...task, ...draft, revision: revision + 1 }; if (task.status !== next.status) next.activities.push({ id: `${scope.workspaceId}:task-status-${++sequence}`, kind: "status", actorId: scope.actorId, actorName: preview.getSnapshot().session!.name, status: next.status, at: "2024-02-07T12:00:00Z", taskTitle: next.title }); workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === id ? next : row)); publish(); return structuredClone(next); }
  // 기능 : 목 오류 변경은 저장 원본을 보존하고 이전 요청만 무효화한다.
  function setScenario(scenario: Scenario) { generation++; failed = false; state = { ...state, scenario }; publish(); }
  // 기능 : 가상 문맥 이탈을 무효화하고 Reset에서만 저장 원본을 초기화한다.
  function onScope() { const next = preview.getSnapshot(); generation++; failed = false; state = { ...state, scenario: "normal" }; if (next.resetGeneration !== previous.resetGeneration) { workspaces.clear(); submissions.clear(); sequence = 0; } previous = next; publish(); }
  // 기능 : 앱 수명의 계정·프로젝트·팀 구독을 연결하고 모두 정리한다.
  function connect() { previous = preview.getSnapshot(); const stopPreview = preview.subscribe(onScope); const stopProjects = projects.subscribe(publish); const stopTeam = team.subscribe(publish); return function cleanup() { stopTeam(); stopProjects(); stopPreview(); }; }
  // 기능 : 안정된 버전 snapshot을 구독자에게 반환한다.
  function getSnapshot() { return state; }
  // 기능 : 작업 변경 구독과 해제를 짝지어 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  return { getSnapshot, subscribe, connect, setScenario, read, current, members, create, edit };
}
