# 11개 View 타입별 조회 비즈니스 로직

상태: **설계 초안, 구현 전**. 공통 인증·소속·값 정규화·필터·정렬·snapshot·한도는 [공통 처리 규칙](ARCHITECTURE_AND_QUERY_RULES.md), 정확한 필드는 [API 계약](../COMMON/API-SPEC/VIEW_MAIN_CONTENT_API.md)을 따른다. 이 문서는 타입별 처리 차이를 정의한다. 아래 필수 역할과 기본 동작은 P01~P10에서 확정할 **실행 계약 제안**이며 schema에 새로운 필수/XOR 제약을 추가하는 뜻이 아니다.

[현재 범위 결정](../COMMON/SCOPE_AND_DEFERRED_WORK.md)에 따라 구현 대상은 저장 설정을 읽는 GET뿐이다. List의 Entry 단위와 종료일 없는 항목의 A안 표시는 사용자 선택을 반영했다. 나머지 세부 의미는 확정 여부를 구분하며 필터·정렬 저장과 FE 연결은 후속이다.

## 1. 공통 입력과 조회 단위

모든 타입의 입력은 권한이 확인된 ViewDefinition, 선택한 소속, 저장 표시·그룹·필터·정렬 설정, 정규화된 값이다. 먼저 원본을 정하고 필터를 적용한 뒤 타입별 결과를 만든다. 페이지를 먼저 자르고 필터·집계를 적용하지 않는다.

| View 소속 | 원본 집합 | RECORD 속성 | LIST_ENTRY 속성 | 고유 항목 key |
| --- | --- | --- | --- | --- |
| OBJECT | 해당 Object의 Record | 해당 Record 및 허용 참조 경로 | 원본 Entry가 없어 실행 불가 | RECORD:id |
| LIST | 해당 List의 Entry | Entry가 연결한 Record 및 허용 참조 경로 | 해당 Entry의 값 및 허용 참조 경로 | LIST_ENTRY:id |
| 원본 없는 DASHBOARD | 위젯 구성 | 자식 View가 독립 해석 | 자식 View가 독립 해석 | widget id |

**List View에서 RECORD 속성을 읽는 것과 원본 단위를 Record로 바꾸는 것은 다르다.** 사용자가 Entry 기준을 선택했으므로 같은 Record가 두 Entry에 연결되어도 두 업무 항목이며 Record 측정값도 각 Entry에서 한 번 기여한다. 중복 Entry 허용 여부를 이번 조회 API에서 제한하지 않는다. 혼합 Object List·제목 선택·양쪽 소속은 P01 참조.

표시 역할은 ViewAttributeSettingDefinition, 그룹 역할은 ViewGroupDefinition, 그룹 순서·숨김·접힘은 ViewGroupSettingDefinition에서 읽는다. Attribute 자체의 sortOrder를 View의 열 순서로 쓰지 않는다. 실제 binding ID는 ViewAttributeSettingDefinition.id다.

## 2. TABLE

- **역할:** 선택된 표시 속성의 값을 행·열로 제공한다. TABLE이 나머지 타입의 원본 API 역할까지 맡는 구조가 아니다.
- **설정:** 표시 binding의 sortOrder, isHidden, labelOverride, width, formatJson; 일반 GROUP; 저장 필터·정렬; rowDensity.
- **응답:** `columnBindingIds`, `items`, `groups`, `pageInfo`, `presentation`.

처리 순서:

1. 소속에 맞는 Record 또는 Entry 집합과 필요한 값을 배치 조회한다.
2. 저장 필터와 검색어를 적용한다. 숨긴 열도 필터·정렬에서 사용되면 계산용으로 읽을 수 있다.
3. 일반 그룹이 있으면 전체 일치 항목으로 그룹 key·count를 계산한다. 행은 groupPath를 가진다.
4. 그룹 경로 → 저장 정렬 → 원본 ID 순으로 안정 정렬하고 cursor 페이지를 만든다. 그룹 없는 기본 순서는 공통 규칙을 따른다.
5. 보이는 열의 binding ID를 View 순서대로 반환하고 값 배열을 셀에 대응한다. hidden 속성값을 불필요하게 응답하지 않는다.

