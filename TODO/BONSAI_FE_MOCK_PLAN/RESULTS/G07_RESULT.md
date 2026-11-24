# G07 공개 청구서 생성기 실행 결과

> 현재 G07 — 2026-11-24 KST: **부분 완료**. 생성기5단계·연결11PNG를 확인하고 초안/가입 복귀를 보완했다. 단위/DOM166/166·타입/lint·메모리 build 통과. 시각 동일성·실제 브라우저/네트워크는 대기다. 과거 이력·다른 G/R 상태를 보존한다. [범위·체크·잔여](G07_RESULT.md#g07-r4-recheck).

> 최종 상태 갱신 (2026-11-21): 아래는 각 단계 당시 기록이다. G14 인증/온보딩/선택 복귀와 G15 동일 회사 연결을 검증했고 최종 전체 개발·빌드82개씩/단위42개를 통과했다. 원본·시각·환경 대기는 유지한다. [최종 결과](G05_G15_RESULT.md).

2026-11-21 KST · G05~G15 연속 요청의 G07. 상태: 공개 생성기 구현·두 차례 검토·현재 검증 수행; 가입 후 연결·잔여 시각·원본 미확인·추가 환경 대기. 실제 청구서·고객·PDF 생성·API 연동 완료를 뜻하지 않는다.

## 근거·범위

- [R01 소비 보완 §13](R01_RESULT.md#13-2026-11-21-g07-소비-범위-보완-구현-전). Using invoice generator `1a82151c-9539-4a12-8a4d-706c8557370b` ANALYSIS와 01~05 PNG를 직접 확인했다. [새 MCP 조회](evidence/g07/mcp-sources.json)는 5 Screen을 포함한다. App `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, catalog2146은 같은 연속 작업의 G05 조회를 재사용했으며 촬영일·서비스 빌드와 구별한다.
- 관찰: Client Name/Address·Description/Quantity/Unit Price·행 추가·Remove·소계·Tax15%·Total·기한·Download Invoice. Poster Design 1×10 → 10.00/1.50/11.50, 빈 두 번째 행 추가에도 동일. 05는 가입 화면이며 PDF 수신·계정 Invoice/Client 생성의 증거가 아니다.
- [보완 보관본](evidence/g07/archive-fetch.json)은 요청 2024-02-03과 실제 응답 2024-01-18 08:26:54 UTC를 구분한다. CSS·inline JS를 읽었고 실행하지 않았다. Download Invoice 실제 링크는 `https://app.hellobonsai.com/users/sign_up?int_source=invoicegenerator`. 원본 실제 가입/파일 서버는 접속하지 않았다.
- 원본 PNG2880×1800을 1440×900으로 정규화했다. 원본 CSS viewport/DPR/OS/locale/스크롤 좌표는 확인되지 않았다. 실제 Chromium148, DPR1, 1440×900/en-GB이며 native date는 실행 환경에서 MM/DD/YYYY로 보였다. 원본 DD/MM/YYYY와 차이를 유지·기록한다.
- G06 실제 공개 Invoice Template/메뉴에서 진입한다. G06의 미수록 상세·Office 편집 대기는 이 공개 폼을 막지 않는다. 가입 본문은 G10 소유로 현재 경계까지 연결하며 G10~G14에서 이어 검증한다.

## 구현·상태 수명

| 구성 | 책임·현재 동작 |
| --- | --- |
| `/invoice-generator`, pages/invoice-generator | 기존 공개 헤더·audience·푸터와 생성기 조립 |
| features/public-invoice/model | 문자열 초안·안정적인 행 ID·BigInt 계산·필수값/숫자/날짜 검증 |
| InvoiceProvider | 공개 초안 메모리 보존. 라우트 back/forward에서는 유지, refresh/가상 scope revision에서는 초기화 |
| useInvoiceGenerator | 편집·추가/삭제·검증·IME guard·중복 방지·취소/이탈/편집 뒤 늦은 인계 무효화 |
| InvoiceItems/InvoiceGenerator | 폼·테이블·오류·초점 복귀·좁은 폭 입력/금액 표시 |
| PublicIntent.invoice, InvoiceHandoffSummary | 제출 시 별도 deep snapshot. 이전 이력은 새 편집으로 덮이지 않음. PDF/계정 생성과 구별 |

- 고객 이름/주소는 선택, 완성된 항목 최소1개. 완전히 빈 행은 보존하되 인계에서 제외한다. 설명만 있거나 숫자가 틀린 행은 제출을 막고 첫 오류에 초점. 0은 허용, 음수/지수/정밀도 초과는 거부한다. 수량 소수3/단가2자리, 각각0~1,000,000, 최대100행은 목 가정이다.
- 행 금액 half-up → 소계 → 15% 세금 half-up → 합계. 소수 경계에서 보관 JS의 raw float/toFixed와 다를 수 있다. 이를 원본 정책으로 확정하지 않는다. 통화 기호/선택·세율 편집은 원본에 없어 추가하지 않았다. 기본 `2024-02-15`는 캡처 fixture이고 현재 날짜/법정 세금 정책이 아니다.
- Download Invoice는 80ms 로컬 전환, slow1500ms, write-error는 해당 revision의 첫 시도만 실패. 입력을 보존하며 같은 버튼으로 재시도한다. 실제 PDF 링크/가짜 다운로드 완료는 없다. 정적인 부분은 비동기를 만들지 않았다.
- 가입 이력의 snapshot과 현재 편집 초안은 분리한다. 예전 가입 이력은 예전 금액을 표시하고 Back to invoice는 현재 편집 초안을 연다. 취소는 해당 공개 인계를 지우지만 편집 초안을 삭제하지 않는다. 다른 페이지의 이메일/플랜/템플릿 인계는 기존 정책을 유지한다.
- G10~G14에서 명시적으로 전달하는 현재 인계만 새 세션에 복원해야 한다. scope reset을 전역 해제해 다른 사용자의 초안을 유지하면 안 된다. 제공된 restore(snapshot)은 그 연결용이며 이 단계에서 가입 완료를 가장하지 않는다.

## 검토와 수정

1차 코드·흐름 검토: 숫자 parse/반올림·빈 행·stable ID·날짜·native badInput·중복 제출·pending 취소·route cleanup·공개 snapshot·가입 소유 경계를 확인했다. 필요한 회귀는 단위3개와 E2E4개로 묶었다. 초기 type/lint/unit18/대상 dev4가 통과했다.

1차 시각/경계 검토: 원본4상태와 실제 캡처를 직접 비교했다. 큰 금액 1,000,000×1,000,000을 320px에서 표시하면 행 합계가 칸을 넘었다. 모바일 td의 줄바꿈과 합계 행 자동 높이로 수정하고 같은 E2E에 최대값/320px 검증을 추가했다. 화면 전체의 overflow 여부만으로 합격시키지 않았다. 50px desktop 숫자 입력은 native 수평 편집을 지원하며 긴 값 전체 동시 노출은 원본 폭과 다르지 않게 유지했다.

2차 재검토: 모델/행 ID/스냅샷/타이머 해제/에러 연결/초점/범위 경계를 다시 확인했다. 시각 비교 후 제목 아래 간격2px와 설명 입력 높이·아래 간격을 보정했다. 큰 금액·320px·CSS24px 텍스트 검사에서 화면 경계 및 td 내부 넘침0을 확인했다. static 생성기에는 검색/권한/조회 로딩·모달이 없어 해당 항목은 N/A이며 실제 비동기는 취소 가능한 로컬 인계만이다. 신규 패키지/HTTP adapter/업무 계약은 없다.

전체 1차 dev는 41/42: G06 read-error 재시도 뒤 카드 수만 보고 문서를 떠나 로컬 썸네일5개가 ERR_ABORTED로 취소되었다. 외부/API 실패가 아니며 은폐하지 않고 [최초 결과](evidence/g07/development-first-review.json)에 보존했다. G06 테스트가 실제 이미지·대기 요청 준비까지 확인하도록 수정했다. 최종 전체 dev42/42·build42/42가 통과했다. G01 세션/초기화/Dialog, G02 메뉴/이메일, G03 소개 인계, G04 가격/후기, G05 검색/기사, G06 템플릿/15개 파일 회귀를 포함한다.

## 검증 명령·증거

모든 정상 FE 명령은 `FE/user-web`에서 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`, Node24.18.0/pnpm8.14.1을 적용했다.

- `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm test`18/18, `corepack pnpm build` 모두 통과. 마지막 CSS/테스트 보정 뒤 lint/build도 재실행 통과. 빌드의 JS688kB chunk·6개월 된 Browserslist 경고는 남아 있으며 숨기지 않았다.
- `corepack pnpm exec playwright test tests/e2e/invoice-generator.spec.ts --workers=2` — 초기 대상4/4.
- `corepack pnpm exec playwright test --workers=2 --reporter=line,json` — 최종42/42 통과, [개발 결과](evidence/g07/development-full.json).
- `corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=2 --reporter=line,json` — 최종42/42 통과, [빌드 결과](evidence/g07/production-full.json).
- `node scripts/capture-invoice-generator.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-invoice-generator.py`.
- 작업 중 루트에서 잘못 실행한 `pnpm typecheck`는 package.json 부재로 실패했고 FE cwd로 고쳤다. 루트 package/lock/실행 코드 변경은 발생하지 않았다. 이를 정상 FE 검증으로 계산하지 않는다.

개발/빌드 모든 테스트에서 요청을 가로채지 않고 관찰했으며 실제 API·외부 요청0, 실패0, console0. 최초 로컬 이미지 취소5건은 수정 전 기록으로 별도 보존한다. slow/write-error 설정은 각 검증 마지막 normal 또는 새 문서의 정상 seed로 복원했다.

[실제 캡처/요청](evidence/g07/browser-captures.json), [비교 조건·4개 원본 경로](evidence/g07/visual-metrics.json), [비교 이미지](evidence/g07/comparisons/). 원본01~04와 비교하며05 가입은 G10 경계라 같은 화면 완성으로 비교하지 않는다. 실제 화면6개(원본상태4+가입 인계+모바일)를 캡처했다. 추가 [320px 큰 금액·CSS 확대](evidence/g07/generator-320-large-text-amount.png)와 [실제 경계](evidence/g07/large-value-bounds.json)를 확인했다. 최종 비교 캡처의 관찰 요청3347개는 로컬 정적 자산/HMR이며 외부/API0·실패0·console0이었다. RGB 차이는 기록용이며 일치율/완료 기준이 아니다.

## 남은 차이·미검증·후속

- 날짜 native 형식·spinner·초점 ring·폰트 렌더링/일부 굵기·몇 px 간격·foot totals 정렬 차이. 원본 저대비 Add/Remove/date 색은 읽기 대비를 보완했다. 원본과 완전히 같다고 판정하지 않는다. 원본 모양에 맞춘 50px number 입력은 긴 숫자를 가로 편집하며 전체 값을 한 번에 보여 주지는 않는다.
- 원본 모바일/validation/삭제 결과/가입 후 보존/허용 한도/기한 기준/통화/반올림/전체 하단 본문은 미확인. 제공된 부분을 넘어 원문·정책을 만들지 않았다.
- OS 실제 한글 IME·VoiceOver·Safari/Firefox·실기기 확인은 실행 환경 범위 밖 대기. 합성 composition과 CSS/viewport 검증을 이 환경 검증으로 부르지 않는다.
- 서버 후속: 익명 초안 보존, 가입 후 복구, 계정 Invoice/Client ID 대응, PDF 형식·생성·실제 세금/통화/청구 정책. 이 답을 기다리며 구현을 멈추지 않았다.

## 미리보기 확인 순서

`http://127.0.0.1:5173/` → Templates → Invoice Templates → Online Invoice Generator. 또는 `/invoice-template`의 Online Invoice Generator 링크.

1. Jane Studio·주소·Poster Design·수량1·단가10 입력 → 10.00/1.50/11.50.
2. Add Item → 빈 행은 합계 유지. 행 Remove/추가·기한 수정·오류/수정.
3. Download Invoice → 로컬 가입 인계의 초안/총액. 실제 PDF 다운로드 없음.
4. 뒤로 → 단가 편집 → 앞으로 → 예전 snapshot 유지. Back to invoice → 최신 초안.
5. 320px·키보드·큰 금액 확인. 새로고침하면 초기 초안. `/components`의 Preview controls에서 write-error/slow 검증 후 normal 복원.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 이후 최종 회귀·연결 갱신 (2026-11-21)

[G15 검증](evidence/g15/final-verification.json): 최종 코드 타입/lint/build·unit42/42, 전체 개발/빌드82/82씩. 실제 navigation/요청 관찰에서 API/외부·실패·console 오류0. 각 단계의 과거 검증 수치는 위 기록대로 보존한다. G14 공개 인증·온보딩·플랜/템플릿/생성기 선택 복귀와 G15 동일 회사 편집/주소/로고/공개 여부 연결은 해소했다. 미수록 본문·원본 정책/동작·시각/환경 및 G16 이후 인계는 해소된 것으로 처리하지 않는다.

### G01~G15 감사 후 재점검 (2026-11-21)

이번 공통 수정의 영향을 기존 흐름 회귀로 확인했으며 원본·시각·환경 대기는 유지한다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

## G06 직접 연결 소비 회귀 — 2026-11-24 KST

- [x] 청구서 소개→생성기 진입·브라우저 history 뒤로의 DOM만; 생성기 작성/계산/저장 전체 재검토 아님. [G06 이번 근거](G06_RESULT.md#g06-r4-recheck). 전체29파일154 단위/DOM은 이번 실행 수치이며 과거와 합산하지 않는다.
- [ ] 실제 브라우저/시각 및 이 Goal 전체의 원본/환경 대기는 유지한다. G06 소비 확인을 이 Goal 전체 R4 완료로 올리지 않는다.

<a id="g07-r4-recheck"></a>
## G07 기존 구현 재검토·보완 — 2026-11-24 KST

**현재 판정: 부분 완료.** 주요 원본 대조·로컬 동작 보완·단위/DOM 검증을 수행했다. 엄격한 시각 동일성·실제 브라우저·미수록 원본은 대기다. 위 2026-11-21의 체크·수치·캡처·네트워크 기록은 당시 이력이며 이번 실행으로 대체하거나 합산하지 않는다.

### 1. 범위와 환경

- 주대상: G07 공개 생성기 진입→고객/항목/기한 초안→계산→Download Invoice→목 가입/로그인→취소/뒤로/동일 초안 복귀.
- 직접 연결: G06 소개/메뉴 왕복, G01 공통 목/Reset, G02 공개 메뉴/가입, G10/G11 선택 인계, G13/G14 필요한 온보딩/명시 복원. 연결 Goal의 업무 전체·G08 이후·G32 신규 기능은 착수하지 않았다.
- 착수 HEAD `af5aaaf2`, clean 상태를 확인했다. 기존 Vite dev/HMR `http://127.0.0.1:5173/`, PID30272를 보존했다. Node24.18.0/pnpm8.14.1, package Node>=24<25를 확인했다.
- FE 소스5개와 정식 회귀1개, 기존 문서만 수정했다. Backend·API 계약·HTTP adapter·DB·환경/서버 설정·원본/기존 evidence 변경 없음. 커밋/push/배포 없음.
- 연결된 document-control 세션 없음, 기존 CDP9222/9223 listener 없음. 새 프로필/임시 다운로드를 만드는 브라우저 실행은 산출물 제한상 사용하지 않았다. **실제 브라우저·네트워크·console을 관찰하지 않았으므로 요청0/오류0으로 판정하지 않는다.**

### 2. 원본·분석·버전 확인

G07 ANALYSIS와 PNG01~05 전부 및 아래 연결 ANALYSIS/PNG11개를 직접 확인했다. 총5흐름16PNG, 원본 PNG SHA25616개·LF 정규화 ANALYSIS SHA2565개가 기존 SOURCE_ANALYSIS_INDEX와 일치했다. PNG는 모두2880×1800이다.

저장된 채택 근거는 `bonsai-web / Latest / 2146`, app `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`다. 2146은 카탈로그 식별값이며 제품 빌드/촬영일이 아니다. 이번 Gummble batch는 F134/F069/F083/F086의4흐름31단계 메타데이터를 재조회했고 ID/순서가 모두 일치했다(`include_images:false`, 실패0). 새 MCP 이미지를 열람한 것이 아니고 응답에2146 필드가 없으므로 버전 재확정으로 쓰지 않는다. F087은 저장된 분석/PNG를 직접 확인했으며 이번 MCP 조회 대상이 아니다.

| 확인 | 흐름/단계 | Flow ID | Screen ID | 직접 열람한 자료 | 확인 범위 |
| --- | --- | --- | --- | --- | --- |
| [x] | F134 / 01 | 1a82151c-9539-4a12-8a4d-706c8557370b | sc_b1b6a664a9bd4989b0250ed10b1bc18e | [Using invoice generator ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Using invoice generator/screens/01_sc_b1b6a664a9bd4989b0250ed10b1bc18e.png>) | 빈 생성기 |
| [x] | F134 / 02 | 1a82151c-9539-4a12-8a4d-706c8557370b | sc_52707e230d0b4795928f1d906838bf74 | [Using invoice generator ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Using invoice generator/screens/02_sc_52707e230d0b4795928f1d906838bf74.png>) | 고객 이름/주소 |
| [x] | F134 / 03 | 1a82151c-9539-4a12-8a4d-706c8557370b | sc_8215ecb188434108956b1e25f408c5ce | [Using invoice generator ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Using invoice generator/screens/03_sc_8215ecb188434108956b1e25f408c5ce.png>) | 1×10 및 15% 표본 |
| [x] | F134 / 04 | 1a82151c-9539-4a12-8a4d-706c8557370b | sc_14f6d99be9f242d086fa899d0b1c04a6 | [Using invoice generator ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Using invoice generator/screens/04_sc_14f6d99be9f242d086fa899d0b1c04a6.png>) | 둘째 빈 행 |
| [x] | F134 / 05 | 1a82151c-9539-4a12-8a4d-706c8557370b | sc_fb989694d5964b2aa7081a4902cbbd29 | [Using invoice generator ANALYSIS](<../../../bonsai_analysis/flows/Using invoice generator/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Using invoice generator/screens/05_sc_fb989694d5964b2aa7081a4902cbbd29.png>) | Work Email 가입 |
| [x] | F069 / 02 | a0181c28-2521-46d3-a0e6-3ead4851b2f9 | sc_eac8d5a2e97d47c496455da557912622 | [Invoice templates ANALYSIS](<../../../bonsai_analysis/flows/Invoice templates/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Invoice templates/screens/02_sc_eac8d5a2e97d47c496455da557912622.png>) | 공개 메뉴 |
| [x] | F069 / 04 | a0181c28-2521-46d3-a0e6-3ead4851b2f9 | sc_9cb41f708d1841bc9bb627e9adb69f59 | [Invoice templates ANALYSIS](<../../../bonsai_analysis/flows/Invoice templates/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Invoice templates/screens/04_sc_9cb41f708d1841bc9bb627e9adb69f59.png>) | 생성기 소개 CTA |
| [x] | F083 / 02 | a02409b3-6eb0-4bc0-b702-22a42e0990c8 | sc_9d353458318e43e7b25ebbf88fefeaa9 | [Logging in ANALYSIS](<../../../bonsai_analysis/flows/Logging in/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | 로그인 폼 |
| [x] | F086 / 05 | f714101f-db6b-4bfe-9ed1-74d6b0d6243c | sc_3381bd3528ea401e94549c86a8f80af8 | [Onboarding ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/05_sc_3381bd3528ea401e94549c86a8f80af8.png>) | 짧은 비밀번호 |
| [x] | F086 / 06 | f714101f-db6b-4bfe-9ed1-74d6b0d6243c | sc_2adb02c3443f4da292d72c200694c1c9 | [Onboarding ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/06_sc_2adb02c3443f4da292d72c200694c1c9.png>) | 길이 오류 |
| [x] | F086 / 10 | f714101f-db6b-4bfe-9ed1-74d6b0d6243c | sc_33b333fba9d34edbbd66ddfadf29dcb4 | [Onboarding ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/screens/10_sc_33b333fba9d34edbbd66ddfadf29dcb4.png>) | 설문 시작 |
| [x] | F087 / 05 | f004afc2-a8c5-4262-b2e4-941331047a84 | sc_ca3a704790554cda93aaed9d21fa8780 | [Onboarding/Completing account setup ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/05_sc_ca3a704790554cda93aaed9d21fa8780.png>) | 산업/상호/국가 |
| [x] | F087 / 08 | f004afc2-a8c5-4262-b2e4-941331047a84 | sc_91aafda2760f434084cdfd0ce6e9c365 | [Onboarding/Completing account setup ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/08_sc_91aafda2760f434084cdfd0ce6e9c365.png>) | 사업 형태/매출 |
| [x] | F087 / 09 | f004afc2-a8c5-4262-b2e4-941331047a84 | sc_b2c655c6a1c54534b43a1112ef93fb2d | [Onboarding/Completing account setup ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/09_sc_b2c655c6a1c54534b43a1112ef93fb2d.png>) | 팀/누락 단계 |
| [x] | F087 / 11 | f004afc2-a8c5-4262-b2e4-941331047a84 | sc_7f05cc123c5f4b0bab3f31a6e9141492 | [Onboarding/Completing account setup ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/11_sc_7f05cc123c5f4b0bab3f31a6e9141492.png>) | 사용 목적 |
| [x] | F087 / 14 | f004afc2-a8c5-4262-b2e4-941331047a84 | sc_7c8264e8239e464abd4219d7b9828199 | [Onboarding/Completing account setup ANALYSIS](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/ANALYSIS.md>) · [PNG](<../../../bonsai_analysis/flows/Onboarding/Completing account setup/screens/14_sc_7c8264e8239e464abd4219d7b9828199.png>) | 대시보드 |

### 3. 단계별 대응과 판정

| 단계/연결 | 원본 관찰 → ANALYSIS → 계획 | 현재 코드·이번 검증 | 판정 |
| --- | --- | --- | --- |
| F13401 | 회색 둥근 패널, Client Name/Address, 큰 공백, 항목 표, 0·기한 → §4/5 → G07§3/5 | InvoiceGenerator/InvoiceItems·invoice-generator.css·createInvoiceDraft. 빈 시작/직접 경로 DOM | 구조 유지; 폰트/정밀 시각 대기 |
| F13402 | Jane Studio/주소 입력, 합계0 → §4/5 → 공개 초안 | InvoiceProvider의 메모리 초안. 고객 입력을 CRM 생성과 분리; 이력 이동 시 보존 | 유지·목 수명 명시 |
| F13403 | Poster Design1×10, 10.00/1.50/11.50,15/02/2024 → §4/5 → 계산/기한 | BigInt 계산 유지; 단위3회귀와 DOM 표본/소수/기한 오류 수정·초점 연결 | 유지·접근성 보완 |
| F13404 | 완전히 빈 둘째 행, 합계11.50 유지 → §4/8 → Add/Remove/빈 행 | 안정 ID·삭제 후 초점/남은 값·행 금액/합계·가입 snapshot의 빈 편집행 제외 DOM | 유지; 삭제/빈 행 허용은 원본 미확인 목 정책 |
| F13405 | Work Email/Full Name/Password/CAPTCHA, 가입 폼 → §4/5/8 → 파일 성공과 분리 | 가입 label/placeholder 복원, 빈 이메일 유지. 중복·실패·재시도·취소·전체 URL·이력 격리 보완 | 구현 보완; PDF/CRM/계정 Invoice 생성 없음 |
| F06902/04 | 메뉴/소개 생성기 링크 → 관련 분석 → G06/G02 소비 | 실제 router로 소개→생성기→history 왕복; 기존 메뉴/템플릿 회귀 | 소비 확인; G06 잔여 유지 |
| F08302/F08605·06·10 | 인증 폼/비밀번호 오류/설문 시작 → R02 → G10/G11/G13 소비 | 목 샘플 로그인, 실제 목 가입 폼과 설문 진입. 계정/인계 스코프 초기화 후 선택만 복원 | 목 연결 검증; 실제 인증 없음 |
| F08705/08/09/11/14 | 사업 정보/팀/목적/대시보드 → 관련 분석 → G13/G14 소비 | 목 가입→설문→대시보드→Local setup summary→Review your original selection→명시 복원 DOM | 목 연결 유지; 원본 청구서 복구 증거 아님 |

원본01~05는 주요 요소군까지 대조했다. 모든 작은 요소/픽셀의 전수 계수나 정밀 재현 인증은 아니다. `element_census_complete`·`reproduction_spec_certified`는 false로 유지한다. 원본에서 관찰되지 않은 오류·취소·가입 후 초안 복구를 관찰 사실로 채우지 않았다.

### 4. 발견한 결함·수정

모든 코드 경로는 `FE/user-web/src/` 기준이다.

| 문제·원인 | 수정 위치 | 검증 |
| --- | --- | --- |
| 생성기에서 가입으로 보낼 때 returnTo가 고정 경로라 취소 시 query/hash 유실 | features/public-invoice/hooks/use-invoice-generator.ts | 전체 URL/현재 편집값·과거 snapshot 구분 DOM |
| 로그인 후 명시 복원도 고정 생성기 경로 사용 | pages/auth-boundary/index.tsx | 같은 행 ID·금액·query/hash 복구, back/forward로 재복사하지 않음 |
| 취소가 동일 sourcePath의 모든 인계를 삭제 | features/public-web/components/public-provider.tsx | 선택 청구서 intent만 제거; A/B snapshot 유지. 추가 검토에서 일반 Start free 취소도 청구서 인계를 지우는 결함을 재현해 보호 |
| 동일 pathname의 다른 history 이동이 지연 제출 수명을 끝내지 않음 | use-invoice-generator.ts | location.key와 revision으로 타이머·중복 잠금·조합 상태 정리, 새 URL을 늦게 signup으로 덮지 않음 |
| 기한 오류에 aria-describedby가 없어 설명과 입력 미연결 | features/public-invoice/components/invoice-generator.tsx | invalid/오류 ID/초점/입력 수정 후 인계 DOM |
| 조합 종료 직후 keyCode229 Enter 보호 누락 | 같은 컴포넌트 | 합성 composition/229 Enter/정상 제출 구분; 실제 OS IME 아님 |
| 원본05의 Work Email/you@company.com이 일반 가입과 동일한 Email로 표시 | pages/signup/index.tsx | 청구 인계 진입에만 원문/placeholder 적용, 직접 가입·다른 CTA의 Email 유지 |
| 현재 코드 기준의 위 경계 회귀 부족 | app/router/invoice-entry.test.tsx | 정식11시나리오 추가; navigation은 mock하지 않고 App의 router/history 사용 |

계산 모델·안정 ID·목 저장소·기존 G06 파일 링크·G10~G14 인증/설문 구조는 유지했다. 대규모 재구성·새 dependency·실제 다운로드·통화/세율 선택 컨트롤을 추가하지 않았다.

### 5. 실행 검증과 한계

- [x] 앱/Node typecheck: 각각 `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit --incremental false --pretty false`, `-p tsconfig.node.json` 통과.
- [x] `node node_modules/eslint/bin/eslint.js . --no-cache` 통과.
- [x] Vitest 전체30파일166/166, G07 정식11/11 통과. 계산 기존3, 공개 메뉴/소개/가격/기사/템플릿과 auth/company store 회귀 포함. 이전155/154/42 수치를 합산하지 않는다.
- [x] Vite 메모리 build `write:false`, `emptyOutDir:false`, `copyPublicDir:false` 통과.1971modules/3outputs. 최종 실행 시간은 아래 최종 검토에 기록한다.
- [x] source hash5분석/16PNG 및 MCP4flow31Screen ID/순서 일치. `git diff --check`와 문서 링크/색인·체크 일치 검사는 최종 검토에 기록한다.
- [ ] 실제 브라우저 E2E·사용자 OS IME·키보드만의 전체 흐름·좁은 폭/확대/스크롤/모달·새로고침·network/console 관찰은 미실행. DOM remount는 메모리 초기화 모사이며 실제 새로고침 통과로 쓰지 않는다.
- [ ] 픽셀/동일 viewport 비교 미실행. 새로운 캡처 경로 없음.

최초 테스트의 aria-label 선택자는 실제 label/htmlFor 구조와 달라6건 실패했고 테스트를 수정했다. 그 뒤 제품 결함5개가 재현되었다(취소 URL·다른 intent 삭제·같은 경로 지연 덮기·날짜 설명·로그인 URL). 수정 후10/11, 나머지1개는 기존 온보딩이 곧바로 auth/continue로 간다는 테스트 가정이었다. 실제 대시보드→명시 복원 경로로 수정해166/166 통과했다. 최종 코드 검토에서 일반 헤더 가입 취소와 청구서 인계의 교차 삭제1개를 추가 재현했고 같은 회귀를 확장해 수정/재검증했다. 실패를 성공 기록에서 숨기지 않는다.

산출물 없는 실행: PowerShell here-string을 `node --input-type=module -`에 전달했다. `NODE_DISABLE_COMPILE_CACHE=1`, `JITI_CACHE=false`, `JITI_FS_CACHE=false`. Vitest는 `startVitest('test', [], ...)`에 `config:false,run:true,cache:false,pool:'threads',execArgv:[],maxWorkers:2,environment:'jsdom',include:['src/**/*.test.{ts,tsx}'],setupFiles:['./vitest.setup.ts'],reporters:['default'],coverage:{enabled:false},experimental:{fsModuleCache:false},deps:{optimizer:{client:{enabled:false},ssr:{enabled:false}}}`; Vite override `configFile:false,plugins:[react()],resolve.alias.@=path.resolve('src'),optimizeDeps:{noDiscovery:true,include:[]},server:{watch:null}`. 선택 실행은 filter 배열을 정식 테스트 경로로 바꾸었다. Build는 React plugin/동일 alias와 PostCSS tailwindcss/autoprefixer를 인라인 설정했다.

일반 `tsc -b`/파일 build/Playwright/download 테스트는 실행하지 않았다. 새 evidence/PNG/비교 이미지/영상/trace/HTML/JSON/manifest/로그/임시 모듈/스크립트/브라우저 프로필/결과 파일을 생성하지 않았다. 원본 PNG와 기존 증거 파일은 그대로다. 6개월 된 caniuse-lite 경고는 남아 있으며 이번 범위에서 의존성 갱신을 하지 않았다. 목 오류/slow는 테스트 마지막 normal 또는 Reset, 각 테스트의 provider 종료로 복원했다. 기존 사용자의 브라우저 상태는 조작하지 않았다.

### 6. FRONT_AGENT 적용·최종 엔지니어링 검토

AGENT/README·PM036·UX025, FRONT_AGENT README의 읽기 순서와 DECISIONS006 우선/005, ARCHITECTURE의 FRONTEND_USER_WEB·STATE_AND_DATA·MOCK_FIRST_DEVELOPMENT·TESTING, CONVENTION의 COMPONENT_DESIGN·FRONTEND_USER_WEB·WEB_ACCESSIBILITY_AND_LAYOUT·COMMENT_AND_LOGGING을 이번 범위에 적용했다. 아래 항목 번호는 ENGINEERING_REVIEW_CHECKLIST 각 절의 순서다.

| 체크 항목 | 판정·코드/근거 |
| --- | --- |
| 1.1 범위/기존 변경,1.2 출처 구분,1.3 시작~실패,1.4 구현/운영 구분 | [x] clean 착수, 결과1~5절, 원본/목/대기 분리; G07/직접 연결만 |
| 2.1 계층,2.2 controlled 소유,2.3 분리 근거,2.4 앱 간 import | [x] page 조립·invoice hook 상태·InvoiceProvider 원본·모델 계산 유지, 타 앱 import/순환 추가 없음 |
| 2.5 새 의존성 | N/A: dependency/lock 변경 없음 |
| 3.1 목 경계,3.2 실 서버 fallback,3.3 인증/네트워크 정책 | [x] 공개 memory/목 auth만, 서버 호출 코드 추가 없음. [ ] 실제 네트워크 무호출 관찰 |
| 3.4 동일 ID,3.5 seed/수명,3.6 live에 목 혼입,3.7 임시 타입 | [x] 행/초안 ID와 선택 snapshot, revision/reset DOM; 기존 공개 독립 mock. live 보완/API/DB 확정 N/A |
| 4.1 상태 소유,4.2 scope/key,4.3 취소/경합,4.4 제출 고정/중복 | [x] InvoiceProvider/intent 구분, location.key·revision·동기 잠금·타이머 해제,11회귀 |
| 4.5 반영/캐시,4.6 0/빈 값/금액/날짜 | [x] 편집/합계 즉시 반영·다른 intent 보호·BigInt와 실제 날짜 검증. 업무 조회/cache invalidation N/A |
| 5.1 URL/재진입,5.2 키보드/초점 | [x] 실제 router DOM 왕복·명시 복원·초점. [ ] 실제 브라우저 새 탭/새로고침·전체 키보드 순서 |
| 5.3 모달/메뉴 | 생성기 자체 모달 N/A. 기존 공통 메뉴 DOM 회귀 [x]; 실제 메뉴/인증 모달 시각·포커스 재검증 [ ] |
| 5.4 label/오류/header/type | [x] InvoiceItems label/header 유지, dueDate 설명 연결·Work Email 문구 보완 |
| 5.5 상태 구분 | [x] 빈 행/검증 오류·pending·실패 재시도. 생성기 조회 로딩/검색 무결과/권한 조회 N/A |
| 5.6 viewport/확대/긴 값/scroll,5.7 IME/터치/motion | [x] 긴 한국어 값·합성 composition/229 DOM. [ ] 실제 레이아웃·OS IME·터치·motion |
| 6.1 한글 책임,6.2 복잡 흐름 이유,6.3 strict/cleanup | [x] 변경 함수·hook·컴포넌트/정식 테스트의 한글 주석, 기존 이유 주석, 타입/lint·timer/RAF 정리 |
| 6.4 권한/비밀,6.5 성능 | [x] history에는 intent ID만, 초안 개인정보/비밀번호를 URL/로그로 추가하지 않음; actor/workspace/reset 회귀. 성능 작업은 N/A(새 병목/무한 렌더 없음) |
| 7.1 검증 선택,7.2 인증/공통 회귀,7.3 Admin | [x] 현재 type/lint/unit/DOM/memory build·공유 provider 소비 전체 회귀. Admin N/A |
| 7.4 명령/미실행,7.5 목/운영 구분,7.6 문서 정합성 | [x] 결과5절·최종 검토, 운영 효과 없음, 관련 문서 교차 검토. E2E/시각 대기 유지 |

### 7. R4 네 항목·공통12기준

| R4 항목 | 현재 판정 | 근거·잔여 |
| --- | --- | --- |
| [R4-F134-O01](../COMMON/SOURCE-ANALYSIS-IMPACT.md#r4-f134-o01) | 비교 완료·유지 | 회색 둥근 패널·큰 고객/표 간격·녹색 행·Add/Remove 구성 유지. 기존 접근성 대비 보완 색·native date·정밀 시각은 미일치/대기 |
| [R4-F134-O02](../COMMON/SOURCE-ANALYSIS-IMPACT.md#r4-f134-o02) | 비교 완료·구현 보완 | 1×10→10.00/1.50/11.50·빈 행 합계 유지; 안정 행 ID/계산 유지, 날짜 오류 연결·IME·지연 인계 수명 보완. 반올림·날짜 제한은 목 정책 |
| [R4-F134-O03](../COMMON/SOURCE-ANALYSIS-IMPACT.md#r4-f134-o03) | 비교 완료·구현 보완 | Work Email/placeholder 복원, 전체 URL 복귀·이력별 snapshot 취소 격리 보완. PDF/CRM/계정 청구서 생성 없음; 가입 후 복귀는 목 연결 |
| [R4-F134-A01](../COMMON/SOURCE-ANALYSIS-IMPACT.md#r4-f134-a01) | 분석 대기 | 원본 실제 다운로드·가입 후 보존·입력/세율/기한 정책·정확한 폰트/색/패널/자산/촬영 조건 미확인; G07/R01 및 연결 G10/G11/G13/G14/R02 후속 |

관찰 항목의 '비교 완료'는 위 주요 요소/코드 대조의 뜻이다. 원본 모든 요소의 동일성 완료가 아니다.

| 공통 기준 | 이번 범위의 적용 결과(전역 완료 아님) |
| --- | --- |
| R4-C01 | G07 5/5와 연결11PNG·ANALYSIS5개 해시/크기 확인, MCP4흐름31ID/순서 일치; 촬영/빌드/버전 재확정 대기 |
| R4-C02 | 공개 패널·가입/로그인·설문/대시보드 구성 구분; 실제 배치/겹침/모달 시각 대기 |
| R4-C03 | 5단계 주요 입력/표/CTA 및 연결11화면 대응; 전체 요소 계수·정밀 명세 인증 미완료 |
| R4-C04 | 원본05 Work Email·you@company.com 복원; placeholder와 빈 값 구분, 필수/제한은 목 정책. 줄바꿈/정밀 표시 대기 |
| R4-C05 | PNG2880×1800/MCP1440×900 구분; 현재 구현 viewport/DPR/배율/스크롤·픽셀 비교 미실행 |
| R4-C06 | 기존 폰트 선언 유지; 원본 폰트 파일·굵기·행간·자간 동일성 미검증 |
| R4-C07 | 회색 패널/녹색 합계/버튼 구성 대조; 기존 대비 보완 색과 날짜 native 표시 차이 유지, 동일성 미확인 |
| R4-C08 | 기존 로고·가입 잎·인증 아이콘·설문 이미지 사용 유지; 원본 자산/crop 정밀 대조 대기 |
| R4-C09 | 빈 행/불완전 행·기한 오류 연결·실패 재시도·중복·slow/취소·합성 IME·Reset DOM 검증; 원본 오류/모바일 미수록 |
| R4-C10 | 실제 앱 router/history DOM으로 진입·뒤로/앞으로·query/hash·가입/로그인·온보딩 복귀 검증; 실제 브라우저 대기 |
| R4-C11 | 편집값/제출 snapshot 분리, 선택 인계만 취소, 일반 가입 취소와 격리, 사용자/workspace/reset·늦은 제출 무효화 검증 |
| R4-C12 | G06/G01/G02/G10/G11/G13/G14 직접 연결 소비 회귀; R01/R02와 연결 Goal 전체 완료 아님 |

### 8. 유지한 목 가정·남은 질문과 담당

- 고객 이름/주소 선택, 완성 항목 최소1, 완전히 빈 편집행은 화면에 남기되 제출 snapshot에서 제외. 취소는 **최신 편집 초안**, 로그인/가입 뒤 명시 복원은 **선택한 제출 snapshot**으로 돌아간다. 과거 가입 화면을 다시 여는 것만으로 편집값을 덮지 않는다.
- 수량 소수3/단가2자리,0~1,000,000,최대100행, 행 half-up→합산→15% tax half-up은 기존 목 규칙이다. 0/음수/정밀도/큰 값 검증을 실제 세무 정책으로 확정하지 않는다. native 날짜는1900~9999의 유효 날짜, 기본2024-02-15는 fixture다.
- 80ms/slow1500ms/한 revision의 첫 write-error 실패·재시도, 새로고침 메모리 폐기/사용자·workspace·Reset 격리도 목 가정이다. 서버 저장·계정 Invoice/CRM Client·PDF·메일·발송·결제 생성 없음.
- G07/R01: 다운로드 전제/실제 파일 결과·익명 저장/가입 후 복구·반올림/필수/허용값·세율/날짜·원본 Remove/오류/모바일/하단 본문 확인 대기. 서버 정책은 후속 메모이며 이번 FE 진행의 선행 조건으로 삼지 않았다.
- G07/G01/R01과 관련 인증 G/R: 기존 Gellix/인증 폰트 선언을 유지했으나 촬영 당시 정확한 파일·렌더링·색/자산/배율 미확인. 현재 CSS max-width700/제목60/간격102/radius20 등은 기존 정규화/보관본 기반값이며 이번에 원본 CSS px로 확정하지 않았다. native 날짜 포맷/spinner·초점 ring·Add/Remove/date 대비 보완색·몇 px 간격/정렬 차이가 남아 있다. 작은 차이도 동일성 완료로 허용하지 않는다.
- 현재 구현 viewport/DPR/배율/스크롤은 실제 브라우저 미관찰. 새 비교 축척/픽셀 diff 없음. 과거1440×900 정규화 캡처 조건을 이번 조건으로 소급하지 않는다.
- G07/직접 연결 G/G84: 실제 URL/새로고침/키보드/포커스/모달/좁은 화면/확대/긴 한국어/OS IME·console/network 대기. R01/R02·연결 Goal 전체의 미수록 분석/시각/실계정 대기 유지.

### 9. 미리보기에서 직접 확인할 순서

주소: `http://127.0.0.1:5173/` (기존 Vite). 아래는 사용자가 따라 할 순서이며 이번 실브라우저 실행 결과가 아니다.

1. Templates→Invoice Templates→Online Invoice Generator 또는 `/invoice-generator?entry=manual#draft`.
2. Jane Studio/주소, Poster Design/1/10 입력→10.00/1.50/11.50. Add Item→빈 행 합계 유지, 행 삭제/추가·기한 오류/보정·포커스 확인.
3. Download Invoice→Work Email이 빈 가입 화면과 별도 로컬 초안 안내. 뒤로→단가20→앞으로에서 과거11.50 snapshot 확인→Back to invoice에서 최신23.00과 전체 query/hash 확인.
4. 다시 제출→Log in→Continue as Alex→Continue with selected details에서 같은 행·금액·URL 복원. 실제 PDF 수신 동작은 없다.
5. 새 가입을 검증하려면 Reset 후 표본 이메일/이름/10자 이상 비밀번호/로컬 CAPTCHA→설문→대시보드 Local setup summary→Review your original selection→Continue with selected details.
6. `/components`의 Preview controls에서 write-error/slow→실패 재시도·취소·편집/화면 이동·다른 사용자/workspace를 확인한다. 마지막에 Reset preview/normal로 복원한다.
7. 실제 브라우저 개발자 도구로 console/network와320~390px·키보드·IME를 추가 확인한다. 실패한 실제 API 요청도 발생으로 계산한다.

### 10. 문서 체크

- [x] G07·관련 R01/R02·직접 연결 G 명세/결과의 이번 범위와 과거 체크를 분리했다.
- [x] SOURCE-ANALYSIS-IMPACT 네 항목·공통12기준, FLOW-GOAL-MATRIX/FLOW-BEHAVIOR-REVIEW, 순서표·현재 상태·PLAN-INDEX를 실제 수행 범위로 갱신했다.
- [x] 공통 START/UXUI/MOCK/PUBLIC/USER-FLOW/EXPANSION/문서 검토·작업 기록에 적용 결과·대기 담당을 연결했다.
- [ ] 전체 G07 완료·엄격한 시각 동일성·실제 브라우저·R01/R02 전체 완료는 대기다. 다음 기능 묶음/G08/G32 착수 없음.

<a id="g07-final-review"></a>
### 11. 최종 검토 — 2026-11-24 KST

- [x] 최종 소스 기준 전체30파일166/166(118.07초), 그중 G07 신규11/11. app/node 타입 검사·cache 없는 lint 통과. 메모리 build1971modules/3outputs/7.35초. 마지막 일반 가입 취소 격리 수정 후의 결과이며 앞선109.98초 실행과 구별한다.
- [x] 계획 문서170 Markdown+1 JSON을 HEAD와 비교해 링크/앵커를 검사했다. 기존 오류221회·현재221회·새 오류0. 기존 누락 경로/앵커를 이 작업에서 고치거나 증거 파일로 재생성하지 않았다. 정합성 assertion 실패0.
- [x] 기존 관련 문서44개 갱신. G85개/R22개/순서107개/흐름134개/단계754개/고유 화면642개/R4항목455개/공통12개 유지. G07 외 R4항목451개·과거 verification·이전 완료 체크·실행 순서·다른 G/R 전체 상태 보존.
- [x] 정식 회귀 테스트1개만 신규 파일이다. 기존 FE5개와 계획 문서만 수정했으며 원본·기존 evidence·환경/서버 설정·Backend·lock 변경 없음. git diff --check 통과. 검사 스크립트는 PowerShell UTF8 here-string→Node stdin에서 수행했으며 저장하지 않았다.
- [x] 마지막에도 기존 미리보기127.0.0.1:5173/PID30272를 확인했다. document-control 세션0개·기존 CDP9222/9223 listener 없음. 브라우저를 실행하거나 사용자의 기존 상태를 조작하지 않았다.
- [ ] 실제 브라우저/OS IME/console/network·원본 픽셀 동일성·미수록 정책은 대기. API0건·console0건으로 기록하지 않는다. 전체 G07은 부분 완료이며 다음 Goal·커밋/push/배포는 수행하지 않았다.

<a id="g07-precommit-review"></a>
### 12. 후속 커밋 요청 검토 — 2026-11-24 KST

- [x] 사용자의 후속 요청으로 G07 로컬 커밋을 준비했다. 앞 절의 커밋 미실행은 구현 종료 당시 기록이다. G09 진행 요청은 사용자가 정정했으며 G08은 요청문 준비만 한다.
- [x] 마지막 166/166·타입/lint·메모리 build 이후 FE 소스 추가 변경 없음. 이번에는 Git 범위·diff 공백·문서 링크/상태·과거 기록 보존을 재검토하며, 앱 검증을 새로 실행한 것으로 기록하지 않는다.
- [ ] 기존 시각·실제 브라우저·미수록 원본 대기는 유지한다. 로컬 커밋은 전체 G07 완료가 아니며 push·배포·G08/G09 구현은 포함하지 않는다.

<a id="g10-update"></a>
## G10 적용·연결 검토 — 2026-11-24 KST

- [x] 공개 청구서의 Work Email 변형·가입 취소/선택 snapshot·목 가입/온보딩 인계 회귀를 재실행했다. 새 PDF/CRM/계정 청구서 생성 없음. [상세 판정·근거](G10_RESULT.md#g10-r4-recheck).

- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G10 결과8절에 기록했다.


<a id="g13-update"></a>
## G13 적용·연결 검토 — 2026-11-24 KST

- [x] 선택한 청구서 인계→목 가입→G13→대시보드→원래 선택 복귀 DOM11 기존 회귀를 재실행했다. 공개 선택이나 생성기 데이터를 자동 변경하지 않는다.

- [ ] 원본 동일성·실제 브라우저/console/network·OS IME와 원본 미수록 정책은 대기다. 관련 G/R 전체 완료가 아니다. [범위·검증·잔여](G13_RESULT.md#g13-r4-recheck).

> G13 커밋 전 추가 검토 — 2026-11-24 KST: 초기 대시보드에서 같은 경로로 이동할 때 로딩이 남는 결함을 재현·수정했다. G13 DOM10/company store4=14/14, 최종 전체36파일236/236·타입/lint·메모리build 통과. 원본 동일성·실제 브라우저·원본 미수록 대기와 과거 이력을 보존하며 사용자 후속 요청으로 커밋·origin/main push를 승인받았다. 배포·다음 Goal 착수 없음. [추가 검토 결과](G13_RESULT.md#g13-precommit-review).
