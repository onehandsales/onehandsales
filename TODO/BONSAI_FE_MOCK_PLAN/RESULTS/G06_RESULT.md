# G06 — 공개 템플릿·상세·파일 형식 실행 결과

> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

실행일: 2026-11-21 KST. G05~G15 연속 요청의 G06 소비 범위. 시작 HEAD `70ffefeb`와 앞선 G05 변경을 보존했다. 커밋·push·배포하지 않았다.

상태: **공개 카탈로그·관찰 상세·실파일 다운로드·로컬 인계 구현, 두 차례 검토·현재 가능한 검증 수행**. 미수록 상세 본문·원본 모바일/필터 정책·Office 실제 편집·가입 후 연결은 별도 대기다. 계정 문서 복제나 실제 서비스 완료가 아니다.

## 1. 범위와 경계

| 화면/경로 | 구현 | 근거·제한 |
| --- | --- | --- |
| `/templates`, `/templates/:type` | 유형·업종·검색·24개 페이지, loading/empty/no-match/error/retry, URL 이력 | 유형 전환은 PNG. 업종 AND·검색·페이지·지연/실패는 목 가정 |
| `/quote-template/ecommerce-website` | 단순 헤더·hero·Get template·역사적 수치·목차3·관찰 본문·읽기 전용 미리보기·고정 이메일 Customize·FAQ3 | 미수록 중간 두 본문은 미확인 안내. FAQ는 원본처럼 정적 펼침 |
| `/invoice-template` | hero·정의·G07 CTA·종류3·파일카드6·형식4·업종예시2·관련5·혜택6·Word 비교 | 혜택 하단 일부/Excel 이후·Consulting 중간은 원본 캡처 부족. 신규 실제 업무 기능 없음 |
| 카탈로그의 개별 상세 및 메뉴 미수록 상세 | 동일 공개 ID·제목·관찰/보관 이미지·가입 인계·목록 복귀 | 상세 원문/계정 편집 화면을 임의 생성하지 않음 |
| `/a/independent-contractor-invoice`, `/a/freelance-invoice-template` | 관찰된 소개 메타데이터·공개 선택 | 다른 공개 경로와 같은 계정 문서라고 합치지 않음 |
| `/templates/scopes-of-work` | 미확인 분류 안내와 전체 목록 이동 | 확인되지 않은 목록을 다른 유형으로 대체하지 않음 |
| Google Docs/Sheets | 원본 주소 표시·로컬 Dialog·닫기/Escape/포커스 복귀 | 외부 로그인·복사·서비스 호출 없음 |
| `/signup` 인계 | 공개 템플릿 ID/제목/유형/형식/참조/복귀를 메모리에 고정 | G10–G14에서 가입/온보딩 후 복귀를 연결. 계정 clone은 미구현 |

G01의 Dialog/QueryScope/시나리오, G02 공개 헤더·메뉴·푸터·폰트, G03 경로별 이메일/이력별 snapshot, G04 가격 인계를 유지했다. `public-template`의 데이터·조회 hook·카드·상세·파일 안내·페이지 조립을 분리했다. 업무 API/adapter/Backend/DB는 수정하지 않았다.

## 2. 원본·버전·보완

- [R01 12절](R01_RESULT.md): 이 Goal의 구현 전 보완 분석. R01 전체 완료가 아니다.
- Filtering all templates `89d6f212-12fc-4ad4-b11c-0bbd29708101` 01~05.
- Template detail `4fe6aa73-a216-43cb-87ff-be898ffc869c` 01~05.
- Invoice templates `a0181c28-2521-46d3-a0e6-3ead4851b2f9` 01~11.
- 세 ANALYSIS와 제공 PNG 21장을 직접 보았다. 신규 Gummble 메타데이터/Screen ID는 [mcp-sources.json](evidence/g06/mcp-sources.json). 같은 연속 작업의 [G05 카탈로그 조회](evidence/g05/catalog.json)를 재사용했다. 카탈로그 2146과 촬영 시점·서비스 빌드는 구분한다.
- 보관본: 카탈로그 **2024-01-18**, 견적 상세 **2024-02-24**, Invoice **2024-01-31**. 요청일/실제 보관 URL은 [archive-fetch.json](evidence/g06/archive-fetch.json). 같은 촬영 버전으로 단정하지 않았다.
- 카탈로그 보관 메타데이터 477개를 제목·경로·분류·업종으로 사용했다. 공개 local ID는 경로에서 만든 값이며 서버 template ID가 아니다. sourceImage는 조사 문자열이며 런타임 외부 이미지 요청에 쓰지 않는다. 확보하지 않은 썸네일은 비워 두고 목록 없음과 구별한다.
- 일부 Invoice 카드의 `Task management`는 관찰 표시 문구다. 필터의 실제 분류는 `Invoices`; 비표준 보관 상품 라벨은 억지로 계정 도메인 타입으로 바꾸지 않았다. `Contracts`에서는 확인된 `/contract-template/` 경로도 포함한다.
- 102개 보관 자산/9,767,450바이트 및 SHA256은 [asset-manifest.json](evidence/g06/asset-manifest.json). 추가 hero 장식 crop은 제공 `Invoice templates/03` 정규화 PNG의 `(757,128)-(1253,632)`이며 입력·버튼을 이미지로 대체하지 않았다.
- 원문이 제공 화면에 보이는 부분을 적용했다. 보관본으로 찾은 주소/문서 파일과 원본 PNG의 관찰 문구를 구분했다. 미수록 견적 중간 본문·Invoice 하단 문구를 원본처럼 생성하지 않았다.

## 3. 데이터·상태 수명

- 유형/업종/검색/페이지는 URL. 입력 200ms 지연, IME 조합 종료 전 반영 보류. 유형/업종 변경은 페이지1; 불가능한 페이지는 데이터의 마지막 페이지로 정규화한다. 새로고침 시 URL 필터 유지.
- 목록 조회는 프론트 메모리에서 80ms, slow 1500ms. query key에 검증 revision·scenario·각 조건을 포함하며 AbortSignal로 이전 조회를 폐기한다. read-error는 revision별 한 번 발생하고 재시도 가능. empty와 조건 무결과, 빈 썸네일을 구분한다.
- 목록→상세는 실제 Link와 origin history key. 목차는 현재 상세 이력을 replace해 뒤로가기 한 번에 원래 목록/필터로 돌아간다. 직접 상세 진입은 목록 링크로 복귀한다.
- 이메일은 기존 pathname별 메모리. Get template는 이메일 없는 신규 snapshot; Customize는 현재 이메일을 포함한다. `template` 필드는 start 시 복사해 이후 다른 선택으로 이전 이력을 덮지 않는다. 기존 `selection` 가격 필드는 그대로 보존한다.
- 브라우저 뒤로/앞으로는 이력 ID별 인계를 조회. 명시 Cancel은 기존 정책대로 해당 sourcePath 초안과 인계를 제거하고 returnTo로 이동한다. 직접 `/signup`, 새 문서/새로고침·가상 사용자/revision 초기화에서는 메모리 인계가 사라진다.
- 익명/가상 로그인 모두 여기서는 공개 선택만 인계한다. 선택만으로 account document·workspace·역할·구독을 만들거나 변경하지 않는다. G10/G11/G13/G14에서 해당 의도의 명시적 전달을 확인할 예정이다.
- Google Dialog 선택은 컴포넌트 수명. 닫기/Escape/이탈에서 폐기하고 재진입 시 닫힘. 실제 복사 성공·진행률은 만들지 않았다.

