# Adding income manually 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **11/11단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `5b74c74e-20d1-4811-8d96-864144e38a65` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=5b74c74e-20d1-4811-8d96-864144e38a65) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 11단계 / 11단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 11개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

대시보드 온보딩에서 장부로 이동해 외부 수입100USD를 수기로 기록한다.

- 화면 날짜가Feb1→Feb2→Feb6으로 바뀌므로 연속 단일 세션으로 간주하지 않는다.
- 외부 플랫폼의 지급 사실을 수기로 기록하는 흐름이며 실제 송금이나 인보이스 결제를 실행하지 않는다.

- 상위 분석: [Dashboard](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Adding income manually`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b4a7de1ea55c4debb7bd86e0263b7563`](https://gummble.com/screens/sc_b4a7de1ea55c4debb7bd86e0263b7563?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 폼 온보딩](<screens/01_sc_b4a7de1ea55c4debb7bd86e0263b7563.png>) | 온보딩5단계로 이어진다.폼 완료 과정은 미수록. |
| 02 | [`sc_9679797f8dea4460ae60a82c9025245d`](https://gummble.com/screens/sc_9679797f8dea4460ae60a82c9025245d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [장부 온보딩 단계](<screens/02_sc_9679797f8dea4460ae60a82c9025245d.png>) | Set Up Now로 장부 진입한다. |
| 03 | [`sc_cb48bd5681ed473c9f825c679c7fd94a`](https://gummble.com/screens/sc_cb48bd5681ed473c9f825c679c7fd94a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비어 있는 장부 개요](<screens/03_sc_cb48bd5681ed473c9f825c679c7fd94a.png>) | 장부 하단을 둘러본다. |
| 04 | [`sc_39f99df8b20a4630aa10354888de6496`](https://gummble.com/screens/sc_39f99df8b20a4630aa10354888de6496?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [장부 하단 비용 빈 상태](<screens/04_sc_39f99df8b20a4630aa10354888de6496.png>) | Income 탭으로 이동한다. |
| 05 | [`sc_201401c0f84c45bbb4a43d2a52511e48`](https://gummble.com/screens/sc_201401c0f84c45bbb4a43d2a52511e48?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수입 목록 빈 상태](<screens/05_sc_201401c0f84c45bbb4a43d2a52511e48.png>) | New Income을 연다. |
| 06 | [`sc_82fc6d97532c459ca4c1802554ea4af7`](https://gummble.com/screens/sc_82fc6d97532c459ca4c1802554ea4af7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수입 생성 모달](<screens/06_sc_82fc6d97532c459ca4c1802554ea4af7.png>) | 이름/금액을 입력한다. |
| 07 | [`sc_a0f36c6973444bc985597697a3db6245`](https://gummble.com/screens/sc_a0f36c6973444bc985597697a3db6245?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수입 이름·금액 입력](<screens/07_sc_a0f36c6973444bc985597697a3db6245.png>) | 날짜 달력을 연다. |
| 08 | [`sc_5ce57ef5110b4f91bbe41131d32c3c46`](https://gummble.com/screens/sc_5ce57ef5110b4f91bbe41131d32c3c46?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수입 날짜 선택](<screens/08_sc_5ce57ef5110b4f91bbe41131d32c3c46.png>) | Feb1을 선택한다. |
| 09 | [`sc_0cbe7eb3ade1423d803954ac3013ec7b`](https://gummble.com/screens/sc_0cbe7eb3ade1423d803954ac3013ec7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [거래일 Feb1 변경](<screens/09_sc_0cbe7eb3ade1423d803954ac3013ec7b.png>) | Save Income을 실행한다. |
| 10 | [`sc_0155de50054a4706aac26286fbf5e600`](https://gummble.com/screens/sc_0155de50054a4706aac26286fbf5e600?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수입 저장 성공](<screens/10_sc_0155de50054a4706aac26286fbf5e600.png>) | 성공 토스트/수입 행 확인 후 Dashboard로 이동한다. |
| 11 | [`sc_a0fa68609b634defb4a2ccd18b63a4a2`](https://gummble.com/screens/sc_a0fa68609b634defb4a2ccd18b63a4a2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 복귀](<screens/11_sc_a0fa68609b634defb4a2ccd18b63a4a2.png>) | 대시보드에서 끝난다.그래프 변화의 전체 원인은 미확인. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 폼 온보딩

- Screen ID: `sc_b4a7de1ea55c4debb7bd86e0263b7563`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b4a7de1ea55c4debb7bd86e0263b7563?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7e881d80-6f7c-466f-98de-cf07cdc1038b.png)
- 로컬 이미지: [01_sc_b4a7de1ea55c4debb7bd86e0263b7563.png](<screens/01_sc_b4a7de1ea55c4debb7bd86e0263b7563.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9679797f8dea4460ae60a82c9025245d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 5단계 온보딩 중4번 선택,앞3개완료.
- 입력 항목·필수 표시·기본값: Create a contact form 설명,업무활동없음.
- 버튼·메뉴·안내 문구: Create Form,Next Step,Hide.
- 확인된 상태: 수입 생성 시작 전에 폼 설정 안내를 보고 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 온보딩 맥락만 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다음 단계의 완료 표시는 폼생성 생략 구간을 포함한다.

#### 모델링 영향

- 후보와 근거: 온보딩 상태와 도메인 데이터 생성 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 장부 온보딩 단계

- Screen ID: `sc_9679797f8dea4460ae60a82c9025245d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9679797f8dea4460ae60a82c9025245d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d687fffb-21ee-4d42-ae2c-bbd8ad6e3dfc.png)
- 로컬 이미지: [02_sc_9679797f8dea4460ae60a82c9025245d.png](<screens/02_sc_9679797f8dea4460ae60a82c9025245d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b4a7de1ea55c4debb7bd86e0263b7563` → 현재 → `sc_cb48bd5681ed473c9f825c679c7fd94a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 5번Automate your bookkeeping 선택,앞4개완료.
- 입력 항목·필수 표시·기본값: 날짜Feb2,체험7일 배너.
- 버튼·메뉴·안내 문구: Set Up Now,Hide.
- 확인된 상태: 수입/지출 추적 및 재무 개요 안내.
- 단계 간 변화: 온보딩5단계로 이어진다.폼 완료 과정은 미수록.

#### 동작과 데이터

- 화면 관찰: 장부 진입점.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 계좌 연결 자동화가 실제 실행된 것은 아니다.

#### 모델링 영향

- 후보와 근거: 장부 설정 진입 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비어 있는 장부 개요

- Screen ID: `sc_cb48bd5681ed473c9f825c679c7fd94a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cb48bd5681ed473c9f825c679c7fd94a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aacf0927-f11c-457d-9a49-1727cd0c7eaa.png)
- 로컬 이미지: [03_sc_cb48bd5681ed473c9f825c679c7fd94a.png](<screens/03_sc_cb48bd5681ed473c9f825c679c7fd94a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9679797f8dea4460ae60a82c9025245d` → 현재 → `sc_39f99df8b20a4630aa10354888de6496`

#### 화면에서 직접 확인한 내용

- 레이아웃: Bookkeeping Overview/Expenses/Income,기간/통화,손익빈상태,우측보고서/홍보.
- 입력 항목·필수 표시·기본값: Jan1~Feb6 2024,USD;No income or expenses yet.
- 버튼·메뉴·안내 문구: Add Income,Add Expense,Income탭,QuickBooks Connect Account,손익/InvoiceCSV/ExpenseCSV.
- 확인된 상태: 수입·지출 없는 안내.체험잔여3일로 바뀐다.
- 단계 간 변화: Set Up Now로 장부 진입한다.

#### 동작과 데이터

- 화면 관찰: 수기 입력 전 장부 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈상태가 선택기간 기준인지 전체계정 기준인지 미확인.

#### 모델링 영향

- 후보와 근거: 기간/통화 집계와 빈상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 장부 하단 비용 빈 상태

- Screen ID: `sc_39f99df8b20a4630aa10354888de6496`
- 원본: [화면 페이지](https://gummble.com/screens/sc_39f99df8b20a4630aa10354888de6496?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/17e12ca1-c8e5-46f7-ba57-063acc28b805.png)
- 로컬 이미지: [04_sc_39f99df8b20a4630aa10354888de6496.png](<screens/04_sc_39f99df8b20a4630aa10354888de6496.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cb48bd5681ed473c9f825c679c7fd94a` → 현재 → `sc_201401c0f84c45bbb4a43d2a52511e48`

#### 화면에서 직접 확인한 내용

- 레이아웃: 스크롤한 Overview.비용섹션과재무보고서/세금상품홍보.
- 입력 항목·필수 표시·기본값: No expenses tracked yet.흐린 예시금액/차트는 실제 수입/지출이 아니다.
- 버튼·메뉴·안내 문구: Add Income/Add Expense,View Expenses,Edit Categories,보고서,StartFreeTrial.
- 확인된 상태: 실제 데이터없는 예시 배경을 사용한다.
- 단계 간 변화: 장부 하단을 둘러본다.

#### 동작과 데이터

- 화면 관찰: 기능 안내 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 광고의절세금액은 설계/실제재무데이터 아님.

#### 모델링 영향

- 후보와 근거: 빈상태 일러스트와 원장 데이터 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 수입 목록 빈 상태

- Screen ID: `sc_201401c0f84c45bbb4a43d2a52511e48`
- 원본: [화면 페이지](https://gummble.com/screens/sc_201401c0f84c45bbb4a43d2a52511e48?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8bbed122-c19a-4ed2-9594-9715a28d1344.png)
- 로컬 이미지: [05_sc_201401c0f84c45bbb4a43d2a52511e48.png](<screens/05_sc_201401c0f84c45bbb4a43d2a52511e48.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_39f99df8b20a4630aa10354888de6496` → 현재 → `sc_82fc6d97532c459ca4c1802554ea4af7`

#### 화면에서 직접 확인한 내용

- 레이아웃: Income탭,LearnMore/NewIncome,중앙안내.
- 입력 항목·필수 표시·기본값: 인보이스입금은자동표시,외부 수입 수기 추적은 장부 합계/세금 계산에 포함한다는 문구.
- 버튼·메뉴·안내 문구: New Income,Learn More.
- 확인된 상태: 수입행없음.
- 단계 간 변화: Income 탭으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 자동/수기 원천을 함께 처리한다는 제품 안내.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한 포함범위·입금상태는 미확인.

#### 모델링 영향

- 후보와 근거: 수입원천 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 수입 생성 모달

- Screen ID: `sc_82fc6d97532c459ca4c1802554ea4af7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_82fc6d97532c459ca4c1802554ea4af7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/007c21b7-35d9-48fa-a971-5834ad14f1c6.png)
- 로컬 이미지: [06_sc_82fc6d97532c459ca4c1802554ea4af7.png](<screens/06_sc_82fc6d97532c459ca4c1802554ea4af7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_201401c0f84c45bbb4a43d2a52511e48` → 현재 → `sc_a0f36c6973444bc985597697a3db6245`

#### 화면에서 직접 확인한 내용

- 레이아웃: Add New Income,좌측폼·우측세금분류설명.
- 입력 항목·필수 표시·기본값: PreTax선택;Name회색외부플랫폼예시;Amount회색200.00;USD;DateFeb6 2024.
- 버튼·메뉴·안내 문구: PreTax/AfterTax,Save Income,X,통화/날짜.
- 확인된 상태: 별표는없고 실제이름/금액은아직비어있다.
- 단계 간 변화: New Income을 연다.

#### 동작과 데이터

- 화면 관찰: 수기수입 입력항목 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수검증·세금계산·AfterTax추가UI 미확인.

#### 모델링 영향

- 후보와 근거: 금액/통화/거래일/분류 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 수입 이름·금액 입력

- Screen ID: `sc_a0f36c6973444bc985597697a3db6245`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a0f36c6973444bc985597697a3db6245?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5af3f395-3bff-40c4-8618-840cc02e8b5c.png)
- 로컬 이미지: [07_sc_a0f36c6973444bc985597697a3db6245.png](<screens/07_sc_a0f36c6973444bc985597697a3db6245.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_82fc6d97532c459ca4c1802554ea4af7` → 현재 → `sc_5ce57ef5110b4f91bbe41131d32c3c46`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일모달.
- 입력 항목·필수 표시·기본값: Payout from Upwork,100USD,Feb6,PreTax.
- 버튼·메뉴·안내 문구: Save Income,날짜,AfterTax,X.
- 확인된 상태: 실제명칭/금액이채워진다.
- 단계 간 변화: 이름/금액을 입력한다.

#### 동작과 데이터

- 화면 관찰: 외부플랫폼명은 자유입력문자열이지 연동된계좌증거가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력제약·중복방지 미확인.

#### 모델링 영향

- 후보와 근거: 수입설명과 외부서비스연동 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 수입 날짜 선택

- Screen ID: `sc_5ce57ef5110b4f91bbe41131d32c3c46`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5ce57ef5110b4f91bbe41131d32c3c46?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9c495329-050e-4f82-b534-ff8c88539693.png)
- 로컬 이미지: [08_sc_5ce57ef5110b4f91bbe41131d32c3c46.png](<screens/08_sc_5ce57ef5110b4f91bbe41131d32c3c46.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a0f36c6973444bc985597697a3db6245` → 현재 → `sc_0cbe7eb3ade1423d803954ac3013ec7b`

#### 화면에서 직접 확인한 내용

- 레이아웃: Date아래February2024달력.
- 입력 항목·필수 표시·기본값: 6일선택,이름/100USD유지.
- 버튼·메뉴·안내 문구: 월이동화살표,날짜,SaveIncome.
- 확인된 상태: 과거날짜를 선택할 수 있는달력.
- 단계 간 변화: 날짜 달력을 연다.

#### 동작과 데이터

- 화면 관찰: 거래일 편집단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미래날짜/허용범위 미확인.

#### 모델링 영향

- 후보와 근거: 거래일과 생성일 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 거래일 Feb1 변경

- Screen ID: `sc_0cbe7eb3ade1423d803954ac3013ec7b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0cbe7eb3ade1423d803954ac3013ec7b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/200396a9-f8e4-4236-9e6b-500f90e2d17e.png)
- 로컬 이미지: [09_sc_0cbe7eb3ade1423d803954ac3013ec7b.png](<screens/09_sc_0cbe7eb3ade1423d803954ac3013ec7b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5ce57ef5110b4f91bbe41131d32c3c46` → 현재 → `sc_0155de50054a4706aac26286fbf5e600`

#### 화면에서 직접 확인한 내용

- 레이아웃: 달력닫힘.
- 입력 항목·필수 표시·기본값: PayoutfromUpwork,100USD,Feb1 2024,PreTax.
- 버튼·메뉴·안내 문구: SaveIncome,X.
- 확인된 상태: 거래일이6→1일로바뀐다.
- 단계 간 변화: Feb1을 선택한다.

#### 동작과 데이터

- 화면 관찰: 입력 과거일이 저장 대상이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제서버저장전 상태.

#### 모델링 영향

- 후보와 근거: 일자 기반 원장 수입 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 수입 저장 성공

- Screen ID: `sc_0155de50054a4706aac26286fbf5e600`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0155de50054a4706aac26286fbf5e600?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/db79b019-3814-469b-80e0-53aa84abae3a.png)
- 로컬 이미지: [10_sc_0155de50054a4706aac26286fbf5e600.png](<screens/10_sc_0155de50054a4706aac26286fbf5e600.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0cbe7eb3ade1423d803954ac3013ec7b` → 현재 → `sc_a0fa68609b634defb4a2ccd18b63a4a2`

#### 화면에서 직접 확인한 내용

- 레이아웃: Income목록에한행,우하단성공알림.
- 입력 항목·필수 표시·기본값: PayoutfromUpwork,$100.00,Feb01 2024,Pre-Tax.
- 버튼·메뉴·안내 문구: 행…,NewIncome,토스트X.
- 확인된 상태: You created a new income.
- 단계 간 변화: Save Income을 실행한다.

#### 동작과 데이터

- 화면 관찰: 수기수입 생성성공 및 목록반영을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제입금/외부플랫폼 검증은 수행하지 않는다.

#### 모델링 영향

- 후보와 근거: 수입 생성 이벤트·원천·세금분류 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 대시보드 복귀

- Screen ID: `sc_a0fa68609b634defb4a2ccd18b63a4a2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a0fa68609b634defb4a2ccd18b63a4a2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/eeabd71e-ccf7-4d3a-857e-4e5e79e466c4.png)
- 로컬 이미지: [11_sc_a0fa68609b634defb4a2ccd18b63a4a2.png](<screens/11_sc_a0fa68609b634defb4a2ccd18b63a4a2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0155de50054a4706aac26286fbf5e600` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 온보딩카드없이Timeline/Profit&Loss/빠른생성/홍보.
- 입력 항목·필수 표시·기본값: TuesdayFeb6,Timeline현재활동없음,USD/Last6Months그래프.
- 버튼·메뉴·안내 문구: 빠른생성,기간/통화,AddPaymentMethod.
- 확인된 상태: 수입 목록에서 대시보드로 이동했다.
- 단계 간 변화: 성공 토스트/수입 행 확인 후 Dashboard로 이동한다.

#### 동작과 데이터

- 화면 관찰: 그래프가 보이나 전체 원장 변경은 미수록.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 단일 수입과 여러 과거 그래프 값의 관계 미확인.

#### 모델링 영향

- 후보와 근거: 집계와 개별수입 변경 인과관계 검증 필요.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 수기 수입은 이름·금액·통화·날짜·Pre/AfterTax 구분을 받는다. 고객/프로젝트 필드는 이 모달에 없다.
- [관찰] PreTax 선택에서 저장되어100USD/Feb1/Pre-Tax 행이 생긴다.
- [관찰] 안내의1099/W9는 제품의 미국 맥락 설명이다. 우리 제품의 세법 제약으로 확정하지 않는다.
- [미확인] 마지막 그래프의 과거 변동을 이 수입 한 건으로 설명할 수 없다.

## 6. 공식 도움말과 API 대조

- [수입·결제 범주](https://help.hellobonsai.com/en/articles/1202116-understanding-payment-categories-outstanding-overdue-pending-and-paid): Other Income은 수기 추적 수입을 포함한다. 세전/세후 분류의 상세 계산 계약은 이 자료에서 확인되지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 수기 장부 수입의 전용 생성 endpoint와 필드는 미확인. Invoice POST로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 수입 원천(수기/인보이스),명칭·금액·통화·거래일·세금분류·생성자 후보.
- 원장 수입과 지급/인보이스 상태,집계에 반영되는 통화/날짜를 구분할 후보.

## 8. 미확인 사항과 검토 질문

- AfterTax 선택 시 추가필드/세금계산·지원 국가·음수/0/소수·다중통화 집계를 확인한다.
- 수입 수정/삭제·중복 입력·인보이스 입금과 중복 집계 방지·계좌 자동수집의 연결을 확인한다.
- 날짜만 저장하는지 시간대 영향이 있는지와 권한·취소 경계를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 11단계 재조회 및 원본 11개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
