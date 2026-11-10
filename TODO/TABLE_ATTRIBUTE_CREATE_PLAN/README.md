# TABLE 인라인 속성 생성

- 범위: 관리항목 Object TABLE의 인라인 새 속성 생성. 기존 타입 17종과 통화 기본 설정 재사용.
- 팝오버 제목은 `유형 선택`. 제목 오른쪽 돋보기를 누르면 그 오른쪽 같은 줄에 숨겨진 검색창이 펼쳐지고 입력 포커스가 이동한다. 다시 누르면 검색어를 비우고 닫는다.
- 2026-11-10 UX: 기존 + 영역을 220px 이름 입력으로 전환하고 `컬럼명을 작성해주세요.` 안내와 바로 아래 검색 가능한 2열 유형 팝오버를 표시한다. 작성 중 별도의 +나 본문 임시 셀을 추가하지 않는다. 이름 입력 후 유형 선택으로 생성하며 유형을 먼저 골랐다면 이름 입력 후 Enter/바깥 클릭으로 생성한다.
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
