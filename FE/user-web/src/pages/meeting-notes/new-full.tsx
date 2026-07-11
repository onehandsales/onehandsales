import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MeetingNoteCreateDialog } from "@/features/meeting-note/components/meeting-note-create-dialog";
import type { MeetingNoteCreateFormValues } from "@/features/meeting-note/schemas/meeting-note-schema";

// 기능 : 패널에서 확대한 회의록 생성 전용 페이지를 렌더링합니다.
export function MeetingNoteNewFullPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => readMeetingNoteCreateDraft(location.state),
    [location.state],
  );

  const closeToList = () => {
    void navigate("/app/meeting-notes", { replace: true });
  };

  const navigateAfterCreated = () => {
    void navigate("/app/meeting-notes", {
      replace: true,
      state: { notice: "회의록을 추가했어요." },
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
