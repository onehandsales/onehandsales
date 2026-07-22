# Planning Review

상태: Closed
검토일: 2026-07-22

## 1. 결론

- 판정: 구현 착수 가능
- 이유: 03의 제품 결정, 포함/제외 범위, API 계약, DB schema, FE 작업, goal 순서, 아키텍처/UXUI guardrail, Global B2C 대조, QA 체크리스트가 confirmed 수준으로 정리됐다.
- 구현 상태: G01/G02/G03/G04 Ready

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 구현 범위 | 주간 보고서 화면 + 동기식 Excel 다운로드까지만 진행 |
| 조회 API | `GET /api/schedules/week` |
| Excel API | `GET /api/schedules/week/export/xlsx` |
| `weekStart` | `YYYY-MM-DD` date-only, 월요일만 허용 |
| `timeZone` | IANA timezone ID |
| 일정 없는 날 | 7일 모두 표시 |
| 다일 일정 | 겹치는 날짜마다 표시 |
| 딜 요약 | 금액, 단계, 마감일, 회사, 담당자, 다음 행동 포함 |
| 일정 메모 본문 | 제외. `hasMemo`만 사용 |
| 제품 요약 | 제외. `NBA-001` 전까지 FE fake 금지 |
| `/api/exports`, `ExportJob`, `/app/export` | 제외. 별도 사용자 결정/goal |
| PDF | 제외. 별도 사용자 결정/goal |
| 반복 일정 정식 모델 | 제외. 별도 사용자 결정/goal |
| 신규 DB 구조 | 제외. 새 Prisma model/table/column/index/migration 없음 |
| DB 관련 주석 | DB 관련 구현 또는 문서 변경 시 한글 주석 필수 |
| Software Agent 기준 | Backend/DB/Frontend 아키텍처는 `AGENT/SOFTWARE_AGENT` 기준 |
| UXUI Agent 기준 | 화면과 사용자 문구는 `AGENT/UXUI_AGENT` 기준 |
| Next Backend Backlog | `NBA-009 Schedule week report`를 03으로 승격. 다른 NBA 후보는 별도 |
| Global B2C first-sale gate | 03은 retention/Product UX 일부를 닫지만 결제/Admin/다국어/분석/정책은 별도 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| Vertical slice | 03은 화면 보고서와 Excel 다운로드만 닫는다. |
| API 형태 | 기존 domain xlsx export 관례와 맞춰 `GET /api/schedules/week/export/xlsx`를 사용한다. |
| DB 변경 | 기존 `Schedule`, `ScheduleDeal`, `Deal` 관계 조회로 충분하므로 migration을 만들지 않는다. |
| DB 주석 | DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다. |
| Software Agent | Backend/DB/Frontend는 `AGENT/SOFTWARE_AGENT`의 layer, API, transaction, observability, comment/logging 기준을 따른다. |
| UXUI Agent | 주간 보고서 화면은 `AGENT/UXUI_AGENT`의 Notion식 page/report와 Attio식 linked record 기준을 따른다. |
| Global B2C | 03은 `NBA-009`를 닫는 retention 기능이며 Global B2C 첫 판매 gate 전체를 닫지 않는다. |
| Locale/formatting | IANA timezone과 date-only 계약은 03에 포함한다. 앱 전체 다국어, currency, phone/address model은 별도다. |
| Product analytics | 이번 03에서 ad hoc analytics event taxonomy를 만들지 않는다. structured log는 운영 로그로만 둔다. |
| ExportJob 제외 | 파일 저장, TTL, 권한, audit, 대용량 worker는 03보다 Trust/policy/Admin gate에 가깝다. |
| PDF 제외 | 데이터 계약과 화면 UX가 안정된 뒤 print/export 정책으로 별도 확정한다. |
| 반복 일정 제외 | RRULE, exception, DST, 알림 재생성, Calendar 연동 영향이 커서 별도 확정한다. |
| 보안 | 일정 메모 본문과 private memo/meeting note body는 response/export/log에 넣지 않는다. |

## 5. 미해결 Critical/Major

없음.

## 6. 구현 중 주의

- `@Get("week")`, `@Get("week/export/xlsx")`는 `@Get(":scheduleId")`보다 먼저 선언한다.
- 기존 `GET /api/schedules` response를 확장하지 않는다.
- `DealProduct`를 이번 response에 포함하지 않는다.
- `Schedule.memo` 본문은 `hasMemo` 계산에만 사용한다.
- `/app/export`를 열지 않는다.
- `pnpm run prisma:migrate`나 seed는 실행하지 않는다.
- 새 DB 구조를 만들지 않는다.
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 둔다.
- 구현 전 `COMMON/ARCHITECTURE-GUARDRAILS.md`를 읽는다.
- 구현 전 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 읽는다.
- 03에서 결제/Admin/앱 전체 다국어/통화 모델/제품 분석을 같이 만들지 않는다.
- Excel row 내용 전체를 log에 남기지 않는다.

## 7. 사용자의 추가 결정이 필요한 질문

현재 G01~G04 구현 착수를 막는 질문은 없다.

G03 화면 구현 중 선택 가능하지만 blocking은 아닌 항목:

- 화면 문구 locale 처리: 현재 한국어 UX writing을 쓰되 locale-ready 구조로 작성한다.
- Excel header 언어: 현재 한국어 header를 유지한다.
- 딜 금액 표시: 기존 Deal 금액 표시 방식을 재사용한다.

별도 사용자 결정/goal에서 확정 또는 상세화할 항목:

- Global B2C 첫 판매 국가와 locale
- 앱 내부 다국어 적용 범위
- currency/date/phone/address global data model
- Pricing/trial/plan/entitlement
- Billing provider 또는 Merchant of Record
- Admin/support 운영 범위
- Trust/policy/export/delete/retention 정책
- Product analytics taxonomy
- Generic ExportJob
- PDF print/export
- 반복 일정 정식 모델
- 민감정보 포함 export
- 제품 요약
- AI Weekly Sales Report

## 8. 구현 시작 권장 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md 기준으로 G01을 구현해줘.
```
