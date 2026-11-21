# G02 재점검·보완 결과

2026-11-20 KST. **이번에 재현한 동작 결함 수정·2차 코드 검토·Chromium 검증 완료. 17상태 시각 비교 수행. 원본과의 잔여 시각 차이·미수록 원본 동작·추가 환경 검증 대기. G02 전체 완료 판정은 보류한다.** 이전 실행은 [G02 최초 결과](G02_RESULT.md)의 1~7절이며 아래 명령·캡처와 구분한다.

## 1. 작업 경계와 선행 확인

- 시작 커밋 `91e7ac4c`, Git clean. 기존 G02를 유지하고 아래 결함만 보완했다. 사용자 변경·삭제 없음. 시작 시 실행 중인 FE 리스너가 없어 `http://127.0.0.1:5173/`에 FE만 실행했다. 종료 시 이 미리보기를 유지한다.
- AGENT README, PM036·UX025, FRONT_AGENT README·결정006·User Web 구조·컴포넌트·상태·mock·웹 접근성·주석·테스트·엔지니어링 검토 기준, 계획 README·순서표·시작·재현·목 상태·공개 웹·사용자 흐름, G02/R01 명세와 G00/G01/R01/G02 결과를 대조했다. 적용되는 추가 AGENTS.md는 없었다. BE/AGENTS.md는 작업 범위 밖이다.
- AGENT README의 `AGENT_USAGE_RULES.md`는 없다. 기존 문서의 실제 인증/API 연결 단계는 결정006과 이번 지시로 적용하지 않는다. 일반 문서의 Windows 명령보다 현재 package.json·macOS 환경을 적용했다.
- G00 조사 결과와 G01 메모리 runtime/provider/router/공통 UI를 대조했다. G01 내부 앱 Outfit/Lucide의 원본 동일성 대기는 공개 Gellix 확인과 별개다. G01 기능 회귀 7개를 이번 코드에서 다시 실행했다.
- R01은 기존 정적 분석·후속 배정까지 수행돼 있었지만 R01/G02 명세와 PLAN-INDEX는 미착수였다. 결과에 맞게 동기화했다. 누락된 `r01-destination-map.json`은 현재 `navigation-content.json`의 원본 href·로컬 경로·담당 Goal·사용 위치에서 재작성했다. 이를 과거 파일의 복구나 신규 보관본 조회로 표현하지 않는다.
- G03 이후 본문, 가입 G10·로그인 G11 전체 화면, Backend·HTTP adapter·API 계약·DB·환경 파일·의존성 버전은 변경하지 않았다. 커밋·push·배포 없음.

## 2. 이번 원본 확인과 버전