## 4. 실제 파일 수신

- 5개 카드 × Excel/Word/PDF = 15개 실제 로컬 파일. 확장자만 바꾼 가짜 파일이나 생성했다고 꾸민 PDF가 아니다.
- [file-inspection.json](evidence/g06/file-inspection.json): PDF `%PDF-`, Office ZIP 무결성 및 `[Content_Types].xml`, workbook/document XML을 검사했다. Excel 5개에 각15개 formula 태그가 존재한다. 수식 존재와 Excel 실제 계산/재계산 정확성은 다르다.
- 브라우저에서는 15개 `download` 이벤트, 수신 파일명, failure=null, PDF/ZIP signature, 수신 파일과 제공 로컬 원본의 SHA256 일치를 검증한다. 초기 자동 연속 클릭에서 11번째 이벤트가 오지 않은 기록은 보존했다. 초당 과도한 다운로드를 피한 200ms 간격에서는 모두 수신했다. 브라우저 제한을 다운로드 성공 UI로 숨기지 않는다.
- Google 문서의 확인된 복사 주소는 설명 문자열로만 표시한다. Word/Excel/PDF를 받았다고 Google 복사나 앱 템플릿 생성 성공으로 기록하지 않는다.
- Office 앱 실제 열기·편집·수식 계산·플랫폼 호환성·동일 계정 template 대응은 미검증이다.

## 5. 두 차례 검토와 수정

### 1차 검토

- 코드/화면: 원본에 없는 카탈로그 카드 화살표, hero 설명, 본문 굵기·크기, thumbnail/card radius, 잘못된 CTA 상시 고정 노출을 발견했다. 실제 PNG 문구·형태를 적용하고 Customize는 본문 진입 후 표시하도록 보정했다. 전환 임계값450px은 목 가정.
- 초기 자동 검증: typecheck/lint/unit16/build 통과. E2E 첫 실행은 Node JSON import attribute 누락으로 수집하지 못했고 `with { type: "json" }`를 적용했다.
- 수집 후 19개 중16개 통과: 이전 G06 placeholder를 기다리는 G02 테스트, 원본 `Tax intake form`의 대소문자와 다른 G03 기대값, 지나치게 빠른 15개 다운로드에서 실패. [first-review-e2e.json](evidence/g06/first-review-e2e.json)에 남겼다. 실제 화면 준비를 확인하는 기대값으로 갱신했다.

### 수정 및 2차 검토

- 캡처에서 직접 다른 URL로 진입했는데 이전 페이지 중간 스크롤이 적용되는 결함을 재현했다. 원인: 새 문서의 공통 `default` 이력 키. `RouteFrame`의 ScrollRestoration 키를 **pathname+search+history key**로 구분했다. 동일 이력 복귀와 새 경로의 상단 진입을 회귀 테스트한다. G01/G02/G03/G04/G05 흐름 전체에 영향이 있어 전체 dev/build 검증을 수행한다.
- 캡처 도구도 매번 명시한 앵커/상단·viewport·실제 이미지 준비를 확인하도록 수정했다. 앞선 잘못된 위치의 캡처는 최종 증거로 쓰지 않는다.
- 두 번째 대상 실행은18/19: 남은 실패는 h1과 파일 카드 h3가 같은 `Invoice Template` 이름이어서 locator가 두 개를 선택한 테스트 문제였다. level1을 명시했다. 15개 파일 수신과 템플릿 이력/조회/좁은 화면은 이 실행에서 통과했다.
- 2차 코드·시각 검토에서 다운로드 카드984px/문서200×282px, 원본 설명·줄바꿈·초록 링크, 견적 본문20/24px을 보정했다. 파일 안내에 임의 추가한 링크 문구는 제거했다. 화면에서 미수록 원문과 관찰된 내용이 섞이지 않는지도 확인했다.

## 6. 현재 실행 검증

실제 FE 미리보기 **http://127.0.0.1:5173/** 를 보존했다. FE만 실행했다. 검증 명령은 `FE/user-web`에서 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 뒤 실행했다. pnpm8.14.1.

최종 결과: unit15, 전체 dev/build 각38 통과. 이후 G06 시각 보정은 lint/build와 대상 dev/build 각5개로 재검증했다. 같은 계산을 되풀이하는 단순 snapshot 생성 단위 테스트1개는 제거했다.

| 명령/검증 | 결과 |
| --- | --- |
| `corepack pnpm typecheck` | 통과; 마지막 build에도 tsc 포함 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | 15/15 통과 |
| `corepack pnpm build` | 통과; 기존 caniuse 갱신 안내·단일 JS678.24kB chunk 경고 기록 |
| `corepack pnpm exec playwright test --workers=2` | 전체38/38; 시각 보정 후 `tests/e2e/template.spec.ts` 5/5 |
| `corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=2` | 전체38/38; 시각 보정 후 `tests/e2e/template.spec.ts` 5/5 |
| `node scripts/capture-templates.mjs` | 21캡처, 정적/HMR 요청10,067, API/외부0·오류0 |
| `/tmp/onehand-visual-venv/bin/python FE/user-web/scripts/compare-templates.py` (루트) | 18개 원본 비교 생성·검토 |

브라우저 검증은 실제 Chromium navigation과 개발5175/빌드4175 화면이다. 네트워크를 가로채지 않고 모든 요청·소켓·실패·console를 관찰한다. 회귀: 메뉴→G06, G03 CRM→동일 tax-intake 공개 상세, G02 이메일·메뉴·짧은 화면/폭변경, G04 가격 인계, G05 URL 검색·기사 복귀, G01 가상 세션/초기화/Dialog.

## 7. 시각 비교·잔여

[evidence/g06](evidence/g06/)에 실제21캡처(18개 원본 대응+390×600 보완3), `browser-captures.json`의 URL/viewport/DPR/scroll/대상 앵커, `comparisons/*-pair.jpg`, `*-diff.png`, `visual-metrics.json`을 남긴다. 제공 PNG 2880×1800을1440×900으로 정규화했다. 원본 CSS viewport/DPR은 미확인이며 실제 Chromium은1440×900/DPR1. 픽셀 오차 수치는 합격 기준이 아니다.

