# Backend 규칙 준수 재검토

일자: 2026-11-01. 대상: 이번 TABLE/KANBAN/LIST 본문 조회 변경. 사용자 요청에 따라 규칙을 다시 읽고 코드·계약·실행 결과를 대조했다. 기존 미커밋 변경을 보존하고 커밋하지 않았다.

## 발견한 누락과 조치

최초 결과를 완전 준수 상태로 단정할 수는 없었다. 아래 누락을 실제로 보완했다.

1. 저장소 조회10곳의 단계 주석, 지역/test helper7곳의 기능 주석이 빠져 있었다. 해당 책임과 주요 처리 단계를 한글로 명시했다. 신규 DI factory2곳에도 기능 주석을 추가했다.
2. 앞선 검증에 prisma:generate가 빠져 있었다. Node24.21.0에서 실행하고 성공을 확인했다.
3. 새 조회의 실제 DB integration test가 없었다. 프로젝트 밖에 격리 PostgreSQL17.10을 준비하고 실제 ViewDefinitionModule·소유 Port·Prisma adapter·ReadSnapshotRunner를 통과하는4개 테스트를 추가했다.
4. 계약의 DB 연결 설명과 관계 테이블의 임시 소유권, 조회 인덱스 검토가 충분하지 않았다. 본 문서와 API 계약의 DB 연결 항목에 명시했다.

아래 정적 검토와 실행 검증 범위에서 남은 규칙 위반은 발견하지 못했다. 대규모 데이터 성능은 별도 검증 범위로 남긴다.

## 적용한 정본

- [Backend 지침](../../../BE/AGENTS.md)
- [컨벤션](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/README.md): Backend/API 계약/트랜잭션/관측성/주석 전체
- [아키텍처](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/README.md): 계층·모듈·공통 HTTP·테스트·배포 기준
- [결정 기록](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/README.md):002~007
- [리뷰 체크리스트](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)
- [DB 현황](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), [현재 List/View SQL 제약](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md), [시간 정책](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md)

오래된 Backend 개요의 foundation 모듈 목록은 현재 CRM 코드보다 앞선 시점의 설명이다. 이번 작업은 최신 사용자 범위·현재 schema/모듈 구조를 적용하며 고정형 Company/Deal API를 복원하지 않는다. 규칙을 느슨하게 바꿔 구현에 맞추지 않았다.

## 계층과 모듈 소유권

| 소유 모듈 | 읽는 모델 | 공개 경계 |
| --- | --- | --- |
| view-definition | ViewDefinition, ViewAttributeSettingDefinition, ViewFilterGroupDefinition, ViewFilterConditionDefinition, ViewSortDefinition, ViewGroupDefinition, ViewGroupSettingDefinition | ViewDataConfigurationQuery |
| record-definition | RecordDefinition, RecordAttributeValueDefinition | RecordDataQuery |
| list-definition | ListDefinition, ListEntryDefinition, ListEntryValueDefinition | ListEntryDataQuery |
| object-definition | ObjectDefinition | 기존 ObjectDefinitionSummaryQuery |
| attribute-definition | AttributeDefinition, SelectOption, StatusOption, RelationshipDefinition | AttributeDefinitionMetadataQuery, AttributeRelationshipQuery |
| workspace | WorkspaceMember, Actor | WorkspaceAccessQuery, WorkspaceSnapshotQuery |
| shared | DB context·기술적 transaction 경계 구현 | ReadSnapshotRunner/TransactionContext |

RelationshipDefinition에는 현재 독립 Backend 모듈이 없으므로 이번 읽기의 임시 소유자는 attribute-definition이다. 속성의 참조 경로·대상 Object 검증에 필요한 관계 metadata만 공개한다. 정식 relationship 모듈이 생기면 query Port 구현 소유권을 이전하며 View가 관계 테이블을 직접 조회하게 하지 않는다. 이 임시 소유는 신규 관계 mutation이나 제품 정책을 확정하지 않는다.

Controller는 HTTP DTO·UUID·빈 body·현재 사용자·request ID만 다루고 UseCase를 호출한다. Workspace/설정 권한은 application에서 검사한다. application/domain에 Prisma·Supabase·ConfigService·Express·구체 logger 의존성을 추가하지 않았다. Nest Inject/Injectable만 현재 허용 범위에서 사용한다. ORM 문자열화와 SQL은 infrastructure에 있으며 공개 Port/응답은 순수 타입이다.

DI 조립에서 다른 모듈의 Module을 import하는 것은 공개 Port provider 연결이다. 다른 모듈의 Prisma repository 구현체를 import/주입하는 생산 코드는 없다. 통합 테스트도 실제 모듈을 조립하므로 타 모듈 repository 구현체를 직접 가져오지 않는다.

## Transaction·관측성·HTTP

