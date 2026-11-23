# G02 재점검·보완 결과

> 현재 결과 — 2026-11-23 KST: [G02 R4 재검토](#g02-r4-recheck), [추가 검토·같은 목적지 재선택 보완](#g02-followup-review). 메뉴 초점·후기 강조 보완 및 단위/DOM 검증 수행. 시각 동일성·실제 브라우저 상세/네트워크 검증은 대기다. 아래 과거 실행과 구분한다.

> 후속 감사 수정: [G01~G15 재점검 결과](G01_G15_RECHECK_RESULT.md). 아래는 해당 단계 당시의 실행 기록이며 최신 결함 수정/검증과 구분한다.

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


<a id="g02-r4-recheck"></a>
## 10. G02 R4 재검토·보완 — 2026-11-23 KST

**판정: 원본 주요 구성·코드 대조, 메뉴 초점 보완·DOM 회귀 수행 / 엄격한 시각 동일성·실제 브라우저 상세 검증·원본 미수록 분석 대기. G02 전체 완료 아님.** 아래는 시작 HEAD `3fbe241d90265fe1acbb7b7a3c279a8efb014dfd` 이후 이번 실행만 기록한다. 위의 과거 Chromium/픽셀 수치를 이번 결과로 재사용하지 않았다. 커밋·push·배포·다음 Goal 착수 없음.

### 10.1 범위·선행 확인·분류

- 시작 작업 트리 clean, main은 origin보다 2커밋 앞섬. G00의 근거·배정 감사와 G01 모달 동작 보완을 이어받았다. G01 전체 완료를 전제로 삼지 않았다.
- 주대상: 랜딩 01~11·hero·공개 메뉴·이메일·CTA·본문 선택·푸터. 연결: 실제 PublicLayout 소비 화면, G10/G11 입력 인계와 취소/이력 복귀. G03 이후 본문, R01 전체 조사, G01 재구현, G32 이후는 제외했다.
- 적용 규칙 전체 확인: AGENT README, FRONT_AGENT README·결정006/005, User Web 구조·상태/데이터·mock 개발·테스트, 컴포넌트·접근성/레이아웃·주석·User Web 컨벤션, ENGINEERING_REVIEW_CHECKLIST, PM036·UX025. 적용되는 상위/대상 AGENTS는 없고 BE/AGENTS는 범위 밖이다. 없는 AGENT_USAGE_RULES는 읽은 것으로 처리하지 않는다.
- 계획 README·START-CHECKLIST·UXUI-REPLICATION·PUBLIC-WEB·G02 명세와 기존 G02 결과를 확인했다. 큰 COMMON 문서와 PLAN-INDEX는 G02/R01/연결 G의 관련 절·필드를 확인했다. G00 현재 감사/추가 점검/인계, G01 최초 결과의 구조와 재검토의 변경/검증/잔여, R01 결과의 목적지·목 가정·후속 보완, G01_G15의 CTA 중복 수정, G10/G11/G14 명세·결과의 인계/취소/복귀를 확인했다. 모든 G/R/RESULTS 문서를 전수 읽은 것은 아니다.
- SOURCE_ANALYSIS_STANDARD의 12개 기준, SOURCE_ANALYSIS_REVIEW의 범위·한계·후속 기준을 적용했다. Landing ANALYSIS는 전체 단계·규칙·질문을, 추가 6흐름은 아래 소비 단계와 관련 규칙/질문을 확인했다. 원본 분석 정본은 수정하지 않았다.

| 판정 | 이번 대상·이유 |
| --- | --- |
| 유지 | 정적 홍보 목업, 수동 후기/금융/브랜딩 선택, 5열 푸터·9개 disclosure·SNS·법적 고지, pathname별 이메일과 history ID별 intent, CTA 중복 방지 |
| 구현 보완 | hover 이탈/다른 메뉴 진입/템플릿 유형 진입에 의한 키보드 초점·선택 유실 3경로; Landing07 후기 칩 강조 범위 1곳 |
| 문서 보완 | 현재 R4 대조 상태·원본/목 가정·이번 실행/미실행을 분리하고 G00 읽기 전용 조건과 과거 시각 허용을 이번에 적용하지 않도록 연결 |
| 분석·환경 대기 | 원본 자동 전환/hover/focus/모바일, 정확한 자산·촬영 환경·전수 요소/픽셀 대응, 실제 브라우저 조작·네트워크·OS IME/AT/실기기 |

### 10.2 직접 본 원본과 무결성

기존 로컬 PNG **7흐름 20장**을 view_image로 직접 열었다. 기본 범위 17장에 G10 인계 Onboarding02~03과 G11 진입 Logging in02를 추가했다. 단순 파일 검사와 직접 열람을 구분하며, 전 세계/전체 프로젝트 이미지나 모든 작은 요소를 전수 판독한 것은 아니다. MCP·보관본·운영 서비스 신규 조회 없음.

채택 범위는 저장된 `bonsai-web / Latest / 2146`이다. 카탈로그를 촬영일·제품 빌드로 확정하지 않는다. 기존 Gellix/자산·Laura 후기 보완의 2024-02-03 보관본 이력은 유지하지만 이번 새 조회로 계산하지 않았다. 추가 참조의 단계 소유는 기존 G03/G05/G06/G10/G11 그대로다.

Flow ID: Landing `f1a89cc0-4dc8-4576-b912-78231a2a7b1a`; Logging in `a02409b3-6eb0-4bc0-b702-22a42e0990c8`; Products(CRM) `12ca870d-d929-4cc8-ab4c-60436c2eac13`; Industries `7fcadde8-35c9-4b36-9c76-ec2d4432f20e`; Blog `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb`; Invoice templates `a0181c28-2521-46d3-a0e6-3ead4851b2f9`; Onboarding `f714101f-db6b-4bfe-9ed1-74d6b0d6243c`.

아래 해시는 표시용 앞 12자리이며 실제 검사는 [기존 원본 색인](../../../bonsai_analysis/SOURCE_ANALYSIS_INDEX.json)의 전체 SHA-256과 대조했다. 20개 파일 존재·PNG 2880×1800·전체 해시·단계/ID·단일 담당, 관련 ANALYSIS 해시/ID 연결이 일치했다.

| 흐름·단계 | Screen ID·원본 경로 | SHA-256 앞 12자리 | 기존 담당 |
| --- | --- | --- | --- |
| Landing page 01 | [sc_f832f286d2d74611a3f6486b79cb36ec](<../../../bonsai_analysis/flows/Landing page/screens/01_sc_f832f286d2d74611a3f6486b79cb36ec.png>) | 42a934db17b7 | G02 |
| Landing page 02 | [sc_337ce046f7184e07b2f841009066cf95](<../../../bonsai_analysis/flows/Landing page/screens/02_sc_337ce046f7184e07b2f841009066cf95.png>) | d262173cddfb | G02 |
| Landing page 03 | [sc_2acfdf88f60f4638b4f3f97b6023c9cc](<../../../bonsai_analysis/flows/Landing page/screens/03_sc_2acfdf88f60f4638b4f3f97b6023c9cc.png>) | 11c496bf55f0 | G02 |
| Landing page 04 | [sc_fe9ef5d8bdf049cbabad33e42a6529c1](<../../../bonsai_analysis/flows/Landing page/screens/04_sc_fe9ef5d8bdf049cbabad33e42a6529c1.png>) | 01a5e774dfa0 | G02 |
| Landing page 05 | [sc_b36874f940ae40f085f0df38ee4a95cd](<../../../bonsai_analysis/flows/Landing page/screens/05_sc_b36874f940ae40f085f0df38ee4a95cd.png>) | e99c97bca4fa | G02 |
| Landing page 06 | [sc_b410b2592edd40b99c423c2af0f73f6f](<../../../bonsai_analysis/flows/Landing page/screens/06_sc_b410b2592edd40b99c423c2af0f73f6f.png>) | 12f0dfd16a63 | G02 |
| Landing page 07 | [sc_c817e4443d78499394491227920ac96b](<../../../bonsai_analysis/flows/Landing page/screens/07_sc_c817e4443d78499394491227920ac96b.png>) | 42b543d73c8b | G02 |
| Landing page 08 | [sc_81b8d00c272c4f709e9a04919113069b](<../../../bonsai_analysis/flows/Landing page/screens/08_sc_81b8d00c272c4f709e9a04919113069b.png>) | e000611449c3 | G02 |
| Landing page 09 | [sc_33704472c1d54fda8c9605958d1af9d9](<../../../bonsai_analysis/flows/Landing page/screens/09_sc_33704472c1d54fda8c9605958d1af9d9.png>) | 8494575afaa8 | G02 |
| Landing page 10 | [sc_a1fa28afd409416f88fe3625082ddfac](<../../../bonsai_analysis/flows/Landing page/screens/10_sc_a1fa28afd409416f88fe3625082ddfac.png>) | 69ab19c38c06 | G02 |
| Landing page 11 | [sc_f5d10f7c06c44873bf3b7048ad5e4566](<../../../bonsai_analysis/flows/Landing page/screens/11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png>) | 06335e816e60 | G02 |
| Logging in 01 | [sc_07904520440b4dc7ad7d6d31bf3a03e9](<../../../bonsai_analysis/flows/Logging in/screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>) | 6a7e8c383319 | G11 |
| Logging in 02 | [sc_9d353458318e43e7b25ebbf88fefeaa9](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | 7e2b5926fea2 | G11 |
| Products (CRM) 01 | [sc_2ce9fd14ccb74e05977de48b5517e78c](<../../../bonsai_analysis/flows/Products (CRM)/screens/01_sc_2ce9fd14ccb74e05977de48b5517e78c.png>) | 779b464d282d | G03 |
| Industries (Consulting) 01 | [sc_b71347cc8821454593507a2b9cb4a512](<../../../bonsai_analysis/flows/Industries (Consulting)/screens/01_sc_b71347cc8821454593507a2b9cb4a512.png>) | 82f14d2befb7 | G03 |
| Blog 01 | [sc_549a6fa823b74e3e8d826750df6f1f99](<../../../bonsai_analysis/flows/Blog/screens/01_sc_549a6fa823b74e3e8d826750df6f1f99.png>) | 090fe727a473 | G05 |
| Invoice templates 01 | [sc_d68dbb7304bb45ac9755138b12ce3141](<../../../bonsai_analysis/flows/Invoice templates/screens/01_sc_d68dbb7304bb45ac9755138b12ce3141.png>) | 77f35d19a712 | G06 |
| Invoice templates 02 | [sc_eac8d5a2e97d47c496455da557912622](<../../../bonsai_analysis/flows/Invoice templates/screens/02_sc_eac8d5a2e97d47c496455da557912622.png>) | e83003d42462 | G06 |
| Onboarding 02 | [sc_e0a408a1e1dd4ea39f54dcef37d2bbf7](<../../../bonsai_analysis/flows/Onboarding/screens/02_sc_e0a408a1e1dd4ea39f54dcef37d2bbf7.png>) | 33c4fb0861cc | G10 |
| Onboarding 03 | [sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838](<../../../bonsai_analysis/flows/Onboarding/screens/03_sc_fd0ce8c1c52e47f3a5bc0dd15d3a3838.png>) | 093370688086 | G10 |

원본 표시는 도구의 이미지 열람 축척이며 명시적인 CSS 비교 축척/배율을 설정하지 않았다. 원본 CSS viewport·DPR·scrollY·촬영 조건은 미확인이다. 새 캡처·리사이즈·비교 이미지·픽셀 계산은 하지 않았다. jsdom은 배치 엔진이 아니므로 viewport/DPR/scroll 동일성 측정에 사용하지 않았다. 실제 Chrome의 viewport·DPR·배율도 이번에 측정하지 않았다.

### 10.3 원본·R4·코드 대응과 수용 판정

코드 경로는 `FE/user-web/src` 기준이다. 관찰은 PNG에 보이는 내용, 측정은 파일 치수/해시·검사 횟수, 목 가정은 FE의 조작/수명 정책이다. 정확한 CSS값 추정은 원본 확정값으로 승격하지 않았다.

| 요소군·원본 | 현재 코드·판정 | 남은 범위 |
| --- | --- | --- |
| hero: Logging01, Onboarding02→03 | `landing-hero.tsx`·`signup-form.tsx`, `pages/signup`: 입력 전/후와 다음 가입 폼의 같은 이메일 관찰. 로컬 메모리 전달은 목 가정으로 유지 | 전송/보존 방식·실패 정책은 원본 미관찰, G02/R01·G10/R02 |
| G02-L01 / R4-F082-O01 | `landing-sections.tsx` ProductOverview의 dashboard/phone는 img. 목업 내부 입력/저장 제어 없음. hero는 별도 흐름으로 연결 | 미세 자산/표시 차이 G02/R01 |
| G02-L02 | productGroups 3그룹·12개 링크와 정적 아이콘 유지. 업무 데이터를 생성하지 않음 | 후속 소개 본문 G03 |
| G02-L03~04 / O02 | Testimonials의 인물/본문/사진/aria-pressed/01·03 표시가 같은 선택 상태를 사용. 초기 Alexandre03→수동 Alison01 검증 | 자동 재생·시간·애니메이션은 미확인. Laura02는 기존 보관본 보완, G02/R01 |
| G02-L05~06 | FinanceOverview/ClientExperience의 이미지·선택 버튼·강조 상태 유지. 초기 Invoicing/White labelled 및 추가 진행선의 캡처 상태와 이후 수동 선택 구분 | 자동 전환·금융/브랜딩 실제 정책 미확인 |
| G02-L07 | ReviewHighlights·landing-content: 18개 칩 중 `Clients take me more seriously`에서 `Clients `는 흐린 부분, `take me more seriously`만 강조하도록 수정 | 글꼴 raster·칩 폭·따옴표 색/행 배치 등 픽셀 동일성 대기 |
| G02-L08 | SupportAndTrial의 채팅 이미지, Contact us→/support, Get started→/signup 유지 | 실제 문의·환불 조건은 후속 G08/R01 |
| G02-L09~11 / O03 | 가입 배너·5열 footer·8종 Templates+Comparisons 펼침·SNS2개·FDIC/2023 고지 유지. 원본은 닫힌 화살표, details 열림은 기존 보완/목 접근성 정책. scrolled 헤더의 desktop top52 CSS 유지 | 고정 헤더 위 노출/스크롤 실제 배치, 작은 고지의 줄바꿈·합성 italic 등 시각 대기 |
| G02-M01~04 | PublicHeader: Product 5+5+5+홍보, Industries 4열, Resources Learn/Tools, Templates 7종+All Templates 및 Contract/Invoice 목록 유지. 마우스·키보드 혼합 입력 3결함 보완 | hover/click·닫힘 원본 동작 미관찰. 이번 보완은 접근성 목 정책 |
| R4-F082-A01 | hero 출처·후기 진행 표시·푸터 문구/메뉴 구조를 연결. 위 구현 보완과 남은 분석을 분리 | 정확한 자산·캐러셀 시간·원본 펼침은 분석 대기 유지; 부모 항목 완료 처리 안 함 |

`navigation-content.json`의 메뉴·템플릿·푸터 **290개 링크 사용 위치**는 유지했다. `localPublicPath`가 외부 원본 href를 로컬 목적지로 바꾸고, 등록된 publicDestinations 모두가 전역404에 빠지지 않는지 실제 router 정의로 검사했다. 이 검사는 모든 목적지를 브라우저에서 클릭하거나 본문 전체를 검증한 결과가 아니다. 미수록 소개/도구 본문은 기존 담당 G03~G09의 대기다.

| 공통 기준 | 이번 결과·잔여 |
| --- | --- |
| R4-C01 식별 | [x] 위 20개 파일/ID/전체 해시/버전·소유 확인. [ ] 촬영 조건 G02/R01 |
| C02 구성 | [x] 주요 셸/목업/섹션/메뉴/푸터와 인증 인계 연결. [ ] 배경 겹침·전체 정밀 명세 |
| C03 요소 | [x] 위 요소군과 제어 연결. [ ] 작은 요소 전수 계수·독립 요소 ID 대응 G02/R01 |
| C04 표시 | [x] hero/메뉴/후기·푸터 주요 문구와 강조 보완. [ ] 모든 줄바꿈·작은 글자 정밀 전사 인증 |
| C05 배치 | [x] 원본 PNG 치수와 CSS/viewport 구분. [ ] 렌더링 위치/간격/스크롤·픽셀 동일성 |
| C06 글자 | [x] 로컬 Gellix400/500/600/700 선언과 기존 출처 확인. [ ] 촬영 당시 폰트 변형·raster·정확 크기 동일성 |
| C07 색·장식 | [x] Clients 칩 강조 범위 수정. [ ] 색값·radius·shadow·따옴표·전체 상태 정밀 동일성 |
| C08 자산 | [x] 정적 목업·사진·로고·장식/폰트 사용 위치 확인. [ ] 원본 정확한 변형/crop·사용 조건 G02/R01, 내부 공통 G01 대기 유지 |
| C09 상태 | [x] DOM 메뉴·선택·입력 오류/재시도·합성 composition 확인. [ ] 원본 미수록 hover/focus/모바일 |
| C10 전환 | [x] jsdom 실제 router/history의 링크·뒤/앞·가입/로그인/취소. [ ] 실제 브라우저 조작/스크롤·원본 전환시간 |
| C11 입력/저장 | [x] pathname별 초안·이력별 intent·선택한 이메일·취소 범위·중복 방지 보존. [ ] 원본 저장/복구 정책 |
| C12 연결 | [x] 공개 소비 경로 17종의 동일 메뉴와 G10/G11 인계 DOM 회귀. [ ] 실제 브라우저 소비 회귀·다른 G 전체 검토 |

공통 기준의 [x]는 명시한 부분 확인에만 해당한다. 전체 R4 요소 명세/시각 인증이나 R01 전체 완료를 뜻하지 않는다.

### 10.4 수정·재검토와 현재 실행

- `hooks/use-public-menu.ts`: 키보드 초점이 헤더에 있으면 hover 이탈로 닫지 않으며, 패널 안 링크에 초점이 있으면 다른 트리거의 우발적인 hover로 패널을 교체하지 않는다. 명시 클릭·Escape·외부 포인터·헤더 밖 blur·폭 전환은 유지한다.
- `components/public-header.tsx`: 템플릿 패널/탭에 초점이 있는 동안 우발적인 유형 hover로 선택/링크를 교체하지 않는다. 명시 클릭/방향키와 포인터만 사용할 때의 선택은 유지한다.
- `data/landing-content.ts`: 위 후기 강조 문구 1곳 수정. CSS·자산·provider·SignupForm·SignupLink·인증 구현은 변경하지 않았다.
- 정식 회귀 `components/public-header.test.tsx` 6개, `app/router/public-entry.test.tsx` 6개 추가. 앱 조립/라우터를 실제로 소비하며 navigation을 mock하지 않았다. jsdom의 matchMedia·scrollTo 환경만 대체했다.
- 수정 전 메뉴 테스트 6개 중3실패로 결함 재현→수정 후6/6. 첫 통합 실행은 전체11개 중1실패: 테스트의 잘못된 `/invoice-templates`를 현재 `/invoice-template`로 바로잡았다. 제품 결함 수정과 구분한다. 이후 전체25파일112/112 통과. 소비 경로를 8종→17종으로 확대한 마지막 대상 재검증 수치는 아래와 연결한다.

| 검사·실제 실행 방식 | 이번 판정 |
| --- | --- |
| Node `/opt/homebrew/opt/node@24/bin/node` | v24.10.0, package의 >=24<25 충족. 기본 Node22/pnpm10 대신 로컬 설치 CLI/API 직접 실행; pnpm8.14.1 요구·lock은 변경하지 않음 |
| `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false` 및 node config | 통과. `tsc -b`의 .tsbuildinfo 쓰기를 사용하지 않음 |
| `node node_modules/eslint/bin/eslint.js . --no-cache` | 통과 |
| `NODE_DISABLE_COMPILE_CACHE=1 node --input-type=module`의 `startVitest('test', [], options, viteOverrides)` | 전체25파일112/112 통과, 54.32초. 기존100개+신규12개. 출력만 사용 |
| Vitest 옵션 | config/configFile:false, run:true, cache:false, pool:threads, execArgv:[], maxWorkers:2, jsdom, 기존 setup/include, default reporter, coverage:false, experimental.fsModuleCache:false, client/ssr optimizer disabled, Vite noDiscovery/include[], watch:null, 기존 React/alias. forks의 임시 모듈 파일과 config bundle 사용 안 함 |
| 최종 대상 2파일 재실행 | 17개 공개 소비 경로를 포함한 메뉴/인계12/12 통과,4.44초. 전체112개 통과 후 테스트 경로 확대만 반영한 재실행 |
| `NODE_DISABLE_COMPILE_CACHE=1 JITI_CACHE=false JITI_FS_CACHE=false node --input-type=module`의 Vite `build` | 통과,1966모듈/4.80초. configFile:false, 기존 React/alias·Tailwind/PostCSS, write:false/copyPublicDir:false/sourcemap:false. HTML/JS/CSS 3개를 메모리에 보관. 디스크 dist/build와 구분 |
| 메모리 FE 미리보기 | Node HTTP로 메모리 번들과 기존 public 파일만 127.0.0.1:5173에 제공. 시작 시 기존 FE 없음; 다른 프로젝트8081 보존. /·/crm·/signup·/login HTML 및 JS/CSS HTTP200. HMR 없는 고정 빌드이며 소스 수정 시 자동 갱신되지 않음 |
| 실제 Chrome 열기 | 기존 Chrome 새 탭으로 / 진입, 앱 효과가 갱신한 `OneHand CRM · Bonsai UI preview` 제목과 URL 확인. 상세 조작/화면 배치 검증은 아님 |
| Playwright·실제 브라우저 상세 검증 | 미실행. 기존 설정의 JSON/실패 screenshot/trace와 fixture의 자동 network-evidence attach, landing 테스트의 명시 screenshot을 확인했다. 라이브러리 브라우저 실행의 임시 profile/artifact 경로를 사용하지 않았고 연결 가능한 기존 CDP 브라우저 없음. Chrome AppleEvents JS도 비활성(error12). 설정을 바꾸거나 금지 산출물로 우회하지 않음 |
| console·네트워크 | 실제 브라우저 요청/실패/console 관찰 미수행. 실제 API·외부 요청0건이라고 판정하지 않음. 코드의 로컬 경계 확인과 서버 정적 응답 검사를 런타임 요청 전수 관찰로 대체하지 않음 |
| 시각 | 픽셀 검증 미실행. 새 캡처 금지와 원본 촬영 조건 미확인. DOM 테스트/원본 열람만으로 시각 동일성 통과 처리 안 함 |

Browserslist 데이터 노후화 경고가 있었으며 의존성/환경을 갱신하지 않았다. 단위 테스트의 실패·취소·늦은 응답 시나리오는 독립 runtime을 사용하고 종료 시 폐기한다. 미리보기는 기본 guest/normal seed이며 장애 설정을 적용하지 않았다. evidence·임시 스크립트·로그·검증 JSON·캡처·trace·보고서를 생성하지 않았다. 자동 캐시/결과 후보 디렉터리의 최근 파일도 별도 읽기 검사에서 발견되지 않았다.

### 10.5 공통 체크리스트·엔지니어링 검토

[START-CHECKLIST](../COMMON/START-CHECKLIST.md)와 [ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 적용 항목을 아래에 남긴다. 공통 템플릿을 프로젝트 전체 완료로 체크하지 않는다.

| 적용 항목 | 결과·코드/근거 |
| --- | --- |
| 범위·Git·선행·출처 | [x] 10.1~10.3. G00 코드 읽기 전용 조건 종료, FE 보완 허용. G01/R01 전체 완료 가정 없음 |
| 책임·props·import·공통 사용 | [x] hover/초점 수명은 기존 hook·TemplateMenu, 표시는 기존 데이터에 유지. app 계층 통합 테스트는 실제 라우터를 소비. 새 패키지·앱 간 import·과도한 공통화 N/A |
| mock·조립·동일 ID·수명 | [x] app-providers/runtime/public-provider·QueryScope·auth 인계 확인; 실제 HTTP/인증/DB 추가 없음. 이메일 메모리/history opaque ID·선택 복사 유지. 새 업무 ID/금액/날짜/CRUD 변경 N/A |
| 상태·scope·비동기·저장 | [x] 이메일 검증/재시도·취소/다른 초안·중복 가드 DOM 회귀; 기존 auth/runtime 단위의 실패/취소/늦은 응답/차수 격리 통과. 정적 메뉴에 업무 로딩/실패를 새로 만들지 않음 |
| 접근성·키보드·의미 | [x] 초점 유실3경로 수정, Escape/외부닫기/합성 폭 변경·터치 hover 무시, 버튼/탭 aria-selected·제출 label/error 연결 확인. [ ] 실제 Tab 순서·키보드/포인터 혼합·AT·터치·레이아웃은 G02/G84 |
| 시각·넓이·스크롤·IME | [ ] 원본 동일성, 좁은 실화면/확대/sticky, 실제 OS IME·기기 미검증. 합성 composition·긴 한국어 값 보존·matchMedia 시험만 통과 |
| 한글 주석·strict·cleanup·성능 | [x] 수정 함수의 기능/이유 주석, 새 전역 리스너/타이머 없음, 기존 effect 정리 유지. strict/lint·빌드·DOM 회귀 통과. 별도 성능 벤치마크 N/A |
| 검증·연결·인계 | [x] 명령·실패/수정/통과와 한계 기록. [ ] 실제 E2E/요청/console 미검증. Admin/BE/배포/실인증 N/A. 문서/JSON/링크/소유 최종 검사는 아래 마지막 점검 |

### 10.6 남은 작업·담당·직접 확인

- [ ] **G02/R01:** 정확한 폰트/자산 변형·그림자/패턴·후기 칩/작은 푸터·합성 italic 등 기존 시각 차이와 전수 요소 대응. 새 캡처가 필요한 픽셀 검증은 현재 사용자 금지로 대기. 작은 차이도 허용 완료로 처리하지 않는다.
- [ ] **G02/R01:** 원본 메뉴 트리거·hover/focus·닫힘, 자동 전환/시간·marquee·아코디언 열림·모바일 시안 미확인. 현재 수동 선택/초점 보호는 목 접근성 가정이다.
- [ ] **G02 및 소비 G03~G11:** 실제 브라우저의 직접 URL·reload·새 탭·back/forward·입력/취소·전체 메뉴 목적지·스크롤·좁은 화면·폭 전환·중복/오류 재시도와 실패 요청 포함 네트워크/console 관찰. 현재 DOM 통과와 별도다.
- [ ] **G01/G02/G84:** OS 한글 IME·스크린리더·실기기·확대·추가 브라우저. G01 기존 시각/환경 대기 유지. 이번 결함은 G02 메뉴 소유로 해결했고 G01 공통 컴포넌트를 추가 수정할 필요는 발견하지 못했다.
- [ ] **G10/G11/R02 및 G13/G14:** 원본 인증/가입 후 복귀·취소/보존 정책 상세. 기존 가상 가입/로그인·온보딩 구현과 회귀 이력은 유지한다. 이번에는 랜딩 인계/인증 왕복만 검사했으며 온보딩 전체를 새 검증하지 않았다.
- 후속 서버 메모: 체험/환불/금융 제휴·국가/보험·법적 효력·인증·메일·서버 영속성은 원본 홍보 문구로 확정하지 않는다. 실제 외부 동작·API 설계는 현재 범위 밖이다.

미리보기 `http://127.0.0.1:5173/`는 메모리 빌드 프로세스가 살아 있는 동안 유지된다. 아래는 사용자가 직접 따라 할 확인 순서이며 이번 실제 브라우저 통과 기록이 아니다.

1. Product에 마우스를 올린 뒤 Tab으로 CRM 링크에 초점을 둔다. 포인터를 밖/Industries로 옮겨도 링크 초점이 유지되는지, Escape로 Product에 돌아오는지 확인한다.
2. Templates에서 방향키로 Proposal 선택→포인터를 Invoice에 올려도 키보드 선택 유지→Invoice 명시 클릭→See all templates→실제 `/invoice-template`→뒤로/앞으로 확인.
3. hero에 invalid 입력→오류→`preview@example.test`→Start free 연속 조작. 가입 Email→Log in→Sign Up→뒤로/앞으로의 같은 입력과 Cancel and clear draft의 출발 초안 삭제 확인.
4. Consulting에서 다른 이메일 초안도 만든 뒤 이전 가입 이력을 취소한다. 다른 pathname의 초안이 남는지 확인한다. 후기03/01·Banking·Client CRM 선택과 푸터 Contracts/Privacy/SNS의 로컬 이동 확인.
5. 좁은 폭 메뉴 닫기·폭 전환·포커스/스크롤과 새로고침/새 탭 메모리 초기화를 확인한다. DevTools에서 요청을 차단하지 않고 실패·console·외부/API 여부를 관찰한다. 새 캡처/trace/보고서는 저장하지 않는다.

### 10.7 종료 전 누락·정합성 재점검

- [x] 위20개 원본의 단계·ID·PNG 치수/전체 해시·담당과 주요 요소/코드를 다시 대조했다. 신규 원본/자산 혼합 없음. 공개 자산/폰트47개 참조의 파일 존재를 확인했다. 정확한 자산 변형/시각 일치 인증은 아니다.
- [x] 메뉴 목적지 등록·실제 앱 router의 이동, 입력 인계/취소/이력, 본문 선택/푸터 및 공통 헤더 소비17경로를 정식 DOM 테스트로 확인했다. 마지막12/12, 최종 타입(app/node)·lint 통과. G01 공통 추가 변경은 없고 기존 목 정책은 유지한다.
- [x] PLAN-INDEX 중복 키·85G/22R/134흐름/754단계/642고유Screen/107순서, 원본 단계 소유/선행 관계 불변,455메모의 원문 해시/담당·표/JSON 판정을 검사했다. G02 외 상태/과거 verification·원본 미인증 플래그를 보존했다.
- [x] 변경 문서 링크/anchor와 JSON 경로를 검사했다. 새 누락0건. JSON 경로414회 중 과거 없는 증거13회는 기존 기록이며 복원/신규 검증에 사용하지 않았다. Markdown 최종 검사 수량은 아래에 기록한다.
- [x] 변경은 FE 소스3개·정식 회귀 테스트2개·기존 계획 문서31개다. 원본 PNG/분석 정본·BE·환경·DB·기존 evidence 변경과 별도 증거/임시/새 결과 문서가 없다. HEAD 유지, git diff --check 통과.
- [ ] 실제 브라우저 상세/네트워크, 시각 동일성·원본 미수록/정밀 요소·추가 환경은 10.6 담당대로 유지한다. 이번 제한을 통과로 바꾸지 않았고 G03/G32를 시작하지 않았다.

문서 갱신 위치: 계획 README, GOAL-WORK-ORDER/START/UXUI/PUBLIC-WEB/MOCK-UI-STATE/USER-FLOW/FLOW-GOAL-MATRIX/FLOW-BEHAVIOR-REVIEW/SOURCE-ANALYSIS-IMPACT/EXPANSION-BACKLOG/PLAN-INDEX, G01~G11 명세, R01·R02의 해당 소비 항목, 기존 G01/G02/G10/G11/R01 결과 및 이 문서. 다른 Goal의 전체 체크를 일괄 완료하지 않았다.

최종 문서 검사: 변경 Markdown30개 로컬 링크3,195회(파일/anchor 포함), 과거 없는 링크67회는 기존 이력으로 분리; 새 오류0. JSON 경로414회·새 누락0, 과거 없는13회 유지. 검사 과정은 메모리/표준출력만 사용했다.


<a id="g02-followup-review"></a>
### 10.8 추가 검토 — 2026-11-23 KST

사용자의 후속 검토 요청으로 현재 변경분·정식 테스트·문서 판정을 다시 검토했다. 10.1~10.7의 1차 실행 수치와 별도이며 원본 PNG를 새로 전수 열람한 기록이 아니다.

- [x] **추가 결함 1건:** `/crm`에서 Product→CRM처럼 현재 pathname을 다시 선택하면 실제 탐색이 일어나도 헤더가 재생성되지 않아 메뉴와 링크 초점이 남았다. 데스크톱·모바일 조건의 정식 회귀 2개가 수정 전 모두 실패했다. 기존 목적지 검사는 다른 경로로의 이동만 확인하여 이 조건을 놓쳤다.
- [x] `features/public-web/hooks/use-public-menu.ts`에서 실제 location key 변경을 관찰해 같은 경로 탐색 뒤에도 하위 메뉴와 모바일 탐색을 닫고, 헤더 안에 남은 초점만 `#main-content`로 인계한다. pathname별 이메일·인계 ID·본문 상태나 전역 RouteFrame은 변경하지 않았다. 같은 경로 선택 시 종료/초점 인계는 목 접근성 정책이며 원본 관찰로 확정하지 않는다.
- [x] `app/router/public-entry.test.tsx`에 데스크톱·모바일 재선택 2조건 추가. 실제 router의 location key 변경·메뉴 닫힘·모바일 닫힘·본문 초점을 함께 검사한다. navigation을 mock하지 않았고 matchMedia만 합성했다.
- [x] 10.4와 같은 저장 없는 옵션으로 대상 2파일 **14/14, 4.46초**, 이후 전체 **25파일 114/114, 53.49초** 통과. 이전 112/112 및 12/12는 1차 기록으로 보존한다. 타입 app/node(`--noEmit --incremental false`)·lint(`--no-cache`) 통과. 후속 소스 변경은 한글 테스트 책임 주석뿐이다.
- [x] Vite `write:false` 메모리 빌드 **1966모듈, 3.99초** 통과. 새 JS `/assets/index-CW2HaOVv.js`, CSS `/assets/index-B8BPKIah.css` 및 HTML을 메모리에만 보관했다. 이번 작업에서 만든 기존 메모리 서버를 새 번들로 갱신했으며 주소/포트 `http://127.0.0.1:5173/`를 유지한다. 환경·설정 파일 변경 없음. 새로고침하면 추가 수정이 반영된다.
- [x] PLAN-INDEX의 기존 85G/22R/134흐름/107순서, 단계 담당·선행 관계·과거 verification·다른 Goal/R 상태 및 455개 R4 원문 해시/담당을 재확인했다. G02 외 451메모는 기존과 동일하다. G02 현재 검증 수치·추가 검토 연결만 갱신하며 추가 결과 파일을 만들지 않는다.
- [x] 변경 Markdown30개의 로컬 파일/anchor 링크3,208회 검사: 새 오류0, 과거 없는67회는 기존 이력으로 분리했다. JSON 중복 키·현재/과거 검증 정합성 및 `git diff --check` 통과. 새 미리보기의 `/`, `/crm`, `/signup`, `/login`, JS/CSS는 HTTP200이며 실제 브라우저 조작 검증은 아니다. 자동 캐시/보고서 후보 경로의 최근 생성 파일0; untracked는 허용된 정식 테스트2개뿐이다.
- [ ] 실제 브라우저 상세/네트워크·console, 픽셀 동일성·원본 동작·OS IME/AT/실기기는 10.6 담당대로 유지한다. 이번 결과도 jsdom이며 외부/API 0건이나 시각 통과를 뜻하지 않는다.

추가 수동 확인: `/crm` 진입→Product→CRM 재선택→메뉴 닫힘/본문 초점 확인. 좁은 폭에서도 탐색 열기→Product→CRM→전체 탐색 닫힘을 확인한다. 이 절의 수동 순서는 실제 브라우저 통과 기록이 아니다. 새 evidence·임시 산출물·커밋·push·배포·다음 Goal 착수 없음.

## G03 연결 범위 회귀 — 2026-11-23~24 KST

[이번 결과](G03_RESULT.md#g03-r4-recheck). 기존 공개 진입8/헤더6 테스트를 전체121개에 포함해 통과했다. 메뉴 hover초점·Templates 보호·같은 경로 재탐색·중복 CTA를 되돌리지 않았다. 공통 코드 변경 없음, 실제 브라우저/시각 대기 유지. 전체121개는 이번 실행 수치이며 과거 수치와 합산하지 않는다. 이 Goal 전체 재검토/완료를 뜻하지 않는다.

## G04 소비 연결 확인 — 2026-11-24 KST

[G04 현재 결과](G04_RESULT.md#g04-r4-recheck). 공개 메뉴/푸터·모바일 같은 목적지 재선택·공통 가입/이메일을 G04 해당 경계에서 회귀했다. 기존 메뉴 초점 보호·중복 방지 테스트가 전체130개에 포함된다. 공통 헤더/푸터/SignupLink 소스 변경 없음. 기존 결과·체크와 이 Goal 전체의 잔여는 보존한다.
