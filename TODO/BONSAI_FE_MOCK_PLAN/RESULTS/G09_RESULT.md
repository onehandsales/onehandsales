# G09 제휴·채용·정책 안내 실행 결과

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
