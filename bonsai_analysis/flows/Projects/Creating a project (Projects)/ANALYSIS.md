# Creating a project (Projects) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ddea1540-3c0b-4e00-8805-12b4adc290c1` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ddea1540-3c0b-4e00-8805-12b4adc290c1) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트 보드에서 고객을 선택하고 프로젝트명을 입력해 새 프로젝트를 생성한다.

- Sample Client를 선택한 데모 시나리오다. 일반 고객과 다르게 자동 수락/결제 안내가 있다.
- 프로젝트 팀에는 Joe Doe가 미리 표시된다.
- 종료는 In Progress의 Consulting Project 생성 성공. 어떤 열의 생성 버튼을 눌렀는지는 중간 캡처가 부족하다.

- 상위 분석: [Projects](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Projects/Creating a project (Projects)`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_da6135eadeff44e49c083b563487ddf5`](https://gummble.com/screens/sc_da6135eadeff44e49c083b563487ddf5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 보드의 초기 목록](<screens/01_sc_da6135eadeff44e49c083b563487ddf5.png>) | New Project 모달. |
| 02 | [`sc_2d71503ee10849e088000dc2e54b6ccf`](https://gummble.com/screens/sc_2d71503ee10849e088000dc2e54b6ccf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 생성 모달](<screens/02_sc_2d71503ee10849e088000dc2e54b6ccf.png>) | 고객 선택 목록 펼침. |
| 03 | [`sc_1a98cb92e1634dd99d8c17c363bb99e8`](https://gummble.com/screens/sc_1a98cb92e1634dd99d8c17c363bb99e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 고객 선택 목록](<screens/03_sc_1a98cb92e1634dd99d8c17c363bb99e8.png>) | Sample Client 선택 후 데모 안내 표시. |
| 04 | [`sc_2f907e9803904b87b72a16e8ad14ef3b`](https://gummble.com/screens/sc_2f907e9803904b87b72a16e8ad14ef3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [샘플 고객의 자동 처리 안내](<screens/04_sc_2f907e9803904b87b72a16e8ad14ef3b.png>) | Project Title=Consulting Project 입력. |
| 05 | [`sc_a49b5154a1e944b290d48ba802aad137`](https://gummble.com/screens/sc_a49b5154a1e944b290d48ba802aad137?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 프로젝트 제목 입력](<screens/05_sc_a49b5154a1e944b290d48ba802aad137.png>) | 모달 닫힘, In Progress 카드와 생성 성공 토스트. |
| 06 | [`sc_21c57bdee8d94269af945440ba1c1c84`](https://gummble.com/screens/sc_21c57bdee8d94269af945440ba1c1c84?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 생성 성공 보드](<screens/06_sc_21c57bdee8d94269af945440ba1c1c84.png>) | 생성 완료. 태그는 이후 Adding a tag에서 부여. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 보드의 초기 목록

- Screen ID: `sc_da6135eadeff44e49c083b563487ddf5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_da6135eadeff44e49c083b563487ddf5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/35407a91-9f73-49a8-883b-d320f0b49dd8.png)
- 로컬 이미지: [01_sc_da6135eadeff44e49c083b563487ddf5.png](<screens/01_sc_da6135eadeff44e49c083b563487ddf5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_2d71503ee10849e088000dc2e54b6ccf`

#### 화면에서 직접 확인한 내용

- 레이아웃: Projects/Board View·List View. Search·Filters·New Project. 상태 열이 가로로 이어짐.
- 입력 항목·필수 표시·기본값: New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent·Contract Signed·In Progress0.
- 버튼·메뉴·안내 문구: 각 열 +New Project, New Project, List View.
- 확인된 상태: 프로젝트1개와 여러 빈 열.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 보드의 진행 단계와 고객 표시를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 우측의 전체 열·정렬·필터 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트/고객 참조와 단계별 개수 투영.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 생성 모달

- Screen ID: `sc_2d71503ee10849e088000dc2e54b6ccf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2d71503ee10849e088000dc2e54b6ccf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/12c1d999-6dec-4ebe-8a38-b132be4b067b.png)
- 로컬 이미지: [02_sc_2d71503ee10849e088000dc2e54b6ccf.png](<screens/02_sc_2d71503ee10849e088000dc2e54b6ccf.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_da6135eadeff44e49c083b563487ddf5` → 현재 → `sc_1a98cb92e1634dd99d8c17c363bb99e8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 중앙 New Project. Client, Project Title, Project Team을 세로 배치.
- 입력 항목·필수 표시·기본값: Client=Select…, Project Title 회색 Consulting Project, 팀Joe Doe. 필수별표 없음.
- 버튼·메뉴·안내 문구: Create Project, 닫기X, Contact Support.
- 확인된 상태: 고객·제목 미입력으로 보이는 초기 폼.
- 단계 간 변화: New Project 모달.

#### 동작과 데이터

- 화면 관찰: 팀멤버가 미리 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 팀 초깃값·필수 검증·제목 placeholder 여부.

#### 모델링 영향

- 후보와 근거: 고객·프로젝트 이름·초기 팀 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 고객 선택 목록

- Screen ID: `sc_1a98cb92e1634dd99d8c17c363bb99e8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1a98cb92e1634dd99d8c17c363bb99e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6b1a177d-8981-4685-9c15-7dcbd012ba5f.png)
- 로컬 이미지: [03_sc_1a98cb92e1634dd99d8c17c363bb99e8.png](<screens/03_sc_1a98cb92e1634dd99d8c17c363bb99e8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2d71503ee10849e088000dc2e54b6ccf` → 현재 → `sc_2f907e9803904b87b72a16e8ad14ef3b`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client 아래 목록이 제목 입력을 일부 덮음.
- 입력 항목·필수 표시·기본값: +New Client, Doe Company와 이메일, Sample Client와 이메일.
- 버튼·메뉴·안내 문구: 고객선택, +New Client.
- 확인된 상태: 기존 고객 선택과 새 고객 생성 진입.
- 단계 간 변화: 고객 선택 목록 펼침.

#### 동작과 데이터

- 화면 관찰: 표시명과 이메일을 함께 사용해 고객을 구별한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 여러 연락처 중 표시 이메일 선택·검색·권한.

#### 모델링 영향

- 후보와 근거: 고객 참조와 선택 UI의 보조 연락처 투영.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 샘플 고객의 자동 처리 안내

- Screen ID: `sc_2f907e9803904b87b72a16e8ad14ef3b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2f907e9803904b87b72a16e8ad14ef3b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e27342c3-8224-4312-b3b9-e6871084e668.png)
- 로컬 이미지: [04_sc_2f907e9803904b87b72a16e8ad14ef3b.png](<screens/04_sc_2f907e9803904b87b72a16e8ad14ef3b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1a98cb92e1634dd99d8c17c363bb99e8` → 현재 → `sc_a49b5154a1e944b290d48ba802aad137`

#### 화면에서 직접 확인한 내용

- 레이아웃: Sample Client 선택 아래 연노랑 안내 상자.
- 입력 항목·필수 표시·기본값: 제목은 아직 회색 예시, 팀Joe Doe.
- 버튼·메뉴·안내 문구: Create Project, 고객변경, 닫기.
- 확인된 상태: 데모 고객 조건부 안내.
- 단계 간 변화: Sample Client 선택 후 데모 안내 표시.

#### 동작과 데이터

- 화면 관찰: 샘플 프로젝트 문서의 자동 수락/결제 안내를 직접 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 결제 시뮬레이션 방식·샘플 제거·일반 고객전환.

#### 모델링 영향

- 후보와 근거: 데모 모드/샘플 식별 후보를 일반 도메인 상태와 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 새 프로젝트 제목 입력

- Screen ID: `sc_a49b5154a1e944b290d48ba802aad137`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a49b5154a1e944b290d48ba802aad137?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/904370cc-e20e-431f-95b6-2c200ee34e1f.png)
- 로컬 이미지: [05_sc_a49b5154a1e944b290d48ba802aad137.png](<screens/05_sc_a49b5154a1e944b290d48ba802aad137.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2f907e9803904b87b72a16e8ad14ef3b` → 현재 → `sc_21c57bdee8d94269af945440ba1c1c84`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 폼과 샘플 안내.
- 입력 항목·필수 표시·기본값: Project Title 진한 Consulting Project. 고객Sample Client·팀Joe Doe 유지.
- 버튼·메뉴·안내 문구: Create Project.
- 확인된 상태: 생성 전 입력값 설정.
- 단계 간 변화: Project Title=Consulting Project 입력.

#### 동작과 데이터

- 화면 관찰: 예시와 같은 글자라도 이전은placeholder, 현재는 실제 입력으로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이름 중복·길이·빈값·생성중 UI.

#### 모델링 영향

- 후보와 근거: 프로젝트 생성 입력과 검증 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 프로젝트 생성 성공 보드

- Screen ID: `sc_21c57bdee8d94269af945440ba1c1c84`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21c57bdee8d94269af945440ba1c1c84?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/30be357f-274f-40fc-87ed-4cf01a55d7ed.png)
- 로컬 이미지: [06_sc_21c57bdee8d94269af945440ba1c1c84.png](<screens/06_sc_21c57bdee8d94269af945440ba1c1c84.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a49b5154a1e944b290d48ba802aad137` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽으로 스크롤한 프로젝트 보드. In Progress에 Consulting Project 카드와 생성 토스트.
- 입력 항목·필수 표시·기본값: 고객 Sample Client, 태그는 아직 없음. In Progress1개.
- 버튼·메뉴·안내 문구: Project created successfully, 각 열 New Project.
- 확인된 상태: 생성 결과를 보여주는 시작 맥락.
- 단계 간 변화: 모달 닫힘, In Progress 카드와 생성 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 프로젝트가 In Progress에 생성됐으나 기본 상태인지 진입 열 때문인지 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 생성 요청의 단계값·샘플 고객 의미.

#### 모델링 영향

- 후보와 근거: 프로젝트 생성 결과와 이후 태그 연결 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 회색 Consulting Project 예시와 실제 입력한 같은 이름을 색/단계로 구분한다.
- 관찰: Sample Client 안내는 이 프로젝트에 보내는 제안서·계약·인보이스가 자동 수락 또는 결제된다고 설명한다. 실제 일반 고객에 적용하지 않는다.
- 관찰: 생성 폼에 기한·청구방식·설명은 없으며 후속 설정에서 다룬다.
- 미확인: Client·Title 필수 조건, 자동 팀 배정·초기 단계 규칙, 샘플 데이터 식별 방식.

## 6. 공식 도움말과 API 대조

- [All about Projects](https://help.hellobonsai.com/en/articles/12783206-all-about-projects): 프로젝트가 작업·시간·청구·비용·문서·팀을 묶는 업무 단위임을 대조했다. 현재 문서의 새 탭 구성과 캡처의 탭 구성은 버전 차이를 유지한다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.
- [프로젝트 설정 도움말](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 생성 후 청구·기간 등을 설정하는 업무 개념을 대조했다. 캡처의 Sample Client 자동 처리 규칙을 일반 계정 규칙으로 설명하지 않는다.

## 7. 데이터 모델링 시사점

- 프로젝트 생성 요청의 고객·이름·초기 참여자·진행단계 후보.
- 샘플 고객/데모 동작과 사용자 태그는 다른 개념으로 분리할 후보. 데모 데이터를 일반 결제 이벤트로 다루지 않는다.
- FE 후보: 고객 선택·인라인 신규고객 진입·샘플안내·제목입력·생성후 보드 위치.

## 8. 미확인 사항과 검토 질문

- 고객 없이 프로젝트를 만들 수 있는가? API 필수값·UI 검증을 확인한다.
- 상단 New Project와 열 내부 New Project의 초기 단계가 다른가? 각각 재현한다.
- 고객 선택의 +New Client가 어떤 모달로 이어지는가? 기존 입력 보존도 확인한다.
- Sample Client 생성의 결제·문서 자동 처리가 테스트 환경에만 제한되는지 공식 자료와 실제 계정으로 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
