# G09 제휴·채용·정책 안내 실행 결과

> 현재 G09 — 2026-11-24 KST: **부분 완료**. 원본11단계·연결5PNG를 확인하고 정책 발췌/출발 이력/가입 취소를 보완했다. 단위/DOM188/188·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크·전체 정책 근거는 대기다. 과거 이력과 다른 G/R 상태를 보존한다. [범위·체크·잔여](G09_RESULT.md#g09-r4-recheck).


> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST. 목 UI·두 차례 검토·현재 검증 수행. 정책 발췌/버전·시각·원본 미수록 동작·추가 환경 대기는 유지한다. 실제 제휴 신청·채용 지원·개인정보 요청·보상 지급·정책 동의 기능이 아니다.

## 근거와 범위

[R01 §15](R01_RESULT.md) · [MCP](evidence/g09/mcp-sources.json) · [보관본](evidence/g09/archive-fetch.json) · [출처/정책 범위](evidence/g09/source-scope.json) · [자산](evidence/g09/asset-manifest.json).

- Affiliate Program `fcb41661-2520-40ac-842c-b463a7891093` 4단계, Careers `35234808-9af8-4240-9025-e24a5951eaa9` 4단계, Privacy `776f20e2-7498-433f-af8b-f585988e2429` 2단계, Terms `912b4b75-77bb-43fa-b86f-d85c6117841a` 1단계. ANALYSIS·11PNG 직접 확인, MCP11단계 신규 조회. Screen ID/순서는 MCP evidence에 보존한다.
- App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 카탈로그 Latest/2146은 같은 연속 작업 G05 확인을 재사용. 원본 촬영일·실제 제품 빌드는 미확인이다.
- 보완 HTML은 모두 실제 반환2024-01-18(요청2024-02-03과 구별). CTA href·배경/사진/아이콘·정책 문구를 대조했다. 원래 제휴/채용 외부 서비스에는 진입하지 않았다. 정책 전체 보관 HTML은 확보했지만 화면은 제공 PNG의 발췌만 재현한다. 중간·하단 미수록 부분을 전체 문서처럼 표시하지 않는다.
- Privacy는 표시된 개정일 없음. Terms의 `Last Updated: June 30, 2020`은 표시된 갱신일이며 효력일·촬영일·가입 때 연결된 버전을 확정하지 않는다. 현재 우리 서비스 정책으로 채택하지 않는다.
- 제휴 200%/30%와 고정 보상표는 동시에 표시하되 관계/우선순위/현행성 미확인. 채용의 과거 보상/비자/휴가는 운영 정책으로 채택하지 않는다. 사진 인물의 신원/조직/촬영 시점은 추정하지 않았다.

## 화면·구조·목 상태

| 경로 | 구현·경계 |
| --- | --- |
| `/affiliates` | 히어로·3단계·정적 설명 그림·혜택6개·하단 CTA. 그림의 신청/보상 표시는 실제 폼/성공이 아님 |
| `/careers` | 제목·사진 격자·혜택6·그룹 사진·가치3. 제공 PNG 외 사진5개는 같은 보관 HTML의 보완 자산 |
| `/legal/privacy`, `/legal/terms` | 제공 발췌·의미 있는 제목/목록·미수록 안내·과거 정책 표시·로컬 링크 |
| `/outbound/:id` 7개 고정 목적지 | affiliate-application/contact, careers, cookie-policy, privacy-contact, linkedin, twitter. URL은 설명 텍스트, 실제 서비스/메일을 열지 않음 |

page/feature 카드·정책·외부 안내/data/CSS 책임을 분리했다. 기존 공개 헤더/메뉴/푸터/Gellix를 재사용했다. 정적 내용에는 가짜 로딩/오류/저장소를 추가하지 않았다. 회사 영역의 상단/스크롤 헤더 스타일만 한정했다. 소셜 PublicLink에 출발 pathname/search/history key를 전달해 출발 페이지의 실제 back/scroll 복원을 지원했다.

제휴 Apply/Get started는 `https://hellobonsai.firstpromoter.com/`, Contact는 `mailto:affiliates@hellobonsai.com`, 채용은 `https://bonsai.crew.work/jobs`, 쿠키는 `https://www.iubenda.com/privacy-policy/35324406/cookie-policy`를 근거로 로컬 안내한다. 개인정보 본문의 연락처를 로컬 안내 링크로 보완했다. 실제 신청·메일·법적 요청·쿠키 설정 변경은 없다.

목 수명: 링크 진입은 출발 이력을 보존하고 Back to source는 실제 navigation(-1), 직접 URL은 확인된 고정 출발 페이지로 replace한다. 새로고침에는 공개 이메일·개인 상태가 초기화되며 외부 목적지 자체는 고정 카탈로그에서 다시 표시한다. 로그인/역할/구독 상태는 변경하지 않는다. 같은 페이지로 돌아온 공개 이메일은 refresh 전 유지, 이후 폐기됨을 검증했다. G10 이후 인증 연결은 G14 종합 검증에서 확인한다.

## 검토·수정·회귀

1차 코드/흐름 검토에서 소유 범위·실제 외부 실행 차단·원본과 보관 자산 차이·정책 발췌 표시를 확인했다. 히어로 인물과 설명 그림은 보관 자산 조합이 PNG와 달라 제공 PNG의 정적 그림 영역으로 교체했다. 배경 패턴·카드 높이/간격·폰트/행간·사진 위치·헤더·정책 본문 여백을 비교해 보정했다. 최초 대상 브라우저4/4 통과 기록은 `development-first-review.json`이다.

2차 재검토에서768/1024px 설명 이미지가 화면 오른쪽에서 잘리는 것을 실제 경계 좌표로 확인했다. 해당 breakpoint에서 이미지 너비를 부모에 맞추고 실제 이미지 경계 검사를 추가했다. 태블릿 캡처에서 제목을 덮는 장식 가지도 숨겼다. 정책 제목/요청 항목을 h2/ul/li로 보완하고 링크에 밑줄/대비를 적용했다. 좁은 화면/확대에서도 본문·CTA 경계를 확인했다.

전체 회귀 첫 실행49/51에서 두 실패를 보존했다(`development-full.json`). 랜딩 Privacy 테스트가 기존 G09 목 문구를 기대한 것은 새 실제 제목·본문 확인으로 갱신했다. 도움말 연속 검색은 앞선 URL의 늦은 반영이 이후 입력을 덮는 실제 경합이었다. 제출 당시 입력 revision을 이력에 기록해 새 입력을 지키고 POP에서는 URL을 복원하도록 수정했다. 기존 G08 테스트에 URL/입력 최종값 검증을 강화했다. UI navigation을 mock하지 않았다. 도움말 변화는 [G08](G08_RESULT.md)에 역기록했다.

## 실행 결과와 시각 비교

FE/user-web, Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 다음 명령을 실행했다.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`: 18/18, `corepack pnpm build` 통과. JS739.39kB 및 Browserslist 오래된 데이터 경고는 남는다. 정적 화면을 위한 중복 단위 테스트는 추가하지 않았다.
- `corepack pnpm exec playwright test --workers=2 --reporter=line,json` 및 `-c playwright.preview.config.ts`: 수정 후 전체 개발51/51·빌드51/51 통과(`development-recheck.json`, `production-recheck.json`). 마지막 태블릿 장식 수정 후 같은 명령의 `tests/e2e/company.spec.ts` 대상 개발4/4·빌드4/4 통과(`development-final.json`, `production-final.json`). 실패한 첫 실행과 수정 후 결과를 구분했다. 정상 기본값으로 복원한다.
- `node scripts/capture-company.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-company.py`: 11원본 상태+모바일4+태블릿2, 총17캡처/11비교. [조건/실제 요청](evidence/g09/browser-captures.json) · [지표/원본 경로](evidence/g09/visual-metrics.json) · [pair/diff](evidence/g09/comparisons/). 원본 PNG2880×1800을1440×900으로 정규화했다. 실제 브라우저 Chromium148, DPR1, viewport/scrollY 저장. 원본 실제viewport/DPR/배율은 이 해상도만으로 확정하지 않는다.
- 모든 비교 pair와 모바일/태블릿 화면을 직접 확인했다. 원본 클릭 순서·hover·새 탭·모바일 배치는 정적 캡처만으로 확정하지 않았다.
- 직접 진입·새로고침·실제back/forward·스크롤·소셜/문의/CTA복귀·키보드·320px/CSS20px 확대·768/1024이미지 경계·이메일 수명을 확인했다. G09는 입력/비동기 저장/모달이 없어 새 IME/실패/재시도 상태가 불필요하다. 공통 G01~G08 입력·Dialog·경합은 전체 회귀로 검증했다.
- 최종 네트워크 결과는 아래 최종 확인 기록을 따른다. 차단이나 navigation mock 없이 실제 요청을 관찰했다. 자료 조회는 개발 조사이며 앱 런타임 외부 연결과 구분한다.

## 잔여 차이·후속 메모

완전한 원본 일치는 아니다. 폰트 렌더링·일부 줄바꿈/수px~한 줄 간격·사진의 색과 크롭 차이, 접근성용 더 진한 녹색/링크 밑줄·과거 자료/미수록 안내 추가가 남는다. 원본 미수록 모바일·외부 서비스 실제 동작·가입 약관 버전·정책 전체 노출·지원 언어·OS IME/VoiceOver/실기기·추가 브라우저 검증은 대기다. CSS 확대/Chromium viewport는 실제 OS 접근성 검증이 아니다.

서버 후속: 제휴 귀속/승인/환불/정산/세금, 채용 지원과 국가별 조건, 정책 효력/버전 동의/정보 보관·열람·삭제 검증. 지금은 설계/실행하지 않았다. G02~G08 및 R01 전체의 잔여를 자동 완료하지 않았다.

미리보기 `http://127.0.0.1:5173/`: footer→Affiliate Program→Apply now/Contact us→Back to source; Careers→View open positions→복귀→footer LinkedIn→복귀; Privacy→쿠키 안내→복귀→Terms. 모바일/태블릿에서 CTA와 본문을 확인한다. G09 결과 기록 후 승인된 R02 G10~G13 소비 분석과 G10으로 이어간다.

최종 확인: 전체 회귀와 마지막 대상 실행 모두 실제 API/외부 요청·요청 실패·console 오류0. 최종17캡처의17136개 요청은 로컬 정적 파일/HMR이며 위반/오류0. 태블릿 가지 겹침 수정 후 이미지를 다시 직접 확인했다. `git diff --check`도 수행했다.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

정책 발췌 구현과 전체·개정/가입 적용 버전 미확보를 분리하고 잘못된 확보 체크를 정정했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.



<a id="g09-r4-recheck"></a>
## G09 기존 구현 재검토 — 2026-11-24 KST

**부분 완료: 필요한 동작/발췌 보완 및 현재 단위·DOM 검증 수행, 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록은 대기.** 아래 과거 2026-11-21 결과와 이번 검증을 합산하지 않는다. 작은 폰트·픽셀 차이를 현재 완료 기준으로 허용하지 않는다.

### 1. 실제 범위·선행·자료의 현재성

- 시작 Git: main, clean, HEAD fc620659811169eba296686ec1f82c2fd40eb392(G08). 기존 사용자 변경 없음. G01의 전면 교체는 재실행하지 않았다.
- 주대상: /affiliates, /careers, /legal/privacy, /legal/terms와 등록된 /outbound 7개. 직접 연결: G01 메모리/Reset, G02 헤더/푸터/PublicLink, G10 가입 취소·정책, G11 로그인 진입/복귀, G14 공통 라우트/404/이력. 블로그·템플릿·문의는 공통 푸터 소비만 회귀했다.
- G01/G02/R01의 기존 구현·메모리 수명을 현재 코드와 대조했다. G08의 시각/브라우저/네트워크 대기를 보존했다. 현재 G82(Perks)는 과거 G09 번호 G82와 다르며 미착수다. G10 전체/G32 신규 기능·다음 묶음은 시작하지 않았다.
- 기존 G09_RESULT 링크 8개를 파일 존재 검사했다: evidence/g09의 mcp-sources.json, archive-fetch.json, source-scope.json, asset-manifest.json, browser-captures.json, visual-metrics.json, comparisons/와 evidence/g15/final-verification.json 모두 현재 없음. 해당 경로를 복원·재생성하지 않았다.
- R01 §15 및 본 문서의 “2024-01-18 보관 HTML 확보”는 과거 수행 기록이다. 이번에는 전체 HTML을 열람하거나 Wayback/현행 정책 사이트를 조회하지 않았다. 보관본 날짜(과거 실제 반환1/18·요청2/3), Terms 표시 갱신일2020-06-30, 카탈로그 Latest/2146, 촬영일·효력일·가입 적용 버전은 별개다.
- 현재 bonsai-company는39파일(과거35자산+기존 파생PNG4)이 있다. JSON의30고유자산 참조도 모두 존재한다. 이번에 자산을 생성/수정하지 않았다. 기존 사진14중 원본01에 보이는9개와 보관본 보완5개, 단체사진2개를 분리했다. 원본 밖5개를 PNG 검증 완료라고 쓰지 않는다.

### 2. 원본 확인 목록·버전

App Bonsai Web c1026782-09a7-45fb-b2d0-7cc1909bf1f4. Gummble MCP에서 아래4흐름/11Screen ID·순서·URL·1440×900 메타데이터를 새로 조회했다. MCP 응답에 카탈로그 버전은 없어 저장된 Latest/2146을 현재 버전으로 재확정하지 않았다. 실제 열람은 아래 로컬 원본PNG다. 4개 ANALYSIS의 단계·규칙·미확인과 R4를 대조했다.

| 확인 | Flow · ID · 단계 | Screen ID | 원본·관찰 |
| --- | --- | --- | --- |
| [x] | F004 · fcb41661-2520-40ac-842c-b463a7891093 · 01 | sc_277957a51da546839a56826df24b84f9 | [ANALYSIS](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Affiliate Program/screens/01_sc_277957a51da546839a56826df24b84f9.png>): hero/고객군·세로 인물·등고선·잎·Apply now |
| [x] | F004 · fcb41661-2520-40ac-842c-b463a7891093 · 02 | sc_29f3c01990d545efb7c6b3f03fdb3022 | [ANALYSIS](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Affiliate Program/screens/02_sc_29f3c01990d545efb7c6b3f03fdb3022.png>): 3단계·200%/30% 설명·정적 정보/토글/성공 알림 삽화 |
| [x] | F004 · fcb41661-2520-40ac-842c-b463a7891093 · 03 | sc_55853ebfc2fa4f928d98bfb0653248a3 | [ANALYSIS](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Affiliate Program/screens/03_sc_55853ebfc2fa4f928d98bfb0653248a3.png>): 6혜택·카드별 아이콘·고정 보상표 |
| [x] | F004 · fcb41661-2520-40ac-842c-b463a7891093 · 04 | sc_6a6de983773e41c1a0256eede9bab7d3 | [ANALYSIS](<../../../bonsai_analysis/flows/Affiliate Program/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Affiliate Program/screens/04_sc_6a6de983773e41c1a0256eede9bab7d3.png>): 둥근 짙은 CTA·병렬 Get started/Contact us·하단 |
| [x] | F018 · 35234808-9af8-4240-9025-e24a5951eaa9 · 01 | sc_940e5dee011842659690d4e44065c887 | [ANALYSIS](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Careers/screens/01_sc_940e5dee011842659690d4e44065c887.png>): hero 2×2+가로5사진·비대칭 모서리·공고 CTA |
| [x] | F018 · 35234808-9af8-4240-9025-e24a5951eaa9 · 02 | sc_81bf76ea44ca456a8a007cb664731e63 | [ANALYSIS](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Careers/screens/02_sc_81bf76ea44ca456a8a007cb664731e63.png>): 혜택6개·3×2카드·서로 다른 아이콘 |
| [x] | F018 · 35234808-9af8-4240-9025-e24a5951eaa9 · 03 | sc_185aaa7cf41444079dac8bd5a7e2abec | [ANALYSIS](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Careers/screens/03_sc_185aaa7cf41444079dac8bd5a7e2abec.png>): 큰 실내 단체 사진·아래 Our values |
| [x] | F018 · 35234808-9af8-4240-9025-e24a5951eaa9 · 04 | sc_fe38c840e2314d3abc53eec53932096c | [ANALYSIS](<../../../bonsai_analysis/flows/Careers/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Careers/screens/04_sc_fe38c840e2314d3abc53eec53932096c.png>): Focus/Speed/Ownership·야외 단체 사진 |
| [x] | F090 · 776f20e2-7498-433f-af8b-f585988e2429 · 01 | sc_6a35837e86c94e809eab079f134064bb | [ANALYSIS](<../../../bonsai_analysis/flows/Privacy/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Privacy/screens/01_sc_6a35837e86c94e809eab079f134064bb.png>): 좁은 본문 열·Data Collected·하단 잘린 Google 문단 |
| [x] | F090 · 776f20e2-7498-433f-af8b-f585988e2429 · 02 | sc_5430fa1bd57a4c1a860e4c1481ccf3ac | [ANALYSIS](<../../../bonsai_analysis/flows/Privacy/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Privacy/screens/02_sc_5430fa1bd57a4c1a860e4c1481ccf3ac.png>): Cookie Policy·User Access Request 5항목·변경/연락 문단 |
| [x] | F132 · 912b4b75-77bb-43fa-b86f-d85c6117841a · 01 | sc_8e3f3ec3993e4051a54ef9fd80ff3e50 | [ANALYSIS](<../../../bonsai_analysis/flows/Terms & Conditions/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Terms & Conditions/screens/01_sc_8e3f3ec3993e4051a54ef9fd80ff3e50.png>): 중앙 제목·June 30, 2020·Services/Accounts 상단 |

연결 범위의 ANALYSIS 해당 단계와 다음5PNG도 직접 확인했다. F082 Landing page(f1a89cc0-4dc8-4576-b912-78231a2a7b1a)09~11=회사/정책·소셜 푸터, F083 Logging in(a02409b3-6eb0-4bc0-b702-22a42e0990c8)02=로그인 진입, F086 Onboarding(f714101f-db6b-4bfe-9ed1-74d6b0d6243c)03=가입/약관 링크다. 단계 소유는 원래 G에 유지하며 이번 MCP 재조회 범위는 위 주대상4흐름뿐이다.

- [x] [Landing page/screens/09_sc_33704472c1d54fda8c9605958d1af9d9.png](<../../../bonsai_analysis/flows/Landing page/screens/09_sc_33704472c1d54fda8c9605958d1af9d9.png>)
- [x] [Landing page/screens/10_sc_a1fa28afd409416f88fe3625082ddfac.png](<../../../bonsai_analysis/flows/Landing page/screens/10_sc_a1fa28afd409416f88fe3625082ddfac.png>)
- [x] [Landing page/screens/11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png](<../../../bonsai_analysis/flows/Landing page/screens/11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png>)
- [x] [Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>)
- [x] [Onboarding/screens/03_sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838.png](<../../../bonsai_analysis/flows/Onboarding/screens/03_sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838.png>)

총7 ANALYSIS의 LF 정규화 SHA-256과16 PNG의 바이트 SHA-256/크기는 SOURCE_ANALYSIS_INDEX와 일치했다. 원본은 모두2880×1800. MCP1440×900과 다르며 이미지 배율로 CSS px/DPR을 단정하지 않는다. 이번 뷰어는 원본 열람용이고 구현 비교 축척·viewport/DPR/배율·scrollY는 측정하지 못했다.

### 3. 원본→분석→계획→코드 / R4 12항목

각 단계는 ANALYSIS §4/5와 미확인 §8, G09 §3/5 및 SOURCE-ANALYSIS-IMPACT의 아래 항목으로 연결한다. “비교 완료”는 주요 구성 대조의 상태 값이며 요소 전수 분석/픽셀 동일성 완료가 아니다.

| 항목 | 이번 판정 | 근거·구현 대응 |
| --- | --- | --- |
| R4-F004-O01 | 비교 완료·구현 보완 | 헤더/고객군·세로 인물·등고선·잎·정적 정보/토글/성공 삽화 유지. Apply now의 전체 출발 URL/이력 보완; 실제 신청 없음, 정확 자산/시각 대기 |
| R4-F004-O02 | 비교 완료·구현 보완 | 혜택6개의 다른 아이콘·둥근 짙은 CTA·Get started/Contact us 병렬 유지. 두 목적지별 복귀 보완; 색/radius/위치 동일성 대기 |
| R4-F004-A01 | 분석 대기 | 설명 그림과 실제 입력을 구분하고 기존 자산39파일/참조를 확인. 정확 crop·원본 자산·헤더 스크롤/촬영 조건 및 신청 화면 미확인 |
| R4-F018-O01 | 비교 완료·구현 보완 | 2×2/가로 띠·비대칭 사진·혜택6/가치3 구조 유지, View open positions의 전체 출발 복귀 보완. 사진별 crop/radius/줄바꿈 동일성 대기 |
| R4-F018-O02 | 비교 완료·유지 | 실내/야외 단체 사진 서로 다른 자산과 주 헤더만 남는 스크롤 규칙 유지; 실제 스크롤/사진 crop 비교 대기 |
| R4-F018-A01 | 분석 대기 | PNG의 사진9개와 기존 보관본 보완5개 구분, 카드 제목/문구·기존 CSS를 대조. 정밀 crop/간격/원문 행 수·외부 공고/지원폼 미확인 |
| R4-F090-O01 | 비교 완료·구현 보완 | 중앙 제목·좁은 본문·입력 없는 발췌 유지. 첫 캡처 하단 Google까지 판독되는 누락 문단 보완 및 잘린 경계 표시; 본문 전체 아님 |
| R4-F090-O02 | 비교 완료·유지 | 하단 소제목·하이픈 목록5개(마지막 포함)·Cookie Policy 링크1개 확인. 문의/쿠키 안내 복귀 DOM 검증; 정확 줄바꿈/스크롤 대기 |
| R4-F090-A01 | 분석 대기 | 판독 가능한 문단 누락만 보완. 캡처 사이 본문·현재 존재하는 전체 보관 HTML·가입 적용 버전·원본 새 탭 동작은 미확인 |
| R4-F132-O01 | 비교 완료·유지 | 공개 주/보조 내비게이션·중앙 제목·좁은 본문 유지. 내부 앱 셸과 분리, G10 정책 링크 연결만 확인; 정밀 배치 대기 |
| R4-F132-O02 | 비교 완료·유지 | June 30, 2020 갱신일·Services/Accounts 소제목과 발췌 한계 유지. 효력일/촬영일/가입 버전으로 단정하지 않음 |
| R4-F132-A01 | 분석 대기 | 미수록 하단·전체 정책/개정/가입 버전·정확 글꼴/본문 폭·줄바꿈/간격은 대기; Privacy↔Terms는 로컬 목 연결 |

코드(FE/user-web/src): pages/company는 화면 선택, features/public-company/components의 affiliate-content·careers-content·company-cards는 소개/정적 그림/사진/카드, legal-content는 발췌/누락·버전 안내, company-outbound는 고정 목적지 표시/복귀다. data/company-content.json은 표시 문구/자산, company-destinations.ts는7목적지, model/company-history.ts는 관찰한 이력의 수명/교체 검증을 맡는다. 공통 PublicLink/PublicHeader와 PublicLayout/RouteFrame은 출발 정보 인계·관찰만 담당한다.

목적지 카탈로그를 분석·R01의 과거 보관본 기록과 대조했고 실서비스를 열지 않았다.

| ID | 근거 주소(현재 유효성 재검증 아님) | 출발 이력 없는 기본 복귀 |
| --- | --- | --- |
| affiliate-application | https://hellobonsai.firstpromoter.com/ | /affiliates |
| affiliate-contact | mailto:affiliates@hellobonsai.com | /affiliates |
| careers | https://bonsai.crew.work/jobs | /careers |
| cookie-policy | https://www.iubenda.com/privacy-policy/35324406/cookie-policy | /legal/privacy |
| privacy-contact | mailto:team@hellobonsai.com | /legal/privacy |
| linkedin | https://www.linkedin.com/company/bonsai/ | / |
| twitter | https://twitter.com/bonsaiinc | / |

실제 주소는 안내 문자열이며 외부 앵커/메일 앱 실행을 추가하지 않았다. Cookie Policy의 과거 새 탭 의도와 현재 같은 탭 로컬 안내는 다른 정책이다. 원본에 없는 취소·복귀는 목 가정이며 미수록 신청/공고/지원폼·승인/보상·동의 기록을 창작하지 않았다.

### 4. 발견한 결함·원인·수정

| 문제·원인 | 수정 위치 | 현재 확인 |
| --- | --- | --- |
| 회사 CTA와 공통 소셜 링크가 출발 hash를 누락 | company-outbound.tsx, public-link.tsx | pathname/query/hash·key/index/scope의 PublicOrigin 전달;7목적지와5공개 소비 회귀 |
| 중간에 다른 페이지를 방문하면 navigate(-1)이 다른 화면으로 복귀 | company-history.ts, route-frame.tsx, company-outbound.tsx | 현재 관찰된 원래 entry까지 이력 delta 이동. 실제 Router와 history 사용 |
| 교체/분기/Reset/새 공급자의 오래된 출발 state 재사용 | company-history.ts | 현재 scope·key·주소·index 일치 검증, PUSH 뒤 잘린 앞으로 이력 폐기, REPLACE 갱신. 유효하지 않으면 고정 기본 경로 |
| 회사 페이지에서 가입 취소 시 query/hash 손실, 소셜 안내의 중첩 출발 정보 소실 | public-layout.tsx, public-header.tsx, public-context.ts, public-origin.ts | 회사 경로의 전체 returnTo와 company origin 유형 인계. 가입→Terms→뒤로→취소→외부 안내→원래 블로그 복귀 |
| Privacy 첫 캡처 하단 문단 일부 누락 | company-content.json, legal-content.tsx | “In addition to the data…”부터 “In particular, Bonsai offers a Google”까지 판독분 보완. 뒤 문장은 창작하지 않고 잘린 경계 표시 |

새 company-entry.test.tsx는 정식 회귀9개다. 수정 전8개 중6실패/2통과로 문단 누락·hash 누락·중간방문 복귀·새 공급자 수명·가입취소 결함을 재현했다. 보완 후8/8(17.80s), 가상 세션/연속 복귀/Reset 회귀를 더해9/9(16.70s), 최종 전체32파일188/188(139.24s) 통과했다.

유지: 정적 삽화/혜택·보상 문구, 서로 다른 단체사진, Privacy5목록(마지막 항목 포함)/단일 쿠키 링크, Terms 날짜·발췌 경계, 로그인 저장소·공통 Dialog·기존 ScrollRestoration. 목록 마지막 항목은 현재 데이터에서 누락되지 않아 변경하지 않았다. 무관한 구조/주석·CSS/자산은 바꾸지 않았다.

### 5. 시각 대조와 남은 차이

원본11단계와 스타일/자산 역할을 대조했다. 아래 수치는 **현재 구현 CSS**이며 원본 확정 수치가 아니다.

| 요소 | 구현·관찰 대응 | 잔여 |
| --- | --- | --- |
| 제휴 hero | 세로 인물428×642, 오른쪽 배경36%/810높이·하단120radius, 잎576/left-208/top383 | PNG 내 원본 자산/정밀 위치·crop·그림 비율과 실제 viewport 비교 |
| 설명·카드·CTA | 447px 우측열·80gap·그림625,3열16gap·40padding·22radius, CTA60radius·36/40제목·버튼160/30gap | 원본의 실제 CSS px/줄바꿈/겹침·그림 크기 미확인 |
| 채용 | 사진5열·16gap·240높이·비대칭0/40/0/40, 단체500높이·실내50%30%/야외50%80% | 사진별 원본 crop/radius·현재14장 중5장의 캡처 밖 배치·태블릿 가림 |
| 정책 | 최대770px열·좌우24,16/19.2 본문·제목 여백96,16px 소제목 | 정확 글꼴/행간/행 수/간격·누락 안내 추가에 따른 높이 차이 |
| 색·글꼴·공통 헤더 | 기존 Gellix, #163c30/#003026, 접근성 녹색 #397d24·밑줄·역사적 안내 유지 | 원본 대비 보정 이력과 다른 상태색/폰트 raster·sticky/고객군 숨김 재검증 |

1100px에서 잎 숨김/설명 그림 폭 조정,700px에서 카드1열/사진2열 등의 기존 규칙을 확인했다. 이는 코드 검토이며 현재320/768/1024px 브라우저 가림·확대·스크롤 통과 증거가 아니다. 접근성 보정 색/밑줄·역사적/누락 안내는 알려진 차이로 보존했다. 접근성을 낮추거나 시각 동일성 완료로 처리하지 않았다.

### 6. 실제 검증·명령·산출물 제한

Node24.18.0/pnpm8.14.1 확인(프로젝트 Node>=24<25, pnpm8.14.1). FE/user-web에서 다음을 실행했다.

- [x] 앱 타입: node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false.
- [x] Node 설정 타입: 같은 명령 -p tsconfig.node.json. 두 검사 통과.
- [x] node node_modules/eslint/bin/eslint.js . --no-cache 통과.
- [x] Vitest API 전체32파일188/188·G09 대상9/9. 실제 createBrowserRouter·history POP/back/forward를 사용했고 navigation을 mock하지 않았다.
- [x] DOM 범위: 소개/발췌·7목적지·전체 URL/원래 key/state·직접/미등록ID·중간 방문/교체·반복/forward·연속복귀·초안·가상 세션·Reset/새 provider·가입 취소/약관/로그인 왕복·main 초점.
- [x] Vite7.3.5 메모리 build:1972모듈/3 output/12.72s, write:false. configFile:false, React/alias, PostCSS tailwindcss/autoprefixer, emptyOutDir:false/copyPublicDir:false/sourcemap:false. dist/보고서 생성 없음.
- [x] 원본7분석/16PNG 해시·크기와 MCP4흐름11순서 대조, 기존39자산/JSON30참조 존재 검사. Node stdin/stdout만 사용.
- [x] 5173 HTTP200·OneHand CRM UI preview·Vite/HMR·PID30272 확인,5174 별도 시험장 모니터링·PID22864도 보존했다. 서버/환경 설정 변경·Backend 실행 없음.
- [ ] 실제 브라우저 E2E·주소창/reload/새탭·키보드/실제 스크롤·읽던 위치·좁은 폭/확대·사진/그림/잎 가림·OS IME는 미검증. 현재 연결 가능한 브라우저 도구/세션과 CDP9222/9223이 없음을 다시 확인했다. 파일 생성 제한상 새 프로필/캐시를 만드는 브라우저를 실행하지 않았다.
- [ ] 실제 인증/업무/외부 요청0 및 console오류0은 미판정(null). 로컬 HTTP 문서 조회와 DOM 검증은 브라우저 네트워크 관찰이 아니다. 요청 차단으로 무호출을 판정하지 않았다.
- [ ] 구현 캡처/픽셀 비교는 미수행. 비교 경로 N/A(사용자 파일 생성 금지). 원본 열람·스타일 수치만으로 동일성 판정 불가.
- [x] 테스트의 Reset/정상 상태 복원·provider 정리. 실행 중 미리보기의 가상 상태는 변경하지 않았다.

실행 방식: PowerShell here-string→node stdin. Vitest startVitest('test', FILTERS, 옵션, Vite설정), 대상 FILTERS=['src/app/router/company-entry.test.tsx'], 전체[]. 옵션은 config:false/run:true/cache:false/pool:threads/execArgv:[]/maxWorkers:2/environment:jsdom/setupFiles:vitest.setup.ts/include:src/**/*.test.{ts,tsx}/coverage:false/experimental.fsModuleCache:false/deps.optimizer.client·ssr.enabled:false. Vite configFile:false/react/alias/optimizeDeps.noDiscovery:true·include:[]/server.watch:null. NODE_DISABLE_COMPILE_CACHE=1/JITI_CACHE=false/JITI_FS_CACHE=false. 환경 변수는 검증 프로세스에만 적용했다.

jsdom의 matchMedia/scrollTo/IntersectionObserver 등 레이아웃 미지원 부분을 대체했다. 전체 기존 테스트의 합성 composition/IME229 검증은 실제 OS IME가 아니다. G09 정적 페이지 자체의 저장/로딩/실패/모달은 N/A이며 불필요한 상태를 추가하지 않았다. 연결 가입·공개입력의 실패/취소·경합은 기존 전체 회귀가 통과했으나 G10 전체 원본 재검토를 대신하지 않는다.

스크린샷/비교 이미지/동영상/trace/HTML보고서/검증JSON/manifest/원시응답/로그/임시스크립트/다운로드/브라우저 프로필을 새로 만들지 않았다. 기존 결과 문서에 기록하고 FE소스·정식 테스트만 추가했다. Browserslist 데이터가 오래됐다는 경고는 남았고 의존성을 임의 갱신하지 않았다.

### 7. FRONT_AGENT·공통 체크리스트 적용

[FRONT_AGENT](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md) 지도에 따라 DECISIONS006 우선/005, ARCHITECTURE의 FRONTEND_USER_WEB·STATE_AND_DATA·MOCK_FIRST_DEVELOPMENT·TESTING, CONVENTION의 COMPONENT_DESIGN·WEB_ACCESSIBILITY_AND_LAYOUT·COMMENT_AND_LOGGING·FRONTEND_USER_WEB를 적용했다. AGENT/README·PM036·UX025, SOURCE_ANALYSIS_STANDARD/REVIEW와 이번 계획/관련 G/R을 확인했다.

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md) 항목별 적용(§순서):

