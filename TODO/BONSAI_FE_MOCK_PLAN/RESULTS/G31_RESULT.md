# G31 — 작업 템플릿 적용 실행 결과

2026-11-22 KST. 상태: 관찰 범위 목 구현·누락 보완·두 차례 검토·G30 연결 회귀·시각 비교 수행; 자료·시각·환경 대기.

## 시작 기준과 근거

G30 로컬 커밋 `12b20736` 완료와 clean 상태 확인 후 G31 코드를 시작했다. G30 커밋을 amend하지 않는다. 이전 G28 `dc631acf`/G29 `f14542e0` 및 G01·G21·G25~G30 원본 저장소/권한/실제 이력을 대조했다. 기존 127.0.0.1:5173 PID59363과 사용자/임시 자료를 보존한다. 적용 지침·누락 문서/우선순위는 [G30 결과](G30_RESULT.md)와 동일하며 Decision006·현재 사용자 범위가 우선이다. Backend/API/DB/실제 인증·외부 연결은 없다.

R06 보완은 G30 전에 두 Goal의 소비 범위로 수행했다. Gummble batch의 `Tasks/Adding a task (template)` `d348e200-5e48-4825-a646-69a6741e85d8`7단계, 해당 ANALYSIS 및 원본PNG7장을 직접 확인했다. G31 착수 때 별도 새 MCP 조회를 했다고 쓰지 않으며 동일 요청에서 확보한 근거를 사용했다. App Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`/bonsai-web, 재확인 카탈로그Latest/2146·642screens. 촬영일·서비스 빌드·실제 viewport/DPR은 미확인이다.

| 단계 | Screen ID | 관찰 및 적용 경계 |
| --- | --- | --- |
| 01 | `sc_fd79ede42b9843aca369d4e929c4272c` | 전체 보드·기존 Initial Chat/In Progress |
| 02 | `sc_118bf693c6174ae4b7e209fb1221a5ad` | Add from a task template 진입 힌트·기존 작업 Done; 상태 변경 과정 미수록 |
| 03 | `sc_0b8ddeccb45b4c09aac0680c15f68ca9` | Select Task Template, 두 선택 전 |
| 04 | `sc_8f8c685485c6437184cf778ab3ac510b` | Default Task만 선택·연한 버튼; 실제 disabled 속성은 미확인 |
| 05 | `sc_de382cd5fbb94d6ca3ebcf1647b1919a` | Consulting Project까지 선택·Create New Tasks |
| 06 | `sc_dcb91b20475d4ba791eedac5320b320b` | Update company guideline/To Do/No due date 새 카드·성공 안내 |
| 07 | `sc_3eef549a1670486daf06221156e198bc` | 새 카드 Feb09; 기한 편집 과정/연도·시간대는 미수록 |

MCP 원본 응답 `/tmp/onehandsales-g30-g31/mcp-sources.json`, 정규화 `source/apply-01~07.png`. 원본은 `bonsai_analysis/flows/Tasks/Adding a task (template)/screens/`. 2880×1800 PNG를 MCP 메타데이터1440×900 비교 좌표로 정규화했다. 실제 DPR=2라는 뜻이 아니다. 원본 태스크 그림/placeholder를 실제 정의 seed로 쓰지 않았다.

## 구현·목 선택·상태 수명

- 전체/프로젝트 보드의 아이콘은 `applyTemplate=new`, 필요 시 `templateProject=<id>`의 로컬 이력으로 진입한다. 수정키 새 탭 동작을 보존하고 빠른 연속 클릭은 한 이력만 만든다. 프로젝트 보드 진입은 현재 프로젝트를 미리 선택하는 목 가정이며 전역 진입은 미선택이다. 관찰 tooltip을 hover/키보드/Escape로 제공한다.
- 선택지는 G30 TemplateStore와 G21 ProjectStore의 현재 같은 workspace/접근 허용 ID를 사용한다. 이름이 같아도 ID로 구분하고 동명 선택지는 순번을 덧붙인다. 두 항목 미선택·빈 템플릿·사라진 템플릿·배정 밖/없는 프로젝트에서는 생성할 수 없다. 버튼 색에서 원본의 HTML 검증 속성을 추정하지 않고 필수 선택 검증을 목 정책으로 정했다.
- 저장된 템플릿 snapshot의 **전체 구성 작업을 한 번에 생성**한다. 하나의 항목/관계/파일이 유효하지 않거나 실패·취소·문맥 변경이면 전부 생성하지 않는다. TaskStore의 `createBatch`는 저장 직전까지 원본/프로젝트/revision·접근·scenario와 AbortSignal을 검사한다. 템플릿/프로젝트 저장소 버전이 진행 중 바뀐 경우 다른 항목 변경도 보수적으로 재확인을 요구한다.
- 각 실제 작업은 새 작업 ID, 하위는 새 subtask ID/parentTaskId, 첨부는 새 file ID를 갖는다. 제목·설명·파일 이름/불변 Blob·하위 제목을 복사한다. 실제 작업은 안정된 `To Do` 상태 ID, 담당자 없음, 기한 없음, 하위 미완료/미배정, 활동/댓글 없음으로 시작한다. 템플릿 하위의 체크값을 실제 작업 완료로 복사하지 않는 목 정책이다.
- 같은 submission ID는 성공 세트를 재사용하며 더블클릭·같은 실패 재시도로 중복 생성하지 않는다. 다시 모달을 열어 적용하거나 선택을 바꾸는 새 의도는 별도 세트다. 기존 성공 세트의 작업이 보관/삭제된 뒤 과거 submission을 다시 실행해도 부활시키지 않는다. 서버 idempotency/API 계약이 아니라 프론트 내부 목 경계다.
- 원본 정의와 적용된 작업, 반복 적용 결과 사이의 가변 배열/하위/설명/파일 메타데이터는 분리한다. Blob 바이트만 불변 참조를 공유하며 Object URL은 카드/미리보기 표시 수명마다 별도로 생성·해제한다. 생성된 작업은 기존 전체/프로젝트 보드·동일 ID 상세·요약에 즉시 연결된다. 상세의 복사된 파일은 로컬 미리보기만 제공하고 일반 Add File은 기존 미제공 안내를 유지한다.
- 적용 결과의 제목/하위/상태 변경·완료·보관·삭제는 원본 정의와 다른 세트를 변경하지 않는다. 템플릿 이름/작업/첨부 수정도 기존 실제 작업을 덮지 않는다. 기존 Initial Chat의 상태·기한·시간·금액·프로젝트 기록을 적용으로 변경하지 않는다. `Feb09`는 자동 기한이 아니다.
- 취소/Escape/이력 이탈은 진행 적용을 abort하고 선택 초안을 폐기한다. Cancel creation은 선택을 유지하며 다시 생성 가능하다. 실패는 선택/오류를 유지하고 명시적 재시도한다. 취소 후 앞으로 재진입은 새 초안이다. 원래 필터/검색/hash와 이력을 보존한다. 결과가 필터에 가려져도 생성 개수와 `View project tasks`로 실제 결과를 찾는다. 토스트만으로 성공 처리하지 않는다.
- 같은 탭 로그아웃은 저장 정의/작업 유지·초안/피드백 제거. 새 탭·새로고침·Reset은 인증과 각 저장소를 초기화한다. 목 역할: 템플릿 정의는 owner 편집/멤버 조회, 적용은 기존 작업 생성과 같이 접근 허용 프로젝트에 한정하며 협업자도 배정 범위를 넘을 수 없다. 실제 Bonsai 권한 확정이 아니다.

## 두 차례 검토·누락 보완

1차 검토는 G31 완료 조건과 R06·원본7상태를 실제 TaskBoard/TaskStore/프로젝트/TemplateStore와 대조했다. 기존 진입점이 미제공 안내에 그친 부분을 실제 선택/적용/복귀로 교체했다. 일괄 적용 실패 경계·재실행 중복·오래된 원본/접근·복사된 첨부 상세·ID 독립성·원본0개 작업의 누락을 보완했다. 이력/텍스트·시각·permission·retry 및 필요한 회귀 검사 항목을 분리했다.

G30 파일 카드와 G31 실제 작업 파일이 별도 기능을 서로 import해 순환하지 않도록, 표시 전용 LocalImageCard를 공통 UI로 이동하고 기존 G30 export/작성을 유지했다. task-template가 tasks의 공개 저장소 경계를 사용하며 tasks는 template feature를 import하지 않는다. Blob이 포함된 작업 반환/완료/편집에서 가변 데이터만 복사하는 copyTask를 사용한다. 기존 필드 저장은 첨부를 입력 초안에서 덮지 않고 현재 저장 원본의 첨부를 보존한다.

2차 검토는 새 단위/브라우저 결과와 실제 비교 캡처를 대조했다. 원본의 선택 placeholder/화살표/템플릿만 선택한 연한 버튼/진입 tooltip 누락을 보완했다. G30에서 고친 연속 클릭 시 취소 버튼 이동 결함을 적용 모달에서도 막기 위해 제출 버튼 위치와 취소 위치를 고정했다. 캡처 과정에서 저장 성공 뒤 목록의150ms 재조회가 끝나기 전에 찍힌 상태를 발견해 실제 카드의 Done/Feb09까지 기다린 뒤 다시 캡처했다. 이 캡처 준비 문제를 적용의 자동 상태/기한 변경으로 해석하지 않았다.

자료 부족(실제 권한·복사/보관·영속성·모바일 원본)과 구현 누락은 구분한다. 수정 가능한 이번 범위 누락은 코드·검증을 보완했으며 후속 반복/Gantt/일반 파일 시스템으로 확대하지 않았다. G30 연결 보완은 이번 G31 커밋에 포함하고 G30 결과에 추가 연결한다.

## 실행 기록과 최초 실패

위치 `FE/user-web`. Node24.18.0/pnpm8.14.1, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0 && corepack pnpm …`. 임시 자료 모두 `/tmp/onehandsales-g30-g31/G31/`; `_evidence`를 생성하지 않았다.

