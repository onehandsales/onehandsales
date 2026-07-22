# 03 Weekly Schedule Report

상태: Draft Slot
순서: 03
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

월/주 일정 보기와 별개로, 한 주의 일정과 연결 딜을 영업 보고서 형태로 확인하고 PDF/Excel로 출력할 수 있게 한다. 이 슬롯에는 주간 보고서에서 출발하는 범용 ExportJob/비동기 Export 기반과 반복 일정 후보도 함께 검토한다.

## 2. 현재 상태

- `/app/schedules`는 월/주 보기와 CRUD가 구현되어 있다.
- `ScheduleWeekReportScreen` 컴포넌트는 있으나 route export가 막혀 있다.
- `/app/schedules/week`는 `/app/schedules`로 redirect된다.
- Backend `GET /api/schedules/week`, `POST /api/schedules/week/export`는 없다.
- `/app/export`는 `/app`으로 redirect되고, 범용 `/api/exports`와 `ExportJob` table은 없다.
- 반복 일정은 아직 없다.

## 3. 착수 전 해야 할 일

추천 결정:

- 화면 보고서를 1차 UX로 둔다.
- 파일 출력은 Excel을 먼저 구현하고 PDF는 print/export 후속으로 둔다.
- `weekStart`와 `timeZone` 계약을 명확히 한다.
- 범용 ExportJob은 이 슬롯에서 가벼운 기반을 잡되 대용량 worker는 별도 goal로 분리한다.
- ExportJob, 다운로드, 파일 보관/삭제는 Trust/policy first-sale gate와 연결한다.

1. 주간 보고서와 기존 주간 calendar view의 차이를 확정한다.
2. weekStart/timezone 계약을 확정한다.
3. 1차 파일 출력은 Excel로 확정하고 PDF는 print/export 후속 범위로 둔다.
4. AI 주간 영업 리포트와의 데이터 연결 가능성을 남긴다.
5. 범용 ExportJob은 가벼운 기반만 이 슬롯에 포함하고, 대용량 worker는 별도 실행 계획으로 분리한다.
6. 반복 일정 정식 모델은 이 슬롯에서 제외하고, 추후 occurrence 확장이 가능하도록 API 계약만 점검한다.
7. export retention, 민감정보 포함/제외, 다운로드 권한, 파일 삭제 정책이 `COMMON/FIRST-SALE-GATE-MAP.md`의 Trust/policy gate와 충돌하지 않는지 확인한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-009
