# G10 회원가입 실행 결과

> 현재 G10 — 2026-11-24 KST: **부분 완료**. 가입 동작/표시 보완·단위/DOM197/197·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크·원본 미수록 대기. [현재 범위·체크·잔여](#g10-r4-recheck).


> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 가입 목 구현·1차 검토·수정·2차 재검토를 수행했다. 현재 가능한 검증과 결과 기록을 마쳤다. G13 사업 설정 전체와 G14 공개 인증 왕복 연결은 순서상 대기다. 실제 계정·인증·메일·CAPTCHA·구독·문서는 생성하지 않는다.

## 근거·화면 범위

[R02 결과](R02_RESULT.md)의 신규 MCP5흐름43단계 중 Onboarding `f714101f-db6b-4bfe-9ed1-74d6b0d6243c` 01~10을 소비했다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. 카탈로그 Latest/2146은 이번 연속 작업 G05 조회를 재사용한다. 촬영일·서비스 빌드는 미확인이다. [MCP Screen ID/순서](evidence/r02/mcp-sources.json), [직접 본 PNG/해시](evidence/r02/source-manifest.json), [로컬 추출 자산](../../../FE/user-web/public/bonsai-auth/sources.json)을 연결한다.

ANALYSIS·PNG를 직접 확인했다. 01~02는 기존 랜딩 이메일 인계, 03~09는 가입 카드·이름/비밀번호·최소10자·강도·CAPTCHA·처리 표시, 10은 후속 사업 설정 시안이다. 가입 HTML 보관본은403이어서 확보한 것으로 쓰지 않는다. 소셜·메일 확인의 과거 UI/실계정은 미수록이다. 원본 폼을 이미지로 대체하지 않고 로고·Google 아이콘·장식 잎·식물 그림만 제공 PNG에서 추출했다. 식물은 배경 폼 글자가 포함되지 않도록 녹색 획을 분리했다.

`/signup`은 별도 AuthLayout을 사용한다. 공개 mega menu·footer를 인증 화면에 유지하지 않는다. 가입 초안/검증 hook, 메모리 계정 저장소, PasswordField/LocalCaptcha/진행 표시/선택 인계 요약, 페이지를 분리했다. `/verify-email`은 미수록 이메일 확인의 명시적 목 분기다. `/onboarding`은 현재 G13 연결 경계이며 온보딩 전체 구현 완료가 아니다.

## 관찰·목 가정과 상태 수명

- 관찰: Full Name 한 칸, 비밀번호 최소10자·Too Weak/Strong, 생성 버튼 주변 약관 문구, CAPTCHA 체크, 처리 오버레이. 필수 동의 체크박스를 추가하지 않는다. 약관 링크는 G09의 과거 참고 발췌이며 실제 법적 동의를 저장하지 않는다.
- 목 가정: 비밀번호 최대128자, 대/소문자·숫자·기타 중3분류와10자 이상을 Strong으로 계산한다. 원본 강도 알고리즘으로 확정하지 않는다. 최소 길이 tooltip의 blur/submit 트리거, 모바일 배치·비동기350ms/slow1500ms, fail-once, Google 샘플, 메일 확인/만료는 가정이다.
- 샘플 계정은 `preview-user-N`, 자기 `studio-user-N`, owner로 생성한다. Alex/Blair seed ID와 합치지 않는다. 같은 이메일은 commit 직전에 재검사하며 동시 제출은 한 번만 저장한다. 소셜은 `google-preview@example.test` 샘플이며 Google 연결/기존 계정 병합이 아니다.
- 비밀번호 원문은 폼에만 두고 취소·이탈·세션 차수 변경·성공에서 폐기한다. 로컬 비교용 SHA-256 digest만 메모리에 저장한다. 실제 보안/인증 설계가 아니다. URL·로그·localStorage/sessionStorage에 비밀번호·계정 정보를 저장하지 않는다.
- 같은 탭의 완료 계정은 로그아웃 뒤 유지, Reset/새로고침/새 탭은 seed로 초기화한다. PreviewState의 resetGeneration으로 Reset과 일반 revision 변경을 구별했다. 진행 중 입력/인계/도전은 actor/workspace/revision·시나리오 변경으로 무효화한다.
- 공개 pathname별 이메일과 이력별 intent는 기존 정책을 유지한다. 가입 시작 때 선택한 intent만 깊은 복사하고, 성공 시 새 actor/workspace/revision에 귀속한다. 일반 공개 초안 초기화를 해제하지 않는다. 다른 이력/사용자의 플랜·템플릿·인보이스를 가져오지 않는다.
- 가입 전 일반 뒤로/앞으로는 원래 공개 이메일·선택을 유지하고 비밀번호/이름/CAPTCHA는 재진입 시 초기화한다. 명시적 Cancel은 해당 출발 초안 정책을 적용한다. 인보이스 Back은 생성기 초안을 유지한다. 메일 확인에서 만료/취소는 미활성 계정을 제거하고, 돌아온 가입 폼에 기존 intent ID를 전달한다.
- 현재 G04 플랜→가입→새 세션까지 선택 인계를 검증한다. G06 template/format과 G07 draft를 최종 목적지로 복원하는 것은 G13/G14에서 수행한다. 임시 인계 도착을 PDF·복제·구독 성공으로 쓰지 않는다.

## 검토·결함·수정

1차: 저장소의 scope/취소·동시 중복·실패 원자성·비밀 저장을 검토했다. 시나리오 변경 때 진행 요청을 무효화하는 generation을 추가하고, 세션 변경 때 미활성 메일 계정을 정리했다. React StrictMode의 효과 재연결이 메일 도전을 취소하던 문제는 공통 경로 관찰자가 실제 이탈 때만 폐기하도록 수정했다.

최초 가입 E2E2/5에서 성공 저장 후 `/signup`에 남는 실제 결함3건을 재현했다. 가입 commit의 revision 변경을 hook이 외부 취소로 오인해 성공 navigation까지 버렸다. 저장 결과의 committedRevision·actor를 현재 실행 문맥과 비교해 자기 commit의 완료 이동만 허용했다. 이후 가입5/5 통과를 별도 보존했다.

2차: 원본 비교에서 잘못된 글꼴 family로 Arial이 적용된 것, 로고 크롭의 과도한 빈 공간, 입력 높이/간격을 수정했다. Gellix는 기존 공개 자산의 근사이며 인증 원본 폰트 동일성 확인은 아니다. 원본 최소 길이 tooltip·키보드 오류 초점·비밀번호 보기·메일 취소 인계 수명을 보완했다. 오류를 고치는 매 입력마다 초점이 다음 필드로 튀지 않도록 제출 횟수에만 오류 초점 이동을 연결했다. 타입·unit·브라우저에서 보존/경합/비밀과 실제 navigation을 검증한다.

전체 첫 회귀53/56의 실패도 보존한다. 가격 테스트2건은 인증 전용 레이아웃 전환에 맞춘 테스트 수정 위치가 잘못된 것이어서 실제 Back to landing→공개 메뉴를 거치도록 수정했다. 검증 항목/과거 이력 격리 조건을 제거하지 않았다. 블로그 테스트1건은 카드만 나타난 후 문서를 교체해 로컬 이미지3개가 `ERR_ABORTED`가 된 것으로, 이미지 준비와 networkidle을 확인한 뒤 이동하게 보강했다. API 호출은 아니지만 실패 요청3건을0건으로 감추지 않았다. 캡처 스크립트의 모달 뒤 제목 클릭 timeout은 초점 해제 방식으로 수정했다.

## 실행·시각 비교

FE/user-web, Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 실행했다.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`:24/24, `corepack pnpm build` 통과. 초기 PublicIntent export 누락 typecheck 실패는 수정했다. 최종 JS756.79kB/gzip207.72kB, chunk500kB·Browserslist 오래된 데이터 경고는 남는다.
- `corepack pnpm exec playwright test --workers=2 --reporter=line,json`와 `-c playwright.preview.config.ts`: 전체 개발56/56·빌드56/56 통과, 마지막 tooltip 위치 보정 뒤 가입 대상 개발5/5·빌드5/5 추가 통과. 최초 대상/재확인/전체 실패와 최종 결과를 [g10 evidence](evidence/g10/)에 분리한다.
- `node scripts/capture-signup.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-signup.py`:03~09 원본7상태, 소셜 모달1, 폭320/390/768 세 상태, 총11캡처. [조건/네트워크](evidence/g10/browser-captures.json), [원본·측정](evidence/g10/visual-metrics.json), [pair/diff](evidence/g10/comparisons/). 원본2880×1800을1440×900으로 정규화, 실제 Chromium148/DPR1. 원본 CSS viewport/DPR은 확정하지 않는다.
- 정규화 기준의 추정·보정값: 카드 x470/y42/폭500px, 내부 폭378px, 입력40px, 버튼46px, 제목20px/행간28px, 본문16px, label12px. 배경#fbfcfb/테두리#cbd1ce/텍스트#091613은 비교용 근사이고 원본 CSS 추출값이 아니다. 버튼#168b00·오류#be4646은 원본보다 진하게 적용했다.
- 원본 입력은 개인정보 재사용 대신 `jdoe@example.test` 등 샘플을 사용했고 비밀번호 원문은 복원하지 않았다. 따라서 동일한 입력 상태 종류를 맞추되 텍스트/마스킹 길이는 다르다. 원본 캡처07의 강도 표시 시점은 미확인이다.
- 직접 진입/새 탭/새로고침·back/forward·명시 취소·입력 오류 수정·단일 제출·실패 재시도·지연 취소/이탈·소셜 Dialog Escape/포커스·메일 만료·320px긴 한국어/CSS글자확대·합성 composition을 검사한다. OS IME/VoiceOver 검증은 아니다.

## 남은 차이·후속 연결·확인 순서

정확한 인증 원본 폰트·focus 색/eye 아이콘·CAPTCHA 크기/배지/체크·강도 판정/표시 시점·처리 애니메이션·일부 수px 위치가 다르다. CAPTCHA는 실제 서비스 대신 명시적 로컬 체크, 버튼/오류색은 대비를 위해 더 진하게 적용했다. 원본 없는 목 안내·취소·실패·소셜·메일 UI를 별도로 추가했다. 원본 모바일·실제 OS IME/보조기기·WebKit/Firefox/실기기 검증은 대기다. 일치율100%나 전체 원본 재현 완료가 아니다.

G13: 가입 계정/회사 ID·선택 intent로 실제 사업 설정 단계 연결. G14: G02~G09→가입/로그인→온보딩→선택 목적지 복원과 로그아웃 왕복 종합 검증. G15: 같은 workspace 회사 저장. 서버 후속: 강도/중복 이메일/소셜 병합·메일 만료·CAPTCHA·약관 버전/동의·세션 영속/토큰 정책. 지금은 API/DB 계약을 만들지 않았다.

미리보기 `http://127.0.0.1:5173/`: Pricing→Monthly→Business Start for free→샘플 이메일/이름/비밀번호10자 이상과3종류→로컬 체크→Create Free Account→선택 정보가 있는 사업 설정 경계. 가입 하단 Local authentication scenarios에서 fail-once/slow/verify-email을 선택해 재시도·취소·가상 링크 만료를 확인하고 Normal로 복원한다. 실제 비밀번호/계정 정보를 사용하지 않는다.

## 최종 재확인

모든7개 원본 비교 pair와 폭320/390/768 캡처를 직접 확인했다. 최소 길이 tooltip이 Password label을 덮는 마지막 시각 결함을12px 위로 이동해 수정하고, 실제 bounding box가 겹치지 않는 검증을 기존 가입 테스트에 추가했다. 캡처11개/정적요청1717건/API·외부·실패·console오류0건.

- development-final: 56개 통과, 요청241071건, API/외부 위반0, 실패0, console오류0.
- production-final: 56개 통과, 요청4400건, API/외부 위반0, 실패0, console오류0.
- development-target-final: 5개 통과, 요청8630건, API/외부 위반0, 실패0, console오류0.
- production-target-final: 5개 통과, 요청148건, API/외부 위반0, 실패0, console오류0.

차단/가짜 navigation 없이 실제 브라우저 요청을 관찰했다. 마지막 typecheck/lint/build도 통과했고 기능 변경이 없는 tooltip CSS 이후 unit을 불필요하게 다시 세지 않았다. 정상 시나리오 기본값을 복원했다. 기존5173 FE(PID59363)를 보존했으며 Backend/커밋/push/배포는 하지 않았다. 승인된 연속 순서에 따라 G11로 이어간다.

### G11 공통 회귀 (2026-11-21)

인증 전용 로그인/실제 계정 검증/보호 returnTo 변경 뒤 관련 dev·build26씩 통과. 기존 공개 이력·메뉴·Reset·G01 same-ID/격리·G10 가입을 재검사했다. 이전 원본/시각/환경 대기를 올리지 않는다. [G11](G11_RESULT.md).

### G12 연결 회귀 (2026-11-21)

가격 선택→가입→로그인→재설정→빈 로그인에도 선택 요약 유지와 같은 계정 로그인을 검증했다. 관련 dev·build23씩 통과. G14 최종 목적지/왕복과 기존 원본·환경 대기는 유지한다. [G12](G12_RESULT.md).

### G13 연결 회귀 (2026-11-21)

가입→사업 설정→동일 회사 저장에 가격 선택/공개 인계를 유지하고 로그아웃→같은 계정 재로그인 시 회사 정보 유지/이전 인계 폐기를 검증했다. 관련 dev·build26씩+최종 온보딩3씩. G14 최종 목적지/왕복과 기존 미수록·환경 대기는 유지한다. [G13](G13_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

가상 가입→G13 연결 완료와 원본 소셜/메일 정책 미확인을 분리했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

### G02 연결 확인 — 2026-11-23 KST

[이번 G02 재검토](G02_RECHECK_RESULT.md#g02-r4-recheck)의 공통 소비·공개 입력/인증 인계 DOM 검증을 참조한다. G10의 코드/전체 기능은 재작업하지 않았고 과거 회귀와 시각/원본/환경 대기는 유지한다. 이번 실제 브라우저 상세/네트워크 검증은 미실행이다.

## G03 연결 범위 회귀 — 2026-11-23~24 KST

[이번 결과](G03_RESULT.md#g03-r4-recheck). CRM/Consulting 이메일·G06 template 선택의 가입 인계, 이전 intent 취소 시 해당 출발 초안 정리/다른 초안 보존을 DOM 검증했다. 인증 저장소 기존 단위 회귀 포함, 신규 가입 전 과정 브라우저 검증은 아니다. 전체121개는 이번 실행 수치이며 과거 수치와 합산하지 않는다. 이 Goal 전체 재검토/완료를 뜻하지 않는다.

## G04 소비 연결 확인 — 2026-11-24 KST

[G04 현재 결과](G04_RESULT.md#g04-r4-recheck). G04 플랜/주기/금액 의미·후기 가입의 선택 인계와 취소 query/hash 복귀를 DOM·Chrome에서 확인했다. 신규 계정/온보딩 전 과정을 다시 검증한 것은 아니다. 기존 결과·체크와 이 Goal 전체의 잔여는 보존한다.

## G05 소비·재검토 기록 — 2026-11-24 KST

- [x] 기사 배너/이메일→가입, 중복 제출·이전 인계·Cancel의 returnTo/returnOrigin 복원. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)에 근거를 기록했다. 전체 단위/DOM143개는 이번 실행 수치이고 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/네트워크·원본/시각 대기와 이 Goal 전체 상태는 유지한다. 이 기록은 G05의 공통 소비 영향 확인이며 이 Goal 전체의 R4 재검토/신규 착수가 아니다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] G06 가입 선택 snapshot·로그인 이동·취소/뒤로·가상 로그인 후 같은 URL 복귀. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 청구 인계의 Work Email 문구·빈 이메일·목 가입/취소·현재 초안/선택 snapshot 구분. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 회사 전체 URL·외부 안내의 출발 정보를 가입 취소에 인계하고 Terms 링크/뒤로/취소 연결을 DOM 검증했다. 가입 입력/생성 전체와 약관 적용 버전 확정은 아니다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.


<a id="g10-r4-recheck"></a>
## G10 기존 구현 재검토 — 2026-11-24 KST

**부분 완료: 주요 원본 대조·가입 동작 보완·현재 단위/DOM 검증 수행. 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본 정책은 대기.** 과거 체크와 수치는 당시 이력이며 이번 검증과 합산하지 않는다. 작은 폰트/픽셀 차이를 완료로 허용하지 않는다.

### 1. 범위·기준·선행 상태

- 시작 Git: clean, HEAD d5f345e84970d5cf7c9839fe2adb1ef1943c8938(G09). 기존 사용자 변경 없음. G01 전면 교체는 하지 않았다.
- 주대상 /signup: 공개 이메일/선택 인계→입력·길이/강도·로컬 CAPTCHA→오류 수정→제출/로딩·취소·실패/재시도→새 가상 계정/workspace→G13 첫 화면.
- 직접 연결: G01 메모리/Reset, G02 랜딩, G03/G05/G06 공통 SignupForm 소비, G04 플랜/G07 청구서 인계, G09 약관/회사 복귀, G11 로그인 이동, G13 첫 화면, G14 실제 라우터/보호 경계. G11 전체·G13 이후 설문·G32는 새로 착수하지 않았다.
- FRONT_AGENT/README와 지도에 따른 ARCHITECTURE의 FRONTEND_USER_WEB·STATE_AND_DATA·MOCK_FIRST_DEVELOPMENT·TESTING, CONVENTION의 COMPONENT_DESIGN·WEB_ACCESSIBILITY_AND_LAYOUT·COMMENT_AND_LOGGING·FRONTEND_USER_WEB, DECISIONS006/005 및 ENGINEERING_REVIEW_CHECKLIST를 적용했다. AGENT/README·PM036·UX025, PM 문서/계획 검토 규칙, SOURCE_ANALYSIS_STANDARD/REVIEW 및 이번 계획/관련 G/R을 확인했다. README가 참조하는 AGENT/AGENT_USAGE_RULES.md는 현재 없고 검색에서도 찾지 못했다. 읽었다고 기록하지 않는다.
- 선행 G01/G02와 R02의 메모리 수명·명시적 소셜/메일 목 분기를 현재 코드에 대조했다. 과거 G00 조사/검증을 새 실행으로 대신하지 않았다. G09의 정책 버전/시각/브라우저 대기는 유지한다.
- 기존 본문의 evidence/r02 두 JSON, evidence/g10 폴더/캡처JSON/시각수치JSON/comparisons 및 evidence/g15/final-verification.json의7링크는 현재 파일이 없다. 과거 기록은 보존하고 재생성하지 않았다.

### 2. 확인한 원본·단계·버전

Gummble Onboarding Flow ID f714101f-db6b-4bfe-9ed1-74d6b0d6243c를 이번에 조회해10개 Screen ID/순서/URL·1440×900 메타데이터를 확인했다. 응답에 카탈로그 버전은 없어 저장된 bonsai-web/Latest/2146을 현재 카탈로그로 재확정하지 않았다. 제품 빌드·캡처일·CSS viewport/DPR은 미확인이다.

[Onboarding ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) §4 각 단계/§5 상태·§8 미확인, G10 §3/5와 R4-F086을 대응한다. 아래 원본10PNG를 각각 직접 열람했다.

| 확인 | 단계·Screen ID | 직접 본 내용·원본 |
| --- | --- | --- |
| [x] | 01 · sc_07904520440b4dc7ad7d6d31bf3a03e9 | 공개 랜딩/빈 이메일·CTA · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>) |
| [x] | 02 · sc_e0a408a1e1dd4ea39f54dcef37d2bbf7 | 랜딩 이메일 입력 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/02_sc_e0a408a1e1dd4ea39f54dcef37d2bbf7.png>) |
| [x] | 03 · sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838 | 가입 카드·Email/Full Name/Password·Google·약관 문구·미체크 CAPTCHA · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/03_sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838.png>) |
| [x] | 04 · sc_75b60a729ef7491186049534632edfe4 | Full Name Joe Doe·이메일 유지 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/04_sc_75b60a729ef7491186049534632edfe4.png>) |
| [x] | 05 · sc_3381bd3528ea401e94549c86a8f80af8 | Too Weak·짧은 마스킹 입력 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/05_sc_3381bd3528ea401e94549c86a8f80af8.png>) |
| [x] | 06 · sc_2adb02c3443f4da292d72c200694c1c9 | 별도 빨간 최소10자 tooltip·입력 보존 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/06_sc_2adb02c3443f4da292d72c200694c1c9.png>) |
| [x] | 07 · sc_ca23a435daac40318703fcf7360a09d2 | 긴 비밀번호 재입력·강도 라벨 없음·CAPTCHA 미체크 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/07_sc_ca23a435daac40318703fcf7360a09d2.png>) |
| [x] | 08 · sc_de06dffb50094b20bee94b68be710837 | Strong·CAPTCHA 체크·제출 준비 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/08_sc_de06dffb50094b20bee94b68be710837.png>) |
| [x] | 09 · sc_817952152d2a4b62b44bf1a21bf44509 | 배경 폼이 남는 흰 오버레이·화분·Hold tight! · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/09_sc_817952152d2a4b62b44bf1a21bf44509.png>) |
| [x] | 10 · sc_33b333fba9d34edbbd66ddfadf29dcb4 | 첫 사업 설정·Welcome, Joe·진행5중 첫째·빈 업종·인물/평점 · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/10_sc_33b333fba9d34edbbd66ddfadf29dcb4.png>) |