- 남은 차이: 보관 thumbnail/문서 자산의 일부 문자/색, 헤더·아이콘, 정확한 폰트 측정값, 배경과 세부 간격. 검색·업종 추가 옵션·페이지 영역은 목 가정 때문에 원본과 차이가 있다. 원본 모바일·hover/자동전환·각 미수록 상세는 일치 검증 불가.
- 견적 중간 미수록 본문 때문에 전체 문서 높이/절대 스크롤 위치는 같지 않다. 비교는 해당 관찰 section의 화면상 위치를 맞춘다. 혜택 하단/Excel 이후·Consulting 중간 소개 등 화면 누락도 남긴다.
- native macOS IME, 실제 보조기기/OS 글자 확대, Safari/Firefox·실기기, Office 편집은 실행하지 않았다. 합성 composition은 OS IME 검증이 아니다.
- 가입/로그인/온보딩 후 동일 템플릿 선택 복귀는 G10~G14 의존. 계정 복제/문서 편집·현재 라이선스·서버 ID/권한·실제 read receipt·결제/발송은 후속 서버 메모다. 다른 Goal의 기존 대기를 완료로 올리지 않았다.

## 8. 미리보기 확인 순서

1. `/templates` → Quotes → 검색 `ecommerce` → 상세 → 목차3 → Quotes breadcrumb → 필터/검색/스크롤 복귀 → 앞으로/새로고침.
2. 상세 본문 → 이메일 오류 → `template@example.test` → Customize → Selected public template 확인 → 뒤로 입력 보존 → Cancel 후 입력 초기화.
3. `/invoice-template` → Get Template → 5개 카드의 Excel/Word/PDF 실제 다운로드 → Google Docs/Dialog → Escape와 원래 버튼 포커스.
4. 다른 템플릿에서 Get template → 이전 브라우저 이력의 선택 ID 확인. 직접 `/signup` 또는 새로고침은 인계가 비어 있는지 확인.
5. `/components` → Preview controls에서 read-error/slow/empty 선택 → Public→Templates에서 실패/재시도·검색·빈 상태 확인. 마지막 normal로 복원.
6. 390×600에서 필터·카드·이메일·파일 버튼·모달 실제 경계/키보드를 확인. 실제 가입 후 복귀는 G14 종합 검증에 연결한다.

검증 증거: [전체 dev](evidence/g06/development-full.json), [전체 build](evidence/g06/production-full.json), [최종 G06 dev](evidence/g06/development-final-scope.json), [최종 G06 build](evidence/g06/production-final-scope.json). 모든 실행에서 실제 API/외부 요청0·실패0·console 오류0. 최종 검토는 FAQ 폭·청구서 예시 배치·Word 강조를 추가 보정했고 대상 검증5/5씩 통과했다. 기본 시나리오는 normal이다.

## G07의 공통 회귀 — 2026-11-21

G06→실제 생성기 경로를 연결했다. [G07](G07_RESULT.md) 전체 dev/build42개에서 템플릿5개 시나리오와 파일15개 다운로드를 다시 확인했다. 재시도 뒤 카드 수만 확인하고 이탈하던 테스트의 로컬 이미지 취소5건은 이미지 준비/대기 완료 검사로 수정했다. 최초 실패와 최종 결과는 G07 증거에 보존했다. G06의 미수록·시각·환경 대기는 유지한다.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

18상태 원본 비교 수행과 시각 동일성 대기, 파일 수신/목 가입 복귀와 계정 복제/원본 정책 대기를 분리했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

## G03 연결 범위 회귀 — 2026-11-23~24 KST

[이번 결과](G03_RESULT.md#g03-r4-recheck). CRM12카드 중 첫 Tax intake form 상세→Get template→가입 선택 표시→취소/뒤로 복귀, View all의 별도 카탈로그 목적지를 DOM 검증했다. template snapshot을 보존하고 G06 코드는 변경하지 않았다. 전체 템플릿/다운로드 검증이 아니다. 전체121개는 이번 실행 수치이며 과거 수치와 합산하지 않는다. 이 Goal 전체 재검토/완료를 뜻하지 않는다.

## G05 소비·재검토 기록 — 2026-11-24 KST

- [x] 기사→/templates/contracts 카탈로그→브라우저 뒤로의 DOM 및 기존 양식 ID/가입 선택 회귀. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)에 근거를 기록했다. 전체 단위/DOM143개는 이번 실행 수치이고 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/네트워크·원본/시각 대기와 이 Goal 전체 상태는 유지한다. 이 기록은 G05의 공통 소비 영향 확인이며 이 Goal 전체의 R4 재검토/신규 착수가 아니다.

<a id="g06-r4-recheck"></a>
## G06 기존 구현 재검토·보완 — 2026-11-24 KST

**현재 판정: 부분 완료.** 주요 원본 구성 대조·로컬 동작 보완·단위/DOM 검증은 수행했다. 엄격한 원본 시각 동일성·실제 브라우저·미수록 원본은 대기다. 위 2026-11-21의 완료 체크·수치·캡처·파일 수신 기록은 당시 이력이며 이번 검증으로 대체하거나 합산하지 않는다.

### 1. 범위와 착수 상태

- 주대상: G06 카탈로그 유형/업종/검색/페이지, 관찰 상세·목차·FAQ·Customize, 청구서 소개·형식·가입 선택.
- 직접 연결: G01의 목 시나리오/Reset/Dialog, G02 메뉴/공개 가입, G03 CRM→템플릿, G05 기사→카탈로그, G07 생성기 진입/뒤로, G10/G11 및 필요한 G13/G14의 선택 snapshot/복귀. G04는 공유 공개 provider 소비 회귀만 포함한다.
- 제외: 연결 Goal의 업무 전체, 계정 문서 복제·편집, G32 이후, Backend/API/DB/HTTP adapter, 실제 인증·메일·업로드·결제·Google 복사. G01 전면 교체를 재실행하지 않았다.
- 착수 HEAD `f73a70dc36935b96dfe061276289b0e53b67f4e5`의 clean 상태 확인. 기존 FE `http://127.0.0.1:5173/`, Vite PID30272를 보존했다. Node24.18.0/pnpm8.14.1이며 package 요구 Node>=24<25와 맞는다.
- 파일은 FE 실행 코드·정식 회귀 테스트와 기존 계획 문서만 수정했다. 새 evidence/캡처/비교 이미지/영상/trace/HTML/raw JSON/로그/manifest/임시 파일/임시 스크립트/브라우저 프로필/결과 문서를 만들지 않았다. 원본 ANALYSIS/PNG와 기존 evidence는 변경하지 않았다.
- 연결된 document-control 세션이 없고 기존 CDP9222/9223에 연결할 수 없어 실제 브라우저를 조작하지 않았다. 새 프로필·다운로드 임시 파일을 만드는 Playwright 실행은 이번 산출물 금지 조건에 따라 사용하지 않았다.

