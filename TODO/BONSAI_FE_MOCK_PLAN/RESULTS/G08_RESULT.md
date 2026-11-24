# G08 도움말·기사·문의 실행 결과

> 현재 G08 — 2026-11-24 KST: **부분 완료**. 원본8단계·연결2PNG를 확인하고 검색/기사/문의 복귀를 보완했다. 단위/DOM179/179·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크는 대기다. 과거 이력·다른 G/R 상태를 보존한다. [범위·체크·잔여](G08_RESULT.md#g08-r4-recheck).


> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST · 연속 작업 G08. 도움말/문의 목 구현·두 차례 검토·현재 Chromium 검증 수행. 미수록 본문·영상·원본 동작·시각 차이·추가 환경은 대기이며 실제 문의/피드백 발송·고객 포털 구현 완료가 아니다.

## 근거와 적용 범위

[R01 결과 §14](R01_RESULT.md), [MCP 새 조회](evidence/g08/mcp-sources.json), [보관 자료](evidence/g08/archive-fetch.json), [자산 출처·해시](evidence/g08/asset-manifest.json).

- Help Center `4f8c359f-2e1f-46bd-953b-bd601767a0f1` 2장, Help article detail `ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf` 4장, Contact Us `5ea077df-b21b-4455-8b53-bbd8901d54ae` 2장. ANALYSIS와 8개 원본 PNG를 직접 확인했다. App `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. Latest/2146은 같은 연속 작업 G05의 앱 조회를 재사용했으며 촬영일/제품 빌드는 미확인이다.
- 홈 보관본 실제2024-02-25, 옛 기사 URL2024-04-19, 문의2024-01-18, 도움말 CSS2024-02-22. 기사 새 URL은2025-01-22의 다른 본문/플레이어여서 적용하지 않았다. 각 요청 날짜와 실제 반환 날짜를 manifest에서 구분했다.
- 14개 분류·과거 수량·기사15개 제목/ID/별칭, 인기3·관련5·문의FAQ10 목적지를 연결했다. 실제 본문은 제공된 Client Portal 캡처 부분만이다. 2024 보관본과 PNG의 겹치는 본문/목차를 대조했으며 중간 미수록 본문을 새로 쓰지 않았다.
- 헤더 이미지는 CDN410 뒤2023-10-10 보관 자산으로 확보하여 직접 대조했다. 폰트 Inter는 보관 CSS의 해시 URL 자산이다. 로고/아이콘·문의 장식은 보관 HTML의 불변 자산 URL에서 로컬 저장했다. 포스터·브랜딩·이모지는 제공 PNG를 잘랐다. 정확한 폰트 렌더링/수치는 측정과 추정이며 원본 CSS viewport/DPR을 확정하지 않는다.

## 구현·목 정책·후속 경계

| 경로/구성 | 구현과 상태 수명 |
| --- | --- |
| `/help` | 전용 헤더·검색·인기3·분류14·푸터. English만 근거가 있어 다른 lang은 미제공 상태 |
| `/help/collections/:id` | 과거 수량과 현재 자료 수를 구분한 분류 목록. 미수록/없는 분류 명시 |
| `/help/articles/:id` | 숫자 ID와 과거 slug 별칭을 같은 기사로 해석. 제공 본문·8개 목차·관련 링크·피드백 |
| `/support` | 이메일·앱·도움말3경로와 FAQ10 링크. 문의 폼/접수 성공은 없음 |
| HelpProvider/hooks | 검색은 URL q/분류/lang, 메모리 캐시 scope revision. 피드백은 기사ID별 도움말 방문 메모리 |
| HelpOutbound | 기존 Dialog 재사용. 메일/제안/영상/브랜딩/앱 인계, Escape·포커스·이탈 닫기 |

검색은 명시적 Enter/검색버튼 제출, 공백 trim·256자 제한·한글 composition 중 제출 방지. URL의 뒤로/앞으로/새로고침에서 조건 복원. 80ms 로컬 조회/slow1500ms/read-error 첫 실패/empty를 분리하고 AbortSignal과 query key로 늦은 결과를 격리한다. 분류 귀속이 캡처되지 않은 일부 기사 매핑은 목 가정이다. 원본 검색 결과·분류 상세 UI·다른 언어 화면을 관찰한 것으로 쓰지 않는다.

피드백은 3단계 선택, pending 중 선택 변경은 마지막 의도, 취소는 마지막 저장 선택 복원, write-error 후 선택 보존/재시도. 다른 기사로 이동하면 미완료 저장 취소, 돌아오면 저장된 선택 유지. 도움말 경계 이탈/refresh/revision 변경은 초기화한다. 실제 피드백 API는 없다.

목차는 hash replace로 읽는 위치를 바꾸고 실제 back/forward 이력을 지킨다. 우측 active section은 스크롤로 갱신한다. 모바일 목차를 본문 위로 배치한 것은 미확인 원본을 보완한 목 UI 선택이다. 영상은 파일/자막 없음과 재생 미시작을 명시한다. YouTube URL은 안내 문자열이고 embed/스트리밍은 없다. 문서 안 설정은 이미지이며 G16 안내를 열어도 실제 포털/브랜드가 바뀌지 않는다.

문의 목적지: `mailto:support@hellobonsai.com`, `https://app.hellobonsai.com/vendor/dashboard`, `help.hellobonsai.com`, Feature Requests `https://bonsai.cnflx.io`. 앱은 현재 `/app` 가상 인증 경계로 연결한다. 실제 메일/채팅/외부 제안은 실행하지 않는다. 마지막 FAQ의 보관 href에는 생략 문자열이 있어 기사 숫자ID까지만 확정했다. G10/G11/G14에서 앱 로그인 이후 복귀를 이어 검증한다.

## 두 차례 검토·수정

1차: source ID·본문 범위·데이터/표시/검색/피드백 책임 분리·키보드·목차·취소/경합·라우터 소유 경계를 확인했다. 초기 E2E4/5 통과에서 검색 URL만 기다리고 이전 7개 목록에 클릭한 테스트를 발견했다. 실제 검색 결과1개 준비를 기다리도록 고쳐5/5 통과했다. 실패 기록은 [최초 결과](evidence/g08/development-first-review.json)에 보존했다.

1차 시각 비교에서 public-web CSS가 문의 제목/본문 여백을 덮는 문제를 발견해 support 범위 selector로 고쳤다. 헤더/인기 링크 간격·Inter 행간·TOC 위치·문의 장식 너비/위치·FAQ 굵기·푸터 간격을 원본에 맞춰 보정했다.

2차: 도움말 article에서 헤더 Feature Requests를 연 채 browser back하면 Dialog가 남는 결함을 실제 재현했다(이동 후 dialog1). 헤더/푸터에서 location.key 변경 시 닫도록 수정하고 같은 E2E에 두 위치 회귀를 넣었다. `/help?q=공백`에서 홈 내용에 h1이 없던 불일치는 검색 정규화를 통일해 수정했다. 피드백 마지막 의도/실패 보존/route cleanup·미제공 영상·원본에 없는 폼 미추가를 재검토했다.

낮은 대비의 원본 녹색 링크/버튼과 푸터 회색을 보정했다(예: 원본 근사52b22c의 흰색 대비2.71:1 →397d24 약5.08:1). 이는 의도적 시각 차이이며 완전 일치로 보고하지 않는다. 포스터 일부·본문 줄바꿈/굵기·수px 위치·아이콘/배경의 색·일부 불릿 간격·미제공 안내 문구도 차이가 남는다.

## 실제 실행·검증·캡처

FE/user-web에서 Node24.18.0/pnpm8.14.1: `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 이후 실행.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`18/18, `corepack pnpm build` 통과. 마지막 모달/검색 수정 후 typecheck/lint/build 재통과. JS718.16kB chunk와 오래된 Browserslist 경고는 남는다.
- `corepack pnpm exec playwright test tests/e2e/help.spec.ts tests/e2e/foundation.spec.ts tests/e2e/landing.spec.ts --workers=2 --reporter=line,json`: 관련 개발20/20. 같은 대상 `-c playwright.preview.config.ts`: 빌드20/20. [개발](evidence/g08/development-final.json)·[빌드](evidence/g08/production-final.json).
- 마지막 수정 후 `corepack pnpm exec playwright test tests/e2e/help.spec.ts --workers=2 --reporter=line,json` 개발5/5, 동일 대상 preview config 빌드5/5. [개발](evidence/g08/development-last-review.json)·[빌드](evidence/g08/production-last-review.json).
- `node scripts/capture-help.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-help.py`: 실제11화면·원본8상태 비교. [캡처 조건](evidence/g08/browser-captures.json), [원본 경로/차이 지표](evidence/g08/visual-metrics.json), [비교 이미지](evidence/g08/comparisons/). 8개 pair와 모바일3장을 직접 보았다. PNG2880×1800→1440×900 정규화, Chromium148/DPR1, actual scrollY 저장. 활성 인기 링크는 keyboard focus이며 원본의 hover/keyboard 여부는 미확인이다.
- 실제 navigation·직접 진입·새로고침·back/forward·목차/스크롤·검색/피드백 실패·취소·빠른 변경·Dialog Escape/복귀·320px 경계·긴 한국어·합성 IME를 확인했다. 정적 문의/본문에는 불필요한 비동기/실패 상태를 만들지 않았다.
- 모든 최종 테스트의 실제 API/외부 요청·요청 실패·console 오류0. 캡처6811개 요청은 로컬 정적 자산/HMR이며 API/외부/실패/console0. 요청 가로채기 없음. 장애 시나리오는 마지막 정상 seed로 복원했다. G01/G02 공통 흐름 회귀20에 포함되며 기존 목표의 미완료 상태를 올리지 않았다.

## 남은 범위와 확인 순서

미수록 기사/중간 본문·영상/자막·원본 검색/언어/피드백 결과·모바일 원본·정확한 촬영/업데이트 기준일·추가 브라우저/실기기/OS IME/VoiceOver 검증은 남는다. 합성 입력/viewport 검증은 실제 OS 검증이 아니다. 서버 후속은 지원 채널 운영·피드백 보존·검색/번역·포털 권한/토큰 유효기간이며 이 단계에서 설계하지 않았다.

미리보기 `http://127.0.0.1:5173/`: Resources→Help Center→분류→portal 검색→Client Portal→목차/영상 미제공→Escape→Helpful→관련 기사→뒤로. `/support`→Email us 닫기·Go to the app 가상 경계·Help Center/FAQ. `/help?lang=ko`→English 복귀. `/components` read-error/slow/write-error는 확인 후 normal 복원. G08 결과를 기록하고 승인된 G09로 연속 진행한다.

## G09 회귀 중 추가 수정

전체 개발 회귀49/51에서 빠른 payment→portal 제출 시 늦은 URL 반영이 최신 입력을 덮는 실제 경합을 발견했다. HelpHeader가 제출 입력 revision을 기록하고 늦은 PUSH에서 새 초안을 보존하며 POP에서는 URL을 복원하도록 수정했다. 최종 URL/입력/검색 결과를 함께 검증한다. G09 수정 후 전체 dev/build51/51로 재검증했고 네트워크/console 오류0. [G09 결과](G09_RESULT.md)·evidence/g09 개발/빌드 recheck 기록.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

목차 replace와 관련 기사 왕복의 진입 출처/검색 조건 유실을 수정했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

<a id="g08-r4-recheck"></a>
## G08 기존 구현 재검토·보완 — 2026-11-24 KST

**현재 판정: 부분 완료.** 원본 주요 구성 대조·로컬 동작 보완·단위/DOM 검증을 수행했다. 엄격한 시각 동일성·실제 브라우저·미수록 원본은 대기다. 위 과거 체크·수치·캡처·API0 기록은 당시 이력이며 이번 검증으로 대신하지 않는다.

### 1. 범위·착수·환경

- 주대상: /help의 분류·검색·언어→기사·목차·관련 기사·피드백→복귀, /support의 채널3·FAQ10.
- 연결: G01 공통 Dialog/Reset, G02 Resources/푸터/문의 진입, G11/G14의 My Account·앱 로그인·이력 복귀. G16은 기존 Branding settings 안내 경계만 확인했다. G10/G13 신규 가입/온보딩 전체는 이번 필요 범위 N/A이며 기존 동작을 변경하지 않았다.
- G00 조사와 G01 선행 구현을 확인했고 과거 전면 교체는 반복하지 않았다. 선행 G/R의 시각·환경·자료 대기는 유지한다. G09/G32 및 무관한 업무 기능은 시작하지 않았다.
- 착수 HEAD 88f320af, clean 작업 트리를 확인했다. Node24.18.0/pnpm8.14.1, package Node>=24<25. 기존 127.0.0.1:5173 PID30272·5174 PID22864 보존. HTTP GET / 응답200과 Vite client 포함을 확인했다(5173 제목 OneHand CRM · UI preview, 5174 다른 FE 제목 시험장 모니터링). FE/BE 서버 시작·종료·환경/설정 변경 없음.
- 수정은 FE 소스4개·정식 회귀1개와 기존 계획 문서에 한정한다. 원본 PNG/ANALYSIS·기존 evidence를 변경하지 않았다. 새 evidence/캡처/비교 이미지/trace/보고서/JSON/로그/임시 파일·스크립트·브라우저 프로필을 만들지 않았다. 커밋/push/배포 없음.

### 2. 원본 식별과 확인 목록

담당3흐름의 ANALYSIS와 원본 PNG8개 전부, 연결 Logging in의 분석/PNG02·05를 직접 열람했다. 4개 ANALYSIS의 LF 정규화 SHA256과 PNG10개 SHA256/2880×1800 크기가 SOURCE_ANALYSIS_INDEX와 일치했다. 원본 원문과 아래 주요 요소를 대조했으며 전체 픽셀/요소 전수 계수 완료는 아니다.

저장된 근거는 Bonsai Web / bonsai-web / Latest / 2146, app c1026782-09a7-45fb-b2d0-7cc1909bf1f4다. 이번 Gummble batch는 담당3 Flow의 메타데이터8개 ID·순서를 재조회해 모두 일치(실패0, include_images:false). 새 MCP 이미지 확인이 아니며 응답에 버전 필드가 없어 2146을 재확정하지 않았다. F083은 로컬 근거만 확인했다. 카탈로그 번호·화면의2024·상대 업데이트 날짜를 촬영일/제품 빌드로 쓰지 않는다.

| 확인 | Flow ID · 단계 | Screen ID | 원본/분석·주요 관찰 |
| --- | --- | --- | --- |
| [x] | 5ea077df-b21b-4455-8b53-bbd8901d54ae · 01 | sc_1250ed72609c423c8539fbde3958ed39 | [F024 분석](<../../../bonsai_analysis/flows/Contact Us/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Contact Us/screens/01_sc_1250ed72609c423c8539fbde3958ed39.png>): 공통 헤더/고객군, 제목/부제, 선 아이콘·지원 카드3 |
| [x] | 같은 F024 · 02 | sc_e60b45e987414533b5fbfd7538eb68a7 | [PNG](<../../../bonsai_analysis/flows/Contact Us/screens/02_sc_e60b45e987414533b5fbfd7538eb68a7.png>): 질문10·오른쪽 잎 crop, 답변/접수폼/펼침 화살표 없음 |
| [x] | 4f8c359f-2e1f-46bd-953b-bd601767a0f1 · 01 | sc_5d4f0991488547c6bd0735f4e074318c | [F065 분석](<../../../bonsai_analysis/flows/Help Center/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Help Center/screens/01_sc_5d4f0991488547c6bd0735f4e074318c.png>): 잎 헤더·영어·검색·인기3열·분류2열 |
| [x] | 같은 F065 · 02 | sc_979e0c1be7934cd6a079e9914cec68dd | [PNG](<../../../bonsai_analysis/flows/Help Center/screens/02_sc_979e0c1be7934cd6a079e9914cec68dd.png>): 마지막4컬렉션·로고·© Bonsai2024·푸터3링크 |
| [x] | ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf · 01 | sc_2230bb5f099d482fb1f0ba9741d4b7e8 | [F066 분석](<../../../bonsai_analysis/flows/Help Center/Help article detail/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Help Center/Help article detail/screens/01_sc_2230bb5f099d482fb1f0ba9741d4b7e8.png>): 인기 첫 기사 연녹색/초록 강조, 입력 원인 미확인 |
| [x] | 같은 F066 · 02 | sc_e20cb01482774429b6136ac17d2039d7 | [PNG](<../../../bonsai_analysis/flows/Help Center/Help article detail/screens/02_sc_e20cb01482774429b6136ac17d2039d7.png>): breadcrumb·제목/부제/업데이트·목차8·YouTube 포스터 |
| [x] | 같은 F066 · 03 | sc_2c564244ef024e9cb6b56810d545b154 | [PNG](<../../../bonsai_analysis/flows/Help Center/Help article detail/screens/03_sc_2c564244ef024e9cb6b56810d545b154.png>): 브랜딩 지침·강조어·설정 이미지·다음 제목·활성 목차 |
| [x] | 같은 F066 · 04 | sc_e244e36695a94b13b56282b9633d1d00 | [PNG](<../../../bonsai_analysis/flows/Help Center/Help article detail/screens/04_sc_e244e36695a94b13b56282b9633d1d00.png>): 마지막 질문2·관련5행 화살표·회색 카드 평가3·마지막 목차 활성 |
| [x] | a02409b3-6eb0-4bc0-b702-22a42e0990c8 · 02 | sc_9d353458318e43e7b25ebbf88fefeaa9 | [F083 분석](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>): Changelog/로그인·소셜·입력/CAPTCHA·복구 |
| [x] | 같은 F083 · 05 | sc_3982bd8e06b44860bdb8c4bac2592599 | [PNG](<../../../bonsai_analysis/flows/Logging in/screens/05_sc_3982bd8e06b44860bdb8c4bac2592599.png>): 내부 앱 셸/대시보드·도움말 버튼. 앱 도착이 자동 지원 채팅 열림 증거는 아님 |

R01 §14의 보관본 조회·분류14/기사15/별칭·이전 자산 확보는 과거 이력이다. 이번에 Wayback/공식 사이트를 재조회했다고 주장하지 않는다. 2025 기사/Wistia·현재 정책을 과거 YouTube 화면에 섞지 않았다. 원본에 없는 검색/언어/오류/평가 결과는 명시적 목 가정으로 유지했다.

### 3. 원본→분석→계획→코드와 R4 판정

원본의 각 단계는 연결 ANALYSIS §4/5(관찰·업무 의미)·§8(미확인), G08 §3/5 및 대응표의 다음10항목으로 연결한다.

| R4 항목 | 이번 판정 | 근거·코드 대응 |
| --- | --- | --- |
| R4-F024-O01 | 비교 완료·구현 보완 | 지원 카드3·서로 다른 선 아이콘·FAQ10 유지. FAQ 전체 URL 복귀·지원 안내 이력 종료 보완; 정확 줄바꿈/시각 대기 |
| R4-F024-O02 | 비교 완료·유지 | 왼쪽 질문 목록·오른쪽 잎 crop 구조 유지. 아코디언/답변/문의 폼 없음; 정밀 위치·crop 대기 |
| R4-F024-A01 | 분석 대기 | FAQ10 표시 문구/기존 ID 연결 대조. 정확 행간·줄바꿈/잎 자산 동일성·캡처 당시 링크 실행 결과 미확인 |
| R4-F065-O01 | 비교 완료·구현 보완 | 잎 헤더·검색·인기3열·분류2열 유지. 언어 복귀 query/hash/state·기사 출발 hash·IME229 보완; 배치 시각 대기 |
| R4-F065-O02 | 비교 완료·유지 | 마지막 컬렉션·로고/Bonsai2024·푸터3링크 유지. 문서 수는 역사적 값; 푸터 여백 동일성 대기 |
| R4-F065-A01 | 분석 대기 | 보관본 기반14컬렉션과 PNG 수록분 구분. 검색/언어/hover의 원본 동작과 정확 배경·아이콘/중간 목록 미확인 |
| R4-F066-O01 | 비교 완료·유지 | 인기 첫 기사 강조 스타일 유지. 원본 입력 원인 불명; 접근성 보완 색과 픽셀 차이 대기 |
| R4-F066-O02 | 비교 완료·구현 보완 | 8목차·세로선/활성·영상 포스터·읽기 전용 설정 이미지 유지. 목차 query/state 보존·안내 이력 종료 보완; 실제 스크롤/고정 위치 대기 |
| R4-F066-O03 | 비교 완료·유지 | 관련기사5·초록 화살표·회색 피드백3 유지. 기사 canonical ID·실패/재시도/취소/마지막 선택 DOM 검증; 원본 저장 정책/시각 대기 |
| R4-F066-A01 | 분석 대기 | 본문 전체·영상/자막·정확 목차 폭/고정·실제 평가 저장 결과 미확인. 기존 영상 미제공/설정 안내 경계 유지 |

코드는 FE/user-web/src 기준: help-header/help-index/help-footer는 전용 공개 헤더·검색·컬렉션·하단, help-article/portal-article-body/portal-sections는 읽기 영역·8목차·영상/설정 이미지, help-feedback/use-help-feedback는 기사ID별 로컬 평가, pages/support는 지원3카드·FAQ10, styles/public-help.css는 3열/2열/우측 목차/잎/강조 스타일을 소유한다. support FAQ와 인기·검색·관련 기사는 help-catalog의 같은 ID를 사용한다.

원본의 주요 요소군은 유지되지만, 자료 미수록 안내 문단·목 안내 모달·피드백 성공/실패 표시는 원본에 없는 로컬 보완이다. 시각 동일성 완료로 판정하지 않는다.

### 4. 결함·원인·수정

| 문제 | 수정 파일(FE/user-web/src 기준) | 조치·검증 |
| --- | --- | --- |
| 영어 복귀 본문 링크가 경로만 사용해 q/hash/state 유실, 헤더 언어 선택도 state 유실 | features/public-help/components/help-index.tsx, help-header.tsx | lang만 제거하고 pathname/query/hash/state 보존. 두 경로 DOM 회귀 |
| 인기/검색 기사 출발점의 hash와 복귀 state 누락 | help-index.tsx | 전체 출발 URL과 helpReturnState 전달. 목록→기사→관련→복귀·back/forward |
| FAQ 복귀가 /support 고정 | pages/support/index.tsx, help-article.tsx | query/hash·부모 state 전달, 지원/도움말 경로 경계 확인 |
| 목차 hash-only Link가 현재 query/lang 제거 | help-article.tsx | pathname/search/hash 명시, state/replace 유지. 관련 기사 왕복 후 최초 지원 페이지 복원 |
| 같은 기사/문의 경로의 새 history·POP에서 영상/지원 안내가 남음 | help-article.tsx, pages/support/index.tsx | location.key 변경에서 닫기. 기존 헤더/푸터 종료와 일관화 |
| IME composition 종료 직후 229 Enter 방어 누락 | help-header.tsx | composing/isComposing와 keyCode229 구분. 합성 이벤트에서 방어 후 일반 제출 확인 |

정식 회귀 [help-entry.test.tsx](../../../FE/user-web/src/app/router/help-entry.test.tsx) 13개를 추가했다. 첫 실행에는 jsdom showModal 미지원/암시적 dialog 선택자 오류가 포함되어 테스트 환경부터 수정했다. 미지원 모달 메서드를 보완한 기준 실행에서 5개 시나리오 실패·7개 통과로 제품 결함을 재현했다. 이후 소스 보완으로12개 통과, 공개 메뉴/푸터/문의 연결 추가 후13개 통과했다. 타입 검사에서 테스트 배열의 tuple 추론 오류를 발견해 as const로 고쳤다. 테스트 환경 오류를 제품 결함으로 집계하지 않는다.

피드백·읽기 공급자·목 저장소·Auth·공통 Dialog 실행 코드는 유지했다. 새로운 저장/API/폼/영상 재생/고객 포털/브랜드 편집은 추가하지 않았다.

### 5. 실제 검증

- [x] typecheck 앱/Node: 각각 node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false 및 -p tsconfig.node.json 통과. 앱은 tuple 보완 후 재통과.
- [x] node node_modules/eslint/bin/eslint.js . --no-cache 통과(최종13개 테스트 포함).
- [x] 초기 전체31파일178/178(128.39s), 추가 연결 회귀를 포함한 대상13/13(19.58s). 최종 전체 수치는 아래 최종 검토 기록에 구분한다.
- [x] 메모리 build: Vite7.3.5, 1971모듈·3메모리 output, 10.23s. configFile:false, React plugin/alias, PostCSS tailwindcss/autoprefixer 명시, write:false/emptyOutDir:false/copyPublicDir:false/sourcemap:false. dist/번들 파일 저장 없음.
- [x] 원본 분석4/PNG10 해시·크기, MCP3흐름8ID/순서 검증. 캐시/증거 파일 없이 Node stdin→stdout으로 수행.
- [x] 실제 Router/history 사용: Resources/푸터/문의, 검색/분류/영어복귀, 목차 replace·관련/FAQ 복귀, 새 URL·뒤로/앞으로, 가상 로그인/앱 왕복.
- [x] DOM 상태: 느린 조회→최신 검색/미제출 초안, 읽기 오류/재시도·empty/무결과·잘못된 ID·미제공언어/본문, 평가중복/마지막선택/실패/재시도/취소/기사이탈/동일ID별칭/Reset/새 provider 수명.
- [x] DOM 모달의 네이티브 cancel/닫기 후 호출자 초점·이력 종료, 합성 composition/229 Enter·긴 한국어 입력. jsdom의 showModal/close/scrollIntoView·matchMedia/화면 측정 대체를 사용했다. navigation은 대체하지 않았다.
- [ ] 실제 브라우저 E2E·주소 입력/reload/새 탭·키보드/Escape/inert·스크롤/TOC sticky/활성 위치·좁은 화면·OS IME·렌더링/console/network. document-control 세션 없음, CDP9222/9223 없음. 자동 프로필/캐시를 만드는 새 브라우저는 산출물 제한상 실행하지 않았다.
- [ ] 인증/업무/외부 요청0건 실측. 코드에 실제 호출 추가 없음과 DOM의 외부 링크/iframe 부재만 확인했으며 브라우저 요청0/console오류0을 주장하지 않는다. 요청 차단으로 판정을 대신하지 않았다.
- [ ] 원본과 구현 화면 픽셀 비교: 구현 viewport/DPR/배율/스크롤/상태를 맞춘 실제 화면을 얻지 못해 미수행. 비교 캡처 경로 N/A(사용자 파일 생성 금지). 기존 과거 캡처 경로는 현재 증거로 재사용하지 않았다.
- [x] 회귀 시나리오에서 normal/Reset 복원 및 provider 종료. 실제 브라우저 설정은 변경하지 않았다.

검증 실행은 FE/user-web에서 PowerShell here-string을 node stdin에 전달했다. 임시 스크립트를 쓰지 않았다. Vitest runner는 config:false/run:true/cache:false/pool:threads/execArgv:[]/maxWorkers:2/environment:jsdom, setupFiles:vitest.setup.ts, include:src/**/*.test.{ts,tsx}, coverage:false, experimental.fsModuleCache:false, deps.optimizer.client/ssr.enabled:false, Vite configFile:false·react/alias·optimizeDeps.noDiscovery:true·include:[]·server.watch:null이다. FILTERS=[] 전체, FILTERS=[src/app/router/help-entry.test.tsx] 대상. NODE_DISABLE_COMPILE_CACHE=1·JITI_CACHE=false·JITI_FS_CACHE=false를 사용했다. 상세 출력은 stdout에서만 확인했다. 오래된 Browserslist 데이터 경고는 남고 의존성을 임의 갱신하지 않았다.

### 6. 규칙·공통 체크리스트 적용

[FRONT_AGENT](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md) 읽기 지도에 따라 DECISIONS006/005, ARCHITECTURE의 FRONTEND_USER_WEB/STATE_AND_DATA/MOCK_FIRST_DEVELOPMENT/TESTING, CONVENTION의 COMPONENT_DESIGN/WEB_ACCESSIBILITY_AND_LAYOUT/COMMENT_AND_LOGGING/FRONTEND_USER_WEB를 적용했다. AGENT/README·PM036·UX025, G08·관련 R01/R02·계획 공통 문서와 현재 엄격한 동일성 기준을 확인했다.

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md) 항목별 판정(§n 순서):

