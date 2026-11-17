# Adding a new invoice 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `18f62aba-c34e-486a-b2b8-099fcf9ba779` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=18f62aba-c34e-486a-b2b8-099fcf9ba779) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

고객·프로젝트를 선택하고 2주 간격·종료일이 있는 구독형 인보이스 초안을 만든다.

- Dashboard에서 New Invoice 모달로 시작한다.
- Single→Subscription 유형 전환에 따라 주기와 종료 조건이 나타난다.
- 생성 후 편집 화면에서 목록으로 돌아간다. 발송·자동 결제 완료 플로우는 아니다.

- 상위 분석: [Invoices](../ANALYSIS.md)
- 하위 플로우: [Record payment](Record%20payment/ANALYSIS.md), [Enable auto-sending](Enable%20auto-sending/ANALYSIS.md), [Preview invoice](Preview%20invoice/ANALYSIS.md), [Editing invoice header](Editing%20invoice%20header/ANALYSIS.md), [Adding unbilled time](Adding%20unbilled%20time/ANALYSIS.md), [Editing an item](Editing%20an%20item/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_40ff225f161846249b5cf8c2c55423b6`](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 전역 신규 생성 메뉴 | New Invoice 모달에 Single Invoice와 Sample Client/Consulting Project가 표시된다. |
| 02 | [`sc_189567faf57a4b47ae03222be1dd2ae6`](https://gummble.com/screens/sc_189567faf57a4b47ae03222be1dd2ae6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 단일 인보이스 모달 | Subscription 유형 및 Every two weeks 선택으로 종료조건이 추가된다. |
| 03 | [`sc_225db5e23d1c4dee96ec5e48999ea0f5`](https://gummble.com/screens/sc_225db5e23d1c4dee96ec5e48999ea0f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 청구 유형과 주기 | 고객을 Doe Company, 프로젝트를 Design Project with Doe Studio로 바꾼다. |
| 04 | [`sc_d7d27c29f8424e8db943e94d1b1c636f`](https://gummble.com/screens/sc_d7d27c29f8424e8db943e94d1b1c636f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 일반 고객과 프로젝트 선택 | Invoice Until을 특정 날짜 Mar21 2024로 변경한다. |
| 05 | [`sc_6dd7b5296fed46079b5dc202afe5a64a`](https://gummble.com/screens/sc_6dd7b5296fed46079b5dc202afe5a64a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 종료일 지정 | 초안 #1001 편집 화면으로 이동한다. |
| 06 | [`sc_aa221ac7066a427db6aae5b18f0acab4`](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 인보이스 초안 편집 상단 | 문서 하단의 세금·메모·첨부 영역으로 스크롤한다. |
| 07 | [`sc_9bb31a1abe7f42209f1ba327ab976a0c`](https://gummble.com/screens/sc_9bb31a1abe7f42209f1ba327ab976a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 하단 노트와 첨부 | 목록에 #1001 $0.00 문서가 보인다. |
| 08 | [`sc_21f42247e22948b3b35d5313e9e315a5`](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 목록과 결제 연결 안내 | 초안 생성 후 목록에서 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 전역 신규 생성 메뉴

- Screen ID: `sc_40ff225f161846249b5cf8c2c55423b6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_40ff225f161846249b5cf8c2c55423b6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de124575-8e10-4abd-baeb-f678b6805b52.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_189567faf57a4b47ae03222be1dd2ae6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단+New 아래 오른쪽 세로 드롭다운.
- 입력 항목·필수 표시·기본값: 입력 항목 없음.
- 버튼·메뉴·안내 문구: Client, Project, Invoice, Proposal, Contract, Form, Expense.
- 확인된 상태: Client 항목이 초록으로 강조됨.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 고객 외 여러 업무 생성 진입이 공통 메뉴에 모여 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할·요금제별 항목 노출·키보드 이동.

#### 모델링 영향

- 후보와 근거: 공통 생성 메뉴와 각 업무 폼 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 단일 인보이스 모달

- Screen ID: `sc_189567faf57a4b47ae03222be1dd2ae6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_189567faf57a4b47ae03222be1dd2ae6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1335c9b7-b8e4-43d5-bf8b-8ae5c412bccc.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_40ff225f161846249b5cf8c2c55423b6` → 현재 → `sc_225db5e23d1c4dee96ec5e48999ea0f5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 New Invoice, 어두운 Dashboard 배경, 외곽 X와 하단 지원 링크.
- 입력 항목·필수 표시·기본값: Invoice Type Single Invoice, Client Sample Client, Project Consulting Project. 별표 없음.
- 버튼·메뉴·안내 문구: Create Invoice. Sample Client에 보내면 자동 paid 처리된다는 노란 안내.
- 확인된 상태: 데모 고객이 선택된 생성 폼.
- 단계 간 변화: New Invoice 모달에 Single Invoice와 Sample Client/Consulting Project가 표시된다.

#### 동작과 데이터

- 화면 관찰: 고객·프로젝트·유형을 선택하는 초기 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 초기 선택이 최근 사용값인지 시스템 기본값인지 미확인.

#### 모델링 영향

- 후보와 근거: 문서 생성 입력·데모 고객 플래그·프로젝트 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 구독 청구 유형과 주기

- Screen ID: `sc_225db5e23d1c4dee96ec5e48999ea0f5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_225db5e23d1c4dee96ec5e48999ea0f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/265f4058-4534-4188-8dca-a8536107ddd9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_189567faf57a4b47ae03222be1dd2ae6` → 현재 → `sc_d7d27c29f8424e8db943e94d1b1c636f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달 높이가 늘고 유형 옆 주기, 하단 종료 선택이 추가.
- 입력 항목·필수 표시·기본값: Subscription Inv…로 생략 표시, Every two weeks, Sample Client, Consulting Project, Invoice Until I manually stop it.
- 버튼·메뉴·안내 문구: Create Invoice, X. 데모 자동 지급 안내 유지.
- 확인된 상태: 반복 관련 입력이 조건부 노출.
- 단계 간 변화: Subscription 유형 및 Every two weeks 선택으로 종료조건이 추가된다.

#### 동작과 데이터

- 화면 관찰: 단일 청구와 달리 주기·종료 방식 설정이 필요함.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 유형 전체 선택지·주기 모든 옵션·결제동의 미확인.

#### 모델링 영향

- 후보와 근거: 구독/반복 유형과 주기·종료 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 일반 고객과 프로젝트 선택

- Screen ID: `sc_d7d27c29f8424e8db943e94d1b1c636f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d7d27c29f8424e8db943e94d1b1c636f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b34d9954-994e-4cf9-a7af-816ed654d98f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_225db5e23d1c4dee96ec5e48999ea0f5` → 현재 → `sc_6dd7b5296fed46079b5dc202afe5a64a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 모달에서 데모 안내가 사라지고 높이가 줄었다.
- 입력 항목·필수 표시·기본값: Doe Company, Design Project with Doe Studio, 2주 간격, 수동 종료.
- 버튼·메뉴·안내 문구: Create Invoice와 X.
- 확인된 상태: 일반 고객 선택 상태.
- 단계 간 변화: 고객을 Doe Company, 프로젝트를 Design Project with Doe Studio로 바꾼다.

#### 동작과 데이터

- 화면 관찰: 고객 변경과 프로젝트 선택이 함께 보인다. 자동 선택인지 수동 변경인지 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객-프로젝트 필터링·고객 변경 시 초안값 초기화 규칙 미확인.

#### 모델링 영향

- 후보와 근거: 고객별 프로젝트 선택 관계·유효 조합 검증 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 구독 종료일 지정

- Screen ID: `sc_6dd7b5296fed46079b5dc202afe5a64a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6dd7b5296fed46079b5dc202afe5a64a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b447a014-97b0-4942-9e7e-2c5a77fa7fb5.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d7d27c29f8424e8db943e94d1b1c636f` → 현재 → `sc_aa221ac7066a427db6aae5b18f0acab4`

#### 화면에서 직접 확인한 내용

- 레이아웃: Invoice Until 행이 종료 방식과 날짜 두 입력으로 나뉜다.
- 입력 항목·필수 표시·기본값: A specific date, Mar21 2024. 나머지 고객·프로젝트·주기 유지.
- 버튼·메뉴·안내 문구: Create Invoice, X. 날짜 선택 달력은 닫혀 있음.
- 확인된 상태: 작성 완료, 생성 전.
- 단계 간 변화: Invoice Until을 특정 날짜 Mar21 2024로 변경한다.

#### 동작과 데이터

- 화면 관찰: 무기한 수동 종료에서 날짜 기반 종료로 변경.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 필수·과거날짜 검증·종료일 포함 여부 미확인.

#### 모델링 영향

- 후보와 근거: 반복 종료 조건 종류와 nullable 종료일 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 구독 인보이스 초안 편집 상단

- Screen ID: `sc_aa221ac7066a427db6aae5b18f0acab4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aa221ac7066a427db6aae5b18f0acab4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00abe9ef-b389-490a-a2c9-6f9bbf1b2064.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6dd7b5296fed46079b5dc202afe5a64a` → 현재 → `sc_9bb31a1abe7f42209f1ba327ab976a0c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 문서 작업바, 중앙 흰 종이, 오른쪽 Overview/Setup/Payments. 일반 사이드바 숨김.
- 입력 항목·필수 표시·기본값: Drafted $0.00, #1001, Feb7 발행·Mar8 만기, 2주 반복·Mar21 종료. From Joe Doe/Joe Studio, To Jane Doe/Doe Company, 주소 placeholder. Logo on, Late Fee off, Tax ID on.
- 버튼·메뉴·안내 문구: Preview, Automation, Send Now와 달력, …, Add Recipient, Unbilled Hours 안내 닫기, Advanced Settings Edit, Enable Online Payments.
- 확인된 상태: 초안. 빈 항목명·수량1·단가/합계0. 미청구 시간 안내가 존재.
- 단계 간 변화: 초안 #1001 편집 화면으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 구독 설정이 Overview에 반영되고 청구서가 생성됐다. 시간은 자동 포함되지 않았다는 안내.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주소/Tax ID 회색값의 저장 여부·항목 자동저장·발송 조건 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 헤더·수신자·항목·세금표시·초안 상태·미청구 원천 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 인보이스 하단 노트와 첨부

- Screen ID: `sc_9bb31a1abe7f42209f1ba327ab976a0c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9bb31a1abe7f42209f1ba327ab976a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/03a1b289-4eef-4955-8588-9e8eeb60e95f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_aa221ac7066a427db6aae5b18f0acab4` → 현재 → `sc_21f42247e22948b3b35d5313e9e315a5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 본문 하단으로 스크롤, 오른쪽 Overview와 설정 패널은 유지.
- 입력 항목·필수 표시·기본값: Tax0.0%, Total$0USD, Tax ID 회색123456789, Notes 회색Thank you for your business.
- 버튼·메뉴·안내 문구: Add Expenses, Enable Online Payments, 통화 드롭다운, Add File Attachment.
- 확인된 상태: 금액0 초안이며 첨부는 없음.
- 단계 간 변화: 문서 하단의 세금·메모·첨부 영역으로 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 세금/비용/노트/첨부가 문서 본문에 들어갈 수 있음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 회색 예시가 placeholder인지 저장값인지, 파일제한·외부공유 정책 미확인.

#### 모델링 영향

- 후보와 근거: 첨부·문서노트·통화·비용 링크와 표시 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 인보이스 목록과 결제 연결 안내

- Screen ID: `sc_21f42247e22948b3b35d5313e9e315a5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/350ed68e-021e-4ff8-9e83-3c90f3405098.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9bb31a1abe7f42209f1ba327ab976a0c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 사이드바·상단 전역바, Invoices/Settings/Default Values 탭. 결제 홍보 패널 아래 검색과 표.
- 입력 항목·필수 표시·기본값: 한 행 #1001, 발행 Feb07 2024·만기 Mar08 2024, Doe Company/Design Project with Doe Studio, Total/Paid $0.00. 검색 비어 있음.
- 버튼·메뉴·안내 문구: Cards/Bank Transfer/PayPal 꺼진 토글, 안내 닫기, Filters, Edit Payment Methods, New Invoice, 행 … 및 정렬 아이콘.
- 확인된 상태: 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점.
- 단계 간 변화: 목록에 #1001 $0.00 문서가 보인다.

#### 동작과 데이터

- 화면 관찰: 문서 금액과 수납액이 별도이며 발행일과 만기일도 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 점 색상 의미·필터조건·결제연결 요구사항 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 요약 목록·반복 시리즈·결제수단 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Sample Client 안내는 발송 시 자동 Paid로 처리되는 데모 동작이며 일반 고객으로 확장하지 않는다.
- [관찰] 생성 결과 Drafted이며 금액0, Every 2 Weeks, Repeat Until Mar21. 발송 전 이미 초안이 목록에 존재한다.
- [관찰] 발행 Feb7·만기 Mar8. 반복 간격과 결제 만기는 서로 다른 시간 규칙이다.
- [문서] 반복 생성·자동 발송·구독 결제 동의는 각각 확인해야 한다.

## 6. 공식 도움말과 API 대조

- [인보이스 생성 도움말](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice): 유형·고객·프로젝트 선택 후 문서 편집으로 이어진다. 현행 세금은 항목별 세율 선택도 설명하므로 캡처의 전체 세율과 구분한다.
- [반복과 구독 청구](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices): 반복 청구서는 주기에 따라 복제되며 발송 설정이 별개다. 구독 자동 결제는 고객의 결제수단 저장·동의가 필요하다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 인보이스 초안, 반복 시리즈/주기/종료 조건, 고객/프로젝트/수신자 연결 후보.
- 발행일·만기일·반복 종료일을 분리하고 돈의 통화·소수 정확도를 보존할 후보.
- 고객 주소/연락처 참조와 발행 당시 문서 표시값의 동기화 정책은 미확정.

## 8. 미확인 사항과 검토 질문

- 종료일을 포함하는지, 월말·시간대·주말에 반복 생성이 어떻게 되는지 재현이 필요하다.
- 발행 후 고객명·주소 변경이 과거 문서에 반영되는지 확인해야 스냅샷 정책을 결정할 수 있다.
- 0원 문서 발송·구독 허용 여부와 생성 실패·중복 제출 처리를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
