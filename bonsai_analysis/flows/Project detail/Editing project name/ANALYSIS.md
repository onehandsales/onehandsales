# Editing project name 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `436bff56-c6be-434a-97e4-1fa7b2526a91` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=436bff56-c6be-434a-97e4-1fa7b2526a91) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트 상세 헤더에서 이름을 직접 편집하고 저장하는 흐름이다.

- 연필 아이콘으로 제목을 입력 모드로 바꾸는 맥락이다. Settings의 Project Title과 같은 업무 정보로 추정하되 내부 저장 호출은 미확인.
- 시작 Design Project with Doe → 종료 Design Project with Doe Studio와 성공 토스트.
- 작업 개수와 활동 이력도 단계1→2에서 달라지므로 이름 편집의 효과로 해석하지 않는다.

- 상위 분석: [Project detail](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Editing project name`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 상세의 빈 개요](<screens/01_sc_adeac0011d87480980cfd58e53e4d751.png>) | 제목이 입력칸으로 바뀌고 Save 버튼 표시. 작업·활동 데이터도 다른 캡처. |
| 02 | [`sc_d747ce9796af4df4ad638f846101a787`](https://gummble.com/screens/sc_d747ce9796af4df4ad638f846101a787?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 제목 인라인 편집](<screens/02_sc_d747ce9796af4df4ad638f846101a787.png>) | 제목 끝에 Studio를 입력. |
| 03 | [`sc_1b1289ac3d2e4d0bb282944177f0a21f`](https://gummble.com/screens/sc_1b1289ac3d2e4d0bb282944177f0a21f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 새 이름 입력](<screens/03_sc_1b1289ac3d2e4d0bb282944177f0a21f.png>) | 입력칸이 제목·연필로 돌아가고 업데이트 성공 토스트. |
| 04 | [`sc_c05fe23fb7df4c13a42b5571729f0b25`](https://gummble.com/screens/sc_c05fe23fb7df4c13a42b5571729f0b25?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 이름 변경 성공](<screens/04_sc_c05fe23fb7df4c13a42b5571729f0b25.png>) | 변경된 이름 표시로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: [01_sc_adeac0011d87480980cfd58e53e4d751.png](<screens/01_sc_adeac0011d87480980cfd58e53e4d751.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d747ce9796af4df4ad638f846101a787`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 제목 인라인 편집

- Screen ID: `sc_d747ce9796af4df4ad638f846101a787`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d747ce9796af4df4ad638f846101a787?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6f0914c1-a511-49a4-83db-e78c8edaaf79.png)
- 로컬 이미지: [02_sc_d747ce9796af4df4ad638f846101a787.png](<screens/02_sc_d747ce9796af4df4ad638f846101a787.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `sc_1b1289ac3d2e4d0bb282944177f0a21f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 헤더의 제목이 가로 입력칸으로 바뀌고 우측에 Save. 아래 Overview 유지.
- 입력 항목·필수 표시·기본값: Design Project with Doe. 별도 필수 별표 없음. 개요 Due Today1Task와 작업 아카이브 활동이 추가되어 있음.
- 버튼·메뉴·안내 문구: Save, 상태 선택, 말줄임, 탭.
- 확인된 상태: 이름 편집 모드지만 아직 기존 값.
- 단계 간 변화: 제목이 입력칸으로 바뀌고 Save 버튼 표시. 작업·활동 데이터도 다른 캡처.

#### 동작과 데이터

- 화면 관찰: 이름 외 업무 데이터 차이는 앞 단계 이후의 별도 작업이 생략된 것으로 취급한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 연필 클릭과 편집 진입·취소 경로.

#### 모델링 영향

- 후보와 근거: 이름 입력 상태와 프로젝트 데이터 읽기 상태를 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 새 이름 입력

- Screen ID: `sc_1b1289ac3d2e4d0bb282944177f0a21f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1b1289ac3d2e4d0bb282944177f0a21f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5d24be5d-f216-46b1-9a56-b76a95770692.png)
- 로컬 이미지: [03_sc_1b1289ac3d2e4d0bb282944177f0a21f.png](<screens/03_sc_1b1289ac3d2e4d0bb282944177f0a21f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d747ce9796af4df4ad638f846101a787` → 현재 → `sc_c05fe23fb7df4c13a42b5571729f0b25`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 인라인 입력과 Save 버튼.
- 입력 항목·필수 표시·기본값: Design Project with Doe Studio.
- 버튼·메뉴·안내 문구: Save.
- 확인된 상태: 새 이름은 폼에만 표시되고 아직 저장 피드백 없음.
- 단계 간 변화: 제목 끝에 Studio를 입력.

#### 동작과 데이터

- 화면 관찰: 기존 제목에 Studio를 추가했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 유효성·최대길이·중복 검사.

#### 모델링 영향

- 후보와 근거: 프로젝트 이름 변경 요청 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 이름 변경 성공

- Screen ID: `sc_c05fe23fb7df4c13a42b5571729f0b25`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c05fe23fb7df4c13a42b5571729f0b25?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fa6f0718-c0b8-410b-8c5d-804c19ec6f84.png)
- 로컬 이미지: [04_sc_c05fe23fb7df4c13a42b5571729f0b25.png](<screens/04_sc_c05fe23fb7df4c13a42b5571729f0b25.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1b1289ac3d2e4d0bb282944177f0a21f` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 입력칸·Save가 사라지고 제목·연필이 복원. 우측 아래 성공 토스트.
- 입력 항목·필수 표시·기본값: 헤더는 Design Project with Doe Studio; 생성 활동 텍스트에는 기존 이름.
- 버튼·메뉴·안내 문구: 성공 토스트 닫기X, 제목 연필.
- 확인된 상태: 변경 결과와 성공 안내.
- 단계 간 변화: 입력칸이 제목·연필로 돌아가고 업데이트 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 헤더 이름 갱신은 관찰됨. 과거 활동은 이전 표기를 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 화면의 캐시·실시간 동기화·이력의 이름정책.

#### 모델링 영향

- 후보와 근거: 이름 변경과 당시 활동 표시명을 구분하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 명시적인 Save 버튼을 사용한다. 현행 문서의 자동 저장을 이 캡처의 동작으로 대체하지 않는다.
- 관찰: 활동 영역의 과거 프로젝트 생성 문구는 기존 이름을 유지한다. 전체 이력의 스냅샷 정책은 미확인.
- 미확인: 빈 이름·중복 이름·취소·동시 편집·긴 제목의 표시.

## 6. 공식 도움말과 API 대조

- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 프로젝트 이름과 편집 중인 로컬 입력값을 분리한다. 제목 변경으로 새 프로젝트가 생긴다는 근거는 없다.
- 과거 이벤트가 당시 표시명을 보존할 가능성. 일반적인 이력 정책은 추가 사례로 검증한다.

## 8. 미확인 사항과 검토 질문

- 제목 수정이 목록·기존 문서·외부 포털에 언제 반영되는가? 변경 전후 화면을 비교한다.
- Save 전 다른 탭으로 이동하거나 Esc를 누르면 취소되는가? 입력 상태 보존 규칙을 확인한다.
- 동일 프로젝트에 두 사용자가 이름을 바꾸는 경우 충돌 정책은 무엇인가? 서버 응답과 이력을 검증한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
