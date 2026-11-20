# G04 실행 결과 — 가격·후기와 로컬 선택 인계

작성: 2026-11-21 KST. **가격 두 주기·후기 30카드·영상 미제공 상태·로컬 인계 구현. 2차 검토·개발/빌드 Chromium 검증 수행.** 영상 재생·원본 동일성·추가 환경 대기는 별도이며 실제 서비스·구독·결제 완료가 아니다.

## 1. 착수·선행 결과·보존

- HEAD `da60df0283842dc1cb11b43d8036f2e237207626`와 기존 G03 미커밋 변경을 확인했다. 시작 시 234개 변경/미추적 파일의 [SHA-256 기준](evidence/g04/baseline-sha256.json)을 남겼다. G03의 소개 코드·자산·기존 증거를 보존하고 필요한 공통 인계·라우팅만 확장했다. 커밋·push·배포 없음.
- 기존 `http://127.0.0.1:5173/` Vite PID36112를 유지했다. Backend는 실행하지 않았다. 테스트가 전용 dev5175/build4175를 사용한다.
- 적용 범위와 상위 경로에 추가 AGENTS.md가 없고 BE/AGENTS.md는 범위 밖이다. AGENT README·PM036·UX025·FRONT_AGENT README와 구조/컴포넌트/상태/목/접근성/한글 주석/테스트/엔지니어링 검토, 결정006을 적용했다. 안내의 AGENT_USAGE_RULES.md는 체크아웃에 없다는 기존 결과와 현재 목록을 확인했다. 과거 TODO 제외·실제 인증/API 연결·Windows 명령보다 이번 사용자 지시,006과 macOS package 설정을 우선했다.
- 계획 README·순서·시작·재현·목 상태·USER-FLOW·FLOW-GOAL-MATRIX·PUBLIC-WEB·PLAN-INDEX·G04/R01 명세, G00/G01/R01/G02/G02_RECHECK/G03 결과·목적지 색인과 실제 코드를 대조했다. R01 보완을 먼저 문서와 진행 상황으로 알린 뒤 G04를 이어갔다. 과거9/22/22 결과를 이번 결과로 사용하지 않았다.

| 선행 상태 | 영향·이번 처리 |
| --- | --- |
| G01 목 runtime·Dialog, G02 공통 공개 메뉴·폰트·푸터 | 그대로 재사용. 실제 API 없는 경계를 유지하고 회귀 검사 |
| G03 경로별 이메일·이력별 snapshot | sourcePath·선택 정보·query 포함 returnTo만 추가. 기존 취소/초기화 정책 유지 |
| G02 잔여 시각·자동 전환·모바일 원본·추가 환경 | G04 제작을 막지 않음. 기존 대기 상태 유지 |
| G03 다른30소개·관련 글2페이지·잔여 시각/환경 | G04 범위로 확대하지 않음. Professional services는 관찰 라벨의 로컬 목 목적지만 추가하고 본문 미수록 유지 |

## 2. 원본·가격 버전·보완 근거

[R01 결과10절](R01_RESULT.md), [MCP 기록](evidence/g04/mcp-sources.json), [보관본 기록](evidence/g04/supplement-sources.json), [자산 5개](evidence/g04/asset-manifest.json)을 정본으로 삼는다.

