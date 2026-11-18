# Copying a booking page 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `e2d05800-15f1-4b39-969c-290d5feee7fc` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=e2d05800-15f1-4b39-969c-290d5feee7fc) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

기존 예약 페이지 링크를 복사하고 추가 유형 생성 시 요금제 제한을 확인한다.

- 흐름 이름은 Copying a booking page지만 캡처상 실제 행동은 Copy Link다. 유형 복제 완료라고 해석하지 않는다.
- 마지막에는 추가 이벤트 제한 업그레이드 모달이 나온다. 중간 클릭이 없어 정확한 발생 버튼은 미확인.

- 상위 분석: [Scheduling](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Scheduling/Copying a booking page`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_683aacdc20ab4097a545a8c52c208013`](https://gummble.com/screens/sc_683aacdc20ab4097a545a8c52c208013?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [예약 목록과 이벤트 유형](<screens/01_sc_683aacdc20ab4097a545a8c52c208013.png>) | 예약 목록이 안정된 상태로 이어진다. |
| 02 | [`sc_a66a88d36fd047638ced967826c19f38`](https://gummble.com/screens/sc_a66a88d36fd047638ced967826c19f38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [예약 목록 — 복사 전](<screens/02_sc_a66a88d36fd047638ced967826c19f38.png>) | Copy Link를 선택한다. |
| 03 | [`sc_b4dcb8eec22048f0871fa75d10de7100`](https://gummble.com/screens/sc_b4dcb8eec22048f0871fa75d10de7100?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [예약 URL 복사 성공](<screens/03_sc_b4dcb8eec22048f0871fa75d10de7100.png>) | 복사 성공 후 추가 이벤트 관련 제한 모달이 열린다. 트리거 클릭은 미수록. |
| 04 | [`sc_f52f34e641ab47a08bf205fb3e2a2d6f`](https://gummble.com/screens/sc_f52f34e641ab47a08bf205fb3e2a2d6f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [추가 이벤트 요금제 제한](<screens/04_sc_f52f34e641ab47a08bf205fb3e2a2d6f.png>) | 업그레이드 안내에서 끝나며 구매는 수행되지 않는다. |

## 4. 화면별 상세 분석

### 단계 01 — 예약 목록과 이벤트 유형

- Screen ID: `sc_683aacdc20ab4097a545a8c52c208013`
- 원본: [화면 페이지](https://gummble.com/screens/sc_683aacdc20ab4097a545a8c52c208013?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/67bbb56d-5148-4cf1-ad8e-f72232689498.png)
- 로컬 이미지: [01_sc_683aacdc20ab4097a545a8c52c208013.png](<screens/01_sc_683aacdc20ab4097a545a8c52c208013.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_a66a88d36fd047638ced967826c19f38`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 공통 메뉴. 본문 왼쪽 넓은 Upcoming Events, 오른쪽 Event Types.
- 입력 항목·필수 표시·기본값: No Upcoming Events; Consultation call / Video Conferencing, 30 min 유형 한 개.
- 버튼·메뉴·안내 문구: Calendar Settings, New Event Type, View Booking Page, Copy Link, 유형 …; 지원 메시지 카드.
- 확인된 상태: 예정된 예약은 없고 유형은 존재한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 예약을 받을 정의와 예약 결과를 독립적으로 표시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 예약 정렬·기간·다중 캘린더·권한은 미확인.

#### 모델링 영향

- 후보와 근거: 유형-예약 관계 및 캘린더 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 예약 목록 — 복사 전

- Screen ID: `sc_a66a88d36fd047638ced967826c19f38`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a66a88d36fd047638ced967826c19f38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4f69ef1e-6d12-45a3-9b8a-06650d6e18d3.png)
- 로컬 이미지: [02_sc_a66a88d36fd047638ced967826c19f38.png](<screens/02_sc_a66a88d36fd047638ced967826c19f38.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_683aacdc20ab4097a545a8c52c208013` → 현재 → `sc_b4dcb8eec22048f0871fa75d10de7100`

#### 화면에서 직접 확인한 내용

- 레이아웃: Upcoming Events 빈 상태 일러스트와 오른쪽 유형 카드.
- 입력 항목·필수 표시·기본값: Consultation call, Video Conferencing,30 min; No Upcoming Events.
- 버튼·메뉴·안내 문구: Copy Link, View Booking Page, …, New Event Type, Calendar Settings.
- 확인된 상태: 앞 캡처의 지원 카드가 사라지고 빈 상태 그림이 보인다.
- 단계 간 변화: 예약 목록이 안정된 상태로 이어진다.

#### 동작과 데이터

- 화면 관찰: 예약 데이터 변경 증거는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 로딩 완료인지 다른 시점인지 미확인.

#### 모델링 영향

- 후보와 근거: 빈 상태와 로딩/지원 UI를 데이터와 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 예약 URL 복사 성공

- Screen ID: `sc_b4dcb8eec22048f0871fa75d10de7100`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b4dcb8eec22048f0871fa75d10de7100?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ec19e8d-bd44-4785-998f-42643a9d8558.png)
- 로컬 이미지: [03_sc_b4dcb8eec22048f0871fa75d10de7100.png](<screens/03_sc_b4dcb8eec22048f0871fa75d10de7100.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a66a88d36fd047638ced967826c19f38` → 현재 → `sc_f52f34e641ab47a08bf205fb3e2a2d6f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 목록 우하단 토스트.
- 입력 항목·필수 표시·기본값: 유형과 예약 0건 유지.
- 버튼·메뉴·안내 문구: Copy Link, 토스트 닫기.
- 확인된 상태: Booking page URL copied to clipboard.
- 단계 간 변화: Copy Link를 선택한다.

#### 동작과 데이터

- 화면 관찰: 링크 복사 안내만 확인. 유형 복제/새 예약은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 클립보드 주소·공유 권한은 미확인.

#### 모델링 영향

- 후보와 근거: 공유 동작과 레코드 생성 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 추가 이벤트 요금제 제한

- Screen ID: `sc_f52f34e641ab47a08bf205fb3e2a2d6f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f52f34e641ab47a08bf205fb3e2a2d6f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1bd7a82e-68dc-43c8-a7cc-0091041855d8.png)
- 로컬 이미지: [04_sc_f52f34e641ab47a08bf205fb3e2a2d6f.png](<screens/04_sc_f52f34e641ab47a08bf205fb3e2a2d6f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b4dcb8eec22048f0871fa75d10de7100` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 업그레이드 모달, 어두운 목록.
- 입력 항목·필수 표시·기본값: Unlock multiple events with Professional; unlimited events, branding removal, advanced automations/integrations; $39/mo.
- 버튼·메뉴·안내 문구: Upgrade to Professional, 전체 기능/플랜 링크, X.
- 확인된 상태: 현재 캡처의 계정에서 복수 이벤트가 제한된 안내.
- 단계 간 변화: 복사 성공 후 추가 이벤트 관련 제한 모달이 열린다. 트리거 클릭은 미수록.

#### 동작과 데이터

- 화면 관찰: 권한 제한 UI를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 모달을 연 정확한 버튼·현재 가격·결제 결과는 미확인.

#### 모델링 영향

- 후보와 근거: 기능 권한/한도와 업그레이드 노출 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] URL 복사 성공을 확인했으며 별도 이벤트 유형 생성 증거는 없다.
- [관찰] Professional $39/mo, 무제한 이벤트·브랜딩 제거·고급 자동화 안내는 캡처 시점 제안이다. 현재 가격/플랜 규칙으로 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 유형별 예약 URL 공유를 설명한다. 캡처의 구형 요금제 한도는 별도 확인이 필요하다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 예약 유형의 공유 URL과 요금제별 기능 권한 후보.

## 8. 미확인 사항과 검토 질문

- 제한 발생 버튼과 현재 플랜의 이벤트 유형 수 한도, 링크 재발급/slug 변경 영향을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
