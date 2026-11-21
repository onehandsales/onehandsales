# G12 비밀번호 재설정 실행 결과

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
