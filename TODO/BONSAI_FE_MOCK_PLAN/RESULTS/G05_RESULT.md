# G05 — 블로그·검색·상세 실행 결과

> 현재 G05 재검토 — 2026-11-24 KST: 주요 원본/코드 대조·동작 보완·단위/DOM 검증 수행. 시각 동일성·실제 브라우저·미수록 원본 대기. [이번 결과](#g05-r4-recheck). 아래 과거 연속 작업 승인은 이번 작업에 적용하지 않는다.

> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 연속 요청 G05→G15 중 G05 기록이다. **검색·분류·목차·복귀·목 가입 인계를 구현하고 두 차례 검토 및 현재 Chromium 검증을 수행했다. 전체 원본 본문·목록·추천 콘텐츠와 시각 동일성은 완료가 아니다.** G06~G15의 다음 단계는 사용자가 이미 승인한 연속 범위다. 실제 서비스·외부 연동 완료를 뜻하지 않는다.

## 1. 시작 상태와 근거

- Git clean, HEAD `70ffefeb`에서 시작했다. 기존 G01~G04 구현을 유지했다. 현재 요청에서 커밋·push·배포하지 않았다.
- FRONT_AGENT README·아키텍처·컴포넌트·상태·목 개발·접근성·주석·검증·엔지니어링 검토 및 결정006을 적용했다. 과거 TODO 제외/실제 로그인 절차보다 사용자 지시와006이 우선한다. 누락된 AGENT_USAGE_RULES.md는 과거 기록과 동일하며 추정 규칙을 추가하지 않았다.
- G01~G04의 영상·시각·원본 동작·실제 OS/추가 브라우저 대기는 유지한다. 이 중 G05 구현을 막는 공통 선행 결함은 없었다. G03 관련 글 ID·메타데이터를 기존 JSON에서 재사용했다.
- R01 이번 소비 보완은 [11절](R01_RESULT.md)에 기록했다. 신규 MCP3흐름11단계, 원본 PNG11개를 직접 확인했다. 앱 `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`/Bonsai WEB/Latest2146. [Flow/Screen 목록](evidence/g05/mcp-sources.json), [카탈로그](evidence/g05/catalog.json). 버전2146은 카탈로그 번호이며 제품 빌드·촬영일·viewport/DPR은 미확인이다.
- Blog `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` 01~04, detail `7b469aed-f69f-4f73-af50-9b1adb7aa052` 01~04, Searching `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` 01~03을 사용했다.
- 보완 조사: [블로그 2024-01-18 보관본](https://web.archive.org/web/20240118082744id_/https://www.hellobonsai.com/blog), [2024-02-29 보관본](https://web.archive.org/web/20240229103414id_/https://www.hellobonsai.com/blog)은 목록 순서가 달라 채택하지 않았다. [기사 2024-03-02 보관본](https://web.archive.org/web/20240302164806id_/https://www.hellobonsai.com/blog/how-to-start-a-digital-marketing-agency)은 경로·목차·첫 문단 구조의 보조 근거다. 추천 글이 다르고 미수록 중간 문단의 촬영 당시 동일성은 확정하지 않았다. 현재 웹의 변경 저자/날짜는 사용하지 않았다.

## 2. 구현·경로·상태 수명

| 범위 | 구현·상태 | 남은 범위 |
| --- | --- | --- |
| `/blog` | 초기/General, 8분류, 검색, 페이지 이동, 로딩·빈 데이터·검색 무결과·일회 실패/재시도 | 전체 원본 목록·정렬·원래 페이지 수 |
| `/blog/how-to-start-a-digital-marketing-agency` | 확인된 제목/저자/날짜/태그·본문 일부, 목차8항목, 현재 읽는 위치, 상하단/고정 CTA | 미수록 중간 문단·전체 정확한 높이·원래 CTA 조건 |
| 관찰된 카드7개 + G03 관련 글12개 | 같은 ID/경로/이미지/저자 사용. 일반 목록19개, 추천2개 별도 | 일반/추천 기사 본문은 명확한 미수록 상태 |
| 목록↔기사 / 소개↔기사 | 실제 Router와 브라우저 이력. 분류·검색·페이지·스크롤 복귀 | 다른 기기 원본 복원 정책 |
| 기사→가입 | 기존 pathname별 이메일·이력별 publicIntent 인계, 중복 제출 방지 | G10~G14 실제 목 가입 연결 검증 |
| 기사→템플릿 | G06 로컬 목적지 연결 | G06 구현 후 연결 검증 |

- `pages/blog`은 조립, `features/public-content/components`는 UI, hooks는 URL·읽는 위치, `data/article-catalog`는 정적 데이터/선택, `data/article-reader`는 취소 가능한 메모리 조회·일회 실패를 맡는다. 공개 QueryScope는 업무·공유 캐시와 분리했다.
- 분류·검색어·페이지는 URL에 둔다. 검색은 제목+관찰 요약의 대소문자 무시 부분일치, 조합 중 제외한200ms debounce, 페이지당6개다. 이는 **목 가정**이다. 업무 검색·서버 검색은 없다. General 미선택과 선택 강조는 구분하되 같은 전체 데이터다.
- 검색 실패는 URL/입력을 보존하고 재시도한다. 늦은 조회는 AbortSignal과 query key로 현재 결과를 덮지 못한다. 취소된 조회는 일회 실패를 소비하지 않는다. 공개 글에는 세션별 접근 제한을 추가하지 않았다.
- 목차 클릭은 hash를 replace하여 원래 목록의 history를 유지한다. 현재 읽는 위치는 실제 스크롤로 따로 계산한다. 소개의 관련 글 링크도 출발 pathname/query/history key를 전달해 실제 돌아가기 버튼으로 복귀한다.
- 새로고침은 URL 검색을 복원하지만 이메일/가입 인계는 기존 메모리 정책에 따라 초기화한다. 브라우저 뒤로/앞으로는 해당 이력의 인계·필터를 사용한다. 목차·본문 스크롤은 로그인 상태를 바꾸지 않는다.
- 고정 이메일바의 표시 기준과 좁은 화면에서 본문 흐름으로 전환하는 방식은 가정이다. 원본에 미확인인 실패·모바일 화면을 관찰 사실로 표현하지 않는다.

## 3. 1차 검토 → 수정 → 2차 검토

| 발견·재현 | 원인·수정 | 확인 |
| --- | --- | --- |
| 경로 색인의 TS undefined | split 첫 항목에 안전한 기본값 추가 | typecheck |
| 공개 조회 공급자 경계 누락 | 기존 QueryScope가 내부/공유에만 있어 공개 경계에도 독립 조립 | 실제 공개 검색·오류 재시도 |
| 목차 후 목록 복귀가 hash 한 단계만 되돌아갈 위험 | hash replace와 출발 state 보존 | 실제 목차→Back to Blog→뒤로/앞으로 |
| 블로그 상단이60px 짧고 본문이 굵음 | 정규화 원본 및 보관 CSS 대조, 상단 여백/본문 weight400/기사20px·34px 보정 | 캡처·비교 |
| G03 기사 목적지에서 돌아가기 출처 누락 | 기존 관련 글 Link에 로컬 출발 이력 추가 | 소개→기사→버튼 복귀·스크롤 |
| 첫 검증의 Scenario locator 불일치 | 정확한 accessible combobox 이름으로 테스트 수정 | 재시도/지연 E2E |
| 기존 랜딩 외부 클릭 테스트가 메뉴 뒤 제목을 클릭 | 실제 보이는 메뉴 아래 영역에서 외부 클릭 | G02 메뉴 회귀 |
| 첫4worker 실행의 좁은 화면 테스트 시간 초과 | pnpm의 `--`가 worker 인자를 전달하지 않은 것을 확인, 직접 playwright CLI의2workers로 실행 | 30초 제한을 늘리지 않고 통과 |
| 캡처가 전환 전 목록/로딩을 촬영 | URL뿐 아니라 실제 제목·선택 상태·aria-busy=false·이미지/폰트를 대기 | 잘못된 캡처는 교체, 최종12상태 |

1차 검토는 코드·원본·첫 브라우저 실행에 기반했다. 첫 대상 E2E는16/19통과,3실패였으며 [실패 요약](evidence/g05/first-review-e2e.json)에 보존했다. 수정 후 [대상19/19](evidence/g05/development-19.json), 이후 전체 회귀를 수행했다. 2차 검토에서는 UI/목 조회 책임 분리, 취소가 실패 상태를 소비하지 않는 점, 이력별 이메일과 G03 복귀, 원본과 다른 자료를 숨기지 않는지 재검토했다. 검토와 테스트 수는 별개다. 최종 코드에서 확인 가능한 기능 결함은 남기지 않았으며 아래 자료·환경·시각 대기는 완료로 올리지 않았다.

## 4. 실제 검증 명령과 결과

실행 위치 `FE/user-web`, Node24.18.0/pnpm8.14.1. 명령 전 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`을 적용했다.

| 명령 | 결과 |
| --- | --- |
| `corepack pnpm typecheck` | 통과 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | 4파일14테스트 통과 |
| `corepack pnpm build` | 통과. Browserslist 데이터 경고만, 의존성 갱신 범위는 추가하지 않음 |
| `corepack pnpm exec playwright install chromium` | 미설치 실행 파일 보완. Chromium148.0.7778.96 확보 |
| `corepack pnpm exec playwright test --workers=2` | dev33/33. [결과](evidence/g05/development-final.json) |
| `corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=2` | build33/33. [결과](evidence/g05/production-final.json) |
| `node scripts/capture-content.mjs` | 실제 미리보기 캡처12상태, 아래 증거 |
| `/tmp/onehand-visual-venv/bin/python scripts/compare-content.py` | 원본10상태 정규화 비교 |
| `git diff --check` | 통과 |

개발 검증은5175, 빌드는4175의 별도 FE 서버를 사용했다. 기존 미리보기는 시작 시 없어서 `corepack pnpm dev --host 127.0.0.1 --strictPort`로 **http://127.0.0.1:5173/** 를 열고 유지했다. Backend는 실행하지 않았다.

- G05 검색·분류 유지·페이지·무결과·자료 부재·실패/재시도·지연 응답·목차·직접URL·새로고침·뒤로/앞으로·실제 스크롤·390px·긴 한국어·잘못된 이메일·중복 제출·조합 이벤트 가드를 확인했다.
- G01 내부 세션·workspace·초기화·Dialog·실패/경합, G02 메뉴·폭 변경·짧은 화면·이메일, G03 인계 격리/FAQ/관련 글, G04 가격 이력/후기 미제공 모달을 회귀 확인했다.
- 각 E2E는 실제 요청을 관찰하며 interception/navigation mock을 쓰지 않았다. dev/build 모두 실제 API/외부 요청0, 요청 실패0, console 오류0. 캡처 별도 로그는 [browser-captures.json](evidence/g05/browser-captures.json)이다. 정적 파일과 로컬 HMR은 API로 세지 않았다.
- 자동화한 Chromium DOM 키보드/합성 composition 이벤트/CSS 확대는 실제 OS IME·보조기술·실기기 검증이 아니다. 해당 환경 검증은 대기다. fault 설정은 검증 종료 전 Normal로 복원했으며 미리보기는 독립 정상 기본값이다.

## 5. 시각 증거·잔여 차이

[캡처·실제 좌표](evidence/g05/browser-captures.json), [원본 경로·비교 수치](evidence/g05/visual-metrics.json), [비교 쌍/차이 이미지](evidence/g05/comparisons/), [원본 이미지 크롭 좌표](evidence/g05/image-crops.json).

- 제공 원본2880×1800을 Lanczos1440×900으로 정규화했다. 구현 Chromium1440×900/DPR1, 모바일390×600이다. 이 조건은 원본 viewport/DPR 확인을 뜻하지 않는다.
- Resources 메뉴, 초기 목록, General, 스크롤 목록, Start a business, marketing 검색, 기사 상단/본문/두 번째 목차/하단의10상태를 비교했다. Searching01의 희미한 전환은 로딩인지 확정되지 않아 목 로딩과 같다고 비교하지 않는다. 모바일2상태는 원본 미확인 보완 검증이다.
- 비교 대상: Gellix400/500/700,60px제목,20px/34px본문, green/ink, 검색564×54, 카드/간격, 헤더/목차/고정 CTA. 대부분 수치는 정규화 측정이며 기사본문20px/34px는 과거 보관 CSS로 보조 확인했다.
- 잔여: 일반/Start a business 두 번째 행과 전체 목록은 확인 데이터만 사용해 원본 배열과 다르다. 원본 페이지 수가 확인되지 않아 목19개/6개씩4페이지이며 원본의 전체 페이지로 주장하지 않는다. 빈 분류의 자료 부재와 검색 무결과를 구별했다.
- 기사1·3~8의 미수록 문단은 임의 채우지 않았다. 보이는 문단·제목·일부 그림만 사용하므로 총 길이/스크롤 위치/하단 높이가 다르다. 권장 글 줄바꿈·사진 크롭/7px 내 위치·배지·일부 저자 이미지도 차이가 남는다. 일부 본문 인라인 링크/강조는 추가 근거가 필요하다.
- 캡처 밖 기사·추천 본문·G05 소유 resources/rates/alternatives 등 목적지는 기존 목 경계를 유지한다. 후속 화면 연결을 해당 콘텐츠 구현 완료로 기록하지 않는다.
- 원본 모바일/hover/원래검색debounce·서버정렬·가입 후 실제 복귀·OS IME/추가브라우저는 미확인이다. R01·G02~G04 상태를 자동 완료 처리하지 않는다.

## 6. 인계와 확인 순서

1. `http://127.0.0.1:5173/` → Resources → Blog.
2. Start a business → marketing → 기사 → 목차2 → Back to Blog. 검색·분류·스크롤이 복원되는지 확인.
3. 검색어를 길게 바꾸어 무결과→Clear search, Taxes의 자료 부재, General 페이지2→3→브라우저 뒤로/앞으로 확인.
4. 기사 하단 이메일에 `blog@example.test` 입력→Get started→목 가입 인계→뒤로/취소 확인. G10~G14에서 후속 연결을 다시 검증한다.
5. Small businesses 관련 글→메타데이터/미수록 본문→Back to Blog 버튼으로 원래 소개 위치 복귀.
6.390px 화면에서 제목·검색·목차·이메일 경계를 확인. `/components` Preview controls로 Slow/Next read fails를 선택한 뒤 Public→Resources→Blog에서 로딩/재시도를 확인하고 Normal로 되돌린다.

서버 후속 메모: 실제 검색필드·색인/정렬/발행일·콘텐츠 버전·인증 후 원래 의도·실계정 공개 정책은 이후 별도 단계에서 확인한다. 이번 작업에서 API 계약·Backend·DB·메일·실제 인증을 만들지 않았다.

## 2026-11-21 G06 공통 회귀 기록

[G06](G06_RESULT.md)에서 공개 인계에 템플릿 snapshot을 확장하고, 새 문서 default 이력 키가 다른 경로 스크롤을 복원하는 결함을 pathname+search+key로 수정했다. 기존 이메일/가격·메뉴·상세 복귀를 포함한 전체 dev/build 각38개 통과, 실제 API/외부/실패/console0. G06 마지막 시각 변경은 대상5개씩 추가 통과. 이 결과로 기존 원본·시각·환경 대기를 자동 완료 처리하지 않는다.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

검색/이력·실행/네트워크/기록 완료와 미수록 본문·목록·원본 정책 대기를 명세에서 분리했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

## G03 연결 범위 회귀 — 2026-11-23~24 KST

[이번 결과](G03_RESULT.md#g03-r4-recheck). Small business 첫 기사 ID/slug→상세→Back 링크와 실제 history 복귀의 전체 query/hash를 DOM 검증했다. G03에서 articleReturnTo hash 누락을 보완했으며 기사 본문/공통 G05 코드는 변경하지 않았다. 실제 스크롤/새탭은 대기. 전체121개는 이번 실행 수치이며 과거 수치와 합산하지 않는다. 이 Goal 전체 재검토/완료를 뜻하지 않는다.

<a id="g05-r4-recheck"></a>
## G05 R4 기존 구현 재검토 — 2026-11-24 KST

**주요 원본 구성·현재 코드 대조와 동작 보완/단위·DOM 검증 수행. 엄격한 시각 동일성·원본 미수록·실제 브라우저/환경 검증은 대기이며 G05 전체 완료는 아니다.** 이 절이 현재 상태다. 위 2026-11-21 연속 작업 승인·테스트·캡처는 당시 이력이고 이번 G06 이후 착수 승인이 아니다.

### 1. 실제 범위·읽은 자료·시작 상태

- clean HEAD `8f09ad4ab7f7f4c7230e9ff318ceb2b36fd6ca53`에서 시작했다. G05 목록/검색/기사·직접 연결만 보완했으며 기존 G01 전면 교체·G06/G32 신규 착수·커밋/push/배포는 하지 않았다.
- 전체 확인: 첨부 요청, G05 명세와 이 결과의 기존 본문/후속 기록, 관련 3개 ANALYSIS와 PNG 11장, 원본 STANDARD.
- 관련 부분 확인: 원본 REVIEW의 방법·한계·12기준/해당 색인, SOURCE_ANALYSIS_INDEX, 계획 README/COMMON 지도·순서·착수·UXUI·PUBLIC-WEB·MOCK-UI-STATE·USER-FLOW·FLOW-GOAL-MATRIX·FLOW-BEHAVIOR-REVIEW·SOURCE-ANALYSIS-IMPACT·EXPANSION-BACKLOG·PLAN-INDEX. R01 명세/결과 11절·후속 소비 기록, G00 재검토/인계, G01/G02 재검토와 G03/G04 최신 연결, G01_G15 재검토, G01~G04/G06/G10/G11 및 필요한 G13/G14의 범위·현재 인계 결과를 확인했다. 모든 G/R/결과 문서를 전수 정독했다는 뜻은 아니다.
- 적용 규칙: AGENT README, PM036/UX025, FRONT README 지도, 결정006 우선·005의 수정 범위 적용, ARCHITECTURE의 User Web/STATE_AND_DATA/MOCK_FIRST_DEVELOPMENT/TESTING, CONVENTION의 User Web/COMPONENT_DESIGN/WEB_ACCESSIBILITY_AND_LAYOUT/COMMENT_AND_LOGGING, ENGINEERING_REVIEW_CHECKLIST 및 PM 문서화 규칙. 해당 경로의 추가 AGENTS는 없고 AGENT_USAGE_RULES.md는 기존과 같이 부재다. 구형 실제 로그인·API/BE 선행 작업·TODO_LOG 추가보다 이번 사용자 범위를 우선했다.
- G01 Dialog/공개 공급자, G02 메뉴·가입, G03 관련 글 12개/공유 ID, G04 고객군 탐색과 공통 회귀, G06 기사 안의 계약 템플릿 진입, G10/G11 이메일·로그인 왕복·취소를 연결 대상으로 삼았다. G13/G14 전체 온보딩/앱 셸은 재구현하지 않았으며 현재 코드·기존 인계 정책만 확인했다.

### 2. 원본 식별·직접 열람

앱 Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 저장된 카탈로그 **Latest / 2146**. 이번 MCP·공식 웹·보관본 신규 조회는 **없다**. 기존 보관본 채택/불채택을 현재 코드와 대조했으며 현재 웹을 섞지 않았다.

| 흐름 | Flow ID | ANALYSIS LF SHA-256 |
| --- | --- | --- |
| F005 · [분석](<../../../bonsai_analysis/flows/Blog/ANALYSIS.md>) | `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` | `c9cb33ef4c1d6b1a4c299e3a759888e8d65b9d8b03ad9a3d1d63389d86ebcf6c` |
| F006 · [분석](<../../../bonsai_analysis/flows/Blog/Blog detail/ANALYSIS.md>) | `7b469aed-f69f-4f73-af50-9b1adb7aa052` | `23ae462cb6226af39f148873cb3a8f6468879834dbdda6b25de89fa0e950c3e4` |
| F007 · [분석](<../../../bonsai_analysis/flows/Blog/Searching blog/ANALYSIS.md>) | `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` | `57ced896cd3a5cd10a91bbd28c6cedbd7f307c6d4aec1c7403a72896f1c1fd98` |

| 직접 열람 | Screen ID·원본 경로 | PNG SHA-256 앞 12자리 | 확인한 주요 구성·상태 |
| --- | --- | --- | --- |
| [x] F005 01 | [sc_549a6fa823b74e3e8d826750df6f1f99](<../../../bonsai_analysis/flows/Blog/screens/01_sc_549a6fa823b74e3e8d826750df6f1f99.png>) | `090fe727a473` | Resources 흰 메가 메뉴·그림자·hero 겹침 |
| [x] F005 02 | [sc_f784e647d4c44c448969e5641b1f3fd0](<../../../bonsai_analysis/flows/Blog/screens/02_sc_f784e647d4c44c448969e5641b1f3fd0.png>) | `52e1ac158215` | 초기 목록·제목/설명·검색·8분류·3열 |
| [x] F005 03 | [sc_ed1d234775a74b4bad3ca7f497d20970](<../../../bonsai_analysis/flows/Blog/screens/03_sc_ed1d234775a74b4bad3ca7f497d20970.png>) | `5d96a7317e57` | General 선택·같은 첫 3카드 |
| [x] F005 04 | [sc_2c58d306a0c54343967cbe26160fc0cb](<../../../bonsai_analysis/flows/Blog/screens/04_sc_2c58d306a0c54343967cbe26160fc0cb.png>) | `71ae752baf1d` | 요약 길이·정렬된 저자 행·다음 행 |
| [x] F006 01 | [sc_b52cd2aea5074f8d930af3171a2bd612](<../../../bonsai_analysis/flows/Blog/Blog detail/screens/01_sc_b52cd2aea5074f8d930af3171a2bd612.png>) | `64172eb96ef6` | 제목/태그·8분·배너·저자/날짜·구분선 |
| [x] F006 02 | [sc_ea03e557975943e098cc09b234f20976](<../../../bonsai_analysis/flows/Blog/Blog detail/screens/02_sc_ea03e557975943e098cc09b234f20976.png>) | `87698597d5df` | 목차·본문 일부·고정 가입바 |
| [x] F006 03 | [sc_ece27efe36654187a391ca036a676353](<../../../bonsai_analysis/flows/Blog/Blog detail/screens/03_sc_ece27efe36654187a391ca036a676353.png>) | `407c10d5056c` | 현재 목차2·사진·추천2·brand questionnaire 링크 |
| [x] F006 04 | [sc_419cd6d4273041e4b60091cffb1f05e2](<../../../bonsai_analysis/flows/Blog/Blog detail/screens/04_sc_419cd6d4273041e4b60091cffb1f05e2.png>) | `670d4927a98e` | 마지막 목차·SoftwareWorld 배지/출처·반복 CTA·푸터 |
| [x] F007 01 | [sc_6523185471cd431aae909650125ca79c](<../../../bonsai_analysis/flows/Blog/Searching blog/screens/01_sc_6523185471cd431aae909650125ca79c.png>) | `96acbf58581a` | 희미한 카드·빈 이미지, 원인은 미확인 |
| [x] F007 02 | [sc_d9ab19c1590d43e99432b10f85607cd0](<../../../bonsai_analysis/flows/Blog/Searching blog/screens/02_sc_d9ab19c1590d43e99432b10f85607cd0.png>) | `2b469a0e6baf` | Start a business 정상 카드·저자 |
| [x] F007 03 | [sc_94b98a51d45a4cc0b25c5553ce66bb60](<../../../bonsai_analysis/flows/Blog/Searching blog/screens/03_sc_94b98a51d45a4cc0b25c5553ce66bb60.png>) | `a69078b0e506` | marketing·분류 유지·왼쪽 1카드·1 / 1 |

11개 PNG 전체 바이트 해시·2880×1800·단계 순서와 3개 ANALYSIS의 LF 해시는 저장된 색인과 일치했다. 해시 검사는 직접 이미지 열람과 별개다. 새 이미지/시트/크롭을 만들지 않고 기존 원본을 도구로 열었다. 도구의 표시 축척은 자동이며 명시적인 구현 비교 축척을 설정하지 않았다. 원본 CSS viewport/DPR·촬영일/제품 빌드·OS/브라우저/배율·절대 scrollY는 미확인이다.

기존 Blog 보관본 2024-01-18 08:27:44/2024-02-29 10:34:14는 목록 순서가 달라 불채택, 기사 2024-03-02 16:48:06은 경로/목차/일부 구조 보완만 채택했다. 이번 재조회는 아니다. 카드 7개+G03 12개=일반 목 목록19개, 추천2개 별도(전체 로컬21 ID)이며 Bonsai 전체 글 개수가 아니다. 2022-12-11·8 minute read·SoftwareWorld 표시는 관찰된 과거 콘텐츠로 보존했다.

### 3. 원본·분석·계획·현재 코드 대응

| R4/요소 그룹 | 원본·분석 위치 | 코드와 이번 판정 | 남은 범위 |
| --- | --- | --- | --- |
| F005-O01 · B01 메뉴/hero/검색/분류/그리드 | Blog 01~03, ANALYSIS 4절 | 유지. PublicHeader·BlogList·public-content.css의 흰 메뉴/그림자, 중앙 검색, 분류8개, 3열·외곽선 없는 카드. G02 메뉴 회귀 포함 | 정밀 치수/픽셀·실브라우저 겹침 |
| F005-O02 · B02 카드/저자 | Blog 04, ANALYSIS R4 | **문서 보완**. 원문은 저자 행 높이가 다르다고 하지만 직접 본 04의 세 Brian Hughes 사진/이름은 같은 행에 정렬된다. Searching02도 같은 정렬이다. 기존 flex-column + author margin-top:auto를 유지 | R01/G05에서 원본 분석 문구 정정 검토. 이번 원본 분석·해시 원문은 보존하고 계획에 충돌을 연결 |
| F005-A01 · B03 목록 자산/전체 목록 | Blog 04/8절 | 분석 대기. 현재7카드와 소개12개·추천2개의 역할/사진/slug를 분리 | 전체 목록/정렬/정확 crop·원본 자산/픽셀 |
| F006-O01 · A01 상단/메타/목차 | Detail01/4절 | 유지+동작 보완. ArticleDetail/ArticleBanner/목차8개·제목/태그/읽기/저자/날짜/구분선. 목차의 query·출발 정보 보존 | 정확 폰트/배치/태그·읽기 시간의 원본 정책 |
| F006-O02 · A02 본문/추천/가입바/배지 | Detail02~04/4절 | 구현 보완. CTA 전체 URL·출발 이력 인계, 추천/본문 관련 글 복귀, `brand questionnaire`의 누락된 녹색 링크 표시와 로컬 미확인 목적지 안내. 사진·추천2·배지/3줄 출처·두 줄 가입 문구 유지 | 원본 링크 실제 목적지/배지 클릭·sticky 조건·미수록 본문과 전체 높이 |
| F006-A01 · A03 폭/겹침/본문 | Detail02~04/8절 | 분석 대기. 미수록 문단은 기존 안내를 유지하고 새 원문을 작성하지 않음 | 전체 본문/정확 높이·고정바 가림·모바일·픽셀 |
| F007-O01 · S01 전환/선택/입력 표시 | Searching01~03/4절 | 유지. 01의 희미한 카드+빈 이미지 원인은 미확인, 02의 진한 녹색/흰 분류 pill·03의 옅은 입력 배경 유지. 목 loading/empty/no-result를 구분 | 로딩/애니메이션 원인, 원본 상태 시간·opacity |
| F007-O02 · S02 검색 결과 배치/분류 | Searching03/4절 | 유지+구현 보완. 분류를 유지한 marketing 결과1개/왼쪽 첫 열/1 / 1. URL·초안·page·추가 query/hash 보완 및 DOM 검증 | 원본 제출 방식/검색 범위/정렬·정확 줄바꿈 |
| F007-A01 · S03 검색 정책 | Searching8절 | 분석 대기. 200ms·제목/요약 부분검색·6개/페이지·General 전체·정규화·취소는 명시적 목 정책 | 원래 debounce/Enter·본문/저자 검색·전체 페이지/모바일 |

요소 그룹은 이번 주요 구성 대응표이며 원본 모든 요소의 개수·개별 ID 전수조사를 완료했다는 뜻은 아니다. F005-O02의 원문을 맞추려고 원본과 현재 정렬을 임의 변경하지 않았다.

### 4. 발견 문제·수정·재검토

| 문제·원인 | 수정 위치·처리 | 이번 검증 |
| --- | --- | --- |
| 분류가 새 URLSearchParams를 만들어 다른 query를 삭제하고 검색/페이지 이동이 hash를 버림 | use-blog-search: 기존 query 복사, pathname/search/hash/state를 함께 이동 | 추가 query/hash, 분류+marketing·초기화·페이지 DOM |
| 같은 q의 뒤로가기에서 초안/조합이 남아 이전 debounce가 복원 URL을 덮음 | 입력을 location.key+revision에 귀속, 이력 이탈에서 초안 폐기·예약 해제 | 뒤로 후 URL 보존. 1차 수정에서 앞으로 가기의 초안 재등장도 재현해 추가 수정 |
| 조합 중 분류가 미확정 한글을 검색으로 발행 | 분류 이동은 확정 q, 일반 초안+페이지 클릭은 새 검색 첫 페이지를 즉시 확정 | 합성 composition·연속 검색·페이지 의도 |
| 잘못된 category/page·범위 밖 page가 표시와 URL에서 다름 | 결과를 기준으로 replace 정규화, 입력 중 자동 보정 중지 | 잘못된 값/999→4·다른 query/hash 유지 |
| 카드 returnTo에서 hash 누락·본문 관련 글 출발 정보 없음 | ArticleLink와 G03 RelatedArticles가 PublicOrigin 전달 | 목록/소개·추천/본문 기사 왕복, 같은 ID 유지 |
| 목차가 query를 버림 | ArticleDetail의 TOC가 전체 pathname/search와 state를 보존한 hash replace | 목차 후 부모/목록 복귀 |
| 가입 취소가 기사 URL과 최초 출발 정보를 잃음 | 상하단/인라인/고정 CTA의 returnTo·returnOrigin, PublicProvider snapshot 복사, SignupPage 취소 state 복원 | 이메일/배너→가입→로그인→뒤로→취소→기사→최초 목록 |
| 단순 navigate(-1)는 중간 인증 이력이 있으면 출발지와 어긋남 | ArticleBackLink는 같은 메모리 scope와 Router history idx를 검증해 원래 위치로 POP. 일반 Link href 유지 | 중간 인증 이력 건너뛰기, 부모→목록, G03 기존 회귀 |
| 새 공급자 수명에서 오래된 history state를 재사용 | PublicOrigin에 메모리 UUID+revision, 새 문서/Reset/사용자 범위에서 무효화 | provider remount 기본 /blog·Reset 조회 격리 |
| 원본의 brand questionnaire 링크 표시 누락 | ArticleParagraph에 녹색 버튼과 기존 Dialog의 미확인 목적지 안내 | 열기/닫기·초점 복귀. 실제 목적지 확인 완료 아님 |

새 PublicOrigin은 공개 탐색 URL/key/index/scope만 포함하며 이메일·인증 비밀값을 URL이나 출발 state에 넣지 않는다. `articleReturnTo/articleFromKey`의 기존 의도를 검증 가능한 `articleOrigin`으로 합쳤다. 브라우저 새 탭에는 React Router state/공급자 메모리를 전달하지 않으며 직접 진입의 기본은 /blog다. 실제 새 탭·reload 검증은 대기이고 provider remount/독립 URL의 DOM 검증과 구분한다.

원본 미관찰 목 정책: 이력 이동 시 미확정 검색/IME 폐기, 분류 변경 중 조합은 마지막 확정 q 사용, 새 초안 상태에서 옛 결과의 페이지 버튼을 누르면 새 검색 1페이지, 명시적 clear는 q/page/조합 폐기, 잘못된 URL 정규화, 출발 scope 만료의 기본 복귀, 미확인 링크 안내 Dialog. 세션이 바뀐 뒤 선택한 인증 intent만 복원하는 기존 G14 정책을 풀지 않았다. 정적 기사에 저장/서버 실패를 추가하지 않았다.

### 5. 실제 명령·검증과 환경 한계

Node **24.18.0**, pnpm **8.14.1**. package 요구 Node>=24<25/pnpm8.14.1과 현재 명령을 확인했다. 일반 tsc -b/Vite build/Playwright는 tsbuildinfo·dist·report/trace·브라우저 프로필을 만들 수 있어 그대로 실행하지 않았다. 명령 범위에서 NODE_DISABLE_COMPILE_CACHE=1, JITI_CACHE=false, JITI_FS_CACHE=false를 적용했다. 환경 파일/서버 설정 변경 없음.

| 실행 | 결과·범위 |
| --- | --- |
| 신규 content-entry 실제 Router/jsdom 회귀 첫 실행 | 7개 중6실패/1통과로 URL·이력·IME·인계 결함 재현. 이후 즉시 페이지 의도 확인을 강화 |
| 수정 후 G05+G03 대상 | 14개 중13통과/1실패: 앞으로 가기 초안 재등장 추가 발견·수정 |
| G05 확장 대상 | **13/13 통과**. 합성 IME·오류/재시도·지연/Reset·이메일/취소·관련 글/템플릿·읽는 위치 포함 |
| TypeScript CLI | `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false`, node config도 같은 옵션: 통과 |
| ESLint CLI | `node node_modules/eslint/bin/eslint.js . --no-cache`: 최초 제어문자 정규식 lint1건을 문자열 검사로 바꾼 후 통과 |
| 전체 Vitest stdin API | **28파일143/143 통과, 92.75초**. G05 신규13 + 기존130. G03 7/G04 9/public-entry8/header6·목 저장소 포함. 과거 수치와 합산 안 함 |
| Vite stdin API | **1970 modules**, write:false 메모리 bundle3개, 디스크 dist 없음. 통과. Browserslist 오래된 데이터 경고만 유지 |
| 실제 브라우저 | **미실행**. document-control 세션 없음, 기존 Chrome/Edge remote-debugging 연결/9222·9333 없음. 새 브라우저 프로필/환경 변경으로 우회하지 않음 |
| 픽셀 비교/캡처 | **미실행**. 사용자 산출물 금지에 따라 screenshot/trace/video/HTML/비교 이미지·별도 evidence·검증 JSON/manifest/log/tmp/script 생성 안 함 |

Vitest는 Node stdin에서 `startVitest('test', filters, options, viteOptions)`를 사용했다. options: config:false/run:true/cache:false/pool:threads/execArgv:[]/maxWorkers:2/environment:jsdom/include:src/**/*.test.{ts,tsx}/setupFiles:vitest.setup.ts/reporters:default/coverage.enabled:false/experimental.fsModuleCache:false/deps.optimizer.client·ssr.enabled:false. Vite options: configFile:false/React plugin/@→src/optimizeDeps.noDiscovery:true/include:[]/server.watch:null. 설정 번들/파일 보고서/캐시를 생성하지 않는다. 메모리 build는 같은 React/alias와 메모리에서 읽은 Tailwind config·PostCSS tailwind/autoprefixer, build.write:false/copyPublicDir:false/sourcemap:false/reportCompressedSize:false를 사용했다.

DOM 검증의 navigation은 실제 App/createBrowserRouter/history다. jsdom에 없는 scrollTo/scrollIntoView/IntersectionObserver/matchMedia/native Dialog 메서드와 한 시나리오의 위치 계산만 대체했다. 이 검사를 실제 브라우저 스크롤·키보드·화면 크기·OS IME/터치·보조기술·새 탭·네트워크 관찰로 주장하지 않는다. 스크롤 리스너의 정리와 URL hash/읽는 위치 분리는 DOM 범위만 확인했다. 실제 인증/업무/외부 API의 코드 추가는 없지만 **브라우저 요청/실패/console 0건은 이번에 관찰하지 못했다**.

### 6. 공통 12기준·FRONT_AGENT·체크리스트

| 기준 | 이번 코드/근거·판정 |
| --- | --- |
| C01 식별 | [x] 3흐름11단계·파일/해시/버전 연결. [ ] 촬영 조건 |
| C02 전체 구성 | [x] 주요 메뉴/목록/상세/추천/고정바 대조. [ ] 실제 겹침/가림 |
| C03 요소 목록 | [x] 위 B/A/S 그룹 대응. [ ] 전수 요소 개수/개별ID·누락0 인증 |
| C04 정확한 표시 | [x] 관찰 제목/태그/메타/8목차·카드·2추천·배지 문구 유지, 누락 링크 표시 보완. [ ] 전체 본문/줄바꿈 동일성 |
| C05 배치 | [x] 원본2880×1800과 코드 비교값을 분리. [ ] CSS viewport/DPR/좌표·픽셀. 검색564×54·본문720폭 등 기존 값은 추정/과거 정규화 값 |
| C06 글자 | [x] 기존 Gellix400/500/700·제목60/본문20·행간34 코드 유지와 기존 보관 근거 구분. [ ] 원본 폰트/렌더링 정확 동일성 |
| C07 색·장식 | [x] 녹색 선택/입력 배경·둥근 사진·무테두리 카드·그림자 대조. [ ] 색 표본/opacity/정밀 radius·shadow |
| C08 자산 | [x] 로컬 사진/저자/배지 경로와 G03 공유 데이터 유지. [ ] 원본 전체 에셋/정확 crop·사용 조건 |
| C09 상태 | [x] 초기/General·검색·자료 부재·무결과·loading/error/retry DOM 구분. [ ] Searching01의 원래 원인/hover |
| C10 전환 | [x] URL·목차/읽는 위치·중간 이력/복귀 DOM 검증. [ ] 원본 클릭/검색/시간·실제 스크롤 |
| C11 입력·저장 | [x] 검색 초안/확정·IME·이메일 snapshot/중복/취소·scope. N/A 기사 본문 저장·업로드·실제 API |
| C12 화면 연결 | [x] 같은 기사ID/slug·소개/추천·템플릿/가입 연결. [ ] 전체 G06/인증·온보딩 실브라우저·원본 정책 |

- [x] START 착수: 요청/HEAD/범위·원본·선행 결과/실제 코드·목 경계 확인. G/R 문서 전수 완독과 소비 범위 확인을 구분했다.
- [x] 구조/컴포넌트: page 조립 유지, 검색 hook/취소 reader/정적 catalog, 기사 링크/미확인 문단 UI, 공개 origin helper/provider·가입 소비 책임 분리. G03→public-web, public-content→G03 공개 카탈로그의 기존 방향 유지. 신규 패키지/HTTP adapter 없음.
- [x] 상태/데이터: URL(category/q/page), 이력별 입력 초안, Query(revision/scenario/category/q/page), 메모리 이메일/intent·origin 수명 분리. 동일21기사ID와 일반/추천 구분 유지.
- [x] 목/실패: 로딩·빈 데이터·무결과·read-error/retry·취소·늦은 조회/Reset·일회 실패 미소비 기존 회귀 통과. 장애 테스트는 독립 공급자에서 종료하고 Normal로 복원했다. 기존 미리보기에는 검증 장애를 주입하지 않았다.
- [x] 주석/타입: 신규·동작 변경 함수에 한 줄 한글 기능 주석, strict 타입·effect/timer/listener 정리·현재 lint 확인.
- [x] 접근성 코드/DOM: 검색 label·버튼 type·분류 aria-pressed·loading aria-busy/status·오류 alert, Dialog 닫기/초점 복귀. 링크 보조 클릭은 React Router의 기본 href 처리를 유지.
- [ ] 실제 브라우저의 키보드/포커스·스크롤/overlay·좁은 화면/짧은 높이/확대·긴 제목·OS IME·터치·새 탭/refresh·console/network. G05와 공통 소비 G01/G02/G03/G04/G06/G10/G11, 최종 G84.
- N/A: 신규 업무 객체 CRUD·계산/금액·권한 설계·Admin·BE/API/DB/실인증·발송/결제·출시. 정적 기사 저장 실패를 인위적으로 만들지 않음.
- [x] 문서 작업은 기존 결과에 추가하고 관련 명세·표·현재 안내·색인을 갱신한다. 최종 정합성 검사의 실제 결과는 아래 종료 기록으로 구분한다.

### 7. 남은 작업·미리보기 직접 확인

- [ ] **G05/R01 분석**: 전체 목록/정렬/카탈로그·미수록 기사/추천 원문·원래 검색/복귀·sticky/모바일·brand questionnaire/배지 목적지. F005-O02 원본 분석 문구와 직접 관찰의 충돌을 후속 원본 문서 정정 대상으로 남긴다.
- [ ] **G05/R01 + G01 시각**: 폰트/정확 자산/촬영 조건, 목록 둘째 행·사진 crop·전체 본문 높이·줄바꿈·추천/배지 위치·고정바 가림. 새 캡처/비교 산출물 없이 이번에 동일성 확인을 완료하지 못했다.
- [ ] **G05 및 연결 G/G84 환경**: 실제 브라우저의 아래 순서와 네트워크/console, 새 탭·reload·OS IME·보조기술/실기기.
- [ ] **G06/R01**: 템플릿 카탈로그 이후 전체 기능/미수록 목적지. **G10/G11/G13/G14·R02**: 성공 인증/온보딩까지의 전체 왕복과 실제 환경. 이번 가입 취소/로그인 왕복 DOM을 전체 인증 검증으로 확대하지 않는다.
- 서버 후속 메모: 실제 검색필드/색인·정렬/페이지/콘텐츠 버전, 인증 후 복귀·권한·영속성은 이후 별도 단계. 이번 API 계약·DB 설계 없음.

기존 미리보기는 **http://127.0.0.1:5173/**, Windows PID30272의 Vite dev/HMR `node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort`다. G04 과거 Mac 메모리 production 서버와 다르다. 기존 서버·포트를 보존했으며 반영 기준은 HEAD 8f09ad4a 위 이번 G05 작업 트리다.

1. /blog?entry=manual#articles → Resources/Blog 재선택 → Start a business → marketing. 분류·query/hash·결과1개/1 / 1 확인.
2. 기사 → 목차2 → 추천/관련 기사 → Back to Blog → 부모 기사 → 최초 목록. 소개 /software/small-businesses?entry=manual#related-content에서도 관련 글 왕복.
3. 기사 ?entry=manual#find-your-niche → 상하단 Try it free/Sign-up 또는 고정 이메일 입력 → /signup → /login → 뒤로 → Cancel. 기사 URL·원래 목록 복귀와 다른 /crm 초안 보존 확인.
4. 검색 중 뒤로/앞으로·분류/페이지·한글 조합·초기화. Taxes 자료 부재와 Legal+marketing 무결과 구분. /components에서 Slow/Next read fails 후 검색·재시도·Reset, 마지막 Normal 확인.
5. 기사 contract templates → /templates/contracts → 브라우저 뒤로. brand questionnaire → 미확인 안내 → 닫기/초점 복귀. 미수록 글과 없는 slug를 구분.
6. 실제 브라우저에서 좁은 화면/짧은 높이/확대·고정 영역 가림·키보드·새 탭/reload·OS IME와 요청 차단 없는 network/console을 확인한다. 이 순서는 남은 수동 확인 안내이며 이번 실행 통과 기록이 아니다.

### 8. 종료 전 추가 검토·최종 정합성 — 2026-11-24 KST

- [x] 같은 React 갱신 안에서 compositionstart→input 또는 input→compositionend가 연속 발생하는 경우를 추가 대조했다. 검색 setter를 이전 상태 기반 함수 갱신으로 보완하여 조합 상태와 마지막 입력이 서로 덮이지 않게 했다. 기존 G05 조합 회귀에 같은 프레임 이벤트를 포함했으며 실제 OS IME 검증과 구분한다.
- [x] 마지막 기능 수정 후 전체 단위/jsdom **28파일143/143, 99.48초** 재통과. G05 13개와 기존130개이며 앞선 전체143개·중간 소비 회귀43개(5파일)와 합산하지 않는다. TypeScript app/node의 noEmit·incremental false, ESLint no-cache도 다시 통과했다. 메모리 Vite build는 **1970 modules·출력3개·write:false, 9.11초**로 통과했다. Browserslist 데이터 경고는 남아 있으며 의존성을 변경하지 않았다.
- [x] 기존 5173 서버의 /blog와 수정된 검색 hook/기사 링크/문단/가입 모듈을 메모리 HTTP GET으로 확인했다. 모두200이며 최신 함수/연결 표시가 응답에 존재했다. Vite /@vite/client도 확인했고 의존성 최적화 metadata 수정 시각은 요청 전후 동일했다. 이는 코드 제공 확인이며 실제 브라우저 렌더링·동작·API 요청0건의 증거가 아니다.
- [x] 원본3 ANALYSIS의 LF 해시와11 PNG의 바이트 해시를 종료 전에 다시 확인했다. 모두 착수 때 색인과 일치하며 원본 문서·PNG를 수정하지 않았다. F007-O01(희미한 전환/선택/입력 표시)과 O02(검색 결과 배치/분류 유지)의 매핑도 원래 분석 항목과 재대조했다.
- [x] 계획의 **170 Markdown+PLAN-INDEX.json**에 대해 로컬 링크·앵커/참조와 JSON 구조를 검사했다. 이번 변경으로 추가된 링크 오류0건, 검증 assertion 실패0건이다. 기존 HEAD에도 있던 누락 파일/앵커 참조 **221건**은 그대로이며, 없는 과거 evidence를 복원하지 않았다. 이 구조 검사는170문서 전체 내용 완독이나 사용자 동작 검증을 뜻하지 않는다.
- [x] **85 G·22 R·실행순서107·134흐름·754단계·642고유화면·455 R4 항목·공통12기준**의 ID/배정/의존성을 대조했다. 이번9항목 외446항목, 단계 배정·선행 관계·과거 verification은 보존했다. G83/G84의 전체 R 최종 감사 관계는 구현 소비 관계와 구분해 검사했다.
- [x] 계획의 기존40문서(JSON 포함)에 현재 범위·체크·부분 완료/대기·기존 결과 연결을 반영했다. 공통 체크리스트는 이번 적용 범위를 표시했고 연결 Goal/R 전체를 완료로 올리지 않았다. FE ARCHITECTURE의 G05 설명도 현재 책임 분리에 맞췄다. 별도 결과·증거·임시 파일은 만들지 않았으며 신규 파일5개는 정식 소스4개와 회귀 테스트1개다.
- [ ] **G05/R01·연결 G/G84**: 위7절의 미수록 원본·엄격한 시각 동일성·실브라우저/console/network·새 탭/reload·OS IME/실제 스크롤 검증은 남아 있다. 기존 누락 링크221건은 과거 자료 부재를 포함한 문서 인계 사항이며 이번 신규 링크 정합성과 별개다.

최종 판정은 **구현 보완·단위/DOM·정적 문서 검토 수행 / 시각·분석·실제 브라우저 대기인 부분 완료**다. 커밋·push·배포와 다음 Goal 착수는 하지 않았다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 기사→카탈로그 및 articleOrigin과 templateOrigin 분리·기사 가입 취소 기존13회귀. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.
