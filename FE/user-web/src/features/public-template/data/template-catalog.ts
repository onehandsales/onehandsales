import catalog from "./catalog-content.json";
import type { PublicTemplateSelection } from "@/features/public-web";

export const templateTypes = ["All", "Contracts", "Proposals", "Agreements", "Invoices", "Quotes", "Briefs", "Forms"] as const;
export type TemplateType = typeof templateTypes[number];
export type PublicTemplate = typeof catalog[number];
// 의미 : /a/ 링크는 소개 PNG·보관 링크에서만 확인한 공개 메타데이터이며 계정 복제 경로가 아니다.
const observedAliases: PublicTemplate[] = [
  { id: "a--independent-contractor-invoice", path: "/a/independent-contractor-invoice", title: "Contractor Invoice Template", type: "Invoices", industry: "General", image: "/bonsai-template/652d2a0529f6f7d9d27d1d5e.webp", sourceImage: "", observedLabel: "Task management" },
  { id: "a--freelance-invoice-template", path: "/a/freelance-invoice-template", title: "Freelance Invoice Template", type: "Invoices", industry: "Freelancers", image: "/bonsai-template/652d2a06161daabd6b7d7038.webp", sourceImage: "", observedLabel: "Task management" },
];
export const templates: readonly PublicTemplate[] = [...catalog, ...observedAliases];
export const templateIndustries = [...new Set([...catalog.map(item => item.industry), "Acting", "Caregiving", "Delivery and Driving", "Health"])].sort();
export const templatePageSize = 24;
export const quotePath = "/quote-template/ecommerce-website";
export const templateReference = "Bonsai catalog archive 2024-01-18 · public selection";
export const templateRoutes = [{ path: "/templates", title: "Templates" }, { path: "/invoice-template", title: "Invoice Template" }, ...templates.map(item => ({ path: item.path, title: item.title }))];

// 기능 : 관찰 카드 문구와 별개인 공개 문서 유형으로 필터 값을 정규화한다.
export function readTemplateType(value: string | null): TemplateType { return templateTypes.find(type => type.toLowerCase() === value?.toLowerCase()) ?? "All"; }
// 기능 : 유형·업종·검색을 독립 조건으로 결합하고 페이지 경계를 유효한 범위로 맞춘다.
export function selectTemplates(type: TemplateType, industry: string, query: string, rawPage: number, empty = false) {
  const available = empty ? [] : catalog;
  const filtered = available.filter(item => (type === "All" || item.type === type || type === "Contracts" && item.path.startsWith("/contract-template/")) && (!industry || item.industry === industry));
  const search = query.trim().toLocaleLowerCase();
  const matches = filtered.filter(item => item.title.toLocaleLowerCase().includes(search));
  const pages = Math.max(1, Math.ceil(matches.length / templatePageSize));
  const page = Math.min(pages, Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1);
  return { items: matches.slice((page - 1) * templatePageSize, page * templatePageSize), page, pages, total: matches.length, empty: available.length === 0, noMatch: available.length > 0 && matches.length === 0 };
}
// 기능 : 동일 공개 ID를 사용해 가입 인계를 만들며 계정 문서 ID를 추정하지 않는다.
export function templateSelection(item: Pick<PublicTemplate, "id" | "title" | "path" | "type">, format = "Bonsai") : PublicTemplateSelection {
  return { id: item.id, title: item.title, path: item.path, type: item.type, format, reference: templateReference };
}
