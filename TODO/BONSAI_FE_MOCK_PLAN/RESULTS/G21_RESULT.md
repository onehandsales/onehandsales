# G21 — 두 진입점의 프로젝트 생성 결과

최신 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증 수행. 원본의 미수록 정책/시각 차이/환경 대기 유지. 실제 서비스 완료가 아니다.
요청일 2026-11-21 KST, 실행은21~22일. 시작 HEAD `64bb89c0`(G20), 시작 작업 트리 깨끗함. 기존5173 보존, Backend/API 없음.

## 근거와 선행 범위

FRONT_AGENT/Decision006 및 공통 시작·목·재현·검토 규칙 적용. G01/G17/G19/G20의 실제 저장소·query·초대 경계 확인. G18~20의 자료/환경 대기는 이번 작업을 막지 않으며 일괄 완료하지 않는다. [R03 보완 결과](R03_RESULT.md)의 G21 절을 먼저 기록했다.

App `bonsai-web` / `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`과 카탈로그 Latest/2146은 G18 조회 기록 재사용이다. 이번 신규 MCP는 아래2flow11screen이다. 서비스 빌드/촬영일/원본 viewport·DPR은 미확인. 확인일21~22일, 신규 MCP 응답은 `/tmp/onehandsales-g18-g27/G21/mcp-sources.json`.

| 원본 | Flow ID | Screen ID(단계 순) |
| --- | --- | --- |
| Clients/Adding a new project (Clients),01~05 | dd29b56e-cc30-4875-8f7b-302ca3909d05 | sc_7a2bb697a852495e8fd9be9fe6563b0a, sc_d0f7b82f653d46e993ad3108aba21bae, sc_c659df491c354cd8bd910fec7f59f9c8, sc_adeac0011d87480980cfd58e53e4d751, sc_6baf0c1661f749d39694f6350b4b6413 |
| Projects/Creating a project (Projects),01~06 | ddea1540-3c0b-4e00-8805-12b4adc290c1 | sc_da6135eadeff44e49c083b563487ddf5, sc_2d71503ee10849e088000dc2e54b6ccf, sc_1a98cb92e1634dd99d8c17c363bb99e8, sc_2f907e9803904b87b72a16e8ad14ef3b, sc_a49b5154a1e944b290d48ba802aad137, sc_21c57bdee8d94269af945440ba1c1c84 |

양쪽 ANALYSIS 4/5/8절과11PNG 직접 확인. 잘못 추정한 `Adding a new project (Projects)` 경로 조회는 실패했으며 실제 `Creating a project (Projects)`로 정정해 읽었다. 로컬2880×1800을 MCP 표시1440×900과 비교하기 위해1/2정규화했다. PNG로 원본DPR을 확정하지 않는다.

관찰: 고객 폼은 고객 선택 없이 제목/팀, 전체 폼은 고객 선택·New Client·고객 이메일·Sample Client 안내. 생성 뒤 고객 문맥은 Overview/New Lead, 전체 최종 화면은 In Progress. 전체 상단 생성의 초기 단계가 In Progress인 이유/팀 편집/유효성/동명 제한/취소 정책은 미수록이다. 샘플 안내는 관찰된 문구이며 실제 문서/결제 자동 처리 근거로 쓰지 않았다.

## 구현과 명시한 목 정책

- `features/projects`에 타입/저장소/query hook/생성 hook/고객 선택/생성 모달/보드/생성 직후 Overview를 분리했다. 페이지는 `/app/projects`, `/:projectId`의 조합과 권한 분기. 기존 Dialog/고객 폼/고객 저장소·G17 팀을 재사용했다.
- 고객 상세 Projects +, 전체 New Project, 상단 New→Project, 열 내부 New Project를 연결했다. 고객 문맥은 해당 고객 고정, 전체는 기존 고객 선택 또는 G19 신규 고객 폼. 고객 이름/연락처는 같은 ID 원본에서 읽는다.
- 고객/상단 기본 New Lead, 열 내부는 선택한 열의 단계. 원본이 확정하지 않은 차이를 목 정책으로 명시했다. 빈 제목/공백/200자초과/타 workspace 고객을 거부하고 동일 이름은 별도 ID. 표시 placeholder는 저장 기본 제목이 아니다.
- G17의 기존3개 프로젝트 ID를 보존하고 실제 프로젝트 원본으로 승계했다. 새 프로젝트도 초대 선택지에 나타나며 같은 ID로 초대 수락 후 접근한다. 협업자는 배정 프로젝트만 보고 생성·고객·재무 접근을 받지 않는다. G18 간략 업무 화면의 Task 연결은 G25~27 범위로 남긴다.
- 팀 초깃값은 해당 workspace의 가입 Owner. 팀 선택 UI는 근거가 없어 새로 만들지 않았다. Project.memberIds와 초대 접근권한은 구분한다. Sample Client 문구는 해당 seed ID에만 표시하며 문서 수락/결제는 실행하지 않는다.
- 제출 UUID로 이중 클릭/동시 요청 한 건만 저장. 실패 입력 유지, 취소/이탈/세션·workspace 변경/시나리오 전환은 abort+generation+revision으로 늦은 저장 차단. 생성 활동은 생성 당시 이름/행위자/고정 시각 snapshot.
- New Client 하위 폼은 부모 제목 보존. 하위 저장은 고객 저장 확정이므로 부모 취소로 고객을 삭제하지 않는다. 하위 취소는 부모 고객/제목 유지. 생성 성공만 새 상세 또는 해당 보드로 실제 navigation.
- 저장값은 같은 탭 로그아웃 후 유지, 초안은 이탈/취소 시 폐기. 새로고침/새탭/Reset은 메모리 seed와 인증 초기화. query로 생성 위치/고객/열을 전달하며 직접 URL도 검증한다. read-error/write-error/slow/empty/denied는 재현 도구에서만 활성화하고 마지막 normal 복원.
- 목록/상세/고객별 목록/팀 초대/협업자 목록은 같은 원본을 공유한다. 보드·표 전환/단계 변경/태그/설정/업무 Task는 G22~27에서 이어간다. 그 경계의 안내를 구현 완료로 쓰지 않는다.

