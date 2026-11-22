# G27 — 댓글·활동 실행 결과

상태: 관찰 범위 목 구현·두 차례 검토·현재 전체 회귀 검증; 자료·시각·환경 대기. 실제 서비스·서버 영속성·외부 연동 완료가 아니다.

## 범위와 근거

G26 `4b474901` 커밋 뒤 깨끗한 작업 트리에서 시작했다. 기존 G25/G26의 TaskStore, 필드 저장, 하위 작업, AppShell/Dialog와 역할별 프로젝트 접근을 재사용했다. FRONT_AGENT/Decision006 및 엔지니어링 검토 기준을 적용했다. [R06 소비 분석](R06_RESULT.md)에 관찰 사실과 목 정책을 구현 전에 기록했다.

확인 기준일2026-11-21 KST, 실행 호스트 로그는21~22일이다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, Flow `1a0794d4-deb5-4eb3-b391-c7371c60e684`. 이번 MCP3단계와 연결 ANALYSIS4/5/8절 및 실제 PNG3장을 직접 확인했다. 카탈로그 Latest/2146은 G18 앱 조회와 기존 채택 근거를 재사용했으며 이번 flow 응답에는 별도 버전이 없다. 촬영일·서비스 빌드·실제 viewport/DPR은 미확인이다.

| 단계 | Screen ID | 직접 관찰 |
| --- | --- | --- |
| 01 | `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf` | 하위2행, 담당자/상태 자동 활동, 빈 댓글·연한 버튼 |
| 02 | `sc_afa221beae71493fa547575acdcfbcee` | To prepare a proposal after this call 입력·진한 Add Comment |
| 03 | `sc_f9353ec9e656421a9adf022fa0fd02ed` | 작성자·본문·시각·말줄임 행 추가, 입력 초기화 |

사용자 댓글은 일반 본문, 자동 활동은 회색 기울임 문구다. 원본의 상대시각과 Joe Doe는 가상 Alex/고정 UTC로 대체한 차이를 남긴다. Files의 붉은 선은 주석인지 제품 UI인지 확인되지 않아 오류 표시로 만들지 않았다.

## 구현과 상태 수명

- `/app/tasks?task=:id`, 프로젝트 `?tab=Tasks&task=:id`, 개요 집계→작업 패널, G18 협업자 접근이 같은 Task ID와 활동을 사용한다. 고객/프로젝트/하위 ID를 새로 복제하지 않는다.
- TaskActivity를 status/assignment/comment로 구분했다. 담당자 변경은 현재 배정 멤버의 이름 snapshot을 자동 활동으로 추가한다. 상태·담당자 값이 실제 바뀔 때만 기록하며 이후 작업 제목·사용자 이름을 바꿔도 과거 작성자/작업제목 snapshot을 다시 쓰지 않는다. 기존 seed에 가짜 과거 활동을 채우지 않는다.
- TaskActivitySection/ActivityRow는 표현, TaskCommentForm은 열린 패널의 입력, useTaskMutation은 pending/취소/중복/오류, TaskStore.addComment는 저장 원본과 접근 검사를 맡는다. 새로운 HTTP adapter·의존성·Backend·DB 변경은 없다.
- 댓글은 trim1~4000자의 plain text, 줄바꿈 허용이다. Enter는 줄바꿈이고 버튼으로만 제출하며 조합 중 제출은 막는다. HTML/Markdown/멘션/첨부를 해석하거나 실제 알림을 보내지 않는다. 본문 길이·제출·정렬·공개 범위는 원본 미수록 목 가정이다.
- 성공 시 같은 저장 원본의 목록 반영과 입력 초기화를 함께 처리하고 입력으로 포커스를 복귀한다. TaskPanel은 지연된 Query 목록 대신 Host가 제공하는 최신 저장 snapshot을 사용하므로 성공 직후 목록이 뒤늦게 나타나는 간격을 없앴다.
- 한 제출 UUID는 한 댓글만 생성한다. 실패는 입력을 보존하고 같은 Add Comment로 재시도한다. pending 입력은 잠그고 Cancel comment submission은 요청만 취소해 입력을 남긴다. 패널 닫기/뒤로/화면 이탈은 미저장 입력과 요청을 폐기한다. 이미 성공한 댓글은 남는다.
- 댓글 append는 부모 필드 revision과 하위 revision에 종속시키지 않는다. 저장 직전 최신 부모를 읽고 댓글만 추가한다. 부모 이름/상태/담당자 저장은 허용 필드만 추출하므로 병행한 댓글이나 하위 목록을 덮지 않는다. 없는 작업·배정 밖 작업·다른 workspace·오래된 세션·취소된 요청은 거부한다.
- G18의 허용된 프로젝트 협업자도 댓글을 조회/작성하는 명시적 목 정책이다. 고객 공개와 실제 서버 권한을 확정하지 않는다. 새로고침/새 탭/Reset은 seed와 인증 초기화, 같은 탭 로그아웃/재로그인은 저장 원본 유지다.
- 자동 활동은 최근 변경 우선, 댓글은 그 아래 작성순으로 표시한다. 고정 업무시각2024-02-07T12:00Z, ID로 순서를 구분한다. 고정 예시시각은 실제 타임라인이나 서버 순서의 증거가 아니다. 원본 실제 서버 정렬/시각 정책이 아니다.
- 댓글 말줄임은 명시적 미제공 Dialog와 Escape/닫기/포커스 복귀까지다. 편집·삭제·알림 성공을 만들지 않는다. 프로젝트 Recent Activity는 원본에 보이는 프로젝트 생성 기록을 유지하며, 댓글을 그 영역에 임의 추가하지 않는다. 개요는 같은 작업 집계와 패널 진입을 제공한다.

