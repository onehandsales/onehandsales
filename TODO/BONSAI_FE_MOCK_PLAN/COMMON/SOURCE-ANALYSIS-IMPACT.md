# 원본 분석 R4의 계획 반영과 보완 대응표

> 현재 G02 — 2026-11-23 KST: [주요 구성 대조·메뉴/후기 보완·DOM 검증](../RESULTS/G02_RECHECK_RESULT.md#g02-r4-recheck). 엄격한 시각 동일성·실제 브라우저 상세/네트워크·원본 미수록은 대기다. G00/G01 이력과 나머지 Goal 상태를 유지한다.

갱신: 2026-11-23 KST. 원본 분석 기준 커밋: `6fdc6d00`. **G00 R4 근거·색인·배정 재검토 완료; 촬영 조건·요소 분석·시각 동일성 후속 대기.** [G00 현재 결과](../RESULTS/G00_RESULT.md#g00-recheck). 455개 메모의 원문/담당은 보존한다. G02 네 항목의 현재 판정은 아래 재검토에 갱신했고, 최초 판정은 PLAN-INDEX의 plan_snapshot에 남겼다. G01 선택 공통 대조·동작 보완·검증은 과거 수행 이력이며 엄격한 시각 동일성·환경 대기를 유지한다. [G01 결과](../RESULTS/G01_RECHECK_RESULT.md).

## 1. 목적과 현재 작업

G01~G31의 기존 구현·검증 이력을 보존하면서 R4 분석에서 확인한 내용과 현재 계획/구현의 차이를 추적한다. G01의 과거 FE 전면 교체를 다시 실행하거나 G01~G31을 모두 미착수로 되돌리지 않는다. G32 이후 구현과 실제 API·BE·DB 작업은 이번 문서 반영에 포함하지 않는다.

정본은 [원본 분석 기준](../../../bonsai_analysis/SOURCE_ANALYSIS_STANDARD.md), [R4 검토 결과](../../../bonsai_analysis/SOURCE_ANALYSIS_REVIEW.md), 각 ANALYSIS와 원본 PNG다. 455개 메모의 원문·소유는 **R4 계획 반영 시점 고정본**이다. 후속 개별 판정은 실제 소비 범위에서만 갱신하며 최초 판정은 별도 보존한다. 이번 G01의 새 MCP·선택 PNG·코드/브라우저 검토는 공통 표의 별도 열과 결과 문서에 구분하며 전체 메모의 분석 완결로 승격하지 않는다.

134개 플로우·754단계·642개 고유 화면, 관찰 318개와 남은 분석 137개를 각각 항목으로 연결했다. 총 455개는 검토 메모 수이며 새 결함 수·전체 요소 수·완성률이 아니다. 12개 공통 기준은 별도로 관리한다. 문서에 자동 반복된 공통 미완 안내는 아래 공통 기준을 함께 참조한다.

G00 현재 재검토는 위 전체 수량·파일/SHA-256·원문 메모/해시·담당 G/R·선행 관계·공유 화면 57개(148회 등장, 72개 Goal)를 자동 대조했다. 원본 직접 확인은 4개 흐름의 PNG 6개이며 전체 이미지/요소 검토가 아니다. 455개 메모의 구현 판정과 R 전체 완료 상태는 변경하지 않는다. 현재 모든 소비 범위에는 [원본 동일 재현 기준](UXUI-REPLICATION.md#current-identity)을 적용한다. 과거의 작은 시각 차이 허용은 현재 완료 기준이 아니다. 실행 기록은 기존 G00_RESULT에만 남기고 별도 증거 파일은 생성하지 않는다.

<a id="workflow"></a>
## 2. 사용자가 이어서 진행할 순서

| 순서 | 작업과 산출물 | 종료 조건 | 현재 |
| --- | --- | --- | --- |
| 1 | [134개 흐름 검토](FLOW-BEHAVIOR-REVIEW.md)와 해당 ANALYSIS에서 행동·입력·상태·저장·전환을 확인 | 진입·중간/오류·종료와 미관찰 경계를 연결. 이번 G01은 작은 시각 차이도 동일성 대기 | 문서 전수 대조·기준 보완; 실행 대기 |
| 2 | 기능을 수행하는 제어·입력·필수/오류 표시와 상태·전환을 원본 단계/담당 G에 연결 | 흐름 누락·잘못된 분기·저장 시점·객체 영향 확인; 미수록 동작은 질문/목 가정으로 표시 | 흐름 대응 등록; 현재 구현 대조 대기 |
| 3 | 이 대응표와 해당 G/R의 명세·수용 기준을 다시 대조 | 담당 누락·상충·근거 없는 동작을 처리하고 명세에 반영 | 기존 R4 메모·흐름 수용 기준 연결; 실제 실행 대기 |
| 4 | G01~G31의 현재 구현을 원본·보완 명세와 비교 | 유지/문서 보완/구현 보완/분석 대기를 항목별 근거와 함께 판정 | G01 선택 공통·G02 주요 구성 대조 수행; 정밀 요소/나머지 Goal 대기 |
| 5 | 필요한 보완을 공통 요소→영향받는 기능 순서로 묶고 사용자 요청 범위에서 실행 | 해당 원본 비교·관련 회귀·결과 기록. 이미 충족한 기능은 재구현하지 않음 | G01 기존 회귀·G02 보완/DOM 회귀 수행; G02 실제 브라우저와 시각 동일성 대기 |
| 6 | 사용자 요청과 선행 기준을 충족한 뒤 기존 G/R 순서로 신규 기능 진행 | 기능 흐름 명세·필요한 R 결과 확인; 이번 G01 시각 차이는 대기 유지 | G32 이후 미착수 |

현재 기준은 [흐름 우선 정책](FLOW-BEHAVIOR-REVIEW.md#policy)이다. 1~3번의 문서 대조 결과를 바탕으로, 구현을 요청받으면 4번의 현재 구현 영향 검토부터 필요한 범위만 진행한다. 기존 G 체크나 G31 결과를 새 검증으로 재사용하지 않는다. 공통 문제를 G83/G84까지 미루지 않으며, 기존 기능도 보완 항목의 영향을 검토한다. 원본 밖 서버 정책은 후속 메모로 분리하고 확인할 수 없는 UI를 임의로 만들어 분석 완료로 표시하지 않는다.

## 3. 항목 사용법과 판정

- 관찰 항목 `R4-Fnnn-Onn`은 새 결함 판정이 아니다. 기존 명세/구현과 대조 후 `비교 완료·유지`, `문서 보완 필요`, `구현 보완 필요`, `분석 대기` 중 근거에 맞게 기록한다. G02의 개별 주요 구성 판정은 아래 현재 결과를 따르며, 나머지 메모의 기존 판정과 전체 요소 미완은 유지한다. G01의 선택 공통 결과를 이 455개 전체 완료로 올리지 않는다.
- 남은 분석 `R4-Fnnn-Ann`은 원본 질문과 필요한 명세를 보존한다. 여러 질문이 한 메모에 있으면 작업 시 하위 항목을 나누되 원래 ID와 원문을 유지하고 모두 처리하기 전 부모를 닫지 않는다.
- 상태를 바꿀 때 담당 Goal, 분석의 요소 ID, 실제 코드/화면 위치, 비교 조건, 수행 검증과 결과 문서를 함께 남긴다. 구현 수정은 필요한 항목에만 하며 `수정·검증 완료`는 실제 결과 뒤에만 사용한다.
- `PLAN-INDEX.json.source_analysis_review`의 항목 ID·원문 해시·상태와 이 문서를 함께 갱신한다. 원본 메모가 바뀌면 조용히 덮어쓰지 말고 기준 커밋과 수정 이유를 기록한다. 역사적 테스트 통과를 이번 실행 결과로 재사용하지 않는다.
- F번호는 원본 검토 색인 번호다. 계획 표의 로컬 번호와 혼동하지 않고 **Flow ID**로 연결한다. 단계 소유는 기존 표를 유지한다. 계약 생성의 복합 메모는 G40/G41에 함께 연결하되 각 단계 담당은 유지한다.

<a id="completion"></a>
### 완료 판정과 기록 위치

455개 메모 연결, 흐름 대응, 엄격한 원본 요소별 분석·정밀 재현 인증, 구현 검증을 각각 기록한다. 이번 G01 사용자 기준에서는 작은 폰트·크기·픽셀·장식 차이도 허용하지 않는다. 흐름 작업의 차단 조건은 행동·입력·상태·저장·전환에 영향을 주는 미해결이며, 폰트 파일·정확한 치수 미확인만으로 전체 기능을 보류하지 않는다. 동작 보완과 시각 동일성을 분리하되 시각 미완이 남으면 이번 G01 전체 완료로 판정하지 않는다. 원본 미수록 동작·실제 캡처 환경은 미확인으로 표시하고, 별도 목 가정을 채택해도 원본에서 확인한 사실로 승격하지 않는다.

R4 원본 색인의 134개 플로우 모두 `element_census_complete=false`, `reproduction_spec_certified=false`다. PLAN-INDEX 각 플로우의 `source_analysis_review.source_element_census_complete`와 `source_reproduction_spec_certified`는 이 기준 시점의 값을 보존한다. 후속 작업 결과로 바꿀 때에는 먼저 실제 분석 근거와 기준 버전을 갱신해야 한다. 문서 연결이나 테스트 통과만으로 이 값을 바꾸지 않는다.

<a id="element-trace"></a>
### 기능별 요소 대응표에 반드시 남길 필드

실제 산출물의 파일·절 위치를 담당 G와 대응표에 연결한다. 기존 ANALYSIS에 작성하거나 연결된 공통 명세를 참조할 수 있다. 아래는 작성 형식이며 요소 분석을 수행한 결과가 아니다.

| 필드 | 기록할 내용 |
| --- | --- |
| 원본 식별 | Flow ID·단계·Screen ID·원본 PNG 경로/URL·해상도·카탈로그 버전·해시·촬영 조건의 확인 수준 |
| 영역·요소 | 배경을 포함한 영역/요소 ID·역할·문구/값·표시 상태·스타일·자산·원본 위치 |
| 근거 수준 | 관찰/측정/추정/미확인, 측정 좌표계·비교 축척과 근거 위치 |
| 분석 위치 | ANALYSIS 또는 공통 명세의 실제 파일·절·요소 ID, 해당 화면의 변형 |
| 담당·수용 기준 | 담당 G·관련 R·455개 메모/공통 기준 ID·해당 요소의 확인 가능한 수용 기준. 메모 하나가 여러 요소를 포함하면 요소 행을 나눔 |
| 전환·저장 | 이전/다음 단계·관찰된 조작·불연속 변화·저장/취소/실패 범위. 미수록 동작은 별도 질문/목 가정 |
| 영향 범위 | 같은 Screen ID의 다른 G·공통 컴포넌트 소비 화면·서로 다른 화면 변형·필요한 회귀 |
| 판정·남은 작업 | 유지/문서 보완/구현 보완/분석 대기, 해결 근거 또는 남은 질문과 담당. 해당 없음은 이유 기록 |
| 실제 검증 | 비교 입력·상태·스크롤·원본 표시 크기·구현 viewport/배율·환경·수행 결과/증거. 실행 전에는 미실행 |

영역별 원본 요소 수와 분석 대응 수를 기록하고 미대응 요소를 별도로 남긴다. 455개 메모 수를 요소 수의 분모로 쓰지 않는다. 구현 위치와 검증은 실제 구현 비교 시 채우며, 분석 단계에서 채울 수 없는 칸은 완료로 표시하지 않는다.

<a id="common"></a>
## 4. R4 공통 명세 기준과 현재 적용 범위

G00은 근거·색인을, G01은 공통 UI 명세와 적용 범위를, 각 기능 G는 화면별 변형을 담당한다. G83/G84는 최종 연결·누락 검사를 담당한다. 공통화가 같은 모양/동작을 강제하는 뜻은 아니다. 예를 들어 원본 달력의 월요일/일요일 시작 변형을 유지한다. 아래 내용은 R4 정밀 분석의 기준이며 이미 측정한 디자인 값이 아니다. 현재 선행 조건에는 행동·제어·필수/오류 표시·상태·전환·저장·객체 연결을 적용하고, 이번 G01의 폰트·치수·장식·자산 차이는 미완으로 기록한다. 모든 시각 요소의 전수 계수를 흐름 구현의 일괄 선행 조건으로 요구하지 않는다.

| ID | 기준 | 확인할 산출물 | 전체 상태 | G01 선택 재검토 |
| --- | --- | --- | --- | --- |
| <a id="r4-c01"></a>R4-C01 | 원본 식별 | Flow ID·Screen ID·단계·원본 파일/URL·이미지 크기·채택 버전·해시와 확인하지 못한 촬영 조건을 연결한다. | G00 저장된 전체 식별·무결성 대조 완료; 촬영 조건·필요한 버전 재조회는 G01·소비 G/R 대기 | 선택 원본 식별 완료; 촬영 환경 대기 |
| <a id="r4-c02"></a>R4-C02 | 전체 구성 | 공개·인증·내부 앱·외부 화면의 셸, 배경·본문·메뉴·모달·토스트의 포함과 겹침을 명세한다. | 분석 대기 | 선택 구성 대조; 전체 명세 대기 |
| <a id="r4-c03"></a>R4-C03 | 요소 목록 | 배경과 작은 제어까지 요소 ID를 부여하고 원본 요소 수와 분석 대응 수를 대조한다. | 분석 대기 | 선택 요소군 대응; 전수 계수 대기 |
| <a id="r4-c04"></a>R4-C04 | 정확한 표시 | 원문·대소문자·단위·placeholder/입력값·필수 표시·줄바꿈·잘림을 구분한다. | 분석 대기 | 문구/필수/상태 대조; 세부 시각 대기 |
| <a id="r4-c05"></a>R4-C05 | 배치 | 원본 좌표·확대 조건과 폭·높이·간격·정렬·스크롤·화면 밖 영역·고정 여부의 한계를 기록하고 실제 CSS viewport/DPR와 비교용 값을 구분한다. | 분석 대기 | 선택 치수 측정/비교; 동일성 대기 |
| <a id="r4-c06"></a>R4-C06 | 글자 | 폰트 파일/이름 확보 여부와 글자 크기·굵기·행간·자간·정렬·줄 수·문자 모양의 근거를 기록한다. | 분석 대기 | 정확한 내부 폰트 분석 대기 |
| <a id="r4-c07"></a>R4-C07 | 색·장식 | 표본 위치·상태별 색·테두리·radius·shadow·opacity의 관찰/측정/추정을 구분한다. | 분석 대기 | 표본 색/픽셀 비교; 동일성 대기 |
| <a id="r4-c08"></a>R4-C08 | 자산 | 로고·사진·아이콘·삽화·배경의 출처·비율·crop·누락/대체 자산을 추적한다. | 분석 대기 | 정확한 아이콘/자산 분석 대기 |
| <a id="r4-c09"></a>R4-C09 | 상태 | 기본·선택·입력·열림·로딩·오류·빈 결과·성공과 미수록 hover/focus/disabled를 분리한다. | 분석 대기 | 선택 목 상태 검증; 원본 미수록 대기 |
| <a id="r4-c10"></a>R4-C10 | 전환 | 조작·중간 상태·다음 화면·스크롤·불연속 snapshot과 기록 종료를 구분한다. | 분석 대기 | 실제 navigation/모달 검증; 원본 미관찰 대기 |
| <a id="r4-c11"></a>R4-C11 | 입력·저장 | 하위 Save·전체 Save·자동 반영, 취소·실패·재진입을 관찰 사실 또는 명시적 목 가정으로 기록한다. | 분석 대기 | 초안/저장/취소 결함 보완·검증; 실정책 미확인 |
| <a id="r4-c12"></a>R4-C12 | 다른 화면 연결 | 동일 ID·공유 화면·동명 객체·각 플로우 문맥과 관련 화면 수용 기준을 연결한다. | 분석 대기 | 소비 화면 회귀; 다른 Goal 전체 검토 대기 |

<a id="goal-index"></a>
## 5. Goal별 반영 위치

아래 건수는 해당 Goal이 검토할 메모 수다. 여러 Goal이 한 메모를 소비할 수 있으므로 합계는 고유 455개와 다를 수 있다. 모든 G는 공통 기준을 함께 적용한다. G01 선택 공통 대조·소비 회귀를 수행했고, 다른 Goal 전체의 R4 요소 대조는 이번 작업으로 완료하지 않았다.

| Goal | 직접 연결 메모 | 현재 후속 상태 | 공유 화면 영향 |
| --- | ---: | --- | ---: |
| <a id="goal-g00"></a>[G00](<GOAL-SPECS/G00.md>) 근거·버전·범위 대응표 | 0 | [R4 근거·색인·배정 재검토 완료; 촬영 조건·요소/시각 후속 대기](../RESULTS/G00_RESULT.md#g00-recheck) | 0개(소유 없음; 공통 조사에서 57개 영향 연결 검증) |
| <a id="goal-g01"></a>[G01](<GOAL-SPECS/G01.md>) 독립 mock·공통 컴포넌트 | 0 | [G01 공통 대조·동작 보완 검증; 시각 동일성 대기](../RESULTS/G01_RECHECK_RESULT.md) | 0개 |
| <a id="goal-g02"></a>[G02](<GOAL-SPECS/G02.md>) 랜딩·공통 메뉴 | 4 | [주요 구성 대조·보완/DOM 검증; 시각·실브라우저 대기](../RESULTS/G02_RECHECK_RESULT.md#g02-r4-recheck) | 0개(소유); 추가 공유 참조는 기존 소유 유지 |
| <a id="goal-g03"></a>[G03](<GOAL-SPECS/G03.md>) 고객군·업종·CRM 소개 | 11 | 주요 구성 대조·보완/DOM 검증 수행; 시각·실브라우저·미수록 대기 | 0개 |
| <a id="goal-g04"></a>[G04](<GOAL-SPECS/G04.md>) 가격·후기 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g05"></a>[G05](<GOAL-SPECS/G05.md>) 블로그·검색·상세 | 9 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g06"></a>[G06](<GOAL-SPECS/G06.md>) 공개 템플릿·상세·파일 형식 | 10 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g07"></a>[G07](<GOAL-SPECS/G07.md>) 공개 청구서 생성기 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g08"></a>[G08](<GOAL-SPECS/G08.md>) 도움말·기사·문의 | 10 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g09"></a>[G09](<GOAL-SPECS/G09.md>) 제휴·채용·정책 안내 | 12 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g10"></a>[G10](<GOAL-SPECS/G10.md>) 회원가입 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [2개](#shared-screens) |
| <a id="goal-g11"></a>[G11](<GOAL-SPECS/G11.md>) 로그인·로그아웃 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g12"></a>[G12](<GOAL-SPECS/G12.md>) 비밀번호 재설정 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g13"></a>[G13](<GOAL-SPECS/G13.md>) 사업 설정 온보딩 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [2개](#shared-screens) |
| <a id="goal-g14"></a>[G14](<GOAL-SPECS/G14.md>) 앱 셸·사이드바·404 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g15"></a>[G15](<GOAL-SPECS/G15.md>) 회사 정보·로고·공개 프로필 | 10 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g16"></a>[G16](<GOAL-SPECS/G16.md>) 문서 브랜드 기본값 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g17"></a>[G17](<GOAL-SPECS/G17.md>) 멤버 초대·대기 초대 제거 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [2개](#shared-screens) |
| <a id="goal-g18"></a>[G18](<GOAL-SPECS/G18.md>) 초대 수락·협업자 접근 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | 0개 |
| <a id="goal-g19"></a>[G19](<GOAL-SPECS/G19.md>) 목록·신규 고객·상세 | 10 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [6개](#shared-screens) |
| <a id="goal-g20"></a>[G20](<GOAL-SPECS/G20.md>) 고객 필드·이미지 | 5 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g21"></a>[G21](<GOAL-SPECS/G21.md>) 두 진입점의 프로젝트 생성 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [4개](#shared-screens) |
| <a id="goal-g22"></a>[G22](<GOAL-SPECS/G22.md>) 보드·표 전환 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g23"></a>[G23](<GOAL-SPECS/G23.md>) 단계 이동·태그 | 9 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g24"></a>[G24](<GOAL-SPECS/G24.md>) 프로젝트 상세·이름·설정 | 10 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [3개](#shared-screens) |
| <a id="goal-g25"></a>[G25](<GOAL-SPECS/G25.md>) 전체·프로젝트 작업 보드와 생성 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [5개](#shared-screens) |
| <a id="goal-g26"></a>[G26](<GOAL-SPECS/G26.md>) 하위 작업·담당자 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [2개](#shared-screens) |
| <a id="goal-g27"></a>[G27](<GOAL-SPECS/G27.md>) 댓글·활동 | 3 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g28"></a>[G28](<GOAL-SPECS/G28.md>) 상태 정의·완료 표시 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g29"></a>[G29](<GOAL-SPECS/G29.md>) 보관·삭제 | 6 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [2개](#shared-screens) |
| <a id="goal-g30"></a>[G30](<GOAL-SPECS/G30.md>) 작업 템플릿 작성 | 7 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g31"></a>[G31](<GOAL-SPECS/G31.md>) 작업 템플릿 적용 | 4 | 기존 목 구현 이력 유지 / R4 구현 대조 미실행 | [1개](#shared-screens) |
| <a id="goal-g32"></a>[G32](<GOAL-SPECS/G32.md>) 전역·작업 타이머 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g33"></a>[G33](<GOAL-SPECS/G33.md>) 수동 시간 입력 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g34"></a>[G34](<GOAL-SPECS/G34.md>) 시간 목록·인사이트 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g35"></a>[G35](<GOAL-SPECS/G35.md>) 서비스 라이브러리·템플릿 복사 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g36"></a>[G36](<GOAL-SPECS/G36.md>) 템플릿 선택·초안 생성 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g37"></a>[G37](<GOAL-SPECS/G37.md>) 테마·헤더 스타일 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g38"></a>[G38](<GOAL-SPECS/G38.md>) 만료 설정·발송 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [4개](#shared-screens) |
| <a id="goal-g39"></a>[G39](<GOAL-SPECS/G39.md>) 내부 수락 처리·보관 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g40"></a>[G40](<GOAL-SPECS/G40.md>) 기본 정보·업무 범위 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g41"></a>[G41](<GOAL-SPECS/G41.md>) 지급 조건·청구 설정·초안 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g42"></a>[G42](<GOAL-SPECS/G42.md>) 초안 투어·편집 방식 전환 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g43"></a>[G43](<GOAL-SPECS/G43.md>) 작성자 서명 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g44"></a>[G44](<GOAL-SPECS/G44.md>) 템플릿 탐색·검색·적용 | 12 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g45"></a>[G45](<GOAL-SPECS/G45.md>) 폼 목록·질문 편집·순서 | 10 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g46"></a>[G46](<GOAL-SPECS/G46.md>) 폼 설정·게시·응답 목록 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g47"></a>[G47](<GOAL-SPECS/G47.md>) 링크·임베드·이메일 공유 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g48"></a>[G48](<GOAL-SPECS/G48.md>) 공개 응답 제출·상세 | 9 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g49"></a>[G49](<GOAL-SPECS/G49.md>) 캘린더 연결 상태 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g50"></a>[G50](<GOAL-SPECS/G50.md>) 예약 기본 정보·가용 시간 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g51"></a>[G51](<GOAL-SPECS/G51.md>) 고급 설정·브랜딩·유형 생성 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g52"></a>[G52](<GOAL-SPECS/G52.md>) 유형 목록·편집·링크 복사 | 9 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g53"></a>[G53](<GOAL-SPECS/G53.md>) 공개 날짜·슬롯 조회 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g54"></a>[G54](<GOAL-SPECS/G54.md>) 제안서 수락 후 예약 안내 규칙 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g55"></a>[G55](<GOAL-SPECS/G55.md>) 목록·기본값·표시 설정 | 11 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g56"></a>[G56](<GOAL-SPECS/G56.md>) Stripe 연결·카드 수납 토글 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g57"></a>[G57](<GOAL-SPECS/G57.md>) 단일·반복·구독 초안 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g58"></a>[G58](<GOAL-SPECS/G58.md>) 항목·서비스·헤더 편집 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g59"></a>[G59](<GOAL-SPECS/G59.md>) 미청구 시간 편입 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g60"></a>[G60](<GOAL-SPECS/G60.md>) 고객 미리보기 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g61"></a>[G61](<GOAL-SPECS/G61.md>) 자동 발송 오류·보완 경로 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g62"></a>[G62](<GOAL-SPECS/G62.md>) 입금 차단·정상 경로 보완 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g63"></a>[G63](<GOAL-SPECS/G63.md>) 장부 진입·비용 분류 | 6 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [5개](#shared-screens) |
| <a id="goal-g64"></a>[G64](<GOAL-SPECS/G64.md>) 비용 생성·반복·첨부·메모 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g65"></a>[G65](<GOAL-SPECS/G65.md>) 비용 일괄 편집 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g66"></a>[G66](<GOAL-SPECS/G66.md>) 비용 필터 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g67"></a>[G67](<GOAL-SPECS/G67.md>) 수기 수입 생성·삭제 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [3개](#shared-screens) |
| <a id="goal-g68"></a>[G68](<GOAL-SPECS/G68.md>) 비용 내보내기 | 2 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g69"></a>[G69](<GOAL-SPECS/G69.md>) 장부 손익·기간 집계 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g70"></a>[G70](<GOAL-SPECS/G70.md>) 은행 연결 소개·취소·미연결 상태 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g71"></a>[G71](<GOAL-SPECS/G71.md>) 전역 검색·최근 조회 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g72"></a>[G72](<GOAL-SPECS/G72.md>) 대시보드 요약·활동 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g73"></a>[G73](<GOAL-SPECS/G73.md>) 관리자 포털 설정 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g74"></a>[G74](<GOAL-SPECS/G74.md>) 설정 탐색·프로필·사진 | 7 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [8개](#shared-screens) |
| <a id="goal-g75"></a>[G75](<GOAL-SPECS/G75.md>) 알림 선호 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g76"></a>[G76](<GOAL-SPECS/G76.md>) 계정 삭제 확인·로그인 복귀 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g77"></a>[G77](<GOAL-SPECS/G77.md>) Client Mode 전환 게이트 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g78"></a>[G78](<GOAL-SPECS/G78.md>) CSV 가져오기·매핑·오류 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g79"></a>[G79](<GOAL-SPECS/G79.md>) 플랜 가입·청구 표시 | 5 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g80"></a>[G80](<GOAL-SPECS/G80.md>) 구독 해지 예약 | 4 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g81"></a>[G81](<GOAL-SPECS/G81.md>) 추천 링크 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [1개](#shared-screens) |
| <a id="goal-g82"></a>[G82](<GOAL-SPECS/G82.md>) 제휴 혜택 | 3 | 기능 구현 미착수 / R4 명세 보완·분석 대기 | [2개](#shared-screens) |
| <a id="goal-g83"></a>[G83](<GOAL-SPECS/G83.md>) 업무 연결 시나리오 | 0 | 통합 검증 미착수 / 선행 분석·보완 결과 수집 대기 | 0개 |
| <a id="goal-g84"></a>[G84](<GOAL-SPECS/G84.md>) 역할·웹 접근성·회귀·범위 감사 | 0 | 통합 검증 미착수 / 선행 분석·보완 결과 수집 대기 | 0개 |

<a id="research-index"></a>
## 6. R 분석과 미수록 기능

R4에서 재확인된 메모를 연결해도 각 R의 전체 조사·추가 구현 배정이 완료되는 것은 아니다. R04/R19/R22 등 관찰 메모가 없는 R도 기존 확장 범위를 유지한다.

| R | 소비 Goal | 연결 메모 |
| --- | --- | ---: |
| <a id="research-r01"></a>[R01](<RESEARCH-GOALS/R01.md>) 로그인 전 공개 웹·CTA·콘텐츠 | [G02](<GOAL-SPECS/G02.md>), [G03](<GOAL-SPECS/G03.md>), [G04](<GOAL-SPECS/G04.md>), [G05](<GOAL-SPECS/G05.md>), [G06](<GOAL-SPECS/G06.md>), [G07](<GOAL-SPECS/G07.md>), [G08](<GOAL-SPECS/G08.md>), [G09](<GOAL-SPECS/G09.md>), [G82](<GOAL-SPECS/G82.md>) | 69 |
| <a id="research-r02"></a>[R02](<RESEARCH-GOALS/R02.md>) 인증·온보딩·워크스페이스·역할 | [G11](<GOAL-SPECS/G11.md>), [G12](<GOAL-SPECS/G12.md>), [G10](<GOAL-SPECS/G10.md>), [G13](<GOAL-SPECS/G13.md>), [G17](<GOAL-SPECS/G17.md>), [G18](<GOAL-SPECS/G18.md>) | 31 |
| <a id="research-r03"></a>[R03](<RESEARCH-GOALS/R03.md>) 고객 회사·연락처·필드 | [G19](<GOAL-SPECS/G19.md>), [G20](<GOAL-SPECS/G20.md>), [G21](<GOAL-SPECS/G21.md>) | 22 |
| <a id="research-r04"></a>[R04](<RESEARCH-GOALS/R04.md>) Deals·견적·매출 예측 |  | 0 |
| <a id="research-r05"></a>[R05](<RESEARCH-GOALS/R05.md>) 프로젝트 lifecycle·예산·원가·수익성 | [G23](<GOAL-SPECS/G23.md>), [G24](<GOAL-SPECS/G24.md>), [G69](<GOAL-SPECS/G69.md>), [G72](<GOAL-SPECS/G72.md>) | 26 |
| <a id="research-r06"></a>[R06](<RESEARCH-GOALS/R06.md>) 작업 반복·상태·파일·의존성 | [G25](<GOAL-SPECS/G25.md>), [G26](<GOAL-SPECS/G26.md>), [G27](<GOAL-SPECS/G27.md>), [G28](<GOAL-SPECS/G28.md>), [G29](<GOAL-SPECS/G29.md>), [G30](<GOAL-SPECS/G30.md>), [G31](<GOAL-SPECS/G31.md>) | 40 |
| <a id="research-r07"></a>[R07](<RESEARCH-GOALS/R07.md>) 시간 수정·승인·정밀도·중복 청구 | [G32](<GOAL-SPECS/G32.md>), [G33](<GOAL-SPECS/G33.md>), [G34](<GOAL-SPECS/G34.md>), [G59](<GOAL-SPECS/G59.md>) | 18 |
| <a id="research-r08"></a>[R08](<RESEARCH-GOALS/R08.md>) 서비스 직접 CRUD·분류·가격 | [G35](<GOAL-SPECS/G35.md>), [G58](<GOAL-SPECS/G58.md>) | 14 |
| <a id="research-r09"></a>[R09](<RESEARCH-GOALS/R09.md>) 문서 편집기 버전·수신자 수락·서명 | [G36](<GOAL-SPECS/G36.md>), [G37](<GOAL-SPECS/G37.md>), [G38](<GOAL-SPECS/G38.md>), [G39](<GOAL-SPECS/G39.md>), [G40](<GOAL-SPECS/G40.md>), [G41](<GOAL-SPECS/G41.md>), [G42](<GOAL-SPECS/G42.md>), [G43](<GOAL-SPECS/G43.md>) | 37 |
| <a id="research-r10"></a>[R10](<RESEARCH-GOALS/R10.md>) 폼 전체 요소·저장·버전·고객 연결 | [G44](<GOAL-SPECS/G44.md>), [G45](<GOAL-SPECS/G45.md>), [G46](<GOAL-SPECS/G46.md>), [G47](<GOAL-SPECS/G47.md>), [G48](<GOAL-SPECS/G48.md>) | 39 |
| <a id="research-r11"></a>[R11](<RESEARCH-GOALS/R11.md>) 예약 확정·충돌·변경·취소 | [G49](<GOAL-SPECS/G49.md>), [G50](<GOAL-SPECS/G50.md>), [G51](<GOAL-SPECS/G51.md>), [G52](<GOAL-SPECS/G52.md>), [G53](<GOAL-SPECS/G53.md>), [G54](<GOAL-SPECS/G54.md>) | 31 |
| <a id="research-r12"></a>[R12](<RESEARCH-GOALS/R12.md>) 자동화 범위·실행 이력·중복·재시도 | [G54](<GOAL-SPECS/G54.md>) | 3 |
| <a id="research-r13"></a>[R13](<RESEARCH-GOALS/R13.md>) 청구서 발송·예약·수금 정상 경로 | [G55](<GOAL-SPECS/G55.md>), [G56](<GOAL-SPECS/G56.md>), [G58](<GOAL-SPECS/G58.md>), [G59](<GOAL-SPECS/G59.md>), [G60](<GOAL-SPECS/G60.md>), [G61](<GOAL-SPECS/G61.md>), [G62](<GOAL-SPECS/G62.md>) | 38 |
| <a id="research-r14"></a>[R14](<RESEARCH-GOALS/R14.md>) 반복 청구·자동 결제·리테이너 | [G57](<GOAL-SPECS/G57.md>), [G61](<GOAL-SPECS/G61.md>), [G62](<GOAL-SPECS/G62.md>) | 10 |
| <a id="research-r15"></a>[R15](<RESEARCH-GOALS/R15.md>) 장부·수입·비용의 계산과 lifecycle | [G63](<GOAL-SPECS/G63.md>), [G64](<GOAL-SPECS/G64.md>), [G65](<GOAL-SPECS/G65.md>), [G66](<GOAL-SPECS/G66.md>), [G67](<GOAL-SPECS/G67.md>), [G69](<GOAL-SPECS/G69.md>) | 29 |
| <a id="research-r16"></a>[R16](<RESEARCH-GOALS/R16.md>) 은행·CSV 가져오기·파일 내보내기 | [G68](<GOAL-SPECS/G68.md>), [G70](<GOAL-SPECS/G70.md>), [G78](<GOAL-SPECS/G78.md>) | 9 |
| <a id="research-r17"></a>[R17](<RESEARCH-GOALS/R17.md>) 고객 포털의 실제 사용과 접근 | [G73](<GOAL-SPECS/G73.md>) | 3 |
| <a id="research-r18"></a>[R18](<RESEARCH-GOALS/R18.md>) 계정 설정·제품 구독·지역 정책 | [G74](<GOAL-SPECS/G74.md>), [G75](<GOAL-SPECS/G75.md>), [G76](<GOAL-SPECS/G76.md>), [G77](<GOAL-SPECS/G77.md>), [G79](<GOAL-SPECS/G79.md>), [G80](<GOAL-SPECS/G80.md>) | 25 |
| <a id="research-r19"></a>[R19](<RESEARCH-GOALS/R19.md>) 인력 배정·업무량·휴가 |  | 0 |
| <a id="research-r20"></a>[R20](<RESEARCH-GOALS/R20.md>) 사용자 필드·저장 뷰·목록 상태 | [G20](<GOAL-SPECS/G20.md>), [G22](<GOAL-SPECS/G22.md>), [G23](<GOAL-SPECS/G23.md>), [G66](<GOAL-SPECS/G66.md>), [G71](<GOAL-SPECS/G71.md>) | 27 |
| <a id="research-r21"></a>[R21](<RESEARCH-GOALS/R21.md>) 알림함·직접 메일·활동·보고서 | [G72](<GOAL-SPECS/G72.md>), [G75](<GOAL-SPECS/G75.md>) | 7 |
| <a id="research-r22"></a>[R22](<RESEARCH-GOALS/R22.md>) 추가 외부 연동·API·MCP·AI |  | 0 |

## 7. 플로우별 원문과 담당 Goal

아래 관찰·남은 분석은 SOURCE_ANALYSIS_INDEX의 원문을 보존했다. `미확인` 문장을 구현 요구로 확정하지 않는다. 각 항목의 검토 범위는 원본 플로우 문맥이며 정확한 영역/요소 ID는 후속 정밀 분석에서 채운다.

<a id="r4-f001"></a>
### F001 — 404

원본: [ANALYSIS](<../../../bonsai_analysis/flows/404/ANALYSIS.md>) · Flow ID `b340c3e3-ad5f-401c-839d-60e02a8c7ce2` · [G14](<GOAL-SPECS/G14.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f001-o01"></a>R4-F001-O01 · 관찰 | 01은 짙은 녹색 전면 배경의 좌측 정렬 404·2줄 제목·얇은 구분선·2줄 설명·가로 두 개 외곽선 pill 버튼이다. 02는 흰 전면 배경의 중앙 정렬 접힌 문서 느낌표 아이콘·굵은 제목·2줄 설명·녹색 단일 pill 버튼이다. 두 화면은 앱 셸이 없고 동일한 404 디자인 변형으로 합치지 않는다. | [G14](<GOAL-SPECS/G14.md>) | 미대조 |
| <a id="r4-f001-o02"></a>R4-F001-O02 · 관찰 | 01 버튼 원문은 GO TO HOMEPAGE / REPORT A PROBLEM, 02는 Go Home이다. 두 이미지 사이의 실제 이동 조작·도메인·테마 전환은 확인되지 않는다. | [G14](<GOAL-SPECS/G14.md>) | 미대조 |
| <a id="r4-f001-a01"></a>R4-F001-A01 · 남은 분석 | 두 원본의 서로 다른 글꼴·제목 줄바꿈·정렬·버튼 폭/높이·배경/글자/테두리 색을 각각 명세해야 한다. 원본 font family·실제 CSS viewport는 미확인이다. | [G14](<GOAL-SPECS/G14.md>) | 분석 대기 |
| <a id="r4-f001-a02"></a>R4-F001-A02 · 남은 분석 | 신고 목적지·홈 목적지·키보드 및 모바일 상태는 이 원본에서 확인되지 않는다. | [G14](<GOAL-SPECS/G14.md>) | 분석 대기 |

<a id="r4-f002"></a>
### F002 — Accepting an invitation

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Accepting an invitation/ANALYSIS.md>) · Flow ID `08d7796f-33e4-4742-9a98-04c919916456` · [G18](<GOAL-SPECS/G18.md>) 01~13단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f002-o01"></a>R4-F002-O01 · 관찰 | 01~03 로그인에는 좌측 The Changelog 스크롤 카드·New 배지·하단 Bonsai updates 링크, 우측 로그인 카드, 상단 로고/Log In/Sign Up, 우하단 녹색 도움말 위젯이 있다. 실패는 CTA 바로 아래 붉은 가로 안내이며 01의 미인증 안내는 우하단 토스트다. | [G18](<GOAL-SPECS/G18.md>) | 미대조 |
| <a id="r4-f002-o02"></a>R4-F002-O02 · 관찰 | 04~07 일반 가입은 양쪽 하단 잎 삽화·좌상단 Bonsai 워드마크·우상단 로그인 링크가 있다. 05 이메일 오류는 입력 위 꼬리 있는 붉은 툴팁이며 입력 외곽선은 녹색이다. 07 Strong은 비밀번호 레이블 우측, CAPTCHA 체크는 별도 상태다. | [G18](<GOAL-SPECS/G18.md>) | 미대조 |
| <a id="r4-f002-o03"></a>R4-F002-O03 · 관찰 | 08~09 초대 전용 폼에는 가운데 로고·Welcome to Bonsai.·Joe Studio 설명·JS 사각 아바타와 X·고정 이메일·구분선·입력 두 개·Accept Invitation·하단 약관이 있다. 일반 가입의 소셜/CAPTCHA/잎 삽화가 보이지 않는다. | [G18](<GOAL-SPECS/G18.md>) | 미대조 |
| <a id="r4-f002-o04"></a>R4-F002-O04 · 관찰 | 10 내부 셸은 Projects/Tasks 두 메뉴, 상단 Track Time/아바타이며 Overview/Tasks/Time Tracking/Team 네 탭을 표시한다. Recent Activity에 완료 두 행과 archive 한 행이 이미 있다. 이 기존 활동을 초대 수락으로 생성된 활동이라고 해석하지 않는다. | [G18](<GOAL-SPECS/G18.md>) | 미대조 |
| <a id="r4-f002-o05"></a>R4-F002-O05 · 관찰 | 11 보드의 Done 카드에도 Feb 06이 붉게 표시된다. 12 표에는 Title/Client/Tags/Start Date, 정렬 표시·행 말줄임이 있고 New Project CTA는 없다. 13 계정 메뉴는 Joe Studio 머리글과 Help Center/Settings/Logout 세 항목이다. | [G18](<GOAL-SPECS/G18.md>) | 미대조 |
| <a id="r4-f002-a01"></a>R4-F002-A01 · 남은 분석 | 각 인증 폼의 폭·입력/CTA 높이·오류툴팁·강도·CAPTCHA·토스트와 소유자/협업자 셸 차이를 개별 상태로 명세한다. | [G18](<GOAL-SPECS/G18.md>) | 분석 대기 |
| <a id="r4-f002-a02"></a>R4-F002-A02 · 남은 분석 | 기록 사이의 이메일 변화와 일반 가입→초대 전용 가입 사이 생략된 조작을 자동 연결하지 않는다. CAPTCHA/소셜/아바타 X/메뉴 후속 동작은 미수록이다. | [G18](<GOAL-SPECS/G18.md>) | 분석 대기 |

<a id="r4-f003"></a>
### F003 — Adding a new client

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Adding a new client/ANALYSIS.md>) · Flow ID `a5f7a722-8a0c-4528-966a-903e7e0873fb` · [G19](<GOAL-SPECS/G19.md>) 01~07단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f003-o01"></a>R4-F003-O01 · 관찰 | 01~02 손익 그래프 우측 결제수단 홍보 카드·3개 페이지 점·Add Payment Method, 좌하단 Invite Team/Get 1 Month Free, 우하단 도움말까지 배경에 있다. +New 메뉴는 각 항목별 녹색 선 아이콘을 갖는다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f003-o02"></a>R4-F003-O02 · 관찰 | 03~05 모달은 배경을 어둡고 흐리게 만들지만 도움말 원형 버튼은 밝게 남는다. 닫기는 카드 밖 우상단 원형 X, 제출 버튼은 구분선 아래 별도 푸터에 위치한다. 03의 필수 별표는 회색, 04~05는 붉게 보인다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f003-o03"></a>R4-F003-O03 · 관찰 | 06 상세는 회사 아바타 우상단 붉은 X·Client 배지, 연락처 이메일 생략/복사 아이콘·Default Contact·별도 말줄임 메뉴 두 개가 있다. 성공 토스트에는 상단 녹색 선·체크·닫기 X가 있다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f003-o04"></a>R4-F003-O04 · 관찰 | 07 스크롤된 화면에서 상단 검색바는 보이지 않지만 좌측 메뉴·하단 도움말은 유지된다. Invoices의 Outstanding/Overdue/Paid / Pending은 모두 $0.00이며 Forms의 Send Form과 빈 카드가 별도로 있다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f003-a01"></a>R4-F003-A01 · 남은 분석 | 모달 외곽·푸터·닫기 위치·오버레이 blur와 상세 2열 폭, 스크롤 시 셸 동작을 수치화해야 한다. | [G19](<GOAL-SPECS/G19.md>) | 분석 대기 |
| <a id="r4-f003-a02"></a>R4-F003-A02 · 남은 분석 | 필수 별표 색 변화의 원인, 태그 선택 중간 팝업, 연락처/아바타/상태 메뉴 실행 결과는 캡처에서 확정할 수 없다. | [G19](<GOAL-SPECS/G19.md>) | 분석 대기 |

<a id="r4-f004"></a>
### F004 — Affiliate Program

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) · Flow ID `fcb41661-2520-40ac-842c-b463a7891093` · [G09](<GOAL-SPECS/G09.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f004-o01"></a>R4-F004-O01 · 관찰 | 01 공개 헤더의 아래 Small businesses/Agencies/Freelancers 보조 행, 우측 세로 사진·등고선 배경·좌하단 잎 장식이 있다. 02 설명 오른쪽 파트너 정보 목업에는 웹사이트·모바일·소셜 토글과 겹친 성공 알림이 포함된 삽화가 있다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f004-o02"></a>R4-F004-O02 · 관찰 | 03 혜택 카드마다 서로 다른 녹색 아이콘을 사용한다. 04 CTA는 큰 둥근 모서리·등고선 무늬의 짙은 녹색 카드이며 Get started와 흰 Contact us를 병렬로 배치한다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f004-a01"></a>R4-F004-A01 · 남은 분석 | 실제 신청 폼과 목업 삽화를 구분하고 인물·잎·등고선·아이콘 원본 자산 및 공개 헤더 스크롤 상태를 명세해야 한다. | [G09](<GOAL-SPECS/G09.md>) | 분석 대기 |

<a id="r4-f005"></a>
### F005 — Blog

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Blog/ANALYSIS.md>) · Flow ID `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` · [G05](<GOAL-SPECS/G05.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f005-o01"></a>R4-F005-O01 · 관찰 | 01 메가 메뉴는 화면 폭을 차지하는 흰 레이어·하단 그림자이며 배경 hero 상단을 덮는다. 02~03 검색은 중앙의 둥근 긴 입력, 카테고리는 8개 가로 링크, 글은 3열이다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f005-o02"></a>R4-F005-O02 · 관찰 | 04 세 카드의 본문 길이에 따라 저자 행의 세로 위치가 다르다. 저자 사진은 작은 사각형이고 이름은 녹색이다. 카드 전체의 테두리는 보이지 않으며 이미지는 둥근 모서리다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f005-a01"></a>R4-F005-A01 · 남은 분석 | 글 이미지·저자 사진·제목/요약 원문과 줄바꿈·카드 폭/간격을 자산/텍스트 명세로 연결해야 한다. 전체 목록/하단 페이지/메뉴 작동 방식은 이 플로우에 미수록이다. | [G05](<GOAL-SPECS/G05.md>) | 분석 대기 |

<a id="r4-f006"></a>
### F006 — Blog/Blog detail

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Blog/Blog detail/ANALYSIS.md>) · Flow ID `7b469aed-f69f-4f73-af50-9b1adb7aa052` · [G05](<GOAL-SPECS/G05.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f006-o01"></a>R4-F006-O01 · 관찰 | 01 상단 가입 배너는 짙은 녹색 바탕, Try it free는 녹색 pill이다. 저자/업데이트 행 아래 가는 구분선, 목차는 본문 왼쪽 별도 열이다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f006-o02"></a>R4-F006-O02 · 관찰 | 02~04 헤더와 하단 흰 가입바에 그림자가 있고 하단 바에는 왼쪽 두 줄 문구·오른쪽 이메일+CTA 복합 pill이 있다. 03 중앙 사진과 오른쪽 추천 카드 2개, 04 파란 SoftwareWorld 배지·출처 문구·반복 CTA가 있다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f006-a01"></a>R4-F006-A01 · 남은 분석 | 목차/추천 열/본문/고정 바의 겹침과 폭을 측정하고 기사 본문 및 사진·배지 자산을 분리해야 한다. 중간 본문 전부와 sticky 발생 조건은 원본 미수록이다. | [G05](<GOAL-SPECS/G05.md>) | 분석 대기 |

<a id="r4-f007"></a>
### F007 — Blog/Searching blog

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Blog/Searching blog/ANALYSIS.md>) · Flow ID `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` · [G05](<GOAL-SPECS/G05.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f007-o01"></a>R4-F007-O01 · 관찰 | 01 글 이미지와 저자 썸네일 자리는 비어 있고 카드 텍스트는 희미하지만 분류·검색은 정상이다. 02 선택 pill은 진한 녹색/흰 글자, 03 검색 입력 바탕도 옅은 녹색으로 보인다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f007-o02"></a>R4-F007-O02 · 관찰 | 03 검색 후 결과는 왼쪽 첫 열에만 남고 1 / 1은 목록 영역의 가로 중앙 아래에 있다. 필터 pill은 Start a business를 유지하며 제목과 요약의 줄바꿈도 카드 폭에 종속된다. | [G05](<GOAL-SPECS/G05.md>) | 미대조 |
| <a id="r4-f007-a01"></a>R4-F007-A01 · 남은 분석 | 로딩처럼 보이는 상태와 실제 빈 검색 결과를 같은 empty 컴포넌트로 합치지 않는다. 검색 제출/지연/페이지 이동과 결과없음 화면은 미수록이다. | [G05](<GOAL-SPECS/G05.md>) | 분석 대기 |

<a id="r4-f008"></a>
### F008 — Bookkeeping

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/ANALYSIS.md>) · Flow ID `05c04967-f1be-4b73-b6e5-af6199228187` · [G63](<GOAL-SPECS/G63.md>) 01~07단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f008-o01"></a>R4-F008-O01 · 관찰 | 02 손익 아래 Paid Before Fees $0.00·Other Income $160.00·Expenses $165.00·Profit -$5.00은 각각 다른 색으로 표시된다. QuickBooks 카드의 X·로고·잎 장식과 아래 Bonsai Tax 홍보 일부도 화면에 있다. | [G63](<GOAL-SPECS/G63.md>) | 미대조 |
| <a id="r4-f008-o02"></a>R4-F008-O02 · 관찰 | 03~04 체험 배너는 앱 본문 상단을 가로로 차지하고 닫기 X가 있다. 05의 3행과 06의 1행은 별도 snapshot이며 메뉴 열기만으로 두 행이 삭제됐다고 연결하지 않는다. 07 카테고리는 소문단 제목·얇은 색 세로선·잠금 아이콘·행 테두리를 사용한다. | [G63](<GOAL-SPECS/G63.md>) | 미대조 |
| <a id="r4-f008-a01"></a>R4-F008-A01 · 남은 분석 | 본문/배너 유무별 상단 높이·표의 아이콘 열·금액/상태 색을 별도로 명세해야 한다. 목록 데이터 차이와 실제 메뉴 조작 결과는 구분한다. | [G63](<GOAL-SPECS/G63.md>) | 분석 대기 |

<a id="r4-f009"></a>
### F009 — Bookkeeping/Adding a bookkeeping category

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Adding a bookkeeping category/ANALYSIS.md>) · Flow ID `3a74090f-e360-4fb9-9b79-c1ca197708ba` · [G63](<GOAL-SPECS/G63.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f009-o01"></a>R4-F009-O01 · 관찰 | 02~04 이름 입력은 중앙 정렬이며 색상판은 상·하 두 블록으로 나뉜 격자와 그림자를 가진다. 04 선택 칸에 흰 체크가 나타난다. 02에는 바깥 닫기 X가 보이지 않고 03~04에는 보인다. | [G63](<GOAL-SPECS/G63.md>) | 미대조 |
| <a id="r4-f009-o02"></a>R4-F009-O02 · 관찰 | 06 스크롤 후 사용자 카테고리는 Other Expenses 안에 빨간 세로선·Edit·붉은 Delete로 표시되고 기본 행은 잠금이다. 성공 토스트는 화면 우하단에 유지된다. | [G63](<GOAL-SPECS/G63.md>) | 미대조 |
| <a id="r4-f009-a01"></a>R4-F009-A01 · 남은 분석 | 색상 격자의 모든 색/순서·선택 표시·닫기 노출 차이 및 행 높이를 수치화해야 한다. 새 이름/색 변경·삭제 확인 후 화면은 미수록이다. | [G63](<GOAL-SPECS/G63.md>) | 분석 대기 |

<a id="r4-f010"></a>
### F010 — Bookkeeping/Adding a recurring expense

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Adding a recurring expense/ANALYSIS.md>) · Flow ID `f01f87a5-8396-4774-8387-e11c5e0afe03` · [G64](<GOAL-SPECS/G64.md>) 01~11단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f010-o01"></a>R4-F010-O01 · 관찰 | 02~10 모달은 좌측 입력·우측 첨부 열을 세로선으로 분리한다. 하단 왼쪽에는 What are business vs personal expenses? 링크가 있고 모달 아래 Contact Support가 따로 있다. | [G64](<GOAL-SPECS/G64.md>) | 미대조 |
| <a id="r4-f010-o02"></a>R4-F010-O02 · 관찰 | 04 분류 메뉴는 입력 아래로 확장되어 Date·반복 영역 위를 덮으며 그룹 제목과 녹색 Advertising 행이 구분된다. 07 반복 입력 추가로 모달이 아래로 길어지고 08 제목 아래 빨간 오류 띠가 추가되어 본문이 더 내려간다. | [G64](<GOAL-SPECS/G64.md>) | 미대조 |
| <a id="r4-f010-o03"></a>R4-F010-O03 · 관찰 | 10 이미지 아래 Remove Image는 빨간색이며 Notes에는 resize 표시가 있는 textarea가 있다. 11 결과에는 영수증/메모/반복 아이콘이 따로 있다. 입력일 Feb 6와 결과일 Feb 5의 차이를 보존한다. | [G64](<GOAL-SPECS/G64.md>) | 미대조 |
| <a id="r4-f010-a01"></a>R4-F010-A01 · 남은 분석 | Billable/Recurring 옆 정보 아이콘, 조건부 행·오류 띠·첨부 열 크기를 각각 명세해야 한다. 버튼 녹색이 다른 화면들과 같다고 가정하지 않는다. 날짜 차이 원인·프로젝트 미선택 허용 규칙은 추가 근거가 필요하다. | [G64](<GOAL-SPECS/G64.md>) | 분석 대기 |

<a id="r4-f011"></a>
### F011 — Bookkeeping/Adding a recurring expense/Adding an image and note

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Adding a recurring expense/Adding an image and note/ANALYSIS.md>) · Flow ID `9fcdb469-f302-4610-b0b9-a5af091b5b26` · [G64](<GOAL-SPECS/G64.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f011-o01"></a>R4-F011-O01 · 관찰 | 02 Add an image는 테두리 버튼으로 나타나며 Add Note는 아래 녹색 링크다. 03 파일 선택 뒤 영수증 미리보기와 빨간 Remove Image가 같은 열에 나타난다. | [G64](<GOAL-SPECS/G64.md>) | 미대조 |
| <a id="r4-f011-o02"></a>R4-F011-O02 · 관찰 | 04~05 Notes는 오른쪽 좁은 열의 다중행 입력이며 메모 추가 후에도 왼쪽 비용 값과 반복 설정은 유지된다. 마지막에도 Create Expense가 있는 편집 중 모달이다. | [G64](<GOAL-SPECS/G64.md>) | 미대조 |
| <a id="r4-f011-a01"></a>R4-F011-A01 · 남은 분석 | 파일선택 OS 창·업로드 진행/실패·이미지 삭제 후 상태는 미수록이다. 원본 영수증 자산·썸네일 crop·메모 입력 높이를 별도 명세해야 한다. | [G64](<GOAL-SPECS/G64.md>) | 분석 대기 |

<a id="r4-f012"></a>
### F012 — Bookkeeping/Bookkeeping overview

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Bookkeeping overview/ANALYSIS.md>) · Flow ID `2c50f586-bb35-480c-a7bc-fdd3857a6f81` · [G69](<GOAL-SPECS/G69.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f012-o01"></a>R4-F012-O01 · 관찰 | 02 Jun Totals는 검은 배경·흰 글자 팝오버, 그래프 포인트는 검은 외곽의 흰 원이다. 03~06 분류 앞 비율은 작은 원형 진행 표시이고 0% 그룹도 원과 금액을 유지한다. | [G69](<GOAL-SPECS/G69.md>) | 미대조 |
| <a id="r4-f012-o02"></a>R4-F012-O02 · 관찰 | 04 Advertising 막대는 주황색, 05 Personal 막대는 회색이다. 하위 행은 들여쓰기되고 상위 합계보다 가는 글자를 쓴다. 두 그룹이 동시에 펼쳐진 상태를 보존한다. | [G69](<GOAL-SPECS/G69.md>) | 미대조 |
| <a id="r4-f012-a01"></a>R4-F012-A01 · 남은 분석 | 그래프 곡선/축 간격·원형 비율·막대 길이·툴팁 위치와 서식이 필요하다. 75%+24% 및 Avg Per Month $15의 계산법은 캡처만으로 확정하지 않는다. | [G69](<GOAL-SPECS/G69.md>) | 분석 대기 |

<a id="r4-f013"></a>
### F013 — Bookkeeping/Bulk editing expenses

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Bulk editing expenses/ANALYSIS.md>) · Flow ID `91d17dc8-8701-405e-9133-a41f0f55c37c` · [G65](<GOAL-SPECS/G65.md>) 01~07단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f013-o01"></a>R4-F013-O01 · 관찰 | 02에서 선택 체크박스는 첫 행 왼쪽에만 보인다. 03~04 편집 중에는 헤더/모든 행 체크박스·Cancel editing이 나오고 하단 짙은 녹색 작업 바에 흰 Edit Category와 빨간 Delete가 있다. | [G65](<GOAL-SPECS/G65.md>) | 미대조 |
| <a id="r4-f013-o02"></a>R4-F013-O02 · 관찰 | 05~06 모달에서 선택된 Business/Personal 탭은 흰 배경·얕은 테두리이며 비선택은 회색이다. 업데이트 뒤 하단 바가 없어지고 일반 목록 도구와 성공 토스트가 보인다. | [G65](<GOAL-SPECS/G65.md>) | 미대조 |
| <a id="r4-f013-a01"></a>R4-F013-A01 · 남은 분석 | 행 hover로 체크박스가 나타나는지와 미선택/일부/전체 선택 시각 상태를 구분해야 한다. 01→02의 Prints 분류 변화는 체크박스 조작의 결과로 확정할 수 없다. | [G65](<GOAL-SPECS/G65.md>) | 분석 대기 |

<a id="r4-f014"></a>
### F014 — Bookkeeping/Connect bank account

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Connect bank account/ANALYSIS.md>) · Flow ID `c2673683-a5fc-4ed3-8c5c-be153e99765a` · [G70](<GOAL-SPECS/G70.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f014-o01"></a>R4-F014-O01 · 관찰 | 02 연결 카드 위에는 Back to Expenses와 Bulk Import CSV, 카드 아래에는 정보 아이콘과 두 문단 안내가 별도 테두리 상자에 있다. | [G70](<GOAL-SPECS/G70.md>) | 미대조 |
| <a id="r4-f014-o02"></a>R4-F014-O02 · 관찰 | 03 Plaid 모달은 회색 오버레이·흰 세로 카드·안쪽 닫기 X·검은 Continue를 사용한다. Bonsai 일반 모달의 바깥 원형 X/녹색 CTA와 다르다. | [G70](<GOAL-SPECS/G70.md>) | 미대조 |
| <a id="r4-f014-a01"></a>R4-F014-A01 · 남은 분석 | Plaid 로고·보안 아이콘·글꼴·모달 폭/높이·하단 버튼 위치를 외부 화면 변형으로 명세한다. 은행 선택/인증/연결완료는 이 원본에 없다. | [G70](<GOAL-SPECS/G70.md>) | 분석 대기 |

<a id="r4-f015"></a>
### F015 — Bookkeeping/Deleting an income

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Deleting an income/ANALYSIS.md>) · Flow ID `187433ca-53fc-4a69-9f8b-82cd0b59a428` · [G67](<GOAL-SPECS/G67.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f015-o01"></a>R4-F015-O01 · 관찰 | 02~04 금액은 모두 녹색이고 날짜/세금은 보조색이다. 03 첫 행 말줄임 아래의 두 항목 메뉴는 Delete Income도 검은 글자로 보인다. | [G67](<GOAL-SPECS/G67.md>) | 미대조 |
| <a id="r4-f015-o02"></a>R4-F015-O02 · 관찰 | 04 메뉴와 첫 행이 사라진 뒤 두 행과 우하단 삭제 성공 토스트가 남는다. 캡처 사이 확인창의 존재/부재는 확정할 수 없다. | [G67](<GOAL-SPECS/G67.md>) | 미대조 |
| <a id="r4-f015-a01"></a>R4-F015-A01 · 남은 분석 | 메뉴가 삭제 항목이라는 이유로 빨간색으로 바꾸지 않는다. 확인창/취소/오류·전체 빈 목록은 원본 미수록이다. | [G67](<GOAL-SPECS/G67.md>) | 분석 대기 |

<a id="r4-f016"></a>
### F016 — Bookkeeping/Downloading expenses

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Downloading expenses/ANALYSIS.md>) · Flow ID `a8f62075-1597-47e6-855d-c5fd51194c1c` · [G68](<GOAL-SPECS/G68.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f016-o01"></a>R4-F016-O01 · 관찰 | 03~04 다운로드 모달에는 문서·잎·구름 아이콘 삽화, 제목, 옅은 녹색 상태 박스가 세로로 있다. 생성 중에는 서로 크기가 다른 녹색 점, 준비 후에는 같은 박스 안의 초록 Download 버튼이다. | [G68](<GOAL-SPECS/G68.md>) | 미대조 |
| <a id="r4-f016-a01"></a>R4-F016-A01 · 남은 분석 | 삽화 자산·상태 박스 크기·문구 위치·점 표시를 명세한다. 정지 이미지로 점 애니메이션 속도와 다운로드 파일 형식/내용/완료를 확정하지 않는다. | [G68](<GOAL-SPECS/G68.md>) | 분석 대기 |

<a id="r4-f017"></a>
### F017 — Bookkeeping/Filtering expenses

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Bookkeeping/Filtering expenses/ANALYSIS.md>) · Flow ID `bd0a6592-522b-4dcd-94ff-68324e44e3b0` · [G66](<GOAL-SPECS/G66.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f017-o01"></a>R4-F017-O01 · 관찰 | 02 필터는 모달 오버레이 없이 표 위에 뜬 그림자 패널이다. 03~04 달력은 필터 패널 위에 다시 겹치며 빠른 기간 열을 포함해 패널 밖까지 확장된다. | [G66](<GOAL-SPECS/G66.md>) | 미대조 |
| <a id="r4-f017-o02"></a>R4-F017-O02 · 관찰 | 07 Category에는 선택 칩의 X와 필드 전체 제거 X가 함께 보인다. 09 결과가 없으면 표 헤더 대신 테두리 빈 카드의 중앙에 No expenses yet.가 있고 5개 조건 칩은 유지된다. | [G66](<GOAL-SPECS/G66.md>) | 미대조 |
| <a id="r4-f017-a01"></a>R4-F017-A01 · 남은 분석 | 필터/드롭다운/달력의 겹침 순서·칩 높이·Clear/Close 차이를 명세한다. 미선택 Client/Project/Currency/금액 필드도 구현 대상 요소에서 빠뜨리면 안 된다. | [G66](<GOAL-SPECS/G66.md>) | 분석 대기 |

<a id="r4-f018"></a>
### F018 — Careers

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) · Flow ID `35234808-9af8-4240-9025-e24a5951eaa9` · [G09](<GOAL-SPECS/G09.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f018-o01"></a>R4-F018-O01 · 관찰 | 01 hero 사진들은 한쪽 모서리가 크게 둥근 비대칭 타일이며 오른쪽 2×2와 아래 가로 띠로 배치된다. 02/04 혜택·가치 카드는 아이콘/제목/짧은 설명을 왼쪽 정렬한다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f018-o02"></a>R4-F018-O02 · 관찰 | 03 큰 단체 사진과 04 야외 단체 사진은 서로 다른 자산이며 둥근 외곽을 가진다. 스크롤된 화면은 고객군 보조 메뉴 없이 공개 주 헤더만 남는다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f018-a01"></a>R4-F018-A01 · 남은 분석 | 사진별 crop·특정 모서리 radius·카드 간격·각 설명 원문과 행 수가 필요하다. 실제 채용 공고 목록/지원 폼은 수록되지 않았다. | [G09](<GOAL-SPECS/G09.md>) | 분석 대기 |

<a id="r4-f019"></a>
### F019 — Clients

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Clients/ANALYSIS.md>) · Flow ID `f8191fa7-f2d9-4060-bd47-891b2d627aaa` · [G19](<GOAL-SPECS/G19.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f019-o01"></a>R4-F019-O01 · 관찰 | 02 목록은 사진 아바타와 이니셜 아바타 두 변형, 태그가 없는 행의 대시, 각 행 말줄임을 포함한다. 03 포털 링크에는 복사 아이콘, 안내 배너에는 정보·닫기·Find out more.가 있다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f019-o02"></a>R4-F019-O02 · 관찰 | 03 포털 미리보기의 JD 아바타는 헤더/본문 경계에 겹치고 아래 회색 텍스트 모형·녹색 버튼 모형이 있다. 04 자동화 카드는 잎·겹친 예시 카드·우하단 옅은 장식 및 지원 링크까지 포함한다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f019-o03"></a>R4-F019-O03 · 관찰 | 05 태그와 필드는 서로 다른 표다. 캡처에서 Client 태그 행에는 Edit/Delete가 보이고 Lead 행에는 보이지 않는다. 모든 태그 행에 항상 작업 버튼이 보인다고 일반화하지 않는다. | [G19](<GOAL-SPECS/G19.md>) | 미대조 |
| <a id="r4-f019-a01"></a>R4-F019-A01 · 남은 분석 | 태그 행 버튼의 hover/선택 조건은 미확인이다. 포털 미리보기와 실제 고객 화면, 자동화 안내 삽화와 실행 폼을 구분해야 한다. | [G19](<GOAL-SPECS/G19.md>) | 분석 대기 |

<a id="r4-f020"></a>
### F020 — Clients/Adding a client field

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Clients/Adding a client field/ANALYSIS.md>) · Flow ID `87c1f8ab-d786-4b2c-9861-d75e5813e639` · [G20](<GOAL-SPECS/G20.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f020-o01"></a>R4-F020-O01 · 관찰 | 02 새 행은 기존 필드들 위에 생기며 입력 폭은 표 전체보다 짧고 Done은 오른쪽 끝에 떨어져 있다. 04 입력이 작은 회색 이름 배경으로 바뀌고 Edit/Delete가 다시 나타난다. | [G20](<GOAL-SPECS/G20.md>) | 미대조 |
| <a id="r4-f020-o02"></a>R4-F020-O02 · 관찰 | 01에는 상단 Upgrade Now가 있으나 02~04에는 없고 Tasks 옆 작은 붉은 점이 보인다. 필드 추가 때문에 구독 상태가 바뀌었다고 해석하지 않는다. | [G20](<GOAL-SPECS/G20.md>) | 미대조 |
| <a id="r4-f020-a01"></a>R4-F020-A01 · 남은 분석 | 행 삽입 시 표 높이·이름 배경/입력의 차이·Done 위치를 명세한다. 빈 값 저장/중복명/자료형 검증과 재진입 후 결과는 미수록이다. | [G20](<GOAL-SPECS/G20.md>) | 분석 대기 |

<a id="r4-f021"></a>
### F021 — Clients/Adding a new project (Clients)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Clients/Adding a new project (Clients)/ANALYSIS.md>) · Flow ID `dd29b56e-cc30-4875-8f7b-302ca3909d05` · [G21](<GOAL-SPECS/G21.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f021-o01"></a>R4-F021-O01 · 관찰 | 02~03 고객에서 여는 New Project는 고객 선택란 없이 Project Title과 Project Team만 있고 팀원의 JD 사각 아바타가 있다. 제목 아래/CTA 위 여백이 크다. | [G21](<GOAL-SPECS/G21.md>) | 미대조 |
| <a id="r4-f021-o02"></a>R4-F021-O02 · 관찰 | 04 고객 상세의 사진과 달리 프로젝트 고객 링크 앞에는 JS 이니셜이 보인다. 05 미청구/청구 시간은 모두 00:00:00이지만 청구 시간은 녹색이며 금액도 상태별 검정/주황/녹색이다. | [G21](<GOAL-SPECS/G21.md>) | 미대조 |
| <a id="r4-f021-a01"></a>R4-F021-A01 · 남은 분석 | 고객 경유 생성과 전역 생성의 입력 차이를 유지한다. 공통 프로젝트 셸의 6개 탭, 메모의 회사 내부 공개 문구 및 요약 카드의 배치/색을 명세해야 한다. | [G21](<GOAL-SPECS/G21.md>) | 분석 대기 |

<a id="r4-f022"></a>
### F022 — Clients/Enabling portal access

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Clients/Enabling portal access/ANALYSIS.md>) · Flow ID `0cf1b411-06f2-4fc9-8af4-30148a3e88e2` · [G73](<GOAL-SPECS/G73.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f022-o01"></a>R4-F022-O01 · 관찰 | 01 접근 세그먼트는 Enable / Disabled, 02는 Enabled / Disable이다. 선택된 쪽의 문구 자체가 변하고 Disabled는 빨간색, Enabled는 녹색이다. | [G73](<GOAL-SPECS/G73.md>) | 미대조 |
| <a id="r4-f022-o02"></a>R4-F022-O02 · 관찰 | 02 토스트가 오른쪽 미리보기 아래 설명 일부와 겹친다. 미리보기 JD·헤더 배경·회색 선·녹색 버튼은 접근 설정 변경 후에도 같은 모습이다. | [G73](<GOAL-SPECS/G73.md>) | 미대조 |
| <a id="r4-f022-a01"></a>R4-F022-A01 · 남은 분석 | 선택 표시만 바꾸고 동사/상태 문구를 고정하지 않도록 네 레이블을 구분한다. 실제 포털 접근 차단/허용 화면은 미수록이다. | [G73](<GOAL-SPECS/G73.md>) | 분석 대기 |

<a id="r4-f023"></a>
### F023 — Clients/Uploading a client image

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Clients/Uploading a client image/ANALYSIS.md>) · Flow ID `44e00e8a-aa9f-41f1-b9bc-682789c80985` · [G20](<GOAL-SPECS/G20.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f023-o01"></a>R4-F023-O01 · 관찰 | 02 아바타 영역의 Update Image는 두 줄이며 기존 이니셜 위에 밝은 회색으로 표시된다. 03 작은 인물 그림으로 바뀌지만 바깥 닫기 X와 Client 배지는 유지된다. | [G20](<GOAL-SPECS/G20.md>) | 미대조 |
| <a id="r4-f023-a01"></a>R4-F023-A01 · 남은 분석 | hover라는 발생 원인은 정적 화면만으로 확정할 수 없으므로 오버레이가 보인 상태와 구분한다. 이미지 원본·crop/비율·삭제 X 동작·업로드 실패는 추가 근거가 필요하다. | [G20](<GOAL-SPECS/G20.md>) | 분석 대기 |

<a id="r4-f024"></a>
### F024 — Contact Us

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Contact Us/ANALYSIS.md>) · Flow ID `5ea077df-b21b-4455-8b53-bbd8901d54ae` · [G08](<GOAL-SPECS/G08.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f024-o01"></a>R4-F024-O01 · 관찰 | 01 지원 카드 3개는 서로 다른 녹색 선 아이콘과 제목/설명/하단 녹색 링크를 가진다. 02 질문은 굵은 텍스트 목록이고 문장 길이에 따라 1~2줄이다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f024-o02"></a>R4-F024-O02 · 관찰 | 02 오른쪽 잎 장식이 상단과 우측 경계에서 잘리며 본문 질문 영역은 왼쪽에 치우친다. FAQ를 임의의 아코디언 화살표/카드로 바꾸면 원본과 달라진다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f024-a01"></a>R4-F024-A01 · 남은 분석 | FAQ 10개 원문·줄바꿈·행간, 잎 자산과 crop이 필요하다. 펼친 답변·링크 목적지·문의 전송 결과는 이 원본에 없다. | [G08](<GOAL-SPECS/G08.md>) | 분석 대기 |

<a id="r4-f025"></a>
### F025 — Copying referral link

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Copying referral link/ANALYSIS.md>) · Flow ID `0744777e-0613-4157-b1e2-a1ac0854db27` · [G81](<GOAL-SPECS/G81.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f025-o01"></a>R4-F025-O01 · 관찰 | 02~04 추천 화면에는 일반 앱 사이드바/검색바 대신 좌상단 로고와 우상단 X가 있다. 양쪽 잎·우하단 옅은 곡선 배경·등고선 제휴 배너가 있다. | [G81](<GOAL-SPECS/G81.md>) | 미대조 |
| <a id="r4-f025-o02"></a>R4-F025-O02 · 관찰 | 복사 버튼은 링크 입력 오른쪽의 회녹색 사각 버튼이고 SNS는 파란 아이콘 3개다. 03 채팅 카드가 성공 토스트 앞을 가리고 04에서는 토스트·도움말만 보인다. | [G81](<GOAL-SPECS/G81.md>) | 미대조 |
| <a id="r4-f025-a01"></a>R4-F025-A01 · 남은 분석 | 독립 전체 화면 셸·장식·통계 3열·팝업 겹침을 명세한다. 초대 발송/소셜 공유/추천 보상 적립은 관찰되지 않았다. | [G81](<GOAL-SPECS/G81.md>) | 분석 대기 |

<a id="r4-f026"></a>
### F026 — Creating a new contract

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a new contract/ANALYSIS.md>) · Flow ID `6a26536d-43db-4d46-b0a3-22be61b34b36` · [G40](<GOAL-SPECS/G40.md>) 01~12단계, [G41](<GOAL-SPECS/G41.md>) 13~19단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f026-o01"></a>R4-F026-O01 · 관찰 | 03~06 추천 템플릿은 파란 링크/칩, 샘플 안내는 옅은 노란 박스다. 펼침·안내 유무에 따라 모달 높이가 달라진다. | [G40](<GOAL-SPECS/G40.md>) | 미대조 |
| <a id="r4-f026-o02"></a>R4-F026-O02 · 관찰 | 07~17 마법사는 전체 앱 사이드바 대신 작은 메뉴/뒤로 Contracts/프로젝트 경로의 상단 바를 사용한다. 문장 안 입력은 점선 밑줄이며 오른쪽 도움말 위치와 내용이 단계/필드에 따라 달라진다. | [G40](<GOAL-SPECS/G40.md>), [G41](<GOAL-SPECS/G41.md>) | 미대조 |
| <a id="r4-f026-o03"></a>R4-F026-O03 · 관찰 | 11 첨부는 OPTIONAL 문구가 있는 점선 영역이다. 14~15 deposit 오류는 입력 위 붉은 꼬리 툴팁이고 0을 입력한 15에도 남아 있다. 16 Create Contract 뒤에도 17 Invoicing Settings 4 OF 4가 이어진다. | [G40](<GOAL-SPECS/G40.md>), [G41](<GOAL-SPECS/G41.md>) | 미대조 |
| <a id="r4-f026-o04"></a>R4-F026-O04 · 관찰 | 18 계약 문서는 앱과 다른 세리프 본문·노란 하이라이트·별도 우측 설정 패널을 사용한다. 19 목록의 Sent 날짜는 18 직후 자동발송을 증명하지 않는다. | [G41](<GOAL-SPECS/G41.md>) | 미대조 |
| <a id="r4-f026-a01"></a>R4-F026-A01 · 남은 분석 | 문장형 필드별 줄바꿈·오류/도움말 위치·4단계 진행 표시와 문서 본문/조항 원문을 별도 명세해야 한다. FF Meta Serif는 설정 레이블 관찰이며 실제 폰트 파일 확보 증거가 아니다. | [G40](<GOAL-SPECS/G40.md>), [G41](<GOAL-SPECS/G41.md>) | 분석 대기 |

<a id="r4-f027"></a>
### F027 — Creating a new contract/Contract guide tour

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a new contract/Contract guide tour/ANALYSIS.md>) · Flow ID `03c89447-e059-4f05-b9f3-7b1430640cb1` · [G42](<GOAL-SPECS/G42.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f027-o01"></a>R4-F027-O01 · 관찰 | 안내는 배경을 어둡게 만드는 모달이 아니라 흰 그림자 말풍선이다. 01 문서 제목 위, 02 당사자 문장 위, 03 우상단 Sign Contract 아래로 이동한다. | [G42](<GOAL-SPECS/G42.md>) | 미대조 |
| <a id="r4-f027-o02"></a>R4-F027-O02 · 관찰 | 01 Next만, 02 Back/Next, 03 Back/Finish이며 각 말풍선에 X가 있다. 04에서는 회사 로고와 로고 X가 가림 없이 드러난다. | [G42](<GOAL-SPECS/G42.md>) | 미대조 |
| <a id="r4-f027-a01"></a>R4-F027-A01 · 남은 분석 | 말풍선 너비/꼬리/위치·본문 두 문단·버튼 순서를 명세한다. 닫기/뒤로/재진입 시 투어 진행 저장 여부는 미수록이다. | [G42](<GOAL-SPECS/G42.md>) | 분석 대기 |

<a id="r4-f028"></a>
### F028 — Creating a new contract/Converting contract type

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a new contract/Converting contract type/ANALYSIS.md>) · Flow ID `3903d09f-3610-46dd-808a-2e1017a411d5` · [G42](<GOAL-SPECS/G42.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f028-o01"></a>R4-F028-O01 · 관찰 | 02 영향 안내는 모달 안 옅은 배경 박스에 두 문단으로 있고 Confirm Change는 녹색이다. 문서 전체에는 어두운 blur 오버레이가 적용된다. | [G42](<GOAL-SPECS/G42.md>) | 미대조 |
| <a id="r4-f028-o02"></a>R4-F028-O02 · 관찰 | 03 하이라이트 제거뿐 아니라 문단 간 간격/줄 배치가 달라지고 [the date both parties sign]도 일반 문장으로 보인다. 우측 Amount/Addendum/Contract Type 도구가 빠진다. | [G42](<GOAL-SPECS/G42.md>) | 미대조 |
| <a id="r4-f028-a01"></a>R4-F028-A01 · 남은 분석 | 전환 전후 문서 텍스트와 간격을 각각 대조해야 한다. 상태는 Drafted로 유지되며 편집/서명 완료로 승격하지 않는다. 되돌리기/취소/실패 분기는 미수록이다. | [G42](<GOAL-SPECS/G42.md>) | 분석 대기 |

<a id="r4-f029"></a>
### F029 — Creating a new contract/Signing a contract

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a new contract/Signing a contract/ANALYSIS.md>) · Flow ID `9c947be2-ae51-481b-953f-f7d65a3a366e` · [G43](<GOAL-SPECS/G43.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f029-o01"></a>R4-F029-O01 · 관찰 | 02~03 서명 모달은 중앙 제목/본문 2열/하단 오른쪽 CTA로 나뉘며 법적 이름 입력은 밑줄 형태다. 미리보기에는 제목 띠·서명선·회사/이름/이메일이 작게 있다. | [G43](<GOAL-SPECS/G43.md>) | 미대조 |
| <a id="r4-f029-o02"></a>R4-F029-O02 · 관찰 | 04 문서 로고의 삭제 X와 우측 Settings가 사라지고 Activity가 생긴다. 05 서명 블록 두 개 사이 여백이 크고 작성자만 필기체/날짜가 채워져 있다. | [G43](<GOAL-SPECS/G43.md>) | 미대조 |
| <a id="r4-f029-a01"></a>R4-F029-A01 · 남은 분석 | 필기체 서명 자산/서체·빈/입력 미리보기 크기·서명 블록 좌표를 명세한다. Finalized와 양측 Signed를 합치면 안 되며 고객 서명/발송은 이 흐름에서 확인되지 않는다. | [G43](<GOAL-SPECS/G43.md>) | 분석 대기 |

<a id="r4-f030"></a>
### F030 — Creating a proposal

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/ANALYSIS.md>) · Flow ID `60d9a6ef-22e9-463e-bcbb-ebd993a06e02` · [G36](<GOAL-SPECS/G36.md>) 01~12단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f030-o01"></a>R4-F030-O01 · 관찰 | 03~04 템플릿 선택은 별도 전체 화면이며 Type/Industry 탭, 업종명 옆 개수, 검색 X, 카드별 썸네일/사용 링크/페이지 번호를 포함한다. | [G36](<GOAL-SPECS/G36.md>) | 미대조 |
| <a id="r4-f030-o02"></a>R4-F030-O02 · 관찰 | 07~11 생성 폼은 신규 고객이면 들여쓴 2개 필드가 생기고 신규 프로젝트이면 이름 필드가 생긴다. 상하 여백과 모달 높이가 변한다. | [G36](<GOAL-SPECS/G36.md>) | 미대조 |
| <a id="r4-f030-o03"></a>R4-F030-O03 · 관찰 | 12 문서 헤더 이미지에는 Edit와 X, 로고에는 별도 X가 있다. 오른쪽 Header Styles의 Text Color와 아래 Global Styles의 Text Color는 서로 다른 항목이다. | [G36](<GOAL-SPECS/G36.md>) | 미대조 |
| <a id="r4-f030-a01"></a>R4-F030-A01 · 남은 분석 | 공용 미리보기와 계정 초안의 발신/수신 정보·로고·금액을 동일 fixture로 합치지 않는다. 템플릿 썸네일/헤더 원본·문서 폭/줄바꿈·스타일 패널 하단은 별도 명세가 필요하다. | [G36](<GOAL-SPECS/G36.md>) | 분석 대기 |

<a id="r4-f031"></a>
### F031 — Creating a proposal/Archiving a proposal

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Archiving a proposal/ANALYSIS.md>) · Flow ID `2ea53e4d-6f67-4621-bb41-c56eeb054811` · [G39](<GOAL-SPECS/G39.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f031-o01"></a>R4-F031-O01 · 관찰 | 02 메뉴의 Archive/Delete도 검은 글자지만 03 보관 확인의 Yes, I'm Sure는 빨간색이다. 모달에는 별도 Cancel 없이 외곽 X가 보인다. | [G39](<GOAL-SPECS/G39.md>) | 미대조 |
| <a id="r4-f031-o02"></a>R4-F031-O02 · 관찰 | 04 보관 성공 후에도 Accepted 상태·금액·문서가 남고 05 기본 목록만 빈 카드로 바뀐다. 보관과 수락은 다른 상태 축이다. | [G39](<GOAL-SPECS/G39.md>) | 미대조 |
| <a id="r4-f031-a01"></a>R4-F031-A01 · 남은 분석 | 원본 메뉴/확인창 색과 상태를 그대로 명세한다. 보관 필터/복구/삭제와 PDF 생성 결과는 원본 미수록이다. | [G39](<GOAL-SPECS/G39.md>) | 분석 대기 |

<a id="r4-f032"></a>
### F032 — Creating a proposal/Changing theme

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Changing theme/ANALYSIS.md>) · Flow ID `5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0` · [G37](<GOAL-SPECS/G37.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f032-o01"></a>R4-F032-O01 · 관찰 | 02 테마 선택은 8개 이름만 있는 목록이 아니라 2×4 도식 카드와 녹색 선택 테두리/아이콘이다. 우측 패널 맨 위 Finish Styling은 가로로 넓다. | [G37](<GOAL-SPECS/G37.md>) | 미대조 |
| <a id="r4-f032-o02"></a>R4-F032-O02 · 관찰 | 03 Splash는 보케 배경의 큰 커버와 아래 흰 문서 카드, 05 Cover는 짧은 설경 배너와 경계 중앙에 걸친 로고다. 테마 변경으로 배경 자산·로고 위치·제목 정렬·문서 여백이 함께 변한다. | [G37](<GOAL-SPECS/G37.md>) | 미대조 |
| <a id="r4-f032-a01"></a>R4-F032-A01 · 남은 분석 | 8개 카드의 도식 자산과 관찰된 Classic/Splash/Cover 레이아웃을 각각 명세한다. 나머지 5개 테마의 전체 적용 화면은 이 흐름에 없으며 카드만으로 완성형을 확정할 수 없다. | [G37](<GOAL-SPECS/G37.md>) | 분석 대기 |

<a id="r4-f033"></a>
### F033 — Creating a proposal/Creating a new automation

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Creating a new automation/ANALYSIS.md>) · Flow ID `b4fff91d-639e-4818-9ec8-4dc1bfc3a18a` · [G54](<GOAL-SPECS/G54.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f033-o01"></a>R4-F033-O01 · 관찰 | 02 Standard Automations 체크는 회색 설명 박스 안에 있고 Custom 영역은 테두리 empty 카드다. Create New Automation과 하단 Add New Automation은 서로 다른 위치에 있다. | [G54](<GOAL-SPECS/G54.md>) | 미대조 |
| <a id="r4-f033-o02"></a>R4-F033-O02 · 관찰 | 03 Trigger→Automatic Action의 화살표, Event Type 옆 옅은 도움말 카드, Message 아래 51/175 카운터가 있다. 06의 템플릿 이름은 Creative Brief로 제안서 제목과 다르다. | [G54](<GOAL-SPECS/G54.md>) | 미대조 |
| <a id="r4-f033-a01"></a>R4-F033-A01 · 남은 분석 | 03 Event Type 미선택에서 04 성공까지의 중간 입력은 없다. 빈 Event Type 허용이나 수락된 문서에서 즉시 자동화 실행을 확정하지 않는다. 규칙 생성과 마지막 개인 템플릿 존재를 인과관계로 묶지 않는다. | [G54](<GOAL-SPECS/G54.md>) | 분석 대기 |

<a id="r4-f034"></a>
### F034 — Creating a proposal/Editing header style

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Editing header style/ANALYSIS.md>) · Flow ID `b8c9b3db-6f13-454c-8abf-52859fd329e5` · [G37](<GOAL-SPECS/G37.md>) 01~07단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f034-o01"></a>R4-F034-O01 · 관찰 | 02/03 피커는 Title Color 아래에서 다른 스타일 입력 위를 덮고 05/06에서는 Text Color 아래로 한 행 내려간다. 색면·색조 띠·투명도 띠·Hex/R/G/B/A·프리셋 두 줄을 포함한다. | [G37](<GOAL-SPECS/G37.md>) | 미대조 |
| <a id="r4-f034-o02"></a>R4-F034-O02 · 관찰 | 제목색 변경은 문서 제목과 Title Color 원형 표본, 텍스트색 변경은 날짜·발신/수신 정보와 Text Color 표본에 반영된다. 본문 Overview & Goals는 같은 색으로 바뀌지 않는다. | [G37](<GOAL-SPECS/G37.md>) | 미대조 |
| <a id="r4-f034-a01"></a>R4-F034-A01 · 남은 분석 | 원본에 보이는 Hex/RGBA는 관찰값이고 화면 전체 테마 토큰이 아니다. 피커 크기/배치·색면/프리셋 순서·알파 입력·Global Text Color와의 적용 범위를 별도 명세한다. | [G37](<GOAL-SPECS/G37.md>) | 분석 대기 |

<a id="r4-f035"></a>
### F035 — Creating a proposal/Marking as accepted

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Marking as accepted/ANALYSIS.md>) · Flow ID `7f481864-a5f0-4786-a800-334c1637b819` · [G39](<GOAL-SPECS/G39.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f035-o01"></a>R4-F035-O01 · 관찰 | 04 확인 모달에는 Confirm Change 설명 박스와 별도 패키지 드롭다운이 있다. 05 성공 토스트는 모달 오버레이보다 앞에 보이고 버튼은 연해져 있다. | [G39](<GOAL-SPECS/G39.md>) | 미대조 |
| <a id="r4-f035-o02"></a>R4-F035-O02 · 관찰 | 06 Accepted 배지는 옅은 녹색 바탕/초록 점이며 Send Reminder가 사라지고 Download PDF로 바뀐다. Overview의 Expiration Date가 빠지고 Payments에 Upfront Payment None이 나타난다. | [G39](<GOAL-SPECS/G39.md>) | 미대조 |
| <a id="r4-f035-a01"></a>R4-F035-A01 · 남은 분석 | 원본의 New Package Title을 새 패키지 생성 입력으로 구현하면 안 된다. 05의 옅은 버튼을 disabled라고 확정하려면 추가 동작 근거가 필요하다. | [G39](<GOAL-SPECS/G39.md>) | 분석 대기 |

<a id="r4-f036"></a>
### F036 — Creating a proposal/Sending a proposal

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Sending a proposal/ANALYSIS.md>) · Flow ID `21548d39-a3a9-4f72-883d-250c6a60c774` · [G38](<GOAL-SPECS/G38.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f036-o01"></a>R4-F036-O01 · 관찰 | 02 이메일/URL은 아이콘이 붙은 두 테두리 버튼형 탭이다. 자동 인보이스·기간 선택은 작은 상단 옵션 줄이고 To/Subject는 얇은 행 입력이다. | [G38](<GOAL-SPECS/G38.md>) | 미대조 |
| <a id="r4-f036-o02"></a>R4-F036-O02 · 관찰 | 05~06 미리보기는 EMAIL PREVIEW 구분선·Powered by Bonsai·메일 카드·View Proposal 버튼·Hide Preview/brand settings를 포함한다. 모달이 화면 높이를 넘으면 제목은 화면 위로 사라지고 배경 문서는 유지된다. | [G38](<GOAL-SPECS/G38.md>) | 미대조 |
| <a id="r4-f036-o03"></a>R4-F036-O03 · 관찰 | 07 성공 화면은 본문이 사라진 큰 여백 안의 성공 문구이며 08에서는 문서의 Edit/X/Add Recipient와 Style 패널이 없어지고 Sent/Send Reminder가 나타난다. | [G38](<GOAL-SPECS/G38.md>) | 미대조 |
| <a id="r4-f036-a01"></a>R4-F036-A01 · 남은 분석 | 본문 편집과 이메일 미리보기의 서로 다른 DOM/폭/스크롤 상태, 발송 진행/완료를 명세한다. URL 발송 탭 내용·수신함 도착·자동 인보이스 생성은 미수록이다. | [G38](<GOAL-SPECS/G38.md>) | 분석 대기 |

<a id="r4-f037"></a>
### F037 — Creating a proposal/Setting proposal expiration date

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Creating a proposal/Setting proposal expiration date/ANALYSIS.md>) · Flow ID `b597e800-c771-4e17-8ddb-1167f2a61deb` · [G38](<GOAL-SPECS/G38.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f037-o01"></a>R4-F037-O01 · 관찰 | 02 모달에는 제목 아래 설명, 옅은 녹색 알림 안내 박스, 중앙 정렬 날짜 입력, 넓은 CTA가 있다. 03 달력은 카드 아래 밖으로 펼쳐지고 확인 버튼 영역을 가린다. | [G38](<GOAL-SPECS/G38.md>) | 미대조 |
| <a id="r4-f037-o02"></a>R4-F037-O02 · 관찰 | 04 날짜 지우기 X는 입력 안, 모달 닫기 X는 카드 밖이다. 05/06 우측 Expiration Date는 녹색 링크이며 저장 표시는 상단 Changes Saved와 우하단 성공 토스트 두 위치다. | [G38](<GOAL-SPECS/G38.md>) | 미대조 |
| <a id="r4-f037-a01"></a>R4-F037-A01 · 남은 분석 | 날짜 입력·달력의 월요일 시작/선택/현재일 표식·겹침을 명세한다. 만료 해제와 과거 날짜·통지 실제 실행은 미수록이다. | [G38](<GOAL-SPECS/G38.md>) | 분석 대기 |

<a id="r4-f038"></a>
### F038 — Dashboard

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/ANALYSIS.md>) · Flow ID `a15f8066-29c2-457a-beea-e0e83b8d4dde` · [G72](<GOAL-SPECS/G72.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f038-o01"></a>R4-F038-O01 · 관찰 | 02 타임라인 팝오버는 흰 카드 안에 계약/인보이스 두 항목과 구분선, 상태·날짜·금액을 넣는다. 그래프 툴팁 04/07은 검은 배경으로 다른 변형이다. | [G72](<GOAL-SPECS/G72.md>) | 미대조 |
| <a id="r4-f038-o02"></a>R4-F038-O02 · 관찰 | 03 작업 한 행에는 체크박스·날짜·JD 아바타·말줄임이 있고 Activity는 녹색 작은 원과 세로선·회색 시간·View Email을 가진다. 완료 이벤트 두 개는 원본대로 반복된다. | [G72](<GOAL-SPECS/G72.md>) | 미대조 |
| <a id="r4-f038-o03"></a>R4-F038-O03 · 관찰 | 06~08 시간 막대는 어두운/옅은 회녹색을 사용하고 청구 시간/금액 합계만 녹색이다. 상단 Search는 스크롤 뒤 사라지지만 좌측 메뉴는 유지된다. | [G72](<GOAL-SPECS/G72.md>) | 미대조 |
| <a id="r4-f038-a01"></a>R4-F038-A01 · 남은 분석 | 차트 모양/축/툴팁과 모든 활동 문구·순서·중복을 fixture로 명세해야 한다. hover는 발생 방식 추정이며 팝오버가 표시된 사실과 구분한다. | [G72](<GOAL-SPECS/G72.md>) | 분석 대기 |

<a id="r4-f039"></a>
### F039 — Dashboard/Adding company details

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Adding company details/ANALYSIS.md>) · Flow ID `a346e78b-8075-4537-ae03-d377056d237a` · [G15](<GOAL-SPECS/G15.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f039-o01"></a>R4-F039-O01 · 관찰 | 01 온보딩은 왼쪽 번호/완료 체크·선택 배경, 오른쪽 단계별 아이콘/설명/주 CTA/Next Step/잎 장식으로 나뉜다. Hide는 카드 오른쪽 위다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f039-o02"></a>R4-F039-O02 · 관찰 | 04~05 주소 편집은 모달 안 회색 패널이며 City/Postal Code와 Country/Currency는 각각 한 행의 두 열이다. Save Address는 패널 내부, 전체 Save는 모달 하단으로 별도다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f039-o03"></a>R4-F039-O03 · 관찰 | 06 요약 주소는 녹색 다중행이고 입력에 있던 중복 도시/우편번호가 남는다. 08 단계1·2 완료 표시는 회사 정보와 팀 초대의 실제 완료 시점을 모두 증명하지 않는다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f039-a01"></a>R4-F039-A01 · 남은 분석 | 주소 편집/접힘·전체 모달 넘침·업로드 미리보기·두 저장 범위를 명세한다. Malaysia→Singapore와 USD 유지, 화면의 중복 주소를 임의 정규화하지 않는다. | [G15](<GOAL-SPECS/G15.md>) | 분석 대기 |

<a id="r4-f040"></a>
### F040 — Dashboard/Adding company details/Uploading company logo

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Adding company details/Uploading company logo/ANALYSIS.md>) · Flow ID `29e9a0b7-4ba1-4970-9790-08e7d46bc38e` · [G15](<GOAL-SPECS/G15.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f040-o01"></a>R4-F040-O01 · 관찰 | 01~02 Add An Image는 좁은 사각 안 두 줄 문구다. 03 이미지 내용이 없는 사각과 제거 X가 먼저 생기고 04에 베이지 로고가 보인다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f040-o02"></a>R4-F040-O02 · 관찰 | 전체 Save는 모든 단계에 남아 있으며 이 흐름의 끝은 로고가 보이는 모달이다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f040-a01"></a>R4-F040-A01 · 남은 분석 | 빈 사각을 확정된 업로드 성공 상태로 쓰지 않는다. 로딩 여부/시간·원본 로고 파일/해상도·업로드 실패/삭제 뒤 화면·전체 Save 결과는 미수록이다. | [G15](<GOAL-SPECS/G15.md>) | 분석 대기 |

<a id="r4-f041"></a>
### F041 — Dashboard/Adding income manually

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Adding income manually/ANALYSIS.md>) · Flow ID `5b74c74e-20d1-4811-8d96-864144e38a65` · [G67](<GOAL-SPECS/G67.md>) 01~11단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f041-o01"></a>R4-F041-O01 · 관찰 | 03~04 empty 안내는 완전히 빈 차트가 아니라 희미한 예시 그래프/숫자 위 중앙 문구·CTA다. Income 빈 상태 05는 두 문단 설명만 있는 테두리 카드로 다르다. | [G67](<GOAL-SPECS/G67.md>) | 미대조 |
| <a id="r4-f041-o02"></a>R4-F041-O02 · 관찰 | 06~09 모달은 Name+Amount/통화/Date를 왼쪽, 세전/세후 설명을 오른쪽 옅은 박스에 둔다. 08 달력은 일요일부터 시작하며 모달 아래까지 넘친다. | [G67](<GOAL-SPECS/G67.md>) | 미대조 |
| <a id="r4-f041-o03"></a>R4-F041-O03 · 관찰 | 10 성공 목록은 금액 녹색·세금 Pre-Tax·반복 형태 아이콘을 포함한다. 11 대시보드로 바뀌며 온보딩/체험 배너가 보이지 않지만 제거 원인은 캡처만으로 확정할 수 없다. | [G67](<GOAL-SPECS/G67.md>) | 미대조 |
| <a id="r4-f041-a01"></a>R4-F041-A01 · 남은 분석 | 계약 만료 달력의 월요일 시작과 수입 달력의 일요일 시작을 무조건 통일하지 않는다. 달력별 변형·empty 배경·세금 설명 원문을 명세한다. | [G67](<GOAL-SPECS/G67.md>) | 분석 대기 |

<a id="r4-f042"></a>
### F042 — Dashboard/Connecting to Google Calendar

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/ANALYSIS.md>) · Flow ID `eb3647ee-e2ea-4435-bdf6-291ebd62f550` · [G49](<GOAL-SPECS/G49.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f042-o01"></a>R4-F042-O01 · 관찰 | 03~04 제공자 타일은 2열 2행과 마지막 전체폭 Outlook.com으로 구성된다. Google만 녹색 외곽이 생긴다. | [G49](<GOAL-SPECS/G49.md>) | 미대조 |
| <a id="r4-f042-o02"></a>R4-F042-O02 · 관찰 | 05~06 Cronofy는 앱 셸 없는 독립 페이지로 Bonsai 로고/Google 워드마크/파란 약관 링크/동의 체크/녹색 버튼/Powered by Cronofy를 세로 배치한다. 동의 체크는 파란색이다. | [G49](<GOAL-SPECS/G49.md>) | 미대조 |
| <a id="r4-f042-o03"></a>R4-F042-O03 · 관찰 | 07 예약 2열의 빈 상태는 왼쪽 테두리 카드와 오른쪽 가로 구분선 형태로 다르다. 08 생성 마법사는 앱 사이드바 없는 전체 화면이고 상단 Cancel/Continue다. | [G49](<GOAL-SPECS/G49.md>) | 미대조 |
| <a id="r4-f042-a01"></a>R4-F042-A01 · 남은 분석 | 외부 동의 화면 폰트/체크/브랜드 자산을 앱 공통 UI로 치환하지 않는다. Google 로그인/권한 세부 단계·다른 제공자 연결은 원본 미수록이다. | [G49](<GOAL-SPECS/G49.md>) | 분석 대기 |

<a id="r4-f043"></a>
### F043 — Dashboard/Connecting to Google Calendar/Adding event details

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Adding event details/ANALYSIS.md>) · Flow ID `4e44dbea-bf16-4dbf-a350-472b1b419248` · [G50](<GOAL-SPECS/G50.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f043-o01"></a>R4-F043-O01 · 관찰 | 02 Event Link는 고정 계정 URL 문자열과 오른쪽 slug 입력으로 분리된다. 캘린더에는 Google 아이콘·이메일, Event Link/Calendar 레이블에는 정보 아이콘이 있다. | [G50](<GOAL-SPECS/G50.md>) | 미대조 |
| <a id="r4-f043-o02"></a>R4-F043-O02 · 관찰 | 04 로딩은 Included calendars의 작은 회전 표시와 회색 주간 그리드 중앙의 큰 표시 두 곳이다. 05 All 칩·+·범례와 시간대 선택이 드러나고 그리드 왼쪽 위/아래 이동 화살표가 있다. | [G50](<GOAL-SPECS/G50.md>) | 미대조 |
| <a id="r4-f043-a01"></a>R4-F043-A01 · 남은 분석 | 입력 폭/그리드 선·가용색·주말 공백·내부 스크롤을 명세한다. 로딩 회색을 예약 불가 시간으로 구현하지 않는다. | [G50](<GOAL-SPECS/G50.md>) | 분석 대기 |

<a id="r4-f044"></a>
### F044 — Dashboard/Connecting to Google Calendar/Editing advanced settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing advanced settings/ANALYSIS.md>) · Flow ID `dc6c28b1-c2c2-4118-9358-3578b336031e` · [G51](<GOAL-SPECS/G51.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f044-o01"></a>R4-F044-O01 · 관찰 | 01~03 버퍼의 체크박스와 숫자/단위는 한 행이며 꺼진 필드는 흐리다. 03 After event만 진한 값·녹색 체크로 바뀐다. | [G51](<GOAL-SPECS/G51.md>) | 미대조 |
| <a id="r4-f044-o02"></a>R4-F044-O02 · 관찰 | 04 추가 질문을 켜면 설명/답변 예시 입력이 생기면서 Send Reminders 섹션이 아래로 밀린다. 리마인더 삭제는 작은 빨간 X, 추가는 녹색 + Add Reminder다. | [G51](<GOAL-SPECS/G51.md>) | 미대조 |
| <a id="r4-f044-a01"></a>R4-F044-A01 · 남은 분석 | 조건부 섹션 높이·off 필드 스타일·정보 아이콘·반복 알림 행을 명세한다. 질문 미리보기를 관리자의 답변 입력으로 오해하지 않도록 한다. | [G51](<GOAL-SPECS/G51.md>) | 분석 대기 |

<a id="r4-f045"></a>
### F045 — Dashboard/Connecting to Google Calendar/Editing an event type

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing an event type/ANALYSIS.md>) · Flow ID `b126bdbf-4f4f-455e-b62a-b9413b8fb7e7` · [G52](<GOAL-SPECS/G52.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f045-o01"></a>R4-F045-O01 · 관찰 | 02 메뉴는 유형 카드 우측 아래에 뜨며 목록에 이미 있던 View Booking Page/Copy Link를 다시 포함한다. Delete도 검은 글자로 보인다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f045-o02"></a>R4-F045-O02 · 관찰 | 03~04 편집의 왼쪽 목록은 번호 없는 섹션이고 생성 마법사의 단계 번호·Continue 대신 Close/Save Changes다. 확인메일 체크만 바뀌며 설명과 URL은 유지된다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f045-a01"></a>R4-F045-A01 · 남은 분석 | 생성/편집 셸·단계 이동/전체 저장 차이를 명세한다. 체크 해제 후 실제 고객에게 메일이 발송되지 않았는지는 원본으로 확인할 수 없다. | [G52](<GOAL-SPECS/G52.md>) | 분석 대기 |

<a id="r4-f046"></a>
### F046 — Dashboard/Connecting to Google Calendar/Editing branding & design

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing branding & design/ANALYSIS.md>) · Flow ID `d9ed6982-0264-44ed-bb1a-82ad16b0e89f` · [G51](<GOAL-SPECS/G51.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f046-o01"></a>R4-F046-O01 · 관찰 | 02 테마 각 행에는 이름과 두 색상 점이 있고 03 강조 행은 Sunrise지만 선택 필드는 Standard다. 04 적용 후 이름/두 점/오른쪽 도식이 함께 바뀐다. | [G51](<GOAL-SPECS/G51.md>) | 미대조 |
| <a id="r4-f046-o02"></a>R4-F046-O02 · 관찰 | 06~07 업로드 진행 막대는 버튼 내부 오른쪽에 짧게 있고 08에는 파일명+빨간 X와 별도 썸네일로 바뀐다. 09 성공은 전체 화면 중앙의 달력/체크 삽화·링크/외부 열기 버튼이다. | [G51](<GOAL-SPECS/G51.md>) | 미대조 |
| <a id="r4-f046-a01"></a>R4-F046-A01 · 남은 분석 | 드롭다운 강조와 실제 선택을 구분하고 7개 테마 표본·진행 막대·성공 삽화를 자산/색 명세로 연결한다. Custom Theme 편집과 Branding on 결과는 미수록이다. | [G51](<GOAL-SPECS/G51.md>) | 분석 대기 |

<a id="r4-f047"></a>
### F047 — Dashboard/Connecting to Google Calendar/Setting up availability

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Setting up availability/ANALYSIS.md>) · Flow ID `5da62684-3be7-48ac-923f-4fdf585d7db1` · [G50](<GOAL-SPECS/G50.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f047-o01"></a>R4-F047-O01 · 관찰 | 02 캘린더 메뉴에는 회색 Google 계정 머리글과 3개 체크 행이 있다. 03 All 칩 대신 이메일의 초록 칩+흰 X가 생긴다. | [G50](<GOAL-SPECS/G50.md>) | 미대조 |
| <a id="r4-f047-o02"></a>R4-F047-O02 · 관찰 | 04~06 특정 30분 칸만 더 짙은 색/X가 보이고 시간 툴팁은 검은색이다. 07 최종 흰 제외 칸은 월/수/금의 동일 높이에 있고 화/목 가용 영역은 연속이다. | [G50](<GOAL-SPECS/G50.md>) | 미대조 |
| <a id="r4-f047-a01"></a>R4-F047-A01 · 남은 분석 | 30분 행 높이·시간 눈금·제외 칸/강조/X·선택 캘린더 칩을 명세한다. 드래그로 범위 생성/되돌리기/시간대 변경 결과는 미수록이다. | [G50](<GOAL-SPECS/G50.md>) | 분석 대기 |

<a id="r4-f048"></a>
### F048 — Dashboard/Connecting to Google Calendar/View booking page

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/View booking page/ANALYSIS.md>) · Flow ID `dfb2447e-8490-4b16-aeff-edd8101fb0ac` · [G53](<GOAL-SPECS/G53.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f048-o01"></a>R4-F048-O01 · 관찰 | 02~04 공개 예약은 연회색 바탕 안 3열 카드다. 왼쪽 민트 정보 패널·중앙 달력/하단 시간대·오른쪽 시간 슬롯 목록으로 구성되고 앱 도움말/셸은 없다. | [G53](<GOAL-SPECS/G53.md>) | 미대조 |
| <a id="r4-f048-o02"></a>R4-F048-O02 · 관찰 | 03~04 예약 가능 날짜는 민트 테두리, 선택일은 민트 채움이다. 슬롯은 테두리의 가로 버튼이며 목록 하단이 잘려 내부 스크롤 영역임을 시사한다. 02는 로고가 없고 로딩 두 곳이 있다. | [G53](<GOAL-SPECS/G53.md>) | 미대조 |
| <a id="r4-f048-a01"></a>R4-F048-A01 · 남은 분석 | Sky 색·3열 폭·달력/슬롯 스크롤과 로고 자산을 명세한다. 금요일/목요일 차이는 관찰되지만 슬롯 클릭 뒤 이름/이메일/질문·예약 완료 화면은 이 흐름에 없다. | [G53](<GOAL-SPECS/G53.md>) | 분석 대기 |

<a id="r4-f049"></a>
### F049 — Dashboard/Create a contact form (template)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/ANALYSIS.md>) · Flow ID `be21a04b-0006-4c0c-86bd-4a536d9e7c71` · [G44](<GOAL-SPECS/G44.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f049-o01"></a>R4-F049-O01 · 관찰 | 03 New Form의 두 카드에는 큰 +와 문서 아이콘, 굵은 제목, 짧은 설명이 있다. 일반 텍스트 버튼 두 개로 대체하면 원본 형태가 달라진다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f049-o02"></a>R4-F049-O02 · 관찰 | 04 로딩 중에도 Blank Form 아이콘·모든 카드 이름/Use Template·분류 숫자는 보이고 다른 썸네일만 회색이다. 05에서 각 썸네일 배경/폼 미리보기가 채워진다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f049-a01"></a>R4-F049-A01 · 남은 분석 | 로딩을 화면 전체 스피너로 통일하지 않는다. 카드별 썸네일/축약 제목·12카드 그리드·카테고리 개수와 포함 관계를 명세해야 한다. | [G44](<GOAL-SPECS/G44.md>) | 분석 대기 |

<a id="r4-f050"></a>
### F050 — Dashboard/Create a contact form (template)/Filtering contact templates

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Filtering contact templates/ANALYSIS.md>) · Flow ID `71620f3c-7759-4c18-8fa3-164e3d3e2256` · [G44](<GOAL-SPECS/G44.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f050-o01"></a>R4-F050-O01 · 관찰 | 02 페이지2에는 Blank Form이 다시 첫 카드이며 페이지네이션은 1/2/3/…/7/8/9로 보인다. 03 Type→Industry는 탭 밑줄·분류명/개수 목록을 함께 바꾼다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f050-o02"></a>R4-F050-O02 · 관찰 | 04 Design 10은 Blank Form을 제외한 수이며 마지막 행은 두 카드다. 긴 이름은 말줄임으로 자른다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f050-a01"></a>R4-F050-A01 · 남은 분석 | 빈 폼 고정 카드·검색/분류/페이지 상호작용과 카드 목록별 자산/정렬을 별도 명세한다. 모든 카테고리 합을 전체 개수와 같게 강제하지 않는다. | [G44](<GOAL-SPECS/G44.md>) | 분석 대기 |

<a id="r4-f051"></a>
### F051 — Dashboard/Create a contact form (template)/Searching templates

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Searching templates/ANALYSIS.md>) · Flow ID `b3dc7ca0-f03d-4a87-b0e2-84c08aa27400` · [G44](<GOAL-SPECS/G44.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f051-o01"></a>R4-F051-O01 · 관찰 | 02 Type All Templates로 표시되지만 디자인 카드들이 남아 있다. 03 application 결과에도 Blank Form과 Client Application 두 카드가 있고 왼쪽 실제 결과 수는 1이다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f051-o02"></a>R4-F051-O02 · 관찰 | 03 빈 분류는 사라지고 All Templates/Client Onboarding/Client Intake 세 행만 남으며 각각 1로 보인다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f051-a01"></a>R4-F051-A01 · 남은 분석 | 02를 정상 초기 전체 목록으로 확정하지 않는다. 검색어 제거/결과없음·검색 지연 방식은 미수록이며 결과1과 카드2를 같은 수로 처리하지 않는다. | [G44](<GOAL-SPECS/G44.md>) | 분석 대기 |

<a id="r4-f052"></a>
### F052 — Dashboard/Create a contact form (template)/Using a template

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Create a contact form (template)/Using a template/ANALYSIS.md>) · Flow ID `0888ad18-25b5-43aa-be17-ae21f1859ea0` · [G44](<GOAL-SPECS/G44.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f052-o01"></a>R4-F052-O01 · 관찰 | 02 Graphic Design Brief 카드의 그림자와 썸네일 위 Preview 링크는 Use Template과 별도다. 03 공용 미리보기에는 이름 옆 정보 아이콘, 기본 연락처 입력과 별표 업무 질문이 구분된다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f052-o02"></a>R4-F052-O02 · 관찰 | 04 상단 얇은 초록 진행선이 생긴다. 05 편집기에는 공용 미리보기에 없던 Add An Image와 오른쪽 패널 접기 화살표가 있다. | [G44](<GOAL-SPECS/G44.md>) | 미대조 |
| <a id="r4-f052-a01"></a>R4-F052-A01 · 남은 분석 | 공용 미리보기·처리중·편집기를 각각 명세한다. 작은 폼 썸네일만으로 전체 문항/유효성 검증이 완결됐다고 보지 않는다. | [G44](<GOAL-SPECS/G44.md>) | 분석 대기 |

<a id="r4-f053"></a>
### F053 — Dashboard/Hiding sidebar

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Hiding sidebar/ANALYSIS.md>) · Flow ID `ff646f32-f010-478e-a3bd-572ccc501292` · [G14](<GOAL-SPECS/G14.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f053-o01"></a>R4-F053-O01 · 관찰 | 02 로고 오른쪽 축소 제어가 보이고 03에는 작은 Bonsai 심볼과 아이콘 레일·섹션 구분선·하단 초대/선물만 남는다. | [G14](<GOAL-SPECS/G14.md>) | 미대조 |
| <a id="r4-f053-o02"></a>R4-F053-O02 · 관찰 | 03 레일 폭만 줄어드는 것이 아니라 타임라인/그래프·오른쪽 카드가 넓어진 본문에 다시 배치된다. 상단 Search도 왼쪽으로 이동한다. | [G14](<GOAL-SPECS/G14.md>) | 미대조 |
| <a id="r4-f053-a01"></a>R4-F053-A01 · 남은 분석 | 확장/축소 폭·본문 재배치·아이콘 간격을 수치화해야 한다. 다시 펼치기/툴팁/저장 지속성은 미수록이다. | [G14](<GOAL-SPECS/G14.md>) | 분석 대기 |

<a id="r4-f054"></a>
### F054 — Dashboard/Marking a task as complete

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Dashboard/Marking a task as complete/ANALYSIS.md>) · Flow ID `4b420645-a17a-4219-9699-5f8081649f02` · [G28](<GOAL-SPECS/G28.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f054-o01"></a>R4-F054-O01 · 관찰 | 02 완료된 Design Proposal은 목록에 남아 녹색 체크/취소선/아바타로 표시된다. Due today 보조 문구와 말줄임도 유지된다. | [G28](<GOAL-SPECS/G28.md>) | 미대조 |
| <a id="r4-f054-o02"></a>R4-F054-O02 · 관찰 | 01→02 시간 그래프 막대와 미청구 시간/금액도 달라진다. 작업 완료에 의해 2시간이 자동 추가됐다는 동작으로 해석하지 않는다. | [G28](<GOAL-SPECS/G28.md>) | 미대조 |
| <a id="r4-f054-a01"></a>R4-F054-A01 · 남은 분석 | 체크 전/후 행 스타일·완료된 행의 잔류·주변 지표 snapshot 차이를 명세한다. 완료 취소/새로고침 뒤 목록 정책은 미수록이다. | [G28](<GOAL-SPECS/G28.md>) | 분석 대기 |

<a id="r4-f055"></a>
### F055 — Filtering all templates

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Filtering all templates/ANALYSIS.md>) · Flow ID `89d6f212-12fc-4ad4-b11c-0bbd29708101` · [G06](<GOAL-SPECS/G06.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f055-o01"></a>R4-F055-O01 · 관찰 | 공개 템플릿 카드는 위로 돌출한 문서 썸네일과 아래 둥근 카드 본체가 겹친 형태다. 앱 내부 템플릿 선택기의 평평한 카드와 다르다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f055-o02"></a>R4-F055-O02 · 관찰 | 01~02 인보이스 제목에 Task management 라벨이 보이며 일부 썸네일은 없다. 03 Agreements/04 Quotes는 선택 pill과 카드 아이콘/라벨이 함께 변한다. 05에서는 상단 문서유형 줄도 화면 밖이다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f055-a01"></a>R4-F055-A01 · 남은 분석 | 공개/내부 템플릿의 서로 다른 카드 구조·그림자·썸네일 누락 상태를 명세한다. 화면의 어색한 라벨을 추측으로 수정하지 않는다. | [G06](<GOAL-SPECS/G06.md>) | 분석 대기 |

<a id="r4-f056"></a>
### F056 — Filtering all templates/Template detail

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/ANALYSIS.md>) · Flow ID `4fe6aa73-a216-43cb-87ff-be898ffc869c` · [G06](<GOAL-SPECS/G06.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f056-o01"></a>R4-F056-O01 · 관찰 | 02 상세 헤더는 로고/Get template만 남고 문서 제목은 두 줄 중앙 정렬이다. 03 평가 로고·별·숫자·가운데 구분선을 포함한다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f056-o02"></a>R4-F056-O02 · 관찰 | 03~05 하단 고정 바는 종이비행기 아이콘/템플릿별 문구/이메일+Customize 복합 pill이고 본문 일부를 가린다. 05 FAQ는 답변이 모두 보이는 텍스트이며 하단 No items found도 보인다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f056-a01"></a>R4-F056-A01 · 남은 분석 | 전체 기사 원문/문서 미리보기·평가 자산·목차/고정 CTA 위치를 명세한다. Get template 이후 가입/복제 결과와 미수록 중간 본문은 별도 근거가 필요하다. | [G06](<GOAL-SPECS/G06.md>) | 분석 대기 |

<a id="r4-f057"></a>
### F057 — Forms

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/ANALYSIS.md>) · Flow ID `d265eece-4da9-4fd4-91f3-517dc07cd8d5` · [G45](<GOAL-SPECS/G45.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f057-o01"></a>R4-F057-O01 · 관찰 | 02: Forms 목록 본문은 왼쪽 정보 아이콘이 있는 Learn More와 오른쪽 New Form 버튼을 사용하며, 목록 검색·필터 입력은 보이지 않는다. 전역 상단 Search와 구분한다. 열은 Title / # Responses / # Questions / Created이고 행 끝에 더보기 버튼이 있다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f057-o02"></a>R4-F057-O02 · 관찰 | 02: Graphic Design Brief 행의 0 Response, 9 Questions, Feb 1 2024를 그대로 보존한다. 아래 넓은 빈 영역과 Forms 사이드바 선택 상태도 목록 구성에 포함된다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f057-a01"></a>R4-F057-A01 · 남은 분석 | 목록 열 너비·글꼴·행 높이와 버튼 치수는 별도 측정이 필요하다. 9 Questions가 연락처 필드를 포함하는지는 캡처만으로 확정할 수 없고, 행 메뉴·빈 목록·다수 행 상태도 미확인이다. | [G45](<GOAL-SPECS/G45.md>) | 분석 대기 |

<a id="r4-f058"></a>
### F058 — Forms/Adding questions to a form

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Adding questions to a form/ANALYSIS.md>) · Flow ID `0452bfda-8ddd-4d2f-8314-7370006c6c68` · [G45](<GOAL-SPECS/G45.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f058-o01"></a>R4-F058-O01 · 관찰 | 01–05: 오른쪽 Content 패널에는 스크롤로 드러나는 Phone Number를 포함해 13개 질문 유형이 있다. 화면에 12개만 보이는 단계와 전체 유형 수를 혼동하지 않는다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f058-o02"></a>R4-F058-O02 · 관찰 | 02→03: Short Text 타일 선택 테두리와 새 질문이 보이는 단계는 구분된다. 질문 옆 세로 도구 모음은 설정·위로·아래로·빨간 삭제 아이콘이고 패널 접기 화살표는 별도 위치다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f058-o03"></a>R4-F058-O03 · 관찰 | 03–05: 추가 질문 제목과 답변 영역, 너비가 더 좁고 달력 아이콘이 있는 날짜 입력을 구분한다. 아래 중앙 Submit은 편집기 안에 보이는 폼 구성이다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f058-a01"></a>R4-F058-A01 · 남은 분석 | 13개 유형의 아이콘·선택 스타일과 질문 도구 모음의 표시 조건을 명세해야 한다. 필수 설정, 날짜 선택기 열림, 삭제 결과와 처음/마지막 질문의 이동 제한은 원본에 없다. | [G45](<GOAL-SPECS/G45.md>) | 분석 대기 |

<a id="r4-f059"></a>
### F059 — Forms/Form responses

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Form responses/ANALYSIS.md>) · Flow ID `ecd1821a-aa3a-40f6-beff-71e924dfb56f` · [G46](<GOAL-SPECS/G46.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f059-o01"></a>R4-F059-O01 · 관찰 | 02: Settings 패널에는 배경 파일 표시와 삭제, 로고 표시·정렬, 제목 정렬, Arial 선택, 다섯 색상 입력, Submit 정렬, CAPTCHA 설정이 함께 있다. 색상 값과 실제 색상 적용 영역을 구분해야 한다. | [G46](<GOAL-SPECS/G46.md>) | 미대조 |
| <a id="r4-f059-o02"></a>R4-F059-O02 · 관찰 | 02→03: Please fix the errors below.는 흰 폼 카드 상단의 가느다란 연한 빨강 오류 영역이다. 사라진 뒤 내용의 세로 위치도 바뀐다. | [G46](<GOAL-SPECS/G46.md>) | 미대조 |
| <a id="r4-f059-o03"></a>R4-F059-O03 · 관찰 | 04→05: 빈 Responses 화면은 편집기의 오른쪽 패널 없이 중앙 아이콘·제목·설명·Share Your Form을 보인다. 데이터가 있는 화면은 Date / Name / Email 표와 행 메뉴로 바뀌며, 이름 대신 이메일이 표시되는 행도 있다. | [G46](<GOAL-SPECS/G46.md>) | 미대조 |
| <a id="r4-f059-a01"></a>R4-F059-A01 · 남은 분석 | 오류를 발생·해제한 구체적인 입력과 응답 0→2가 된 과정은 캡처에 없다. 잘린 배경 파일명은 추정해서 채우지 않으며, 설정 제어의 실제 크기·색상·간격을 추가 측정해야 한다. | [G46](<GOAL-SPECS/G46.md>) | 분석 대기 |

<a id="r4-f060"></a>
### F060 — Forms/Form responses/Giving a response

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Form responses/Giving a response/ANALYSIS.md>) · Flow ID `b3f0ee03-c692-4960-8ed0-a8e15c1b4def` · [G48](<GOAL-SPECS/G48.md>) 01~09단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f060-o01"></a>R4-F060-O01 · 관찰 | 01: 공개 응답 화면은 앱 내비게이션 없이 배경·흰 카드·중앙 로고·왼쪽 제목으로 구성된다. First Name / Last Name / Email의 검은 필수 별표는 편집기 표시와 별도로 기록한다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f060-o02"></a>R4-F060-O02 · 관찰 | 03–06: 선택 체크박스와 라디오는 어두운 색이고 Submit은 초록이다. 파일 업로드는 넓은 외곽선 버튼이며 날짜 입력은 다른 전체 너비 입력보다 좁다. 아래 Powered by bonsai 영역도 원본 범위다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f060-o03"></a>R4-F060-O03 · 관찰 | 07→08: 예산 입력의 빨간 테두리·바로 아래 오류와 Submit 아래 전체 오류가 함께 나타난다. 200 입력 직후에도 오류가 남아 있으므로 입력 즉시 해제된다고 가정하지 않는다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f060-o04"></a>R4-F060-O04 · 관찰 | 09: 완료 화면은 초록 체크와 감사 문구 외에 이메일이 채워진 가입 안내 카드와 Continue, 하단 브랜드 표시를 포함한다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f060-a01"></a>R4-F060-A01 · 남은 분석 | 공개 폼과 편집기 필수 표시·색상·검증 시점을 별도로 명세해야 한다. Amanda Soh 입력과 다른 플로우의 Jane Studio 응답을 동일 고객 변경 과정으로 단정할 수 없다. 캡처 사이에 생략된 검증·전송 동작은 미확인이다. | [G48](<GOAL-SPECS/G48.md>) | 분석 대기 |

<a id="r4-f061"></a>
### F061 — Forms/Form responses/Response detail

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Form responses/Response detail/ANALYSIS.md>) · Flow ID `31b9d879-ab36-4255-a0e5-34cc4266ce9c` · [G48](<GOAL-SPECS/G48.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f061-o01"></a>R4-F061-O01 · 관찰 | 02: 행 메뉴의 View Response / View Client / Delete Response를 구분한다. Delete Response 텍스트는 이 원본에서 검정이며 다른 화면의 빨간 삭제 스타일을 적용하면 안 된다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f061-o02"></a>R4-F061-O02 · 관찰 | 03–04: 긴 응답 모달은 제목과 이전·다음 화살표, 외부 닫기 버튼을 가지며 내부를 스크롤한다. 질문은 굵게, 빈 답변은 -, 다중 선택·결제 답변은 글머리표로 표시되고 예산 200은 통화 형식이 아니다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f061-o03"></a>R4-F061-O03 · 관찰 | 04: 하단에는 프린터 아이콘이 있는 외곽선 Print 버튼이 있다. 응답 상세의 Jane Studio를 공개 입력 화면의 Amanda Soh와 같은 이름으로 정규화하지 않는다. | [G48](<GOAL-SPECS/G48.md>) | 미대조 |
| <a id="r4-f061-a01"></a>R4-F061-A01 · 남은 분석 | 모달 치수·스크롤 범위·이전/다음 비활성 표현과 인쇄 결과를 보완해야 한다. 삭제·고객 이동·다른 응답 이동의 결과 화면은 관찰되지 않았다. | [G48](<GOAL-SPECS/G48.md>) | 분석 대기 |

<a id="r4-f062"></a>
### F062 — Forms/Reordering questions

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Reordering questions/ANALYSIS.md>) · Flow ID `68ec72c2-b771-428b-98b7-256018628743` · [G45](<GOAL-SPECS/G45.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f062-o01"></a>R4-F062-O01 · 관찰 | 01–03: 질문 옆 도구 모음과 오른쪽 Content 패널 접기 화살표는 서로 다른 제어다. 도구 모음은 설정·이동 화살표·빨간 삭제로 구성된다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f062-o02"></a>R4-F062-O02 · 관찰 | 02→03: 날짜 질문이 추가 문의 질문 위로 이동하며 질문 값과 입력 유형은 유지된다. Submit은 두 질문 아래에 남는다. Phone Number가 보이지 않는 단계는 패널 스크롤 위치 차이로 전체 유형 삭제를 뜻하지 않는다. | [G45](<GOAL-SPECS/G45.md>) | 미대조 |
| <a id="r4-f062-a01"></a>R4-F062-A01 · 남은 분석 | 순서 변경을 일으킨 정확한 클릭·드래그·키보드 동작과 저장 시점은 캡처로 확정할 수 없다. 도구 모음 위치·크기·표시 조건을 별도로 정의해야 한다. | [G45](<GOAL-SPECS/G45.md>) | 분석 대기 |

<a id="r4-f063"></a>
### F063 — Forms/Sharing a form

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Forms/Sharing a form/ANALYSIS.md>) · Flow ID `93ea3af8-3cce-49ec-aaa0-b7d4e9676924` · [G47](<GOAL-SPECS/G47.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f063-o01"></a>R4-F063-O01 · 관찰 | 02–07: 공유 모달은 탭별로 높이와 본문이 달라지고 외부 X 및 아래 Contact Support가 함께 표시된다. Public Link와 Embed Code는 코드/링크 복사 제어의 구성도 다르다. | [G47](<GOAL-SPECS/G47.md>) | 미대조 |
| <a id="r4-f063-o02"></a>R4-F063-O02 · 관찰 | 03–05: Your link has been copied. 토스트가 다른 탭에서도 남아 있다. 이를 각 탭의 새 복사 성공으로 해석하지 않는다. | [G47](<GOAL-SPECS/G47.md>) | 미대조 |
| <a id="r4-f063-o03"></a>R4-F063-O03 · 관찰 | 05→06: 고객 선택 뒤 Project(Optional)이 추가되어 모달이 길어진다. 08의 로고 출현은 이메일 발송 자체의 효과로 단정할 수 없다. | [G47](<GOAL-SPECS/G47.md>) | 미대조 |
| <a id="r4-f063-a01"></a>R4-F063-A01 · 남은 분석 | 탭별 모달 치수·코드 줄바꿈·URL 잘림·외부 지원 링크 위치가 필요하다. Hide header 변경 결과, 임베드 실행, 발송 실패와 로고 업로드 과정은 미확인이다. | [G47](<GOAL-SPECS/G47.md>) | 분석 대기 |

<a id="r4-f064"></a>
### F064 — Freelancers

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Freelancers/ANALYSIS.md>) · Flow ID `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54` · [G03](<GOAL-SPECS/G03.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f064-o01"></a>R4-F064-O01 · 관찰 | 01: 플로우 이름 Freelancers와 달리 원본 제목과 보조 내비게이션 내용은 Small business다. 인물 사진·잎 장식·수금/폼 배지·평점 로고를 함께 재현해야 한다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f064-o02"></a>R4-F064-O02 · 관찰 | 02–04: 후기 카드와 계약 목업 뒤 기사 목록은 3열이며 하단 Next는 목록 폭에 가까운 넓은 버튼이다. 헤더의 Log in/Start free가 뒤 캡처에서 Go to dashboard로 바뀐다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·구현 보완(주요 구성); 시각 대기 |
| <a id="r4-f064-a01"></a>R4-F064-A01 · 남은 분석 | 캡처 사이 생략된 페이지 중간 구간을 완전한 섹션 목록으로 간주할 수 없다. 사진·장식·기사 썸네일 자산과 헤더 상태 변화 원인을 별도로 확인해야 한다. | [G03](<GOAL-SPECS/G03.md>) | 분석 대기 |

<a id="r4-f065"></a>
### F065 — Help Center

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Help Center/ANALYSIS.md>) · Flow ID `4f8c359f-2e1f-46bd-953b-bd601767a0f1` · [G08](<GOAL-SPECS/G08.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f065-o01"></a>R4-F065-O01 · 관찰 | 01: 잎 배경의 검색 헤더, 테두리로 묶인 Popular Articles 3열, 2열 컬렉션 카드가 서로 다른 영역이다. 앱 사이드바나 앱 도움말 버튼은 없다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f065-o02"></a>R4-F065-O02 · 관찰 | 02: 마지막 컬렉션 아래 여백 뒤 로고·Bonsai 2024·세 개 푸터 링크가 중앙에 배치된다. 문서 수는 원본 시점 값이다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f065-a01"></a>R4-F065-A01 · 남은 분석 | 상단과 하단 사이에 생략된 컬렉션은 이 두 캡처만으로 전부 열거할 수 없다. 검색 결과·언어 변경·카드 hover와 배경/아이콘 자산 명세가 필요하다. | [G08](<GOAL-SPECS/G08.md>) | 분석 대기 |

<a id="r4-f066"></a>
### F066 — Help Center/Help article detail

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Help Center/Help article detail/ANALYSIS.md>) · Flow ID `ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf` · [G08](<GOAL-SPECS/G08.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f066-o01"></a>R4-F066-O01 · 관찰 | 01: 첫 인기 문서의 연녹색 배경·초록 글씨 강조가 관찰된다. hover/focus 중 어느 입력으로 발생했는지는 미확인이다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f066-o02"></a>R4-F066-O02 · 관찰 | 02–04: 본문 오른쪽 목차는 세로 선과 활성 항목을 표시하며 본문 스크롤 위치에 따라 활성 항목이 달라진다. 삽입된 영상·설정 이미지는 현재 페이지의 실제 입력 제어가 아니다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f066-o03"></a>R4-F066-O03 · 관찰 | 04: 관련 문서 다섯 행의 초록 화살표와 아래 회색 평가 카드·세 이모지도 화면 요소에 포함된다. | [G08](<GOAL-SPECS/G08.md>) | 미대조 |
| <a id="r4-f066-a01"></a>R4-F066-A01 · 남은 분석 | 목차 이동/스크롤 동작과 평가 전송 결과는 관찰되지 않았다. 본문 전체 문구·영상 포스터·삽입 이미지와 목차 폭/고정 위치를 별도 명세해야 한다. | [G08](<GOAL-SPECS/G08.md>) | 분석 대기 |

<a id="r4-f067"></a>
### F067 — Industries (Consulting)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Industries (Consulting)/ANALYSIS.md>) · Flow ID `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` · [G03](<GOAL-SPECS/G03.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f067-o01"></a>R4-F067-O01 · 관찰 | 01–02: Industries 메뉴는 네 열이며 헤더 아래를 크게 덮고 배경 hero는 일부 남는다. Consulting hero의 이메일 입력과 Start free는 하나의 둥근 영역에 배치된다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f067-o02"></a>R4-F067-O02 · 관찰 | 03·06–08: 소개용 제품 목업 내부 버튼·차트·입력은 공개 페이지의 실제 조작 요소와 구분한다. 잎/등고선 장식과 브라우저 모양 테두리도 재현 대상이다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f067-o03"></a>R4-F067-O03 · 관찰 | 04: Task management 설명이 반복 청구이고 Time tracking 제목이 두 번 등장하는 원본 불일치를 임의로 고치지 않는다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f067-a01"></a>R4-F067-A01 · 남은 분석 | 메가 메뉴 진입 방식·닫힘·CTA 전환 결과는 캡처에 없다. 인물·후기·목업 자산과 부분만 보인 구간 사이의 내용은 추가 근거가 필요하다. | [G03](<GOAL-SPECS/G03.md>) | 분석 대기 |

<a id="r4-f068"></a>
### F068 — Inviting a member

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Inviting a member/ANALYSIS.md>) · Flow ID `646bd9c2-add0-414c-8b98-89489f2c43b5` · [G17](<GOAL-SPECS/G17.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f068-o01"></a>R4-F068-O01 · 관찰 | 02–04: 입력 전 Invite Team Member와 역할 선택 후 Invite Collaborator는 문구와 색상이 달라진다. Projects는 선택 chip·개별 삭제·전체 지우기·드롭다운 제어를 구분한다. | [G17](<GOAL-SPECS/G17.md>) | 미대조 |
| <a id="r4-f068-o02"></a>R4-F068-O02 · 관찰 | 02에는 외부 닫기 X가 보이지 않고 03–04에는 보인다. 05의 표는 Owner/Partner/Collaborator별 색상 배지와 All Projects/1 Project, Invite Pending을 별도 열에 표시한다. | [G17](<GOAL-SPECS/G17.md>) | 미대조 |
| <a id="r4-f068-a01"></a>R4-F068-A01 · 남은 분석 | 연한 버튼의 실제 disabled 여부와 역할별 필수 조건은 색상만으로 확정하지 않는다. 역할 옵션·복수 프로젝트·중복 초대 오류 및 모달/표 치수는 미확인이다. | [G17](<GOAL-SPECS/G17.md>) | 분석 대기 |

<a id="r4-f069"></a>
### F069 — Invoice templates

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoice templates/ANALYSIS.md>) · Flow ID `a0181c28-2521-46d3-a0e6-3ead4851b2f9` · [G06](<GOAL-SPECS/G06.md>) 01~11단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f069-o01"></a>R4-F069-O01 · 관찰 | 01→02: Templates 메뉴는 왼쪽 문서 유형과 오른쪽 두 열 추천 목록으로 구성되고 활성 유형의 연녹색 배경·오른쪽 화살표가 이동한다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f069-o02"></a>R4-F069-O02 · 관찰 | 03–11: hero, 두 열 설명, 세 열 다운로드 카드, 좌우 교차 템플릿 소개, 장점 카드, Pros/Cons가 서로 다른 구성이다. 파일 형식 링크 묶음과 앱 가입 버튼을 같은 동작으로 처리하지 않는다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f069-o03"></a>R4-F069-O03 · 관찰 | 09의 Task management 라벨 불일치와 11의 Pros 연녹색 면/Cons 초록 외곽선 차이를 보존한다. | [G06](<GOAL-SPECS/G06.md>) | 미대조 |
| <a id="r4-f069-a01"></a>R4-F069-A01 · 남은 분석 | 원본 템플릿 이미지·잎 장식·모든 본문 및 다운로드 링크 대상을 별도로 연결해야 한다. 캡처가 없는 중간 구간과 실제 파일 다운로드 결과는 미확인이다. | [G06](<GOAL-SPECS/G06.md>) | 분석 대기 |

<a id="r4-f070"></a>
### F070 — Invoices

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/ANALYSIS.md>) · Flow ID `0ede7d7b-1ed5-487a-9dbd-b63ef818a29e` · [G55](<GOAL-SPECS/G55.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f070-o01"></a>R4-F070-O01 · 관찰 | 02: 결제 연결 홍보 카드에는 결제수단별 토글·로고·혜택 영역과 닫기 X가 있다. 표의 반복 아이콘과 상태 점, 검색/Filters/결제 편집/New Invoice를 구분한다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f070-o02"></a>R4-F070-O02 · 관찰 | 03과04는 적용 범위부터 다르다. Defaults는 미래 생성 문서 기본값이고 Invoice Settings는 기존·새 문서 모두에 적용한다는 문구가 있다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f070-o03"></a>R4-F070-O03 · 관찰 | 04: 전체 화면 설정은 왼쪽 제어와 오른쪽 Demo Invoice로 나뉘며 앱 사이드바가 없다. Invoice Layout과 Payment Page Layout은 별도 선택 그룹이다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f070-a01"></a>R4-F070-A01 · 남은 분석 | 기본값의 회색 문자열을 저장값으로 단정하지 않는다. 목록·설정·미리보기의 치수와 체크박스/토글 차이, 각 레이아웃 선택 결과를 추가 명세해야 한다. | [G55](<GOAL-SPECS/G55.md>) | 분석 대기 |

<a id="r4-f071"></a>
### F071 — Invoices/Adding a new invoice

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/ANALYSIS.md>) · Flow ID `18f62aba-c34e-486a-b2b8-099fcf9ba779` · [G57](<GOAL-SPECS/G57.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f071-o01"></a>R4-F071-O01 · 관찰 | 02–05: 유형·고객·종료 방식에 따라 모달 높이와 필드가 바뀐다. Sample Client의 노란 자동 paid 안내는 Doe Company 선택 뒤 사라지고 종료 날짜는 A specific date에서만 보인다. | [G57](<GOAL-SPECS/G57.md>) | 미대조 |
| <a id="r4-f071-o02"></a>R4-F071-O02 · 관찰 | 06–07: 편집기 문서 영역과 Overview/Setup/Payments 패널을 분리한다. 본문 스크롤 뒤에도 상단 작업바와 오른쪽 설정이 보이며 미청구 시간 안내는 닫기 제어를 가진다. | [G57](<GOAL-SPECS/G57.md>) | 미대조 |
| <a id="r4-f071-o03"></a>R4-F071-O03 · 관찰 | 08: 목록 행에는 반복 아이콘·회색 점과 0 금액이 보인다. 생성 완료를 발송·결제 완료로 확장하지 않는다. | [G57](<GOAL-SPECS/G57.md>) | 미대조 |
| <a id="r4-f071-a01"></a>R4-F071-A01 · 남은 분석 | 날짜 선택 팝업·주기/종료 옵션 전체와 자동 저장 시점은 원본에 없다. Tax ID의 본문 예시와 설정 입력 예시를 동일 실제값으로 합치지 않으며, 문서 레이아웃·헤더 자산을 별도 명세해야 한다. | [G57](<GOAL-SPECS/G57.md>) | 분석 대기 |

<a id="r4-f072"></a>
### F072 — Invoices/Adding a new invoice/Adding unbilled time

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Adding unbilled time/ANALYSIS.md>) · Flow ID `9a40f1e9-2362-4d00-a603-3f48febb5438` · [G59](<GOAL-SPECS/G59.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f072-o01"></a>R4-F072-O01 · 관찰 | 02→03: 미청구 시간 확인은 안내/두 버튼 모달에서 기간·반올림·노란 안내·합계·확정 버튼 모달로 바뀐다. | [G59](<GOAL-SPECS/G59.md>) | 미대조 |
| <a id="r4-f072-o02"></a>R4-F072-O02 · 관찰 | 03→05: 01:00:07, $20.04, 항목 수량 1.002, 총 $70.04가 관찰된다. 표시 자릿수와 계산 원시값을 같다고 가정하지 않는다. | [G59](<GOAL-SPECS/G59.md>) | 미대조 |
| <a id="r4-f072-o03"></a>R4-F072-O03 · 관찰 | 01→04: 서비스 단위 /item→/hr, 헤더/로고 배치도 함께 바뀐다. 이 변화 전체가 시간 추가 버튼의 효과라는 근거는 없다. 05에는 Add Unbilled Time 대신 Edit Timesheet가 보인다. | [G59](<GOAL-SPECS/G59.md>) | 미대조 |
| <a id="r4-f072-a01"></a>R4-F072-A01 · 남은 분석 | 반올림 옵션·날짜 변경·계산 정밀도와 단위/레이아웃 변경 경로가 미확인이다. 시간표 링크와 중복 추가 동작, 모달 치수를 추가 확인해야 한다. | [G59](<GOAL-SPECS/G59.md>) | 분석 대기 |

<a id="r4-f073"></a>
### F073 — Invoices/Adding a new invoice/Editing an item

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Editing an item/ANALYSIS.md>) · Flow ID `be9884fd-760f-4d30-b3e0-92b55ad8274c` · [G58](<GOAL-SPECS/G58.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f073-o01"></a>R4-F073-O01 · 관찰 | 02→03: 전역 빨간 오류 토스트와 항목명 빨간 테두리·왼쪽 경고 아이콘은 다른 위치의 오류 표현이다. | [G58](<GOAL-SPECS/G58.md>) | 미대조 |
| <a id="r4-f073-o02"></a>R4-F073-O02 · 관찰 | 04: 서비스 추천은 항목명 아래 초록 테두리 목록이며 이름·오른쪽 가격·잘린 설명·Manage Services 링크가 있다. 선택 전 빨간 입력 테두리가 남아 있다. | [G58](<GOAL-SPECS/G58.md>) | 미대조 |
| <a id="r4-f073-o03"></a>R4-F073-O03 · 관찰 | 05: Flyer Design 선택 뒤 이름·설명·/item 단가·소계·합계·Overview 금액이 함께 채워진다. 01→02의 로고/제목 좌우 변경은 중간 설정 과정이 생략된 별도 변화다. | [G58](<GOAL-SPECS/G58.md>) | 미대조 |
| <a id="r4-f073-a01"></a>R4-F073-A01 · 남은 분석 | 오류 발생 버튼·초점 이동·추천 필터링·설명 잘림 규칙은 캡처만으로 확정할 수 없다. 입력/추천 패널의 실제 위치·치수와 오류 해제 시점을 보완해야 한다. | [G58](<GOAL-SPECS/G58.md>) | 분석 대기 |

<a id="r4-f074"></a>
### F074 — Invoices/Adding a new invoice/Editing invoice header

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Editing invoice header/ANALYSIS.md>) · Flow ID `8eb71ff6-6686-4e7f-8092-5036ebff452f` · [G58](<GOAL-SPECS/G58.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f074-o01"></a>R4-F074-O01 · 관찰 | 01→02: 문서 폭에 맞는 가로 그라데이션 이미지가 위에 추가되고 제목·로고·주소·안내가 아래로 내려간다. 오른쪽 Add Image는 잘린 파일명과 빨간 제거 X로 바뀐다. | [G58](<GOAL-SPECS/G58.md>) | 미대조 |
| <a id="r4-f074-o02"></a>R4-F074-O02 · 관찰 | 로고는 우상단 유지, Display Logo/Tax ID는 켜짐, Late Fee는 꺼짐이며 금액은 0이다. 헤더 추가와 로고 업로드를 같은 제어로 합치지 않는다. | [G58](<GOAL-SPECS/G58.md>) | 미대조 |
| <a id="r4-f074-a01"></a>R4-F074-A01 · 남은 분석 | 원본 그라데이션 자산·자르기 방식·헤더 높이를 확보해야 한다. 파일 선택창·크기 제한·업로드 오류·삭제 결과는 캡처에 없다. | [G58](<GOAL-SPECS/G58.md>) | 분석 대기 |

<a id="r4-f075"></a>
### F075 — Invoices/Adding a new invoice/Enable auto-sending

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Enable auto-sending/ANALYSIS.md>) · Flow ID `20115575-4590-4c0c-a009-7062c5f936ab` · [G61](<GOAL-SPECS/G61.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f075-o01"></a>R4-F075-O01 · 관찰 | 02: Send Now 옆 달력 아래 검은 Schedule to send automatically 툴팁이 보인다. 03에는 별도의 빨간 오류 토스트가 오른쪽 아래 표시된다. | [G61](<GOAL-SPECS/G61.md>) | 미대조 |
| <a id="r4-f075-o02"></a>R4-F075-O02 · 관찰 | 03의 마지막 상태는 미래 발행일 필요 오류와 Drafted 유지다. 자동 발송 활성화·성공 예약 화면이 아니다. 01→02 금액·문서 레이아웃 변화 과정은 생략되어 있다. | [G61](<GOAL-SPECS/G61.md>) | 미대조 |
| <a id="r4-f075-a01"></a>R4-F075-A01 · 남은 분석 | 미래 날짜 선택·예약 성공·예약 취소·시간대 처리와 툴팁 진입 방식은 미확인이다. 실패 상태를 실제 구현 완료 조건에 포함하고 성공 동작은 추가 원본이 필요하다. | [G61](<GOAL-SPECS/G61.md>) | 분석 대기 |

<a id="r4-f076"></a>
### F076 — Invoices/Adding a new invoice/Preview invoice

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Preview invoice/ANALYSIS.md>) · Flow ID `3170e524-0da8-4acd-aaaa-33c3d0217288` · [G60](<GOAL-SPECS/G60.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f076-o01"></a>R4-F076-O01 · 관찰 | 02: 고객 미리보기는 검은 Invoice Preview 배너·Share Invoice와 좌측 문서/우측 금액 카드로 바뀐다. 편집기의 Overview·Setup 입력은 없다. | [G60](<GOAL-SPECS/G60.md>) | 미대조 |
| <a id="r4-f076-o02"></a>R4-F076-O02 · 관찰 | 03: 미리보기 항목 순서는 Project Hours Worked→Flyer Design이며 편집기 캡처와 반대다. 하단 시간표·결제 문의·Powered by bonsai·Download PDF를 포함한다. | [G60](<GOAL-SPECS/G60.md>) | 미대조 |
| <a id="r4-f076-a01"></a>R4-F076-A01 · 남은 분석 | 편집기와 미리보기의 항목 순서 차이를 정규화하지 않는다. 공유·PDF 결과와 실제 결제 입력은 원본에 없고, 문서/결제 카드의 폭과 고정·스크롤 관계를 측정해야 한다. | [G60](<GOAL-SPECS/G60.md>) | 분석 대기 |

<a id="r4-f077"></a>
### F077 — Invoices/Adding a new invoice/Record payment

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Adding a new invoice/Record payment/ANALYSIS.md>) · Flow ID `085fa1f3-f846-4dac-9bbd-0b65f000a427` · [G62](<GOAL-SPECS/G62.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f077-o01"></a>R4-F077-O01 · 관찰 | 02: 더보기 메뉴는 요약 패널 위를 덮는 오른쪽 드롭다운이며 Delete도 이 캡처에서는 검정이다. | [G62](<GOAL-SPECS/G62.md>) | 미대조 |
| <a id="r4-f077-o02"></a>R4-F077-O02 · 관찰 | 03: Record Invoice Payment는 회색 안내와 빨간 카드 결제 활성화 안내만 있는 차단 모달이다. 금액·날짜·결제수단 입력이나 성공 버튼은 보이지 않는다. | [G62](<GOAL-SPECS/G62.md>) | 미대조 |
| <a id="r4-f077-a01"></a>R4-F077-A01 · 남은 분석 | 입금 기록 성공 경로는 미확인이다. 이 세 단계의 완료 상태는 차단 모달이며, 실제 입금 폼을 임의로 원본 관찰에 추가하면 안 된다. | [G62](<GOAL-SPECS/G62.md>) | 분석 대기 |

<a id="r4-f078"></a>
### F078 — Invoices/Connecting to Stripe

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Connecting to Stripe/ANALYSIS.md>) · Flow ID `f4f79868-6066-440d-9432-cec83923c392` · [G56](<GOAL-SPECS/G56.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f078-o01"></a>R4-F078-O01 · 관찰 | 02–10: 결제수단 모달→Bonsai 이메일 확인 전체 화면→모달 연결 중→Stripe 외부 인증→복귀→연결 성공을 구분한다. 이메일 코드와 인증 앱 코드는 서로 다른 인증 화면이다. | [G56](<GOAL-SPECS/G56.md>) | 미대조 |
| <a id="r4-f078-o02"></a>R4-F078-O02 · 관찰 | 03–04: Bonsai는 개별 여섯 칸·초록 초점·재전송 타이머·하단 점 로딩, 06–07 Stripe는 3+3 칸·파란 초점·작은 스피너를 사용한다. | [G56](<GOAL-SPECS/G56.md>) | 미대조 |
| <a id="r4-f078-o03"></a>R4-F078-O03 · 관찰 | 09→10: 연결 후 카드 결제 토글·브랜드 로고·Fees·Stripe Dashboard·더보기가 생기고 성공 토스트만 사라진다. PayPal은 미연결 상태가 유지된다. | [G56](<GOAL-SPECS/G56.md>) | 미대조 |
| <a id="r4-f078-a01"></a>R4-F078-A01 · 남은 분석 | 외부 공급자 화면의 폰트·브랜딩·입력 스타일을 Bonsai 공통 제어로 통일하면 안 된다. 재전송·코드 오류·연결 실패·취소 결과와 실제 타이밍은 미확인이다. | [G56](<GOAL-SPECS/G56.md>) | 분석 대기 |

<a id="r4-f079"></a>
### F079 — Invoices/Connecting to Stripe/Turning off card payments

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Connecting to Stripe/Turning off card payments/ANALYSIS.md>) · Flow ID `565b66ad-85f3-48ce-a384-fb856c5dd782` · [G56](<GOAL-SPECS/G56.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f079-o01"></a>R4-F079-O01 · 관찰 | 01→02: Card Payments만 초록 on→회색 off로 바뀐다. Stripe 카드·대시보드 링크·더보기·카드 브랜드는 유지된다. | [G56](<GOAL-SPECS/G56.md>) | 미대조 |
| <a id="r4-f079-o02"></a>R4-F079-O02 · 관찰 | 02의 알림은 기본 결제수단 설정 갱신 성공이다. Stripe 연결 해제 성공으로 해석하지 않는다. | [G56](<GOAL-SPECS/G56.md>) | 미대조 |
| <a id="r4-f079-a01"></a>R4-F079-A01 · 남은 분석 | 토글 전환의 저장 지연·실패·기존 인보이스 영향은 캡처로 확정되지 않는다. 토글 색상/치수와 두 줄 토스트 위치를 명세해야 한다. | [G56](<GOAL-SPECS/G56.md>) | 분석 대기 |

<a id="r4-f080"></a>
### F080 — Invoices/Editing default values (Invoices)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Editing default values (Invoices)/ANALYSIS.md>) · Flow ID `a0f52cca-9fee-46e5-af2b-369e1db5e602` · [G55](<GOAL-SPECS/G55.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f080-o01"></a>R4-F080-O01 · 관찰 | 01–03: 스크롤 아래에서도 카드 헤더 Save Changes가 보이며 Default Note는 다른 숫자 입력과 달리 넓은 여러 줄 영역이다. 상단 전역바는 스크롤로 사라진다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f080-o02"></a>R4-F080-O02 · 관찰 | 03→04: Late Fee 10.0과 Tax 5.0이 저장 후 유지되고 우하단 두 줄 성공 토스트가 표시된다. 다른 회색 예시값을 사용자가 입력한 값으로 바꾸지 않는다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f080-a01"></a>R4-F080-A01 · 남은 분석 | 숫자 허용 범위·필드 오류·기존 문서 비영향의 실제 동작은 추가 확인이 필요하다. 카드/입력 정렬과 저장 시 스크롤 이동의 원인은 미확인이다. | [G55](<GOAL-SPECS/G55.md>) | 분석 대기 |

<a id="r4-f081"></a>
### F081 — Invoices/Updating invoice settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Invoices/Updating invoice settings/ANALYSIS.md>) · Flow ID `4a05877b-fd77-4532-a407-7c93a2168895` · [G55](<GOAL-SPECS/G55.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f081-o01"></a>R4-F081-O01 · 관찰 | 01→02: Foundation 선택은 초록 선택 테두리 이동뿐 아니라 로고·제목·발행/만기 정보 위치를 바꾼다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f081-o02"></a>R4-F081-O02 · 관찰 | 03→04: 설정 하단은 일곱 체크 옵션이며 팁 허용만 추가로 선택된다. 왼쪽을 스크롤해도 오른쪽 데모 문서와 상단 Close/Save Changes가 보인다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f081-o03"></a>R4-F081-O03 · 관찰 | 05: 저장 후 목록으로 돌아오고 성공 토스트가 나타난다. 목록의 세 인보이스와 금액 변화 전체를 설정 저장의 결과로 볼 수 없다. | [G55](<GOAL-SPECS/G55.md>) | 미대조 |
| <a id="r4-f081-a01"></a>R4-F081-A01 · 남은 분석 | Classic과 Single-Column 적용 화면·미저장 닫기·각 체크 옵션의 문서 반영 결과는 미확인이다. 설정 패널 스크롤 범위와 데모 크기를 별도 명세해야 한다. | [G55](<GOAL-SPECS/G55.md>) | 분석 대기 |

<a id="r4-f082"></a>
### F082 — Landing page

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Landing page/ANALYSIS.md>) · Flow ID `f1a89cc0-4dc8-4576-b912-78231a2a7b1a` · [G02](<GOAL-SPECS/G02.md>) 01~11단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f082-o01"></a>R4-F082-O01 · 관찰 | 01: 이 플로우는 랜딩 중간 제품 목업부터 시작한다. 첫 이미지의 대시보드·모바일 폼을 실제 앱 입력 영역으로 취급하지 않는다. | [G02](<GOAL-SPECS/G02.md>) | 비교 완료·유지 — 정적 목업 유지·hero 별도 흐름 연결; 주요 구성 한정, 시각 동일성 별도 대기 |
| <a id="r4-f082-o02"></a>R4-F082-O02 · 관찰 | 03→04: 후기의 인물·본문뿐 아니라 01/02/03 진행 표시의 긴 막대 위치도 바뀐다. 자동/수동 전환 방식은 보이지 않는다. | [G02](<GOAL-SPECS/G02.md>) | 비교 완료·유지 — 인물/본문/사진/진행 선택 연동 유지; 자동 전환 방식 미확인 |
| <a id="r4-f082-o03"></a>R4-F082-O03 · 관찰 | 09–11: 가입 배너, 다섯 열 푸터, 일부 항목의 펼침 화살표, SNS, 작은 법적 고지를 포함한다. 고정 헤더 위에 이전 내용이 보이는 캡처 위치도 보존해야 한다. | [G02](<GOAL-SPECS/G02.md>) | 분석 대기 — 5열/가입 배너/펼침/SNS/고지 구성 유지; 고정 헤더/작은 고지 정밀 시각 대기 |
| <a id="r4-f082-a01"></a>R4-F082-A01 · 남은 분석 | hero는 다른 플로우의 동일 페이지 근거로 연결하되 이 플로우에 없다는 사실을 남긴다. 후기·장식·목업 자산과 긴 푸터 문구 전사, 캐러셀 시간/애니메이션·아코디언 열림은 미확인이다. | [G02](<GOAL-SPECS/G02.md>) | 분석 대기 — hero/푸터 연결 일부 보완; 정확 자산·자동 전환·원본 펼침 미확인 |

<a id="r4-f083"></a>
### F083 — Logging in

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) · Flow ID `a02409b3-6eb0-4bc0-b702-22a42e0990c8` · [G11](<GOAL-SPECS/G11.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f083-o01"></a>R4-F083-O01 · 관찰 | 02–04: 로그인은 왼쪽 Changelog와 오른쪽 인증 카드의 두 열이다. 가입 화면과 달리 Apple 버튼도 있고, 이메일/비밀번호는 별도 라벨 없이 placeholder로 보인다. | [G11](<GOAL-SPECS/G11.md>) | 미대조 |
| <a id="r4-f083-o02"></a>R4-F083-O02 · 관찰 | 03→04: 비밀번호 입력 초점과 CAPTCHA 녹색 체크를 구분한다. 05의 대시보드는 로그인 성공 이후 상태이며 랜딩 목업 데이터와 다르다. | [G11](<GOAL-SPECS/G11.md>) | 미대조 |
| <a id="r4-f083-a01"></a>R4-F083-A01 · 남은 분석 | 잘못된 비밀번호·잠금·CAPTCHA 실패·소셜 로그인은 이 캡처에 없다. Changelog 내부 스크롤과 내용, 로그인 카드의 치수/세로 배치를 별도 명세해야 한다. | [G11](<GOAL-SPECS/G11.md>) | 분석 대기 |

<a id="r4-f084"></a>
### F084 — Logging in/Resetting password

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Logging in/Resetting password/ANALYSIS.md>) · Flow ID `8f9cc02b-1748-4b71-97d8-5c80bb299013` · [G12](<GOAL-SPECS/G12.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f084-o01"></a>R4-F084-O01 · 관찰 | 02–05: 복구 요청은 중앙 카드이며 이메일·CAPTCHA·발송 버튼이 회색 발송 안내로 대체된다. Resend Verification Email은 복구 이메일 재발송과 다른 문구다. | [G12](<GOAL-SPECS/G12.md>) | 미대조 |
| <a id="r4-f084-o02"></a>R4-F084-O02 · 관찰 | 06–09: 새 비밀번호는 확인 입력 없이 한 칸이다. Whoops!는 빨강, Password is too weak는 검정이며 입력 위에 놓인다. 실패 뒤 입력은 비고 재입력 중에도 오류가 남는다. | [G12](<GOAL-SPECS/G12.md>) | 미대조 |
| <a id="r4-f084-o03"></a>R4-F084-O03 · 관찰 | 10: 성공 후 빈 로그인 폼과 토스트가 나오며 Changelog 내용도 달라진다. 자동 로그인이나 비밀번호 변경으로 Changelog가 바뀐다고 단정하지 않는다. | [G12](<GOAL-SPECS/G12.md>) | 미대조 |
| <a id="r4-f084-a01"></a>R4-F084-A01 · 남은 분석 | 복구 링크 만료·토큰 오류·강도 규칙 전체와 오류 해제 시점은 미확인이다. 입력 위 오류 영역으로 늘어나는 카드 높이 및 성공 토스트를 따로 명세해야 한다. | [G12](<GOAL-SPECS/G12.md>) | 분석 대기 |

<a id="r4-f085"></a>
### F085 — Logging out

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Logging out/ANALYSIS.md>) · Flow ID `39713c9a-6f82-4d7c-be32-ab38510406bc` · [G11](<GOAL-SPECS/G11.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f085-o01"></a>R4-F085-O01 · 관찰 | 01: 아바타 메뉴는 Joe Studio 헤더와 Help Center/Perks/Team/Subscription/Settings/Logout 여섯 행을 갖는다. | [G11](<GOAL-SPECS/G11.md>) | 미대조 |
| <a id="r4-f085-o02"></a>R4-F085-O02 · 관찰 | 02: 로그아웃 뒤 빈 인증 폼·미체크 CAPTCHA와 Signed out successfully 토스트가 보인다. 공개 랜딩으로 이동하는 흐름이 아니다. | [G11](<GOAL-SPECS/G11.md>) | 미대조 |
| <a id="r4-f085-a01"></a>R4-F085-A01 · 남은 분석 | 메뉴 위치·너비·그림자와 토스트 지속시간, 뒤로 가기/다른 탭 세션 반영은 캡처로 확인할 수 없다. | [G11](<GOAL-SPECS/G11.md>) | 분석 대기 |

<a id="r4-f086"></a>
### F086 — Onboarding

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) · Flow ID `f714101f-db6b-4bfe-9ed1-74d6b0d6243c` · [G10](<GOAL-SPECS/G10.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f086-o01"></a>R4-F086-O01 · 관찰 | 03–08: 가입에는 이름·이메일·비밀번호 라벨, 비밀번호 눈 아이콘·최소 길이 안내·강도 표시가 있다. 로그인/초대 수락 폼과 동일 구성이 아니다. | [G10](<GOAL-SPECS/G10.md>) | 미대조 |
| <a id="r4-f086-o02"></a>R4-F086-O02 · 관찰 | 05→06: Too Weak 라벨과 입력 위 빨간 길이 오류 말풍선은 별도 상태다. 07의 재입력과 08의 Strong/CAPTCHA 체크도 구분한다. | [G10](<GOAL-SPECS/G10.md>) | 미대조 |
| <a id="r4-f086-o03"></a>R4-F086-O03 · 관찰 | 09: 흰 반투명 로딩은 배경 폼을 남긴 채 화분 그림과 Hold tight! 문구를 겹친다. 10부터 사업 설문과 오른쪽 인물/평점 패널로 전환된다. | [G10](<GOAL-SPECS/G10.md>) | 미대조 |
| <a id="r4-f086-a01"></a>R4-F086-A01 · 남은 분석 | 정확한 강도 산식·소셜 가입·CAPTCHA 오류는 미확인이다. 화분 로딩 자산/애니메이션, 가입 카드와 설문 화면의 별도 레이아웃 수치가 필요하다. | [G10](<GOAL-SPECS/G10.md>) | 분석 대기 |

<a id="r4-f087"></a>
### F087 — Onboarding/Completing account setup

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · Flow ID `f004afc2-a8c5-4262-b2e4-941331047a84` · [G13](<GOAL-SPECS/G13.md>) 01~16단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f087-o01"></a>R4-F087-O01 · 관찰 | 02–05: 업종 목록은 내부 스크롤과 초록 강조 행을 가지며 선택 뒤 회사명·국가 입력이 추가된다. 목록의 강조 상태와 선택 확정 상태를 구분한다. | [G13](<GOAL-SPECS/G13.md>) | 미대조 |
| <a id="r4-f087-o02"></a>R4-F087-O02 · 관찰 | 06–12: 사업 형태는 최종 Unregistered, 통화 MYR, 매출 RM0–RM50,000으로 보인다. 팀 초대는 세 이메일 입력이며 목적은 체크박스 대신 아이콘이 있는 선택 행이다. | [G13](<GOAL-SPECS/G13.md>) | 미대조 |
| <a id="r4-f087-o03"></a>R4-F087-O03 · 관찰 | 13–16: 타임라인/활동의 점 로딩, 회사 설정 안내, 빈 손익/활동/작업/시간 그래프를 별도 상태로 보존한다. 설문 MYR와 대시보드 USD의 차이를 임의로 일치시키지 않는다. | [G13](<GOAL-SPECS/G13.md>) | 미대조 |
| <a id="r4-f087-a01"></a>R4-F087-A01 · 남은 분석 | 원본 크기 확대에서 진행 표시 5개와 01/09/11의 첫째/넷째/다섯째 활성 위치를 확인했다. 캡처 사이 생략된 세 번째 설문 내용, 국가 기본값 결정, 팀 초대 발송 결과와 선택 항목별 추가 분기는 미확인이다. | [G13](<GOAL-SPECS/G13.md>) | 분석 대기 |

<a id="r4-f088"></a>
### F088 — Perks

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Perks/ANALYSIS.md>) · Flow ID `dee9aba7-13a6-462f-87f5-0a942a971ab0` · [G82](<GOAL-SPECS/G82.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f088-o01"></a>R4-F088-O01 · 관찰 | 03–04: Perks는 앱 사이드바 없이 로고·Go to Dashboard와 세 열 카드로 구성된다. 둘째 줄은 두 카드이며 세 번째 위치는 비어 있다. | [G82](<GOAL-SPECS/G82.md>) | 미대조 |
| <a id="r4-f088-o02"></a>R4-F088-O02 · 관찰 | 브랜드별 로고·본문·Perk 설명·서로 다른 CTA와 일부 잎 장식이 있다. 카드 내용이 길어도 버튼이 각 카드 아래쪽에 배치된다. | [G82](<GOAL-SPECS/G82.md>) | 미대조 |
| <a id="r4-f088-a01"></a>R4-F088-A01 · 남은 분석 | 제휴 로고·카드별 높이·본문 전체 전사와 외부 링크 도착 화면은 별도 근거가 필요하다. 현재 혜택으로 갱신하지 않고 캡처 시점 표현을 기준으로 삼는다. | [G82](<GOAL-SPECS/G82.md>) | 분석 대기 |

<a id="r4-f089"></a>
### F089 — Pricing

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Pricing/ANALYSIS.md>) · Flow ID `981ffcc3-d6c0-4038-8db3-4ac8753aace4` · [G04](<GOAL-SPECS/G04.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f089-o01"></a>R4-F089-O01 · 관찰 | 01–02: Yearly 선택은 짙은 초록 세그먼트이며 2 months for free 배지가 안에 있다. Professional만 주황 상단 배너·굵은 외곽선으로 강조된다. | [G04](<GOAL-SPECS/G04.md>) | 미대조 |
| <a id="r4-f089-o02"></a>R4-F089-O02 · 관찰 | 02–03: 요금제 기능 목록의 길이가 달라도 하단 CTA가 정렬된다. Team Seat/Bonsai Tax는 별도의 두 카드이고 월 $10으로 보인다. | [G04](<GOAL-SPECS/G04.md>) | 미대조 |
| <a id="r4-f089-a01"></a>R4-F089-A01 · 남은 분석 | Monthly 상태·가격 변경·가입 전환은 이 플로우에 없다. 가격은 캡처 시점 자료이며 카드 높이·여백·강조색·전체 기능 문구를 별도 명세해야 한다. | [G04](<GOAL-SPECS/G04.md>) | 분석 대기 |

<a id="r4-f090"></a>
### F090 — Privacy

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Privacy/ANALYSIS.md>) · Flow ID `776f20e2-7498-433f-af8b-f585988e2429` · [G09](<GOAL-SPECS/G09.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f090-o01"></a>R4-F090-O01 · 관찰 | 01: Privacy는 중앙 제목 아래 좁은 단일 본문 열이며 별도의 동의 체크나 설정 UI가 없다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f090-o02"></a>R4-F090-O02 · 관찰 | 02: 본문 소제목·문단·하이픈 목록·초록 Cookie Policy 링크가 같은 열에 이어지고 공개 헤더는 보인다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f090-a01"></a>R4-F090-A01 · 남은 분석 | 두 스크롤 캡처 사이 본문 전체를 확보했다고 단정할 수 없다. 정확한 전사·문단 간격·줄바꿈과 링크 대상을 별도 확인해야 한다. | [G09](<GOAL-SPECS/G09.md>) | 분석 대기 |

<a id="r4-f091"></a>
### F091 — Products (CRM)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Products (CRM)/ANALYSIS.md>) · Flow ID `12ca870d-d929-4cc8-ab4c-60436c2eac13` · [G03](<GOAL-SPECS/G03.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f091-o01"></a>R4-F091-O01 · 관찰 | 01: Product 메뉴는 세 기능 분류 열과 What's new 썸네일/링크 열로 나뉜다. 공개 페이지 목업 내부 조작 요소와 실제 CTA를 구분한다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f091-o02"></a>R4-F091-O02 · 관찰 | 05–07: 폼 템플릿은 4열×3행이며 대각선 두 모서리의 둥근 형태·Forms 아이콘·원형 화살표를 사용한다. 더 보기와 가입 안내는 별도 영역이다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·구현 보완(주요 구성); 시각 대기 |
| <a id="r4-f091-o03"></a>R4-F091-O03 · 관찰 | 09→10: FAQ 첫 행만 펼쳐지고 화살표가 위로 바뀌며 아래 두 질문이 밀린다. 다른 공개 페이지의 항상 펼친 FAQ와 통일하면 안 된다. | [G03](<GOAL-SPECS/G03.md>) | 비교 완료·유지(주요 구성); 시각 대기 |
| <a id="r4-f091-a01"></a>R4-F091-A01 · 남은 분석 | 소개 목업/후기/잎/등고선 자산과 템플릿 카드별 텍스트가 필요하다. 두 번째·세 번째 FAQ 답변과 단일/복수 펼침 규칙은 미확인이다. | [G03](<GOAL-SPECS/G03.md>) | 분석 대기 |

<a id="r4-f092"></a>
### F092 — Project detail

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/ANALYSIS.md>) · Flow ID `669a7507-38b3-41aa-89a2-146530c42240` · [G24](<GOAL-SPECS/G24.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f092-o01"></a>R4-F092-O01 · 관찰 | 01: 프로젝트 보드는 오른쪽 열이 뷰포트 밖으로 이어진다. 현재 보이는 네 열만 전체 상태라고 단정하지 않는다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f092-o02"></a>R4-F092-O02 · 관찰 | 02–06: 프로젝트 공통 제목·고객·상태·팀 아바타·여섯 탭 위에 개요/작업/시간/팀/설정 본문이 바뀐다. 개요의 빈 상태와 Tasks의 동일 제목 두 카드가 다른 스냅샷으로 공존한다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f092-o03"></a>R4-F092-O03 · 관찰 | 04: 7초/1시간 행의 $20.00 표기와 합계 1.00 Hours/$20.04를 구분한다. 행 금액이 곧 각 기록의 청구 총액이라고 해석하지 않는다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f092-a01"></a>R4-F092-A01 · 남은 분석 | 프로젝트 내부 탭별 열 폭·카드 높이·가로 넘침을 명세해야 한다. Invoices 탭 결과와 타임시트 생성·팀 제거·리마인더 실제 실행은 이 플로우에 없다. | [G24](<GOAL-SPECS/G24.md>) | 분석 대기 |

<a id="r4-f093"></a>
### F093 — Project detail/Adding a task

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/ANALYSIS.md>) · Flow ID `ee93ca39-d45a-4937-8ee6-7193c985b590` · [G25](<GOAL-SPECS/G25.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f093-o01"></a>R4-F093-O01 · 관찰 | 02–06: 작업 상세는 어두운 배경 모달이 아니라 화면 오른쪽을 덮는 흰 패널이다. 왼쪽 배경 개요는 그대로 보이며 패널 경계의 접기 화살표가 따로 있다. | [G25](<GOAL-SPECS/G25.md>) | 미대조 |
| <a id="r4-f093-o02"></a>R4-F093-O02 · 관찰 | 02→04: 제목·상태·기한과 Activity 이벤트가 단계적으로 바뀐다. 05 담당자 메뉴는 PROJECT TEAM 제목과 JD/이름 한 행이며 06 선택 뒤 작은 사각 아바타가 속성에 표시된다. | [G25](<GOAL-SPECS/G25.md>) | 미대조 |
| <a id="r4-f093-a01"></a>R4-F093-A01 · 남은 분석 | 패널 너비·내부 스크롤·그림자·접기 위치와 자동 저장 시점이 필요하다. 상태/날짜를 바꾼 실제 팝업, 반복 설정·빈 제목 저장 규칙은 미확인이다. | [G25](<GOAL-SPECS/G25.md>) | 분석 대기 |

<a id="r4-f094"></a>
### F094 — Project detail/Adding a task/Adding a comment

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding a comment/ANALYSIS.md>) · Flow ID `1a0794d4-deb5-4eb3-b391-c7371c60e684` · [G27](<GOAL-SPECS/G27.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f094-o01"></a>R4-F094-O01 · 관찰 | 01–03: 댓글 입력 영역은 Activity 이벤트 아래에 있고 Add Comment는 빈 입력에서 연한색, 작성 후 진한 초록이다. 저장 후 입력이 비고 새 댓글에 별도 더보기 메뉴가 생긴다. | [G27](<GOAL-SPECS/G27.md>) | 미대조 |
| <a id="r4-f094-o02"></a>R4-F094-O02 · 관찰 | 기존 담당자/상태 이벤트는 회색 기울임 내용이며 사용자 댓글과 표현이 다르다. Files의 붉은 가로선은 원본에 있으나 오류 문구나 원인을 확인할 수 없다. | [G27](<GOAL-SPECS/G27.md>) | 미대조 |
| <a id="r4-f094-a01"></a>R4-F094-A01 · 남은 분석 | 댓글 더보기의 수정/삭제·줄바꿈·전송 실패와 연한 버튼의 실제 disabled 여부는 미확인이다. 붉은 선을 임의의 첨부 오류 기능으로 해석하지 않는다. | [G27](<GOAL-SPECS/G27.md>) | 분석 대기 |

<a id="r4-f095"></a>
### F095 — Project detail/Adding a task/Adding a time entry

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding a time entry/ANALYSIS.md>) · Flow ID `38dcad7d-b2da-4d91-8eb3-2f3b39899b66` · [G33](<GOAL-SPECS/G33.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f095-o01"></a>R4-F095-O01 · 관찰 | 02–03: Add Time Entry 모달은 프로젝트 전체 너비, Task/Member 두 열, 요율/노트와 시분초/날짜 두 열로 구성된다. 수동 기록 체크는 켜져 있다. | [G33](<GOAL-SPECS/G33.md>) | 미대조 |
| <a id="r4-f095-o02"></a>R4-F095-O02 · 관찰 | 04: 저장 성공 토스트와 패널 닫힘이 관찰되지만 05는 여전히 No hours added이고 06은 01:00:00이다. 설명 유무·배경의 동일 제목 작업도 달라 모든 캡처가 같은 작업 인스턴스라는 근거가 부족하다. | [G33](<GOAL-SPECS/G33.md>) | 미대조 |
| <a id="r4-f095-a01"></a>R4-F095-A01 · 남은 분석 | 시간 기록이 연결된 대상의 동일성·설명 변화·모달 기본값 출처를 추가 확인해야 한다. 요율 placeholder와 실제 값, 시분초 입력 폭/검증을 따로 명세해야 한다. | [G33](<GOAL-SPECS/G33.md>) | 분석 대기 |

<a id="r4-f096"></a>
### F096 — Project detail/Adding a task/Adding subtasks

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Adding subtasks/ANALYSIS.md>) · Flow ID `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` · [G26](<GOAL-SPECS/G26.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f096-o01"></a>R4-F096-O01 · 관찰 | 03–08: 하위 작업은 패널 안 입력행/Save와 일반 목록/+Add Subtask 사이를 전환한다. 기존 행을 유지한 채 두 번째 입력행이 아래에 생긴다. | [G26](<GOAL-SPECS/G26.md>) | 미대조 |
| <a id="r4-f096-o02"></a>R4-F096-O02 · 관찰 | 09: 첫 행만 테두리·초록 체크 외곽선·담당자 추가·빨간 휴지통을 보인다. 일반 목록과 행 상호작용 상태를 나눠야 한다. | [G26](<GOAL-SPECS/G26.md>) | 미대조 |
| <a id="r4-f096-o03"></a>R4-F096-O03 · 관찰 | 10: Send invite만 완료·회색 제목·JD 아바타이고 Prepare a deck은 미완료다. Files 붉은 선은 원본 표시이며 그 원인은 확인되지 않는다. | [G26](<GOAL-SPECS/G26.md>) | 미대조 |
| <a id="r4-f096-a01"></a>R4-F096-A01 · 남은 분석 | 하위 작업 완료/할당 과정 일부는 다른 플로우로 연결해야 한다. 행 높이·완료 텍스트 스타일·스크롤 유지, Enter/취소/삭제 동작은 미확인이다. | [G26](<GOAL-SPECS/G26.md>) | 분석 대기 |

<a id="r4-f097"></a>
### F097 — Project detail/Adding a task/Archiving a task

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Archiving a task/ANALYSIS.md>) · Flow ID `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` · [G29](<GOAL-SPECS/G29.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f097-o01"></a>R4-F097-O01 · 관찰 | 01–02: 시간 합계 01:00:07 아래 7초·1시간 기록 두 행이 펼쳐진 패널에서 Archive 메뉴가 열린다. | [G29](<GOAL-SPECS/G29.md>) | 미대조 |
| <a id="r4-f097-o02"></a>R4-F097-O02 · 관찰 | 03: 패널이 닫히고 Initial Chat 카드 하나가 줄며 보관 성공 토스트가 보인다. 상단 전역 타이머 00:00:07 표시는 남는다. | [G29](<GOAL-SPECS/G29.md>) | 미대조 |
| <a id="r4-f097-a01"></a>R4-F097-A01 · 남은 분석 | 보관 확인 모달은 캡처되지 않았고, 복원·보관 목록·시간 기록 보존 규칙도 미확인이다. 같은 제목의 남은 카드와 보관된 대상을 구분해야 한다. | [G29](<GOAL-SPECS/G29.md>) | 분석 대기 |

<a id="r4-f098"></a>
### F098 — Project detail/Adding a task/Continue tracking time

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Continue tracking time/ANALYSIS.md>) · Flow ID `bbcfb9da-b056-42d0-bb2d-113093d50a8e` · [G32](<GOAL-SPECS/G32.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f098-o01"></a>R4-F098-O01 · 관찰 | 02→04: 기존 1시간 행을 유지한 채 속성 옆 초록 재생이 빨간 일시정지와 현재 세션 2초→6초로 바뀐다. | [G32](<GOAL-SPECS/G32.md>) | 미대조 |
| <a id="r4-f098-o02"></a>R4-F098-O02 · 관찰 | 05: 실행 종료 뒤 속성은 누적 01:00:07, 기록 목록은 7초/1시간 두 행이다. 실행 중 세션 시간과 멈춘 뒤 누적 시간을 같은 값으로 처리하지 않는다. | [G32](<GOAL-SPECS/G32.md>) | 미대조 |
| <a id="r4-f098-a01"></a>R4-F098-A01 · 남은 분석 | 타이머 정지 클릭·백그라운드 경과·다중 타이머 규칙은 캡처에 없다. 실행 제어의 색상·숫자 폭·전역 타이머 동기화가 별도 구현 명세로 필요하다. | [G32](<GOAL-SPECS/G32.md>) | 분석 대기 |

<a id="r4-f099"></a>
### F099 — Project detail/Adding a task/Deleting a task

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Deleting a task/ANALYSIS.md>) · Flow ID `7ca1185e-e3a0-460c-825e-68035a603593` · [G29](<GOAL-SPECS/G29.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f099-o01"></a>R4-F099-O01 · 관찰 | 02: 작업 카드 더보기는 패널 더보기와 같은 네 항목을 가지지만 카드 아래에 위치한다. Delete 텍스트는 검정이다. | [G29](<GOAL-SPECS/G29.md>) | 미대조 |
| <a id="r4-f099-o02"></a>R4-F099-O02 · 관찰 | 03→04: 삭제는 Confirm Deletion 모달의 빨간 Delete Task를 거친 뒤 To Do 열에서 Untitled가 사라지고 성공 토스트가 보인다. Archive의 종료 화면과 구분한다. | [G29](<GOAL-SPECS/G29.md>) | 미대조 |
| <a id="r4-f099-a01"></a>R4-F099-A01 · 남은 분석 | 01→02 Initial Chat 카드 수 감소는 이 삭제 동작 이전 변화다. 삭제 취소·실패·연관 시간/댓글 영향과 모달 치수는 미확인이다. | [G29](<GOAL-SPECS/G29.md>) | 분석 대기 |

<a id="r4-f100"></a>
### F100 — Project detail/Adding a task/Editing a subtask

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Editing a subtask/ANALYSIS.md>) · Flow ID `eb7720d8-fb1d-405b-8058-3f1c21adf475` · [G26](<GOAL-SPECS/G26.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f100-o01"></a>R4-F100-O01 · 관찰 | 02→03: 첫 행이 강조되고 완료 체크가 초록, 제목은 회색으로 바뀐다. 완료 후에도 담당자·빨간 삭제 제어가 나타난다. | [G26](<GOAL-SPECS/G26.md>) | 미대조 |
| <a id="r4-f100-o02"></a>R4-F100-O02 · 관찰 | 04→05: 완료된 Send invite 오른쪽의 담당자 메뉴를 통해 JD 아바타가 표시된다. Prepare a deck은 끝까지 미완료·미할당이다. 제목 자체를 바꾼 캡처는 없다. | [G26](<GOAL-SPECS/G26.md>) | 미대조 |
| <a id="r4-f100-a01"></a>R4-F100-A01 · 남은 분석 | 플로우 이름 Editing과 달리 제목 변경 결과는 미확인이다. 완료 취소·담당 해제·삭제 결과와 행별 hover/focus 규칙을 별도 확인해야 한다. | [G26](<GOAL-SPECS/G26.md>) | 분석 대기 |

<a id="r4-f101"></a>
### F101 — Project detail/Adding a task/Editing status settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Adding a task/Editing status settings/ANALYSIS.md>) · Flow ID `9dcc612c-ab47-4cc3-a2bb-1c434c7da582` · [G28](<GOAL-SPECS/G28.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f101-o01"></a>R4-F101-O01 · 관찰 | 02: 개별 작업 상태 메뉴의 세 배지와 Settings를 구분한다. 03부터는 작업 상태 정의를 관리하는 별도 중앙 모달이며 Done은 구분선 아래에 있다. | [G28](<GOAL-SPECS/G28.md>) | 미대조 |
| <a id="r4-f101-o02"></a>R4-F101-O02 · 관찰 | 04–05: 이름 입력과 여덟 색상 원 팔레트, 선택 링이 있다. To Do의 보라→주황 선택은 현재 작업을 To Do로 변경하는 동작이 아니다. | [G28](<GOAL-SPECS/G28.md>) | 미대조 |
| <a id="r4-f101-o03"></a>R4-F101-O03 · 관찰 | 06: 팔레트가 닫혀도 Status Settings 모달은 남고 업데이트 성공 토스트가 보인다. | [G28](<GOAL-SPECS/G28.md>) | 미대조 |
| <a id="r4-f101-a01"></a>R4-F101-A01 · 남은 분석 | 팔레트의 실제 색상값·배지 배경과 점의 관계, 이름 변경/추가/정렬/삭제 결과는 추가 명세가 필요하다. 스냅샷별 점 색상 차이를 모두 동일 토큰으로 단정하지 않는다. | [G28](<GOAL-SPECS/G28.md>) | 분석 대기 |

<a id="r4-f102"></a>
### F102 — Project detail/Editing project name

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Editing project name/ANALYSIS.md>) · Flow ID `436bff56-c6be-434a-97e4-1fa7b2526a91` · [G24](<GOAL-SPECS/G24.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f102-o01"></a>R4-F102-O01 · 관찰 | 02–03: 제목은 긴 인라인 입력과 오른쪽 Save로 바뀌고 별도 취소 버튼은 보이지 않는다. 상태·팀 영역은 오른쪽에 유지된다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f102-o02"></a>R4-F102-O02 · 관찰 | 04: 저장 뒤 제목/연필이 복원되고 업데이트 토스트가 보이지만 과거 생성 활동에는 이전 이름이 남는다. 과거 이벤트 문자열까지 새 제목으로 치환하면 원본과 다르다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f102-a01"></a>R4-F102-A01 · 남은 분석 | 입력 폭·제목 길이에 따른 줄바꿈, Enter/blur/빈 제목 검증은 미확인이다. 01→02 작업 요약/활동 변화는 이름 편집 효과로 볼 수 없다. | [G24](<GOAL-SPECS/G24.md>) | 분석 대기 |

<a id="r4-f103"></a>
### F103 — Project detail/Editing project settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Editing project settings/ANALYSIS.md>) · Flow ID `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` · [G24](<GOAL-SPECS/G24.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f103-o01"></a>R4-F103-O01 · 관찰 | 02–03: 설정은 왼쪽 테두리 카드와 오른쪽 Reminder Settings로 나뉜다. 종료일 선택 뒤 입력 오른쪽 지우기 X가 나타난다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f103-o02"></a>R4-F103-O02 · 관찰 | 04: 저장은 Overview 복귀와 토스트로 확인된다. 화면에는 종료일이 다시 보이지 않으므로 저장된 날짜 재조회까지 검증된 것은 아니다. 완료 작업 수 변화도 날짜 변경의 효과로 단정하지 않는다. | [G24](<GOAL-SPECS/G24.md>) | 미대조 |
| <a id="r4-f103-a01"></a>R4-F103-A01 · 남은 분석 | 달력 열림·시작/종료일 순서 검증·날짜 삭제·리마인더 설정 효과는 미확인이다. 설정 카드/설명 입력/외부 리마인더 영역의 치수를 명세해야 한다. | [G24](<GOAL-SPECS/G24.md>) | 분석 대기 |

<a id="r4-f104"></a>
### F104 — Project detail/Updating project status

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Project detail/Updating project status/ANALYSIS.md>) · Flow ID `ac1750e4-906b-47f6-ad41-18c1861d4f71` · [G23](<GOAL-SPECS/G23.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f104-o01"></a>R4-F104-O01 · 관찰 | 02→03: 프로젝트 상태는 New Lead/Proposal Sent/Contract Signed/In Progress/In Review 다섯 배지 선택에서 Proposal Sent로 바뀐다. 작업 상태 세 가지와 별도 체계다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f104-o02"></a>R4-F104-O02 · 관찰 | 04: 더보기에는 고객/협업자 미리보기·완료·보관·삭제가 있으며 상태는 다시 New Lead다. 더보기를 열면 상태가 초기화된다는 인과관계는 확인되지 않는다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f104-a01"></a>R4-F104-A01 · 남은 분석 | 프로젝트 상태 변경 저장 피드백과 완료/보관/삭제 결과는 미확인이다. 상태별 점·배경색과 메뉴 너비, 고객/협업자 미리보기의 차이를 추가 근거로 연결해야 한다. | [G23](<GOAL-SPECS/G23.md>) | 분석 대기 |

<a id="r4-f105"></a>
### F105 — Projects

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Projects/ANALYSIS.md>) · Flow ID `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d` · [G22](<GOAL-SPECS/G22.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f105-o01"></a>R4-F105-O01 · 관찰 | 02–04: 상태 열은 가로 스크롤하며 상단 검색·필터·New Project와 사이드바는 같은 위치에 남는다. 오른쪽으로 이동하면 In Review가 나타난다. | [G22](<GOAL-SPECS/G22.md>) | 미대조 |
| <a id="r4-f105-o02"></a>R4-F105-O02 · 관찰 | 03: 열 제목 옆 +/더보기와 열 아래 +New Project는 별도 제어다. 카드가 보이지 않는 04를 전체 프로젝트가 없는 상태로 오해하지 않는다. | [G22](<GOAL-SPECS/G22.md>) | 미대조 |
| <a id="r4-f105-a01"></a>R4-F105-A01 · 남은 분석 | 가로 스크롤 영역 높이·열 폭·헤더 보조 제어의 표시 조건이 필요하다. 열 메뉴·필터·검색·전체 빈 상태는 이 플로우에 없다. | [G22](<GOAL-SPECS/G22.md>) | 분석 대기 |

<a id="r4-f106"></a>
### F106 — Projects/Adding a tag

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Projects/Adding a tag/ANALYSIS.md>) · Flow ID `3aa597f9-f613-46dd-bd8c-45686e423865` · [G23](<GOAL-SPECS/G23.md>) 01~09단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f106-o01"></a>R4-F106-O01 · 관찰 | 02–03: 열 더보기와 카드 더보기의 위치/메뉴를 구분한다. 카드 메뉴에는 Tags/Mark Completed/Archive Project/Delete Project가 있다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f106-o02"></a>R4-F106-O02 · 관찰 | 04–07: 빈 Tags→검색/생성 입력→Create Sample→Sample chip와 Edit로 바뀌고 성공 토스트가 표시된다. 08 카드에는 태그가 고객명 아래 추가되어 높이가 늘어난다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f106-a01"></a>R4-F106-A01 · 남은 분석 | 복수 태그·기존 태그 선택·태그 해제·색상 편집은 미확인이다. Tags 모달의 상태별 높이, chip의 색상/반경/여백과 보드 카드 높이를 명세해야 한다. | [G23](<GOAL-SPECS/G23.md>) | 분석 대기 |

<a id="r4-f107"></a>
### F107 — Projects/Creating a project (Projects)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Projects/Creating a project (Projects)/ANALYSIS.md>) · Flow ID `ddea1540-3c0b-4e00-8805-12b4adc290c1` · [G21](<GOAL-SPECS/G21.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f107-o01"></a>R4-F107-O01 · 관찰 | 02–05: 프로젝트 목록에서 생성하는 모달에는 Client 선택이 있으며 고객 상세 문맥에서 생성하는 모달과 다르다. 고객 목록은 +New Client와 기존 고객/이메일 두 줄 행으로 구성된다. | [G21](<GOAL-SPECS/G21.md>) | 미대조 |
| <a id="r4-f107-o02"></a>R4-F107-O02 · 관찰 | 04: Sample Client 선택 뒤 노란 데모 자동 처리 안내가 생겨 모달이 길어진다. 회색 Consulting Project 예시와 실제 입력한 같은 문자열은 색상/단계로 구분한다. | [G21](<GOAL-SPECS/G21.md>) | 미대조 |
| <a id="r4-f107-o03"></a>R4-F107-O03 · 관찰 | 06: 생성 결과는 In Progress 열의 새 카드와 성공 토스트다. 이 상태가 모든 진입점의 기본 상태라는 근거는 없다. | [G21](<GOAL-SPECS/G21.md>) | 미대조 |
| <a id="r4-f107-a01"></a>R4-F107-A01 · 남은 분석 | 열별 생성 진입점·기본 상태 결정, 고객 신규 생성 분기·팀 변경과 오류 상태가 미확인이다. 조건부 안내에 따른 모달 높이와 필드 배치를 명세해야 한다. | [G21](<GOAL-SPECS/G21.md>) | 분석 대기 |

<a id="r4-f108"></a>
### F108 — Projects/Reordering projects

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Projects/Reordering projects/ANALYSIS.md>) · Flow ID `c5e982aa-007d-4e20-8c8b-1fe3c276acc8` · [G23](<GOAL-SPECS/G23.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f108-o01"></a>R4-F108-O01 · 관찰 | 02: Consulting Project 카드가 열 정렬 위치에서 벗어나 떠 있는 중간 상태를 보여 준다. 카드 제목·고객·Sample chip은 유지된다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f108-o02"></a>R4-F108-O02 · 관찰 | 03: Contract Signed 개수는 1, In Progress는 0으로 바뀌고 카드가 새 열에 정렬된다. 같은 열 안 단순 순서 변경만을 다룬 플로우가 아니다. | [G23](<GOAL-SPECS/G23.md>) | 미대조 |
| <a id="r4-f108-a01"></a>R4-F108-A01 · 남은 분석 | 포인터 경로·드롭 영역·자동 가로 스크롤·실패 복원·동일 열 정렬은 미확인이다. 드래그 중 카드 그림자와 자리 표시자의 존재는 원본 확대 확인이 필요하다. | [G23](<GOAL-SPECS/G23.md>) | 분석 대기 |

<a id="r4-f109"></a>
### F109 — Projects/Switching to list view

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Projects/Switching to list view/ANALYSIS.md>) · Flow ID `c9dfa93e-36ea-436f-bdef-bc876f4897c5` · [G22](<GOAL-SPECS/G22.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f109-o01"></a>R4-F109-O01 · 관찰 | 02: List View는 제목 앞 상태 점, 고객, 태그, 시작일의 달력 아이콘, Due/Paid 금액 열을 사용한다. Due를 기한 날짜 열로 해석하면 안 된다. | [G22](<GOAL-SPECS/G22.md>) | 미대조 |
| <a id="r4-f109-o02"></a>R4-F109-O02 · 관찰 | 03: 목록 행 메뉴는 View Project로 시작하며 보드 카드의 Tags 메뉴와 구성이 다르다. 삭제도 이 메뉴에서는 검정 텍스트다. | [G22](<GOAL-SPECS/G22.md>) | 미대조 |
| <a id="r4-f109-a01"></a>R4-F109-A01 · 남은 분석 | 표 열 너비·정렬 아이콘·금액 소수점·행 메뉴 위치와 보기 전환 시 검색/필터/스크롤 보존은 미확인이다. | [G22](<GOAL-SPECS/G22.md>) | 분석 대기 |

<a id="r4-f110"></a>
### F110 — Reviews

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Reviews/ANALYSIS.md>) · Flow ID `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` · [G04](<GOAL-SPECS/G04.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f110-o01"></a>R4-F110-O01 · 관찰 | 01–02: 평점/플랫폼 로고·CTA 아래 큰 영상 썸네일과 중앙 초록 재생 버튼이 있다. 실제 재생 화면은 없다. | [G04](<GOAL-SPECS/G04.md>) | 미대조 |
| <a id="r4-f110-o02"></a>R4-F110-O02 · 관찰 | 03–04: 후기 그리드는 세 열이고 이름은 짙은색, 직무는 초록으로 강조된다. 본문 길이와 빈 공간이 카드마다 다르며 일부 행은 뷰포트에 잘린다. | [G04](<GOAL-SPECS/G04.md>) | 미대조 |
| <a id="r4-f110-a01"></a>R4-F110-A01 · 남은 분석 | 영상 포스터·후기 전체 문구·잘린 중간 카드와 플레이어 상태를 별도 확보해야 한다. 캡처된 이름만으로 전체 후기 개수를 단정할 수 없다. | [G04](<GOAL-SPECS/G04.md>) | 분석 대기 |

<a id="r4-f111"></a>
### F111 — Scheduling

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Scheduling/ANALYSIS.md>) · Flow ID `283afa82-3835-4672-9d26-a607351efa6b` · [G52](<GOAL-SPECS/G52.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f111-o01"></a>R4-F111-O01 · 관찰 | 02: Upcoming Events의 빈 영역과 Event Types의 Consultation call 한 항목은 서로 다른 상태다. 이벤트 유형이 있다고 예약이 존재하는 것은 아니다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f111-o02"></a>R4-F111-O02 · 관찰 | 우하단 Laure from Bonsai 안내 카드와 원형 배경 효과도 보인다. 다른 예약 캡처의 도움말 버튼/빈 상태 그림과 동일 표시 상태로 합치지 않는다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f111-a01"></a>R4-F111-A01 · 남은 분석 | 빈 예약 카드의 그림 로딩 여부·지원 메시지 노출 조건과 실제 예약 목록은 미확인이다. 두 열 비율·유형 아이콘·복사/보기 링크를 명세해야 한다. | [G52](<GOAL-SPECS/G52.md>) | 분석 대기 |

<a id="r4-f112"></a>
### F112 — Scheduling/Copying a booking page

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Scheduling/Copying a booking page/ANALYSIS.md>) · Flow ID `e2d05800-15f1-4b39-969c-290d5feee7fc` · [G52](<GOAL-SPECS/G52.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f112-o01"></a>R4-F112-O01 · 관찰 | 01→02: 지원 안내 카드가 사라지고 빈 예약 카드에 달력/돋보기 그림이 나타나며 카드 높이도 달라진다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f112-o02"></a>R4-F112-O02 · 관찰 | 03: 복사 성공 토스트는 예약 URL 복사 결과다. 04는 추가 이벤트를 위한 Professional 업그레이드 모달로 별도 분기이며 복사의 결과로 볼 수 없다. | [G52](<GOAL-SPECS/G52.md>) | 미대조 |
| <a id="r4-f112-a01"></a>R4-F112-A01 · 남은 분석 | 업그레이드 모달을 연 정확한 동작·구매 결과·실제 복사 URL·클립보드 실패는 미확인이다. 제한 모달의 아이콘·혜택 목록·가격 포함 CTA를 명세해야 한다. | [G52](<GOAL-SPECS/G52.md>) | 분석 대기 |

<a id="r4-f113"></a>
### F113 — Searching Bonsai

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Searching Bonsai/ANALYSIS.md>) · Flow ID `f6466df8-7932-40c1-a10e-f84bfe1070f5` · [G71](<GOAL-SPECS/G71.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f113-o01"></a>R4-F113-O01 · 관찰 | 02–04: 검색창·결과 영역·단축키 푸터로 된 모달의 높이가 결과에 따라 달라진다. 최근 조회, 스피너가 있는 중간 목록, 최종 두 행을 별도 상태로 유지한다. | [G71](<GOAL-SPECS/G71.md>) | 미대조 |
| <a id="r4-f113-o02"></a>R4-F113-O02 · 관찰 | 03의 Go To→Contracts는 객체 결과와 다른 이동 행이다. 04의 첫 행 강조가 05에서 실제로 열린 프로젝트를 뜻하지는 않는다. | [G71](<GOAL-SPECS/G71.md>) | 미대조 |
| <a id="r4-f113-o03"></a>R4-F113-O03 · 관찰 | 05: 프로젝트에 Form Incomplete/Proposal accepted 문서와 활동 이력이 있고 작업은 비어 있다. 검색의 청구 금액을 이 개요의 요약 금액에 임의로 대입하지 않는다. | [G71](<GOAL-SPECS/G71.md>) | 미대조 |
| <a id="r4-f113-a01"></a>R4-F113-A01 · 남은 분석 | 입력 debounce·검색 기준·키보드 선택·결과 없음/실패·잘린 목록의 스크롤과 모달 높이 규칙은 미확인이다. | [G71](<GOAL-SPECS/G71.md>) | 분석 대기 |

<a id="r4-f114"></a>
### F114 — Services

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Services/ANALYSIS.md>) · Flow ID `16a15a7f-2535-457e-838b-877a27767618` · [G35](<GOAL-SPECS/G35.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f114-o01"></a>R4-F114-O01 · 관찰 | 02–03: 가격은 단위 없는 금액과 /item·/hour·/day를 구분하고 분류는 색상 chip으로 표시한다. 스크롤해도 사이드바는 남고 전역바는 사라진다. | [G35](<GOAL-SPECS/G35.md>) | 미대조 |
| <a id="r4-f114-o02"></a>R4-F114-O02 · 관찰 | 04: Categories는 네 행 왼쪽 색상 막대와 오른쪽 더보기, All Services/New Category를 갖는다. Services 목록의 검색·필터·가격 열을 그대로 재사용한 화면이 아니다. | [G35](<GOAL-SPECS/G35.md>) | 미대조 |
| <a id="r4-f114-a01"></a>R4-F114-A01 · 남은 분석 | 카테고리 실제 색상값·chip/막대 대응, 표 열 폭·가격 정렬과 생성/편집/삭제·필터 결과는 이 플로우에서 확인되지 않는다. | [G35](<GOAL-SPECS/G35.md>) | 분석 대기 |

<a id="r4-f115"></a>
### F115 — Services/Adding a service to library

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Services/Adding a service to library/ANALYSIS.md>) · Flow ID `023d6e51-ce87-40a9-a628-cf7b39cd3b14` · [G35](<GOAL-SPECS/G35.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f115-o01"></a>R4-F115-O01 · 관찰 | 02–03: Service Templates는 앱 사이드바가 사라지는 전체 화면이며 왼쪽 분류/개수, 오른쪽 검색·서비스 목록·각 행 +, 우상단 닫기로 구성된다. | [G35](<GOAL-SPECS/G35.md>) | 미대조 |
| <a id="r4-f115-o02"></a>R4-F115-O02 · 관찰 | 03–05: Product 6개 표기와 뷰포트에 보이는 다섯 주요 행을 구분한다. Add to library 툴팁 뒤 성공 토스트가 나타나도 +가 남고 분류 개수는 바뀌지 않는다. | [G35](<GOAL-SPECS/G35.md>) | 미대조 |
| <a id="r4-f115-o03"></a>R4-F115-O03 · 관찰 | 05: 성공 토스트에는 Click to edit 링크가 포함된다. 단순 성공 문구만 재현하면 후속 진입 요소가 빠진다. | [G35](<GOAL-SPECS/G35.md>) | 미대조 |
| <a id="r4-f115-a01"></a>R4-F115-A01 · 남은 분석 | 템플릿 전체 371개 내용이 이 캡처에 있는 것은 아니다. 중복 추가·라이브러리 복귀/편집 결과·검색, 좌측 분류 전체와 행 높이/설명 줄바꿈은 추가 명세가 필요하다. | [G35](<GOAL-SPECS/G35.md>) | 분석 대기 |

<a id="r4-f116"></a>
### F116 — Settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/ANALYSIS.md>) · Flow ID `fe127bb6-984a-4b25-927f-4186b6650743` · [G74](<GOAL-SPECS/G74.md>) 01~12단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f116-o01"></a>R4-F116-O01 · 관찰 | 02–07: Account는 세부 메뉴와 오른쪽 카드 구조다. 프로필·회사·메시지·알림·Client Mode·2FA가 서로 다른 입력/안내를 가진다. Client Portal은 메뉴에 있지만 이 플로우의 본문 캡처는 없다. | [G74](<GOAL-SPECS/G74.md>) | 미대조 |
| <a id="r4-f116-o02"></a>R4-F116-O02 · 관찰 | 08–10: Branding은 설정/미리보기 두 열, Team은 역할/초대 상태를 가진 표, Integrations는 3열 브랜드 카드다. 같은 이름의 팀원을 이메일 없이 동일 인물로 합치면 안 된다. | [G74](<GOAL-SPECS/G74.md>) | 미대조 |
| <a id="r4-f116-o03"></a>R4-F116-O03 · 관찰 | 11–12: Current Subscription에는 Starter가 남고 기간 종료 해지 예정 안내가 있다. 공개 Pricing의 연간 환산 가격과 설정의 월 가격은 별도 상태다. | [G74](<GOAL-SPECS/G74.md>) | 미대조 |
| <a id="r4-f116-a01"></a>R4-F116-A01 · 남은 분석 | 기본 메시지의 회색 텍스트·2FA 세그먼트의 실제 저장 상태는 원본만으로 불명확하다. 하위 메뉴별 전체 스크롤 범위·브랜드 자산·권한별 접근·요금제 제한을 추가 명세해야 한다. | [G74](<GOAL-SPECS/G74.md>) | 분석 대기 |

<a id="r4-f117"></a>
### F117 — Settings/Deleting account

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Deleting account/ANALYSIS.md>) · Flow ID `3d51760e-2893-42a1-ada6-a2c44849a54d` · [G76](<GOAL-SPECS/G76.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f117-o01"></a>R4-F117-O01 · 관찰 | 02: Delete Account는 프로필 저장 카드 아래 별도 카드의 빨간 외곽선 버튼이다. 03–04 최종 모달의 빨간 채움 버튼과 구분한다. | [G76](<GOAL-SPECS/G76.md>) | 미대조 |
| <a id="r4-f117-o02"></a>R4-F117-O02 · 관찰 | 03: 삭제 안내에는 고객의 서명 계약/지급 인보이스 기록 접근이 남는다는 문구가 있다. 05는 빈 로그인 화면이며 삭제 성공 토스트는 보이지 않는다. | [G76](<GOAL-SPECS/G76.md>) | 미대조 |
| <a id="r4-f117-a01"></a>R4-F117-A01 · 남은 분석 | 최종 화면만으로 서버 데이터 삭제 범위·완료 여부까지 검증된 것은 아니다. 비밀번호 오류·취소·장기 보존 규칙과 모달 치수는 미확인이다. | [G76](<GOAL-SPECS/G76.md>) | 분석 대기 |

<a id="r4-f118"></a>
### F118 — Settings/Disabling public profile

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Disabling public profile/ANALYSIS.md>) · Flow ID `eb5394cb-70d0-4286-be72-3a6a0c240fd2` · [G15](<GOAL-SPECS/G15.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f118-o01"></a>R4-F118-O01 · 관찰 | 01→02: Public Profile은 Enabled/Disabled 세그먼트이며 Disabled 선택 텍스트가 빨강이다. Profile URL과 View Profile은 계속 보인다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f118-o02"></a>R4-F118-O02 · 관찰 | 03: 저장 성공 토스트가 회사 주소 영역 위에 겹치며 Disabled 상태가 유지된다. Client Portal 접근 설정과 다른 기능이다. | [G15](<GOAL-SPECS/G15.md>) | 미대조 |
| <a id="r4-f118-a01"></a>R4-F118-A01 · 남은 분석 | 비활성 공개 URL의 실제 도착 화면·재활성화·URL 편집 동작은 미확인이다. 세그먼트 색상/선택 테두리와 토스트 위치를 별도 명세해야 한다. | [G15](<GOAL-SPECS/G15.md>) | 분석 대기 |

<a id="r4-f119"></a>
### F119 — Settings/Editing branding settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Editing branding settings/ANALYSIS.md>) · Flow ID `79468a76-f7fd-456e-843e-66c2763976a5` · [G16](<GOAL-SPECS/G16.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f119-o01"></a>R4-F119-O01 · 관찰 | 02–03: 로고 크기·헤더 preset·Brand Font/Color·화이트라벨 세 라디오를 구분한다. 왕관 표시는 일부 선택지에만 있다. | [G16](<GOAL-SPECS/G16.md>) | 미대조 |
| <a id="r4-f119-o02"></a>R4-F119-O02 · 관찰 | 04–05: Abstract와 Plant는 서로 다른 실제 사진 자산이며 로고는 헤더 아래 경계 중앙에 겹친다. 단색 배경으로 대체하면 원본과 다르다. | [G16](<GOAL-SPECS/G16.md>) | 미대조 |
| <a id="r4-f119-o03"></a>R4-F119-O03 · 관찰 | 06: 저장 후 Plant 미리보기와 성공 토스트가 유지된다. 새 문서에만 적용된다는 설정 안내를 인보이스 전역 설정의 적용 범위와 혼동하지 않는다. | [G16](<GOAL-SPECS/G16.md>) | 미대조 |
| <a id="r4-f119-a01"></a>R4-F119-A01 · 남은 분석 | 사진 원본·crop·로고 겹침 치수, Desk/Custom Header·폰트·색상·화이트라벨 결과는 미확인이다. Small Square 84×84는 표시 옵션이며 이미지 파일 자체 크기와 구분한다. | [G16](<GOAL-SPECS/G16.md>) | 분석 대기 |

<a id="r4-f120"></a>
### F120 — Settings/Editing notification settings

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Editing notification settings/ANALYSIS.md>) · Flow ID `ac111df9-05db-467b-be5a-f58bc35913c0` · [G75](<GOAL-SPECS/G75.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f120-o01"></a>R4-F120-O01 · 관찰 | 02–03: 다섯 알림 체크 중 팁·새 기능 두 개만 해제되고 앱 알림·구독/결제 문제·작업 기한 세 개와 360 minutes는 유지된다. | [G75](<GOAL-SPECS/G75.md>) | 미대조 |
| <a id="r4-f120-o02"></a>R4-F120-O02 · 관찰 | 04: 저장 후 Notifications 카드 대신 Profile Settings와 일반 계정 업데이트 토스트가 표시된다. 알림 체크값을 재조회한 캡처는 없다. | [G75](<GOAL-SPECS/G75.md>) | 미대조 |
| <a id="r4-f120-a01"></a>R4-F120-A01 · 남은 분석 | 브라우저 권한 팝업·임계값 검증·알림 실제 발송·체크값 재조회는 미확인이다. 카드 내부 구분선과 단위가 붙은 시간 입력을 명세해야 한다. | [G75](<GOAL-SPECS/G75.md>) | 분석 대기 |

<a id="r4-f121"></a>
### F121 — Settings/Enable client mode

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Enable client mode/ANALYSIS.md>) · Flow ID `3dce7a57-e3a1-4fd6-944a-3f547b30def6` · [G77](<GOAL-SPECS/G77.md>) 01~02단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f121-o01"></a>R4-F121-O01 · 관찰 | 01→02: Enable Dual-Mode 다음 화면은 Client Mode 활성 화면이 아니라 Business만 있는 플랜 선택 화면이다. | [G77](<GOAL-SPECS/G77.md>) | 미대조 |
| <a id="r4-f121-o02"></a>R4-F121-O02 · 관찰 | 02: 초록 선택 테두리/체크, 네 하도급 기능, Choose Business, 외부 닫기와 잎 장식이 있다. 가격이나 결제 입력은 이 단계에 보이지 않는다. | [G77](<GOAL-SPECS/G77.md>) | 미대조 |
| <a id="r4-f121-a01"></a>R4-F121-A01 · 남은 분석 | Business 선택 이후 결제/활성화·고객 모드 전환 UI는 미확인이다. 플로우 이름을 근거로 모드 활성 성공을 완료 조건으로 추가하면 안 된다. | [G77](<GOAL-SPECS/G77.md>) | 분석 대기 |

<a id="r4-f122"></a>
### F122 — Settings/Importing a CSV

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Importing a CSV/ANALYSIS.md>) · Flow ID `ad6f634b-9fff-44de-acdf-4cd1eaf69123` · [G78](<GOAL-SPECS/G78.md>) 01~11단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f122-o01"></a>R4-F122-O01 · 관찰 | 02–06: 가져오기 유형 선택 아래 안내·파일 첨부·실행 버튼이 단계적으로 생긴다. 다운로드 다섯 버튼은 별도 기능이며 Import 유형 네 개와 동일 목록이 아니다. | [G78](<GOAL-SPECS/G78.md>) | 미대조 |
| <a id="r4-f122-o02"></a>R4-F122-O02 · 관찰 | 07–09: 매핑은 필수 세 항목 위/선택 두 항목 아래 구조다. 선택에 따라 샘플 카드가 생기지만 의미상 잘못된 Billable=Account/Currency=Date도 화면에는 허용된다. | [G78](<GOAL-SPECS/G78.md>) | 미대조 |
| <a id="r4-f122-o03"></a>R4-F122-O03 · 관찰 | 10→11: 처리 영역 뒤 Line 2–18의 Billable 오류 17개가 나타난다. 최종 상태는 실패이며 입력한 매핑을 정상 예제로 고쳐 재현하면 안 된다. | [G78](<GOAL-SPECS/G78.md>) | 미대조 |
| <a id="r4-f122-a01"></a>R4-F122-A01 · 남은 분석 | Currency의 실제 검증 결과·다른 오류·재시도/성공 경로·원본 CSV 전체는 미확인이다. 샘플 표와 긴 오류 목록에 따른 높이/스크롤을 별도로 명세해야 한다. | [G78](<GOAL-SPECS/G78.md>) | 분석 대기 |

<a id="r4-f123"></a>
### F123 — Settings/Removing a user

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Removing a user/ANALYSIS.md>) · Flow ID `c615a678-2203-45d5-bcc0-235f6b325516` · [G17](<GOAL-SPECS/G17.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f123-o01"></a>R4-F123-O01 · 관찰 | 02: 제거 대상은 마지막 Invite Pending 이메일 행이다. 동일 이름의 다른 Jon Smith 행과 구분한다. | [G17](<GOAL-SPECS/G17.md>) | 미대조 |
| <a id="r4-f123-o02"></a>R4-F123-O02 · 관찰 | 03→04: Confirm Removal은 대상 이메일을 굵게 표시하고 빨간 Remove Member를 제공한다. 표는 5→4행, 성공 토스트가 보이고 다른 회원 행은 남는다. | [G17](<GOAL-SPECS/G17.md>) | 미대조 |
| <a id="r4-f123-a01"></a>R4-F123-A01 · 남은 분석 | 가입 완료 사용자·Owner 대상 메뉴, 재초대·권한 회수 실제 결과는 미확인이다. 메뉴 위치·표 열 너비·확인 모달 문구/치수를 명세해야 한다. | [G17](<GOAL-SPECS/G17.md>) | 분석 대기 |

<a id="r4-f124"></a>
### F124 — Settings/Uploading profile picture

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Settings/Uploading profile picture/ANALYSIS.md>) · Flow ID `7f83211c-f4cf-4bc7-a715-c64a2a27626b` · [G74](<GOAL-SPECS/G74.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f124-o01"></a>R4-F124-O01 · 관찰 | 02: JD 이미지에 밝은 반투명 덮개와 Update Image가 표시되며 제거 X는 따로 있다. | [G74](<GOAL-SPECS/G74.md>) | 미대조 |
| <a id="r4-f124-o02"></a>R4-F124-O02 · 관찰 | 03→05: JD 위 가로 막대 같은 중간 표시→새 사진→저장 토스트를 구분한다. 개인 사진 변경 뒤에도 우상단 회사 로고는 그대로다. | [G74](<GOAL-SPECS/G74.md>) | 미대조 |
| <a id="r4-f124-a01"></a>R4-F124-A01 · 남은 분석 | 03의 막대를 정확한 업로드 진행률로 해석할 근거는 없다. 파일 선택/잘라내기·실패·제거 동작과 사진 자산/정사각 crop을 추가 확인해야 한다. | [G74](<GOAL-SPECS/G74.md>) | 분석 대기 |

<a id="r4-f125"></a>
### F125 — Starting time tracking

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Starting time tracking/ANALYSIS.md>) · Flow ID `06d57391-c7a4-4f63-ba8d-078ea3af046f` · [G32](<GOAL-SPECS/G32.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f125-o01"></a>R4-F125-O01 · 관찰 | 02–07: 타이머는 전역바 아래 팝오버이며 빈 기록→실행 폼으로 바뀐다. 실행 중 빨간 일시정지·휴지통, 프로젝트/작업·날짜/요율·메모와 Changes Saved 표시를 구분한다. | [G32](<GOAL-SPECS/G32.md>) | 미대조 |
| <a id="r4-f125-o02"></a>R4-F125-O02 · 관찰 | 08→09: 팝오버를 닫아도 전역 타이머는 계속 표시되고, 정지 뒤에는 Done/Resume Timer·초록 재생이 나타난다. 실행 중 회색 시간과 정지 후 진한 시간의 스타일도 다르다. | [G32](<GOAL-SPECS/G32.md>) | 미대조 |
| <a id="r4-f125-o03"></a>R4-F125-O03 · 관찰 | 10: Done 이후 새 타이머 0초와 날짜·고객·프로젝트·메모·1분16초 기록이 함께 보인다. Task를 선택하지 않은 기록이다. | [G32](<GOAL-SPECS/G32.md>) | 미대조 |
| <a id="r4-f125-a01"></a>R4-F125-A01 · 남은 분석 | 자동 저장 지연·타이머 삭제/재개·프로젝트 미선택 종료·여러 기록 스크롤은 미확인이다. 팝오버 상태별 높이와 전역 시간 동기화·도움말 겹침을 명세해야 한다. | [G32](<GOAL-SPECS/G32.md>) | 분석 대기 |

<a id="r4-f126"></a>
### F126 — Subscribing to Starter plan

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Subscribing to Starter plan/ANALYSIS.md>) · Flow ID `89302289-1851-4066-91e4-d61a28f79e15` · [G79](<GOAL-SPECS/G79.md>) 01~12단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f126-o01"></a>R4-F126-O01 · 관찰 | 01–03: 체험 종료는 앱 안 안내 카드, 플랜 선택은 전체 화면이다. Professional 추천 배지는 Starter를 선택해도 남고 선택 체크만 이동한다. | [G79](<GOAL-SPECS/G79.md>) | 미대조 |
| <a id="r4-f126-o02"></a>R4-F126-O02 · 관찰 | 04–05: 연간 월환산 $21/총 $252와 월간 $25/총 $25를 구분하며 자동 갱신 문구도 바뀐다. 오른쪽 요약은 연녹색 배경이다. | [G79](<GOAL-SPECS/G79.md>) | 미대조 |
| <a id="r4-f126-o03"></a>R4-F126-O03 · 관찰 | 06–10: 결제 처리 점 로딩·hCaptcha 미체크/체크·카드 요약·구독 성공이 별도 단계다. hCaptcha의 CLOSE 위치/스타일은 일반 앱 모달 X와 다르다. | [G79](<GOAL-SPECS/G79.md>) | 미대조 |
| <a id="r4-f126-o04"></a>R4-F126-O04 · 관찰 | 11–12: 플랜 비교 뒤 Tax/Team Seat와 Subscription Receipts가 이어진다. 영수증 기간과 현재 구독 정보를 별도 데이터로 보존한다. | [G79](<GOAL-SPECS/G79.md>) | 미대조 |
| <a id="r4-f126-a01"></a>R4-F126-A01 · 남은 분석 | 카드 오류·프로모션·플랜 변경·영수증 상세·연간 구매 결과는 미확인이다. 카드 입력값 원문을 새 문서에 복제하지 않고 형태/마스킹과 상태 중심으로 명세한다. | [G79](<GOAL-SPECS/G79.md>) | 분석 대기 |

<a id="r4-f127"></a>
### F127 — Subscribing to Starter plan/Canceling subscription

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Subscribing to Starter plan/Canceling subscription/ANALYSIS.md>) · Flow ID `89fb5b3c-c982-48a3-a713-b70f07d8c544` · [G80](<GOAL-SPECS/G80.md>) 01~10단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f127-o01"></a>R4-F127-O01 · 관찰 | 02–05: 취소 영향 확인→50% 유지 제안→일시정지 제안/여섯 사유는 서로 다른 모달이다. 사유 선택 뒤 Cancel Subscription의 연한 빨강이 진해진다. | [G80](<GOAL-SPECS/G80.md>) | 미대조 |
| <a id="r4-f127-o02"></a>R4-F127-O02 · 관찰 | 06–09: 피드백은 이전보다 넓은 패널·더 어두운 배경으로 바뀌고 로딩/필수 자유 입력/완료 체크를 갖는다. 07은 피드백 제출 전에 이미 취소 안내를 표시한다. | [G80](<GOAL-SPECS/G80.md>) | 미대조 |
| <a id="r4-f127-o03"></a>R4-F127-O03 · 관찰 | 10: Starter와 월 가격이 남으며 청구기간 말 종료 예정·철회 링크·성공 토스트가 나타난다. 즉시 모든 접근이 끝난 상태로 해석하지 않는다. | [G80](<GOAL-SPECS/G80.md>) | 미대조 |
| <a id="r4-f127-a01"></a>R4-F127-A01 · 남은 분석 | 할인 수락·일시정지·다른 사유의 추가 질문·빈 피드백 오류·해지 철회 결과는 미확인이다. 모달별 치수/오버레이 농도·라디오·설문 키보드 안내를 명세해야 한다. | [G80](<GOAL-SPECS/G80.md>) | 분석 대기 |

<a id="r4-f128"></a>
### F128 — Tasks

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Tasks/ANALYSIS.md>) · Flow ID `59d5186e-98e3-495f-b8c0-96eb9c943631` · [G25](<GOAL-SPECS/G25.md>) 01~03단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f128-o01"></a>R4-F128-O01 · 관찰 | 전역 Tasks 보드 카드에는 프로젝트명과 빨간 Yesterday가 함께 보인다. 프로젝트 내부 작업 카드와 표시 정보를 구분한다. To Do / In Progress / Done 각 열에 + New Task가 있다. | [G25](<GOAL-SPECS/G25.md>) | 미대조 |
| <a id="r4-f128-o02"></a>R4-F128-O02 · 관찰 | Templates 빈 화면은 작업 예시 삽화, 설명, New Template 버튼을 포함한 큰 안내 카드다. 삽화 속 작업은 실제 템플릿 목록 데이터로 세지 않는다. | [G25](<GOAL-SPECS/G25.md>) | 미대조 |
| <a id="r4-f128-a01"></a>R4-F128-A01 · 남은 분석 | 보드·카드·빈 화면 삽화의 치수와 원본 에셋, Board 선택기·Filters·검색 결과의 미노출 상태를 별도로 명세해야 한다. | [G25](<GOAL-SPECS/G25.md>) | 분석 대기 |

<a id="r4-f129"></a>
### F129 — Tasks/Adding a task (template)

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Tasks/Adding a task (template)/ANALYSIS.md>) · Flow ID `d348e200-5e48-4825-a646-69a6741e85d8` · [G31](<GOAL-SPECS/G31.md>) 01~07단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f129-o01"></a>R4-F129-O01 · 관찰 | 01→02에서 기존 Initial Chat 카드가 In Progress에서 Done으로 이동하지만 중간 조작은 포착되지 않았다. 02의 검은 툴팁은 New Task 오른쪽 아이콘에 연결된다. | [G31](<GOAL-SPECS/G31.md>) | 미대조 |
| <a id="r4-f129-o02"></a>R4-F129-O02 · 관찰 | 03의 두 Select가 비어 있을 때 버튼은 진한 녹색, 04에서 템플릿만 선택했을 때 연녹색, 05에서 두 값이 선택되면 진한 녹색이다. 색상만으로 일관된 활성화 규칙을 확정할 수 없다. | [G31](<GOAL-SPECS/G31.md>) | 미대조 |
| <a id="r4-f129-o03"></a>R4-F129-O03 · 관찰 | 06의 신규 Update company guideline 카드는 Consulting Project / No due date로 To Do에 나타난다. 07에서는 Feb 09로 바뀌지만 날짜를 지정하는 조작은 없으므로 템플릿이 기한을 자동 복사했다고 단정하지 않는다. | [G31](<GOAL-SPECS/G31.md>) | 미대조 |
| <a id="r4-f129-a01"></a>R4-F129-A01 · 남은 분석 | 선택 목록의 전체 옵션, 템플릿 파일·하위 작업 복사 결과, 기한 변경 원인, 버튼 활성 조건은 원본에 없는 상태로 남긴다. | [G31](<GOAL-SPECS/G31.md>) | 분석 대기 |

