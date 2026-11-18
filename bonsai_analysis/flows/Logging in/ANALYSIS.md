# Logging in 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a02409b3-6eb0-4bc0-b702-22a42e0990c8` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a02409b3-6eb0-4bc0-b702-22a42e0990c8) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

공개 랜딩에서 로그인 폼으로 들어가 이메일·비밀번호·CAPTCHA를 거쳐 대시보드로 이동한다.

- 로그인 성공 경로5단계. 실패는 초대 플로우, 복구는 하위 Resetting password 참고.
- 2FA 화면은 이 흐름에 없다. 2FA가 없다는 정책으로 해석하지 않는다.

- 하위 플로우: [Resetting password](Resetting%20password/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Logging in`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_07904520440b4dc7ad7d6d31bf3a03e9`](https://gummble.com/screens/sc_07904520440b4dc7ad7d6d31bf3a03e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [공개 랜딩 히어로](<screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>) | Log in으로 인증 페이지 |
| 02 | [`sc_9d353458318e43e7b25ebbf88fefeaa9`](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 — 빈 인증 폼](<screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | 이메일·비밀번호 입력 |
| 03 | [`sc_5c0fde91fbb34480b756c6eb10e63816`](https://gummble.com/screens/sc_5c0fde91fbb34480b756c6eb10e63816?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 자격정보 입력](<screens/03_sc_5c0fde91fbb34480b756c6eb10e63816.png>) | CAPTCHA 완료 |
| 04 | [`sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9`](https://gummble.com/screens/sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 CAPTCHA 완료](<screens/04_sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9.png>) | 대시보드 진입 |
| 05 | [`sc_3982bd8e06b44860bdb8c4bac2592599`](https://gummble.com/screens/sc_3982bd8e06b44860bdb8c4bac2592599?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 후 대시보드](<screens/05_sc_3982bd8e06b44860bdb8c4bac2592599.png>) | 로그인 후 화면에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 공개 랜딩 히어로

- Screen ID: `sc_07904520440b4dc7ad7d6d31bf3a03e9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_07904520440b4dc7ad7d6d31bf3a03e9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d329f184-0b0c-43f3-b3d4-2cf6c78242f1.png)
- 로컬 이미지: [01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png](<screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_9d353458318e43e7b25ebbf88fefeaa9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 로고/주메뉴, 보조 고객군 링크. 좌측 대형 제목·이메일 CTA, 우측 인물과 식물·알림 그래픽.
- 입력 항목·필수 표시·기본값: Enter your email 빈 입력.
- 버튼·메뉴·안내 문구: Log in, Start free, Product/Industries/Templates/Pricing/Resources/Reviews.
- 확인된 상태: 미인증 마케팅 페이지. 그래픽의 인보이스·비용은 실제 계정 데이터가 아님.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 가입과 로그인 진입점 분리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이메일 전달 방식·쿠키·반응형 미확인.

#### 모델링 영향

- 후보와 근거: 공개 콘텐츠와 가입 진입 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 로그인 — 빈 인증 폼

- Screen ID: `sc_9d353458318e43e7b25ebbf88fefeaa9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9d353458318e43e7b25ebbf88fefeaa9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b509948c-e5f3-488b-aa87-4b9c6560fb90.png)
- 로컬 이미지: [02_sc_9d353458318e43e7b25ebbf88fefeaa9.png](<screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_07904520440b4dc7ad7d6d31bf3a03e9` → 현재 → `sc_5c0fde91fbb34480b756c6eb10e63816`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 왼쪽 로고와 오른쪽 Log In·Sign Up. 본문 왼쪽은 스크롤 가능한 The Changelog 카드, 오른쪽은 세로 로그인 카드다.
- 입력 항목·필수 표시·기본값: Email·Password는 비어 있고 reCAPTCHA 체크박스는 선택되지 않았다. 이 캡처에서 입력 필수 별표나 오류 문구는 보이지 않는다.
- 버튼·메뉴·안내 문구: Sign in with Google·Sign in with Apple, 초록색 Log in, Reset Password·Resend Verification Email. Changelog에는 여러 New 표시와 Bonsai updates 링크가 있다.
- 확인된 상태: 로그인 입력 전 화면이다. 계정 삭제 완료나 비밀번호 재설정 완료 안내는 없다.
- 단계 간 변화: Log in으로 인증 페이지

#### 동작과 데이터

- 화면 관찰: 인증 방식 선택과 이메일·비밀번호 입력 진입점을 확인한다. 로그인·비밀번호 재설정·계정 삭제 플로우가 같은 이미지를 다른 맥락에서 사용한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 화면으로 이동하기 전의 서버 처리, 인증 세션 종료 사유, 계정 존재·삭제 상태는 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 인증 제공자, 자격 증명 입력과 검증 오류, 비밀번호 재설정·메일 확인 경로 후보. 화면 이동과 계정의 삭제 상태는 별도로 판단한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 로그인 자격정보 입력

- Screen ID: `sc_5c0fde91fbb34480b756c6eb10e63816`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5c0fde91fbb34480b756c6eb10e63816?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/15507955-a5a9-4a1c-b60a-b2aecb05d187.png)
- 로컬 이미지: [03_sc_5c0fde91fbb34480b756c6eb10e63816.png](<screens/03_sc_5c0fde91fbb34480b756c6eb10e63816.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9d353458318e43e7b25ebbf88fefeaa9` → 현재 → `sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 로그인 카드, 왼쪽 Changelog.
- 입력 항목·필수 표시·기본값: jdoe.mobbin@gmail.com, 마스킹 비밀번호, CAPTCHA 미체크.
- 버튼·메뉴·안내 문구: Log in, Google/Apple, 복구 링크.
- 확인된 상태: 입력 상태, 오류 없음.
- 단계 간 변화: 이메일·비밀번호 입력

#### 동작과 데이터

- 화면 관찰: 이메일 로그인 입력이 채워짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 검증·요청 시점 미확인.

#### 모델링 영향

- 후보와 근거: 로그인 폼 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 로그인 CAPTCHA 완료

- Screen ID: `sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9ccccae0-661c-483f-82af-e6a8e483918d.png)
- 로컬 이미지: [04_sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9.png](<screens/04_sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5c0fde91fbb34480b756c6eb10e63816` → 현재 → `sc_3982bd8e06b44860bdb8c4bac2592599`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 폼.
- 입력 항목·필수 표시·기본값: 같은 이메일/마스킹 비밀번호, CAPTCHA 녹색 체크.
- 버튼·메뉴·안내 문구: Log in.
- 확인된 상태: CAPTCHA 통과 표시.
- 단계 간 변화: CAPTCHA 완료

#### 동작과 데이터

- 화면 관찰: 로그인 요청 전 확인 요소.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: CAPTCHA 만료·실패 미확인.

#### 모델링 영향

- 후보와 근거: CAPTCHA 검증 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 로그인 후 대시보드

- Screen ID: `sc_3982bd8e06b44860bdb8c4bac2592599`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3982bd8e06b44860bdb8c4bac2592599?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9e336661-7782-44d4-babc-0ae6b20489f8.png)
- 로컬 이미지: [05_sc_3982bd8e06b44860bdb8c4bac2592599.png](<screens/05_sc_3982bd8e06b44860bdb8c4bac2592599.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 전체 앱 메뉴, 프로젝트 타임라인, 손익 그래프·문서 생성 카드.
- 입력 항목·필수 표시·기본값: Good evening Joe, Feb14 표시.
- 버튼·메뉴·안내 문구: Search, Track Time, New, 아바타.
- 확인된 상태: 인증 후 조직 데이터 화면.
- 단계 간 변화: 대시보드 진입

#### 동작과 데이터

- 화면 관찰: 로그인 후 기본 목적지가 대시보드로 보임.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할별 기본 경로·2FA 누락 이유 미확인.

#### 모델링 영향

- 후보와 근거: 인증 후 워크스페이스 라우팅 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 이메일/비밀번호와 Google/Apple 로그인 대안 제공.
- CAPTCHA 이전에도 버튼은 녹색이므로 검증 완료 여부를 버튼 색만으로 판단하지 않는다.
- 성공 화면에 개인 인사와 조직 데이터가 표시된다.

## 6. 공식 도움말과 API 대조

- [2FA 관리](https://help.hellobonsai.com/en/articles/7935122-managing-two-factor-authentication-2fa-on-your-account): 현재 도움말은 2FA 필수·해제 불가를 명시한다. 캡처의 Enabled/Disabled 모양만으로 해제가 가능하다고 해석하지 않는다.
- [공개 API 인증](https://docs.hellobonsai.com/api): API key/OAuth 인증 설명은 앱의 로그인·가입·비밀번호 재설정 endpoint 계약이 아니다. 해당 웹 인증 요청·응답 필드는 미확인.

## 7. 데이터 모델링 시사점

- 인증 방식·CAPTCHA·2FA·로그인 세션 단계를 분리하는 후보.

## 8. 미확인 사항과 검토 질문

- 장치 기억 상태·2FA 생략 원인과 만료·오류 경로를 확인.
- Google/Apple 신규 사용자와 기존 계정 연결 동작 미수록.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
