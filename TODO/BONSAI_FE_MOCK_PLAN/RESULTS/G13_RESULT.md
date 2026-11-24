# G13 사업 설정 온보딩 실행 결과

> G13 커밋 전 추가 검토 — 2026-11-24 KST: 초기 대시보드에서 같은 경로로 이동할 때 로딩이 남는 결함을 재현·수정했다. G13 DOM10/company store4=14/14, 최종 전체36파일236/236·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저·원본 미수록 대기와 과거 이력을 보존하며 사용자 후속 요청으로 커밋·origin/main push를 승인받았다. 배포·다음 Goal 착수 없음. [추가 검토 결과](G13_RESULT.md#g13-precommit-review).

> 최초 G13 재검토 이력 — 2026-11-24 KST: **부분 완료**. 원본16PNG·MCP/코드 대조, 이력/저장 경합·입력/초점·신규 작업공간 빈 상태 보완. 전체234/234 후 최신 G13 DOM9/store4=13/13·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저/network·미수록 정책 대기. 커밋·push·배포 없음. [최신 결과·체크·잔여](G13_RESULT.md#g13-r4-recheck).

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

<a id="g11-update"></a>
## G11 적용·연결 검토 — 2026-11-24 KST

- [x] 동일 새 계정 재로그인 시 setupComplete=false이면 원래 내부 목적지를 보존해 첫 사업 설정으로 진입하는 경계를 검증했다. 설문 전체 재검토는 아니다. [상세 판정·근거](G11_RESULT.md#g11-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록 정책은 대기다. 연결 G/R 전체 완료가 아니며 후속 담당은 G11 결과8절을 따른다.

> G11 커밋 전 추가 검토: 공통/공유 로그아웃→빈 로그인·저장 회사명 일관성 보완, G11 14/전체211 통과. 과거208 기록과 다른 Goal 대기는 보존하며 로컬 커밋만 승인되었다. [최신 결과](G11_RESULT.md#g11-precommit-review).

<a id="g12-update"></a>
## G12 적용·연결 검토 — 2026-11-24 KST

- [x] 새 가상 계정의 비밀번호 변경 성공 후 재로그인해도 setupComplete=false를 유지하고 원래 내부 query/hash를 가진 온보딩으로 돌아가는 경계를 검증했다. 설문 전체 재검토가 아니다. [상세 판정·근거](G12_RESULT.md#g12-r4-recheck).

- [ ] 원본 동일성·실제 브라우저/네트워크·미수록 정책은 대기다. 관련 G/R 전체 완료가 아니며 후속 담당은 G12 결과8절을 따른다.

> G12 커밋 전 추가 검토: 같은 경로에서 복귀 주소·이력/선택 문맥이 바뀌어도 이전 요청 안내·비밀번호 저장이 완료되는 두 결함을 재현하고 수정했다. G12 DOM11+store7=18/18, 전체225/225·타입/lint·메모리build 통과. 이전223 기록과 다른 Goal 대기는 보존하며 사용자 후속 요청으로 로컬 커밋만 승인되었다. [최신 결과](G12_RESULT.md#g12-precommit-review).


<a id="g13-r4-recheck"></a>
## G13 기존 구현·R4 재검토 — 2026-11-24 KST

**부분 완료: 16단계 원본·코드 대조, 동작/표시 보완과 현재 단위·DOM 검증 수행. 원본 동일성·실제 브라우저·미수록 정책은 대기다.** 과거 완료 체크·테스트 수치·evidence 경로는 당시 이력으로 보존한다. 이번 수치와 합산하지 않는다. 커밋·push·배포·다음 Goal 착수 없음.

### 1. 범위·선행 조건

- 시작 HEAD `7655c202c0095c3efc986300774cdddbe1e1ef0d`, 작업 트리 clean. G12 커밋 전 추가 검토를 확인했고 G01/G10/G11/G12의 시각·실제 브라우저 대기를 승격하지 않았다.
- 주대상은 업종→사업 정보→미수록 단계 안내→팀 제안→목적→같은 회사 저장→초기 대시보드다.
- 직접 연결: G01 입력/초점/목 격리, G10 같은 가입 ID, G11/G12 완료 여부별 로그인, G14 보호 URL/Pause/공개 인계, G15 같은 회사 조회, G17 제안과 Pending 분리. G25는 대시보드에 표본 작업을 넣는 공통 저장소 초기값만 수정·회귀했다. 업무 전체 재작업·새 기능·G32 이후 착수 없음.
- 현재 FE 소스와 기존 결과를 대조했다. 규칙 원본은 FRONT_AGENT README/DECISIONS006, User Web 아키텍처·상태/데이터·MOCK_FIRST_DEVELOPMENT·TESTING, COMPONENT_DESIGN·WEB_ACCESSIBILITY_AND_LAYOUT·COMMENT_AND_LOGGING·FRONTEND_USER_WEB, ENGINEERING_REVIEW_CHECKLIST, PM036/UX025다. 이 대화 앞선 검토에서 읽은 변경 없는 규칙을 재사용하고 문서 지도·리뷰 기준을 재확인했다. FE 적용 AGENTS 없음; BE/AGENTS는 범위 밖. 참조된 AGENT_USAGE_RULES.md는 체크아웃에 없어 확인했다고 쓰지 않는다.

### 2. 원본과 단계별 확인

Flow `f004afc2-a8c5-4262-b2e4-941331047a84` / F087. [ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) 전체와 PNG **16/16**을 직접 열람했다. `gummble_get_flow_screens`로 같은 Flow의 16개 ID·순서·원본 URL·1440×900 메타데이터를 재조회했다. MCP 응답의 이미지 블록은 시각 확인에 사용하지 않았다. 로컬 원본은 2880×1800이며 ANALYSIS LF SHA-256·PNG16 해시/크기와 저장 색인 일치를 확인했다.

채택 근거는 저장된 Latest/2146 캡처다. 이번 MCP 응답에는 카탈로그 버전이 없으므로 현재2146이라고 재확정하지 않는다. 촬영일·제품 빌드·실제 CSS viewport/DPR·브라우저 배율은 미확인이다. 다른 계정/버전을 연속 행동으로 합치지 않았다.

| 직접 열람 | Screen ID | 파일 | 확인한 상태 |
| --- | --- | --- | --- |
| [x] 01 | `sc_33b333fba9d34edbbd66ddfadf29dcb4` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/01_sc_33b333fba9d34edbbd66ddfadf29dcb4.png>) | 빈 업종·1/5 진행 |
| [x] 02 | `sc_f1b9643dfd4b420e865bbd7f26b6f2b1` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/02_sc_f1b9643dfd4b420e865bbd7f26b6f2b1.png>) | 목록 상단/활성 강조 |
| [x] 03 | `sc_f53d0cb8a35c4c598710fef5aa7e4b1b` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/03_sc_f53d0cb8a35c4c598710fef5aa7e4b1b.png>) | 목록 내부 스크롤/Design 강조, 미확정 |
| [x] 04 | `sc_aee7229a31504349bca366b57683d09d` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/04_sc_aee7229a31504349bca366b57683d09d.png>) | Design 확정→빈 회사명/Malaysia |
| [x] 05 | `sc_ca3a704790554cda93aaed9d21fa8780` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/05_sc_ca3a704790554cda93aaed9d21fa8780.png>) | Joe Studio 입력·Next |
| [x] 06 | `sc_78103903d92d4ab796d6412ba804cc90` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/06_sc_78103903d92d4ab796d6412ba804cc90.png>) | 사업 형태/매출 빈 값·MYR |
| [x] 07 | `sc_cff7a978591444b9974c2d54fd50762e` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/07_sc_cff7a978591444b9974c2d54fd50762e.png>) | Registered / Incorporated Business |
| [x] 08 | `sc_91aafda2760f434084cdfd0ce6e9c365` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/08_sc_91aafda2760f434084cdfd0ce6e9c365.png>) | Unregistered Business·MYR·RM0 - RM50,000 |
| [x] 09 | `sc_b2c655c6a1c54534b43a1112ef93fb2d` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/09_sc_b2c655c6a1c54534b43a1112ef93fb2d.png>) | 3개 빈 Email·4/5 진행 |
| [x] 10 | `sc_732c37475b694d9e8e068e9330b1974b` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/10_sc_732c37475b694d9e8e068e9330b1974b.png>) | 첫 팀 이메일 입력 |
| [x] 11 | `sc_7f05cc123c5f4b0bab3f31a6e9141492` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/11_sc_7f05cc123c5f4b0bab3f31a6e9141492.png>) | 7개 목적 아이콘행·Client billing 1개·5/5 진행 |
| [x] 12 | `sc_e3d22238252b433d99746f13a11b29db` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/12_sc_e3d22238252b433d99746f13a11b29db.png>) | 목적 4개·연한 Next·불연속 처리 표현 |
| [x] 13 | `sc_64d7275eaa3a48cab57c9f3584c18b7a` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/13_sc_64d7275eaa3a48cab57c9f3584c18b7a.png>) | 앱 셸·타임라인/활동4점 로딩 |
| [x] 14 | `sc_7c8264e8239e464abd4219d7b9828199` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/14_sc_7c8264e8239e464abd4219d7b9828199.png>) | 회사 설정 안내·팀 제안 표시·빈 타임라인 |
| [x] 15 | `sc_009f5dc2c0194960ada61dac094422c3` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/15_sc_009f5dc2c0194960ada61dac094422c3.png>) | 스크롤·빈 손익/활동·USD/0 |
| [x] 16 | `sc_4a22967ce5a64ba59d6fa95b98316852` | [원본 PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/16_sc_4a22967ce5a64ba59d6fa95b98316852.png>) | 스크롤·빈 작업/시간·흐린 예시 |

