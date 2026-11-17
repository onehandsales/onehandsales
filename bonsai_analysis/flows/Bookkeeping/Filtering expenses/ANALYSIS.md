# Filtering expenses 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `bd0a6592-522b-4dcd-94ff-68324e44e3b0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=bd0a6592-522b-4dcd-94ff-68324e44e3b0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

날짜·업무 상태·분류·영수증 조건을 조합하여 비용 목록을 좁히고, 조건을 일부 제거해 결과를 복원한다.

- 시작: 비용 세 건 목록. 종료: 날짜·Non-billable 조건으로 두 건을 표시하는 목록.
- 행위자: 목록 조회 사용자. 조회 범위에 따른 권한은 미확인.
- 프론트 구현: 중첩 달력과 드롭다운, 조건 칩, 개별 해제, 결과 없음, 조건 유지.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_762c1f934fdf40c0a61898b036cf4616`](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Expenses 등록 목록 | Filters 패널 열림. |
| 02 | [`sc_d933051f131742878fd3b7992b784b58`](https://gummble.com/screens/sc_d933051f131742878fd3b7992b784b58?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 필터 패널 | 기간 입력 아래 두 달 달력 열림. |
| 03 | [`sc_d6923fc2dd1843ef85ea11d192c1cfba`](https://gummble.com/screens/sc_d6923fc2dd1843ef85ea11d192c1cfba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기간 선택 달력 | Last 30 Days 선택으로 날짜·칩 반영. |
| 04 | [`sc_8d52b4731477483e967166b109d3e130`](https://gummble.com/screens/sc_8d52b4731477483e967166b109d3e130?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 최근 30일 선택 | 날짜 팝오버 대신 Status 옵션 열림. |
| 05 | [`sc_c0df8e7cb43645fab75e48a751e11e1f`](https://gummble.com/screens/sc_c0df8e7cb43645fab75e48a751e11e1f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 비용 상태 옵션 | Non-billable 선택으로 목록 두 건. |
| 06 | [`sc_9472a2a6376e41d8987c712e8b0e4c2a`](https://gummble.com/screens/sc_9472a2a6376e41d8987c712e8b0e4c2a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Non-billable 필터 적용 | Advertising 분류 조건 추가로 빈 결과. |
| 07 | [`sc_b42355233a9d48a0b7e6cb1f59b1188c`](https://gummble.com/screens/sc_b42355233a9d48a0b7e6cb1f59b1188c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 분류 조건 추가 | Has Receipt Yes 추가; 빈 결과 유지. |
| 08 | [`sc_175c603fb16f4914871354d11799a18c`](https://gummble.com/screens/sc_175c603fb16f4914871354d11799a18c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 영수증 조건 추가 | 패널을 닫고 조건 칩·No expenses yet. 확인. |
| 09 | [`sc_0132ede06b5a43d4b7e5de16c014c8de`](https://gummble.com/screens/sc_0132ede06b5a43d4b7e5de16c014c8de?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 필터 결과 없음 | 분류와 영수증 조건을 해제한 상태에서 두 행 복원. |
| 10 | [`sc_338529d95e114b51834d62e3666c2559`](https://gummble.com/screens/sc_338529d95e114b51834d62e3666c2559?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 조건 일부 해제 후 결과 복원 | 날짜·상태 조건이 남은 목록에서 기록 종료. |

## 4. 화면별 상세 분석

### 단계 01 — Expenses 등록 목록

- Screen ID: `sc_762c1f934fdf40c0a61898b036cf4616`
- 원본: [화면 페이지](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/549dc499-2f3b-4b0d-9534-73c488617a77.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d933051f131742878fd3b7992b784b58`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 검색·Filters·더보기·New Expense, Name/Date/Category/Amount 테이블.
- 입력 항목·필수 표시·기본값: 비용 세 행, Non-billable 보조 문구, Personal/Advertising 분류 칩과 금액, 영수증·반복처럼 보이는 상태 아이콘.
- 버튼·메뉴·안내 문구: 검색, Filters, New Expense, 목록 및 행의 더보기.
- 확인된 상태: 실데이터가 있는 목록. 이전 시작 안내와 달리 세 비용을 표시한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 전후 이미지 사이에 등록 과정이 빠져 있다. 앞선 CTA를 누르기만 하면 세 항목이 자동 생성된다고 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아이콘의 정확한 의미, 정렬·검색 범위, 청구 연결과 세금.

