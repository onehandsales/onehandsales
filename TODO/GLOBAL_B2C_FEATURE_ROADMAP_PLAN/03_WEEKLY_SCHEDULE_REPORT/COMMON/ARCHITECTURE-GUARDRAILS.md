# Architecture Guardrails

상태: Confirmed
최종 업데이트: 2026-07-22

## 1. 결론

이번 `03_WEEKLY_SCHEDULE_REPORT`에서는 새 데이터베이스를 생성하지 않는다.

- 새 Prisma model 없음
- 새 table 없음
- 새 column 없음
- 새 enum 없음
- 새 index 없음
- 새 migration 없음
- seed 실행 없음

주간 보고서는 기존 `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog`, `User` 데이터를 조회해 runtime에서 계산한다.

## 2. 정본 기준

Backend, DB, Frontend 구조는 `AGENT/SOFTWARE_AGENT`를 따른다.

필수 참조:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SCHEDULE_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

UX/UI 구조와 문구는 `AGENT/UXUI_AGENT`를 따른다.

필수 참조:

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

Global B2C 제품화 판단은 아래 문서를 함께 따른다.

- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/FE-TODO/USER-WEB-PRODUCTIZATION-GUIDE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/BE-TODO/BACKEND-PRODUCTIZATION-GUIDE.md`

## 3. Backend 아키텍처 규칙

- 구현 위치는 기존 `schedule` 모듈 안에 둔다.
- `ScheduleController`는 request validation과 application 호출만 담당한다.
- application service/use case는 Prisma를 직접 import하지 않는다.
- Prisma query는 infrastructure repository/projection에서만 수행한다.
- domain layer는 NestJS decorator, Prisma type/client, logger를 import하지 않는다.
- `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`는 User API `/api/*`에만 둔다.
- Admin API `/admin/api/*`는 만들지 않는다.
- generic `export` Backend module을 만들지 않는다.
- xlsx 생성은 `src/shared/application/ports/xlsx-workbook.writer.ts` port와 기존 xlsx infrastructure pattern을 따른다.
- `@Get("week")`, `@Get("week/export/xlsx")`는 `@Get(":scheduleId")`보다 먼저 선언한다.
- 기존 `GET /api/schedules` response는 변경하지 않는다.

## 4. Backend 주석과 로그 규칙

`AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`를 필수로 따른다.

- 새 Backend class/interface에는 한국어 `// 역할 : ...` 주석을 붙인다.
- 새 HTTP controller method에는 한국어 `// API : ...` 주석을 붙인다.
- 새 내부 method/function에는 한국어 `// 기능 : ...` 주석을 붙인다.
- controller와 application orchestration에는 필요한 경우 `// 1. ...`, `// 2. ...` 단계 주석을 둔다.
- structured log event key는 짧은 영어를 사용하되, PII/private data는 남기지 않는다.
- 일정 제목, 장소, 메모 본문, 딜명, 딜 금액, 회사명, 담당자명, 다음 행동 본문, Excel row 전체는 log에 남기지 않는다.

## 5. DB 관련 주석 규칙

DB와 관련된 변경 또는 조회 코드를 작성할 때는 한글 주석을 반드시 둔다.

이번 03에서 허용되는 DB 관련 작업:

- 기존 table 조회
- 기존 relation select
- 기존 index를 활용한 weekly report projection
- `Schedule.memo`의 존재 여부를 `hasMemo`로 계산

이번 03에서 금지되는 DB 관련 작업:

- Prisma schema model/field/enum 추가
- migration 생성
- table/column/index 생성
- report snapshot table 생성
- `ExportJob` 계열 table 생성
- recurring schedule table 생성
- seed 실행

만약 구현 중 새 DB 구조가 필요하다고 판단되면 즉시 03 구현에 섞지 말고 별도 사용자 결정/goal로 분리한다.

별도 사용자 결정으로 DB 변경이 확정되는 경우에는 아래 한글 주석을 모두 포함해야 한다.

- `BE/prisma/schema.prisma`: model, enum, field, relation, index 의도에 `///` 한글 설명을 둔다.
- `BE/prisma/migrations/*/migration.sql`: DDL block 앞에 `--` 한글 설명을 둔다.
- repository/projection method: DB 조회 목적과 ownership 조건을 `// 기능 : ...` 한글 주석으로 설명한다.
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*`: table 역할, column 의미, nullable 여부, 기본값, 관계, index 의도를 한글로 갱신한다.
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/BE-TODO/DB-SCHEMA.md`: 실제 구현 결과와 다른 부분을 한글로 갱신한다.