### 2. 원본 확인 범위와 버전

아래 21개 PNG를 **이번 작업에서 직접 열어 확인**했다. 각 ANALYSIS 4절 단계·5절 규칙·8절 미확인과 현재 코드를 대조했다. `SOURCE_ANALYSIS_INDEX.json`의 PNG SHA256 21개와 LF 정규화 ANALYSIS SHA256 3개가 모두 일치한다. 상세 해시는 기존 색인에 보존한다.

채택 근거는 저장된 `bonsai-web / Latest / 2146` 카탈로그다. 2146을 제품 빌드나 촬영일로 사용하지 않는다. 원본 PNG는 모두2880×1800이며 MCP 메타데이터1440×900을 실제 CSS viewport/DPR로 단정하지 않는다. 촬영 OS·브라우저·배율·DPR·정확 폰트/자산은 미확인이다. 기존 2024 보관 문서의 catalog/quote/invoice 날짜는 각각의 보관 근거이며 다른 버전 화면을 섞어 시각 정답으로 삼지 않았다.

이번 Gummble `gummble_get_flow_screens_batch`는 F055/F056/F069 세 Flow ID에 `include_images:false`로 호출했다. 3흐름/21Screen ID/순서가 로컬 배정과 일치했고 실패0이었다. **메타데이터 조회이며 새 MCP 이미지를 확인한 것이 아니다.** 응답에2146 버전 필드가 없었으므로 버전 재확정으로 보고하지 않는다.

**F055 — Filtering all templates** · Flow ID `89d6f212-12fc-4ad4-b11c-0bbd29708101` · [ANALYSIS](<../../../bonsai_analysis/flows/Filtering all templates/ANALYSIS.md>)

| 단계 | Screen ID | 직접 확인한 원본 PNG |
| --- | --- | --- |
| 01 | `sc_f15443150bce43e5a44a761e74b0d42a` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/screens/01_sc_f15443150bce43e5a44a761e74b0d42a.png>) |
| 02 | `sc_826656b002c84fcc984a990ae447215b` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/screens/02_sc_826656b002c84fcc984a990ae447215b.png>) |
| 03 | `sc_f8d0d8d84e874ab481ebdbbabb9e74d2` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/screens/03_sc_f8d0d8d84e874ab481ebdbbabb9e74d2.png>) |
| 04 | `sc_9aaceaacba1b49429aa15c0b6c593574` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/screens/04_sc_9aaceaacba1b49429aa15c0b6c593574.png>) |
| 05 | `sc_fc7ec8014b3e45d18c406ff267152a0a` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/screens/05_sc_fc7ec8014b3e45d18c406ff267152a0a.png>) |

**F056 — Filtering all templates/Template detail** · Flow ID `4fe6aa73-a216-43cb-87ff-be898ffc869c` · [ANALYSIS](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/ANALYSIS.md>)

| 단계 | Screen ID | 직접 확인한 원본 PNG |
| --- | --- | --- |
| 01 | `sc_6fe2078a11e04511ade794821209d7b9` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/screens/01_sc_6fe2078a11e04511ade794821209d7b9.png>) |
| 02 | `sc_f0b529d5983e420e9347fbc1fd4f1117` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/screens/02_sc_f0b529d5983e420e9347fbc1fd4f1117.png>) |
| 03 | `sc_7257089466d443e2b0fc855262f2ba7b` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/screens/03_sc_7257089466d443e2b0fc855262f2ba7b.png>) |
| 04 | `sc_dc17b07446c945b281c1f295bba5f569` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/screens/04_sc_dc17b07446c945b281c1f295bba5f569.png>) |
| 05 | `sc_0195208c431944b1bb900b5c48355e90` | [원본](<../../../bonsai_analysis/flows/Filtering all templates/Template detail/screens/05_sc_0195208c431944b1bb900b5c48355e90.png>) |

**F069 — Invoice templates** · Flow ID `a0181c28-2521-46d3-a0e6-3ead4851b2f9` · [ANALYSIS](<../../../bonsai_analysis/flows/Invoice templates/ANALYSIS.md>)

| 단계 | Screen ID | 직접 확인한 원본 PNG |
| --- | --- | --- |
| 01 | `sc_d68dbb7304bb45ac9755138b12ce3141` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/01_sc_d68dbb7304bb45ac9755138b12ce3141.png>) |
| 02 | `sc_eac8d5a2e97d47c496455da557912622` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/02_sc_eac8d5a2e97d47c496455da557912622.png>) |
| 03 | `sc_ef526e3912f44ce29bac28e00edbae28` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/03_sc_ef526e3912f44ce29bac28e00edbae28.png>) |
| 04 | `sc_9cb41f708d1841bc9bb627e9adb69f59` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/04_sc_9cb41f708d1841bc9bb627e9adb69f59.png>) |
| 05 | `sc_fb22ca5fac734f0bb6636d302b61fd2c` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/05_sc_fb22ca5fac734f0bb6636d302b61fd2c.png>) |
| 06 | `sc_c1cf0b18c5da456ba7c29ddc416eab45` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/06_sc_c1cf0b18c5da456ba7c29ddc416eab45.png>) |
| 07 | `sc_0d63bd46b3304072b6f75589361c99b0` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/07_sc_0d63bd46b3304072b6f75589361c99b0.png>) |
| 08 | `sc_89b5c3a2a2be40109d8018d906853f1a` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/08_sc_89b5c3a2a2be40109d8018d906853f1a.png>) |
| 09 | `sc_5902fc89beb849b4acb6be05de2f9f4c` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/09_sc_5902fc89beb849b4acb6be05de2f9f4c.png>) |
| 10 | `sc_a094d29b4d2b453c8c46ee9ccb255d9f` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/10_sc_a094d29b4d2b453c8c46ee9ccb255d9f.png>) |
| 11 | `sc_14cfb12034534421b6d0654f86236e3d` | [원본](<../../../bonsai_analysis/flows/Invoice templates/screens/11_sc_14cfb12034534421b6d0654f86236e3d.png>) |

### 3. 원본 → 분석 → 계획 → 코드 대응

