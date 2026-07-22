# Goal Specs

상태: Confirmed
구현 상태: G01 Done / G02 Done / G03 Done / G04 Done

## 1. 목적

이 폴더는 `03_WEEKLY_SCHEDULE_REPORT`를 `/goal`로 실행할 때 각 작업 단위가 바로 구현에 들어갈 수 있도록 상세 명세를 둔다.

## 2. Goal 목록

| Goal | 상태 | 문서 | 목적 |
|---|---|---|---|
| G01 | Done | `G01_BACKEND_WEEKLY_REPORT_API.md` | `GET /api/schedules/week` 조회 API |
| G02 | Done | `G02_BACKEND_WEEKLY_REPORT_XLSX_EXPORT.md` | `GET /api/schedules/week/export/xlsx` Excel 다운로드 API |
| G03 | Done | `G03_USER_WEB_WEEKLY_REPORT_UX.md` | `/app/schedules/week` 화면/API 연결 |
| G04 | Done | `G04_QA_REVIEW_CLOSEOUT.md` | Backend/User Web 검증과 문서 closeout |

## 3. 실행 규칙

- 각 goal 시작 전에 `../ARCHITECTURE-GUARDRAILS.md`를 읽는다.
- 각 goal 시작 전에 `../GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 읽는다.
- Backend/DB/Frontend 구조는 `AGENT/SOFTWARE_AGENT`를 따른다.
- UX/UI와 사용자 노출 문구는 `AGENT/UXUI_AGENT`를 따른다.
- 이번 03에서는 새 DB 구조, 새 Prisma model, 새 migration을 만들지 않는다.
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.
- `NBA-009` 외 다른 NBA 후보와 결제/Admin/앱 전체 다국어/통화 모델/제품 분석은 이번 03에 섞지 않는다.
- G01 완료 전 G02/G03를 시작하지 않는다.
- G02는 G01의 report builder를 재사용한다.
- G03은 G01/G02 API 계약이 구현된 뒤 시작한다.
- G04는 G01~G03 완료 후 실행한다.
- 각 goal은 해당 문서의 완료 기준을 만족해야 완료로 본다.

## 4. 권장 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/GOAL-SPECS/G01_BACKEND_WEEKLY_REPORT_API.md 기준으로 G01을 구현해줘.
```
