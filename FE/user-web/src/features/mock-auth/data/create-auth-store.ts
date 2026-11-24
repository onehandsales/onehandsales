import type { PreviewRuntime } from "@/features/preview/data/preview-data-source";
import type { ActorId } from "@/features/preview/model/preview-types";
import { previewReturnPath } from "@/features/preview/model/preview-return-path";
import { PREVIEW_SESSIONS } from "@/mocks/preview-seed";
import type { AuthAccount, AuthScenario, AuthSnapshot, AuthStore, SignupInput, SignupResult, LoginInput, LoginResult, ResetChallenge } from "../model/auth-types";
import { validateSignup, passwordStrength } from "../model/auth-validation";
import { authDelay } from "./auth-delay";
import type { PublicIntent } from "@/features/public-web";

type AccountRecord = { account: AuthAccount; passwordDigest: string };
// 기능 : 목 비교에 필요한 digest만 계산하고 원문을 URL·로그·영속 저장소로 보내지 않는다.
async function digestSample(password: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buffer), value => value.toString(16).padStart(2, "0")).join("");
}
// 기능 : 가상 계정의 저장 상태와 인증 뒤 선택 인계를 기존 실행 범위에 연결한다.
export function createAuthStore(preview: PreviewRuntime): AuthStore {
  let sequence = 0; let challengeSequence = 0; let failureArmed = false; let generation = 0; let resetSequence = 0;
  let previous = preview.getSnapshot();
  let state: AuthSnapshot = { version: 0, scenario: "normal", handoff: null, emailChallenge: null, twoFactor: null, resetChallenge: null, loginVariant: "default", notice: null };
  const listeners = new Set<() => void>(); const records = new Map<string, AccountRecord>();
  // 기능 : 기존 G01 검증 계정의 식별자를 가입 계정과 분리해 복원한다.
  function seedAccounts() {
    records.clear(); sequence = 0;
    for (const session of PREVIEW_SESSIONS) {
      const email = session.id === "preview-a" ? "alex@example.test" : "blair@example.test";
      records.set(email, { account: { id: session.id, email, name: session.name, method: "password", verified: true, setupComplete: true, session }, passwordDigest: "09ab21ce5494c5b30327bd47beab05d2528a798f92631602ccc6628bac9e3929" });
    }
  }
  seedAccounts();
  // 기능 : 불변 스냅샷으로 변경을 전달하고 공개 상태에 비밀번호를 포함하지 않는다.
  function publish(patch: Partial<AuthSnapshot>) { state = Object.freeze({ ...state, ...patch, version: state.version + 1 }); listeners.forEach(listener => listener()); }
  // 기능 : 제출 이후 다른 세션·workspace·Reset으로 바뀌었는지 저장 직전에 검사한다.
  function assertCurrent(revision: number, signal: AbortSignal) { signal.throwIfAborted(); if (preview.getSnapshot().revision !== revision) throw new DOMException("Authentication scope changed", "AbortError"); }
  // 기능 : 실행 문맥 변경에서 진행 인계·도전을 제거하고 Reset만 목 계정 seed까지 복원한다.
  function onPreviewChange() {
    const next = preview.getSnapshot();
    generation += 1;
    const pendingId = state.emailChallenge?.actorId;
    for (const [email, record] of records) if (record.account.id === pendingId && !record.account.verified) records.delete(email);
    if (next.resetGeneration !== previous.resetGeneration) seedAccounts();
    previous = next; failureArmed = false; publish({ handoff: null, emailChallenge: null, twoFactor: null, resetChallenge: null, loginVariant: "default", notice: null, scenario: "normal" });
  }
  // 기능 : React provider의 생명주기 안에서만 공통 실행 문맥을 구독한다.
  function connect() { previous = preview.getSnapshot(); return preview.subscribe(onPreviewChange); }
  // 기능 : 계정은 유지하고 다음 인증 동작의 목 지연·실패 분기를 선택한다.
  function setScenario(scenario: AuthScenario) { generation += 1; failureArmed = scenario === "fail-once"; publish({ scenario }); }
  // 기능 : 선택한 공개 snapshot만 새 계정의 실행 범위로 옮긴다.
  function openAccount(account: AuthAccount, intent?: PublicIntent) {
    preview.openSession(account.session); const scope = preview.getSnapshot();
    publish({ emailChallenge: null, twoFactor: null, resetChallenge: null, loginVariant: "default", notice: null, handoff: intent && scope.workspaceId ? { actorId: account.id, workspaceId: scope.workspaceId, revision: scope.revision, intent: structuredClone(intent) } : null });
  }
  // 기능 : 취소 가능한 로컬 지연과 한 번 실패를 적용한다.
  async function prepare(revision: number, signal: AbortSignal, submittedGeneration: number) {
    assertCurrent(revision, signal); await authDelay(state.scenario === "slow" ? 1500 : 350, signal); assertCurrent(revision, signal);
    if (generation !== submittedGeneration) throw new DOMException("Authentication scenario changed", "AbortError");
    if (failureArmed) { failureArmed = false; throw new Error("This local attempt failed. Your input is still here. Please try again."); }
  }
  // 기능 : 유효한 가상 가입을 한 번 저장하고 메일 도전 또는 새 세션으로 연결한다.
  async function register(input: SignupInput, revision: number, signal: AbortSignal): Promise<SignupResult> {
    const submittedGeneration = generation; const intent = input.intent ? structuredClone(input.intent) : undefined;
    const email = input.email.trim().toLowerCase(); const name = input.name.trim();
    const errors = validateSignup(email, name, input.method === "password" ? input.password : "LocalSocial123!", true);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const verification = state.scenario === "verify-email";
    const passwordDigest = input.method === "password" ? await digestSample(input.password) : "";
    await prepare(revision, signal, submittedGeneration);
    if (records.has(email)) throw new Error("This email already has a local preview account. Log in or use another sample email.");
    const id: ActorId = `preview-user-${++sequence}`; const workspaceId = `studio-user-${sequence}`;
    const account: AuthAccount = { id, name, email, method: input.method, verified: !verification, setupComplete: false, session: { id, name, role: "owner", workspaces: [{ id: workspaceId, name: "New business" }] } };
    records.set(email, { account, passwordDigest });
    if (verification) publish({ emailChallenge: { id: `email-preview-${++challengeSequence}`, actorId: id, revision, status: "valid", intent } });
    else openAccount(account, intent);
    return { kind: verification ? "verify-email" : "session", committedRevision: preview.getSnapshot().revision, account: structuredClone(account) };
  }
  // 기능 : 이메일을 보내지 않고 현재 메모리 도전만 확인해 같은 가상 계정 세션을 연다.
  async function verifyEmail(challengeId: string, revision: number, signal: AbortSignal) {
    const submittedGeneration = generation; const challenge = state.emailChallenge;
    if (!challenge || challenge.id !== challengeId || challenge.status !== "valid" || challenge.revision !== revision) throw new Error("This local verification link is unavailable or expired.");
    await prepare(revision, signal, submittedGeneration);
    if (state.emailChallenge !== challenge) throw new DOMException("Verification cancelled", "AbortError");
    const record = [...records.values()].find(entry => entry.account.id === challenge.actorId);
    if (!record) throw new Error("Local preview account not found.");
    record.account = { ...record.account, verified: true }; openAccount(record.account, challenge.intent); return structuredClone(record.account);
  }
  // 기능 : 미수록 메일 만료를 명시적 목 상태로 전환한다.
  function expireEmailChallenge() { if (state.emailChallenge) publish({ emailChallenge: { ...state.emailChallenge, status: "expired" } }); }
  // 기능 : 확인 전 이탈에서 메일 도전과 아직 활성화되지 않은 가입 초안을 폐기한다.
  function cancelEmailChallenge() {
    const id = state.emailChallenge?.actorId;
    for (const [email, record] of records) if (record.account.id === id && !record.account.verified) records.delete(email);
    publish({ emailChallenge: null });
  }
  // 기능 : 샘플 credential 또는 명시적인 소셜 fixture를 확인하고 세션/2FA 중 하나로 연결한다.
  async function login(input: LoginInput, revision: number, signal: AbortSignal): Promise<LoginResult> {
    const submittedGeneration = generation; const factorRequired = state.scenario === "two-factor";
    const intent = input.intent ? structuredClone(input.intent) : undefined; const returnTo = previewReturnPath(input.returnTo);
    const email = input.method === "google" ? (records.has("google-preview@example.test") ? "google-preview@example.test" : "alex@example.test") : input.method === "apple" ? "blair@example.test" : input.email.trim().toLowerCase();
    if (!input.captcha) throw new Error("Complete the local preview check.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 256) throw new Error("Enter a valid email address.");
    if (input.method === "password" && (!input.password || input.password.length > 128)) throw new Error("Enter a sample password (up to 128 characters).");
    const passwordDigest = input.method === "password" ? await digestSample(input.password) : "";
    await prepare(revision, signal, submittedGeneration);
    const record = records.get(email);
    if (!record || (input.method === "password" && record.passwordDigest !== passwordDigest)) throw new Error("The sample email or password is incorrect. Please try again.");
    if (!record.account.verified) throw new Error("Complete the local email verification before logging in.");
    if (factorRequired) publish({ twoFactor: { id: `factor-preview-${++challengeSequence}`, actorId: record.account.id, revision, status: "valid", attempts: 0, returnTo, intent }, notice: null });
    else openAccount(record.account, intent);
    return { kind: factorRequired ? "two-factor" : "session", account: structuredClone(record.account), committedRevision: preview.getSnapshot().revision, returnTo };
  }
  // 기능 : 미수록 2FA를 샘플 코드와 일회용 메모리 도전으로 확인한다.
  async function verifyFactor(code: string, revision: number, signal: AbortSignal): Promise<LoginResult> {
    const submittedGeneration = generation; const challenge = state.twoFactor;
    if (!challenge || challenge.revision !== revision || challenge.status !== "valid") throw new Error("This sample code has expired or is unavailable.");
    await prepare(revision, signal, submittedGeneration);
    if (state.twoFactor !== challenge) throw new DOMException("Two-factor challenge changed", "AbortError");
    if (code !== "123456") {
      const attempts = challenge.attempts + 1; publish({ twoFactor: { ...challenge, attempts, status: attempts >= 3 ? "expired" : "valid" } });
      throw new Error(attempts >= 3 ? "This sample code has expired. Request another local code." : "Incorrect sample code. Use 123456 for this preview.");
    }
    const account = getAccount(challenge.actorId); if (!account) throw new Error("Local account unavailable.");
    openAccount(account, challenge.intent);
    return { kind: "session", account, committedRevision: preview.getSnapshot().revision, returnTo: challenge.returnTo };
  }
  // 기능 : 현재 2FA 도전을 만료시키고 늦은 확인이 세션을 열지 못하게 한다.
  function expireFactor() { if (state.twoFactor) publish({ twoFactor: { ...state.twoFactor, status: "expired" } }); }
  // 기능 : 실제 메시지 없이 현재 계정의 샘플 도전을 새 ID로 교체한다.
  function renewFactor() { if (state.twoFactor) publish({ twoFactor: { ...state.twoFactor, id: `factor-preview-${++challengeSequence}`, status: "valid", attempts: 0 } }); }
  // 기능 : 2FA 취소와 페이지 이탈에서 도전을 폐기한다.
  function cancelFactor() { if (state.twoFactor) publish({ twoFactor: null }); }
  // 기능 : 취소·실패 가능한 로컬 로그아웃 후 완료 차수를 반환해 최신 성공만 화면에 반영하게 한다.
  async function logout(revision: number, signal: AbortSignal) {
    await prepare(revision, signal, generation); preview.setSession(null); publish({ notice: "signed-out" });
    return preview.getSnapshot().revision;
  }
  // 기능 : 실제 장치 세션과 무관한 현재 탭의 만료 복구를 재현한다.
  function expireSession() { preview.setSession(null); publish({ notice: "expired" }); }
  // 기능 : 성공/만료 안내를 닫아 이전 이력에서 반복 노출하지 않는다.
  function clearNotice() { if (state.notice) publish({ notice: null }); }
  // 기능 : 존재 여부를 일반 안내와 분리한 메모리 재설정 도전을 준비하며 최신 요청만 남긴다.
  async function requestReset(emailInput: string, captcha: boolean, revision: number, signal: AbortSignal): Promise<ResetChallenge> {
    const email = emailInput.trim().toLowerCase(); const submittedGeneration = generation;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 256) throw new Error("Enter a valid email address.");
    if (!captcha) throw new Error("Complete the local preview check.");
    // 1. 유효한 새 요청 의도를 받은 즉시 이전 링크와 저장을 폐기하며 실패·취소해도 옛 링크는 되살리지 않는다.
    assertCurrent(revision, signal); const attempt = ++resetSequence;
    if (state.resetChallenge) publish({ resetChallenge: null });
    // 2. 가장 최근 요청만 안내와 새 링크를 만들며 비밀번호는 별도 저장 성공 전까지 유지한다.
    await prepare(revision, signal, submittedGeneration);
    if (attempt !== resetSequence) throw new DOMException("A newer reset request replaced this one", "AbortError");
    const account = records.get(email)?.account;
    const challenge: ResetChallenge = { id: `reset-preview-${++challengeSequence}`, email, actorId: account?.verified ? account.id : null, revision, status: "valid" };
    publish({ resetChallenge: challenge, notice: null }); return challenge;
  }
  // 기능 : 유효한 일회성 로컬 도전만 같은 계정의 digest를 바꾸고 자동 로그인하지 않는다.
  async function resetPassword(challengeId: string, password: string, revision: number, signal: AbortSignal) {
    const challenge = state.resetChallenge; const submittedGeneration = generation;
    if (!challenge || challenge.id !== challengeId || challenge.revision !== revision || challenge.status !== "valid" || !challenge.actorId) throw new Error("This local reset link is unavailable, expired or already used.");
    if (password.length > 128 || passwordStrength(password) !== "Strong") throw new Error("Password is too weak");
    const passwordDigest = await digestSample(password); await prepare(revision, signal, submittedGeneration);
    if (state.resetChallenge !== challenge) throw new DOMException("Reset link changed", "AbortError");
    const record = records.get(challenge.email);
    if (!record || record.account.id !== challenge.actorId) throw new Error("This local reset link is unavailable.");
    record.passwordDigest = passwordDigest; generation += 1;
    if (preview.getSnapshot().session) preview.setSession(null);
    publish({ resetChallenge: { ...challenge, status: "used" }, notice: "password-reset", loginVariant: "reset" }); return preview.getSnapshot().revision;
  }
  // 기능 : 원본에 없는 링크 만료를 명시적인 목 상태로 바꾸고 지연 저장을 차단한다.
  function expireReset() { if (state.resetChallenge?.status === "valid") publish({ resetChallenge: { ...state.resetChallenge, status: "expired" } }); }
  // 기능 : 복구 취소·영역 이탈에서 요청과 도전을 함께 폐기한다.
  function cancelReset() { resetSequence += 1; if (state.resetChallenge) publish({ resetChallenge: null }); }
  // 기능 : 같은 계정의 사업 설정 완료만 갱신하며 인증 차수나 공개 인계를 초기화하지 않는다.
  function completeSetup(id: ActorId) { const record = [...records.values()].find(entry => entry.account.id === id); if (record) { record.account = { ...record.account, setupComplete: true }; publish({}); } }
  // 기능 : 공개 소비자가 credential 저장소를 직접 수정하지 못하도록 계정 복사본만 제공한다.
  function getAccount(id: ActorId) { const account = [...records.values()].find(record => record.account.id === id)?.account; return account ? structuredClone(account) : undefined; }
  // 기능 : 초대 대상과 현재 계정을 대조한 뒤 팀 수락·계정·작업공간 세션을 한 동기 구간에서 반영한다.
  const acceptInvitation: AuthStore["acceptInvitation"] = async function acceptInvitation(input, revision, signal, claim) {
    const submittedGeneration = generation; const target = structuredClone(input.target); const email = target.email.toLowerCase();
    const current = preview.getSnapshot().session; const record = records.get(email);
    if (current && (!record || record.account.id !== current.id)) throw new Error("This invitation belongs to another email. Sign out before continuing.");
    if (!current && record) throw new Error("This email already has a local account. Log in to accept this invitation.");
    if (record?.account.session.workspaces.some(workspace => workspace.id === target.workspaceId)) throw new Error("This account already belongs to this workspace.");
    const name = record?.account.name ?? input.name.trim();
    if (!record) { const errors = validateSignup(email, name, input.password, true); if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]); }
    const passwordDigest = record?.passwordDigest ?? await digestSample(input.password);
    await prepare(revision, signal, submittedGeneration);
    if (!record && records.has(email)) throw new Error("This email already has a local account. Log in to continue.");
    // 1. 실패 가능한 초대 검사를 먼저 마친다. 이후에는 await 없이 두 저장소와 세션을 연결한다.
    const joined = claim(name);
    if (joined.role === "Owner") throw new Error("An owner invitation is unavailable.");
    const id: ActorId = record?.account.id ?? `preview-user-${++sequence}`;
    const oldSession = record?.account.session;
    const memberships = { ...Object.fromEntries((oldSession?.workspaces ?? []).map(workspace => [workspace.id, { role: oldSession!.role }])), ...oldSession?.memberships, [joined.workspaceId]: { role: "member" as const, invitation: { teamRowId: joined.id, role: joined.role, projectIds: [...joined.projectIds], allProjects: joined.allProjects } } };
    const account: AuthAccount = { id, email, name, method: record?.account.method ?? "password", verified: true, setupComplete: record?.account.setupComplete ?? true, session: { id, name, role: "member", memberships, workspaces: [{ id: joined.workspaceId, name: "Joe Studio" }, ...(oldSession?.workspaces ?? [])] } };
    records.set(email, { account, passwordDigest }); openAccount(account); return structuredClone(account);
  };
  // 기능 : React 구독에는 안정된 스냅샷 참조를 제공한다.
  function getSnapshot() { return state; }
  // 기능 : 계정 상태 구독을 등록하고 종료 시 제거한다.
  function subscribe(listener: () => void) { listeners.add(listener); return function unsubscribe() { listeners.delete(listener); }; }
  return { getSnapshot, subscribe, connect, setScenario, acceptInvitation, register, verifyEmail, expireEmailChallenge, cancelEmailChallenge, getAccount, completeSetup, login, verifyFactor, expireFactor, renewFactor, cancelFactor, logout, expireSession, clearNotice, requestReset, resetPassword, expireReset, cancelReset };
}
