# Front Agent — 웹 프론트엔드 개발 기준

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

User Web은 사용자 요청으로 전면 교체했다. 공개·가상 인증·내부·공유 경계, 메모리 저장소와 공통 UI만 구현했다. 실제 AuthProvider·Supabase·Object/List/View·API client·정적 SEO 생성기는 제거했다. [G01 결과](../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md)에 코드 검토와 브라우저 증거를 기록했다. 원본 폰트/아이콘 동일성은 대기이며 전체 Bonsai 구현 완료가 아니다. Admin은 이번 변경 대상이 아니다.

새 규칙은 신규·수정 범위부터 적용한다. 기존 파일의 주석이나 폴더를 일괄 변경하려면 별도 작업 범위를 정한다. 파일 이동만으로 기능 완료를 보고하지 않는다.

화면 재현, mock 상호작용, 실제 API 저장, 운영 동작은 별도로 기록한다. 문서만 변경한 작업은 링크·규칙·소스 정합성을 검사하며 실행하지 않은 typecheck·E2E·브라우저 검증을 통과했다고 쓰지 않는다.
