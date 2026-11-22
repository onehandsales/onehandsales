# G28 — 상태 정의·완료 표시 실행 결과

상태: 관찰 범위 목 구현·두 차례 검토·시각 비교·현재 회귀 검증 수행. 자료·시각·환경 대기는 별도이며 실제 서비스 완료가 아니다.

## 기준과 범위

2026-11-22 KST. 시작 HEAD `44104184`, 작업 트리는 깨끗했다. 기존 5173 PID59363을 보존했다. 적용되는 별도 AGENTS는 없었고 AGENT/README, FRONT_AGENT README·아키텍처/상태/컴포넌트/목 개발/접근성/한글 주석/테스트/엔지니어링 검토 및 Decision006을 적용했다. AGENT/AGENT_USAGE_RULES.md는 현재 없으며 AGENT/README와006을 적용했다. 과거 실제 인증/API와 Backend 우선 규칙은 이번 사용자 지시와006으로 대체했다. G01·G24~G27의 실제 작업/하위/댓글/시간 참조를 재사용했다. G28과 무관한 과거 자료·시각·환경 대기를 완료 처리하지 않았다.

R06의 이번 소비 분석은 [R06_RESULT](R06_RESULT.md)의 2026-11-22 추가 절에 있다. G29 근거도 먼저 조사했지만 G29 실행 코드는 G28 커밋 뒤 별도로 작성한다. R06 전체 완료가 아니다.

## 직접 확인한 원본

App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, slug `bonsai-web`. 이번 `get_app`으로 카탈로그 Latest/2146·642 screens를 재확인했다. 촬영일·서비스 빌드·DPR은 미확인이다. 첫 MCP4플로우 조회는 OAuth metadata HTTP 오류로 실패했고 재조회에서 G28 2플로우8화면 및 G29 2플로우7화면의 ID/순서/URL을 확인했다. 실제 계정이나 서비스 요청은 실행하지 않았다.

| Flow | 직접 확인한 Screen ID (순서) |
| --- | --- |
| Editing status settings `9dcc612c-ab47-4cc3-a2bb-1c434c7da582` | `sc_92611ceaf06340ae99ed8df9b666d850`, `sc_893799aa095540a68b4d739c0eebeb7d`, `sc_9fa72c1143e148d08f1013b91bb7248f`, `sc_8b0fe4d121a94ab596c14f3a58477a40`, `sc_7812844d48494c668fcbd1c2448f8ba4`, `sc_cd0b582b70d34ff5ab146bbd401e4b77` |
| Dashboard/Marking a task as complete `4b420645-a17a-4219-9699-5f8081649f02` | `sc_a70d94958b66445688536ef9e7765bad`, `sc_843518d096bf492db76fa8528864a694` |

두 경로의 ANALYSIS와 실제 PNG8장을 직접 보았다. 상태 메뉴3개/Settings, 이름 입력/8색/그립/Add Status/Done 구분선, 보라색→주황색·성공 안내, 체크·취소선·행 유지가 관찰 사실이다. 완료 캡처의 동시 시간 증가를 자동 결과로 만들지 않았다. 추가 status 검색은 작업 상태 설정과 별도 프로젝트 상태만 반환했고 새 상태/삭제 결과를 확보하지 못했다.

## 구현·목 정책·수명

