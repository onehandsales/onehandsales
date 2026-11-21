# G07 공개 청구서 생성기 실행 결과

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
