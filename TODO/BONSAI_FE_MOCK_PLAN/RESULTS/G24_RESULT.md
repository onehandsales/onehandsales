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
