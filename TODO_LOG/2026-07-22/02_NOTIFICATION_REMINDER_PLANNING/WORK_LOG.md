# 02 Notification Reminder Planning Work Log

날짜: 2026-07-22
작업 유형: 계획 문서 확정
대상: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`

## 1. 요청

사용자가 02 Notification Reminder를 학습한 뒤 구현 착수 가능한 수준의 문서로 정리해 달라고 요청했다.

반영할 사용자 결정:

- 채널은 앱 안 알림 + 브라우저 푸시 + 이메일까지 만든다.
- 알림 대상은 일정 시작 전과 딜 마감일만 한다.
- 다음 행동 알림은 지금 하지 않는다.
- 딜 마감 알림은 추천 기준대로 마감일 1일 전 오전 9시로 둔다.
- 일정 시작 전 알림은 시작 30분 전으로 둔다.

## 2. 작성/갱신 문서

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/NOTIFICATION_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md`
- `COMMON/GOAL-SPECS/G02_BACKEND_NOTIFICATION_API.md`
- `COMMON/GOAL-SPECS/G03_REMINDER_GENERATION_DELIVERY.md`
- `COMMON/GOAL-SPECS/G04_USER_WEB_NOTIFICATION_UX.md`
- `COMMON/GOAL-SPECS/G05_QA_REVIEW_CLOSEOUT.md`
- `COMMON/PLANNING-REVIEW.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 3. 핵심 설계

- `Notification`은 앱 안 알림 정본으로 둔다.
- email/browser push는 `NotificationDeliveryAttempt`로 분리한다.
- 일정 알림은 `Schedule.startAt - 30분` 기준이다.
- 딜 마감 알림은 사용자 timezone 기준 `expectedEndDate - 1일 09:00` 기준이다.
- 다음 행동과 회의록 후속 알림은 제외한다.
- Browser push endpoint/key는 암호화 저장한다.
- provider raw response, email body 전문, push endpoint/key, private memo, meeting note body, deal amount는 log/response에 노출하지 않는다.

## 4. 검증

문서 작업만 수행했다.

- 코드 수정 없음
- migration 실행 없음
- 테스트 실행 없음

## 5. 다음 작업

권장 첫 구현 goal:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md 기준으로 G01을 구현해줘.
```
