# User Web TODO

상태: Confirmed
최종 업데이트: 2026-07-22

## 1. 화면 범위

| Route | 역할 |
|---|---|
| `/app/schedules` | 일정 업무 화면. Google 연결 CTA, 선택 calendar 요약, sync 상태, 수동 sync, source badge, hidden Google filter 제공 |
| `/app/schedules/week` | 주간 보고서. Google-origin active schedule과 meeting URL/source badge 표시 |
| `/app/schedules/:scheduleId` | Google-origin schedule 상세, meeting URL 버튼, badge, 로컬 수정 상태, 딜/메모 수정 |
| `/app/settings` | 연동 설정. 연결 상태, 재연결, calendar 선택 관리, 연결 해제 action 제공 |
| `/app/trash` | `SCHEDULE` 휴지통 항목 표시와 복구 |

## 2. API Client/State

- `features/schedule/api`에 Google Calendar API client 추가
- query key:
  - `scheduleQueryKeys.googleStatus()`
  - `scheduleQueryKeys.googleCalendars()`
  - `scheduleQueryKeys.googleSync()`
- mutation:
  - connect start
  - calendar selection save
  - manual sync
  - disconnect
- schedule type 확장:
  - `meetingUrl`
  - `isAllDay`
  - `sourceType`
  - `googleCalendar`
  - `deletedAt`
  - `trashExpiresAt`
- schedule form schema에 `meetingUrl` 추가
- schedule form schema에 `isAllDay` input은 추가하지 않는다.
- schedule list params에 hidden Google schedule filter 추가
- Trash type에 `SCHEDULE` target/domain 추가

## 3. UX 정책

- `/app/schedules` 첫 화면에 연결이 없으면 compact CTA를 둔다. landing/hero/card-heavy 설명 화면을 만들지 않는다.
- 연결 후에는 작은 status row로 마지막 sync, 선택 calendar 수, 수동 sync 버튼을 표시한다.
- calendar 선택은 modal에서 checkbox list로 제공한다.
- primary calendar는 기본 checked다.
- holidays/birthdays 등 system calendar는 list에 표시하지만 기본 checked는 아니다.
- 수동 sync 버튼은 mutation pending 중 disabled 처리한다.
- 수동 sync 성공 또는 실패 응답을 받은 뒤 10초 동안 같은 버튼을 disabled 처리한다.
- 자동 sync는 화면 진입 시 조용히 실행하고 성공 toast를 표시하지 않는다.
- 자동 sync 성공은 toast를 표시하지 않고 status row의 `마지막 동기화 방금 전` 문구만 갱신한다.
- sync 실패는 status row에 `Google Calendar와 연결하지 못했어요. 다시 시도해 주세요.`로 표시한다.
- revoked/reconnect required는 `Google Calendar를 다시 연결해 주세요.` 수준으로 표시하고 내부 error code는 숨긴다.
- meeting URL은 domain label과 external-link icon 버튼으로 표시한다.
- `meetingUrl` 입력/수정은 `https://`만 허용한다.
- `isAllDay=true` schedule은 list/detail/week에서 시간 대신 `종일`을 표시한다.
- 긴 calendar 이름, 일정 제목, URL domain, badge text는 모바일에서 줄바꿈/ellipsis로 겹치지 않게 처리한다.
- source badge 문구:
  - `Google`
  - `Google · 연결 끊김`
  - `Google · 로컬 수정`
  - `Google · 로컬 삭제`
- hidden Google filter 문구:
  - `기본 일정`
  - `숨긴 Google 일정`
  - `전체`
- 일정 삭제 확인 modal title은 `일정을 삭제할까요?`로 둔다.
- 일정 삭제 확인 modal body는 `삭제한 일정은 휴지통으로 이동하며 7일 안에 복구할 수 있어요.`로 둔다.

## 4. 연결 해제 UX

연결 해제 modal은 3개 action을 제공한다.

| action | 기본값 | 사용자 문구 | 결과 |
|---|---:|---|---|
| `KEEP` | 예 | Google 연결만 끊고 일정은 유지 | schedule 표시 유지, badge `Google · 연결 끊김` |
| `HIDE` | 아니오 | Google 연결 끊고 가져온 일정 숨김 | 기본 일정 화면에서 숨김 |
| `TRASH` | 아니오 | Google 연결 끊고 가져온 일정 휴지통으로 이동 | soft delete, 휴지통 복구 대상 |

`TRASH` 선택 시 연결된 딜/메모가 유지되며 휴지통에서 복구된다는 설명을 둔다.

## 5. Google-origin schedule 편집 UX

- 일반 일정과 같은 dialog/detail 편집 흐름을 사용한다.
- Google-origin schedule의 `sourceType`, calendar source, external id는 form에 노출하지 않는다.
- Google-origin all-day schedule도 같은 edit dialog를 사용한다.
- Google-origin all-day schedule에서 사용자가 `startAt` 또는 `endAt`을 수정해 저장하면 저장 후 시간 지정 일정으로 전환되고 `isAllDay=false`, `externalSyncStatus=LOCAL_MODIFIED`가 된다.
- title/time/location/meetingUrl/memo/dealIds 중 하나라도 수정하면 저장 후 badge가 `Google · 로컬 수정`으로 바뀐다.
- memo/dealIds 수정도 허용한다.
- Google description은 최초 import 초안일 뿐이라는 설명을 인앱 장황한 안내로 노출하지 않는다.
- Google로 다시 쓰지 않는다는 제약은 로컬 수정 conflict가 생길 때만 간결하게 안내한다.

## 6. 완료 기준

- 연결 없음/연결됨/재연결 필요/연결 해제 상태가 `/app/schedules`, `/app/settings`에서 모두 정상 표시된다.
- calendar 선택 modal에서 primary 기본 checked와 추가 calendar 선택이 동작한다.
- manual sync 후 schedule list/week/detail cache가 갱신된다.
- Google-origin schedule badge와 meeting URL 버튼이 list/week/detail에 표시된다.
- Google-origin all-day schedule이 list/week/detail에서 `종일`로 표시된다.
- hidden Google filter가 Google 삭제/선택 해제/연결 해제 숨김 schedule을 기본 목록에서 분리한다.
- schedule delete는 휴지통 이동으로 동작하고 `/app/trash`에서 복구된다.
- 모바일/데스크톱에서 text overlap이 없다.

## 7. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```
