# Front Comment And Logging Convention

## 1. 목적

이 문서는 `FE/user-web`과 `FE/admin-web`의 주석과 로깅 기준을 정의한다.

Frontend에서는 사용자가 보는 화면과 상태 전환을 명확히 표현하는 이름을 우선하고, 함수와 컴포넌트에는 기능 주석을 둔다.
새로 작성하거나 수정하는 코드에는 아래 주석 규칙을 기본 적용한다.

## 2. Function Comment

Frontend 함수와 컴포넌트에는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// 기능 : 더보기 화면을 렌더링합니다.
export function MorePage() {
  // ...
}

// 기능 : 지원 문의 form 제출을 처리합니다.
function handleSubmit() {
  // ...
}
```

필수 대상:

- React component function
- React hook function
- event handler function
- API client function
- form submit handler
- auth/session/state orchestration function
- route loader/action/helper function
- test helper function

규칙:

- 문구는 반드시 `// 기능 : `으로 시작한다.
- 한 줄로 쓴다.
- 호출자 또는 사용자가 기대하는 기능을 한국어로 적는다.
- 함수명을 단순 번역하지 않는다.
- 복잡한 anonymous callback은 이름 있는 함수로 추출한 뒤 기능 주석을 단다.

## 3. Numbered Step Comment

함수 내부에 실제 처리 흐름이 있으면 번호 주석을 둔다.

```ts
// 기능 : 현재 외부 인증 세션을 Backend 앱 세션으로 교환합니다.
async function exchangeCurrentExternalAuthSession() {
  // 1. 외부 인증 브라우저 클라이언트를 생성한다.
  const client = createBrowserExternalAuthClient();

  // 2. 브라우저에 저장된 외부 인증 세션을 읽는다.
  const session = await client.auth.getSession();

  // 3. 외부 인증 token을 Backend 앱 세션으로 교환한다.
  return exchangeExternalAuthToken(session.accessToken);
}
```

필수 대상:

- 로그인, 회원가입, 로그아웃, token refresh 흐름
- route redirect, callback, navigation 흐름
- API client 요청/응답 변환 흐름
- form submit, validation, mutation 흐름
- popup, modal, async polling, timeout 흐름
- localStorage/sessionStorage/cache state 복원 흐름

규칙:

- TypeScript/TSX 파일은 `// 1. ...`, `// 2. ...` 형식을 사용한다.
- 번호 주석은 코드 한 줄의 번역이 아니라 사용자 행동, 상태 전환, API 흐름의 의도를 설명한다.
- 단순 JSX markup 구획, import, type 선언, 상수 선언에는 numbered step comment를 붙이지 않는다.
- 한 줄 helper라도 새로 작성하거나 수정하는 함수라면 최소한 `// 기능 : ...` 주석은 둔다.

## 4. Frontend Logging

Frontend logs go through a logger wrapper.

Channels:

- Sentry for errors/warnings
- analytics channel only after an explicit analytics scope is introduced
- debug logger only in development

Rules:

- no direct `console.log`
- no PII in logs
- short English event key
- context object
- normal 401/403 flows are not noisy errors
- do not catch and silently ignore errors

## 5. Admin Logging Boundary

Admin has two separate concepts:

- client logs: browser/UI errors and non-sensitive events

Rules:

- client logs must not contain secret, token, or sensitive user input
- PII and reason text do not go to Sentry/client logs

## 6. 금지

- 주석 없이 새 component/function/hook/API client function을 추가하지 않는다.
- `// 기능 : 처리합니다.`처럼 의미가 비어 있는 주석을 쓰지 않는다.
- numbered step comment를 코드 한 줄 한 줄 번역하는 방식으로 쓰지 않는다.
- JSX 구조 설명용 `header`, `body` 같은 주석을 남발하지 않는다.
- commented-out code를 남기지 않는다.
- `console.log`를 사용하지 않는다.

## 7. Review Checklist

- Frontend component/function/hook에 `// 기능 : ...` 주석이 있는가?
- 함수 내부의 주요 상태 전환, API 호출, redirect, storage 처리 흐름이 numbered step comment로 읽히는가?
- 주석이 함수명 번역이 아니라 사용자 행동, 상태 전환, 처리 의도를 설명하는가?
- 직접 `console.log`가 없는가?
- PII가 client log로 나가지 않는가?

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
