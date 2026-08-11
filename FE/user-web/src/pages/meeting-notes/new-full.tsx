import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppI18n } from "@/features/app-i18n";
import {
  MeetingNoteCreateDialog,
  type MeetingNoteCreateFormValues,
} from "@/features/meeting-note";

// 기능 : 패널에서 확대한 회의록 생성 전용 페이지를 렌더링합니다.
export function MeetingNoteNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppI18n();
  const initialValues = useMemo(
    () => readMeetingNoteCreateDraft(location.state),
    [location.state],
  );

  // 기능 : 프론트엔드 화면에서 현재 패널이나 모달을 닫습니다.
  const closeToList = () => {
    void navigate("/app/meeting-notes", { replace: true });
  };

  // 기능 : 프론트엔드 생성 완료 후 후속 이동을 처리합니다.
  const navigateAfterCreated = () => {
    void navigate("/app/meeting-notes", {
      replace: true,
      state: { notice: t("meetingNoteCreate.createdNotice") },
    });
  };

  return (
    <MeetingNoteCreateDialog
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

// 기능 : route state에서 회의록 생성 draft 값을 복원합니다.
function readMeetingNoteCreateDraft(
  state: unknown,
): Partial<MeetingNoteCreateFormValues> | undefined {
  if (!isRecord(state) || !isRecord(state.meetingNoteCreateDraft)) {
    return undefined;
  }

  const draft = state.meetingNoteCreateDraft;

  return {
    title: readString(draft.title),
    meetingLocalDateTime: readString(draft.meetingLocalDateTime),
    companyIds: readStringArray(draft.companyIds),
    contactIds: readStringArray(draft.contactIds),
    productIds: readStringArray(draft.productIds),
    dealIds: readStringArray(draft.dealIds),
    details: readString(draft.details),
    nextPlan: readString(draft.nextPlan),
    requiredAction: readString(draft.requiredAction),
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
