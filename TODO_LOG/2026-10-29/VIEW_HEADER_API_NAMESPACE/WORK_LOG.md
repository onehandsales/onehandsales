# View 헤더 API 경로와 식별자 명칭 변경

- 작업일: 2026-10-29
- 상태: 조건부 완료 (계약·구현·unit/HTTP/E2E 완료, DB 통합은 로컬 테스트 DB 연결 필요)
- 사용자 요청: Object/List View 목록과 개인 즐겨찾기 등록/해제 API를 view-header 경로 아래로 옮기고 해당 API의 viewId 요청/응답을 viewDefinitionId로 변경한다. 프론트·백엔드 영향을 확인하고 함께 반영한다.

## 범위

- 지정된 GET 2개와 POST/DELETE 2개, DTO/application 응답, FE client/type/선택·캐시, 관련 unit/HTTP/E2E를 변경한다.
- 초기 GET view-header의 viewId 응답은 유지한다. FE에서 초기 응답을 viewDefinitionId 기반 선택 모델로 변환한다.
- 사이드바 응답은 유지하며 entryViewId 추가는 수행하지 않는다. DB schema·데이터·ENV·서버·Admin Web을 변경하지 않는다.
- 기존 인증/UUID 검증/선택 의미/즐겨찾기 트랜잭션·멱등성·status를 유지한다.
- 시작 시 Git 작업 트리는 깨끗했다. 커밋은 별도 요청 시 수행한다.

## 진행

- 실제 BE controller/DTO/use case, FE client/type/hook/query cache와 E2E mock 경로를 대조했다.
- 초기 헤더와 목록/변경 응답의 서로 다른 ID 명칭을 명시적으로 연결해야 함을 확인했다.
- API 계약을 먼저 기록한 뒤 구현과 검증을 진행한다.
- 확정 계약 작성 후 네 API의 controller/Query DTO/공개 application 응답을 변경했다. private repository Scope·SQL·트랜잭션·기존 로그 필드는 보존했다.
- User Web client/선택 모델/즐겨찾기 응답·캐시와 E2E mock 경로를 함께 변경했다. 초기 헤더의 viewId와 변경 응답의 viewDefinitionId 연결을 명시했다.
- 이전 API 문서에는 새 계약 링크와 superseded 표시를 추가했다.

## 검증

- `pnpm.cmd -C BE typecheck`, `pnpm.cmd -C BE lint`, `pnpm.cmd -C BE build`: 통과.
- `pnpm.cmd -C BE prisma:validate`: 통과. 기존 required relation의 SetNull 경고 4건은 이번 범위에서 변경하지 않았다.
- `pnpm.cmd -C FE/user-web typecheck`, `pnpm.cmd -C FE/user-web lint`, `pnpm.cmd -C FE/user-web build`: 통과. Vite의 기존 chunk 크기 안내가 출력됐다.
- `pnpm.cmd -C FE/user-web test`: 13개 파일 / 58개 테스트 통과.
- `pnpm.cmd -C FE/user-web exec playwright test tests/e2e/view-header-integration.spec.ts tests/e2e/view-favorite-mutation.spec.ts tests/e2e/view-header-ux.spec.ts`: 24개 통과. Object/List 선택 query, 새 응답, 초기 헤더 연결, 즐겨찾기 등록/해제, 실패/재시도, 지연 응답, 인증 갱신과 반응형 공유 상태를 검증했다. API 응답은 mock이며 실제 Supabase 인증·쓰기 검증은 아니다.
- `pnpm.cmd -C BE exec jest --runInBand`: 54개 suite / 388개 테스트 통과, DB 연결이 필요한 7개 suite / 14개 테스트 실패. 모두 localhost:5432 연결 불가다. 실행 전 PowerShell에는 TEST_DATABASE_URL이 없었지만 PrismaClient import가 기존 .env를 읽어 localhost:5432 테스트 연결을 활성화함을 별도 read-only Node 명령으로 확인했다. ENV 파일이나 DB 연결 설정은 수정하지 않았다.
- 최초 `pnpm.cmd -C BE test --runInBand`는 pnpm 옵션 해석으로 실행되지 않아 `exec jest --runInBand`로 다시 실행했다.
- `pnpm.cmd -C BE exec jest --runInBand --testPathPattern=src/modules/view-definition --testPathIgnorePatterns=infrastructure/persistence`: 9개 suite / 167개 테스트 통과. 초기 헤더·사이드바 회귀, 새 네 API의 module wiring/응답/인증/권한/UUID·Query 검증을 포함한다. 구 viewId query가 거부되는 것도 확인했다.
- `git diff --check`: 통과.
- 커밋 전 `git diff --cached --check`에서 신규 계약 문서의 파일 끝 빈 줄을 발견해 제거하고 다시 확인했다.
- DB 저장/조회 로직과 Prisma 스키마는 변경하지 않는다. 실제 Supabase에 테스트 쓰기를 수행하지 않는다.

## 관련 문서

- `BE/AGENTS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 검토 결과

- 요청한 네 API의 경로와 식별자를 변경했고, 실제 호출하는 User Web까지 같은 계약으로 반영했다.
- 초기 헤더 응답의 viewId는 보존하고 viewDefinitionId 선택 모델·즐겨찾기 캐시와 명시적으로 연결했다. 사이드바의 기존 응답과 User/Admin 경계를 보존했다.
- ViewDefinitionModule의 기존 Clean Architecture 계층·소유 모듈 공개 Port·트랜잭션을 유지했다. private repository 로직 변경은 없고 해당 repository 테스트의 공개 응답 기대값만 수정했다.
- 이전 계약 문서의 대체 관계를 표시했다. 작업 시작 후 변경 파일은 이번 계약·호출부·테스트·문서에 한정된다.

## 전체 진행 현황·남은 검증·다음 권장 작업

- 완료: 영향 분석, 확정 계약, Backend 네 API, User Web 연결, 관련 unit/HTTP/E2E, 양쪽 typecheck/lint/build, 문서와 작업 기록.
- 남은 검증: localhost:5432 테스트 DB가 준비된 환경에서 실패한 DB 통합 7개 suite 재실행. 실제 Supabase 인증·저장 검증은 이번에 수행하지 않았다.
- 통합 환경 적용 시 BE와 User Web을 함께 배포한다. 구 경로 alias는 제공하지 않으므로 별도 소비자가 있으면 새 계약으로 맞춘다.
- 후속 사용자 요청으로 이번 변경분을 Git 커밋한다. 기존 검증 결과와 변경 범위를 다시 확인했고 추가 코드 수정은 없다.
