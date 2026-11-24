# G04 실행 결과 — 가격·후기와 로컬 선택 인계

> 현재 재검토는 [2026-11-24 G04 R4 결과](#g04-r4-recheck)를 따른다. 아래 최초 체크와 수치는 과거 이력이다.

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

## 2026-11-21 G06 공통 회귀 기록

[G06](G06_RESULT.md)에서 공개 인계에 템플릿 snapshot을 확장하고, 새 문서 default 이력 키가 다른 경로 스크롤을 복원하는 결함을 pathname+search+key로 수정했다. 기존 이메일/가격·메뉴·상세 복귀를 포함한 전체 dev/build 각38개 통과, 실제 API/외부/실패/console0. G06 마지막 시각 변경은 대상5개씩 추가 통과. 이 결과로 기존 원본·시각·환경 대기를 자동 완료 처리하지 않는다.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G12 연결 회귀 (2026-11-21)

가격 선택→가입→로그인→재설정→빈 로그인에도 선택 요약 유지와 같은 계정 로그인을 검증했다. 관련 dev·build23씩 통과. G14 최종 목적지/왕복과 기존 원본·환경 대기는 유지한다. [G12](G12_RESULT.md).

### G13 연결 회귀 (2026-11-21)

가입→사업 설정→동일 회사 저장에 가격 선택/공개 인계를 유지하고 로그아웃→같은 계정 재로그인 시 회사 정보 유지/이전 인계 폐기를 검증했다. 관련 dev·build26씩+최종 온보딩3씩. G14 최종 목적지/왕복과 기존 미수록·환경 대기는 유지한다. [G13](G13_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 최종 공통 회귀 (2026-11-21)

[최종 코드 검증](evidence/g15/final-verification.json)의 전체 개발/빌드82개씩에 기존 기반·공개 메뉴/폼·소개·가격/후기 흐름을 포함했다. G03의 이전 Public 테스트 명칭을 실제 Public site로 바꿨으며 검증을 제거하지 않았다. 기존 원본·시각·환경 대기를 완료 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

이번 공통 수정의 영향을 기존 흐름 회귀로 확인했으며 원본·시각·환경 대기는 유지한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

<a id="g04-r4-recheck"></a>
## G04 R4 재검토·보완 — 2026-11-24 KST

**현재 판정: 주요 구성·R4 대조, 구현 보완, 단위/DOM·Chrome 연결 검증 수행 / 엄격한 시각 동일성·미수록 원본·추가 환경 대기.** 위 최초 조사·체크·테스트·후속 기록은 당시 이력으로 보존한다. 과거 미구현 G10 설명은 현재 상태가 아니다. 기존 G10/G11·G13/G14 연결을 보존했으며 이번에 온보딩 전체를 재검증하지 않았다.

### 10.1 범위·적용·자료 확인

- 시작 HEAD `b4c10bd9`와 깨끗한 작업 트리를 확인했다. G03 커밋 이후 변경을 되돌리지 않았다. G04 가격·후기와 실제 G01 UI/공급자, G02 메뉴/푸터/가입, G03 초안, G10/G11, G79 선택 표시·취소 경계만 포함했다. G79/R18 업무 구현·가격 계약 확정·G05/G32 신규 작업은 제외했다.
- 전체 확인: G04 명세·이 결과의 기존 기록, Pricing/Reviews ANALYSIS, 원본 7PNG, commercial feature·두 page·CSS·후기30개 데이터. 파일 검사와 직접 이미지 열람을 각각 수행했다. 다른 흐름 PNG는 이번에 추가 열람하지 않았다.
- 관련 부분 확인: 계획 README·COMMON 실행 순서/착수/UXUI/PUBLIC-WEB/목 상태/사용자 흐름/대응표/행동 검토/영향/확장/색인, G00 인계·G01/G02/G03 결과·공통 G01~G15 보완, R01 10절과 후속 기록, G10/G11/G13/G14 명세·기존 인계 결과, G79/R18 선택 경계. 전체 G/R·RESULTS 전수 정독이나 R01/R18 전체 분석을 주장하지 않는다.
- 적용: AGENT README, PM036/UX025, FRONT README 지도, 결정006 우선, User Web 구조·컴포넌트·상태·목·접근성·한글 주석·User Web 컨벤션·테스트·ENGINEERING_REVIEW_CHECKLIST. 적용 경로의 추가 AGENTS 없음, BE 지침은 범위 밖이다. 원본 분석 STANDARD와 REVIEW의 식별/관찰/추정/목/미확인 구분을 적용했다.
- 현재 기준은 원본 동일 재현이다. 작은 폰트·크기·픽셀 차이 허용 문구는 이번 완료 기준으로 사용하지 않는다. 새 캡처가 필요한 픽셀 검증은 사용자 산출물 금지에 따라 수행하지 않았다. 기존 evidence·원본·분석 정본·환경·BE·DB는 변경하지 않았다.

### 10.2 원본 식별·채택 버전

Pricing Flow ID `981ffcc3-d6c0-4038-8db3-4ac8753aace4`, Reviews Flow ID `d501af32-ef6e-4ca1-8d3f-cf6e67874a08`. 저장된 Bonsai WEB Latest/2146을 기준으로 하며 이번 MCP/공식 웹/보관본 신규 조회는 없다. 2146은 촬영일·제품 빌드가 아니다.

| 흐름·단계 | Screen ID | 원본 경로·직접 열람 | 현재 SHA-256 |
| --- | --- | --- | --- |
| F089 · 01 | `sc_6b53199f35cb4bc69306b8e615e55dd7` | [원본](<../../../bonsai_analysis/flows/Pricing/screens/01_sc_6b53199f35cb4bc69306b8e615e55dd7.png>) | `71fdc9275e5a6bbfdcb78a6720b70cb88eb876d32a23d115cbc6d4eec4aaaa89` |
| F089 · 02 | `sc_c435c9f093d34fddabe4fa83dd022786` | [원본](<../../../bonsai_analysis/flows/Pricing/screens/02_sc_c435c9f093d34fddabe4fa83dd022786.png>) | `fe6a838b8401643ac1f34f8db87a37c972b4556b9fb9440d97f822554f086a2c` |
| F089 · 03 | `sc_963ddd0939f7412cb81390d58c8cb401` | [원본](<../../../bonsai_analysis/flows/Pricing/screens/03_sc_963ddd0939f7412cb81390d58c8cb401.png>) | `823e590fa611d18dc34ce7a64d018d7edea14e334acc4a4f0d16e1078f9e633e` |
| F110 · 01 | `sc_21f0e007e04d45edbd410a1dffdff04c` | [원본](<../../../bonsai_analysis/flows/Reviews/screens/01_sc_21f0e007e04d45edbd410a1dffdff04c.png>) | `2f8936829ae56671ba06c49b2d3cc546c3fdd136ce2a84c714d9f88e1a9e7b93` |
| F110 · 02 | `sc_a605cb0e7e164a64b2707c0a110eafa6` | [원본](<../../../bonsai_analysis/flows/Reviews/screens/02_sc_a605cb0e7e164a64b2707c0a110eafa6.png>) | `4118c06527f126a23a507908f841783a9417d2a9f5248ccea7033ee4c7f4622a` |
| F110 · 03 | `sc_7d668b0699a945e98ca3ccbe29066b7a` | [원본](<../../../bonsai_analysis/flows/Reviews/screens/03_sc_7d668b0699a945e98ca3ccbe29066b7a.png>) | `f175c17e11ed5a0029f51a6f13309572a9e2a23925f699bdcfc5300de93ad186` |
| F110 · 04 | `sc_a6b1e7be914645e293f35918c57e4ee9` | [원본](<../../../bonsai_analysis/flows/Reviews/screens/04_sc_a6b1e7be914645e293f35918c57e4ee9.png>) | `483575ad9742488d71839e0f638a903cf496186c4983ee4e0c1cbf5a190c47c3` |

두 ANALYSIS의 SHA-256은 Pricing `cdc8a6a70c0633dc09495a613d06906fdeaeda9a59f8ad816d1ba119ea60957f`, Reviews `97d2d1ebe57581635f6004408b9baa7fb19c2e29db37d806538853a11aca4f2d`. `SOURCE_ANALYSIS_INDEX.json`의 해시/순서/ID/경로, PLAN-INDEX의 G04 01~03/01~04 배정과 일치했다. PNG7개는 모두 2880×1800이다. 기존 MCP1440×900 메타데이터나 PNG 크기로 원본 CSS viewport/DPR을 확정하지 않는다. 이번 직접 열람은 도구 표시 축척이며 정합화된 픽셀 비교가 아니다.

| 구분 | 채택·확인 범위 | 잔여 |
| --- | --- | --- |
| 가격 관찰 | Yearly $21/$32/$66 월 환산·Billed annually·추천·기능9/8/6·추가 상품 각$10 | 실제 월간 렌더링/원본 전환/가입 결과 미수록 |
| 가격 보완 | 기존 2024-01-18 08:27:27 보관본 기록과 코드의 Monthly $25/$39/$79, `bonsai-public-legacy-20240118-catalog2146` 유지 | 이번 보관본 재조회 아님; 현재 서비스 정책 아님 |
| 금액 의미·목 가정 | 원본 `$`; 인계 USD는 목 표시. 252/384/792는 월 환산액×12 계산 소계 | 실제 연 청구액·세금·국가·좌석·할인·반올림 미확정, R01/R18/G79 후속 |
| 후기 관찰 | 01 제목/과거500,000+/G2/Capterra4.7/CTA, 02 포스터·중앙play, 03/04 이름·직무·본문·3열·잘린 행 대조 | 원본7PNG가 후기30개 전체의 증거는 아님 |
| 후기 보완 | 기존 2024-01-18 08:27:51 보관본 기록과 현재 30카드 순서·본문, 플랫폼2+카드11 로컬 목적지 유지 | 원본 미수록 행은 보관본 보완; 현재 평점/사용자/CRM 데이터 아님 |
| 영상·자산 | 현재 로컬 check/poster/play/G2/Capterra 5자산 존재. 기존 Mary Mitchell 포스터·YouTube 링크 기록만 유지 | 포스터 크롭/프레임 차이, 로컬 영상·자막 없음. 외부embed/재생/진행률 없음 |

### 10.3 R4·요소·코드 판정

코드 기준 경로는 [commercial 기능](../../../FE/user-web/src/features/public-commercial/components/pricing-plans.tsx), [후기](../../../FE/user-web/src/features/public-commercial/components/reviews.tsx), [가격 데이터](../../../FE/user-web/src/features/public-commercial/data/pricing-data.ts), [스타일](../../../FE/user-web/src/styles/public-commercial.css)이다.

| 항목·원본 영역 | 현재 코드·수용 기준 | 판정 |
| --- | --- | --- |
| R4-F089-O01 · Pricing01/02 | PricingPlans: native radio/Yearly 짙은 초록·내부 배지, Professional만 주황 배너/외곽선, 이름·가격·설명 | 주요 구성 유지. 월간 Most popular는 보완 버전; 시각 동일성 대기 |
| R4-F089-O02 · Pricing02/03 | pricing-features/bottom-cta/PricingAddons: 9/8/6 기능, 아래 CTA 정렬, Team Seat/Tax 별도 월$10 | Business의 `(1099 contractors)`를 다음 줄·보조색으로 구현 보완. 나머지 구성 유지 |
| R4-F089-A01 | readBillingCycle/createPlanSelection/PlanHandoffSummary: 월간 출처·연 환산/소계·snapshot/취소 | 문서 보완·관찰/목 구분. 원본 월간/정확 치수·촬영·정책 분석 대기 |
| R4-F110-O01 · Reviews01/02 | ReviewsHero/ReviewVideo: 제목→평점→CTA→포스터, 실제 미디어 없음 | 주요 구성 유지. 로컬 Dialog는 접근성 목 가정, 영상/자막/크롭 대기 |
| R4-F110-O02 · Reviews03/04 | ReviewGrid/review-content: 3열·짙은 이름/초록 직무·순서·본문 줄/공백 | 원본 표시 부분과 기존 보완 범위 유지; 잘린 카드 전체를 관찰로 승격하지 않음 |
| R4-F110-A01 | commercialAssets/reviewDestinations: 기존 보관 자산·30카드·로컬13목적지 | 문서 보완, 정확 포스터/전체 원본/플레이어·모바일 분석 대기 |

| 공통 기준 | 이번 결과·잔여 |
| --- | --- |
| R4-C01 식별 | 2분석/7PNG 해시·ID·순서·담당 확인; 촬영 조건 대기 |
| R4-C02 전체 구성 | 7PNG 주요 영역·가격/후기 순서 대조; 캡처 밖 완전한 섹션 목록 아님 |
| R4-C03 요소 목록 | 위 주요 요소와 코드 대응 수행; 전체 요소 census/정밀 명세 인증은 미완 |
| R4-C04 정확 표시 | 플랜명/금액/기능·후기 표시와 보완 출처 대조, 보조 문구 분리; 줄바꿈 전체 동일성 대기 |
| R4-C05 배치 | 구현1440×900/DPR1에서 하단CTA top 각각1251px, 후기344px×3열, 포스터1064×500 측정; 원본 확정 치수 아님 |
| R4-C06 글자 | 구현 h1 Gellix700 60/60, 기존400/500/600/700 파일 유지; 원본 정확 파일/렌더링 동일성 대기 |
| R4-C07 색·장식 | Yearly/추천/후기 역할색 유지; 보조색은 기존 muted `#52795f` 재사용·추정, 원본 측정값 아님 |
| R4-C08 자산 | 로컬5자산·브라우저 이미지/폰트 로드 확인; 포스터 프레임/크롭·영상/자막·사용 조건 대기 |
| R4-C09 상태 | 주기·추천·금액·Dialog·가상세션 분리, DOM 및 아래 Chrome 범위 검증 |
| R4-C10 전환 | URL/history/CTA/취소·메뉴·Dialog 검증; 원본 미수록 전환/재생 규칙 확정 안 함 |
| R4-C11 입력·저장 | 이력별snapshot·pathname초안·중복·사용자/Reset·메모리 수명 검증, 아래 방법별 구분 |
| R4-C12 연결 | G01/G02/G03/G10/G11·G79 현재 경계 검증; 온보딩·G79 업무 전체는 범위 밖 |

### 10.4 발견 문제·수정·보존

1. 주기 전환이 현재 hash를 버림: `navigate({pathname, search, hash}, {preventScrollReset:true, flushSync:true})`로 URL 선택과 hash를 함께 보존했다. 마지막 연속 선택과 직후 CTA의 동기 반영은 유지했다.
2. 플랜 취소 복귀가 hash를 버림: 선택 순간 `returnTo=pathname+search+hash`. 플랜ID/주기/가격 버전·금액 의미의 snapshot은 그대로 유지한다.
3. 후기 외부 안내 취소가 query/hash를 버림: ReviewLink에 완전한 returnTo를 전달했다. sourcePath는 pathname으로 유지해 초안 정리 범위를 바꾸지 않았다.
4. 후기 hero 가입→로그인→뒤로→취소도 query/hash를 버림: 이 ReviewsHero 소비자에만 SignupLink intentOptions를 전달했다. 공통 SignupLink/다른 소비자의 기존 정책은 수정하지 않았다.
5. Business의 Hiring Agreement Templates 보조 문구가 동일 색/한 덩어리였음: 데이터에 featureNotes를 분리하고 다음 줄 보조색으로 표시했다. 원본 문구·의미·기능 개수는 보존했다. 정확한 색/타이포/픽셀 동일성은 대기다.

[정식 회귀 9개](../../../FE/user-web/src/app/router/commercial-entry.test.tsx)를 추가했다. 최초8개 중3개 URL 손실 실패→수정 후8개 통과; 추가 후기 가입 복귀1개 실패→수정 후 최종9개 모두 통과. navigation mock 없이 실제 App/provider/라우터/history를 사용한다. jsdom에 없는 scrollIntoView/showModal/close만 대체했다.

가격 URL 기본/잘못된 값, 과거 이력별 선택·다른 CRM 초안 보존, 가입/로그인 왕복, G79 표시와 취소, 사용자 변경·Reset의 오래된 인계 폐기, 공급자 remount의 메모리 초기화를 검사했다. remount는 실제 브라우저 새로고침과 구분한다. 정적 가격·후기에 가짜 로딩/저장 오류를 추가하지 않았다. 해당 비동기 늦은 응답·업무 저장 재시도는 N/A. 인증 저장소 기존 회귀는 전체 단위 실행에 포함했다.

### 10.5 이번 실행·실제 브라우저·한계

package 요구 Node>=24<25 / pnpm8.14.1을 확인했다. 기본 환경의 다른 버전을 설치/변경하지 않고 `/opt/homebrew/opt/node@24/bin/node`(24.10.0)로 기존 도구를 직접 실행했다. `NODE_DISABLE_COMPILE_CACHE=1`, `JITI_CACHE=false`, `JITI_FS_CACHE=false`를 명령 범위에만 적용했다.

| 검사·실행 방식 | 이번 결과 |
| --- | --- |
| `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false` 및 node 설정 | 모두 통과, tsbuildinfo 생성 없음 |
| `node node_modules/eslint/bin/eslint.js . --no-cache` | 통과 |
| Node stdin `startVitest('test', [], options, viteOptions)` | **27파일130/130, 57.27초**. G04신규9, G03기존7, public-entry8/header6, 가격계산2 포함 |
| Vitest 산출물 설정 | config:false/run:true/cache:false/pool:threads/execArgv:[]/maxWorkers:2, jsdom/setupFiles, reporter:default, coverage:false, fsModuleCache:false, optimizer client/ssr:false. Vite configFile:false/React/alias, optimizeDeps.noDiscovery:true/include:[], watch:null. 설정 번들·보고서/캐시 저장 안 함 |
| Vite stdin API build | **1966 modules, 3.87초 통과**. configFile:false/React/alias/직접 PostCSS plugins, write:false/copyPublicDir:false/sourcemap:false. 디스크 build를 생성하지 않음 |
| 원본·문서 검사 | Python `-B` stdin의 hashlib/struct/json/경로·배정 검증. 별도 스크립트/검증 JSON/로그 없음 |

초기9333 포트가 없었지만 후속 확인에서 기존 Headless Chrome157.0.8103.80이 응답했다. 브라우저를 새로 실행하거나 프로필·시스템 설정을 변경하지 않았다. 기존 CDP에 Node WebSocket으로 연결하고 별도 메모리 browser context/tab에서 검사했다. 다운로드 거부·캐시 비활성, screenshot/trace/recording/보고서 API를 사용하지 않았다. 브라우저 테스트는 stdin 자동화이며 사람이 수동 조작한 결과가 아니다.

- 실제 pointer/keyboard: /pricing·/reviews 직접 진입, 가격 reload·back/forward, native radio ArrowLeft, 3플랜×2주기×상하단 CTA **12조합**의 선택·취소, 연속 전환/중복 클릭, 가입→로그인→뒤로/취소, 후기 가입·외부 안내의 query/hash 복귀, 후기 카드 history 스크롤 복귀 통과.
- 연결: 가상 Alex의 G79 선택 $792 표시·취소→가격→기존 Alex workspace, reload로 guest 복원. Product→CRM, 모바일 같은 Reviews 재선택의 메뉴 닫힘/본문 초점, 모바일 Pricing 이동, footer의 가격/후기, 고객군·Tax·Professional services의 소개/미수록 경계 통과. G79 업무·결제 기능은 여전히 미착수다.
- 입력: CRM 공통 입력의 긴 한국어 오류→수정 인계, 합성 composition 중 제출 방지, 가격 취소 후 다른 CRM 초안 보존 통과. Input.insertText/합성 composition이며 실제 OS IME가 아니다.
- 영상 안내: native Tab/Shift+Tab 순환·Escape·초점 복귀, media요소0, 작은 폭 Dialog닫기, DOM 검사에서 route 이탈/재진입과 overflow 복원 통과. 실제 영상 재생은 미구현/미검증이다.
- 별도 새 탭의 /signup은 인계가 없고 /pricing?billing=monthly는 URL 주기를 표시했다. 브라우저 reload에서도 인계 폐기/가격 URL 유지 확인. 사용자 전환/Reset 후 과거 history 선택 폐기도 실제 Chrome에서 확인했다. 과거 두 snapshot의 상세 교차는 정식 DOM 테스트로 확인했으며 실제 브라우저 모든 조합으로 확대하지 않는다.
- viewport: 1440×900, 320×600, 390×844, 768×600, 1024×600, 1440×360, DPR1·scale1에서 두 화면의 수평 overflow 없음. 1440×360에서 CSS zoom200%도 수평 overflow 없음. 모두 에뮬레이션/DOM 치수 검사이고 실제 기기·브라우저 UI 확대·전 요소 시각 가림 검토와 다르다.
- 네트워크/console: 완주7구간 **491개 요청**을 CDP Network/Runtime/Log에서 차단 없이 관찰했다. 관찰 구간의 인증·업무·결제·외부/XHR/Fetch 요청0, loadingFailed0, console/error/uncaught0. 초기 검사 코드의 숨은 모바일 메뉴 대상·불충분한 Enter 이벤트·evaluate 변수 재선언 때문에 중단한 구간은 성공 수에 넣지 않았다. viewport/대기/실제 버튼 클릭·지역 변수 범위를 고쳐 해당 시나리오를 재실행했다. 이것은 제품 오류 수정이 아니다.
- 시각 동일성은 **미검증**. 원본 PNG와 새 캡처의 픽셀 비교 금지, 정확 폰트/촬영 조건·포스터 차이도 남는다. 브라우저 행동 통과·DOM 측정을 동일성으로 올리지 않는다. OS IME·보조기술·실기기·Safari/Firefox/WebKit은 G01/G04/G84 환경 잔여다.

기존5173 PID94330의 G03 메모리 번들은 정상 build 후 같은 주소의 G04 PID20135로 교체했다. 새 JS `/assets/index-CzyUxy_H.js`, CSS `/assets/index-BKD1SALm.css`, revision `G04-b4c10bd9-working-tree-20261124`. **HMR 없음**. 이전 사용자 탭/다른 서버는 변경하지 않았다. 도구 실행 중 오래된 Browserslist 경고는 있었지만 의존성 갱신은 하지 않았다.

### 10.6 공통 체크리스트·엔지니어링 검토

| 적용 규칙·코드 위치 | 결과 |
| --- | --- |
| START 착수/범위·근거/순서, PM/UX/006 | [x] G04만, 기존 HEAD/목 범위/영상·가격 경계 보존. G05/G32 자동 착수 없음 |
| 구조/컴포넌트·MOCK: pricing-data, PricingPlans, ReviewsHero/ReviewLink | [x] 정적 표시 데이터와 선택 행동 분리, 공통 UI/provider/BE 변경 없음, 새 의존성 없음 |
| STATE/USER-FLOW: billing URL, PublicProvider의 sourcePath/returnTo/snapshot | [x] 실제 router·취소/이력·사용자 격리 회귀. 실제 구독·권한 변경 없음 |
| COMMENT/TypeScript·ENGINEERING 6 | [x] 변경 컴포넌트/handler·신규 test/helper 책임 한글 주석, strict 타입/lint 통과 |
| WEB/ENGINEERING 5 | [x] 위 Chrome native radio/Dialog·모바일 메뉴·URL/폭 검증. [ ] 실제 OS IME/AT/다른 엔진·전 화면 시각 가림 검증 |
| MOCK/ENGINEERING 3·4 | [x] 현재 목 공급자·실제 API 없는 변경 범위 검토 및 관찰 범위 네트워크 확인. N/A 정적 가격/후기 저장 실패·pending·서버 영속성 |
| UXUI/ENGINEERING 1·7 | [x] 원본7장/R4·관찰/보완/목/미확인 구분. [ ] 전체 요소 census·정밀 치수/픽셀 동일성 |
| TESTING/종료 문서 | [x] 현재 명령·실패→수정→통과·브라우저 자동화/DOM/미실행 구분. 관련 체크/색인/링크 검토는 이 절의 후속 최종 기록 참조 |

### 10.7 남은 항목·담당·직접 확인

- [ ] G04/R01: 원본 Monthly 렌더링/가입 전환·후기 미수록 전체·영상/자막/플레이어·정확 자산/폰트/촬영/모바일·픽셀 동일성. 기존 포스터 크롭과 후기 높이/줄바꿈·가격 그림자/간격 차이는 해소로 판정하지 않는다.
- [ ] G01/G02/G04/G84: 다른 브라우저/실기기·OS IME·보조기술·전체 확대/겹침. 이번 G04 소비 검증만으로 G01~G03 전체 환경 대기를 닫지 않는다.
- [ ] G03/R01: Tax·Agencies·Professional services 등의 미수록 소개 본문/원본 URL. 후자는 로컬 후보일 뿐이다.
- [ ] G10/G11/G13/G14: 원본 실제 인증·온보딩·전체 왕복 정책. 이번 선택 인계/취소와 기존 저장소 회귀가 온보딩 전체 재검증은 아니다.
- [ ] R18/G79: 실제 연 총액·세금·국가·통화·좌석/할인·반올림·구독/체험/환불/권한. 서버 후속 메모이며 이번 API계약/DB 설계 없음. G79 업무 미착수 유지.

미리보기 `http://127.0.0.1:5173/`에서 `/pricing?billing=monthly&entry=footer#plans` → 두 주기/플랜 상하단 CTA → 가입/로그인 → 취소 후 원래 query/hash를 확인한다. `/reviews?entry=footer#review-11-brianna` → 평점/직무 링크와 가입 → 취소, 포스터 → Tab/Shift+Tab/Escape를 확인한다. `/components` → Preview controls에서 Alex → Public → Pricing → 선택 → G79 취소로 인계를 확인하고 Reset preview로 기본값을 복원한다. 영상은 미제공 안내가 정상이다.

커밋·push·배포 없음. 이번 G04 이후 Goal은 자동 시작하지 않는다.

### 10.8 최종 누락·정합성 점검

- [x] 7원본 단계·6 R4 항목·12공통기준, 기능9/8/6·가격/금액 의미·추가 상품·12 CTA조합·후기 표시/보완 순서·5자산·13로컬 후기 목적지·영상 경계, 메뉴/초안/가입/취소·G79 인계를 결과10.2~10.6과 재대조했다.
- [x] 전체 계획85G/22R/134흐름/754단계/642고유Screen, R4 455메모/공통12를 검사했다. 기존 단계 배정·선행 관계/실행 순서·과거 verification 값과 다른449개 R4 메모는 변경하지 않았다. 선행 참조는 존재하고 순환 없음.
- [x] 계획170개 Markdown의 로컬 링크6336회·앵커1631회와 새 JSON 문서 참조1종을 기준 HEAD와 비교했다. 새 경로/앵커/JSON 오류0. 기존 누락 링크·앵커218건은 과거 산출물 등을 포함한 이력으로 구분하며 이번에 복원하지 않았다. 파일 전체 정독과 자동 링크 검사는 다르다.
- [x] 제품 소스4개·정식 테스트1개·기존 계획28개만 변경했다. 원본/분석 정본/기존 evidence/FE환경/BE/DB 변경 없음. 생성물 경로의 최신 수정 시각은 기존 `.vite`/dist 11-22, test-results11-21, playwright-report11-12로 이번 실행 전이다. `.vite-temp` 비어 있음, `.cache`/계획 evidence 없음. 새 임시 스크립트·증거 파일 없음, `git diff --check` 통과.
- [x] 5173의 `/`·가격·후기·새 JS/CSS HTTP200과 revision을 확인했다. 이는 별도의 실제 Chrome 검증과 구분한다. 마지막 Reset은 guest/normal로 확인했고 작업용 메모리 browser context/두 탭만 종료했다. 사용자의 기존 브라우저/다른 탭과 5173 미리보기는 보존했다.
- [ ] 원본/시각·환경/정책 잔여는 10.7의 담당 G/R에 남아 있다. G04 전체 완료나 G79 업무 구현 완료로 표시하지 않았다.

## G05 소비·재검토 기록 — 2026-11-24 KST

- [x] 고객군 탐색 소비 유지·가격/후기 URL·가입 취소 등 기존9 DOM 회귀. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)에 근거를 기록했다. 전체 단위/DOM143개는 이번 실행 수치이고 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/네트워크·원본/시각 대기와 이 Goal 전체 상태는 유지한다. 이 기록은 G05의 공통 소비 영향 확인이며 이 Goal 전체의 R4 재검토/신규 착수가 아니다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 공유 공개 provider/가입 선택 변경의 기존 가격·후기 DOM 회귀만 포함. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.
