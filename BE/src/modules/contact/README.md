# Contact Module

## 현재 범위

- `GET /api/contacts`
- `GET /api/contacts/export/xlsx`
- `GET /api/contacts/company-options`
- `GET /api/contact-job-grades`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`
- `GET /api/contact-departments`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contacts`
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`
- `POST /api/contacts/:contactId/memo-logs`
- `GET /api/contacts/:contactId/memo-logs`
- `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
- `DELETE /api/contacts/:contactId/memo-logs/:memoLogId`
- `POST /api/contacts/:contactId/private-memo-logs`
- `GET /api/contacts/:contactId/private-memo-logs`
- `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`
- `DELETE /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

이 모듈은 User Web에서 사용하는 담당자 직급, 담당자 부서, 담당자 일반 메모 로그, 담당자 개인 비밀 메모 로그 API를 담당한다.

## 구현 기준

- 모든 API는 `AuthGuard`를 사용한다.
- 모든 조회와 변경은 현재 사용자 `userId` ownership 기준으로 처리한다.
- 담당자는 반드시 회사에 소속된다.
- 담당자 export는 검색/필터/정렬 조건을 적용하고 `page` 없이 전체 대상 xlsx를 반환한다.
- 담당자 생성 시 `contactMemo`가 있으면 같은 transaction에서 `ContactMemoLog` 첫 데이터로 저장한다.
- 개인 비밀 메모 평문은 API DTO에서만 `memo`로 다루고, DB에는 `memoCiphertext`, `memoKeyVersion`만 저장한다.
- API 계약은 `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`를 따른다.
