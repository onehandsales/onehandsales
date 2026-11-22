import { PreviewError } from "@/features/preview";
import type { PreviewRuntime, PreviewScope, Scenario } from "@/features/preview";
import type { ProjectStore } from "@/features/projects";
import type { TeamStore } from "@/features/team";
import { abortableDelay } from "@/lib/abortable-delay";
import { newTaskDraft, validateTaskDraft } from "../model/task-values";
import type { Task, TaskDraft, TaskState, TaskStore, TaskComment, Subtask, SubtaskPatch, TaskStatusSettings, TaskStatusDefinition, TaskLifecycleAction, TaskBatch } from "../model/task-types";
import { copyTask } from "../model/task-copy";
import { initialTaskStatuses, validateTaskStatuses } from "../model/task-status-values";
// 기능 : 전체·프로젝트·초대 작업을 단일 메모리 원본에 저장하고 배정 범위와 저장 revision을 검증한다.
export function createTaskStore(preview: PreviewRuntime, projects: ProjectStore, team: TeamStore): TaskStore {
  const workspaces = new Map<string, Task[]>(); const definitions = new Map<string, TaskStatusSettings>(); const submissions = new Map<string, string>(); const batches = new Map<string, { signature: string; ids: string[] }>(); const subtaskSubmissions = new Map<string, string>(); const commentSubmissions = new Map<string, string>(); const listeners = new Set<() => void>(); let state: TaskState = { version: 0, scenario: "normal" }; let generation = 0; let sequence = 0; let failed = false; let previous = preview.getSnapshot();
  // 기능 : 같은 제목의 서로 다른 원본 작업과 시간 참조 ID를 분리한 seed를 제공한다.
  function rows(workspaceId: string) { let data = workspaces.get(workspaceId); if (!data) { const projectId = `${workspaceId}:team-project-2`; data = [{ ...newTaskDraft(projectId), title: "Untitled", id: `${workspaceId}:task-untitled`, workspaceId, revision: 0, archived: false, activities: [], subtasks: [] }, ...[1, 2].map(index => ({ ...newTaskDraft(projectId, "In Progress"), title: "Initial Chat", assigneeId: `${workspaceId}:member-owner`, dueDate: "2024-02-06", id: `${workspaceId}:task-initial-chat-${index}`, workspaceId, revision: 0, archived: false, activities: [], subtasks: [] }))]; workspaces.set(workspaceId, data); } return data; }
  // 기능 : 불변 버전을 갱신해 모든 작업 소비 화면을 다시 조회한다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 현재 가상 계정·workspace·revision과 접근 제한 시나리오를 검사한다.
  function assertScope(scope: PreviewScope) { const current = preview.getSnapshot(); if (current.revision !== scope.revision || current.session?.id !== scope.actorId || current.workspaceId !== scope.workspaceId) throw new DOMException("Task scope changed", "AbortError"); if (state.scenario === "denied") throw new PreviewError("denied", "Tasks are unavailable in this local access scenario."); }
  // 기능 : 지연 이후에도 취소·문맥·시나리오 차수를 확인해 늦은 저장을 차단한다.
  async function wait(scope: PreviewScope, signal: AbortSignal) { assertScope(scope); const expected = generation; await abortableDelay(state.scenario === "slow" ? 1500 : 150, signal); signal.throwIfAborted(); assertScope(scope); if (expected !== generation) throw new DOMException("Task request replaced", "AbortError"); }
  // 기능 : 담당자는 같은 workspace의 수락 완료된 프로젝트 참여자만 제공한다.
  function members(scope: PreviewScope, projectId: string) { assertScope(scope); const project = projects.current(scope, projectId); if (!project) return []; return team.joinedMembers(scope.workspaceId).filter(member => project.memberIds.includes(member.id) || member.allProjects || member.projectIds.includes(projectId)); }
  // 기능 : 작업 ID 직접 접근도 프로젝트 원본의 배정 범위를 통과해야 한다.
  function current(scope: PreviewScope, id: string) { assertScope(scope); const task = rows(scope.workspaceId).find(item => item.id === id); if (!task || task.archived || state.scenario === "empty" || !projects.current(scope, task.projectId)) return null; return copyTask(task); }
  // 기능 : 목록은 접근 가능한 같은 작업에 현재 프로젝트·담당자 표시명을 결합한다.
  async function read(scope: PreviewScope, signal: AbortSignal) { await wait(scope, signal); if (state.scenario === "read-error" && !failed) { failed = true; throw new PreviewError("read", "Unable to load tasks. Please try again."); } if (state.scenario === "empty") return []; return rows(scope.workspaceId).filter(task => !task.archived).flatMap(task => { const project = projects.current(scope, task.projectId); return project ? [{ ...copyTask(task), projectName: project.name, assigneeName: members(scope, task.projectId).find(member => member.id === task.assigneeId)?.name ?? null }] : []; }); }
  // 기능 : 필드가 참조하는 프로젝트와 담당자의 저장 직전 유효성을 확인한다.
  function validateRelations(scope: PreviewScope, draft: TaskDraft) { if (state.scenario === "empty") throw new Error("Choose normal before saving outside the empty preview."); if (!projects.current(scope, draft.projectId)) throw new Error("This project is unavailable or outside your assigned scope."); if (draft.assigneeId && !members(scope, draft.projectId).some(member => member.id === draft.assigneeId)) throw new Error("Choose a joined member of this project."); }
  // 기능 : 실패 시나리오는 원본을 바꾸기 전에 한 번 실패해 같은 입력으로 재시도할 수 있게 한다.
  function failWrite() { if (state.scenario === "write-error" && !failed) { failed = true; throw new Error("Unable to save task. Your inputs are preserved. Please try again."); } }
  // 기능 : 첫 유효 필드 확정만 ID를 생성하고 동일 제출의 중복 저장을 방지한다.
  async function create(scope: PreviewScope, input: TaskDraft, submissionId: string, signal: AbortSignal) { const draft = validateTaskDraft(structuredClone(input)); await wait(scope, signal); validateRelations(scope, draft); const key = `${scope.workspaceId}:${scope.actorId}:${submissionId}`; const priorId = submissions.get(key); const prior = rows(scope.workspaceId).find(task => task.id === priorId); if (priorId) { if (!prior || prior.archived) throw new Error("This submission belongs to an unavailable task. Start a new task instead."); return copyTask(prior); } failWrite(); const task: Task = { ...draft, id: `${scope.workspaceId}:task-new-${++sequence}`, workspaceId: scope.workspaceId, revision: 0, archived: false, activities: [], subtasks: [] }; rows(scope.workspaceId).push(task); submissions.set(key, task.id); publish(); return copyTask(task); }
  // 기능 : 템플릿의 전체 구성 작업을 한 의도로 원자 생성하고 새 작업·하위·첨부 ID를 발급한다.
  async function createBatch(scope: PreviewScope, input: TaskBatch, validateSource: () => void, signal: AbortSignal) {
    if (!input.items.length) throw new Error("This template has no tasks.");
    const projectId = input.projectId;
    const items = input.items.map(item => ({ draft: validateTaskDraft({ ...newTaskDraft(projectId), title: item.title, description: item.description }),
      children: item.subtasks.map(child => subtaskTitle(child.title)), files: item.files.map(entry => {
        if (!entry.file || !["image/png", "image/jpeg", "image/webp"].includes(entry.file.type) || !entry.file.size || entry.file.size > 2 * 1024 * 1024) throw new Error("The template contains an unavailable local image.");
        return { ...entry };
      }) }));
    const key = `${scope.workspaceId}:${scope.actorId}:${input.submissionId}`; const signature = `${input.sourceId}:${input.sourceRevision}:${projectId}`;
    validateSource(); await wait(scope, signal); validateSource(); items.forEach(item => validateRelations(scope, item.draft));
    const prior = batches.get(key);
    if (prior) {
      if (prior.signature !== signature) throw new Error("This submission belongs to another selection. Open a new application.");
      const saved = prior.ids.map(id => current(scope, id)); if (saved.some(task => !task)) throw new Error("An applied task is no longer available. Start a new application.");
      return saved as Task[];
    }
    failWrite();
    const created: Task[] = items.map(item => {
      const id = `${scope.workspaceId}:task-from-template-${++sequence}`;
      return { ...item.draft, id, workspaceId: scope.workspaceId, revision: 0, archived: false, activities: [],
        files: item.files.map(file => ({ ...file, id: `${scope.workspaceId}:task-file-${++sequence}` })),
        subtasks: item.children.map(title => ({ id: `${scope.workspaceId}:subtask-${++sequence}`, parentTaskId: id, title, revision: 0, completed: false, assigneeId: null })) };
    });
    workspaces.set(scope.workspaceId, [...rows(scope.workspaceId), ...created]); batches.set(key, { signature, ids: created.map(task => task.id) }); state = { ...state, lifecycle: undefined, application: { sequence: ++sequence, projectId, ids: created.map(task => task.id) } }; publish(); return created.map(copyTask);
  }
  // 기능 : 필드 확정 snapshot을 원자 저장하고 오래된 초안은 현재 작업을 덮지 않는다.
  async function edit(scope: PreviewScope, id: string, revision: number, input: TaskDraft, signal: AbortSignal) { const draft = validateTaskDraft(structuredClone(input)); await wait(scope, signal); const task = current(scope, id); if (!task) throw new Error("This task is unavailable or outside your assigned scope."); if (task.revision !== revision) throw new Error("The task changed. Reload its saved values before retrying."); if (draft.projectId !== task.projectId) throw new Error("Moving an existing task to another project is not available."); validateRelations(scope, draft); failWrite(); const next: Task = { ...task, ...draft, revision: revision + 1 }; if (task.status !== next.status) next.activities.push({ id: `${scope.workspaceId}:task-status-${++sequence}`, kind: "status", actorId: scope.actorId, actorName: preview.getSnapshot().session!.name, status: next.status, statusName: statuses(scope).items.find(item => item.id === next.status)!.name, at: "2024-02-07T12:00:00Z", taskTitle: next.title }); if (task.assigneeId !== next.assigneeId) next.activities.push({ id: `${scope.workspaceId}:task-assignment-${++sequence}`, kind: "assignment", actorId: scope.actorId, actorName: preview.getSnapshot().session!.name, assigneeId: next.assigneeId, assigneeName: members(scope, task.projectId).find(member => member.id === next.assigneeId)?.name ?? null, at: "2024-02-07T12:00:00Z", taskTitle: next.title }); workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === id ? next : row)); publish(); return copyTask(next); }
  // 기능 : workspace 상태 정의를 복사해 읽고 외부 변경으로부터 원본을 보호한다.
  function statuses(scope: PreviewScope): TaskStatusSettings { assertScope(scope); if (!definitions.has(scope.workspaceId)) definitions.set(scope.workspaceId, initialTaskStatuses()); return structuredClone(definitions.get(scope.workspaceId)!); }
  // 기능 : 소유자의 정의 변경만 revision으로 저장하며 작업 상태와 과거 활동은 변경하지 않는다.
  async function saveStatuses(scope: PreviewScope, revision: number, input: TaskStatusDefinition[], signal: AbortSignal) {
    const items = validateTaskStatuses(structuredClone(input)); await wait(scope, signal);
    if (preview.getSnapshot().session?.role !== "owner") throw new Error("Only the workspace owner can edit status settings in this preview.");
    if (state.scenario === "empty") throw new Error("Choose normal before changing status settings.");
    if (statuses(scope).revision !== revision) throw new Error("Status settings changed. Reload saved values before retrying.");
    failWrite(); const next = { revision: revision + 1, items }; definitions.set(scope.workspaceId, next); publish(); return structuredClone(next);
  }
  // 기능 : 완료 의도만 최신 작업에 반영해 하위 작업·댓글·시간과 필드 초안을 덮지 않는다.
  async function complete(scope: PreviewScope, id: string, revision: number, completed: boolean, signal: AbortSignal) {
    await wait(scope, signal); const task = current(scope, id); if (!task) throw new Error("This task is unavailable or outside your assigned scope.");
    if (task.revision !== revision) throw new Error("The task changed. Please retry from its latest state.");
    const status = completed ? "Done" : "To Do"; if (task.status === status) return task; failWrite();
    const next: Task = { ...task, status, revision: task.revision + 1 };
    next.activities.push({ id: `${scope.workspaceId}:task-status-${++sequence}`, kind: "status", actorId: scope.actorId, actorName: preview.getSnapshot().session!.name, status, statusName: statuses(scope).items.find(item => item.id === status)!.name, at: "2024-02-07T12:00:00Z", taskTitle: task.title });
    workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === id ? next : row)); publish(); return copyTask(next);
  }
  // 기능 : 완료와 독립된 보관·삭제를 대상 ID에만 적용하고 연결 시간과 다른 작업을 유지한다.
  async function remove(scope: PreviewScope, id: string, revision: number, action: TaskLifecycleAction, signal: AbortSignal) {
    await wait(scope, signal);
    if (preview.getSnapshot().session?.role !== "owner") throw new Error("Only the workspace owner can archive or delete tasks in this preview.");
    const task = current(scope, id); if (!task) throw new Error("This task is unavailable or outside your assigned scope.");
    if (task.revision !== revision) throw new Error("The task changed. Close this action and review its saved values before retrying.");
    failWrite();
    workspaces.set(scope.workspaceId, action === "archive" ? rows(scope.workspaceId).map(row => row.id === id ? { ...row, archived: true, revision: row.revision + 1 } : row) : rows(scope.workspaceId).filter(row => row.id !== id));
    state = { ...state, application: undefined, lifecycle: { sequence: ++sequence, id, action } }; publish();
  }
  // 기능 : 하위 제목의 빈값과 길이를 검증하고 부모 제목과 독립적으로 저장한다.
  function subtaskTitle(value: string) { const title = value.trim(); if (!title || title.length > 200) throw new Error("Enter a subtask title of 1–200 characters."); return title; }
  // 기능 : 부모가 살아 있고 접근 가능한 경우에만 한 제출의 하위 항목을 한 번 생성한다.
  async function addSubtask(scope: PreviewScope, taskId: string, input: string, submissionId: string, signal: AbortSignal) {
    const title = subtaskTitle(input); await wait(scope, signal); const task = current(scope, taskId); if (!task) throw new Error("This parent task is unavailable or outside your assigned scope.");
    const key = `${scope.workspaceId}:${scope.actorId}:${taskId}:${submissionId}`; const prior = task.subtasks.find(row => row.id === subtaskSubmissions.get(key)); if (prior) return prior; failWrite();
    const child: Subtask = { id: `${scope.workspaceId}:subtask-${++sequence}`, parentTaskId: taskId, revision: 0, title, completed: false, assigneeId: null };
    task.subtasks.push(child); workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === taskId ? task : row)); subtaskSubmissions.set(key, child.id); publish(); return structuredClone(child);
  }
  // 기능 : 하위 필드만 변경해 부모/다른 하위 원본을 보존하고 오래된 하위 초안은 거부한다.
  async function editSubtask(scope: PreviewScope, taskId: string, id: string, revision: number, input: SubtaskPatch, signal: AbortSignal) {
    const patch = structuredClone(input); if (patch.title !== undefined) patch.title = subtaskTitle(patch.title); await wait(scope, signal);
    const task = current(scope, taskId); const child = task?.subtasks.find(row => row.id === id); if (!task || !child) throw new Error("This subtask is unavailable or outside your assigned scope.");
    if (child.revision !== revision) throw new Error("The subtask changed. Reload its saved values before retrying.");
    if (patch.assigneeId && !members(scope, task.projectId).some(member => member.id === patch.assigneeId)) throw new Error("Choose a joined member of this project."); failWrite();
    const next = { ...child, ...patch, revision: child.revision + 1 }; task.subtasks = task.subtasks.map(row => row.id === id ? next : row); workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === taskId ? task : row)); publish(); return structuredClone(next);
  }
  // 기능 : 같은 작업의 댓글을 한 번만 추가하며 늦은 부모 초안과 독립적으로 보존한다.
  async function addComment(scope: PreviewScope, taskId: string, input: string, submissionId: string, signal: AbortSignal): Promise<TaskComment> {
    const body = input.trim(); if (!body || body.length > 4000) throw new Error("Enter a comment of 1–4000 characters.");
    await wait(scope, signal); const task = current(scope, taskId); if (!task) throw new Error("This task is unavailable or outside your assigned scope.");
    const key = `${scope.workspaceId}:${scope.actorId}:${taskId}:${submissionId}`; const prior = task.activities.find(event => event.id === commentSubmissions.get(key)); if (prior?.kind === "comment") return structuredClone(prior); failWrite();
    const comment: TaskComment = { id: `${scope.workspaceId}:task-comment-${++sequence}`, kind: "comment", actorId: scope.actorId, actorName: preview.getSnapshot().session!.name, at: "2024-02-07T12:00:00Z", taskTitle: task.title, body };
    task.activities.push(comment); workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === taskId ? task : row)); commentSubmissions.set(key, comment.id); publish(); return structuredClone(comment);
  }
  // 기능 : 목 오류 변경은 저장 원본을 보존하고 이전 요청만 무효화한다.
  function setScenario(scenario: Scenario) { generation++; failed = false; state = { ...state, scenario, lifecycle: undefined, application: undefined }; publish(); }
  // 기능 : 가상 문맥 이탈을 무효화하고 Reset에서만 저장 원본을 초기화한다.
  function onScope() { const next = preview.getSnapshot(); generation++; failed = false; state = { ...state, scenario: "normal", lifecycle: undefined, application: undefined }; if (next.resetGeneration !== previous.resetGeneration) { workspaces.clear(); definitions.clear(); submissions.clear(); batches.clear(); subtaskSubmissions.clear(); commentSubmissions.clear(); sequence = 0; } previous = next; publish(); }
  // 기능 : 앱 수명의 계정·프로젝트·팀 구독을 연결하고 모두 정리한다.
  function connect() { previous = preview.getSnapshot(); const stopPreview = preview.subscribe(onScope); const stopProjects = projects.subscribe(publish); const stopTeam = team.subscribe(publish); return function cleanup() { stopTeam(); stopProjects(); stopPreview(); }; }
  // 기능 : 안정된 버전 snapshot을 구독자에게 반환한다.
  function getSnapshot() { return state; }
  // 기능 : 작업 변경 구독과 해제를 짝지어 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  return { getSnapshot, subscribe, connect, setScenario, read, current, members, statuses, saveStatuses, complete, remove, create, createBatch, edit, addSubtask, editSubtask, addComment };
}