열이 없는 상태는 빈 열 안내다. 설정이 없다며 모든 Object 속성을 임의로 영구 등록하지 않는다. 그룹 접힘·숨김은 표시 상태이며 필터/원본 개수를 변경하지 않는다. 일반 그룹 메타데이터와 페이지는 분리되므로 FE는 숨긴 그룹·접힌 행을 렌더링에서 제외하고 필요한 다음 페이지를 읽는다. 무한 자동 조회로 빈 화면을 채우지 않는다.

**실제 목 데이터:** 전체 회사 View는 Record 5개, 열 8개, 회사명 ASC. Object 6개와 List 8개에 TABLE이 각각 존재하므로 전체 14개 View 모두 대상으로 계약을 검증해야 한다.

## 3. KANBAN

- **역할:** 단계/분류 기준별 카드와 개수를 제공한다.
- **설정:** GROUP 역할의 그룹 기준, 옵션·그룹 상태, TITLE/DISPLAY binding, 필터·정렬, cardDensity/showEmptyGroups.
- **응답:** `groupDefinitionId`, `columns[]`, `unassignedCount`, `presentation`. 각 열은 groupToken·전체 count·카드 첫 페이지·독립 pageInfo를 가진다.

처리 순서:

1. 단계 기준의 sourceScope·경로·속성 타입을 검사한다. 현재 목 데이터는 RECORD Status다. Status/Select 지원 범위와 다중값 분류는 P03에서 확정한다.
2. 필터·검색을 통과한 원본 항목을 그룹에 배정한다. 기준 값 없음은 별도의 안정 key를 가진 ‘미지정’ 그룹으로 다룬다.
3. 옵션 metadata와 ViewGroupSetting의 순서·라벨·숨김·접힘을 합친다. showEmptyGroups=true면 카드가 0인 저장 옵션도 포함한다.
4. 각 열 안에서 같은 저장 정렬을 적용한다. 열마다 limit을 적용하고 후속은 `part=GROUP_ITEMS&groupToken=...&cursor=...`로 읽는다.
5. 숨김/접힘 열은 metadata와 count를 유지하고 첫 카드 로딩을 생략할 수 있다. 펼칠 때 GROUP_ITEMS로 읽는다. 숨김은 권한 정책이 아니다.
6. 계산 설정이 명시된 경우에만 해당 열 전체 원본으로 calculations를 계산한다. DISPLAY Currency가 있다는 이유로 SUM을 생성하지 않는다.

그룹 기준이 없으면 NEEDS_CONFIGURATION. 여러 GROUP 기준의 칸반 의미는 P03에서 정하며 첫 설정 하나를 임의 선택하지 않는다. groupToken은 해당 View·그룹 설정 fingerprint에 묶이고 다른 Workspace/그룹에 재사용할 수 없다.

**실제 목 데이터:** 파이프라인 7 Entry 중 금액 조건에 4개, 10개 단계, 카드 금액 DESC, 빈 단계 표시. 카드 금액은 Record에서 읽는다. 현재 MEASURE/단계 합계 설정이 없으므로 `calculations=[]`다. UX 예시의 단계 금액 합계를 필수로 넣으려면 P10에서 별도 계산 계약을 확정한다.

후속 드래그 수정은 sourceScope에 따라 Record Status 또는 Entry Status를 수정해야 한다. 원본 UX 문구만 보고 모든 칸반을 ListEntry 수정으로 구현하지 않는다. 이번 GET에서는 어느 쪽도 수정하지 않는다.

## 4. LIST

