# G16 — 문서 브랜드 기본값 실행 결과

실행일: **2026-11-21 KST**. 시작 HEAD `b05f9fff`, 시작 작업 트리 clean. `34f2d63f`의 G01~G15 재점검과 `b05f9fff`의 과거 자료 삭제를 보존했다. 커밋·push·배포와 G17 이후 착수 없음.

상태: **관찰 범위 목 구현·두 차례 검토·원본 비교·현재 가능한 실행 검증 수행**. Desk·왕관 옵션·원본 전체 자산·실제 OS 환경은 대기다. G01~G15 및 R01/R02의 기존 대기를 완료 처리하지 않는다.

## 1. 범위·선행 확인

- G16은 별도 R 소비가 없다. 원본 ANALYSIS의 4·5·8절과 화면 01~06을 이번 Goal에서 보완 확인했다. R01/R02 전체 상태는 유지한다.
- G01의 메모리 실행 환경·Dialog·scope 격리, G14 앱 셸·보호 경로, G15의 회사 ID·로고 읽기·설정 저장소를 재사용했다. 기존 폰트/아이콘 동일성·원본 모바일·추가 환경 대기는 G16 관찰 범위 구현을 막지 않는다.
- 새 경로는 `/app/settings/branding`. G15 Account의 Branding 후속 안내 링크를 이 경로로 바꾸고 `SettingsNavigation`을 공유한다. Team·Subscription 등 후속 목적지는 그대로다.
- 적용: AGENT 공통, PM036, UX025, FRONT_AGENT와 구조·상태·목·컴포넌트·접근성·주석·테스트·엔지니어링 검토 기준, **DECISIONS/006** 우선. 과거 실제 로그인/API 절차는 적용하지 않았다. 상위/FE 적용 AGENTS.md는 없고 BE의 지침은 이번 범위 밖이다. 공통 문서에서 참조하는 `AGENT_USAGE_RULES.md`는 없는 상태이며 사용자 지시와 현재 FRONT_AGENT를 기준으로 진행했다.
- Backend·API 계약·HTTP adapter·DB·실제 계정·업로드·발송·결제는 작업하지 않았다. 기존 5173 프로세스를 종료하거나 교체하지 않았다.

## 2. 이번에 직접 확인한 원본

`bonsai_analysis/flows/Settings/Editing branding settings/ANALYSIS.md` 및 `screens/01~06_*.png`를 읽고 원본 PNG 6개를 직접 열었다.

- App: **Bonsai Web**, ID `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`.
- Flow: **Editing branding settings**, ID `79468a76-f7fd-456e-843e-66c2763976a5`.
- 2026-11-21 KST 신규 MCP 조회: `gummble_get_flow_screens(flow_id)` 6단계, `gummble_get_app(slug=bonsai-web, limit=1)`.
- 이번 App 응답의 카탈로그는 **Latest / 2146**, 642 screens. 과거 Latest/2146 기록과 별도로 이번에 재조회했다. Flow 응답 자체에는 별도 버전 필드가 없었다. **촬영일·Bonsai 서비스 빌드·자료 보관일을 2146과 같은 뜻으로 쓰지 않는다.** 촬영일/실제 제품 빌드는 미확인이다.
- MCP 응답 메타데이터: `/tmp/onehandsales-g16/mcp-sources.json`. 현재 공식 사이트나 다른 시기의 UI를 혼합하지 않았다. ANALYSIS에 있던 과거 공식 자료 조사는 이번 신규 웹 조회가 아니다.