## 검토와 수정

1차 검토는 사용자 댓글/자동 이벤트 구분, 부모 저장과 독립 append, 중복·실패·취소·scope, 기존 G26 하위 저장 보존을 코드와 단위·브라우저 흐름으로 대조했다. 첫 타입 검사는 현재 TS lib에 없는 toReversed와 시험용 계정 ID 오류로 각각 실패했다. 필터가 만든 새 배열의 reverse를 사용하고 기존 가상 ActorId로 검사를 수정했다. 런타임/TS 설정을 넓히지 않았다.

첫 대상 브라우저12개 중11개 통과/1개 실패. 좁은 화면의 댓글 메뉴 검사에서 실제 작성자 `Alex (preview)` 대신 `Alex`를 exact 선택한 테스트 오류였다. 실행 시간 초과와 기능 결함을 혼동하지 않고 최초 screenshot/trace/log를 보존했다. 선택자 수정 뒤 댓글3개+G18~G27 연결1개가4/4 통과했다. 이 재실행을 최초12개 전체 통과로 합쳐 쓰지 않는다.

원본 비교에서 활동 간격/하단 여백이 부족해 댓글 전 상태에서 대응 위치까지 스크롤할 수 없음을 확인했다. 자동 활동·댓글폼을 연결하고 행 간격, h3 여백, 하단90px를 원본 관찰 기준으로 보정했다. 댓글 전 실제 scrollTop361/max361, 댓글 후362/max431로 대응 기준선에 맞췄다. 원본 scroll값을 확인한 것은 아니며 heading의 잉크 위치와 line box 차이를7px 보정한 정규화다.

2차 재검토는 한글 책임 주석30개(누락0), 수정 코드, 저장/이력/역할 경계, 현재 전체 단위 및 개발·빌드 E2E, 실제22캡처/18원본 비교를 대조했다. 실패 후 입력과 성공 후 초기화, 중첩 메뉴 Escape·포커스, 실제 global/project history, 좁은 폭·긴 한국어·합성 IME, 부모 수정 후 댓글/하위 보존을 확인했다. 확인된 수정 가능 결함을 후속 Goal로 미루지 않았다. 아래 원본/시각/환경 대기는 별도다.

## 실제 명령과 현재 검증

모든 pnpm 실행 cwd는 `FE/user-web`, Node24.18.0/pnpm8.14.1이다. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 `corepack pnpm typecheck`, `lint`, `test`, `build`를 실행했다. 최종 타입/lint/build 통과, 전체 단위21파일87/87 통과. 시각 CSS 보정 뒤 build를 다시 실행했다. build의 기존500kB chunk와 caniuse-lite 경고는 남아 있고 의존성을 임의 갱신하지 않았다.