| 규칙 묶음 | 코드·판정 |
| --- | --- |
| §1 범위/출처4 | [x] 요청·clean Git·원본/과거 자료/목 가정 분리·시작/취소/복귀·mock/실제 구분. 전체 서비스 완료 아님 |
| §2 구조5 | [x] page→feature 공개 export·props와 단일 출발 모델·실제 공유 소비·앱 import 경계. N/A 새 의존성(없음). 이력 검증을 독립 model로 분리 |
| §3 데이터7 | [x] 고정7ID·메모리 scope·새 provider/Reset 폐기·API fallback 없음·FE타입 구분. [ ] 런타임 네트워크 실측. N/A 업무 CRUD/기존 live/서버 계약 |
| §4 상태6 | [x] URL과 원래 history key/index·관찰 이력 소유 분리, scope 격리·교체/분기/반복/취소 검증. N/A G09 비동기 저장·query invalidation·금액/날짜 계산; 기존 보상 숫자를 계산 정책으로 바꾸지 않음 |
| §5 웹 UX7 | [x] DOM 직접경로·back/forward·안전한404·main초점·시맨틱 제목/목록·button type. [ ] 실제 키보드/scroll/reload/새탭·폭/확대/터치/IME/reduced motion. N/A G09 신규모달/폼·가짜 로딩/저장 |
| §6 주석/품질5 | [x] 신규/동작변경 함수·hook·컴포넌트 한 줄 한글 책임 주석, strict/lint, effect 의존성·공개 주소 검증·비밀값 추가 없음. N/A 새 권한/복잡한 계산. 실제 렌더 성능 미측정 |
| §7 검증/인계6 | [x] 타입/lint/전체 단위DOM/메모리build·직접 인증 연결 회귀·실행기록/mock 구분·문서 정합성 검토. [ ] E2E/브라우저. N/A Admin/실서비스 영속성 |

