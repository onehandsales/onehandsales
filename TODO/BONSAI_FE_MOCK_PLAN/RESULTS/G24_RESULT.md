# G24 — 프로젝트 상세·이름·설정 실행 결과

최신 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증; 작업 연결/자료·시각·환경 대기. 실제 서비스/연동 완료가 아니다.

## 범위·선행 근거

HEAD `cef07f2f` G23 이후 깨끗한 상태에서 시작했다. 기존 5173을 보존하고 G21 프로젝트 ID/원본, G23 단계·태그·메뉴와 공통 셸을 재사용했다. [R05 결과](R05_RESULT.md)에 상세·이름·설정 소비 분석을 먼저 기록했다. G01~G23의 자료/시각/환경 대기를 자동 해소하지 않았다.

확인일 기준 2026-11-21(실행 로그는 21~22일), App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. 신규 MCP3flow14screen, 연결 ANALYSIS4/5/8절과 실제 PNG14개를 직접 확인했다. 카탈로그 Latest/2146은 G18 앱 조회 기록 재사용이며 신규 버전 조회가 아니다. 촬영일·제품 빌드·원본 viewport/DPR은 미확인.

| 원본 Flow | 단계·Screen ID |
| --- | --- |
| Project detail `669a7507-38b3-41aa-89a2-146530c42240` | 01: `sc_3ade80505ba3458cb239c839815b3750`<br>02: `sc_adeac0011d87480980cfd58e53e4d751`<br>03: `sc_8557a3e41edc402a8ebdf39022ee8d44`<br>04: `sc_995163a7f1db42968cbc2e3906ddcbe5`<br>05: `sc_468c2bc67b614813b0ac89ab5b72b018`<br>06: `sc_b07eafa421cb44f3aa1081d935d5d1a3` |
| Editing project name `436bff56-c6be-434a-97e4-1fa7b2526a91` | 01: `sc_adeac0011d87480980cfd58e53e4d751`<br>02: `sc_d747ce9796af4df4ad638f846101a787`<br>03: `sc_1b1289ac3d2e4d0bb282944177f0a21f`<br>04: `sc_c05fe23fb7df4c13a42b5571729f0b25` |
| Editing project settings `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` | 01: `sc_b07eafa421cb44f3aa1081d935d5d1a3`<br>02: `sc_7db8a8c40f884b6190e313b59982d139`<br>03: `sc_1c16855a408d4a3b882a3437563ec0cd`<br>04: `sc_64dc2598400849a39fef6452cbd49a62` |

MCP lifecycle 검색은 관련도 완화 결과4개를 반환했으며 로컬 Screen ID 분류상 고객 포털/랜딩/CRM/초대였다. 결과 이미지는 신규 직접 관찰하지 않았고 실행 근거로 채택하지 않았다. 카탈로그 전체에 자료가 없다고 결론내리지 않는다. 완료/보관/삭제의 실행·권한·문서 영향은 R05 별도 배정 대기다.

## 구현·소유권·상태 수명

