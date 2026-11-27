import { invitationAccess, PreviewError } from "@/features/preview";
import type { PreviewRuntime, PreviewScope, Scenario } from "@/features/preview";
import { teamProjects } from "@/features/team";
import type { TeamStore } from "@/features/team";
import type { ClientStore } from "@/features/clients";
import { abortableDelay } from "@/lib/abortable-delay";
import { defaultProjectSettings } from "../model/project-settings";
import { applyProjectEdit } from "../model/project-edits";
import type { ProjectEdit } from "../model/project-edits";
import { initialProjectStage, projectStages } from "../model/project-types";
import { INVITATION_WORKSPACE_ID, invitationRecordedOverview } from "@/mocks/invitation-seed";
import type { Project, ProjectDraft, ProjectState, ProjectStore, ProjectTag } from "../model/project-types";
// 기능 : 고객/전체 생성과 G17 초대 선택지가 하나의 프로젝트 원본을 소비하도록 한다.
export function createProjectStore(preview: PreviewRuntime, clients: ClientStore, team: TeamStore): ProjectStore {
  const workspaces = new Map<string, Project[]>(); const tagDefinitions = new Map<string, ProjectTag[]>(); const submissions = new Map<string, string>(); const listeners = new Set<() => void>();
  let state: ProjectState = { version: 0, scenario: "normal" }; let generation = 0; let sequence = 0; let failed = false; let previous = preview.getSnapshot();
  // 기능 : G17의 기존 선택 ID를 보존해 생성 업무의 실제 프로젝트 seed로 승계한다.
  function rows(workspaceId: string) { let data = workspaces.get(workspaceId); if (!data) { data = teamProjects(workspaceId).map((project, index) => ({ ...project, workspaceId, clientId: `${workspaceId}:client-${index === 0 ? "sample" : "doe"}`, memberIds: [`${workspaceId}:member-owner`], stage: index === 0 ? "In Progress" : "New Lead", revision: 0, settings: defaultProjectSettings(), recordedOverview: index === 1 && workspaceId === INVITATION_WORKSPACE_ID ? structuredClone(invitationRecordedOverview) : undefined, timeEntries: index === 1 && workspaceId !== INVITATION_WORKSPACE_ID ? [7, 3600].map((seconds, timeIndex) => ({ id: `${workspaceId}:project-time-${timeIndex + 1}`, taskId: `${workspaceId}:task-initial-chat-${timeIndex + 1}`, taskName: "Initial Chat", memberId: `${workspaceId}:member-owner`, day: "2024-02-06", seconds, rateMinor: 2000, amountMinor: timeIndex === 0 ? 4 : 2000 })) : [], startDate: index === 0 ? "2024-02-07" : "2024-02-06", money: { currency: "USD", dueMinor: 0, paidMinor: 0 }, tagIds: index === 0 ? [`${workspaceId}:project-tag-sample`] : [], origin: "seed", created: { name: index === 1 ? "Design Project with Doe" : project.name, actor: "Alex (preview)", at: "Feb 6, 2024, 3:15:44 AM" } })); workspaces.set(workspaceId, data); } return data; }
  // 기능 : 새 불변 버전으로 프로젝트와 초대 선택지 구독자를 함께 갱신한다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 다른 계정/workspace/revision의 직접 저장과 초대 협업자의 생성을 거부한다.
  function assertScope(scope: PreviewScope, write = false) { const current = preview.getSnapshot(); if (current.revision !== scope.revision || current.session?.id !== scope.actorId || current.workspaceId !== scope.workspaceId) throw new DOMException("Project scope changed", "AbortError"); if (state.scenario === "denied" || write && invitationAccess(current)) throw new PreviewError("denied", "Projects are unavailable for this local action or role."); }
  // 기능 : 지연 후에도 취소·문맥·시나리오 차수를 다시 확인한다.
  async function wait(scope: PreviewScope, signal: AbortSignal, write = false) { assertScope(scope, write); const expected = generation; await abortableDelay(state.scenario === "slow" ? 1500 : 150, signal); signal.throwIfAborted(); assertScope(scope, write); if (generation !== expected) throw new DOMException("Project request replaced", "AbortError"); }
  // 기능 : 로그아웃은 저장 원본을 유지하고 Reset에서만 프로젝트를 초기화한다.
  function onScope() { const next = preview.getSnapshot(); generation++; failed = false; state = { ...state, scenario: "normal" }; if (next.resetGeneration !== previous.resetGeneration) { workspaces.clear(); tagDefinitions.clear(); submissions.clear(); sequence = 0; } previous = next; publish(); }
  // 기능 : 앱 수명 동안만 가상 세션 변경을 구독한다.
  function connect() { previous = preview.getSnapshot(); return preview.subscribe(onScope); }
  // 기능 : 비교용 장애 상태는 저장 데이터를 지우지 않고 이전 응답만 무효화한다.
  function setScenario(scenario: Scenario) { generation++; failed = false; state = { ...state, scenario }; publish(); }
  // 기능 : 허용 프로젝트만 목록/상세에 제공하고 고객 표시명은 고객 원본에서 읽는다.
  async function read(scope: PreviewScope, signal: AbortSignal) { await wait(scope, signal); if (state.scenario === "read-error" && !failed) { failed = true; throw new PreviewError("read", "Unable to load projects. Please try again."); } const access = invitationAccess(preview.getSnapshot()); return state.scenario === "empty" ? [] : structuredClone(rows(scope.workspaceId).filter(project => !access || access.allProjects || access.projectIds.includes(project.id)).map(project => ({ ...project, clientName: clients.client(scope.workspaceId, project.clientId)?.displayName ?? "Client unavailable", tags: tags(scope.workspaceId).filter(tag => project.tagIds.includes(tag.id)) }))); }
  // 기능 : 고객·초기 단계·팀·생성 활동을 한 번에 저장하고 실패 때 부분 프로젝트를 남기지 않는다.
  async function create(scope: PreviewScope, input: ProjectDraft, submissionId: string, signal: AbortSignal) {
    const draft = structuredClone(input); if (!draft.name.trim() || draft.name.trim().length > 200) throw new Error("Enter a project title of 1–200 characters."); if (!projectStages.includes(draft.stage) || !["client", "global", "column"].includes(draft.origin)) throw new Error("Choose a valid creation context.");
    await wait(scope, signal, true); if (state.scenario === "empty") throw new Error("Choose normal before creating outside the empty preview.");
    const key = `${scope.workspaceId}:${scope.actorId}:${submissionId}`; const savedId = submissions.get(key); const saved = rows(scope.workspaceId).find(project => project.id === savedId); if (saved) return structuredClone(saved);
    if (!clients.client(scope.workspaceId, draft.clientId)) throw new Error("Select an existing client from this workspace.");
    const owner = team.joinedMembers(scope.workspaceId).find(member => member.role === "Owner"); if (!owner) throw new Error("The initial project team is unavailable. Check the workspace team.");
    if (state.scenario === "write-error" && !failed) { failed = true; throw new Error("Unable to create project. Your inputs are preserved. Please try again."); }
    const name = draft.name.trim(); const project: Project = { id: `${scope.workspaceId}:project-new-${++sequence}`, workspaceId: scope.workspaceId, name, clientId: draft.clientId, memberIds: [owner.id], stage: initialProjectStage(draft.origin, draft.stage), revision: 0, settings: defaultProjectSettings(), timeEntries: [], startDate: null, money: { currency: "USD", dueMinor: 0, paidMinor: 0 }, tagIds: [], origin: draft.origin, created: { name, actor: preview.getSnapshot().session!.name, at: "Feb 8, 2024, 3:15:44 AM" } };
    workspaces.set(scope.workspaceId, [...rows(scope.workspaceId), project]); submissions.set(key, project.id); publish(); return structuredClone(project);
  }
  // 기능 : 프로젝트 태그 정의는 고객 태그와 분리하며 같은 작업공간의 이름/ID만 공유한다.
  function tags(workspaceId: string) { let values = tagDefinitions.get(workspaceId); if (!values) { values = [{ id: `${workspaceId}:project-tag-sample`, name: "Sample", color: "purple", revision: 0 }]; tagDefinitions.set(workspaceId, values); } return structuredClone(values); }
  // 기능 : 명시적인 새 이동 의도는 지연된 조회 대신 현재 저장 revision을 읽되 접근 범위를 지킨다.
  function current(scope: PreviewScope, projectId: string) { assertScope(scope); const access = invitationAccess(preview.getSnapshot()); if (state.scenario === "empty" || access && !access.allProjects && !access.projectIds.includes(projectId)) return null; return structuredClone(rows(scope.workspaceId).find(project => project.id === projectId) ?? null); }
  // 기능 : 지연 후 현재 프로젝트/태그 revision을 검증하고 이동·태그를 한 번에 확정한다.
  async function edit(scope: PreviewScope, input: ProjectEdit, signal: AbortSignal) { const command = structuredClone(input); await wait(scope, signal, true); if (state.scenario === "empty") throw new Error("Choose normal before changing a project."); if (state.scenario === "write-error" && !failed) { failed = true; throw new Error("Unable to update project. Your changes are preserved. Please try again."); } const next = applyProjectEdit(rows(scope.workspaceId), tags(scope.workspaceId), command, `${scope.workspaceId}:project-tag-new-${++sequence}`); workspaces.set(scope.workspaceId, next.projects); tagDefinitions.set(scope.workspaceId, next.tags); publish(); return structuredClone(next.project); }
  // 기능 : 실제 저장 프로젝트의 최소 ID/이름만 팀 선택지에 투영한다.
  function projects(workspaceId: string) { return rows(workspaceId).map(({ id, name }) => ({ id, name })); }
  // 기능 : 안정된 저장소 스냅샷을 React 구독에 제공한다.
  function getSnapshot() { return state; }
  // 기능 : 저장 변경 구독과 해제를 짝지어 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  return { getSnapshot, subscribe, connect, setScenario, projects, tags, current, edit, read, create };
}