<a id="r4-f130"></a>
### F130 — Tasks/Creating a task template

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Tasks/Creating a task template/ANALYSIS.md>) · Flow ID `4c98a858-6ef7-4a6a-8e83-e626772a4df0` · [G30](<GOAL-SPECS/G30.md>) 01~04단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f130-o01"></a>R4-F130-O01 · 관찰 | New Task Template 모달은 좁은 중앙 패널이며 Template Name, 회색 Default Project Tasks, 바깥 닫기 X와 아래 지원 링크가 있다. 입력 전에도 진한 녹색 버튼이 보인다. | [G30](<GOAL-SPECS/G30.md>) | 미대조 |
| <a id="r4-f130-o02"></a>R4-F130-O02 · 관찰 | 입력된 Default Task와 저장 후 제목·연필 아이콘·New Task·테두리 빈 상태·성공 토스트를 각각 재현한다. | [G30](<GOAL-SPECS/G30.md>) | 미대조 |
| <a id="r4-f130-a01"></a>R4-F130-A01 · 남은 분석 | 회색 예시 문자열의 placeholder 여부, 빈 이름 검증, 이름 수정 및 여러 템플릿 목록은 추가 근거가 필요하다. 모달 치수·빈 상태 에셋을 명세해야 한다. | [G30](<GOAL-SPECS/G30.md>) | 분석 대기 |

