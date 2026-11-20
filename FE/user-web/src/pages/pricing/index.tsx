import { CommercialAudiences, PricingPlans, PricingAddons } from "@/features/public-commercial";
import { SupportAndTrial } from "@/features/public-web";
import "@/styles/public-commercial.css";

// 기능 : G04 가격의 주기·플랜 비교·추가 상품과 기존 공개 CTA를 조립한다.
export function PricingPage() {
  return <div className="pricing-page"><CommercialAudiences pricing /><PricingPlans /><PricingAddons /><SupportAndTrial /></div>;
}