| 규칙 묶음 | 이번 적용·코드 근거 | 완료/대기/N/A |
| --- | --- | --- |
| §1 범위·출처4항목 | 요청·clean Git·원본/과거문서/목 가정·성공/취소/실패·상태 분리 | [x] 범위/출처 구분. 실제 서비스 완료 아님 |
| §2 구조5항목 | page→public-help 공개 export, feature→공통 Dialog; URL/초안/조회/평가 책임 기존 유지 | [x] 구조/props/실제 사용처/앱경계. N/A 새 의존성(없음) |
| §3 데이터7항목 | HTTP 없는 help-reader/Query·canonical articleID·HelpProvider 방문 메모리·revision | [x] 목/동일ID/수명/계약 구분. [ ] 네트워크 관찰. N/A 기존 live 보완(전부 목) |
| §4 상태6항목 | q/lang URL, draft controlled, 조건별 query key, signal 취소, feedback token/실패 보존/취소 | [x] 상태/취소/중복/최신선택/캐시/빈 결과. N/A 금액·날짜 계산/합계 변경 |
| §5 웹 UX7항목 | 직접 route·POP·모달cancel/초점·label·상태·합성IME DOM | [x] 위 DOM 범위. [ ] 실제 키보드·reload/새탭·native Escape/inert·스크롤·폭/확대·터치/reduced motion·OS IME |
| §6 주석·품질5항목 | 수정 컴포넌트·추가 effect·정식 test helper에 한 줄 한글 책임 주석; strict/noEmit/lint | [x] 주석/타입/cleanup·URL에 계정 비밀 없음. N/A 복잡한 신규 업무 알고리즘/새 권한모델; 경합 회귀 통과, 실제 렌더 성능 미측정 |
| §7 검증·인계6항목 | 이번 명령/DOM13/전체회귀·로그인returnTo·문서 상태 및 잔여 | [x] 가능한 검사·기록·mock 구분. [ ] E2E. N/A Admin/실제 운영 검증 |

