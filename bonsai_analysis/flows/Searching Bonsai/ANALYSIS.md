# Searching Bonsai 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f6466df8-7932-40c1-a10e-f84bfe1070f5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f6466df8-7932-40c1-a10e-f84bfe1070f5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

전역 검색 모달에서 최근 조회 항목을 확인하고 rebranding 검색 결과에서 프로젝트 상세로 이동한다.

- 고객·프로젝트·문서·작업을 함께 찾는 전역 검색.
- 검색 중간 화면의 여러 항목과 최종2개 결과를 구분한다.


## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | 검색 모달이 열리고 최근 조회 목록이 나타난다. |
| 02 | [`sc_10915014ab6949a0abc5fdf5c383c15a`](https://gummble.com/screens/sc_10915014ab6949a0abc5fdf5c383c15a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 검색 모달 — Recently Viewed | rebranding이 입력되고 로딩 표시와 중간 결과가 나타난다. |
| 03 | [`sc_b11731f0f2514992a919c05aab16abdd`](https://gummble.com/screens/sc_b11731f0f2514992a919c05aab16abdd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | rebranding 입력 후 검색 중간 상태 | 로딩 표시가 사라지고 결과 2개가 남는다. |
| 04 | [`sc_fbef9bc67e504d678bab9f15ce693e33`](https://gummble.com/screens/sc_fbef9bc67e504d678bab9f15ce693e33?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | rebranding 검색 결과 2개 | 다음 캡처는 Rebranding Project 상세다. 선택 방법은 수록되지 않았다. |
| 05 | [`sc_0772af4321ef49babd9c81dd8b573721`](https://gummble.com/screens/sc_0772af4321ef49babd9c81dd8b573721?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 검색 뒤 열린 Rebranding Project 상세 | 프로젝트 상세에서 캡처가 끝난다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_10915014ab6949a0abc5fdf5c383c15a`

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

### 단계 02 — 검색 모달 — Recently Viewed

- Screen ID: `sc_10915014ab6949a0abc5fdf5c383c15a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_10915014ab6949a0abc5fdf5c383c15a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8f3c6c71-ae67-4a94-a0bc-fab5945878ab.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_b11731f0f2514992a919c05aab16abdd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두워지고 흐려진 대시보드 위 중앙 모달. 상단 검색 입력줄, Recently Viewed 목록, 하단 단축키 안내로 나뉜다.
- 입력 항목·필수 표시·기본값: Search… 입력값은 비어 있다. 최근 항목은 Design Contract(Sent), Rebranding Project, Doe Company Invoice($70.04·Feb 7, 2024·Drafted), Design Project with Doe Studio, Jane Doe – Doe Company의 5개다. 각 행 우측에 Contract·Project·Invoice·Client 종류가 표시된다.
- 버튼·메뉴·안내 문구: 검색 입력과 결과 행. 하단 ⌘ K to open, ESC to close 안내. 별도 검색 실행 버튼은 보이지 않는다.
- 확인된 상태: 최근 조회 목록이 표시되고 첫 계약 행은 옅은 배경으로 강조되어 있다.
- 단계 간 변화: 검색 모달이 열리고 최근 조회 목록이 나타난다.

#### 동작과 데이터

- 화면 관찰: 서로 다른 업무 객체가 한 목록에 나타나며 종류에 따라 상태·금액·날짜·연결 프로젝트/고객 정보를 표시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 최근 조회의 저장 범위와 최대 수, 행 강조가 마우스 hover인지 키보드 선택인지, 입력 후 검색 실행 시점은 미확인이다.

#### 모델링 영향

- 후보와 근거: 객체 종류·ID·표시 제목·연결 객체와 종류별 요약 정보, 사용자별 최근 조회 이력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — rebranding 입력 후 검색 중간 상태

- Screen ID: `sc_b11731f0f2514992a919c05aab16abdd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b11731f0f2514992a919c05aab16abdd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/85a52130-daa8-4f64-aca9-20fa28e68a77.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_10915014ab6949a0abc5fdf5c383c15a` → 현재 → `sc_fbef9bc67e504d678bab9f15ce693e33`

#### 화면에서 직접 확인한 내용

- 레이아웃: 검색 모달이 세로로 길어졌고 입력줄 오른쪽에 회전형 로딩 표시가 있다. 목록은 하단에서 일부 잘린다.
- 입력 항목·필수 표시·기본값: 입력값은 rebranding. 목록에 Go To → Contracts, Doe Company Invoice, Rebranding Project, Design Contract, 제목이 비어 보이는 Task, Design Project with Doe Studio, Initial Chat 작업 등이 함께 나타난다.
- 버튼·메뉴·안내 문구: 결과 행과 하단 단축키 안내. Go To 행은 객체 한 건이 아니라 기능 페이지 이동 항목처럼 표시된다.
- 확인된 상태: 로딩 표시가 있는 중간 화면이다. 최종 2개 결과와 구성이 다르므로 최종 검색 결과로 기록하지 않는다.
- 단계 간 변화: rebranding이 입력되고 로딩 표시와 중간 결과가 나타난다.

#### 동작과 데이터

- 화면 관찰: 입력 변경과 결과 갱신 사이에 여러 항목이 표시된다. 이전 결과 유지·검색 갱신·응답 경합 중 무엇인지 정적 이미지로는 구분할 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 작업 제목이 실제 데이터인지 일시적인 렌더링인지, 중간 결과의 정렬과 검색 일치 조건은 미확인이다.

#### 모델링 영향

- 후보와 근거: 입력값·로딩·확정 결과 상태의 구분, 기능 이동 항목과 업무 객체 결과의 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — rebranding 검색 결과 2개

- Screen ID: `sc_fbef9bc67e504d678bab9f15ce693e33`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fbef9bc67e504d678bab9f15ce693e33?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/41a8fb08-f534-4eb0-86a6-831c05bae194.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b11731f0f2514992a919c05aab16abdd` → 현재 → `sc_0772af4321ef49babd9c81dd8b573721`

#### 화면에서 직접 확인한 내용

- 레이아웃: 높이가 줄어든 중앙 모달에 청구서와 프로젝트가 두 행으로 표시된다. 로딩 표시는 사라졌다.
- 입력 항목·필수 표시·기본값: 검색어 rebranding 유지. Doe Company Invoice는 $5,517.75·Feb 8, 2024·Drafted와 Rebranding Project – Doe Company를 표시한다. Rebranding Project 행은 Doe Company·Started Feb 8, 2024를 표시한다.
- 버튼·메뉴·안내 문구: 결과 행과 ⌘ K·ESC 안내. 첫 청구서 행의 배경이 강조되어 있다.
- 확인된 상태: 화면에 남은 결과는 청구서 1개와 프로젝트 1개다. 결과 개수의 총합·페이지네이션 표시는 없다.
- 단계 간 변화: 로딩 표시가 사라지고 결과 2개가 남는다.

#### 동작과 데이터

- 화면 관찰: 청구서 제목에는 검색어가 없지만 연결 프로젝트 이름에는 검색어가 있다. 관련 이름도 검색할 가능성이 있으나 정확한 색인 규칙은 추정이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색 대상 필드·정렬 규칙·권한 필터, 키보드/마우스 선택 방식은 미확인이다. 강조된 청구서가 다음 화면의 이동 대상이라고 단정하지 않는다.

#### 모델링 영향

- 후보와 근거: 연결 객체의 요약 정보를 갖는 검색 결과와 객체 종류별 상세 화면 이동 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 검색 뒤 열린 Rebranding Project 상세

- Screen ID: `sc_0772af4321ef49babd9c81dd8b573721`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0772af4321ef49babd9c81dd8b573721?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c5d7e2c7-6e29-4c0a-8d05-51773ac259a3.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_fbef9bc67e504d678bab9f15ce693e33` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 이름·고객·상태 아래 Overview 등 탭이 있다. 왼쪽은 Tasks 빈 상태와 Recent Activity, 오른쪽은 Documents & Links 및 Invoices·Expenses 요약 카드다.
- 입력 항목·필수 표시·기본값: 상태 New Lead, 고객 Doe Company. Graphic Design Brief는 Form – Incomplete, Creative Design Brief는 Proposal – accepted로 표시된다. 청구서·비용 요약 금액은 모두 $0.00이다.
- 버튼·메뉴·안내 문구: Overview·Invoices·Tasks·Time Tracking·Team·Settings 탭, 이름 옆 연필·상태 선택·…·멤버 버튼·+, Send Email, View Email, 문서별 …, new task·from a template 링크.
- 확인된 상태: 검색 모달이 닫히고 프로젝트 상세가 표시된다. 이 화면에서 작업 목록은 비어 있지만 문서와 활동은 존재한다.
- 단계 간 변화: 다음 캡처는 Rebranding Project 상세다. 선택 방법은 수록되지 않았다.

#### 동작과 데이터

- 화면 관찰: Recent Activity에 폼 발송 7:11:35 PM, 제안서 restored 6:46:40 PM, archived 6:45:41 PM, marked as accepted가 각각 보인다. 복원 이벤트의 존재는 직접 확인되지만 복원 버튼을 누른 장면은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색 결과 선택 방식, 제안서 복원 조작 UI와 권한, 복원 전후 고객 접근·연결 문서 영향은 미확인이다.

#### 모델링 영향

- 후보와 근거: 검색 결과의 상세 화면 연결, 프로젝트별 문서 참조, 제안서 업무 상태와 보관 상태 및 개별 활동 이력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 빈 검색어에서는 Recently Viewed가 표시된다. 검색어 입력 후 로딩 표시가 있는 중간 상태와 결과 2개가 남은 상태를 구분한다.
- [관찰] 최종 화면의 청구서 제목은 Doe Company Invoice이며, 하위 정보에 검색어와 일치하는 Rebranding Project가 있다. 관련 객체 이름도 검색한다는 해석은 아직 가정이다.
- [관찰] 청구서 행이 강조되어 있지만 후속 화면은 프로젝트 상세다. 행 강조만으로 최종 선택 대상을 확정하지 않는다.
- [관찰] 결과 종류마다 금액·상태·날짜·연결 프로젝트 표시가 다르다.
- [교차 관찰] 마지막 프로젝트 상세에 제안서 수락·보관·복원 활동이 나타난다. 복원 조작 UI는 해당 이미지에도 없다.

## 6. 공식 도움말과 API 대조

- [탐색·전역 검색](https://help.hellobonsai.com/en/articles/13764408-how-to-navigate-bonsai-and-customize-the-sidebar): 프로젝트·고객·작업·문서 검색과 직접 이동을 확인한다. 검색 알고리즘과 최근조회 보존 범위는 설명되지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 업무 리소스별 조회 API는 확인했으나 앱 전역 검색·최근 조회 목록 전용 endpoint, 색인 필드·정렬·권한 필터 계약은 확인하지 못했다. UI 검색이 리소스별 목록 API만으로 구현된다고 가정하지 않는다.

## 7. 데이터 모델링 시사점

- 서로 다른 객체 종류·ID, 표시 제목, 상위 관계와 상태·금액을 갖는 검색 결과 후보.
- 사용자별 최근 조회 이력과 검색 결과의 권한 필터 후보. 검색 색인과 업무 원본 데이터를 구분한다.

## 8. 미확인 사항과 검토 질문

- 관계명·본문·번호의 검색 범위, 정렬, 입력 지연 처리, 페이지네이션, 무결과 상태를 실제 계정에서 확인한다.
- 삭제·보관·권한 제거된 객체가 최근 조회와 검색 결과에서 어떻게 처리되는지 검증한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 검색 5단계를 재대조하고 중간 로딩·확정 결과·이동 대상·복원 활동 및 API 확인 범위를 보완 | 실제 계정 검증·8절 질문은 유지 |
