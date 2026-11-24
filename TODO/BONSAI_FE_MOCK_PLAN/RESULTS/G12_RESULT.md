# G12 비밀번호 재설정 실행 결과

> 현재 G12 — 2026-11-24 KST: **부분 완료**. 원본10PNG/MCP·현재 복구 코드를 대조하고 오류·취소 초점·인증 메일 복귀·링크 초안/저장 경합·표본색을 보완했다. 전체223/223·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저/network·미수록 정책은 대기다. 커밋/다음 Goal 착수 없음. [범위·체크·잔여](G12_RESULT.md#g12-r4-recheck).


> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 요청·가상 링크·새 비밀번호·완료 후 빈 로그인을 구현하고 두 차례 검토했다. 현재 가능한 관련 개발/빌드 회귀 검사를 마쳤다. 메일·실제 토큰·외부 API 없이 같은 메모리 계정의 credential만 바꾼다.

## 근거·범위

R02 신규 MCP 조회 중 Resetting password `8f9cc02b-1748-4b71-97d8-5c80bb299013` 01~10. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, Latest/2146 카탈로그는 이번 G05 조회 재사용, 촬영일/빌드는 미확인. [Screen ID/순서](evidence/r02/mcp-sources.json), [PNG/해시](evidence/r02/source-manifest.json), [R02](R02_RESULT.md). ANALYSIS/10개 PNG를 직접 봤고02/05/08/10은 전체 크기로 재확인했다. 보관 HTML403은 확보로 표시하지 않는다.

관찰: 이메일+CAPTCHA 요청, 회색 발송 안내, New Password 단일 필드, Whoops!/Password is too weak 후 빈 입력, 재입력 중 오류 유지, 완료 후 빈 Email/Password·미체크 CAPTCHA·성공 토스트. 마지막10단계 Changelog가 앞 로그인 버전과 다르므로 해당 완료 화면의 보이는 발췌만 별도로 사용했다. 이것을 비밀번호 변경이 실제 제품 업데이트를 일으키는 정책으로 해석하지 않는다. 메일함/실제 링크·만료·강도 알고리즘은 미수록이다.

## 구현·목 정책

- `/password/reset`: `ResetRequestPage`/`useResetRequest`. 이메일·로컬 체크·실패/취소·안내를 구별한다. 원본 안내 문구는 `Local simulation · no email was sent` 표시와 함께 재현한다. 실제 발송 성공으로 쓰지 않는다. Resend Verification Email은 G11의 별도 인증 안내이며 재설정 재발송 버튼이 아니다.
- `/password/new`: `NewPasswordPage`/`useNewPassword`. 메모리 도전과 현재 이력의 ID가 일치할 때만 입력을 허용한다. missing/expired/used는 안내와 새 요청으로 복구한다. 실제 메일 토큰/비밀을 URL에 넣지 않는다.
- 샘플 계정이면 같은 actorId로 가상 링크를 만든다. 없는 이메일에도 일반 요청 안내를 보여 주되 실제 계정이나 유효 링크를 만들지 않는다. 안내 밖의 목 도구에 로컬 샘플 링크 부재를 분명히 표시한다. 이는 실제 계정 열거/서버 정책이 아니다.
- 로컬 링크는 valid/expired/used. 명시적 만료·새 요청·취소/영역 이탈·Reset/세션 차수·refresh/새 탭으로 수명이 끝난다. 새 요청이 이전 지연 요청보다 우선한다. 새 링크를 만들면 이전 ID는 사용할 수 없다. 수치 TTL/메일 재발송 제한은 근거 없이 확정하지 않는다.
- 기본350ms/slow1500ms/fail-once, 실패 후 입력 보존/중복 제출 차단/늦은 결과 무효화. 약한 비밀번호만 원본처럼 비우고 오류를 재입력 중 유지한다. 오류 제출이 끝나 활성화된 입력으로 초점 복귀. 일반 실패·사용자 Cancel password change에는 입력을 보존하며 경로 이탈은 폐기한다.
- 최소10자와3개 문자 분류·최대128자는 G10의 명시적 목 강도 규칙을 사용한다. 실제 Bonsai 강도 알고리즘은 아니다. 비밀번호 원문은 폼에만, digest는 같은 계정의 메모리에만 저장한다. 성공은 이전 비밀번호가 거부되고 새 샘플 비밀번호로 같은 ID에 로그인하는지 검증한다. 자동 로그인하지 않는다.
- 성공 시 현재 탭에 세션이 있었다면 해제한다. 다른 기기 세션/실제 계정은 다루지 않는다. 익명 상태에서는 공개 intent를 유지하기 위해 불필요한 인증 revision 변경을 하지 않는다. 다른 사용자 상태를 계속 보존하도록 전체 reset을 해제한 것이 아니다.
- 요청→링크→성공의 browser history에는 메모리 ID/기존 publicIntentId만 전달한다. 성공 시 `resetCompleted`로 로그인 이메일 자동 채움을 막아 빈 폼을 유지하면서 별도 선택 요약은 보존한다. 가격→가입→로그인→복구→로그인→선택 요약을 실제 navigation으로 확인한다. G14 최종 목적지/로그아웃 왕복은 후속 연결 대기다.
- 완료 계정의 변경된 digest는 같은 탭 로그아웃 후 유지, Reset/refresh/새 탭은 기존 seed로 초기화한다. 요청 이메일·새 비밀번호·도전은 다른 actor/workspace 실행 차수로 넘어가지 않는다.

## 두 차례 검토·수정

1차: 같은 계정/최신 요청/취소·만료·재사용 경계를 검토했다. 인증 완료의 자기 revision 변경을 외부 취소로 오인하지 않도록 재설정 commit revision과 사용된 도전 ID로 완료 이동을 확인한다. 계정 전환에서 요청 이메일/안내를 지우고, 새로운 reset 요청이 늦은 예전 요청을 덮지 못하게 sequence를 도입했다. 실제 토큰·메일 없이도 위 경계는 독립 검증 가능하다.

2차: 첫 unit34/브라우저10 통과 후 원본10상태와 실제 캡처를 비교했다. 새 비밀번호 카드 하단을10px, 오류 폼의 간격을4px 보정했다. 실패 시 disabled였던 입력에 초점을 너무 일찍 주지 않도록 제출 종료 후 focus를 적용하고 오류 설명을 입력의 aria-describedby와 연결했다. 기존 테스트에 실제 포커스 조건을 추가했다. 원본 안내 옆의 로컬 설명·더 진한 색·목 도구는 의도적인 차이로 남겼다.

검토 판정과 테스트 통과를 구별한다. 알려진 저장/취소 결함을 G13으로 넘기지 않았다. 미수록 서버 정책은 후속 질문이며 UI 구현 중단 사유로 쓰지 않았다.

## 실행·원본 비교

FE/user-web의 Node24.18.0/pnpm8.14.1에서 `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`:34/34, `corepack pnpm build` 통과. 최종 JS783.78kB/gzip215.04kB, chunk500kB/Browserslist 경고 유지.

- 첫 관련 로그인/복구 `playwright test ... --workers=2 --reporter=line,json`:10/10. 최종 G01/G10/G11/인계 포함 개발23/23·빌드23/23 통과. [결과](evidence/g12/).
- `node scripts/capture-password-reset.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-password-reset.py`:01~10 비교10쌍,320/390/768과만료 상태, 총14캡처. 실제 정적 요청1726/API·외부·실패·console오류0. 요청 차단/모의 navigation 없음.
- [캡처 조건/요청](evidence/g12/browser-captures.json), [원본 경로/픽셀 차이](evidence/g12/visual-metrics.json), [pair/diff](evidence/g12/comparisons/). 원본2880×1800→1440×900 정규화, Chromium148/DPR1. 원본 viewport/DPR 확정이 아니다. RGB 차이는 합격률이 아니다.
- 추정·보정: 복구 카드 x520/y150/폭400, 안쪽318, heading26/line34, input40, CTA40, 기본본문16, 오류18/14. 배경white·테두리#cbd1ce, 초록#168b00는 원본 CSS 값이 아니다. 원본 약한 대비보다 진한색을 사용했다.
- 원본03/04의 실제 이메일 대신 alex@example.test, 비밀번호는 공개 샘플을 사용했다. CAPTCHA 체크/배지, 폰트 근사/Changelog 굵기·간격, 토스트 아이콘·몇px 위치, 안내 색/목 설명 높이, 추가 취소·도구가 다르다.

## 미검증·후속·확인 순서

원본 메일 수신/토큰 TTL/재발송 제한/다중 기기 세션·소셜 계정 복구·정확한 강도 규칙은 확인하지 않았다. 서버 정책을 확정하거나 API/DB를 설계하지 않았다. 원본 모바일, OS IME/VoiceOver/실기기/추가 브라우저 검증은 대기다. 합성 composition/CSS글자확대는 OS 검증이 아니다. G14에서 최종 공개 인증 왕복을 종합한다.

http://127.0.0.1:5173/login → Reset Password → alex@example.test/로컬 체크 → Send password reset email → 명시적 모의 안내 → Open local reset link → weak 제출/빈 필드 확인 → Replacement123! → Save New Password → 빈 로그인/성공 안내 → 이전 표본은 실패·새 표본은 같은 Alex 로그인. fail-once/slow/만료는 별도 목 도구에서 확인 후 Normal 복원. 새로고침하면 seed 비밀번호 PreviewOnly123!로 돌아간다.

기존5173 FE와 사용자/앞 단계 변경을 보존했다. Backend·실제 API·커밋·push·배포는 실행하지 않는다. G12 자체 검증 기록 뒤 G13을 이어간다.

## 최종 확인

최종 비교10쌍과320/390/768 화면을 직접 확인했다. 오류 간격/초점 수정 후 관련 회귀를 재실행했다.

- development-final: {'tests': 23, 'requests': 69113, 'violations': 0, 'failures': 0, 'consoleErrors': 0}
- production-final: {'tests': 23, 'requests': 609, 'violations': 0, 'failures': 0, 'consoleErrors': 0}

현재 수정 가능한 G12 동작 결함은 해결했다. 원본/환경·G14 종합 연결 대기를 유지하고 G13을 진행한다.

### G13 연결 회귀 (2026-11-21)

가입→사업 설정→동일 회사 저장에 가격 선택/공개 인계를 유지하고 로그아웃→같은 계정 재로그인 시 회사 정보 유지/이전 인계 폐기를 검증했다. 관련 dev·build26씩+최종 온보딩3씩. G14 최종 목적지/왕복과 기존 미수록·환경 대기는 유지한다. [G13](G13_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

이번 공통 수정의 영향을 기존 흐름 회귀로 확인했으며 원본·시각·환경 대기는 유지한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

<a id="g11-update"></a>
## G11 적용·연결 검토 — 2026-11-24 KST

- [x] 로그인→Reset Password→로그인 복귀의 query/hash 경계를 DOM 검증했다. 기존 reset 단위4개는 회귀했지만 G12 전체 원본/UI 재검토는 하지 않았다. [상세 판정·근거](G11_RESULT.md#g11-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록 정책은 대기다. 연결 G/R 전체 완료가 아니며 후속 담당은 G11 결과8절을 따른다.

> G11 커밋 전 추가 검토: 공통/공유 로그아웃→빈 로그인·저장 회사명 일관성 보완, G11 14/전체211 통과. 과거208 기록과 다른 Goal 대기는 보존하며 로컬 커밋만 승인되었다. [최신 결과](G11_RESULT.md#g11-precommit-review).

<a id="g12-r4-recheck"></a>
## G12 기존 구현·R4 재검토 — 2026-11-24 KST

**부분 완료: 원본10단계·코드 대조, 발견한 동작 결함과 표본색 보완, 단위/DOM 검증 수행. 원본 동일성·실제 브라우저·미수록 정책은 대기다.** 이전 검증 수치·완료 체크·evidence 링크는 당시 이력이며 이번 검증에 합산하지 않는다. 사용자 지시에 따라 새 evidence·tmp·스크립트·캡처·보고서·결과 문서를 만들지 않았다.

### 1. 범위·시작 상태

- 시작 HEAD `20436317e59af7fd8f057474bbe6ee7e0195d2fa` (G11), 작업 트리 clean. 기존 FE/사용자 변경과 G11 커밋 전 추가 검토의 시각·브라우저·원본 대기를 보존했다.
- 주대상 G12: 로그인→복구 요청→로컬 안내/명시적 샘플 링크→새 비밀번호→오류/재시도→빈 로그인→같은 계정 재로그인.
- 직접 연결 G01 입력/CAPTCHA/취소 초점/세션, G10 공통 강도·가상 계정, G11 복귀/재로그인, G13 setupComplete 경계, G14 보호 경로·세션, 선택한 공개 인계만 검증했다. 연결 업무 전체 재검토·G32 이후 착수 없음.
- FRONT README·006/구조/컴포넌트/상태/mock/접근성/주석/앱 컨벤션/테스트·ENGINEERING_REVIEW_CHECKLIST, AGENT README·PM036·UX025를 적용했다. 적용 경로의 AGENTS는 없고 BE/AGENTS는 범위 밖이다. AGENT_USAGE_RULES는 현재 없으며 읽었다고 기록하지 않는다.
- 계획 README·순서·START·UXUI·MOCK·USER-FLOW·MATRIX·BEHAVIOR·IMPACT·EXPANSION·PLAN-INDEX·G12/R02 명세/결과와 G01/G10/G11 기존 결과를 대조했다. 과거 실제 로그인/API 전환 규칙은006 및 이번 지시로 제외했다.

### 2. 원본·단계 확인 목록

[ANALYSIS](../../../bonsai_analysis/flows/Logging%20in/Resetting%20password/ANALYSIS.md) 및 기존 원본 `screens/01~10_*.png`를 모두 `view_image`로 직접 열람했다. 원본은 수정하지 않았다. 아래 [x]는 **이미지 열람과 주요 상태 대조**이지 픽셀 일치 인증이 아니다.

Flow ID `8f9cc02b-1748-4b71-97d8-5c80bb299013`, Bonsai Web 앱 `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`.
2026-11-24 Gummble `gummble_get_flow_screens` 재조회:10개 ID·순서·원본 URL·1440×900 메타데이터가 저장된 원본 색인과 일치했다. 응답 이미지 블록은 별도 시각 근거로 계산하지 않으며 로컬 PNG를 직접 봤다. 응답에 카탈로그 버전은 없었다. 기존 ANALYSIS의 Latest/2146을 저장본 출처로 채택하고 제품 빌드·촬영일·OS·DPR·배율·폰트는 미확인으로 유지한다. PNG10의 SHA-256/2880×1800과 ANALYSIS LF 정규화 해시도 SOURCE_ANALYSIS_INDEX와 일치했다. 원본을 재다운로드하지 않았다.

| 열람 | Screen ID | 관찰한 주요 상태 |
| --- | --- | --- |
| [x] 01 | `sc_9d353458318e43e7b25ebbf88fefeaa9` | 빈 로그인/Reset Password 진입 |
| [x] 02 | `sc_682da57b2dd148c6b455af1a8aa229fc` | 이메일·미체크 CAPTCHA·발송 |
| [x] 03 | `sc_7ac8efa85ddf46ffb99647670f126feb` | 이메일 입력·미체크 유지 |
| [x] 04 | `sc_85c7828ac6694af5abfedb3f9fd93a6a` | 이메일 유지·CAPTCHA 체크 |
| [x] 05 | `sc_f633b6435614448fb79dc464ccae4c43` | 입력 폼을 회색 안내로 대체 |
| [x] 06 | `sc_d23a8b46d69c4fe590dfd6013a244521` | 단일 New Password 빈 입력 |
| [x] 07 | `sc_938a3faee974462c9a77a24ab1996464` | 마스킹 입력·오류 없음 |
| [x] 08 | `sc_aab3fabd62024fc584f9c87adb63ba16` | Whoops!/약함 오류·빈 입력 |
| [x] 09 | `sc_c81516b8daf84d66bb0657f853d44d2e` | 재입력 중 이전 오류 유지 |
| [x] 10 | `sc_46468ed1fd3f4a0992bef64f1c651449` | 빈 로그인·성공 toast·다른 Changelog |

원본 메일함/링크 URL/수신 과정은 수록되지 않았다. 05 안내를 실제 전달·비밀번호 변경으로, 10을 자동 로그인으로 해석하지 않는다. 10 Changelog 발췌는 해당 snapshot 표시이며 비밀번호 변경의 제품 업데이트 효과가 아니다. 다른 버전의 색상·화면을 다른 인증 경로에 일괄 적용하지 않았다.

### 3. 발견·수정과 유지 판단

| 대상·원인 | 이번 수정/유지 | 현재 근거 |
| --- | --- | --- |
| 복구 요청의 문자열 오류에 필드 정보/ARIA 연결이 없고 CAPTCHA 재선택 후 오류가 남음 | use-reset-request의 email/captcha/form 오류 분리, 해당 필드 수정만 오류 해제, 렌더 후 초점. ResetRequestPage 입력·설명·LocalCaptcha 연결 | 새 DOM 회귀의 빈/잘못된 이메일·체크 오류/수정 통과 |
| 두 복구 화면의 Resend Verification Email이 returnTo를 누락 | 공개 authReturnQuery로 안전한 내부 목적지의 query/hash 보존 | 두 화면→인증 메일 안내→로그인/뒤로 복귀 DOM 통과 |
| pending에 폼만 disabled 처리하고 취소로 초점을 옮기지 않음 | G11 AuthPendingCancel을 두 폼에 재사용, 취소/실패 후 활성 제출로 복원 | 요청/저장 취소·늦은 결과 미반영·입력 보존 통과 |
| 같은 페이지에서 이력의 resetChallengeId가 바뀌어도 비밀번호 초안이 남음 | useNewPassword에서 링크 ID/상태·history ID·revision 변경 시 초안/오류/진행 요청 폐기 | invalid ID→원래 유효 ID 복귀 시 입력이 비어 있음 |
| 새 요청 시작 뒤 먼저 끝난 이전 저장이 비밀번호를 바꾸고 새 요청을 취소시킬 수 있음 | create-auth-store.requestReset에서 이메일/체크/scope 검증 후 이전 도전을 즉시 폐기. 최신 요청만 새 링크 발급 | 수정 전 지연 저장 회귀가 saved로 실패, 수정 후 거부·이전 비밀번호 유지·새 대상 링크 성공 |
| 회색 원본 안내 안의 추가 목 설명이 레이아웃을 변경 | 원본 문구는 유지하고 로컬 발송 없음 설명을 카드 밖 기존 도구로 분리, aria-describedby로 연결 | 안내가 폼을 대체하고 별도 no email 설명 유지 DOM 확인 |
| 과거 의도적으로 진하게 쓴 버튼·링크·안내·오류 색상 | 원본 PNG 영역의 대표색을 G12 selector에만 반영 | 아래 표본 측정, 실제 렌더 비교는 대기 |
| 단일 비밀번호/약한 오류 초기화/재입력 오류 유지/성공 빈 로그인 | 기존 구현 유지. G10 보기 토글·강도 표시를 G12에 임의 추가하지 않음 | 원본06~10·DOM 및 같은 계정 단위 검증 |
| FE 계층 | page→feature 공개 export·hook→메모리 저장소 유지, 새/변경 함수 한글 책임 주석 | typecheck/lint 및 최종 코드 검토 |

수정 FE: `pages/password-reset/index.tsx`, `features/mock-auth/hooks/use-reset-request.ts`, `hooks/use-new-password.ts`, `data/create-auth-store.ts`, `features/mock-auth/index.ts`, `styles/auth.css`.
정식 회귀: 기존 `features/mock-auth/data/reset.test.ts`에3개 추가, 신규 `app/router/password-reset-entry.test.tsx`9개. 검증 편의 스크립트 파일은 만들지 않았다.

### 4. 시각 대조·측정과 한계

원본 해상도2880×1800, MCP1440×900. 기존 원본 파일 전체를 도구 표시로 열람했고, 아래 좌표는 **PNG 픽셀**이다. 실제 CSS viewport/DPR나 2배 촬영이라는 결론이 아니다. 구현 캡처·비교 축척·배율·스크롤 일치 실험은 수행하지 못했다.

System.Drawing으로 기존 PNG를 메모리에 읽고 영역별 RGB 빈도를 표준출력으로 확인했다. 원본 CSS 값이나 모든 상태의 색 확정이 아닌 재현 후보 측정값이다.

| PNG 단계·표본 영역 (x,y,w,h) | 측정한 대표색 | 반영 |
| --- | --- | --- |
| 02 (1135,900,50,60) 버튼, (1250,1060,380,25) 링크 | #51A630 | G12 버튼·링크·체크 accent |
| 05 (1160,620,300,80) 안내 | 배경#FAFAFA/글자#8B8C8B | 회색 안내 |
| 08 (1360,580,160,40) Whoops! | #E36762 | 오류 제목 |
| 08 (1300,640,280,30) Password is too weak | #05130F | 오류 설명 |

현재 CSS 카드폭400·padding62/40/50(새 입력 하단60), 제목26/34·700, 입력/CTA40, 안내16/22, 오류18/24·14/20, 간격40/44 등은 **구현값/기존 추정**이다. `Bonsai Public Gellix, Arial` 선언을 인증 화면 원본 폰트 확보로 단정하지 않는다. 원본 reCAPTCHA 자산 대신 로컬 체크, 샘플 이메일, 별도 목 도구, 아이콘·테두리·radius/shadow·줄바꿈·토스트·초점 외곽과 위치는 남은 차이/미확정이다. 작은 차이도 완료로 허용하지 않는다. G11의 대시보드/표본 등 별도 대기도 보존했다.

### 5. R4 4항목·공통12 판정

| ID | 판정 | 근거·잔여 |
| --- | --- | --- |
| R4-F084-O01 | 비교 완료·구현 보완 | 02~05 중앙 카드·이메일/CAPTCHA/발송→회색 안내 대조. 필드 오류/초점·취소 초점·인증 메일 복귀 query 보완, 목 설명은 원본 안내 밖으로 분리. 실제 렌더/시각은 대기 |
| R4-F084-O02 | 비교 완료·구현 보완 | 06~09 단일 마스킹 입력·확인칸 없음·빨강 Whoops!/검정 오류·약한 입력 초기화/재입력 오류 유지 DOM 확인. 취소·링크 초안 격리 보완, 표본색 반영. 픽셀/강도·오류 해제 원본 정책 대기 |
| R4-F084-O03 | 비교 완료·유지 | 10 빈 Email/Password·미체크·성공 토스트와 다른 Changelog 발췌 유지. 자동 로그인 없음·같은 ID 새 비밀번호/이전 비밀번호 거부·선택 인계 DOM 확인. 토스트/폰트·줄바꿈 시각 대기 |
| R4-F084-A01 | 분석 대기 | 만료·재사용·재발송·강도 전체·오류 해제·다른 기기 정책 미관찰. 새 요청 시작 시 이전 링크 즉시 폐기는 명시적 목. 오류 카드/토스트 정밀 치수·폰트·촬영 조건/실제 브라우저는 G12/R02 후속 |

| 공통 기준 | G12 적용 판정 (전역 완료 아님) |
| --- | --- |
| R4-C01 | 원본 식별 대조 수행: F084 10PNG 직접 열람, ANALYSIS LF 해시/PNG10 SHA-256·MCP ID/순서/URL 일치. 저장된 Latest/2146을 사용하되 이번 응답의 버전·빌드·촬영 조건은 미확인 |
| R4-C02 | 주요 구성 대조 수행: 로그인 두 열→중앙 복구 카드→회색 안내→새 비밀번호→오류→빈 로그인/토스트를 구분. 목 설명을 카드 밖으로 이동; 실제 겹침/렌더 대기 |
| R4-C03 | 주요 제어 대응 수행: 이메일/CAPTCHA/제출/인증 메일 링크, 단일 비밀번호/오류/저장, 빈 로그인/토스트. 배경·작은 요소 전수 계수와 개별 요소 ID 완결은 미완 |
| R4-C04 | 문구/placeholder/오류/마스킹/체크 상태 대조. 원본 이메일 대신 가상 샘플, CAPTCHA는 Local preview check. 정확 줄바꿈·문자 모양·촬영 상태 동일성 대기 |
| R4-C05 | 원본2880×1800/MCP1440×900, 코드 카드400/heading26/입력40/CTA40은 CSS 구현값. 원본 좌표를 CSS px/DPR로 단정하지 않음; 동조건 캡처/픽셀 비교 미실행 |
| R4-C06 | Bonsai Public Gellix/Arial 및 heading700/26/34, 오류18/24·14/20은 현재 코드. 원본 정확 폰트·굵기·행간·자간/줄바꿈 일치 미확인 |
| R4-C07 | PNG 영역 표본에서 버튼/링크#51a630, 안내배경#fafafa·글자#8b8c8b, Whoops#e36762·오류#05130f를 측정해 G12만 보정. 원본 CSS 색 확정/전체 비교 아님; border/shadow 등 대기 |
| R4-C08 | 기존 로고·Google/Apple·Changelog·toast 자산 유지. 원본 reCAPTCHA 이미지/실제 위젯 대신 로컬 체크이며 폰트/아이콘 정밀 동일성 대기, 새 자산 생성 없음 |
| R4-C09 | 빈/잘못된 이메일·CAPTCHA 수정·일반 실패/재시도·약한 암호/초기화/오류유지·처리/중복/취소·missing/expired/used/replaced 링크 DOM 검증. 미수록 상태는 목 |
| R4-C10 | 실제 Router/history의 로그인↔복구/인증메일 우회·query/hash·사용 링크/새 요청·선택 인계·빈 로그인 복귀 DOM 검증. 메일함/실제 링크 이동 미수록, 실제 브라우저/스크롤 대기 |
| R4-C11 | 폼 초안과 메모리 digest 분리. 실패/시도 취소 보존, 약한 암호/이탈/링크·scope 교체 폐기. 새 요청이 이전 링크/지연 저장 폐기, 같은 계정만 변경·자동 인증 없음. 서버 정책 아님 |
| R4-C12 | G01 공통/CAPTCHA·G10 강도/가입·G11 재로그인·G13 설정 경계·G14 보호 URL/세션 및 선택 공개 인계 회귀. 다른 Goal 전체 완료나 R02 전체 분석 완료로 승격하지 않음 |

요소 전수 계수·동일 재현 명세 인증은 false다. ANALYSIS에 기존 미확인이 있는 내용을 목 정책으로 구현했다고 원본 분석 완료로 올리지 않는다.

### 6. 실제 실행과 결과

- 최초 대상 실행: **14개 중8통과/6실패** (DOM5·저장 경합1). 수정 후14/14, 연결 경계 추가 후 **DOM9+store7=16/16**,23.64s.
- 최종 전체: **35파일223/223,169.96s**. G11 로그인 DOM14/G10 가입 DOM9와 공통 인증·preview·공개 인계·프로젝트/작업 등 기존 회귀 포함. 과거211을 이번 결과로 대신하지 않았다.
- TypeScript app/node `--noEmit --incremental false`, eslint `--no-cache` 통과.
- Vite 메모리 build `write:false`,1973모듈/3outputs,8.77s 통과. dist/tsbuildinfo/JSON/보고서 파일 생성 없음. Browserslist 데이터 노후 경고는 유지했고 의존성 업데이트는 하지 않았다.
- 로컬 원본10PNG/ANALYSIS·MCP 순서·URL·해시 대조 통과. 제품 FE의 API 연결이 아니다.
- `git diff --check` 및 계획 링크/체크/JSON/이력 정합성 결과는 아래 최종 검토에 추가한다.

작업 디렉터리 `FE/user-web`, Node24.18.0/pnpm8.14.1. 실제 사용한 검증 명령/옵션:

```powershell
pnpm.cmd exec tsc --project tsconfig.app.json --noEmit --incremental false --pretty false
pnpm.cmd exec tsc --project tsconfig.node.json --noEmit --incremental false --pretty false
pnpm.cmd exec eslint . --no-cache
```

Vitest는 파일 config/bundling·JITI·모듈 캐시·coverage/report 생성을 피하려고 PowerShell here-string→`node --input-type=module`로 실행했다. `NODE_DISABLE_COMPILE_CACHE=1`, `JITI_CACHE=false`, `JITI_FS_CACHE=false`. 실제 JavaScript의 핵심 전체 옵션은 아래와 같고, 최초·대상에서는 filters에 두 정식 테스트 경로를, 최종 전체에서는 빈 배열을 넘겼다.

```js
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { startVitest } from 'vitest/node';
const ctx = await startVitest('test', [], {
  config:false, run:true, cache:false, pool:'threads', execArgv:[], maxWorkers:2,
  environment:'jsdom', include:['src/**/*.test.{ts,tsx}'], setupFiles:['./vitest.setup.ts'],
  reporters:['default'], coverage:{enabled:false}, experimental:{fsModuleCache:false},
  deps:{optimizer:{client:{enabled:false},ssr:{enabled:false}}}
}, {configFile:false, plugins:[react()], resolve:{alias:{'@':path.resolve('src')}},
    optimizeDeps:{noDiscovery:true,include:[]}, server:{watch:null}});
if (!ctx) process.exitCode=1;
await ctx?.close();
```

메모리 build도 같은 인라인 방식으로 Vite `build({configFile:false,plugins:[react()],resolve:{alias:{'@':path.resolve('src')}},css:{postcss:{plugins:[tailwindcss(),autoprefixer()]}},build:{write:false,emptyOutDir:false,copyPublicDir:false,reportCompressedSize:false,sourcemap:false}})`를 호출했다. 기존 설정과 같은 React/alias/PostCSS 조합이며 build script의 파일 출력은 실행하지 않았다.

**브라우저 상태:** 연결 document session0, 사용 가능한 browser 도구 없음, Chrome/Edge remote-debugging flag 및9222/9223 listener 없음. 기존 FE `http://127.0.0.1:5173/password/reset` HTTP200·Vite dev/HMR, PID30272 유지. 별도5174/PID22864 보존. 기존 서버/ENV 변경·새 서버/Backend 실행 없음. 브라우저를 새로 띄우는 방식은 profile/cache 생성 제한을 보장할 수 없어 사용하지 않았다.

**실제 브라우저·console/network 직접 관찰 없음. 실제 API 요청 수는 null(미검증)**이다. 정적 코드에 실제 API/영속 저장 호출이 없고 DOM이 통과했음을 네트워크0건으로 바꾸지 않는다. navigation은 실제 App/Router/history를 사용했지만 jsdom이므로 실제 브라우저 E2E라고 쓰지 않는다. 새 공급자 조립은 메모리 초기화 검증이며 실제 reload/새 탭 검증과 다르다. 합성 composition/Enter만 확인했고 OS IME·실제 Tab 순회·스크롤·좁은 화면은 대기다. 단위/DOM의 가상 실패 설정은 테스트마다 unmount/정리되며 제품 기본 normal을 바꾸지 않았다.

### 7. 공통 체크리스트·FRONT 준수 대조

| 기준 | 이번 결과·코드/검증 근거 |
| --- | --- |
| START 착수: 요청/변경·규칙·선행/R02·원본·scope·현재 공급자 | [x] 1~2절. G11 현재 코드/대기를 확인, 실제 API/BE 제외, clean 시작 |
| START 구현: 책임 분리·한글 주석·초안/저장·적용 상태 | [x] 3절 source/hook/store·동작16/전체 회귀. 목록·검색 무결과/금액·시간 계산은 N/A(인증 폼) |
| START 원본 동일 캡처·키보드/폭·네트워크 전체 검증 | [ ] 원본 열람/색 측정과 DOM만 수행. 파일 제한/연결 부재로 실제 브라우저·픽셀·OS IME 대기 |
| START 종료: 근거/잔여·서버 메모·범위 배정·문서 일치 | [x] 이 결과와 관련 G/R/표/순서/색인 갱신. 새 기능 발견/별도 Goal 분할은 N/A |
| ENGINEERING 1 범위·출처 네 항목 | [x] 1~3절과6절: 관찰/추정/목/미검증 분리, 전면 교체·무관한 확장 없음 |
| ENGINEERING 2 구조·props·공통화·의존 | [x] page는 조합, hook은 초안/요청, authStore는 같은 계정, 공개 barrel 사용. 공통 취소 재사용. 새 라이브러리·Admin 공유는 N/A |
| ENGINEERING 3 데이터/mock 일곱 항목 | [x] account ID/digest 메모리·scope 및 default normal; HTTP fallback/실인증 없음, 임시 타입을 API/DB 계약으로 확정하지 않음. 기존 live 데이터 보충은 N/A |
| ENGINEERING 4 상태/비동기 | [x] 링크/revision/AbortController·최신 요청·실패 입력 보존/약함 초기화, 경합 회귀. Query key/합계/null 금액은 N/A(직접 메모리 구독·인증값) |
| ENGINEERING 5 웹 UX/접근성 | [x] label/error/invalid·취소 초점·경로/링크 DOM. [ ] 실제 URL/reload/history/Tab·폭/확대/scroll/OS IME/보조기술. 모달 신규 변경 없음(N/A) |
| ENGINEERING 6 주석/타입/정리/보안 | [x] 한글 책임 주석, strict 검사, 요청 수명 정리, 비밀번호 URL/history/storage 미노출 DOM/코드. 성능은 중복/늦은 요청 경계 검증; 실제 렌더 성능 측정은 미실행 |
| ENGINEERING 7 검증·인계 | [x] type/lint/unit/DOM/메모리build·기존 소비 회귀·관련 문서. [ ] 실제 E2E/network/원본 동일성. Admin/server/배포 검증 N/A |

체크는 해당 수행 범위에만 적용한다. 혼합 행의 [x]를 남은 [ ]까지 충족한 것으로 읽지 않는다. 관련 없는 기존 코드 구조·주석을 일괄 수정하지 않았다.

### 8. 미완료·목 가정·후속 담당

- [ ] **G12/R02·공통 G01/G11:** 정확 auth 폰트/로고·CAPTCHA/토스트 자산, 원본 촬영 조건과 전체 요소 명세, 모든 상태 픽셀 동일성. 원본과 구현의 비교 캡처 경로는 **없음**(이번 파일 생성 금지).
- [ ] **G12/연결 G01/G10/G11/G13/G14/G84:** 안전한 기존 브라우저 연결에서 직접 URL·reload·뒤/앞·새 탭·Tab/초점·scroll·320/390/768/1440폭·긴 한국어·OS IME·console/network 확인. 이번 합성 DOM은 대체 증거가 아니다.
- [ ] **G12/R02, FE 이후 별도 서버 단계:** 실제 메일/링크·계정 존재 응답/소셜 계정 복구·강도 전체/오류 해제·만료TTL·재사용/재발송 제한·다른 기기 세션 정책. 서버 답 때문에 독립 FE 작업을 중단하지 않았으며 API/DB 계약은 작성하지 않았다.
- 목 가정: 최소10자/3종류·최대128, normal350ms/slow1500ms/fail-once, 명시적 expire, 새 유효 요청 시작 즉시 이전 도전 폐기(새 요청 실패·취소 후에도 부활 없음), 해당 메모리 계정 digest만 변경. 실패/취소/만료는 비밀번호·세션 유지; 성공 시 현재 탭 세션만 해제하고 자동 로그인 없음. 정확 Bonsai 정책 확정이 아니다.
- 기존 G11 Joe 대시보드·정밀 시각·실제 브라우저 대기와 다른 Goal/R02 전체 대기는 보존한다. 이번 결과를 실제 서비스/API/출시 완료로 표현하지 않는다.

### 9. 직접 확인할 순서

기존 `http://127.0.0.1:5173/login`에서:

1. Reset Password → 빈 제출/잘못된 이메일 → 이메일 수정 → 미체크 제출 → 로컬 체크 수정. 오류 연결과 초점을 확인한다.
2. `alex@example.test`·체크 → Send password reset email. 원본 회색 안내와 카드 밖의 로컬 발송 없음 설명을 구분한다.
3. Open local reset link → `weak` 제출 → 빈 필드/Whoops!와 약함 오류 → 다시 입력할 때 오류 유지 확인.
4. `Replacement123!` → Save New Password → 빈 Email/Password·미체크·성공 toast. 자동 로그인하지 않는다.
5. 같은 이메일에 이전 `PreviewOnly123!`는 실패, 새 암호는 같은 Alex 계정으로 진입한다. URL 예: `/login?returnTo=%2Fapp%2Fclients%3Ffrom%3Dreset%23list`의 목적지도 확인한다.
6. 별도 요청에서 slow/fail-once/Cancel·Expire·사용된 링크·인증 메일 우회 복귀를 확인하고 scenario를 Normal로 돌린다. 새로고침/새 탭은 현재 메모리 공급자 정책상 seed로 초기화되므로 실제 서비스 영속성으로 해석하지 않는다.

이 순서는 사용자 브라우저 후속 확인용이며 이번 실제 브라우저 통과 기록이 아니다. **커밋·push·배포 없음. G13/다음 Goal 자동 시작 없음.**

### 10. 최종 코드·문서 검토

- [x] 변경한 hook/page/store·공개 export·한글 주석·초안/저장/취소 경계를 최종 diff로 검토했다. 단위/DOM223·타입/lint·메모리build 이후 실행 코드는 추가 변경하지 않았다.
- [x] 계획170 Markdown/1 JSON을 검사했다. 기존 관련39문서의 링크/상태·G12 4항목·공통12·최상위 status/workflow_review·부분 완료/대기 표현이 일치한다. 기존 링크 오류221/현재221/새 오류0이며 누락된 과거 evidence를 복원하거나 이번 근거로 사용하지 않았다.
- [x] 과거 [x]/verification·다른451개 R4·85G/22R·134흐름/754단계/642고유ID·107실행순서와 배정을 보존했다. 실제 수행한 이번 항목만 체크했고 다른 G/R 전체를 완료 처리하지 않았다.
- [x] Git diff --check 통과. 수정 범위는 FE 소스/정식 테스트8파일과 기존 계획39문서다. 새 파일은 정식 password-reset-entry.test.tsx1개뿐이다. 원본/evidence·환경·서버·BE/DB/의존성은 변경하지 않았다.
- [ ] G12 전체 완료는 아니다. 원본 동일성·실제 브라우저/console/network·OS IME·원본 미수록 정책은8절 담당에 남겼다. 실제 요청 수는 null이며 커밋/push/배포·다음 Goal 착수 없음.


<a id="g12-precommit-review"></a>
## G12 커밋 전 추가 검토 — 2026-11-24 KST

사용자의 후속 요청 “검토하고 이상있으면 고치고 없으면 깃 커밋”에 따라 현재 G12 diff를 다시 검토했다. 위 223개 통과/커밋 없음은 최초 G12 수행 이력이며 보존한다. 이번에는 수정 후 검증된 G12 변경의 로컬 커밋만 승인되었다. push·배포·G13 구현은 수행하지 않는다.

### 발견한 문제·수정

- [x] 복구 요청 중 같은 /password/reset 경로의 returnTo·선택 인계 이력을 바꾸면 이전 요청이 완료되어 새 문맥에 발송 안내를 표시했다.
- [x] 비밀번호 저장 중 같은 /password/new 경로의 returnTo를 바꾸면 이전 저장이 완료되고 예전 returnTo의 로그인 화면으로 이동했다.
- 원인: 두 hook의 취소 effect가 시나리오·실행 revision과 unmount만 감지해 같은 route의 새 이력을 놓쳤다. use-new-password의 링크 ID 검사만으로 복귀 문맥 변경을 감지하지 못했다.
- 수정: use-reset-request/use-new-password의 cancelScope가 location.key 변경도 감지해 AbortController로 이전 작업을 취소한다. 같은 링크의 초안은 유지하고 재제출은 현재 returnTo를 사용한다. 다른 링크/계정/유효 상태의 비밀 초안 초기화는 기존 G12 수정대로 유지한다.
- 기존 정식 password-reset-entry.test.tsx에 두 회귀 시나리오를 추가했다. 실제 App/Router를 사용하며 navigation을 mock으로 바꾸지 않았다. jsdom 검증이므로 실제 브라우저 E2E와 구분한다.

### 실제 검증

- 새 두 시나리오만 실행한 최초 결과: **2/2 실패**, 13.71s. 안내가 남는 DOM과 예전 clients 복귀 URL로 이동한 결과로 결함을 재현했다.
- 수정 후 G12 대상: **2파일18/18 (DOM11/store7)**,30.95s.
- 최종 전체 회귀: **35파일225/225, 174.17s**. G10/G11 및 공개 선택 인계·회사/프로젝트/작업 등 기존 회귀 포함. 이전223은 수정 전 기록으로 보존하며 합산하지 않는다.
- 타입 app/node --noEmit --incremental false, ESLint --no-cache 통과.
- Vite build는 6절의 동일 파일 미출력 명령으로 수행: write:false,1973 modules/3 outputs,12.25s. Browserslist 오래된 데이터 경고는 보존하고 의존성 변경 없음.
- Vitest 실행은 6절의 같은 stdin 프로그램이다. 최초에는 G12 두 정식 파일과 testNamePattern:"same route", 대상에는 같은 두 파일/패턴 없음, 최종에는 filters=[]를 사용했다. cache:false/coverage:false/fsModuleCache:false/optimizer 비활성/Node·JITI 캐시 비활성을 유지했다.
- ANALYSIS LF 정규화 hash·원본10PNG hash/2880×1800·기존 MCP 결과의10ID/순서/URL을 재대조했다. 이번 추가 검토에서 MCP를 다시 조회하거나 PNG를 다시 열었다고 계산하지 않는다.
- 현재 preview /password/reset HTTP200·Vite dev/HMR,5173/PID30272와 별도5174/PID22864 보존. 연결 document session0, 기존 CDP/remote-debugging 연결 없음. 신규 브라우저 프로필/서버를 만들지 않았다.
- 실제 브라우저·console/network·OS IME·픽셀 비교는 미실행이며 **실제 API 요청 수는 null**이다. 코드/DOM이나 HTTP200으로 API0·시각 동일성을 선언하지 않는다.

### 규칙·문서·잔여 판정

- [x] FRONT_AGENT 구조·상태/취소·목·접근성·한글 주석·테스트·ENGINEERING_REVIEW_CHECKLIST를 적용했다. FE 두 hook과 정식 회귀 테스트만 추가 보완했고 실제 API/BE/DB·인증 제공자는 변경하지 않았다. AGENT/README가 참조하는 AGENT_USAGE_RULES.md는 현재 파일 검색에서 없으므로 존재하는 규칙과 사용자 최신 지시를 적용했다.
- [x] 기존 관련39문서의 최신 결과 연결, G12/R02·연결 G 소비 기록, 순서표·대응표·현재 상태·PLAN-INDEX 최상위/workflow_review와 별도 precommit_review를 갱신했다. 과거 체크/verification과 다른451개 R4 상태를 보존했다.
- [x] 계획170Markdown/1JSON 링크 검토: 기존221/현재221/새 오류0. 역사 자료의 사라진 evidence 링크는 복원·삭제하거나 이번 검증 근거로 사용하지 않았다. 85G/22R·134흐름/754단계/642고유ID·107실행 순서와 원본/evidence 보존.
- [x] 파일 생성 없는 검사만 사용했다. 이번 추가 검토의 새 파일 없음; G12 전체 새 파일은 정식 password-reset-entry.test.tsx 하나다. git diff --check 통과; Git의 표준 커밋 메타데이터 외 tmp/보고서/로그/이미지/캐시 산출물을 만들지 않는다.
- [ ] 원본 폰트·자산·촬영 조건·동일 픽셀, 실제 브라우저/네트워크/OS IME 및 원본 미수록 정책은 위8절 담당·범위대로 대기다. G12/R02 전체 완료로 올리지 않는다.

미리보기 확인은 위9절 순서를 따른다. 추가 회귀는 slow 요청/저장 중 같은 경로의 다른 returnTo 이력으로 이동했을 때 늦은 안내/완료가 나타나지 않고 현재 문맥에서 다시 제출되는지 확인한다. 현재 문맥을 바꾸면 이전 작업을 취소하는 동작은 미수록 경합을 처리하는 로컬 목 정책이다.

다음 요청 후보는 G13 사업 설정 온보딩이다. G13 명세·결과, R02와 F087 분석의 진행5칸/미수록3번째 설문·MYR/USD·팀 제안·초기 대시보드 경계를 읽어 요청문을 준비했으며 G13 구현이나 원본16PNG 재검토는 시작하지 않았다.
