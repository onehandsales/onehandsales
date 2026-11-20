# Front Agent — 웹 프론트엔드 개발 기준

기준 갱신: 2026-11-20 KST.

이 폴더는 User Web과 Admin Web의 React·TypeScript 웹 개발 규칙을 관리한다. 데스크톱의 업무 화면, 브라우저 내비게이션, 키보드·접근성, 모바일 브라우저 대응을 함께 다룬다.

## 1. 지금 적용할 방향

- 제품·UX 기준은 Bonsai다. [PM 036](../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), [UX 025](../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)를 먼저 읽는다.
- 신규 Bonsai 업무 화면은 **mock으로 전체 화면과 상호작용을 먼저 구현**한다. FE 검증과 공식 문서 대조 후 우리 DB/API 계약을 확정하여 연결한다.
- 컴포넌트 책임, 상태 소유권, 데이터 접근 경계를 분리한다. 목록·상세·편집의 mock 데이터도 일관되게 동작해야 한다.
- 새로 작성하거나 동작을 수정하는 컴포넌트·함수·hook은 **한글 책임 주석**을 작성한다.
- 현재 구현과 목표를 구분한다. 문서 개정은 기존 FE의 실제 API 연결 해제나 DB 변경을 의미하지 않는다.

적용 결정과 이전 규칙의 관계는 [결정 005](DECISIONS/005_web_mock_first_standard.md)를 따른다.

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

기존 User Web에는 Auth/Workspace와 범용 Object/List/View 기반 기능이 남아 있다. Admin Web은 별도 인증·관리자 권한 확인 앱이다. [현재 코드와 Bonsai 전환](ARCHITECTURE/CRM_CORE_FRONTEND.md)을 구분하여 작업한다.

새 규칙은 신규·수정 범위부터 적용한다. 기존 파일의 주석이나 폴더를 일괄 변경하려면 별도 작업 범위를 정한다. 파일 이동만으로 기능 완료를 보고하지 않는다.

화면 재현, mock 상호작용, 실제 API 저장, 운영 동작은 별도로 기록한다. 문서만 변경한 작업은 링크·규칙·소스 정합성을 검사하며 실행하지 않은 typecheck·E2E·브라우저 검증을 통과했다고 쓰지 않는다.
