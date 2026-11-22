# G23 — 단계 이동·태그 결과

최신 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증. 완료/보관/삭제 실행 원본·시각 차이·환경 검증 대기. 요청일 2026-11-21 KST, 실행 21~22일. 시작 HEAD `dc36e82a` G22, 기존 변경 없음. 기존 5173 보존, API/Backend/DB 없음.

## R05/R20·원본 근거

[R05 결과](R05_RESULT.md)와 [R20 결과](R20_RESULT.md)에 소비 분석을 먼저 기록했다. G21/G22의 프로젝트·고객·초대 ID, 조회/목 상태를 승계했다. 이전 Goal/R 전체의 자료·환경 대기는 유지한다.

이번 신규 Gummble MCP 3 flow/16 screen과 연결 ANALYSIS 4·5·8절 및 PNG 16개를 직접 확인했다. App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. 카탈로그 Latest/2146은 G18 앱 조회 기록 재사용이며 이번 신규 앱 버전 조회라고 쓰지 않는다. 촬영일·서비스 빌드·원본 CSS viewport/DPR은 미확인이다.

| Flow | 단계·Screen ID |
| --- | --- |
| Updating project status `ac1750e4-906b-47f6-ad41-18c1861d4f71` | 01 sc_adeac0011d87480980cfd58e53e4d751; 02 sc_ca52e796b2db4941927f959822ce3ff6; 03 sc_7b0550836abf4b1fbb2ef374011e6538; 04 sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef |
| Reordering projects `c5e982aa-007d-4e20-8c8b-1fe3c276acc8` | 01 sc_aac14308ef5b42d39dacf9db53326aea; 02 sc_616919a626c34dc588a29b736eab8ef0; 03 sc_e98507c9007c4f0cb127e058f7130ae4 |
| Adding a tag `3aa597f9-f613-46dd-bd8c-45686e423865` | 01 sc_21c57bdee8d94269af945440ba1c1c84; 02 sc_ce68515567e24d2993b3728912380683; 03 sc_8252c0a8db354aafa8406aba00fb74bc; 04 sc_4b81e45531a346209fcc2feecc874ae2; 05 sc_a9c50a58018942258a29b0015cea48b9; 06 sc_8cf03c06713d48c98a2971716209c36b; 07 sc_81a1fcc323794cba8bcb2b5e4bb7eeb8; 08 sc_aac14308ef5b42d39dacf9db53326aea; 09 sc_3ade80505ba3458cb239c839815b3750 |

관찰: New Lead→5개 단계 메뉴→Proposal Sent에서 문서 없음/금액0 유지. 04의 New Lead+액션 메뉴는 별도 snapshot이며 되돌림 조작 근거가 아니다. 보드 Consulting/Sample 카드의 In Progress→Contract Signed 이동과 양쪽 건수 변화, 중간 떠 있는 카드가 보인다. Tags는 빈 연결→Add Tag→선택/생성→Sample/Edit/성공 안내→카드 반영이며 Save 버튼 없이 모달 닫기 전에 저장된다. 완료/보관/삭제·Preview as Client/Collaborator는 메뉴만 관찰됐다.

## 구현·목 정책·상태 수명

