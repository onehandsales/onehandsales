# Clients 플로우 분석

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **5/5단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/5단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-f8191fa7-f2d9-4060-bd47-891b2d627aaa>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f8191fa7-f2d9-4060-bd47-891b2d627aaa` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f8191fa7-f2d9-4060-bd47-891b2d627aaa) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 5단계 / 5단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

고객 목록과 고객 포털·자동화·고객 설정의 네 탭을 탐색하는 개요 흐름이다.

- Dashboard→Clients목록→Client Portal→Automations→Settings 순서.
- 고객 목록의 사진은 이미 업로드된 상태라 신규고객 생성 직후 이미지와 다르다.
- 자동화 소개 그림 속 계약 서명/미팅 예약은 실제 저장된 자동화가 아닌 예시 UI다.

- 하위 흐름: [Enabling portal access](Enabling%20portal%20access/ANALYSIS.md), [Uploading a client image](Uploading%20a%20client%20image/ANALYSIS.md), [Adding a client field](Adding%20a%20client%20field/ANALYSIS.md), [Adding a new project (Clients)](Adding%20a%20new%20project%20%28Clients%29/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Clients`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **대시보드 — 프로젝트 타임라인과 손익 요약**이다. Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **고객 태그와 필드 설정**이다. 정의 목록과 사용 개수를 조회. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Adding a client field](<Adding a client field/ANALYSIS.md>), [Adding a new project (Clients)](<Adding a new project (Clients)/ANALYSIS.md>), [Enabling portal access](<Enabling portal access/ANALYSIS.md>), [Adding a new client](<../Adding a new client/ANALYSIS.md>), [Projects](<../Projects/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | 고객 목록 — 고객2행. Doe Company는 사진 아바타. |
| 02 | [`sc_7f0b669f27f248c9bc800df624d5a8ac`](https://gummble.com/screens/sc_7f0b669f27f248c9bc800df624d5a8ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 목록](<screens/02_sc_7f0b669f27f248c9bc800df624d5a8ac.png>) | 고객 포털 비활성 설정 — 포털이 꺼져 있고 이미지업로드/브랜딩컨트롤은 표시됨. |
| 03 | [`sc_531ce252700c43088b29703be32726d6`](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 포털 비활성 설정](<screens/03_sc_531ce252700c43088b29703be32726d6.png>) | 자동화 소개와 생성 진입 — 자동화 목록 대신 시작 안내. |
| 04 | [`sc_102bdc6203b741afb96bd13d81b43cd8`](https://gummble.com/screens/sc_102bdc6203b741afb96bd13d81b43cd8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [자동화 소개와 생성 진입](<screens/04_sc_102bdc6203b741afb96bd13d81b43cd8.png>) | 고객 태그와 필드 설정 — 정의 목록과 사용 개수를 조회. |
| 05 | [`sc_cc68ecaccb72426b8573fca9ece52fc9`](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 태그와 필드 설정](<screens/05_sc_cc68ecaccb72426b8573fca9ece52fc9.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 015, 고유 이미지 S058, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7f0b669f27f248c9bc800df624d5a8ac`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정된 왼쪽 사이드바, 상단 Search·Track Time·New, 날짜와 인사말 아래 2열 본문. 왼쪽은 Project Timeline과 Profit & Loss, 오른쪽은 2×2 빠른 생성 카드와 Workflow Plus 홍보 카드다.
- 입력 항목·필수 표시·기본값: Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다.
- 버튼·메뉴·안내 문구: 사이드바 Dashboard·Clients·Projects·Tasks, Tools 아래 Invoices·Proposals·Contracts·Time Tracking·Services·Forms·Scheduling, Finances 아래 Bookkeeping. 하단 Invite Team·Get 1 Month Free. 빠른 실행은 Send an invoice·Draft a proposal·Create a contract·Add a form. 홍보 카드에는 X·캐러셀 점·START 14-DAY FREE TRIAL, 우하단 도움말 버튼이 있다.
- 확인된 상태: Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 프로젝트별 문서 아이콘과 손익 그래프를 한 화면에서 표시한다. 특정 메뉴를 실행했다는 근거는 다음 단계와 함께 판단한다. 홍보의 14일 문구를 계정 전체의 체험 기간으로 일반화하지 않는다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 고객 목록

- Screen ID: `sc_7f0b669f27f248c9bc800df624d5a8ac`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7f0b669f27f248c9bc800df624d5a8ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4984a535-a602-4d29-a07c-6586bae60d1f.png)
- 로컬 이미지: [02_sc_7f0b669f27f248c9bc800df624d5a8ac.png](<screens/02_sc_7f0b669f27f248c9bc800df624d5a8ac.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 026, 고유 이미지 S104, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_531ce252700c43088b29703be32726d6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Clients 제목 아래 Clients/Client Portal/Automations/Settings. 검색·Filters·Import CSV·New Client. 표.
- 입력 항목·필수 표시·기본값: Client, Contact Name, Contact Email, Tags. Doe Company/Jane Doe/이메일/Client태그, Sample Client/샘플연락처/태그없음.
- 버튼·메뉴·안내 문구: 고객·담당자 정렬 아이콘, 행말줄임, Import CSV, New Client.
- 확인된 상태: 고객2행. Doe Company는 사진 아바타.
- 단계 간 변화: Clients 목록으로 이동. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 고객과 연락처 열을 구분하고 샘플 레코드가 함께 조회됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 표시연락처선택·CSV필수필드·페이지네이션.

#### 모델링 영향

- 후보와 근거: 고객/연락처 목록투영·태그·아바타 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 표시연락처선택·CSV필수필드·페이지네이션. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 포털 비활성 설정

- Screen ID: `sc_531ce252700c43088b29703be32726d6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1cc4b534-e3d3-4969-ab1e-5a0eea2f2af6.png)
- 로컬 이미지: [03_sc_531ce252700c43088b29703be32726d6.png](<screens/03_sc_531ce252700c43088b29703be32726d6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 027, 고유 이미지 S105, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7f0b669f27f248c9bc800df624d5a8ac` → 현재 → `sc_102bdc6203b741afb96bd13d81b43cd8`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client Portal 탭. 안내배너, 왼쪽설정·오른쪽포털미리보기.
- 입력 항목·필수 표시·기본값: 공유URL 축약표시, Portal Access Disabled, HeaderImage Custom Header, Bonsai Branding켜짐.
- 버튼·메뉴·안내 문구: View, 링크복사, Enable/Disabled, Upload Image, 브랜딩토글, brand settings링크, 배너닫기.
- 확인된 상태: 포털이 꺼져 있고 이미지업로드/브랜딩컨트롤은 표시됨.
- 단계 간 변화: Client Portal 설정 탭. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 포털설정은 특정고객 상세가 아닌 전역 Clients탭에 있다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: URL전체·링크인증·고객별접근·요금제제약.

#### 모델링 영향

- 후보와 근거: 포털 전역설정·브랜딩 자산·외부접근 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: URL전체·링크인증·고객별접근·요금제제약. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 자동화 소개와 생성 진입

- Screen ID: `sc_102bdc6203b741afb96bd13d81b43cd8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_102bdc6203b741afb96bd13d81b43cd8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1ada6fa0-905f-4e04-9bfb-14e1c511da2f.png)
- 로컬 이미지: [04_sc_102bdc6203b741afb96bd13d81b43cd8.png](<screens/04_sc_102bdc6203b741afb96bd13d81b43cd8.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 027, 고유 이미지 S106, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_531ce252700c43088b29703be32726d6` → 현재 → `sc_cc68ecaccb72426b8573fca9ece52fc9`

#### 화면에서 직접 확인한 내용

- 레이아웃: Automations 탭의 큰 카드. 왼쪽예시 트리거/액션그림, 오른쪽소개·New Automation.
- 입력 항목·필수 표시·기본값: 실제 입력폼 없음. 그림은 When a contract is signed / Schedule a meeting 예시.
- 버튼·메뉴·안내 문구: New Automation, Contact Support.
- 확인된 상태: 자동화 목록 대신 시작 안내.
- 단계 간 변화: Automations 소개/빈 상태. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 이메일·폼 요청 등자동 수행 목적을 소개하지만 실행 규칙은 미확인. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제생성폼·지원트리거·발송권한·실패처리.

#### 모델링 영향

- 후보와 근거: 자동화규칙 후보만 도출; 그림을 실제 레코드로 기록하지 않음. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 실제생성폼·지원트리거·발송권한·실패처리. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 고객 태그와 필드 설정

- Screen ID: `sc_cc68ecaccb72426b8573fca9ece52fc9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/72d1e44d-bf39-49eb-854c-fa4dadc4f851.png)
- 로컬 이미지: [05_sc_cc68ecaccb72426b8573fca9ece52fc9.png](<screens/05_sc_cc68ecaccb72426b8573fca9ece52fc9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 024, 고유 이미지 S095, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_102bdc6203b741afb96bd13d81b43cd8` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings 탭. 위Client Tags표·New Client Tag, 아래Client Fields표·Add New Field.
- 입력 항목·필수 표시·기본값: 2Tags:Client(1Client),Lead(0Clients).3Fields:Company Title(문서프리필),Phone Number,Website.
- 버튼·메뉴·안내 문구: 태그/필드 행Edit·Delete, 추가버튼.
- 확인된 상태: 정의 목록과 사용 개수를 조회.
- 단계 간 변화: Settings에서 태그·필드 정의 목록. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 필드 정의가 고객 값과 별도로 관리됨. 기본 필드처럼 보여도 삭제메뉴 존재. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그색·필드타입·삭제영향·권한.

#### 모델링 영향

- 후보와 근거: 태그정의/연결·필드정의/고객값 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 태그색·필드타입·삭제영향·권한. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다. — Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다. | 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다. |
| 02 | 고객2행. Doe Company는 사진 아바타. — Client, Contact Name, Contact Email, Tags. Doe Company/Jane Doe/이메일/Client태그, Sample Client/샘플연락처/태그없음. | 표시연락처선택·CSV필수필드·페이지네이션. |
| 03 | 포털이 꺼져 있고 이미지업로드/브랜딩컨트롤은 표시됨. — 공유URL 축약표시, Portal Access Disabled, HeaderImage Custom Header, Bonsai Branding켜짐. | URL전체·링크인증·고객별접근·요금제제약. |
| 04 | 자동화 목록 대신 시작 안내. — 실제 입력폼 없음. 그림은 When a contract is signed / Schedule a meeting 예시. | 실제생성폼·지원트리거·발송권한·실패처리. |
| 05 | 정의 목록과 사용 개수를 조회. — 2Tags:Client(1Client),Lead(0Clients).3Fields:Company Title(문서프리필),Phone Number,Website. | 태그색·필드타입·삭제영향·권한. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

고객 목록·Portal·Automations·Settings는 기능 탐색 캡처다. 자동화의 계약 서명→미팅 그림은 구성된 규칙이 아니며 포털 미리보기는 실제 고객 화면 접근 결과가 아니다. 고객·연락처·태그를 별도 개념으로 구분한다.

### 업무 규칙과 연결 시 주의점

- 관찰: 목록은 고객명과 담당자명/이메일을 서로 다른 열로 표시한다.
- 관찰: 포털 탭의 Portal Access는 Disabled, Bonsai Branding은켜짐. 고객 상세의 Active와 다른 설정이다.
- 관찰: Settings에는 태그 정의와 필드 정의의 개수·행액션이 있다. 개별 고객에 입력된 값과 혼동하지 않는다.
- 미확인: 소개 카드를 보였다는 사실만으로 자동화가 요금제로 차단되었다고 판단하지 않는다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [명칭 변경 안내](https://help.hellobonsai.com/en/articles/15166148-clients-is-now-companies-what-s-changing-in-bonsai): R2 본문 대조 기록(S007). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): R2 본문 대조 기록(S008). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [Contacts API](https://docs.hellobonsai.com/api/tag/contacts): R2 본문 대조 기록(S009). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [Custom fields](https://help.hellobonsai.com/en/articles/12078877-custom-fields): R2 본문 대조 기록(S020). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal): R2 본문 대조 기록(S024). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- Company/Contact·기본연락처·태그와 목록 조회 투영 후보.
- 포털 전역 활성화·브랜딩·외부 링크와 고객별 접근을 서로 다른 설정으로 검토한다.
- 태그/필드 정의와 각 고객의 연결/값을 구분한다. 기존 범용 CRM 엔진 재사용 여부는 이 기능만으로 확정하지 않는다.
- 자동화 규칙의 트리거/액션은 소개 예시에서 후보만 얻고 실행 규칙은 별도 흐름으로 검증한다.

### 단계별 모델링 근거

- 단계 01: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다.
- 단계 02: 고객/연락처 목록투영·태그·아바타 후보.
- 단계 03: 포털 전역설정·브랜딩 자산·외부접근 후보.
- 단계 04: 자동화규칙 후보만 도출; 그림을 실제 레코드로 기록하지 않음.
- 단계 05: 태그정의/연결·필드정의/고객값 분리 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 고객 목록은 항상 기본연락처를 표시하는가? 여러 연락처와 기본 변경 전후를 비교한다. Import CSV·검색/필터·행메뉴·New Automation의 실제 내부 단계는 다른 자료로 보완한다.

- 고객 목록은 항상 기본연락처를 표시하는가? 여러 연락처와 기본 변경 전후를 비교한다.
- Import CSV·검색/필터·행메뉴·New Automation의 실제 내부 단계는 다른 자료로 보완한다.
- Bonsai Branding 해제의 요금제/권한 조건과 업그레이드 상태를 확인한다.
- 기본 필드처럼 보이는 Company Title/Phone/Website를 삭제할 때 문서와 기존 값에 어떤 영향이 있는가? 추가 검증이 필요하다.

### 단계별 미확인 사항

- 단계 01: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.
- 단계 02: 표시연락처선택·CSV필수필드·페이지네이션.
- 단계 03: URL전체·링크인증·고객별접근·요금제제약.
- 단계 04: 실제생성폼·지원트리거·발송권한·실패처리.
- 단계 05: 태그색·필드타입·삭제영향·권한.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **조회**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 고객·연락처·포털 설정·태그·필드 정의의 소유 범위를 구분한다. 연락처 추가·기본 변경·검색·보관·삭제는 추가 경로가 필요하다.
- [이 흐름의 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-f8191fa7-f2d9-4060-bd47-891b2d627aaa>)와 [공통 웹 상태·연결 기준](<../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 5단계 ID·순서·원본 URL 재조회 및 이미지 5/5단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 5단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/5단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |
