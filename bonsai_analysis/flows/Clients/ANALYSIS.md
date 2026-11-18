# Clients 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f8191fa7-f2d9-4060-bd47-891b2d627aaa` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f8191fa7-f2d9-4060-bd47-891b2d627aaa) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

고객 목록과 고객 포털·자동화·고객 설정의 네 탭을 탐색하는 개요 흐름이다.

- Dashboard→Clients목록→Client Portal→Automations→Settings 순서.
- 고객 목록의 사진은 이미 업로드된 상태라 신규고객 생성 직후 이미지와 다르다.
- 자동화 소개 그림 속 계약 서명/미팅 예약은 실제 저장된 자동화가 아닌 예시 UI다.

- 하위 플로우: [Enabling portal access](Enabling%20portal%20access/ANALYSIS.md), [Uploading a client image](Uploading%20a%20client%20image/ANALYSIS.md), [Adding a client field](Adding%20a%20client%20field/ANALYSIS.md), [Adding a new project (Clients)](Adding%20a%20new%20project%20%28Clients%29/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Clients`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | Clients 목록으로 이동. |
| 02 | [`sc_7f0b669f27f248c9bc800df624d5a8ac`](https://gummble.com/screens/sc_7f0b669f27f248c9bc800df624d5a8ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 목록](<screens/02_sc_7f0b669f27f248c9bc800df624d5a8ac.png>) | Client Portal 설정 탭. |
| 03 | [`sc_531ce252700c43088b29703be32726d6`](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 포털 비활성 설정](<screens/03_sc_531ce252700c43088b29703be32726d6.png>) | Automations 소개/빈 상태. |
| 04 | [`sc_102bdc6203b741afb96bd13d81b43cd8`](https://gummble.com/screens/sc_102bdc6203b741afb96bd13d81b43cd8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [자동화 소개와 생성 진입](<screens/04_sc_102bdc6203b741afb96bd13d81b43cd8.png>) | Settings에서 태그·필드 정의 목록. |
| 05 | [`sc_cc68ecaccb72426b8573fca9ece52fc9`](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 태그와 필드 설정](<screens/05_sc_cc68ecaccb72426b8573fca9ece52fc9.png>) | 설정 조회 종료. 포털활성화·필드추가는 하위플로우. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7f0b669f27f248c9bc800df624d5a8ac`

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

### 단계 02 — 고객 목록

- Screen ID: `sc_7f0b669f27f248c9bc800df624d5a8ac`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7f0b669f27f248c9bc800df624d5a8ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4984a535-a602-4d29-a07c-6586bae60d1f.png)
- 로컬 이미지: [02_sc_7f0b669f27f248c9bc800df624d5a8ac.png](<screens/02_sc_7f0b669f27f248c9bc800df624d5a8ac.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_531ce252700c43088b29703be32726d6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Clients 제목 아래 Clients/Client Portal/Automations/Settings. 검색·Filters·Import CSV·New Client. 표.
- 입력 항목·필수 표시·기본값: Client, Contact Name, Contact Email, Tags. Doe Company/Jane Doe/이메일/Client태그, Sample Client/샘플연락처/태그없음.
- 버튼·메뉴·안내 문구: 고객·담당자 정렬 아이콘, 행말줄임, Import CSV, New Client.
- 확인된 상태: 고객2행. Doe Company는 사진 아바타.
- 단계 간 변화: Clients 목록으로 이동.

#### 동작과 데이터

- 화면 관찰: 고객과 연락처 열을 구분하고 샘플 레코드가 함께 조회됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 표시연락처선택·CSV필수필드·페이지네이션.

#### 모델링 영향

- 후보와 근거: 고객/연락처 목록투영·태그·아바타 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 포털 비활성 설정

- Screen ID: `sc_531ce252700c43088b29703be32726d6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1cc4b534-e3d3-4969-ab1e-5a0eea2f2af6.png)
- 로컬 이미지: [03_sc_531ce252700c43088b29703be32726d6.png](<screens/03_sc_531ce252700c43088b29703be32726d6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7f0b669f27f248c9bc800df624d5a8ac` → 현재 → `sc_102bdc6203b741afb96bd13d81b43cd8`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client Portal 탭. 안내배너, 왼쪽설정·오른쪽포털미리보기.
- 입력 항목·필수 표시·기본값: 공유URL 축약표시, Portal Access Disabled, HeaderImage Custom Header, Bonsai Branding켜짐.
- 버튼·메뉴·안내 문구: View, 링크복사, Enable/Disabled, Upload Image, 브랜딩토글, brand settings링크, 배너닫기.
- 확인된 상태: 포털이 꺼져 있고 이미지업로드/브랜딩컨트롤은 표시됨.
- 단계 간 변화: Client Portal 설정 탭.

#### 동작과 데이터

- 화면 관찰: 포털설정은 특정고객 상세가 아닌 전역 Clients탭에 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: URL전체·링크인증·고객별접근·요금제제약.

#### 모델링 영향

- 후보와 근거: 포털 전역설정·브랜딩 자산·외부접근 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 자동화 소개와 생성 진입

- Screen ID: `sc_102bdc6203b741afb96bd13d81b43cd8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_102bdc6203b741afb96bd13d81b43cd8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1ada6fa0-905f-4e04-9bfb-14e1c511da2f.png)
- 로컬 이미지: [04_sc_102bdc6203b741afb96bd13d81b43cd8.png](<screens/04_sc_102bdc6203b741afb96bd13d81b43cd8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_531ce252700c43088b29703be32726d6` → 현재 → `sc_cc68ecaccb72426b8573fca9ece52fc9`

#### 화면에서 직접 확인한 내용

- 레이아웃: Automations 탭의 큰 카드. 왼쪽예시 트리거/액션그림, 오른쪽소개·New Automation.
- 입력 항목·필수 표시·기본값: 실제 입력폼 없음. 그림은 When a contract is signed / Schedule a meeting 예시.
- 버튼·메뉴·안내 문구: New Automation, Contact Support.
- 확인된 상태: 자동화 목록 대신 시작 안내.
- 단계 간 변화: Automations 소개/빈 상태.

#### 동작과 데이터

- 화면 관찰: 이메일·폼 요청 등자동 수행 목적을 소개하지만 실행 규칙은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제생성폼·지원트리거·발송권한·실패처리.

#### 모델링 영향

- 후보와 근거: 자동화규칙 후보만 도출; 그림을 실제 레코드로 기록하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 고객 태그와 필드 설정

- Screen ID: `sc_cc68ecaccb72426b8573fca9ece52fc9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/72d1e44d-bf39-49eb-854c-fa4dadc4f851.png)
- 로컬 이미지: [05_sc_cc68ecaccb72426b8573fca9ece52fc9.png](<screens/05_sc_cc68ecaccb72426b8573fca9ece52fc9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_102bdc6203b741afb96bd13d81b43cd8` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings 탭. 위Client Tags표·New Client Tag, 아래Client Fields표·Add New Field.
- 입력 항목·필수 표시·기본값: 2Tags:Client(1Client),Lead(0Clients).3Fields:Company Title(문서프리필),Phone Number,Website.
- 버튼·메뉴·안내 문구: 태그/필드 행Edit·Delete, 추가버튼.
- 확인된 상태: 정의 목록과 사용 개수를 조회.
- 단계 간 변화: Settings에서 태그·필드 정의 목록.

#### 동작과 데이터

- 화면 관찰: 필드 정의가 고객 값과 별도로 관리됨. 기본 필드처럼 보여도 삭제메뉴 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그색·필드타입·삭제영향·권한.

#### 모델링 영향

- 후보와 근거: 태그정의/연결·필드정의/고객값 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 목록은 고객명과 담당자명/이메일을 서로 다른 열로 표시한다.
- 관찰: 포털 탭의 Portal Access는 Disabled, Bonsai Branding은켜짐. 고객 상세의 Active와 다른 설정이다.
- 관찰: Settings에는 태그 정의와 필드 정의의 개수·행액션이 있다. 개별 고객에 입력된 값과 혼동하지 않는다.
- 미확인: 소개 카드를 보였다는 사실만으로 자동화가 요금제로 차단되었다고 판단하지 않는다.

## 6. 공식 도움말과 API 대조

- [명칭 변경 안내](https://help.hellobonsai.com/en/articles/15166148-clients-is-now-companies-what-s-changing-in-bonsai): 2026-08-27 Clients→Companies는 명칭 변경이며 기존 데이터·관계는 유지한다고 설명한다. 다만 별도 회사/연락처 생성 변화까지 이 명칭 변경 때문이라고 단정하지 않는다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): GET/POST `/public-api/v1/companies`, GET/PATCH `/public-api/v1/companies/{id}`, GET `/public-api/v1/companies/{id}/activities`를 확인했다.
- [Contacts API](https://docs.hellobonsai.com/api/tag/contacts): GET/POST `/public-api/v1/contacts`, GET/PATCH `/public-api/v1/contacts/{id}`, 활동 조회를 확인했다. 연락처는0개 또는 여러 회사에 연결될 수 있다고 명시한다. 요청 필드의 실제 필수값은 이 그룹 페이지에 없어 미확인.
- [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal): 현행 포털은 전역 기본값과 고객별 접근/가시성 설정을 설명한다. 캡처의 단일 Enable/Disabled와 최신 상세 설정을 같은 화면으로 합치지 않는다.
- [Custom fields 도움말](https://help.hellobonsai.com/en/articles/12078877-custom-fields): 고객 필드는 텍스트형으로 설명한다. 현재 설정 위치와 이 캡처의 Clients/Settings는 다르다.

## 7. 데이터 모델링 시사점

- Company/Contact·기본연락처·태그와 목록 조회 투영 후보.
- 포털 전역 활성화·브랜딩·외부 링크와 고객별 접근을 서로 다른 설정으로 검토한다.
- 태그/필드 정의와 각 고객의 연결/값을 구분한다. 기존 범용 CRM 엔진 재사용 여부는 이 기능만으로 확정하지 않는다.
- 자동화 규칙의 트리거/액션은 소개 예시에서 후보만 얻고 실행 규칙은 별도 흐름으로 검증한다.

## 8. 미확인 사항과 검토 질문

- 고객 목록은 항상 기본연락처를 표시하는가? 여러 연락처와 기본 변경 전후를 비교한다.
- Import CSV·검색/필터·행메뉴·New Automation의 실제 내부 단계는 다른 자료로 보완한다.
- Bonsai Branding 해제의 요금제/권한 조건과 업그레이드 상태를 확인한다.
- 기본 필드처럼 보이는 Company Title/Phone/Website를 삭제할 때 문서와 기존 값에 어떤 영향이 있는가? 추가 검증이 필요하다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
