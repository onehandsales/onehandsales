# Adding event details 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `4e44dbea-bf16-4dbf-a350-472b1b419248` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=4e44dbea-bf16-4dbf-a350-472b1b419248) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

예약 유형의 이름·회의 방식·시간·캘린더·URL·안내를 입력한다.

- 캘린더 연결 직후 New Event Type 1단계에서 시작해 가용성 2단계로 이동한다.

- 상위 분석: [Connecting to Google Calendar](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_547a933e0b3d47789feee75514074502`](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 첫 이벤트 유형 설정·연결 성공 | 이름과 URL slug를 입력한다. |
| 02 | [`sc_499ea4a0453c4c84be8c8e7c3ef32f08`](https://gummble.com/screens/sc_499ea4a0453c4c84be8c8e7c3ef32f08?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이벤트명·slug 입력 | 설명 문구를 입력한다. |
| 03 | [`sc_07f7dc3ffc1a46c4be58eafcf5545731`](https://gummble.com/screens/sc_07f7dc3ffc1a46c4be58eafcf5545731?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이벤트 안내 작성 | Continue로 가용성 단계에 진입한다. |
| 04 | [`sc_40e41f0dacb244fe96fbce2139fcff5e`](https://gummble.com/screens/sc_40e41f0dacb244fe96fbce2139fcff5e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 가용성 로딩 | 캘린더와 주간 시간표 로딩이 끝난다. |
| 05 | [`sc_174665c466f44d928735d8877e13f637`](https://gummble.com/screens/sc_174665c466f44d928735d8877e13f637?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기본 가용성 로드 완료 | 가용성 편집 흐름으로 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — 첫 이벤트 유형 설정·연결 성공

- Screen ID: `sc_547a933e0b3d47789feee75514074502`
- 원본: [화면 페이지](https://gummble.com/screens/sc_547a933e0b3d47789feee75514074502?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a0072a5c-d3a6-4b16-b5b0-97a6d96395a9.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_499ea4a0453c4c84be8c8e7c3ef32f08`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Event Type 전용 화면. 왼쪽4단계, 오른쪽 Details 폼.
- 입력 항목·필수 표시·기본값: 이벤트명 회색예시; Video Conferencing/Google Meet;30 Minutes; Google 캘린더 이메일; Event Link 계정경로+회색 consultation-call; Description 비어 있음; Send confirmation email to client 체크 on.
- 버튼·메뉴·안내 문구: Cancel, Continue, 각 선택 입력.
- 확인된 상태: Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 외부 캘린더를 선택 가능한 상태로 확인했다. 유형 저장 완료는 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 캘린더 추가·공유/읽기쓰기 권한과 기본값 출처는 미확인.

#### 모델링 영향

- 후보와 근거: 이벤트 유형의 캘린더 참조·기간·방식·slug·알림 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 이벤트명·slug 입력

- Screen ID: `sc_499ea4a0453c4c84be8c8e7c3ef32f08`
- 원본: [화면 페이지](https://gummble.com/screens/sc_499ea4a0453c4c84be8c8e7c3ef32f08?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/43c7566c-fada-4418-8776-8300ad44412f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_547a933e0b3d47789feee75514074502` → 현재 → `sc_07f7dc3ffc1a46c4be58eafcf5545731`

#### 화면에서 직접 확인한 내용

- 레이아웃: Details 단계의 2열 필드 및 큰 설명란.
- 입력 항목·필수 표시·기본값: Consultation call; Video Conferencing/Google Meet;30 Minutes; 연결 캘린더; 계정 URL 접두사와 consultation-call; 설명 비어 있음; 확인 이메일 on.
- 버튼·메뉴·안내 문구: Cancel, Continue, 선택 필드.
- 확인된 상태: 이름과 slug가 채워졌다.
- 단계 간 변화: 이름과 URL slug를 입력한다.

#### 동작과 데이터

- 화면 관찰: 예약 유형의 이름/공개 경로 입력 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: slug 자동 생성/직접 입력 및 유일성 검증은 미확인.

#### 모델링 영향

- 후보와 근거: 표시명과 고유 URL 식별자 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 이벤트 안내 작성

- Screen ID: `sc_07f7dc3ffc1a46c4be58eafcf5545731`
- 원본: [화면 페이지](https://gummble.com/screens/sc_07f7dc3ffc1a46c4be58eafcf5545731?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/65dcd106-aa4f-4d7f-8c82-e33ea0e2a7f2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_499ea4a0453c4c84be8c8e7c3ef32f08` → 현재 → `sc_40e41f0dacb244fe96fbce2139fcff5e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 Details 폼.
- 입력 항목·필수 표시·기본값: Description: Let's kick off our meeting with a quick call. 나머지 값 유지.
- 버튼·메뉴·안내 문구: Continue, Cancel.
- 확인된 상태: 설명 입력 후 단계 진행 가능한 상태.
- 단계 간 변화: 설명 문구를 입력한다.

#### 동작과 데이터

- 화면 관찰: 예약자에게 보일 안내 텍스트 후보.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: HTML/길이 제한·필수 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 예약 유형 설명 스냅샷과 변경 영향 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 가용성 로딩

- Screen ID: `sc_40e41f0dacb244fe96fbce2139fcff5e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_40e41f0dacb244fe96fbce2139fcff5e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f6293f62-109a-4e85-a214-9d75524e9bc6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_07f7dc3ffc1a46c4be58eafcf5545731` → 현재 → `sc_174665c466f44d928735d8877e13f637`

#### 화면에서 직접 확인한 내용

- 레이아웃: Availability 단계. Included calendars와 주간 그리드에 로딩 표시.
- 입력 항목·필수 표시·기본값: Sun~Sat 열,10am~5pm 눈금, 시간대 Kuala Lumpur. 그리드는 회색 오버레이.
- 버튼·메뉴·안내 문구: Continue, Cancel, 시간대 선택.
- 확인된 상태: 캘린더/가용성 데이터 로딩 중이며 회색을 실제 불가 시간으로 해석하면 안 된다.
- 단계 간 변화: Continue로 가용성 단계에 진입한다.

#### 동작과 데이터

- 화면 관찰: 비동기 로딩 상태를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실패·지연·캐시 상태는 미수록.

#### 모델링 영향

- 후보와 근거: 가용성 데이터와 로딩 UI 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 기본 가용성 로드 완료

- Screen ID: `sc_174665c466f44d928735d8877e13f637`
- 원본: [화면 페이지](https://gummble.com/screens/sc_174665c466f44d928735d8877e13f637?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cdb89b0b-ff2d-4dec-971d-644c83b25304.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_40e41f0dacb244fe96fbce2139fcff5e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 주간 그리드와 범례. 오른쪽 아래 시간대.
- 입력 항목·필수 표시·기본값: Included calendars All; 월~금 초록 가용 구간, 주말 흰색. 보이는 가용 종료17:00; 시작은 다음 hover에서09:00로 대조한다. Kuala Lumpur.
- 버튼·메뉴·안내 문구: 캘린더 +, Continue, Cancel, 시간대, 그리드/상하 스크롤.
- 확인된 상태: 회색 로딩이 사라지고 Available/Unavailable 범례가 표시된다.
- 단계 간 변화: 캘린더와 주간 시간표 로딩이 끝난다.

#### 동작과 데이터

- 화면 관찰: 연결 캘린더 충돌 검사 안내와 기본 주간 가용성.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: All이 미래 추가 캘린더까지 포함하는지·기본값 결정 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 주간 반복 가용 구간·시간대·충돌 검사 캘린더 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Consultation call 이름과 consultation-call slug가 별도 필드다. 자동 생성인지 직접 입력인지는 미수록.
- [관찰] Google Meet 링크는 세션 예약 후 생성된다는 안내다. 유형 생성 시 고정 회의 URL을 만든다고 볼 수 없다.
- [관찰] 확인 이메일 옵션과 향후 Reminder 설정은 별개다.
- [미확인] 다음 단계 이동만으로 최종 유형 저장 완료를 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 이벤트 이름·방식·기간·설명 설정을 설명한다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 이벤트 유형의 표시명/slug/방식/길이/설명/캘린더/확인메일 설정 후보.
- 예약 인스턴스의 화상회의 URL은 유형과 별도로 생성될 후보.

## 8. 미확인 사항과 검토 질문

- slug 중복·변경 시 기존 링크·이벤트 이름 변경 자동 반영 규칙을 확인한다.
- 기간의 지원 단위/최소·최대, 회의 방식별 조건부 입력, Cancel 시 임시 저장 범위를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
