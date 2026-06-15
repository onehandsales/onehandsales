import { useQuery } from "@tanstack/react-query";
import {
  getMeetingNote,
  listMeetingNoteFilterCompanies,
  listMeetingNoteFilterContacts,
  listMeetingNotes,
} from "@/features/meeting-note/api/meeting-note-api";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import type { MeetingNoteListParams } from "@/features/meeting-note/types/meeting-note";

// 기능 : 회의록 목록 query를 실행합니다.
export function useMeetingNoteList(params: MeetingNoteListParams) {
  return useQuery({
    queryKey: meetingNoteQueryKeys.list(params),
    queryFn: () => listMeetingNotes(params),
  });
}

// 기능 : 회의록 상세 query를 실행합니다.
export function useMeetingNoteDetail(meetingNoteId: string, enabled = true) {
  return useQuery({
    enabled: enabled && meetingNoteId.length > 0,
    queryKey: meetingNoteQueryKeys.detail(meetingNoteId),
    queryFn: () => getMeetingNote(meetingNoteId),
  });
}

// 기능 : 회의록 회사 필터 option query를 실행합니다.
export function useMeetingNoteFilterCompanies() {
  return useQuery({
    queryKey: meetingNoteQueryKeys.filterCompanies(),
    queryFn: listMeetingNoteFilterCompanies,
  });
}

// 기능 : 회의록 연락처 필터 option query를 실행합니다.
export function useMeetingNoteFilterContacts() {
  return useQuery({
    queryKey: meetingNoteQueryKeys.filterContacts(),
    queryFn: listMeetingNoteFilterContacts,
  });
}
