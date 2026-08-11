import { Navigate, useParams } from "react-router-dom";
import { ImportDetailScreen } from "@/features/import-export";

// 기능 : 불러오기 상세 페이지를 렌더링합니다.
export function ImportDetailPage() {
  const { importUserLogId } = useParams();

  if (!importUserLogId) {
    return <Navigate replace to="/app/import" />;
  }

  return <ImportDetailScreen importUserLogId={importUserLogId} />;
}
