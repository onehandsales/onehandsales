# FE/BE Work Split

## 1. 목적

이 문서는 `USER_TIMEZONE_FOUNDATION_PLAN`에서 BE와 FE가 담당할 범위를 고정한다.

이번 계획은 일정 도메인 구현 전 선행 작업이다. 따라서 Schedule 모델과 Schedule API는 만들지 않고, 사용자 기본 timezone을 저장하고 화면/인증 상태에서 사용할 수 있게 한다.

## 2. BE 책임

BE는 DB, API, validation, 인증 컨텍스트를 책임진다.

BE 작업 범위:

- `User.timeZone` Prisma 컬럼 추가
- migration 추가
- 기존 User row 기본값 `Asia/Seoul`
- `GET /api/me`, `GET /admin/api/me`, auth token response에 `user.timeZone` 포함
- `GET /api/users/me/profile` 응답에 `timeZone` 포함
- `PATCH /api/users/me/profile` request body에 `timeZone` 추가
- `CurrentUserContext.timeZone` 추가
- IANA timezone validation helper 추가
- 기존 로그인, refresh, logout, profile, devices 흐름 유지
- Backend 테스트와 Prisma 검증

BE가 하지 않는 일:

- FE 설정 화면 구현
- Schedule 모델/API 구현
- 조직 timezone 구현
- 기존 모든 `DateTime` 컬럼을 `TIMESTAMPTZ`로 일괄 변경
- 계정 삭제, 기기 수정/해제, UserSetting API 추가

## 3. FE 책임

FE는 사용자 화면과 client state 반영을 책임진다.

FE 작업 범위:

- User Web auth user type에 `timeZone` 추가
- 로그인/refresh/me/profile 응답에서 `timeZone` 보존
- 설정 페이지에서 timezone 조회/수정 UI 제공
- IANA timezone option 제공
- profile 저장 성공 후 auth/profile query 갱신
- 일정 화면이 이미 있다면 Schedule 구현 전까지 기존 기능을 깨지 않게 유지

FE가 하지 않는 일:

- BE API shape 임의 변경
- DB schema 또는 migration 작성
- Schedule 생성/수정 request 포맷 변경
- Schedule timezone 최종 변환 로직 구현
- Admin Web timezone 설정 화면 구현

## 4. 실행 순서

1. BE goal로 DB/API 기반을 먼저 구현한다.
2. BE 검증 결과와 API 응답 shape를 확인한다.
3. FE goal로 설정 화면과 auth/profile state를 갱신한다.
4. FE 작업 중 API 불일치를 발견하면 FE에서 임시 우회하지 않고 `COMMON/API-SPEC/USER_TIMEZONE_API.md`를 갱신하거나 BE 이슈로 남긴다.

## 5. 관련 goal

- `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/BE-TODO/G01-BE-USER-TIMEZONE-FOUNDATION.goal.md`
- `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/FE-TODO/G02-FE-USER-TIMEZONE-FOUNDATION.goal.md`