[MCP 재조회 기록](evidence/g02-recheck/mcp-sources.json): 앱 `bonsai-web`, `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 카탈로그 `Latest / 2146`. 6흐름 49단계의 목록을 반환받았으며 실제 G02 시각 대조는 아래 **17상태**다. 나머지 단계는 목록 확인이며 후속 Goal 조사·구현 완료가 아니다.

| Flow | 이번 소비 단계·화면 | 근거 용도 |
| --- | --- | --- |
| Landing page `f1a89cc0-4dc8-4576-b912-78231a2a7b1a` | 01~11, 각 Screen ID는 manifest와 기존 G02 3절 | 본문·후기·금융·브랜딩·지원·푸터 |
| Logging in `a02409b3-6eb0-4bc0-b702-22a42e0990c8` | 01 `sc_07904520440b4dc7ad7d6d31bf3a03e9` | 누락된 랜딩 최상단 hero만 보완 |
| Products (CRM) `12ca870d-d929-4cc8-ab4c-60436c2eac13` | 01 `sc_2ce9fd14ccb74e05977de48b5517e78c` | Product 메뉴 |
| Industries (Consulting) `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` | 01 `sc_b71347cc8821454593507a2b9cb4a512` | Industries 메뉴 |
| Blog `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` | 01 `sc_549a6fa823b74e3e8d826750df6f1f99` | Resources 메뉴 |
| Invoice templates `a0181c28-2521-46d3-a0e6-3ead4851b2f9` | 01 `sc_d68dbb7304bb45ac9755138b12ce3141`, 02 `sc_eac8d5a2e97d47c496455da557912622` | Templates 기본/Invoice 선택 |

로컬 ANALYSIS의 관찰·전환·질문을 확인하고 원본 PNG로 만든 좌 원본/우 구현 비교 이미지 17개를 직접 시각 검토했다. hero 원본 PNG도 별도로 열었다. MCP 썸네일 반환만으로 원본을 본 것으로 계산하지 않는다. CDN PNG 바이트 재다운로드·실계정 실행·공식 홈페이지/보관본 신규 조회는 수행하지 않았다. Gellix와 2024-02-03 보관본 자산의 기존 출처 기록을 재사용했으며 현재 웹의 다른 디자인을 섞지 않았다.

카탈로그 버전은 제품 빌드가 아니다. 제품 빌드·촬영 시점·OS·DPR·원본 scrollY는 여전히 미확인이다. 보관 날짜를 Gummble 촬영 날짜로 쓰지 않는다.

## 3. 1차 검토 → 수정 → 2차 재검토

| 발견·재현 | 원인·수정 | 재검토 근거 |
| --- | --- | --- |
| 390×844에서 Toggle navigation → Product → Toggle navigation: `aria-expanded=false`인데 하위 메뉴가 계속 보임 | 모바일 탐색과 하위 메뉴가 독립 토글. `toggleMobile`에서 하위 메뉴도 초기화 | [수정 전](evidence/g02-recheck/mobile-close-before.png) / [수정 후](evidence/g02-recheck/mobile-close-after.png), 신규 E2E |
| 모바일 메뉴 높이가 줄 수·확대와 무관하게 top132/166px로 고정 | 탐색과 하위 메뉴를 일반 배치로 연결하고 모바일 헤더 하나가 최대100dvh에서 스크롤하도록 변경 | 메뉴 경계가 탐색 버튼 아래임을 실제 bounding box로 확인. 390×500에서 마지막 유형→추천 링크 키보드 접근 [캡처](evidence/g02-recheck/mobile-template-after.png) |
| 열린 메뉴에서 데스크톱↔모바일 전환 시 메뉴·초점이 숨겨진 상태로 남음 | media change에서 메뉴 초기화·초점 복귀. CSS가 먼저 초점을 body로 옮기는 경우 마지막 헤더 초점 추적 | 최초 추가 테스트에서 초점 복귀 1건 실패→원인 수정→해당 2시나리오 통과→전체 dev/build 통과 |
| 이메일 폼 `requestSubmit()` 연속 2회 후 뒤로 한 번: `/signup`에 남음, history length4 | 동기 제출 가드 없음. ref로 제출 수명을 잠그고 성공한 입력을 한 번만 인계 | 기존 이메일 E2E에 연속 제출·뒤로 한 번 `/`·입력 유지 추가. invalid 수정·IME·취소·재진입도 유지 |
| hero Expense deducted 카드의 왼쪽 경계가 원본보다 오른쪽 | 자동 폭 약221px. 정규화 원본의 폭을 비교하여225px로 보정 | hero MAE4.8180→4.7081, 관련 메뉴5상태도 감소. 원본 CSS 값 확정이 아닌 시각 측정값 |
| Playwright 서버 명령이 `pnpm.cmd` 고정 | macOS에서 사용할 수 없는 실행 파일. 설치된 Vite CLI를 Node로 실행 | dev5175·build4175 양쪽 실제 구동 및 테스트 통과 |
| 캡처를 다시 실행하면 이전 증거 폴더를 덮음 | 캡처·비교 스크립트에 선택적 `CAPTURE_OUTPUT` 추가 | 기존 evidence/g02 보존, 이번 before/final 분리 |
| 명세·색인의 미착수와 구현 결과 불일치, R01 목적지 근거 링크 누락 | 최초 결과와 상태 문서 연결 누락 | G02/R01·순서·색인·확장 대기표·현재 상태 갱신, 목적지 색인 재작성 |

1차 검토는 기존 코드·원본·새 캡처·초기14/14 E2E와 별도 결함 재현을 사용했다. 기존 테스트 통과가 미검증 조작의 결함 부재를 뜻하지 않았다.

2차 검토는 수정 diff, 상태 소유권·리스너 정리·한글 책임 주석·실제 navigation·개인 입력 수명·네트워크 경계, 수정 후 이미지와 아래 실행 결과를 대조했다. 메뉴 상태는 hook, 인계 입력은 기존 provider, 제출 수명은 폼 ref가 소유한다. 새 서버 호출·전역 저장소·의존성·거대한 컴포넌트는 추가하지 않았다. 리뷰와 테스트 실행은 별도 활동으로 기록한다. 재현한 동작 결함의 회귀는 해결됐고, 아래 시각 차이·미확인은 남아 있다.

## 4. 현재 실행한 검증

실행 디렉터리 `FE/user-web`, `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 적용. Node24.18.0 / `corepack pnpm`8.14.1. 셸 기본 Node22/pnpm10을 그대로 사용하지 않았다.

