# G29 — 보관·삭제 실행 결과

> 현재 재검토: **부분 완료**. [2026-11-27 R4 검토](#g29-r4-recheck). 아래 과거 테스트·브라우저 결과는 당시 이력이며 현재 검증과 구분한다.

상태: 관찰 범위 목 구현·두 차례 검토·시각 비교·현재 연결 회귀 수행. 자료·시각·환경 대기를 실제 서비스 완료와 구분한다.

## 기준·선행 결과

2026-11-22 KST. G28을 `dc631acf`로 커밋하고 깨끗한 작업 트리에서 G29 코드를 시작했다. R06의 이번4플로우15화면 보완 분석은 G28 전에 수행했고 [R06_RESULT](R06_RESULT.md)에 관찰/목 가정/미확인을 구분했다. FRONT_AGENT와 Decision006·관련 하위 규칙 및 엔지니어링 검토를 적용했다. 기존5173 PID59363, 기존 `/tmp` 자료와 G01~G28 구현을 보존했다. 원본 미수록·시각·환경 대기는 이번 완료로 올리지 않는다.

G01의 목 세션/취소/초기화/Dialog, G24의 프로젝트/기록 시간, G25의 단일 TaskStore·목록/패널·실제 이력, G26 하위 원본, G27 댓글/자동 활동, G28 정의/완료 의미를 재사용했다. 전체 대시보드·반복·파일·Gantt·의존성·템플릿은 구현하지 않는다.

## 원본과 관찰

App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, `bonsai-web`. 이번 MCP 앱 조회에서 카탈로그 Latest/2146을 재확인했다. 이는 촬영일·서비스 빌드가 아니다. 초기 MCP batch는 OAuth metadata HTTP 오류로 실패했고 이후 G28/G29 각각 재조회에 성공했다. G29 raw 응답 `/tmp/onehandsales-g28-g29/G29/mcp-sources.json`. 원본 CDN을 다시 내려받은 것으로 쓰지 않으며 기존 로컬 PNG와 반환 ID/순서/URL을 대조했다.

| Flow / 단계 | Screen ID | 직접 관찰 |
| --- | --- | --- |
| Archiving a task `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` 01 | `sc_ea042f68264945369fcad12326916b22` | 같은 제목2개, 한 상세의7초+1시간 기록 |
| 같은 Flow 02 | `sc_687782a0c44149d1963c1ff835f730fd` | Unfollow/Copy Link/Archive/Delete 메뉴 |
| 같은 Flow 03 | `sc_4146f54be90443f8b6b7e1a98b3f74d9` | 패널 닫힘, 한 카드 제거, 보관 성공 안내 |
| Deleting a task `7ca1185e-e3a0-460c-825e-68035a603593` 01 | `sc_8557a3e41edc402a8ebdf39022ee8d44` | Untitled+동명 Initial Chat2개 |
| 같은 Flow 02 | `sc_633af570057e4f50bdad39ba5cd111b0` | Untitled 카드 메뉴, 다른 Initial Chat1개 |
| 같은 Flow 03 | `sc_33f6ac508d6e4c7794180abee8fcf138` | Confirm Deletion, 영구 삭제 문구·붉은 Delete Task·바깥 X |
| 같은 Flow 04 | `sc_0886d3bb0d904283bae05691331a1627` | Untitled 제거·다른 카드 유지·삭제 안내 |

연결 ANALYSIS와 실제 PNG7장을 직접 확인했고7개 상태 비교를 만들었다. 삭제 전에 다른 Initial Chat가 줄어든 것을 Untitled 삭제의 효과로 해석하지 않았다. 복원/청구/시간 cascade/실제 권한·실계정은 확인하지 않았다. 외부 실제 API를 호출해 조사하지 않았다.

## 구현·책임·상태 수명

- 카드/상세의 `TaskActions`: 대상 메뉴·키보드·외부 클릭·Escape, 즉시 보관과 별도 영구 삭제 확인, 요청 취소/오류 재시도. 기존 Dialog의 초점 trap/닫기/스크롤을 재사용한다. 메뉴의 미수록 Unfollow는 안내 후 복귀이며 알림/팔로우 성공을 만들지 않는다. Copy Link는 현재 작업의 로컬 URL만 안내·복사하며 외부 navigation은 없다.
- TaskStore.remove: 대상ID·workspace/계정/revision·프로젝트 접근·owner 권한·AbortSignal/generation을 저장 직전 검사한다. 보관은 `archived=true`로 내부 작업/상태/하위/댓글을 유지하고 활성 소비에서 제외한다. 삭제는 해당 작업 원본만 제거한다. 이 차이는 FE 목 정책이며 실제 DB의 soft/hard delete 계약이 아니다.
- Done과 archived는 독립이다. 같은 제목의 다른 ID, 상태 정의 이름/색/순서, 프로젝트·멤버·시간 원본은 변경하지 않는다. 활성 전체/프로젝트 보드·Dashboard·개요 집계에서 처리한 ID를 제외한다. Query 이전 snapshot도 현재 저장소에서 유효한 항목만 보여 삭제 직후 잠깐 되살아나는 표시를 막는다.
- TaskHost는 이미 열린 대상의 새로운 lifecycle 결과에서만 원래 이력으로 닫는다. 이후 앞으로/시간 참조 링크로 같은 ID를 열면 Task unavailable을 표시한다. 처음부터 없는 ID의 진입을 자동으로 닫지 않는다. 직접 URL은 해당 query만 정리하며 원래 탭/검색/해시 정책을 유지한다.
- TaskFeedback은 사라진 카드/패널과 독립적으로 성공 결과를 알리고, 원래 트리거가 없어졌을 때 목록/본문으로 초점을 복귀한다. 토스트만 띄우고 원본 변경을 생략하지 않는다.
- 삭제는 Confirm Deletion→Delete Task에서만 확정, X/바깥/Escape는 취소다. 보관 확인창은 관찰되지 않아 바로 목 요청하고 pending 동안 Cancel archive/Escape/닫기를 허용한다. 실패는 대상/입력을 유지하고 같은 버튼으로 재시도한다. request ref와 비활성 표시로 중복 실행을 막는다.
- 취소/패널 이탈/로그아웃/workspace 변경은 늦은 요청을 무효화한다. 성공한 보관/삭제는 같은 탭 로그아웃·재로그인에도 유지되고 reload/새 탭/Reset은 seed와 인증을 초기화한다. 실제 영구 저장이나 서버 복원 불가의 증거는 아니다.
- G29의 owner-only 보관/삭제는 명시한 목 권한이다. 협업자는 기존 배정 작업 조회/상태/하위/댓글을 계속 사용하되 Archive/Delete는 비활성이고 이유를 표시한다. UI와 저장소 양쪽에서 제한한다. 실제 Bonsai 역할별 권한은 미확인이다.
- 저장 뒤 삭제된 생성 submissionId를 다시 요청해도 새 Task ID를 만들지 않는다. 부모 제거 뒤 늦은 부모 수정/하위 추가·수정/댓글/완료 요청은 current 검사에서 거부된다. 다른 동명 작업으로 대상이 바뀌지 않는다.
- 하위/댓글/활동은 부모 내부 원본이다. 보관 시 내부 보존하지만 활성 UI 접근은 닫고, 목 삭제 시 부모와 함께 더 이상 조회되지 않는다. 외부 파일/알림/실제 연쇄 삭제/복원 정책을 확정하지 않는다.
- `TaskTimeToggle/TaskTimeRecords`는 기존 프로젝트 기록 중 같은 Task ID만 읽기 전용으로 펼친다. source의7초+1시간 두 행은 현재 canonical seed에서 서로 다른 Task ID를 참조하므로 제목만으로 합치지 않는다. 프로젝트 Time Tracking은 기존 기록 이름 snapshot/초/금액을 유지하고 사라진 작업 링크는 unavailable로 연결한다. 완료/보관/삭제가 $20.04를 자동 차감하거나 증가시키지 않는다. 진행 타이머·인보이스·복원 UI는 범위 밖이다.

## 검토와 수정 이력

1차 검토는 stable ID/완료·보관 구분/삭제 확인/후속 소비·시간 보존/초기화/권한/늦은 저장을 대조했다. 의미 있는 저장소 회귀3개를 추가했고 기존 포함 단위93개가 통과했다.

- 첫 단위 명령을 root cwd에서 pnpm --dir로 실행해 Corepack pnpm12와 앱 요구8의 불일치로 실패했다. 설정/의존성을 바꾸지 않고 FE/user-web cwd에서8.14.1로 실행해 통과했다. 첫 CSS append도 중복 상대 경로로 실패했고 올바른 cwd에서 기록했다. 이를 앱 실행 검증으로 계산하지 않는다.
- 첫 lint는0error/2hook 의존성 warning. 전역 메뉴 이벤트와 이력 닫기에 최신 ref를 연결해 메뉴 초점을 render마다 초기화하지 않으면서 warning을 제거했다.
- 첫 G29 브라우저3/4 통과, Project Settings와 Task Settings의 strict selector 중복1건. Task details 안으로 범위를 한정했다. navigation은 그대로 실제 경로다.
- 다음 관련 검사20/21 통과, 협업자시험에서 aria-disabled인 Delete에 click을 기다리며90초 초과. 강제 click을 넣지 않고 비활성/권한 안내/기존 작업 유지·Escape를 검사하도록 고쳤다. 구현의 disabled 의미도 실제 click/key의 no-op과 일치시켰다.
- 코드 검토에서 Project denied가 있을 때 placeholder 행의 동기 current 호출이 render 예외로 전파될 수 있음을 확인했다. 알려진 접근/취소 오류는 이전 행을 숨기고 기존 비동기 query 오류 UI로 전달한다. 알 수 없는 오류는 숨기지 않는다. 프로젝트 제한→복구 및 전체 작업 제거→빈 소비 화면→reload 복구를 브라우저 검증에 추가했다.
- 원본 비교로 삭제 modal400폭/상단60/248높이·20px 제목/18px본문·전폭320×40 붉은 버튼, 무아이콘160px 메뉴/40px행, 시간 기록 전체폭 행, 성공 toast400×56/하단100px로 보정했다. 수치는 정규화 PNG 기준 추정이다.

2차 재검토에서 수정 코드·한글 책임 주석·메뉴/모달·저장 원본/상태 수명·권한/실패/취소·7개 비교를 다시 대조했다. 발견한 수정 가능 결함은 반영했고 자료/시각/환경 대기를 분리했다. 최종 실제 실행은 아래에 기록한다. 검토 메모는 `/tmp/onehandsales-g28-g29/G29/review-1.md`, `/tmp/onehandsales-g28-g29/G29/review-2.md`, 최종 회귀는 각각의 log/json/trace로 구분한다.

## 명령과 검증 범위

Node24.18.0/pnpm8.14.1, cwd `FE/user-web`. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 `corepack pnpm typecheck`, `lint`, `test`, `build`. 타입/lint/build 통과 및 단위21파일93/93. build의 기존500kB chunk/caniuse-lite 경고는 유지하고 임의 갱신하지 않았다.

Playwright는 `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g28-g29/G29/{run}.json corepack pnpm exec playwright test ... --output=/tmp/onehandsales-g28-g29/G29/{run} --reporter=list,json`이며 retries0이다. 현재 개발은 `--workers=1 --timeout=60000`, 빌드는 `--config=playwright.preview.config.ts --workers=2 --timeout=60000`이다.

- `dev-first`: G29 최초4개,3통과/1실패.
- `dev-review`: G25~G29·G18~G27 연결6파일21개,20통과/1실패.
- `dev-final`: 위6파일과 project-settings/project-views/project-creation/project-stage-tags/invitations/app-shell/foundation, 변경 영향 범위 검사. 전체 공개 웹을 다시 실행한 것으로 쓰지 않는다.
- `build-all`: 파일 제한 없는 전체 빌드 브라우저 검사. 개발5175/빌드4175로 기존5173과 분리했다.

네트워크/console은 intercept하지 않고 fixture의 실제 요청·실패·오류를 합산해 아래에 기록한다. 합성 IME와 CSS 글자 확대를 실제 OS/보조기술 검증으로 표현하지 않는다. 실패 원문과 후속 재실행을 합쳐 최초 전체 통과로 쓰지 않는다.

## 캡처·차이·대기

원본: `bonsai_analysis/flows/Project detail/Adding a task/Archiving a task/screens/`3장 및 `Deleting a task/screens/`4장. 임시 root `/tmp/onehandsales-g28-g29/G29/`의 `source/archive-01~03.png`, `source/delete-01~04.png`, `captures/` 대응7장과 좁은 확인/확대, `compare/`7장·`sheet-0/3/6.png`, `capture.mjs`, `capture-report.json`, `compare.py`. `_evidence`와 삭제된 evidence 폴더를 만들거나 복원하지 않았다. `/tmp`는 영구 증거 보관소가 아니다.

MCP1440×900에 원본2880×1800을 정규화했으며 원본의 실제 DPR/viewport는 미확인이다. 구현은 Chromium148.0.7778.96/1440×900/DPR1, 좁은320×600. 폰트 준비/실제 상태를 기다리고 스크롤0에서 비교했다. 최종 캡처는 G28 실제 색 선택으로 To Do를 주황색으로 바꾼 뒤 G29를 조작했으며 이미지 후처리로 상태를 바꾸지 않았다. 삭제01은3개인 초기 보드, 삭제02~04는 실제 보관 이후2개 보드에서 촬영했다. 이는 캡처 준비 절차이며 원본의 미수록 중간 조작을 확정하는 뜻이 아니다.

잔여 차이: 키보드 복귀의 접근성 outline, 정확한 폰트·굵기/잉크 위치·팔레트·shadow/blur/icon, 가상 Alex/프로젝트명·Yesterday 기준 날짜·preview controls,7초만 연결된 현재 대상과 원본의2개 시간 행 차이, 기존 보드의 카드 세부 높이/기한색/간격, 실제 타이머 대신 Track Time 인계, 외부 도움말 위젯 없음. 삭제 대상 제목은 접근성 설명으로만 포함했으며 원본에 없는 업무 경고/복원 정책을 만들지 않았다. 완전 일치라고 보고하지 않는다.

자료 대기: 원본 보관 확인/복원/보관 목록·실제 삭제 cascade·권한·청구/진행 타이머 영향·실제 영속성. 환경 대기: OS 한글 IME·보조기술·Safari/Firefox·실기기·원본 모바일. 기존 G01~G28 및 R06의 미수록 항목은 유지한다. 서버 질문 해결을 위해 Backend/DB/HTTP adapter를 작성하지 않았다.

## 5173 최종 확인 순서

1. `/app/tasks` → Continue as Alex → Initial Chat 하나 → Task status/Settings에서 Done 이름 변경 → 상태 완료. Dashboard 같은 행의 취소선/유지 확인.
2. 같은 ID 상세 → 기록 시간 펼침 → 말줄임 Archive. 한 작업만 빠지고 다른 Initial Chat는 유지. 앞으로 가기 또는 기존 시간 링크는 Task unavailable.
3. Projects → Design Project with Doe Studio → Overview의 완료 집계/Tasks → Time Tracking 기록2개·$20.04 유지 확인.
4. 다른 카드 말줄임 Delete → Confirm Deletion → Escape/X/바깥 취소 → 다시 열어 Delete Task. 선택한 ID만 제거되고 성공 안내/초점 복귀.
5. Task preview controls: write-error에서 실패 후 같은 대상 재시도, slow에서 Cancel deletion/Cancel archive/뒤로 이동 → 늦은 제거 없음. normal 복원.
6. 좁은 화면/키보드 메뉴/긴 한국어/로컬 Copy Link를 확인. 협업자는 Archive/Delete 비활성 이유를 확인하고 기존 하위·댓글은 사용. 새로고침은 인증/목 원본 초기화.

G29 결과·staged diff를 확인한 후 별도 로컬 커밋으로 종료한다. G30/실제 API/Backend/DB/push/배포는 수행하지 않는다.

## 최종 검증 판정

- 타입/lint/build 통과 (`typecheck-verified.log`, `lint-verified.log`, `build-verified.log`), 단위93/93 (`unit-current.log`). 단위 실행 뒤 저장소 코드는 바뀌지 않았으며 UI/읽기 hook 보완은 현재 타입/lint·브라우저에서 확인했다.
- 개발 영향 범위58/58, 빌드 전체152/152 통과. 최초3/4·20/21과 이번 결과를 구분하며 자동 retry0/skipped0이다. 개발은 전체 공개 웹 재실행으로 표현하지 않는다.
- 개발 파일 목록: task-lifecycle/task-status/tasks/subtasks/task-comments/g18-g27-journey/project-settings/project-views/project-creation/project-stage-tags/invitations/app-shell/foundation의13개 spec 파일. 빌드는 파일 제한 없이 실행했다.
- 협업자의 기존 하위/댓글/상태 접근과 owner-only 보관/삭제, G28 이름 변경→완료→보관/삭제, 프로젝트 시간2기록·$20.04 유지, 실제 URL/앞뒤 이력/닫기/실패/취소/초기화가 현재 실행에 포함됐다.

| 실행 | 통과/실패 | 요청 | API·외부 | 요청 실패 | console/pageerror |
| --- | --- | --- | --- | --- | --- |
| `dev-first` | 3/1 | 9405 | 0 | 0 | 0 |
| `dev-review` | 20/1 | 50839 | 0 | 0 | 0 |
| `dev-final` | 58/0 | 171477 | 0 | 0 | 0 |
| `build-all` | 152/0 | 6720 | 0 | 0 | 0 |

5173 최종9캡처: 요청1883/API·외부0/실패0/console·pageerror0. 실제 delete modal x520/y60/400×248;320폭 및40% CSS 글자 확대의 내용/확정·닫기 제어를 직접 확인했다. 원본과의 차이를 이미지 후처리로 지우지 않았다. 원문/합산은 `{run}.json`, `{run}-summary.json`, log/trace에 남겼다. HTTP intercept·navigation mock은 사용하지 않았다. 실제 계정·서버·OS IME·보조기술·추가 브라우저/실기기를 검증한 것은 아니다.

기존5173 PID59363을 유지했고 테스트용5175/4175는 실행 종료 시 정리됐다. 목 장애 설정은 normal 또는 시험 컨텍스트 종료로 복원했다. `_evidence`/삭제된 evidence 복원, 기존 임시자료 삭제, API·Backend·DB·push·배포는 수행하지 않았다.

## 2026-11-22 — G31 템플릿 연결 회귀 추가

[G31 결과](G31_RESULT.md)에서 템플릿 복사 작업을 기존 생성/편집·하위·댓글·상태/완료·보관/삭제 흐름과 함께 검사했다. 단위100/100, 개발 영향57/58 및 빌드 전체160/161의 실패는 새 적용 모달 직접 URL의 hash 복귀 결함이었고 수정 후 연결 대상9/9씩 통과했다. 기존 업무 원본/시간/금액·상태 정의와 템플릿/반복 적용 결과의 독립성을 확인했다. 기존 결과·시각/원본/환경 대기를 덮어 완료 처리하지 않는다.


<a id="g29-r4-recheck"></a>
## G29 R4 재검토 — 2026-11-27 KST

### 착수와 원본 범위
- FRONT_AGENT·관련 하위 규칙·ENGINEERING_REVIEW_CHECKLIST·UXUI-REPLICATION, G29 명세 및 R06 G29 소비 범위, TaskActions/TaskHost/TaskFeedback/대시보드/저장소/시간 연결 코드를 확인했다. 착수 HEAD 37d1aa8f 뒤 clean이었다.
- Gummble MCP 재조회와 로컬 원본 직접 확인: Archiving a task `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` 01–03, Deleting a task `7ca1185e-e3a0-460c-825e-68035a603593` 01–04. 원본 PNG 7/7, MCP ID·순서 일치.
- 관찰: Unfollow/Copy Link/Archive/Delete 순서, 보관 후 상세 종료·동명 카드 하나 제외·보관 알림, 삭제는 Confirm Deletion/영구 삭제 문장/빨간 Delete Task 버튼/닫기 X·대상 카드 제외·삭제 알림이다.
- 원본에서 삭제 01→02의 Initial Chat 감소는 삭제 확인 이전 변화이므로 해당 삭제의 결과로 합치지 않았다. 보관 확인 화면이 없다는 사실과 제품에 확인 과정이 없다는 단정은 구분했다.

### 발견·수정과 영향
- 성공 알림 archived/deleted 뒤 원문의 마침표가 빠져 있어 수정했다.
- G28 연결 대시보드에서 보관 pending 중 같은 경로의 새 이력으로 이동해도 요청이 확정되는 결함을 새 DOM 검사로 재현했다. 대시보드 행 key에 location.key를 포함해 행의 메뉴·확인창·보관/삭제/완료 요청을 해당 진입 수명에 묶었다. 기존 task ID·원본 데이터는 유지한다.
- 전체/프로젝트 작업 보드는 기존 진입 수명이 동작하여 같은 검사를 통과했다. 불필요한 공통 저장소/TaskActions 정책 변경 없이 대시보드 소비 경계만 보완했다.
- 보관은 활성 조회에서 제외하되 내부 데이터 유지, 삭제는 선택 Task 제거, 기존 시간/금액/이름 snapshot 유지라는 기존 목 정책을 재확인했다. 실서비스 복원·파일/댓글 cascade·청구·타이머·권한 정책의 확정이 아니다.

### 검증·네 기준 재검토
- 새 DOM 4개: 보드 이탈/확인창 종료, 보관 실패→중복 재시도→상세 종료, 삭제 취소 초점→실패→중복 확정, 대시보드 완료 및 보관 pending 이력 이탈 취소.
- 초기 실패: 알림 원문 두 건, 추가 대시보드 이탈 검사 한 건. 수정 후 lifecycle 4 + status 2 + project-review 3 + store 17 = 4 files 26/26, 33.60s.
- 대상 studio-a:task-initial-chat-1 제거 후 동명 -2 유지, 직접 URL unavailable, 프로젝트 Time Tracking $20.04 유지. 저장소 검사는 하위/댓글/완료/생성 재실행이 제거된 부모를 부활시키지 않음, 취소·실패·stale revision·권한·workspace 경계를 포함한다.
- G28 대시보드 완료 행 유지와 상세 동일 ID, G21–G24 생성 이력·보드/표·태그 초점·시간 진입 회귀를 재검사했다.
- app/node tsc noEmit/incremental false, ESLint 통과. 메모리 Vite 빌드 1976 modules / 3 outputs, 6.76s. 검증 산출물 파일 없음.
- 원본·명세·규칙·연결 코드를 다시 대조했다. G29 후 전체 고객→프로젝트→작업 연결 재검토는 별도 최종 기록으로 남긴다.

### 남은 확인과 영향
- 실제 브라우저 연결 세션 없음: 네이티브 메뉴·초점 잠금·Esc/바깥 클릭·확대/좁은 화면·네트워크 검증 미수행. DOM 이벤트 검사는 실제 브라우저 결과와 구분한다.
- PNG의 문구·구성은 직접 대조했지만 정확한 폰트/아이콘/색/그림자/간격·viewport/DPR 및 픽셀 동일성은 미확인이다. 모달 CSS의 400px 기준은 기존 목 값이며 원본 확정 치수가 아니다.
- 원본 동명 카드의 실제 ID, 두 시간행 소유 ID, 복원/삭제 cascade/진행 타이머/청구 합계·역할별 권한은 자료 부족이다. 목은 두 canonical task ID와 시간 기록을 합치거나 삭제하지 않는다.
- G21–G24의 미확인을 완료로 변경하지 않았다. G30/G31 구현과 실제 API/BE/DB/push/배포는 수행하지 않았다.


<a id="g25-g29-final-recheck"></a>
## G25–G29 전체 연결 최종 재검토 — 2026-11-27 KST

### 네 기준과 범위 확인
- FRONT_AGENT 및 관련 하위 규칙·ENGINEERING_REVIEW_CHECKLIST, 최신 G25–G29 명세와 R06 각 소비 범위, FE/user-web의 실제 연결 코드, bonsai_analysis의 원본/분석/단계를 마지막으로 대조했다.
- 시작 HEAD 2905260e의 기존 변경은 없었다. Goal별 변경을 5cd3178d(G25), 063c2f75(G26), b8d24d31(G27), 37d1aa8f(G28), d5aad0cc(G29)로 각각 로컬 커밋했고 다음 Goal로 순차 진행했다.
- G19–G24 및 G30/G31 PLAN-INDEX 객체는 시작 HEAD와 동일하다. 기존 미확인을 완료로 바꾸지 않았고 G30/G31 구현을 시작하지 않았다.
- 변경은 작업 feature/직접 연결 페이지·CSS·검사 소스와 기존 계획/RESULT 문서에 한정했다. AGENT/bonsai_analysis/Backend/DB/Admin/ENV 변경, 실제 업무 API, push/배포 없음. evidence·스크린샷·비교 이미지·trace·HTML·검증 JSON·임시 스크립트 등 파일 산출물 없음.

### 최종 연결과 추가 수정
- 새 고객 Cleaning Company → 새 프로젝트 Weekly cleaning → 새 작업 Cleaning visit을 생성했다. 고객/프로젝트/task ID를 공유한 전체 목록·상세·프로젝트 시간 화면을 왕복했다.
- 부모/하위 담당자, 서로 다른 하위 ID 2개, 하위 하나 완료, 댓글 ID와 본문, 부모 Done 후 두 번째 하위 미완료 유지를 확인했다. 하위 완료는 부모를 자동 완료하지 않는다.
- 보관 후 해당 ID 활성 제외, 같은 제목 새 작업은 다른 ID 생성, 별도 삭제 확인 후 해당 ID만 제외, 고객 프로젝트 목록 유지 및 기존 동명 Initial Chat 2개 보존을 검사했다.
- 새 프로젝트의 완료/보관/삭제는 기존 프로젝트의 7초+1시간과 $20.04에 영향을 주지 않았다. 저장소 검사와 G29 DOM에서 제거된 부모의 하위/댓글/완료/생성 재실행이 작업을 부활시키지 않음도 확인했다.
- 마지막 경계 검토에서 부모 제목, 새 하위 입력, 기존 하위 제목이 compositionend 없이 blur 후 재편집될 때 저장이 막히는 결함을 추가 재현했다. 각 입력의 조합 상태를 blur에서 정리했다. 해당 입력에 머무르는 조합 Enter/Escape 보호는 유지한다.
- G27의 남은 문구 차이 중 새 목 활동의 UTC 표시는 원본에서 확인한 a few seconds ago로 수정했다. 내부 datetime/title은 유지하며 고정 목 시각 이외 구간은 기존 UTC다. 실시간 경과/상대 시간 변환 규칙을 Bonsai의 확정 동작으로 만들지 않았다.

### 실제 검증
- 새 task-connected-journey 3개: 전체 연결 1개와 IME 이탈 2개. 추가 IME 2개는 수정 전 실패했고 수정 후 통과했다.
- 중간 전체 실행은 56 files 중 1 failed, 330 tests 중 2 failed/328 passed(322.15s)였다. 이 실행은 수정 전 입력 코드가 적재된 검토 중 실행이며 최종 통과 증거로 사용하지 않는다.
- 수정 후 관련 DOM 6 files 21/21(44.85s), 이후 활동 시간 표시 assertion을 추가하고 코드가 고정된 상태에서 전체 검사를 다시 실행했다.
- 최종 전체: 56 files 330/330 unit+DOM; 317.73s. G19/G20 고객 필드·이미지, G21–G24 프로젝트 생성/보드·표/단계·태그/상세·시간, 이전 인증·초대·설정·공개 화면 및 기존 소비 코드 회귀를 포함한다. 기존 템플릿 검사는 회귀 실행이며 G30/G31 작업 착수가 아니다.
- 최종 app/node tsc --noEmit --incremental false·전체 ESLint 통과. Vite write:false/emptyOutDir:false/copyPublicDir:false 메모리 빌드 1976 modules/3 outputs, 9.09s. tests의 cache/fsModuleCache/optimizer/coverage/파일 reporter는 비활성화했다.
- PLAN-INDEX JSON 파싱, 추가/변경 문서 링크와 앵커, git diff --check를 확인했다. 최종 commit 이후 clean 상태를 확인한다.

### 직접 본 원본과 남은 확인
| Goal | 직접 확인한 Flow·단계 |
| --- | --- |
| G25 | Tasks 01–03, Adding a task 01–06 (9) |
| G26 | Adding subtasks 01–10, Editing a subtask 01–05 (15) |
| G27 | Adding a comment 01–03 (3) |
| G28 | Editing status settings 01–06, Marking a task as complete 01–02 (8) |
| G29 | Archiving a task 01–03, Deleting a task 01–04 (7) |

Gummble MCP 9 Flow 재조회와 로컬 원본 PNG 42단계를 직접 확인했다. ID·순서 일치와 시각 확인은 원본 관찰 근거이며 FE 렌더 동일성 증명이 아니다. R4 관찰 20개는 구성·동작 재검토, 분석 9개는 대기를 유지한다.

| 남은 항목 | 이유 | 영향 |
| --- | --- | --- |
| 실제 브라우저 E2E/네트워크/네이티브 IME·키보드·초점/drag·calendar/좁은 화면·확대·scroll | 연결 document browser session 없음. 산출물 제한을 우회한 별도 브라우저/임시 캡처를 생성하지 않음 | jsdom 및 코드 검사로 실제 렌더·브라우저 고유 동작 통과를 주장할 수 없음 |
| 정확한 폰트·아이콘·색상 토큰·치수·간격·그림자·viewport/DPR | 원본 PNG는 있으나 실제 DOM/CSS·촬영 조건과 같은 조건의 FE 렌더 미확인 | 작은 차이도 엄격 동일성 미완. Gellix/Lucide 및 CSS 추정값은 확정 원본값이 아님 |
| 원본의 카드 수/이름/날짜/담당자와 canonical seed 차이 | 기존 연결 검증용 가상 seed와 여러 시점의 원본 캡처가 다름 | 데이터·촬영 상태를 맞춘 화면 동일성 확인이 남음. 동명 작업을 임의로 합치지 않음 |
| 필터/달력·저장/빈값, 하위 삭제/부모 완료 관계, 댓글 메뉴/공개·알림, 상태 정의 범위/추가·삭제·순서/권한 | 해당 결과·미수록 분기 부족 | 현재 저장/취소/실패/권한 경계는 명시한 목 정책이며 Bonsai 확정 동작이 아님 |
| 보관 복원, 실제 동명 작업 ID와 시간행 연결, 삭제 cascade/파일/청구/진행 타이머 | 원본에서 전후·실제 ID·연관 결과 확인 불가 | 목은 기존 시간·금액을 보존하지만 실서비스 정책·실제 청구를 검증한 것은 아님 |
| G21–G24의 원본·시각·브라우저 잔여 | 이번에 해당 미확인 근거를 새로 확보하지 않음 | 기존 미완 판정을 유지하고 테스트 회귀 통과로 승격하지 않음 |

판정: **G25–G29 재검토·보완·로컬 회귀와 별도 커밋 수행 / 엄격 원본 동일성·실제 브라우저·미수록 정책은 부분 완료**. 확인 가능한 결함은 최종 연결 보완까지 처리했으며 남은 항목을 완료로 표시하지 않는다.

<a id="g25-g29-followup-review"></a>
## G25–G29 추가 검토 — 2026-11-27 KST

### 범위·판정 기준

시작 HEAD `da6bcd2f`, 기존 변경 없이 시작했다. FRONT_AGENT·Decision006·엔지니어링 검토 및 상태/접근성/테스트/한글 주석 규칙, G25–G29 명세·R06 소비 범위, 실제 작업·대시보드·고객/프로젝트 연결 코드, 해당 원본 분석을 다시 대조했다. 저장·취소·실패 후 수정/재시도·중복 요청·이력 이탈·권한·IME·키보드·초점과 같은 ID/시간/금액 보존을 검토 대상으로 삼았다.

기존 목 동작의 수정 가능한 결함은 아래 두 건을 재현·수정했다. 원본의 미수록 정책 및 실제 브라우저·엄격 시각 동일성은 완료로 바꾸지 않는다. 이번은 기존 G25–G29의 추가 검토이며 G30/G31 재작업에 착수하지 않았다.

### 발견·수정 및 영향

1. 담당자 메뉴 검색 입력에서 처음 ArrowUp을 누르면 마지막이 아닌 그 앞 선택지로 이동했다. 검색 입력은 선택지 인덱스가 -1인데 순환 수식에 그대로 넣은 것이 원인이다. 선택지 밖에서 시작할 때 위 방향은 마지막, 아래 방향은 첫 항목으로 이동하도록 고쳤다. 일반 작업과 하위 작업이 같은 picker를 사용한다. 방향키·Home·Escape 복귀를 검사했으며 수정한 handler는 이름과 한글 책임 주석을 가진 함수로 분리했다. 방향키의 세부 동작은 기존 목 접근성 정책이고 Bonsai에서 관찰한 동작이라고 확정하지 않는다.
2. 작업의 시간 기록 아바타만 이름 앞 두 글자를 사용해 동일 인물이 담당자/댓글에서는 A, 시간 기록에서는 AL로 표시됐다. 기존 `taskInitials`를 사용하도록 바꿨다. Joe Doe는 JD, Alex (preview)는 A로 표시하며 알 수 없는 멤버의 대체 표시는 유지한다. 실제 task/time-entry/member ID·초·금액·날짜·저장소는 바꾸지 않았다.

진행 색인의 최상위 상태에는 이전 G21–G24 검토 때의 G25 미착수 문구가 남아 있었다. 현재 추가 검토 상태로 정정했고 G19–G24·G30/G31 객체와 미확인 판정은 보존했다.

### 이번에 직접 다시 본 원본

- Editing a subtask 04: `sc_f6fd9820dad74a1e8c7e75641dc547e4`. 완료된 하위 작업의 PROJECT TEAM 검색·선택 메뉴와 Joe Doe/JD 표시를 확인했다. 키보드 세부 동작은 화면만으로 확인되지 않는다.
- Archiving a task 01: `sc_ea042f68264945369fcad12326916b22`. 상세 담당자와 펼친 시간 기록 두 행이 모두 Joe Doe/JD로 표시됨을 확인했다. 원본 01:00:07과 두 행의 연결 ID는 미확인이고 현재 seed의 서로 다른 작업 ID를 합치지 않았다.

이번 직접 확인은 위 2장이다. 이전 9 Flow/42단계 MCP·PNG 검토는 [앞선 최종 검토](G29_RESULT.md#g25-g29-final-recheck)의 이력이며 이번에 42장을 전부 다시 확인한 것으로 쓰지 않는다. 이번 추가 검토에서 새 Gummble 조회는 하지 않았다.

### 실제 검증과 재검토

- 수정 전 담당자 키보드 검사 1/4 실패로 재현했다. 중간 9파일 실행의 42/43은 새 하위의 선택지가 한 개인 fixture에 검사 코드가 두 개 이상을 기대한 문제였고 실제 선택지 조건으로 바로잡았다. 시간 아바타 검사는 2파일 중 1/7 실패(`AL` 대 `A`)로 표시 차이를 재현했다.
- 수정 후 연결 검사 9파일 43/43(63.07s) 통과. handler 책임 분리 이후 최종 **9파일 43/43, 62.95s** 통과.
- 대상: task-entry 6, task-subtasks-entry 4, task-comments-entry 3, task-status-entry 2, task-lifecycle-entry 4, task-connected-journey 3, task-store 17, project-review-entry 3, project-client-flow 1.
- 새 고객→프로젝트→작업→하위/담당자→댓글→완료→보관/삭제 연결, 부모와 하위 완료의 독립성, 중복·실패·취소·범위/권한, 동명 다른 ID 보존, 프로젝트 시간 7초와 합계 $20.04, 원래 query/hash/history 복귀를 확인했다. G19/G20 필드·이미지 전수 검사를 이번에 다시 실행한 것은 아니다.
- 최종 `pnpm.cmd exec tsc -p tsconfig.app.json --noEmit --incremental false`, node config의 같은 검사, `pnpm.cmd exec eslint .` 모두 통과. Vite 메모리 빌드 **1976 modules / 3 outputs, 8.24s** 통과.
- Vitest는 FE/user-web cwd의 Node inline `startVitest`로 위 9파일을 실행했다. jsdom, React plugin, threads/maxWorkers=2이며 config/cache/fsModuleCache/coverage/optimizer를 끄고 stdout reporter만 사용했다. 빌드는 configFile:false/write:false/emptyOutDir:false/copyPublicDir:false로 실행했다. 기존 Browserslist 갱신 경고는 의존성 변경 없이 유지했다.
- 규칙·명세/R06·원본·변경 코드를 수정 후 다시 대조했다. 공통 Dialog/라우터/저장소/스타일은 변경하지 않았다. PLAN-INDEX 파싱·추가/변경 링크 및 앵커·diff 공백 검사 후 로컬 추가 커밋 대상으로 정리했다.

이전 전체 56파일 330/330은 `da6bcd2f`까지의 검증 이력이다. 이번에는 변경 영향에 맞춘 43개를 현재 코드에서 재실행했으며 전체 330개를 다시 통과했다고 보고하지 않는다.

### 남은 미확인과 영향

- 연결 browser session을 다시 조회했으나 없었다. 실제 브라우저 E2E·네트워크·네이티브 초점/IME·스크롤·확대/좁은 화면 검증을 수행하지 못했다. 합성 DOM 검사가 이를 대신하지 않는다.
- 원본 DOM/CSS·정확한 촬영 조건과 같은 조건의 FE 렌더 비교가 없어 폰트·색·치수·간격·아이콘·그림자·픽셀 동일성은 미확인이다. 이번 아바타 문구 보정만으로 동일 재현 완료라고 판단하지 않는다.
- 원본의 저장/취소·부모 완료·하위 삭제/복원·댓글 공개/알림·상태 정의 권한·보관 복원/삭제 cascade·시간/청구 정책은 기존 대기다. G21–G24 미확인도 유지한다.
- API/Backend/DB·환경·원격 push·배포 변경 없음. 검증용 파일·새 RESULT·스크린샷·trace·로그·임시 스크립트 등 산출물 없음.

판정: **이번 검토에서 발견한 코드 결함 2건 해소·관련 로컬 검증 통과 / 원본 동일성·실제 브라우저·미수록 정책은 부분 완료 유지**.
