import navigation from "../data/navigation-content.json";

export type PublicLinkData = { label: string; sourceHref: string };

// 기능 : 공식 출처 주소를 외부 요청이 없는 우리 공개 경로로 변환한다.
export function localPublicPath(sourceHref: string): string {
  const url = new URL(sourceHref, "https://www.hellobonsai.com");
  if (url.hostname === "help.hellobonsai.com") return "/help" + (url.pathname === "/en/" ? "" : url.pathname);
  if (url.hostname.includes("linkedin.com")) return "/outbound/linkedin";
  if (url.hostname.includes("twitter.com")) return "/outbound/twitter";
  if (url.hostname === "app.hellobonsai.com") return url.pathname.includes("sign_up") ? "/signup" : "/login";
  return url.pathname + url.search + url.hash;
}

// 기능 : 미구현 공개 목적지를 실제 실행할 후속 Goal에 배정한다.
export function destinationGoal(path: string): string {
  if (path === "/signup") return "G10";
  if (path === "/login") return "G11";
  if (/^\/(help|support)/.test(path)) return "G08";
  if (/^\/(legal|careers|affiliates|outbound)/.test(path)) return "G09";
  if (/^\/(pricing|reviews)/.test(path)) return "G04";
  if (path === "/invoice-generator") return "G07";
  if (/template|^\/templates/.test(path)) return "G06";
  if (/^\/(blog|resources|self-employment|rates|a\/|alternatives)/.test(path)) return "G05";
  return "G03";
}

const allLinks: PublicLinkData[] = [
  ...navigation.menus.flatMap(menu => menu.groups.flatMap(group => group.links)),
  ...navigation.templates.flatMap(group => group.links),
  ...navigation.footerGroups.flatMap(group => [...group.links, ...group.disclosures.flatMap(disclosure => disclosure.links)]),
  { label: "All Templates", sourceHref: "/templates" },
  { label: "Small businesses", sourceHref: "/software/small-businesses" },
  { label: "Agencies", sourceHref: "/software/agencies" },
  { label: "Freelancers", sourceHref: "/software/freelancing" },
  { label: "LinkedIn", sourceHref: "https://www.linkedin.com/company/bonsai/" },
  { label: "Twitter", sourceHref: "https://twitter.com/bonsaiinc" },
];

// 의미 : 목록의 원본 href와 로컬 목적지는 구분되며 이 목록이 후속 페이지 구현 완료를 뜻하지 않는다.
export const publicDestinations = [...new Map(allLinks.map(link => [localPublicPath(link.sourceHref), {
  ...link, path: localPublicPath(link.sourceHref), goal: destinationGoal(localPublicPath(link.sourceHref)),
}])).values()].filter(link => !["/", "/login", "/signup"].includes(link.path));