- `/app/projects/:id?tab=Overview|Invoices|Tasks|Time+Tracking|Team|Settings`의 실제 URL 이력과 공통 헤더를 분리했다. 제목·고객·단계·태그·멤버는 기존 ProjectStore/ClientStore/TeamStore ID를 사용한다. 보드/표/고객 상세/G17 초대 선택지의 이름을 같은 원본에서 갱신한다.
- ProjectNameEditor는 제목만 Save, SettingsForm은 제목·요율·설명·시작/종료일·알림을 함께 Save Changes하고 Overview로 이동한다. 양쪽 초안·revision은 독립이다. 실패는 입력 보존/재시도, 충돌은 명시적 Reload saved values 또는 취소·재진입을 제공한다. 다른 탭/경로·Escape/Cancel은 미저장 초안과 진행 중 저장을 취소한다.
- 저장 직후 재조회가 늦어도 새 편집은 접근 검증된 현재 원본에서 시작한다. 기존 편집 초안은 자동 덮어쓰지 않아 오래된 revision 충돌을 유지한다. 계정/workspace/revision/Reset/이탈 뒤 응답은 폐기한다.
- 이름1~200자/동명 허용, 설명0~4000자 문자열, USD Hourly Rate만 관찰 선택지. 요율0~9,999,999.99/소수2자리까지 minor-unit 정수 변환. optional ISO 업무일1900~9999, 같은 날 허용·역전 거부. 시작/종료 지우기와 저장 후 재진입을 검증했다. description Markdown은 안내·문자열 보존이며 HTML/외부 렌더러를 실행하지 않는다.
- 시간 예시는 같은 프로젝트에 초7/3600, 기록 요율2000minor, 기록 금액4/2000minor를 분리했다. 1.00Hours와 $20.04는 별개 집계다. $20.00 행은 기록 당시 요율로 해석한 목 가정이며 실제 청구 정책이 아니다. 현재 요율을 바꿔도 과거 기록은 보존한다. 멤버별 집계는 각 멤버 ID의 기록만 합산한다. This Week는 목 기준일 2024-02-06이 속한 주의 고정 기록을 가리키며 현재 실제 주 지표가 아니다.
- Team은 가입 완료 멤버 중 project.memberIds/배정 프로젝트/전체 프로젝트 접근으로 조회한다. +/See Details는 기존 workspace Team으로 인계(프로젝트 사전 선택 없음). 멤버 제거·시간 추가/청구·문서·메일·자동화는 미제공 안내/복귀다.
- G18 Collaborator의 제한된 탭과 기존 기록 snapshot은 유지했다. 설정·재무·문서 권한은 추가하지 않았다. G24 owner 시간 예시와 G18의 당시 요약은 서로 다른 관찰 snapshot이며 통합 완료로 쓰지 않는다. 작업/시간 연결의 실제 공통 소비는 G25~G27에서 다시 검증한다.
- Tasks는 동일 projectId의 URL 문맥까지만 연결하고 G25 실제 보드·생성은 대기다. 개요 작업 요약/활동 역시 G25/G27에서 같은 작업 원본을 연결한다. 이름/설정 변경 때문에 원본 캡처에 섞인 작업 보관/완료 이벤트를 꾸미지 않았다. 생성 활동의 옛 이름은 snapshot으로 보존한다.
- 저장 원본은 탭 메모리. 뒤로/앞으로·동일 탭 로그아웃 후 복귀는 유지, 새로고침/새 탭/Reset은 인증과 seed 초기화. 실제 영속화가 아니다.

## 두 차례 검토·수정

1차 코드·화면·브라우저 검토에서 다음을 발견했다.

1. 헤더와 설정 폼의 동일 location.key를 React 형제 key로 사용해 저장/탭 이동 후 헤더가 중복됐다. 역할별 접두어를 붙여 수정했다. 최초 dev5/9의 console 오류도 이 결함과 연결된다.
2. 목록 접근성 이름은 단계까지 포함하는데 제목만 지정한 검사 locator가 실패했다. 실제 링크 이름을 확인해 수정했다.
3. 첫 캡처는 탭 클릭 후 실제 선택을 기다리지 않아 이전 화면을 찍었다. aria-current와 목적지 내용 준비를 기다리도록 수정하고 최초 캡처/실패 로그를 보존했다.
4. 시간 제목과 설명이 공통 flex 규칙 때문에 가로로 놓였다. 해당 섹션만 세로로 보정했다. 요율 이중 테두리, 헤더 높이, 날짜/폼 배치를 원본과 대조했다. 멤버별 시간 집계는 해당 ID로 분리했다.

2차 재검토에서 빠른 저장→재진입의 실제 결함을 추가 수정했다. 종료일을 지워 저장한 뒤 바로 Settings를 열면 지연 조회의 옛 project props로 초안이 만들어졌다. 새 초안 초기값/이름 편집 시작은 현재 저장소를 읽도록 바꿨다. 조회 지연 자체를 제거하거나 검사에 임의 지연을 더하지 않았다. 저장/탭 전환 완료 전 뒤로 이동하던 검사 절차도 실제 선택 상태를 기다리게 했다.

