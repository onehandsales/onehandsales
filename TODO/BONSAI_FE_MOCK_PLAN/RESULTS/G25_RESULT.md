# G25 — 전체·프로젝트 작업 보드와 생성

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증; 자료·시각·환경 대기. 실제 서비스/연동 완료가 아니다.

## 범위·근거

G24 `63e4468b` 이후 시작, 기존5173과 사용자 변경 보존. FRONT_AGENT/Decision006·공통 명세/엔지니어링 검토를 적용했다. G24 시간 기록의 두 task ID, G17 joined/team/project 관계와 G18 제한 접근을 재사용했다. [R06](R06_RESULT.md)에 먼저 소비 분석을 기록했다.

확인 기준일2026-11-21(호스트 로그21~22), App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. 신규 MCP2flow9screen/ANALYSIS4·5·8절/실제PNG9장 직접 확인. Latest/2146은 G18 조회 재사용, 촬영일/서비스빌드/실제viewport·DPR은 미확인.

| Flow | Screen ID 순서 |
| --- | --- |
| Tasks `59d5186e-98e3-495f-b8c0-96eb9c943631` | 01: `sc_a333622d5e8c45e0b19ff4c249dc0aca`<br>02: `sc_fd79ede42b9843aca369d4e929c4272c`<br>03: `sc_6ec51256385940f2bd7d36a76874d691` |
| Adding a task `ee93ca39-d45a-4937-8ee6-7193c985b590` | 01: `sc_adeac0011d87480980cfd58e53e4d751`<br>02: `sc_6400e9620c7b4e29856292f30cce1c60`<br>03: `sc_e0d23728f830469c8e36b7ce26cb4102`<br>04: `sc_7a647748d2d2495db3926d2b7b13188d`<br>05: `sc_f36eea1be7f14442b9aa8e9ca89532e3`<br>06: `sc_12595f0282da469b919de850906c592c` |

Tasks01은 G72 전체 대시보드 소유 화면이므로 진입/공통 프레임만 비교했다.02전체 보드·03템플릿 안내와 Adding a task01~06은 대응 상태를 캡처했다. 보드1카드/상세3카드/초대Done카드는 다른 과거 snapshot이다. 동일 작업이 역할/화면별로 다른 저장값을 갖지 않도록 G24의 두 시간 taskId+Untitled seed를 채택했다. 사용자 JoeDoe 대신 가상 Alex/수락 멤버를 표시하는 차이를 숨기지 않는다.

## 구현·상태 수명

- `/app/tasks`, 프로젝트 `?tab=Tasks`, 개요 집계, 제한 협업자와 Time Tracking 작업 링크가 단일 TaskStore를 사용한다. 같은 이름 Initial Chat1/2는 별개 ID다. 프로젝트/멤버 이름 변경은 현재 참조, 과거 시간 초/요율/금액은 그대로다.
- `TaskBoard/Panel/Host/AssigneePicker/TemplatesIntro/ProjectTaskSummary`, editor/query/scroll hook, 저장소/값 검증을 분리했다. 프로젝트 feature에는 ReactNode/callback을 주입해 역방향 순환 의존성을 만들지 않았다. 한글 책임 주석, 실제 DOM navigation, 공통 Dialog/inert/초점 관리를 재사용했다.
- `?task=new`는 미저장 초안. 유효 제목1~200+프로젝트에서 첫 저장이 ID를 생성한다. 제목blur/Enter·설명blur·선택 즉시 현재 초안 원자 저장. 빈 신규blur는 저장하지 않고 명시적Enter는 오류 표시. 빈 닫기는 레코드0. 이미 성공한 필드와 미저장/진행 입력을 구분해 Close/Escape/뒤로는 후자만 취소한다. 전체 생성은 프로젝트 선택, 프로젝트/열 진입은 ID/상태 사전 선택. 원본 저장시점은 미확인이며 목 선택이다.
- 가상 업무일2024-02-07 UTC, 날짜ISO1900~9999, 설명4000자, 단일 담당자. 같은 workspace·joined·프로젝트 접근 멤버만 선택, 대기초대 제외. collaborator는 배정 작업 편집 허용 목 정책, 직접 타workspace/미배정 작업 거부, 회사/고객/설정/재무 권한 확장 없음.
- actor/workspace/revision·요청Abort·submissionID·revision충돌로 중복/늦은 응답을 차단한다. 실패초안유지/Retry·Reload저장값 분리. 같은탭로그아웃은 원본 유지, refresh/newtab/Reset은 초기화. URL검색/필터, 패널 입력은 해당 수명, 가로 위치는 scope/경로/필터별 메모리100개 이내.
- 기본3상태 선택만 제공한다. Files/반복/시간추가/추가액션/템플릿 적용·작성은 명시적 미제공 안내. 템플릿 일러스트는 원본 로컬 자산이며 실제 seed가 아니다. 상태활동은 최소 이벤트, 하위 작업·댓글은 G26/G27 인계. G28~G31 실행 없음. Send invite 제목은 문자열이다.

