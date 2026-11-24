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
