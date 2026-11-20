import content from "./introduction-content.json";
import articles from "./related-articles.json";

export type IntroductionId = keyof typeof content.pages;
export type IntroductionContent = (typeof content.pages)[IntroductionId];
export const introductionContent = content.pages;
export const introductionAssets = content.assets;
export const introductionRoutes = [
  { path: "/crm", id: "crm", title: "CRM Software" },
  { path: "/software/consulting", id: "consulting", title: "Consulting Software" },
  { path: "/software/small-businesses", id: "small-businesses", title: "Small business management software" },
] as const;

// 의미 : 소개 안에서 확인한 추가 목적지이며 G05·G06 본문 구현을 뜻하지 않는다.
export const introductionPendingDestinations = [
  ...content.pages.crm.templates.map(item => ({ path: item.path, label: item.title, goal: "G06" })),
  ...articles.map(item => ({ path: item.path, label: item.title, goal: "G05" })),
  { path: "/templates/forms", label: "Form templates", goal: "G06" },
];