| 명령·확인 | 이번 결과 |
| --- | --- |
| `corepack pnpm dev --host 127.0.0.1 --strictPort` | FE5173 실행·유지. Backend 실행 없음 |
| `corepack pnpm typecheck` | 통과 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | Vitest9/9 통과 |
| `corepack pnpm build` | 통과. JS393.18kB/gzip121.58kB, CSS35.89kB/gzip8.16kB |
| 초기 `corepack pnpm test:e2e --workers=2` | 기존14/14 통과. 수정 완료 근거와 구분 |
| `corepack pnpm test:e2e --grep 'mobile close' --workers=1` | 초점 복귀1건 실패, 수정 후 다음 실행에서 확인 |
| `corepack pnpm test:e2e --grep 'mobile close\|email validation' --workers=1` | 2/2 통과 |
| 최종 `corepack pnpm test:e2e --workers=2` | dev5175 Chromium15/15 통과, skip/flaky0 |
| `corepack pnpm test:e2e:preview --workers=2` | build4175 Chromium15/15 통과, skip/flaky0 |
| `CAPTURE_OUTPUT=<이번 before 또는 final 절대 경로> node scripts/capture-landing.mjs` | 각각 desktop17상태+390px전체 화면 캡처, 각각1649 정적 요청·위반0·오류0 |
| `CAPTURE_OUTPUT=<동일 경로> /tmp/onehand-visual-venv/bin/python scripts/compare-landing.py` | Pillow13.0.0, 각각17 pair/overlay/diff 생성 |
| 별도 `node --input-type=module` Playwright 브라우저 조작 | 모바일 닫기·짧은 화면 키보드·연속 제출 뒤로·모든 유형 링크·정상 Reset, [기록](evidence/g02-recheck/browser-check.json) |

[검증 요약](evidence/g02-recheck/verification-summary.json), [개발 원본 보고서](evidence/g02-recheck/e2e-results.json), [build 원본 보고서](evidence/g02-recheck/e2e-preview-results.json), [초기 보고서](evidence/g02-recheck/e2e-initial.json).

문서 마무리에서 `git diff --check`와 Python 표준 라이브러리 검사를 실행했다. 수정 문서의 로컬 링크와 JSON을 확인했고 누락 링크는 없었다. 계획은 85 Goal·22 R·134흐름·107실행 순서를 유지하며 G02/R01 외 Goal 상태·흐름 배정·실행 순서는 바꾸지 않았다. [문서 검사 기록](evidence/g02-recheck/document-check.json).

실제 Chromium148.0.7778.96에서 실행했다. navigation과 네트워크를 mock/차단하지 않았다. 모든 E2E는 context 단위로 새 탭까지 요청·실패·콘솔을 관찰한다. dev/build 각각15시나리오에서 인증·업무·외부 API 요청0, 요청 실패0, console/page 오류0. 조사용 MCP 호출은 FE 런타임과 구분한다. DOM 링크171개는 모두 같은 로컬 origin이다. 링크 목적지의 후속 화면 구현 완료를 뜻하지 않는다.

관련 범위: 직접 URL·reload·back/forward·새 탭·메뉴 hover/click/Escape/outside·템플릿 방향키/Home/End·후기/금융/브랜딩 선택·푸터 펼침·스크롤 복원·입력 오류/수정/취소·합성 IME·중복 제출. 폭320/360/390/768/1024/1440/1920, CSS zoom200%, reduced motion을 확인했다. G01 목록/상세/편집·실패 재시도·취소·늦은 저장·계정/workspace 격리·Dialog도 회귀 통과했다. [현재 Dialog](evidence/g02-recheck/production-reference-dialog.png).

