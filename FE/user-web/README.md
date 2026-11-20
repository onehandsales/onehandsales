# User Web — Bonsai UX/UI 목 기반

2026-11-21 KST. 기본 진입점부터 로컬 목 프론트다. [G00 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G00_RESULT.md) · [G01 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md) · [R01 분석](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/R01_RESULT.md) · [G02 최초 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md) · [G02 최신 재점검](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RECHECK_RESULT.md) · [G03 소개 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G03_RESULT.md) · [G04 가격·후기 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G04_RESULT.md).

기본 `/`는 Bonsai 랜딩·공통 메뉴다. 공개 웹은 확인한 Gellix WOFF와 로컬 원본 자산을 사용한다. G01 검증 경로는 별도로 유지한다. 원본 비교 후 일부 이미지·색·문자 배치 차이가 남아 **G02 시각 동일성은 대기**다. G03의 Small business·Consulting·CRM 소개를 추가했다. G04 가격·후기 목 화면을 추가했다. 다른 미수록 소개·영상 재생·시각/환경 및 G05 이후 화면은 대기이며 실제 인증·업무 API·Backend·DB 연결은 없다.

G03에서 공개 이메일을 경로별로 분리하고 가입 인계를 이력별 메모리 snapshot으로 보완했다. G03 당시 typecheck/lint/build, unit9, dev/build Chromium E2E각22가 통과했다. G01/G02 회귀를 포함하며 관찰한 흐름의 실제 API·외부 요청·실패·console 오류는0건이다. G03 원본22상태 비교를 수행했고 잔여 시각·page2/다른30소개본문·원본 모바일/상호작용·실제 OS IME/AT 등은 대기다. G02 기존17상태의 남은 차이도 유지한다.

G04 최종 typecheck/lint/build·unit 11/11·dev/build Chromium E2E 각 29/29가 통과했다. G01~G03 회귀를 포함하며 관찰한 실제 API/외부 요청·요청 실패·console 오류는 0건이다. 원본 7상태와 보완 월간·미제공 모달·좁은 두 페이지를 캡처했다. 영상 파일/자막·원본 모바일/CTA 동작·잔여 시각·실제 OS IME/보조기술/추가 브라우저는 대기다.

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
| /signup | G10 미구현 인계, CTA source/이메일/선택 플랜·취소·복귀 |
| /crm | CRM 소개·이메일·12양식 인계·3 FAQ |
| /software/consulting | Consulting 소개·이메일·기능/후기·CTA |
| /software/small-businesses | Small business 소개·demo Dialog·관련 글12개·페이지 이동 |
| /pricing | 과거 월/연 가격·플랜·추가 상품·선택 인계 |
| /reviews | 과거 후기30개·평점·포스터·영상 미제공 Dialog |
| /preview/subscription | G79 미구현 인계, 플랜·주기·표시액 의미·취소 |
| /outbound/reviews/:id | 확인한 외부 리뷰/작성자 주소의 로컬 인계 |
| /templates, /scheduling, /blog/:slug, /form-template/:slug 등 | 담당 Goal을 표시하는 미구현 공개 목적지 |
| /login | G01 가상 Alex/Blair 선택. Bonsai 로그인 전체는 G11 대기 |
| /app | 같은 목 ID의 목록 |
| /app/items/sample-001 | 상세·이름 편집·실패/재시도 |
| /share/sample | 내부 데이터와 분리된 읽기 샘플 |
| /components | Bonsai Button·Field·Dialog 공통 요소 비교 |
| 기타 | 미지원 주소·공개 복귀 |

`/components`·`/app` 등 기반 경로의 Preview controls에서 workspace·지연·다음 조회/저장 1회 실패·빈 상태·제한·초기화를 선택한다. 공개 랜딩에는 개발 도구를 표시하지 않는다.

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