| 범위 | 분석·수용 기준 | 현재 구현과 판정 | 이번 근거·남은 점 |
| --- | --- | --- | --- |
| F05501~05 | ANALYSIS§4/5/8; G06§5 필터/라벨/빈 썸네일 | template-catalog/card·use-template-search; 3열·돌출 썸네일·Task management 표시와 실제 타입 분리 유지 | All/URL/hash/이력/입력 경합 보완·DOM; 순서/개수/복귀 원본 정책·픽셀 대기 |
| F05601~02 | ANALYSIS§4/5; G06§5 상세/가입 | template-detail·use-template-origin·SignupLink | 목차/선택/복귀 보완; 별도 계정 문서 생성은 실행하지 않음 |
| F05603~05 | ANALYSIS§4/8; G06§5 원본 차이 | 평점/구분선·읽기 전용 문서·노출 FAQ3·sticky·No items found | 구분선 복원; 전체 본문/빈 목록 원인/정확 시각 대기 |
| F06901~02 | ANALYSIS§4/5; 공통 메뉴 소비 | 기존 public-header/메뉴 유지 | 기존 실제 router DOM 회귀; hover/포커스/좁은 화면의 실제 브라우저 대기 |
| F06903~04 | ANALYSIS§4/5; 서로 다른 CTA | invoice-template의 앱 가입·다운로드 앵커·생성기 | query/hash 보존·생성기 왕복 DOM; 캡처 사이 자동 성공 없음 |
| F06905~08 | ANALYSIS§4/8; 파일/Google/앱 구분 | invoice-copy·invoice-downloads·로컬 파일15개 | 본문 링크3개 복원;15링크 DOM·15HTTP/파일 구조; 원본 파일 대응·브라우저 수신 대기 |
| F06909~11 | ANALYSIS§4/5/8; 잘못 보이는 라벨 보존 | 관련5카드·장점6·Word Pros/Cons | 라벨/배경 구조 유지; invoicing software 표시+로컬 미확인 안내; 하단3본문·Excel/장식·링크 목적지 대기 |

21단계의 주요 구성·행동을 확인한 것이며 모든 픽셀/요소를 전수 측정한 인증은 아니다. `element_census_complete`·`reproduction_spec_certified`는 false를 유지한다.

### 4. 발견한 문제와 수정

| 문제·원인 | 수정 파일(모두 FE/user-web/src 아래) | 결과 |
| --- | --- | --- |
| 유형 경로에서 All이 원래 유형으로 남고 검색/필터가 hash를 지움 | public-template/hooks/use-template-search.ts | URL을 확정 상태로 사용, All 명시·query/hash/state 보존·잘못된 값/페이지 정규화 |
| 같은 확정 검색어의 뒤로/앞으로 이동에 이전 미확정 입력이 뒤늦게 반영됨 | 같은 hook | location.key·목 revision으로 초안 구분, 예약 취소·composition/초기화 분리 |
| 목차가 query를 지우고 가입 취소 후 목록 대신 중간 이력으로 돌아감 | template-card/detail.tsx, hooks/use-template-origin.ts | 출발 URL/history index/scope 보관, 실제 router delta로 원래 목록 복귀; 수정 키 링크 유지 |
| 가입/로그인 후 상세의 query/hash 소실, article/template 출발 상태 혼동 | public-web의 public-context/provider/public-origin·index, pages/signup·auth-boundary | returnOriginKind 및 전체 URL 인계; 기존 기사 복귀 보존, 다른 선택 snapshot/초안 격리 |
| 알 수 없는 유형을 전체 목록으로 오인 | pages/templates/index.tsx, public-template/index.ts | 기존 미확인 화면 경계 사용; scopes-of-work 경계/없는 상세404 유지 |
| 청구서 본문 링크3개 누락 및 문장 끝 공백 | invoice-template.tsx, invoice-copy.json | Printable/Contractor/Freelancers의 관찰된 목적지를 로컬로 복원; 제목/Get template와 분리 |
| Word Cons의 invoicing software 링크 표시 누락 | invoice-template.tsx, public-template.css | 원본 표시를 복원; 목적지는 미확인 로컬 Dialog로 구분(목 가정), 임의 기능으로 연결하지 않음 |
| 평점 사이 세로 구분선 누락 | public-template.css | 구분선 복원.1×62px/#d8e3df와 좁은 폭600px 이하 숨김은 추정/목 반응형 값이며 원본 확정 수치가 아님 |
| 회귀 근거 부족 | app/router/template-entry.test.tsx | 정식11시나리오 추가; 단순 구현 복제 테스트가 아닌 이력/취소/경합/복귀 검증 |

유지: 기존 카탈로그 객체 ID, 목록/상세 선택 저장소, 카드·FAQ·문서 자산·로컬 파일15개, Google 로컬 Dialog, 원본의 어색한 Task management 라벨, 미수록 상세 경계. 실제 서버 호출 경로는 추가하지 않았다.

### 5. 이번 실행 검증

- 최초 회귀3개는 기존 코드에서3개 모두 실패했다(hash 손실·이전 입력의 뒤로 URL 덮기·목차 query 손실). 수정 후 통과했다.
- 확대11개 중 잘못된 상세 URL을 metadata 화면으로 기대했던 테스트를 실제 router404 기준으로 수정했다. 중간 전체153/154 실패는404 locator 문제였고 최종 대상11/11·전체154/154 통과로 구분한다.
- 최종 전체29파일154/154와 대상11/11. 과거15/38/82/143 등의 수치를 합산하지 않는다.
- 타입 app/node 모두 `--noEmit --incremental false`, lint `--no-cache` 통과. 최종 Vite 메모리build1971모듈·3출력·8.35초 통과. caniuse-lite 갱신 안내는 기존 경고이며 의존성을 변경하지 않았다.
- 실제 navigation 함수를 mock으로 바꾸지 않고 App/router와 history를 jsdom에서 사용했다. native Dialog/layout API만 jsdom 한계에 맞춰 보완했다. 합성 cancel/composition·scrollY·provider remount는 실제 OS Escape/IME·스크롤·새로고침/새 탭 검증이 아니다.

| 정식 회귀 시나리오 | 판정 |
| --- | --- |
| 유형 경로 All·잘못된 type/industry/page·페이지 상한·다른 query/hash 보존 | [x] DOM |
| 동일 검색어의 뒤로/앞으로와 미확정 초안 폐기 | [x] DOM 실제 router/history |
| 목록→상세→목차→가입/로그인 화면→취소→원래 목록 | [x] DOM |
| 조합 중 필터/지우기·확정 검색 | [x] 합성 composition |
| read-error 재시도 입력 보존·empty와 무결과 구분 | [x] DOM |
| slow 조회 취소·Reset normal·늦은 결과 격리 | [x] DOM |
| 직접 상세·잘못된 category·scopes-of-work·404·Reset/remount 출발 만료 | [x] DOM; 실제 reload/new tab 대기 |
| A/B 템플릿 snapshot과 취소 격리 | [x] DOM |
| Customize 이메일 오류·중복 제출·URL/history 이메일 미노출·다른 CRM 초안 보존 | [x] DOM |
| 가상 로그인 이후 동일 선택의 전체 URL 복귀 | [x] DOM; 계정 문서 복제 제외 |
| 청구서 앵커/15파일 링크/Google·미확인 링크 Dialog/본문 상세/생성기/가입 복귀 | [x] DOM; 실제 파일 다운로드 클릭 없음 |

