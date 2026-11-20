import { CommercialAudiences, ReviewsHero, ReviewVideo, ReviewGrid } from "@/features/public-commercial";
import { SupportAndTrial } from "@/features/public-web";
import "@/styles/public-commercial.css";

// 기능 : G04 후기의 원본 홍보·포스터·정적 카드와 로컬 인계를 조립한다.
export function ReviewsPage() {
  return <div className="reviews-page"><CommercialAudiences /><ReviewsHero /><ReviewVideo /><ReviewGrid /><SupportAndTrial /></div>;
}