연결3PNG와 각 ANALYSIS의 해당 단계도 직접 확인했다. 연결 플로우 MCP 전체를 이번에 조회한 것은 아니다.

- [x] F083 Logging in, a02409b3-6eb0-4bc0-b702-22a42e0990c8,02 sc_9d353458318e43e7b25ebbf88fefeaa9: [분석](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>). 가입과 다른 Google/Apple·Changelog·로그인 카드.
- [x] F087 Completing account setup, f004afc2-a8c5-4262-b2e4-941331047a84,01 sc_33b333fba9d34edbbd66ddfadf29dcb4: [분석](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/01_sc_33b333fba9d34edbbd66ddfadf29dcb4.png>). F086/10과 같은 바이트/화면, 문맥상 설문 시작까지만 이번 범위.
- [x] F132 Terms & Conditions,912b4b75-77bb-43fa-b86f-d85c6117841a,01 sc_8e3f3ec3993e4051a54ef9fd80ff3e50: [분석](<../../../bonsai_analysis/flows/Terms & Conditions/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Terms & Conditions/screens/01_sc_8e3f3ec3993e4051a54ef9fd80ff3e50.png>). 공개 약관 상단 발췌. 표시 June30,2020은 갱신일이며 가입에 적용된 버전/효력일/촬영일이 아니다.

