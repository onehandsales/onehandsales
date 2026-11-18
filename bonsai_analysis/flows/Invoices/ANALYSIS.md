# Invoices 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0ede7d7b-1ed5-487a-9dbd-b63ef818a29e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0ede7d7b-1ed5-487a-9dbd-b63ef818a29e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

청구 담당자가 인보이스 목록과 기본값·표시 설정의 진입 위치를 확인한다.

- Dashboard에서 Invoices로 진입한다. 목록에는 단일 구독형 초안이 보인다.
- Default Values와 전체 화면 Invoice Settings를 차례로 탐색한다. 생성·발송 자체는 하위 플로우다.

- 하위 플로우: [Adding a new invoice](Adding%20a%20new%20invoice/ANALYSIS.md), [Updating invoice settings](Updating%20invoice%20settings/ANALYSIS.md), [Editing default values (Invoices)](Editing%20default%20values%20%28Invoices%29/ANALYSIS.md), [Connecting to Stripe](Connecting%20to%20Stripe/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Invoices`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | Invoices 목록으로 이동한다. 두 화면의 날짜·집계 차이를 메뉴 클릭의 데이터 변경으로 해석하지 않는다. |
| 02 | [`sc_21f42247e22948b3b35d5313e9e315a5`](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [인보이스 목록과 결제 연결 안내](<screens/02_sc_21f42247e22948b3b35d5313e9e315a5.png>) | Default Values 탭으로 이동한다. |
| 03 | [`sc_22fa89558d47416c89104f9b96182708`](https://gummble.com/screens/sc_22fa89558d47416c89104f9b96182708?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [향후 인보이스 기본값](<screens/03_sc_22fa89558d47416c89104f9b96182708.png>) | Invoice Settings 전체 화면을 연다. |
| 04 | [`sc_b96b8024d9e94f8aa91b24da19fc2935`](https://gummble.com/screens/sc_b96b8024d9e94f8aa91b24da19fc2935?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [인보이스 표현 설정 Studio](<screens/04_sc_b96b8024d9e94f8aa91b24da19fc2935.png>) | 설정 화면 탐색에서 종료. 변경·저장은 하위 플로우에 기록. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_21f42247e22948b3b35d5313e9e315a5`

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

### 단계 02 — 인보이스 목록과 결제 연결 안내

- Screen ID: `sc_21f42247e22948b3b35d5313e9e315a5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/350ed68e-021e-4ff8-9e83-3c90f3405098.png)
- 로컬 이미지: [02_sc_21f42247e22948b3b35d5313e9e315a5.png](<screens/02_sc_21f42247e22948b3b35d5313e9e315a5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_22fa89558d47416c89104f9b96182708`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 사이드바·상단 전역바, Invoices/Settings/Default Values 탭. 결제 홍보 패널 아래 검색과 표.
- 입력 항목·필수 표시·기본값: 한 행 #1001, 발행 Feb07 2024·만기 Mar08 2024, Doe Company/Design Project with Doe Studio, Total/Paid $0.00. 검색 비어 있음.
- 버튼·메뉴·안내 문구: Cards/Bank Transfer/PayPal 꺼진 토글, 안내 닫기, Filters, Edit Payment Methods, New Invoice, 행 … 및 정렬 아이콘.
- 확인된 상태: 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점.
- 단계 간 변화: Invoices 목록으로 이동한다. 두 화면의 날짜·집계 차이를 메뉴 클릭의 데이터 변경으로 해석하지 않는다.

#### 동작과 데이터

- 화면 관찰: 문서 금액과 수납액이 별도이며 발행일과 만기일도 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 점 색상 의미·필터조건·결제연결 요구사항 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 요약 목록·반복 시리즈·결제수단 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 향후 인보이스 기본값

- Screen ID: `sc_22fa89558d47416c89104f9b96182708`
- 원본: [화면 페이지](https://gummble.com/screens/sc_22fa89558d47416c89104f9b96182708?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f3b7b5e8-47ff-4a4c-aeb2-e49289acad4f.png)
- 로컬 이미지: [03_sc_22fa89558d47416c89104f9b96182708.png](<screens/03_sc_22fa89558d47416c89104f9b96182708.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_21f42247e22948b3b35d5313e9e315a5` → 현재 → `sc_b96b8024d9e94f8aa91b24da19fc2935`

#### 화면에서 직접 확인한 내용

- 레이아웃: Default Values 탭 아래 넓은 Invoice Defaults 카드. 좌측 설명·우측 입력, 상단 Save Changes.
- 입력 항목·필수 표시·기본값: 수수료 고객 부담 unchecked, Late Fee 0.0%, Tax 0.0%, Days Until Due 회색30, Tax ID 예시값 TAX-123. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes. 새로 만드는 인보이스에 적용된다는 설명. 연체료는 만기 다음날과 이후 매월, 세금은 할인 차감 후 소계라는 안내.
- 확인된 상태: 저장 전 기본 설정 조회. 회색 예시는 실제 저장값인지 placeholder인지 구분 필요.
- 단계 간 변화: Default Values 탭으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 계정 기본 정책 편집 영역. 기존 문서 변경과 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 국가별 세법 적합성·계산 반올림·30일 대 한달 차이 미확인.

#### 모델링 영향

- 후보와 근거: 미래 문서 초기값과 문서별 스냅샷 후보. 법적 세율을 이 샘플로 확정하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 인보이스 표현 설정 Studio

- Screen ID: `sc_b96b8024d9e94f8aa91b24da19fc2935`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b96b8024d9e94f8aa91b24da19fc2935?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/77f09916-d140-4cf6-90ad-dbafa50686ba.png)
- 로컬 이미지: [04_sc_b96b8024d9e94f8aa91b24da19fc2935.png](<screens/04_sc_b96b8024d9e94f8aa91b24da19fc2935.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_22fa89558d47416c89104f9b96182708` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 사이드바가 없는 전체 화면. 왼쪽 설정·오른쪽 Demo Invoice 미리보기, 상단 고정 Close/Save.
- 입력 항목·필수 표시·기본값: Invoice Layout Studio 선택(Foundation/Classic 대안), Payment Page Side-By-Side 선택(Single-Column 대안), Timesheet는 링크 표시. 첨부 잠금·부분결제·팁 off, 프로젝트명 on, 단위숨김·세자리rate off.
- 버튼·메뉴·안내 문구: Update Branding, Learn More, Close, Save Changes. 기존/신규 인보이스 모두 적용 안내.
- 확인된 상태: 문서 테마와 결제 페이지 레이아웃을 별도 선택. 미리보기는 실제 청구서가 아니다.
- 단계 간 변화: Invoice Settings 전체 화면을 연다.

#### 동작과 데이터

- 화면 관찰: 표시 정책과 결제 관련 옵션이 같은 설정 페이지에 함께 있으나 서로 다른 필드다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Close 시 수정 폐기 여부, 요금제 제한, 기존 PDF 재생성 미확인.

#### 모델링 영향

- 후보와 근거: 계정 문서 스타일·결제 페이지 표시·첨부 접근·금액표현 정책 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Issued On·Due Date·번호·Project·Client·Total·Paid를 따로 표시한다.
- [관찰] 온라인 결제 수단 안내와 실제 인보이스 목록은 별도 영역이다. 토글이 꺼져도 초안 목록은 존재한다.
- [관찰] 기본값은 향후 문서, 레이아웃 설정은 기존·신규 문서에 적용된다는 안내가 서로 다르다.

## 6. 공식 도움말과 API 대조

- [인보이스 생성 도움말](https://help.hellobonsai.com/en/articles/2899904-how-to-create-an-invoice): 유형·고객·프로젝트 선택 후 문서 편집으로 이어진다. 현행 세금은 항목별 세율 선택도 설명하므로 캡처의 전체 세율과 구분한다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 인보이스와 프로젝트·고객 연결, 문서 번호, 발행일/만기일, 금액/지급액, 상태, 반복 시리즈 후보.
- 계정 기본값·표현 설정·문서별 값·결제 연결 상태를 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 회색 점의 상태를 텍스트·툴팁으로 확인해야 한다. 색상만으로 모든 상태 코드를 확정하지 않는다.
- 검색·Filters·정렬의 옵션 및 페이지네이션은 수록되지 않아 추가 화면이 필요하다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