- 구현 소스 첫 typecheck/lint 통과; 새 테스트 포함 typecheck/lint 통과. 로그 typecheck-first/tests/final.log·lint-first/tests/final.log.
- 단위 전체 첫99/100: 기존 불변성을 비교할 때 TaskView의 표시용 projectName/assigneeName을 Task 원본과 직접 비교한 시험 오류. 양쪽 동일 Task 원본 snapshot을 대조하도록 정정 후100/100(23파일). unit-first.log·unit-second.log를 각각 보존한다.
- 첫 개발 적용 검사2/3: 비동기 G26 완료 checkbox에 `.check()`의 즉시 상태 확인을 사용해 실패. 실제 클릭 후 저장된 완료 상태를 기다리도록 수정했고 G30·G31 연결8/8 통과. 기존 G26이 사용하는 확정 후 표시 정책을 임의 optimistic UI로 바꾸지 않았다. dev-first.log/json·dev-second.log/json 보존.
- 개발 영향·빌드 전체·최신 시각 변경 후 영향 검사는 아래 최종 절에 기록한다. 기존 테스트 통과 수는 이번 결과로 대신하지 않는다.
- 원본 비교 캡처 첫9개, 저장 후 목록 상태 준비를 명시한 재캡처9개 성공. capture-first/final/checked.log, capture-report.json. Network interception/navigation mock 없음.