## 1차 검토 → 수정 → 2차 재검토

1차 코드/상태 검토: 외부 호출 없이 고객 원본 유효성·팀 초기값·프로젝트 ID·초대 선택 재검증·중복 제출/늦은 응답 확인. 테스트에서 고객 링크 이름에 장식용DC가 포함되어 찾지 못함→avatar aria-hidden. Project scenario의 중첩 label이 options까지 포함→명시 aria-label. 최초 캡처에서 사이드바 Projects가 과거 pending 경로→실제 경로 및 과거 경로 redirect 연결.

1차 시각 비교: 원본과11상태 비교. 모달 제목 중앙/입력 시작선/하단 Contact Support 잘림 수정. 2차에서 고객 선택 메뉴 초기 키보드 초점의 연한 배경+흰 글자 대비 문제 발견→초점/hover에서도 녹색 배경·명시 outline. 수정 후 대상 검사/캡처 재수행.

2차 코드/흐름 재검토: 저장 전·후 scope/generation, 초안 수명, 하위 고객 취소, create→G17→G18 같은 ID 접근, 협업자 범위, 고객/전체 표시 일치, 장식 텍스트 접근성, 320폭 실제 입력 경계 확인. 이 범위에서 재현된 동작 결함은 수정했다. 아래 미수록/시각/환경 대기는 별개다.

## 실제 명령과 검증 이력

FE/user-web, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, `corepack pnpm`8.14.1.

- `typecheck`, `lint`, `test`, `build`: 현재 타입/lint 통과, unit17파일67/67, build 통과. build의 기존 chunk size 경고는 별도이며 실패가 아니다.
- unit3추가: 기존/새ID·동시같은UUID·고객선택·초기단계·같은이름별ID·팀초대연결, 하위고객확정/실패재시도/유효성, 취소/문맥/reset/협업권한.
- 최초 개발 대상14개:11통과3실패(고객 링크/Project scenario locator). `team.spec.ts`는 실제 파일명이 아니어서 이 실행에 G17 검사는 포함되지 않았다. 최초 결과를 보존한다.
- 수정 스크립트의 잘못된 cwd 경로로 FileNotFound 뒤 실행된 두 번째 G21 검사2/3. 경로 정정 후 세 번째 G21+초대 연결4/4.
- 최종 영향 검사: `playwright test tests/e2e/project-creation.spec.ts tests/e2e/clients.spec.ts tests/e2e/client-fields-images.spec.ts tests/e2e/invitations.spec.ts tests/e2e/team-settings.spec.ts tests/e2e/app-shell.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G21/dev-final` 개발30/30, 동일 목록에 `-c playwright.preview.config.ts` 빌드30/30.
- 마지막 초점 대비 CSS 수정 후 build·G21 대상 개발4/4·빌드4/4·12캡처 재수행 통과. 마지막 고객 선택 비교를 다시 직접 확인해 초점의 녹색 배경/흰 글자와 외곽선이 유지됨을 확인했다.
- 로그/JSON은 `/tmp/onehandsales-g18-g27/G21/`의 `*-first/second/third/final/visual`로 최초/재실행을 구분. Playwright JSON도 같은 임시 경로로 지정했다.
- 모든 검사는 실제 navigation/click/dblclick/keyboard. 고객/전체/열 생성→취소·back/forward·재진입, 실패후retry/slow취소, readerror/empty/denied/normal, 좁은화면·긴한국어/합성IME, 새로고침 인증 초기화, 직접 URL missing을 확인했다. OS IME를 실행했다고 쓰지 않는다.
- 네트워크 observer는 가로채기 없이 request/response/requestfailed/socket/console 기록. 최종30개씩 인증/업무/외부API0, 실패0, console0. 상세 합계는 아래 최종 추가 기록. 개발5175·빌드4175, 사용자5173 보존.