- **역할:** 제목과 보조 속성 중심의 간결한 행 목록.
- **설정:** TITLE, DISPLAY, BODY; 선택적 GROUP; 필터·정렬; rowDensity.
- **응답:** `items`, `groups`, `pageInfo`, `presentation`.

1. 원본을 필터·검색한 뒤 일반 그룹과 정렬을 적용한다.
2. TITLE의 타입을 고려해 title을 만든다. PersonalName은 displayName을 사용한다. 여러 제목/없는 제목의 선택 정책은 P01을 따른다.
3. DISPLAY와 BODY를 각각 binding 역할로 유지한다. 본문 문자열을 표시 속성 값에 합쳐 저장하지 않는다.
4. Entry 업무 정보와 Record 공통 정보를 한 행에 묶되 CellValue.sourceEntity로 소유자를 구분한다.
5. 전체 그룹 개수와 원본 개수, 페이지를 반환한다.

**실제 목 데이터:** 15 Entry. PersonalName 제목·회사 연결은 RECORD, 역할·접촉 전략은 LIST_ENTRY. 그룹은 없으며 기본 안정 정렬이 필요하다. 회사 연결 라벨을 UUID 자체로 표시하는 것을 정상 제목 처리로 간주하지 않는다.

## 5. GALLERY

- **역할:** 제목·미리보기·보조 속성을 카드로 보여준다.
- **설정:** TITLE, BODY, IMAGE, DISPLAY; 필터·정렬; cardSize/imageFit.
- **응답:** `cards[{item,body,image}]`, `pageInfo`, `presentation`.

1. 필터·검색·정렬 후 원본 페이지를 계산한다.
2. TITLE/BODY를 안전한 텍스트로 만든다. IMAGE 역할 값은 미디어 허용 정책을 거친다.
3. 허용 이미지가 있으면 `{src,alt}`, 없거나 정책에 맞지 않으면 null을 반환한다. 이미지 없음은 전체 View 조회 실패 사유가 아니다.
4. FE는 image=null 또는 로드 실패일 때 텍스트 미리보기를 표시한다. 카드 크기 변경은 원본 Record 값을 바꾸지 않는다.

**실제 목 데이터:** 제품 Record 3개, 단가 DESC, MEDIUM/CONTAIN. IMAGE는 Text 속성의 `data:image/svg+xml,...`다. File/Attachment 모델이나 업로드 API가 존재한다고 가정하지 않는다. data SVG 허용·길이 제한·CSP는 P07에서 결정하고 innerHTML로 SVG 원문을 삽입하지 않는다. BE가 URL을 다운로드하거나 검증 목적으로 임의 외부 요청을 하지 않는다.

## 6. CALENDAR

- **역할:** 조회 기간과 겹치는 일정 제공.
- **설정:** START_DATE 필수 제안, END_DATE 선택; TITLE/DISPLAY; 필터, initialMode/weekStartsOn.
- **응답:** `range`, `events`, `unscheduledCount`, `invalidDateCount`, `pageInfo`, `presentation`.

1. 저장 날짜 binding의 scope·타입을 확인한다. Date와 Timestamp를 같은 문자열 규칙으로 비교하지 않는다.
2. 필터·검색을 적용한 전체에서 시작일 없음과 유효하지 않은 날짜를 분리한다.
3. 사용자 선택 A안에 따라 시작은 있지만 끝이 없으면 DATE 하루 일정으로 표시한다. TIMESTAMP는 시점 일정으로 대응한다는 제안이며 시간대 세부 계약을 함께 검증한다. 저장 끝 값을 생성하지 않고 응답 end=null로 둔다.
4. 조회창과 겹치는 구간을 선택한다. 시작이 조회창 이전인 장기 일정도 포함한다. DATE 종료 포함과 TIMESTAMP 종료 제외는 P04 제안이다.
5. 서버가 선택한 안정 일정 순서로 page를 만든다. 헤더에 정렬 버튼이 없어도 응답의 결정적 순서는 필요하다. 현재 저장 start ASC를 읽는 것과 버튼 노출은 별개다.
6. 날짜 없는 항목은 UNSCHEDULED_ITEMS, 뒤집힌/잘못된 날짜는 INVALID_DATE_ITEMS로 같은 API에서 읽는다.

