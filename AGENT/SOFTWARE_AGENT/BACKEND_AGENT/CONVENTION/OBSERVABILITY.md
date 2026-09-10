# Backend Observability Convention

## 1. 목적

이 문서는 Backend가 운영 중 문제를 추적할 수 있도록 structured log, request context, error context를 어떻게 남길지 정의한다.

초기 단계에서는 별도 APM이나 복잡한 metrics 체계를 필수로 하지 않는다. 대신 모든 기능이 구조화 로그와 redaction 기준을 지키도록 해서, 나중에 tracing과 metrics를 붙일 수 있는 형태를 유지한다.

## 2. 범위

- application log: 시스템 동작과 오류를 추적하기 위한 구조화 로그
- request context: 하나의 HTTP 요청을 묶는 request id, user id, route, method
- provider context: 외부 Provider 호출의 성공, 실패, latency, retry 여부
- redaction: PII, token, 민감 본문, provider raw payload가 로그에 남지 않게 하는 규칙

## 3. Log Event Key

log event key는 domain.action 형식을 사용한다.

예:

```text
auth.exchange.succeeded
company.created
meeting_note.ai_draft.failed
import.confirm.completed
provider.openai.failed
```

규칙:

- key는 snake_case 또는 dot-separated lowercase를 사용한다.
- 한 번 만든 key는 의미를 바꾸지 않는다.
- 동적 값은 key에 넣지 않고 context 필드로 둔다.
- user 입력 원문은 context에 넣지 않는다.

## 4. Request Context

모든 HTTP 요청은 request id를 가져야 한다.

기본 context:

- request id
- method
- route pattern
- user id가 확인된 경우 user id
- status code
- duration ms

주의:

- authorization header를 logging하지 않는다.
- refresh token, provider token, Supabase raw token을 logging하지 않는다.
- query string에는 검색어 원문이 있을 수 있으므로 raw URL 전체를 logging하지 않는다.

## 5. Provider Context

외부 Provider 호출은 port/adapter 경계에서 logging한다.

포함 가능한 정보:

- provider name
- operation name
- model 또는 API version
- success/failure
- latency ms
- retryable 여부
- safe error code

포함 금지:

- provider API key
- prompt 원문
- transcript 원문
- provider raw response 전체
- 사용자 민감 메모 또는 회의록 본문

## 6. Redaction

다음 값은 application log에 평문으로 남기지 않는다.

- access token, refresh token, authorization header
- email verification token, OAuth provider token
- 개인 비밀 메모 원문
- meeting note body
- provider prompt와 raw response
- 검색어 원문
- 파일 원본 내용

필요한 경우 count, boolean, enum, length, hash 같은 안전한 summary만 남긴다.

## 7. Error Logging

global exception filter는 아래를 남긴다.

- request id
- route pattern
- status code
- domain error code가 있으면 error code
- safe message
- stack trace는 server log에만 남기고 client response에는 노출하지 않는다.

Validation error는 field name과 constraint 정도만 남기며 사용자 입력값 원문은 남기지 않는다.

## 8. API 계약 반영

API 명세에는 아래를 적는다.

- application log event key
- request id 사용 여부
- redaction 대상
- 외부 Provider 호출 logging 위치
- provider error context

mutation, 민감정보, 외부 Provider API는 observability 항목을 생략하지 않는다.

## 9. 금지 사항

- `console.log`로 임시 로그를 남긴 채 커밋하지 않는다.
- token, refresh token, authorization header를 logging하지 않는다.
- 민감 메모, meeting note body, deal amount를 평문 logging하지 않는다.
- request id 없이 외부 Provider 실패를 남기지 않는다.
- provider raw response 전체를 로그에 저장하지 않는다.

## 10. Review Checklist

- API 명세에 observability 항목이 있는가?
- 민감정보가 redaction 대상인지 명시됐는가?
- 외부 Provider 실패 로그의 event key와 context가 정의됐는가?
- request id가 exception filter와 logger에서 이어질 수 있는가?
- 로그 context에 사용자 입력 원문이나 secret이 들어가지 않는가?

## 11. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
