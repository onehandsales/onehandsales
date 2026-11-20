# G03 — 고객군·업종·CRM 소개 실행 결과

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