START-CHECKLIST 적용: [x] 시작 Git/실코드/선행·규칙·원본 확인, [x] 범위/목 가정·허용 산출물·수정/회귀, [x] 결과/문서/잔여 담당 인계. [ ] 브라우저/시각 동일성은 사유·담당을 남긴 미수행이다. 공통 빈 양식을 프로젝트 전체 완료로 체크하지 않는다.

| 공통12기준 | 이번 범위 판정(전역 완료 아님) |
| --- | --- |
| R4-C01 | 담당11PNG·연결5PNG/ANALYSIS7개 해시·크기 일치, MCP4흐름11ID/순서 확인. 촬영 조건·제품 빌드·카탈로그2146 현재성 미확인 |
| R4-C02 | 공개 헤더/고객군·제휴 hero/설명/카드/CTA·채용 사진/카드·정책 발췌 구성 대조. 실제 겹침/정밀 배치 대기 |
| R4-C03 | 11단계 주요 요소군과 코드 대응을 기록. 전체 요소 전수 계수·재현 명세 인증은 미완 |
| R4-C04 | 200%/30%와 고정 보상표 분리·혜택6/가치3·정책5항목/날짜 확인, Privacy 잘린 문단 보완. 전체 정책/정확 줄바꿈 대기 |
| R4-C05 | PNG2880×1800과 MCP1440×900 구분. 실제 구현 viewport/DPR/배율/스크롤을 맞춘 픽셀 비교 미실행 |
| R4-C06 | 기존 공개 Gellix/스타일 유지, 정책16/19.2·제목/카드 수치는 구현 CSS값. 원본 폰트파일/렌더링/정확 수치 확정 대기 |
| R4-C07 | 접근성 녹색 #397d24·링크 밑줄/역사적 안내와 원본 차이 유지. 색/테두리/radius/shadow 동일성 미검증 |
| R4-C08 | 기존 bonsai-company39파일·JSON30고유자산 참조 존재 확인. 사진14중 PNG9/보관본 보완5, 단체2·정적 삽화 역할 구분. 정확 crop/출처 정밀 검증 대기 |
| R4-C09 | 직접/잘못된 목적지·반복/중간방문/교체·가상 세션/Reset/새 공급자 DOM 검증. 정적 페이지의 가짜 로딩/저장/오류는 N/A |
| R4-C10 | 실제 Router/history DOM에서 7목적지·query/hash/key/state·back/forward·가입 취소·정책 왕복 검증. 실제 브라우저 스크롤/새 탭/reload 대기 |
| R4-C11 | 공개 이메일 초안/세션을 단순 왕복에서 보존, Reset/공급자 재생성은 출발 수명 폐기. 신청/채용/정책 저장·동의/보상 계산은 N/A |
| R4-C12 | G01/G02/G10/G11/G14 직접 연결과 랜딩/블로그/템플릿/도움말 푸터 소비 DOM 검증. 연결 Goal 전체·현재 G82 업무는 포함하지 않음 |