- 대상1: `PLAYWRIGHT_JSON_OUTPUT_FILE=.../dev-target-first.json caffeinate -i corepack pnpm exec playwright test tests/e2e/task-comments.spec.ts tests/e2e/tasks.spec.ts tests/e2e/subtasks.spec.ts --workers=2 --reporter=list,json --output=.../dev-target-first` →11/12.
- 수정 후 대상2: 댓글/`g18-g27-journey.spec.ts` →4/4.
- 최종 전체 개발: `PLAYWRIGHT_JSON_OUTPUT_FILE=.../dev-all-first.json caffeinate -i corepack pnpm exec playwright test --workers=2 --reporter=list,json --output=.../dev-all-first` →143/143.
- 최종 전체 빌드: 위 명령에 `-c playwright.preview.config.ts`를 적용하고 `build-all-first` 경로 사용 →143/143.
- `...`는 `/tmp/onehandsales-g18-g27/G27`이다. 전체는 파일/grep 제한 없이 실행했고 navigation을 mock으로 바꾸지 않았다. 재시도 설정0, skipped0이다.

| 실행 | 통과 / 실패 | 실제 전체 요청 | API·외부 | 요청 실패 | console/page 오류 |
| --- | --- | --- | --- | --- | --- |
| `dev-target-first` | 11 / 1 | 28118 | 0 | 0 | 0 |
| `dev-target-second` | 4 / 0 | 9378 | 0 | 0 | 0 |
| `dev-all-first` | 143 / 0 | 490681 | 0 | 0 | 0 |
| `build-all-first` | 143 / 0 | 6540 | 0 | 0 | 0 |

요청을 차단하거나 route intercept하지 않았다. 동일 origin 정적 자산/문서 GET과 개발 HMR은 API로 계산하지 않고 원본 로그에 남겼다. 실패 요청도 미발생으로 처리하지 않았다. 5173 별도 캡처22개에서도 요청1877, API/외부·실패·console/page 오류0이었다. 개발5175/빌드4175 검사용 서버는 종료하고 기존5173 PID59363을 보존했다. 모든 장애 시나리오는 각 검사 마지막 normal 또는 컨텍스트 종료로 초기화했다.

G18~G27 단일 연결 검사는 신규 고객→필드 정의/고객값/로컬 이미지→그 고객의 새 프로젝트→단계·태그·표/보드→이름·설정→작업→완료 하위→소유자 댓글→같은 프로젝트 초대 수락→협업자 하위 배정/댓글→소유자 재로그인→같은 ID·댓글·이미지·필드 재확인까지 실제 navigation으로 통과했다. G01~G17 기존 공개/인증/회사/브랜드/팀 회귀도 전체 검사에 포함했다.

## 시각 비교와 임시 자료

- 원본: `bonsai_analysis/flows/Project detail/Adding a task/Adding a comment/screens/`3장. G26의 Adding subtasks10/Editing a subtask5장은 같은 채택 근거를 재사용해 현재 구현과 다시 비교했다.
- `/tmp/onehandsales-g18-g27/G27/source/01~03.png`, `mcp-sources.json`, `captures/comment-01~03.png`, `captures/g26-add-01~10.png`, `captures/g26-edit-01~05.png`, 좁은/확대4장.
- `compare/comment-01~03.png`, `compare/g26-*.png`18개와 `compare/sheet-01~06.png`6장을 직접 확인했다. `capture.mjs`, `capture-report.json`, `compare.py`에 실제 치수·스크롤·네트워크를 기록했다. 비교 스크립트 첫 실행의 파일명 하이픈 누락은 도구 오류이며 경로를 고친 뒤18개 생성했다.
- 원본2880×1800을 MCP1440×900에 정규화, 구현 Chromium148.0.7778.96, 1440×900/DPR1 및320×600. 실제 원본DPR2/viewport라고 단정하지 않는다. Gellix18/14/12px, 입력72px·버튼36px, 카드/아바타/선/간격·색/상태를 관찰 대조했다. 원본 폰트 파일 동일성과 CSS 수치는 추정이다.
- 남은 차이: 가상 이름/이니셜·고정UTC와 원본 상대시각, 과거 빈 개요와 현재 저장된 작업 집계, 의도적으로 미구현한 붉은 주석/외부 도움말 위젯, 접근성 focus outline과 취소/오류 안내, 일부 font/icon/shadow·상단 description/구분선/미세간격. 완전 일치라고 보고하지 않는다.
- 320폭의 본문/입력/CTA 실제 좌우 경계와 긴 한국어를 확인했다. CSS 확대에서 본문·입력·버튼이 가로 경계 내에 있고 긴 본문은 패널 안에서 세로 스크롤된다. 합성 composition과 CSS확대를 실제 OS IME/시스템 접근성 검증으로 쓰지 않는다.

