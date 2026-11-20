import { Link, useLocation, useNavigate } from "react-router-dom";
import { publicDestinations, usePublicExperience } from "@/features/public-web";

// 기능 : 아직 만들지 않은 목적지의 담당 Goal과 입력 인계를 명시하고 취소·복귀를 제공한다.
export function PublicPendingPage() {
  const { pathname } = useLocation();
  const { intent, clear } = usePublicExperience();
  const navigate = useNavigate();
  const signup = pathname === "/signup";
  const destination = publicDestinations.find(item => item.path.split(/[?#]/)[0] === pathname);
  // 기능 : 사용자가 인계를 취소하면 메모리 이메일을 지우고 랜딩으로 돌아간다.
  function handleCancel() { clear(); void navigate("/", { replace: true }); }
  return <section className="public-pending public-container">
    <p className="public-pending-label">Local UI preview · Not implemented</p>
    <h1>{signup ? "Sign up" : destination?.label ?? "Public destination"}</h1>
    <p>{signup ? "G10" : destination?.goal}에서 구현할 화면입니다. 현재는 랜딩의 이동과 입력 인계만 확인할 수 있습니다.</p>
    {signup && <><p>실제 가입이나 이메일 전송은 실행하지 않습니다.</p>
      {intent ? <dl><dt>CTA source</dt><dd>{intent.source}</dd><dt>Email draft</dt><dd>{intent.email || "이메일 없이 진입"}</dd></dl>
        : <p>직접 URL·새 탭·새로고침에서는 인계가 초기화됩니다.</p>}
      <button type="button" className="public-button" onClick={handleCancel}>Cancel and clear draft</button></>}
    <Link to="/" className="public-text-link">Back to landing</Link>
  </section>;
}