- `TaskStatusPicker`는 개별 상태, `TaskStatusSettingsDialog`는 이름·색·순서, `DashboardTasks`는 같은 ID의 완료 표시, `useTaskMutation`은 pending/취소/실패, TaskStore는 저장·접근·revision을 맡는다. 새 의존성/HTTP adapter/Backend/DB 변경은 없다.
- 기존 문자열 ID To Do/In Progress/Done을 유지하고 표시명/색/순서를 별도 workspace 저장 원본으로 분리했다. Done의 이름을 Finished로 바꿔도 완료 집계 의미는 Done ID다. 과거 활동에는 당시 표시명 snapshot을 저장한다.
- 같은 workspace 소유자만 정의 변경, 접근 허용 멤버는 작업 상태 변경이 가능한 목 정책이다. 실제 Bonsai 권한/계정·팀·프로젝트 공유 범위는 미확인이다.
- 이름 trim1~40자·대소문자 무시 중복 금지, Enter/행 밖 blur 저장, 색 선택 즉시 저장, 일반2상태 그립/Alt+방향키/드래그 재정렬, Done 마지막 고정은 명시적 목 가정이다. 정확한 팔레트 hex는 시각 추정값이다. Add Status는 미제공 안내·닫기·초점 복귀까지만 제공하며 임의 생성/삭제를 구현하지 않았다.
- 입력 초안과 저장 revision을 분리한다. 실패는 초안 유지/재시도, 충돌은 사용자 Reload, 닫기/이력 이탈/계정·workspace 전환은 요청 취소·미저장 폐기, 저장 성공은 유지한다. 조합 중 Enter를 무시한다.
- 전체 작업/프로젝트 보드/필터/작업 패널은 같은 정의와 ID, 개요 완료 집계와 Dashboard는 같은 TaskStore를 사용한다. 완료 행은 남고 취소선이 생긴다. 완료 취소→To Do는 목 정책이다. 하위 작업·댓글·시간/금액을 변경하지 않는다.
- Dashboard의 작업 영역만 연결했다. 전체 재무/시간/활동 대시보드는 G72 범위로 남긴다. 원본의 두 역사적 작업을 새 seed로 복제하지 않고 기존3개 canonical 작업을 사용한다.
- 같은 탭 로그아웃/재로그인 시 저장 유지, 새로고침/새 탭/Reset 시 인증·원본 초기화다. 실패/느린 응답/중복/취소/오래된 revision/배정 밖 접근을 저장 전 검사한다.

## 검토와 발견 사항

1차 검토: 정의와 Task 상태의 책임 분리, 고정 ID/완료 의미, 과거 활동, workspace 권한, 부모/하위/댓글/시간 보존을 코드·단위·브라우저로 대조했다. 단위 테스트3개를 추가했다.

- 대상 첫 실행11/15 통과·4실패: 이전 native select 검증과 성공 알림 안의 닫기 문자 때문에 선택자가 실패했다. 실제 버튼/옵션과 메시지 span으로 수정했다.
- 다음 실행13/15 통과·2실패: 비동기 완료 저장을 Playwright check가 동기 확인한 시험 문제는 실제 click 후 상태 대기로 수정했다. 재시도 더블클릭은 실제 결함이었다. 오류를 즉시 지워 Retry 버튼이 사라지면서 두 번째 클릭이 backdrop에 닿아 닫혔다. 공통 mutation의 오류는 성공 때 지우고 pending 버튼을 유지해 수정했다.
- 다음 실행14/15 통과·1시간 초과: 좁은 폭·두 번 로그인·이력 시나리오의30초 한도를60초로 조정했다. 최초 실패와 단독/전체 재실행을 합쳐 첫 실행 통과로 쓰지 않는다.
- 좁은 모달에서 성공 안내가 Done을 덮는 배치를 본문 흐름으로 바꿨고 입력 중복 focus ring을 정리했다. Dashboard 직접 진입에도 Task CSS를 명시적으로 불러온다.

2차 검토: 수정 코드·책임 주석·불변 ID/완료 의미/과거 활동·권한/취소/경합·8개 원본 비교를 재검토했다. 개발/빌드 실제 navigation과 관련 기존 흐름을 대조했고 아래 자료·시각·환경 대기를 분리했다. 상세 검토 메모는 `/tmp/onehandsales-g28-g29/G28/review-1.md`, `review-2.md`다.

## 실제 실행과 검증

cwd `FE/user-web`, Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 `corepack pnpm typecheck`, `lint`, `test`, `build`. 현재 타입/lint/build 통과, 단위21파일90/90. 기존 build500kB chunk 경고는 유지한다. 잘못된 루트 cwd에서 실행한 초기 test는 검증으로 계산하지 않았다.

브라우저 명령은 `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g28-g29/G28/{run}.json corepack pnpm exec playwright test --workers=2 --output=/tmp/onehandsales-g28-g29/G28/{run} --reporter=list,json`, 빌드는 `--config=playwright.preview.config.ts`를 추가한다. 개발5175/빌드4175는 기존5173과 분리한다. retries0, navigation/HTTP intercept 없음. 최초 대상 실행은 관련 tasks/subtasks/comments/status 파일을 지정했고 최종 전체 실행은 파일 제한이 없다.

