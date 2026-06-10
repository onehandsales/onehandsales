# Company Domain BE TODO

## 목적

회사 도메인의 DB schema, migration, API, 보안 규칙을 구현하기 위한 BE 작업 문서를 둔다.

## 문서

- `G01-BE-COMPANY-DOMAIN.goal.md`

## BE 기준

- BE 작업 문서는 `TODO/SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 모든 API는 User API다.
- 관리자 API는 이번 범위에서 제외한다.
- 모든 함수, 메서드, 복잡한 로직에는 프로젝트 주석 규칙에 맞춰 `// 기능 : ...` 주석을 단다.
- Prisma schema 관계에는 필요한 경우 `/// 기능 : ...` 주석을 단다.
- 회사 메모 로그는 `memoType`, `memo`를 저장한다.
- 비밀 메모 평문은 DB에 저장하지 않는다.
