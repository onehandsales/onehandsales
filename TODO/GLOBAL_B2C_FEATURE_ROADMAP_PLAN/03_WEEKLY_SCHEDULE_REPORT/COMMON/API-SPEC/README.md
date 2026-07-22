# Weekly Schedule Report API Spec

상태: confirmed
최종 업데이트: 2026-07-22

## 정본 문서

- `WEEKLY_SCHEDULE_REPORT_API.md`
- `../ARCHITECTURE-GUARDRAILS.md`

## 구현 착수 기준

- 03에서 바로 구현할 User API는 2개다.
  - `GET /api/schedules/week`
  - `GET /api/schedules/week/export/xlsx`
- 범용 `/api/exports` job, `/app/export`, PDF export, 반복 일정 정식 모델은 이번 API 계약에서 제외한다.
- `NBA-009 Schedule week report`만 이번 03으로 승격한다.
- 새 DB migration 없이 기존 `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` 조회로 구현한다.
- 새 Prisma model, table, column, index를 만들지 않는다.
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.
- 새 DB 구조가 필요하다고 판단되면 03에 섞지 않고 별도 사용자 결정/goal로 분리한다.
- Excel 파일은 서버에 저장하지 않고 요청 응답으로 바로 내려준다.
- 앱 전체 다국어, 국가별 currency/phone/address model, product analytics event taxonomy는 이번 API 계약에 넣지 않는다.

## 참고 기준

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
