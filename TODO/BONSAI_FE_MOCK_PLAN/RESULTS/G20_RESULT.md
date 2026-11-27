# G20 — 고객 필드·이미지 실행 결과

최신 연결 검증: [G27](G27_RESULT.md)에서 단위87·전체 개발/빌드143개씩과 G18~G27 단일 사용자 흐름을 확인했다. 프로젝트/작업/하위/댓글 연결 대기는 이 범위에서 해소했다. 아래는 해당 Goal 당시 실행 기록이며 원본·시각·환경 대기는 유지한다.

상태: 관찰 범위 목 구현·두 차례 검토·현재 검증 수행. 원본 중간 상태/이미지 파일·시각 차이·환경 검증 대기는 유지한다. 시작 HEAD `57dd550b`(G19), 기존 사용자 변경 없음. 연속 요청일 2026-11-21 KST 기준 작업이며 실행 로그는 다음 날짜에 걸친 UTC timestamp를 포함한다. 사용자 승인 범위의 G20 단독 로컬 커밋이며 실제 API/업로드/Backend/DB/push/배포는 제외한다.

## 근거와 소비 범위

[R03 보완](R03_RESULT.md), [R20 보완](R20_RESULT.md)을 구현 전에 작성했다. App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 채택 카탈로그 Latest/2146은 G18 앱 조회 재사용. 이번 MCP2흐름/7단계 조회, 두 ANALYSIS 4·5·8절 및 실제 원본 PNG7개 확인. 촬영일·제품 빌드·원본 CSS viewport/DPR은 미확인이다.

| Flow | ID | 단계/Screen ID |
| --- | --- | --- |
| Clients/Adding a client field | 87c1f8ab-d786-4b2c-9861-d75e5813e639 | 01 `sc_cc68ecaccb72426b8573fca9ece52fc9`, 02 `sc_175d01279ca24ead910995ea1cc957d3`, 03 `sc_c231351f09ab4afe865acaf6e68add0f`, 04 `sc_3d631d315dcb40969d26412f158df64c` |
| Clients/Uploading a client image | 44e00e8a-aa9f-41f1-b9bc-682789c80985 | 01 `sc_b1619b6b9fc3405e8ad67fd26f405b62`, 02 `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e`, 03 `sc_7a2bb697a852495e8fd9be9fe6563b0a` |

원본: `bonsai_analysis/flows/{위 Flow}/screens/NN_ScreenID.png`. 메타데이터 `/tmp/onehandsales-g18-g27/G20/mcp-sources.json`. Add New Field 첫 빈 행·3→4표시·Email 이름·Done 저장 행, 이미지 오버레이/X·교체 성공 알림은 관찰했다. 파일 선택/검증/저장/제거 중간 과정·고객 값 입력 UI·삭제 영향은 미수록으로 목 가정을 분리했다. 현재 사이트나 API/실계정은 조회하지 않았다.

## 구현·ID·상태 수명

