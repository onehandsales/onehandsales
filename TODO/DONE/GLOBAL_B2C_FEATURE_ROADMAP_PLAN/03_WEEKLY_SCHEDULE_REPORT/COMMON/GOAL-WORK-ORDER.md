# Goal Work Order

상태: Confirmed
확정일: 2026-07-22

## 1. 원칙

03은 Backend 주간 보고서 조회 API, Backend Excel 다운로드 API, User Web 보고서 UX, QA 순서로 간다.

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

모든 `/goal`은 `COMMON/ARCHITECTURE-GUARDRAILS.md`와 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 선행 기준으로 읽고 진행한다.

이번 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현한다. `/api/exports`, `ExportJob`, `/app/export`, PDF, 반복 일정 정식 모델은 별도 사용자 결정/goal로 분리한다.

신규 Prisma migration은 만들지 않으므로 `NBA-014` DB/Prisma 운영 gate는 migration 실행 gate가 아니라 "무단 migrate/seed 금지 확인" 수준으로만 점검한다.

DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.

`NBA-009 Schedule week report` 외 다른 NBA 후보와 Global B2C first-sale gate 항목인 결제/Admin/앱 전체 다국어/통화 모델/제품 분석은 이번 03 구현에 섞지 않는다.

## 2. 실행 순서

```text
G01_BACKEND_WEEKLY_REPORT_API
-> G02_BACKEND_WEEKLY_REPORT_XLSX_EXPORT
-> G03_USER_WEB_WEEKLY_REPORT_UX
-> G04_QA_REVIEW_CLOSEOUT
```

## 3. G01 Backend Weekly Report API

상세 명세: `COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md`

목표:

- `GET /api/schedules/week`를 구현한다.
- `weekStart`, `timeZone`, 7일 day bucket, linked deal summary, ownership, redaction 기준을 닫는다.

## 4. G02 Backend Weekly Report Xlsx Export

상세 명세: `COMMON/GOAL-SPECS/G02_BACKEND_WEEKLY_REPORT_XLSX_EXPORT.md`

목표:

- `GET /api/schedules/week/export/xlsx`를 구현한다.
- G01 report builder를 재사용해 Excel 파일을 즉시 다운로드한다.

## 5. G03 User Web Weekly Report UX

상세 명세: `COMMON/GOAL-SPECS/G03_USER_WEB_WEEKLY_REPORT_UX.md`

목표:

- `/app/schedules/week` route를 열고 주간 보고서 화면을 API와 연결한다.
- `/app/schedules`에서 진입 버튼을 제공하고 Excel 다운로드를 연결한다.

## 6. G04 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G04_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, timezone/day bucket, cross-user 차단, Excel, 모바일, redaction을 점검한다.
- `COMMON/REVIEW-CHECKLIST.md` 기준으로 구현 검토를 닫는다.

## 7. 권장 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md 기준으로 G01을 구현해줘.
```
