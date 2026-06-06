import { useParams } from "react-router-dom";
import { CompanyDetailScreen } from "@/features/company";

export function CompanyDetailPage() {
  const { companyId } = useParams();

  return <CompanyDetailScreen companyId={companyId ?? ""} />;
}
