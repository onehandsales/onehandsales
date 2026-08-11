import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeAppPhoneCountryCode, useAppI18n } from "@/features/app-i18n";
import {
  ContactCreateDialog,
  type ContactCreateFormValues,
} from "@/features/contact";

// 기능 : 패널에서 확대한 담당자 생성 전용 페이지를 렌더링합니다.
export function ContactNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const initialValues = useMemo(
    () => readContactCreateDraft(location.state),
    [location.state],
  );

  // 기능 : 프론트엔드 화면에서 현재 패널이나 모달을 닫습니다.
  const closeToList = () => {
    void navigate("/app/contacts", { replace: true });
  };

  // 기능 : 프론트엔드 생성 완료 후 후속 이동을 처리합니다.
  const navigateAfterCreated = () => {
    void navigate("/app/contacts", {
      replace: true,
      state: { notice: t("contactList.createdNotice") },
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

// 기능 : route state에서 담당자 생성 draft 값을 복원합니다.
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
    phoneCountryCode: normalizeAppPhoneCountryCode(
      readString(draft.phoneCountryCode)
    ),
    phoneNationalNumber: readString(draft.phoneNationalNumber),
    email: readString(draft.email),
    companyId: readString(draft.companyId),
    companySearch: readString(draft.companySearch),
    contactDepartmentId: readString(draft.contactDepartmentId),
    contactJobGradeId: readString(draft.contactJobGradeId),
    contactMemo: readString(draft.contactMemo),
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