표의 [x]는 해당 PNG 열람이다. 원본 미수록 동작·요소 전수 계수·구현 시각 동일성 완료가 아니다. 원본 이메일은 로컬 테스트에서 `sample@example.test` 등 가상 값으로 바꿨다.

### 3. 원본 → 분석 → 계획 → 코드

| 원본/ANALYSIS 4·5·8절 | 계획/현재 코드 | 판정·수용 기준 |
| --- | --- | --- |
| 01~05 업종 빈 값/열림/내부 스크롤/확정→회사명/국가 | G13·O01, `company-setup/components/industry-picker.tsx`, `setup-fields.tsx` | 검색은 관찰이 아닌 목. 강조만으로 저장하지 않음. IME Enter·키보드 재열기·확정 후 회사명 초점 보완. 실제 스크롤 대기 |
| 06~08 형태 선택 변화·MYR/매출 | O02, `model/company-types.ts`, `setup-fields.tsx` | 최종 Unregistered 선택 유지, 국가→통화 환산 없음. 전체 옵션/필수 규칙은 미확인; 기존 제한 옵션 목 유지 |
| 진행5개와 미수록 세 번째 질문 | A01, `pages/onboarding/index.tsx` | 빈 근거를 질문으로 창작하지 않음. `One setup step is not recorded`는 별도 목 안내 |
| 09~10 팀 Email3칸 | O02, `invalidInviteIndexes`/SetupFields | 빈 값/형식/대소문자 중복 목 검증. 오류 입력과 안내·초점 연결. Company.invites만 저장; TeamStore Pending 자동 생성 없음 |
| 11~12 목적7행·1/4선택·Next | O02, `setup-fields.tsx`/`company-setup.css` | 숨긴 native checkbox로 접근성 유지, 눈에 보이는 checkbox를 추가하지 않음. 목적 해제/다중 선택, Next 문구 유지. 1개 기본·최소1개·처리 disabled는 목 가정 |
| Next/Back·Pause·직접 URL/동일 경로 | `hooks/use-onboarding.ts` | URL이 단계/returnTo 소유. query/hash/state 보존, 잘못된/미방문/이전 필수값 무효 단계 복구. location.key 변경은 이전 저장 취소 |
| 최종 회사·설정 완료 | `data/create-company-store.ts` 유지 | 같은 company-workspace ID 한 번 저장, setupComplete만 갱신. 단계 이동은 저장 성공이 아님. 실패/취소 초안 보존, 다른 범위/초안의 늦은 저장 차단 |
| 13 로딩→14 안내 | O03, `pages/setup-dashboard/index.tsx` | 이중 이동 없이 초기 로딩 유지, 3점을 원본4점으로 보완. 첫 이름 인사. 최초1초·7일/날짜는 목 fixture |
| 15~16 빈 손익/활동/작업/시간 | O03, `features/tasks/data/create-task-store.ts` | 새 가입 workspace의 표본3건 주입을 차단해 실제 빈 작업 목록 제공. 기존 fixture의3건/직접 만든 작업 보존. MYR/USD·0집계·흐린 그림을 실제 기록으로 해석하지 않음 |
| G15/G17 연결 | 기존 CompanyDetailsDialog/TeamStore | 같은 회사 ID/이름 조회·모달 취소·재로그인 확인. 제안 이메일이 팀목록에 자동 편입되지 않음. G17 기존 비교용 팀 fixture는 별도이며 이번 제안의 발송 결과가 아님 |

