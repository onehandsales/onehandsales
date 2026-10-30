# 현재 코드와 실제 Supabase 데이터 조사

## 조사 방법과 범위

- 기준 시각: 2026-10-30 06:07~06:09 UTC, 15:07~15:09 KST.
- 현재 BE 환경 설정으로 Supabase PostgreSQL에 연결했다. 접속 URL·비밀키는 문서와 출력에 포함하지 않았다.
- Prisma를 통해 `SET TRANSACTION READ ONLY` 후 읽었으며 `transaction_read_only=on`을 확인했다. 쓰기·seed·migration·DDL은 실행하지 않았다.
- 전체 CRM 테이블 건수와 Workspace별 View 분포를 조회했다. 원문 값·관계·설정의 상세 조사는 기존 fixture가 가리키는 영업 Workspace `99c91c59-04f0-4549-b1b1-956692030cb4` 전체를 대상으로 했다. 다른 Workspace의 고객 원문이나 인증 데이터는 조사 대상에 넣지 않았다.
- 해당 Workspace의 아래 19개 CRM 모델 전체 행, Actor ID/type, 관련 실제 인덱스를 읽었다. 별도 쿼리 사이의 시점 차이는 가능하며 운영의 고정 snapshot 보장을 검증한 것은 아니다.
- 응답/비즈니스 로직의 기대값은 읽은 값에 대한 계산이다. 신규 HTTP API나 렌더러의 실행 결과가 아니다.

## 건수

| 모델 | 전체 DB | 영업 목 데이터 |
| --- | ---: | ---: |
| ObjectDefinition | 8 | 6 |
| ListDefinition | 8 | 8 |
| RecordDefinition | 58 | 54 |
| RecordAttributeValueDefinition | 573 | 557 |
| ListEntryDefinition | 56 | 56 |
| ListEntryValueDefinition | 173 | 173 |
| AttributeDefinition | 83 | 79 |
| SelectOption / StatusOption | 26 / 30 | 26 / 30 |
| RelationshipDefinition | 6 | 6 |
| ViewDefinition | 24 | 24 |
| ViewAttributeSettingDefinition | 113 | 113 |
| ViewFilterGroupDefinition / ViewFilterConditionDefinition | 4 / 4 | 4 / 4 |
| ViewSortDefinition | 8 | 8 |
| ViewGroupDefinition / ViewGroupSettingDefinition | 4 / 30 | 4 / 30 |
| ViewWidgetDefinition | 3 | 3 |
| ViewWorkDependencyDefinition | 10 | 10 |

Object별 Record는 회사 5, 고객·담당자 15, 제품 3, 영업기회 9, 영업업무 20, 계약 2다. List별 Entry는 영업 실행 업무 20, 계약 갱신·확장 2, 핵심 타깃 계정 5, 영업 파이프라인 7, 핵심 관계자 관리 15, 데모·제품 평가·PoC 3, 보안·법무 검토 2, 제안·견적 제출 2다.

현재 8개 List는 각각 단일 Object의 Record를 담고 있고 동일 List·Record 중복 Entry는 없다. 이 관측을 혼합 Object 금지나 중복 등록 금지 정책으로 바꾸지 않는다.

## 타입별 현재 설정과 검증 기준