START-CHECKLIST 적용: [x] 착수 Git/선행/규칙·원본·범위, [x] 진행 책임/목 가정·허용 산출물, [x] 종료의 수정/검증/남은 담당/문서 연결. [ ] 실제 브라우저/정밀 동일성은 미수행 사유와 담당을 남겼다. 공통 빈 양식을 프로젝트 전체 완료로 체크하지 않는다.

| 공통12기준 | 이번 결과(전역 완료 아님) |
| --- | --- |
| R4-C01 | 담당8PNG·연결 로그인2PNG/ANALYSIS4개 해시·크기 확인, MCP3흐름8ID/순서 일치; 촬영/빌드·카탈로그 재확정 대기 |
| R4-C02 | 잎 검색 헤더·인기3열/분류2열·기사/목차·지원3카드/FAQ 구분; 실제 배치/overlay 시각 대기 |
| R4-C03 | 8단계 주요 요소군과 코드 대응; 전체 요소 전수 계수·정밀 명세 인증 미완 |
| R4-C04 | 제목·부제·업데이트 문구·목차8·관련5·FAQ10 확인; 원문 전체/줄바꿈 동일성 대기 |
| R4-C05 | PNG2880×1800/MCP1440×900 구분; 실제 구현 viewport/DPR/배율·스크롤·픽셀 비교 미실행 |
| R4-C06 | 기존 도움말 Inter·공개 Gellix 유지; 과거 보관본 이력과 원본 확정을 구분, 정확 폰트/수치·raster 대기 |
| R4-C07 | 기존 접근성 보완 녹색 #397d24와 원본 색 차이 유지; 모든 상태 색/테두리/radius/shadow 동일성 미검증 |
| R4-C08 | 기존 헤더/로고/아이콘/잎·영상포스터·설정이미지·평가3 사용 유지; 원본 자산/crop/촬영조건 대기 |
| R4-C09 | 읽기 오류/재시도·empty/무결과·미제공언어/본문·피드백 실패·취소·중복·경합·합성IME DOM 검증; 원본 정책 대기 |
| R4-C10 | 실제 router/history DOM에서 검색·영어 복귀·목차replace·관련 기사·FAQ·로그인 왕복 검증; 실제 브라우저/스크롤 대기 |
| R4-C11 | URL 검색과 입력 초안 분리·기사ID별 방문 메모리 평가·실패 보존/재시도·마지막 선택·이탈/Reset 격리 검증 |
| R4-C12 | G01/G02/G11/G14 직접 연결 DOM 검증, G16 안내 경계만 유지; G10/G13 신규 가입/온보딩 전체는 이번 범위 N/A |

