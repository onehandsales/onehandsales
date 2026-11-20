# Reviews 플로우 분석

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **4/4단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/4단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-d501af32-ef6e-4ca1-8d3f-cf6e67874a08>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d501af32-ef6e-4ca1-8d3f-cf6e67874a08) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 4단계 / 4단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

방문자가 평점·영상·업종별 후기를 읽고 가입을 고려한다.

- Landing page와 업종별 페이지의 후기 재사용을 비교할 수 있다.
- 영상 재생·리뷰 제출은 수록되지 않았다.


- 폴더 위치: `bonsai_analysis/flows/Reviews`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **리뷰 페이지 hero**이다. 500,000+ 홍보, G2 Top performer·다른 플랫폼4.7 표시. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **후기 그리드 아래**이다. Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Landing page](<../Landing page/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_21f0e007e04d45edbd410a1dffdff04c`](https://gummble.com/screens/sc_21f0e007e04d45edbd410a1dffdff04c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [리뷰 페이지 hero](<screens/01_sc_21f0e007e04d45edbd410a1dffdff04c.png>) | 영상 후기 썸네일 — 영상은 재생 전 상태. |
| 02 | [`sc_a605cb0e7e164a64b2707c0a110eafa6`](https://gummble.com/screens/sc_a605cb0e7e164a64b2707c0a110eafa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [영상 후기 썸네일](<screens/02_sc_a605cb0e7e164a64b2707c0a110eafa6.png>) | 업종별 후기 카드 — Kimberly Accountant, Laura Coach, Nick Creative Director, Phil Communications Specialist, Megan Copywriter, Raewyn Virtual Assistant. |
| 03 | [`sc_7d668b0699a945e98ca3ccbe29066b7a`](https://gummble.com/screens/sc_7d668b0699a945e98ca3ccbe29066b7a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [업종별 후기 카드](<screens/03_sc_7d668b0699a945e98ca3ccbe29066b7a.png>) | 후기 그리드 아래 — Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부. |
| 04 | [`sc_a6b1e7be914645e293f35918c57e4ee9`](https://gummble.com/screens/sc_a6b1e7be914645e293f35918c57e4ee9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [후기 그리드 아래](<screens/04_sc_a6b1e7be914645e293f35918c57e4ee9.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 리뷰 페이지 hero

- Screen ID: `sc_21f0e007e04d45edbd410a1dffdff04c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f0e007e04d45edbd410a1dffdff04c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5b6fbc3f-1828-477b-90c1-12d8555713ba.png)
- 로컬 이미지: [01_sc_21f0e007e04d45edbd410a1dffdff04c.png](<screens/01_sc_21f0e007e04d45edbd410a1dffdff04c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 131, 고유 이미지 S523, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_a605cb0e7e164a64b2707c0a110eafa6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 큰 제목·사용자 수 홍보·리뷰 플랫폼 평점과 CTA, 아래 영상 썸네일.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Start free, G2 및 다른 리뷰 플랫폼 배지.
- 확인된 상태: 500,000+ 홍보, G2 Top performer·다른 플랫폼4.7 표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 홍보 평점이며 개별 원본 리뷰·산식은 확인하지 않았다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 집계 시점·외부 링크 목적지 미확인.

#### 모델링 영향

- 후보와 근거: 리뷰 출처·표시 평점·기준일 콘텐츠 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 집계 시점·외부 링크 목적지 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 영상 후기 썸네일

- Screen ID: `sc_a605cb0e7e164a64b2707c0a110eafa6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a605cb0e7e164a64b2707c0a110eafa6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ea81fca-37e1-4f2b-ad35-5bdfaced2ae0.png)
- 로컬 이미지: [02_sc_a605cb0e7e164a64b2707c0a110eafa6.png](<screens/02_sc_a605cb0e7e164a64b2707c0a110eafa6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 131, 고유 이미지 S524, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_21f0e007e04d45edbd410a1dffdff04c` → 현재 → `sc_7d668b0699a945e98ca3ccbe29066b7a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 넓은 둥근 영상 썸네일 중앙 초록 재생 버튼, 아래 업종별 후기 제목.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 재생 버튼.
- 확인된 상태: 영상은 재생 전 상태.
- 단계 간 변화: 영상 썸네일로 스크롤 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 인터뷰 내용·플레이어 동작은 확인하지 않았다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자막·재생 플랫폼·모달 여부 미확인.

#### 모델링 영향

- 후보와 근거: 영상 자산·포스터·재생 UI 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 자막·재생 플랫폼·모달 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 업종별 후기 카드

- Screen ID: `sc_7d668b0699a945e98ca3ccbe29066b7a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7d668b0699a945e98ca3ccbe29066b7a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d044dac2-5d31-48e6-aa10-18cacf9a39a3.png)
- 로컬 이미지: [03_sc_7d668b0699a945e98ca3ccbe29066b7a.png](<screens/03_sc_7d668b0699a945e98ca3ccbe29066b7a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 132, 고유 이미지 S525, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a605cb0e7e164a64b2707c0a110eafa6` → 현재 → `sc_a6b1e7be914645e293f35918c57e4ee9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 그리드에 이름·직무·후기, 아래 다음 행 일부.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 별도 제출·필터 버튼 없음.
- 확인된 상태: Kimberly Accountant, Laura Coach, Nick Creative Director, Phil Communications Specialist, Megan Copywriter, Raewyn Virtual Assistant.
- 단계 간 변화: 후기 그리드로 스크롤 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 후기에 청구·CRM·시간·은행 등이 언급되지만 제품 규칙은 아니다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 후기 원본·검증·정렬 기준 미확인.

#### 모델링 영향

- 후보와 근거: 후기·작성자 표시명·직무·본문 콘텐츠 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 후기 원본·검증·정렬 기준 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 후기 그리드 아래

- Screen ID: `sc_a6b1e7be914645e293f35918c57e4ee9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a6b1e7be914645e293f35918c57e4ee9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/88ef4fdd-a28e-4952-9670-e1e49c308c2c.png)
- 로컬 이미지: [04_sc_a6b1e7be914645e293f35918c57e4ee9.png](<screens/04_sc_a6b1e7be914645e293f35918c57e4ee9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 132, 고유 이미지 S526, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7d668b0699a945e98ca3ccbe29066b7a` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 3열 카드 연속. 위·아래 행 일부는 잘린 상태.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 리뷰 작성·필터·페이지 이동 버튼 없음.
- 확인된 상태: Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부.
- 단계 간 변화: 후기 하단으로 스크롤; 중간 행 일부 미수록 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 후기 본문 길이에 따라 여백이 달라지지만 카드 행 높이는 맞춰져 있다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목록 끝·전체 개수·중간 누락 카드 미확인.

#### 모델링 영향

- 후보와 근거: 후기 카드 높이·긴 본문 처리·콘텐츠 순서 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 목록 끝·전체 개수·중간 누락 카드 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 500,000+ 홍보, G2 Top performer·다른 플랫폼4.7 표시. — 입력 없음. | 집계 시점·외부 링크 목적지 미확인. |
| 02 | 영상은 재생 전 상태. — 입력 없음. | 자막·재생 플랫폼·모달 여부 미확인. |
| 03 | Kimberly Accountant, Laura Coach, Nick Creative Director, Phil Communications Specialist, Megan Copywriter, Raewyn Virtual Assistant. — 입력 없음. | 후기 원본·검증·정렬 기준 미확인. |
| 04 | Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부. — 입력 없음. | 목록 끝·전체 개수·중간 누락 카드 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

50만 고객·G2 Top Performer·4.7점은 캡처 당시 마케팅 문구다. 영상 썸네일과 후기 카드의 일부 구간을 확인했으며 영상 재생이나 전체 후기 목록을 검토한 것은 아니다.

### 업무 규칙과 연결 시 주의점

- 사용자 수·평점은 캡처의 홍보 수치이며 현재 수치가 아니다.
- 후기 속 지급 수수료·자동 청구 언급은 개인 경험이므로 보편 정책으로 확정하지 않는다.
- 카드의 이름·직무를 실제 CRM 연락처 레코드와 연결하지 않는다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): R2 본문 대조 기록(S003). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [공식 Reviews](https://www.hellobonsai.com/reviews): R2 본문 대조 기록(S081). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 리뷰 콘텐츠·표시명·직무·영상·평점 출처·표시 순서 후보.
- 실제 후기 수집·승인·평점 연동 모델은 이 읽기 화면만으로 알 수 없다.

### 단계별 모델링 근거

- 단계 01: 리뷰 출처·표시 평점·기준일 콘텐츠 후보.
- 단계 02: 영상 자산·포스터·재생 UI 후보.
- 단계 03: 후기·작성자 표시명·직무·본문 콘텐츠 후보.
- 단계 04: 후기 카드 높이·긴 본문 처리·콘텐츠 순서 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 영상 전체·자막·모바일 카드 배열·누락된 후기 행을 확인한다. 리뷰 외부 원본·동의·선정 기준은 미확인이다.

- 영상 전체·자막·모바일 카드 배열·누락된 후기 행을 확인한다.
- 리뷰 외부 원본·동의·선정 기준은 미확인이다.

### 단계별 미확인 사항

- 단계 01: 집계 시점·외부 링크 목적지 미확인.
- 단계 02: 자막·재생 플랫폼·모달 여부 미확인.
- 단계 03: 후기 원본·검증·정렬 기준 미확인.
- 단계 04: 목록 끝·전체 개수·중간 누락 카드 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **공개**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 영상 재생·카드·외부 후기 이동을 보완한다. 과거 평점·사용자 수를 현재 서비스 지표나 CRM 데이터로 사용하지 않는다.
- [이 흐름의 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-d501af32-ef6e-4ca1-8d3f-cf6e67874a08>)와 [공통 웹 상태·연결 기준](<../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 4단계 ID·순서·원본 URL 재조회 및 이미지 4/4단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 4단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/4단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |
