# TABLE·KANBAN·LIST 본문 조회 API

상태: 구현·Backend 규칙 재검토·격리 PostgreSQL 포함 검증 완료. 날짜: 2026-11-01. 최초 비 DB 검증의 한계와 추가 요청 이후 보완 결과를 아래 이력으로 구분한다. 사용자 명시 구현 요청이며 goal/커밋/배포는 생성하지 않았다.

## 범위와 기준

- 시작 시 main/ed89ede0, tracked/untracked 변경 없음을 확인했다. origin/main과 ahead1/behind1 상태는 보존한다.
- AGENTS.md, BE/AGENTS.md, Backend convention/architecture/decision, DB_SCHEMA와 기존 조회 계획을 적용한다.
- GET 하나와 TABLE/KANBAN/LIST만 구현한다. schema/FE/업무 데이터/환경/의존성은 유지한다.
- 기존 헤더 Port를 확장하고 소유 모듈별 query adapter를 연결한다. application이 read-only RepeatableRead snapshot을 시작한다.
- 과거 11타입 작업의 공개 조회 기반을 검토해 재사용하되 실행기/DTO/설정 읽기는 이번 세 타입으로 좁혔다.

## 진행 기록

1. API 계약을 구현 전에 confirmed로 구체화하고 README/현재 범위를 세 타입으로 정리했다.
2. Record/Entry/속성/관계/Workspace 공개 Port, snapshot runner, 암호화 cursor, 세 reader와 HTTP endpoint를 연결했다.
3. 숨긴 cell 제외, 그룹 metadata/접힘 보존, Decimal 비교, anchor 페이지, 참조 alias 충돌과 권한 검증을 보완했다.
4. 최초 검증 단계에 본 로그를 생성했다. 로컬 기록 규칙의 시작 시 생성 요구보다 늦게 생성한 사실을 남긴다.
5. 실제 ViewDefinitionModule을 통과하는 HTTP 테스트, 동일 snapshot Port 테스트, read-only runner 테스트를 보강했다. 비교 참조의 값/라벨 로딩, null 그룹키, 빈 복합값, Timestamp instant와 Decimal 그룹 identity를 보완했다.
6. TABLE/KANBAN/LIST 응답 JSON을 단위 fixture 실행 결과로 갱신하고 과거11타입 문서의 우선순위를 명시했다.

## 검증 기록

- 초기 typecheck 통과, lint 통과.
- 단위/HTTP 2 suites / 44 tests 통과. 최초 테스트의 readonly fixture 수정 오류를 보완했다.
- pnpm test에 Jest 옵션을 직접 전달한 명령은 pnpm 옵션 오류로 실패했고 pnpm exec jest로 수정했다.
- 기본 Node22와 요구 Node24 차이를 확인하고 후속 검증은 설치된 Node24.21.0을 명령 범위에서 사용한다.
- Docker daemon은 연결 불가이며 사용 가능한 로컬 PostgreSQL 실행기도 찾지 못했다. shell의 TEST_DATABASE_URL은 미설정이지만 테스트 import 중 BE/.env의 로컬 테스트 URL이 로딩되는 점을 확인했다. 실제 업무 DB를 테스트 DB로 대체하지 않았다.
- 기본 환경 전체 테스트 최초 실행: 68 suites 중8개 실패/60개 통과, 536 tests 중15개 실패/521개 통과. 실패는 localhost:5432 테스트 DB 연결 불가였다.
- 최종 비 DB 회귀는 명령 범위에서 TEST_DATABASE_URL=을 전달해 위 DB 의존 테스트를 제외했다. .env 파일 수정 없음. 새 테스트의 readonly fixture 대입 및 mock 인자 lint 오류는 수정 후 재검증했다.

## 최초 구현 완료 시 실행 결과(추가 재검토 전)

아래 pnpm 명령은 PATH 앞에 /Users/jaegeunsong/.local/share/fnm/node-versions/v24.21.0/installation/bin을 붙여 Node24.21.0으로 실행했다. 기본 설치 Node22와 패키지 엔진 차이를 환경 파일 수정으로 해결하지 않았다.

| 실제 명령 | 결과 |
| --- | --- |
| pnpm -C BE typecheck | exit0 |
| pnpm -C BE lint | exit0 |
| pnpm -C BE build | exit0 |
| pnpm -C BE prisma:validate | exit0, 기존 SetNull/required 경고4개 |
| TEST_DATABASE_URL= pnpm -C BE exec jest --runInBand --json --outputFile=/tmp/onehandsales-view-three-type-jest-final.json | exit0, 57 suites/519 tests 통과, DB 필요11 suites/28 tests 미실행, 총547 tests |
| git diff --check | exit0 |
| git diff --exit-code -- BE/prisma/schema.prisma BE/prisma/migrations FE BE/package.json BE/pnpm-lock.yaml pnpm-lock.yaml | exit0, 변경 없음 |
| 주요5개 문서 링크·TABLE/KANBAN/LIST 예제 JSON 정합성 검사 | exit0, 각 예제 Entry3/Record2 확인 |

이번 API 테스트76개는 실행기41/loader5/HTTP24/read runner6으로 위519개에 포함된다. 실제 모듈을 조립했지만 DB·외부 인증은 대체했으므로 실 DB E2E 검증과 구분한다.