빌드 회귀에서 G23 좁은 메뉴가 늦게 도착한 resize로 즉시 닫히는 결함을 추가 재현했다. 이전 G23 수정은 scroll의 실제 버튼 위치만 비교했고 resize는 무조건 닫았다. 메뉴를 열 때 viewport도 함께 기록하고 위치/크기가 실제 달라진 경우에만 닫도록 수정했다. 메뉴 열린 뒤 변화 없는 resize 이벤트를 보내는 회귀를 기존 실제 키보드 시나리오에 추가했다. 최초 build15/16과 수정 후 최종 개발/빌드16/16을 구분한다.

현재 검증은 제목 cancel/Save/실패/더블클릭/목록·이력, 전체 설정 validation/실패 보존/충돌/Reload/저장·종료일 삭제 재진입, 느린 저장 취소, URL탭/새로고침/실제 뒤로, Team 인계, 시간 원본 보존,320폭/긴 한국어/합성IME를 포함한다. G21 생성·G22 조회·G23 변경을 함께 회귀 검토했다. 원본 미수록과 목 정책은 완료로 합치지 않는다.

엔지니어링 검토 적용: 표시/초안/hook/저장 모델 책임과 import 방향·구독 정리를 확인했다. 신규 의존성/앱 간 import/실제 adapter/Admin 변경은 없어 관련 항목은 N/A다. description은 HTML로 실행하지 않으며 실제 비밀 값·계정은 사용하지 않는다. 원본 날짜 선택기 내부·실제 IME·보조기술은 별도 환경 대기로 남긴다.

## 실제 실행·실패와 재검증

FE/user-web, Node24.18.0 / pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, `corepack pnpm typecheck`, `lint`, `test`, `build`. 최종 타입/lint/build 통과, 단위20파일77/77. 기존 bundle500kB 경고 유지.

