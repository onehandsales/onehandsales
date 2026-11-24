# G11 로그인·로그아웃 실행 결과

> 현재 G11 — 2026-11-24 KST: **부분 완료**. 최초 원본7단계 대조/보완 뒤 커밋 전 공통·공유 로그아웃 복귀와 회사명 일관성2문제를 추가 수정했다. 전체211/211·타입/lint·메모리build 통과. 시각/실제 브라우저·원본 대기는 유지하며 사용자 후속 요청으로 로컬 커밋이 승인되었다. [최신 검토·검증](G11_RESULT.md#g11-precommit-review).


> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 같은 메모리 계정을 사용하는 로그인·로그아웃·소셜/2FA 목 경로를 구현하고 두 차례 검토했다. 현재 가능한 관련 개발/빌드 회귀 검사를 마쳤다. G13 사업 설정과 G14 앱 셸/선택 목적지 복귀는 후속 연결 대기다. 실제 인증·메일·CAPTCHA·외부 API는 연결하지 않았다.

## 근거와 적용 범위

이번 연속 작업의 R02 신규 MCP 조회 중 Logging in `a02409b3-6eb0-4bc0-b702-22a42e0990c8` 01~05, Logging out `39713c9a-6f82-4d7c-be32-ab38510406bc` 01~02를 소비한다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 카탈로그 Latest/2146은 G05 조회 재사용, 촬영일/서비스 빌드는 미확인이다. [Screen ID/순서](evidence/r02/mcp-sources.json), [직접 본 PNG/해시](evidence/r02/source-manifest.json), [R02](R02_RESULT.md). ANALYSIS와 7개 원본 PNG를 확인했고 이 단계에서는 로그인03/로그아웃01을 전체 크기로 다시 보았다. 로그인02~04·로그아웃01~02를 실제 구현과 직접 비교했다.

원본의 로그인 카드, Email/Password, Google/Apple 버튼, CAPTCHA 위치, Reset Password/Resend Verification Email, Changelog 발췌 6개, 계정 메뉴 6목적지, 로그아웃 후 빈 폼/토스트를 적용했다. 로그인05의 업무 데이터 대시보드는 G14 셸/G16 이후 업무 범위이며 전체를 복제하지 않았다. Changelog 전체 글/상세는 미수록이어서 Bonsai updates는 명확한 로컬 안내다. 인증 HTML 보관본403은 R02 기록을 유지한다.

## 구현·상태 수명

- `/login`: AuthLayout + LoginChangelog/LoginScreen/useLogin. 소셜 버튼은 명시적 샘플 Dialog, 실제 OAuth 없음. Google은 이번 탭의 G10 Google 샘플 계정이 있으면 해당 ID, 없으면 Alex; Apple은 Blair fixture. 원본 계정 연결 정책이 아니다.
- G10에서 가입한 이메일·digest와 같은 계정으로 재로그인한다. Alex/Blair 샘플 비밀번호는 공개 표본 `PreviewOnly123!`. 원문은 폼 메모리에만 있고 성공·이탈·세션 차수 변경에서 폐기한다. URL/로그/영속 저장소에 넣지 않는다. 실제 개인정보를 요청하지 않는다.
- 오류·실패 후 이메일/비밀번호/CAPTCHA 유지, 중복 제출은 ref로 한 번만 수행. 취소·페이지 이탈·시나리오 변경·Reset/actor/workspace 변경은 AbortSignal 및 generation/revision으로 늦은 응답을 무효화한다. 자기 로그인 commit의 revision 변경만 성공 navigation에 허용한다.
- `/two-factor`: 원본에 없는 명시적 목. 공개 샘플 코드123456, 세 번 오류 시 만료, 명시적 만료/새 코드/취소. 성공 전 세션 없음. 새 ID로 재발급/만료/취소 후 이전 확인 요청은 저장하지 않는다. 코드/도전은 메모리이며 refresh/새 탭에서 사라진다.
- 계정 메뉴: Help Center→G08, Perks/Team/Subscription→명시적 후속 목 목적지, Settings→G15 대기. Logout은 로컬350ms/slow1500ms/fail-once/cancel. 성공할 때 기존 실행 문맥을 종료하고 보호 경계가 빈 로그인으로 복귀한다. 실패·취소에는 세션 유지. 현재 탭 만료 안내도 별도 목 도구다. 다른 장치의 서버 세션 종료를 뜻하지 않는다.
- 계정은 같은 탭의 일반 로그아웃 뒤 유지하고 Reset/refresh/새 탭은 seed로 초기화한다. 공개 초안/인계는 기존 revision 격리를 유지한다. 선택한 snapshot만 로그인 성공 때 새 actor/workspace/revision에 귀속한다.
- 안전한 returnTo는 정규화 후 `/app` 경계만 허용하며 search/hash를 보존한다. 외부 URL·유사 접두사·경로 탈출·역슬래시를 거부한다. G01 기존 보호 상세로 실제 복귀한다.
- 공개 선택이 있는 완료 계정은 `/auth/continue`에 선택 요약을 표시한다. G14의 최종 목적지 연결 전까지 이를 전체 복귀 완료로 쓰지 않는다. 미완료 가입 계정은 G13 사업 설정 경계로 이동한다.
- `/verify-email/request`는 재설정과 다른 이메일 인증 목적임을 표시하는 미수록 안내다. 실제 발송/재발송 성공을 만들지 않는다. `/password/reset`은 G12에서 이어 구현한다.

## 검토·수정

1차: 로그인/로그아웃의 저장 직전 scope 검증, 새 계정 ID 재사용, 실패 원자성, 2FA 세션 미개방, credential 수명을 검토했다. G01 보호 redirect가 pathname만 전달해 search/hash가 유실되는 부분을 수정했다. 로그인→복구/이메일 인증 링크에 기존 이력의 publicIntentId를 전달했다. 안전한 returnTo 정규화도 강화했다.

2차: 첫 unit30/브라우저17개 통과 후 실제 캡처와 원본을 대조했다. Changelog 제목의 상속 행간 때문에 카드가 약14px 길어진 부분을 명시 행간으로 수정하고 로그인 divider/heading 간격을 보정했다. 5개 원본 pair와320/390/768 화면을 직접 확인했다. 실제 navigation·오류 입력 보존·2FA 만료/취소·로그아웃 실패/취소·보호 이력·소셜 Escape/초점·좁은 폼을 검사한다. 원본과 다른 G01 셸은 G14 연결 대기로 명시했다.

검토 판정과 실행 결과는 구별한다. 캡처 스크립트의 잘못된 알림 닫기 이름으로 한 번 timeout이 발생했고 실제 접근 이름으로 고쳐8캡처를 다시 완료했다. `pnpm test --run`/존재하지 않는 `test:unit` 실행은 명령 오류로 실패했으며 현재 package.json의 `corepack pnpm test`로 바로잡았다. 이 실패를 앱 결함이나 테스트 통과로 기록하지 않는다.

## 실행·비교 증거

FE/user-web, Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 실행.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`:30/30, `corepack pnpm build` 통과. JS773.89kB/gzip212.50kB, chunk500kB/Browserslist 경고 유지.
- 첫 `playwright test login.spec.ts signup.spec.ts foundation.spec.ts --workers=2 --reporter=line,json`:17/17. 최종 관련 개발26/26·빌드26/26 통과. [evidence](evidence/g11/).
- `node scripts/capture-login.mjs`, `.../python scripts/compare-login.py`:8개 캡처, 원본5쌍. 정적 요청1722/API·외부·실패·console오류0. 요청 차단은 사용하지 않았다. [캡처 조건](evidence/g11/browser-captures.json), [원본/수치](evidence/g11/visual-metrics.json), [pair/diff](evidence/g11/comparisons/).
- 원본2880×1800을1440×900으로 정규화, 실제 Chromium148/DPR1, 원본 CSS viewport/DPR은 미확정. 추정 배치: 왼쪽342px/오른쪽400px/gap100px/y80px, 입력40px/버튼46px, 제목26px, 본문16px, Changelog14px. 원본 CSS 수치라고 단정하지 않는다.
- 샘플 이메일/비밀번호 마스킹, 로컬 CAPTCHA 배지/체크, 더 진한 초록색, 근사 Gellix/Arial·굵기·세부 간격·focus·토스트 아이콘, 별도 목 안내/도구는 차이로 남는다. 로그인03의 실제 캡처는 blur 상태여서 원본 입력 focus 선과 다르다. 로그아웃02의 색감 차이도 다른 촬영 상태로 보존하고 임의 디자인 버전을 합치지 않았다.

## 남은 항목과 확인 순서

G13 미완료 계정 사업 설정, G14 공개 선택→인증→의도한 목적지 및 내부 셸/계정 메뉴 배치, G15 Settings의 회사 화면을 후속 연결로 추적한다. R02 전체·G17/G18·G16 이후 업무 완료가 아니다. 원본 소셜/2FA/만료/모바일, 정확한 인증 폰트, OS IME·VoiceOver·추가 브라우저/실기기는 미확인이다. 합성 composition/CSS 확대를 실제 OS 검증으로 쓰지 않는다.

서버 후속: 소셜 기존 계정 병합·실제 2FA/장치 기억·CAPTCHA 만료·다중 장치 로그아웃·세션 영속/보안 정책. API 계약/DB 설계는 하지 않았다.

미리보기 http://127.0.0.1:5173/login → alex@example.test / 공개 샘플 비밀번호 → 로컬 체크 → Log in → 계정 메뉴 Logout → 빈 로그인/안내. Local authentication scenarios의 Fail once/Slow/Two-factor로 재시도·취소·코드123456을 확인하고 Normal로 복원한다. 5173 기존 FE와 모든 앞 단계 변경을 보존한다. 커밋/push/배포/Backend는 실행하지 않는다.

## 최종 회귀 확인

관련 범위를 넓힌 첫 개발 회귀24/26의 실패를 별도 보존한다. 로그인 전용 레이아웃에는 G01 Components 메뉴가 없어 기존 테스트가 잘못된 경로를 찾았다. 명시적인 인증 목 도구에 Open preview controls를 연결해 실제 경로로 Reset을 검증했다. G03 공개 인계 테스트는 Consulting 렌더 전에 이전 랜딩 입력을 채워 빈 Consulting 폼을 제출했다. 목적지 제목 준비를 확인한 뒤 입력하도록 고쳤으며 두 이력의 이메일 격리/취소 조건은 유지했다.

- development-final: 26 통과, 요청98813, API/외부0, 실패0, console0.
- production-final: 26 통과, 요청1378, API/외부0, 실패0, console0.

최종 typecheck/lint/build 통과, 정상 시나리오 기본값 유지. G11 목 동작/현재 검증을 기록하고 G12로 이어간다. 전체 원본 동일성과 후속 연결 완료를 뜻하지 않는다.

### G12 연결 회귀 (2026-11-21)

가격 선택→가입→로그인→재설정→빈 로그인에도 선택 요약 유지와 같은 계정 로그인을 검증했다. 관련 dev·build23씩 통과. G14 최종 목적지/왕복과 기존 원본·환경 대기는 유지한다. [G12](G12_RESULT.md).

### G13 연결 회귀 (2026-11-21)

가입→사업 설정→동일 회사 저장에 가격 선택/공개 인계를 유지하고 로그아웃→같은 계정 재로그인 시 회사 정보 유지/이전 인계 폐기를 검증했다. 관련 dev·build26씩+최종 온보딩3씩. G14 최종 목적지/왕복과 기존 미수록·환경 대기는 유지한다. [G13](G13_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

이번 공통 수정의 영향을 기존 흐름 회귀로 확인했으며 원본·시각·환경 대기는 유지한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

### G02 연결 확인 — 2026-11-23 KST

[이번 G02 재검토](G02_RECHECK_RESULT.md#g02-r4-recheck)의 공통 소비·공개 입력/인증 인계 DOM 검증을 참조한다. G11의 코드/전체 기능은 재작업하지 않았고 과거 회귀와 시각/원본/환경 대기는 유지한다. 이번 실제 브라우저 상세/네트워크 검증은 미실행이다.

## G03 연결 범위 회귀 — 2026-11-23~24 KST

[이번 결과](G03_RESULT.md#g03-r4-recheck). G03 이메일 가입→로그인 입력 전달·뒤로/취소를 DOM 검증했다. 로그인 코드/정책 변경 없음. G13/G14 코드 인계는 확인했지만 온보딩/인증 전체 브라우저 검증은 대기. 전체121개는 이번 실행 수치이며 과거 수치와 합산하지 않는다. 이 Goal 전체 재검토/완료를 뜻하지 않는다.

## G04 소비 연결 확인 — 2026-11-24 KST

[G04 현재 결과](G04_RESULT.md#g04-r4-recheck). G04 선택의 가입→로그인→뒤로/취소와 기존 인증 저장소 회귀를 확인했다. 실제 인증/원본 로그인 정책을 확정하지 않았다. 기존 결과·체크와 이 Goal 전체의 잔여는 보존한다.

## G05 소비·재검토 기록 — 2026-11-24 KST

- [x] G05 인계의 가입↔로그인·history 왕복, 기존 인증 저장소 회귀. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)에 근거를 기록했다. 전체 단위/DOM143개는 이번 실행 수치이고 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/네트워크·원본/시각 대기와 이 Goal 전체 상태는 유지한다. 이 기록은 G05의 공통 소비 영향 확인이며 이 Goal 전체의 R4 재검토/신규 착수가 아니다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 로컬 샘플 로그인→선택 목적지 복귀 및 기존 auth 단위 회귀; 전체 로그인 UX 재검토 아님. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 목 로그인→선택 인계→같은 행/금액/전체 URL의 명시 복원. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] My Account/문의 앱→미인증 로그인·브라우저 복귀→샘플 로그인→앱을 DOM 검증했다. 로그인/역할 전체 재검토는 아니다. [상세 판정·근거](G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 회사 공개 헤더 로그인 진입/뒤로와 가상 세션 유지 범위만 DOM 확인했다. 로그인/역할/소셜 전체 재검토가 아니다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.

<a id="g10-update"></a>
## G10 적용·연결 검토 — 2026-11-24 KST

- [x] 가입 헤더의 로그인 이동과 같은 publicIntentId·뒤로/앞으로, AuthStore 동일계정/중복·종료 경계를 회귀했다. 로그인/로그아웃 전체 원본 재검토는 아니다. [상세 판정·근거](G10_RESULT.md#g10-r4-recheck).

- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G10 결과8절에 기록했다.

<a id="g11-r4-recheck"></a>
## G11 기존 구현 R4 재검토·보완 — 2026-11-24 KST

**판정: 부분 완료 — 로그인/로그아웃 오류·취소·복귀·메뉴 제목 보완 및 단위/DOM 검증 완료. 엄격한 시각 동일성·실제 브라우저·원본 미수록은 대기.** 이 문서 앞부분의 30/30·26/26·API0·과거 캡처와 G01~G10 연결 기록은 과거 이력이며 이번 실행 결과를 대신하지 않는다. 기준 HEAD는 `a842c4637fc98f346e7958b3bb33c7f69c8fa2d9`, 시작 Git 상태는 clean이었다.

### 1. 범위와 판단

- [x] 주대상 G11 로그인·로그아웃, G01 공통 인증/세션/목·G02 공개 로그인/선택 인계·G10 가입↔로그인·G12 재설정 진입/복귀·G13 설정 완료 여부의 진입·G14 앱 메뉴/보호 경로를 대조했다.
- [x] 같은 사용자 목적/세션/선택 객체와 직접 이동하는 경계만 포함했다. 회사 저장소는 메뉴 제목을 현재 회사명과 일치시키기 위해 읽는다. G15 업무 편집 전체 재검토가 아니다.
- [x] AuthStore의 계정 ID/digest·세션 revision/generation·취소·선택 intent snapshot·안전한 returnTo·2FA 선택 분기는 유지했다. 문제없는 저장소를 다시 구현하지 않았다.
- [ ] G10 시각/실제 브라우저/원본 정책 대기는 그대로다. G12/G13 전체 재검토·G32 이후 구현은 하지 않았다.
- [ ] 로그인 결과 대시보드의 프로젝트/그래프/업무 표본을 원본과 동일하게 만드는 작업은 G11/G14/G72 인계다. 이번 원본 05 열람에서 누락시키지 않았으나 업무 전체를 확대 구현하지 않았다.

### 2. 규칙 적용과 실행 경계

[FRONT_AGENT](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [DECISIONS006](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/006_bonsai_uxui_only_phase.md), [엔지니어링 체크리스트](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 변경 범위 규칙을 적용했다. 아키텍처/컴포넌트/상태/목/접근성/한글 주석/테스트 문서, 관련 PM036·UX025와 계획 공통 문서를 확인했다. 적용 경로에 AGENTS.md가 없고 BE/AGENTS는 범위 밖이다. AGENT/README가 안내한 AGENT_USAGE_RULES.md는 현 체크아웃에서 찾을 수 없어 읽었다고 기록하지 않는다.

- page는 화면/이동, useLogin은 입력/오류/요청 수명, AuthStore는 같은 계정/세션/목 결과, AppShell은 회사 저장소 이름을 AccountMenu props로 전달한다. 신규 feature 공개 export를 통해 연결하며 새 실 API/HTTP adapter/BE/DB/의존성은 없다.
- 신규·수정 책임 함수/컴포넌트에 한글 `// 기능 : ...`, 로그인 비동기 제출에는 snapshot/현재 결과 구분 번호 주석을 적용했다.
- 소셜 버튼은 명시적 로컬 모달 확인 후만 동작한다. CAPTCHA 체크·실패/잠금/2FA/만료 정책은 원본 사실로 확정하지 않는다. 실제 잠금은 새로 만들지 않았다.

### 3. 원본 7단계 확인 목록·버전·표시 조건

[Logging in 분석](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) 01~05와 [Logging out 분석](<../../../bonsai_analysis/flows/Logging out/ANALYSIS.md>) 01~02를 원본 PNG와 직접 대조했다.

- F083 Flow ID: `a02409b3-6eb0-4bc0-b702-22a42e0990c8`; F085 Flow ID: `39713c9a-6f82-4d7c-be32-ab38510406bc`.
- 이번 Gummble `gummble_get_flow_screens_batch`에 두 flow_ids, `include_images:false`를 전달해 2흐름/7개 Screen ID·순서·URL·1440×900 메타데이터를 확인했다. MCP 이미지를 직접 열었다는 뜻은 아니다. 로컬 원본 7PNG는 별도로 직접 열었다.
- 채택 자료는 저장된 `bonsai-web / Latest / 2146`이다. 이번 응답은 카탈로그 버전을 반환하지 않아 현재 버전 재확정은 하지 않았다. 제품 빌드·촬영일·계정·OS·CSS viewport·DPR·zoom은 미확인이다. 두 흐름을 같은 계정/시각의 연속 기록으로 합치지 않았다.
- SOURCE_ANALYSIS_INDEX와 LF 정규화 ANALYSIS2개·PNG7개의 SHA-256/크기/순서가 일치했다. 원본/분석 파일을 수정하지 않았다.

| 직접 열람 | 단계 | Screen ID·원본 파일 | 원본 관찰과 현재 대응 |
| --- | --- | --- | --- |
| [x] | F083/01 | [sc_07904520440b4dc7ad7d6d31bf3a03e9](<../../../bonsai_analysis/flows/Logging in/screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>) | 공개 랜딩의 Log in·이메일 CTA·인물/청구서/비용 그래픽. 계정 데이터와 분리된 기존 공개 화면 유지 |
| [x] | F083/02 | [sc_9d353458318e43e7b25ebbf88fefeaa9](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | Changelog 6개 발췌·내부 스크롤 영역, Google/Apple, Email/Password, 미체크, Log in, 복구 링크2개 |
| [x] | F083/03 | [sc_5c0fde91fbb34480b756c6eb10e63816](<../../../bonsai_analysis/flows/Logging in/screens/03_sc_5c0fde91fbb34480b756c6eb10e63816.png>) | 비밀번호 마스킹/입력 초점·미체크. 로그인에 눈 아이콘/강도 표시를 추가하지 않음 |
| [x] | F083/04 | [sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9](<../../../bonsai_analysis/flows/Logging in/screens/04_sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9.png>) | 비밀번호 초점과 구별되는 녹색 CAPTCHA 체크. 로컬 체크는 실제 CAPTCHA 통과가 아님 |
| [x] | F083/05 | [sc_3982bd8e06b44860bdb8c4bac2592599](<../../../bonsai_analysis/flows/Logging in/screens/05_sc_3982bd8e06b44860bdb8c4bac2592599.png>) | Joe의 인증 후 프로젝트/재무 대시보드. 앱 진입은 유지하되 현재 표본/빈 요약과의 차이는 G11/G14/G72 대기 |
| [x] | F085/01 | [sc_25261ff6e5d44d70885c07b053f29685](<../../../bonsai_analysis/flows/Logging out/screens/01_sc_25261ff6e5d44d70885c07b053f29685.png>) | Joe Studio 제목·Help Center/Perks/Team/Subscription/Settings/Logout 6행. 제목 누락 수정; 현재 workspace 표본·로고 차이 대기 |
| [x] | F085/02 | [sc_b8e249247d5942d8a2d91a38aa7b9d19](<../../../bonsai_analysis/flows/Logging out/screens/02_sc_b8e249247d5942d8a2d91a38aa7b9d19.png>) | 빈 폼·미체크·Signed out successfully.와 닫기. 공개 랜딩으로 보내지 않는 로컬 흐름 확인 |

원본 7장은 모두 **2880×1800 이미지 px**, MCP metadata는 **1440×900**이다. 직접 이미지 도구에서 전체 장을 열어 구성/문구/상태를 보았으며 도구 표시 축척을 CSS px 또는 DPR로 확정하지 않았다. 이번 구현 브라우저 viewport/배율/scrollY/픽셀 비교 축척은 **미측정**이다. 캡처·비교 이미지 경로는 **없음(이번 파일 생성 금지)**이며 과거 파일을 새 증거로 재사용하지 않았다.

### 4. 원본·분석·계획·코드 대응과 수정

| 구분 | 코드/책임 | 판단·원인·조치 |
| --- | --- | --- |
| 구현 보완 | [useLogin](../../../FE/user-web/src/features/mock-auth/hooks/use-login.ts), [LoginPage](../../../FE/user-web/src/pages/login/index.tsx) | 문자열 오류와 raw CAPTCHA setter 때문에 수정 후 오류가 남고 필드 접근성 연결이 없었다. 필드별 issue, 수정한 오류 해제, scope 변경 초기화, aria-invalid/describedby 및 렌더 후 잘못된 입력 초점을 연결했다. |
| 구현 보완 | [auth-controls](../../../FE/user-web/src/features/mock-auth/components/auth-controls.tsx) | 처리 중 취소와 종료 후 제출에 초점이 이동하지 않았다. 로그인/로그아웃 공통 AuthPendingCancel을 연결하고 CAPTCHA 오류 live 안내를 추가했다. signup 진행 기능은 유지한다. |
| 구현 보완 | [인증 경계](../../../FE/user-web/src/pages/auth-boundary/index.tsx), LoginPage | Resend Verification Email 및 안내의 로그인/가입 링크가 returnTo를 버렸다. 기존 안전 내부 경로 함수로 query/hash를 보존하고 location.state의 선택 인계를 유지했다. 실제 메일은 보내지 않는다. |
| 구현 보완 | [AccountMenu](../../../FE/user-web/src/features/mock-auth/components/account-menu.tsx), [AppShell](../../../FE/user-web/src/app/layouts/app-shell.tsx), [auth.css](../../../FE/user-web/src/styles/auth.css) | 일반 계정에 workspace 제목이 빠져 있었다. 회사 저장소의 현재 이름을 props로 전달하고 없으면 현재 session workspace 이름을 사용한다. 다른 계정에도 Joe Studio를 고정하지 않는다. 원본 Joe Studio/로고 표본 동일성은 미완이다. |
| 구조 보완 | mock-auth/preview/company-setup 공개 index | 수정 page와 AppShell의 직접 내부 파일 접근을 공개 export로 연결했다. company-setup index는 저장소를 새로 만드는 것이 아니라 기존 hook 하나를 노출한다. |
| 유지 | LoginChangelog/AuthNotice/AuthStore/WorkspaceBoundary/TwoFactorPage | 두 열·발췌/스크롤 컨테이너·숨김 label/placeholder·비밀번호 마스킹·소셜2·빈 로그아웃 폼/안내·보호 URL/계정 ID·선택 인계/2FA 취소 수명을 유지했다. 실제 환경 동작/시각 완료로 간주하지 않는다. |
| 정식 회귀 | [login-entry.test.tsx](../../../FE/user-web/src/app/router/login-entry.test.tsx) | 실제 App/provider/router/history로 G11 11개 회귀를 추가했다. URL 이동을 mock 함수로 바꾸지 않는다. jsdom 미지원 측정/native dialog 표시만 보완하며 실제 브라우저로 보고하지 않는다. |

**현재 CSS 값(원본 측정값 아님):** login-columns 842px, 342/400px 열·100px gap; 카드 width400px/padding62px 40px 60px/min-height718px; 제목26px/700/line-height1.3; Changelog Arial 14px/1.4·scroll height418px; 메뉴width200px; 새 제목padding9px 12px/font14px600; toast400px/right26px/bottom92px. 인증 기본 Gellix/Arial, background#fbfcfb/green#168b00, 카드radius10px·border#cbd1ce 등은 현 구현값이다. 원본의 정확 폰트/수치·자산·줄바꿈·촬영 조건을 확인한 값이 아니다. 녹색 입력 경계 외 접근성 focus outline, Local preview check, 목 도구/샘플 계정, 이니셜 아바타, toast 위치/크기/기간의 차이도 대기에 포함한다.

### 5. R4 6항목과 공통12기준 판정

관찰 항목의 “비교 완료”는 해당 주요 구성/상태 대조가 끝났다는 의미이며 시각 동일성이나 전체 완료가 아니다.

| 항목 | 판정 | 근거·잔여 |
| --- | --- | --- |
| R4-F083-O01 | 비교 완료·구현 보완 | Changelog/로그인 두 열·Google/Apple·placeholder와 숨김 label 유지. 필드별 오류·CAPTCHA 수정·접근성 연결 보완; 실제 스크롤/치수/시각은 대기 |
| R4-F083-O02 | 구현 보완 필요 | 입력 초점/미체크/체크와 인증 후 앱 진입을 구분해 DOM 검증. 원본 Joe의 프로젝트/재무 대시보드와 현재 Alex/Blair·빈 요약 데이터는 다름; G11/G14/G72 대기 |
| R4-F083-A01 | 분석 대기 | 잘못된 비밀번호·잠금·소셜·CAPTCHA 실패/만료·실제 인증 정책 및 Changelog 정밀 스크롤/치수는 미확인. 실패/취소·2FA는 명시적 목 |
| R4-F085-O01 | 비교 완료·구현 보완 | 빠졌던 일반 계정 메뉴 제목을 현재 회사/workspace 이름으로 연결하고 여섯 행 유지. 실패·취소 초점/세션 유지 검증. Joe Studio 표본/로고·정확한 메뉴 재현은 대기 |
| R4-F085-O02 | 비교 완료·유지 | 성공 뒤 공개 랜딩이 아닌 빈 로그인·미체크·Signed out successfully. 유지. 보호 URL·뒤로/앞으로 차단과 동일 계정 재로그인 DOM 검증 |
| R4-F085-A01 | 분석 대기 | 메뉴 위치/너비/그림자·토스트 지속시간/다른 탭·기기 폐기 원본 미확인. 현재 탭의 메모리·수동 dismiss는 목; 실제 브라우저/정밀 시각 대기 |

| 공통 기준 | G11별 판정(전역 기준 완료 아님) |
| --- | --- |
| R4-C01 | 식별 대조 수행: F083 5/F085 2단계 직접 PNG 열람, ANALYSIS2/PNG7 해시·MCP순서 일치. 저장된 Latest/2146 채택; 이번 MCP 버전·촬영 환경 미확인 |
| R4-C02 | 주요 구성 대조 수행: 랜딩 정적 그래픽/두 열 인증/인증 후 앱/메뉴/성공 toast 분리. 대시보드 데이터·실제 레이아웃/겹침은 부분·대기 |
| R4-C03 | 주요 제어 대응 수행: Changelog·소셜2·입력2·체크·로그인/복구2·계정 메뉴6·토스트 연결. 배경과 작은 요소 전수 계수/요소ID 명세는 미완 |
| R4-C04 | 문구·placeholder·숨김 label·체크/마스킹·Signed out successfully. 대조. 현재 Alex/Blair/Studio A/B·Local preview check와 원본 Joe Studio/CAPTCHA 자산·줄바꿈은 다름 |
| R4-C05 | 현재 CSS 342/400 열·100gap·카드400/최소718·Changelog418·메뉴200·toast400을 구현값으로 기록. 원본2880×1800/MCP1440×900와 CSS viewport/DPR를 동일시하지 않음; 픽셀 비교 미실행 |
| R4-C06 | 현재 Bonsai Public Gellix/Arial 선언과 제목26px/700을 기록. 원본 폰트 파일·weight·행간/자간/줄바꿈 동일성 미확인 |
| R4-C07 | 카드#fbfcfb·강조#168b00·카드border/radius/shadow는 기존 구현값. 새 제목9px12px/14px600 등 추정 유지; 표본색/픽셀·focus 외곽 동일성 대기 |
| R4-C08 | 기존 로고/Google/Apple/잎사귀 경로 유지; Local CAPTCHA/이니셜/Lucide toast 아이콘은 대체 표시. Joe 아바타·정확 자산/비율/crop 대기, 새 자산 생성 없음 |
| R4-C09 | 빈 값·잘못된 credential·수정·실패재시도·처리/중복·취소·늦은 응답·선택 social/2FA DOM 검증. 잠금/실제 OAuth·CAPTCHA·만료 정책은 미관찰 목 또는 미구현 |
| R4-C10 | 실제 Router/history DOM의 직접URL/query/hash/뒤로·앞으로/복구 경계/로그아웃→로그인 검증. native navigation을 mock으로 바꾸지 않았지만 실제 브라우저/새탭/스크롤은 미검증 |
| R4-C11 | 입력은 폼 수명, 실패/시도취소는 보존, 이탈/실행 차수 변경은 폐기. 같은 계정·선택 인계만 메모리 저장소에 연결. 서버/다른 탭 영속성은 없음 |
| R4-C12 | G01/G02/G10/G12진입/G13설정경계/G14 및 회사명 읽기만 연결. 전체208 회귀; 관련 Goal 전체 R4/시각/브라우저·R02 완료로 승격하지 않음 |

### 6. 실제 검증과 산출물 제한

실행 Node **v24.18.0**, pnpm **8.14.1**; package 요구 Node>=24<25/pnpm8.14.1과 일치했다. 기본 tsc -b/Vite/Playwright 명령은 쓰기 산출물이 있어 그대로 실행하지 않았다.

| 검사 | 이번 결과 |
| --- | --- |
| 결함 재현 | 신규 테스트 초회 준비에서 PowerShell 문자 인코딩/중복 helper 오류가 있었다. UTF-8 전달로 정식 테스트 파일만 수정했다. 이후 4개 결함 회귀 모두 실패하여 aria/취소 초점/returnTo/제목 누락을 확인했다. 수정 후 1개 이름 기대값을 실제 seed Alex (preview)에 맞춰 정정했다. |
| G11 대상 | 11/11 통과, 24.62초. 빈 입력/오류·CAPTCHA 수정, 처리 취소/중복/늦은 결과, 메일 안내/가입/재설정 복귀, 로그아웃 실패/취소/성공/재로그인, 실패 보존·합성IME, scope/Escape/외부 클릭, 선택 인계 격리, Google/Apple 명시 선택, 2FA, 새 provider/안전 URL/미완료 설정. |
| 전체 단위/DOM | **34파일208/208 통과, 164.02초**. G10가입9·공개/가격/기사/템플릿/청구서/도움말/회사 연결 및 auth/reset/회사/workspace/권한/업무 저장소의 기존 회귀 포함. |
| 타입 | app/node 두 tsconfig 모두 --noEmit --incremental false 통과. |
| lint | eslint . --no-cache 통과, 오류·경고 출력 없음. |
| 메모리 build | 1973 modules/3 outputs, write:false, 8.54초 통과. 파일 output/dist/HTML/JSON 보고서 생성 없음. |
| 경고 | 테스트/build의 기존 Browserslist 데이터 경고는 보존했다. 패키지/lockfile/cache 갱신 명령은 실행하지 않았다. |
| 브라우저 연결 | 도구 목록에 브라우저 제어 없음, document sessions 없음, 9222/9223 listener 없음, 실행 Chrome/Edge에 remote-debugging flag 없음. 새 브라우저/프로필을 생성하지 않았다. |
| 미리보기 | 기존 127.0.0.1:5173 PID30272의 /login HTTP200·Vite client 확인. 별도 5174 PID22864와 ENV/서버 설정 보존. HTTP 응답 확인은 화면/console/network 관찰이 아니다. |
| 실브라우저/시각 | 미실행. 실제 키보드 순회·native dialog focus trap·스크롤·좁은 폭·확대·OS IME·직접 URL/reload/back/forward 및 실제 navigation은 환경 대기다. DOM history/합성 composition·provider 재조립을 각각 구분했다. |
| 실제 API/console | 직접 관찰 미수행. **실제 요청 수=null/미검증**이며 실패한 요청을 제외하거나 차단으로 숨기지 않았다. 코드의 로컬 저장소 사용 검토를 “브라우저 API0/console0”으로 바꾸지 않는다. |

실제 실행한 파일 비생성 명령:

```powershell
# 작업 디렉터리: FE/user-web
$env:NODE_DISABLE_COMPILE_CACHE = '1'
$env:JITI_CACHE = 'false'
$env:JITI_FS_CACHE = 'false'
pnpm.cmd exec tsc --project tsconfig.app.json --noEmit --incremental false --pretty false
pnpm.cmd exec tsc --project tsconfig.node.json --noEmit --incremental false --pretty false
pnpm.cmd exec eslint . --no-cache
```

테스트는 임시 스크립트 없이 PowerShell here-string → `node --input-type=module`로 다음 API를 메모리 실행했다. 대상 FILTERS는 `["src/app/router/login-entry.test.tsx"]`, 전체는 `[]`이다.

```js
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { startVitest } from 'vitest/node';
const ctx = await startVitest('test', FILTERS, {
  config:false, run:true, cache:false, pool:'threads', execArgv:[], maxWorkers:2,
  environment:'jsdom', include:['src/**/*.test.{ts,tsx}'], setupFiles:['./vitest.setup.ts'],
  reporters:['default'], coverage:{enabled:false}, experimental:{fsModuleCache:false},
  deps:{optimizer:{client:{enabled:false},ssr:{enabled:false}}}
}, {
  configFile:false, plugins:[react()], resolve:{alias:{'@':path.resolve('src')}},
  optimizeDeps:{noDiscovery:true,include:[]}, server:{watch:null}
});
if (!ctx) process.exitCode=1;
await ctx?.close();
```

메모리 build도 같은 방식으로 Vite `build({configFile:false,plugins:[react()],resolve:{alias:{'@':path.resolve('src')}},css:{postcss:{plugins:[tailwindcss(),autoprefixer()]}},build:{write:false,emptyOutDir:false,copyPublicDir:false,reportCompressedSize:false,sourcemap:false}})`를 실행했다. 설정 bundle/temp 모듈, dependency optimizer/fsModuleCache/coverage/파일 reporter·compile cache를 사용하지 않으며 postcss도 API로 직접 주입했다. 정상 앱 미리보기를 새로 시작하거나 임시 브라우저를 만들지 않았다.

- [x] 정식 FE 소스와 정식 G11 회귀 테스트, 기존 계획 문서만 작성했다. 새 파일은 company-setup/index.ts와 login-entry.test.tsx다.
- [x] evidence/tmp/임시 스크립트/캡처/비교 이미지/영상/trace/보고서/manifest/원시 응답/로그·새 결과 문서 없음. 도구 결과는 대화/메모리에서만 처리했다. 만들었다가 지우는 방식이나 기존 증거 파일 수정·삭제·복원을 하지 않았다.
- [x] 목 장애는 독립 테스트 provider에서만 변경하고 종료 시 unmount했다. 기존 미리보기의 목 설정/서버/ENV를 변경하지 않았고 기본 AuthStore scenario normal은 유지한다.

### 7. ENGINEERING_REVIEW_CHECKLIST 적용 결과

| 기준 | 이번 판정·코드/검증 근거 |
| --- | --- |
| 범위/출처 | [x] G11/직접 소비·원본7장·목 가정/미확인 구분. [ ] 원본 미수록 정책 해소는 R02/G11 대기. |
| 구조/컴포넌트 | [x] page/hook/store/props 역할·공개 import·제어 입력 수명 분리. 새 UI 라이브러리/범용 프레임워크·앱 간 직접 import 추가 N/A. |
| 데이터/목 | [x] 기존 동일 계정/intent snapshot/revision 사용; 실패·취소·재로그인/다른 workspace 회귀. 실제 API/live fallback/확정 DB 타입 N/A(이번 FE 전용 금지). |
| 상태/비동기 | [x] 제출 입력 고정·중복·취소·이탈·scope 변경·늦은 결과 보존을 11개 DOM 및 기존 AuthStore 회귀에서 검증. 금액/집계 변경 N/A. |
| 웹 접근성 | [x] 오류 연결·label·초점 이동/복원·Escape/외부 클릭·합성IME·실제 Router/history DOM 검증. [ ] 실제 키보드/모달/스크롤/좁은 폭/확대/OS IME·보조기기 대기. |
| 주석/타입/보안 | [x] 변경 책임 주석·복잡한 제출 번호 주석, strict 타입/lint, listener/abort 정리, 비밀번호 URL/history/localStorage/sessionStorage 비노출 회귀. 서버 보안/권한은 N/A. |
| 검증/인계 | [x] 타입/lint/208단위·DOM/메모리build 및 관련 기록·색인 갱신. [ ] 실제 브라우저 E2E·시각·console/network 미검증; Admin/배포/실영속성 N/A. |

### 8. 잔여와 후속 담당

| 체크 | 미완료·미검증 항목 | 이유·후속 담당 |
| --- | --- | --- |
| [ ] | 정확 폰트·수치·색·아이콘/아바타·CAPTCHA·배율/촬영 조건·픽셀 동일성 | 브라우저/확정 자산 근거 부족. G11/R02, 공통 G01/G14; 작은 차이로 완료 처리하지 않음. |
| [ ] | Joe Studio/인증 후 프로젝트·재무 대시보드 표본 동일성 | 현재 Alex/Blair workspace/회사와 데이터가 다름. 제목은 현재 동일 회사 객체를 표시한다. G11/G14/G72에서 원본 버전·계정 표본을 분리해 보완. G72 신규 작업 미착수. |
| [ ] | Changelog 내부 스크롤/잘림·응답형·메뉴 shadow/position·toast 기간·긴 한국어 시각 | DOM/CSS 대조만으로 브라우저 배치·픽셀 판정 불가. G11/G01/G14와 환경 검증 G84. |
| [ ] | 실제 브라우저 조작·reload/새탭/history·native 모달/키보드·OS IME·console/network/API0 | 연결 세션이 없고 새 profile/cache/evidence 생성 금지. G11 및 직접 연결 G01/G10/G12/G13/G14·G84. |
| [ ] | 소셜 계정 연결·오류/잠금/2FA 생략·CAPTCHA 만료/실패·다른 탭/기기 세션 폐기 | 캡처에 없음. G11/R02 후속 조사. 현재 구현은 명시 선택 로컬 identity/코드123456/350ms·slow1500ms/한번 실패·수동 toast dismiss/탭 메모리 가정. 서버/API/DB 구현이나 계약 확정 없음. |
| N/A | 실제 인증/OAuth/메일/CAPTCHA·DB·배포 검증 | 현재 FE UX/UI 단계 금지 범위. 목 성공을 실제 서비스·출시 완료로 표현하지 않음. |

R4 관찰4항목은 주요 구성 대조 및 유지/보완/후속 구현 필요로 구분했다. 분석2항목과 공통 기준의 정밀 미확정은 [ ] 상태다. 기존 G/R 전체 [x] 이력을 현재 검증으로 대체하거나 연결 Goal을 완료로 승격하지 않았다.

### 9. 직접 확인할 미리보기 순서

1. 기존 **http://127.0.0.1:5173/login** 접속 → 빈 Log in 제출 → Email/Password 오류 초점 → alex@example.test / PreviewOnly123! 입력 → 체크 없이 제출 → 체크 후 오류 해제.
2. Local authentication scenarios를 Slow로 선택 → Log in → Cancel login에 초점 → 취소 후 Log in 초점/입력 보존 확인 → Normal로 복원 후 로그인.
3. 우측 Alex 프로필 → 현재 회사명(기본 Studio A)과 여섯 행 확인 → Logout → 빈 로그인/미체크/Signed out successfully. → 안내 닫기 → 뒤로·보호 /app URL의 로그인 복귀 → 같은 표본 재로그인.
4. `/login?returnTo=%2Fapp%2Fclients%3Ffrom%3Dmanual%23list`에서 Resend Verification Email → Return to login, Reset Password → 로그인 복귀 후 로그인해 query/hash 보존 확인.
5. Google/Apple은 모달 취소 시 그대로, Continue with sample identity에서만 로컬 계정 진입. 선택적 2FA는 Local authentication scenarios에서만 켜고 종료 후 Normal로 복원.
6. 실제 브라우저 검증이 가능해지면 위 흐름의 console/network와 좁은 폭/키보드/스크롤/IME·동일 조건 시각 비교를 수행한다. 이 순서는 인계이며 이번 브라우저 통과 기록이 아니다.

커밋·push·배포 없음. 이번 G11 범위 결과·체크 이후 종료하며 다음 Goal을 자동 시작하지 않는다.

### 10. 최종 문서·변경 범위 검토

- [x] 기존 계획 Markdown170개/JSON1개 링크·anchor 및 PLAN-INDEX의 상태를 검사했다. 이번 수정 문서41개, 새 링크 오류0. 기존 오류221건은 과거 증거 경로 등 기존 이력이며 이번 범위에서 수정·삭제하지 않았다.
- [x] G11 명세/대응표/색인의6개 상태·공통12·최상위 status/workflow_review·결과 링크가 일치한다. 다른449개 R4 항목·모든 기존 verification과 [x] 줄·107개 실행 순서·85G/22R/134흐름/754단계/642고유ID를 보존했다.
- [x] git diff --check 통과. 새 파일은 정식 login-entry.test.tsx와 company-setup/index.ts만이다. FE 소스/관련 기존 계획 문서 외 변경·원본/기존 evidence 변경 없음. 현재 HEAD는 시작 a842c463 그대로이며 커밋·push·배포는 하지 않았다.
- [ ] G11 전체 완료는 아니다. 8절의 미완료/미검증과 연결 G/R의 대기를 그대로 유지한다.

<a id="g11-precommit-review"></a>
## G11 커밋 전 재검토 — 2026-11-24 KST

후속 사용자 요청 “검토 다시 해주고, 이상이 있으면 작업해줘. 이상이 없는 경우 깃 커밋”에 따른 추가 검토다. 앞선 커밋 미실행·208/208·11개 G11 회귀 기록은 최초 작업 종료 시점이며 보존한다. 이번에는 보완·검증 후 로컬 커밋이 승인되었다. push/배포·G12/G32 신규 구현은 범위 밖이다.

- [x] 추가 결함1: AccountMenu가 보호 경계의 redirect에만 의존해 /components·/share/sample에서 Logout을 누르면 세션만 지워지고 해당 화면에 머물렀다. 빈 로그인/성공 안내로 이어지지 않는 두 DOM 시나리오를 실패로 재현했다.
- [x] 수정: AuthStore.logout은 메모리에서 완료된 revision을 반환하고 AccountMenu는 현재 revision·빈 세션을 확인한 뒤 안전한 내부 returnTo(query/hash 포함)와 함께 /login으로 replace한다. 기존 실패/취소/이탈은 세션·경로를 바꾸지 않으며 이전 결과로 새 세션을 덮지 않는다. 이 반환값은 FE 로컬 함수 타입이며 실제 API 계약/인증 연결이 아니다.
- [x] 추가 결함2: 회사 이름 저장 후 AppShell 메뉴는 새 이름을 읽었지만 PreviewFrame의 공통/공유 메뉴는 이전 session workspace 이름을 표시했다. 같은 ID의 회사 저장 전/후를 실제 폼·저장 버튼·라우터로 확인해 세 번째 DOM 실패로 재현했다.
- [x] 수정: PreviewFrame도 AppShell과 같은 회사 저장소에서 현재 workspace의 저장된 이름을 읽어 AccountMenu에 전달한다. 저장 전 초안은 메뉴에 반영하지 않고, 다른 사용자/workspace의 이름을 섞지 않는다. G15 저장 로직은 변경하지 않고 직접 소비 결과만 검증했다.
- [x] 기존 정식 login-entry.test.tsx에 공통/공유 로그아웃2건·저장 회사명 일관성1건을 추가했다. 재현3/3 실패 후 G11 14 + AuthStore 로그인6 = 대상20/20(30.41초) 통과. 테스트에 router/navigation mock은 없으며 jsdom 결과를 실제 브라우저로 표현하지 않는다.
- [x] 전체34파일 **211/211(161.40초)** 통과. 최초208/208 이력을 보존하며 이번 재검토에서 같은 코드의 가입/공개 인계/재설정/회사/workspace·업무 회귀를 다시 실행했다.
- [x] app/node 타입 검사(--noEmit --incremental false), lint(--no-cache) 통과. 메모리 build(write:false,1973모듈/3output,15.49초) 통과. 파일 비생성 명령은 위6절과 같고 추가 대상 FILTERS는 login-entry.test.tsx와 features/mock-auth/data/login.test.ts다.
- [x] 최초 분석2개/PNG7개의 해시·크기는 다시 일치했다. 이번 추가 검토에서 MCP를 새로 조회하거나 PNG7장을 새로 시각 검토한 것으로 계산하지 않는다. 앞선 직접 열람과 원본 판정은3절을 따른다.
- [x] 브라우저 도구/연결 문서 세션 및 기존 Chrome/Edge remote-debugging flag 없음,9222/9223 listener 없음. 기존5173/PID30272·별도5174/PID22864 보존, /login HTTP200/Vite client 확인. 새 프로필/캐시/증거/스크립트·결과 파일 생성 없음.
- [ ] 원본 폰트/자산/픽셀·Joe 표본/대시보드·실제 브라우저/console/network/OS IME·미수록 원본 정책은8절의 담당/대기를 유지한다. 실제 API 요청 수는 null이고 G11 전체 완료가 아니다.

이번 추가 판정: R4-F085-O01은 회사 이름의 공통/공유 소비까지 구현 보완, R4-F085-O02는 기존 **비교 완료·유지**에서 **비교 완료·구현 보완**으로 갱신한다. 나머지4항목과 원본 분석 대기는 바꾸지 않는다. 공통 R4-C10/C11/C12는 추가 로그아웃 복귀·저장 회사명 일관성의 DOM 근거를 연결한다.

직접 확인: http://127.0.0.1:5173/login 에서 Alex 표본 로그인 → /components 또는 /share/sample → 프로필 Logout → 빈 로그인/미체크/성공 안내. 회사명은 /app/settings/company에서 편집 후 저장하고 /app·/components·/share/sample 메뉴가 동일하게 바뀌는지 확인한다. 이 순서는 브라우저 검증 인계이며 이번 실브라우저 통과 기록이 아니다.

- [x] 커밋 전 최종 문서 검사:170 Markdown/1 JSON, 관련 수정43문서, 기존 링크 오류221/현재221/신규0. 과거 완료 체크·verification·다른449개 R4와107실행순서를 보존했다. 최상위 status/workflow_review와 추가 검토 링크·G11 14/전체211·시각/브라우저 대기가 일치한다.

<a id="g12-update"></a>
## G12 적용·연결 검토 — 2026-11-24 KST

- [x] 복구→인증 메일 안내 우회의 returnTo 누락을 보완했다. 빈 로그인/미체크·자동 인증 없음·이전 비밀번호 거부/새 암호 같은 ID 로그인과 G11 DOM14를 회귀했다. G11 시각/브라우저/대시보드 대기는 유지한다. [상세 판정·근거](G12_RESULT.md#g12-r4-recheck).

- [ ] 원본 동일성·실제 브라우저/네트워크·미수록 정책은 대기다. 관련 G/R 전체 완료가 아니며 후속 담당은 G12 결과8절을 따른다.

> G12 커밋 전 추가 검토: 같은 경로에서 복귀 주소·이력/선택 문맥이 바뀌어도 이전 요청 안내·비밀번호 저장이 완료되는 두 결함을 재현하고 수정했다. G12 DOM11+store7=18/18, 전체225/225·타입/lint·메모리build 통과. 이전223 기록과 다른 Goal 대기는 보존하며 사용자 후속 요청으로 로컬 커밋만 승인되었다. [최신 결과](G12_RESULT.md#g12-precommit-review).


<a id="g13-update"></a>
## G13 적용·연결 검토 — 2026-11-24 KST

- [x] 로그인 DOM14 및 G13 완료 회사의 로그아웃→같은 계정 재로그인·company ID/목적지 유지까지 확인했다. 미완료 계정의 경계와 전체 시각/브라우저 대기는 유지한다.

- [ ] 원본 동일성·실제 브라우저/console/network·OS IME와 원본 미수록 정책은 대기다. 관련 G/R 전체 완료가 아니다. [범위·검증·잔여](G13_RESULT.md#g13-r4-recheck).

> G13 커밋 전 추가 검토 — 2026-11-24 KST: 초기 대시보드에서 같은 경로로 이동할 때 로딩이 남는 결함을 재현·수정했다. G13 DOM10/company store4=14/14, 최종 전체36파일236/236·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저·원본 미수록 대기와 과거 이력을 보존하며 사용자 후속 요청으로 커밋·origin/main push를 승인받았다. 배포·다음 Goal 착수 없음. [추가 검토 결과](G13_RESULT.md#g13-precommit-review).
