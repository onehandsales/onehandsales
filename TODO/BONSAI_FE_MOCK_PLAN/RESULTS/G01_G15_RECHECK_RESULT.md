# G01~G15 감사 후 동작·문서 재점검

> 현재 G12 — 2026-11-24 KST: **부분 완료**. G12 커밋 전 추가 검토: 같은 경로에서 복귀 주소·이력/선택 문맥이 바뀌어도 이전 요청 안내·비밀번호 저장이 완료되는 두 결함을 재현하고 수정했다. G12 DOM11+store7=18/18, 전체225/225·타입/lint·메모리build 통과. 이전223 기록과 다른 Goal 대기는 보존하며 사용자 후속 요청으로 로컬 커밋만 승인되었다. 원본 동일성·실제 브라우저/network·미수록 정책 대기. [최신 검토·체크·잔여](G12_RESULT.md#g12-precommit-review).


> 이전 G11 — 2026-11-24 KST: **부분 완료**. 최초 원본7단계 대조/보완 뒤 커밋 전 공통·공유 로그아웃 복귀와 회사명 일관성2문제를 추가 수정했다. 전체211/211·타입/lint·메모리build 통과. 시각/실제 브라우저·원본 대기는 유지하며 사용자 후속 요청으로 로컬 커밋이 승인되었다. [최신 검토·검증](G11_RESULT.md#g11-precommit-review).


> 이전 G10 — 2026-11-24 KST: **부분 완료**. 원본10단계·연결3PNG를 대조하고 가입 오류/처리/복귀·첫 화면 표시를 보완했다. 단위/DOM197/197·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크·원본 정책은 대기다. [범위·체크·잔여](G10_RESULT.md#g10-r4-recheck).


> 이전 G09 — 2026-11-24 KST: **부분 완료**. 원본11단계·연결5PNG를 확인하고 정책 발췌/출발 이력/가입 취소를 보완했다. 단위/DOM188/188·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크·전체 정책 근거는 대기다. 과거 이력과 다른 G/R 상태를 보존한다. [범위·체크·잔여](G09_RESULT.md#g09-r4-recheck).


> 이전 G08 — 2026-11-24 KST: **부분 완료**. 원본8단계·연결2PNG를 확인하고 검색/기사/문의 복귀를 보완했다. 단위/DOM179/179·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크는 대기다. 과거 이력·다른 G/R 상태를 보존한다. [범위·체크·잔여](G08_RESULT.md#g08-r4-recheck).


2026-11-21 KST. 감사 기준과 시작 HEAD는 `8f099e0d`이며 시작 작업 트리는 깨끗했다. G01~G15를 재구현하지 않고 요청한 동작 결함 5건을 수정했다. G13은 기존 동작을 유지하면서 중단·복귀 정책을 명시하고 테스트로 보완했다. 기존 결과의 자료·시각·환경 대기를 유지한다. 커밋·push·배포·G16 이후 작업은 수행하지 않는다.

## 1. 범위·규칙·원본 확인 경계

- AGENT/README, FRONT_AGENT README와 아키텍처·상태·컴포넌트·목·웹 접근성·한글 주석·테스트·엔지니어링 검토 규칙 및 결정006을 적용했다. 루트/상위/FE 범위의 별도 AGENTS.md는 없고 BE/AGENTS.md는 이번 범위 밖이다. 참조된 AGENT_USAGE_RULES.md가 없는 점은 기존 기록과 같으며 새로운 규칙을 추정하지 않았다.
- 사용자 지시와 결정006에 따라 과거 실제 로그인 유지/API 연결·TODO 제외 지침을 적용하지 않았다. Backend/API 계약/HTTP adapter/DB/migration·의존성 변경은 없다.
- 이번은 기존 시안의 상태·이력 결함 수정이다. CSS·레이아웃·문구·원본 자산을 변경하지 않았다. 기존 G00/R01/R02의 채택 시안과 비교 근거를 유지하며 **이번에 Gummble MCP를 재조회하거나 원본 PNG 전체를 다시 확인하지 않았다.** 과거 MCP/이미지 확인을 이번 신규 확인으로 쓰지 않는다.
- 신규 화면 시각 비교는 해당 없음. 이번 캡처는 실제 수정 상태의 동작/화면 재검토 증거이며, 기존 원본과의 시각 동일성을 다시 합격시킨 자료가 아니다. 과거 비교의 정규화 조건·원본 viewport/DPR 미확인과 잔여 차이는 그대로다.

## 2. 결함별 재현·원인·수정

수정 전 실행 코드에 새 테스트를 먼저 실행했다. 8건 중 6실패·2통과: 결함 5건 중 도움말은 검색/Support 두 경로라 실패가 6건이다. [최초 실패와 화면](evidence/g01-g15-recheck/before-summary.json)을 보존했다. 6건 모두 아래 기대값과 실제 상태가 달라 실패했다. 전체 실행 시간 제한에 도달한 실패와 구분한다.

| 항목 | 수정 전 실제 재현 | 원인 | 수정·회귀 범위 |
| --- | --- | --- | --- |
| G02 공통 가입 CTA | Start free 더블클릭, history 2→4(기대3) | 이전 pathname을 캡처한 핸들러가 화면 교체 전 두 번 start/navigate | SignupLink 인스턴스의 ref로 일반 이동 한 번만 허용. 랜딩·CRM 더블클릭, 단일 클릭/Enter, Back 한 번, 수정 키 새 탭을 실제 브라우저에서 검증 |
| G08 목차 후 복귀 | 검색 `/help/collections/96965?q=portal` 또는 `/support`→기사→목차 후 복귀 href가 `/help` | hash Link가 현재 history state를 지움. 관련 기사도 부모의 복귀 정보를 전달하지 않음 | 목차 replace에 state 보존. 관련 기사에는 부모 URL(query/hash 포함)과 복귀 state 전달. 관련→부모→검색/Support·뒤/앞·직접 URL/새로고침 검증 |
| G15 Discard 후 저장 잠금 | Add Address→Discard changes→회사명 변경, Save Changes disabled | 부모 addressOpen은 남고 하위 편집기만 재조회 시 unmount | 편집기 수명 종료 때 부모 잠금 해제. 전체 취소·주소 Cancel/Escape·재진입·정상 저장, 기존 회사 모달 회귀 |
| G15 국가 덮어쓰기 | 주소에서 USD 선택, 바깥 Country Singapore→Save Address, Malaysia로 복귀 | 주소를 열 때 복사한 country가 최신 부모 선택을 덮음 | 부모 선택이 변경될 때 해당 국가/통화만 하위 초안에 동기 반영. 주소/통화 보존, A→B→A, 이후 명시적 하위 선택·취소·저장·좁은 화면 확인. 국가 변경으로 통화 자동 변경 없음 |
| G15 미저장 공개 URL | slug 초안 변경 후 View Profile href가 아직 저장하지 않은 `/u/unsaved-profile-draft` | 링크가 저장소 대신 편집 draft.slug 참조 | hook에서 조회/저장 성공 때만 savedSlug 갱신. 저장 전·실패·Discard는 기존 주소, 성공 후 새 주소. 실제 공개 화면과 비활성 결과·이탈 초안 폐기 확인 |

수정 소스는 `public-link.tsx`, `help-article.tsx`, `address-editor.tsx`, `use-company-editor.ts`, `pages/company-settings/index.tsx`의 다섯 파일이다. 신규 `tests/e2e/audit-recheck.spec.ts`의 8건은 실제 결함 조건/복귀 정책을 검사한다. 단순 구현 복제나 테스트 수를 늘리기 위한 중복 검사는 추가하지 않았다.

## 3. G13 정책 결정과 근거

[공통 목 상태 정책](../COMMON/MOCK-UI-STATE.md)에 반영했다. G13 기존 결과는 Pause→뒤로 복귀 시 초안 보존을 약속했고, G14 보호 경계는 새로 요청한 `/app` URL을 returnTo로 사용한다. 두 행동을 구별하는 목 정책을 채택했다.

| 행동 | 초안 | 완료 목적지 |
| --- | --- | --- |
| 보호 회사 URL→가입→온보딩→Pause→브라우저 뒤로/앞으로 | 같은 actor/workspace 메모리 유지 | 원래 `/app/settings/company?from=recheck#details` |
| 동일 흐름에서 Pause→Go to dashboard | 같은 사업 초안 유지 | 사용자가 새로 선택한 `/app` |
| 다른 보호 URL을 명시 선택 | 같은 인증 범위 초안 | 새로 선택한 허용 내부 URL; query/hash 유지 |
| 로그아웃·workspace/revision 변경 | 미완료 초안 폐기 | 재인증/새 의도에 따름 |
| 전체 새로고침·새 탭·Reset | 메모리 계정/세션/회사 초기화 | URL이 개인 초안을 복구하지 않음 |

현재 코드의 동작을 바꿀 필요는 없었다. 처음부터 두 정책 테스트는 통과했고 수정 후 전체 회귀에 포함했다. 로그아웃·새로고침 초안 초기화 및 느린 완료 취소는 기존 onboarding/company store 테스트를 재실행했다. Bonsai의 실제 서버 복구 정책은 미관찰이며 R02 전체 완료로 올리지 않는다.

## 4. 문서 정정

- G Goal 색인: G00/G01 외 미착수 설명을 G01~G15 관찰 범위 구현·검증/잔여 대기와 G16~G84 미착수로 정정.
- R 색인: R01/R02 소비 분석 수행과 R 전체 대기를 구분. R03~R22 미착수 유지.
- G05: 검색·이력·네트워크·실행 검사·결과 기록의 수행 체크를 실제 결과와 맞추고 미수록 본문/카탈로그/원본 동작을 별도 대기로 분리.
- G06: 실제 18상태 비교 수행 체크, 로컬 파일 수신·목 가입 후 복귀 완료와 미수록/계정 복제 대응/Office 검증 대기를 분리.
- G09: ‘정책 전체·개정 버전 확보’ 완료 표시를 해제. 관찰 발췌 구현과 전체/가입 적용 버전 미확보를 분리.
- G10: 가상 가입→G13 연결·목 검증 완료와 원본 소셜/메일 정책 미확인을 분리.
- 추가 같은 유형: G03 페이지1/이동과 미수록 page2, G04 미제공 Dialog와 실제 영상, G07 계산/인계와 PDF 수신 미관찰, G13 미수록 안내/무환산과 원본 설문 대기를 분리.
- G01~G15의 ‘원본과 같은 viewport’ 일괄 문구는 실제 결과에 맞게 정규화 비교 조건으로 정정. 원본 CSS viewport/DPR을 확인한 것으로 표시하지 않는다.
- FE README의 오래된 `/app`, `/login`, `/onboarding`, 블로그/템플릿 미구현 경로표와 현재 공통 상태 문서의 G10~G14 연결 대기를 정정. 과거 단계의 테스트 수·실패 기록은 지우지 않고 이번 결과 링크를 추가한다.
- G/R 명세·결과·실행 순서표·PLAN-INDEX·현재 상태를 이번 결과에 연결했다. 이전 `verification`/`final_regression` 수치는 역사 기록으로 유지하고 `audit_recheck`를 별도로 둔다.

## 5. 두 차례 검토

1차 검토: 실제 코드의 이벤트 수명, history state 전달, 부모/하위 폼 상태, 저장된 회사와 초안, G13 URL 소유권을 대조했다. 최초 red 실행에서 5결함(6실패)을 재현한 뒤 위 다섯 소스만 수정했다. G13은 정책 빈틈으로 분리했다.

수정 후 대상 8/8 통과: [대상 검증](evidence/g01-g15-recheck/target-verification.json). 이후 검토에서 국가 A→B→A 뒤 명시적 하위 선택, 저장 성공 공개 주소의 실제 진입, 수정 상태 캡처를 같은 8건에 보강하고 전체 회귀를 수행했다. 별도 테스트 건수를 늘리지 않았다.

2차 재검토: 수정 diff와 실제 화면(도움말 목차 포커스, Discard 후 활성 Save, 좁은 주소/통화, 미저장 slug, 온보딩 초안)을 직접 확인했다. SignupLink의 수정 키 경로는 가드 밖에 남아 있고 뒤로 재진입은 새 인스턴스로 처리한다. AddressEditor의 부모 callback은 두 사용처 모두 안정적인 state setter이며 unmount 시 잠금 해제가 전체 폼/모달을 일치시킨다. 부모 Country 동기화는 해당 필드만 바꿔 하위 주소/통화와 후속 명시 선택을 보존한다. savedSlug는 조회/저장 성공에서만 변경하며 실패/취소에서 갱신하지 않는다. 도움말은 hash replace와 관련 기사 복귀 state를 분리했다. 기존 지연/취소/로그아웃/범위 전환 검사를 포함한 전체 dev/build90개씩에서 회귀 결함을 발견하지 않았다. 문서의 미수록·시각·환경 대기는 별도 판정으로 유지했다.

## 6. 실행 명령과 현재 검증

실행 위치 `FE/user-web`. Node 요구 `>=24 <25`, pnpm `8.14.1`. 명령 전에 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0`을 적용했다. 기존 5173 서버(PID59363)는 종료/교체하지 않았으며 Backend를 실행하지 않았다. E2E는 별도 개발5175·빌드4175 서버다.

| 실제 명령 | 결과 |
| --- | --- |
| `corepack pnpm exec playwright test tests/e2e/audit-recheck.spec.ts --workers=1 --reporter=line,json` (수정 전) | 2통과/6실패. 기능 불일치 재현, 최초 기록 보존 |
| `corepack pnpm typecheck` | 통과 |
| `corepack pnpm lint` | 통과 |
| `corepack pnpm test` | 11파일42/42 통과 |
| `corepack pnpm build` | 통과. 기존 Browserslist 데이터 경고·835.76kB JS chunk 경고는 남음 |
| 같은 대상 Playwright 명령 (수정 후) | 8/8 통과; 요청22,916·외부/API0·실패0·console0 |
| `corepack pnpm exec playwright test --workers=1 --reporter=line,json` | 전체 개발90/90 첫 실행 통과, skip/flaky0 |
| `corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=1 --reporter=line,json` | 전체 빌드90/90 첫 실행 통과, skip/flaky0 |
| 최종 `corepack pnpm lint` | 캡처/검사 보강 후 통과 |
| `python3 /tmp/onehandsales-recheck-document-check.py` · `git diff --check` | 변경 문서 링크·색인·원본 배정·기존 대기/후속 미착수 보존·공백 검사 통과 |
| `node /tmp/onehandsales-recheck-preview.mjs` | 보존한5173: 도움말 목차 후 reload 출처 유지·Discard 수정·Reset/guest/normal 확인 |

이번 수정 후 전체 개발/빌드 첫 실행은 모두90/90이고 별도 실패 재실행은 없었다. 수정 전 red6건과 수정 후 대상8건을 최초 전체 통과로 합산하지 않는다. 이전 감사의 dev79/82 시간 초과와 단독3/3 재실행 기록도 이번 통과로 치환하지 않는다. 기존 42/82 통과 기록을 이번 결과로 대체 사용하지 않는다. 실제 navigation·doubleclick·Enter·수정 키 새 탭을 사용하며 요청 가로채기/차단 없이 관찰한다. 정적 GET과 개발 HMR은 인증·업무 API와 분리한다.

[문서 검증 상세](evidence/g01-g15-recheck/document-check.json)에 링크 검사와 상태 보존 결과를 기록했다. 시작/종료 HEAD는 `8f099e0d`로 같고 stage/커밋/push/배포는 하지 않았다.

### 네트워크·화면 증거

- [개발 전체](evidence/g01-g15-recheck/development-verification.json): 337,556 실제 요청, HMR 소켓191개. 외부/API·실패·console0.
- [빌드 전체](evidence/g01-g15-recheck/production-verification.json): 5,608 실제 요청, 소켓0개. 외부/API·실패·console0.
- [보존 미리보기5173](evidence/g01-g15-recheck/preview-5173-verification.json): 8,776 요청, 위반/실패/console0. 새 탭 컨텍스트에서 Reset 후 Guest/Normal과 랜딩 기본 상태를 확인했다. 사용자 탭·기존 서버를 종료하지 않았다.
- [화면 파일 모음](evidence/g01-g15-recheck/): 수정 전 실패6장, 개발/빌드 각8장의 수정 상태 캡처, 추가5173 캡처1장. 각 JSON cases의 screenshots가 실제 파일명이다. E2E 캡처는1440×900, 국가 검사는390×844이며 Playwright 실제 조작에 따른 스크롤이다. 원본 비교용 정렬/동일 scrollY 캡처가 아니다. 5173 캡처는 URL/viewport/scrollY도 기록했다.
- 이번 원본 비교 캡처는 N/A(시각 디자인 변경 없음). 기존 비교는 각 G 결과의 `evidence/gNN/comparisons/`와 G01 공통 요소 비교를 계속 참조하며 원본 미수록·잔여 시각을 해소하지 않았다.

## 7. Goal별 잔여 항목

아래는 이번 요청으로 자동 완료 처리하지 않은 범위다. 모든 Goal에 실제 OS IME·VoiceOver/보조기술·Safari/WebKit/Firefox·물리 기기 검증 대기가 공통으로 남는다. Chromium의 합성 composition/CSS 확대·viewport 검사를 대신 사용했다고 주장하지 않는다. 현재 Playwright 프로젝트는 Chromium만 구성되어 있고 WebKit/Firefox 엔진은 설치되어 있지 않다. 해당 엔진의 실행 환경을 별도로 준비해야 한다. 실제 한국어 OS 입력기·VoiceOver·물리 기기는 이번 자동화에서 조작하지 않았으며 해당 환경의 직접 검증이 필요하다.

| Goal | 남은 자료·시각·범위 |
| --- | --- |
| G01 | 원본 폰트/아이콘 동일성·공통 요소 시각 차이 |
| G02 | 17상태 잔여 시각·원본 모바일/자동 전환·캡처 조건 |
| G03 | 다른 소개 30개 본문·Small business 관련 글 2페이지·시각 차이 |
| G04 | 영상/자막·원본 재생 동작·과거 가격/실청구 정책 차이·시각 차이 |
| G05 | 전체 기사/추천 본문·카탈로그/정렬·원본 검색/모바일 동작·시각 차이 |
| G06 | 미수록 상세·앱 템플릿 대응·Office 실제 열기/계산/편집·시각 차이 |
| G07 | 원본 PDF 수신 종점·날짜 표시 환경 차이·전체 원본 동작 |
| G08 | 기사 전체/영상·원본 검색/언어/피드백 결과·시각 차이 |
| G09 | 정책 전체/개정·가입 적용 버전·보상표 관계·외부 신청 동작·시각 차이 |
| G10 | 원본 소셜/메일/중복 계정·가입 정책·시각 차이 |
| G11 | 원본 소셜/2FA/세션 만료 정책·시각 차이 |
| G12 | 원본 메일/토큰/비밀번호 정책·시각 차이 |
| G13 | 세 번째 설문/전체 선택지·원본 중단 복구/국가·통화 정책·시각 차이 |
| G14 | 원본 사이드바/404/저장 수명·아이콘/간격·G72 업무 대시보드(후속 범위) |
| G15 | 원본 로고 파일/제한/로딩·익명 공개 프로필 정책·주소 줄바꿈/폰트/아이콘 |

R01/R02는 소비 분석과 목 정책 보완만 수행한 상태다. 서버 후속 메모: 인증/계정 영속성, 초대/역할, 정책 적용 버전, 회사 공개 slug/공개 비활성, 국가·통화·주소 처리의 실제 정책은 이후 별도 설계에서 확인한다. 현재 API/DB 계약으로 확정하지 않았다.

## 8. 5173에서 따라 할 확인 순서

1. 새로고침으로 기본 목 상태에서 시작. `/` 헤더 Start free 더블클릭→가입→뒤로 한 번→랜딩. Enter로도 반복하고 Command+클릭 새 탭이 정상 열리는지 확인. Product→CRM에서도 반복.
2. `/help/collections/96965?q=portal`→Client Portal 기사→목차→관련 기사→Back to previous help page 두 번→같은 검색. `/support` 진입도 반복. 직접 기사 주소는 기본 `/help` 복귀.
3. `/login?returnTo=%2Fapp%2Fsettings%2Fcompany`→Continue as Alex. Add Address→Discard changes→회사명 변경→Save Changes. 주소 Cancel/Escape 후 재열기도 확인.
4. 주소 편집에서 주소와 USD 선택→바깥 Country Singapore→Save Address. 국가 Singapore·통화 USD 유지→Save Changes→대시보드/뒤로 재진입.
5. Profile URL 초안 변경→View Profile은 기존 저장 프로필. 돌아와 새 slug 저장 후 새 주소 확인. Company scenario `save-error`에서 실패 시 초안과 기존 링크 유지, 재시도 성공. `normal` 복원. Disabled 저장→공개 비활성 안내.
6. 새로고침 후 `/app/settings/company?from=recheck#details`→Sign Up→샘플 가입→업종/회사명→Pause. 브라우저 뒤로 복귀 후 완료하면 처음 회사 URL(query/hash 포함). 별도 새 실행에서 Pause→Go to dashboard→완료하면 `/app`. 초안은 유지된다.
7. 사용한 Company/Setup/Preview 도구를 Normal로 복원하거나 새로고침으로 초기화한다. 목 흐름 확인은 실제 서비스·계정·메일·API·출시 완료가 아니다.

## G06 현재 재검토 연결 — 2026-11-24 KST

[현재 범위·수정·검증·잔여](G06_RESULT.md#g06-r4-recheck). G06의3흐름21단계 주요 구성 대조, 동작 보완, 단위/DOM154·15파일 HTTP/구조 검증을 수행했다. 위 연속 작업/감사 기록은 당시 이력이다. 이번 실제 브라우저/픽셀 동일성은 대기이며 다음 Goal을 연속 실행하지 않는다.

<a id="g07-update"></a>
## G07 후속 재검토 연결 — 2026-11-24 KST

- [x] [현재 G07 원본 대조·복귀/격리 보완·166단위/DOM 검증](G07_RESULT.md#g07-r4-recheck)을 추가했다. 이 문서의 과거 실행/완료 체크·수치는 그대로 보존하며 이번 결과로 재사용하지 않는다.
- [ ] G07 엄격한 시각·실브라우저·미수록 원본과 다른 G/R 전체의 대기는 유지한다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] G08 전8단계 원본 대조·URL/언어/목차/문의 복귀·안내 이력/IME를 보완하고 현재 전체179개를 검증했다. 기존 연속 작업 결과는 당시 이력이다. 이번 작업은 G08와 직접 연결 소비만 포함한다. [상세 판정·근거](G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.

<a id="g09-update"></a>
## G09 적용·연결 검토 — 2026-11-24 KST

- [x] G09 원본11단계+연결5PNG·정책 발췌/출발 이력/가입취소를 보완하고 현재 전체188개 단위/DOM을 검증했다. 과거 전체 보관 HTML 확보 기록과 현재 파일 부재·가입 버전 미확보를 구분했다. 기존 연속 실행 결과는 당시 이력이다. [상세 판정·근거](G09_RESULT.md#g09-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G09 결과8절에 기록했다.

<a id="g10-update"></a>
## G10 적용·연결 검토 — 2026-11-24 KST

- [x] G10 원본10단계+연결3PNG·가입 오류/진행/복귀·첫 화면 표시 보완과 현재197개 단위/DOM을 검증했다. 과거 연속 실행 기록과 현재 결과를 분리하고 시각/브라우저/원본 정책 대기를 유지한다. [상세 판정·근거](G10_RESULT.md#g10-r4-recheck).

- [ ] 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 연결 G/R 전체 완료가 아니며 잔여 담당은 G10 결과8절에 기록했다.

<a id="g11-update"></a>
## G11 적용·연결 검토 — 2026-11-24 KST

- [x] G11 로그인5/로그아웃2 PNG·MCP 순서·현재 오류/취소/복귀/메뉴와 전체208 회귀를 확인했다. 과거 결과·G10 대기를 보존하고 실제 브라우저/시각/원본 정책을 완료로 승격하지 않는다. [상세 판정·근거](G11_RESULT.md#g11-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·원본 미수록 정책은 대기다. 연결 G/R 전체 완료가 아니며 후속 담당은 G11 결과8절을 따른다.

> G11 커밋 전 추가 검토: 공통/공유 로그아웃→빈 로그인·저장 회사명 일관성 보완, G11 14/전체211 통과. 과거208 기록과 다른 Goal 대기는 보존하며 로컬 커밋만 승인되었다. [최신 결과](G11_RESULT.md#g11-precommit-review).

<a id="g12-update"></a>
## G12 적용·연결 검토 — 2026-11-24 KST

- [x] G12 원본10PNG·MCP/4항목/공통12, 복구 오류·복귀·취소/링크/경합·색상 보완과 DOM9/store7·전체223 회귀를 수행했다. 과거 검증 이력과 시각/환경 대기를 보존했다. [상세 판정·근거](G12_RESULT.md#g12-r4-recheck).

- [ ] 원본 동일성·실제 브라우저/네트워크·미수록 정책은 대기다. 관련 G/R 전체 완료가 아니며 후속 담당은 G12 결과8절을 따른다.

> G12 커밋 전 추가 검토: 같은 경로에서 복귀 주소·이력/선택 문맥이 바뀌어도 이전 요청 안내·비밀번호 저장이 완료되는 두 결함을 재현하고 수정했다. G12 DOM11+store7=18/18, 전체225/225·타입/lint·메모리build 통과. 이전223 기록과 다른 Goal 대기는 보존하며 사용자 후속 요청으로 로컬 커밋만 승인되었다. [최신 결과](G12_RESULT.md#g12-precommit-review).
