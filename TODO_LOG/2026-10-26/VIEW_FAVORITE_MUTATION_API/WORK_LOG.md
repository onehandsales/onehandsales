# View 즐겨찾기 추가·삭제 Backend API

- 일자: 2026-10-26
- 상태: Backend 구현·규칙 재검토·커밋 전 검증 완료, 사용자 요청으로 커밋 대상 확정
- 관련 계획: [완료 계획](../../../TODO/DONE/VIEW_FAVORITE_MUTATION_API_PLAN/README.md)
- 기준: [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md), [트랜잭션](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md), [주석](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md)

## 요청과 범위

사용자가 Backend Agent 규칙에 따라 View 즐겨찾기 POST/DELETE API 구현을 요청했다. view-definition에 별도 추가/삭제 UseCase, Command Port·Repository·Controller를 추가하고 기존 Workspace 공개 Port와 TransactionManager를 재사용한다.

추가 신규 생성은 201/true, 기존 등록은 200/true, 삭제·이미 없음은 200/false다. 요청은 Workspace/View UUID와 인증 정보만 사용한다. 본인 즐겨찾기 끝에 sortOrder를 추가하고 삭제는 본인·Workspace·View에 해당하는 행만 제거한다. 남은 순서를 바꾸지 않는다.

최초 구현 범위에서는 스키마·migration·업무 DB·환경 파일·Frontend·사용자 서버·커밋을 제외했다. 커밋은 아래 후속 사용자 명시 요청에 따라 별도 재검토·검증 후 진행한다. View 생성/삭제·즐겨찾기 클릭 연결과 전역 데이터 정리는 계속 제외한다.

## 시작 확인과 예정 순서

- 시작 시 작업 트리가 비어 있음을 확인했다.
- 기존 모듈·Workspace 멤버/Actor Port·공통 트랜잭션·로거·오류 변환과 스키마를 확인했다.
- 계약을 먼저 confirmed로 작성한다. 이후 구현·단위/실제 HTTP/격리 PostgreSQL의 재요청/동시 요청/범위/rollback 검증·규칙 검토를 진행한다.
- 같은 Workspace·멤버 범위에 트랜잭션 advisory lock을 사용하고 View의 소속은 같은 transaction에서 읽기 잠금으로 확인한다. 잠금은 infrastructure 안에서 기존 transaction context로 처리한다.
- 기존 UNIQUE 제약 부재를 유지한다. 새 쓰기 API 경로를 통해 중복 추가를 방지하며 기존 중복은 추가 시 보존하고 본인 해당 View 해제 시 범위 내 행을 모두 삭제한다.

## 검증·검토와 남은 작업

- 계약 confirmed 작성 후 Controller·빈 DTO·별도 등록/해제 UseCase·Command Port/Prisma adapter·DI·오류를 구현했다. Workspace/공통 transaction/스키마/FE는 변경하지 않았다.
- 1차 typecheck에서 통합 테스트의 사이드바 조회 method 오기를 발견해 실제 Port 이름으로 수정했다. 재실행 typecheck/lint 통과.
- 단위·실제 모듈 HTTP 검증 2 suites/41 tests 통과. 추가 입력·인증·201/200·404/500·Actor 예외·commit 후 로그 확인.
- 1차 전체 격리 PostgreSQL 17 검증 61 suites/390 tests 중 388 통과/2 실패. 동시 등록·개인 순서·중복·소속·rollback·등록/해제 경합은 통과했다. 격리 수준 테스트에서 Prisma Proxy를 Object.create로 복제한 보조 코드가 원본 transaction까지 덮어써 재귀 오류와 다음 사례 실패를 유발했다. 저장 구현 문제가 아닌 테스트 설정 오류를 원본 transaction을 캡처·복원하는 spy로 수정했다. 재검증 예정.
- 규칙 검토에서 DB 실패의 도메인별 관측을 보강했다. raw 오류 없이 createFailed/deleteFailed와 안전한 ID만 기록하며 정상 404는 제외한다. 계약을 먼저 갱신했다.

- 수정 후 격리 PostgreSQL 전체 61 suites/390 tests가 실패·skip 없이 통과했다. Workspace/View/Favorite 잔여 fixture 모두 0, 기존 SQL 전용 FK 5개 보존.
- 최종 request 경계 검토에서 빈 배열을 보내는 추가 사례를 작성했다. 1차 테스트 표의 배열 인자 형태로 인한 TypeScript 오류는 object 사례로 수정했다. 실제 검사에서 빈 배열 `[]`가 기본 빈 DTO 검증을 통과함을 발견했다(POST/DELETE 2건). presentation 전용 EmptyViewFavoriteRequestPipe로 계약의 생략/빈 객체만 허용하도록 보강했다. 유스케이스·DB 정책 변경 없음.

