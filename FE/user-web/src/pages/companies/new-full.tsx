import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppI18n } from "@/features/app-i18n";
import {
  CompanyCreateDialog,
  type CompanyCreateFormValues,
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company";

// 기능 : 패널에서 확대한 회사 생성 전용 페이지를 렌더링합니다.
export function CompanyNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppI18n();
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
      state: { notice: t("companyList.createdNotice") },
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
    countryCode: readCompanyRegionCountryCode(draft.countryCode),
    regionCode: readString(draft.regionCode),
    address: readString(draft.address),
    companyMemo: readString(draft.companyMemo),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

// 기능 : route state에 저장된 회사 지역 국가 code를 지원 범위 안에서 복원합니다.
function readCompanyRegionCountryCode(value: unknown) {
  return value === "US" ? "US" : "KR";
}