### 4. 발견한 문제·수정·재검토

1. 업종 조합 중 Enter를 부모 폼에서만 막아 자식 선택 핸들러가 먼저 업종을 확정했다. 자식 composition ref로 차단했다. 무결과 검색 후 키보드 재열기는 전체 선택지를 다시 제공한다. 업종 선택으로 드러나는 회사명에 초점을 연결했다.
2. 단계 이동이 새 query만 만들어 부가 query/hash/state를 버렸고, 초기 step 없는 이력으로 뒤로 갈 때 최신 초안 step을 사용했다. URL 정보 보존, POP의 첫 단계 복원, 현재 step의 초안 동기화와 미방문/무효 단계 정규화를 추가했다. 앞 단계 필수 입력을 지운 뒤 마지막 URL로 우회할 수 없다.
3. 저장 중 같은 pathname의 returnTo/이력이 바뀌면 기존 저장이 완료됐다. location.key를 취소 수명에 넣어 초안은 보존하고 이전 저장/이동은 폐기한다. 익명 온보딩 직접 진입도 안전한 내부 returnTo를 가입까지 보존한다.
4. 팀 오류 안내와 입력이 연결되지 않았고 pending 때 초점이 비활성 폼에 남았다. 오류 인덱스/aria-invalid/describedby·첫 오류 초점, Cancel saving 초점·취소 후 Next 복원을 보완했다.
5. 원본과 다른 Saving locally 문구를 Next로 돌리고 로컬 처리 안내는 sr-only status로 분리했다. 연한 버튼 흰 글자, 업종 화살표/초점 테두리, 선택행 그림자, 초기4점·첫 이름 인사를 보완했다. 색/그림자는 추정이며 픽셀 동일성을 선언하지 않는다.
6. 후속 작업 저장소가 모든 workspace에 표본3건을 넣어 신규 온보딩의 빈 상태를 깨뜨렸다. PREVIEW_SESSIONS의 기존 비교 workspace만 seed를 사용하고 새 workspace는 빈 목록으로 시작한다. 이후 명시적으로 생성한 작업과 같은 탭 재로그인/Reset 수명은 유지한다.
7. 신규/수정 책임 주석과 회사 설정의 공개 barrel을 적용했다. 기존 G13 Playwright의 전체 이름 인사 기대값도 현재 관찰에 맞는 `Welcome, Sample.`로 정정했다. 이 E2E 파일은 실행하지 않았으며 과거 성공 기록을 이번 검증으로 사용하지 않는다.

최초 테스트 환경의 누락된 scrollIntoView 보완 후, G13 DOM8개가 기존 코드에서 실패해 각각의 결함/불일치를 확인했다. 수정 중 POP 첫 단계와 신규 작업 seed 두 문제가 추가로 드러나 해결했다. 최종 DOM 검증은 실제 앱 Router/history·store를 사용하며 navigation을 mock으로 대체하지 않았다. jsdom의 화면 API와 dialog.showModal/close만 보완했다.

### 5. R4 항목과 공통12 판정

| 항목 | 상태 | 근거·남은 범위 |
| --- | --- | --- |
| R4-F087-O01 | 비교 완료·구현 보완 | 02~05 목록 내부 스크롤/초록 강조와 확정값·회사명/국가 노출을 분리. 합성 조합 중 Enter 선택 차단, 키보드 재열기 검색 초기화·회사명 초점 보완. 실제 스크롤·시각 대기 |
| R4-F087-O02 | 비교 완료·구현 보완 | 06~12 Registered→Unregistered/MYR/매출·이메일3칸·1/4개 아이콘행 선택 유지. 이메일 오류 연결·취소 초점·이력/단계 복구 보완, 처리 중 Next 문구 유지. 필수/건너뛰기/저장 정책은 목; 동일성 대기 |
| R4-F087-O03 | 비교 완료·구현 보완 | 13~16 초기 로딩4점·첫 이름 인사·회사 안내·빈 작업을 보완. 신규 workspace 표본 작업 자동 주입 차단, 기존 fixture/직접 생성 작업 보존. MYR/USD 환산 없음; 흐린 배경 자산/차트·브라우저 대기 |
| R4-F087-A01 | 분석 대기 | 5개 진행 표시/1·4·5 활성 위치 확인. 세 번째 설문·전체 옵션·국가/통화 기본값·목적 효과·발송/역할·촬영/폰트는 미확인. 목 안내와 저장 가정은 원본 확정이 아니며 G13/R02 후속 |