## 검토·수정

1차 코드/사용자 흐름 검토: 새 제목 빈값의 명시적 검증, 현재 사용자 avatar, 조합중 담당자 키 이벤트, unchanged blur가 다음 선택을 막지 않도록 보완했다. 최초브라우저15개 중13통과2실패: 실제 sidebar가 `/app/pending/tasks`로 남아 있던 결함을 `/app/tasks`로 수정하고 이전URL도 리다이렉트했다. 다른 실패는 숨겨진 공통select의 Alex option까지 잡는 검사 범위 문제여서 열린 Task Dialog로 좁혔다. 기능 실패와 검사 실패를 구분한다.

원본 비교에서 탭여백28px·카드높이16px 차이, 제목/본문 크기·템플릿 간격·패널 Files/Subtasks높이·배경blur를 보정했다. 같은 specificity의 뒤쪽 공통 Dialog CSS가 투명배경을 덮던 것을 task-dialog 범위로 수정했다. 신규capture의 배경집계는 URL/필드만 아니라 실제 Upcoming/Overdue 갱신을 기다리도록 바로잡았다. 캡처 첫 실행은 고객 링크 전체 접근성 이름 불일치로 실패, selector 보정 후12장 촬영했다.

2차 재검토: G18 협업자 최소작업을 공통 보드/패널로 대체하고 제한 시간 탭은 G24 같은 기록만 사용하며 금액을 숨겼다. G24 작업/개요/시간과 sidebar·G14 Add task 연결을 확인했다. 좁은 보드 위치 복원 hook/회귀를 추가했다. query 지연 중 기존 편집 초안을 외부데이터로 덮지 않으며 새 패널은 현재 원본으로 시작한다. 저장 실패/취소/중복/직접URL·권한/IME 합성·narrow/keyboard와 기존 프로젝트·초대 흐름을 검토했다. 실행 가능한 알려진 결함을 다음 Goal로 넘기지 않았다.

신규 의존성·HTTP·앱간import·Backend 없음, title/description은 HTML 실행하지 않는다. 실계정 권한/실발송/첨부/반복 정책은 서버 후속 메모다.

## 현재 실행 검증

FE/user-web cwd, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`; pnpm8.14.1. `corepack pnpm typecheck`, `lint`, `test`, `build` 통과. 단위21파일81/81. 초기rootcwd pnpm12선택 실패와 unit타입 actorID 불일치 수정 로그를 보존했다. bundle500kB/caniuse경고는 남아 있으며 기능오류가 아니다.

Playwright 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G25/<run>.json caffeinate -i corepack pnpm exec playwright test tests/e2e/invitations.spec.ts tests/e2e/project-creation.spec.ts tests/e2e/project-views.spec.ts tests/e2e/project-stage-tags.spec.ts tests/e2e/project-settings.spec.ts tests/e2e/tasks.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G25/<run>`. 빌드는 `-c playwright.preview.config.ts`. 개발5175/빌드4175, 기존5173유지.

