# User Web 구조

G19 추가 기준. 기존 실제 인증·범용 CRM·SEO 생성 소스는 제거했고 Git 이력으로 확인한다. [G01 기반](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md)과 [G02 공개 웹](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md)와 [G03 소개](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G03_RESULT.md)의 실행 결과·검토·대기 항목을 구분한다.

## 책임과 의존

~~~text
main → app/providers + router + layouts
       → pages → feature 공개 export → hooks → data-source interface
                                  → 공통 UI       ↑
                       app에서 주입한 메모리 runtime
~~~

| 경로 | 책임 |
| --- | --- |
| app | runtime 생성, scope별 QueryClient, 실제 Router, 화면 경계 조합 |
| pages | route 해석·feature 조합·페이지 레이아웃 |
| features/public-web | 공개 메뉴·랜딩·로컬 목적지·이메일 인계. provider가 초안, hook이 메뉴, 각 섹션이 선택 상태를 소유 |
| features/public-introduction | 세 소개의 정적 본문/자산·FAQ·관련 글과 후속 목적지. public-web의 공개 export로 공통 폼/링크 사용 |
| features/public-commercial | 가격 두 주기·계산 의미·플랜 인계, 후기 콘텐츠·미제공 영상 Dialog·로컬 외부 목적지 |
| features/preview/components | 가상 세션·편집 폼·개발 도구 |
| features/preview/hooks | 조회·초안·변경 snapshot·취소·재시도 |
| features/preview/data·model | FE 내부 공급자 타입·scope·query key·표시 타입 |
| mocks | 단일 원본 store·고정 seed/clock·실패·지연·초기화 |
| components/ui | 업무 중립 Button·Field·Dialog·상태 표시 |
| styles | 원본 관찰값과 추정값을 구분한 공통 token |

공통 UI는 feature/page를 참조하지 않는다. feature UI는 seed나 구체 저장소를 선택하지 않는다. app/layouts는 feature와 공통 UI를 조합한다. 미래 기능용 빈 폴더·HTTP adapter·범용 저장소 framework는 만들지 않는다.

## 상태 수명

store가 저장값, Query가 조회 캐시, editor hook이 초안을 소유한다. scope는 actor/workspace/revision/memory 모드를 포함한다. scope 변경은 QueryClient·진행 작업·초안을 폐기하며 저장 직전에 다시 scope를 확인한다.

전체 새로고침은 메모리를 초기화한다. 같은 탭 재로그인은 저장값을 유지하고 화면 초안을 폐기한다. Reset은 seed와 세션·시각·장애까지 초기화한다. 읽기 결과는 복사본이며 실패 저장은 일부 값을 반영하지 않는다.

정상180ms·slow1500ms와 한 번 실패 후 재시도는 UX 검증을 위한 임시 정책이다. Bonsai 서버 정책이 아니다. 공개 공유 샘플은 내부 store와 별도이며 실제 공유 권한 규칙을 정의하지 않는다.

## 실행 경계와 검증

공개 /, 가상 인증 /login, 내부 /app, 외부 읽기 /share, 표본 /components를 실제 라우터로 분리했다. 주소를 보호한다는 것은 가상 UI 검증이며 보안 인증이 아니다.

실제 인증 provider·Supabase·HTTP client·API env 연결은 없다. 개발 서버는 정적 리소스와 HMR, production은 정적 리소스만 요청한다. 테스트에서 요청을 가로채어 미연결을 주장하지 않는다.

G02의 RouteFrame이 공개·기반 경계의 초점/스크롤을 조정한다. PublicLayout은 Gellix/CSS·공통 메뉴/푸터를 조합하고 PreviewFrame은 G01 개발 도구를 유지한다. PublicProvider의 메모리 이메일·CTA는 가상 scope revision에 따라 폐기한다. 공개 페이지에 업무 Query나 HTTP adapter를 도입하지 않았다. sourceHref와 local path/Goal은 목적지 색인에서 구분한다.

Vitest는 저장소 수명·scope·취소·경합을, Playwright는 실제 navigation·폼·실패·초점·네트워크를 검증한다. 자세한 명령과 현재 범위는 [README](README.md)에 기록한다.