- `/app/projects` 보드와 `/app/projects/:id` 상세에 단계 선택, 실제 HTML 드래그, 키보드 Move 폼, 카드 Tags 모달을 연결했다. 같은 ProjectStore/Project.id의 stage·순서·tagIds를 보드/표/상세에서 사용한다. 별도 모델 `project-edits`, 요청 hook, 단계/이동/태그 컴포넌트로 책임을 나눴다.
- 이동은 저장 성공 때 stage와 배열 순서를 원자 변경한다. 실패·취소는 이전 배치/건수를 유지하며 Retry/Cancel을 제공한다. beforeId/마지막 위치로 동일 열 정렬도 가능하다. 실제 문서·서명·결제·발송·허위 활동은 생성하지 않는다.
- 빠른 새 단계/드롭 의도는 이전 지연을 취소한다. 이미 저장됐지만 query 재조회가 늦은 경우 새 명시적 이동만 동기 원본 revision을 사용한다. 일반 편집 초안은 revision 검증을 유지한다. scope/세션/workspace/Reset/이탈 뒤 늦은 응답은 폐기한다. 동기 읽기도 초대 접근 범위를 지킨다.
- 태그 정의 `{id,name,color,revision}`와 프로젝트 tagIds를 분리했다. 공백 정리·대소문자 무시 동일 이름은 기존 정의 재사용, 신규 생성+연결은 원자 저장이다. 1~60자 한도·Edit의 Rename/Remove/+Add Tag는 명시한 목 가정이다. 이름 수정은 같은 workspace의 모든 연결에 전파하고, 연결 해제는 다른 프로젝트와 정의를 보존한다. 충돌/오래된 초안은 오류·입력 유지. 전역 태그 삭제/색 편집은 근거 없어 추가하지 않았다.
- 태그는 성공 즉시 저장한다. 모달 닫기는 미제출 초안/진행 중 요청만 취소하며 이미 저장한 값은 유지한다. 메뉴 Escape/바깥 클릭/키보드 이동·닫은 뒤 초점 복귀, 입력 조합 보호를 적용했다.
- URL 조회 조건/스크롤 복원은 G22 정책을 유지한다. 저장 데이터는 탭 메모리: 뒤로/앞으로·재진입/동일 탭 로그아웃 후 복귀에서 유지, 새로고침/새 탭/Reset은 seed와 인증 초기화. 실제 영속화/서버 정책이 아니다.
- 완료/보관/삭제·열 설정 실행은 원본 결과 미수록으로 기존 명시적 미제공 안내/복귀를 유지한다. 해당 기능 완료로 표시하지 않는다. R05/G24에서 상세 자료와 함께 추가 배정 검토하며 예산·원가·수익성은 별도 후속 범위다. 계약/메일/포털 실제 영향은 서버 메모다.

## 1차 검토·수정·2차 검토

1차 코드/상태 검토와 개발 브라우저 11개에서 9개 통과/2개 실패했다.

1. 느린 단계 저장 중 다음 메뉴를 열면 저장 안내가 메뉴 위를 가려 다음 클릭이 늦어졌다. 첫 저장 뒤 지연 query의 오래된 revision이 다음 저장을 거부했다. 메뉴가 열렸을 때 안내를 숨기고 새 이동 의도는 접근 검증된 최신 원본 revision으로 시작하도록 수정했다. 이전 요청 취소와 마지막 선택·실패 재시도·취소를 실제 브라우저와 저장소 회귀로 검증했다.
2. Tags 성공 안내의 fixed 위치가 transform이 있는 공통 Dialog를 기준으로 잡혀 Rename을 가렸다. 해당 모달만 transform 없는 중앙 배치로 변경하고 viewport 기준 안내/비조작 영역 pointer-events를 분리했다. 새로운 편집 시작 때 이전 성공 알림을 지운다. 공통 폭 변수로 400px을 적용하고 모달 태그 색·입력 폭·안내 높이·메뉴 radius/shadow와 보드 오른쪽 여백을 원본 비교 후 보정했다.

2차 빌드에서 10/11로 좁은 화면 메뉴 열기 실패가 추가 발견됐다. 열기 전에 발생한 지연 scroll 이벤트까지 메뉴를 닫는 원인이었다. 메뉴 초점 이동은 preventScroll로 처리하고 실제 트리거 위치가 달라질 때만 닫도록 수정했다. 메뉴 내부 스크롤은 유지한다. 초기 개발11/11·빌드10/11과 수정 후 개발/빌드11/11, 마지막 보드 여백 보정 후 개발/빌드11/11을 각각 구분한다.