- GetWorkspaceViewMainContentUseCase가 ReadSnapshotRunner 경계를 시작한다. 현재 modular monolith의 같은 DB 안에서 읽기 일관성을 제공한다. 모든 소유 Port는 같은 TransactionContext를 받는다.
- GET은 model을 변경하지 않는다. 기존 mutation용 TransactionManager를 대체하지 않으며 idempotency/outbox는 쓰기 없는 본 조회에 필요하지 않다. 외부 Provider 호출도 없다.
- 실제 PostgreSQL에서 repeatable read/read-only 설정, 동시 writer 이후 같은 값 유지, snapshot 내 쓰기 거부와 미삽입을 확인했다. future MSA 분리 시 이 DB snapshot을 분산 transaction 전제로 확장하지 않고 읽기 모델/일관성 계약을 재검토한다.
- 기존 AuthGuard·전역 DTO whitelist·ParseUUIDPipe·EmptyRequestPipe·HttpExceptionFilter·request ID 경계를 사용한다. 인증을 Workspace 접근 권한으로 대체하지 않는다.
- view.data.read_completed/read_failed 구조화 event와 안전한 ID·건수·시간·오류 코드만 남긴다. q·셀·비교값·설정 JSON·token·DB URL·원본 provider/DB 오류는 로그에 넣지 않는다. API 오류도 기존 envelope를 유지한다.
- Timestamp 비교/만료는 UTC instant, 날짜 전용 값은 YYYY-MM-DD, Timestamp 그룹 날짜는 User.timeZone이다. 읽기 API이므로 업무 local date-time 저장을 추가하지 않는다.

## 조회 인덱스 검토

schema와 기존 migration을 읽어 확인한 현재 구조를 따른다. 이번 작업으로 인덱스나 제약을 추가하지 않았다.

| 조회 | 현재 기준과 후속 검토 |
| --- | --- |
| WorkspaceMember | 기존 workspaceId/userId unique와 공개 Port로 접근 확인 |
| Object/Record/참조 Record | PK/복합 unique로 ID batch 확인. Object 전체 원본의 workspaceId+objectDefinitionId+id 스캔은 실데이터 EXPLAIN 후 검토 |
| Entry | 기존 workspaceId+listDefinitionId+createdAt+id 인덱스가 있다. 현재 ID 경계 배치와의 효율은 데이터 규모 측정 후 판단 |
| Record/Entry 값 | Entry의 workspaceId+listEntryDefinitionId+attributeDefinitionId 인덱스 유지. Record 값의 복합 조회 최적화는 별도 측정 대상 |
| View 설정 | 현재 추가 조회 인덱스가 없는 구조를 유지한다. workspaceId+viewDefinitionId+정렬 키 후보는 후속 측정·별도 migration 판단 대상 |
| 속성/옵션/관계 | 속성의 기존 소속 인덱스·PK를 이용한다. 옵션/관계 조회의 추가 인덱스는 query plan과 규모를 확인한 뒤 검토 |

현재 전체 원본·값·그룹·응답 크기·시간 제한은 API 계약의 기술적 상한이다. 이는 DB UNIQUE/CHECK나 제품의 중복 허용 정책을 추가한 것이 아니다. 5000개 계산기 측정은 DB 성능 보증이 아니다. 실제 데이터 규모·EXPLAIN·여러 사용자의 부하·많은 참조 경로에 대한 추가 측정은 남아 있다.

## 실행한 검증

Node24.21.0에서 다음을 실행했다. 테스트용 패키지는 /tmp/onehandsales-backend-rule-review.ytRX83 아래에만 설치했으며 프로젝트 package/lockfile·환경 파일을 바꾸지 않았다.

| 검증 | 결과 |
| --- | --- |
| prisma:generate / prisma:validate | 통과. validate의 기존 SetNull/required 경고4개 유지 |
| typecheck / lint / build | 모두 통과 |
| 실제 PostgreSQL 신규 통합 테스트 | 1 suite/4 tests 통과 |
| PostgreSQL 포함 전체 Backend 테스트 | 69 suites/551 tests 통과, 실패0·skip0 |
| 변경 TS48개 AST 정적 검토 | 계층/타 모듈 persistence import·Prisma/Nest 타입 의존·역할/API/기능/조회 단계 주석 누락0 |

통합 테스트는 세 타입 조회, Object grain, 중복 Entry, 두 scope, 정확한 Decimal 정렬/다중값, 참조/Actor 라벨, 저장 필터 후 페이지, 그룹/칸반 열 페이지, foreign Workspace/속성 거부, 실제 readonly/RepeatableRead를 검증한다. HTTP 계약은 별도24개 테스트가 실제 Guard/DTO/Controller/UseCase/reader를 통과하며 외부 인증과 DB는 대체한다. 이 두 검증 층을 구분한다.

임시 DB에는 현재 schema의 from-empty SQL과 기존 migration의 SQL 전용 FK5개·CHECK2개를 적용했다. 과거 migration의 누락 파일을 추정 생성하지 않았다. 업무 DB·기존 서버·Docker를 사용하지 않았다. 테스트 종료 후 해당 DB의 User/Workspace/View는0건이며 작업 소유 PostgreSQL을 중지했다.

기계 판독 결과: /tmp/onehandsales-backend-rule-review.ytRX83/jest-all.json. 준비·정리 harness: 같은 경로의 verify.mjs. 정적 검토 script: /tmp/onehandsales-backend-rule-audit.cjs. 작업 과정과 최초 검증의 한계는 [작업 로그](../../../TODO_LOG/2026-11-01/VIEW_THREE_TYPE_MAIN_QUERY/WORK_LOG.md)에 이력으로 보존한다.