#### 모델링 영향

- 후보와 근거: 비용·분류·프로젝트 청구 상태·첨부·반복 관련 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 비용 필터 패널

- Screen ID: `sc_d933051f131742878fd3b7992b784b58`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d933051f131742878fd3b7992b784b58?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4f1f4bcc-c63f-4cb7-a968-9dc36ab1b23a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_762c1f934fdf40c0a61898b036cf4616` → 현재 → `sc_d6923fc2dd1843ef85ea11d192c1cfba`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt.
- 입력 항목·필수 표시·기본값: 조건 모두 미선택. 금액 0.00은 회색 예시이며 실제 0 기본조건인지 미확인.
- 버튼·메뉴·안내 문구: Filters와 각 드롭다운·날짜·금액 입력.
- 확인된 상태: 조건 편집 패널 열린 상태.
- 단계 간 변화: Filters 패널 열림.

#### 동작과 데이터

- 화면 관찰: 명시적 Apply 버튼은 보이지 않는다. 버튼이 없다는 사실로 저장 방식을 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 기간·상태·분류·고객·프로젝트·통화·금액 범위·첨부 유무 필터 계약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 기간 선택 달력

- Screen ID: `sc_d6923fc2dd1843ef85ea11d192c1cfba`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d6923fc2dd1843ef85ea11d192c1cfba?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bbc5e81d-bf63-4d7d-bad8-9d690ab31dbe.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d933051f131742878fd3b7992b784b58` → 현재 → `sc_8d52b4731477483e967166b109d3e130`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt. 날짜 입력 아래 두 달 달력과 우측 빠른 기간 목록.
- 입력 항목·필수 표시·기본값: February/March 2024. Last 30 Days, This Month, Last Month, Last 90 Days, Last 3/6/12 Months, This Year, Last Year.
- 버튼·메뉴·안내 문구: 이전/다음 달, 날짜 셀, 빠른 기간, Close.
- 확인된 상태: 기간 미선택 달력.
- 단계 간 변화: 기간 입력 아래 두 달 달력 열림.

#### 동작과 데이터

- 화면 관찰: 날짜 범위 직접 선택과 미리 정의된 기간이 병존한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: date-only 범위와 상대 기간 preset 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 최근 30일 선택

- Screen ID: `sc_8d52b4731477483e967166b109d3e130`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8d52b4731477483e967166b109d3e130?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1e321725-a580-49aa-909a-5d82f31e0278.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d6923fc2dd1843ef85ea11d192c1cfba` → 현재 → `sc_c0df8e7cb43645fab75e48a751e11e1f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt. 달력 열린 채 기간 강조.
- 입력 항목·필수 표시·기본값: Jan 7–Feb 6 2024, Last 30 Days 선택.
- 버튼·메뉴·안내 문구: Clear와 기간 변경.
- 확인된 상태: 상단 필터 칩이 배경에 나타남.
- 단계 간 변화: Last 30 Days 선택으로 날짜·칩 반영.

#### 동작과 데이터

- 화면 관찰: 기간 선택 후 입력과 배경 칩이 바뀐다. 30일의 포함 경계는 계산으로 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 기간·상태·분류·고객·프로젝트·통화·금액 범위·첨부 유무 필터 계약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 비용 상태 옵션

