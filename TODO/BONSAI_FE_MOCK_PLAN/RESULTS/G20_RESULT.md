# G20 — 고객 필드·이미지 실행 결과

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