날짜 binding 자체가 없으면 NEEDS_CONFIGURATION, 일부 Record의 날짜가 없으면 정상 화면과 미설정 목록이다. 혼합 DATE/TIMESTAMP 역할을 자동 변환하는 정책은 확정 전까지 지원으로 표시하지 않는다. 날짜 변경 드래그는 후속 mutation.

**실제 목 데이터:** Entry 20개가 연결한 Record 날짜. `[2026-11-01,2026-12-01)`과 겹치는 일정 9개, 미설정 0개. 현재 데이터에는 Timestamp/DST 경계가 없으므로 별도 검증이 필요하다.

## 7. TIMELINE

- **역할:** 원본 항목별 기간 막대와 선택적 그룹 제공.
- **설정:** START_DATE/END_DATE, TITLE/DISPLAY, GROUP; 필터·정렬; timeScale.
- **응답:** `range`, `bars`, `groups`, `unscheduledCount`, `invalidDateCount`, `pageInfo`, `presentation`.

1. 시작·끝 binding과 해당 값 소유자를 해석한다. List 기간이 Record 기간과 같다고 가정하지 않는다.
2. 필터·검색을 적용한다. 사용자 선택 A안에 따라 시작 또는 끝 값이 없으면 unscheduled로 분리한다. Calendar의 하루 일정 표시와 혼용하지 않는다.
3. 기간 역전은 invalidDate로 분리하고 유효 구간의 겹침을 계산한다.
4. 전체 그룹·정렬 후 행 단위 page와 막대 원본 기간을 반환한다. 화면에 잘리는 막대도 응답 날짜 자체를 조회창 경계로 잘라 변경하지 않는다.
5. 화면 확대·축소는 timeScale을 표현하고 이동한 창은 같은 API에 range를 다시 전달한다.

**실제 목 데이터:** PoC List 3 Entry 중 시작일 조건에 2개. 기간은 LIST_ENTRY 값이며 두 항목 모두 11-09~11-27. 제목은 연결 Record다. 해당 기간 조회의 기대 eligible 수는 2다.

## 8. GANTT

- **역할:** 기간 막대·진행률·업무 의존관계의 읽기 표현.
- **설정:** START_DATE/END_DATE, TITLE/DISPLAY, 선택 PROGRESS; GROUP; showDependencies/timeScale; ViewWorkDependencyDefinition.
- **응답:** `tasks`, `dependencies`, `groups`, 기간·누락 건수·페이지·presentation.

1. Timeline과 같은 원본·필터·구간·정렬 처리로 task 페이지를 만든다.
2. PROGRESS가 있으면 Number와 format.valueScale을 Decimal로 읽는다. rawValue/valueScale/ratio를 반환한다. 50/100은 ratio="0.5"다. scale≤0, 범위 밖 등은 issue와 progress=null로 안내하고 임의로 0~100에 clamp하지 않는다(P04).
3. showDependencies=true면 Workspace의 의존관계 중 **양쪽이 이 View의 권한·필터 범위에 포함되는 관계**를 읽는다. ViewWorkDependencyDefinition에는 viewDefinitionId가 없으므로 Workspace 전체 관계를 그대로 반환하지 않는다.
4. source/target의 RECORD·LIST_ENTRY endpoint를 각각 해석한다. 양쪽 FK 존재/없음의 잘못된 endpoint를 임의 우선 처리하지 않는다. 이 처리 규칙은 실행 검증이며 DB XOR 제약 추가가 아니다.
5. Record endpoint는 이 View의 대응 Entry 목록으로 매핑한다. 현재 page와 닿는 관계만 반환하고 endpoint.itemKeys는 현재 page의 대응 key들이다. 상대 행이 아직 page 밖이면 빈 배열, renderable=false다. 원본 ID는 동일 필터·권한을 통과한 경우에만 제공한다.
6. 같은 Record에 Entry가 여러 개 대응하면 임의 연결선을 선택하지 않는다. 후보 itemKeys를 유지하고 renderable=false와 안전한 issue로 안내한다. 모호성 판정은 현재 page가 아니라 전체 필터 대상 매핑 기준이다.
7. FS/SS/FF/SF 및 offset의 원래 값·단위를 반환한다. 순환 의존관계는 표시 오류로 알리고 날짜를 재계산하거나 연쇄 이동하지 않는다. 음수 offset 허용 여부는 현재 모델 의미를 검토해 P04에서 확정한다.

