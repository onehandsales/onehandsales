# Importing a CSV 플로우 분석

최신 검토: **R4 전체 단계 구성·상태 대조 11/11 · 동일 재현 세부 명세 미완** (2026-11-22 KST). 장당 720×450 비교 시트로 직접 대조했다. 요소별 전수 확대·픽셀 일치 판정은 아니다. [기준](<../../../SOURCE_ANALYSIS_STANDARD.md>) · [결과](<../../../SOURCE_ANALYSIS_REVIEW.md>) · [원본 색인](<../../../SOURCE_ANALYSIS_INDEX.json>).

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **11/11단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **1/11단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-ad6f634b-9fff-44de-acdf-4cd1eaf69123>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ad6f634b-9fff-44de-acdf-4cd1eaf69123` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ad6f634b-9fff-44de-acdf-4cd1eaf69123) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 11단계 / 11단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

Expenses CSV를 업로드하고 원본 열을 필드에 연결한 뒤, 잘못된 Billable 매핑에 대한 행별 실패 결과를 확인한다.

- Integrations & Data 하단에서 시작한다. 플로우는 성공 import가 아니라 실패로 끝난다.
- balances.csv 원본 파일은 제공되지 않았다. 샘플2행과 오류 행번호만 확인했다.

- 상위 흐름: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Importing a CSV`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **Integrations & Data 목록**이다. 스크롤 상단. Import 영역은 아직 보이지 않음. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **Billable 행별 검증 실패**이다. 총17개 행번호 오류가 보임. 성공안내 없음. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Settings](<../ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b8ed116f56354559846a960779fa7c5d`](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Integrations & Data 목록](<screens/01_sc_b8ed116f56354559846a960779fa7c5d.png>) | Import Data와 Download Data — 미선택 상태. |
| 02 | [`sc_accd4fe1e6974ff59056e24b0649aca9`](https://gummble.com/screens/sc_accd4fe1e6974ff59056e24b0649aca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Import Data와 Download Data](<screens/02_sc_accd4fe1e6974ff59056e24b0649aca9.png>) | Import 데이터 종류 — Clients 행 녹색 강조; 실제 선택값은 아직Select. |
| 03 | [`sc_63958ac7978f4f1c976ca14ad3b1c23b`](https://gummble.com/screens/sc_63958ac7978f4f1c976ca14ad3b1c23b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Import 데이터 종류](<screens/03_sc_63958ac7978f4f1c976ca14ad3b1c23b.png>) | Expenses 가져오기 안내 — Expenses 선택됨. |
| 04 | [`sc_16a0e32e940b4e469bddd73b2f20183c`](https://gummble.com/screens/sc_16a0e32e940b4e469bddd73b2f20183c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Expenses 가져오기 안내](<screens/04_sc_16a0e32e940b4e469bddd73b2f20183c.png>) | Expenses 파일 첨부 전 — 첨부 전 진행 불가처럼 보임. |
| 05 | [`sc_0079601b907a405192b5310a1664e1bc`](https://gummble.com/screens/sc_0079601b907a405192b5310a1664e1bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Expenses 파일 첨부 전](<screens/05_sc_0079601b907a405192b5310a1664e1bc.png>) | balances.csv 첨부됨 — 파일 선택 완료. |
| 06 | [`sc_23b97421307c43e6ad64126e7a9ea0d4`](https://gummble.com/screens/sc_23b97421307c43e6ad64126e7a9ea0d4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [balances.csv 첨부됨](<screens/06_sc_23b97421307c43e6ad64126e7a9ea0d4.png>) | CSV 열 매핑 — 미선택 — 원본열→업무필드 선택 대기. |
| 07 | [`sc_1d22b8916ef6427081db6777102d21fd`](https://gummble.com/screens/sc_1d22b8916ef6427081db6777102d21fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [CSV 열 매핑 — 미선택](<screens/07_sc_1d22b8916ef6427081db6777102d21fd.png>) | Name에 Balance 매핑 — 의미상 어긋난 매핑도 샘플 표시. |
| 08 | [`sc_02b45084653a46b0b78476cdf2aa0e4f`](https://gummble.com/screens/sc_02b45084653a46b0b78476cdf2aa0e4f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Name에 Balance 매핑](<screens/08_sc_02b45084653a46b0b78476cdf2aa0e4f.png>) | 매핑 완료 — 잘못된 Billable/Currency — 필수 필드 선택됐지만 Billable에는문자열,Currency에는날짜. |
| 09 | [`sc_702a474b387e4f54b6144e1d9b8749c2`](https://gummble.com/screens/sc_702a474b387e4f54b6144e1d9b8749c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [매핑 완료 — 잘못된 Billable/Currency](<screens/09_sc_702a474b387e4f54b6144e1d9b8749c2.png>) | Expenses import 처리 중 — 처리 중. |
| 10 | [`sc_b68a35108dc4488ebf99c45e2fabf879`](https://gummble.com/screens/sc_b68a35108dc4488ebf99c45e2fabf879?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Expenses import 처리 중](<screens/10_sc_b68a35108dc4488ebf99c45e2fabf879.png>) | Billable 행별 검증 실패 — 총17개 행번호 오류가 보임. 성공안내 없음. |
| 11 | [`sc_7676681e981547a882d4b59fae1ac84f`](https://gummble.com/screens/sc_7676681e981547a882d4b59fae1ac84f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Billable 행별 검증 실패](<screens/11_sc_7676681e981547a882d4b59fae1ac84f.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — Integrations & Data 목록

- Screen ID: `sc_b8ed116f56354559846a960779fa7c5d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/29e0bf0a-7762-4cc6-88b3-83f024820c4f.png)
- 로컬 이미지: [01_sc_b8ed116f56354559846a960779fa7c5d.png](<screens/01_sc_b8ed116f56354559846a960779fa7c5d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 138, 고유 이미지 S550, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_accd4fe1e6974ff59056e24b0649aca9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드 그리드. Gmail/Google Calendar/Zapier, Slack/QuickBooks Online/Calendly, ClickUp/Trello/Google Drive 일부.
- 입력 항목·필수 표시·기본값: 현재 연결 상태나 토큰 입력 없음.
- 버튼·메뉴·안내 문구: 서비스 카드와 간단한 연동 목적 설명.
- 확인된 상태: 스크롤 상단. Import 영역은 아직 보이지 않음.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 클라이언트 발송 이메일·알림·인보이스 동기화·외부 작업 자동화 등 목적이 다름. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.

#### 모델링 영향

- 후보와 근거: 외부 연결 계정·상태와 자동화 설정을 분리할 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Import Data와 Download Data

- Screen ID: `sc_accd4fe1e6974ff59056e24b0649aca9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_accd4fe1e6974ff59056e24b0649aca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/84cf5c6b-1a03-4301-862f-3bae6083b664.png)
- 로컬 이미지: [02_sc_accd4fe1e6974ff59056e24b0649aca9.png](<screens/02_sc_accd4fe1e6974ff59056e24b0649aca9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 142, 고유 이미지 S567, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b8ed116f56354559846a960779fa7c5d` → 현재 → `sc_63958ac7978f4f1c976ca14ad3b1c23b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 연동 카드 하단에 Google Sheets/Xero/Hubspot, 연동 요청, Import Data, Download Data(CSV).
- 입력 항목·필수 표시·기본값: import type Select 빈 값.
- 버튼·메뉴·안내 문구: Invoices/Projects/Expenses/Clients/Time Tracked 다운로드 버튼5개.
- 확인된 상태: 미선택 상태.
- 단계 간 변화: 연동 목록 아래 Import/Download로 스크롤 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: import와export의 데이터셋이 동일하지 않음;Projects는export에 보임. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각다운로드파일 필드와 범위 미확인.

#### 모델링 영향

- 후보와 근거: 데이터 유형별 import/export capability 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 각다운로드파일 필드와 범위 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Import 데이터 종류

- Screen ID: `sc_63958ac7978f4f1c976ca14ad3b1c23b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_63958ac7978f4f1c976ca14ad3b1c23b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d95e8edd-e4ec-4fb8-9dfe-545b14bc73e1.png)
- 로컬 이미지: [03_sc_63958ac7978f4f1c976ca14ad3b1c23b.png](<screens/03_sc_63958ac7978f4f1c976ca14ad3b1c23b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 142, 고유 이미지 S568, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_accd4fe1e6974ff59056e24b0649aca9` → 현재 → `sc_16a0e32e940b4e469bddd73b2f20183c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 유형 드롭다운 확장.
- 입력 항목·필수 표시·기본값: Clients, Paid Invoices, Time Entries, Expenses.
- 버튼·메뉴·안내 문구: 유형 선택.
- 확인된 상태: Clients 행 녹색 강조; 실제 선택값은 아직Select.
- 단계 간 변화: 데이터 종류 드롭다운 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 청구서 import는 Paid로 한정된 라벨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 상태 청구서 입력 허용 여부 미확인.

#### 모델링 영향

- 후보와 근거: 유형별 별도 스키마 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 다른 상태 청구서 입력 허용 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Expenses 가져오기 안내

- Screen ID: `sc_16a0e32e940b4e469bddd73b2f20183c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_16a0e32e940b4e469bddd73b2f20183c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f141201d-d09e-4371-a3c3-d5322130991f.png)
- 로컬 이미지: [04_sc_16a0e32e940b4e469bddd73b2f20183c.png](<screens/04_sc_16a0e32e940b4e469bddd73b2f20183c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 143, 고유 이미지 S569, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_63958ac7978f4f1c976ca14ad3b1c23b` → 현재 → `sc_0079601b907a405192b5310a1664e1bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 선택 아래 연녹색 안내박스.
- 입력 항목·필수 표시·기본값: Name(required),Amount(required),Date(required YYYY-MM-DD),Billable,Currency.
- 버튼·메뉴·안내 문구: 파일 안내 영역.
- 확인된 상태: Expenses 선택됨.
- 단계 간 변화: Expenses 선택 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 필수조건3개와 optional2개를 명시. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈currency기본값·금액정밀도 미확인.

#### 모델링 영향

- 후보와 근거: Expense import 필드 계약 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 빈currency기본값·금액정밀도 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Expenses 파일 첨부 전

- Screen ID: `sc_0079601b907a405192b5310a1664e1bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0079601b907a405192b5310a1664e1bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3add6bd2-9f9a-4b45-9610-36385d0e38fe.png)
- 로컬 이미지: [05_sc_0079601b907a405192b5310a1664e1bc.png](<screens/05_sc_0079601b907a405192b5310a1664e1bc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 143, 고유 이미지 S570, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_16a0e32e940b4e469bddd73b2f20183c` → 현재 → `sc_23b97421307c43e6ad64126e7a9ea0d4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 안내 전체와 파일 첨부, Import CSV 버튼.
- 입력 항목·필수 표시·기본값: 파일 없음. 모두 uncategorized,ISO통화코드·날짜형식 안내.
- 버튼·메뉴·안내 문구: CSV template 다운로드, Include a file attachment. Import CSV 연한색.
- 확인된 상태: 첨부 전 진행 불가처럼 보임.
- 단계 간 변화: 업로드 영역으로 스크롤 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 분류는 가져오기 과정에서 지정하지 않는 안내. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 disabled 속성·템플릿 내용 미확인.

#### 모델링 영향

- 후보와 근거: 업로드 파일과 파싱 단계 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 실제 disabled 속성·템플릿 내용 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — balances.csv 첨부됨

- Screen ID: `sc_23b97421307c43e6ad64126e7a9ea0d4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_23b97421307c43e6ad64126e7a9ea0d4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/211cef00-7547-4744-a5c5-51e2976c9e49.png)
- 로컬 이미지: [06_sc_23b97421307c43e6ad64126e7a9ea0d4.png](<screens/06_sc_23b97421307c43e6ad64126e7a9ea0d4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 143, 고유 이미지 S571, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0079601b907a405192b5310a1664e1bc` → 현재 → `sc_1d22b8916ef6427081db6777102d21fd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첨부 영역에 파일명과 빨간X.
- 입력 항목·필수 표시·기본값: balances.csv.
- 버튼·메뉴·안내 문구: Import CSV 진한녹색 활성,첨부 제거.
- 확인된 상태: 파일 선택 완료.
- 단계 간 변화: balances.csv 첨부 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 파일선택만으로 import실행된 것 아님. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일내용·업로드저장 위치 미확인.

#### 모델링 영향

- 후보와 근거: 첨부 상태와 import job 구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 파일내용·업로드저장 위치 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — CSV 열 매핑 — 미선택

- Screen ID: `sc_1d22b8916ef6427081db6777102d21fd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1d22b8916ef6427081db6777102d21fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36b6d454-614d-4083-9b38-242707e1b569.png)
- 로컬 이미지: [07_sc_1d22b8916ef6427081db6777102d21fd.png](<screens/07_sc_1d22b8916ef6427081db6777102d21fd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 143, 고유 이미지 S572, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_23b97421307c43e6ad64126e7a9ea0d4` → 현재 → `sc_02b45084653a46b0b78476cdf2aa0e4f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 Name*/Amount*/Date*, 아래2열 Billable/Currency. 설명박스와 하단버튼.
- 입력 항목·필수 표시·기본값: 5필드 Select; 별표3개.
- 버튼·메뉴·안내 문구: Cancel, Import Data 연한색,Contact Support.
- 확인된 상태: 원본열→업무필드 선택 대기.
- 단계 간 변화: Import CSV 후 매핑 화면 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 파일 헤더를 매핑한 뒤 샘플을 보여준다는 안내. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동매핑·열목록·중복매핑 정책 미확인.

#### 모델링 영향

- 후보와 근거: 필드 매핑 정의와 미리보기 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 자동매핑·열목록·중복매핑 정책 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Name에 Balance 매핑

- Screen ID: `sc_02b45084653a46b0b78476cdf2aa0e4f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_02b45084653a46b0b78476cdf2aa0e4f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fe442be5-686e-40fa-a0b2-03d20002ac02.png)
- 로컬 이미지: [08_sc_02b45084653a46b0b78476cdf2aa0e4f.png](<screens/08_sc_02b45084653a46b0b78476cdf2aa0e4f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 144, 고유 이미지 S573, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1d22b8916ef6427081db6777102d21fd` → 현재 → `sc_702a474b387e4f54b6144e1d9b8749c2`

#### 화면에서 직접 확인한 내용

- 레이아웃: Name Balance 선택 후 하단 Sample Imported Data 카드 생성.
- 입력 항목·필수 표시·기본값: Name 샘플 -10.00 두행. 나머지 필드미선택.
- 버튼·메뉴·안내 문구: Cancel, Import Data 연한색.
- 확인된 상태: 의미상 어긋난 매핑도 샘플 표시.
- 단계 간 변화: Name에 Balance 연결 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 소스의 숫자열을 Name에 연결할 수 있는 UI. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 단계타입검증·변환 미확인.

#### 모델링 영향

- 후보와 근거: 사용자 매핑과 타입검증 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 이 단계타입검증·변환 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 매핑 완료 — 잘못된 Billable/Currency

- Screen ID: `sc_702a474b387e4f54b6144e1d9b8749c2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_702a474b387e4f54b6144e1d9b8749c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cc96d022-3e68-42d4-86c3-75d16e690be9.png)
- 로컬 이미지: [09_sc_702a474b387e4f54b6144e1d9b8749c2.png](<screens/09_sc_702a474b387e4f54b6144e1d9b8749c2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 144, 고유 이미지 S574, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_02b45084653a46b0b78476cdf2aa0e4f` → 현재 → `sc_b68a35108dc4488ebf99c45e2fabf879`

#### 화면에서 직접 확인한 내용

- 레이아웃: 5필드 매핑과 샘플카드2행.
- 입력 항목·필수 표시·기본값: Name=Account, Amount=Balance, Date=Date, Billable=Account,Currency=Date. 샘플My Cash Account,-10,2023-12-04/05.
- 버튼·메뉴·안내 문구: Import Data 진한녹색,Cancel.
- 확인된 상태: 필수 필드 선택됐지만 Billable에는문자열,Currency에는날짜.
- 단계 간 변화: 5개 필드 매핑 변경 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 표본은 연결열의 원본값을 그대로 보여줌. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 문자열이 accepted인지 아직 판단불가.

#### 모델링 영향

- 후보와 근거: 제출가능상태와 검증통과상태를 구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 문자열이 accepted인지 아직 판단불가. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — Expenses import 처리 중

- Screen ID: `sc_b68a35108dc4488ebf99c45e2fabf879`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b68a35108dc4488ebf99c45e2fabf879?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/da410b33-692d-41f5-93a4-bfe14ff96d97.png)
- 로컬 이미지: [10_sc_b68a35108dc4488ebf99c45e2fabf879.png](<screens/10_sc_b68a35108dc4488ebf99c45e2fabf879.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 144, 고유 이미지 S575, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_702a474b387e4f54b6144e1d9b8749c2` → 현재 → `sc_7676681e981547a882d4b59fae1ac84f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 설명/매핑 대신 연녹색 처리박스와 점 애니메이션.
- 입력 항목·필수 표시·기본값: 유형Expenses 유지.
- 버튼·메뉴·안내 문구: Importing your expenses, please wait. 다운로드버튼은 아래유지.
- 확인된 상태: 처리 중.
- 단계 간 변화: Import Data 후 처리 중 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 비동기 처리 또는 응답대기 UI. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 취소·중복클릭방지·타임아웃 미확인.

#### 모델링 영향

- 후보와 근거: import진행 상태 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 취소·중복클릭방지·타임아웃 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Billable 행별 검증 실패

- Screen ID: `sc_7676681e981547a882d4b59fae1ac84f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7676681e981547a882d4b59fae1ac84f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9f9be7d2-1259-4f18-b953-9eb51a1748e8.png)
- 로컬 이미지: [11_sc_7676681e981547a882d4b59fae1ac84f.png](<screens/11_sc_7676681e981547a882d4b59fae1ac84f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 144, 고유 이미지 S576, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- R4 구성·상태 대조: 2026-11-22 KST · 장당 720×450 비교 시트; 전체 요소 정밀 검증과 구분.
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b68a35108dc4488ebf99c45e2fabf879` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 빨간 안내와 목록이 큰 카드에 배치.
- 입력 항목·필수 표시·기본값: Line2~18 각각 Billable must be blank,true or false.
- 버튼·메뉴·안내 문구: CSV수정 후 try again 링크.
- 확인된 상태: 총17개 행번호 오류가 보임. 성공안내 없음.
- R2 보완 관찰·해석: 2~18행의 Billable 오류가 나열된다. Currency에 날짜를 매핑한 문제도 앞 화면에 보이지만, 이 오류 목록만으로 다른 필드 검증 통과나 부분 저장을 판단할 수 없다.
- 단계 간 변화: 행별 Billable 검증 오류 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 잘못된 Billable매핑이 실제오류로 반환됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른필드검증 생략/부분성공 여부 미확인.

#### 모델링 영향

- 후보와 근거: 행번호·필드·오류코드별 결과 및 재시도 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 다른필드검증 생략/부분성공 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.


<a id="source-review-r4"></a>
### 원본 재현 대조 (R4 · 2026-11-22)

검토 범위: 이 흐름의 11단계 모두를 순서대로 직접 보고 기존 레이아웃·입력·버튼·상태 설명과 대조했다. 장당 720×450 비교 시트를 사용했으며, 아래는 재확인 및 보완 관찰이다. 모든 항목이 새 오류나 새 누락이라는 뜻은 아니다. 정밀 치수·전체 문구 전사·요소별 대응표의 완결은 별도다.

- 02–06: 가져오기 유형 선택 아래 안내·파일 첨부·실행 버튼이 단계적으로 생긴다. 다운로드 다섯 버튼은 별도 기능이며 Import 유형 네 개와 동일 목록이 아니다.
- 07–09: 매핑은 필수 세 항목 위/선택 두 항목 아래 구조다. 선택에 따라 샘플 카드가 생기지만 의미상 잘못된 Billable=Account/Currency=Date도 화면에는 허용된다.
- 10→11: 처리 영역 뒤 Line 2–18의 Billable 오류 17개가 나타난다. 최종 상태는 실패이며 입력한 매핑을 정상 예제로 고쳐 재현하면 안 된다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 스크롤 상단. Import 영역은 아직 보이지 않음. — 현재 연결 상태나 토큰 입력 없음. | 카드 클릭 후 인증·동기화 방향·권한 범위 미확인. |
| 02 | 미선택 상태. — import type Select 빈 값. | 각다운로드파일 필드와 범위 미확인. |
| 03 | Clients 행 녹색 강조; 실제 선택값은 아직Select. — Clients, Paid Invoices, Time Entries, Expenses. | 다른 상태 청구서 입력 허용 여부 미확인. |
| 04 | Expenses 선택됨. — Name(required),Amount(required),Date(required YYYY-MM-DD),Billable,Currency. | 빈currency기본값·금액정밀도 미확인. |
| 05 | 첨부 전 진행 불가처럼 보임. — 파일 없음. 모두 uncategorized,ISO통화코드·날짜형식 안내. | 실제 disabled 속성·템플릿 내용 미확인. |
| 06 | 파일 선택 완료. — balances.csv. | 파일내용·업로드저장 위치 미확인. |
| 07 | 원본열→업무필드 선택 대기. — 5필드 Select; 별표3개. | 자동매핑·열목록·중복매핑 정책 미확인. |
| 08 | 의미상 어긋난 매핑도 샘플 표시. — Name 샘플 -10.00 두행. 나머지 필드미선택. | 이 단계타입검증·변환 미확인. |
| 09 | 필수 필드 선택됐지만 Billable에는문자열,Currency에는날짜. — Name=Account, Amount=Balance, Date=Date, Billable=Account,Currency=Date. 샘플My Cash Account,-10,2023-12-04/05. | 문자열이 accepted인지 아직 판단불가. |
| 10 | 처리 중. — 유형Expenses 유지. | 취소·중복클릭방지·타임아웃 미확인. |
| 11 | 총17개 행번호 오류가 보임. 성공안내 없음. — Line2~18 각각 Billable must be blank,true or false. | 다른필드검증 생략/부분성공 여부 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

Google Sheets·Xero·Hubspot 연동 카드와 CSV 가져오기 영역이 함께 보인다. balances.csv의 Name=Account·Amount=Balance·Date=Date 매핑 뒤 Billable=Account·Currency=Date를 잘못 연결한 상태에서 처리 화면과 2~18행 Billable 오류가 나타난다. 화면상 필수 열 선택과 행별 값 검증은 별개다. 다른 통화 오류가 표시되지 않았다고 통화 값이 유효하거나 일부 저장됐다고 단정하지 않는다.

### 업무 규칙과 연결 시 주의점

- Name/Amount/Date 필수, Date YYYY-MM-DD, Currency ISO 코드, expense는 uncategorized로 들어온다는 안내.
- Billable에 Account 문자열·Currency에 Date를 매핑해도 Import Data 버튼이 활성화된다. 활성 버튼이 데이터 유효성을 보장하지 않는다.
- 마지막 오류는 Line2~18의 Billable은 blank/true/false여야 한다는 내용. Currency 오류가 안 보인다고 날짜 문자열을 허용한다고 해석하지 않는다.
- 전체 실패인지 일부 행 저장인지 화면만으로 확정 불가.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): R2 본문 대조 기록(S003). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [CSV 가져오기](https://help.hellobonsai.com/en/articles/1867510-importing-data-into-bonsai): R2 본문 대조 기록(S086). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- ImportJob, 업로드 asset, 소스 열→업무 필드 매핑, 샘플 미리보기, 행·필드별 validation error 후보.
- Expense의 name/amount/date/billable/currency 후보. Import의 required가 모든 생성 경로의 DB NOT NULL과 같다고 확정하지 않는다.
- 실패 원자성·재시도 중복·batch ID를 설계하기 전 후속 검증 필요.

### 단계별 모델링 근거

- 단계 01: 외부 연결 계정·상태와 자동화 설정을 분리할 후보.
- 단계 02: 데이터 유형별 import/export capability 후보.
- 단계 03: 유형별 별도 스키마 후보.
- 단계 04: Expense import 필드 계약 후보.
- 단계 05: 업로드 파일과 파싱 단계 분리 후보.
- 단계 06: 첨부 상태와 import job 구분.
- 단계 07: 필드 매핑 정의와 미리보기 후보.
- 단계 08: 사용자 매핑과 타입검증 분리 후보.
- 단계 09: 제출가능상태와 검증통과상태를 구분.
- 단계 10: import진행 상태 후보.
- 단계 11: 행번호·필드·오류코드별 결과 및 재시도 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 동일 CSV 재시도의 중복 방지와 부분 성공 여부를 확인. Billable 빈 값 default, 음수 금액 처리, Currency 누락·잘못된 값의 검증 순서 확인.

- 동일 CSV 재시도의 중복 방지와 부분 성공 여부를 확인.
- Billable 빈 값 default, 음수 금액 처리, Currency 누락·잘못된 값의 검증 순서 확인.
- 파일 크기·인코딩·날짜 locale·매핑 중복 허용 정책 확인.

### 단계별 미확인 사항

- 단계 01: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.
- 단계 02: 각다운로드파일 필드와 범위 미확인.
- 단계 03: 다른 상태 청구서 입력 허용 여부 미확인.
- 단계 04: 빈currency기본값·금액정밀도 미확인.
- 단계 05: 실제 disabled 속성·템플릿 내용 미확인.
- 단계 06: 파일내용·업로드저장 위치 미확인.
- 단계 07: 자동매핑·열목록·중복매핑 정책 미확인.
- 단계 08: 이 단계타입검증·변환 미확인.
- 단계 09: 문자열이 accepted인지 아직 판단불가.
- 단계 10: 취소·중복클릭방지·타임아웃 미확인.
- 단계 11: 다른필드검증 생략/부분성공 여부 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **부분**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 파일·열 매핑·처리 중·행별 오류·재시도를 연결한다. 성공·부분 저장·중복 방지 및 Currency 오류 순서는 별도 목 정책으로 명시한다.
- [이 흐름의 보완표](<../../../FLOW_REVIEW_MATRIX.md#flow-ad6f634b-9fff-44de-acdf-4cd1eaf69123>)와 [공통 웹 상태·연결 기준](<../../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.


### 동일 재현을 위한 남은 분석 (R4)

- Currency의 실제 검증 결과·다른 오류·재시도/성공 경로·원본 CSV 전체는 미확인이다. 샘플 표와 긴 오류 목록에 따른 높이/스크롤을 별도로 명세해야 한다.
- 공통 미완: 요소별 누락 검사, 정확한 배치·타이포그래피·색/장식·자산 대응·미노출 상태는 [12개 검토 항목](<../../../SOURCE_ANALYSIS_STANDARD.md>)으로 추가 명세한다. 원본에 없는 동작은 관찰 사실과 분리한다. 이 문서의 R4 표시를 동일 재현 명세나 FE 구현 완료로 읽지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 11단계 재조회 및 원본 11개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 11단계 ID·순서·원본 URL 재조회 및 이미지 11/11단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 11단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 1/11단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |
| R4 원본 재현 감사 | 2026-11-22 KST | 11단계 전체 구성·상태 직접 대조 (장당 720×450 비교 시트); 4절 보완 관찰·8절 남은 명세, 선택 확대 0영역 기록 | 요소별 정밀 대조·시각 명세 완결·미수록 동작·TODO 대응·FE 구현 검증 |