- `/app/clients?tab=settings`: 정의 추가/수정/삭제 확인. 저장 정의 수와 빈 편집 행 수를 구분한다. 정의 ID는 workspace 소속이며 이름 변경에도 유지한다. 이름1~100자/trim·대소문자 중복 거부는 목 규칙이다.
- `/app/clients/:clientId`: Additional Info에서 고객별 값 편집/Done/Cancel. 정의 ID·고객 ID·각 revision을 별도로 검증한다. Email이라는 필드는 기본 연락처 이메일과 무관하다. 값은 선택 텍스트1000자 한도, 빈 값 허용의 목 가정이다.
- 정의 삭제는 확인 후 모든 고객의 해당 정의 값만 함께 삭제한다. 삭제 ID tombstone/정의·값 revision으로 늦은 저장/이름 변경/재추가가 삭제를 되살리지 못하게 한다. 문서 프리필의 서버 연쇄 영향은 확정하지 않는다.
- 대표 이미지: 선택→로컬 실제 디코딩→미리보기→Save Image, 실패 재시도/다른 선택/취소. PNG/JPEG/WebP≤2MiB는 명시한 로컬 한도이며 실제 업로드는 없다. X→확인 제거 후 이니셜로 복귀한다. 목록/상세의 같은 고객 Blob을 표시하고 Object URL은 교체·취소·이탈 시 해제한다.
- 필드·이미지 저장은 각 속성만 원자적으로 바꾼다. 오래된 이미지 초안으로 다른 값/최신 이미지를 덮지 않는다. G15 회사 로고/G73 포털 이미지와 분리한다. 파일 마지막 선택만 반영하며 취소/이탈·scope/revision/generation 변화 후 응답은 폐기한다.
- 조회/공통 생성/G19 시나리오 구조를 재사용했다. `ClientEdit` 순수 변경·저장소·`useClientAction`/이미지 초안·UI 책임을 분리하고 공통 `useObjectUrl`을 추가했다. 신규 의존성·HTTP adapter 없음.
- owner/허용 일반 member만 고객 변경 가능, G18 초대 협업자 직접 접근은 기존 저장소 제한을 유지한다. 저장 데이터는 같은 탭 재로그인 유지, workspace 격리, 새 문서/새 탭/Reset seed 초기화. 실패는 초안 유지, 취소/이탈은 폐기한다. 정상/빈/읽기 실패/권한 상태는 G19 결과 및 이번 회귀로 유지했다.

## 1차 검토와 수정

코드의 ID/저장 경계·취소/응답·이미지 수명·실제 navigation과 원본 비교를 검토했다. 다음 실행 결과와 검토 판정은 별도다.

1. 최초 환경 명령을 루트에서 실행해 Corepack pnpm12.21.0을 선택했고 요구 pnpm8.14.1과 불일치했다(`typecheck-first.log`). FE/user-web에서 Node24.18.0/pnpm8.14.1로 수정했다.
2. 새 Blob 단위 테스트에 Node Blob 타입을 직접 import해 DOM 타입과 `bytes()` 반환형이 충돌했다(`typecheck-implementation.log`). node 테스트 환경에서 global Blob을 사용하도록 수정했다. 강제 타입 캐스트 없음.
3. 첫 개발 브라우저6개 중4통과/2실패. 필드 흐름은 같은 이름의 h1/h2를 함께 선택한 테스트 locator 오류여서 level1을 명시했다. 이미지 실패 재시도 더블클릭은 앱 결함이었다: 재시도 시작에 오류가 사라져 버튼 위치가 바뀌고 둘째 클릭이 Dialog 배경 닫기가 되어 저장을 취소했다. 성공/취소 때까지 오류 영역을 유지해 버튼 이동을 막았다. 동일 재현 테스트가 수정 후 통과했다.
4. 원본 병치7개를 직접 검토하고 필드 이름16px/행52px·추가 버튼36px·위 간격을 조정했다. 이미지가 있을 때 inline baseline 때문에 상세 헤더가5px 늘어나는 현상을 grid/block 표시로 수정했다. 320폭 필드 캡처는 처음 scroll0이라 편집 행이 보이지 않아 실제 입력이 준비된 위치로 재촬영했다.
5. 최종 비교 파일 생성은 기본 python3의 Pillow 부재로 실패했다. 이미 Pillow가 있는 `/opt/anaconda3/bin/python3`로 재실행해7개를 생성했다. 앱 검사 실패와 구분하며 의존성을 추가하지 않았다.

## 현재 실행한 명령·결과