### 8. 목 가정·미완료·후속 담당

| 판정/담당 | 남은 범위 |
| --- | --- |
| [ ] G09/R01·G01/G02 | 정확 폰트/굵기/글자크기/행간/자간·줄바꿈/색/간격/radius/shadow·사진 crop/장식/아이콘·촬영 viewport/DPR·실제 픽셀 동일성 |
| [ ] G09/R01 | 미수록 신청/승인·외부 공고/지원폼·보상 방식 관계·원본 링크 실행/새탭·원본 모바일/미노출 상태. 현재 보관 HTML 부재·추가5사진의 캡처 밖 배치 |
| [ ] G09/G10·R01/R02 | Privacy 전체/Terms 하단·개정/효력일 관계·가입 당시 링크 버전. 발췌 확인으로 전체 정책 확정 불가 |
| [ ] G09·직접 연결 G·G84 | 실제 브라우저 scroll/읽던 위치/초점·새로고침/새탭·좁은 화면/확대·실기기/OS IME·console/network |
| N/A 이번 | 실제 신청/채용/메일/쿠키 설정·정책 동의·개인정보 요청·보상 지급, Backend/API/DB, 현재G82 및 G10전체/G32 이후 |
| 서버 후속 메모 | 귀속/승인/환불/정산/통화/세금, 채용 국가별 조건·지원 계정, 정책 버전/동의·보관/열람/삭제. 이번에는 설계/실행하지 않음 |