## 비교 캡처와 남은 차이

원본 경로는 위2개 flow 디렉터리의 PNG. 임시 `source/{client-01~05,project-01~06}.png`, `captures/` 같은 이름+`project-narrow.png`, `comparisons/*-side-by-side.png`/`*-difference.png`, `review/` 축소비교. `capture.mjs`, `compare.py`, `capture-report.json`에 실제 준비 조건/요청 기록. 마지막 캡처는1440×900, 좁은화면320×600, 고객Overview 하단scroll442, 최종보드scroll580. 원본 동일 스크롤값 확인불가이므로 관찰 구간 정규화다.

11쌍을 직접 보고 폰트/색/배치/문구/카드·입력·버튼·지원링크 비교 및 수정. 전체 완전 일치가 아니다. 원본 Joe Doe/JS/JD와 가상 Alex/DC, 고객 사진 미확보, 기존 G17 3개 seed와 원본1개/비어있음의 차이, 공통 헤더/아이콘·폰트 세부/모달 구분선/본문 세로 간격/보드 우측 scroll 정렬/하단 검증 도구 등 차이가 남는다. seed를 몰래 지워 원본과 같은 데이터라고 만들지 않았다. 목 고정 날짜는 원본 Today와 구별한다.

원본 팀 편집/제목 초기값/상단 생성 초기 단계/신규고객 하위 세부·모바일/키보드/원본DPR 미확인. 실제 OS IME·보조기술·Safari/Firefox 환경 미실행. 문서/결제/이메일/서버권한/시간대/영속·DB 질문은 후속 메모이며 실제 호출/구현하지 않는다.

## 5173 확인 순서

1. `/app/clients`→가상 Alex→Doe Company→Projects +→제목→생성→동일고객/초기NewLead/생성활동 확인.
2. Projects→New Project→고객/제목→취소·재진입, Sample Client 안내 범위 확인. +New Client→하위 취소/저장→부모 제목 유지→생성.
3. In Progress 열 +→같은고객/다른제목 생성→해당열. 검색/카드→동일상세, 뒤로/앞으로.
4. Project preview controls write-error/slow→입력 보존·재시도·Escape취소→normal. 좁은화면 폼 스크롤/키보드고객목록 확인.
5. Team→새프로젝트 선택 초대→로컬 초대 링크→가입수락→배정된 새프로젝트만 접근. 실제 메일은 보내지 않는다.

[G18~G27 진행표](G18_G27_RESULT.md)와 관련 G/R에 연결. G21만 로컬 커밋 후 G22 진행. push/배포/Backend/G28은 제외한다.

최종 네트워크 집계: 영향 개발30개80,815요청/빌드30개865요청, 마지막 CSS 수정 후 개발4개10,973요청/빌드4개70요청. 모두 실제 API/외부·요청실패·console오류0. 마지막12캡처 요청수는 임시 capture-report.json에 기록하며 위 집계와 합쳐 테스트 수로 세지 않는다.

### G22 연결·회귀

[G22 결과](G22_RESULT.md)에서보드/표를같은원본에연결하고날짜·금액·태그투영을추가했다. G21생성/중첩고객/취소/권한·G17초대/G18수락4개와G22조회3개개발/빌드각7개현재검증. 최초환경시간초과2건과재실행은별도기록,이전원본/환경대기유지.

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.


<a id="g21-r4-recheck"></a>
## G21 R4 재대조·보완 — 2026-11-27 KST

현재 판정: **구현 보완·로컬 검증 수행 / 엄격한 원본 동일성·실제 브라우저·미수록 정책 미완**. 이전 체크와 브라우저/시각 수치는 당시 이력이며 이번 실행 증거로 재사용하지 않는다.

| 네 기준 | 작업 전·후 대조와 영향 |
| --- | --- |
| FRONT_AGENT | 구조·컴포넌트·상태/데이터·목·접근성/레이아웃·한글 주석·테스트·엔지니어링 체크 적용. 생성 UI/hook/표시 모델, 생성 host/link, 성공 안내만 변경. 저장소·공통 Dialog·실제 API/BE/DB/ENV/의존성 변경 없음 |
| 명세·선행 | G21·G01/G17/G19·R03, R4 관찰5/남은 분석2와 공통12기준 대조. 고객 고정·선택·초기 단계·Sample 안내·독립 고객 생성·중복/취소·같은 ID 연결을 확인 |
| 코드·소비 | 고객→프로젝트 생성과 전역/열 생성, 하위 New Client, 고객 상세 프로젝트 목록, 보드·상세·기존 팀 초대 저장소의 같은 ID를 검증. G19/G20 DOM20개 회귀 포함 |
| Flow·원본 | 고객 경로 dd29b56e-cc30-4875-8f7b-302ca3909d05 01~05 / 목록 경로 ddea1540-3c0b-4e00-8805-12b4adc290c1 01~06. MCP11단계 재조회·원본11PNG 직접 확인·ANALYSIS 단계 ID/파일 순서 일치. PNG2880×1800, MCP1440×900; 실제 CSS viewport/DPR 미확인 |

