# G04 BE Cross Module Repository Boundary

상태: Draft
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
