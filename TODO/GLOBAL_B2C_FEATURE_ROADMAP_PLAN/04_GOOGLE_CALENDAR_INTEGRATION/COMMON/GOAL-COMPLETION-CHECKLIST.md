# Goal Completion Checklist

상태: Active
최종 업데이트: 2026-07-23

## 1. 목적

04 Google Calendar Integration의 `/goal` 실행 완료 여부를 한눈에 확인하기 위한 체크리스트다.

`COMMON/REVIEW-CHECKLIST.md`는 G05 QA 검증표이고, 이 문서는 G01~G05 진행 상태판이다.

## 2. 사용 규칙

- 각 `/goal`을 시작하기 전에 이 문서를 확인한다.
- goal 완료 조건이 충족되면 해당 항목을 `[x]`로 바꾼다.
- 체크할 때 `완료일`, `증거`, `비고`를 함께 갱신한다.
- 검증 명령을 실행하지 못했으면 체크하지 않거나, G05처럼 허용된 예외만 비고에 미실행 사유를 적는다.
- 코드 구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다.
- 실제 Google provider smoke는 Done blocker가 아니며, G05에서 실행 여부와 미실행 사유를 기록한다.

## 3. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Planning API DB Contract | Done | 2026-07-23 | 문서 계약과 현재 코드 사실을 대조하고, G02~G05 착수 blocking 질문이 없음을 확인한다. | G01 `rg ...` 검색, `git diff --check` 통과 | API spec token encryption missing-key 계약 보정 |
| [x] | G02 Backend DB Google Connection | Done | 2026-07-23 | DB foundation, Schedule soft delete, Trash `SCHEDULE`, connection/status/connect/callback/disconnect API가 spec과 일치한다. | `prisma:validate`, `prisma:migrate --name google_calendar_integration`, `typecheck`, `lint`, `test -- schedule`, `test -- notification`, `test -- trash`, `build` 통과 | 실제 Google provider smoke는 G05에서 실행 여부를 기록한다. |
| [ ] | G03 Backend Calendar List Sync | Ready | - | calendar list/selection/sync, Google event mapping, 기존 Schedule/Weekly API 확장이 spec과 일치한다. | - | selected calendar only, `LOCAL_MODIFIED`, all-day, reminder 테스트가 필요하다. |
| [ ] | G04 User Web Google Calendar UX | Ready | - | `/app/schedules`, `/app/settings`, detail/week/trash UX가 FE TODO와 API 계약에 맞게 연결된다. | - | desktop/mobile text overlap 확인이 필요하다. |
| [ ] | G05 QA Review Closeout | Ready | - | `COMMON/REVIEW-CHECKLIST.md` critical 항목과 BE/FE 검증 명령이 완료되고 문서 상태가 갱신된다. | - | 실제 Google smoke 실행 여부 또는 미실행 사유를 기록한다. |

## 4. Goal별 체크 조건

### G01 Planning API DB Contract

- [x] `COMMON/SCOPE.md`, `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`, `COMMON/ARCHITECTURE-GUARDRAILS.md`를 재확인했다.
- [x] 현재 `Schedule`, `Trash`, `Notification`, User Web schedule/settings 구조를 확인했다.
- [x] API path, enum, 상태명, badge 문구, error code 충돌이 없다.
- [x] 현재 코드와 충돌하는 부분은 구현해야 할 변경으로 문서에 명시되어 있다.
- [x] G02~G05 구현 착수를 막는 질문이 없다.
- [x] G01 검증 검색과 `git diff --check`를 실행했다.

### G02 Backend DB Google Connection

- [x] Prisma enum/model/field/migration이 추가됐다.
- [x] 기존 Schedule row가 `INTERNAL`로 호환된다.
- [x] `DELETE /api/schedules/:scheduleId`가 soft delete로 바뀌었다.
- [x] Trash `SCHEDULE` list/detail/restore가 동작한다.
- [x] Google connect/callback/status/disconnect API가 spec과 일치한다.
- [x] token/code/raw provider body가 log/response/test snapshot에 노출되지 않는다.
- [x] BE 검증 명령을 실행했다.

### G03 Backend Calendar List Sync

- [ ] calendar list/selection API가 primary default selected와 system calendar default unselected 정책을 지킨다.
- [ ] selected calendar만 sync한다.
- [ ] full/incremental Events.list parameter가 분리되어 있다.
- [ ] syncToken 410 fallback이 동작한다.
- [ ] duplicate import가 방지된다.
- [ ] `LOCAL_MODIFIED` schedule을 provider sync가 덮어쓰지 않는다.
- [ ] Google deleted/cancelled schedule이 hidden 상태로 보존된다.
- [ ] description 최초 import, meeting URL 추출, all-day mapping이 동작한다.
- [ ] Schedule list/detail/week/export response가 확장됐다.
- [ ] BE 검증 명령을 실행했다.

### G04 User Web Google Calendar UX

- [ ] schedule API client/type/schema/query key가 확장됐다.
- [ ] `/app/schedules`에 connection/status/manual sync/hidden filter가 연결됐다.
- [ ] `/app/settings`에 reconnect/manage calendars/disconnect가 연결됐다.
- [ ] calendar selection modal이 동작한다.
- [ ] OAuth redirect result를 시작 화면에서 처리한다.
- [ ] meeting URL 표시/수정/validation이 동작한다.
- [ ] source badge 4종 문구가 확정값과 일치한다.
- [ ] Google-origin all-day schedule이 `종일`로 표시된다.
- [ ] `/app/trash`에서 `SCHEDULE` 복구가 동작한다.
- [ ] FE 검증 명령과 desktop/mobile 수동 확인을 실행했다.

### G05 QA Review Closeout

- [ ] Backend QA 항목을 확인했다.
- [ ] Frontend QA 항목을 확인했다.
- [ ] Security/Privacy QA 항목을 확인했다.
- [ ] `COMMON/REVIEW-CHECKLIST.md` 체크 결과를 반영했다.
- [ ] README, goal spec, planning review, 상위 roadmap 상태를 구현 결과와 맞췄다.
- [ ] 실제 Google provider smoke 실행 여부와 미실행 사유를 기록했다.

## 5. 완료 시 업데이트 예시

```markdown
| [x] | G01 Planning API DB Contract | Done | 2026-07-23 | ... | `rg ...`, `git diff --check` 통과 | blocking 질문 없음 |
```
