import { ClientExperience, FinanceOverview, LandingHero, ProductOverview, ReviewHighlights, SupportAndTrial, Testimonials } from "@/features/public-web";

// 기능 : G02 공개 랜딩의 원본 순서대로 독립적인 홍보 섹션과 CTA를 조합한다.
export function PublicPage() {
  return <><LandingHero /><ProductOverview /><Testimonials /><FinanceOverview /><ClientExperience /><ReviewHighlights /><SupportAndTrial /></>;
}
