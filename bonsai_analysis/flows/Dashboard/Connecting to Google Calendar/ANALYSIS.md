# Connecting to Google Calendar 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `eb3647ee-e2ea-4435-bdf6-291ebd62f550` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=eb3647ee-e2ea-4435-bdf6-291ebd62f550) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 8단계 / 8단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

대시보드의 예약 설정 안내에서 Google 캘린더 연결 후 이벤트 유형 생성으로 진입한다.

- 대시보드 온보딩 3단계에서 시작한다.
- 캡처는 Cronofy를 경유한다. Google 로그인/권한 동의 화면 자체는 생략되어 있다.

- 상위 흐름: [Dashboard](../ANALYSIS.md)
- 하위 흐름: [Adding event details](Adding%20event%20details/ANALYSIS.md), [Setting up availability](Setting%20up%20availability/ANALYSIS.md), [Editing an event type](Editing%20an%20event%20type/ANALYSIS.md), [Editing branding & design](Editing%20branding%20%26%20design/ANALYSIS.md), [Editing advanced settings](Editing%20advanced%20settings/ANALYSIS.md), [View booking page](View%20booking%20page/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Connecting to Google Calendar`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **대시보드 예약 온보딩**이다. 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **첫 이벤트 유형 설정·연결 성공**이다. Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Dashboard](<../ANALYSIS.md>), [Adding event details](<Adding event details/ANALYSIS.md>), [Editing advanced settings](<Editing advanced settings/ANALYSIS.md>), [Editing an event type](<Editing an event type/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_855aa87503994667b3fd5b8d6be847e2`](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 예약 온보딩](<screens/01_sc_855aa87503994667b3fd5b8d6be847e2.png>) | Scheduling 시작 소개 — 일러스트의 New meeting scheduled는 실제 예약 데이터가 아니다. |
| 02 | [`sc_9c52561849c24f1e8b4fd6daf2016b27`](https://gummble.com/screens/sc_9c52561849c24f1e8b4fd6daf2016b27?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Scheduling 시작 소개](<screens/02_sc_9c52561849c24f1e8b4fd6daf2016b27.png>) | 캘린더 제공자 선택 — 제공자 목록만 보이며 아직 연결 결과는 없다. |
| 03 | [`sc_23559b201a994c998c2050414bb56f5c`](https://gummble.com/screens/sc_23559b201a994c998c2050414bb56f5c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [캘린더 제공자 선택](<screens/03_sc_23559b201a994c998c2050414bb56f5c.png>) | Google 선택 — Google 선택/포커스 표시. |
| 04 | [`sc_e44ce588650b48e6ac157539ad004f32`](https://gummble.com/screens/sc_e44ce588650b48e6ac157539ad004f32?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Google 선택](<screens/04_sc_e44ce588650b48e6ac157539ad004f32.png>) | Cronofy 연결 동의 — 외부 연결 단계. 로그인/토큰 값은 보이지 않는다. |
| 05 | [`sc_1818bada85ad44d7ba17af8b4901d1f9`](https://gummble.com/screens/sc_1818bada85ad44d7ba17af8b4901d1f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cronofy 연결 동의](<screens/05_sc_1818bada85ad44d7ba17af8b4901d1f9.png>) | Cronofy 동의 선택 — 동의 선택 상태로 바뀌었다. |
| 06 | [`sc_a3278727c2d44cc586c1a571c64bcacd`](https://gummble.com/screens/sc_a3278727c2d44cc586c1a571c64bcacd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Cronofy 동의 선택](<screens/06_sc_a3278727c2d44cc586c1a571c64bcacd.png>) | 연결 후 비어 있는 예약 목록 — 소개 화면 대신 관리 목록이 나타나지만 아직 유형이 없다. |
| 07 | [`sc_a7ce80d93ce043648e5b13e30e8368cc`](https://gummble.com/screens/sc_a7ce80d93ce043648e5b13e30e8368cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [연결 후 비어 있는 예약 목록](<screens/07_sc_a7ce80d93ce043648e5b13e30e8368cc.png>) | 첫 이벤트 유형 설정·연결 성공 — Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내. |
| 08 | [`sc_547a933e0b3d47789feee75514074502`](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [첫 이벤트 유형 설정·연결 성공](<screens/08_sc_547a933e0b3d47789feee75514074502.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 예약 온보딩

- Screen ID: `sc_855aa87503994667b3fd5b8d6be847e2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1331e529-400c-493e-a630-49486471d7f0.png)
- 로컬 이미지: [01_sc_855aa87503994667b3fd5b8d6be847e2.png](<screens/01_sc_855aa87503994667b3fd5b8d6be847e2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 049, 고유 이미지 S196, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9c52561849c24f1e8b4fd6daf2016b27`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 사이드바, 체험 종료7일 배너, 인사말, 5단계 온보딩 카드.
- 입력 항목·필수 표시·기본값: 1회사정보/2팀초대는 완료 표시;3 Create your booking page 선택;4 contact form,5 bookkeeping.
- 버튼·메뉴·안내 문구: Get Started, Next Step, Hide, Upgrade Now.
- 확인된 상태: 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 온보딩 진행 표시와 실제 캘린더 연결은 아직 분리된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 완료 표시 자동/수동 조건은 미확인.

#### 모델링 영향

- 후보와 근거: 온보딩 단계 상태 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 완료 표시 자동/수동 조건은 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Scheduling 시작 소개

- Screen ID: `sc_9c52561849c24f1e8b4fd6daf2016b27`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9c52561849c24f1e8b4fd6daf2016b27?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bae33b22-dbaa-4562-9c30-605d5f0d84be.png)
- 로컬 이미지: [02_sc_9c52561849c24f1e8b4fd6daf2016b27.png](<screens/02_sc_9c52561849c24f1e8b4fd6daf2016b27.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 056, 고유 이미지 S221, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_855aa87503994667b3fd5b8d6be847e2` → 현재 → `sc_23559b201a994c998c2050414bb56f5c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문 2열 카드, 왼쪽 달력 일러스트, 오른쪽 설명.
- 입력 항목·필수 표시·기본값: 가능 시간에 맞춰 고객이 예약한다는 소개.
- 버튼·메뉴·안내 문구: Get Started, Contact Support, 공통 메뉴.
- 확인된 상태: 일러스트의 New meeting scheduled는 실제 예약 데이터가 아니다.
- 단계 간 변화: Get Started로 Scheduling 소개에 진입한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 연결 전 소개 상태. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 건너뛰기·연결 없이 유형 생성 가능 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 초기 설정 상태와 실제 예약 데이터 구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 건너뛰기·연결 없이 유형 생성 가능 여부는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 캘린더 제공자 선택

- Screen ID: `sc_23559b201a994c998c2050414bb56f5c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_23559b201a994c998c2050414bb56f5c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7e9119c3-8855-415e-bf80-f25b6329a336.png)
- 로컬 이미지: [03_sc_23559b201a994c998c2050414bb56f5c.png](<screens/03_sc_23559b201a994c998c2050414bb56f5c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 056, 고유 이미지 S222, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9c52561849c24f1e8b4fd6daf2016b27` → 현재 → `sc_e44ce588650b48e6ac157539ad004f32`

#### 화면에서 직접 확인한 내용

- 레이아웃: Choose a calendar to connect 중앙 모달의 타일 그리드.
- 입력 항목·필수 표시·기본값: Google, Apple, Office365, Exchange, Outlook.com.
- 버튼·메뉴·안내 문구: 5개 제공자 타일, 외부 X.
- 확인된 상태: 제공자 목록만 보이며 아직 연결 결과는 없다.
- 단계 간 변화: Get Started로 캘린더 제공자를 선택한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 연결 방식 선택 단계. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 제공자별 인증/제약은 미수록.

#### 모델링 영향

- 후보와 근거: 제공자 구분 및 연결 구성 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 각 제공자별 인증/제약은 미수록. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Google 선택

- Screen ID: `sc_e44ce588650b48e6ac157539ad004f32`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e44ce588650b48e6ac157539ad004f32?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6f0fb0d1-6ab4-40aa-a54e-7d5cf0bcea42.png)
- 로컬 이미지: [04_sc_e44ce588650b48e6ac157539ad004f32.png](<screens/04_sc_e44ce588650b48e6ac157539ad004f32.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 056, 고유 이미지 S223, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_23559b201a994c998c2050414bb56f5c` → 현재 → `sc_1818bada85ad44d7ba17af8b4901d1f9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달.
- 입력 항목·필수 표시·기본값: Google 타일에 초록 테두리.
- 버튼·메뉴·안내 문구: Google, 다른 제공자, X.
- 확인된 상태: Google 선택/포커스 표시.
- 단계 간 변화: Google 타일을 선택한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 연결 시작 의도만 확인된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 이후 외부 창/동일 탭 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 선택 UI와 연결 성공 상태 구분. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 클릭 이후 외부 창/동일 탭 여부는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Cronofy 연결 동의

- Screen ID: `sc_1818bada85ad44d7ba17af8b4901d1f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1818bada85ad44d7ba17af8b4901d1f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a689378d-da0f-44fa-8d64-f0d77df298b2.png)
- 로컬 이미지: [05_sc_1818bada85ad44d7ba17af8b4901d1f9.png](<screens/05_sc_1818bada85ad44d7ba17af8b4901d1f9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 056, 고유 이미지 S224, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e44ce588650b48e6ac157539ad004f32` → 현재 → `sc_a3278727c2d44cc586c1a571c64bcacd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 앱 UI 없는 중앙 Bonsai/Google 카드, Powered by Cronofy.
- 입력 항목·필수 표시·기본값: Bonsai가 Cronofy로 캘린더 접근해 일정 조회/추가한다는 안내; 약관·개인정보 동의 체크 꺼짐.
- 버튼·메뉴·안내 문구: Terms of Service, Privacy Policy, Link Google Account.
- 확인된 상태: 외부 연결 단계. 로그인/토큰 값은 보이지 않는다.
- 단계 간 변화: Cronofy 연결 안내로 이동한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 제3자 연결 서비스와 동의 항목을 확인한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 요청 scope·체크 전 진행 허용 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 연결 제공자/중개 서비스/동의 기록 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 실제 요청 scope·체크 전 진행 허용 여부는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Cronofy 동의 선택

- Screen ID: `sc_a3278727c2d44cc586c1a571c64bcacd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a3278727c2d44cc586c1a571c64bcacd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f860aa06-5568-413f-952f-3dd4cb04453a.png)
- 로컬 이미지: [06_sc_a3278727c2d44cc586c1a571c64bcacd.png](<screens/06_sc_a3278727c2d44cc586c1a571c64bcacd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 057, 고유 이미지 S225, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1818bada85ad44d7ba17af8b4901d1f9` → 현재 → `sc_a7ce80d93ce043648e5b13e30e8368cc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 연결 페이지.
- 입력 항목·필수 표시·기본값: 약관·개인정보 체크 켜짐.
- 버튼·메뉴·안내 문구: Link Google Account, 약관 링크.
- 확인된 상태: 동의 선택 상태로 바뀌었다.
- 단계 간 변화: 약관/개인정보 안내 동의 체크를 선택한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 아직 연결 성공이 아니다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Google 계정 선택/권한 동의 단계는 다음 캡처 전에 생략된다.

#### 모델링 영향

- 후보와 근거: 동의와 인증/연결 결과를 분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: Google 계정 선택/권한 동의 단계는 다음 캡처 전에 생략된다. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 연결 후 비어 있는 예약 목록

- Screen ID: `sc_a7ce80d93ce043648e5b13e30e8368cc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a7ce80d93ce043648e5b13e30e8368cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/140fa33b-ac0f-44cd-b5ce-d2c32aa3261a.png)
- 로컬 이미지: [07_sc_a7ce80d93ce043648e5b13e30e8368cc.png](<screens/07_sc_a7ce80d93ce043648e5b13e30e8368cc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 057, 고유 이미지 S226, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a3278727c2d44cc586c1a571c64bcacd` → 현재 → `sc_547a933e0b3d47789feee75514074502`

#### 화면에서 직접 확인한 내용

- 레이아웃: Bonsai Scheduling으로 복귀. 2열 목록과 체험 배너.
- 입력 항목·필수 표시·기본값: No Upcoming Events, No Event Types Available.
- 버튼·메뉴·안내 문구: Calendar Settings, New Event Type.
- 확인된 상태: 소개 화면 대신 관리 목록이 나타나지만 아직 유형이 없다.
- 단계 간 변화: Link Google Account 이후 Bonsai로 복귀한다. Google 인증 중간 화면은 미수록. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 캘린더 연결 후 관리 UI 진입으로 보이며 다음 성공 토스트가 연결 완료 근거다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복귀 직후 연결 상태 상세는 이 화면에 없다.

#### 모델링 영향

- 후보와 근거: 캘린더 연결과 유형/예약의 독립 수명주기. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 복귀 직후 연결 상태 상세는 이 화면에 없다. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 첫 이벤트 유형 설정·연결 성공

- Screen ID: `sc_547a933e0b3d47789feee75514074502`
- 원본: [화면 페이지](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a0072a5c-d3a6-4b16-b5b0-97a6d96395a9.png)
- 로컬 이미지: [08_sc_547a933e0b3d47789feee75514074502.png](<screens/08_sc_547a933e0b3d47789feee75514074502.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 054, 고유 이미지 S216, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a7ce80d93ce043648e5b13e30e8368cc` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Event Type 전용 화면. 왼쪽4단계, 오른쪽 Details 폼.
- 입력 항목·필수 표시·기본값: 이벤트명 회색예시; Video Conferencing/Google Meet;30 Minutes; Google 캘린더 이메일; Event Link 계정경로+회색 consultation-call; Description 비어 있음; Send confirmation email to client 체크 on.
- 버튼·메뉴·안내 문구: Cancel, Continue, 각 선택 입력.
- 확인된 상태: Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내.
- 단계 간 변화: New Event Type 설정으로 이동한다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 외부 캘린더를 선택 가능한 상태로 확인했다. 유형 저장 완료는 아니다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인.

#### 모델링 영향

- 후보와 근거: 이벤트 유형의 캘린더 참조·기간·방식·slug·알림 설정 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음. — 1회사정보/2팀초대는 완료 표시;3 Create your booking page 선택;4 contact form,5 bookkeeping. | 완료 표시 자동/수동 조건은 미확인. |
| 02 | 일러스트의 New meeting scheduled는 실제 예약 데이터가 아니다. — 가능 시간에 맞춰 고객이 예약한다는 소개. | 건너뛰기·연결 없이 유형 생성 가능 여부는 미확인. |
| 03 | 제공자 목록만 보이며 아직 연결 결과는 없다. — Google, Apple, Office365, Exchange, Outlook.com. | 각 제공자별 인증/제약은 미수록. |
| 04 | Google 선택/포커스 표시. — Google 타일에 초록 테두리. | 클릭 이후 외부 창/동일 탭 여부는 미확인. |
| 05 | 외부 연결 단계. 로그인/토큰 값은 보이지 않는다. — Bonsai가 Cronofy로 캘린더 접근해 일정 조회/추가한다는 안내; 약관·개인정보 동의 체크 꺼짐. | 실제 요청 scope·체크 전 진행 허용 여부는 미확인. |
| 06 | 동의 선택 상태로 바뀌었다. — 약관·개인정보 체크 켜짐. | Google 계정 선택/권한 동의 단계는 다음 캡처 전에 생략된다. |
| 07 | 소개 화면 대신 관리 목록이 나타나지만 아직 유형이 없다. — No Upcoming Events, No Event Types Available. | 복귀 직후 연결 상태 상세는 이 화면에 없다. |
| 08 | Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내. — 이벤트명 회색예시; Video Conferencing/Google Meet;30 Minutes; Google 캘린더 이메일; Event Link 계정경로+회색 consultation-call; Description 비어 있음; Send confirmation email to client 체크 on. | 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

캘린더 공급자 선택과 Cronofy 약관 동의 체크 전후를 확인한다. Google 계정 선택·권한 허용 화면은 빠져 있다. 복귀한 단계 07에는 Upcoming Events와 Event Types가 비어 있고, 단계 08의 첫 이벤트 유형 설정 화면에는 Calendar connected successfully 안내와 Google 캘린더 값이 보인다. 연결 성공 안내는 이벤트 유형 생성·실제 예약·캘린더 읽기/쓰기 검증과 구분한다.

### 업무 규칙과 연결 시 주의점

- [관찰] Google/Apple/Office365/Exchange/Outlook.com 선택지가 있다.
- [관찰] Cronofy 사용 및 일정 읽기/추가 목적 안내, 별도 동의 체크가 있다.
- [관찰] Calendar connected successfully 토스트와 Google 캘린더 값으로 연결 결과를 확인한다.
- [미확인] 실제 OAuth scope·토큰 저장·연결 해제·갱신은 화면으로 알 수 없다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S003 공통 대조](<../../../SOURCES.md#s003>)에 기록했다.
- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S044 공통 대조](<../../../SOURCES.md#s044>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 사용자/워크스페이스의 제공자 연결, 외부 계정·캘린더 식별, 연결 상태/갱신, 예약 유형이 쓰는 캘린더 후보.
- 예약 생성 캘린더와 가용성 충돌 확인용 캘린더를 분리할 후보.

### 단계별 모델링 근거

- 단계 01: 온보딩 단계 상태 후보.
- 단계 02: 초기 설정 상태와 실제 예약 데이터 구분.
- 단계 03: 제공자 구분 및 연결 구성 후보.
- 단계 04: 선택 UI와 연결 성공 상태 구분.
- 단계 05: 연결 제공자/중개 서비스/동의 기록 후보.
- 단계 06: 동의와 인증/연결 결과를 분리.
- 단계 07: 캘린더 연결과 유형/예약의 독립 수명주기.
- 단계 08: 이벤트 유형의 캘린더 참조·기간·방식·slug·알림 설정 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** OAuth 권한 범위와 연결 소유자·팀 공유, 외부 연결 해제 시 유형/예약 영향을 확인한다. Cronofy가 현재도 사용되는지와 장애/권한 철회/재인증 경로를 확인한다.

- OAuth 권한 범위와 연결 소유자·팀 공유, 외부 연결 해제 시 유형/예약 영향을 확인한다.
- Cronofy가 현재도 사용되는지와 장애/권한 철회/재인증 경로를 확인한다.
- 캘린더 연결 성공만으로 이벤트 유형이 생성되는지 여부는 별도 저장 결과로 대조한다.

### 단계별 미확인 사항

- 단계 01: 완료 표시 자동/수동 조건은 미확인.
- 단계 02: 건너뛰기·연결 없이 유형 생성 가능 여부는 미확인.
- 단계 03: 각 제공자별 인증/제약은 미수록.
- 단계 04: 클릭 이후 외부 창/동일 탭 여부는 미확인.
- 단계 05: 실제 요청 scope·체크 전 진행 허용 여부는 미확인.
- 단계 06: Google 계정 선택/권한 동의 단계는 다음 캡처 전에 생략된다.
- 단계 07: 복귀 직후 연결 상태 상세는 이 화면에 없다.
- 단계 08: 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 8단계 ID·순서·원본 URL 재조회 및 이미지 8/8단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
