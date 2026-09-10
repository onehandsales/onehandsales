# Backend Transaction, Observability, API Contract 보강 결정

## 1. 결정

Backend 새 기능과 TODO `/goal` 실행은 앞으로 아래 세 기준을 함께 반영한다.

- transaction 경계와 rollback 범위
- structured log, request context 중심의 observability
- Frontend와 Backend가 함께 보는 API contract 문서

테스트 작성은 이 결정의 필수 범위에 넣지 않는다. 초기 단계에서는 transaction, observability, API 계약을 먼저 문서와 구현 흐름에 고정한다.

## 2. 배경

현재 Backend는 Clean Architecture 계층, User API와 관리자 권한 확인 API 분리, Prisma infrastructure-only 원칙을 따르고 있다.

다만 실무 운영 수준으로 가려면 기능을 추가할 때마다 다음 정보가 명확해야 한다.

- 어떤 DB 변경이 같은 transaction으로 묶이는가?
- 실패하면 어디까지 rollback되어야 하는가?
- 운영 중 장애나 사용자 신고가 들어오면 어떤 request id와 log event로 추적하는가?
- 구조화 로그와 redaction 기준이 충분한지 어떻게 판단하는가?
- FE와 BE가 같은 request/response/error 계약을 보고 구현하는가?

이 기준이 TODO와 API 명세에 없으면 구현자가 goal마다 임의로 판단하게 된다.

## 3. 적용 규칙

- transaction 기준은 `CONVENTION/TRANSACTION.md`를 따른다.
- observability 기준은 `CONVENTION/OBSERVABILITY.md`를 따른다.
- API contract 기준은 `CONVENTION/API_CONTRACT.md`와 `CONVENTION/API_SPEC.md`를 함께 따른다.
- 새 API가 포함된 TODO는 `COMMON/API-SPEC/*`에 transaction과 observability 항목을 반드시 둔다.
- BE-TODO는 application use case, repository/port, infrastructure adapter와 함께 transaction 경계를 명시한다.
- mutation, 민감정보, 외부 Provider 기능은 structured log와 redaction 필요 여부를 반드시 판단한다.

## 4. TODO와 Goal 영향

앞으로 `/goal` 실행 전에는 아래를 확인한다.

- API 계약 문서가 있고 계약 상태가 최소 `confirmed`인가?
- transaction 필요 여부가 `필요`, `없음`, `보류` 중 하나로 명시됐는가?
- observability 항목에 log event key, request id, redaction 기준이 있는가?
- API error response가 FE 처리 기준과 연결되어 있는가?
- DB schema 문서와 API request/response가 연결되어 있는가?

누락되어 있으면 구현 goal로 바로 들어가지 않고 문서 보완 goal을 먼저 수행한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