- 최초 root에서 `corepack pnpm --dir ... typecheck`는 pnpm12.21.0이 선택돼 요구8.14.1 불일치로 실행 실패했다. FE/user-web cwd로 바로잡았다. `typecheck-first.log` 보존.
- 최초 lint는 컴포넌트 파일의 tabs 상수 export가 Fast Refresh 규칙 위반이었다. 모델 파일로 옮겼다. 최초/수정 로그 보존.
- `unit-first/final/verified/final2` 모두77개 통과. 첫 dev9개5통과4실패, 두 번째/세 번째 G24각5개4통과1실패, 첫 통합 dev16개15통과1실패를 각각 보존한다. 수정 후 G24단독과 통합 개발/빌드는 아래 현재 결과이며 최초 성공으로 합쳐 쓰지 않는다.
- 브라우저 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G24/<run>.json caffeinate -i corepack pnpm exec playwright test tests/e2e/project-creation.spec.ts tests/e2e/project-views.spec.ts tests/e2e/project-stage-tags.spec.ts tests/e2e/project-settings.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G24/<run>`. 빌드는 `-c playwright.preview.config.ts`. 단독 재실행은 project-settings만. 최종 파일 접미사는 final2이며 초기 build-browser 15/16 실패도 보존한다. 개발5175/빌드4175, 실제 미리보기5173.
- 차단/가로채기 없이 request/response/requestfailed/socket/console을 관찰했다. 정적 자산 GET도 전체 요청에 포함하며 API와 구분한다.
- `dev-first`: 통과 5, 실패 4; 전체 요청 20366, API/외부 위반 0, 실패 요청 0, console/page 오류 18.
- `dev-second`: 통과 4, 실패 1; 전체 요청 11107, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `dev-third`: 통과 4, 실패 1; 전체 요청 11107, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `dev-final`: 통과 15, 실패 1; 전체 요청 38873, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `dev-fix-reentry`: 통과 5, 실패 0; 전체 요청 11107, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `dev-verified`: 통과 16, 실패 0; 전체 요청 38873, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `build-browser`: 통과 15, 실패 1; 전체 요청 238, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `dev-final2`: 통과 16, 실패 0; 전체 요청 38877, API/외부 위반 0, 실패 요청 0, console/page 오류 0.
- `build-final2-browser`: 통과 16, 실패 0; 전체 요청 250, API/외부 위반 0, 실패 요청 0, console/page 오류 0.

최종 캡처16개+별도좁은footer1개는 API/외부·실패 요청·console 오류0. 장애 시나리오는 normal로 복원했다. 실제 OS IME·보조기술·Safari/Firefox/실기기는 실행 환경·도구 미구성으로 대기이며 합성IME/Chromium을 대체 검증으로 쓰지 않는다.

## 시각 비교·임시 자료·잔여

원본: `bonsai_analysis/flows/Project detail/screens`, `Editing project name/screens`, `Editing project settings/screens`. 2880×1800을 MCP표시1440×900에 맞춰 정규화했다. 원본 실제 viewport/DPR 확정이 아니다. 실제 Chromium1440×900/DPR1, 설정 중간 화면 scroll194, narrow320×600. URL·scroll·계산된 글꼴/크기/경계는 capture-report에 기록했다.

`/tmp/onehandsales-g18-g27/G24/`에 MCP/검색 JSON, source14개, captures14대응+좁은3개, comparisons/side-by-side·diff·review, capture.mjs/report, 최초 실패와 각 명령 로그/JSON/trace를 임시 보관한다. `_evidence`나 삭제된 RESULTS/evidence는 만들지 않았다. 비교14개를 직접 검토했지만 detail03은 G25 Tasks 인계 화면이므로 전체 시각 완료가 아니다.

남은 차이: 가상 멤버 이름/아바타·고정시각, seed3개와 원본2개, G25작업/G27활동·통합시간 snapshot, 폰트/아이콘/세로간격 미세 차이, OSselect/date picker·접근성 focus/Cancel 추가, 안내 높이, preview 도구. 날짜 내부 달력·원본 모바일·다른 청구유형/통화·리마인더 실제 발송·과거시간 소급청구·lifecycle/역할별포털은 미확인. 서버 메모이며 실제API/Backend로 확대하지 않았다.

## 5173 확인 순서

1. `http://127.0.0.1:5173/app/projects` → Continue as Alex → Design Project → 연필 → 제목 입력/Cancel/Save → 뒤로/목록/표에서 같은 이름 확인.
2. Settings → 제목·요율·설명·시작/종료·Reminder → Save Changes → Overview → 즉시 Settings 재진입 → 값 확인 → End Date지우기/저장/재진입.
3. preview controls write-error/slow로 실패 초안 보존·재시도·취소 확인 후 normal. 설정 초안을 남기고 헤더 이름을 저장한 뒤 전체 Save하면 충돌을 확인하고 Reload saved values.
4. Time Tracking → 7초/1시간·1.00Hours/$20.04, 펼침/닫힘 확인. Team → 기존 팀 초대 인계→뒤로. Tasks는 G25전 인계 화면이다.
5.320폭/키보드/Escape/뒤로·앞으로 확인. 새로고침은 seed와 가상 로그인을 초기화한다.

개별 로컬 커밋 후 G25로 이어간다. push/배포/G28 없음. [연속 결과](G18_G27_RESULT.md).

### G25 연결·회귀

[G25 결과](G25_RESULT.md)에서 Tasks sidebar/이전pending경로·대시보드Add task를 실제보드/패널로 연결하고 프로젝트Overview/Tasks/TimeTracking과 제한협업자도 같은taskId를 사용한다. G18 과거최소작업/시간snapshot은 현재공통원본으로 대체됐으며 원본시점차이는 기록했다. 개발/빌드26개씩 현재검증, 금액/설정권한은 확장하지 않았다. G26하위작업/G27활동·자료/시각/환경 대기는 유지한다.

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.

## 2026-11-22 G28 연결 회귀

[G28 결과](G28_RESULT.md)에서 상태 UI를 native select에서 원본 메뉴/정의 설정으로 보완했다. 동일 작업/하위/댓글 ID와 과거 활동 표시명 snapshot, 완료 의미·시간 불변을 검증한다. 공통 mutation 재시도 중 오류/버튼 유지로 더블클릭의 backdrop 닫힘을 수정했다. 이번 실제 전체 검사/재실행 결과는 G28에 기록하며 위 과거 실행 결과를 덮지 않는다. 기존 자료·시각·환경 대기는 유지한다.