### 7. 목 가정·잔여와 담당

| 상태·담당 | 남은 범위 |
| --- | --- |
| [ ] G08/R01·G01 | 정확 폰트 파일/굵기/치수/행간/자간·줄바꿈/색/radius/shadow·배경/아이콘/잎 crop·전체 요소 및 원본 촬영 조건. 현재 도움말 Inter·공개 Gellix/헤더 fallback 이력·접근성 색 보정은 원본 동일 증거 아님 |
| [ ] G08/R01 | 원본의 검색/분류/언어 변경 결과·중간 컬렉션/전체 본문·강조 입력 원인·TOC 조작 원인·평가 저장 결과/정책. 주요 요소 유지와 전체 분석 완결을 구분 |
| [ ] G08/R01 | 영상/자막·원본 포스터 정확 자산, 도움말 링크 당시 목적지/FAQ10 전체 정책. 임의 답변·영상 재생·자동 발송 없음 |
| [ ] G08·G01/G02/G11/G14·G84 | 실제 브라우저 조작·네트워크/console·스크롤/초점·좁은 폭/긴 한글·OS IME·최신 화면 비교. 다음 Goal 진행 여부와 별개 잔여 |
| N/A 이번 / G10/G13·R02 | 신규 가입/전체 온보딩 정책·역할/실계정 검증. 이번에는 기존 샘플 로그인→앱과 이력 복귀만 수행 |
| N/A 이번 / G16·관련 포털 Goal | Branding settings 실제 업무와 포털 접근/권한. 읽기 전용 기사 이미지·로컬 안내만 유지 |
| 후속 서버 메모 | 지원 운영/접수/채팅 조건, 기사 공개/검색/번역·평가 영속성, 포털 토큰/유효기간/접근권한. FE 작업을 막지 않고 서버/API/DB 설계로 확대하지 않음 |

