# G26 — 하위 작업·담당자 실행 결과

> 현재 재검토: **부분 완료**. [2026-11-27 R4 검토](#g26-r4-recheck). 아래 과거 테스트·브라우저 결과는 당시 이력이며 현재 검증과 구분한다.

최신 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증; 자료·시각·환경 대기. 실제 서비스/알림/연동 완료가 아니다.

## 근거·범위

G25 `9f07a17c` 커밋 뒤 깨끗한 상태에서 시작. 같은 TaskStore/프로젝트·joined팀 ID, AppShell/Dialog를 재사용했다. FRONT_AGENT/Decision006·공통 및 G26/R06 명세를 적용했다. [R06](R06_RESULT.md)에 관찰과 목 가정을 먼저 구분했다. 확인기준일2026-11-21, 실행호스트로그21~22. App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`; Latest2146은 G18/G25 근거 재사용, 신규 MCP2flow15screen·실제PNG15장·ANALYSIS4/5/8절 확인. 촬영일/제품빌드/원본DPR은 미확인이다.

| Flow | Screen ID 순서 |
| --- | --- |
| Adding subtasks `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` | 01: `sc_92611ceaf06340ae99ed8df9b666d850`<br>02: `sc_046bdc5a1543433f933ca84d92579603`<br>03: `sc_92544e24c71a4c93b830a3d47c959b72`<br>04: `sc_f8457681a6804fe39e695dfe885f882a`<br>05: `sc_eeefe46c51154a1a90c08876ef418fc5`<br>06: `sc_04fedc8d0016439eb35c5d23bda93a37`<br>07: `sc_ab5a7afb054844be96854877997e8065`<br>08: `sc_cc86bdd7d2b14979983e89b4b1658a11`<br>09: `sc_589deed929294b86bd4e88e18604b436`<br>10: `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf` |
| Editing a subtask `eb7720d8-fb1d-405b-8058-3f1c21adf475` | 01: `sc_cc86bdd7d2b14979983e89b4b1658a11`<br>02: `sc_7b58c2e6afe84ff084746d9b26e8a2c7`<br>03: `sc_7d38c07db33f49d9b4f4160588f26d70`<br>04: `sc_f6fd9820dad74a1e8c7e75641dc547e4`<br>05: `sc_9487f272ece1435da2a8d001d43f9685` |

Adding subtasks01~10의 Save 입력행→Send invite→Prepare a deck→완료/JD, Editing01~05의 완료 이후 담당자 메뉴/반영을 재현했다. 제목 수정 결과·해제·취소·삭제결과·부모완료·알림은 원본 관찰이 아니다. 붉은선은 주석 후보로 보고 오류표시를 만들지 않았다. Send invite는 실제발송 명령이 아니다.

## 구현·저장·목 정책

- `/app/tasks?task=:id` 및 프로젝트 `?tab=Tasks&task=:id`의 같은 TaskPanel에 TaskSubtasks/SubtaskCreate/SubtaskRow와 useTaskMutation을 연결했다. 목록/패널/전체·프로젝트 재진입은 parentTaskId/독립subtaskID를 보존한다. 새 글로벌카드나 별도 프로젝트를 만들지 않는다.
- 신규 Save/비조합Enter 때1~200자 검증·ID 생성, 동명허용·생성순서유지·새입력한행. 실패입력 유지/재시도, UUID제출중복방지. Cancel/Escape는 새초안/진행요청만 폐기하고 부모패널/기존행을 유지한다. 빈 부모초안은 하위 생성 전에 제목/프로젝트 저장 안내.
- 기존 제목은 blur/Enter 저장, Escape 미저장제목취소. 완료/해제·담당자는 독립patch. 완료한 하위에도 배정 가능, 모두완료해도 부모상태/기한/시간/담당자와 개요작업수는 유지한다. 단일담당은 같은workspace·joined·프로젝트 접근 멤버만, 부모담당자 자동상속 없음. Unassigned로 해제 가능. 미수락/외부멤버 거부.
- 부모필드와 하위revision을 분리하고 저장직전 접근/최신revision을 재검사한다. 오래된초안은오류/Reload, 계정/workspace/Reset/패널이탈/취소 뒤늦은결과는폐기한다. 기존메모리정책 유지: 같은탭로그아웃 저장보존,refresh/newtab/Reset초기화.
- 휴지통은 원본표시를 유지하되 삭제결과/복구/시간영향 근거가 없어 명시적 미제공Dialog·복귀만 제공한다. G29부모삭제/보관·G28상태정의·정렬/손자/실제알림은 구현하지 않았다. 목삭제완료로 기록하지 않는다. 댓글/추가활동은G27.

## 두 차례 검토·발견 결함

1차 코드/흐름 검토와 단위검사에서 실제 데이터손실을 재현했다. 부모 editor초안이 Task 전체객체를 포함했고 validateTaskDraft의 spread가 과거subtasks까지 통과시켜 부모이름저장으로 최신하위목록을 지웠다. 부모저장필드6개를 명시적으로 추출하도록 수정했다. 부모수정/완료후배정/모든자식완료·동명ID/충돌을 단위·브라우저로 회귀검증했다. 최초단위83/84 실패와 수정후84/84를 구분한다. G25 공통저장경계 수정이다.

첫브라우저는8/9. 중첩삭제안내Escape가 부모TaskPanel까지닫는 공통Dialog 결함이었다. React cancel 전파를 중단하고 Tab초점순환도 가장안쪽Dialog에서 처리했다. G01기반·초대·프로젝트생성의중첩모달·G25작업까지 회귀범위를 넓혔다. 오류초안/Retry는 별도검증하고 하위삭제미제공이 실제삭제로 오해되지 않게 했다.

2차 재검토는 부모/하위 저장소 필드경계·revision·중복/취소·담당자역할·actualhistory·중첩Dialog포커스와 원본15상태를 확인했다. 입력행 오른쪽경계·행너비·compact담당자팝업을 보정했고320폭/긴한국어·키보드·합성IME·refresh초기화를검증했다. API/앱간import/의존성/Backend변경없음, 명시적 책임주석/기존컴포넌트재사용. 실제서버알림과삭제정책은후속메모다.

## 실제 명령·현재 검증

FE/user-web cwd, Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`; `corepack pnpm typecheck`, `lint`, `test`, `build`. 최종타입/lint/build통과, 단위21파일84/84. 최초타입은 검사코드배열원소undefined경고를 optional접근으로수정했다. 최초단위83/84→수정84/84, 최초dev8/9→최종개발/빌드각37/37. 과거통과로 대체하지 않았다.

브라우저명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G26/<run>.json caffeinate -i corepack pnpm exec playwright test tests/e2e/foundation.spec.ts tests/e2e/invitations.spec.ts tests/e2e/project-creation.spec.ts tests/e2e/project-views.spec.ts tests/e2e/project-stage-tags.spec.ts tests/e2e/project-settings.spec.ts tests/e2e/tasks.spec.ts tests/e2e/subtasks.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G26/<run>`; 빌드는 `-c playwright.preview.config.ts`. 최초dev는tasks/subtasks9개. 개발5175/빌드4175, 기존5173보존. bundle500kB/caniuse경고 유지.
- `dev-first`: 통과 8, 실패 1; 전체 요청 22468, API/외부 0, 실패 요청 0, console/page 오류 0.
- `dev-final`: 통과 37, 실패 0; 전체 요청 112359, API/외부 0, 실패 요청 0, console/page 오류 0.
- `build-final-browser`: 통과 37, 실패 0; 전체 요청 760, API/외부 0, 실패 요청 0, console/page 오류 0.

차단없이 실제요청/실패/socket/console관찰. 캡처17개 요청1875,API/외부·실패·console0. 최초capture는비동기저장checkbox를 즉시판정하는 Playwright check사용으로실패했고 실제click→저장값대기로 바로잡았다. 실패로그보존. 장애목은normal복원. 실제OSIME/보조기술/추가브라우저/실기기환경은미구성대기이며합성IME로검증했다고쓰지않는다.

## 시각 비교·미확인

원본 `bonsai_analysis/flows/Project detail/Adding a task/{Adding subtasks,Editing a subtask}/screens`.1440×900정규화(MCP기준,원본viewport/DPR확정아님),실제Chromium1440×900DPR1/320×600. source15/captures15+좁은2/compare15쌍·diff·5review시트/MCP/로그/실패trace는 `/tmp/onehandsales-g18-g27/G26/` 임시보관.15원본과대응구현비교를직접검토했다. `_evidence`/RESULTS/evidence복원없음.

패널스크롤은 원본Subtasks제목Y382(일부352/278)를목표로 맞췄으나 현재G25활동1개·댓글인계높이로 최대142~196px에제한됐다. 실제상태/높이를조작해원본과동일하다고하지않았고 capture-report에실제scrollTop/max를기록했다. G27활동·댓글연결후이영역을다시대조한다. 현재비교는하위행기능/배치비교이며동일전체scroll달성은대기다.

잔여: G27부모할당활동/댓글폼·전체스크롤,원본의붉은선·과거빈개요와현재집계차이,가상Alex/아바타/고정UTC,키보드outline·취소/오류표시추가,폰트/아이콘/미세간격·shadow,원본미수록모바일. 제목편집저장시점/다중배정/해제/부모연동/삭제복구/알림은목선택또는서버메모,실제정책확정아님. R06전체완료아님.

## 5173 확인 순서

1. `/app/tasks`→Continue as Alex→Initial Chat→Add Subtask→Send invite/Save→Prepare a deck/Save.
2. Send invite완료→해당행담당자→Alex→두번째도완료→부모InProgress유지. 첫제목수정Enter/취소Escape,부모이름수정후두행유지.
3. 닫기→Projects→같은프로젝트Tasks→같은ID열기→뒤로/앞으로. 휴지통→미제공안내→Escape→부모패널·하위행유지.
4. Taskpreviewcontrols write-error→하위실패/입력보존/재시도,slow→Cancel/Escape→늦은행없음→normal.320폭/키보드담당자선택/긴한국어 확인. refresh는인증과데이터초기화.

개별커밋후G27로이어간다. push/배포없음. [연속결과](G18_G27_RESULT.md).

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.

## 2026-11-22 G28 연결 회귀

[G28 결과](G28_RESULT.md)에서 상태 UI를 native select에서 원본 메뉴/정의 설정으로 보완했다. 동일 작업/하위/댓글 ID와 과거 활동 표시명 snapshot, 완료 의미·시간 불변을 검증한다. 공통 mutation 재시도 중 오류/버튼 유지로 더블클릭의 backdrop 닫힘을 수정했다. 이번 실제 전체 검사/재실행 결과는 G28에 기록하며 위 과거 실행 결과를 덮지 않는다. 기존 자료·시각·환경 대기는 유지한다.

## 2026-11-22 G29 연결 회귀

[G29 결과](G29_RESULT.md)에서 같은 Task ID의 완료→보관/삭제, 전체·프로젝트·개요·Dashboard 제외와 기록 시간 보존을 대조했다. 하위/댓글/늦은 변경·협업자 접근과 기존 상태 정의를 함께 검증한다. 이번 명령/실패·재실행은 G29 결과에 기록하며 위 과거 검사 수치·미수록/시각/환경 대기를 덮지 않는다.


<a id="g26-r4-recheck"></a>
## G26 R4 재검토 — 2026-11-27 KST

기준 커밋 `5cd3178`, 깨끗한 Git에서 시작했다. FRONT_AGENT/Decision006·컴포넌트/상태/접근성/테스트/주석·엔지니어링 검토, G26 완료 기준·R06 소비, 현재 SubtaskCreate/Row/TaskSubtasks/AssigneePicker·TaskStore·G25 패널, 분석/원본을 전후 대조했다.

### 직접 확인한 원본

Gummble MCP 새 조회와 PNG 직접 확인: Adding subtasks `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` **01~10**, Editing a subtask `eb7720d8-fb1d-405b-8058-3f1c21adf475` **01~05**. 15단계 ID/순서 일치. 빈 목록→Save 입력행→Send invite→두 번째 Prepare a deck→목록, 강조 행·담당자/빨간 휴지통, 완료의 초록 체크/회색 제목, 완료 후 PROJECT TEAM→JD 아바타를 대조했다. 하위 행42px·입력52px·담당 메뉴200px의 기존 CSS와 원본 구성을 비교했지만 정확한 CSSviewport/DPR은 미확인이다. Files 붉은 선은 원인 미확인으로 제품 오류 표시를 만들지 않았다.

### 발견·수정

- 하위 제목을 바꾼 직후 체크박스로 이동하면 blur 저장이 먼저 시작되어 완료 의도가 누락됐다. 행 내부 이동은 제목을 보류하고 완료/배정과 함께 저장하며 행을 떠나거나 Enter일 때 제목을 확정한다. 실제 수락된 요청만 재시도 대상으로 보존한다.
- 하위 입력의 composition 이벤트가 부모 편집기까지 전달되어 취소 이후에도 부모 저장을 막았다. 생성/행 제목/담당 검색의 조합 수명을 분리하고 Enter/Escape를 보호했다.
- 빈 하위 제목 오류의 aria-invalid/설명 연결·초점을 보완했다.
- 저장 후 렌더 전에 실행된 초점 복귀가 사라진 입력에 남았다. 입력행 종료 렌더 뒤 Add Subtask로 복귀하도록 수정했다.
- 담당자 이니셜을 이름별 첫 글자로 통일해 Joe Doe는 JD, Alex (preview)는 A가 된다. 부모/하위 picker와 보드가 같은 계산을 사용한다.
- 원본 강조 행에서 보이는 초록 체크 외곽선을 보완했다. hover/focus 구분 자체는 원본에서 확정되지 않아 기존 웹 대응 정책을 유지한다.

### 현재 검증·네 기준 재대조

새 App DOM **최초3/3 실패**로 제목/완료 경합·조합 누출·오류 연결 문제를 재현했다. 첫 보완 후 성공 초점 검사가 실패해 수정·재검토했다. 최종 하위 DOM3 + G25 DOM6 + task-store17 = **26/26, 30.30s** 통과했다. 완료 하위 배정·다른 하위 미완료 유지, 같은 하위/부모 ID 재진입, 제목취소·실패재시도·중복생성 방지·부모 독립성·시간 $20.04 보존을 확인했다. store 검사는 범위/권한·취소/로그아웃·stale revision과 전체 자식 완료 시 부모 불변도 포함한다.

app/node TypeScript noEmit incremental false·전체 lint·Vite 메모리1976modules/3outputs 통과. G25 부모/보드 picker 공유 영향은 G25 DOM을 재실행했다. 공통 Dialog·고객/프로젝트·저장소는 변경하지 않았다. R4 관찰5항목 구성/동작 대조, 남은 분석2항목 대기. 기존 문서·코드·테스트만 수정하고 증거/임시/보고 파일은 생성하지 않았다.

### 잔여와 영향

원본의 제목 편집 저장/취소, 완료 해제·다중 담당/해제·부모 자동 완료·하위 삭제/복구·알림·권한·순서/중첩 정책은 미수록이다. 휴지통은 기존 미제공 안내로 복귀하며 삭제 구현 완료가 아니다. Send invite는 문자열이고 실제 초대가 아니다. 정확한 폰트/아이콘/스크롤·hover/focus·색/간격은 동일성 미확인이다.

연결 browser session이 없어 실제 E2E/픽셀 비교·OS IME·네이티브 초점/스크롤·확대/좁은 화면·network 검사를 수행하지 않았다. 합성 DOM 결과는 이를 증명하지 않는다. 따라서 **부분 완료**이며 G19~G25의 기존 원본/브라우저 잔여를 해소한 것으로 표시하지 않는다. 실제 API/Backend/DB·push·배포 및 G30·G31 착수 없음.