- Screen ID: `sc_c0df8e7cb43645fab75e48a751e11e1f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c0df8e7cb43645fab75e48a751e11e1f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/18a9992a-979a-47f8-b938-768c90832ada.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8d52b4731477483e967166b109d3e130` → 현재 → `sc_9472a2a6376e41d8987c712e8b0e4c2a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt.
- 입력 항목·필수 표시·기본값: Status 옵션: Uncategorized; Billable, reimbursed; Billable, not-reimbursed; Non-billable; Recurring; Questionable Deduction.
- 버튼·메뉴·안내 문구: 상태 드롭다운.
- 확인된 상태: 날짜 범위 유지, 상태 옵션 펼침.
- 단계 간 변화: 날짜 팝오버 대신 Status 옵션 열림.

#### 동작과 데이터

- 화면 관찰: 반복·세금판단·청구 상태가 한 필터에 함께 있다. 이를 단일 배타적 DB enum으로 가정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 상태 필터용 파생 분류와 독립 업무 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Non-billable 필터 적용

- Screen ID: `sc_9472a2a6376e41d8987c712e8b0e4c2a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9472a2a6376e41d8987c712e8b0e4c2a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/51b7a672-7109-408a-8b24-86c71896a1bd.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c0df8e7cb43645fab75e48a751e11e1f` → 현재 → `sc_b42355233a9d48a0b7e6cb1f59b1188c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt.
- 입력 항목·필수 표시·기본값: Status Non-billable 선택과 제거 X.
- 버튼·메뉴·안내 문구: 상태 해제 X, 각 필터.
- 확인된 상태: 배경 목록은 두 비용만 보인다.
- 단계 간 변화: Non-billable 선택으로 목록 두 건.

#### 동작과 데이터

- 화면 관찰: 날짜 조건을 유지하며 상태 조건이 추가된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 기간·상태·분류·고객·프로젝트·통화·금액 범위·첨부 유무 필터 계약 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 분류 조건 추가

- Screen ID: `sc_b42355233a9d48a0b7e6cb1f59b1188c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b42355233a9d48a0b7e6cb1f59b1188c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d8ed2063-6e41-4ea5-a61d-4d4ac446580c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9472a2a6376e41d8987c712e8b0e4c2a` → 현재 → `sc_175c603fb16f4914871354d11799a18c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt.
- 입력 항목·필수 표시·기본값: Category Advertising 칩, 날짜·Non-billable 유지.
- 버튼·메뉴·안내 문구: 분류 칩 개별 X와 필드 제거 X.
- 확인된 상태: 배경 목록 행이 사라지고 빈 영역.
- 단계 간 변화: Advertising 분류 조건 추가로 빈 결과.

#### 동작과 데이터

- 화면 관찰: 조건 추가 후 결과 감소가 관찰된다. AND 의미로 보이지만 전체 조합 규칙은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 복수 선택처럼 보이는 분류 칩과 조건 조합 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 영수증 조건 추가

- Screen ID: `sc_175c603fb16f4914871354d11799a18c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_175c603fb16f4914871354d11799a18c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7ee21720-14f2-4c29-84d8-40680ac1697a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b42355233a9d48a0b7e6cb1f59b1188c` → 현재 → `sc_0132ede06b5a43d4b7e5de16c014c8de`

#### 화면에서 직접 확인한 내용

- 레이아웃: 두 열의 Filters 팝오버. Date Range·Status·Category·Client·Currency·Project·Min Amount·Max Amount·Has Receipt.
- 입력 항목·필수 표시·기본값: Has Receipt Yes, 날짜·상태·분류 유지.
- 버튼·메뉴·안내 문구: 영수증 값 제거 X.
- 확인된 상태: 필터 칩 Has Receipt Yes가 배경에 추가.
- 단계 간 변화: Has Receipt Yes 추가; 빈 결과 유지.

#### 동작과 데이터

- 화면 관찰: 영수증 유무가 목록 조건이다. 일반 첨부와 영수증의 구분은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 영수증 연관 존재성 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 필터 결과 없음

- Screen ID: `sc_0132ede06b5a43d4b7e5de16c014c8de`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0132ede06b5a43d4b7e5de16c014c8de?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5435ea9d-2827-4f36-a43b-9358ea29a787.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_175c603fb16f4914871354d11799a18c` → 현재 → `sc_338529d95e114b51834d62e3666c2559`

#### 화면에서 직접 확인한 내용

