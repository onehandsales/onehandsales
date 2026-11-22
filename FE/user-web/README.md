# User Web — Bonsai UX/UI 목 기반

최신 상태: G26 하위 작업의 생성·제목·완료·담당자를 독립 목 상태로 구현·검증했다. G27 댓글/활동 및 자료·시각·환경 대기는 유지한다. [G26 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G26_RESULT.md). 이전 수치는 당시 기록이다.

2026-11-21 KST. 기본 진입점부터 로컬 목 프론트다. [G00 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G00_RESULT.md) · [G01 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md) · [R01 분석](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/R01_RESULT.md) · [G02 최초 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md) · [G02 최신 재점검](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RECHECK_RESULT.md) · [G03 소개 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G03_RESULT.md) · [G04 가격·후기 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G04_RESULT.md).

기본 `/`는 Bonsai 랜딩·공통 메뉴다. 공개 웹은 확인한 Gellix WOFF와 로컬 원본 자산을 사용한다. G01 검증 경로는 별도로 유지한다. 원본 비교 후 일부 이미지·색·문자 배치 차이가 남아 **G02 시각 동일성은 대기**다. G03의 Small business·Consulting·CRM 소개를 추가했다. G04 가격·후기 목 화면을 추가했다. 다른 미수록 소개·영상 재생·시각/환경 및 G05의 미수록 본문/목록과 G19 이후 화면은 미착수이며 실제 인증·업무 API·Backend·DB 연결은 없다.

G03에서 공개 이메일을 경로별로 분리하고 가입 인계를 이력별 메모리 snapshot으로 보완했다. G03 당시 typecheck/lint/build, unit9, dev/build Chromium E2E각22가 통과했다. G01/G02 회귀를 포함하며 관찰한 흐름의 실제 API·외부 요청·실패·console 오류는0건이다. G03 원본22상태 비교를 수행했고 잔여 시각·page2/다른30소개본문·원본 모바일/상호작용·실제 OS IME/AT 등은 대기다. G02 기존17상태의 남은 차이도 유지한다.

G04 최종 typecheck/lint/build·unit 11/11·dev/build Chromium E2E 각 29/29가 통과했다. G01~G03 회귀를 포함하며 관찰한 실제 API/외부 요청·요청 실패·console 오류는 0건이다. 원본 7상태와 보완 월간·미제공 모달·좁은 두 페이지를 캡처했다. 영상 파일/자막·원본 모바일/CTA 동작·잔여 시각·실제 OS IME/보조기술/추가 브라우저는 대기다.

## G05~G15 연속 구현 당시 결과 (2026-11-21)

G05~G15를 순차 구현·두 차례 검토·수정했다. 당시 코드 타입/lint/build·unit42/42·전체 개발/빌드 Chromium82/82씩 통과, 관찰 API/외부·실패·console 오류0. G14 공개 인증/선택 복귀와 G15 동일 회사 설정 연결을 확인했다. 아래 과거 단계별 기록은 당시 결과이며 원본·시각·환경 대기는 [최종 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_G15_RESULT.md)에 구분한다. 커밋/Backend/실API/G16 이후 착수 없음.

## 실행

Node 24.x, pnpm 8.14.1. 저장소 루트에서 `FE/user-web`으로 이동한 뒤 실행한다. Corepack은 현재 디렉터리의 packageManager를 사용하므로 이 경로에서 실행해야 한다.

~~~sh
cd FE/user-web
corepack pnpm install --offline --ignore-scripts
corepack pnpm dev --host 127.0.0.1 --strictPort
~~~

미리보기: http://127.0.0.1:5173. 포트가 사용 중이면 해당 프로세스를 종료하지 말고 별도 포트를 명시한다. 오프라인 설치는 기존 패키지 캐시가 있을 때 가능하다.

## 현재 경로