**실제 목 데이터:** 20 Entry, Record 간 FS·offset 0 DAY 관계 10개, 현재 Record↔Entry 대응은 각각 하나다. 11월 화면은 task 9개지만 연결선은 그 기간·페이지에 대응하는 것만 보여야 하므로 10개 전부를 11월 선 개수로 단정하지 않는다. 진행률 scale=100.

## 9. CHART

- **역할:** 조건에 맞는 전체 원본의 집계 결과를 시각화한다. 원본 목록 드릴다운 API가 필수 전제는 아니다.
- **설정:** config.chartType/aggregation; MEASURE; 선택 GROUP/SERIES 기준; 그룹 상태; 필터.
- **응답:** `metric`, `categories`, `series`, `points`, `total`, `presentation`.

1. metric/차트 종류/그룹 역할 조합을 검증한다. COUNT_ITEMS는 측정 속성 없이 가능하다는 제안이고 SUM/AVG/MIN/MAX는 지원 수치 binding이 필요하다. 현재 계약은 metric 하나와 선택 series다. 복수 MEASURE를 조용히 첫 하나로 축소하지 않고 P03에서 계약 확장 여부를 결정한다.
2. 원본 전체에 저장 필터를 적용한다. List는 Entry를 원본 단위로 유지한다.
3. 기준 값의 안정 key를 만든다. label은 표시용, key는 옵션/연결 Record ID 또는 정규화된 값이다. GROUP/SERIES의 다중값 기여는 P03을 따른다.
4. 각 원본의 측정 기여를 category×series별로 누적한다. 값 테이블 JOIN 증식이 금액을 여러 번 더하지 않도록 provenance 기반으로 기여를 구분한다.
5. SUM/AVG를 Decimal로 계산하고 Decimal string+통화 코드로 반환한다. 빈 측정값·원본 0건·숫자0을 구분한다. 모든 그룹의 표시값을 단순 합해 total을 만들지 않는다.
6. BAR/LINE/PIE는 그룹 결과, NUMBER는 그룹 없는 aggregate를 표현한다. 숨김 그룹과 빈 옵션의 노출은 표시 정책이며 total 의미를 변경하지 않는다. 차트 표기상 지원 불가 값(예: 음수 PIE)의 처리도 P03에서 확정한다.

limit으로 원본 일부를 집계하지 않는다. 계산 한도를 넘으면 명시 오류다. 기본계약에 임의 기간을 붙이지 않는다. 기간 집계가 필요하면 저장 필터/별도 계약을 설계한다.

**실제 목 데이터:** 파이프라인 List 7 Entry → Record 금액 조건으로 4 Entry → SUM 950000 USD. GROUP은 Record Status, series 없음, BAR. 4단계 기여는 250000/220000/180000/300000이다. 총합을 원화로 표시하지 않는다.

## 10. PIVOT

- **역할:** 행 기준×열 기준의 전체 원본 집계와 합계를 제공한다.
- **설정:** PIVOT_ROW/PIVOT_COLUMN 그룹, MEASURE, aggregation, showRowTotals/showColumnTotals, 필터.
- **응답:** `metric`, `rowDimensions`, `columnDimensions`, `cells`, `rowTotals`, `columnTotals`, `grandTotal`, `presentation`.