별도 계산기 측정은 5000개 Entry의 단순 fixture에서 TABLE7.77ms/84011bytes, KANBAN41.74ms/185792bytes, LIST3.18ms/83911bytes(limit100)였다. SQL·네트워크·실데이터·전체 API 지연을 측정한 결과가 아니다.

## 인수 검토와 제한

- 요구사항과 파일 경계는 [구현 검토](../../../TODO/VIEW_MAIN_CONTENT_QUERY_PLAN/COMMON/IMPLEMENTATION_REVIEW.md), 요청/응답/지원표·상한은 [API 계약](../../../TODO/VIEW_MAIN_CONTENT_QUERY_PLAN/COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)에 연결했다.
- Record/Entry grain, scope별 값, 옵션·참조 정보, 전체 평가 후 페이지, 칸반 열별 cursor, 권한·빈 결과·설정 오류를 테스트했다.
- 전체 원본 최대5000개 등을 메모리에서 처리하는 초기 구현이다. SQL pushdown/실제 query plan·동시성/대규모 처리 검증은 후속이다.
- Actor는 이름 snapshot, 참조 Record는 모호하지 않은 직접 TITLE를 사용한다. 칸반 다중 단계·집계, 동적 필터 토큰 등은 명시 안내한다. HTTP 페이지 사이 업무 snapshot은 보장하지 않는다.
- 기존 사용자 변경은 시작 시 없었다. 스키마/마이그레이션/FE/패키지/환경/업무 데이터 변경과 커밋은 하지 않았다. 최종 diff 및 문서/JSON 정합성 검사를 완료했다. HEAD는 ed89ede0로 유지된다.

## 추가 요청: Backend 규칙 준수 재검토

- 사용자가 Backend Agent 규칙의 정확한 준수 여부를 다시 검토하도록 요청했다. 기존 미커밋 변경을 보존하고 규칙·체크리스트 전체와 관련 DB 기준을 다시 읽었다.
- 변경 TypeScript47개를 AST로 검사했다. 계층 금지 import·타 모듈 Prisma repository import, class/interface·API·함수 주석은 확인했고, 저장소 단계 주석10곳과 지역/test helper 기능 주석7곳의 누락을 발견해 보완했다.
- API 응답·필터·정렬 동작은 바꾸지 않았다. snapshot callback의 권한 검증 단계도 명시했다. 재검사 결과 위 정적 항목의 누락은0개다.
- 앞선 검증에서 빠졌던 prisma:generate를 Node24.21.0으로 실행해 통과했다. 프로젝트 의존성·schema는 변경하지 않았다.
- DB 모델 연결·임시 소유권·인덱스 검토를 Backend 내부 검토 문서에 명시하고, 실제 repository 통합 검증을 보완할 수 있는 격리 테스트 환경을 확인한다.
- 신규 DI factory2곳의 기능 주석과 application/암호화 흐름의 단계 주석도 보완했다. 응답·필터·정렬의 생산 코드 동작 변경은 없다.
- /tmp/onehandsales-backend-rule-review.ytRX83에만 embedded-postgres@17.10.0-beta.17을 준비했다. 패키지의 symlink 복원 script 내용을 확인하고 해당 임시 패키지 내부에서만 실행했다. 프로젝트 dependency/lockfile·환경 파일·기존 서버는 변경하지 않았다.
- 임시 PostgreSQL17.10에 현재 schema의 from-empty SQL과 기존 migration의 SQL 전용 FK5개·CHECK2개를 적용했다. 실제 모듈/공개 Port/Prisma/readonly snapshot 통합 테스트4개를 추가하고 모두 통과했다. 새 테스트는 전용 TEST_DATABASE_URL이 있을 때 실행한다.
- 격리 DB를 사용한 전체 회귀는69 suites/551 tests 통과, 실패0·skip0이다. 신규 본문 API 테스트는5 suites/80 tests다. PostgreSQL에서 실제 readonly/RepeatableRead, 동시 writer 이후 snapshot 유지, snapshot 내 쓰기 거부, scope별 값/라벨·필터/정렬/페이지·Workspace 격리를 확인했다.
- Node24.21.0에서 prisma:generate/validate, typecheck/lint/build를 모두 재검증했다. 기존 Prisma SetNull 경고4개는 보존했다.
- 테스트 종료 후 전용 DB User/Workspace/View0건과 임시 PostgreSQL 중지를 확인했다. 최종 결과는 /tmp/onehandsales-backend-rule-review.ytRX83/jest-all.json, 준비·정리 harness는 같은 경로의 verify.mjs다.
- TS48개 AST 검사에서 alias/상대 경로의 계층 의존, 타 모듈 persistence import, Prisma·Nest 타입 경계, 역할/API/기능/factory/조회 단계 주석을 확인했으며 남은 누락0개다. 정적 검사 script는 /tmp/onehandsales-backend-rule-audit.cjs다.
- [Backend 규칙별 검토](../../../TODO/VIEW_MAIN_CONTENT_QUERY_PLAN/BE-TODO/BACKEND_RULE_COMPLIANCE_REVIEW.md)와 공통 계약·구현 검토·DB 현황 문서에 최신 결과를 반영했다. 대규모 EXPLAIN/부하 측정은 남은 검증 범위다.
- 최종 git diff --check와 schema/migration·FE·project package/lockfile 무변경 검사가 exit0이었다. 주요 검토 문서의 상대 링크, 전체 테스트 JSON의551개 통과/skip0, 작업 소유 PostgreSQL 프로세스0개를 추가 확인했다. 커밋 없음.