복귀는 원본 미관찰 목 정책: 같은 scope에서 확인한 출발 entry가 아직 있으면 실제 history로 복귀한다. 중간 방문은 건너뛰고 원래 query/hash/key/state를 되살린다. 원래 entry가 교체되거나 Reset/새 provider/직접 진입이면 카탈로그의 안전한 기본 경로로 replace한다. 공개 이메일과 가상 세션은 단순 왕복에서 유지하고, 원래 Reset/가입 취소의 초안 정리 정책은 유지한다. ScrollRestoration을 재사용했지만 읽던 화면 좌표는 실제 브라우저 확인이 남았다.

### 9. 미리보기 직접 확인 순서·문서 상태

미리보기 http://127.0.0.1:5173/affiliates (기존 dev/HMR 서버).

1. /affiliates?entry=g09#reading → hero/설명 Apply now → Back to source → 앞으로 → 다시 복귀. 하단 Get started/Contact us도 각각 확인한다.
2. /careers?entry=g09#values → View open positions → 복귀. 같은 주소에서 Start free → Cancel로 query/hash 유지 확인. 로컬 안내 상태에서 새로고침하면 Back to source는 기본 /careers로 간다.
3. /legal/privacy → Cookie Policy → 복귀 → 개인정보 문의 안내 → 복귀 → Terms → 브라우저 뒤로. 발췌 한계·마지막 요청 항목·표시 갱신일을 확인한다.
4. /blog?q=company#results → 푸터 LinkedIn → Start free → Terms → 브라우저 뒤로 → Cancel → Back to source. 원래 블로그의 전체 URL 복귀 확인.
5. 랜딩 이메일을 입력하고 푸터 소셜 왕복 시 초안 유지 확인. /components에서 가상 Alex를 선택해 같은 왕복 시 세션 유지, Reset 뒤 오래된 출발 정보를 재사용하지 않는지 확인하고 정상 상태로 복원한다.
6. 직접 /outbound/cookie-policy와 잘못된 /outbound/not-a-destination을 확인한다. 개발자도구 network/console,320/768/1024px·확대·키보드·스크롤/사진·설명/잎 겹침을 별도 확인한다.

