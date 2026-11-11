# Backend·DB·Frontend 검토

2026-11-11. 구현자가 코드·계약·테스트·실제 DB 카탈로그를 함께 검토했다. 별도 에이전트나 독립 리뷰어의 검토를 의미하지 않는다.

같은 날 사용자 요청으로 [Backend 재검토](BE-TODO/BACKEND_REVIEW.md)를 수행했다. 첫 검토에서 놓친 생성 정책 위치·권한 실패 관측·계약 문서 세부 항목을 수정했다. 아래 준수 판정은 이번 기능 범위이며, 기존 공통 AuthGuard의 인증 실패 로그 부재 때문에 백엔드 전체의 완전 준수를 의미하지 않는다.

## 적용 규칙과 판정

기준: [BE/AGENTS.md](../../BE/AGENTS.md), [Backend README](../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)와 CONVENTION/ARCHITECTURE/DECISIONS, [DB_SCHEMA](../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [Frontend architecture](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md).

| 검토 항목 | 구현·검증 근거 | 판정 |
| --- | --- | --- |
| API 계약 선행 | [확정 계약](COMMON/API-SPEC/SIDEBAR_ORDER_API.md)에 endpoint, 전체 ID 배열, 200/400/401/404/409/500, 정렬 규칙을 먼저 기록 | 준수 |
| 모듈 소유권 | Object/List/Favorite를 각각 object-definition/list-definition/view-definition에 구현. Workspace는 공개 WorkspaceAccessQuery 사용 | 준수 |
| 계층 분리 | controller/DTO/pipe → application use case → repository port → Prisma adapter. Prisma·SQL·Express·구체 logger는 application 계약에 없음. Nest DI decorator만 사용 | 준수 |
| 공통 코드 범위 | shared는 UUID/전체 집합/변경 행의 순수 계산, 일반화된 결과형, HTTP 검증 pipe, infrastructure 잠금 helper만 제공. 모듈별 DTO·저장소 유지 | 준수 |
| transaction 소유권 | application의 TransactionManager가 잠금→현재 목록 조회→검증→변경 저장을 묶음. adapter는 전달된 TransactionContext 해석만 수행 | 준수 |
| 인증·권한 | 기존 AuthGuard·Workspace 멤버십 재사용. 요청 userId/memberId/actorId 금지. 즐겨찾기는 서버에서 확인한 본인 멤버 범위만 처리. 새 역할 제한 없음 | 준수 |
| 검증·원자성 | UUID 대소문자 정규화, 중복/추가 키/query 거부. 누락·다른 범위·추가된 항목은 전체 집합 검증으로 409. 실제 PostgreSQL rollback 확인 | 준수 |
| 동시성·생성 | Object/List 생성과 순서 변경은 같은 Workspace advisory lock. Favorite는 기존 등록/해제의 멤버별 lock 재사용. READ COMMITTED 확인 후 행 잠금, 변경 행 수 재확인 | 준수 |
| 감사·관측 | 변경 행에만 updatedAt/updatedByActorId 기록. no-op은 감사 필드 유지. 권한·접근 조회 실패도 requestId와 안전한 코드로 기록. commit 후 성공 로그 | 이번 기능 보완 완료; 기존 인증 실패 로그 공백은 별도 |
| idempotency/outbox | 최종 순서 지정의 반복 요청은 동일 상태에 수렴. 외부 이벤트/provider 부수 효과 없음. 별도 key/outbox 미도입 근거 계약에 명시 | 준수 |
| schema 범위 | Object/List에 정수 기본값 0 컬럼 2개만 추가. 새로운 UNIQUE/CHECK/인덱스·모델·Enum·역할 정책 없음 | 준수 |
| migration·기존 데이터 | DDL/보정 한 transaction. 기존 표시 순서를 유지해 0부터 초기화. ID·감사 필드·다른 업무 데이터·View 순서 보존 | 준수 |
| SQL 전용 제약 | 실제 DB 전후 constraints 163개, indexes 90개, 기존 컬럼·RLS·정책·ACL 동일. CHECK/복합 FK/컬럼 지정 SET NULL/DEFERRABLE 유지 | 준수 |
| 조회 계약 | 세 기존 GET의 필드·배열 형식 유지. sortOrder ASC만 적용. 상단 ViewDefinition 정렬 규칙은 유지 | 준수 |
| FE 책임 | sidebar-order feature가 API/cache/낙관적 갱신·복구 담당. 공통 SidebarDataList는 행 이동 UI. 공개 index 사용, 한국어·영어 리소스 제공 | 준수 |
| FE 범위·접근성 | 같은 섹션만 drag, 전체 ID 제출, 저장 중 차단. 기존 링크/선택/접힘 유지. 키보드 Space/Arrow/Enter/Escape·focus·live 안내 제공 | 준수 |

테스트 파일에서 여러 모듈 adapter를 직접 조립하는 것은 integration test 구성이다. 운영 코드의 다른 모듈 persistence 직접 의존은 추가하지 않았다. 재검토 후 생성 adapter는 잠금·현재 최대값 조회·전달된 값 저장만 수행하며, 마지막 순서 다음에 추가하는 정책 계산과 transaction orchestration은 application이 소유한다.

## 실제 DB 적용과 보존

- migration: `20261111060000_add_sidebar_definition_sort_order` 적용 완료. 현재 적용 이력 76건, 대기 중인 로컬 SQL 없음. Prisma introspection diff는 empty(exit 0).
- 적용 당시 Object 9행, List 8행, Favorite 2행. 각 범위의 기존 표시 ID 배열과 적용 후 배열이 동일하며 sortOrder는 0부터 연속이다.
- CRM 데이터 20개 테이블의 건수와 checksum 비교 통과. 순서 변경 대상 3개 테이블은 sortOrder만 checksum에서 제외했고 감사 필드는 포함했다. 나머지 테이블은 전체 row를 비교했다. ViewDefinition 및 View 설정 데이터도 동일하다.
- 모든 기존 컬럼·constraint·index·RLS·정책·ACL과 과거 migration checksum을 보존했다. Windows 체크아웃의 LF/CRLF 차이는 내용 동일성을 확인했으며 과거 SQL을 수정하지 않았다.
- 로컬의 기존 빈 `20261016010000_align_view_schema_and_add_favorites` 폴더로 첫 deploy가 P3015로 중단됐다. DB 변경 없이 중단된 것을 확인하고, 유효 SQL과 schema를 `TEMP/sidebar-reorder-tools/migration-bundle/`에 그대로 복사해 Prisma migrate deploy로 새 migration만 적용했다. 빈 원본 폴더는 보존했다.
- DB에만 있는 기존 이력 `20261013050000_create_view_definitions`, `20261013060000_remove_view_query_indexes`의 SQL은 복원/추정 생성하지 않았다. 기존 DB_SCHEMA에 기록된 원본 누락 사항이며 이번 기능 변경과 분리한다.
- 로컬 증거: `TEMP/sidebar-reorder-tools/live-before.json`, `live-after.json`, `live-verification.json`, `live-deploy.log`, `live-diff.log`. Git 추적 대상이 아니며 연결 정보는 결과 문서에 포함하지 않았다.

## 검증 범위와 한계

- Backend 재검토 후 전체 76 suites / 802 tests 통과. 순서 HTTP 69개는 실제 AuthGuard/DTO/UseCase와 mock 저장소를 사용한다. PostgreSQL 통합 14개는 실제 트랜잭션·재조회·소속 분리·동시 재정렬·동시 생성·no-op·rollback·마이그레이션을 검증한다.
- 격리 테스트 DB는 PostgreSQL 17.11, 포트 55441이다. HEAD Prisma baseline과 새 migration으로 준비했다. Prisma가 표현하지 못하는 역사적 SQL 제약 전체를 복제한 환경은 아니며, 해당 제약 보존은 실제 Supabase 전후 카탈로그로 별도 검증했다.
- Backend typecheck/lint/build, Prisma validate/generate 통과. 기존 복합 FK의 SetNull 경고 4개는 SQL의 컬럼 지정 SET NULL을 보존해야 하므로 그대로다. 실행 중인 DLL은 교체하지 않고 같은 설치 버전 DLL을 별도 이름으로 지정해 client 생성했다. 기존 사용자 서버·환경 파일을 변경하지 않았다.
- Frontend unit 18 files / 99 tests, typecheck/lint/build 통과. 최종 브라우저 결과는 [README](README.md)에 기록한다. E2E는 실제 Chromium과 API mock을 사용하므로 Supabase에서 실사용자 순서를 바꿨다는 증거와 구분한다.
- 기존 사이드바 E2E의 행 전체 자식/모든 SVG 선택자를 링크로 좁혀 이동 손잡이와 구분했다. 이미 구현된 Favorite 링크에 대한 오래된 '링크 0개' 단언도 현재 동작에 맞게 수정했다.
- 브라우저 실사용자 세션으로 업무 순서를 변경하거나 원격 앱을 배포하지 않았다. 기존 Vite 개발 화면은 소스 변경을 반영하며 DB migration은 실제 적용했다.

## 운영·복구

DB migration과 새 Prisma client가 API보다 먼저 준비되어야 한다. 동일 범위의 동시 순서 요청은 잠금 순서로 처리해 마지막 commit이 최종 순서다. 순서 자체의 revision 충돌 검사는 추가하지 않았다. 새로 추가/삭제된 ID는 409 후 최신 목록 재조회로 처리한다.

DDL 중 실패는 transaction 전체 rollback이다. 이미 적용된 migration을 수정하거나 down SQL을 자동 실행하지 않는다. 앱 롤백은 추가 컬럼을 남겨도 가능하며, 컬럼을 제거하려면 현재 순서 보존과 앱 의존성을 확인한 별도 후속 migration이 필요하다. 커밋은 구현·재검토 후 사용자의 명시적 후속 요청에 따라 진행한다.
