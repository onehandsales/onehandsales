# Editing project settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=bca79d2d-7b8e-4f84-b35d-18adaec2cd06) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트 설정에서 종료일을 지정하고 명시적인 저장 후 개요로 돌아가는 흐름이다.

- 시작 설정 상단, 본문 아래로 이동하여 Save Changes까지 확인한다.
- 이름은 첫 캡처 Design Project with Doe에서 후속 Studio 포함 이름으로 달라져 있다. 별도 이름 변경 흐름과 교차한다.
- 종료 Overview의 성공 토스트. 종료일 값 자체는 종료 화면에 보이지 않으므로 재진입 검증이 남는다.

- 상위 분석: [Project detail](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Editing project settings`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b07eafa421cb44f3aa1081d935d5d1a3`](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 설정 상단](<screens/01_sc_b07eafa421cb44f3aa1081d935d5d1a3.png>) | 설정 하단으로 스크롤해 Save Changes를 확인. 제목도 달라져 있으나 편집 장면 생략. |
| 02 | [`sc_7db8a8c40f884b6190e313b59982d139`](https://gummble.com/screens/sc_7db8a8c40f884b6190e313b59982d139?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 설정의 저장 영역](<screens/02_sc_7db8a8c40f884b6190e313b59982d139.png>) | End Date를 Feb21 2024로 선택한 상태. |
| 03 | [`sc_1c16855a408d4a3b882a3437563ec0cd`](https://gummble.com/screens/sc_1c16855a408d4a3b882a3437563ec0cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 종료일 입력](<screens/03_sc_1c16855a408d4a3b882a3437563ec0cd.png>) | Overview로 전환되고 프로젝트 업데이트 성공 토스트. |
| 04 | [`sc_64dc2598400849a39fef6452cbd49a62`](https://gummble.com/screens/sc_64dc2598400849a39fef6452cbd49a62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 설정 저장 결과](<screens/04_sc_64dc2598400849a39fef6452cbd49a62.png>) | 기록 종료. 날짜 저장값 재조회는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 설정 상단

- Screen ID: `sc_b07eafa421cb44f3aa1081d935d5d1a3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aef33650-ce6e-4eac-8ab6-28653117873e.png)
- 로컬 이미지: [01_sc_b07eafa421cb44f3aa1081d935d5d1a3.png](<screens/01_sc_b07eafa421cb44f3aa1081d935d5d1a3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7db8a8c40f884b6190e313b59982d139`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 왼쪽 설정 폼, 오른쪽 Reminder Settings.
- 입력 항목·필수 표시·기본값: Project Title=Design Project with Doe; Payment Type=Hourly Rate, US$20.00/USD. Description회색예시·Optional/Markdown. StartFeb6 2024, End미선택. 자동리마인더체크.
- 버튼·메뉴·안내 문구: 결제유형·통화선택, 날짜입력, 자동리마인더. 저장버튼은 아래 뷰포트 밖.
- 확인된 상태: 기한일 없는 설정, 설명 선택항목.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 리마인더는 미지급 인보이스·만료될 제안서·서명대기 계약 관련 안내를 포함한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지.

#### 모델링 영향

- 후보와 근거: 프로젝트 청구설정·공개설명·업무기간·문서알림설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 설정의 저장 영역

- Screen ID: `sc_7db8a8c40f884b6190e313b59982d139`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7db8a8c40f884b6190e313b59982d139?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/200c3c11-941a-4a30-95de-4a15c0689f13.png)
- 로컬 이미지: [02_sc_7db8a8c40f884b6190e313b59982d139.png](<screens/02_sc_7db8a8c40f884b6190e313b59982d139.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b07eafa421cb44f3aa1081d935d5d1a3` → 현재 → `sc_1c16855a408d4a3b882a3437563ec0cd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 아래로 스크롤하여 탭이 화면 상단에 위치. 왼쪽 폼 하단 Save Changes, 오른쪽 리마인더가 모두 보인다.
- 입력 항목·필수 표시·기본값: Title=Design Project with Doe Studio, Hourly Rate=US$20.00/USD, Description 빈 예시, StartFeb6 2024, End Select Date. 알림체크 유지.
- 버튼·메뉴·안내 문구: Save Changes, 결제유형/통화 선택, 날짜 입력.
- 확인된 상태: 아직 종료일 없는 상태. 첫 캡처와 제목은 달라짐.
- 단계 간 변화: 설정 하단으로 스크롤해 Save Changes를 확인. 제목도 달라져 있으나 편집 장면 생략.

#### 동작과 데이터

- 화면 관찰: 설정은 버튼으로 저장하는 UI임을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제목 변경의 누락 과정·항목별 자동 저장 병행 여부.

#### 모델링 영향

- 후보와 근거: 설정 초안과 명시적 저장 경계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 종료일 입력

- Screen ID: `sc_1c16855a408d4a3b882a3437563ec0cd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1c16855a408d4a3b882a3437563ec0cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9e0cf865-a0a6-4b47-954d-2e00d1d62420.png)
- 로컬 이미지: [03_sc_1c16855a408d4a3b882a3437563ec0cd.png](<screens/03_sc_1c16855a408d4a3b882a3437563ec0cd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7db8a8c40f884b6190e313b59982d139` → 현재 → `sc_64dc2598400849a39fef6452cbd49a62`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 설정 폼.
- 입력 항목·필수 표시·기본값: End Date=Feb21 2024; StartFeb6 2024와 나머지 값 유지.
- 버튼·메뉴·안내 문구: 종료일 지우기X, Save Changes.
- 확인된 상태: 종료일이 선택됐지만 아직 성공 피드백 없음.
- 단계 간 변화: End Date를 Feb21 2024로 선택한 상태.

#### 동작과 데이터

- 화면 관찰: 날짜가 비어 있는 상태에서 선택된 상태로 바뀐다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 선택기 내부·기간 검증·키보드 입력.

#### 모델링 영향

- 후보와 근거: 선택적 종료 업무일자와 입력 검증 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 설정 저장 결과

- Screen ID: `sc_64dc2598400849a39fef6452cbd49a62`
- 원본: [화면 페이지](https://gummble.com/screens/sc_64dc2598400849a39fef6452cbd49a62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8a8f7c44-1ccb-4849-8981-c6a10fa2f6a6.png)
- 로컬 이미지: [04_sc_64dc2598400849a39fef6452cbd49a62.png](<screens/04_sc_64dc2598400849a39fef6452cbd49a62.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1c16855a408d4a3b882a3437563ec0cd` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Overview로 돌아오고 오른쪽 아래 업데이트 성공 토스트. 작업요약과 활동 이력 표시.
- 입력 항목·필수 표시·기본값: 완료 작업1개, 나머지0. 활동에 Initial Chat 완료기록2개와 아카이브·프로젝트생성.
- 버튼·메뉴·안내 문구: 성공 토스트 닫기, Overview 각 영역+.
- 확인된 상태: 프로젝트 업데이트 성공. 저장한 종료일 자체는 현재 뷰에 없음.
- 단계 간 변화: Overview로 전환되고 프로젝트 업데이트 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 활동 이력 차이를 종료일 변경의 자동 결과로 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 종료일 영속값·완료 이력 중복의 원인.

#### 모델링 영향

- 후보와 근거: 설정 저장 결과와 업무 활동 조회를 분리하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 종료일이 비어 있다가 Feb21 2024로 입력되고 지우기X가 나타난다.
- 관찰: 저장 버튼이 있다. 현재 공식 도움말의 자동 저장과 버전 차이로 기록한다.
- 관찰: Description은 선택 항목·외부 가시성·Markdown 지원을 명시한다. 회색 예시 글을 실제 저장 내용으로 기록하지 않는다.
- 관찰: 자동 리마인더 체크가 유지된다. 이 플로우에서는 변경하거나 발송하지 않았다.
- 미확인: End Date 변경과 Overview의 완료 작업1개가 같은 시점에 보이지만 자동 완료의 인과관계는 없다.

## 6. 공식 도움말과 API 대조

- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 프로젝트 시작/종료 업무일자와 nullable 종료일 후보. 시간대가 있는 timestamp인지 날짜 타입인지는 API 계약을 확인한다.
- 청구 방식·요율·통화·설명·자동 알림은 별도 설정 개념이다. 한 저장 요청에 포함되는지는 캡처만으로 알 수 없다.
- FE 후보: 스크롤 가능한 설정 폼·날짜 지우기·저장 결과 토스트·개요 이동.

## 8. 미확인 사항과 검토 질문

- 종료일이 시작일보다 빠르면 어떻게 검증하는가? 빈값·동일일·역전일을 재현한다.
- Save Changes가 리마인더 체크까지 함께 저장하는가? 개별 변경 후 재진입으로 확인한다.
- 종료일 저장이 프로젝트/작업/문서 상태에 영향을 주는가? 자동화 없는 계정에서 별도 검증한다.
- 설정 변경 후 요율이 과거 시간기록·인보이스에 소급 적용되는가? 청구 여부를 나눠 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
