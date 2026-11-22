# G22 — 보드·표 전환 결과

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증. 원본/시각/환경 대기 유지. 요청일2026-11-21 KST, 실행21~22일. 시작 HEAD `0d48ca26` G21, 기존 변경 없음. 기존5173 보존. API/Backend/DB 없음.

## R20·원본·범위

[선행 G21](G21_RESULT.md)의 동일 프로젝트/고객/초대 원본을 사용한다. R20 보완을 먼저 [R20 결과](R20_RESULT.md)의 G22절에 기록했다. G18~21 원본/환경 대기는 이번에 자동 완료하지 않는다.

App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`. 카탈로그 Latest/2146은 G18 앱 조회 기록 재사용. 이번 신규 MCP2flow7screen,두 ANALYSIS4/5/8절과7PNG 직접 확인. 개별 촬영일/서비스빌드/원본CSS viewport/DPR 미확인. `/tmp/onehandsales-g18-g27/G22/mcp-sources.json`에 신규 응답.

| Flow | 단계/Screen |
| --- | --- |
| Projects `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d` |01 sc_a333622d5e8c45e0b19ff4c249dc0aca;02 sc_da6135eadeff44e49c083b563487ddf5;03 sc_6b648373d5194687be9bd43d9852a4ed;04 sc_b9f4747781a74fe98ded34416d1287f3 |
| Switching to list view `c9dfa93e-36ea-436f-bdef-bc876f4897c5` |01 sc_3ade80505ba3458cb239c839815b3750;02 sc_4ff59456df244ec089728cd491719a8e;03 sc_e4e08776c0b942a18b26dc14fd258318 |

관찰: 보드5개 단계/빈열/개수/가로이동, 열+·말줄임. 표 Title/Client/Tags/Start Date/Due/Paid, Title/Start Date정렬아이콘, Due/Paid는$0.00,날짜가 아님. Sample태그·초록/회색 점. 행 메뉴 View Project/Mark Completed/Archive Project/Delete Project. 메뉴 실행결과·필터폼·열설정·정렬수명은 미수록. Dashboard01은 진입 문맥 확인이며 G72 전체를 재구현하지 않았다.

## 구현/목 정책·수명

- `/app/projects?view=board|list`에 ProjectDirectory/ProjectTable/ProjectFilters/ProjectActionMenu와 조회 모델/스크롤 hook 분리. 같은 ProjectStore/Project.id·clientId·tagIds를 보드/표/상세/고객/G17선택에서 사용한다. 기존 G17 seed3개를 보존하므로 원본목록2개와 다르다.
- Project.startDate는 ISO일/없음, money는 USD dueMinor/paidMinor. seed표시0, 실제청구계산 아님. UTC날짜표시로 시차일이동 방지. 신규프로젝트 날짜 없음은 별도표시하며 G24 설정에서 이어간다.
- 프로젝트 Sample태그 ID는 고객태그/샘플자동결제와 별개. 기존Consulting만seed연결, 신규는빈태그. 편집은G23소유.
- 검색:제목/고객/태그 문자열. 단계/고객필터:초안→Apply,Cancel/Escape폐기. 원본폼미수록이므로 명시한목가정. 필터후건수와같은ID집합,0열도유지. 무결과/빈목록구별.
- URL q/view/stage/client/sort/dir. 검색replace,뷰/정렬/필터push. 직접URL·뒤로/앞으로·상세복귀동일조건. 기본Title오름,시작일오름/내림,동률ID안정정렬/날짜없음항상마지막. 원본정렬정책이라고쓰지않는다.
- 보드가로위치는actor/workspace/revision+검색/필터별탭메모리,최대100항목. 뷰전환/상세복귀유지,세션/revision변경분리. 생성직후카드노출은해당이력한번만,사용자스크롤을재조회로덮지않는다. 새로고침은메모리/인증초기화,URL조건만보존. 개인/공유저장뷰·열너비영속미구현.
- 행View Project는실제상세로이동. 완료/보관/삭제·열관리실행은미수록이라변경하지않는미제공안내/복귀. 실제lifecycle완료로표시하지않고R05/G24추가소비·확장에인계. 보드열+는기존G21생성으로연결.
- 초대협업자는G18배정목록·업무제한유지. 이번표에서고객/재무접근을확장하지않았다. 실제API/삭제/결제/외부연동없음.

## 검토·수정

1차: 모델/저장원본·query상태·날짜/금액·동명ID·필터초안·navigation검토. 생성카드노출이기존저장스크롤에가려질가능성을코드검토에서발견→생성이력별한번노출+나머지복원분리. 필터select중첩label의accessible name에options가포함→명시aria-label. 좁은화면행메뉴가2px화면밖→실제메뉴측정으로화면안배치. 메뉴는portal로가로스크롤표에잘리지않게표시.

시각: 원본6대상상태와구현비교,제목/도구세로위치·표헤더간격·태그너비·메뉴폭/패딩을보정했다. 원본모바일없음,320폭은목접근성검증.

2차: 필터Apply후검사가navigation완료전ID를즉시읽는문제발견(실패스냅샷은정상2행)→실제DOM결과를poll하는검사로정정. 기능navigation은mock하지않았다. 필터/복귀·메뉴외부클릭/Escape/포커스·실제경계·조회실패재시도·G21생성과초대연결재검증. 원본미수록정책/시각/환경과재현결함을구분한다.

## 현재 실행 결과

FE/user-web,Node24.18.0/pnpm8.14.1. `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, `corepack pnpm typecheck`, `lint`, `test`, `build`. 타입/lint/build통과,unit18파일69/69(추가2개:같은ID필터/안정정렬/날짜없음/불변성,URL허용값/통화/UTC일). 기존chunk크기경고유지.

