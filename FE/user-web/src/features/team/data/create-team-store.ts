import type { PreviewRuntime } from "@/features/preview/data/preview-data-source";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import { authDelay } from "@/features/mock-auth/data/auth-delay";
import { inviteError, TeamReadError } from "../model/team-types";
import type { InviteDraft, TeamFixture, TeamRow, TeamScenario, TeamState, TeamStore } from "../model/team-types";
import { teamProjects, teamSeed } from "./team-seed";
// 기능 : 작업공간별 초대 원본을 메모리에 보관하고 취소·중복·세션 경합을 저장 직전에 검사한다.
export function createTeamStore(preview: PreviewRuntime): TeamStore {
  let projectSource: Parameters<TeamStore["connectProjects"]>[0] | null = null;
  const teams = new Map<string, TeamRow[]>(); const fixtures = new Map<string, TeamFixture>(); const listeners = new Set<() => void>();
  let state: TeamState = { version: 0, scenario: "normal" }; let previous = preview.getSnapshot(); let generation = 0; let counter = 0; let fail = false;
  // 기능 : 구독 화면에 새 불변 스냅샷을 전달한다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 현재 세션과 작업공간 밖에서 시작한 지연 작업을 거부한다.
  function assertScope(scope: PreviewScope) { const now = preview.getSnapshot(); if (now.revision !== scope.revision || now.session?.id !== scope.actorId || now.workspaceId !== scope.workspaceId) throw new DOMException("Team scope changed", "AbortError"); }
  // 기능 : 원본 구성이 다른 두 시나리오를 작업공간별로 구분한다.
  function fixture(id: string) { return fixtures.get(id) ?? "inviting"; }
  // 기능 : 새 작업공간에는 독립 seed를 한 번만 생성한다.
  function rows(id: string) { let value = teams.get(id); if (!value) { value = teamSeed(id, fixture(id)); teams.set(id, value); } return value; }
  // 기능 : 저장 권한을 UI와 별개로 목 저장 경계에서도 확인한다.
  function assertWrite(scope: PreviewScope) { assertScope(scope); if (preview.getSnapshot().session?.role !== "owner" || state.scenario === "denied") throw new Error("Only the local owner can change this team."); }
  // 기능 : 취소·실행 차수·문맥을 비동기 작업 이후 재검사한다.
  async function wait(scope: PreviewScope, signal: AbortSignal, delay: number) { assertScope(scope); const expected = generation; await authDelay(state.scenario === "slow" ? 1500 : delay, signal); signal.throwIfAborted(); assertScope(scope); if (expected !== generation) throw new DOMException("Team request replaced", "AbortError"); }
  // 기능 : 일회 장애를 실제 상태 변경 전에 소비한다.
  function failOnce(scenario: TeamScenario, message: string) { if (state.scenario === scenario && fail) { fail = false; throw new Error(message); } }
  // 기능 : 로그인·작업공간 변경은 진행만 취소하고 Reset은 저장된 팀도 초기화한다.
  function onScope() { const next = preview.getSnapshot(); generation++; fail = false; state = { ...state, scenario: "normal" }; if (next.resetGeneration !== previous.resetGeneration) { teams.clear(); fixtures.clear(); counter = 0; } previous = next; publish(); }
  // 기능 : 앱 수명에만 문맥 변경 구독을 연결한다.
  function connect() { previous = preview.getSnapshot(); return preview.subscribe(onScope); }
  // 기능 : 장애 시나리오를 변경하면 이전 요청을 폐기하고 새 조회를 시작한다.
  function setScenario(scenario: TeamScenario) { generation++; fail = true; state = { ...state, scenario }; publish(); }
  // 기능 : 명시적인 검증 도구 조작으로 해당 작업공간의 비교용 구성만 초기화한다.
  function setFixture(scope: PreviewScope, value: TeamFixture) { assertWrite(scope); generation++; fixtures.set(scope.workspaceId, value); teams.set(scope.workspaceId, teamSeed(scope.workspaceId, value)); publish(); }
  // 기능 : 원본 조회에 로딩·빈 상태·권한·일회 실패를 제공한다.
  async function read(scope: PreviewScope, signal: AbortSignal) {
    await wait(scope, signal, 120);
    if (state.scenario === "denied" || preview.getSnapshot().session?.memberships?.[scope.workspaceId]?.invitation) throw new TeamReadError("denied", "This team is unavailable in the local permission scenario.");
    if (state.scenario === "read-error" && fail) { fail = false; throw new TeamReadError("read", "Unable to load the local team. Please try again."); }
    if (state.scenario === "empty") return [];
    const value = structuredClone(rows(scope.workspaceId));
    if (state.scenario === "expired") for (const row of value) if (row.status === "pending") row.status = "expired";
    return value;
  }
  // 기능 : 제출 snapshot을 검증하고 같은 이메일 동시 요청도 한 개의 Pending 초대만 생성한다.
  async function invite(scope: PreviewScope, input: InviteDraft, signal: AbortSignal) {
    assertWrite(scope); const value = structuredClone(input); const error = inviteError(value); if (error) throw new Error(error);
    const email = value.email.trim().toLowerCase(); const available = projects(scope.workspaceId);
    if (value.projectIds.some(id => !available.some(project => project.id === id))) throw new Error("Select projects from the current workspace.");
    await wait(scope, signal, 300); assertWrite(scope);
    if (value.projectIds.some(id => !projects(scope.workspaceId).some(project => project.id === id))) throw new Error("A selected project is no longer available.");
    const existing = rows(scope.workspaceId); const duplicate = existing.find(row => row.email.toLowerCase() === email);
    if (duplicate) throw new Error(duplicate.status === "joined" ? "This person is already a member of this local team." : state.scenario === "expired" ? "An expired invitation exists. Remove it before creating a new invitation." : "An invitation already exists for this email.");
    failOnce("invite-error", "Unable to create the local invitation. Your selections are still here. Please try again.");
    const role = value.role === "Partner" ? "Partner" : "Collaborator";
    const created: TeamRow = { id: `${scope.workspaceId}:invite-new-${++counter}`, workspaceId: scope.workspaceId, revision: 0, name: email, email, role, projectIds: role === "Partner" ? [] : [...new Set(value.projectIds)], allProjects: role === "Partner", status: "pending", joinedOn: null };
    teams.set(scope.workspaceId, [...existing, created]); publish(); return structuredClone(created);
  }
  // 기능 : 이름·배열 위치 대신 같은 작업공간의 ID·이메일·revision으로 대기 초대만 제거한다.
  async function remove(scope: PreviewScope, target: TeamRow, signal: AbortSignal) {
    assertWrite(scope); const value = structuredClone(target);
    if (value.workspaceId !== scope.workspaceId || value.status === "joined") throw new Error("Only a pending invitation in this workspace can be removed.");
    await wait(scope, signal, 300); assertWrite(scope);
    const existing = rows(scope.workspaceId); const match = existing.find(row => row.id === value.id);
    if (!match || match.email !== value.email || match.revision !== value.revision || match.status === "joined") throw new Error("This invitation has already changed or been removed. Close this dialog and check the team.");
    failOnce("remove-error", "Unable to remove the local invitation. Please try again.");
    teams.set(scope.workspaceId, existing.filter(row => row.id !== match.id)); publish();
  }
  // 기능 : 팀 변경 리스너와 해제를 한 쌍으로 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  // 기능 : React가 참조 안정성이 있는 현재 스냅샷을 읽게 한다.
  function getSnapshot() { return state; }
  // 기능 : 초대 링크가 가리키는 같은 팀 행만 복사하고 철회·미존재를 구분한다.
  function invitation(workspaceId: string, id: string) {
    const row = rows(workspaceId).find(item => item.id === id);
    if (!row) return null;
    return structuredClone(state.scenario === "expired" && row.status === "pending" ? { ...row, status: "expired" as const } : row);
  }
  // 기능 : 인증 검증 뒤 동기 저장 구간에서 미변경 Pending만 같은 ID의 가입 멤버로 바꾼다.
  function accept(target: TeamRow, name: string) {
    const current = invitation(target.workspaceId, target.id);
    if (!current || current.status !== "pending" || current.revision !== target.revision || current.email !== target.email || current.role === "Owner") throw new Error("This invitation is unavailable, expired, removed or already accepted.");
    const joined: TeamRow = { ...current, name, status: "joined", joinedOn: "Feb 8, 2024", revision: current.revision + 1 };
    teams.set(target.workspaceId, rows(target.workspaceId).map(row => row.id === joined.id ? joined : row)); publish(); return structuredClone(joined);
  }
  // 기능 : 초대 선택지에 실제 프로젝트 저장소의 같은 ID·이름을 제공한다.
  function projects(workspaceId: string) { return projectSource ? projectSource.projects(workspaceId) : teamProjects(workspaceId); }
  // 기능 : 프로젝트 업무가 아직 없는 독립 팀 검사에서는 seed를 유지하고 앱에서는 실제 원본을 구독한다.
  function connectProjects(source: Parameters<TeamStore["connectProjects"]>[0]) { projectSource = source; const dispose = source.subscribe(publish); publish(); return function disconnectProjects() { dispose(); projectSource = null; }; }
  // 기능 : 프로젝트 초기 팀에 대기 초대 대신 같은 workspace의 가입 멤버만 제공한다.
  function joinedMembers(workspaceId: string) { return structuredClone(rows(workspaceId).filter(row => row.status === "joined")); }
  return { subscribe, getSnapshot, connect, setScenario, setFixture, fixture, projects, read, invite, remove, invitation, accept, joinedMembers, connectProjects };
}
