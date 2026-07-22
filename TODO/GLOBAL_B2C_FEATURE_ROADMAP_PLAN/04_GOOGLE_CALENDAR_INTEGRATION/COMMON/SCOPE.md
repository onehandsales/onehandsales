# Scope

상태: Confirmed
확정일: 2026-07-22

## 1. 포함 범위

| 항목 | 내용 |
|---|---|
| Calendar connection | Google login OAuth와 분리된 Calendar scope 연결, callback, 재연결, 연결 해제 |
| Multi-calendar selection | 기본 캘린더는 기본 선택하고, 사용자가 추가 Google calendar를 선택할 수 있게 한다. |
| Read-only provider sync | Google Calendar event를 한손 `Schedule`로 가져온다. Google로 내보내지 않는다. |
| Auto/manual sync | `/app/schedules` 진입 시 10분 freshness 기준 자동 sync, 사용자가 누르는 수동 sync 버튼 |
| Sync range | 사용자 timezone 기준 오늘 00:00에서 과거 1개월, 미래 3개월까지 가져온다. |
| Source metadata | `Schedule`에 Google source, external event id, sync status, source calendar를 저장한다. |
| All-day import | Google all-day event는 `Schedule.isAllDay=true`와 source timezone day boundary로 저장한다. |
| Local edit | Google-origin schedule의 제목/시간/장소/meetingUrl/memo/dealIds 수정 허용 |
| Memo import | Google description을 최초 import 때 한손 `Schedule.memo` 초안으로 저장 |
| Meeting URL | Google event에서 `hangoutLink`, video conference URI, description 첫 `https://` URL, location `https://` URL 순서로 `Schedule.meetingUrl`에 저장하고 UI에서 버튼으로 표시 |
| Reminder | Google-origin schedule도 한손 `SCHEDULE_START_REMINDER` 생성/변경/취소 흐름에 포함 |
| Soft delete | 모든 Schedule 삭제를 hard delete에서 `deletedAt/trashExpiresAt` soft delete로 변경 |
| Trash restore | `/api/trash`와 `/app/trash`에 `SCHEDULE` target type과 restore를 추가 |
| Disconnect action | 연결 해제 시 `KEEP`, `HIDE`, `TRASH` 중 선택. 기본값은 `KEEP` |
| Failure handling | revoked/invalid_grant는 `RECONNECT_REQUIRED`, transient error는 sync 실패 상태로 표시 |

## 2. 제외 범위

| 항목 | 이유 |
|---|---|
| Google export | 04는 Google read-only import다. 한손 수정 내용을 Google에 쓰지 않는다. |
| 양방향 sync | 04에서 제외한다. Google write/export를 시작하는 goal에서 계약을 만든다. |
| Google push webhook/watch | 04는 수동/진입 시 freshness sync로 충분하다. |
| 반복 일정 정식 모델 | 04에서 제외한다. 04는 Google recurring event를 `singleEvents=true` instance row로 저장한다. |
| 참석자 import | 04에서는 저장하지 않고 Contact auto-link도 하지 않는다. |
| Google reminders import | Google 알림은 가져오지 않고 한손 알림 정책만 적용한다. |
| Google Calendar 외 provider | Google 이후 확장한다. |
| 여러 Google 계정 동시 연결 | 04는 사용자당 Google Calendar connection 1개로 시작한다. |
| Admin provider failure log | 04에서 제외한다. 사용자-facing 실패 처리는 04 status row/error code까지만 구현한다. |
| Product analytics taxonomy | 04에서는 structured operation log만 남긴다. |

## 3. 확정 사용자 결정

