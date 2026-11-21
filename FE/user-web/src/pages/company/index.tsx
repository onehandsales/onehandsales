import { useLocation } from "react-router-dom";
import { CommercialAudiences } from "@/features/public-commercial";
import { AffiliateContent, CareersContent, LegalContent, CompanyOutbound } from "@/features/public-company";
import "@/styles/public-company.css";
// 기능 : 제휴·채용·정책·외부 목적지의 공개 화면만 조립한다.
export function CompanyPage() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/outbound/")) return <CompanyOutbound id={pathname.slice("/outbound/".length)} />;
  return <><CommercialAudiences />{pathname === "/affiliates" ? <AffiliateContent /> : pathname === "/careers" ? <CareersContent /> : <LegalContent key={pathname} kind={pathname === "/legal/privacy" ? "privacy" : "terms"} />}</>;
}
