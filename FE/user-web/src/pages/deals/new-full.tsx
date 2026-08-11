import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppI18n } from "@/features/app-i18n";
import { DealCreateDialog, type DealCreateFormValues } from "@/features/deal";

// 기능 : 패널에서 확대한 딜 생성 전용 페이지를 렌더링합니다.
export function DealNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const initialValues = useMemo(
    () => readDealCreateDraft(location.state),
    [location.state],
  );

  // 기능 : 프론트엔드 화면에서 현재 패널이나 모달을 닫습니다.
  const closeToList = () => {
    void navigate("/app/deals", { replace: true });
  };

  // 기능 : 프론트엔드 생성 완료 후 후속 이동을 처리합니다.
  const navigateAfterCreated = () => {
    void navigate("/app/deals", {
      replace: true,
      state: { notice: t("dealList.createdNotice") },
    });
  };

  return (
    <DealCreateDialog
      initialValues={initialValues}
      mode="page"
      onCreated={navigateAfterCreated}
      onOpenChange={(open) => {
        if (!open) {
          closeToList();
        }
      }}
      open
    />
  );
}

// 기능 : route state에서 딜 생성 draft 값을 복원합니다.
function readDealCreateDraft(
  state: unknown,
): Partial<DealCreateFormValues> | undefined {
  if (!isRecord(state) || !isRecord(state.dealCreateDraft)) {
    return undefined;
  }

  const draft = state.dealCreateDraft;

  return {
    dealName: readString(draft.dealName),
    dealCost: readString(draft.dealCost),
    companyIds: readStringArray(draft.companyIds),
    contactIds: readStringArray(draft.contactIds),
    productIds: readStringArray(draft.productIds),
    dealStatus: readDealStatus(draft.dealStatus),
    followingAction: readString(draft.followingAction),
    expectedEndDate: readString(draft.expectedEndDate),
    dealMemo: readString(draft.dealMemo),
    companySearch: readString(draft.companySearch),
    contactSearch: readString(draft.contactSearch),
    productSearch: readString(draft.productSearch),
  };
}

// 기능 : unknown 값을 key-value 항목로 안전하게 좁힙니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 기능 : route state draft에서 문자열 값을 안전하게 읽습니다.
function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

// 기능 : route state draft에서 문자열 배열 값을 안전하게 읽습니다.
function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

// 기능 : 딜 생성 draft에서 딜 상태 값을 안전하게 읽습니다.
function readDealStatus(value: unknown): DealCreateFormValues["dealStatus"] {
  return isDealStatus(value) ? value : "INITIAL_CONTACT";
}

// 기능 : 문자열 값이 지원하는 딜 상태인지 확인합니다.
function isDealStatus(
  value: unknown,
): value is DealCreateFormValues["dealStatus"] {
  return (
    value === "INITIAL_CONTACT" ||
    value === "NEEDS_CHECK" ||
    value === "PROPOSAL_QUOTE" ||
    value === "NEGOTIATION" ||
    value === "WON" ||
    value === "LOST"
  );
}
