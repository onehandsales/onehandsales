import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeetingNote,
  createMeetingNoteSttAiDraft,
  createMeetingNoteTextAiDraft,
  deleteMeetingNote,
  linkMeetingNoteDeals,
  updateMeetingNote,
} from "@/features/meeting-note/api/meeting-note-api";
import { dealQueryKeys } from "@/features/deal/api/deal-query-keys";
import { meetingNoteQueryKeys } from "@/features/meeting-note/api/meeting-note-query-keys";
import type {
  CreateMeetingNoteInput,
  CreateMeetingNoteSttAiDraftInput,
  CreateMeetingNoteTextAiDraftInput,
  LinkMeetingNoteDealsInput,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";

// 기능 : 회의록 생성 mutation을 제공합니다.
export function useCreateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingNoteInput) => createMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

// 기능 : 텍스트 회의록 AI 초안 생성 mutation을 제공합니다.
export function useCreateMeetingNoteTextAiDraftMutation() {
  return useMutation({
    mutationFn: (input: CreateMeetingNoteTextAiDraftInput) =>
      createMeetingNoteTextAiDraft(input),
  });
}

// 기능 : 음성 회의록 STT+AI 초안 생성 mutation을 제공합니다.
export function useCreateMeetingNoteSttAiDraftMutation() {
  return useMutation({
    mutationFn: (input: CreateMeetingNoteSttAiDraftInput) =>
      createMeetingNoteSttAiDraft(input),
  });
}

// 기능 : 회의록 수정 mutation을 제공합니다.
export function useUpdateMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMeetingNoteInput) => updateMeetingNote(input),
    onSuccess: (meetingNote) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
    },
  });
}

// 기능 : 회의록에 딜을 추가 연결하고 관련 query cache를 갱신합니다.
export function useLinkMeetingNoteDealsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LinkMeetingNoteDealsInput) => linkMeetingNoteDeals(input),
    onSuccess: (meetingNote, input) => {
      invalidateMeetingNoteQueries(queryClient, meetingNote.id);
      input.deals.forEach((dealId) => {
        void queryClient.invalidateQueries({
          queryKey: dealQueryKeys.followingActionLogs(dealId),
        });
        void queryClient.invalidateQueries({
          queryKey: dealQueryKeys.detail(dealId),
        });
      });
    },
  });
}

// 기능 : 회의록 삭제 mutation을 제공합니다.
export function useDeleteMeetingNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingNoteId: string) => deleteMeetingNote(meetingNoteId),
    onSuccess: (_result, meetingNoteId) => {
      invalidateMeetingNoteQueries(queryClient, meetingNoteId);
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
