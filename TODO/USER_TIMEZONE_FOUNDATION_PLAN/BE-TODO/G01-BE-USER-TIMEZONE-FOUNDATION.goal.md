# /goal G01 BE User Timezone Foundation

## /goal 입력문

```text
일정 도메인 구현 전에 Backend에 사용자 기본 timezone 기반을 먼저 추가해줘.

반드시 먼저 읽을 문서:
- AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md
- AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md
- AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md
- TODO/USER_TIMEZONE_FOUNDATION_PLAN/README.md
- TODO/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/WORK-SPLIT.md
- TODO/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md
- TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md
- BE/prisma/schema.prisma
- BE/src/modules/auth/**
- BE/src/modules/user/**
- BE/src/shared/application/context/current-user.context.ts

작업 범위:
- BE/prisma/schema.prisma
- BE/prisma/migrations
- BE/src/modules/user
- BE/src/modules/auth
- BE/src/shared/application/context/current-user.context.ts
- 필요 시 BE/src/shared 아래 timezone validation helper
- 필요 시 Backend 테스트

작업 목표:
1. User 모델에 `timeZone String @default("Asia/Seoul")`을 추가한다.
2. migration을 추가해 기존 User row의 timeZone을 `Asia/Seoul`로 채운다.
3. `GET /api/users/me/profile` 응답에 `timeZone`을 포함한다.
4. `PATCH /api/users/me/profile`에서 `timeZone`을 선택 수정할 수 있게 한다.
5. 기존 `name` 수정 기능은 유지한다.
6. `GET /api/me`, `GET /admin/api/me`, auth token response의 user 객체에 `timeZone`을 포함한다.
7. `CurrentUserContext`에 `timeZone`을 포함한다.
8. IANA timezone validation helper를 추가하고 `Asia/Seoul`, `America/Los_Angeles`, `Asia/Singapore` 같은 값을 허용한다.
9. `KST`, `PST`, `EST`, `GMT+9`, 빈 문자열은 거부한다.
10. 기존 로그인, refresh, logout, profile, devices API의 동작을 깨지 않는다.

API 계약:
- `TODO/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md`를 정본으로 따른다.
- 시스템 시각 응답은 기존 ISO 8601 UTC string을 유지한다.
- `timeZone`은 string이며 IANA timezone ID다.

구현 제한:
- FE 코드를 수정하지 않는다.
- Schedule 모델/API를 만들지 않는다.
- Schedule 관련 request/response를 바꾸지 않는다.
- Organization/Workspace timezone을 만들지 않는다.
- 기존 모든 DateTime 컬럼을 TIMESTAMPTZ로 일괄 변경하지 않는다.
- UserSetting 테이블/API를 추가하지 않는다.
- 계정 삭제, 기기 수정/해제 API를 추가하지 않는다.

검증:
- pnpm run prisma:validate
- pnpm run prisma:generate
- pnpm run typecheck
- pnpm run lint
- pnpm run test
- pnpm run build
- rg로 `timeZone`이 User/Auth/UserProfile/CurrentUserContext 응답 경로에 반영됐는지 확인
- invalid timezone validation 테스트 또는 수동 검증 근거를 남긴다

완료 보고:
- 추가된 migration 파일
- 변경된 API response shape
- timezone validation 방식
- 기존 기능 유지 확인
- 실행한 검증 명령과 결과
- FE가 다음 goal에서 반영해야 할 필드 목록
```

## 체크리스트

- [ ] `User.timeZone` 컬럼이 schema에 있다.
- [ ] migration이 있다.
- [ ] 기존 User row 기본값이 `Asia/Seoul`이다.
- [ ] `UserProfileRecord`에 `timeZone`이 있다.
- [ ] `UpdateUserProfileInput`에 `timeZone`이 있다.
- [ ] `UpdateMyProfileDto`가 `timeZone`을 validation한다.
- [ ] application 계층에서 IANA timezone validation을 수행한다.
- [ ] `GET /api/users/me/profile` 응답에 `timeZone`이 있다.
- [ ] `PATCH /api/users/me/profile` 응답에 `timeZone`이 있다.
- [ ] `MeResponse`에 `timeZone`이 있다.
- [ ] `AdminMeResponse`에 `timeZone`이 있다.
- [ ] auth token response의 `user.timeZone`이 있다.
- [ ] `CurrentUserContext.timeZone`이 있다.
- [ ] 기존 devices 조회 API가 유지된다.
- [ ] Backend 검증 명령을 통과했다.

## 범위 밖

- FE 설정 화면 구현
- Schedule 도메인 구현
- Schedule timezone 컬럼
- Organization timezone
- 기존 시간 컬럼 native type 일괄 migration
