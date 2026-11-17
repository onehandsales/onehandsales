# Connecting to Stripe 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f4f79868-6066-440d-9432-cec83923c392` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f4f79868-6066-440d-9432-cec83923c392) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

사업자가 Stripe 결제 계정을 Bonsai에 연결해 카드 결제를 받을 수 있도록 설정한다.

- Invoices 목록의 Edit Payment Methods에서 진입한다.
- Bonsai 이메일 확인과 Stripe 인증앱 확인은 서로 다른 인증 단계다. 계정 조작은 수행하지 않고 Gummble 캡처만 분석했다.
- 마지막은 연결된 Stripe 카드와 카드 결제 on 상태. 실제 고객 결제·지급은 수록되지 않는다.

- 상위 분석: [Invoices](../ANALYSIS.md)
- 하위 플로우: [Turning off card payments](Turning%20off%20card%20payments/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_21f42247e22948b3b35d5313e9e315a5`](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 목록과 결제 연결 안내 | Payment Methods에서 Stripe/PayPal 연결 옵션을 표시한다. |
| 02 | [`sc_1dc0c1e56d2549dab86354f2d4d8185e`](https://gummble.com/screens/sc_1dc0c1e56d2549dab86354f2d4d8185e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 결제 공급자 연결 선택 | Stripe 연결 시 Bonsai 이메일 코드 인증으로 전환한다. |
| 03 | [`sc_aaf4eb9dbbf5455f9a5e45c89dacbba8`](https://gummble.com/screens/sc_aaf4eb9dbbf5455f9a5e45c89dacbba8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bonsai 이메일 인증 빈 코드 | 6자리 입력 후 로딩 상태로 진행한다. |
| 04 | [`sc_8fc8e97d33d14f84a4c093109d5d5b8e`](https://gummble.com/screens/sc_8fc8e97d33d14f84a4c093109d5d5b8e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이메일 코드 검증 진행 | Payment Methods로 돌아와 Connecting to Stripe 표시. |
| 05 | [`sc_51e959da528e4eae935c3516a4993408`](https://gummble.com/screens/sc_51e959da528e4eae935c3516a4993408?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Stripe 연결 요청 진행 | Stripe의 인증앱 코드 입력 페이지로 이동. |
| 06 | [`sc_558eb0c9495240fa912210e280b28e29`](https://gummble.com/screens/sc_558eb0c9495240fa912210e280b28e29?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Stripe 인증앱 코드 요청 | 6자리 입력 후 검증 스피너가 보인다. |
| 07 | [`sc_4adbf874021e43bd88827a022ad24dde`](https://gummble.com/screens/sc_4adbf874021e43bd88827a022ad24dde?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Stripe 코드 검증 | Bonsai로 돌아간다는 리디렉션 화면. |
| 08 | [`sc_fd88c0741acd4bb69320dae4adb1f012`](https://gummble.com/screens/sc_fd88c0741acd4bb69320dae4adb1f012?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Bonsai 복귀 리디렉션 | 연결 성공 토스트와 카드 결제 on 표시. |
| 09 | [`sc_768646543beb434a8c8f132a6de4dd39`](https://gummble.com/screens/sc_768646543beb434a8c8f132a6de4dd39?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Stripe 연결 성공 | 토스트가 사라지고 연결 상태 유지. |
| 10 | [`sc_c012403e6cdc45fd97c6f08848af4952`](https://gummble.com/screens/sc_c012403e6cdc45fd97c6f08848af4952?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 연결된 결제수단 유지 | 연결 완료 표시로 종료. 지급/결제 실행 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 인보이스 목록과 결제 연결 안내

- Screen ID: `sc_21f42247e22948b3b35d5313e9e315a5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21f42247e22948b3b35d5313e9e315a5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/350ed68e-021e-4ff8-9e83-3c90f3405098.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_1dc0c1e56d2549dab86354f2d4d8185e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 사이드바·상단 전역바, Invoices/Settings/Default Values 탭. 결제 홍보 패널 아래 검색과 표.
- 입력 항목·필수 표시·기본값: 한 행 #1001, 발행 Feb07 2024·만기 Mar08 2024, Doe Company/Design Project with Doe Studio, Total/Paid $0.00. 검색 비어 있음.
- 버튼·메뉴·안내 문구: Cards/Bank Transfer/PayPal 꺼진 토글, 안내 닫기, Filters, Edit Payment Methods, New Invoice, 행 … 및 정렬 아이콘.
- 확인된 상태: 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 문서 금액과 수납액이 별도이며 발행일과 만기일도 분리된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 점 색상 의미·필터조건·결제연결 요구사항 미확인.

#### 모델링 영향

- 후보와 근거: 인보이스 요약 목록·반복 시리즈·결제수단 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 결제 공급자 연결 선택

- Screen ID: `sc_1dc0c1e56d2549dab86354f2d4d8185e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1dc0c1e56d2549dab86354f2d4d8185e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fc113090-efb7-483a-9658-b3948512cc03.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_21f42247e22948b3b35d5313e9e315a5` → 현재 → `sc_aaf4eb9dbbf5455f9a5e45c89dacbba8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Payment Methods 모달에 Stripe와 PayPal 카드가 세로로 배치.
- 입력 항목·필수 표시·기본값: 입력 없음. 두 공급자 모두 미연결 안내.
- 버튼·메뉴·안내 문구: Connect to Stripe, Connect to PayPal, Contact Support.
- 확인된 상태: 연결 전 상태.
- 단계 간 변화: Payment Methods에서 Stripe/PayPal 연결 옵션을 표시한다.

#### 동작과 데이터

- 화면 관찰: 공급자별 독립 연결 시작점 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 연결 권한·국가에 따른 표시 차이 미확인.

#### 모델링 영향

- 후보와 근거: 계정-결제공급자 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Bonsai 이메일 인증 빈 코드

- Screen ID: `sc_aaf4eb9dbbf5455f9a5e45c89dacbba8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aaf4eb9dbbf5455f9a5e45c89dacbba8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6afd575e-d0e7-4d3c-bc6e-c99669a4c715.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1dc0c1e56d2549dab86354f2d4d8185e` → 현재 → `sc_8fc8e97d33d14f84a4c093109d5d5b8e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체 화면 흰 배경, 위 안내·중앙 열쇠 그림·하단6칸 입력. 우상단 X.
- 입력 항목·필수 표시·기본값: 6자리 코드 빈 값, 첫칸포커스. 계정메일로 전송, 유효10분 안내, Resend code in01:00.
- 버튼·메뉴·안내 문구: 닫기 X, 재전송 대기 표시. 제출 버튼은 보이지 않음.
- 확인된 상태: 본인확인 대기.
- 단계 간 변화: Stripe 연결 시 Bonsai 이메일 코드 인증으로 전환한다.

#### 동작과 데이터

- 화면 관찰: 외부 연결 전에 Bonsai 측 추가 인증이 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제메일수신·오입력·만료·자동제출 방식 미확인.

#### 모델링 영향

- 후보와 근거: 인증challenge와 연결 요청 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 이메일 코드 검증 진행

- Screen ID: `sc_8fc8e97d33d14f84a4c093109d5d5b8e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8fc8e97d33d14f84a4c093109d5d5b8e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c475a1d5-1f9e-4198-b819-76309b1077c6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_aaf4eb9dbbf5455f9a5e45c89dacbba8` → 현재 → `sc_51e959da528e4eae935c3516a4993408`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 인증 페이지,6칸 값 채워짐과 하단 점 로딩.
- 입력 항목·필수 표시·기본값: 6자리 값 입력됨(인증값은 문서에 옮기지 않음). 재전송00:43.
- 버튼·메뉴·안내 문구: X·재전송대기. 별도확인버튼 없음.
- 확인된 상태: 처리중 상태.
- 단계 간 변화: 6자리 입력 후 로딩 상태로 진행한다.

#### 동작과 데이터

- 화면 관찰: 입력 완료 후 로딩을 관찰. 성공 자체는 다음화면으로 판단.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 재시도제한·검증에러·붙여넣기동작 미확인.

#### 모델링 영향

- 후보와 근거: 코드입력/검증중/성공실패 UI상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Stripe 연결 요청 진행

- Screen ID: `sc_51e959da528e4eae935c3516a4993408`
- 원본: [화면 페이지](https://gummble.com/screens/sc_51e959da528e4eae935c3516a4993408?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/81e98dd2-e8d7-444d-a018-d5ef77a7fa61.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8fc8e97d33d14f84a4c093109d5d5b8e` → 현재 → `sc_558eb0c9495240fa912210e280b28e29`

#### 화면에서 직접 확인한 내용

- 레이아웃: Payment Methods 모달 복귀.
- 입력 항목·필수 표시·기본값: Stripe 버튼 Connecting to Stripe… 회색파랑. PayPal 연결 버튼 유지.
- 버튼·메뉴·안내 문구: Connecting to Stripe…·Connect to PayPal·X.
- 확인된 상태: 외부 연결 준비/진행 중.
- 단계 간 변화: Payment Methods로 돌아와 Connecting to Stripe 표시.

#### 동작과 데이터

- 화면 관찰: Bonsai 본인확인 이후 provider 이동 전 중간상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 타임아웃·중복클릭·외부창차단 대응 미확인.

#### 모델링 영향

- 후보와 근거: 연결 진행 상태와 버튼 중복요청방지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — Stripe 인증앱 코드 요청

- Screen ID: `sc_558eb0c9495240fa912210e280b28e29`
- 원본: [화면 페이지](https://gummble.com/screens/sc_558eb0c9495240fa912210e280b28e29?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2e78438e-f93e-46ce-85e7-326aa22f16a6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_51e959da528e4eae935c3516a4993408` → 현재 → `sc_4adbf874021e43bd88827a022ad24dde`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 Bonsai Inc/Stripe 안내, 우측 Verify your login. 하단Stripe약관/개인정보·English(SG).
- 입력 항목·필수 표시·기본값: 6자리 verification code 빈 칸. 인증앱에서 가져오라는 안내.
- 버튼·메뉴·안내 문구: Return to Bonsai Inc, 언어선택·약관·정책 링크.
- 확인된 상태: 외부 공급자 인증 대기.
- 단계 간 변화: Stripe의 인증앱 코드 입력 페이지로 이동.

#### 동작과 데이터

- 화면 관찰: Bonsai 이메일 인증과 별개인 Stripe 인증이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기존로그인 세션·다른2FA수단·동의화면 미수록.

#### 모델링 영향

- 후보와 근거: 외부인증 위임 경계. 공급자 인증정보를 우리 업무DB필드로 복제하지 않음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — Stripe 코드 검증

- Screen ID: `sc_4adbf874021e43bd88827a022ad24dde`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4adbf874021e43bd88827a022ad24dde?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2f2cf4e4-120a-49f2-a87d-40c993a1da03.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_558eb0c9495240fa912210e280b28e29` → 현재 → `sc_fd88c0741acd4bb69320dae4adb1f012`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 외부 인증 페이지,6자리 채움·작은 스피너.
- 입력 항목·필수 표시·기본값: 인증값 채움(값재기재안함).
- 버튼·메뉴·안내 문구: Return to Bonsai Inc 유지.
- 확인된 상태: 검증중.
- 단계 간 변화: 6자리 입력 후 검증 스피너가 보인다.

#### 동작과 데이터

- 화면 관찰: 코드 제출 후 처리중 상태 관찰.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 오류·만료·백업코드 미확인.

#### 모델링 영향

- 후보와 근거: 외부 인증 결과를 기다리는 연결 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — Bonsai 복귀 리디렉션

- Screen ID: `sc_fd88c0741acd4bb69320dae4adb1f012`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fd88c0741acd4bb69320dae4adb1f012?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a9e91951-3695-4d6c-a306-4498103c5184.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4adbf874021e43bd88827a022ad24dde` → 현재 → `sc_768646543beb434a8c8f132a6de4dd39`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측Stripe브랜딩,우측 중앙스피너와 복귀안내.
- 입력 항목·필수 표시·기본값: 입력없음.
- 버튼·메뉴·안내 문구: Returning to Bonsai Inc와 곧리디렉션 안내,Return링크.
- 확인된 상태: 외부에서 앱으로 복귀 중.
- 단계 간 변화: Bonsai로 돌아간다는 리디렉션 화면.

#### 동작과 데이터

- 화면 관찰: provider단계가 앱복귀로 이어짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: callback파라미터·서명검증·실패복구 미확인.

#### 모델링 영향

- 후보와 근거: 연결 callback 처리와 중간상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — Stripe 연결 성공

- Screen ID: `sc_768646543beb434a8c8f132a6de4dd39`
- 원본: [화면 페이지](https://gummble.com/screens/sc_768646543beb434a8c8f132a6de4dd39?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/95515115-d653-4543-ad40-f660e8e8f105.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_fd88c0741acd4bb69320dae4adb1f012` → 현재 → `sc_c012403e6cdc45fd97c6f08848af4952`

#### 화면에서 직접 확인한 내용

- 레이아웃: Payment Methods 모달의 Stripe카드가 토글/카드브랜드/대시보드 링크로 변경.
- 입력 항목·필수 표시·기본값: Card Payments on. PayPal 미연결.
- 버튼·메뉴·안내 문구: 성공토스트, Fees정보, Stripe Dashboard, Stripe… , Connect to PayPal, X.
- 확인된 상태: 연결 성공 표시.
- 단계 간 변화: 연결 성공 토스트와 카드 결제 on 표시.

#### 동작과 데이터

- 화면 관찰: Stripe연결과 카드활성화가UI상확인됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제승인/출금/정산가능여부 및 계정검증상태는 미확인.

#### 모델링 영향

- 후보와 근거: provider연결·카드허용·대시보드연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 연결된 결제수단 유지

- Screen ID: `sc_c012403e6cdc45fd97c6f08848af4952`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c012403e6cdc45fd97c6f08848af4952?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/963610f4-7d6f-4b8a-bb84-af69a2e364c1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_768646543beb434a8c8f132a6de4dd39` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 Payment Methods 모달, 성공 토스트 없음.
- 입력 항목·필수 표시·기본값: Stripe Card Payments on, PayPal 연결 전.
- 버튼·메뉴·안내 문구: Fees·Stripe Dashboard·…·Connect to PayPal·X.
- 확인된 상태: 연결 후 안정상태.
- 단계 간 변화: 토스트가 사라지고 연결 상태 유지.

#### 동작과 데이터

- 화면 관찰: 연결 토스트가 사라진 이후 설정 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침영속성·해제메뉴 내용 미확인.

#### 모델링 영향

- 후보와 근거: 연결 상태와 기본 결제 허용 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 이메일 코드 유효10분, 재전송 대기60초 안내. 실제 제한/실패/잠금은 재현하지 않았다.
- [관찰] Stripe 외부 페이지는 인증앱 코드를 요구한다. 모든 계정이 동일 인증수단을 쓰는지는 미확인.
- [관찰] 연결 성공 후 Card Payments on, Stripe Dashboard 링크, … 메뉴가 나타난다.
- [문서] 결제 연결과 지급 관리가 나뉘며 국가·결제수단 조건이 있다. 샘플의 English(SG)를 전체 계정지원 범위로 일반화하지 않는다.

## 6. 공식 도움말과 API 대조

- [Stripe 연결 도움말](https://help.hellobonsai.com/en/articles/13521627-how-to-connect-stripe-payments-in-bonsai): 2026-07-15 기준 Invoices > Edit Payment Methods에서 연결하며 지급 관리는 Stripe 대시보드를 사용한다. Bonsai Payments 사용 시 해제가 먼저 필요할 수 있다고 설명한다.
- [지원 결제수단](https://help.hellobonsai.com/en/articles/1867512-the-integrated-payment-methods-supported-by-bonsai): Bonsai Payments·Stripe·PayPal을 구분하며 국가/수단별 조건을 설명한다. 수수료를 이 스크린샷으로 고정하지 않는다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다. 외부 연결 OAuth·인증·결제 provider 계약은 공개 인보이스 API와 별도 검토 대상이다.

## 7. 데이터 모델링 시사점

- 결제 공급자 연결 레코드·외부계정 참조·연결 상태·허용 결제수단을 분리하는 후보.
- 일회용 인증 challenge의 만료·재전송·검증 상태 후보. 이미지 속 실제 인증 숫자는 설계 기록에 재기재하지 않는다.
- 연결 성공·결제 가능·실제 정산 완료는 서로 다른 상태 후보.

## 8. 미확인 사항과 검토 질문

- 연결 취소/외부 실패/중복콜백/재연결 때 상태를 어떻게 복원하는지 확인한다.
- Stripe 권한 동의와 신규계정/KYC 화면은 이 경로에 없으므로 별도 계정 유형에서 확인한다.
- 계정 기본 결제수단 변경이 기존 구독·발송 문서에 적용되는 범위를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