| 타입 | View / ID | 실제 저장 설정과 읽기 기대값 |
| --- | --- | --- |
| TABLE | 전체 회사 / `14ca47cb-a8f3-49c5-a6db-f892ea778070` | 회사명 ASC, 열 8개, Record 5개. TABLE 전체는 Object 6개+List 8개로 14개 |
| KANBAN | 영업 단계별 / `4cd3c5b5-ea58-484c-a6b3-cb628be72a2c` | 파이프라인 Entry 7개 중 Record 금액 `gte 180000`에 4개. Record Status 기준, 10개 단계 설정, 금액 DESC, 빈 단계 표시 |
| LIST | 핵심 관계자 / `fec614b1-e7b7-45c1-b2f6-df70129e997b` | Entry 15개. RECORD PersonalName 제목·회사 연결, LIST_ENTRY 역할·접촉 전략. 그룹 설정 없음 |
| GALLERY | 제품 카드 / `7d211dc9-6431-4193-ad4f-fda1c1f0ce64` | Record 3개. TITLE/IMAGE/BODY/DISPLAY, MEDIUM·CONTAIN, 단가 DESC |
| CALENDAR | 영업 일정 / `871f800f-0067-4507-a32f-d528ac71f120` | Entry 20개. RECORD 시작·종료 Date, MONTH·MONDAY. 전체 기간 2026-10-26~12-04 |
| TIMELINE | 제품 평가 일정 / `17ac8486-0c98-4450-a5df-1c6633356e4e` | Entry 3개 중 LIST_ENTRY 시작일 `gte 2026-11-09`에 2개. 두 기간 모두 11-09~11-27, WEEK |
| GANTT | 업무 진행 계획 / `026950ca-02b3-4984-b8b8-af02c28bbd48` | Entry 20개, RECORD 날짜·진행률, WEEK·showDependencies. Record 간 FS 관계 10개 |
| CHART | 단계별 예상 금액 / `290cb7db-abed-4fbb-aab5-35e12caf13d2` | 파이프라인 Entry 대상, Record 금액·단계, `gte 180000`, SUM·BAR, 4개/950000 USD |
| PIVOT | 회사·단계별 집계 / `950e0b0d-c5ec-40f1-971a-e3d5e212fd73` | 파이프라인 Entry 대상, Record 회사×영업 단계, 같은 금액 필터·SUM, 행·열 합계 켬. 4개/950000 USD |
| MAP | 타깃 계정 지도 / `dbbe011a-cce6-4dd6-9269-c1a6cb4ea243` | Entry 5개, RECORD Location 좌표 5개 모두 존재. fitToData·showLabels |
| DASHBOARD | 영업 현황 / `fbb10880-bf54-40ed-b9d9-b72de995f47a` | 12열 배치. CHART/PIVOT/KANBAN을 참조하는 위젯 3개. showTitle=true |

계산된 단계별 금액은 초기 미팅 250000, 제품 평가 220000, PoC 준비 180000, 기술·보안 검토 300000 USD다. 실제 전체 합계는 950000 USD다. UX 문서의 5건·2200만원·지도 4핀·대시보드 6위젯은 설명용 예시이므로 이 데이터의 기대값으로 쓰지 않는다.

CALENDAR/GANTT에서 조회창을 `[2026-11-01, 2026-12-01)`로 하고 저장 종료 Date를 포함하는 제안을 적용하면 겹치는 업무는 **9개**다. 10-29~11-02 항목도 포함해야 한다. 날짜 미설정은 현재 0개다. 이는 날짜 경계 제안 P04에 대한 기대값이며 확정 제품 정책은 아니다.

## 값의 실제 표현

| 값 | 관측 | 설계 영향 |
| --- | --- | --- |
| Currency | `numberValue` Decimal 문자열, 속성 config의 통화 USD | IEEE 754 부동소수 합산 금지. 숫자 문자열과 통화 분리 |
| Select/Status | typed 옵션 ID와 같은 의미의 `jsonValue` 함께 존재 | 두 값 불일치 감지. 옵션 이름은 Attribute 소유 Port로 일괄 조회 |
| RecordReference | Record 값 200행, typed Record/Object ID와 JSON의 `recordDefinitionId/objectDefinitionId` 함께 존재 | 관계 정의와 실제 연결값 구분. 다중값을 한 값으로 덮어쓰지 않음 |
| ActorReference | typed Actor ID와 JSON `actorId` | UI의 `targetActorId` 호환 경로도 검토 필요 |
| PersonalName | JSON `displayName`과 `textValue` | 제목을 RecordDefinition.name에서 읽을 수 없음 |
| Location | JSON `{text, latitude, longitude}`와 textValue | 위도 37.55~37.59, 경도 126.95~126.99의 실제 좌표 5개 사용 |
| IMAGE 역할 | Text 속성에 `data:image/svg+xml,...` 값 3개 | https URL만 허용한다고 가정하면 목 이미지가 사라짐. 미디어 정책 P07 필요 |
| 진행률 | Number 저장값 0, 30, 40, 50, 60, 70. `valueScale:100` | 저장값 50은 50%. API에 원본과 정규화 비율을 구분 |
| 다중 관계 | 같은 Record·Attribute에 2/3/5/9행. 관측된 중복 그룹은 isMultiselect=true | 배열 보존, SQL join 증식과 논리 행 구분 |

