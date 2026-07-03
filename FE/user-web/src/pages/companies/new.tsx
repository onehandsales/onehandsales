import { CompanyListScreen } from "@/features/company";
import { useNavigate } from "react-router-dom";

export function CompanyNewPage() {
  const navigate = useNavigate();

  return (
    <CompanyListScreen
      initialCreateOpen
      onCreateDialogClose={() => {
        void navigate("/app/companies", { replace: true });
      }}
    />
  );
}
