# Editing a subtask 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `eb7720d8-fb1d-405b-8058-3f1c21adf475` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=eb7720d8-fb1d-405b-8058-3f1c21adf475) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

하위 작업을 완료 처리하고 프로젝트 팀 멤버를 개별 담당자로 지정하는 흐름이다.

- 부모 작업의 Subtasks 목록에서 시작하며 제목 변경 장면은 없다. flow 이름 Editing은 완료·할당 편집을 포함하는 의미로 기록한다.
- 완료된 Send invite에 Joe Doe를 지정하고 나머지 Prepare a deck은 미완료로 유지한다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Adding a task/Editing a subtask`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_cc86bdd7d2b14979983e89b4b1658a11`](https://gummble.com/screens/sc_cc86bdd7d2b14979983e89b4b1658a11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [두 하위 작업 목록](<screens/01_sc_cc86bdd7d2b14979983e89b4b1658a11.png>) | 첫 하위 항목의 인라인/행 액션을 표시. |
| 02 | [`sc_7b58c2e6afe84ff084746d9b26e8a2c7`](https://gummble.com/screens/sc_7b58c2e6afe84ff084746d9b26e8a2c7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 항목 편집 강조](<screens/02_sc_7b58c2e6afe84ff084746d9b26e8a2c7.png>) | Send invite 체크가 초록 완료 표시로 바뀜. |
| 03 | [`sc_7d38c07db33f49d9b4f4160588f26d70`](https://gummble.com/screens/sc_7d38c07db33f49d9b4f4160588f26d70?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 항목 완료](<screens/03_sc_7d38c07db33f49d9b4f4160588f26d70.png>) | 완료된 항목의 담당자 선택 메뉴를 열음. |
| 04 | [`sc_f6fd9820dad74a1e8c7e75641dc547e4`](https://gummble.com/screens/sc_f6fd9820dad74a1e8c7e75641dc547e4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [완료 항목의 담당자 선택](<screens/04_sc_f6fd9820dad74a1e8c7e75641dc547e4.png>) | Joe Doe 선택 결과가 JD 아바타로 표시. |
| 05 | [`sc_9487f272ece1435da2a8d001d43f9685`](https://gummble.com/screens/sc_9487f272ece1435da2a8d001d43f9685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [완료 항목 담당자 반영](<screens/05_sc_9487f272ece1435da2a8d001d43f9685.png>) | 완료·담당자 변경 결과로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 두 하위 작업 목록

- Screen ID: `sc_cc86bdd7d2b14979983e89b4b1658a11`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc86bdd7d2b14979983e89b4b1658a11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7a72c235-51ea-4490-bba0-3de260401819.png)
- 로컬 이미지: [01_sc_cc86bdd7d2b14979983e89b4b1658a11.png](<screens/01_sc_cc86bdd7d2b14979983e89b4b1658a11.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7b58c2e6afe84ff084746d9b26e8a2c7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Send invite, Prepare a deck 두 행 모두 체크 해제.
- 버튼·메뉴·안내 문구: +Add Subtask, 하위 항목 체크박스, 댓글 입력/Add Comment. Files의 Add File 위 붉은 가로선은 의미 미확인.
- 확인된 상태: 두 항목이 일반 목록으로 표시된다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 항목별 별도 체크박스 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 부모 완료와 자식 상태 연동·다중선택.

#### 모델링 영향

- 후보와 근거: 독립 자식 완료 상태와 부모 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 하위 항목 편집 강조

- Screen ID: `sc_7b58c2e6afe84ff084746d9b26e8a2c7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7b58c2e6afe84ff084746d9b26e8a2c7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00dde82d-8b23-4712-9aa3-f52a8101a617.png)
- 로컬 이미지: [02_sc_7b58c2e6afe84ff084746d9b26e8a2c7.png](<screens/02_sc_7b58c2e6afe84ff084746d9b26e8a2c7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cc86bdd7d2b14979983e89b4b1658a11` → 현재 → `sc_7d38c07db33f49d9b4f4160588f26d70`

#### 화면에서 직접 확인한 내용

- 레이아웃: 작업 패널의 첫 Subtasks 행을 강조하고 제목 영역에 연한 입력 배경. 오른쪽 담당자·휴지통.
- 입력 항목·필수 표시·기본값: Send invite와 Prepare a deck 미완료. 제목 변경값 없음.
- 버튼·메뉴·안내 문구: 체크박스, 담당자 추가, 삭제, +Add Subtask.
- 확인된 상태: 첫 행 편집/포커스 상태로 보임.
- 단계 간 변화: 첫 하위 항목의 인라인/행 액션을 표시.

#### 동작과 데이터

- 화면 관찰: 텍스트 수정 결과는 수록되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력 확정 시점·hover/포커스 구분.

#### 모델링 영향

- 후보와 근거: 하위 제목 편집 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 하위 항목 완료

- Screen ID: `sc_7d38c07db33f49d9b4f4160588f26d70`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7d38c07db33f49d9b4f4160588f26d70?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/58ae0685-523e-403d-9041-4c3db36ba1e8.png)
- 로컬 이미지: [03_sc_7d38c07db33f49d9b4f4160588f26d70.png](<screens/03_sc_7d38c07db33f49d9b4f4160588f26d70.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7b58c2e6afe84ff084746d9b26e8a2c7` → 현재 → `sc_f6fd9820dad74a1e8c7e75641dc547e4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첫 행 체크가 초록색 체크표시, 제목이 회색. 둘째 항목은 그대로.
- 입력 항목·필수 표시·기본값: Send invite 완료, Prepare a deck 미완료.
- 버튼·메뉴·안내 문구: 담당자 추가·휴지통이 완료 행에도 보임.
- 확인된 상태: 완료와 미완료 혼합 목록.
- 단계 간 변화: Send invite 체크가 초록 완료 표시로 바뀜.

#### 동작과 데이터

- 화면 관찰: 개별 자식 완료 변화가 직접 관찰된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 완료시각·알림·부모 영향.

#### 모델링 영향

- 후보와 근거: 자식 완료 속성과 완료 이벤트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 완료 항목의 담당자 선택

- Screen ID: `sc_f6fd9820dad74a1e8c7e75641dc547e4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f6fd9820dad74a1e8c7e75641dc547e4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/29776d9b-9a82-495d-a48e-74850fd87afc.png)
- 로컬 이미지: [04_sc_f6fd9820dad74a1e8c7e75641dc547e4.png](<screens/04_sc_f6fd9820dad74a1e8c7e75641dc547e4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7d38c07db33f49d9b4f4160588f26d70` → 현재 → `sc_9487f272ece1435da2a8d001d43f9685`

#### 화면에서 직접 확인한 내용

- 레이아웃: 완료 행 오른쪽에 작은 드롭다운.
- 입력 항목·필수 표시·기본값: PROJECT TEAM의 Joe Doe 한 항목. Select… 선택 입력.
- 버튼·메뉴·안내 문구: Joe Doe 선택, 휴지통.
- 확인된 상태: 완료 항목에서 할당 선택 메뉴 열림.
- 단계 간 변화: 완료된 항목의 담당자 선택 메뉴를 열음.

#### 동작과 데이터

- 화면 관찰: 완료 후 담당자 편집이 가능한 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 프로젝트 외 멤버·복수선택·할당 해제.

#### 모델링 영향

- 후보와 근거: 자식의 독립 담당자 참조 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 완료 항목 담당자 반영

- Screen ID: `sc_9487f272ece1435da2a8d001d43f9685`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9487f272ece1435da2a8d001d43f9685?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2c897d92-4569-44a8-8194-9bbbc60dd6ba.png)
- 로컬 이미지: [05_sc_9487f272ece1435da2a8d001d43f9685.png](<screens/05_sc_9487f272ece1435da2a8d001d43f9685.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f6fd9820dad74a1e8c7e75641dc547e4` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 선택 메뉴가 닫히고 Send invite 오른쪽 JD 아바타.
- 입력 항목·필수 표시·기본값: 첫 항목 완료/JD, 둘째 항목 미완료/아바타 없음.
- 버튼·메뉴·안내 문구: +Add Subtask, 각 항목 체크박스.
- 확인된 상태: 담당자 결과 표시.
- 단계 간 변화: Joe Doe 선택 결과가 JD 아바타로 표시.

#### 동작과 데이터

- 화면 관찰: Joe Doe 선택과 JD 아바타를 단계 사이에서 연결할 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 후 유지·별도 할당 이력.

#### 모델링 영향

- 후보와 근거: 하위 항목 담당자 표시와 완료 상태 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 완료된 항목에도 담당자 지정 액션이 가능하다.
- 관찰: 해당 항목 이름은 그대로며 완료 시 회색으로 표시된다.
- 미확인: 완료·할당 알림, 되돌리기, 부모 완료 상태와의 연동.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 하위 항목 체크박스로 완료 처리하는 동작과 대조했다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 하위 작업의 완료와 담당자는 별도 속성 후보. 완료 후 담당자 변경을 일괄 금지할 근거는 없다.
- 부모/자식 상태와 할당의 이력 후보. 서버 관계 수는 개별 선택 화면만으로 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 완료된 하위 작업 담당자 변경 시 알림이 발생하는가? 수신자 계정으로 확인한다.
- 체크 해제하면 완료시각/완료자 이력이 어떻게 보존되는가? API·활동 기록을 대조한다.
- 제목 인라인 편집의 저장/취소는 어떻게 동작하는가? 이 흐름에는 텍스트 변경이 없으므로 별도 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
