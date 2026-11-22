# Front Agent — 웹 프론트엔드 개발 기준

> 최신 FE 검증: G30 작업 템플릿 작성의 목 구현·누락 보완·두 차례 검토·12상태 비교를 수행했다. 단위97/97, 개발 영향48/49 후 수정 대상5/5, 빌드 전체156/157 후 최신 빌드 영향10/10 통과. 최초 실패와 수정 후 재실행을 구분한다. G31 적용·독립성 연결은 G30 커밋 이후 진행하며 자료·시각·환경 대기를 유지한다. [G30 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G30_RESULT.md). 이전 수치는 당시 기록이다.

기준 갱신: 2026-11-20 KST.

이 폴더는 User Web과 Admin Web의 React·TypeScript 웹 개발 규칙을 관리한다. 데스크톱의 업무 화면, 브라우저 내비게이션, 키보드·접근성, 모바일 브라우저 대응을 함께 다룬다.

## 1. 지금 적용할 방향

- 제품·UX 기준은 Bonsai다. [PM 036](../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), [UX 025](../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)를 먼저 읽는다.
- 현재는 **Bonsai UX/UI만 전체 재현하는 단계**다. Gummble 시안을 기준으로 폰트·크기·색상·배치·플로우를 따르며, 인증을 포함한 모든 실제 API 연결과 Backend·DB 설계는 진행하지 않는다. [결정 006](DECISIONS/006_bonsai_uxui_only_phase.md)을 우선 적용한다.
- 컴포넌트 책임, 상태 소유권, 데이터 접근 경계를 분리한다. 목록·상세·편집의 mock 데이터도 일관되게 동작해야 한다.
- 새로 작성하거나 동작을 수정하는 컴포넌트·함수·hook은 **한글 책임 주석**을 작성한다.
- 현재 구현과 목표를 구분한다. G01에서 User Web 기본 진입을 독립 목으로 교체했다. Backend·DB·Admin 변경은 없으며 전체 화면 구현과는 구분한다.

웹 구조·목·한글 주석의 기본 규칙은 [결정 005](DECISIONS/005_web_mock_first_standard.md), 현재 UX/UI 전용 범위와 API 미연결 기준은 [결정 006](DECISIONS/006_bonsai_uxui_only_phase.md)을 따른다.

## 2. 작업 전 읽는 순서

1. 이 문서와 [검토 기준](ENGINEERING_REVIEW_CHECKLIST.md)에서 변경 범위와 완료 조건을 정한다.
2. 대상 앱의 [User Web 구조](ARCHITECTURE/FRONTEND_USER_WEB.md) 또는 [Admin 구조](ARCHITECTURE/ADMIN_WEB.md)를 읽는다.
3. [컴포넌트](CONVENTION/COMPONENT_DESIGN.md), [상태·데이터](ARCHITECTURE/STATE_AND_DATA.md), [mock 경계](ARCHITECTURE/MOCK_FIRST_DEVELOPMENT.md)를 적용한다.
4. [웹 접근성·레이아웃](CONVENTION/WEB_ACCESSIBILITY_AND_LAYOUT.md), [한글 주석](CONVENTION/COMMENT_AND_LOGGING.md), 앱별 컨벤션을 적용한다.
5. [테스트 기준](ARCHITECTURE/TESTING.md)에서 실제 변경에 맞는 검증을 선택하고 결과·미실행 범위를 기록한다.

## 3. 문서별 책임