| 단계 | Screen ID | 이번 확인 범위 |
| --- | --- | --- |
| 01 | `sc_a2d30da474bc43909f17e726b0559b83` | Settings/Branding, Brand Settings, `spencer.png`, 84×84, No image, Sample Invoice |
| 02 | `sc_d380789677a74dfb98c181aa6f8ea9c0` | 스크롤 아래 Font/Color, White Label 3항목, Show Bonsai branding 선택 |
| 03 | `sc_159f4c9fd4464638b012a2db5441565c` | No image·Abstract·Plant·Desk·Custom Header 메뉴 |
| 04 | `sc_42454ea4d1c44374b940aa52d155a53b` | Abstract 선택과 헤더/로고 미리보기 변화 |
| 05 | `sc_936ae7a98b0c4cb5a0ac7c85438225be` | Plant 선택과 미리보기 변화 |
| 06 | `sc_56fc9c3ddb2b4075b4e6d69efe450718` | Plant 상태의 Save Changes 후 성공 표시 |

**관찰 사실:** “Changes only affect newly created documents.” 안내, 미리보기 전환, 저장 성공 문구, 왕관 아이콘과 회색 Font/Color 표시. 색 입력 표기는 `#22AD01`이다. 선택만으로 저장되거나 실제 문서가 바뀌었다는 근거는 없다.

**미확인:** 다른 로고 크기, Desk 이미지, Custom Header 선택/제한, 폰트 목록, 색 편집, 왕관의 플랜별 권한, 다른 White Label 선택 결과, 실제 저장 필드/서버 호출, 실제 청구서·제안서·계약의 적용 범위. 회색이나 왕관만 보고 실제 비활성/유료 정책을 확정하지 않았다.

**목 가정:** 미확인 옵션을 선택하면 현재 값을 유지하는 안내 Dialog를 열고 닫기/Escape로 복귀한다. 임의 업그레이드 화면·플랜 변경·새 폰트 목록을 만들지 않았다. 이 Dialog는 원본 동작이 아니다.

## 3. 구현과 책임

| 경로/구성 | 책임·구현 |
| --- | --- |
| `src/pages/branding-settings/index.tsx` | Settings 화면 조합, 명시적 저장·전체 취소·실패/재시도·미확인 Dialog |
| `features/document-branding/components/brand-fields.tsx` | 관찰 입력과 미확인 옵션 경계 |
| `header-select.tsx` | 실제 목록, 선택/외부 클릭/Tab/Escape, 화살표/Home/End/Enter, 활성 행 스크롤·포커스 |
| `brand-logo-picker.tsx` | G15 로컬 파일 처리 재사용, 파일명/제거/읽기/취소/재시도 |
| `sample-invoice.tsx` | 편집 중 로고·헤더의 동기 미리보기. Pay Invoice는 시각 샘플이며 결제 동작 없음 |
| `hooks/use-branding-editor.ts` | 저장 기준·초안·진행 요청 분리, AbortController/중복/오래된 응답 처리 |
| `model/branding-types.ts` | 허용 기본값과 snapshot 타입·입력 검증 |
| `features/company-setup/data/create-company-store.ts` | 기존 회사에 브랜드 필드만 원자적 저장, 회사/브랜드 revision 분리, 문서 기본값 복사 |
| `features/company-settings/components/settings-navigation.tsx` | G15/G16의 동일 설정 탐색·선택 표시 |

정적 미리보기에는 가짜 비동기 로딩을 추가하지 않았다. 조회·저장·실제 로컬 이미지 읽기에만 상태와 취소/오류를 둔다. 신규 책임 함수에 한글 `// 기능 : ...` 주석을 적용했다.

### G15 회사·로고와 저장 경계

