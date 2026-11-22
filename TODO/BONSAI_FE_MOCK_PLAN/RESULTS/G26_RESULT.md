# G26 — 하위 작업·담당자 실행 결과

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