검색은 명시적 제출·trim·최대256자·제목/alias 부분일치이며 실제 서버 검색 규칙이 아니다. 언어는 English만 제공하고 영어 복귀 시 다른 URL/복귀 상태를 보존한다. 평가의 기사ID별 방문 메모리, 실패 선택 보존/재시도, 마지막 선택 우선, pending 취소 시 마지막 저장값 복원, 도움말 이탈/Reset/revision/새 문서 초기화는 목 정책이다. 문의·영상·Feature Requests 안내는 실제 발송/재생이 아니다.

### 8. 직접 확인 순서와 문서 상태

미리보기: http://127.0.0.1:5173/help · http://127.0.0.1:5173/support

1. /support?entry=g08#questions → FAQ의 Client Portal → 목차 Branding → 관련 기사 → Back to previous help page 두 번. 문의의 query/hash 복귀 확인.
2. /help/collections/96965?q=portal&lang=ko#results → View English content. q/hash 유지 확인 → 기사 → 관련 기사 → 복귀. /help/articles/4409019?entry=language&lang=ko#portal-branding에서는 헤더 English도 확인.
3. /help에서 portal 검색, 미제출 초안·다른 검색·뒤로/앞으로. /components의 read-error/empty/slow를 선택해 로딩·오류/재시도·빈 자료와 무결과를 분리 확인.
4. /components write-error → 기사 평가 → 실패/재시도. slow → 빠른 재선택·Cancel feedback·관련 기사 이탈. 끝나면 /components의 Reset 또는 normal로 복원.
5. 기사 영상/Branding·헤더/푸터 안내, /support Email us를 열고 닫기/Escape/초점/이력 이동 확인. 실제 영상·메일은 실행되지 않아야 한다.
6. 문의 Go to the app → 로컬 안내 Continue → 로그인. 브라우저 뒤로로 문의 복귀. Help My Account → Continue as Alex → /app → 뒤로로 Help 복귀. 실제 인증/상담 성공으로 해석하지 않는다.
7. DevTools에서 console/network, 좁은 화면·실제 키보드/OS IME·TOC 스크롤과 원본 동일성을 추가 확인한다. 이는 아직 사용자가 직접 확인할 잔여 절차이며 이번 자동 검증 통과 기록이 아니다.

