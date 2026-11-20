import { IntroductionHero, IntroductionOverview, IntroductionTestimonial, IntroductionBanners,
  IntroductionTiles, CrmTemplates, CrmFaq, RelatedArticles, introductionContent } from "@/features/public-introduction";
import type { IntroductionId } from "@/features/public-introduction";
import { SupportAndTrial } from "@/features/public-web";
import "@/styles/public-introduction.css";

// 기능 : G03이 소유한 세 소개만 공통 공개 레이아웃 안에 조립한다.
export function IntroductionPage({ id }: { id: IntroductionId }) {
  const page = introductionContent[id];
  const crm = id === "crm";
  return <div className={`intro-page intro-page-${id}`}>
    <IntroductionHero page={page} /><IntroductionOverview page={page} />
    {!crm && <IntroductionTestimonial page={page} />}
    <IntroductionBanners page={page} />
    {crm && <><IntroductionTestimonial page={page} /><CrmTemplates /></>}
    <IntroductionTiles page={page} />
    <SupportAndTrial />
    {crm && <CrmFaq />}
    {id === "small-businesses" && <RelatedArticles />}
  </div>;
}
