# Backend 구현 구조와 조회 규칙

## 계층과 공개 Port

이 서비스는 modular monolith + Clean Architecture다. HTTP는 UserWorkspaceViewMainContentController 하나, orchestration은 GetWorkspaceViewMainContentUseCase, snapshot 로드는 ViewDataLoader, 타입 실행은 readers/ 아래11개 함수다.

application에는 Prisma/ConfigService/Express/구체 logger import가 없다. 타 모듈 repository를 직접 참조하지 않는다.

| 소유 모듈 | 공개 읽기 계약 |
| --- | --- |
| workspace | 기존 WorkspaceAccessQuery + snapshot의 멤버십/Actor 표시용 WorkspaceSnapshotQuery |
| object-definition | ObjectDefinitionSummaryQuery의 선택 TransactionContext |
| record-definition | RecordDataQuery: 원본 Record 목록/ID 배치/값 |
| list-definition | ListEntryDataQuery: List 존재/Entry 목록/값 |
| attribute-definition | AttributeDefinitionMetadataQuery의 선택 context + AttributeRelationshipQuery |
| view-definition | ViewDataConfigurationQuery: 설정/명시 TITLE 후보/직접 child/업무 관계 |
| shared | ReadSnapshotRunner: 읽기 전용 transaction. 기존 mutation TransactionManager 동작은 유지 |

RelationshipDefinition의 공개 읽기는 독립 관계 모듈이 없는 현재 구조에서 attribute-definition이 임시 소유한다. 별도 모듈 분리 시 Port 소비자는 유지하고 adapter 소유권을 옮긴다.

## 실행 순서

1. 인증 Guard → 외부 멤버십 검사 → read-only RepeatableRead 시작 → 같은 snapshot 멤버십 재검사.
2. 요청 Workspace의 View와 소속·설정 행 경계 확인. 명시 source 선택 및 타입/part별 입력 검증.
3. 소유 모듈 Port로 원본을250개씩 읽고 Entry 단위를 보존한다. 연결 Record만 batch 중복 제거한다.
4. 표시·필터·정렬·그룹의 속성·경로·옵션, 명시 TITLE 후보, 관계 메타데이터를 읽는다.
5. 필요한 값과 참조 Record/Actor 표시 정보를 제한된 배치로 복원한다. typed FK/JSON alias를 정규화하고 충돌을 감지한다.
6. 필터 전체 실행 → 검색 → typed 정렬 → 타입별 그룹/집계/기간/좌표 → 결과 페이지 처리.
7. 응답 크기 검사, 안전한 완료/실패 로그. 조회 중 설정·최근 선택·업무 데이터는 저장하지 않는다.

## 공통 의미

- 같은 Record를 참조하는 두 ListEntry는 두 원본이다. 그룹 안에서 중복 경로로 같은 값에 도달한 것만 value provenance로 중복 제거한다.
- RECORD 속성이 다른 Object에 속하는 혼합 List 항목은 NOT_APPLICABLE로 판단한다. 해당 필터는 false이며 이를 빈 값과 같게 취급하지 않는다.
- 참조 경로는 RecordReference만 최대3hop. 관계 메타데이터로 대상 Object를 검증한다. ActorReference를 Record 경로처럼 탐색하지 않는다.
- 대표 이름은 같은 Object의 명시 TITLE 후보가 하나의 속성으로 수렴할 때만 사용한다. 모호하면 이름 없는 기록/빈 참조 label을 사용한다.
- 숫자는 Decimal 문자열과 BigInt 고정 소수 계산으로 처리한다. FE 그래프 좌표만 Number로 근사하며 값 표시는 원본 문자열을 유지한다.
- 필터/정렬/집계에 필요한 손상 값은500으로 실패한다. 단순 표시 값의 손상은 INVALID/UNAVAILABLE cell로 격리한다.
- 배열을 단일 Map 값으로 덮어쓰지 않는다. cell은 binding ID, item은 원본 ID, occurrence는 그룹 출현 ID다.
- 정렬 기본 nulls LAST, 다중값은 명시 MIN/MAX reducer가 필요하다. 설정된 정렬 뒤 createdAt/itemKey로 안정화한다.

## 실행·보안 한도

세부 수치는 [API 명세](../COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)를 따른다. 전체 스캔은5,000개로 제한하며 SQL에서 임의 first page를 aggregate 대상으로 삼지 않는다. 요청 사이 snapshot은 유지되지 않는다.

암호화 cursor는 기존 APP_JWT_SECRET에서 용도를 분리한 key로 보호한다. 설정 fingerprint와 사용자 맥락 변경은 재사용을 차단한다. key/원본 값/검색어/조건 JSON/provider 원문 오류는 로그에 넣지 않는다.

shared presentation의 기존 EmptyRequestPipe와 class-validator DTO를 사용한다. view-definition 전용 pipes 폴더를 추가하지 않았다.

## 유지보수 지점

- 제품 날짜 정책: application/view-data/view-data-execution-policy.ts. null은 미확정이며 임의 기본값을 실행하지 않는다.
- 필터/정렬: view-data-selection.ts, 값/경로: view-data-values.ts.
- 그룹/집계: view-data-groups.ts, view-data-aggregation.ts.
- 조회 한도·기본값·지원 config를 바꾸면 API 명세와 의미 검증 테스트를 함께 수정한다.
- 대규모 데이터 지원은 기존 공개 Port 뒤의 SQL pushdown/query planner로 확장한다.