## G03 공개 소개와 이력

`pages/introduction`은3소개 컴포넌트를 조합한다. `public-introduction` 내부 데이터는 정적인 시안 콘텐츠이며 업무 store나 API 계약이 아니다. 글/양식은 slug/ID로 G05/G06 인계 화면에 연결하며 실제 본문/파일 기능은 구현하지 않았다. 기존 공개 header/footer/font/Dialog를 재사용한다.

`PublicProvider`가 pathname별 이메일과 이력별 immutable 인계를 보유한다. 인계는 source/email/returnTo이고 history에는 임의 ID만 남긴다. 새 실행마다 memory ID를 바꿔 reload 이전 history와 충돌하지 않는다. 명시적 취소는 출발 경로의 초안/인계를 폐기하고 다른 경로의 초안은 유지한다. scope revision/reset/reload/new tab은 전체 공개 메모리를 폐기한다. 실제 세션 저장이나 API 요청이 아니다.

FAQ 열린 항목과 demo Dialog는 컴포넌트 수명이다. 관련 글 페이지는 query state이며 실제 Router ScrollRestoration을 사용한다. 원본 없는 page2는 미확인 경계다. PublicHeader의 dashboard 표시는 기존 PreviewProvider에서 사용자가 명시적으로 선택한 가상 세션만 반영한다. 스크롤·소개 경로 전환은 세션 변경 근거가 아니다.

## G04 가격·후기

`pages/pricing`·`pages/reviews`는 공개 레이아웃 아래 feature들을 조합한다. `public-commercial`의 정적 가격/후기는 관찰·보관 시안 데이터이며 서버 계약이 아니다. 순수 가격 선택 함수가 월간/연간 월 환산/계산 소계와 근거 버전을 구분한다. 가격 주기는 URL만 소유하며 같은 프레임 연속 선택에서도 최신 의도를 읽도록 Router 동기 반영을 사용한다.

기존 PublicProvider의 인계 snapshot에 선택 복사본을 추가했다. sourcePath는 이메일 초안/취소 소유권, returnTo는 query 포함 복귀 주소다. history에는 선택이나 이메일 대신 opaque ID만 남긴다. 새 CTA가 과거 이력의 선택을 덮지 않으며 G03 초기화 정책을 유지한다. 가상 세션 여부로 G10/G79 경계에 인계하지만 구독/역할은 변경하지 않는다.

후기 영상은 로컬 원본 파일이 없어 기존 공통 Dialog로 미제공을 표시한다. 재생 상태/진행률/외부 플레이어는 없다. 리뷰·작성자 외부 주소도 로컬 경계에 문자열로만 전달한다. G04 스타일은 `.public-commercial`에 한정한다. [G04 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G04_RESULT.md)에 두 차례 검토·새 검증·시각/환경 대기를 기록했다.


## G05 공개 콘텐츠

`pages/blog`은 목록/slug 상세를 조립하고 `features/public-content`의 공개 API를 사용한다. 정적 카탈로그는 기존 G03 메타데이터의 공개 export를 사용하며 중복 ID를 만들지 않는다. 조회 공급자는 `data/article-reader`, URL/조합/취소 조정은 hook, 읽는 위치는 별도 hook이다. 공개 라우트에만 QueryScope를 추가하여 내부·공유 캐시와 분리했다. URL에는 공개 검색/분류/페이지를, 이메일/가입 인계에는 기존 메모리 저장을 사용한다. 관찰된 기사와 미수록 본문 경계를 구분한다. G06 및 G10 이후 인계는 해당 소비 단계에서 검증한다.

## G06 공개 템플릿 추가 (2026-11-21)

`pages/templates`는 `features/public-template`의 카탈로그/상세/청구서 파일 안내를 조립한다. 공개 ID와 계정 복제본을 구분하고, 로컬 파일15개는 실제 다운로드·해시 검증을 수행했다. Google 문서는 로컬 Dialog만 사용한다. PublicProvider의 이력별 template snapshot은 기존 이메일·가격을 보존한다. ScrollRestoration 키는 경로+검색+history key이며 다른 직접 URL의 스크롤을 섞지 않는다. [G06 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G06_RESULT.md)에 검토·검증·남은 차이를 기록했다. unit15, 전체 dev/build38개 및 최종 G06 대상5개씩 통과했다. 가입 후 복귀는 G10~G14에서 종합 검증한다.

