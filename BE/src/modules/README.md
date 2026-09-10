# Backend Modules

현재 활성 Backend module은 로그인 사용자 기준의 핵심 영업 데이터와 지원 접수 기능에 집중한다.

| Module | 책임 |
| --- | --- |
| `auth` | OAuth token exchange, refresh session, logout, current user 인증 |
| `user` | 내 프로필, OAuth 계정, 로그인 기기/세션 관리 |
| `company` | 회사 CRUD, 옵션, 메모/비밀 메모, 딜 연결 조회, export |
| `contact` | 담당자 CRUD, 옵션, 메모/비밀 메모, 딜 연결 조회, export |
| `product` | 제품 CRUD, 옵션, 메모/비밀 메모, 딜 연결 조회, export |
| `deal` | 딜 CRUD, 회사/담당자/제품 연결, 다음 행동, 메모, 활동 로그, export |
| `search` | 회사/담당자/제품/딜 통합검색 |
| `trash` | 활성 도메인 soft delete row의 목록/상세/복구 |
| `analytics` | 제품 분석 이벤트와 activation/retention snapshot |
| `error-report` | User Web 오류 신고 접수 |
| `support-request` | User Web 지원 문의 접수 |
| `public-contact-request` | 로그인 전 공개 문의 접수 |
| `health` | 상태 확인 |

관리자 영역은 `GET /admin/api/me` 권한 확인만 유지한다.
