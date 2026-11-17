# Subscribing to Starter plan 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **12/12단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `89302289-1851-4066-91e4-d61a28f79e15` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=89302289-1851-4066-91e4-d61a28f79e15) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 12단계 / 12단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

체험 종료 후 Starter 플랜·월 결제를 선택해 결제 확인을 거쳐 구독 설정과 영수증 목록을 확인한다.

- Bonsai 자체 사용료 결제이며 고객 청구서 결제·Stripe 수금 연동과 구분한다.
- 모든 금액·기능은 캡처 당시 표시값. 실제 구독/카드 입력은 수행하지 않았다.

- 하위 플로우: [Canceling subscription](Canceling%20subscription/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_0e5183c5b04a48fbae129f15214129e5`](https://gummble.com/screens/sc_0e5183c5b04a48fbae129f15214129e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 체험 종료 게이트 | 플랜 선택 |
| 02 | [`sc_9b0bf15ae874428f9c9a92caa68f9501`](https://gummble.com/screens/sc_9b0bf15ae874428f9c9a92caa68f9501?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 플랜 선택 — Professional 추천 | Starter로 선택 변경 |
| 03 | [`sc_a75300a685384445aac2bcb97f46624e`](https://gummble.com/screens/sc_a75300a685384445aac2bcb97f46624e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 플랜 선택 — Starter | 연결제 기본 결제 폼 |
| 04 | [`sc_0f6d11cb2f5d477f86549b09840defbb`](https://gummble.com/screens/sc_0f6d11cb2f5d477f86549b09840defbb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 연 결제 기본 폼 | 월 결제로 변경 |
| 05 | [`sc_ed8724c7367546edb1cd738b75fd06fa`](https://gummble.com/screens/sc_ed8724c7367546edb1cd738b75fd06fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 월 결제 선택 | 카드 입력·처리 중 |
| 06 | [`sc_023f9ca0b8c64c6ca4e1745506a474e3`](https://gummble.com/screens/sc_023f9ca0b8c64c6ca4e1745506a474e3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 카드 입력 후 처리 중 | hCaptcha 추가 확인 |
| 07 | [`sc_21d779863c8d4785b6cf1b9c6c9bdc14`](https://gummble.com/screens/sc_21d779863c8d4785b6cf1b9c6c9bdc14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추가 hCaptcha 확인 | hCaptcha 체크 |
| 08 | [`sc_331a3c29307343699a0a8d92ed3b8eb7`](https://gummble.com/screens/sc_331a3c29307343699a0a8d92ed3b8eb7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | hCaptcha 완료 | 저장된 카드 요약 |
| 09 | [`sc_4b1c791673224de7b980935a853862ff`](https://gummble.com/screens/sc_4b1c791673224de7b980935a853862ff?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 카드 요약 상태 | 구독 갱신 성공 |
| 10 | [`sc_9164a60dde6c4aa9a52899d31fd2b949`](https://gummble.com/screens/sc_9164a60dde6c4aa9a52899d31fd2b949?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Starter 구독 갱신 성공 | 플랜 기능 아래 스크롤 |
| 11 | [`sc_0f2d6d7e9a0a491e9c959d696dc6983e`](https://gummble.com/screens/sc_0f2d6d7e9a0a491e9c959d696dc6983e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 플랜과 Tax | Tax·TeamSeat·영수증 |
| 12 | [`sc_d38390a6e560420c99ae3bc4387e7fc0`](https://gummble.com/screens/sc_d38390a6e560420c99ae3bc4387e7fc0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Team Seat와 구독 영수증 | 구독영수증 목록에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 체험 종료 게이트

- Screen ID: `sc_0e5183c5b04a48fbae129f15214129e5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0e5183c5b04a48fbae129f15214129e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8bf49e09-2fe5-4d59-b75d-18b8c1012cfd.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9b0bf15ae874428f9c9a92caa68f9501`

#### 화면에서 직접 확인한 내용

- 레이아웃: 앱 사이드바는 유지, 큰 카드에 문서·자물쇠 그림과 안내.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Your free trial has ended,ChoosePlan,UpgradeNow,ContactSupport.
- 확인된 상태: 유료플랜 선택 요구.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 일부 기능 진입이 구독 선택으로 이어짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 모든 메뉴 차단 여부·제한플랜 범위 미확인.

#### 모델링 영향

- 후보와 근거: 체험 종료·기능자격 게이트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 플랜 선택 — Professional 추천

- Screen ID: `sc_9b0bf15ae874428f9c9a92caa68f9501`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9b0bf15ae874428f9c9a92caa68f9501?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d1942fc8-3799-487e-89f9-27d8aa33b15e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0e5183c5b04a48fbae129f15214129e5` → 현재 → `sc_a75300a685384445aac2bcb97f46624e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 전체화면3열 카드, 식물장식, 상단 X.
- 입력 항목·필수 표시·기본값: Starter/Professional/Business,Professional 체크·Recommended.
- 버튼·메뉴·안내 문구: Choose Professional.
- 확인된 상태: 기본 추천 선택.
- 단계 간 변화: 플랜 선택

#### 동작과 데이터

- 화면 관찰: 권장플랜과 선택플랜 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기능별 실제 제한·가격 미표시.

#### 모델링 영향

- 후보와 근거: 플랜 추천·선택 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 플랜 선택 — Starter

- Screen ID: `sc_a75300a685384445aac2bcb97f46624e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a75300a685384445aac2bcb97f46624e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fb4a7216-fe1f-4993-a821-fb1dc9efdfc4.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9b0bf15ae874428f9c9a92caa68f9501` → 현재 → `sc_0f6d11cb2f5d477f86549b09840defbb`

#### 화면에서 직접 확인한 내용

- 레이아웃: Starter 카드 녹색 테두리·체크, 추천배지는Professional에 남음.
- 입력 항목·필수 표시·기본값: Starter 선택.
- 버튼·메뉴·안내 문구: Choose Starter, X.
- 확인된 상태: 선택 변경.
- 단계 간 변화: Starter로 선택 변경

#### 동작과 데이터

- 화면 관찰: CTA라벨이 선택플랜에 대응.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다음화면 기본주기 정책 미확인.

#### 모델링 영향

- 후보와 근거: 플랜선택 state 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 연 결제 기본 폼

- Screen ID: `sc_0f6d11cb2f5d477f86549b09840defbb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0f6d11cb2f5d477f86549b09840defbb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f0db9ff3-4229-44dd-a17f-873ac45d14df.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a75300a685384445aac2bcb97f46624e` → 현재 → `sc_ed8724c7367546edb1cd738b75fd06fa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 카드입력, 오른쪽 Starter요약·주기카드.
- 입력 항목·필수 표시·기본값: 카드명JoeDoe,카드번호/만료/CVC빈칸. Yearly21/month Total252,Monthly25.
- 버튼·메뉴·안내 문구: Subscribe,change,AddPromoCode.
- 확인된 상태: 연간선택,Save48 배지.
- 단계 간 변화: 연결제 기본 결제 폼

#### 동작과 데이터

- 화면 관찰: 월환산가격과 실제 청구총액 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 통화·세금·명시적동의 계약미확인.

#### 모델링 영향

- 후보와 근거: 주기별가격·총액·프로모션 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 월 결제 선택

- Screen ID: `sc_ed8724c7367546edb1cd738b75fd06fa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ed8724c7367546edb1cd738b75fd06fa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/54cd18e1-2e32-4255-88c7-04547a596dd0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0f6d11cb2f5d477f86549b09840defbb` → 현재 → `sc_023f9ca0b8c64c6ca4e1745506a474e3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일2열.
- 입력 항목·필수 표시·기본값: Monthly25/month선택,Total25.
- 버튼·메뉴·안내 문구: Subscribe. 매월자동갱신 문구.
- 확인된 상태: 월주기로변경.
- 단계 간 변화: 월 결제로 변경

#### 동작과 데이터

- 화면 관찰: 총액·갱신문구가 함께변경.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 일할계산미수록.

#### 모델링 영향

- 후보와 근거: 청구주기 및 갱신 정책 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 카드 입력 후 처리 중

- Screen ID: `sc_023f9ca0b8c64c6ca4e1745506a474e3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_023f9ca0b8c64c6ca4e1745506a474e3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b298e9a2-607c-48a6-a260-a58750e08853.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ed8724c7367546edb1cd738b75fd06fa` → 현재 → `sc_21d779863c8d4785b6cf1b9c6c9bdc14`

#### 화면에서 직접 확인한 내용

- 레이아웃: 카드입력란 채워지고 Subscribe자리에 점로딩.
- 입력 항목·필수 표시·기본값: 카드번호/만료/CVC가 화면에 있으나 원문을 기록하지 않음.
- 버튼·메뉴·안내 문구: 결제처리 로딩,프로모션링크.
- 확인된 상태: 결제요청 대기.
- 단계 간 변화: 카드 입력·처리 중

#### 동작과 데이터

- 화면 관찰: 자격정보 입력과 결제 처리상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드저장동의·토큰화·실제승인미확인.

#### 모델링 영향

- 후보와 근거: 결제수단참조와 처리 상태 후보; 원문카드 저장 근거 없음.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 추가 hCaptcha 확인

- Screen ID: `sc_21d779863c8d4785b6cf1b9c6c9bdc14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_21d779863c8d4785b6cf1b9c6c9bdc14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9f461f39-9b78-4333-a60f-61ed2e448842.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_023f9ca0b8c64c6ca4e1745506a474e3` → 현재 → `sc_331a3c29307343699a0a8d92ed3b8eb7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 배경과 작은 중앙 모달.
- 입력 항목·필수 표시·기본값: I am human 미체크.
- 버튼·메뉴·안내 문구: 체크박스,CLOSE.
- 확인된 상태: 추가봇검증.
- 단계 간 변화: hCaptcha 추가 확인

#### 동작과 데이터

- 화면 관찰: 로그인 reCAPTCHA와 다른 표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 발동조건·검증실패 미확인.

#### 모델링 영향

- 후보와 근거: 결제전 추가확인 단계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — hCaptcha 완료

- Screen ID: `sc_331a3c29307343699a0a8d92ed3b8eb7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_331a3c29307343699a0a8d92ed3b8eb7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/eb455297-3691-489f-9e05-86e94ac9f8ab.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_21d779863c8d4785b6cf1b9c6c9bdc14` → 현재 → `sc_4b1c791673224de7b980935a853862ff`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은모달.
- 입력 항목·필수 표시·기본값: I am human 체크.
- 버튼·메뉴·안내 문구: 닫기.
- 확인된 상태: 확인표시, 배경은아직처리중.
- 단계 간 변화: hCaptcha 체크

#### 동작과 데이터

- 화면 관찰: 봇검증이 완료된UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 결제성공과 동일하지 않음.

#### 모델링 영향

- 후보와 근거: 검증완료후처리 전환.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 카드 요약 상태

- Screen ID: `sc_4b1c791673224de7b980935a853862ff`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4b1c791673224de7b980935a853862ff?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a29d09cd-c9b1-4a25-bac6-ec907041aca1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_331a3c29307343699a0a8d92ed3b8eb7` → 현재 → `sc_9164a60dde6c4aa9a52899d31fd2b949`

#### 화면에서 직접 확인한 내용

- 레이아웃: 결제폼 카드입력대신 Visa마지막4자리요약.
- 입력 항목·필수 표시·기본값: Visa7065,Monthly25.
- 버튼·메뉴·안내 문구: Subscribe 연한색.
- 확인된 상태: 요약형 결제수단 표시.
- 단계 간 변화: 저장된 카드 요약

#### 동작과 데이터

- 화면 관찰: 카드 입력에서 참조 표시로 변경.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 제출 중인지 버튼 재클릭 필요인지 미확인.

#### 모델링 영향

- 후보와 근거: 저장결제수단 표시 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — Starter 구독 갱신 성공

- Screen ID: `sc_9164a60dde6c4aa9a52899d31fd2b949`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9164a60dde6c4aa9a52899d31fd2b949?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/45c8b2a8-76fc-4ca6-b8c0-d08542153239.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4b1c791673224de7b980935a853862ff` → 현재 → `sc_0f2d6d7e9a0a491e9c959d696dc6983e`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings Subscription,CurrentSubscription카드와 토스트.
- 입력 항목·필수 표시·기본값: Starter25월,다음청구Mar8 2024,Visa7065.
- 버튼·메뉴·안내 문구: Managepaymentmethods,upgrade,cancel,Switchtoyearly.구독업데이트성공.
- 확인된 상태: Starter 활성표시.
- 단계 간 변화: 구독 갱신 성공

#### 동작과 데이터

- 화면 관찰: 다음청구일·기본결제수단확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 승인거래ID·세금내역미확인.

#### 모델링 영향

- 후보와 근거: 구독유효기간과결제수단 연결.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 구독 플랜과 Tax

- Screen ID: `sc_0f2d6d7e9a0a491e9c959d696dc6983e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0f2d6d7e9a0a491e9c959d696dc6983e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b2e9f214-d311-4812-82a7-c1988a7d4828.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9164a60dde6c4aa9a52899d31fd2b949` → 현재 → `sc_d38390a6e560420c99ae3bc4387e7fc0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열기능표와Tax카드.
- 입력 항목·필수 표시·기본값: Starter25현재플랜,Professional39,Business79,Tax10/월.
- 버튼·메뉴·안내 문구: CurrentPlan비활성,UpgradePlan,TaxStartFreeTrial.
- 확인된 상태: 상품비교.
- 단계 간 변화: 플랜 기능 아래 스크롤

#### 동작과 데이터

- 화면 관찰: 기본플랜과Tax추가상품 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재가격·요금제명 변경가능.

#### 모델링 영향

- 후보와 근거: 기능자격 및 부가상품 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — Team Seat와 구독 영수증

- Screen ID: `sc_d38390a6e560420c99ae3bc4387e7fc0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d38390a6e560420c99ae3bc4387e7fc0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bd71ec0c-4666-4a14-849a-1561d5a16c2e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0f2d6d7e9a0a491e9c959d696dc6983e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tax아래TeamSeat,SubscriptionReceipts 표.
- 입력 항목·필수 표시·기본값: TeamSeat10/월,Feb8–Mar8,$25Invoice,Plan.
- 버튼·메뉴·안내 문구: InviteMember,영수증행.
- 확인된 상태: 구독 청구기간 영수증1개.
- 단계 간 변화: Tax·TeamSeat·영수증

#### 동작과 데이터

- 화면 관찰: 좌석상품과 사용료영수증.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다운로드파일·좌석수·지급상태미확인.

#### 모델링 영향

- 후보와 근거: 구독청구서/영수증과좌석상품 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 연간 $21/월 표시는 총$252 결제와 함께 나온다. 월 결제는$25 총액.
- 자동 갱신 주기 문구도 연→월로 바뀐다.
- 카드 입력 중 상세정보가 보이는 화면과 마지막4자리 요약은 다른 상태다. 상세 카드정보는 분석문서에 옮기지 않는다.
- hCaptcha 통과는 결제승인과 구분. 구독갱신토스트·다음청구일·영수증목록이 후속근거.
- Tax와 Team Seat가 기본 플랜과 별도로 보인다.

## 6. 공식 도움말과 API 대조

- [플랜 변경](https://help.hellobonsai.com/en/articles/2003194-how-to-change-your-subscription-plan): 월·연 결제와 플랜 변경, 기간 중 차액 조정·별도 부가 상품을 설명한다. 캡처의25/39/79달러를 현재 가격으로 취급하지 않는다.
- [결제수단 변경](https://help.hellobonsai.com/en/articles/1977581-how-to-change-your-subscription-payment-method): 구독용 결제수단은 Subscription에서 관리하며 이후 청구에 사용한다.
- [체험 안내](https://help.hellobonsai.com/en/articles/4303058-how-our-free-trial-works): 현재 도움말의 체험 자동갱신 설명과 캡처의 체험종료 게이트는 가입·결제수단 조건 차이 가능성을 남긴다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 요금제·결제주기·구독기간·청구금액·결제수단참조·영수증과 부가상품 후보.
- 서비스 이용료 청구와 우리 사용자의 고객 인보이스를 별도 개념으로 검토.
- 결제처리·추가인증·구독반영의 상태를 분리.

## 8. 미확인 사항과 검토 질문

- 실패·3DS·중복결제·세금·프로모션·좌석수 계산 확인.
- 금액정산·환불·기간중변경 정책은 현재 공식문서와 제품결정으로 확정할 것.
- hCaptcha 공급자와 결제 처리자의 관계는 네트워크 없이 추정하지 않음.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 12개와 실제 이미지 12개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
