# API Spec

상태: Implemented

## 1. 목적

09의 제품 분석 API와 내부 application contract를 구현 전에 고정한다.

## 2. Spec 파일

- `PRODUCT_ANALYTICS_EVENT_API.md`
- `PRODUCT_ANALYTICS_SERVER_EVENT_CONTRACT.md`
- `PRODUCT_ANALYTICS_SNAPSHOT_CONTRACT.md`
- `AI_USAGE_ANALYTICS_CONTRACT.md`

## 3. 공통 원칙

- API 계약 상태는 구현 착수 전 `confirmed`다.
- User Web은 `/api/analytics/events`만 호출한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- Server event는 HTTP API가 아니라 Backend application service가 호출하는 내부 contract다.
- Admin analytics full API는 11에서 만든다.
- Billing/paywall/churn final API는 12에서 만든다.
- 모든 request/response 시간 필드는 UTC ISO string 또는 `YYYY-MM-DD` date string 의미를 명시한다.
- event별 payload schema는 `COMMON/EVENT-TAXONOMY.md`를 정본으로 사용한다.
- 모든 mutation/processor contract에는 transaction과 observability 항목을 둔다.
- 모든 신규/수정 코드에는 한국어 주석 규칙을 적용한다.

## 4. 공통 Error Response

Collector API는 아래 safe error shape를 사용한다.

```json
{
  "code": "ANALYTICS_EVENT_UNSUPPORTED",
  "field": "eventName",
  "message": "지원하지 않는 분석 이벤트예요."
}
```

FE 처리:

- 사용자에게 표시하지 않는다.
- `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 User Web client event를 전송한다.
- dev/test 기본값은 비활성이다. test는 API client mock으로 확인한다.
- event 전송 실패가 route 전환이나 product mutation 성공 UX를 막지 않는다.

## 5. 공통 Observability

- request id 사용
- payload 원문 logging 금지
- PII/raw text/prompt/provider raw response logging 금지
- server event record failure는 warning log
- snapshot runner failure는 error log

## 6. 공통 코드 주석

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`

Frontend:

- component/hook/function/event handler/API client: `// 기능 : ...`

## 7. G08 Closeout

- 완료일: 2026-07-30
- `PRODUCT_ANALYTICS_EVENT_API.md`, `PRODUCT_ANALYTICS_SERVER_EVENT_CONTRACT.md`, `PRODUCT_ANALYTICS_SNAPSHOT_CONTRACT.md`, `AI_USAGE_ANALYTICS_CONTRACT.md`는 구현 상태와 대조 완료했다.
- G08은 신규 request/response를 만들지 않았다.
- User Web 소비자는 `/api/analytics/events`만 호출하고, Admin analytics full API는 11에서 별도 계약으로 만든다.
- Backend/User Web 자동 검증과 event taxonomy/privacy 검색을 통과했다.
