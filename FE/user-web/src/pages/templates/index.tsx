import { useLocation } from "react-router-dom";
import { TemplateCatalog, TemplateDetail, InvoiceTemplate, templates, quotePath } from "@/features/public-template";
import { CommercialAudiences } from "@/features/public-commercial";
import { publicDestinations } from "@/features/public-web";
import "@/styles/public-template.css";

// 기능 : 공개 카탈로그·청구서 안내·확인된 상세와 미수록 상세의 경계를 경로별로 조립한다.
export function TemplatesPage() {
  const { pathname } = useLocation();
  const item = templates.find(item => item.path === pathname);
  const destination = publicDestinations.find(item => item.path === pathname);
  const missingDetail = !item && !pathname.startsWith("/templates") && pathname !== "/invoice-template";
  const fallback = { id: pathname.slice(1).replaceAll("/", "--"), title: destination?.label ?? "Template", path: pathname, type: "Unconfirmed", industry: "", image: "", sourceImage: "", observedLabel: "" };
  return <>{pathname !== quotePath && <CommercialAudiences />}{pathname === "/invoice-template" ? <InvoiceTemplate /> : item || missingDetail ? <TemplateDetail key={pathname} item={item ?? fallback} /> : pathname === "/templates/scopes-of-work" ? <section className="public-container template-unavailable"><h1>Scope of Work Templates</h1><p>이 분류의 목록 화면과 항목 대응은 아직 확인되지 않았습니다.</p><a className="public-text-link" href="/templates">Browse all templates</a></section> : <TemplateCatalog />}</>;
}
