# FE/BE Work Split

## 목적

이 문서는 `AUTH_FE_INTEGRATION_PLAN` 안에서 FE와 BE가 같은 작업을 중복하지 않도록 책임 경계를 고정한다.

현재 인증/회원가입 흐름은 이미 Backend 계약으로 정리되어 있다. 이번 분리는 인증 자체가 아니라, 로그인 이후 사이드바 설정 탭에서 필요한 사용자 API와 화면 작업을 대상으로 한다.

## 공통 전제

- 이 계획의 TODO 문서는 `TODO/SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 로그인/회원가입은 `Supabase Auth + POST /api/auth/exchange` 흐름을 사용한다.
- 일반 Backend API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- refresh token은 httpOnly cookie로만 운용한다.
- `UserSetting`, 계정 삭제 API, 영구 삭제 컬럼은 현재 범위에 없다.
- 등록 기기 생성/갱신/교체는 로그인 또는 회원가입 시 `POST /api/auth/exchange`에서 처리한다.
- 설정 탭에서는 등록 기기를 조회만 한다.

## BE 책임

BE는 API와 DB 기준을 책임진다.

- User/Auth DDL 또는 Prisma migration 준비
- `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`만 포함
- `UserSetting` 미포함
- `User.permanentDeleteAt` 미포함
- `DELETE /api/users/me` 미노출
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`
- 응답 shape와 에러 shape 유지
- Backend 검증: Prisma validate/generate, typecheck, lint, test, build

BE가 하지 않는 일:

- FE 화면 구현
- FE 라우터/상태관리 수정
- Supabase provider 버튼 UI 구현
- 기기명 수정 API 또는 기기 해제 API 추가
- 계정 삭제 API 추가

## FE 책임

FE는 화면과 API client 연결을 책임진다.

- 설정 사이드바 탭 또는 설정 라우트 구성
- 개인 정보 조회 UI
- 이름 수정 UI
- 등록 기기 조회 UI
- 현재 기기 표시
- provider 연결 정보 표시
- 기존 인증 client의 app access token 사용
- 401 처리는 기존 인증 refresh 흐름에 위임

FE가 하지 않는 일:

- BE API shape 임의 변경
- BE 코드 수정
- DB schema 또는 migration 작성
- 계정 삭제 UI 추가
- user settings UI 추가
- 기기명 수정/기기 해제 UI 추가
- 인증/회원가입 흐름 재구현

## 실행 순서

1. BE goal을 먼저 실행해 API와 DDL 기준을 확정한다.
2. FE goal은 BE 계약 파일과 실제 응답 shape를 기준으로 구현한다.
3. FE 작업 중 API 불일치가 발견되면 FE에서 우회하지 말고 `COMMON/AUTH-FE-CONTRACT.md`와 BE goal 완료 결과를 비교해 이슈로 남긴다.

## 관련 goal

- `BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `FE-TODO/G02-FE-SETTINGS-PROFILE-DEVICES.goal.md`
