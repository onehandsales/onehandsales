# Adding a tag 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **9/9단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3aa597f9-f613-46dd-bd8c-45686e423865` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3aa597f9-f613-46dd-bd8c-45686e423865) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 9단계 / 9단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 9개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트 카드의 Tags 메뉴에서 새 라벨을 만들고 카드에 적용하는 흐름이다.

- 생성된 Consulting Project/Sample Client에서 시작한다. 적용된 Sample 태그는 사용자가 만든 이름이다.
- Sample Client의 데모 성격과 Sample이라는 태그 이름은 구분한다. 태그가 샘플 동작을 켜는 근거는 없다.
- 태그 추가 뒤 카드가 커지며 프로젝트 제목·고객 아래 태그를 보여준다.

- 상위 분석: [Projects](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Projects/Adding a tag`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_21c57bdee8d94269af945440ba1c1c84`](https://gummble.com/screens/sc_21c57bdee8d94269af945440ba1c1c84?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 생성 성공 보드](<screens/01_sc_21c57bdee8d94269af945440ba1c1c84.png>) | 새 프로젝트의 카드/열 액션 노출. |
| 02 | [`sc_ce68515567e24d2993b3728912380683`](https://gummble.com/screens/sc_ce68515567e24d2993b3728912380683?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 카드 액션 노출](<screens/02_sc_ce68515567e24d2993b3728912380683.png>) | 프로젝트 카드 말줄임 메뉴 열림. |
| 03 | [`sc_8252c0a8db354aafa8406aba00fb74bc`](https://gummble.com/screens/sc_8252c0a8db354aafa8406aba00fb74bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 카드 메뉴](<screens/03_sc_8252c0a8db354aafa8406aba00fb74bc.png>) | Tags 모달 빈 상태. |
| 04 | [`sc_4b81e45531a346209fcc2feecc874ae2`](https://gummble.com/screens/sc_4b81e45531a346209fcc2feecc874ae2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 태그 빈 모달](<screens/04_sc_4b81e45531a346209fcc2feecc874ae2.png>) | +Add Tag로 선택/생성 입력 표시. |
| 05 | [`sc_a9c50a58018942258a29b0015cea48b9`](https://gummble.com/screens/sc_a9c50a58018942258a29b0015cea48b9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [태그 선택과 생성 입력](<screens/05_sc_a9c50a58018942258a29b0015cea48b9.png>) | Sample을 입력하면 새 태그 생성 제안. |
| 06 | [`sc_8cf03c06713d48c98a2971716209c36b`](https://gummble.com/screens/sc_8cf03c06713d48c98a2971716209c36b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 태그 생성 제안](<screens/06_sc_8cf03c06713d48c98a2971716209c36b.png>) | Sample 태그와 Edit, 성공 토스트. |
| 07 | [`sc_81a1fcc323794cba8bcb2b5e4bb7eeb8`](https://gummble.com/screens/sc_81a1fcc323794cba8bcb2b5e4bb7eeb8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [태그 적용 성공](<screens/07_sc_81a1fcc323794cba8bcb2b5e4bb7eeb8.png>) | 모달을 닫고 카드에 Sample 태그 표시. |
| 08 | [`sc_aac14308ef5b42d39dacf9db53326aea`](https://gummble.com/screens/sc_aac14308ef5b42d39dacf9db53326aea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 카드의 태그 표시](<screens/08_sc_aac14308ef5b42d39dacf9db53326aea.png>) | 보드 왼쪽으로 스크롤해 전체 프로젝트 문맥 확인. |
| 09 | [`sc_3ade80505ba3458cb239c839815b3750`](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 보드 목록](<screens/09_sc_3ade80505ba3458cb239c839815b3750.png>) | 카드에 태그가 유지된 상태로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 생성 성공 보드

- Screen ID: `sc_21c57bdee8d94269af945440ba1c1c84`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21c57bdee8d94269af945440ba1c1c84?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/30be357f-274f-40fc-87ed-4cf01a55d7ed.png)
- 로컬 이미지: [01_sc_21c57bdee8d94269af945440ba1c1c84.png](<screens/01_sc_21c57bdee8d94269af945440ba1c1c84.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_ce68515567e24d2993b3728912380683`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽으로 스크롤한 프로젝트 보드. In Progress에 Consulting Project 카드와 생성 토스트.
- 입력 항목·필수 표시·기본값: 고객 Sample Client, 태그는 아직 없음. In Progress1개.
- 버튼·메뉴·안내 문구: Project created successfully, 각 열 New Project.
- 확인된 상태: 생성 결과를 보여주는 시작 맥락.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트가 In Progress에 생성됐으나 기본 상태인지 진입 열 때문인지 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 생성 요청의 단계값·샘플 고객 의미.

#### 모델링 영향

- 후보와 근거: 프로젝트 생성 결과와 이후 태그 연결 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 카드 액션 노출

- Screen ID: `sc_ce68515567e24d2993b3728912380683`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ce68515567e24d2993b3728912380683?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/07e91ea7-c7f6-43ab-ad27-6527f7ba7346.png)
- 로컬 이미지: [02_sc_ce68515567e24d2993b3728912380683.png](<screens/02_sc_ce68515567e24d2993b3728912380683.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_21c57bdee8d94269af945440ba1c1c84` → 현재 → `sc_8252c0a8db354aafa8406aba00fb74bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: Consulting Project 카드 테두리·말줄임, 열 헤더+·말줄임, 가로 스크롤바.
- 입력 항목·필수 표시·기본값: 제목·고객 유지, 태그 없음.
- 버튼·메뉴·안내 문구: 카드 말줄임과 열 말줄임이 별도로 위치.
- 확인된 상태: 행 상호작용 상태.
- 단계 간 변화: 새 프로젝트의 카드/열 액션 노출.

#### 동작과 데이터

- 화면 관찰: 열 설정과 개별 프로젝트 액션은 서로 다르다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover/포커스 활성 조건.

#### 모델링 영향

- 후보와 근거: 카드별 메뉴와 열별 메뉴 UI 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 카드 메뉴

- Screen ID: `sc_8252c0a8db354aafa8406aba00fb74bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8252c0a8db354aafa8406aba00fb74bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/492d8838-4cd3-4daa-aa4c-98e236d5a9e3.png)
- 로컬 이미지: [03_sc_8252c0a8db354aafa8406aba00fb74bc.png](<screens/03_sc_8252c0a8db354aafa8406aba00fb74bc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ce68515567e24d2993b3728912380683` → 현재 → `sc_4b81e45531a346209fcc2feecc874ae2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 카드 말줄임 아래 흰색 세로 메뉴.
- 입력 항목·필수 표시·기본값: 입력 폼 없음.
- 버튼·메뉴·안내 문구: Tags, Mark Completed, Archive Project, Delete Project.
- 확인된 상태: 태그 편집 진입 전.
- 단계 간 변화: 프로젝트 카드 말줄임 메뉴 열림.

#### 동작과 데이터

- 화면 관찰: 프로젝트의 태그와 수명주기 액션이 같은 메뉴에 있지만 기능은 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할별 메뉴·완료/보관/삭제 결과.

#### 모델링 영향

- 후보와 근거: 태그 연결 편집 명령 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 태그 빈 모달

- Screen ID: `sc_4b81e45531a346209fcc2feecc874ae2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4b81e45531a346209fcc2feecc874ae2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7b6b8b1e-7ed6-444d-b8ad-4ab5c43d5b4b.png)
- 로컬 이미지: [04_sc_4b81e45531a346209fcc2feecc874ae2.png](<screens/04_sc_4b81e45531a346209fcc2feecc874ae2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8252c0a8db354aafa8406aba00fb74bc` → 현재 → `sc_a9c50a58018942258a29b0015cea48b9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경 위 중앙 작은 Tags 모달.
- 입력 항목·필수 표시·기본값: 아직 태그 없음.
- 버튼·메뉴·안내 문구: +Add Tag, 바깥 닫기X.
- 확인된 상태: 프로젝트에 표시할 태그가 없는 상태.
- 단계 간 변화: Tags 모달 빈 상태.

#### 동작과 데이터

- 화면 관찰: 태그 생성/선택 진입점만 노출.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 계정 전체 태그가 없는지 해당 프로젝트만 없는지.

#### 모델링 영향

- 후보와 근거: 프로젝트 태그 연결의 빈 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 태그 선택과 생성 입력

- Screen ID: `sc_a9c50a58018942258a29b0015cea48b9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a9c50a58018942258a29b0015cea48b9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8ef72933-c889-4def-b129-45de425f4af0.png)
- 로컬 이미지: [05_sc_a9c50a58018942258a29b0015cea48b9.png](<screens/05_sc_a9c50a58018942258a29b0015cea48b9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4b81e45531a346209fcc2feecc874ae2` → 현재 → `sc_8cf03c06713d48c98a2971716209c36b`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tags 모달 안에 펼친 선택 입력.
- 입력 항목·필수 표시·기본값: Select…; 아래 Type to create a tag.
- 버튼·메뉴·안내 문구: 입력과 드롭다운 화살표.
- 확인된 상태: 태그 선택 검색/생성 준비.
- 단계 간 변화: +Add Tag로 선택/생성 입력 표시.

#### 동작과 데이터

- 화면 관찰: 직접 입력하여 생성하는 안내를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기존 태그 검색·권한·입력 제한.

#### 모델링 영향

- 후보와 근거: 공유 태그 검색과 신규 정의 생성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 새 태그 생성 제안

- Screen ID: `sc_8cf03c06713d48c98a2971716209c36b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8cf03c06713d48c98a2971716209c36b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e648d989-39d7-49e5-b1c0-ccd6092b0542.png)
- 로컬 이미지: [06_sc_8cf03c06713d48c98a2971716209c36b.png](<screens/06_sc_8cf03c06713d48c98a2971716209c36b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a9c50a58018942258a29b0015cea48b9` → 현재 → `sc_81a1fcc323794cba8bcb2b5e4bb7eeb8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 선택 입력에 Sample, 아래 초록 제안행.
- 입력 항목·필수 표시·기본값: 이름 Sample.
- 버튼·메뉴·안내 문구: Create Sample 제안.
- 확인된 상태: 입력값과 일치하는 새 태그 생성 액션.
- 단계 간 변화: Sample을 입력하면 새 태그 생성 제안.

#### 동작과 데이터

- 화면 관찰: 아직 적용된 칩이 아니라 생성 제안 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 동명 태그 존재 시 결과·Enter처리.

#### 모델링 영향

- 후보와 근거: 태그 생성과 연결 작업의 경계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 태그 적용 성공

- Screen ID: `sc_81a1fcc323794cba8bcb2b5e4bb7eeb8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_81a1fcc323794cba8bcb2b5e4bb7eeb8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ac7bf396-1ecb-47f8-beb6-5dda2f743b73.png)
- 로컬 이미지: [07_sc_81a1fcc323794cba8bcb2b5e4bb7eeb8.png](<screens/07_sc_81a1fcc323794cba8bcb2b5e4bb7eeb8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8cf03c06713d48c98a2971716209c36b` → 현재 → `sc_aac14308ef5b42d39dacf9db53326aea`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tags 모달에 Sample 칩·Edit, 우측 아래 성공 토스트.
- 입력 항목·필수 표시·기본값: Sample 라벨1개.
- 버튼·메뉴·안내 문구: Edit, 닫기X, 태그 업데이트 성공 토스트.
- 확인된 상태: 새 라벨이 적용된 피드백.
- 단계 간 변화: Sample 태그와 Edit, 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 모달을 닫기 전에 성공 결과를 표시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Edit범위·다중태그·저장실패 처리.

#### 모델링 영향

- 후보와 근거: 태그 정의와 프로젝트 연결 저장 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 프로젝트 카드의 태그 표시

- Screen ID: `sc_aac14308ef5b42d39dacf9db53326aea`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aac14308ef5b42d39dacf9db53326aea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e4f2e678-2e98-43d6-8271-73662293bf49.png)
- 로컬 이미지: [08_sc_aac14308ef5b42d39dacf9db53326aea.png](<screens/08_sc_aac14308ef5b42d39dacf9db53326aea.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_81a1fcc323794cba8bcb2b5e4bb7eeb8` → 현재 → `sc_3ade80505ba3458cb239c839815b3750`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달 닫힘. Consulting Project 카드의 고객명 아래 보라색 Sample 칩.
- 입력 항목·필수 표시·기본값: 제목·고객·상태 유지. 태그 추가로 카드 높이 증가.
- 버튼·메뉴·안내 문구: 카드 진입, New Project.
- 확인된 상태: 카드 요약에 태그가 반영됨.
- 단계 간 변화: 모달을 닫고 카드에 Sample 태그 표시.

#### 동작과 데이터

- 화면 관찰: 태그는 진행 단계와 독립적으로 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그 필터·색상 공유·렌더링 줄바꿈.

#### 모델링 영향

- 후보와 근거: 프로젝트 요약의 태그 배열 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 프로젝트 보드 목록

- Screen ID: `sc_3ade80505ba3458cb239c839815b3750`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/640cef91-a4b8-48f4-b2db-8cbaf7232903.png)
- 로컬 이미지: [09_sc_3ade80505ba3458cb239c839815b3750.png](<screens/09_sc_3ade80505ba3458cb239c839815b3750.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_aac14308ef5b42d39dacf9db53326aea` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Projects 제목, Board View/List View 탭, 검색·Filters·New Project. 상태 열이 가로로 길게 이어져 오른쪽이 잘림.
- 입력 항목·필수 표시·기본값: New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent0, Contract Signed0, In Progress1개 Consulting Project/Sample Client/Sample태그.
- 버튼·메뉴·안내 문구: 각 열 +New Project, New Project, 뷰 탭.
- 확인된 상태: 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖.
- 단계 간 변화: 보드 왼쪽으로 스크롤해 전체 프로젝트 문맥 확인.

#### 동작과 데이터

- 화면 관찰: 프로젝트 카드의 고객·태그와 상태 열 연결을 관찰.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 열 수·가로스크롤 방식·드래그·필터.

#### 모델링 영향

- 후보와 근거: 프로젝트 상태/보드 그룹과 고객·태그 투영 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 빈 태그 모달→선택/입력→Create 제안→태그 적용의 단계가 있다.
- 관찰: 태그 업데이트 성공이 모달을 닫기 전에 표시된다. 별도 Save 버튼은 이 캡처에 없다.
- 미확인: 여러 태그·중복 이름·삭제·색 변경·Edit의 대상 범위.

## 6. 공식 도움말과 API 대조

- [Company Tags API](https://docs.hellobonsai.com/api/tag/company-tags): GET `/public-api/v1/company_tags`는 고객·거래·프로젝트·작업·시간·비용에 적용하는 계정 라벨을 설명한다. 이 읽기 endpoint만으로 태그 생성·적용 쓰기 계약은 확인되지 않는다.
- [프로젝트 수명주기 도움말](https://help.hellobonsai.com/en/articles/1867536-completing-archiving-or-deleting-a-project): 완료 상태 변경이 태그를 자동 변경하지 않는다는 점을 대조했다. 이번 태그 생성 상세 규칙의 직접 도움말은 찾지 못했다.

## 7. 데이터 모델링 시사점

- 태그 정의와 프로젝트-태그 연결을 구분하는 후보. 다른 업무에도 적용 가능한 라벨이라는 공식 API 근거가 있다.
- 태그의 이름·색·계정 범위·중복정책은 후보이며 구체 제약은 미정.
- FE 후보: 카드 메뉴·태그 모달·검색과 생성 제안·적용 칩·토스트·카드 높이 변화.

## 8. 미확인 사항과 검토 질문

- 태그 Edit는 이름/색 수정인가 연결 해제인가? 실제 메뉴를 추가 확인한다.
- 같은 이름 생성 시 기존 태그로 합쳐지는가? 대소문자·공백·동시 생성을 검증한다.
- 여러 업무에 쓰는 태그 수정/삭제가 모든 연결에 전파되는가? 관련 객체를 함께 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 9개와 실제 이미지 9개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 9단계 재조회 및 원본 9개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
