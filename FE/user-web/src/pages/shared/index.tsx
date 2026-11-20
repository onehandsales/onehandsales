import { useParams } from "react-router-dom";
import { useSharedPreview } from "@/features/preview";
import { StatusPanel } from "@/components/ui/status-panel";

// 기능 : 가상 로그인 없이 내부 항목과 분리된 읽기 전용 공유 자료를 표시한다.
export function SharedPage() {
  const { shareId = "" } = useParams();
  const query = useSharedPreview(shareId);
  return <div className="page-content">
    <p className="eyebrow">External view · Local preview</p>
    {query.isPending ? <StatusPanel title="Loading…" /> : query.isError ?
      <StatusPanel title="Shared preview unavailable" message={query.error.message} /> :
      <article className="item-card"><h1>{query.data.name}</h1><p>This read-only sample is separate from workspace data.</p></article>}
  </div>;
}
