# Contact API Spec

## 1. 공통 규칙

- 이 API 계약은 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- API를 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 함께 갱신한다.
- API별 최종 상세 명세는 `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`를 기준으로 한다.
- 대상: 사용자 페이지 API
- 관리자 페이지: 제외
- 인증: `Authorization: Bearer <backend_app_access_token>`
- 권한: 로그인한 사용자 본인 데이터만 접근 가능
- 날짜 형식: ISO 8601 string
- 거래처 목록 페이지 크기: 20개 고정
- 거래처 일반 메모 로그 페이지 크기: 10개 고정
- 거래처 개인 비밀 메모 로그 페이지 크기: 10개 고정
- 거래처 목록 검색: `username` 부분 검색만 제공
- 거래처 목록 필터: `companyId`, `contactDepartmentId`, `contactJobGradeId`
- 거래처 목록 정렬: `createdAt DESC`
- 거래처 목록 응답: `updatedAt` 제외
- 거래처 필터용 회사/직급/부서 전체 조회 응답: `createdAt` 제외
- 상태값만 반환하는 API: response body 없음
- 거래처 핸드폰번호 형식: `010-1111-2222`
- 거래처 개인 비밀 메모: API에서는 `memo`를 사용하지만 DB에는 평문 저장 금지

## 2. API 목록

1. 거래처 페이지네이션 API: `GET /api/contacts`
2. 거래처 필터용 회사 전체 조회 API: `GET /api/contacts/company-options`
3. 거래처 필터용 직급 전체 조회 API: `GET /api/contact-job-grades`
4. 거래처 직급 단건 생성 API: `POST /api/contact-job-grades`
5. 거래처 직급 단건 삭제 API: `DELETE /api/contact-job-grades/:jobGradeId`
6. 거래처 필터용 부서 전체 조회 API: `GET /api/contact-departments`
7. 거래처 부서 단건 생성 API: `POST /api/contact-departments`
8. 거래처 부서 단건 삭제 API: `DELETE /api/contact-departments/:departmentId`
9. 거래처 단건 생성 API: `POST /api/contacts`
10. 거래처 단건 조회 API: `GET /api/contacts/:contactId`
11. 거래처 기본 정보 수정 API: `PATCH /api/contacts/:contactId`
12. 거래처 일반 메모 로그 단건 생성 API: `POST /api/contacts/:contactId/memo-logs`
13. 거래처 일반 메모 로그 무한스크롤 API: `GET /api/contacts/:contactId/memo-logs`
14. 거래처 일반 메모 로그 단건 수정 API: `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
15. 거래처 개인 비밀 메모 로그 단건 생성 API: `POST /api/contacts/:contactId/private-memo-logs`
16. 거래처 개인 비밀 메모 로그 무한스크롤 API: `GET /api/contacts/:contactId/private-memo-logs`
17. 거래처 개인 비밀 메모 로그 단건 수정 API: `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

## 2.1. API 계약 상태 요약

모든 API의 소비자는 `User Web`이다. Backend 구현 후 계약 상태는 `confirmed`로 둔다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/contacts` | confirmed | 없음 | `contact.listed`, audit log 없음, request id 사용, `username`, `mobile`, `email` 원문 logging 금지 |
| `GET /api/contacts/company-options` | confirmed | 없음 | `contact.companyOptionsListed`, audit log 없음, request id 사용 |
| `GET /api/contact-job-grades` | confirmed | 없음 | `contactJobGrade.listed`, audit log 없음, request id 사용 |
| `POST /api/contact-job-grades` | confirmed | 없음 | `contactJobGrade.created`, audit log 없음, request id 사용 |
| `DELETE /api/contact-job-grades/:jobGradeId` | confirmed | 없음 | `contactJobGrade.deleted`, audit log 없음, request id 사용 |
| `GET /api/contact-departments` | confirmed | 없음 | `contactDepartment.listed`, audit log 없음, request id 사용 |
| `POST /api/contact-departments` | confirmed | 없음 | `contactDepartment.created`, audit log 없음, request id 사용 |
| `DELETE /api/contact-departments/:departmentId` | confirmed | 없음 | `contactDepartment.deleted`, audit log 없음, request id 사용 |
| `POST /api/contacts` | confirmed | 필요. `Contact`와 조건부 `ContactMemoLog` | `contact.created`, audit log 없음, request id 사용, `contactMemo`, `mobile`, `email` redaction |
| `GET /api/contacts/:contactId` | confirmed | 없음 | `contact.viewed`, audit log 없음, request id 사용, `mobile`, `email` 원문 logging 금지 |
| `PATCH /api/contacts/:contactId` | confirmed | 없음 | `contact.updated`, audit log 없음, request id 사용, `mobile`, `email` redaction |
| `POST /api/contacts/:contactId/memo-logs` | confirmed | 없음 | `contactMemoLog.created`, audit log 없음, request id 사용, `memo` redaction |
| `GET /api/contacts/:contactId/memo-logs` | confirmed | 없음 | `contactMemoLog.listed`, audit log 없음, request id 사용, `memo` redaction |
| `PATCH /api/contacts/:contactId/memo-logs/:memoLogId` | confirmed | 없음 | `contactMemoLog.updated`, audit log 없음, request id 사용, `memo` redaction |
| `POST /api/contacts/:contactId/private-memo-logs` | confirmed | 없음 | `contactPrivateMemoLog.created`, audit log 없음, request id 사용, private memo redaction |
| `GET /api/contacts/:contactId/private-memo-logs` | confirmed | 없음 | `contactPrivateMemoLog.listed`, audit log 없음, request id 사용, private memo redaction |
| `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId` | confirmed | 없음 | `contactPrivateMemoLog.updated`, audit log 없음, request id 사용, private memo redaction |

## 3. 공통 응답 DTO

### ContactListItemResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 거래처 ID |
| `company` | object | 아니오 | 거래처가 소속된 회사 |
| `company.id` | string | 아니오 | 회사 ID |
| `company.companyName` | string | 아니오 | 회사 이름 |
| `username` | string | 아니오 | 거래처 이름 |
| `mobile` | string | 아니오 | `010-1111-2222` 형식 핸드폰번호 |
| `email` | string | 아니오 | 이메일 |
| `contactDepartment` | object | 아니오 | 거래처 부서 |
| `contactDepartment.id` | string | 아니오 | 거래처 부서 ID |
| `contactDepartment.departmentName` | string | 아니오 | 거래처 부서명 |
| `contactJobGrade` | object | 아니오 | 거래처 직급 |
| `contactJobGrade.id` | string | 아니오 | 거래처 직급 ID |
| `contactJobGrade.jobGradeName` | string | 아니오 | 거래처 직급명 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

### ContactDetailResponse

`ContactListItemResponse`의 모든 필드에 `updatedAt`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `updatedAt` | string | 아니오 | 최근수정일 ISO string |

### EmptyResponse

성공 status만 반환하고 body는 없다.

## 4. 관련 문서

- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/CONTACT_DOMAIN_PLAN/FE-TODO/G01-FE-CONTACT-PAGES.goal.md`