총13파일(고유12화면), 분석4개의 LF정규화 SHA-256/PNG바이트 해시·2880×1800 크기가 SOURCE_ANALYSIS_INDEX와 일치했다. 뷰어의 자동 표시 축척을 브라우저 CSS px로 보지 않는다. 원본 PNG/ANALYSIS는 수정하지 않았다.

### 3. 원본→분석→계획→코드의 판정

| R4 | 판정 | 대응·한계 |
| --- | --- | --- |
| R4-F086-O01 | 비교 완료·구현 보완 | 이메일/이름/비밀번호·눈/길이 안내·Google·약관 링크 구조 유지. CAPTCHA 수정 오류 해제·feature 공개 경계 보완. 로그인/초대 폼으로 통합하지 않음 |
| R4-F086-O02 | 비교 완료·구현 보완 | Too Weak와 길이 tooltip, 긴 값 재입력과 Strong을 분리. Strong은 blur 후 표시하는 목 가정으로 보완; 실제 확정 시점/산식 대기 |
| R4-F086-O03 | 비교 완료·구현 보완 | 폼을 남기는 로딩 유지, 가려진 약관 비활성·취소 초점/복원 보완. 첫 설문 인사 이름 표시 보완; 그림/애니메이션·레이아웃 동일성 대기 |
| R4-F086-A01 | 분석 대기 | 정확한 강도/검증 시점·이름 분리·소셜/CAPTCHA/메일·약관 적용 버전·화분 애니메이션·정확 폰트/치수/촬영 조건 미확인 |

