import type { BusinessCardConfirmFormValues } from "@/features/business-card";
import type { MeetingNoteCreateFormValues } from "@/features/meeting-note";
import type {
  BusinessCardConfirmLocalDraftPayload,
  MeetingNoteCreateLocalDraftPayload,
} from "@/features/mobile-local-draft/types/mobile-local-draft";

// 기능 : 명함 확인 form 값에서 이미지/OCR raw 없이 복구 가능한 텍스트 필드만 고릅니다.
export function toBusinessCardConfirmLocalDraftPayload(
  scanLogId: string,
  values: BusinessCardConfirmFormValues
): BusinessCardConfirmLocalDraftPayload {
  return {
    scanLogId,
    companyName: toOptionalDraftText(values.companyName),
    companyFieldName: toOptionalDraftText(values.companyFieldName),
    companyRegionName: toOptionalDraftText(values.companyRegionName),
    contactName: toOptionalDraftText(values.contactName),
    contactMobile: toOptionalDraftText(values.contactMobile),
    contactEmail: toOptionalDraftText(values.contactEmail),
    contactDepartmentName: toOptionalDraftText(values.contactDepartmentName),
    contactJobGradeName: toOptionalDraftText(values.contactJobGradeName),
  };
}

// 기능 : 저장된 명함 local draft payload를 confirm form 값으로 되돌립니다.
export function toBusinessCardConfirmValuesFromLocalDraft(
  payload: BusinessCardConfirmLocalDraftPayload
): BusinessCardConfirmFormValues {
  return {
    companyName: payload.companyName ?? "",
    companyFieldName: payload.companyFieldName ?? "",
    companyRegionName: payload.companyRegionName ?? "",
    contactName: payload.contactName ?? "",
    contactMobile: payload.contactMobile ?? "",
    contactEmail: payload.contactEmail ?? "",
    contactDepartmentName: payload.contactDepartmentName ?? "",
    contactJobGradeName: payload.contactJobGradeName ?? "",
  };
}

// 기능 : 명함 confirm draft가 scanLogId 외에 사용자가 복구할 값을 갖는지 확인합니다.
export function isBusinessCardConfirmLocalDraftEmpty(
  payload: BusinessCardConfirmLocalDraftPayload
) {
  return [
    payload.companyName,
    payload.companyFieldName,
    payload.companyRegionName,
    payload.contactName,
    payload.contactMobile,
    payload.contactEmail,
    payload.contactDepartmentName,
    payload.contactJobGradeName,
  ].every((value) => !value?.trim());
}

// 기능 : 회의록 작성 form 값에서 audio/transcript/provider raw 없이 form 필드만 고릅니다.
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

// 기능 : 저장된 회의록 local draft payload를 create form 값으로 되돌립니다.
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

// 기능 : 회의록 draft가 clientDraftId 외에 복구할 사용 입력을 갖는지 확인합니다.
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

// 기능 : 선택 초안 텍스트 값으로 변환합니다.
function toOptionalDraftText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed ? trimmed : undefined;
}

// 기능 : 선택 초안 배열 값으로 변환합니다.
function toOptionalDraftArray(values: readonly string[] | undefined) {
  return values && values.length > 0 ? [...values] : undefined;
}
