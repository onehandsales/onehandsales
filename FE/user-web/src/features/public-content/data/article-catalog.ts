import { introductionArticles } from "@/features/public-introduction";

export const blogCategories = ["General", "Finances", "Legal", "Taxes", "Finding work", "Start a business", "Marketing yourself", "Tools"] as const;
export type BlogCategory = typeof blogCategories[number];
export type BlogArticle = { id: string; path: string; title: string; category: string; author: string; image: string; portrait: string; summary: string; hasObservedDetail?: boolean };
const asset = "/bonsai-blog/";
// 근거 : G05 제공 PNG의 문구·사진. ID는 로컬 식별자이고 상세 경로만 보관본으로 확인했다.
export const observedArticles: BlogArticle[] = [
  { id: "agency-crm", path: "/blog/agency-crm", title: "10 Best CRMs for Agencies (2024)", category: "Tools", author: "Brian Hughes", image: asset + "agency-crm.png", portrait: "/bonsai-introduction/65c0c058307c2aaf82e1cf13.png", summary: "Here are the steps you need to follow in order to choose the CRM that is suitable for your agency." },
  { id: "agency-organizational-chart", path: "/blog/agency-organizational-chart", title: "7 Agency Organizational Charts", category: "Business structure", author: "Brian Hughes", image: asset + "agency-organizational-chart.png", portrait: "/bonsai-introduction/65c0c058307c2aaf82e1cf13.png", summary: "We've made a list of organizational charts that will help agencies get an overview of roles and responsibilities and streamline their decision-making process." },
  { id: "white-label-software", path: "/blog/white-label-software", title: "10 Best White Label Software for Agencies (2024)", category: "Tools", author: "Brian Hughes", image: asset + "white-label-software.png", portrait: "/bonsai-introduction/65c0c058307c2aaf82e1cf13.png", summary: "With the use of white labelling becoming the norm, it’s essential for agencies to choose the most suitable tools for them." },
  { id: "executive-coaching", path: "/blog/executive-coaching", title: "How to start an executive coaching business", category: "Start a business", author: "Diana Myers", image: asset + "executive-coaching.png", portrait: asset + "diana-myers.png", summary: "Learn how to start an executive coaching business with this end-to-end guide and discover the best tools to use for saving time, saving money, and growing your executive coaching business." },
  { id: "photography", path: "/blog/photography", title: "How to get into photography", category: "Start a business", author: "Ardith Stephanson", image: asset + "photography.png", portrait: asset + "ardith-stephanson.png", summary: "Turning a hobby into a career is both rewarding and fulfilling. If you want to pursue your passion in photography, here are some tips on how to get started." },
  { id: "good-consultant", path: "/blog/good-consultant", title: "How to be a good consultant: everything you need to know", category: "Start a business", author: "Brandon Leuangpaseuth", image: asset + "good-consultant.png", portrait: asset + "brandon.png", summary: "If you are looking for the skills required to be a good consultant, read this. We'll tell you all the traits that make up a wonderful consultant and the reasons why they should have it." },
  { id: "how-to-start-a-digital-marketing-agency", path: "/blog/how-to-start-a-digital-marketing-agency", title: "7 steps to launching your digital marketing agency", category: "Start a business", author: "CJ Haughey", image: asset + "digital-marketing.png", portrait: asset + "cj-haughey.png", summary: "Starting a digital marketing agency is tougher in 2018, but there is great potential if you have a solid plan and the right team. Get started with our 7 step guide.", hasObservedDetail: true },
];
export const recommendedArticles: BlogArticle[] = [
  { id: "ai-and-digitalization", path: "/blog/ai-and-digitalization", title: "AI and digitalization are key to nearly all current business growth plans—here's what's in store", category: "Others", author: "", portrait: "", image: asset + "ai-digitalization.png", summary: "Bonsai took a closer look at how businesses are digitizing—and how those transformations are already" },
  { id: "venture-capital-investments", path: "/blog/venture-capital-investments", title: "Venture capital investments have skyrocketed—these industries have felt the biggest boost", category: "Others", author: "", portrait: "", image: asset + "venture-capital.png", summary: "Bonsai measured the percent change in venture capital invested across startup sectors, using data from the National" },
];
export const blogArticles: BlogArticle[] = [...observedArticles, ...introductionArticles.map(article => ({ ...article, summary: "" }))];
export const allArticles = [...blogArticles, ...recommendedArticles];
export const contentRoutes = [{ path: "/blog", title: "Bonsai Business Software Blog" }, ...allArticles.map(article => ({ path: article.path, title: article.title }))];

// 기능 : URL의 분류를 검증하며 미선택과 General 선택을 구별한다.
export function readCategory(value: string | null): BlogCategory | "" { return blogCategories.find(category => category === value) ?? ""; }
// 기능 : 공개 목록에만 분류·제목/요약 부분검색·페이지를 적용하며 전체 데이터 부재를 구별한다.
export function selectArticles(category: BlogCategory | "", query: string, page: number, empty = false) {
  const categoryItems = empty ? [] : blogArticles.filter(article => !category || category === "General" || article.category === category);
  const needle = query.trim().toLocaleLowerCase();
  const matches = categoryItems.filter(article => `${article.title} ${article.summary}`.toLocaleLowerCase().includes(needle));
  const pages = Math.max(1, Math.ceil(matches.length / 6));
  const current = Math.max(1, Math.min(page, pages));
  return { items: matches.slice((current - 1) * 6, current * 6), total: matches.length, page: current, pages, categoryEmpty: categoryItems.length === 0 };
}
