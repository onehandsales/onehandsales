# G01-BE-SCHEDULE-DOMAIN Goal Spec

## 1. 목적

Backend Schedule DB와 User API를 구현한다.

## 2. 포함 범위

- Prisma `Schedule`, `ScheduleDeal` 모델 추가
- migration 추가
- `schedule` module 추가
- schedule application service, repository port, Prisma repository, controller, DTO 구현
- 일정 연결용 딜 옵션 조회
- 일정 목록/상세/생성/수정/삭제 API 구현
- transaction, ownership, validation, observability 구현
- Backend 테스트 추가

## 3. 제외 범위

- Google Calendar
- 알림
- 반복 일정
- 휴지통
- Admin API
- 일정별 활동 로그

## 4. 완료 기준

- `GET /api/schedules/deal-options`가 현재 사용자 소유 딜을 `createdAt DESC`, `id DESC`로 반환한다.
- `GET /api/schedules`가 month/week 범위를 timezone 기준으로 계산해 반환한다.
- `POST /api/schedules`가 `Schedule`과 `ScheduleDeal`을 같은 transaction에서 생성한다.
- `PATCH /api/schedules/:scheduleId`가 `dealIds` diff로 `ScheduleDeal`을 추가/삭제한다.
- `DELETE /api/schedules/:scheduleId`가 `ScheduleDeal`과 `Schedule`을 hard delete한다.
- `dealIds` 중복 요청은 400으로 차단한다.
- 타 사용자 일정/딜 접근은 404로 처리한다.
- typecheck/lint/test/build가 통과한다.
