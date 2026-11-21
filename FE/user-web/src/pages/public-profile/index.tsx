import { Link, useParams } from "react-router-dom";
import { useCompanySetup } from "@/features/company-setup/data/company-context";
import { useLogoUrl } from "@/features/company-settings/hooks/use-company-logo";
import "@/styles/company-settings.css";
// 기능 : 로그인과 별도로 저장된 공개 여부를 확인하며 포털 접근 정책을 변경하지 않는다.
export function PublicProfilePage() {
  const { slug = "" } = useParams(); const { store } = useCompanySetup(); const company = store.publicCompany(slug); const url = useLogoUrl(company?.logo ?? null);
  return <main className="local-company-profile"><p className="company-profile-notice">Local public profile preview · unrecorded source layout</p>{company?.enabled ? <>{url && <img src={url} alt="Company logo" />}<h1>{company.name}</h1><p>{company.country}</p></> : <><h1>{company ? "This public profile is unavailable" : "Public profile not found"}</h1><p>{company ? "The company has disabled this local public profile." : "This profile is not available in the current memory session."}</p></>}<p>Public profile visibility is separate from shared preview access.</p><nav><Link to="/">Public site</Link><Link to="/app/settings/company">Company settings</Link><Link to="/share/sample">Shared preview</Link></nav></main>;
}
