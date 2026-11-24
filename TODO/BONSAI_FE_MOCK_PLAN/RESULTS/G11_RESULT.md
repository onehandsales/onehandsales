# G11 로그인·로그아웃 실행 결과

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
