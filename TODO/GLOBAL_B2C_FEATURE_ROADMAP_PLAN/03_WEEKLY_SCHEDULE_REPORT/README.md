# 03 Weekly Schedule Report

상태: Draft Slot
순서: 03
성격: 기능 구현 전 검토 슬롯

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

1. 주간 보고서와 기존 주간 calendar view의 차이를 확정한다.
2. weekStart/timezone 계약을 확정한다.
3. PDF/Excel 중 1차 구현 형식을 정한다.
4. AI 주간 영업 리포트와의 데이터 연결 가능성을 남긴다.
5. 범용 ExportJob을 이 슬롯에서 함께 설계할지, 별도 실행 계획으로 분리할지 결정한다.
6. 반복 일정을 주간 보고서 이전/이후 중 어디에 둘지 결정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-009