## 시각 비교·잔여

구현 `G31/captures/apply-01~07.png`, `copied-details.png`, `narrow-apply.png`; 좌우 비교 `G31/comparisons/apply-01~07.png`, 전체 조건 `capture-report.json`. Chromium1440×900 DPR1, 좁은320×600. 중앙 모달은 정규화 폭460px/top60, 헤더24/32px, 본문18/24px, 선택16/22px·40px, CTA46px, 여백40/20px를 비교 추정값으로 사용했다. 정확한 원본 폰트/수치로 단정하지 않는다.

기존 canonical 작업3개/프로젝트명을 보존하여 원본의 한 Initial Chat/Consulting Project와 카드 수·행 위치·문구가 다르다. 출처가 다른 캡처의 ID를 합치거나 기존 데이터를 지우지 않았다. 원본02의 Done은 캡처 준비에서 사용자가 기존 상태 picker로 변경한 별도 행동이다. 원본07의 Feb09 역시 적용 직후 무기한 상태를 캡처한 다음 사용자가2024-02-09로 직접 편집했다. 2024는 기존 목 기준 연도이며 원본 연도 확인을 뜻하지 않는다.

남은 차이: 정확한 원본 폰트/가중치·일부 아이콘/공통 셸 avatar, canonical 데이터·상태 정의 색상, 원본 성공 안내의 일부 배치/아이콘과 추가 프로젝트 복귀 링크(생성 개수는 스크린리더용 텍스트), 네이티브 select 목록 렌더링, 원본 모바일 미수록. 320px에서 긴 선택값은 native select의 한 줄 표시 폭에 잘리며 펼친 목록에서 전체 항목을 확인한다. 제목·설명·입력/CTA 경계는 캡처와 실제 bounding box로 확인했다. 추가 복귀 링크는 필터에 가려진 생성 결과를 찾기 위한 목 UX다. G30의 그라디언트 원본 첨부/모달 전체스크롤 차이는 유지한다. 전체100% 일치나 서비스 출시 완료로 보고하지 않는다.