## 2026-11-22 G29 연결 회귀

[G29 결과](G29_RESULT.md)에서 같은 Task ID의 완료→보관/삭제, 전체·프로젝트·개요·Dashboard 제외와 기록 시간 보존을 대조했다. 하위/댓글/늦은 변경·협업자 접근과 기존 상태 정의를 함께 검증한다. 이번 명령/실패·재실행은 G29 결과에 기록하며 위 과거 검사 수치·미수록/시각/환경 대기를 덮지 않는다.


<a id="g24-r4-recheck"></a>
## G24 R4 재대조·보완 — 2026-11-27 KST

시작 HEAD `70ca7233`(G23). 아래가 이번 실행 결과이며 앞선 브라우저/픽셀 완료 체크는 과거 기록이다. **부분 완료**: 확인한 동작 결함을 수정하고 로컬 검증을 수행했지만 원본 동일성과 실제 브라우저는 미검증이다. 작은 시각 차이도 동일 재현 완료로 처리하지 않는다.

### 네 기준과 원본 대응

- FRONT_AGENT README·ENGINEERING_REVIEW_CHECKLIST·목 우선/상태/아키텍처/테스트·주석·접근성 기준을 재대조했다. feature UI→기존 hook→mock store 경계, 명시적 초안·revision·이탈 abort, 같은 ID 소비를 유지한다.
- G24 최신 명세와 R05 소비 결정을 확인했다. 선행 G21(R03)·G22/G23(R20/R05) 결과를 연결했다. R05 전체 완료를 선언하지 않는다.
- 코드 영향은 ProjectDetail/Header/NameEditor/SettingsForm/DateField·설정 검증 모델·프로젝트 CSS다. SettingsError는 기존 검증의 입력 위치만 덧붙이며 store 규칙을 새로 만들지 않는다. G21·G23 DOM 재시도 도우미는 act 바깥 갱신 경고를 없애도록 조정하고 두 Goal을 다시 실행했다. tasks 구현/G25는 수정하지 않는다.
- MCP 3Flow/14단계 신규 조회와 로컬 ANALYSIS 4·5·8절·PNG14개를 직접 대조했다. Screen ID 전부 일치, PNG2880×1800, MCP1440×900. 실제 CSS viewport/DPR은 확인하지 못했다. 응답/이미지/비교물/캐시/리포트는 추가 저장하지 않았다.

| R4 항목 | 원본·단계 | 이번 판정 |
| --- | --- | --- |
| F092-O01 | [Project detail](../../../bonsai_analysis/flows/Project%20detail/ANALYSIS.md) 01 | G22의 5열·가로 넘침·동일 ID 보드 연결 유지. 보이는 네 열을 전체 단계로 해석하지 않음 |
| F092-O02 | 같은 Flow 02~06 | 6탭·고객/단계/팀/제목 공통 헤더와 본문 전환 확인. 빈 개요·Tasks 카드·시간·팀은 다른 스냅샷으로 취급. 실제 Tasks는 기존 연결의 회귀만 검토 |
| F092-O03 | 같은 Flow 04 | 7초/1시간의 기록 요율 $20.00과 합계 1.00 Hours/$20.04를 분리. 요율 수정 후 기존 기록 불변 검증 |
| F102-O01 | [Editing project name](../../../bonsai_analysis/flows/Project%20detail/Editing%20project%20name/ANALYSIS.md) 02~03 | 입력+Save·우측 상태/메뉴 유지. 기본 화면에 없던 취소 제어는 포커스 때만 노출, Esc 취소 유지 |
| F102-O02 | 같은 Flow 04 | 제목·연필 복귀/성공 안내·과거 생성 이름 보존. 같은 ID의 표 이름 반영 검증 |
| F103-O01 | [Editing project settings](../../../bonsai_analysis/flows/Project%20detail/Editing%20project%20settings/ANALYSIS.md) 02~03 | 좌측 설정 카드/우측 알림·종료일 X·Save Changes 배치 대조. 날짜 지우기 후 재진입 검증 |
| F103-O02 | 같은 Flow 04 | Save Changes→Overview+성공 안내. 날짜/요율/설명/reminder는 재진입으로 별도 확인하며 작업 완료 수에 인과관계를 부여하지 않음 |

