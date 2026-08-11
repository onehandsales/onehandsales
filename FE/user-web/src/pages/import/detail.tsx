import { Navigate, useParams } from "react-router-dom";
import { ImportDetailScreen } from "@/features/import-export";

export function ImportDetailPage() {
  const { importUserLogId } = useParams();

  if (!importUserLogId) {
    return <Navigate replace to="/app/import" />;
  }

  return <ImportDetailScreen importUserLogId={importUserLogId} />;
}
