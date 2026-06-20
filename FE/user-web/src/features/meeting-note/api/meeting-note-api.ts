import type {
  CreateMeetingNoteInput,
  CreateMeetingNoteSttAiDraftInput,
  CreateMeetingNoteTextAiDraftInput,
  MeetingNote,
  MeetingNoteAiDraftResponse,
  MeetingNoteFilterCompanyListResponse,
  MeetingNoteFilterContactListResponse,
  LinkMeetingNoteDealsInput,
  MeetingNoteListParams,
  MeetingNoteListResponse,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";
import { apiClient } from "@/lib/api-client";

// 기능 : 회의록 목록을 Backend MeetingNote API에서 조회합니다.
export function listMeetingNotes(params: MeetingNoteListParams) {
  const query = toMeetingNoteListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<MeetingNoteListResponse>(`/api/meeting-notes${suffix}`);
}

// 기능 : 회의록 회사 필터 옵션을 조회합니다.
export function listMeetingNoteFilterCompanies() {
  return apiClient<MeetingNoteFilterCompanyListResponse>(
    "/api/meeting-notes/filter-companies"
  );
}

// 기능 : 회의록 연락처 필터 옵션을 조회합니다.
export function listMeetingNoteFilterContacts() {
  return apiClient<MeetingNoteFilterContactListResponse>(
    "/api/meeting-notes/filter-contacts"
  );
}

// 기능 : 회의록 단건 상세를 조회합니다.
export function getMeetingNote(meetingNoteId: string) {
  return apiClient<MeetingNote>(`/api/meeting-notes/${meetingNoteId}`);
}

// 기능 : 회의록을 생성합니다.
export function createMeetingNote(input: CreateMeetingNoteInput) {
  return apiClient<MeetingNote>("/api/meeting-notes", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 텍스트 원문으로 회의록 AI 초안을 생성합니다.
export function createMeetingNoteTextAiDraft(
  input: CreateMeetingNoteTextAiDraftInput
) {
  return apiClient<MeetingNoteAiDraftResponse>("/api/meeting-notes/ai-draft", {
    method: "POST",
    body: compactBody(input),
  });
}

// 기능 : 음성 파일로 STT+AI 회의록 초안을 생성합니다.
export function createMeetingNoteSttAiDraft(
  input: CreateMeetingNoteSttAiDraftInput
) {
  const formData = new FormData();

  formData.append("audio", input.audioFile);
  formData.append("meetingLocalDateTime", input.meetingLocalDateTime);
  appendFormDataArray(formData, "companies", input.companies);
  appendFormDataArray(formData, "contacts", input.contacts);
  appendFormDataArray(formData, "products", input.products);
  appendFormDataArray(formData, "deals", input.deals);

  return apiClient<MeetingNoteAiDraftResponse>("/api/meeting-notes/stt-draft", {
    method: "POST",
    body: formData,
  });
}

// 기능 : 회의록을 수정합니다.
export function updateMeetingNote(input: UpdateMeetingNoteInput) {
  const { meetingNoteId, ...body } = input;

  return apiClient<MeetingNote>(`/api/meeting-notes/${meetingNoteId}`, {
    method: "PATCH",
    body: compactBody(body),
  });
}

// 기능 : 저장된 회의록에 딜을 추가 연결하고 딜 활동 로그 생성을 요청합니다.
export function linkMeetingNoteDeals(input: LinkMeetingNoteDealsInput) {
  return apiClient<MeetingNote>(`/api/meeting-notes/${input.meetingNoteId}/deals`, {
    method: "POST",
    body: {
      deals: input.deals,
    },
  });
}

// 기능 : 회의록을 삭제합니다.
export function deleteMeetingNote(meetingNoteId: string) {
  return apiClient<void>(`/api/meeting-notes/${meetingNoteId}`, {
    method: "DELETE",
  });
}

// 기능 : 회의록 목록 query string을 API 계약 형식으로 변환합니다.
function toMeetingNoteListSearchParams(params: MeetingNoteListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  params.companyIds?.forEach((companyId) => {
    searchParams.append("companyIds", companyId);
  });
  params.contactIds?.forEach((contactId) => {
    searchParams.append("contactIds", contactId);
  });

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.meetingDate) {
    searchParams.set("meetingDate", params.meetingDate);
  }

  return searchParams;
}

// 기능 : undefined 값을 제거해 whitelist API body만 전송합니다.
function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

function appendFormDataArray(
  formData: FormData,
  name: string,
  values: readonly string[] | undefined
) {
  values?.forEach((value) => {
    formData.append(name, value);
  });
}
