# User Web TODO

상태: Confirmed Plan

## 1. 09 User Web 목표

User Web은 09에서 새 분석 화면을 만들지 않는다. 기존 `/app` 업무 흐름에 client event wrapper를 붙이고, core route page view만 allowlist payload로 Backend에 보낸다.

Server mutation success event는 Backend가 기록하므로 FE가 딜 생성, 일정 생성, 회의록 저장 같은 성공 이벤트를 중복으로 보내지 않는다.

## 2. 신규 feature 구현 대상

```text
FE/user-web/src/features/analytics/
  api/
    analytics-api.ts
  hooks/
    use-app-route-analytics.ts
  types/
    analytics.ts
  utils/
    analytics-route-key.ts
```

연결 파일:

- `FE/user-web/src/components/layout/app-shell.tsx`
- `FE/user-web/src/app/router/router.tsx`는 route allowlist 대조용 참조 파일이다.
- `FE/user-web/src/lib/env.ts`
- `FE/user-web/src/lib/api-client.ts`
- `FE/user-web/src/features/auth/auth-provider.tsx`

## 3. Client Event API

요청:

```json
{
  "eventName": "app_route_viewed",
  "eventVersion": 1,
  "payload": {
    "routeKey": "deals"
  }
}
```

응답:

```json
{
  "accepted": true
}
```

FE는 아래 값을 보내지 않는다.

- userId
- authSessionId
- authDeviceId
- deviceId
- email
- phone
- companyName
- contactName
- memo
- meeting note body
- raw path의 UUID segment

## 4. Route Key Allowlist

| routeKey | 실제 route |
|---|---|
| `home` | `/app` |
| `companies` | `/app/companies` |
| `company_create` | `/app/companies/new`, `/app/companies/new/full` |
| `company_detail` | `/app/companies/:companyId` |
| `contacts` | `/app/contacts` |
| `contact_create` | `/app/contacts/new`, `/app/contacts/new/full` |
| `contact_detail` | `/app/contacts/:contactId` |
| `products` | `/app/products` |
| `product_create` | `/app/products/new`, `/app/products/new/full` |
| `product_detail` | `/app/products/:productId` |
| `deals` | `/app/deals` |
| `deal_create` | `/app/deals/new`, `/app/deals/new/full` |
| `deal_detail` | `/app/deals/:dealId` |
| `schedules` | `/app/schedules` |
| `schedule_week` | `/app/schedules/week` |
| `schedule_detail` | `/app/schedules/:scheduleId` |
| `meeting_notes` | `/app/meeting-notes` |
| `meeting_note_create` | `/app/meeting-notes/new/full` |
| `meeting_note_detail` | `/app/meeting-notes/:meetingNoteId` |
| `business_cards` | `/app/business-cards` |
| `notifications` | `/app/notifications` |
| `import` | `/app/import` |
| `import_review` | `/app/import/review/:importJobId` |
| `import_detail` | `/app/import/:importUserLogId` |
| `trash` | `/app/trash` |
| `settings` | `/app/settings` |
| `more` | `/app/more` |

제외:

- route mapper에서 exact/static route와 `new`/`new/full` route보다 dynamic `:id` route를 먼저 검사하는 구현
- public/auth route
- `/app/export` redirect
- `/app/contacts/scan`, `/app/meeting-notes/new`, `/app/export` redirect-only route
- legacy redirect route
- URL query 전체 문자열
- UUID path param 원문

## 5. UX/UI 기준

- 09는 사용자에게 보이는 새 UI를 만들지 않는다.
- analytics 실패 toast, modal, banner를 보여주지 않는다.
- Core route tracking 때문에 화면 전환이 늦어지면 안 된다.
- `AGENT/UXUI_AGENT`의 Notion + Attio workspace/record 흐름을 방해하지 않는다.
- analytics wrapper는 `FE/user-web/src/components/layout/app-shell.tsx`에 한 번만 붙이고 각 화면 컴포넌트에 중복 구현하지 않는다.

## 6. Frontend 로직 기준

- analytics API client 함수에는 `// 기능 : ...` 한국어 주석을 둔다.
- hook/component/event handler에는 `// 기능 : ...` 한국어 주석을 둔다.
- `apiClient`를 사용하되 analytics 실패는 catch 후 사용자에게 표시하지 않는다.
- `console.log`를 남기지 않는다.
- `FE/user-web/src/lib/env.ts`에 `productAnalyticsEnabled`를 추가한다.
- `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 `useAppRouteAnalytics`가 event를 전송한다.
- `development/test` 기본값은 비활성이다. 운영 배포 환경에서만 `VITE_PRODUCT_ANALYTICS_ENABLED=true`를 명시한다.
- test는 `VITE_PRODUCT_ANALYTICS_ENABLED="false"` 상태에서 API client mock으로 route mapper와 hook 호출 조건을 검증한다.
- 401이 발생하면 기존 refresh flow를 따른다. refresh 실패 시 analytics 재시도만 별도 noisy하게 하지 않는다.
- route 변경이 빠르게 반복될 경우 직전 routeKey를 memory에 저장해 같은 routeKey 중복 전송을 막는다.
- 09 1차 route hook은 `surface`를 보내지 않는다. nav click instrumentation을 별도로 추가한 뒤에만 optional `surface`를 보낸다.
- routeKey mapper test는 `FE/user-web/src/app/router/router.tsx`의 보호된 `/app` route와 위 allowlist를 대조한다.
- routeKey mapper는 `/app/deals/new` 같은 생성 route가 `/app/deals/:dealId`보다 먼저 매칭되는 단위 테스트를 가진다.

## 7. 검증 기준

- `app_route_viewed` request에 user/session/device id가 없다.
- UUID path param이 payload에 들어가지 않는다.
- company/contact/product/deal 이름이 payload에 들어가지 않는다.
- public/auth route에서는 event가 전송되지 않는다.
- route 변경 시 한 번만 event가 전송된다.
- analytics API 실패가 화면 전환과 mutation 성공 UX를 막지 않는다.
- 신규/수정 FE 코드에 `// 기능 : ...` 한국어 주석이 있다.
