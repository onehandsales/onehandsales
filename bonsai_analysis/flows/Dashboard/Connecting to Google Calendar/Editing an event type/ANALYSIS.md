# Editing an event type 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b126bdbf-4f4f-455e-b62a-b9413b8fb7e7` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b126bdbf-4f4f-455e-b62a-b9413b8fb7e7) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 5단계 / 5단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

기존 예약 유형의 고객 확인 이메일 설정을 끄고 저장한다.

- 신규 생성 후 유형 목록에서 시작한다. Edit는4개 섹션을 자유롭게 선택하고 Save Changes로 저장한다.

- 상위 흐름: [Connecting to Google Calendar](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing an event type`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **생성된 유형 목록**이다. 생성한 유형이 목록에 나타난다. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **유형 수정 성공**이다. Event type updated successfully! 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Connecting to Google Calendar](<../ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_529048e78b304f66937c84b12cbc8a07`](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [생성된 유형 목록](<screens/01_sc_529048e78b304f66937c84b12cbc8a07.png>) | 유형 작업 메뉴 — 편집·공유·삭제 진입점이 분리된다. |
| 02 | [`sc_9003a9b8ddee4c889190b4fb9e8550f5`](https://gummble.com/screens/sc_9003a9b8ddee4c889190b4fb9e8550f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [유형 작업 메뉴](<screens/02_sc_9003a9b8ddee4c889190b4fb9e8550f5.png>) | 기존 유형 편집 — 생성 번호가 없는 편집 모드다. |
| 03 | [`sc_e5a9ea1a0e4549dc927b0f9664b1c364`](https://gummble.com/screens/sc_e5a9ea1a0e4549dc927b0f9664b1c364?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [기존 유형 편집](<screens/03_sc_e5a9ea1a0e4549dc927b0f9664b1c364.png>) | 확인 이메일 해제 — 한 개 체크박스가 해제된다. |
| 04 | [`sc_ff29911c0069452ca90e8b5400798b4d`](https://gummble.com/screens/sc_ff29911c0069452ca90e8b5400798b4d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [확인 이메일 해제](<screens/04_sc_ff29911c0069452ca90e8b5400798b4d.png>) | 유형 수정 성공 — Event type updated successfully! |
| 05 | [`sc_0f2e7d66e08240f994eca182a98c2171`](https://gummble.com/screens/sc_0f2e7d66e08240f994eca182a98c2171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [유형 수정 성공](<screens/05_sc_0f2e7d66e08240f994eca182a98c2171.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 생성된 유형 목록

- Screen ID: `sc_529048e78b304f66937c84b12cbc8a07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ba84c63-1167-41ca-9412-e3dbab548038.png)
- 로컬 이미지: [01_sc_529048e78b304f66937c84b12cbc8a07.png](<screens/01_sc_529048e78b304f66937c84b12cbc8a07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 058, 고유 이미지 S232, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9003a9b8ddee4c889190b4fb9e8550f5`

#### 화면에서 직접 확인한 내용

- 레이아웃: Scheduling 관리2열 화면.
- 입력 항목·필수 표시·기본값: Consultation call, Video Conferencing,30min; No Upcoming Events.
- 버튼·메뉴·안내 문구: View Booking Page, Copy Link, …, Calendar Settings, New Event Type.
- 확인된 상태: 생성한 유형이 목록에 나타난다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 유형 레코드 영속 결과를 확인할 근거다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 후 유지와 실제 예약 연동은 미확인.

#### 모델링 영향

- 후보와 근거: 정의와 인스턴스의 분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 새로고침 후 유지와 실제 예약 연동은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 유형 작업 메뉴

- Screen ID: `sc_9003a9b8ddee4c889190b4fb9e8550f5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9003a9b8ddee4c889190b4fb9e8550f5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2c42f062-877b-4590-a952-9f0a385e1621.png)
- 로컬 이미지: [02_sc_9003a9b8ddee4c889190b4fb9e8550f5.png](<screens/02_sc_9003a9b8ddee4c889190b4fb9e8550f5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 059, 고유 이미지 S233, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_529048e78b304f66937c84b12cbc8a07` → 현재 → `sc_e5a9ea1a0e4549dc927b0f9664b1c364`

#### 화면에서 직접 확인한 내용

- 레이아웃: 유형 카드 우측 … 드롭다운.
- 입력 항목·필수 표시·기본값: Consultation call 유형 유지.
- 버튼·메뉴·안내 문구: Edit Event Type, View Booking Page, Copy Link, Share, Delete.
- 확인된 상태: 편집·공유·삭제 진입점이 분리된다.
- 단계 간 변화: 유형 …를 연다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 유형의 관리 작업 목록. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Delete/Share 실행 결과는 미수록.

#### 모델링 영향

- 후보와 근거: 유형 식별자에 대한 관리 작업 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: Delete/Share 실행 결과는 미수록. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 기존 유형 편집

- Screen ID: `sc_e5a9ea1a0e4549dc927b0f9664b1c364`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e5a9ea1a0e4549dc927b0f9664b1c364?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b284b5ef-a935-4e8d-9b8b-458d7b1ec248.png)
- 로컬 이미지: [03_sc_e5a9ea1a0e4549dc927b0f9664b1c364.png](<screens/03_sc_e5a9ea1a0e4549dc927b0f9664b1c364.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 059, 고유 이미지 S234, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9003a9b8ddee4c889190b4fb9e8550f5` → 현재 → `sc_ff29911c0069452ca90e8b5400798b4d`

#### 화면에서 직접 확인한 내용

- 레이아웃: Edit Event Type 전용 페이지. 좌측 Details/Availability/Advanced/Branding 섹션.
- 입력 항목·필수 표시·기본값: Consultation call, Google Meet/Video Conferencing,30Minutes, 연결 캘린더,consultation-call,기존 설명; 고객 확인메일 on.
- 버튼·메뉴·안내 문구: Save Changes, Close, 섹션 선택.
- 확인된 상태: 생성 번호가 없는 편집 모드다.
- 단계 간 변화: Edit Event Type으로 진입한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 저장된 유형 값을 편집 폼에서 확인한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력별 필수·동시 편집·변경 추적 미확인.

#### 모델링 영향

- 후보와 근거: 생성/수정 UI 모드와 공통 데이터 정의 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 입력별 필수·동시 편집·변경 추적 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 확인 이메일 해제

- Screen ID: `sc_ff29911c0069452ca90e8b5400798b4d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ff29911c0069452ca90e8b5400798b4d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d4c6908f-4c07-4d50-a63b-d5568250f466.png)
- 로컬 이미지: [04_sc_ff29911c0069452ca90e8b5400798b4d.png](<screens/04_sc_ff29911c0069452ca90e8b5400798b4d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 059, 고유 이미지 S235, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e5a9ea1a0e4549dc927b0f9664b1c364` → 현재 → `sc_0f2e7d66e08240f994eca182a98c2171`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 Details 편집 폼.
- 입력 항목·필수 표시·기본값: Send confirmation email to client off, 나머지 값 유지.
- 버튼·메뉴·안내 문구: Save Changes, Close.
- 확인된 상태: 한 개 체크박스가 해제된다.
- 단계 간 변화: Send confirmation email to client를 해제한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 아직 저장 전 변경 상태. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 알림 서비스 실제 정책과 저장 전 즉시 적용 여부 미확인.

#### 모델링 영향

- 후보와 근거: 알림 정책과 편집 상태 분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 알림 서비스 실제 정책과 저장 전 즉시 적용 여부 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 유형 수정 성공

- Screen ID: `sc_0f2e7d66e08240f994eca182a98c2171`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0f2e7d66e08240f994eca182a98c2171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fe32cb8d-542f-488a-a9fa-8b4fbfceeb6f.png)
- 로컬 이미지: [05_sc_0f2e7d66e08240f994eca182a98c2171.png](<screens/05_sc_0f2e7d66e08240f994eca182a98c2171.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 059, 고유 이미지 S236, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ff29911c0069452ca90e8b5400798b4d` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Scheduling 목록 복귀, 우하단 토스트.
- 입력 항목·필수 표시·기본값: Consultation call/30min/예약0건 유지.
- 버튼·메뉴·안내 문구: 목록 작업 메뉴, 토스트X.
- 확인된 상태: Event type updated successfully!
- 단계 간 변화: Save Changes로 저장한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 변경 저장 성공 안내 확인. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 재조회 시 체크 상태·실제 이메일 차단은 미확인.

#### 모델링 영향

- 후보와 근거: 유형 수정 이벤트와 알림 동작 검증을 분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 재조회 시 체크 상태·실제 이메일 차단은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 생성한 유형이 목록에 나타난다. — Consultation call, Video Conferencing,30min; No Upcoming Events. | 새로고침 후 유지와 실제 예약 연동은 미확인. |
| 02 | 편집·공유·삭제 진입점이 분리된다. — Consultation call 유형 유지. | Delete/Share 실행 결과는 미수록. |
| 03 | 생성 번호가 없는 편집 모드다. — Consultation call, Google Meet/Video Conferencing,30Minutes, 연결 캘린더,consultation-call,기존 설명; 고객 확인메일 on. | 입력별 필수·동시 편집·변경 추적 미확인. |
| 04 | 한 개 체크박스가 해제된다. — Send confirmation email to client off, 나머지 값 유지. | 알림 서비스 실제 정책과 저장 전 즉시 적용 여부 미확인. |
| 05 | Event type updated successfully! — Consultation call/30min/예약0건 유지. | 재조회 시 체크 상태·실제 이메일 차단은 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

생성된 Consultation call 유형의 메뉴에서 Edit Event Type·View Booking Page·Copy Link·Share·Delete가 보인다. 고객 확인메일 체크를 해제한 뒤 수정 성공 토스트와 목록 복귀까지 확인한다. 재진입 체크값과 실제 메일 억제는 확인하지 않았다.

### 업무 규칙과 연결 시 주의점

- [관찰] 생성 마법사의 Continue/Finish 대신 편집에는 Save Changes/Close가 있다.
- [관찰] 확인 이메일만 on→off로 바뀌고 명칭·기간·회의방식·설명은 유지된다.
- [미확인] 확인메일 off가 Reminder·캘린더 자체 초대메일까지 끄는지 이 화면으로 알 수 없다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S003 공통 대조](<../../../../SOURCES.md#s003>)에 기록했다.
- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S044 공통 대조](<../../../../SOURCES.md#s044>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 유형별 확인 이메일 정책과 개별 예약 알림 이력 후보.

### 단계별 모델링 근거

- 단계 01: 정의와 인스턴스의 분리.
- 단계 02: 유형 식별자에 대한 관리 작업 후보.
- 단계 03: 생성/수정 UI 모드와 공통 데이터 정의 후보.
- 단계 04: 알림 정책과 편집 상태 분리.
- 단계 05: 유형 수정 이벤트와 알림 동작 검증을 분리.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 기존 예약·재예약/취소 알림·Google Calendar 초대와 확인메일 off의 관계를 확인한다. Close로 나갈 때 미저장 경고·변경 손실·다중 편집 충돌을 확인한다.

- 기존 예약·재예약/취소 알림·Google Calendar 초대와 확인메일 off의 관계를 확인한다.
- Close로 나갈 때 미저장 경고·변경 손실·다중 편집 충돌을 확인한다.

### 단계별 미확인 사항

- 단계 01: 새로고침 후 유지와 실제 예약 연동은 미확인.
- 단계 02: Delete/Share 실행 결과는 미수록.
- 단계 03: 입력별 필수·동시 편집·변경 추적 미확인.
- 단계 04: 알림 서비스 실제 정책과 저장 전 즉시 적용 여부 미확인.
- 단계 05: 재조회 시 체크 상태·실제 이메일 차단은 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 5단계 ID·순서·원본 URL 재조회 및 이미지 5/5단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
