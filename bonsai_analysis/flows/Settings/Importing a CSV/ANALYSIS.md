# Importing a CSV 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **11/11단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ad6f634b-9fff-44de-acdf-4cd1eaf69123` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ad6f634b-9fff-44de-acdf-4cd1eaf69123) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 11단계 / 11단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

Expenses CSV를 업로드하고 원본 열을 필드에 연결한 뒤, 잘못된 Billable 매핑에 대한 행별 실패 결과를 확인한다.

- Integrations & Data 하단에서 시작한다. 플로우는 성공 import가 아니라 실패로 끝난다.
- balances.csv 원본 파일은 제공되지 않았다. 샘플2행과 오류 행번호만 확인했다.

- 상위 분석: [Settings](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b8ed116f56354559846a960779fa7c5d`](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Integrations & Data 목록 | 연동 목록 아래 Import/Download로 스크롤 |
| 02 | [`sc_accd4fe1e6974ff59056e24b0649aca9`](https://gummble.com/screens/sc_accd4fe1e6974ff59056e24b0649aca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Import Data와 Download Data | 데이터 종류 드롭다운 |
| 03 | [`sc_63958ac7978f4f1c976ca14ad3b1c23b`](https://gummble.com/screens/sc_63958ac7978f4f1c976ca14ad3b1c23b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Import 데이터 종류 | Expenses 선택 |
| 04 | [`sc_16a0e32e940b4e469bddd73b2f20183c`](https://gummble.com/screens/sc_16a0e32e940b4e469bddd73b2f20183c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 가져오기 안내 | 업로드 영역으로 스크롤 |
| 05 | [`sc_0079601b907a405192b5310a1664e1bc`](https://gummble.com/screens/sc_0079601b907a405192b5310a1664e1bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 파일 첨부 전 | balances.csv 첨부 |
| 06 | [`sc_23b97421307c43e6ad64126e7a9ea0d4`](https://gummble.com/screens/sc_23b97421307c43e6ad64126e7a9ea0d4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | balances.csv 첨부됨 | Import CSV 후 매핑 화면 |
| 07 | [`sc_1d22b8916ef6427081db6777102d21fd`](https://gummble.com/screens/sc_1d22b8916ef6427081db6777102d21fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | CSV 열 매핑 — 미선택 | Name에 Balance 연결 |
| 08 | [`sc_02b45084653a46b0b78476cdf2aa0e4f`](https://gummble.com/screens/sc_02b45084653a46b0b78476cdf2aa0e4f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Name에 Balance 매핑 | 5개 필드 매핑 변경 |
| 09 | [`sc_702a474b387e4f54b6144e1d9b8749c2`](https://gummble.com/screens/sc_702a474b387e4f54b6144e1d9b8749c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 매핑 완료 — 잘못된 Billable/Currency | Import Data 후 처리 중 |
| 10 | [`sc_b68a35108dc4488ebf99c45e2fabf879`](https://gummble.com/screens/sc_b68a35108dc4488ebf99c45e2fabf879?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses import 처리 중 | 행별 Billable 검증 오류 |
| 11 | [`sc_7676681e981547a882d4b59fae1ac84f`](https://gummble.com/screens/sc_7676681e981547a882d4b59fae1ac84f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Billable 행별 검증 실패 | 실패에서 종료; 수정·성공 후속 없음 |

## 4. 화면별 상세 분석

### 단계 01 — Integrations & Data 목록

- Screen ID: `sc_b8ed116f56354559846a960779fa7c5d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b8ed116f56354559846a960779fa7c5d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/29e0bf0a-7762-4cc6-88b3-83f024820c4f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_accd4fe1e6974ff59056e24b0649aca9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드 그리드. Gmail/Google Calendar/Zapier, Slack/QuickBooks Online/Calendly, ClickUp/Trello/Google Drive 일부.
- 입력 항목·필수 표시·기본값: 현재 연결 상태나 토큰 입력 없음.
- 버튼·메뉴·안내 문구: 서비스 카드와 간단한 연동 목적 설명.
- 확인된 상태: 스크롤 상단. Import 영역은 아직 보이지 않음.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 클라이언트 발송 이메일·알림·인보이스 동기화·외부 작업 자동화 등 목적이 다름.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드 클릭 후 인증·동기화 방향·권한 범위 미확인.

#### 모델링 영향

- 후보와 근거: 외부 연결 계정·상태와 자동화 설정을 분리할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Import Data와 Download Data

- Screen ID: `sc_accd4fe1e6974ff59056e24b0649aca9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_accd4fe1e6974ff59056e24b0649aca9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/84cf5c6b-1a03-4301-862f-3bae6083b664.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b8ed116f56354559846a960779fa7c5d` → 현재 → `sc_63958ac7978f4f1c976ca14ad3b1c23b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 연동 카드 하단에 Google Sheets/Xero/Hubspot, 연동 요청, Import Data, Download Data(CSV).
- 입력 항목·필수 표시·기본값: import type Select 빈 값.
- 버튼·메뉴·안내 문구: Invoices/Projects/Expenses/Clients/Time Tracked 다운로드 버튼5개.
- 확인된 상태: 미선택 상태.
- 단계 간 변화: 연동 목록 아래 Import/Download로 스크롤

#### 동작과 데이터

- 화면 관찰: import와export의 데이터셋이 동일하지 않음;Projects는export에 보임.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각다운로드파일 필드와 범위 미확인.

#### 모델링 영향

- 후보와 근거: 데이터 유형별 import/export capability 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Import 데이터 종류

- Screen ID: `sc_63958ac7978f4f1c976ca14ad3b1c23b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_63958ac7978f4f1c976ca14ad3b1c23b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d95e8edd-e4ec-4fb8-9dfe-545b14bc73e1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_accd4fe1e6974ff59056e24b0649aca9` → 현재 → `sc_16a0e32e940b4e469bddd73b2f20183c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 유형 드롭다운 확장.
- 입력 항목·필수 표시·기본값: Clients, Paid Invoices, Time Entries, Expenses.
- 버튼·메뉴·안내 문구: 유형 선택.
- 확인된 상태: Clients 행 녹색 강조; 실제 선택값은 아직Select.
- 단계 간 변화: 데이터 종류 드롭다운

#### 동작과 데이터

- 화면 관찰: 청구서 import는 Paid로 한정된 라벨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 상태 청구서 입력 허용 여부 미확인.

#### 모델링 영향

- 후보와 근거: 유형별 별도 스키마 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Expenses 가져오기 안내

- Screen ID: `sc_16a0e32e940b4e469bddd73b2f20183c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_16a0e32e940b4e469bddd73b2f20183c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f141201d-d09e-4371-a3c3-d5322130991f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_63958ac7978f4f1c976ca14ad3b1c23b` → 현재 → `sc_0079601b907a405192b5310a1664e1bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 선택 아래 연녹색 안내박스.
- 입력 항목·필수 표시·기본값: Name(required),Amount(required),Date(required YYYY-MM-DD),Billable,Currency.
- 버튼·메뉴·안내 문구: 파일 안내 영역.
- 확인된 상태: Expenses 선택됨.
- 단계 간 변화: Expenses 선택

#### 동작과 데이터

- 화면 관찰: 필수조건3개와 optional2개를 명시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈currency기본값·금액정밀도 미확인.

#### 모델링 영향

- 후보와 근거: Expense import 필드 계약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Expenses 파일 첨부 전

- Screen ID: `sc_0079601b907a405192b5310a1664e1bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0079601b907a405192b5310a1664e1bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3add6bd2-9f9a-4b45-9610-36385d0e38fe.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_16a0e32e940b4e469bddd73b2f20183c` → 현재 → `sc_23b97421307c43e6ad64126e7a9ea0d4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 안내 전체와 파일 첨부, Import CSV 버튼.
- 입력 항목·필수 표시·기본값: 파일 없음. 모두 uncategorized,ISO통화코드·날짜형식 안내.
- 버튼·메뉴·안내 문구: CSV template 다운로드, Include a file attachment. Import CSV 연한색.
- 확인된 상태: 첨부 전 진행 불가처럼 보임.
- 단계 간 변화: 업로드 영역으로 스크롤

#### 동작과 데이터

- 화면 관찰: 분류는 가져오기 과정에서 지정하지 않는 안내.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 disabled 속성·템플릿 내용 미확인.

#### 모델링 영향

- 후보와 근거: 업로드 파일과 파싱 단계 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — balances.csv 첨부됨

- Screen ID: `sc_23b97421307c43e6ad64126e7a9ea0d4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_23b97421307c43e6ad64126e7a9ea0d4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/211cef00-7547-4744-a5c5-51e2976c9e49.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0079601b907a405192b5310a1664e1bc` → 현재 → `sc_1d22b8916ef6427081db6777102d21fd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첨부 영역에 파일명과 빨간X.
- 입력 항목·필수 표시·기본값: balances.csv.
- 버튼·메뉴·안내 문구: Import CSV 진한녹색 활성,첨부 제거.
- 확인된 상태: 파일 선택 완료.
- 단계 간 변화: balances.csv 첨부

#### 동작과 데이터

- 화면 관찰: 파일선택만으로 import실행된 것 아님.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일내용·업로드저장 위치 미확인.

#### 모델링 영향

- 후보와 근거: 첨부 상태와 import job 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — CSV 열 매핑 — 미선택

- Screen ID: `sc_1d22b8916ef6427081db6777102d21fd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1d22b8916ef6427081db6777102d21fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36b6d454-614d-4083-9b38-242707e1b569.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_23b97421307c43e6ad64126e7a9ea0d4` → 현재 → `sc_02b45084653a46b0b78476cdf2aa0e4f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 Name*/Amount*/Date*, 아래2열 Billable/Currency. 설명박스와 하단버튼.
- 입력 항목·필수 표시·기본값: 5필드 Select; 별표3개.
- 버튼·메뉴·안내 문구: Cancel, Import Data 연한색,Contact Support.
- 확인된 상태: 원본열→업무필드 선택 대기.
- 단계 간 변화: Import CSV 후 매핑 화면

#### 동작과 데이터

- 화면 관찰: 파일 헤더를 매핑한 뒤 샘플을 보여준다는 안내.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동매핑·열목록·중복매핑 정책 미확인.

#### 모델링 영향

- 후보와 근거: 필드 매핑 정의와 미리보기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Name에 Balance 매핑

- Screen ID: `sc_02b45084653a46b0b78476cdf2aa0e4f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_02b45084653a46b0b78476cdf2aa0e4f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fe442be5-686e-40fa-a0b2-03d20002ac02.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1d22b8916ef6427081db6777102d21fd` → 현재 → `sc_702a474b387e4f54b6144e1d9b8749c2`

#### 화면에서 직접 확인한 내용

- 레이아웃: Name Balance 선택 후 하단 Sample Imported Data 카드 생성.
- 입력 항목·필수 표시·기본값: Name 샘플 -10.00 두행. 나머지 필드미선택.
- 버튼·메뉴·안내 문구: Cancel, Import Data 연한색.
- 확인된 상태: 의미상 어긋난 매핑도 샘플 표시.
- 단계 간 변화: Name에 Balance 연결

#### 동작과 데이터

- 화면 관찰: 소스의 숫자열을 Name에 연결할 수 있는 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 단계타입검증·변환 미확인.

#### 모델링 영향

- 후보와 근거: 사용자 매핑과 타입검증 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 매핑 완료 — 잘못된 Billable/Currency

- Screen ID: `sc_702a474b387e4f54b6144e1d9b8749c2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_702a474b387e4f54b6144e1d9b8749c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cc96d022-3e68-42d4-86c3-75d16e690be9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_02b45084653a46b0b78476cdf2aa0e4f` → 현재 → `sc_b68a35108dc4488ebf99c45e2fabf879`

#### 화면에서 직접 확인한 내용

- 레이아웃: 5필드 매핑과 샘플카드2행.
- 입력 항목·필수 표시·기본값: Name=Account, Amount=Balance, Date=Date, Billable=Account,Currency=Date. 샘플My Cash Account,-10,2023-12-04/05.
- 버튼·메뉴·안내 문구: Import Data 진한녹색,Cancel.
- 확인된 상태: 필수 필드 선택됐지만 Billable에는문자열,Currency에는날짜.
- 단계 간 변화: 5개 필드 매핑 변경

#### 동작과 데이터

- 화면 관찰: 표본은 연결열의 원본값을 그대로 보여줌.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 문자열이 accepted인지 아직 판단불가.

#### 모델링 영향

- 후보와 근거: 제출가능상태와 검증통과상태를 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — Expenses import 처리 중

- Screen ID: `sc_b68a35108dc4488ebf99c45e2fabf879`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b68a35108dc4488ebf99c45e2fabf879?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/da410b33-692d-41f5-93a4-bfe14ff96d97.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_702a474b387e4f54b6144e1d9b8749c2` → 현재 → `sc_7676681e981547a882d4b59fae1ac84f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 설명/매핑 대신 연녹색 처리박스와 점 애니메이션.
- 입력 항목·필수 표시·기본값: 유형Expenses 유지.
- 버튼·메뉴·안내 문구: Importing your expenses, please wait. 다운로드버튼은 아래유지.
- 확인된 상태: 처리 중.
- 단계 간 변화: Import Data 후 처리 중

#### 동작과 데이터

- 화면 관찰: 비동기 처리 또는 응답대기 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 취소·중복클릭방지·타임아웃 미확인.

#### 모델링 영향

- 후보와 근거: import진행 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Billable 행별 검증 실패

- Screen ID: `sc_7676681e981547a882d4b59fae1ac84f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7676681e981547a882d4b59fae1ac84f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9f9be7d2-1259-4f18-b953-9eb51a1748e8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b68a35108dc4488ebf99c45e2fabf879` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 빨간 안내와 목록이 큰 카드에 배치.
- 입력 항목·필수 표시·기본값: Line2~18 각각 Billable must be blank,true or false.
- 버튼·메뉴·안내 문구: CSV수정 후 try again 링크.
- 확인된 상태: 총17개 행번호 오류가 보임. 성공안내 없음.
- 단계 간 변화: 행별 Billable 검증 오류

#### 동작과 데이터

- 화면 관찰: 잘못된 Billable매핑이 실제오류로 반환됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른필드검증 생략/부분성공 여부 미확인.

#### 모델링 영향

- 후보와 근거: 행번호·필드·오류코드별 결과 및 재시도 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- Name/Amount/Date 필수, Date YYYY-MM-DD, Currency ISO 코드, expense는 uncategorized로 들어온다는 안내.
- Billable에 Account 문자열·Currency에 Date를 매핑해도 Import Data 버튼이 활성화된다. 활성 버튼이 데이터 유효성을 보장하지 않는다.
- 마지막 오류는 Line2~18의 Billable은 blank/true/false여야 한다는 내용. Currency 오류가 안 보인다고 날짜 문자열을 허용한다고 해석하지 않는다.
- 전체 실패인지 일부 행 저장인지 화면만으로 확정 불가.

## 6. 공식 도움말과 API 대조

- [CSV 가져오기](https://help.hellobonsai.com/en/articles/1867510-importing-data-into-bonsai): 열 매핑과 미리보기 후 import를 설명하며 자동 취소 불가를 안내한다. 현재 Companies라는 명칭과 캡처 Clients 차이 존재.
- [공개 API](https://docs.hellobonsai.com/api): 이 CSV 업로드·매핑·import job endpoint와 Expense 요청 필드 계약은 조회한 자료에서 확인하지 못했다.

## 7. 데이터 모델링 시사점

- ImportJob, 업로드 asset, 소스 열→업무 필드 매핑, 샘플 미리보기, 행·필드별 validation error 후보.
- Expense의 name/amount/date/billable/currency 후보. Import의 required가 모든 생성 경로의 DB NOT NULL과 같다고 확정하지 않는다.
- 실패 원자성·재시도 중복·batch ID를 설계하기 전 후속 검증 필요.

## 8. 미확인 사항과 검토 질문

- 동일 CSV 재시도의 중복 방지와 부분 성공 여부를 확인.
- Billable 빈 값 default, 음수 금액 처리, Currency 누락·잘못된 값의 검증 순서 확인.
- 파일 크기·인코딩·날짜 locale·매핑 중복 허용 정책 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