| 번호 | 결정 |
|---:|---|
| 1 | 04부터 여러 calendar 선택을 지원하되, 작업 단위는 connection/list/sync/FE/QA로 나눈다. |
| 2 | 기본 캘린더만 기본 선택하고 사용자가 추가 캘린더를 고른다. |
| 3 | Google-origin schedule도 로컬 편집을 허용한다. 로컬 편집 상태는 `Google · 로컬 수정`으로 표시한다. |
| 4 | 일정이 지저분해지지 않도록 선택 해제/Google 삭제/연결 해제 schedule은 기본 화면에서 숨기고 필터로만 본다. |
| 5 | 연결 해제 기본 동작은 가져온 일정을 유지하는 것이다. 사용자는 숨김/휴지통 이동 선택지도 받는다. |
| 6 | 삭제는 진짜 삭제가 아니라 soft delete/Trash다. |
| 7 | Badge 문구는 `Google`, `Google · 연결 끊김`, `Google · 로컬 수정`, `Google · 로컬 삭제`로 간결하게 둔다. |
| 8 | Google description은 최초 import 시 한손 `Schedule.memo`에 연결한다. 이후 sync는 memo를 덮어쓰지 않는다. |
| 9 | 딜 연결은 자동 매칭하지 않고 사용자가 직접 연결한다. |
| 10 | 참석자는 가져오지 않는다. |
| 11 | meeting URL은 `Schedule.meetingUrl` 필드로 둔다. 추출 우선순위의 첫 안전 `https://` URL만 저장하고 위험 scheme은 차단한다. |
| 12 | Google reminders는 가져오지 않고, 한손 일정 알림에 추가한다. |
| 13 | sync range는 사용자 timezone 기준 오늘 00:00에서 과거 1개월, 미래 3개월이다. |
| 14 | calendar 선택 해제 시 기존 schedule은 숨김/보존하고 재선택하면 sync를 재개한다. |
| 15 | revoked/invalid_grant는 재연결 필요 상태로 두고 기존 active Google schedule은 `Google · 연결 끊김`으로 계속 보여준다. |
| 16 | OAuth callback은 시작 화면으로 돌아온다. 허용 returnTo는 `/app/schedules`, `/app/settings`다. |
| 17 | UI는 `/app/schedules`와 `/app/settings` 양쪽에 둔다. |
| 18 | DB migration을 허용한다. |
| 19 | 기존 일정 생성/수정/삭제 API도 `meetingUrl`, Google source 상태, Schedule soft delete를 반영해 조정한다. |

## 4. 비즈니스 규칙

- Google OAuth scope는 login scope와 분리해 요청한다.
- Google Calendar OAuth scope는 `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly`로 고정한다.
- 04에서 Google Calendar connection은 사용자당 1개다.
- Google Calendar API에서 calendar list를 가져올 때 primary calendar를 checked로 제안하고, holidays/birthdays 같은 system calendar는 목록에 표시하지만 기본 checked로 두지 않는다.
- Google CalendarList.list는 `maxResults=250`, `showDeleted=false`, `showHidden=true`로 모든 page를 조회한다.
- 선택된 calendar만 sync한다.
- calendar 선택 해제 시 해당 source의 schedule은 default schedule list/week report/home upcoming에서 제외한다.
- Google event가 cancelled/deleted면 schedule row를 물리 삭제하지 않고 `GOOGLE_DELETED` 상태로 보존한다.
- 사용자가 Google-origin schedule을 삭제하면 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 채우고 reminder를 취소한다.
- `trashExpiresAt`은 `createTrashRetentionTimestamps(now)` 기준이며 현재 `now+7일`이다.
- Trash에서 Google-origin schedule을 복구하면 `LOCAL_MODIFIED` 상태로 복구하고 reminder를 다시 계산한다.
- `SYNCED` 상태 schedule만 Google 변경으로 title/time/location/meetingUrl/isAllDay를 갱신한다.
- `LOCAL_MODIFIED` schedule은 Google sync가 로컬 title/time/location/meetingUrl/isAllDay/memo/dealIds를 덮어쓰지 않는다.
- Google all-day event는 `Schedule.isAllDay=true`로 저장하고 list/detail/week에서 `종일`로 표시한다.
- Google-origin all-day schedule에서 사용자가 start/end를 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`로 전환한다.
- Google description은 최초 import 때만 memo에 들어간다. 사용자가 memo를 지우거나 바꾼 뒤에는 Google description으로 다시 채우지 않는다.
- Google meeting link는 추출 우선순위의 첫 안전 `https://` URL만 저장한다. 직접 입력/수정도 같은 validation을 적용한다.
- meeting URL 추출 우선순위는 `hangoutLink`, video `conferenceData.entryPoints[].uri`, description의 첫 `https://` URL, location 전체값이 `https://` URL인 경우 순서다.
- sync 중복 실행은 `ExternalCalendarConnection.syncLockExpiresAt=now+5분`으로 막고, lock이 살아 있으면 409 `GoogleCalendarSyncInProgress`를 반환한다.
- 과거 일정은 reminder를 만들지 않는다.
- hidden/deleted Google schedule은 pending reminder를 취소한다.

## 5. 완료 기준

- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`와 구현이 일치한다.
- Google connection/status/list/sync/disconnect API가 있다.
- 기존 schedule create/update/list/delete API가 확장 계약과 일치한다.
- Schedule soft delete와 Trash restore가 동작한다.
- Google-origin schedule badge와 hidden/filtered state가 FE에 표시된다.
- Google-origin schedule도 onehand schedule reminder가 생성/변경/취소된다.
- 실제 Google provider smoke를 제외한 자동 테스트와 build/typecheck/lint가 통과한다.
- provider token, raw event body, Google description 원문 전체를 log에 남기지 않는다.