브라우저: `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G22/<run>.json corepack pnpm exec playwright test tests/e2e/project-views.spec.ts tests/e2e/project-creation.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G22/<run>`; 빌드는`-c playwright.preview.config.ts`. 개발5175/빌드4175,캡처5173. 모든최초/재실행로그보존.

- 최초개발3/7. G21두초기진입검사가30초설정대비약952~953초경과timeout을기록:환경지연정황이나원인을확정하지않음. 나머지필터accessible name대기1,메뉴2px경계1은수정. 최초실패를통과로바꾸지않는다.
- 두번째개발6/7,첫빌드6/7:Apply후즉시ID검사의대기누락1. 최종개발7/7·빌드7/7은별도재실행이다.
- 원본6상태+좁은화면3개=9캡처,이미지준비/font/networkidle후촬영. 클릭/키보드/뒤로앞으로/refresh/직접URL/필터Cancel·Apply/실패재시도/긴한국어/합성IME 확인. 실제OS IME·Safari/Firefox·보조기술미실행.
- request/response/requestfailed/socket/console을가로채지않고관찰. 아래합계의실패요청도포함하며정적자산GET을실제API로세지않는다.
- `dev-first.json`: 3통과/4실패, 14687요청, API/외부0,실패요청0,console0.
- `dev-second.json`: 6통과/1실패, 18360요청, API/외부0,실패요청0,console0.
- `build-final.json`: 6통과/1실패, 118요청, API/외부0,실패요청0,console0.
- `dev-final.json`: 7통과/0실패, 18360요청, API/외부0,실패요청0,console0.
- `build-second.json`: 7통과/0실패, 118요청, API/외부0,실패요청0,console0.

## 캡처·잔여·인계

원본:`bonsai_analysis/flows/Projects/screens/`및`Projects/Switching to list view/screens/`. 로컬2880×1800→MCP표시1440×900정규화,원본DPR단정없음. `/tmp/onehandsales-g18-g27/G22/source`, `captures`, `comparisons/*-side-by-side.png`/`*-diff.png`/`*-review.png`, `capture.mjs`/`capture-report.json`. board02/03/04,list01/02/03 비교. Dashboard01은진입문맥만확인,비교구현대상제외. 실제1440×900/320×568,원본가로스크롤수치미확인으로관찰구간을580px이동해맞췄다.

완전일치아님:기존seed3개/가상사용자/헤더·아이콘/폰트미세굵기/태그색·열점색/OS스크롤바표시·가로위치/행추가에따른높이/하단preview도구차이. 원본필터/열관리/행lifecycle실행/정렬영속·모바일은자료대기,추정값을원본값으로확정하지않는다. 보드드래그/태그G23,상세·설정G24,TaskG25~27은순차후속. 개인/공유저장뷰·lifecycle·청구집계서버정책은R20/R05후속배정/메모,Backend확대없음.

## 5173 확인 순서

1. `/app/projects`→Alex→보드오른쪽이동→List View→동일프로젝트/태그·시작일·금액확인→Board복귀시위치유지.
2. 표Title/Start Date정렬→Filters단계/고객선택Cancel·Apply→검색/무결과·Clear→빈열/건수비교.
3. 행…→키보드Home/End/Escape·외부클릭→View Project→뒤로/앞으로. 미수록완료/보관/삭제는안내/복귀만,데이터유지.
4. 320폭에서표가로스크롤→오른쪽메뉴전체확인,필터닫기/포커스. Project preview controls read-error→Retry/empty→normal. 새로고침은가상로그인다시진입후URL조건확인.
5. New Project/고객상세생성→목록/표에같은ID반영. G17초대/G18수락연결은G21회귀에서함께검증.

G22로컬커밋후G23진행. push/배포/G28없음. [전체진행표](G18_G27_RESULT.md).

최종9캡처의 API/외부·요청실패·console오류0. 마지막 표/행 메뉴 원본 비교 보정 후 캡처를 직접 다시 확인했고 비교 PNG도 최종 캡처로 갱신했다. 임시 자료는 지정된 /tmp 경로만 사용했다.

### G23 회귀 연결

[G23 결과](G23_RESULT.md)에서 같은 원본의 단계/순서/태그 편집을 연결하고 메뉴 시각을 보정했다. G21 생성4·G22 조회3·G23 변경4개 개발/빌드 각11개를 현재 검증했다. G22의 최초 실패·원본/시각/환경 대기 기록은 유지한다.
