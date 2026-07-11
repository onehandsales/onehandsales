import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import type { ContactCreateFormValues } from "@/features/contact/schemas/contact-schema";

// 기능 : 패널에서 확대한 담당자 생성 전용 페이지를 렌더링합니다.
export function ContactNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => readContactCreateDraft(location.state),
    [location.state],
  );

  const closeToList = () => {
    void navigate("/app/contacts", { replace: true });
  };

  const navigateAfterCreated = () => {
    void navigate("/app/contacts", {
      replace: true,
      state: { notice: "담당자를 추가했어요." },
    });
  };

  return (
    <ContactCreateDialog
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

function readContactCreateDraft(
  state: unknown,
): Partial<ContactCreateFormValues> | undefined {
  if (!isRecord(state) || !isRecord(state.contactCreateDraft)) {
    return undefined;
  }

  const draft = state.contactCreateDraft;

  return {
    username: readString(draft.username),
    mobile: readString(draft.mobile),
    email: readString(draft.email),
    companyId: readString(draft.companyId),
    companySearch: readString(draft.companySearch),
    contactDepartmentId: readString(draft.contactDepartmentId),
    contactJobGradeId: readString(draft.contactJobGradeId),
    contactMemo: readString(draft.contactMemo),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}
