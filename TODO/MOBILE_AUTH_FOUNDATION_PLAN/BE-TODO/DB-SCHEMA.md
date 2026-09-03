# Backend DB Schema

상태: Enum migration required

## 1. 결론

Mobile Auth Foundation Plan은 현재 DB table 구조를 재사용한다. 단, 네이티브 앱 전용 device slot을 위해 `AuthDeviceSlot.NATIVE_MOBILE` enum migration이 필요하다.

기존 `UserOAuthAccount`, `AuthDevice`, `AuthSession`, `OAuthProvider`, `AuthDeviceSlot`, `AuthDeviceStatus`, `AuthSessionStatus`가 모바일 인증 foundation에 필요한 핵심 모델이다.

## 2. 사용 모델

### UserOAuthAccount

용도:

- 외부 OAuth provider 계정과 내부 User를 연결한다.
- Google, LINE, Apple provider의 안정적인 provider user id를 저장한다.
- verified email 기반 기존 User linking을 지원한다.

모바일 정책:

- 모바일 앱은 provider를 request body로 보내지 않는다.
- provider는 외부 OAuth token 검증 결과에서만 확정한다.
- Supabase 독립 이후에도 이 모델은 외부 provider account 연결 모델로 유지한다.

### AuthDevice

용도:

- 사용자별 인증 기기를 관리한다.
- `deviceSlot`, `deviceIdHash`, `status`, `lastSeenAt`, `replacedAt`, `revokedAt`을 관리한다.

모바일 정책:

- 모바일 요청의 `deviceSlot`은 `native_mobile`이다.
- DB enum 값은 `NATIVE_MOBILE`이고 application/API string은 `native_mobile`이다.
- 사용자당 active native mobile device는 1개만 허용한다.
- 같은 `deviceIdHash` 재로그인은 기존 device를 갱신한다.
- 다른 `deviceIdHash` 로그인은 기존 active native mobile device를 `REPLACED`로 바꾸고 active session을 revoke한다.
- raw `deviceId`는 저장하지 않고 hash만 저장한다.

### AuthSession

용도:

- Backend app refresh session을 관리한다.
- refresh token hash, session status, expiresAt, revokedAt을 저장한다.

모바일 정책:

- refresh token 원문은 DB에 저장하지 않는다.
- 모바일 exchange/refresh 응답은 raw refresh token을 `mobileRefreshToken`으로 반환한다.
- 모바일 refresh API는 hash로 session을 찾은 뒤 연결 device slot이 `NATIVE_MOBILE`인지 검증한다.
- 모바일 refresh API는 현재 mobile `AuthDevice`를 response `device`로 반환할 수 있어야 한다.
- 같은 active session refresh는 session row를 새로 만들지 않고 refresh token hash를 rotation한다.
- refresh token rotation은 기존 refresh token hash와 session id 조건이 모두 맞을 때만 성공하는 atomic update로 처리한다.

## 3. migration 필요 여부

새 table migration은 필요하지 않다. `AuthDeviceSlot` enum에 `NATIVE_MOBILE`을 추가하는 migration은 필요하다.

다만 구현 중 아래 조건이 확인되면 이 문서를 먼저 갱신하고 migration 여부를 다시 판단한다.

- 모바일 전용 session/device metadata가 기존 필드로 표현되지 않는 경우
- 앱 설치 단위 device id lifecycle을 별도 컬럼으로 추적해야 하는 경우
- refresh token family/reuse detection 같은 보안 정책을 1차 범위에 포함하기로 결정하는 경우

## 4. repository 보강 예상

새 table migration은 필요하지 않을 가능성이 높지만, enum migration은 필요하다. repository port와 Prisma repository는 보강될 수 있다.

- `findSessionByRefreshTokenHash`는 연결 `AuthDevice` 정보를 함께 조회할 수 있어야 한다.
- refresh token rotation은 `sessionId + 기존 refreshTokenHash + ACTIVE` 조건을 만족할 때만 성공해야 한다.
- 조건부 rotation 대상 row가 없으면 repository가 실패 결과를 반환하고 application 계층이 401로 변환한다.

## 5. 금지 사항

- raw refresh token 저장 금지
- raw device id 저장 금지
- external OAuth access token 원문 저장 금지
- Supabase session id를 공식 모바일 session id로 사용 금지
- 기존 적용된 migration 수정/삭제 금지
