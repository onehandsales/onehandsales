# G18 — 초대 수락·협업자 접근 실행 결과

실행일: 2026-11-21~22 KST. 원본 MCP 조회일21일, 마지막 재검증/기록22일. 시작 HEAD `dec5d9f3`, 작업 트리 깨끗함. G18~G27 연속 요청 중 첫 Goal이며 개별 로컬 커밋을 사용자 요청으로 승인받았다. G18 검증·커밋 후에만 G19로 진행한다.

## 판정과 범위

**관찰 범위 목 구현·두 차례 검토·현재 가능한 검증 수행. 자료/시각/환경·후속 업무 연결 대기 유지.** G18 초대 폼·같은 팀 ID 수락·workspace별 제한 접근과 최소 협업 화면을 구현했다. 실제 인증/메일/API는 연결하지 않는다. 기존 G01~G17과 R02의 원본 미수록·시각/환경 대기를 유지한다.

| 화면/경로 | 구현·상태 소유 |
| --- | --- |
| `/invite/:workspaceId/:invitationId` | 공개 초대 전용 폼, 고정 대상 이메일·이름·샘플 비밀번호, 유효/다른 계정/만료/수락됨/철회·미존재 |
| `/app/invitations/:workspaceId/:invitationId` | 기존 로그인 returnTo의 안전한 앱 상대 경로. 같은 초대 폼; 미인증도 대상 확인 가능하며 수락 시 인증 규칙 적용 |
| G17 Team 도구 | Pending 행에서 정확한 ID의 로컬 초대 링크. 실제 발송 링크가 아님 |
| `/app/projects`, `/app/projects/:projectId` | 허용 ID만 목록/검색/개요. 원본10·12. 다른 프로젝트 직접 접근은 unavailable |
| `/app/tasks` | 원본11의 최소 작업 보드·검색·후속 편집 인계 Dialog. 실제 작업 저장소는 G25에서 연결 |
| `/app/settings/profile` | 초대된 사용자의 이름 확인만 제공하는 목 경계. 원본 Settings 본문은 미수록 |
| 앱 셸·계정 메뉴 | 초대 membership일 때 Projects/Tasks 및 Help Center/Settings/Logout. 회사·팀·재무 직접 URL 차단 |

## 원본과 보완 분석

