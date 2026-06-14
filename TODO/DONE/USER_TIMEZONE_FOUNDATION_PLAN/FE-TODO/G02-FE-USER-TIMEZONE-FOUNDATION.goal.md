# /goal G02 FE User Timezone Foundation

## /goal 입력문

```text
Backend의 User timezone 기반 작업 완료 후, User Web에 사용자 기본 timezone 조회/수정과 auth state 반영을 구현해줘.

반드시 먼저 읽을 문서:
- AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md
- AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md
- AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md
- AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md
- TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/README.md
- TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/WORK-SPLIT.md
- TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md
- TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/BE-TODO/G01-BE-USER-TIMEZONE-FOUNDATION.goal.md
- FE/user-web/src/features/auth/**
- FE/user-web/src/pages/settings/index.tsx
- FE/user-web/src/lib/api-client.ts

작업 범위:
- FE/user-web
- 필요 시 FE/user-web tests/e2e
- FE/admin-web는 auth user type이 공유되지 않는 한 수정하지 않는다. Admin Web timezone 설정 UI는 범위 밖이다.

작업 목표:
1. auth user type에 `timeZone`을 추가한다.
2. auth exchange/refresh/me 응답의 `user.timeZone`을 보존한다.
3. profile API type에 `timeZone`을 추가한다.
4. settings/profile 화면에 timezone select를 추가한다.
5. 사용자가 `Asia/Seoul`, `Asia/Singapore`, `America/Los_Angeles`, `America/New_York`, `Europe/London` 중 선택해 저장할 수 있게 한다.
6. 브라우저 timezone은 저장된 값이 없을 때의 fallback 또는 추천값으로만 사용한다.
7. profile 저장 성공 후 profile query와 auth user state를 갱신한다.
8. 기존 이름 수정, 이메일 표시, provider 표시, 등록 기기 조회 흐름을 깨지 않는다.

사용 API:

GET /api/users/me/profile
- 응답에 `timeZone` 포함

PATCH /api/users/me/profile
- body 예: `{ "name": "홍길동", "timeZone": "Asia/Seoul" }`
- 이름만 수정하거나 timezone만 수정할 수 있어야 한다.

GET /api/me
- auth user state에 `timeZone` 포함

UI 요구:
- timezone label은 사용자가 이해할 수 있게 표시한다.
  - `Asia/Seoul` -> `서울 (Asia/Seoul)`
  - `Asia/Singapore` -> `싱가폴 (Asia/Singapore)`
  - `America/Los_Angeles` -> `로스앤젤레스 (America/Los_Angeles)`
  - `America/New_York` -> `뉴욕 (America/New_York)`
  - `Europe/London` -> `런던 (Europe/London)`
- 저장 전후 기존 profile 화면 layout이 깨지지 않아야 한다.
- validation 실패 시 form error 또는 toast로 표시한다.

구현 제한:
- BE 코드를 수정하지 않는다.
- Schedule 화면의 생성/수정 request 포맷을 이 goal에서 바꾸지 않는다.
- Schedule 도메인 timezone 변환을 구현하지 않는다.
- Admin Web timezone 설정 UI를 만들지 않는다.
- 계정 삭제, 기기 수정/해제, UserSetting UI를 추가하지 않는다.

검증:
- pnpm run typecheck
- pnpm run lint
- pnpm run build
- 기존 e2e가 설정 화면을 smoke한다면 mock 응답에 `timeZone`을 추가해 깨지지 않게 한다.

완료 보고:
- 수정한 FE 파일
- 반영한 API response/request 필드
- timezone option 목록
- profile 저장 후 query/auth state 갱신 방식
- 실행한 검증 명령과 결과
```

## 체크리스트

- [x] auth user type에 `timeZone`이 있다.
- [x] profile type에 `timeZone`이 있다.
- [x] settings/profile 화면에 timezone select가 있다.
- [x] timezone 저장 request가 `PATCH /api/users/me/profile`로 간다.
- [x] 이름만 수정할 수 있다.
- [x] timezone만 수정할 수 있다.
- [x] 저장 성공 후 profile query가 갱신된다.
- [x] 저장 성공 후 auth user state가 최신 timezone을 갖는다.
- [x] 등록 기기 조회 UI가 유지된다.
- [x] Schedule request 포맷은 이 goal에서 바꾸지 않았다.
- [x] FE 검증 명령을 통과했다.

## 완료 검증 기록

- timezone option: `Asia/Seoul`, `Asia/Singapore`, `America/Los_Angeles`, `America/New_York`, `Europe/London`
- profile 저장 성공 후 `authQueryKeys.profile()` 캐시를 갱신하고 AuthProvider의 auth user state를 patch한다.
- 통과 명령: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`
- 참고: FE lint는 기존 `src/components/ui/toast.tsx` fast-refresh warning 1건이 있으나 error는 없다.

## 범위 밖

- BE API 구현
- DB migration
- Schedule 도메인
- Admin Web timezone 설정 UI
