# Backend 구조와 공통 조회 규칙

상태: draft. [API 계약](../COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)과 [검토 결정](../COMMON/PLANNING-REVIEW.md)을 함께 적용한다. 필수 선행 기준은 [TODO 작성 규칙](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [BE 지침](../../../BE/AGENTS.md)이다.

현재 구현 범위는 [주 화면 조회 GET만](../COMMON/SCOPE_AND_DEFERRED_WORK.md)이다. 저장된 필터·정렬을 실행하는 query와 후속 설정 저장 command를 분리한다. 필터·정렬 저장 use case/controller/repository 또는 임시 override를 이번 구현에 추가하지 않는다.

## 1. 계층과 소유권

```text
presentation/http/user-workspace-view-data.controller.ts
  → GetWorkspaceViewMainContentUseCase
    → ViewExecutionConfigurationReader
    → ViewDataReaderRegistry (11개 타입 등록)
      → 행 / 칸반 / 일정 / 차트 / 피벗 / 지도 / 대시보드 조회기
    → owning module의 공개 query Port
      → owning module infrastructure의 Prisma adapter
    → presentation response mapper
```

각 이름은 신규 파일·책임 제안이다. 기존 파일 존재를 뜻하지 않는다. 11개 타입 registry는 빠짐없는 타입 검사를 사용하고 알 수 없는 타입을 TABLE로 fallback하지 않는다. TABLE/LIST/GALLERY의 기반 행 조회, 날짜형의 기간 계산, CHART/PIVOT의 집계기는 재사용할 수 있다.

| 모듈 | 조회 책임 | Port 제안 / 기존 활용 |
| --- | --- | --- |
| workspace | 현재 사용자의 멤버십, Actor 표시 요약 | 기존 WORKSPACE_ACCESS_QUERY, 신규 WORKSPACE_ACTOR_SUMMARY_QUERY |
| object-definition | View 원본 Object 확인 | 기존 OBJECT_DEFINITION_SUMMARY_QUERY |
| list-definition | List 확인, ListEntry와 ListEntryValue 읽기 | 기존 LIST_DEFINITION_SUMMARY_QUERY, 신규 LIST_ENTRY_DATA_QUERY |
| record-definition | Record·RecordAttributeValue, 참조 Record 요약·값 | 신규 RECORD_DATA_QUERY. 기존 목록 Port의 mapper·배치 조회 방식 참고 |
| attribute-definition | Attribute, 옵션, 관계 정의 메타데이터 | 기존 ATTRIBUTE_DEFINITION_METADATA_QUERY 확장. RelationshipDefinition 조회의 임시 소유자도 이 모듈로 명시하는 제안 |
| view-definition | View 설정, 실행 orchestration, 타입별 projection, 위젯 | 기존 설정 Query 재사용/확장. 신규 VIEW_WORK_DEPENDENCY_QUERY의 임시 소유자 |
| shared/application·infrastructure | 시계, logger, 읽기 snapshot context | APPLICATION_LOGGER·시계 Port, 신규 ReadSnapshotRunner 제안 |

Actor는 User ID와 동일하지 않다. workspace의 Actor 요약이 다른 모듈의 사용자 표시 정보를 필요로 하면 User 공개 query Port를 사용한다. 다른 module의 Prisma repository 구현체를 import하거나 `view-definition` repository에서 모든 도메인의 테이블을 직접 읽는 구조로 만들지 않는다.

RelationshipDefinition은 연결 가능한 양쪽 속성의 메타데이터다. 실제 연결은 값 테이블의 target ID/JSON이다. 조회기에서 관계 정의만 보고 모든 Record가 연결된 것으로 계산하지 않는다.

ViewWorkDependencyDefinition은 이름에 View가 있지만 View FK가 없는 실제 업무 관계다. 정식 업무 관계 모듈이 없는 동안 읽기 소유권을 view-definition에 명시하고 공개 Port 뒤에 둔다. View 삭제와 관계 삭제를 연결하지 않는다.

## 2. 재사용과 확장

- ViewHeaderMenuReader의 참조·트리 검증은 실행용 공통 검증으로 추출할 수 있다. 내부에서 자체 HTTP 메뉴 GET 3개를 호출하지 않는다.
- 기존 메뉴 조회는 저장 JSON을 표시하는 기능이다. 성공했다고 조건을 실행할 수 있는 것은 아니다. 연산자·타입·경로·role·aggregation은 별도 검증한다.
- Dashboard 메뉴 Reader는 원본 위젯 하나가 누락돼도 전체 실패할 수 있다. 새 본문은 위젯별 상태가 필요하므로 기존 settings 메서드를 그대로 호출해 부분 실패 요구를 충족했다고 주장하지 않는다.
- 기존 Record list의 25개 응답을 가져온 다음 필터링하는 방식은 사용할 수 없다. 원본 단위 전체에서 조건을 평가하고 최종 페이지를 만든다.
- 기존 Record list Port는 module export가 없다. 새 public Port를 실제 provider/export/import까지 연결한다.
- 현재 메뉴·메타데이터 Port는 snapshot context가 없다. 같은 snapshot이 필요하면 공개 내부 계약에 선택적 context를 추가하거나 별도 실행용 Port를 제공한다.

## 3. 한 요청의 처리 순서

1. presentation에서 UUID, scalar query, part별 조합과 빈 body를 검증한다.
2. application에서 current user 멤버십을 확인한다. 실패하면 View·값 조회를 호출하지 않는다.
3. 읽기 snapshot 안에서 멤버십을 재확인하고 View, 선택한 소속, 관련 설정을 읽는다.
4. 모든 사용 참조의 Workspace와 직접 소속을 검증한다. ID-only FK를 동일 Workspace 보장의 근거로 쓰지 않는다.
5. 필터 그래프·속성 경로·그룹·옵션·필수 역할·JSON을 해석한다. 설정 식별값을 계산하고 cursor 맥락을 확인한다.
6. 조회 원본의 Record/Entry ID를 배치 단위로 읽고 필요한 값만 소유 모듈 Port로 가져온다.
7. 공통 decoder로 값 집합을 정규화하고 저장 조건과 q를 적용한다. 검색/정렬에 옵션·참조 이름이 필요한 경우 그 라벨도 이 단계 전에 일괄 조회한다. 아래 9단계의 표시용 보충만으로 전체 이름 검색을 했다고 간주하지 않는다.
8. 타입별 그룹·기간·집계·위치 계산과 안전 한도 검사를 수행한다.
9. 정렬·cursor 페이지를 확정하고 필요한 표시값·라벨을 일괄 보충한다.
10. 응답 DTO로 변환한다. Prisma Decimal/Date, 원시 repository row, 내부 오류를 공개 타입으로 내보내지 않는다.

## 4. 조회 단위와 sourceScope

| 경우 | 원본 행 | RECORD 참조 출발 | LIST_ENTRY 참조 출발 |
| --- | --- | --- | --- |
| Object View | RecordDefinition.id | 해당 Record | 실행 가능한 List 원본이 없어 설정 오류 |
| List View | ListEntryDefinition.id | Entry.recordDefinitionId | 해당 Entry |

사용자가 List 조회·집계는 Entry 기준으로 선택했다. 동일 Record가 List 안에서 두 Entry로 존재하면 두 행·두 업무이며 Record 측정값도 Entry별로 한 번 기여한다. 참조를 펼친 JOIN 때문에 한 Entry가 여러 행으로 늘어난 경우와 구분한다. 설정을 Record에서 읽는다는 이유로 List View의 count 단위를 Record로 바꾸지 않는다.

View에 Object/List 양쪽 FK가 있으면 요청의 sourceType과 실제 FK를 사용한다는 제안이다. 하나만 있으면 그 소속을 사용한다. 둘 다 없는 일반 View는 NEEDS_CONFIGURATION, Dashboard는 위젯 원본으로 구성할 수 있다. DB에 XOR CHECK를 추가하지 않는다.

List에 혼합 Object가 있더라도 삭제·병합·일괄 거부 정책을 임의 추가하지 않는다. 특정 Object의 속성이 적용되지 않는 항목은 `NOT_APPLICABLE` 내부 상태로 구분한다. 해당 속성의 비교 조건에서는 false를 반환한다는 제안을 P01에서 확정한다. null인 실제 값과 다른 Object에 적용 불가한 속성을 동일하게 취급하지 않는다.

## 5. 참조 경로

`sourceScope + referenceAttributeIdPathJson + attributeDefinitionId`가 하나의 필드 접근을 정의한다.

1. 경로 JSON이 UUID 배열인지 검증한다. 배열 순서는 의미가 있으므로 정렬하지 않는다.
2. 출발 Record/Entry에 속한 첫 관계 속성인지 검증한다.
3. 각 hop은 RecordReference 타입이어야 한다. 관계 메타데이터의 출발/대상 Object와 실제 값의 target Record/Object를 검증한다.
4. 대상 Record와 속성의 Workspace·Object 소속을 검증하고 다음 hop을 처리한다.
5. 마지막 Record/Entry와 terminal Attribute가 맞는지 확인한다. 실제 저장값이 없어도 잘못된 경로를 정상 경로로 승인하지 않는다.
6. 다중 참조의 여러 말단 값을 원본 itemKey에 연결한다. 같은 말단을 여러 경로로 도달했는지 provenance를 보존해 P03의 중복 정책을 적용한다.

RecordReference가 아니라 ActorReference로 사용자 내부 속성을 임의 탐색하지 않는다. 순환 경로·깊이·fan-out 안전 한도는 P05의 실행 제한이며 새로운 도메인 관계 제약으로 DB에 저장하지 않는다. 현재 목 데이터 경로는 전부 []라 별도 검증 데이터가 필요하다.

## 6. 값 decoder

- 하나의 Record/Entry·Attribute에 여러 value row가 있을 수 있다. 배열로 읽는다. isMultiselect=false인데 여러 유효값이 있으면 임의 첫 행을 택하지 않고 데이터 문제로 감지한다.
- 실제 seed는 typed ID와 JSON을 함께 갖는다. 현재 Record 수정 API는 Select/Status/참조 값을 JSON에만 저장한다. 조회 decoder가 두 저장 경로를 다뤄야 한다.
- RecordReference의 JSON `recordDefinitionId/objectDefinitionId`와 기존 FE가 읽는 `targetRecordDefinitionId/targetObjectDefinitionId`, Actor의 `actorId/targetActorId`를 정규화 후보로 검토한다. 두 표현이 동시에 있고 다르면 실패한다. 이 호환 계약은 P02다.
- typed 값과 JSON이 모두 유효하면 같은 대상을 가리키는지 검증한다. typed 값만 있거나 유효한 JSON만 있으면 검증된 대상을 사용한다. 임의 문자열을 UUID 참조로 추정하지 않는다.
- FK 삭제로 typed ID만 null이 되고 JSON에 과거 ID가 남을 수 있다. fallback 전에 대상 존재·소속을 확인하여 삭제된 참조를 부활시키지 않는다.
- 표시만 필요한 불가 참조는 UNAVAILABLE cell로 처리한다. 필터·정렬·집계에 쓰이는 값을 유효하게 해석할 수 없으면 잘못된 결과를 성공으로 반환하지 않는다. 날짜/좌표/진행률의 타입별 표시 부족은 별도 규칙으로 미설정·invalid 목록/issue에 남길 수 있다. 이 허용을 사용자가 명시한 필터의 실패까지 무시하는 규칙으로 확대하지 않는다.
- Date는 날짜 문자열, Timestamp는 instant, Decimal은 문자열을 유지한다. 위치 JSON의 number는 유한수·위경도 범위를 검증한다. `0` 좌표와 `false` 값은 빈 값이 아니다.
- 표시용 숫자 문자열을 정렬 기준으로 쓰지 않는다. 통화 단위는 Attribute config에서 읽고 통화 환산을 자동 수행하지 않는다.
- TITLE은 View 설정이다. RecordDefinition에는 공통 name 컬럼이 없으며 Object에 명시적인 대표 제목 FK도 없다. 참조 Record의 표시 이름 선택은 P01에서 별도 확정한다. 단기 후보는 같은 Object의 직접 TITLE 메타데이터를 찾아 일관된 제목을 선택하고, 없으면 사용자용 ‘이름 없는 기록’으로 표시하는 방식이다. 요청마다 임의 첫 Text 필드를 고르지 않는다.

## 7. 필터와 검색

현재 실제 연산자는 `gte` 4개뿐이다. 아래는 일반 실행 계약의 제안이며 DB enum이나 기존 완료 기능으로 표시하지 않는다.

| 연산자 후보 | 대상 | 비교값 |
| --- | --- | --- |
| eq / neq | 단일 scalar·옵션/참조 ID | `{value:typed value}` |
| gt / gte / lt / lte | Number/Rating/Currency/Date/Timestamp | Decimal/날짜/시각 문자열 |
| contains / starts_with / ends_with | Text·문자열형 속성 | `{value:string}` |
| in / not_in | scalar·옵션/참조 ID | `{values:typed value[]}` |
| is_empty / is_not_empty | 지원 속성 집합 | 비교값 없음 |

선택/참조는 라벨 대신 ID로 비교한다. PersonalName은 displayName, Location은 text 등 복합형의 검색 필드는 별도 allow-list로 제한한다. 지원하지 않는 연산자·상대 날짜·현재 사용자 토큰·과거 상태 조건은 조용히 무시하지 않고 설정 미지원으로 안내한다.

필터 그룹은 전체 노드의 View/Workspace 일치·부모 존재·cycle을 검사한다. 여러 루트는 AND로 결합하고 빈 그룹은 조건 없음으로 중립 처리한다는 제안이다. 이를 Attio의 비공개 내부 계산 규칙으로 설명하지 않는다.

ANY는 유효값 중 하나 이상, ALL은 유효값이 있고 모두 조건 만족으로 제안한다. 값 집합이 비었을 때 ALL을 vacuous true로 하지 않는 안이다. is_empty는 별도 집합 연산이다. neq+ANY와 not_in+ALL은 다중값에서 결과가 다르므로 테스트한다. 빈 문자열·빈 JSON·누락 row·all-null placeholder의 empty 판정과 문자열 대소문자/locale 규칙은 P02에서 확정한다.

검색 q는 저장 필터와 AND로 적용한다. 제목·표시 텍스트·허용된 옵션/참조 이름을 대상으로 서버에서 처리한다. 숫자·좌표·긴 JSON의 문자열화를 임의 검색 대상으로 넣지 않는다. 대소문자 무시 부분 일치와 Unicode 정규화는 제안이며 locale sorting과 별개다.

## 8. 정렬·그룹·페이지

- 저장 정렬은 sortOrder → createdAt → id 순서로 우선순위를 고정한다. 값은 속성 타입으로 비교한다.
- `nulls:LAST`는 ASC/DESC 모두 마지막이다. 실제 목 설정 8개가 이를 사용한다. nulls 미설정 기본값도 P02에서 확정한다.
- 마지막 tie-breaker는 원본 item ID다. 무정렬 기본안은 createdAt ASC, id ASC로 기존 Record 목록과 맞춘다.
- 다중값 정렬의 대표값을 임의 첫 value row로 선택하지 않는다. MIN/MAX 등 축약 정책이 없는 설정은 실행 미지원으로 다룬다.
- TABLE/LIST/TIMELINE/GANTT의 일반 그룹은 metadata 전체 건수와 정렬된 행의 groupPath를 반환한다. 행 cursor는 그룹 순서+행 정렬 tuple을 포함하므로 페이지 경계의 같은 그룹을 FE가 이어 붙일 수 있다. 다중값 그룹 기여를 허용하는 P03 안에서는 같은 항목이 여러 그룹에 나타날 수 있다. itemKey는 논리 항목 ID, occurrenceKey는 itemKey+groupPath의 표시 위치 ID로 구분한다. 전체 count는 고유 itemKey 기준이며 cursor/page 렌더링은 occurrenceKey를 포함한다.
- KANBAN은 각 열의 독립 pageInfo를 반환한다. 모든 카드의 첫 25개를 열로 나눠 빈 열로 만드는 구현을 하지 않는다.
- GroupSetting은 해당 그룹·Attribute·option/groupKey를 정확히 검증한다. labelOverride·sortOrder·isHidden·isFold를 적용한다. 감춤은 접근 권한이 아니며 전체 matched count와 눈에 보이는 카드 수를 구분한다.
- 그룹 key는 이름 아닌 정규화한 값/ID다. null 그룹에도 충돌하지 않는 key를 둔다. 옵션 없는 상태 행은 미설정 그룹으로 확인할 수 있어야 한다.

## 9. 집계

1. Record 또는 ListEntry 단위로 전체 조건을 먼저 평가한다.
2. 각 항목의 측정값과 그룹/계열 값을 읽는다. 조인 증식으로 같은 측정값을 여러 번 더하지 않는다.
3. 원본 항목별 기여를 만든 뒤 Decimal로 그룹·셀·전체를 집계한다.
4. 표시할 축/셀만 페이지·안전 한도 검사를 한다. 원본 행 첫 페이지로 전체 집계를 계산하지 않는다.

SUM/AVG/MIN/MAX는 수치값, COUNT_ITEMS는 원본 항목 수, COUNT_VALUES는 유효 측정값 수로 구분한다. COUNT_ITEMS는 가짜 Attribute 없이 가능하다. AVG의 전체 합계를 그룹 평균의 합/단순 평균으로 만들지 않고 원본 sum/count로 계산한다.

제안: 입력 항목이 0개인 SUM/COUNT는 "0", AVG/MIN/MAX는 null. 항목은 있으나 모든 측정값이 비어 있으면 SUM/AVG/MIN/MAX는 null과 missingValueItemCount를 반환한다. 피벗에 없는 조합은 셀을 생략하고 UI가 ‘대상 없음’을 표현하며, 실제 0과 값 없음은 result.value/itemCount/valueCount로 구분한다.

복수 그룹값·복수 측정값·관계 중복의 기여는 P03 결정 전 단일값과 동일하게 처리하지 않는다. 제안은 같은 item·같은 그룹/셀·같은 측정 원본은 한 번 기여하고, 다른 그룹에 기여한 경우 전체 합계는 고유 원본에서 별도로 계산하는 것이다. 숫자가 같다는 이유로 `SUM(DISTINCT amount)`를 쓰면 다른 업무 금액을 누락하므로 금지한다.

Currency의 통화는 metric 단위로 일치해야 한다. 여러 통화/측정값의 무조건 합계나 환율 변환은 제공하지 않는다. 현재 목 데이터는 관련 통화가 모두 USD이므로 이 경계의 검증을 대체하지 않는다.

## 10. 기간·지도·Dashboard

- DATE 종료 포함 제안: `startDate < rangeEndExclusive AND effectiveEndDate >= rangeStart`. TIMESTAMP 구간은 `start < rangeEnd AND end > rangeStart`; 단일 시점은 `rangeStart <= start < rangeEnd`로 별도 처리한다.
- Date를 UTC midnight으로 표현했다가 사용자 시간대로 날짜를 밀지 않는다. Timestamp 조회창만 IANA 시간대의 자정으로 계산하며 DST의 23/25시간 하루를 처리한다.
- 시작/끝이 뒤집힌 항목은 INVALID_DATE_ITEMS, 필수 값이 없는 항목은 UNSCHEDULED_ITEMS에 남긴다. 필터에서 이미 제외된 항목을 다시 추가하지 않는다.
- MAP은 필터된 유효 좌표 전체에서 bounds를 계산하고 마커와 목록의 page를 별도로 반환한다. 미좌표 항목을 0,0에 찍지 않는다. 지도 공급자/지오코딩은 P07.
- Dashboard는 위젯 구성만 우선 반환한다. FE가 원본 View마다 같은 API를 호출하며 원본별 필터·권한을 재확인한다. dashboard의 List 소속을 child source에 덮어씌우지 않는다.
- 위젯 key는 widget ID이고 동일 View를 가리키는 위젯 둘은 두 배치다. 동일 조회 캐시는 재사용할 수 있다.
- 자기/순환 참조는 방문 경로로 감지한다. 전역 visited 집합만으로 정상 반복 참조를 순환으로 판정하지 않는다. 숨긴 위젯은 내용 조회를 생략한다. 허용 중첩과 깊이는 P08.

## 11. 일관성과 성능

읽기 snapshot은 새 ReadSnapshotRunner의 infrastructure adapter에서 read-only RepeatableRead로 실행하는 제안이다. 모든 참여 Port가 같은 context를 전달해야 하며 중간에 기본 Prisma client를 쓰면 보장이 깨진다. App use case가 경계를 소유한다. 기존 mutation transaction의 기본 동작은 별도로 유지한다.

모듈 경계를 지키는 첫 실행안은 **원본 ID 스트리밍 + 필요한 값의 배치 조회 + 필터/집계 accumulator**다. List에서는 Entry/EntryValue를 list-definition에서, 연결 Record 값은 record-definition에서 batch로 받는다. 이는 무조건 빠른 SQL 한 번과 같지 않으며 작은 목 데이터 통과만으로 규모 성능을 보장하지 않는다.

필터 pushdown은 의미를 보존할 수 있을 때만 허용한다. RECORD 조건과 LIST_ENTRY 조건이 OR로 묶인 경우 한쪽만 먼저 필터링해 후보를 버리지 않는다. 결과 페이지 크기를 원본 scan 제한으로 쓰지 않는다. LIMIT 이전 전체 대상 계산이 필요하면 bounded scan을 끝내야 하며, 한도/timeout이면 422/503으로 종료하고 부분 합계를 200으로 반환하지 않는다.

반환 페이지 기본 25/최대100, 날짜창 최대366일은 초안 값이다. scan batch 크기, 총 후보/관계 fan-out/그룹 수/피벗 셀 수/응답 바이트/쿼리 시간 예산은 P05에서 측정 후 수치화한다. 지정 없는 무제한 메모리 적재를 구현 완료 조건으로 허용하지 않는다. 페이지 정렬은 cursor 뒤의 top-k를 유지하거나 소유 Port의 동등한 DB 정렬을 사용한다.

향후 대량 EAV JOIN 최적화가 필요하면 명시적인 read model 소유권과 갱신·정합성 계약을 먼저 설계한다. 최적화를 이유로 현재 `view-definition`이 다른 모듈 repository를 직접 참조하지 않는다. 인덱스 후보·EXPLAIN·시간·쿼리 수·메모리를 함께 검토하고 migration은 별도 변경으로 다룬다.

## 12. 컨벤션과 검증

- class/interface: `// 역할 : ...`, API method: `// API : ...`, 내부 함수: `// 기능 : ...`.
- 인증·설정·snapshot·조회·변환의 큰 흐름에 `// 1. ...` 번호 주석. 의미 없는 한 줄 번역 주석은 피한다.
- 도메인/application 공개 타입에 Nest HTTP/Prisma/Supabase 타입을 노출하지 않는다. Decimal 계산 추상화도 Prisma.Decimal 자체를 public port로 넘기지 않는다.
- HTTP UUID/body/query 검증은 기존 shared/presentation 규칙을 재사용한다. Workspace 조회를 Pipe 안에 넣지 않는다.
- logger Port와 request ID를 사용하고 비교값·PII·긴 JSON·credential을 기록하지 않는다.
- 구현 후 typecheck/lint/test/build와 경계 검토를 수행한다. schema 변경이 실제 발생할 때 Prisma 검증과 DB 영향 검증을 추가한다. 이번 문서 작업의 정적 검토를 그 결과로 대체하지 않는다.
