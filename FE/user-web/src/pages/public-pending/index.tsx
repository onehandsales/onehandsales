import { Link, useLocation, useNavigate } from "react-router-dom";
import { publicDestinations, usePublicExperience } from "@/features/public-web";
import { introductionPendingDestinations } from "@/features/public-introduction";
import { commercialPendingDestinations, subscriptionHandoffPath, PlanHandoffSummary } from "@/features/public-commercial";

// 기능 : 아직 만들지 않은 목적지의 담당 Goal과 입력 인계를 명시하고 취소·복귀를 제공한다.
export function PublicPendingPage() {
  const { pathname, state } = useLocation();
  const { intents, clear } = usePublicExperience();
  const intentId: string | undefined = typeof state?.publicIntentId === "string" ? state.publicIntentId : undefined;
  const intent = intentId === undefined ? undefined : intents[intentId];
  const navigate = useNavigate();
  const signup = pathname === "/signup";
  const subscription = pathname === subscriptionHandoffPath;
  const review = pathname.startsWith("/outbound/reviews/");
  const reviewDestination = commercialPendingDestinations.find(item => item.path === pathname);
  const destination = [...publicDestinations, ...introductionPendingDestinations, ...commercialPendingDestinations].find(item => item.path.split(/[?#]/)[0] === pathname);
  // 기능 : 명시적인 취소는 출발 페이지의 초안만 폐기하고 해당 소개로 돌아간다.
  function handleCancel() { const returnTo = intent?.returnTo ?? (review ? "/reviews" : subscription ? "/pricing" : "/"); clear(intentId); void navigate(returnTo, { replace: true }); }
  return <section className="public-pending public-container">
    <p className="public-pending-label">Local UI preview · Not implemented</p>
    <h1>{signup ? "Sign up" : destination?.label ?? "Public destination"}</h1>
    <p>{signup ? "G10" : destination?.goal}{review ? "의 외부 목적지 안내입니다. 실제 외부 페이지는 열지 않습니다." : "에서 구현할 화면입니다. 현재는 공개 화면의 이동과 입력 인계만 확인할 수 있습니다."}</p>
    {review && <p className="commercial-source-url">확인한 원본 목적지: {reviewDestination?.sourceHref}</p>}
    {(signup || subscription || review) && <><p>실제 가입·구독 변경·이메일 전송·외부 요청은 실행하지 않습니다.</p>
      {intent ? <dl><dt>CTA source</dt><dd>{intent.source}</dd><dt>Email draft</dt><dd>{intent.email || "이메일 없이 진입"}</dd></dl>
        : <p>직접 URL·새 탭·새로고침에서는 인계가 초기화됩니다.</p>}
      {intent?.selection && <PlanHandoffSummary selection={intent.selection} />}
      <button type="button" className="public-button" onClick={handleCancel}>{review ? "Back to reviews" : "Cancel and clear draft"}</button></>}
    <Link to="/" className="public-text-link">Back to landing</Link>
  </section>;
}