| 기준 | 이번 적용·대기 |
| --- | --- |
| R4-C01 | 식별 대조 수행: F087 16PNG 직접 열람, ANALYSIS LF/PNG SHA-256·MCP ID/URL/순서 일치. 저장 Latest/2146과 이번 응답의 버전 부재·촬영 조건 미확인을 구분 |
| R4-C02 | 좌 설문/우 사진·평점, 5개 진행 표시, 초기 앱 셸/안내/타임라인/손익/활동/작업/시간 구성 대조. 실제 겹침·반응형 렌더 대기 |
| R4-C03 | 주요 필드·목록·선택행·버튼·진행/로딩·체크리스트·빈 카드 대응 작성. 배경/작은 요소의 전수 ID·원본 수/분석 수 계수 미완 |
| R4-C04 | placeholder/선택값/도움말·3이메일/7목적·Next·첫 이름·빈 상태 문구 대조/보완. 가상 이메일·목 안내/Back은 구분, 원문 전체 줄바꿈 동일성 대기 |
| R4-C05 | 원본2880×1800/MCP1440×900. 원본 열람은 PNG 전체, 기존 코드의 60/40·570·371×443·입력50/팀40은 CSS 구현값. 동조건 실제 viewport/DPR/스크롤 비교는 미실행 |
| R4-C06 | Gellix/Arial·16/24 본문·24/30 제목·30/42 우측 제목은 구현값. 원본 폰트 파일·굵기·자간·렌더링 동일성 미확인 |
| R4-C07 | 연한 Next의 흰 글자·초점 테두리/열린 화살표·선택행 그림자/4점 크기 보완. 색상 코드는 기존 근사/추정이며 이번 RGB 측정·전체 픽셀 비교 아님 |
| R4-C08 | 기존 logo/setup-person/setup-ratings/company-leaves와 Lucide 재사용. 자산 생성/원본 수정 없음. 정확한 아이콘·흐린 타임라인/작업 배경·폰트 자산 대기 |
| R4-C09 | 초기/열림/강조/확정·무결과·팀 오류/중복·선택해제·처리/실패/취소/재시도·초기 점 로딩/빈 상태 검증. 캡처 연한 버튼으로 disabled 정책을 확정하지 않음 |
| R4-C10 | 실제 Router/history DOM의 Next/Back·POP·Pause·새 dashboard 의도·직접/잘못된/미방문 step·같은경로 늦은 저장 취소 확인. 실제 브라우저·스크롤·OS IME 대기 |
| R4-C11 | 단계 초안과 최종 회사 저장 분리, 같은 ID·setupComplete·실패/취소 보존·중복 저장/이탈/계정/workspace/Reset 격리 유지. 새 작업공간은 빈 작업으로 시작; 메모리 목 수명 |
| R4-C12 | G01 공통·G10 가입·G11/G12 인증/설정·G14 복귀·G15 회사조회·G17 제안 분리, G25 작업 seed 소비 회귀. 연결 Goal/R 전체 재검토·완료 아님 |

현재 시각 기준은 **원본 동일 재현**이다. 작은 폰트·크기·픽셀 차이도 완료로 허용하지 않는다. 과거 작은 차이 허용 문장은 당시 이력으로만 남긴다. 이번 작업은 요소별 전수 계수/재현 명세 인증을 완료하지 않았으므로 색인의 두 인증 플래그는 false를 유지한다.

### 6. 실제 실행·산출물 제한

환경: Node `v24.18.0`, pnpm `8.14.1`; package 요구 `>=24 <25`/pnpm8.14.1. 아래 명령은 FE/user-web 기준이다. npm 설치/lockfile/ENV/서버 설정 변경 없음.

| 검증 | 실제 결과 |
| --- | --- |
| `pnpm.cmd exec tsc --project tsconfig.app.json --noEmit --incremental false --pretty false` | 통과, 최종 테스트 변경 후 재실행 |
| `pnpm.cmd exec tsc --project tsconfig.node.json --noEmit --incremental false --pretty false` | 통과 |
| `pnpm.cmd exec eslint . --no-cache` | 통과, 최종 변경 후 재실행 |
| Vitest 메모리 실행·전체 | 36파일234/234,198.48s. G13 DOM8 및 새 작업공간 store1 포함. 이후 테스트 보강 전의 전체 실행임을 구분 |
| Vitest 메모리 실행·최신 대상 | G13 DOM9 + company store4 =13/13,23.10s. 전체 실행 뒤 추가한 Pause→Go to dashboard 1개와 검색/키보드·목적해제·G17 연결 보강까지 통과 |
| Vite 메모리 build | 1973모듈·3출력·8.13s, write:false. dist 생성/변경 없음 |
| 원본 무결성 | ANALYSIS LF SHA-256/PNG16 SHA-256·크기, MCP16 ID/URL/순서 일치 |
| 실제 브라우저 연결 | document sessions=[]; 9222/9223 listener·remote-debugging Chrome/Edge 없음. 새 프로필을 만들지 않음 |
| 미리보기 | 기존127.0.0.1:5173/PID30272, Vite dev/HMR HTTP200. 별도5174/PID22864 보존 |
| console/network/API 요청 수 | 직접 관찰 못 함. **미검증/수치 null**, 오류0건·API0건으로 보고하지 않음 |
| 실제 URL/reload/뒤·앞/Tab/스크롤/좁은 화면/OS IME | 실제 브라우저는 미실행. DOM history·합성 composition·긴 한글 입력과 구분 |
| 캡처·픽셀 비교 | 생성/비교 미실행; 경로 N/A. 원본 열람·DOM을 픽셀 동일성으로 사용하지 않음 |