- 레이아웃: 팝오버 닫힘. 상단 조건 칩 다섯 개와 큰 빈 목록 영역.
- 입력 항목·필수 표시·기본값: START DATE / END DATE / CATEGORY Advertising / STATUS Non-billable / HAS RECEIPT Yes.
- 버튼·메뉴·안내 문구: 각 칩 X, Filters, New Expense.
- 확인된 상태: No expenses yet. 표시.
- 단계 간 변화: 패널을 닫고 조건 칩·No expenses yet. 확인.

#### 동작과 데이터

- 화면 관찰: 원장 전체가 비어 있는 것이 아니라 조건 적용 후 결과가 없는 맥락이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 필터 결과 빈 상태와 신규 계정 빈 상태 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 조건 일부 해제 후 결과 복원

- Screen ID: `sc_338529d95e114b51834d62e3666c2559`
- 원본: [화면 페이지](https://gummble.com/screens/sc_338529d95e114b51834d62e3666c2559?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/75f62925-37c9-414f-ad29-d301205d0c1d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0132ede06b5a43d4b7e5de16c014c8de` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 목록, 날짜 시작·끝과 상태 칩만 유지.
- 입력 항목·필수 표시·기본값: Non-billable 두 비용 행.
- 버튼·메뉴·안내 문구: 남은 칩 X와 Filters.
- 확인된 상태: 두 행이 다시 표시된다.
- 단계 간 변화: 분류와 영수증 조건을 해제한 상태에서 두 행 복원.

#### 동작과 데이터

- 화면 관찰: Category와 Has Receipt 조건이 제거된 상태다. 두 제거 사이 중간 화면은 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 조건 결합 논리·적용 타이밍·서버 저장·날짜 경계와 통화별 금액 비교는 미확인.

#### 모델링 영향

- 후보와 근거: 조건별 해제와 재조회·기존 조건 유지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 조건 변경 중 배경 목록이 바뀌며 별도 Apply 버튼은 보이지 않는다. 정확한 이벤트·debounce는 미확인.
- 관찰: 기간은 시작·종료 칩으로 나뉜다. 선택 조건은 개별 제거가 가능하다.
- 관찰: No expenses yet. 문구가 필터 결과 0건에도 쓰인다. 신규 계정 빈 화면과 맥락을 구분한다.
- 설계 가정: Status의 Recurring·Questionable Deduction·청구 상태를 하나의 DB enum으로 단순 복제하지 않는다.
- 미확인: 조건 AND/OR·금액 경계 포함·통화 변환·복수 Category·검색과 필터의 결합.

## 6. 공식 도움말과 API 대조

- [비용 일괄 편집 도움말](https://help.hellobonsai.com/en/articles/1865151-how-to-bulk-edit-your-expenses)은 검색·날짜·분류 등을 통해 대상을 좁힐 수 있다고 설명한다. 이 화면의 모든 필터 연산·복수값 의미까지 명세하지는 않는다.
- [공식 API 목록](https://docs.hellobonsai.com/api)에서 비용 목록 필터 endpoint·query 필드는 미확인. 이미지의 레이블을 그대로 서버 필드명으로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: expense date, currency, category, related client/project, receipt existence, monetary range의 조회 계약 후보.
- 설계 가정: 상태 필터는 여러 원본 속성을 해석한 파생 조건일 수 있다. 청구·상환·반복·세금 판단을 구분한다.
- 필터 저장 범위는 화면 세션·개인 보기·계정 공통 중 미확정. 화면만으로 View 테이블을 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 복수 분류는 OR인가 AND인가? 둘 이상 선택한 추가 화면 또는 계정 확인.
- 날짜 범위는 양끝 포함인가? 자정·시간대·하루 범위 시험.
- Has Receipt는 영수증 전용 객체인가 일반 이미지 첨부인가? 영수증·메모 추가 흐름과 대조.
- 필터를 유지한 채 CSV·일괄 편집을 실행하면 대상 범위가 일치하는가? 내보내기와 선택 범위 교차 검증.
- 검색·페이지 이동·새로고침 후 조건과 선택 집합이 유지되는가? 실제 계정 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
