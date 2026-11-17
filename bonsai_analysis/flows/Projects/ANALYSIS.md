# Projects 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d1b4cb1f-9280-49ad-b60d-b10fc8bf713d) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트를 진행 단계별 보드에서 조회하고 가로 스크롤로 전체 단계를 확인하는 흐름이다.

- Dashboard에서 Projects로 이동한다. 처음엔 New Lead에 프로젝트1개가 보인다.
- 보드는 뷰포트보다 넓으며 오른쪽으로 이동하면 In Review까지 보인다.
- 하위 흐름은 생성·태그·드래그 이동·목록 보기다.

- 하위 플로우: [Adding a tag](Adding%20a%20tag/ANALYSIS.md), [Reordering projects](Reordering%20projects/ANALYSIS.md), [Switching to list view](Switching%20to%20list%20view/ANALYSIS.md), [Creating a project (Projects)](Creating%20a%20project%20%28Projects%29/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | Projects의 Board View. |
| 02 | [`sc_da6135eadeff44e49c083b563487ddf5`](https://gummble.com/screens/sc_da6135eadeff44e49c083b563487ddf5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 보드의 초기 목록 | 열 헤더 보조 액션과 가로 스크롤바 노출. |
| 03 | [`sc_6b648373d5194687be9bd43d9852a4ed`](https://gummble.com/screens/sc_6b648373d5194687be9bd43d9852a4ed?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 열 액션과 가로 스크롤바 | 보드가 오른쪽으로 이동하여 뒤쪽 단계를 표시. |
| 04 | [`sc_b9f4747781a74fe98ded34416d1287f3`](https://gummble.com/screens/sc_b9f4747781a74fe98ded34416d1287f3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 보드 우측 단계 조회 | 조회 종료. 오른쪽 열들이 비어 있다고 전체 프로젝트가0개인 것은 아님. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_da6135eadeff44e49c083b563487ddf5`

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

### 단계 02 — 프로젝트 보드의 초기 목록

- Screen ID: `sc_da6135eadeff44e49c083b563487ddf5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_da6135eadeff44e49c083b563487ddf5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/35407a91-9f73-49a8-883b-d320f0b49dd8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_6b648373d5194687be9bd43d9852a4ed`

#### 화면에서 직접 확인한 내용

- 레이아웃: Projects/Board View·List View. Search·Filters·New Project. 상태 열이 가로로 이어짐.
- 입력 항목·필수 표시·기본값: New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent·Contract Signed·In Progress0.
- 버튼·메뉴·안내 문구: 각 열 +New Project, New Project, List View.
- 확인된 상태: 프로젝트1개와 여러 빈 열.
- 단계 간 변화: Projects의 Board View.

#### 동작과 데이터

- 화면 관찰: 보드의 진행 단계와 고객 표시를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 우측의 전체 열·정렬·필터 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트/고객 참조와 단계별 개수 투영.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 열 액션과 가로 스크롤바

- Screen ID: `sc_6b648373d5194687be9bd43d9852a4ed`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6b648373d5194687be9bd43d9852a4ed?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/45413f9a-0b77-4cce-83bc-d791d596d9d2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_da6135eadeff44e49c083b563487ddf5` → 현재 → `sc_b9f4747781a74fe98ded34416d1287f3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 보드. Proposal Sent 헤더 오른쪽+·말줄임. 아래 가로 스크롤바.
- 입력 항목·필수 표시·기본값: 프로젝트·개수 변화 없음.
- 버튼·메뉴·안내 문구: 헤더+·말줄임·가로 스크롤바.
- 확인된 상태: 열 상호작용 상태. 드래그/hover 입력은 캡처되지 않음.
- 단계 간 변화: 열 헤더 보조 액션과 가로 스크롤바 노출.

#### 동작과 데이터

- 화면 관찰: 뷰포트 밖 열을 위한 수평 이동 UI가 직접 보임.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 스크롤바 자동숨김·열 메뉴·키보드 이동.

#### 모델링 영향

- 후보와 근거: 보드 스크롤과 열별 액션 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 보드 우측 단계 조회

- Screen ID: `sc_b9f4747781a74fe98ded34416d1287f3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b9f4747781a74fe98ded34416d1287f3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8547c4dd-2269-42c3-9b44-468c1b810659.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6b648373d5194687be9bd43d9852a4ed` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 보드가 오른쪽으로 이동하여 Contract Signed/In Progress/In Review가 보임. 상단/사이드바 유지.
- 입력 항목·필수 표시·기본값: 세 열 모두0. 기존 New Lead 카드는 왼쪽 뷰포트 밖.
- 버튼·메뉴·안내 문구: 각 열 New Project, 공통 검색/필터.
- 확인된 상태: 오른쪽 열의 빈 상태.
- 단계 간 변화: 보드가 오른쪽으로 이동하여 뒤쪽 단계를 표시.

#### 동작과 데이터

- 화면 관찰: 기존 카드가 삭제된 증거가 아니라 스크롤로 안 보이는 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 더 오른쪽 열 존재·스크롤 경계.

#### 모델링 영향

- 후보와 근거: 조회 뷰포트와 실제 데이터 목록 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 한 열이 비어도 열 이름·개수·New Project 진입점은 유지된다.
- 관찰: 가로 스크롤은 보드 영역에 있고 왼쪽 내비게이션·상단 도구가 유지된다.
- 미확인: 열 개수·이름·순서는 계정별 설정 가능성을 남긴다.

## 6. 공식 도움말과 API 대조

- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.
- [Board Groups API](https://docs.hellobonsai.com/api/tag/board-groups): GET `/public-api/v1/board_groups`는 거래·프로젝트 단계의 이름을 쓰기 요청에 쓰는 ID로 연결한다. 보드 레이아웃의 저장 범위나 정렬 규칙은 이 페이지로 알 수 없다.

## 7. 데이터 모델링 시사점

- 프로젝트와 보드 단계 참조·정렬 후보. 화면의 빈 열은 데이터0개 상태이지 열 삭제가 아니다.
- FE 후보: 가로 스크롤 보드, 상태 개수, 열 액션 노출, 공통 검색/필터·뷰 탭.

## 8. 미확인 사항과 검토 질문

- 가로 스크롤 위치와 선택 뷰가 사용자별로 저장되는가? 페이지 재진입으로 확인한다.
- 보드의 열 추가·이름변경·삭제는 어떤 권한·이동 정책을 갖는가? 헤더 메뉴를 추가 검토한다.
- 검색/필터가 각 열 개수에 어떤 영향을 주는가? 필터 적용 전후를 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
