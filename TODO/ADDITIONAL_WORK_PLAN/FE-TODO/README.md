# Additional Work FE TODO

## 1. 목적

이 폴더는 추가 유지보수 계획 중 Frontend 작업을 goal 단위로 관리한다.

## 2. 현재 상태

현재 추가 작업은 Backend API 응답 확장과 신규 조회 API 추가만 요청된 상태다.

회사 목록 화면에서 `contactCount`를 표시하는 작업이 필요해지면 별도 FE goal을 추가한다.

회사 단건 페이지에서 `GET /api/companies/:companyId/contacts` 응답을 표시하는 작업이 필요해지면 별도 FE goal을 추가한다.

회사 목록 페이지의 내보내기 버튼에서 `GET /api/companies/export/xlsx`를 호출하는 작업이 필요해지면 별도 FE goal을 추가한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

거래처 목록 페이지의 내보내기 버튼에서 `GET /api/contacts/export/xlsx`를 호출하는 작업이 필요해지면 별도 FE goal을 추가한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

제품 목록 페이지의 내보내기 버튼에서 `GET /api/products/export/xlsx`를 호출하는 작업이 필요해지면 별도 FE goal을 추가한다. 이때 목록의 현재 검색어와 필터 query는 전달하고 `page`는 전달하지 않는다.

모든 export 호출은 목록 페이지의 현재 검색어와 필터 query를 함께 전달한다. 예를 들어 목록이 `page=2`와 검색어, 필터를 함께 사용 중이면 export API에는 검색어와 필터만 전달하고 `page=2`는 제거한다.
