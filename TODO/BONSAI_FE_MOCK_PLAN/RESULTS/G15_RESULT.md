# G15 — 회사 정보·로고·공개 프로필 실행 결과

2026-11-21 KST. **관찰 범위 목 구현·두 차례 검토/추가 수정·현재 가능한 최종 회귀 수행; 원본/시각/환경 대기**. 사용자 지시에 따라 G05→G15 순서를 지켰다. 기존 HEAD `70ffefeb`와 G01~G14 구조를 보존했고 커밋·Backend·외부 API·G16 이후 개발은 하지 않았다.

## 근거와 확인 범위

- 이번 Gummble MCP 조회: Bonsai Web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 아래 3개 흐름 15단계. [MCP 응답](evidence/g15/mcp-sources.json), [PNG 경로·크기·SHA](evidence/g15/source-manifest.json), `source-sheet-1~5.png`에서 직접 시각 확인. 15단계에는 공통 이미지 2개가 중복된다.
- Adding company details `a346e78b-8075-4537-ae03-d377056d237a`: 01~08. 중앙 Company Details, 이름, 주소 확장·하위 Save, 요약, 로고, 전체 Save 뒤 체크리스트.
- Uploading company logo `29e9a0b7-4ba1-4970-9790-08e7d46bc38e`: 01~04. 선택 진입·빈 타일/제거 도구·베이지 썸네일. 빈 타일이 로딩이라는 해석은 확정하지 않았다. 파일 선택창·원본 파일·실제 업로드는 미수록.
- Disabling public profile `eb5394cb-70d0-4286-be72-3a6a0c240fd2`: 01~03. 설정의 Enabled→Disabled, slug·주소 유지, Save Changes 후 성공 안내. 익명 접근 결과는 미수록.
- 카탈로그 `Latest`, ID2146은 G05에서 확인한 카탈로그 식별자다. 이번 화면 응답이 별도 제품 빌드나 촬영 날짜를 증명하지 않는다. PNG2880×1800/MCP1440×900을 근거로 1440×900 비교 크기로 정규화했고 원본 CSS viewport/DPR은 미확인이다. 현재 사이트 디자인이나 현재 서버 정책을 소급하지 않았다.
- 각 흐름 ANALYSIS의 4·5·8절과 G15 명세를 대조했다. 별도 R은 없으며 R01/R02 전체 상태를 완료로 바꾸지 않는다.

## 구현·연결과 저장 경계

| 화면/경로 | 현재 범위 | 상태 수명 |
| --- | --- | --- |
| `/app` → Add Details | Company Details 모달, 이름·주소·실제 로컬 로고 파일 | 모달마다 저장된 같은 회사 조회. X/외부 클릭/Escape/이탈은 전체 초안 폐기 |
| 주소 확장 | Address1/2, City, Postal, Region, Country, Currency, Save Address/Cancel | 하위 초안을 분리. Save Address는 부모 초안에만 반영; Cancel/Escape는 하위만 폐기. 국가 변경으로 통화를 바꾸지 않음 |
| 전체 Save/Save Changes | 지연·실패·재시도·취소·중복·충돌 검증 | 성공 때만 같은 `company-${workspaceId}` 갱신. 실패/저장 취소는 입력 유지. 다른 계정/workspace나 오래된 회사 revision 저장은 거부 |
| `/app/settings/company` | 관찰된 Company Settings, 저장 상태·조회 오류·빈 상태·권한 | 진입/재진입은 저장값 조회. Discard는 저장값으로 복귀. 경로 이탈·뒤로/앞으로는 미저장 페이지 초안 폐기 |
| `/u/:slug` | 익명 접근 가능한 명시적 목 공개 화면 | 저장된 on/off만 소비. 비활성/없는 slug 안내를 분리. 비활성 회사의 이름/로고/국가는 반환하지 않음 |
| `/share/sample` | G01 읽기 전용 공유 표본 | 공개 프로필 off와 독립. 실제 고객 포털 전체 구현은 아님 |

