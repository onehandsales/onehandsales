# G01 Document Contract Sync

상태: Ready
목표: 09 구현 전 현재 코드와 문서 계약을 대조하고 blocking을 해소한다.

## 1. 목적

G01은 코드 구현보다 구현 전 확인 goal이다. 09 확정 결정이 현재 BE/FE/Prisma/AGENT 문서와 충돌하지 않는지 확인한다.

## 2. 포함 범위

- `BE/prisma/schema.prisma`의 `User`, `AuthSession`, `AuthDevice`, `AiProviderCallLog` 확인
- `BE/src/modules/auth`, `deal`, `schedule`, `meeting-note`, `business-card`, `data-import` 확인
- `FE/user-web/src/app/router/router.tsx`의 core `/app` route 확인
- `FE/admin-web/src/app/router/router.tsx`와 analytics placeholder 상태 확인
- `COMMON/API-SPEC`, `BE-TODO`, `FE-TODO`, `DB-SCHEMA` event 이름 대조
- 11 Admin, 12 Billing과 09 범위 충돌 확인

## 3. 제외 범위

- Prisma schema 변경
- Backend endpoint 구현
- Frontend wrapper 구현
- 대량 코드 변경

## 4. 작업

1. 09 결정 로그와 현재 코드 구조를 대조한다.
2. `AuthSession`/`AuthDevice`를 analytics 식별에 재사용할 수 있는지 확인한다.
3. `AiProviderCallLog`를 AI usage 1차 집계에 사용할 수 있는지 확인한다.
4. User Web routeKey allowlist가 실제 router와 맞는지 확인한다.
5. Admin analytics가 11 범위로 남아 있는지 확인한다.
6. Billing/paywall/churn reserved taxonomy가 12 범위를 침범하지 않는지 확인한다.
7. G02~G08 착수 blocking 질문이 있으면 문서에 남긴다.

## 5. Request 계약

G01은 구현 goal이 아니므로 신규 request를 만들지 않는다.

검토해야 할 request 문서:

- `COMMON/API-SPEC/PRODUCT_ANALYTICS_EVENT_API.md`
- `COMMON/API-SPEC/PRODUCT_ANALYTICS_SERVER_EVENT_CONTRACT.md`
- `COMMON/API-SPEC/PRODUCT_ANALYTICS_SNAPSHOT_CONTRACT.md`
- `COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md`

## 6. Response 계약

G01은 신규 response를 만들지 않는다.

검토 기준:

- API spec의 response 예시가 현재 FE/BE 타입 방향과 충돌하지 않아야 한다.
- 내부 contract는 caller가 analytics failure를 제품 failure로 전파하지 않는 형태여야 한다.

## 7. Business Logic

- 자체 DB event log를 정본으로 둔다.
- activation 기준은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`이다.
- server event는 핵심 성공 결과의 정본이다.
- client event는 core route view 보조 정보다.
- payload allowlist와 PII 금지 기준을 유지한다.

## 8. User Flow

- `COMMON/USER-FLOW.md`의 로그인, 딜 생성, 일정/회의록 연결, retention, AI usage 흐름이 현재 route/use case와 맞는지 확인한다.
- 사용자에게 analytics 실패 UI가 보이지 않는 흐름을 유지한다.

## 9. DB/Prisma 영향

G01은 DB를 변경하지 않는다.

필수 확인:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- 기존 schema의 `/// 기능 : ...` 주석 스타일
- 기존 migration의 `-- 기능 : ...`, `COMMENT ON ...` 스타일

## 10. 코드 주석 기준

G01은 코드 구현 goal이 아니므로 신규 코드 주석은 없다. G02 이후 구현 시 한국어 주석 규칙을 적용한다.

## 11. 검증

```powershell
rg -n "ProductAnalytics|analytics|AiProviderCallLog|AuthSession|AuthDevice|CurrentUserContext|paywall|churn" BE FE AGENT TODO
```

```powershell
cd BE
pnpm run prisma:validate
```

## 12. Goal 검토 체크리스트

- [ ] 현재 코드의 AuthSession/AuthDevice 구조를 확인했다.
- [ ] 현재 코드의 AiProviderCallLog 구조를 확인했다.
- [ ] User Web router의 core `/app` route를 확인했다.
- [ ] Admin analytics가 09 범위가 아님을 확인했다.
- [ ] Billing/paywall/churn reserved 범위가 12와 충돌하지 않는다.
- [ ] API-SPEC, BE-TODO, FE-TODO, DB-SCHEMA의 event 이름이 일치한다.
- [ ] G02~G08 착수 blocking 질문이 없다.