실제 OS 한글 IME/보조기술/Safari·Firefox/실기기 미검증. 합성 composition·CSS 확대/Chromium 키보드를 실제 OS 검증으로 쓰지 않는다. 실제 서버 권한·일괄 트랜잭션/중복 정책·파일 영속/업로드/삭제 cascade·알림은 후속 질문이고 이번에는 연결하지 않았다.

## 미리보기 확인 순서

1. http://127.0.0.1:5173/app/tasks?tab=Templates → Continue as Alex → 이름 있는 템플릿 생성 → 구성 작업2개·설명·로컬 이미지·하위 항목을 Save Task로 저장.
2. Tasks 탭 → New Task 옆 적용 아이콘 → 템플릿만 선택 → 프로젝트 선택 → Create New Tasks. 같은 제목이어도 별도 카드/ID가 생긴다.
3. 새 카드 상세의 설명·이미지·하위 미완료/미배정·No due date 확인. 템플릿의 하위 체크를 실제 완료로 복사하지 않는다.
4. 템플릿 수정 후 다시 적용. 이전 카드 제목/첨부는 유지되고 새 세트만 최신 정의를 사용한다. 실제 작업 편집·Done·Archive·Delete 후 다른 세트/템플릿 유지 확인.
5. write-error/slow 시나리오로 선택 보존·재시도·Cancel creation·뒤로 복귀를 확인한 뒤 normal로 복원한다. 프로젝트 보드에서는 현재 프로젝트 미리 선택·원래 검색 조건 복귀·View project tasks를 확인한다.
6. 새 탭/새로고침은 초기화, 같은 탭 로그아웃·재로그인은 저장값을 유지한다. 적용 자체로 기존 작업 상태/기한/시간/금액이 바뀌지 않는다.


### 2차 검토에서 추가 발견한 직접 URL 복귀 결함

프로젝트 선택/검색 복귀와 새 탭 검사를 추가해, `?applyTemplate=new#template-selection` 직접 진입 후 닫기에서 hash가 사라지는 결함을 재현했다. `setSearchParams`로 적용 query만 지우려 했지만 React Router의 search-only 이동이 hash도 제거했다. 직접 진입 닫기는 pathname/search/hash를 명시하여 필요한 두 query만 지우도록 수정했다. 이력이 있는 진입은 원래 뒤로 가기 정책을 유지한다. 개발 영향 검사의 최초 실패와 수정 뒤 재실행은 따로 기록한다. 이 결함을 다음 Goal에 미루지 않는다.


## 최종 검증 결과와 재검토 판정

G30 정의 → 전체 구성 작업 적용 → 실제 상세/프로젝트 보드 → 원본과 복사본의 독립 수정/완료/보관/삭제 연결을 실제 navigation으로 검증했다. 직접 진입 hash 유실은 수정 후 개발/빌드에서 통과했다. G30의 이력·실패·파일·초안·workspace/로그아웃 검사를 함께 실행해 공통 이미지 UI 이동의 회귀도 확인했다. 이번 범위에서 발견한 수정 가능한 누락·결함은 보완 후 재검토했고 원본 자료·환경 대기는 분리한다.

