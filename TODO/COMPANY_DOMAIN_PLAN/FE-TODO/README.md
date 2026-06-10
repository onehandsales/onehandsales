# Company Domain FE TODO

## 목적

사용자 페이지 회사 목록, 생성, 상세, 메모 로그 화면을 구현하기 위한 FE 작업 문서를 둔다.

## 문서

- `G01-FE-COMPANY-PAGES.goal.md`

## FE 기준

- FE 작업 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- Backend API 계약을 임의로 바꾸지 않는다.
- 생성/수정/삭제 API는 대부분 response body가 없으므로 성공 status를 기준으로 화면 상태를 갱신한다.
- 회사 분야와 회사 지역 생성 후에는 옵션 목록을 재조회한다.
- 회사 기본 정보 수정 후에는 회사 단건과 회사 목록을 필요한 범위에서 재조회한다.
- 회사 메모 로그 생성은 `memoType`, `memo`를 보낸다.
- 회사 개인 비밀 메모 로그 생성은 `memo`만 보낸다.
- 회사 목록에는 최근 수정일을 표시하지 않는다.
