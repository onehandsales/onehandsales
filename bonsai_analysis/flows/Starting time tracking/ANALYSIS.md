# Starting time tracking 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `06d57391-c7a4-4f63-ba8d-078ea3af046f` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=06d57391-c7a4-4f63-ba8d-078ea3af046f) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

사용자가 대시보드 상단에서 타이머를 시작하고 프로젝트·요율·설명을 지정한 뒤 일시정지하고 하나의 시간 기록을 완료하는 흐름이다.

- 시작: 대시보드와 상단 Track Time. 종료: 1분 16초 기록이 고객·프로젝트·설명과 함께 표시되고 새 타이머는 0초로 돌아간다.
- 주체는 로그인 사용자로 보이지만 역할·계정 요금제는 확정할 수 없다.
- Time Tracking 목록, 프로젝트 Time, 작업의 시간 기록, 인보이스의 미청구 시간 추가와 연결한다.
- FE 재현은 빈 팝오버·실행·프로젝트 선택·도움말·닫힌 실행·일시정지·완료 요약 상태를 나눠 구성한다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | 상단 타이머 팝오버로 진입. 배경 날짜·프로젝트 데이터도 달라 연속 클릭만으로 설명하지 않는다. |
| 02 | [`sc_d14a6a9529f74ffb8a33a354bdeb4dcd`](https://gummble.com/screens/sc_d14a6a9529f74ffb8a33a354bdeb4dcd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 타이머와 빈 기록 | 타이머 실행 상태와 상세 폼이 표시된다. |
| 03 | [`sc_07f63320ecef4bc58675ab0c98a8f5bc`](https://gummble.com/screens/sc_07f63320ecef4bc58675ab0c98a8f5bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 타이머 실행 및 상세 입력 | Project 드롭다운을 펼친 상태. |
| 04 | [`sc_68c1a17be48b48d6a0077b358ac93dc1`](https://gummble.com/screens/sc_68c1a17be48b48d6a0077b358ac93dc1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 선택 목록 | Design Project를 선택한 상태와 Changes Saved 피드백. |
| 05 | [`sc_be37de9dc1fd45b1ba7b3694ef5ff525`](https://gummble.com/screens/sc_be37de9dc1fd45b1ba7b3694ef5ff525?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 선택과 요율 반영 | Rate 도움말 툴팁을 표시. |
| 06 | [`sc_b4e674c5933f49e79cf84897c07b9c85`](https://gummble.com/screens/sc_b4e674c5933f49e79cf84897c07b9c85?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 요율 도움말 | 메모 입력 상태. |
| 07 | [`sc_b7e81d357767425a98ea8965ce65b3fe`](https://gummble.com/screens/sc_b7e81d357767425a98ea8965ce65b3fe?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 진행 중 메모 입력 | 팝오버가 닫혀도 상단 타이머는 실행 중. |
| 08 | [`sc_f542370cb63848f5bb8326b2872dc8d8`](https://gummble.com/screens/sc_f542370cb63848f5bb8326b2872dc8d8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 팝오버를 닫은 실행 상태 | 1분16초에서 일시정지된 상세 폼. |
| 09 | [`sc_6078e139a0cc42bcac29cfb3a4921052`](https://gummble.com/screens/sc_6078e139a0cc42bcac29cfb3a4921052?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 일시정지와 완료 액션 | 완료 기록 요약과 새 타이머 표시. Done 실행으로 추정되나 클릭 이벤트는 캡처되지 않음. |
| 10 | [`sc_cfa8d3d6c80049a58bef6c5eeaf05197`](https://gummble.com/screens/sc_cfa8d3d6c80049a58bef6c5eeaf05197?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 완료된 시간 기록 요약 | 이 플로우 종료. 목록·인보이스 반영은 별도 흐름에서 확인. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d14a6a9529f74ffb8a33a354bdeb4dcd`

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

### 단계 02 — 새 타이머와 빈 기록

- Screen ID: `sc_d14a6a9529f74ffb8a33a354bdeb4dcd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d14a6a9529f74ffb8a33a354bdeb4dcd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b2e9c792-8c60-4c19-a9e4-1d2b72819c11.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_07f63320ecef4bc58675ab0c98a8f5bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 타이머 팝오버에 Start New Timer, 00:00:00과 초록 재생 버튼. 아래는 빈 기록 안내.
- 입력 항목·필수 표시·기본값: 폼은 아직 없고 시간은 0이다.
- 버튼·메뉴·안내 문구: 재생 버튼, No unbilled hours have been added yet.
- 확인된 상태: 아직 타이머 시작 전의 빈 목록.
- 단계 간 변화: 상단 타이머 팝오버로 진입. 배경 날짜·프로젝트 데이터도 달라 연속 클릭만으로 설명하지 않는다.

#### 동작과 데이터

- 화면 관찰: 시작 전 미청구 시간 요약이 비어 있다. 배경은 Feb 7과 두 프로젝트로 첫 화면의 날짜·프로젝트 수와 다르다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조회 기간·내 시간/팀 시간 범위와 배경 데이터 변경 이유.

#### 모델링 영향

- 후보와 근거: 실행 중 타이머 상태와 미청구 시간 목록을 별개로 표시하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 타이머 실행 및 상세 입력

- Screen ID: `sc_07f63320ecef4bc58675ab0c98a8f5bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_07f63320ecef4bc58675ab0c98a8f5bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5af08066-dc9e-4efb-8341-effdd83a5381.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d14a6a9529f74ffb8a33a354bdeb4dcd` → 현재 → `sc_68c1a17be48b48d6a0077b358ac93dc1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. Project·Task는 비어 있고 Rate의 회색 50.00은 실제 값인지 placeholder인지 미확인.
- 버튼·메뉴·안내 문구: Active Timer, 00:00:02, 빨간 일시정지·휴지통 버튼.
- 확인된 상태: 타이머 실행 중이고 상단 바에도 경과 시간 표시.
- 단계 간 변화: 타이머 실행 상태와 상세 폼이 표시된다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 선택 전에 시간이 흐르는 캡처다. 저장 버튼은 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 프로젝트 없이 완료할 수 있는지, 최초 레코드 생성 시점, 삭제 확인 과정.

#### 모델링 영향

- 후보와 근거: 타이머 실행 상태, 경과 시간, 프로젝트·작업 연결, 업무일자, 요율, 메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 선택 목록

- Screen ID: `sc_68c1a17be48b48d6a0077b358ac93dc1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_68c1a17be48b48d6a0077b358ac93dc1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/24578c9c-97d3-422a-b634-9c1042f50b5c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_07f63320ecef4bc58675ab0c98a8f5bc` → 현재 → `sc_be37de9dc1fd45b1ba7b3694ef5ff525`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. Project 드롭다운이 펼쳐진 상태.
- 버튼·메뉴·안내 문구: Consulting Project / Sample Client, Design Project with Doe Studio / Doe Company. 타이머 00:00:03.
- 확인된 상태: 프로젝트 이름 아래 고객 이름을 보조 정보로 표시.
- 단계 간 변화: Project 드롭다운을 펼친 상태.

#### 동작과 데이터

- 화면 관찰: 고객별 문맥을 갖춘 프로젝트 선택지 두 개가 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 권한별 노출·완료 프로젝트 포함·검색 기능.

#### 모델링 영향

- 후보와 근거: 프로젝트 선택용 고객명 투영; 표시만으로 중복 고객 관계를 만들지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 프로젝트 선택과 요율 반영

- Screen ID: `sc_be37de9dc1fd45b1ba7b3694ef5ff525`
- 원본: [화면 페이지](https://gummble.com/screens/sc_be37de9dc1fd45b1ba7b3694ef5ff525?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f6e1d76d-3249-4e8f-8b08-d578d3fffc38.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_68c1a17be48b48d6a0077b358ac93dc1` → 현재 → `sc_b4e674c5933f49e79cf84897c07b9c85`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. Project=Design Project with Doe Studio, Rate=20, Task·메모는 비어 있다.
- 버튼·메뉴·안내 문구: Changes Saved 표시, Task 드롭다운, 타이머 00:00:05.
- 확인된 상태: 선택한 프로젝트가 상단 타이머 아래에도 축약 표시.
- 단계 간 변화: Design Project를 선택한 상태와 Changes Saved 피드백.

#### 동작과 데이터

- 화면 관찰: 프로젝트 선택 뒤 저장 확인 메시지와 Rate 20이 나타난다. 이 화면에서 선택값 저장의 피드백은 관찰됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 20이 프로젝트 기본값인지 사용자 설정인지, 자동 저장 요청·실패·debounce 동작.

#### 모델링 영향

- 후보와 근거: 프로젝트의 시간 요율 기본값 후보와 시간기록 당시 요율 스냅샷 후보; 상속 규칙 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 요율 도움말

- Screen ID: `sc_b4e674c5933f49e79cf84897c07b9c85`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b4e674c5933f49e79cf84897c07b9c85?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3a9f2112-77d6-4e52-959c-8ddf4b07480f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_be37de9dc1fd45b1ba7b3694ef5ff525` → 현재 → `sc_b7e81d357767425a98ea8965ce65b3fe`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. 프로젝트 유지, Rate=20에 포커스.
- 버튼·메뉴·안내 문구: Rate 정보 아이콘의 어두운 툴팁. 요율 없는 시간도 인보이스에 추가하거나 내부 추적할 수 있다고 안내. 타이머 00:00:12.
- 확인된 상태: 요율 설명이 Task 영역 일부 위에 겹쳐 보인다.
- 단계 간 변화: Rate 도움말 툴팁을 표시.

#### 동작과 데이터

- 화면 관찰: 요율 미입력과 시간 추적 불가를 동일한 제약으로 두면 안 된다는 UI 근거.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미입력·0의 구분 및 청구 시 요율 결정 방식.

#### 모델링 영향

- 후보와 근거: nullable 요율과 청구 가능 상태를 분리하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 진행 중 메모 입력

- Screen ID: `sc_b7e81d357767425a98ea8965ce65b3fe`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b7e81d357767425a98ea8965ce65b3fe?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6a94cd29-6400-4d65-9999-de136c439114.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b4e674c5933f49e79cf84897c07b9c85` → 현재 → `sc_f542370cb63848f5bb8326b2872dc8d8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. 메모=Creating a proposal, Rate=20, Task 미선택.
- 버튼·메뉴·안내 문구: 빨간 일시정지·휴지통, 타이머 00:00:23.
- 확인된 상태: 실행 중 상세 필드 편집 상태.
- 단계 간 변화: 메모 입력 상태.

#### 동작과 데이터

- 화면 관찰: 메모가 존재하나 이 캡처에는 Changes Saved 피드백이 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메모 저장 시점, 줄바꿈·길이 제한, Task 신규 생성 결과.

#### 모델링 영향

- 후보와 근거: 시간기록 설명 필드와 Task 관계를 분리하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 팝오버를 닫은 실행 상태

- Screen ID: `sc_f542370cb63848f5bb8326b2872dc8d8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f542370cb63848f5bb8326b2872dc8d8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00793275-37cd-46d6-aa62-8dcbb6d8bb1e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b7e81d357767425a98ea8965ce65b3fe` → 현재 → `sc_6078e139a0cc42bcac29cfb3a4921052`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드 전체가 보이고 팝오버는 닫혔다. 상단 바에 빨간 정지 아이콘·00:00:35·프로젝트 축약명이 남아 있다.
- 입력 항목·필수 표시·기본값: 이 화면에는 타이머 상세 입력이 보이지 않는다.
- 버튼·메뉴·안내 문구: 상단 타이머, +New, 대시보드 퀵 액션.
- 확인된 상태: 팝오버가 닫혀도 실행 표시가 유지된다.
- 단계 간 변화: 팝오버가 닫혀도 상단 타이머는 실행 중.

#### 동작과 데이터

- 화면 관찰: 앞 화면 23초에서35초로 경과했다. 팝오버 표시와 실행 상태가 분리되어 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 페이지 이동·새로고침·브라우저 종료 후 연속성, 다른 기기 동기화.

#### 모델링 영향

- 후보와 근거: 전역 타이머 표시 상태와 팝오버 열린 상태를 별도 관리하는 FE 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 일시정지와 완료 액션

- Screen ID: `sc_6078e139a0cc42bcac29cfb3a4921052`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6078e139a0cc42bcac29cfb3a4921052?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/70ee120a-709c-44d7-91c6-2f22e33bcf96.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f542370cb63848f5bb8326b2872dc8d8` → 현재 → `sc_cfa8d3d6c80049a58bef6c5eeaf05197`

#### 화면에서 직접 확인한 내용

- 레이아웃: 대시보드의 상단 Track Time 아래에 흰색 세로 팝오버. 위는 시간·재생/정지 영역, 아래는 프로젝트·작업·날짜/요율·메모. 좌측 내비게이션과 배경 대시보드가 유지된다.
- 입력 항목·필수 표시·기본값: Project 선택, Task 선택 또는 새 작업 입력, Date Feb 7, 2024, Rate, 여러 줄 메모. 별표나 필수 안내는 보이지 않는다. 프로젝트·메모 유지, Rate=20.0, Task 미선택.
- 버튼·메뉴·안내 문구: Done, Resume Timer, 초록 재생, 휴지통. 00:01:16.
- 확인된 상태: 실행 중 빨간 정지 버튼이 초록 재개 버튼으로 바뀌었다.
- 단계 간 변화: 1분16초에서 일시정지된 상세 폼.

#### 동작과 데이터

- 화면 관찰: 일시정지 후 Done이 나타난다. 요율 표시는20→20.0으로 정규화되지만 단위 변경 증거는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 일시정지와 최종 제출의 서버 상태 차이, 재개 구간 누적·동시 타이머 제한.

#### 모델링 영향

- 후보와 근거: 실행/일시정지/완료 구분과 누적시간 후보; 구간 이력 저장 여부 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 완료된 시간 기록 요약

- Screen ID: `sc_cfa8d3d6c80049a58bef6c5eeaf05197`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cfa8d3d6c80049a58bef6c5eeaf05197?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8400be41-5366-4bd0-9eb9-d2064b07f7fa.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6078e139a0cc42bcac29cfb3a4921052` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 타이머 팝오버 상단은 새 타이머 0초, 하단은 한 개의 기록 행. 날짜는 왼쪽, 고객·프로젝트·메모는 중앙, 시간은 오른쪽.
- 입력 항목·필수 표시·기본값: 새 타이머=00:00:00; 기존 기록 FEB 07, Doe Company, Design Project with Doe Studio, Creating a proposal, 00:01:16.
- 버튼·메뉴·안내 문구: Start New Timer와 초록 재생 버튼, 기록 옆 작은 편집 모양 아이콘.
- 확인된 상태: 기존 입력 폼이 기록 요약으로 바뀌었다.
- 단계 간 변화: 완료 기록 요약과 새 타이머 표시. Done 실행으로 추정되나 클릭 이벤트는 캡처되지 않음.

#### 동작과 데이터

- 화면 관찰: 이전 일시정지 시간1분16초와 동일한 시간의 기록이 표시된다. Task 이름은 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 영속 저장·새로고침 후 유지, 청구 상태·표시 목록 기간.

#### 모델링 영향

- 후보와 근거: 완료 시간기록과 새 타이머 초깃값을 분리; 고객은 프로젝트에서 조회하는 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 프로젝트를 선택하기 전에도 타이머가 실행된다. 프로젝트 없이 완료 가능한지는 미확인.
- 관찰: 프로젝트 선택 후 Changes Saved가 보이지만 모든 필드가 같은 방식으로 저장된다고 확정하지 않는다.
- 관찰: 팝오버 닫힘은 정지가 아니다. 일시정지와 Done 완료는 서로 다른 UI 상태다.
- 관찰: 요율 도움말은 요율 없는 시간 기록도 허용하는 맥락이다. 요율 필수 DB 제약을 임의로 만들지 않는다.
- 미확인: 휴지통의 삭제 범위·복구·확인 창, 동시 타이머 수, 실제 시간 계산 정밀도.

## 6. 공식 도움말과 API 대조

- [Tracking time internally](https://help.hellobonsai.com/en/articles/2548737-tracking-time-internally-with-bonsai): 상단 타이머에 프로젝트·작업·설명을 입력하고 정지 후 제출하는 흐름을 설명한다. 현재 도움말과 캡처의 버튼명·위치는 별도로 취급한다.
- [Time Entries API](https://docs.hellobonsai.com/api/tag/time-entries): GET/POST `/public-api/v1/time_entries`, PATCH `/public-api/v1/time_entries/{key}`를 확인했다. 공개 작업 목록만으로 실시간 start/pause/resume 프로토콜이나 요청 필수 필드를 알 수 없다. 연산 링크를 조회했으나 그룹 페이지로 돌아와 개별 스키마는 이 검토에서 미확인.
- [Invoicing your tracked time](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): 기록의 비청구·미청구·청구 상태를 구분한다. 이 완료 캡처에 청구 상태 배지가 없으므로 특정 상태로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: TimerSession의 실행/정지와 TimeEntry 완료 기록을 별개 상태로 표현할 후보. 별도 테이블 필요성은 전체 시간 흐름 후 결정한다.
- 설계 가정: project, optional task, description, 업무일자, 누적 시간, 단가 후보. 화면의 회색 placeholder와 실제 기본값은 구분한다.
- 설계 가정: 금액·통화·청구 상태·인보이스 연결은 시간과 청구 흐름을 합쳐 검토한다.
- FE 후보: 전역 타이머와 팝오버 상태, 필드 저장 피드백, 초 단위 표시·일시정지·완료 요약.

## 8. 미확인 사항과 검토 질문

- 프로젝트 없이 Done이 가능한가? 검증 환경에서 빈 값 제출로 확인하고 필수 관계를 결정한다.
- 시간은 서버시각·클라이언트시각 중 무엇을 기준으로 계산하는가? 새로고침·다중 탭·시간대 전환을 재현한다.
- 프로젝트 변경 시 요율20이 어디서 유래하는가? 프로젝트·사용자·작업 기본 요율을 각각 바꿔 확인한다.
- 완료·삭제·재개 시 기존 기록이 수정되는가? 네트워크와 목록 ID를 비교하고 이력·중복 방지 후보를 결정한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
