# Adding a new invoice 플로우 분석

최신 검토: **R4 전체 단계 구성·상태 대조 8/8 · 동일 재현 세부 명세 미완** (2026-11-22 KST). 장당 720×450 비교 시트로 직접 대조했다. 요소별 전수 확대·픽셀 일치 판정은 아니다. [기준](<../../../SOURCE_ANALYSIS_STANDARD.md>) · [결과](<../../../SOURCE_ANALYSIS_REVIEW.md>) · [원본 색인](<../../../SOURCE_ANALYSIS_INDEX.json>).

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **8/8단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/8단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-18f62aba-c34e-486a-b2b8-099fcf9ba779>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `18f62aba-c34e-486a-b2b8-099fcf9ba779` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=18f62aba-c34e-486a-b2b8-099fcf9ba779) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 8단계 / 8단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

고객·프로젝트를 선택하고 2주 간격·종료일이 있는 구독형 인보이스 초안을 만든다.

- Dashboard에서 New Invoice 모달로 시작한다.
- Single→Subscription 유형 전환에 따라 주기와 종료 조건이 나타난다.
- 생성 후 편집 화면에서 목록으로 돌아간다. 발송·자동 결제 완료 플로우는 아니다.

- 상위 흐름: [Invoices](../ANALYSIS.md)
- 하위 흐름: [Record payment](Record%20payment/ANALYSIS.md), [Enable auto-sending](Enable%20auto-sending/ANALYSIS.md), [Preview invoice](Preview%20invoice/ANALYSIS.md), [Editing invoice header](Editing%20invoice%20header/ANALYSIS.md), [Adding unbilled time](Adding%20unbilled%20time/ANALYSIS.md), [Editing an item](Editing%20an%20item/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Invoices/Adding a new invoice`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **전역 신규 생성 메뉴**이다. Client 항목이 초록으로 강조됨. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **인보이스 목록과 결제 연결 안내**이다. 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Invoices](<../ANALYSIS.md>), [Adding unbilled time](<Adding unbilled time/ANALYSIS.md>), [Editing an item](<Editing an item/ANALYSIS.md>), [Editing invoice header](<Editing invoice header/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_40ff225f161846249b5cf8c2c55423b6`](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [전역 신규 생성 메뉴](<screens/01_sc_40ff225f161846249b5cf8c2c55423b6.png>) | 새 단일 인보이스 모달 — 데모 고객이 선택된 생성 폼. |
| 02 | [`sc_189567faf57a4b47ae03222be1dd2ae6`](https://gummble.com/screens/sc_189567faf57a4b47ae03222be1dd2ae6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 단일 인보이스 모달](<screens/02_sc_189567faf57a4b47ae03222be1dd2ae6.png>) | 구독 청구 유형과 주기 — 반복 관련 입력이 조건부 노출. |
| 03 | [`sc_225db5e23d1c4dee96ec5e48999ea0f5`](https://gummble.com/screens/sc_225db5e23d1c4dee96ec5e48999ea0f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [구독 청구 유형과 주기](<screens/03_sc_225db5e23d1c4dee96ec5e48999ea0f5.png>) | 일반 고객과 프로젝트 선택 — 일반 고객 선택 상태. |
| 04 | [`sc_d7d27c29f8424e8db943e94d1b1c636f`](https://gummble.com/screens/sc_d7d27c29f8424e8db943e94d1b1c636f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [일반 고객과 프로젝트 선택](<screens/04_sc_d7d27c29f8424e8db943e94d1b1c636f.png>) | 구독 종료일 지정 — 작성 완료, 생성 전. |
| 05 | [`sc_6dd7b5296fed46079b5dc202afe5a64a`](https://gummble.com/screens/sc_6dd7b5296fed46079b5dc202afe5a64a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [구독 종료일 지정](<screens/05_sc_6dd7b5296fed46079b5dc202afe5a64a.png>) | 구독 인보이스 초안 편집 상단 — 초안. 빈 항목명·수량1·단가/합계0. 미청구 시간 안내가 존재. |
| 06 | [`sc_aa221ac7066a427db6aae5b18f0acab4`](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [구독 인보이스 초안 편집 상단](<screens/06_sc_aa221ac7066a427db6aae5b18f0acab4.png>) | 인보이스 하단 노트와 첨부 — 금액0 초안이며 첨부는 없음. |
| 07 | [`sc_9bb31a1abe7f42209f1ba327ab976a0c`](https://gummble.com/screens/sc_9bb31a1abe7f42209f1ba327ab976a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [인보이스 하단 노트와 첨부](<screens/07_sc_9bb31a1abe7f42209f1ba327ab976a0c.png>) | 인보이스 목록과 결제 연결 안내 — 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점. |
| 08 | [`sc_21f42247e22948b3b35d5313e9e315a5`](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [인보이스 목록과 결제 연결 안내](<screens/08_sc_21f42247e22948b3b35d5313e9e315a5.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 전역 신규 생성 메뉴

- Screen ID: `sc_40ff225f161846249b5cf8c2c55423b6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de124575-8e10-4abd-baeb-f678b6805b52.png)
- 로컬 이미지: [01_sc_40ff225f161846249b5cf8c2c55423b6.png](<screens/01_sc_40ff225f161846249b5cf8c2c55423b6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 005, 고유 이미지 S017, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_189567faf57a4b47ae03222be1dd2ae6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단+New 아래 오른쪽 세로 드롭다운.
- 입력 항목·필수 표시·기본값: 입력 항목 없음.
- 버튼·메뉴·안내 문구: Client, Project, Invoice, Proposal, Contract, Form, Expense.
- 확인된 상태: Client 항목이 초록으로 강조됨.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 고객 외 여러 업무 생성 진입이 공통 메뉴에 모여 있다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할·요금제별 항목 노출·키보드 이동.

#### 모델링 영향

- 후보와 근거: 공통 생성 메뉴와 각 업무 폼 분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 역할·요금제별 항목 노출·키보드 이동. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 단일 인보이스 모달

- Screen ID: `sc_189567faf57a4b47ae03222be1dd2ae6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_189567faf57a4b47ae03222be1dd2ae6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1335c9b7-b8e4-43d5-bf8b-8ae5c412bccc.png)
- 로컬 이미지: [02_sc_189567faf57a4b47ae03222be1dd2ae6.png](<screens/02_sc_189567faf57a4b47ae03222be1dd2ae6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 087, 고유 이미지 S348, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_40ff225f161846249b5cf8c2c55423b6` → 현재 → `sc_225db5e23d1c4dee96ec5e48999ea0f5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 New Invoice, 어두운 Dashboard 배경, 외곽 X와 하단 지원 링크.
- 입력 항목·필수 표시·기본값: Invoice Type Single Invoice, Client Sample Client, Project Consulting Project. 별표 없음.
- 버튼·메뉴·안내 문구: Create Invoice. Sample Client에 보내면 자동 paid 처리된다는 노란 안내.
- 확인된 상태: 데모 고객이 선택된 생성 폼.
- 단계 간 변화: New Invoice 모달에 Single Invoice와 Sample Client/Consulting Project가 표시된다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 고객·프로젝트·유형을 선택하는 초기 단계. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 초기 선택이 최근 사용값인지 시스템 기본값인지 미확인.

#### 모델링 영향

- 후보와 근거: 문서 생성 입력·데모 고객 플래그·프로젝트 연결 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 초기 선택이 최근 사용값인지 시스템 기본값인지 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 구독 청구 유형과 주기

- Screen ID: `sc_225db5e23d1c4dee96ec5e48999ea0f5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_225db5e23d1c4dee96ec5e48999ea0f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/265f4058-4534-4188-8dca-a8536107ddd9.png)
- 로컬 이미지: [03_sc_225db5e23d1c4dee96ec5e48999ea0f5.png](<screens/03_sc_225db5e23d1c4dee96ec5e48999ea0f5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 088, 고유 이미지 S349, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_189567faf57a4b47ae03222be1dd2ae6` → 현재 → `sc_d7d27c29f8424e8db943e94d1b1c636f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달 높이가 늘고 유형 옆 주기, 하단 종료 선택이 추가.
- 입력 항목·필수 표시·기본값: Subscription Inv…로 생략 표시, Every two weeks, Sample Client, Consulting Project, Invoice Until I manually stop it.
- 버튼·메뉴·안내 문구: Create Invoice, X. 데모 자동 지급 안내 유지.
- 확인된 상태: 반복 관련 입력이 조건부 노출.
- 단계 간 변화: Subscription 유형 및 Every two weeks 선택으로 종료조건이 추가된다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 단일 청구와 달리 주기·종료 방식 설정이 필요함. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 유형 전체 선택지·주기 모든 옵션·결제동의 미확인.

#### 모델링 영향

- 후보와 근거: 구독/반복 유형과 주기·종료 조건 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 유형 전체 선택지·주기 모든 옵션·결제동의 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 일반 고객과 프로젝트 선택

- Screen ID: `sc_d7d27c29f8424e8db943e94d1b1c636f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d7d27c29f8424e8db943e94d1b1c636f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b34d9954-994e-4cf9-a7af-816ed654d98f.png)
- 로컬 이미지: [04_sc_d7d27c29f8424e8db943e94d1b1c636f.png](<screens/04_sc_d7d27c29f8424e8db943e94d1b1c636f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 088, 고유 이미지 S350, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_225db5e23d1c4dee96ec5e48999ea0f5` → 현재 → `sc_6dd7b5296fed46079b5dc202afe5a64a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달에서 데모 안내가 사라지고 높이가 줄었다.
- 입력 항목·필수 표시·기본값: Doe Company, Design Project with Doe Studio, 2주 간격, 수동 종료.
- 버튼·메뉴·안내 문구: Create Invoice와 X.
- 확인된 상태: 일반 고객 선택 상태.
- 단계 간 변화: 고객을 Doe Company, 프로젝트를 Design Project with Doe Studio로 바꾼다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 고객 변경과 프로젝트 선택이 함께 보인다. 자동 선택인지 수동 변경인지 미확인. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객-프로젝트 필터링·고객 변경 시 초안값 초기화 규칙 미확인.

#### 모델링 영향

- 후보와 근거: 고객별 프로젝트 선택 관계·유효 조합 검증 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 고객-프로젝트 필터링·고객 변경 시 초안값 초기화 규칙 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 구독 종료일 지정

- Screen ID: `sc_6dd7b5296fed46079b5dc202afe5a64a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6dd7b5296fed46079b5dc202afe5a64a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b447a014-97b0-4942-9e7e-2c5a77fa7fb5.png)
- 로컬 이미지: [05_sc_6dd7b5296fed46079b5dc202afe5a64a.png](<screens/05_sc_6dd7b5296fed46079b5dc202afe5a64a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 088, 고유 이미지 S351, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d7d27c29f8424e8db943e94d1b1c636f` → 현재 → `sc_aa221ac7066a427db6aae5b18f0acab4`

#### 화면에서 직접 확인한 내용

- 레이아웃: Invoice Until 행이 종료 방식과 날짜 두 입력으로 나뉜다.
- 입력 항목·필수 표시·기본값: A specific date, Mar21 2024. 나머지 고객·프로젝트·주기 유지.
- 버튼·메뉴·안내 문구: Create Invoice, X. 날짜 선택 달력은 닫혀 있음.
- 확인된 상태: 작성 완료, 생성 전.
- 단계 간 변화: Invoice Until을 특정 날짜 Mar21 2024로 변경한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 무기한 수동 종료에서 날짜 기반 종료로 변경. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 필수·과거날짜 검증·종료일 포함 여부 미확인.

#### 모델링 영향

- 후보와 근거: 반복 종료 조건 종류와 nullable 종료일 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 날짜 필수·과거날짜 검증·종료일 포함 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 구독 인보이스 초안 편집 상단

- Screen ID: `sc_aa221ac7066a427db6aae5b18f0acab4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00abe9ef-b389-490a-a2c9-6f9bbf1b2064.png)
- 로컬 이미지: [06_sc_aa221ac7066a427db6aae5b18f0acab4.png](<screens/06_sc_aa221ac7066a427db6aae5b18f0acab4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 088, 고유 이미지 S352, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6dd7b5296fed46079b5dc202afe5a64a` → 현재 → `sc_9bb31a1abe7f42209f1ba327ab976a0c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 문서 작업바, 중앙 흰 종이, 오른쪽 Overview/Setup/Payments. 일반 사이드바 숨김.
- 입력 항목·필수 표시·기본값: Drafted $0.00, #1001, Feb7 발행·Mar8 만기, 2주 반복·Mar21 종료. From Joe Doe/Joe Studio, To Jane Doe/Doe Company, 주소 placeholder. Logo on, Late Fee off, Tax ID on.
- 버튼·메뉴·안내 문구: Preview, Automation, Send Now와 달력, …, Add Recipient, Unbilled Hours 안내 닫기, Advanced Settings Edit, Enable Online Payments.
- 확인된 상태: 초안. 빈 항목명·수량1·단가/합계0. 미청구 시간 안내가 존재.
- 단계 간 변화: 초안 #1001 편집 화면으로 이동한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 구독 설정이 Overview에 반영되고 청구서가 생성됐다. 시간은 자동 포함되지 않았다는 안내. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 헤더·수신자·항목·세금표시·초안 상태·미청구 원천 연결 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 인보이스 하단 노트와 첨부

- Screen ID: `sc_9bb31a1abe7f42209f1ba327ab976a0c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9bb31a1abe7f42209f1ba327ab976a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/03a1b289-4eef-4955-8588-9e8eeb60e95f.png)
- 로컬 이미지: [07_sc_9bb31a1abe7f42209f1ba327ab976a0c.png](<screens/07_sc_9bb31a1abe7f42209f1ba327ab976a0c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 089, 고유 이미지 S353, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_aa221ac7066a427db6aae5b18f0acab4` → 현재 → `sc_21f42247e22948b3b35d5313e9e315a5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 본문 하단으로 스크롤, 오른쪽 Overview와 설정 패널은 유지.
- 입력 항목·필수 표시·기본값: Tax0.0%, Total$0USD, Tax ID 회색123456789, Notes 회색Thank you for your business.
- 버튼·메뉴·안내 문구: Add Expenses, Enable Online Payments, 통화 드롭다운, Add File Attachment.
- 확인된 상태: 금액0 초안이며 첨부는 없음.
- 단계 간 변화: 문서 하단의 세금·메모·첨부 영역으로 스크롤한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 세금/비용/노트/첨부가 문서 본문에 들어갈 수 있음. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 회색 예시가 placeholder인지 저장값인지, 파일제한·외부공유 정책 미확인.

#### 모델링 영향

- 후보와 근거: 첨부·문서노트·통화·비용 링크와 표시 설정 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 회색 예시가 placeholder인지 저장값인지, 파일제한·외부공유 정책 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 인보이스 목록과 결제 연결 안내

- Screen ID: `sc_21f42247e22948b3b35d5313e9e315a5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/350ed68e-021e-4ff8-9e83-3c90f3405098.png)
- 로컬 이미지: [08_sc_21f42247e22948b3b35d5313e9e315a5.png](<screens/08_sc_21f42247e22948b3b35d5313e9e315a5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 089, 고유 이미지 S354, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9bb31a1abe7f42209f1ba327ab976a0c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 사이드바·상단 전역바, Invoices/Settings/Default Values 탭. 결제 홍보 패널 아래 검색과 표.
- 입력 항목·필수 표시·기본값: 한 행 #1001, 발행 Feb07 2024·만기 Mar08 2024, Doe Company/Design Project with Doe Studio, Total/Paid $0.00. 검색 비어 있음.
- 버튼·메뉴·안내 문구: Cards/Bank Transfer/PayPal 꺼진 토글, 안내 닫기, Filters, Edit Payment Methods, New Invoice, 행 … 및 정렬 아이콘.
- 확인된 상태: 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점.
- 단계 간 변화: 목록에 #1001 $0.00 문서가 보인다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 문서 금액과 수납액이 별도이며 발행일과 만기일도 분리된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 점 색상 의미·필터조건·결제연결 요구사항 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 요약 목록·반복 시리즈·결제수단 구성 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 점 색상 의미·필터조건·결제연결 요구사항 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.


<a id="source-review-r4"></a>
### 원본 재현 대조 (R4 · 2026-11-22)

검토 범위: 이 흐름의 8단계 모두를 순서대로 직접 보고 기존 레이아웃·입력·버튼·상태 설명과 대조했다. 장당 720×450 비교 시트를 사용했으며, 아래는 재확인 및 보완 관찰이다. 모든 항목이 새 오류나 새 누락이라는 뜻은 아니다. 정밀 치수·전체 문구 전사·요소별 대응표의 완결은 별도다.

- 02–05: 유형·고객·종료 방식에 따라 모달 높이와 필드가 바뀐다. Sample Client의 노란 자동 paid 안내는 Doe Company 선택 뒤 사라지고 종료 날짜는 A specific date에서만 보인다.
- 06–07: 편집기 문서 영역과 Overview/Setup/Payments 패널을 분리한다. 본문 스크롤 뒤에도 상단 작업바와 오른쪽 설정이 보이며 미청구 시간 안내는 닫기 제어를 가진다.
- 08: 목록 행에는 반복 아이콘·회색 점과 0 금액이 보인다. 생성 완료를 발송·결제 완료로 확장하지 않는다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | Client 항목이 초록으로 강조됨. — 입력 항목 없음. | 역할·요금제별 항목 노출·키보드 이동. |
| 02 | 데모 고객이 선택된 생성 폼. — Invoice Type Single Invoice, Client Sample Client, Project Consulting Project. 별표 없음. | 초기 선택이 최근 사용값인지 시스템 기본값인지 미확인. |
| 03 | 반복 관련 입력이 조건부 노출. — Subscription Inv…로 생략 표시, Every two weeks, Sample Client, Consulting Project, Invoice Until I manually stop it. | 유형 전체 선택지·주기 모든 옵션·결제동의 미확인. |
| 04 | 일반 고객 선택 상태. — Doe Company, Design Project with Doe Studio, 2주 간격, 수동 종료. | 고객-프로젝트 필터링·고객 변경 시 초안값 초기화 규칙 미확인. |
| 05 | 작성 완료, 생성 전. — A specific date, Mar21 2024. 나머지 고객·프로젝트·주기 유지. | 날짜 필수·과거날짜 검증·종료일 포함 여부 미확인. |
| 06 | 초안. 빈 항목명·수량1·단가/합계0. 미청구 시간 안내가 존재. — Drafted $0.00, #1001, Feb7 발행·Mar8 만기, 2주 반복·Mar21 종료. From Joe Doe/Joe Studio, To Jane Doe/Doe Company, 주소 placeholder. Logo on, Late Fee off, Tax ID on. | 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인. |
| 07 | 금액0 초안이며 첨부는 없음. — Tax0.0%, Total$0USD, Tax ID 회색123456789, Notes 회색Thank you for your business. | 회색 예시가 placeholder인지 저장값인지, 파일제한·외부공유 정책 미확인. |
| 08 | 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점. — 한 행 #1001, 발행 Feb07 2024·만기 Mar08 2024, Doe Company/Design Project with Doe Studio, Total/Paid $0.00. 검색 비어 있음. | 점 색상 의미·필터조건·결제연결 요구사항 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

처음에는 Sample Client의 Single Invoice로 시작하며 샘플 발송 시 자동 지급된다는 노란 안내가 있다. 이후 Subscription·2주 반복·Doe Company/Design Project·Mar 21 종료가 선택된다. Drafted #1001의 Total/Paid는 모두 0이며 반복 아이콘은 수금 증거가 아니다. 회색 주소·Tax ID·감사 문구는 실제 저장값과 구분한다.

### 업무 규칙과 연결 시 주의점

- [관찰] Sample Client 안내는 발송 시 자동 Paid로 처리되는 데모 동작이며 일반 고객으로 확장하지 않는다.
- [관찰] 생성 결과 Drafted이며 금액0, Every 2 Weeks, Repeat Until Mar21. 발송 전 이미 초안이 목록에 존재한다.
- [관찰] 발행 Feb7·만기 Mar8. 반복 간격과 결제 만기는 서로 다른 시간 규칙이다.
- [문서] 반복 생성·자동 발송·구독 결제 동의는 각각 확인해야 한다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): R2 본문 대조 기록(S054). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [인보이스 생성 도움말](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice): R2 본문 대조 기록(S056). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [반복과 구독 청구](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices): R2 본문 대조 기록(S057). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 인보이스 초안, 반복 시리즈/주기/종료 조건, 고객/프로젝트/수신자 연결 후보.
- 발행일·만기일·반복 종료일을 분리하고 돈의 통화·소수 정확도를 보존할 후보.
- 고객 주소/연락처 참조와 발행 당시 문서 표시값의 동기화 정책은 미확정.

### 단계별 모델링 근거

- 단계 01: 공통 생성 메뉴와 각 업무 폼 분리.
- 단계 02: 문서 생성 입력·데모 고객 플래그·프로젝트 연결 후보.
- 단계 03: 구독/반복 유형과 주기·종료 조건 후보.
- 단계 04: 고객별 프로젝트 선택 관계·유효 조합 검증 후보.
- 단계 05: 반복 종료 조건 종류와 nullable 종료일 후보.
- 단계 06: 인보이스 헤더·수신자·항목·세금표시·초안 상태·미청구 원천 연결 후보.
- 단계 07: 첨부·문서노트·통화·비용 링크와 표시 설정 후보.
- 단계 08: 인보이스 요약 목록·반복 시리즈·결제수단 구성 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 종료일을 포함하는지, 월말·시간대·주말에 반복 생성이 어떻게 되는지 재현이 필요하다. 발행 후 고객명·주소 변경이 과거 문서에 반영되는지 확인해야 스냅샷 정책을 결정할 수 있다.

- 종료일을 포함하는지, 월말·시간대·주말에 반복 생성이 어떻게 되는지 재현이 필요하다.
- 발행 후 고객명·주소 변경이 과거 문서에 반영되는지 확인해야 스냅샷 정책을 결정할 수 있다.
- 0원 문서 발송·구독 허용 여부와 생성 실패·중복 제출 처리를 확인한다.

### 단계별 미확인 사항

- 단계 01: 역할·요금제별 항목 노출·키보드 이동.
- 단계 02: 초기 선택이 최근 사용값인지 시스템 기본값인지 미확인.
- 단계 03: 유형 전체 선택지·주기 모든 옵션·결제동의 미확인.
- 단계 04: 고객-프로젝트 필터링·고객 변경 시 초안값 초기화 규칙 미확인.
- 단계 05: 날짜 필수·과거날짜 검증·종료일 포함 여부 미확인.
- 단계 06: 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인.
- 단계 07: 회색 예시가 placeholder인지 저장값인지, 파일제한·외부공유 정책 미확인.
- 단계 08: 점 색상 의미·필터조건·결제연결 요구사항 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **결과**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 문서 유형·반복 주기·종료일·발행일·만기를 구분한다. 초안 생성 이후 발송·반복 발생·자동 청구는 별도 시나리오가 필요하다.
- [이 흐름의 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-18f62aba-c34e-486a-b2b8-099fcf9ba779>)와 [공통 웹 상태·연결 기준](<../../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.


### 동일 재현을 위한 남은 분석 (R4)

- 날짜 선택 팝업·주기/종료 옵션 전체와 자동 저장 시점은 원본에 없다. Tax ID의 본문 예시와 설정 입력 예시를 동일 실제값으로 합치지 않으며, 문서 레이아웃·헤더 자산을 별도 명세해야 한다.
- 공통 미완: 요소별 누락 검사, 정확한 배치·타이포그래피·색/장식·자산 대응·미노출 상태는 [12개 검토 항목](<../../../SOURCE_ANALYSIS_STANDARD.md>)으로 추가 명세한다. 원본에 없는 동작은 관찰 사실과 분리한다. 이 문서의 R4 표시를 동일 재현 명세나 FE 구현 완료로 읽지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 8단계 ID·순서·원본 URL 재조회 및 이미지 8/8단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 8단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/8단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |
| R4 원본 재현 감사 | 2026-11-22 KST | 8단계 전체 구성·상태 직접 대조 (장당 720×450 비교 시트); 4절 보완 관찰·8절 남은 명세, 선택 확대 0영역 기록 | 요소별 정밀 대조·시각 명세 완결·미수록 동작·TODO 대응·FE 구현 검증 |