| 경로 | 용도 |
| --- | --- |
| / | Bonsai hero·11단계 랜딩·메가메뉴·이메일·후기·푸터 |
| /signup, /verify-email | G10 가입·로컬 소셜/메일·검증/취소·선택 snapshot |
| /onboarding | G13 사업 초안·미수록 설문 안내·최종 회사 저장·보호 목적지 복귀 |
| /crm | CRM 소개·이메일·12양식 인계·3 FAQ |
| /software/consulting | Consulting 소개·이메일·기능/후기·CTA |
| /software/small-businesses | Small business 소개·demo Dialog·관련 글12개·페이지 이동 |
| /pricing | 과거 월/연 가격·플랜·추가 상품·선택 인계 |
| /reviews | 과거 후기30개·평점·포스터·영상 미제공 Dialog |
| /preview/subscription | G79 미구현 인계, 플랜·주기·표시액 의미·취소 |
| /outbound/reviews/:id | 확인한 외부 리뷰/작성자 주소의 로컬 인계 |
| /blog, /blog/:slug | G05 검색·분류·관찰된 기사와 미수록 본문 안내 |
| /templates, /invoice-template, /form-template/:slug 등 | G06 공개 카탈로그·관찰된 상세·실파일 수신·미수록 안내 |
| /invoice-generator | G07 계산·로컬 가입 인계, PDF 생성 없음 |
| /help, /help/collections/:id, /help/articles/:id, /support | G08 도움말 검색·기사·목차·문의 인계 |
| /affiliates, /careers, /legal/privacy, /legal/terms | G09 소개·정책 발췌·미수록 안내 |
| /scheduling 및 기타 후속 목적지 | 담당 Goal의 미구현 공개 목적지 안내 |
| /login, /two-factor | G11 가상 로그인·소셜/2FA, Alex/Blair 샘플 진입 |
| /password/reset, /password/new | G12 로컬 복구·검증·가상 비밀번호 변경 |
| /app | G13 초기 대시보드·G14 앱 셸 |
| /app/preview | G01 같은 목 ID 목록 |
| /app/settings/company, /u/:slug | G15 회사 편집·저장된 공개 프로필 |
| /app/settings/team | G17 초대·Pending·정확한 행 제거·실패/취소·목 역할/시나리오 |
| /app/settings/branding | G16 회사 로고·관찰 헤더·Sample Invoice·저장/취소·미수록 안내 |
| /app/items/sample-001 | 상세·이름 편집·실패/재시도 |
| /share/sample | 내부 데이터와 분리된 읽기 샘플 |
| /components | Bonsai Button·Field·Dialog 공통 요소 비교 |
| 기타 | 미지원 주소·공개 복귀 |

`/components`·`/app/preview` 등 기반 경로의 Preview controls에서 workspace·지연·다음 조회/저장 1회 실패·빈 상태·제한·초기화를 선택한다. 공개 랜딩에는 개발 도구를 표시하지 않는다.

## 목 데이터 수명

- 브라우저 메모리만 사용한다. 전체 새로고침·새 탭은 가상 세션과 데이터를 초기화한다.
- 같은 탭의 route 이동·가상 로그아웃/재로그인은 저장된 항목을 유지하며 초안과 조회 캐시는 폐기한다.
- Reset preview는 세션·데이터·시각·장애를 초기화하고 `/components`로 돌아간다.
- 공개 이메일은 pathname별 초안이다. CTA는 이력별 메모리 snapshot이며 history에는 opaque ID만 저장한다. 같은 탭 back/forward는 해당 인계를 유지하고, 취소는 출발 경로 초안/인계를 삭제한다. 다른 소개 초안은 유지한다. Reset·사용자/workspace/시나리오 변경·새로고침·새 탭은 모두 삭제한다. 이메일은 URL·로그·storage에 저장하지 않는다.
- FAQ는 단일 열림·재진입 초기화의 목 가정이다. 관련 글 page2는 원본 미확인 안내이며 query로 실제 history를 유지한다. demo는 실제 예약을 수행하지 않는 로컬 Dialog다.
- 가격 주기는 `billing` query에 유지한다. 플랜 CTA는 선택 당시의 가격 버전/주기/금액 의미 snapshot을 전달하며 실제 구독·권한을 바꾸지 않는다. 취소 시 출발 pathname의 초안/인계를 지우고 복귀 query는 유지한다. 영상 파일이 없어 미제공 Dialog만 표시하며 외부 리뷰 주소도 로컬 안내로만 연결한다.
- 사용자·workspace·revision으로 조회와 변경을 격리하고 늦은 저장을 차단한다.
- ScrollRestoration은 sessionStorage에 스크롤 위치만 저장한다. 실제 인증 storage나 .env를 읽어 live 모드로 전환하지 않는다.
- 로컬 Promise 공급자는 FE 내부 타입이다. API 명세·HTTP adapter·DB 모델이 아니다.

## 검증

`FE/user-web`에서 실행한다.

~~~sh
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run test
corepack pnpm run test:e2e
corepack pnpm run build
corepack pnpm run test:e2e:preview
~~~

E2E는 별도 dev5175·preview4175 서버를 사용한다. 실행 중인 다른 서버를 재사용하거나 종료하지 않는다. Chromium 설치가 필요한 새 환경은 Playwright 브라우저를 준비한다. 네트워크를 가로채지 않고 실제 요청을 관찰하여 API·외부 요청·console 오류 0건을 검사한다.