실행한 명령·옵션(작업 디렉터리 FE/user-web; 임시 스크립트 없이 stdin):

```text
node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false
node node_modules/typescript/bin/tsc -p tsconfig.node.json --noEmit --incremental false --pretty false
node node_modules/eslint/bin/eslint.js . --no-cache
node --input-type=module -  # vitest/node startVitest('test', [], options, viteOptions)
node --input-type=module -  # 대상은 ['src/app/router/template-entry.test.tsx']
node --input-type=module -  # vite.build({configFile:false, ..., build:{write:false,...}})
python -B -                # BytesIO ZIP/XML/PDF 및 urllib 동일 호스트15GET
node -                     # 원본 SHA256/PNG 크기·문서 링크/체크/색인 정합성; stdout
git diff --check
```

Vitest: `config:false,run:true,cache:false,pool:'threads',execArgv:[],maxWorkers:2,environment:'jsdom',include:['src/**/*.test.{ts,tsx}'],setupFiles:['./vitest.setup.ts'],reporters:['default'],coverage:{enabled:false},experimental:{fsModuleCache:false},deps:{optimizer:{client:{enabled:false},ssr:{enabled:false}}}`. Vite 옵션은 `configFile:false`·React plugin·@→src alias·`optimizeDeps:{noDiscovery:true,include:[]},server:{watch:null}`. NODE_DISABLE_COMPILE_CACHE=1/JITI_CACHE=false/JITI_FS_CACHE=false. build는 React/PostCSS(Tailwind/Autoprefixer)·alias를 메모리 구성으로 넘기고 `write:false,emptyOutDir:false,copyPublicDir:false,reportCompressedSize:false,sourcemap:false`로 실행했다. 일반 package test/build 명령의 자동 산출물을 피하되 실제 소스/타입/lint/번들러를 검증했다.

파일 검증은 기존 로컬 파일을 메모리로 읽고 같은 호스트5173 GET 응답과 바이트/SHA256을 대조했다.15개 모두HTTP200·바이트 동일. PDF5개 header/EOF, DOCX5개/XLSX5개 ZIP CRC·XML·주요 문서 entry 통과. Excel은 파일당15개 formula 요소가 있었으며 실제 재계산 결과를 검증한 것은 아니다.

| 기존 파일 ID | Word / Excel / PDF HTTP·바이트·구조 |
| --- | --- |
| invoice-template | [x] 3/3 |
| billing-template | [x] 3/3 |
| basic-invoice-template | [x] 3/3 |
| sample-invoice-template | [x] 3/3 |
| example-invoice-template | [x] 3/3 |

브라우저 다운로드 이벤트/실제 수신 파일/Office 앱 편집·계산·Google 복사/계정 문서 생성은 미실행이다. HTTP 검사는 브라우저 네트워크 관찰이 아니다. **이번 실제 브라우저 API/외부 요청 수·console 오류는 미관찰이며0건이라고 판정하지 않는다.** 요청 차단으로 무호출을 입증하지 않았다.

### 6. 규칙·체크리스트 적용 결과

규칙: AGENT/README, FRONT_AGENT/README 문서 지도, DECISIONS006 우선/005, ARCHITECTURE의 FRONTEND_USER_WEB·STATE_AND_DATA·MOCK_FIRST_DEVELOPMENT·TESTING, CONVENTION의 COMPONENT_DESIGN·WEB_ACCESSIBILITY_AND_LAYOUT·COMMENT_AND_LOGGING·FRONTEND_USER_WEB,003, PM036·UX025를 적용했다. ENGINEERING_REVIEW_CHECKLIST의 항목별 판정은 아래와 같고 공통 템플릿을 전역 완료로 바꾸지 않는다.

| 규칙 범주·항목 | 이번 판정·코드/근거 |
| --- | --- |
| 범위/출처4항목 | [x] G06/소비 경계·관찰/목/미확인·시작/취소/실패·서비스 완료 구분; 본 결과1~5 |
| 구조: page/feature/shared·상태소유·분리근거·앱간 import | [x] search hook/origin hook/표시 컴포넌트/provider 책임; 새 외부 의존/앱간 import 없음 |
| 구조: 새 의존 검토 | N/A; 의존성 변경 없음 |
| 데이터: 로컬 경계·live fallback·가상 진입·목 타입/수명 | [x] 기존 reader/provider 사용, 실제 인증 자동 fallback 없음; URL은 필터, 이메일/선택은 scope 내 메모리 |
| 데이터: 동일 ID 생성/수정/삭제·기존 live 보충 | N/A; 공개 항목 생성/삭제·live 화면 없음. 목록/상세/선택 ID 일치는 [x] DOM |
| 상태: URL/초안/query 소유·query key·취소·중복/실패 | [x] use-template-search 및11회귀; 계정/workspace reset은 기존 전체 store 회귀 포함 |
| 상태: 저장 후 집계/금액/날짜 | N/A; 이번 공개 문서 저장/집계/금액 계산 없음 |
| 웹: 직접 URL/이력/잘못된 ID | [x] DOM; [ ] 실제 reload/new tab/이력·스크롤 |
| 웹: 키보드/모달/label/오류·빈 상태 | [x] 버튼 type·명칭·Dialog·오류/empty 코드/DOM; [ ] native keyboard/Escape/focus trap/inert/보조기기 |
| 웹: viewport·좁은 폭·확대·긴 한국어·sticky·IME·touch/reduced motion | [ ] 실제 브라우저/OS 검증; 합성 composition만 [x] |
| 주석·strict·effect/timer 정리·비밀값 | [x] 신규/수정 함수 한글 책임 주석, 타입/lint, 이메일 history 미노출/취소 회귀 |
| 성능/경합 | [x] debounce/slow 취소·중복/낡은 응답 검증; [ ] 실제 브라우저 성능/렌더 측정 |
| 검증·인계 | [x] 타입/lint/단위DOM/메모리build·공유 provider/CRM/인증 소비 회귀·명령/미실행/목 경계 기록 |
| Admin/서버 권한 | N/A; Admin/Backend 미변경 |
| 문서 링크·명령·상태 정합성 | 아래 최종 문서 검토 기록. [ ]인 시각/원본/환경을 완료 처리하지 않음 |

