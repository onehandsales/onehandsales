# TODO Software Agent Reference

## 1. 목적

`TODO` 아래에 작성되는 모든 계획 문서, API 계약 문서, FE/BE 작업 문서는 작성 전에 `AGENT/SOFTWARE_AGENT` 전체 정본을 먼저 참고해야 한다.

이 문서는 그 필수 선행 문서 목록과 TODO 문서 작성 시 반드시 구체화해야 하는 API/비즈니스 로직 기준을 고정한다.

## 2. 필수 선행 문서

`TODO` 문서를 새로 만들거나 수정하는 작업자는 아래 `AGENT/SOFTWARE_AGENT` 문서를 모두 먼저 읽고, 해당 계획에 영향을 주는 기준을 TODO 문서에 반영한다.

### Backend Agent

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/002_backend_rules_absorption.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/003_backend_testing.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/004_backend_deployment_environment.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/006_backend_transaction_observability_api_contract.md`

### Front Agent

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/002_frontend_admin_rules_absorption.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/003_frontend_testing.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/004_frontend_deployment_environment.md`

### DB Schema

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`

## 3. TODO 문서 작성 필수 기준

`TODO` 문서는 단순 작업 목록이 아니라 구현자가 바로 실행할 수 있는 계약 문서여야 한다.

따라서 API, DB, FE/BE 작업 문서에는 아래 항목을 반드시 상세하게 적는다.

- 요청값 형태: HTTP method/path, path param, query, header, body, 필수 여부, validation 기준
- 응답값 형태: success status, response body 유무, response DTO 이름, 필드명, 타입, nullable 여부, 예시
- 내부 비즈니스 로직: 인증, 권한, ownership, validation 이후 흐름, transaction, 외부 Provider 호출, 자동 생성 데이터, 암호화, 감사 로그, 에러 분기
- 연결 DB: 생성/조회/수정/삭제 model, relation, transaction 대상, soft delete 여부, 감사 로그 model
- 에러 응답: status, domain error code, 사용자가 보게 될 처리 기준
- FE 처리 기준: body 없는 성공 응답 처리, 재조회 범위, optimistic update 여부, route guard, 권한 없음 처리
- BE 처리 기준: Clean Architecture 계층, application use case, repository/port, infrastructure adapter, User/Admin API 분리, 구현 검증 범위
- Backend 주석 기준: class/interface의 `// 역할 : ...`, API controller method의 `// API : ...`, 내부 method/function의 `// 기능 : ...`, 주요 orchestration의 numbered step comment
- API 계약 기준: 계약 상태, 소비자, 호환성, request/response/error 계약, DB schema 연결
- Transaction 기준: 필요 여부, 이유, transaction model, rollback 범위, audit log 포함 여부, 외부 Provider 호출 위치
- Observability 기준: log event key, audit log 필요 여부, request id, redaction, provider error context

## 4. API 계약 작성 규칙

API 계약 문서는 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`와 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`를 함께 따른다.

특히 아래 중 하나라도 빠진 API 명세는 완료된 TODO 문서로 보지 않는다.

- API 이름과 API 식별자
- 계약 상태와 소비자
- Method와 path
- Request 이름과 request 필드 표
- Response 이름과 response 필드 표
- 성공 status와 response body 유무
- 내부 비즈니스 로직 흐름
- 연결된 DB 스키마
- transaction 필요 여부와 rollback 범위
- observability event key, audit log, redaction 기준
- 에러 응답
- FE가 성공/실패를 처리하는 방식

## 5. 기존 TODO 문서 갱신 규칙

기존 `TODO` 문서를 수정할 때도 새 문서와 같은 기준을 적용한다.

- 계획 README에는 이 문서를 필수 선행 정본으로 연결한다.
- COMMON 문서에는 이 문서를 기준으로 API/FE/BE 계약을 썼다는 내용을 남긴다.
- FE/BE goal 문서의 `반드시 먼저 읽을 문서` 목록에는 이 문서를 포함한다.
- API 계약 문서가 있으면 request, response, 내부 비즈니스 로직, DB 연결, 에러 응답을 누락 없이 보강한다.
- 새 API가 포함된 goal은 구현 전에 API 계약 상태를 최소 `confirmed`로 만들고 transaction/observability 항목을 채운다.
- API 계약이 없거나 `draft`이면 구현 goal로 들어가지 않고 계약 보완 goal을 먼저 둔다.

## 6. 활성 TODO 재검토 산출물 기준

활성 TODO 전체를 재검토할 때는 `TODO/DONE`을 제외하고, 현재 작업 가능한 계획 폴더만 대상으로 삼는다.

재검토 결과에는 아래 내용을 남긴다.

- 검토 기준일과 검토 대상
- Backend API 구현 여부와 구현 근거
- API 명세의 request 형태, response 형태, 내부 비즈니스 로직 작성 여부
- API 계약 상태와 실제 Backend 구현 상태의 일치 여부
- Frontend에 남은 작업의 목적
- Frontend가 우선 처리해야 할 화면, API client, 상태 관리, 검색/필터/다운로드 흐름
- 발견한 문서 링크 오류와 상태 불일치

활성 TODO 전체 재검토 결과는 기본적으로 `TODO/ACTIVE_BACKEND_API_FE_REVIEW.md`에 남긴다. 특정 계획 안의 세부 보완은 해당 계획의 `README.md`, `COMMON/WORK-SPLIT.md`, `FE-TODO`, `COMMON/API-SPEC`에 함께 반영한다.

## 7. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `TODO/README.md`
