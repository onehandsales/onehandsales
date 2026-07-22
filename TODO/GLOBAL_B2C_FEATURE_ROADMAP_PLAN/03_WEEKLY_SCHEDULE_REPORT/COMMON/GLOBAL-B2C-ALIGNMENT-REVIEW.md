# Global B2C Alignment Review

상태: Confirmed
검토일: 2026-07-22

## 1. 결론

`03_WEEKLY_SCHEDULE_REPORT`는 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-009 Schedule week report`를 별도 기능 goal로 승격한 계획이다.

이번 03은 Global B2C 제품의 retention loop를 강화하는 기능이지만, Global B2C 첫 판매 gate 전체를 닫는 계획은 아니다.

구현 착수를 막는 추가 사용자 결정은 없다.

다만 아래 항목은 03에 섞지 않고 별도 사용자 결정/goal에서 확정 또는 상세화한다.

`08_GLOBAL_DATA_I18N`, `11_ADMIN_OPERATION`, `12_BILLING_SUBSCRIPTION_TAX`에는 이미 공통 baseline 결정이 있다. 이번 03은 그 baseline을 침범하지 않고, 주간 보고서 기능 안에서 필요한 timezone/date-only 안정성만 반영한다.

- 첫 판매 국가와 앱 내부 다국어 범위
- 통화, 금액 표시, 국가별 날짜/시간/전화번호/주소 모델
- Pricing, trial, plan, entitlement, billing, tax
- Admin/support 운영 API와 감사 로그
- Product analytics event taxonomy
- Generic ExportJob, PDF, 민감정보 포함 export
- 반복 일정 정식 모델
- Deal product summary, latest activity summary
- AI Weekly Sales Report

## 2. NEXT_BACKEND_API_BACKLOG_PLAN 대조

| 후보 | 03 반영 상태 | 판단 |
|---|---|---|
| `NBA-009 Schedule week report` | 반영 | `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`로 confirmed 계약화 |
| `NBA-001 Deal list products summary` | 제외 | 제품 요약은 03에 넣지 않는다. FE도 제품 정보를 꾸며내지 않는다. |
| `NBA-003 latest activity summary` | 제외 | 최신 활동/요약은 03 report response에 새로 만들지 않는다. |
| `NBA-008 Page size 15 cleanup` | 해당 없음 | 주간 보고서는 pagination list가 아니라 7일 고정 report다. |
| `NBA-014 DB/Prisma 운영 gate` | 제한 반영 | 새 migration이 없으므로 migrate/seed 금지와 prisma validate 수준으로만 확인한다. |
| `NBA-007 Trash private memo restriction` | 보안 원칙만 반영 | private memo 원문을 response/export/log에 넣지 않는 기준만 반영한다. Trash 정책은 별도. |
| `NBA-011 MeetingNote provider log` | 제외 | provider raw response와 meeting note body는 03에 넣지 않는다. |
| `NBA-012 Trash retention policy` | 제외 | export 파일 저장/TTL/retention 정책은 03에 넣지 않는다. |
| `NBA-013 Admin operation API` | 제외 | User API만 만들고 Admin API는 만들지 않는다. |

## 3. USER_WEB_PRODUCTIZATION_GAP_PLAN 대조

| First-sale gate | 03 반영 상태 | 판단 |
|---|---|---|
| Product UX | 반영 | Notion식 page/report, Attio식 linked record, schedule-deal 연결 맥락을 기준으로 둔다. |
| Global UX | 일부 반영 | IANA timezone, date-only, local week boundary는 반영한다. 앱 내부 다국어/국가별 데이터 모델은 별도 계획이다. |
| Data reliability | 일부 반영 | 새 DB/migration 없이 기존 row 조회로 구현한다. DB/Prisma 운영 gate 전체 closeout은 별도다. |
| Trust/policy | 일부 반영 | memo/private memo/meeting note/provider raw response redaction과 민감 export 제외 기준을 둔다. 정책 문서/계정 삭제/export 권리는 별도다. |
| Retention | 반영 | 일정과 딜을 주간 보고서로 연결해 반복 사용 이유를 만든다. 회의록 follow-up/AI report는 별도다. |
| Product analytics | 제외 | ad hoc analytics event를 만들지 않는다. 제품 분석 taxonomy는 별도 첫 판매 gate다. |
| Admin/support | 제외 | Admin API와 운영 화면은 별도 첫 판매 gate다. |
| Pricing/Billing/Tax | 제외 | 결제/구독/세금은 03 범위가 아니다. |

## 4. 03 구현 중 Global B2C 주의점

- `timeZone`은 IANA ID를 사용하고 `Asia/Seoul`은 fallback일 뿐이다.
- FE는 `weekStart`를 UTC instant로 변환하지 않는다.
- 날짜/시간 표시는 response `timeZone`과 기존 User Web locale/formatting helper를 우선 사용한다.
- 앱 전체 다국어 작업은 03에서 만들지 않되, 화면 문구는 나중에 locale key로 빼기 어렵게 흩뿌리지 않는다.
- 금액은 기존 Deal 금액 semantics를 그대로 사용한다. 통화 변환, 국가별 가격/통화 모델은 만들지 않는다.
- Excel header/copy는 현재 User Web 기준을 따르되, 별도 export localization 체계는 만들지 않는다.
- API 응답에 없는 제품 요약, latest activity, AI summary, 민감정보 상태를 FE에서 사실처럼 꾸미지 않는다.
- structured log는 제품 분석 event가 아니다. Product analytics가 필요하면 별도 taxonomy/consent/privacy 기준으로 계획한다.

## 5. 사용자 의사결정 항목

### 03 구현 착수 전

없음.

현재 확정된 범위만으로 G01~G04 구현을 시작할 수 있다.

### G03 화면 구현 중 선택 가능하지만 blocking은 아닌 항목

| 항목 | 권장 기본값 | 결정이 필요한 경우 |
|---|---|---|
| 화면 문구 locale 처리 | 현재 한국어 UX writing을 쓰되 locale-ready 구조로 작성 | 03에서 다국어 copy key까지 반드시 만들고 싶을 때 |
| Excel header 언어 | 현재 한국어 header 유지 | 첫 구현부터 판매 국가별 Excel header가 필요할 때 |
| 딜 금액 표시 | 기존 Deal 금액 표시 방식을 재사용 | 통화 코드/통화 변환/국가별 금액 정책을 03에 넣고 싶을 때 |

### 별도 goal에서 확정/상세화할 항목

- Global B2C 첫 판매 국가와 locale
- 앱 내부 다국어 적용 범위
- currency/date/phone/address global data model
- Pricing/trial/plan/entitlement
- Billing provider 또는 Merchant of Record
- Admin/support 운영 범위
- Trust/policy/export/delete/retention 정책
- Product analytics taxonomy
- Generic ExportJob/PDF/민감정보 export
- 반복 일정 정식 모델
- Product summary와 activity summary API
- AI Weekly Sales Report