- 회사 ID는 기존 `company-<workspaceId>`를 유지한다. `studio-a`, `studio-a-two`, `studio-b`별 독립 회사이고 동명 회사도 합치지 않는다. 새 브랜드 seed는 `none`, `small-square`, `font:null`, `#22AD01`, `whiteLabel:bonsai`, `brandingRevision:0`. 회사 로고 초기값은 기존처럼 null이다. 캡처용 spencer 로고를 seed에 넣지 않았다.
- G16 초안의 로고는 G15와 같은 회사 로고를 복사한다. **명시적 Save 성공 때만** 사용자가 바꾼 로고를 회사에 반영한다. 로고를 편집하지 않았으면 최신 회사 로고를 보존한다.
- 브랜드 저장은 주소·국가·통화·공개 여부·slug·회사명·detailsComplete를 바꾸지 않는다. 공개 프로필 비활성과 White Label은 다른 필드다. 인증 revision·역할·구독도 바꾸지 않는다.
- 로고 편집 시 회사 settingsRevision 충돌을 검사한다. 최신 회사 변경이 있으면 전체 브랜드/로고 저장을 거부하고 초안을 남긴다. 로고 미편집 브랜드 저장은 다른 최신 회사 필드와 합친다.
- G15의 `saveSettings`가 조회한 Company 전체를 펼치면 오래된 branding이 들어갈 수 있었다. 저장할 G15 필드를 명시해 새 브랜드 값이 덮이지 않게 보완했고 단위 회귀로 검증했다.
- 소유자만 편집, 멤버 조회 전용은 기존 목 역할을 이용한 **목 정책**이며 Bonsai 실제 플랜/권한 확정이 아니다.

### 상태 수명

| 동작 | 초안/저장값 정책 |
| --- | --- |
| 진입·재진입 | 같은 회사의 저장값을 읽고 새 초안을 만든다 |
| 헤더·로고 편집 | 초안과 Sample Invoice만 변경. 이전 저장 요청/성공 표시 취소 |
| Save 성공 | 저장 기본값과 명시적 로고 변경 확정, 새 baseline 채택 |
| 저장 실패 | 입력·선택 유지, 같은 Save로 재시도. 일회 실패 시나리오 사용 |
| Cancel save | 진행 요청만 취소, 편집 초안 유지 |
| Discard changes | 파일 읽기 포함 초안 폐기, 저장된 회사 재조회 |
| 중복 저장·새 선택 | ref와 revision으로 중복 확정 방지. 새 선택은 이전 요청을 취소 |
| 페이지 이탈·뒤로/앞으로 | 이탈 요청/초안 폐기. 재진입 시 저장값 조회 |
| workspace·계정 전환·로그아웃 | 편집/요청 격리, 이전 응답은 반영 불가. 같은 탭의 저장 회사는 유지 |
| 새로고침·새 탭·Reset preview | 기존 메모리 정책대로 초기 회사/브랜드·가상 인증 복원 |

파일은 PNG/JPEG/WebP, 2MB 이하의 G15 로컬 검증을 재사용한다. 제한은 원본 정책이 아닌 목 가정이다. 실제 decode와 blob URL을 사용하고 교체·제거·취소·이탈 시 해제한다. 늦은 읽기는 선택을 덮지 않는다. 저장 중 새 파일 읽기는 이전 저장을 취소하고 읽기 중 Save를 막는다. 외부 업로드는 없다.

### 새 문서와 기존 문서

`snapshotDocumentBranding(scope)`는 **저장된** 회사 브랜드/로고를 독립 복사한다. 단위 테스트의 최소 invoice/proposal/contract fixture에서 생성 시 복사한 값이 이후 기본값 변경으로 변하지 않고, 미저장 초안이 유입되지 않으며 복사본 수정도 저장소에 영향을 주지 않음을 확인했다.

이것은 실제 작성 화면 검증이 아니다. 제안서 G36/G37, 계약 G40~G42, 청구서 G55 이후 생성/편집 연결은 후속 대기다. G07 공개 생성기에 연결하지 않았고 문서 목록·발송·결제·서명 화면을 새로 만들지 않았다.

## 4. 시각 비교·자산

