# User Timezone Foundation Plan

## 1. 목적

이 계획은 일정 도메인을 구현하기 전에 사용자 기본 timezone 기반을 먼저 만든다.

글로벌 판매를 전제로 `createdAt`, `updatedAt` 같은 시스템 시각은 UTC instant로 다루고, 사용자가 입력하는 현지 날짜/시간은 IANA timezone과 함께 해석하는 기준을 Backend와 Frontend에 반영한다.

이번 계획은 Schedule 도메인을 만들지 않는다. Schedule 구현 전에 필요한 `User.timeZone`, API 응답, 설정 화면, 인증 상태의 기본 timezone 전달만 준비한다.

## 2. 배경

향후 한손에 영업은 한국뿐 아니라 미국, 싱가폴 등 여러 timezone의 사용자에게 판매될 수 있다.

일정을 구현하기 전에 사용자 기본 timezone을 먼저 저장하지 않으면 다음 문제가 생긴다.

- 일정 생성 시 어떤 timezone으로 `startAt`, `endAt`을 해석해야 하는지 알 수 없다.
- FE가 브라우저 timezone과 사용자 설정 timezone 중 무엇을 기준으로 표시해야 하는지 흔들린다.
- 미국 DST처럼 offset이 변하는 지역에서 같은 현지 시간이 다른 UTC instant로 저장될 수 있다.
- Schedule 구현 시 User API, Auth 응답, 설정 화면을 다시 크게 수정해야 한다.

## 3. 필수 선행 정본

이 계획의 모든 `/goal` 작업자는 아래 문서를 먼저 읽는다.

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`

## 4. 문서 구조

```text
TODO/USER_TIMEZONE_FOUNDATION_PLAN/
  README.md
  COMMON/
    README.md
    WORK-SPLIT.md
    API-SPEC/
      USER_TIMEZONE_API.md
  BE-TODO/
    README.md
    G01-BE-USER-TIMEZONE-FOUNDATION.goal.md
  FE-TODO/
    README.md
    G02-FE-USER-TIMEZONE-FOUNDATION.goal.md
```

## 5. 실행 순서

1. `COMMON/API-SPEC/USER_TIMEZONE_API.md`로 API/DB 계약을 확인한다.
2. BE goal `G01-BE-USER-TIMEZONE-FOUNDATION.goal.md`를 먼저 실행한다.
3. BE 검증과 migration 생성이 완료된 뒤 FE goal `G02-FE-USER-TIMEZONE-FOUNDATION.goal.md`를 실행한다.
4. FE는 BE 계약에 맞춰 profile/auth 상태에 `timeZone`을 반영한다.
5. Schedule 도메인은 이 계획 완료 후 별도 계획에서 진행한다.

## 6. 포함 범위

- `User.timeZone` DB 컬럼 추가
- 기존 User row의 timezone 기본값 `Asia/Seoul`
- IANA timezone validation
- `GET /api/me`, `GET /admin/api/me`, auth token response의 `user.timeZone`
- `GET /api/users/me/profile` 응답의 `timeZone`
- `PATCH /api/users/me/profile` 요청/응답의 `timeZone`
- `CurrentUserContext.timeZone`
- User Web 설정 화면의 timezone 조회/수정
- FE auth user state/type의 `timeZone`

## 7. 제외 범위

- Schedule 테이블/API/화면 구현
- `Schedule.timeZone` 컬럼 추가
- 반복 일정, 알림, Google Calendar 연동
- 조직/워크스페이스 timezone
- 기존 `createdAt`, `updatedAt` 컬럼을 `TIMESTAMPTZ`로 일괄 migration
- Admin Web timezone 설정 화면
- 계정 삭제, 기기 수정/해제, UserSetting 테이블

## 8. 완료 기준

- BE migration으로 `User.timeZone`이 추가된다.
- 기존 auth/profile API가 깨지지 않고 `timeZone`을 추가 응답한다.
- `PATCH /api/users/me/profile`이 이름과 timezone을 각각 독립 수정할 수 있다.
- invalid timezone은 validation error로 거부된다.
- FE 설정 화면에서 timezone을 조회/수정할 수 있다.
- FE auth state가 `timeZone`을 가진다.
- 기존 로그인, token refresh, profile, devices 흐름이 유지된다.

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`
- `TODO/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md`
