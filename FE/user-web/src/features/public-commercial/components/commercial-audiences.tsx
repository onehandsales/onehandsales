import { PublicLink } from "@/features/public-web";

// 기능 : 가격·후기 캡처의 서로 다른 고객군 표시를 관찰한 로컬 소개 목적지에 연결한다.
export function CommercialAudiences({ pricing = false }: { pricing?: boolean }) {
  const links = pricing ? [
    ["Agencies", "/software/agencies"], ["Consultancies", "/software/consulting"], ["Professional services", "/software/professional-services"],
  ] : [["Small businesses", "/software/small-businesses"], ["Agencies", "/software/agencies"], ["Freelancers", "/software/freelancing"]];
  return <nav className="public-audiences public-wide" aria-label="Business types">{links.map(([label, path]) => <PublicLink href={path ?? "/"} key={label}>{label}</PublicLink>)}</nav>;
}
