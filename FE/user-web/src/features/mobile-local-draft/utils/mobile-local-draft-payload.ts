import type { MeetingNoteCreateFormValues } from "@/features/meeting-note";
import type { MeetingNoteCreateLocalDraftPayload } from "@/features/mobile-local-draft/types/mobile-local-draft";

export function toMeetingNoteCreateLocalDraftPayload(
  clientDraftId: string,
  values: MeetingNoteCreateFormValues
): MeetingNoteCreateLocalDraftPayload {
  return {
    clientDraftId,
    meetingLocalDateTime: toOptionalDraftText(values.meetingLocalDateTime),
    companyIds: toOptionalDraftArray(values.companyIds),
    contactIds: toOptionalDraftArray(values.contactIds),
    productIds: toOptionalDraftArray(values.productIds),
    dealIds: toOptionalDraftArray(values.dealIds),
    title: toOptionalDraftText(values.title),
    details: toOptionalDraftText(values.details),
    nextPlan: toOptionalDraftText(values.nextPlan),
    requiredAction: toOptionalDraftText(values.requiredAction),
  };
}

export function toMeetingNoteCreateValuesFromLocalDraft(
  payload: MeetingNoteCreateLocalDraftPayload,
  fallbackValues: MeetingNoteCreateFormValues
): MeetingNoteCreateFormValues {
  return {
    title: payload.title ?? "",
    meetingLocalDateTime:
      payload.meetingLocalDateTime ?? fallbackValues.meetingLocalDateTime,
    companyIds: [...(payload.companyIds ?? [])],
    contactIds: [...(payload.contactIds ?? [])],
    productIds: [...(payload.productIds ?? [])],
    dealIds: [...(payload.dealIds ?? [])],
    details: payload.details ?? "",
    nextPlan: payload.nextPlan ?? "",
    requiredAction: payload.requiredAction ?? "",
  };
}

export function isMeetingNoteCreateLocalDraftEmpty(
  payload: MeetingNoteCreateLocalDraftPayload
) {
  return (
    !payload.meetingLocalDateTime?.trim() &&
    !payload.title?.trim() &&
    !payload.details?.trim() &&
    !payload.nextPlan?.trim() &&
    !payload.requiredAction?.trim() &&
    (payload.companyIds?.length ?? 0) === 0 &&
    (payload.contactIds?.length ?? 0) === 0 &&
    (payload.productIds?.length ?? 0) === 0 &&
    (payload.dealIds?.length ?? 0) === 0
  );
}

function toOptionalDraftText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed ? trimmed : undefined;
}

function toOptionalDraftArray(values: readonly string[] | undefined) {
  return values && values.length > 0 ? [...values] : undefined;
}