[R02 소비 보완](R02_RESULT.md#g18-소비-보완-분석--2026-11-21-kst), [ANALYSIS](../../../bonsai_analysis/flows/Accepting%20an%20invitation/ANALYSIS.md).

Bonsai Web / `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, Flow `08d7796f-33e4-4742-9a98-04c919916456`, 카탈로그 Latest/2146. 이번 MCP get_flow_screens/get_app 조회 및 PNG13개 직접 열람. 촬영일·제품 빌드 미확인. 기존 2026-11-20 분석의 계정/서버 정책을 신규 관찰로 쓰지 않는다.

| 단계 | Screen ID |
| --- | --- |
| 01 | `sc_56e0d2abfaec42c8b612894f5bcc192a` |
| 02 | `sc_57e384cf31904da7939aed3a43f24171` |
| 03 | `sc_f0e383ef04984fa9b1005bb85bd16407` |
| 04 | `sc_8eec8db38d2449deb4a4202aef115aff` |
| 05 | `sc_f9eb6c73bcca4042becaf9f5fb77483d` |
| 06 | `sc_f9f38c9c720c40f68cd780f27e65738d` |
| 07 | `sc_acf1d78ada874bba9803cc879db1fcea` |
| 08 | `sc_cb73e29da15944959eed59fff7f8c9ee` |
| 09 | `sc_c32beee8ce2e4eaa9ea56bca107a57c6` |
| 10 | `sc_5e1337bcde974a128e69d87166b0e6be` |
| 11 | `sc_79190c957f234a9d89fd130d5e009e07` |
| 12 | `sc_b774b3dcb1294d73ac858ab9e970ebd0` |
| 13 | `sc_a31f80b8bb624168ba0f6252a113bbfb` |

01~07의 다른 이메일 로그인 실패/일반 가입을 단일 성공 이력으로 묶지 않았다. 08~09 고정 초대 폼, 10~13 제한된 메뉴/프로젝트/작업/시간 요약을 채택했다. 원본 PNG는 `bonsai_analysis/flows/Accepting an invitation/screens/NN_SCREENID.png`에 있다. 로컬 이메일은 `jon@example.test` 등으로 바꿔 실제 계정과 구분한다.

## ID·저장 경계·목 정책

- TeamStore가 G17 workspace별 동일 행 ID를 소유한다. `studio-a:invite-jon`은 수락 뒤에도 같은 ID이며 `studio-a:member-jon`(다른 이메일의 동명이인)은 유지된다. Design 프로젝트는 기존 `studio-a:team-project-2`다.
- 초대 입력은 페이지 hook, 표시·avatar initials 제거/복원은 폼, 인증 계정/digest는 AuthStore, 팀 행은 TeamStore다. 초대의 원본 avatar 제거 후 결과는 미수록이므로 initials의 일시적 제거/복원만 구현하며 파일 업로드/프로필 저장으로 해석하지 않는다.
- 인증 지연·입력 검증 후 저장 직전에 TeamStore가 Pending·이메일·ID·revision·만료/철회를 다시 검사한다. Joined 변경 이후 await 없이 계정/membership/세션을 반영한다. 실패/취소에서는 어떤 Joined도 먼저 생성하지 않는다.
- 현재 세션 이메일 불일치는 로그아웃 요구. 기존 목 계정은 기존 로그인 후 수락, 새 계정은 초대 폼으로 가입한다. 초대 workspace는 온보딩을 요구하지 않는다. 기존 계정의 원래 workspace 설정 완료 상태와 owner/member 역할을 보존한다.
- 초대 membership은 workspace별이다. Collaborator는 선택 projectIds, Partner는 G17 allProjects를 사용한다. Partner의 전체 관리권한은 미확인이므로 초대 경로에서는 같은 제한 셸과 전체 프로젝트 열람만 제공하는 목 가정이다. 기존 G01 Blair의 일반 member 시나리오는 그대로다.
- 금액·청구·구독/역할 자동 승격 없음. 시간은 관찰된 요약만 표시하고 편집은 후속 Goal 경계다. 다른 프로젝트 상세와 TeamStore 읽기는 로컬 권한 검사로 제한한다.
- 같은 탭 로그아웃 후 저장 계정/Joined 유지; 입력·오류·팝업은 이탈/문맥 변경 폐기. 새로고침·새 탭·Reset은 seed. 초대 URL은 안정 로컬 ID일 뿐 실제 인증 토큰이 아니다.
- 명시적 취소는 탐색 완료 전에 입력과 진행 요청을 즉시 폐기. 실패 재시도는 입력을 유지. 중복 요청은 action ref와 저장소 현재성 검사로 차단한다. 시나리오 변경/취소/Reset/계정 변경 뒤 늦은 성공은 저장하지 않는다.
- G21~G27은 G17 프로젝트 ID와 이번 접근 범위를 실제 프로젝트/작업 저장소에 연결해 다시 검증해야 한다. 현재 최소 목 화면을 프로젝트/작업 전체 구현 완료로 표시하지 않는다.

## 1차 검토·수정

1. 페이지/feature/hook/store 경계, 입력/저장 ID, 권한·실패·취소, 실제 navigation과 캡처를 검토했다. 일반 가입 폼을 복사하지 않고 별도 초대 폼과 기존 Auth/Team 저장소 연결을 사용했다.
2. 최초 타입 검사에서 `appNavigation[0]` undefined 가능성(TS2532)을 발견해 안전한 flatMap으로 수정했다.
3. 첫 브라우저 검사에서 수락은 저장됐지만 Joined 업데이트로 폼이 먼저 unmount되어 성공 이동 콜백이 취소됐다. 제출 hook을 페이지 수명으로 옮겨 성공 저장과 실제 프로젝트 이동을 연결했다. 새 사용자/기존 사용자·중복 수락으로 회귀 확인한다.
4. Cancel 직후 빠른 back에서 탐색 완료 전 폼이 유지될 수 있었다. 명시적 취소가 입력·요청을 즉시 폐기하도록 바꾸고, 테스트도 실제 랜딩 내용/자산 준비 후 뒤로 복귀하도록 보완했다.
5. 기존 404 E2E가 Support URL만 확인한 뒤 이동해 로컬 정적 이미지4건을 `net::ERR_ABORTED`로 남겼다. 실패 기록을 유지하고 목적지 자산이 준비된 뒤 이동하도록 수정했다. 요청 차단/실패 필터링은 하지 않았다.
6. 기존 계정 수락이 원래 owner workspace 역할/미완료 사업 설정까지 바꾸지 않도록 membership과 setupComplete 경계를 점검·보완했다. 초대 workspace의 TeamStore 읽기도 별도로 거부한다.
7. lint에서 action.cancel 의존 경고를 발견해 취소 함수를 useCallback으로 고정하고 effect 의존성을 명시했다. feature 간 소비는 제한된 공개 export로 정리하고 membership 판단은 Preview가 소유하게 해 순환 의존을 피했다.
8. 1차 캡처로 초대 폰트/색상/폭·여백/약관 문구/버튼, 프로젝트 헤더·개요 간격, Tasks 컬럼폭/상태 pill/카드/필터, Projects 표 열/날짜·계정 메뉴를 원본과 대조해 보정했다.

9. 후속 재실행에서 G17 초대 Email이 역할·프로젝트 선택 이후 비어 있는 상태를 확인했다. 같은 draft를 캡처한 객체 갱신을 필드별 함수형 갱신으로 변경해 빠른 연속 입력이 서로 덮지 않게 했다. 목록 준비 후 초대 모달을 조작하고 역할/프로젝트 선택 뒤 이메일 보존을 명시적으로 검사한다. 원인 판단과 처음 발생한 trace는 `dev-release`에 보존한다.
10. 지연 취소 검사에서 뒤로 복귀한 native details의 열림 상태를 가정해 다시 클릭하면서 닫았고, 숨은 상태 선택을 기다리다 시간 제한에 걸렸다. 열림 여부를 읽는 테스트 helper와 실제 랜딩 본문 준비 확인으로 수정했다. 이 실패를 제품의 수락/만료 결함으로 쓰지 않는다.

## 현재 실행 기록

검토와 테스트 실행 결과를 구분한다. 명령은 macOS `FE/user-web`에서 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 실행했다. package.json Node>=24<25, pnpm8.14.1 사용. Backend는 실행하지 않았으며 기존5173 PID59363을 보존했다.

- 최초 typecheck 실패: `/tmp/onehandsales-g18-g27/G18/typecheck-first.log`. 수정 후 typecheck 통과.
- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build`: 마지막 `*-verified.log` 기준 통과, 단위57/57. build의 기존 chunk>500kB 경고는 남아 있으며 기능 실패가 아니다.
- 첫 개발 E2E `dev-first.log/json`: 30개 중26통과/4실패. 3개는 수락 후 이동 결함, 1개는 위 정적 이미지 요청 취소. 최초 실패를 재실행 통과에 합치지 않는다. API/외부 요청은0, 실패한 정적 요청4건은 별도 보존.
- 수정 후 `dev-fix.log/json`: 11개 중10통과/1실패(Cancel 직후 back 입력). 이후 취소 처리/검증 준비 조건을 보완했다.
- `dev-ready`:30/32통과, 기반2건30초 timeout. 이때 G18은5/5. 개발/빌드 병렬 실행 후 반복 부담을 줄여 workers2로 재실행했다.
- `dev-commit`:31/32통과, 기반 timeout2건은 통과; 404 경로에서 로컬 정적 자산11건 ERR_ABORTED. URL과 networkidle만으로 새 React 화면 준비를 확인할 수 없어 Support/랜딩 실제 heading 확인을 추가했다.
- `build-browser-ready`:32/32통과, 실패 요청/console/API외부0. 이후 최소 화면의 표시/간격과 위 검증 준비 조건을 추가 보정해 후속 검사를 별도 수행한다.
- `dev-release`:4/6통과,2건 timeout(초대Email 유실과 접힌 검증 도구의 locator 대기). `build-browser-release`:5/6통과,1건 같은 details 조건. 기존 timeout과 다른 재현 조건이며 위9~10에서 구분했다.
- 최종 영향 대상 재실행: `dev-verified.log/json`9/9, `build-browser-verified.log/json`9/9 통과. G18 전5개, G17 초대/제거/키보드3개, G14의404왕복1개. 별도 실행 결과이며 위32개 묶음의 최초 통과로 합쳐 쓰지 않는다.
- 최종 대상의 실제 요청: 개발25127건(정적 모듈/자산), 빌드278건(정적 자산), API/외부0·실패0·console오류0. 전체 시도별 합계는 `verification-summary.json`. 처음 실패한 정적 요청4건/후속11건은 미발생으로 지우지 않았다.
- 실제 브라우저 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G18/dev-verified.json corepack pnpm exec playwright test tests/e2e/invitations.spec.ts tests/e2e/team-settings.spec.ts tests/e2e/app-shell.spec.ts --grep 'G18|public and internal 404|team invitation|menu keyboard|team removal' --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G18/dev-verified`; 빌드는 같은 대상에 `-c playwright.preview.config.ts`, JSON/출력 경로 `build-browser-verified` 사용. 이전32개 묶음은 위 세 파일에 login.spec.ts/foundation.spec.ts를 포함하고 grep 없이 실행했다.

## 2차 재검토 판정 (2026-11-22)

- 수정 코드·상태 전이·원본/구현 캡처·실제 검증 로그를 다시 검토했다. 수락 성공 이동/취소 즉시 폐기/기존 계정·workspace권한·G17 동일 ID/오류 재시도·팀 필드 갱신 결함은 현재 대상 검증에서 재현되지 않았다.
- 인증/팀/초대 화면의 책임과 공개 export 방향, 취소 함수 effect 수명, 직접 URL의 제한, 저장소 Team 읽기 거부, 같은 이름 다른 이메일 보존을 확인했다. 원본 미수록 속성은 실제 정책으로 단정하지 않는다. Admin/서버권한/HTTP adapter는 변경 범위가 아니어서 검토 N/A다.
- 새로운 named function의 한글 책임 주석 자동 확인: 누락0 (`comment-review.json`). 신규 의존성 없음. 실제 브라우저·unit은 별도 실행 근거이며 self review 두 차례와 같은 의미로 쓰지 않는다.
- 내부 셸/인증 변경의 G01/G14/G17 회귀는 위32개 묶음과 최종 영향9개에서 확인했다. G27에서는 전체 단위/개발/빌드 및 G18~G27 실제 업무 연결을 새로 실행한다.
- 원본과 완전 동일/실제 서비스 완료 판정은 하지 않는다. 아래 대기를 남긴 상태로 이번 허용 범위의 G18 로컬 커밋을 진행한다.
- 실제5173 캡처: `node /tmp/onehandsales-g18-g27/G18/capture.mjs`. 9개 캡처, API/외부/요청실패/console오류0. 중간 실패 로그 `capture.log`(이동 결함의30초 대기), 수정 후 `capture-fix.log`, `capture-final.log`, `capture-ready.log` 보존.
- 네트워크 fixture는 request/response/requestfailed/console을 관찰한다. 차단·navigation mock 없음. E2E 직접 내부 URL 일부는 메모리 세션을 유지하는 실제 history.pushState+popstate로 진입했고, 새 문서 URL/새로고침은 별도로 로그인·초기화 경계를 검사한다.

## 시각 비교와 임시 자료

모든 캡처/로그는 `/tmp/onehandsales-g18-g27/G18/` 임시 보관이다. 저장소에 `_evidence`·RESULTS/evidence를 생성하지 않았다.

- 원본: 위 로컬 PNG13개. MCP 메타데이터1440×900, 로컬2880×1800. 원본 CSS viewport/DPR은 미확인이므로 PNG를1440×900으로 정규화.
- 구현: Chromium, viewport1440×900, DPR1, scroll0. `captures/08-empty.png`, `09-filled.png`, `10-overview.png`, `11-tasks.png`, `12-projects.png`, `13-account-menu.png`. 폭320/390/768×600의 `narrow-*.png`도 확인.
- 비교: `comparisons/08-source.png`~`13-source.png`, `comparisons/08-empty-side-by-side.png`~`13-account-menu-side-by-side.png` 원본/구현 병치와 `*-difference.png` 생성·검토. 1차 구현 캡처는 `captures-first-review/`에 보존.
- 치수/폰트/색상/URL/실제 요청은 `capture-report.json`. 화면 내용과 자산/font 준비 이후 촬영했다.
- 구현 폰트 Gellix/Arial fallback은 기존 FE 자산을 사용한 근사다. 원본 폰트 파일 동일성을 확정하지 않는다. 폼500px/입력300×40/CTA300×46, 내부 sidebar200/header70, task board300px열·40pxgap은 정규화 관찰값에 맞춘 추정 CSS 값이다.

## 남은 차이·자료·환경

- 정확한 폰트/weight/아이콘 SVG·브랜드 avatar·미세 줄폭/radius/shadow, 원본 Help floating button과 최소 화면 일부 부가 표시의 차이. 기본색과 구성은 대조했으나 완전 일치 아님.
- 원본의 실제 초대 URL/만료/철회/재사용/2FA/Settings 본문·Partner 전체 권한·모바일/키보드 동작 미수록. 명시한 목 정책을 Bonsai 실제 정책으로 쓰지 않는다.
- Collaborator 작업/프로젝트는 G18 최소 표시. 생성/편집·동적 집계는 G21~G27 연결 전 대기. 원본 미수록 filter/row menu 옵션은 명확한 안내와 닫기·복귀까지만 제공한다.
- 실제 OS IME·보조기술·Firefox/WebKit·실기기는 미실행. Chromium의 합성 composition/키보드/좁은폭 검증을 실제 OS 검증으로 바꾸지 않는다.
- 실제 인증·이메일·권한 서버/초대토큰 보안/DB·운영/출시 검증은 제외. 후속 서버 설계 메모로만 유지한다.

## 5173 확인 순서

1. `/app/settings/team` → Continue as Alex → Team preview controls → Removing 구성.
2. `Open local invitation for jon@example.test` → 다른 계정 안내 → Sign out and continue.
3. Jon Smith/샘플 비밀번호10자 이상 입력 → Accept Invitation → Design Project 개요.
4. Projects/Tasks만 표시되는지, Tasks→Initial Chat 안내→Escape·포커스 복귀, Projects검색→같은 상세를 확인.
5. 주소를 회사/팀/재무 경로로 바꾸면 제한. 허용되지 않은 프로젝트 ID도 unavailable. 직접 새 문서 탐색은 메모리 초기화로 로그인 요구.
6. Logout→Alex 재로그인→Team에서 jon@example.test가 같은 ID의 Joined이고 jon2는 유지되는지 확인.
7. 다른 시나리오는 Invitation preview controls에서 실패/지연/만료를 명시적으로 선택. 마지막에는 Normal 또는 Reset preview로 복원.

### G19 공통 요소 회귀

전역 New→Client 실제 폼, 고객 Query/store provider, 상세의 Clients 메뉴 선택, 공통 abortable delay 추출을 [G19 결과](G19_RESULT.md)에 기록했다. 현재 셸8+초대5+고객3의 개발/빌드16개씩 통과. 기존 자료/시각/환경 대기는 자동 완료하지 않는다.

### G21 원본 연결·현재 회귀

[G21 결과](G21_RESULT.md): 기존 프로젝트 ID를 유지하며 새 생성 프로젝트를 고객별 목록/전체 보드/팀 초대/초대 수락자 목록에 같은 ID로 연결했다. 영향 대상 개발/빌드30개씩 현재 검증했다. G18의 새 프로젝트 접근 연결은 수행, Tasks는 G25~27 후속 연결. 기존 원본/시각/환경 대기 및 위 과거 기록은 유지한다.

### G25 연결·회귀

[G25 결과](G25_RESULT.md)에서 Tasks sidebar/이전pending경로·대시보드Add task를 실제보드/패널로 연결하고 프로젝트Overview/Tasks/TimeTracking과 제한협업자도 같은taskId를 사용한다. G18 과거최소작업/시간snapshot은 현재공통원본으로 대체됐으며 원본시점차이는 기록했다. 개발/빌드26개씩 현재검증, 금액/설정권한은 확장하지 않았다. G26하위작업/G27활동·자료/시각/환경 대기는 유지한다.
