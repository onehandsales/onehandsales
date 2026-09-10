# Backend API Contract Convention

## 1. 목적

이 문서는 API 계약 문서를 어떻게 만들고, Backend 구현과 Frontend 사용 계약을 어떻게 맞출지 정의한다.

`API_SPEC.md`가 API 명세의 필수 항목과 템플릿이라면, 이 문서는 API 계약의 생명주기와 완료 기준을 정의한다.

## 2. API 계약의 위치

새 기능이 API를 포함하면 계약 문서는 해당 계획 폴더의 `COMMON/API-SPEC` 아래에 둔다.

```text
TODO/{PLAN_NAME}/
  COMMON/
    API-SPEC/
      <DOMAIN>_API.md
```

규칙:

- Frontend와 Backend가 함께 보는 API 계약은 `COMMON/API-SPEC`에 둔다.
- Backend 내부 구현 상세만 있는 문서는 `BE-TODO`에 둔다.
- Frontend 화면 상태와 API 사용 방식은 `FE-TODO`에 둔다.
- 같은 API를 `COMMON`, `FE-TODO`, `BE-TODO`에 서로 다른 계약으로 중복 작성하지 않는다.

## 3. API 계약 작성 시점

아래 상황에서는 구현 전에 API 계약을 먼저 작성하거나 갱신한다.

- 새 HTTP endpoint를 추가한다.
- request 또는 response 필드를 바꾼다.
- success status 또는 response body 유무를 바꾼다.
- error code, HTTP status, validation 정책을 바꾼다.
- transaction, redaction, masking, ownership 정책이 바뀐다.
- Frontend API client가 기대하는 path나 응답 형태가 바뀐다.

API 계약이 없는 상태에서 FE 또는 BE 구현을 먼저 시작하지 않는다.

## 4. API 계약 필수 항목

API 계약은 `API_SPEC.md`의 항목을 따르며, 추가로 아래 항목을 반드시 포함한다.

### 계약 상태

```text
계약 상태: draft / confirmed / implemented / deprecated
```

- `draft`: 구현 전 초안
- `confirmed`: FE/BE가 구현 가능한 수준으로 확정
- `implemented`: Backend 구현과 검증이 완료
- `deprecated`: 더 이상 새 코드에서 사용하지 않음

### API 소비자

```text
소비자:
- User Web
- Admin Web
- Backend internal
```

### 호환성

```text
호환성:
- breaking change 여부:
- 기존 FE 영향:
- migration 또는 fallback:
```

### Transaction 계약

`TRANSACTION.md` 기준으로 아래 항목을 적는다.

- transaction 필요 여부
- 변경 model
- rollback 범위
- 부수 로그/이력 transaction 포함 여부
- 외부 Provider 호출 위치

### Observability 계약

`OBSERVABILITY.md` 기준으로 아래 항목을 적는다.

- log event key
- 구조화 로그 필요 여부
- request id 사용 여부
- redaction 대상
- provider error context

## 5. Request 계약

Request는 아래를 구분해서 작성한다.

- path param
- query
- header
- cookie
- body

각 필드는 타입, 필수 여부, nullable 여부, validation, 예시를 적는다.

규칙:

- DTO 이름을 반드시 적는다.
- `undefined`와 `null`의 의미를 구분한다.
- 빈 문자열 허용 여부를 적는다.
- enum 값은 가능한 값과 의미를 함께 적는다.
- FE가 보내면 안 되는 필드는 request에 포함하지 않는다.

## 6. Response 계약

Response는 성공 status와 body 유무를 먼저 적는다.

규칙:

- response DTO 이름을 반드시 적는다.
- body가 없으면 `Body: 없음`이라고 적는다.
- nullable 필드는 `null` 가능 여부를 표시한다.
- 날짜는 ISO string 기준으로 적는다.
- 목록 API는 pagination, filtering, sorting 계약을 포함한다.

## 7. Error 계약

Error response는 domain/application error code와 HTTP status를 함께 적는다.

필수 항목:

| 항목 | 설명 |
|---|---|
| 상황 | 사용자가 어떤 상태에서 에러를 만나는지 |
| error code | Backend domain/application error code |
| HTTP status | client가 받는 status |
| FE 처리 | 사용자 표시, 재시도, form field error 처리 |
| log level | 운영 로그 기준 |

규칙:

- validation error와 domain error를 구분한다.
- 권한 없음과 소유권 없음은 client 응답에서 정보 노출을 피한다.

## 8. FE/BE 동기화 기준

API 계약을 변경하면 아래를 함께 확인한다.

- Backend controller path, method, DTO가 계약과 맞는가?
- Backend application use case 입력과 계약이 맞는가?
- Frontend API client path, request, response type이 계약과 맞는가?
- TanStack Query key 또는 cache invalidation 범위가 계약과 맞는가?
- response body 없는 성공 응답을 FE가 처리할 수 있는가?
- Admin Web과 User Web이 서로의 API를 호출하지 않는가?

## 9. Goal 실행 기준

`/goal`로 기능을 구현할 때 API가 포함되어 있으면 시작 전에 아래를 확인한다.

- 해당 goal이 참조하는 `COMMON/API-SPEC/*` 문서가 있다.
- API 계약 상태가 최소 `confirmed`이다.
- transaction 항목이 `필요`, `없음`, `보류` 중 하나로 표시되어 있다.
- observability 항목이 mutation/민감정보/외부 Provider 범위에 맞게 작성되어 있다.
- FE 영향 또는 BE-only 여부가 명시되어 있다.
- DB schema 문서와 API request/response가 연결되어 있다.

API 계약이 없거나 draft 상태라면 먼저 계약 문서를 보완하는 goal로 분리한다.

## 10. 금지 사항

- API 구현 후 문서를 나중에 맞춘다고 두지 않는다.
- request/response 타입을 FE 코드에서만 추론하게 하지 않는다.
- API path와 method만 있고 transaction, observability, error 계약이 없는 문서를 완료로 보지 않는다.
- User API와 관리자 확인 API를 같은 계약 안에서 role 분기로 처리하지 않는다.
- breaking change를 기존 FE 영향 없이 처리된 것처럼 표시하지 않는다.
- 민감정보를 일반 상세 API response에 불필요하게 섞지 않는다.

## 11. Review Checklist

- `COMMON/API-SPEC`에 API 계약 문서가 있는가?
- 계약 상태와 소비자가 명시되어 있는가?
- request와 response DTO 이름이 있는가?
- success status와 body 유무가 명확한가?
- transaction 계약이 `TRANSACTION.md` 기준으로 작성됐는가?
- observability 계약이 `OBSERVABILITY.md` 기준으로 작성됐는가?
- error response와 FE 처리 기준이 연결되어 있는가?
- FE API client와 BE controller/use case가 같은 계약을 바라보는가?

## 12. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