macOS `FE/user-web`, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, Node24.18.0/pnpm8.14.1. 기존5173 보존, 검사 개발5175/빌드4175. 모든 로그/JSON/캡처는 `/tmp/onehandsales-g18-g27/G20/` **임시 보관**이다.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build`: 최종 `typecheck-final.log`, `lint-final.log`, `unit-final.log`, `build-final.log` 통과. **단위64/64**, 기존 chunk>500kB 경고 유지.
- `PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g18-g27/G20/dev-final.json corepack pnpm exec playwright test tests/e2e/clients.spec.ts tests/e2e/client-fields-images.spec.ts --workers=2 --reporter=list,json --output=/tmp/onehandsales-g18-g27/G20/dev-final`: **6/6**. 빌드는 같은 대상에 `-c playwright.preview.config.ts`, `build-browser-final` 경로로 **6/6**.
- 첫 `dev-first`:4/6. 수정 후 `dev-second`, `build-browser-second`:각6/6. 이후 시각 보정 후 위 최종 실행 각각6/6을 별도 보존한다. 최초 실패를 최초 통과로 합치지 않는다.
- 단위3개 추가: 정의/값/연락처 분리·이름 검증/ID·삭제/tombstone, 독립 속성 저장/오래된 revision, 실패 원자성/형식/abort/workspace 전환. G19 단위도 함께 실행했다.
- G20 E2E3개: 정의/값/다른 고객/rename/delete·오류/취소/재진입, 실제 PNG/SVG/초과/손상 파일 디코딩·재시도/저장/목록·상세/제거/Object URL 해제, 320폭 긴 한글·합성IME·늦은 저장 중 Escape·새로고침. G19 생성/조회/탭/이력3개도 회귀했다. navigation·파일 디코딩·요청을 mock/차단하지 않았다. Object URL wrapper는 실제 함수 호출을 관찰만 한다.
- 최종 개발 요청14514/빌드103, 실제5173 캡처 요청3631. 각 **API·외부0, 요청 실패0, console오류0**. `verification-summary.json`에 최초/재실행을 분리했다.
- `node /tmp/onehandsales-g18-g27/G20/capture.mjs` 최종10PNG, 마지막 Reset 정상값 복원. `/opt/anaconda3/bin/python3 /tmp/onehandsales-g18-g27/G20/compare.py` 정상7개 비교 생성.

## 시각 비교·2차 재검토

원본2880×1800을 MCP1440×900에 정규화하고 구현1440×900/DPR1/scroll0·동일 행/입력/알림 상태로 비교했다. 원본 DPR2라고 단정하지 않는다. G19 공개 폰트를 재사용했으며 원본 파일 동일성은 미확인이다.

- `captures/field-01~04.png`, `image-01~03.png`, `field-narrow.png`, `value-narrow.png`, `image-preview-assumption.png`.
- `comparisons/{field-01~04,image-01~03}-{source,side-by-side,difference}.png`. 첫7병치를 직접 확인했고 수정 후 대표 field-02/image-03 및 좁은 입력을 재확인했다. 수정 전은 `captures-first-review/`, `comparisons-first-review/`에 보존.
- 정규화 추정값: 필드 입력549×40, 행52/편집60, 이미지84×84, overlay12px/17px. 색·테두리·패딩·행 위치를 비교했다. 측정표/브라우저 버전은 `capture-report.json`.
- 2차 코드 검토는 저장 전 최신 scope/ID/revision, 삭제 후 부활 차단, 실패·중복·취소 수명, Blob URL 정리와 Query 소비를 확인했다. 한글 책임 주석 검사16파일 누락0(`comment-review.json`), diff 공백 검사 통과. 현재 범위의 재현 결함은 수정 후 다시 발생하지 않았다. 아래 대기를 남긴 목 구현/검증 커밋 판정이다.

## 남은 차이·자료/환경 대기

- 원본 인물 이미지 파일이 없어 기존 `recorded-company-logo.png`를 시험 파일로 사용했다. 원본 인물과 같은 자산이라고 쓰지 않는다. 원본 JS 이니셜/초기X 의미 미확인: 회사명 이니셜·이미지가 있을 때만 X를 표시하는 목 가정이다.
- 원본 Cancel/확인/실패/값 편집/모바일/hover 동작은 미수록. 임시 중간 상태를 원본 관찰로 취급하지 않는다. 원본 폰트 굵기·일부 아이콘/배지·태그/상단 간격·우측 추가 정보 행/접촉 카드 높이·Help 플로팅 버튼 차이는 남는다. 완전 일치 아님.
- 실제 OS IME·보조기술·Firefox/WebKit·실기기 검증 미수행. Chromium 합성 composition/좁은 폭을 OS 검증으로 표시하지 않는다.
- 필드 타입/실제 삭제/문서 프리필/파일 압축·영속/권한 정책은 후속 서버 메모. R03 연락처·lifecycle, R20 저장 뷰·검색 등 전체 완료 아님. G21 고객 프로젝트 연결은 다음 Goal에서 수행한다.

## 5173 확인 순서

1. `/app/clients?tab=settings` → Continue as Alex → Add New Field → Email → Done. 고객 상세에서 별도 값 입력 후 저장하고 기본 연락처 email이 유지되는지 확인한다.
2. Edit Fields에서 이름 변경 → 같은 고객 값 유지 → Delete 확인/취소 및 실제 삭제. 다른 고객 값과 정의의 경계를 확인한다.
3. 상세 이미지 → Choose image → 로컬 PNG → Cancel/재진입 → 다시 선택·Save. Clients 목록/상세 왕복에서 같은 저장 이미지 확인. X→취소/제거.
4. Client preview controls Write error once → 저장 실패 입력 보존 → 재시도 더블클릭. Slow → 저장 중 Escape → 늦은 값/이미지가 반영되지 않는지 확인한다.
5. 좁은 화면·키보드·뒤로/앞으로 확인 후 Normal/Reset preview. 새로고침은 인증/저장 seed 초기화 정책이다.

### G21 원본 연결·현재 회귀

[G21 결과](G21_RESULT.md): 기존 프로젝트 ID를 유지하며 새 생성 프로젝트를 고객별 목록/전체 보드/팀 초대/초대 수락자 목록에 같은 ID로 연결했다. 영향 대상 개발/빌드30개씩 현재 검증했다. G18의 새 프로젝트 접근 연결은 수행, Tasks는 G25~27 후속 연결. 기존 원본/시각/환경 대기 및 위 과거 기록은 유지한다.

### G27 최종 연결·회귀

[G27 결과](G27_RESULT.md)의 전체 회귀와 단일 연결 시나리오에서 같은 고객/필드/이미지/프로젝트/초대/작업/하위/댓글 ID를 확인했다. G26 활동 높이·스크롤은 G27에서15원본 상태를 재캡처/비교했다. 최초 실패와 당시 수치는 위에 보존한다. 현재 전체 검사143개씩 통과가 미수록 원본/서버 정책·시각 동일성·실제 OS 환경 완료를 뜻하지 않는다.
<a id="g20-r4-recheck"></a>
## G20 R4 재대조·보완 — 2026-11-27 KST

현재 판정: **구현 보완·로컬 검증 수행 / 엄격한 원본 동일성·실제 브라우저·미수록 정책 미완**. 시작 커밋은 G19 `90b36f5d`이며 아래 과거 실행 수치를 이번 검증으로 재사용하지 않는다. 사용자 승인에 따라 G20까지만 진행한다.

### 작업 전·후 네 기준

| 기준 | 검토·보완 범위 |
| --- | --- |
| FRONT_AGENT | G19에서 읽은 규칙과 엔지니어링 체크리스트를 재대조. 한글 책임 주석·UI/hook/store 분리·초안/저장·중복/취소/최신 요청·초점·오류 설명·IME·Object URL 정리를 확인 |
| 명세·선행 | G20과 R03/R20의 필드 정의/값 분리, 빈 편집 행 개수, 이미지 선택/미리보기/저장·실패/취소, 같은 ID 재진입을 확인. R4 관찰3·남은 분석2와 공통12기준 적용 |
| 코드 영향 | 필드 정의/고객별 값/이미지 제어, 고객 page의 이력별 편집 수명, G19 생성 성공 알림 연결. 기존 useClientAction·이미지 decode 취소·store revision/tombstone·공통 Object URL 수명 유지. G01 Dialog·G15 로고·G16 브랜드 및 기존 프로젝트 선택 회귀 포함 |
| 원본 | 위 두 Flow의 MCP7단계 ID/순서/1440×900 메타데이터를 재조회. 로컬7PNG를 전부 직접 열고 ANALYSIS4/5/8절·R4 관찰과 대조. 공식 API/실계정 재조회 아님 |

### 관찰 대응과 남은 차이

| R4 항목 | 원본 단계와 현재 판단 |
| --- | --- |
| F020-O01 | 필드01의3정의 →02의첫 빈 행/4 Fields →03의Email 이름 →04의회색 이름 배경/Edit/Delete. 기존 삽입 순서·짧은 입력/오른쪽 Done·정의 ID/개수를 유지하고 조합·취소/재진입을 보완 |
| F020-O02 | 01 Upgrade Now,02–04의숨김/Tasks 붉은 점은 다른 snapshot. 필드 추가를 구독 변경/업무 알림 생성으로 연결하지 않음. 정확한 원본 셸 상태 재현은 대기 |
| F023-O01 | 이미지01의이니셜/X →02의두 줄 Update Image/밝은 오버레이 →03의인물 그림/동일 X·태그/업데이트 안내. 이니셜에도 외곽 X를 표시하고 hover/focus 색·SVG X·알림 원형 체크를 보완. 생성 알림을 새 업데이트 알림으로 교체 |
| F020-A01/F023-A01 | 필드 타입·중복/삭제 정책, 이미지 hover 원인·원본 파일/crop·제거/실패 단계는 미수록. 완료로 변경하지 않음 |

2880×1800 PNG의 비교용 절반 좌표 기준: 정의 표 좌측260/우측1380, 입력271–820·높이40, 표시 이름 높이32/행52, Done 우측 약1360, 이미지 외곽 약260–345/상단110–195, X 중심 약345/110. 실제 CSS viewport/DPR·원본 font/weight를 확정한 측정은 아니다. 구현의 Cancel은 미수록 취소/터치 접근을 위한 목 제어로 남아 원본 정적 화면과 차이가 있다. 원본 인물 이미지와 JS 이니셜 생성 규칙은 확보하지 못했다. 기존 Gellix/아이콘을 동일 자산으로 인증하지 않는다.

공통12기준: C01 ID/순서/파일/크기 대조, C02–04 셸/표/이니셜/오버레이/알림과 문구·정의/값 대응, C05–08 비교 좌표와 폰트/색/자산의 확인 한계, C09–11 입력/빈 행/실패/취소/저장·재진입, C12 G19 같은 ID/목록·상세·기존 선택 연결을 확인했다. 전수 요소 계수·실제 렌더 픽셀 비교·시각 동일성은 미완이다.

### 발견한 문제와 조치

1. 필드 정의와 값의 조합 중 Escape가 편집을 취소했다. Enter/Escape의 composition ref·native isComposing·229 방어를 동일하게 적용했다.
2. 조합 중 Cancel을 누른 뒤 새 편집에서 저장이 막혔다. 정의/값의 시작·취소에 조합 상태를 초기화했다.
3. 동일 고객 URL의 새 이력에서 이미지 편집·늦은 디코딩이 남았다. 상세/탭의 편집 경계를 location.key·목 시나리오에 연결해 입력·삭제 확인·요청·읽기·안내를 함께 폐기했다. 이미 저장한 고객/정의/값은 유지한다.
4. 이름 편집 종료가 항상 Add New Field로 돌아갔다. 실제 편집하던 행이 렌더된 뒤 해당 Edit로 복귀하도록 수정했다. 값 편집은 예약된 RAF 대신 렌더 완료 시 초점을 복구한다. 오류 메시지는 입력의 aria-describedby로 연결했다.
5. 생성 직후 이미지 저장 시 성공 안내 두 개가 같은 위치에 겹쳤다. DOM에서2개를 재현하고 성공 callback으로 생성 안내를 닫아 최신 업데이트1개만 남겼다.
6. 원본은 이니셜 상태에도 X가 있지만 기존 코드는 사진이 있을 때만 표시했다. X를 유지하되 업로드한 이미지가 없으면 `No image to remove`로 안내하며 삭제 성공/고객 변경을 만들지 않는다. 이 중간 안내와 이미지 삭제 확인은 원본 관찰이 아닌 목 가정이다.

### 검증 과정과 해석

- 최초 DOM6개:4실패/2통과. 조합 Escape, 정의·값 재편집 저장, 동일 이력 이미지 편집 문제가 재현됐다. 지연 저장2개는 최초 대기 시간이 조회 지연까지 포괄하지 못해 즉시 편집 종료·3.3초 후 저장 상태까지 검사하도록 강화했다. 최초2통과만으로 원본 코드의 취소가 정상이라고 결론내리지 않는다.
- 보완 후 G20 DOM6+G19 DOM8+기존 고객 edit store3 **17/17**,28.67초 통과. 이후 생성→필드/값→이미지 실패 재시도/목록/상세/제거·정의 변경/삭제를 연결하고 파일 형식/용량·디코딩 실패/재시도·최신 선택/URL 해제를 추가했다.
- 확장 DOM9개 중1개는 테스트의 `.click()`이 브라우저와 달리 초점을 이동하지 않는 문제였다. 실제 시작 초점을 설정한 뒤 **9/9**,38.58초 통과. 이미지 decode mock의 TypeScript 반환 타입 오류도 테스트 코드에서 수정했다. 제품 결함으로 계산하지 않는다.
- 알림 겹침은 추가10번째 테스트에서 별도 재현했다. 선택 실행1개 실패와 넓게 매칭된4파일18개 중1실패는 수정 전 기록이다. 수정 후 최종 전체 결과를 아래에 기록한다.
- 이미지 테스트는 Node File/Blob과 실제 앱·저장소를 사용하되 `createImageBitmap`/Object URL·native dialog를 대체했다. 실제 이미지 픽셀 디코딩/OS 선택창·파일 업로드·브라우저 렌더 검증이 아니다.
- app/node `tsc --noEmit --incremental false`, 전체 eslint 통과. Vite `write:false` 메모리 빌드1976모듈/3출력,8.90초 통과. 새 임시 파일/캐시/증거/스크린샷/trace/보고서 없음.

### 남은 미확인: 이유와 영향

| 구분 | 이유 | 영향 |
| --- | --- | --- |
| 원본 정보 | 폰트 파일·원본 인물 파일/크롭·JS 이니셜 규칙·촬영 CSS viewport/DPR·미수록 필드/삭제/파일 정책 없음 | 엄격한 Bonsai 동일 재현 완료 아님. 비교 수치·파일 한도·Cancel/확인 화면은 관찰/목 가정을 구분 |
| 실행 환경 | 연결 브라우저 세션·기존 preview/debug 서버 없음. 산출물 제한에 따라 새 브라우저 프로필을 만들지 않음 | 실제 native dialog·OS IME·모바일/터치/확대·스크롤·픽셀·console/network 미실행. 실제 API 요청 수 null/not_observed |
| 작업 범위 | 고객 FE 목 한정 | 실제 업로드/영속 API/DB·문서 프리필/서버 권한·G21 새 구현은 수행하지 않음 |

### 최종 커밋 전 검증

알림 보완을 포함한 최신 전체 **44파일278/278,246.74초** 통과. G20 DOM10·G19 DOM8·고객 생성/편집 store7·기존 프로젝트 store6과 이전 전체 회귀를 포함한다. 최신 app/node 타입·전체 lint·메모리build 통과. 원본4Flow19단계의 ANALYSIS 단계 ID·PNG 순서와 MCP를 기계 대조했고 전부 일치했다. 19PNG 디코딩/2880×1800/해시를 읽기 전용 확인했으며 원본 문서·이미지는 변경하지 않았다. 결과/명세/색인의 추가 링크13개와 JSON/R4 관찰10개·남은 분석5개 배정도 확인했다. 실제 브라우저·엄격한 시각 동일성은 대기이며 테스트 통과로 승격하지 않는다.
