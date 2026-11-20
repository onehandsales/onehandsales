# Accepting an invitation 플로우 분석

기존 검토 기록: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **13/13단계**. 계정 재현은 수행하지 않았다.

추가 검토: **R3 문서·MCP 목록 대조 완료 / FE 보완 항목 있음**. 이번 이미지 확인은 고유 이미지 기준 선택 검토이며 이 흐름에 해당하는 화면은 **0/13단계**다. 기존 R2 전수 시각 검토 이력과 구분한다. [플로우별 FE 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-08d7796f-33e4-4742-9a98-04c919916456>).

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `08d7796f-33e4-4742-9a98-04c919916456` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=08d7796f-33e4-4742-9a98-04c919916456) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 13단계 / 13단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | R2의 2026-11-20 조회 기록을 보존한다. 공통 상세 원문은 현재 체크아웃에 없으며 직접 URL은 6절에 남아 있다. [이번 재조회 범위](<../../FE_REVIEW.md#official-sources>) |
| 원본·문서 무결성 | R2의 CDN 바이트 대조는 기존 기록이다. R3에서는 MCP 순서·원본 URL, 로컬 PNG 크기·중복 SHA-256을 대조했다. CDN 바이트 재다운로드는 하지 않았다. [이번 검증](<../../FE_REVIEW.md#verification>) |

## 2. 플로우 목적과 연결

초대 접근 시 인증·가입 분기와 전용 초대 수락 화면, 수락 후 제한된 협업 화면을 살핀다. 앞뒤 이메일이 달라 하나의 연속 성공 시나리오로 단정하지 않는다.

- 1~7단계는 로그인 실패 및 일반 가입.8~9는 다른 이메일의 초대 전용 가입.
- 10단계 이후는 Projects/Tasks만 보이는 협업 계정 화면. 실제 계정 권한 재현은 하지 않았다.
- 초대 메일 본문·토큰URL·만료 화면은 수록되지 않았다.


- 폴더 위치: `bonsai_analysis/flows/Accepting an invitation`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.
- 하위 흐름: 없음.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **초대 접근 후 로그인 요구**이다. 미인증접근차단. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **협업자 프로필 메뉴**이다. 역할별메뉴차이. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Settings](<../Settings/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_56e0d2abfaec42c8b612894f5bcc192a`](https://gummble.com/screens/sc_56e0d2abfaec42c8b612894f5bcc192a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [초대 접근 후 로그인 요구](<screens/01_sc_56e0d2abfaec42c8b612894f5bcc192a.png>) | 로그인 정보 입력 — 입력만됨. |
| 02 | [`sc_57e384cf31904da7939aed3a43f24171`](https://gummble.com/screens/sc_57e384cf31904da7939aed3a43f24171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 정보 입력](<screens/02_sc_57e384cf31904da7939aed3a43f24171.png>) | 로그인 실패 — 인증오류. |
| 03 | [`sc_f0e383ef04984fa9b1005bb85bd16407`](https://gummble.com/screens/sc_f0e383ef04984fa9b1005bb85bd16407?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [로그인 실패](<screens/03_sc_f0e383ef04984fa9b1005bb85bd16407.png>) | 일반 무료 계정 가입 — 초대회사명없는일반가입. |
| 04 | [`sc_8eec8db38d2449deb4a4202aef115aff`](https://gummble.com/screens/sc_8eec8db38d2449deb4a4202aef115aff?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [일반 무료 계정 가입](<screens/04_sc_8eec8db38d2449deb4a4202aef115aff.png>) | 이메일 형식 오류 — 작성중형식오류. |
| 05 | [`sc_f9eb6c73bcca4042becaf9f5fb77483d`](https://gummble.com/screens/sc_f9eb6c73bcca4042becaf9f5fb77483d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이메일 형식 오류](<screens/05_sc_f9eb6c73bcca4042becaf9f5fb77483d.png>) | 일반 가입 입력 완료 — 입력값채움. |
| 06 | [`sc_f9f38c9c720c40f68cd780f27e65738d`](https://gummble.com/screens/sc_f9f38c9c720c40f68cd780f27e65738d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [일반 가입 입력 완료](<screens/06_sc_f9f38c9c720c40f68cd780f27e65738d.png>) | CAPTCHA 완료와 비밀번호 강도 — 제출준비상태. |
| 07 | [`sc_acf1d78ada874bba9803cc879db1fcea`](https://gummble.com/screens/sc_acf1d78ada874bba9803cc879db1fcea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [CAPTCHA 완료와 비밀번호 강도](<screens/07_sc_acf1d78ada874bba9803cc879db1fcea.png>) | 초대 전용 계정 완성 — 일반가입과다른대상메일·구성. |
| 08 | [`sc_cb73e29da15944959eed59fff7f8c9ee`](https://gummble.com/screens/sc_cb73e29da15944959eed59fff7f8c9ee?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [초대 전용 계정 완성](<screens/08_sc_cb73e29da15944959eed59fff7f8c9ee.png>) | 초대 수락 입력 — 제출준비. |
| 09 | [`sc_c32beee8ce2e4eaa9ea56bca107a57c6`](https://gummble.com/screens/sc_c32beee8ce2e4eaa9ea56bca107a57c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [초대 수락 입력](<screens/09_sc_c32beee8ce2e4eaa9ea56bca107a57c6.png>) | 협업 프로젝트 진입 성공 — 협업계정진입. |
| 10 | [`sc_5e1337bcde974a128e69d87166b0e6be`](https://gummble.com/screens/sc_5e1337bcde974a128e69d87166b0e6be?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [협업 프로젝트 진입 성공](<screens/10_sc_5e1337bcde974a128e69d87166b0e6be.png>) | 협업자 Tasks 보드 — 제한계정의작업목록. |
| 11 | [`sc_79190c957f234a9d89fd130d5e009e07`](https://gummble.com/screens/sc_79190c957f234a9d89fd130d5e009e07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [협업자 Tasks 보드](<screens/11_sc_79190c957f234a9d89fd130d5e009e07.png>) | 협업자 Projects 목록 — 접근프로젝트1개표시. |
| 12 | [`sc_b774b3dcb1294d73ac858ab9e970ebd0`](https://gummble.com/screens/sc_b774b3dcb1294d73ac858ab9e970ebd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [협업자 Projects 목록](<screens/12_sc_b774b3dcb1294d73ac858ab9e970ebd0.png>) | 협업자 프로필 메뉴 — 역할별메뉴차이. |
| 13 | [`sc_a31f80b8bb624168ba0f6252a113bbfb`](https://gummble.com/screens/sc_a31f80b8bb624168ba0f6252a113bbfb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [협업자 프로필 메뉴](<screens/13_sc_a31f80b8bb624168ba0f6252a113bbfb.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 초대 접근 후 로그인 요구

- Screen ID: `sc_56e0d2abfaec42c8b612894f5bcc192a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56e0d2abfaec42c8b612894f5bcc192a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6b7743d0-c402-43f4-89bd-1170c44f798f.png)
- 로컬 이미지: [01_sc_56e0d2abfaec42c8b612894f5bcc192a.png](<screens/01_sc_56e0d2abfaec42c8b612894f5bcc192a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 001, 고유 이미지 S003, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_57e384cf31904da7939aed3a43f24171`

#### 화면에서 직접 확인한 내용

- 레이아웃: Changelog왼쪽/로그인오른쪽2열.우하단토스트.
- 입력 항목·필수 표시·기본값: Email/Password빈값,CAPTCHA미체크.
- 버튼·메뉴·안내 문구: Google/Apple,Login,ResetPassword,ResendVerification.계속하려면로그인/가입필요안내.
- 확인된 상태: 미인증접근차단.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 초대 또는 보호 경로에 인증 게이트. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 원래초대URL·이메일미확인.

#### 모델링 영향

- 후보와 근거: 인증후복귀경로후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 원래초대URL·이메일미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 로그인 정보 입력

- Screen ID: `sc_57e384cf31904da7939aed3a43f24171`
- 원본: [화면 페이지](https://gummble.com/screens/sc_57e384cf31904da7939aed3a43f24171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screen_revisions/18/18aacd438e71fd3280ea122ce3cca44f94f0b8e40f2ae3ea9830f7994d9363d7.png)
- 로컬 이미지: [02_sc_57e384cf31904da7939aed3a43f24171.png](<screens/02_sc_57e384cf31904da7939aed3a43f24171.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 001, 고유 이미지 S004, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_56e0d2abfaec42c8b612894f5bcc192a` → 현재 → `sc_f0e383ef04984fa9b1005bb85bd16407`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일로그인폼.
- 입력 항목·필수 표시·기본값: david.bond@example.com,마스킹비밀번호,CAPTCHA미체크.
- 버튼·메뉴·안내 문구: Log in.
- 확인된 상태: 입력만됨.
- 단계 간 변화: 로그인정보 입력 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 후속단계이메일과다름. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중간재입력·시도횟수미확인.

#### 모델링 영향

- 후보와 근거: 로그인입력과초대identity분리. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 중간재입력·시도횟수미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 로그인 실패

- Screen ID: `sc_f0e383ef04984fa9b1005bb85bd16407`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f0e383ef04984fa9b1005bb85bd16407?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7db33335-ce42-45a3-948e-abcb119ff4c3.png)
- 로컬 이미지: [03_sc_f0e383ef04984fa9b1005bb85bd16407.png](<screens/03_sc_f0e383ef04984fa9b1005bb85bd16407.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 002, 고유 이미지 S005, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_57e384cf31904da7939aed3a43f24171` → 현재 → `sc_8eec8db38d2449deb4a4202aef115aff`

#### 화면에서 직접 확인한 내용

- 레이아웃: 폼하단빨간인라인알림.
- 입력 항목·필수 표시·기본값: janesmith1.mobbin@gmail.com로변경,마스킹비밀번호.
- 버튼·메뉴·안내 문구: Invalid email or password;Log in.
- 확인된 상태: 인증오류.
- 단계 간 변화: 이메일이 바뀌고 인증오류 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 서버 원인 분류 없는 일반 오류 문구. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이전 이메일 시도와의 관계 미확인.

#### 모델링 영향

- 후보와 근거: 인증실패피드백후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 이전 이메일 시도와의 관계 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 일반 무료 계정 가입

- Screen ID: `sc_8eec8db38d2449deb4a4202aef115aff`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8eec8db38d2449deb4a4202aef115aff?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7b603ff3-c085-4952-a2f0-92573bce627b.png)
- 로컬 이미지: [04_sc_8eec8db38d2449deb4a4202aef115aff.png](<screens/04_sc_8eec8db38d2449deb4a4202aef115aff.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 002, 고유 이미지 S006, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f0e383ef04984fa9b1005bb85bd16407` → 현재 → `sc_f9eb6c73bcca4042becaf9f5fb77483d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙단일카드와식물장식.
- 입력 항목·필수 표시·기본값: WorkEmail,FullName,Password빈예시.최소10자안내,CAPTCHA미체크.
- 버튼·메뉴·안내 문구: Google가입,CreateFreeAccount,비밀번호눈아이콘,약관,Login.
- 확인된 상태: 초대회사명없는일반가입.
- 단계 간 변화: 일반 가입 화면으로 전환 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 일반가입과초대가입UI가다름. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 초대맥락유지여부미확인.

#### 모델링 영향

- 후보와 근거: 가입폼·약관동의후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 초대맥락유지여부미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 이메일 형식 오류

- Screen ID: `sc_f9eb6c73bcca4042becaf9f5fb77483d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f9eb6c73bcca4042becaf9f5fb77483d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b5b46221-07c4-4289-b34e-18e42de6765d.png)
- 로컬 이미지: [05_sc_f9eb6c73bcca4042becaf9f5fb77483d.png](<screens/05_sc_f9eb6c73bcca4042becaf9f5fb77483d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 002, 고유 이미지 S007, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8eec8db38d2449deb4a4202aef115aff` → 현재 → `sc_f9f38c9c720c40f68cd780f27e65738d`

#### 화면에서 직접 확인한 내용

- 레이아웃: WorkEmail위빨간말풍선.
- 입력 항목·필수 표시·기본값: WorkEmail jon,나머지빈값.
- 버튼·메뉴·안내 문구: 유효이메일주소입력요구.
- 확인된 상태: 작성중형식오류.
- 단계 간 변화: 불완전 이메일 검증오류 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 짧은비이메일문자열검증. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검증트리거·서버여부미확인.

#### 모델링 영향

- 후보와 근거: 필드별validation상태후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 검증트리거·서버여부미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 일반 가입 입력 완료

- Screen ID: `sc_f9f38c9c720c40f68cd780f27e65738d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f9f38c9c720c40f68cd780f27e65738d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7cdbe636-6fd5-4239-bfc7-09b33841cc26.png)
- 로컬 이미지: [06_sc_f9f38c9c720c40f68cd780f27e65738d.png](<screens/06_sc_f9f38c9c720c40f68cd780f27e65738d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 002, 고유 이미지 S008, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f9eb6c73bcca4042becaf9f5fb77483d` → 현재 → `sc_acf1d78ada874bba9803cc879db1fcea`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙가입카드.
- 입력 항목·필수 표시·기본값: jonsmith.mobbin@gmail.com,JonSmith,마스킹비밀번호,CAPTCHA미체크.
- 버튼·메뉴·안내 문구: CreateFreeAccount.
- 확인된 상태: 입력값채움.
- 단계 간 변화: 유효형식 이메일·이름·비밀번호 입력 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 별도 초대 가입의 대상 메일과 불일치. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 일반 가입 실제 생성 결과 미확인.

#### 모델링 영향

- 후보와 근거: 인증입력상태. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 일반 가입 실제 생성 결과 미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — CAPTCHA 완료와 비밀번호 강도

- Screen ID: `sc_acf1d78ada874bba9803cc879db1fcea`
- 원본: [화면 페이지](https://gummble.com/screens/sc_acf1d78ada874bba9803cc879db1fcea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e39b41cf-e4c1-4a5e-a6fc-b30c754802de.png)
- 로컬 이미지: [07_sc_acf1d78ada874bba9803cc879db1fcea.png](<screens/07_sc_acf1d78ada874bba9803cc879db1fcea.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 003, 고유 이미지 S009, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f9f38c9c720c40f68cd780f27e65738d` → 현재 → `sc_cb73e29da15944959eed59fff7f8c9ee`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일가입카드.
- 입력 항목·필수 표시·기본값: 이메일/이름동일,CAPTCHA체크,Password Strong.
- 버튼·메뉴·안내 문구: CreateFreeAccount.
- 확인된 상태: 제출준비상태.
- 단계 간 변화: CAPTCHA완료·Strong표시 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 강도 표시와 최소 길이 안내는 별개. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제가입성공·서버검증미확인.

#### 모델링 영향

- 후보와 근거: 비밀번호강도UI·CAPTCHA상태. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 실제가입성공·서버검증미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 초대 전용 계정 완성

- Screen ID: `sc_cb73e29da15944959eed59fff7f8c9ee`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cb73e29da15944959eed59fff7f8c9ee?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/abc66d18-e698-4e18-b943-3a4f60d67baf.png)
- 로컬 이미지: [08_sc_cb73e29da15944959eed59fff7f8c9ee.png](<screens/08_sc_cb73e29da15944959eed59fff7f8c9ee.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 003, 고유 이미지 S010, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_acf1d78ada874bba9803cc879db1fcea` → 현재 → `sc_c32beee8ce2e4eaa9ea56bca107a57c6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙카드상단JoeStudio협업안내와JS아바타.
- 입력 항목·필수 표시·기본값: 대상 jsmith.mobbin2@gmail.com고정표시. FullName/Password빈칸.
- 버튼·메뉴·안내 문구: Accept Invitation,약관,아바타X.
- 확인된 상태: 일반가입과다른대상메일·구성.
- 단계 간 변화: 다른이메일 초대전용 화면으로 전환; 중간경로 미수록 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 초대한 회사와 받는 메일을 명시. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 대상메일변경·토큰검증·비밀번호정책미확인.

#### 모델링 영향

- 후보와 근거: 초대 컨텍스트와 계정 생성 결합 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 대상메일변경·토큰검증·비밀번호정책미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 초대 수락 입력

- Screen ID: `sc_c32beee8ce2e4eaa9ea56bca107a57c6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c32beee8ce2e4eaa9ea56bca107a57c6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7cd10b06-f719-4e4f-8dd5-c520de0a7a0d.png)
- 로컬 이미지: [09_sc_c32beee8ce2e4eaa9ea56bca107a57c6.png](<screens/09_sc_c32beee8ce2e4eaa9ea56bca107a57c6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 003, 고유 이미지 S011, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cb73e29da15944959eed59fff7f8c9ee` → 현재 → `sc_5e1337bcde974a128e69d87166b0e6be`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은초대카드.
- 입력 항목·필수 표시·기본값: FullName JonSmith,Password마스킹,대상메일유지.
- 버튼·메뉴·안내 문구: Accept Invitation.
- 확인된 상태: 제출준비.
- 단계 간 변화: 이름·비밀번호 입력 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 초대 메일은 편집 필드가 아님. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수검증·2FA단계미수록.

#### 모델링 영향

- 후보와 근거: 초대identity고정후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 필수검증·2FA단계미수록. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 협업 프로젝트 진입 성공

- Screen ID: `sc_5e1337bcde974a128e69d87166b0e6be`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5e1337bcde974a128e69d87166b0e6be?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8ff86914-0c41-4d13-b44d-6af186878854.png)
- 로컬 이미지: [10_sc_5e1337bcde974a128e69d87166b0e6be.png](<screens/10_sc_5e1337bcde974a128e69d87166b0e6be.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 003, 고유 이미지 S012, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c32beee8ce2e4eaa9ea56bca107a57c6` → 현재 → `sc_79190c957f234a9d89fd130d5e009e07`

#### 화면에서 직접 확인한 내용

- 레이아웃: 사이드바Projects/Tasks만.프로젝트Overview,Tasks/TimeTracking/Team탭.
- 입력 항목·필수 표시·기본값: DesignProjectwithDoeStudio,DoeCompany.완료작업1,unbilled00:01:16,billed01:00:07.
- 버튼·메뉴·안내 문구: 비밀번호설정성공·현재로그인됨토스트,TrackTime,추가+.
- 확인된 상태: 협업계정진입.
- 단계 간 변화: 프로젝트 화면·로그인성공 토스트 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 시간수치는보이지만금액·문서탭은없음. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 로그인사용자역할정확값·API권한미확인.

#### 모델링 영향

- 후보와 근거: 역할별탐색·프로젝트접근범위후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 로그인사용자역할정확값·API권한미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 협업자 Tasks 보드

- Screen ID: `sc_79190c957f234a9d89fd130d5e009e07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_79190c957f234a9d89fd130d5e009e07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/280b78f7-6b88-4bf4-b106-6db705e10763.png)
- 로컬 이미지: [11_sc_79190c957f234a9d89fd130d5e009e07.png](<screens/11_sc_79190c957f234a9d89fd130d5e009e07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 004, 고유 이미지 S013, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5e1337bcde974a128e69d87166b0e6be` → 현재 → `sc_b774b3dcb1294d73ac858ab9e970ebd0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열ToDo/InProgress/Done,왼쪽Projects/Tasks.
- 입력 항목·필수 표시·기본값: Done에InitialChat1개,프로젝트명,Feb06,JD.
- 버튼·메뉴·안내 문구: Findtask,Filters,Board,NewTask,열별NewTask.
- 확인된 상태: 제한계정의작업목록.
- 단계 간 변화: Tasks보드 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 다른 담당자의 완료 작업도 표시됨. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 개인 배정 기준인지 프로젝트 범위인지 추가 확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 단위 작업 가시성 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 개인 배정 기준인지 프로젝트 범위인지 추가 확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 12 — 협업자 Projects 목록

- Screen ID: `sc_b774b3dcb1294d73ac858ab9e970ebd0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b774b3dcb1294d73ac858ab9e970ebd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/18b892f7-596d-4151-9da4-5dc89c6f3be2.png)
- 로컬 이미지: [12_sc_b774b3dcb1294d73ac858ab9e970ebd0.png](<screens/12_sc_b774b3dcb1294d73ac858ab9e970ebd0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 004, 고유 이미지 S014, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_79190c957f234a9d89fd130d5e009e07` → 현재 → `sc_a31f80b8bb624168ba0f6252a113bbfb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 검색/Filters와표1행.
- 입력 항목·필수 표시·기본값: DesignProjectwithDoeStudio,DoeCompany,시작Feb6 2024,Tags빈값.
- 버튼·메뉴·안내 문구: 행메뉴,검색,필터.생성버튼없음.
- 확인된 상태: 접근프로젝트1개표시.
- 단계 간 변화: Projects목록 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 전체 조직 프로젝트보다 제한된 목록으로 보임. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른프로젝트존재·접근차단미확인.

#### 모델링 영향

- 후보와 근거: 프로젝트 멤버 접근 스코프 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 다른프로젝트존재·접근차단미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 13 — 협업자 프로필 메뉴

- Screen ID: `sc_a31f80b8bb624168ba0f6252a113bbfb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a31f80b8bb624168ba0f6252a113bbfb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a1df1df8-d393-4787-b642-80222b2cbfc8.png)
- 로컬 이미지: [13_sc_a31f80b8bb624168ba0f6252a113bbfb.png](<screens/13_sc_a31f80b8bb624168ba0f6252a113bbfb.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 004, 고유 이미지 S015, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b774b3dcb1294d73ac858ab9e970ebd0` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우상단 아바타 아래 드롭다운.
- 입력 항목·필수 표시·기본값: JoeStudio표시.
- 버튼·메뉴·안내 문구: HelpCenter,Settings,Logout만.소유자화면의Team/Subscription/Perks없음.
- 확인된 상태: 역할별메뉴차이.
- 단계 간 변화: 프로필메뉴 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: UI에서관리메뉴가줄어듦. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 직접URL접근·Settings범위미확인.

#### 모델링 영향

- 후보와 근거: 네비게이션 권한과 서버 권한 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 직접URL접근·Settings범위미확인. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 미인증접근차단. — Email/Password빈값,CAPTCHA미체크. | 원래초대URL·이메일미확인. |
| 02 | 입력만됨. — david.bond@example.com,마스킹비밀번호,CAPTCHA미체크. | 중간재입력·시도횟수미확인. |
| 03 | 인증오류. — janesmith1.mobbin@gmail.com로변경,마스킹비밀번호. | 이전 이메일 시도와의 관계 미확인. |
| 04 | 초대회사명없는일반가입. — WorkEmail,FullName,Password빈예시.최소10자안내,CAPTCHA미체크. | 초대맥락유지여부미확인. |
| 05 | 작성중형식오류. — WorkEmail jon,나머지빈값. | 검증트리거·서버여부미확인. |
| 06 | 입력값채움. — jonsmith.mobbin@gmail.com,JonSmith,마스킹비밀번호,CAPTCHA미체크. | 일반 가입 실제 생성 결과 미확인. |
| 07 | 제출준비상태. — 이메일/이름동일,CAPTCHA체크,Password Strong. | 실제가입성공·서버검증미확인. |
| 08 | 일반가입과다른대상메일·구성. — 대상 jsmith.mobbin2@gmail.com고정표시. FullName/Password빈칸. | 대상메일변경·토큰검증·비밀번호정책미확인. |
| 09 | 제출준비. — FullName JonSmith,Password마스킹,대상메일유지. | 필수검증·2FA단계미수록. |
| 10 | 협업계정진입. — DesignProjectwithDoeStudio,DoeCompany.완료작업1,unbilled00:01:16,billed01:00:07. | 로그인사용자역할정확값·API권한미확인. |
| 11 | 제한계정의작업목록. — Done에InitialChat1개,프로젝트명,Feb06,JD. | 개인 배정 기준인지 프로젝트 범위인지 추가 확인. |
| 12 | 접근프로젝트1개표시. — DesignProjectwithDoeStudio,DoeCompany,시작Feb6 2024,Tags빈값. | 다른프로젝트존재·접근차단미확인. |
| 13 | 역할별메뉴차이. — JoeStudio표시. | 직접URL접근·Settings범위미확인. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

로그인 오류·일반 가입·초대 전용 가입은 서로 다른 화면이며 이메일도 달라진다. 10단계의 비밀번호 설정 성공 토스트와 Projects/Tasks 진입은 확인되지만 앞선 모든 계정 입력이 하나의 연속 성공 경로였다고 볼 수 없다. 제한된 메뉴 노출은 직접 URL 접근 권한 검증을 대신하지 않는다.

### 업무 규칙과 연결 시 주의점

- 초기 로그인은 계속하려면 인증 필요 토스트와Invalidemailorpassword오류를 보인다.
- 일반가입최소10자안내·CAPTCHA와 초대가입폼은 구성이다르다.
- 마지막 협업 화면에는 청구서·계약·매출 메뉴가 없고 시간 금액도 없다. 메뉴부재만으로API접근 차단을 증명하지 않는다.
- 동일 프로젝트의 과거 작업이 보여 새 프로젝트 생성 흐름이 아니다.

## 6. 공식 도움말과 API 대조

아래 URL과 5절의 문서 규칙은 **R2의 2026-11-20 대조 기록**이다. 공통 상세 대조 문서는 현재 체크아웃에 없다. R3에서 모든 URL을 다시 읽은 것은 아니며, 새로 확인한 자료와 적용 범위는 [이번 공식 자료 검토](<../../FE_REVIEW.md#official-sources>)에 구분했다. 과거 캡처에 현재 규칙을 소급 적용하지 않는다. 실제 계정이나 내부 API는 실행하지 않았다.

- [공개 API](https://docs.hellobonsai.com/api): R2 본문 대조 기록(S003). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [사용자 권한](https://help.hellobonsai.com/en/articles/1894805-all-about-user-permissions-in-bonsai): R2 본문 대조 기록(S004). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.
- [2FA 관리](https://help.hellobonsai.com/en/articles/7935122-managing-two-factor-authentication-2fa-on-your-account): R2 본문 대조 기록(S005). 공통 상세 원문은 현재 없으며, 이 문서에 남은 규칙·한계는 5·8절에서 확인한다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../FE_REVIEW.md#api-boundary>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 초대토큰·대상메일·가입/기존로그인·수락된멤버십상태분리.
- UI메뉴 가시성과 서버 객체 권한을 각각 검증할 후보.
- 가입identity가 바뀐 캡처 구간을 모델 규칙 근거로 연결하지 않음.

### 단계별 모델링 근거

- 단계 01: 인증후복귀경로후보.
- 단계 02: 로그인입력과초대identity분리.
- 단계 03: 인증실패피드백후보.
- 단계 04: 가입폼·약관동의후보.
- 단계 05: 필드별validation상태후보.
- 단계 06: 인증입력상태.
- 단계 07: 비밀번호강도UI·CAPTCHA상태.
- 단계 08: 초대 컨텍스트와 계정 생성 결합 후보.
- 단계 09: 초대identity고정후보.
- 단계 10: 역할별탐색·프로젝트접근범위후보.
- 단계 11: 프로젝트 단위 작업 가시성 후보.
- 단계 12: 프로젝트 멤버 접근 스코프 후보.
- 단계 13: 네비게이션 권한과 서버 권한 분리 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 기존계정으로초대수락,다른메일로그인,만료/재사용/취소토큰분기확인. 협업자가프로젝트·작업·타임 엔트리에서 볼 수 있는 범위와 금액 비노출 정책 검증.

- 기존계정으로초대수락,다른메일로그인,만료/재사용/취소토큰분기확인.
- 협업자가프로젝트·작업·타임 엔트리에서 볼 수 있는 범위와 금액 비노출 정책 검증.
- 일반 가입에서 초대 수락으로 이어지는 중간 동작과 이메일 변경 원인 추가 확인.

### 단계별 미확인 사항

- 단계 01: 원래초대URL·이메일미확인.
- 단계 02: 중간재입력·시도횟수미확인.
- 단계 03: 이전 이메일 시도와의 관계 미확인.
- 단계 04: 초대맥락유지여부미확인.
- 단계 05: 검증트리거·서버여부미확인.
- 단계 06: 일반 가입 실제 생성 결과 미확인.
- 단계 07: 실제가입성공·서버검증미확인.
- 단계 08: 대상메일변경·토큰검증·비밀번호정책미확인.
- 단계 09: 필수검증·2FA단계미수록.
- 단계 10: 로그인사용자역할정확값·API권한미확인.
- 단계 11: 개인 배정 기준인지 프로젝트 범위인지 추가 확인.
- 단계 12: 다른프로젝트존재·접근차단미확인.
- 단계 13: 직접URL접근·Settings범위미확인.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

### FE 구현 전 보완 (R3)

- 캡처 범위 분류: **부분**. 업무 전체의 완료 판정이 아니다.
- 목 구현·수용 기준 후보: 일반 가입과 초대 전용 가입을 분리한다. 초대 이메일 일치·불일치·만료·재사용과 협업자 제한 화면을 별도 seed로 검증한다.
- [이 흐름의 보완표](<../../FLOW_REVIEW_MATRIX.md#flow-08d7796f-33e4-4742-9a98-04c919916456>)와 [공통 웹 상태·연결 기준](<../../FE_REVIEW.md#fe-acceptance>)을 함께 적용한다. 캡처에 없는 동작은 Bonsai 관찰 사실로 쓰지 않고 목 가정 또는 추가 조사로 표시한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 13개와 실제 이미지 13개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 13단계 재조회 및 원본 13개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 13단계 ID·순서·원본 URL 재조회 및 이미지 13/13단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. R2 공통 검토 기록(현재 파일 없음; 기존 수행 이력으로만 보존) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
| R3 FE 준비도 재검토 | 2026-11-20 KST | MCP 13단계 ID·순서·원본 URL, 문서 내용·링크 및 로컬 파일 대조. 선택 이미지 0/13단계 해당; 공통 이미지는 같은 확인을 재사용. 8절에 FE 보완 기준 추가. [검증 범위](<../../FE_REVIEW.md#verification>) | 미수록 동작·목 정책 결정·실제 계정·FE 실행 검증 |
