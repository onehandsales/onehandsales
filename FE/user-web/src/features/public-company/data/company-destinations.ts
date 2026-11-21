// 의미 : 원본의 과거 외부 주소는 안내용 문자열이며 앱에서 요청하지 않는다.
export const companyDestinations = {
  "affiliate-application": { title: "Affiliate application", source: "https://hellobonsai.firstpromoter.com/", origin: "/affiliates", description: "The historical Apply now link leads to an external affiliate service. This local preview has not submitted an application, created an affiliate account or earned a reward." },
  "affiliate-contact": { title: "Contact the affiliate team", source: "mailto:affiliates@hellobonsai.com", origin: "/affiliates", description: "This is the historical affiliate contact address. No mail app has been opened and no message has been sent." },
  careers: { title: "Open positions", source: "https://bonsai.crew.work/jobs", origin: "/careers", description: "The historical careers link leads to an external jobs site. Current openings and application forms are not included in this local preview. No application has been submitted." },
  "cookie-policy": { title: "Cookie Policy", source: "https://www.iubenda.com/privacy-policy/35324406/cookie-policy", origin: "/legal/privacy", description: "The reference opens this external policy in a new tab. This preview keeps the destination local. The external policy body is not included and no cookie preference has changed." },
  "privacy-contact": { title: "Privacy contact", source: "mailto:team@hellobonsai.com", origin: "/legal/privacy", description: "The historical privacy document describes contacting this address. This preview does not submit an access or deletion request, or change any account data." },
  linkedin: { title: "LinkedIn", source: "https://www.linkedin.com/company/bonsai/", origin: "/", description: "The footer points to this external profile. This preview displays its destination locally without loading LinkedIn." },
  twitter: { title: "Twitter", source: "https://twitter.com/bonsaiinc", origin: "/", description: "The historical footer points to this external profile. This preview displays its destination locally without loading the external service." },
} as const;
export type CompanyDestinationId = keyof typeof companyDestinations;
export const companyRoutes = [
  { path: "/affiliates", title: "Affiliate Program" }, { path: "/careers", title: "Careers" },
  { path: "/legal/privacy", title: "Privacy" }, { path: "/legal/terms", title: "Terms & Conditions" },
  ...Object.entries(companyDestinations).map(([id, item]) => ({ path: `/outbound/${id}`, title: item.title })),
];
// 기능 : 등록된 외부 인계 ID만 고정한 로컬 안내로 해석한다.
export function findCompanyDestination(id: string) { return Object.hasOwn(companyDestinations, id) ? companyDestinations[id as CompanyDestinationId] : undefined; }