최종 개발·빌드 브라우저 결과는 아래에 구분했다. API·외부·실패 요청과 console/pageerror는 실제 요청 fixture 원문에서 합산한다. 차단한 요청을0건으로 보고하지 않는다.

## 시각 비교와 잔여 차이

- 원본 `bonsai_analysis/flows/Project detail/Adding a task/Editing status settings/screens/`6장, `Dashboard/Marking a task as complete/screens/`2장.
- 임시 경로 `/tmp/onehandsales-g28-g29/G28/`: `source/status-01~06.png`, `source/complete-01~02.png`, `captures/`의 같은 이름8장과 `narrow-palette.png`; `compare/`의8개 비교와 `sheet-0/3/6.png`; `capture.mjs`, `capture-report.json`, 실행별 log/json/trace. 영구 증거 보관이 아니며 `_evidence`는 만들지 않았다.
- 원본2880×1800을 MCP1440×900 기준으로 정규화, 실제 구현1440×900/DPR1 및320×600. 실제 원본 viewport/DPR로 단정하지 않는다. 폰트 준비 후 상태별 캡처, Dashboard는 작업 제목 기준선으로 스크롤을 정렬했다.
- 설정modal400px/상단60px/제목24px·행간32px/헤더96px/본문40px/행320×40px/간격20px, 메뉴/팔레트/구분선·색·radius·그립을 보정했다. 수치는 PNG에 맞춘 추정이며 원본 CSS값이 아니다.
- 남은 차이: Gellix의 정확한 일치 여부·굵기/안티앨리어싱, 팔레트색/아이콘/그림자/blur, 상태03~06의 원본 개요 배경과 구현 작업 패널 배경, 성공 안내 시점/정확한 문구 배치·설정06의 접근성 focus 테두리, 원본 가상 이름·날짜·활동·작업 수와 기존 seed 차이, native checkbox 모양. 미수록 붉은 주석/외부 도움말 위젯은 만들지 않았다.
- 원본 대시보드의 전체 차트/금액/Activity와 구현의 기존 빈 프레임은 G28 전체 재현으로 주장하지 않는다. 완료 작업 행 유지와 같은 ID 상태·시간 불변만 이번에 구현·검증했다.
- 실제 OS 한글 IME·보조기술·Safari/Firefox·실기기·원본 모바일·실제 계정 권한은 미검증. 합성 composition/CSS 확대/Chromium은 이들 검증을 대신하지 않는다. 추가/삭제/Done 제한/공유·영속성·드래그 실제 저장 정책은 후속 질문이다.

## 5173 확인 순서

1. `/app/tasks` → Continue as Alex → Initial Chat 하나 → Task status → Settings.
2. 이름/팔레트 변경 → Enter → 일반 상태 순서 변경 → 닫기. Done 이름을 바꿔도 같은 완료 열/집계인지 확인.
3. 작업 상태 Done → 닫기 → Dashboard에서 동일 작업 체크/취소선/행 유지 → 체크 해제/재완료.
4. Projects → Design Project with Doe Studio → Completed 집계/Tasks → 같은 ID → Time Tracking의 $20.04 유지.
5. Task preview controls의 write-error에서 상태 저장 실패/초안/Retry, slow에서 저장 중 닫기/뒤로 → 늦은 저장 없음. normal 복원.
6. 320폭·키보드·Escape·Add Status 안내·앞뒤 이력·새로고침 초기화. 실제 API는 발생하지 않는다.

G28 커밋 후 승인된 G29만 이어간다. G30/push/배포는 하지 않는다.

5173 최종 캡처: Chromium148.0.7778.96,9장, 실제 요청1881건(API/외부0·실패0·console/pageerror0). 상태06은 저장 뒤 입력에서 Escape로 팔레트를 닫은 상태이며 원본의 닫기 조작을 확인했다는 뜻은 아니다. 실제 modal x520/y60/400×406,320폭 x16/y30/288×492. Dashboard scrollY1300은 해당 작업 제목 정렬을 위한 구현 캡처값이다.

