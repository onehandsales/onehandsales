# 03 Weekly Schedule Report

상태: Goal Ready
순서: 03
성격: 기능 구현 착수 가능 슬롯
최종 업데이트: 2026-07-22
정본 계약: `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
아키텍처/UXUI 기준: `COMMON/ARCHITECTURE-GUARDRAILS.md`
Global B2C 대조: `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`
구현 실행 순서: `COMMON/GOAL-WORK-ORDER.md`
사용자 결정: 2026-07-22, 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현한다.

## 1. 목적

월/주 일정 보기와 별개로, 한 주의 일정과 연결 딜을 영업 보고서 형태로 확인하고 Excel로 출력할 수 있게 한다.

이번 03은 화면 보고서와 동기식 Excel 다운로드까지 구현한다. 범용 ExportJob, PDF, 반복 일정 정식 모델은 별도 사용자 결정/goal로 분리한다.

## 1A. 사용자 확정 결정

- 여기까지만 진행한다: 주간 보고서 화면 + 동기식 Excel 다운로드.
- API는 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`로 확정한다.
- `/api/exports`, `ExportJob`, `/app/export`, PDF, 반복 일정 정식 모델은 이번 03에서 만들지 않는다.
- 범위 밖 항목은 03 구현에 섞지 않고 별도 사용자 결정/goal로 분리한다.

## 1B. 아키텍처/UXUI/DB 기준

- Backend, DB, Frontend 아키텍처는 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- UX/UI와 사용자 노출 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.
- 이번 03에서 새 데이터베이스, Prisma model, table, column, index, migration은 만들지 않는다.
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.
- 이번 03은 `NBA-009 Schedule week report`를 구현 가능한 goal로 승격한 계획이다.
- Global B2C 첫 판매 gate 전체를 닫는 계획은 아니며, 결제/Admin/앱 다국어/제품 분석/정책은 별도 계획으로 둔다.
- 상세 대조는 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 따른다.
- 상세 기준은 `COMMON/ARCHITECTURE-GUARDRAILS.md`를 따른다.

## 2. 현재 상태

- `/app/schedules`는 월/주 보기와 CRUD가 구현되어 있다.
- `ScheduleWeekReportScreen` 컴포넌트는 있으나 route export가 막혀 있다.
- `/app/schedules/week`는 `/app/schedules`로 redirect된다.
- Backend `GET /api/schedules/week`는 없다.
- Backend `GET /api/schedules/week/export/xlsx`는 없다.
- `/app/export`는 `/app`으로 redirect되고, 이번 03에서도 열지 않는다.
- 범용 `/api/exports`와 `ExportJob` table은 없다.
- 반복 일정은 아직 없다.

## 3. 확정 API

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/schedules/week` | `weekStart`와 `timeZone` 기준 7일 주간 일정 보고서 조회 |
| `GET` | `/api/schedules/week/export/xlsx` | 같은 보고서를 Excel 파일로 즉시 다운로드 |

자세한 request, response, 비즈니스 로직, transaction, observability, error, FE/BE 처리 기준은 `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`를 따른다.

## 4. 확정된 범위

- 보고서 1차 형식은 화면 + Excel이다.
- `weekStart`는 `YYYY-MM-DD`이고 월요일만 허용한다.
- `timeZone`은 IANA timezone ID다.
- 일정이 없는 날도 7개 `days[]`에 포함한다.
- 다일 일정은 요청 timezone 기준 겹치는 날짜마다 표시한다.
- 딜 연결 요약에는 active linked deal의 단계, 금액, 예상 마감일, 회사, 담당자, 다음 행동을 포함한다.
- 일정 메모 본문은 포함하지 않고 `hasMemo`만 반환한다.
- Excel 파일은 서버에 저장하지 않고 즉시 응답한다.
- 새 DB migration은 만들지 않는다.
- 새 DB 구조를 만들지 않는다.

## 5. 제외 범위

- `POST /api/schedules/week/export`
- `/api/exports`
- `/api/exports/:exportJobId`
- `/api/exports/:exportJobId/download`
- `/app/export` route 노출
- PDF export
- 반복 일정 정식 모델
- 제품 요약
- AI 요약 생성
- 민감정보 포함 export
- 앱 내부 다국어 전체 전환
- 국가별 통화/전화번호/주소 모델
- Product analytics event taxonomy
- Pricing/Billing/Admin/Trust policy

## 6. /goal 구현 순서

정본 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

1. `COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md`
2. `COMMON/GOAL-SPECS/G02_BACKEND_WEEKLY_REPORT_XLSX_EXPORT.md`
3. `COMMON/GOAL-SPECS/G03_USER_WEB_WEEKLY_REPORT_UX.md`
4. `COMMON/GOAL-SPECS/G04_QA_REVIEW_CLOSEOUT.md`

권장 첫 실행 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md 기준으로 G01을 구현해줘.
```

## 7. 참고

- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`
- `COMMON/PLANNING-REVIEW.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `COMMON/SCOPE.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `COMMON/REFERENCES.md`