현재 113개 표시 설정과 필터·정렬·그룹의 참조 경로는 모두 `[]`다. 참조 경로 traversal의 동작을 이 목 데이터로 검증했다고 볼 수 없다. 둘 다 소속된 View, 소속 없는 View, 숨김 속성, 그룹 접힘, 중복 Entry, Timestamp/DST, 다중값 집계, 위젯 순환의 검증용 데이터도 별도로 필요하다.

## 현재 구현과 재사용 판단

| 소유 영역 / 근거 | 현재 제공 | 필요한 보완 |
| --- | --- | --- |
| [view-definition module](../../../BE/src/modules/view-definition/infrastructure/view-definition.module.ts) | 헤더·View 목록·즐겨찾기·메뉴 GET | 주 화면 실행 endpoint·조회기 없음 |
| [ViewHeaderConfigurationQuery](../../../BE/src/modules/view-definition/application/ports/view-header-configuration-query.port.ts) | View/필터/정렬/표시·그룹·위젯 읽기 | snapshot context, 실행용 검증·타입 해석 추가 |
| [ViewHeaderMenuReader](../../../BE/src/modules/view-definition/application/view-header-menu-reader.ts) | Workspace·참조 존재·필터 순환 등 메뉴 무결성 검사 | 비교 연산 실행·관계 경로 평가·집계 기능으로 간주하지 않음 |
| [Record 목록](../../../BE/src/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case.ts) | Object별 createdAt/id ASC 25행과 값 | 저장 View 필터·정렬·List Entry·집계는 새 공개 조회 Port 필요 |
| [Record 값 수정](../../../BE/src/modules/record-definition/application/use-cases/update-workspace-object-record-attribute-value-definition.use-case.ts) | 타입별 값 쓰기 | Select/Status/참조는 JSON만 쓰고 typed ID를 비움. seed와 쓰기 결과의 공통 decoder 필요 |
| [Attribute metadata](../../../BE/src/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port.ts) | 속성·옵션 일괄 공개 조회 | 제목 선택 정보·관계 메타데이터 범위 보완 |
| [Object summary](../../../BE/src/modules/object-definition/application/ports/object-definition-summary-query.port.ts) / [List summary](../../../BE/src/modules/list-definition/application/ports/list-definition-summary-query.port.ts) | Workspace 범위 대상 요약 | List Entry/값 읽기는 새 Port 필요 |
| [crm-view](../../../FE/user-web/src/features/crm-view/README.md) | 공통 헤더, 메뉴 GET, 임시 편집 | 본문 데이터 query·11개 renderer 없음 |
| [Object 페이지](../../../FE/user-web/src/pages/workspace-object-list/index.tsx) | Object 원본 표·로컬 검색·셀 편집 | View 데이터로 전환, 다중값 Map 덮어쓰기 방지, 속성 자체 수정과 View 설정 분리 |
| [List 페이지](../../../FE/user-web/src/pages/workspace-list/index.tsx) | 헤더 도구와 빈 본문 | 공통 View 본문 연결 |

RecordDefinitionModule은 현재 목록 조회 Port를 export하지 않고 materializer만 export한다. ListDefinitionModule은 Summary Port를 export한다. 단순 import만으로 새 조회 기능이 공개되는 것으로 계획하지 않는다.

## DB와 런타임 한계

- 실제 View 10개 테이블의 인덱스는 PK뿐이며 RecordAttributeValueDefinition도 PK뿐이다. ListEntry/값의 일부 복합 인덱스는 존재한다. 대량 EAV 조회 성능은 측정해야 하며 이 조사에서는 인덱스를 추가하지 않았다.
- 기본 View FK는 ID 존재 중심이다. 같은 Workspace·View·Attribute 관계는 application 검증이 필요하다.
- DB 직접 조회 성공은 HTTP 인증·인가, Supabase RLS의 사용자 권한, 배포 API, 화면 렌더링 성공을 증명하지 않는다.
- 기존 TransactionManager는 isolation을 지정하지 않는다. 단순히 기존 transaction을 사용했다고 여러 SELECT가 같은 snapshot이라는 설명을 하지 않는다.
