# Tasks 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `59d5186e-98e3-495f-b8c0-96eb9c943631` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=59d5186e-98e3-495f-b8c0-96eb9c943631) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

전체 작업을 상태별 보드로 보고 재사용 작업 템플릿 관리 진입을 확인하는 흐름이다.

- 로그인 사용자의 Tasks 메뉴 진입. 보드에 Initial Chat 한 개가 보인다.
- Templates 탭에서는 빈 상태 안내 후 New Template 진입점을 제공한다.
- 하위 세 흐름은 템플릿 정의 생성, 내용 편집, 프로젝트 적용으로 역할이 나뉜다.

- 하위 플로우: [Creating a task template](Creating%20a%20task%20template/ANALYSIS.md), [Editing a template task](Editing%20a%20template%20task/ANALYSIS.md), [Adding a task (template)](Adding%20a%20task%20%28template%29/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | Tasks 메뉴의 보드로 진입. |
| 02 | [`sc_fd79ede42b9843aca369d4e929c4272c`](https://gummble.com/screens/sc_fd79ede42b9843aca369d4e929c4272c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 전체 작업 보드 | Templates 탭의 빈 상태로 전환. |
| 03 | [`sc_6ec51256385940f2bd7d36a76874d691`](https://gummble.com/screens/sc_6ec51256385940f2bd7d36a76874d691?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 템플릿 빈 상태 | New Template 이후 흐름은 Creating a task template에서 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_fd79ede42b9843aca369d4e929c4272c`

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

### 단계 02 — 전체 작업 보드

- Screen ID: `sc_fd79ede42b9843aca369d4e929c4272c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fd79ede42b9843aca369d4e929c4272c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3a706ecc-e895-40a1-bbde-da73a675c4cf.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_6ec51256385940f2bd7d36a76874d691`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks/ Templates 탭 아래 검색·Filters·Board와 우측 New Task 분할 버튼. 세 상태 열을 가로 배치.
- 입력 항목·필수 표시·기본값: 검색 placeholder Find a task. In Progress에 Initial Chat / Design Project with Doe Studio / Yesterday / JD 카드 한 개.
- 버튼·메뉴·안내 문구: 각 열 +New Task, 상단 New Task 옆 목록+ 아이콘.
- 확인된 상태: To Do와 Done은 비어 있고 진행 열만 데이터가 있다.
- 단계 간 변화: Tasks 메뉴의 보드로 진입.

#### 동작과 데이터

- 화면 관찰: 상태별 카드 배치와 담당자·기한 표시. 빈 열에도 생성 진입점이 남는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 보드 드래그·새 작업 기본 상태·필터/뷰 선택지.

#### 모델링 영향

- 후보와 근거: 작업 상태·제목·프로젝트·담당자·기한과 상태별 정렬 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 템플릿 빈 상태

- Screen ID: `sc_6ec51256385940f2bd7d36a76874d691`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6ec51256385940f2bd7d36a76874d691?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/42fe693c-2c8d-48b2-a0b5-5eeb79e1115c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_fd79ede42b9843aca369d4e929c4272c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Templates 탭 선택. 큰 소개 카드 왼쪽은 예시 그림, 오른쪽은 설명과 New Template.
- 입력 항목·필수 표시·기본값: 실제 입력 폼은 없다. 그림의 Research/Wireframes 등은 소개용 콘텐츠.
- 버튼·메뉴·안내 문구: Prefill Tasks With Templates, New Template, Contact Support.
- 확인된 상태: 관리할 템플릿 목록 대신 초기 안내를 보여준다.
- 단계 간 변화: Templates 탭의 빈 상태로 전환.

#### 동작과 데이터

- 화면 관찰: 템플릿 기능의 재사용 목적을 설명한다. 그림을 실제 저장 데이터로 읽지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 보유 여부·사용 권한·빈 목록의 정확한 조건.

#### 모델링 영향

- 후보와 근거: 템플릿 정의와 빈 상태 플래그/조회 결과, 도움말 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: To Do/In Progress/Done 세 열을 표시하지만 이 세 값을 고정 enum으로 확정하지 않는다.
- 관찰: 진행 중 카드의 Yesterday는 빨간색 날짜 표현이다. 완료/지연 판정 규칙은 별도다.
- 관찰: 템플릿이 없는 상태에서 소개 이미지와 New Template 버튼이 보인다. 소개 이미지 속 예시 작업은 실제 계정 레코드가 아니다.

## 6. 공식 도움말과 API 대조

- [Task templates 도움말](https://help.hellobonsai.com/en/articles/11488590-leveraging-task-templates): 템플릿은 여러 작업·하위 작업을 담는 재사용 목록이다. 현행 진입은 New Task의 Manage Templates이며 캡처의 Templates 탭과 다르다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 공개 Templates는 현재 문서 템플릿을 대상으로 명시한다. Task Template 생성·편집 API로 오인하지 않는다.

## 7. 데이터 모델링 시사점

- 상태 정의·작업·프로젝트·담당자·기한과 상태별 보드 투영 후보.
- 실제 작업과 템플릿 정의를 구분하고 적용 때 생성되는 관계를 후속 흐름에서 검증한다.
- 카드 상태·검색/필터/뷰 선택과 템플릿 빈 상태를 FE 구성요소로 분리한다.

## 8. 미확인 사항과 검토 질문

- 보드 드래그·키보드 이동·순서 저장은 어떻게 동작하는가? 상태 이동의 실제 계정 재현이 필요하다.
- 과거 기한의 완료 작업도 빨간 날짜를 표시하는가? 상태·날짜 조합을 확인한다.
- 권한에 따라 전체 작업과 개인 작업의 범위가 어떻게 다른가? 역할별 계정으로 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