실제 OS 한글 IME·스크린리더·물리 터치는 자동화 입력/viewport로 대체 검증할 수 없어 미수행이다. Firefox/WebKit/Safari는 현재 설치·설정한 Chromium 프로젝트의 검증 범위 밖이며 실행하지 않았다. 합성 composition·CSS zoom을 실제 OS 검증으로 표현하지 않는다. Browserslist 자료 노후화와 FORCE_COLOR/NO_COLOR는 도구 경고이며 브라우저 오류가 아니다. 임시 목 상태는 마지막 `Reset preview`로 normal/guest를 확인했다.

## 5. 시각 비교와 남은 차이

원본 PNG2880×1800을 Lanczos1440×900으로 정규화하고 실제 Chromium viewport1440×900/DPR1과 비교했다. 원본 scrollY를 알 수 없어 동일한 관찰 요소의 y위치로 맞췄으며 [최종 캡처 기록](evidence/g02-recheck/final/capture-evidence.json)에 실제 위치를 남겼다. 원본과 실제 CSS viewport/DPR·scrollY가 확정적으로 같다고 주장하지 않는다. 폰트와 로컬 이미지 로드 완료 후 캡처했다.

| 범위 | 이번 대조·잔여 |
| --- | --- |
| hero·공통 메뉴 | Gellix400/500/600/700, h1 60/60/700, nav16/20/500·자간.25, 본문18/21, 폭1064/1280, 버튼48, email420×48. Expense 카드225px 보정. 글자 raster·일부 색·그림자·아이콘과 인물 자산 차이 잔존 |
| 랜딩01~04 | 대시보드·폰 비율, 3열 정렬, 후기1100×380/사진301×301·quote28/36 대조. 사진의 색/안경 반사·배경 패턴·그림자 차이 잔존 |
| 05~08 | 금융 이미지·선택 화살표, 브랜딩3패널·강조선, 후기 칩·지원 섹션 대조. 이미지 선명도/그림자·리뷰 칩 폭·지원 잎 이미지 변형 차이 잔존 |
| 09~11 | 최종 CTA,5열 푸터·링크·SNS·고지 대조. 작은 문자의 raster/간격·합성 italic 차이 잔존 |
| 모바일 | 닫힘·폭 전환·메뉴 높이/스크롤/포커스 수정 및 캡처. 원본 모바일 자료가 없어 시각 동일성은 미판정 |

[수정 전 비교](evidence/g02-recheck/before/comparisons), [최종 비교17개](evidence/g02-recheck/final/comparisons), [최종 MAE](evidence/g02-recheck/final/visual-metrics.json). 각 `*-pair.jpg`는 좌 원본/우 구현이고 같은 이름의 overlay/diff도 있다. 원본 파일 경로는 visual-metrics의 `source`에 모두 기록했다. 색 보정·마스킹 없이 계산했으며 MAE를 일치율이나 합격률로 사용하지 않는다.

hero MAE4.8180→4.7081. 메뉴5상태도 Expense 카드 보정으로 약0.11씩 감소했다. 랜딩01~11 PNG는 수정 전후 바이트가 같아 데스크톱 본문의 불필요한 변경이 없음을 확인했다. 1차에서17상태를 보고, 2차에서 변경된 hero·메뉴5상태와 모바일 결과를 다시 보았다. 잔여 차이를 OS 탓으로 일괄 처리하거나 시각 완료로 올리지 않는다. 원본과 동일한 자산 변형·촬영 환경 확보 및 추가 시각 보정은 G02 소유로 남긴다.

## 6. 목 가정·미검증·후속 메모

