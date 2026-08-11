# G05 User Web Client Events

상태: Completed
목표: User Web core `/app` route view client event wrapper를 구현한다.

## 1. 목적

G05는 사용자가 로그인 후 어떤 core 업무 화면을 보는지 측정한다. 새 UI를 만들지 않고 route tracking wrapper만 추가한다.

## 2. 포함 범위

- `features/analytics` FE feature 생성
- analytics API client
- routeKey mapper
- route view hook/wrapper
- AppShell 연결
- `VITE_PRODUCT_ANALYTICS_ENABLED` runtime flag
- 환경 변수 정본 문서 갱신
- FE typecheck/lint/build 검증

## 3. 제외 범위

- Server mutation success event FE 중복 전송
- Public/auth route tracking
- UTM/ad attribution
- Paywall/coupon/referral/churn event
- 사용자-facing analytics UI

## 4. 작업

1. `FE/user-web/src/features/analytics` 폴더를 만든다.
2. `trackAnalyticsEvent` API client를 만든다.
3. route path를 routeKey allowlist로 변환하는 mapper를 만든다.
4. `useAppRouteAnalytics` hook을 만든다.
5. `FE/user-web/src/lib/env.ts`에 `productAnalyticsEnabled`를 추가한다.
6. `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`의 User Web 환경 변수 목록에 `VITE_PRODUCT_ANALYTICS_ENABLED`를 추가한다.
7. `FE/user-web/src/components/layout/app-shell.tsx`에 hook을 한 번만 연결한다.
8. public/auth/legacy redirect route는 제외한다.
9. `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export` redirect-only route는 제외한다.
10. route mapper는 exact/static route와 `new`/`new/full` route를 dynamic `:id` route보다 먼저 검사한다.
11. `VITE_PRODUCT_ANALYTICS_ENABLED="true"`가 아니면 event를 전송하지 않는다.
12. analytics API 실패를 사용자에게 표시하지 않는다.

## 5. Request 계약

User Web이 보내는 request:

```json
{
  "eventName": "app_route_viewed",
  "eventVersion": 1,
  "payload": {
    "routeKey": "deals"
  }
}
```

FE가 보내지 않는 값:

- userId
- authSessionId
- authDeviceId
- deviceId
- UUID path param
- raw query
- company/contact/product/deal 이름

## 6. Response 계약

Backend response:

```json
{
  "accepted": true
}
```

FE 처리:

- success: 아무 UI 표시 없음
- failure: 아무 UI 표시 없음
- auth failure: 기존 refresh flow 이후에도 실패하면 조용히 중단

## 7. Business Logic

1. route 변경을 감지한다.
2. path가 core `/app` route인지 확인한다.
3. path를 allowlist routeKey로 변환한다.
4. `env.productAnalyticsEnabled`가 `true`인지 확인한다.
5. 09 1차 route hook은 `surface`를 보내지 않는다.
6. 직전 routeKey와 같으면 중복 전송을 피한다.
7. analytics API를 호출한다.
8. 실패하면 catch하고 사용자 표시 없이 종료한다.

## 8. User Flow

1. 사용자가 `/app` 홈에 들어온다.
2. hook이 `routeKey=home` event를 보낸다.
3. 사용자가 `/app/deals`로 이동한다.
4. hook이 `routeKey=deals` event를 보낸다.
5. 사용자가 딜 상세로 들어간다.
6. hook이 `routeKey=deal_detail` event를 보낸다.

사용자는 analytics 전송 여부를 보지 않는다.

## 9. DB/Prisma 영향

G05는 DB를 변경하지 않는다.

Backend G03 API가 `ProductAnalyticsEvent` 저장을 담당한다.

## 10. 코드 주석 기준

Frontend:

- `trackAnalyticsEvent`: `// 기능 : 제품 분석 이벤트를 Backend collector API로 전송합니다.`
- `useAppRouteAnalytics`: `// 기능 : 보호된 앱 route 변경을 제품 분석 이벤트로 전송합니다.`
- route mapper helper: `// 기능 : 현재 pathname을 분석 허용 routeKey로 변환합니다.`
- anonymous callback이 복잡하면 이름 있는 함수로 추출하고 `// 기능 : ...` 주석을 둔다.

## 11. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

테스트 기준:

- routeKey mapper unit test
- API client mock test
- `VITE_PRODUCT_ANALYTICS_ENABLED=false`이면 hook이 API를 호출하지 않는 test
- `/app/deals/new`가 `deal_create`, `/app/deals/{uuid}`가 `deal_detail`로 매핑되는 test
- `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export`가 tracking 제외되는 test
- E2E route change smoke

## 12. Goal 검토 체크리스트

- [x] core `/app` route만 tracking한다.
- [x] public/auth route는 tracking하지 않는다.
- [x] legacy redirect route는 tracking하지 않는다.
- [x] redirect-only route는 tracking하지 않는다.
- [x] `VITE_PRODUCT_ANALYTICS_ENABLED`가 `true`일 때만 전송한다.
- [x] `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 신규 Vite 환경 변수가 반영되어 있다.
- [x] UUID path param과 raw query가 payload에 없다.
- [x] analytics failure가 사용자에게 보이지 않는다.
- [x] FE 신규/수정 코드에 `// 기능 : ...` 주석이 있다.

## 13. 구현 결과

- `FE/user-web/src/features/analytics`에 API client, hook, routeKey mapper, type/index 파일을 추가했다.
- `FE/user-web/src/components/layout/app-shell.tsx`에서 `useAppRouteAnalytics`를 한 번만 호출한다.
- `FE/user-web/src/lib/env.ts`에 `productAnalyticsEnabled`를 추가했다.
- `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`에 `VITE_PRODUCT_ANALYTICS_ENABLED`를 추가했다.
- Unit test: `FE/user-web/src/features/analytics/**/*.test.ts(x)`
- E2E smoke: `FE/user-web/tests/e2e/product-analytics-route.spec.ts`

검증 결과:

```powershell
cd FE/user-web
pnpm run test -- src/features/analytics
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e:analytics
```

모두 통과.