주요 요소군 대응(원본 전체 요소 수를 계수한 인증 아님):

| 요소군·근거 | 코드(FE/user-web/src) | 수용 기준·현재 결과 |
| --- | --- | --- |
| F086/01~02 공개 hero/이메일 | features/public-web/components/signup-form.tsx, public-provider | pathname별 초안·이력 snapshot 유지, 취소 시 전체 URL 복귀 보완 |
| F086/03~04 카드/Google/입력/약관 | pages/signup, app/layouts/auth-layout, mock-auth/hooks/use-signup | 로그인과 별도 구성·필수 동의 체크박스 추가 없음, 공개 인계/오류/취소 DOM 확인 |
| F086/05~08 눈/강도/길이/CAPTCHA | mock-auth/components/auth-controls, model/auth-validation | 각 표시 상태 분리·입력 보존·수정 오류 해제. 강도/blur/로컬 체크는 목 선택 |
| F086/09 오버레이/화분/안내 | SignupProgress, styles/auth.css | 배경 폼 유지·잠금·취소 초점/복원·늦은 응답 무효화 확인. 정적 화분/취소 제어는 원본 애니메이션 인증 아님 |
| F086/10=F087/01 설문·진행·우측 패널 | pages/onboarding, company-setup/components/setup-fields, styles/company-setup.css | 새 계정 첫 화면·진행1/5·빈 업종/Next 비활성·인사 표시 확인. 이후 설문 전체 범위 제외 |
| F132/01 정책·F083/02 로그인 | pages/company, pages/login, router/route-boundaries | Terms/로그인 이동·실제 history 왕복/가입 취소, 보호URL→첫 설문. 정책 버전/로그인 전체 검증 아님 |