- 앱 Bonsai WEB `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, slug `bonsai-web`, 카탈로그 Latest/2146를 신규 조회했다.
- Pricing `981ffcc3-d6c0-4038-8db3-4ac8753aace4` 01~03과 Reviews `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` 01~04의 ANALYSIS와 원본 PNG7장을 직접 확인했다. 개별 Screen ID/원본 URL은 MCP 기록에 있다.
- 촬영일·실제 제품 빌드·원본 DPR·스크롤 좌표는 미확인이다. MCP1440×900과 PNG2880×1800을 혼동하지 않는다. 카탈로그2146·보관 시각·현재 조회일은 서로 다른 값이다.
- 공식 pricing의 **2024-01-18 08:27:27** 보관본에서 월간25/39/79·연간 월 환산21/32/66·기능·CTA의 `int_source=pricing`, `int_content=monthly_{plan}/annual_{plan}`을 확인했다. 현재 서비스 요금을 섞지 않는다.
- 공식 reviews의 **2024-01-18 08:27:51** 보관본에서 후기30개·순서·누락 행·외부 링크, 포스터/play/평점 SVG를 보완했다. 카드별 관찰/보완 범위는 [콘텐츠 기록](evidence/g04/review-content.json). 30개 전부를 Gummble 캡처에서 관찰한 것은 아니다.
- 보관본의 CSS `hellobonsai.a39e1f9c1.min.css`는 G03에서 확보한 파일을 재사용했다. 이번 두 HTML도 해당 CSS를 연결한다. Gellix400/500/600/700과 공개 자산을 재사용하며 새 폰트·의존성을 추가하지 않았다.

| 플랜 ID | Monthly | Yearly 화면의 월 환산 | 계산상 12개월 소계 | 근거·한계 |
| --- | ---: | ---: | ---: | --- |
| starter | $25 | $21 | $252 | 월간은 보관본, 연간 월 환산은 원본+보관본 |
| professional | $39 | $32 | $384 | 동일 |
| business | $79 | $66 | $792 | 동일 |

가격 버전은 `bonsai-public-legacy-20240118-catalog2146`이다. 12배 소계는 **표시액으로 계산한 값**으로 가입/구독 인계에서만 명시한다. 원본의 실제 연 청구 총액이 아니며 반올림·세금·국가·좌석·추가 상품·할인을 적용하지 않는다. 원본에는 `$`가 표시되고 인계의 USD는 목 표기 가정이다. Team Seat·Bonsai Tax 각각$10/month, 과거 체험·환불 문구, 500,000+·G2/Capterra4.7은 현재 정책/지표로 확정하지 않는다.

영상은 원본 포스터와 보관본의 YouTube `XWvK85AyeOA` 링크만 확인했다. 로컬 영상 파일·자막은 확인 자료에 없다. YouTube 플레이어/내용/자막을 실행하지 않았으며 외부 embed·스트리밍·가짜 진행률·재생 성공 상태를 추가하지 않았다. 다른 보관 영상과 가격 FAQ 전체는 관찰된 G04 범위로 확대하지 않았다.

## 3. 화면·코드·후속 경계

| 경로·책임 | 구현·실제 동작 | 경계 |
| --- | --- | --- |
| `/pricing` / `pages/pricing` | 제목·고객군·Monthly/Yearly·3플랜·추천·포함 기능·상하단 플랜 CTA·Team Seat/Tax·기존 지원/체험/푸터 | 업무·결제·좌석 구매 기능 없음 |
| `/reviews` / `pages/reviews` | 제목·홍보·로컬 평점 자산·영상 포스터·미제공 Dialog·후기30카드·기존 하단 CTA | 현재 리뷰 조회/작성/필터 없음 |
| `features/public-commercial` | 가격 데이터/선택 계산, 플랜 UI, 추가 상품, 후기·모달, 로컬 목적지와 인계 요약 분리 | 정적 본문에 가짜 비동기/실패 상태 없음 |
| `/signup` | 기존 G10 경계에 플랜·주기·금액 의미·근거 버전 snapshot 표시 | G10 가입 화면 미구현 |
| `/preview/subscription` | 명시적으로 선택한 G01 가상 세션의 G79 인계 경계 | G79 구독/결제 폼 미구현. 앱 원본 URL로 확정하지 않음 |
| `/outbound/reviews/{id}` | G2/Capterra 및 원본 카드11개 외부 주소를 로컬 안내에서 표시, 취소/back | 주소 문자열만 표시. 실제 외부 이동/요청 없음 |
| `/taxes`, `/software/professional-services` | 기존 Tax 소개 경계·Professional services 본문 대기 | G03 본문을 추가하지 않음. 후자는 라벨만 관찰한 로컬 후보 |

신규 컴포넌트·hook/함수의 한글 책임 주석, page→feature 공개 export→공통 UI 의존을 확인했다. 기존 PublicHeader/Menu/Footer/SignupLink/Dialog를 재사용한다. G04의 스크롤 헤더 top0과 가격 색상은 `.public-commercial`에 한정하며 G02/G03 스타일을 덮지 않는다. [목적지 보완표](evidence/g04/destination-scope.json)는 기존 R01 색인을 보존한다.

## 4. 상태 수명과 가정

| 상태 | 수명·동작 |
| --- | --- |
| 가격 주기 | URL `billing=monthly/yearly`, 기본/잘못된 값은Yearly. 실제 history push·back/forward·reload 유지. 토글은 스크롤을 유지하며 동기 반영해 빠른 다음 선택/CTA가 이전 주기를 읽지 않게 함 |
| 플랜 선택 | 선택 순간 planId/name·billing·priceVersion·displayedMonthlyAmount·amountMeaning·derivedAnnualSubtotal을 immutable 메모리 snapshot으로 보관. 브라우저 이력은 opaque ID만 소유 |
| 인계 뒤로/앞으로 | 같은 탭에서는 과거 이력의 선택이 유지되고 새 플랜 CTA가 이를 덮지 않음 |
| 명시적 취소 | 해당 출발 pathname의 이메일/인계들을 폐기. query가 포함된 returnTo로 복귀하여 가격 주기는 유지. 다른 소개 이메일은 유지 |
| reload/new tab/scope revision/Reset | 세션·초안·인계 메모리 폐기. 공개 가격 query는 주소에 남음. 오래된 history ID와 새 실행 memory ID 충돌 방지 유지 |
| 가상 로그인 | G01 Alex/Blair 선택만 사용. 플랜 선택/스크롤은 workspace·역할·구독·권한을 바꾸지 않음 |
| 영상 | 클릭→명시적 미제공 Dialog. Tab 순환/Escape/닫기/trigger 초점 복귀. 페이지 이탈·재진입·reload에서는 닫힘. 실제 media 요소가 없어 재생 로딩/실패/재시도는N/A |
| 후기 외부 링크 | 확인한 원본 주소와 로컬 경로를 분리. 실제 back으로 후기 스크롤 복원, 취소는Reviews 복귀 |

공개 라디오·모바일 재배치·키보드·영상 미제공 모달과 로그인 분기/복귀는 목·접근성 정책이다. 원본에서 실행 확인한 행동으로 주장하지 않는다. 가입/구독 실행·비동기 응답이 없으므로 서버 실패·늦은 응답·입력 실패 재시도는 해당 화면에서N/A다. 기존 이메일의 오류·입력 보존·합성 IME·중복 제출은 G02/G03 회귀에서 확인한다.

## 5. 1차 검토 → 수정 → 2차 재검토

| 발견·재현 | 원인·수정 | 검증 |
| --- | --- | --- |
| 자료에 월간·누락 후기·영상 본문 부족 | 날짜가 확인된 보관본에서 월간 가격/30후기/링크 보완. 영상은 미제공 유지 | 원본 7PNG·MCP·보관본/자산·근거 분리 |
| 가격 카드가 약7~15px 아래, 기능 목록 폭·굵기 다름 | 원본과 실제 캡처 비교 후 제목/토글/카드/CTA 간격·본문400·목록 폭 보정 | before/final 비교, 잔여는7절 |
| 한 픽셀 숨김 radio 클릭이 스크롤 위치에서 실패 | 라디오 클릭 영역을 label 전체로 확장. 실제 선택/키보드·history 확인 | G04 브라우저 전환 검사 |
| 좁은 화면에서 `foryour`, `ownersacross`로 연결됨 | 숨긴br 앞 공백 누락. 명시적 공백 보완 | 실제390캡처 검토·내용 회귀 assertion |
| production에서 같은 프레임 Monthly→Yearly의 마지막 의도 유실 | Router transition의 지연 반영으로 다음 이벤트가 이전값을 읽음. URL 선택 반영에 `flushSync:true` 적용, 별도 상태 복제 없음 | 수정 전build28/29의 [실패 기록](evidence/g04/e2e-preview-before-race-fix.json), 수정 후 대상·전체 dev/build 재검증 |
| 여러 플랜의 이력·선택 오염 위험 | 기존 G03 snapshot에 선택 복사본·sourcePath·returnTo query 추가, ref 중복 제출 차단 | 다른 플랜/주기 back/forward, 빠른 주기변경 직후CTA/중복click, 새 탭/reload/취소 |
| 기존 G02 테스트가 Pricing/Reviews를 미구현으로 기대 | 새 실화면·heading 확인으로 갱신, 후속 미구현 검증 유지 | G02 메뉴 실제 목적지·reload/back 회귀 |

1차 검토는 코드·상태 소유권·실제 원본/캡처·초기 브라우저 실행을 함께 사용했다. 초기 타입 검사에서 목적지 union의sourceHref 접근 오류, 새 테스트의 괄호 구문 오류도 수정했다. 루트에서Corepack을 호출한 명령은pnpm버전 불일치로 실패하여FE/user-web cwd에서 다시 실행했다. UI 결함과 검증 코드의 잘못된 heading 공백/컨테이너 overflow 판정은 구분했다. 긴 강조 문구의 내부 overflow만으로 실패시키던 검사는 실제 텍스트·버튼의 viewport/카드 경계를 검사하도록 수정했다.

2차 재검토에서 보관본의 실제 체크 SVG로 문자 근사 기호를 교체하고 Tax 설명 폭을 보정했다. 이 최종 변경 뒤 전체 타입/lint/unit/build와 dev/build 29개씩을 다시 실행하고 캡처도 갱신했다. 수정 코드의 책임·순수 가격 데이터·실제 navigation·인계 격리·사용자 변경 보존·한글 주석·외부 요청 경계와 최종 캡처를 재대조했다. 후기 4비교와 가격/Tax 최종 비교, 좁은 두 페이지의 제목·CTA·줄바꿈을 직접 확인했다. 검토 자체와 아래 테스트 실행은 별개다. G01~G03 동작 회귀를 확인했으며 기존 원본/시각/환경 대기는 유지한다.

## 6. 실제 실행·검증

실행 cwd `FE/user-web`. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 Node24.18.0·Corepack pnpm8.14.1 사용. Windows 전용 명령·설치/업그레이드·설정 변경 없음.

| 명령·범위 | 결과 |
| --- | --- |
| `corepack pnpm run typecheck` | 통과 |
| `corepack pnpm run lint` | 통과 |
| `corepack pnpm run test` | unit11/11: 기존9 + 가격 의미/URL 경계2 |
| `corepack pnpm run build` | 통과. JS 442.92kB/gzip 136.48kB, CSS 58.37kB/gzip 12.40kB |
| `corepack pnpm exec playwright test tests/e2e/commercial.spec.ts --workers=2` | 초기5/7 후 검증 기대값/좁은 텍스트 검사 보완, 다음7/7. 최종 전체와 구분 |
| `corepack pnpm exec playwright test -c playwright.preview.config.ts tests/e2e/commercial.spec.ts -g 'rapid cycle' --workers=1` | 동기 선택 수정 후1/1 |
| `corepack pnpm run test:e2e --workers=2` | 29/29 통과, skip/flaky0 (경합 수정 후 재실행) |
| `corepack pnpm run test:e2e:preview --workers=2` | 29/29 통과, skip/flaky0 (경합 수정 후 재실행) |
| `node scripts/capture-commercial.mjs` | 원본 대응 7상태 + 보완 월간 1상태·미제공 모달·좁은 2화면. 요청 8,266건 중 외부/API 0·오류 0. 마지막 normal/guest/빈 이메일 복원 |
| `/tmp/onehand-visual-venv/bin/python scripts/compare-commercial.py` | 원본7개에 pair/overlay/diff. 비교 수치는 동등성 합격률이 아님 |
| `git diff --check`, JSON/문서링크/기존파일 검사 | 통과. [문서·보존 감사](evidence/g04/document-check.json); 기존 234파일 중 누락 없음, G02/G03 과거 결과는 보존 후 추가 기록 |

실제 브라우저는 Chromium 148.0.7778.96. 테스트는 실제 라우터/navigation을 사용하고 request intercept 없이 요청·실패·console을 관찰한다. G04 7시나리오 외에G01 7·G02 8·G03 6·공개 인계1을 포함한다. [개발 보고서](evidence/g04/e2e-results.json), [빌드 보고서](evidence/g04/e2e-preview-results.json), [검증 요약](evidence/g04/verification-summary.json).

최종 개발 E2E의 정적 GET 요청 135,649건, 빌드 E2E 2,529건을 관찰했다. 각각 실제 API/외부 요청 0건·요청 실패 0건·console 오류 0건이다. 5173 캡처의 8,266요청에서도 동일했다. Vite의 다수 모듈 요청은 API 호출이 아니며, 이 수치는 실행한 흐름의 관찰 결과다. 외부 보관본/자산을 확보한 조사 요청과 FE 런타임 요청은 구분한다.

확인 범위: 메뉴→가격/후기→CTA/외부 목적지→취소·back/forward, 직접URL/reload/new tab, 라디오 방향키, 실제 스크롤 복원, Dialog 초점/Tab/Esc/페이지 이탈, 서로 다른 플랜/주기 이력, 같은 이벤트 주기 선택/중복 제출. 폭320/390/768/1024/1440/1920에서 제목·본문·CTA·카드 안 텍스트의 경계까지 확인했다. G02/G03 모바일 메뉴 닫기·짧은 화면 스크롤·폭 변경 초점·이메일 오류/중복/초안·소개 이력 격리·긴 한국어/합성 composition·G01 세션/reset/지연·실패도 회귀 확인했다.

CSS zoom 200%·합성 composition은 실제 OS 확대/IME가 아니다. 실제 한글 입력기, 화면낭독기, 물리 터치, Safari/Firefox/WebKit·실기기 검증은 수행하지 않았다. 해당 OS/보조기술/브라우저 환경에서 추가 확인이 필요하다. Browserslist자료 노후화·FORCE_COLOR/NO_COLOR는 도구 경고로 분리한다. 정적 UI의 가짜 비동기 실패/재시도는 만들지 않았다.

## 7. 시각 비교·캡처와 남은 차이

원본 2880×1800을 Lanczos 1440×900으로 정규화하고, 실제 Chromium 1440×900/DPR1의 폰트·자산 준비 후 캡처한다. 원본scrollY는 미확인이므로 플랜 카드/추가상품 제목/영상/후기제목/카드 상단을 관찰y에 정렬한다. 실제 캡처 좌표·상태는 [capture-evidence](evidence/g04/capture-evidence.json)에 기록한다. 원본과 실제viewport/DPR이 확정적으로 같다고 주장하지 않는다.

- 원본: `bonsai_analysis/flows/Pricing/screens/01~03`, `Reviews/screens/01~04`.
- 구현: `evidence/g04/pricing-01~03.png`, `reviews-01~04.png`; 보완 월간 `pricing-monthly.png`, 미제공 `reviews-unavailable.png`.
- 비교: `evidence/g04/comparisons/{pricing-01~03,reviews-01~04}-{pair.jpg,overlay.png,diff.png}`.
- 좁은 화면: `pricing-narrow.png`, `reviews-narrow.png`(390×844 전체화면). 원본 모바일 증거가 아닌 목 반응형 검증이다.
- 첫 비교: `before-review/`에 가격 최초3·후기 중간4상태를 보존한다. [시각 수치](evidence/g04/visual-metrics.json)는 마스킹 없는RGB차이이며 완전 일치나 품질 백분율이 아니다.

확인·조정한 값: Gellix400/500/600/700, h1 60/60·h2 42/54.6·후기20/20·본문16/19, 가격 카드3열/20gap·후기3열/16gap·1064본문·1280헤더·영상1064×500·radius20/22. CSS는 보관 규칙과 시각 추정을 혼합하되 추정치(카드padding63, 토글/heading간격·앵커y)를 원본computed값으로 단정하지 않는다.

남은 차이: 원본 렌더러/안티앨리어싱·체크 아이콘의 세부 배치·그림자와 추천 테두리·일부 문자 간격/줄바꿈. 후기 포스터는 같은 보관파일의 인물이지만 원본 캡처의 프레임/화질·크롭과 차이가 남는다. 첫 후기행의 높이/본문 정렬 일부가 다르다. 가격03 하단의 장식 식물과 캡처 이후 미수록 구간은 완전히 재현했다고 보지 않는다. 공통 푸터/지원 영역은 기존 G02와 날짜가 확인된 보관본 보완이며 G04의 7PNG 전체에서 관찰한 영역은 아니다. 영상 미제공 Dialog·모바일 배치는 명시적 목 보완이다.

## 8. 남은 항목·후속 서버 메모

- 원본 미확인: 로컬 영상/자막·원본 재생/닫기·CTA의 실제 로그인 분기/가입 이후 복귀·원본 Monthly의 렌더링/전환·모바일·Professional services의 정확한 주소·현재 자산 배포 조건.
- 서버 후속: 가격/통화·세금·국가·좌석/추가 상품·반올림·실제 연 총액·체험/환불·권한·실계정 구독 정책. API·DB·BE 설계/계약을 수행하지 않는다.
- 영상 재생 완료·완전 시각 동일·전체 환경 검증 완료로 판정하지 않는다. R01 전체·G02/G03 잔여 항목도 자동 완료하지 않는다. G05/G10/G11/G79 본문·후속 개발은 시작하지 않는다.

## 9. 미리보기 최종 확인 순서

`http://127.0.0.1:5173/`에서 다음을 확인한다.

