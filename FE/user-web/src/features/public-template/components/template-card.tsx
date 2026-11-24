import { Link } from "react-router-dom";
import { usePublicOrigin } from "@/features/public-web";
import { FileText, UserRoundPlus, Send } from "lucide-react";
import type { PublicTemplate } from "../data/template-catalog";

// 기능 : 공개 카드의 관찰 라벨·빈 썸네일을 보존하고 같은 ID 상세에 출처 이력을 전달한다.
export function TemplateCard({ item }: { item: PublicTemplate }) {
  const origin = usePublicOrigin();
  return <Link className="template-card" to={item.path} state={{ templateOrigin: origin }}>
    <div className="template-thumbnail">{item.image && <img src={item.image} alt="" loading="lazy" />}</div>
    <div className="template-card-copy"><p>{item.observedLabel === "Task management" ? <UserRoundPlus aria-hidden="true" /> : item.type === "Quotes" ? <Send aria-hidden="true" /> : <FileText aria-hidden="true" />}{item.observedLabel}</p><h2>{item.title}</h2></div>
  </Link>;
}