### 4. 발견한 문제·수정·유지

| 문제/원인 | 수정 | 검증 |
| --- | --- | --- |
| CAPTCHA 수정이 raw setter만 호출해 오류/aria-invalid가 남음 | use-signup.editCaptcha가 해당 오류·실패/이전 요청을 해제, 다른 입력 보존 | 정식 DOM에서 수정 전 재현→수정 후 통과 |
| disabled fieldset이 약관 anchor를 비활성화하지 않음, 로딩 후 초점 대상 불명확 | 가입 form inert·약관 tabIndex/aria-disabled/클릭 가드, SignupProgress 취소 초점과 살아 있는 제어 복원 | 가려진 링크 이동 차단·취소 후 제출 초점/초안·재시도 검증; 실제 Tab 순서는 대기 |
| 랜딩 SignupForm 기본 인계가 pathname만 전달해 취소 시 query/hash 소실 | 기본 returnTo=pathname+search+hash, 명시 intentOptions는 우선 유지 | 랜딩→가입→약관/로그인 이력→취소 전체 URL 회귀; 다른 소비 전체 테스트 통과 |
| 긴 재입력과 Strong 표시가 즉시 합쳐짐 | Strong은 blur 후 표시, 약함/길이 오류와 별도 상태 | 재입력 때 tooltip/Strong 없음→blur 후 Strong. blur가 원본 트리거라는 증거는 없음 |
| Joe Doe 전체 이름이 첫 인사에 그대로 표시됨 | setup-fields의 표시만 첫 공백 토큰 사용, 계정 Full Name 저장은 유지 | Welcome, Joe 확인. 다국어 이름 분리 정책 확정이 아닌 목 규칙 |
| 가입 page가 feature 내부 파일 직접 import | mock-auth/preview 공개 export 소비, 변경 handler 한글 책임 주석 | 타입/lint·메모리build·전체 회귀 |

기존 단일 AuthStore/계정·workspace ID·입력 snapshot, 중복 동시 가입 차단, 종료/Reset 무효화, 동일 탭 계정 수명, 실제 URL/이력, 공통 Dialog, 보호 returnTo를 유지했다. auth-layout·CSS/원본 자산·G13 이후 질문·Backend는 바꾸지 않았다.

정식 signup-entry.test.tsx를 추가했다. 첫 실행은 jsdom 미지원 showModal 대체 준비 문제로 실패했고 테스트 환경을 수정했다. 코드 수정 전 유효 실행7개 중3실패(CAPTCHA/약관 tabIndex/복귀 URL)·4통과, 수정 후7통과. 추가 선택 이메일/중복·표시/초점 검증을 포함한 최종 대상9/9 통과(20.54s). navigation을 mock하지 않았다.

### 5. 시각 대조·목 가정·미확인

| 구분 | 확인 내용/현재 구현 | 남은 차이 |
| --- | --- | --- |
| 가입 카드/글자 | 현재 CSS: 폭500/padding36·60·60, 제목20/28, 본문16/24, label12, input최소40, 버튼최소46, radius10/6 | 원본 CSS px·정확 font/weight/line-height/letter-spacing·줄바꿈/간격/정렬 동일성 미검증 |
| 색/배경 | 구현 #fbfcfb/#091613/#168b00, border#cbd1ce, overlay#fbfcfbf2·inset80px, 잎172×175/325×175 | 원본 실제 색/opacity/shadow·배경선 위치/가림·overlay 위치 정밀 비교 필요 |
| 첫 사업 설정 | 구현60%/40%,570px설문,371px인물,진행5개,첫50px/나머지26px,제목24/30 | 원본 viewport/폰트·사진/평점 crop·Next의 원본 흰 글자와 접근성 어두운 글자 등 차이 미완 |
| 자산 | 기존 sources/setup-sources의 관련9PNG 해시 일치. 로고/Google/잎/화분/인물/평점·로그인 symbol/Apple 출처 기록 확인 | Lucide 눈/로컬 CAPTCHA 문구·그림·정적 화분과 원본 차이, animation 불명. 원본 수정/새 자산 생성 없음 |
| 비교 조건 | 원본2880×1800, MCP1440×900, 원본 단독 열람 | 구현 viewport/DPR/배율/scrollY·같은 상태 픽셀 비교 미수행. 비교 캡처 경로 N/A: 파일 생성 금지 |

목 정책: 최소10자 문구는 관찰이고 3종류 문자 강도 규칙·Strong blur 시점·이름 첫 공백 분리·CAPTCHA 오류 해제·Google 표본/메일 도전·실패/취소/계정 수명·직접 URL 복귀는 명시적인 로컬 선택이다. 원본 07→08의 정확한 지연/이벤트는 미확정이다. 가입 정상 경로에 실제 메일 확인·OAuth를 강제하지 않으며 가상 성공을 실서비스 계정/결제/PDF 생성으로 보지 않는다.

### 6. 실제 검증·명령·환경

