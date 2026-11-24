# G02 실행 결과 — 랜딩·공통 메뉴

**현재: [2026-11-23 G02 R4 결과](G02_RECHECK_RESULT.md#g02-r4-recheck).** 메뉴/후기 보완·단위/DOM112개·메모리 빌드 통과. 시각 동일성·실제 브라우저 상세/네트워크 대기.

**2026-11-20 재점검 이력:** [기존 재점검](G02_RECHECK_RESULT.md). 이번 재현 결함 수정·2차 검토, unit9/9·dev/build E2E 각15/15 통과. 원본17상태 비교 수행, 잔여 시각 차이·미수록 동작·추가 환경 검증 대기. G02 전체 완료 판정은 보류한다.

아래 1~7절은 이전 Windows 실행 기록이며 현재 코드의 재검증 결과로 대신하지 않는다.

2026-11-20 KST. **목 구현·코드 검토·현재 Chromium 기능 검증 완료 / 원본 비교 수행 / 시각 동일성·일부 환경 검증 대기. G02 전체 완료로 판정하지 않는다.** 실제 인증·업무·외부 서비스 API 연결, Backend·DB 작업, 계정 재현, 커밋·push·배포는 없다. G03을 시작하지 않았다.

## 1. 범위와 원본

- 시작 Git: `0da8f250`, clean. 기존 5173/5174 프로세스를 보존했다. `.env` 내용 출력·변경 없이 해시를 대조한다.
- 기본 `/`를 기반 검증 링크 화면에서 Bonsai 랜딩으로 교체했다. hero·제품 홍보·기능 링크·후기·금융·고객 경험·리뷰·지원·체험·푸터, 4종 메가메뉴와 템플릿 유형 선택을 구현했다.
- G01의 로그인 선택·목 목록/상세/편집·공유·공통 Dialog는 유지했다. `/login`은 G11 대기를 명시하고 `/signup`은 G10 인계 화면이다. 미구현 공개 목적지에는 담당 Goal·미구현 상태·랜딩 복귀만 있다.
- [R01 결과](R01_RESULT.md), [22흐름 111단계 MCP 응답](evidence/r01-public-flows.json), [Landing 조회](evidence/r01-g02-source-manifest.json)가 근거다. Gummble `bonsai-web` / 앱 `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` / Latest `2146`. 제품 빌드·촬영일·OS·DPR은 미확인이다.
- 현재 공식 웹 Geist 디자인은 채택하지 않았다. Gummble과 대응하는 공식 2024-02-03 보관 HTML/CSS에서 Gellix·자산·누락 영역을 보완했다. 실제 Gellix 400/500/600/700 파일 4개를 로컬 로딩했다. 내부 앱 Outfit의 원본 동일성은 여전히 미확인이다.
- [자산 47개](evidence/g02-asset-manifest.json) 1,428,345 bytes. 사용 조건은 [자산 안내](../../../FE/user-web/public/bonsai-public/README.md)에 구분했다. 상업/재배포 권한 확인 대기이며 운영 공개하지 않았다.

## 2. 구조·상태·후속 연결

| 코드 | 책임과 검토 결과 |
| --- | --- |
| `src/app/router/router.tsx`, `layouts/route-frame.tsx` | 실제 Router·직접 URL·공개/기반 경계·본문 초점·ScrollRestoration. navigation mock 없음 |
| `layouts/public-layout.tsx` | 공개 폰트/스타일·헤더·푸터 조립. 경로 변경 시 열린 메뉴 폐기, 스크롤 리스너 정리 |
| `pages/public/index.tsx` | 순서대로 랜딩 feature 조합. API·입력 상태 없음 |
| `features/public-web/components/public-provider.tsx`, `data/public-context.ts` | 이메일 초안·CTA 출처/이메일/복귀 `/`를 메모리에 소유. URL·로그·storage에 이메일 저장 안 함 |
| `hooks/use-public-menu.ts`, `components/public-header.tsx` | hover/click·외부 닫기·Escape·Tab·초점 복귀·템플릿 세로 탭. 리스너 해제 |
| `components/landing-hero.tsx` | controlled email, 형식 오류·수정·재시도·IME 제출 방지·로컬 가입 인계 |
| `components/landing-sections.tsx`, `public-footer.tsx` | 후기/홍보 패널의 지역 상태, 실제 링크, 푸터 disclosure. 홍보 이미지 내부 버튼은 실제 업무가 아님 |
| `data/navigation-content.json`, `model/public-destinations.ts` | 보관본의 원본 href와 로컬 경로/담당 Goal 분리. API 계약이 아님 |
| `pages/public-pending/index.tsx` | 미구현 목적지 표시·CTA 내용·취소·랜딩 복귀. 가입 성공/전송으로 표현하지 않음 |
| `styles/public-web.css` | 공개 전용 Gellix/색/치수 token. 내부 공통 UI token 변경 없음 |

이메일은 같은 탭에서 뒤로 복귀하면 유지, 인계 취소·G01 Reset·가상 사용자/workspace/시나리오 revision 변경·새로고침·새 탭에서는 제거한다. 메뉴/후기/금융/브랜딩 선택은 화면 수명이며 재진입 시 초기값이다. 스크롤만 sessionStorage로 복원한다. Reset preview는 공개 랜딩에 개발 도구를 섞지 않도록 `/components`로 돌아간다. G01의 단일 목 ID·초안/저장·지연/실패 정책은 유지했다.

정적 랜딩에는 업무 조회 loading/권한 실패를 새로 만들지 않았다. 입력 검증 실패·취소·재시도는 G02, 비동기 실패·경합은 G01 회귀에서 검증한다. 가입 서비스 실패·OAuth는 G10/G11의 후속 목 시나리오다.

목적지: 제품/업종 G03, 가격/후기 G04, blog/resources/rates/세금 hub/비교/`a/online-contract-maker` G05, template 경로 G06, `/invoice-generator` G07, help/support G08, legal/careers/affiliates/social G09. 템플릿 `See all templates`는 선택한 원본 경로를 보존한다. 실제 목적지 전면 구현은 각 Goal에 남겼다.

## 3. Flow·Screen·구현 대응

Landing Flow ID: `f1a89cc0-4dc8-4576-b912-78231a2a7b1a`. 아래 모두 `/`의 같은 페이지이며 스크롤 단계를 다른 페이지로 합치거나 생략하지 않았다. 각 비교 링크는 좌 원본/우 구현이다. 같은 이름의 `-overlay.png`, `-diff.png`도 [비교 폴더](evidence/g02/comparisons)에 있다.

| 단계·Screen ID | 컴포넌트·행동 | 최종 비교·판정 |
| --- | --- | --- |
| 01 `sc_f832f286d2d74611a3f6486b79cb36ec` | ProductOverview, 대시보드/폰 홍보 이미지 | [비교](evidence/g02/comparisons/step-01-pair.jpg), 이미지 위치 구현·색/그림자 차이 |
| 02 `sc_337ce046f7184e07b2f841009066cf95` | ProductOverview, 3열/12링크→로컬 담당 Goal | [비교](evidence/g02/comparisons/step-02-pair.jpg), 열/행/후기 간격 수정 |
| 03 `sc_2acfdf88f60f4638b4f3f97b6023c9cc` | Testimonials, 03 Alexandre | [비교](evidence/g02/comparisons/step-03-pair.jpg), 수동 선택·배경/텍스트 대조 |
| 04 `sc_fe9ef5d8bdf049cbabad33e42a6529c1` | Testimonials, 01 Alison | [비교](evidence/g02/comparisons/step-04-pair.jpg), 원본의 다른 후기 상태 재현 |
| 05 `sc_b36874f940ae40f085f0df38ee4a95cd` | FinanceOverview, 금융 3항목/인보이스 이미지 | [비교](evidence/g02/comparisons/step-05-pair.jpg), 선택·Learn more·본문 세로 위치 수정 |
| 06 `sc_b410b2592edd40b99c423c2af0f73f6f` | ClientExperience, White labelled 기본/3선택 | [비교](evidence/g02/comparisons/step-06-pair.jpg), 제목 줄바꿈 수정·래스터/배경 차이 |
| 07 `sc_c817e4443d78499394491227920ac96b` | ReviewHighlights, 집계/18후기 | [비교](evidence/g02/comparisons/step-07-pair.jpg), 강조색 수정·칩 폭/배열 미세 차이 |
| 08 `sc_81b8d00c272c4f709e9a04919113069b` | SupportAndTrial, Contact→G08/체험→G10 | [비교](evidence/g02/comparisons/step-08-pair.jpg), 설명 폭/간격 수정·지원 이미지 변형 차이 |
| 09 `sc_33704472c1d54fda8c9605958d1af9d9` | SupportAndTrial, 최종 CTA/푸터 시작 | [비교](evidence/g02/comparisons/step-09-pair.jpg), 높이/정렬 수정·무늬/문자 위치 차이 |
| 10 `sc_a1fa28afd409416f88fe3625082ddfac` | PublicFooter, 5열/템플릿 펼침 | [비교](evidence/g02/comparisons/step-10-pair.jpg), 열 위치·행 간격 수정 |
| 11 `sc_f5d10f7c06c44873bf3b7048ad5e4566` | PublicFooter, 소셜/역사적 법적 카피 | [비교](evidence/g02/comparisons/step-11-pair.jpg), 외부 이동 대신 G09·italic 근사 |

보완 출처는 독립 캡처다. 같은 계정·시각의 연속 실행으로 합치지 않는다.

| 출처 Flow ID·단계·Screen ID | 구현 대응·캡처 |
| --- | --- |
| Logging in `a02409b3-6eb0-4bc0-b702-22a42e0990c8` 01 / `sc_07904520440b4dc7ad7d6d31bf3a03e9` | LandingHero [hero 비교](evidence/g02/comparisons/hero-pair.jpg). Onboarding 공통 이미지 재사용, 인증 전체 구현 아님 |
| Products(CRM) `12ca870d-d929-4cc8-ab4c-60436c2eac13` 01 / `sc_2ce9fd14ccb74e05977de48b5517e78c` | PublicHeader Product [비교](evidence/g02/comparisons/menu-product-pair.jpg) |
| Industries `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` 01 / `sc_b71347cc8821454593507a2b9cb4a512` | PublicHeader Industries [비교](evidence/g02/comparisons/menu-industries-pair.jpg) |
| Blog `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` 01 / `sc_549a6fa823b74e3e8d826750df6f1f99` | PublicHeader Resources [비교](evidence/g02/comparisons/menu-resources-pair.jpg) |
| Invoice templates `a0181c28-2521-46d3-a0e6-3ead4851b2f9` 01 / `sc_d68dbb7304bb45ac9755138b12ce3141` | TemplateMenu Contract [비교](evidence/g02/comparisons/menu-templates-pair.jpg) |
| 같은 Flow 02 / `sc_eac8d5a2e97d47c496455da557912622` | TemplateMenu Invoice [비교](evidence/g02/comparisons/menu-invoice-pair.jpg) |

## 4. 측정·시각 검토

원본 2880×1800을 Lanczos 1440×900으로 정규화했다. MCP1440×900을 참고했으며 원본 DPR을 2라고 확정하지 않았다. 구현은 Chromium148.0.7778.96, viewport1440×900, deviceScaleFactor1, 폰트 ready/이미지 로드 후 캡처했다. 관찰 요소의 y좌표로 스크롤을 맞춘 실제 scrollY는 [캡처 기록](evidence/g02/capture-evidence.json)에 있다. 원본 scrollY는 미기록이므로 같다고 주장하지 않는다.

| 값 | 근거·구현 | 미확인/차이 |
| --- | --- | --- |
| Gellix 400/500/600/700 | 보관 CSS의 실제 WOFF 파일·로컬 제공 | Gummble 촬영 당시 파일 해시·렌더러 미확인 |
| hero 60/60px/700, body16/24px/500, nav16/20px/500/letter .25px | 보관 CSS·원본과 대조 | 전체 문자열의 glyph raster 차이 남음 |
| section h2 42px/700, quote28/36px/500 | 보관 CSS와 비교 조정 | 부분 위치/행간은 측정 근사 |
| container1064px, wide1280px, header70px | 1440px 원본 관찰 | 화면 밖 전체 문서 치수는 보관본 보완 |
| hero문단380px, email420×48px, testimonial1100×380px, photo301px | 원본 측정·비교 조정 | 이미지 그림자/색상·몇 px 차이 |
| 색 ink003026, green16a000, surfacefcfcfc, muted597469 | 정규화 PNG 표본·시각 보정 | 보관 CSS003c2f/22ad01/white와 다름; 원본 CSS 값으로 확정하지 않음 |
| 스크롤 header top52px | 원본 스크롤 단계 공통 관찰 | 브라우저 장식/촬영 조건 여부 미확인. 데스크톱 비교용 구현 가정 |
| shadow·일부 radius·모바일 간격 | 보관 CSS와 시각 추정 | 원본 전체 computed style 미확인 |

17개 전체 화면의 pair/overlay/diff를 생성하고 시각 검토했다. UI를 마스킹하거나 차이를 지운 계산은 하지 않았다. [수치](evidence/g02/visual-metrics.json)의 RGB MAE는 오차 진단이며 합격률/동일성 점수가 아니다. 수정 전 표본은 [before-review](evidence/g02/before-review)에 보존했다. 대표적으로 단계02 MAE16.0206→3.2135, 단계07 12.4251→6.7803, 단계10 6.1510→3.7635다. 특정 색 조정으로 메뉴 일부 MAE는 소폭 증가했으므로 모두 개선됐다고 하지 않는다.

남은 차이: 홍보 이미지/사진의 색·선명도와 배경 무늬/그림자, 후기 칩 폭, 일부 텍스트/버튼 1~수 px 위치, 메뉴 뒤 이메일 placeholder(`work email`/hero의 `email`) 버전 차이, footer synthetic italic, 모바일 원본 부재. 사진 압축·OS/font raster 가능성과 실제 레이아웃·자산 차이를 구분하며 모두 OS 탓으로 처리하지 않는다. **픽셀 동일성 완료가 아니다.**

후기 자동 전환 시간, 금융/브랜딩 자동 전환 여부는 미확인이다. 수동 버튼을 구현했고 짧은 후기 marquee는 정적 배열로 재현했다. 새로고침 기본 후기03/금융0/브랜딩2는 원본 비교용 가정이다. 메뉴 keyboard/focus·모바일·입력 검증 오류 문구는 명시한 목/접근성 보완이다. 랜딩에는 FAQ/영상 UI를 임의로 추가하지 않았다.

## 5. FRONT_AGENT 검토와 수정

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 실제 변경 범위를 검토했다. 문서를 읽었다는 사실이나 테스트 수로 준수를 대신하지 않았다.

| 규칙 범위 | 코드·판정 | 수정·검증 근거 |
| --- | --- | --- |
| 1 범위·출처·수용 기준 | R01/이 결과의 원본·보관본·목 가정 분리. G03 이후는 미구현 인계 | hero/메뉴 보완 범위와 후속 Goal 명시; 실계정 N/A |
| 2 구조·컴포넌트·의존 | app→pages/feature export, UI는 독립. public feature에 state/menu/content 책임 분리 | G01 공통 UI 수정 없이 공개 CSS 범위 분리. 신규 패키지/다른 앱 import 없음 |
| 3 데이터·mock | PublicProvider 메모리/소유권, 원본 href→local route, 기존runtime 단일 ID | 브라우저 email storage 미저장·refresh/new tab/reset; G01 목록/상세 일관성 회귀. 서버fallback 없음 |
| 4 상태·비동기 | 공개 선택은 local, 이메일/CTA는 provider, URL은 경로, 스크롤은 Router | 공개 폼 동기 인계·invalid 재시도; G01 취소/늦은 저장/사용자·workspace격리 재검증. 금융 계산/부분집계 N/A |
| 5 UX·접근성 | 진짜 Link/Button·label/error·tab ARIA·details·Escape·본문 초점 | hover Escape 실패 수정, 직접 URL/history/scroll/new tab/320~1920/CSSzoom2/합성 IME/reduced motion 통과. 실제 OS IME/AT/기기 대기 |
| 6 주석·타입·보안·성능 | 신규 component/hook/helper 한글 책임 주석, 의미 있는 제출 단계·이유, listener cleanup, strict 유지 | 복잡한 익명 입력/탭 handlers 추출. 콘솔 중복 key 수정. 이메일 로그/URL 노출 없음. unused자산43개 제거 |
| 7 검증·인계 | typecheck/lint/unit/build/dev·production E2E, 현재 캡처 | 아래 실행 기록. Admin권한 N/A(변경 없음), 실제 운영/API N/A(금지 범위), 시각 대기 별도 |

| 발견한 문제 | 원인·수정 | 재검증 |
| --- | --- | --- |
| 중복 React key 콘솔 오류 | 후기 `A`/같은 href의 서로 다른 푸터 항목 → 전체 강조문·label+href 키 | fixture console0, 전체 E2E |
| hover로 연 메뉴의 Escape 무반응 | 초점이 헤더 밖이면 root keydown 미수신 → 열린 메뉴 수명 동안 document Escape 관찰 | hover→Escape→trigger focus→Enter 회귀 |
| 템플릿 전체 보기의 유형 소실 | 하드코딩 `/templates` → 선택 group의 원본 href | Invoice→`/invoice-template` 실제 navigation |
| 자료/비교 링크 Goal 오배정 | 경로 기본값G03 → resources/alternatives를G05로 명시 | 12대표 목적지 직접 URL 검사 |
| 공개 페이지에서 기존 G01 검증 흐름 불일치 | `/`교체로 개발 도구 위치 변경 → Reset `/components`, capture/test 실행 기준 갱신 | G01 7 E2E 현재 실행·현재 Dialog 캡처 |
| 정적 자산 reload 중 ERR_ABORTED | 로딩 완료 전 강제 refresh한 테스트 → 실제 리소스 완료 후 refresh | 실패 요청을 무시/가로채지 않고0건 확인 |
| 새 탭 네트워크 관찰 누락 | page 관찰만 사용 → context request + 모든page error/socket관찰 | 새 탭 `/signup` 포함0건 |
| 시각 배치/강조/자산 차이 | 폰 크기·금융 y·후기/푸터 간격·템플릿 열·리뷰 강조·배경 자산 수정 | 같은 조건 최종 캡처·pair/overlay/diff 재검토, 잔여 차이 유지 |

## 6. 실행 결과

실행 디렉터리 `FE/user-web`, Node24.18.0/pnpm8.14.1. 현재 변경 코드에서 실행했다.

| 명령 | 결과 |
| --- | --- |
| `pnpm.cmd typecheck` | 통과 |
| `pnpm.cmd lint` | 통과 |
| `pnpm.cmd test` | Vitest 9/9 통과, 기존 목 저장소 회귀 |
| `pnpm.cmd build` | 통과, 새 랜딩 기본 진입; JS392.33kB/gzip121.35kB, CSS35.91kB/gzip8.15kB |
| `pnpm.cmd test:e2e` | Chromium 개발5175, 14/14 통과 |
| `pnpm.cmd test:e2e:preview` | production4175, 최종 결과는 검증 증거와 함께 기록 |
| `node scripts/capture-landing.mjs` | 현재5173, desktop17상태+390px전체 페이지, 정적109요청/API·외부0/실패0 |
| `python -X utf8 scripts/compare-landing.py` | Pillow로17 pair/overlay/diff 생성, 색 보정/마스크 없음 |
| `node scripts/capture-foundation.mjs` | 현재 G01 Dialog460×336/field380×40/button420×46, Outfit 유지·오류0 |

네트워크를 차단·가로채지 않았다. dev는 같은 origin 정적파일과 Vite HMR, production은 로컬 정적파일만 허용했다. 실제API 요청0은 브라우저 시나리오 관찰 및 소스 검사 범위다. 조사용 MCP/공식 자료 GET과 제품 런타임 요청을 구분한다. [G01 현재 회귀 캡처](evidence/g02-foundation-regression/g01-dialog.png)와 [현재 치수](evidence/g02-foundation-regression/g01-visual-metrics.json)는 과거 G01 결과를 대신 재사용한 것이 아니다.

새 테스트7개 + 유지/갱신 G01 7개. 실패한 기존 케이스를 제거하거나 navigation을 mock하지 않았다. 콘솔·리소스 실패도 assertion 대상이다. Node FORCE_COLOR/NO_COLOR와 Browserslist DB 안내는 도구 경고이며 페이지 console 오류와 구분한다.

## 7. 직접 확인 순서·남은 검증

1. 기존 미리보기 `http://127.0.0.1:5173/`를 연다. 새 환경은 `pnpm.cmd -C FE/user-web dev --host 127.0.0.1 --strictPort`. 기존 점유 프로세스를 종료하지 않는다.
2. Product hover→Escape→Enter, 바깥 클릭. Templates→방향키로 Invoice→See all templates→G06 대기→뒤로/앞으로/새로고침.
3. hero 이메일 `invalid`→오류→`preview@example.test`→가입 인계→뒤로 유지→취소 삭제. 새 탭/새로고침에서는 초안이 없다.
4. 11단계 섹션까지 스크롤하고 후기01/03, Banking, Doc templates, 푸터 Contracts 펼침/닫기, Privacy→G09→뒤로 스크롤 복귀를 확인한다.
5. 390px에서 메뉴·긴 입력·키보드 조작을 확인한다. 비교용 desktop은1440×900. 실제 OS IME·스크린리더·Safari/Firefox·물리 터치는 추가 환경 검증이 필요하다.
6. `/login`→가상Alex→`/app`목 편집→실패/재시도, `/components`Dialog, Reset→정상/Guest를 확인한다. 장애 기본값은 정상으로 복원했다.
7. DevTools Network에서 실제API/외부 서비스 요청이 없는지 본다. 인증·DB 저장·출시 성공으로 해석하지 않는다.

남은 G02 소유 작업: 시각 오차의 추가 보정/원본 자산 변형 확인, 자동 전환·hover/focus 원본 실행 근거, 모바일 동일성, 원본 캡처환경. R01 후속: 자산 사용 조건·미수록 공개 페이지는 소비 Goal에서 재확인. G03 이후 구현은 별도 요청 때 진행한다.

## 8. 이번 재점검 결과

[G02_RECHECK_RESULT.md](G02_RECHECK_RESULT.md)에 이번 수정·두 차례 검토·실제 명령·새 캡처·잔여 차이·미리보기 확인 순서를 기록했다. 기존 증거는 보존하고 이번 증거는 `evidence/g02-recheck/`에 분리했다.

### G01~G15 감사 후 재점검 (2026-11-21)

공통 SignupLink의 연속 클릭 이력 중복을 수정했다. 랜딩/CRM·키보드·수정 키 새 탭 회귀를 포함한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 공개 메뉴·가입 선택/returnOriginKind 소비 회귀; G02 메뉴 전체 재작업 없음. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 공개 메뉴/일반 Start free 가입 취소가 청구서 인계를 지우지 않는 경계와 기존 메뉴 DOM 회귀. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] Resources/공개 푸터/문의 카드의 도움말 진입과 이력 복귀를 검증했다. 메뉴 실행 코드는 유지했다. [상세 판정·근거](G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 공통 PublicLink 소셜 출발 hash/이력 정보를 보완하고5공개 소비·회사/정책 푸터 진입을 DOM 검증했다. PublicHeader는 회사용 가입 복귀 옵션만 전달한다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.