위 순서는 아직 남은 실제 브라우저 확인 절차이며 이번 E2E 통과 기록이 아니다.

- [x] G09 명세/기존 결과·R01/R02 소비·G01/G02/G10/G11/G14 직접 연결·공통 푸터 소비·R4 12항목/공통12·순서/현재 상태/PLAN-INDEX를 이번 범위로 갱신했다.
- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 근거를 완료로 처리하지 않는다. 과거 [x]/verification·배정·다른 G/R 상태는 보존한다.
- 문서 링크/체크/JSON과 기존 오류 대비 신규 오류 검사는 아래 최종 검토에 기록한다. 커밋/push/배포·다음 Goal 착수 없음.

### 최종 문서·변경 검토

- [x] 계획 루트170 Markdown·1 JSON 링크/anchor·체크·배정·상태 대조. 기존 링크 오류221건 유지, 이번 신규 오류0건. 없는 과거 evidence 링크는 이력으로 보존하고 현재 결과에 부재를 명시했다.
- [x] 관련 기존 문서46개 갱신. G09 R4 12항목 상태가 명세/대응표/JSON과 일치하며 다른443개 항목·전체85G/22R·107실행순서·134흐름/754단계/642화면·과거 verification/[x] 이력을 보존했다. 공통12기준은 G09 범위별 판정만 추가했다.
- [x] 변경 코드 재검토·git diff --check 통과. 신규 파일은 정식 회귀 company-entry.test.tsx와 실행 model company-history.ts 두 개뿐이다. bonsai_analysis/원본·기존 증거·환경·서버·BE/DB·의존성은 변경하지 않았다.
- [x] 현재 단위/DOM188/188·타입/lint·메모리build 통과를 기록했다. 마지막 검증 후 문서만 수정했으므로 관련 없는 앱 검증을 반복하지 않았다.
- [ ] 실제 브라우저/네트워크·픽셀 동일성·정책 전체/버전은 여전히 대기다. 전체 완료 또는 실제 서비스 성공으로 승격하지 않는다. 커밋/push/배포와 다음 Goal 착수 없음.