Node24.18.0/pnpm8.14.1, package 요구 Node>=24<25/pnpm8.14.1을 확인했다. FE/user-web에서 실행:

- [x] pnpm.cmd exec tsc --project tsconfig.app.json --noEmit --incremental false --pretty false 및 tsconfig.node.json 각각 통과.
- [x] pnpm.cmd exec eslint . --no-cache 통과.
- [x] Vitest 대상9/9, 전체33파일197/197(143.60s) 통과. 기존 다른 Goal 과거 통과 수를 이번 수에 더하지 않는다.
- [x] Vite7.3.5 메모리build:1972모듈/3output,9.79s,write:false. configFile:false/React·alias/PostCSS tailwindcss+autoprefixer/emptyOutDir:false/copyPublicDir:false/sourcemap:false.
- [x] 원본4분석/13PNG 해시·크기, MCP10ID/순서, 기존 관련9자산 SHA 검사. Git diff --check 통과.
- [x] 기존 http://127.0.0.1:5173/ HTTP200·OneHand CRM UI preview·Vite/HMR·PID30272 확인.5174는 시험장 모니터링/PID22864로 별도이며 보존했다. 서버/ENV/Backend를 변경하거나 시작하지 않았다.
- [ ] 실제 브라우저 조작/E2E·주소창/새로고침/새탭·키보드/실제 모달/스크롤·좁은 화면·OS IME·console/network는 미실행. 현재 브라우저 도구/연결 문서 세션·CDP9222/9223이 없고 사용자 금지에 따라 새 브라우저 프로필/캐시를 생성하지 않았다.
- [ ] 인증/업무/외부 요청0건은 실제 network를 관찰하지 않아 null/미판정이다. 해당 코드의 실제 호출 미연결 및 로컬 HTTP 확인을 런타임0건 인증으로 바꾸지 않았다. 요청 차단은 하지 않았다.

검증 방식: PowerShell here-string→Node stdin/stdout. Vitest startVitest('test', FILTERS, 옵션, Vite설정); 대상=['src/app/router/signup-entry.test.tsx'], 전체=[]. config:false/run:true/cache:false/pool:threads/execArgv:[]/maxWorkers:2/environment:jsdom/setupFiles:vitest.setup.ts/include:src/**/*.test.{ts,tsx}/coverage:false/experimental.fsModuleCache:false/deps.optimizer.client·ssr.enabled:false. Vite configFile:false/react/alias/optimizeDeps.noDiscovery:true·include:[]/server.watch:null. 검증 프로세스의 NODE_DISABLE_COMPILE_CACHE=1/JITI_CACHE=false/JITI_FS_CACHE=false. build도 stdin import build와 write:false로 수행했다.

DOM 검증은 실제 Router/history 및 로컬 공급자를 사용한다. matchMedia/scrollTo/IntersectionObserver와 jsdom 미지원 dialog.showModal/close만 대체했다. 실제 네이티브 모달 초점 잠금·OS IME 인증이 아니다. 합성 composition/Enter229와 긴 한국어는 DOM 범위다. 새 provider는 메모리 초기화 검증이며 실제 새탭/reload 조작이라고 쓰지 않는다. 인증 스토어의 동시 가입/선택 intent/actor·workspace/reset/중복/소셜/메일 단위 회귀와 직접 공개 소비 회귀를 함께 실행했다.

새 검증 파일/임시 스크립트/이미지·캡처/trace/HTML/JSON보고서/로그/브라우저 프로필/다운로드를 만들지 않았다. 새 파일은 정식 회귀 테스트1개뿐이며 결과는 이 기존 문서에 추가한다. 기본 시나리오는 normal이고 테스트 공급자/대체를 정리했다. 미리보기 가상 상태는 조작하지 않았다. Browserslist 데이터 경고는 남겼고 의존성을 갱신하지 않았다.

### 7. FRONT_AGENT 및 공통 체크리스트 적용

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 이번 범위 판정이다.

| 항목 | 근거·판정 |
| --- | --- |
| §1 범위/출처 | [x] Git/실코드/원본13PNG·분석/목 가정·미확인 분리. UXUI전용·G10 및 직접 연결 한정 |
| §2 구조 | [x] 페이지 조립/feature 공개 export·hook입력/스토어commit·표시컴포넌트 책임 분리. N/A 새 의존성/전면 구조 변경 |
| §3 데이터 | [x] 단일 메모리 계정/ID·선택 인계·공급자/Reset 수명·비밀번호 영속 금지. [ ] 실제 network. N/A 서버계약/HTTP/DB/BE |
| §4 상태 | [x] 유효성/수정/실패/취소/경합/늦은 응답·중복/직접 URL·새scope 회귀. N/A 가입 폼의 목록검색/빈 결과·업무 계산/낙관적 CRUD |
| §5 웹 UX | [x] DOM 오류초점·eye/CAPTCHA·pending잠금/취소복원·실제Router/history·보호 경계. [ ] 실제키보드/스크롤/모달/폭·줌·OS IME·화면낭독기 |
| §6 주석/품질 | [x] 신규/변경handler 한글 기능 주석·effect cleanup·strict/lint, 원본관찰과 mock이유 주석. 관련 없는 코드 일괄 변경 없음 |
| §7 검증/인계 | [x] 현 타입/lint/단위DOM/메모리build·연결 회귀·결과/계획 상태. [ ] E2E/픽셀. N/A Admin/실서비스 배포 |

START-CHECKLIST: [x] 시작Git/선행/규칙/원본/범위, [x] 자료부족과 목 가정·수정/회귀·제한 산출물, [x] 결과/관련 문서/잔여 담당. [ ] 실제 브라우저·시각 동일성. 공통 체크리스트 전체를 완료로 체크하지 않는다.

