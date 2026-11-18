# Bookkeeping overview 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `2c50f586-bb35-480c-a7bc-fdd3857a6f81` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=2c50f586-bb35-480c-a7bc-fdd3857a6f81) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

장부 손익의 월별 툴팁과 비용 분류별 비중·세부 항목을 탐색한다.

- 로그인한 내부 사용자 관점. 재무 보기 권한과 계정 통화 범위는 미확인.
- 시작: Overview 상단 그래프. 종료: 비용 분류 집계의 스크롤 하단.
- 모든 단계가 읽기·표시 상태이며 비용 생성·편집 과정은 포함하지 않는다.
- 프론트 구현: 그래프 포인트 팝오버, 복수 아코디언, 비용 0인 항목, 스크롤 중 사이드바 유지.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Bookkeeping/Bookkeeping overview`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_e5796a038be54dbea1a32dd215a1cbb6`](https://gummble.com/screens/sc_e5796a038be54dbea1a32dd215a1cbb6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Bookkeeping Overview](<screens/01_sc_e5796a038be54dbea1a32dd215a1cbb6.png>) | 월별 Jun Totals 툴팁이 그래프 위에 표시된다. |
| 02 | [`sc_c3e6af1089b74d0685b00570a1df539c`](https://gummble.com/screens/sc_c3e6af1089b74d0685b00570a1df539c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [손익 그래프 툴팁](<screens/02_sc_c3e6af1089b74d0685b00570a1df539c.png>) | Overview 아래 Expenses 집계 영역으로 스크롤된다. |
| 03 | [`sc_8880610ec03543c9834f9fcedaccc4ba`](https://gummble.com/screens/sc_8880610ec03543c9834f9fcedaccc4ba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 분류별 집계](<screens/03_sc_8880610ec03543c9834f9fcedaccc4ba.png>) | Ads & Marketing 그룹 아래 Advertising 항목이 펼쳐진다. |
| 04 | [`sc_1998e9e1c7434ddf80607ea6fb9eb958`](https://gummble.com/screens/sc_1998e9e1c7434ddf80607ea6fb9eb958?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [광고 분류 집계 펼침](<screens/04_sc_1998e9e1c7434ddf80607ea6fb9eb958.png>) | Personal도 펼쳐지고 광고 그룹은 열린 상태를 유지한다. |
| 05 | [`sc_864ff7ecccc448e5a5a093cb0e963692`](https://gummble.com/screens/sc_864ff7ecccc448e5a5a093cb0e963692?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [복수 분류 집계 펼침](<screens/05_sc_864ff7ecccc448e5a5a093cb0e963692.png>) | 분류 목록 하단으로 스크롤해 Vehicle·COGS·Uncategorized를 확인한다. |
| 06 | [`sc_5774f61a886044dca88ef77e30184bf2`](https://gummble.com/screens/sc_5774f61a886044dca88ef77e30184bf2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [분류 집계 하단](<screens/06_sc_5774f61a886044dca88ef77e30184bf2.png>) | 읽기 화면에서 기록 종료. |

## 4. 화면별 상세 분석

### 단계 01 — Bookkeeping Overview

- Screen ID: `sc_e5796a038be54dbea1a32dd215a1cbb6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e5796a038be54dbea1a32dd215a1cbb6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ff5d860-6882-40cc-b2ba-86a55023ede9.png)
- 로컬 이미지: [01_sc_e5796a038be54dbea1a32dd215a1cbb6.png](<screens/01_sc_e5796a038be54dbea1a32dd215a1cbb6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_c3e6af1089b74d0685b00570a1df539c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 앱 프레임. Overview/Expenses/Income 탭, 날짜 범위와 통화, 좌측 손익 그래프·집계, 우측 연동 및 보고서.
- 입력 항목·필수 표시·기본값: 범위 Jan 1–Feb 6 2024, 통화 USD. 샘플 값은 설정 기본값으로 확정하지 않는다.
- 버튼·메뉴·안내 문구: QuickBooks Connect Account, Profit & Loss Statement, Invoices CSV, Expenses CSV, View Expenses, Edit Categories.
- 확인된 상태: Other Income 160, Expenses 165, Profit -5가 함께 보이며 수입·지출 그래프가 존재한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 수입·비용과 손익을 별도 집계한다. 외부 연동 성공이나 CSV 다운로드 내용은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미수금 포함 여부, 집계 기준일·통화 변환·비용의 세금 처리.

#### 모델링 영향

- 후보와 근거: 수입·비용 분리, 통화·기간별 집계, 외부 회계 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 손익 그래프 툴팁

- Screen ID: `sc_c3e6af1089b74d0685b00570a1df539c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c3e6af1089b74d0685b00570a1df539c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/572fa314-33ae-44a1-b906-768333d7cc8b.png)
- 로컬 이미지: [02_sc_c3e6af1089b74d0685b00570a1df539c.png](<screens/02_sc_c3e6af1089b74d0685b00570a1df539c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e5796a038be54dbea1a32dd215a1cbb6` → 현재 → `sc_8880610ec03543c9834f9fcedaccc4ba`

#### 화면에서 직접 확인한 내용

- 레이아웃: Overview 그래프 위에 검은 Jun Totals 팝오버.
- 입력 항목·필수 표시·기본값: Paid / Expenses / Profit 모두 0으로 표시.
- 버튼·메뉴·안내 문구: 월별 그래프 포인트, 날짜·통화 선택기, 보고서 링크.
- 확인된 상태: 그래프의 한 시점이 강조된다.
- 단계 간 변화: 월별 Jun Totals 툴팁이 그래프 위에 표시된다.

#### 동작과 데이터

- 화면 관찰: 표시 기간은 1–2월인데 툴팁은 6월이다. 축·샘플 데이터 불일치 가능성을 기록한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 호버와 클릭 중 트리거, 기간에 따른 축 범위와 월별 계산.

#### 모델링 영향

- 후보와 근거: 시계열 집계와 포인트 툴팁의 표시 데이터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비용 분류별 집계

- Screen ID: `sc_8880610ec03543c9834f9fcedaccc4ba`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8880610ec03543c9834f9fcedaccc4ba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1daf7aed-07c7-4f75-8851-d17ed636af25.png)
- 로컬 이미지: [03_sc_8880610ec03543c9834f9fcedaccc4ba.png](<screens/03_sc_8880610ec03543c9834f9fcedaccc4ba.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c3e6af1089b74d0685b00570a1df539c` → 현재 → `sc_1998e9e1c7434ddf80607ea6fb9eb958`

#### 화면에서 직접 확인한 내용

- 레이아웃: Overview 하단 Expenses 영역. 좌측 분류 비율·금액, 우측 세금 서비스 홍보.
- 입력 항목·필수 표시·기본값: Billable 125 / Non-Billable 40 / Avg Per Month 15. Ads & Marketing 75%, Personal 24%.
- 버튼·메뉴·안내 문구: View Expenses / Edit Categories / 그룹별 펼치기.
- 확인된 상태: 비용 0인 그룹도 목록에 유지된다.
- 단계 간 변화: Overview 아래 Expenses 집계 영역으로 스크롤된다.

#### 동작과 데이터

- 화면 관찰: 금액 합계 165와 비율 75+24=99가 보인다. 반올림 방식과 평균 기간은 추정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 평균 분모와 소수점 비율 처리, 0그룹 숨김 옵션.

#### 모델링 영향

- 후보와 근거: 청구 가능 여부별 집계, 그룹별 합계와 표시 반올림 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 광고 분류 집계 펼침

- Screen ID: `sc_1998e9e1c7434ddf80607ea6fb9eb958`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1998e9e1c7434ddf80607ea6fb9eb958?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c4cf3f41-d70d-4071-9feb-0ec33457f814.png)
- 로컬 이미지: [04_sc_1998e9e1c7434ddf80607ea6fb9eb958.png](<screens/04_sc_1998e9e1c7434ddf80607ea6fb9eb958.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8880610ec03543c9834f9fcedaccc4ba` → 현재 → `sc_864ff7ecccc448e5a5a093cb0e963692`

#### 화면에서 직접 확인한 내용

- 레이아웃: Ads & Marketing 아래 Advertising 자식행과 수평 막대.
- 입력 항목·필수 표시·기본값: 그룹과 자식에 각각 125 표시.
- 버튼·메뉴·안내 문구: Ads & Marketing 접기/펼치기 화살표.
- 확인된 상태: 광고 그룹만 펼쳐진 상태.
- 단계 간 변화: Ads & Marketing 그룹 아래 Advertising 항목이 펼쳐진다.

#### 동작과 데이터

- 화면 관찰: 그룹 합계와 세부 분류가 별도 계층으로 나타난다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복수 하위 분류가 있을 때 정렬·합계, 펼침 상태 저장.

#### 모델링 영향

- 후보와 근거: 그룹-분류 계층과 읽기용 breakdown 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 복수 분류 집계 펼침

- Screen ID: `sc_864ff7ecccc448e5a5a093cb0e963692`
- 원본: [화면 페이지](https://gummble.com/screens/sc_864ff7ecccc448e5a5a093cb0e963692?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a93b9dd9-20a7-46e4-81fe-f485ef96196f.png)
- 로컬 이미지: [05_sc_864ff7ecccc448e5a5a093cb0e963692.png](<screens/05_sc_864ff7ecccc448e5a5a093cb0e963692.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1998e9e1c7434ddf80607ea6fb9eb958` → 현재 → `sc_5774f61a886044dca88ef77e30184bf2`

#### 화면에서 직접 확인한 내용

- 레이아웃: Ads & Marketing와 Personal 모두 자식행이 표시됨.
- 입력 항목·필수 표시·기본값: Personal 자식 40, 광고 자식 125와 각 막대.
- 버튼·메뉴·안내 문구: 각 그룹 펼치기 화살표.
- 확인된 상태: 한 그룹을 열어도 앞서 열린 그룹이 유지된다.
- 단계 간 변화: Personal도 펼쳐지고 광고 그룹은 열린 상태를 유지한다.

#### 동작과 데이터

- 화면 관찰: 독립적으로 여러 그룹을 펼친 상태를 표현할 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 탭·새로고침 후 펼침 유지 여부.

#### 모델링 영향

- 후보와 근거: 복수 expanded group UI 상태 후보. DB 저장은 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 분류 집계 하단

- Screen ID: `sc_5774f61a886044dca88ef77e30184bf2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5774f61a886044dca88ef77e30184bf2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4f765964-182d-4c2a-8afb-dc9ffcc8f237.png)
- 로컬 이미지: [06_sc_5774f61a886044dca88ef77e30184bf2.png](<screens/06_sc_5774f61a886044dca88ef77e30184bf2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_864ff7ecccc448e5a5a093cb0e963692` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 세로 스크롤된 하단 목록과 유지된 좌측 사이드바.
- 입력 항목·필수 표시·기본값: Contract Labor, Employee Benefits, Meals & Entertainment, Office Expenses, Other Expenses, Commissions & Fees, Services, Rent & Equipment, Travel, Vehicle, COGS, Uncategorized에 0 표시.
- 버튼·메뉴·안내 문구: 각 그룹의 펼치기 표시.
- 확인된 상태: 값이 없는 그룹도 0%·0금액으로 존재한다.
- 단계 간 변화: 분류 목록 하단으로 스크롤해 Vehicle·COGS·Uncategorized를 확인한다.

#### 동작과 데이터

- 화면 관찰: 새 페이지가 아니라 같은 목록의 아래 영역으로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 스크롤 영역·가상화·숨김 기준과 미분류 항목 처리.

#### 모델링 영향

- 후보와 근거: 미분류 비용을 별도 표시하는 집계 bucket 후보. 별도 DB행 필요 여부는 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 그래프 툴팁은 Paid·Expenses·Profit 값을 함께 보여준다.
- 관찰: Billable 125와 Non-Billable 40을 분리하며 분류별 비율·금액을 표시한다.
- 관찰: 두 그룹이 동시에 열릴 수 있다. 하나만 열리는 아코디언으로 구현하지 않는다.
- 관찰: 0인 분류도 유지된다. 값이 없다는 이유로 숨기는 동작은 이 캡처와 다르다.
- 미확인: 표시 기간과 그래프 월의 불일치, Avg Per Month의 분모, 비율 합계 99%의 반올림 규칙.

## 6. 공식 도움말과 API 대조

- [비용 금액 구분](https://help.hellobonsai.com/en/articles/13159534-understanding-expense-amounts-after-tax-pre-tax-and-sales-price): 현재 도움말은 장부 Overview 지출 합계와 손익 보고서 비용의 세금 포함 기준을 구분한다. 두 화면의 숫자를 같은 산식으로 합치지 않는다.
- [공식 API](https://docs.hellobonsai.com/api): 공개 목록에서 이 그래프·분류 집계의 전용 endpoint·필드 계약은 확인하지 못했다. 프론트 표시는 관찰됐지만 조회 API는 미확정.
- 도움말의 현재 규칙이 캡처 시점에도 동일했는지는 미확인.

## 7. 데이터 모델링 시사점

- 설계 가정: 기간·통화·청구 가능 상태·카테고리를 축으로 하는 집계 결과가 필요하다.
- 설계 가정: 그룹/하위 분류/미분류 bucket과 금액·비율의 표시 단위를 분리한다.
- 설계 가정: 펼침 그룹 집합·호버 월은 UI 상태다. 서버 영속화는 관찰되지 않았다.
- 평균·비중·세전/세후 집계 계약을 결정하기 전에 실제 원장과 계산 결과를 대조한다.

## 8. 미확인 사항과 검토 질문

- 기간이 1–2월인데 Jun 툴팁이 보이는 이유는 샘플 데이터인가, 연간 축 표시인가? 실제 계정의 범위 변경으로 확인.
- Avg Per Month 15의 분모·0개월 포함 여부는 무엇인가? 수입/지출 기간을 바꿔 검증.
- 75%+24%=99% 표시는 내림인가 다른 반올림인가? 세 개 이상 비율과 경계값 조사.
- 개인 비용 포함 설정이 그래프·분류·CSV에 모두 적용되는가? 동일 계정 설정 전후 비교.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
