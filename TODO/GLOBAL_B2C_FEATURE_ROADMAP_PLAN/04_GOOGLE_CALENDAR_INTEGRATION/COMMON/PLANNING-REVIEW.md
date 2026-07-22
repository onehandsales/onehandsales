# Planning Review

상태: Closed
검토일: 2026-07-22

## 1. 결론

- 판정: 구현 착수 조건 충족
- 이유: 04의 제품 결정, 포함/제외 범위, API 계약, DB schema, FE 작업, goal 순서, 아키텍처/UXUI guardrail, QA 체크리스트가 confirmed 수준으로 정리됐다.
- 구현 상태: 문서 계약 완료. 코드 구현은 G02부터 시작한다.

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 작업 단위 | G01~G05로 분리 |
| 다중 캘린더 | 04부터 calendar 선택 지원. 사용자당 Google 계정 1개, calendar 여러 개 선택 |
| 기본 선택 | primary calendar만 기본 checked |
| system calendar | holidays/birthdays는 표시하지만 기본 checked 아님 |
| import 범위 | 사용자 timezone 기준 오늘 00:00에서 과거 1개월/미래 3개월 |
| sync 방식 | `/app/schedules` 진입 시 10분 freshness 자동 sync + 수동 sync |
| Google export | 제외 |
| 양방향 sync | 제외 |
| 로컬 편집 | Google-origin schedule도 title/time/location/meetingUrl/memo/dealIds 수정 허용 |
| conflict | `LOCAL_MODIFIED`는 Google sync가 로컬 필드를 덮어쓰지 않음 |
| Google description | 최초 import 때만 `Schedule.memo`로 저장 |
| 딜 연결 | 자동 매칭 없음. 사용자가 직접 연결 |
| 참석자 | import/store/contact auto-link 제외 |
| meeting URL | `Schedule.meetingUrl`, `hangoutLink`/video URI/description 첫 `https://`/location `https://` 순서 |
| 위험 URL | `http`, `javascript`, `data`, scheme 없음 차단 |
| 종일 일정 | `Schedule.isAllDay=true`, source timezone day boundary. 사용자가 start/end 수정 시 `isAllDay=false`, `LOCAL_MODIFIED` |
| Google reminders | import 제외 |
| 한손 알림 | Google-origin schedule도 `SCHEDULE_START_REMINDER` 생성/변경/취소 |
| Google 삭제 | hard delete 아님. hidden 상태로 보존 |
| 사용자 삭제 | soft delete/Trash. 진짜 삭제 아님 |
| Trash retention | `createTrashRetentionTimestamps(now)` 기준 `now+7일` |
| 복구 | Google-origin schedule restore는 `LOCAL_MODIFIED` |
| 연결 해제 | `KEEP`, `HIDE`, `TRASH`; 기본 `KEEP` |
| Badge | `Google`, `Google · 연결 끊김`, `Google · 로컬 수정`, `Google · 로컬 삭제` |
| OAuth return | `/app/schedules`, `/app/settings` allowlist |
| OAuth scope | `openid`, `email`, `https://www.googleapis.com/auth/calendar.readonly` |
| Google account id | ID token `sub`를 `providerAccountId`로 저장하고 response에는 노출하지 않음 |
| Sync lock | `ExternalCalendarConnection.syncLockExpiresAt=now+5분`, active lock은 409 |
| UI 위치 | `/app/schedules`와 `/app/settings` 양쪽 |
| DB migration | 허용 |
| 기존 Schedule API | `meetingUrl`, source metadata, soft delete 반영 |
| Done 기준 | 자동 테스트/코드 검증. 실제 Google smoke는 Done blocker가 아니며 G05에서 실행 여부 기록 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `COMMON/REFERENCES.md`

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| Provider boundary | Google provider 호출은 adapter/port로 격리한다. |
| Token security | access/refresh token은 AES-GCM envelope string으로 암호화 저장. key env는 `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY` 우선, 없으면 `ENCRYPTION_MASTER_KEY` |
| Event mapping | mapping table 없이 `Schedule`에 external metadata를 둔다. |
| Schedule delete | Google 연동과 무관하게 모든 Schedule 삭제를 soft delete로 변경한다. |
| Reminder | Google reminders는 쓰지 않고 한손 알림 시스템을 재사용한다. |
| Hidden state | Google 삭제/선택 해제/숨김 disconnect는 기본 일정 화면에서 제외하고 필터로만 본다. |
| Local modified | 사용자 로컬 편집을 보호하기 위해 provider overwrite를 막는다. |
| Meeting URL | UXUI schedule meeting link 결정에 맞춰 `Schedule.meetingUrl` 필드와 버튼을 둔다. |
| Google Events.list | full sync는 `timeMin/timeMax/orderBy=startTime`, incremental sync는 `syncToken`만 사용하고 `timeMin/timeMax/orderBy`를 보내지 않는다. |
| Scope control | 반복 일정 정식 모델, 참석자, webhook, export는 04에서 제외한다. |

## 5. 미해결 Critical/Major

없음.

## 6. 구현 중 주의

- OAuth callback route는 Bearer token 대신 signed state로 user를 식별한다.
- OAuth callback은 ID token의 `iss`, `aud`, `exp`, `sub`, `email`, `email_verified=true`를 검증한다.
- `@Get("google/...")` 계열 route는 `@Get(":scheduleId")`보다 먼저 매칭되도록 둔다.
- provider 호출은 DB transaction 밖에서 수행한다.
- migration 후 기존 schedule row가 모두 `INTERNAL`로 정상 동작해야 한다.
- Schedule hard delete method가 남아 있으면 안 된다.
- Trash `SCHEDULE` 추가가 기존 target type filter를 깨지 않아야 한다.
- Google-origin schedule의 memo/dealIds가 sync로 사라지면 안 된다.
- hidden Google schedule이 home/upcoming/week/export에 섞이면 안 된다.
- 실제 Google env가 없으면 provider adapter test double로 자동 테스트를 닫는다.

## 7. 사용자의 추가 결정이 필요한 질문

현재 G01~G05 구현 착수를 막는 질문은 없다.

04 범위 밖에서 사용자 결정/goal로 확정할 항목:

- 반복 일정 정식 모델
- Google export/양방향 sync
- Google webhook/watch
- 참석자 import와 Contact auto-link
- 여러 Google 계정 동시 연결
- Admin provider failure 운영 화면
- Product analytics taxonomy
- 실제 Google OAuth app 배포/검수 세부

## 8. 구현 시작 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
