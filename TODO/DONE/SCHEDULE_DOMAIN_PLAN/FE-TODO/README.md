# Schedule FE TODO

## 1. 목적

User Web 일정 화면 구현 작업 문서를 둔다.

## 2. 문서

- `G02-FE-SCHEDULE-PAGES.goal.md`: Frontend `/goal` 실행 문서

## 3. 구현 기준

- `COMMON/API-SPEC/SCHEDULE_API.md` 계약을 따른다.
- User Web은 `/api/schedules/*`만 사용한다.
- 일정 연결용 딜 옵션은 `GET /api/schedules/deal-options`를 사용한다.
- 일정 form은 local date-time과 IANA `timeZone`을 함께 보낸다.
