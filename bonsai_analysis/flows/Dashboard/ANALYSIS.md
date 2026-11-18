# Dashboard 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a15f8066-29c2-457a-beea-e0e83b8d4dde` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a15f8066-29c2-457a-beea-e0e83b8d4dde) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 8개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트 문서 일정·수입지출·작업·시간·최근 활동을 한 화면에서 확인한다.

- 8장은 대시보드 내 스크롤·hover·홍보 카드 변화다. 독립된 업무를 모두 실행한 기록이 아니다.
- 하위 온보딩/생성 흐름은 다른 날짜·데이터 상태일 수 있다. 캡처 순서를 실제 연속 시계열로 취급하지 않는다.

- 하위 플로우: [Marking a task as complete](Marking%20a%20task%20as%20complete/ANALYSIS.md), [Adding income manually](Adding%20income%20manually/ANALYSIS.md), [Adding company details](Adding%20company%20details/ANALYSIS.md), [Create a contact form (template)](Create%20a%20contact%20form%20%28template%29/ANALYSIS.md), [Connecting to Google Calendar](Connecting%20to%20Google%20Calendar/ANALYSIS.md), [Hiding sidebar](Hiding%20sidebar/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | 프로젝트 일정 아이콘을 가리킨다. |
| 02 | [`sc_765d1f52dfb64d28a78f4feb85550e91`](https://gummble.com/screens/sc_765d1f52dfb64d28a78f4feb85550e91?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 문서 타임라인 hover](<screens/02_sc_765d1f52dfb64d28a78f4feb85550e91.png>) | 아래 Profit & Loss/Tasks/Activity로 스크롤한다. |
| 03 | [`sc_77e5823b93c24c3ba6d4fb9bc8b78dab`](https://gummble.com/screens/sc_77e5823b93c24c3ba6d4fb9bc8b78dab?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [손익·작업·활동 요약](<screens/03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png>) | 재무 그래프를 가리킨다. |
| 04 | [`sc_fca9b7afe3224fbcbaedba0db6219071`](https://gummble.com/screens/sc_fca9b7afe3224fbcbaedba0db6219071?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [손익 월별 값 hover](<screens/04_sc_fca9b7afe3224fbcbaedba0db6219071.png>) | hover가 사라지고 홍보 카드가 바뀐다. |
| 05 | [`sc_d5c00a24d1b04614ad759f86faa34aba`](https://gummble.com/screens/sc_d5c00a24d1b04614ad759f86faa34aba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [홍보 카드 변경](<screens/05_sc_d5c00a24d1b04614ad759f86faa34aba.png>) | 시간 기록 영역으로 더 스크롤한다. |
| 06 | [`sc_8e3268d7e1e548c2b527f59038328164`](https://gummble.com/screens/sc_8e3268d7e1e548c2b527f59038328164?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [시간 집계·활동 중간](<screens/06_sc_8e3268d7e1e548c2b527f59038328164.png>) | 2월8일 막대를 가리킨다. |
| 07 | [`sc_fe40b30743b344a0b5ebfe7d1d7f6da1`](https://gummble.com/screens/sc_fe40b30743b344a0b5ebfe7d1d7f6da1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [시간 일별 hover](<screens/07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png>) | 더 아래 활동 내역을 확인한다. |
| 08 | [`sc_c5734f174d484ffe9bb7e6738a4da73a`](https://gummble.com/screens/sc_c5734f174d484ffe9bb7e6738a4da73a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 하단 활동](<screens/08_sc_c5734f174d484ffe9bb7e6738a4da73a.png>) | 기록 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_765d1f52dfb64d28a78f4feb85550e91`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정된 왼쪽 사이드바, 상단 Search·Track Time·New, 날짜와 인사말 아래 2열 본문. 왼쪽은 Project Timeline과 Profit & Loss, 오른쪽은 2×2 빠른 생성 카드와 Workflow Plus 홍보 카드다.
- 입력 항목·필수 표시·기본값: Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다.
- 버튼·메뉴·안내 문구: 사이드바 Dashboard·Clients·Projects·Tasks, Tools 아래 Invoices·Proposals·Contracts·Time Tracking·Services·Forms·Scheduling, Finances 아래 Bookkeeping. 하단 Invite Team·Get 1 Month Free. 빠른 실행은 Send an invoice·Draft a proposal·Create a contract·Add a form. 홍보 카드에는 X·캐러셀 점·START 14-DAY FREE TRIAL, 우하단 도움말 버튼이 있다.
- 확인된 상태: Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트별 문서 아이콘과 손익 그래프를 한 화면에서 표시한다. 특정 메뉴를 실행했다는 근거는 다음 단계와 함께 판단한다. 홍보의 14일 문구를 계정 전체의 체험 기간으로 일반화하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 문서 타임라인 hover

- Screen ID: `sc_765d1f52dfb64d28a78f4feb85550e91`
- 원본: [화면 페이지](https://gummble.com/screens/sc_765d1f52dfb64d28a78f4feb85550e91?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee3812f9-bfed-487b-a1a8-a5509ba41663.png)
- 로컬 이미지: [02_sc_765d1f52dfb64d28a78f4feb85550e91.png](<screens/02_sc_765d1f52dfb64d28a78f4feb85550e91.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_77e5823b93c24c3ba6d4fb9bc8b78dab`

#### 화면에서 직접 확인한 내용

- 레이아웃: Project Timeline의 Design Project 행에 연결된 팝오버.
- 입력 항목·필수 표시·기본값: CONTRACT SENT Design Contract, Drafted Feb8 2024; INVOICE DRAFTED Invoice#1001,Total$70.04,IssuedFeb7 2024.
- 버튼·메뉴·안내 문구: 문서 팝오버 항목, 빠른 생성 카드.
- 확인된 상태: 한 일정 위치에 계약과 인보이스 요약이 함께 보인다.
- 단계 간 변화: 프로젝트 일정 아이콘을 가리킨다.

#### 동작과 데이터

- 화면 관찰: 프로젝트에 여러 문서 이벤트가 연결됨을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 기준·클릭 이동·중첩 아이콘 정렬은 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트-문서 참조와 일정용 이벤트 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 손익·작업·활동 요약

- Screen ID: `sc_77e5823b93c24c3ba6d4fb9bc8b78dab`
- 원본: [화면 페이지](https://gummble.com/screens/sc_77e5823b93c24c3ba6d4fb9bc8b78dab?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8fe51311-0da7-47e3-a661-2faf00186698.png)
- 로컬 이미지: [03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png](<screens/03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_765d1f52dfb64d28a78f4feb85550e91` → 현재 → `sc_fca9b7afe3224fbcbaedba0db6219071`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 그래프/4개금액/작업/시간, 오른쪽 홍보/Activity.
- 입력 항목·필수 표시·기본값: USD,Last6Months;Outstanding0,Overdue0,Paid&Pending0,OtherIncome460;ReviewUXdesign dueFeb4;활동에 DesignProposal 완료2행,폼응답/발송.
- 버튼·메뉴·안내 문구: 통화/기간 선택,작업 체크/+/…,활동 View Email,홍보 X.
- 확인된 상태: 동일 문구·시각의 완료 활동이2번 보인다.
- 단계 간 변화: 아래 Profit & Loss/Tasks/Activity로 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 업무별 요약과 여러 종류 이벤트를 함께 표시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 활동 중복 원인·요약 집계 범위 미확인.

#### 모델링 영향

- 후보와 근거: 통합 활동과 기능별 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 손익 월별 값 hover

- Screen ID: `sc_fca9b7afe3224fbcbaedba0db6219071`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fca9b7afe3224fbcbaedba0db6219071?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6e8e5dc2-0438-43dd-b275-f629173b3f7b.png)
- 로컬 이미지: [04_sc_fca9b7afe3224fbcbaedba0db6219071.png](<screens/04_sc_fca9b7afe3224fbcbaedba0db6219071.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_77e5823b93c24c3ba6d4fb9bc8b78dab` → 현재 → `sc_d5c00a24d1b04614ad759f86faa34aba`

#### 화면에서 직접 확인한 내용

- 레이아웃: 손익 선 그래프에 검은 툴팁.
- 입력 항목·필수 표시·기본값: Feb24 Totals:Paid$100,Expenses-$190,Profit-$90. 아래 요약 Paid&Pending0/OtherIncome460 유지.
- 버튼·메뉴·안내 문구: 그래프 hover,기간/통화,작업 도구.
- 확인된 상태: 월별 수치가 명시된다.
- 단계 간 변화: 재무 그래프를 가리킨다.

#### 동작과 데이터

- 화면 관찰: 100-190=-90이라는 해당 툴팁 관계만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 요약0/460과의 차이·실제 거래 범위는 미확인.

#### 모델링 영향

- 후보와 근거: 집계 기간과 원장 출처를 가진 재무 시계열 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 홍보 카드 변경

- Screen ID: `sc_d5c00a24d1b04614ad759f86faa34aba`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d5c00a24d1b04614ad759f86faa34aba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ff572448-9a3b-40e4-886a-35576e38d01d.png)
- 로컬 이미지: [05_sc_d5c00a24d1b04614ad759f86faa34aba.png](<screens/05_sc_d5c00a24d1b04614ad759f86faa34aba.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fca9b7afe3224fbcbaedba0db6219071` → 현재 → `sc_8e3268d7e1e548c2b527f59038328164`

#### 화면에서 직접 확인한 내용

- 레이아웃: 손익/작업/활동은 유지, 우측 상단 카드 변경.
- 입력 항목·필수 표시·기본값: Automate your business expense tracking 설명;재무 값 유지.
- 버튼·메뉴·안내 문구: Connect Account,홍보 캐러셀 점/X.
- 확인된 상태: WorkflowPlus에서 비용 자동화 홍보로 바뀌었다.
- 단계 간 변화: hover가 사라지고 홍보 카드가 바뀐다.

#### 동작과 데이터

- 화면 관찰: 홍보 표시 변화이며 계좌 연결 완료가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 순환/사용자 조작 여부 미확인.

#### 모델링 영향

- 후보와 근거: 홍보 UI 상태와 계좌 연결 상태 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 시간 집계·활동 중간

- Screen ID: `sc_8e3268d7e1e548c2b527f59038328164`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8e3268d7e1e548c2b527f59038328164?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6198602c-d8ea-4eab-9480-d8e5f2485d78.png)
- 로컬 이미지: [06_sc_8e3268d7e1e548c2b527f59038328164.png](<screens/06_sc_8e3268d7e1e548c2b527f59038328164.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d5c00a24d1b04614ad759f86faa34aba` → 현재 → `sc_fe40b30743b344a0b5ebfe7d1d7f6da1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 Time Tracked 막대와 합계, 오른쪽 활동 타임라인.
- 입력 항목·필수 표시·기본값: Unbilled08:01:16/$160.42,Billed01:00:07/$20.04. 계약생성6:51/서명6:52/발송6:53,제안서보관6:45/복원6:46 등.
- 버튼·메뉴·안내 문구: 시간 막대 hover,활동 문서/메일 링크,스크롤.
- 확인된 상태: 복원 이벤트가 직접 표시된다. 제안서 보관 플로우에 없던 후속 상태의 근거다.
- 단계 간 변화: 시간 기록 영역으로 더 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 시간 집계와 문서 lifecycle 이벤트를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복원 클릭 UI·고객 접근 유지·표시 주체 JoeDoe/JoeStudio 차이는 미확인.

#### 모델링 영향

- 후보와 근거: 시간 원시값·청구금액,문서 활동 이력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 시간 일별 hover

- Screen ID: `sc_fe40b30743b344a0b5ebfe7d1d7f6da1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fe40b30743b344a0b5ebfe7d1d7f6da1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aa4e3bb3-5855-4503-b978-6539089ab846.png)
- 로컬 이미지: [07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png](<screens/07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8e3268d7e1e548c2b527f59038328164` → 현재 → `sc_c5734f174d484ffe9bb7e6738a4da73a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 2월8일 막대에 툴팁.
- 입력 항목·필수 표시·기본값: ThuFeb08:Billed00:00:00,Unbilled06:00:00,BilledAmount0,UnbilledAmount120;전체 합계는 유지.
- 버튼·메뉴·안내 문구: 막대 hover,활동 링크.
- 확인된 상태: 일별 시간/금액을 별도로 보여준다.
- 단계 간 변화: 2월8일 막대를 가리킨다.

#### 동작과 데이터

- 화면 관찰: 하루 집계와 전체 집계가 구분된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 시간대·비청구 시간 포함·시급 변경 재계산은 미확인.

#### 모델링 영향

- 후보와 근거: 기간별시간 집계와 금액 계산 근거 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 대시보드 하단 활동

- Screen ID: `sc_c5734f174d484ffe9bb7e6738a4da73a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c5734f174d484ffe9bb7e6738a4da73a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/53fc7049-1b0a-411b-a3c5-352c176200f1.png)
- 로컬 이미지: [08_sc_c5734f174d484ffe9bb7e6738a4da73a.png](<screens/08_sc_c5734f174d484ffe9bb7e6738a4da73a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fe40b30743b344a0b5ebfe7d1d7f6da1` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 시간 합계, 오른쪽 더 오래된 활동.
- 입력 항목·필수 표시·기본값: 제안서발송/생성,RebrandingProject생성Feb8 6:39,Updatecompanyguideline완료Feb7 12:48.시간합계 유지.
- 버튼·메뉴·안내 문구: 활동 링크,스크롤.
- 확인된 상태: 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다.
- 단계 간 변화: 더 아래 활동 내역을 확인한다.

#### 동작과 데이터

- 화면 관찰: 통합 활동 피드의 대상 종류를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 이력 보관기간·더보기·권한·삭제 후표시는 미확인.

#### 모델링 영향

- 후보와 근거: 다형적 활동 대상 참조와 사용자/사업체 표시 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 문서별 SENT/DRAFTED와 날짜·금액을 타임라인에서 요약한다.
- [관찰] Paid & Pending/Other Income 합계와 월별 그래프 수치가 동시에 보이지만 집계 범위 차이는 확인하지 못했다.
- [관찰] 활동에는 계약 생성/작성자 서명/발송 및 제안서 수락/보관/복원이 별도 사건으로 남는다.
- [문서] 청구된 시간과 결제 완료는 다른 개념이다. 그래프 Billed를 Paid로 해석하지 않는다.
- [미확인] 반복된 작업 완료 활동2행의 원인이 중복 로그인지 재완료인지 알 수 없다.

## 6. 공식 도움말과 API 대조

- [현재 홈 대시보드 도움말](https://help.hellobonsai.com/en/articles/16785043-customize-your-home-dashboard): 섹션·권한·개인별 배치와 대시보드에서 작업 완료를 설명한다. 2026-09-02 문서는 새 Home 구성으로, 캡처의 Project Timeline/Profit & Loss 화면과 차이가 있다.
- [결제 집계 범주](https://help.hellobonsai.com/en/articles/1202116-understanding-payment-categories-outstanding-overdue-pending-and-paid): 미수·연체·처리중·완납·수기 수입의 의미를 설명한다. 캡처의 기간별 합계 산식은 별도 대조가 필요하다.
- [시간 청구 상태](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): Billed는 청구 여부이며 지불 여부와 다르다.
- [공개 API](https://docs.hellobonsai.com/api): 프로젝트·작업·시간·청구서 리소스는 확인했으나 이 대시보드 집계/통합 활동 endpoint 및 필드는 미확인.

## 7. 데이터 모델링 시사점

- 개별 업무 레코드와 조회용 기간/통화/권한별 집계를 분리할 후보.
- 활동 이벤트의 주체·대상·종류·시각·문서/메일 참조와 일관된 시간대 후보.
- 시간은 원시 초 단위와 청구 여부·금액을 구분하고 재무 집계의 원장/문서 출처를 추적할 후보.

## 8. 미확인 사항과 검토 질문

- 월별 Paid100/Expenses190/Profit-90과 요약 Paid0/Other460의 포함 기준·기간·통화를 확인한다.
- Dashboard 활동에서 확인된 제안서 복원은 보관 하위 흐름의 미수록 복원 결과를 보강하지만 복원 조작 UI는 추가 확인한다.
- Timeline 날짜 범위/아이콘 집계·클릭 목적지·Task 노출 기준·시간 통계 범위를 확인한다.
- 사용자 역할별 재무 가시성·활동 중복/정렬/페이지 로드·홍보 카드 개인화를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
