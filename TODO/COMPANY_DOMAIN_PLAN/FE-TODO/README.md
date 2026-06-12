# Company Domain FE TODO

## 목적

사용자 페이지 회사 목록, 생성, 상세, 연결 Contact 요약, 메모 로그, xlsx 내보내기 화면을 구현하기 위한 FE 작업 문서를 둔다.

## 문서

- `G01-FE-COMPANY-PAGES.goal.md`

## 현재 상태

- 선행 BE API와 Company DB 기준은 완료됐다.
- User Web 회사 목록/상세/생성/분야/지역/메모/내보내기 화면 구현은 완료됐다.
- 검증은 `pnpm --dir FE/user-web run typecheck`, `pnpm --dir FE/user-web run lint`, `pnpm --dir FE/user-web run build`를 통과했다.
- 로컬 Node 버전은 프로젝트 요구사항(`>=24 <25`)과 달라 engine warning이 표시됐지만 명령은 성공했다.

## FE 기준

- FE 작업 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- Backend API 계약을 임의로 바꾸지 않는다.
- 생성/수정/삭제 API는 대부분 response body가 없으므로 성공 status를 기준으로 화면 상태를 갱신한다.
- 회사 분야와 회사 지역 생성 후에는 옵션 목록을 재조회한다.
- 회사 기본 정보 수정 후에는 회사 단건과 회사 목록을 필요한 범위에서 재조회한다.
- 회사 메모 로그 생성은 `memoType`, `memo`를 보낸다.
- 회사 개인 비밀 메모 로그 생성은 `memo`만 보낸다.
- 회사 목록에는 최근 수정일을 표시하지 않는다.
- 회사 목록에는 `contactCount`를 `거래처 수`로 표시한다.
- 회사 단건 화면의 연결 Contact 목록은 `GET /api/companies/:companyId/contacts`로 별도 조회한다.
- 회사 목록 xlsx 내보내기는 `GET /api/companies/export/xlsx`를 blob으로 받고, 현재 검색어와 필터만 전달하며 `page`는 전달하지 않는다.
