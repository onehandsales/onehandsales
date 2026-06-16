# Contact API Detail

## 1. 목적

이 문서는 `CONTACT_DOMAIN_PLAN`에서 사용하는 담당자 API의 요청값, 응답값, 내부 비즈니스 로직, 연결 DB, transaction, observability, 에러, FE/BE 처리 기준을 고정한다.

작성 기준:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`

## 2. 공통 규칙

- User API는 `/api/*`를 사용한다.
- 모든 API는 `AuthGuard`가 필요하다.
- 모든 API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 모든 데이터는 현재 로그인한 `userId` ownership으로 조회, 생성, 수정, 삭제한다.
- `Contact`는 반드시 `Company`에 소속된다.
- `Contact.companyId`는 필수다.
- `Contact.mobile`은 `010-1111-2222` 형식만 허용한다.
- `Contact.email`은 이메일 형식만 허용한다.
- 담당자 목록은 10개 단위 페이지네이션이다.
- 담당자 일반/개인 비밀 메모 로그는 10개 단위 cursor 무한스크롤이다.
- 상태값만 반환하는 생성/수정/삭제 API는 response body가 없다.
- 개인 비밀 메모 원문은 DB, application log, audit log에 저장하거나 출력하지 않는다.
- 이 계획에서는 관리자 API, 휴지통, soft delete, 명함 OCR 저장 연동을 만들지 않는다.

## 3. API 목록

1. 담당자 페이지네이션 API: `GET /api/contacts`
2. 담당자 필터용 회사 전체 조회 API: `GET /api/contacts/company-options`
3. 담당자 필터용 직급 전체 조회 API: `GET /api/contact-job-grades`
4. 담당자 직급 단건 생성 API: `POST /api/contact-job-grades`
5. 담당자 직급 단건 삭제 API: `DELETE /api/contact-job-grades/:jobGradeId`
6. 담당자 필터용 부서 전체 조회 API: `GET /api/contact-departments`
7. 담당자 부서 단건 생성 API: `POST /api/contact-departments`
8. 담당자 부서 단건 삭제 API: `DELETE /api/contact-departments/:departmentId`
9. 담당자 단건 생성 API: `POST /api/contacts`
10. 담당자 단건 조회 API: `GET /api/contacts/:contactId`
11. 담당자 기본 정보 수정 API: `PATCH /api/contacts/:contactId`
12. 담당자 일반 메모 로그 단건 생성 API: `POST /api/contacts/:contactId/memo-logs`
13. 담당자 일반 메모 로그 무한스크롤 API: `GET /api/contacts/:contactId/memo-logs`
14. 담당자 일반 메모 로그 단건 수정 API: `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
15. 담당자 개인 비밀 메모 로그 단건 생성 API: `POST /api/contacts/:contactId/private-memo-logs`
16. 담당자 개인 비밀 메모 로그 무한스크롤 API: `GET /api/contacts/:contactId/private-memo-logs`
17. 담당자 개인 비밀 메모 로그 단건 수정 API: `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`
18. 담당자 목록 xlsx 내보내기 API: `GET /api/contacts/export/xlsx`

## 4. API 계약 상태 요약

모든 API의 소비자는 `User Web`이며, Backend 구현 후 계약 상태는 `implemented`다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/contacts` | implemented | 없음. 조회 전용 | event key: `contact.listed`, audit log: 없음, request id: 사용, redaction: 이름/핸드폰/이메일 원문 logging 금지 |
| `GET /api/contacts/export/xlsx` | implemented | 없음. 조회 전용 | event key: `contact.exported`, audit log: 없음, request id: 사용, redaction: 이름/핸드폰/이메일 원문 logging 금지 |
| `GET /api/contacts/company-options` | implemented | 없음. 조회 전용 | event key: `contact.companyOptionsListed`, audit log: 없음, request id: 사용, redaction: 회사 검색어 없음 |
| `GET /api/contact-job-grades` | implemented | 없음. 조회 전용 | event key: `contactJobGrade.listed`, audit log: 없음, request id: 사용, redaction: 없음 |
| `POST /api/contact-job-grades` | implemented | 없음. 단일 `ContactJobGrade` 생성 | event key: `contactJobGrade.created`, audit log: 없음, request id: 사용, redaction: 없음 |
| `DELETE /api/contact-job-grades/:jobGradeId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `contactJobGrade.deleted`, audit log: 없음, request id: 사용, redaction: 없음 |
| `GET /api/contact-departments` | implemented | 없음. 조회 전용 | event key: `contactDepartment.listed`, audit log: 없음, request id: 사용, redaction: 없음 |
| `POST /api/contact-departments` | implemented | 없음. 단일 `ContactDepartment` 생성 | event key: `contactDepartment.created`, audit log: 없음, request id: 사용, redaction: 없음 |
| `DELETE /api/contact-departments/:departmentId` | implemented | 없음. 사용 여부 검증 후 단일 삭제 | event key: `contactDepartment.deleted`, audit log: 없음, request id: 사용, redaction: 없음 |
| `POST /api/contacts` | implemented | 필요. `Contact`와 조건부 `ContactMemoLog`를 같은 transaction에서 생성 | event key: `contact.created`, audit log: 없음, request id: 사용, redaction: `contactMemo`, `mobile`, `email` 원문 logging 금지 |
| `GET /api/contacts/:contactId` | implemented | 없음. 조회 전용 | event key: `contact.viewed`, audit log: 없음, request id: 사용, redaction: 핸드폰/이메일 원문 logging 금지 |
| `PATCH /api/contacts/:contactId` | implemented | 없음. 단일 `Contact` 수정 | event key: `contact.updated`, audit log: 없음, request id: 사용, redaction: 핸드폰/이메일 원문 logging 금지 |
| `POST /api/contacts/:contactId/memo-logs` | implemented | 없음. 담당자 ownership 확인 후 단일 `ContactMemoLog` 생성 | event key: `contactMemoLog.created`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `GET /api/contacts/:contactId/memo-logs` | implemented | 없음. 조회 전용 | event key: `contactMemoLog.listed`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `PATCH /api/contacts/:contactId/memo-logs/:memoLogId` | implemented | 없음. 단일 `ContactMemoLog` 수정 | event key: `contactMemoLog.updated`, audit log: 없음, request id: 사용, redaction: `memo` 원문 logging 금지 |
| `POST /api/contacts/:contactId/private-memo-logs` | implemented | 없음. 암호화 후 단일 `ContactUserPrivateMemoLog` 생성 | event key: `contactPrivateMemoLog.created`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `GET /api/contacts/:contactId/private-memo-logs` | implemented | 없음. 작성자 본인 로그 조회와 복호화 | event key: `contactPrivateMemoLog.listed`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |
| `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId` | implemented | 없음. 암호화 후 단일 `ContactUserPrivateMemoLog` 수정 | event key: `contactPrivateMemoLog.updated`, audit log: 없음, request id: 사용, redaction: 개인 비밀 메모 원문 logging 금지 |

## 5. 담당자 페이지네이션 API

- API 이름: 담당자 페이지네이션 API
- API 식별자: `ListContacts`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API, 기존 FE contact API 재정렬 필요
- Method: `GET`
- Path: `/api/contacts`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 조회

### 목적

담당자 목록 화면에서 담당자 이름 검색, 회사 필터, 담당자 부서 필터, 담당자 직급 필터, 10개 단위 페이지네이션을 제공한다.

### Request

- Request 이름: `ListContactsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | `page` | number | 아니오 | 정수, 1 이상 | 1부터 시작. 기본값 1 |
| query | `username` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 담당자 이름 부분 검색어 |
| query | `companyId` | string | 아니오 | UUID | 회사 필터 ID |
| query | `contactDepartmentId` | string | 아니오 | UUID | 담당자 부서 필터 ID |
| query | `contactJobGradeId` | string | 아니오 | UUID | 담당자 직급 필터 ID |

서버는 `pageSize`를 10으로 고정한다. FE는 `pageSize` query를 보내지 않는다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation한다.
3. `username`을 trim하고 값이 있으면 이름 부분 검색 조건을 적용한다.
4. `companyId`가 있으면 현재 사용자의 회사인지 검증한다.
5. `contactDepartmentId`가 있으면 현재 사용자의 담당자 부서인지 검증한다.
6. `contactJobGradeId`가 있으면 현재 사용자의 담당자 직급인지 검증한다.
7. `userId` 조건을 기본으로 적용한다.
8. `createdAt DESC`, `id DESC`로 정렬하고 10개 단위로 조회한다.
9. 목록 응답으로 변환할 때 `updatedAt`은 넣지 않는다.

### Response

- Response 이름: `ContactPageResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactListItemResponse[]` | 아니오 | 담당자 목록 |
| `page` | number | 아니오 | 현재 페이지 |
| `pageSize` | number | 아니오 | 10 |
| `totalCount` | number | 아니오 | 조건에 맞는 전체 담당자 수 |
| `totalPages` | number | 아니오 | 전체 페이지 수 |

`ContactListItemResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 담당자 ID |
| `company` | object | 아니오 | 소속 회사 |
| `company.id` | string | 아니오 | 회사 ID |
| `company.companyName` | string | 아니오 | 회사 이름 |
| `username` | string | 아니오 | 담당자 이름 |
| `mobile` | string | 아니오 | `010-1111-2222` 형식 핸드폰번호 |
| `email` | string | 아니오 | 이메일 |
| `contactDepartment` | object | 아니오 | 담당자 부서 |
| `contactDepartment.id` | string | 아니오 | 담당자 부서 ID |
| `contactDepartment.departmentName` | string | 아니오 | 담당자 부서명 |
| `contactJobGrade` | object | 아니오 | 담당자 직급 |
| `contactJobGrade.id` | string | 아니오 | 담당자 직급 ID |
| `contactJobGrade.jobGradeName` | string | 아니오 | 담당자 직급명 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

예시:

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "company": {
        "id": "00000000-0000-0000-0000-000000000101",
        "companyName": "오픈AI코리아"
      },
      "username": "홍길동",
      "mobile": "010-1111-2222",
      "email": "hong@example.com",
      "contactDepartment": {
        "id": "00000000-0000-0000-0000-000000000201",
        "departmentName": "영업팀"
      },
      "contactJobGrade": {
        "id": "00000000-0000-0000-0000-000000000301",
        "jobGradeName": "팀장"
      },
      "createdAt": "2026-06-11T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `contact.listed`
- audit log: 없음
- request id: 사용
- redaction: `username`, `mobile`, `email` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 회사 필터가 본인 소유가 아님 | `CompanyNotFound` | 404 | 필터 초기화 후 안내 | log |
| 부서 필터가 본인 소유가 아님 | `ContactDepartmentNotFound` | 404 | 필터 초기화 후 안내 | log |
| 직급 필터가 본인 소유가 아님 | `ContactJobGradeNotFound` | 404 | 필터 초기화 후 안내 | log |
| query validation 실패 | `ValidationError` | 400 | 목록 오류 상태 | log |

### FE/BE 처리 기준

- FE: 검색어는 `username` query로만 보낸다.
- FE: 목록 필터는 URL search params와 TanStack Query key에 반영한다.
- FE: 응답의 `items[].company.id`, 부서 ID, 직급 ID는 상세/수정 화면 이동과 필터 유지에 사용한다.
- BE: `userId` 조건을 모든 조회에 포함한다.
- 검증: 이름 검색, 회사 필터, 부서 필터, 직급 필터, 타 사용자 데이터 미노출을 확인한다.

## 6. 담당자 필터용 회사 전체 조회 API

- API 이름: 담당자 필터용 회사 전체 조회 API
- API 식별자: `ListContactCompanyOptions`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contacts/company-options`
- 인증: Backend App access token 필요
- 권한: 본인 회사만 조회

### 목적

담당자 목록 필터와 담당자 생성/수정 화면에서 선택할 회사 목록을 제공한다.

### Request

- Request 이름: `ListContactCompanyOptionsRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | 없음 | 없음 | 아니오 | 없음 | 요청값 없음 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자 소유 회사 목록을 조회한다.
3. `companyName ASC`, `id ASC`로 정렬한다.
4. 필터와 선택 UI에 필요한 `id`, `companyName`만 응답한다.

### Response

- Response 이름: `ContactCompanyOptionListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactCompanyOptionResponse[]` | 아니오 | 회사 옵션 목록 |
| `items[].id` | string | 아니오 | 회사 ID |
| `items[].companyName` | string | 아니오 | 회사 이름 |

예시:

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000101",
      "companyName": "오픈AI코리아"
    }
  ]
}
```

### 연결된 DB 스키마

- 조회: `Company`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contact.companyOptionsListed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |

### FE/BE 처리 기준

- FE: 목록 필터, 생성/수정 select 또는 combobox 옵션으로 사용한다.
- FE: 회사명만 화면에 표시하되 저장/필터 요청에는 `id`를 사용한다.
- BE: 현재 사용자 소유 회사만 반환한다.

## 7. 담당자 필터용 직급 전체 조회 API

- API 이름: 담당자 필터용 직급 전체 조회 API
- API 식별자: `ListContactJobGrades`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contact-job-grades`
- 인증: Backend App access token 필요
- 권한: 본인 직급만 조회

### Request

- Request 이름: `ListContactJobGradesRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | 없음 | 없음 | 아니오 | 없음 | 요청값 없음 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자 소유 담당자 직급 목록을 조회한다.
3. `jobGradeName ASC`, `id ASC`로 정렬한다.
4. `createdAt`은 응답하지 않는다.

### Response

- Response 이름: `ContactJobGradeListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactJobGradeResponse[]` | 아니오 | 담당자 직급 목록 |
| `items[].id` | string | 아니오 | 담당자 직급 ID |
| `items[].jobGradeName` | string | 아니오 | 담당자 직급명 |

### 연결된 DB 스키마

- 조회: `ContactJobGrade`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contactJobGrade.listed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |

### FE/BE 처리 기준

- FE: 필터와 생성/수정 select 또는 combobox 옵션으로 사용한다.
- FE: 직급명만 화면에 표시하되 저장/필터 요청에는 `id`를 사용한다.
- BE: 현재 사용자 소유 직급만 반환한다.

## 8. 담당자 직급 단건 생성 API

- API 이름: 담당자 직급 단건 생성 API
- API 식별자: `CreateContactJobGrade`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/contact-job-grades`
- 인증: Backend App access token 필요
- 권한: 본인 직급만 생성

### Request

- Request 이름: `CreateContactJobGradeRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `jobGradeName` | string | 예 | trim 후 1자 이상 | 담당자 직급명 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `jobGradeName`을 trim한다.
3. 값이 비어 있으면 `ValidationError`로 중단한다.
4. 같은 사용자 안에 동일한 `jobGradeName`이 있으면 `DuplicateContactJobGrade`로 중단한다.
5. 현재 사용자 소유의 `ContactJobGrade`를 생성한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `ContactJobGrade`
- 조회: `ContactJobGrade` 중복 확인
- 수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단일 model 생성이다.

### Observability

- log event key: `contactJobGrade.created`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 직급명 누락 또는 빈 문자열 | `ValidationError` | 400 | form field error 표시 | log |
| 사용자 내 중복 직급명 | `DuplicateContactJobGrade` | 409 | 이미 존재하는 직급 안내 | log |

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 직급 목록을 재조회한다.
- FE: 생성 후 새 직급을 선택 상태로 만든다.
- BE: 중복 검사는 같은 `userId` 안에서 수행한다.

## 9. 담당자 직급 단건 삭제 API

- API 이름: 담당자 직급 단건 삭제 API
- API 식별자: `DeleteContactJobGrade`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `DELETE`
- Path: `/api/contact-job-grades/:jobGradeId`
- 인증: Backend App access token 필요
- 권한: 본인 직급만 삭제

### Request

- Request 이름: `DeleteContactJobGradeRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `jobGradeId` | string | 예 | UUID | 삭제할 담당자 직급 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `jobGradeId`가 현재 사용자 소유인지 검증한다.
3. 해당 직급을 사용하는 `Contact`가 있으면 `ContactJobGradeInUse`로 중단한다.
4. 사용 중이 아니면 `ContactJobGrade`를 삭제한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`
- Body: 없음

### 연결된 DB 스키마

- 조회: `ContactJobGrade`, `Contact`
- 삭제: `ContactJobGrade`
- 생성/수정/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 사용 여부 검증 후 단일 삭제다.

### Observability

- log event key: `contactJobGrade.deleted`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 직급이 없거나 본인 소유가 아님 | `ContactJobGradeNotFound` | 404 | 목록 재조회 후 안내 | log |
| 담당자에서 사용 중 | `ContactJobGradeInUse` | 409 | 삭제 불가 상태 표시 | log |

### FE/BE 처리 기준

- FE: 성공 시 직급 목록과 담당자 목록을 필요한 범위에서 재조회한다.
- FE: 409는 삭제 불가 안내로 표시한다.
- BE: 사용 중인 직급은 삭제하지 않는다.

## 10. 담당자 필터용 부서 전체 조회 API

- API 이름: 담당자 필터용 부서 전체 조회 API
- API 식별자: `ListContactDepartments`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contact-departments`
- 인증: Backend App access token 필요
- 권한: 본인 부서만 조회

### Request

- Request 이름: `ListContactDepartmentsRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | 없음 | 없음 | 아니오 | 없음 | 요청값 없음 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자 소유 담당자 부서 목록을 조회한다.
3. `departmentName ASC`, `id ASC`로 정렬한다.
4. `createdAt`은 응답하지 않는다.

### Response

- Response 이름: `ContactDepartmentListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactDepartmentResponse[]` | 아니오 | 담당자 부서 목록 |
| `items[].id` | string | 아니오 | 담당자 부서 ID |
| `items[].departmentName` | string | 아니오 | 담당자 부서명 |

### 연결된 DB 스키마

- 조회: `ContactDepartment`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contactDepartment.listed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |

### FE/BE 처리 기준

- FE: 필터와 생성/수정 select 또는 combobox 옵션으로 사용한다.
- FE: 부서명만 화면에 표시하되 저장/필터 요청에는 `id`를 사용한다.
- BE: 현재 사용자 소유 부서만 반환한다.

## 11. 담당자 부서 단건 생성 API

- API 이름: 담당자 부서 단건 생성 API
- API 식별자: `CreateContactDepartment`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/contact-departments`
- 인증: Backend App access token 필요
- 권한: 본인 부서만 생성

### Request

- Request 이름: `CreateContactDepartmentRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `departmentName` | string | 예 | trim 후 1자 이상 | 담당자 부서명 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `departmentName`을 trim한다.
3. 값이 비어 있으면 `ValidationError`로 중단한다.
4. 같은 사용자 안에 동일한 `departmentName`이 있으면 `DuplicateContactDepartment`로 중단한다.
5. 현재 사용자 소유의 `ContactDepartment`를 생성한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `ContactDepartment`
- 조회: `ContactDepartment` 중복 확인
- 수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단일 model 생성이다.

### Observability

- log event key: `contactDepartment.created`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 부서명 누락 또는 빈 문자열 | `ValidationError` | 400 | form field error 표시 | log |
| 사용자 내 중복 부서명 | `DuplicateContactDepartment` | 409 | 이미 존재하는 부서 안내 | log |

### FE/BE 처리 기준

- FE: 성공 시 response body를 기대하지 않고 부서 목록을 재조회한다.
- FE: 생성 후 새 부서를 선택 상태로 만든다.
- BE: 중복 검사는 같은 `userId` 안에서 수행한다.

## 12. 담당자 부서 단건 삭제 API

- API 이름: 담당자 부서 단건 삭제 API
- API 식별자: `DeleteContactDepartment`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `DELETE`
- Path: `/api/contact-departments/:departmentId`
- 인증: Backend App access token 필요
- 권한: 본인 부서만 삭제

### Request

- Request 이름: `DeleteContactDepartmentRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `departmentId` | string | 예 | UUID | 삭제할 담당자 부서 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `departmentId`가 현재 사용자 소유인지 검증한다.
3. 해당 부서를 사용하는 `Contact`가 있으면 `ContactDepartmentInUse`로 중단한다.
4. 사용 중이 아니면 `ContactDepartment`를 삭제한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `204 No Content`
- Body: 없음

### 연결된 DB 스키마

- 조회: `ContactDepartment`, `Contact`
- 삭제: `ContactDepartment`
- 생성/수정/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 사용 여부 검증 후 단일 삭제다.

### Observability

- log event key: `contactDepartment.deleted`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 부서가 없거나 본인 소유가 아님 | `ContactDepartmentNotFound` | 404 | 목록 재조회 후 안내 | log |
| 담당자에서 사용 중 | `ContactDepartmentInUse` | 409 | 삭제 불가 상태 표시 | log |

### FE/BE 처리 기준

- FE: 성공 시 부서 목록과 담당자 목록을 필요한 범위에서 재조회한다.
- FE: 409는 삭제 불가 안내로 표시한다.
- BE: 사용 중인 부서는 삭제하지 않는다.

## 13. 담당자 단건 생성 API

- API 이름: 담당자 단건 생성 API
- API 식별자: `CreateContact`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/contacts`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 생성

### 목적

회사에 소속된 담당자를 생성한다. 생성 시 선택 메모가 있으면 같은 transaction에서 `ContactMemoLog` 첫 데이터로 저장한다.

### Request

- Request 이름: `CreateContactRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `username` | string | 예 | trim 후 1자 이상 | 담당자 이름 |
| body | `mobile` | string | 예 | `^010-\d{4}-\d{4}$` | 핸드폰번호 |
| body | `email` | string | 예 | 이메일 형식 | 이메일 |
| body | `companyId` | string | 예 | UUID | 소속 회사 ID |
| body | `contactDepartmentId` | string | 예 | UUID | 담당자 부서 ID |
| body | `contactJobGradeId` | string | 예 | UUID | 담당자 직급 ID |
| body | `contactMemo` | string \| null | 아니오 | trim 후 빈 문자열이면 미작성 처리 | 생성 시 함께 남길 초기 담당자 메모 |

예시:

```json
{
  "username": "홍길동",
  "mobile": "010-1111-2222",
  "email": "hong@example.com",
  "companyId": "00000000-0000-0000-0000-000000000101",
  "contactDepartmentId": "00000000-0000-0000-0000-000000000201",
  "contactJobGradeId": "00000000-0000-0000-0000-000000000301",
  "contactMemo": "첫 미팅에서 예산 확인"
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `username`, `mobile`, `email`, `contactMemo`를 trim한다.
4. `username`, `mobile`, `email`이 비어 있으면 `ValidationError`로 중단한다.
5. `mobile`이 `010-1111-2222` 형식이 아니면 `ValidationError`로 중단한다.
6. `email` 형식이 아니면 `ValidationError`로 중단한다.
7. `companyId`가 현재 사용자 소유 회사인지 검증한다.
8. `contactDepartmentId`가 현재 사용자 소유 부서인지 검증한다.
9. `contactJobGradeId`가 현재 사용자 소유 직급인지 검증한다.
10. transaction을 시작한다.
11. `Contact`를 생성한다.
12. `contactMemo`가 있으면 `ContactMemoLog`를 생성한다.
13. `contactMemo`로 만들어지는 첫 메모 로그의 `memoType`은 서버가 `초기 메모`로 저장한다.
14. `contactMemo`가 없으면 메모 로그를 만들지 않는다.
15. transaction을 commit한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `Contact`, 조건부 `ContactMemoLog`
- 조회: `Company`, `ContactDepartment`, `ContactJobGrade`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: `Contact`와 조건부 `ContactMemoLog`

### Transaction

- 필요 여부: 필요
- 이유: 담당자 생성과 초기 메모 로그 생성이 하나의 사용자 행동이다.
- transaction model: `Contact`, `ContactMemoLog`
- rollback 범위: `Contact` 생성과 초기 `ContactMemoLog` 생성 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `contact.created`
- audit log: 없음
- request id: 사용
- redaction: `contactMemo`, `mobile`, `email` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 이름/핸드폰/이메일 누락 | `ValidationError` | 400 | form field error 표시 | log |
| 핸드폰번호 형식 오류 | `ValidationError` | 400 | mobile field error 표시 | log |
| 이메일 형식 오류 | `ValidationError` | 400 | email field error 표시 | log |
| 회사가 없거나 본인 소유가 아님 | `CompanyNotFound` | 404 | 회사 선택 재확인 안내 | log |
| 부서가 없거나 본인 소유가 아님 | `ContactDepartmentNotFound` | 404 | 부서 선택 재확인 안내 | log |
| 직급이 없거나 본인 소유가 아님 | `ContactJobGradeNotFound` | 404 | 직급 선택 재확인 안내 | log |

### FE/BE 처리 기준

- FE: 성공 `201 Created`를 받으면 response body를 기대하지 말고 담당자 목록을 재조회한다.
- FE: 부서/직급 직접 생성 UI는 먼저 생성 API를 호출하고 목록 재조회 후 새 ID를 선택한다.
- FE: 회사 없이 저장하는 UI를 만들지 않는다.
- BE: transaction은 application use case에서 시작한다.
- 검증: 메모 없는 생성, 메모 있는 생성, FK ownership 실패, mobile 형식 실패를 확인한다.

## 14. 담당자 단건 조회 API

- API 이름: 담당자 단건 조회 API
- API 식별자: `GetContact`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contacts/:contactId`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 조회

### Request

- Request 이름: `GetContactRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`를 validation한다.
3. 현재 사용자 ownership 기준으로 담당자 단건을 조회한다.
4. `Company`, `ContactDepartment`, `ContactJobGrade` relation을 포함한다.
5. 담당자가 없으면 `ContactNotFound`로 중단한다.
6. 담당자 상세 응답 DTO로 변환한다.

### Response

- Response 이름: `ContactDetailResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 담당자 ID |
| `company` | object | 아니오 | 소속 회사 |
| `company.id` | string | 아니오 | 회사 ID |
| `company.companyName` | string | 아니오 | 회사 이름 |
| `username` | string | 아니오 | 담당자 이름 |
| `mobile` | string | 아니오 | 핸드폰번호 |
| `email` | string | 아니오 | 이메일 |
| `contactDepartment` | object | 아니오 | 담당자 부서 |
| `contactDepartment.id` | string | 아니오 | 담당자 부서 ID |
| `contactDepartment.departmentName` | string | 아니오 | 담당자 부서명 |
| `contactJobGrade` | object | 아니오 | 담당자 직급 |
| `contactJobGrade.id` | string | 아니오 | 담당자 직급 ID |
| `contactJobGrade.jobGradeName` | string | 아니오 | 담당자 직급명 |
| `createdAt` | string | 아니오 | 등록일 ISO string |
| `updatedAt` | string | 아니오 | 최근수정일 ISO string |

### 연결된 DB 스키마

- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contact.viewed`
- audit log: 없음
- request id: 사용
- redaction: `mobile`, `email` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 화면 또는 목록 이동 | log |

### FE/BE 처리 기준

- FE: 상세 화면의 기본 정보 영역에 response 필드를 그대로 사용한다.
- FE: 상세 응답의 회사/부서/직급 ID는 수정 form의 기본 선택값으로 사용한다.
- BE: 타 사용자 담당자는 404로 처리해 존재 여부를 노출하지 않는다.

## 15. 담당자 기본 정보 수정 API

- API 이름: 담당자 기본 정보 수정 API
- API 식별자: `UpdateContact`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `PATCH`
- Path: `/api/contacts/:contactId`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 수정

### Request

- Request 이름: `UpdateContactRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| body | `username` | string | 아니오 | trim 후 1자 이상 | 담당자 이름 |
| body | `mobile` | string | 아니오 | `^010-\d{4}-\d{4}$` | 핸드폰번호 |
| body | `email` | string | 아니오 | 이메일 형식 | 이메일 |
| body | `companyId` | string | 아니오 | UUID | 소속 회사 ID |
| body | `contactDepartmentId` | string | 아니오 | UUID | 담당자 부서 ID |
| body | `contactJobGradeId` | string | 아니오 | UUID | 담당자 직급 ID |

`body`에는 최소 1개 필드가 있어야 한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`와 request body를 validation한다.
3. 수정 대상 담당자가 현재 사용자 소유인지 검증한다.
4. 수정 필드가 하나도 없으면 `ValidationError`로 중단한다.
5. 포함된 텍스트 필드를 trim한다.
6. `username`이 포함됐고 비어 있으면 `ValidationError`로 중단한다.
7. `mobile`이 포함됐고 `010-1111-2222` 형식이 아니면 `ValidationError`로 중단한다.
8. `email`이 포함됐고 이메일 형식이 아니면 `ValidationError`로 중단한다.
9. `companyId`가 포함됐으면 현재 사용자 소유 회사인지 검증한다.
10. `contactDepartmentId`가 포함됐으면 현재 사용자 소유 부서인지 검증한다.
11. `contactJobGradeId`가 포함됐으면 현재 사용자 소유 직급인지 검증한다.
12. 요청에 포함된 필드만 수정한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 조회: `Contact`, 조건부 `Company`, 조건부 `ContactDepartment`, 조건부 `ContactJobGrade`
- 수정: `Contact`
- 생성/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단일 `Contact` 수정이다.

### Observability

- log event key: `contact.updated`
- audit log: 없음
- request id: 사용
- redaction: `mobile`, `email` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | 목록 이동 또는 not found 안내 | log |
| 수정 필드가 없음 | `ValidationError` | 400 | form error 표시 | log |
| 핸드폰번호 형식 오류 | `ValidationError` | 400 | mobile field error 표시 | log |
| 이메일 형식 오류 | `ValidationError` | 400 | email field error 표시 | log |
| 회사가 없거나 본인 소유가 아님 | `CompanyNotFound` | 404 | 회사 선택 재확인 안내 | log |
| 부서가 없거나 본인 소유가 아님 | `ContactDepartmentNotFound` | 404 | 부서 선택 재확인 안내 | log |
| 직급이 없거나 본인 소유가 아님 | `ContactJobGradeNotFound` | 404 | 직급 선택 재확인 안내 | log |

### FE/BE 처리 기준

- FE: 성공 `201 Created`를 받으면 담당자 단건과 담당자 목록을 필요한 범위에서 재조회한다.
- FE: response body를 기대하지 않는다.
- BE: 요청에 포함되지 않은 필드는 변경하지 않는다.

## 16. 담당자 일반 메모 로그 단건 생성 API

- API 이름: 담당자 일반 메모 로그 단건 생성 API
- API 식별자: `CreateContactMemoLog`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/contacts/:contactId/memo-logs`
- 인증: Backend App access token 필요
- 권한: 본인 담당자의 메모만 생성

### Request

- Request 이름: `CreateContactMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| body | `memoType` | string | 예 | trim 후 1자 이상 | 메모 유형 |
| body | `memo` | string | 예 | trim 후 1자 이상 | 일반 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`와 request body를 validation한다.
3. 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `memoType`, `memo`를 trim한다.
5. 값이 비어 있으면 `ValidationError`로 중단한다.
6. `ContactMemoLog`를 생성한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `ContactMemoLog`
- 조회: `Contact`
- 수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 담당자 ownership 검증 후 단일 메모 로그 생성이다.

### Observability

- log event key: `contactMemoLog.created`
- audit log: 없음
- request id: 사용
- redaction: `memo` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| `memoType` 또는 `memo` 누락 | `ValidationError` | 400 | form field error 표시 | log |

### FE/BE 처리 기준

- FE: 성공 시 메모 로그 목록을 재조회한다.
- FE: response body를 기대하지 않는다.
- BE: 메모 원문을 application log에 남기지 않는다.

## 17. 담당자 일반 메모 로그 무한스크롤 API

- API 이름: 담당자 일반 메모 로그 무한스크롤 API
- API 식별자: `ListContactMemoLogs`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contacts/:contactId/memo-logs`
- 인증: Backend App access token 필요
- 권한: 본인 담당자의 메모만 조회

### Request

- Request 이름: `ListContactMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| query | `cursor` | string | 아니오 | 서버 발급 base64url cursor | 다음 페이지 cursor |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`와 query를 validation한다.
3. 조회 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `cursor`가 있으면 base64url decode 후 `{ createdAt, id }` 구조인지 검증한다.
5. cursor가 잘못됐으면 `ValidationError`로 중단한다.
6. `ContactMemoLog.contactId` 기준으로 `createdAt DESC`, `id DESC` 조회한다.
7. page size 10보다 1개 더 조회한다.
8. 10개만 응답하고 11번째 존재 여부로 `hasNext`를 계산한다.
9. 다음 페이지가 있으면 마지막 응답 항목 기준으로 `nextCursor`를 생성한다.

### Response

- Response 이름: `ContactMemoLogConnectionResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactMemoLogResponse[]` | 아니오 | 일반 메모 로그 목록 |
| `items[].id` | string | 아니오 | 메모 로그 ID |
| `items[].memoType` | string | 아니오 | 메모 유형 |
| `items[].memo` | string | 아니오 | 일반 메모 본문 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |
| `nextCursor` | string \| null | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

### 연결된 DB 스키마

- 조회: `Contact`, `ContactMemoLog`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contactMemoLog.listed`
- audit log: 없음
- request id: 사용
- redaction: `memo` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| cursor 형식 오류 | `ValidationError` | 400 | 목록 재시작 또는 오류 표시 | log |

### FE/BE 처리 기준

- FE: `hasNext`가 true면 `nextCursor`로 다음 페이지를 호출한다.
- FE: 메모 원문을 client log에 남기지 않는다.
- BE: cursor는 서버가 생성한 문자열만 신뢰한다.

## 18. 담당자 일반 메모 로그 단건 수정 API

- API 이름: 담당자 일반 메모 로그 단건 수정 API
- API 식별자: `UpdateContactMemoLog`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `PATCH`
- Path: `/api/contacts/:contactId/memo-logs/:memoLogId`
- 인증: Backend App access token 필요
- 권한: 본인 담당자의 메모만 수정

### Request

- Request 이름: `UpdateContactMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| path | `memoLogId` | string | 예 | UUID | 일반 메모 로그 ID |
| body | `memoType` | string | 아니오 | trim 후 1자 이상 | 수정할 메모 유형 |
| body | `memo` | string | 아니오 | trim 후 1자 이상 | 수정할 메모 본문 |

`memoType`, `memo` 중 최소 1개는 있어야 한다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. path param과 request body를 validation한다.
3. 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `memoType`, `memo` 중 최소 1개가 있는지 검증한다.
5. 포함된 값은 trim한다.
6. 포함된 값이 빈 문자열이면 `ValidationError`로 중단한다.
7. `memoLogId`, `contactId`, `userId` 조건으로 `ContactMemoLog`를 수정한다.
8. 수정 결과가 없으면 `ContactMemoLogNotFound`로 중단한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 조회: `Contact`
- 수정: `ContactMemoLog`
- 생성/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 단일 `ContactMemoLog` 수정이다.

### Observability

- log event key: `contactMemoLog.updated`
- audit log: 없음
- request id: 사용
- redaction: `memo` 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| 수정 필드가 없음 | `ValidationError` | 400 | form error 표시 | log |
| 수정 값이 빈 문자열 | `ValidationError` | 400 | form field error 표시 | log |
| 메모 로그가 없거나 권한 없음 | `ContactMemoLogNotFound` | 404 | 목록 재조회 후 안내 | log |

### FE/BE 처리 기준

- FE: 성공 시 해당 메모 목록을 재조회하거나 로컬 상태를 갱신한다.
- FE: response body를 기대하지 않는다.
- BE: `memoType`과 `memo`를 모두 수정할 수 있게 구현한다.

## 19. 담당자 개인 비밀 메모 로그 단건 생성 API

- API 이름: 담당자 개인 비밀 메모 로그 단건 생성 API
- API 식별자: `CreateContactPrivateMemoLog`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/contacts/:contactId/private-memo-logs`
- 인증: Backend App access token 필요
- 권한: 본인 담당자의 개인 비밀 메모만 생성

### Request

- Request 이름: `CreateContactPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`와 request body를 validation한다.
3. 비밀 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `memo`를 trim한다.
5. 값이 비어 있으면 `ValidationError`로 중단한다.
6. 비밀 메모 원문을 암호화한다.
7. `ContactUserPrivateMemoLog`에 `memoCiphertext`, `memoKeyVersion`만 저장한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 생성: `ContactUserPrivateMemoLog`
- 조회: `Contact`
- 수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 암호화 후 단일 model 생성이다.

### Observability

- log event key: `contactPrivateMemoLog.created`
- audit log: 없음
- request id: 사용
- redaction: 개인 비밀 메모 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| `memo` 누락 | `ValidationError` | 400 | form field error 표시 | log |
| 암호화 실패 | `PrivateMemoEncryptFailed` | 500 | 저장 실패 안내 | error |

### FE/BE 처리 기준

- FE: 성공 시 개인 비밀 메모 목록을 재조회한다.
- FE: 비밀 메모 암호화/복호화를 직접 구현하지 않는다.
- BE: 평문을 DB나 log에 남기지 않는다.

## 20. 담당자 개인 비밀 메모 로그 무한스크롤 API

- API 이름: 담당자 개인 비밀 메모 로그 무한스크롤 API
- API 식별자: `ListContactPrivateMemoLogs`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/contacts/:contactId/private-memo-logs`
- 인증: Backend App access token 필요
- 권한: 본인이 작성한 담당자 개인 비밀 메모만 조회

### Request

- Request 이름: `ListContactPrivateMemoLogsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| query | `cursor` | string | 아니오 | 서버 발급 base64url cursor | 다음 페이지 cursor |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId`와 query를 validation한다.
3. 조회 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `cursor`가 있으면 base64url decode 후 `{ createdAt, id }` 구조인지 검증한다.
5. 현재 사용자가 작성한 `ContactUserPrivateMemoLog`만 조회한다.
6. `createdAt DESC`, `id DESC` 기준으로 page size 10보다 1개 더 조회한다.
7. 암호문을 복호화해 응답의 `memo`로 변환한다.
8. 10개만 응답하고 11번째 존재 여부로 `hasNext`와 `nextCursor`를 계산한다.

### Response

- Response 이름: `ContactPrivateMemoLogConnectionResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `ContactPrivateMemoLogResponse[]` | 아니오 | 개인 비밀 메모 로그 목록 |
| `items[].id` | string | 아니오 | 개인 비밀 메모 로그 ID |
| `items[].memo` | string | 아니오 | 복호화된 개인 비밀 메모 본문 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |
| `nextCursor` | string \| null | 예 | 다음 페이지 cursor |
| `hasNext` | boolean | 아니오 | 다음 페이지 존재 여부 |

### 연결된 DB 스키마

- 조회: `Contact`, `ContactUserPrivateMemoLog`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `contactPrivateMemoLog.listed`
- audit log: 없음
- request id: 사용
- redaction: 개인 비밀 메모 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| cursor 형식 오류 | `ValidationError` | 400 | 목록 재시작 또는 오류 표시 | log |
| 복호화 실패 | `PrivateMemoDecryptFailed` | 500 | 조회 실패 안내 | error |

### FE/BE 처리 기준

- FE: `hasNext`가 true면 `nextCursor`로 다음 페이지를 호출한다.
- FE: 응답의 `memo`는 화면 표시용으로만 사용하고 client log에 남기지 않는다.
- BE: `memoCiphertext`, `memoKeyVersion`은 응답하지 않는다.

## 21. 담당자 개인 비밀 메모 로그 단건 수정 API

- API 이름: 담당자 개인 비밀 메모 로그 단건 수정 API
- API 식별자: `UpdateContactPrivateMemoLog`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API
- Method: `PATCH`
- Path: `/api/contacts/:contactId/private-memo-logs/:privateMemoLogId`
- 인증: Backend App access token 필요
- 권한: 본인이 작성한 담당자 개인 비밀 메모만 수정

### Request

- Request 이름: `UpdateContactPrivateMemoLogRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| path | `privateMemoLogId` | string | 예 | UUID | 개인 비밀 메모 로그 ID |
| body | `memo` | string | 예 | trim 후 1자 이상 | 수정할 개인 비밀 메모 본문 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. path param과 request body를 validation한다.
3. 비밀 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
4. `memo`를 trim한다.
5. 값이 비어 있으면 `ValidationError`로 중단한다.
6. 새 비밀 메모 원문을 암호화한다.
7. `privateMemoLogId`, `contactId`, `userId` 조건으로 `ContactUserPrivateMemoLog`의 `memoCiphertext`, `memoKeyVersion`을 수정한다.
8. 수정 결과가 없으면 `ContactPrivateMemoLogNotFound`로 중단한다.

### Response

- Response 이름: `EmptyResponse`
- Status: `201 Created`
- Body: 없음

### 연결된 DB 스키마

- 조회: `Contact`
- 수정: `ContactUserPrivateMemoLog`
- 생성/삭제/감사 로그/transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 암호화 후 단일 개인 비밀 메모 로그 수정이다.

### Observability

- log event key: `contactPrivateMemoLog.updated`
- audit log: 없음
- request id: 사용
- redaction: 개인 비밀 메모 원문 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 담당자가 없거나 본인 소유가 아님 | `ContactNotFound` | 404 | not found 안내 | log |
| `memo` 누락 | `ValidationError` | 400 | form field error 표시 | log |
| 개인 비밀 메모 로그가 없거나 권한 없음 | `ContactPrivateMemoLogNotFound` | 404 | 목록 재조회 후 안내 | log |
| 암호화 실패 | `PrivateMemoEncryptFailed` | 500 | 저장 실패 안내 | error |

### FE/BE 처리 기준

- FE: 성공 시 해당 개인 비밀 메모 목록을 재조회하거나 로컬 상태를 갱신한다.
- FE: response body를 기대하지 않는다.
- BE: 기존 암호문과 key version을 새 값으로 교체한다.

## 22. 담당자 목록 xlsx 내보내기 API

- API 이름: 담당자 목록 xlsx 내보내기 API
- API 식별자: `ExportContactsXlsx`
- 계약 상태: `implemented`
- 소비자: User Web
- Method: `GET`
- Path: `/api/contacts/export/xlsx`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 export

### Request

- Request 이름: `ExportContactsQuery`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | `username` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 담당자 이름 부분 검색어 |
| query | `companyId` | string | 아니오 | UUID | 회사 필터 ID |
| query | `contactDepartmentId` | string | 아니오 | UUID | 담당자 부서 필터 ID |
| query | `contactJobGradeId` | string | 아니오 | UUID | 담당자 직급 필터 ID |

`page`는 받지 않는다. export는 현재 검색어와 필터 조건에 맞는 전체 담당자를 대상으로 한다.

### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation한다.
3. `username`을 trim하고 값이 있으면 이름 부분 검색 조건을 적용한다.
4. `companyId`, `contactDepartmentId`, `contactJobGradeId`가 있으면 현재 사용자 소유인지 확인한다.
5. `Contact.userId = currentUserId`와 검색/필터 조건을 적용한다.
6. `createdAt DESC, id DESC`로 정렬한다.
7. `Company`, `ContactDepartment`, `ContactJobGrade` relation을 포함해 조회한다.
8. ID와 memo/private memo 필드를 제외하고 xlsx 파일을 생성한다.

### Response

- Status: `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="contacts_YYYYMMDD_HHmmss.xlsx"`
- xlsx 컬럼: `회사명`, `담당자명`, `핸드폰번호`, `이메일`, `부서`, `직급`, `등록일`

### 연결된 DB 스키마

- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 생성/수정/삭제/감사 로그/transaction: 없음

### Observability

- log event key: `contact.exported`
- audit log: 없음
- request id: 사용
- redaction: `username`, `mobile`, `email` 원문 logging 금지

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 회사 필터가 본인 소유가 아님 | `CompanyNotFound` | 404 | 필터 초기화 후 안내 | log |
| 부서 필터가 본인 소유가 아님 | `ContactDepartmentNotFound` | 404 | 필터 초기화 후 안내 | log |
| 직급 필터가 본인 소유가 아님 | `ContactJobGradeNotFound` | 404 | 필터 초기화 후 안내 | log |
| query validation 실패 | `ValidationError` | 400 | 목록 오류 상태 | log |
| xlsx 생성 실패 | `ContactExportFailed` | 500 | 내보내기 실패 안내 | error |

## 23. 공통 에러 응답 형식

Domain error는 Backend 전역 exception filter 기준으로 다음 형태를 사용한다.

```json
{
  "statusCode": 404,
  "error": "ContactNotFound",
  "message": "Contact was not found"
}
```

예상 domain error:

| 에러 | HTTP | 설명 |
|---|---:|---|
| `Unauthorized` | 401 | 인증 없음 또는 invalid token |
| `ValidationError` | 400 | request validation 또는 application validation 실패 |
| `CompanyNotFound` | 404 | 회사가 없거나 현재 사용자 소유가 아님 |
| `ContactNotFound` | 404 | 담당자가 없거나 현재 사용자 소유가 아님 |
| `ContactDepartmentNotFound` | 404 | 담당자 부서가 없거나 현재 사용자 소유가 아님 |
| `ContactJobGradeNotFound` | 404 | 담당자 직급이 없거나 현재 사용자 소유가 아님 |
| `ContactMemoLogNotFound` | 404 | 일반 메모 로그가 없거나 수정 권한이 없음 |
| `ContactPrivateMemoLogNotFound` | 404 | 개인 비밀 메모 로그가 없거나 수정 권한이 없음 |
| `ContactExportFailed` | 500 | 담당자 xlsx export 파일 생성 실패 |
| `DuplicateContactDepartment` | 409 | 같은 사용자 안에서 부서명이 중복됨 |
| `DuplicateContactJobGrade` | 409 | 같은 사용자 안에서 직급명이 중복됨 |
| `ContactDepartmentInUse` | 409 | 담당자가 사용하는 부서를 삭제하려 함 |
| `ContactJobGradeInUse` | 409 | 담당자가 사용하는 직급을 삭제하려 함 |
| `PrivateMemoEncryptFailed` | 500 | 개인 비밀 메모 암호화 실패 |
| `PrivateMemoDecryptFailed` | 500 | 개인 비밀 메모 복호화 실패 |

## 24. 관련 문서

- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/FE-TODO/G01-FE-CONTACT-PAGES.goal.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