### 관찰 대응과 보완

- F021-O01: 고객 경로의 고객 입력 없음·제목/팀·외곽 닫기·Support 유지. 팀 이니셜을 이름 앞 두 글자에서 단어 첫 글자로 보완했다. 가상 소유자 표시를 원본 Joe Doe로 강제로 바꾸지 않았다.
- F021-O02: 생성 상세의 6탭·고객 링크·활동·Tasks/Documents·청구/비용/시간/내부 노트 소비를 확인. 실제 고객 이니셜 규칙·인물 파일은 미확인이다. 기존 다른 시점 seed의 업무/시간 데이터를 원본 새 생성 상태와 혼합하지 않는다.
- F107-O01: 기존 고객/기본 이메일 두 줄·+New Client·부모 제목 보존 유지. 잘못된 화살표 문자 대신 봉투 SVG, 펼침 방향 아이콘·빈 선택값 회색을 보완. SVG 원본 자산 동일성 인증은 아니다.
- F107-O02: Sample ID에만 노란 안내와 조건부 높이, placeholder/입력값 구분 유지. 실제 문서 수락/결제는 실행하지 않는다.
- F107-O03: 열 내부 생성은 해당 단계, 전역/고객은 New Lead인 기존 목 정책을 유지했다. 관찰된 In Progress를 모든 생성의 기본 상태로 확정하지 않는다.
- F021-A01/F107-A01: 생성 제목 기본값·팀 변경/권한·초기 단계 원인·오류/하위 폼 중간 화면과 폰트/정밀 배치 분석은 대기다.

비교용 절반 좌표에서 모달 좌측490/폭460/상단60, 입력 좌측530/폭380/높이40, CTA 좌측510/폭420/높이46, 팀 아바타26×26이다. 고객 모달 하단 약501, 전역 빈 폼610, Sample 안내 포함718이며 기존 CSS의 조건부 높이/여백과 대조했다. 실제 렌더 측정은 하지 않았다. 정확한 내부 폰트·weight·자산·blur·모든 줄바꿈/색/픽셀은 미완이다.

### 결함·검증·재검토

신규 DOM6개 최초 **4실패/2통과,22.21초**: 취소 시 hash/state 유실, 조합 Escape 미방어, 필수 오류의 초점/aria 연결 없음, 뒤로가기 성공 안내 재생. 생성 query만 제거하며 나머지 주소/state를 보존하고, 조합 Enter/Escape·하위 폼 전환 초기화·동일 필수 검증/초점·해당 객체 및 POP 제외 성공 안내로 보완했다. 첫 두 글자 아바타와 선택창 표시도 원본 대조에 따라 수정했다.

최종 **4파일32/32,59.85초**: G21 DOM6 + G19 DOM10 + G20 DOM10 + project store6. 두 진입점·열 생성·실패 재시도/중복·지연 요청 이력 취소·독립 고객·필드/이미지·초대 ID 소비를 포함한다. app/node 타입(noEmit/incremental false)·전체 ESLint 통과, Vite 메모리 빌드1976모듈/3출력8.07초 통과. 기존 Browserslist 데이터 경고 유지. diff 공백과 기존 문서/색인/R4 링크 정합성을 검토했다.

C01 근거/촬영 조건, C02~08 구성·문구·폰트/치수/색/자산, C09~11 입력·저장/취소·전환, C12 고객/팀/프로젝트 소비를 재대조했다. 구현 결함은 수정했지만 시각·환경 대기를 완료로 올리지 않는다.

### 미확인·미실행과 영향

연결 문서 세션 없음. 자동 산출물 금지 기준에 따라 브라우저 프로필·캡처·임시 스크립트/보고서를 만들지 않았다. 실제 브라우저 E2E·native dialog/OS IME·좁은 폭/스크롤·console/network·픽셀 비교는 미실행이다. DOM의 대체 dialog·합성 composition 통과는 이를 대신하지 않는다. 실제 API 요청 수는 null/not_observed이다. 원본 미수록 정책과 폰트/자산 부족은 엄격한 동일 재현 미완으로 유지한다. 다음은 승인된 G22이며 G25·실 API·원격 push·배포는 범위 밖이다.
