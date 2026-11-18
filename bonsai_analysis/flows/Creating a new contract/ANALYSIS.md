# Creating a new contract 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **19/19단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `6a26536d-43db-4d46-b0a3-22be61b34b36` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=6a26536d-43db-4d46-b0a3-22be61b34b36) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 19단계 / 19단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 19개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

템플릿·고객·프로젝트를 선택하고 구조화된 계약 조건으로 초안을 생성한다.

- 시작은 대시보드, 종료는 계약 목록이다. 중간에 초안이 보이지만 마지막 목록에는 Sent 날짜가 있어 발송 과정이 생략된 기록이다.
- 하위 플로우에서 안내 투어·계약 유형 전환·작성자 서명을 별도로 검토한다.

- 하위 플로우: [Contract guide tour](Contract%20guide%20tour/ANALYSIS.md), [Converting contract type](Converting%20contract%20type/ANALYSIS.md), [Signing a contract](Signing%20a%20contract/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a new contract`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | Contracts 메뉴로 이동한다. |
| 02 | [`sc_c44cbade856b4f0499c7795aebe35771`](https://gummble.com/screens/sc_c44cbade856b4f0499c7795aebe35771?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [계약 소개·빈 상태](<screens/02_sc_c44cbade856b4f0499c7795aebe35771.png>) | Create a Contract로 생성 모달을 연다. |
| 03 | [`sc_3ae2d8786a3d4998a443af310a11edea`](https://gummble.com/screens/sc_3ae2d8786a3d4998a443af310a11edea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 계약 — 샘플 고객](<screens/03_sc_3ae2d8786a3d4998a443af310a11edea.png>) | General 템플릿을 선택한다. |
| 04 | [`sc_2ed24329323f4ff4bcd227d995c336f4`](https://gummble.com/screens/sc_2ed24329323f4ff4bcd227d995c336f4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [General 템플릿 선택](<screens/04_sc_2ed24329323f4ff4bcd227d995c336f4.png>) | 추천 템플릿 영역을 펼친다. |
| 05 | [`sc_9eef8504b5ee48d88fdd9a33c2867e40`](https://gummble.com/screens/sc_9eef8504b5ee48d88fdd9a33c2867e40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [추천 템플릿 펼침](<screens/05_sc_9eef8504b5ee48d88fdd9a33c2867e40.png>) | Design 및 실제 고객·프로젝트를 선택한다. |
| 06 | [`sc_fcd6375dc2d341d4b160fbc95102b984`](https://gummble.com/screens/sc_fcd6375dc2d341d4b160fbc95102b984?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Design·실제 고객 선택](<screens/06_sc_fcd6375dc2d341d4b160fbc95102b984.png>) | 계약 정보 마법사로 진입한다. |
| 07 | [`sc_09496090e1c44b36b32ebc8e0ab9d993`](https://gummble.com/screens/sc_09496090e1c44b36b32ebc8e0ab9d993?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Basic Info 1/4](<screens/07_sc_09496090e1c44b36b32ebc8e0ab9d993.png>) | 국가 아래 주를 California로 지정한다. |
| 08 | [`sc_1bec2709ba694e14875549ea663ae662`](https://gummble.com/screens/sc_1bec2709ba694e14875549ea663ae662?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [주 선택](<screens/08_sc_1bec2709ba694e14875549ea663ae662.png>) | 사업체 형태 선택지를 연다. |
| 09 | [`sc_e61df6e65a7f4417b55477ac836daa54`](https://gummble.com/screens/sc_e61df6e65a7f4417b55477ac836daa54?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [사업체 유형 선택지](<screens/09_sc_e61df6e65a7f4417b55477ac836daa54.png>) | sole proprietorship을 선택한다. |
| 10 | [`sc_d8d10b313ca74dedb105f931e07b92aa`](https://gummble.com/screens/sc_d8d10b313ca74dedb105f931e07b92aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [개인 사업체 선택](<screens/10_sc_d8d10b313ca74dedb105f931e07b92aa.png>) | 업무 범위 단계로 이동한다. |
| 11 | [`sc_8012cfa08e5b49189443ef818b0f519e`](https://gummble.com/screens/sc_8012cfa08e5b49189443ef818b0f519e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [업무 범위 2/4](<screens/11_sc_8012cfa08e5b49189443ef818b0f519e.png>) | 업무 범위 문장을 입력한다. |
| 12 | [`sc_cb354300d8d04bc2abe73b49e48d3413`](https://gummble.com/screens/sc_cb354300d8d04bc2abe73b49e48d3413?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [업무 범위 입력](<screens/12_sc_cb354300d8d04bc2abe73b49e48d3413.png>) | Payment 단계로 이동한다. |
| 13 | [`sc_a9f1fe69ae4345eeba2974a44921c360`](https://gummble.com/screens/sc_a9f1fe69ae4345eeba2974a44921c360?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Payment 3/4](<screens/13_sc_a9f1fe69ae4345eeba2974a44921c360.png>) | 비어 있는 deposit에 검증 오류가 표시된다. |
| 14 | [`sc_bac0e56b60a24329abbd17bd32d368f9`](https://gummble.com/screens/sc_bac0e56b60a24329abbd17bd32d368f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Deposit 빈 값 오류](<screens/14_sc_bac0e56b60a24329abbd17bd32d368f9.png>) | deposit에 0을 입력하지만 오류 말풍선은 아직 보인다. |
| 15 | [`sc_8d9ebf6498e64f08a6961c884e16c64d`](https://gummble.com/screens/sc_8d9ebf6498e64f08a6961c884e16c64d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Deposit 0 입력](<screens/15_sc_8d9ebf6498e64f08a6961c884e16c64d.png>) | 아래로 스크롤해 조기 종료 조건과 생성 버튼을 확인한다. |
| 16 | [`sc_d4f7d697039845c0a3ea05e9f074886b`](https://gummble.com/screens/sc_d4f7d697039845c0a3ea05e9f074886b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대금 조건 하단·생성](<screens/16_sc_d4f7d697039845c0a3ea05e9f074886b.png>) | 생성 후 Invoicing Settings 4/4로 이동한다. |
| 17 | [`sc_074055751609428cbbc750193d9bfb45`](https://gummble.com/screens/sc_074055751609428cbbc750193d9bfb45?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Invoicing Settings 4/4](<screens/17_sc_074055751609428cbbc750193d9bfb45.png>) | Continue 후 초안 및 안내 투어가 나타난다. |
| 18 | [`sc_8e868b8f4bf24c25ba59cbdb3a6094dd`](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [계약 초안·첫 안내](<screens/18_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png>) | 계약 목록으로 이동한다. 중간 서명·발송 과정은 미수록. |
| 19 | [`sc_2beb47468dbb496fa54f279f20fb07c1`](https://gummble.com/screens/sc_2beb47468dbb496fa54f279f20fb07c1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [계약 목록의 생성 결과](<screens/19_sc_2beb47468dbb496fa54f279f20fb07c1.png>) | 목록에 Design Contract가 남는다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_c44cbade856b4f0499c7795aebe35771`

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

### 단계 02 — 계약 소개·빈 상태

- Screen ID: `sc_c44cbade856b4f0499c7795aebe35771`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c44cbade856b4f0499c7795aebe35771?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/30cc7be6-9c88-431f-99b1-be6123306e58.png)
- 로컬 이미지: [02_sc_c44cbade856b4f0499c7795aebe35771.png](<screens/02_sc_c44cbade856b4f0499c7795aebe35771.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_3ae2d8786a3d4998a443af310a11edea`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 공통 사이드바와 중앙 2열 소개. 왼쪽은 서명 예시 일러스트, 오른쪽은 계약 기능 설명이다.
- 입력 항목·필수 표시·기본값: 실제 계약 입력란은 없다. 일러스트의 서명·인명은 계정 데이터가 아니다.
- 버튼·메뉴·안내 문구: Create a Contract, See Sample, Contact Support.
- 확인된 상태: Contracts & Simple E-Signing 소개가 표시되며 기존 계약 행은 없다.
- 단계 간 변화: Contracts 메뉴로 이동한다.

#### 동작과 데이터

- 화면 관찰: 계약 생성 진입 전 상태만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: See Sample 결과와 빈 상태 판단 조건은 미확인.

#### 모델링 영향

- 후보와 근거: 빈 목록과 소개 일러스트를 실제 계약 레코드와 분리한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 새 계약 — 샘플 고객

- Screen ID: `sc_3ae2d8786a3d4998a443af310a11edea`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ae2d8786a3d4998a443af310a11edea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6d28afd0-7462-4f33-a52c-c58cd56975aa.png)
- 로컬 이미지: [03_sc_3ae2d8786a3d4998a443af310a11edea.png](<screens/03_sc_3ae2d8786a3d4998a443af310a11edea.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c44cbade856b4f0499c7795aebe35771` → 현재 → `sc_2ed24329323f4ff4bcd227d995c336f4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 배경을 어둡게 하고 중앙 New Contract 모달을 표시한다.
- 입력 항목·필수 표시·기본값: Template Select…, Client Sample Client, Project Consulting Project. 별표는 보이지 않는다.
- 버튼·메뉴·안내 문구: Suggested Templates 접기 영역, Create Contract, 외부 X.
- 확인된 상태: 샘플 고객에게 보내면 자동 SIGNED 처리된다는 노란 안내가 있다.
- 단계 간 변화: Create a Contract로 생성 모달을 연다.

#### 동작과 데이터

- 화면 관찰: 샘플 환경의 서명 동작 안내이며 실제 고객 동작으로 일반화할 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 선택 항목의 초기값 출처, 미선택 검증은 미확인.

#### 모델링 영향

- 후보와 근거: 샘플 고객/문서의 시뮬레이션 동작 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — General 템플릿 선택

- Screen ID: `sc_2ed24329323f4ff4bcd227d995c336f4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2ed24329323f4ff4bcd227d995c336f4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ae6c6d0b-1155-4794-bb7d-fdbeafd96a01.png)
- 로컬 이미지: [04_sc_2ed24329323f4ff4bcd227d995c336f4.png](<screens/04_sc_2ed24329323f4ff4bcd227d995c336f4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_3ae2d8786a3d4998a443af310a11edea` → 현재 → `sc_9eef8504b5ee48d88fdd9a33c2867e40`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 생성 모달.
- 입력 항목·필수 표시·기본값: Template General, Sample Client, Consulting Project.
- 버튼·메뉴·안내 문구: Suggested Templates, Create Contract, X.
- 확인된 상태: 템플릿만 General로 변경되고 샘플 서명 안내가 유지된다.
- 단계 간 변화: General 템플릿을 선택한다.

#### 동작과 데이터

- 화면 관찰: 선택 상태 변화만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 목록의 전체 항목·선택 방식은 미수록.

#### 모델링 영향

- 후보와 근거: 템플릿 선택값과 계약 생성값을 구분한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 추천 템플릿 펼침

- Screen ID: `sc_9eef8504b5ee48d88fdd9a33c2867e40`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9eef8504b5ee48d88fdd9a33c2867e40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b91a04ff-7743-449f-a92d-94b88f102322.png)
- 로컬 이미지: [05_sc_9eef8504b5ee48d88fdd9a33c2867e40.png](<screens/05_sc_9eef8504b5ee48d88fdd9a33c2867e40.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2ed24329323f4ff4bcd227d995c336f4` → 현재 → `sc_fcd6375dc2d341d4b160fbc95102b984`

#### 화면에서 직접 확인한 내용

- 레이아웃: Template 아래 추천 칩이 추가된다.
- 입력 항목·필수 표시·기본값: General 선택은 유지되고 Design, Blank Contract 추천이 보인다.
- 버튼·메뉴·안내 문구: 추천 칩, Create Contract, X.
- 확인된 상태: Suggested Templates 영역이 펼쳐졌다.
- 단계 간 변화: 추천 템플릿 영역을 펼친다.

#### 동작과 데이터

- 화면 관찰: 추천과 현재 선택 템플릿은 구분된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 추천 기준·사용자별 개인화는 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 추천 분류 후보. 새 계약 레코드 생성 증거는 아니다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Design·실제 고객 선택

- Screen ID: `sc_fcd6375dc2d341d4b160fbc95102b984`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fcd6375dc2d341d4b160fbc95102b984?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e4427157-c9f5-4953-bc9f-ec8cb804910f.png)
- 로컬 이미지: [06_sc_fcd6375dc2d341d4b160fbc95102b984.png](<screens/06_sc_fcd6375dc2d341d4b160fbc95102b984.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9eef8504b5ee48d88fdd9a33c2867e40` → 현재 → `sc_09496090e1c44b36b32ebc8e0ab9d993`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Contract 모달에 실제 고객과 프로젝트가 선택되어 있다.
- 입력 항목·필수 표시·기본값: Template Design, Client Doe Company, Project Design Project with Doe Studio.
- 버튼·메뉴·안내 문구: Create Contract, X, Suggested Templates.
- 확인된 상태: 샘플 자동 서명 안내가 사라졌다.
- 단계 간 변화: Design 및 실제 고객·프로젝트를 선택한다.

#### 동작과 데이터

- 화면 관찰: 템플릿/고객/프로젝트 조합이 바뀌었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객 변경 시 프로젝트 자동 초기화 규칙은 중간 화면이 없어 미확인.

#### 모델링 영향

- 후보와 근거: 고객에 속한 프로젝트 선택 제약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — Basic Info 1/4

- Screen ID: `sc_09496090e1c44b36b32ebc8e0ab9d993`
- 원본: [화면 페이지](https://gummble.com/screens/sc_09496090e1c44b36b32ebc8e0ab9d993?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f1994b0e-9be0-419b-98b9-bd2265dfb9ca.png)
- 로컬 이미지: [07_sc_09496090e1c44b36b32ebc8e0ab9d993.png](<screens/07_sc_09496090e1c44b36b32ebc8e0ab9d993.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fcd6375dc2d341d4b160fbc95102b984` → 현재 → `sc_1bec2709ba694e14875549ea663ae662`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Contracts·프로젝트 경로, 중앙 문장형 입력, 오른쪽 설명 카드.
- 입력 항목·필수 표시·기본값: contractor, United States, 주 Select…; 회사로 일한다 체크 켜짐; 회사명 Joe Studio; 사업체 형태 Select…; 직함 Owner 회색 표시; 고객은 company Doe Company.
- 버튼·메뉴·안내 문구: 밑줄 선택/입력 항목, Continue.
- 확인된 상태: BASIC INFO 1 OF 4. 국가와 주에 따른 차이를 설명한다.
- 단계 간 변화: 계약 정보 마법사로 진입한다.

#### 동작과 데이터

- 화면 관찰: 당사자 정보를 구조화해서 받는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Owner의 실제 기본값 여부, 각 빈 값의 검증은 미확인.

#### 모델링 영향

- 후보와 근거: 사업체 여부·유형과 조건부 필드 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 주 선택

- Screen ID: `sc_1bec2709ba694e14875549ea663ae662`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1bec2709ba694e14875549ea663ae662?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1a451c84-1862-4f94-9798-998dcc5754a3.png)
- 로컬 이미지: [08_sc_1bec2709ba694e14875549ea663ae662.png](<screens/08_sc_1bec2709ba694e14875549ea663ae662.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_09496090e1c44b36b32ebc8e0ab9d993` → 현재 → `sc_e61df6e65a7f4417b55477ac836daa54`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문장형 Basic Info 레이아웃 유지.
- 입력 항목·필수 표시·기본값: United States, California, Joe Studio, 사업체 유형 Select…, 직함 Owner 회색, Doe Company.
- 버튼·메뉴·안내 문구: Continue, 각 밑줄 필드.
- 확인된 상태: 주가 California로 선택되었다.
- 단계 간 변화: 국가 아래 주를 California로 지정한다.

#### 동작과 데이터

- 화면 관찰: 관할 지역 입력이 변했다. 법적 유효성을 이 화면으로 판단하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 국가 변경 시 주 초기화·지원 지역은 미확인.

#### 모델링 영향

- 후보와 근거: 지역 참조와 계약 표시 문자열 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 사업체 유형 선택지

- Screen ID: `sc_e61df6e65a7f4417b55477ac836daa54`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e61df6e65a7f4417b55477ac836daa54?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b3e89314-c7e5-475c-87c5-fb3e906f5be7.png)
- 로컬 이미지: [09_sc_e61df6e65a7f4417b55477ac836daa54.png](<screens/09_sc_e61df6e65a7f4417b55477ac836daa54.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1bec2709ba694e14875549ea663ae662` → 현재 → `sc_d8d10b313ca74dedb105f931e07b92aa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 회사명 다음 드롭다운을 펼친 상태.
- 입력 항목·필수 표시·기본값: limited liability company, corporation, sole proprietorship, partnership. 회사 체크는 켜져 있다.
- 버튼·메뉴·안내 문구: 드롭다운 4개 선택지, Continue.
- 확인된 상태: 도움말은 법적 사업체 정보 입력 및 불확실하면 회사 체크를 해제하라고 안내한다.
- 단계 간 변화: 사업체 형태 선택지를 연다.

#### 동작과 데이터

- 화면 관찰: 이 캡처의 선택지 집합을 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 국가의 선택지와 추가 항목 유무는 미확인.

#### 모델링 영향

- 후보와 근거: 사업체 유형별 조건부 입력 후보. 전역 enum 확정 금지.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 개인 사업체 선택

- Screen ID: `sc_d8d10b313ca74dedb105f931e07b92aa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d8d10b313ca74dedb105f931e07b92aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1a0daadb-355c-49ef-930c-321fba9e1de0.png)
- 로컬 이미지: [10_sc_d8d10b313ca74dedb105f931e07b92aa.png](<screens/10_sc_d8d10b313ca74dedb105f931e07b92aa.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e61df6e65a7f4417b55477ac836daa54` → 현재 → `sc_8012cfa08e5b49189443ef818b0f519e`

#### 화면에서 직접 확인한 내용

- 레이아웃: Basic Info 문장의 줄 배치가 바뀐다.
- 입력 항목·필수 표시·기본값: sole proprietorship 선택, Joe Studio, California/United States, Doe Company. 이전 직함 입력란이 보이지 않는다.
- 버튼·메뉴·안내 문구: Continue, 회사 체크.
- 확인된 상태: 유형 변경 후 직함 필드가 숨겨진다.
- 단계 간 변화: sole proprietorship을 선택한다.

#### 동작과 데이터

- 화면 관찰: 표시 조건 변화가 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 숨긴 직함 값의 보존·삭제 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 조건부 필드 노출과 저장값 처리를 분리한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 업무 범위 2/4

- Screen ID: `sc_8012cfa08e5b49189443ef818b0f519e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8012cfa08e5b49189443ef818b0f519e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bbb6a42d-78b8-48ed-94e1-2577efa74a5f.png)
- 로컬 이미지: [11_sc_8012cfa08e5b49189443ef818b0f519e.png](<screens/11_sc_8012cfa08e5b49189443ef818b0f519e.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d8d10b313ca74dedb105f931e07b92aa` → 현재 → `sc_cb354300d8d04bc2abe73b49e48d3413`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 큰 텍스트 영역과 그 아래 선택 첨부 안내.
- 입력 항목·필수 표시·기본값: Designer가 수행할 일 입력란. 로고·브랜드 등 회색 예시 문구; OPTIONAL 추가 SOW 파일.
- 버튼·메뉴·안내 문구: Continue, GO BACK, 파일 첨부 영역.
- 확인된 상태: SCOPE OF WORK 2 OF 4, 아직 실제 업무 문장 입력은 보이지 않는다.
- 단계 간 변화: 업무 범위 단계로 이동한다.

#### 동작과 데이터

- 화면 관찰: 자유 텍스트와 선택 첨부를 받는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 첨부 크기/형식·텍스트 길이 제한·빈 값 검증은 미확인.

#### 모델링 영향

- 후보와 근거: 업무 범위 본문과 첨부 파일 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — 업무 범위 입력

- Screen ID: `sc_cb354300d8d04bc2abe73b49e48d3413`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cb354300d8d04bc2abe73b49e48d3413?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0e3319ff-6fb4-42fe-b16a-7c32716e6da5.png)
- 로컬 이미지: [12_sc_cb354300d8d04bc2abe73b49e48d3413.png](<screens/12_sc_cb354300d8d04bc2abe73b49e48d3413.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8012cfa08e5b49189443ef818b0f519e` → 현재 → `sc_a9f1fe69ae4345eeba2974a44921c360`

#### 화면에서 직접 확인한 내용

- 레이아웃: 텍스트 영역 오른쪽 도움말 카드.
- 입력 항목·필수 표시·기본값: The Designer will assist the Client to develop a new brand guideline. 입력; 첨부 파일은 보이지 않는다.
- 버튼·메뉴·안내 문구: Continue, GO BACK, 선택 첨부.
- 확인된 상태: 업무 문장이 채워졌다. 도움말은 Designer/Client 호칭 및 구체적 산출물을 안내한다.
- 단계 간 변화: 업무 범위 문장을 입력한다.

#### 동작과 데이터

- 화면 관찰: 입력한 문장이 이후 계약 본문에 그대로 반영된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 저장 여부와 이전 단계 복귀 시 보존은 미확인.

#### 모델링 영향

- 후보와 근거: 역할 용어가 포함된 문서 텍스트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 13 — Payment 3/4

- Screen ID: `sc_a9f1fe69ae4345eeba2974a44921c360`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a9f1fe69ae4345eeba2974a44921c360?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b867b366-e28a-43b2-b141-3765104ce3bc.png)
- 로컬 이미지: [13_sc_a9f1fe69ae4345eeba2974a44921c360.png](<screens/13_sc_a9f1fe69ae4345eeba2974a44921c360.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cb354300d8d04bc2abe73b49e48d3413` → 현재 → `sc_bac0e56b60a24329abbd17bd32d368f9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문장형 대금 설정이 세로로 이어지고 하단은 화면 밖이다.
- 입력 항목·필수 표시·기본값: hourly rate $20.0 USD; deposit 회색 $1,000; 청구 at the end of the project; 결제 15일, 연체 10%/month; 시작 Feb 6, 2024; 종료 on a specific date, Mar 8, 2024.
- 버튼·메뉴·안내 문구: 대금 방식·통화·청구 시점·종료 방식 선택 필드.
- 확인된 상태: PAYMENT 3 OF 4. 날짜 입력은 이 단계 안에 있다.
- 단계 간 변화: Payment 단계로 이동한다.

#### 동작과 데이터

- 화면 관찰: 대금·기간 조건을 한 화면에서 편집한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 회색 deposit은 실제 값이 아니다. 다른 방식과 기본값 출처는 미확인.

#### 모델링 영향

- 후보와 근거: 금액·통화·단위·기간·결제 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 14 — Deposit 빈 값 오류

- Screen ID: `sc_bac0e56b60a24329abbd17bd32d368f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bac0e56b60a24329abbd17bd32d368f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a750b286-c3bc-4137-a3ac-03b03f137503.png)
- 로컬 이미지: [14_sc_bac0e56b60a24329abbd17bd32d368f9.png](<screens/14_sc_bac0e56b60a24329abbd17bd32d368f9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a9f1fe69ae4345eeba2974a44921c360` → 현재 → `sc_8d9ebf6498e64f08a6961c884e16c64d`

#### 화면에서 직접 확인한 내용

- 레이아웃: Payment 화면에 빨간 말풍선 및 오른쪽 도움말.
- 입력 항목·필수 표시·기본값: 기존 대금 값 유지, deposit 회색 $1,000.
- 버튼·메뉴·안내 문구: deposit 입력란, 다른 문장형 필드.
- 확인된 상태: Please fill in your deposit amount 오류. 도움말은 연체료를 매월 단리 계산하고 원치 않으면 0을 입력하라고 설명한다.
- 단계 간 변화: 비어 있는 deposit에 검증 오류가 표시된다.

#### 동작과 데이터

- 화면 관찰: deposit 빈 값 검증이 드러난다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 오류를 발생시킨 버튼/포커스 동작과 서버 검증 시점은 미확인.

#### 모델링 영향

- 후보와 근거: 빈 값과 숫자 0을 구분하는 검증 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 15 — Deposit 0 입력

- Screen ID: `sc_8d9ebf6498e64f08a6961c884e16c64d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8d9ebf6498e64f08a6961c884e16c64d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c8c5aec1-08b3-4925-823f-3c46d1205a6c.png)
- 로컬 이미지: [15_sc_8d9ebf6498e64f08a6961c884e16c64d.png](<screens/15_sc_8d9ebf6498e64f08a6961c884e16c64d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_bac0e56b60a24329abbd17bd32d368f9` → 현재 → `sc_d4f7d697039845c0a3ea05e9f074886b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 화면, 오른쪽 도움말이 deposit 설명으로 바뀐다.
- 입력 항목·필수 표시·기본값: deposit $0, 시급 $20, 15일, 10%, 시작·종료일 유지.
- 버튼·메뉴·안내 문구: deposit 입력, 각 선택 필드.
- 확인된 상태: 0 입력 후에도 빨간 deposit 오류가 이 캡처에는 남아 있다. 도움말은 선금이 필요 없으면 0 입력을 안내한다.
- 단계 간 변화: deposit에 0을 입력하지만 오류 말풍선은 아직 보인다.

#### 동작과 데이터

- 화면 관찰: 0이라는 명시적 입력을 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 포커스 이동 전 남은 오류인지 저장 거절인지 단일 화면으로 결정할 수 없다.

#### 모델링 영향

- 후보와 근거: 입력 상태와 검증 메시지 갱신 시점을 구분한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 16 — 대금 조건 하단·생성

- Screen ID: `sc_d4f7d697039845c0a3ea05e9f074886b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d4f7d697039845c0a3ea05e9f074886b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8a8ada50-64eb-48c1-a6d8-f45c93628dc8.png)
- 로컬 이미지: [16_sc_d4f7d697039845c0a3ea05e9f074886b.png](<screens/16_sc_d4f7d697039845c0a3ea05e9f074886b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8d9ebf6498e64f08a6961c884e16c64d` → 현재 → `sc_074055751609428cbbc750193d9bfb45`

#### 화면에서 직접 확인한 내용

- 레이아웃: 스크롤한 Payment 하단. 오른쪽 설명 영역은 없다.
- 입력 항목·필수 표시·기본값: 15일·10%·시작 Feb 6·종료 Mar 8 유지; 조기 종료 시 작업 시간에 비례한 금액 지급 선택.
- 버튼·메뉴·안내 문구: Create Contract, Terms of Use 링크, GO BACK, 조기 종료 조건 선택.
- 확인된 상태: 생성 버튼과 이용약관 안내가 노출된다.
- 단계 간 변화: 아래로 스크롤해 조기 종료 조건과 생성 버튼을 확인한다.

#### 동작과 데이터

- 화면 관찰: 조건 입력 후 생성 진입점이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 생성 시 저장 범위·실패/중복 요청 처리는 미확인.

#### 모델링 영향

- 후보와 근거: 조기 종료 조항과 계약 생성 이벤트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 17 — Invoicing Settings 4/4

- Screen ID: `sc_074055751609428cbbc750193d9bfb45`
- 원본: [화면 페이지](https://gummble.com/screens/sc_074055751609428cbbc750193d9bfb45?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0cf09276-9c33-4d3b-9f50-a59734a4353e.png)
- 로컬 이미지: [17_sc_074055751609428cbbc750193d9bfb45.png](<screens/17_sc_074055751609428cbbc750193d9bfb45.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d4f7d697039845c0a3ea05e9f074886b` → 현재 → `sc_8e868b8f4bf24c25ba59cbdb3a6094dd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 단일 페이지의 자동화 설명, 토글 카드, 예정 청구서 한 행.
- 입력 항목·필수 표시·기본값: 자동 발송 토글 켜짐; Invoice: Hourly Rate for $20.00, 발행 예정 Mar 8, 2024.
- 버튼·메뉴·안내 문구: Schedule my invoices to send automatically on my behalf, 정보 아이콘, Continue.
- 확인된 상태: 청구서는 자동 생성된다는 안내와 발송 여부 선택을 구분한다.
- 단계 간 변화: 생성 후 Invoicing Settings 4/4로 이동한다.

#### 동작과 데이터

- 화면 관찰: 계약 조건에서 파생된 청구 일정이 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 생성된 invoice ID·총액 계산·스케줄 실행과 토글 초기값 정책은 미확인.

#### 모델링 영향

- 후보와 근거: 계약 조건→청구 계획→발송 작업 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 18 — 계약 초안·첫 안내

- Screen ID: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e6ac0cb2-aba6-4e80-848c-76c4a7abb4af.png)
- 로컬 이미지: [18_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png](<screens/18_sc_8e868b8f4bf24c25ba59cbdb3a6094dd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_074055751609428cbbc750193d9bfb45` → 현재 → `sc_2beb47468dbb496fa54f279f20fb07c1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 문서, 오른쪽 Overview/Settings/Payments, 위 툴바와 첫 투어 말풍선.
- 입력 항목·필수 표시·기본값: Drafted, Standardized, $20 USD/hour; 로고 on, Font FF Meta Serif, Single recipient(no co-signer). 본문에 당사자·범위·2/6~3/8·시급20·15일·10% 반영.
- 버튼·메뉴·안내 문구: Preview, Automation, Sign Contract, …; Add Custom Clause, Convert to Fully Editable; 투어 Next/X.
- 확인된 상태: 입력 부분은 노란 강조. 본문에는 비용 사전 승인 불필요·지원 미제공 등 마법사에서 직접 보지 못한 조항도 있다.
- 단계 간 변화: Continue 후 초안 및 안내 투어가 나타난다.

#### 동작과 데이터

- 화면 관찰: 초안 생성과 조건의 본문 반영을 확인했다. 안내의 변호사 검토 문구는 제품 설명이지 본 분석의 법적 평가가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본 조항 출처, 전체 문서 하단, 실제 저장 요청 및 지급 설정 하단은 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 기본 조항과 사용자 입력의 출처, 문서 타입/상태/스타일 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 19 — 계약 목록의 생성 결과

- Screen ID: `sc_2beb47468dbb496fa54f279f20fb07c1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2beb47468dbb496fa54f279f20fb07c1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1b2fa08e-ae7c-490c-a0ef-771953e3958e.png)
- 로컬 이미지: [19_sc_2beb47468dbb496fa54f279f20fb07c1.png](<screens/19_sc_2beb47468dbb496fa54f279f20fb07c1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 공통 메뉴, Contracts/My Templates 탭, 검색·필터·New Contract, 테이블 한 행.
- 입력 항목·필수 표시·기본값: Design Contract, Doe Company, Design Project with Doe Studio, Created Feb 8 2024, Sent Feb 8 2024.
- 버튼·메뉴·안내 문구: Search, Filters, New Contract, 행 편집 아이콘, ….
- 확인된 상태: 직전 초안 화면과 달리 Sent 날짜가 있다. 목록에서 서명 완료 여부를 단정할 수 없다.
- 단계 간 변화: 계약 목록으로 이동한다. 중간 서명·발송 과정은 미수록.

#### 동작과 데이터

- 화면 관찰: 계약 목록에 레코드가 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 초안→발송 사이 생략된 이벤트와 점 색상의 상태 의미는 미확인.

#### 모델링 영향

- 후보와 근거: 생성일과 발송일을 별도 이벤트로 보관할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 샘플 고객 선택 시 자동 서명 안내가 나타나며 실제 고객으로 바꾸면 사라진다.
- [관찰] 회사 형태에 따라 직함 입력란 노출이 달라진다. 모든 사업체에 직함 필수를 적용할 근거는 없다.
- [관찰] deposit의 회색 1,000은 입력값으로 취급하면 안 된다. 빈 값 오류 후 0이 입력된다.
- [관찰] 날짜는 별도 단계가 아니라 Payment 3/4 안에 있다. 마지막 4/4는 Invoicing Settings다.
- [관찰] 문서 본문에 고객·사업체·업무 범위·기간·시급·결제기한·연체료가 반영된다.
- [미확인] 자동 청구서 생성 안내는 보이나 실제 생성된 청구서 및 자동 발송 실행은 여기서 검증되지 않는다.
- [교차 관찰] [Dashboard 단계 06](../Dashboard/ANALYSIS.md)의 `sc_8e3268d7e1e548c2b527f59038328164`는 계약 생성·작성자 서명·발송을 각각 별도 활동으로 표시한다. 마지막 목록의 Sent를 생성만의 결과로 해석하지 않는다. 본 생성 플로우에서 생략된 실제 조작과 이벤트 대응은 추가 확인한다.

## 6. 공식 도움말과 API 대조

- [표준·사용자 정의 계약](https://help.hellobonsai.com/en/articles/918802-creating-completely-custom-contracts): Basic Info·Scope of Work·Payment 입력과 표준 계약의 부분 편집, 작성자 서명 후 발송 순서를 설명한다. 2026-07-27 이후 생성 계정은 통합 Document builder를 사용하므로 캡처의 구형 계약 편집기와 구분한다.
- [계약 선결제 설정](https://help.hellobonsai.com/en/articles/6683807-how-to-set-an-upfront-payment-deposit-on-contracts): Require Upfront Payment는 별도 설정이며 고객 서명 후 결제 및 연결 청구서를 다룬다. 작성 마법사의 deposit 항목만으로 이 설정이 켜졌다고 판단하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.

## 7. 데이터 모델링 시사점

- 계약 템플릿, 고객·프로젝트 참조, 계약 당사자 표시 정보, 국가·주·사업체 형태 및 조건부 직함 후보.
- 업무 범위 텍스트와 첨부, 대금 방식·금액·통화·보증금, 청구 시점·납기·연체율·시작종료·조기 종료 조건 후보.
- 구조화된 조건과 렌더링된 문서 본문의 대응, 문서 버전, 작성/서명/발송 상태 및 날짜를 분리할 후보.
- 자동 청구서 설정과 실제 청구서/발송 작업은 별도 수명주기를 가진 후보.

## 8. 미확인 사항과 검토 질문

- 국가·사업체 형태별 입력 필수 여부와 지원 범위를 실제 폼 검증으로 확인한다.
- deposit=0 허용 안내와 오류가 동시에 보이는 단계의 해소 시점 및 서버 저장값을 확인한다.
- 시급 $20 표시와 생성 예정 Invoice $20의 계산 관계, 실 작업시간 반영 시점을 확인한다.
- 별도 Dashboard 활동에는 생성·서명·발송 사건이 구분되어 있다. 본 플로우 마지막 목록의 Sent에 이르기까지 생략된 서명·발송 조작과 계약 ID를 대조한다.
- 표준 조건 변경이 본문과 생성된 청구서에 어떤 범위로 전파되는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 19개와 실제 이미지 19개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 다른 플로우의 문서 활동을 교차 연결하고 복원·서명·발송의 확인 범위와 미수록 조작을 구분 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 19단계 재조회 및 원본 19개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
