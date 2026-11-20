# Dashboard 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a15f8066-29c2-457a-beea-e0e83b8d4dde` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a15f8066-29c2-457a-beea-e0e83b8d4dde) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 8단계 / 8단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

프로젝트 문서 일정·수입지출·작업·시간·최근 활동을 한 화면에서 확인한다.

- 8장은 대시보드 내 스크롤·hover·홍보 카드 변화다. 독립된 업무를 모두 실행한 기록이 아니다.
- 하위 온보딩/생성 흐름은 다른 날짜·데이터 상태일 수 있다. 캡처 순서를 실제 연속 시계열로 취급하지 않는다.

- 하위 흐름: [Marking a task as complete](Marking%20a%20task%20as%20complete/ANALYSIS.md), [Adding income manually](Adding%20income%20manually/ANALYSIS.md), [Adding company details](Adding%20company%20details/ANALYSIS.md), [Create a contact form (template)](Create%20a%20contact%20form%20%28template%29/ANALYSIS.md), [Connecting to Google Calendar](Connecting%20to%20Google%20Calendar/ANALYSIS.md), [Hiding sidebar](Hiding%20sidebar/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **대시보드 — 프로젝트 타임라인과 손익 요약**이다. Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **대시보드 하단 활동**이다. 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Adding company details](<Adding company details/ANALYSIS.md>), [Adding income manually](<Adding income manually/ANALYSIS.md>), [Connecting to Google Calendar](<Connecting to Google Calendar/ANALYSIS.md>), [Projects](<../Projects/ANALYSIS.md>), [Time Tracking](<../Time Tracking/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | 프로젝트 문서 타임라인 hover — 한 일정 위치에 계약과 인보이스 요약이 함께 보인다. |
| 02 | [`sc_765d1f52dfb64d28a78f4feb85550e91`](https://gummble.com/screens/sc_765d1f52dfb64d28a78f4feb85550e91?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 문서 타임라인 hover](<screens/02_sc_765d1f52dfb64d28a78f4feb85550e91.png>) | 손익·작업·활동 요약 — 동일 문구·시각의 완료 활동이2번 보인다. |
| 03 | [`sc_77e5823b93c24c3ba6d4fb9bc8b78dab`](https://gummble.com/screens/sc_77e5823b93c24c3ba6d4fb9bc8b78dab?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [손익·작업·활동 요약](<screens/03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png>) | 손익 월별 값 hover — 월별 수치가 명시된다. |
| 04 | [`sc_fca9b7afe3224fbcbaedba0db6219071`](https://gummble.com/screens/sc_fca9b7afe3224fbcbaedba0db6219071?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [손익 월별 값 hover](<screens/04_sc_fca9b7afe3224fbcbaedba0db6219071.png>) | 홍보 카드 변경 — WorkflowPlus에서 비용 자동화 홍보로 바뀌었다. |
| 05 | [`sc_d5c00a24d1b04614ad759f86faa34aba`](https://gummble.com/screens/sc_d5c00a24d1b04614ad759f86faa34aba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [홍보 카드 변경](<screens/05_sc_d5c00a24d1b04614ad759f86faa34aba.png>) | 시간 집계·활동 중간 — 복원 이벤트가 직접 표시된다. 제안서 보관 플로우에 없던 후속 상태의 근거다. |
| 06 | [`sc_8e3268d7e1e548c2b527f59038328164`](https://gummble.com/screens/sc_8e3268d7e1e548c2b527f59038328164?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [시간 집계·활동 중간](<screens/06_sc_8e3268d7e1e548c2b527f59038328164.png>) | 시간 일별 hover — 일별 시간/금액을 별도로 보여준다. |
| 07 | [`sc_fe40b30743b344a0b5ebfe7d1d7f6da1`](https://gummble.com/screens/sc_fe40b30743b344a0b5ebfe7d1d7f6da1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [시간 일별 hover](<screens/07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png>) | 대시보드 하단 활동 — 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다. |
| 08 | [`sc_c5734f174d484ffe9bb7e6738a4da73a`](https://gummble.com/screens/sc_c5734f174d484ffe9bb7e6738a4da73a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 하단 활동](<screens/08_sc_c5734f174d484ffe9bb7e6738a4da73a.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 015, 고유 이미지 S058, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_765d1f52dfb64d28a78f4feb85550e91`

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

### 단계 02 — 프로젝트 문서 타임라인 hover

- Screen ID: `sc_765d1f52dfb64d28a78f4feb85550e91`
- 원본: [화면 페이지](https://gummble.com/screens/sc_765d1f52dfb64d28a78f4feb85550e91?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee3812f9-bfed-487b-a1a8-a5509ba41663.png)
- 로컬 이미지: [02_sc_765d1f52dfb64d28a78f4feb85550e91.png](<screens/02_sc_765d1f52dfb64d28a78f4feb85550e91.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 053, 고유 이미지 S209, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_77e5823b93c24c3ba6d4fb9bc8b78dab`

#### 화면에서 직접 확인한 내용

- 레이아웃: Project Timeline의 Design Project 행에 연결된 팝오버.
- 입력 항목·필수 표시·기본값: CONTRACT SENT Design Contract, Drafted Feb8 2024; INVOICE DRAFTED Invoice#1001,Total$70.04,IssuedFeb7 2024.
- 버튼·메뉴·안내 문구: 문서 팝오버 항목, 빠른 생성 카드.
- 확인된 상태: 한 일정 위치에 계약과 인보이스 요약이 함께 보인다.
- 단계 간 변화: 프로젝트 일정 아이콘을 가리킨다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 프로젝트에 여러 문서 이벤트가 연결됨을 확인한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 기준·클릭 이동·중첩 아이콘 정렬은 미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트-문서 참조와 일정용 이벤트 집계 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 날짜 기준·클릭 이동·중첩 아이콘 정렬은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 손익·작업·활동 요약

- Screen ID: `sc_77e5823b93c24c3ba6d4fb9bc8b78dab`
- 원본: [화면 페이지](https://gummble.com/screens/sc_77e5823b93c24c3ba6d4fb9bc8b78dab?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8fe51311-0da7-47e3-a661-2faf00186698.png)
- 로컬 이미지: [03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png](<screens/03_sc_77e5823b93c24c3ba6d4fb9bc8b78dab.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 053, 고유 이미지 S210, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_765d1f52dfb64d28a78f4feb85550e91` → 현재 → `sc_fca9b7afe3224fbcbaedba0db6219071`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 그래프/4개금액/작업/시간, 오른쪽 홍보/Activity.
- 입력 항목·필수 표시·기본값: USD,Last6Months;Outstanding0,Overdue0,Paid&Pending0,OtherIncome460;ReviewUXdesign dueFeb4;활동에 DesignProposal 완료2행,폼응답/발송.
- 버튼·메뉴·안내 문구: 통화/기간 선택,작업 체크/+/…,활동 View Email,홍보 X.
- 확인된 상태: 동일 문구·시각의 완료 활동이2번 보인다.
- 단계 간 변화: 아래 Profit & Loss/Tasks/Activity로 스크롤한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 업무별 요약과 여러 종류 이벤트를 함께 표시한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 활동 중복 원인·요약 집계 범위 미확인.

#### 모델링 영향

- 후보와 근거: 통합 활동과 기능별 집계 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 활동 중복 원인·요약 집계 범위 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 손익 월별 값 hover

- Screen ID: `sc_fca9b7afe3224fbcbaedba0db6219071`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fca9b7afe3224fbcbaedba0db6219071?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6e8e5dc2-0438-43dd-b275-f629173b3f7b.png)
- 로컬 이미지: [04_sc_fca9b7afe3224fbcbaedba0db6219071.png](<screens/04_sc_fca9b7afe3224fbcbaedba0db6219071.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 053, 고유 이미지 S211, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_77e5823b93c24c3ba6d4fb9bc8b78dab` → 현재 → `sc_d5c00a24d1b04614ad759f86faa34aba`

#### 화면에서 직접 확인한 내용

- 레이아웃: 손익 선 그래프에 검은 툴팁.
- 입력 항목·필수 표시·기본값: Feb24 Totals:Paid$100,Expenses-$190,Profit-$90. 아래 요약 Paid&Pending0/OtherIncome460 유지.
- 버튼·메뉴·안내 문구: 그래프 hover,기간/통화,작업 도구.
- 확인된 상태: 월별 수치가 명시된다.
- 단계 간 변화: 재무 그래프를 가리킨다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 100-190=-90이라는 해당 툴팁 관계만 확인된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 요약0/460과의 차이·실제 거래 범위는 미확인.

#### 모델링 영향

- 후보와 근거: 집계 기간과 원장 출처를 가진 재무 시계열 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 요약0/460과의 차이·실제 거래 범위는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 홍보 카드 변경

- Screen ID: `sc_d5c00a24d1b04614ad759f86faa34aba`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d5c00a24d1b04614ad759f86faa34aba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ff572448-9a3b-40e4-886a-35576e38d01d.png)
- 로컬 이미지: [05_sc_d5c00a24d1b04614ad759f86faa34aba.png](<screens/05_sc_d5c00a24d1b04614ad759f86faa34aba.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 053, 고유 이미지 S212, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fca9b7afe3224fbcbaedba0db6219071` → 현재 → `sc_8e3268d7e1e548c2b527f59038328164`

#### 화면에서 직접 확인한 내용

- 레이아웃: 손익/작업/활동은 유지, 우측 상단 카드 변경.
- 입력 항목·필수 표시·기본값: Automate your business expense tracking 설명;재무 값 유지.
- 버튼·메뉴·안내 문구: Connect Account,홍보 캐러셀 점/X.
- 확인된 상태: WorkflowPlus에서 비용 자동화 홍보로 바뀌었다.
- 단계 간 변화: hover가 사라지고 홍보 카드가 바뀐다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 홍보 표시 변화이며 계좌 연결 완료가 아니다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 순환/사용자 조작 여부 미확인.

#### 모델링 영향

- 후보와 근거: 홍보 UI 상태와 계좌 연결 상태 구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 자동 순환/사용자 조작 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 시간 집계·활동 중간

- Screen ID: `sc_8e3268d7e1e548c2b527f59038328164`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8e3268d7e1e548c2b527f59038328164?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6198602c-d8ea-4eab-9480-d8e5f2485d78.png)
- 로컬 이미지: [06_sc_8e3268d7e1e548c2b527f59038328164.png](<screens/06_sc_8e3268d7e1e548c2b527f59038328164.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 054, 고유 이미지 S213, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d5c00a24d1b04614ad759f86faa34aba` → 현재 → `sc_fe40b30743b344a0b5ebfe7d1d7f6da1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 Time Tracked 막대와 합계, 오른쪽 활동 타임라인.
- 입력 항목·필수 표시·기본값: Unbilled08:01:16/$160.42,Billed01:00:07/$20.04. 계약생성6:51/서명6:52/발송6:53,제안서보관6:45/복원6:46 등.
- 버튼·메뉴·안내 문구: 시간 막대 hover,활동 문서/메일 링크,스크롤.
- 확인된 상태: 복원 이벤트가 직접 표시된다. 제안서 보관 플로우에 없던 후속 상태의 근거다.
- 단계 간 변화: 시간 기록 영역으로 더 스크롤한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 시간 집계와 문서 lifecycle 이벤트를 확인한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복원 클릭 UI·고객 접근 유지·표시 주체 JoeDoe/JoeStudio 차이는 미확인.

#### 모델링 영향

- 후보와 근거: 시간 원시값·청구금액,문서 활동 이력 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 복원 클릭 UI·고객 접근 유지·표시 주체 JoeDoe/JoeStudio 차이는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 시간 일별 hover

- Screen ID: `sc_fe40b30743b344a0b5ebfe7d1d7f6da1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fe40b30743b344a0b5ebfe7d1d7f6da1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aa4e3bb3-5855-4503-b978-6539089ab846.png)
- 로컬 이미지: [07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png](<screens/07_sc_fe40b30743b344a0b5ebfe7d1d7f6da1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 054, 고유 이미지 S214, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8e3268d7e1e548c2b527f59038328164` → 현재 → `sc_c5734f174d484ffe9bb7e6738a4da73a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 2월8일 막대에 툴팁.
- 입력 항목·필수 표시·기본값: ThuFeb08:Billed00:00:00,Unbilled06:00:00,BilledAmount0,UnbilledAmount120;전체 합계는 유지.
- 버튼·메뉴·안내 문구: 막대 hover,활동 링크.
- 확인된 상태: 일별 시간/금액을 별도로 보여준다.
- 단계 간 변화: 2월8일 막대를 가리킨다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 하루 집계와 전체 집계가 구분된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 시간대·비청구 시간 포함·시급 변경 재계산은 미확인.

#### 모델링 영향

- 후보와 근거: 기간별시간 집계와 금액 계산 근거 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 시간대·비청구 시간 포함·시급 변경 재계산은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 대시보드 하단 활동

- Screen ID: `sc_c5734f174d484ffe9bb7e6738a4da73a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c5734f174d484ffe9bb7e6738a4da73a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/53fc7049-1b0a-411b-a3c5-352c176200f1.png)
- 로컬 이미지: [08_sc_c5734f174d484ffe9bb7e6738a4da73a.png](<screens/08_sc_c5734f174d484ffe9bb7e6738a4da73a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 054, 고유 이미지 S215, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fe40b30743b344a0b5ebfe7d1d7f6da1` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 시간 합계, 오른쪽 더 오래된 활동.
- 입력 항목·필수 표시·기본값: 제안서발송/생성,RebrandingProject생성Feb8 6:39,Updatecompanyguideline완료Feb7 12:48.시간합계 유지.
- 버튼·메뉴·안내 문구: 활동 링크,스크롤.
- 확인된 상태: 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다.
- 단계 간 변화: 더 아래 활동 내역을 확인한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 통합 활동 피드의 대상 종류를 확인한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 이력 보관기간·더보기·권한·삭제 후표시는 미확인.

#### 모델링 영향

- 후보와 근거: 다형적 활동 대상 참조와 사용자/사업체 표시 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 전체 이력 보관기간·더보기·권한·삭제 후표시는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다. — Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다. | 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다. |
| 02 | 한 일정 위치에 계약과 인보이스 요약이 함께 보인다. — CONTRACT SENT Design Contract, Drafted Feb8 2024; INVOICE DRAFTED Invoice#1001,Total$70.04,IssuedFeb7 2024. | 날짜 기준·클릭 이동·중첩 아이콘 정렬은 미확인. |
| 03 | 동일 문구·시각의 완료 활동이2번 보인다. — USD,Last6Months;Outstanding0,Overdue0,Paid&Pending0,OtherIncome460;ReviewUXdesign dueFeb4;활동에 DesignProposal 완료2행,폼응답/발송. | 활동 중복 원인·요약 집계 범위 미확인. |
| 04 | 월별 수치가 명시된다. — Feb24 Totals:Paid$100,Expenses-$190,Profit-$90. 아래 요약 Paid&Pending0/OtherIncome460 유지. | 요약0/460과의 차이·실제 거래 범위는 미확인. |
| 05 | WorkflowPlus에서 비용 자동화 홍보로 바뀌었다. — Automate your business expense tracking 설명;재무 값 유지. | 자동 순환/사용자 조작 여부 미확인. |
| 06 | 복원 이벤트가 직접 표시된다. 제안서 보관 플로우에 없던 후속 상태의 근거다. — Unbilled08:01:16/$160.42,Billed01:00:07/$20.04. 계약생성6:51/서명6:52/발송6:53,제안서보관6:45/복원6:46 등. | 복원 클릭 UI·고객 접근 유지·표시 주체 JoeDoe/JoeStudio 차이는 미확인. |
| 07 | 일별 시간/금액을 별도로 보여준다. — ThuFeb08:Billed00:00:00,Unbilled06:00:00,BilledAmount0,UnbilledAmount120;전체 합계는 유지. | 시간대·비청구 시간 포함·시급 변경 재계산은 미확인. |
| 08 | 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다. — 제안서발송/생성,RebrandingProject생성Feb8 6:39,Updatecompanyguideline완료Feb7 12:48.시간합계 유지. | 전체 이력 보관기간·더보기·권한·삭제 후표시는 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

계약 Drafted와 청구서 #1001 Drafted $70.04를 타임라인에서 구분한다. 시간 전체 합계는 Unbilled 08:01:16/$160.42, Billed 01:00:07/$20.04이고 Feb 8 일별 값 6시간/$120와 범위가 다르다. 손익 요약과 Feb 24 툴팁의 금액 차이, 중복 표시된 활동의 원인은 미확인이다.

### 업무 규칙과 연결 시 주의점

- [관찰] 문서별 SENT/DRAFTED와 날짜·금액을 타임라인에서 요약한다.
- [관찰] Paid & Pending/Other Income 합계와 월별 그래프 수치가 동시에 보이지만 집계 범위 차이는 확인하지 못했다.
- [관찰] 활동에는 계약 생성/작성자 서명/발송 및 제안서 수락/보관/복원이 별도 사건으로 남는다.
- [문서] 청구된 시간과 결제 완료는 다른 개념이다. 그래프 Billed를 Paid로 해석하지 않는다.
- [미확인] 반복된 작업 완료 활동2행의 원인이 중복 로그인지 재완료인지 알 수 없다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S003 공통 대조](<../../SOURCES.md#s003>)에 기록했다.
- [수입·결제 범주](https://help.hellobonsai.com/en/articles/1202116-understanding-payment-categories-outstanding-overdue-pending-and-paid): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S041 공통 대조](<../../SOURCES.md#s041>)에 기록했다.
- [현재 홈 대시보드 도움말](https://help.hellobonsai.com/en/articles/16785043-customize-your-home-dashboard): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S042 공통 대조](<../../SOURCES.md#s042>)에 기록했다.
- [시간 청구 상태](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S043 공통 대조](<../../SOURCES.md#s043>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 개별 업무 레코드와 조회용 기간/통화/권한별 집계를 분리할 후보.
- 활동 이벤트의 주체·대상·종류·시각·문서/메일 참조와 일관된 시간대 후보.
- 시간은 원시 초 단위와 청구 여부·금액을 구분하고 재무 집계의 원장/문서 출처를 추적할 후보.

### 단계별 모델링 근거

- 단계 01: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다.
- 단계 02: 프로젝트-문서 참조와 일정용 이벤트 집계 후보.
- 단계 03: 통합 활동과 기능별 집계 후보.
- 단계 04: 집계 기간과 원장 출처를 가진 재무 시계열 후보.
- 단계 05: 홍보 UI 상태와 계좌 연결 상태 구분.
- 단계 06: 시간 원시값·청구금액,문서 활동 이력 후보.
- 단계 07: 기간별시간 집계와 금액 계산 근거 후보.
- 단계 08: 다형적 활동 대상 참조와 사용자/사업체 표시 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 월별 Paid100/Expenses190/Profit-90과 요약 Paid0/Other460의 포함 기준·기간·통화를 확인한다. Dashboard 활동에서 확인된 제안서 복원은 보관 하위 흐름의 미수록 복원 결과를 보강하지만 복원 조작 UI는 추가 확인한다.

- 월별 Paid100/Expenses190/Profit-90과 요약 Paid0/Other460의 포함 기준·기간·통화를 확인한다.
- Dashboard 활동에서 확인된 제안서 복원은 보관 하위 흐름의 미수록 복원 결과를 보강하지만 복원 조작 UI는 추가 확인한다.
- Timeline 날짜 범위/아이콘 집계·클릭 목적지·Task 노출 기준·시간 통계 범위를 확인한다.
- 사용자 역할별 재무 가시성·활동 중복/정렬/페이지 로드·홍보 카드 개인화를 확인한다.

### 단계별 미확인 사항

- 단계 01: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.
- 단계 02: 날짜 기준·클릭 이동·중첩 아이콘 정렬은 미확인.
- 단계 03: 활동 중복 원인·요약 집계 범위 미확인.
- 단계 04: 요약0/460과의 차이·실제 거래 범위는 미확인.
- 단계 05: 자동 순환/사용자 조작 여부 미확인.
- 단계 06: 복원 클릭 UI·고객 접근 유지·표시 주체 JoeDoe/JoeStudio 차이는 미확인.
- 단계 07: 시간대·비청구 시간 포함·시급 변경 재계산은 미확인.
- 단계 08: 전체 이력 보관기간·더보기·권한·삭제 후표시는 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 8단계 ID·순서·원본 URL 재조회 및 이미지 8/8단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
