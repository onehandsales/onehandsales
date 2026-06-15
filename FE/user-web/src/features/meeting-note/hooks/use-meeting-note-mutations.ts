import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeetingNote,
  updateMeetingNote,
} from "@/features/meeting-note/api/meeting-note-api";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import type {
  CreateMeetingNoteInput,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";

// 기능 : 수동 회의록 생성 mutation을 제공합니다.
export function useCreateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingNoteInput) => createMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

// 기능 : 수동 회의록 수정 mutation을 제공합니다.
export function useUpdateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMeetingNoteInput) => updateMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

// 기능 : 회의록 변경 후 관련 query cache를 갱신합니다.
function invalidateMeetingNoteQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  meetingNoteId: string
) {
  void queryClient.invalidateQueries({ queryKey: meetingNoteQueryKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: meetingNoteQueryKeys.filters() });
  void queryClient.invalidateQueries({
    queryKey: meetingNoteQueryKeys.detail(meetingNoteId),
  });
}
