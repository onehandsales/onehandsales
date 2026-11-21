# G08 도움말·기사·문의 실행 결과

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
