import { invitationAccess } from "@/features/preview";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { useMockAuth } from "../data/auth-context";
import { AuthTools } from "./auth-controls";

// 기능 : 현재 가상 계정 메뉴와 취소·실패 가능한 로그아웃을 한 실행 범위에 연결한다.
export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useMockAuth(); const location = useLocation(); const invited = !!invitationAccess(preview);
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const container = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const request = useRef<AbortController | null>(null);
  // 기능 : 닫기·이동에서 취소한 로그아웃이 나중에 세션을 종료하지 못하게 한다.
  function close(restore = false) { request.current?.abort(); request.current = null; setPending(false); setOpen(false); setError(""); if (restore) trigger.current?.focus(); }
  // 기능 : 경로·사용자 변경과 이탈에서 메뉴 초안을 폐기한다.
  useEffect(function resetMenu() { request.current?.abort(); request.current = null; setPending(false); setOpen(false); setError(""); return function cancelOnLeave() { request.current?.abort(); }; }, [location.key, preview.revision]);
  // 기능 : 시나리오 변경을 이전 로그아웃 요청의 취소로 처리한다.
  useEffect(function cancelScenario() { request.current?.abort(); request.current = null; setPending(false); }, [state.scenario]);
  // 기능 : 외부 클릭과 Escape로 팝오버를 닫고 Escape에서는 시작 버튼으로 초점을 돌린다.
  useEffect(function dismissMenu() {
    if (!open) return;
    // 기능 : 메뉴 밖 포인터 입력을 감지한다.
    function pointer(event: PointerEvent) { if (!container.current?.contains(event.target as Node)) close(); }
    // 기능 : 키보드 닫기를 처리한다.
    function key(event: KeyboardEvent) { if (event.key === "Escape") { event.preventDefault(); close(true); } }
    document.addEventListener("pointerdown", pointer); document.addEventListener("keydown", key);
    return function removeListeners() { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", key); };
  }, [open]);
  // 기능 : 성공할 때만 보호 경계가 로그인으로 복귀하도록 가상 세션을 종료한다.
  async function logout() {
    if (request.current) return; const controller = new AbortController(); request.current = controller; setPending(true); setError("");
    try { await store.logout(preview.revision, controller.signal); }
    catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to log out locally."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  if (!preview.session) return null;
  return <div className="auth-account" ref={container}><button type="button" ref={trigger} aria-label={preview.session.name} title={preview.session.name} aria-expanded={open} aria-controls="account-popover" onClick={() => open ? close() : setOpen(true)}>{compact ? <span className="app-account-initials" aria-hidden="true">{preview.session.name.slice(0, 2).toUpperCase()}</span> : <>{preview.session.name} <span aria-hidden="true">⌄</span></>}</button>
    {open && <div id="account-popover" className="auth-account-popover">{invited && <p className="invited-account-title">Joe Studio</p>}<nav aria-label="Account menu"><Link to="/help">Help Center</Link>{!invited && <><Link to="/app/pending/perks">Perks</Link><Link to="/app/settings/team">Team</Link><Link to="/app/pending/subscription">Subscription</Link></>}<Link to={invited ? "/app/settings/profile" : "/app/settings/company"}>Settings</Link><button type="button" disabled={pending} onClick={() => { void logout(); }}>{pending ? "Signing out…" : "Logout"}</button></nav>
      {pending && <button type="button" onClick={() => { request.current?.abort(); request.current = null; setPending(false); }}>Cancel logout</button>}{error && <p role="alert" className="auth-error">{error}</p>}
      <AuthTools /><details><summary>Local session expiry</summary><button type="button" onClick={store.expireSession}>Expire local session</button></details></div>}
  </div>;
}