- 원본 2880×1800 PNG를 1440×900 비교 캔버스로 정규화했다. **원본의 CSS viewport/DPR을 1440/DPR2로 확정한 것이 아니다.** 실제 캡처는 Chromium, viewport 1440×900, DPR1이다.
- 01/06은 scrollY0. 02~05는 현재 `.brand-columns` 상단이 y49가 되도록 scrollY339에 맞췄다. 원본의 실제 scrollY는 미확인이고 시각 기준점을 맞춘 것이다.
- 원본 로고를 선택한 상태·No image/Abstract/Plant·메뉴 열림·저장 성공에 맞춰 캡처했다. 원본 6상태 외 320/390/768/1024/1920 폭과 320 미리보기도 캡처했다.
- 정규화 원본을 기준으로 panel x260/y235/w1120, 입력 열 약384, preview 약616, gap56, logo84, 이미지 높이150, 제목/본문/입력 글자 크기 등을 추정하고 실제 비교로 여백·미리보기 시작점·라디오·버튼을 보정했다. 정확한 디자인 토큰 측정치는 아니다.
- 내부 폰트는 원본 파일이 확보되지 않아 기존 G14/G15의 로컬 Gellix를 재사용한다. 폰트 종류·행간·자간·아이콘은 원본 동일성이 확정되지 않았다. 입력 문자/레이블/배경/테두리/강조색과 글줄·카드 크기·배치를 직접 대조했다.
- 원본 화면에서 읽을 수 있는 헤더 일부를 추출해 로컬 자산으로 썼다. Abstract는 974×214 crop을 cover 표시해 구도가 다르다. Plant는 528×300 왼쪽 식물 crop과 추정 평면 배경색을 결합했다. 전체 원본 자산 복원이 아니다. provenance: `FE/user-web/public/bonsai-branding/README.md`.
- `tests/fixtures/recorded-branding-logo.png`는 01 PNG의 깨끗한 로고 부분 crop이다. 테스트/비교 입력용이며 사용자 계정 파일을 요청하지 않았다.
- **잔여 차이:** Abstract 구도, Plant 오른쪽 배경, 폰트/왕관·사이드바 아이콘, 원본 앱 셸과 기존 G14의 Upgrade Now/아바타/접기 표시, 토스트 폭·아이콘·문자폭, 반응형 원본 미수록. Discard/Cancel/오류·미확인 Dialog는 요청한 취소·실패 확인을 위한 명시적 목 추가다. 시각 비교 수행을 완전 일치로 기록하지 않는다.

### 이번 산출 경로

사용자 지시에 따라 **`_evidence`를 만들지 않았고 삭제된 `RESULTS/evidence`를 복원하지 않았다.** 이번 진단 자료는 모두 `/tmp/onehandsales-g16`에 있다. `/tmp` 자료는 임시 보관이며 정리/재부팅으로 사라질 수 있다. 재생성 스크립트와 결과 문서·소스 자산은 저장소에 둔다.

- 원본: `bonsai_analysis/flows/Settings/Editing branding settings/screens/01~06_*.png`.
- 현재: `/tmp/onehandsales-g16/captures/01-none-top.png`, `02-none-lower.png`, `03-header-menu.png`, `04-abstract.png`, `05-plant.png`, `06-saved-plant.png`; 폭별 캡처도 같은 폴더.
- 비교: `/tmp/onehandsales-g16/comparisons/<같은 이름>-pair.png`, `*-diff.png`, `visual-comparison.json`.
- 실제 viewport/scroll/요소 경계·요청 관찰: `/tmp/onehandsales-g16/captures/browser-captures.json`.
- 재생성: `FE/user-web/scripts/capture-branding.mjs`, `scripts/compare-branding.py`. 픽셀 차이 수치는 단순 RGB 차이이며 UX 합격률/동일성 비율로 쓰지 않는다.
- 첫 캡처/첫 실패 자료도 `/tmp/onehandsales-g16/captures-first`, `dev-target-run1-files`에 따로 보존한다. 삭제된 과거 자료를 이번 확인 근거로 취급하지 않았다.

## 5. 두 차례 검토와 수정

### 1차 검토