1. 헤더 Pricing → Monthly/Yearly → 각 플랜 금액·추천·포함 기능 → Start for free → G10 인계의 플랜/주기/금액 의미 → 뒤로·앞으로·취소. 취소 뒤에도 가격 주기 선택은 유지된다.
2. Starter/Yearly 인계 후 헤더 Pricing → Business/Monthly 인계를 만들고 back/forward로 서로 다른 snapshot을 확인한다. 새로고침/새 탭에서는 인계가 초기화된다.
3. `/login`에서 가상 Alex → Public → Pricing → 플랜 CTA는 G79 로컬 인계다. 취소 후 Go to dashboard에서 기존 가상 목록을 확인한다. 실제 구독 변경은 없다.
4. Reviews → 포스터 → 영상 미제공 안내 → Tab/Shift+Tab/Escape/닫기 → 원래 버튼 초점. 페이지 이탈 후 재진입은 닫힘 상태다.
5. 후기 30카드·G2/Capterra·직무 링크 → 외부 주소의 로컬 안내 → 취소/back·스크롤 복귀를 확인한다. Tax/Professional services는 G03 대기 경계다.
6. 좁은 폭에서 메뉴·라디오·카드·모달과 긴 문구를 확인한다. 마지막 `/components` → Preview controls → Reset preview로 normal/guest를 복원한다.

G04 결과 보고 후 종료한다. 커밋·push·배포 및 G05 착수 없음.
