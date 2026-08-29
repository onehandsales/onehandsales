// 역할 : MeetingNoteSourceTypeValue 회의록 생성 출처 값을 정의합니다.
export enum MeetingNoteSourceTypeValue {
  MANUAL = "MANUAL",
  TEXT_AI = "TEXT_AI",
  STT_AI = "STT_AI",
}

// 역할 : MeetingNoteSort 회의록 목록 정렬 값을 정의합니다.
export enum MeetingNoteSort {
  CREATED_AT_DESC = "createdAtDesc",
  MEETING_AT_DESC = "meetingAtDesc",
}
