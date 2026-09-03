# Mobile Auth And Storage Convention

## 1. 인증 원칙

모바일의 공식 인증 상태는 Backend `AuthSession`과 OneHand app access token을 기준으로 한다.

Supabase는 현재 외부 OAuth access token을 얻기 위한 교체 가능한 adapter일 뿐이다.

## 2. Auth Provider Adapter

- Supabase OAuth 구현은 auth provider adapter 안에 격리한다.
- feature screen은 Supabase client를 직접 import하지 않는다.
- adapter는 외부 OAuth access token을 얻는 역할까지만 담당한다.
- Backend exchange 이후 business API 호출에는 OneHand app access token만 사용한다.
- 향후 Supabase 독립 시 adapter 구현체 교체만으로 화면/API/session 구조가 유지되어야 한다.

## 3. 모바일 전용 인증 API

모바일 인증은 웹 인증 API와 분리한다.

- `POST /api/auth/mobile/exchange`
- `POST /api/auth/mobile/refresh`
- `POST /api/auth/mobile/logout`
- `GET /api/me`

모바일 전용 API는 refresh token을 cookie가 아니라 body 계약으로 다룬다.

`POST /api/auth/mobile/refresh` 요청 body 필드명은 `mobileRefreshToken`이다.

## 4. Refresh Token 저장

모바일 앱은 refresh token을 반드시 보안 저장소에만 저장한다.

저장 key:

```text
onehand.mobile.auth.mobileRefreshToken
```

금지 저장소:

- AsyncStorage
- Zustand store
- Zustand persist
- React state
- 일반 파일 저장소
- localStorage와 유사한 일반 저장소

refresh token은 로그아웃하거나 refresh 실패로 세션이 무효화되면 즉시 삭제한다.

## 5. Access Token 저장

access token은 짧은 수명을 가진 토큰으로 취급한다.

- 메모리에만 보관할 수 있다.
- secure storage에 영구 저장하지 않는다.
- Zustand persist에 저장하지 않는다.
- API 요청 시 `Authorization: Bearer <accessToken>`으로만 사용한다.

## 6. TokenProvider

공통 API client는 auth store를 직접 import하지 않는다.

API client는 `TokenProvider`를 통해 access token만 읽는다.

```ts
interface TokenProvider {
  getAccessToken(): string | null | Promise<string | null>;
}
```

API client는 Zustand store, React context, secure storage, Supabase client를 직접 알면 안 된다.

## 7. 앱 시작 시 세션 복구

- 앱 시작 시 secure storage에서 `onehand.mobile.auth.mobileRefreshToken`을 읽는다.
- token이 있으면 즉시 `POST /api/auth/mobile/refresh`를 호출한다.
- 성공하면 새 `mobileRefreshToken`을 secure storage에 덮어쓴다.
- 성공하면 response의 `device`를 현재 모바일 기기 상태로 반영한다.
- 실패하면 secure storage token을 삭제하고 signedOut 상태로 전환한다.
- 인증 복구가 끝나기 전에는 보호 화면을 렌더링하지 않는다.

## 8. Device 정책

- 네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`이고 Backend Prisma enum은 `NATIVE_MOBILE`이다.
- 사용자당 활성 네이티브 모바일 기기는 1대만 허용한다.
- 새 모바일 기기 로그인 시 기존 모바일 기기와 세션은 교체한다.
- exchange 요청은 `replaceExistingDevice: true`를 사용한다.
- `deviceId`는 설치 단위로 안정적인 값을 사용한다.

## 9. Token 보안 금지 사항

- refresh token을 URL query, route param, custom header로 전달하지 않는다.
- refresh token을 logs, analytics, crash report, error report에 기록하지 않는다.
- access token, refresh token, OAuth token을 화면 문구나 오류 상세에 노출하지 않는다.
- token 값을 테스트 fixture에 평문으로 남기지 않는다.
- 정상적인 401/403 인증 흐름을 noisy error로 남기지 않는다.

## 10. 에러 메시지

모바일 auth/API 에러 메시지는 user-web auth 에러 문구를 기준으로 통일한다.

동일한 인증 실패, 세션 만료, 네트워크 오류 상황에서는 웹과 모바일이 같은 의미의 문구를 사용한다.

단, 모바일 화면 폭이나 toast 표시 제약 때문에 문장이 너무 길면 의미를 유지한 채 짧게 줄일 수 있다.

에러 문구는 화면 component에 직접 흩뿌리지 않고 auth feature 또는 공통 error mapper에서 관리한다.
