# API Sample

현재 활성 API 문서 범위는 인증/사용자, 지원 접수, 공개 문의, 관리자 권한 확인, health check다.

후속 CRM Core API는 아직 활성 API가 아니다. Workspace/Kit/Record API 후보는 `BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`에 draft로만 둔다.

## Auth / User

| API | 설명 |
| --- | --- |
| `GET /api/auth/providers` | 로그인에 사용할 OAuth 제공자 목록을 조회한다. |
| `POST /api/auth/exchange` | 외부 인증 토큰을 앱 access token과 refresh cookie로 교환한다. |
| `POST /api/auth/refresh` | refresh cookie로 앱 access token을 재발급한다. |
| `POST /api/auth/logout` | 현재 세션을 폐기한다. |
| `GET /api/me` | 현재 로그인 사용자를 조회한다. |
| `GET /api/users/me/profile` | 내 프로필과 연결 계정을 조회한다. |
| `PATCH /api/users/me/profile` | 내 프로필 기본값을 수정한다. |
| `GET /api/users/me/devices` | 내 로그인 기기를 조회한다. |

## Support / Public

| API | 설명 |
| --- | --- |
| `POST /api/error-reports` | 오류 신고를 접수한다. |
| `POST /api/support-requests` | 지원 문의를 접수한다. |
| `POST /api/public/contact-requests` | 공개 문의를 접수한다. |

공개 문의 body에는 문의자가 입력하는 회사명과 회사 규모가 포함된다. 이는 공개 문의 원문 필드이며 고정형 CRM 도메인 record가 아니다.

## Admin / Health

| API | 설명 |
| --- | --- |
| `GET /admin/api/me` | 관리자 access token의 권한을 확인한다. |
| `GET /api/health` | 서버 상태를 확인한다. |
