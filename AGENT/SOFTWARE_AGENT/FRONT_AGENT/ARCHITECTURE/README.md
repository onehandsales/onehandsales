# 웹 프론트엔드 아키텍처

현재 소스의 설명과 앞으로 적용할 설계 기준을 구분한다. User Web과 Admin Web은 별도 앱이며, mock/live는 배포 환경과 구분한다.

| 문서 | 책임 |
| --- | --- |
| [User Web](FRONTEND_USER_WEB.md) | 현재 기술·권장 폴더·import 방향·route |
| [기존 CRM과 Bonsai 전환](CRM_CORE_FRONTEND.md) | 기존 계약·재사용·교체 경계 |
| [Mock 우선 개발](MOCK_FIRST_DEVELOPMENT.md) | 비동기 계약·fixture 공유·인증 경계·실제 연동 조건 |
| [상태·데이터](STATE_AND_DATA.md) | URL·폼·Query·경쟁 조건·표시 의미 |
| [Admin Web](ADMIN_WEB.md) | 별도 권한 확인 앱의 현재 구조 |
| [테스트](TESTING.md) | 변경별 검증·실제 명령·웹 시나리오·증거 |
| [배포](DEPLOYMENT.md) | local/production·도메인·release gate |

세부 코드 작성은 [컨벤션](../CONVENTION/README.md), 제품 방향과 적용 시점은 [결정](../DECISIONS/README.md)을 따른다.
