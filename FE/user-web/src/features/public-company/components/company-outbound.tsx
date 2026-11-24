import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { findCompanyDestination } from "../data/company-destinations";
import type { CompanyDestinationId } from "../data/company-destinations";
import { publicHistoryIndex, usePublicExperience, usePublicOrigin } from "@/features/public-web";
import { readCompanyOrigin } from "../model/company-history";
// 기능 : 외부 CTA에 전체 출발 URL·이력·메모리 수명을 연결해 정확한 로컬 복귀를 지원한다.
export function CompanyOutboundLink({ id, children, className }: { id: CompanyDestinationId; children: ReactNode; className?: string }) {
  const origin = usePublicOrigin();
  return <Link className={className} to={`/outbound/${id}`} state={{ companyOrigin: origin?.path, companyOriginKey: origin?.key, companyOriginEntry: origin }}>{children}</Link>;
}
// 기능 : 확인된 외부 목적지를 안내하고 실제 전송 없이 이전 로컬 화면으로 돌아간다.
export function CompanyOutbound({ id }: { id: string }) {
  const destination = findCompanyDestination(id); const location = useLocation(); const navigate = useNavigate();
  const { scope } = usePublicExperience();
  // 기능 : 유효한 출발 이력까지 중간 이동을 건너뛰고 새로고침·교체·직접 진입은 고정 경로로 복귀한다.
  function returnToSource() {
    const origin = readCompanyOrigin(location.state?.companyOriginEntry, scope);
    const index = publicHistoryIndex();
    if (origin && index !== undefined && index > origin.index) void navigate(origin.index - index);
    else void navigate(destination?.origin ?? "/", { replace: true });
  }
  return <section className="company-outbound public-container"><p className="company-reference">Local destination preview</p><h1>{destination?.title ?? "Destination not found"}</h1>
    {destination ? <><p>{destination.description}</p><dl><dt>Reference destination</dt><dd>{destination.source}</dd><dt>Reference scope</dt><dd>Historical Bonsai reference · external service not opened</dd></dl></> : <p>This destination is not part of the confirmed reference.</p>}
    <button type="button" className="public-button" onClick={returnToSource}>Back to source</button><Link to="/">Back to landing</Link>
  </section>;
}