1. 행·열 기준과 metric의 scope·참조 경로·값 타입을 검사한다. 기준 부족은 NEEDS_CONFIGURATION. 여러 행/열 기준은 sortOrder의 경로 key로 표현하는 제안이며 계층 UX는 P03에서 확정한다.
2. 필터 후 전체 원본의 행 key/열 key/측정값을 구한다. RecordReference 기준이면 회사 ID로 묶고 회사명은 별도로 조회한다. 표시 이름이 같은 회사 두 곳을 합치지 않는다.
3. 교차 셀별 accumulator를 만들고 row/column/grand accumulator도 원본 기여에서 각각 계산한다. AVG 셀들의 평균을 전체 평균으로 삼지 않는다.
4. 결과는 sparse cell 목록이다. 존재하지 않는 조합은 셀 없음, 원본은 있지만 유효 측정값이 없으면 value=null, 실제 합계 0은 "0"이다. FE가 세 경우를 모두 0으로 바꾸지 않는다.
5. 합계 표시가 꺼진 축은 해당 totals=[], grandTotal은 계산 의미 확인용으로 유지한다. 다중 그룹 기여가 있으면 셀 합과 전체 원본 합이 다를 수 있어 P03의 설명을 함께 적용한다.
6. 차원/셀 한도를 계산 전에 점검한다. 임의 첫 행/열 잘림이나 일반 Record cursor로 피벗 전체인 것처럼 반환하지 않는다. 한도 초과는 422.

**실제 목 데이터:** CHART와 같은 파이프라인 **List Entry** 집합, 행은 Record 회사 연결, 열은 Record Status, 측정은 Record Currency다. 4 Entry/950000 USD, 현재 각 Entry가 서로 다른 회사·단계에 속한다. 원본을 Object 전체 9 Record로 잘못 조회하지 않는다.

## 11. MAP

- **역할:** 위치가 있는 항목의 핀과 연결 목록을 함께 제공한다.
- **설정:** LOCATION, TITLE/DISPLAY, 필터·목록 정렬; fitToData/showLabels.
- **응답:** `bounds`, `markers`, `list`, `unlocatedCount`, `presentation`. 두 pageInfo는 독립이다.

1. 필터·검색 후 Location을 해석한다. 유한 숫자이며 위도 ±90/경도 ±180인 좌표만 사용한다. text 주소만 있으면 unlocated로 분류한다. 0,0도 실제 값이면 유효하다.
2. 필터 전체 유효 좌표로 bounds를 계산한다. 날짜변경선을 건너는 집합을 항상 넓이 358도 지도로 만들지 않도록 횡단 경계 표현을 지원한다.
3. 요청 bounds가 있으면 현재 영역의 좌표를 선택한다. MAIN의 marker/list는 같은 영역 대상이며 목록 정렬은 list에 적용한다. 지도 클러스터링은 API 목록 정렬과 별개다.
4. marker와 list를 각각 페이지로 만든다. MAP_MARKERS/MAP_ITEMS는 해당 cursor만 이어 읽는다. 한 항목에 다중 좌표가 있으면 marker key가 값 ID를 포함하고 정책 P07에 따른다.
5. 좌표 없는 항목은 UNLOCATED_ITEMS에 남긴다. bounds 조건을 적용하지 않는다. MAP 목록과 미위치 목록을 합쳐 ‘전부 표시’했다고 잘못 안내하지 않는다.
6. 핀/목록 선택은 itemKey로 동기화한다. 반대쪽 page에 항목이 없으면 focusItemKey로 찾되 필터·권한을 다시 검사한다. 선택 조회는 bounds 밖도 찾을 수 있다는 제안이며 실제 카메라 이동은 사용자 선택 후 FE가 수행한다.

