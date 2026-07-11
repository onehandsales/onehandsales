import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CompanyCreateDialog } from "@/features/company/components/company-create-dialog";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import type { CompanyCreateFormValues } from "@/features/company/schemas/company-schema";

// 기능 : 패널에서 확대한 회사 생성 전용 페이지를 렌더링합니다.
export function CompanyNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const initialValues = useMemo(
    () => readCompanyCreateDraft(location.state),
    [location.state],
  );

  const closeToList = () => {
    void navigate("/app/companies", { replace: true });
  };

  const navigateAfterCreated = () => {
    void navigate("/app/companies", {
      replace: true,
      state: { notice: "회사를 추가했어요." },
    });
  };

  return (
    <CompanyCreateDialog
      fields={fieldsQuery.data?.items ?? []}
      initialValues={initialValues}
      isFieldsLoading={fieldsQuery.isLoading}
      isRegionsLoading={regionsQuery.isLoading}
      mode="page"
      onCreated={navigateAfterCreated}
      onOpenChange={(open) => {
        if (!open) {
          closeToList();
        }
      }}
      open
      regions={regionsQuery.data?.items ?? []}
    />
  );
}

function readCompanyCreateDraft(
  state: unknown,
): Partial<CompanyCreateFormValues> | undefined {
  if (!isRecord(state) || !isRecord(state.companyCreateDraft)) {
    return undefined;
  }

  const draft = state.companyCreateDraft;

  return {
    companyName: readString(draft.companyName),
    companyFieldId: readString(draft.companyFieldId),
    companyRegionId: readString(draft.companyRegionId),
    companyMemo: readString(draft.companyMemo),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
