# G10 회원가입 실행 결과

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
