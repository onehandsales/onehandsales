# TABLE 인라인 속성 생성

- 범위: 관리항목 Object TABLE의 인라인 새 속성 생성. 기존 타입 17종과 통화 기본 설정 재사용.
- [공통 API 계약](COMMON/API-SPEC/TABLE_ATTRIBUTE_CREATE_API.md)
- [구현 및 규칙 검토](REVIEW.md)
- 백엔드 규칙: BACKEND_AGENT의 Clean Architecture·공개 Port·application transaction·API 계약·주석·로그 규칙.
- 프론트 규칙: FRONT_AGENT의 feature 경계·인증 API client·query key·캐시 갱신·한국어 기능 주석·E2E 규칙.
- 기존 값 편집 API의 참조 ID 정규화, ListEntry 쓰기, 선택지 관리, 기존 속성 추가, 저장된 속성/컬럼 이름 편집은 후속 범위.
- 서버/Docker 기동과 실제 Supabase 쓰기는 수행하지 않는다. 코드와 격리 검증만 진행한다.

## 검증 계획

- BE: 소속/권한/17종 검증, 동일 트랜잭션 전달과 실패 전파, 재시도, View 순서, 기존 기록 빈 셀, 기존 API 회귀. PostgreSQL의 실제 rollback·동시 생성은 별도 격리 DB가 필요한 검증으로 구분한다.
- FE: 인라인 생성, 유형 아이콘, 미완성/Esc/IME, 실패 재시도, 중복 제출, 새로고침 복원, 다른 View 이동 후 늦은 응답, 한국어/영문.
- typecheck/lint/unit/build, Prisma validate, 실행 중인 User Web을 사용하는 mock API Playwright.
