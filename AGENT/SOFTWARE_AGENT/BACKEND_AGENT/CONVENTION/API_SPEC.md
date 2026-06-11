# API 명세 작성 규칙

## 1. 목적

이 문서는 Backend API 명세서를 작성할 때 반드시 포함해야 하는 항목과 작성 방식을 정의한다.

Frontend와 Backend는 같은 요구사항과 기획을 바라보지만 역할이 다르다. Frontend는 화면, 상태, 사용자 입력과 피드백을 구현하고, Backend는 API, 비즈니스 로직, 데이터 저장과 보안 정책을 구현한다. 따라서 API 명세서는 두 역할이 같은 기능을 같은 의미로 이해하도록 연결하는 계약 문서여야 한다.

## 2. 적용 대상

다음 문서에 적용한다.

- `TODO/{PLAN_NAME}/COMMON/API-SPEC/*`
- `TODO/{PLAN_NAME}/BE-TODO/API-TODO.md`
- Backend API 명세를 포함하는 모든 TODO 문서
- Backend API 계약을 설명하는 AGENT 문서

## 3. API 명세 필수 항목

API 명세에는 API마다 다음 항목을 반드시 작성한다.

### API 이름

사용자가 이해할 수 있는 기능 이름과 개발자가 식별할 수 있는 API 이름을 함께 적는다.

예:

```text
API 이름: 회사 생성 API
API 식별자: CreateCompany
```

### HTTP 정보

Method와 path를 적는다.

예:

```text
Method: POST
Path: /api/companies
```

### Request 이름

요청 DTO 또는 request object 이름을 적는다.

예:

```text
Request 이름: CreateCompanyRequest
```

### Request 필드

각 필드의 타입, 필수 여부, validation, 설명을 적는다. path param, query, header, body를 섞어 쓰지 말고 API 실행자가 그대로 DTO를 만들 수 있게 구분한다.

예:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `companyName` | string | 필수 | 회사명 |
| `companyFieldId` | string | 필수 | 회사 분야 ID |
| `companyRegionId` | string | 필수 | 회사 지역 ID |
| `companyMemo` | string | 선택 | 생성 시 함께 남길 초기 회사 메모 |

### 비즈니스 로직 흐름

Controller에서 끝나는 설명이 아니라 application use case 기준으로 실제 흐름을 단계별로 적는다.

반드시 포함할 내용:

- 인증과 권한 확인
- 사용자 소유권 검증
- validation 이후 처리
- 중복 또는 예외 처리
- transaction 필요 여부
- 자동 생성되는 부수 데이터
- 감사 로그 필요 여부
- 외부 Provider 호출 여부
- 암호화 또는 masking 여부
- response body 없는 성공 응답 처리

예:

```text
1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. 같은 userId 안에서 회사 분야와 회사 지역 소유권을 확인한다.
4. 같은 userId 안에서 회사명 중복 후보를 확인한다.
5. Company entity를 생성한다.
6. `companyMemo`가 있으면 CompanyMemoLog 초기 데이터를 같은 transaction에서 생성한다.
7. 저장된 Company를 CompanyResponse로 변환한다.
```

### Response 이름

응답 DTO 또는 response object 이름을 적는다.

예:

```text
Response 이름: CompanyResponse
```

### Response 필드

응답 필드의 타입과 설명을 적는다. 성공 status와 response body 유무를 반드시 먼저 적고, body가 있으면 response DTO 이름, 필드명, 타입, nullable 여부, 예시를 함께 적는다.

예:

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 회사 ID |
| `companyName` | string | 회사명 |
| `companyField` | object | 회사 분야 |
| `companyRegion` | object | 회사 지역 |
| `createdAt` | string | 생성일 |

### 연결된 DB 스키마

해당 API가 읽거나 쓰는 DB model을 모두 적는다.

반드시 구분할 내용:

- 생성하는 model
- 조회하는 model
- 수정하는 model
- soft delete 처리 model
- transaction에 함께 묶이는 model
- 감사 로그 model

예:

```text
연결된 DB 스키마:

- 생성: Company
- 조회: User, CompanyField, CompanyRegion
- transaction: Company와 초기 CompanyMemoLog를 함께 만들 때 필요
- 감사 로그: 없음
```

### 에러 응답

예상 가능한 domain/application error와 HTTP status를 적는다.

예:

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | Unauthorized | 401 |
| 회사명 누락 | ValidationError | 400 |
| 중복 회사 후보 존재 | DuplicateCompanyCandidate | 409 |

### FE/BE 처리 기준

API 명세에는 FE와 BE가 각각 어떤 처리를 해야 하는지도 적는다.

반드시 포함할 내용:

- FE가 성공 status를 받은 뒤 재조회할 query 또는 갱신할 상태
- FE가 response body 없는 성공 응답을 처리하는 방식
- FE가 domain error를 사용자에게 표시하는 방식
- BE의 application use case 이름 또는 책임
- BE의 transaction, repository, port/adapter 책임
- 테스트해야 할 정상/에러 흐름

## 4. 권장 API 명세 템플릿

```text
## API 이름

- API 이름:
- API 식별자:
- Method:
- Path:
- 인증:
- 권한:

### 목적

이 API가 사용자의 어떤 행동을 처리하는지 적는다.

### Request

- Request 이름:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|

### 비즈니스 로직 흐름

1. ...
2. ...
3. ...

### Response

- Response 이름:
- Status:
- Body:

| 필드 | 타입 | 설명 |
|---|---|---|

### 연결된 DB 스키마

- 생성:
- 조회:
- 수정:
- 삭제:
- 감사 로그:
- transaction:

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|

### FE/BE 처리 기준

- FE:
- BE:
- 검증:

### 관련 문서

- `TODO/{PLAN_NAME}/COMMON/USER-FLOW.md`
- `TODO/{PLAN_NAME}/COMMON/GOAL-WORK-ORDER.md`
- `TODO/{PLAN_NAME}/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
```

## 5. 금지 사항

- API path와 method만 적고 비즈니스 로직을 생략하지 않는다.
- request/response 이름 없이 필드만 나열하지 않는다.
- request의 path param, query, header, body를 구분하지 않은 채 뭉뚱그려 쓰지 않는다.
- success status와 response body 유무를 생략하지 않는다.
- DB model 연결을 생략하지 않는다.
- Frontend 화면 요구사항과 연결하지 않고 Backend 관점만 적지 않는다.
- Admin API의 권한, masking, 감사 로그 여부를 생략하지 않는다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