5173 미리보기 실행 중 `FE/user-web`에서 `node scripts/capture-landing.mjs`, `python3 scripts/compare-landing.py`로 현재 캡처와 비교 이미지를 생성한다. Python/Pillow가 필요하다. 두 명령에 같은 `CAPTURE_OUTPUT` 절대 경로를 설정하면 과거 증거를 보존하면서 별도 폴더에 저장한다. 생략 시 계획의 `RESULTS/evidence/g02`를 사용하므로 기존 결과가 덮어써진다. 이번 증거는 `RESULTS/evidence/g02-recheck/before`와 `final`로 분리했다. `node scripts/capture-foundation.mjs`는 G01 회귀를 `evidence/g02-foundation-regression`에 별도 기록한다. E2E dev/production 출력 폴더도 분리한다.

G03은 `node scripts/capture-introductions.mjs`, `python3 scripts/compare-introductions.py`로22상태와 좁은3페이지·pair/overlay/diff를 생성한다. Python/Pillow가 필요하며 `CAPTURE_OUTPUT`을 생략하면 `RESULTS/evidence/g03`를 덮어쓴다. 기존 증거를 보존하려면 같은 새 절대 경로를 두 명령에 지정한다. 원본2880×1800은1440×900으로 정규화하며 원본 DPR을 추정 사실로 확정하지 않는다.

G04는 `node scripts/capture-commercial.mjs`, `python3 scripts/compare-commercial.py`로 원본 7상태·보완 월간·영상 미제공 모달·좁은 2화면과 비교 이미지를 생성한다. Python/Pillow가 필요하다. 두 명령에 같은 `CAPTURE_OUTPUT` 절대 경로를 지정하지 않으면 기존 `RESULTS/evidence/g04`를 덮어쓴다. 원본 조건이 미확인이므로 1440×900 정규화·관찰 앵커와 실제 캡처 좌표를 기록한다.

## 규칙과 다음 작업