<a id="r4-f131"></a>
### F131 — Tasks/Editing a template task

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Tasks/Editing a template task/ANALYSIS.md>) · Flow ID `91a75fcf-9857-41ff-85c2-c2de0bae87d9` · [G30](<GOAL-SPECS/G30.md>) 01~08단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f131-o01"></a>R4-F131-O01 · 관찰 | 새 작업을 추가하는 문맥에서도 모달 제목은 Edit Template Task이며 왼쪽 아래에 빨간 Delete Task가 있다. 템플릿 생성 모달보다 크다. | [G30](<GOAL-SPECS/G30.md>) | 미대조 |
| <a id="r4-f131-o02"></a>R4-F131-O02 · 관찰 | 04는 첨부 파일명과 구름 아이콘, 05는 같은 파일의 그라데이션 썸네일이다. 첨부 중간 상태와 최종 미리보기를 분리한다. | [G30](<GOAL-SPECS/G30.md>) | 미대조 |
| <a id="r4-f131-o03"></a>R4-F131-O03 · 관찰 | 하위 작업의 Save와 전체 Save Task는 서로 다른 버튼이다. 06에서는 + Add Subtask가 돌아오고 07에는 미완료 하위 작업 두 개가 보인다. 긴 모달의 스크롤로 제목이 화면 위로 사라지는 상태와 08의 접힌 목록 행을 보존한다. | [G30](<GOAL-SPECS/G30.md>) | 미대조 |
| <a id="r4-f131-a01"></a>R4-F131-A01 · 남은 분석 | 첨부 미리보기 에셋·로딩 상태, 모달 스크롤 영역·높이, 두 저장 동작의 지속성, 템플릿 적용 시 파일·하위 작업 복사 결과를 추가 명세해야 한다. 두 번째 하위 작업 입력 장면은 없다. | [G30](<GOAL-SPECS/G30.md>) | 분석 대기 |