### 발견·수정·재검토

1. 탭 이동의 hash/state 손실을 수정했다. 같은 탭 재선택은 새 이력을 만들거나 초안을 지우지 않는다. 외부 query/state/hash는 유지하고 이전 생성·업데이트 알림은 다음 탭에 전달하지 않는다.
2. 이름/설정 입력 중 IME Escape가 편집을 닫는 문제와 취소 뒤 남은 조합 상태를 수정했다. Enter/Escape/229 조합을 차단하고 이름 재편집/설정 reload 때 상태를 초기화한다.
3. 제목/요율/날짜 검증 메시지에 입력 이름·aria-invalid·aria-describedby와 오류 초점을 연결했다. 저장 실패는 초안을 유지하며 오래된 revision은 Reload saved values로 복구한다.
4. 이름 저장 알림은 현재 이력에만 표시한다. 설정 저장 알림은 성공 이동에 붙이고 POP 복귀 때 재생하지 않는다.
5. 고정 AL 팀 표시를 실제 프로젝트 멤버에 연결하고 아바타/추가 버튼을 각각 30px로 분리했다. 망치 문자를 원본 분기 화살표 형태 SVG로 교체했다. 제목 24px·20px 간격·인라인 저장 우측 간격과 설정 저장 오른쪽 정렬을 조정했다.
6. 원본에 없는 취소 버튼의 기본 노출을 없앴다. 키보드 포커스 시 제어가 드러나고 Esc·탭/경로 이탈 취소를 유지한다. 실제 브라우저 포커스/픽셀 검증은 남아 있다.
7. 저장소의 생성 이력/시간 원본/단계/금액 불변과 명시적 전체 저장을 확인했다. 미수록 문서/메일/자동화/인보이스/팀 제거/lifecycle은 기존 미제공 안내를 유지한다.

### 검증

- 새 DOM 6개 초기: 5실패/1통과, 14.39s. URL 손실·IME 취소·ARIA 누락 4개를 재현했고 나머지 1개는 성공 안내 뒤 150ms 조회 갱신을 기다리지 않은 검사 문제라 별도 완료 조건으로 수정했다.
- 보완/충돌·실패 재시도 추가 뒤: **5 files 28/28, 42.42s**. G24 DOM7, G21 DOM6, G23 DOM7, 설정 모델2, 저장소6.
- DOM: 탭 문맥·같은 탭 초안·뒤로가기, 이름 IME/취소 재편집/오류/저장/표 반영/생성 활동 유지, 설정 IME/역전 기간 오류, 전체 저장/종료일 지우기/재진입/기존 시간 불변, 지연 저장 이탈, stale 충돌 복구/잘못된 요율/쓰기 실패 재시도.
- app/node TypeScript noEmit·incremental false와 전체 ESLint 통과. 최종 마크업/CSS 보완 후 다시 실행했다.
- Vite 메모리 빌드 **1976 modules / 3 outputs, 7.61s** 통과. write/copyPublicDir/cache/trace/report는 생성하지 않았다. Browserslist 데이터 경고는 기존 도구 데이터이며 의존성 변경은 하지 않았다.
- G21~G24 전체 연결·G19/G20·이전 Goal 전체 회귀는 다음 최종 통합 검토에서 별도 기록한다.

### 시각 비교와 미완료 범위

원본 PNG를 절반 좌표로 참고한 값: 상세 content x260, 탭 경계 y251, 제목 약24px, 아바타30px. 설정 카드 x260/y311/w706, 내부 padding60, 입력 x321/y401/h40, 설명 h100, 날짜 w185/gap20, 우측 알림 x1036/y346, 이름 편집 입력 x260/y102/h40·Save 우측. 코드 수치를 대조했지만 브라우저 실측이 아니므로 픽셀 동일 판정은 하지 않았다.

