# View 더미 설정

기존 영업 샘플 Workspace의 화면 검증용 설정이다. 사용자 승인에 따라 2026-10-28 적용한다. API 계약이나 실제 상세조회/렌더러 구현 완료를 의미하지 않는다.

## 대상과 실행

- Workspace: 영업, `99c91c59-04f0-4549-b1b1-956692030cb4`.
- 규격: `view-demo-settings.fixture.json`. 도구: `seed-view-demo-settings.mjs`.
- Node.js 24와 설치된 BE Prisma Client를 사용하고 BE/.env를 메모리로 읽는다.
- 저장 JSON에 version 필드를 넣지 않는다. 사용자 후속 지시에 따라 위젯 `showTitle: true`를 포함한다.
- 환경 파일, 기존 auth seed, Docker, migration, 실행 중 서버는 변경하지 않는다.

저장소 루트에서 실행한다.

```powershell
node BE/prisma/seed-view-demo-settings.mjs plan
node BE/prisma/seed-view-demo-settings.mjs rollback
node BE/prisma/seed-view-demo-settings.mjs apply
node BE/prisma/seed-view-demo-settings.mjs verify
```

plan/verify는 DB 읽기 전용이다. rollback은 실제 입력과 검증 후 transaction 전체를 되돌리고 전체 CRM 데이터 digest 원복을 확인한다. apply는 단일 Serializable transaction에서 입력한다. 동일 fixture 재실행은 변경 0행이며, 기존 설정이 다른 값으로 바뀌었으면 덮어쓰지 않고 중단한다.

기존 View/표시 설정/정렬/필터/위젯 행 잠금과 transaction advisory lock을 사용한다. 신규 설정은 Workspace namespace 기반의 결정적 UUID를 사용한다. 이 도구는 승인된 영업 샘플 snapshot 전용이며 일반 제품 seed나 사용자 설정 초기화 기능이 아니다.

## 입력 범위

| 테이블 | 작업 |
| --- | --- |
| ViewDefinition | 24행 configJson |
| ViewAttributeSettingDefinition | Date 19, Currency 9, 진행률 2: formatJson 30행 |
| ViewSortDefinition | 기존 4행 configJson, 신규 4행 |
| ViewFilterGroupDefinition | 신규 4행 |
| ViewFilterConditionDefinition | 신규 4행 |
| ViewWidgetDefinition | 기존 3행 configJson: showTitle=true |

총 기존 61행 갱신, 신규 12행이다. 표시 속성의 참조/역할, 위젯 제목/참조/배치, 기존 정렬 방향, 원본 Record/ListEntry/값, 다른 Workspace는 보존한다. 변경 Actor는 같은 Workspace에 존재하는 해당 더미 View의 생성 Actor를 사용한다.

## 저장 규격과 의미

- ViewDefinition.configJson: TABLE/LIST rowDensity, KANBAN cardDensity/showEmptyGroups, GALLERY cardSize/imageFit, CALENDAR initialMode/weekStartsOn, TIMELINE/GANTT timeScale, GANTT showDependencies, CHART chartType/aggregation/showLegend, PIVOT aggregation/showRowTotals/showColumnTotals, MAP fitToData/showLabels, DASHBOARD gridColumns.
- 각 키의 정확한 값과 대상 UUID는 fixture 파일이 기준이다. 날짜·집계·그룹 속성 ID를 configJson에 중복 저장하지 않는다.
- comparisonOperator=`gte`; comparisonValueJson=`{"value":"180000"}` 또는 `{"value":"2026-11-09"}`.
- 금액 문자열은 Decimal 숫자로, Date 문자열은 날짜로 비교한다. 상대 날짜·현재 사용자 조건은 이번 fixture에 없다.
- 필터는 각 View의 독립된 루트 AND 그룹에 단일 조건을 연결한다. referenceAttributeIdPathJson=[], multiValueMatchMode=ANY, sortOrder=0.
- 정렬 configJson=`{"nulls":"LAST"}`는 null을 마지막에 배치하는 의미다. 다중값 정렬 규칙은 추가하지 않는다.
- Date formatJson=`{"dateFormat":"YYYY-MM-DD"}`.
- Currency formatJson=`{"useGrouping":true,"fractionDigits":0}`. 통화는 기존 AttributeDefinition의 USD 설정을 따른다.
- 진행률 formatJson=`{"style":"PERCENT","valueScale":100,"fractionDigits":0}`. 저장값 50을 50%로 표시한다.
- 위젯 configJson=`{"showTitle":true}`는 제목 표시 여부다. titleOverride=null은 별도 제목 없음이며 참조 View 이름 사용은 후속 renderer에서 구현한다.
- 이 JSON을 해석하는 View 상세조회 API와 화면은 이번 작업에 포함하지 않는다.

## 데이터 기대 결과

| View | 설정 | 기대 결과 |
| --- | --- | --- |
| 영업 단계별 KANBAN | Record 금액 >= 180000 | 4개 항목 |
| 단계별 예상 금액 CHART | 같은 필터, SUM | 4개 항목, 950000 USD |
| 회사·단계별 집계 PIVOT | 같은 필터, SUM | 4개 항목, 합계 950000 USD |
| 제품 평가 일정 TIMELINE | ListEntry 검증 시작일 >= 2026-11-09 | 2개 항목 |

신규 정렬: 전체 회사/회사명 ASC, 전체 제품/제품명 ASC, 영업 단계별/가상 예상 금액 DESC, 제품 카드/가상 단가 DESC. 기존 4개 날짜 정렬은 유지한다.

## 백업과 검증

- 첫 apply의 변경 전 설정 전체 행, 추가할 ID/값, 보호 대상 테이블 digest, ENV digest를 Git 제외 경로 TEMP/view-demo-settings-20261028/before-*.json에 보관한다.
- 백업에는 접속 URL, 비밀키, 사용자 인증정보, 원본 고객 데이터 값을 저장하지 않는다.
- 복구가 필요한 경우 백업의 before 원본과 insertedRows를 현재 DB와 대조해서 이번 변경만 복구한다. 이후 사용자 변경을 덮어쓰는 자동 복구 명령은 제공하지 않는다.
- 저장 필드/Workspace/속성 소속, 실제 필터 결과, 원본 및 허용 범위 밖 데이터 digest, ENV 보존을 검증한다.
- 이후 업무 데이터나 설정을 편집하면 이 snapshot 전용 verify가 실패할 수 있다. 그 경우 fixture를 강제로 덮어쓰지 않는다.

