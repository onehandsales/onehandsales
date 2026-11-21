# G05 — 블로그·검색·상세 실행 결과

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