START-CHECKLIST: [x] 착수 Git/규칙/선행/원본 확인, [x] 진행 중 코드·목·소비 영향/관찰 구분, [x] 종료 결과/후속 담당/문서 연결; [ ] 실제 브라우저·시각 수용 조건. UXUI-REPLICATION은 엄격 동일 기준을 적용하며 작은 차이도 승인으로 간주하지 않는다. MOCK-UI-STATE는 이번 검색·선택·오류·재시도·취소·Reset·늦은 조회를 [x], 원본의 필수/원자적 저장 정책은 근거 대기/N/A로 분리했다.

### 7. R4 10항목·공통12기준

'비교 완료·유지/구현 보완'은 아래에 적은 주요 구성·로컬 동작 대조 결과이며 시각 동일성/전체 Goal 완료가 아니다.

| 항목 | 이번 상태 | 유지/문서/구현/분석 판정·근거 |
| --- | --- | --- |
| R4-F055-O01 | 비교 완료·유지 | 유지: 썸네일 돌출·카드 둥근 모서리·3열 구조 유지; 정확한 치수·그림자 미검증 |
| R4-F055-O02 | 비교 완료·구현 보완 | 구현 보완: Task management 표시와 실제 타입 분리·빈 썸네일 유지; All·검색·URL/이력 보완 |
| R4-F055-A01 | 분석 대기 | 분석 대기: 검색/교집합/페이징 원본 정책·빈 썸네일 원인·정확한 그림자/간격 미확인 |
| R4-F056-O01 | 비교 완료·구현 보완 | 구현 보완: 최소 헤더·제목·G2/Capterra 평점 구조 유지; 누락 구분선 복원(치수/색 추정), 폰트·정렬 동일성 미확인 |
| R4-F056-O02 | 비교 완료·구현 보완 | 구현 보완: 목차·가입 취소/로그인 후 전체 URL·목록 복귀 보완; FAQ3·읽기 전용 문서·No items found 유지 |
| R4-F056-A01 | 분석 대기 | 분석 대기: 미수록 본문·빈 추가 목록 원인·원본 Get template/계정 문서 대응 미확인 |
| R4-F069-O01 | 비교 완료·유지 | 유지: 공개 메뉴 소비 DOM 회귀; 메뉴 이후 자동 성공으로 연결하지 않음 |
| R4-F069-O02 | 비교 완료·구현 보완 | 구현 보완: 본문 링크3개 복원, 앵커 query·선택 복귀 보완; 파일15개 HTTP/구조 검증, 브라우저 수신 대기 |
| R4-F069-O03 | 비교 완료·구현 보완 | 구현 보완: Task management 표시와 Pros/Cons 구조 유지; invoicing software 표시 복원·미확인 목적지 로컬 안내 |
| R4-F069-A01 | 분석 대기 | 분석 대기: 미수록 하단/Excel·정확한 장식·링크 목적지·원본 파일 대응·Office 편집/계산 미확인 |

| 공통 기준 | G06 적용 결과 |
| --- | --- |
| R4-C01 | 21PNG 식별/해시/순서 및 ANALYSIS3개 해시 일치; MCP21개 메타데이터 재조회; 촬영 조건 대기 |
| R4-C02 | 카탈로그·상세·청구서 주요 구조 대조; 실제 크기/겹침/반응형 대기 |
| R4-C03 | 관찰 단계21개와 주요 요소 연결; 전체 요소 census·정밀 재현 인증 미완료 |
| R4-C04 | 본문 링크3개·미확인 링크1개·문장 공백 보완; 줄바꿈·미수록 본문 대기 |
| R4-C05 | PNG2880×1800/MCP메타1440×900 구분; CSS viewport·DPR·배율 및 새 픽셀 비교 대기 |
| R4-C06 | 기존 Gellix 선언 유지; 원본 폰트 파일/굵기/수치 동일성 미확인 |
| R4-C07 | 카드·Pros/Cons·링크 색 구성 대조; 픽셀 수치·그림자 동일성 대기 |
| R4-C08 | 로컬 파일15개 HTTP/바이트/구조 검증; 정확한 장식 자산·원본 파일 대응 대기 |
| R4-C09 | 오류/재시도·empty/무결과·잘못된 URL·합성 composition DOM 검증; 원본 정책 대기 |
| R4-C10 | 실제 router/history의 DOM 뒤로/앞으로·목차·목록 복귀 검증; 실제 브라우저 대기 |
| R4-C11 | 이력별 선택·이메일 초안·중복 제출·취소·Reset·늦은 조회 격리 검증; 계정 복제 N/A |
| R4-C12 | 직접 연결 소비·가상 로그인 후 같은 템플릿 복귀 DOM 검증; 원본 인증/계정 대응 대기 |

### 8. 남은 필수 항목·목 가정·담당

- [ ] G06/R01: 미수록 상세/중간 본문·청구서 하단/Excel·장점 하단3본문, No items found·빈 썸네일/잘못된 라벨 원인, invoicing software 목적지, 원본 필터/검색/정렬/전체 개수/페이지/복귀 정책.
- [ ] G06/R01/G01: 정확 폰트/아이콘/문서/잎 장식 자산과 치수·색·줄바꿈·평점/구분선·카드/고정바·촬영 조건, 전체 요소 census 및 원본 같은 상태의 픽셀 비교.
- [ ] G06 및 연결 G/G84: 실제 브라우저 직접 URL·새로고침/앞뒤/새탭·키보드/스크롤/모달/좁은화면/긴한국어/OS IME, console·네트워크(실패 요청 포함),15파일 다운로드 수신/Office 편집·계산. 새 파일을 만들지 않는 검증 가능 조건이 필요하다.
- [ ] G10/G11/G13/G14/R02: 전체 가입/온보딩 재검토는 별도다. 이번은 템플릿 선택 snapshot·가상 로그인 후 복귀에 한정한다.
- 목 가정: 보관 레코드477개+관찰 alias2개=479개는 원본 총개수가 아니다. 페이지24, substring/검색256자/단일업종 교집합, debounce200ms, reader normal80ms/slow1500ms, sticky450px은 로컬 정책이다. 메모리 scope를 벗어난 출발 이력은 /templates로 돌아간다.
- 목 가정: Google 문서·목적지 미확인 링크는 로컬 Dialog이며 원본 모달이라고 주장하지 않는다. 명시적 계정 문서 저장·복제·자동 발송·성공은 만들지 않았다.
- 후속 서버 메모: 공개/앱 template ID 대응, 복제 권한/계정 상태, 실제 read receipt·문서 라이선스/다운로드/외부 복사 정책. FE 진행을 위해 서버 결론을 가정하지 않았다.
- 비교 캡처 경로: **이번 신규 없음**(사용자 금지). 기존 evidence 경로는 과거 이력이며 이번 원본 동일성 증거로 사용하지 않는다.

