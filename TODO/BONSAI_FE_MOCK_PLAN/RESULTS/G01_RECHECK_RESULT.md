# G01 기존 구현 재검토·보완 결과

> G00 재검토 확인 — 2026-11-23 KST: 아래 구현·테스트·캡처 수치는 당시 이력이다. 현재 HEAD `7a9e05ed`에서 `evidence/g01-recheck/`의 10개 파일이 삭제되어 이 문서의 해당 링크는 열리지 않는다. 기존 결과와 코드는 보존하며 파일을 복원하거나 이번 검증 근거로 쓰지 않았다. G00은 코드 읽기·문서 검사만 수행했다. G01 공통 모달 수정은 현재 코드에 유지되어 있고, 원본 시각 동일성·환경 검증은 계속 대기다. [현재 확인 범위](G00_RESULT.md#g00-recheck).

2026-11-23 KST. 시작 HEAD `a57f6c0fbad732f0c0f53e29149f90f18ae41bdf`, 시작 작업 트리 깨끗함.

**공통 모달 동작 결함 보완·목 회귀 검증 수행 / 엄격한 시각 동일성 대기 / G01 전체 완료 아님.**

이번 요청은 원본과 동일한 폰트·크기·픽셀·상태·흐름을 요구한다. 이전 계획 반영 작업의 “작은 시각 차이 허용”은 이번 G01 및 직접 연결 검증의 완료 기준에 적용하지 않는다. 과거 G01/G01~G15 결과·체크는 당시 이력으로 보존한다. 미확인 폰트나 근사값을 원본 값으로 승인하지 않았다.

## 1. 처리 범위와 판정

| 대상 | 포함 이유·이번 처리 | 판정 |
| --- | --- | --- |
| G01 runtime/provider/query/editor | 같은 ID의 저장·조회, 가상 세션·workspace·초안·취소·재시도 경계 | 유지. 코드 대조 및 현재 테스트 |
| G01 Dialog·스크롤 수명 | 입력 선택 중 닫힘, 중첩 모달 이력 이탈 후 스크롤 잠금 결함 | 구현 보완 |
| Button·Field·StatusPanel·LocalImageCard | 공통 표시·접근성·로컬 자산·상태 경계 | 동작 유지; 원본 글자·색·자산 동일성 분석 대기 |
| G14 셸·라우팅·모바일 메뉴·404·공개 복귀 | Dialog 소비 및 실제 navigation 영향 | 연결 회귀 검증. G14 전체 R4 재판정 아님 |
| G11 로그인, G15 회사, G19 고객, G21 프로젝트, G25~G31 작업·템플릿 | 공통 UI의 기존 소비 화면, 중첩 모달 재현 및 저장/취소 영향 | 기존 업무 유지·회귀. 각 업무 전체 재작업 아님 |
| R01/R02/R03 | 기존 폰트·인증·고객 분석의 관찰/목 가정과 남은 질문 | 소비 문서 보완. R 전체 완료 아님 |
| 장부 카테고리 G63 | 기존 G01 비교 출처의 모달 변형 확인 | 원본 참고만. G63 구현 미착수 유지 |

G00의 이전 실제 인증 제거·전면 교체 기록은 현재 provider/router/runtime와 대조했으며 재실행하지 않았다. 서버/API/DB/Admin·환경 파일·의존성·원본 PNG 변경, 커밋·push·배포, G32 이후 구현은 없다. 별도 tmp 파일·임시 스크립트를 만들지 않았다. 검사는 인라인 명령과 기존 테스트를 사용했고 산출물은 이 결과와 `evidence/g01-recheck/`, 기존 Playwright `test-results`에 남긴다.

<a id="g01-sources"></a>
## 2. 원본 확인 목록과 근거 수준

Gummble `bonsai-web`, 앱 `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, **Latest / 2146**을 이번에 조회했다. 처음 3흐름 18단계를 조회했고 최종 기록을 위해 셸·404까지 포함한 5흐름 23단계를 재조회했다. 이미지 없는 MCP 응답의 ID·순서·URL/명목 크기와 로컬 PNG를 대조했다. MCP 조회 자체를 이미지 직접 관찰로 계산하지 않았다.

- [MCP 응답](evidence/g01-recheck/mcp-sources.json): 5/5 성공, 23단계. 앱 조회의 별도 1개 화면은 관찰 수에 포함하지 않음.
- [원본 확인 목록](evidence/g01-recheck/source-manifest.json): 23개 PNG의 Flow ID·단계·Screen ID·상대 경로·SHA-256·크기·직접 확인 범위. 각 원본 PNG를 직접 열었다.
- 원본 모두 **2880×1800 이미지 px**. MCP 명목 **1440×900**. 제품 빌드·촬영일·실제 CSS viewport·DPR·배율은 미확인이다.
- 관련 ANALYSIS의 단계·상태·R4 보완 관찰·미확인을 함께 대조했다. 과거 공식 도움말/API 조회는 이번 신규 조회가 아니다. 실계정 재현도 아니다.

| 확인 | 흐름 / Flow ID / ANALYSIS | 직접 확인 단계와 사용 범위 |
| --- | --- | --- |
| [x] | [Logging in](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) / `a02409b3-6eb0-4bc0-b702-22a42e0990c8` | 01 공개 진입, 02 빈 로그인, 03 이메일·마스킹 비밀번호/포커스, 04 CAPTCHA 체크, 05 앱. 로그인 제어·셸과 캡처 사이 미관찰 경계 |
| [x] | [Adding a new client](<../../../bonsai_analysis/flows/Adding a new client/ANALYSIS.md>) / `a5f7a722-8a0c-4528-966a-903e7e0873fb` | 01 대시보드, 02 New 메뉴, 03 빈 폼, 04 입력, 05 Client 태그, 06 상세/성공 토스트, 07 상세 스크롤. 모달·입력·저장/복귀 문맥 |
| [x] | [Adding a bookkeeping category](<../../../bonsai_analysis/flows/Bookkeeping/Adding a bookkeeping category/ANALYSIS.md>) / `3a74090f-e360-4fb9-9b79-c1ca197708ba` | 01 목록, 02 빈 모달, 03 이름, 04 색 선택, 05 성공 토스트, 06 추가 행. 공통 변형 참고만 |
| [x] | [Hiding sidebar](<../../../bonsai_analysis/flows/Dashboard/Hiding sidebar/ANALYSIS.md>) / `ff646f32-f010-478e-a3bd-572ccc501292` | 01 다른 날짜/본문, 02 펼침, 03 축소. 메뉴 폭·레이블·본문 확장 및 서로 다른 snapshot 구분 |
| [x] | [404](../../../bonsai_analysis/flows/404/ANALYSIS.md) / `b340c3e3-ad5f-401c-839d-60e02a8c7ce2` | 01 진녹색 404, 02 흰색 Page Not Found. 별도 변형이며 두 화면 사이 클릭 전이·HTTP 상태는 미확인 |

23단계 관찰은 **이 5흐름의 공통 요소와 전환 문맥 검토**다. 모든 업무 요소 전수 분석·134흐름 재검토·원본 동일성 인증으로 확대하지 않는다. 원본 색인의 `element_census_complete=false`, `reproduction_spec_certified=false`는 유지한다.

<a id="g01-elements"></a>
## 3. 원본 → 분석 → 계획 → 구현 대응

분석 위치는 위 ANALYSIS의 3절 순서, 4절 해당 단계/R4 관찰, 5절 해석, 8절 미확인이다. 아래 요소 ID는 이번 검토 범위의 식별자이며 전체 원본 요소 수의 분모가 아니다. 공통 12기준 전체의 인증은 대기다.

| 요소 ID·담당 | 원본 단계/Screen ID·관찰 | 현재 구현·판정·남은 일 |
| --- | --- | --- |
| C-CLIENT-SHELL · G01/G19 | 고객03 `sc_3e2640e1d9ca4b59a7f1c79cb628a502`: 어두운 흐림 배경, 좌측 정렬 New Client/설명, 외부 X, 본문/푸터 경계 | `Dialog`, `tokens.css`, `global.css`, G19 `clients.css`. 폭·상단은 정규화 추정과 대응; 블러/opacity/아이콘 원형/획의 정확성 대기 |
| C-CLIENT-FIELDS · G01/G19 | 고객03~04 `sc_7435a1d441654b5fa2a8428533fd5d87`: Company Name/Smith Co. 선택 항목, Contact Name/Jane Smith·Email/jane@smith.com 별표, 입력 후 이메일 녹색 테두리 | 공통 `Field`는 required를 소비자가 결정. G19 별도 입력은 필수 의미 유지. 빈 폼의 원본 회색 별표와 구현 빨강, 입력 위치/배경 차이 → G19 시각 보완 대기; 오류라고 단정하지 않음 |
| C-CLIENT-ACTION · G01/G19 | 고객03~05 `sc_225e25a9ba6745be98341cf77524fa23`: + Add Tag→Client 칩/EDIT, Add Client의 연한 상태 | `new-client-dialog.tsx`의 로컬 태그 선택·명시적 제출 유지. 옅은 버튼의 원인을 처리 중/비활성으로 확정하지 않음. 태그 선택 중간 화면 원본 미수록 |
| C-CLIENT-RESULT · G19 | 고객06~07 `sc_b1619b6b9fc3405e8ad67fd26f405b62`, `sc_9e5c9989e48d45459e62cc2fe0b886fb`: Active 상세·Default Contact·성공 토스트·빈 관련 영역·스크롤 | clients 회귀로 같은 ID/상세/목록·실패/취소 확인. G01 표본의 Add Client는 공통 요소 닫기 시연이며 고객 생성 완료로 계산하지 않음 |
| C-LOGIN · G01/G11/R02 | 로그인02 `sc_9d353458318e43e7b25ebbf88fefeaa9`, 03 `sc_5c0fde91fbb34480b756c6eb10e63816`, 04 `sc_4b4cf6491d4c4dd8993f4fe0b7caa7f9`: Google/Apple·or·두 입력·CAPTCHA·Log in·복구 링크 | G11 전용 폼/Gellix와 공통 Field의 숨김 label 구분. 소셜·2FA·오류·만료는 목 가정. CAPTCHA 그림과 버튼 색 등 시각 대기; 실제 Google 요청 없음 |
| C-CATEGORY-VARIANT · G01/G63 | 카테고리02 `sc_f2a7c3be441a4a95ab91fba511865483`, 03 `sc_086fba724bae4db892400f6143884a6b`, 04 `sc_ca9be0cbcb06461b8ac05fc9b4ac4c82`: 좁은 중앙 제목/입력·팔레트·빨강 선택 체크·Save Category. 02에는 X 미노출, 03~04에는 노출 | G01의 고객 모달 기본값을 이 변형에 강제하지 않는다. 미래 G63에서 폭·정렬·입력 높이·X 노출 근거를 별도 명세. 이름/색만 바꾸고 자동 저장하지 않음 |
| C-CATEGORY-RESULT · G63 | 카테고리05~06 `sc_5cc7db97cb1e4603bf9a8bb575dc2771`, `sc_c4fdb168bca742cda9c29d382eb86995`: 성공 토스트와 Design Resources 행/Edit/Delete | 토스트만이 아닌 목록 반영의 수용 기준 참고. 현재 G63 미구현, 삭제·편집 정책은 여기서 만들지 않음 |
| C-SIDEBAR · G14 | 펼침02 `sc_d177f0ef742b46daa0c1a96e7df49192`→축소03 `sc_afe21c01937c42ff92a872cf1a0b07c2`: 텍스트 숨김·본문 확장 | `app-shell.tsx`/사이드바 유지, 모바일 Dialog·접힘·실제 history 회귀. 01과02의 날짜/프로젝트 수 차이를 같은 저장 결과로 만들지 않음. 확장·모바일·지속성은 목 가정 |
| C-404 · G14 | `sc_b625cb20b5c242978c1f398163b870d1`, `sc_4cd87d1434ce4f66b7f8e77bafe39d29`: 다른 배경·레이아웃·버튼 | 공개/내부 route 경계 유지·실제 이동 회귀. 공개 홈/신고→로컬 홈/지원, 내부 홈→앱은 목 목적지. 실제 원본 URL·HTTP 응답 미확인 |
| C-DIALOG-LIFETIME · G01/G14/소비 G | 캡처에는 drag/중첩 Escape/history cleanup 과정 미수록 | FRONT_AGENT 접근성·초안 보존의 목 UX 수용 기준. 실제 결함 2종 수정, 아래 재현·회귀 증거. Bonsai 실계정 관찰로 표시하지 않음 |

### 공통 12기준의 이번 적용 상태

| 기준 | 이번 근거·처리 | 상태 |
| --- | --- | --- |
| R4-C01 원본 식별 | 위 23단계 ID·해시·MCP·버전·촬영조건 미확인 분리 | 선택 범위 식별 완료, 촬영 환경 대기 |
| R4-C02 전체 구성 | 고객/인증/카테고리/셸/404 변형과 배경·푸터·오버레이 대조 | 부분 완료; 전체 제품 구성 명세 아님 |
| R4-C03 요소 목록 | 위 10개 요소군·실제 소비 경계 대응 | 부분 완료; 모든 세부 요소 전수 계수 대기 |
| R4-C04 정확한 표시 | New Client/설명/필드/필수/선택/로그인/토스트 관찰과 코드 대조 | 부분 완료; 픽셀·줄바꿈 및 소비 화면 세부 차이 대기 |
| R4-C05 배치 | 아래 좌표와 원본/구현 캡처, 상대 버튼 crop 명시 | 측정·비교 수행, 전체 동일성 대기 |
| R4-C06 글자 | Outfit 근사 및 소비 Gellix를 원본 내부 폰트와 구분 | 분석 대기 |
| R4-C07 색·장식 | 원본 표본 RGB와 현재 token, 픽셀 차이 측정 | 부분 완료; 정확한 gradient·선·blur/opacity 대기 |
| R4-C08 자산 | Lucide X/소셜 아이콘/CAPTCHA 대체 표시 확인 | 분석 대기 |
| R4-C09 상태 | 빈/입력/선택/결과 관찰, 로딩·오류·권한·재시도는 목 시험 | 선택 범위 동작 검증, 미수록 원본 상태 대기 |
| R4-C10 전환 | 명시적 저장·취소·실제 뒤로/앞으로, 불연속 snapshot 분리 | 선택 범위 동작 검증, 원본 미관찰 경로 대기 |
| R4-C11 입력·저장 | 초안/commit·중복·실패 보존·scope 취소, 드래그/모달 이탈 결함 수정 | 선택 범위 보완·검증, 실서비스 정책 미확인 |
| R4-C12 화면 연결 | shared Dialog 소비 및 같은 목 ID·workspace·이력 회귀 | 선택 범위 검증, 다른 Goal 전체 완료 아님 |

## 4. 구현 검토와 수정

| 구분 | 원인·수정 | 검증 |
| --- | --- | --- |
| 입력 선택 드래그 중 모달 닫힘 | `click.target === dialog`만 보면 입력→배경 드래그의 합성 click도 닫힘으로 해석. `dialog.tsx`에 pointer 시작·종료 위치/ID 및 cancel 검사를 추가. 두 끝 모두 배경인 기본 클릭만 닫음 | 수정 전 새 회귀 실패. 입력→배경과 배경→입력 모두 초안 유지, 실제 배경 클릭은 닫힘 |
| 중첩 모달 이탈 뒤 스크롤 잠금 잔류 | 모달별로 이전 overflow를 보관하면 부모→자식 cleanup 순서에서 마지막 자식이 hidden을 복원. 새 `lib/lock-page-scroll.ts`에서 body별 잠금 수·최초 inline 값/priority를 보관하고 마지막 해제 때 복원 | 수정 전 실제 goBack 후 dialog 0개인데 body hidden. Escape 자식만 닫기/부모 잠금·초점, 전체 goBack 해제·goForward 저장 자식 재진입 검증 |

신규 회귀는 기존 `tests/e2e/foundation.spec.ts`의 2개 테스트다. navigation을 mock하지 않는다. 마지막 검토에서 배경→입력 역방향 드래그도 추가해 1회 실패를 확인하고 pointerup 조건으로 보완했다. 통과한 검사를 유지한 채 테스트의 관찰을 느슨하게 바꾸지 않았다.

유지한 mock 구조: `app/providers/app-providers.tsx` 조립, `mocks/create-preview-runtime.ts`의 단일 메모리 원본·복제 조회·workspace/actor/revision 검사, `query-scope.tsx`, `features/preview/hooks/use-preview-editor.ts`의 제출 snapshot·중복 guard·AbortSignal·캐시 갱신. 고정 기준 시각 `2024-02-06T09:00:00Z`, 정상 180ms/느림 1500ms, 일회성 읽기·쓰기 실패와 reset은 목 시나리오다. 실제 API로 fallback하지 않는다.

## 5. 시각 비교와 남은 차이

원본 PNG를 수정하지 않았다. Python/Pillow 인라인 명령으로 메모리에서 원본을 LANCZOS 50%로 정규화하고, Chromium **1440×900 viewport / DPR 1 / 배율 1 / scroll 0 / 폰트 로딩 완료** 캡처와 RGB 절대차를 계산했다. 원본 환경을 확인한 값이 아니다. 숫자는 비교된 crop의 차이이며 완성률·허용 오차가 아니다.

- [픽셀 비교 이미지](evidence/g01-recheck/pixel-comparison.png): 각 행 원본 / 구현 / 차이×4.
- [픽셀 수치·crop 좌표](evidence/g01-recheck/pixel-comparison.json), [브라우저 캡처 조건·실제 요청·computed style](evidence/g01-recheck/browser-evidence.json).
- 구현: [공통 모달](evidence/g01-recheck/common-dialog.png), [빈 고객 폼](evidence/g01-recheck/client-empty.png), [입력 고객 폼](evidence/g01-recheck/client-filled.png), [로그인](evidence/g01-recheck/login.png).
- 시각 CSS는 이번에 변경하지 않았다. 같은 해시의 중복 캡처는 하나로 정리했으며 캡처를 별도 시각 개선 증거로 세지 않는다.

| 비교 영역 | 비교 조건 | 비동일 픽셀 | 판정 |
| --- | --- | --- | --- |
| 공통 제목·설명·Company 입력 | 고객03 원본/구현 `[490,60,950,270]` | 14,026 / 96,600 (14.520%) | 글자 모양·위치·border 차이. 동일성 대기 |
| 공통 Add Client 버튼 | 원본 `[510,657,930,703]`, 표본 `[510,330,930,376]` 상대 위치 crop | 18,371 / 19,320 (95.088%) | gradient·glyph·radius 차이. 전체 폼 높이 일치를 주장하지 않음 |
| G19 빈 고객 모달 | `[490,60,950,724]`, 입력 공란/태그 없음 | 91,319 / 305,440 (29.898%) | 필수 별표 색·세로 간격·배경/버튼·폰트 차이. G19 후속 시각 보완 |
| G11 로그인 카드 | `[740,80,1140,800]`, 이메일/비밀번호 공란·CAPTCHA 미선택 | 269,466 / 288,000 (93.565%) | surface RGB·폰트·버튼·CAPTCHA 대체 자산 차이. G11/R02 후속 |

공통 모달 현재 CSS: 폭 460/top 60, 제목 Outfit 500 22/30, 설명 14/22, 입력 380×40·16/24, 버튼 420×46·600 16/24. 이들은 **현재 구현 값/비교용 추정**이며 원본 CSS 확정값이 아니다. 원본 고객03 정규화 경계는 x490/y60/폭460, 입력 폭380/높이40, 버튼 폭420/높이46로 대응한다. 원본 버튼 표본에 `#1b9f00`, `#1b9801`이 관찰되지만 전체 gradient 함수·픽셀 띠의 원인을 확정하지 않았다. 정확한 font family/file·획·렌더링 환경도 미확인이다.

카테고리02의 정규화 폭 약400·입력 높이 약50·중앙 제목은 고객 모달과 다르다. 실제 CSS/DPR 확인 전 추정으로 유지한다. 새 소비 기능이 없는 변형을 위해 사용되지 않는 범용 API를 추가하지 않았다. 현재 공개 웹 Gellix 근거를 과거 내부 앱으로 소급하지 않으며 Outfit/Lucide를 원본 자산이라고 표현하지 않는다.

- [x] 선택 원본·구현 캡처와 픽셀 차이·관찰/측정/추정을 기록했다.
- [ ] 정확한 원본 폰트/아이콘·촬영 조건 확인 및 G01 재비교. 담당 G01/R01, 소비 G11/R02·G19/R03.
- [ ] 확인된 시각 차이 전체 해소. 작은 차이를 허용하지 않으며 위 crop 모두 동일성 대기다.
- [ ] G14 전체 셸/404·G19 전체 업무·G63 정밀 시각 재현. 이번 공통 동작 회귀로 완료 처리하지 않는다.

## 6. 실제 명령·브라우저 검증

환경: Windows, Node `v24.18.0`, pnpm `8.14.1`(현재 packageManager), 설치된 Playwright Chromium. 시작 시 5173~5190 실행 중 FE가 없어 **FE만** 127.0.0.1:5173에 시작했다. 기존 환경/설정 변경 없음. 개발 테스트 5175, 빌드 테스트 4175는 기존 설정의 전용 서버다. 브라우저별 격리 메모리를 사용하고 종료 전 수동 캡처 세션에서 Reset preview로 정상 seed/설정을 복원했다.

명령 cwd는 별도 표기가 없으면 `FE/user-web`이다.

| 명령 | 실제 결과·범위 |
| --- | --- |
| `git status --short`, `git rev-parse HEAD`, `node --version`, `pnpm.cmd --version` | 시작 상태·버전 확인 |
| `pnpm.cmd exec playwright test foundation.spec.ts --grep 'dialog text selection\|nested dialogs release' --workers=1` | 최초 회귀 2/2 실패: 두 제품 결함 재현 |
| `pnpm.cmd exec playwright test foundation.spec.ts --workers=2` | 1차 수정 후 9/9 통과 |
| `pnpm.cmd run typecheck` / `pnpm.cmd run lint` | 최초 및 마지막 pointerup 보완 뒤 모두 통과 |
| `pnpm.cmd run test` | 23파일 100/100 통과. 이번 두 회귀는 실제 브라우저 테스트로 추가 |
| `pnpm.cmd run build` | 최초 및 마지막 pointerup 보완 뒤 통과. 최종 JS 1,056.46kB/gzip 284.12kB. 기존 Browserslist 오래됨·500kB chunk 경고 유지. 의존성 업그레이드/분할 범위 확장 없음 |
| `pnpm.cmd run test:e2e -- --workers=4` | 인자 전달 오류로 No tests found. 앱 실패나 통과로 세지 않고 아래 명령으로 수정 |
| `pnpm.cmd exec playwright test --workers=3` | 1차 수정 전체 개발 163/163 통과, 실패·skip·flaky 0 |
| `pnpm.cmd run test:e2e:preview -- foundation.spec.ts app-shell.spec.ts clients.spec.ts company-settings.spec.ts subtasks.spec.ts task-template-writing.spec.ts task-template-application.spec.ts --workers=4` | 1차 수정 빌드 소비 회귀 38/38. 전달된 `--` 뒤 workers는 적용되지 않아 실제 6 workers로 실행 |
| `pnpm.cmd exec playwright test foundation.spec.ts --grep 'dialog text selection' --workers=1` | 2차 검토에서 역방향 드래그 추가 후 1/1 실패 재현; pointerup 보완으로 처리 |
| `pnpm.cmd exec playwright test foundation.spec.ts app-shell.spec.ts clients.spec.ts company-settings.spec.ts subtasks.spec.ts task-template-writing.spec.ts task-template-application.spec.ts --workers=3` | 최종 pointerup 보완 뒤 개발 38/38 통과 |
| `pnpm.cmd exec playwright test --config=playwright.preview.config.ts foundation.spec.ts app-shell.spec.ts clients.spec.ts company-settings.spec.ts subtasks.spec.ts task-template-writing.spec.ts task-template-application.spec.ts --workers=3` | 최종 빌드 38/38 통과 |

[검증 집계](evidence/g01-recheck/verification.json)에 명령 단계·시험명·요청 수·오류와 보고서 해시를 남겼다. 163 전체 회귀와 최종 수정 뒤 대상 회귀를 합산하거나 모두 최종 코드 전체 재실행으로 표현하지 않는다.

네트워크는 기존 `tests/e2e/fixtures.ts`의 context request/response/requestfailed 및 새 탭 console/pageerror/socket 관찰이다. 요청 차단·API intercept 없음. 1차 개발 106,361건과 빌드 997건의 요청은 로컬 문서/정적 자원이며 실제 인증·업무·외부 API 위반 0, 실패 0, console/pageerror 0. 개발 HMR 286연결은 동일 origin, 빌드 socket 0. 이는 테스트 실행 구간 증거이며 무한한 모든 사용 동작을 인증하지 않는다.

검증한 사용자 동작: G01 조회/상세/편집 같은 ID, 실패 입력 유지/재시도·중복 제출·느린 취소·workspace/actor 격리·reset·직접 URL/새로고침·history, Dialog Tab/Shift+Tab/Escape/X/배경·초점 복귀·두 방향 드래그, G14 공개/보호/404·모바일 메뉴·좁은 높이·폭 전환, 소비 화면의 중첩 모달·저장/취소·실제 뒤로/앞으로. 폭 320/360/390/768/1024/1440 및 긴 한글·CSS zoom 2·합성 composition은 테스트별 범위에서 수행했다.

- [ ] 실제 OS IME 조합 입력, 화면낭독기, 브라우저 UI 확대, 실제 터치 기기, Firefox/Safari는 미실행. Chromium 합성 composition·CSS zoom을 이 검증으로 대체하지 않는다.
- N/A: 실제 서버 영속성·OAuth·메일·업로드·결제·권한·출시 검증. 현재 요청에서 금지된 별도 단계다.

## 7. FRONT_AGENT 엔지니어링 검토

적용 문서: [FRONT_AGENT 지도](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [결정006](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/006_bonsai_uxui_only_phase.md) 우선, 결정005/003, User Web 구조·상태/데이터·mock 개발·테스트, 컴포넌트/웹 접근성/주석/User Web 컨벤션. PM036·UX025와 현재 코드로 과거 실인증/API 지침을 구분했다. Admin 구조·배포 실행 규칙은 변경 대상이 아니므로 N/A다. AGENT/README가 참조하는 `AGENT_USAGE_RULES.md`는 없으며 존재하지 않는 규칙을 읽었다고 쓰지 않았다. 적용 범위의 상위/루트 AGENTS.md는 없다.

아래 번호는 [ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 절·항목 순서다. 공통 템플릿 자체를 전체 프로젝트 완료로 체크하지 않고 이번 적용 결과를 여기에 기록한다.

| 항목 | 판정·코드/검증 근거 |
| --- | --- |
| 1.1 범위/기존 변경 | [x] 깨끗한 시작 상태, 기존 업무/역사 보존, 변경은 Dialog/helper/회귀 |
| 1.2 출처 구분 | [x] 2~3절 관찰·추정·목·미확인, 신규 공식 문서/실계정 조회 없음 |
| 1.3 시작/행동/종료/실패 | [x] 3~4절 및 foundation/소비 E2E |
| 1.4 구현/목/실연동 | [x] 1절 상태와 6절 API 미연결 |
| 2.1 책임/import | [x] UI→lib 잠금, feature는 호출부와 onClose 소유; 새 업무 의존 없음 |
| 2.2 props/controlled | [x] 부모 open/onClose 유지, 내부 ref는 DOM/포인터 수명만 소유 |
| 2.3 공통화 근거 | [x] 실제 중첩 소비/전체 unmount 결함으로 body별 잠금 분리 |
| 2.4 앱 경계/순환 | [x] Admin import 없음, helper는 React/feature 의존 없음 |
| 2.5 새 의존성 | N/A. 패키지/lock 변경 없음 |
| 3.1 목 계약 | [x] 기존 runtime/data-source 경계 유지, 직접 HTTP 없음 |
| 3.2 조립/fallback | [x] app-providers의 목 조립, live fallback 없음 |
| 3.3 인증/네트워크 | [x] 가상 Continue as Alex/로컬 auth와 실제 요청 관찰 |
| 3.4 동일 ID | [x] foundation·clients·프로젝트/작업 소비 회귀 |
| 3.5 결정성/수명 | [x] preview runtime seed/clock/reset·새로고침 메모리 초기화 |
| 3.6 live 결과 대체 | N/A. 현재 변경 경로는 전부 독립 목, live 경로 추가 없음 |
| 3.7 임시 타입 | [x] FE 목 타입 유지, API/DB 계약 작성 없음 |
| 4.1 상태 소유권 | [x] 잠금만 공유, 폼/URL/Query/store를 합치지 않음 |
| 4.2 scope/query key | [x] query-scope·preview-keys/runtime revision 및 교차 scope 회귀 |
| 4.3 취소/늦은 응답 | [x] use-preview-editor AbortSignal·이탈/세션 교체 E2E |
| 4.4 제출/중복/실패 | [x] 제출 snapshot·guard 유지, foundation 실패·재시도 시험 |
| 4.5 조회 갱신 | [x] 같은 ID 상세/목록 및 소비 저장 재진입 검증 |
| 4.6 금액/날짜/null | N/A 수정. 기존 빈 결과/고정 시각은 유지·회귀; 계산 코드 변경 없음 |
| 5.1 navigation | [x] 실제 goBack/goForward/goto/reload, 보호/404/잘못된 ID 회귀 |
| 5.2 키보드 | [x] Tab 순환·Escape·버튼·초점 assertion |
| 5.3 모달 | [x] showModal·배경 비활성·초점/스크롤 cleanup 및 중첩 회귀 |
| 5.4 의미/label | [x] Dialog title/description ID·Close dialog 이름/button type, Field label/error 연결 유지 |
| 5.5 상태 구분 | [x] runtime loading/empty/read/write error/denied와 재시도 시험 |
| 5.6 폭/확대/스크롤 | [x] 명시 viewport·짧은 높이/긴 한글·CSS zoom, 원본 환경 미확인 별도 |
| 5.7 IME/터치/환경 | [ ] 합성 composition·기존 reduced-motion 회귀 및 아래 후속 Chromium 터치 에뮬레이션 수행. OS IME/실기기 터치 미검증 |
| 6.1 한글 주석 | [x] 변경 Dialog handlers/effect, lock/unlock, 두 신규 test 책임 주석 |
| 6.2 복잡한 흐름 이유 | [x] 모달 focus 이유 주석·lock count/1회 release 책임; 억지 번호 주석 추가는 N/A |
| 6.3 strict/cleanup | [x] 타입 우회 없음, WeakMap/body와 idempotent release, effect cleanup·typecheck |
| 6.4 권한/비밀 | [x] 가상 runtime scope 유지, 실 토큰/환경 값 출력·번들 추가 없음; 서버 권한 검증 N/A |
| 6.5 성능 | [x] Map lookup/ref만 사용, 전역 listener·render loop 추가 없음; 실제 회귀·build. 별도 병목 최적화 N/A |
| 7.1 적정 검증 | [x] 타입/lint/unit/build·재현 E2E·공통 영향 회귀 선택 |
| 7.2 인증/CRM 회귀 | [x] 목 경계/redirect/저장 흐름 실제 navigation 시험; 실제 인증 회귀 N/A |
| 7.3 Admin | N/A. Admin/서버 권한 변경 없음 |
| 7.4 실행 증거 | [x] 6절·verification/browser JSON, 미실행 환경 분리 |
| 7.5 운영 구분 | [x] 목 성공만 기록, 실제 영속성/외부 효과 미수행 |
| 7.6 문서 정합 | [x] 최종 링크·색인·체크 상태 검토. 과거 부재 산출물은 원래 경로를 보존해 현재 근거와 구분; 아래 종료 기록 |

<a id="g01-checklists"></a>
## 8. 공통 체크리스트 적용 결과

`START-CHECKLIST.md` 항목 순서별 이번 결과다. 공통 템플릿의 빈 체크를 다른 Goal의 완료로 바꾸지 않는다.

| 항목 | 판정·근거 |
| --- | --- |
| 착수1 범위/Git | [x] 1절 |
| 착수2 FRONT/UX | [x] 7절 및 엄격 시각 기준 |
| 착수3 선행 G | [x] G00/G01 기존 결과와 현재 provider/runtime 대조 |
| 착수4 연결 R | [x] 별도 필수 선행 R 없음; R01~03 소비 결과/잔여 확인 |
| 착수5 서버 질문 분리 | [x] 9절 |
| 착수6 원본/확장 대기 | [x] 관련 5흐름 ANALYSIS·23 PNG·버전과 기존 소유 Goal 대조 |
| 착수7 흐름/동일 객체 | [x] 3~4절 |
| 착수8 실행 의존 | [x] preview/runtime/router·실제 요청 관찰, 환경 유지 |
| 착수9 하위 Goal 분리 | N/A. G01 공통 결함과 직접 연결 회귀 범위로 유지 |
| 중간1 시각 비교 조건 | [x] 5절 비교 수행. 동일성 완료 아님 |
| 중간2 책임 경계 | [x] 4·7절 |
| 중간3 한글 주석 | [x] 변경 코드의 책임 주석 |
| 중간4 임시/저장/실결과 | [x] runtime/초안·목 성공 분리 |
| 중간5 실패/빈/권한/재시도 | [x] foundation 및 소비 E2E |
| 중간6 navigation/폭/입력 | [x] 6절 실제 browser; 시간대·금액 변경은 N/A, OS IME 별도 대기 |
| 중간7 검증 선택 | [x] 6절 |
| 중간8 API/민감 데이터 | [x] 요청 미차단 관찰 0, 실제 토큰 없음 |
| 종료1 수용/차이/미실행 | [x] 3·5·6·9절 |
| 종료2 FE 한정 | [x] 서버 질문만 기록, 계약·DB 미작성 |
| 종료3 R 발견 배정 | [x] 기존 G01/R01·G11/R02·G19/R03·G63 소유 유지, 새 기능 없음 |
| 종료4 관련 문서 갱신 | [x] 관련 G/R·공통 기준·순서표·현재 상태·JSON의 범위와 대기 연결 |
| R4-1 행동/입력/저장 | [x] 3절. 과거 작은 시각 차이 허용 문장은 이번에 적용하지 않음 |
| R4-2 관찰/새 결함 | [x] 2개 실제 재현 결함과 분석 메모를 구분 |
| R4-3 이력/현재 판정 | [x] 과거 수치와 이번 검사 구분, 1절 4가지 판정 |
| R4-4 공통/소비 경계 | [x] 1절, 전면 교체 없음 |
| R4-5 표/명세/색인/결과 | [x] 선택 실행 근거와 대기를 함께 반영, 455개 원문·단계 소유·과거 체크 보존 |
| R4-6 요소 대응/정밀 인증 | [x] 3절 선택 요소 대응, 전수·동일성 인증은 대기 |
| R4-7 공유 화면/소비 | [x] 23단계/실제 Dialog 사용처, 단계 소유 유지 |

UXUI-REPLICATION 화면 체크 6항목: 원본 직접 대조 [x], 비교 조건 [x], 선택 범위 로컬 진입/취소/복귀 [x], 책임/한글 주석 [x], API0 관찰 [x], 남은 차이 기록 [x]. **별도 엄격 동일성 체크는 [ ]**다.

MOCK-UI-STATE의 초안/저장·동일 ID·scope·지연/실패·취소·재시도·초기화는 foundation/runtime 및 소비 회귀로 [x]. 실제 서버 정책·탭 간 영속성·미관찰 자동 성공은 구현 완료 대상에 추가하지 않았다.

## 9. 남은 작업·서버 메모·직접 확인

| 남은 항목 | 이유·후속 담당 |
| --- | --- |
| G01 엄격 시각 동일성 | 정확한 내부 폰트/아이콘·원본 렌더링 조건 미확인, 픽셀 차이 잔존. G01/R01 및 소비 G11/R02·G19/R03에서 출처 보완 후 재비교 |
| 소비 화면 세부 시각 차이 | G19 회색 별표/입력 간격·G11 카드/버튼/CAPTCHA 등. 이번 관련 화면의 미완으로 기록하며 업무 전체 수정은 다음 해당 묶음에서 |
| 전체 요소 계수/다른 변형 | 이번 10개 요소군이 전체 원본 목록은 아님. 각 소비 Goal의 상세 전수 대응과 G63 변형 명세 대기 |
| 환경 검증 | 실제 OS IME/터치/화면낭독기/브라우저 확대·Safari/Firefox 미실행 |
| 과거 증거 파일 | 수정 문서에서 과거 산출물 부재 참조 46건 확인. 원래 경로·검증 이력을 남기고 현재 파일이 없다고 표시했다. 과거 파일 복원은 하지 않았으며 이번 검증 근거는 새 정식 결과에 보존 |
| 원본 미관찰 동작 | 배경/Escape 닫기, 드래그 초안 보존, nested cleanup, 실패/중복/취소/역할/세션 수명은 명시한 목 가정. 실서비스 관찰로 승격하지 않음 |
| 서버 후속 메모 | 실제 CAPTCHA·2FA/세션/역할, 고객 중복·서버 저장·메일 발송, 장부 분류 편집/삭제 정책은 FE 완성 뒤 별도 검토. 현재 API/DB 설계 없음 |

미리보기 **http://127.0.0.1:5173** (FE만 실행 유지).

1. `/components` → Add Client → Company Name 입력 → 글자를 잡고 배경까지 드래그해 놓기. 모달과 입력 유지. 배경→입력 드래그도 유지. 배경 단순 클릭/X/Escape는 닫히며 버튼에 초점 복귀.
2. `/app/tasks` → 필요시 Continue as Alex → Initial chat 작업 → ＋ Add Subtask → 제목 입력/Save → 해당 하위 작업 Delete. 이 버튼은 현재 원본 미확인 안내를 여는 기존 목 경계이며 삭제 성공이 아니다.
3. 자식 안내에서 Escape: 자식만 닫히고 부모 모달 유지. 다시 안내를 연 뒤 브라우저 뒤로: 작업 목록으로 복귀하고 스크롤 가능. 앞으로: 같은 작업과 저장된 하위 작업 확인.
4. `/app/preview` → Design Resources → Edit name. Preview controls의 write error로 저장 실패/입력 유지·재시도, slow로 저장 후 취소를 확인한다. 마치면 Reset preview로 정상 상태 복원.
5. `/login`, 고객 New Client 화면은 위 비교 캡처와 함께 본다. 동작 회귀 통과와 원본 시각 동일성 대기는 별개다.

## 10. 최종 검증·문서 정합 기록

- [x] 최종 pointerup 보완 뒤 typecheck·lint·build, 단위 **100/100**, 개발/빌드 소비 회귀 **각 38/38** 통과. 각 회귀 안에 G01 9개 포함. 1차 전체 개발 **163/163**과 구분한다.
- [x] 최종 개발 요청 23,298건/HMR64, 빌드 요청 1,007건/socket0을 미차단 관찰했다. 실제 API/외부 요청·실패·console/pageerror **각 0**. [시험별 집계와 코드 해시](evidence/g01-recheck/verification.json).
- [x] 원본 23 PNG 해시 불변, `bonsai_analysis` 변경 없음. 85 G·22 R·107 순서·134흐름 배정·455 원본 메모·원본 인증 false 값 보존. 다른 Goal 전체 완료로 바꾸지 않았다.
- [x] 관련 수정 Markdown의 로컬 파일 링크와 새 결과 앵커를 검사했다. 과거 파일 부재 46참조는 원래 경로가 남는 명시적 부재 표기로 정리했다. 새 자료로 과거 증거를 위조·복원하지 않았다. 상세 검사 수치는 verification의 `documentValidation`에 있다.
- [x] `git diff --check` 통과. 임시 검증 파일/스크립트·환경/서버 설정·BE/DB/Admin·커밋/push/배포 변경 없음. 정상 기본 목 상태와 5173 FE 미리보기 유지.
- [ ] 엄격 시각 동일성·원본 폰트/아이콘/촬영 조건·전체 요소 명세·추가 환경은 미완이다. **G01 전체 완료가 아니며 다음 묶음/G32를 자동 시작하지 않는다.**

갱신 문서: G01 및 연결 G11/G14/G15/G19/G21/G25/G26/G30/G31 명세, R01/R02/R03 명세·결과, 기존 G01/G14 결과의 후속 링크, 루트/COMMON/FE-TODO/명세 목록의 현재 상태, GOAL-WORK-ORDER, START-CHECKLIST, UXUI-REPLICATION, MOCK-UI-STATE, USER-FLOW, FLOW-GOAL-MATRIX, FLOW-BEHAVIOR-REVIEW, SOURCE-ANALYSIS-IMPACT, EXPANSION-BACKLOG, PLANNING-REVIEW, DOCUMENTATION-WORK-LOG, PLAN-INDEX.json. 각각 이번 실행과 대기를 구분했고 공통 템플릿 전체·무관한 G/R 체크를 일괄 완료하지 않았다.

## 11. 사용자 후속 요청에 따른 커밋 전 검토 — 2026-11-23 KST

사용자의 “검토해줘. 이상이 없으면 깃 커밋” 요청에 따라 위 구현 결과를 다시 검토했다. 위 1·10절의 커밋 미실행은 최초 구현 종료 시점의 기록이며, 후속 요청은 검토한 변경분의 로컬 커밋을 허용한다. push·배포·다음 Goal은 포함하지 않는다.

- [x] Dialog 포인터 시작/종료·취소 처리, 중첩 잠금 해제 순서, 한 번만 해제하는 cleanup과 원래 inline overflow 복원을 코드·회귀 시험과 대조했다. 추가 코드 수정이 필요한 결함은 발견하지 못했다.
- [x] 현재 코드 3개 파일과 개발/빌드 원본 보고서 2개의 SHA-256이 `verification.json`의 최종 검증 기록과 일치했다. typecheck·lint·unit100·build·개발/빌드38씩은 앞선 실행 결과이며 이번 검토에서 다시 실행한 수치로 표시하지 않는다.
- [x] 추가로 기존 5173 미리보기에서 인라인 Node/Playwright 명령으로 Chromium `1440×900`, `hasTouch=true`를 실행했다. CDP 터치 드래그(배경→입력)는 초안을 유지하고, 배경 탭은 닫혔다. 모달 진입 전 `overflow: clip !important`를 적용한 격리 브라우저에서 종료 후 값·priority 복원을 확인했다. 요청 차단 없이 관찰한 실제 API/외부 요청·console/pageerror는 0건이다. 이 점검은 실제 터치 기기 검증이 아니며 브라우저 종료로 시험 상태를 정리했다.
- [x] 수정 문서의 로컬 링크 3,203개, 원본 PNG 해시 23개, 85 G·22 R·107 순서·134흐름 배정·455개 원본 메모 및 과거 G01 검증 이력을 다시 대조했다. 링크 누락·원본 변경·완료 상태 승격은 없었다. 후속 기록 반영 뒤 로컬 링크 3,204개와 diff 검사도 통과했다.
- [ ] 원본 시각 동일성·미확인 자산/촬영 조건·실제 OS IME/실기기/추가 브라우저 대기는 유지한다. 커밋은 이번 보완을 보존하는 것이며 G01 전체 완료 판정은 아니다.

## G04 소비 연결 확인 — 2026-11-24 KST

[G04 현재 결과](G04_RESULT.md#g04-r4-recheck). 기존 Dialog·공급자·Reset/사용자 격리를 G04 DOM 회귀에 포함하고 Chrome native Tab/Escape·초점과 G79 분기를 확인했다. 공통 UI/공급자 코드는 변경하지 않았다. 기존 결과·체크와 이 Goal 전체의 잔여는 보존한다.

## G05 소비·재검토 기록 — 2026-11-24 KST

- [x] Dialog 닫기/초점·공개 공급자 메모리 scope/Reset·기존 목 회귀. [G05 이번 결과](G05_RESULT.md#g05-r4-recheck)에 근거를 기록했다. 전체 단위/DOM143개는 이번 실행 수치이고 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/네트워크·원본/시각 대기와 이 Goal 전체 상태는 유지한다. 이 기록은 G05의 공통 소비 영향 확인이며 이 Goal 전체의 R4 재검토/신규 착수가 아니다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 공통 Dialog의 로컬 안내 닫기/초점 DOM, 목 시나리오·Reset·출발 만료·늦은 조회 격리. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-update"></a>
## G07 직접 연결 소비 검토 — 2026-11-24 KST

- [x] 공통 목/Reset·사용자/workspace 수명, 인계 snapshot 격리와 기존 공통 UI 회귀. [G07 근거·검증](G07_RESULT.md#g07-r4-recheck). 전체30파일166/166 중 이번 생성기11시나리오이며 과거 수치와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 미수록·환경 대기는 유지한다. 이번 흐름 밖의 업무 전체·R4 전수 재검토를 수행한 것이 아니다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] 공통 Dialog의 네이티브 취소/초점 복귀·이력 종료, 목 Reset/수명 소비만 검증했다. 공통 실행 코드는 유지했다. [상세 판정·근거](G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] 가상 세션/공개 메모리 scope·Reset·새 공급자 수명과 공통 root 이력 관찰을 소비했다. Dialog 실행 코드는 유지하며 G01 전체 재검토가 아니다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.

<a id="g10-update"></a>
## G10 적용·연결 검토 — 2026-11-24 KST

- [x] 기존 공통 Dialog/메모리·Reset 수명을 소비했다. 가입 진행 초점/폼 잠금과 오류 해제를 G10 안에서 보완했고 G01 전체 재구현은 없다. [상세 판정·근거](G10_RESULT.md#g10-r4-recheck).

- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G10 결과8절에 기록했다.

<a id="g11-update"></a>
## G11 적용·연결 검토 — 2026-11-24 KST

- [x] 공통 LocalCaptcha 오류 live 안내·인증 취소 초점을 보완하고 세션/revision/목 scope·공통 Dialog 소비와 기존 전체208 회귀를 수행했다. 공통 전면 교체나 G01 전체 재검토는 아니다. [상세 판정·근거](G11_RESULT.md#g11-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록 정책은 대기다. 연결 G/R 전체 완료가 아니며 후속 담당은 G11 결과8절을 따른다.

> G11 커밋 전 추가 검토: 공통/공유 로그아웃→빈 로그인·저장 회사명 일관성 보완, G11 14/전체211 통과. 과거208 기록과 다른 Goal 대기는 보존하며 로컬 커밋만 승인되었다. [최신 결과](G11_RESULT.md#g11-precommit-review).
