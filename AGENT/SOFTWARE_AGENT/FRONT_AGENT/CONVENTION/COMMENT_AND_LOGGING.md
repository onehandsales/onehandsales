# Front Comment And Logging Convention

## 1. 목적

이 문서는 `FE/user-web`과 `FE/admin-web`의 주석과 로깅 기준을 정의한다.

Frontend에서는 사용자가 보는 화면과 상태 전환을 명확히 표현하는 이름을 우선하고, 함수와 컴포넌트에는 기능 주석을 둔다.

## 2. Function Comment

Frontend 함수와 컴포넌트에는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// 기능 : 회사 목록 화면을 렌더링합니다.
export function CompanyListPage() {
  // ...
}

// 기능 : 회사 생성 form 제출을 처리합니다.
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
- test helper function

규칙:

- 문구는 반드시 `// 기능 : `으로 시작한다.
- 한 줄로 쓴다.
- 호출자 또는 사용자가 기대하는 기능을 한국어로 적는다.
- 함수명을 단순 번역하지 않는다.
- 복잡한 anonymous callback은 이름 있는 함수로 추출한 뒤 기능 주석을 단다.

## 3. Frontend Logging

Frontend logs go through a logger wrapper.

Channels:

- Sentry for errors/warnings
- analytics for meaningful product events when introduced
- debug logger only in development

Rules:

- no direct `console.log`
- no PII in logs
- short English event key
- context object
- normal 401/403 flows are not noisy errors
- do not catch and silently ignore errors

## 4. Admin Logging Boundary

Admin has two separate concepts:

- client logs: browser/UI errors and non-sensitive events
- audit logs: backend records of Admin actions

Rules:

- client does not write audit logs directly
- reason text goes to backend audit flow only
- PII and reason text do not go to Sentry/client logs

## 5. 금지

- JSX 구조 설명용 `header`, `body` 같은 주석을 남발하지 않는다.
- commented-out code를 남기지 않는다.
- `console.log`를 사용하지 않는다.
- phone, email, token, memo, meeting note body, deal amount를 plain text로 logging하지 않는다.

## 6. Review Checklist

- Frontend component/function/hook에 `// 기능 : ...` 주석이 있는가?
- 직접 `console.log`가 없는가?
- PII가 client log로 나가지 않는가?
- Admin 원문 조회 사유가 client log나 Sentry에 남지 않는가?

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
