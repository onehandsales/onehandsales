# 04 Google Calendar Integration

상태: Goal Ready
순서: 04
성격: Google Calendar read-only import + 한손 일정 운영 UX
결정 상태: 2026-07-22 사용자 결정 반영 완료
구현 기준: `COMMON/GOAL-WORK-ORDER.md`

## 1. 목적

사용자가 Google Calendar와 연결해 외부 일정을 한손 일정으로 가져오고, 가져온 일정을 딜/메모/알림과 함께 영업 업무 흐름 안에서 관리할 수 있게 한다.

## 2. 현재 상태

- 일정 CRUD와 월/주 calendar view는 구현되어 있다.
- 현재 일정 생성/수정은 `memo`, `dealIds`를 지원한다.
- 현재 일정 삭제는 hard delete다. 04에서 `Schedule`도 휴지통 기반 soft delete로 바꾼다.
- 현재 `Schedule`에는 Google source, external event id, meeting URL, `deletedAt`, `trashExpiresAt`이 없다.
- 현재 알림에는 `SCHEDULE_START_REMINDER`가 있고, 일정 생성/수정/삭제 시 reminder 생성/취소 use case가 연결되어 있다.
- 현재 Google login OAuth와 Calendar 연결 scope는 분리되어야 한다.

## 3. 확정 범위

포함:

- Google Calendar OAuth 연결, 재연결, 연결 해제
- 기본 캘린더 우선 선택 + 사용자가 추가 캘린더 선택
- 선택된 Google Calendar event read-only import/sync
- `/app/schedules` 진입 시 10분 freshness 기준 자동 sync
- 수동 sync 버튼
- Google schedule source badge
- Google description을 최초 import 때 한손 `Schedule.memo` 초안으로 저장
- Google event에서 `hangoutLink`, video conference URI, description 첫 `https://` URL, location `https://` URL 순서로 `Schedule.meetingUrl` 저장
- Google all-day event를 `Schedule.isAllDay=true`로 저장하고 UI에서 `종일` 표시
- Google schedule에 딜 연결과 한손 메모 수정 허용
- Google schedule의 로컬 제목/시간/장소/meetingUrl 수정 허용
- Google 삭제/취소/캘린더 선택 해제 시 기본 목록에서 숨기고, 연결 해제 `KEEP` 시 `Google · 연결 끊김` 상태 표시
- 모든 Schedule 삭제를 휴지통 기반 soft delete로 변경
- Schedule 복구 API/UX를 `/app/trash`에 추가
- 한손 `SCHEDULE_START_REMINDER` 알림을 Google-origin schedule에도 적용

제외:

- Google로 일정 export
- 양방향 sync
- 실시간 push webhook/watch channel
- 반복 일정 정식 모델
- 참석자 import/contact auto-link
- Google reminders import
- Google Calendar 외 provider
- 여러 Google 계정 동시 연결
- Admin 운영 화면과 provider failure admin log

## 4. 확정 정책 요약

| 항목 | 결정 |
|---|---|
| Calendar 선택 | primary calendar만 기본 선택. 사용자는 calendar 선택 modal에서 추가 캘린더를 선택한다. |
| Sync range | 사용자 timezone 기준 오늘 00:00에서 과거 1개월, 미래 3개월. local boundary를 UTC로 변환한다. |
| 자동 sync | `/app/schedules` 진입 시 마지막 성공/시도 기준 10분 이상 지났으면 실행한다. |
| 수동 sync | 사용자가 즉시 실행한다. FE는 pending 중과 응답 후 10초 동안 버튼을 disabled 처리하고, BE는 `syncLockExpiresAt=now+5분` lock으로 중복 실행을 409 처리한다. |
| Google description | 최초 import 때 HTML 제거/정규화 후 `Schedule.memo`에 저장한다. 이후 sync는 memo를 덮어쓰지 않는다. |
| Meeting URL | `hangoutLink`, video conference URI, description의 첫 `https://` URL, location의 `https://` URL 순서로 가져온다. `http`, `javascript`, `data` 등은 차단한다. |
| 종일 일정 | Google all-day event는 source timezone local 00:00 boundary로 저장하고 `isAllDay=true`로 표시한다. 사용자가 시간을 수정하면 `isAllDay=false`, `LOCAL_MODIFIED`가 된다. |
| 로컬 편집 | Google-origin schedule도 title/time/location/meetingUrl/memo/dealIds 수정을 허용한다. 허용된 필드 중 하나라도 수정하면 `LOCAL_MODIFIED`가 된다. source 필드는 수정 request를 400 처리한다. |
| Conflict | `SYNCED`만 Google 변경으로 title/time/location/meetingUrl/isAllDay를 갱신한다. `LOCAL_MODIFIED`는 Google 변경이 로컬 필드를 덮어쓰지 않는다. |
| Google 삭제 | 기본 일정 화면에서는 숨기고 `GOOGLE_DELETED` 상태로 보존한다. |
| 사용자 삭제 | `deletedAt/trashExpiresAt` soft delete로 휴지통에 보낸다. `trashExpiresAt`은 현재 `now+7일`이다. 진짜 삭제가 아니다. |
| 복구 | Google-origin schedule 복구 시 `LOCAL_MODIFIED`로 복구하고 Google sync가 덮어쓰지 않는다. |
| 연결 해제 | 기본값은 유지. 사용자는 `KEEP`, `HIDE`, `TRASH` 중 선택한다. `TRASH`도 hard delete가 아니다. |
| 알림 | Google reminders는 가져오지 않는다. 한손 일정 알림 설정으로 `SCHEDULE_START_REMINDER`를 만든다. |
| OAuth return | 시작 화면으로 돌아온다. 허용 returnTo는 `/app/schedules`, `/app/settings`다. |
| 완료 판정 | 자동 테스트와 코드 검증으로 Done 처리. 실제 Google provider smoke는 Done blocker가 아니며 G05에서 실행 여부와 미실행 사유를 기록한다. |

## 5. 구현 문서

- Scope: `COMMON/SCOPE.md`
- API 계약: `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`
- Backend API TODO: `BE-TODO/API-TODO.md`
- DB Schema TODO: `BE-TODO/DB-SCHEMA.md`
- User Web TODO: `FE-TODO/USER-WEB-TODO.md`
- Goal 실행 순서: `COMMON/GOAL-WORK-ORDER.md`
- Goal 완료 체크리스트: `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- Goal 상세 명세: `COMMON/GOAL-SPECS/*`
- Planning review: `COMMON/PLANNING-REVIEW.md`
- Review checklist: `COMMON/REVIEW-CHECKLIST.md`

## 6. 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
