import { Navigate, useParams } from "react-router-dom";
import { ImportDetailScreen } from "@/features/import-export/components/import-detail-screen";

export function ImportDetailPage() {
  const { importUserLogId } = useParams();

  if (!importUserLogId) {
    return <Navigate replace to="/import" />;
  }

  return <ImportDetailScreen importUserLogId={importUserLogId} />;
}
