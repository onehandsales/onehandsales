import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DealCreateDialog } from "@/features/deal/components/deal-create-dialog";
import type { DealCreateFormValues } from "@/features/deal/schemas/deal-schema";

// 기능 : 패널에서 확대한 딜 생성 전용 페이지를 렌더링합니다.
export function DealNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => readDealCreateDraft(location.state),
    [location.state],
  );

  const closeToList = () => {
    void navigate("/app/deals", { replace: true });
  };

  const navigateAfterCreated = () => {
    void navigate("/app/deals", {
      replace: true,
      state: { notice: "딜을 추가했어요." },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readDealStatus(value: unknown): DealCreateFormValues["dealStatus"] {
  return isDealStatus(value) ? value : "INITIAL_CONTACT";
}

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