1. 같은 회사에 새 브랜드 필드가 추가되면 G15의 전체 객체 저장이 오래된 branding을 덮을 수 있음 → 저장 필드 제한, 브랜드/회사 revision 경계와 단위 회귀 추가.
2. 새 파일·헤더를 선택하는 중 이전 Save가 성공하거나 이탈 후 반영될 수 있는 경계 → 읽기/저장 AbortController·ref guard·scope 검사·초안 소유권을 구현하고 실패/취소/전환 회귀로 검증.
3. 전체 Discard 중 이미지 읽기 busy가 남는 경계 → 파일 편집기 수명 종료 시 busy 해제, 재조회 후 Save 가능 확인.
4. 최초 원본 비교의 패널/입력 여백·미리보기 제목·라디오·로고 crop 차이 → 보정 후 같은 상태 재캡처.
5. 확대/짧은 목록에서 키보드 마지막 옵션이 가려질 수 있음 → 활성 옵션 nearest 스크롤, 5개 폭에서 마지막 행 실제 viewport 포함 확인 추가.
6. 2차 원본 비교에서 메뉴 펼침 화살표·화이트라벨 행 간격·샘플 Pay Invoice 폭 차이 → G16 CSS만 보정하고 개발/빌드 대상6개씩을 재검증했다. 비교 캡처6쌍을 재생성하고 메뉴·샘플 버튼·라디오의 최종 비교를 직접 확인. 공통 G15 CSS/동작은 이 마지막 보정에서 바꾸지 않았다.

### 2차 재검토

저장 필드·권한·실패 재시도·중복/늦은 응답·파일 URL 해제·미확인 옵션의 무변경·G15 공유 상태·문서 복사 불변과 실제 링크를 다시 검토했다. 원본과 구현 6쌍을 대조하고 원본 자산 없는 구간 및 공통 G14 시각 차이를 분리했다. 테스트 실행 결과는 아래와 구분해 기록한다.

## 6. 실제 실행과 실패 이력

