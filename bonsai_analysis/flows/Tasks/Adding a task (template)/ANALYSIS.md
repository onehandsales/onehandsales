# Adding a task (template) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **7/7단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d348e200-5e48-4825-a646-69a6741e85d8` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d348e200-5e48-4825-a646-69a6741e85d8) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 7단계 / 7단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 7개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

저장된 작업 템플릿을 선택한 프로젝트에 적용하여 실제 작업을 생성하는 흐름이다.

- 시작 Tasks 보드. New Task 옆 아이콘의 도움말은 Add from a task template.
- Select Task Template 모달에서 템플릿과 대상 프로젝트를 선택한다.
- 종료는 Consulting Project의 새 To Do 카드. 이후 캡처에는 기한이 생기지만 기한 입력 장면은 없다.

- 상위 분석: [Tasks](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Tasks/Adding a task (template)`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_fd79ede42b9843aca369d4e929c4272c`](https://gummble.com/screens/sc_fd79ede42b9843aca369d4e929c4272c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [전체 작업 보드](<screens/01_sc_fd79ede42b9843aca369d4e929c4272c.png>) | 템플릿 추가 아이콘 도움말 표시. 기존 Initial Chat의 상태도 Done으로 바뀌어 있으나 변경 과정은 생략. |
| 02 | [`sc_118bf693c6174ae4b7e209fb1221a5ad`](https://gummble.com/screens/sc_118bf693c6174ae4b7e209fb1221a5ad?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 적용 진입 도움말](<screens/02_sc_118bf693c6174ae4b7e209fb1221a5ad.png>) | 템플릿·프로젝트 선택 모달. |
| 03 | [`sc_0b8ddeccb45b4c09aac0680c15f68ca9`](https://gummble.com/screens/sc_0b8ddeccb45b4c09aac0680c15f68ca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿과 프로젝트 선택 모달](<screens/03_sc_0b8ddeccb45b4c09aac0680c15f68ca9.png>) | Default Task 템플릿 선택. |
| 04 | [`sc_8f8c685485c6437184cf778ab3ac510b`](https://gummble.com/screens/sc_8f8c685485c6437184cf778ab3ac510b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿만 선택한 상태](<screens/04_sc_8f8c685485c6437184cf778ab3ac510b.png>) | Consulting Project 선택, 생성 버튼 진한 초록으로 표시. |
| 05 | [`sc_de382cd5fbb94d6ca3ebcf1647b1919a`](https://gummble.com/screens/sc_de382cd5fbb94d6ca3ebcf1647b1919a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대상 프로젝트 선택 완료](<screens/05_sc_de382cd5fbb94d6ca3ebcf1647b1919a.png>) | 모달 닫힘, To Do 새 카드와 생성 성공 토스트. |
| 06 | [`sc_dcb91b20475d4ba791eedac5320b320b`](https://gummble.com/screens/sc_dcb91b20475d4ba791eedac5320b320b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [템플릿 기반 작업 생성 성공](<screens/06_sc_dcb91b20475d4ba791eedac5320b320b.png>) | 같은 카드에 Feb09 기한 표시. 기한 입력은 이 플로우에 없음. |
| 07 | [`sc_3eef549a1670486daf06221156e198bc`](https://gummble.com/screens/sc_3eef549a1670486daf06221156e198bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [생성 작업에 기한이 표시된 후속 보드](<screens/07_sc_3eef549a1670486daf06221156e198bc.png>) | 기록 종료. 생성 작업의 첨부·하위 항목 상세는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 전체 작업 보드

- Screen ID: `sc_fd79ede42b9843aca369d4e929c4272c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fd79ede42b9843aca369d4e929c4272c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3a706ecc-e895-40a1-bbde-da73a675c4cf.png)
- 로컬 이미지: [01_sc_fd79ede42b9843aca369d4e929c4272c.png](<screens/01_sc_fd79ede42b9843aca369d4e929c4272c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_118bf693c6174ae4b7e209fb1221a5ad`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks/ Templates 탭 아래 검색·Filters·Board와 우측 New Task 분할 버튼. 세 상태 열을 가로 배치.
- 입력 항목·필수 표시·기본값: 검색 placeholder Find a task. In Progress에 Initial Chat / Design Project with Doe Studio / Yesterday / JD 카드 한 개.
- 버튼·메뉴·안내 문구: 각 열 +New Task, 상단 New Task 옆 목록+ 아이콘.
- 확인된 상태: To Do와 Done은 비어 있고 진행 열만 데이터가 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 상태별 카드 배치와 담당자·기한 표시. 빈 열에도 생성 진입점이 남는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 보드 드래그·새 작업 기본 상태·필터/뷰 선택지.

#### 모델링 영향

- 후보와 근거: 작업 상태·제목·프로젝트·담당자·기한과 상태별 정렬 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 템플릿 적용 진입 도움말

- Screen ID: `sc_118bf693c6174ae4b7e209fb1221a5ad`
- 원본: [화면 페이지](https://gummble.com/screens/sc_118bf693c6174ae4b7e209fb1221a5ad?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f687e863-4a1b-481c-9885-36c096d8aa4e.png)
- 로컬 이미지: [02_sc_118bf693c6174ae4b7e209fb1221a5ad.png](<screens/02_sc_118bf693c6174ae4b7e209fb1221a5ad.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fd79ede42b9843aca369d4e929c4272c` → 현재 → `sc_0b8ddeccb45b4c09aac0680c15f68ca9`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks 보드 상단 New Task 분할 버튼의 오른쪽 아이콘 아래 검은 툴팁.
- 입력 항목·필수 표시·기본값: 카드 Initial Chat가 Done 열. 검색은 비어 있음.
- 버튼·메뉴·안내 문구: Add from a task template 도움말과 각 열 New Task.
- 확인된 상태: 이전 보드와 달리 기존 카드가 Done에 있다.
- 단계 간 변화: 템플릿 추가 아이콘 도움말 표시. 기존 Initial Chat의 상태도 Done으로 바뀌어 있으나 변경 과정은 생략.

#### 동작과 데이터

- 화면 관찰: 템플릿 적용 진입점과 카드 상태 차이만 관찰. 두 변화의 인과는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아이콘 클릭·기존 상태변경의 정확한 과정.

#### 모델링 영향

- 후보와 근거: 템플릿 적용 전역 액션과 보드 업무 상태 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 템플릿과 프로젝트 선택 모달

- Screen ID: `sc_0b8ddeccb45b4c09aac0680c15f68ca9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0b8ddeccb45b4c09aac0680c15f68ca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/03ff1711-df72-4de1-8e8e-a9548a48eb03.png)
- 로컬 이미지: [03_sc_0b8ddeccb45b4c09aac0680c15f68ca9.png](<screens/03_sc_0b8ddeccb45b4c09aac0680c15f68ca9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_118bf693c6174ae4b7e209fb1221a5ad` → 현재 → `sc_8f8c685485c6437184cf778ab3ac510b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 배경을 어둡게 한 중앙 모달. 설명 아래 Template Name, Project 세로 선택 입력, 하단 큰 생성 버튼.
- 입력 항목·필수 표시·기본값: 두 선택 모두 Select…; 필수 별표는 없음.
- 버튼·메뉴·안내 문구: Select Task Template, Task Templates 링크, Create New Tasks, 닫기X.
- 확인된 상태: 초기 선택 전. 버튼은 초록색으로 보인다.
- 단계 간 변화: 템플릿·프로젝트 선택 모달.

#### 동작과 데이터

- 화면 관찰: 어떤 템플릿을 어느 프로젝트에 적용할지 묻는 두 축.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 제출·템플릿 목록·프로젝트 권한 필터.

#### 모델링 영향

- 후보와 근거: 적용 대상 template_id·project_id 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 템플릿만 선택한 상태

- Screen ID: `sc_8f8c685485c6437184cf778ab3ac510b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8f8c685485c6437184cf778ab3ac510b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5a2e2a25-e824-4f39-848c-db5702768ac8.png)
- 로컬 이미지: [04_sc_8f8c685485c6437184cf778ab3ac510b.png](<screens/04_sc_8f8c685485c6437184cf778ab3ac510b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0b8ddeccb45b4c09aac0680c15f68ca9` → 현재 → `sc_de382cd5fbb94d6ca3ebcf1647b1919a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 앞 모달과 같은 구조.
- 입력 항목·필수 표시·기본값: Template Name=Default Task; Project 미선택.
- 버튼·메뉴·안내 문구: Create New Tasks 버튼이 연한 초록색.
- 확인된 상태: 프로젝트 선택 전 중간 상태.
- 단계 간 변화: Default Task 템플릿 선택.

#### 동작과 데이터

- 화면 관찰: 선택한 템플릿명이 표시됨. 버튼 색 차이의 원인은 시각적으로만 관찰.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 disabled 여부·필수 검증 발생 시점.

#### 모델링 영향

- 후보와 근거: 의존 선택 입력과 생성 가능 UI 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 대상 프로젝트 선택 완료

- Screen ID: `sc_de382cd5fbb94d6ca3ebcf1647b1919a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_de382cd5fbb94d6ca3ebcf1647b1919a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ffaaf6b2-1302-423c-a468-88fa1b5111a4.png)
- 로컬 이미지: [05_sc_de382cd5fbb94d6ca3ebcf1647b1919a.png](<screens/05_sc_de382cd5fbb94d6ca3ebcf1647b1919a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8f8c685485c6437184cf778ab3ac510b` → 현재 → `sc_dcb91b20475d4ba791eedac5320b320b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달.
- 입력 항목·필수 표시·기본값: Default Task / Consulting Project 두 값이 선택됨.
- 버튼·메뉴·안내 문구: Create New Tasks 진한 초록, 닫기X.
- 확인된 상태: 대상 선택 완료 상태.
- 단계 간 변화: Consulting Project 선택, 생성 버튼 진한 초록으로 표시.

#### 동작과 데이터

- 화면 관찰: 두 식별 대상이 모두 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 구성 개수 표시·미리보기·다른 프로젝트 중복 적용.

#### 모델링 영향

- 후보와 근거: 템플릿 적용 명령 입력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 템플릿 기반 작업 생성 성공

- Screen ID: `sc_dcb91b20475d4ba791eedac5320b320b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dcb91b20475d4ba791eedac5320b320b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/76bc794d-1023-4c23-a457-5de086890ae0.png)
- 로컬 이미지: [06_sc_dcb91b20475d4ba791eedac5320b320b.png](<screens/06_sc_dcb91b20475d4ba791eedac5320b320b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_de382cd5fbb94d6ca3ebcf1647b1919a` → 현재 → `sc_3eef549a1670486daf06221156e198bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks 보드 To Do에 새 카드, Done의 기존 카드는 유지. 오른쪽 아래 성공 토스트.
- 입력 항목·필수 표시·기본값: Update company guideline / Consulting Project / No due date. 새 카드 담당자 아바타는 보이지 않음.
- 버튼·메뉴·안내 문구: Tasks created successfully 토스트, New Task, 각 열 생성.
- 확인된 상태: 새 작업1개가 To Do에 나타남.
- 단계 간 변화: 모달 닫힘, To Do 새 카드와 생성 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 원본 템플릿 항목과 제목이 같다. 하위 항목·첨부의 복사는 카드에서 확인되지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 담당자 없음 여부·생성 ID·작업 상태 기본값 규칙.

#### 모델링 영향

- 후보와 근거: 실제 작업 인스턴스 생성, nullable 기한, 템플릿 출처 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 생성 작업에 기한이 표시된 후속 보드

- Screen ID: `sc_3eef549a1670486daf06221156e198bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3eef549a1670486daf06221156e198bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/dc882bc7-dd60-4ea9-8940-61faae4b49ec.png)
- 로컬 이미지: [07_sc_3eef549a1670486daf06221156e198bc.png](<screens/07_sc_3eef549a1670486daf06221156e198bc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_dcb91b20475d4ba791eedac5320b320b` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 보드이고 성공 토스트는 사라짐.
- 입력 항목·필수 표시·기본값: 새 카드 기한이 No due date에서 Feb09로 바뀜. 제목·프로젝트·열은 유지.
- 버튼·메뉴·안내 문구: 일반 New Task·검색·Filters·Board.
- 확인된 상태: 기한 있는 카드 후속 상태.
- 단계 간 변화: 같은 카드에 Feb09 기한 표시. 기한 입력은 이 플로우에 없음.

#### 동작과 데이터

- 화면 관찰: 기한 변경 결과만 캡처됨. 템플릿 자동 적용 또는 사용자 편집 중 무엇인지 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기한 설정 경로·연도·시간대·자동계산 여부.

#### 모델링 영향

- 후보와 근거: 작업의 기한 변경과 적용 당시 초깃값을 별도로 기록할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 템플릿 이름과 프로젝트를 별도로 선택한다. 템플릿을 수정하는 화면과 프로젝트 작업 생성은 다른 액션이다.
- 관찰: 템플릿만 고른 상태의 생성 버튼은 연한 색, 두 선택 후 진한 색. disabled 속성·검증은 직접 확인하지 않았다.
- 관찰: 생성 직후 No due date, 후속 캡처 Feb09. 템플릿이 자동으로 Feb09를 설정했다고 추정하지 않는다.
- 미확인: 반복 적용 시 중복 방지·여러 작업 생성의 원자성·담당자/첨부/하위 작업 복사.

## 6. 공식 도움말과 API 대조

- [Task templates 도움말](https://help.hellobonsai.com/en/articles/11488590-leveraging-task-templates): 템플릿은 여러 작업·하위 작업을 담는 재사용 목록이다. 현행 진입은 New Task의 Manage Templates이며 캡처의 Templates 탭과 다르다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 공개 Templates는 현재 문서 템플릿을 대상으로 명시한다. Task Template 생성·편집 API로 오인하지 않는다.

## 7. 데이터 모델링 시사점

- 템플릿 정의와 프로젝트 작업 인스턴스의 분리 후보. 적용 명령은 템플릿ID·대상 프로젝트ID를 요구하는 UI다.
- 생성 배치ID·원본 템플릿 추적·중복 요청 방지는 후보이며 제품 규칙으로 확정하지 않는다.
- 기한 없는 상태가 관찰되므로 모든 작업에 기한을 강제하는 설계는 근거가 없다.
- FE 후보: 분할 버튼의 도움말, 두 선택 폼과 가능 상태, 성공 토스트, 보드에 새 카드 반영.

## 8. 미확인 사항과 검토 질문

- 템플릿 적용 시 첨부·하위 작업·상태·담당자가 어떻게 복사되는가? 생성 작업 상세에서 원본과 대조한다.
- 두 번 적용하면 두 세트가 생기는가? 반복 적용과 네트워크 재시도는 별도로 검증한다.
- 기한 Feb09가 생긴 누락된 편집 경로를 추가 캡처로 확인한다.
- 기존 Initial Chat가 In Progress에서 Done으로 바뀐 과정은 별도 상태 변경 흐름과 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 7개와 실제 이미지 7개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 7단계 재조회 및 원본 7개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