<a id="r4-f132"></a>
### F132 — Terms & Conditions

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Terms & Conditions/ANALYSIS.md>) · Flow ID `912b4b75-77bb-43fa-b86f-d85c6117841a` · [G09](<GOAL-SPECS/G09.md>) 01~01단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f132-o01"></a>R4-F132-O01 · 관찰 | 공개 사이트의 기본 내비게이션과 보조 내비게이션 아래에 Terms & Conditions 제목과 좁은 본문 열이 있다. 앱 내부 사이드바 레이아웃과 다르다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f132-o02"></a>R4-F132-O02 · 관찰 | Last Updated: June 30, 2020과 Bonsai's Services, General Rules About Creating Accounts가 보이는 상단 캡처다. 한 장을 약관 전체 내용이나 최신 약관의 근거로 취급하지 않는다. | [G09](<GOAL-SPECS/G09.md>) | 미대조 |
| <a id="r4-f132-a01"></a>R4-F132-A01 · 남은 분석 | 원본에 없는 하단 약관·푸터·링크 이동은 미확인이다. 본문 열 폭·줄바꿈·제목 간격·공개 사이트 글꼴을 원본 기준으로 명세해야 한다. | [G09](<GOAL-SPECS/G09.md>) | 분석 대기 |

<a id="r4-f133"></a>
### F133 — Time Tracking

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Time Tracking/ANALYSIS.md>) · Flow ID `525f8723-dca6-4932-ac6e-d159249090be` · [G34](<GOAL-SPECS/G34.md>) 01~06단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f133-o01"></a>R4-F133-O01 · 관찰 | 시간 목록은 날짜별 그룹 합계와 개별 행의 시간·금액·프로젝트·JD 아바타를 함께 보여준다. 02의 Today 01:00:07과 03의 Feb 7 / Feb 6 두 그룹을 구분한다. | [G34](<GOAL-SPECS/G34.md>) | 미대조 |
| <a id="r4-f133-o02"></a>R4-F133-O02 · 관찰 | 04→05에서는 숫자 합계와 날짜 범위가 같은데 그래프 막대 높이가 다르다. 새 기록 반영·축 변경·애니메이션 중 무엇인지 원본만으로 확정할 수 없다. | [G34](<GOAL-SPECS/G34.md>) | 미대조 |
| <a id="r4-f133-o03"></a>R4-F133-O03 · 관찰 | 06은 본문을 내려 Timesheet Report의 프로젝트·두 기록·Total amount $20.04 / Total hours 01:00:07을 보여준다. 상단 툴바는 화면 밖으로 사라지고 사이드바는 남는다. | [G34](<GOAL-SPECS/G34.md>) | 미대조 |
| <a id="r4-f133-a01"></a>R4-F133-A01 · 남은 분석 | 그래프 축·높이 변화 원인·호버·빈 결과, 시간 목록 옵션 및 필터는 추가 근거가 필요하다. 전체 스크롤과 고정 영역·표의 열 폭을 명세해야 한다. | [G34](<GOAL-SPECS/G34.md>) | 분석 대기 |

