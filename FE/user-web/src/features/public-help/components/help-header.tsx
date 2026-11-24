import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";
import { Search, Globe } from "lucide-react";
import { HelpOutbound } from "./help-outbound";
// 기능 : 도움말 전용 검색·English 선택·확인된 상단 목적지를 로컬 경로로 연결한다.
export function HelpHeader() {
  const location = useLocation(); const navigate = useNavigate(); const navigationType = useNavigationType(); const [params] = useSearchParams();
  const editRevision = useRef(0);
  const query = (params.get("q") ?? "").slice(0, 256).trim();
  const [draft, setDraft] = useState(query); const composing = useRef(false); const [featureOpen, setFeatureOpen] = useState(false);
  const home = location.pathname === "/help" && !query && (!params.has("lang") || params.get("lang") === "en"); const locale = params.get("lang") ?? "en";
  // 기능 : 이력 복귀는 URL을 복원하되 늦게 반영된 제출이 이후 입력을 덮지 못하게 한다.
  useEffect(function restoreQuery() {
    const submittedRevision: unknown = location.state?.helpSearchRevision;
    if (navigationType !== "POP" && typeof submittedRevision === "number" && editRevision.current > submittedRevision) return;
    setDraft(query);
  }, [query, location.key, location.state, navigationType]);
  // 기능 : 뒤로 가기 등 다른 도움말 이력으로 이동하면 이전 목적지 안내를 닫는다.
  useEffect(function closeOnNavigation() { setFeatureOpen(false); }, [location.key]);
  // 기능 : 조합 중 제출을 막고 명시적으로 제출한 검색만 URL에 기록한다.
  function submit(event: FormEvent) {
    event.preventDefault(); if (composing.current) return;
    const query = draft.trim(); const next = new URLSearchParams(); if (query) next.set("q", query); if (locale !== "en") next.set("lang", locale);
    const path = location.pathname.startsWith("/help/collections/") ? location.pathname : "/help";
    const target = path + (next.size ? `?${next}` : ""); if (target !== location.pathname + location.search) void navigate(target, { state: { helpSearchRevision: editRevision.current } });
  }
  // 기능 : 확인된 English 자료로 돌아가며 검색 조건과 문서 위치를 보존한다.
  function chooseEnglish() { const next = new URLSearchParams(params); next.delete("lang"); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { state: location.state, preventScrollReset: true }); }
  return <header className={`help-header ${home ? "is-home" : ""}`}><div className="help-container"><div className="help-topbar"><Link to="/help" aria-label="Bonsai Help Center"><img src="/bonsai-help/asset-00.png" alt="" /></Link><nav aria-label="Help navigation"><Link to="/">Go to Bonsai</Link><Link to="/app">My Account</Link><button type="button" onClick={() => setFeatureOpen(true)}>Feature Requests</button><label><Globe size={16} aria-hidden="true" /><span className="sr-only">Help language</span><select aria-label="Help language" value={locale} onChange={chooseEnglish}>{locale !== "en" && <option value={locale} disabled>Unavailable: {locale}</option>}<option value="en">English</option></select></label></nav></div>
    {home && <h1>FAQ: Answers and insights from the Bonsai Team</h1>}<form className="help-search" role="search" onSubmit={submit}><button type="submit" aria-label="Search help"><Search aria-hidden="true" size={24} /></button><input type="search" aria-label="Search for articles" placeholder="Search for articles..." maxLength={256} value={draft} onChange={event => { editRevision.current += 1; setDraft(event.currentTarget.value); }} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }} /></form>
  </div>{featureOpen && <HelpOutbound kind="feature" onClose={() => setFeatureOpen(false)} />}</header>;
}
