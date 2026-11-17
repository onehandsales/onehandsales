# Setting up availability 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `5da62684-3be7-48ac-923f-4fdf585d7db1` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=5da62684-3be7-48ac-923f-4fdf585d7db1) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

예약 충돌을 검사할 캘린더를 선택하고 요일별 가용 구간에서 점심시간을 제외한다.

- New Event Type 가용성 단계. 실제 특정 날짜의 예약이 아니라 요일 반복 기본 시간표를 편집한다.

- 상위 분석: [Connecting to Google Calendar](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_174665c466f44d928735d8877e13f637`](https://gummble.com/screens/sc_174665c466f44d928735d8877e13f637?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기본 가용성 로드 완료 | Included calendars +를 연다. |
| 02 | [`sc_0a0c22f3f5c84160a837cd8dc1dd332f`](https://gummble.com/screens/sc_0a0c22f3f5c84160a837cd8dc1dd332f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 충돌 검사 캘린더 선택 목록 | 기본 Google 캘린더만 선택한다. |
| 03 | [`sc_e6ce470c765c4036904e044c4e952b17`](https://gummble.com/screens/sc_e6ce470c765c4036904e044c4e952b17?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기본 캘린더만 포함 | 선택 목록을 닫고 수요일09:00 구간을 가리킨다. |
| 04 | [`sc_e2294476a58f4fceadab897d09f410e9`](https://gummble.com/screens/sc_e2294476a58f4fceadab897d09f410e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 09:00 구간 hover | 수요일12:30~13:00을 가리킨다. |
| 05 | [`sc_205aef8eff024bccb5ba966030d3c094`](https://gummble.com/screens/sc_205aef8eff024bccb5ba966030d3c094?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 수요일 점심 구간 선택 전 | 수요일 구간 제외 후 월요일 같은 시간 구간을 가리킨다. |
| 06 | [`sc_75576dc3b7c540e4a8ccaa129473aea3`](https://gummble.com/screens/sc_75576dc3b7c540e4a8ccaa129473aea3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 수요일 제외·월요일 hover | 월·수·금12:30~13:00이 제외된 결과로 이어진다. 금요일 조작은 미수록. |
| 07 | [`sc_83c6716c0d594f588f30ffd786c9250b`](https://gummble.com/screens/sc_83c6716c0d594f588f30ffd786c9250b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 월·수·금 점심 제외 | Continue로 Advanced Settings에 이동한다. |
| 08 | [`sc_10567e85a1db45959f5fee59dfe269aa`](https://gummble.com/screens/sc_10567e85a1db45959f5fee59dfe269aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Advanced Settings 초기값 | 고급 예약 조건 설정 단계로 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — 기본 가용성 로드 완료

- Screen ID: `sc_174665c466f44d928735d8877e13f637`
- 원본: [화면 페이지](https://gummble.com/screens/sc_174665c466f44d928735d8877e13f637?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cdb89b0b-ff2d-4dec-971d-644c83b25304.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_0a0c22f3f5c84160a837cd8dc1dd332f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주간 그리드와 범례. 오른쪽 아래 시간대.
- 입력 항목·필수 표시·기본값: Included calendars All; 월~금 초록 가용 구간, 주말 흰색. 보이는 가용 종료17:00; 시작은 다음 hover에서09:00로 대조한다. Kuala Lumpur.
- 버튼·메뉴·안내 문구: 캘린더 +, Continue, Cancel, 시간대, 그리드/상하 스크롤.
- 확인된 상태: 회색 로딩이 사라지고 Available/Unavailable 범례가 표시된다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 연결 캘린더 충돌 검사 안내와 기본 주간 가용성.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: All이 미래 추가 캘린더까지 포함하는지·기본값 결정 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 주간 반복 가용 구간·시간대·충돌 검사 캘린더 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 충돌 검사 캘린더 선택 목록

- Screen ID: `sc_0a0c22f3f5c84160a837cd8dc1dd332f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0a0c22f3f5c84160a837cd8dc1dd332f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b2ca8b69-6a25-4f23-8ee7-440471f54d48.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_174665c466f44d928735d8877e13f637` → 현재 → `sc_e6ce470c765c4036904e044c4e952b17`

#### 화면에서 직접 확인한 내용

- 레이아웃: Included calendars + 아래 드롭다운.
- 입력 항목·필수 표시·기본값: Google 계정 그룹 아래 기본 이메일 캘린더, HoneyBook Calendar - Janes Studio, Reading(Intermediate). All 표시 상태에서 개별 체크는 비어 있다.
- 버튼·메뉴·안내 문구: 3개 체크박스, +, Continue.
- 확인된 상태: 외부 캘린더 목록이 계정별로 묶인다. 캘린더 이름은 사용자의 데이터다.
- 단계 간 변화: Included calendars +를 연다.

#### 동작과 데이터

- 화면 관찰: 한 연결에 여러 캘린더가 존재함을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: All과 미체크의 내부 저장 표현은 미확인.

#### 모델링 영향

- 후보와 근거: 연결 계정-캘린더-선택 집합 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 기본 캘린더만 포함

- Screen ID: `sc_e6ce470c765c4036904e044c4e952b17`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e6ce470c765c4036904e044c4e952b17?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/939faa0a-9d1f-442a-82f2-b385e29445fe.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0a0c22f3f5c84160a837cd8dc1dd332f` → 현재 → `sc_e2294476a58f4fceadab897d09f410e9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운 유지, 상단 All 대신 이메일 칩.
- 입력 항목·필수 표시·기본값: 기본 캘린더 체크 on, 다른2개 off; 주간 가용 구간/시간대 유지.
- 버튼·메뉴·안내 문구: 칩 제거 X, 체크박스, +.
- 확인된 상태: 포함 캘린더가 한 개로 명시된다.
- 단계 간 변화: 기본 Google 캘린더만 선택한다.

#### 동작과 데이터

- 화면 관찰: 충돌 검사 범위 선택이 바뀌었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 대상 캘린더가 예약 생성 캘린더와 반드시 같아야 하는지는 미확인.

#### 모델링 영향

- 후보와 근거: 쓰기 캘린더와 충돌 검사 집합 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 09:00 구간 hover

- Screen ID: `sc_e2294476a58f4fceadab897d09f410e9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e2294476a58f4fceadab897d09f410e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/041d931c-ff6a-4a6a-9d2f-7a7af1010cc9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e6ce470c765c4036904e044c4e952b17` → 현재 → `sc_205aef8eff024bccb5ba966030d3c094`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주간 그리드 수요일 첫 구간에 진한 hover와 X.
- 입력 항목·필수 표시·기본값: 말풍선9:00am–9:30am. 평일09:00~17:00 가용으로 읽힌다.
- 버튼·메뉴·안내 문구: hover구간 X, Continue, 시간대.
- 확인된 상태: hover 강조가 나타나지만 이 장면에 흰 제외 구간은 없다.
- 단계 간 변화: 선택 목록을 닫고 수요일09:00 구간을 가리킨다.

#### 동작과 데이터

- 화면 관찰: 구간 단위 편집 제어를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭/드래그 행동과 경계 포함 규칙은 미확인.

#### 모델링 영향

- 후보와 근거: 요일+시작/종료 구간 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 수요일 점심 구간 선택 전

- Screen ID: `sc_205aef8eff024bccb5ba966030d3c094`
- 원본: [화면 페이지](https://gummble.com/screens/sc_205aef8eff024bccb5ba966030d3c094?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/352d941b-baa8-484e-b643-61ea095cfff8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e2294476a58f4fceadab897d09f410e9` → 현재 → `sc_75576dc3b7c540e4a8ccaa129473aea3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 수요일12:30~13:00에 hover.
- 입력 항목·필수 표시·기본값: 말풍선12:30pm–1:00pm, 아직 초록 가용 구간.
- 버튼·메뉴·안내 문구: 구간 X, Continue.
- 확인된 상태: 제외할 대상 구간을 가리킨 상태.
- 단계 간 변화: 수요일12:30~13:00을 가리킨다.

#### 동작과 데이터

- 화면 관찰: hover만으로 저장 변경을 단정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 이벤트는 직접 캡처되지 않았다.

#### 모델링 영향

- 후보와 근거: UI 선택/hover와 영속 구간 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 수요일 제외·월요일 hover

- Screen ID: `sc_75576dc3b7c540e4a8ccaa129473aea3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_75576dc3b7c540e4a8ccaa129473aea3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/44dfea51-ea5c-4dcf-ba8e-ee4b73d90bde.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_205aef8eff024bccb5ba966030d3c094` → 현재 → `sc_83c6716c0d594f588f30ffd786c9250b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 수요일 점심은 흰색, 월요일 같은 구간에 hover.
- 입력 항목·필수 표시·기본값: 수12:30~13:00 불가, 월 같은 시간 X/말풍선.
- 버튼·메뉴·안내 문구: 구간 X, Continue.
- 확인된 상태: 수요일 가용 구간이 제거된 결과를 확인한다.
- 단계 간 변화: 수요일 구간 제외 후 월요일 같은 시간 구간을 가리킨다.

#### 동작과 데이터

- 화면 관찰: 주간 반복 시간에서 특정 구간 제외.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 삭제 취소·재추가 및 저장 시점은 미확인.

#### 모델링 영향

- 후보와 근거: 가용 구간 분할/제외 표현 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 월·수·금 점심 제외

- Screen ID: `sc_83c6716c0d594f588f30ffd786c9250b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_83c6716c0d594f588f30ffd786c9250b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/016bab17-90d8-46ce-aabd-42d3414a8e22.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_75576dc3b7c540e4a8ccaa129473aea3` → 현재 → `sc_10567e85a1db45959f5fee59dfe269aa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주간 그리드에 흰 가로 구간3개.
- 입력 항목·필수 표시·기본값: 월/수/금12:30~13:00 불가; 화/목 연속 가용; 주말 불가; Kuala Lumpur.
- 버튼·메뉴·안내 문구: Continue, Cancel, 시간대, +.
- 확인된 상태: 의도된 점심 제외 패턴이 나타난다.
- 단계 간 변화: 월·수·금12:30~13:00이 제외된 결과로 이어진다. 금요일 조작은 미수록.

#### 동작과 데이터

- 화면 관찰: 최종 가용성 편집 결과.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 금요일 조작 중간 단계와 저장 완료는 미수록.

#### 모델링 영향

- 후보와 근거: 복수 요일·복수 구간 모델 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Advanced Settings 초기값

- Screen ID: `sc_10567e85a1db45959f5fee59dfe269aa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_10567e85a1db45959f5fee59dfe269aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9f1a2b3f-0272-446f-afc8-be918c9d53d1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_83c6716c0d594f588f30ffd786c9250b` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 마법사3단계. 예약 조건·버퍼·추가 질문·리마인더 세로 섹션.
- 입력 항목·필수 표시·기본값: 미래30일, 시작8hours 전 예약 제한; Before/After 체크off·15minutes 회색; Additional Question off; 이메일1hours 전 한 행.
- 버튼·메뉴·안내 문구: Continue, Cancel, 체크/토글, Add Reminder, 리마인더 X.
- 확인된 상태: 가용성 단계에서 고급 설정으로 이동했다.
- 단계 간 변화: Continue로 Advanced Settings에 이동한다.

#### 동작과 데이터

- 화면 관찰: 주간 가용성과 예약 제한 조건이 별도 필드다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제한 경계·기본값 출처·유효성은 미확인.

#### 모델링 영향

- 후보와 근거: 예약 창·최소 리드타임·전후 버퍼·알림 규칙 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] All 선택과 개별 캘린더 체크가 구분된다.
- [관찰] hover 말풍선은30분 구간을 표시한다. 이것만으로 모든 유형의 예약 간격이30분 고정이라고 확정하지 않는다.
- [관찰] 월·수·금 점심 구간이 흰색으로 바뀐다. 제외 구간과 실제 외부 일정 충돌은 별도다.
- [미확인] 특정 날짜 예외·공휴일·DST·여러 구간 드래그 동작은 미수록.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 가용성 캘린더·시간대·시간 구간 선택을 설명한다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 유형별 주간 가용 구간, 시간대, 제외 구간, 다중 충돌 검사 캘린더 후보.
- 최종 예약 가능 시각은 기본 가용성+외부 busy+길이+버퍼+예약기한 조건을 조합하는 설계 후보.

## 8. 미확인 사항과 검토 질문

- All과 명시 선택의 의미, 새 캘린더 추가/삭제 시 포함 정책을 확인한다.
- 시간대 변경 시 현지 시각 유지/절대시각 이동과 DST 처리를 확인한다.
- 부정확한 sync/동시 예약 경쟁 상황, 경계 구간에 회의 길이가 걸치는 경우를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