최초dev13/15→수정G25단독5/5→중간22/22(stage파일명 오기로4개 미포함)→최종개발/빌드 각각26/26. 첫 실패를 최종통과로 합쳐 쓰지 않는다. 전체앱 E2E는 G27에서 실행한다.
- `dev-first`: 통과 13, 실패 2; 전체 요청 37420, API/외부 0, 실패 요청 0, console/page 오류 0.
- `dev-second`: 통과 5, 실패 0; 전체 요청 13071, API/외부 0, 실패 요청 0, console/page 오류 0.
- `dev-final`: 통과 22, 실패 0; 전체 요청 56089, API/외부 0, 실패 요청 0, console/page 오류 0.
- `dev-current`: 통과 26, 실패 0; 전체 요청 65457, API/외부 0, 실패 요청 0, console/page 오류 0.
- `build-current-browser`: 통과 26, 실패 0; 전체 요청 495, API/외부 0, 실패 요청 0, console/page 오류 0.

요청 차단 없이 실제 request/response/실패/socket/console을 관찰했다. 캡처12장도 API/외부·실패·console0. 목 장애는 normal로 복원. 실제OSIME/보조기술/Safari·Firefox/실기기는 환경 미구성 대기이며 합성IME·Chromium으로 대체했다고 쓰지 않는다.

## 시각 비교·잔여·임시 자료

원본 Tasks/screens3장과 Project detail/Adding a task/screens6장을 1440×900으로 정규화(MCP표시 기준, 원본DPR확정아님), 실제 Chromium1440×900DPR1 및320×600으로 캡처했다. `/tmp/onehandsales-g18-g27/G25/` source9/captures9대응+좁은3/compare쌍·diff·review, MCPJSON·capture-report·명령로그·실패JSON/trace를 임시 보관. `_evidence`/RESULTS/evidence 복원 없음.

시각 비교9상태를 직접 검토했으나 Tasks01은 프레임만 해당. 원본과의 잔여: 실제목기준3개카드·가상actor/고정시각·과거시간, 저장후 즉시집계(원본배경빈상태), native날짜/상태select·키보드outline·닫기/오류추가, 아이콘/아바타/미세간격·곡선shadow, 원본미수록모바일배치·도움말말풍선/preview도구. 완전일치 아님. G26/27 소비자료 및 R06반복·파일·Gantt/의존성/다중담당/서버권한·알림·영속저장 미확인 유지.

## 5173 확인 순서

1. `/app/tasks` → Continue as Alex → 제목검색/Filters → Templates 안내 → 뒤로.
2. New Task → 빈Enter오류/닫기 → 다시열어프로젝트·제목입력Enter → 상태/날짜/담당자/설명 → 닫기. 전체/프로젝트Tasks/Overview 같은ID·집계 확인.
3. Design Project → Time Tracking → Initial Chat 제목 링크 → 같은 작업 변경 → 닫기. $20.04과 기록초 유지 확인.
4. Task preview controls write-error→입력보존/Retry, slow→Escape/늦은생성없음 → normal. 뒤로/앞으로/직접taskURL/새로고침 초기화 확인.
5. G17 로컬초대 수락→배정 프로젝트/Tasks 동일원본·회사/설정제한.320폭/키보드/담당자Escape/패널닫기초점·보드가로위치 복귀 확인.

개별커밋 후 G26으로 이어간다. push/배포 없음. [연속 결과](G18_G27_RESULT.md).

### G26 공통 회귀

[G26 결과](G26_RESULT.md)에서 부모필드저장6개명시추출로하위목록덮임을방지하고공통Dialog의중첩cancel/Tab전파를분리했다. 최초단위83/84·dev8/9와수정후단위84·개발/빌드37개씩구분. 기존기반/초대/프로젝트/작업흐름회귀검증,자료/시각/환경대기유지.
