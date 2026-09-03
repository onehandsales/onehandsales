# Mobile Auth Foundation Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
| ---: | --- | --- | --- | --- |
| 1 | `G01-BE-MOBILE-AUTH-API` | Backend | Ready | `COMMON/API-SPEC/MOBILE_AUTH_API.md` confirmed |
| 2 | `G02-FE-MOBILE-AUTH-APP` | Mobile | Ready for structure | G01 API 구현 또는 contract mock |
| 3 | `G03-MOBILE-AUTH-INTEGRATION` | Common | Waiting for G01/G02 | G01, G02 완료 |

## 2. D01-DEVICE-SLOT-DECISION

상태: Decided on 2026-09-03

결정:

- User Web 브라우저 모바일은 기존 `deviceSlot: "mobile"`을 유지한다.
- 네이티브 Mobile App은 API `deviceSlot: "native_mobile"`을 사용한다.
- Backend Prisma enum은 `AuthDeviceSlot.NATIVE_MOBILE`을 추가한다.
- 세션 정책은 기존처럼 slot당 active device 1개를 유지한다.

읽을 문서:

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/PENDING-DECISIONS.md`
- `FE/user-web/src/features/auth/auth-service.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `BE/prisma/schema.prisma`

완료 조건:

- `COMMON/PENDING-DECISIONS.md`는 D01 결정 결과를 기록한다.
- `COMMON/API-SPEC/MOBILE_AUTH_API.md`는 `native_mobile` 기준 confirmed 계약이다.
- `BE-TODO/DB-SCHEMA.md`, `BE-TODO/API-TODO.md`, `FE-TODO/MOBILE-APP-TODO.md`는 이 결정을 따른다.

## 3. G01-BE-MOBILE-AUTH-API

목적:

- Backend auth 모듈에 모바일 전용 인증 API를 추가한다.
- 웹 cookie 인증 API와 분리된 secure-storage 기반 refresh token 계약을 구현한다.

읽을 문서:

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/README.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G01-BE-MOBILE-AUTH-API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/BE-TODO/API-TODO.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/BE-TODO/G01-BE-MOBILE-AUTH-API.goal.md`

완료 조건:

- `POST /api/auth/mobile/exchange`가 구현된다.
- `POST /api/auth/mobile/refresh`가 구현된다.
- `POST /api/auth/mobile/logout`이 구현된다.
- 모바일 refresh token은 response body의 `mobileRefreshToken`으로만 반환된다.
- 모바일 refresh 성공 응답은 현재 mobile `device`를 포함한다.
- 모바일 API는 refresh cookie를 설정하거나 읽지 않는다.
- `deviceSlot: "native_mobile"`, Prisma enum `NATIVE_MOBILE`, `replaceExistingDevice: true`, 사용자당 활성 네이티브 모바일 기기 1대 정책이 지켜진다.
- Backend typecheck, lint, test, build가 통과하거나 미실행 사유가 기록된다.

## 4. G02-FE-MOBILE-AUTH-APP

목적:

- `FE/mobile-app`을 MOBILE_AGENT 규칙에 맞춰 Expo Router 기반 인증 앱으로 구성한다.
- 로그인/회원가입, 세션 복구, `/api/me`, 최소 홈, 로그아웃을 구현한다.

읽을 문서:

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/README.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/USER-FLOW.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G02-FE-MOBILE-AUTH-APP.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/FE-TODO/MOBILE-APP-TODO.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/FE-TODO/G02-FE-MOBILE-AUTH-APP.goal.md`

완료 조건:

- Expo Router route 구조가 `src/app` route entry/layout 중심으로 구성된다.
- 실제 화면/API/hook/schema/type/store는 `src/features/auth`, `src/features/home`, `src/lib`에 둔다.
- NativeWind와 Tailwind config token을 사용한다.
- refresh token은 secure storage에만 저장한다.
- access token은 메모리에만 보관한다.
- 로그인/회원가입 UX는 User Web 브라우저 모바일 auth 화면의 정보 구조, provider 순서, 문구 톤을 따른다.
- Mobile App typecheck, lint, local smoke가 통과하거나 미실행 사유가 기록된다.

## 5. G03-MOBILE-AUTH-INTEGRATION

목적:

- Backend 모바일 인증 API와 Mobile App 인증 흐름을 통합 검증하고 완료 기록을 남긴다.

읽을 문서:

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G03-MOBILE-AUTH-INTEGRATION.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/G03-MOBILE-AUTH-INTEGRATION.goal.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/PLANNING-REVIEW.md`

완료 조건:

- 앱 최초 실행 signedOut 흐름을 확인한다.
- OAuth 성공 또는 mock token 기반 exchange 흐름을 확인한다.
- 앱 재시작 refresh 성공/실패 흐름을 확인한다.
- `/api/me` 호출과 최소 홈 표시를 확인한다.
- 로그아웃 후 Backend session revoke와 secure storage 삭제를 확인한다.
- `TODO_LOG`에 작업 결과와 검증 결과가 남는다.

## 6. 병렬 처리 기준

- G01 Backend API 구현은 `native_mobile` / `NATIVE_MOBILE` 계약을 전제로 시작한다.
- G02의 구조 정리, 공통 UI, NativeWind 설정은 G01과 병렬로 진행할 수 있다.
- G02의 실제 API 연동 완료 판정은 G01 완료 후에만 한다.
- API request/response field가 바뀌면 `COMMON/API-SPEC/MOBILE_AUTH_API.md`를 먼저 갱신한다.
- DB schema 변경이 필요해지면 `BE-TODO/DB-SCHEMA.md`와 API 계약을 함께 갱신한다.