| 확인할 질문 | 정본 |
| --- | --- |
| 파일을 어디에 두고 무엇을 import하는가 | [User Web 구조](ARCHITECTURE/FRONTEND_USER_WEB.md) |
| 컴포넌트를 어디서 나누고 어떻게 확장하는가 | [컴포넌트 설계](CONVENTION/COMPONENT_DESIGN.md) |
| URL·폼·캐시·선택 상태는 누가 소유하는가 | [상태·데이터](ARCHITECTURE/STATE_AND_DATA.md) |
| BE 없이 어떻게 흐름을 만들고 나중에 연결하는가 | [Mock 개발](ARCHITECTURE/MOCK_FIRST_DEVELOPMENT.md) |
| 브라우저·접근성·반응형은 무엇을 확인하는가 | [웹 규칙](CONVENTION/WEB_ACCESSIBILITY_AND_LAYOUT.md) |
| TypeScript·보안·성능의 기본값은 무엇인가 | [User Web 규칙](CONVENTION/FRONTEND_USER_WEB.md) |
| 컴포넌트마다 어떤 한글 주석을 쓰는가 | [주석·로깅](CONVENTION/COMMENT_AND_LOGGING.md) |
| 관리자 앱만의 경계는 무엇인가 | [Admin 규칙](CONVENTION/ADMIN_WEB.md) |
| 무엇을 실행하고 어떤 증거를 남기는가 | [테스트](ARCHITECTURE/TESTING.md), [리뷰](ENGINEERING_REVIEW_CHECKLIST.md) |
| 배포와 데이터 모드를 어떻게 구분하는가 | [배포](ARCHITECTURE/DEPLOYMENT.md) |
| 규칙의 기술 근거와 현재 소스는 무엇인가 | [출처](REFERENCE_SOURCES.md) |

## 4. 현재 구현과 적용 방식

User Web은 사용자 요청으로 전면 교체했다. G01의 공개·가상 인증·내부·공유 경계, 메모리 저장소·공통 UI 위에 G02 랜딩·공통 메뉴와 G03 Small business·Consulting·CRM 소개를 구현했다. 실제 AuthProvider·Supabase·Object/List/View·API client·정적 SEO 생성기는 제거했다. [G01 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md)와 [G02 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md)에 현재 검토·브라우저 증거가 있다. 공개 웹 Gellix WOFF는 확인했지만 내부 앱 폰트/아이콘 및 G02 픽셀 동일성은 대기이며 전체 Bonsai 구현 완료가 아니다. [G03 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G03_RESULT.md)는 세 소개의 구현·검증과 미수록·시각·추가 환경 대기를 구분한다. [G04 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G04_RESULT.md)는 가격 두 주기·후기·로컬 인계 구현과 영상 재생·시각·환경 대기를 구분한다. G02/G03 잔여는 유지하며 실제 API/구독/결제 구현이 아니다. Admin은 이번 변경 대상이 아니다.

새 규칙은 신규·수정 범위부터 적용한다. 기존 파일의 주석이나 폴더를 일괄 변경하려면 별도 작업 범위를 정한다. 파일 이동만으로 기능 완료를 보고하지 않는다.

화면 재현, mock 상호작용, 실제 API 저장, 운영 동작은 별도로 기록한다. 문서만 변경한 작업은 링크·규칙·소스 정합성을 검사하며 실행하지 않은 typecheck·E2E·브라우저 검증을 통과했다고 쓰지 않는다.

연속 작업 G05~G10의 현재 구현/근거/검증과 미수록·시각·환경·후속 연결 대기는 [진행 기록](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_G15_PROGRESS.md)을 따른다. G10은 가상 가입과 선택 인계만 구현했고 실제 인증/API 연결이 아니다.

G11 목 로그인/로그아웃·소셜/2FA/보호 복귀의 현재 검증은 [결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G11_RESULT.md)에 기록했다. G13/G14와 원본/환경 대기는 유지한다.

G12 목 재설정/동일 계정 검증은 [결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G12_RESULT.md)에 기록했다. 실제 메일/토큰·원본/환경·G14 대기는 유지한다.

G13 목 회사 설정/같은 workspace 검증은 [결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G13_RESULT.md)에 기록했다. 미수록 설문/통화 정책·G14/G15·원본/환경 대기는 유지한다.

### G14 연결 갱신 (2026-11-21)

G14 목 앱 셸/404·공개 인증 왕복을 현재 검증했다. unit38·관련 dev/build41씩, 원본/시각/환경 대기 유지. G15 동일 회사 편집으로 이어간다. [결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G14_RESULT.md).

### G15 이후 최종 갱신 (2026-11-21)

G05~G15 관찰 범위 목 구현·두 차례 검토·수정과 현재 가능한 검증/문서화를 수행했다. 최종 unit42·전체 개발/빌드82씩, 외부/API0. G14 공개 인증 왕복·G15 동일 회사 편집을 확인했다. 원본·시각·환경/R 전체 대기 유지, G16 이후 미착수. 커밋/push/배포/Backend 없음. [연속 작업 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G05_G15_RESULT.md).