G07 `public-invoice`: model의 정수 금액 계산, Provider의 공개 초안 수명, hook의 취소 가능한 로컬 인계, components의 폼/테이블/인계 요약을 분리한다. PublicIntent.invoice는 독립 snapshot이며 실제 계정 Invoice/Client와 무관하다. G10~G14 인증 복귀는 현재 인계만 명시적으로 복원하고 scope reset을 해제하지 않는다.

G08 `public-help`는 별도 HelpLayout/QueryScope와 도움말 방문 수명의 HelpProvider를 사용한다. 검색 URL/로컬 reader, 피드백 취소 가능한 hook, 기사 표시, 외부 목적지 Dialog를 분리한다. `/support`만 공개 레이아웃을 사용하며 실제 문의 API/폼은 없다.

G09 `public-company`: 정적 회사 소개/정책 발췌/외부 안내를 분리한다. 외부 URL은 고정 목적지 메타데이터로만 표시하고 실제 이동하지 않는다. 공개 소셜 링크의 이력 state는 출발 경로/키만 포함한다. HelpHeader 검색 제출 revision은 늦은 URL 반영이 최신 입력을 덮지 못하게 한다.

### G10 가상 인증 경계

`features/mock-auth`: AuthStore의 메모리 계정·digest, 취소 가능한 로컬 지연, 가입 hook/입력 UI. `AppProviders`가 runtime/auth 수명을 조립한다. store.connect는 React 효과 수명에서 구독을 해제한다. 일반 session/workspace/revision 변경은 진행 인계/도전을 폐기하고 resetGeneration 변경은 계정 seed도 복원한다. 선택 intent만 새 actor/workspace/revision으로 복사하며 PublicProvider/InvoiceProvider의 reset 정책을 해제하지 않는다. RouteFrame은 실제 verify-email 이탈을 감지하고 StrictMode 효과 재연결을 이탈로 취급하지 않는다. G10 당시 후속이던 G13 목 온보딩과 G14 최종 목적지는 연결했다. 현재 Pause/재진입·새 이동 의도는 [목 상태 정책](../../TODO/BONSAI_FE_MOCK_PLAN/COMMON/MOCK-UI-STATE.md)을 따른다.

G11은 mock-auth 저장소의 같은 account/digest로 로그인한다. prepare의 generation/revision/AbortSignal을 commit 전에 검사한다. 2FA는 성공 전 세션을 열지 않고 도전 ID 교체/취소로 오래된 확인을 차단한다. 로그아웃 성공만 revision을 바꾸며 보호 경계는 안전한 pathname+search+hash를 로그인에 전달한다. 계정 메뉴의 후속 업무는 명시적 목 경계다.

G12 resetChallenge는 탭 메모리 ID/revision/status로 구분한다. request sequence가 최신 요청을 보존하고 reset commit은 같은 account digest만 바꾼다. resetCompleted는 빈 로그인 필드를 유지하며 공개 intent와 분리한다. route 이탈/Reset/scope 변경은 미사용 도전을 폐기한다.

G13 company-setup은 actor/workspace별 설문 초안과 workspace별 저장 회사의 수명을 분리한다. 마지막 제출에서만 같은 company ID를 저장하고 AuthStore.completeSetup은 인증 revision 없이 완료 상태만 갱신한다. ordinary logout은 저장 결과 유지/초안 폐기, Reset은 seed 복원이다. 제출 snapshot/generation/revision/AbortSignal로 중복/늦은 저장을 차단한다.

### G14 연결 갱신 (2026-11-21)

G14 WorkspaceBoundary는 가상 세션/설정 완료 진입, AppShell은 메뉴 수명, WorkspaceContentScope는 revision별 조회/초안 수명을 맡는다. PublicProvider.restore는 현재 범위로 승인된 선택만 새 이력 ID로 옮기고 InvoiceProvider.restore는 명시적 복원에서만 호출한다. authReturnQuery는 단계 사이 안전한 내부 복귀 경로를 유지한다. [결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G14_RESULT.md).