실제 테스트 실행은 PowerShell stdin의 `node --input-type=module`에서 `startVitest('test', filters, ...)`를 호출했다. 임시 스크립트 파일은 만들지 않았다. config:false/configFile:false로 TS config bundling을 피하고 cache:false, fsModuleCache:false, coverage:false, default 콘솔 reporter, deps optimizer client/ssr:false, optimizeDeps noDiscovery:true/include:[], server.watch:null, threads/maxWorkers2/execArgv:[]를 사용했다. Node compile cache와 JITI/JITI_FS cache를 껐다. 전체 filters=[], 최종 filters는 `src/app/router/onboarding-entry.test.tsx`, `src/features/company-setup/data/company-store.test.ts`다.

메모리 build도 같은 stdin 방식으로 Vite `build({configFile:false,plugins:[react()],resolve:{alias:{'@':path.resolve('src')}},css:{postcss:{plugins:[tailwindcss(),autoprefixer()]}},build:{write:false,emptyOutDir:false,copyPublicDir:false,reportCompressedSize:false,sourcemap:false}})`를 실행했다. 기존 Playwright 설정은 JSON reporter·trace·스크린샷·별도 서버/브라우저를 만들므로 실행하지 않았다. 테스트 도구에 출력을 막는 옵션을 적용하고 기존 preview/환경은 보존했다. Browserslist 데이터가 오래되었다는 안내는 있었으며 다운로드/업데이트하지 않았다.

새 파일은 정식 `src/app/router/onboarding-entry.test.tsx`뿐이다. 기존 FE 소스/정식 테스트/문서만 수정했다. evidence/tmp/임시 스크립트/캡처/보고서/manifest/로그 파일과 새 결과 문서를 만들지 않았다. 기존 원본/evidence는 변경·삭제·복원하지 않았다. 로컬 테스트 공급자는 종료 시 폐기했고 UI 장애 시나리오는 테스트 안에서만 설정했다.

### 7. 공통 체크리스트 적용 결과

- [x] START-CHECKLIST 착수: Git·규칙·G13/R02·선행 결과·16단계 원본·포함/제외·현재 코드 대조.
- [x] START-CHECKLIST 흐름: 단계/초안/저장/취소/오류·불연속 관찰·공유 소비·같은 ID 대응과 R4 4항목/12기준 판정.
- [x] START-CHECKLIST 구조/검증: 책임 분리·한글 주석·목 격리·최종 타입/lint/DOM·메모리build 수행.
- [ ] START-CHECKLIST 시각/브라우저/API0: 실제 연결/조건/정밀 자산 부족으로 대기. G13/R02/G01/G14/G84 담당.
- [x] START-CHECKLIST 종료: 기존 G/R·결과·대응표·순서·현재 상태·JSON의 이번 범위 상태 연결. 과거 [x]·미관찰 질문 보존.
- [x] UXUI-REPLICATION: 원본 경로/ID·캡처 조건 한계·목 정책·코드 대응·미완료 기록.
- [ ] UXUI-REPLICATION: 동일 viewport/입력/스크롤의 실제 렌더/픽셀 비교·원본 폰트/수치 확정·네트워크 관찰 대기.
- [x] MOCK-UI-STATE: 단계 초안과 저장 회사/선택 인계의 수명, 실패/취소/경합·같은 ID·새 작업공간 빈 상태·Reset 회귀.
- N/A: 실제 인증/API·Backend·DB·Admin·배포·서버 통합 검증. 이번 FE 목 범위에 포함하지 않았다.

ENGINEERING_REVIEW_CHECKLIST 항목별 적용은 아래 표에 기록한다. [x]는 해당 **검토/로컬 기준** 충족이며 전체 원본/브라우저 완료와 다르다.

