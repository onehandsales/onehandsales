# G04 BE Cross Module Repository Boundary

상태: Implemented / Verified
영역: BE
우선순위: High

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Backend module 간 repository 직접 import를 줄이고, SOFTWARE_AGENT의 module communication 규칙에 맞게 orchestration/service/port 경계를 정리한다.

## 2. 대상 후보

- `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.ts`
- `BE/src/modules/schedule/infrastructure/persistence/prisma-schedule.repository.ts`
- `BE/src/modules/schedule/infrastructure/persistence/prisma-google-calendar-sync.repository.ts`
- 추가 확인 대상: `BE/src/modules/schedule/infrastructure/persistence/prisma-google-calendar-connection.repository.ts`
- `BE/src/modules/meeting-note/infrastructure/persistence/prisma-meeting-note.repository.ts`
- `BE/src/modules/follow-up/infrastructure/persistence/prisma-follow-up-message.repository.ts`

## 3. 주요 이슈

- Deal/Schedule/Google Calendar persistence가 Notification repository port와 Prisma repository 구현체를 직접 import한다.
- Schedule/MeetingNote/Follow-up persistence가 Deal activity helper 또는 PrismaDealActivityRepository 구현체를 직접 import한다.
- reminder와 activity 기록을 같은 transaction에서 처리하려는 요구가 있으므로 단순 분리는 데이터 정합성을 깨뜨릴 수 있다.

## 4. 포함 범위

- transaction 안에서 필요한 cross-module write를 명시적으로 재설계
- 필요한 경우 module 간 application service 또는 narrow port를 정의
- repository 구현체 직접 import 제거
- 기존 reminder/activity 생성 동작 보존
- transaction rollback 범위 유지
- 관련 테스트 보강

## 5. 제외 범위

- notification/reminder 기능 확장
- activity timeline 신규 기능
- DB schema 변경

## 6. 완료 기준

- 다른 module의 Prisma repository 구현체 직접 import가 제거된다.
- 다른 module repository port 직접 import가 불가피하면 goal 결과에 예외 사유와 대체 계획을 기록한다.
- reminder/activity 관련 기존 spec이 통과한다.

## 7. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

권장 추가 테스트:

- deal application/repository 관련 spec
- schedule application/repository/google calendar sync 관련 spec
- meeting-note repository 관련 spec
- follow-up message repository 관련 spec

## 8. 구현 결과

- reminder 쓰기 최소 계약을 `shared/application/notification/notification-reminder-writer.port.ts`로 분리하고, 같은 Prisma client/transaction client로 동작하는 `PrismaNotificationReminderWriter`를 추가했다.
- Deal/Schedule/Google Calendar repository 구현체에서 `PrismaNotificationRepository` 직접 import와 notification repository port 직접 import를 제거했다.
- deal activity 자동 생성 helper와 최소 writer 계약을 `shared/application/deal/deal-activity-writer.port.ts`로 분리했다.
- Schedule/MeetingNote/Follow-up repository 구현체에서 Deal activity helper와 `PrismaDealActivityRepository` 직접 import를 제거했다.
- Schedule/MeetingNote/Follow-up repository에서 직접 `this.client.deal`, `this.client.dealActivity`, `this.client.dealFollowingActionLog`를 호출하던 대상 흐름을 shared `PrismaDealBoundaryAdapter`로 옮겼다.
- reminder/activity 쓰기는 기존처럼 원본 repository transaction callback 안에서 동일 transaction client로 실행된다.
- 다른 module repository port 직접 import 예외는 남기지 않았다.
- Prisma schema, migration, API 응답 계약은 변경하지 않았다.

## 9. 검증 결과

검증일: 2026-08-11
완료 로그: `TODO_LOG/2026-08-11/G04_BE_CROSS_MODULE_REPOSITORY_BOUNDARY/WORK_LOG.md`

```powershell
cd D:\workspace_repository\onehandsales
rg -n "PrismaNotificationRepository|modules/notification/application/ports/notification.repository" BE/src/modules/deal BE/src/modules/schedule --glob "*.ts" --glob "!**/*.spec.ts"
rg -n "PrismaDealActivityRepository|modules/deal/application/services/deal-activity-helper|modules/deal/infrastructure/persistence/prisma-deal-activity.repository" BE/src/modules/schedule BE/src/modules/meeting-note BE/src/modules/follow-up --glob "*.ts" --glob "!**/*.spec.ts"
rg -n "this\\.client\\.(deal|dealActivity|dealFollowingActionLog|notification)\\b" BE/src/modules/schedule BE/src/modules/meeting-note BE/src/modules/follow-up --glob "*.ts" --glob "!**/*.spec.ts"

cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- prisma-notification-reminder-writer.spec.ts prisma-deal-boundary.adapter.spec.ts prisma-schedule.repository.spec.ts prisma-google-calendar-sync.repository.spec.ts prisma-google-calendar-connection.repository.spec.ts prisma-meeting-note.repository.spec.ts prisma-follow-up-message.repository.spec.ts notification-reminder-scheduling.use-cases.spec.ts deal-application.service.spec.ts schedule-application.service.spec.ts google-calendar-sync.service.spec.ts google-calendar-connection.service.spec.ts
pnpm.cmd test
```

결과:

- 위 3개 boundary 검색에서 G04 대상 cross-module repository 구현체 직접 import와 대상 흐름의 직접 `this.client.*` 호출 결과 없음
- Backend `typecheck` 통과
- Backend `lint` 통과
- G04 관련 spec 12개 suite / 74개 test 통과
- Backend 전체 Jest 98개 suite / 524개 test 통과

추가 검토:

- 2026-08-11 추가 재검토에서 위 3개 boundary 검색 결과가 모두 없음으로 유지됨을 확인했다.
- Backend `typecheck`, `lint`, 전체 Jest 98개 suite / 524개 test를 재실행해 모두 통과했다.
