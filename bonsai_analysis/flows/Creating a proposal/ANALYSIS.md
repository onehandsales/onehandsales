# Creating a proposal 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **12/12단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `60d9a6ef-22e9-463e-bcbb-ebd993a06e02` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=60d9a6ef-22e9-463e-bcbb-ebd993a06e02) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 12단계 / 12단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 12개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

템플릿을 고르고 고객·프로젝트를 연결해 제안서 초안을 만든다.

- 제안서가 없는 소개 화면에서 시작한다. 소개 그림 속 수신자와 승인 알림은 실제 계정 데이터가 아니다.
- 신규 고객 입력을 탐색하지만 최종적으로 기존 Doe Company와 신규 Rebranding Project를 선택한다.
- 완료 결과는 Drafted 제안서이며 발송·고객 수락은 하위 플로우다.

- 하위 플로우: [Sending a proposal](Sending%20a%20proposal/ANALYSIS.md), [Archiving a proposal](Archiving%20a%20proposal/ANALYSIS.md), [Changing theme](Changing%20theme/ANALYSIS.md), [Marking as accepted](Marking%20as%20accepted/ANALYSIS.md), [Creating a new automation](Creating%20a%20new%20automation/ANALYSIS.md), [Setting proposal expiration date](Setting%20proposal%20expiration%20date/ANALYSIS.md), [Editing header style](Editing%20header%20style/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | Proposals의 빈 소개 화면으로 이동한다. |
| 02 | [`sc_955e76d0a2994de9995f97ebc5b07d2f`](https://gummble.com/screens/sc_955e76d0a2994de9995f97ebc5b07d2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 빈 소개 화면](<screens/02_sc_955e76d0a2994de9995f97ebc5b07d2f.png>) | Create a Proposal로 템플릿 선택 화면을 연다. |
| 03 | [`sc_ae2295adabb2431194bd0b9d85801df1`](https://gummble.com/screens/sc_ae2295adabb2431194bd0b9d85801df1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 템플릿 Design 필터](<screens/03_sc_ae2295adabb2431194bd0b9d85801df1.png>) | Design 결과를 아래로 스크롤해 페이지네이션과 템플릿을 확인한다. |
| 04 | [`sc_11a3721184c941fc93b0a8301b4bc42f`](https://gummble.com/screens/sc_11a3721184c941fc93b0a8301b4bc42f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 목록 하단과 페이지](<screens/04_sc_11a3721184c941fc93b0a8301b4bc42f.png>) | Creative Design Brief 미리보기가 로딩된다. |
| 05 | [`sc_3e50a7eb10764ee09c56f622933cc67b`](https://gummble.com/screens/sc_3e50a7eb10764ee09c56f622933cc67b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Creative Design Brief 미리보기 로딩](<screens/05_sc_3e50a7eb10764ee09c56f622933cc67b.png>) | 템플릿 문서 미리보기가 표시된다. |
| 06 | [`sc_e06e394dc2834d088abe045ce60d72aa`](https://gummble.com/screens/sc_e06e394dc2834d088abe045ce60d72aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Creative Design Brief 템플릿 미리보기](<screens/06_sc_e06e394dc2834d088abe045ce60d72aa.png>) | Use Template 후 고객·프로젝트 생성 모달이 나타난다. |
| 07 | [`sc_819e42ff35984ce691d92c014503a99c`](https://gummble.com/screens/sc_819e42ff35984ce691d92c014503a99c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 생성 모달 고객 미선택](<screens/07_sc_819e42ff35984ce691d92c014503a99c.png>) | +New Client 선택으로 이름·이메일 입력이 펼쳐진다. |
| 08 | [`sc_520c53447c1e40938fc30c2c32ef125a`](https://gummble.com/screens/sc_520c53447c1e40938fc30c2c32ef125a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 작성 중 신규 고객 분기](<screens/08_sc_520c53447c1e40938fc30c2c32ef125a.png>) | 신규 고객 작성 대신 Doe Company와 기존 프로젝트를 선택한다. |
| 09 | [`sc_22da5c665d8543e391ea16451efc26d8`](https://gummble.com/screens/sc_22da5c665d8543e391ea16451efc26d8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [기존 고객과 프로젝트 선택](<screens/09_sc_22da5c665d8543e391ea16451efc26d8.png>) | 프로젝트를 +New Project로 전환한다. |
| 10 | [`sc_a15475bec427432fb0123cb80d832bb0`](https://gummble.com/screens/sc_a15475bec427432fb0123cb80d832bb0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서에서 새 프로젝트 분기](<screens/10_sc_a15475bec427432fb0123cb80d832bb0.png>) | 새 프로젝트명 Rebranding Project를 입력한다. |
| 11 | [`sc_004461870bef44df89cc6329c1249841`](https://gummble.com/screens/sc_004461870bef44df89cc6329c1249841?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Rebranding Project 이름 입력](<screens/11_sc_004461870bef44df89cc6329c1249841.png>) | Create Proposal 후 편집기와 Changes Saved 표시가 나타난다. |
| 12 | [`sc_455f71d704fd4c01b41254a6f93a21fa`](https://gummble.com/screens/sc_455f71d704fd4c01b41254a6f93a21fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 초안 편집기](<screens/12_sc_455f71d704fd4c01b41254a6f93a21fa.png>) | 초안 생성 완료. 아직 발송 전. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_955e76d0a2994de9995f97ebc5b07d2f`

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

### 단계 02 — 제안서 빈 소개 화면

- Screen ID: `sc_955e76d0a2994de9995f97ebc5b07d2f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_955e76d0a2994de9995f97ebc5b07d2f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f8e0a137-adeb-4595-a60f-c3b58d3e91a6.png)
- 로컬 이미지: [02_sc_955e76d0a2994de9995f97ebc5b07d2f.png](<screens/02_sc_955e76d0a2994de9995f97ebc5b07d2f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_ae2295adabb2431194bd0b9d85801df1`

#### 화면에서 직접 확인한 내용

- 레이아웃: Proposals 사이드바 선택. 중앙 큰 카드의 좌측 제품 예시 그림과 우측 설명/CTA.
- 입력 항목·필수 표시·기본값: 실제 입력 없음. 그림의 이메일·승인 알림은 소개용.
- 버튼·메뉴·안내 문구: Create a Proposal, Learn More, Contact Support.
- 확인된 상태: 제안서 목록 대신 소개 상태.
- 단계 간 변화: Proposals의 빈 소개 화면으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 제안서 최초 생성 진입점 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 빈 데이터 조건·요금제 제한 미확인.

#### 모델링 영향

- 후보와 근거: 빈 목록 상태와 첫 생성 진입 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 제안서 템플릿 Design 필터

- Screen ID: `sc_ae2295adabb2431194bd0b9d85801df1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ae2295adabb2431194bd0b9d85801df1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0ad5da97-6e8f-48c9-8064-566973037a47.png)
- 로컬 이미지: [03_sc_ae2295adabb2431194bd0b9d85801df1.png](<screens/03_sc_ae2295adabb2431194bd0b9d85801df1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_955e76d0a2994de9995f97ebc5b07d2f` → 현재 → `sc_11a3721184c941fc93b0a8301b4bc42f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체 화면 왼쪽 Type/Industry와 업종, 오른쪽 검색·3열 카드. Design 선택.
- 입력 항목·필수 표시·기본값: All164, Design30. Blank Proposal, App Development, Brand Strategy Estimate, Creative Design Brief/Services Quote, Design Retainer 등.
- 버튼·메뉴·안내 문구: Search templates, Start from scratch, Use Template, 닫기 X.
- 확인된 상태: 업종 필터가 적용된 탐색 상태.
- 단계 간 변화: Create a Proposal로 템플릿 선택 화면을 연다.

#### 동작과 데이터

- 화면 관찰: 템플릿 선택과 빈 문서 시작을 별도로 지원.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Type 탭 옵션·검색어·초기 Design 선택 원인 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿·업종·유형 분류 및 검색 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 템플릿 목록 하단과 페이지

- Screen ID: `sc_11a3721184c941fc93b0a8301b4bc42f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_11a3721184c941fc93b0a8301b4bc42f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a8512e86-6814-48ed-90fc-c9d015d6bf73.png)
- 로컬 이미지: [04_sc_11a3721184c941fc93b0a8301b4bc42f.png](<screens/04_sc_11a3721184c941fc93b0a8301b4bc42f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ae2295adabb2431194bd0b9d85801df1` → 현재 → `sc_3e50a7eb10764ee09c56f622933cc67b`

#### 화면에서 직접 확인한 내용

- 레이아웃: Design 목록 아래쪽. 좌 업종 추가 항목·우 카드·하단 페이지네이션.
- 입력 항목·필수 표시·기본값: Design Scope of Work, E-Commerce Website Develo…, Email Newsletter Design Quo… 등. 페이지1 선택.
- 버튼·메뉴·안내 문구: Previous 비활성처럼 보임,1/2/3/4/Next, Use Template, X.
- 확인된 상태: 같은 결과의 스크롤 하단.
- 단계 간 변화: Design 결과를 아래로 스크롤해 페이지네이션과 템플릿을 확인한다.

#### 동작과 데이터

- 화면 관찰: 목록에 페이지 구분이 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 페이지당 고정 개수와 필터 변경 시 페이지 초기화 미확인.

#### 모델링 영향

- 후보와 근거: 검색 결과 페이지 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Creative Design Brief 미리보기 로딩

- Screen ID: `sc_3e50a7eb10764ee09c56f622933cc67b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3e50a7eb10764ee09c56f622933cc67b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5bdde27f-ac48-4562-afc7-7b45343c9e5a.png)
- 로컬 이미지: [05_sc_3e50a7eb10764ee09c56f622933cc67b.png](<screens/05_sc_3e50a7eb10764ee09c56f622933cc67b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_11a3721184c941fc93b0a8301b4bc42f` → 현재 → `sc_e06e394dc2834d088abe045ce60d72aa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 All Templates·Previewing 제목·Use Template, 본문 흰 바탕과 초록 점 로딩.
- 입력 항목·필수 표시·기본값: 미리보기 대상 Creative Design Brief.
- 버튼·메뉴·안내 문구: All Templates, Use Template, X.
- 확인된 상태: 로딩 상태. 빈 문서 오류로 해석하지 않음.
- 단계 간 변화: Creative Design Brief 미리보기가 로딩된다.

#### 동작과 데이터

- 화면 관찰: 템플릿 선택 후 상세 미리보기를 불러오는 중.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 로딩 실패·취소·중복 선택 처리 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 미리보기 비동기 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Creative Design Brief 템플릿 미리보기

- Screen ID: `sc_e06e394dc2834d088abe045ce60d72aa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e06e394dc2834d088abe045ce60d72aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/54d5dfb1-6447-4711-8a43-dbb33c3157e2.png)
- 로컬 이미지: [06_sc_e06e394dc2834d088abe045ce60d72aa.png](<screens/06_sc_e06e394dc2834d088abe045ce60d72aa.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_3e50a7eb10764ee09c56f622933cc67b` → 현재 → `sc_819e42ff35984ce691d92c014503a99c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 가로 추상 이미지 아래 세리프 제목·Sent/Accepted 빈 날짜·발신/수신 카드.
- 입력 항목·필수 표시·기본값: Company name·Sample Client와 템플릿 이메일 예시.
- 버튼·메뉴·안내 문구: Use Template, All Templates, X.
- 확인된 상태: 공용 템플릿 읽기 화면.
- 단계 간 변화: 템플릿 문서 미리보기가 표시된다.

#### 동작과 데이터

- 화면 관찰: 문서 구조와 기본 이미지·타이포가 템플릿에 포함됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 표시 예시가 생성 시 어떤 값으로 치환되는지 아직 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 콘텐츠/스타일과 생성 문서 값 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 제안서 생성 모달 고객 미선택

- Screen ID: `sc_819e42ff35984ce691d92c014503a99c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_819e42ff35984ce691d92c014503a99c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7a448fd2-eebf-46df-afa0-28cc4b6ec046.png)
- 로컬 이미지: [07_sc_819e42ff35984ce691d92c014503a99c.png](<screens/07_sc_819e42ff35984ce691d92c014503a99c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e06e394dc2834d088abe045ce60d72aa` → 현재 → `sc_520c53447c1e40938fc30c2c32ef125a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Create a Proposal. 템플릿 요약·고객·새 프로젝트명 세로 입력.
- 입력 항목·필수 표시·기본값: Creative Design Brief, Client Select…, New Project Name 회색 Consulting Project. 별표 없음.
- 버튼·메뉴·안내 문구: Change Template, Create Proposal, 외곽 X.
- 확인된 상태: 고객 선택 전.
- 단계 간 변화: Use Template 후 고객·프로젝트 생성 모달이 나타난다.

#### 동작과 데이터

- 화면 관찰: 템플릿 사용 후 업무 연결 정보를 요구한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값·미입력 오류·이름 예시와 기본값 구분 미확인.

#### 모델링 영향

- 후보와 근거: 생성 입력 및 선택한 템플릿 참조 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 제안서 작성 중 신규 고객 분기

- Screen ID: `sc_520c53447c1e40938fc30c2c32ef125a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_520c53447c1e40938fc30c2c32ef125a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/84ab9545-26aa-4b0c-ba3d-311db3b20a23.png)
- 로컬 이미지: [08_sc_520c53447c1e40938fc30c2c32ef125a.png](<screens/08_sc_520c53447c1e40938fc30c2c32ef125a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_819e42ff35984ce691d92c014503a99c` → 현재 → `sc_22da5c665d8543e391ea16451efc26d8`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client 아래 들여쓰기·세로 경계로 이름/이메일 입력 펼침.
- 입력 항목·필수 표시·기본값: +New Client, Client Name 회색 Jane Smith, Client Email 회색 new@email.com, 새 프로젝트명 예시.
- 버튼·메뉴·안내 문구: Create Proposal, Change Template, X.
- 확인된 상태: 신규 고객 입력 분기 탐색. 실제 값 입력 전.
- 단계 간 변화: +New Client 선택으로 이름·이메일 입력이 펼쳐진다.

#### 동작과 데이터

- 화면 관찰: 기존 고객 선택 외 인라인 신규 생성 경로가 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 회사명/연락처 분리·이메일 필수·중복 처리 미확인.

#### 모델링 영향

- 후보와 근거: 고객 생성 초안과 문서 생성 초안 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 기존 고객과 프로젝트 선택

- Screen ID: `sc_22da5c665d8543e391ea16451efc26d8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_22da5c665d8543e391ea16451efc26d8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d6936088-7dba-40cf-9279-5c1b97efddd3.png)
- 로컬 이미지: [09_sc_22da5c665d8543e391ea16451efc26d8.png](<screens/09_sc_22da5c665d8543e391ea16451efc26d8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_520c53447c1e40938fc30c2c32ef125a` → 현재 → `sc_a15475bec427432fb0123cb80d832bb0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달이 짧아지고 신규 고객 필드 사라짐.
- 입력 항목·필수 표시·기본값: Doe Company, Design Project with Doe Studio, Creative Design Brief.
- 버튼·메뉴·안내 문구: Create Proposal·Change Template·X.
- 확인된 상태: 기존 데이터 연결 상태.
- 단계 간 변화: 신규 고객 작성 대신 Doe Company와 기존 프로젝트를 선택한다.

#### 동작과 데이터

- 화면 관찰: 신규 고객은 최종 사용하지 않고 기존 고객을 선택.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객 변경 시 이전 임시 입력 보존 여부 미확인.

#### 모델링 영향

- 후보와 근거: 선택 고객에 맞는 프로젝트 목록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 제안서에서 새 프로젝트 분기

- Screen ID: `sc_a15475bec427432fb0123cb80d832bb0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a15475bec427432fb0123cb80d832bb0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/55d1880e-319c-4cf5-8ec6-69f9c31d8f6c.png)
- 로컬 이미지: [10_sc_a15475bec427432fb0123cb80d832bb0.png](<screens/10_sc_a15475bec427432fb0123cb80d832bb0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_22da5c665d8543e391ea16451efc26d8` → 현재 → `sc_004461870bef44df89cc6329c1249841`

#### 화면에서 직접 확인한 내용

- 레이아웃: 기존 고객 아래 프로젝트 선택과 새 이름 필드가 함께 표시.
- 입력 항목·필수 표시·기본값: Doe Company, Project +New Project, New Project Name 회색 Consulting Project.
- 버튼·메뉴·안내 문구: Create Proposal, Change Template, X.
- 확인된 상태: 신규 프로젝트 입력 전.
- 단계 간 변화: 프로젝트를 +New Project로 전환한다.

#### 동작과 데이터

- 화면 관찰: 선택한 고객 아래 프로젝트 생성 경로를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 프로젝트 생성 시점·취소 시 롤백 미확인.

#### 모델링 영향

- 후보와 근거: 문서와 프로젝트 동시 생성 요청 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Rebranding Project 이름 입력

- Screen ID: `sc_004461870bef44df89cc6329c1249841`
- 원본: [화면 페이지](https://gummble.com/screens/sc_004461870bef44df89cc6329c1249841?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/67596603-c3da-41ac-957d-e48458d8594d.png)
- 로컬 이미지: [11_sc_004461870bef44df89cc6329c1249841.png](<screens/11_sc_004461870bef44df89cc6329c1249841.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a15475bec427432fb0123cb80d832bb0` → 현재 → `sc_455f71d704fd4c01b41254a6f93a21fa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 신규 프로젝트 모달 구조 유지.
- 입력 항목·필수 표시·기본값: New Project Name Rebranding Project, 고객 Doe Company.
- 버튼·메뉴·안내 문구: Create Proposal, X.
- 확인된 상태: 생성 직전 작성 완료.
- 단계 간 변화: 새 프로젝트명 Rebranding Project를 입력한다.

#### 동작과 데이터

- 화면 관찰: 프로젝트명 실제 입력을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이름 길이/중복·프로젝트 초기 상태 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 표시명과 문서 제목 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — 제안서 초안 편집기

- Screen ID: `sc_455f71d704fd4c01b41254a6f93a21fa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_455f71d704fd4c01b41254a6f93a21fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c74fe7ff-870e-4986-8ebc-046f9c1c7b5a.png)
- 로컬 이미지: [12_sc_455f71d704fd4c01b41254a6f93a21fa.png](<screens/12_sc_455f71d704fd4c01b41254a6f93a21fa.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_004461870bef44df89cc6329c1249841` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Proposals/프로젝트/Changes Saved, 중앙 문서, 오른쪽 Overview/Style. 이미지·로고·세리프 제목.
- 입력 항목·필수 표시·기본값: Drafted, Single Option, Amount5255, 만료 Set Expiration. Classic, Title/Text/Background/BottomBorder 색·폭1, Global Font Brawler.
- 버튼·메뉴·안내 문구: Preview, Automation, Send Proposal, …, 이미지Edit/X, 로고X, Add Recipient, Theme/색/글꼴.
- 확인된 상태: 초안 생성 및 저장 표시. Sent/Accepted 날짜 빈칸.
- 단계 간 변화: Create Proposal 후 편집기와 Changes Saved 표시가 나타난다.

#### 동작과 데이터

- 화면 관찰: Rebranding Project와 Doe Company에 연결된 문서가 생성됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 금액 산출 항목·템플릿 치환·자동저장 주기 미확인.

#### 모델링 영향

- 후보와 근거: 제안서 콘텐츠·수신자·스타일·요금 구조·상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 템플릿 미리보기와 사용자 문서는 구분된다. 미리보기의 Sample Client는 템플릿 예시다.
- [관찰] 고객/프로젝트의 기존 선택과 신규 입력이 조건부로 전환된다. New Client를 눌렀다는 사실만으로 고객이 생성된 것은 아니다.
- [관찰] 최종 제안서는 Single Option, $5,255, Drafted, 만료 미설정. 금액이 템플릿에서 왔을 가능성은 있지만 계산 구성은 이 흐름에 없다.
- [문서] 제안서에는 본문 모듈·수수료 구조와 템플릿이 있으며 구형/현행 편집기를 분리해야 한다.

## 6. 공식 도움말과 API 대조

- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 2026-07-27 이후 생성 계정은 통합 Document builder를 사용한다고 명시한다. 이 캡처의 기존 Proposals 편집기와 현재 API의 Docs를 같은 버전으로 간주하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`가 공개되어 있다. 캡처의 Type/Industry 분류와 응답 필드의 직접 대응은 미확인.

## 7. 데이터 모델링 시사점

- 문서 템플릿·템플릿 분류·제안서 초안·프로젝트·고객·수신자 연결 후보.
- 문서 제목과 프로젝트명은 독립이다. Rebranding Project에 Creative Design Brief 제목 문서를 생성한다.
- 신규 프로젝트 동시 생성과 제안서 생성의 트랜잭션·실패 복구는 후보만 남기며 내부 구현을 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 신규 고객/프로젝트 입력 후 제안서 생성을 취소하면 어떤 리소스가 남는지 확인한다.
- 템플릿 금액·본문 placeholder·발신자 정보가 어떤 시점에 치환되는지 확인한다.
- 고객 선택 시 기본 수신자가 결정되는 규칙과 다중 수신자 권한·승인 주체를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 12개와 실제 이미지 12개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 12단계 재조회 및 원본 12개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