<a id="g09-precommit-review"></a>
### 커밋 전 재검토 — 2026-11-24 KST

- [x] 사용자 후속 요청에 따라 G09 변경 코드·복귀 이력·Reset·가입 취소 연결과 문서를 재검토했다. 추가 코드 수정이 필요한 결함은 발견하지 못했으며, 앞선 최종 검증 이후 실행 코드는 변경하지 않았다.
- [x] 이번 재검토에서 G09 정식 단위/DOM 테스트를 다시 실행해 9/9 통과(19.40초)했다. 실제 Router/history를 사용하는 jsdom 검증이며 실제 브라우저 검증과 구분한다.
- [x] 계획 문서170 Markdown·1 JSON을 다시 대조했다. 기존 링크 오류221건·현재221건·신규0건이며, 관련 기존 문서46개와 다른 R4 443항목·과거 완료/검증 이력의 보존을 확인했다.
- [x] 전체32파일188/188·타입/lint·메모리build는 앞선 작업의 최종 검증 결과다. 이번 재검토에서 전체 검증을 다시 실행했다고 표현하지 않는다. 기존 결과와 이번 대상 재실행 결과를 구분한다.
- [x] 로컬 커밋 요청의 범위와 변경 파일을 확인했다. 커밋 전 문서 기록을 마쳤으며, 실제 커밋 식별자는 Git 이력과 최종 응답에 남긴다. 앞선 절의 커밋 미수행 기록은 당시 이력으로 보존한다.
- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·정책 전체/버전과 미수록 근거는 계속 대기다. 이번 커밋 검토를 G09 전체 수용 기준 충족으로 처리하지 않는다. push·배포·다음 Goal 착수는 범위 밖이다.
