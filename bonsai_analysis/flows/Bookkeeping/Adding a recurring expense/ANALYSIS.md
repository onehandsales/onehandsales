# Adding a recurring expense 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **11/11단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f01f87a5-8396-4774-8387-e11c5e0afe03` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f01f87a5-8396-4774-8387-e11c5e0afe03) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 11단계 / 11단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 11개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

이름·금액·분류를 입력한 비용에 청구 가능 여부와 반복 간격을 설정하고, 오류를 수정한 뒤 이미지를 첨부해 미청구 비용을 생성한다.

- 시작: Expenses 시작 안내. 종료: 미청구 비용 생성 성공 알림과 새 목록 행.
- 기록은 프로젝트 미선택 상태를 포함한다. 프로젝트 필수 여부를 UI 라벨보다 강하게 확정하지 않는다.
- 하위 이미지·메모 추가 흐름이 생성 폼 중간에 연결된다.
- 프론트 구현: 조건부 반복 입력, 폼 값 보존, 오류 배너, 이미지 미리보기, 생성 후 목록.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)
- 하위 플로우: [Adding an image and note](Adding%20an%20image%20and%20note/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Bookkeeping/Adding a recurring expense`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_caa5fecb95834209b2da82d078b11ebb`](https://gummble.com/screens/sc_caa5fecb95834209b2da82d078b11ebb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Expenses 시작 안내](<screens/01_sc_caa5fecb95834209b2da82d078b11ebb.png>) | New Expense 모달 진입. |
| 02 | [`sc_ff5a563f088a494a8b00075bfd397612`](https://gummble.com/screens/sc_ff5a563f088a494a8b00075bfd397612?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 비용 입력 전](<screens/02_sc_ff5a563f088a494a8b00075bfd397612.png>) | 이름 입력값 반영. |
| 03 | [`sc_d7991018ae0044c98087ba65d7a7d81a`](https://gummble.com/screens/sc_d7991018ae0044c98087ba65d7a7d81a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 이름 입력](<screens/03_sc_d7991018ae0044c98087ba65d7a7d81a.png>) | Category 드롭다운 펼침. |
| 04 | [`sc_9855446134c0466b89baaf231f9bae69`](https://gummble.com/screens/sc_9855446134c0466b89baaf231f9bae69?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 분류 선택 목록](<screens/04_sc_9855446134c0466b89baaf231f9bae69.png>) | Advertising 분류 선택. |
| 05 | [`sc_eb120c6950b941a6a6ecd5b0e769ede9`](https://gummble.com/screens/sc_eb120c6950b941a6a6ecd5b0e769ede9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [광고 분류 선택](<screens/05_sc_eb120c6950b941a6a6ecd5b0e769ede9.png>) | 금액 125 입력. |
| 06 | [`sc_919b87e481c04c1f977cac28e450c648`](https://gummble.com/screens/sc_919b87e481c04c1f977cac28e450c648?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 금액 입력](<screens/06_sc_919b87e481c04c1f977cac28e450c648.png>) | Billable·Recurring 선택 및 반복 입력 표시. |
| 07 | [`sc_6fe8d6e6d695499482e54e7450a78426`](https://gummble.com/screens/sc_6fe8d6e6d695499482e54e7450a78426?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [청구 가능·반복 비용 활성](<screens/07_sc_6fe8d6e6d695499482e54e7450a78426.png>) | 반복 간격 양수 요구 오류 배너 표시. |
| 08 | [`sc_cc59343d151a4826a70cf6f0e5fcabc9`](https://gummble.com/screens/sc_cc59343d151a4826a70cf6f0e5fcabc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [반복 간격 검증 오류](<screens/08_sc_cc59343d151a4826a70cf6f0e5fcabc9.png>) | 30 Days로 수정하고 오류 배너 해제. |
| 09 | [`sc_b043c6159c5c471cbe94f4348870bdf7`](https://gummble.com/screens/sc_b043c6159c5c471cbe94f4348870bdf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [반복 간격 수정](<screens/09_sc_b043c6159c5c471cbe94f4348870bdf7.png>) | 이미지·메모 입력된 상태로 전환; 하위 플로우 참고. |
| 10 | [`sc_6a379149894d4eaca9a9de59332165c3`](https://gummble.com/screens/sc_6a379149894d4eaca9a9de59332165c3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이미지·메모를 포함한 비용 폼](<screens/10_sc_6a379149894d4eaca9a9de59332165c3.png>) | 미청구 비용 생성 알림과 목록 복귀. |
| 11 | [`sc_77399bad710b4a3c8027c4ec6af773dc`](https://gummble.com/screens/sc_77399bad710b4a3c8027c4ec6af773dc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [반복 비용 생성 결과](<screens/11_sc_77399bad710b4a3c8027c4ec6af773dc.png>) | 생성 결과 확인. 다음 반복 발생은 기록되지 않음. |

## 4. 화면별 상세 분석

### 단계 01 — Expenses 시작 안내

- Screen ID: `sc_caa5fecb95834209b2da82d078b11ebb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_caa5fecb95834209b2da82d078b11ebb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/743f19e0-95db-4c51-a9c3-ac7f79c96cec.png)
- 로컬 이미지: [01_sc_caa5fecb95834209b2da82d078b11ebb.png](<screens/01_sc_caa5fecb95834209b2da82d078b11ebb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_ff5a563f088a494a8b00075bfd397612`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 큰 좌우 분할 안내 카드. 왼쪽 은행·비용 예시 일러스트, 오른쪽 설명과 세로 CTA.
- 입력 항목·필수 표시·기본값: 실제 비용 입력 폼은 없고 안내용 예시 카드만 있다.
- 버튼·메뉴·안내 문구: Connect Bank Account / Add Expense Manually / Contact Support.
- 확인된 상태: 비용 추적 시작 안내 상태. 실제 등록 비용 목록과 안내용 샘플을 구분해야 한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 은행 연결과 수동 등록의 두 진입 경로가 보인다. 연결만으로 비용이 생성되는지는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 어떤 조건에서 안내가 목록으로 전환되는지, 은행 연결의 국가별 지원.

#### 모델링 영향

- 후보와 근거: 은행 연동 상태와 비용 데이터 유무는 별도 UI 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 비용 입력 전

- Screen ID: `sc_ff5a563f088a494a8b00075bfd397612`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ff5a563f088a494a8b00075bfd397612?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a0400ce5-7876-4b67-813e-b9b605f2aacf.png)
- 로컬 이미지: [02_sc_ff5a563f088a494a8b00075bfd397612.png](<screens/02_sc_ff5a563f088a494a8b00075bfd397612.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_caa5fecb95834209b2da82d078b11ebb` → 현재 → `sc_d7991018ae0044c98087ba65d7a7d81a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Name/Category/Amount/USD/Date/Billable, Project (Optional), Recurring Expense. 회색 Travel expenses·200.00은 예시 텍스트로 보인다. 별표 없음.
- 버튼·메뉴·안내 문구: Add Image/Receipt / Add Note / Create Expense / 닫기.
- 확인된 상태: Business 활성, Billable·Recurring 미선택. 프로젝트 칸 No active projects yet...
- 단계 간 변화: New Expense 모달 진입.

#### 동작과 데이터

- 화면 관찰: Optional은 프로젝트에 명시된다. 나머지는 별표가 없다는 이유로 선택값이라 단정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비용 이름 입력

- Screen ID: `sc_d7991018ae0044c98087ba65d7a7d81a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d7991018ae0044c98087ba65d7a7d81a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5cb09b19-d56b-44c6-9ba1-2997f5dc5511.png)
- 로컬 이미지: [03_sc_d7991018ae0044c98087ba65d7a7d81a.png](<screens/03_sc_d7991018ae0044c98087ba65d7a7d81a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ff5a563f088a494a8b00075bfd397612` → 현재 → `sc_9855446134c0466b89baaf231f9bae69`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Name Travel expenses가 검은 입력값. 다른 값은 유지.
- 버튼·메뉴·안내 문구: Create Expense, 분류 선택, 이미지·메모.
- 확인된 상태: 이름 입력 후 저장 전.
- 단계 간 변화: 이름 입력값 반영.

#### 동작과 데이터

- 화면 관찰: 입력값 변화가 보이며 아직 비용 생성 결과는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 비용 분류 선택 목록

- Screen ID: `sc_9855446134c0466b89baaf231f9bae69`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9855446134c0466b89baaf231f9bae69?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a920386b-4040-42d9-bab5-4ec240028fa7.png)
- 로컬 이미지: [04_sc_9855446134c0466b89baaf231f9bae69.png](<screens/04_sc_9855446134c0466b89baaf231f9bae69.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d7991018ae0044c98087ba65d7a7d81a` → 현재 → `sc_eb120c6950b941a6a6ecd5b0e769ede9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Category 그룹 ADS & MARKETING, COGS, COMMISSIONS & FEES와 Advertising·Cost of Labor·Materials & Supplies·Misc COGS·Misc Fees.
- 버튼·메뉴·안내 문구: 그룹별 분류 옵션, Create Expense.
- 확인된 상태: 분류 드롭다운 펼침.
- 단계 간 변화: Category 드롭다운 펼침.

#### 동작과 데이터

- 화면 관찰: 분류 그룹과 실제 선택 항목을 구분한다. 옵션 전체는 스크롤 아래 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 광고 분류 선택

- Screen ID: `sc_eb120c6950b941a6a6ecd5b0e769ede9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eb120c6950b941a6a6ecd5b0e769ede9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/02ba2b2b-0773-4a60-940d-4a6a523019c2.png)
- 로컬 이미지: [05_sc_eb120c6950b941a6a6ecd5b0e769ede9.png](<screens/05_sc_eb120c6950b941a6a6ecd5b0e769ede9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9855446134c0466b89baaf231f9bae69` → 현재 → `sc_919b87e481c04c1f977cac28e450c648`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Category Advertising와 제거 X, 이름 유지. 금액은 회색 200.00.
- 버튼·메뉴·안내 문구: 분류 제거·변경, Create Expense.
- 확인된 상태: 분류 선택 후 저장 전.
- 단계 간 변화: Advertising 분류 선택.

#### 동작과 데이터

- 화면 관찰: 표시된 금액 예시를 이미 입력된 비용으로 보지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 비용 금액 입력

- Screen ID: `sc_919b87e481c04c1f977cac28e450c648`
- 원본: [화면 페이지](https://gummble.com/screens/sc_919b87e481c04c1f977cac28e450c648?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/08ebf67d-742c-4032-87ba-495dcd4171a3.png)
- 로컬 이미지: [06_sc_919b87e481c04c1f977cac28e450c648.png](<screens/06_sc_919b87e481c04c1f977cac28e450c648.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_eb120c6950b941a6a6ecd5b0e769ede9` → 현재 → `sc_6fe8d6e6d695499482e54e7450a78426`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Amount 125, USD, Date Feb 6 2024, Advertising.
- 버튼·메뉴·안내 문구: Create Expense, Billable, Recurring Expense.
- 확인된 상태: 금액 입력 후, 두 체크는 미선택.
- 단계 간 변화: 금액 125 입력.

#### 동작과 데이터

- 화면 관찰: 통화와 금액은 별도 입력 컨트롤이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 청구 가능·반복 비용 활성

- Screen ID: `sc_6fe8d6e6d695499482e54e7450a78426`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6fe8d6e6d695499482e54e7450a78426?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d9aa15e2-055a-45f9-b0a9-d27ed688d49e.png)
- 로컬 이미지: [07_sc_6fe8d6e6d695499482e54e7450a78426.png](<screens/07_sc_6fe8d6e6d695499482e54e7450a78426.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_919b87e481c04c1f977cac28e450c648` → 현재 → `sc_cc59343d151a4826a70cf6f0e5fcabc9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Billable·Recurring 체크. Repeat Every 숫자와 단위 선택이 추가. Project Select... 미선택.
- 버튼·메뉴·안내 문구: 반복 간격·단위, 프로젝트, Create Expense.
- 확인된 상태: 조건부 반복 입력 영역 표시.
- 단계 간 변화: Billable·Recurring 선택 및 반복 입력 표시.

#### 동작과 데이터

- 화면 관찰: 두 체크가 함께 바뀌어 각각의 변경 순서는 미확인. 반복 입력 10은 회색 예시로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 반복 간격 검증 오류

- Screen ID: `sc_cc59343d151a4826a70cf6f0e5fcabc9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc59343d151a4826a70cf6f0e5fcabc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/32eaab81-5379-40dd-919c-40395fbdd75e.png)
- 로컬 이미지: [08_sc_cc59343d151a4826a70cf6f0e5fcabc9.png](<screens/08_sc_cc59343d151a4826a70cf6f0e5fcabc9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6fe8d6e6d695499482e54e7450a78426` → 현재 → `sc_b043c6159c5c471cbe94f4348870bdf7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: 반복 숫자 칸은 회색 10, 단위 미선택. 비용 이름·125·USD·날짜 보존.
- 버튼·메뉴·안내 문구: Create Expense, 반복 값 수정, 닫기.
- 확인된 상태: 붉은 배너: Please enter a time greater than 0 to the recurring option.
- 단계 간 변화: 반복 간격 양수 요구 오류 배너 표시.

#### 동작과 데이터

- 화면 관찰: 양수 간격 요구 문구를 직접 확인했다. 숫자 10이 입력된 상태에서 오류라고 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검증 실행 시점·서버/클라이언트 위치·단위 미선택 오류·허용 정수 범위.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 반복 간격 수정

- Screen ID: `sc_b043c6159c5c471cbe94f4348870bdf7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b043c6159c5c471cbe94f4348870bdf7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36b9aeaa-ae20-4de4-9418-f8b8280be7ce.png)
- 로컬 이미지: [09_sc_b043c6159c5c471cbe94f4348870bdf7.png](<screens/09_sc_b043c6159c5c471cbe94f4348870bdf7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cc59343d151a4826a70cf6f0e5fcabc9` → 현재 → `sc_6a379149894d4eaca9a9de59332165c3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: Repeat Every 30 / Days, Billable·Recurring 선택. 프로젝트는 Select...
- 버튼·메뉴·안내 문구: Create Expense, Add Image/Receipt, Add Note.
- 확인된 상태: 오류 배너가 사라진 폼.
- 단계 간 변화: 30 Days로 수정하고 오류 배너 해제.

#### 동작과 데이터

- 화면 관찰: 30일 반복값의 한 사례. 매월과 30일을 같은 규칙으로 가정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 이미지·메모를 포함한 비용 폼

- Screen ID: `sc_6a379149894d4eaca9a9de59332165c3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a379149894d4eaca9a9de59332165c3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5ded1c45-67ba-456d-a114-381bfae6c8d8.png)
- 로컬 이미지: [10_sc_6a379149894d4eaca9a9de59332165c3.png](<screens/10_sc_6a379149894d4eaca9a9de59332165c3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b043c6159c5c471cbe94f4348870bdf7` → 현재 → `sc_77399bad710b4a3c8027c4ec6af773dc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경의 넓은 New Expense 모달. 왼쪽 비용 입력, 오른쪽 이미지·메모, 상단 Business/Personal, 하단 Create Expense.
- 입력 항목·필수 표시·기본값: 오른쪽 이미지 미리보기와 Notes에 Travel notes. 반복 30 Days와 비용 125 USD 유지.
- 버튼·메뉴·안내 문구: Remove Image / Create Expense / 닫기.
- 확인된 상태: 첨부와 메모가 채워졌고 비용 모달은 아직 열려 있다.
- 단계 간 변화: 이미지·메모 입력된 상태로 전환; 하위 플로우 참고.

#### 동작과 데이터

- 화면 관찰: 미리보기를 파일 영구 저장 완료로 해석하지 않는다. 생성은 별도 Create Expense 진입점.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수값 검증·소수 금액·시간대·취소 시 임시 첨부 정리·반복 실행 규칙은 추가 확인이 필요하다.

#### 모델링 영향

- 후보와 근거: 비용의 이름·카테고리·통화 금액·업무 날짜·청구 가능 여부·프로젝트·반복 설정·첨부·메모 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 반복 비용 생성 결과

- Screen ID: `sc_77399bad710b4a3c8027c4ec6af773dc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_77399bad710b4a3c8027c4ec6af773dc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d0e70151-16ed-4544-a42c-64a3a95f33b9.png)
- 로컬 이미지: [11_sc_77399bad710b4a3c8027c4ec6af773dc.png](<screens/11_sc_77399bad710b4a3c8027c4ec6af773dc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6a379149894d4eaca9a9de59332165c3` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 일반 목록으로 복귀. 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: 목록 한 행: Travel expenses, Advertising, 125, 날짜 Feb 5 2024, 이미지와 순환 화살표 아이콘.
- 버튼·메뉴·안내 문구: 목록 더보기 / New Expense / 행 더보기 / 토스트 닫기.
- 확인된 상태: You created a new unbilled expense. 알림.
- 단계 간 변화: 미청구 비용 생성 알림과 목록 복귀.

#### 동작과 데이터

- 화면 관찰: 미청구 비용 생성 결과를 확인한다. 입력 날짜 Feb 6과 목록 Feb 5 차이는 미해결.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력·목록 날짜 차이의 원인, 다음 발생일·중단·중복 실행·실패 재시도.

#### 모델링 영향

- 후보와 근거: 청구 가능 미청구 비용과 반복 규칙·발생분 식별·업무 날짜 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 프로젝트에 Optional 표시. Billable과 Recurring Expense는 각각 체크박스다.
- 관찰: 반복 간격이 유효하지 않으면 양수 입력을 요구하는 오류가 나타나며 기존 입력은 유지된다.
- 관찰: 30 Days와 명시적 Create Expense 버튼. 자동 저장·월 단위 반복으로 바꾸어 해석하지 않는다.
- 관찰: 결과 알림은 unbilled expense라고 표현한다. 고객 청구서 발행·입금 완료는 아니다.
- 미확인: 입력 Feb 6과 결과 Feb 5의 차이. 원인 확인 전 UTC 변환 규칙을 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [비용과 청구서 연결](https://help.hellobonsai.com/en/articles/1262317-how-to-add-expenses-to-an-invoice): 프로젝트의 미청구 비용을 청구서에 포함시키는 별도 동작을 설명한다. 반복 비용 생성 자체가 즉시 청구라는 뜻은 아니다.
- 반복 비용의 실행 주기·종료·휴일·시간대·과거 날짜 처리·발생분 수정의 공식 세부 계약은 이번 검색에서 확인하지 못했다.
- 공개 API의 Expense·recurrence 필드 계약은 미확인. 반복 청구서 문서를 반복 비용 규칙으로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: Expense와 선택적 Project 연결, billable 상태, currency/amount, expense date, category, note·attachment 후보.
- 설계 가정: RecurrenceRule의 간격 수치·단위와 발생한 Expense를 분리 검토한다. 화면만으로 독립 테이블을 확정하지 않는다.
- 실행 중복 방지·다음 발생일·중단·규칙 변경이 과거 발생분에 미치는 영향은 이후 업무 계약으로 정의한다.

## 8. 미확인 사항과 검토 질문

- 반복 간격은 정수만 허용하며 어떤 단위를 제공하는가? 모든 옵션과 오류 입력 확인.
- 다음 비용은 정확히 언제 생성되는가? 날짜 경계·시간대·일광절약시간·지난 날짜 시험.
- 프로젝트 미선택 Billable 비용을 나중에 청구하는 경로는 무엇인가? 편집·청구서 추가 흐름 확인.
- 규칙 수정·삭제가 이미 생성된 비용에 미치는 영향은 무엇인가? 반복 lifecycle 확인.
- 입력과 결과 날짜가 하루 다른 원인은 무엇인가? 원본 이미지와 실제 계정 재현 대조.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 11단계 재조회 및 원본 11개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
