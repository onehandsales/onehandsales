# Backend Modules

현재 Backend는 OneHand CRM foundation과 Workspace·Object/List/View 기반의 modular monolith다. 아래에는 foundation 및 사이드바 순서 변경 관련 소유 모듈을 표시한다.

| Module | 책임 |
| --- | --- |
| `auth` | OAuth token exchange, refresh session, logout, current user 인증 |
| `user` | 내 프로필, OAuth 계정, 로그인 기기/세션 관리 |
| `error-report` | User Web 오류 신고 접수 |
| `support-request` | User Web 지원 문의 접수 |
| `public-contact-request` | 로그인 전 공개 문의 접수 |
| `health` | 상태 확인 |
| `workspace` | Workspace와 멤버십·Actor 접근 공개 포트 |
| `object-definition` | 관리 항목 생성·요약/사이드바 조회·Workspace 공통 순서 변경 |
| `list-definition` | 업무 목록 생성·요약/사이드바 조회·Workspace 공통 순서 변경 |
| `view-definition` | View 헤더·본문/설정 조회·개인 즐겨찾기 및 순서 변경 |

2026-11-11 사이드바 PATCH 3개는 각 소유 모듈의 presentation → application → repository port → infrastructure를 따른다. WorkspaceAccessQuery와 TransactionManager 공개 포트를 재사용하고, 다른 모듈 persistence를 직접 참조하지 않는다. 전체 ID 집합 검증·no-op·동시성·감사 필드·SQL migration 및 Frontend 계약은 [사이드바 순서 변경](../../../TODO/SIDEBAR_REORDER_PLAN/README.md)에 기록한다.

`schedule` 폴더에는 현재 런타임 코드가 없고 과거/후속 범위 안내 문서만 남아 있다. `security` 폴더는 소유권/권한 경계 테스트만 둔다.

관리자 영역은 `GET /admin/api/me` 권한 확인만 유지한다.

과거 고정형 `company`/`contact`/`product`/`deal`/`search` 모듈은 OneHand CRM 방향 전환에 맞춰 제거했다. 현재 CRM 도메인은 Workspace/Object/Attribute/Record/List/View 기반이며 Kit 등 후속 도메인은 별도 계약을 따른다.
