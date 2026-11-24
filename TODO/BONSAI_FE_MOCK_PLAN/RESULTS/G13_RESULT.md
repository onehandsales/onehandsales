# G13 사업 설정 온보딩 실행 결과

> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 관찰된 설문과 명시적 미수록 단계, 같은 workspace/company 저장, 초기 로딩·빈 대시보드를 구현했다. 두 차례 검토 후 현재 가능한 관련 개발/빌드 회귀 검사를 마쳤다. G14 앱 셸·공개 목적지 종합 복귀와 G15 회사 편집 연결은 순서상 대기다.

## 근거와 범위

R02에서 이번 작업 중 조회한 Completing account setup `f004afc2-a8c5-4262-b2e4-941331047a84` 16단계를 소비했다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, Latest/2146 카탈로그는 G05 이번 조회 재사용, 촬영일/제품 빌드는 미확인. [Screen ID](evidence/r02/mcp-sources.json), [PNG 해시/순서](evidence/r02/source-manifest.json), [R02](R02_RESULT.md). ANALYSIS/16개 PNG를 직접 확인하고 G13에서 4개 시트와01 전체를 재확인했다.

- 관찰: 업종 목록12개, Design 선택 후 회사명/국가 Malaysia, Joe Studio, 사업 형태 Registered→Unregistered, MYR/RM0-RM50,000, 세 번째 진행 표시의 질문 누락, 팀 이메일3칸/1개 입력, 목적7개 중1개/4개 선택, 초기 로딩·체크리스트·빈 타임라인/손익/활동/작업/시간.
- 미확인: 전체 업종·국가·통화·매출 범위, 검색/자유 입력, 국가 추정, 세 번째 설문, 초대 발송/역할, 목적에 따른 메뉴 정책, MYR와USD 관계, 실제 체험/집계.
- 오른쪽 사진/평점 배지는 원본01의 자산 영역만 추출했다. [자산 출처](../../../FE/user-web/public/bonsai-auth/setup-sources.json). 과거500,000+/평점을 현재 지표로 쓰지 않는다. 보관/현재 사이트를 새 디자인 근거로 섞지 않았다.

## 경로·책임·목 정책

- `/onboarding`과 `?step=1..4`: `OnboardingPage`는 화면 조립, `SetupFields`/`IndustryPicker`는 질문/선택, `useOnboarding`은 이력·검증·취소, `createCompanyStore`는 메모리 초안/회사 저장을 담당한다. `CompanyContext`는 앱 수명의 동일 저장소를 제공한다.
- 업종은 원본12개만 검색/선택한다. 검색 무결과를 표시하고 자유 문자열을 업종으로 저장하지 않는다. 국가 Malaysia/통화MYR/매출RM0-RM50,000 외 선택지는 만들어 넣지 않는다. 이 기본값·필수값·회사명120자 제한은 재현용 목 선택이며 실제 정책이 아니다.
- step2는 질문을 발명하지 않고 미수록 안내와 Continue to team만 제공한다. 설문 전체 분석 완료라고 쓰지 않는다.
- 이메일3칸은 선택 입력, 중복/잘못된 형식을 거부한다. 빈 입력 Next 허용·초대 없음·역할 변경 없음은 명시적 목 가정이다. 같은 회사에 draft suggestion만 저장한다. 체크리스트 완료 표시는 그 제안 입력 유무이며 초대 발송/수락을 뜻하지 않는다.
- 목적은 원본7개, Client billing 초기 선택/최소1개는 목 가정. 목적에 따라 다른 업무를 생성하거나 메뉴/권한을 바꾸지 않는다.
- 초안은 actor/workspace별 같은 탭 메모리. 단계 Back·브라우저 뒤/앞·Pause→랜딩→뒤로 재진입 시 유지한다. 방문한 단계까지만 URL 이동 가능. 로그아웃·workspace/실행 차수 변경은 모든 초안과 진행을 폐기한다. refresh/새 탭/Reset은 계정과 회사까지 초기화한다.
- 마지막 Next에서만 `company-${workspaceId}`를 저장한다. G10의 `preview-user-N`/`studio-user-N`을 유지하고 setupComplete만 갱신한다. 회사 저장은 인증 revision을 바꾸지 않아 선택한 공개 인계를 지우지 않는다. 일반 로그아웃 뒤 같은 계정 재로그인은 저장된 회사 유지, 미완료 초안은 새 시작이다.
- 쓰기는350ms/slow1500ms/fail-once, abort/revision/generation/제출 초안 참조를 commit 직전에 확인한다. 실패/Cancel은 입력 보존, 편집/이탈/계정 전환의 늦은 저장은 차단한다. 첫 성공은 generation을 바꿔 중복 완료를 막는다.
- `/app`: 신규 계정은 설정 완료 후 `SetupDashboardPage`, 기존 G01 표본은 기반 검증 화면을 유지한다. 초기1초 로딩은 관찰된 표현의 목 시간이다. 빈 집계·February1·USD는 고정 표시 fixture이며 MYR 환산이나 실제 회계 데이터가 아니다.
- 체크리스트 선택/숨기기/복원, Add Details→G15 경계, 업무 버튼→명시적 후속 인계를 제공한다. G16 이후 업무를 구현하지 않았다. G14에서 내부 셸과 모든 계정의 진입을 정리한다.

