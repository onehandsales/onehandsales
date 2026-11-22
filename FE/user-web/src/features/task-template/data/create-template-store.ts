import { PreviewError } from "@/features/preview";
import type { PreviewRuntime, PreviewScope, Scenario } from "@/features/preview";
import { abortableDelay } from "@/lib/abortable-delay";
import { copyTemplate, copyTemplateTask, templateName, validateTemplateTask } from "../model/template-values";
import type { TaskTemplate, TemplateState, TemplateStore, TemplateTask, TemplateTaskDraft } from "../model/template-types";

// 기능 : workspace의 템플릿 정의만 저장하며 상위 저장·취소·revision·중복 제출을 격리한다.
export function createTemplateStore(runtime: PreviewRuntime): TemplateStore {
  const workspaces = new Map<string, TaskTemplate[]>(); const submissions = new Map<string, string>();
  const listeners = new Set<() => void>(); let sequence = 0; let generation = 0; let failed = false;
  let state: TemplateState = { version: 0, scenario: "normal" }; let previous = runtime.getSnapshot();
  // 기능 : 소개 그림을 seed로 만들지 않고 실제로 빈 템플릿 목록을 제공한다.
  function rows(workspaceId: string) { let result = workspaces.get(workspaceId); if (!result) { result = []; workspaces.set(workspaceId, result); } return result; }
  // 기능 : 원본 변경을 구독하는 조회와 선택지를 같은 버전으로 갱신한다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 현재 가상 계정·workspace·권한 시나리오 밖의 접근을 차단한다.
  function assertScope(scope: PreviewScope, writing = false) {
    const current = runtime.getSnapshot();
    if (current.revision !== scope.revision || current.session?.id !== scope.actorId || current.workspaceId !== scope.workspaceId) throw new DOMException("Template scope changed", "AbortError");
    if (state.scenario === "denied") throw new PreviewError("denied", "Task templates are unavailable in this local access scenario.");
    if (writing && current.session.role !== "owner") throw new Error("Only the workspace owner can edit task templates in this preview.");
    if (writing && state.scenario === "empty") throw new Error("Choose normal before saving templates outside the empty preview.");
  }
  // 기능 : 저장 직전에도 취소·문맥·시나리오 변경을 확인해 늦은 결과를 거부한다.
  async function wait(scope: PreviewScope, signal: AbortSignal, writing = false) {
    assertScope(scope, writing); const expected = generation;
    await abortableDelay(state.scenario === "slow" ? 1500 : 150, signal); signal.throwIfAborted(); assertScope(scope, writing);
    if (expected !== generation) throw new DOMException("Template request replaced", "AbortError");
  }
  // 기능 : 저장 원본을 바꾸기 전에 한 번 실패해 같은 초안으로 재시도할 수 있게 한다.
  function failWrite() { if (state.scenario === "write-error" && !failed) { failed = true; throw new Error("Unable to save the template. Your inputs are preserved. Please try again."); } }
  // 기능 : 상세 ID는 현재 workspace의 살아 있는 템플릿에만 연결한다.
  function current(scope: PreviewScope, id: string) { assertScope(scope); const row = rows(scope.workspaceId).find(item => item.id === id); return row && state.scenario !== "empty" ? copyTemplate(row) : null; }
  // 기능 : 빈 목록·읽기 실패·권한 제한을 구분하여 조회한다.
  async function read(scope: PreviewScope, signal: AbortSignal) {
    await wait(scope, signal);
    if (state.scenario === "read-error" && !failed) { failed = true; throw new PreviewError("read", "Unable to load task templates. Please try again."); }
    return state.scenario === "empty" ? [] : rows(scope.workspaceId).map(copyTemplate);
  }
  // 기능 : 한 생성 의도에는 빈 템플릿 ID를 한 번만 발급하고 동명 새 의도는 분리한다.
  async function create(scope: PreviewScope, input: string, submission: string, signal: AbortSignal) {
    const name = templateName(input); await wait(scope, signal, true);
    const key = `${scope.workspaceId}:${scope.actorId}:create:${submission}`; const prior = submissions.get(key);
    if (prior) { const saved = current(scope, prior); if (!saved) throw new Error("This template is unavailable."); return saved; }
    failWrite(); const template: TaskTemplate = { id: `${scope.workspaceId}:task-template-${++sequence}`, workspaceId: scope.workspaceId, name, revision: 0, tasks: [] };
    rows(scope.workspaceId).push(template); submissions.set(key, template.id); publish(); return copyTemplate(template);
  }
  // 기능 : 이름만 변경하면서 구성 작업과 다른 템플릿을 유지한다.
  async function rename(scope: PreviewScope, id: string, revision: number, input: string, signal: AbortSignal) {
    const name = templateName(input); await wait(scope, signal, true); const template = current(scope, id);
    if (!template) throw new Error("This template is unavailable.");
    if (template.revision !== revision) throw new Error("The template changed. Close and reopen it before retrying.");
    failWrite(); template.name = name; template.revision++;
    workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === id ? template : row)); publish(); return copyTemplate(template);
  }
  // 기능 : 하위 Save 초안과 첨부를 상위 Save Task에서만 하나의 구성 작업으로 확정한다.
  async function saveTask(scope: PreviewScope, templateId: string, taskId: string | null, revision: number, input: TemplateTaskDraft, submission: string, signal: AbortSignal) {
    const draft = validateTemplateTask(input); await wait(scope, signal, true); const template = current(scope, templateId);
    if (!template) throw new Error("This template is unavailable.");
    const key = `${scope.workspaceId}:${scope.actorId}:${templateId}:task:${submission}`; const prior = submissions.get(key);
    if (!taskId && prior) { const saved = template.tasks.find(task => task.id === prior); if (!saved) throw new Error("This saved template task is unavailable. Start a new task instead."); return copyTemplateTask(saved); }
    const existing = taskId ? template.tasks.find(task => task.id === taskId) : null;
    if (taskId && (!existing || existing.revision !== revision)) throw new Error("The template task changed or was removed. Close and reopen it before retrying.");
    failWrite(); const task: TemplateTask = { ...draft, id: taskId ?? `${scope.workspaceId}:template-task-${++sequence}`, revision: existing ? existing.revision + 1 : 0 };
    template.tasks = existing ? template.tasks.map(item => item.id === task.id ? task : item) : [...template.tasks, task]; template.revision++;
    workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === templateId ? template : row)); submissions.set(key, task.id); publish(); return copyTemplateTask(task);
  }
  // 기능 : 확인한 구성 작업만 제거하고 템플릿 컨테이너와 다른 작업은 보존한다.
  async function deleteTask(scope: PreviewScope, templateId: string, taskId: string, revision: number, signal: AbortSignal) {
    await wait(scope, signal, true); const template = current(scope, templateId); const task = template?.tasks.find(row => row.id === taskId);
    if (!template || !task) throw new Error("This template task is unavailable.");
    if (task.revision !== revision) throw new Error("The template task changed. Close and reopen it before deleting.");
    failWrite(); template.tasks = template.tasks.filter(row => row.id !== taskId); template.revision++;
    workspaces.set(scope.workspaceId, rows(scope.workspaceId).map(row => row.id === templateId ? template : row)); publish();
  }
  // 기능 : 장애 설정은 저장 데이터와 분리하고 진행 요청만 무효화한다.
  function setScenario(scenario: Scenario) { generation++; failed = false; state = { ...state, scenario }; publish(); }
  // 기능 : 로그아웃은 저장값을 유지하고 Reset에서만 템플릿과 파일 참조를 초기화한다.
  function onScope() { const next = runtime.getSnapshot(); generation++; failed = false; state = { ...state, scenario: "normal" }; if (next.resetGeneration !== previous.resetGeneration) { workspaces.clear(); submissions.clear(); sequence = 0; } previous = next; publish(); }
  // 기능 : 가상 실행 문맥의 구독을 앱 수명에 연결한다.
  function connect() { previous = runtime.getSnapshot(); return runtime.subscribe(onScope); }
  // 기능 : 저장소 변경 구독과 정리를 짝지어 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  // 기능 : 외부 구독에 안정된 버전 snapshot을 제공한다.
  function getSnapshot() { return state; }
  return { subscribe, getSnapshot, connect, setScenario, read, current, create, rename, saveTask, deleteTask };
}
