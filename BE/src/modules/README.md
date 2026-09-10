# Backend Modules

현재 활성 Backend module은 로그인 사용자 기준의 핵심 영업 데이터와 지원 접수 기능에 집중한다.

| Module | 책임 |
| --- | --- |
| `auth` | OAuth token exchange, refresh session, logout, current user 인증 |
| `user` | 내 프로필, OAuth 계정, 로그인 기기/세션 관리 |
| `company` | 회사 CRUD, 회사 분야/지역 옵션, 메모/비밀 메모, soft delete, export |
| `search` | 회사 통합검색 |
| `trash` | 회사/회사 메모/회사 개인 비밀 메모 soft delete row의 목록/상세/복구 |
| `error-report` | User Web 오류 신고 접수 |
| `support-request` | User Web 지원 문의 접수 |
| `public-contact-request` | 로그인 전 공개 문의 접수 |
| `health` | 상태 확인 |

`contact`, `product`, `deal`, `schedule` 폴더에는 현재 런타임 코드가 없고 과거/후속 범위 안내 문서만 남아 있다.

관리자 영역은 `GET /admin/api/me` 권한 확인만 유지한다.