## 검토·수정

1차: 동일 ID와 인증 revision, 취소/중복 제출/계정 전환, 초안과 저장 결과를 검토했다. 최종 저장 직후 초안을 지우면 hook의 현재 단계가 바뀌어 자기 성공 이동을 취소할 수 있어 현재 단계 초안을 인증 범위 종료까지 유지하고 commit generation으로 중복을 차단했다. setupComplete는 세션 재생성 없이 갱신한다. 단위 테스트에 저장 실패/취소/편집/전환/재로그인/Reset을 추가했다.

첫 브라우저5/8: 신규 테스트가 실제 계정 메뉴 버튼을 잘못된 이름으로 찾고, 이미 Design인 닫힌 입력에 같은 값을 fill하여 목록을 열지 않았으며, Log in 대소문자를 잘못 사용했다. 실제 컨트롤 클릭/이름으로 고쳤다. 다음7/8에서는 로그인 렌더 전에 이전 가입 Email에 입력하는 테스트 경합이 확인돼 실제 `Log in to Bonsai` 제목 준비를 기다리도록 고쳤다. 앱 navigation을 mock으로 바꾸거나 검증 조건을 제거하지 않았다.

2차: 16쌍 캡처·좁은320/768을 직접 비교했다. 헤더 아래 간격6px, 업종 행 높이, 초대 입력 높이, 오른쪽 제목/배지 간격을 보정했다. 초기 빈 카드·차트의 높이와 라벨 간격을 원본에 맞췄다. 전체 셸이 아직 G01 검증 헤더인 차이는 G14 소유이며 G13 완료로 숨기지 않는다. 빠진 설문/목 설명·취소 버튼/키보드 초점/대비·샘플 이메일·아이콘 차이도 구분했다.

## 실행·캡처

