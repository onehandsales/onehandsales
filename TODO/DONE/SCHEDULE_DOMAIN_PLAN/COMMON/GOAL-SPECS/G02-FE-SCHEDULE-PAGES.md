# G02-FE-SCHEDULE-PAGES Goal Spec

## 1. 목적

User Web 일정 화면을 Backend Schedule API 계약에 맞게 구현한다.

## 2. 포함 범위

- schedule API client와 query key 정리
- 일정 목록/상세/생성/수정/삭제 hook 구현
- 월간 일정 화면 API 연결
- 주간 일정 화면 API 연결
- 일정 생성/수정 form과 딜 연결 UI 구현
- `GET /api/schedules/deal-options` 기반 딜 선택 옵션 연결
- `dealIds` 중복 선택 차단
- hard delete 성공 후 query invalidation

## 3. 제외 범위

- Google Calendar
- 알림
- 반복 일정
- 일정 휴지통
- Admin 화면

## 4. 완료 기준

- `/schedules`에서 월간 일정 목록이 조회된다.
- `/schedules/week`에서 주간 일정 목록이 조회된다.
- 일정 생성/수정 form은 local date-time과 IANA `timeZone`을 함께 보낸다.
- Frontend는 사용자 입력 local date-time을 `toISOString()`으로 임의 변환하지 않는다.
- 연결 딜 선택은 `GET /api/schedules/deal-options`를 사용한다.
- 같은 딜을 중복 선택할 수 없다.
- 삭제 성공 시 일정 목록이 갱신된다.
- typecheck/lint/build가 통과한다.
