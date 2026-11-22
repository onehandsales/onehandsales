# G29 — 보관·삭제 실행 결과

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