문서 검토에서 G 명세 색인의 오래된 G18/G19/G24 연결 대기를 갱신하고, R02의 삭제된 과거 evidence 링크4개는 당시 경로를 보존하며 현재 부재로 표시했다. 자료 폴더는 복원하지 않았다. 정정 후 관련 로컬 문서 링크1336개가 모두 존재하며 diff 공백 검사도 통과했다.

모든 캡처·비교·로그는 위 `/tmp`의 임시 보관이며 영구 증거가 아니다. `_evidence`와 삭제된 RESULTS/evidence는 만들거나 복원하지 않았다.

## 남은 자료·환경·서버 메모

댓글의 고객 공개/실제 역할별 정책, 행 메뉴 편집·삭제·멘션·알림, 실제 정렬/시각/영속성·글자 제한·모바일 원본은 미확인이다. R06 반복/파일/Gantt·의존성·G28 이후 소비는 대기다. 실제 OS 한글 IME·보조기술·Safari/Firefox·실기기는 실행하지 않았고 해당 환경에서 확인이 필요하다. 앞선 G01~G26의 원본·시각·환경 대기도 유지한다. 서버 확인을 위해 API/Backend/DB로 확대하지 않았다.

## 5173 최종 확인 순서

1. `/app/clients`→Continue as Alex→New Client→회사·담당자·샘플 이메일 저장. Edit Fields에서 필드 추가→같은 고객 값 입력, 로컬 PNG 선택/Save Image.
2. 고객의 Add project→프로젝트 생성→단계 변경→전체 Projects의 Tags와 List View/Board View 확인→같은 프로젝트 Settings 저장. 과거 생성 이름은 유지.
3. Overview의 new task 또는 Tasks→New Task→제목 저장→상태/기한/담당자→Add Subtask/Save→완료/배정. 하위 완료만으로 부모가 Done이 되지 않음.
4. 댓글 입력/Add Comment→목록과 빈 입력 확인→작업 이름 변경→기존 댓글 보존→닫기/뒤로/앞으로/전체 Tasks에서 같은 ID 재진입.
5. Invite Team에서 그 프로젝트의 Collaborator 초대→Team preview controls의 local invitation→Sign out and continue→샘플 이름/비밀번호로 수락→배정 Tasks에서 같은 하위/댓글 확인·추가→Logout/Continue as Alex로 저장 확인.
6. Task preview controls의 write-error로 댓글 실패/입력 보존/재시도, slow로 Cancel 또는 패널 이탈→늦은 댓글 없음→normal 복원. 댓글 말줄임은 미제공 안내/Escape 복귀. 새로고침은 인증·목 원본 초기화.

G27 로컬 커밋 후 종료한다. G28·push·배포는 수행하지 않는다. [10개 Goal 연속 결과](G18_G27_RESULT.md).

## 2026-11-22 G28 연결 회귀

[G28 결과](G28_RESULT.md)에서 상태 UI를 native select에서 원본 메뉴/정의 설정으로 보완했다. 동일 작업/하위/댓글 ID와 과거 활동 표시명 snapshot, 완료 의미·시간 불변을 검증한다. 공통 mutation 재시도 중 오류/버튼 유지로 더블클릭의 backdrop 닫힘을 수정했다. 이번 실제 전체 검사/재실행 결과는 G28에 기록하며 위 과거 실행 결과를 덮지 않는다. 기존 자료·시각·환경 대기는 유지한다.