빌드 전체 `build-final`:147/147 통과, skipped0/retries0. 실제 요청6649, API·외부0/실패0/console·pageerror0. 원문 `build-final.json`, 합산 `build-final-summary.json`에 보존한다.

문서 링크 점검: 이번 G28 명세/결과의 새 로컬 연결은 존재한다. 전체 계획의 기계 검색에서 과거 삭제된 `RESULTS/evidence` 등257개 참조의 대상 부재가 보였고, 기존 역사적 경로 표시는 보존했다. 이 수치를 이번 신규 문서의 결함이나 전체 링크 통과로 바꾸지 않으며 요청에 따라 evidence 폴더를 복원하지 않았다.

## 최종 개발 검사·재실행 판정

전체 개발 `dev-final`:140/147 통과·7실패, skipped0. 공개 G08/회사/기반2건/인보이스/랜딩의6건은30초 실행 시간 초과다. 같은 변경 코드의 빌드 전체에서는 모두 통과했다. G28 완료 실패 시나리오1건은 실제 패널이 열리기 전 Escape를 보낸 시험의 준비 상태 누락으로 modal이 클릭을 막았다. enter helper에서 실제 Task details가 보이는 것을 기다리도록 보완했다. URL 변경만으로 화면 준비를 가정하지 않는다.

개발 재실행 `dev-retry`: 위 실패 대상과 G28 전체4개를 workers1/timeout60000으로 실행했다. 같은 줄의 G08 parameterized2개를 포함한11개이며 결과11/11 통과다. 이를 최초 전체147개 통과로 합쳐 쓰지 않는다. 앱 코드는 빌드147/147 검사 이후 변경하지 않았고 마지막 수정은 테스트의 준비 대기뿐이다.

| 실행 | 통과/실패 | 실제 요청 | API·외부 | 실패 요청 | console/pageerror |
| --- | --- | --- | --- | --- | --- |
| 개발 전체 | 140/7 | 493580 | 0 | 0 | 0 |
| 빌드 전체 | 147/0 | 6649 | 0 | 0 | 0 |
| 개발 대상 재실행 | 11/0 | 81171 | 0 | 0 | 0 |

재실행 명령: 위 공통 Playwright 명령에 `tests/e2e/audit-recheck.spec.ts:57 tests/e2e/company.spec.ts:32 tests/e2e/foundation.spec.ts:3 tests/e2e/foundation.spec.ts:139 tests/e2e/invoice-generator.spec.ts:42 tests/e2e/landing.spec.ts:113 tests/e2e/task-status.spec.ts --workers=1 --timeout=60000`. 로그/JSON/trace는 최초·재실행별로 보존했다. 요청 수에 개발 모듈/정적 GET과 HMR이 포함되며 HTTP를 가로채거나 navigation을 mock하지 않았다. 테스트 컨텍스트 종료 또는 normal 복원으로 장애 목 설정을 남기지 않았다.

## 2026-11-22 G29 연결 회귀

[G29 결과](G29_RESULT.md)에서 같은 Task ID의 완료→보관/삭제, 전체·프로젝트·개요·Dashboard 제외와 기록 시간 보존을 대조했다. 하위/댓글/늦은 변경·협업자 접근과 기존 상태 정의를 함께 검증한다. 이번 명령/실패·재실행은 G29 결과에 기록하며 위 과거 검사 수치·미수록/시각/환경 대기를 덮지 않는다.

## 2026-11-22 — G31 템플릿 연결 회귀 추가

[G31 결과](G31_RESULT.md)에서 템플릿 복사 작업을 기존 생성/편집·하위·댓글·상태/완료·보관/삭제 흐름과 함께 검사했다. 단위100/100, 개발 영향57/58 및 빌드 전체160/161의 실패는 새 적용 모달 직접 URL의 hash 복귀 결함이었고 수정 후 연결 대상9/9씩 통과했다. 기존 업무 원본/시간/금액·상태 정의와 템플릿/반복 적용 결과의 독립성을 확인했다. 기존 결과·시각/원본/환경 대기를 덮어 완료 처리하지 않는다.
