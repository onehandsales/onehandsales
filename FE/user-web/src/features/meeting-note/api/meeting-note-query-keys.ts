import type { MeetingNoteListParams } from "@/features/meeting-note/types/meeting-note";

export const meetingNoteQueryKeys = {
  all: ["meeting-note"] as const,
  filters: () => [...meetingNoteQueryKeys.all, "filters"] as const,
  filterCompanies: () =>
    [...meetingNoteQueryKeys.filters(), "companies"] as const,
  filterContacts: () =>
    [...meetingNoteQueryKeys.filters(), "contacts"] as const,
  lists: () => [...meetingNoteQueryKeys.all, "list"] as const,
  list: (params: MeetingNoteListParams) =>
    [
      ...meetingNoteQueryKeys.lists(),
      {
        companyIds: [...(params.companyIds ?? [])],
        contactIds: [...(params.contactIds ?? [])],
        page: params.page ?? 1,
        sort: params.sort ?? "createdAtDesc",
      },
    ] as const,
  details: () => [...meetingNoteQueryKeys.all, "detail"] as const,
  detail: (meetingNoteId: string) =>
    [...meetingNoteQueryKeys.details(), meetingNoteId] as const,
};