- **원본 미확인(3 A항목 유지):** 실제 viewport/DPR·폰트 렌더링, 입력 길이별 wrapping/Enter/blur/빈값의 제품 정책, 날짜 팝업·기간 오류·날짜 삭제·reminder 실행, 타임시트/Invoices/팀 제거/미리보기/lifecycle 후속. 정책·미수록 전환의 원본 동일성을 확정할 수 없다.
- **의도적 목 차이:** G17의 Alex·기존 3프로젝트와 G25 이전 구현의 작업 seed는 원본 Joe/2프로젝트·각 촬영 시점 데이터와 다르다. JS/JD 주체 관계는 추측하지 않는다. 이름 한도·오류·취소·USD 요율·날짜 제약·과거 기록 불변은 R05 목 결정이다.
- **미실행 검증:** 연결된 브라우저 세션 부재와 증거/자동 임시 산출물 금지 기준으로 실제 브라우저 E2E·동일 viewport 픽셀·좁은 화면/확대·OS IME·네이티브 달력·초점·네트워크는 수행하지 않았다. jsdom 합격을 해당 검증의 완료로 바꾸지 않는다.
- 실제 API/Backend/DB·push·배포는 수행하지 않았다. G25 새 구현은 시작하지 않았다.


<a id="g21-g24-final-review"></a>
## G21~G24 최종 연결 재검토 — 2026-11-27 KST

**부분 완료**: 지정 범위의 순차 보완·로컬 검증·Goal별 커밋 후 네 기준과 연결 흐름을 다시 검토했다. 원본 동일성·실제 브라우저·미수록 정책 대기는 그대로다. G25 구현은 시작하지 않았다.

| Goal | 별도 커밋 | Goal 당시 검증 | 결과 |
| --- | --- | --- | --- |
| G21 | `381c0568` | 4 files 32/32; 59.85s | 두 생성 경로, 필수 오류/초점·IME·취소/이력·고객 연결 |
| G22 | `84500fac` | 3 files 13/13; 23.14s | 보드/표 URL 문맥·검색 조합·필터/행 메뉴 수명·스크롤 |
| G23 | `70ca7233` | 4 files 21/21; 29.02s | 정확한 태그 선택·IME·이탈 취소·단계/순서·태그 반영 |
| G24 | `8d30a390` | 5 files 28/28; 42.42s | 상세 탭·이름/설정 저장·오류·충돌·헤더/저장 배치 |

각 커밋의 기능 검증은 원본 동일 재현 완료를 뜻하지 않는다. 위 4개 커밋은 app/node 타입·ESLint·메모리 빌드도 통과했다. 아래는 그 뒤 추가 변경/검증이다.

### 네 기준 최종 대조

1. **FRONT_AGENT:** 책임·public feature 경계·mock store·같은 ID·초안/저장 분리·취소/최신 의도·주석·접근성·검증 한계를 확인했다. 공통 Dialog/인증/서버/DB는 변경하지 않았다. 프로젝트 스타일 영향은 생성/목록/상세와 기존 협업자 소비의 회귀에 포함했다.
2. **명세·R03/R05/R20:** G21~G24의 22관찰 항목이 구성 대조·보완 상태이며 미대조 관찰 행은 0개다. 남은 분석 10항목은 유지한다. 과거 체크/브라우저 수치는 이력이며 현재 시각 대기를 없애지 않는다. START-CHECKLIST/UXUI-REPLICATION/IMPACT의 오래된 최신 범위 안내를 현재 범위로 보완했다.
3. **실제 코드·연결 영향:** 고객 생성→프로젝트 생성→보드→단계 이동→태그 생성→표→상세→전체 설정 저장→설정 재진입→고객 상세→보드 복귀를 실제 App/provider/router/mock store로 검증했다. 새 고객 `studio-a:client-new-1`과 프로젝트 `studio-a:project-new-1`의 ID, 이름·연락처·단계·태그·종료일·요율·알림 값이 유지되고 과거 생성 이름은 변경되지 않았다.
4. **Flow·단계·원본:** 이번 순차 작업에서 MCP10Flow/48단계와 로컬 PNG48회차를 직접 대조했고 모든 화면 ID 일치를 다시 확인했다. 중복되는 화면도 Flow 내 단계로 센 값이다. 새 원본 문서를 만들어 관찰되지 않은 동작을 추가하지 않았다. 캡처 내부와 CSS를 비교했지만 실제 렌더링 동일성은 검증하지 못했다.