- G13 `CompanyStore`를 확장했다. 가입 workspace/company ID·업종·사업 조건·초대 제안·목적을 유지하며 설정 저장은 인증 revision이나 권한을 변경하지 않는다. 새 가입→온보딩→보호된 회사 설정→이름 수정→대시보드의 같은 ID를 실제 navigation으로 검증한다.
- 로고는 실제 `File`을 디코딩한 뒤 메모리에 보관한다. 표시할 때만 object URL을 만들며 교체·제거·이탈 시 해제한다. 선택→읽기→미리보기→회사 저장은 각각 다른 상태다. 실패 파일은 재시도할 수 있고 빠른 교체/취소 뒤 늦은 디코딩은 반영하지 않는다. 서버 업로드·진행률·발송 성공을 만들지 않았다.
- 기존 파일의 수정 전에는 저장된 로고를 유지한다. 잘못된 형식/크기/디코딩 실패는 기존 회사 파일을 바꾸지 않는다. 선택 파일은 PNG/JPEG/WebP·2MB 이하라는 **목 제한**이며 Bonsai 원본 정책이 아니다.
- `tests/fixtures/recorded-company-logo.png`는 Adding details07 PNG의 썸네일 영역 `(1044,896)-(1204,1056)`을 추출한 비교용 파일이다. 원래 업로드 파일을 확보했다고 주장하지 않는다. UI 기본 로고/자동 업로드로 사용하지 않고 브라우저 파일 선택 시험과 캡처에서만 선택한다.
- 회사명 공백 시 가상 담당자 이름 사용은 설정의 안내를 적용했다. 입력 상한120, 주소240, slug1~60 소문자/숫자/하이픈·메모리 내 중복 검사, 국가4종/통화4종, owner 편집/member 읽기는 목 정책이다. 담당자는 현재 회사의 한 표본만 제공하며 역할/대표 변경 기능을 확정하지 않는다.
- 저장된 회사/로고/공개 여부는 같은 앱 실행에서 로그아웃·재로그인 후 유지한다. 미저장 초안·진행은 이탈·인증 범위 전환 때 폐기한다. 전체 새로고침/새 탭은 메모리 seed를 다시 만들고 신규 계정/회사를 제거한다. 따라서 익명 off 검증은 **동일 실행의 실제 로그아웃 후** 수행하며 새 탭의 서버 게시 상태로 해석하지 않는다.
- 현재 공유 소비 화면은 대시보드·설정·모달·목 공개 화면이다. 기존 계약/청구서의 당사자·발송 스냅샷은 아직 구현되지 않았으므로 갱신 범위를 확정하거나 G07 비로그인 생성기 초안을 회사 정보로 덮지 않았다.

## 공통 요소 영향

- Dialog는 선택적 className만 추가해 모달 시각을 조정했다. 네이티브 포커스/스크롤/외부 클릭 규칙을 재사용한다.
- 회사 저장 후 Add Details 버튼이 다음 안내로 교체되므로 모달 정리가 끝난 뒤 새 안내 제목으로 초점을 이동한다. 취소 때는 원래 버튼으로 복귀한다.
- G13 seed의 빈 초대 문자열 3개가 팀 완료 표시로 계산되던 부분을 빈 목록으로 정리했다. 실제 메일 발송/초대 승인을 만들어내지 않았다.
- G13에서 G14 인계로 남겼던 체험 안내 띠가 공통 셸 뒤에도 빠진 것을 G15 비교에서 확인해 대시보드에 추가했다. 원본의 고정 7일 문구·닫기·로컬 Upgrade 인계만 제공한다. 실제 날짜/구독 상태/권한은 바꾸지 않는다. 닫기 상태는 대시보드 페이지 수명이다.
- G13 체크리스트 폰트·버튼 크기를 원본에 맞춰 조정했다. 같은 흐름01 PNG의 잎 그림 `(2506,1000)-(2758,1308)`을 추출해 126×154로 표시한다. 예약 안내의 관찰 문구/달력 아이콘/Get Started를 재현하되 `/app/pending/booking` 인계로 제한한다. 팀 완료 여부·업무 데이터는 실제 목 상태를 유지한다.

## 1차 검토 → 수정

