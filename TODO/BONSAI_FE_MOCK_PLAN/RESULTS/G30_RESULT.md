# G30 — 작업 템플릿 작성 실행 결과

2026-11-22 KST. 상태: 관찰 범위 목 구현·누락 보완·두 차례 검토·시각 비교·현재 회귀 검증; 자료·시각·환경 대기; G31 연결 검증은 아래 후속 기록 참고. 원본 미수록·시각 차이·환경 대기는 별도다. 아래 최종 실행 결과까지는 G30 최초 커밋12b20736 시점의 기록이다. G31 적용 후 독립성은 마지막 후속 절에서 검증 결과를 추가했다.

## 기준과 소유 범위

시작 HEAD `f14542e0`, clean. G28 `dc631acf`·G29 결과와 현재 G01/25 코드를 대조했다. 기존 127.0.0.1:5173 PID59363·사용자 자료를 보존했다. FRONT_AGENT README·아키텍처·컴포넌트·상태·목·접근성·한글 주석·테스트·엔지니어링 검토, PM/UX·Decision006 및 공통 계획을 적용했다. AGENT_USAGE_RULES.md는 없으며 과거 TODO 접근 금지/서버 선행 지침 대신 사용자 범위와 Decision006을 적용했다. Backend/DB/API 계약/HTTP adapter를 수정하지 않는다.

기존 Templates 소개 그림/문구는 유지하고 실제 빈 저장소·선택·작성 흐름으로 연결했다. TaskStore와 기존 G25~29 업무 원본은 교체하지 않았다. AppProviders에 별도 TemplateStore를 연결했고 기존 Dialog·QueryScope·가상 세션·Object URL 수명을 재사용했다. 기존 소개 컴포넌트의 책임을 task-template의 workspace로 옮겼다. 신규 기능·hook·함수에는 한글 책임 주석을 적용했다.

## 원본 확인