[현재 구조](ARCHITECTURE.md), [FRONT_AGENT](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [결정 006](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/006_bonsai_uxui_only_phase.md)을 따른다. 컴포넌트·hook·함수에 한 줄 한글 책임 주석을 작성한다.

G02의 시각 차이·원본 모바일/자동 전환·자산 사용 조건은 결과 문서의 대기 항목이다. G03은 공개 메뉴·폰트·로컬 인계 기반을 소비했으며 세 소개 구현·검증과 전체 완료 대기를 구분한다. 누락 본문·잔여 시각·추가 환경은 G03 결과에 남겼다. 내부 앱 Outfit의 원본 동일성은 미확인이다. 후속 Goal 자동 착수·커밋·배포는 하지 않는다.


### G05 연속 작업의 현재 결과

2026-11-21: `/blog` 검색·분류·페이지, 관찰된 기사 목차·스크롤·가입 인계와 원래 목록 복귀를 추가했다. 공개 QueryScope는 업무/공유와 분리한다. typecheck/lint/build·unit14/14·dev/build Chromium각33/33 통과, 실제 API/외부 요청0. 전체 기사/목록·시각/환경은 대기다. [G05 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_RESULT.md), [G05~G15 진행](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_G15_PROGRESS.md). `node scripts/capture-content.mjs`와 Pillow 환경의 `python scripts/compare-content.py`로 캡처·비교를 재현한다.

## G06 공개 템플릿 추가 (2026-11-21)

`pages/templates`는 `features/public-template`의 카탈로그/상세/청구서 파일 안내를 조립한다. 공개 ID와 계정 복제본을 구분하고, 로컬 파일15개는 실제 다운로드·해시 검증을 수행했다. Google 문서는 로컬 Dialog만 사용한다. PublicProvider의 이력별 template snapshot은 기존 이메일·가격을 보존한다. ScrollRestoration 키는 경로+검색+history key이며 다른 직접 URL의 스크롤을 섞지 않는다. [G06 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G06_RESULT.md)에 검토·검증·남은 차이를 기록했다. unit15, 전체 dev/build38개 및 최종 G06 대상5개씩 통과했다. 가입 후 복귀는 G10~G14에서 종합 검증한다.

G07 `/invoice-generator`: 메모리 초안·고정15% 표본·행 계산/검증·로컬 가입 snapshot. PDF/계정 문서 생성은 없으며 초안은 refresh/scope 변경에서 초기화한다. 최종 G07 unit18/dev42/build42. 상세 `TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G07_RESULT.md`.

G08 `/help`, `/help/collections/:id`, `/help/articles/:id`, `/support`: 제공된 기사/검색/분류·로컬 피드백·문의 링크 안내. 영상/미수록 본문은 명시하고 실제 외부 채널은 호출하지 않는다. unit18·관련 dev/build20+최종 대상5씩. 상세 `TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G08_RESULT.md`.

G09 `/affiliates`, `/careers`, `/legal/privacy`, `/legal/terms`, `/outbound/*`: 과거 시안·정책 발췌·로컬 목적지 안내. unit18/전체 dev/build51+마지막 대상4씩 통과, 정책 버전/시각/환경 대기. 결과 `TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G09_RESULT.md`.

G10의 `features/mock-auth`는 메모리 계정/digest·도전·선택 인계를 관리한다. AuthLayout은 공개/내부 레이아웃과 분리되며 실제 인증/메일/CAPTCHA를 호출하지 않는다. Preview resetGeneration은 Reset의 계정 seed 초기화를 구분하고 일반 revision 초안 초기화를 유지한다. [G10 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G10_RESULT.md)에 두 차례 검토/검증과 후속 연결 대기를 기록했다.

G11: `/login`, `/two-factor`와 계정 메뉴 Logout은 같은 메모리 계정을 사용한다. 실제 OAuth/메일/CAPTCHA 없음. unit30/관련 dev·build26씩, [결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G11_RESULT.md). G13/G14 연결 대기.

G12: `/password/reset` → 로컬 가상 링크 → `/password/new` → 빈 `/login`. 실제 메일 없음. 같은 계정 비밀번호 변경/취소·만료 검증, unit34/관련 dev·build23씩. [결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G12_RESULT.md).

G13: `/onboarding`은 확인된 질문·미수록 안내·초안·실패/취소를 거쳐 같은 workspace/company를 저장한다. 신규 계정 `/app`의 초기 빈 대시보드, unit38/관련 dev·build26씩+최종3씩. [결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G13_RESULT.md). G14/G15 연결 대기.

### G14 연결 갱신 (2026-11-21)

G14 `/app` 셸/초기 대시보드·`/app/preview` G01 검증·`/auth/continue` 현재 범위 선택 복귀·공개/내부404. unit38/관련 dev/build41씩. G15 회사 편집은 다음 순서다. [결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G14_RESULT.md).

### G15 회사 설정 구조

`/app` Add Details와 `/app/settings/company`는 G13 같은 CompanyStore를 편집한다. 주소 하위 저장은 전체 회사 저장과 분리한다. 로고는 로컬 File·표시 object URL만 사용하며 교체/이탈에서 해제한다. `/u/:slug`는 명시적 목 공개 화면으로 저장된 on/off를 소비하며 `/share/sample`과 독립이다. 새로고침/새 탭은 메모리를 초기화한다. [G15 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G15_RESULT.md).

## G16 문서 브랜드 (2026-11-21)

기존 회사 설정에서 Branding으로 이동한다. No image/Abstract/Plant와 로컬 로고는 초안 미리보기만 바꾸고 Save 성공으로 같은 회사의 기본값을 저장한다. Cancel save는 입력 유지, Discard/이탈은 입력 폐기다. 미수록 옵션은 값을 유지하는 안내로 구분한다. 새 문서 복사는 최소 단위 fixture만 있고 실제 문서 작성 화면·G07 연결은 없다.

타입/lint/unit47/build, 전체 개발/빌드96개씩 및 시각 보정 후 G16 대상6개씩 통과. 실패한 최초 대상 검사와 재실행은 [G16 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G16_RESULT.md)에 따로 기록한다. 기존 원본/시각/환경 대기는 유지한다. 이번 캡처/로그는 사용자 지시에 따라 `/tmp/onehandsales-g16`에 두며 삭제된 과거 자료를 복원하지 않았다.

## G17 멤버 초대·대기 제거 (2026-11-21)

TeamStore는 workspace별 메모리 원본, 모달 입력은 화면 수명이다. G13 이메일 제안과 자동 연결하지 않으며 G18 수락은 아래 후속 기록에서 같은 ID로 연결했다(이 절의 G17 당시 결과와 구분). [현재 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G17_RESULT.md)에 시안/목 정책·실행 실패/재실행·네트워크·비교·남은 범위와 5173 확인 순서를 기록했다. 이번 자료는 `/tmp/onehandsales-g17`에만 두었다.

## G18 초대 수락·협업자 접근 (2026-11-21~22)

`/invite/:workspaceId/:invitationId`는 G17 Team preview controls의 로컬 초대 링크로 진입한다. 같은 Pending ID를 성공 때만 Joined로 바꾸며 새/기존 계정·불일치·실패·만료·취소를 목으로 처리한다. `/app/projects`, `/app/projects/:projectId`, `/app/tasks`는 G18의 최소 협업 화면이며 G21~G27에서 업무 저장소와 연결한다. 초대 membership은 workspace별이고 회사/재무/팀 직접 URL을 차단한다. [현재 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G18_RESULT.md)의 최초 실패/재실행·시각/환경 대기를 유지한다. 커밋은 이번 연속 요청 범위에서만 승인됐고 push/배포는 하지 않는다.
