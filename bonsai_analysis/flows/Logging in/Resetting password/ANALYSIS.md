# Resetting password 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `8f9cc02b-1748-4b71-97d8-5c80bb299013` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=8f9cc02b-1748-4b71-97d8-5c80bb299013) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 10개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

재설정 이메일을 요청한 뒤 새 비밀번호 입력·강도 오류·수정·성공으로 이어지는 복구 흐름이다.

- 메일함과 재설정 링크 자체는 수록되지 않았다.
- 초대 수락과 달리 완료 후 자동 로그인하지 않고 로그인 페이지를 보여준다.

- 상위 분석: [Logging in](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Logging in/Resetting password`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_9d353458318e43e7b25ebbf88fefeaa9`](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 — 빈 인증 폼](<screens/01_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | Reset Password 진입 |
| 02 | [`sc_682da57b2dd148c6b455af1a8aa229fc`](https://gummble.com/screens/sc_682da57b2dd148c6b455af1a8aa229fc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재설정 이메일 빈 폼](<screens/02_sc_682da57b2dd148c6b455af1a8aa229fc.png>) | 이메일 입력 |
| 03 | [`sc_7ac8efa85ddf46ffb99647670f126feb`](https://gummble.com/screens/sc_7ac8efa85ddf46ffb99647670f126feb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재설정 이메일 입력](<screens/03_sc_7ac8efa85ddf46ffb99647670f126feb.png>) | CAPTCHA 체크 |
| 04 | [`sc_85c7828ac6694af5abfedb3f9fd93a6a`](https://gummble.com/screens/sc_85c7828ac6694af5abfedb3f9fd93a6a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재설정 CAPTCHA 확인](<screens/04_sc_85c7828ac6694af5abfedb3f9fd93a6a.png>) | 재설정 메일 발송 안내 |
| 05 | [`sc_f633b6435614448fb79dc464ccae4c43`](https://gummble.com/screens/sc_f633b6435614448fb79dc464ccae4c43?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재설정 이메일 발송 안내](<screens/05_sc_f633b6435614448fb79dc464ccae4c43.png>) | 메일 링크 이동 과정 생략 후 New Password |
| 06 | [`sc_d23a8b46d69c4fe590dfd6013a244521`](https://gummble.com/screens/sc_d23a8b46d69c4fe590dfd6013a244521?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 비밀번호 빈 폼](<screens/06_sc_d23a8b46d69c4fe590dfd6013a244521.png>) | 새 비밀번호 입력 |
| 07 | [`sc_938a3faee974462c9a77a24ab1996464`](https://gummble.com/screens/sc_938a3faee974462c9a77a24ab1996464?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 비밀번호 입력](<screens/07_sc_938a3faee974462c9a77a24ab1996464.png>) | Password is too weak 오류·입력 초기화 |
| 08 | [`sc_aab3fabd62024fc584f9c87adb63ba16`](https://gummble.com/screens/sc_aab3fabd62024fc584f9c87adb63ba16?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 비밀번호 강도 오류](<screens/08_sc_aab3fabd62024fc584f9c87adb63ba16.png>) | 다시 입력; 오류문구는 남음 |
| 09 | [`sc_c81516b8daf84d66bb0657f853d44d2e`](https://gummble.com/screens/sc_c81516b8daf84d66bb0657f853d44d2e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [강도 오류 후 재입력](<screens/09_sc_c81516b8daf84d66bb0657f853d44d2e.png>) | 로그인 화면·변경 성공 |
| 10 | [`sc_46468ed1fd3f4a0992bef64f1c651449`](https://gummble.com/screens/sc_46468ed1fd3f4a0992bef64f1c651449?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비밀번호 재설정 성공](<screens/10_sc_46468ed1fd3f4a0992bef64f1c651449.png>) | 성공 후 재로그인 전 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 로그인 — 빈 인증 폼

- Screen ID: `sc_9d353458318e43e7b25ebbf88fefeaa9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b509948c-e5f3-488b-aa87-4b9c6560fb90.png)
- 로컬 이미지: [01_sc_9d353458318e43e7b25ebbf88fefeaa9.png](<screens/01_sc_9d353458318e43e7b25ebbf88fefeaa9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_682da57b2dd148c6b455af1a8aa229fc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 왼쪽 로고와 오른쪽 Log In·Sign Up. 본문 왼쪽은 스크롤 가능한 The Changelog 카드, 오른쪽은 세로 로그인 카드다.
- 입력 항목·필수 표시·기본값: Email·Password는 비어 있고 reCAPTCHA 체크박스는 선택되지 않았다. 이 캡처에서 입력 필수 별표나 오류 문구는 보이지 않는다.
- 버튼·메뉴·안내 문구: Sign in with Google·Sign in with Apple, 초록색 Log in, Reset Password·Resend Verification Email. Changelog에는 여러 New 표시와 Bonsai updates 링크가 있다.
- 확인된 상태: 로그인 입력 전 화면이다. 계정 삭제 완료나 비밀번호 재설정 완료 안내는 없다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 인증 방식 선택과 이메일·비밀번호 입력 진입점을 확인한다. 로그인·비밀번호 재설정·계정 삭제 플로우가 같은 이미지를 다른 맥락에서 사용한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 화면으로 이동하기 전의 서버 처리, 인증 세션 종료 사유, 계정 존재·삭제 상태는 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 인증 제공자, 자격 증명 입력과 검증 오류, 비밀번호 재설정·메일 확인 경로 후보. 화면 이동과 계정의 삭제 상태는 별도로 판단한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 재설정 이메일 빈 폼

- Screen ID: `sc_682da57b2dd148c6b455af1a8aa229fc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_682da57b2dd148c6b455af1a8aa229fc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b632841b-e88e-45d7-bd22-f4f73390d864.png)
- 로컬 이미지: [02_sc_682da57b2dd148c6b455af1a8aa229fc.png](<screens/02_sc_682da57b2dd148c6b455af1a8aa229fc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9d353458318e43e7b25ebbf88fefeaa9` → 현재 → `sc_7ac8efa85ddf46ffb99647670f126feb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Reset Your Password 카드.
- 입력 항목·필수 표시·기본값: 이메일 예시 you@company.com, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: Send password reset email, Resend Verification Email, 상단 Login/Signup.
- 확인된 상태: 요청 전.
- 단계 간 변화: Reset Password 진입

#### 동작과 데이터

- 화면 관찰: 재설정과 이메일 인증 재발송 링크가 함께 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 두 링크 목적·경로 차이 미확인.

#### 모델링 영향

- 후보와 근거: 별도 인증 목적의 토큰 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 재설정 이메일 입력

- Screen ID: `sc_7ac8efa85ddf46ffb99647670f126feb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7ac8efa85ddf46ffb99647670f126feb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/58a01813-85a2-435a-8eca-6b46c4fe402b.png)
- 로컬 이미지: [03_sc_7ac8efa85ddf46ffb99647670f126feb.png](<screens/03_sc_7ac8efa85ddf46ffb99647670f126feb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_682da57b2dd148c6b455af1a8aa229fc` → 현재 → `sc_85c7828ac6694af5abfedb3f9fd93a6a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 카드.
- 입력 항목·필수 표시·기본값: jdoe.mobbin@gmail.com, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: Send password reset email.
- 확인된 상태: 입력됨.
- 단계 간 변화: 이메일 입력

#### 동작과 데이터

- 화면 관찰: 요청 대상 이메일 지정.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 존재하지 않는 계정 처리 미확인.

#### 모델링 영향

- 후보와 근거: 복구 요청 대상 식별.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 재설정 CAPTCHA 확인

- Screen ID: `sc_85c7828ac6694af5abfedb3f9fd93a6a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_85c7828ac6694af5abfedb3f9fd93a6a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/54de9724-5b0d-4727-97d0-e51de164d4b2.png)
- 로컬 이미지: [04_sc_85c7828ac6694af5abfedb3f9fd93a6a.png](<screens/04_sc_85c7828ac6694af5abfedb3f9fd93a6a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7ac8efa85ddf46ffb99647670f126feb` → 현재 → `sc_f633b6435614448fb79dc464ccae4c43`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 카드.
- 입력 항목·필수 표시·기본값: 이메일 유지, CAPTCHA 녹색 체크.
- 버튼·메뉴·안내 문구: Send password reset email.
- 확인된 상태: 발송 준비.
- 단계 간 변화: CAPTCHA 체크

#### 동작과 데이터

- 화면 관찰: 봇 검증 표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 만료·재시도 미확인.

#### 모델링 영향

- 후보와 근거: CAPTCHA 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 재설정 이메일 발송 안내

- Screen ID: `sc_f633b6435614448fb79dc464ccae4c43`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f633b6435614448fb79dc464ccae4c43?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e9f9364f-2c1c-4623-bd25-dfc93e512c99.png)
- 로컬 이미지: [05_sc_f633b6435614448fb79dc464ccae4c43.png](<screens/05_sc_f633b6435614448fb79dc464ccae4c43.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_85c7828ac6694af5abfedb3f9fd93a6a` → 현재 → `sc_d23a8b46d69c4fe590dfd6013a244521`

#### 화면에서 직접 확인한 내용

- 레이아웃: 입력폼 대신 회색 안내 박스.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 몇 분 내 도착·스팸함 확인 안내. Resend Verification Email 링크 유지.
- 확인된 상태: 발송 안내 단계.
- 단계 간 변화: 재설정 메일 발송 안내

#### 동작과 데이터

- 화면 관찰: 재설정 링크를 이메일로 보냈다는 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 수신·재설정용 재발송 버튼인지 미확인.

#### 모델링 영향

- 후보와 근거: 요청 접수 안내와 메일 전달 결과 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 새 비밀번호 빈 폼

- Screen ID: `sc_d23a8b46d69c4fe590dfd6013a244521`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d23a8b46d69c4fe590dfd6013a244521?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cabafee3-9627-48c7-8f02-fc5a23fcb050.png)
- 로컬 이미지: [06_sc_d23a8b46d69c4fe590dfd6013a244521.png](<screens/06_sc_d23a8b46d69c4fe590dfd6013a244521.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f633b6435614448fb79dc464ccae4c43` → 현재 → `sc_938a3faee974462c9a77a24ab1996464`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 New Password 카드.
- 입력 항목·필수 표시·기본값: New Password 단일 빈 필드, 확인 필드 없음.
- 버튼·메뉴·안내 문구: Save New Password, Resend Verification Email.
- 확인된 상태: 링크 진입 후로 추정되나 URL은 없음.
- 단계 간 변화: 메일 링크 이동 과정 생략 후 New Password

#### 동작과 데이터

- 화면 관찰: 새 비밀번호 입력 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 토큰 검사·만료 상태 미확인.

#### 모델링 영향

- 후보와 근거: 복구 토큰과 비밀번호 변경 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 새 비밀번호 입력

- Screen ID: `sc_938a3faee974462c9a77a24ab1996464`
- 원본: [화면 페이지](https://gummble.com/screens/sc_938a3faee974462c9a77a24ab1996464?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/75049858-3e7c-4950-b943-707d10760568.png)
- 로컬 이미지: [07_sc_938a3faee974462c9a77a24ab1996464.png](<screens/07_sc_938a3faee974462c9a77a24ab1996464.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d23a8b46d69c4fe590dfd6013a244521` → 현재 → `sc_aab3fabd62024fc584f9c87adb63ba16`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 카드.
- 입력 항목·필수 표시·기본값: 마스킹된 새 비밀번호.
- 버튼·메뉴·안내 문구: Save New Password.
- 확인된 상태: 오류 전 입력.
- 단계 간 변화: 새 비밀번호 입력

#### 동작과 데이터

- 화면 관찰: 값 입력 완료.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 길이·문자 조합 판단 불가.

#### 모델링 영향

- 후보와 근거: 민감 입력 마스킹.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 새 비밀번호 강도 오류

- Screen ID: `sc_aab3fabd62024fc584f9c87adb63ba16`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aab3fabd62024fc584f9c87adb63ba16?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3581975d-2527-4405-85d6-9afcbfcc18dc.png)
- 로컬 이미지: [08_sc_aab3fabd62024fc584f9c87adb63ba16.png](<screens/08_sc_aab3fabd62024fc584f9c87adb63ba16.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_938a3faee974462c9a77a24ab1996464` → 현재 → `sc_c81516b8daf84d66bb0657f853d44d2e`

#### 화면에서 직접 확인한 내용

- 레이아웃: New Password 아래 Whoops!와 오류, 폼이 아래로 밀림.
- 입력 항목·필수 표시·기본값: 입력 필드는 빈 placeholder로 돌아감.
- 버튼·메뉴·안내 문구: Password is too weak, Save New Password.
- 확인된 상태: 검증 실패.
- 단계 간 변화: Password is too weak 오류·입력 초기화

#### 동작과 데이터

- 화면 관찰: 입력값 초기화와 강도 오류를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한 강도 알고리즘 미확인.

#### 모델링 영향

- 후보와 근거: 서버 검증 오류·입력 초기화 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 강도 오류 후 재입력

- Screen ID: `sc_c81516b8daf84d66bb0657f853d44d2e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c81516b8daf84d66bb0657f853d44d2e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/203926cc-2f08-4037-bbd2-48dc2e6613ca.png)
- 로컬 이미지: [09_sc_c81516b8daf84d66bb0657f853d44d2e.png](<screens/09_sc_c81516b8daf84d66bb0657f853d44d2e.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_aab3fabd62024fc584f9c87adb63ba16` → 현재 → `sc_46468ed1fd3f4a0992bef64f1c651449`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오류 문구 유지, 입력만 채워짐.
- 입력 항목·필수 표시·기본값: 새 비밀번호 마스킹.
- 버튼·메뉴·안내 문구: Save New Password.
- 확인된 상태: 이전 오류가 재입력 중 남음.
- 단계 간 변화: 다시 입력; 오류문구는 남음

#### 동작과 데이터

- 화면 관찰: 오류 제거가 실시간이 아닌 것으로 보이나 트리거 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다음 제출 전 검증 상태 미확인.

#### 모델링 영향

- 후보와 근거: 오류 보존·재검증 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 비밀번호 재설정 성공

- Screen ID: `sc_46468ed1fd3f4a0992bef64f1c651449`
- 원본: [화면 페이지](https://gummble.com/screens/sc_46468ed1fd3f4a0992bef64f1c651449?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a6d59e68-b020-4668-9974-140e1f03dfdd.png)
- 로컬 이미지: [10_sc_46468ed1fd3f4a0992bef64f1c651449.png](<screens/10_sc_46468ed1fd3f4a0992bef64f1c651449.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c81516b8daf84d66bb0657f853d44d2e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 로그인 카드와 변경된 Changelog, 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: Email/Password 빈 값, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: 새 비밀번호 설정 성공 안내, Log in.
- 확인된 상태: 자동 로그인 화면이 아님.
- 단계 간 변화: 로그인 화면·변경 성공

#### 동작과 데이터

- 화면 관찰: 비밀번호 변경 성공과 로그인 요청을 분리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 세션 로그아웃·이전 비밀번호 무효화 미확인.

#### 모델링 영향

- 후보와 근거: credential 변경 후 로그인 경로 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 메일 발송 안내는 실제 수신이나 토큰 유효성 증거가 아니다.
- 재설정 폼은 새 비밀번호1개이며 확인 필드는 없다.
- 약한 비밀번호 오류 후 필드가 비워지고 재입력 중에도 오류가 남는다.
- 최종 토스트는 새 비밀번호 설정 성공이며 인증된 대시보드로 이동하지 않는다.

## 6. 공식 도움말과 API 대조

- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 자신의 회사 이름·주소·통화 등은 Company Settings에서 저장하며 향후 문서/업무에 적용한다고 설명한다. 고객사 Companies 리소스와 구분한다.
- [공개 API 인증](https://docs.hellobonsai.com/api): API key/OAuth 인증 설명은 앱의 로그인·가입·비밀번호 재설정 endpoint 계약이 아니다. 해당 웹 인증 요청·응답 필드는 미확인.
- 비밀번호 최소 길이·강도 기준·재설정 토큰 만료를 확정할 공식 endpoint 문서는 이번 조회에서 확인하지 못했다. 가입 캡처의 최소10자와 이 폼의 강도 검증은 별도 근거로 취급한다.

## 7. 데이터 모델링 시사점

- 재설정 요청·일회성 토큰·검증·비밀번호 변경·세션 정책 분리 후보.
- 입력 오류와 성공 결과·사용자 안내 상태 후보.

## 8. 미확인 사항과 검토 질문

- 존재하지 않는 이메일 응답, 재발송 제한, 토큰 만료·재사용·세션 무효화 검증.
- 비밀번호 강도와 길이 규칙을 실제 검증 응답 또는 공식 정책으로 확인.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 10단계 재조회 및 원본 10개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