### 9. 미리보기 직접 확인 순서

주소: **http://127.0.0.1:5173/** (기존 FE 서버). 아래는 사람이 이어서 확인할 순서이며 이번 실제 브라우저 통과 기록이 아니다.

1. `/templates/quotes?entry=g06#catalog`: All→Quotes→업종→검색→페이지를 조작해 다른 query/hash가 남는지 확인한다. 검색 중 뒤로/앞으로를 눌러 이전 초안이 다시 반영되지 않는지 확인한다.
2. `/templates?type=Quotes&q=ecommerce`: 상세→목차→Get template→가입/로그인 화면→취소→목록 breadcrumb. 최초 조건/위치 복귀를 확인한다.
3. 상세 하단 Customize에서 잘못된 이메일→수정→빠른 연속 제출→취소, 다른 템플릿 A/B 선택의 이력·입력을 확인한다. 실제 OAuth를 사용하지 않는다.
4. `/invoice-template?entry=g06`: Get Template은 파일 영역, Invoice with Bonsai/Try Bonsai는 선택 가입, 본문 Contractor/Freelancers와 Get template은 서로 다른 상세, 생성기는 /invoice-generator로 연결되는지 확인한다.
5. Google Docs와 Word Cons의 invoicing software를 열고 닫아 원래 위치·초점으로 돌아오는지 확인한다. 파일15개 수신/Office 앱 검증은 이번 미실행 범위로 남긴다.
6. `/components`의 Preview controls에서 read-error/empty/slow→Public/templates를 확인하고 마지막 Reset/normal로 복원한다. 직접 URL·새로고침·좁은화면·긴한국어·실제 IME·네트워크/console을 추가 확인한다.

### 10. 관련 문서 상태

- [x] G06 명세·이 결과·R01 소비 보완·연결 G 명세/결과에 현재 범위와 과거 이력을 분리 기록했다.
- [x] SOURCE-ANALYSIS-IMPACT의10항목과 공통12기준, FLOW-GOAL-MATRIX/FLOW-BEHAVIOR-REVIEW, GOAL-WORK-ORDER, README/FE-TODO/현재 상태·PLAN-INDEX를 G06 부분 완료로 맞췄다.
- [x] START-CHECKLIST/UXUI-REPLICATION/MOCK-UI-STATE/USER-FLOW/PUBLIC-WEB/EXPANSION-BACKLOG/문서 검토·작업 이력에 적용 범위·근거·미완료 담당을 연결했다.
- [ ] 엄격한 시각 동일성·실제 브라우저·R01 전체는 대기. 다음 Goal 자동 착수·커밋/push/배포 없음.

### 최종 정합성 검토

- [x] 마지막 코드 기준 전체29파일154/154(100.19초), 대상11/11 통과. 구분선/미확인 링크 보완 후 app/node 타입·lint·메모리build도 통과했다.
- [x] 기존5173/PID30272 유지. 화면2개와 현재 source/CSS3개 HTTP200·현재 코드 표식 확인, Vite dependency metadata 해시 불변. 실제 브라우저 검증은 아니다.
- [x] 계획 Markdown170개·JSON1개 검사. 기존 문서48개 갱신, 새 결과 문서0개. HEAD 대비 새 링크/앵커 오류0개, 정합성 assertion 실패0개. 기존 누락 경로/앵커221건은 이전 상태와 같으며 이번 증거로 사용/복원하지 않았다.
- [x] G06 R4 10항목의 명세/대응표/JSON 상태 일치·공통12항목 기록, 나머지 R4 445항목 불변. 기존 모든 Goal verification·실행 순서·원본 hash/소유권 보존.
- [x] `git diff --check` 통과. 신규 파일은 정식 회귀 테스트와 실행 hook 각1개뿐이며 원본/evidence/임시/자동 보고서 파일 변경·생성 없음.
- [ ] 브라우저/원본 시각/R01 전체 대기는 유지하며 다음 Goal·커밋/push/배포를 시작하지 않았다.

<a id="g06-precommit-review"></a>
## 누락 재검토·커밋 전 확인 — 2026-11-24 KST

사용자의 후속 요청 “누락된 부분은 없는지 검토해줘. 이상없으면 깃 커밋해줘.”에 따른 추가 검토다. 앞선 단계의 커밋 미실행/154개 검증 기록은 당시 이력으로 보존한다. 현재 G06은 계속 **부분 완료(원본/시각/실제 브라우저 대기)**다.

- [x] 변경 코드·직접 소비·원본 대응·FRONT_AGENT 준수·문서 체크를 다시 검토했다. 추가 실행 코드 결함은 발견하지 않았다.
- [x] 빠른 연속 조작의 검증 누락을 보완했다. 검색 초안→페이지 클릭 때 새 검색 첫 페이지로 이동하고, 초안 지우기→업종→유형 변경/업종 All에서도 각 조건과 다른 query/hash가 보존되는 정식 회귀1개를 추가했다. 기존 실행 코드는 이 시나리오도 통과했다.
- [x] 대상12/12(22.10초), 전체29파일155/155(110.29초). 타입 app/node --noEmit --incremental false, lint --no-cache, 메모리build1971모듈·3출력·8.54초 통과. 실행 방식은 위5절과 같으며 임시/자동 산출물을 만들지 않았다.
- [x] 원본 ANALYSIS3개/PNG21개의 해시 재대조 일치. 새로운 원본 이미지/MCP 조회를 다시 수행한 것으로 표현하지 않는다.
- [x] Markdown170/JSON1·기존 관련 문서48개·R4 10항목/공통12기준 정합성 재검사, 새 링크/앵커 오류0·assertion 실패0. 기존 누락 경로/앵커221건과 나머지 R4 445항목·모든 과거 verification·실행 순서는 보존했다.
- [x] 기존 FE5173/PID30272 유지. 이번에도 연결된 document-control 세션이 없어 실제 브라우저를 조작하지 않았다.
- [ ] 픽셀 동일성/원본 미수록/실제 브라우저·네트워크/파일 수신/Office/OS IME는 앞서 적은 담당에 그대로 남는다. 이 검토를 “누락 전혀 없음”이나 “G06 전체 완료”로 확대하지 않는다.
- 로컬 커밋은 위 잔여를 명시한 변경 묶음을 보존하는 사용자 승인 작업이다. push·배포·다음 Goal은 요청하지 않았으므로 실행하지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 청구서 소개→생성기→history 왕복과 기존 템플릿/파일 링크 DOM 회귀; 파일 다운로드 재실행 없음. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 공개 템플릿 목록의 query/hash에서 푸터 소셜 왕복을 DOM 확인했다. 파일/상세/양식 업무 전체 재검토는 아니다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.
