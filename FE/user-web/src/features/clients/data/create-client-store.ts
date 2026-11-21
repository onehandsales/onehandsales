import { applyClientEdit } from "../model/client-edits";
import type { ClientEdit } from "../model/client-edits";
import { invitationAccess, PreviewError } from "@/features/preview";
import type { PreviewRuntime, PreviewScope, Scenario } from "@/features/preview";
import { abortableDelay } from "@/lib/abortable-delay";
import { clientDraftError } from "../model/client-types";
import type { ClientCompany, ClientData, ClientDraft, ClientState, ClientStore } from "../model/client-types";
import { clientSeed } from "./client-seed";
// 기능 : 고객과 연락처의 단일 원본을 보존하고 저장 전 문맥·권한·중복 제출을 다시 확인한다.
export function createClientStore(preview: PreviewRuntime): ClientStore {
  const retiredFields = new Set<string>();
  const workspaces = new Map<string, ClientData>(); const submissions = new Map<string, ClientCompany>(); const listeners = new Set<() => void>();
  let state: ClientState = { version: 0, scenario: "normal" }; let generation = 0; let sequence = 0; let failed = false; let previous = preview.getSnapshot();
  // 기능 : 저장소 변경을 안정된 새 스냅샷으로 구독자에게 알린다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 작업공간 최초 접근에서만 독립 고객 seed를 만든다.
  function data(workspaceId: string) { let value = workspaces.get(workspaceId); if (!value) { value = clientSeed(workspaceId); workspaces.set(workspaceId, value); } return value; }
  // 기능 : 초대 협업자를 포함한 다른 문맥의 직접 저장소 접근을 제한한다.
  function assertScope(scope: PreviewScope) {
    const current = preview.getSnapshot();
    if (current.revision !== scope.revision || current.session?.id !== scope.actorId || current.workspaceId !== scope.workspaceId) throw new DOMException("Client scope changed", "AbortError");
    if (invitationAccess(current) || state.scenario === "denied") throw new PreviewError("denied", "Clients are unavailable in this workspace role.");
  }
  // 기능 : 취소·시나리오·workspace 변경 이후 지연 결과를 폐기한다.
  async function wait(scope: PreviewScope, signal: AbortSignal) { assertScope(scope); const expected = generation; await abortableDelay(state.scenario === "slow" ? 1500 : 150, signal); signal.throwIfAborted(); assertScope(scope); if (expected !== generation) throw new DOMException("Client request replaced", "AbortError"); }
  // 기능 : 같은 탭 저장값은 유지하고 Reset에만 고객·제출 이력을 초기화한다.
  function onScope() { const next = preview.getSnapshot(); generation++; if (next.resetGeneration !== previous.resetGeneration) { workspaces.clear(); submissions.clear(); retiredFields.clear(); sequence = 0; } previous = next; state = { ...state, scenario: "normal" }; failed = false; publish(); }
  // 기능 : 앱 수명에 고객 저장소의 문맥 구독을 연결한다.
  function connect() { previous = preview.getSnapshot(); return preview.subscribe(onScope); }
  // 기능 : 명시적 장애 시나리오 변경은 이전 응답을 폐기한다.
  function setScenario(scenario: Scenario) { generation++; failed = false; state = { ...state, scenario }; publish(); }
  // 기능 : 목록·상세·선택지에 같은 고객과 연락처의 복사본을 제공한다.
  async function read(scope: PreviewScope, signal: AbortSignal) { await wait(scope, signal); if (state.scenario === "read-error" && !failed) { failed = true; throw new PreviewError("read", "Unable to load clients. Please try again."); } const value = structuredClone(data(scope.workspaceId)); return state.scenario === "empty" ? { ...value, clients: [], contacts: [] } : value; }
  // 기능 : 제출 ID 하나에 고객·기본 연락처·태그 연결을 함께 저장하고 실패 시 부분 반영하지 않는다.
  async function create(scope: PreviewScope, input: ClientDraft, submissionId: string, signal: AbortSignal) {
    const draft = structuredClone(input); const error = clientDraftError(draft); if (error) throw new PreviewError("invalid", error);
    await wait(scope, signal); if (state.scenario === "empty") throw new PreviewError("invalid", "Choose normal to create a client outside the empty preview."); const key = `${scope.workspaceId}:${scope.actorId}:${submissionId}`; const saved = submissions.get(key); if (saved) return structuredClone(saved);
    if (state.scenario === "write-error" && !failed) { failed = true; throw new PreviewError("write", "Unable to add client. Your inputs are preserved. Please try again."); }
    const current = data(scope.workspaceId); if (draft.tagIds.some(id => !current.tags.some(tag => tag.id === id))) throw new PreviewError("invalid", "Choose tags from this workspace.");
    const number = ++sequence; const contact = { id: `${scope.workspaceId}:contact-new-${number}`, workspaceId: scope.workspaceId, name: draft.contactName.trim(), email: draft.email.trim() };
    const client: ClientCompany = { id: `${scope.workspaceId}:client-new-${number}`, workspaceId: scope.workspaceId, companyName: draft.companyName.trim(), displayName: draft.companyName.trim() || contact.name, contactIds: [contact.id], defaultContactId: contact.id, tagIds: [...new Set(draft.tagIds)], status: "active", revision: 0, image: null, imageRevision: 0 };
    workspaces.set(scope.workspaceId, { ...current, clients: [...current.clients, client], contacts: [...current.contacts, contact] }); submissions.set(key, client); publish(); return structuredClone(client);
  }
  // 기능 : 고객 정의·값·이미지만 원자적으로 바꾸고 생성/다른 업무 원본은 보존한다.
  async function edit(scope: PreviewScope, input: ClientEdit, signal: AbortSignal) {
    const command = structuredClone(input); await wait(scope, signal);
    if (state.scenario === "empty") throw new PreviewError("invalid", "Choose normal to edit outside the empty preview.");
    if (state.scenario === "write-error" && !failed) { failed = true; throw new PreviewError("write", "Unable to save. Your inputs are preserved. Please try again."); }
    if (command.kind === "add-field" && !command.id.startsWith(scope.workspaceId + ":client-field-")) throw new PreviewError("invalid", "Choose a field ID from this workspace.");
    if (command.kind === "add-field" && retiredFields.has(command.id)) throw new Error("This field was removed. Start a new field instead.");
    const next = applyClientEdit(data(scope.workspaceId), command);
    if (command.kind === "delete-field") retiredFields.add(command.id);
    workspaces.set(scope.workspaceId, next); publish();
  }
  // 기능 : React 구독용 스냅샷 참조를 안정적으로 반환한다.
  function getSnapshot() { return state; }
  // 기능 : 고객 변경 구독과 해제를 짝지어 제공한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  return { getSnapshot, subscribe, connect, setScenario, read, create, edit };
}