Node **24.18.0**, pnpm **8.14.1**, `FE/user-web`에서 실행. shell prefix는 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`. 요구 버전/명령은 현재 package.json을 확인했다.

| 명령/단계 | 이번 실행 결과 |
| --- | --- |
| `corepack pnpm typecheck` | 새 단위 테스트 scope 타입 추론 오류 1회 → PreviewScope 명시 후 통과. 오류 로그 보존 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | 12 files, **47/47 통과** (기존42+G16 상태 검증5) |
| `corepack pnpm build` | 통과. 기존 큰 chunk/Browserslist 경고는 유지, 의존성 변경 없음 |
| G16 개발 브라우저 첫 대상 실행 | **5 통과/1 시간초과**. `getByLabel("Workspace", exact:true)`가 실제 select 접근 이름을 찾지 못한 테스트 선택자 오류. 제품 결함이나 전환 검증 통과로 처리하지 않음 |
| 선택자 수정 후 G16 개발 대상 재실행 | **6/6 통과**. 실제 combobox role/name으로 조회 |
| 전체 개발 Chromium (`5175`) | **96/96 통과**, 497.1초. 이 전체 실행에는 실패/재시도 없음 |
| 전체 빌드 Chromium (`4175`) | **96/96 통과**, 334.0초. 이 전체 실행에는 실패/재시도 없음 |
| 마지막 G16 전용 CSS 보정 후 | lint/build 재실행 통과, 개발 G16 **6/6**(52.0초), 빌드 G16 **6/6**(40.3초). 앞선 전체96 결과와 구분 |
| 비교 캡처 | 첫 실행 종료 Reset 검사의 같은 label 선택자 오류 → role/name 수정, 이후 성공. 첫 이미지/로그 별도 보존 |

루트에서 잘못 실행했던 초기 Playwright/캡처 명령은 각각 패키지/스크립트를 찾지 못했다. `FE/user-web`으로 cwd를 수정했다. 실제 테스트가 실행된 실패와 설정 실패를 합치지 않는다. 최종 타입 통과 이전의 새 테스트 타입 실패도 삭제하지 않았다.

실제 명령:

```sh
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g16/dev-target-run2.json corepack pnpm exec playwright test tests/e2e/branding-settings.spec.ts --workers=1 --reporter=line,json
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g16/development-all.json corepack pnpm exec playwright test --workers=1 --reporter=line,json
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g16/production-all.json corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=1 --reporter=line,json
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g16/development-g16-final.json corepack pnpm exec playwright test tests/e2e/branding-settings.spec.ts --workers=1 --reporter=line,json
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g16/production-g16-final.json corepack pnpm exec playwright test -c playwright.preview.config.ts tests/e2e/branding-settings.spec.ts --workers=1 --reporter=line,json
node scripts/capture-branding.mjs
/tmp/onehand-visual-venv/bin/python scripts/compare-branding.py
```

명령 stdout/stderr는 `/tmp/onehandsales-g16/*-final.log`, `dev-target-run1.log/.json`, `dev-target-run2.log/.json`, `development-all.log/.json`, `production-all.log/.json`, `development-g16-final.log/.json`, `production-g16-final.log/.json`, `build-visual-final.log`, `capture-*.log`, `compare-final.log`에 있다. unit 가짜 시계 검증과 실제 Chromium navigation 검증을 구분한다.

브라우저 6개 G16 시나리오는 실제 login→Account→Branding, header/keyboard, 저장/실패/재시도/취소, 뒤로/앞으로/새로고침, workspace/로그아웃/Reset, 파일 오류/읽기/제거/URL 해제, 좁은 화면/긴 한글/합성 composition을 포함한다. navigation mock·네트워크 차단은 사용하지 않았다. 제목/입력/버튼/미리보기의 실제 경계를 검사했고 document 가로 스크롤만으로 합격시키지 않았다.

### 네트워크·console 실제 관찰

기존 자동 network fixture가 context의 request/response/requestfailed/pageerror/console 및 HMR socket을 관찰했다. 요청 가로채기/차단 없이 실패한 요청도 집계하며, 단순히 성공한 API만 세지 않았다. 여기의 총요청 수는 문서·스크립트·로컬 폰트/이미지 등 정적 요청을 포함한다.

| 실행 | 총 요청 | HMR socket | 실제 API/외부 | 요청 실패/HTTP 오류 | console/page 오류 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 전체 개발96 | 351,586 | 198 | 0 | 0 | 0 |
| 전체 빌드96 | 5,798 | 0 | 0 | 0 | 0 |
| 최종 G16 개발6 | 12,343 | 7 | 0 | 0 | 0 |
| 최종 G16 빌드6 | 111 | 0 | 0 | 0 | 0 |

첫 대상 실패 실행도 network attachment 6개에서 API/외부·실패·console0이었지만 기능 검증 통과로 합치지 않았다. 5173 별도 비교 캡처는 Chromium **148.0.7778.96**, 요청1,768·위반0·오류0. 6 원본 대응+폭별5개 상태의 메타데이터와 추가 320 미리보기 이미지까지 총12 PNG다. 요약은 `/tmp/onehandsales-g16/verification-summary.json`에 있다. 위 수치는 실행한 브라우저 시나리오 범위이며 제품 전체/실제 서비스를 검증했다는 뜻이 아니다.

G01~G15 전체 기존90개 회귀를 새6개와 함께 실행했다. G02 가입 중복 이력·G08 목차 복귀·G13 query/hash 및 Pause/새 이동 의도·G15 주소 Discard/국가/통화/저장된 profile URL 등이 현재 변경에서도 통과했다. 과거42/90 결과를 재사용한 기록이 아니다.

**환경 대기:** 실제 macOS 한글 IME 조작·스크린리더/보조기술·Firefox/WebKit·실기기는 이번 자동 Chromium 환경에서 실행하지 않았다. 합성 composition·CSS 24px 확대와 별개다. 원본 모바일 동작도 미수록이다. 관련 환경을 준비한 후 검증이 필요하다.

## 7. 후속 메모·현재 확인 순서

- 화면 근거 대기: Desk/Custom Header 원본 이미지와 클릭 후 화면, 로고 크기 목록, 폰트/색·White Label 옵션, 정확한 내부 폰트/아이콘, 원본 반응형.
- 서버 후속 메모: 실제 저장 필드/플랜/역할·업로드 제한·문서 종류별 적용·기존 문서 변경 정책. 이번 목 정책을 서버 계약으로 확정하지 않는다.
- G01/G14/G15 결과에는 이번 공유 변경/회귀를 추가하며 이전 미완료를 유지한다. R 전체 완료·서비스 출시·문서 발송/결제 완료를 의미하지 않는다.

기존 미리보기 **http://127.0.0.1:5173/** 보존. 다음 순서로 확인할 수 있다.

1. `/app/settings/branding`에 직접 진입 → 가상 `Continue as Alex` → Brand Settings. 또는 Account → Branding 링크로 이동한다.
2. 로컬 PNG/JPEG/WebP를 선택 → No image/Abstract/Plant를 바꾸며 Sample Invoice 확인. Save 전 Account 왕복하면 미저장 초안이 폐기된다.
3. Plant와 로고 선택 → Save Changes → 성공 메시지 → Account에서 같은 로고 확인 → Branding 재진입으로 저장값 확인.
4. 다른 헤더 선택 → Discard changes. Company 목 도구에서 save-error를 선택하고 저장 실패 후 입력 유지/재시도, slow에서 Cancel save/선택 변경/이탈을 확인한다.
5. 헤더 메뉴 화살표·Home/End·Enter·Escape, Desk/Custom Header·Font/Color·White Label 미확인 안내와 복귀를 확인한다.
6. 320px 폭에서 긴 파일명·전체 버튼·Sample Invoice를 스크롤로 확인한다. Company scenario를 normal로 돌리고, 검증용 별도 탭에서는 Reset preview로 기본값을 복원한다.

최종 자동 캡처 세션은 Reset preview 후 guest/normal로 복원했다. 사용자 기존 브라우저의 입력/탭은 건드리지 않았다.

## 8. 기록 정합성 확인

G16 명세·실행 순서표·PLAN-INDEX·계획 README/Goal 색인/FE TODO·User Web README/구조 문서·공통 목/사용자 흐름·FRONT_AGENT 최신 상태를 갱신했다. G01/G14/G15 결과에 공유 변경과 이번 회귀를 추가했다. 기존 R01/R02와 G17 이후 상태/배정은 바꾸지 않았다. 과거 실행의 테스트 수와 삭제된 과거 경로는 과거 기록으로 유지한다.

최종 검증 이후 실행 코드를 더 바꾸지 않았고 문서 정합성·JSON 파싱·diff 공백과 변경 범위를 확인했다. `_evidence`와 삭제된 과거 자료를 새로 생성하지 않았다. 서버 질문·원본 미수록·추가 환경 대기는 위와 같이 남긴다.

### G17 공통 연결·회귀 (2026-11-21)

[G17 결과](G17_RESULT.md): Team 공급자와 실제 보호 route를 추가하고 Invite Team/계정 메뉴 Team/공통 설정 Team을 연결했다. 기존 회사/주소·국가/통화·저장된 공개 주소·브랜드 저장 코드는 유지하며 G13 초대 제안은 자동 Pending으로 바꾸지 않았다. 현재 전체 개발/빌드103개씩에서 기존96개 회귀와 G17 7개를 실행했다. 마지막 G17 전용 시각 보정 후 대상7개씩 추가 통과. 기존 원본·시각·환경·후속 소비 대기를 해소한 기록은 아니다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] 기사 안 설정 이미지는 읽기 전용, Branding settings는 기존 로컬 안내임을 확인했다. 실제 브랜드/포털 편집은 N/A이며 시작하지 않았다. [상세 판정·근거](G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.
