# Additional Work FE TODO

## 1. 목적

이 폴더는 추가 유지보수 계획 중 Frontend 작업을 goal 단위로 관리한다.

## 2. 현재 상태

Backend 추가 API G01-G12는 구현 완료 상태다. Frontend도 아래 항목을 Company/Contact/Product 화면 작업에 반영 완료했다.

- 상태: 완료
- 완료 확인일: 2026-06-14
- 검증: `FE/user-web` typecheck/lint/build 통과

회사 목록 화면에서 `contactCount`를 `담당자 수`로 표시한다.

회사 단건 페이지에서 `GET /api/companies/:companyId/contacts` 응답을 연결 Contact 목록으로 표시한다. 이 목록은 페이지네이션 없이 전체를 보여준다.

회사 목록 페이지의 내보내기 버튼에서 `GET /api/companies/export/xlsx`를 호출한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

담당자 목록 페이지의 내보내기 버튼에서 `GET /api/contacts/export/xlsx`를 호출한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

제품 목록 페이지의 내보내기 버튼에서 `GET /api/products/export/xlsx`를 호출한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

모든 export 호출은 목록 페이지의 현재 검색어와 필터 query를 함께 전달한다. 예를 들어 목록이 `page=2`와 검색어, 필터를 함께 사용 중이면 export API에는 검색어와 필터만 전달하고 `page=2`는 제거한다.

Backend G06-G12로 구현된 연결 딜 API와 응답 변경은 `G01-FE-DEAL-COUNT-LINKED-DEAL-LISTS.goal.md`에서 처리한다.

추가 반영 대상:

- 회사 목록: `dealCount`를 `딜 수`로 표시한다.
- 회사 export: 변경된 `딜 수` 컬럼은 기존 blob 다운로드 흐름으로 받는다.
- 회사 단건: `GET /api/companies/:companyId/deals`로 연결 딜 목록을 표시한다.
- 담당자 단건: `GET /api/contacts/:contactId/deals`로 연결 딜 목록을 표시한다.
- 제품 목록: `dealCount` 표시와 `sort=dealCountDesc|dealCountAsc` 딜 높은순/딜 낮은순 정렬을 추가한다.
- 제품 export: 현재 검색/필터/정렬 query를 전달하고 `page`는 제거한다.
- 제품 단건: `GET /api/products/:productId/deals`로 연결 딜 목록을 표시한다.

## 3. 구현 목적

- 목록 화면에서 사용자가 보고 있는 검색/필터 조건 그대로 데이터를 내려받게 한다.
- 화면에 노출하지 않아야 하는 ID, userId, 메모 원문, 개인 비밀 메모 원문은 xlsx에 포함하지 않는다.
- 다운로드 실패 시 목록 상태는 유지하고, 사용자에게 내보내기 실패만 표시한다.
- 다운로드 성공 후 목록 query를 불필요하게 무효화하지 않는다.