- 원본 관찰: 랜딩11단계·hero·메뉴4종·Invoice 유형 전환, 후기01/03, 금융/고객경험의 표시 상태. 이미지 안의 업무 버튼은 홍보 이미지다.
- 기존 보완 근거 유지: Gellix와47자산·후기02·일부 링크는 R01의2024-02-03 보관본 기록. 이번에 보관본을 새로 실행한 것은 아니다.
- 목/접근성 가정: 수동 후기/금융/브랜딩 전환, 초기후기03/금융0/브랜딩2, hover/click·Escape·키보드·모바일 배열. 자동 전환 주기·실제 원본 hover/focus/모바일은 정적 MCP만으로 확정하지 않는다.
- 이메일은 메모리 인계만 한다. 뒤로 유지, 취소·revision·Reset·reload·새 탭에서 삭제. 정적 본문에 업무 조회 로딩/실패·서버 재시도를 인위적으로 추가하지 않았다. 자산은 정상 로드 확인이며 이미지 장애 주입·복구 검증은 이번에 수행하지 않았다.
- 실제 가입/로그인 전체 화면·가입 서비스 실패·메일 발송은 G10/G11 후속 목 범위다. 공개 목적지 본문은 G03~G09 소유이며 미구현 표시를 유지한다. 이번 수정이 후속 Goal 착수를 뜻하지 않는다.
- 원본 자산 사용 조건·정확한 촬영환경은 미확인. 현재 비교는 로컬이며 배포하지 않았다. 최신 금융 지원국·보험·체험/환불·동의·계정·서버 영속성 정책은 UX/UI 이후의 메모이며 API/DB 설계로 확대하지 않았다.

## 7. 현재 미리보기에서 확인할 순서

1. `http://127.0.0.1:5173/`를 열고 Product hover→Escape→Enter→외부 클릭을 확인한다.
2. Templates→방향키로 Invoice→See all templates→G06 대기 표시→뒤로/앞으로를 확인한다.
3. hero에 `invalid`→오류·입력 유지→`preview@example.test`→Start free→가입 인계→뒤로 한 번→입력 유지→다시 제출→Cancel and clear draft를 확인한다.
4. 후기01/03, Banking, Doc templates, 푸터 Contracts 펼침/닫기·Privacy→G09→뒤로 스크롤 복귀·최하단 CTA를 확인한다.
5. 폭390에서 Toggle navigation→Product→Toggle navigation으로 모두 닫힌다. Templates의 End/Tab으로 아래 링크에 접근하고 Escape 두 번으로 닫는다. 열린 메뉴에서1440↔390 전환 시 메뉴 초기화·보이는 트리거 초점을 확인한다.
6. `/components`에서 Dialog를 키보드로 열고 닫는다. Preview controls→Reset preview로 normal/guest를 확인한다. DevTools Network에는 로컬 정적 리소스·개발 HMR만 있어야 한다.

이번 작업은 여기서 종료한다. 커밋 해시 추가 없음. G03 자동 진행 없음.

## 8. G03 공통 요소 변경과 회귀 — 2026-11-21

위1~7절은 G02 재점검 당시 기록이며 재점검 커밋은 `da60df02`다. 이후 별도 요청한 [G03 작업](G03_RESULT.md)에서 다음 공통 부분만 확장·수정했다. 이번 G03에서는 커밋하지 않았다.

- 랜딩 이메일 폼을 동일한 `SignupForm`으로 추출하고 pathname별 입력을 분리했다. 기존 랜딩 검증/합성 IME/중복 제출/뒤로/취소 정책은 유지한다.
- 여러 소개 가입 인계를 오가면 단일 최신 intent가 이전 가입 이력을 덮는 문제를 수정했다. history에는 opaque ID만, source/email/returnTo는 메모리 snapshot으로 보관한다. source별 취소는 그 경로의 초안·인계를 폐기하고 다른 소개 초안을 유지한다.
- PublicHeader는 사용자가 선택한 G01 가상 세션일 때 Go to dashboard를 표시한다. 익명 스크롤은 세션을 바꾸지 않는다. 소개 화면의 scrolled top:0 스타일은 G03 class로 한정했다.
- `/crm`·`/software/consulting`·`/software/small-businesses`는 실제 G03 소개로 연결했다. G02 테스트의 기존 pending 기대만 현재 소유 화면에 맞춰 변경하고, 미수록 G03 목적지 검사는 `/scheduling`으로 유지했다.
- 이번 typecheck/lint/build·unit9·dev/build Chromium각22 전체 검증에서 G01/G02도 다시 실행했다. 모바일 메뉴 닫기·짧은 높이 내부 스크롤·폭 전환 초점, 이메일 오류·합성 IME·중복 제출·뒤로/취소·Reset, 실제 navigation과 scope/경합 검증이 통과했다. 실제 API/외부 요청·실패·console 오류0. [현재 검증 기록](evidence/g03/verification-summary.json).

