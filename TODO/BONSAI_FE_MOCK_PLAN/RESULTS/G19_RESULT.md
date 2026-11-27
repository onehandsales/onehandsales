# G19 — 고객 목록·신규 고객·상세 실행 결과

> 2026-11-27 현재 결과: [G19 R4 재검토](#g19-r4-recheck) · [G19–G20 최종 연결 검토](G20_RESULT.md#g19-g20-final-review). 아래 최초 기록과 이번 검증을 구분한다.

과거 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증 수행. 프로젝트 고객 선택은 G21 연결 대기, 미수록/시각/환경 대기는 별도 유지. 시작 HEAD `553e28be`(G18), 기존 사용자 변경 없음. 실행일은 연속 작업의 2026-11-21~22 KST 기록이다. 사용자 지시로 G19 단독 로컬 커밋하며 push/배포/API/Backend는 제외한다.

## 근거와 범위

[R03 소비 분석](R03_RESULT.md)을 먼저 수행했다. App `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` / bonsai-web, 채택 카탈로그 Latest/2146은 G18 앱 조회를 재사용. 이번 두 flow MCP batch 조회와 ANALYSIS 4·5·8절, 원본 PNG12개를 직접 확인했다. 카탈로그와 제품 빌드/촬영일은 같은 버전이 아니다. 후자는 미확인이다.

| Flow | ID | 단계 및 Screen ID |
| --- | --- | --- |
| Adding a new client | a5f7a722-8a0c-4528-966a-903e7e0873fb | 01 `sc_a0fa68609b634defb4a2ccd18b63a4a2`, 02 `sc_40ff225f161846249b5cf8c2c55423b6`, 03 `sc_3e2640e1d9ca4b59a7f1c79cb628a502`, 04 `sc_7435a1d441654b5fa2a8428533fd5d87`, 05 `sc_225e25a9ba6745be98341cf77524fa23`, 06 `sc_b1619b6b9fc3405e8ad67fd26f405b62`, 07 `sc_9e5c9989e48d45459e62cc2fe0b886fb` |
| Clients | f8191fa7-f2d9-4060-bd47-891b2d627aaa | 01 `sc_a333622d5e8c45e0b19ff4c249dc0aca`, 02 `sc_7f0b669f27f248c9bc800df624d5a8ac`, 03 `sc_531ce252700c43088b29703be32726d6`, 04 `sc_102bdc6203b741afb96bd13d81b43cd8`, 05 `sc_cc68ecaccb72426b8573fca9ece52fc9` |

원본 경로는 `bonsai_analysis/flows/{위 flow}/screens/NN_ScreenID.png`. MCP 메타데이터는 `/tmp/onehandsales-g18-g27/G19/mcp-sources.json`. 새 고객 직후 프로젝트/청구/메모는 비어 있다. 목록은 다른 시점의 두 고객/사진이며 생성 직후 상태와 섞지 않았다. 과거 Clients와 현행 Companies 언급은 구분했으며 현재 사이트/API를 조회하거나 디자인을 혼합하지 않았다.

## 구현과 상태 소유

- `/app/clients`: 검색·이름/연락처 정렬·목록·조회 실패/재시도·빈 상태·검색 무결과·권한 제한. `/app/clients/:clientId`: 같은 고객/기본 연락처/태그와 빈 업무 패널, 이메일 클립보드 복사·실패 안내.
- 전역 New → Client 및 목록 New Client는 `?create=client` Dialog. 입력/필수 검증·Client/Lead 선택·취소·Escape·포커스·저장 실패 재시도·중복 방지. 성공은 실제 상세로 replace하고 목록에서 같은 ID를 확인한다.
- `?tab=portal/automations/settings`: 관찰된 소개/Disabled/Branding 상태, 닫는 배너, 브랜드 설정·Support 연결, 태그 사용 건수와 기본 필드3개의 조회. 실제 포털 변경은 G73, 필드/이미지는 G20, 프로젝트는 G21. 연락처 CRUD/보관/삭제/메모/CSV/filter/자동화 편집은 미수록 경계 Dialog와 복귀만 제공한다. 이 안내를 해당 업무 구현 완료로 쓰지 않는다.
- `features/clients`의 model/seed/store/Query hook/생성 hook/UI와 `pages/clients` 조합을 분리했다. scope별 Query는 같은 저장소를 조회한다. `lib/abortable-delay.ts`로 기존 인증 지연 함수를 이동하고 기존 import는 re-export해 동작을 유지했다. HTTP adapter/새 의존성 없음.
- 고객 회사는 G15의 운영 회사와 별도다. 고객/연락처/태그는 workspace ID로 격리한다. 제출 UUID 한 개는 고객과 기본 연락처를 한 번만 함께 저장한다. 실패·취소는 부분 저장하지 않는다. 다른 고객의 같은 이메일을 자동 병합하지 않는다.
- 회사명은 선택이며 공란이면 연락처 이름을 표시명으로만 사용한다. 이름200/이메일254자·이메일 형식/태그 소속 검증은 목 가정. 새 고객은 Active이고 생성 연락처가 Default이다. 역할은 owner/일반 member 허용, G18 초대 협업자는 저장소에서도 거부한다. 실제 서버 정책으로 확정하지 않는다.
- 저장 데이터는 같은 탭 재로그인에서 유지, workspace 전환 격리, 새 문서/새 탭/Reset에 seed 초기화. 입력 초안은 모달 종료·경로·scope 변경에 폐기, 실패 때 유지. 검색/정렬/탭은 URL이 소유하며 back/forward로 복원한다. empty는 저장 원본을 지우지 않는 읽기 전용 시나리오로, 생성하려면 Normal 복귀를 안내한다.
- 지연 작업은 abort와 actor/workspace/revision/generation을 저장 직전 다시 확인한다. 중복 버튼 ref와 저장소 제출 ID 양쪽에서 한 번만 반영한다. 이미 생성한 데이터는 새 시나리오 선택으로 삭제하지 않는다.

## 1차 검토 → 수정

코드의 저장 경계·접근·navigation·포커스, 원본과 실제 캡처를 검토했다. 검토와 다음 테스트 실행은 별도 근거다.

1. 최초 lint7오류(조건식 부수 효과/전각 공백)를 명시적 분기·공백 정리로 수정.
2. 단위 검사 첫60통과/1실패는 Alex에게 없는 `studio-b`를 선택한 fixture 오류였다. 저장소는 올바르게 거부했다. 실제 두 번째 workspace `studio-a-two`로 변경 후61/61 통과.
3. 생성 저장 때 Query 변경이 폼을 unmount하지 않도록 같은 scope의 이전 조회를 유지했다. scope 자체 변경은 보호 셸의 key로 완전히 교체한다. 생성 성공·빠른 중복·취소/늦은 저장 없음 회귀를 추가했다.
4. 비교 캡처에서 폼 간격/글자·CTA 크기·목록 열·상세 카드·Settings 행 높이·포털 배너 높이를 조정했다. 상세에서 Clients 사이드바 선택이 유지되게 Dashboard에만 exact 매칭을 적용했다.
5. 이메일 복사와 포털 배너 닫기를 실제 로컬 동작으로 연결했다. 미수록 외부 URL은 확인된 전체 주소처럼 만들어 내지 않고 미제공 안내로 남겼다.
6. 첫 캡처 스크립트는 Email의 필수 별표를 exact locator에 누락해 timeout. 수정 후 실행했다. 중간 탭 캡처는 이전 `.clients-body`가 남아 잘못된 탭을 담았으므로 비교 근거에서 제외하고, 목적지 제목과 선택 탭을 기다리도록 수정했다. 최종 탭 캡처는 새로고침/로그인으로 seed2개 상태를 맞췄다. 기능 검증과 캡처 준비 오류를 구분한다.

## 현재 실행한 검증

macOS `FE/user-web`, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, Node24.18.0/pnpm8.14.1. 기존5173 PID59363 유지, 검사용 개발5175/빌드4175. Backend 미실행.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`: `typecheck-verified.log`, `lint-verified.log`, `unit-final.log` 통과, **61/61**. 최초 단위/lint 실패는 위와 `*-first.log`에 보존. CSS 마지막 보정 뒤 `corepack pnpm build`도 `build-verified.log` 통과. 기존 chunk>500kB 경고 유지.
- 첫 영향 개발 검사 `dev-first.log/json`:16/16 통과. 이후 시각/사이드바/복사/배너와 목적지 확인 검사를 보강한 최종 결과는 별도로 기록한다.
- 최종 영향 개발/빌드 `dev-verified`/`build-browser-verified`: **16/16씩 통과**. 이후 Settings 단수 표기만 `1 Client`로 고친 마지막 대상3개씩도 `dev-label`/`build-label`에 각각3/3 통과. 두 실행을 합쳐 최초19개 통과로 쓰지 않는다. 마지막 타입/lint/build는 `*-verified.log` 통과.
- 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G19/dev-verified.json corepack pnpm exec playwright test tests/e2e/clients.spec.ts tests/e2e/app-shell.spec.ts tests/e2e/invitations.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G19/dev-verified`. 빌드는 같은 명령에 `-c playwright.preview.config.ts`, 경로를 `build-browser-verified`로 변경했다.
- G19 신규3개: 실제 New 메뉴/키보드/닫기, 생성·동일ID·검색/무결과·history·reload, 실패 입력 보존/재시도/이중 클릭/지연 취소, read-error/empty/denied/normal·미존재 직접 URL, 탭별 실제 내용, 320×500 긴 한글 폼/필드 경계·합성 composition. G14 셸8개와 G18 초대5개를 회귀 대상으로 포함했다.
- Unit4개 추가: 고객·연락처 원자적 생성/중복, 실패·abort, scope/reset/협업자 제한과 workspace 격리. 개수만 늘리는 동일 검사는 추가하지 않았다.
- 실제5173 `node /tmp/onehandsales-g18-g27/G19/capture.mjs`: 최종12 PNG(보고 배열은 별도 scroll 촬영을 제외한11), API/외부0·요청실패0·console오류0. 요청 가로채기/차단/navigation mock 없음. 캡처 마지막 Reset으로 정상 기본값 복원.

## 시각 비교·2차 재검토

- 로컬 원본2880×1800을 MCP 이미지 크기1440×900에 정규화했다. 원본 CSS viewport/DPR은 미확인이며 DPR2라고 확정하지 않는다. 구현 Chromium viewport1440×900/DPR1, 모달/탭/입력/태그·scroll을 명시해 비교했다. 상세 하단은 원본 상단 패널 위치로 추정한 scroll432에 정규화했다.
- `/tmp/onehandsales-g18-g27/G19/captures/`: `02-list`, `03-empty`, `04-filled`, `05-tagged`, `06-detail`, `07-detail-scroll`, `03-portal`, `04-automations`, `05-settings`, `detail-narrow-320/390/768` PNG.
- `comparisons/`의 위9개 `*-source.png`, `*-side-by-side.png`, `*-difference.png` 생성 후 병치9개를 직접 봤다. 치수/font/color/URL은 `capture-report.json`에 기록했다. 원본 생성 배경은 Feb6이고 구현은 기존 G14 Feb14 목 대시보드라 배경 차이는 남는다.
- 추정 CSS: sidebar200/header70, 본문 padding60, 모달460/입력380×40/CTA420×46, 상세 left:right1.74:1/gap90. 기존 Gellix 자산의 원본 파일 동일성은 미확인. 원본과 완전 일치를 주장하지 않는다.
- 2차 코드 검토: feature/public API 방향, 고객과 운영 회사의 분리, Query 수명, 제출/abort/generation·scope 검증, 실제 링크/메뉴·읽기 전용 empty와 후속 행동 경계를 재확인했다. 테스트 실행 결과는 위 로그와 구분한다. 새 named function/hook/component 한글 책임 주석은18개 파일 검사에서 누락0(`comment-review.json`). 현재 대상에서 중복·취소·ID·접근 결함은 재현되지 않았다. 아래 자료/환경 대기를 유지한 목 범위 커밋 판정이다.

## 남은 차이와 인계

- G21 프로젝트 선택지와 연결 ID 검증, G20 필드/이미지 소비는 해당 Goal에서 이어간다. R03 연락처 CRUD·기본 연락처 변경·메모·보관/삭제는 추가 근거/배정 대기, R03 전체 완료 아님.
- 폰트 weight/아이콘/브랜드 avatar 원본 파일, 원본 JS 아바타 의미/사진, 태그 선택 과정/05의 pale CTA 의미, 포털 전체 URL/요금제/권한, 모바일/키보드 원본은 미확인이다. DC 이니셜·native tag 체크·empty 상태 문구는 목 가정.
- 자동화 소개의 잎/장식 자산은 없어서 카드/텍스트 근사만 구현했다. 배지·필드 줄폭·태그 이후 모달 높이·우측 폼 간격·아이콘/Help floating button 등 시각 차이는 남는다. 포털 URL 미제공 안내는 원본 URL을 대체한 명시적 목 경계다.
- 실제 OS IME·보조기술·Firefox/WebKit·실기기는 미실행. 합성 composition/Chromium 좁은폭 검사를 실제 OS 검증으로 쓰지 않는다. 실제 메일/고객/청구·서버 권한/중복정책·DB·출시는 제외하고 후속 설계 메모로 유지한다.

## 5173 확인 순서

1. `/app/clients` → Continue as Alex → 두 고객 목록. 전역 New → Client 또는 New Client.
2. 회사명 선택 입력, 이름/Email 입력, Client/Lead 선택 → Add Client를 빠르게 두 번 → 상세 한 개. Clients에서 검색하고 같은 이름/연락처/태그 확인.
3. Client preview controls → Write error once → 신규 폼 제출 → 오류 후 입력 유지 → 재시도. Slow → 제출/Escape → 늦은 고객이 목록에 생기지 않는지 확인.
4. Client Portal → 배너 닫기/브랜드 설정 왕복, Automations → 안내/닫기, Settings → 태그 사용 건수와 기본 필드.
5. 주소 직접 진입·뒤로/앞으로·좁은 화면 확인. 마지막 Normal 또는 Reset preview. 새로고침은 저장 데이터와 인증이 메모리 초기화되는 정책이다.

최종 관찰 요청: 영향 개발45454/빌드645건, 마지막 표기 보정 대상 개발7221/빌드48건(정적 자산). 각 실행 API/외부0·실패0·console오류0이며 `verification-summary.json`에 별도 보존했다. 과거 최초 단위/lint 실패는 삭제하지 않았다.

### G20 연결·회귀

[G20 결과](G20_RESULT.md)에서 기존 Settings 필드를 정의 ID·값 입력으로 연결하고 고객 대표 이미지를 목록/상세에서 공유했다. G19 생성/취소/읽기/탭3개+G20 3개 개발/빌드6개씩 현재 검증. 필드·이미지의 보완 전 과거 G19 기록은 위에 보존하며 G21·원본·시각·환경 대기는 유지한다.

### G21 원본 연결·현재 회귀

[G21 결과](G21_RESULT.md): 기존 프로젝트 ID를 유지하며 새 생성 프로젝트를 고객별 목록/전체 보드/팀 초대/초대 수락자 목록에 같은 ID로 연결했다. 영향 대상 개발/빌드30개씩 현재 검증했다. G18의 새 프로젝트 접근 연결은 수행, Tasks는 G25~27 후속 연결. 기존 원본/시각/환경 대기 및 위 과거 기록은 유지한다.

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.
<a id="g19-r4-recheck"></a>
## G19 R4 재대조·보완 — 2026-11-27 KST

현재 판정: **구현 보완·로컬 검증 수행 / 원본 동일성·실제 브라우저·미수록 정책 미완**. 아래 과거 수행 기록은 당시 이력이며 이번 검증으로 재사용하지 않는다. 작은 폰트·픽셀 차이도 완료로 허용하지 않는 현재 기준을 적용한다.

### 작업 전·후 네 기준 대조

| 기준 | 확인·보완과 영향 범위 |
| --- | --- |
| FRONT_AGENT | README·엔지니어링 체크리스트·상태/데이터·목 개발/테스트·컴포넌트/접근성/주석 규칙을 적용. 기능 책임 주석, UI/hook/store 분리, pending·abort·작업공간·초점·조합 입력을 검토. API/BE/DB/ENV/의존성 변경 없음 |
| 갱신 명세·선행 | G19·R03·G01/G15 소비, R4 관찰7/남은 분석3·공통12기준을 대조. 실제 정책과 정적 캡처 사이의 미수록 동작은 목 가정으로 유지 |
| 코드·연결 | 고객 생성→목록/상세의 같은 ID, 검색/탭, 공통 Dialog, G16 브랜드 설정 복귀, 기존 G21 중첩 고객 생성·선택을 검토. 프로젝트 구현 변경/새 Goal 착수 없음 |
| 원본 | Adding a new client `a5f7a722-8a0c-4528-966a-903e7e0873fb` 01–07, Clients `f8191fa7-f2d9-4060-bd47-891b2d627aaa` 01–05. MCP로 12단계 ID/순서·1440×900 메타데이터를 재조회하고 로컬 12PNG를 직접 열어 ANALYSIS와 대조 |

### R4 관찰 대응

| 항목 | 판정 |
| --- | --- |
| F003-O01: 배경·New 메뉴 | 기존 셸 소비 유지. 원본 Feb6과 목 대시보드 날짜/내용 차이, 아이콘·픽셀 동일성 대기 |
| F003-O02: 빈/입력/태그 폼 | 원본 03–05의 외곽 닫기·footer·설명·필드·별표/버튼색 대조. 빈 별표 회색/입력 시 붉은색, CTA 색 보완. 태그 선택·필수 오류·조합 취소/중복/실패 보완 |
| F003-O03: 생성 상세 | 같은 고객 ID·연락처·메뉴·주소/필드·알림 검토. 새 성공 안내를 해당 ID로 제한하고 history 재생 방지. 원본 JS 이니셜/사진 의미·전체 이메일 복원은 미확인 |
| F003-O04: 상세 스크롤 | 좌우 패널·Projects/Documents/Invoices/Forms와 기존 프로젝트 연결 검토. 실제 sticky/스크롤·간격·픽셀은 미검증 |
| F019-O01: 목록·포털 | 목록 사진/이니셜·빈 셀·메뉴 유지. 포털의 관찰된 축약 URL·복사/정보/외부링크/닫기 아이콘 보완. 전체 URL이 없어 실제 복사·외부 이동 성공을 만들지 않음 |
| F019-O02: 포털·자동화 | Disabled·브랜드 토글·헤더·JD 겹침 미리보기 검토. 자동화 예시 카드 겹침/구획/잎·크림 장식·Support 보완. 잎은 재구성 SVG로 원본 자산 동일성 미확인 |
| F019-O03: 태그·필드 | 첫 Client 행의 Edit/Delete 표시, 다른 행 hover/focus/mobile 접근 보완. 건수와 G20 필드 소비 유지. 실제 노출 조건은 미수록 목 가정 |
| F003-A01/A02, F019-A01 | 폰트/자산·실제 viewport/DPR·필수 별표 변경 이유·태그 선택/행 노출 조건 미확인. 분석 완료로 변경하지 않음 |

공통12기준은 근거/촬영조건, 구조/크기/색/타이포/자산, 문구/객체, 입력/중간/오류, 전환/취소/저장·접근/회귀 경계까지 대조했다. 원본 2880×1800의 절반 좌표는 비교용이며 CSS viewport1440×900/DPR2를 증명하지 않는다. 모달 폭460/상단60·입력380×40·상세 비율1.74:1/gap90은 기존 근사 기준; 이번 실제 렌더 측정 아님. 새 프레임/브라우저 캡처 없이 픽셀 동일성을 판정하지 않는다.

### 발견한 결함과 검증

최초 G19 DOM6개 중5개 실패/1개 통과. 제품 결함은 **4개**였다: 태그 Escape가 모달 취소로 전달됨, 한글 조합 Escape 미차단, 필수 오류 초점/설명 연결 누락, 뒤로가기 생성 성공 안내 재생. 나머지1개는 테스트의 잘못된 query 이름 `clientId`를 기존 계약 `projectClient`로 수정했다. 제품 결함 수에 포함하지 않는다.

수정 후 G19 DOM6/client store4/project store6 **16/16** 통과. 이후 기존 프로젝트의 고객 취소/성공·선택 초안과 탭/브랜드 왕복2개를 추가했다. 새 G19 DOM **8/8** 통과; 전체 회귀 결과는 아래 최종 검증 기록에 남긴다. 앱/Node 타입 `--noEmit --incremental false`, 전체 ESLint 통과. Vite `write:false` 메모리 빌드 **1976모듈/3출력,9.88초** 통과. 디스크 빌드·보고서·임시 스크립트/이미지는 만들지 않았다.

### 미확인과 영향

- 원본 근거 부족: 정확한 내부 폰트/weight·원본 자산·JS/사진 의미·전체 포털 URL·별표/태그 노출 이유·고객 중복/기본 연락처/외부 자동화 정책. 관찰 화면과 목 가정을 구분하며 전체 재현 완료 아님.
- 환경 검증 미수행: 연결 문서 세션 없음, 기존 preview/debug 포트5173/5174/5175/4175/9222/9223 비활성. 새 서버·프로필/산출물을 만들지 않았다. 실제 브라우저의 native dialog/OS IME/터치·좁은 폭·스크롤·보조기술·픽셀/console/network는 미검증; 실제 API 요청 수는 null/not_observed.
- 사용자 범위에 따라 G19 로컬 커밋 후 G20 필드/이미지를 검토한다. G21 신규 구현은 시작하지 않는다. 시각·자료 대기를 다음 Goal의 해결 완료로 넘겨 쓰지 않는다.


### 최종 커밋 전 검증

최신 전체 **43파일268/268,262.05초** 통과. 새 G19 DOM8개와 이전 G01~G18·기존 고객/프로젝트/작업/템플릿 회귀 포함. 마지막 변경 뒤 app/node 타입·전체 lint 재통과. 실제 브라우저 E2E는 실행하지 않았으며 locator 수정은 실행 증거가 아니다.

<a id="g19-g20-additional-review"></a>
## G19–G20 사용자 요청 추가 검토 — 2026-11-27 KST

G19 `90b36f5d`, G20 `31cf8033`, 최종 문서 검토 `f4ec375e` 이후의 추가 검토다. **확인한 기능 결함은 보완·검증 / 원본 동일성·실제 브라우저·미수록 정책은 미완** 판정을 유지한다.

### 네 기준과 발견 사항

- FRONT_AGENT의 상태/데이터·이력·조합 입력·취소·연결 회귀 기준과 한글 책임 주석을 적용했다. 고객 목록, 전역 고객 생성 취소, 해당 DOM 검사만 실행 코드를 변경했다. 공통 컴포넌트·store·CSS·BE/Admin/ENV/의존성은 변경하지 않았다.
- G19/G20 명세·R03/R20·기존 R4 관찰 대응을 재대조했다. 생성→목록→상세→필드/이미지, 프로젝트의 고객 선택과 전역 New→Client 취소를 영향 범위에 포함했다.
- 기존 원본4Flow19단계와 관찰 대응을 기준으로 네 ANALYSIS의 업무 규칙·미확인 분기를 다시 확인했다. 이번에는 MCP/19PNG 전수 시각 확인을 새로 수행하지 않았다. 검색의 조합·주소 이력 정책은 정적 원본에서 관찰한 사실이 아닌 로컬 웹 동작 보완이다.
- 신규 검사2개가 수정 전 모두 실패했다. **첫째**, 검색·정렬 및 New Client 진입/취소가 기존 주소 hash를 버렸다. **둘째**, 한글 검색 조합 중간값이 확정 전에 URL/목록에 반영됐다. URL의 다른 query·hash·state를 보존하고, 조합 확정 전 초안을 현재 이력에 한정했다. 상세의 목록 복귀 주소에도 hash를 포함했다.
- 첫 보완 후 뒤로가기 검사를 강화하자 이전 이력의 미확정 초안이 다시 표시됐다. 이동 시 초안을 폐기하도록 추가 수정했다. 이 중간 보완 결함을 별도의 기존 결함으로 합산하지 않으며 다음 Goal로 넘기지 않았다.

### 최신 실행 검증

- 영향 **5파일33/33,49.11초** 통과: G19 DOM10, G20 DOM10, 고객 생성 store4/편집 store3, 기존 프로젝트 store6. 전역 New의 회사 설정 URL 복귀, 검색·정렬·취소의 query/hash 보존, 한글 조합 확정과 이동/뒤로가기 폐기를 포함한다.
- app/node TypeScript `--noEmit --incremental false`, 전체 ESLint 통과. Vite `write:false` 메모리 빌드 **1976모듈/3출력,9.04초** 통과. 기존 Browserslist 데이터 경고는 남지만 빌드 실패가 아니다. 의존성 변경은 하지 않았다.
- 이전 전체44파일278/278은 수정 전 실행 이력이다. 이번 변경 뒤에는 위 영향 검사33개를 실행했으며 전체를 다시 실행한 것으로 쓰지 않는다. 검사/빌드의 캐시·디스크 출력·임시 스크립트·이미지·보고서는 생성하지 않았다.
- 실제 브라우저 검증은 미실행이다. 연결 문서 세션이 없음을 재확인했고, 이번에는 포트 상태를 다시 조사하지 않았다. jsdom의 합성 composition·대체 dialog/이미지 decode 검사는 실제 OS IME·파일 선택/디코딩·좁은 폭·스크롤·보조기술·network/console·픽셀 검증을 대신하지 않는다. 실제 API 요청 수는 미관측이다.

정확한 font/weight·원본 자산·viewport/DPR·전체 포털 URL·미수록 필드/이미지 정책은 여전히 확인하지 못했다. 영향은 엄격한 Bonsai 동일성 미완이며 추가 원본/실제 브라우저 검증이 필요하다는 점이다. 이번 보완은 로컬 커밋으로 남기고 push·배포는 하지 않는다. 다음 권장 묶음은 **G21~G24 프로젝트 생성→보드/표→단계/태그→상세/설정**이며 명세만 확인했다. G21 구현은 착수하지 않았다.