- [x] G08 명세·결과, 관련 G/R 소비 기록, 공통 대응표·순서·상태·PLAN-INDEX를 이번 범위로 갱신했다.
- [ ] 시각 동일성·브라우저·원본 미확인 잔여를 완료로 올리지 않았다. 과거 [x]는 이력으로 보존하고 이번 체크와 구분했다.
- 문서 링크·JSON·체크·과거 이력 보존 검사의 최종 수치는 아래에 기록한다. 새 결과 문서·증거 파일 없이 기존 결과에 추가했다.

### 최종 실행 결과

- [x] 최종 전체31파일179/179(119.29s), G08 대상13/13. 앱/Node noEmit 타입·lint·메모리build 통과. 앞선178개 기록은 추가 연결 회귀 전 이력이다.
- [ ] 실브라우저·네트워크·픽셀 동일성은 위 사유로 미검증. 기존5173/5174 listener와 서버 설정을 보존했다.

### 최종 문서·변경 검토

- [x] 계획 전체170 Markdown·1 JSON 검사. 기존 관련 문서40개 갱신, 새 링크 오류0·상태 단정 실패0. 기존 링크 오류221회는 그대로 남는다(대부분 현재 체크아웃에 없는 과거 evidence 참조); 이를 복원하거나 이번 증거로 사용하지 않았다.
- [x] 85G·22R·107실행 순서·134흐름·754단계·642고유ID, R4 455 중 이번10개 외445개 불변. 공통12개에는 이번 적용만 추가했다. 과거 verification 객체·[x] 완료 줄·배정/실행 순서를 보존했다.
- [x] 최종 diff 검토에서 G08 명세 표의 상태가 JSON과 동기화되지 않은 문서 결함을 발견해 수정했고, 재검사에서 모두 일치했다. git diff --check 통과. 새 파일은 정식 help-entry.test.tsx 하나이며 FE 실행 소스4개와 기존 계획 문서40개만 변경했다.
- [ ] 원본 동일성·실브라우저·미수록 원본/과거 증거 부재는 유지한다. 최종 HEAD88f320af, 커밋/push/배포·다음 Goal 착수 없음.

