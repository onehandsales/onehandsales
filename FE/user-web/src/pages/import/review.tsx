import { Navigate, useParams } from "react-router-dom";
import { ImportReviewScreen } from "@/features/import-export";

export function ImportReviewPage() {
  const { importJobId } = useParams();

  if (!importJobId) {
    return <Navigate replace to="/app/import" />;
  }

  return <ImportReviewScreen importJobId={importJobId} />;
}
