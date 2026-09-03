# /goal G01-BE-MOBILE-AUTH-API

## 1. Goal

Backend auth 모듈에 모바일 전용 인증 API를 구현한다.

## 2. 선행 조건

- `COMMON/API-SPEC/MOBILE_AUTH_API.md`가 confirmed 상태로 승격되어 있다.

## 3. 먼저 읽을 문서

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/README.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/SCOPE.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/PENDING-DECISIONS.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G01-BE-MOBILE-AUTH-API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/BE-TODO/API-TODO.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `BE/src/modules/auth/README.md`

## 4. 작업 체크리스트

- [ ] 기존 `BE/src/modules/auth` controller, DTO, use case, repository port 구조를 확인한다.
- [ ] `AuthDeviceSlot.NATIVE_MOBILE` enum migration을 추가한다.
- [ ] `deviceSlot: "native_mobile"` 값을 API DTO, use case, repository mapper에 반영한다.
- [ ] 모바일 전용 controller route를 `/api/auth/mobile` 하위에 추가한다.
- [ ] `POST /api/auth/mobile/exchange` DTO를 작성한다.
- [ ] `POST /api/auth/mobile/refresh` DTO를 작성한다.
- [ ] 모바일 response mapper를 작성한다.
- [ ] exchange에서 `deviceSlot: "native_mobile"`만 허용한다.
- [ ] exchange에서 `replaceExistingDevice: true`를 강제하고, 아니면 400 validation error로 처리한다.
- [ ] exchange가 외부 OAuth token 검증을 `ExternalAuthVerifier` port 뒤에서 수행한다.
- [ ] exchange가 `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 기존 정책대로 생성/갱신한다.
- [ ] exchange response body에 `mobileRefreshToken`을 반환한다.
- [ ] exchange가 refresh cookie를 설정하지 않는지 확인한다.
- [ ] refresh가 body의 `mobileRefreshToken`을 읽는다.
- [ ] refresh가 cookie를 읽지 않는지 확인한다.
- [ ] refresh가 `AuthSession` status, expiry, revoked 상태를 검증한다.
- [ ] refresh가 연결 `AuthDevice.deviceSlot`이 `NATIVE_MOBILE`인지 검증한다.
- [ ] refresh 성공 시 현재 mobile `device`를 함께 반환한다.
- [ ] refresh 성공 시 기존 refresh token hash와 session id 조건이 모두 맞을 때만 refresh token을 atomic하게 rotation하고 `mobileRefreshToken`을 새로 반환한다.
- [ ] 이미 회전된 refresh token 재사용은 401로 처리한다.
- [ ] logout이 현재 access token의 `sessionId` 기준 session을 revoke한다.
- [ ] token 원문과 hash가 로그에 남지 않도록 redaction 기준을 확인한다.
- [ ] 웹 `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout` 동작을 깨지 않았는지 확인한다.
- [ ] exchange/refresh/logout 테스트를 추가한다.
- [ ] typecheck/lint/test/build를 실행한다.

## 5. API 완료 목록

- [ ] `POST /api/auth/mobile/exchange`
- [ ] `POST /api/auth/mobile/refresh`
- [ ] `POST /api/auth/mobile/logout`

## 6. Acceptance Criteria

- 모바일 exchange는 성공 시 `accessToken`, `accessTokenExpiresAt`, `mobileRefreshToken`, `user`, `device`를 반환한다.
- 모바일 exchange는 refresh cookie를 설정하지 않는다.
- 모바일 refresh는 request body의 `mobileRefreshToken`만 사용한다.
- 모바일 refresh는 refresh cookie와 Origin cookie CSRF 정책에 의존하지 않는다.
- 모바일 refresh는 `NATIVE_MOBILE` device slot session만 허용한다.
- 모바일 refresh는 성공 시 현재 native mobile device 정보를 반환한다.
- 이미 회전된 refresh token 재사용은 실패한다.
- refresh token 원문은 DB에 저장되지 않는다.
- 같은 native mobile device 재로그인은 session을 rotate한다.
- 다른 native mobile device 로그인은 기존 native mobile device와 session을 교체한다.
- 모바일 logout은 현재 session을 revoke한다.
- 기존 웹 인증 API 계약은 유지된다.
- Backend 검증 명령이 통과한다.

## 7. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G01_BE_MOBILE_AUTH_API/WORK_LOG.md
```

기록 항목:

- 구현한 API 목록
- 수정한 주요 파일
- DB migration 필요 여부
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
