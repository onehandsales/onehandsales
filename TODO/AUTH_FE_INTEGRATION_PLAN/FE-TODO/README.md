# FE TODO

이 폴더는 FE 실행용 `/goal` 문서를 둔다.

## Goals

- `G01-AUTH-FE-INTEGRATION.goal.md`: Supabase Auth + Backend token exchange 연동
- `G02-FE-SETTINGS-PROFILE-DEVICES.goal.md`: 로그인 이후 설정 탭의 개인 정보 조회/수정, 등록 기기 조회

## 작업 경계

FE 작업 문서는 `TODO/SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

FE는 화면, 라우팅, API client 연결, 상태 관리를 담당한다.

FE는 다음 작업을 하지 않는다.

- BE 코드 수정
- DB schema/migration 작성
- User/Auth DDL 작성
- 계정 삭제 기능 추가
- user settings 기능 추가
- 기기명 수정/기기 해제 기능 추가
