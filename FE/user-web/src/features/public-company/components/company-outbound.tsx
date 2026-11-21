import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { findCompanyDestination } from "../data/company-destinations";
import type { CompanyDestinationId } from "../data/company-destinations";
// 기능 : 외부 CTA의 출발 이력을 로컬 경로에 붙여 브라우저 뒤로 복귀를 지원한다.
export function CompanyOutboundLink({ id, children, className }: { id: CompanyDestinationId; children: ReactNode; className?: string }) {
  const location = useLocation();
  return <Link className={className} to={`/outbound/${id}`} state={{ companyOrigin: location.pathname + location.search, companyOriginKey: location.key }}>{children}</Link>;
}
// 기능 : 확인된 외부 목적지를 안내하고 실제 전송 없이 이전 로컬 화면으로 돌아간다.
export function CompanyOutbound({ id }: { id: string }) {
  const destination = findCompanyDestination(id); const location = useLocation(); const navigate = useNavigate();
  const origin: unknown = location.state?.companyOrigin; const originKey: unknown = location.state?.companyOriginKey;
  // 기능 : 이 앱에서 만든 출발 이력이 있을 때만 뒤로 이동하고 직접 진입은 고정 출발지로 복귀한다.
  function returnToSource() {
    if (typeof origin === "string" && origin.startsWith("/") && !origin.startsWith("//") && typeof originKey === "string" && window.history.state?.idx > 0) void navigate(-1);
    else void navigate(destination?.origin ?? "/", { replace: true });
  }
  return <section className="company-outbound public-container"><p className="company-reference">Local destination preview</p><h1>{destination?.title ?? "Destination not found"}</h1>
    {destination ? <><p>{destination.description}</p><dl><dt>Reference destination</dt><dd>{destination.source}</dd><dt>Reference scope</dt><dd>Historical Bonsai reference · external service not opened</dd></dl></> : <p>This destination is not part of the confirmed reference.</p>}
    <button type="button" className="public-button" onClick={returnToSource}>Back to source</button><Link to="/">Back to landing</Link>
  </section>;
}
