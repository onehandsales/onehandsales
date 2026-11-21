import { CompanyReadError, settingsError } from "@/features/company-settings/model/settings-types";
import type { CompanySettings, SettingsScenario } from "@/features/company-settings/model/settings-types";
import type { PreviewRuntime } from "@/features/preview/data/preview-data-source";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import type { AuthStore } from "@/features/mock-auth";
import { authDelay } from "@/features/mock-auth/data/auth-delay";
import { PREVIEW_SESSIONS } from "@/mocks/preview-seed";
import { initialSetup, setupError } from "../model/company-types";
import type { Company, CompanyScenario, CompanyStore, SetupDraft, SetupStep } from "../model/company-types";

// 기능 : 회사 저장 결과와 온보딩 초안을 같은 workspace ID에 연결하고 인증 전환에서 초안만 폐기한다.
export function createCompanyStore(preview: PreviewRuntime, auth: AuthStore): CompanyStore {
  const companies = new Map<string, Company>(); const drafts = new Map<string, SetupDraft>(); const listeners = new Set<() => void>();
  let state = { version: 0, scenario: "normal" as CompanyScenario, settingsScenario: "normal" as SettingsScenario }; let previous = preview.getSnapshot(); let generation = 0; let failureArmed = false; let settingsFailure = false; let logoFailure = false;
  // 기능 : 독립 G01 작업공간의 회사 fixture를 고정 ID로 준비한다.
  function seed() { companies.clear(); for (const session of PREVIEW_SESSIONS) for (const workspace of session.workspaces) companies.set(workspace.id, { ...structuredClone(initialSetup), id: "company-" + workspace.id, workspaceId: workspace.id, name: workspace.name, industry: "Design", invites: [], setupComplete: true, ...settingsSeed(workspace.id, session.id) }); }
  // 기능 : 원본 계정과 구분한 목 공개 주소·회사 편집 초기 상태를 만든다.
  function settingsSeed(workspaceId: string, actorId: string) { return { detailsComplete: false, settingsRevision: 0, address: null, logo: null, publicProfile: true, slug: workspaceId, contactId: actorId }; }
  seed();
  // 기능 : 안정된 외부 스냅샷을 갱신해 같은 회사 소비 화면을 다시 그린다.
  function publish() { state = { ...state, version: state.version + 1 }; listeners.forEach(listener => listener()); }
  // 기능 : 다른 계정·작업공간의 늦은 저장을 현재 회사에 반영하지 않는다.
  function assertScope(scope: PreviewScope) { const now = preview.getSnapshot(); if (now.revision !== scope.revision || now.session?.id !== scope.actorId || now.workspaceId !== scope.workspaceId) throw new DOMException("Company scope changed", "AbortError"); }
  // 기능 : 로그아웃·작업공간 변경은 초안/진행을 폐기하고 Reset만 회사 seed도 복원한다.
  function onScope() { const next = preview.getSnapshot(); generation++; drafts.clear(); failureArmed = false; settingsFailure = false; logoFailure = false; state = { ...state, scenario: "normal", settingsScenario: "normal" }; if (next.resetGeneration !== previous.resetGeneration) seed(); previous = next; publish(); }
  // 기능 : 회사 저장소를 앱의 실행 수명에 연결한다.
  function connect() { previous = preview.getSnapshot(); return preview.subscribe(onScope); }
  // 기능 : 현재 계정의 입력 초안을 복사해 직접 변경을 막는다.
  function draft(scope: PreviewScope) { assertScope(scope); return structuredClone(drafts.get(scope.actorId + "/" + scope.workspaceId) ?? initialSetup); }
  // 기능 : 같은 workspace의 저장된 회사만 복사해 읽는다.
  function company(workspaceId: string) { const value = companies.get(workspaceId); return value ? structuredClone(value) : undefined; }
  // 기능 : 로컬 입력을 보존하되 서버 저장이나 회사 생성으로 표시하지 않는다.
  function edit(scope: PreviewScope, patch: Partial<SetupDraft>) { assertScope(scope); drafts.set(scope.actorId + "/" + scope.workspaceId, { ...draft(scope), ...structuredClone(patch) }); publish(); }
  // 기능 : 회사 쓰기 지연·일회 실패를 인증 시나리오와 분리한다.
  function setScenario(scenario: CompanyScenario) { generation++; failureArmed = scenario === "fail-once"; state = { ...state, scenario }; publish(); }
  // 기능 : 입력·실행 차수·취소를 검사한 뒤 같은 회사와 가입 완료 상태를 한 번 확정한다.
  async function finish(scope: PreviewScope, signal: AbortSignal) {
    assertScope(scope); if (preview.getSnapshot().session?.role !== "owner") throw new Error("Only the local owner can complete setup.");
    const key = scope.actorId + "/" + scope.workspaceId; const submitted = drafts.get(key); const draftValue = draft(scope); const submittedGeneration = generation;
    for (const step of [0, 1, 3, 4] as SetupStep[]) { const error = setupError(draftValue, step); if (error) throw new Error(error); }
    await authDelay(state.scenario === "slow" ? 1500 : 350, signal); signal.throwIfAborted(); assertScope(scope);
    if (submittedGeneration !== generation || submitted !== drafts.get(key)) throw new DOMException("Setup draft changed", "AbortError");
    if (failureArmed) { failureArmed = false; throw new Error("Unable to save this local setup. Your answers are still here. Please try again."); }
    const value: Company = { industry: draftValue.industry, name: draftValue.name.trim(), country: draftValue.country, businessType: draftValue.businessType, currency: draftValue.currency, revenue: draftValue.revenue, invites: draftValue.invites.map(email => email.trim().toLowerCase()).filter(Boolean), purposes: [...draftValue.purposes], id: "company-" + scope.workspaceId, workspaceId: scope.workspaceId, setupComplete: true, ...settingsSeed(scope.workspaceId, scope.actorId) };
    companies.set(scope.workspaceId, value); generation++; auth.completeSetup(scope.actorId); publish(); return structuredClone(value);
  }
  // 기능 : 회사 편집의 실패·지연 시나리오를 온보딩과 분리하고 기존 요청을 무효화한다.
  function setSettingsScenario(scenario: SettingsScenario) { generation++; settingsFailure = scenario === "read-error" || scenario === "save-error"; logoFailure = scenario === "logo-error"; state = { ...state, settingsScenario: scenario }; publish(); }
  // 기능 : 로고 읽기의 일회 실패를 실제 파일 처리 전에 소비한다.
  function consumeLogoFailure() { const fail = logoFailure; logoFailure = false; return fail; }
  // 기능 : 현재 작업공간의 회사 조회에 취소·빈 상태·권한·재시도 분기를 제공한다.
  async function readSettings(scope: PreviewScope, signal: AbortSignal) {
    assertScope(scope); const expected = generation; await authDelay(state.settingsScenario === "slow" ? 1500 : 120, signal); signal.throwIfAborted(); assertScope(scope);
    if (expected !== generation) throw new DOMException("Company read changed", "AbortError");
    if (state.settingsScenario === "denied") throw new CompanyReadError("denied", "Company settings are unavailable in this local permission scenario.");
    if (state.settingsScenario === "read-error" && settingsFailure) { settingsFailure = false; throw new CompanyReadError("read", "Unable to load the local company. Please try again."); }
    const value = company(scope.workspaceId); if (!value || state.settingsScenario === "empty") throw new CompanyReadError("missing", "No company details are available in this local scenario."); return value;
  }
  // 기능 : 승인된 전체 초안만 같은 회사 ID에 저장하고 중복·충돌·다른 계정의 늦은 결과를 거부한다.
  async function saveSettings(scope: PreviewScope, input: CompanySettings, expectedRevision: number, signal: AbortSignal) {
    assertScope(scope); const owner = preview.getSnapshot().session; if (owner?.role !== "owner" || state.settingsScenario === "denied") throw new Error("Only the local owner can edit company settings.");
    const value = structuredClone(input); const error = settingsError(value); if (error) throw new Error(error); const expected = generation;
    await authDelay(state.settingsScenario === "slow" ? 1500 : 300, signal); signal.throwIfAborted(); assertScope(scope);
    if (expected !== generation) throw new DOMException("Company save changed", "AbortError");
    const existing = companies.get(scope.workspaceId); if (!existing || existing.settingsRevision !== expectedRevision) throw new Error("Company details changed. Reload the saved company before trying again.");
    if ([...companies.values()].some(item => item.workspaceId !== scope.workspaceId && item.slug === value.slug)) throw new Error("This local profile URL is already used. Choose another URL.");
    if (state.settingsScenario === "save-error" && settingsFailure) { settingsFailure = false; throw new Error("Unable to save the local company. Your changes are still here. Please try again."); }
    const saved: Company = { ...existing, ...value, name: value.name.trim() || owner.name, contactId: existing.contactId, detailsComplete: true, settingsRevision: existing.settingsRevision + 1 };
    companies.set(scope.workspaceId, saved); publish(); return structuredClone(saved);
  }
  // 기능 : 익명 화면에는 허용된 공개 필드만 전달하고 비활성 회사의 내용을 노출하지 않는다.
  function publicCompany(slug: string) { const value = [...companies.values()].find(item => item.slug === slug); if (!value) return undefined; return value.publicProfile ? { name: value.name, country: value.country, logo: value.logo, enabled: true } : { name: "", country: "", logo: null, enabled: false }; }
  // 기능 : 구독을 해제할 수 있는 회사 상태 리스너를 등록한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  // 기능 : React 외부 저장소에 안정된 현재 참조를 전달한다.
  function getSnapshot() { return state; }
  return { getSnapshot, subscribe, connect, draft, company, edit, setScenario, finish, readSettings, saveSettings, publicCompany, setSettingsScenario, consumeLogoFailure };
}