<a id="r4-f134"></a>
### F134 — Using invoice generator

원본: [ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · Flow ID `1a82151c-9539-4a12-8a4d-706c8557370b` · [G07](<GOAL-SPECS/G07.md>) 01~05단계

| ID·구분 | R4 원문 | 검토 담당 | 현재 상태 |
| --- | --- | --- | --- |
| <a id="r4-f134-o01"></a>R4-F134-O01 · 관찰 | 공개 Invoice Generator는 회색 둥근 패널, 고객 입력과 항목 표 사이의 큰 공백, 녹색 합계 행과 작은 Remove / Add Item 버튼을 사용한다. | [G07](<GOAL-SPECS/G07.md>) | 미대조 |
| <a id="r4-f134-o02"></a>R4-F134-O02 · 관찰 | Poster Design / Quantity 1 / Unit Price 10에서 Subtotal 10.00, Tax (15%) 1.50, Total 11.50이 보이며 두 번째 빈 행 추가 후에도 합계는 같다. Due Date는 15/02/2024다. | [G07](<GOAL-SPECS/G07.md>) | 미대조 |
| <a id="r4-f134-o03"></a>R4-F134-O03 · 관찰 | 마지막은 Work Email / Full Name / Password / CAPTCHA가 있는 가입 화면이다. PDF 다운로드 완료나 입력한 청구서의 가입 화면 자동 복사는 확인되지 않는다. | [G07](<GOAL-SPECS/G07.md>) | 미대조 |
| <a id="r4-f134-a01"></a>R4-F134-A01 · 남은 분석 | 실제 파일 생성·다운로드 결과, 가입 이후 데이터 유지, 세율·기한 편집·입력 오류 규칙은 미확인이다. 공개 생성기와 가입 화면의 서로 다른 색상·패널·에셋을 명세해야 한다. | [G07](<GOAL-SPECS/G07.md>) | 분석 대기 |

## 8. 계획 반영 검토 기록

문서 반영과 정적 검증 결과는 [이번 문서 검토](../RESULTS/SOURCE_ANALYSIS_PLAN_REVIEW.md)에 기록한다. 원본 재검토·현재 FE 비교·앱 테스트 결과와 구분한다.

<a id="shared-screens"></a>
## 9. 여러 Goal이 공유하는 원본 화면의 영향

서로 다른 Goal의 단계에서 같은 Screen ID가 등장하는 화면은 **57개·148회 등장·72개 Goal**이다. 원본 색인과 실제 PNG의 동일 해시를 기준으로 연결하며, 각 단계의 기존 담당은 그대로 둔다. 공통 화면 수정 시 아래 소비 Goal의 해당 상태를 함께 확인한다. 현재 구현의 컴포넌트 공유 여부나 회귀 통과를 판정한 목록은 아니다.

공통 셸·폰트·버튼이 서로 다른 Screen ID에도 쓰일 수 있으므로 이 표가 공통 변경의 전체 영향 범위를 대신하지 않는다. 실제 컴포넌트 소비 화면과 화면별 변형은 요소 대응표에서 추가한다. 공유 화면 0개인 G도 공통 기준 검토 대상이다. 같은 화면이 등장해도 동일 업무 객체나 플로우 간 자동 전환을 의미하지 않는다.

| 공유 Screen ID | 확인할 Goal | 원본 등장 위치 |
| --- | --- | --- |
| `sc_07904520440b4dc7ad7d6d31bf3a03e9` | [G10](GOAL-SPECS/G10.md), [G11](GOAL-SPECS/G11.md) | [G11 · F083/01](#r4-f083), [G10 · F086/01](#r4-f086) |
| `sc_10567e85a1db45959f5fee59dfe269aa` | [G50](GOAL-SPECS/G50.md), [G51](GOAL-SPECS/G51.md) | [G51 · F044/01](#r4-f044), [G50 · F047/08](#r4-f047) |
| `sc_1111f74eeb134598ba67aa4fb5da3e37` | [G59](GOAL-SPECS/G59.md), [G60](GOAL-SPECS/G60.md), [G62](GOAL-SPECS/G62.md) | [G59 · F072/04](#r4-f072), [G60 · F076/01](#r4-f076), [G62 · F077/01](#r4-f077) |
| `sc_12595f0282da469b919de850906c592c` | [G25](GOAL-SPECS/G25.md), [G33](GOAL-SPECS/G33.md) | [G33 · F095/01](#r4-f095), [G25 · F093/06](#r4-f093) |
| `sc_21c57bdee8d94269af945440ba1c1c84` | [G21](GOAL-SPECS/G21.md), [G23](GOAL-SPECS/G23.md) | [G23 · F106/01](#r4-f106), [G21 · F107/06](#r4-f107) |
| `sc_21f42247e22948b3b35d5313e9e315a5` | [G55](GOAL-SPECS/G55.md), [G56](GOAL-SPECS/G56.md), [G57](GOAL-SPECS/G57.md) | [G57 · F071/08](#r4-f071), [G55 · F070/02](#r4-f070), [G56 · F078/01](#r4-f078) |
| `sc_25261ff6e5d44d70885c07b053f29685` | [G11](GOAL-SPECS/G11.md), [G74](GOAL-SPECS/G74.md), [G82](GOAL-SPECS/G82.md) | [G11 · F085/01](#r4-f085), [G82 · F088/02](#r4-f088), [G74 · F116/01](#r4-f116) |
| `sc_2586b49246f44022bf45b22d67ba23a8` | [G32](GOAL-SPECS/G32.md), [G33](GOAL-SPECS/G33.md) | [G33 · F095/06](#r4-f095), [G32 · F098/01](#r4-f098) |
| `sc_33b333fba9d34edbbd66ddfadf29dcb4` | [G10](GOAL-SPECS/G10.md), [G13](GOAL-SPECS/G13.md) | [G10 · F086/10](#r4-f086), [G13 · F087/01](#r4-f087) |
| `sc_33fdc633ac3c432eb0934dddfe05a1f7` | [G15](GOAL-SPECS/G15.md), [G74](GOAL-SPECS/G74.md) | [G74 · F116/03](#r4-f116), [G15 · F118/01](#r4-f118) |
| `sc_3588b6b5ac2447fdbc7ecb2454855fcf` | [G58](GOAL-SPECS/G58.md), [G59](GOAL-SPECS/G59.md) | [G59 · F072/01](#r4-f072), [G58 · F073/05](#r4-f073) |
| `sc_35ec0f745e63437994f49c24aa5aa8bb` | [G74](GOAL-SPECS/G74.md), [G77](GOAL-SPECS/G77.md) | [G74 · F116/06](#r4-f116), [G77 · F121/01](#r4-f121) |
| `sc_3ade80505ba3458cb239c839815b3750` | [G22](GOAL-SPECS/G22.md), [G23](GOAL-SPECS/G23.md), [G24](GOAL-SPECS/G24.md) | [G24 · F092/01](#r4-f092), [G23 · F106/09](#r4-f106), [G22 · F109/01](#r4-f109) |
| `sc_40ff225f161846249b5cf8c2c55423b6` | [G19](GOAL-SPECS/G19.md), [G57](GOAL-SPECS/G57.md) | [G19 · F003/02](#r4-f003), [G57 · F071/01](#r4-f071) |
| `sc_455f71d704fd4c01b41254a6f93a21fa` | [G36](GOAL-SPECS/G36.md), [G38](GOAL-SPECS/G38.md) | [G36 · F030/12](#r4-f030), [G38 · F037/01](#r4-f037) |
| `sc_4eb809c84e384bc98dd5ee91561a1483` | [G63](GOAL-SPECS/G63.md), [G67](GOAL-SPECS/G67.md) | [G63 · F008/03](#r4-f008), [G67 · F015/01](#r4-f015) |
| `sc_529048e78b304f66937c84b12cbc8a07` | [G44](GOAL-SPECS/G44.md), [G51](GOAL-SPECS/G51.md), [G52](GOAL-SPECS/G52.md) | [G52 · F045/01](#r4-f045), [G51 · F046/10](#r4-f046), [G44 · F049/01](#r4-f049) |
| `sc_531ce252700c43088b29703be32726d6` | [G19](GOAL-SPECS/G19.md), [G73](GOAL-SPECS/G73.md) | [G19 · F019/03](#r4-f019), [G73 · F022/01](#r4-f022) |
| `sc_547a933e0b3d47789feee75514074502` | [G49](GOAL-SPECS/G49.md), [G50](GOAL-SPECS/G50.md) | [G50 · F043/01](#r4-f043), [G49 · F042/08](#r4-f042) |
| `sc_54a522cdaf524c81b83ad5dbccf32762` | [G46](GOAL-SPECS/G46.md), [G48](GOAL-SPECS/G48.md) | [G46 · F059/05](#r4-f059), [G48 · F061/01](#r4-f061) |
| `sc_56bf12a78bd64f6b972ecb048efd8d14` | [G44](GOAL-SPECS/G44.md), [G45](GOAL-SPECS/G45.md), [G47](GOAL-SPECS/G47.md) | [G44 · F052/05](#r4-f052), [G45 · F058/01](#r4-f058), [G47 · F063/01](#r4-f063) |
| `sc_5ed82da31d4542d1971fce527dc0584d` | [G74](GOAL-SPECS/G74.md), [G75](GOAL-SPECS/G75.md) | [G74 · F116/05](#r4-f116), [G75 · F120/01](#r4-f120) |
| `sc_6ec51256385940f2bd7d36a76874d691` | [G25](GOAL-SPECS/G25.md), [G30](GOAL-SPECS/G30.md) | [G25 · F128/03](#r4-f128), [G30 · F130/01](#r4-f130) |
| `sc_6f751d09df314d7f94be053f43818f5f` | [G38](GOAL-SPECS/G38.md), [G39](GOAL-SPECS/G39.md) | [G39 · F035/01](#r4-f035), [G38 · F036/08](#r4-f036) |
| `sc_762c1f934fdf40c0a61898b036cf4616` | [G63](GOAL-SPECS/G63.md), [G65](GOAL-SPECS/G65.md), [G66](GOAL-SPECS/G66.md), [G68](GOAL-SPECS/G68.md) | [G63 · F008/05](#r4-f008), [G65 · F013/01](#r4-f013), [G68 · F016/01](#r4-f016), [G66 · F017/01](#r4-f017) |
| `sc_7a2bb697a852495e8fd9be9fe6563b0a` | [G20](GOAL-SPECS/G20.md), [G21](GOAL-SPECS/G21.md) | [G21 · F021/01](#r4-f021), [G20 · F023/03](#r4-f023) |
| `sc_7c8264e8239e464abd4219d7b9828199` | [G13](GOAL-SPECS/G13.md), [G15](GOAL-SPECS/G15.md) | [G15 · F039/01](#r4-f039), [G13 · F087/14](#r4-f087) |
| `sc_8557a3e41edc402a8ebdf39022ee8d44` | [G24](GOAL-SPECS/G24.md), [G29](GOAL-SPECS/G29.md) | [G29 · F099/01](#r4-f099), [G24 · F092/03](#r4-f092) |
| `sc_855aa87503994667b3fd5b8d6be847e2` | [G15](GOAL-SPECS/G15.md), [G49](GOAL-SPECS/G49.md) | [G15 · F039/08](#r4-f039), [G49 · F042/01](#r4-f042) |
| `sc_8afa6c0d651c411eb077be375ebba010` | [G39](GOAL-SPECS/G39.md), [G54](GOAL-SPECS/G54.md) | [G39 · F031/01](#r4-f031), [G54 · F033/01](#r4-f033), [G39 · F035/06](#r4-f035) |
| `sc_8e868b8f4bf24c25ba59cbdb3a6094dd` | [G41](GOAL-SPECS/G41.md), [G42](GOAL-SPECS/G42.md) | [G41 · F026/18](#r4-f026), [G42 · F027/01](#r4-f027), [G42 · F028/01](#r4-f028) |
| `sc_9003a9b8ddee4c889190b4fb9e8550f5` | [G52](GOAL-SPECS/G52.md), [G53](GOAL-SPECS/G53.md) | [G52 · F045/02](#r4-f045), [G53 · F048/01](#r4-f048) |
| `sc_9164a60dde6c4aa9a52899d31fd2b949` | [G79](GOAL-SPECS/G79.md), [G80](GOAL-SPECS/G80.md) | [G79 · F126/10](#r4-f126), [G80 · F127/01](#r4-f127) |
| `sc_92611ceaf06340ae99ed8df9b666d850` | [G26](GOAL-SPECS/G26.md), [G28](GOAL-SPECS/G28.md), [G33](GOAL-SPECS/G33.md) | [G33 · F095/05](#r4-f095), [G26 · F096/01](#r4-f096), [G28 · F101/01](#r4-f101) |
| `sc_9d353458318e43e7b25ebbf88fefeaa9` | [G11](GOAL-SPECS/G11.md), [G12](GOAL-SPECS/G12.md), [G76](GOAL-SPECS/G76.md) | [G11 · F083/02](#r4-f083), [G12 · F084/01](#r4-f084), [G76 · F117/05](#r4-f117) |
| `sc_a0fa68609b634defb4a2ccd18b63a4a2` | [G19](GOAL-SPECS/G19.md), [G67](GOAL-SPECS/G67.md) | [G19 · F003/01](#r4-f003), [G67 · F041/11](#r4-f041) |
| `sc_a2d30da474bc43909f17e726b0559b83` | [G16](GOAL-SPECS/G16.md), [G74](GOAL-SPECS/G74.md) | [G74 · F116/08](#r4-f116), [G16 · F119/01](#r4-f119) |
| `sc_a333622d5e8c45e0b19ff4c249dc0aca` | [G14](GOAL-SPECS/G14.md), [G17](GOAL-SPECS/G17.md), [G19](GOAL-SPECS/G19.md), [G22](GOAL-SPECS/G22.md), [G25](GOAL-SPECS/G25.md), [G32](GOAL-SPECS/G32.md), [G34](GOAL-SPECS/G34.md), [G35](GOAL-SPECS/G35.md), [G36](GOAL-SPECS/G36.md), [G40](GOAL-SPECS/G40.md), [G45](GOAL-SPECS/G45.md), [G52](GOAL-SPECS/G52.md), [G55](GOAL-SPECS/G55.md), [G63](GOAL-SPECS/G63.md), [G71](GOAL-SPECS/G71.md), [G72](GOAL-SPECS/G72.md), [G81](GOAL-SPECS/G81.md), [G82](GOAL-SPECS/G82.md) | [G63 · F008/01](#r4-f008), [G19 · F019/01](#r4-f019), [G81 · F025/01](#r4-f025), [G40 · F026/01](#r4-f026), [G36 · F030/01](#r4-f030), [G72 · F038/01](#r4-f038), [G14 · F053/01](#r4-f053), [G45 · F057/01](#r4-f057), [G17 · F068/01](#r4-f068), [G55 · F070/01](#r4-f070), [G82 · F088/01](#r4-f088), [G22 · F105/01](#r4-f105), [G52 · F111/01](#r4-f111), [G71 · F113/01](#r4-f113), [G35 · F114/01](#r4-f114), [G32 · F125/01](#r4-f125), [G25 · F128/01](#r4-f128), [G34 · F133/01](#r4-f133) |
| `sc_aa221ac7066a427db6aae5b18f0acab4` | [G57](GOAL-SPECS/G57.md), [G58](GOAL-SPECS/G58.md) | [G57 · F071/06](#r4-f071), [G58 · F074/01](#r4-f074) |
| `sc_adaec91541ec4d51b64abcf3e5ef2d72` | [G37](GOAL-SPECS/G37.md), [G38](GOAL-SPECS/G38.md) | [G37 · F032/01](#r4-f032), [G38 · F037/05](#r4-f037) |
| `sc_adeac0011d87480980cfd58e53e4d751` | [G21](GOAL-SPECS/G21.md), [G23](GOAL-SPECS/G23.md), [G24](GOAL-SPECS/G24.md), [G25](GOAL-SPECS/G25.md) | [G21 · F021/04](#r4-f021), [G25 · F093/01](#r4-f093), [G24 · F092/02](#r4-f092), [G24 · F102/01](#r4-f102), [G23 · F104/01](#r4-f104) |
| `sc_b1619b6b9fc3405e8ad67fd26f405b62` | [G19](GOAL-SPECS/G19.md), [G20](GOAL-SPECS/G20.md) | [G19 · F003/06](#r4-f003), [G20 · F023/01](#r4-f023) |
| `sc_b4a7de1ea55c4debb7bd86e0263b7563` | [G44](GOAL-SPECS/G44.md), [G67](GOAL-SPECS/G67.md) | [G67 · F041/01](#r4-f041), [G44 · F049/02](#r4-f049) |
| `sc_b8ed116f56354559846a960779fa7c5d` | [G74](GOAL-SPECS/G74.md), [G78](GOAL-SPECS/G78.md) | [G74 · F116/10](#r4-f116), [G78 · F122/01](#r4-f122) |
| `sc_c3ed26151c6f4f72b154852639f26757` | [G17](GOAL-SPECS/G17.md), [G74](GOAL-SPECS/G74.md) | [G74 · F116/09](#r4-f116), [G17 · F123/01](#r4-f123) |
| `sc_caa5fecb95834209b2da82d078b11ebb` | [G63](GOAL-SPECS/G63.md), [G64](GOAL-SPECS/G64.md), [G70](GOAL-SPECS/G70.md) | [G64 · F010/01](#r4-f010), [G63 · F008/04](#r4-f008), [G70 · F014/01](#r4-f014) |
| `sc_cbb5f16996764c49a4df94659a235efa` | [G37](GOAL-SPECS/G37.md), [G38](GOAL-SPECS/G38.md) | [G37 · F034/07](#r4-f034), [G38 · F036/01](#r4-f036) |
| `sc_cc68ecaccb72426b8573fca9ece52fc9` | [G19](GOAL-SPECS/G19.md), [G20](GOAL-SPECS/G20.md) | [G20 · F020/01](#r4-f020), [G19 · F019/05](#r4-f019) |
| `sc_da340557d84c4add8ac139af9a629557` | [G58](GOAL-SPECS/G58.md), [G61](GOAL-SPECS/G61.md) | [G58 · F073/01](#r4-f073), [G58 · F074/02](#r4-f074), [G61 · F075/01](#r4-f075) |
| `sc_da6135eadeff44e49c083b563487ddf5` | [G21](GOAL-SPECS/G21.md), [G22](GOAL-SPECS/G22.md) | [G22 · F105/02](#r4-f105), [G21 · F107/01](#r4-f107) |
| `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf` | [G26](GOAL-SPECS/G26.md), [G27](GOAL-SPECS/G27.md) | [G27 · F094/01](#r4-f094), [G26 · F096/10](#r4-f096) |
| `sc_e5796a038be54dbea1a32dd215a1cbb6` | [G63](GOAL-SPECS/G63.md), [G69](GOAL-SPECS/G69.md) | [G63 · F008/02](#r4-f008), [G69 · F012/01](#r4-f012) |
| `sc_e8689439c84b422fa72242c56784a19a` | [G45](GOAL-SPECS/G45.md), [G46](GOAL-SPECS/G46.md) | [G45 · F057/02](#r4-f057), [G46 · F059/01](#r4-f059) |
| `sc_ea042f68264945369fcad12326916b22` | [G29](GOAL-SPECS/G29.md), [G32](GOAL-SPECS/G32.md) | [G29 · F097/01](#r4-f097), [G32 · F098/05](#r4-f098) |
| `sc_eddad5fbd6db473080c167790ff3bd1c` | [G42](GOAL-SPECS/G42.md), [G43](GOAL-SPECS/G43.md) | [G42 · F028/03](#r4-f028), [G43 · F029/01](#r4-f029) |
| `sc_f81cdd742f9d4d09b96c9de95c4d0390` | [G74](GOAL-SPECS/G74.md), [G76](GOAL-SPECS/G76.md) | [G74 · F116/02](#r4-f116), [G76 · F117/01](#r4-f117), [G74 · F124/01](#r4-f124) |
| `sc_fd79ede42b9843aca369d4e929c4272c` | [G25](GOAL-SPECS/G25.md), [G31](GOAL-SPECS/G31.md) | [G31 · F129/01](#r4-f129), [G25 · F128/02](#r4-f128) |

## G01 선택 실행 결과 — 2026-11-23 KST

[x] 공통 12기준의 이번 적용 근거와 원본→분석→계획→코드를 [선택 요소 대응](../RESULTS/G01_RECHECK_RESULT.md#g01-elements)에 기록했다. [x] G01 Dialog 결함/회귀와 직접 소비 화면 영향 확인. [ ] 폰트·자산·픽셀 동일성/전수 요소·실제 OS IME 등 미완 유지. G14 7개 메모를 비롯한 다른 Goal 전체의 개별 판정은 바꾸지 않았다. PLAN-INDEX의 `scoped_reviews`/`common_requirements[].g01_recheck`와 같은 범위다.

## G02 현재 소비 대조 — 2026-11-23 KST

[현재 결과·20PNG/코드·공통12개 기준·검증 한계](../RESULTS/G02_RECHECK_RESULT.md#g02-r4-recheck). R4-F082-O01/O02는 주요 구성 비교·유지, O03은 구성 유지와 정밀 시각 분석 대기, A01은 일부 출처 보완과 잔여 분석 대기다. 최초 O01/O02/O03=미대조, A01=분석 대기 및 implementation_assessment=미검토는 PLAN-INDEX의 plan_snapshot에 보존했다. 원문/해시/담당 G/R은 바꾸지 않았다.

1차 메뉴 초점3경로·후기 강조1곳 및112/12 통과 이후, [추가 검토](../RESULTS/G02_RECHECK_RESULT.md#g02-followup-review)에서 같은 목적지 재선택의 메뉴 종료/초점을 보완했다. 현재 전체 단위/DOM114개·대상14개 및 메모리 빌드 통과. 실제 브라우저 상세/네트워크·픽셀 동일성은 미검증이다. 공통12개 기준의 G02별 부분 판정은 결과10.3과 PLAN-INDEX.common_requirements[].g02_recheck에 연결하며 전체 공통 완료를 뜻하지 않는다. G01 보완 이력·시각/환경 대기, R01 전체·다른 Goal 전체 대기를 유지한다.

## G03 적용 판정 — 2026-11-23~24 KST

[현재 결과10.2~10.6](../RESULTS/G03_RESULT.md#g03-r4-recheck)에 22단계/R4 11항목/공통12기준의 부분 판정과 코드·검증·담당을 연결했다. 관찰8항목은 주요 구성 대조(유지6/구현 보완2), 남은 분석3항목은 대기다. 전수 요소 계수/시각 동일성 인증은 아니다. 공통12기준의 전체 상태·원본 메모 해시·단계 소유는 유지하고 PLAN-INDEX의 g03_recheck에 한정 결과를 기록했다.
