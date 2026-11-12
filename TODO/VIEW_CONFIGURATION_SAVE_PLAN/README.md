# 보기 설정 저장

2026-11-12 사용자 승인: 컬럼 표시명을 포함한 일괄 저장, View 표시 제목과 연결 기록의 대표 이름 분리.

필수 선행 정본: [TODO Software Agent Reference](../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md). [사용자 흐름](COMMON/USER-FLOW.md), [작업 순서](COMMON/GOAL-WORK-ORDER.md), [BE 구현](BE-TODO/IMPLEMENTATION.md), [DB 연결](BE-TODO/DB-SCHEMA.md), [FE 구현](FE-TODO/IMPLEMENTATION.md), [규칙 재검토](COMMON/PLANNING-REVIEW.md)를 함께 따른다. 이 문서 구조의 누락은 구현 후 재검토에서 보완했으며 구현 전 검토가 있었다고 소급하지 않는다.

## 구현

- TABLE/KANBAN/LIST의 필터·정렬·보기 설정을 하나의 baseline/draft로 관리한다. 미리보기는250ms debounce 후 서버의 기존 본문 실행기로 평가한다. 컬럼 표시명·너비·순서·숨김, 제목 속성, 그룹·단계, 표시 간격을 같은 저장 흐름에 연결했다.
- `보기 설정 저장`은 변경한 section만 원자적으로 반영한다. 실패/409는 입력을 유지하며 최신 설정 사용은 명시적으로 선택한다. `변경 되돌리기`는 원본 설정을 복원한다. 같은 View 접근자에게 공통 적용된다.
- [API 계약](COMMON/API-SPEC/VIEW_CONFIGURATION_API.md): GET configuration, GET configuration/options, POST data/preview, PATCH configuration. 기존 메뉴 GET/본문 GET/컬럼 PATCH는 유지한다.
- 권한·속성 소속·필터 순환·타입별 비교·정렬·그룹을 쓰기 전에 검증한다. View 행 잠금 이후 버전을 비교하고 같은 상태 재전송은 no-op으로 처리한다. 새 ID 경합은409이며 다른 View 행을 수정하지 않는다.
- Object 대표 속성 포인터와 공개 query port를 추가했다. 연결 이름은 다른 View의 TITLE/숨김에 영향을 받지 않고, 대표 속성의 실제 값 변경에는 따라 바뀐다.

## DB 적용

설정 저장은 기존7개 View 테이블을 사용한다. 별도 이력/초안 테이블은 추가하지 않았다. `ObjectDefinition.recordTitleAttributeDefinitionId` 추가는 대표 이름 분리를 위한 별도 변경이다.

Supabase에 `20261112090000_object_record_title`을 적용했다. 기존1개 Object에 단일 이름 후보를 연결했고 회사3개·Entry4개·Record 속성값30개를 보존했다. 기존 DB에만 남은 과거 migration2건은 수정하지 않았다.

실제 Supabase의 TABLE/LIST/KANBAN 모두 미리보기→7개 테이블 쓰기→transaction 내부 재조회→강제 rollback→원본 버전 확인을 통과했다. 검증 스크립트는 항상 rollback한다. DB 일반 테스트용 환경과 live DB를 바꿔 연결하지 않는다.

```bash
cd BE
node --env-file=.env -r ts-node/register -r tsconfig-paths/register scripts/verify-view-configuration.ts
```

## 검증

2026-11-12 재검토 후 최신 결과: BE 65 suites/832 tests, FE 20 files/112 tests, 관련 Chromium 36 tests 통과. BE/FE typecheck·lint·build 및 Prisma validate 통과. Supabase 세 타입은 읽기 전용 설정 조회/미리보기와 버전 불변을 다시 확인했다. 이번 검토에는 DB 쓰기·migration이 없고 전용 DB 테스트 53개는 계속 제외한다. 상세 발견/보완은 [재검토 보고서](COMMON/PLANNING-REVIEW.md)를 따른다.

```bash
cd BE
node --env-file=.env -r ts-node/register -r tsconfig-paths/register scripts/verify-view-configuration.ts --read-only
```

아래는 최초 구현 시점의 검증 이력이다.

- Backend: 64 suites/822 tests 통과. 전용 DB가 필요한14 suites/53 tests는 `TEST_DATABASE_URL=`로 제외했고 Supabase에서 일반 테스트를 돌리지 않았다. View 제목 변경·숨김 후 연결 이름 유지와 같은 우선순위의 신규 행 미리보기 순서를 회귀 검증했다.
- Frontend: Vitest20 files/109 tests 통과. 실제 QueryClient로 저장·되돌리기·오류·충돌·보기 이동 후 늦은 응답을 검증했다.
- Prisma validate 통과. 기존 List 관계의 SetNull 경고4건은 이번 변경과 무관하게 남아 있다.
- Chromium E2E36개 통과: 설정 저장3개, 컬럼 표시명5개, 컬럼 생성12개, 기존11개 유형의 메뉴 및 상태 수명16개. 한 요청의 필터·정렬·설정 저장, 새로고침 복원, 실패 입력 유지,409 명시 복구, 좁은 화면의 한국어 IME, 저장 중 보기 이동을 확인했다.
- BE/FE typecheck·lint·build 및 `git diff --check` 통과. FE build의 기존 큰 chunk/Browserslist 경고는 남아 있다.
- 최종 Supabase 확인: Object1/대표 이름 연결1/Record3/Entry4/Record 값30/필터 조건0/검증용 표시명0. 현재3000번 서버의 새 설정 경로가 인증되지 않은 요청에401을 반환하는 것도 확인했다.

## 범위와 주의점

나머지8개 보기 유형, 보기 복사, 대표 속성을 바꾸는 별도 UI는 이번 범위가 아니다. 원본 속성 생성과 업무 값 수정은 기존 독립 저장 흐름이다. 설정 편집 도중 별도 컬럼 생성 등으로 저장 버전이 바뀌면409로 안내하며 자동 병합하지 않는다. 다른 보기로 이동하면 임시 입력은 해제되고 브라우저 종료에는 저장 전 경고를 등록한다.

Backend는 modular monolith + Clean Architecture를 유지하며 타 module의 데이터는 공개 port로 읽는다. application이 transaction을 조율하고 Prisma는 infrastructure에서만 사용한다. 새 권한 등급·Object/List 단일 소속 제약·외부 메시지 전송·outbox를 추가하지 않았다.