<a id="g08-precommit-review"></a>
## 사용자 요청에 따른 커밋 전 검토 — 2026-11-24 KST

- [x] G08 실행 소스4개·정식 회귀13개와 기존 관련 문서40개를 다시 확인했다. 최종 검증 이후 실행 코드 변경은 없고, 이번 추가 변경은 이 검토 기록과 색인뿐이다.
- [x] git diff --check 및 계획170 Markdown/1 JSON의 링크·상태·과거 완료 이력 보존 검사를 다시 통과했다. 신규 링크 오류0, 기존 과거 참조 오류221회는 유지한다.
- 이번 턴에 앱 테스트를 반복 실행하지 않았다. 앞선 현재 코드의 전체31파일179/179·G08 13/13·앱/Node 타입·lint·메모리 build 통과를 커밋 검토 근거로 사용한다.
- 후속 사용자 요청으로 로컬 커밋을 승인받아 검토를 마쳤다. 앞선 커밋 금지는 당시 G08 실행 범위의 기록이다. push/배포는 수행하지 않는다.
- 다음 G09(제휴·채용·정책 안내)의 명세상 선행은 G01/G02와 R01이다. G08 잔여 검증을 대기로 보존하면서 G09의 원본/분석/기존 구현 재검토를 진행할 수 있다. G08 전체 완료나 실제 브라우저·시각 동일성 통과를 뜻하지 않는다. 이번 턴에는 G09를 시작하지 않았다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 문의 화면에서 공통 푸터 소셜 왕복을 DOM 확인했고 기존13회귀도 통과했다. G08의 시각 동일성·실제 브라우저/네트워크 대기를 유지한다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.
