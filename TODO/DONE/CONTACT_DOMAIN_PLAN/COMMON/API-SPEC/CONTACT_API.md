# Contact API Spec

## 1. 공통 규칙

- 이 API 계약은 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- API를 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 함께 갱신한다.
- API별 최종 상세 명세는 `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`를 기준으로 한다.
- 대상: 사용자 페이지 API
- 관리자 페이지: 제외
- 인증: `Authorization: Bearer <backend_app_access_token>`
- 권한: 로그인한 사용자 본인 데이터만 접근 가능
- 날짜 형식: ISO 8601 string
- 담당자 목록 페이지 크기: 10개 고정
- 담당자 일반 메모 로그 페이지 크기: 10개 고정
- 담당자 개인 비밀 메모 로그 페이지 크기: 10개 고정
- 담당자 목록 검색: `username` 부분 검색만 제공
- 담당자 목록 필터: `companyId`, `contactDepartmentId`, `contactJobGradeId`
- 담당자 목록 정렬: `createdAtDesc`, `usernameAsc`
- 담당자 목록 응답: `updatedAt` 제외
- 담당자 필터용 회사/직급/부서 전체 조회 응답: `createdAt` 제외
- 상태값만 반환하는 API: response body 없음
- 담당자 핸드폰번호 형식: `010-1111-2222`
- 담당자 개인 비밀 메모: API에서는 `memo`를 사용하지만 DB에는 평문 저장 금지

## 2. API 목록

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

## 2.1. API 계약 상태 요약

모든 API의 소비자는 `User Web`이다. Backend 구현 후 계약 상태는 `implemented`로 둔다.

| API | 계약 상태 | Transaction | Observability |
|---|---|---|---|
| `GET /api/contacts` | implemented | 없음 | `contact.listed`, audit log 없음, request id 사용, `username`, `mobile`, `email` 원문 logging 금지 |
| `GET /api/contacts/export/xlsx` | implemented | 없음 | `contact.exported`, audit log 없음, request id 사용, `username`, `mobile`, `email` 원문 logging 금지 |
| `GET /api/contacts/company-options` | implemented | 없음 | `contact.companyOptionsListed`, audit log 없음, request id 사용 |
| `GET /api/contact-job-grades` | implemented | 없음 | `contactJobGrade.listed`, audit log 없음, request id 사용 |
| `POST /api/contact-job-grades` | implemented | 없음 | `contactJobGrade.created`, audit log 없음, request id 사용 |
| `DELETE /api/contact-job-grades/:jobGradeId` | implemented | 없음 | `contactJobGrade.deleted`, audit log 없음, request id 사용 |
| `GET /api/contact-departments` | implemented | 없음 | `contactDepartment.listed`, audit log 없음, request id 사용 |
| `POST /api/contact-departments` | implemented | 없음 | `contactDepartment.created`, audit log 없음, request id 사용 |
| `DELETE /api/contact-departments/:departmentId` | implemented | 없음 | `contactDepartment.deleted`, audit log 없음, request id 사용 |
| `POST /api/contacts` | implemented | 필요. `Contact`와 조건부 `ContactMemoLog` | `contact.created`, audit log 없음, request id 사용, `contactMemo`, `mobile`, `email` redaction |
| `GET /api/contacts/:contactId` | implemented | 없음 | `contact.viewed`, audit log 없음, request id 사용, `mobile`, `email` 원문 logging 금지 |
| `PATCH /api/contacts/:contactId` | implemented | 없음 | `contact.updated`, audit log 없음, request id 사용, `mobile`, `email` redaction |
| `POST /api/contacts/:contactId/memo-logs` | implemented | 없음 | `contactMemoLog.created`, audit log 없음, request id 사용, `memo` redaction |
| `GET /api/contacts/:contactId/memo-logs` | implemented | 없음 | `contactMemoLog.listed`, audit log 없음, request id 사용, `memo` redaction |
| `PATCH /api/contacts/:contactId/memo-logs/:memoLogId` | implemented | 없음 | `contactMemoLog.updated`, audit log 없음, request id 사용, `memo` redaction |
| `POST /api/contacts/:contactId/private-memo-logs` | implemented | 없음 | `contactPrivateMemoLog.created`, audit log 없음, request id 사용, private memo redaction |
| `GET /api/contacts/:contactId/private-memo-logs` | implemented | 없음 | `contactPrivateMemoLog.listed`, audit log 없음, request id 사용, private memo redaction |
| `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId` | implemented | 없음 | `contactPrivateMemoLog.updated`, audit log 없음, request id 사용, private memo redaction |

## 3. 공통 응답 DTO

### ContactListItemResponse

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 담당자 ID |
| `company` | object | 아니오 | 담당자가 소속된 회사 |
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

### ContactDetailResponse

`ContactListItemResponse`의 모든 필드에 `updatedAt`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `updatedAt` | string | 아니오 | 최근수정일 ISO string |

### EmptyResponse

성공 status만 반환하고 body는 없다.

### ContactExportXlsxFile

- API: `GET /api/contacts/export/xlsx`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="contacts_YYYYMMDD_HHmmss.xlsx"`
- query: `username`, `companyId`, `contactDepartmentId`, `contactJobGradeId`, `sort`
- `page`는 받지 않는다. 검색어, 필터, 정렬 조건에 맞는 전체 담당자를 export한다.
- xlsx 컬럼: `회사명`, `담당자명`, `핸드폰번호`, `이메일`, `부서`, `직급`, `등록일`
- 제외 필드: 담당자 ID, 회사 ID, 부서 ID, 직급 ID, userId, memo/private memo

## 4. 관련 문서

- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/FE-TODO/G01-FE-CONTACT-PAGES.goal.md`