주석은 이름을 번역하는 수준이 아니라 역할, 관계, 보안 조건, timezone 처리, index 의도를 설명해야 한다.

## 6. UX/UI 규칙

주간 보고서 화면은 `AGENT/UXUI_AGENT` 기준으로 작성한다.

- Notion식 workspace/page/report 구조를 따른다.
- Attio식 CRM linked record 맥락이 드러나야 한다.
- 일정 row/card 안에서 연결 딜, 회사, 담당자, 다음 행동 관계를 분명히 보여준다.
- desktop은 날짜별 section과 compact row 중심으로 구성한다.
- mobile 390px/360px은 card/list 중심으로 구성한다.
- 페이지 전체를 큰 카드 안에 넣지 않는다.
- 카드 안에 카드를 중첩하지 않는다.
- 버튼은 lucide icon과 짧은 label을 사용한다.
- 사용자 노출 문구는 `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`의 해요체를 따른다.
- Backend 응답에 없는 제품 요약, AI 요약, 민감정보 상태를 FE에서 꾸며내지 않는다.
- `/app/export`는 이번 03에서 열지 않는다.

## 6A. Global B2C 제품화 규칙

이번 03은 Global B2C retention loop에 기여하지만 첫 판매 gate 전체를 닫지 않는다.

- `NBA-009 Schedule week report`만 이번 03으로 승격한다.
- `timeZone`은 IANA ID를 사용하고 `Asia/Seoul`은 fallback일 뿐이다.
- 날짜/시간 표시는 response `timeZone`과 기존 User Web locale/formatting helper를 우선 사용한다.
- 앱 전체 다국어 작업은 이번 03에서 만들지 않는다.
- 화면 문구는 현재 한국어 UX writing 기준을 따르되, 나중에 locale key로 분리하기 어렵게 흩뿌리지 않는다.
- 금액은 기존 Deal 금액 semantics를 그대로 사용하고, 통화 변환이나 국가별 currency model을 만들지 않는다.
- Excel header/copy는 현재 User Web 기준을 따르되, export localization 체계는 만들지 않는다.
- Product analytics event taxonomy는 만들지 않는다. structured log를 제품 분석 event처럼 사용하지 않는다.
- Pricing, billing, tax, Admin/support, Trust/policy, app-wide i18n, global data model은 별도 first-sale gate로 분리한다.

## 7. Review Gate

G01~G04 구현자는 각 goal 완료 전에 아래를 확인한다.

- 새 DB 구조를 만들지 않았는가?
- DB 관련 코드와 문서에 필요한 한글 주석이 있는가?
- Backend layer rule이 `AGENT/SOFTWARE_AGENT`와 일치하는가?
- User Web 구조가 `AGENT/SOFTWARE_AGENT/FRONT_AGENT`와 일치하는가?
- UX/UI와 문구가 `AGENT/UXUI_AGENT`와 일치하는가?
- Global B2C 첫 판매 gate에서 03에 포함할 항목과 별도 분리할 항목이 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`와 일치하는가?
- 03 제외 범위인 `/api/exports`, `ExportJob`, `/app/export`, PDF, 반복 일정, 제품 요약, AI 요약이 섞이지 않았는가?