### 최종 추가 결함과 수정

새 프로젝트를 만든 뒤 같은 화면에서 이름을 바로 저장하면 생성 알림과 업데이트 알림이 동시에 나타났다. 연결 DOM 검사는 알림 1개 대신 2개를 확인해 실패했다(단독1/1 실패, 8.91s). 첫 전체 실행도 같은 오류만 실패했다(**49파일 중48통과 / 306개 중305통과, 275.90s**). 이 실패를 합격 기록으로 대체하지 않는다.

ProjectDetail의 저장 성공 callback을 ProjectsPage에 연결해 생성 알림을 소비하고 수정 알림만 표시한다. 수정 알림을 닫은 뒤에도 생성 알림이 재등장하지 않는 것을 함께 확인했다. 저장소 데이터·API·다른 고객 알림 규칙을 변경하지 않는다. 수정 후 관련 **2 files 8/8, 20.04s** 통과.

### 최종 검증

- 최종 전체 **49 files 306/306, 274.33s** 통과. 이 실행 이후 제품 코드와 테스트는 변경하지 않았다. 추가 연속 검사는 [project-client-flow.test.tsx](../../../FE/user-web/src/app/router/project-client-flow.test.tsx)에 있다.

- app/node TypeScript `--noEmit --incremental false`와 전체 ESLint 통과.
- 최종 Vite 메모리 빌드 **1976 modules / 3 outputs, 7.23s** 통과. build/write/copyPublicDir 및 Vitest cache/fsModuleCache/dependency optimizer/coverage/report/trace 저장을 비활성화한 inline 실행이다.
- 기존 G19/G20 고객·필드·이미지, G14~G18 설정/브랜딩/팀/초대, 이전 공개/auth/onboarding 및 기존 작업 소비의 단위/DOM 회귀를 포함했다. 기존 G25 이후 테스트 실행은 회귀 확인이며 새 Goal 구현 착수가 아니다.
- JSON parse·추가/수정 링크 13개·명시적 anchor·git diff 공백 검사 통과(링크 오류 0). 새 증거 폴더·이미지·로그·JSON 산출물·임시 스크립트를 만들지 않았다.

### 남은 미확인과 영향

| 구분 | 이유 | 영향 |
| --- | --- | --- |
| 원본 정보 | CSS viewport/DPR·폰트 렌더링 조건·미수록 오류/취소/달력/제약/후속 lifecycle 정보 부족 | 화면·전환·정책의 원본 동일성 인증 불가. 기존 R 목 정책과 관찰 사실을 분리 |
| 시각 재현 | PNG/CSS 수치 대조만 수행. 실제 동일 viewport 렌더·픽셀 비교 미실행 | 작은 폰트/간격/색상/아이콘/줄바꿈 차이까지 해소했다고 표시하지 않음 |
| 브라우저 검증 | 최종 재조회에서도 연결된 Codex document session이 없음. 현행 자동 임시 산출물 금지 범위 유지 | 실제 E2E·좁은 화면/확대·OS IME·네이티브 드래그/달력·초점 잠금·네트워크 미검증. jsdom/합성 이벤트가 대체 증거가 아님 |
| 실제 업무 연동 | 사용자 제외 범위 | 실제 API/Backend/DB·외부 발송/청구·원격 push/배포 미수행. 업무 연동 완료로 표시하지 않음 |

사용자 승인 범위는 G24까지다. 관찰되지 않은 정책·실계정 정보와 엄격한 시각·브라우저 검증을 별도 대기로 남겼으며 후속 G25로 해결 가능한 이번 결함을 넘기지 않았다.