- 저장소/ID/role·scope·revision·파일 수명을 코드와 원본으로 대조했다. 단위 검증에 같은 ID·국가/통화·실패·중복·slug충돌·공개 off·취소·계정 전환·조회 분기를 보완했다.
- 초기 브라우저16개 중10개 통과. G14 테스트의 목적지 기대값이 과거 인계 화면에 머물러 실제 회사 화면으로 수정했다. 회사명 접근 이름에 보조 안내가 합쳐져 정확한 이름 조회가 실패한 문제는 입력 이름/설명 연결을 분리했다. 초기 개발 서버 재로드도 관찰해 로그인 전 자산 준비를 기다리게 했다.
- 캡처에서 숨긴 파일 input이 CSS `display:block`에 덮여 노출된 것을 수정했다. 공개 폰트 변수가 앱 영역에 정의되지 않아 입력이 label 굵기를 상속한 부분을 지역 변수로 지정했다. 주소 요약 위쪽 정렬과 모달 간격을 보정했다.
- 다음16개 중13개 통과. select의 실제 접근 역할과 테스트의 label 문자열 탐색 차이를 정리했고, `details open=""`을 false로 오인해 테스트가 도구를 닫던 전제를 수정했다. 유효 로고라고 넣은 작은 PNG 문자열이 브라우저에서 디코딩되지 않아 실제 확인된 썸네일 파일로 교체했다. 잘못된 파일 거부와 유효 파일 성공을 분리했다.

## 2차 재검토 → 추가 수정

- 원본/구현 캡처와 좁은 화면을 직접 대조했다. 로고 아래 추가 Change 문구가 원본보다 높이를 늘려 이미지 자체의 교체 버튼으로 정리했다. 좁은 화면의 URL 접두어/입력을 두 줄로 나눠 편집 폭을 확보했다.
- 빠른 재시도에서 실패 메시지를 즉시 지우면 Save 버튼이 이동해 두 번째 클릭이 모달 바깥으로 떨어지는 결함을 재현했다. 재시도 중 기존 오류 영역을 유지하고 성공/수정 시 정리한다. 중복 요청은 동기적인 요청 참조로 차단한다.
- 위 수정 뒤 실제 회사 저장은 성공했으나, 저장 후 제목 포커스가 모달 정리보다 먼저 실행되는 결함을 추가 확인했다. 부모의 닫힘 효과에서 모달 정리 이후 포커스를 이동한다. 취소/주소 Escape/짧은 모달 스크롤은 별도로 회귀한다.
- 5개 대상 검사4통과/1실패, 후속16개15통과/1실패 기록을 보존했다. 마지막 실패는 위 포커스 문제였다. 최종 관련/전체 결과는 아래에 갱신한다. 실패 테스트를 통과한 것으로 대체하지 않는다.

- 최종 전체 개발/빌드 첫 시행은 각각81/82였다. G03 테스트가 G14 이전 `Public` 링크 이름을 찾는 전제만 남아 있었다. 실제 앱 셸의 `Public site`를 클릭하도록 고쳤고 로그인/소개/스크롤/복귀/새로고침 검증은 유지했다. [개발 기록](evidence/g15/dev-before-final-review.json), [빌드 기록](evidence/g15/build-before-final-review.json).
- 캡처의 Country 포커스를 명시하고 details08은 사용자가 실제 예약 안내를 선택한 상태로 맞췄다. 팀 초대를 완료했다고 꾸미지 않았다. 원본 자동/수동 전환은 여전히 미확인이다. 최종 details01/08/05/profile01 좌우 비교에서 잎 그림·안내·포커스/배치 보정을 재확인했다.

## 실행·시각 비교