[R06 이번 소비 분석](R06_RESULT.md)의 2026-11-22 G30/G31 절을 따른다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` / `bonsai-web`. MCP batch3flow19단계 성공, G30은 아래2flow12단계(공통1장 중복). 각 ANALYSIS와 로컬 PNG를 직접 확인했다. get_app 첫 인자 검증 실패 후 올바른 slug/version_id로 Latest/2146·642screens 확인. 카탈로그 버전이며 촬영일·서비스 빌드·실제 viewport/DPR은 미확인이다. 현재 사이트를 새 디자인 근거로 사용하지 않았다.

| Flow | 단계순 Screen ID |
| --- | --- |
| Creating a task template `4c98a858-6ef7-4a6a-8e83-e626772a4df0` | 01 `sc_6ec51256385940f2bd7d36a76874d691`, 02 `sc_f38d24ed977448da8e9f4a82a4403686`, 03 `sc_ca533f6c3a4e43759ed9b62cfad3a964`, 04 `sc_e6ee191223c2486caf3d9d87a12154e8` |
| Editing a template task `91a75fcf-9857-41ff-85c2-c2de0bae87d9` | 01 `sc_e6ee191223c2486caf3d9d87a12154e8`, 02 `sc_3088f428e5f84ace8f8cc9d9826275f6`, 03 `sc_5d0895da618a47a4a2f0a2da3bfe2f7f`, 04 `sc_1d39460fb10d405593f5c080ed7d6df1`, 05 `sc_821e823e6105444082ad4c65794640fc`, 06 `sc_330426d10b684bcd95b8f55415c0957c`, 07 `sc_ce3533bae1e9437a9649f05418b21537`, 08 `sc_cd414dd8295f418b979e3494a1cfd1eb` |

원본: `bonsai_analysis/flows/Tasks/Creating a task template/screens/`, `Tasks/Editing a template task/screens/`. 원본2880×1800을 MCP 메타데이터1440×900 비교 좌표로 정규화했다. 이것으로 실제 DPR=2를 확정하지 않는다. MCP 응답 `/tmp/onehandsales-g30-g31/mcp-sources.json`, 앱/검색 결과 `research-metadata.json`. source/create-01~04.png·edit-01~08.png. 최초 시스템python PIL 부재는 기존 `/tmp/onehand-visual-venv`로 해결했고 앱 의존성은 추가하지 않았다.

## 구현과 명시한 목 정책

- `/app/tasks?tab=Templates`: 빈 안내 → New Template → 이름만 있는0개 작업 → New Task → 편집 → Save Task → 목록/재진입. `template`, `templateTask`, `templateDialog` query와 실제 브라우저 이력을 사용한다. 직접 URL의 사라진 ID는 unavailable/복귀로 처리한다.
- 이름 trim1~120자, 작업/하위 제목1~200자, 설명4000자. 중복 이름은 허용하되 workspace/template/task/subtask/file ID는 각각 분리한다. owner 작성, 멤버 조회는 원본 권한 미수록에 대한 목 선택이다. 추가 전체 템플릿 삭제·드래그/다단계·일반 작업 첨부 시스템은 구현하지 않는다.
- 이름 생성/변경과 작업 저장을 분리한다. 하위 Save·체크·첨부 추가/제거는 **상위 편집 초안만** 변경하며 Save Task에서 전체 원자 저장한다. 상위 취소/Escape/이력 이탈은 모두 폐기하고 실패는 입력을 보존한다. 저장하지 않은 하위 입력은 안내 후 먼저 저장/취소하도록 해 조용한 유실을 막는다. 기존 구성 작업 삭제 확인은 명시한 목 정책이다.
- 로컬 PNG/JPEG/WebP 2MB까지 실제 디코딩 후 첨부. 손상/형식/크기 오류와 재시도·읽기 취소, 파일 선택창 취소, 초안 제거·상위 취소·저장 재진입을 분리했다. Blob은 불변 참조이며 가변 파일 목록/이름/하위 배열은 복사한다. useObjectUrl은 표시·교체·unmount 시 생성/해제하고 Reset은 저장 Blob 참조도 비운다. 구름 아이콘은 외부 업로드 성공 표시가 아니다.
- 생성 submission ID는 동일 의도를 한 번만 저장한다. 새 명시적 생성은 다른 ID다. revision 충돌·삭제 후 늦은 수정/재실행·취소·scope 변경을 거부한다. 하위 초안의 완료값은 템플릿 내부 값일 뿐 실제 작업을 변경하지 않는다.
- 목록/편집은 한 TemplateStore를 사용한다. 같은 탭 로그아웃은 저장값 유지/초안 폐기, 새로고침·새 탭·Reset은 인증과 전체 seed 초기화. query와 workspace 경계를 분리한다. 모달 닫기는 이력이 있으면 뒤로, 직접 주소면 편집 query만 제거한다. 정적인 화면에 비동기 서버 요청을 추가하지 않았다.
- G31에서만 적용/실제 작업 ID 복제·첨부/하위 ID 독립성·완료/보관/삭제 연결을 검증한다. G30 구현에 적용 화면은 포함하지 않았다.

## 두 차례 검토와 보완

1차 검토는 G30 5절/6절·R06·원본12상태와 실제 store/UI를 대조했다. 하위 미저장 입력 유실 가능성, 원본 그림을 데이터 seed로 쓰는 혼동, 상위 취소/파일 수명·동명 ID·읽기/쓰기 오류·중복/경합의 검증 누락을 보완했다. 단위 검사는 저장 원본·revision·독립 배열·삭제 재실행·scope·Reset/권한을 검증한다.

브라우저 검토에서 이름 변경 성공 후 동일 페이지 이력이 남음 → rename 성공은 원래 목록 이력으로 닫도록 수정. 삭제 publish 직후 current() 결과에서 대상이 사라져 편집기가 unmount되고 성공 복귀가 취소됨 → 조회 snapshot 유지 후 refetch하고 성공 callback에서 실제 이력 복귀. 오래된 편집 revision이 새 props로 바뀔 수 있음 → 진입 revision을 고정. 빠른 모달 재진입은 ref/query guard로 이력 중복을 막았다.

2차 재검토는 원본/구현 캡처와 public CSS 포함 실제 앱, 실패 후 재시도·좁은 화면·직접/앞뒤 이력을 재확인했다. 공개 템플릿 `.template-empty`와 충돌하여 작업 빈 박스 높이가190px로 늘어난 누락 → `.task-template-empty`로 분리하고130px 원본 상당값에 맞췄다. 입력16px·섹션18px·footer46px·간격도 원본 정규화 비교로 보정했다. 정확한 원본 폰트 값으로 단정하지 않는다. textarea 입력 후 label locator가 값까지 포함한 시험 불안정은 명시적 aria-label로 보완했다. 장애 select의 명시적 접근성 이름을 추가했다.

## 실행 검사 — 최초 결과와 재실행 구분

실행 위치 `FE/user-web`, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, `corepack pnpm`8.14.1. Node 요구>=24<25. 모든 신규 로그/캡처는 `/tmp/onehandsales-g30-g31/G30/` 아래이며 `_evidence`를 만들지 않았다.

- 첫 typecheck/lint는 구현 소스 기준 통과. 새 단위 테스트 추가 뒤 typecheck에서 배열 undefined 가능성 오류 → 시험의 존재 assertion 수정. 이후 typecheck/lint 통과; 중단되어 실행되지 않은 lint/build를 통과로 합치지 않는다.
- 단위 전체 첫97/97, 재검사97/97. `pnpm test` 실제 결과이며 이전93건 기록을 재사용하지 않았다.
- 새 개발 E2E 첫1/4: rename 이력 결함·장애 select 이름 선택 문제. 2차2/4: 손상된1px PNG 시험 fixture와 삭제 복귀 결함. 3차3/4: textarea label 조회 문제. 손상 파일을 정상으로 받아들이도록 구현을 완화하지 않고 저장소 내 실제 PNG를 시험에 사용했다. 각 `dev-first/second/third.log/json`과 trace를 보존한다.
- 최종 typecheck/lint/unit/build 및 개발 영향 범위/빌드 전체 결과는 아래 최종 검증 절에 기록한다. 자동 retry=0. 테스트 실패·개별 재실행·전체 실행을 합쳐 쓰지 않는다.
- 첫 캡처는 Add Subtask 앞 ＋ 문구를 빠뜨린 locator로 중단 → locator 보완 후13캡처 성공. capture-first.log·capture-second.log 보존.

## 시각 비교와 남은 차이

구현 `G30/captures/create-01~04.png`, `edit-01~08.png`, `narrow-editor.png`; 좌우 비교 `G30/comparisons/`, 실제 주소·폰트·경계·스크롤 `capture-report.json`. 브라우저 Chromium1440×900 DPR1, 좁은320×600. 편집05~07은 원본 전체 모달 스크롤 대신 현재 공통 Dialog의 내부 스크롤을 사용하며 scrollTop을 기록한다. UI 전체를 PNG로 덮지 않았고 입력/첨부/하위/목록은 실제 요소다.

남은 차이: 원본의 정확한 폰트 파일/가중치와 일부 아이콘, 원본 파일04의 이름만 표시하는 상태 지속시간,05~07의 원본 그라디언트 이미지 자산, 전체 모달 스크롤과 내부 스크롤 차이. 테스트용 로컬 PNG는 원본 첨부 파일이라고 주장하지 않는다. 시안의 하단 도움말 버블·기존 공통 셸 avatar/개발 도구 차이와 모바일 원본 미수록은 유지한다. 불필요한 자동 로딩 지연/가짜 업로드 성공을 만들지 않았다. 원본100% 일치가 아니다.

미검증: 실제 OS 한글 IME·보조기술·Safari/Firefox·실기기. 합성 composition/키보드·CSS 확대를 실제 OS 검증으로 쓰지 않는다. 실제 파일 보관/업로드/영속성·서버 권한·삭제 cascade·버전 충돌 정책은 후속 질문이다.

## 미리보기 확인 순서

1. http://127.0.0.1:5173/app/tasks?tab=Templates → Continue as Alex → New Template → Default Task 생성.
2. 빈 박스 확인 → New Task → 제목/설명 입력 → 로컬 이미지 선택 → 하위 입력 Save → Escape. 다시 열면 미저장 작업은 없다.
3. 같은 내용 입력 → Save Task → 목록 펼치기 → Edit task에서 첨부/하위 재확인. 첨부 제거 후 상위 취소는 저장 파일을 유지한다.
4. Template preview controls의 write-error/slow로 실패 후 재시도·Cancel save를 확인하고 normal로 복원한다.
5. 이름 변경·동명 템플릿·Template options 선택·뒤로/앞으로/직접 URL·workspace/로그아웃 복귀·새로고침 초기화를 확인한다.


### 2차 검토의 추가 발견과 재검증

개발 영향 범위 검사에서48/49, 당시 빌드 전체156/157이었다. 실패1건은 write-error 후 Save Task 더블클릭이다. pending이 Cancel save를 footer에 끼워 넣으며 두 번째 포인터 클릭이 취소 버튼을 눌렀다. 저장/취소/삭제의 자리를 grid와 예약 공간으로 고정하고 Save Task 폭도 고정했다. 실제 더블클릭·실패 후 입력·취소·중첩 미리보기·320px 검사5/5 재통과했다. 같은 검사를 두 번 했다는 이유로 결함을 남기지 않았으며 이 수정 뒤 관련 부분을 재검토했다. 빌드 최종 영향 검사는 별도로 기록한다.

최종 정적 검사는 typecheck-commit.log/lint-commit.log, 최종 빌드는 build-commit.log. 기존 Browserslist 데이터 나이·500kB 번들 경고는 경고이며 외부 업데이트/대규모 분할을 이번 범위로 확장하지 않았다. 새 캡처의 실제 API/외부 요청·HTTP/요청 실패·console/page 오류는0이며 요청을 가로채지 않았다. 개발 HMR WebSocket/정적 자산/로컬 blob은 업무 API와 구분한다. 모든 브라우저 검사는 실제 React Router navigation을 사용했다.

## 최종 실행 결과

G30 작업 템플릿 작성의 목 구현·누락 보완·두 차례 검토·12상태 비교를 수행했다. 단위97/97, 개발 영향48/49 후 수정 대상5/5, 빌드 전체156/157 후 최신 빌드 영향10/10 통과. 최초 실패와 수정 후 재실행을 구분한다. G31 적용·독립성 연결은 G30 커밋 이후 진행하며 자료·시각·환경 대기를 유지한다.

| 검사 | 실제 결과/로그 |
| --- | --- |
| typecheck · lint | 통과, typecheck-commit.log · lint-commit.log |
| 단위 전체 | 22파일97/97, unit-complete.log |
| 개발 영향 범위 | 10파일48/49, dev-affected.log/json; 수정 및 추가 문맥 검사5/5, dev-fixed.log/json |
| 빌드 전체 | 156/157, build-all.log/json; footer 수정 후 새 build-commit.log 빌드 통과 |
| 최신 빌드 영향 범위 | 작업 작성5 + 공개 템플릿5 = 10/10, build-fixed.log/json |
| 실제 5173 캡처 | 13장, capture-final.log/capture-report.json |

브라우저 명령: `pnpm exec playwright test tests/e2e/task-template-writing.spec.ts --workers=1 --timeout=60000`, 개발 영향은 tasks/subtasks/task-comments/task-status/task-lifecycle/project-creation/project-settings/app-shell/foundation 파일을 추가했고 workers=2. 빌드 전체는 `-c playwright.preview.config.ts --workers=2 --timeout=60000`, 최신 빌드 영향은 여기에 task-template-writing.spec.ts·template.spec.ts를 지정했다. 각 실행의 PLAYWRIGHT_JSON_OUTPUT_FILE 및 --output을 위 /tmp 경로로 지정하고 `--reporter=list,json`을 사용했다.

- dev-affected: 관찰49개, 요청149816건, 실제 API/외부0건, 실패0건, console/page 오류0건.
- dev-fixed: 관찰5개, 요청11369건, 실제 API/외부0건, 실패0건, console/page 오류0건.
- build-all: 관찰157개, 요청6751건, 실제 API/외부0건, 실패0건, console/page 오류0건.
- build-fixed: 관찰10개, 요청492건, 실제 API/외부0건, 실패0건, console/page 오류0건.

현재 수정 가능한 G30 동작 누락은 보완·재검토했다. 실패한 전체 검사 기록을 최초 전체 통과로 바꾸지 않는다. 실제 서비스/API/출시 완료가 아니며 G31 구현을 이 커밋에 포함하지 않는다. 미리보기 기본 시나리오 normal 유지.


## 2026-11-22 — G31 커밋 단계의 연결 검증 추가

위 G30 최초97개/개발48/49/빌드156/157 및 당시 연결 대기는 커밋12b20736 시점의 기록이다. 그 커밋 후 [G31 결과](G31_RESULT.md)에서 작성한 정의를 실제 작업으로 적용하고 독립성을 확인했다. 제목·설명·첨부 메타데이터·하위 항목을 새 작업/하위/첨부 ID로 복사한다. 템플릿 편집·첨부 제거는 기존 작업을 덮지 않고 실제 작업 편집·완료·보관·삭제는 템플릿/다른 적용 세트에 영향을 주지 않는다. 같은 제목을 ID로 분리하고 실패/중복/취소·늦은 변경을 검증했다.

G30 표시 전용 파일 카드를 공통 LocalImageCard로 옮겨 G31 실제 작업 상세에서도 같은 로컬 미리보기/URL 수명을 사용한다. G30 작성·저장 정책을 바꾸지 않았으며 일반 작업 파일 시스템을 추가하지 않았다. 현재 단위100/100, 연결 개발9/9 및 최신 빌드9/9(각 G30 작성5·G31 적용4), 개발 영향57/58와 수정 전 빌드160/161의 최초 hash 결함/수정은 G31 결과에서 분리했다. G30의 연결 검증 대기는 이 범위에서 해소했으나 이전 시각·원본 자료·OS IME/보조기술/추가 브라우저 대기는 유지한다. 추가 변경은 G31 커밋에 포함하고 G30 커밋을 amend하지 않는다.