| 공통 기준 | 이번 적용 결과(전역 완료 아님) |
| --- | --- |
| R4-C01 | F086 10단계 MCP ID/순서/1440×900 확인, 원본13PNG/분석4개 해시 일치. 저장된 Latest/2146과 촬영일·CSS viewport/DPR는 구분 |
| R4-C02 | 랜딩→별도 인증 카드→폼을 남기는 처리 오버레이→설문/우측 인물 패널 구성 대조. 실브라우저 겹침/배치 대기 |
| R4-C03 | 아래 단계/주요 요소군을 코드에 대응. 배경·작은 요소의 전수 계수 및 동일 재현 명세 인증은 미완 |
| R4-C04 | Email/Full Name/Password·최소10자·Too Weak/Strong·약관 문구·Hold tight! 유지, Joe Doe→Joe 표시 보완. 정확 줄바꿈 대기 |
| R4-C05 | 원본2880×1800·MCP1440×900·현재 CSS치수 분리. 실제 구현 viewport/DPR/배율/scrollY 및 픽셀 비교 미수행 |
| R4-C06 | Bonsai Public Gellix/Arial은 현재 구현 선택이며 인증 원본 폰트 확정 아님. 굵기/행간/자간/raster 동일성 대기 |
| R4-C07 | 기존 카드/입력/오버레이 색·radius/shadow 유지. 접근성 focus/disabled 및 로컬 표시 차이는 미완으로 기록 |
| R4-C08 | 기존 인증/첫 설문 관련9PNG의 자산 해시 일치. Lucide 눈·로컬 CAPTCHA·정적 화분은 원본 동일성 미확인, 새 자산 생성 없음 |
| R4-C09 | 입력오류 해제·약함/길이/재입력/Strong·처리/취소·실패재시도·중복·Google/메일 목 분기 DOM 검증. 실제 서비스 성공 아님 |
| R4-C10 | 실제 Router/history의 직접URL·약관/로그인 back/forward·취소 전체 URL·첫 설문/보호 경계 검증. 브라우저 reload/새탭·스크롤 대기 |
| R4-C11 | 폼 초안/제출 snapshot/새 계정·workspace 분리. 비밀번호 비영속·실패/시도취소 보존·이탈/reset 폐기·늦은 결과 무효화 검증 |
| R4-C12 | G01/G02/G03/G04/G05/G06/G07/G09/G11/G13첫화면/G14 직접 소비 회귀. 선택 intent만 인계, 연결 Goal 전체 완료 아님 |

### 8. 남은 작업·직접 확인 순서

- [ ] G10/R02·G01: 정확 폰트/아이콘/CAPTCHA/화분·상태색/간격/radius/shadow·촬영 조건/픽셀 동일성.
- [ ] G10/R02·G13: 강도 판정과 표시/오류 트리거, 이름 분리, 소셜/CAPTCHA/메일의 원본 흐름, 첫 설문 레이아웃/사진·국가 기본값. 목 가정 채택으로 원본 질문을 닫지 않는다.
- [ ] G09/G10·R01/R02: 가입 당시 Terms 링크 버전·전체 정책/개정/동의 관계. 기존 발췌는 가입 버전 확정 증거가 아니다.
- [ ] G10/직접 연결 G/G84: 실제 브라우저/네트워크/console·주소창/reload/새탭·포커스/scroll/좁은폭/확대·OS IME/다른 엔진.
- N/A: 실제계정/OAuth/CAPTCHA/메일·업로드·결제·Backend/API/DB·G13 나머지설문/G32. 서버후속 메모: 강도/중복계정/소셜병합·메일만료·약관버전/동의·세션영속/권한. 현재 계약을 만들지 않는다.

미리보기: http://127.0.0.1:5173/signup (기존 dev/HMR).
1. /?entry=g10#trial에서 sample@example.test로 Start free → Email 인계, Joe Doe, 짧은 비밀번호 입력. Too Weak→다른 필드 클릭 시 빨간 길이 안내→SampleOnly123!로 수정 후 blur→Strong/로컬 CAPTCHA를 확인한다.
2. Slow local response 선택→Create Free Account→폼 잠금·취소 초점→Cancel this attempt. 입력 유지/지연 이동 없음 확인. Normal로 돌아가 다시 제출→Welcome, Joe·진행1/5·빈 업종을 확인한다.
3. /components Reset 후 /signup에서 Fail once, then retry로 입력 보존/재시도를 확인한다. Google Dialog 취소·명시적 샘플 선택, Local email verification의 만료/취소/확인은 별도 목 분기다.
4. 랜딩/가격/템플릿/청구서에서 가입→Terms/로그인→뒤로/앞으로→명시적 취소. 출발 query/hash·선택 인계/원래 초안 정책을 확인한다.
5. 직접 /signup, 새로고침/새탭의 초기화, 보호URL의 첫 설문 경계, 좁은폭/키보드/IME·개발자도구 console/network는 별도 실제 브라우저 확인 대상이다. 끝나면 /components Reset/Normal로 복원한다.

위 순서는 수동 확인 절차이며 이번 실제 브라우저 통과 기록이 아니다. 커밋/push/배포 및 다음 Goal 착수는 하지 않았다.

### 9. 최종 문서·변경 검토

- [x] 계획 전체170 Markdown/1 JSON의 링크·앵커 및 구조를 HEAD와 대조했다. 기존 오류221건/현재221건, 신규0건이다. 기존 오류 대부분의 과거 evidence 부재를 이번 성공 근거로 사용하거나 복원하지 않았다.
- [x] 이번 관련 기존 문서52개: G10 명세/결과, 직접 소비 G01/G02/G03/G04/G05/G06/G07/G09/G11/G13/G14 명세·결과, G01/G02 재검토 결과, R01/R02 명세·결과, 공통 대응/흐름/기준/순서·README/FE-TODO/진행기록/PLAN-INDEX를 동기화했다. 수행한 항목은 [x], 시각·브라우저·원본 필수 미확정은 [ ]/대기, 범위 밖은 N/A 사유로 구분했다.
- [x] 과거 [x] 행·verification 수치, 다른 Goal/R의 전체 상태, 다른451개 R4 원문/해시/판정,85G/22R/134flows/754steps/642screens/107실행순서를 보존했다. G10은 overall_complete=false, 시각 미검증, 실제 API 요청 수 null이다.
- [x] 변경 소스7개와 정식 회귀 테스트1개를 재검토했다. 새 파일은 signup-entry.test.tsx 하나이며 원본/자산/Backend·환경·서버 설정 변경 없음. Git diff --check 및 링크/상태 최종 점검을 수행했다.
- [ ] 정확한 원본 정책/시각·실제 브라우저/네트워크 대기는8절 담당에 남긴다. 커밋/push/배포·다음 기능 착수 없음.

<a id="g10-precommit-review"></a>
## G10 커밋 전 재검토 — 2026-11-24 KST

