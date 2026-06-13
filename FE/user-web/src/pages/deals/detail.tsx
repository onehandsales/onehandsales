// 기능 : 딜 상세 페이지 — desktop에서 split view가 아닌 전용 상세 화면
import { useParams } from "react-router-dom";
import { DealDetailPanel } from "@/features/deal";

export function DealDetailPage() {
  const { dealId } = useParams();

  return <DealDetailPanel dealId={dealId ?? ""} variant="page" />;
}