| 항목 | 규칙 검토 | 결과·근거 |
| --- | --- | --- |
| E1.1 | 사용자 요청과 기존 변경을 확인하고 불필요한 재구성·도메인 정책 추가를 피했는가? | [x] — 요청·clean HEAD·G13 직접 연결 경계만 보완 |
| E1.2 | Bonsai 화면 관찰·현재 공식 문서·실제 계정 결과·구현 가정을 구분했는가? | [x] — 원본16PNG/MCP·목·미수록·과거 공식 기록 구분 |
| E1.3 | 사용자 목표의 시작·행동·종료·취소·실패를 수용 기준으로 적었는가? | [x] — 결과3·4·6절과 DOM9/store4에 시작/종료/취소/실패 대응 |
| E1.4 | 현재 구현, 목표 규칙, mock 완료, 실제 연동 완료를 구분했는가? | [x] — 구현/시각/브라우저/실연동 상태 분리 |
| E2.1 | page·feature·shared UI·adapter의 책임과 import 방향이 명확한가? | [x] — page/SetupFields·useOnboarding·company/task store·공개 barrel |
| E2.2 | 컴포넌트의 props·callback·controlled 상태 소유자가 분명한가? | [x] — URL/초안/store·controlled 입력 책임 유지 |
| E2.3 | 분리·공통화에 실제 책임 또는 사용처 근거가 있고 범용화가 과도하지 않은가? | [x] — 기존 컴포넌트 활용, 과도한 분리/범용화 없음 |
| E2.4 | 두 앱 사이 feature 직접 import와 순환 의존이 없는가? | [x] — User Web 내부 변경, Admin import·새 순환 없음 |
| E2.5 | 새 의존성을 추가했다면 기존 도구 대비 필요·크기·접근성·유지보수를 검토했는가? | N/A — N/A 새 패키지/의존성 없음 |
| E3.1 | 신규 Bonsai 업무 UI가 mock 계약을 사용하고 fixture·실 API를 직접 호출하지 않는가? | [x] — FE 함수/store만 사용, 실제 API/새 adapter 없음 |
| E3.2 | mock/live 선택이 조립 지점에 있으며 실제 서버 자동 fallback이 없는가? | [x] — 기존 mock-only provider 조립 유지 |
| E3.3 | 실제 인증 유지 또는 mock 진입 방식과 허용 네트워크 요청을 기록했는가? | [ ] 부분/대기 — 목/로컬정적 자산 정책; 실제 network 관찰 대기 |
| E3.4 | 동일 ID의 생성·수정·삭제가 목록·상세·관련 화면에 일관되게 반영되는가? | [x] — 같은 company ID→G15 조회/재로그인·신규 task store 회귀 |
| E3.5 | seed·기준 시각·초기화·저장 수명이 결정적이고 가상 데이터임이 구분되는가? | [x] — 기존 고정시간/메모리수명·신규 workspace 빈 seed 기록 |
| E3.6 | 기존 live 화면에서 API에 없는 상태·관계·성공 결과를 mock으로 몰래 채우지 않는가? | N/A — N/A live 화면/데이터 변경 없음 |
| E3.7 | FE 임시 타입을 확정 DB·공식 API 계약으로 오해할 표현이 없는가? | [x] — FE 가정·서버 후속 구분, API/DB 계약 없음 |
| E4.1 | URL·폼·local state·Query·mock 원본 데이터의 소유권이 중복되지 않는가? | [x] — URL 단계/returnTo·폼초안·저장회사 책임, POP 동기화 |
| E4.2 | query key에 결과를 바꾸는 범위·조건이 포함되고 사용자·workspace·데이터 모드가 격리되는가? | [x] — actor/workspace/revision 기존 격리·store 회귀 |
| E4.3 | 요청 취소, 빠른 대상 변경, 로그아웃 후 늦은 응답을 처리하는가? | [x] — 같은경로 이력/이탈/계정/workspace/Reset 취소 회귀 |
| E4.4 | 저장 대상과 입력값이 제출 시점에 고정되고 중복 제출·재시도·실패 복구가 안전한가? | [x] — 최종 snapshot·중복·실패/재시도·취소 store/DOM 검증 |
| E4.5 | 저장 후 관련 조회·합계·선택 상태가 갱신되고 무관한 캐시를 과도하게 지우지 않는가? | [x] — company publish/인증 완료·task 공유 원본 유지 |
| E4.6 | null·0·빈 결과·부분 집계·금액·날짜 의미가 보존되는가? | [x] — MYR/USD·고정0·빈 작업 구분, 임의 환산 없음 |
| E5.1 | 직접 URL·새로고침·뒤로/앞으로가기·새 탭 링크·잘못된 ID가 의도대로 동작하는가? | [ ] 부분/대기 — DOM 직접URL/POP·provider 경계; 실제 reload/새탭 대기 |
| E5.2 | 키보드만으로 핵심 흐름을 완료하고 포커스 위치를 확인할 수 있는가? | [ ] 부분/대기 — DOM 업종 키보드·오류/단계·취소 초점; 실제 Tab 전수 대기 |
| E5.3 | 모달의 초점 이동·복귀·Esc·배경 비활성과 메뉴의 조작 방식이 적절한가? | [ ] 부분/대기 — G15 DOM cancel/조회, dialog API 대체; 실제 Esc/초점/scroll 대기 |
| E5.4 | label·오류 연결·아이콘 이름·표 header·버튼 type이 올바른가? | [x] — team aria-invalid/describedby·label·숨긴 목적 checkbox 점검 |
| E5.5 | 로딩·빈 데이터·검색 결과 없음·오류·권한 제한·재시도가 구분되는가? | [x] — 열림/무결과·초기로딩/빈값·오류/취소/재시도 확인 |
| E5.6 | 캡처 viewport, 좁은 폭, 확대, 긴 데이터, 스크롤·sticky·overlay를 확인했는가? | [ ] 부분/대기 — 실제 viewport/좁은폭/확대/스크롤 비교 대기; 긴 한글 DOM 확인 |
| E5.7 | IME 입력·터치·reduced motion 등 변경 기능에 해당하는 브라우저 조건을 확인했는가? | [ ] 부분/대기 — 합성 composition 차단 확인, OS IME/터치/엔진별 검증 대기 |
| E6.1 | 모든 신규·동작 변경 컴포넌트·hook·함수에 `// 기능 :` 한글 한 문장 주석이 있는가? | [x] — 신규/변경 함수·hook·component 책임 주석 적용 |
| E6.2 | 복잡한 흐름의 번호 주석이 상태 전환과 이유를 설명하며 코드 한 줄 번역에 그치지 않는가? | [x] — 취소/URL/단계·미수록·seed 경계 이유 분리 |
| E6.3 | strict 타입을 우회하지 않고 effect·listener·timer·observer가 정리되는가? | [x] — strict typecheck/lint 통과·effect/listener/timer cleanup 유지 |
| E6.4 | 권한을 UI에서만 판정하거나 비밀 값을 번들·URL·로그에 노출하지 않는가? | [x] — store owner/scope 검증 유지, 새 비밀/영속 저장 없음 |
| E6.5 | 실제 병목 또는 회귀 위험에 맞게 성능을 확인했는가? | N/A — N/A 새 병목/성능 요구 없음; 재현된 경합·중복 회귀 |
| E7.1 | 변경 범위에 맞는 typecheck·lint·unit·build·E2E를 [테스트 기준](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md)에서 선택했는가? | [ ] 부분/대기 — 무출력 type/lint/단위DOM/메모리build 통과; 실제 E2E 대기 |
| E7.2 | 기존 인증·범용 CRM 경로를 건드렸다면 해당 route·redirect·저장 흐름의 회귀를 확인했는가? | [x] — G10/11/12·공개인계·회사/task 현재 전체 회귀 |
| E7.3 | Admin 변경은 서버 권한 확인·non-admin 차단을 유지하는가? | N/A — N/A Admin/서버 권한 작업 없음 |
| E7.4 | 실행 명령·결과·데이터 모드·브라우저·미실행 범위를 남겼는가? | [x] — 6절 명령/모드/실행결과/미실행 범위 기록 |
| E7.5 | mock 성공과 실제 서버 영속성·외부 효과·운영 검증을 구분했는가? | [x] — 로컬 회사 성공과 실제 서비스/메일/초대/DB 효과 구분 |
| E7.6 | 문서 변경은 링크·명령·현재 소스와의 정합성을 확인했는가? | [x] — 링크·체크·JSON·기존 이력 보존 최종 점검 |