| 검사 | 실제 결과와 로그 |
| --- | --- |
| 최종 typecheck · lint | 통과, typecheck-final-style.log · lint-final-style.log |
| 단위 전체 | 첫99/100(시험 비교 객체 오류), 수정 후100/100·23파일, unit-first.log · unit-second.log |
| 개발 영향 범위 | 13파일57/58·hash 복귀 결함, dev-affected.log/json |
| 수정 후 개발 대상 | G30 작성5 + G31 적용4 = 9/9, dev-fixed.log/json |
| 빌드 전체 | 수정 전160/161·동일 hash 결함, build-all.log/json |
| 최신 빌드 | 통과, build-final-style.log; 500kB chunk 경고는 남아 있으며 범위 밖 번들 재구성은 하지 않음 |
| 최신 빌드 영향 범위 | G30 작성5 + G31 적용4 = 9/9, e2e-final-style.log · build-final-style.json |
| 기존 5173 캡처 | 최종9장·원본7상태 비교, capture-final-style.log · capture-report.json |

실행 명령은 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`와 `pnpm exec playwright test [파일] --workers=2 --timeout=90000 --reporter=list,json`이다. 빌드는 `-c playwright.preview.config.ts`, 전체는 파일 제한 없이 실행했다. 개발 영향13파일은 task-template-writing/application, tasks, subtasks, task-comments, task-status, task-lifecycle, project-creation, project-settings, project-views, g18-g27-journey, app-shell, foundation이다. 실제 최초 실행/timeout 옵션·결과는 각 로그와 JSON에 보존했다. `PLAYWRIGHT_JSON_OUTPUT_FILE` 및 `--output`은 위 /tmp 하위에 지정했다. 최종 최신 빌드는 전체161개를 다시 돌린 것이 아니라 수정 영향9개를 실행했다. 최초 전체 통과로 합산하지 않는다.

최종 시각 재검토에서 적용 힌트가 DOM 표시 검사에는 통과해도 실제 화면에서는 보이지 않는 결함을 발견했다. 캡처의 blur/hover 준비만 보정해도 해결되지 않아 부모 `.task-new-group`의 `overflow:hidden`이 툴팁을 잘라내는 원인을 확인했다. 해당 적용 버튼 그룹에서만 overflow를 열고 양끝 버튼 radius를 유지했다. 원본에 맞춰 버튼 폭56px·힌트14/20px·40px 높이를 추정 보정했으며 좁은 폭에서는 그룹 왼쪽에 정렬했다. 실제 `elementFromPoint`로 페인트/잘림을 확인하는 데스크톱·320px 검사와 키보드 Escape/포커스 검사를 보완했다. 수정 전 이미지는 `before-tooltip-fix/captures-apply-02.png` 및 `comparisons-apply-02.png`, 수정 후는 기존 comparisons/apply-02.png다. 최신 capture/compare 스크립트와 비교 이미지 경로는 위 /tmp 아래다.

- dev-first: 관찰 3개, 요청 7604건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- dev-second: 관찰 8개, 요청 19011건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- dev-affected: 관찰 58개, 요청 173087건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- dev-fixed: 관찰 9개, 요청 22817건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- build-all: 관찰 161개, 요청 6967건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- build-fixed: 관찰 9개, 요청 165건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.

네트워크를 차단/가로채지 않고 관찰했다. 같은 origin의 정적 자산/개발 HMR과 실제 API를 구분한다. 모든 검사 context는 종료되며 기존 미리보기의 정상 기본값과 PID59363을 보존했다. 실패 재현 시나리오는 테스트 context에 한정했다. Backend/DB/실제 인증·서비스 호출·push·배포·_evidence 생성은 없다.

### 툴팁 추가 보완의 최종 재검증

부모 overflow 결함 수정 뒤 개발 해당 흐름1/1·빌드 연결9/9를 수행했다. 원본 힌트 크기·버튼 폭과 좁은 화면 정렬을 추가 보정한 최신 빌드에서도 연결9/9가 통과했다. typecheck-final-style.log·lint-final-style.log·build-final-style.log 및 e2e-final-style.log/build-final-style.json을 최종 결과로 삼으며 이전 실행 기록은 그대로 보존했다. 데이터/저장 코드에는 후속 변경이 없어 단위100/100은 동일 구현에 대한 검증이다.

- dev-tooltip: 관찰 1개, 요청 3799건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- build-tooltip: 관찰 9개, 요청 168건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- build-final-style: 관찰 9개, 요청 168건, 실제 API/외부 0건, 실패 요청 0건, console/page 오류 0건.
- 최종 5173 캡처9장: Chromium 148.0.7778.96, 요청1904건·실제 API/외부0건·실패0건·console/page 오류0건. capture-final-style.log, capture-report.json.
