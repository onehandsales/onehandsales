// 역할 : GoogleCalendarDisconnectScheduleAction Google Calendar 연결 해제 시 일정 처리 정책을 정의합니다.
export type GoogleCalendarDisconnectScheduleAction = "KEEP" | "HIDE" | "TRASH";

// 역할 : GoogleCalendarSyncTrigger Google Calendar 동기화 실행 출처 값을 정의합니다.
export type GoogleCalendarSyncTrigger = "AUTO" | "MANUAL";
