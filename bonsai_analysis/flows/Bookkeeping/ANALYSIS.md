# Bookkeeping 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **7/7단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `05c04967-f1be-4b73-b6e5-af6199228187` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=05c04967-f1be-4b73-b6e5-af6199228187) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 7단계 / 7단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

운영자가 장부의 손익 개요, 수입 목록, 비용 시작 안내와 등록 목록, 분류 관리 화면을 탐색한다. 단일 생성 업무의 완결 기록이 아니라 여러 상태와 진입점을 보여주는 상위 플로우다.

- 행위자: 로그인한 내부 사용자로 보인다. 구체 역할과 재무 권한은 미확인.
- 시작: 대시보드와 사이드바 Bookkeeping 메뉴. 종료: 비용 카테고리 관리 화면.
- 연결: 수입 삭제, 장부 개요, 비용 분류 추가·일괄 편집·다운로드·필터·은행 연결·반복 비용 하위 흐름.
- 프론트 구현: 앱 공통 프레임, 탭 선택, 빈 상태 CTA, 테이블, 더보기 팝오버, 분류 목록을 구분한다.

- 하위 플로우: [Deleting an income](Deleting%20an%20income/ANALYSIS.md), [Bookkeeping overview](Bookkeeping%20overview/ANALYSIS.md), [Adding a bookkeeping category](Adding%20a%20bookkeeping%20category/ANALYSIS.md), [Bulk editing expenses](Bulk%20editing%20expenses/ANALYSIS.md), [Downloading expenses](Downloading%20expenses/ANALYSIS.md), [Filtering expenses](Filtering%20expenses/ANALYSIS.md), [Connect bank account](Connect%20bank%20account/ANALYSIS.md), [Adding a recurring expense](Adding%20a%20recurring%20expense/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 — 프로젝트 타임라인과 손익 요약 | 대시보드에서 Bookkeeping Overview로 화면이 전환된다. |
| 02 | [`sc_e5796a038be54dbea1a32dd215a1cbb6`](https://gummble.com/screens/sc_e5796a038be54dbea1a32dd215a1cbb6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bookkeeping Overview | Overview에서 Income 탭 활성 목록으로 바뀐다. |
| 03 | [`sc_4eb809c84e384bc98dd5ee91561a1483`](https://gummble.com/screens/sc_4eb809c84e384bc98dd5ee91561a1483?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bookkeeping Income 목록 | Income에서 Expenses 시작 안내로 바뀐다. |
| 04 | [`sc_caa5fecb95834209b2da82d078b11ebb`](https://gummble.com/screens/sc_caa5fecb95834209b2da82d078b11ebb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 시작 안내 | 시작 안내에서 비용 세 건 목록으로 바뀐다. 중간 등록 과정은 생략돼 있다. |
| 05 | [`sc_762c1f934fdf40c0a61898b036cf4616`](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 등록 목록 | 세 건 목록에서 한 건과 더보기 메뉴로 바뀐다. 감소 원인은 미확인. |
| 06 | [`sc_b0236381fd3c41b5b432fea9dcc43093`](https://gummble.com/screens/sc_b0236381fd3c41b5b432fea9dcc43093?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 전체 작업 메뉴 | 더보기의 Manage Categories와 대응하는 분류 관리 화면이 나타난다. |
| 07 | [`sc_f0127ee4970e49ffbd910ddfac504812`](https://gummble.com/screens/sc_f0127ee4970e49ffbd910ddfac504812?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 카테고리 관리 | 분류 관리 화면에서 기록 종료. 생성·수정 완료 증거는 아니다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_e5796a038be54dbea1a32dd215a1cbb6`

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

### 단계 02 — Bookkeeping Overview

- Screen ID: `sc_e5796a038be54dbea1a32dd215a1cbb6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e5796a038be54dbea1a32dd215a1cbb6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ff5d860-6882-40cc-b2ba-86a55023ede9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_4eb809c84e384bc98dd5ee91561a1483`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 앱 프레임. Overview/Expenses/Income 탭, 날짜 범위와 통화, 좌측 손익 그래프·집계, 우측 연동 및 보고서.
- 입력 항목·필수 표시·기본값: 범위 Jan 1–Feb 6 2024, 통화 USD. 샘플 값은 설정 기본값으로 확정하지 않는다.
- 버튼·메뉴·안내 문구: QuickBooks Connect Account, Profit & Loss Statement, Invoices CSV, Expenses CSV, View Expenses, Edit Categories.
- 확인된 상태: Other Income 160, Expenses 165, Profit -5가 함께 보이며 수입·지출 그래프가 존재한다.
- 단계 간 변화: 대시보드에서 Bookkeeping Overview로 화면이 전환된다.

#### 동작과 데이터

- 화면 관찰: 수입·비용과 손익을 별도 집계한다. 외부 연동 성공이나 CSV 다운로드 내용은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미수금 포함 여부, 집계 기준일·통화 변환·비용의 세금 처리.

#### 모델링 영향

- 후보와 근거: 수입·비용 분리, 통화·기간별 집계, 외부 회계 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Bookkeeping Income 목록

- Screen ID: `sc_4eb809c84e384bc98dd5ee91561a1483`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4eb809c84e384bc98dd5ee91561a1483?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9c1003e3-a5a5-4c9b-a5ae-6f5e7e1a74e6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e5796a038be54dbea1a32dd215a1cbb6` → 현재 → `sc_caa5fecb95834209b2da82d078b11ebb`

#### 화면에서 직접 확인한 내용

- 레이아웃: Income 탭 활성. 상단 체험 종료 배너, Learn More와 New Income, 단일 수입 행의 테이블.
- 입력 항목·필수 표시·기본값: Name / Amount / Date / Tax 열. 샘플 행은 Payout from Upwork, 100 USD, Feb 1 2024, Pre-Tax.
- 버튼·메뉴·안내 문구: New Income, Learn More, 행 우측 더보기.
- 확인된 상태: 수입이 한 건 존재하며 반복 형태의 아이콘이 이름 앞에 보인다. 오류·빈 목록은 없다.
- 단계 간 변화: Overview에서 Income 탭 활성 목록으로 바뀐다.

#### 동작과 데이터

- 화면 관찰: 이전 Overview에서 Income 목록으로 바뀐다. 수입 이름·금액·날짜·세금 구분이 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 반복 아이콘의 정확한 규칙과 수입 원장·입금의 관계.

#### 모델링 영향

- 후보와 근거: 수입 항목, 통화 금액, 업무 날짜, 세금 처리 구분과 반복 일정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Expenses 시작 안내

- Screen ID: `sc_caa5fecb95834209b2da82d078b11ebb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_caa5fecb95834209b2da82d078b11ebb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/743f19e0-95db-4c51-a9c3-ac7f79c96cec.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4eb809c84e384bc98dd5ee91561a1483` → 현재 → `sc_762c1f934fdf40c0a61898b036cf4616`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 큰 좌우 분할 안내 카드. 왼쪽 은행·비용 예시 일러스트, 오른쪽 설명과 세로 CTA.
- 입력 항목·필수 표시·기본값: 실제 비용 입력 폼은 없고 안내용 예시 카드만 있다.
- 버튼·메뉴·안내 문구: Connect Bank Account / Add Expense Manually / Contact Support.
- 확인된 상태: 비용 추적 시작 안내 상태. 실제 등록 비용 목록과 안내용 샘플을 구분해야 한다.
- 단계 간 변화: Income에서 Expenses 시작 안내로 바뀐다.

#### 동작과 데이터

- 화면 관찰: 은행 연결과 수동 등록의 두 진입 경로가 보인다. 연결만으로 비용이 생성되는지는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 어떤 조건에서 안내가 목록으로 전환되는지, 은행 연결의 국가별 지원.

#### 모델링 영향

- 후보와 근거: 은행 연동 상태와 비용 데이터 유무는 별도 UI 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Expenses 등록 목록

- Screen ID: `sc_762c1f934fdf40c0a61898b036cf4616`
- 원본: [화면 페이지](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/549dc499-2f3b-4b0d-9534-73c488617a77.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_caa5fecb95834209b2da82d078b11ebb` → 현재 → `sc_b0236381fd3c41b5b432fea9dcc43093`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 검색·Filters·더보기·New Expense, Name/Date/Category/Amount 테이블.
- 입력 항목·필수 표시·기본값: 비용 세 행, Non-billable 보조 문구, Personal/Advertising 분류 칩과 금액, 영수증·반복처럼 보이는 상태 아이콘.
- 버튼·메뉴·안내 문구: 검색, Filters, New Expense, 목록 및 행의 더보기.
- 확인된 상태: 실데이터가 있는 목록. 이전 시작 안내와 달리 세 비용을 표시한다.
- 단계 간 변화: 시작 안내에서 비용 세 건 목록으로 바뀐다. 중간 등록 과정은 생략돼 있다.

#### 동작과 데이터

- 화면 관찰: 전후 이미지 사이에 등록 과정이 빠져 있다. 앞선 CTA를 누르기만 하면 세 항목이 자동 생성된다고 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아이콘의 정확한 의미, 정렬·검색 범위, 청구 연결과 세금.

#### 모델링 영향

- 후보와 근거: 비용·분류·프로젝트 청구 상태·첨부·반복 관련 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Expenses 전체 작업 메뉴

- Screen ID: `sc_b0236381fd3c41b5b432fea9dcc43093`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b0236381fd3c41b5b432fea9dcc43093?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c8b02eb4-dd12-42bc-a7bb-c3801107c8e3.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_762c1f934fdf40c0a61898b036cf4616` → 현재 → `sc_f0127ee4970e49ffbd910ddfac504812`

#### 화면에서 직접 확인한 내용

- 레이아웃: 목록 오른쪽 상단 더보기 아래 메뉴가 열려 있다. 본문에는 비용 한 행만 보인다.
- 입력 항목·필수 표시·기본값: 새 입력 항목 없음.
- 버튼·메뉴·안내 문구: Edit Multiple / Import Expenses / Manage Categories / Download CSV / Delete All.
- 확인된 상태: 목록 수준 메뉴 열린 상태. 행 수준 더보기와 구분된다.
- 단계 간 변화: 세 건 목록에서 한 건과 더보기 메뉴로 바뀐다. 감소 원인은 미확인.

#### 동작과 데이터

- 화면 관찰: 이전 세 행에서 한 행으로 바뀐 원인은 기록되지 않았다. 메뉴 노출은 다운로드·삭제 실행 증거가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Delete All의 대상 범위·확인 단계·복구 정책, CSV 필터 반영, 대량 편집 원자성.

#### 모델링 영향

- 후보와 근거: 대량 작업 요청·대상 집합·분류 관리·내보내기 계약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 비용 카테고리 관리

- Screen ID: `sc_f0127ee4970e49ffbd910ddfac504812`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f0127ee4970e49ffbd910ddfac504812?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bca8e895-6ad6-4a2f-a670-7833cad3c3cb.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b0236381fd3c41b5b432fea9dcc43093` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭 안의 분류 관리 화면. All Expenses 복귀 버튼과 New Category, Personal Expenses 설정, 그룹별 카테고리 행.
- 입력 항목·필수 표시·기본값: Personal 비용을 장부와 보고서에 포함하는 체크가 선택됨. Advertising, Cost of Labor, Materials & Supplies 등의 분류에 색과 잠금 아이콘.
- 버튼·메뉴·안내 문구: All Expenses, New Category, 개인 비용 포함 체크박스.
- 확인된 상태: 기존 분류가 있는 목록. 잠금은 보이지만 수정 제한의 정확한 조건은 미확인.
- 단계 간 변화: 더보기의 Manage Categories와 대응하는 분류 관리 화면이 나타난다.

#### 동작과 데이터

- 화면 관찰: 분류 목록과 보고서 포함 설정이 별도 요소로 나타난다. 체크 변경의 저장 시점은 캡처되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잠긴 기본 분류의 수정·삭제 범위, 사용자 분류가 사용 중일 때 삭제 정책.

#### 모델링 영향

- 후보와 근거: 카테고리 그룹·분류·색상·시스템 제공 여부, 개인 비용 집계 포함 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: Overview·Expenses·Income은 같은 Bookkeeping 영역의 탭이다. 실제 DB 테이블 개수를 뜻하지 않는다.
- 관찰: 은행 연동과 수동 등록 진입점이 함께 존재한다. 안내 일러스트의 은행·거래는 실제 연결 데이터와 구분한다.
- 관찰: 목록 수준 Edit Multiple·Delete All과 행별 더보기는 대상 범위가 다를 수 있다. 실행·취소 결과는 이 상위 플로우에서 보이지 않는다.
- 문서 확인: 비용 목록·장부 집계·청구의 금액 의미는 동일하지 않을 수 있다. 아래 금액 문서의 현재 규칙을 구형 캡처 계산에 무조건 적용하지 않는다.
- 미확인: 목록의 비용 건수가 바뀌는 중간 과정, 변경 저장 시점, 접근 권한·내보내기 범위·삭제 복구.

## 6. 공식 도움말과 API 대조

- [비용 금액의 의미](https://help.hellobonsai.com/en/articles/13159534-understanding-expense-amounts-after-tax-pre-tax-and-sales-price): 현재 도움말은 세후 지출·세전 원가·청구 판매가를 구분한다. 이 캡처의 상세 세금·마크업 입력은 없어 화면 금액을 역산하지 않는다.
- [은행 연결로 비용 가져오기](https://help.hellobonsai.com/en/articles/1865131-how-to-connect-a-payment-method-to-import-expenses): 연동 해제와 이미 가져온 비용의 삭제는 별개라는 설명을 확인했다. 이 플로우에는 연결 성공·해제 화면이 없다.
- [공식 API 목록](https://docs.hellobonsai.com/api): 조회한 공개 리소스 목록에서 Bookkeeping·Expense 전용 endpoint는 확인하지 못했다. 제품의 내부 API 부재를 의미하지 않는다. Projects/Invoices API로 비용 저장 구조를 대체 확정하지 않는다.
- 버전 차이: 도움말의 최신 메뉴 경로와 캡처의 Bookkeeping 사이드바가 다를 수 있다. 앱 표기 Latest는 현재 제품 빌드를 보증하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정 — Income / Expense: 이름·업무 날짜·통화 금액·세금 구분·분류를 별도 검토한다. 화면의 수입과 청구 입금을 동일 레코드로 가정하지 않는다.
- 설계 가정 — ExpenseCategory / CategoryGroup: 표시 이름·색상·기본 제공 잠금·정렬·사용자 소유를 후보로 둔다. 잠금만으로 역할 기반 권한을 확정하지 않는다.
- 설계 가정 — BankConnection / ImportSource: 가져오기 연결과 비용 원장 수명을 분리할 근거가 있다. 외부 연결 삭제 시 비용 cascade를 선제 결정하지 않는다.
- 설계 가정 — 재무 집계: 기간·통화·포함 정책을 입력으로 하는 읽기 결과 후보. 모든 통계 카드에 저장 테이블을 만들 필요는 없다.
- 최종 테이블·관계 수·세금 계산·권한·삭제 정책은 기능 간 대조 전 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- Q1. Overview의 기간·통화가 다른 탭과 공유되는가? 실제 계정에서 탭 전환·새로고침 후 비교. 필터 저장 범위에 영향.
- Q2. 개인 비용 포함 체크는 자동 저장되는가? 별도 저장·취소·재진입 관찰 필요. 환경설정 API와 보고서 캐시에 영향.
- Q3. 기본 분류의 잠금은 이름·색상·삭제 중 무엇을 막는가? 분류 편집 플로우와 역할별 계정 비교 필요.
- Q4. Delete All은 검색·필터 결과만 대상으로 하는가? 확인 모달과 실제 테스트 계정에서 대상 범위 검증 필요.
- Q5. 손익 기준은 입금일·발행일·비용일 중 무엇인가? 공식 보고서 문서 및 계정 집계 비교 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 7개와 실제 이미지 7개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
