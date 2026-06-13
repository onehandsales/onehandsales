// 기능 : 딜 상세 페이지 — desktop에서 split view가 아닌 전용 상세 화면
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { DealDetailPanel } from "@/features/deal";

export function DealDetailPage() {
  const { dealId } = useParams();

  return (
    <div className="min-h-[calc(100vh-var(--topbar-height))]">
      <div className="px-6 pt-4">
        <Link
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#374151]"
          to="/deals"
        >
          <ArrowLeft className="h-4 w-4" />
          딜 목록
        </Link>
      </div>
      <DealDetailPanel dealId={dealId ?? ""} variant="page" />
    </div>
  );
}
