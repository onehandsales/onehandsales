# Schedule Plan Planning Review

## 1. 검토 결과

- 검토일: 2026-06-14
- 판정: 구현 완료
- 근거: `schedule.md`의 요구사항을 `COMMON/API-SPEC`, `BE-TODO`, `FE-TODO`로 분리했고 API 계약 상태를 `implemented`로 갱신했다. Backend와 Frontend 구현, 검증, TODO_LOG 기록이 완료됐다.

## 2. 통과 항목

- API별 request, response, 내부 비즈니스 로직이 작성되어 있다.
- `Schedule`과 `ScheduleDeal` DB 모델 책임이 분리되어 있다.
- 일정과 딜 N:N 관계가 명확하다.
- `ScheduleDeal` 중복 방지는 request validation과 DB unique 제약으로 이중 처리한다.
- 일정 삭제는 hard delete로 명확히 정의되어 있다.
- transaction 필요 API와 rollback 범위가 명확하다.
- 시간 처리는 UTC instant + IANA `timeZone` 정책을 따른다.
- Frontend가 딜 도메인 API를 재사용하지 않고 `GET /api/schedules/deal-options`를 사용하도록 명시했다.

## 3. 보류 또는 제외

- Google Calendar 실연동은 제외한다.
- 일정 알림은 제외한다.
- 반복 일정은 제외한다.
- 일정 휴지통은 제외한다.
- 일정별 활동 로그 자동 생성은 제외한다.

## 4. 구현 전 주의

- `GET /api/schedules/deal-options`는 `GET /api/schedules/:scheduleId`보다 controller에서 먼저 선언한다.
- `dealIds`가 요청에 없는 경우와 빈 배열인 경우를 구분한다.
- `dealIds`가 요청에 없으면 기존 연결 유지, 빈 배열이면 모든 연결 제거다.
- hard delete는 운영상 감사 로그 후보지만, 현재 사용자 본인 일정 삭제이고 Admin/민감정보 범위가 아니므로 audit log는 없음으로 둔다.
