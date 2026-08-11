# G01 Document Contract Sync

상태: Completed
목표: 09 구현 전 현재 코드와 문서 계약을 대조하고 blocking을 해소한다.

## 1. 목적

G01은 코드 구현보다 구현 전 확인 goal이다. 09 확정 결정이 현재 BE/FE/Prisma/AGENT 문서와 충돌하지 않는지 확인한다.

## 2. 포함 범위

- `BE/prisma/schema.prisma`의 `User`, `AuthSession`, `AuthDevice`, `AiProviderCallLog` 확인
- `BE/src/modules/auth`, `deal`, `schedule`, `meeting-note`, `business-card`, `data-import` 확인
- `FE/user-web/src/app/router/router.tsx`의 core `/app` route 확인
- `FE/admin-web/src/app/router/router.tsx`와 analytics placeholder 상태 확인
- `COMMON/API-SPEC`, `BE-TODO`, `FE-TODO`, `DB-SCHEMA` event 이름 대조
- 11 Admin, `TODO/PADDLE_PLAN`과 09 범위 충돌 확인

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

- [x] 현재 코드의 AuthSession/AuthDevice 구조를 확인했다.
- [x] 현재 코드의 AiProviderCallLog 구조를 확인했다.
- [x] User Web router의 core `/app` route를 확인했다.
- [x] Admin analytics가 09 범위가 아님을 확인했다.
- [x] Billing/paywall/churn reserved 범위가 12와 충돌하지 않는다.
- [x] API-SPEC, BE-TODO, FE-TODO, DB-SCHEMA의 event 이름이 일치한다.
- [x] G02~G08 착수 blocking 질문이 없다.

## 13. 실행 결과

실행일: 2026-07-30
상태: Completed

### 13.1 참조 문서 확인

- `AGENT/UXUI_AGENT/README.md`, `UX_REVIEW_CHECKLIST.md`, `PLANNING/USER_FLOW_AND_SCREENS.md`, `DECISIONS/020_uxui_notion_attio_reference.md`를 확인했다.
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`, `CONVENTION/API_CONTRACT.md`, `CONVENTION/API_SPEC.md`, `CONVENTION/TRANSACTION.md`, `CONVENTION/OBSERVABILITY.md`, `DECISIONS/005_backend_api_function_comment_rule.md`를 확인했다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`, `FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`, `DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`, `COMMON/ERROR.md`를 확인했다.
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`, `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`를 확인했다.
- `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인했다.

### 13.2 현재 코드 대조 결과

- `BE/prisma/schema.prisma`에는 `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`, `ProductAnalyticsEventSource`, `UserActivationStatus`, `ProductAnalyticsTargetType`이 아직 없다. G02에서 새 migration으로 추가하는 계약과 일치한다.
- `User`에는 `timeZone`, `preferredLocale`, `countryCode`, `defaultCurrencyCode`, `authSessions`, `authDevices`, `aiProviderCallLogs`가 있다.
- `AuthSession`은 `authDeviceId`를 갖고 `AuthDevice`와 관계를 맺는다. `CurrentUserContext`에는 `sessionId`와 `timeZone`이 있으므로 G03/G04에서 session/device/timezone 보강이 가능하다.
- `AiProviderCallLog`에는 `userId`, `operation`, `status`, token count, estimated cost, `costCurrency`, `startedAt`, `metadataJson`이 있다. 09 1차 AI usage summary를 기존 table 기반으로 만들 수 있다.
- `BE/src/modules/auth`, `deal`, `schedule`, `meeting-note`, `business-card`, `data-import`, `company`, `contact`, `product`의 application service/use case와 export method가 존재한다. G04에서 server event recorder를 연결할 지점이 있다.
- `FE/user-web/src/app/router/router.tsx`의 보호 `/app` route는 09 routeKey allowlist와 일치한다. `/app/export`, `/app/contacts/scan`, `/app/meeting-notes/new`는 redirect-only로 추적 제외 대상이다.
- `FE/admin-web/src/app/router/router.tsx`에서 `/analytics`는 `/`로 redirect된다. `FE/admin-web/src/pages/analytics/index.tsx`는 placeholder이며 router에 노출되지 않는다.
- `FE/admin-web/src/features/admin-query`에는 후속 Admin query client 후보가 있으나, 현재 Admin router와 Backend 운영 API는 09 범위가 아니다.

### 13.3 문서 동기화 결과

- `BE-TODO/DB-SCHEMA.md`에 `ProductAnalyticsEvent.eventName` runtime allowlist와 `TODO/PADDLE_PLAN` reserved event name 동기화 기준을 추가했다.
- `COMMON/API-SPEC`, `COMMON/EVENT-TAXONOMY.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`, `BE-TODO/DB-SCHEMA.md`가 같은 09 runtime event set을 가리킨다.
- 11 Admin과 `TODO/PADDLE_PLAN` 문서를 확인했고, Admin analytics UI/API와 billing/paywall/churn 최종 흐름은 09 구현 범위와 섞이지 않는다.
- 10 Mobile PWA 문서를 확인했고, PWA 설치, 모바일 권한, 오프라인 draft, push 세부 이벤트는 09 runtime taxonomy에 추가하지 않는다.

### 13.4 검증 기록

- `git status --short`: G01 문서 갱신 전 작업 트리는 clean이었다.
- `rg -n "ProductAnalytics|analytics|AiProviderCallLog|AuthSession|AuthDevice|CurrentUserContext|paywall|churn" BE FE AGENT TODO`: 09 analytics 구현이 아직 없고, 관련 기존 Auth/AI/Admin/Billing 참조가 문서 계약과 충돌하지 않음을 확인했다.
- `pnpm run prisma:validate`: 통과.

### 13.5 Blocking

G02~G08 착수 blocking 질문은 없다.

주의: `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`의 2026-07-10 라우트 스냅샷에는 일부 오래된 메모가 있다. G05 routeKey 구현 시에는 현재 `FE/user-web/src/app/router/router.tsx`와 09 `COMMON/EVENT-TAXONOMY.md` allowlist를 정본으로 사용한다.

### 13.6 재검토 보완

2026-07-30 재검토에서 상위 `README.md`, `COMMON/GOAL-WORK-ORDER.md`, `COMMON/EVENT-TAXONOMY.md`의 G01 완료 상태 추적을 보완했다.

`COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md`와 `COMMON/GOAL-SPECS/G07_AI_USAGE_AND_BILLING_RESERVED.md`에는 `groupBy=DAY` 계산에 필요한 `User.timeZone` 조회 계약을 추가했다. `User` 조회는 timezone 계산용이며 email, phone, displayName 같은 식별 정보 조회/로그를 금지한다.

2026-07-30 추가 재검토에서 `BE-TODO/API-TODO.md`의 recorder 명칭을 `ProductAnalyticsEventRecorder.recordServerEvent`로 통일했다. 또한 G04 구현 시 기존 HTTP controller가 `RequestWithRequestId.requestId`를 application input으로 전달해야 함을 `COMMON/API-SPEC/PRODUCT_ANALYTICS_SERVER_EVENT_CONTRACT.md`, `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`, `COMMON/GOAL-SPECS/G04_SERVER_EVENT_LOGGING.md`, `BE-TODO/API-TODO.md`에 반영했다.