**실제 목 데이터:** 타깃 계정 5 Entry, Record 좌표 5개, 미위치 0. 현재 데이터의 범위는 south=37.55/north=37.59/west=126.95/east=126.99. 날짜변경선·다중 좌표·미위치 검증 데이터는 없다.

Attio Insight의 국가별 집계 Map과 이 핀 지도는 같은 기능으로 단정하지 않는다. 지도 Provider·비용·약관·지오코딩은 P07 후속이며 조회 transaction에 외부 호출을 넣지 않는다.

## 12. DASHBOARD

- **역할:** 표시 위젯과 원본 View를 조합할 배치 정보를 제공한다.
- **설정:** ViewWidgetDefinition의 sortOrder/isHidden/titleOverride/layoutJson/configJson, ViewDefinition.configJson.gridColumns.
- **응답:** `widgets`, `visibleWidgetCount`, `presentation`. 원본 집계값을 이 응답에 전부 중첩하지 않는다.

1. Dashboard 접근을 확인하고 표시 위젯을 순서대로 읽는다. 숨김 위젯은 본문 응답/내용 조회에서 제외한다.
2. 각 content View의 Workspace·소속·현재 접근 가능 여부를 검사한다. 원본 하나 실패가 정상 위젯 전체를 실패시키지 않게 UNAVAILABLE로 분리한다. 불가 원본의 ID/이름은 content에 넣지 않는다.
3. titleOverride가 있으면 위젯 제목으로, 없고 접근 가능한 원본이면 View 이름을 사용한다. showTitle은 별도 표시 속성이다. 불가 원본은 안전한 공통 제목을 사용한다.
4. layout의 x/y/width/height와 gridColumns를 검증한다. 잘못된 배치는 NEEDS_CONFIGURATION 위젯으로 표시하고 원본 JSON을 반환하지 않는다. 충돌 배치·반응형 재배치 기본값은 P08에서 확정한다.
5. FE는 READY widget의 content View마다 같은 `/data` API를 호출한다. 각 원본의 source와 필터·권한·오류를 독립 적용한다. content.sourceType은 child의 단일 소속에서 유도한다. 양쪽 소속이면 widget config에 명시할 선택 계약을 P01에서 확정하고, 선택이 없으면 NEEDS_CONFIGURATION으로 둔다. 원본 없는 child Dashboard는 null이다. Dashboard List의 소속/필터를 모든 child에 주입하지 않는다.
6. 동일 View를 가리키는 두 위젯은 ID가 다른 두 위젯이다. 같은 query 캐시는 공유할 수 있으나 배치를 합치지 않는다. 자기/경로 순환은 CYCLE, 허용 깊이를 넘으면 안전한 상태로 중단한다(P08).

**실제 목 데이터:** 12열, CHART/PIVOT/KANBAN 위젯 3개. 세 원본은 모두 파이프라인 List지만 이것을 Dashboard가 같은 List의 View만 참조할 수 있다는 제한으로 확정하지 않는다.

초기 호출 수는 Dashboard 구성 1회+고유 READY 원본 View별 조회다(현재 예시 3개). 하나의 endpoint라는 표현을 HTTP 요청도 반드시 한 번이라는 의미로 사용하지 않는다. 위젯 생성·후보 조회·구성 저장은 후속 범위다.

## 13. 타입별 검토 완료 기준

각 타입은 정상 목 데이터 외에 빈 원본, 필터 결과 0, 설정 누락, 일부 값 누락, 참조 손상, 페이지 경계, 접근 불가, 초과 한도를 검증해야 한다. 타입별 조건과 [검토표](../COMMON/PLANNING-REVIEW.md)의 경계 사례가 통과해야 구현 완료다. 현재 문서는 실제 데이터 기대값과 제안 응답을 제공하며 아직 실행되지 않은 API의 결과를 보장하지 않는다.
