# Backend Modules

현재 활성 Backend module은 로그인 사용자 기준의 핵심 영업 데이터와 지원 접수 기능에 집중한다.

| Module | 책임 |
| --- | --- |
| `auth` | OAuth token exchange, refresh session, logout, current user 인증 |
| `user` | 내 프로필, OAuth 계정, 로그인 기기/세션 관리 |
| `error-report` | User Web 오류 신고 접수 |
| `support-request` | User Web 지원 문의 접수 |
| `public-contact-request` | 로그인 전 공개 문의 접수 |
| `health` | 상태 확인 |

`contact`, `product`, `deal`, `schedule` 폴더에는 현재 런타임 코드가 없고 과거/후속 범위 안내 문서만 남아 있다.

관리자 영역은 `GET /admin/api/me` 권한 확인만 유지한다.

고정형 `company`/`search` 모듈은 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM 도메인은 Workspace/Object/Attribute/Record/List/View 기반으로 새로 추가한다.
