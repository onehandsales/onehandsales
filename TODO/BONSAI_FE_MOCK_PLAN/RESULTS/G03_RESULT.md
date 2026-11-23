# G03 — 고객군·업종·CRM 소개 실행 결과

> 현재 재검토 — 2026-11-23~24 KST: **G03 R4 주요 구성 대조·query/hash·템플릿 모서리 보완·단위/DOM 검증 수행 / 엄격한 시각 동일성·실제 브라우저·미수록 원본 대기**. [이번 범위·검증·잔여](#g03-r4-recheck). 아래 1~9절과 후속 이력의 수치·증거 링크는 당시 기록이며 이번 검증으로 재사용하지 않는다.

작업: 2026-11-20~21 KST · 기준 HEAD: `da60df02` · 미리보기: **http://127.0.0.1:5173/**

**확인된 세 소개 화면·목 상호작용 구현, 두 차례 검토와 Chromium 검증을 수행했다. G03 전체 완료는 대기다.** 22상태의 시각 비교를 수행했지만 자산/crop·배경·문자 간격 차이, 원본 관련 글 2페이지·다른 소개 본문·모바일 동작과 추가 환경 검증이 남아 있다. R01 전체 분석 완료, G02 시각 완료, 실제 인증·서비스·출시 완료를 뜻하지 않는다. 커밋·push·배포와 G04 착수는 하지 않았다.

## 1. 착수 근거와 선행 영향

- 시작 시 Git clean, HEAD `da60df02`와 G02 변경 이력을 확인했다. 이번 변경은 FE/user-web과 G03 관련 계획·증거에 한정한다. 기존 사용자 변경·삭제는 없었으며 기존 5173 Vite 프로세스(PID36112)를 보존했다. Backend는 실행하지 않았다.
- 적용 범위의 AGENTS 탐색, AGENT README·PM036·UX025, FRONT_AGENT README와 아키텍처/컴포넌트/상태/목/웹 접근성/한글 주석/테스트 규칙, ENGINEERING_REVIEW_CHECKLIST, 결정006을 읽었다. 과거 실제 로그인/API 지침보다 **006의 UX/UI 전용 정책과 이번 사용자 지시**를 우선했다.
- AGENT 안내의 `AGENT_USAGE_RULES.md`는 체크아웃에 없다. 이번 사용자 지시와 존재하는 README/006/하위 규칙을 적용했다. 과거 PM의 TODO 전환 금지 안내보다 사용자가 명시한 현재 TODO/BONSAI_FE_MOCK_PLAN을 기준으로 삼았다. Backend AGENTS를 FE 규칙으로 확장하지 않았다.
- 계획 README·시작/순서/UXUI/목 상태/USER-FLOW/FLOW-GOAL-MATRIX·공개 웹 규칙, G03/R01 명세, G00/G01/R01/G02/G02_RECHECK 결과와 목적지 색인을 대조했다. 과거 9/15/15 통과 기록을 이번 결과로 재사용하지 않았다.

| 선행 항목 | G03 영향·처리 |
| --- | --- |
| G01 목 provider/router/Dialog·G02 공개 셸·폰트·메뉴 | 실제 코드를 재사용하고 이번 E2E에서 다시 검증. 별도 FE 기반을 재작성하지 않음 |
| G02 잔여 시각·자동 전환·원본 모바일·OS 검증 | 세 소개 제작을 막지 않음. G02 소유 대기 상태 유지 |
| 기존 전역 이메일/단일 CTA 인계 | 여러 소개에서 입력과 이전 이력이 섞일 위험. 경로별 초안과 이력별 메모리 snapshot으로 필요한 공통 부분 수정 |
| G03 스크롤 헤더·가상 로그인 표시 | 소개에만 top:0 스타일 적용. Go to dashboard는 사용자가 선택한 가상 세션으로만 표시. 스크롤은 세션을 변경하지 않음 |
| R01 누락 본문·FAQ·목적지 | 아래 보완 근거와 33개 목적지 목록 작성. 미수록 부분은 대기, 서버 질문은 후속 메모 |

공통 수정과 회귀 결과는 [G02 재점검 결과의 G03 후속 기록](G02_RECHECK_RESULT.md)에 덧붙였다. G00/G01/G02 완료 상태를 올리지 않았다.

## 2. 직접 확인한 원본과 보완 자료

MCP에서 Bonsai 앱과 아래 3흐름·22 Screen을 조회했다. App ID `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, slug `bonsai-web`, 카탈로그 **Latest/2146**. 조회 2026-11-20 23:46 KST. 각 ANALYSIS와 원본 PNG 22개를 직접 열어 보았다. 전체 Screen ID·Gummble 링크·이미지 URL·조회 범위는 [MCP 원본 기록](evidence/g03/mcp-sources.json), 로컬 파일 대응은 [시각 비교 색인](evidence/g03/visual-metrics.json)에 보존했다.

| Flow | Flow ID | 확인·소유 범위 |
| --- | --- | --- |
| Freelancers | `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54` | 01~04. 실제 화면은 Small business. hero·Kimberly 후기·관련 글 12개·1/2 및 Next |
| Industries (Consulting) | `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` | 01~08. Industries 메뉴·hero·기능·Alison 후기·청구/포털 홍보·재무/시간 카드 |
| Products (CRM) | `12ca870d-d929-4cc8-ab4c-60436c2eac13` | 01~10. Product 메뉴·hero·3기능·고객/프로젝트 홍보·Mary 후기·12양식·2기능 카드·FAQ 닫힘/첫 답변 |

Freelancers 분류 오류인지 전환 누락인지는 알 수 없다. **실제 Small business 화면을 구현했으며 `/software/freelancing`을 그 화면으로 바꾸지 않았다.** Small business 03/04의 Go to dashboard도 실제 로그인 성공의 증거가 아니다. 비교 캡처에서만 G01의 Alex 선택을 실제 클릭해 해당 표시를 만들었고, 익명 스크롤은 익명 상태를 유지하는 테스트를 별도로 수행했다.

보완 자료는 원본과 일치하는 부분과 원본의 누락 구간에만 적용했다. [보완 근거 기록](evidence/g03/supplement-sources.json)에 요청 URL, 실제 보관본 redirect URL, 바이트, HTML SHA-256을 남겼다.

| 실제 보관본 | 채택한 보완 | 제한 |
| --- | --- | --- |
| [CRM 2024-01-18 08:28:30](https://web.archive.org/web/20240118082830id_/https://www.hellobonsai.com/crm) | FAQ 2·3 답변, 템플릿 slug, 홍보 자산/본문 | FAQ 2·3을 Gummble에서 본 것으로 기록하지 않음 |
| [Consulting 2024-01-18 08:28:17](https://web.archive.org/web/20240118082817id_/https://www.hellobonsai.com/software/consulting) | 캡처 사이 계약 소개와 기능/자산, CTA 링크 | 실제 기능·회계 계산·공개 권한 근거가 아님 |
| [Small business 2024-02-03 20:57:45](https://web.archive.org/web/20240203205745id_/https://www.hellobonsai.com/software/small-businesses) | 누락된 overview·계약/청구/포털·재무/시간 본문과 원본 자산 | Gummble 전체 페이지를 봤다는 뜻이 아님 |
| [Small business 2024-04-06 19:15:23](https://web.archive.org/web/20240406191523id_/https://www.hellobonsai.com/software/small-businesses) 및 2024-02~03 개별 기사 5개 | 원본에 보이는 기사 제목과 이미지·저자·slug 대조 | 보관본 17개 목록 순서를 이식하지 않음. 원본에 보이는 12개 순서 유지. 페이지 2 근거로 사용하지 않음 |
| 해당 보관 HTML의 Gellix/이미지/CSS | 원본 스타일·이미지 보완, 같은 G02 로컬 Gellix 재사용 | 현재 Bonsai의 새 디자인이나 현재 가격/정책을 채택하지 않음 |

MCP 카탈로그 번호, 원본 촬영일, 서비스 빌드, 보관본 날짜는 다르다. 촬영일·빌드·원본 CSS viewport/DPR은 미확인이다. MCP에는 1440×900 메타데이터, 로컬 PNG에는 2880×1800 픽셀이 있으나 이것만으로 DPR2를 확정하지 않았다. 보완 자료 조회는 개발 조사이며 **FE 런타임 외부 요청과 구분**한다.

소개 원본 자산 61개(9,827,962 bytes)를 로컬에 저장했다. [소개 manifest](evidence/g03/asset-manifest.json)·[기사 manifest](evidence/g03/article-assets.json)·[배경 manifest](evidence/g03/background-assets.json)에서 URL/해시를 확인할 수 있다. 기존 G02 파일도 재사용한다. 미사용 후보 SVG 5개는 제거했다. 원본 이미지 안의 프로젝트·계약·청구·추가 버튼은 클릭 가능한 업무 컴포넌트가 아니다.

## 3. 화면·컴포넌트·목적지 구현

| 경로/흐름 | 구현·검증 상태 | 경계 |
| --- | --- | --- |
| `/software/small-businesses` | hero·Start free·Book a demo·후기·보완 본문·관련 글 12개·페이지 표시·공통 footer. 직접 URL/reload/뒤로/앞으로·글 복귀 스크롤 검증 | 페이지 2는 콘텐츠 미확인 안내와 Previous. 일반 blog/search/detail은 G05 인계 |
| `/software/consulting` | hero 이메일·기능·후기·홍보 카드·CTA·공통 지원/하단 CTA/footer | 업종별 계정 설정/프로젝트/계약/결제 작업 없음 |
| `/crm` | hero 이메일·기능·후기·12양식·추가양식 가입·기능 카드·FAQ 3개 | Forms/Time tracking/Tasks 등 미수록 소개는 G03 대기. 실제 CRM/Deals 없음 |
| `/signup` | source/email/returnTo snapshot·취소·이력 복귀 | 기존 G10 인계 화면만 사용. 가입 폼·성공·실제 인증 구현 안 함 |
| `/form-template/:slug`, `/templates/forms` | 공통 목적지 색인과 같은 ID/slug로 연결 | G06 미구현 표시. 파일 생성/다운로드 없음 |
| `/blog/:slug` | 원본 관련 글의 같은 ID/slug로 로컬 연결 | G05 미구현 표시. 일반 목록·검색·기사 본문 구현 안 함 |
| Book a demo | 로컬 Dialog·닫기·Escape·Tab 순환·원래 버튼 초점 복귀 | 예약 화면 원본 미수록. 설명과 복귀만 제공하는 명시적 목 인계이며 실제 예약/메일 없음 |

`pages/introduction`은 페이지 조합, `features/public-introduction`은 hero/overview/banner/testimonial/resources/related articles와 정적 데이터, `features/public-web`은 공통 헤더/메뉴/footer/폼/인계를 맡는다. 공통 UI Dialog와 실제 Router를 재사용했다. 동적 소개 schema·HTTP adapter·새 업무 저장소·범용 CMS는 만들지 않았다. 신규/수정 함수와 컴포넌트에 한글 책임 주석을 작성했다.

R01의 G03 배정은 **중복 제거 33경로**다. [전체 목적지·사용 위치·근거 대응표](evidence/g03/destination-scope.json)에 세 구현 경로와 다음 30개 미수록 본문을 구분했다. 기존 `r01-destination-map.json`의 원본 href나 소유 Goal은 바꾸지 않았다.

- 제품 11개: `/scheduling`, `/proposals`, `/contracts`, `/forms`, `/time-tracking`, `/task-management`, `/invoicing`, `/payments`, `/bookkeeping`, `/taxes`, `/banking`.
- 고객군·업종/목록 19개: `/software`, `/software/marketing`, `/software/recruiting`, `/software/virtual-assistant`, `/software/design`, `/software/photography`, `/software/software-development`, `/software/writing`, `/software/coaching`, `/software/architecture`, `/software/accounting`, `/software/legal`, `/software/event-planning`, `/software/interior-design`, `/software/real-estate`, `/software/agencies`, `/software/beauty-wellness`, `/software/freelancing`, `/software/health`.

이들 목적지는 기존 담당 Goal/미구현 표시를 유지했다. 링크 존재를 본문 완료로 보지 않는다. 화면 근거 부족은 이 목적지에만 해당하며 세 확인된 소개 구현은 진행했다.

## 4. 상태 수명·관찰과 가정

| 항목 | 원본 관찰·목 정책 | 취소/재진입/실패 |
| --- | --- | --- |
| 이메일 | G02 SignupForm을 분리·재사용. pathname별 메모리 초안. CRM/Consulting/랜딩 입력 격리 | invalid·긴 한국어 입력은 오류 표시/초점/원문 유지. 수정 후 제출 가능. 합성 composition 중 Enter는 제출 안 함 |
| 가입 인계 | `{source,email,returnTo}`를 이력별 메모리 snapshot으로 고정. history에는 임의 opaque ID만 저장 | 실제 back/forward는 해당 snapshot. Cancel은 출발 경로의 초안과 해당 경로 인계들을 폐기하고 replace 복귀. 다른 소개 초안은 유지. 명시적 취소의 목적지는 소개 기본 pathname이며 관련 글 query/스크롤 유지와 구분 |
| 메모리 초기화 | 랜덤 실행 ID+순번으로 새 메모리와 이전 history 충돌 방지 | 새로고침·새 탭·scope revision/Reset에서 초안·인계 폐기. URL·storage·로그에 이메일 미저장 |
| 중복/경합 | submit ref로 같은 폼 중복 인계 방지. 가입 경계에서 같은 CTA를 다시 눌러도 이력 추가 안 함 | 최신 인계가 이전 history 화면을 덮지 않도록 ID별 조회. 실제 비동기 제출/서버 응답은 없으므로 늦은 API 성공/실패를 만들지 않음 |
| FAQ | 닫힘·첫 열림 PNG 관찰. 2·3 답변은 날짜가 있는 보완 자료 | 초기 모두 닫힘·한 번에 하나·재진입 초기화는 목 가정. native button Enter/Space와 expanded/controls/region, 빠른 연속 열기·닫기 검증 |
| 관련 글 | 원본 page1 12개와 Next·1/2 관찰 | `?contentPage=2#related-content`로 실제 navigation, 미확인 안내. reload 유지, Previous/back/forward로 page1 복귀, 제목 초점·scroll restoration |
| 헤더/세션 | 원본에 익명/Go to dashboard 표시 차이 존재, 발생 이유 미확인 | G01에서 명시적으로 Alex를 선택한 경우만 dashboard. 스크롤로 인증하지 않음. reload는 guest |
| 정적 소개 | 메모리 업무 엔티티가 아닌 고정 콘텐츠 | 불필요한 조회 지연/로딩/검색 무결과/서버 실패를 추가하지 않음. 실제 로드된 모든 이미지 검증; 이미지 장애 주입은 미수행 |
| 좁은 화면 | 원본 모바일 미수록 | 기존 공통 메뉴와 명시적 반응형 가정. 동작 검증과 원본 동일성을 구분 |

## 5. 1차 검토 → 수정 → 2차 재검토

검토는 코드·근거·실제 사용자 흐름·캡처를 읽은 판단이며, 아래 6절의 명령 통과와 별도로 기록한다.

| 단계 | 발견·원인 | 수정·재검토 |
| --- | --- | --- |
| 1차 구조·범위 | G03 경로는 기존 pending으로만 연결. 단일 이메일 상태를 새 소개가 공유하면 입력 혼합 | 3페이지를 기존 public layout에 추가, pathname 초안 분리. 33목적지와 후속 경계 기록 |
| 1차 시각 | hero 타이포/사진/배경, 소개 banner 좌우 폭, 후기 높이/crop, FAQ/카드 간격 차이 | Gellix·원본 이미지·보완 CSS를 대조하고 header top·hero·본문·후기·CTA·카드·장식 위치를 여러 번 보정. 22 pair/overlay/diff 재생성 |
| 1차 자료 | Small business 본문, FAQ 2·3, 관련 글 링크/사진이 정적 흐름에 부족 | 날짜가 확인된 보관본 보완. Gummble 관찰과 보완 구분, page2·다른30본문은 미확인 유지 |
| 1차 테스트 | G02 모바일 메뉴 테스트가 Consulting을 pending으로 기대, 동일한 Bonsai 링크 header/footer selector 모호 | 실제 소개 h1 확인으로 수정, header selector로 한정. 기존 G02 기능 수용 기준은 유지 |
| 검증 도구 | 로드 중 연속 goto/reload로 이미지 ERR_ABORTED, 다중 직접 URL 테스트의 dev cold transform으로 30초 초과 | 이미지/networkidle 후 캡처·reload, 해당 긴 시나리오만 60초. 요청 실패를 무시하거나 차단하지 않음. 초기 실패를 최종 성공과 분리 |
| 2차 상태·실제 이력 | CRM 가입A→Consulting 가입B→뒤로 가입A에서 전역 최신 B 인계를 표시할 수 있음 | 이력별 immutable 인계 ID 도입. 이메일은 메모리만, source별 취소 폐기. 실제 Router back을 사용하는 `public-handoff.spec.ts` 회귀 통과 |
| 2차 시각·AA | 밝은 hero 배경, 후기 이름 색/크기 CSS 우선순위, CRM 카드 상단 간격과 잎 위치 | 해당 selector·배경색·crop·margin을 수정하고 최종 비교 재확인. 잔여 자산/문자 차이는 아래 표에 유지 |
| 2차 좁은 화면 재검토 | 실제 캡처에서 CRM/Consulting 제목·폼이 잘림. desktop 폼480px와 align-self:start가 좁은 flex 자식 폭을 확장했고 전체 overflow 숨김이 결함을 가림 | 모바일 초안 컨테이너 stretch/min-width:0·폼100% 적용. 요소별 실제 bounding rect와 좁은 화면 제출/취소를 회귀 검사에 추가 |
| 최종 재검토 | route·콘텐츠 ID·순수 정적/상태 책임·기존 G01/G02 영향·실제 네트워크 경계 | API·backend·의존성 추가 없음. 코드/브라우저 결함 보완, 미수록/환경/시각 대기로 전체 완료는 보류 |

4-worker 개발 재실행에서는 기존 G01 2시나리오와 G02 다중 목적지 검사가30초 제한을 넘었다. [자원/시간 제한 기록](evidence/g03/development-resource-timeouts.json)을 남기고 G02 재점검 때와 같은2-worker 실행으로 나눴다. 이어 [이동 재점검](evidence/g03/development-navigation-recheck.json)에서 이미지 취소와 URL만 먼저 변한 화면의 FAQ 검증 순서 문제를 확인했다. 목적지 h1과 실제 이미지 준비까지 확인하도록 보완했으며 assertion·네트워크 감시·navigation을 생략하지 않았다.

초기 화면 캡처에서 마우스가 Product 위에 남아 메뉴를 우연히 연 도구 문제도 발견했다. 캡처 전 마우스를 비활성 위치로 이동하도록 수정했다. 앱 메뉴 결함이나 원본 상태로 보고하지 않는다. `before-review`는 이 도구 문제를 고친 뒤의 1차 기준 캡처다. 좁은 전체 화면도 최상단 scrollY0으로 명시적으로 맞추고 캡처했다.

엔지니어링 검토: UI/데이터/라우트/상태 책임 분리, public export 경계, 의미 있는 CTA 전환, draft·snapshot 수명, 취소·scope 초기화·이력 충돌, 접근성·스크롤, 외부 연결 부재를 확인했다. 서버 mutation·계산·권한 보안·DB 일관성은 이번 정적 소개에 해당하지 않으며 확정하지 않았다. G01 기존 비동기 실패/취소/늦은 저장은 회귀 검사로 유지했다.

## 6. 실제 실행 검증

macOS, Node **24.18.0** (`engines >=24 <25`), pnpm **8.14.1**. 명령은 `FE/user-web`에서 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 실행했다. 현재 폴더의 Corepack packageManager를 사용했다. 의존성/lockfile을 변경하지 않았다.

| 실제 명령 | 결과 |
| --- | --- |
| `corepack pnpm typecheck` | 통과 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | Vitest 9/9 통과. 기존 runtime scope·취소·경합 검사 |
| `corepack pnpm build` | 통과. 1690 modules, JS420.16kB/gzip129.70, CSS51.28kB/gzip11.05 |
| 초기 `corepack pnpm test:e2e` 두 실행 | 각각19/21. 첫 실행 pending 기대/이미지 abort, 두 번째 timeout/중복 locator 실패. 수정 후 별도 현재 실행으로 확인 |
| 최종 `corepack pnpm test:e2e --workers=2` | dev5175 Chromium22/22. G01 7 + G02 8 + G03 6 + 인계 이력1 |
| 초기 `corepack pnpm test:e2e:preview` | 21/22. 바로 reload로 로컬 이미지16건 abort. [실패 요약](evidence/g03/e2e-preview-first-failure.json) |
| 최종 `corepack pnpm test:e2e:preview --workers=2` | build4175 Chromium22/22. skip/flaky0 |
| `node scripts/capture-introductions.mjs` | 기존5173에서22상태+390×844 전체3페이지 캡처. 정적 요청11620, 위반/오류0 |
| `/tmp/onehand-visual-venv/bin/python scripts/compare-introductions.py` | Pillow13. 22 pair/overlay/diff와 MAE 생성 |
| `node --input-type=module`의 실제 Chromium 마지막 점검 | Preview controls slow→Reset→normal/guest·공개 이메일 초기화. [브라우저 기록](evidence/g03/final-browser-check.json)·[기본 상태 캡처](evidence/g03/final-default-state.png) |
| `git diff --check`, 문서/JSON/자산 해시·목적지 검사 | 마무리 검사 기록은 [document-check](evidence/g03/document-check.json) |

[실행 요약](evidence/g03/verification-summary.json), [개발 브라우저·네트워크 증거](evidence/g03/development-browser-evidence.json), [빌드 브라우저·네트워크 증거](evidence/g03/production-browser-evidence.json), [캡처 시점·좌표·네트워크](evidence/g03/capture-evidence.json).

Chromium **148.0.7778.96**에서 실제 링크/Router/navigation을 사용했다. 네트워크 interception/차단은 없다. 최종 dev/build 시나리오와 캡처에서 **실제 인증·업무·외부 API 요청0, 실패 요청0, console/page 오류0**을 관찰했다. 개발의 많은 요청은 Vite ESM 정적 모듈·같은 host의 HMR이며 API로 세지 않는다. 실패한 실제 API를 차단해 0으로 보고한 것이 아니다. 조사용 MCP/보관본 조회는 FE 네트워크 수치에 포함하지 않는다.

직접 URL·reload·back/forward·재진입·스크롤 복원, 랜딩 메뉴→소개→CTA/관련 링크→복귀, FAQ 키보드/상태, 이메일 오류·한글 긴 문자열·합성 IME·중복 제출·취소·이력 snapshot, demo Dialog 포커스·Escape, 좁은 화면을 검증했다. G02 모바일 메뉴 닫기·짧은 화면 내부 스크롤·폭 전환 초점·연속 제출 뒤로 복귀와 G01 실패/재시도/계정/workspace 분리도 통과했다. 테스트에서 navigation 자체를 mock하지 않았다.

G03 전용 좁은 화면 검사는390×600이며, 가로 스크롤 유무뿐 아니라 제목·설명·입력·제출 버튼의 실제 경계를 확인했다. 전체 캡처390×844다. G02/G01의320~1920폭·CSS zoom200%·reduced motion 회귀와 구분한다. **실제 OS 한글 IME·스크린리더·물리 터치·OS 접근성 확대는 미검증**이다. 합성 composition/CSS zoom은 이 검증을 대신하지 않는다. Safari/WebKit/Firefox도 현재 Chromium 테스트 프로젝트 범위 밖이므로 실행하지 않았다. Browserslist 데이터 노후화와 FORCE_COLOR/NO_COLOR는 도구 경고로 분리했다. 추가 환경 검증에는 해당 OS 입력기/보조기술과 브라우저 실행 환경이 필요하다.

## 7. 시각 비교와 남은 차이

원본 PNG 2880×1800을 Lanczos로1440×900 정규화해 Chromium viewport1440×900/DPR1과 대조했다. 원본 scrollY가 없으므로 관찰 요소의 y좌표를 맞추고 구현의 실제 scrollY·selector·상태를 캡처 기록에 남겼다. 폰트·이미지 load/decode 후 캡처했다. 원본 CSS viewport·DPR·scrollY까지 같다고 단정하지 않는다.

공통 Gellix400/500/600/700, hero60/60/700, 본문16/19, 섹션42px, 작은 템플릿20/24, public 폭1064/1280, hero 인물428×554, 이메일480×48, FAQ폭640 등을 대조·보정했다. Gellix 파일은 보완 자료로 확인됐지만 수치/색의 적용값은 보관 CSS와 정규화 관찰에 따른 추정이다. #fcfcfc surface, #003026 ink, #16a000 green, Small business #52a82d/#173b31, hero #edf3ec도 원본 제품 token으로 확정하지 않는다. font weight/line-height·자간·줄바꿈·색·border·radius·shadow·아이콘·정렬·배율을 비교했다.

| 원본과 구현 대응 | 수정 결과·잔여 |
| --- | --- |
| Small01/Consult02/CRM02 hero | 제목·사진·CTA 위치·배경 영역 보정. 배경 무늬 scale, 사진 색/표정·작은 알림 아이콘·폼 그림자 차이 잔존 |
| Small02/Consult03~08 | 본문/후기 폭·사진 crop·카드 높이/장식·banners 배치 보정. 후기 사진 색·원본 raster, banner/통계 내부 이미지와 패턴 크기·간격 차이 잔존 |
| Small03~04 관련 글 | 12제목·순서·category·저자 표시·그림·3열·Next/1/2 대응. 썸네일 crop·저자 일부 색·본문 줄바꿈/행간·스크롤바 차이 잔존 |
| CRM03~08 기능·후기·양식 | 3기능·소개 일러스트·12양식·가입 카드·2기능 배치 보정. 일러스트 겹침/패턴·사진 crop·카드 아이콘/stroke와 문자 간격 차이 잔존 |
| CRM09~10 FAQ | 질문·첫 답변·펼침 높이/구분선·footer 위치 대응. 장식 가지 일부 비율·글자 raster·푸터 간격 차이 잔존 |
| Consult01/CRM01 메뉴 | G02 공통 메뉴 재사용·비교. 원래 G02 잔여 색/이미지/문자 차이를 유지하며 시각 완료로 올리지 않음 |
| 좁은 세 소개 |390px 전체 캡처와390×600동작 검증. 원본 모바일 미수록으로 동일성 판정 안 함 |

[1차 캡처](evidence/g03/before-review), [최종 비교22개](evidence/g03/comparisons), [정규화·MAE 색인](evidence/g03/visual-metrics.json). `*-pair.jpg`는 좌 원본/우 구현, `*-overlay.png`와 `*-diff.png`도 같은 이름으로 저장한다. `small-businesses-01..04.png`, `consulting-01..08.png`, `crm-01..10.png`는 실제 화면이다. `*-narrow.png`는 각 전체 좁은 화면이다.

전체22쌍을 시각 검토하고, 보정 후 hero·후기·CRM 카드/FAQ 등 변경 지점을 다시 확인했다. 마지막 모바일 잘림 수정 후 데스크톱22상태를 다시 캡처했으며22개 모두 직전 캡처와 바이트가 같았다. 좁은3페이지는 scrollY0으로 다시 캡처해 헤더·제목·입력·버튼과 남은 본문을 확인했다. MAE는 색 보정·마스킹 없이 계산한 차이값이며 일치율·합격률이 아니다. 세부 수치는 색인에 남겼고 **원본과 완전히 일치한다고 판정하지 않는다.**

## 8. 남은 항목과 서버 후속 메모

- **G03 원본 대기:** Small business 관련 글 page2, 다른30소개 본문, 모바일, 원본 FAQ 초기/다중 열림·원본 CTA 업종/이메일 파라미터·demo 예약 진입 이후. 보관본 날짜를 확인한 보완 영역도 실제 촬영본 전체와 동일하다고 확정할 수 없다.
- **G03 시각 대기:** 위7절 잔여. 원본 렌더러/정확한 자산 변형·시점 추가 확인과 부분 보정이 필요하다. 이 상태에서 G03 전체 완료로 체크하지 않는다.
- **환경 대기:** 실제 OS IME/보조기술/물리 터치·다른 브라우저. Chromium 자동화 검증 완료와 분리한다.
- **G02 소유:** 기존 랜딩 시각·자동 전환·모바일 원본 대기를 유지한다. 이번 G03 구현으로 해소됐다고 쓰지 않는다.
- **후속 Goal:** G05 기사/검색, G06 양식 상세/형식, G10 가입 인계 수신, G11 로그인. 링크 연결만 했고 해당 화면을 구현하지 않았다.
- **서버 메모:** 업종 선택의 계정 설정 반영, lead 생성/중복 판정, CRM 관계·권한, 포털 공개 범위, 문서/결제/시간 산식, 실제 가입 후 복귀/영속성·메일·외부 예약은 UX/UI 전체 이후 확인한다. 질문에 답하기 위한 API·DB·HTTP adapter 설계/구현은 없다.
- 원본 자산의 배포 사용 조건은 기존 R01 대기 항목으로 유지한다. 현재는 로컬 비교이며 실제 서비스 출시 검증이 아니다.

## 9. 미리보기 최종 확인 순서

1. `http://127.0.0.1:5173/` → Industries → Consulting. 제목/후기/기능을 보고 이메일에 `invalid` 입력→오류→`consulting@example.test`로 수정→Start free→G10 인계를 확인한다.
2. 브라우저 뒤로 한 번→이메일 유지→다시 제출→Cancel and clear draft→Consulting 복귀/초안 삭제를 확인한다.
3. Product→CRM. FAQ 세 항목을 Tab/Enter/Space로 열고 닫는다. 양식 카드→G06 표시→뒤로, FAQ의 consultants 링크→Consulting→뒤로를 확인한다.
4. CRM 이메일로 가입 인계A→헤더 Industries/Consulting→다른 이메일로 인계B→뒤로 두 번. A 화면에는 CRM의 출처/이메일이 표시돼야 한다. 새로고침하면 인계가 비워진다.
5. 고객군 Small businesses→Book a demo→Tab/Shift+Tab/Escape→같은 버튼 초점. 관련 글→G05→뒤로 원래 스크롤. Next→page2 미확인 안내→새로고침→Previous/back/forward를 확인한다.
6. 익명 Small business를 아래로 스크롤해도 로그인 상태는 바뀌지 않는다. `/login`에서 Continue as Alex→Public→Small businesses에서는 Go to dashboard가 표시된다. 실제 인증은 아니다.
7. 폭390에서 소개·FAQ·메뉴·demo를 확인한다. 모바일 메뉴 닫기, 짧은 높이 스크롤, desktop/mobile 폭 전환 초점을 확인한다.
8. `/components`→Preview controls→Reset preview. normal/guest를 확인하고 공개 화면으로 복귀한다. Network에는 같은 origin 정적 리소스와 dev HMR만 있어야 한다.

G03 결과를 여기서 보고하고 종료한다. G04 및 별도 후속 개발은 시작하지 않는다.

## 10. G04 공통 인계 확장과 회귀 — 2026-11-21

위 1~9절은 G03 당시 실행으로 보존한다. 이후 별도 요청한 [G04 작업](G04_RESULT.md)은 G03 미커밋 코드·자산·캡처를 유지했다. PublicIntent에 sourcePath와 선택 정보를 추가하고 returnTo에 가격 query를 허용했다. G03의 pathname별 이메일·이력별 메모리 snapshot·다른 소개 간 격리·취소/Reset/reload 수명은 유지한다. 소개 본문과 G03 스타일은 수정하지 않았다.

최종 typecheck/lint/build·unit 11/11·dev/build Chromium 각 29/29에서 G03 6시나리오와 공개 인계 시나리오를 다시 실행했다. 소개 간 서로 다른 이메일 이력 격리, 중복 제출/뒤로/취소, FAQ/demo·좁은 화면의 실제 제목/입력/버튼 경계와 G02/G01 회귀가 통과했다. 요청 차단 없이 관찰한 실제 API/외부 요청·요청 실패·console 오류는 0건이다. [G04 검증 기록](evidence/g04/verification-summary.json)에 별도 보관했다. G03 22상태의 시각 동일성을 재판정한 것은 아니다.

Pricing의 Professional services 라벨에 `/software/professional-services` 로컬 후보를 추가했지만 원본 주소/본문은 미확인이다. 기존 33개 목적지 중 3구현/30본문 대기 판정을 소급 변경하지 않는다. G03 page2·다른 소개 전체·시각/환경 대기를 G04에서 완료 처리하지 않았다. 커밋·G05 착수 없음.


## G05 연속 작업의 공통 회귀 — 2026-11-21 KST

기존 관련 글 JSON/ID를 G05와 공유한다. 관련 글 링크에 로컬 출발 이력을 전달하여 기사 경계의 Back to Blog 버튼도 원래 소개의 스크롤로 복귀하게 했다. 미수록 본문·G03 페이지2·다른 소개 전체 대기는 유지한다. 현재 변경에서 dev/build Chromium 전체각33/33이 통과했고 API/외부 요청·요청 실패·console 오류0이다. 이전 시각·원본 동작·환경 대기는 완료로 변경하지 않았다. [G05 검토·검증](G05_RESULT.md).

## 2026-11-21 G06 공통 회귀 기록

[G06](G06_RESULT.md)에서 공개 인계에 템플릿 snapshot을 확장하고, 새 문서 default 이력 키가 다른 경로 스크롤을 복원하는 결함을 pathname+search+key로 수정했다. 기존 이메일/가격·메뉴·상세 복귀를 포함한 전체 dev/build 각38개 통과, 실제 API/외부/실패/console0. G06 마지막 시각 변경은 대상5개씩 추가 통과. 이 결과로 기존 원본·시각·환경 대기를 자동 완료 처리하지 않는다.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G11 공통 회귀 (2026-11-21)

인증 전용 로그인/실제 계정 검증/보호 returnTo 변경 뒤 관련 dev·build26씩 통과. 기존 공개 이력·메뉴·Reset·G01 same-ID/격리·G10 가입을 재검사했다. 이전 원본/시각/환경 대기를 올리지 않는다. [G11](G11_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 최종 공통 회귀 (2026-11-21)

[최종 코드 검증](evidence/g15/final-verification.json)의 전체 개발/빌드82개씩에 기존 기반·공개 메뉴/폼·소개·가격/후기 흐름을 포함했다. G03의 이전 Public 테스트 명칭을 실제 Public site로 바꿨으며 검증을 제거하지 않았다. 기존 원본·시각·환경 대기를 완료 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

이번 공통 수정의 영향을 기존 흐름 회귀로 확인했으며 원본·시각·환경 대기는 유지한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.


<a id="g03-r4-recheck"></a>
## 10. G03 R4 재검토·보완 — 2026-11-23~24 KST

### 10.1 범위·현재 상태·읽은 자료

기준 HEAD `287c426b0a3ae03b09ac7c58fd2279b60184a909`, 착수 작업 트리 clean. G02의 메뉴 초점/같은 경로 재탐색·중복 가입 방지와 기존 사용자 코드를 보존했다. 코드 변경은 G03 관련 글 컴포넌트·소개 CSS·정식 회귀 테스트뿐이다. 별도 evidence/결과/임시 파일·새 캡처는 생성하지 않았다. 원본 PNG·분석 정본·기존 evidence·BE·환경·DB는 변경하지 않았다. 커밋/push/배포·G04/G32 착수 없음.

| 판정 | 적용 범위와 이유 |
| --- | --- |
| 유지 | 세 소개의 hero/본문/후기/정적 목업, 명시적 가상 세션, G01 공급자/Dialog, G02 공개 셸·이메일/가입 CTA. 현재 구현된 G05/G06/G10/G11/G13/G14 인계 유지 |
| 구현 보완 | Small business 페이지 이동의 다른 query 보존, 기사 복귀 URL의 hash 보존, CRM 카드의 대각선 두 모서리 |
| 문서 보완 | 과거 미구현 연결과 현재 구현 구분, 22단계·R4 11항목·공통12기준 대응, 엄격 시각 기준 및 이번 단위/DOM 결과·미검증 구분 |
| 분석/환경 대기 | 원본 공백·정확한 자산/폰트/촬영 조건·전체 요소 계수·시각 동일성, 실제 브라우저 상세/네트워크·OS/기기. 관련 없는 대기를 독립 작업의 차단 조건으로 확대하지 않음 |

연결은 G01 공통 UI/목 상태, G02 셸/CTA, G05 기사 ID/복귀, G06 템플릿 선택/복귀, G10/G11 이메일/취소/이력에 한정했다. G13/G14는 현재 인계 코드·기존 결과의 관련 부분을 읽었고 새 온보딩 전 과정 검증으로 올리지 않았다. 연결 Goal의 본문 전체·R01 전체·새 업무 기능은 제외했다.

**전체 읽기:** AGENT README, PM036·UX025, FRONT README/ENGINEERING_REVIEW_CHECKLIST와 적용 아키텍처·상태/목·컴포넌트·접근성·한글 주석·테스트 문서, 결정006/005, SOURCE_ANALYSIS_STANDARD, 세 ANALYSIS, G03 명세/기존 결과, START/UXUI/PUBLIC-WEB, R01 명세. **관련 부분 읽기:** SOURCE_ANALYSIS_REVIEW의 방법·한계, 계획 README/순서/목 상태/USER-FLOW/대응표/행동표/IMPACT/확장 대기표/PLAN-INDEX, G00 재검토·추가 점검·인계, G01/G02 현재 재검토와 과거 결과, R01 결과의 G03·후속 연결, G01_G15 재점검, G01/G02/G05/G06/G10/G11/G13/G14 명세·결과의 소비·수용 기준. 계획 전체·R 상세 전체를 읽었다고 주장하지 않는다. 적용 경로의 AGENTS는 발견하지 못했고 README가 가리키는 AGENT_USAGE_RULES.md는 없었다.

### 10.2 원본 22단계와 코드 대응

저장된 `bonsai-web / Latest / 2146` 카탈로그와 현재 색인/세 ANALYSIS를 사용했다. 이번 MCP·공식 웹·보관본 신규 조회는 없음. 아래 **22 PNG를 모두 직접 열람**했고 파일 해시/ID/단계 소유 검사는 별도로 수행했다. 134흐름/754단계 전수 이미지 검토나 정밀 요소 전수 계수는 아니다.

- F064 Freelancers: Flow ID `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54`, 01~04, 실제 제목 Small business.
- F067 Industries (Consulting): `7fcadde8-35c9-4b36-9c76-ec2d4432f20e`, 01~08.
- F091 Products (CRM): `12ca870d-d929-4cc8-ab4c-60436c2eac13`, 01~10.
- 원본 크기 전부 2880×1800. 저장된 MCP 1440×900 메타데이터는 CSS viewport/DPR을 확정하지 않는다. 직접 열람 도구의 표시 축척은 미계측, 이번 구현 브라우저 viewport/DPR/배율·스크롤 비교는 미실행. 신규 캡처/픽셀 비교 축척은 N/A. 원본의 각 스크롤 상태는 아래 관찰대로 구분했다.

코드 기준은 [소개 페이지](../../../FE/user-web/src/pages/introduction/index.tsx), [hero](../../../FE/user-web/src/features/public-introduction/components/introduction-hero.tsx), [본문](../../../FE/user-web/src/features/public-introduction/components/introduction-sections.tsx), [CRM/FAQ](../../../FE/user-web/src/features/public-introduction/components/crm-resources.tsx), [관련 글](../../../FE/user-web/src/features/public-introduction/components/related-articles.tsx), [소개 스타일](../../../FE/user-web/src/styles/public-introduction.css)이다. 아래 이름은 요소군 대응이며 작은 제어까지 ID를 부여한 전수 명세가 아니다. 해시는 SHA-256 앞12자리 표시이고 검사는 전체64자리로 수행했다.

| 단계 | Screen ID·원본 경로 | SHA-256 | 직접 열람한 주요 요소·코드 대응 |
| --- | --- | --- | --- |
| F064 01 | [sc_bfa0b33d9265420d8ee7dc4403432d86](<../../../bonsai_analysis/flows/Freelancers/screens/01_sc_bfa0b33d9265420d8ee7dc4403432d86.png>) | `35a9c5eb4a3b` | Small business hero·인물·잎·수금/폼 배지·평점 → IntroductionHero |
| F064 02 | [sc_d84e927c4d784ac4aa7758d247026c9a](<../../../bonsai_analysis/flows/Freelancers/screens/02_sc_d84e927c4d784ac4aa7758d247026c9a.png>) | `4f7dc285ec8f` | Kimberly 후기·계약 목업 → IntroductionTestimonial/IntroductionBanners |
| F064 03 | [sc_1ee835c6516e4e7eb88872fb06dbc3b3](<../../../bonsai_analysis/flows/Freelancers/screens/03_sc_1ee835c6516e4e7eb88872fb06dbc3b3.png>) | `7e92039b0351` | 관련 글 앞부분·3열·헤더 가상 세션 구분 → RelatedArticles/PublicHeader |
| F064 04 | [sc_3487023dac064b8c8d2ad37168c4de69](<../../../bonsai_analysis/flows/Freelancers/screens/04_sc_3487023dac064b8c8d2ad37168c4de69.png>) | `d12dee2545f6` | 관련 글 나머지·저자 누락·넓은 Next·1/2 → RelatedArticles |
| F067 01 | [sc_b71347cc8821454593507a2b9cb4a512](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/01_sc_b71347cc8821454593507a2b9cb4a512.png>) | `82f14d2befb7` | 4열 Industries 메뉴·배경 랜딩 hero → PublicHeader |
| F067 02 | [sc_18d96f6f4370489881038eb5fd0ce939](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/02_sc_18d96f6f4370489881038eb5fd0ce939.png>) | `e49fd352823b` | Consulting hero·둥근 이메일/CTA·인물/배지 → IntroductionHero |
| F067 03 | [sc_17109313d7c7495696383774136ec3d5](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/03_sc_17109313d7c7495696383774136ec3d5.png>) | `d33fc8981a9e` | 브라우저 틀·정적 dashboard → IntroductionOverview |
| F067 04 | [sc_52e04cf0980e4d4fa09fd9ebf5030aad](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/04_sc_52e04cf0980e4d4fa09fd9ebf5030aad.png>) | `0c890693c5d9` | 6기능·Task management 문구/Time tracking 반복 유지 → IntroductionOverview |
| F067 05 | [sc_e334305ace2d4dd7af619fbd99c79394](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/05_sc_e334305ace2d4dd7af619fbd99c79394.png>) | `bad09b237911` | Alison 인물·후기 → IntroductionTestimonial |
| F067 06 | [sc_aefad7c41b8744a4a130c333ea3281ef](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/06_sc_aefad7c41b8744a4a130c333ea3281ef.png>) | `f1d448b7cbab` | 청구 목업·외부 Get started → IntroductionBanners |
| F067 07 | [sc_7fd1d40a6eba4e6ab8f3f7935b66a130](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/07_sc_7fd1d40a6eba4e6ab8f3f7935b66a130.png>) | `705287684601` | 포털 목업·외부 Get started → IntroductionBanners |
| F067 08 | [sc_3df44f1b73064a85abb348c9b25eb6f2](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/08_sc_3df44f1b73064a85abb348c9b25eb6f2.png>) | `4541c8d67607` | 재무/시간 홍보 카드 → IntroductionTiles |
| F091 01 | [sc_2ce9fd14ccb74e05977de48b5517e78c](<../../../bonsai_analysis/flows/Products (CRM)/screens/01_sc_2ce9fd14ccb74e05977de48b5517e78c.png>) | `779b464d282d` | 3기능 열+What’s new·배경 랜딩 hero → PublicHeader |
| F091 02 | [sc_e887bc9463cc451fa88f9aef731b6eb3](<../../../bonsai_analysis/flows/Products (CRM)/screens/02_sc_e887bc9463cc451fa88f9aef731b6eb3.png>) | `3889ce4d3b2c` | CRM hero·이메일·프로젝트 목업 → IntroductionHero |
| F091 03 | [sc_4d7838a172d243b78e7c5e6f4fc9ffc9](<../../../bonsai_analysis/flows/Products (CRM)/screens/03_sc_4d7838a172d243b78e7c5e6f4fc9ffc9.png>) | `b4b363505923` | 3기능 카드 → IntroductionOverview |
| F091 04 | [sc_bad21b14523b490288c7037d79ba03cd](<../../../bonsai_analysis/flows/Products (CRM)/screens/04_sc_bad21b14523b490288c7037d79ba03cd.png>) | `2c77800b334e` | 고객·프로젝트 정적 목업 → IntroductionBanners |
| F091 05 | [sc_d8a62347ff844766bc5b8997d289ba3c](<../../../bonsai_analysis/flows/Products (CRM)/screens/05_sc_d8a62347ff844766bc5b8997d289ba3c.png>) | `3286d336c2e0` | Mary 후기·양식 첫 행 → IntroductionTestimonial/CrmTemplates |
| F091 06 | [sc_f2fd8490cf4d40d1b0c1ff5a104ce501](<../../../bonsai_analysis/flows/Products (CRM)/screens/06_sc_f2fd8490cf4d40d1b0c1ff5a104ce501.png>) | `b7e6d1d565cd` | 12양식·4×3·Forms 아이콘·원형 화살표·대각선 radius → CrmTemplates |
| F091 07 | [sc_e2fae02b9bf14ab6be504f53c3e490fb](<../../../bonsai_analysis/flows/Products (CRM)/screens/07_sc_e2fae02b9bf14ab6be504f53c3e490fb.png>) | `0787fc437df7` | View all과 가입 안내 분리 → CrmTemplates |
| F091 08 | [sc_ac8d0e2583ea436ca9ce2ec0c94b4857](<../../../bonsai_analysis/flows/Products (CRM)/screens/08_sc_ac8d0e2583ea436ca9ce2ec0c94b4857.png>) | `909150de9b65` | Time/Task 소개 카드·View more → IntroductionTiles |
| F091 09 | [sc_69e9686880f0449d86954e385ec98c11](<../../../bonsai_analysis/flows/Products (CRM)/screens/09_sc_69e9686880f0449d86954e385ec98c11.png>) | `9d3e9f60c1ab` | FAQ 닫힘·잎/공통 footer → CrmFaq/PublicFooter |
| F091 10 | [sc_a3545f7a7e324b7299d14f07150f6978](<../../../bonsai_analysis/flows/Products (CRM)/screens/10_sc_a3545f7a7e324b7299d14f07150f6978.png>) | `c62e9abf9bd8` | FAQ 첫 행 열림·위 화살표·뒤 질문 위치 → CrmFaq |

**버전/보완:** 기존 G03 2절의 CRM 2024-01-18 08:28:30(FAQ2/3·자산), Consulting 08:28:17(계약 등 생략 본문), Small business 2024-02-03 20:57:45(생략 본문), 2024-04-06 19:15:23 및 2~3월 개별 기사(이미지·저자·slug) 채택 이력과 현재 정적 데이터를 대조했다. 해당 외부 보관본 자체를 이번에 다시 조회하지 않았다. 원본에 보이는 12기사 순서·저자 없는 항목을 유지하며 보관본17개 목록을 page2에 이식하지 않았다. 소개 자산의 기존 출처 기록과 사용 위치를 확인했지만 모든 파일의 원본 변형/crop·사용 조건이 재확정된 것은 아니다.

**관찰:** 메뉴 열림 장면, 원본 제목·문구 불일치, 정적 목업, FAQ09닫힘→10첫 행 열림. **측정:** 파일 크기/해시·코드 구조/목록 수. **추정:** PNG만으로 실제 CSS 크기·DPR·폰트 raster를 추정해 확정하지 않음. **목 가정:** FAQ 초기 닫힘/단일 열림/재진입 초기화, 키보드·demo 로컬 안내, pathname 초안·history intent·취소, query/hash 보존과 스크롤 복귀. **미확인:** 캡처 간 실제 조작·시간·로그인 원인·모바일·업무 정책. FAQ2/3 답변은 보관본 보완이며 원본 관찰이 아니다.

### 10.3 R4 11항목·공통 12기준 판정

| R4 항목 | 판정·근거·수용 기준 |
| --- | --- |
| F064-O01 | 비교 완료·유지: Small business 제목·인물/잎/배지/평점 요소군. Freelancers로 제목을 바꾸지 않음. 정확 자산/시각은 대기 |
| F064-O02 | 비교 완료·구현 보완: 후기/정적 계약/12기사/3열/넓은 Next 유지. query/hash 손실 보완. 스크롤이 로그인 상태를 바꾸지 않는 DOM 회귀 |
| F064-A01 | 분석 대기: 생략 본문·page2·세션 변화 원인·자산 변형은 G03/R01. 보관본은 부분 보완일 뿐 전체 원본 증명 아님 |
| F067-O01 | 비교 완료·유지: 4열 Industries와 배경 랜딩 hero, Consulting 이메일+Start free 둥근 영역. 메뉴 소비는 G02 회귀 포함 |
| F067-O02 | 비교 완료·유지: 목업 내부 버튼/차트/입력은 이미지, 외부 CTA만 실제 제어. 잎/등고선/브라우저 틀은 정밀 시각 대기 |
| F067-O03 | 비교 완료·유지: Task management 아래 recurring invoicing·Time tracking 두 번을 그대로 유지, DOM 확인 |
| F067-A01 | 분석 대기: 원본 메뉴 진입/닫힘·CTA 후속·생략 구간·정확 자산은 G03/R01 및 G02 공통 의존 |
| F091-O01 | 비교 완료·유지: Product 3기능 열+What's new, 소개 목업과 실제 CTA 분리. 실제 Clients/Deals 근거로 확대하지 않음 |
| F091-O02 | 비교 완료·구현 보완: 12양식 4×3·Forms/원형 화살표·별도 View all/가입 안내 유지. 대각선 모서리로 수정. 기존 30px는 이번 원본 측정값이 아님 |
| F091-O03 | 비교 완료·유지: FAQ 닫힘/첫 열림과 접근성 연결, 다른 페이지 FAQ와 통일하지 않음. 실제 화살표/밀림의 시각 동일성은 대기 |
| F091-A01 | 분석 대기: 정확 자산/텍스트 정밀 전사·FAQ 원본2/3·단일/복수 펼침 정책은 G03/R01. 기존 보완 자료/목 가정 구분 |

| 공통 기준 | 이번 적용 결과·남은 담당 |
| --- | --- |
| C01 원본 식별 | 3분석/22PNG 전체 해시·ID·경로·소유 일치; 촬영 조건 G03/R01·공통 G01 대기 |
| C02 전체 구성 | 세 페이지 셸/메뉴/본문/FAQ/demo 요소군 대조; 정밀 겹침·좁은 화면 G03/G02 대기 |
| C03 요소 목록 | 22단계 주요 요소군 연결; 전체 요소 ID/계수 G03/R01 대기, census=false 유지 |
| C04 정확한 표시 | 제목·원문 불일치·12기사/양식·FAQ 출처 확인; 모든 줄바꿈/잘림/미세 전사 G03/R01 대기 |
| C05 배치 | PNG와 CSS 조건 분리·3열/4×3/넓은 Next 코드 확인; 렌더 좌표·스크롤·viewport/DPR G03 대기 |
| C06 글자 | 기존 Gellix/보관본 이력 유지; 원본의 정확 family 변형·weight·행간/자간/raster G03/R01·공통 G01 대기 |
| C07 색·장식 | 대각선 radius 보완; 색값·shadow·정밀 모서리 수치/시각 동일성 G03 대기 |
| C08 자산 | 기존 사진/목업/잎/썸네일 로컬 사용 확인; 원본과의 정확 crop/변형/사용 조건 G03/R01 대기 |
| C09 상태 | FAQ·초안/오류·page2 빈 안내·demo cancel DOM 검증; 실제 hover/키보드/모바일 원본 G03/G02/R01 대기 |
| C10 전환 | 실제 router/history DOM의 query/hash·기사/양식/인증 왕복; 브라우저 스크롤/새탭·원본 전환 G03 및 소비 G 대기 |
| C11 입력·저장 | pathname별 초안/이력별 intent·오류 수정/이전 취소 격리 검증. 새로고침은 메모리 초기화 정책, 실제 reload 미검증. 서버 정책 R02 후속 |
| C12 다른 화면 | G05 slug·G06 선택·G10/G11 인계 회귀, G13/G14 코드 인계 확인; 연결 G 전체 완료 아님 |

어떤 공통 기준도 프로젝트 전체 완료로 올리지 않는다. 작은 폰트·크기·픽셀 차이 허용은 이번 기준에서 폐기하고 과거 결과만 보존한다. 새 캡처 금지로 픽셀 비교를 수행하지 않았으며 DOM/육안 대조를 시각 동일성 통과로 표시하지 않는다.

### 10.4 결함 수정·상태·연결 검토

1. `RelatedArticles`: `?contentPage=...` 재생성으로 다른 query가 사라졌다. 현재 URLSearchParams를 복사하여 페이지 키만 바꾼다. `entry=menu` + 뒤로/앞으로/Previous 회귀로 확인.
2. 같은 컴포넌트의 `articleReturnTo`에 hash가 없었다. pathname+search+hash를 보존해 G05 Back 링크와 실제 history 왕복이 같은 URL로 돌아오게 했다. articleFromKey와 기존 스크롤 저장 책임은 유지한다.
3. `.intro-template-card`: 세 모서리 radius `0 30px 30px`를 대각선 두 모서리 `0 30px`로 보완했다. 원본 형태 관찰에 따른 수정이며 현재 30px의 픽셀 정확성 인증은 아니다.
4. [정식 회귀 테스트](../../../FE/user-web/src/app/router/introduction-entry.test.tsx) 7개 추가. 실제 App/provider/router/history를 사용한다. jsdom에 없는 scroll/IntersectionObserver/matchMedia/native dialog 메서드만 대체하고 원래 descriptor·DOM·공급자 상태를 정리한다. navigation mock은 없다.

기존 G05 기사 상세/목록, G06 양식 상세/카탈로그, G10 가입·G11 로그인, G13 사업 설정·G14 앱/공개 복귀는 구현되어 있다. 3절의 ‘미구현’은 당시 이력이다. 새 테스트는 G05 첫 기사 URL/복귀, CRM 첫 Tax intake form의 G06 상세→Get template→G10 선택 표시→취소/뒤로, 별도 `/templates/forms`와 직접 `/signup`, CRM/Consulting 이메일의 G10→G11 왕복·이전 intent 취소·다른 초안 유지까지 수행했다. G13/G14 전체 실행을 이번 검사로 주장하지 않는다.

메뉴의 G03 소유 `publicDestinations`를 현재 코드를 메모리에서 실행해 재집계: **33개=구현3+미수록본문30**. G04에서 별도 도입한 `/software/professional-services`는 메뉴33에 포함되지 않는 로컬 후보1개다. 이를 합친 알려진 G03 후보는34/본문대기31이며 과거33/30을 소급 변경하지 않는다. 이 미수록 본문과 page2를 임의 구현하지 않았다.

동기적인 FAQ·pagination·demo는 저장 요청/pending/늦은 응답 N/A(로컬 UI, 요청 없음). 이메일 검증 실패 후 수정·중복 CTA는 기존 공통 테스트와 신규 테스트로 확인했다. 실제 가입 저장 실패/늦은 응답은 G10 목 저장소 기존 단위 검사를 전체 suite에서 회귀했으나 G03 브라우저 경로로 새로 검증한 것은 아니다. 소개 광고의 금액·차트·권한·자동화 문구를 업무 계산/정책으로 사용하지 않는다.

### 10.5 실제 명령·검증 결과·제약

작업 디렉터리 `FE/user-web`, Node24.10.0(`/opt/homebrew/opt/node@24/bin/node`). package 요구 Node>=24<25/pnpm8.14.1; 기본 Node22/pnpm10을 요구 버전으로 간주하지 않고 기존 Node24의 로컬 도구를 직접 실행했다. 설치·환경 파일 변경 없음. 실행 전 Vite/Vitest/Playwright 설정과 cache/report 동작을 읽었다.

| 검사 | 이번 결과 |
| --- | --- |
| 새 회귀 수정 전 | 7중5통과/2실패: query 손실과 기사 Back href hash 손실 실제 재현 |
| 수정 후 대상 3파일 첫 실행 | 20/21. 기사 history URL 변경 후 React commit 대기를 빠뜨린 테스트 타이밍1건을 popstate+act 대기로 보완. 제품 navigation을 대체하지 않음 |
| 최종 전체 unit/DOM | **26파일121/121 통과**, 73.17초. 신규 G03 7개·G02 공개 진입8/헤더6 포함. jsdom이며 실제 브라우저 아님 |
| 타입 | Node24 `node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false` 및 node 설정 각각 exit0 |
| lint | Node24 `node_modules/eslint/bin/eslint.js . --no-cache` exit0 |
| build | Vite API `configFile:false`, React plugin/동일 alias, PostCSS에 기존 tailwind config+autoprefixer를 메모리 전달, `build:{write:false,copyPublicDir:false,sourcemap:false,reportCompressedSize:false}`. 1966모듈, 최종3.59초 통과; 파일 출력 없음 |
| 미리보기 | 기존5173 G02 메모리 서버(PID64811)를 수정 번들 메모리 서버(PID94330)로 갱신, 같은주소/포트·HMR없음 유지. 중간 HTTP 검사에서 `/` fallback404를 발견해 메모리 handler를 바로 수정/재검증(제품 파일/설정 변경 없음) |
| HTTP 확인 | `/`, 세소개, page2 직접 URL, JS/CSS 모두200. JS `index-BE8q_uPE.js`, CSS `index-CEY-mXq2.css`; 수정 CSS 및 `X-Preview-Revision:G03-287c426b-working-tree-20261124` 확인. 정적 응답 검사는 브라우저 렌더/동작 검증이 아님 |
| 원본 무결성 | 3 ANALYSIS의 저장 해시, 22 PNG의 전체 SHA-256/크기·ID·경로·G03 단계 배정 일치 |
| 실제 브라우저 | 기존 Chrome9333 메타데이터 조회 이후 연결이 종료되어 첫 제어 전 localhost ECONNREFUSED. 새 탭/조작 미수행. 새 프로필/자동 산출물을 만들지 않도록 재실행/환경 변경하지 않음 |
| console/네트워크 | 브라우저 요청 관찰 미수행. 실제 API 요청·실패·console 오류는 **미측정(null)**. 코드/DOM/HTTP200으로0건을 단정하지 않음 |
| 픽셀/기기/IME | 새 캡처·비교 금지로 픽셀 검사 미실행. 실제 OS IME·기기·브라우저 확대/AT/Safari/Firefox도 미실행. 긴 한국어 DOM 입력과 기존 합성 composition 회귀를 구분 |

Vitest 실행은 stdin ESM의 `startVitest('test', [], options, viteOptions)`로 수행: `config:false/run:true/cache:false/pool:'threads'/execArgv:[]/maxWorkers:2/environment:'jsdom'/include:['src/**/*.test.{ts,tsx}']/setupFiles:['./vitest.setup.ts']/reporters:['default']/coverage.enabled:false/experimental.fsModuleCache:false/deps.optimizer.client.enabled:false/ssr.enabled:false`. Vite측 `configFile:false`, React/alias, `optimizeDeps:{noDiscovery:true,include:[]}`, `server.watch:null`. 종료시 `ctx.close()`. Node compile cache와 Jiti cache는 `NODE_DISABLE_COMPILE_CACHE=1 JITI_CACHE=false JITI_FS_CACHE=false`로 끈다. 기본 tsc -b/Vite CLI/Playwright 명령은 임시 bundle/tsbuildinfo/증거/프로필 산출 위험 때문에 그대로 실행하지 않았다. Browserslist 오래된 데이터 경고만 있었고 업데이트하지 않았다.

### 10.6 적용 규칙·공통 체크리스트와 미완료

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)를 수정 범위에 적용했다. 아래 체크는 해당 범위에 한정한다.

- [x] 범위/출처: 결정006 우선, 22PNG 관찰·기존 보관본 이력·목 가정/미확인 분리(10.1~10.3). 기존 결과를 이번 E2E로 재사용하지 않음.
- [x] 구조/컴포넌트: `RelatedArticles`가 query/기사 인계, G05가 상세 복귀, 공통 provider가 이메일/intent 책임. 새 의존성·adapter·공통 재구성 없음. 다른 앱 import/새 순환 의존 없음.
- [x] 데이터/목: ID/slug·template snapshot·경로별 초안/취소 범위 유지. 메모리 수명/가상 표시와 실제 API 분리. 생성/삭제·회계 합계·새 권한 모델은 N/A(정적 소개).
- [x] 상태: 단일 URL 페이지 상태·FAQ 로컬 상태·native Dialog 재사용. 의도치 않은 query/hash 소실 보완. 비동기 요청/캐시 무효화·저장 경쟁은 수정 컴포넌트에 N/A. 연결 인증은 기존 목 회귀만 수행.
- [x] 주석/품질: 수정 컴포넌트·테스트 helper에 한글 책임 주석, descriptor/DOM 정리, 타입/lint 통과. query/hash에 새 개인정보를 추가하지 않음. 성능용 새 캐시/최적화는 N/A(결함 근거 없음).
- [x] DOM 접근성: 페이지 제목 초점·FAQ aria-controls/labelledby·단일 열림·demo cancel/close 후 초점 및 overflow 복귀 확인.
- [ ] 실제 접근성/사용성: demo Tab/Shift+Tab/Escape·배경 inert/스크롤, FAQ Enter/Space·초점·밀림, 새 탭/새로고침/실제 스크롤·좁은폭/짧은높이/폭전환/확대/IME/기기/AT는 G03(공통 G01/G02), G84 환경 회귀 담당.
- [x] 검증/인계: 현재121개·타입/lint/메모리build와 미실행 이유 기록. Admin·운영권한·실연동·배포 gate는 N/A. 문서 링크/JSON/단계/체크 상태 최종 검사는 아래에 기록.
- [ ] 엄격한 시각 동일성/원본 누락 해소: G03/R01, 공통 자산/촬영 조건은 G01/G02 실제 의존 부분. 전체 요소 census/폰트·색·crop·기하/모바일 원본·관련 글 page2·본문대기31은 미완료.
- [ ] 실제 브라우저 연결 시나리오/네트워크: G03 중심으로 G05/G06/G10/G11 인계, 필요한 G13/G14 왕복 재검증. 관찰되지 않은 원본 인증/demo/FAQ 정책은 R01/R02. 서버 예약/발송/CRM 계산·권한은 후속 담당 G/R 메모이며 이번 구현 대상 아님.

G01/G02 공통 코드의 추가 수정 필요 결함은 이번 범위에서 찾지 못했다. 공통 소비의 실제 브라우저·시각/환경 대기는 그대로다. 전체 G03/R01 완료나 연결 Goal 전체 완료로 표시하지 않는다.

### 10.7 직접 확인 순서

미리보기 **http://127.0.0.1:5173/**, 메모리 production 번들/HMR 없음. 이후 소스 변경 시 자동 반영되지 않는다.

1. `/software/small-businesses?entry=menu&contentPage=1#related-content` → 기사 → Back to content → Next → Previous → 브라우저 뒤로/앞으로. query/hash와 목록 상태 확인. page2는 미수록 안내가 정상이다.
2. `/crm` 이메일 입력 → Start free → Log in → 뒤로 → 취소. `/software/consulting`에 입력해 둔 별도 초안과 섞이지 않는지 확인.
3. CRM 양식 첫 카드 → Tax intake form → Get template → 가입 선택 표시 → 취소/뒤로로 CRM 복귀. View all과 하단 가입 CTA의 서로 다른 목적지도 확인.
4. CRM FAQ 첫 질문 열기/닫기·다른 질문 선택. Small business의 Book a demo 열기 → Tab/Shift+Tab/Escape/닫기와 초점 복귀 확인. 실제 예약/메일은 발생하지 않아야 한다.
5. 공개 메뉴에서 현재 소개를 재선택해 닫힘/본문 초점을 확인하고, 좁은 폭/짧은 높이/확대와 새로고침/새탭도 확인. DevTools console/network에서 실패 요청까지 관찰한다. 이 수동 순서는 이번에 수행 완료한 검증 목록이 아니다.


### 10.8 종료 전 정합성·누락 재점검

- 170개 계획 Markdown의 로컬 링크6280회·앵커1586회와 새로 바뀐 JSON 문서 참조41회를 검사했다. **새 링크/앵커/JSON 참조 오류0**. 기존부터 없던 링크222회는 Git HEAD의 같은 참조임을 구분했고 복원하거나 이번 근거로 사용하지 않았다.
- JSON 중복 키 없음. 85G/22R/134흐름·754단계/642고유Screen·455R4메모/공통12기준 및 선행 DAG를 검증했다. 기존 execution_order·Flow ID/단계 소유·선행·R 소비·원본 메모 해시·과거 verification 수치는 HEAD와 동일하다. 다른 R4 항목444개는 변경하지 않았다.
- 관련 글12개의 ID/slug 유일성과 G05가 같은 객체를 소비함을 확인했다. CRM12카드는 G06 카탈로그의 정확히 한 경로/제목에 연결된다. 카드 표시 키 `tax-intake-form`과 G06 선택 객체 ID `form-template--tax-intake-form`은 역할이 다르며 인계에는 기존 G06 snapshot ID를 유지한다. 12카드를 모두 브라우저에서 열어 본 것은 아니다.
- 소개/기사 데이터에서 사용하는 로컬 자산64개가 모두 존재한다. 이는 사용 경로의 파일 존재 검사이며 기존 저장 자산61개 집계나 자산 정밀 동일성 검사와 다르다.
- 메뉴 목적지33과 별도 후보1, 기사/템플릿/가입의 서로 다른 목적지, FAQ/demo 목 정책, query/hash·초안/취소, 공통 소비와 남은 브라우저/시각·원본 질문을 다시 대조했다. 단계별 주요 구성 외 정밀 요소 전수 누락0을 선언하지 않는다.
- `git diff --check` 통과. tracked 수정30개(제품 코드2+기존 계획문서28), 신규 정식 테스트1개만 있다. 원본/FE외 코드/설정/기존 evidence 변경 없음. G03 기존 결과 본문과 과거 완료 체크를 보존했다.
- 알려진 자동 산출 경로 `.vite`/`.vite-temp`/`dist`/`test-results`/`playwright-report`의 최신 수정은 모두 이번 작업 전(11월22일 이전)이다. `.cache`와 계획 `RESULTS/evidence`는 현재 없다. 이번 생성/수정 파일에는 금지된 산출물이 없으며 기존 파일을 정리/삭제하지 않았다.

갱신 문서: 계획/COMMON README, G03 및 연결 G01/G02/G05/G06/G10/G11 명세, R01 명세/결과, 기존 G03 결과와 G02 재검토/G05/G06/G10/G11 결과의 해당 연결 메모, GOAL-WORK-ORDER·START·UXUI·PUBLIC-WEB·MOCK-UI-STATE·USER-FLOW·FLOW-GOAL-MATRIX·FLOW-BEHAVIOR-REVIEW·SOURCE-ANALYSIS-IMPACT·EXPANSION-BACKLOG·PLAN-INDEX. 수행 항목만 체크했고 원본/픽셀/실브라우저·환경·미수록은 미완료로 남겼다.

## G04 소비 연결 확인 — 2026-11-24 KST

[G04 현재 결과](G04_RESULT.md#g04-r4-recheck). 가격 고객군/Tax/Professional services의 구현/미수록 경계와 CRM 공통 입력·초안 보존을 확인했다. 기존 query/hash·CRM 카드 모서리 회귀7개는 전체 테스트에 포함되며 세 소개 전체 R4 재검토는 이번 범위가 아니다. 기존 결과·체크와 이 Goal 전체의 잔여는 보존한다.
