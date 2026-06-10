# BE TODO

이 폴더는 BE 실행용 `/goal` 문서를 둔다.

## Goals

- `G01-BE-USER-PROFILE-DEVICES.goal.md`: 로그인 이후 설정 탭에 필요한 User API와 User/Auth DDL 기준 검증

## 작업 경계

BE 작업 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

BE는 API, schema, repository, use case, controller, Backend 문서를 담당한다.

BE는 다음 작업을 하지 않는다.

- FE 화면 구현
- FE 라우터 수정
- FE 상태 관리 수정
- 기기명 수정/기기 해제 API 추가
- 계정 삭제 API 추가
- user settings API 추가

깨끗한 DB에서 실제 smoke를 하려면 User/Auth DDL 또는 Prisma migration이 먼저 필요하다. DDL 작성은 이 문서의 BE goal에서 범위를 확인하되, 실제 DDL 생성은 사용자의 별도 요청이 있으면 진행한다.
