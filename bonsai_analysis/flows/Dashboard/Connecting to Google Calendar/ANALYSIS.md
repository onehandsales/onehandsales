# Connecting to Google Calendar 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `eb3647ee-e2ea-4435-bdf6-291ebd62f550` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=eb3647ee-e2ea-4435-bdf6-291ebd62f550) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

대시보드의 예약 설정 안내에서 Google 캘린더 연결 후 이벤트 유형 생성으로 진입한다.

- 대시보드 온보딩 3단계에서 시작한다.
- 캡처는 Cronofy를 경유한다. Google 로그인/권한 동의 화면 자체는 생략되어 있다.

- 상위 분석: [Dashboard](../ANALYSIS.md)
- 하위 플로우: [Adding event details](Adding%20event%20details/ANALYSIS.md), [Setting up availability](Setting%20up%20availability/ANALYSIS.md), [Editing an event type](Editing%20an%20event%20type/ANALYSIS.md), [Editing branding & design](Editing%20branding%20%26%20design/ANALYSIS.md), [Editing advanced settings](Editing%20advanced%20settings/ANALYSIS.md), [View booking page](View%20booking%20page/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_855aa87503994667b3fd5b8d6be847e2`](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 대시보드 예약 온보딩 | Get Started로 Scheduling 소개에 진입한다. |
| 02 | [`sc_9c52561849c24f1e8b4fd6daf2016b27`](https://gummble.com/screens/sc_9c52561849c24f1e8b4fd6daf2016b27?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Scheduling 시작 소개 | Get Started로 캘린더 제공자를 선택한다. |
| 03 | [`sc_23559b201a994c998c2050414bb56f5c`](https://gummble.com/screens/sc_23559b201a994c998c2050414bb56f5c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 캘린더 제공자 선택 | Google 타일을 선택한다. |
| 04 | [`sc_e44ce588650b48e6ac157539ad004f32`](https://gummble.com/screens/sc_e44ce588650b48e6ac157539ad004f32?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Google 선택 | Cronofy 연결 안내로 이동한다. |
| 05 | [`sc_1818bada85ad44d7ba17af8b4901d1f9`](https://gummble.com/screens/sc_1818bada85ad44d7ba17af8b4901d1f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Cronofy 연결 동의 | 약관/개인정보 안내 동의 체크를 선택한다. |
| 06 | [`sc_a3278727c2d44cc586c1a571c64bcacd`](https://gummble.com/screens/sc_a3278727c2d44cc586c1a571c64bcacd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Cronofy 동의 선택 | Link Google Account 이후 Bonsai로 복귀한다. Google 인증 중간 화면은 미수록. |
| 07 | [`sc_a7ce80d93ce043648e5b13e30e8368cc`](https://gummble.com/screens/sc_a7ce80d93ce043648e5b13e30e8368cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 연결 후 비어 있는 예약 목록 | New Event Type 설정으로 이동한다. |
| 08 | [`sc_547a933e0b3d47789feee75514074502`](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 첫 이벤트 유형 설정·연결 성공 | 연결 성공 토스트 및 선택 가능한 캘린더를 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 예약 온보딩

- Screen ID: `sc_855aa87503994667b3fd5b8d6be847e2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_855aa87503994667b3fd5b8d6be847e2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1331e529-400c-493e-a630-49486471d7f0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9c52561849c24f1e8b4fd6daf2016b27`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 사이드바, 체험 종료7일 배너, 인사말, 5단계 온보딩 카드.
- 입력 항목·필수 표시·기본값: 1회사정보/2팀초대는 완료 표시;3 Create your booking page 선택;4 contact form,5 bookkeeping.
- 버튼·메뉴·안내 문구: Get Started, Next Step, Hide, Upgrade Now.
- 확인된 상태: 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 온보딩 진행 표시와 실제 캘린더 연결은 아직 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 완료 표시 자동/수동 조건은 미확인.

#### 모델링 영향

- 후보와 근거: 온보딩 단계 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Scheduling 시작 소개

- Screen ID: `sc_9c52561849c24f1e8b4fd6daf2016b27`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9c52561849c24f1e8b4fd6daf2016b27?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bae33b22-dbaa-4562-9c30-605d5f0d84be.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_855aa87503994667b3fd5b8d6be847e2` → 현재 → `sc_23559b201a994c998c2050414bb56f5c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문 2열 카드, 왼쪽 달력 일러스트, 오른쪽 설명.
- 입력 항목·필수 표시·기본값: 가능 시간에 맞춰 고객이 예약한다는 소개.
- 버튼·메뉴·안내 문구: Get Started, Contact Support, 공통 메뉴.
- 확인된 상태: 일러스트의 New meeting scheduled는 실제 예약 데이터가 아니다.
- 단계 간 변화: Get Started로 Scheduling 소개에 진입한다.

#### 동작과 데이터

- 화면 관찰: 연결 전 소개 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 건너뛰기·연결 없이 유형 생성 가능 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 초기 설정 상태와 실제 예약 데이터 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 캘린더 제공자 선택

- Screen ID: `sc_23559b201a994c998c2050414bb56f5c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_23559b201a994c998c2050414bb56f5c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7e9119c3-8855-415e-bf80-f25b6329a336.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9c52561849c24f1e8b4fd6daf2016b27` → 현재 → `sc_e44ce588650b48e6ac157539ad004f32`

#### 화면에서 직접 확인한 내용

- 레이아웃: Choose a calendar to connect 중앙 모달의 타일 그리드.
- 입력 항목·필수 표시·기본값: Google, Apple, Office365, Exchange, Outlook.com.
- 버튼·메뉴·안내 문구: 5개 제공자 타일, 외부 X.
- 확인된 상태: 제공자 목록만 보이며 아직 연결 결과는 없다.
- 단계 간 변화: Get Started로 캘린더 제공자를 선택한다.

#### 동작과 데이터

- 화면 관찰: 연결 방식 선택 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 제공자별 인증/제약은 미수록.

#### 모델링 영향

- 후보와 근거: 제공자 구분 및 연결 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Google 선택

- Screen ID: `sc_e44ce588650b48e6ac157539ad004f32`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e44ce588650b48e6ac157539ad004f32?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6f0fb0d1-6ab4-40aa-a54e-7d5cf0bcea42.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_23559b201a994c998c2050414bb56f5c` → 현재 → `sc_1818bada85ad44d7ba17af8b4901d1f9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달.
- 입력 항목·필수 표시·기본값: Google 타일에 초록 테두리.
- 버튼·메뉴·안내 문구: Google, 다른 제공자, X.
- 확인된 상태: Google 선택/포커스 표시.
- 단계 간 변화: Google 타일을 선택한다.

#### 동작과 데이터

- 화면 관찰: 연결 시작 의도만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 이후 외부 창/동일 탭 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 선택 UI와 연결 성공 상태 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Cronofy 연결 동의

- Screen ID: `sc_1818bada85ad44d7ba17af8b4901d1f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1818bada85ad44d7ba17af8b4901d1f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a689378d-da0f-44fa-8d64-f0d77df298b2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e44ce588650b48e6ac157539ad004f32` → 현재 → `sc_a3278727c2d44cc586c1a571c64bcacd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 앱 UI 없는 중앙 Bonsai/Google 카드, Powered by Cronofy.
- 입력 항목·필수 표시·기본값: Bonsai가 Cronofy로 캘린더 접근해 일정 조회/추가한다는 안내; 약관·개인정보 동의 체크 꺼짐.
- 버튼·메뉴·안내 문구: Terms of Service, Privacy Policy, Link Google Account.
- 확인된 상태: 외부 연결 단계. 로그인/토큰 값은 보이지 않는다.
- 단계 간 변화: Cronofy 연결 안내로 이동한다.

#### 동작과 데이터

- 화면 관찰: 제3자 연결 서비스와 동의 항목을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 요청 scope·체크 전 진행 허용 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 연결 제공자/중개 서비스/동의 기록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Cronofy 동의 선택

- Screen ID: `sc_a3278727c2d44cc586c1a571c64bcacd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a3278727c2d44cc586c1a571c64bcacd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f860aa06-5568-413f-952f-3dd4cb04453a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1818bada85ad44d7ba17af8b4901d1f9` → 현재 → `sc_a7ce80d93ce043648e5b13e30e8368cc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 연결 페이지.
- 입력 항목·필수 표시·기본값: 약관·개인정보 체크 켜짐.
- 버튼·메뉴·안내 문구: Link Google Account, 약관 링크.
- 확인된 상태: 동의 선택 상태로 바뀌었다.
- 단계 간 변화: 약관/개인정보 안내 동의 체크를 선택한다.

#### 동작과 데이터

- 화면 관찰: 아직 연결 성공이 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Google 계정 선택/권한 동의 단계는 다음 캡처 전에 생략된다.

#### 모델링 영향

- 후보와 근거: 동의와 인증/연결 결과를 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 연결 후 비어 있는 예약 목록

- Screen ID: `sc_a7ce80d93ce043648e5b13e30e8368cc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a7ce80d93ce043648e5b13e30e8368cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/140fa33b-ac0f-44cd-b5ce-d2c32aa3261a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a3278727c2d44cc586c1a571c64bcacd` → 현재 → `sc_547a933e0b3d47789feee75514074502`

#### 화면에서 직접 확인한 내용

- 레이아웃: Bonsai Scheduling으로 복귀. 2열 목록과 체험 배너.
- 입력 항목·필수 표시·기본값: No Upcoming Events, No Event Types Available.
- 버튼·메뉴·안내 문구: Calendar Settings, New Event Type.
- 확인된 상태: 소개 화면 대신 관리 목록이 나타나지만 아직 유형이 없다.
- 단계 간 변화: Link Google Account 이후 Bonsai로 복귀한다. Google 인증 중간 화면은 미수록.

#### 동작과 데이터

- 화면 관찰: 캘린더 연결 후 관리 UI 진입으로 보이며 다음 성공 토스트가 연결 완료 근거다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복귀 직후 연결 상태 상세는 이 화면에 없다.

#### 모델링 영향

- 후보와 근거: 캘린더 연결과 유형/예약의 독립 수명주기.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 첫 이벤트 유형 설정·연결 성공

- Screen ID: `sc_547a933e0b3d47789feee75514074502`
- 원본: [화면 페이지](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a0072a5c-d3a6-4b16-b5b0-97a6d96395a9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a7ce80d93ce043648e5b13e30e8368cc` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Event Type 전용 화면. 왼쪽4단계, 오른쪽 Details 폼.
- 입력 항목·필수 표시·기본값: 이벤트명 회색예시; Video Conferencing/Google Meet;30 Minutes; Google 캘린더 이메일; Event Link 계정경로+회색 consultation-call; Description 비어 있음; Send confirmation email to client 체크 on.
- 버튼·메뉴·안내 문구: Cancel, Continue, 각 선택 입력.
- 확인된 상태: Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내.
- 단계 간 변화: New Event Type 설정으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 외부 캘린더를 선택 가능한 상태로 확인했다. 유형 저장 완료는 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인.

#### 모델링 영향

- 후보와 근거: 이벤트 유형의 캘린더 참조·기간·방식·slug·알림 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Google/Apple/Office365/Exchange/Outlook.com 선택지가 있다.
- [관찰] Cronofy 사용 및 일정 읽기/추가 목적 안내, 별도 동의 체크가 있다.
- [관찰] Calendar connected successfully 토스트와 Google 캘린더 값으로 연결 결과를 확인한다.
- [미확인] 실제 OAuth scope·토큰 저장·연결 해제·갱신은 화면으로 알 수 없다.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 제공자 선택·권한 허용·연결의 흐름을 설명한다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 사용자/워크스페이스의 제공자 연결, 외부 계정·캘린더 식별, 연결 상태/갱신, 예약 유형이 쓰는 캘린더 후보.
- 예약 생성 캘린더와 가용성 충돌 확인용 캘린더를 분리할 후보.

## 8. 미확인 사항과 검토 질문

- OAuth 권한 범위와 연결 소유자·팀 공유, 외부 연결 해제 시 유형/예약 영향을 확인한다.
- Cronofy가 현재도 사용되는지와 장애/권한 철회/재인증 경로를 확인한다.
- 캘린더 연결 성공만으로 이벤트 유형이 생성되는지 여부는 별도 저장 결과로 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