## 최종 검증과 G99

- 빈 배열 입력을 보강한 전체 61 suites/394 tests가 실패·skip 없이 통과했다. 최종 검토에서 삭제 rollback 사례도 같은 실제 DB 테스트에 추가했고 전체 394건을 다시 통과했다. 신규 3 suites/53 tests다.
- Node 24.21.0 typecheck/lint/build와 Prisma validate/generate 통과. 기존 Prisma SetNull warning 4건은 schema 변경 없이 유지했다. 테스트 DB에 SQL 전용 FK 5개를 복원해 검증했다.
- 임시 DB Workspace/View/Favorite 잔여 0, 임시 PostgreSQL 종료 확인. 실행 중 사용자의 서버 health 200, POST/DELETE 무인증 401 확인. 업무 DB에 인증된 쓰기 요청을 보내지 않았다.
- 수정/추가 TypeScript 12개에서 금지 의존성·모듈 persistence 직접 접근·unsafe SQL·console 사용이 없음을 확인했다. 신규 선언 역할·API/기능·번호 주석과 공개 계약/실제 HTTP 응답·Actor/멤버/Workspace 범위를 검토했다.
- 결과는 `/tmp/onehandsales-view-favorite.fxm6rztf/summary.json`, `jest-results.json`, `verification-reviewed.log`에 있다. 임시 경로와 별개로 실제 수치·실패 수정 이력은 이 로그에 보존한다.
- 계약 implemented와 DONE 문서 보관, TODO 인덱스·상대 링크를 정리했다. FE·schema/migration·환경 파일·사용자 서버 프로세스·공통/Workspace 코드·커밋은 변경하지 않았다. 최종 검토에서 완료를 막는 결함을 발견하지 않았다.

## 사용자 요청에 따른 커밋 전 재검토

사용자가 Backend Agent 규칙 준수 여부를 다시 검토하고 이상이 없으면 커밋하도록 명시적으로 요청했다. 시작 시 변경 목록은 직전 구현의 View 즐겨찾기 API·테스트·관련 TODO/로그뿐임을 확인했다. 기존 구현 범위를 보존하면서 규칙·계약·소유권·transaction·로그·검증 결과를 다시 대조하고, 필요한 수정과 검증을 마친 뒤 해당 변경만 커밋한다.

규칙·코드를 대조해 계층·소유권·transaction·멱등성·주석·기존 API 보존을 확인했다. 관측 규칙 재검토에서는 기존 전역 RequestIdMiddleware가 있는데도 즐겨찾기 로그까지 requestId가 전달되지 않는 누락을 발견했다. 계약을 먼저 보강한 뒤 Controller가 middleware 결과를 순수 string으로 UseCase에 전달해 성공/실패 로그와 response header를 연계하도록 수정한다. 공통 middleware와 Logger Port·스키마·공개 응답 body는 변경하지 않는다. 1차 typecheck/lint는 통과했으며 수정 후 다시 검증한다.

- 요청 ID 보강 후 테스트의 optional response header 타입 검사 1건을 수정했다. 이후 Node 24.21.0 typecheck/lint/build와 Prisma validate/generate가 모두 통과했다.
- 별도 임시 PostgreSQL 17.10에서 전체 61 suites/400 tests 통과, 실패·skip 0이다. 기존 검증에 성공/실패 요청 ID·middleware 생성/정규화/긴 값 대체·query/body 위조 차단 6건을 보강했다. 신규 범위는 총 3 suites/59 tests다. Workspace/View/Favorite fixture는 모두 0, 기존 SQL 전용 FK 5개를 보존했고 임시 PostgreSQL은 종료했다.
- 재검토 결과: `/tmp/onehandsales-favorite-review.n4mgy5fq/summary.json`, `jest-results.json`, `verification.log`. 임시 경로와 별개로 위 실제 결과를 이 로그에 보존한다.
- 변경 TypeScript 12개에서 금지 의존성·다른 모듈 persistence 직접 접근·unsafe SQL·console 사용 없음. 단순 행 기반 주석 점검은 긴 Module decorator를 오탐해 TypeScript AST 기반으로 다시 확인했고 class/interface·API/function/method 주석 누락 0이다.
- 실행 중 서버 smoke에서 health 200, 새 POST/DELETE 무인증 401, 동일 x-request-id response header를 확인했다. 업무 DB 쓰기나 사용자 서버 프로세스·환경 파일·공통 코드 변경은 없다.
- 요청/응답·오류·멱등성·잠금 순서·rollback·감사 Actor·로그 redaction·문서 링크·변경 범위를 최종 검토했다. 추가 규칙 위반이나 완료를 막는 결함은 발견하지 않았다. 사용자의 명시 요청에 따라 이 API·테스트·관련 계획/로그만 커밋한다.