후속 사용자 요청 “검토해주고 이상이 없으면 깃 커밋해”에 따른 검토다. 위의 커밋 미실행 기록은 앞선 G10 작업 종료 시점이며, 이번에는 검증 후 로컬 커밋이 승인되었다. push·배포·G11 구현은 범위 밖이다.

- [x] 추가 결함: SignupProgress가 폼을 inert/disabled로 바꾼 뒤 activeElement를 기억해, 제출 버튼에 초점이 없는 경우 취소 후 body에 초점이 남았다. 정식 회귀의 제출 전 강제 focus를 없애자 8통과/1실패로 재현했다. 실제 브라우저 재현으로 보고하지 않는다.
- [x] signup/index.tsx의 제출 ref를 SignupProgress에 전달하고, effect 시작 시 해당 요소를 기억해 취소/실패 뒤 연결되고 활성인 경우에만 복원한다. 성공 이동/이탈로 폼이 제거되면 초점을 가져오지 않는다. capture 이후 ref를 읽는 lint 경고도 정리했다. 추가 가상 성공·실제 호출·디자인 변경은 없다.
- [x] 수정 후 G10 9/9(19.70s), 최종 effect 정리 후 대상 9/9(19.34s). 전체33파일197/197(152.49s). 앞선143.60s 이력과 구분한다. 기존 한 시나리오를 강화했으며 테스트 수를 늘리지 않았다.
- [x] app/node 타입검사(noEmit/incremental false), lint(--no-cache, 최종 경고0), 메모리 Vite build(write:false,1972모듈/3output,15.78s) 통과. 실행 방식은6절과 같으며 파일형 검증 산출물을 생성하지 않았다.
- [x] PLAN-INDEX 최상위 status가 G08, workflow_review가 G07을 가리키던 누락을 수정했다. 이전 요약/검토 객체는 이력으로 보존하고 현재 G10 결과와 부분 완료 상태를 연결했다. G10 공통 화면2개의 검토도 G10 소비 범위로만 연결하며 다른 Goal 전체 상태는 유지한다.
- [x] 최종 계획170 Markdown/1 JSON을 다시 검사했다. 기존 링크 오류221건/현재221건/신규0건, 과거 완료 체크·검증 값·다른451개 R4 판정·107실행순서 보존을 확인했다. 수정된 기존 문서는52개, 신규 파일은 정식 회귀 테스트1개이며 Git diff --check도 통과했다.
- [x] 현재 연결 문서 세션 없음, CDP9222/9223 리스너 없음, 기존5173/PID30272·5174/PID22864 보존을 다시 확인했다. /signup은 HTTP200/Vite dev이며 브라우저 실행 증거가 아니다.
- [ ] 실제 브라우저/console/network·키보드/OS IME·정확 폰트/픽셀 동일성·미수록 원본 정책은8절 대기를 유지한다. 실제 요청 수는 null이며 Goal 전체 완료가 아니다.

직접 확인: http://127.0.0.1:5173/signup 에서 가상 입력과 로컬 CAPTCHA → Slow local response → Create Free Account → Cancel this attempt → 가입 제출 버튼 초점과 입력 보존 확인 → Normal로 복원한다. 이 절차는 이번 실제 브라우저 통과 기록이 아니다.

<a id="g11-update"></a>
## G11 적용·연결 검토 — 2026-11-24 KST

- [x] 가입↔로그인/메일 안내의 안전한 returnTo와 선택 인계를 유지하고 가입9개 회귀를 재실행했다. G10의 시각/실제 브라우저·원본 미확정 대기는 유지한다. [상세 판정·근거](G11_RESULT.md#g11-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록 정책은 대기다. 연결 G/R 전체 완료가 아니며 후속 담당은 G11 결과8절을 따른다.

> G11 커밋 전 추가 검토: 공통/공유 로그아웃→빈 로그인·저장 회사명 일관성 보완, G11 14/전체211 통과. 과거208 기록과 다른 Goal 대기는 보존하며 로컬 커밋만 승인되었다. [최신 결과](G11_RESULT.md#g11-precommit-review).

<a id="g12-update"></a>
## G12 적용·연결 검토 — 2026-11-24 KST

- [x] 기존 공통 강도 규칙은 목 가정으로 유지하고 가입 DOM9를 회귀했다. G12 단일 입력에 G10 보기 전환/강도 표시를 추가하지 않았다. 새 계정 재설정 후 설정 경계를 확인했다. [상세 판정·근거](G12_RESULT.md#g12-r4-recheck).

- [ ] 원본 동일성·실제 브라우저/네트워크·미수록 정책은 대기다. 관련 G/R 전체 완료가 아니며 후속 담당은 G12 결과8절을 따른다.

> G12 커밋 전 추가 검토: 같은 경로에서 복귀 주소·이력/선택 문맥이 바뀌어도 이전 요청 안내·비밀번호 저장이 완료되는 두 결함을 재현하고 수정했다. G12 DOM11+store7=18/18, 전체225/225·타입/lint·메모리build 통과. 이전223 기록과 다른 Goal 대기는 보존하며 사용자 후속 요청으로 로컬 커밋만 승인되었다. [최신 결과](G12_RESULT.md#g12-precommit-review).


<a id="g13-update"></a>
## G13 적용·연결 검토 — 2026-11-24 KST

- [x] 가입 DOM9와 같은 가상 계정/첫 이름/내부 returnTo→온보딩 경계를 회귀했다. 익명 직접 온보딩의 안전한 목적지를 가입으로 전달하도록 보완했다.

- [ ] 원본 동일성·실제 브라우저/console/network·OS IME와 원본 미수록 정책은 대기다. 관련 G/R 전체 완료가 아니다. [범위·검증·잔여](G13_RESULT.md#g13-r4-recheck).

> G13 커밋 전 추가 검토 — 2026-11-24 KST: 초기 대시보드에서 같은 경로로 이동할 때 로딩이 남는 결함을 재현·수정했다. G13 DOM10/company store4=14/14, 최종 전체36파일236/236·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저·원본 미수록 대기와 과거 이력을 보존하며 사용자 후속 요청으로 커밋·origin/main push를 승인받았다. 배포·다음 Goal 착수 없음. [추가 검토 결과](G13_RESULT.md#g13-precommit-review).
