# Mobile Comment And Logging Convention

## 1. 목적

이 문서는 `FE/mobile-app`의 주석과 로깅 기준을 정의한다.

모바일 앱은 사용자의 인증 토큰, 연락처, 이메일, 거래 정보, 회의록, 기기 정보를 다룰 수 있으므로 로그 경계를 엄격하게 둔다.

## 2. Function Comment

주요 component, hook, event handler, API function에는 바로 위에 1줄 기능 주석을 둔다.

```ts
// 기능 : 로그인 화면을 렌더링한다.
export function LoginScreen() {
  // ...
}

// 기능 : 모바일 refresh token으로 앱 세션을 복구한다.
async function restoreMobileSession() {
  // ...
}
```

규칙:

- 문구는 `// 기능 : `으로 시작한다.
- 한 줄로 쓴다.
- 호출자가 기대하는 기능을 한국어로 적는다.
- 함수명을 단순 번역하지 않는다.
- 복잡한 anonymous callback은 이름 있는 함수로 추출한 뒤 기능 주석을 둔다.

필수 대상:

- React Native screen component
- 공통 UI component
- custom hook
- event handler
- API client function
- auth adapter function
- test helper function

## 3. Logging 원칙

모바일 로그는 logger wrapper를 통해서만 남긴다.

규칙:

- 직접 `console.log`를 사용하지 않는다.
- token 원문을 로그에 남기지 않는다.
- phone, email, provider id, session id, memo, meeting note body, deal amount를 불필요하게 평문 로그로 남기지 않는다.
- 정상적인 401/403 인증 만료 흐름은 noisy error로 남기지 않는다.
- 오류를 catch한 뒤 조용히 무시하지 않는다.
- 외부 로깅 도구를 붙일 때도 token, PII, 민감한 business content는 전송하지 않는다.

## 4. Auth Logging 금지

다음 값은 어떤 로그 채널에도 기록하지 않는다.

- `accessToken`
- `mobileRefreshToken`
- Supabase access token
- provider credential
- secure storage raw value
- Authorization header 전체 값
- OAuth callback URL 전체 값

OAuth callback URL을 진단해야 할 때는 provider, result type, request id처럼 안전한 metadata만 기록한다.

## 5. Error Report 기준

모바일 error report 또는 crash report에 다음 값을 포함하지 않는다.

- token
- cookie
- Authorization header
- email
- phone
- OAuth provider account id
- meeting note body
- memo
- deal amount

사용자에게 보여줄 에러 메시지는 user-web auth 에러 문구 기준을 따르되, 모바일 toast나 작은 화면에 맞게 짧게 줄일 수 있다.

## 6. Review Checklist

- 주요 component/function/hook에 `// 기능 : ...` 주석이 있는가?
- 직접 `console.log`가 없는가?
- token 원문이 로그/에러/analytics/crash report에 포함되지 않는가?
- 정상적인 인증 만료 흐름을 오류로 과도하게 보고하지 않는가?
- user-web과 같은 의미의 auth 에러 문구를 사용하는가?

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