G02 시각 잔여·원본 모바일/자동 전환·OS IME/AT 대기는 유지한다. G03에서 공유 메뉴2상태를 다시 비교했지만 G02 전체17상태의 잔여를 해소했다고 판정하지 않았다. G03 추가 구현을 G02/R01 전체 완료로 처리하지 않는다.

## 9. G04 공통 인계·목적지 변경과 회귀 — 2026-11-21

위 기록은 각 당시 실행 결과로 보존한다. 이후 별도 요청한 [G04 작업](G04_RESULT.md)에서 가격/후기 실제 화면을 연결하고 공개 인계에 선택 snapshot·sourcePath·query 포함 returnTo를 추가했다. 랜딩의 경로별 이메일·중복 제출·취소·뒤로 복귀 정책을 유지한다. G02 테스트의 Pricing/Reviews 미구현 기대만 새 실화면에 맞췄다. 공통 메뉴·푸터의 디자인과 다른 목적지는 교체하지 않았다.

최종 typecheck/lint/build, unit 11/11, 개발/빌드 Chromium 각 29/29에서 G01/G02 회귀를 다시 실행했다. 모바일 메뉴 닫기·짧은 화면 내부 스크롤·폭 전환 초점·이메일 오류/합성 IME·중복 제출·입력 보존·취소/뒤로 복귀를 포함한다. 실제 API/외부 요청·요청 실패·console 오류는 0건이다. [G04 검증 기록](evidence/g04/verification-summary.json)을 근거로 하며 이전 통과 수치를 재사용하지 않았다. G02 전체 17상태를 다시 캡처한 것은 아니며 기존 시각·원본 동작·OS/추가 환경 대기는 그대로다. G04 변경을 G02/R01 전체 완료로 처리하지 않았다.


## G05 연속 작업의 공통 회귀 — 2026-11-21 KST

공개 QueryScope 추가·SignupForm 버튼 문구의 선택 prop만 추가했다. 기존 기본 문구·메뉴 동작은 유지한다. 메뉴 테스트의 가려진 제목 클릭을 실제 노출 영역 클릭으로 수정했다. 현재 변경에서 dev/build Chromium 전체각33/33이 통과했고 API/외부 요청·요청 실패·console 오류0이다. 이전 시각·원본 동작·환경 대기는 완료로 변경하지 않았다. [G05 검토·검증](G05_RESULT.md).

## 2026-11-21 G06 공통 회귀 기록

[G06](G06_RESULT.md)에서 공개 인계에 템플릿 snapshot을 확장하고, 새 문서 default 이력 키가 다른 경로 스크롤을 복원하는 결함을 pathname+search+key로 수정했다. 기존 이메일/가격·메뉴·상세 복귀를 포함한 전체 dev/build 각38개 통과, 실제 API/외부/실패/console0. G06 마지막 시각 변경은 대상5개씩 추가 통과. 이 결과로 기존 원본·시각·환경 대기를 자동 완료 처리하지 않는다.

G09 연속 작업 회귀: 공개 소셜 링크에 출발 이력을 추가해 회사 페이지에서 돌아올 때 실제 back/scroll을 복원했다. Privacy 테스트는 목 G09 문구 대신 실제 제목·본문을 확인한다. G09 최종 전체 dev/build51에 기존 G01/G02 회귀 포함. 기존 시각/환경 대기는 유지. [G09](G09_RESULT.md).

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G11 공통 회귀 (2026-11-21)

인증 전용 로그인/실제 계정 검증/보호 returnTo 변경 뒤 관련 dev·build26씩 통과. 기존 공개 이력·메뉴·Reset·G01 same-ID/격리·G10 가입을 재검사했다. 이전 원본/시각/환경 대기를 올리지 않는다. [G11](G11_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 최종 공통 회귀 (2026-11-21)

[최종 코드 검증](evidence/g15/final-verification.json)의 전체 개발/빌드82개씩에 기존 기반·공개 메뉴/폼·소개·가격/후기 흐름을 포함했다. G03의 이전 Public 테스트 명칭을 실제 Public site로 바꿨으며 검증을 제거하지 않았다. 기존 원본·시각·환경 대기를 완료 처리하지 않는다.