2차: 공유 태그 rename/unlink의 다른 프로젝트 보존, stale definition/project revision, 취소/늦은 응답, 초대 scope, 보드 양쪽 건수/동일 열 순서, 실제 navigation/뒤로 복귀, G21 생성·초대 연결과 G22 검색/필터/표/스크롤 회귀를 재검토했다. 알려진 수정 가능 결함은 수정 후 다시 검증했으며 원본 미수록과 환경 대기는 분리했다.

## 현재 실행 검증

FE/user-web, Node 24.18.0 / pnpm 8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, `corepack pnpm typecheck`, `lint`, `test`, `build`. 최종 타입/lint/build 통과, 단위 19파일 74/74. 기존 bundle chunk 크기 경고 유지.

- 최초 단위 `unit-first.log`: 66/73, 기존 여러 기능 7개 5초 timeout, 실제 총 경과 약972초. 실행 환경 지연 정황이며 원인은 확정하지 않았다. 검사 중에만 `caffeinate -i`로 유휴 잠자기를 막은 `unit-second.log`는73/73, 추가 회귀를 포함한 `unit-final.log`는74/74(약10초). 제한 시간을 늘리지 않았고 최초 실패를 최종 통과에 합치지 않는다.
- 브라우저 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G23/<run>.json caffeinate -i corepack pnpm exec playwright test tests/e2e/project-creation.spec.ts tests/e2e/project-views.spec.ts tests/e2e/project-stage-tags.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G23/<run>`; 빌드는 `-c playwright.preview.config.ts`. 두 번째 개발은 G23 4개만 별도 재실행. 개발5175/빌드4175, 캡처5173.
- 드래그·실제 클릭/이중 클릭/키보드, 같은 열 순서, 양쪽 건수, tag 생성 실패/입력 보존/재시도/동명 재사용/이름 전파/연결 해제, 단계 마지막 의도/취소, 직접URL/새로고침/이력·재진입,320폭/긴 한국어/합성IME/메뉴 경계를 확인했다. 실제 OS IME·Safari/Firefox·보조기술은 미실행이다.
- request/response/requestfailed/socket/console을 차단 없이 관찰했다. 실패 요청도 포함하며 정적 자산 GET과 API를 구분한다.
- `dev-first.json`: 9 통과 / 2 실패, 관찰 요청 27616, API/외부 0, 실패 요청 0, console 0.
- `dev-second.json`: 4 통과 / 0 실패, 관찰 요청 9206, API/외부 0, 실패 요청 0, console 0.
- `dev-final.json`: 11 통과 / 0 실패, 관찰 요청 27616, API/외부 0, 실패 요청 0, console 0.
- `build-final.json`: 10 통과 / 1 실패, 관찰 요청 166, API/외부 0, 실패 요청 0, console 0.
- `dev-third.json`: 11 통과 / 0 실패, 관찰 요청 27616, API/외부 0, 실패 요청 0, console 0.
- `build-second.json`: 11 통과 / 0 실패, 관찰 요청 178, API/외부 0, 실패 요청 0, console 0.
- `dev-css.json`: 11 통과 / 0 실패, 관찰 요청 27616, API/외부 0, 실패 요청 0, console 0.
- `build-css.json`: 11 통과 / 0 실패, 관찰 요청 178, API/외부 0, 실패 요청 0, console 0.
- 최종 캡처18개도 API/외부·실패 요청·console 오류0. 장애 시나리오는 검사별 정상으로 복원했고 일반 미리보기 기본값은 normal이다.

## 원본 비교·임시 경로·잔여

원본: `bonsai_analysis/flows/Project detail/Updating project status/screens`, `Projects/Reordering projects/screens`, `Projects/Adding a tag/screens`. 2880×1800을 MCP 표시1440×900에 맞춰 정규화했으며 원본 viewport/DPR 단정은 하지 않았다.

모든 임시 자료: `/tmp/onehandsales-g18-g27/G23/`의 `mcp-sources.json`, `source/`, `captures/`, `comparisons/*-side-by-side.png`/`*-diff.png`/`*-review.png`, `capture.mjs`, `capture-report.json`, 각 실행 JSON/log. 원본16상태와 구현16상태 비교, 추가320×600 모달/단계 메뉴2개. 보드 오른쪽60px 여백 누락을 보정하고 원본 관찰 열에 맞춰580px을 사용했다. 실제 scrollLeft/clientWidth/scrollWidth는 capture-report에 기록했다. 최종 비교 이미지를 직접 재검토했다.

캡처 최초 실패는 Add Tag 버튼이 보이는 것만 기다려 연결 해제 저장 전 모달을 닫은 검사 절차 문제였다. 연결 행이 없어질 때까지 기다리도록 고쳤다. 두 번째18개는 성공했고, CSS 보정 뒤 세 번째는 프로그램 스크롤 이벤트가 메뉴를 닫아 실패했다. 초점/스크롤 안정 후 재촬영했으며 같은 현상이 빌드 검사에서도 재현되어 메뉴의 실제 위치 변경 여부를 확인하는 코드 수정과 회귀 검증까지 수행했다. 각 실패 로그/보고서를 보존한다.

완전 일치 아님: 가상 사용자/아바타·생성 시각, 기존 seed3개와 캡처용 신규1개, 상세 세로간격/아이콘/폰트 미세 차이, OS 스크롤바/초점 표시와 하단 preview 도구. 태그01의 원본 생성 성공 알림은 기존 프로젝트를 쓰는 캡처에서 재현하지 않았다. 기존 Sample 정의 보존으로05에는 Sample 선택지가 있고06에는 Review 생성 문구를 사용했다(동일 입력 비교로 주장하지 않음). 07은 기존 Sample 연결 성공이며 신규 생성은 별도 E2E에서 검증했다. 상세04는 명시적으로 New Lead로 다시 선택해 메뉴를 캡처한 것으로 원본 되돌림 근거가 아니다. 네이티브 드래그 ghost는 브라우저 screenshot에 포함되지 않아02의 떠 있는 카드와 차이가 남고 실제 드래그/드롭 결과는 검증했다.

원본 모바일·동일 열 정렬·실패·Edit 정확한 범위·lifecycle 결과/역할별 효과는 자료 대기. 목 정책을 Bonsai 실서비스 정책으로 확정하지 않는다. R05/R20 전체 완료 아님.

## 5173 확인 순서

1. `/app/projects`→Continue as Alex→오른쪽 보드 이동→Consulting을 Contract Signed로 드래그→양쪽 개수/태그 확인→상세의 단계/문서 없음/금액0 확인.
2. 상세 단계 메뉴에서 빠른 연속 선택. Project preview controls slow/write-error로 마지막 의도·Retry/Cancel 확인 후 normal 복원. 뒤로→List View에서 같은 단계 확인.
3. 보드 카드…→Tags→Add Tag→새 이름 생성. 다른 프로젝트에서 같은 태그 선택→Edit/Rename→두 카드·표의 이름 변경 확인. Remove는 해당 프로젝트만 해제한다.
4. Tab으로 Move project→Enter→같은 열 Before 선택/다른 단계 선택→취소와 저장. 메뉴 Escape/모달 닫기·초점 복귀/320폭을 확인한다.
5. 새로고침은 가상 로그인과 seed를 다시 시작한다. 완료/보관/삭제는 미제공 안내로 복귀하며 실행 완료라고 쓰지 않는다.

개별 로컬 커밋 후 G24로 진행한다. push/배포/G28 없음. [연속 결과](G18_G27_RESULT.md).

### G24 회귀 연결

[G24 결과](G24_RESULT.md)에서 상세 공통 헤더를 분리하고 이름/설정을 연결했다. G21~G24 개발/빌드16개씩 현재 검증. G23 메뉴의 늦은 resize 즉시 닫힘을 수정하고 변화 없는 resize 이벤트 회귀를 추가했다. 최초 빌드15/16 및 최종16/16을 구분한다. 단계/태그/보드/목록 ID와 동작 유지, lifecycle 미수록 대기는 G24 조사 후에도 유지한다.

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.
