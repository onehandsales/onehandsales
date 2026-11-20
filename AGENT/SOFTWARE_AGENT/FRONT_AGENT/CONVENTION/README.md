# 웹 프론트엔드 컨벤션

User Web과 Admin Web의 코드 작성 규칙이다. 구조는 [아키텍처](../ARCHITECTURE/README.md), 완료 판정은 [리뷰](../ENGINEERING_REVIEW_CHECKLIST.md)를 따른다.

| 문서 | 적용 범위 |
| --- | --- |
| [User Web](FRONTEND_USER_WEB.md) | 이름·TypeScript·React·보안·성능 |
| [컴포넌트 설계](COMPONENT_DESIGN.md) | 책임·props·hook·공통화·의존 경계 |
| [웹 접근성·레이아웃](WEB_ACCESSIBILITY_AND_LAYOUT.md) | URL·키보드·포커스·반응형·스크롤·스타일 |
| [한글 주석·로깅](COMMENT_AND_LOGGING.md) | 컴포넌트별 책임 주석·흐름 주석·진단 정보 |
| [Admin Web](ADMIN_WEB.md) | 별도 앱·관리자 권한·관리자 API 경계 |

문서는 한글로 작성한다. 두 앱은 공통 웹 원칙을 따르되 서로의 업무 feature를 직접 import하지 않는다. 새 규칙은 [결정 005](../DECISIONS/005_web_mock_first_standard.md)에 따라 신규·수정 범위부터 적용한다.