### G15 이후 최종 갱신 (2026-11-21)

G15 CompanyStore는 G13 같은 workspace/company와 settingsRevision을 유지한다. useCompanyEditor는 화면 초안·하위 주소 저장·전체 저장/취소, useCompanyLogo는 실제 로컬 파일 읽기/경합, useLogoUrl은 표시 URL 수명을 담당한다. publicCompany는 공개 필드만 반환하며 off는 이름/국가/로고를 내보내지 않는다. AppShell scope 변경은 편집 컴포넌트를 다시 만들고 계정 간 미저장 초안을 폐기한다. 메모리는 로그아웃과 전체 새로고침을 구분한다. [연속 작업 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_G15_RESULT.md).

## G16 문서 브랜드 기본값

`pages/branding-settings`는 설정 탐색/폼/미리보기를 조합한다. `features/document-branding`은 화면·초안 hook·지원 옵션 타입을 소유하고 기존 `company-setup` 메모리 저장소가 회사별 branding/brandingRevision을 소유한다. `SettingsNavigation`을 G15와 공유하고 로고 파일 decode/URL 수명도 기존 hook을 사용한다.

브랜드 저장은 브랜드 필드와 명시적 로고 변경만 최신 회사에 합친다. 로고 편집에만 회사 revision 충돌을 추가 검사한다. G15 회사 저장은 허용 회사 필드만 반영해 branding을 덮지 않는다. 입력/파일은 취소 가능한 화면 초안이고 Save 성공만 기준값을 바꾼다.

`snapshotDocumentBranding`은 저장값의 독립 복사이며 아직 실제 문서 생성 화면이 소비하지 않는다. 단위 fixture의 기존 문서 불변 검사와 후속 G36/G40/G55 이후 연결 대기를 구분한다. 자세한 수명/미확인 옵션/검증은 [G16 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G16_RESULT.md)를 따른다. 실제 API/HTTP adapter/DB 변경은 없다.

## G17 팀 초대·대기 제거

`app/providers`가 PreviewRuntime을 공유하는 TeamStore/Context를 조립한다. `features/team`의 model/data/hooks/components가 표시 타입·workspace 원본·query/변경 수명·표/메뉴/모달을 각각 소유한다. `pages/team-settings`는 route query와 화면 조합만 맡는다. G15/G16 회사 저장소 및 G13 초대 제안과 팀 멤버십을 합치지 않는다. 저장 전 scope/generation/Abort와 이메일 중복을 재검사하고 삭제는 안정 ID/이메일/revision으로 한정한다. [세부 수명](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G17_RESULT.md).

## G18/G19 목 경계

G18 초대는 기존 Team row ID와 workspace membership을 연결한다. G19 `features/clients`는 고객/연락처/태그의 단일 메모리 원본, Query 조회, 폼 초안·취소 hook과 UI를 분리한다. 운영 회사(G15)와 고객은 별도 ID다. `ClientCreateHost`는 URL query 수명의 Dialog이며 성공에만 같은 ID 상세로 실제 이동한다. G21 프로젝트는 이 공개 소비 경계를 사용해야 한다. G18 제한 접근·새로고침 초기화/로그아웃 후 저장 보존은 유지한다. 현재 결과/미검증은 [G19 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G19_RESULT.md)를 따른다.

## G20 필드·이미지 경계

고객 저장소의 workspace별 필드 정의와 고객별 값은 서로 다른 ID/revision을 갖는다. `ClientEdit`는 속성별 원자적 변경이며 이름/값/이미지를 통째 초안으로 덮지 않는다. 필드 삭제 tombstone은 늦은 추가/값 저장을 거부한다. 이미지 Blob은 메모리에만 저장하고 `useObjectUrl`은 표시 수명에 URL을 생성/해제한다. 업로드/HTTP adapter는 없다. [G20 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G20_RESULT.md)에 관찰/목 가정과 검증을 구분한다.