### 8. 남은 차이·목 가정·담당

- [ ] G13/R02: 세 번째 설문/조건부 분기, 전체 업종·국가·통화·매출 선택지, 국가 추정·필수 기준·검색·팀 건너뛰기·실제 초대 역할/발송·목적 효과·MYR/USD 관계를 확인할 원본 근거가 없다. 자료가 확보되면 해당 경계만 재검토한다. 서버 정책 질문은 후속 메모이며 API/DB를 작성하지 않았다.
- [ ] G13/G01/G14: 원본 font family/파일·크기/굵기/행간/자간·정확한 아이콘/색/그림자·촬영 viewport/DPR/배율·줄바꿈, 실제 반응형·스크롤 위치의 동일성 미확인. 원본과 구현을 동조건에서 비교해야 한다.
- [ ] G13: 흐린 타임라인/작업 배경은 현재 단순 CSS/빈 안내로 대체되어 있고 손익/시간 그래프의 정밀 축·간격·재무 필터 표현, 마지막 단계 Back/목 설명·시나리오/미수록 안내는 원본 밖이다. 픽셀 동일성 완료로 표시하지 않았다. 정확 자산/원본 정책 근거 후 보정한다.
- [ ] G13/G14/G15/G17/G84: 실제 브라우저 키보드·포커스/모달 닫기·좁은 폭/확대/스크롤·OS IME·새 탭/reload·console/network·API 요청0 여부를 파일 제한을 지킬 수 있는 기존 연결에서 검증한다.
- 목 유지: 업종은 관찰12개만 검색, Malaysia/MYR 단일 선택, 이름120/팀256·형식/중복·최소목적1개, 빈 팀 통과, 마지막 단계 저장350ms/slow1500ms/fail-once, 초기 대시보드1초·고정 날짜/7일/USD/0은 명시적 목 선택이다.
- 상태 수명: 메모리 초안은 같은 actor/workspace에서 Pause/이력 왕복 유지, logout/workspace/revision 변경 폐기; 저장 회사/직접 생성 작업은 같은 탭 재로그인 유지. Reset/새 공급자/새 문서는 seed부터 다시 시작한다. 화면의 성공이 실제 발송/계정/회사 서버 저장 완료는 아니다.

### 9. 미리보기에서 직접 확인할 순서

1. 기존 **http://127.0.0.1:5173/signup**에서 가상 이메일/이름 Joe Doe/샘플 비밀번호로 가입한다. 실제 계정은 사용하지 않는다.
2. 업종 목록 열기→검색 무결과→Escape→Design 선택→회사명 Joe Studio·Malaysia를 확인한다. Next로 사업 형태 Registered→Unregistered, MYR, RM0 - RM50,000을 선택한다.
3. 미수록 세 번째 질문 안내를 거쳐 팀3칸 중1개 가상 이메일을 입력한다. 잘못된 형식/중복 오류와 수정 초점, 빈 칸 통과를 확인한다.
4. 목적1개/4개 선택·해제, Back/브라우저 뒤·앞, Pause 후 이력 복귀와 Go to dashboard를 구분한다. 후자는 새로운 /app 목적지다.
5. Local setup scenarios에서 slow→Next→Cancel saving, fail-once→Next→오류 후 재시도한다. 정상 확인 뒤 Normal로 돌린다. 완료는 Next 한 번으로만 진행한다.
6. 최초 타임라인/활동4점 로딩→회사 안내·빈 작업/손익/시간을 확인한다. Local setup summary에서 같은 company ID·MYR·팀 제안/발송 없음 표시를 본다.
7. Add Details에서 Joe Studio 조회·취소, 프로필 Logout→같은 가상 계정 로그인으로 저장 회사 복귀를 확인한다. Team의 기존 목 fixture와 온보딩 제안을 구분한다.

위 순서는 사용자가 실제 브라우저에서 따라 할 **잔여 검증 절차**다. 이번 실행에서 이 브라우저 절차를 완료했다고 보고하지 않는다.

### 10. 최종 문서·변경 범위 재검토 — 2026-11-24 KST

- [x] 계획의 기존 Markdown 170개와 PLAN-INDEX.json을 HEAD와 대조했다. 이번에 수정한 기존 문서는 43개이며 새 결과 문서는 없다. 이번 변경으로 추가된 링크·앵커 오류는 0건이다. 동일 검사에서 기존 경로·앵커 오류 221건은 이전과 동일하게 남아 있으며, 계획 전체의 기존 링크가 정상이라는 뜻은 아니다.
- [x] G13 소유 R4 4항목·공통12기준·명세·대응표·JSON 상태가 일치한다. 다른 R4 451항목, 기존 완료 체크·검증 이력, 다른 Goal/R의 전체 상태와 실행 순서 107항목을 보존했다.
- [x] 원본/기존 증거·Backend·ENV 변경 없이 FE 소스·정식 테스트·기존 계획 문서만 변경했다. 새 파일은 정식 `onboarding-entry.test.tsx` 하나다. `git -c core.safecrlf=false diff --check`가 통과했다.
- [x] HEAD는 `7655c202c0095c3efc986300774cdddbe1e1ef0d` 그대로이며 커밋·push·배포·다음 Goal 실행은 하지 않았다. 구현 보완과 단위/DOM 검증을 완료했고 시각 동일성·실제 브라우저·원본 미확정 항목은 부분 완료/대기로 구분했다.

