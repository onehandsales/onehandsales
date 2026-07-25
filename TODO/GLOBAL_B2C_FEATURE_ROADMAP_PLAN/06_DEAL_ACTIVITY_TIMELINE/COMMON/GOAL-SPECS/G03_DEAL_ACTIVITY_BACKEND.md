# G03 Deal Activity Backend

상태: Ready
목표: DealActivity API와 자동 생성 Backend 구현

## 1. 목적

`COMMON/API-SPEC/DEAL_ACTIVITY_API.md` 기준으로 딜 activity timeline Backend를 구현한다.

## 2. 선행 조건

- G02 완료

## 3. 포함 범위

- `GET /api/deals/:dealId/activities`
- `POST /api/deals/:dealId/activities`
- `PATCH /api/deals/:dealId/activities/:activityId`
- 자동 activity 생성 port/service
- 딜 생성/단계 변경 activity
- 다음 행동 생성/완료 변경 activity
- 일정 연결/해제 activity
- 회의록 연결/해제 activity
- follow-up 발송 성공/실패 activity
- `COMMON/BUSINESS-LOGIC.md`의 ownership, transaction, redaction, safe summary 규칙 반영
- 회의록 relation delete/recreate 구현의 삭제 전 diff 계산
- follow-up `DEAL` target message만 딜 activity로 기록
- unit/controller/application/repository test

## 4. 제외 범위

- 수동 activity 삭제
- 자동 activity 수정/삭제
- 메모 activity 통합
- 목록 summary API
- Frontend 구현

## 5. Transaction 기준

- 본 mutation과 activity 생성은 같은 transaction에 묶는다.
- 기존 repository의 `runInTransaction` 패턴을 우선 사용한다.
- 외부 provider 호출은 transaction 밖에서 수행하고, provider 결과 저장 transaction에서 follow-up activity를 만든다.

## 6. Logging 기준

필수 event key 후보:

- `deal.activity.listed`
- `deal.activity.manual_created`
- `deal.activity.manual_updated`
- `deal.activity.auto_created`

Logging 금지:

- activity title/body 원문
- follow-up body
- meeting note details/rawText
- private memo
- provider raw response

## 7. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- deal
pnpm run test -- follow-up
pnpm run test -- schedule
pnpm run test -- meeting-note
pnpm run build
```

## 8. 완료 기준

- API spec과 route/controller/DTO가 일치한다.
- 자동 activity가 지정된 trigger에서 생성된다.
- 다른 사용자의 activity 접근이 차단된다.
- 자동 activity 수정 시도는 안전한 error로 막힌다.
- timeline cursor가 opaque string으로 동작한다.
- linked record `targetPath`가 `/app/*` User Web route로 정규화된다.
- redaction test가 있다.