- FE/user-web에서 Node24.18.0, pnpm8.14.1로 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`를 실행했다. 최종 코드에서 타입/lint/build와 단위42/42(11파일), 전체 개발/빌드 Playwright 각각82/82를 통과했다.
- 관련 명령: `pnpm exec playwright test tests/e2e/company-settings.spec.ts tests/e2e/app-shell.spec.ts tests/e2e/onboarding.spec.ts --workers=2 --reporter=line,json`. 초기 시행은 기본4workers였고 후속은2workers. 빌드는 `-c playwright.preview.config.ts` 사용.
- `node scripts/capture-company-settings.mjs`, `/tmp/onehand-visual-venv/bin/python scripts/compare-company-settings.py`. [캡처 조건/네트워크](evidence/g15/browser-captures.json), [비교 수치](evidence/g15/visual-metrics.json), [좌우 비교·차이 이미지](evidence/g15/comparisons/). `details-01~08`, `logo-01~04`, `profile-01~03`; 320/390/768 및 모달 상하단·익명 on/off도 기록한다.
- 원본을1440×900으로 정규화해 Chromium DPR1 화면과 비교한다. 폰트는 기존 Gellix 자산을 사용하지만 내부 원본의 정확한 font metadata는 미확인이다. source의 회사명/주소를 캡처에서 입력하되 실제 계정 이름·slug·MYR초기값은 목값으로 분리한다. 사진 픽셀오차는 합격 기준이 아니다.
- 실제 브라우저 요청을 차단 없이 관찰한다. Blob URL 파일 표시와 개발 정적 모듈 요청은 API와 구분한다. 최종 검사에서 실제 API/외부 서비스 요청·실패 요청·console 오류는 각각0건이었다. 관찰 범위를 전체 서비스 보증으로 확대하지 않는다.

## 남은 차이·미검증·후속 메모

- 실제 원본 OS 파일 선택창/파일 내용·형식/용량·크롭·로딩/실패/취소·역할 범위·slug 충돌/재활성화·익명 off 화면·서버 저장 시점은 미확인이다. 관찰된 토스트를 서버 저장 증거로 사용하지 않는다.
- 추가국가/통화, 실제 국가별 검증, 통화 초기값 정책, 기존 문서 반영/완료 스냅샷, 실제 게시/고객 포털 권한은 후속 서버 메모다. 이 답을 기다리지 않고 로컬 화면을 구현했다.
- 모달 스크롤 방식, 모바일 재배치, 키보드/오류/취소, 샘플 신원·축소 원본 로고·메모리 설명은 목/접근성 가정이다. 원본에는 하위 Cancel이 없고 우리 화면에는 추가했다.
- 회사 설정과 모달의 원본 주소 문구가 다르다. 같은 회사 입력을 임의로 바꿔 캡처마다 일치시키지 않았다. 긴 주소는 입력 그대로 보존해 줄바꿈 차이가 남는다. 사이드바 아이콘·글꼴/일부 간격·헤더 계정/Upgrade 변형 차이도 남는다.
- OS 한글 IME·VoiceOver·실제 모바일/추가 브라우저는 환경 범위 밖이다. 합성 composition/문자 크기 확대·Chromium 검사를 그 검증으로 표현하지 않는다.

## 미리보기 확인 순서

1. http://127.0.0.1:5173/login → Continue as Alex → Add Details.
2. 주소 입력→Save Address→X→재진입 시 저장되지 않음 확인. 다시 입력하고 로고 선택→전체 Save→체크리스트 변화 확인.
3. 계정 메뉴 Settings→같은 회사·주소·로고 확인→이름 수정/저장→대시보드 Local setup summary 확인.
4. Public Profile Disabled 선택→저장 전 View Profile은 기존 공개값. 뒤로 돌아와 다시 Disabled→Save Changes→View Profile은 비활성 안내.
5. Company settings로 복귀→Logout→뒤로 가기에서 익명 비활성 안내→Shared preview는 별도 표시. 재로그인→Enabled 저장→기존 slug 복구.
6. Local company controls에서 save-error/read-error/slow/empty/denied/logo-error 확인. 변경/취소/재시도 후 normal로 복원. 전체 새로고침은 신규 계정/회사와 변경을 초기화한다.

G15 이후 전체 회귀와 문서 정리를 끝냈다. G16 이후는 시작하지 않는다.

## 최종 현재 검증 (2026-11-21 KST)

- 관련16/16 후 최종 코드 전체 개발82/82·빌드82/82, 건너뜀/재시도 통과 없이 각각 모두 통과. 타입/lint/build·unit42/42 통과. [최종 검증 요약](evidence/g15/final-verification.json), [개발](evidence/g15/dev-final-all.json), [빌드](evidence/g15/build-final-all.json).
- 전체 실행 명령: `PLAYWRIGHT_JSON_OUTPUT_FILE=../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g15/dev-final-all.json corepack pnpm exec playwright test --workers=2 --reporter=line,json`; 빌드는 파일명을 `build-final-all.json`으로 바꾸고 `-c playwright.preview.config.ts`를 추가했다. FE 디렉터리에서 fnm Node24.18.0 환경을 사용했다.
- 실제 관찰 요청: 개발 314649건, 빌드 5274건. 로컬 정적/파일·HMR과 API를 구분했으며 두 실행 모두 외부/API·실패·console 오류0. G15 캡처25장/1763요청도0. 가로채 차단하지 않았다.
- G01 표본·G02 메뉴/입력/좁은 화면·G03 소개·G04 가격/영상 미제공·G05~G09 공개 흐름·G10~G13 인증/복구/온보딩·G14 셸/공개 왕복·G15 같은 회사/파일/공개 off를 현재 코드로 회귀했다.
- G03 테스트의 이전 헤더 명칭은 실제 Public site 링크로 보정했다. 네트워크·실제 navigation·스크롤·로그아웃/새로고침 검증을 유지했다.
- 최종 캡처25장/원본15쌍에서 폼·주소·로고·공개 on/off·좁은 화면을 확인했다. 모달은 최대 화면 높이로 내부 스크롤하므로 원본 하단이 화면 밖으로 이어지는 방식과 다르다. Country의 키보드 초점 외곽선, 하위 Cancel, 긴 주소 보존·샘플 계정/slug·일부 아이콘/간격 차이는 남아 있다.
- Firefox/WebKit 실행 파일은 설치되지 않았다. OS IME/VoiceOver/실기기는 실행하지 못했다. 합성 이벤트와 CSS 확대는 이를 대체하지 않는다. 빌드의 큰 chunk835.23kB 및 오래된 Browserslist 경고는 남겼으며 기능 검증 실패는 아니다.
- [전체 결과](G05_G15_RESULT.md)와 [진행 기록](G05_G15_PROGRESS.md)에 선행 연결 해소/잔여를 반영했다. 정상 목 기본값이며 커밋/push/배포/Backend/실제 API/G16 이후 착수 없음.

### 공통 셸 최종 캡처 회귀

최종 코드에서 `CAPTURE_OUTPUT=.../evidence/g15/g14-regression node scripts/capture-app-shell.mjs` 및 같은 경로의 `compare-app-shell.py`를 실행했다. 12화면/원본5쌍, 3500요청·API/외부·오류0. 원본 사이드바 조건은 체험 띠를 UI에서 닫고 비교했으며 G14 과거 캡처는 보존했다. [최종 셸 캡처](evidence/g15/g14-regression/).

### G01~G15 감사 후 재점검 (2026-11-21)

전체 Discard 뒤 주소 잠금 해제, 최신 부모 국가 동기화, 저장된 공개 slug 이동의 세 결함을 수정했다. [이번 수정·검증·잔여 판정](G01_G15_RECHECK_RESULT.md)을 최신 기록으로 참조한다. 위 실행 수치는 과거 단계의 기록이며 이번 통과 수와 합산하지 않는다. 전체 Goal 완료로 승격하지 않는다.

## G16 공유 변경·회귀 추가 (2026-11-21 KST)

SettingsNavigation을 G16과 공유하고 같은 회사의 명시적 로고 저장을 연결했다. saveSettings를 G15 허용 필드로 제한해 오래된 Company 초안이 새 branding을 덮지 않게 했다. 주소 Discard·국가/통화·저장된 profile URL과 공개 off 회귀를 유지했다. [G16 결과](G16_RESULT.md): 이번 타입/lint/unit47/build, 전체 개발/빌드 Chromium96개씩 통과. 이후 G16에 한정한 시각 보정 대상6개씩도 통과했다. 기존 감사 결함 회귀를 포함하며 원본/시각/환경 대기를 자동 완료 처리하지 않았다. 이 문서의 이전 테스트 수/삭제된 evidence 링크는 과거 기록이고 이번 검증 자료는 `/tmp/onehandsales-g16`이다. 커밋·push·배포 없음.

### G17 공통 연결·회귀 (2026-11-21)

[G17 결과](G17_RESULT.md): Team 공급자와 실제 보호 route를 추가하고 Invite Team/계정 메뉴 Team/공통 설정 Team을 연결했다. 기존 회사/주소·국가/통화·저장된 공개 주소·브랜드 저장 코드는 유지하며 G13 초대 제안은 자동 Pending으로 바꾸지 않았다. 현재 전체 개발/빌드103개씩에서 기존96개 회귀와 G17 7개를 실행했다. 마지막 G17 전용 시각 보정 후 대상7개씩 추가 통과. 기존 원본·시각·환경·후속 소비 대기를 해소한 기록은 아니다.