<a id="g13-precommit-review"></a>
### 11. 커밋·push 전 추가 재검토 — 2026-11-24 KST

사용자의 후속 요청에 따라 기존 G13 변경과 직접 소비 경계를 다시 검토했다. 위 커밋/push 없음·234/235개 검증 수치는 당시 수행 이력으로 보존한다. 이번에는 수정·검증 후 `main` 커밋과 `git push origin main`을 승인받았으며, 배포·다음 Goal은 범위 밖이다. 전체 UX/UI 완료를 전제로 한 승인이 아니므로 기존 원본·시각·실제 브라우저 대기를 유지한다.

#### 발견한 결함과 수정

- 초기 대시보드의 1초 로딩 중 같은 `/app` 경로로 새 이력 이동하면, 기존 effect cleanup이 타이머를 취소하지만 이전 `loading=true`가 남았다. 타임라인/활동의 로딩 두 개가 영구 유지되고 회사 설정 안내가 나타나지 않는 문제다.
- `src/pages/setup-dashboard/index.tsx`에서 완료한 location key를 저장하고 현재 location의 `setupJustCompleted`·key와 함께 로딩 여부를 계산하도록 수정했다. 일반 재진입에는 이전 로딩을 넘기지 않으며 최초 온보딩 완료의 4점 로딩·타이머 정리는 유지한다.
- `src/app/router/onboarding-entry.test.tsx`에 실제 App/router/store를 통한 재현을 추가했다. 수정 전에는 예상 로딩0/실제2로 실패했으며, 수정 후 회사/빈 활동/설정 안내의 정상 표시를 확인했다. 단위/DOM의 실제 라우터 이동이며 브라우저 엔진 검증은 아니다.

#### 이번 실행 결과

| 검증 | 결과 |
| --- | --- |
| 추가 결함 수정 전 전체 회귀 | 36파일235/235,174.63s. 새 로딩 사례를 추가하기 전 결과 |
| 새 로딩 회귀의 수정 전 실행 | 1실패/9건 선택 제외,8.87s. 예상0/실제2 로딩으로 재현 |
| 수정 후 G13 DOM·company store | 10+4=14/14,24.97s |
| 수정 후 최종 전체 회귀 | 36파일236/236,169.10s |
| app/node 타입 검사 | `pnpm.cmd exec tsc --project tsconfig.app.json --noEmit --incremental false --pretty false`, node project 동일 옵션 통과 |
| lint | `pnpm.cmd exec eslint . --no-cache` 통과 |
| 최종 메모리 build | 1973모듈·3출력·7.53s, `write:false` 통과 |
| 원본 무결성 | ANALYSIS1/PNG16 SHA-256·크기·기존 MCP16 ID/URL/순서 일치. 이번 추가 검토에서 새 MCP 조회·이미지 전수 재열람은 하지 않음 |
| 브라우저 연결 재확인 | 연결 document session 없음,9222/9223 및 remote-debugging 브라우저 없음. 기존5173/PID30272·5174/PID22864 유지 |
| 문서·diff | 기존43문서 상태/최신 결과 연결·JSON을 대조. 새로운 링크 오류0, 기존 링크 검사 오류221은 유지. 과거 체크/verification·다른 R4 451항목·실행 순서 보존, `git diff --check` 통과 |

테스트/build는 위6절과 같은 stdin 메모리 실행·캐시/보고서/파일 출력 금지 옵션을 사용했다. 최종 전체 filters=[]이며 로딩 단독 재현은 `testNamePattern:'clears initial dashboard loading'`을 적용했다. 임시 파일·새 결과 문서·캡처·trace·로그·브라우저 프로필·기존 증거 변경 없음. 실제 console/network/API 요청 수·픽셀/OS IME 검증은 수행하지 않았고 요청 수는 null이다.

#### 체크·Git 범위

- [x] E4.3/E4.6·E5.5: 초기 표시의 이력 이동 경합과 빈 활동/회사 안내 복구를 재현·수정·회귀 검증했다.
- [x] G13/R02·연결 G 소비 기록, 순서표/대응표/현재 상태의 최신 결과 링크와 PLAN-INDEX 최상위·workflow_review·별도 precommit_review를 일치시켰다. 기존 g13_recheck의 당시 결과는 보존했다.
- [x] push 전 fetch로 원격 `origin/main=8f09ad4ab7f7f4c7230e9ff318ceb2b36fd6ca53`, 로컬 기준 `7655c202`을 확인했다. 원격 전용 커밋0/로컬 기존8개이며 이번 G13 커밋과 G05~G12 기존8개가 함께 push 대상이다. 강제 push나 이력 재작성은 하지 않는다.
- [ ] 원본 동일성·실제 브라우저/console/network·OS IME·미수록 정책은8절 담당에 계속 남긴다. Git 반영을 이 검증들의 완료로 표시하지 않는다.

이 절은 **커밋 전 검토 기록**이다. 커밋/push 명령의 실행 결과와 최종 해시는 후속 응답 및 Git 이력으로 확인한다. 미리보기 주소와 조작은9절을 따르며, 추가 확인 순서는 온보딩 완료 직후 같은 대시보드로 이동→설정 안내·빈 활동이 계속 표시되는지 확인이다.
