# G05 Follow-up DB Provider Ports

상태: Ready
완료일:

## 1. 목적

Follow-up delivery용 DB migration, Prisma model, email/SMS provider port, token/phone encryption, safe error mapper foundation을 구현한다.

## 2. 선행 조건

- G02와 G03이 완료되어 05-A report/suggestion schema가 존재한다.
- `BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`를 먼저 읽는다.
- `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`를 먼저 읽는다.
- `COMMON/FOLLOW_UP_DELIVERY_BUSINESS-LOGIC.md`를 먼저 읽는다.

## 3. 포함 범위

- `ExternalEmailConnection`
- `ExternalEmailOAuthState`
- `SmsSenderNumber`
- `FollowUpConsentNotice`
- `FollowUpMessage`
- `FollowUpMessageTarget`
- `FollowUpDeliveryAttempt`
- email provider port
- SMS provider port
- token/phone encryption helper 연결
- safe error mapper
- redaction test

## 4. 제외 범위

- OAuth endpoint controller
- follow-up send endpoint controller
- User Web 설정/compose 화면
- 실제 provider smoke

## 5. DB 작업

- Gmail/Microsoft OAuth token은 암호화 저장한다.
- OAuth state는 `stateHash`, `expiresAt`, `consumedAt`, `userId`로 재사용을 막는다.
- SMS 발신번호는 hash/ciphertext/masked value를 분리한다.
- `FollowUpMessage.body`는 영구 보관하지만 structured log redaction 대상이다.
- `FollowUpDeliveryAttempt.detailJson`에는 provider raw response, token, 본문을 넣지 않는다.
- 비용은 내부 추적 field에 저장한다.

## 6. Error/Observability

- provider raw error는 safe error code/message로 변환한다.
- token, code, phone 원문, subject/body, provider raw response logging 금지

## 7. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run test -- follow-up
```

## 8. 완료 기준

- 05-B migration과 Prisma model이 생성된다.
- provider port 단위 테스트 또는 mapper 테스트가 있다.
- G06과 G07이 이 DB/model/port를 그대로 사용할 수 있다.

## 9. 작업 로그 경로

- `TODO_LOG/<date>/G05_FOLLOW_UP_DB_PROVIDER_PORTS/WORK_LOG.md`
