# Company Contact List API Spec

## 1. 목적

이 문서는 회사 단건 조회 페이지에서 사용할 회사 연결 Contact 전체 목록 API 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/companies/:companyId/contacts`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 신규 API
- 대상 화면: 회사 단건 조회 페이지

## 3. API 요약

회사 단건 조회 페이지에서 해당 회사에 연결된 Contact 전체 목록을 조회한다.

- 페이지네이션 없음
- 정렬: `createdAt DESC`, 보조 정렬 `id DESC`
- 응답 필드: `id`, `username`, `contactDepartment.id`, `contactDepartment.departmentName`

## 4. Request

- Request 이름: `ListCompanyContactsRequest`
- Method: `GET`
- Path: `/api/companies/:companyId/contacts`
- 인증: Backend App access token 필요
- 권한: 본인 회사에 연결된 Contact만 조회

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| path | `companyId` | string | 예 | UUID | 회사 ID |
| query | 없음 | 없음 | 아니오 | 없음 | 페이지네이션과 필터 없음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

## 5. Response

- Response 이름: `CompanyContactListResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "items": [
    {
      "id": "contact-id",
      "username": "홍길동",
      "mobile": "010-1234-5678",
      "email": "sales@example.com",
      "contactDepartment": {
        "id": "department-id",
        "departmentName": "영업팀"
      }
    }
  ]
}
```

`CompanyContactListItemResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | Contact ID |
| `username` | string | 아니오 | 담당자 이름 |
| `mobile` | string | 아니오 | 담당자 휴대폰 번호 |
| `email` | string | 아니오 | 담당자 이메일 |
| `contactDepartment` | object | 아니오 | 담당자 부서 |
| `contactDepartment.id` | string | 아니오 | 담당자 부서 ID |
| `contactDepartment.departmentName` | string | 아니오 | 담당자 부서명 |

연결된 Contact가 없으면 다음처럼 빈 배열을 반환한다.

```json
{
  "items": []
}
```

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. `companyId` path param을 validation한다.
3. `Company.id = companyId`, `Company.userId = currentUserId` 조건으로 회사 ownership을 확인한다.
4. 회사가 없거나 현재 사용자 소유가 아니면 `CompanyNotFound`를 반환한다.
5. `Contact.companyId = companyId`, `Contact.userId = currentUserId` 조건으로 Contact 목록을 조회한다.
6. `ContactDepartment` relation을 함께 조회한다.
7. `createdAt DESC`, `id DESC`로 정렬한다.
8. 응답에는 `id`, `username`, `mobile`, `email`, `contactDepartment.id`, `contactDepartment.departmentName`만 포함한다.

## 7. 연결 DB 스키마

- 조회: `Company`, `Contact`, `ContactDepartment`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Contact.companyId`는 `Company.id`를 참조한다.
- `Contact.contactDepartmentId`는 `ContactDepartment.id`를 참조한다.
- `Company`, `Contact`, `ContactDepartment`는 모두 사용자 소유 데이터다.

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음

## 9. Observability

- event key: `company.contacts.listed`
- audit log: 없음
- request id: 사용
- redaction: Contact 이름 원문 logging 금지
- provider error context: 없음

## 10. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| `companyId` 형식 오류 | `ValidationError` | 400 | 회사 상세 오류 상태 | log |
| 회사 없음 또는 본인 소유 아님 | `CompanyNotFound` | 404 | 회사 not found 또는 목록 이동 | log |

## 11. FE/BE 처리 기준

FE:

- 회사 단건 페이지에서 연결된 담당자 요약 목록을 표시할 때 사용한다.
- 페이지네이션 UI를 만들지 않는다.
- 응답의 `contactDepartment.departmentName`을 부서 표시값으로 사용한다.
- `contactDepartment.id`는 후속 상세 이동, 필터, 수정 흐름에서 사용할 수 있다.

BE:

- 기존 `GET /api/companies/:companyId` 응답 shape는 변경하지 않는다.
- 기존 Contact API는 변경하지 않는다.
- 회사 ownership 확인 후 Contact 목록을 조회한다.
- Contact 목록은 전체 반환이지만 회사 단건 페이지 보조 목록 용도이므로 응답 필드를 최소화한다.

## 12. 검증 기준

- 본인 회사에 연결된 Contact 목록만 반환한다.
- 연결된 Contact가 없으면 `items: []`를 반환한다.
- 다른 사용자의 회사 ID는 `CompanyNotFound`로 처리한다.
- 다른 사용자의 Contact가 응답에 섞이지 않는다.
- 정렬은 `createdAt DESC`, `id DESC` 기준을 따른다.
- 응답 item에는 `id`, `username`, `contactDepartment.id`, `contactDepartment.departmentName`만 포함된다.