Node24.18.0/pnpm8.14.1, FE/user-web에서 typecheck/lint/test/build 수행. unit38/38, 첫 lint의 비정상 공백11개를 일반 공백·레이아웃으로 수정했다. 관련 개발26/26·빌드26/26과 최종 수정 후 온보딩 대상 개발3/3·빌드3/3이 통과했다. 빌드 chunk500kB/Browserslist 경고는 남아 있다.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build`.
- `PLAYWRIGHT_JSON_OUTPUT_FILE=... corepack pnpm exec playwright test tests/e2e/onboarding.spec.ts tests/e2e/signup.spec.ts tests/e2e/login.spec.ts tests/e2e/password-reset.spec.ts tests/e2e/foundation.spec.ts tests/e2e/public-handoff.spec.ts --workers=2 --reporter=line,json`; 빌드는 `-c playwright.preview.config.ts` 추가.
- `node scripts/capture-onboarding.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-onboarding.py`:16원본쌍+누락 안내+320/390/768,20프레임,실제정적요청1739/API·외부·실패·console오류0. [조건·요청](evidence/g13/browser-captures.json), [원본/차이값](evidence/g13/visual-metrics.json), [비교](evidence/g13/comparisons/).
- 원본2880×1800→1440×900 정규화, 실제 Chromium148/DPR1. 원본 viewport/DPR을 확정하지 않는다. 비교 RGB 평균은 합격률이 아니다. source03은 업종 내부 스크롤도 맞춘다.
- 추정: 좌우60/40%, 왼쪽570px, 오른쪽371×443, 상단80px, 본문16/24·제목24/30, 필드50·팀40·목적48px. 폰트Gellix와 원본 실제 내부 폰트의 동일성은 미확인이다.

## 남은 차이·환경·인계

G14 내부200px 사이드바/상단바/체험 띠와 최종 선택 복귀, G15 회사 편집·주소·로고가 순서상 대기다. G13 미수록 세 번째 설문/전체 선택지·정확한 원본 폰트·아이콘·작업 배경 그림·모바일 동작은 미확인이다. 접근성 대비/명시적 목 안내/취소·목 도구·샘플 신원 때문에 시각 차이가 남는다. 완전 일치나 서비스 계정/초대/회계 완성으로 표현하지 않는다.

Chromium의320/390/768,실제 이력·취소·재진입·키보드·합성composition·CSS글자확대는 검증 범위다. OS IME·VoiceOver·실기기·Safari/Firefox는 환경 대기다. 실제 API/메일/Backend는 구현하지 않는다. 미수록 정책은 후속 서버 질문이며 API/DB 설계로 확장하지 않는다.

미리보기 http://127.0.0.1:5173/signup → 공개 샘플 가입 → Design/회사명/Malaysia → 사업형태/MYR/매출 → 미수록 안내 → 선택 팀 이메일 → 목적 → Next → 초기 안내/빈 대시보드. Local setup summary에서 같은 회사ID/입력·가격 선택 확인. Pause와 Back/브라우저 왕복, fail-once 재시도/slow 취소, 로그아웃→같은 샘플 계정으로 재로그인 확인. 목 도구는 Normal로 복원한다.

기존5173과 이전 변경을 보존했고 커밋/push/배포는 하지 않았다. G13 결과 기록 후 G14로 이어간다.

## 최종 재검토와 회귀

관련26개씩 통과 뒤 시각 캡처에서 초기 로딩이 누락된 결함을 발견했다. 저장 후 finally의 pending 해제가 완료된 계정용 Navigate를 다시 렌더해 setupJustCompleted 이력을 덮었다. 성공 이동 중 제출 상태를 유지해 단일 이동으로 수정하고 실제 로딩→빈 상태를 E2E에 추가했다. 최종 캡처13에서도 로딩을 직접 확인했다. 차트 축은 공백 문자 대신 배치된 라벨로 수정했다. typecheck/lint/build 재통과, 최종 JS804.25kB/gzip220.88kB.

- development-final: {'tests': 26, 'requests': 76489, 'violations': 0, 'failures': 0, 'consoleErrors': 0}
- production-final: {'tests': 26, 'requests': 755, 'violations': 0, 'failures': 0, 'consoleErrors': 0}
- development-target-final: {'tests': 3, 'requests': 6996, 'violations': 0, 'failures': 0, 'consoleErrors': 0}
- production-target-final: {'tests': 3, 'requests': 102, 'violations': 0, 'failures': 0, 'consoleErrors': 0}

원본16쌍과좁은320/390/768을 직접 비교했고 G14 셸 차이·G15 연결·미수록/환경은 분리했다. API 차단이나 navigation mock 없이 관찰했다. 기본 목 시나리오는 Normal, 검사 탭의 일시적인 설정은 브라우저 종료로 폐기됐다.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

G13 빈 초대 문자열의 완료 오판을 제거하고 G15에서 같은 회사 설정을 연결했다. 원본 체험 띠/잎 그림·체크리스트 안내는 대시보드 표시 범위에서 보완했으며 예약·팀·업무 기능은 후속 목 인계다.

### G01~G15 감사 후 재점검 (2026-11-21)

Pause 후 이력 복귀와 명시적 Go to dashboard의 새 이동 의도를 구분하는 목 정책을 문서·회귀 테스트로 확정했다. 기존 동작 변경은 없다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

### G17 공통 연결·회귀 (2026-11-21)

[G17 결과](G17_RESULT.md): Team 공급자와 실제 보호 route를 추가하고 Invite Team/계정 메뉴 Team/공통 설정 Team을 연결했다. 기존 회사/주소·국가/통화·저장된 공개 주소·브랜드 저장 코드는 유지하며 G13 초대 제안은 자동 Pending으로 바꾸지 않았다. 현재 전체 개발/빌드103개씩에서 기존96개 회귀와 G17 7개를 실행했다. 마지막 G17 전용 시각 보정 후 대상7개씩 추가 통과. 기존 원본·시각·환경·후속 소비 대기를 해소한 기록은 아니다.

## G05 인계 코드 확인 — 2026-11-24 KST

현재 선택 intent의 명시적 복원/일반 scope 폐기와 공개 returnTo 연결을 코드·기존 기록으로 확인했다. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)의 가입 취소/로그인 왕복 DOM과 구분하며 이 Goal 전체 온보딩/앱 셸 실행·R4 대조·실브라우저는 수행하지 않았다. 기존 이력/대기는 유지한다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 온보딩 코드 미변경, 선택 snapshot 관련 기존 auth/company store 단위 회귀만; 온보딩 전체 E2E 아님. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 목 가입 후 관찰된 설문 단계·누락 질문 표시→대시보드까지 인계 보존. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g10-update"></a>
## G10 적용·연결 검토 — 2026-11-24 KST

- [x] 첫 화면 인사만 저장 Full Name의 첫 공백 토큰으로 표시한다. Joe Doe→Joe는 관찰, 일반 이름 분리는 목 가정이며 계정 원문/ID는 보존한다. 진행1/5·빈 업종·Next·가입 인계 확인; 나머지 설문 재작업 없음. [상세 판정·근거](G10_RESULT.md#g10-r4-recheck).

- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G10 결과8절에 기록했다.
